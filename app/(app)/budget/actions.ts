"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { budgetUpsertSchema, type BudgetUpsertInput } from "@/lib/schemas/budget";
import { generateReallocations as generateRun } from "@/lib/anthropic/suggest-reallocations";

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

export async function upsertBudget(input: BudgetUpsertInput): Promise<ActionResult> {
  const parsed = budgetUpsertSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("budgets")
    .upsert(
      { ...parsed.data, user_id: userId },
      { onConflict: "user_id,month,platform,country" },
    );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/budget");
  revalidatePath("/");
  return { ok: true };
}

export async function generateReallocations(): Promise<
  ActionResult<{ runId: string; moveCount: number }>
> {
  const result = await generateRun();
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true, data: { runId: result.runId, moveCount: result.moveCount } };
}

export async function applyReallocationMove(
  runId: string,
  moveIndex: number,
): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("apply_reallocation", {
    p_run_id: runId,
    p_move_index: moveIndex,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath("/budget");
  revalidatePath("/budget/reallocations");
  return { ok: true };
}

export async function dismissReallocationRun(runId: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("reallocation_runs")
    .update({ status: "dismissed" })
    .eq("id", runId)
    .eq("user_id", userId)
    .eq("status", "pending");

  if (error) return { ok: false, error: error.message };

  revalidatePath("/budget");
  revalidatePath("/budget/reallocations");
  return { ok: true };
}
