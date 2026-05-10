import Link from "next/link";
import { PageHeader } from "@/components/layout/page-header";
import { BudgetGrid } from "@/components/budget/budget-grid";
import { ReallocationPanel, type RealRun } from "@/components/budget/reallocation-panel";
import { createClient } from "@/lib/supabase/server";
import { currentMonthISO, monthLabel, toMonthFirstISO } from "@/lib/utils/month";
import {
  PLATFORMS,
  COUNTRIES,
  type Platform,
  type Country,
} from "@/lib/schemas/enums";

interface BudgetPageProps {
  searchParams: Promise<{ month?: string }>;
}

export default async function BudgetPage({ searchParams }: BudgetPageProps) {
  const { month: monthParam } = await searchParams;
  const monthISO = monthParam ? toMonthFirstISO(monthParam) : currentMonthISO();

  const supabase = await createClient();

  const [{ data: planned }, { data: actuals }, { data: latestRun }] = await Promise.all([
    supabase
      .from("budgets")
      .select("month, platform, country, planned_usd")
      .eq("month", monthISO),
    supabase
      .from("monthly_actuals")
      .select("month, platform, country, actual_usd")
      .eq("month", monthISO),
    supabase
      .from("reallocation_runs")
      .select("id, generated_at, lookback_weeks, status, applied_move_index, payload")
      .order("generated_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  type Cell = { planned: number; actual: number };
  const cells = {} as Record<Platform, Record<Country, Cell>>;
  for (const p of PLATFORMS) {
    cells[p] = {} as Record<Country, Cell>;
    for (const c of COUNTRIES) {
      cells[p][c] = { planned: 0, actual: 0 };
    }
  }
  for (const r of planned ?? []) {
    cells[r.platform as Platform][r.country as Country].planned = Number(r.planned_usd);
  }
  for (const r of actuals ?? []) {
    cells[r.platform as Platform][r.country as Country].actual = Number(r.actual_usd);
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title={`Budget · ${monthLabel(monthISO)}`}
        description="Set planned spend per platform × country. Actuals come from weekly_funnel."
        actions={
          <Link
            href="/budget/reallocations"
            className="text-muted-foreground hover:text-foreground text-sm"
          >
            Past suggestions →
          </Link>
        }
      />

      <div className="space-y-6">
        <BudgetGrid monthISO={monthISO} cells={cells} />
        <ReallocationPanel
          latestRun={latestRun ? (latestRun as unknown as RealRun) : null}
        />
      </div>
    </div>
  );
}
