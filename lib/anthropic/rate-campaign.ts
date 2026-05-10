import "server-only";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { callJson } from "@/lib/anthropic/client";
import { RatingResponseSchema, type RatingResponse } from "@/lib/anthropic/schemas";
import {
  RATING_SYSTEM_PROMPT,
  buildRatingUserPrompt,
} from "@/lib/anthropic/prompts/rating";
import { getRollingBenchmark } from "@/lib/utils/benchmarks";
import type { Platform, Country, CampaignStatus } from "@/lib/schemas/enums";

export type RateResult =
  | { ok: true; rating: RatingResponse }
  | { ok: false; error: string };

/**
 * Loads a snapshot + its campaign + the rolling 12-week benchmark, asks Anthropic
 * for a rating, and writes the result back to campaign_funnel_entries.
 * On any failure the row stays saved with rating fields null — UI surfaces a Re-rate button.
 */
export async function rateCampaignSnapshot(snapshotId: string): Promise<RateResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "Not authenticated" };

  const { data: snapshot, error: snapErr } = await supabase
    .from("campaign_funnel_entries")
    .select(
      "id, campaign_id, period_start, period_end, spend_usd, leads, sql1, sql2, sal1, sal2, client",
    )
    .eq("id", snapshotId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (snapErr || !snapshot) {
    return { ok: false, error: "Snapshot not found" };
  }

  const { data: campaign, error: campErr } = await supabase
    .from("campaigns")
    .select("id, name, platform, country, status, start_date, end_date")
    .eq("id", snapshot.campaign_id)
    .eq("user_id", user.id)
    .maybeSingle();

  if (campErr || !campaign) {
    return { ok: false, error: "Campaign not found" };
  }

  const benchmark = await getRollingBenchmark(
    supabase,
    user.id,
    campaign.platform as Platform,
    campaign.country as Country,
    new Date(snapshot.period_end),
  );

  const userPrompt = buildRatingUserPrompt({
    campaign: {
      name: campaign.name,
      platform: campaign.platform as Platform,
      country: campaign.country as Country,
      status: campaign.status as CampaignStatus,
      start_date: campaign.start_date,
      end_date: campaign.end_date,
    },
    snapshot: {
      period_start: snapshot.period_start,
      period_end: snapshot.period_end,
      spend_usd: Number(snapshot.spend_usd),
      leads: snapshot.leads,
      sql1: snapshot.sql1,
      sql2: snapshot.sql2,
      sal1: snapshot.sal1,
      sal2: snapshot.sal2,
      client: snapshot.client,
    },
    benchmark,
  });

  const result = await callJson({
    system: RATING_SYSTEM_PROMPT,
    user: userPrompt,
    schema: RatingResponseSchema,
    maxTokens: 1500,
    label: "rating",
  });

  if (!result.ok) {
    console.warn(`[ai:rating] failed at stage=${result.stage}: ${result.error}`);
    return { ok: false, error: `AI rating failed (${result.stage}): ${result.error}` };
  }

  // Sanity post-check: a high score with zero SAL1 is suspicious — flag and persist anyway,
  // but log so we can investigate if the model is hallucinating quality.
  if (result.data.score >= 80 && snapshot.sal1 === 0) {
    console.warn(
      `[ai:rating] suspicious high score ${result.data.score} with sal1=0 on snapshot ${snapshotId}`,
    );
  }

  const { error: updateErr } = await supabase
    .from("campaign_funnel_entries")
    .update({
      ai_rating_score: result.data.score,
      ai_rating_band: result.data.band,
      ai_rating_rationale: result.data.rationale,
      ai_recommendations: result.data.recommendations,
      ai_rated_at: new Date().toISOString(),
    })
    .eq("id", snapshotId)
    .eq("user_id", user.id);

  if (updateErr) {
    return { ok: false, error: `Could not save rating: ${updateErr.message}` };
  }

  revalidatePath(`/campaigns/${snapshot.campaign_id}`);
  revalidatePath("/campaigns");
  revalidatePath("/");

  return { ok: true, rating: result.data };
}
