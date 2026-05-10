import { z } from "zod";

export const PlatformEnum = z.enum(["google", "meta", "linkedin"]);
export const CountryEnum = z.enum(["KSA", "UAE", "Kuwait", "Bahrain"]);
export const CampaignStatusEnum = z.enum(["active", "paused", "ended"]);
export const ProjectStatusEnum = z.enum(["not_started", "in_progress", "blocked", "done"]);
export const SuggestionStatusEnum = z.enum(["pending", "applied", "dismissed"]);
export const RatingBandEnum = z.enum([
  "excellent",
  "good",
  "average",
  "underperforming",
  "poor",
]);

export const PLATFORMS = PlatformEnum.options;
export const COUNTRIES = CountryEnum.options;
export const CAMPAIGN_STATUSES = CampaignStatusEnum.options;
export const PROJECT_STATUSES = ProjectStatusEnum.options;

export const PLATFORM_LABELS: Record<z.infer<typeof PlatformEnum>, string> = {
  google: "Google",
  meta: "Meta",
  linkedin: "LinkedIn",
};

export const COUNTRY_LABELS: Record<z.infer<typeof CountryEnum>, string> = {
  KSA: "KSA",
  UAE: "UAE",
  Kuwait: "Kuwait",
  Bahrain: "Bahrain",
};

export const PROJECT_STATUS_LABELS: Record<z.infer<typeof ProjectStatusEnum>, string> = {
  not_started: "Not started",
  in_progress: "In progress",
  blocked: "Blocked",
  done: "Done",
};

export type Platform = z.infer<typeof PlatformEnum>;
export type Country = z.infer<typeof CountryEnum>;
export type CampaignStatus = z.infer<typeof CampaignStatusEnum>;
export type ProjectStatus = z.infer<typeof ProjectStatusEnum>;
export type SuggestionStatus = z.infer<typeof SuggestionStatusEnum>;
export type RatingBand = z.infer<typeof RatingBandEnum>;
