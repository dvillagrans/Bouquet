const fs = require('fs');

const code = `
"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import { 
  Plus, Search, LayoutGrid, Map, 
  Link as LinkIcon, AlertCircle, RefreshCw, X, Loader2
} from "lucide-react";
import { createTable, deleteTable, joinTables, separateTable } from "@/actions/tables";
import { TableStatus } from "@/generated/prisma";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import FloorMapClient from "./FloorMapClient";
import { createClient } from "@/lib/supabase/client";

// Mantenemos la estructura requerida del backend
type Table = import("@/generated/prisma").Table & { parentTableId?: string | null };
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

export default function TableManagerClient({ initialTables }: { initialTables: Table[] }) {
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
    const [parentId, ...childIds] = selectedTablesToJoin;
    
    startTransition(async () => {
      try {
        await joinTables(parentId, childIds);
        setTables((prev) => prev.map((t) => 
          childIds.includes(t.id) ? { ...t, parentTableId: parentId } : t
        ));
        setIsJoinMode(false);
        setSelectedTablesToJoin([]);
      } catch (e) { console.error(e); }
    });
  }

  function handleSeparate(childId: string) {
    startTransition(async () => {
      try {
        await separateTable(childId);
        setTables((prev) => prev.map((t) => 
          t.id === childId ? { ...t, parentTableId: null } : t
        ));
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
                className="w-full rounded-xl border border-border-main bg-bg-card/45 py-2.5 pl-11 pr-4 text-[13px] text-text-primary placeholder:text-text-dim backdrop-blur-sm transition-colors focus:border-border-bright focus:outline-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsAdding(true)}
                disabled={isJoinMode || isPending}
                className="inline-flex h-[42px] items-center gap-2 rounded-xl bg-gold px-5 text-[11px] font-semibold uppercase tracking-[0.1em] text-bg-solid transition-all hover:bg-white hover:shadow-[0_0_20px_rgba(201,160,84,0.3)] disabled:opacity-50 disabled:hover:bg-gold disabled:hover:shadow-none"
              >
                <Plus className="size-3.5" aria-hidden="true" />
                Nueva Mesa
              </button>

              <button
                onClick={toggleJoinMode}
                disabled={isPending}
                className={\`inline-flex h-[42px] items-center gap-2 rounded-xl border px-5 text-[11px] font-semibold uppercase tracking-[0.1em] transition-all disabled:opacity-50 \${
                  isJoinMode 
                    ? "border-dash-red bg-dash-red/10 text-dash-red hover:bg-dash-red/20 hover:border-dash-red/50" 
                    : "border-border-bright bg-bg-card text-text-secondary hover:border-gold/30 hover:text-gold"
                }\`}
              >
                <LinkIcon className="size-3.5" aria-hidden="true" />
                {isJoinMode ? "Cancelar Unión" : "Juntar Mesas"}
              </button>
            </div>
          </div>

          <div className="flex rounded-xl border border-border-main bg-bg-card/50 p-1">
            <button
              onClick={() => setTab("mapa")}
              className={\`flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors \${
                tab === "mapa" ? "bg-bg-solid text-gold shadow-sm" : "text-text-dim hover:text-text-primary"
              }\`}
            >
              <Map className="size-3.5" /> Mapa
            </button>
            <button
              onClick={() => setTab("lista")}
              className={\`flex items-center gap-2 rounded-lg px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] transition-colors \${
                tab === "lista" ? "bg-bg-solid text-gold shadow-sm" : "text-text-dim hover:text-text-primary"
              }\`}
            >
              <LayoutGrid className="size-3.5" /> Lista
            </button>
          </div>
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
            <div key={idx} className="flex flex-col rounded-2xl border border-border-main bg-bg-card/30 p-5 backdrop-blur-sm">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-dim">
                {stat.label}
              </p>
              <p className="mt-3 font-serif text-3xl font-semibold text-text-primary">{stat.value}</p>
            </div>
          ))}
        </motion.div>

        {/* Views */}
        <motion.div variants={itemVariants} className="min-h-[500px]">
          {tab === "mapa" && (
            <div className="overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 backdrop-blur-sm p-4 relative min-h-[550px]">
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
            </div>
          )}

          {tab === "lista" && (
            filtered.length === 0 ? (
              <div className="flex min-h-[300px] flex-col items-center justify-center rounded-2xl border border-dashed border-border-main bg-bg-card/30 p-8 text-center text-text-dim">
                <LayoutGrid className="mb-4 size-10 opacity-20" />
                <p className="text-[13px] font-medium">Ninguna mesa encontrada.</p>
                {search && (
                  <button onClick={() => setSearch("")} className="mt-3 text-[11px] font-semibold uppercase tracking-widest text-gold underline-offset-4 hover:underline">
                    Limpiar Búsqueda
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {filtered.map((table) => {
                  const isSelectedToJoin = selectedTablesToJoin.includes(table.id);
                  const isChild = !!table.parentTableId;
                  const hasChildren = tables.some((t) => t.parentTableId === table.id);
                  const statusInfo = STATUS_COLORS[table.status];

                  return (
                    <div
                      key={table.id}
                      onClick={() => {
                        if (isJoinMode && !isChild) toggleTableSelection(table.id, false);
                      }}
                      className={\`group relative flex flex-col overflow-hidden rounded-2xl border \${
                        isSelectedToJoin 
                          ? "border-gold bg-gold/5 shadow-[0_0_15px_rgba(201,160,84,0.15)]" 
                          : "border-border-main bg-bg-card/45 hover:border-border-bright"
                      } p-5 backdrop-blur-sm transition-all duration-200 \${isJoinMode && !isChild ? "cursor-pointer" : ""}\`}
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className={\`flex size-10 items-center justify-center rounded-full \${statusInfo.bg}\`}>
                            <span className={\`font-serif text-lg font-medium \${statusInfo.text}\`}>{table.number}</span>
                          </div>
                          <div>
                            <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint">Capacidad</p>
                            <p className="font-serif text-lg text-text-secondary">{table.capacity} pax</p>
                          </div>
                        </div>

                        {/* Status Label Pill */}
                        <div className={\`rounded-full border px-2.5 py-1 text-[9px] font-bold uppercase tracking-[0.1em] \${statusInfo.border} \${statusInfo.bg} \${statusInfo.text}\`}>
                          {STATUS_LABEL[table.status]}
                        </div>
                      </div>

                      <div className="mb-4">
                        <p className="text-[9px] uppercase tracking-[0.15em] text-text-faint">Identificador de Sesión</p>
                        <p className="font-mono text-[11px] tracking-wide text-text-muted mt-0.5 truncate">{table.qrCode}</p>
                      </div>

                      {/* Parent/Child Indicator */}
                      {(isChild || hasChildren) && (
                        <div className="mb-4 flex items-center justify-between rounded-lg border border-border-main bg-bg-solid/50 px-3 py-2">
                           <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-text-dim">
                             {isChild ? "Mesa unida" : "Mesa principal"}
                           </span>
                           {isChild && (
                             <button
                               onClick={(e) => { e.stopPropagation(); handleSeparate(table.id); }}
                               className="text-[10px] font-bold uppercase tracking-widest text-dash-red hover:text-dash-red/80 transition-colors"
                             >
                               Separar
                             </button>
                           )}
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
                    </div>
                  );
                })}
              </div>
            )
          )}
        </motion.div>
      </motion.div>

      {/* Agregar Nueva Mesa Modal */}
      <AnimatePresence>
        {isAdding && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsAdding(false)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: "spring", duration: 0.5 }}
              className="relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-border-main bg-bg-card shadow-2xl"
            >
              <div className="border-b border-border-main bg-bg-solid/30 px-6 py-4 flex items-center justify-between">
                <h3 className="font-serif text-xl font-medium text-text-primary">Añadir nueva mesa</h3>
                <button onClick={() => setIsAdding(false)} className="text-text-muted hover:text-white transition-colors">
                  <X className="size-4" />
                </button>
              </div>
              
              <div className="p-6">
                <p className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-text-dim">Capacidad esperada (Pax)</p>
                <div className="flex gap-2">
                  {[2, 4, 6, 8, 10, 12].map((cap) => (
                    <button
                      key={cap}
                      onClick={() => setNewTableCap(cap)}
                      className={\`flex-1 rounded-xl py-3 font-serif text-xl transition-colors \${
                        newTableCap === cap
                          ? "bg-gold text-bg-solid font-medium shadow-[0_0_15px_rgba(201,160,84,0.3)]"
                          : "border border-border-bright text-text-secondary hover:border-gold/50"
                      }\`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>

                <p className="mt-8 text-[12px] leading-relaxed text-text-muted border-l-2 border-gold/30 pl-3">
                  Se generará una cadena UUID alfanumérica única para esta mesa automáticamente. El QR podrá descargarse en la vista detallada.
                </p>

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setIsAdding(false)}
                    className="flex-1 rounded-xl border border-border-main py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-dim hover:bg-bg-solid hover:text-text-primary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleCreate}
                    disabled={isPending}
                    className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gold py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-bg-solid transition-all hover:bg-white hover:shadow-[0_0_20px_rgba(201,160,84,0.3)] disabled:opacity-50"
                  >
                    {isPending ? <Loader2 className="size-4 animate-spin" /> : null}
                    {isPending ? "Configurando..." : "Activar Mesa"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
`;

fs.writeFileSync('src/components/dashboard/TableManagerClient.tsx', Buffer.from(code).toString('utf-8'));
