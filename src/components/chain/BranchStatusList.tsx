"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import type { RestaurantSummary } from "@/actions/chain";
import type { ChainDashboardData } from "@/actions/chain";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export interface BranchStatusListProps {
  branches: RestaurantSummary[];
  alerts: ChainDashboardData["alerts"];
}

export function BranchStatusList({ branches, alerts }: BranchStatusListProps) {
  const router = useRouter();

  const alertMap = useMemo(() => {
    const map = new Map<string, ChainDashboardData["alerts"][number]>();
    for (const a of alerts) {
      map.set(a.id, a);
    }
    return map;
  }, [alerts]);

  const sorted = useMemo(() => {
    const enriched = branches.map((b) => ({
      ...b,
      alert: alertMap.get(b.id) ?? null,
    }));
    return enriched.sort((a, b) => {
      const aAlert = a.alert ? 1 : 0;
      const bAlert = b.alert ? 1 : 0;
      if (aAlert !== bAlert) return bAlert - aAlert;
      return b.todayRevenue - a.todayRevenue;
    });
  }, [branches, alertMap]);

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
        <p className="text-[13px] font-bold uppercase tracking-[0.12em] text-light">
          Estado de sucursales
        </p>
        <p className="text-[12px] opacity-60 mt-0.5">
          {sorted.length} sucursales · {alerts.length} alerta{alerts.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex flex-col">
        {sorted.map((branch) => {
          const hasData = branch.todayRevenue > 0 || branch.totalTables > 0;
          const isAlert = !!branch.alert;
          const statusColor = isAlert
            ? "bg-dash-amber"
            : hasData
              ? "bg-dash-green"
              : "bg-dim";
          const statusText = isAlert
            ? "Requiere atención"
            : hasData
              ? "Operando"
              : "Sin datos";

          return (
            <button
              key={branch.id}
              type="button"
              onClick={() => router.push(`/dashboard?restaurantId=${branch.id}`)}
              className={cn(
                "flex flex-col items-stretch text-left border-b border-white/[0.04] transition-colors hover:bg-white/[0.015] focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none touch-manipulation",
                "min-h-[56px] px-3 py-2.5 sm:px-4 sm:py-3"
              )}
              aria-label={`Ver detalle de ${branch.name}, ${statusText}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn("h-2 w-2 shrink-0 rounded-full", statusColor)}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-light">
                  {branch.name}
                </span>
                <span className="shrink-0 font-mono text-[13px] tabular-nums text-light">
                  {branch.todayRevenue > 0 ? fmt(branch.todayRevenue) : "—"}
                </span>
                <span className="shrink-0 text-[11px] text-dim">
                  {branch.activeTables}/{branch.totalTables} mesas
                </span>
              </div>
              {branch.alert && (
                <div className="mt-1 pl-5 text-[11px] text-dash-amber/90">
                  {branch.alert.message}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </section>
  );
}
