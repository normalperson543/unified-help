"use client";

import { Button } from "@heroui/react";
import {
  Brush,
  CartesianGrid,
  Line,
  LineChart,
  Tooltip as ChartTooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useState } from "react";

type ReplyPoint = { date: string; replies: number };

export default function AnswerLineChart({ data }: { data: ReplyPoint[] }) {
  const [range, setRange] = useState({ startIndex: 0, endIndex: Math.max(0, data.length - 1) });
  const visibleCount = range.endIndex - range.startIndex + 1;

  function zoom(factor: number) {
    if (data.length < 2) return;
    const nextCount = Math.max(2, Math.min(data.length, Math.round(visibleCount * factor)));
    const center = (range.startIndex + range.endIndex) / 2;
    const startIndex = Math.max(0, Math.round(center - nextCount / 2));
    setRange({
      startIndex,
      endIndex: Math.min(data.length - 1, startIndex + nextCount - 1),
    });
  }

  function handleBrushChange(next: { startIndex?: number; endIndex?: number }) {
    setRange({
      startIndex: next.startIndex ?? range.startIndex,
      endIndex: next.endIndex ?? range.endIndex,
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="secondary" onPress={() => zoom(0.5)}>
          Zoom in
        </Button>
        <Button size="sm" variant="secondary" onPress={() => zoom(2)}>
          Zoom out
        </Button>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => setRange({ startIndex: 0, endIndex: Math.max(0, data.length - 1) })}
        >
          Reset
        </Button>
      </div>
      <LineChart
        data={data}
        style={{ width: "100%", height: 280 }}
        responsive
        margin={{ top: 8, right: 8, left: -16, bottom: 0 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 12, fill: "var(--muted)" }} interval="preserveStartEnd" />
        <YAxis allowDecimals={false} width={40} tick={{ fontSize: 12, fill: "var(--muted)" }} />
        <ChartTooltip
          contentStyle={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 8 }}
          formatter={(value) => [value, "Replies"]}
        />
        <Line dataKey="replies" type="monotone" stroke="var(--accent)" strokeWidth={2} dot={false} isAnimationActive={false} />
        <Brush
          dataKey="date"
          height={24}
          startIndex={range.startIndex}
          endIndex={range.endIndex}
          onChange={handleBrushChange}
          stroke="var(--accent)"
        />
      </LineChart>
      {data.length === 0 && <p className="text-muted text-sm">No replies in this period.</p>}
    </div>
  );
}
