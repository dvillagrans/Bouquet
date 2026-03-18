"use client";

import { useState, useTransition } from "react";
import { Plus, Trash2, Search, QrCode } from "lucide-react";
import { createTable, deleteTable } from "@/actions/tables";
import { Table, TableStatus } from "@/generated/prisma";

const STATUS_STYLES: Record<TableStatus, string> = {
  DISPONIBLE: "text-sage-deep border-sage-deep/40",
  OCUPADA:    "text-glow border-glow/40",
  SUCIA:      "text-ember border-ember/40",
};

const STATUS_LABEL: Record<TableStatus, string> = {
  DISPONIBLE: "Disponible",
  OCUPADA:    "Ocupada",
  SUCIA:      "Por limpiar",
};

const STATUS_DOT: Record<TableStatus, string> = {
  DISPONIBLE: "bg-sage-deep",
  OCUPADA:    "bg-glow",
  SUCIA:      "bg-ember",
};

export default function TableManager({ initialTables }: { initialTables: Table[] }) {
  const [tables, setTables]         = useState<Table[]>(initialTables);
  const [search, setSearch]         = useState("");
  const [isAdding, setIsAdding]     = useState(false);
  const [newTableCap, setNewTableCap] = useState(4);
  const [isPending, startTransition] = useTransition();

  const filtered = tables.filter(t =>
    t.number.toString().includes(search) ||
    t.qrCode.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreate() {
    startTransition(async () => {
      const newTable = await createTable(newTableCap);
      setTables(prev => [...prev, newTable]);
      setIsAdding(false);
      setNewTableCap(4);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTable(id);
      setTables(prev => prev.filter(t => t.id !== id));
    });
  }

  const stats = [
    { label: "Total",       value: tables.length },
    { label: "Disponibles", value: tables.filter(t => t.status === "DISPONIBLE").length },
    { label: "Ocupadas",    value: tables.filter(t => t.status === "OCUPADA").length },
    { label: "Por limpiar", value: tables.filter(t => t.status === "SUCIA").length },
  ];

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-10 border-b border-wire pb-8" style={{ animation: "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
          Gestión de mesas
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
            Mesas & QR
          </h1>
          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative flex-1 sm:flex-none">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim/50" aria-hidden="true" />
              <input
                type="text"
                placeholder="Mesa o código…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-10 w-full border border-wire bg-transparent pl-8 pr-4 text-[0.78rem] text-light placeholder:text-dim/40 outline-none transition-colors focus:border-light/20 sm:w-52"
              />
            </div>
            {/* Add */}
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex h-10 items-center gap-2 border border-wire px-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-all duration-200 hover:border-light/20 hover:text-light hover:-translate-y-px active:translate-y-0"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Nueva mesa
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <div className="mb-10 grid grid-cols-2 divide-x divide-y divide-wire border border-wire sm:grid-cols-4 sm:divide-y-0">
        {stats.map(({ label, value }, i) => (
          <div key={label} className="px-6 py-5" style={{ animation: `dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s both` }}>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">{label}</p>
            <p className="mt-1 font-serif text-[2rem] font-semibold leading-none text-light">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Modal: nueva mesa ───────────────────────────────── */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6" style={{ animation: "fade-in 0.2s ease-out both" }}>
          <div className="w-full max-w-sm border border-wire bg-canvas p-8" style={{ animation: "scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both" }}>
            <p className="mb-1 text-[0.52rem] font-bold uppercase tracking-[0.44em] text-dim">Nueva mesa</p>
            <h2 className="mb-8 font-serif text-[1.6rem] font-medium leading-none text-light">
              Capacidad
            </h2>

            <div className="flex gap-2">
              {[2, 4, 6, 8, 10].map(cap => (
                <button
                  key={cap}
                  onClick={() => setNewTableCap(cap)}
                  className={[
                    "flex-1 py-3 text-[0.78rem] font-bold transition-colors",
                    newTableCap === cap
                      ? "bg-glow text-ink"
                      : "border border-wire text-dim hover:border-light/20 hover:text-light",
                  ].join(" ")}
                >
                  {cap}
                </button>
              ))}
            </div>

            <p className="mt-4 text-[0.62rem] font-medium text-dim/50">
              El código QR se generará automáticamente.
            </p>

            <div className="mt-8 flex gap-3">
              <button
                onClick={() => setIsAdding(false)}
                className="flex-1 border border-wire py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreate}
                disabled={isPending}
                className="flex-1 bg-light py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-ink transition-all duration-200 hover:-translate-y-px hover:bg-light/90 active:translate-y-0 disabled:opacity-50"
              >
                {isPending ? "Creando..." : "Crear mesa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Table list ──────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-wire py-16 text-center">
          <p className="text-[0.8rem] font-medium text-dim">No se encontraron mesas.</p>
          <button onClick={() => setSearch("")} className="mt-3 text-[0.72rem] font-semibold text-glow underline underline-offset-4">
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="divide-y divide-wire border-t border-wire">
          {filtered.map((table, i) => (
            <div
              key={table.id}
              className="group flex items-center gap-6 py-4 transition-colors duration-150 hover:bg-ink/40"
              style={{ animation: `dash-row-enter 0.35s cubic-bezier(0.22,1,0.36,1) ${0.22 + Math.min(i * 0.05, 0.25)}s both` }}
            >
              {/* Number */}
              <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-wire text-[0.9rem] font-bold text-light">
                {table.number}
              </div>

              {/* Status */}
              <div className={`flex items-center gap-2 w-32 shrink-0`}>
                <span
                  className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[table.status]}`}
                  aria-hidden="true"
                  style={table.status === "OCUPADA" ? { animation: "pulse-slow 2.4s ease-in-out infinite" } : undefined}
                />
                <span className={`text-[0.65rem] font-bold uppercase tracking-[0.2em] border px-2 py-0.5 ${STATUS_STYLES[table.status]}`}>
                  {STATUS_LABEL[table.status]}
                </span>
              </div>

              {/* Capacity */}
              <div className="hidden w-24 shrink-0 sm:block">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.24em] text-dim">Asientos</p>
                <p className="mt-0.5 font-serif text-[1.1rem] font-semibold text-light">{table.capacity}</p>
              </div>

              {/* Code */}
              <div className="flex-1">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.24em] text-dim">Código QR</p>
                <p className="mt-0.5 font-mono text-[0.9rem] font-semibold text-light/60">{table.qrCode}</p>
              </div>

              {/* Actions — always visible on touch, hover-reveal on desktop */}
              <div className="flex items-center gap-2 opacity-100 transition-opacity duration-150 lg:opacity-0 lg:group-hover:opacity-100">
                <button
                  onClick={() => window.open(`/mesa/${table.qrCode}/menu`, "_blank")}
                  className="inline-flex h-9 items-center gap-2 border border-wire px-3 text-[0.65rem] font-bold uppercase tracking-[0.16em] text-dim transition-colors hover:border-light/20 hover:text-light"
                >
                  <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                  Ver menú
                </button>
                <button
                  onClick={() => handleDelete(table.id)}
                  aria-label={`Eliminar mesa ${table.number}`}
                  className="flex h-9 w-9 items-center justify-center border border-wire text-dim transition-colors hover:border-ember/40 hover:text-ember"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
