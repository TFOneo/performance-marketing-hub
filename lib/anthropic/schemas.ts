import { z } from "zod";
import { PlatformEnum, CountryEnum, RatingBandEnum } from "@/lib/schemas/enums";

export const RatingResponseSchema = z
  .object({
    score: z.number().int().min(0).max(100),
    band: RatingBandEnum,
    rationale: z.string().min(20).max(800),
    recommendations: z.array(z.string().min(5).max(240)).min(2).max(4),
  })
  .strict();

const PairSchema = z
  .object({
    platform: PlatformEnum,
    country: CountryEnum,
  })
  .strict();

export const ReallocationMoveSchema = z
  .object({
    from: PairSchema,
    to: PairSchema,
    shift_usd: z.number().positive().finite(),
    rationale: z.string().min(10).max(400),
    confidence: z.number().min(0).max(1),
  })
  .strict();

export const ReallocationResponseSchema = z
  .object({
    summary: z.string().min(10).max(600),
    moves: z.array(ReallocationMoveSchema).min(0).max(5),
  })
  .strict();

export const BriefResponseSchema = z
  .object({
    headline: z.string().min(10).max(300),
    improved: z.array(z.string().min(5).max(400)).max(5),
    worsened: z.array(z.string().min(5).max(400)).max(5),
    investigate: z.array(z.string().min(5).max(400)).max(5),
  })
  .strict();

export type RatingResponse = z.infer<typeof RatingResponseSchema>;
export type ReallocationMove = z.infer<typeof ReallocationMoveSchema>;
export type ReallocationResponse = z.infer<typeof ReallocationResponseSchema>;
export type BriefResponse = z.infer<typeof BriefResponseSchema>;
