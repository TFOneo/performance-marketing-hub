import { startOfISOWeek, format, parseISO, subWeeks, addWeeks, isValid } from "date-fns";

/**
 * Snap a date to the Monday of its ISO week, returned as an ISO date string (YYYY-MM-DD).
 * The brief uses ISO Monday as the canonical week start for `weekly_funnel.week_start`.
 */
export function toMondayISO(date: Date | string): string {
  const d = typeof date === "string" ? parseISO(date) : date;
  if (!isValid(d)) {
    throw new Error(`Invalid date: ${String(date)}`);
  }
  return format(startOfISOWeek(d), "yyyy-MM-dd");
}

export function weekRangeISO(weeks: number, asOf: Date | string = new Date()): string[] {
  const monday = startOfISOWeek(typeof asOf === "string" ? parseISO(asOf) : asOf);
  const out: string[] = [];
  for (let i = weeks - 1; i >= 0; i--) {
    out.push(format(subWeeks(monday, i), "yyyy-MM-dd"));
  }
  return out;
}

export function nextMondayISO(date: Date | string): string {
  const monday = startOfISOWeek(typeof date === "string" ? parseISO(date) : date);
  return format(addWeeks(monday, 1), "yyyy-MM-dd");
}

export function formatWeekLabel(weekStartISO: string): string {
  const d = parseISO(weekStartISO);
  return format(d, "d MMM yyyy");
}
