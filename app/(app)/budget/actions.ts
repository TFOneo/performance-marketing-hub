"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { budgetUpsertSchema, type BudgetUpsertInput } from "@/lib/schemas/budget";

type ActionResult = { ok: true } | { ok: false; error: string };

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
