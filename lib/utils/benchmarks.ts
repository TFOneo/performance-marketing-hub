import "server-only";
import { subWeeks, format } from "date-fns";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { Platform, Country } from "@/lib/schemas/enums";

export type Benchmark =
  | {
      status: "ok";
      weeks: number;
      cost_per_sal1: number | null;
      lead_volume_median: number;
      sql1_rate_median: number | null;
    }
  | { status: "insufficient_data"; weeks: number };

function median(values: number[]): number | null {
  if (values.length === 0) return null;
  const sorted = values.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  if (sorted.length % 2 === 1) return sorted[mid] ?? null;
  const lo = sorted[mid - 1];
  const hi = sorted[mid];
  if (lo === undefined || hi === undefined) return null;
  return (lo + hi) / 2;
}

export async function getRollingBenchmark(
  supabase: SupabaseClient<Database>,
  userId: string,
  platform: Platform,
  country: Country,
  asOfDate: Date = new Date(),
): Promise<Benchmark> {
  const since = format(subWeeks(asOfDate, 12), "yyyy-MM-dd");
  const upTo = format(asOfDate, "yyyy-MM-dd");

  const { data, error } = await supabase
    .from("weekly_funnel")
    .select("week_start, spend_usd, leads, sql1, sal1")
    .eq("user_id", userId)
    .eq("platform", platform)
    .eq("country", country)
    .gte("week_start", since)
    .lte("week_start", upTo)
    .order("week_start", { ascending: false });

  if (error || !data) {
    return { status: "insufficient_data", weeks: 0 };
  }

  const weeks = data.length;
  if (weeks < 4) {
    return { status: "insufficient_data", weeks };
  }

  let sumSpend = 0;
  let sumSal1 = 0;
  const leadVols: number[] = [];
  const sql1Rates: number[] = [];

  for (const row of data) {
    const spend = Math.max(0, Number(row.spend_usd));
    const leads = Math.max(0, row.leads);
    const sql1 = Math.max(0, row.sql1);
    const sal1 = Math.max(0, row.sal1);

    sumSpend += spend;
    sumSal1 += sal1;
    leadVols.push(leads);
    if (leads > 0) sql1Rates.push(sql1 / leads);
  }

  return {
    status: "ok",
    weeks,
    cost_per_sal1: sumSal1 > 0 ? sumSpend / sumSal1 : null,
    lead_volume_median: median(leadVols) ?? 0,
    sql1_rate_median: median(sql1Rates),
  };
}
