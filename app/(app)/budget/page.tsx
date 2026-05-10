import { PageHeader } from "@/components/layout/page-header";

export default function BudgetPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Budget"
        description="Monthly planned vs actual by platform × country, with AI reallocation suggestions."
      />
      <div className="border-border bg-bg rounded-md border p-6">
        <p className="text-muted-foreground text-sm">Budget grid wired in M8 and M9.</p>
      </div>
    </div>
  );
}
