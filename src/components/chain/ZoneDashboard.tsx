"use client";

import { useState, useEffect } from "react";
import { Users, TrendingUp, CircleDot, Briefcase, RefreshCw, Building2, ChevronRight } from "lucide-react";
import { getZoneDashboard } from "@/actions/chain";
import type { ZoneDashboardData, RestaurantSummary } from "@/actions/chain";
import ZoneAuthGuard from "./ZoneAuthGuard";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function OccupancyBar({ active, total }: { active: number; total: number }) {
  const pct = total > 0 ? Math.round((active / total) * 100) : 0;
  const color = pct >= 80 ? "bg-emerald-400" : pct >= 50 ? "bg-gold" : "bg-white/30";
  return (
    <div className="flex items-center gap-3">
      <div className="h-1.5 flex-1 rounded-full bg-white/5 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[12px] font-mono text-text-dim tabular-nums w-10 text-right">
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
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg-solid">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-700">
          <RefreshCw className="size-4 animate-spin text-gold" />
          <span className="text-[13px] font-medium tracking-wide text-text-dim">Cargando Zona...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg-solid animate-in fade-in duration-1000">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-white mb-2">Zona no encontrada</h2>
          <p className="text-[14px] text-text-dim">Esta zona no existe o fue eliminada del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-bg-solid text-[14px] text-text-primary antialiased selection:bg-gold/30">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge animate-in fade-in duration-[2000ms]"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(183,146,93,0.12) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(183,146,93,0.06) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000 animate-in fade-in duration-[2000ms]"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
        aria-hidden
      />

      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/5 bg-bg-solid/80 px-6 backdrop-blur-2xl sm:px-10 animate-in slide-in-from-top-full fade-in duration-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[12px] font-medium text-text-dim uppercase tracking-wider">
            <span className="text-white">Bouquet OPS</span>
            <ChevronRight className="size-3 text-white/20" />
            <span className="text-white/60">ZONAS</span>
            <ChevronRight className="size-3 text-white/20" />
            <span className="text-gold tracking-widest">{data.zone.name}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => load(zoneId!)}
          disabled={loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-transparent text-text-dim transition-colors hover:border-white/20 hover:text-white disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4"
        >
          <RefreshCw className={`size-4 shrink-0 ${loading ? "animate-spin text-gold" : ""}`} aria-hidden />
          <span className="hidden text-[12px] font-medium sm:inline">Sincronizar</span>
        </button>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-10 sm:px-10 sm:pt-14">
        <header 
          className="mb-12 w-full flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
          style={{ animationFillMode: "both", animationDelay: "150ms" }}
        >
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              <Briefcase className="size-3.5" /> Corporate B2B
            </p>
            <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl text-balance">
              Zona <em className="not-italic text-gold">{data.zone.name}</em>.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-text-dim">
              Vista operativa y financiera consolidada a nivel región. Tablero centralizando las métricas en tiempo real de {data.restaurants.length} sucursales activas.
            </p>
          </div>
          <div className="text-left md:text-right">
            <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim mb-1">ID Operativo</p>
            <p className="font-mono text-[13px] text-white/40">{data.zone.id}</p>
          </div>
        </header>

        {/* STATS */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <article 
            className="group overflow-hidden rounded-2xl border border-gold/30 bg-[linear-gradient(135deg,rgba(183,146,93,0.1),rgba(0,0,0,0))] p-6 shadow-[0_32px_64px_-16px_rgba(183,146,93,0.15)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_48px_80px_-16px_rgba(183,146,93,0.25)] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
            style={{ animationFillMode: "both", animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-dim">Ventas Zonal</p>
              <TrendingUp className="size-4 text-gold group-hover:scale-110 transition-transform duration-500" />
            </div>
            <p className="font-serif text-4xl sm:text-5xl font-semibold text-gold tabular-nums leading-none tracking-tight">
              {fmt(data.stats.totalRevenue)}
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
              Ingreso bruto hoy (MXN)
            </div>
          </article>

          <article 
            className="group overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/20 hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
            style={{ animationFillMode: "both", animationDelay: "450ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Mesas en Uso</p>
              <CircleDot className="size-4 text-emerald-400 group-hover:scale-110 transition-transform duration-500" />
            </div>
            <p className="font-serif text-4xl sm:text-5xl font-semibold text-white tabular-nums leading-none tracking-tight group-hover:text-emerald-50 transition-colors duration-500">
              {data.stats.activeTables}
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
              Distribuidas en la zona
            </div>
          </article>

          <article 
            className="group overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/20 hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
            style={{ animationFillMode: "both", animationDelay: "600ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Staff Activo</p>
              <Users className="size-4 text-white/50 group-hover:text-white group-hover:scale-110 transition-all duration-500" />
            </div>
            <p className="font-serif text-4xl sm:text-5xl font-semibold text-white tabular-nums leading-none tracking-tight">
              {data.stats.staffCount}
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
              Personal rotando turno
            </div>
          </article>

          <article 
            className="group overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/20 hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
            style={{ animationFillMode: "both", animationDelay: "750ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Locaciones</p>
              <Building2 className="size-4 text-white/50 group-hover:text-white group-hover:scale-110 transition-all duration-500" />
            </div>
            <p className="font-serif text-4xl sm:text-5xl font-semibold text-white tabular-nums leading-none tracking-tight">
              {data.restaurants.length}
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
              Sucursales integradas
            </div>
          </article>
        </section>

        {/* TABLE */}
        <section 
          className="rounded-2xl border border-white/5 bg-[#0a0a0a] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out"
          style={{ animationFillMode: "both", animationDelay: "900ms" }}
        >
          <div className="border-b border-white/5 px-6 py-5 sm:px-8 flex items-center justify-between">
            <h2 className="text-base font-medium tracking-tight text-white">Métricas Analíticas por Sucursal</h2>
            <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-medium text-text-dim tracking-widest uppercase">
              Desglose Geográfico
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full text-left font-sans">
              <thead>
                <tr className="border-b border-white/5 bg-transparent">
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-text-dim w-[25%]">Restaurante</th>
                  <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-text-dim w-[25%]">Ocupación Física</th>
                  <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-text-dim">Tickets/Sesiones</th>
                  <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-text-dim">Staff</th>
                  <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-text-dim text-gold">Ingreso (Hoy)</th>
                </tr>
              </thead>
              <tbody className="align-middle">
                {data.restaurants.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-20 text-center text-[14px] text-text-dim">
                      No hay restaurantes operando bajo esta zona.
                    </td>
                  </tr>
                ) : (
                  data.restaurants.map((rest: RestaurantSummary, idx) => (
                    <tr 
                      key={rest.id} 
                      className="group border-b border-white/5 transition-colors hover:bg-white/[0.03] last:border-b-0 animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out"
                      style={{ animationFillMode: "both", animationDelay: `${1100 + (idx * 50)}ms` }}
                    >
                      <td className="px-8 py-5">
                        <div className="flex flex-col">
                          <span className="text-[14px] font-medium text-white">{rest.name}</span>
                          <span className="text-[12px] font-light text-text-dim truncate mt-0.5 max-w-[200px]">{rest.address || "Dirección no especificada"}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="group-hover:scale-[1.02] transition-transform duration-500 origin-left">
                          <OccupancyBar active={rest.activeTables} total={rest.totalTables} />
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="text-[13px] text-white tabular-nums">{rest.todaySessions}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="inline-flex items-center justify-center px-2 py-1 rounded bg-white/5 border border-white/10 text-[11px] font-mono text-white/70">
                          {rest.activeStaff}
                        </span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <span className="font-serif text-[16px] font-semibold text-gold tabular-nums tracking-tight">
                          {fmt(rest.todayRevenue)}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
