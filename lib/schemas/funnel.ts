import { z } from "zod";
import { PlatformEnum, CountryEnum } from "./enums";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be in YYYY-MM-DD format");

const nonNegativeInt = z.coerce.number().int().min(0);
const nonNegativeMoney = z.coerce.number().min(0).finite();

export const funnelMetricsSchema = z.object({
  spend_usd: nonNegativeMoney,
  leads: nonNegativeInt,
  sql1: nonNegativeInt,
  sql2: nonNegativeInt,
  sal1: nonNegativeInt,
  sal2: nonNegativeInt,
  client: nonNegativeInt,
});

export const funnelEntryInputSchema = funnelMetricsSchema.extend({
  week_start: isoDate,
  platform: PlatformEnum,
  country: CountryEnum,
  notes: z.string().max(500).optional().nullable(),
});

export const funnelEntryUpdateSchema = funnelEntryInputSchema.partial().extend({
  id: z.string().uuid(),
});

export const bulkWeekInputSchema = z.object({
  week_start: isoDate,
  rows: z
    .array(
      funnelMetricsSchema.extend({
        platform: PlatformEnum,
        country: CountryEnum,
      }),
    )
    .min(1)
    .max(12),
});

export type FunnelEntryInput = z.infer<typeof funnelEntryInputSchema>;
export type FunnelEntryUpdate = z.infer<typeof funnelEntryUpdateSchema>;
export type BulkWeekInput = z.infer<typeof bulkWeekInputSchema>;
export type FunnelMetrics = z.infer<typeof funnelMetricsSchema>;
