"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, CircleDot, Briefcase, RefreshCw, Building2, MapPin } from "lucide-react";
import { getZoneDashboard } from "@/actions/chain";
import type { ZoneDashboardData, RestaurantSummary } from "@/actions/chain";
import ZoneAuthGuard from "./ZoneAuthGuard";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function OccupancyBar({ active, total }: { active: number; total: number }) {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;
  const color = pct >= 70 ? "bg-glow" : pct >= 40 ? "bg-gold" : "bg-sage-deep";
  return (
    <div className="flex items-center gap-2">
      <div className="h-1.5 flex-1 rounded-full bg-border-main overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[10px] text-text-dim tabular-nums w-8 text-right">
        {active}/{total}
      </span>
    </div>
  );
}

export default function ZoneDashboard({ initialZoneId }: { initialZoneId?: string }) {
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [data, setData] = useState<ZoneDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async (zid: string) => {
    try {
      setLoading(true);
      const res = await getZoneDashboard(zid);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (zoneId) {
      load(zoneId);
      const iv = setInterval(() => load(zoneId), 30000);
      return () => clearInterval(iv);
    }
  }, [zoneId]);

  if (!zoneId) {
    return <ZoneAuthGuard zoneId={initialZoneId} onAuthenticated={(zid) => setZoneId(zid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-solid text-text-dim px-4 font-sans text-xs">
        <div className="flex items-center gap-2 border border-border-main bg-bg-card px-4 py-2 rounded-full">
           <span className="w-2 h-2 rounded-full border-2 border-gold border-t-transparent animate-spin"/>
           Cargando Operaciones de Zona...
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-dash-red text-xs bg-bg-solid min-h-screen">Esta zona no existe o fue eliminada.</div>;
  }

  return (
    <div className="min-h-screen bg-bg-solid text-text-primary p-4 md:p-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
           <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1.5 flex items-center gap-2 font-medium">
             <Briefcase className="w-3.5 h-3.5" />
             Corporate B2B
           </div>
          <h1 className="font-serif text-[28px] font-bold tracking-tight text-text-primary leading-none mb-1 flex items-center gap-2">
            Zona <em className="not-italic text-gold">{data.zone.name}</em>
          </h1>
          <p className="text-[12px] text-text-dim mt-1 font-light">
            Vista operativa regional. {data.restaurants.length} Sucursales activas.
          </p>
        </div>
        <button
          onClick={() => load(zoneId!)}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-3 py-1.5 bg-bg-card border border-border-main rounded text-[11px] text-text-muted hover:text-text-secondary hover:border-border-bright transition-colors w-full md:w-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          {loading ? "Sincronizando..." : "Actualizar"}
        </button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-bg-card border border-border-main rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-[11px] font-medium tracking-[0.16em] uppercase text-text-dim">Ventas Zonal</h3>
            <div className="p-2 bg-dash-green-bg/50 rounded-lg border border-[#1e3824]">
              <TrendingUp className="w-4 h-4 text-dash-green" />
            </div>
          </div>
          <p className="font-serif text-[28px] font-bold text-text-primary mb-1 tracking-tight">
            {fmt(data.stats.totalRevenue)}
          </p>
          <p className="text-[10px] text-dash-green font-medium">
            ↗ Suma de la región
          </p>
        </div>

        <div className="bg-bg-card border border-border-main rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-[11px] font-medium tracking-[0.16em] uppercase text-text-dim">Mesas en Uso</h3>
            <div className="p-2 bg-gold-faint rounded-lg border border-gold-dim">
              <CircleDot className="w-4 h-4 text-gold" />
            </div>
          </div>
          <p className="font-serif text-[28px] font-bold text-text-primary mb-1 tracking-tight">
            {data.stats.activeTables}
          </p>
          <p className="text-[10px] text-text-dim font-light">
            Distribuidas en sucursales
          </p>
        </div>

        <div className="bg-bg-card border border-border-main rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-[11px] font-medium tracking-[0.16em] uppercase text-text-dim">Staff en Turno</h3>
            <div className="p-2 bg-bg-hover rounded-lg border border-border-mid">
              <Users className="w-4 h-4 text-text-muted" />
            </div>
          </div>
          <p className="font-serif text-[28px] font-bold text-text-primary mb-1 tracking-tight">
            {data.stats.staffCount}
          </p>
          <p className="text-[10px] text-text-dim font-light">
            Operando actualmente
          </p>
        </div>

        <div className="bg-bg-card border border-border-main rounded-xl p-5 shadow-sm">
          <div className="flex items-start justify-between mb-4">
            <h3 className="text-[11px] font-medium tracking-[0.16em] uppercase text-text-dim">Sucursales</h3>
            <div className="p-2 bg-bg-hover rounded-lg border border-border-mid">
              <Building2 className="w-4 h-4 text-text-muted" />
            </div>
          </div>
          <p className="font-serif text-[28px] font-bold text-text-primary mb-1 tracking-tight">
            {data.restaurants.length}
          </p>
          <p className="text-[10px] text-text-dim font-light">
            Locaciones en esta zona
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-4 gap-6">
        {/* TABLA RESTAURANTES ZONA (3/4) */}
        <div className="lg:col-span-3 bg-bg-card border border-border-main rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-5 border-b border-border-main bg-bg-bar flex items-center justify-between">
            <h2 className="text-[12px] font-medium tracking-[0.14em] uppercase text-text-primary">
              Métricas por Sucursal
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-border-main text-text-muted">
              {data.restaurants.length} ubicaciones
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main bg-bg-solid/30">
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Restaurante</th>
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Ventas Hoy</th>
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Ocupación</th>
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Comensales</th>
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Staff</th>
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] text-right">Dirección</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {data.restaurants.map((rest: RestaurantSummary) => (
                  <tr key={rest.id} className="border-b border-border-main/40 hover:bg-bg-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[12px] text-text-primary">{rest.name}</div>
                    </td>
                    <td className="px-5 py-3.5 text-[12px] font-medium text-gold">
                      {fmt(rest.todayRevenue)}
                    </td>
                    <td className="px-5 py-3.5 w-32">
                      <OccupancyBar active={rest.activeTables} total={rest.totalTables} />
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-text-dim">
                      {rest.todaySessions}
                    </td>
                    <td className="px-5 py-3.5">
                       <span className="text-[10px] bg-bg-solid border border-border-main px-2 py-0.5 rounded text-text-muted">
                         {rest.activeStaff} act
                       </span>
                    </td>
                    <td className="px-5 py-3.5 text-[10px] text-text-dim font-light text-right max-w-[150px] truncate">
                      {rest.address || "-"}
                    </td>
                  </tr>
                ))}
                {data.restaurants.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-text-dim text-[11px]">
                      No hay restaurantes asociados a esta zona.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* INFO ZONA (1/4) */}
        <div className="bg-bg-card border border-border-main rounded-xl shadow-sm flex flex-col">
          <div className="p-5 border-b border-border-main bg-bg-bar mb-4">
             <h2 className="text-[12px] font-medium tracking-[0.14em] uppercase text-text-primary">
              Información de Zona
            </h2>
          </div>
          <div className="px-5 pb-5 space-y-6">
            <div>
              <div className="text-[10px] text-text-faint tracking-[0.1em] uppercase mb-1">ID Zona</div>
              <div className="text-[12px] font-mono text-text-secondary">{data.zone.id}</div>
            </div>
            <div>
               <div className="text-[10px] text-text-faint tracking-[0.1em] uppercase mb-1">Nombre</div>
               <div className="text-[14px] text-text-primary">{data.zone.name}</div>
            </div>
            <div>
              <div className="text-[10px] text-text-faint tracking-[0.1em] uppercase mb-2">Resumen Nivel 2</div>
              <p className="text-[11px] text-text-dim font-light leading-relaxed">
                Este tablero consolida todas las operaciones y metas de las sucursales pertenecientes a la zona <strong className="font-medium text-text-muted">{data.zone.name}</strong>.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
