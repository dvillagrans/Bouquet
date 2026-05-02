"use client";

import { motion } from "framer-motion";
import { Sparkline } from "./Sparkline";

interface SuperKpiCardProps {
  label: string;
  value: string;
  delta?: string;
  deltaTone?: "green" | "amber" | "red";
  unit?: string;
  trend?: number[];
  accent?: "pink" | "blue" | "green";
  delay?: number;
}

const accentColors: Record<string, string> = {
  pink: "var(--color-pink-glow)",
  blue: "var(--color-dash-blue)",
  green: "var(--color-dash-green)",
};

const deltaClasses: Record<string, string> = {
  green: "text-dash-green",
  amber: "text-dash-amber",
  red: "text-pink-light-glow",
};

export function SuperKpiCard({
  label,
  value,
  delta,
  deltaTone = "green",
  unit,
  trend,
  accent = "pink",
  delay = 0,
}: SuperKpiCardProps) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 24 },
        show: {
          opacity: 1,
          y: 0,
          transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1], delay: delay / 1000 },
        },
      }}
      className="bq-card flex flex-col justify-between p-5"
    >
      {/* Top: label and delta */}
      <div className="flex items-start justify-between gap-2">
        <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
          {label}
        </span>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.08em] ${
              deltaClasses[deltaTone] ?? "text-dim"
            }`}
            style={{
              background:
                deltaTone === "green"
                  ? "var(--color-dash-green-bg)"
                  : deltaTone === "amber"
                    ? "var(--color-dash-amber-bg)"
                    : "var(--color-dash-red-bg)",
            }}
          >
            <span
              className="inline-block h-1 w-1 rounded-full"
              style={{
                background:
                  deltaTone === "green"
                    ? "var(--color-dash-green)"
                    : deltaTone === "amber"
                      ? "var(--color-dash-amber)"
                      : "var(--color-pink-light-glow)",
              }}
            />
            {delta}
          </span>
        )}
      </div>

      {/* Value */}
      <div className="mt-2">
        <p className="font-serif text-[1.75rem] font-medium leading-none tracking-[-0.02em] text-light tabular-nums">
          {value}
        </p>
        {unit && (
          <p className="mt-1 font-mono text-[9px] tracking-[0.15em] text-dim">
            {unit}
          </p>
        )}
      </div>

      {/* Sparkline */}
      {trend && trend.length > 0 && (
        <div className="mt-3">
          <Sparkline
            data={trend}
            w={120}
            h={28}
            fill
            color={accentColors[accent] ?? accentColors.pink}
          />
        </div>
      )}
    </motion.article>
  );
}
