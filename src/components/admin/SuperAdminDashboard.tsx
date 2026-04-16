"use client";

import { useState, useEffect } from "react";
import { getSuperAdminDashboard, createTenant, type SuperAdminDashboardData } from "@/actions/admin";

export default function SuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const [isCreatingTenant, setIsCreatingTenant] = useState(false);
  const [newTenantName, setNewTenantName] = useState("");
  const [adminName, setAdminName] = useState("");
  const [adminPin, setAdminPin] = useState("");
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
    if (!newTenantName.trim() || !adminName.trim() || !adminPin.trim()) return;

    setCreating(true);
    try {
      await createTenant({ 
        name: newTenantName.trim(),
        adminName: adminName.trim(),
        pin: adminPin.trim()
      });
      setIsCreatingTenant(false);
      setNewTenantName("");
      setAdminName("");
      setAdminPin("");
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
            Bouquet OPS <span className="text-text-void">›</span> <span className="text-text-muted font-medium">Dashboard SaaS principal</span>
          </div>
          {loading ? (
            <div className="flex items-center gap-[6px] text-[10px] text-gold tracking-[0.1em] uppercase bg-gold-faint border border-gold-dim/30 px-3 py-1 rounded-full ml-4">
              <span className="w-[5px] h-[5px] rounded-full bg-gold animate-pulse"></span>
              Sincronizando
            </div>
          ) : (
            <div className="flex items-center gap-[6px] text-[10px] text-dash-green tracking-[0.1em] uppercase bg-dash-green-bg border border-[#1e3824] px-3 py-1 rounded-full ml-4">
              <span className="w-[5px] h-[5px] rounded-full bg-dash-green animate-pulse"></span>
              Estado operativo
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => { setLoading(true); load(); }} disabled={loading} className="bg-transparent border border-border-main rounded px-3 py-1.5 text-[11px] font-medium text-text-muted tracking-[0.04em] transition-colors hover:border-border-bright hover:text-text-secondary cursor-pointer">
            Refrescar
          </button>
          <button onClick={() => setIsCreatingTenant(true)} className="bg-gold border border-gold text-bg-solid rounded px-3 py-1.5 text-[11px] font-medium tracking-[0.04em] transition-opacity hover:opacity-80 cursor-pointer">
            + Nuevo Registro
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="flex-1 px-8 pt-8 pb-12">
        {/* PAGE HEADER */}
        <div className="flex items-start justify-between mb-8 gap-6">
          <div>
            <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 flex items-center gap-2 font-medium">
              <svg viewBox="0 0 24 24" className="w-3 h-3 stroke-gold fill-none stroke-[2px] rounded-none">
                <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
              </svg>
              Bouquet - Matrix Módulo
            </div>
            <h1 className="font-serif text-[28px] font-bold tracking-tight text-text-primary leading-[1.1]">
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
              <div className="bg-bg-card p-6 pb-5 hover:bg-bg-hover transition-colors group relative">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-3 flex items-center justify-between">
                  MRR proyectado
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
                </div>
                <div className="font-serif text-[32px] font-bold text-gold leading-none mb-2 tracking-tight group-hover:drop-shadow-[0_0_8px_rgba(201,160,84,0.3)] transition-all">
                  {fmtCurrency(data.stats.mrr)}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-dash-green">
                  ↑ Modelo de cobranza auto.
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">USD · ciclo mensual</div>
              </div>

              <div className="bg-bg-card p-6 pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-3 flex items-center justify-between">
                  Cadenas SaaS
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>
                </div>
                <div className="font-serif text-[32px] font-bold text-text-primary leading-none mb-2 tracking-tight">
                  {data.stats.chains}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-dash-green">
                  ↑ Base B2B
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">Inquilinos en el clúster</div>
              </div>

              <div className="bg-bg-card p-6 pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-3 flex items-center justify-between">
                  Restaurantes Totales
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
                </div>
                <div className="font-serif text-[32px] font-bold text-text-primary leading-none mb-2 tracking-tight">
                  {data.stats.restaurants}
                </div>
                <div className="text-[11px] flex flex-wrap items-center gap-1 text-text-dim">
                  Activos en bd
                </div>
                <div className="text-[10px] text-text-faint mt-0.5">Múltiples sucursales y franquicias</div>
              </div>

              <div className="bg-bg-card p-6 pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim mb-3 flex items-center justify-between">
                  Zonas Activas
                  <svg className="w-3.5 h-3.5 stroke-text-faint fill-none stroke-[1.5px]"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
                </div>
                <div className="font-serif text-[32px] font-bold text-text-primary leading-none mb-2 tracking-tight">
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
              <div className="px-5 py-4 border-b border-border-main flex items-center justify-between gap-3 bg-bg-bar">
                <div className="text-[11px] font-medium tracking-[0.14em] uppercase text-text-muted flex items-center gap-2">
                  Inquilinos Activos
                </div>
                <button onClick={() => setIsCreatingTenant(true)} className="text-[10px] font-medium tracking-[0.06em] text-gold uppercase hover:opacity-80 transition-opacity cursor-pointer">
                  + Registrar Franquicia
                </button>
              </div>

              <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main bg-bg-solid/30">
                      <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] w-12 border-b-transparent">#</th>
                      <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] border-b-transparent">Cadena Operativa</th>
                      <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] border-b-transparent">ID <span className="opacity-50">ref</span></th>
                      <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] border-b-transparent">Admin Principal</th>
                      <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] border-b-transparent">PIN <span className="opacity-50">/ Acceso</span></th>
                      <th className="font-normal text-[10px] text-text-dim px-5 py-3 tracking-[0.06em] border-b-transparent">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle">
                    {data.chains.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-12 text-text-dim text-xs">Aún no hay clientes en la base de datos de Plataforma.</td>
                      </tr>
                    ) : (
                      data.chains.map((chain, i) => {
                        const avatar = chain.name.substring(0, 2).toUpperCase();
                        return (
                          <tr key={chain.id} className="border-b border-border-main/40 hover:bg-bg-hover transition-colors">
                            <td className="px-5 py-3.5 text-text-faint font-mono text-xs">{(i + 1).toString().padStart(2, '0')}</td>
                            <td className="px-5 py-3.5">
                              <div className="flex items-center gap-3">
                                <div className="w-[28px] h-[28px] rounded-md bg-gold-faint border border-gold-dim flex items-center justify-center text-[10px] font-bold text-gold shrink-0">
                                  {avatar}
                                </div>
                                <div className="text-[12px] font-medium text-text-primary leading-[1.2]">{chain.name}</div>
                              </div>
                            </td>
                            <td className="px-5 py-3.5 text-text-muted font-mono text-[10px]">{chain.id.split('-')[0]}</td>
                            <td className="px-5 py-3.5">
                              <span className="text-[11px] text-dash-green bg-dash-green-bg px-2 py-0.5 rounded border border-[#1e3824]">{chain.adminName}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <span className="text-text-primary font-mono text-[11px]">{chain.pin}</span>
                            </td>
                            <td className="px-5 py-3.5">
                              <a href={`/cadena?tenantId=${chain.id}`} target="_blank" className="text-[11px] font-medium text-text-secondary hover:text-gold transition-colors border border-border-mid px-2 py-1 rounded hover:bg-bg-solid bg-transparent">
                                Ir a Consola →
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

      {/* MODAL NUEVO INQUILINO */}
      {isCreatingTenant && (
        <div className="fixed inset-0 z-50 bg-bg-solid/80 backdrop-blur-[4px] flex items-center justify-center p-4">
          <div className="bg-bg-card border border-border-main rounded-xl w-full max-w-[420px] shadow-2xl relative overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-8">
              <h2 className="font-serif text-[24px] font-bold text-text-primary leading-none mb-2 tracking-tight block w-full text-center">Nuevo Client / Cadena</h2>
              <p className="text-[11px] text-text-muted font-light leading-relaxed mb-6 text-center w-full block">Crea una nueva base y otorga su administrador principal para iniciar la implementación del restaurante.</p>
              
              <form onSubmit={handleCreateTenant} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim block">Denominación Comercial</label>
                  <input 
                    type="text" 
                    required 
                    autoFocus
                    placeholder="Ej. Grupo MIA" 
                    value={newTenantName}
                    onChange={(e) => setNewTenantName(e.target.value)}
                    className="w-full bg-bg-solid border border-border-bright rounded p-2.5 text-[12px] text-text-primary placeholder:text-text-faint outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans"
                  />
                </div>
                
                <div className="space-y-1.5 pt-2 border-t border-border-main/50">
                  <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim block">Alias Administrador</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="Ej. Juan Pérez" 
                    value={adminName}
                    onChange={(e) => setAdminName(e.target.value)}
                    className="w-full bg-bg-solid border border-border-bright rounded p-2.5 text-[12px] text-text-primary placeholder:text-text-faint outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all font-sans"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim block">Código PIN Maestro (Token)</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="12345" 
                    pattern="\d{4,8}"
                    title="De 4 a 8 números"
                    value={adminPin}
                    onChange={(e) => setAdminPin(e.target.value)}
                    className="w-full bg-bg-solid border border-border-bright rounded p-2.5 text-[12px] text-text-primary font-mono placeholder:text-text-faint outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all"
                  />
                </div>
                
                <div className="flex items-center gap-3 pt-4">
                  <button 
                    type="button" 
                    disabled={creating}
                    onClick={() => setIsCreatingTenant(false)} 
                    className="flex-1 bg-transparent border border-border-mid text-text-muted rounded py-2.5 text-[11px] font-medium hover:bg-bg-hover hover:text-text-secondary hover:border-text-dim transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button 
                    type="submit" 
                    disabled={creating || !newTenantName.trim() || !adminName.trim() || !adminPin.trim()} 
                    className="flex-1 bg-gold border border-gold text-bg-solid rounded py-2.5 text-[11px] font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer flex items-center justify-center gap-2 shadow-[0_4px_12px_rgba(201,160,84,0.15)]"
                  >
                    {creating && <span className="w-3 h-3 rounded-full border-2 border-bg-solid border-t-transparent animate-spin"/>}
                    {creating ? "Generando..." : "Lanzar Tenant SaaS"}
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
