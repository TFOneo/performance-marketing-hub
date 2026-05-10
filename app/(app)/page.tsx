import { PageHeader } from "@/components/layout/page-header";

export default function OverviewPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Overview"
        description="KPIs, trends, and top performers — wired in M10."
      />
      <div className="border-border bg-bg rounded-md border p-6">
        <p className="text-muted-foreground text-sm">
          This page will display month-to-date KPIs (spend, leads, SAL1, cost-per-SAL1, clients
          won), a 12-week cost-per-SAL1 trend by platform, weekly leads stacked by country, top/
          bottom-five campaigns by AI rating, and recent activity.
        </p>
      </div>
    </div>
  );
}
