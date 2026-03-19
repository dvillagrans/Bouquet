"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { Plus, Trash2, Search, QrCode, Users, Map, LayoutGrid } from "lucide-react";
import { createTable, deleteTable } from "@/actions/tables";
import { Table, TableStatus } from "@/generated/prisma";
import FloorMapClient from "./FloorMapClient";

type Tab = "mapa" | "lista";

const STATUS_DOT: Record<TableStatus, string> = {
  DISPONIBLE: "bg-sage-deep",
  OCUPADA: "bg-glow",
  SUCIA: "bg-ember",
};

const STATUS_TEXT: Record<TableStatus, string> = {
  DISPONIBLE: "text-sage-deep",
  OCUPADA: "text-glow",
  SUCIA: "text-ember",
};

const STATUS_LABEL: Record<TableStatus, string> = {
  DISPONIBLE: "Disponible",
  OCUPADA: "Ocupada",
  SUCIA: "Por limpiar",
};

const CARD_BORDER: Record<TableStatus, string> = {
  DISPONIBLE: "border-wire hover:border-sage-deep/40",
  OCUPADA: "border-glow/30 hover:border-glow/60",
  SUCIA: "border-ember/30 hover:border-ember/60",
};

const CARD_BG: Record<TableStatus, string> = {
  DISPONIBLE: "",
  OCUPADA: "bg-glow/[0.025]",
  SUCIA: "bg-ember/[0.025]",
};

