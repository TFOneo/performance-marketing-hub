"use server";

import { generateWeeklyBrief } from "@/lib/anthropic/brief";
import type { BriefResponse } from "@/lib/anthropic/schemas";

export async function briefMeOnThisWeek(): Promise<
  { ok: true; brief: BriefResponse } | { ok: false; error: string }
> {
  return generateWeeklyBrief();
}
