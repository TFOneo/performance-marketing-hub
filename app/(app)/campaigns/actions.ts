"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { rateCampaignSnapshot } from "@/lib/anthropic/rate-campaign";
import {
  campaignInputSchema,
  campaignUpdateSchema,
  snapshotInputSchema,
  type CampaignInput,
  type CampaignUpdate,
  type SnapshotInput,
} from "@/lib/schemas/campaign";

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

export async function createCampaign(
  input: CampaignInput,
): Promise<ActionResult<{ id: string }>> {
  const parsed = campaignInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaigns")
    .insert({
      ...parsed.data,
      start_date: parsed.data.start_date ?? null,
      end_date: parsed.data.end_date ?? null,
      total_budget_usd: parsed.data.total_budget_usd ?? null,
      notes: parsed.data.notes ?? null,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not create campaign" };
  }

  revalidatePath("/campaigns");
  revalidatePath("/");
  return { ok: true, data: { id: data.id } };
}

export async function updateCampaign(input: CampaignUpdate): Promise<ActionResult> {
  const parsed = campaignUpdateSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { id, ...rest } = parsed.data;
  const { error } = await supabase
    .from("campaigns")
    .update(rest)
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/campaigns");
  revalidatePath(`/campaigns/${id}`);
  revalidatePath("/");
  return { ok: true };
}

export async function deleteCampaign(id: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("campaigns")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/campaigns");
  revalidatePath("/");
  return { ok: true };
}

export async function addSnapshot(
  input: SnapshotInput,
): Promise<ActionResult<{ id: string; rated: boolean }>> {
  const parsed = snapshotInputSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Invalid input" };
  }

  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("campaign_funnel_entries")
    .insert({
      ...parsed.data,
      user_id: userId,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { ok: false, error: error?.message ?? "Could not save snapshot" };
  }

  // Best-effort: save first, then call AI. Failure leaves the row with null rating;
  // user can press "Re-rate" from the snapshot card.
  const ratingResult = await rateCampaignSnapshot(data.id);

  revalidatePath(`/campaigns/${parsed.data.campaign_id}`);
  revalidatePath("/campaigns");
  revalidatePath("/");
  return { ok: true, data: { id: data.id, rated: ratingResult.ok } };
}

export async function rerateSnapshot(snapshotId: string): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const result = await rateCampaignSnapshot(snapshotId);
  if (!result.ok) return { ok: false, error: result.error };
  return { ok: true };
}

export async function deleteSnapshot(
  id: string,
  campaignId: string,
): Promise<ActionResult> {
  const userId = await currentUserId();
  if (!userId) return { ok: false, error: "Not authenticated" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("campaign_funnel_entries")
    .delete()
    .eq("id", id)
    .eq("user_id", userId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/campaigns");
  revalidatePath("/");
  return { ok: true };
}
