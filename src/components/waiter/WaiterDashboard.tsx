"use client";

import { useState, useEffect, useCallback } from "react";
import { Users, RefreshCw, LayoutGrid, Map, Link as LinkIcon, Unlink, QrCode } from "lucide-react";
import { getWaiterTablesSummary, regenerateTableQr, updateTableStatus } from "@/actions/waiter";
import { getTables, joinTables, separateTable } from "@/actions/tables";
import WaiterTableDetail from "./WaiterTableDetail";
import FloorMapClient from "@/components/dashboard/FloorMapClient";
import { createClient } from "@/lib/supabase/client";
import type { FloorMapTable } from "@/components/dashboard/FloorMap";
import type { TableStatus } from "@/generated/prisma";

const MXN_FORMATTER = new Intl.NumberFormat("es-MX", {
  maximumFractionDigits: 0,
});

type FilterType = "todas" | "ocupadas" | "pendientes" | "listas" | "sucias";
type ViewType = "lista" | "mapa";

interface TableSummary {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  parentTableId: string | null;
  qrCode: string;
  activeSession: { guestName: string; pax: number; createdAt: Date } | null;
  orderCount: number;
  pendingCount: number;
  readyCount: number;
  billTotal: number;
}

function isTableBusy(status: TableStatus) {
  return status === "OCUPADA" || status === "CERRANDO";
}

function tableStatusLabel(status: TableStatus) {
  if (status === "DISPONIBLE") return "Libre";
  if (status === "OCUPADA") return "Activa";
  if (status === "CERRANDO") return "Cuenta";
  return "Limpieza";
}

function tableTone(status: TableStatus) {
  if (status === "DISPONIBLE") {
    return {
      card: "border-border-main bg-bg-card border-l-4 border-l-dash-green hover:border-border-bright",
      chip: "border-border-main bg-bg-solid/80 text-dash-green",
    };
  }
  if (status === "OCUPADA") {
    return {
      card: "border-border-main bg-bg-card border-l-4 border-l-gold/80 hover:border-border-bright",
      chip: "border-border-main bg-bg-solid/80 text-light",
    };
  }
  if (status === "CERRANDO") {
    return {
      card: "border-border-main bg-bg-card border-l-4 border-l-gold hover:border-gold/50",
      chip: "border-border-main bg-bg-solid/80 text-gold",
    };
  }
  return {
    card: "border-border-main bg-bg-card border-l-4 border-l-dash-red hover:border-dash-red/60",
    chip: "border-border-main bg-bg-solid/80 text-dash-red",
  };
}

