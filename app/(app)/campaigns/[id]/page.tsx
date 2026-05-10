import { notFound } from "next/navigation";
import Link from "next/link";
import { format, parseISO } from "date-fns";
import { ArrowLeftIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { CampaignSnapshotForm } from "@/components/forms/campaign-snapshot-form";
import {
  CampaignSnapshotsTable,
  type CampaignSnapshotRow,
} from "@/components/tables/campaign-snapshots-table";
import { CampaignTrend } from "@/components/charts/campaign-trend";
import { createClient } from "@/lib/supabase/server";
import {
  PLATFORM_LABELS,
  COUNTRY_LABELS,
  type Platform,
  type Country,
  type CampaignStatus,
  type RatingBand,
} from "@/lib/schemas/enums";

const STATUS_LABELS: Record<CampaignStatus, string> = {
  active: "Active",
  paused: "Paused",
  ended: "Ended",
};

interface CampaignDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignDetailPage({ params }: CampaignDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: campaign } = await supabase
    .from("campaigns")
    .select(
      "id, name, platform, country, status, start_date, end_date, total_budget_usd, notes",
    )
    .eq("id", id)
    .maybeSingle();

  if (!campaign) notFound();

  const { data: snapshots } = await supabase
    .from("campaign_funnel_entries")
    .select(
      "id, period_start, period_end, spend_usd, leads, sql1, sql2, sal1, sal2, client, ai_rating_score, ai_rating_band, ai_rating_rationale, ai_recommendations, ai_rated_at",
    )
    .eq("campaign_id", id)
    .order("period_end", { ascending: false });

  const rows: CampaignSnapshotRow[] = (snapshots ?? []).map((s) => ({
    id: s.id,
    period_start: s.period_start,
    period_end: s.period_end,
    spend_usd: Number(s.spend_usd),
    leads: s.leads,
    sql1: s.sql1,
    sal1: s.sal1,
    client: s.client,
    ai_rating_score: s.ai_rating_score,
    ai_rating_band: (s.ai_rating_band as RatingBand | null) ?? null,
    ai_rating_rationale: s.ai_rating_rationale,
    ai_recommendations: Array.isArray(s.ai_recommendations)
      ? (s.ai_recommendations as string[])
      : null,
    ai_rated_at: s.ai_rated_at,
  }));

  const trendPoints = rows.map((r) => ({
    period_end: r.period_end,
    spend_usd: r.spend_usd,
    sal1: r.sal1,
  }));

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <Link
        href="/campaigns"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeftIcon className="size-3.5" />
        All campaigns
      </Link>

      <div className="border-border bg-bg mb-6 rounded-md border p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl">{campaign.name}</h1>
            <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-sm">
              <span>{PLATFORM_LABELS[campaign.platform as Platform]}</span>
              <span>·</span>
              <span>{COUNTRY_LABELS[campaign.country as Country]}</span>
              <span>·</span>
              <Badge variant={campaign.status === "active" ? "default" : "outline"}>
                {STATUS_LABELS[campaign.status as CampaignStatus]}
              </Badge>
              {campaign.start_date && (
                <>
                  <span>·</span>
                  <span>
                    {format(parseISO(campaign.start_date), "d MMM yyyy")}
                    {campaign.end_date
                      ? ` — ${format(parseISO(campaign.end_date), "d MMM yyyy")}`
                      : " — ongoing"}
                  </span>
                </>
              )}
              {campaign.total_budget_usd !== null &&
                campaign.total_budget_usd !== undefined && (
                  <>
                    <span>·</span>
                    <span className="tabular-nums">
                      Budget {Number(campaign.total_budget_usd).toLocaleString("en-US", {
                        style: "currency",
                        currency: "USD",
                        minimumFractionDigits: 0,
                      })}
                    </span>
                  </>
                )}
            </div>
            {campaign.notes && (
              <p className="text-muted-foreground mt-4 max-w-2xl text-sm">{campaign.notes}</p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="border-border bg-bg rounded-md border p-6">
          <h2 className="mb-4 text-lg">Upload funnel snapshot</h2>
          <CampaignSnapshotForm campaignId={campaign.id} />
        </div>
        <div className="border-border bg-bg rounded-md border p-6">
          <h2 className="mb-4 text-lg">Trend</h2>
          <CampaignTrend points={trendPoints} />
        </div>
      </div>

      <h2 className="mb-4 text-lg">Snapshots</h2>
      <CampaignSnapshotsTable rows={rows} campaignId={campaign.id} />
    </div>
  );
}
