import { PageHeader } from "@/components/layout/page-header";

export default function FunnelPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Weekly funnel"
        description="Spend and funnel metrics by platform × country, one row per ISO week."
      />
      <div className="border-border bg-bg rounded-md border p-6">
        <p className="text-muted-foreground text-sm">Funnel CRUD wired in M4.</p>
      </div>
    </div>
  );
}
