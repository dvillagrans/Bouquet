const fs = require('fs');

const dashboardCode = `"use client";

import { useState, useEffect } from "react";
import { getSuperAdminDashboard, createTenant, type SuperAdminDashboardData } from "@/actions/admin";

export default function SuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [creating, setCreating] = useState(false);

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

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTenantName.trim()) return;

    setCreating(true);
    try {
      await createTenant({ name: newTenantName.trim() });
      setIsCreatingTenant(false);
      setNewTenantName("");
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setCreating(false);
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
      <div className="h-[52px] border-b border-border-main flex items-center justify-between px-8 sticky top-0 z-10 bg-bg-bar/90 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2">
          <div className="text-[11px] text-text-dim flex items-center gap-[6px]">
            Bouquet OPS <span className="text-text-void">›</span> <span className="text-text-muted font-medium">Vista general</span>
          </div>
          {loading ? (
            <div className="flex items-center gap-[6px] text-[10px] text-gold tracking-[0.1em] uppercase bg-gold-faint border border-gold-dim/30 px-2.5 py-1 rounded-full ml-4">
              <span className="w-[5px] h-[5px] rounded-full bg-gold animate-pulse"></span>
              Sincronizando
            </div>
          ) : (
            <div className="flex items-center gap-[6px] text-[10px] text-dash-green tracking-[0.1em] uppercase bg-dash-green-bg border border-[#1e3824] px-2.5 py-1 rounded-full ml-4">
              <span className="w-[5px] h-[5px] rounded-full bg-dash-green animate-pulse"></span>
              Estado operativo
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <div className="font-mono text-[11px] text-text-dim" suppressHydrationWarning>
            {new Date().toLocaleTimeString('en-US', { hour12: false })}
          </div>
          <button onClick={() => { setLoading(true); load(); }} disabled={loading} className="bg-transparent border border-border-main rounded px-3 py-1.5 text-[11px] font-medium text-text-muted tracking-[0.04em] transition-colors hover:border-border-bright hover:text-text-secondary">
            Refrescar
          </button>
          <button onClick={() => setIsCreatingTenant(true)} className="bg-gold border border-gold text-bg-solid rounded px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] transition-opacity hover:opacity-85">
            + Nuevo inquilino
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-8 pt-8 pb-12">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between mb-8 gap-6">
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 flex items-center gap-2">
              <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-gold fill-none stroke-[2px] rounded-none">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Ecosistema SaaS
            </div>
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-text-primary leading-[1.1]">
              Vista <em className="not-italic font-normal text-gold italic">global.</em>
            </h1>
            <div className="text-[12px] text-text-dim mt-1.5 font-light">
              Actualizado en tiempo real
            </div>
          </div>
        </div>

        {!data ? (
          <div className="text-text-dim text-sm py-10">Cargando métricas...</div>
        ) : (
          <>
            {/* KPI GRID */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border-main border border-border-main rounded-lg overflow-hidden mb-6">
              <div className="bg-bg-card p-6 pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-3 flex items-center justify-between">
                  MRR proyectado
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="font-serif text-[32px] font-bold text-gold leading-none mb-2 tracking-tight">
                  {fmtCurrency(data.stats.mrr)}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-dash-green">
                  ↑ 12% vs mes pasado
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">USD · ciclo mensual</div>
              </div>

              <div className="bg-bg-card p-6 pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-3 flex items-center justify-between">
                  Tenants activos
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <div className="font-serif text-[32px] font-bold text-text-primary leading-none mb-2 tracking-tight">
                  {data.stats.chains}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-dash-green">
                  ↑ Activos y operando
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">cadenas registradas</div>
              </div>

              <div className="bg-bg-card p-6 pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-3 flex items-center justify-between">
                  Restaurantes
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <div className="font-serif text-[32px] font-bold text-text-primary leading-none mb-2 tracking-tight">
                  {data.stats.restaurants}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-text-dim">
                  sin cambios recientes
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">sucursales totales</div>
              </div>

              <div className="bg-bg-card p-6 pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-3 flex items-center justify-between">
                  Zonas activas
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                <div className="font-serif text-[32px] font-bold text-text-primary leading-none mb-2 tracking-tight">
                  {data.stats.zones}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-dash-green">
                  ↑ Operativas hoy
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">salones configurados</div>
              </div>
            </div>

            {/* DASHBOARD GRID */}
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4 items-start">
              
              {/* TENANTS TABLE */}
              <div className="bg-bg-card border border-border-main rounded-lg overflow-hidden">
                <div className="px-5 py-4 border-b border-border-main flex items-center justify-between gap-3">
                  <div className="text-[11px] font-medium tracking-[0.14em] uppercase text-text-muted flex items-center gap-2">
                    <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]" viewBox="0 0 24 24"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                    Cadenas registradas
                  </div>
                  <button onClick={() => setIsCreatingTenant(true)} className="text-[10px] font-medium tracking-[0.06em] text-gold uppercase hover:opacity-80 transition-opacity">
                    + Nuevo inquilino
                  </button>
                </div>

                <div className="w-full overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-border-main">
                        <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] w-12">#</th>
                        <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Tenant</th>
                        <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Plan</th>
                        <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Sucursales</th>
                        <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">MRR <span className="opacity-50">est.</span></th>
                        <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em]">Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.chains.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="text-center py-10 text-text-dim text-xs">No hay cadenas registradas.</td>
                        </tr>
                      ) : (
                        data.chains.map((chain: any, i: number) => {
                          const avatar = chain.name.substring(0, 2).toUpperCase();
                          return (
                            <tr key={chain.id} className="border-b border-border-main/40 hover:bg-bg-hover transition-colors">
                              <td className="px-5 py-3.5 text-text-faint font-mono text-xs">{(i + 1).toString().padStart(2, '0')}</td>
                              <td className="px-5 py-3.5">
                                <div className="flex items-center gap-3">
                                  <div className="w-8 h-8 rounded-full bg-border-main border border-border-bright flex items-center justify-center text-[10px] font-medium text-text-secondary shrink-0">
                                    {avatar}
                                  </div>
                                  <div>
                                    <div className="text-[13px] font-medium text-text-primary leading-[1.2]">{chain.name}</div>
                                    <div className="text-[10px] text-text-dim font-mono mt-0.5">tenant_{chain.id.split('-')[0]}</div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="bg-gold-faint text-gold border border-gold-dim py-0.5 px-2 rounded-full text-[9px] font-medium tracking-[0.06em]">Enterprise</span>
                              </td>
                              <td className="px-5 py-3.5 text-text-muted">{chain.restaurantsCount}</td>
                              <td className="px-5 py-3.5">
                                <span className="text-[13px] font-medium text-gold">{fmtCurrency(chain.restaurantsCount * 199)}</span>
                              </td>
                              <td className="px-5 py-3.5">
                                <span className="bg-dash-green-bg text-dash-green border border-[#1e3824] py-0.5 px-2 rounded-full text-[9px] font-medium tracking-[0.06em]">Activo</span>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* RIGHT COL */}
              <div className="flex flex-col gap-4">
                
                {/* RECENT ACTIVITY */}
                <div className="bg-bg-card border border-border-main rounded-lg overflow-hidden">
                  <div className="px-5 py-4 border-b border-border-main flex items-center gap-3">
                    <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                    <div className="text-[11px] font-medium tracking-[0.14em] uppercase text-text-muted">Actividad reciente</div>
                  </div>
                  <div className="p-5 flex flex-col gap-4">
                    {data.chains.slice(0, 3).map((chain: any) => (
                      <div key={'a-'+chain.id} className="flex items-start gap-3">
                        <div className="w-[6px] h-[6px] rounded-full bg-dash-blue mt-1.5 shrink-0 shadow-[0_0_6px_var(--color-dash-blue)]"></div>
                        <div>
                          <div className="text-xs text-text-secondary leading-[1.4]"><strong className="text-text-primary font-medium">{chain.name}</strong> activo en red</div>
                          <div className="text-[10px] text-text-dim mt-0.5">Reporte actual</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SYS ACTIONS */}
                <div className="bg-border-main/50 border border-border-main rounded-lg overflow-hidden">
                  <div className="px-5 py-3 border-b border-border-main flex items-center justify-between">
                    <div className="flex items-center gap-2">
                       <svg className="w-3 h-3 stroke-text-faint fill-none stroke-[1.5px]" viewBox="0 0 24 24"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                       <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-dim">Acciones del sistema</span>
                    </div>
                    <span className="text-[9px] uppercase tracking-[0.1em] text-dash-red bg-dash-red-bg border border-[#3e1818] px-1.5 py-[1px] rounded">Solo Root</span>
                  </div>
                  <div className="flex flex-col">
                    <div className="px-5 py-3 border-b border-border-main/50 flex items-center justify-between cursor-pointer hover:bg-bg-card transition-colors group">
                      <div>
                        <div className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">Emitir DDL global</div>
                        <div className="text-[10px] text-text-dim mt-0.5">Actualiza esquemas en todos tenants</div>
                      </div>
                      <div className="text-text-faint font-light text-lg">›</div>
                    </div>
                    <div className="px-5 py-3 flex items-center justify-between cursor-pointer hover:bg-bg-card transition-colors group">
                      <div>
                        <div className="text-xs font-medium text-text-secondary group-hover:text-text-primary transition-colors">Purgar caché global</div>
                        <div className="text-[10px] text-text-dim mt-0.5">Limpia analytics masivamente</div>
                      </div>
                      <div className="text-text-faint font-light text-lg">›</div>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </>
        )}

      </div>

      {/* MODAL NUEVO INQUILINO */}
      {isCreatingTenant && (
        <div className="fixed inset-0 z-50 bg-bg-solid/80 backdrop-blur-[2px] flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-main rounded-xl w-full max-w-[420px] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="font-serif text-[24px] font-bold text-text-primary leading-none mb-2">Nuevo inquilino</h2>
              <p className="text-[12px] text-text-muted font-light leading-relaxed mb-6">Registra una nueva cadena de restaurantes en el ecosistema.</p>
              
              <form onSubmit={handleCreateTenant} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium tracking-[0.1em] uppercase text-text-dim block">Nombre de la cadena</label>
                  <input 
                    type="text" 
                    required 
                    autoFocus
                    placeholder="Ej. Grupo Mia Restaurantes" 
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    className="w-full bg-border-main border border-border-bright rounded p-3 text-[13px] text-text-primary placeholder:text-text-faint outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans"
                  />
                </div>
                <div className="flex items-center gap-3 pt-6">
                  <button 
                    type="button" 
                    disabled={creating}
                    onClick={() => setIsCreatingTenant(false)} 
                    className="flex-1 bg-transparent border border-border-main text-text-muted rounded py-2.5 text-xs font-medium hover:bg-bg-hover hover:text-text-secondary transition-colors"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={creating || !newTenantName.trim()} 
                    className="flex-1 bg-gold border border-gold text-bg-solid rounded py-2.5 text-xs font-medium hover:opacity-90 disabled:opacity-50 transition-opacity"
                  >
                    {creating ? "Creando..." : "Crear inquilino →"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
`;

fs.writeFileSync('src/components/admin/SuperAdminDashboard.tsx', dashboardCode);
