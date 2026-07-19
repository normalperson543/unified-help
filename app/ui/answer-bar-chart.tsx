// REVIEWER NOTE: This component used for the profile page and program pages was generated with Claude Code
"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";

// A themed bar chart for average "tickets replied to" activity, shared by the
// profile (per user) and program (per program) pages so they stay consistent.
export default function AnswerBarChart({
  data,
  categoryKey,
  categoryLabel,
  valueLabel = "Avg. tickets replied to",
}: {
  data: Record<string, string | number>[];
  categoryKey: string;
  categoryLabel: string;
  valueLabel?: string;
}) {
  return (
    <BarChart
      data={data}
      style={{ width: "100%", height: 260 }}
      responsive
      margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
    >
      <CartesianGrid
        strokeDasharray="3 3"
        stroke="var(--border)"
        vertical={false}
      />
      <XAxis
        dataKey={categoryKey}
        tick={{ fontSize: 12, fill: "var(--muted)" }}
        interval="preserveStartEnd"
      />
      <YAxis
        tick={{ fontSize: 12, fill: "var(--muted)" }}
        allowDecimals
        width={40}
      />
      <ChartTooltip
        cursor={{ fill: "var(--accent)", opacity: 0.1 }}
        contentStyle={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: 8,
        }}
        formatter={(value) => [value, valueLabel]}
        labelFormatter={(label) => `${categoryLabel}: ${label}`}
      />
      <Bar dataKey="average" fill="var(--accent)" radius={[4, 4, 0, 0]} />
    </BarChart>
  );
}
