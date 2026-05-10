import { PageHeader } from "@/components/layout/page-header";
import { NewCampaignDialog } from "@/components/forms/campaign-form";
import { CampaignsTable, type CampaignsRow } from "@/components/tables/campaigns-table";
import { createClient } from "@/lib/supabase/server";
import type {
  Platform,
  Country,
  CampaignStatus,
  RatingBand,
} from "@/lib/schemas/enums";

export default async function CampaignsPage() {
  const supabase = await createClient();
  const { data: campaigns, error } = await supabase
    .from("campaigns")
    .select("id, name, platform, country, status, created_at")
    .order("created_at", { ascending: false });

  // Latest rating per campaign — single query, sort + group in TS.
  const { data: entries } = await supabase
    .from("campaign_funnel_entries")
    .select("campaign_id, ai_rating_score, ai_rating_band, created_at")
    .order("created_at", { ascending: false });

  const latestByCampaign = new Map<
    string,
    { score: number | null; band: string | null; created_at: string }
  >();
  for (const e of entries ?? []) {
    if (!latestByCampaign.has(e.campaign_id)) {
      latestByCampaign.set(e.campaign_id, {
        score: e.ai_rating_score,
        band: e.ai_rating_band,
        created_at: e.created_at,
      });
    }
  }

  const rows: CampaignsRow[] = (campaigns ?? []).map((c) => {
    const latest = latestByCampaign.get(c.id);
    return {
      id: c.id,
      name: c.name,
      platform: c.platform as Platform,
      country: c.country as Country,
      status: c.status as CampaignStatus,
      latest_rating:
        latest && latest.score !== null
          ? {
              score: latest.score,
              band: (latest.band as RatingBand | null) ?? null,
            }
          : null,
      last_uploaded_at: latest?.created_at ?? null,
    };
  });

  return (
    <div className="mx-auto max-w-6xl px-6 py-10">
      <PageHeader
        title="Campaigns"
        description="Register campaigns, upload funnel snapshots, and track AI ratings."
        actions={<NewCampaignDialog />}
      />

      {error && (
        <p className="text-destructive mb-4 text-sm">
          Could not load campaigns: {error.message}
        </p>
      )}

      <CampaignsTable rows={rows} />
    </div>
  );
}
