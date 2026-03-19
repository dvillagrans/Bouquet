"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import type { DashboardReportData, Period } from "@/actions/reports";

const PERIODS: Period[] = ["Hoy", "Semana", "Mes"];

/* ─── Helpers ──────────────────────────────────────────────────── */
function fmtK(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(0)}k`;
  return `$${Math.round(n)}`;
}

/* ─── Bar Chart (SVG) ──────────────────────────────────────────── */
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  const chartH  = 200;
  const labelH  = 26;
  const yLabelW = 42;
  const barW    = 28;
  const gap     = 9;
  const barsW   = data.length * (barW + gap) - gap;
  const totalW  = yLabelW + barsW;
  const maxVal  = Math.max(...data.map(d => d.value), 1);
  const ticks   = [0.25, 0.5, 0.75, 1.0];

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalW} ${chartH + labelH}`}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      {/* Grid lines + Y labels */}
      {ticks.map(ratio => {
        const y = chartH * (1 - ratio);
        return (
          <g key={ratio}>
            <line
              x1={yLabelW} x2={totalW}
              y1={y} y2={y}
              stroke="var(--color-wire)"
              strokeWidth={ratio === 1 ? 1 : 0.5}
              strokeDasharray={ratio < 1 ? "3 4" : undefined}
            />
            <text
              x={yLabelW - 5}
              y={y + 3.5}
              textAnchor="end"
              fill="var(--color-dim)"
              fontSize="8"
              fontFamily="var(--font-sans, sans-serif)"
              opacity="0.4"
            >
              {fmtK(maxVal * ratio)}
            </text>
          </g>
        );
      })}

      {/* Bars */}
      {data.map(({ label, value }, i) => {
        const barH   = Math.max(value > 0 ? 4 : 2, (value / maxVal) * chartH);
        const x      = yLabelW + i * (barW + gap);
        const y      = chartH - barH;
        const isZero = value === 0;

        return (
          <g
            key={label}
            style={{ animation: `fade-in 0.35s ease-out ${0.04 + i * 0.025}s both` }}
          >
            <rect
              x={x} y={y}
              width={barW} height={barH}
              fill="var(--color-glow)"
              opacity={isZero ? 0.07 : 0.55}
            />
            {!isZero && (
              <rect
                x={x} y={y}
                width={barW} height={3}
                fill="var(--color-glow)"
                opacity={0.95}
              />
            )}
            <text
              x={x + barW / 2}
              y={chartH + labelH - 2}
              textAnchor="middle"
              fill="var(--color-dim)"
              fontSize="8.5"
              fontWeight="600"
              fontFamily="var(--font-sans, sans-serif)"
            >
              {label}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

/* ─── Trend badge ──────────────────────────────────────────────── */
function Trend({ change, up }: { change: string; up: boolean }) {
  if (change === "—") {
    return (
      <span className="flex items-center gap-1 text-[0.61rem] font-semibold text-dim/40">
        <Minus className="h-3 w-3" aria-hidden="true" />
        {change}
      </span>
    );
  }
  return (
    <span className={`flex items-center gap-1 text-[0.61rem] font-semibold ${up ? "text-sage-deep" : "text-ember"}`}>
      {up
        ? <TrendingUp  className="h-3 w-3" aria-hidden="true" />
        : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
      {change}
    </span>
  );
}

/* ─── Main ─────────────────────────────────────────────────────── */
export default function ReportsView({
  reportData,
}: {
  reportData?: DashboardReportData;
}) {
  const [period, setPeriod] = useState<Period>("Hoy");

  const stats    = reportData?.stats[period]     ?? [];
  const topItems = reportData?.topItems[period]  ?? [];
  const chart    = reportData?.chartData[period] ?? [];

  const chartTitle: Record<Period, string> = {
    Hoy:    "Ingresos por hora",
    Semana: "Ingresos por día",
    Mes:    "Ingresos por semana",
  };

  const accentColor = ["bg-glow/30", "bg-glow/20", "bg-sage-deep/30", "bg-sage-deep/20"];

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12">

      {/* ── Header ────────────────────────────────────────────── */}
      <div
        className="mb-10 border-b border-wire pb-8"
        style={{ animation: "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
          Analíticas
        </p>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
            Reportes
          </h1>

          {/* Period pills */}
          <div className="flex gap-1 border border-wire p-1 self-start sm:self-auto">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={[
                  "px-4 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] transition-all duration-150",
                  period === p
                    ? "bg-glow/[0.12] text-glow"
                    : "text-dim hover:text-light",
                ].join(" ")}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div
        className="mb-8 grid grid-cols-2 divide-x divide-y divide-wire border border-wire sm:grid-cols-4 sm:divide-y-0"
        style={{ animation: "reveal-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.08s both" }}
      >
        {stats.map(({ label, value, change, up }, i) => (
          <div
            key={label}
            className="relative overflow-hidden px-6 py-5"
            style={{ animation: `dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s both` }}
          >
            {/* Top accent stripe */}
            <div className={`absolute inset-x-0 top-0 h-[2px] ${accentColor[i]}`} />

            <p className="text-[0.54rem] font-bold uppercase tracking-[0.28em] text-dim">
              {label}
            </p>
            <p className="mt-2 font-serif text-[clamp(1.5rem,2.8vw,2.1rem)] font-semibold leading-none text-light tabular-nums">
              {value}
            </p>
            <div className="mt-2">
              <Trend change={change} up={up} />
            </div>
            <p className="mt-0.5 text-[0.52rem] font-medium text-dim/30">
              vs. período anterior
            </p>
          </div>
        ))}
      </div>

      {/* ── Chart + Top items ─────────────────────────────────── */}
      <div
        className="grid border border-wire lg:grid-cols-[1fr_290px]"
        style={{ animation: "reveal-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.22s both" }}
      >
        {/* Bar chart */}
        <div className="border-b border-wire p-6 lg:border-b-0 lg:border-r">
          <p className="text-[0.48rem] font-bold uppercase tracking-[0.38em] text-dim/40">
            Gráfica
          </p>
          <p className="mt-0.5 mb-6 text-[0.82rem] font-semibold text-light">
            {chartTitle[period]}
          </p>
          <div className="w-full">
            <BarChart data={chart} />
          </div>
        </div>

        {/* Top items */}
        <div className="p-6">
          <p className="text-[0.48rem] font-bold uppercase tracking-[0.38em] text-dim/40">
            Ranking
          </p>
          <p className="mt-0.5 mb-6 text-[0.82rem] font-semibold text-light">
            Platillos más vendidos
          </p>

          {topItems.length === 0 ? (
            <div className="flex h-32 items-center justify-center">
              <p className="text-[0.72rem] font-medium text-dim/30">
                Sin datos para este período.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-5">
              {topItems.map(({ name, sold, revenue, maxSold }, i) => (
                <div
                  key={name}
                  style={{ animation: `dash-row-enter 0.35s cubic-bezier(0.22,1,0.36,1) ${0.08 + i * 0.07}s both` }}
                >
                  {/* Row: rank + name + revenue */}
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <div className="flex items-baseline gap-2 min-w-0">
                      <span className="w-4 shrink-0 font-serif text-[0.8rem] font-semibold tabular-nums text-dim/40">
                        {i + 1}
                      </span>
                      <span className="truncate text-[0.75rem] font-semibold text-light">
                        {name}
                      </span>
                    </div>
                    <span className="shrink-0 font-serif text-[0.78rem] font-semibold text-glow">
                      {revenue}
                    </span>
                  </div>

                  {/* Progress bar + count */}
                  <div className="ml-6 flex items-center gap-2">
                    <div className="h-[3px] flex-1 overflow-hidden bg-wire/60">
                      <div
                        className="h-full bg-glow/60 transition-all duration-700"
                        style={{ width: `${Math.round((sold / (maxSold || 1)) * 100)}%` }}
                      />
                    </div>
                    <span className="shrink-0 text-[0.58rem] font-bold tabular-nums text-dim/50">
                      {sold} uds.
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

    </div>
  );
}
