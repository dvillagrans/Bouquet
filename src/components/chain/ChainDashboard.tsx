"use client";

import { useState, useEffect } from "react";
import { Building2, Users, TrendingUp, MapPin, RefreshCw, CircleDot, Plus } from "lucide-react";
import { getChainDashboard } from "@/actions/chain";
import type { ChainDashboardData } from "@/actions/chain";
import ChainAuthGuard from "./ChainAuthGuard";
import CreateRestaurantDialog from "./CreateRestaurantDialog";

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

export default function ChainDashboard({ initialTenantId }: { initialTenantId?: string }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [data, setData] = useState<ChainDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingRest, setIsCreatingRest] = useState(false);

  const load = async (tid: string) => {
    try {
      setLoading(true);
      const res = await getChainDashboard(tid);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (tenantId) {
      load(tenantId);
      const iv = setInterval(() => load(tenantId), 30000);
      return () => clearInterval(iv);
    }
  }, [tenantId]);

  if (!tenantId) {
    return <ChainAuthGuard tenantId={initialTenantId} onAuthenticated={(tid) => setTenantId(tid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-bg-solid text-text-dim px-4 font-sans text-xs">
        <div className="flex items-center gap-2 border border-border-main bg-bg-card px-4 py-2 rounded-full">
           <span className="w-2 h-2 rounded-full border-2 border-gold border-t-transparent animate-spin"/>
           Cargando Dashboard de Cadena...
        </div>
      </div>
    );
  }

  if (!data) {
    return <div className="p-8 text-dash-red text-xs bg-bg-solid min-h-screen">Esa cadena no existe o fue eliminada.</div>;
  }

  return (
    <div className="min-h-screen bg-bg-solid text-text-primary px-4 py-4 sm:px-6 md:p-8 font-sans">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-5 sm:mb-8">
        <div className="max-w-2xl">
           <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-1.5 flex items-center gap-2 font-medium">
             <Building2 className="w-3.5 h-3.5" />
             Corporate B2B
           </div>
          <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-text-primary leading-tight mb-1">
            Cadena <em className="not-italic text-gold">{data.chain.name}</em>
          </h1>
          <p className="text-[12px] sm:text-[13px] text-text-dim mt-1 font-light max-w-xl leading-5">
            Vista global. {data.zones.length} Zonas activas. {data.restaurants.length} Sucursales.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2 w-full md:w-auto md:flex md:items-center">
          <button
            onClick={() => setIsCreatingRest(true)}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-gold border border-gold rounded text-[11px] text-bg-solid hover:bg-gold-light transition-colors w-full md:w-auto font-medium"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="sm:hidden">Nueva</span>
            <span className="hidden sm:inline">Nueva Sucursal</span>
          </button>
          <button
            onClick={() => load(tenantId)}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-3 py-2.5 bg-bg-card border border-border-main rounded text-[11px] text-text-muted hover:text-text-secondary hover:border-border-bright transition-colors w-full md:w-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            <span className="sm:hidden">{loading ? "Sync" : "Refrescar"}</span>
            <span className="hidden sm:inline">{loading ? "Sincronizando..." : "Actualizar"}</span>
          </button>
        </div>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-4 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-bg-card border border-border-main rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <h3 className="text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-text-dim leading-tight pr-2">Ventas Hoy</h3>
            <div className="p-2 bg-dash-green-bg/50 rounded-lg border border-[#1e3824] shrink-0">
              <TrendingUp className="w-4 h-4 text-dash-green" />
            </div>
          </div>
          <p className="font-serif text-[24px] sm:text-[28px] font-bold text-text-primary mb-1 tracking-tight leading-none">
            {fmt(data.stats.totalRevenue)}
          </p>
          <p className="text-[10px] text-dash-green font-medium leading-4">
            ↗ En tiempo real
          </p>
        </div>

        <div className="bg-bg-card border border-border-main rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <h3 className="text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-text-dim leading-tight pr-2">Mesas Activas</h3>
            <div className="p-2 bg-gold-faint rounded-lg border border-gold-dim shrink-0">
              <CircleDot className="w-4 h-4 text-gold" />
            </div>
          </div>
          <p className="font-serif text-[24px] sm:text-[28px] font-bold text-text-primary mb-1 tracking-tight leading-none">
            {data.stats.activeTables}
          </p>
          <p className="text-[10px] text-text-dim font-light leading-4">
            En servicio este momento
          </p>
        </div>

        <div className="bg-bg-card border border-border-main rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <h3 className="text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-text-dim leading-tight pr-2">Sesiones</h3>
            <div className="p-2 bg-bg-hover rounded-lg border border-border-mid shrink-0">
              <Users className="w-4 h-4 text-text-muted" />
            </div>
          </div>
          <p className="font-serif text-[24px] sm:text-[28px] font-bold text-text-primary mb-1 tracking-tight leading-none">
            {data.stats.totalSessions}
          </p>
          <p className="text-[10px] text-text-dim font-light leading-4">
            Comensales / Grupos hoy
          </p>
        </div>

        <div className="bg-bg-card border border-border-main rounded-xl p-4 sm:p-5 shadow-sm">
          <div className="flex items-start justify-between mb-3 sm:mb-4">
            <h3 className="text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-text-dim leading-tight pr-2">Unidades</h3>
            <div className="p-2 bg-bg-hover rounded-lg border border-border-mid shrink-0">
              <MapPin className="w-4 h-4 text-text-muted" />
            </div>
          </div>
          <p className="font-serif text-[24px] sm:text-[28px] font-bold text-text-primary mb-1 tracking-tight leading-none">
            {data.stats.restaurantCount}
          </p>
          <p className="text-[10px] text-text-dim font-light leading-4">
            Sucursales operando
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 sm:gap-6">
        {/* TABLA SUCURSALES (ocupa 2 columnas) */}
        <div className="lg:col-span-2 bg-bg-card border border-border-main rounded-xl shadow-sm overflow-hidden flex flex-col">
          <div className="p-4 sm:p-5 border-b border-border-main bg-bg-bar flex items-center justify-between gap-3">
            <h2 className="text-[12px] font-medium tracking-[0.14em] uppercase text-text-primary">
              Desempeño por Sucursal
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-border-main text-text-muted">
              {data.restaurants.length} ubicaciones
            </span>
          </div>
          <div className="sm:hidden p-4 space-y-3">
            {data.restaurants.length === 0 ? (
              <div className="rounded-lg border border-border-main bg-bg-solid px-4 py-8 text-center text-xs text-text-dim">
                No hay restaurantes registrados en esta cadena.
              </div>
            ) : (
              data.restaurants.map((rest) => (
                <article key={rest.id} className="rounded-xl border border-border-main bg-bg-solid p-4 shadow-[0_1px_0_rgba(255,255,255,0.02)]">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="truncate text-[13px] font-semibold text-text-primary leading-tight">
                        {rest.name}
                      </h3>
                      <p className="mt-1 text-[10px] text-text-dim truncate">
                        {rest.address || "Sin dirección"}
                      </p>
                    </div>
                    <span className="rounded-full border border-border-mid bg-bg-card px-2 py-1 text-[10px] text-text-muted shrink-0">
                      {rest.zoneName || "Independiente"}
                    </span>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                    <div className="rounded-lg border border-border-main bg-bg-card px-3 py-2">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-text-dim">Ventas hoy</div>
                      <div className="mt-1 font-medium text-gold">{fmt(rest.todayRevenue)}</div>
                    </div>
                    <div className="rounded-lg border border-border-main bg-bg-card px-3 py-2">
                      <div className="text-[9px] uppercase tracking-[0.12em] text-text-dim">Staff</div>
                      <div className="mt-1 font-medium text-text-primary">{rest.activeStaff}</div>
                    </div>
                  </div>

                  <div className="mt-3">
                    <div className="mb-2 flex items-center justify-between text-[10px] text-text-dim">
                      <span>Ocupación</span>
                      <span>{rest.activeTables}/{rest.totalTables}</span>
                    </div>
                    <OccupancyBar active={rest.activeTables} total={rest.totalTables} />
                  </div>
                </article>
              ))
            )}
          </div>

          <div className="hidden sm:block overflow-x-auto scrollbar-hide">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-border-main bg-bg-solid/30">
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Restaurante</th>
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Zona / Región</th>
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Ventas Hoy</th>
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Ocupación</th>
                  <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] text-right">Staff</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {data.restaurants.map((rest) => (
                  <tr key={rest.id} className="border-b border-border-main/40 hover:bg-bg-hover transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-medium text-[12px] text-text-primary">{rest.name}</div>
                      <div className="text-[10px] text-text-dim font-light truncate max-w-[150px]">
                        {rest.address || "Sin dirección"}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      {rest.zoneName ? (
                         <span className="text-[10px] font-medium tracking-[0.04em] text-text-muted bg-bg-solid border border-border-main px-2 py-1 rounded">
                           {rest.zoneName}
                         </span>
                      ) : (
                        <span className="text-[10px] text-text-faint">Independiente</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-[12px] font-medium text-gold">
                      {fmt(rest.todayRevenue)}
                    </td>
                    <td className="px-5 py-3.5 w-32">
                      <OccupancyBar active={rest.activeTables} total={rest.totalTables} />
                    </td>
                    <td className="px-5 py-3.5 text-[12px] text-text-dim text-right">
                      {rest.activeStaff}
                    </td>
                  </tr>
                ))}
                {data.restaurants.length === 0 && (
                  <tr>
                    <td colSpan={5} className="p-8 text-center text-text-dim text-[11px]">
                      No hay restaurantes registrados en esta cadena.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ZONAS */}
        <div className="bg-bg-card border border-border-main rounded-xl shadow-sm flex flex-col">
          <div className="p-4 sm:p-5 border-b border-border-main bg-bg-bar flex items-center justify-between">
            <h2 className="text-[12px] font-medium tracking-[0.14em] uppercase text-text-primary">
              Agrupación por Zonas
            </h2>
            {data.zones.length > 0 && (
               <span className="text-[10px] text-gold font-medium">Nivel 2 Activo</span>
            )}
          </div>
          <div className="p-4 sm:p-5 flex flex-col gap-4 flex-1">
            {data.zones.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center text-[11px] text-text-faint gap-2 p-6 sm:p-8 text-center bg-bg-solid rounded-lg border border-border-main border-dashed">
                <MapPin className="w-6 h-6 text-text-muted mb-2" />
                Sin zonas configuradas
                <span className="text-[10px]">Crea una nueva sucursal designando una zona para activarlas.</span>
              </div>
            ) : (
              data.zones.map((zone) => (
                <div key={zone.id} className="border border-border-main rounded-lg p-4 bg-bg-solid">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="text-[12px] font-medium text-text-secondary flex items-center gap-1.5">
                        {zone.name}
                        <span className="px-1.5 py-[1px] bg-bg-card border border-border-main rounded text-[8px] text-text-muted font-mono">{zone.id}</span>
                      </h4>
                      <p className="text-[10px] text-text-faint mt-1">{zone.restaurantCount} sucursales</p>
                    </div>
                    <span className="text-[12px] font-medium text-text-primary">{fmt(zone.totalRevenue)}</span>
                  </div>
                  <div className="text-[10px] text-text-dim mb-1 flex items-center justify-between">
                     <span>Ocupación combinada</span>
                     <a href={`/zona?zoneId=${zone.id}`} target="_blank" className="text-gold hover:text-gold-light hover:underline">Gestionar &rarr;</a>
                  </div>
                  <OccupancyBar active={zone.activeTables} total={zone.totalTables} />
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {isCreatingRest && (
        <CreateRestaurantDialog
          chainId={tenantId}
          zones={data.zones}
          onCreated={() => {
            load(tenantId);
          }}
          onClose={() => setIsCreatingRest(false)}
        />
      )}
    </div>
  );
}
