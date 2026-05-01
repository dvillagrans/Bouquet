"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search, Building2, Map, Users } from "lucide-react";
import { getAdminClientesList, type AdminClienteRow } from "@/actions/admin";
import { CreateTenantDialog } from "@/components/admin/CreateTenantDialog";
import { Input } from "@/components/ui/input";

function fmtDate(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function AdminClientesPage() {
  const [rows, setRows] = useState<AdminClienteRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [createOpen, setCreateOpen] = useState(false);

  const load = useCallback(async () => {
    try {
      const list = await getAdminClientesList();
      setRows(list);
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

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const idShort = r.id.slice(0, 8).toLowerCase();
      return (
        r.name.toLowerCase().includes(q) ||
        r.adminName.toLowerCase().includes(q) ||
        r.currency.toLowerCase().includes(q) ||
        r.id.toLowerCase().includes(q) ||
        idShort.includes(q)
      );
    });
  }, [rows, query]);

  const totals = useMemo(() => {
    return rows.reduce(
      (acc, r) => {
        acc.zones += r.zonesCount;
        acc.branches += r.restaurantsCount;
        return acc;
      },
      { zones: 0, branches: 0 }
    );
  }, [rows]);

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-bg-solid text-base text-text-primary antialiased selection:bg-gold/30 lg:text-[14px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge"
        style={{
          background:
            "radial-gradient(circle at 100% 20%, rgba(183,146,93,0.08) 0%, transparent 40%), radial-gradient(circle at 0% 80%, rgba(183,146,93,0.05) 0%, transparent 40%)",
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
            <span className="tracking-wide">TENANTS & CADENAS</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-3">
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
          
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-white px-4 text-[12px] font-semibold text-black transition-all hover:bg-white/90 hover:scale-[0.98] active:scale-95 shadow-[0_0_20px_rgba(255,255,255,0.1)]"
          >
            <Plus className="size-4 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Nuevo Inquilino</span>
            <span className="sm:hidden">Añadir</span>
          </button>
        </div>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-6 pb-20 pt-10 sm:px-10 sm:pt-14">
        <header className="mb-12 max-w-3xl">
          <p className="mb-4 inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-gold lg:text-[11px]">
            <span className="h-px w-6 bg-gold" /> Directorio B2B
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl text-balance">
            Consolidado de clientes SaaS.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-text-dim max-w-xl">
            Catálogo operativo de inquilinos y sus configuraciones. Explora datos en vivo de sucursales activas en toda tu red.
          </p>
        </header>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-10">
          <article className="relative overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)]">
            <div className="flex items-center mb-4 text-text-dim gap-2">
              <Building2 className="size-4 text-gold" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] lg:text-[11px]">Cadenas Totales</p>
            </div>
            <p className="font-serif text-4xl font-semibold text-white tabular-nums">{rows.length}</p>
          </article>
          <article className="relative overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)]">
            <div className="flex items-center mb-4 text-text-dim gap-2">
              <Map className="size-4 text-gold" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] lg:text-[11px]">Sucursales</p>
            </div>
            <p className="font-serif text-4xl font-semibold text-white tabular-nums">{totals.branches}</p>
          </article>
          <article className="relative overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)]">
            <div className="flex items-center mb-4 text-text-dim gap-2">
              <Users className="size-4 text-gold" />
              <p className="text-xs font-semibold uppercase tracking-[0.2em] lg:text-[11px]">Zonas</p>
            </div>
            <p className="font-serif text-4xl font-semibold text-white tabular-nums">{totals.zones}</p>
          </article>
        </div>

        <div className="relative mb-6 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-text-dim transition-colors group-focus-within:text-gold pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar inquilino, ID, monedo o cuenta de administrador..."
            className="w-full h-14 pl-12 rounded-2xl bg-[#1A0F14] border border-white/10 text-base text-white placeholder:text-text-dim focus-visible:border-gold/50 focus-visible:ring-4 focus-visible:ring-gold/10 transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.5)] lg:text-[14px]"
            aria-label="Filtrar clientes"
          />
        </div>

        {loading && rows.length === 0 ? (
          <div className="h-[400px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
        ) : (
          <section className="rounded-2xl border border-white/5 bg-[#1A0F14] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
            {/* VISTA MÓVIL */}
            <div className="sm:hidden divide-y divide-white/5">
              {filtered.length === 0 ? (
                <div className="px-6 py-16 text-center text-base text-text-dim lg:text-[14px]">
                  {rows.length === 0 ? "Base de datos B2B plana. Registra a tu primer cliente." : "Sin correlación en la búsqueda."}
                </div>
              ) : (
                filtered.map((chain) => {
                  const avatar = chain.name.substring(0, 1).toUpperCase();
                  return (
                    <article key={chain.id} className="p-6 transition-colors hover:bg-white/[0.02]">
                      <div className="flex items-center gap-4">
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-white/5 text-lg font-serif text-white border border-white/10">
                          {avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-base font-medium text-white">{chain.name}</h3>
                          <p className="mt-0.5 font-mono text-sm uppercase tracking-wider text-text-dim lg:text-[12px]">{chain.currency}</p>
                        </div>
                      </div>

                      <div className="mt-5 grid grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-text-dim lg:text-[11px]">Red</p>
                          <p className="mt-1 text-sm text-white lg:text-[13px]">{chain.zonesCount} Zonas, {chain.restaurantsCount} Locales</p>
                        </div>
                        <div>
                          <p className="text-xs font-bold uppercase tracking-widest text-text-dim lg:text-[11px]">Admin</p>
                          <p className="mt-1 truncate text-sm text-emerald-400 lg:text-[13px]">{chain.adminName}</p>
                        </div>
                      </div>

                      <a
                        href={`/cadena?tenantId=${chain.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="mt-6 flex w-full items-center justify-center rounded-xl border border-white/10 bg-transparent px-4 py-2.5 text-[13px] font-medium text-white transition-all hover:bg-white hover:text-black active:scale-95"
                      >
                        Consola &rarr;
                      </a>
                    </article>
                  );
                })
              )}
            </div>

            {/* VISTA ESCRITORIO */}
            <div className="hidden w-full overflow-x-auto sm:block">
              <table className="w-full text-left font-sans">
                <thead>
                  <tr className="border-b border-white/5 bg-transparent">
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-text-dim">Cadena / Tenant</th>
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-text-dim hidden md:table-cell">Región</th>
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-text-dim">Volumen Operativo</th>
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-text-dim hidden lg:table-cell">Config</th>
                    <th className="px-8 py-5 text-[11px] font-bold uppercase tracking-widest text-text-dim">Dirección (Admin)</th>
                    <th className="px-8 py-5 text-right text-[11px] font-bold uppercase tracking-widest text-text-dim">Flujo</th>
                  </tr>
                </thead>
                <tbody className="align-middle">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-20 text-center text-sm text-text-dim">
                        {rows.length === 0 ? "Plataforma vacía. Inicia añadiendo la primera entidad." : "Ningún registro coincide con tu búsqueda."}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((chain) => {
                      const avatar = chain.name.substring(0, 1).toUpperCase();
                      return (
                        <tr
                          key={chain.id}
                          className="group border-b border-white/5 transition-colors hover:bg-white/[0.02] last:border-b-0"
                        >
                          <td className="px-8 py-5">
                            <div className="flex items-center gap-4">
                              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/5 border border-white/10 text-[14px] font-serif text-white group-hover:border-gold/30 group-hover:text-gold transition-colors">
                                {avatar}
                              </div>
                              <div>
                                <p className="text-[14px] font-medium text-white">{chain.name}</p>
                                <p className="mt-0.5 text-[11px] text-text-dim font-mono">ID: {chain.id.split("-")[0]}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-8 py-5 hidden md:table-cell">
                            <span className="font-mono text-[12px] text-text-dim uppercase tracking-wider">{chain.currency}</span>
                          </td>
                          <td className="px-8 py-5">
                            <div className="text-[13px] text-white tabular-nums">{chain.restaurantsCount} <span className="text-text-dim">sucursales</span></div>
                            <div className="text-[12px] text-text-dim tabular-nums mt-0.5">{chain.zonesCount} zonas activas</div>
                          </td>
                          <td className="px-8 py-5 hidden lg:table-cell">
                            <div className="text-[11px] text-text-dim mt-0.5">Alta: {fmtDate(chain.createdAt)}</div>
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
                              className="inline-block rounded-lg border border-white/10 px-4 py-2 text-[12px] font-medium text-text-dim transition-all hover:bg-white hover:text-black hover:scale-105 active:scale-95"
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
        )}
      </main>

      <CreateTenantDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={load} />
    </div>
  );
}
