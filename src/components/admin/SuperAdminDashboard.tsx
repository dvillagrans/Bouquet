"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw } from "lucide-react";
import { getSuperAdminDashboard, type SuperAdminDashboardData } from "@/actions/admin";
import { CreateTenantDialog } from "@/components/admin/CreateTenantDialog";

export default function SuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCreatingTenant, setIsCreatingTenant] = useState(false);

  const load = async () => {
    try {
      const res = await getSuperAdminDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, []);

  const fmtCurrency = (n: number) => "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 });

  return (
    <div className="flex flex-col flex-1 min-h-screen bg-bg-solid text-text-primary text-[13px] antialiased">
      {/* TOPBAR */}
      <div className="h-[52px] sticky top-0 z-10 shrink-0 border-b border-border-main bg-bg-bar/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-8 gap-2">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0">
          <div className="hidden sm:flex text-[11px] text-text-dim items-center gap-[6px]">
            Bouquet OPS <span className="text-text-void">›</span>
            <span className="text-text-muted font-medium">Dashboard SaaS</span>
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
          {/* Refrescar — icon-only on mobile */}
          <button
            onClick={() => { setLoading(true); load(); }}
            disabled={loading}
            title="Refrescar"
            className="flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center sm:gap-1.5 rounded border border-border-main bg-transparent text-[11px] font-medium text-text-muted transition-colors hover:border-border-bright hover:text-text-secondary disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`size-3.5 shrink-0 ${loading ? "animate-spin" : ""}`} aria-hidden />
            <span className="hidden sm:inline">Refrescar</span>
          </button>
          {/* Nuevo — icon + short label on mobile */}
          <button
            onClick={() => setIsCreatingTenant(true)}
            className="flex h-8 items-center gap-1.5 rounded border border-gold bg-gold px-3 text-[11px] font-medium text-bg-solid transition-opacity hover:opacity-80 cursor-pointer whitespace-nowrap"
          >
            <Plus className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Nuevo Registro</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-4 sm:px-8 pt-6 sm:pt-8 pb-12">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between mb-6 sm:mb-8 gap-4">
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 flex items-center gap-2 font-medium">
              <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-gold fill-none stroke-[2px] rounded-none">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Bouquet · Matrix
            </div>
            <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-text-primary leading-[1.1]">
              Vista <em className="not-italic font-normal text-gold italic">global.</em>
            </h1>
            <div className="text-[12px] text-text-dim mt-1.5 font-light">
              Métricas y consolidación de inquilinos SaaS
            </div>
          </div>
        </div>

        {!data ? (
          <div className="text-text-dim text-sm py-10 opacity-70 font-light">Cargando núcleo de base de datos...</div>
        ) : (
          <>
            {/* KPI GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border-main border border-border-main rounded-lg overflow-hidden mb-6">
              <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors group relative">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-2 sm:mb-3 flex items-center justify-between">
                  MRR proyectado
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="font-serif text-[24px] sm:text-[32px] font-bold text-gold leading-none mb-1 sm:mb-2 tracking-tight group-hover:drop-shadow-[0_0_8px_rgba(201,160,84,0.3)] transition-all">
                  {fmtCurrency(data.stats.mrr)}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-dash-green">
                  ↑ Modelo de cobranza auto.
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">USD · ciclo mensual</div>
              </div>

              <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-2 sm:mb-3 flex items-center justify-between">
                  Cadenas SaaS
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <div className="font-serif text-[24px] sm:text-[32px] font-bold text-text-primary leading-none mb-1 sm:mb-2 tracking-tight">
                  {data.stats.chains}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-dash-green">
                  ↑ Base B2B
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">Inquilinos en el clúster</div>
              </div>

              <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-2 sm:mb-3 flex items-center justify-between">
                  Restaurantes Totales
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <div className="font-serif text-[24px] sm:text-[32px] font-bold text-text-primary leading-none mb-1 sm:mb-2 tracking-tight">
                  {data.stats.restaurants}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-text-dim">
                  Activos en bd
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">Múltiples sucursales y franquicias</div>
              </div>

              <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-2 sm:mb-3 flex items-center justify-between">
                  Zonas Activas
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                <div className="font-serif text-[24px] sm:text-[32px] font-bold text-text-primary leading-none mb-1 sm:mb-2 tracking-tight">
                  {data.stats.zones}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-text-dim">
                  Estructuración interna
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">Puntos de control (ciudades/regiones)</div>
              </div>
            </div>

            {/* TENANTS TABLE */}
            <div className="bg-bg-card border border-border-main rounded-lg flex flex-col mb-10 overflow-hidden">
              <div className="px-4 sm:px-5 py-3.5 sm:py-4 border-b border-border-main flex items-center justify-between gap-3 bg-bg-bar">
                <div className="text-[11px] font-medium tracking-[0.14em] uppercase text-text-muted flex items-center gap-2">
                  Inquilinos Activos
                </div>
                <button onClick={() => setIsCreatingTenant(true)} className="text-[10px] font-medium tracking-[0.06em] text-gold uppercase hover:opacity-80 transition-opacity cursor-pointer whitespace-nowrap">
                  + Registrar
                </button>
              </div>

              <div className="sm:hidden p-4 space-y-3">
                {data.chains.length === 0 ? (
                  <div className="rounded-lg border border-border-main bg-bg-bar px-4 py-8 text-center text-xs text-text-dim">
                    Aún no hay clientes en la base de datos de Plataforma.
                  </div>
                ) : (
                  data.chains.map((chain) => {
                    const avatar = chain.name.substring(0, 2).toUpperCase();
                    return (
                      <article key={chain.id} className="rounded-xl border border-border-main bg-bg-bar px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.02)]">
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-md bg-gold-faint border border-gold-dim flex items-center justify-center text-[11px] font-bold text-gold shrink-0">
                            {avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-start justify-between gap-3">
                              <div className="min-w-0">
                                <h3 className="truncate text-[13px] font-semibold text-text-primary leading-tight">
                                  {chain.name}
                                </h3>
                                <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-text-dim">
                                  ID {chain.id.split('-')[0]}
                                </p>
                              </div>
                              <span className="inline-flex shrink-0 items-center rounded border border-border-mid bg-bg-solid px-2 py-1 font-mono text-[10px] text-text-secondary">
                                PIN {chain.pin}
                              </span>
                            </div>

                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center rounded border border-[#1e3824] bg-dash-green-bg px-2 py-1 text-[10px] text-dash-green">
                                {chain.adminName}
                              </span>
                              <a
                                href={`/cadena?tenantId=${chain.id}`}
                                target="_blank"
                                className="inline-flex items-center justify-center rounded border border-border-mid px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:bg-bg-solid hover:text-gold"
                              >
                                Abrir consola →
                              </a>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              <div className="hidden sm:block w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead className="hidden sm:table-header-group">
                    <tr className="border-b border-border-main bg-bg-solid/30">
                      <th className="hidden sm:table-cell font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] w-12 border-b-transparent">#</th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] border-b-transparent">Cadena</th>
                      <th className="hidden md:table-cell font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] border-b-transparent">ID <span className="opacity-50">ref</span></th>
                      <th className="hidden sm:table-cell font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] border-b-transparent">Admin</th>
                      <th className="hidden sm:table-cell font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] border-b-transparent">PIN</th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] border-b-transparent">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle [&>tr:last-child]:border-b-0">
                    {data.chains.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-text-dim text-xs">Aún no hay clientes en la base de datos de Plataforma.</td>
                      </tr>
                    ) : (
                      data.chains.map((chain, i) => {
                        const avatar = chain.name.substring(0, 2).toUpperCase();
                        return (
                          <tr key={chain.id} className="border-b border-border-main/40 hover:bg-bg-hover transition-colors">
                            <td className="hidden sm:table-cell px-4 sm:px-5 py-3 text-text-faint font-mono text-xs">{(i + 1).toString().padStart(2, '0')}</td>
                            <td className="px-4 sm:px-5 py-4 sm:py-3">
                              <div className="flex items-center gap-3 sm:gap-3.5">
                                <div className="w-[26px] h-[26px] sm:w-[28px] sm:h-[28px] rounded-md bg-gold-faint border border-gold-dim flex items-center justify-center text-[10px] font-bold text-gold shrink-0">
                                  {avatar}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[12px] font-medium text-text-primary leading-[1.3] truncate max-w-[150px] sm:max-w-none">{chain.name}</div>
                                  <div className="mt-1.5 sm:hidden">
                                    <span className="inline-flex items-center rounded border border-border-mid bg-bg-solid px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
                                      PIN {chain.pin}
                                    </span>
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="hidden md:table-cell px-4 sm:px-5 py-3 text-text-muted font-mono text-[10px]">{chain.id.split('-')[0]}</td>
                            <td className="hidden sm:table-cell px-4 sm:px-5 py-3">
                              <span className="text-[11px] text-dash-green bg-dash-green-bg px-2 py-0.5 rounded border border-[#1e3824]">{chain.adminName}</span>
                            </td>
                            <td className="hidden sm:table-cell px-4 sm:px-5 py-3">
                              <span className="text-text-primary font-mono text-[11px]">{chain.pin}</span>
                            </td>
                            <td className="px-3 sm:px-5 py-4 sm:py-3 text-right sm:text-left">
                              <a href={`/cadena?tenantId=${chain.id}`} target="_blank" className="inline-flex items-center justify-center text-[11px] font-medium text-text-secondary hover:text-gold transition-colors border border-border-mid px-2.5 py-1.5 rounded hover:bg-bg-solid bg-transparent whitespace-nowrap">
                                <span className="hidden sm:inline">Ir a Consola →</span>
                                <span className="sm:hidden">Consola →</span>
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>

      {/* ── DIALOG NUEVO INQUILINO ── */}
      <CreateTenantDialog
        open={isCreatingTenant}
        onOpenChange={setIsCreatingTenant}
        onCreated={load}
      />
    </div>
  );
}
