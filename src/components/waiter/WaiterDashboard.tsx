"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "framer-motion";
import { RefreshCw, LayoutGrid, Link as LinkIcon, Users, Wallet, Brush, Sparkles, Plus, QrCode, ListChecks, FileText, History } from "lucide-react";
import { getWaiterTablesSummary, regenerateTableQr, updateTableStatus } from "@/actions/waiter";
import { getTables } from "@/actions/tables";
import { createTableGroup, releaseTableGroup } from "@/actions/table-groups";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import { WifiOff, Wifi } from "lucide-react";
import WaiterTableDetail from "./WaiterTableDetail";
import FloorMapClient from "@/components/dashboard/FloorMapClient";
import { createClient } from "@/lib/supabase/client";
import type { FloorMapTable } from "@/components/dashboard/FloorMap";
import type { TableStatus } from "@/lib/prisma-legacy-types";
import type { WaiterTableSummary } from "./types";
import { WaiterMesaCard } from "./WaiterMesaCard";
import { DynamicIsland } from "./ui/dynamic-island";
import { SegmentedControl, type SegmentedItem } from "./ui/segmented-control";
import { AnimatedNumber } from "./ui/animated-number";
import { MesaCardSkeleton } from "./ui/mesa-card-skeleton";
import { FloatingActionBar, FloatingActionPrimary } from "./ui/floating-action-bar";
import { cn } from "@/lib/utils";

type FilterType = "todas" | "ocupadas" | "pendientes" | "listas" | "sucias";
type ViewType = "lista" | "mapa";

function isTableBusy(status: TableStatus) {
  return status === "OCUPADA" || status === "CERRANDO";
}

function matchesFilter(t: WaiterTableSummary, filter: FilterType) {
  if (filter === "ocupadas") return isTableBusy(t.status);
  if (filter === "pendientes") return t.pendingCount > 0;
  if (filter === "listas") return t.readyCount > 0;
  if (filter === "sucias") return t.status === "SUCIA";
  return true;
}

