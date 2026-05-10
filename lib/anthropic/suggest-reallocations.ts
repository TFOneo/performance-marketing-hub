import "server-only";
import { revalidatePath } from "next/cache";
import { format, startOfMonth, subWeeks } from "date-fns";
import { createClient } from "@/lib/supabase/server";
import { callJson } from "@/lib/anthropic/client";
import {
  ReallocationResponseSchema,
  type ReallocationResponse,
} from "@/lib/anthropic/schemas";
import {
  REALLOCATION_SYSTEM_PROMPT,
  buildReallocationUserPrompt,
  type AggregatedPair,
  type BudgetPair,
} from "@/lib/anthropic/prompts/reallocation";
import {
  PLATFORMS,
  COUNTRIES,
  type Platform,
  type Country,
} from "@/lib/schemas/enums";

export type SuggestResult =
  | { ok: true; runId: string; moveCount: number }
  | { ok: false; error: string };

const LOOKBACK_WEEKS = 4;

export async function generateReallocations(): Promise<SuggestResult> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const today = new Date();
  const since = format(subWeeks(today, LOOKBACK_WEEKS), "yyyy-MM-dd");
  const monthISO = format(startOfMonth(today), "yyyy-MM-01");

  // Last 4 weeks of weekly_funnel rows
  const { data: rows, error: rowsErr } = await supabase
    .from("weekly_funnel")
    .select("platform, country, spend_usd, leads, sql1, sal1, week_start")
    .eq("user_id", user.id)
    .gte("week_start", since);

  if (rowsErr) return { ok: false, error: rowsErr.message };

  // Aggregate by platform x country
  const aggMap = new Map<string, AggregatedPair>();
  for (const p of PLATFORMS) {
    for (const c of COUNTRIES) {
      aggMap.set(`${p}|${c}`, {
        platform: p,
        country: c,
        spend_4w: 0,
        leads_4w: 0,
        sql1_4w: 0,
        sal1_4w: 0,
        cost_per_sal1: null,
        sql1_rate: null,
      });
    }
  }
  for (const r of rows ?? []) {
    const key = `${r.platform}|${r.country}`;
    const a = aggMap.get(key);
    if (!a) continue;
    a.spend_4w += Number(r.spend_usd);
    a.leads_4w += r.leads;
    a.sql1_4w += r.sql1;
    a.sal1_4w += r.sal1;
  }
  for (const a of aggMap.values()) {
    a.cost_per_sal1 = a.sal1_4w > 0 ? +(a.spend_4w / a.sal1_4w).toFixed(2) : null;
    a.sql1_rate = a.leads_4w > 0 ? +(a.sql1_4w / a.leads_4w).toFixed(4) : null;
  }
  const pairs = Array.from(aggMap.values()).filter((p) => p.spend_4w > 0);

  if (pairs.length < 2) {
    return {
      ok: false,
      error: "Not enough recent activity to recommend reallocations (need at least 2 active pairs).",
    };
  }

  // Current-month planned budgets + month-to-date actuals
  const { data: planned } = await supabase
    .from("budgets")
    .select("platform, country, planned_usd")
    .eq("user_id", user.id)
    .eq("month", monthISO);

  const { data: actuals } = await supabase
    .from("monthly_actuals")
    .select("platform, country, actual_usd")
    .eq("user_id", user.id)
    .eq("month", monthISO);

  const plannedMap = new Map<string, number>();
  for (const p of planned ?? []) {
    plannedMap.set(`${p.platform}|${p.country}`, Number(p.planned_usd));
  }
  const actualMap = new Map<string, number>();
  for (const a of actuals ?? []) {
    actualMap.set(`${a.platform}|${a.country}`, Number(a.actual_usd));
  }

  const budgets: BudgetPair[] = [];
  for (const p of PLATFORMS) {
    for (const c of COUNTRIES) {
      const key = `${p}|${c}`;
      const planned_usd = plannedMap.get(key) ?? 0;
      const actual_to_date_usd = actualMap.get(key) ?? 0;
      const remaining_monthly_budget = Math.max(0, planned_usd - actual_to_date_usd);
      if (planned_usd > 0 || actual_to_date_usd > 0) {
        budgets.push({
          platform: p,
          country: c,
          planned_usd,
          actual_to_date_usd,
          remaining_monthly_budget,
        });
      }
    }
  }

  const userPrompt = buildReallocationUserPrompt({
    month: monthISO,
    pairs,
    budgets,
  });

  const result = await callJson({
    system: REALLOCATION_SYSTEM_PROMPT,
    user: userPrompt,
    schema: ReallocationResponseSchema,
    maxTokens: 2500,
    label: "reallocation",
  });

  if (!result.ok) {
    console.warn(`[ai:reallocation] failed at stage=${result.stage}: ${result.error}`);
    return { ok: false, error: `AI suggestion failed (${result.stage}): ${result.error}` };
  }

  // Post-validate the 25% rule and that source pair has remaining budget.
  const budgetByPair = new Map(budgets.map((b) => [`${b.platform}|${b.country}`, b]));
  for (const move of result.data.moves) {
    const fromKey = `${move.from.platform}|${move.from.country}`;
    const sourceBudget = budgetByPair.get(fromKey);
    if (!sourceBudget) {
      return {
        ok: false,
        error: `AI suggested a move from ${fromKey} but no budget exists for that pair.`,
      };
    }
    const max = sourceBudget.remaining_monthly_budget * 0.25;
    if (move.shift_usd > max + 0.01) {
      return {
        ok: false,
        error: `AI suggested ${move.shift_usd} from ${fromKey} but the 25% cap is ${max.toFixed(2)}.`,
      };
    }
  }

  // Persist the run
  const { data: run, error: insertErr } = await supabase
    .from("reallocation_runs")
    .insert({
      user_id: user.id,
      lookback_weeks: LOOKBACK_WEEKS,
      payload: result.data as unknown as ReallocationResponse,
    })
    .select("id")
    .single();

  if (insertErr || !run) {
    return { ok: false, error: insertErr?.message ?? "Could not save run" };
  }

  revalidatePath("/budget");
  revalidatePath("/budget/reallocations");
  return { ok: true, runId: run.id, moveCount: result.data.moves.length };
}
