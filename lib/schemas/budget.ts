import { z } from "zod";
import { PlatformEnum, CountryEnum } from "./enums";

const isoMonth = z
  .string()
  .regex(/^\d{4}-\d{2}-01$/, "Month must be the first day of the month (YYYY-MM-01)");

export const budgetUpsertSchema = z.object({
  month: isoMonth,
  platform: PlatformEnum,
  country: CountryEnum,
  planned_usd: z.coerce.number().min(0).finite(),
});

export type BudgetUpsertInput = z.infer<typeof budgetUpsertSchema>;
