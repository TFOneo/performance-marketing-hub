import { PageHeader } from "@/components/layout/page-header";

export default function CampaignsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Campaigns"
        description="Register campaigns, upload funnel snapshots, and track AI ratings."
      />
      <div className="border-border bg-bg rounded-md border p-6">
        <p className="text-muted-foreground text-sm">Campaigns CRUD wired in M5.</p>
      </div>
    </div>
  );
}
