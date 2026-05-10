"use client";

import { useState, useTransition } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import "@uiw/react-md-editor/markdown-editor.css";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
  type Platform,
  type Country,
  PLATFORM_LABELS,
  COUNTRY_LABELS,
} from "@/lib/schemas/enums";
import { updateProject, deleteProject } from "@/app/(app)/projects/actions";

const MDEditor = dynamic(() => import("@uiw/react-md-editor"), {
  ssr: false,
  loading: () => (
    <div className="border-border bg-surface text-muted-foreground rounded-md border p-4 text-sm">
      Loading editor...
    </div>
  ),
});

interface CampaignOption {
  id: string;
  name: string;
  platform: Platform;
  country: Country;
}

interface ProjectDetailFormProps {
  project: {
    id: string;
    title: string;
    owner: string | null;
    status: ProjectStatus;
    progress_pct: number;
    due_date: string | null;
    notes_markdown: string | null;
    linked_campaign_ids: string[];
  };
  campaigns: CampaignOption[];
}

export function ProjectDetailForm({ project, campaigns }: ProjectDetailFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();

  const [title, setTitle] = useState(project.title);
  const [owner, setOwner] = useState(project.owner ?? "");
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [progress, setProgress] = useState(project.progress_pct);
  const [dueDate, setDueDate] = useState(project.due_date ?? "");
  const [notes, setNotes] = useState(project.notes_markdown ?? "");
  const [linkedIds, setLinkedIds] = useState<string[]>(project.linked_campaign_ids);

  const onSave = () => {
    startTransition(async () => {
      const result = await updateProject({
        id: project.id,
        title,
        owner: owner || null,
        status,
        progress_pct: progress,
        due_date: dueDate || null,
        notes_markdown: notes || null,
        linked_campaign_ids: linkedIds,
      });
      if (result.ok) toast.success("Project saved");
      else toast.error(result.error);
    });
  };

  const onDelete = () => {
    if (!confirm(`Delete "${project.title}"? This cannot be undone.`)) return;
    startDeleteTransition(async () => {
      const result = await deleteProject(project.id);
      if (result.ok) {
        toast.success("Project deleted");
        router.push("/projects");
      } else {
        toast.error(result.error);
      }
    });
  };

  const toggleLinked = (id: string, checked: boolean) => {
    setLinkedIds((prev) =>
      checked ? [...new Set([...prev, id])] : prev.filter((x) => x !== id),
    );
  };

  return (
    <div className="space-y-6">
      <div className="border-border bg-bg space-y-4 rounded-md border p-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="owner">Owner</Label>
            <Input id="owner" value={owner} onChange={(e) => setOwner(e.target.value)} />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as ProjectStatus)}>
              <SelectTrigger id="status" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROJECT_STATUSES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {PROJECT_STATUS_LABELS[s]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="due">Due date</Label>
            <Input id="due" type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="progress">Progress · {progress}%</Label>
            <Slider
              id="progress"
              min={0}
              max={100}
              step={5}
              value={progress}
              onValueChange={(v) => setProgress(typeof v === "number" ? v : (v[0] ?? 0))}
              className="py-2"
            />
          </div>
        </div>
      </div>

      <div className="border-border bg-bg rounded-md border p-6">
        <Label className="mb-3 block text-sm">Notes</Label>
        <div data-color-mode="light">
          <MDEditor
            value={notes}
            onChange={(v) => setNotes(v ?? "")}
            preview="edit"
            height={320}
          />
        </div>
      </div>

      <div className="border-border bg-bg rounded-md border p-6">
        <Label className="mb-3 block text-sm">Linked campaigns</Label>
        {campaigns.length === 0 ? (
          <p className="text-muted-foreground text-sm">
            No campaigns to link. Create some on the Campaigns page.
          </p>
        ) : (
          <ul className="grid gap-2 md:grid-cols-2">
            {campaigns.map((c) => {
              const checked = linkedIds.includes(c.id);
              const id = `link_${c.id}`;
              return (
                <li key={c.id} className="flex items-start gap-3">
                  <Checkbox
                    id={id}
                    checked={checked}
                    onCheckedChange={(state) => toggleLinked(c.id, !!state)}
                  />
                  <Label htmlFor={id} className="flex-1 cursor-pointer leading-tight font-normal">
                    <div className="text-foreground text-sm">{c.name}</div>
                    <div className="text-muted-foreground text-xs">
                      {PLATFORM_LABELS[c.platform]} · {COUNTRY_LABELS[c.country]}
                    </div>
                  </Label>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onDelete}
          disabled={isDeleting}
          className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
        >
          {isDeleting ? "Deleting..." : "Delete project"}
        </Button>
        <Button type="button" onClick={onSave} disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
