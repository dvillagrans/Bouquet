"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw, Receipt, CreditCard, Activity, Box } from "lucide-react";
import { getAdminBillingOverview, type AdminBillingOverview } from "@/actions/admin";

function fmtUsd(n: number) {
  return (
    "$" +
    n.toLocaleString("en-US", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })
  );
}

export default function AdminBillingPage() {
  const [data, setData] = useState<AdminBillingOverview | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const res = await getAdminBillingOverview();
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, [load]);

  const s = data?.stats;
  const standalone = s?.standaloneRestaurants ?? 0;
  const P = data?.pricePerSeatUsdMonth ?? 199;

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-bg-solid text-base text-text-primary antialiased selection:bg-gold/30 lg:text-[14px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(183,146,93,0.12) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(183,146,93,0.06) 0%, transparent 40%)",
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
          <div className="flex items-center gap-2 text-[12px] font-medium text-text-dim">
            <span className="text-white">Bouquet OPS</span>
            <span className="text-white/20">/</span>
            <span className="tracking-wide">FACTURACIÓN SAAS</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          disabled={loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-transparent text-text-dim transition-colors hover:border-white/20 hover:text-white disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4"
        >
          <RefreshCw className={`size-4 shrink-0 text-emerald-400 ${loading ? "animate-spin" : ""}`} aria-hidden />
          <span className="hidden text-[12px] font-medium sm:inline">Actualizar</span>
        </button>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-10 sm:px-10 sm:pt-14">
        <header className="mb-12 max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold" /> Proyección Comercial
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl text-balance">
            Control de ingresos recurrentes.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-text-dim max-w-xl">
            Vista financiera de licencias operativas por sucursal ({fmtUsd(P)} USD/mes). Estos datos no se relacionan al flujo de facturación de comensales en restaurantes.
          </p>
        </header>

        <div className="rounded-2xl border border-gold/20 bg-gold/5 px-6 py-4 mb-10 shadow-[0_4px_24px_-8px_rgba(183,146,93,0.15)] flex gap-4 items-start">
          <Receipt className="size-5 text-gold shrink-0 mt-0.5" />
          <p className="text-[13px] text-white/80 leading-relaxed">
            Recordatorio: Los cobros que hacen los restaurantes a sus comensales con tarjeta son <span className="text-white font-medium">pagos operativos propios</span>. Esta consola únicamente refleja la cuota de licencia que pagarán las cadenas a Bouquet por el uso del software.
          </p>
        </div>

        {!data ? (
          <div className="space-y-6">
            <div className="h-[140px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
            <div className="h-[300px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
          </div>
        ) : (
          <div className="space-y-8">
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <article className="group overflow-hidden rounded-2xl border border-gold/30 bg-[linear-gradient(135deg,rgba(183,146,93,0.1),rgba(0,0,0,0))] p-6 shadow-[0_32px_64px_-16px_rgba(183,146,93,0.15)] transition-all duration-500 hover:-translate-y-1">
                <div className="flex items-center mb-4 text-text-dim gap-2">
                  <Activity className="size-4 text-gold" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">MRR Proyectado</p>
                </div>
                <p className="font-serif text-4xl sm:text-5xl font-semibold text-gold tabular-nums leading-none tracking-tight">
                  {fmtUsd(s!.projectedMrrUsd)}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
                  Ingreso mensual en USD
                </div>
              </article>
              
              <article className="overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/20">
                <div className="flex items-center mb-4 text-text-dim gap-2">
                  <CreditCard className="size-4 text-white" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white">ARR Referencia</p>
                </div>
                <p className="font-serif text-4xl sm:text-5xl font-semibold text-white tabular-nums leading-none tracking-tight">
                  {fmtUsd(s!.projectedArrUsd)}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
                  Proyección (MRR × 12)
                </div>
              </article>

              <article className="overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/20">
                <div className="flex items-center mb-4 text-text-dim gap-2">
                  <Box className="size-4 text-emerald-400" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Locales Activos</p>
                </div>
                <p className="font-serif text-4xl sm:text-5xl font-semibold text-white tabular-nums leading-none tracking-tight">
                  {s!.totalRestaurants}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
                  {s!.chainedRestaurants} en red / {standalone} solos
                </div>
              </article>

              <article className="overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/20">
                <div className="flex items-center mb-4 text-text-dim gap-2">
                  <Receipt className="size-4 text-white" />
                  <p className="text-[11px] font-semibold uppercase tracking-[0.2em]">Cuentas B2B</p>
                </div>
                <p className="font-serif text-4xl sm:text-5xl font-semibold text-white tabular-nums leading-none tracking-tight">
                  {s!.chains}
                </p>
                <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
                  Aglutinador de facturas
                </div>
              </article>
            </section>

            {standalone > 0 && (
              <div className="rounded-2xl border border-white/5 bg-white/[0.02] p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 backdrop-blur-sm">
                <div>
                  <h3 className="text-[15px] font-medium text-white">Ingresos por Locales Independientes</h3>
                  <p className="mt-1 text-[13px] text-text-dim max-w-lg">
                    Sucursales sin vinculación de cadena (facturación directa unitaria). Representan tickets individuales.
                  </p>
                </div>
                <div className="text-left sm:text-right shrink-0">
                  <p className="text-[11px] font-bold uppercase tracking-widest text-text-dim mb-1">Impacto Independiente MRR</p>
                  <p className="font-serif text-3xl font-semibold text-gold">{fmtUsd(standalone * P)}</p>
                </div>
              </div>
            )}

            <section className="rounded-2xl border border-white/5 bg-[#0a0a0a] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="border-b border-white/5 px-6 py-5 sm:px-8">
                <h2 className="text-base font-medium tracking-tight text-white">Contribución B2B (Mapeo por Cadena)</h2>
              </div>

              {/* MÓVIL */}
              <div className="sm:hidden divide-y divide-white/5">
                {data.chains.length === 0 ? (
                  <div className="px-6 py-16 text-center text-[14px] text-text-dim">No hay empresas B2B consolidadas.</div>
                ) : (
                  data.chains.map((row) => {
                    const avatar = row.name.substring(0, 1).toUpperCase();
                    return (
                      <article key={row.id} className="p-6 transition-colors hover:bg-white/[0.02]">
                        <div className="flex items-center justify-between gap-3">
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 text-[14px] font-serif text-white border border-white/10">
                              {avatar}
                            </div>
                            <div className="min-w-0">
                              <h3 className="truncate text-[14px] font-medium text-white">{row.name}</h3>
                              <p className="mt-0.5 text-[12px] font-mono text-text-dim">{row.restaurantsCount} locales · {row.currency}</p>
                            </div>
                          </div>
                          <div className="text-right shrink-0 pl-4 border-l border-white/10">
                            <p className="font-serif text-[18px] font-bold text-gold">{fmtUsd(row.projectedMrrUsd)}</p>
                            <p className="text-[10px] text-text-dim uppercase tracking-wider mt-0.5">Mensual</p>
                          </div>
                        </div>
                      </article>
                    );
                  })
                )}
              </div>

              {/* ESCRITORIO */}
              <div className="hidden w-full overflow-x-auto sm:block">
                <table className="w-full text-left font-sans">
                  <thead>
                    <tr className="border-b border-white/5 bg-transparent">
                      <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-text-dim">Entidad Comercial</th>
                      <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-text-dim hidden md:table-cell">Moneda</th>
                      <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-text-dim">Volumen (Locales)</th>
                      <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-text-dim text-gold">Aporte MRR</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle">
                    {data.chains.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-20 text-center text-[14px] text-text-dim">
                          Plataforma vacía. No hay ingresos consolidados de cadena.
                        </td>
                      </tr>
                    ) : (
                      data.chains.map((row) => {
                        const avatar = row.name.substring(0, 1).toUpperCase();
                        return (
                          <tr key={row.id} className="group border-b border-white/5 transition-colors hover:bg-white/[0.02] last:border-b-0">
                            <td className="px-8 py-5">
                              <div className="flex items-center gap-4">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[14px] font-serif text-white group-hover:border-gold/30 group-hover:text-gold transition-colors">
                                  {avatar}
                                </div>
                                <span className="text-[14px] font-medium text-white">{row.name}</span>
                              </div>
                            </td>
                            <td className="px-8 py-5 hidden md:table-cell">
                              <span className="font-mono text-[12px] text-text-dim uppercase tracking-wider">{row.currency}</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <span className="text-[13px] text-white tabular-nums">{row.restaurantsCount}</span>
                            </td>
                            <td className="px-8 py-5 text-right">
                              <span className="font-serif text-[16px] font-semibold text-gold tabular-nums tracking-tight">
                                {fmtUsd(row.projectedMrrUsd)}
                              </span>
                              <span className="text-[11px] text-text-dim ml-2 inline-block">/ mes</span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>

            <p className="text-[12px] text-text-dim max-w-2xl px-2">
              Validación contable: <span className="text-white/60">Encadenadas ({s!.chainedRestaurants}) + Independientes ({standalone}) = {s!.totalRestaurants} sucursales físicas reportando.</span>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
