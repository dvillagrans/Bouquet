"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface PeakHourBarProps {
  /** Array of 24 values — typically orders per hour */
  data: { hour: string; orders: number }[];
  className?: string;
}

/** Hourly order distribution bar chart. Highlights the peak bar. */
export function PeakHourBar({ data, className }: PeakHourBarProps) {
  const max = Math.max(...data.map((d) => d.orders), 1);

  return (
    <div className={`min-w-0 min-h-[120px] ${className ?? ""}`}>
      <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={120}>
        <BarChart data={data} margin={{ top: 2, right: 0, bottom: 0, left: -20 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.04)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="hour"
            tick={{ fontSize: 9, fill: "var(--color-dim)" }}
            axisLine={false}
            tickLine={false}
            interval={3}
          />
          <YAxis
            tick={{ fontSize: 9, fill: "var(--color-dim)" }}
            axisLine={false}
            tickLine={false}
            width={30}
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
            formatter={(value) => [`${value} órdenes`, "Órdenes"]}
          />
          <Bar dataKey="orders" radius={[2, 2, 0, 0]} maxBarSize={12}>
            {data.map((d, i) => (
              <Cell
                key={i}
                fill={
                  d.orders === max
                    ? "var(--color-pink-glow)"
                    : "rgba(244,114,182,0.18)"
                }
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
