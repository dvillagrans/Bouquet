"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, CircleDot, Briefcase, RefreshCw, Building2, MapPin } from "lucide-react";
import { getZoneDashboard } from "@/actions/chain";
import type { ZoneDashboardData, RestaurantSummary } from "@/actions/chain";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function OccupancyBar({ active, total }: { active: number; total: number }) {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;
  const color =
    pct >= 70 ? "bg-glow" : pct >= 40 ? "bg-gold" : pct > 0 ? "bg-sage-deep" : "bg-wire/40";
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-[0.6rem]">
        <span className="text-dim uppercase tracking-wider">Ocupación</span>
        <span className={`font-bold tabular-nums ${pct >= 70 ? "text-glow" : pct >= 40 ? "text-gold" : "text-dim"}`}>
          {pct}%
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-wire/20 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className="text-[0.6rem] text-dim">
        {active} de {total} mesas activas
      </p>
    </div>
  );
}

function RestaurantCard({ r, rank }: { r: RestaurantSummary; rank: number }) {
  const isActive = r.activeTables > 0;
  const pct = r.totalTables > 0 ? Math.round((r.activeTables / r.totalTables) * 100) : 0;

  return (
    <div
      className={`rounded-lg border p-5 space-y-4 transition-colors ${
        isActive
          ? "border-glow/30 bg-glow/[0.04]"
          : "border-wire/30 bg-canvas"
      }`}
    >
      {/* Card header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <span className="text-[0.6rem] text-dim/50 font-mono pt-0.5 tabular-nums">
            #{rank}
          </span>
          <div>
            <p className="text-base font-bold text-light leading-tight">{r.name}</p>
            {r.address && (
              <p className="text-[0.65rem] text-dim mt-0.5 flex items-center gap-1">
                <MapPin className="h-2.5 w-2.5 shrink-0" />
                {r.address}
              </p>
            )}
          </div>
        </div>
        <span
          className={`shrink-0 inline-flex items-center gap-1 text-[0.6rem] font-bold uppercase px-2 py-1 rounded ${
            isActive ? "bg-glow/15 text-glow" : "bg-wire/10 text-dim"
          }`}
        >
          <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-glow animate-pulse" : "bg-dim/40"}`} />
          {isActive ? "En servicio" : "Sin actividad"}
        </span>
      </div>

      {/* Occupancy bar */}
      <OccupancyBar active={r.activeTables} total={r.totalTables} />

      {/* Metrics row */}
      <div className="grid grid-cols-3 gap-2 pt-1">
        <div className="text-center">
          <p className="text-[0.6rem] text-dim uppercase tracking-wider mb-1">Ventas hoy</p>
          <p className="text-sm font-bold font-mono text-light">{fmt(r.todayRevenue)}</p>
        </div>
        <div className="text-center border-x border-wire/20">
          <p className="text-[0.6rem] text-dim uppercase tracking-wider mb-1">Sesiones</p>
          <p className="text-sm font-bold text-light">{r.todaySessions}</p>
        </div>
        <div className="text-center">
          <p className="text-[0.6rem] text-dim uppercase tracking-wider mb-1">Staff</p>
          <p className="text-sm font-bold text-light">{r.activeStaff}</p>
        </div>
      </div>
    </div>
  );
}

export default function ZoneDashboard() {
  const [data, setData] = useState<ZoneDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      setLoading(true);
      setData(await getZoneDashboard());
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
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-dim uppercase tracking-widest text-sm" style={{ animation: "fade-in 1s infinite alternate" }}>Cargando datos de zona...</p>
      </div>
    );
  }

  if (!data) return null;
  const { zone, stats, restaurants } = data;

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="border-b border-wire bg-canvas/50 px-6 py-8">
        <div className="w-full">
          <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <p className="text-xs text-dim uppercase tracking-[0.15em] mb-1">
                Gerente de Zona · {zone.chainName}
              </p>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] text-light">
                Zona {zone.name}
              </h1>
              <p className="mt-1 text-sm text-dim uppercase tracking-[0.1em]">
                {restaurants.length} sucursal{restaurants.length !== 1 ? "es" : ""} · Vista de hoy
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
                <Briefcase className="h-5 w-5 text-light" />
              </div>
              <div>
                <p className="text-[0.65rem] uppercase tracking-wider text-dim">Staff Activo</p>
                <p className="text-xl font-bold text-light">{stats.staffCount}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Restaurant cards */}
      <div className="p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-dim mb-4 flex items-center gap-2">
          <Building2 className="h-3.5 w-3.5" />
          Sucursales en la zona
        </h2>

        {restaurants.length === 0 ? (
          <div className="rounded-lg border border-wire/40 bg-canvas p-12 text-center">
            <Building2 className="h-8 w-8 text-wire mx-auto mb-3" />
            <p className="text-sm text-dim">No hay sucursales en esta zona.</p>
            <p className="text-xs text-dim/60 mt-1">
              Asigna restaurantes a esta zona para verlos aquí.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {restaurants.map((r, i) => (
              <RestaurantCard key={r.id} r={r} rank={i + 1} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
