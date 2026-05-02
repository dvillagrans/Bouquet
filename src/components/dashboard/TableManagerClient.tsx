/** @jsxImportSource react */

"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";
import {
  Plus,
  Search,
  LayoutGrid,
  Map,
  Link as LinkIcon,
  AlertCircle,
  X,
  Loader2,
  Users,
} from "lucide-react";
import { createTable, deleteTable } from "@/actions/tables";
import { createTableGroup, removeFromGroup } from "@/actions/table-groups";
import { TableStatus } from "@/lib/prisma-legacy-types";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import FloorMapClient from "./FloorMapClient";
import MesaCapacityPreview from "./MesaCapacityPreview";
import { createClient } from "@/lib/supabase/client";

type Table = import("@/generated/prisma").DiningTable & { groupId?: string | null };
type Tab = "mapa" | "lista";

const STATUS_COLORS: Record<TableStatus, { text: string; bg: string; border: string }> = {
  DISPONIBLE: { text: "text-dash-green", bg: "bg-dash-green/10", border: "border-dash-green/20" },
  OCUPADA: { text: "text-dash-blue", bg: "bg-dash-blue/10", border: "border-dash-blue/20" },
  SUCIA: { text: "text-pink-light-glow", bg: "bg-pink-light-glow/10", border: "border-pink-light-glow/20" },
  CERRANDO: { text: "text-dash-amber", bg: "bg-dash-amber/10", border: "border-dash-amber/20" },
};

const STATUS_LABEL: Record<TableStatus, string> = {
  DISPONIBLE: "Disponible",
  OCUPADA: "Ocupada",
  SUCIA: "Por limpiar",
  CERRANDO: "En Cuenta",
};

const CAP_OPTIONS = [2, 4, 6, 8, 10, 12] as const;

function mesaSizeLabel(cap: number): string {
  if (cap <= 4) return "Mesa íntima";
  if (cap <= 8) return "Estándar de sala";
  return "Gran mesa · grupo";
}

