"use client";

import { useState, useEffect } from "react";
import { Users, ChefHat, Clock, RefreshCw, Sparkles, LayoutGrid, Map, Link as LinkIcon, Unlink, QrCode } from "lucide-react";
import { getWaiterTablesSummary, regenerateTableQr, updateTableStatus } from "@/actions/waiter";
import { getTables, joinTables, separateTable } from "@/actions/tables";
import WaiterTableDetail from "./WaiterTableDetail";
import FloorMapClient from "@/components/dashboard/FloorMapClient";
import type { FloorMapTable } from "@/components/dashboard/FloorMap";
import type { TableStatus } from "@/generated/prisma";

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

export default function WaiterDashboard({ allowJoinTables = false }: { allowJoinTables?: boolean }) {
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

  const loadTables = async () => {
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
  };

  const handleCleanTable = async (tableId: string) => {
    try {
      await updateTableStatus(tableId, "DISPONIBLE");
      await loadTables();
    } catch (error) {
      console.error("Error cleaning table:", error);
      alert("Error al limpiar la mesa");
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

  const handleRegenerateQr = async (tableId: string, tableNumber: number) => {
    if (!confirm("¿Generar nuevo QR para esta mesa? El código anterior dejará de servir.")) {
      return;
    }

    try {
      const result = await regenerateTableQr(tableId);
      setToast({
        type: "success",
        message: `Mesa ${tableNumber}: nuevo QR ${result.qrCode}`,
      });
      await loadTables();
    } catch (error) {
      console.error("Error regenerating table QR:", error);
      setToast({
        type: "error",
        message: (error as Error).message || "Error regenerando el QR",
      });
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
      alert("Error al unir mesas");
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
      alert("Error separando la mesa");
    }
  };

  useEffect(() => {
    loadTables();
    // Refresh every 10 seconds
    const interval = setInterval(loadTables, 10000);
    return () => clearInterval(interval);
  }, []);

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

  return (
    <div className="min-h-screen bg-ink">
      {toast && (
        <div
          className="fixed inset-x-0 top-4 z-[80] flex justify-center px-4"
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          style={{ animation: "fade-in 0.2s ease-out both" }}
        >
          <div
            className={`flex items-center gap-3 border bg-ink px-5 py-3 shadow-lg ${
              toast.type === "error"
                ? "border-ember/50 text-ember"
                : "border-sage-deep/50 text-sage-deep"
            }`}
          >
            <span
              className={`h-1.5 w-1.5 rounded-full ${
                toast.type === "error" ? "bg-ember" : "bg-sage-deep"
              }`}
              aria-hidden="true"
            />
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.18em]">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header with Stats */}
      <div className="border-b border-wire bg-canvas p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-4 sm:mb-6">
            <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] text-light">
              Panel del Mesero
            </h1>
            <p className="mt-1 text-sm text-dim uppercase tracking-[0.1em]">
              Punto de Venta • Gestión de Mesas
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Occupied Tables */}
            <div className="flex items-center gap-3 rounded border border-wire/40 bg-glow/5 p-4">
              <div className="rounded-lg bg-glow/20 p-3">
                <Users className="h-6 w-6 text-glow" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-dim">Mesas Ocupadas</p>
                <p className="text-2xl font-bold text-glow">{stats.occupied}</p>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="flex items-center gap-3 rounded border border-wire/40 bg-glow/5 p-4">
              <div className="rounded-lg bg-glow/20 p-3">
                <Clock className="h-6 w-6 text-glow" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-dim">Órdenes Pendientes</p>
                <p className="text-2xl font-bold text-glow">{stats.pending}</p>
              </div>
            </div>

            {/* Ready Orders */}
            <div className="flex items-center gap-3 rounded border border-wire/40 bg-sage-deep/5 p-4">
              <div className="rounded-lg bg-sage-deep/20 p-3">
                <ChefHat className="h-6 w-6 text-sage-deep" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-dim">Listos para Servir</p>
                <p className="text-2xl font-bold text-sage-deep">{stats.ready}</p>
              </div>
            </div>

            {/* Dirty Tables */}
            <div className="flex items-center gap-3 rounded border border-wire/40 bg-ember/5 p-4">
              <div className="rounded-lg bg-ember/20 p-3">
                <Sparkles className="h-6 w-6 text-ember" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wider text-dim">Mesas por Limpiar</p>
                <p className="text-2xl font-bold text-ember">{stats.dirty}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters, View Toggle and Refresh */}
      <div className="border-b border-wire bg-panel py-3 px-4">
        <div className="mx-auto max-w-7xl flex items-center gap-2">
          {/* Scrollable filter area */}
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide flex-1 min-w-0 pb-0.5">
            {/* View toggle */}
            <div className="flex border border-wire rounded overflow-hidden shrink-0">
              <button
                onClick={() => setView("lista")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold uppercase transition-all ${
                  view === "lista" ? "bg-glow text-canvas" : "text-dim hover:text-light"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Lista</span>
              </button>
              <button
                onClick={() => setView("mapa")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold uppercase transition-all border-l border-wire ${
                  view === "mapa" ? "bg-glow text-canvas" : "text-dim hover:text-light"
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Mapa</span>
              </button>
            </div>

            {/* Divider */}
            {view === "lista" && (
              <div className="w-px h-5 bg-wire/50 shrink-0" />
            )}

            {/* Filters (only in list view) */}
            {view === "lista" && (["todas", "ocupadas", "pendientes", "listas", "sucias"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`shrink-0 px-3 py-2 rounded text-sm font-bold uppercase transition-all ${
                  filter === f
                    ? "bg-glow text-canvas"
                    : "border border-wire text-light hover:border-glow"
                }`}
              >
                {f === "todas" && "Todas"}
                {f === "ocupadas" && `Ocupadas${stats.occupied ? ` (${stats.occupied})` : ""}`}
                {f === "pendientes" && `Pend.${stats.pending ? ` (${stats.pending})` : ""}`}
                {f === "listas" && `Listas${stats.ready ? ` (${stats.ready})` : ""}`}
                {f === "sucias" && `Limpiar${stats.dirty ? ` (${stats.dirty})` : ""}`}
              </button>
            ))}
          </div>

          {/* Refresh - always visible, icon-only on mobile */}
          {allowJoinTables && (
            <button
              onClick={() => {
                setIsJoinMode(!isJoinMode);
                setSelectedTablesToJoin([]);
              }}
              className={`shrink-0 flex items-center gap-2 border px-3 py-2 rounded text-sm font-bold uppercase transition-colors ${
                isJoinMode ? "border-glow bg-glow/10 text-glow" : "border-wire text-dim hover:text-light hover:border-glow"
              }`}
              title="Juntar mesas"
            >
              <LinkIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{isJoinMode ? "Cancelar" : "Unir"}</span>
            </button>
          )}
          {isJoinMode && selectedTablesToJoin.length >= 2 && (
            <button
              onClick={handleConfirmJoin}
              disabled={isJoining}
              className="shrink-0 flex items-center gap-2 border border-glow bg-glow px-3 py-2 rounded text-sm font-bold uppercase text-ink hover:bg-glow/90 transition-colors disabled:opacity-50"
            >
              <span className="hidden sm:inline">Confirmar Unwin</span>
              <span className="sm:hidden">Unir</span>
            </button>
          )}

          <button
            onClick={() => {
              setLoading(true);
              loadTables();
            }}
            disabled={loading}
            className="shrink-0 flex items-center gap-2 border border-wire hover:border-glow px-3 py-2 rounded text-sm font-bold uppercase text-dim hover:text-light transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Actualizar</span>
          </button>
        </div>
      </div>

      {/* Floor Map View */}
      {view === "mapa" && (
        <div className="p-6">
          <div className="mx-auto max-w-7xl">
            {loading && mapTables.length === 0 ? (
              <div className="flex items-center justify-center py-12">
                <p className="text-dim">Cargando mapa...</p>
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
          </div>
        </div>
      )}

      {/* Table Grid */}
      {view === "lista" && <div className="p-6">
        <div className="mx-auto max-w-7xl">
          {loading && tables.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-dim">Cargando mesas...</p>
            </div>
          ) : filteredTables.length === 0 ? (
            <div className="flex items-center justify-center py-12">
              <p className="text-dim">No hay mesas para este filtro</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredTables.map((table) => {
                const isSelectedToJoin = selectedTablesToJoin.includes(table.id);
                const isChild = !!table.parentTableId;
                const hasChildren = tables.some((t) => t.parentTableId === table.id);

                return (
                <div
                  key={table.id}
                  onClick={() => {
                    if (isJoinMode) {
                      handleToggleJoinTable(table.id, isChild);
                    } else {
                      void openTableDetail(table);
                    }
                  }}
                  className={`relative flex flex-col items-center justify-between rounded-lg border p-3 sm:p-4 transition-all duration-200 cursor-pointer aspect-square active:scale-[0.97] ${
                    isSelectedToJoin ? "border-glow bg-glow/10 shadow-[0_0_10px_rgba(var(--glow-rgb),0.3)]" :
                    isChild ? "opacity-60 grayscale-[0.5] cursor-not-allowed border-wire bg-wire/10" :
                    table.status === "DISPONIBLE"
                      ? "border-sage/40 bg-sage/5 hover:border-sage"
                      : table.status === "OCUPADA"
                      ? "border-glow/40 bg-glow/5 hover:border-glow"
                      : table.status === "CERRANDO"
                      ? "border-gold/40 bg-gold/5 hover:border-gold"
                      : "border-ember/40 bg-ember/5 hover:border-ember"
                  }`}
                >
                  {/* Join Table Elements */}
                  {isSelectedToJoin && (
                    <div className="absolute right-2 top-2 z-10 flex h-4 w-4 items-center justify-center rounded-full bg-glow text-ink text-[9px] font-bold">
                      {selectedTablesToJoin.indexOf(table.id) + 1}
                    </div>
                  )}
                  {isChild && (
                    <div className="absolute left-0 top-0 w-full bg-wire/50 px-1 py-0.5 text-center text-[0.5rem] font-bold uppercase tracking-wider text-dim rounded-t-lg">
                      Mesa Unida
                      {allowJoinTables && (
                         <button 
                         onClick={(e) => { e.stopPropagation(); handleSeparate(table.id); }}
                         className="ml-1 hover:text-ember"
                         title="Separar"
                       >
                         <Unlink size={8} className="inline" />
                       </button>
                      )}
                    </div>
                  )}
                  {hasChildren && (
                    <div className="absolute left-2 top-2 z-10 rounded border border-glow/50 bg-glow/20 px-1 py-0.5 text-[0.5rem] font-bold uppercase tracking-wider text-glow">
                      Mesa Princ.
                    </div>
                  )}

                  {/* Status Badge + pax */}
                  <div className="flex w-full items-center justify-between mt-2">
                    <span
                      className={`text-[0.55rem] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                        table.status === "DISPONIBLE"
                          ? "bg-sage/20 text-sage"
                          : table.status === "OCUPADA"
                          ? "bg-glow/20 text-glow"
                          : table.status === "CERRANDO"
                          ? "bg-gold/20 text-gold"
                          : "bg-ember/20 text-ember"
                      }`}
                    >
                      {table.status === "DISPONIBLE"
                        ? "Libre"
                        : table.status === "OCUPADA"
                          ? "Ocupada"
                          : table.status === "CERRANDO"
                            ? "Cuenta"
                            : "Sucia"}
                    </span>
                    {isTableBusy(table.status) && (
                      <div className="flex items-center gap-0.5 text-[0.55rem] text-light">
                        <Users className="h-2.5 w-2.5" />
                        {table.activeSession?.pax}
                      </div>
                    )}
                  </div>

                  {/* Table Number + Guest Name */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-0.5">
                    <span className="font-serif text-3xl sm:text-4xl text-light">{table.number}</span>
                    {table.activeSession && (
                      <span className="text-[0.6rem] font-medium tracking-wider text-light/70 uppercase text-center line-clamp-1">
                        {table.activeSession.guestName}
                      </span>
                    )}
                    {/* Bill total — always visible for busy tables */}
                    {isTableBusy(table.status) && table.billTotal > 0 && (
                      <span className="text-[0.65rem] font-mono text-light/50 mt-0.5">
                        ${table.billTotal.toFixed(0)}
                      </span>
                    )}
                  </div>

                  {/* Order Badges */}
                  {table.orderCount > 0 && (
                    <div className="flex gap-1.5 w-full justify-center text-[0.5rem]">
                      {table.pendingCount > 0 && (
                        <div className="bg-glow/20 text-glow px-1.5 py-0.5 rounded font-bold">
                          {table.pendingCount} Pend
                        </div>
                      )}
                      {table.readyCount > 0 && (
                        <div className="bg-sage-deep/20 text-sage-deep px-1.5 py-0.5 rounded font-bold">
                          {table.readyCount} List
                        </div>
                      )}
                    </div>
                  )}

                  {/* Limpiar button — always visible for dirty tables (no hover required) */}
                  {table.status === "SUCIA" && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCleanTable(table.id);
                      }}
                      className="mt-1 flex items-center gap-1 bg-sage-deep hover:bg-sage-deep/90 active:scale-95 text-canvas px-2 py-1 rounded font-bold uppercase text-[0.6rem] transition-all"
                    >
                      <Sparkles className="h-2.5 w-2.5" />
                      Limpiar
                    </button>
                  )}

                  {/* QR rotation is explicit and controlled by waiter */}
                  {table.status === "DISPONIBLE" && !isChild && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegenerateQr(table.id, table.number);
                      }}
                      className="mt-1 flex items-center gap-1 border border-glow/50 bg-glow/10 hover:bg-glow/20 active:scale-95 text-glow px-2 py-1 rounded font-bold uppercase text-[0.6rem] transition-all"
                      title="Generar nuevo QR"
                    >
                      <QrCode className="h-2.5 w-2.5" />
                      Nuevo QR
                    </button>
                  )}
                </div>
              );
              })}
            </div>
          )}
        </div>
      </div>}

      {/* Table Detail Modal */}
      {selectedTable && (
        <WaiterTableDetail
          tableId={selectedTable}
          onClose={() => setSelectedTable(null)}
          onRefresh={() => {
            loadTables();
          }}
        />
      )}
    </div>
  );
}

