"use client";

import { useMemo } from "react";
import type { RestaurantSummary } from "@/actions/chain";
import { DeltaBadge } from "./DeltaBadge";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export interface RankingTableProps {
  branches: RestaurantSummary[];
  currency: string;
}

export function RankingTable({ branches, currency }: RankingTableProps) {
  const sorted = useMemo(() => {
    return [...branches].sort((a, b) => b.todayRevenue - a.todayRevenue);
  }, [branches]);

  const maxRevenue = useMemo(() => {
    if (sorted.length === 0) return 1;
    return Math.max(...sorted.map((b) => b.todayRevenue), 1);
  }, [sorted]);

  if (sorted.length === 0) {
    return (
      <div className="bq-card p-5">
        <p className="text-[13px] text-dim">Sin sucursales. Añade la primera.</p>
      </div>
    );
  }

  return (
    <section className="bq-card flex flex-col !p-0 overflow-hidden">
      <div className="border-b border-wire px-4 py-3.5">
        <p className="text-[18px] sm:text-[22px] font-medium leading-[1.15] tracking-[-0.015em] text-light">
          ¿Quién lidera hoy?
        </p>
        <p className="text-[12px] opacity-60 mt-0.5">
          {sorted.length} sucursales · {currency}
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.04] bg-white/[0.01]">
              <th className="w-8 px-3 py-2.5 sm:px-4 sm:py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-dim">
                #
              </th>
              <th className="px-3 py-2.5 sm:px-4 sm:py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-dim">
                Sucursal
              </th>
              <th className="w-20 sm:w-24 px-3 py-2.5 sm:px-4 sm:py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-dim text-right">
                HOY $
              </th>
              <th className="w-16 sm:w-20 px-3 py-2.5 sm:px-4 sm:py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-dim text-right">
                Δ%
              </th>
              <th className="w-20 sm:w-24 px-3 py-2.5 sm:px-4 sm:py-3 text-[9px] font-bold uppercase tracking-[0.2em] text-dim text-right">
                Mesas
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.02]">
            {sorted.map((b, i) => {
              const progressPct = maxRevenue > 0 ? (b.todayRevenue / maxRevenue) * 100 : 0;
              // No per-branch yesterday data available in API; show missing indicator
              const deltaPct = null;

              return (
                <tr
                  key={b.id}
                  className="group hover:bg-white/[0.015] transition-colors"
                  style={{ animation: `dash-row-enter 500ms ${i * 55}ms ease both` }}
                >
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <span className="font-mono text-[10px] text-dim">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3">
                    <div className="flex flex-col gap-1.5 min-w-0">
                      <span className="text-[13px] font-medium text-light truncate">
                        {b.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                          <span
                            className="block h-full rounded-full bg-pink-glow/70"
                            style={{ width: `${Math.max(2, progressPct)}%` }}
                          />
                        </span>
                        <span className="font-mono text-[9px] tabular-nums text-dim w-8 text-right">
                          {progressPct.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right">
                    <span className="font-mono text-[13px] tabular-nums text-light">
                      {fmt(b.todayRevenue)}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right">
                    <DeltaBadge percentage={deltaPct} />
                  </td>
                  <td className="px-3 py-2.5 sm:px-4 sm:py-3 text-right">
                    <span className="text-[12px] text-dim">
                      {b.activeTables}/{b.totalTables}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="border-t border-wire px-4 py-2.5">
        <span className="font-mono text-[9px] tracking-[0.15em] text-dim">
          {sorted.length} sucursales activas
        </span>
      </div>
    </section>
  );
}
