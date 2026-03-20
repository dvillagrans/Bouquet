"use client";

import { useState, useEffect } from "react";
import { Users, ChefHat, Clock, RefreshCw, Sparkles, LayoutGrid, Map } from "lucide-react";
import { getWaiterTablesSummary, updateTableStatus } from "@/actions/waiter";
import { getTables } from "@/actions/tables";
import WaiterTableDetail from "./WaiterTableDetail";
import FloorMapClient from "@/components/dashboard/FloorMapClient";
import type { FloorMapTable } from "@/components/dashboard/FloorMap";

type FilterType = "todas" | "ocupadas" | "pendientes" | "listas" | "sucias";
type ViewType = "lista" | "mapa";

interface TableSummary {
  id: string;
  number: number;
  capacity: number;
  status: "DISPONIBLE" | "OCUPADA" | "SUCIA";
  activeSession: { guestName: string; pax: number; createdAt: Date } | null;
  orderCount: number;
  pendingCount: number;
  readyCount: number;
  billTotal: number;
}

export default function WaiterDashboard() {
  const [tables, setTables] = useState<TableSummary[]>([]);
  const [mapTables, setMapTables] = useState<FloorMapTable[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("todas");
  const [view, setView] = useState<ViewType>("lista");
  const [selectedTable, setSelectedTable] = useState<string | null>(null);

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

  useEffect(() => {
    loadTables();
    // Refresh every 10 seconds
    const interval = setInterval(loadTables, 10000);
    return () => clearInterval(interval);
  }, []);

  // Filter tables
  const filteredTables = tables.filter((t) => {
    if (filter === "ocupadas") return t.status === "OCUPADA";
    if (filter === "pendientes") return t.pendingCount > 0;
    if (filter === "listas") return t.readyCount > 0;
    if (filter === "sucias") return t.status === "SUCIA";
    return true;
  });

  // Calculate stats
  const stats = {
    occupied: tables.filter((t) => t.status === "OCUPADA").length,
    pending: tables.reduce((sum, t) => sum + t.pendingCount, 0),
    ready: tables.reduce((sum, t) => sum + t.readyCount, 0),
    dirty: tables.filter((t) => t.status === "SUCIA").length,
    revenue: tables.reduce((sum, t) => sum + t.billTotal, 0),
  };

  return (
    <div className="min-h-screen bg-ink">
      {/* Header with Stats */}
      <div className="border-b border-wire bg-canvas p-6">
        <div className="mx-auto max-w-7xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold uppercase tracking-[0.2em] text-light">
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
      <div className="border-b border-wire bg-panel p-4">
        <div className="mx-auto max-w-7xl flex flex-wrap items-center justify-between gap-4">
          <div className="flex gap-2 flex-wrap">
            {/* View toggle */}
            <div className="flex border border-wire rounded overflow-hidden mr-2">
              <button
                onClick={() => setView("lista")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold uppercase transition-all ${
                  view === "lista" ? "bg-glow text-canvas" : "text-dim hover:text-light"
                }`}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
                Lista
              </button>
              <button
                onClick={() => setView("mapa")}
                className={`flex items-center gap-1.5 px-3 py-2 text-sm font-bold uppercase transition-all border-l border-wire ${
                  view === "mapa" ? "bg-glow text-canvas" : "text-dim hover:text-light"
                }`}
              >
                <Map className="h-3.5 w-3.5" />
                Mapa
              </button>
            </div>

            {/* Filters (only in list view) */}
            {view === "lista" && (["todas", "ocupadas", "pendientes", "listas", "sucias"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded text-sm font-bold uppercase transition-all ${
                  filter === f
                    ? "bg-glow text-canvas"
                    : "border border-wire text-light hover:border-glow"
                }`}
              >
                {f === "todas" && "Todas"}
                {f === "ocupadas" && `Ocupadas (${stats.occupied})`}
                {f === "pendientes" && `Pendientes (${stats.pending})`}
                {f === "listas" && `Listas (${stats.ready})`}
                {f === "sucias" && `Por Limpiar (${stats.dirty})`}
              </button>
            ))}
          </div>

          <button
            onClick={() => {
              setLoading(true);
              loadTables();
            }}
            disabled={loading}
            className="flex items-center gap-2 border border-wire hover:border-glow px-3 py-2 rounded text-sm font-bold uppercase text-dim hover:text-light transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
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
                onTableClick={(id) => setSelectedTable(id)}
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
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {filteredTables.map((table) => (
                <div
                  key={table.id}
                  onClick={() => table.status === "OCUPADA" && setSelectedTable(table.id)}
                  className={`group relative flex flex-col items-center justify-between rounded-lg border p-4 transition-all duration-300 cursor-pointer aspect-square ${
                    table.status === "DISPONIBLE"
                      ? "border-sage/40 bg-sage/5 hover:border-sage"
                      : table.status === "OCUPADA"
                      ? "border-glow/40 bg-glow/5 hover:border-glow"
                      : "border-ember/40 bg-ember/5 hover:border-ember"
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex w-full items-center justify-between mb-2">
                    <span
                      className={`text-[0.5rem] font-bold uppercase tracking-wider px-2 py-1 rounded ${
                        table.status === "DISPONIBLE"
                          ? "bg-sage/20 text-sage"
                          : table.status === "OCUPADA"
                          ? "bg-glow/20 text-glow"
                          : "bg-ember/20 text-ember"
                      }`}
                    >
                      {table.status === "DISPONIBLE" ? "Libre" : table.status === "OCUPADA" ? "Ocupada" : "Sucia"}
                    </span>
                    {table.status === "OCUPADA" && (
                      <div className="flex items-center gap-1 text-[0.55rem] text-light">
                        <Users className="h-3 w-3" />
                        {table.activeSession?.pax}
                      </div>
                    )}
                  </div>

                  {/* Table Number */}
                  <div className="flex-1 flex flex-col items-center justify-center gap-1">
                    <span className="font-serif text-4xl text-light">{table.number}</span>
                    {table.activeSession && (
                      <span className="text-[0.6rem] font-medium tracking-wider text-light/70 uppercase text-center line-clamp-2">
                        {table.activeSession.guestName}
                      </span>
                    )}
                  </div>

                  {/* Order Badge */}
                  {table.orderCount > 0 && (
                    <div className="flex gap-2 w-full justify-center text-[0.5rem]">
                      {table.pendingCount > 0 && (
                        <div className="bg-glow/20 text-glow px-2 py-1 rounded font-bold">
                          {table.pendingCount} Pend
                        </div>
                      )}
                      {table.readyCount > 0 && (
                        <div className="bg-sage-deep/20 text-sage-deep px-2 py-1 rounded font-bold">
                          {table.readyCount} List
                        </div>
                      )}
                    </div>
                  )}

                  {/* Hover Overlay Info */}
                  {table.status === "OCUPADA" && (
                    <div className="absolute inset-0 bg-canvas/95 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <div className="text-center space-y-2">
                        <p className="text-sm font-bold text-light">
                          ${table.billTotal.toFixed(0)}
                        </p>
                        <p className="text-xs text-dim">
                          {table.orderCount} órdenes
                        </p>
                        <p className="text-xs text-glow font-bold">
                          Click para detalles
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Hover Overlay for Dirty Tables */}
                  {table.status === "SUCIA" && (
                    <div className="absolute inset-0 bg-canvas/95 rounded-lg flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCleanTable(table.id);
                        }}
                        className="flex items-center gap-2 bg-sage-deep hover:bg-sage-deep/90 text-canvas px-4 py-2 rounded font-bold uppercase text-sm transition-colors"
                      >
                        <Sparkles className="h-4 w-4" />
                        Limpiar Mesa
                      </button>
                    </div>
                  )}
                </div>
              ))}
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

