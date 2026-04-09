"use client";

import { useState, useEffect } from "react";
import { Building2, Users, TrendingUp, MapPin, RefreshCw, CircleDot } from "lucide-react";
import { getChainDashboard } from "@/actions/chain";
import type { ChainDashboardData } from "@/actions/chain";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function OccupancyBar({ active, total }: { active: number; total: number }) {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;
  const color =
    pct >= 70 ? "bg-glow" : pct >= 40 ? "bg-gold" : "bg-sage-deep";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-wire/30 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[0.65rem] text-dim tabular-nums w-8 text-right">
        {active}/{total}
      </span>
    </div>
  );
}

export default function ChainDashboard() {
  const [data, setData] = useState<ChainDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setData(await getChainDashboard());
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 30000);
    return () => clearInterval(iv);
  }, []);

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-ink flex items-center justify-center">
        <p className="text-dim uppercase tracking-widest text-sm">Cargando...</p>
      </div>
    );
  }

  if (!data) return null;
  const { chain, stats, zones, restaurants } = data;

  return (
    <div className="min-h-screen bg-ink">
      {/* Header */}
      <div className="border-b border-wire bg-canvas p-4 sm:p-6">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <p className="text-xs text-dim uppercase tracking-[0.15em] mb-1">
                Gerente de Cadena
              </p>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] text-light">
                {chain.name}
              </h1>
              <p className="mt-1 text-sm text-dim uppercase tracking-[0.1em]">
                Vista consolidada — Hoy
              </p>
            </div>
            <button
              onClick={() => { setLoading(true); load(); }}
              disabled={loading}
              className="shrink-0 flex items-center gap-2 border border-wire hover:border-glow px-3 py-2 rounded text-sm font-bold uppercase text-dim hover:text-light transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <div className="flex items-center gap-3 rounded border border-wire/40 bg-glow/5 p-4">
              <div className="rounded-lg bg-glow/20 p-2.5">
                <TrendingUp className="h-5 w-5 text-glow" />
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-dim">Ventas Hoy</p>
                <p className="text-xl font-bold text-glow">{fmt(stats.totalRevenue)}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded border border-wire/40 bg-glow/5 p-4">
              <div className="rounded-lg bg-glow/20 p-2.5">
                <Users className="h-5 w-5 text-glow" />
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-dim">Mesas Activas</p>
                <p className="text-xl font-bold text-glow">{stats.activeTables}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded border border-wire/40 bg-sage-deep/5 p-4">
              <div className="rounded-lg bg-sage-deep/20 p-2.5">
                <CircleDot className="h-5 w-5 text-sage-deep" />
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-dim">Sesiones Hoy</p>
                <p className="text-xl font-bold text-sage-deep">{stats.totalSessions}</p>
              </div>
            </div>

            <div className="flex items-center gap-3 rounded border border-wire/40 bg-wire/5 p-4">
              <div className="rounded-lg bg-wire/20 p-2.5">
                <Building2 className="h-5 w-5 text-light" />
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-dim">Sucursales</p>
                <p className="text-xl font-bold text-light">{stats.restaurantCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="mx-auto max-w-7xl p-4 sm:p-6 space-y-6">

        {/* Zones summary — only show if zones exist */}
        {zones.length > 0 && (
          <section>
            <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-dim mb-3 flex items-center gap-2">
              <MapPin className="h-3.5 w-3.5" /> Zonas
            </h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {zones.map((zone) => (
                <div
                  key={zone.id}
                  className="rounded-lg border border-wire/40 bg-canvas p-4 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-light uppercase tracking-wider">
                      {zone.name}
                    </span>
                    <span className="text-[0.6rem] text-dim border border-wire/40 rounded px-2 py-0.5 uppercase">
                      {zone.restaurantCount} suc.
                    </span>
                  </div>
                  <p className="text-2xl font-bold text-glow font-mono">
                    {fmt(zone.totalRevenue)}
                  </p>
                  <OccupancyBar active={zone.activeTables} total={zone.totalTables} />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Restaurants table */}
        <section>
          <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-dim mb-3 flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5" /> Sucursales
          </h2>

          {restaurants.length === 0 ? (
            <div className="rounded-lg border border-wire/40 bg-canvas p-12 text-center">
              <Building2 className="h-8 w-8 text-wire mx-auto mb-3" />
              <p className="text-sm text-dim">No hay sucursales registradas.</p>
              <p className="text-xs text-dim/60 mt-1">
                Agrega restaurantes y asígnalos a una cadena para verlos aquí.
              </p>
            </div>
          ) : (
            <div className="rounded-lg border border-wire/40 overflow-hidden">
              {/* Table header */}
              <div className="hidden sm:grid grid-cols-[1fr_auto_auto_auto_auto] gap-4 bg-panel px-4 py-2.5 text-[0.6rem] font-bold uppercase tracking-widest text-dim border-b border-wire/40">
                <span>Sucursal</span>
                <span className="text-right">Mesas</span>
                <span className="text-right">Staff</span>
                <span className="text-right">Ventas hoy</span>
                <span className="text-right">Estado</span>
              </div>

              {/* Rows */}
              {restaurants.map((r, i) => {
                const isActive = r.activeTables > 0;
                return (
                  <div
                    key={r.id}
                    className={`grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto_auto] gap-2 sm:gap-4 px-4 py-3.5 items-center transition-colors hover:bg-white/[0.02] ${
                      i < restaurants.length - 1 ? "border-b border-wire/20" : ""
                    }`}
                  >
                    {/* Name + zone */}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[0.6rem] text-dim/50 font-mono tabular-nums w-4">
                          {i + 1}
                        </span>
                        <p className="text-sm font-semibold text-light">{r.name}</p>
                      </div>
                      <p className="text-[0.65rem] text-dim ml-6">
                        {r.zoneName ? `Zona ${r.zoneName}` : r.address ?? "Sin zona asignada"}
                      </p>
                    </div>

                    {/* Mesas activas */}
                    <div className="sm:text-right flex sm:block items-center gap-2">
                      <span className="text-[0.6rem] text-dim sm:hidden">Mesas:</span>
                      <div className="w-24 sm:w-auto">
                        <OccupancyBar active={r.activeTables} total={r.totalTables} />
                      </div>
                    </div>

                    {/* Staff */}
                    <div className="sm:text-right flex sm:block items-center gap-2">
                      <span className="text-[0.6rem] text-dim sm:hidden">Staff:</span>
                      <span className="text-sm text-light">{r.activeStaff}</span>
                    </div>

                    {/* Revenue */}
                    <div className="sm:text-right flex sm:block items-center gap-2">
                      <span className="text-[0.6rem] text-dim sm:hidden">Ventas:</span>
                      <span className="text-sm font-mono font-semibold text-light">
                        {fmt(r.todayRevenue)}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="sm:text-right flex sm:justify-end">
                      <span
                        className={`inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase px-2 py-1 rounded ${
                          isActive
                            ? "bg-glow/15 text-glow"
                            : "bg-wire/10 text-dim"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            isActive ? "bg-glow" : "bg-dim/40"
                          }`}
                        />
                        {isActive ? "Activa" : "Sin act."}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
