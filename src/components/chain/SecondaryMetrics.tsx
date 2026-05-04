"use client";

import { DeltaBadge } from "./DeltaBadge";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export interface SecondaryMetricsProps {
  avgTicket: number;
  yesterdayAvgTicket: number;
  activeTables: number;
  totalTables: number;
  totalSessions: number;
  yesterdaySessions: number;
}

export function SecondaryMetrics({
  avgTicket,
  yesterdayAvgTicket,
  activeTables,
  totalTables,
  totalSessions,
  yesterdaySessions,
}: SecondaryMetricsProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pr-4 pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
      {/* Average Ticket */}
      <div className="bq-card flex min-w-[160px] flex-1 flex-col p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
          Ticket promedio
        </p>
        <p className="text-[22px] sm:text-[28px] font-light tracking-[-0.02em] tabular-nums text-light mt-1">
          {avgTicket > 0 ? fmt(avgTicket) : "—"}
        </p>
        <div className="mt-1">
          <DeltaBadge
            value={avgTicket}
            previousValue={yesterdayAvgTicket}
            compact
          />
        </div>
      </div>

      {/* Active Tables */}
      <div className="bq-card flex min-w-[160px] flex-1 flex-col p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
          Mesas activas
        </p>
        <p className="text-[22px] sm:text-[28px] font-light tracking-[-0.02em] tabular-nums text-light mt-1">
          {activeTables}
        </p>
        <p className="text-[12px] opacity-60 mt-1">
          {totalTables > 0 ? `${Math.round((activeTables / totalTables) * 100)}% ocupación` : "Sin mesas"}
        </p>
      </div>

      {/* Closed Orders (sessions proxy) */}
      <div className="bq-card flex min-w-[160px] flex-1 flex-col p-4">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-50">
          Sesiones hoy
        </p>
        <p className="text-[22px] sm:text-[28px] font-light tracking-[-0.02em] tabular-nums text-light mt-1">
          {totalSessions}
        </p>
        <div className="mt-1">
          <DeltaBadge
            value={totalSessions}
            previousValue={yesterdaySessions}
            compact
          />
        </div>
      </div>
    </div>
  );
}
