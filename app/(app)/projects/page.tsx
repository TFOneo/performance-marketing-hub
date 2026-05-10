import { PageHeader } from "@/components/layout/page-header";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NewProjectDialog } from "@/components/forms/project-form";
import { KanbanBoard, type KanbanProject } from "@/components/projects/kanban-board";
import { ProjectList } from "@/components/projects/project-list";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus } from "@/lib/schemas/enums";

export default async function ProjectsPage() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .select(
      "id, title, owner, status, progress_pct, due_date, linked_campaign_ids, created_at",
    )
    .order("created_at", { ascending: false });

  const projects: KanbanProject[] = (data ?? []).map((p) => ({
    id: p.id,
    title: p.title,
    owner: p.owner,
    status: p.status as ProjectStatus,
    progress_pct: p.progress_pct,
    due_date: p.due_date,
    linked_campaign_ids: p.linked_campaign_ids,
  }));

  return (
    <div className="mx-auto max-w-7xl px-6 py-10">
      <PageHeader
        title="Projects"
        description="Marketing initiatives — kanban view, markdown notes, linked campaigns."
        actions={<NewProjectDialog />}
      />

      {error && (
        <p className="text-destructive mb-4 text-sm">
          Could not load projects: {error.message}
        </p>
      )}

      <Tabs defaultValue="kanban" className="space-y-6">
        <TabsList>
          <TabsTrigger value="kanban">Kanban</TabsTrigger>
          <TabsTrigger value="list">List</TabsTrigger>
        </TabsList>
        <TabsContent value="kanban">
          <KanbanBoard projects={projects} />
        </TabsContent>
        <TabsContent value="list">
          <ProjectList rows={projects} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
