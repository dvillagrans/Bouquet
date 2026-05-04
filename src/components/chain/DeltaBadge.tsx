"use client";

import { cn } from "@/lib/utils";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

export interface DeltaBadgeProps {
  /** Current absolute value for computing delta */
  value?: number | null;
  /** Previous absolute value for computing delta */
  previousValue?: number | null;
  /** Pre-computed percentage override */
  percentage?: number | null;
  /** Show compact numbers */
  compact?: boolean;
  className?: string;
}

export function DeltaBadge({
  value,
  previousValue,
  percentage,
  compact: compactMode,
  className,
}: DeltaBadgeProps) {
  // Missing data guard
  const hasValue = value != null && !Number.isNaN(value);
  const hasPrevious = previousValue != null && !Number.isNaN(previousValue) && previousValue !== 0;
  const hasPercentage = percentage != null && !Number.isNaN(percentage);

  const isMissing = !hasValue && !hasPrevious && !hasPercentage;

  let pct = 0;
  let absDelta = 0;
  let displayText = "";

  if (isMissing) {
    displayText = "—";
  } else if (hasPercentage) {
    pct = percentage;
    const sign = pct > 0 ? "+" : pct < 0 ? "" : "";
    displayText = `${sign}${pct.toFixed(1)}%`;
  } else if (hasValue && hasPrevious) {
    pct = ((value - previousValue) / previousValue) * 100;
    absDelta = value - previousValue;
    const sign = pct >= 0 ? "+" : "";
    const absText = compactMode ? compact(Math.abs(absDelta)) : fmt(Math.abs(absDelta));
    const prefix = absDelta >= 0 ? "+" : "−";
    displayText = `${prefix}${absText} (${sign}${pct.toFixed(1)}%)`;
  } else if (hasValue && !hasPrevious) {
    displayText = "—";
  } else {
    displayText = "—";
  }

  const isPositive = pct > 0;
  const isNegative = pct < 0;
  const isZero = pct === 0;

  let colorClass = "text-dim";
  let bgClass = "bg-white/[0.04]";
  let dotClass = "bg-dim";

  if (isMissing || isZero) {
    colorClass = "text-dim";
    bgClass = "bg-white/[0.04]";
    dotClass = "bg-dim";
  } else if (isPositive) {
    colorClass = "text-emerald-400";
    bgClass = "bg-emerald-400/10";
    dotClass = "bg-emerald-400";
  } else if (isNegative) {
    colorClass = "text-red-400";
    bgClass = "bg-red-400/10";
    dotClass = "bg-red-400";
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold tracking-[0.08em]",
        colorClass,
        bgClass,
        className
      )}
    >
      {!isMissing && (
        <span className={cn("inline-block h-1 w-1 rounded-full", dotClass)} />
      )}
      {displayText}
    </span>
  );
}
