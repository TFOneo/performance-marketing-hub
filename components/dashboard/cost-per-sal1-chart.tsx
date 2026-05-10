"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { format, parseISO } from "date-fns";
import { PLATFORM_LABELS, type Platform } from "@/lib/schemas/enums";

interface SeriesPoint {
  week: string;
  google: number | null;
  meta: number | null;
  linkedin: number | null;
}

const COLOURS: Record<Platform, string> = {
  google: "var(--brand-gold)",
  meta: "var(--steel)",
  linkedin: "var(--success)",
};

export function CostPerSal1Chart({
  weeks,
  series,
}: {
  weeks: string[];
  series: { platform: Platform; values: (number | null)[] }[];
}) {
  const data: SeriesPoint[] = weeks.map((w, i) => ({
    week: format(parseISO(w), "d MMM"),
    google: series.find((s) => s.platform === "google")?.values[i] ?? null,
    meta: series.find((s) => s.platform === "meta")?.values[i] ?? null,
    linkedin: series.find((s) => s.platform === "linkedin")?.values[i] ?? null,
  }));

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="week" stroke="var(--muted)" fontSize={12} />
        <YAxis stroke="var(--muted)" fontSize={12} />
        <Tooltip
          contentStyle={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
          formatter={(value) => {
            if (value === null || value === undefined) return "—";
            const n = typeof value === "number" ? value : Number(value);
            if (!Number.isFinite(n)) return String(value);
            return n.toLocaleString("en-US", {
              style: "currency",
              currency: "USD",
              maximumFractionDigits: 0,
            });
          }}
        />
        <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
        {(["google", "meta", "linkedin"] as Platform[]).map((p) => (
          <Line
            key={p}
            dataKey={p}
            name={PLATFORM_LABELS[p]}
            stroke={COLOURS[p]}
            strokeWidth={2}
            dot={false}
            connectNulls={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
