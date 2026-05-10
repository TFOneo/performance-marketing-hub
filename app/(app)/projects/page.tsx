import { PageHeader } from "@/components/layout/page-header";

export default function ProjectsPage() {
  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Projects"
        description="Marketing initiatives — kanban view, markdown notes, linked campaigns."
      />
      <div className="border-border bg-bg rounded-md border p-6">
        <p className="text-muted-foreground text-sm">Projects wired in M7.</p>
      </div>
    </div>
  );
}
