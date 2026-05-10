import { format, parse, isValid, startOfMonth } from "date-fns";

export function currentMonthISO(): string {
  return format(startOfMonth(new Date()), "yyyy-MM-01");
}

export function toMonthFirstISO(input: string | Date): string {
  const d = typeof input === "string" ? parse(input, "yyyy-MM", new Date()) : input;
  if (!isValid(d)) {
    throw new Error(`Invalid month: ${String(input)}`);
  }
  return format(startOfMonth(d), "yyyy-MM-01");
}

export function monthLabel(monthISO: string): string {
  return format(parse(monthISO, "yyyy-MM-dd", new Date()), "MMMM yyyy");
}

export function monthInputValue(monthISO: string): string {
  // <input type="month"> wants YYYY-MM
  return monthISO.slice(0, 7);
}