export default function TableManagerClient({
  initialTables,
  restaurantId,
}: {
  initialTables: Table[];
  restaurantId: string;
}) {
  const router = useRouter();
  const [tables, setTables] = useState<Table[]>(initialTables);
  const [tab, setTab] = useState<Tab>("lista");
  const [showMap, setShowMap] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");

  const [isAdding, setIsAdding] = useState(false);
  const [newTableCap, setNewTableCap] = useState(4);
  const [selectedQRTable, setSelectedQRTable] = useState<Table | null>(null);

  const [isJoinMode, setIsJoinMode] = useState(false);
  const [selectedTablesToJoin, setSelectedTablesToJoin] = useState<string[]>([]);

  const [isPending, startTransition] = useTransition();
  const reduceMotion = useReducedMotion();
  const [portalReady, setPortalReady] = useState(false);

  useEffect(() => {
    setPortalReady(true);
  }, []);

  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);

  useEffect(() => {
    const supabase = createClient();
    const channelName = `kds-orders:${encodeURIComponent(restaurantId)}`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "refresh" }, () => {
        router.refresh();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [router, restaurantId]);

  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel("realtime-tables")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "Table" },
        (payload) => {
          setTables((prev) => {
            const index = prev.findIndex((t) => t.id === (payload.new as any)?.id || t.id === (payload.old as any)?.id);
            if (payload.eventType === "INSERT") return [...prev, payload.new as Table];
            if (payload.eventType === "DELETE") return prev.filter((t) => t.id !== (payload.old as any).id);
            if (payload.eventType === "UPDATE") {
              if (index === -1) return [...prev, payload.new as Table];
              const copy = [...prev];
              copy[index] = payload.new as Table;
              return copy;
            }
            return prev;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 640px)");
    const update = () => setIsMobile(mq.matches);
    update();
    if (typeof mq.addEventListener === "function") {
      mq.addEventListener("change", update);
      return () => mq.removeEventListener("change", update);
    }
    mq.addListener(update);
    return () => mq.removeListener(update);
  }, []);

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
          t.publicCode.toLowerCase().includes(search.toLowerCase()),
      ),
    [tables, search],
  );

  const stats = useMemo(() => {
    let disponibles = 0, ocupadas = 0, sucias = 0;
    for (const t of tables) {
      if (t.status === "DISPONIBLE") disponibles++;
      else if (t.status === "OCUPADA" || t.status === "CERRANDO") ocupadas++;
      else sucias++;
    }
    return [
      { label: "Ocupadas / Activas", value: ocupadas, tone: "text-dash-blue" },
      { label: "Por limpiar", value: sucias, tone: "text-pink-light-glow" },
      { label: "Mesas Disponibles", value: disponibles, tone: "text-dash-green" },
      { label: "Total Mesas", value: tables.length, tone: "text-light" },
    ];
  }, [tables]);

  function handleCreate() {
    startTransition(async () => {
      try {
        const newTable = await createTable(newTableCap);
        setTables((prev) => [...prev, newTable]);
        setIsAdding(false);
        setNewTableCap(4);
      } catch (e) {
        console.error(e);
      }
    });
  }

  function toggleJoinMode() {
    setIsJoinMode(!isJoinMode);
    setSelectedTablesToJoin([]);
  }

  function toggleTableSelection(id: string, isParent: boolean) {
    if (isParent) return;
    setSelectedTablesToJoin((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  function handleConfirmJoin() {
    if (selectedTablesToJoin.length < 2) return;
    startTransition(async () => {
      try {
        await createTableGroup(selectedTablesToJoin, "admin");
        setIsJoinMode(false);
        setSelectedTablesToJoin([]);
        router.refresh();
      } catch (e) { console.error(e); }
    });
  }

  function handleSeparate(tableId: string) {
    startTransition(async () => {
      try {
        await removeFromGroup(tableId);
        router.refresh();
      } catch (e) { console.error(e); }
    });
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial={reduceMotion ? "visible" : "hidden"}
        animate="visible"
        className="flex flex-col gap-8"
      >
        {/* ── Header ── */}
        <motion.div variants={itemVariants} className="border-b border-wire pb-8">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="size-3.5 text-pink-glow" aria-hidden="true" />
            <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim">
              Operación y Distribución
            </p>
          </div>
          <div className="mt-3 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-serif text-[clamp(2.2rem,4vw,3.2rem)] font-medium leading-[0.95] tracking-tight text-light">
                Gestión de <span className="italic text-pink-glow">Mesas</span>
              </h1>
              <p className="mt-2 max-w-xl text-[13px] leading-relaxed text-dim">
                Administra ubicaciones, capacidad y accesos por código QR para cada espacio de tu sucursal.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full border border-white/[0.06] bg-white/[0.02] px-3 py-1.5 font-mono text-[10px] tracking-[0.15em] text-dim">
                {tables.length} mesas
              </span>
            </div>
          </div>
        </motion.div>

        {/* ── Top Controls ── */}
        <motion.div variants={itemVariants} className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 top-1/2 size-3.5 -translate-y-1/2 text-dim" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar mesa o código…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-white/[0.06] bg-white/[0.02] py-2.5 pl-10 pr-4 text-[13px] text-light placeholder:text-dim/40 outline-none backdrop-blur-md transition-colors focus:border-pink-glow/20 focus:bg-white/[0.04] focus:ring-2 focus:ring-pink-glow/10"
              />
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={() => setIsAdding(true)}
                disabled={isJoinMode || isPending}
                whileHover={reduceMotion ? undefined : { y: -1, scale: 1.01 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                className="group relative inline-flex h-[42px] items-center gap-2 overflow-hidden rounded-xl bg-rose px-4 text-[11px] font-semibold uppercase tracking-[0.1em] text-white shadow-[0_8px_20px_-8px_rgba(199,91,122,0.45)] transition-all hover:bg-rose-light hover:shadow-[0_12px_28px_-10px_rgba(199,91,122,0.5)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:active:scale-100"
              >
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                <Plus className="size-3.5" aria-hidden="true" />
                Nueva Mesa
              </motion.button>

              <motion.button
                onClick={toggleJoinMode}
                disabled={isPending}
                whileHover={reduceMotion ? undefined : { y: -1, scale: 1.01 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                className={`inline-flex h-[42px] items-center gap-2 rounded-xl border px-4 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all disabled:opacity-50 ${
                  isJoinMode
                    ? "border-pink-light-glow/30 bg-pink-light-glow/10 text-pink-light-glow hover:bg-pink-light-glow/15"
                    : "border-white/[0.08] bg-white/[0.02] text-dim hover:border-pink-glow/20 hover:text-light"
                }`}
              >
                <LinkIcon className="size-3.5" aria-hidden="true" />
                {isJoinMode ? "Cancelar Unión" : "Juntar Mesas"}
              </motion.button>
            </div>
          </div>

          <LayoutGroup id="mesas-view-switch">
            <div className="flex rounded-xl border border-white/[0.06] bg-white/[0.02] p-1">
              <button
                onClick={() => setTab("mapa")}
                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  tab === "mapa" ? "text-pink-glow" : "text-dim hover:text-light"
                }`}
              >
                {tab === "mapa" ? (
                  <motion.span
                    layoutId="mesas-view-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.06]"
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-[1] inline-flex items-center gap-2">
                  <Map className="size-3.5" /> Mapa
                </span>
              </button>
              <button
                onClick={() => setTab("lista")}
                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  tab === "lista" ? "text-pink-glow" : "text-dim hover:text-light"
                }`}
              >
                {tab === "lista" ? (
                  <motion.span
                    layoutId="mesas-view-pill"
                    className="absolute inset-0 rounded-lg bg-white/[0.06]"
                    transition={{ type: "spring", stiffness: 420, damping: 30 }}
                  />
                ) : null}
                <span className="relative z-[1] inline-flex items-center gap-2">
                  <LayoutGrid className="size-3.5" /> Lista
                </span>
              </button>
            </div>
          </LayoutGroup>
        </motion.div>

        {/* ── Join Mode Banner ── */}
        {isJoinMode && selectedTablesToJoin.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center justify-between rounded-xl border border-pink-glow/25 bg-pink-glow/[0.04] p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="size-4 text-pink-glow" />
              <p className="text-[13px] font-medium text-light">
                Has seleccionado {selectedTablesToJoin.length} mesas. La primera seleccionada será la principal.
              </p>
            </div>
            <button
              onClick={handleConfirmJoin}
              disabled={isPending}
              className="inline-flex h-[38px] items-center justify-center gap-2 rounded-xl bg-rose px-5 text-[11px] font-bold uppercase tracking-[0.12em] text-white shadow-[0_8px_20px_-8px_rgba(199,91,122,0.4)] transition-all hover:bg-rose-light disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-3.5 animate-spin" /> : "Confirmar Unión"}
            </button>
          </motion.div>
        )}

        {/* ── Stats Strip ── */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -3, transition: { type: "spring", stiffness: 160, damping: 18 } }}
              className="group relative overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 backdrop-blur-md"
            >
              <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{ backgroundImage: "linear-gradient(120deg, rgba(244,114,182,0.04), transparent 50%)" }}
              />
              <div className="relative">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-dim">
                  {stat.label}
                </p>
                <p className={`mt-3 font-serif text-3xl font-semibold tracking-tight tabular-nums transition-colors ${stat.tone}`}>
                  {stat.value}
                </p>
              </div>
            </motion.div>
          ))}
        </motion.div>

        {/* ── Views ── */}
        <motion.div variants={itemVariants} className="min-h-[400px]">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "mapa" ? (
              <motion.div
                key="mesas-map-view"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.28 }}
                className="relative min-h-[550px] overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.015] p-4 backdrop-blur-md"
              >
                {!reduceMotion && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-pink-glow/30 to-transparent"
                    animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.8, 1, 0.8] }}
                    transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  />
                )}
                {showMap ? (
                  <FloorMapClient tables={tables} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <p className="text-[12px] font-medium uppercase tracking-[0.2em] text-dim">Cargando distribución…</p>
                    {isMobile && (
                      <button
                        onClick={() => setShowMap(true)}
                        className="rounded-full border border-white/[0.1] px-5 py-2 text-[11px] font-semibold uppercase tracking-widest text-dim transition-colors hover:border-pink-glow/30 hover:text-pink-glow"
                      >
                        Toca para Cargar
                      </button>
                    )}
                  </div>
                )}
              </motion.div>
            ) : filtered.length === 0 ? (
              <motion.div
                key="mesas-list-empty"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.28 }}
                className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-white/[0.06] bg-white/[0.015] p-8 text-center text-dim"
              >
                <LayoutGrid className="mb-4 size-10 opacity-15" />
                <p className="text-[13px] font-medium">Ninguna mesa encontrada.</p>
                {search && (
                  <button onClick={() => setSearch("")} className="mt-3 text-[11px] font-bold uppercase tracking-widest text-pink-glow transition-colors hover:text-pink-light-glow">
                    Limpiar Búsqueda
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="mesas-list-view"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.28 }}
                className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filtered.map((table) => {
                  const isSelectedToJoin = selectedTablesToJoin.includes(table.id);
                  const isInGroup = !!table.groupId;
                  const statusInfo = STATUS_COLORS[table.status as TableStatus];

                  return (
                    <motion.div
                      key={table.id}
                      whileHover={reduceMotion ? undefined : { y: -3, transition: { type: "spring", stiffness: 170, damping: 18 } }}
                      onClick={() => {
                        if (isJoinMode && !isInGroup) toggleTableSelection(table.id, false);
                      }}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border p-5 backdrop-blur-md transition-all duration-200 ${
                        isSelectedToJoin
                          ? "border-pink-glow/30 bg-pink-glow/[0.04] ring-1 ring-pink-glow/10"
                          : "border-white/[0.06] bg-white/[0.015] hover:border-white/[0.12]"
                      } ${isJoinMode && !isInGroup ? "cursor-pointer" : ""}`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-10 items-center justify-center rounded-full ${statusInfo.bg} ring-1 ${statusInfo.border}`}>
                            <span className={`font-serif text-lg font-semibold tracking-tight ${statusInfo.text}`}>
                              {table.number}
                            </span>
                          </div>
                          <div>
                            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-dim/60">Capacidad</p>
                            <p className="font-mono text-sm tabular-nums text-light">{table.capacity} pax</p>
                          </div>
                        </div>

                        <div className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${statusInfo.border} ${statusInfo.bg} ${statusInfo.text}`}>
                          {STATUS_LABEL[table.status as TableStatus]}
                        </div>
                      </div>

                      <div className="mb-4 rounded-lg border border-white/[0.04] bg-white/[0.02] px-3 py-2.5">
                        <p className="text-[9px] font-bold uppercase tracking-[0.15em] text-dim/50">Código QR</p>
                        <p className="mt-0.5 font-mono text-[11px] tracking-wide text-dim truncate">
                          {table.publicCode}
                        </p>
                      </div>

                      {isInGroup && (
                        <div className="mb-4 flex items-center justify-between rounded-lg border border-pink-glow/15 bg-pink-glow/[0.04] px-3 py-2">
                          <span className="text-[10px] font-bold uppercase tracking-[0.15em] text-pink-glow">
                            Grupo
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleSeparate(table.id); }}
                            className="text-[10px] font-bold uppercase tracking-widest text-pink-light-glow transition-colors hover:text-pink-glow"
                          >
                            Separar
                          </button>
                        </div>
                      )}

                      {!isJoinMode && (
                        <div className="mt-auto flex items-center justify-between border-t border-white/[0.04] pt-4 text-[10px] text-dim/40">
                          <span>ID: {table.publicCode.slice(0, 4)}…</span>
                          <span className="font-mono tabular-nums">{table.capacity}p</span>
                        </div>
                      )}
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* ── Nueva Mesa Modal ── */}
      {portalReady
        ? createPortal(
            <AnimatePresence>
              {isAdding && (
                <div
                  key="mesa-modal-overlay"
                  className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6"
                >
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={() => setIsAdding(false)}
                    className="absolute inset-0 bg-black/55 backdrop-blur-xl"
                  />
                  <motion.div
                    role="dialog"
                    aria-labelledby="mesa-nueva-title"
                    aria-modal="true"
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 12 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="relative z-10 w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-bg-card/95 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {/* Header */}
                    <div className="relative overflow-hidden px-6 pb-4 pt-6 sm:px-8 sm:pb-5 sm:pt-8">
                      <div
                        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_100%_at_50%_-30%,rgba(244,114,182,0.1),transparent_55%)]"
                        aria-hidden
                      />
                      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-pink-glow/25 to-transparent" aria-hidden />
                      <div className="relative flex items-start justify-between gap-4">
                        <div className="min-w-0 space-y-1.5 pr-2">
                          <span className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.25em] text-pink-glow/80">
                            <LayoutGrid className="size-3.5 shrink-0 opacity-80" aria-hidden />
                            Plano de sala
                          </span>
                          <h3
                            id="mesa-nueva-title"
                            className="font-serif text-[1.6rem] font-medium tracking-tight text-light sm:text-[1.8rem]"
                          >
                            Nueva mesa
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => setIsAdding(false)}
                          className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-dim transition-colors hover:border-pink-glow/20 hover:bg-white/[0.06] hover:text-light"
                          aria-label="Cerrar"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    </div>

                    {/* Preview */}
                    <div className="border-y border-white/[0.05] bg-[linear-gradient(180deg,rgba(255,255,255,0.03)_0%,transparent_45%,rgba(0,0,0,0.15)_100%)] px-6 py-7 sm:px-8 sm:py-8">
                      <div className="flex flex-col items-center gap-4">
                        <MesaCapacityPreview capacity={newTableCap} reduceMotion={reduceMotion} />
                        <motion.div
                          key={newTableCap}
                          initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: reduceMotion ? 0 : 0.25 }}
                          className="text-center"
                        >
                          <p className="font-serif text-lg text-light sm:text-xl">{mesaSizeLabel(newTableCap)}</p>
                          <p className="mt-1 inline-flex items-center justify-center gap-2 text-[12px] font-semibold tabular-nums text-pink-glow">
                            <Users className="size-3.5 opacity-80" aria-hidden />
                            <span>{newTableCap} personas</span>
                          </p>
                        </motion.div>
                      </div>
                    </div>

                    {/* Capacity selector */}
                    <div className="space-y-4 px-6 py-5 sm:px-8">
                      <p className="text-[10px] font-bold uppercase tracking-[0.22em] text-dim">Capacidad</p>
                      <div className="grid grid-cols-3 gap-2.5">
                        {CAP_OPTIONS.map((cap) => {
                          const selected = newTableCap === cap;
                          return (
                            <button
                              key={cap}
                              type="button"
                              onClick={() => setNewTableCap(cap)}
                              className={[
                                "relative flex min-h-[52px] flex-col items-center justify-center rounded-2xl border py-3 transition-all",
                                selected
                                  ? "border-pink-glow/40 bg-pink-glow/[0.08] text-pink-glow shadow-[inset_0_0_0_1px_rgba(244,114,182,0.15),0_0_24px_-8px_rgba(244,114,182,0.2)]"
                                  : "border-white/[0.06] bg-white/[0.02] text-dim hover:border-pink-glow/15 hover:text-light",
                              ].join(" ")}
                            >
                              <span className="font-serif text-2xl font-medium tabular-nums leading-none">{cap}</span>
                              <span className="mt-1 text-[9px] font-semibold uppercase tracking-wider text-dim/60">
                                pax
                              </span>
                              {selected ? (
                                <span className="pointer-events-none absolute -right-1 -top-1 size-2 rounded-full bg-pink-glow shadow-[0_0_10px_rgba(244,114,182,0.8)]" />
                              ) : null}
                            </button>
                          );
                        })}
                      </div>

                      <div className="flex gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => setIsAdding(false)}
                          className="flex-1 rounded-2xl border border-white/[0.06] py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-dim transition-colors hover:bg-white/[0.03] hover:text-light"
                        >
                          Cancelar
                        </button>
                        <button
                          type="button"
                          onClick={handleCreate}
                          disabled={isPending}
                          className="group relative flex-1 inline-flex items-center justify-center gap-2 overflow-hidden rounded-2xl bg-rose py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_8px_24px_-8px_rgba(199,91,122,0.45)] transition-all hover:bg-rose-light hover:shadow-[0_12px_32px_-10px_rgba(199,91,122,0.5)] disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
                        >
                          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/10 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                          {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                          {isPending ? "Configurando…" : "Activar mesa"}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                </div>
              )}
            </AnimatePresence>,
            document.body
          )
        : null}
    </>
  );
}
