"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  projectInputSchema,
  projectUpdateSchema,
  projectStatusUpdateSchema,
  type ProjectInput,
  type ProjectUpdate,
} from "@/lib/schemas/project";
import type { ProjectStatus } from "@/lib/schemas/enums";

type ActionResult<T = undefined> =
  | (T extends undefined ? { ok: true } : { ok: true; data: T })
  | { ok: false; error: string };

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function createProject(
  input: ProjectInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = projectInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("projects")
    .insert({
      ...parsed.data,
      owner: parsed.data.owner ?? null,
      due_date: parsed.data.due_date ?? null,
      notes_markdown: parsed.data.notes_markdown ?? null,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create project" };
  }

  revalidatePath("/projects");
  return { ok: true, data: { id: data.id } };
}

export async function updateProject(input: ProjectUpdate): Promise<ActionResult> {
  const parsed = projectUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { id, ...rest } = parsed.data;
  const { error } = await supabase
    .from("projects")
    .update(rest)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects");
  revalidatePath(`/projects/${id}`);
  return { ok: true };
}

export async function deleteProject(id: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects");
  return { ok: true };
}

export async function moveProjectStatus(
  id: string,
  status: ProjectStatus,
): Promise<ActionResult> {
  const parsed = projectStatusUpdateSchema.safeParse({ id, status });
  if (!parsed.success) {
    return { ok: false, error: "Invalid status" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("projects")
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/projects");
  return { ok: true };
}
