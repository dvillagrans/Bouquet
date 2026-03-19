"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";

const PERIODS = ["Hoy", "Semana", "Mes"] as const;
type Period = typeof PERIODS[number];

type Stat = { label: string; value: string; change: string; up: boolean };

const STATS_BY_PERIOD: Record<string, Stat[]> = {
  "Hoy": [
    { label: "Ventas totales",  value: "$8,450",   change: "+6.2%",  up: true  },
    { label: "Ticket promedio", value: "$410",     change: "−3.1%",  up: false },
    { label: "Mesas atendidas", value: "21",       change: "+4.8%",  up: true  },
    { label: "Platos vendidos", value: "64",       change: "+11.2%", up: true  },
  ],
  "Semana": [
    { label: "Ventas totales",  value: "$42,500",  change: "+12.5%", up: true  },
    { label: "Ticket promedio", value: "$450",     change: "+5.2%",  up: true  },
    { label: "Mesas atendidas", value: "98",       change: "−2.1%",  up: false },
    { label: "Platos vendidos", value: "312",      change: "+8.4%",  up: true  },
  ],
  "Mes": [
    { label: "Ventas totales",  value: "$168,200", change: "+9.1%",  up: true  },
    { label: "Ticket promedio", value: "$435",     change: "+2.8%",  up: true  },
    { label: "Mesas atendidas", value: "387",      change: "+15.3%", up: true  },
    { label: "Platos vendidos", value: "1,248",    change: "+7.6%",  up: true  },
  ],
};

const TOP_ITEMS_BY_PERIOD: Record<string, { name: string; sold: number; revenue: string }[]> = {
  "Hoy": [
    { name: "Hamburguesa Clásica", sold: 9,   revenue: "$1,620" },
    { name: "Tacos de Ribeye",     sold: 7,   revenue: "$1,750" },
    { name: "Limonada de Menta",   sold: 6,   revenue: "$270"   },
    { name: "Ensalada César",      sold: 4,   revenue: "$480"   },
  ],
  "Semana": [
    { name: "Hamburguesa Clásica", sold: 45,  revenue: "$8,100" },
    { name: "Limonada de Menta",   sold: 32,  revenue: "$1,440" },
    { name: "Tacos de Ribeye",     sold: 28,  revenue: "$7,000" },
    { name: "Ensalada César",      sold: 18,  revenue: "$2,160" },
  ],
  "Mes": [
    { name: "Hamburguesa Clásica", sold: 178, revenue: "$32,040" },
    { name: "Tacos de Ribeye",     sold: 112, revenue: "$28,000" },
    { name: "Limonada de Menta",   sold: 130, revenue: "$5,850"  },
    { name: "Ensalada César",      sold: 74,  revenue: "$8,880"  },
  ],
};

type BarDatum = { label: string; value: number };

const CHART_DATA_BY_PERIOD: Record<string, BarDatum[]> = {
  "Hoy": [
    { label: "12h", value: 580  },
    { label: "13h", value: 1240 },
    { label: "14h", value: 1580 },
    { label: "15h", value: 720  },
    { label: "16h", value: 320  },
    { label: "17h", value: 280  },
    { label: "18h", value: 510  },
    { label: "19h", value: 980  },
    { label: "20h", value: 1320 },
    { label: "21h", value: 780  },
    { label: "22h", value: 140  },
  ],
  "Semana": [
    { label: "Lun", value: 4200 },
    { label: "Mar", value: 5800 },
    { label: "Mié", value: 6300 },
    { label: "Jue", value: 5900 },
    { label: "Vie", value: 8500 },
    { label: "Sáb", value: 9200 },
    { label: "Dom", value: 2600 },
  ],
  "Mes": [
    { label: "Sem 1", value: 38200 },
    { label: "Sem 2", value: 42100 },
    { label: "Sem 3", value: 45600 },
    { label: "Sem 4", value: 42300 },
  ],
};

