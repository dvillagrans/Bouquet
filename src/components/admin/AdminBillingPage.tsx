"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getAdminBillingOverview, type AdminBillingOverview } from "@/actions/admin";
import { useMobileNav } from "@/components/dashboard/MobileNavContext";

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
  const { toggle } = useMobileNav();
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
    <div className="flex flex-col flex-1 min-h-screen bg-bg-solid text-text-primary text-[13px] antialiased">
      <div className="h-[52px] sticky top-0 z-10 shrink-0 border-b border-border-main bg-bg-bar/90 backdrop-blur-md flex items-center justify-between px-3 sm:px-8 gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
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
          <div className="hidden sm:flex text-[11px] text-text-dim items-center gap-[6px] min-w-0">
            Bouquet OPS <span className="text-text-void shrink-0">›</span>
            <span className="text-text-muted font-medium truncate">Facturación SaaS</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            setLoading(true);
            load();
          }}
          disabled={loading}
          title="Refrescar"
          className="flex h-8 w-8 sm:w-auto sm:px-3 items-center justify-center sm:gap-1.5 rounded border border-border-main bg-transparent text-[11px] font-medium text-text-muted transition-colors hover:border-border-bright hover:text-text-secondary disabled:opacity-50 cursor-pointer"
        >
          <RefreshCw className={`size-3.5 shrink-0 ${loading ? "animate-spin" : ""}`} aria-hidden />
          <span className="hidden sm:inline">Refrescar</span>
        </button>
      </div>

      <div className="flex-1 px-4 sm:px-8 pt-6 sm:pt-8 pb-12">
        <div className="mb-6 sm:mb-8">
          <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 font-medium">Ingresos proyectados</div>
          <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-text-primary leading-[1.1]">
            Facturación <em className="not-italic font-normal text-gold italic">SaaS</em>
          </h1>
          <p className="text-[12px] text-text-dim mt-1.5 font-light max-w-2xl">
            Proyección desde sucursales en base de datos y tarifa de referencia ({fmtUsd(P)} USD / sucursal / mes). No
            está conectado a Stripe ni a facturas reales.
          </p>
        </div>

        <div className="rounded-lg border border-gold-dim/40 bg-gold-faint/30 px-4 py-3 mb-6 text-[11px] text-text-muted leading-relaxed">
          Los pagos de comensales en mesa (<span className="font-mono text-text-secondary">Payment</span>) son flujo
          operativo del restaurante; esta pantalla solo resume el modelo de licencia Bouquet por sucursal.
        </div>

        {!data ? (
          <div className="text-text-dim text-sm py-10 opacity-70 font-light">
            {loading ? "Cargando proyección…" : "No se pudo cargar la vista."}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-[1px] bg-border-main border border-border-main rounded-lg overflow-hidden mb-6">
              <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-text-dim mb-2 sm:mb-3">
                  MRR proyectado
                </div>
                <div className="font-serif text-[22px] sm:text-[30px] font-bold text-gold leading-none mb-1 tracking-tight">
                  {fmtUsd(s!.projectedMrrUsd)}
                </div>
                <div className="text-[10px] text-text-faint">USD · mensual</div>
              </div>
              <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-text-dim mb-2 sm:mb-3">
                  ARR referencia
                </div>
                <div className="font-serif text-[22px] sm:text-[30px] font-bold text-text-primary leading-none mb-1 tracking-tight">
                  {fmtUsd(s!.projectedArrUsd)}
                </div>
                <div className="text-[10px] text-text-faint">MRR × 12</div>
              </div>
              <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-text-dim mb-2 sm:mb-3">
                  Sucursales
                </div>
                <div className="font-serif text-[22px] sm:text-[30px] font-bold text-text-primary leading-none mb-1 tracking-tight">
                  {s!.totalRestaurants}
                </div>
                <div className="text-[10px] text-text-faint">
                  {s!.chainedRestaurants} en cadena · {standalone} independientes
                </div>
              </div>
              <div className="bg-bg-card p-4 sm:p-6 sm:pb-5 hover:bg-bg-hover transition-colors">
                <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-text-dim mb-2 sm:mb-3">
                  Cadenas
                </div>
                <div className="font-serif text-[22px] sm:text-[30px] font-bold text-text-primary leading-none mb-1 tracking-tight">
                  {s!.chains}
                </div>
                <div className="text-[10px] text-text-faint">Tenants con facturación agregada</div>
              </div>
            </div>

            {standalone > 0 && (
              <div className="mb-6 rounded-lg border border-border-main bg-bg-card px-4 py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>
                  <div className="text-[11px] font-medium text-text-primary">Restaurantes independientes</div>
                  <div className="text-[10px] text-text-dim mt-0.5">
                    Sin <span className="font-mono">chainId</span> vía zona — se facturan igual en el modelo por
                    sucursal.
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] uppercase tracking-[0.12em] text-text-dim">MRR atribuible</div>
                  <div className="font-serif text-lg font-semibold text-gold">{fmtUsd(standalone * P)}</div>
                  <div className="text-[10px] text-text-faint">
                    {standalone} × {fmtUsd(P)}
                  </div>
                </div>
              </div>
            )}

            <div className="bg-bg-card border border-border-main rounded-lg overflow-hidden mb-4">
              <div className="px-4 sm:px-5 py-3.5 border-b border-border-main bg-bg-bar">
                <div className="text-[11px] font-medium tracking-[0.12em] uppercase text-text-muted">
                  MRR por cadena (proyectado)
                </div>
              </div>

              <div className="sm:hidden divide-y divide-border-main">
                {data.chains.length === 0 ? (
                  <div className="px-4 py-10 text-center text-xs text-text-dim">No hay cadenas registradas.</div>
                ) : (
                  data.chains.map((row) => (
                    <div key={row.id} className="px-4 py-4">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="text-[13px] font-semibold text-text-primary truncate">{row.name}</div>
                          <div className="text-[10px] text-text-dim mt-1">
                            {row.restaurantsCount} sucursales · {row.currency}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="font-serif text-[15px] font-bold text-gold">{fmtUsd(row.projectedMrrUsd)}</div>
                          <div className="text-[10px] text-text-faint">USD / mes</div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>

              <div className="hidden sm:block overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main bg-bg-solid/30">
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em]">
                        Cadena
                      </th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] hidden md:table-cell">
                        Moneda tenant
                      </th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] text-right">
                        Sucursales
                      </th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] text-right">
                        MRR USD
                      </th>
                    </tr>
                  </thead>
                  <tbody className="align-middle [&>tr:last-child]:border-b-0">
                    {data.chains.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="text-center py-12 text-text-dim text-xs">
                          No hay cadenas registradas.
                        </td>
                      </tr>
                    ) : (
                      data.chains.map((row) => (
                        <tr key={row.id} className="border-b border-border-main/40 hover:bg-bg-hover transition-colors">
                          <td className="px-4 sm:px-5 py-3">
                            <div className="text-[12px] font-medium text-text-primary">{row.name}</div>
                            <div className="text-[10px] text-text-faint font-mono md:hidden mt-0.5">{row.currency}</div>
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-[11px] text-text-muted hidden md:table-cell">
                            {row.currency}
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-right font-mono text-[11px] text-text-secondary">
                            {row.restaurantsCount}
                          </td>
                          <td className="px-4 sm:px-5 py-3 text-right">
                            <span className="font-serif text-[14px] font-semibold text-gold">{fmtUsd(row.projectedMrrUsd)}</span>
                            <span className="text-[10px] text-text-faint ml-1.5 hidden lg:inline">/ mes</span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <p className="text-[10px] text-text-faint max-w-2xl">
              Suma de MRR por cadena más independientes coincide con el total global si cada sucursal pertenece a una
              zona de cadena o es independiente (
              <span className="font-mono text-text-dim">
                encadenadas {s!.chainedRestaurants} + independientes {standalone} = {s!.totalRestaurants}
              </span>
              ).
            </p>
          </>
        )}
      </div>
    </div>
  );
}
