import { z } from "zod";
import { PlatformEnum, CountryEnum, CampaignStatusEnum } from "./enums";
import { funnelMetricsSchema } from "./funnel";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

export const campaignInputSchema = z.object({
  name: z.string().min(1, "Name is required").max(200),
  platform: PlatformEnum,
  country: CountryEnum,
  status: CampaignStatusEnum.default("active"),
  start_date: isoDate.optional().nullable(),
  end_date: isoDate.optional().nullable(),
  total_budget_usd: z.coerce.number().min(0).optional().nullable(),
  notes: z.string().max(2000).optional().nullable(),
});

export const campaignUpdateSchema = campaignInputSchema.partial().extend({
  id: z.string().uuid(),
});

export const snapshotInputSchema = funnelMetricsSchema.extend({
  campaign_id: z.string().uuid(),
  period_start: isoDate,
  period_end: isoDate,
});

export const snapshotUpdateSchema = snapshotInputSchema
  .omit({ campaign_id: true })
  .partial()
  .extend({ id: z.string().uuid() });

export type CampaignInput = z.infer<typeof campaignInputSchema>;
export type CampaignUpdate = z.infer<typeof campaignUpdateSchema>;
export type SnapshotInput = z.infer<typeof snapshotInputSchema>;
export type SnapshotUpdate = z.infer<typeof snapshotUpdateSchema>;
