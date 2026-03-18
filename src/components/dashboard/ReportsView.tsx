"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const PERIODS = ["Hoy", "Semana", "Mes"] as const;
type Period = typeof PERIODS[number];

const stats = [
  { label: "Ventas totales",   value: "$42,500", change: "+12.5%", up: true  },
  { label: "Ticket promedio",  value: "$450",    change: "+5.2%",  up: true  },
  { label: "Mesas atendidas",  value: "98",      change: "−2.1%",  up: false },
  { label: "Platos vendidos",  value: "312",     change: "+8.4%",  up: true  },
];

const topItems = [
  { name: "Hamburguesa Clásica", sold: 45, revenue: "$8,100" },
  { name: "Limonada de Menta",   sold: 32, revenue: "$1,440" },
  { name: "Tacos de Ribeye",     sold: 28, revenue: "$7,000" },
  { name: "Ensalada César",      sold: 18, revenue: "$2,160" },
];

export default function ReportsView() {
  const [period, setPeriod] = useState<Period>("Hoy");

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-10 border-b border-wire pb-8" style={{ animation: "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
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

      {/* ── Stats strip ─────────────────────────────────────── */}
      <div className="mb-10 grid grid-cols-2 divide-x divide-y divide-wire border border-wire sm:grid-cols-4 sm:divide-y-0">
        {stats.map(({ label, value, change, up }, i) => (
          <div key={label} className="px-6 py-5" style={{ animation: `dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s both` }}>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">{label}</p>
            <p className="mt-1 font-serif text-[2rem] font-semibold leading-none text-light">{value}</p>
            <p className={`mt-2 flex items-center gap-1 text-[0.62rem] font-semibold ${up ? "text-sage-deep" : "text-ember"}`}>
              {up
                ? <TrendingUp className="h-3 w-3" aria-hidden="true" />
                : <TrendingDown className="h-3 w-3" aria-hidden="true" />}
              {change}
            </p>
          </div>
        ))}
      </div>

      {/* ── Charts row ──────────────────────────────────────── */}
      <div className="grid gap-6 lg:grid-cols-[1fr_280px]" style={{ animation: "reveal-up 0.45s cubic-bezier(0.22,1,0.36,1) 0.35s both" }}>

        {/* Chart placeholder */}
        <div className="border border-wire p-6">
          <p className="mb-6 text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">
            Ingresos por hora
          </p>
          <div className="flex min-h-[280px] flex-col items-center justify-center gap-3 border border-dashed border-wire/50">
            <Activity className="h-6 w-6 text-dim/30" aria-hidden="true" />
            <p className="text-[0.72rem] font-medium text-dim/40">Recharts · próximamente</p>
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
