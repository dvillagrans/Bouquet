"use client";

import { useState, useEffect } from "react";
import { Users, ChefHat, Clock, RefreshCw, Sparkles, LayoutGrid, Map, Link as LinkIcon, Unlink, QrCode } from "lucide-react";
import { getWaiterTablesSummary, regenerateTableQr, updateTableStatus } from "@/actions/waiter";
import { getTables, joinTables, separateTable } from "@/actions/tables";
import WaiterTableDetail from "./WaiterTableDetail";
import FloorMapClient from "@/components/dashboard/FloorMapClient";
import type { FloorMapTable } from "@/components/dashboard/FloorMap";
import type { TableStatus } from "@/generated/prisma";

const NOISE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDgiIG1peC1ibGVuZC1tb2RlPSJvdmVybGF5IiAvPgo8L3N2Zz4=";

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
    <div className="relative min-h-screen bg-bg-solid text-text-primary flex flex-col font-sans overflow-x-hidden">
      {/* Background Noise & Lighting */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 z-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundRepeat: "repeat" }}
        />
        <div className="absolute -left-[20%] -top-[20%] h-[min(80vh,600px)] w-[min(100vw,800px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.08),transparent_60%)] blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(77,132,96,0.05),transparent_60%)] blur-[100px]" />
      </div>

      {toast && (
        <div
          className="fixed inset-x-0 top-4 z-[80] flex justify-center px-4"
          role={toast.type === "error" ? "alert" : "status"}
          aria-live={toast.type === "error" ? "assertive" : "polite"}
          style={{ animation: "fade-in 0.3s cubic-bezier(0.16, 1, 0.3, 1) both" }}
        >
          <div
            className={`flex items-center gap-3 backdrop-blur-md px-5 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.4)] rounded-full border ${
              toast.type === "error"
                ? "border-dash-red/40 bg-dash-red/10 text-dash-red"
                : "border-dash-green/40 bg-dash-green/10 text-dash-green"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                toast.type === "error" ? "bg-dash-red animate-pulse" : "bg-dash-green"
              }`}
              aria-hidden="true"
            />
            <p className="text-[11px] font-mono font-bold uppercase tracking-[0.2em]">{toast.message}</p>
          </div>
        </div>
      )}

      {/* Header with Stats */}
      <div className="relative z-10 border-b border-border-main bg-bg-card/40 backdrop-blur-md p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col gap-1.5">
             <h1 className="font-serif text-3xl font-medium tracking-tight text-text-primary flex items-center gap-3">
               Table Management
             </h1>
             <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted mt-0.5">
               Punto de Venta &copy; Boulevard
             </span>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Occupied Tables */}
            <div className="group flex items-center gap-4 rounded-xl border border-border-main bg-bg-card/30 p-5 backdrop-blur-sm transition-colors hover:border-gold/30 hover:bg-gold/5">
              <div className="rounded-lg bg-gold/10 p-3.5 border border-gold/20 shadow-inner group-hover:scale-105 transition-transform">
                <Users className="h-6 w-6 text-gold" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted">Mesas Ocupadas</p>
                <p className="font-serif text-3xl text-text-primary group-hover:text-gold transition-colors">{stats.occupied}</p>
              </div>
            </div>

            {/* Pending Orders */}
            <div className="group flex items-center gap-4 rounded-xl border border-border-main bg-bg-card/30 p-5 backdrop-blur-sm transition-colors hover:border-dash-blue/30 hover:bg-dash-blue/5">
              <div className="rounded-lg bg-dash-blue/10 p-3.5 border border-dash-blue/20 shadow-inner group-hover:scale-105 transition-transform">
                <Clock className="h-6 w-6 text-dash-blue" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted">Pendientes</p>
                <p className="font-serif text-3xl text-text-primary group-hover:text-dash-blue transition-colors">{stats.pending}</p>
              </div>
            </div>

            {/* Ready Orders */}
            <div className="group flex items-center gap-4 rounded-xl border border-border-main bg-bg-card/30 p-5 backdrop-blur-sm transition-colors hover:border-dash-green/30 hover:bg-dash-green/5">
              <div className="rounded-lg bg-dash-green/10 p-3.5 border border-dash-green/20 shadow-inner group-hover:scale-105 transition-transform">
                <ChefHat className="h-6 w-6 text-dash-green" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted">Fuego (Listos)</p>
                <p className="font-serif text-3xl text-text-primary group-hover:text-dash-green transition-colors">{stats.ready}</p>
              </div>
            </div>

            {/* Dirty Tables */}
            <div className="group flex items-center gap-4 rounded-xl border border-border-main bg-bg-card/30 p-5 backdrop-blur-sm transition-colors hover:border-dash-red/30 hover:bg-dash-red/5">
              <div className="rounded-lg bg-dash-red/10 p-3.5 border border-dash-red/20 shadow-inner group-hover:scale-105 transition-transform">
                <Sparkles className="h-6 w-6 text-dash-red" strokeWidth={1.5} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted">Limpieza Req.</p>
                <p className="font-serif text-3xl text-text-primary group-hover:text-dash-red transition-colors">{stats.dirty}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters, View Toggle and Refresh */}
      <div className="relative z-10 border-b border-border-main bg-bg-card/60 backdrop-blur-md py-4 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-start sm:items-center gap-4 justify-between">
          {/* Scrollable filter area */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-hide flex-1 min-w-0 w-full sm:w-auto">
            {/* View toggle */}
            <div className="flex p-1 rounded-lg bg-bg-solid/50 border border-border-main shrink-0">
              <button
                onClick={() => setView("lista")}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] rounded transition-all ${
                  view === "lista" ? "bg-bg-card border border-border-bright text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary border border-transparent"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Piso</span>
              </button>
              <button
                onClick={() => setView("mapa")}
                className={`flex items-center gap-1.5 px-4 py-1.5 text-[11px] font-bold uppercase tracking-[0.1em] rounded transition-all ${
                  view === "mapa" ? "bg-bg-card border border-border-bright text-text-primary shadow-sm" : "text-text-muted hover:text-text-primary border border-transparent"
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                <span className="hidden xs:inline">Mapa</span>
              </button>
            </div>

            {/* Divider */}
            {view === "lista" && (
              <div className="hidden sm:block w-px h-6 bg-border-main/60 shrink-0 mx-1" />
            )}

            {/* Filters (only in list view) */}
            {view === "lista" && (
              <div className="flex bg-transparent rounded-lg p-0.5 border border-transparent gap-2">
                {(["todas", "ocupadas", "pendientes", "listas", "sucias"] as const).map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`shrink-0 px-3 py-1.5 rounded-lg text-[10px] tabular-nums font-bold uppercase tracking-[0.1em] transition-all border ${
                      filter === f
                        ? "bg-bg-card border-border-bright text-gold shadow-sm"
                        : "border-border-main/50 bg-bg-solid/30 text-text-muted hover:border-gold/30 hover:text-text-primary"
                    }`}
                  >
                    {f === "todas" && "Todas"}
                    {f === "ocupadas" && `Tránsito${stats.occupied ? ` (${stats.occupied})` : ""}`}
                    {f === "pendientes" && `Coci.${stats.pending ? ` (${stats.pending})` : ""}`}
                    {f === "listas" && `Fuego${stats.ready ? ` (${stats.ready})` : ""}`}
                    {f === "sucias" && `Limp.${stats.dirty ? ` (${stats.dirty})` : ""}`}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3 shrink-0 w-full sm:w-auto justify-end">
            {/* Join Tables */}
            {allowJoinTables && (
              <button
                onClick={() => {
                  setIsJoinMode(!isJoinMode);
                  setSelectedTablesToJoin([]);
                }}
                className={`shrink-0 flex items-center gap-2 px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] transition-all border ${
                  isJoinMode ? "border-gold bg-gold/10 text-gold shadow-[0_0_10px_rgba(201,160,84,0.2)]" : "border-border-main bg-bg-solid/50 text-text-muted hover:text-text-primary hover:border-gold/50"
                }`}
                title="Juntar mesas"
              >
                <LinkIcon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{isJoinMode ? "Cancelar Unión" : "Unir Mesas"}</span>
              </button>
            )}
            {isJoinMode && selectedTablesToJoin.length >= 2 && (
              <button
                onClick={handleConfirmJoin}
                disabled={isJoining}
                className="shrink-0 flex items-center gap-2 border border-gold bg-gold px-4 py-2 rounded-lg text-[10px] font-bold uppercase tracking-[0.2em] text-bg-solid shadow-[0_0_15px_rgba(201,160,84,0.4)] hover:bg-white transition-all disabled:opacity-50"
              >
                <span className="hidden sm:inline">Ejecutar Unión</span>
                <span className="sm:hidden">Unir</span>
              </button>
            )}

            <button
              onClick={() => {
                setLoading(true);
                loadTables();
              }}
              disabled={loading}
              className="shrink-0 flex items-center justify-center p-2 rounded-lg border border-border-main bg-bg-solid/50 hover:bg-bg-card hover:border-border-bright text-text-muted hover:text-text-primary transition-all disabled:opacity-50"
              title="Sincronizar"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} strokeWidth={1.5} />
            </button>
          </div>
        </div>
      </div>

      {/* Floor Map View */}
      {view === "mapa" && (
        <div className="relative z-10 p-6 lg:p-8">
          <div className="mx-auto max-w-7xl">
            {loading && mapTables.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 opacity-50">
                <RefreshCw className="h-8 w-8 animate-spin text-gold mb-4 stroke-[1.5]" />
                <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-text-muted">Desplegando Piso...</p>
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
      {view === "lista" && <div className="relative z-10 p-6 lg:p-8">
        <div className="mx-auto max-w-7xl">
          {loading && tables.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20 opacity-50">
               <RefreshCw className="h-8 w-8 animate-spin text-gold mb-4 stroke-[1.5]" />
               <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-text-muted">Cargando Zonas...</p>
             </div>
          ) : filteredTables.length === 0 ? (
             <div className="flex flex-col items-center justify-center py-20">
               <div className="p-6 rounded-full border border-dashed border-border-main/50 mb-3 bg-bg-card/30">
                 <LayoutGrid className="w-8 h-8 text-text-muted/30" />
               </div>
               <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-text-muted">Sin mesas activas</p>
             </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 sm:gap-5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
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
                  className={`relative flex flex-col items-center justify-between rounded-2xl border p-4 sm:p-5 transition-all duration-300 cursor-pointer aspect-square active:scale-[0.98] overflow-hidden backdrop-blur-md ${
                    isSelectedToJoin ? "border-gold bg-gold/10 shadow-[0_0_20px_rgba(201,160,84,0.3)]" :
                    isChild ? "opacity-50 grayscale-[0.6] cursor-not-allowed border-border-main bg-bg-solid/40" :
                    table.status === "DISPONIBLE"
                      ? "border-dash-green/30 bg-dash-green/5 hover:border-dash-green/60 hover:bg-dash-green/[0.08]"
                      : table.status === "OCUPADA"
                      ? "border-text-primary/10 bg-bg-card/40 hover:border-text-primary/30 hover:bg-bg-card/60 shadow-lg"
                      : table.status === "CERRANDO"
                      ? "border-gold/40 bg-gold/[0.08] hover:border-gold shadow-[0_0_15px_rgba(201,160,84,0.1)]"
                      : "border-dash-red/40 bg-dash-red/10 hover:border-dash-red shadow-[0_0_15px_rgba(239,68,68,0.15)]"
                  }`}
                >
                  {/* Subtle Gradient overlay for premium feel */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                  {/* Join Table Elements */}
                  {isSelectedToJoin && (
                    <div className="absolute right-3 top-3 z-10 flex h-5 w-5 items-center justify-center rounded-full bg-gold text-bg-solid text-[10px] font-bold font-mono shadow-md">
                      {selectedTablesToJoin.indexOf(table.id) + 1}
                    </div>
                  )}
                  {isChild && (
                    <div className="absolute -left-1 top-0 w-[calc(100%+8px)] bg-bg-solid/80 px-2 py-1 text-center text-[8px] font-bold font-mono uppercase tracking-[0.2em] text-text-muted border-b border-border-main">
                      Vinculada
                      {allowJoinTables && (
                         <button 
                         onClick={(e) => { e.stopPropagation(); handleSeparate(table.id); }}
                         className="ml-2 hover:text-dash-red transition-colors"
                         title="Separar"
                       >
                         <Unlink size={10} className="inline mb-[2px]" />
                       </button>
                      )}
                    </div>
                  )}
                  {hasChildren && (
                    <div className="absolute left-3 top-3 z-10 rounded shadow-sm border border-gold/40 bg-gold/10 px-1.5 py-0.5 text-[8px] font-bold font-mono uppercase tracking-[0.2em] text-gold">
                      Master
                    </div>
                  )}

                  {/* Status Badge + pax */}
                  <div className="relative z-10 flex w-full items-center justify-between mt-1">
                    <span
                      className={`text-[8px] font-bold font-mono uppercase tracking-[0.2em] px-1.5 py-0.5 rounded shadow-sm border ${
                        table.status === "DISPONIBLE"
                          ? "bg-dash-green/10 text-dash-green border-dash-green/20"
                          : table.status === "OCUPADA"
                          ? "bg-text-primary/10 text-text-primary border-border-bright"
                          : table.status === "CERRANDO"
                          ? "bg-gold/10 text-gold border-gold/20"
                          : "bg-dash-red/10 text-dash-red border-dash-red/20 font-bold animate-pulse text-shadow-sm"
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
                      <div className="flex items-center gap-1 text-[10px] font-bold text-text-primary font-mono">
                        <Users className="h-3 w-3 text-text-muted" strokeWidth={2} />
                        {table.activeSession?.pax}
                      </div>
                    )}
                  </div>

                  {/* Table Number + Guest Name */}
                  <div className="relative z-10 flex-1 flex flex-col items-center justify-center gap-1 w-full">
                    <span className="font-serif text-4xl sm:text-5xl font-medium text-text-primary drop-shadow-md">
                      {table.number}
                    </span>
                    {table.activeSession && (
                      <span className="text-[10px] font-bold tracking-[0.2em] text-gold uppercase text-center line-clamp-1 px-2 py-0.5 bg-gold/5 border border-gold/10 rounded">
                        {table.activeSession.guestName}
                      </span>
                    )}
                    {/* Bill total — always visible for busy tables */}
                    {isTableBusy(table.status) && table.billTotal > 0 && (
                      <span className="text-[11px] font-mono tabular-nums font-bold tracking-widest text-text-primary mt-1 px-2 py-1 rounded bg-bg-solid/60 border border-border-main shadow-inner">
                        ${table.billTotal.toLocaleString("es-MX", { minimumFractionDigits: 0 })}
                      </span>
                    )}
                  </div>

                  {/* Order Badges */}
                  {table.orderCount > 0 && (
                    <div className="relative z-10 flex gap-2 w-full justify-center text-[9px] font-mono uppercase tracking-[0.1em] mt-1">
                      {table.pendingCount > 0 && (
                        <div className="bg-dash-blue/10 border border-dash-blue/20 text-dash-blue px-2 py-[2px] rounded-sm shadow-sm font-bold flex items-center gap-1 group-hover:bg-dash-blue hover:text-white transition-colors">
                          <span className="tabular-nums">{table.pendingCount}</span> Coc.
                        </div>
                      )}
                      {table.readyCount > 0 && (
                        <div className="bg-dash-green/10 border border-dash-green/30 text-dash-green px-2 py-[2px] rounded-sm shadow-sm font-bold flex items-center gap-1 group-hover:bg-dash-green hover:text-white transition-colors">
                          <span className="tabular-nums">{table.readyCount}</span> Fueg.
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
                      className="relative z-10 mt-2 flex items-center justify-center gap-1.5 w-full bg-dash-red/10 border border-dash-red/30 hover:bg-dash-red hover:text-white active:scale-95 text-dash-red px-2 py-1.5 rounded-lg font-bold tracking-[0.2em] uppercase text-[9px] transition-all shadow-[0_0_10px_rgba(239,68,68,0.2)]"
                    >
                      <Sparkles className="h-3 w-3" strokeWidth={2} />
                      Atender Mesa
                    </button>
                  )}

                  {/* QR rotation is explicit and controlled by waiter */}
                  {table.status === "DISPONIBLE" && !isChild && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRegenerateQr(table.id, table.number);
                      }}
                      className="relative z-10 mt-2 w-[90%] mx-auto flex items-center justify-center gap-1.5 border border-gold/30 bg-gold/5 hover:bg-gold/20 active:scale-95 text-gold/80 hover:text-gold px-2 py-1 rounded shadow-sm font-bold tracking-[0.1em] uppercase text-[8px] transition-all"
                      title="Generar nuevo QR"
                    >
                      <QrCode className="h-2.5 w-2.5" />
                      Código Nuevo
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