export default function TableManagerClient({ initialTables }: { initialTables: Table[] }) {
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [tab, setTab] = useState<Tab>("mapa");
  const [showMap, setShowMap] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newTableCap, setNewTableCap] = useState(4);
  const [isPending, startTransition] = useTransition();

  // Detectar móvil para "ahorrar" recursos: evitar montar Konva automáticamente.
  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();

    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }

    // Fallback legacy (Safari/older).
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

  // En escritorio: renderizar el mapa tras el primer paint para mejorar LCP.
  useEffect(() => {
    if (isMobile !== false) return;

    const id = requestAnimationFrame(() => setShowMap(true));
    return () => cancelAnimationFrame(id);
  }, [isMobile]);

  const filtered = useMemo(
    () =>
      tables.filter(
        (t) =>
          t.number.toString().includes(search) ||
          t.qrCode.toLowerCase().includes(search.toLowerCase()),
      ),
    [tables, search],
  );

  function handleCreate() {
    startTransition(async () => {
      const newTable = await createTable(newTableCap);
      setTables((prev) => [...prev, newTable]);
      setIsAdding(false);
      setNewTableCap(4);
    });
  }

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteTable(id);
      setTables((prev) => prev.filter((t) => t.id !== id));
    });
  }

  const stats = useMemo(() => {
    let disponibles = 0, ocupadas = 0, sucias = 0;
    for (const t of tables) {
      if (t.status === "DISPONIBLE") disponibles++;
      else if (t.status === "OCUPADA") ocupadas++;
      else sucias++;
    }
    return [
      { label: "Total",       value: tables.length },
      { label: "Disponibles", value: disponibles    },
      { label: "Ocupadas",    value: ocupadas       },
      { label: "Por limpiar", value: sucias         },
    ];
  }, [tables]);

  return (
    <>
      {/* Controles (búsqueda + creación) */}
      <div className="mb-10 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 sm:flex-none">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim/50" aria-hidden="true" />
          <input
            type="text"
            placeholder="Mesa o código…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-10 w-full border border-wire bg-transparent pl-8 pr-4 text-[0.78rem] text-light placeholder:text-dim/40 outline-none transition-colors focus:border-light/20 sm:w-52"
          />
        </div>
        <button
          onClick={() => setIsAdding(true)}
          className="inline-flex h-10 items-center gap-2 border border-wire px-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-all duration-200 hover:border-light/20 hover:text-light hover:-translate-y-px active:translate-y-0"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" />
          Nueva mesa
        </button>
      </div>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div className="mb-10 grid grid-cols-2 divide-x divide-y divide-wire border border-wire sm:grid-cols-4 sm:divide-y-0">
        {stats.map(({ label, value }, i) => (
          <div
            key={label}
            className="px-6 py-5"
            style={{ animation: `dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s both` }}
          >
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">{label}</p>
            <p className="mt-1 font-serif text-[2rem] font-semibold leading-none text-light">{value}</p>
          </div>
        ))}
      </div>

      {/* ── View tabs ─────────────────────────────────────────── */}
      <div className="mb-8 flex border-b border-wire" style={{ animation: "fade-in 0.4s ease-out 0.2s both" }}>
        <button
          onClick={() => setTab("mapa")}
          className={[
            "flex items-center gap-2 px-5 pb-3 pt-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] transition-colors",
            tab === "mapa" ? "border-b-[1.5px] border-glow text-glow" : "text-dim hover:text-light",
          ].join(" ")}
        >
          <Map className="h-3.5 w-3.5" />
          Mapa del local
        </button>
        <button
          onClick={() => setTab("lista")}
          className={[
            "flex items-center gap-2 px-5 pb-3 pt-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] transition-colors",
            tab === "lista" ? "border-b-[1.5px] border-glow text-glow" : "text-dim hover:text-light",
          ].join(" ")}
        >
          <LayoutGrid className="h-3.5 w-3.5" />
          Lista de mesas
        </button>
      </div>

      {/* ── Floor map ─────────────────────────────────────────── */}
      {tab === "mapa" && (
        <>
          {showMap ? (
            <div style={{ animation: "fade-in 0.35s ease-out both" }}>
              <FloorMapClient tables={tables} />
            </div>
          ) : (
            <div className="flex min-h-[400px] items-center justify-center border border-wire bg-canvas">
              <div className="flex flex-col items-center gap-3 px-6 text-center">
                <p className="text-[0.72rem] font-medium text-dim/50">Cargando mapa…</p>
                {isMobile ? (
                  <button
                    onClick={() => setShowMap(true)}
                    className="inline-flex h-9 items-center justify-center border border-wire px-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light"
                  >
                    Cargar mapa
                  </button>
                ) : null}
              </div>
            </div>
          )}
        </>
      )}

      {/* ── Modal: nueva mesa ────────────────────────────────── */}
      {isAdding && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6"
          style={{ animation: "fade-in 0.2s ease-out both" }}
        >
          <div
            className="w-full max-w-sm border border-wire bg-canvas p-8"
            style={{ animation: "scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <p className="mb-1 text-[0.52rem] font-bold uppercase tracking-[0.44em] text-dim">Nueva mesa</p>
            <h2 className="mb-8 font-serif text-[1.6rem] font-medium leading-none text-light">Capacidad</h2>

            <div className="flex gap-2">
              {[2, 4, 6, 8, 10].map((cap) => (
                <button
                  key={cap}
                  onClick={() => setNewTableCap(cap)}
                  className={[
                    "flex-1 py-3 text-[0.78rem] font-bold transition-colors",
                    newTableCap === cap ? "bg-glow text-ink" : "border border-wire text-dim hover:border-light/20 hover:text-light",
                  ].join(" ")}
                >
                  {cap}
                </button>
              ))}
            </div>

            <p className="mt-4 text-[0.62rem] font-medium text-dim/50">El código QR se generará automáticamente.</p>

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

      {/* ── Lista de tarjetas ────────────────────────────────── */}
      {tab === "lista" &&
        (filtered.length === 0 ? (
          <div className="border border-dashed border-wire py-20 text-center">
            <p className="text-[0.8rem] font-medium text-dim">No se encontraron mesas.</p>
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-[0.72rem] font-semibold text-glow underline underline-offset-4"
            >
              Limpiar búsqueda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {filtered.map((table, i) => (
              <div
                key={table.id}
                className={[
                  "group relative flex min-h-[172px] flex-col overflow-hidden border transition-all duration-200",
                  CARD_BORDER[table.status],
                  CARD_BG[table.status],
                ].join(" ")}
                style={{
                  animation: `dash-row-enter 0.35s cubic-bezier(0.22,1,0.36,1) ${0.2 + Math.min(i * 0.04, 0.3)}s both`,
                }}
              >
                {/* Card content */}
                <div className="flex flex-1 flex-col p-5">
                  {/* Status row */}
                  <div className="flex items-center gap-2">
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[table.status]}`}
                      aria-hidden="true"
                      style={table.status === "OCUPADA" ? { animation: "pulse-slow 2.4s ease-in-out infinite" } : undefined}
                    />
                    <span className={`text-[0.58rem] font-bold uppercase tracking-[0.2em] ${STATUS_TEXT[table.status]}`}>
                      {STATUS_LABEL[table.status]}
                    </span>
                  </div>

                  {/* Table number */}
                  <div className="flex flex-1 items-center justify-center py-3">
                    <p className="font-serif text-[3.5rem] font-semibold leading-none tracking-tight text-light">
                      {table.number}
                    </p>
                  </div>

                  {/* Capacity */}
                  <div className="flex items-center gap-1.5 transition-opacity duration-200 group-hover:opacity-0">
                    <Users className="h-3 w-3 text-dim/50" aria-hidden="true" />
                    <p className="text-[0.62rem] font-medium text-dim">{table.capacity} asientos</p>
                  </div>
                </div>

                {/* Hover action bar */}
                <div className="absolute inset-x-0 bottom-0 flex translate-y-full items-center justify-between border-t border-wire bg-canvas/95 px-4 py-3 backdrop-blur-sm transition-transform duration-200 group-hover:translate-y-0">
                  <button
                    onClick={() => window.open(`/mesa/${table.qrCode}/menu`, "_blank")}
                    className="flex items-center gap-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-dim transition-colors hover:text-light"
                  >
                    <QrCode className="h-3.5 w-3.5" aria-hidden="true" />
                    Ver menú
                  </button>
                  <button
                    onClick={() => handleDelete(table.id)}
                    aria-label={`Eliminar mesa ${table.number}`}
                    className="flex h-7 w-7 items-center justify-center text-dim/50 transition-colors hover:text-ember"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ))}
    </>
  );
}

