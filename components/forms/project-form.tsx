"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { projectInputSchema, type ProjectInput } from "@/lib/schemas/project";
import {
  PROJECT_STATUSES,
  PROJECT_STATUS_LABELS,
  type ProjectStatus,
} from "@/lib/schemas/enums";
import { createProject } from "@/app/(app)/projects/actions";

export function NewProjectDialog() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ProjectInput>({
    resolver: zodResolver(projectInputSchema),
    defaultValues: {
      title: "",
      owner: "",
      status: "not_started",
      progress_pct: 0,
      due_date: null,
      notes_markdown: "",
      linked_campaign_ids: [],
    },
  });

  const status = watch("status");

  const onSubmit = (values: ProjectInput) => {
    startTransition(async () => {
      const result = await createProject(values);
      if (result.ok) {
        toast.success("Project created");
        reset();
        router.push(`/projects/${result.data.id}`);
      } else {
        toast.error(result.error);
      }
    });
  };

  return (
    <Dialog>
      <DialogTrigger render={<Button>New project</Button>} />
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>New project</DialogTitle>
          <DialogDescription>
            Add a marketing initiative to track. You can add markdown notes and link campaigns
            on the detail page.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
          <div className="space-y-2">
            <Label htmlFor="project_title">Title</Label>
            <Input id="project_title" {...register("title")} />
            {errors.title && (
              <p className="text-destructive text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="project_owner">Owner (optional)</Label>
              <Input id="project_owner" {...register("owner")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project_due">Due date (optional)</Label>
              <Input id="project_due" type="date" {...register("due_date")} />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="project_status">Status</Label>
            <Select
              value={status}
              onValueChange={(v) => setValue("status", v as ProjectStatus)}
            >
              <SelectTrigger id="project_status" className="w-full">
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

          <DialogFooter>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Creating..." : "Create project"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
