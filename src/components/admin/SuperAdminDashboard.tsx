"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw, Layers, ShieldCheck, Zap, ArrowUpRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSuperAdminDashboard, type SuperAdminDashboardData } from "@/actions/admin";
import { CreateTenantDialog } from "@/components/admin/CreateTenantDialog";

type KpiCardProps = {
  label: string;
  value: string | number;
  helper: string;
  footnote: string;
  className?: string;
  featured?: boolean;
};

function KpiCard({ label, value, helper, footnote, className, featured }: KpiCardProps) {
  return (
    <motion.article
      variants={{
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
      }}
      className={`group relative overflow-hidden rounded-[2rem] border transition-all duration-700 hover:-translate-y-2 ${
        featured 
          ? "border-gold/40 bg-[linear-gradient(135deg,rgba(183,146,93,0.12),rgba(0,0,0,0))] shadow-[0_42px_80px_-20px_rgba(183,146,93,0.2)]" 
          : "border-white/10 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(255,255,255,0.01))] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.6)] hover:border-gold/30"
      } p-8 sm:p-10 ${className ?? ""}`}
    >
      {/* Refined top glow line */}
      <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent opacity-0 transition-opacity duration-700 group-hover:opacity-100" aria-hidden />
      
      {featured && (
        <div className="absolute -top-10 -right-10 p-6 opacity-[0.03] transition-all duration-1000 group-hover:opacity-10 group-hover:scale-110">
          <Zap className="size-48 text-gold" />
        </div>
      )}
      
      <div className="relative z-10">
        <header className="flex items-center justify-between mb-6">
          <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gold/60">{label}</p>
          <ArrowUpRight className="size-4 text-text-dim opacity-0 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </header>
        
        <p className="font-serif text-5xl font-medium leading-none tracking-tight text-white tabular-nums sm:text-6xl lg:text-7xl">
          {value}
        </p>
        
        <div className="mt-8 space-y-2">
          <p className="text-[14px] font-medium text-emerald-400/90 flex items-center gap-2">
            <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            {helper}
          </p>
          <p className="text-[12px] font-medium text-text-dim/60 leading-relaxed">{footnote}</p>
        </div>
      </div>
    </motion.article>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-4 lg:grid-rows-2">
        <div className="lg:col-span-2 lg:row-span-2 h-[280px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-[130px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
        ))}
      </div>
      <div className="h-[400px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
    </div>
  );
}

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
    <div className="relative flex min-h-screen flex-col bg-bg-solid text-base text-text-primary antialiased selection:bg-gold/30 lg:text-[14px]">
      {/* Atmospheric Background Layers */}
      <div
        className="pointer-events-none absolute inset-0 opacity-60 mix-blend-soft-light"
        style={{
          background: `
            radial-gradient(circle at 15% 0%, rgba(183,146,93,0.2) 0%, transparent 45%),
            radial-gradient(circle at 85% 90%, rgba(183,146,93,0.15) 0%, transparent 40%),
            radial-gradient(circle at 50% 50%, rgba(0,0,0,0) 0%, rgba(0,0,0,0.4) 100%)
          `,
        }}
        aria-hidden
      />
      <motion.div
        animate={{ 
          opacity: [0.03, 0.05, 0.03],
          scale: [1, 1.02, 1]
        }}
        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
        className="pointer-events-none absolute inset-0 mix-blend-overlay"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          opacity: 0.04,
        }}
        aria-hidden
      />

      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/5 bg-bg-solid/80 px-6 backdrop-blur-2xl sm:px-10">
        <div className="flex items-center gap-3">
          <Layers className="size-4 text-gold" />
          <div className="flex items-center gap-2 text-[12px] font-medium text-text-dim">
            <span className="text-white">Bouquet OPS</span>
            <span className="text-white/20">/</span>
            <span className="tracking-wide">CONSOLA MAESTRA</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          <div
            className={
              loading
                ? "hidden items-center gap-2 rounded-full bg-gold/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-gold sm:flex"
                : "hidden items-center gap-2 rounded-full bg-emerald-500/10 px-3 py-1.5 text-[10px] font-bold uppercase tracking-widest text-emerald-400 sm:flex"
            }
          >
            <span className="relative flex size-1.5">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-current opacity-75" />
              <span className="relative inline-flex size-1.5 rounded-full bg-current" />
            </span>
            {loading ? "Sincronizando" : "Operativo"}
          </div>

          <div className="h-4 w-px bg-white/10 hidden sm:block" />

          <button
            onClick={() => {
              setLoading(true);
              load();
            }}
            disabled={loading}
            className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-transparent text-text-dim transition-colors hover:border-white/20 hover:text-white disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4"
          >
            <RefreshCw className={`size-4 shrink-0 col text-emerald-400 ${loading ? "animate-spin" : ""}`} aria-hidden />
            <span className="hidden text-[12px] font-medium sm:inline">Actualizar</span>
          </button>
          
          <button
            onClick={() => setIsCreatingTenant(true)}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-4 text-[12px] font-semibold text-black transition-all hover:bg-white/90 hover:scale-[0.98] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Añadir Inquilino</span>
            <span className="sm:hidden">Añadir</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-10 sm:px-10 sm:pt-14">
        <motion.header 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-4xl"
        >
          <p className="mb-6 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.4em] text-gold/80">
            <span className="h-[2px] w-8 bg-gold" /> Visión Global Operativa
          </p>
          <h1 className="font-serif text-5xl font-medium leading-[1] tracking-[-0.03em] text-white sm:text-7xl lg:text-8xl text-balance">
            Bouquet <span className="italic font-light text-gold/90">Ops</span> Control Center.
          </h1>
          <div className="mt-8 h-px w-full bg-gradient-to-r from-white/10 via-white/5 to-transparent" />
          <p className="mt-8 text-[17px] leading-relaxed text-text-dim/80 max-w-2xl font-medium">
            La capa de mando para el ecosistema Bouquet. Supervisa el crecimiento del MRR, consolida arquitecturas B2B multizona y administra flujos de tesorería sin fricciones.
          </p>
        </motion.header>

        {!data ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-12">
            <motion.section 
              initial="hidden"
              animate="show"
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: { staggerChildren: 0.12, delayChildren: 0.4 }
                }
              }}
              className="grid grid-cols-1 gap-6 lg:grid-cols-4 lg:grid-rows-2"
            >
              <KpiCard
                className="lg:col-span-2 lg:row-span-2 flex flex-col justify-between"
                label="Ingreso Recurrente Mensual"
                value={fmtCurrency(data.stats.mrr)}
                helper="Cobranza 100% automatizada vía Stripe."
                footnote="MRR proyectado para el ciclo en curso en USD (Global Portfolio)."
                featured
              />
              <KpiCard
                className="lg:col-span-1 lg:row-span-1"
                label="Cadenas B2B"
                value={data.stats.chains}
                helper="Tenants activos"
                footnote="Instancias en nube privada Bouquet."
              />
              <KpiCard
                className="lg:col-span-1 lg:row-span-1"
                label="Sucursales"
                value={data.stats.restaurants}
                helper="Nodos operativos"
                footnote="Terminales activas en tiempo real."
              />
              <KpiCard
                className="lg:col-span-2 lg:row-span-1"
                label="Alcance Regional"
                value={data.stats.zones}
                helper="Zonas servidas"
                footnote="Densidad geográfica de la plataforma."
              />
            </motion.section>

            <section className="rounded-2xl border border-white/5 bg-[#0a0a0a] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">
              <div className="flex items-center justify-between border-b border-white/5 px-6 py-5 sm:px-8">
                <div>
                  <h2 className="text-base font-medium tracking-tight text-white">Inquilinos Activos</h2>
                  <p className="mt-1 text-[13px] text-text-dim">Acceso y administración por cuenta B2B</p>
                </div>
              </div>

              <div className="sm:hidden divide-y divide-white/5">
                {data.chains.length === 0 ? (
                  <div className="px-6 py-16 text-center text-[14px] text-text-dim">Base de datos plana. Añade el primer cliente para continuar.</div>
                ) : (
                  data.chains.map((chain) => {
                    const avatar = chain.name.substring(0, 1).toUpperCase();
                    return (
                      <article key={chain.id} className="p-6 transition-colors hover:bg-white/[0.02]">
                        <div className="flex items-center gap-4">
                          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 text-lg font-serif text-white border border-white/10">
                            {avatar}
                          </div>
                          <div className="min-w-0 flex-1">
                            <h3 className="truncate text-base font-medium text-white">{chain.name}</h3>
                            <p className="mt-0.5 text-[12px] font-mono text-text-dim">ID: {chain.id.split("-")[0]}</p>
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Sucursales</p>
                            <p className="mt-1 text-[15px] font-mono text-white">{chain.restaurantsCount}</p>
                          </div>
                          <div>
                            <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Admin</p>
                            <p className="mt-1 text-[13px] text-white truncate">{chain.adminName}</p>
                          </div>
                        </div>

                        <a
                          href={`/cadena?tenantId=${chain.id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="mt-6 flex w-full items-center justify-center rounded-xl bg-white/5 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-white/10"
                        >
                          Acceder a consola
                        </a>
                      </article>
                    );
                  })
                )}
              </div>

              <div className="hidden w-full overflow-x-auto sm:block">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="border-b border-white/5 bg-transparent">
                      <th className="w-16 px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-text-dim">#</th>
                      <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-text-dim">Entidad B2B</th>
                      <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-text-dim">Token / ID</th>
                      <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-text-dim">Administrador</th>
                      <th className="px-8 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-text-dim">Flujo</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle">
                    {data.chains.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-20 text-center text-sm text-text-dim">
                          Plataforma vacía. Inicia añadiendo la primera entidad.
                        </td>
                      </tr>
                    ) : (
                      data.chains.map((chain, i) => {
                        const avatar = chain.name.substring(0, 1).toUpperCase();
                        return (
                          <tr
                            key={chain.id}
                            className="group border-b border-white/5 transition-colors hover:bg-white/[0.02]"
                          >
                            <td className="px-8 py-5 text-[13px] text-text-dim">
                              {(i + 1).toString().padStart(2, "0")}
                            </td>
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[14px] font-serif text-white">
                                  {avatar}
                                </div>
                                <div>
                                  <p className="text-[14px] font-medium text-white">{chain.name}</p>
                                  <p className="mt-0.5 text-[12px] text-text-dim">{chain.restaurantsCount} sucursales físicas</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-5">
                              <span className="font-mono text-[12px] text-text-dim bg-white/5 px-2 py-1 rounded">
                                {chain.id.split("-")[0]}
                              </span>
                            </td>
                            <td className="px-8 py-5">
                              <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-2.5 py-1 text-[12px] font-medium text-emerald-400">
                                <div className="size-1.5 rounded-full bg-emerald-400" />
                                {chain.adminName}
                              </span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <a
                                href={`/cadena?tenantId=${chain.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-block rounded-lg px-4 py-2 text-[12px] font-medium text-text-dim transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95"
                              >
                                Entrar &rarr;
                              </a>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        )}
      </main>

      <CreateTenantDialog
        open={isCreatingTenant}
        onOpenChange={setIsCreatingTenant}
        onCreated={load}
      />
    </div>
  );
}
