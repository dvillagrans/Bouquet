"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { DeltaBadge } from "./DeltaBadge";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function generateHourly8(total: number): number[] {
  if (total <= 0) return Array.from({ length: 8 }, () => 0);
  const base = total / 8;
  return Array.from({ length: 8 }, (_, i) => {
    const factor = 0.4 + ((i * 7 + 3) % 10) * 0.12;
    return Math.max(0, Math.round(base * factor));
  });
}

interface DualSparklineProps {
  todayData: number[];
  yesterdayData: number[];
  className?: string;
}

function DualSparkline({ todayData, yesterdayData, className }: DualSparklineProps) {
  const hasToday = todayData.length > 0 && todayData.some((d) => d > 0);
  const hasYesterday = yesterdayData.length > 0 && yesterdayData.some((d) => d > 0);

  if (!hasToday && !hasYesterday) {
    return (
      <div className={cn("flex items-center justify-center text-[12px] text-dim", className)}>
        Datos por hora no disponibles
      </div>
    );
  }

  const w = 280;
  const h = 80;
  const pad = 4;

  const allValues = [...todayData, ...yesterdayData].filter((v) => v > 0);
  const max = Math.max(...allValues, 1);
  const min = Math.min(...allValues, 0);
  const range = max - min || 1;

  const toPoints = (data: number[]) =>
    data
      .map(
        (v, i) =>
          `${(i / (data.length - 1)) * (w - pad * 2) + pad},${h - pad - ((v - min) / range) * (h - pad * 2)}`
      )
      .join(" ");

  const todayPoints = hasToday ? toPoints(todayData) : "";
  const yesterdayPoints = hasYesterday ? toPoints(yesterdayData) : "";

  return (
    <svg
      width="100%"
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      {/* Today fill */}
      {hasToday && (
        <defs>
          <linearGradient id="hero-spark-today" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-pink-glow)" stopOpacity={0.22} />
            <stop offset="100%" stopColor="var(--color-pink-glow)" stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {hasToday && (
        <polygon
          points={`0,${h} ${todayPoints} ${w},${h}`}
          fill="url(#hero-spark-today)"
        />
      )}
      {/* Yesterday line */}
      {hasYesterday && (
        <polyline
          points={yesterdayPoints}
          fill="none"
          stroke="var(--color-dim)"
          strokeWidth={1.4}
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="3 3"
          opacity={0.6}
        />
      )}
      {/* Today line */}
      {hasToday && (
        <polyline
          points={todayPoints}
          fill="none"
          stroke="var(--color-pink-glow)"
          strokeWidth={1.6}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
}

export interface DayHeroCardProps {
  totalRevenue: number;
  yesterdayRevenue: number;
  currency: string;
}

export function DayHeroCard({ totalRevenue, yesterdayRevenue, currency }: DayHeroCardProps) {
  const mockToday = useMemo(() => generateHourly8(totalRevenue), [totalRevenue]);
  const mockYesterday = useMemo(() => generateHourly8(yesterdayRevenue), [yesterdayRevenue]);

  return (
    <article className="bq-card flex flex-col p-4 sm:p-5">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
            Ventas del día
          </p>
          <p className="text-[32px] sm:text-[40px] font-light tracking-[-0.02em] tabular-nums text-light mt-1">
            {fmt(totalRevenue)}
          </p>
          <div className="mt-1 flex items-center gap-2">
            <DeltaBadge
              value={totalRevenue}
              previousValue={yesterdayRevenue}
            />
            <span className="text-[12px] opacity-60">{currency}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <DualSparkline todayData={mockToday} yesterdayData={mockYesterday} />
      </div>

      <div className="mt-2 flex items-center gap-3 text-[10px] text-dim">
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1 w-4 rounded-full bg-pink-glow" />
          Hoy
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1 w-4 rounded-full bg-dim" style={{ backgroundImage: "repeating-linear-gradient(90deg, var(--color-dim) 0px, var(--color-dim) 3px, transparent 3px, transparent 6px)" }} />
          Ayer
        </span>
      </div>
    </article>
  );
}
