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
  RefreshCw,
  X,
  Loader2,
  Users,
} from "lucide-react";
import { createTable, deleteTable } from "@/actions/tables";
import { createTableGroup, removeFromGroup } from "@/actions/table-groups";
import { TableStatus } from "@/generated/prisma";
import { motion, AnimatePresence, LayoutGroup, useReducedMotion } from "framer-motion";
import FloorMapClient from "./FloorMapClient";
import MesaCapacityPreview from "./MesaCapacityPreview";
import { createClient } from "@/lib/supabase/client";

// Mantenemos la estructura requerida del backend
type Table = import("@/generated/prisma").Table & { groupId?: string | null };
type Tab = "mapa" | "lista";

// Colors actualizados usando tokens existentes de color (text-gold, text-dash-red, text-dash-green, text-dash-blue)
const STATUS_COLORS: Record<TableStatus, { text: string; bg: string; border: string }> = {
  DISPONIBLE: { text: "text-dash-green", bg: "bg-dash-green/10", border: "border-dash-green/20" },
  OCUPADA: { text: "text-dash-blue", bg: "bg-dash-blue/10", border: "border-dash-blue/20" },
  SUCIA: { text: "text-dash-red", bg: "bg-dash-red/10", border: "border-dash-red/20" },
  CERRANDO: { text: "text-gold", bg: "bg-gold/10", border: "border-gold/20" },
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
  const [tab, setTab] = useState<Tab>("mapa");
  const [showMap, setShowMap] = useState(false);
  const [isMobile, setIsMobile] = useState<boolean | null>(null);
  const [search, setSearch] = useState("");
  
  // States Modal
  const [isAdding, setIsAdding] = useState(false);
  const [newTableCap, setNewTableCap] = useState(4);
  const [selectedQRTable, setSelectedQRTable] = useState<Table | null>(null);
  
  // States Join
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

  /** Mismo canal que cocina/mesero: anon no recibe postgres sobre Order; broadcast desde servidor. */
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

  // Supabase real-time
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

  // Detect mobile
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

  // Delay map load to improve LCP on desktop
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

  const stats = useMemo(() => {
    let disponibles = 0, ocupadas = 0, sucias = 0;
    for (const t of tables) {
      if (t.status === "DISPONIBLE") disponibles++;
      else if (t.status === "OCUPADA" || t.status === "CERRANDO") ocupadas++;
      else sucias++;
    }
    return [
      { label: "Ocupadas / Activas", value: ocupadas },
      { label: "Por limpiar", value: sucias },
      { label: "Mesas Disponibles", value: disponibles },
      { label: "Total Mesas", value: tables.length },
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
        // Refresh will come from realtime, but also update local state
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
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } },
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial={reduceMotion ? "visible" : "hidden"}
        animate="visible"
        className="flex flex-col gap-10"
      >
        {/* Header Reubicado */}
        <motion.div variants={itemVariants} className="border-b border-border-main pb-8">
          <div className="flex items-center gap-3">
            <LayoutGrid className="size-4 text-gold" aria-hidden="true" />
            <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-text-faint">
              Operación y Distribución
            </p>
          </div>
          <div className="mt-4 flex flex-col items-start justify-between gap-4 md:flex-row md:items-end">
            <div>
              <h1 className="font-serif text-[clamp(2.5rem,5vw,3.5rem)] font-medium leading-[0.95] tracking-tight text-text-primary">
                Gestión de <span className="text-gold">Mesas</span>
              </h1>
              <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-text-muted">
                Administra ubicaciones, únelas para reservas grandes y gestiona accesos por código QR.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Top Controls */}
        <motion.div variants={itemVariants} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-1 flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-text-faint" aria-hidden="true" />
              <input
                type="text"
                placeholder="Mesa o UUID (código)..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-xl border border-border-main bg-bg-card/45 py-2.5 pl-11 pr-4 text-[13px] text-text-primary placeholder:text-text-dim backdrop-blur-md transition-colors focus:border-border-bright focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <motion.button
                onClick={() => setIsAdding(true)}
                disabled={isJoinMode || isPending}
                whileHover={reduceMotion ? undefined : { y: -1, scale: 1.01 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-gold px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-bg-solid transition-all hover:bg-white hover:shadow-[0_0_20px_rgba(201,160,84,0.3)] disabled:opacity-50 disabled:hover:bg-gold disabled:hover:shadow-none"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Nueva Mesa
              </motion.button>

              <motion.button
                onClick={toggleJoinMode}
                disabled={isPending}
                whileHover={reduceMotion ? undefined : { y: -1, scale: 1.01 }}
                whileTap={reduceMotion ? undefined : { scale: 0.985 }}
                className={`inline-flex h-[42px] items-center gap-2 rounded-xl border px-5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all disabled:opacity-50 ${
                  isJoinMode 
                    ? "border-dash-red bg-dash-red/10 text-dash-red hover:bg-dash-red/20 hover:border-dash-red/50" 
                    : "border-border-bright bg-bg-card text-text-secondary hover:border-gold/30 hover:text-gold"
                }`}
              >
                <LinkIcon className="size-3.5" aria-hidden="true" />
                {isJoinMode ? "Cancelar Unión" : "Juntar Mesas"}
              </motion.button>
            </div>
          </div>

          <LayoutGroup id="mesas-view-switch">
            <div className="flex rounded-xl border border-border-main bg-bg-card/50 p-1">
              <button
                onClick={() => setTab("mapa")}
                className={`relative flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors ${
                  tab === "mapa" ? "text-gold" : "text-text-dim hover:text-text-primary"
                }`}
              >
                {tab === "mapa" ? (
                  <motion.span
                    layoutId="mesas-view-pill"
                    className="absolute inset-0 rounded-lg bg-bg-solid shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
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
                  tab === "lista" ? "text-gold" : "text-text-dim hover:text-text-primary"
                }`}
              >
                {tab === "lista" ? (
                  <motion.span
                    layoutId="mesas-view-pill"
                    className="absolute inset-0 rounded-lg bg-bg-solid shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
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

        {isJoinMode && selectedTablesToJoin.length >= 2 && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="flex items-center justify-between rounded-xl border border-gold/40 bg-gold/10 p-4"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="size-5 text-gold" />
              <p className="text-[13px] text-text-primary font-medium">
                Has seleccionado {selectedTablesToJoin.length} mesas para unirlas. La primera seleccionada será la mesa principal.
              </p>
            </div>
            <button
              onClick={handleConfirmJoin}
              disabled={isPending}
              className="inline-flex h-[38px] items-center justify-center gap-2 rounded-xl bg-gold px-6 text-[11px] font-bold uppercase tracking-[0.15em] text-bg-solid hover:bg-white transition-colors disabled:opacity-50"
            >
              {isPending ? <Loader2 className="size-4 animate-spin"/> : "Confirmar Unión"}
            </button>
          </motion.div>
        )}

        {/* Stats Strip */}
        <motion.div variants={itemVariants} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {stats.map((stat, idx) => (
            <motion.div
              key={idx}
              initial={reduceMotion ? undefined : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.06, duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
              whileHover={reduceMotion ? undefined : { y: -3, transition: { type: "spring", stiffness: 160, damping: 18 } }}
              className="group flex flex-col rounded-2xl border border-border-main bg-bg-card/30 p-5 backdrop-blur-md"
            >
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-dim">
                {stat.label}
              </p>
              <p className="mt-3 font-serif text-3xl font-semibold text-text-primary transition-colors group-hover:text-gold">{stat.value}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Views */}
        <motion.div variants={itemVariants} className="min-h-[500px]">
          <AnimatePresence mode="wait" initial={false}>
            {tab === "mapa" ? (
              <motion.div
                key="mesas-map-view"
                initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
                transition={{ duration: reduceMotion ? 0.12 : 0.28 }}
                className="overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 backdrop-blur-md p-4 relative min-h-[550px]"
              >
                {!reduceMotion && (
                  <motion.div
                    aria-hidden
                    className="pointer-events-none absolute inset-x-12 top-0 h-px bg-gradient-to-r from-transparent via-gold/55 to-transparent"
                    animate={{ opacity: [0.3, 1, 0.3], scaleX: [0.8, 1, 0.8] }}
                    transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
                  />
                )}
                {showMap ? (
                  <FloorMapClient tables={tables} />
                ) : (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                    <p className="text-[12px] uppercase tracking-[0.2em] text-text-dim font-medium">Cargando distribución...</p>
                    {isMobile && (
                      <button
                        onClick={() => setShowMap(true)}
                        className="rounded-full border border-border-bright px-5 py-2 text-[11px] uppercase tracking-widest text-text-secondary hover:text-gold hover:border-gold/50 transition-colors"
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
                className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-main bg-bg-card/30 p-8 text-center text-text-dim"
              >
                <LayoutGrid className="mb-4 size-10 opacity-20" />
                <p className="text-[13px] font-medium">Ninguna mesa encontrada.</p>
                {search && (
                  <button onClick={() => setSearch("")} className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-gold underline-offset-4 hover:underline">
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
                className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
              >
                {filtered.map((table) => {
                  const isSelectedToJoin = selectedTablesToJoin.includes(table.id);
                  const isInGroup = !!table.groupId;
                  const statusInfo = STATUS_COLORS[table.status];

                  return (
                    <motion.div
                      key={table.id}
                      whileHover={reduceMotion ? undefined : { y: -3, transition: { type: "spring", stiffness: 170, damping: 18 } }}
                      onClick={() => {
                        if (isJoinMode && !isInGroup) toggleTableSelection(table.id, false);
                      }}
                      className={`group relative flex flex-col overflow-hidden rounded-2xl border ${
                        isSelectedToJoin 
                          ? "border-gold bg-gold/5 shadow-[0_0_15px_rgba(201,160,84,0.15)]" 
                          : "border-border-main bg-bg-card/45 hover:border-border-bright"
                      } p-5 backdrop-blur-md transition-all duration-200 ${isJoinMode && !isInGroup ? "cursor-pointer" : ""}`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={`flex size-10 items-center justify-center rounded-full ${statusInfo.bg}`}>
                            <span className={`font-serif text-lg font-medium ${statusInfo.text}`}>{table.number}</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint">Capacidad</p>
                            <p className="font-serif text-lg text-text-secondary">{table.capacity} pax</p>
                          </div>
                        </div>

                        {/* Status Label Pill */}
                        <div className={`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] ${statusInfo.border} ${statusInfo.bg} ${statusInfo.text}`}>
                          {STATUS_LABEL[table.status]}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-text-faint">Identificador de Sesión</p>
                        <p className="font-mono text-[11px] tracking-wide text-text-muted mt-0.5 truncate">{table.qrCode}</p>
                      </div>

                      {/* Group Indicator */}
                      {isInGroup && (
                        <div className="mb-4 flex items-center justify-between rounded-lg border border-gold/30 bg-gold/10 px-3 py-2">
                           <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-gold">
                             Grupo
                           </span>
                           <button
                             onClick={(e) => { e.stopPropagation(); handleSeparate(table.id); }}
                             className="text-[10px] font-bold uppercase tracking-widest text-dash-red hover:text-dash-red/80 transition-colors"
                           >
                             Separar
                           </button>
                        </div>
                      )}

                      {/* Action buttons (only if not joining) */}
                      <AnimatePresence>
                        {!isJoinMode && (
                          <motion.div 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="mt-auto pt-4 flex gap-2 border-t border-border-main/50"
                          >
                             {/* Acciones de cada mesa se añadirían aquí (QR code gen, etc. que estaba en el doc anterior si aplicara) */}
                             <button
                               onClick={() => {}}
                               className="flex-1 rounded-lg bg-bg-solid py-2 text-[10px] font-semibold uppercase tracking-[0.15em] text-text-secondary hover:text-gold transition-colors"
                             >
                               Opciones
                             </button>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>

      {/* Agregar Nueva Mesa Modal: portal a body para cubrir sidebar (stacking fuera de <main>) */}
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
                    className="absolute inset-0 bg-black/50 backdrop-blur-2xl backdrop-saturate-150 [-webkit-backdrop-filter:blur(40px)_saturate(1.15)]"
                  />
                  <motion.div
                    role="dialog"
                    aria-labelledby="mesa-nueva-title"
                    aria-modal="true"
                    initial={{ opacity: 0, scale: 0.96, y: 14 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.96, y: 14 }}
                    transition={{ type: "spring", stiffness: 320, damping: 28 }}
                    className="relative z-10 w-full max-w-lg overflow-hidden rounded-[1.75rem] border border-white/[0.08] bg-bg-card/92 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl backdrop-saturate-125 [-webkit-backdrop-filter:blur(20px)_saturate(1.1)]"
                    onClick={(e) => e.stopPropagation()}
                  >
              {/* Encabezado */}
              <div className="relative overflow-hidden px-6 pb-5 pt-7 sm:px-8 sm:pb-6 sm:pt-8">
                <div
                  className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_100%_at_50%_-30%,rgba(201,160,84,0.14),transparent_55%)]"
                  aria-hidden
                />
                <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold/35 to-transparent" aria-hidden />
                <div className="relative flex items-start justify-between gap-4">
                  <div className="min-w-0 space-y-2 pr-2">
                    <span className="inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-gold/90">
                      <LayoutGrid className="size-3.5 shrink-0 opacity-90" aria-hidden />
                      Plano de sala
                    </span>
                    <h3
                      id="mesa-nueva-title"
                      className="font-serif text-[1.65rem] font-medium tracking-tight text-white sm:text-[1.85rem]"
                    >
                      Nueva mesa
                    </h3>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex size-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.04] text-text-muted transition-colors hover:border-gold/35 hover:bg-white/[0.08] hover:text-white"
                    aria-label="Cerrar"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              </div>

              {/* Vista previa creativa */}
              <div className="border-y border-border-main/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.04)_0%,transparent_45%,rgba(0,0,0,0.2)_100%)] px-6 py-7 sm:px-8 sm:py-8">
                <div className="flex flex-col items-center gap-4">
                  <MesaCapacityPreview capacity={newTableCap} reduceMotion={reduceMotion} />
                  <motion.div
                    key={newTableCap}
                    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: reduceMotion ? 0 : 0.25 }}
                    className="text-center"
                  >
                    <p className="font-serif text-lg text-white sm:text-xl">{mesaSizeLabel(newTableCap)}</p>
                    <p className="mt-1 inline-flex items-center justify-center gap-2 text-[12px] font-medium tabular-nums text-gold/90">
                      <Users className="size-3.5 opacity-90" aria-hidden />
                      <span>{newTableCap} personas</span>
                    </p>
                  </motion.div>
                </div>
              </div>

              {/* Capacidad */}
              <div className="space-y-4 px-6 py-6 sm:px-8">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-text-dim">Capacidad</p>
                <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
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
                            ? "border-gold/50 bg-gold/[0.12] text-gold shadow-[inset_0_0_0_1px_rgba(201,160,84,0.25),0_0_24px_-8px_rgba(201,160,84,0.35)]"
                            : "border-border-main bg-bg-solid/40 text-text-secondary hover:border-gold/30 hover:text-text-primary",
                        ].join(" ")}
                      >
                        <span className="font-serif text-2xl font-medium tabular-nums leading-none">{cap}</span>
                        <span className="mt-1.5 text-[9px] font-medium uppercase tracking-wider text-text-dim">
                          pax
                        </span>
                        {selected ? (
                          <span className="pointer-events-none absolute -right-1 -top-1 size-2 rounded-full bg-gold shadow-[0_0_10px_rgba(201,160,84,0.9)]" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAdding(false)}
                    className="flex-1 rounded-2xl border border-border-main py-3.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-dim transition-colors hover:bg-bg-solid hover:text-text-primary"
                  >
                    Cancelar
                  </button>
                  <button
                    type="button"
                    onClick={handleCreate}
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-gold py-3.5 text-[11px] font-bold uppercase tracking-[0.1em] text-bg-solid transition-all hover:bg-white hover:shadow-[0_0_28px_rgba(201,160,84,0.35)] disabled:opacity-50"
                  >
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
