"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw, Layers, ShieldCheck, Zap } from "lucide-react";
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
    <article
      className={`group relative overflow-hidden rounded-2xl border transition-all duration-500 hover:-translate-y-1 ${
        featured 
          ? "border-gold/30 bg-[linear-gradient(135deg,rgba(183,146,93,0.1),rgba(0,0,0,0))] shadow-[0_32px_64px_-16px_rgba(183,146,93,0.15)]" 
          : "border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] hover:border-gold/20"
      } p-6 sm:p-8 ${className ?? ""}`}
    >
      <div className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-50" aria-hidden />
      {featured && (
        <div className="absolute top-0 right-0 p-6 opacity-20 transition-opacity duration-500 group-hover:opacity-40">
          <Zap className="size-16 text-gold" />
        </div>
      )}
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-text-dim mb-4">{label}</p>
      <p className="font-serif text-4xl font-semibold leading-none tracking-tight text-white tabular-nums sm:text-5xl">
        {value}
      </p>
      <div className="mt-6 flex flex-col gap-1.5">
        <p className="text-[13px] font-medium text-emerald-400 flex items-center gap-1.5">
          <ShieldCheck className="size-3.5" />
          {helper}
        </p>
        <p className="text-xs text-text-dim">{footnote}</p>
      </div>
    </article>
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
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-bg-solid text-base text-text-primary antialiased selection:bg-gold/30 lg:text-[14px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge"
        style={{
          background:
            "radial-gradient(circle at 10% 0%, rgba(183,146,93,0.15) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(183,146,93,0.1) 0%, transparent 50%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          opacity: 0.03,
          mixBlendMode: "overlay",
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
        <header className="mb-12 max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold" /> Visión Global
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl text-balance">
            Métricas de plataforma y consolas de clientes.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-text-dim max-w-xl">
            Centro de control SaaS. Supervisa el crecimiento del MRR, consolida cadenas B2B y administra cuentas sin interrupciones.
          </p>
        </header>

        {!data ? (
          <DashboardSkeleton />
        ) : (
          <div className="space-y-12">
            <section className="grid grid-cols-1 gap-5 lg:grid-cols-4 lg:grid-rows-2">
              <KpiCard
                className="lg:col-span-2 lg:row-span-2 flex flex-col justify-between"
                label="Ingreso Recurrente Mensual"
                value={fmtCurrency(data.stats.mrr)}
                helper="Cobranza 100% automatizada vía Stripe."
                footnote="MRR proyectado para el ciclo en curso en USD."
                featured
              />
              <KpiCard
                className="lg:col-span-1 lg:row-span-1"
                label="Cadenas B2B"
                value={data.stats.chains}
                helper="Tenants activos"
                footnote="Infraestructura aislada."
              />
              <KpiCard
                className="lg:col-span-1 lg:row-span-1"
                label="Sucursales"
                value={data.stats.restaurants}
                helper="Restaurantes operando"
                footnote="Locaciones individuales."
              />
              <KpiCard
                className="lg:col-span-2 lg:row-span-1"
                label="Cobertura de Zonas"
                value={data.stats.zones}
                helper="Mapeo regional"
                footnote="Ciudades físicas servidas."
              />
            </section>

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
                      <th className="px-8 py-4 text-[11px] font-bold uppercase tracking-widest text-text-dim">Security PIN</th>
                      <th className="px-8 py-4 text-right text-[11px] font-bold uppercase tracking-widest text-text-dim">Flujo</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle">
                    {data.chains.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-sm text-text-dim">
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
                            <td className="px-8 py-5 font-mono text-[13px] text-gold">{chain.pin}</td>
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
