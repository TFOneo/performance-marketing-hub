"use client";

import Link from "next/link";
import { format, parseISO, isAfter } from "date-fns";
import { CalendarIcon, UserIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export interface ProjectCardData {
  id: string;
  title: string;
  owner: string | null;
  progress_pct: number;
  due_date: string | null;
  linked_campaign_ids: string[];
}

export function ProjectCard({
  project,
  onDragStart,
}: {
  project: ProjectCardData;
  onDragStart?: (e: React.DragEvent, id: string) => void;
}) {
  const overdue =
    project.due_date && isAfter(new Date(), parseISO(project.due_date));

  return (
    <Link
      href={`/projects/${project.id}`}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, project.id)}
      className="border-border bg-bg hover:border-brand-gold focus-visible:ring-ring block cursor-grab rounded-md border p-4 transition-colors focus-visible:ring-2 focus-visible:outline-none"
    >
      <h3 className="text-foreground text-sm font-normal leading-tight">{project.title}</h3>

      <div className="text-muted-foreground mt-2 flex flex-wrap items-center gap-3 text-xs">
        {project.owner && (
          <span className="inline-flex items-center gap-1">
            <UserIcon className="size-3" />
            {project.owner}
          </span>
        )}
        {project.due_date && (
          <span
            className={cn(
              "inline-flex items-center gap-1",
              overdue && "text-destructive font-normal",
            )}
          >
            <CalendarIcon className="size-3" />
            {format(parseISO(project.due_date), "d MMM")}
          </span>
        )}
        {project.linked_campaign_ids.length > 0 && (
          <span className="text-muted-foreground">
            {project.linked_campaign_ids.length}{" "}
            {project.linked_campaign_ids.length === 1 ? "campaign" : "campaigns"}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-1">
        <div className="bg-surface relative h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-brand-gold absolute inset-y-0 left-0 rounded-full transition-all"
            style={{ width: `${project.progress_pct}%` }}
            aria-hidden
          />
        </div>
        <div
          className="text-muted-foreground text-right text-xs tabular-nums"
          aria-label={`Progress ${project.progress_pct} percent`}
        >
          {project.progress_pct}%
        </div>
      </div>
    </Link>
  );
}
