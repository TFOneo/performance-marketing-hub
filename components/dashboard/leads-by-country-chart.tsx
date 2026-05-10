"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { COUNTRY_LABELS, type Country } from "@/lib/schemas/enums";

interface SeriesPoint {
  week: string;
  KSA: number;
  UAE: number;
  Kuwait: number;
  Bahrain: number;
}

const COLOURS: Record<Country, string> = {
  KSA: "var(--brand-gold)",
  UAE: "var(--steel)",
  Kuwait: "var(--success)",
  Bahrain: "var(--purple)",
};

export function LeadsByCountryChart({
  weeks,
  series,
}: {
  weeks: string[];
  series: { country: Country; values: number[] }[];
}) {
  const data: SeriesPoint[] = weeks.map((w, i) => ({
    week: format(parseISO(w), "d MMM"),
    KSA: series.find((s) => s.country === "KSA")?.values[i] ?? 0,
    UAE: series.find((s) => s.country === "UAE")?.values[i] ?? 0,
    Kuwait: series.find((s) => s.country === "Kuwait")?.values[i] ?? 0,
    Bahrain: series.find((s) => s.country === "Bahrain")?.values[i] ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <BarChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="week" stroke="var(--muted)" fontSize={12} />
        <YAxis stroke="var(--muted)" fontSize={12} allowDecimals={false} />
        <Tooltip
          contentStyle={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
        {(["KSA", "UAE", "Kuwait", "Bahrain"] as Country[]).map((c) => (
          <Bar
            key={c}
            dataKey={c}
            name={COUNTRY_LABELS[c]}
            stackId="leads"
            fill={COLOURS[c]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}