export default function WaiterDashboard({
  allowJoinTables = false,
  restaurantId,
  restaurantName,
}: {
  allowJoinTables?: boolean;
  restaurantId?: string;
  restaurantName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const networkStatus = useNetworkStatus();
  const [tables, setTables] = useState<WaiterTableSummary[]>([]);
  const [mapTables, setMapTables] = useState<FloorMapTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterType>("todas");
  const [view, setView] = useState<ViewType>("mapa");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);
  const [showMapSeatGlyphs, setShowMapSeatGlyphs] = useState(true);

  const [isJoinMode, setIsJoinMode] = useState(false);
  const [selectedTablesToJoin, setSelectedTablesToJoin] = useState<string[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [banner, setBanner] = useState<string | null>(null);
  const prevReadySum = useRef(-1);

  const [confirmQr, setConfirmQr] = useState<{ id: string; number: number } | null>(null);
  const [qrErrorByTable, setQrErrorByTable] = useState<Record<string, string>>({});

  const loadTables = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      const [summary, full] = await Promise.all([getWaiterTablesSummary(), getTables()]);
      setTables(summary as WaiterTableSummary[]);
      setMapTables(full);
    } catch (error) {
      console.error("Error loading tables:", error);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const sum = tables.reduce((s, t) => s + t.readyCount, 0);
    if (prevReadySum.current === -1) {
      prevReadySum.current = sum;
      return;
    }
    if (sum > prevReadySum.current) {
      setBanner("Hay platos listos para servir");
      const t = window.setTimeout(() => setBanner(null), 3200);
      prevReadySum.current = sum;
      return () => window.clearTimeout(t);
    }
    prevReadySum.current = sum;
  }, [tables]);

  const handleManualRefresh = () => {
    setRefreshing(true);
    void loadTables({ silent: true }).finally(() => setRefreshing(false));
  };

  const handleCleanTable = async (tableId: string) => {
    try {
      await updateTableStatus(tableId, "DISPONIBLE");
      await loadTables({ silent: true });
    } catch (error) {
      console.error("Error cleaning table:", error);
      setToast({ type: "error", message: "Error al liberar la mesa" });
    }
  };

  const openTableDetail = async (table: WaiterTableSummary) => {
    if (isJoinMode) return;
    setSelectedTable(table.id);
  };

  const handleRegenerateQr = async (tableId: string, tableNumber: number) => {
    if (confirmQr?.id !== tableId) {
      setConfirmQr({ id: tableId, number: tableNumber });
      window.setTimeout(() => setConfirmQr(null), 4000);
      return;
    }
    setConfirmQr(null);
    try {
      const result = await regenerateTableQr(tableId);
      setToast({ type: "success", message: `Mesa ${tableNumber}: nuevo QR ${result.qrCode}` });
      setQrErrorByTable((prev) => {
        const n = { ...prev };
        delete n[tableId];
        return n;
      });
      await loadTables({ silent: true });
    } catch (error) {
      console.error("Error regenerating table QR:", error);
      const msg = (error as Error).message || "Error regenerando el QR";
      setQrErrorByTable((prev) => ({ ...prev, [tableId]: msg }));
      window.setTimeout(() => {
        setQrErrorByTable((prev) => {
          const n = { ...prev };
          delete n[tableId];
          return n;
        });
      }, 4000);
    }
  };

  const handleToggleJoinTable = (tableId: string, isInGroup: boolean) => {
    if (isInGroup) return;
    setSelectedTablesToJoin((prev) =>
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId],
    );
  };

  const handleConfirmJoin = async () => {
    if (selectedTablesToJoin.length < 2) return;
    setIsJoining(true);
    try {
      // Validate all selected tables are DISPONIBLE
      const selectedData = tables.filter((t) => selectedTablesToJoin.includes(t.id));
      const notAvailable = selectedData.filter((t) => t.status !== "DISPONIBLE");
      if (notAvailable.length > 0) {
        const nums = notAvailable.map((t) => t.number).join(", ");
        setToast({ type: "error", message: `Mesa${notAvailable.length > 1 ? "s" : ""} ${nums} no disponible${notAvailable.length > 1 ? "s" : ""}` });
        return;
      }
      await createTableGroup(selectedTablesToJoin, "waiter");
      await loadTables({ silent: true });
      setIsJoinMode(false);
      setSelectedTablesToJoin([]);
      setToast({ type: "success", message: "Mesas unidas correctamente" });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error al unir mesas";
      setToast({ type: "error", message: msg });
    } finally {
      setIsJoining(false);
    }
  };

  const handleReleaseGroup = async (groupId: string) => {
    try {
      await releaseTableGroup(groupId);
      await loadTables({ silent: true });
      setToast({ type: "success", message: "Grupo deshecho correctamente" });
    } catch (err) {
      console.error(err);
      const msg = err instanceof Error ? err.message : "Error al deshacer el grupo";
      setToast({ type: "error", message: msg });
    }
  };

  useEffect(() => {
    void loadTables({ silent: false });
    const interval = window.setInterval(() => void loadTables({ silent: true }), 10000);
    return () => window.clearInterval(interval);
  }, [loadTables]);

  useEffect(() => {
    if (!restaurantId) return;
    const supabase = createClient();
    const channelName = `kds-orders:${encodeURIComponent(restaurantId)}`;
    const channel = supabase.channel(channelName).on("broadcast", { event: "refresh" }, () => {
      void loadTables({ silent: true });
    });
    void channel.subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, loadTables]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(null), 3500);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const filteredTables = useMemo(() => tables.filter((t) => matchesFilter(t, filter)), [tables, filter]);

  const sortedFilteredTables = useMemo(() => {
    const list = [...filteredTables];
    list.sort((a, b) => {
      const score = (t: WaiterTableSummary) =>
        (t.readyCount > 0 ? 1000 : 0) +
        (t.pendingCount > 0 ? 120 : 0) +
        (t.status === "SUCIA" ? 80 : 0) +
        (isTableBusy(t.status) ? 40 : 0);
      return score(b) - score(a);
    });
    return list;
  }, [filteredTables]);

  const groupedSortedFilteredTables = useMemo(() => {
    const grouped: (WaiterTableSummary & { label?: string })[] = [];
    const groupMap = new Map<string, WaiterTableSummary[]>();

    for (const t of sortedFilteredTables) {
      if (t.groupId) {
        if (!groupMap.has(t.groupId)) groupMap.set(t.groupId, []);
        groupMap.get(t.groupId)!.push(t);
      } else {
        grouped.push({ ...t });
      }
    }

    for (const [gid, items] of groupMap.entries()) {
      let readyCount = 0, pendingCount = 0;
      const labels: number[] = [];

      for (const it of items) {
        readyCount += it.readyCount ?? 0;
        pendingCount += it.pendingCount ?? 0;
        labels.push(it.number);
      }
      labels.sort((a,b) => a - b);
      const label = labels.join("·");
      
      const firstTable = items[0];
      grouped.push({
        ...firstTable,
        readyCount,
        pendingCount,
        label,
      });
    }

    // sort again to keep numerical order
    grouped.sort((a, b) => a.number - b.number);
    
    return grouped;
  }, [sortedFilteredTables]);

  const filteredMapTables = useMemo(() => {
    const tableMap = new Map(filteredTables.map((t) => [t.id, t]));
    return mapTables
      .filter((t) => tableMap.has(t.id))
      .map((t) => {
        const wt = tableMap.get(t.id)!;
        return {
          ...t,
          readyCount: wt.readyCount,
          pendingCount: wt.pendingCount,
          activeSession: wt.activeSession,
        };
      });
  }, [mapTables, filteredTables]);

  const stats = useMemo(() => {
    const occupied = tables.filter((t) => isTableBusy(t.status)).length;
    const pending = tables.reduce((sum, t) => sum + t.pendingCount, 0);
    const ready = tables.reduce((sum, t) => sum + t.readyCount, 0);
    const dirty = tables.filter((t) => t.status === "SUCIA").length;
    return { occupied, pending, ready, dirty };
  }, [tables]);

  // Auto-reset alert filters when items successfully reach 0
  useEffect(() => {
    if (filter === "listas" && stats.ready === 0) setFilter("todas");
    if (filter === "pendientes" && stats.pending === 0) setFilter("todas");
  }, [filter, stats.ready, stats.pending]);

  const weekdayLabel = useMemo(() => {
    const raw = new Intl.DateTimeFormat("es-MX", { weekday: "long" }).format(new Date());
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, []);

  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => setTick((x) => x + 1), 60000);
    return () => window.clearInterval(id);
  }, []);

  const clockLive = useMemo(() => {
    void tick;
    return new Intl.DateTimeFormat("es-MX", {
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date());
  }, [tick]);

  const filterItems: SegmentedItem<FilterType>[] = [
    { id: "todas", label: "Todas" },
    { id: "ocupadas", label: "Ocupadas", count: stats.occupied, dotClass: "bg-gold" },
    { id: "pendientes", label: "Cocina", count: stats.pending, dotClass: "bg-gold/70" },
    { id: "listas", label: "Listos", count: stats.ready, dotClass: "bg-dash-green" },
    { id: "sucias", label: "Limpiar", count: stats.dirty, dotClass: "bg-dash-red" },
  ];

  const viewItems: SegmentedItem<ViewType>[] = [
    { id: "lista", label: "Lista", dotClass: "bg-text-muted" },
    { id: "mapa", label: "Mapa", dotClass: "bg-text-muted" },
  ];

  const filterLabelById: Record<FilterType, string> = {
    todas: "Todas",
    ocupadas: "Ocupadas",
    pendientes: "Cocina",
    listas: "Listos",
    sucias: "Limpiar",
  };

  return (
    <div className="relative min-h-[100dvh] overflow-x-hidden bg-bg-solid text-text-primary">
      {refreshing && tables.length > 0 && (
        <div
          className="pointer-events-none fixed inset-x-0 top-0 z-[75] h-px overflow-hidden"
          aria-hidden
        >
          <div className="waiter-sync-scan h-full w-[45%] bg-gradient-to-r from-transparent via-gold/55 to-transparent" />
        </div>
      )}

      {toast && (
        <div
          className="fixed inset-x-0 top-4 z-[80] flex justify-center px-4"
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          style={{
            animation: reduceMotion ? undefined : "fade-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both",
          }}
        >
          <div
            className={`flex items-center gap-3 rounded-full border px-5 py-2.5 shadow-[0_14px_36px_rgba(9,9,7,0.55)] backdrop-blur-md ${
              toast.type === "error"
                ? "border-dash-red/50 bg-dash-red/15 text-dash-red"
                : "border-dash-green/50 bg-dash-green/15 text-dash-green"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${toast.type === "error" ? "animate-pulse bg-dash-red" : "bg-dash-green"}`}
              aria-hidden
            />
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]">{toast.message}</p>
          </div>
        </div>
      )}

      <AnimatePresence>
        {networkStatus !== "online" && (
          <motion.div
            key={networkStatus}
            role="status"
            aria-live="polite"
            initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            className={`sticky top-0 z-[70] flex items-center justify-center gap-3 border-b px-4 py-2 ${
              networkStatus === "offline"
                ? "border-dash-red/30 bg-dash-red/10"
                : "border-gold/30 bg-gold/10"
            }`}
          >
            {/* pulsing dot */}
            <span className="relative flex size-1.5 shrink-0">
              <span
                className={`absolute inline-flex size-full animate-ping rounded-full opacity-60 ${
                  networkStatus === "offline" ? "bg-dash-red" : "bg-gold"
                }`}
              />
              <span
                className={`relative inline-flex size-1.5 rounded-full ${
                  networkStatus === "offline" ? "bg-dash-red" : "bg-gold"
                }`}
              />
            </span>

            {networkStatus === "offline" ? (
              <WifiOff
                className="size-3.5 shrink-0 text-dash-red"
                strokeWidth={2}
                aria-hidden
              />
            ) : (
              <Wifi
                className="size-3.5 shrink-0 text-gold"
                strokeWidth={2}
                aria-hidden
              />
            )}

            <span
              className={`font-mono text-[10px] font-bold uppercase tracking-[0.16em] ${
                networkStatus === "offline" ? "text-dash-red" : "text-gold"
              }`}
            >
              {networkStatus === "offline"
                ? "Sin conexión · Los datos no se actualizarán"
                : "Señal débil · La sincronización puede tardar"}
            </span>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 px-4 pb-28 pt-4 sm:px-6 lg:px-8 lg:pt-5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-5">
          <header className="flex flex-col gap-4 border-b border-border-main/70 pb-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
              <div className="space-y-1.5">
                <p className="font-mono text-[10px] font-bold uppercase tracking-[0.25em] text-pink-glow/80">
                  {restaurantName ? `SUCURSAL ${restaurantName.toUpperCase()}` : "SUCURSAL LINDAVISTA"}
                </p>
                <div className="flex items-center gap-3">
                  <h1 className="font-serif text-[40px] md:text-[44px] font-medium leading-none tracking-tight text-light">
                    Mesas
                  </h1>
                  <div className="flex items-center gap-2 rounded-full border border-pink-glow/30 bg-pink-glow/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.15em] text-pink-glow">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-pink-glow opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-pink-glow shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
                    </span>
                    EN VIVO
                  </div>
                </div>
                <div className="flex items-center gap-2 pt-1 font-mono text-[11px] text-text-muted">
                  <AnimatedNumber value={stats.occupied} /> en piso · {clockLive} {new Date().getHours() >= 12 ? 'P.M.' : 'A.M.'}
                  <DynamicIsland loading={refreshing} banner={banner} />
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <SegmentedControl
                  pillLayoutId="waiter-view-pill"
                  items={viewItems}
                  value={view}
                  onChange={setView}
                />

                {filter !== "todas" && (
                  <button
                    type="button"
                    onClick={() => setFilter("todas")}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 text-xs font-semibold uppercase tracking-[0.12em] text-gold transition hover:bg-gold/15 active:scale-[0.98]"
                  >
                    Filtro: {filterLabelById[filter]} · Ver todas
                  </button>
                )}

                {allowJoinTables && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsJoinMode(!isJoinMode);
                      setSelectedTablesToJoin([]);
                    }}
                    className={`inline-flex min-h-11 items-center gap-2 rounded-full border px-4 text-xs font-medium transition active:scale-[0.98] ${
                      isJoinMode
                        ? "border-gold bg-gold/15 text-gold"
                        : "border-border-main text-text-muted hover:border-border-bright hover:text-light"
                    }`}
                  >
                    <LinkIcon className="h-4 w-4 shrink-0" aria-hidden strokeWidth={1.8} />
                    {isJoinMode ? "Cancelar unión" : "Unir mesas"}
                  </button>
                )}

              </div>
            </div>

            <div className="flex flex-col gap-3">
              {(() => {
                const kpis = [
                  { id: "activas", label: "ACTIVAS", value: stats.occupied, icon: Users, colorClass: "text-pink-glow border-pink-glow/30 bg-pink-glow/[0.08]" },
                  { id: "por-cobrar", label: "POR COBRAR", value: stats.pending, icon: Wallet, colorClass: "text-dash-amber border-dash-amber/30 bg-dash-amber/[0.08]" },
                  { id: "por-limpiar", label: "POR LIMPIAR", value: stats.dirty, icon: Brush, colorClass: "text-text-muted border-border-main bg-white/[0.03]" },
                  { id: "nuevas", label: "NUEVAS", value: stats.ready, icon: Sparkles, colorClass: "text-pink-light-glow border-pink-light-glow/30 bg-pink-light-glow/[0.08] shadow-[0_0_15px_rgba(244,114,182,0.1)]" },
                ];
                return (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
                    {kpis.map(({ id, label, value, icon: Icon, colorClass }) => (
                      <div
                        key={id}
                        className="flex items-center gap-4 rounded-xl border border-white/[0.06] bg-bg-card px-4 py-3 shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)]"
                      >
                        <div className={cn("flex size-10 shrink-0 items-center justify-center rounded-xl border", colorClass)}>
                          <Icon className="size-4" />
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[9px] font-bold uppercase tracking-[0.18em] text-text-muted/80">{label}</p>
                          <p className="font-serif text-[1.5rem] font-bold tabular-nums leading-none text-light">
                            <AnimatedNumber value={value} />
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}

              <AnimatePresence>
                {(stats.ready > 0 || stats.pending > 0) && (
                  <motion.div
                    initial={reduceMotion ? undefined : { opacity: 0, height: 0, scale: 0.95 }}
                    animate={{ opacity: 1, height: "auto", scale: 1 }}
                    exit={reduceMotion ? undefined : { opacity: 0, height: 0, scale: 0.95 }}
                    className="flex flex-col gap-2 overflow-hidden"
                  >
                    {stats.ready > 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilter("listas");
                          setView("lista");
                        }}
                        className="group relative flex w-full items-center gap-4 overflow-hidden rounded-2xl border border-dash-green/40 bg-dash-green/10 p-4 shadow-[0_4px_24px_-8px_rgba(34,197,94,0.3)] transition-all hover:bg-dash-green/15 active:scale-[0.98] text-left"
                      >
                        <span className="absolute left-0 top-0 h-full w-1 animate-pulse bg-dash-green" aria-hidden />
                        <div className="flex-1">
                          <h3 className="flex items-center gap-2 text-lg font-semibold text-light group-hover:text-dash-green transition-colors">
                            <span className="relative flex h-3 w-3">
                              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dash-green opacity-75" />
                              <span className="relative inline-flex h-3 w-3 rounded-full bg-dash-green" />
                            </span>
                            {stats.ready} {stats.ready === 1 ? "platillo listo" : "platillos listos"}
                          </h3>
                          <p className="mt-1 text-sm text-text-muted">Toca para ver las mesas que requieren servicio inmediato.</p>
                        </div>
                      </button>
                    )}
                    {stats.pending > 0 && stats.ready === 0 && (
                      <button
                        type="button"
                        onClick={() => {
                          setFilter("pendientes");
                          setView("lista");
                        }}
                        className="group flex w-full items-center justify-between rounded-2xl border border-gold/20 bg-gold/5 px-4 py-3 transition-colors hover:bg-gold/10 active:scale-[0.98] text-left"
                      >
                        <span className="text-sm text-text-muted">
                          <strong className="text-light">{stats.pending}</strong> {stats.pending === 1 ? "plato en preparación" : "platos en preparación"}
                        </span>
                        <span className="text-xs font-semibold text-gold group-hover:underline">Ver mesas</span>
                      </button>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </header>

          {view === "lista" && (
            <section className="overflow-x-auto scrollbar-hide pb-1">
              <SegmentedControl
                pillLayoutId="waiter-filter-pill"
                items={filterItems}
                value={filter}
                onChange={setFilter}
                scrollClassName="snap-x overflow-x-auto scrollbar-hide pb-1"
              />
            </section>
          )}

          {view === "mapa" && (
            <div className="flex flex-col lg:flex-row items-stretch gap-4">
              <section className={cn(
                "relative overflow-hidden rounded-[1.25rem] border border-border-main bg-bg-card transition-all flex-1",
                selectedTable ? "hidden lg:block lg:flex-[2]" : "block"
              )}>
                {loading && mapTables.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                    <RefreshCw className="mb-3 h-7 w-7 animate-spin" strokeWidth={1.6} aria-hidden />
                    <p className="text-sm">Cargando mapa…</p>
                  </div>
                ) : (
                  <div className="relative h-full min-h-[500px]">
                    <FloorMapClient
                      tables={filteredMapTables}
                      readOnly
                      showSeatGlyphs={showMapSeatGlyphs}
                      showOperationsBar={false}
                      onTableClick={(id) => {
                        const t = tables.find((x) => x.id === id);
                        if (!t) return;
                        if (t.status === "SUCIA") {
                          void handleCleanTable(t.id);
                          return;
                        }
                        void openTableDetail(t);
                      }}
                    />
                  </div>
                )}
              </section>

              <AnimatePresence>
                {selectedTable && (
                  <motion.aside
                    initial={{ opacity: 0, x: 20, width: 0 }}
                    animate={{ opacity: 1, x: 0, width: "auto" }}
                    exit={{ opacity: 0, x: 20, width: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    className="w-full shrink-0 overflow-hidden lg:w-[380px]"
                  >
                    <div className="h-full w-full lg:w-[380px] rounded-[1.25rem] border border-border-main bg-bg-card">
                      <WaiterTableDetail
                        tableId={selectedTable}
                        restaurantId={restaurantId}
                        presentation="inline"
                        onClose={() => setSelectedTable(null)}
                        onRefresh={() => {
                          void loadTables({ silent: true });
                        }}
                      />
                    </div>
                  </motion.aside>
                )}
              </AnimatePresence>
            </div>
          )}

          {view === "lista" && (
            <LayoutGroup>
              <section className="space-y-4">
                {loading && tables.length === 0 ? (
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <MesaCardSkeleton key={i} />
                    ))}
                  </div>
                ) : sortedFilteredTables.length === 0 ? (
                  <div className="rounded-[1.25rem] border border-dashed border-border-main bg-bg-card px-6 py-16 text-center">
                    <LayoutGrid className="mx-auto mb-4 h-12 w-12 text-text-muted/50" strokeWidth={1.2} aria-hidden />
                    <p className="text-sm text-text-muted">No hay mesas con este filtro.</p>
                    <button
                      type="button"
                      onClick={() => setFilter("todas")}
                      className="mt-6 inline-flex min-h-11 items-center justify-center rounded-full border border-border-bright bg-bg-solid px-6 text-xs font-semibold text-light transition hover:border-gold hover:text-gold active:scale-[0.98]"
                    >
                      Ver todas las mesas
                    </button>
                  </div>
                ) : (
                  <motion.div
                    className="grid grid-cols-1 items-stretch gap-3 sm:grid-cols-2 xl:grid-cols-3"
                    initial={reduceMotion ? false : "hidden"}
                    animate="show"
                    variants={{
                      hidden: {},
                      show: {
                        transition: { staggerChildren: reduceMotion ? 0 : 0.04 },
                      },
                    }}
                  >
                    {groupedSortedFilteredTables.map((table) => {
                      const isSelectedToJoin = selectedTablesToJoin.includes(table.id);
                      const isInGroup = !!table.groupId;

                      return (
                        <motion.div
                          key={table.id}
                          className="h-full min-h-0"
                          variants={{
                            hidden: { opacity: 0, y: 8 },
                            show: {
                              opacity: 1,
                              y: 0,
                              transition: { type: "spring", stiffness: 380, damping: 28 },
                            },
                          }}
                        >
                          <WaiterMesaCard
                            table={table}
                            allowJoinTables={allowJoinTables}
                            isJoinMode={isJoinMode}
                            isSelectedToJoin={isSelectedToJoin}
                            joinOrderIndex={selectedTablesToJoin.indexOf(table.id)}
                            isInGroup={isInGroup}
                            qrError={qrErrorByTable[table.id]}
                            confirmQrId={confirmQr?.id ?? null}
                            label={table.label}
                            onCardClick={() => {
                              if (isJoinMode) {
                                handleToggleJoinTable(table.id, isInGroup);
                              } else {
                                void openTableDetail(table);
                              }
                            }}
                            onClean={() => void handleCleanTable(table.id)}
                            onRegenerateQr={() => void handleRegenerateQr(table.id, table.number)}
                            onSeparate={() => {
                              if (table.groupId) void handleReleaseGroup(table.groupId);
                            }}
                          />
                        </motion.div>
                      );
                    })}
                  </motion.div>
                )}
              </section>
            </LayoutGroup>
          )}

          {/* Bottom Action Bar */}
          <div className="sticky bottom-0 z-40 -mx-4 mt-4 border-t border-border-main/50 bg-bg-solid/90 p-4 backdrop-blur-xl sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
            <div className="mx-auto flex w-full max-w-7xl items-center gap-3 overflow-x-auto scrollbar-hide pb-2 lg:pb-0">
              <button className="group inline-flex min-h-[52px] shrink-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-bg-card px-4 text-[11px] font-semibold text-light shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] transition-colors hover:bg-white/5 hover:border-pink-glow/30">
                <span className="flex size-7 items-center justify-center rounded-full border border-pink-glow/30 text-pink-glow group-hover:bg-pink-glow/10 transition-colors">
                  <Plus className="size-4" />
                </span>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">Nueva mesa</span>
                  <span className="text-[9.5px] font-normal text-text-muted">Abrir nueva mesa</span>
                </div>
              </button>
              <button className="group inline-flex min-h-[52px] shrink-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-bg-card px-4 text-[11px] font-semibold text-light shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] transition-colors hover:bg-white/5 hover:border-pink-glow/30">
                <div className="flex size-7 items-center justify-center rounded-lg bg-pink-glow/10 text-pink-glow group-hover:bg-pink-glow/20 transition-colors">
                  <QrCode className="size-4" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">Generar QR</span>
                  <span className="text-[9.5px] font-normal text-text-muted">Código de menú</span>
                </div>
              </button>
              <button 
                onClick={() => setView("lista")}
                className="group inline-flex min-h-[52px] shrink-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-bg-card px-4 text-[11px] font-semibold text-light shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] transition-colors hover:bg-white/5 hover:border-pink-glow/30"
              >
                <div className="flex size-7 items-center justify-center rounded-lg bg-pink-glow/10 text-pink-glow group-hover:bg-pink-glow/20 transition-colors">
                  <ListChecks className="size-4" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">Cambiar a lista</span>
                  <span className="text-[9.5px] font-normal text-text-muted">Ver todas las mesas</span>
                </div>
              </button>
              <button className="group inline-flex min-h-[52px] shrink-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-bg-card px-4 text-[11px] font-semibold text-light shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] transition-colors hover:bg-white/5 hover:border-pink-glow/30">
                <div className="flex size-7 items-center justify-center rounded-lg bg-pink-glow/10 text-pink-glow group-hover:bg-pink-glow/20 transition-colors relative">
                  <FileText className="size-4" />
                  {stats.pending > 0 && (
                    <span className="absolute -top-1.5 -right-1.5 flex size-4 items-center justify-center rounded-full bg-pink-glow font-mono text-[9px] font-bold text-ink shadow-[0_0_8px_rgba(244,114,182,0.8)]">
                      {stats.pending}
                    </span>
                  )}
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">Ver comandas</span>
                  <span className="text-[9.5px] font-normal text-text-muted">Órdenes activas</span>
                </div>
              </button>
              <button className="group inline-flex min-h-[52px] shrink-0 items-center gap-3 rounded-xl border border-white/[0.06] bg-bg-card px-4 text-[11px] font-semibold text-light shadow-[inset_0_1px_1px_rgba(255,255,255,0.03)] transition-colors hover:bg-white/5 hover:border-pink-glow/30">
                <div className="flex size-7 items-center justify-center rounded-lg bg-pink-glow/10 text-pink-glow group-hover:bg-pink-glow/20 transition-colors">
                  <History className="size-4" />
                </div>
                <div className="flex flex-col items-start leading-tight">
                  <span className="font-bold">Historial</span>
                  <span className="text-[9.5px] font-normal text-text-muted">Tickets y movimientos</span>
                </div>
              </button>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {isJoinMode && (
          <FloatingActionBar key="fab-join">
            <div className="flex flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center">
              <button
                type="button"
                onClick={() => {
                  setIsJoinMode(false);
                  setSelectedTablesToJoin([]);
                }}
                className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-full border border-border-main px-4 text-xs font-semibold text-text-muted transition hover:border-border-bright hover:text-light active:scale-[0.98]"
              >
                Cancelar
              </button>
              <div className="flex min-h-11 flex-1 flex-wrap items-center gap-2">
                <AnimatePresence>
                  {selectedTablesToJoin.map((id) => {
                    const num = tables.find((t) => t.id === id)?.number ?? "?";
                    return (
                      <motion.span
                        key={id}
                        layout
                        initial={{ opacity: 0, scale: 0.85 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.85 }}
                        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-gold/40 bg-gold/15 font-mono text-sm font-bold text-gold"
                      >
                        {num}
                      </motion.span>
                    );
                  })}
                </AnimatePresence>
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                  {selectedTablesToJoin.length} seleccionadas
                </span>
              </div>
              <FloatingActionPrimary
                label="Confirmar unión"
                disabled={selectedTablesToJoin.length < 2}
                busy={isJoining}
                onClick={() => void handleConfirmJoin()}
              />
            </div>
          </FloatingActionBar>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      ` }} />
    </div>
  );
}