/* ─── SVG Bar Chart ──────────────────────────────────────────────── */
function BarChart({ data }: { data: BarDatum[] }) {
  const chartH  = 160;
  const labelH  = 22;
  const barW    = 32;
  const gap     = 10;
  const totalW  = data.length * (barW + gap) - gap;
  const totalH  = chartH + labelH;
  const maxVal  = Math.max(...data.map(d => d.value));

  const gridRatios = [0.25, 0.5, 0.75, 1];

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${totalW} ${totalH}`}
      preserveAspectRatio="xMidYMax meet"
      aria-hidden="true"
    >
      {/* Grid lines */}
      {gridRatios.map(ratio => {
        const y = chartH * (1 - ratio);
        return (
          <line
            key={ratio}
            x1={0} x2={totalW}
            y1={y} y2={y}
            stroke="var(--color-wire)"
            strokeWidth="0.75"
          />
        );
      })}

      {/* Bars + labels */}
      {data.map(({ label, value }, i) => {
        const barH = Math.max(2, (value / maxVal) * chartH);
        const x    = i * (barW + gap);
        const y    = chartH - barH;

        return (
          <g
            key={label}
            style={{ animation: `fade-in 0.35s ease-out ${0.05 + i * 0.04}s both` }}
          >
            {/* Bar shadow / depth */}
            <rect
              x={x + 1} y={y + 2}
              width={barW} height={barH}
              fill="var(--color-glow)"
              opacity="0.08"
            />
            {/* Main bar */}
            <rect
              x={x} y={y}
              width={barW} height={barH}
              fill="var(--color-glow)"
              opacity="0.65"
            />
            {/* Top highlight */}
            <rect
              x={x} y={y}
              width={barW} height={2}
              fill="var(--color-glow)"
              opacity="0.9"
            />
            {/* Label */}
            <text
              x={x + barW / 2}
              y={chartH + labelH - 2}
              textAnchor="middle"
              fill="var(--color-dim)"
              fontSize="9"
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

/* ─── Main component ─────────────────────────────────────────────── */
export default function ReportsView() {
  const [period, setPeriod] = useState<Period>("Hoy");
  const stats     = STATS_BY_PERIOD[period];
  const topItems  = TOP_ITEMS_BY_PERIOD[period];
  const chartData = CHART_DATA_BY_PERIOD[period];

  const chartTitle: Record<Period, string> = {
    "Hoy":    "Ingresos por hora",
    "Semana": "Ingresos por día",
    "Mes":    "Ingresos por semana",
  };

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
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
            Reportes
          </h1>

          {/* Period tabs */}
          <div className="flex border-b border-wire">
            {PERIODS.map(p => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={[
                  "px-5 pb-3 pt-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] transition-colors",
                  period === p
                    ? "border-b-[1.5px] border-glow text-glow"
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
      <div className="mb-10 grid grid-cols-2 divide-x divide-y divide-wire border border-wire sm:grid-cols-4 sm:divide-y-0">
        {stats.map(({ label, value, change, up }, i) => (
          <div
            key={label}
            className="px-6 py-5"
            style={{ animation: `dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s both` }}
          >
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">{label}</p>
            <p className="mt-1 font-serif text-[2rem] font-semibold leading-none text-light">{value}</p>
            <p className={`mt-2 flex items-center gap-1 text-[0.62rem] font-semibold ${up ? "text-sage-deep" : "text-ember"}`}>
              {up
                ? <TrendingUp  className="h-3 w-3" aria-hidden="true" />
                : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
              {change}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts row ────────────────────────────────────────── */}
      <div
        className="grid gap-6 lg:grid-cols-[1fr_280px]"
        style={{ animation: "reveal-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.35s both" }}
      >
        {/* Bar chart */}
        <div className="border border-wire p-6">
          <p className="mb-6 text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">
            {chartTitle[period]}
          </p>
          <div className="min-h-[200px] w-full">
            <BarChart data={chartData} />
          </div>
        </div>

        {/* Top dishes */}
        <div className="border border-wire p-6">
          <p className="mb-6 text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">
            Platillos top
          </p>
          <div className="divide-y divide-wire">
            {topItems.map(({ name, sold, revenue }, i) => (
              <div key={name} className="flex items-center gap-4 py-3">
                <span className="w-5 shrink-0 font-serif text-[0.9rem] font-semibold tabular-nums text-dim">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-[0.78rem] font-semibold text-light">{name}</p>
                  <p className="text-[0.62rem] font-medium text-dim">{sold} vendidos</p>
                </div>
                <span className="shrink-0 font-serif text-[0.85rem] font-semibold text-sage-deep">
                  {revenue}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
