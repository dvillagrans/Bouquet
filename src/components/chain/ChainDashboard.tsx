"use client";

import { useState, useEffect } from "react";
import { Building2, Users, TrendingUp, MapPin, RefreshCw, CircleDot, Plus, ExternalLink } from "lucide-react";
import { getChainDashboard } from "@/actions/chain";
import type { ChainDashboardData } from "@/actions/chain";
import { useMobileNav } from "@/components/dashboard/MobileNavContext";
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
      <span className="text-[10px] text-text-dim tabular-nums w-9 text-right">
        {active}/{total}
      </span>
    </div>
  );
}

export default function ChainDashboard({ initialTenantId }: { initialTenantId?: string }) {
  const { toggle } = useMobileNav();
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
          <span className="w-2 h-2 rounded-full border-2 border-gold border-t-transparent animate-spin" />
          Cargando Dashboard de Cadena...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-solid text-text-primary px-4 py-8 font-sans">
        <div className="max-w-md mx-auto mt-20 text-center border border-border-main bg-bg-card rounded-xl p-8">
          <div className="text-dash-red text-sm font-medium mb-1">Cadena no encontrada</div>
          <p className="text-text-dim text-xs font-light">Esa cadena no existe o fue eliminada.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-bg-solid text-text-primary text-[13px] antialiased">
      {/* TOPBAR */}
      <div className="h-[52px] sticky top-0 z-10 shrink-0 border-b border-border-main bg-bg-bar/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-8 gap-2">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            onClick={toggle}
            className="lg:hidden flex h-8 w-8 shrink-0 items-center justify-center rounded text-text-dim transition-colors hover:text-text-primary"
            aria-label="Abrir menú"
          >
            <svg className="w-4 h-4 stroke-current fill-none stroke-[2px]" viewBox="0 0 24 24">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
          <div className="hidden sm:flex text-[11px] text-text-dim items-center gap-[6px] truncate">
            Cadena <span className="text-text-void">›</span>
            <span className="text-text-muted font-medium truncate">{data.chain.name}</span>
          </div>
          {loading ? (
            <div className="flex items-center gap-[6px] text-[10px] text-gold tracking-[0.1em] uppercase bg-gold-faint border border-gold-dim/30 px-2 py-1 rounded-full shrink-0">
              <span className="w-[5px] h-[5px] rounded-full bg-gold animate-pulse" />
              <span className="hidden sm:inline">Sincronizando</span>
            </div>
          ) : (
            <div className="flex items-center gap-[6px] text-[10px] text-dash-green tracking-[0.1em] uppercase bg-dash-green-bg border border-[#1e3824] px-2 py-1 rounded-full shrink-0">
              <span className="w-[5px] h-[5px] rounded-full bg-dash-green animate-pulse" />
              <span className="hidden sm:inline">Operativo</span>
            </div>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={() => load(tenantId)}
            disabled={loading}
            title="Refrescar"
            className="flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center sm:gap-1.5 rounded border border-border-main bg-transparent text-[11px] font-medium text-text-muted transition-colors hover:border-border-bright hover:text-text-secondary disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 shrink-0 ${loading ? "animate-spin" : ""}`} aria-hidden />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
          <button
            onClick={() => setIsCreatingRest(true)}
            className="flex h-8 items-center gap-1.5 rounded border border-gold bg-gold px-3 text-[11px] font-medium text-bg-solid transition-opacity hover:opacity-80 cursor-pointer whitespace-nowrap"
          >
            <Plus className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Nueva Sucursal</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 sm:px-8 pt-6 sm:pt-8 pb-12">
        {/* PAGE HEADER */}
        <div className="mb-6 sm:mb-8">
          <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 flex items-center gap-2 font-medium">
            <Building2 className="w-3 h-3" />
            Corporate B2B · Panel Maestro
          </div>
          <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-text-primary leading-[1.1]">
            Cadena <em className="not-italic font-normal text-gold italic">{data.chain.name}.</em>
          </h1>
          <p className="text-[12px] text-text-dim mt-1.5 font-light">
            {data.zones.length} {data.zones.length === 1 ? "zona activa" : "zonas activas"} · {data.restaurants.length} {data.restaurants.length === 1 ? "sucursal" : "sucursales"}
          </p>
        </div>

        {/* KPI GRID — connected matrix style */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border-main border border-border-main rounded-lg overflow-hidden mb-6">
          <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors group">
            <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-2 sm:mb-3 flex items-center justify-between">
              Ventas Hoy
              <TrendingUp className="w-3.5 h-3.5 text-dash-green" />
            </div>
            <div className="font-serif text-[24px] sm:text-[32px] font-bold text-gold leading-none mb-1 sm:mb-2 tracking-tight group-hover:drop-shadow-[0_0_8px_rgba(201,160,84,0.3)] transition-all">
              {fmt(data.stats.totalRevenue)}
            </div>
            <div className="text-[11px] flex items-center gap-1 text-dash-green">
              ↗ En tiempo real
            </div>
            <div className="text-[10px] text-text-faint mt-0.5">MXN · acumulado día</div>
          </div>

          <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
            <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-2 sm:mb-3 flex items-center justify-between">
              Mesas Activas
              <CircleDot className="w-3.5 h-3.5 text-gold" />
            </div>
            <div className="font-serif text-[24px] sm:text-[32px] font-bold text-text-primary leading-none mb-1 sm:mb-2 tracking-tight">
              {data.stats.activeTables}
            </div>
            <div className="text-[11px] text-text-dim">
              En servicio ahora
            </div>
            <div className="text-[10px] text-text-faint mt-0.5">Ocupación en vivo</div>
          </div>

          <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
            <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-2 sm:mb-3 flex items-center justify-between">
              Sesiones
              <Users className="w-3.5 h-3.5 text-text-faint" />
            </div>
            <div className="font-serif text-[24px] sm:text-[32px] font-bold text-text-primary leading-none mb-1 sm:mb-2 tracking-tight">
              {data.stats.totalSessions}
            </div>
            <div className="text-[11px] text-text-dim">
              Comensales / Grupos
            </div>
            <div className="text-[10px] text-text-faint mt-0.5">Flujo del día</div>
          </div>

          <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
            <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-2 sm:mb-3 flex items-center justify-between">
              Unidades
              <MapPin className="w-3.5 h-3.5 text-text-faint" />
            </div>
            <div className="font-serif text-[24px] sm:text-[32px] font-bold text-text-primary leading-none mb-1 sm:mb-2 tracking-tight">
              {data.stats.restaurantCount}
            </div>
            <div className="text-[11px] text-text-dim">
              Sucursales operando
            </div>
            <div className="text-[10px] text-text-faint mt-0.5">Red B2B total</div>
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-3 gap-4 sm:gap-6 mb-10">
          {/* RESTAURANTS TABLE (2 cols) */}
          <div className="lg:col-span-2 bg-bg-card border border-border-main rounded-lg overflow-hidden flex flex-col">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border-main bg-bg-bar flex items-center justify-between gap-3">
              <div className="text-[11px] font-medium tracking-[0.14em] uppercase text-text-muted">
                Desempeño por Sucursal
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-solid border border-border-main text-text-muted font-mono shrink-0">
                {data.restaurants.length} ubicaciones
              </span>
            </div>

            {/* MOBILE CARDS */}
            <div className="sm:hidden p-3 space-y-2.5">
              {data.restaurants.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border-main bg-bg-solid px-4 py-10 text-center text-[11px] text-text-dim">
                  No hay sucursales en esta cadena.
                </div>
              ) : (
                data.restaurants.map((rest) => (
                  <article
                    key={rest.id}
                    className="rounded-lg border border-border-main bg-bg-solid p-3.5 hover:border-border-bright transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-[13px] font-medium text-text-primary leading-tight">
                          {rest.name}
                        </h3>
                        <p className="mt-0.5 text-[10px] text-text-faint truncate font-light">
                          {rest.address || "Sin dirección"}
                        </p>
                      </div>
                      {rest.zoneName ? (
                        <span className="shrink-0 rounded border border-border-mid bg-bg-card px-1.5 py-0.5 text-[9px] uppercase tracking-[0.08em] text-text-muted">
                          {rest.zoneName}
                        </span>
                      ) : (
                        <span className="shrink-0 text-[9px] text-text-faint uppercase tracking-[0.08em]">
                          Indep.
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-[1px] bg-border-main border border-border-main rounded overflow-hidden mb-2.5">
                      <div className="bg-bg-card px-2.5 py-1.5">
                        <div className="text-[9px] uppercase tracking-[0.12em] text-text-faint">Ventas</div>
                        <div className="mt-0.5 text-[12px] font-medium text-gold font-serif tracking-tight">
                          {fmt(rest.todayRevenue)}
                        </div>
                      </div>
                      <div className="bg-bg-card px-2.5 py-1.5">
                        <div className="text-[9px] uppercase tracking-[0.12em] text-text-faint">Staff</div>
                        <div className="mt-0.5 text-[12px] font-medium text-text-primary">
                          {rest.activeStaff}
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between text-[9px] uppercase tracking-[0.12em] text-text-faint">
                        <span>Ocupación</span>
                      </div>
                      <OccupancyBar active={rest.activeTables} total={rest.totalTables} />
                    </div>
                  </article>
                ))
              )}
            </div>

            {/* DESKTOP TABLE */}
            <div className="hidden sm:block overflow-x-auto scrollbar-hide">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-border-main bg-bg-solid/30">
                    <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Sucursal</th>
                    <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Zona</th>
                    <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Ventas Hoy</th>
                    <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Ocupación</th>
                    <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] text-right">Staff</th>
                  </tr>
                </thead>
                <tbody className="align-middle">
                  {data.restaurants.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-5 py-12 text-center text-text-dim text-[11px]">
                        No hay sucursales registradas. Crea la primera con "Nueva Sucursal".
                      </td>
                    </tr>
                  ) : (
                    data.restaurants.map((rest) => (
                      <tr key={rest.id} className="border-b border-border-main/40 hover:bg-bg-hover transition-colors">
                        <td className="px-5 py-3.5">
                          <div className="font-medium text-[12px] text-text-primary">{rest.name}</div>
                          <div className="text-[10px] text-text-faint font-light truncate max-w-[180px]">
                            {rest.address || "Sin dirección"}
                          </div>
                        </td>
                        <td className="px-5 py-3.5">
                          {rest.zoneName ? (
                            <span className="text-[10px] font-medium tracking-[0.04em] text-text-muted bg-bg-solid border border-border-main px-2 py-1 rounded">
                              {rest.zoneName}
                            </span>
                          ) : (
                            <span className="text-[10px] text-text-faint italic">Independiente</span>
                          )}
                        </td>
                        <td className="px-5 py-3.5 text-[12px] font-medium text-gold font-serif tracking-tight">
                          {fmt(rest.todayRevenue)}
                        </td>
                        <td className="px-5 py-3.5 w-36">
                          <OccupancyBar active={rest.activeTables} total={rest.totalTables} />
                        </td>
                        <td className="px-5 py-3.5 text-[12px] text-text-muted text-right font-mono">
                          {rest.activeStaff}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* ZONES SIDEBAR */}
          <div className="bg-bg-card border border-border-main rounded-lg overflow-hidden flex flex-col">
            <div className="px-4 sm:px-5 py-3 sm:py-4 border-b border-border-main bg-bg-bar flex items-center justify-between gap-2">
              <div className="text-[11px] font-medium tracking-[0.14em] uppercase text-text-muted">
                Zonas
              </div>
              {data.zones.length > 0 && (
                <span className="text-[9px] tracking-[0.14em] uppercase text-gold font-medium bg-gold-faint border border-gold-dim/30 px-2 py-0.5 rounded-full">
                  N2 · {data.zones.length}
                </span>
              )}
            </div>
            <div className="p-3 sm:p-4 flex flex-col gap-2.5 flex-1">
              {data.zones.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-[11px] text-text-faint gap-2 p-6 sm:p-8 text-center bg-bg-solid rounded-lg border border-dashed border-border-main">
                  <MapPin className="w-6 h-6 text-text-muted mb-1" />
                  <div className="text-text-dim font-medium">Sin zonas configuradas</div>
                  <span className="text-[10px] font-light max-w-[200px]">
                    Designa una zona al crear una sucursal para activar la agrupación.
                  </span>
                </div>
              ) : (
                data.zones.map((zone) => (
                  <div
                    key={zone.id}
                    className="border border-border-main rounded-lg p-3.5 bg-bg-solid hover:border-border-bright hover:bg-bg-hover/40 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="min-w-0">
                        <h4 className="text-[12px] font-medium text-text-primary truncate">
                          {zone.name}
                        </h4>
                        <p className="text-[10px] text-text-faint mt-0.5">
                          {zone.restaurantCount} {zone.restaurantCount === 1 ? "sucursal" : "sucursales"}
                        </p>
                      </div>
                      <span className="text-[12px] font-medium text-gold font-serif tracking-tight shrink-0">
                        {fmt(zone.totalRevenue)}
                      </span>
                    </div>
                    <div className="mb-1.5 flex items-center justify-between">
                      <span className="text-[9px] uppercase tracking-[0.12em] text-text-faint">
                        Ocupación
                      </span>
                      <a
                        href={`/zona?zoneId=${zone.id}`}
                        target="_blank"
                        className="text-[10px] text-gold hover:opacity-80 transition-opacity flex items-center gap-1 font-medium"
                      >
                        Gestionar
                        <ExternalLink className="w-2.5 h-2.5" />
                      </a>
                    </div>
                    <OccupancyBar active={zone.activeTables} total={zone.totalTables} />
                  </div>
                ))
              )}
            </div>
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
