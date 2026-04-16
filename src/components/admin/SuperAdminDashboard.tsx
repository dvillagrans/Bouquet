"use client";

import { useState, useEffect } from "react";
import { Building, Map, LayoutGrid, DollarSign, Activity, Plus } from "lucide-react";
import { getSuperAdminDashboard, createTenant, type SuperAdminDashboardData } from "@/actions/admin";

function StatCard({ 
  label, 
  value, 
  icon: Icon, 
  trend 
}: { 
  label: string; 
  value: string | number; 
  icon: any; 
  trend?: string;
}) {
  return (
    <div className="border border-wire bg-white/[0.01] p-4 sm:p-5 rounded-lg flex flex-col justify-between">
      <div className="flex items-center justify-between mb-3 text-dim">
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em]">{label}</span>
        <Icon className="h-4 w-4 opacity-50" />
      </div>
      <div>
        <p className="text-2xl sm:text-3xl font-bold text-light tabular-nums tracking-tight">
          {value}
        </p>
        {trend && (
          <p className="text-[0.65rem] text-glow font-medium mt-1 uppercase tracking-wider">
            {trend}
          </p>
        )}
      </div>
    </div>
  );
}

export default function SuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // States for 'New Tenant' flow
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
      // Reload stats
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

  if (loading && !data) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <p className="text-dim uppercase tracking-widest text-sm" style={{ animation: "fade-in 1s infinite alternate" }}>
          Iniciando Core SaaS...
        </p>
      </div>
    );
  }

  if (!data) return null;
  const { stats, chains } = data;

  const fmtCurrency = (n: number) => 
    `$${n.toLocaleString("en-US", { minimumFractionDigits: 0 })} USD`;

  return (
    <div className="w-full pb-20">
      {/* Header */}
      <div className="border-b border-wire bg-canvas/50 px-6 py-8">
        <div className="w-full">
          <div className="flex items-start justify-between gap-4 mb-4 sm:mb-6">
            <div>
              <p className="text-xs text-glow uppercase tracking-[0.15em] mb-1 flex items-center gap-2">
                <Activity className="h-3 w-3" /> Estado Operativo
              </p>
              <h1 className="text-xl sm:text-2xl font-bold uppercase tracking-[0.2em] text-light">
                Supreme Dashboard
              </h1>
              <p className="mt-1 text-sm text-dim uppercase tracking-[0.1em]">
                Vista global del ecosistema
              </p>
            </div>
            <button
              onClick={() => { setLoading(true); load(); }}
              disabled={loading}
              className="shrink-0 flex items-center gap-2 border border-wire hover:border-glow px-3 py-2 rounded text-sm font-bold uppercase text-dim hover:text-light transition-colors disabled:opacity-50"
            >
              Refrescar
            </button>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mt-4">
            <StatCard label="MRR Proyectado" value={fmtCurrency(stats.mrr)} icon={DollarSign} trend="+12% VS MES PASADO" />
            <StatCard label="Cadenas Inquilinas" value={stats.chains} icon={Building} />
            <StatCard label="Zonas Activas" value={stats.zones} icon={Map} />
            <StatCard label="Restaurantes Totales" value={stats.restaurants} icon={LayoutGrid} trend="USO GENERAL" />
          </div>
        </div>
      </div>

      {/* Chains list */}
      <div className="p-6">
        <h2 className="text-xs font-bold uppercase tracking-[0.2em] text-dim mb-4 flex items-center gap-2">
          <Building className="h-3.5 w-3.5" />
          Cadenas Registradas (Tenants)
        </h2>

        <div className="border border-wire rounded-lg overflow-hidden bg-white/[0.01]">
          {chains.length === 0 ? (
            <div className="p-8 text-center text-dim text-sm uppercase tracking-widest">
              Sin cadenas
            </div>
          ) : (
            <div className="divide-y divide-wire/20">
              {chains.map((c, i) => (
                <div
                  key={c.id}
                  className="grid grid-cols-1 sm:grid-cols-[1fr_auto_auto_auto] gap-2 sm:gap-4 px-4 py-4 items-center transition-colors hover:bg-white/[0.02]"
                >
                  {/* Name + id */}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[0.6rem] text-dim/50 font-mono tabular-nums w-4">
                        {i + 1}
                      </span>
                      <p className="text-sm font-semibold text-light uppercase tracking-wider">{c.name}</p>
                    </div>
                    <p className="text-[0.55rem] text-dim ml-6 font-mono tracking-widest mt-0.5">
                      Tenant ID: {c.id.split("-")[0]}
                    </p>
                  </div>

                  <div className="flex flex-col items-end sm:items-center">
                    <span className="text-[0.65rem] text-dim uppercase tracking-[0.1em] mb-1">Zonas</span>
                    <span className="text-sm font-medium text-light">{c.zonesCount}</span>
                  </div>

                  <div className="flex flex-col items-end sm:items-center sm:ml-4">
                    <span className="text-[0.65rem] text-dim uppercase tracking-[0.1em] mb-1">Sucursales</span>
                    <span className="text-sm font-medium text-light">{c.restaurantsCount}</span>
                  </div>

                  {/* MRR est de esta cadena */}
                  <div className="flex flex-col items-end sm:items-center sm:ml-6 min-w-[80px]">
                    <span className="text-[0.65rem] text-dim uppercase tracking-[0.1em] mb-1">MRR Est</span>
                    <span className="text-sm font-medium text-glow">{fmtCurrency(c.restaurantsCount * 199)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="mt-8 border border-glow/20 bg-glow/5 p-6 rounded-lg">
          <h3 className="text-lg font-bold text-glow mb-2 uppercase tracking-wide">Acciones del Sistema</h3>
          <p className="text-sm text-dim mb-4">
            Como usuario raíz, puedes emitir actualizaciones DDL globales, purgar cachés analíticas de inquilinos y aprovisionar hardware suplementario.
          </p>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsCreatingTenant(true)}
              className="flex items-center gap-2 px-4 py-2 bg-glow text-ink font-bold text-xs uppercase tracking-widest rounded hover:opacity-90 transition-opacity"
            >
              <Plus className="h-4 w-4" />
              Nuevo Inquilino
            </button>
            <button className="px-4 py-2 border border-wire text-light font-bold text-xs uppercase tracking-widest rounded hover:bg-white/[0.05] transition-colors">
              Recompilar Estadísticas
            </button>
          </div>
        </div>

      </div>

      {isCreatingTenant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" style={{ animation: "fade-in 0.2s ease-out both" }}>
          <div className="bg-ink border border-wire p-6 rounded-xl w-full max-w-md shadow-2xl" style={{ animation: "fade-in-up 0.3s ease-out both" }}>
            <h2 className="text-xl font-bold text-glow mb-2">Dar de Alta Nuevo Tenant</h2>
            <p className="text-sm text-dim mb-6">
              Ingresa el nombre corporativo de la nueva cadena. Se creará la base aislada (lógica) y se reflejará instantáneamente en el dashboard maestro.
            </p>
            
            <form onSubmit={handleCreateTenant}>
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-dim mb-2">
                  Nombre de la Cadena
                </label>
                <input 
                  type="text"
                  autoFocus
                  required
                  value={newTenantName}
                  onChange={(e) => setNewTenantName(e.target.value)}
                  className="w-full bg-black/50 border border-wire rounded px-4 py-3 text-light focus:outline-none focus:border-glow transition-colors placeholder:text-wire"
                  placeholder="Ej. Taquerías El Torito"
                />
              </div>

              <div className="flex justify-end gap-3">
                <button 
                  type="button" 
                  disabled={creating}
                  onClick={() => setIsCreatingTenant(false)}
                  className="px-4 py-2 text-dim text-sm font-bold uppercase tracking-wider hover:text-light transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={creating || !newTenantName.trim()}
                  className="px-6 py-2 bg-glow text-ink text-sm font-bold uppercase tracking-wider rounded hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                >
                  {creating ? "Creando..." : "Aprovisionar Cadena"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}