export default function WaiterDashboard({
  allowJoinTables = false,
  restaurantId,
}: {
  allowJoinTables?: boolean;
  restaurantId?: string;
}) {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [mapTables, setMapTables] = useState<FloorMapTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("todas");
  const [view, setView] = useState<ViewType>("lista");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

  const [isJoinMode, setIsJoinMode] = useState(false);
  const [selectedTablesToJoin, setSelectedTablesToJoin] = useState<string[]>([]);
  const [isJoining, setIsJoining] = useState(false);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const loadTables = useCallback(async () => {
    try {
      setLoading(true);
      const [summary, full] = await Promise.all([
        getWaiterTablesSummary(),
        getTables(),
      ]);
      setTables(summary);
      setMapTables(full);
    } catch (error) {
      console.error("Error loading tables:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCleanTable = async (tableId: string) => {
    try {
      await updateTableStatus(tableId, "DISPONIBLE");
      await loadTables();
    } catch (error) {
      console.error("Error cleaning table:", error);
      setToast({ type: "error", message: "Error al liberar la mesa" });
    }
  };

  const openTableDetail = async (table: TableSummary) => {
    if (isJoinMode) return;

    if (table.status === "DISPONIBLE") {
      try {
        await regenerateTableQr(table.id);
        await loadTables();
        setToast({
          type: "success",
          message: `Mesa ${table.number}: código QR actualizado`,
        });
      } catch (error) {
        console.error(error);
        setToast({
          type: "error",
          message: (error as Error).message || "No se pudo generar el QR",
        });
        return;
      }
    } else if (!isTableBusy(table.status)) {
      return;
    }

    setSelectedTable(table.id);
  };

  const [confirmQr, setConfirmQr] = useState<{ id: string; number: number } | null>(null);

  const handleRegenerateQr = async (tableId: string, tableNumber: number) => {
    if (confirmQr?.id !== tableId) {
      setConfirmQr({ id: tableId, number: tableNumber });
      setTimeout(() => setConfirmQr(null), 4000);
      return;
    }
    setConfirmQr(null);
    try {
      const result = await regenerateTableQr(tableId);
      setToast({ type: "success", message: `Mesa ${tableNumber}: nuevo QR ${result.qrCode}` });
      await loadTables();
    } catch (error) {
      console.error("Error regenerating table QR:", error);
      setToast({ type: "error", message: (error as Error).message || "Error regenerando el QR" });
    }
  };

  const handleToggleJoinTable = (tableId: string, isParent: boolean) => {
    if (isParent) return;
    setSelectedTablesToJoin((prev) => 
      prev.includes(tableId) ? prev.filter((id) => id !== tableId) : [...prev, tableId]
    );
  };

  const handleConfirmJoin = async () => {
    if (selectedTablesToJoin.length < 2) return;
    setIsJoining(true);
    const [parentId, ...childIds] = selectedTablesToJoin;
    try {
      await joinTables(parentId, childIds);
      await loadTables();
      setIsJoinMode(false);
      setSelectedTablesToJoin([]);
    } catch(err) {
      console.error(err);
      setToast({ type: "error", message: "Error al unir mesas" });
    } finally {
      setIsJoining(false);
    }
  };

  const handleSeparate = async (childId: string) => {
    try {
      await separateTable(childId);
      await loadTables();
    } catch(err) {
      console.error(err);
      setToast({ type: "error", message: "Error al separar la mesa" });
    }
  };

  useEffect(() => {
    loadTables();
    const interval = setInterval(loadTables, 10000);
    return () => clearInterval(interval);
  }, [loadTables]);

  useEffect(() => {
    if (!restaurantId) return;
    const supabase = createClient();
    const channelName = `kds-orders:${encodeURIComponent(restaurantId)}`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "refresh" }, () => {
        void loadTables();
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, loadTables]);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  // Filter tables
  const filteredTables = tables.filter((t) => {
    if (filter === "ocupadas") return isTableBusy(t.status);
    if (filter === "pendientes") return t.pendingCount > 0;
    if (filter === "listas") return t.readyCount > 0;
    if (filter === "sucias") return t.status === "SUCIA";
    return true;
  });

  // Calculate stats
  const stats = {
    occupied: tables.filter((t) => isTableBusy(t.status)).length,
    pending: tables.reduce((sum, t) => sum + t.pendingCount, 0),
    ready: tables.reduce((sum, t) => sum + t.readyCount, 0),
    dirty: tables.filter((t) => t.status === "SUCIA").length,
    revenue: tables.reduce((sum, t) => sum + t.billTotal, 0),
  };

  const filterItems: Array<{
    id: FilterType;
    label: string;
    count?: number;
  }> = [
    { id: "todas", label: "Todas" },
    { id: "ocupadas", label: "Ocupadas", count: stats.occupied },
    { id: "pendientes", label: "En cocina", count: stats.pending },
    { id: "listas", label: "Listos", count: stats.ready },
    { id: "sucias", label: "Limpiar", count: stats.dirty },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden bg-bg-solid text-text-primary">
      {toast && (
        <div
          className="fixed inset-x-0 top-4 z-[80] flex justify-center px-4"
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          style={{ animation: "fade-in 0.28s cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          <div
            className={`flex items-center gap-3 rounded-full border px-5 py-2.5 shadow-[0_12px_35px_rgba(0,0,0,0.45)] backdrop-blur-md ${
              toast.type === "error"
                ? "border-dash-red/50 bg-dash-red/15 text-dash-red"
                : "border-dash-green/50 bg-dash-green/15 text-dash-green"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${toast.type === "error" ? "animate-pulse bg-dash-red" : "bg-dash-green"}`}
              aria-hidden="true"
            />
            <p className="font-mono text-[11px] font-bold uppercase tracking-[0.16em]">{toast.message}</p>
          </div>
        </div>
      )}

      <main className="relative z-10 px-4 pb-10 pt-4 sm:px-6 lg:px-8 lg:pt-5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4">
          <header className="flex flex-col gap-3 border-b border-border-main/70 pb-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex flex-wrap items-baseline gap-3">
                <h1 className="text-xl font-semibold tracking-tight text-light sm:text-2xl">Mesas</h1>
                <span className="text-xs text-text-muted">
                  <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${loading ? "animate-pulse bg-text-muted" : "bg-dash-green"}`} aria-hidden />
                  {loading ? "Actualizando…" : "En vivo"}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <div className="flex rounded-lg border border-border-main bg-bg-card p-0.5">
                  <button
                    type="button"
                    onClick={() => setView("lista")}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium ${
                      view === "lista" ? "bg-bg-solid text-light" : "text-text-muted hover:text-light"
                    }`}
                  >
                    <LayoutGrid className="h-3.5 w-3.5" aria-hidden /> Lista
                  </button>
                  <button
                    type="button"
                    onClick={() => setView("mapa")}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-medium ${
                      view === "mapa" ? "bg-bg-solid text-light" : "text-text-muted hover:text-light"
                    }`}
                  >
                    <Map className="h-3.5 w-3.5" aria-hidden /> Mapa
                  </button>
                </div>

                {allowJoinTables && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsJoinMode(!isJoinMode);
                      setSelectedTablesToJoin([]);
                    }}
                    className={`inline-flex min-h-9 items-center gap-1.5 rounded-lg border px-3 text-xs font-medium ${
                      isJoinMode ? "border-gold bg-gold/15 text-gold" : "border-border-main text-text-muted hover:border-border-bright hover:text-light"
                    }`}
                  >
                    <LinkIcon className="h-3.5 w-3.5" aria-hidden />
                    {isJoinMode ? "Cancelar unión" : "Unir mesas"}
                  </button>
                )}

                {isJoinMode && selectedTablesToJoin.length >= 2 && (
                  <button
                    type="button"
                    onClick={handleConfirmJoin}
                    disabled={isJoining}
                    className="inline-flex min-h-9 items-center rounded-lg border border-gold bg-gold px-3 text-xs font-semibold text-bg-solid hover:bg-gold-light disabled:opacity-50"
                  >
                    {isJoining ? "Uniendo…" : "Confirmar unión"}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => {
                    setLoading(true);
                    void loadTables();
                  }}
                  disabled={loading}
                  className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-border-main px-3 text-xs font-medium text-text-muted hover:border-border-bright hover:text-light disabled:opacity-50"
                  title="Actualizar datos"
                >
                  <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} strokeWidth={1.7} aria-hidden />
                  Actualizar
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs tabular-nums text-text-muted">
              <span>
                Activas <strong className="font-semibold text-light">{stats.occupied}</strong>
              </span>
              <span aria-hidden className="text-border-main">
                ·
              </span>
              <span>
                Cocina <strong className="font-semibold text-light">{stats.pending}</strong>
              </span>
              <span aria-hidden className="text-border-main">
                ·
              </span>
              <span>
                Listos <strong className="font-semibold text-light">{stats.ready}</strong>
              </span>
              <span aria-hidden className="text-border-main">
                ·
              </span>
              <span>
                Limpiar <strong className="font-semibold text-light">{stats.dirty}</strong>
              </span>
              <span aria-hidden className="text-border-main">
                ·
              </span>
              <span className="text-text-muted/90">
                Ingresos{" "}
                <strong className="font-semibold text-light">${MXN_FORMATTER.format(stats.revenue)}</strong>
              </span>
            </div>
          </header>

          {view === "lista" && (
            <section className="rounded-lg border border-border-main bg-bg-card p-3 sm:p-4">
              <div className="overflow-x-auto scrollbar-hide">
                <div className="inline-flex min-w-max gap-1.5">
                  {filterItems.map((item) => {
                    const active = filter === item.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setFilter(item.id)}
                        className={`inline-flex min-h-9 items-center gap-2 rounded-md border px-3 text-xs font-medium transition ${
                          active
                            ? "border-border-bright bg-bg-solid text-light"
                            : "border-transparent bg-transparent text-text-muted hover:bg-bg-solid/80 hover:text-light"
                        }`}
                      >
                        <span>{item.label}</span>
                        {item.count !== undefined ? (
                          <span className="tabular-nums opacity-80">{item.count}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </div>
            </section>
          )}

          {view === "mapa" && (
            <section className="rounded-lg border border-border-main bg-bg-card p-4 sm:p-5">
              {loading && mapTables.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-text-muted">
                  <RefreshCw className="mb-3 h-7 w-7 animate-spin" strokeWidth={1.6} aria-hidden />
                  <p className="text-sm">Cargando mapa…</p>
                </div>
              ) : (
                <FloorMapClient
                  tables={mapTables}
                  readOnly
                  onTableClick={(id) => {
                    const t = tables.find((x) => x.id === id);
                    if (t) void openTableDetail(t);
                  }}
                />
              )}
            </section>
          )}

          {view === "lista" && (
            <section className="space-y-4">
              {loading && tables.length === 0 ? (
                <div className="rounded-lg border border-border-main bg-bg-card py-16 text-center text-text-muted">
                  <RefreshCw className="mx-auto mb-3 h-7 w-7 animate-spin" strokeWidth={1.6} aria-hidden />
                  <p className="text-sm">Cargando mesas…</p>
                </div>
              ) : filteredTables.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border-main bg-bg-card px-6 py-14 text-center text-sm text-text-muted">
                  No hay mesas con este filtro.
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
                  {filteredTables.map((table) => {
                    const isSelectedToJoin = selectedTablesToJoin.includes(table.id);
                    const isChild = !!table.parentTableId;
                    const hasChildren = tables.some((t) => t.parentTableId === table.id);
                    const tone = tableTone(table.status);

                    return (
                      <article
                        key={table.id}
                        onClick={() => {
                          if (isJoinMode) {
                            handleToggleJoinTable(table.id, isChild);
                          } else {
                            void openTableDetail(table);
                          }
                        }}
                        className={`relative overflow-hidden rounded-xl border p-4 sm:p-5 ${tone.card} ${
                          isSelectedToJoin ? "ring-2 ring-gold ring-offset-2 ring-offset-bg-solid" : ""
                        } ${isChild ? "cursor-not-allowed opacity-50" : "cursor-pointer hover:border-border-bright"}`}
                      >
                        {isSelectedToJoin && (
                          <div className="absolute right-3 top-3 z-20 inline-flex h-6 min-w-6 items-center justify-center rounded-full border border-gold bg-gold px-1.5 font-mono text-[10px] font-bold text-bg-solid">
                            {selectedTablesToJoin.indexOf(table.id) + 1}
                          </div>
                        )}

                        {isChild && (
                          <div className="absolute left-3 top-3 z-20 inline-flex items-center gap-1 rounded-full border border-border-main/70 bg-bg-solid/70 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-text-muted">
                            Vinculada
                            {allowJoinTables && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleSeparate(table.id);
                                }}
                                className="text-text-muted transition hover:text-dash-red"
                                title="Separar"
                              >
                                <Unlink size={11} />
                              </button>
                            )}
                          </div>
                        )}

                        {hasChildren && (
                          <div className="absolute right-3 top-3 z-20 rounded-full border border-gold/35 bg-gold/15 px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] text-gold">
                            Master
                          </div>
                        )}

                        <div className="relative z-10 flex h-full flex-col gap-4">
                          <header className="flex items-start justify-between gap-3">
                            <span
                              className={`inline-flex rounded-full border px-2.5 py-1 font-mono text-[9px] font-bold uppercase tracking-[0.16em] ${tone.chip}`}
                            >
                              {tableStatusLabel(table.status)}
                            </span>
                            {isTableBusy(table.status) && (
                              <div className="inline-flex items-center gap-1 rounded-full border border-border-main/70 bg-bg-solid/60 px-2 py-1 font-mono text-[10px] font-bold text-light">
                                <Users className="h-3.5 w-3.5 text-text-muted" strokeWidth={1.8} />
                                {table.activeSession?.pax ?? 0}
                              </div>
                            )}
                          </header>

                          <div className="space-y-1">
                            <p className="text-[11px] font-medium text-text-muted">Mesa</p>
                            <p className="text-3xl font-semibold tabular-nums leading-none tracking-tight text-light sm:text-4xl">{table.number}</p>
                            {table.activeSession ? (
                              <p className="line-clamp-1 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-gold">
                                {table.activeSession.guestName}
                              </p>
                            ) : (
                              <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.16em] text-text-muted">
                                Esperando comensales
                              </p>
                            )}
                          </div>

                          <div className="mt-auto space-y-3">
                            <div className="grid grid-cols-2 gap-2 text-xs">
                              <div className="rounded-md border border-border-main bg-bg-solid/80 px-2 py-1.5 tabular-nums text-text-muted">
                                Cocina <span className="ml-1 font-semibold text-light">{table.pendingCount}</span>
                              </div>
                              <div className="rounded-md border border-border-main bg-bg-solid/80 px-2 py-1.5 tabular-nums text-text-muted">
                                Listos <span className="ml-1 font-semibold text-light">{table.readyCount}</span>
                              </div>
                            </div>

                            {isTableBusy(table.status) && table.billTotal > 0 && (
                              <div className="rounded-md border border-border-main bg-bg-solid/80 px-3 py-2 text-sm font-semibold tabular-nums text-light">
                                ${MXN_FORMATTER.format(table.billTotal)}
                              </div>
                            )}

                            {table.status === "SUCIA" && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleCleanTable(table.id);
                                }}
                                className="inline-flex min-h-10 w-full items-center justify-center rounded-md border border-border-main bg-bg-solid px-2.5 text-xs font-medium text-light transition hover:border-dash-red hover:bg-dash-red/10"
                              >
                                Marcar libre
                              </button>
                            )}

                            {table.status === "DISPONIBLE" && !isChild && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void handleRegenerateQr(table.id, table.number);
                                }}
                                className={`inline-flex min-h-10 w-full items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition ${
                                  confirmQr?.id === table.id
                                    ? "border-gold bg-gold text-bg-solid"
                                    : "border-border-main text-text-muted hover:border-gold hover:text-gold"
                                }`}
                                title="Generar nuevo QR"
                              >
                                <QrCode className="h-3.5 w-3.5" />
                                {confirmQr?.id === table.id ? "Confirmar QR" : "Renovar QR"}
                              </button>
                            )}
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </div>
      </main>

      <style dangerouslySetInnerHTML={{__html:`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}} />

      {/* Table Detail Modal */}
      {selectedTable && (
        <WaiterTableDetail
          tableId={selectedTable}
          restaurantId={restaurantId}
          onClose={() => setSelectedTable(null)}
          onRefresh={() => {
            loadTables();
          }}
        />
      )}
    </div>
  );
}

