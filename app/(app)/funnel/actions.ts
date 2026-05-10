"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import {
  funnelEntryInputSchema,
  funnelEntryUpdateSchema,
  bulkWeekInputSchema,
  type FunnelEntryInput,
  type FunnelEntryUpdate,
  type BulkWeekInput,
} from "@/lib/schemas/funnel";
import { toMondayISO } from "@/lib/utils/week";

export type ActionResult = { ok: true } | { ok: false; error: string };

async function currentUserId(): Promise<string | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user?.id ?? null;
}

function explain(error: { message?: string; code?: string }): string {
  if (error.code === "23505") {
    return "An entry already exists for that week, platform, and country. Edit the existing row instead.";
  }
  return error.message ?? "Unexpected error.";
}

export async function addFunnelEntry(input: FunnelEntryInput): Promise<ActionResult> {
  const parsed = funnelEntryInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const data = parsed.data;
  const { error } = await supabase.from("weekly_funnel").insert({
    ...data,
    week_start: toMondayISO(data.week_start),
    notes: data.notes ?? null,
    user_id: userId,
  });

  if (error) return { ok: false, error: explain(error) };

  revalidatePath("/funnel");
  revalidatePath("/");
  return { ok: true };
}

export async function updateFunnelEntry(input: FunnelEntryUpdate): Promise<ActionResult> {
  const parsed = funnelEntryUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { id, week_start, ...rest } = parsed.data;
  const update = week_start
    ? { ...rest, week_start: toMondayISO(week_start) }
    : rest;

  const { error } = await supabase
    .from("weekly_funnel")
    .update(update)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: explain(error) };

  revalidatePath("/funnel");
  revalidatePath("/");
  return { ok: true };
}

export async function deleteFunnelEntry(id: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("weekly_funnel")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: explain(error) };

  revalidatePath("/funnel");
  revalidatePath("/");
  return { ok: true };
}

export async function bulkAddWeek(input: BulkWeekInput): Promise<ActionResult> {
  const parsed = bulkWeekInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const week_start = toMondayISO(parsed.data.week_start);
  const supabase = await createClient();

  // Filter out fully zero rows so the user isn't forced to type 0 everywhere.
  const rowsToInsert = parsed.data.rows
    .filter((r) => r.spend_usd > 0 || r.leads > 0 || r.sql1 > 0 || r.sql2 > 0 || r.sal1 > 0 || r.sal2 > 0 || r.client > 0)
    .map((row) => ({
      ...row,
      week_start,
      user_id: userId,
    }));

  if (rowsToInsert.length === 0) {
    return { ok: false, error: "No non-zero rows to save." };
  }

  const { error } = await supabase
    .from("weekly_funnel")
    .upsert(rowsToInsert, {
      onConflict: "user_id,week_start,platform,country",
    });

  if (error) return { ok: false, error: explain(error) };

  revalidatePath("/funnel");
  revalidatePath("/");
  return { ok: true };
}
