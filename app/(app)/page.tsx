import { PageHeader } from "@/components/layout/page-header";
import { KpiTile } from "@/components/dashboard/kpi-tile";
import { CostPerSal1Chart } from "@/components/dashboard/cost-per-sal1-chart";
import { LeadsByCountryChart } from "@/components/dashboard/leads-by-country-chart";
import { TopBottomCampaigns } from "@/components/dashboard/top-bottom-campaigns";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { createClient } from "@/lib/supabase/server";
import { monthLabel } from "@/lib/utils/month";
import { format, startOfMonth } from "date-fns";
import {
  getMtdKpis,
  getCostPerSal1Series,
  getLeadsByCountrySeries,
  getTopBottomCampaigns,
  getRecentActivity,
} from "@/lib/utils/aggregations";

const formatUsd0 = (n: number) =>
  n.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });

const formatInt = (n: number) => n.toLocaleString("en-US");

export default async function OverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const monthISO = format(startOfMonth(new Date()), "yyyy-MM-01");

  const [kpis, costPerSal1, leadsByCountry, ranked, recent] = await Promise.all([
    getMtdKpis(supabase, user.id),
    getCostPerSal1Series(supabase, user.id, 12),
    getLeadsByCountrySeries(supabase, user.id, 12),
    getTopBottomCampaigns(supabase, user.id, 5),
    getRecentActivity(supabase, user.id),
  ]);

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <PageHeader
        title="Overview"
        description={`Month-to-date snapshot · ${monthLabel(monthISO)}`}
      />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiTile label="Spend" value={formatUsd0(kpis.spend)} />
        <KpiTile label="Leads" value={formatInt(kpis.leads)} />
        <KpiTile label="SAL1" value={formatInt(kpis.sal1)} />
        <KpiTile
          label="Cost / SAL1"
          value={kpis.cost_per_sal1 === null ? "—" : formatUsd0(kpis.cost_per_sal1)}
          subtext={kpis.cost_per_sal1 === null ? "no SAL1 yet this month" : undefined}
        />
        <KpiTile label="Clients won" value={formatInt(kpis.clients)} />
      </div>

      <div className="mb-6 grid gap-6 lg:grid-cols-2">
        <div className="border-border bg-bg rounded-md border p-5">
          <h3 className="text-foreground mb-1 text-sm">Cost per SAL1 — last 12 weeks</h3>
          <p className="text-muted-foreground mb-4 text-xs">By platform.</p>
          <CostPerSal1Chart weeks={costPerSal1.weeks} series={costPerSal1.series} />
        </div>
        <div className="border-border bg-bg rounded-md border p-5">
          <h3 className="text-foreground mb-1 text-sm">Leads — last 12 weeks</h3>
          <p className="text-muted-foreground mb-4 text-xs">Stacked by country.</p>
          <LeadsByCountryChart
            weeks={leadsByCountry.weeks}
            series={leadsByCountry.series}
          />
        </div>
      </div>

      <div className="mb-6">
        <TopBottomCampaigns top={ranked.top} bottom={ranked.bottom} />
      </div>

      <RecentActivity
        funnelEntries={recent.funnelEntries}
        campaignUploads={recent.campaignUploads}
      />
    </div>
  );
}
