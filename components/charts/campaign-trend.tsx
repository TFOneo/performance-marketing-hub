"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { format, parseISO } from "date-fns";

export interface CampaignTrendPoint {
  period_end: string;
  spend_usd: number;
  sal1: number;
}

export function CampaignTrend({ points }: { points: CampaignTrendPoint[] }) {
  if (points.length === 0) {
    return (
      <div className="text-muted-foreground text-sm">
        No snapshots yet — upload one to see the trend.
      </div>
    );
  }

  const data = points
    .slice()
    .sort((a, b) => a.period_end.localeCompare(b.period_end))
    .map((p) => ({
      label: format(parseISO(p.period_end), "d MMM"),
      Spend: Number(p.spend_usd.toFixed(0)),
      SAL1: p.sal1,
    }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 10, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" />
        <XAxis dataKey="label" stroke="var(--muted)" fontSize={12} />
        <YAxis yAxisId="left" stroke="var(--brand-gold)" fontSize={12} />
        <YAxis
          yAxisId="right"
          orientation="right"
          stroke="var(--steel)"
          fontSize={12}
        />
        <Tooltip
          contentStyle={{
            background: "var(--bg)",
            border: "1px solid var(--border)",
            borderRadius: "0.375rem",
            fontSize: "0.875rem",
          }}
        />
        <Legend wrapperStyle={{ fontSize: "0.75rem" }} />
        <Line
          yAxisId="left"
          dataKey="Spend"
          stroke="var(--brand-gold)"
          strokeWidth={2}
          dot={false}
        />
        <Line
          yAxisId="right"
          dataKey="SAL1"
          stroke="var(--steel)"
          strokeWidth={2}
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
