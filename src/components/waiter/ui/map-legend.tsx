"use client";

import type { TableStatus } from "@/generated/prisma";
import { StatusDot } from "./status-dot";

const ROWS: { status: TableStatus; label: string }[] = [
  { status: "DISPONIBLE", label: "Libre" },
  { status: "OCUPADA", label: "Activa" },
  { status: "CERRANDO", label: "Cuenta" },
  { status: "SUCIA", label: "Limpieza" },
];

export function MapLegend({ showCapacity, onToggleCapacity }: { showCapacity: boolean; onToggleCapacity: () => void }) {
  return (
    <div className="w-full rounded-[1.25rem] border border-border-main/70 bg-bg-solid/85 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
      <div className="rounded-[calc(1.25rem-0.375rem)] border border-border-main/45 bg-bg-card/95 px-3 py-2.5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
        <p className="font-mono text-[9px] font-bold uppercase tracking-[0.2em] text-text-muted">Leyenda</p>
        <ul className="mt-2 space-y-1.5">
          {ROWS.map((row) => (
            <li key={row.status} className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.12em] text-text-muted">
              <StatusDot status={row.status} aria-hidden />
              <span className="text-light">{row.label}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={onToggleCapacity}
          className="mt-3 w-full rounded-full border border-border-main py-2 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-text-muted transition hover:border-border-bright hover:text-light active:scale-[0.98]"
        >
          {showCapacity ? "Ocultar capacidad" : "Mostrar capacidad"}
        </button>
      </div>
    </div>
  );
}
