"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface BranchLine {
  name: string;
  data: { day: string; revenue: number }[];
  color: string;
}

interface MultiLineChartProps {
  branches: BranchLine[];
  className?: string;
}

const CHART_COLORS = [
  "var(--color-pink-glow)",
  "var(--color-dash-blue)",
  "var(--color-dash-green)",
  "var(--color-dash-amber)",
  "#A78BFA",
  "#F9A8D4",
  "#93C5FD",
  "#86EFAC",
  "#FDE68A",
  "#FDBA74",
];

/** 7-day multi-line chart — one line per branch, Recharts */
export function MultiLineChart({ branches, className }: MultiLineChartProps) {
  // Merge all days into a single x-axis
  const days = branches[0]?.data.map((d) => d.day) ?? [];

  const merged = days.map((day, i) => {
    const row: Record<string, number | string> = { day };
    branches.forEach((b) => {
      row[b.name] = b.data[i]?.revenue ?? 0;
    });
    return row;
  });

  if (branches.length === 0) {
    return (
      <div className={`flex h-full items-center justify-center text-[13px] text-dim ${className ?? ""}`}>
        Sin datos de sucursales para graficar.
      </div>
    );
  }

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={merged} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 9, fill: "var(--color-dim)" }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "var(--color-dim)" }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(v: number) => `$${(v / 1000).toFixed(0)}k`}
          />
          <Tooltip
            contentStyle={{
              background: "var(--color-canvas)",
              border: "1px solid var(--color-wire)",
              borderRadius: 12,
              fontSize: 12,
              color: "var(--color-light)",
              boxShadow: "0 12px 32px rgba(0,0,0,0.4)",
            }}
            formatter={(value) => [`$${Number(value).toLocaleString("es-MX")}`, "Ventas"]}
          />
          {branches.map((b, i) => (
            <Line
              key={b.name}
              type="monotone"
              dataKey={b.name}
              stroke={b.color || CHART_COLORS[i % CHART_COLORS.length]}
              strokeWidth={1.6}
              dot={false}
              activeDot={{ r: 3, fill: b.color || CHART_COLORS[i % CHART_COLORS.length] }}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
