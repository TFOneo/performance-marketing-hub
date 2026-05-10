"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { ProjectCard, type ProjectCardData } from "./project-card";
import { moveProjectStatus } from "@/app/(app)/projects/actions";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@/lib/schemas/enums";
import { cn } from "@/lib/utils";

export interface KanbanProject extends ProjectCardData {
  status: ProjectStatus;
}

const COLUMN_ORDER: ProjectStatus[] = [...PROJECT_STATUSES];

export function KanbanBoard({ projects }: { projects: KanbanProject[] }) {
  const [, startTransition] = useTransition();
  const [over, setOver] = useState<ProjectStatus | null>(null);

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData("text/project-id", id);
    e.dataTransfer.effectAllowed = "move";
  };

  const onDragOver = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setOver(status);
  };

  const onDragLeave = () => setOver(null);

  const onDrop = (e: React.DragEvent, status: ProjectStatus) => {
    e.preventDefault();
    setOver(null);
    const id = e.dataTransfer.getData("text/project-id");
    if (!id) return;

    const project = projects.find((p) => p.id === id);
    if (!project || project.status === status) return;

    startTransition(async () => {
      const result = await moveProjectStatus(id, status);
      if (result.ok) toast.success("Status updated");
      else toast.error(result.error);
    });
  };

  const grouped: Record<ProjectStatus, KanbanProject[]> = {
    not_started: [],
    in_progress: [],
    blocked: [],
    done: [],
  };
  for (const p of projects) grouped[p.status].push(p);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
      {COLUMN_ORDER.map((status) => {
        const items = grouped[status];
        return (
          <section
            key={status}
            aria-label={PROJECT_STATUS_LABELS[status]}
            className={cn(
              "border-border bg-surface flex flex-col gap-3 rounded-md border p-3 transition-colors",
              over === status && "border-brand-gold",
            )}
            onDragOver={(e) => onDragOver(e, status)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, status)}
          >
            <header className="flex items-center justify-between">
              <h2 className="text-muted-foreground text-xs font-normal uppercase tracking-wide">
                {PROJECT_STATUS_LABELS[status]}
              </h2>
              <span className="text-muted-foreground text-xs tabular-nums">
                {items.length}
              </span>
            </header>
            <div className="flex flex-col gap-2">
              {items.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center text-xs">No projects</p>
              ) : (
                items.map((p) => (
                  <ProjectCard key={p.id} project={p} onDragStart={onDragStart} />
                ))
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}
