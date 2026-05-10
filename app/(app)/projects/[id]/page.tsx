import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";
import { ProjectDetailForm } from "@/components/projects/project-detail-form";
import { createClient } from "@/lib/supabase/server";
import type { ProjectStatus, Platform, Country } from "@/lib/schemas/enums";

interface ProjectDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: project } = await supabase
    .from("projects")
    .select(
      "id, title, owner, status, progress_pct, due_date, notes_markdown, linked_campaign_ids",
    )
    .eq("id", id)
    .maybeSingle();

  if (!project) notFound();

  const { data: campaigns } = await supabase
    .from("campaigns")
    .select("id, name, platform, country")
    .order("created_at", { ascending: false });

  const campaignOptions = (campaigns ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    platform: c.platform as Platform,
    country: c.country as Country,
  }));

  return (
    <div className="mx-auto max-w-4xl px-6 py-10">
      <Link
        href="/projects"
        className="text-muted-foreground hover:text-foreground mb-6 inline-flex items-center gap-1.5 text-sm"
      >
        <ArrowLeftIcon className="size-3.5" />
        All projects
      </Link>

      <h1 className="mb-6 text-3xl">{project.title}</h1>

      <ProjectDetailForm
        project={{
          id: project.id,
          title: project.title,
          owner: project.owner,
          status: project.status as ProjectStatus,
          progress_pct: project.progress_pct,
          due_date: project.due_date,
          notes_markdown: project.notes_markdown,
          linked_campaign_ids: project.linked_campaign_ids,
        }}
        campaigns={campaignOptions}
      />
    </div>
  );
}
