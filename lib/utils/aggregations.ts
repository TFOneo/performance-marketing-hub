import "server-only";
import { format, startOfMonth, subWeeks, parseISO } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { COUNTRIES, PLATFORMS, type Country, type Platform } from "@/lib/schemas/enums";
import { weekRangeISO } from "@/lib/utils/week";

export interface MtdKpis {
  spend: number;
  leads: number;
  sal1: number;
  cost_per_sal1: number | null;
  clients: number;
}

export async function getMtdKpis(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<MtdKpis> {
  const monthStart = format(startOfMonth(new Date()), "yyyy-MM-dd");
  const { data } = await supabase
    .from("weekly_funnel")
    .select("spend_usd, leads, sal1, client")
    .eq("user_id", userId)
    .gte("week_start", monthStart);

  let spend = 0;
  let leads = 0;
  let sal1 = 0;
  let clients = 0;
  for (const r of data ?? []) {
    spend += Number(r.spend_usd);
    leads += r.leads;
    sal1 += r.sal1;
    clients += r.client;
  }
  return {
    spend,
    leads,
    sal1,
    cost_per_sal1: sal1 > 0 ? spend / sal1 : null,
    clients,
  };
}

export interface CostPerSal1Series {
  weeks: string[];
  series: { platform: Platform; values: (number | null)[] }[];
}

export async function getCostPerSal1Series(
  supabase: SupabaseClient<Database>,
  userId: string,
  weeks = 12,
): Promise<CostPerSal1Series> {
  const since = format(subWeeks(new Date(), weeks - 1), "yyyy-MM-dd");
  const { data } = await supabase
    .from("weekly_funnel")
    .select("week_start, platform, spend_usd, sal1")
    .eq("user_id", userId)
    .gte("week_start", since);

  const weekList = weekRangeISO(weeks);
  const buckets = new Map<string, { spend: number; sal1: number }>();
  for (const r of data ?? []) {
    const key = `${r.week_start}|${r.platform}`;
    const cur = buckets.get(key) ?? { spend: 0, sal1: 0 };
    cur.spend += Number(r.spend_usd);
    cur.sal1 += r.sal1;
    buckets.set(key, cur);
  }

  const series = PLATFORMS.map((platform) => ({
    platform,
    values: weekList.map((w) => {
      const b = buckets.get(`${w}|${platform}`);
      if (!b || b.sal1 === 0) return null;
      return +(b.spend / b.sal1).toFixed(2);
    }),
  }));

  return { weeks: weekList, series };
}

export interface LeadsByCountrySeries {
  weeks: string[];
  series: { country: Country; values: number[] }[];
}

export async function getLeadsByCountrySeries(
  supabase: SupabaseClient<Database>,
  userId: string,
  weeks = 12,
): Promise<LeadsByCountrySeries> {
  const since = format(subWeeks(new Date(), weeks - 1), "yyyy-MM-dd");
  const { data } = await supabase
    .from("weekly_funnel")
    .select("week_start, country, leads")
    .eq("user_id", userId)
    .gte("week_start", since);

  const weekList = weekRangeISO(weeks);
  const buckets = new Map<string, number>();
  for (const r of data ?? []) {
    const key = `${r.week_start}|${r.country}`;
    buckets.set(key, (buckets.get(key) ?? 0) + r.leads);
  }

  const series = COUNTRIES.map((country) => ({
    country,
    values: weekList.map((w) => buckets.get(`${w}|${country}`) ?? 0),
  }));

  return { weeks: weekList, series };
}

export interface RankedCampaign {
  id: string;
  name: string;
  platform: Platform;
  country: Country;
  score: number;
  band: string | null;
  rated_at: string;
}

export async function getTopBottomCampaigns(
  supabase: SupabaseClient<Database>,
  userId: string,
  limit = 5,
): Promise<{ top: RankedCampaign[]; bottom: RankedCampaign[] }> {
  // Fetch the most recent rated entry per campaign by joining the campaigns + entries.
  // Cheaper than a window function: we know the dataset is small.
  const { data: entries } = await supabase
    .from("campaign_funnel_entries")
    .select(
      "campaign_id, ai_rating_score, ai_rating_band, ai_rated_at, period_end, created_at",
    )
    .eq("user_id", userId)
    .not("ai_rating_score", "is", null)
    .order("created_at", { ascending: false });

  const latestByCampaign = new Map<string, { score: number; band: string | null; rated_at: string }>();
  for (const e of entries ?? []) {
    if (e.ai_rating_score === null) continue;
    if (!latestByCampaign.has(e.campaign_id)) {
      latestByCampaign.set(e.campaign_id, {
        score: e.ai_rating_score,
        band: e.ai_rating_band,
        rated_at: e.ai_rated_at ?? e.created_at,
      });
    }
  }

  const ids = Array.from(latestByCampaign.keys());
  if (ids.length === 0) return { top: [], bottom: [] };

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, platform, country")
    .in("id", ids);

  const ranked: RankedCampaign[] = (campaigns ?? []).map((c) => {
    const r = latestByCampaign.get(c.id);
    return {
      id: c.id,
      name: c.name,
      platform: c.platform as Platform,
      country: c.country as Country,
      score: r?.score ?? 0,
      band: r?.band ?? null,
      rated_at: r?.rated_at ?? "",
    };
  });

  const top = ranked.slice().sort((a, b) => b.score - a.score).slice(0, limit);
  const bottom = ranked.slice().sort((a, b) => a.score - b.score).slice(0, limit);
  return { top, bottom };
}

export interface RecentActivity {
  funnelEntries: {
    id: string;
    week_start: string;
    platform: Platform;
    country: Country;
    spend_usd: number;
    leads: number;
    sal1: number;
    created_at: string;
  }[];
  campaignUploads: {
    snapshot_id: string;
    campaign_id: string;
    campaign_name: string;
    period_end: string;
    score: number | null;
    created_at: string;
  }[];
}

export async function getRecentActivity(
  supabase: SupabaseClient<Database>,
  userId: string,
): Promise<RecentActivity> {
  const [{ data: entries }, { data: snapshots }] = await Promise.all([
    supabase
      .from("weekly_funnel")
      .select("id, week_start, platform, country, spend_usd, leads, sal1, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("campaign_funnel_entries")
      .select("id, campaign_id, period_end, ai_rating_score, created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(3),
  ]);

  const campaignIds = (snapshots ?? []).map((s) => s.campaign_id);
  const { data: campaigns } =
    campaignIds.length > 0
      ? await supabase.from("campaigns").select("id, name").in("id", campaignIds)
      : { data: [] };
  const nameById = new Map((campaigns ?? []).map((c) => [c.id, c.name]));

  return {
    funnelEntries: (entries ?? []).map((e) => ({
      id: e.id,
      week_start: e.week_start,
      platform: e.platform as Platform,
      country: e.country as Country,
      spend_usd: Number(e.spend_usd),
      leads: e.leads,
      sal1: e.sal1,
      created_at: e.created_at,
    })),
    campaignUploads: (snapshots ?? []).map((s) => ({
      snapshot_id: s.id,
      campaign_id: s.campaign_id,
      campaign_name: nameById.get(s.campaign_id) ?? "Unknown campaign",
      period_end: s.period_end,
      score: s.ai_rating_score,
      created_at: s.created_at,
    })),
  };
}

export function formatWeekShort(iso: string): string {
  return format(parseISO(iso), "d MMM");
}
