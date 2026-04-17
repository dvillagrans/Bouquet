"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus, RefreshCw, Search } from "lucide-react";
import { getAdminClientesList, type AdminClienteRow } from "@/actions/admin";
import { CreateTenantDialog } from "@/components/admin/CreateTenantDialog";
import { useMobileNav } from "@/components/dashboard/MobileNavContext";
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
  const { toggle } = useMobileNav();
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
            <span className="text-text-muted font-medium truncate">Tenants / Cadenas</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
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
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="flex h-8 items-center gap-1.5 rounded border border-gold bg-gold px-3 text-[11px] font-medium text-bg-solid transition-opacity hover:opacity-80 cursor-pointer whitespace-nowrap"
          >
            <Plus className="size-3.5 shrink-0" aria-hidden />
            <span className="hidden sm:inline">Nuevo tenant</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-8 pt-6 sm:pt-8 pb-12">
        <div className="mb-6 sm:mb-8">
          <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-2 font-medium">Directorio</div>
          <h1 className="font-serif text-[22px] sm:text-[28px] font-bold tracking-tight text-text-primary leading-[1.1]">
            Clientes <em className="not-italic font-normal text-gold italic">SaaS</em>
          </h1>
          <p className="text-[12px] text-text-dim mt-1.5 font-light max-w-xl">
            Cadenas registradas en la base de datos. Datos en vivo vía Prisma.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-[1px] bg-border-main border border-border-main rounded-lg overflow-hidden mb-6">
          <div className="bg-bg-card p-4 sm:p-5">
            <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-text-dim mb-1">Cadenas</div>
            <div className="font-serif text-[22px] sm:text-[26px] font-bold text-text-primary">{rows.length}</div>
          </div>
          <div className="bg-bg-card p-4 sm:p-5">
            <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-text-dim mb-1">Sucursales</div>
            <div className="font-serif text-[22px] sm:text-[26px] font-bold text-text-primary">{totals.branches}</div>
          </div>
          <div className="bg-bg-card p-4 sm:p-5 col-span-2 sm:col-span-1">
            <div className="text-[10px] font-medium tracking-[0.14em] uppercase text-text-dim mb-1">Zonas</div>
            <div className="font-serif text-[22px] sm:text-[26px] font-bold text-text-primary">{totals.zones}</div>
          </div>
        </div>

        <div className="relative mb-4">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 size-4 text-text-faint pointer-events-none" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar por nombre, admin, moneda o ID…"
            className="h-10 pl-11 bg-bg-card border-border-main text-[12px] text-text-primary placeholder:text-text-faint focus-visible:border-gold focus-visible:ring-gold/25"
            aria-label="Filtrar clientes"
          />
        </div>

        {loading && rows.length === 0 ? (
          <div className="text-text-dim text-sm py-10 opacity-70 font-light">Cargando clientes…</div>
        ) : (
          <>
            <div className="sm:hidden space-y-3">
              {filtered.length === 0 ? (
                <div className="rounded-lg border border-border-main bg-bg-card px-4 py-10 text-center text-xs text-text-dim">
                  {rows.length === 0 ? "Aún no hay cadenas en la base de datos." : "Ningún resultado para tu búsqueda."}
                </div>
              ) : (
                filtered.map((chain) => {
                  const avatar = chain.name.substring(0, 2).toUpperCase();
                  return (
                    <article
                      key={chain.id}
                      className="rounded-xl border border-border-main bg-bg-card px-4 py-4 shadow-[0_1px_0_rgba(255,255,255,0.02)]"
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-md bg-gold-faint border border-gold-dim flex items-center justify-center text-[11px] font-bold text-gold shrink-0">
                          {avatar}
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="truncate text-[13px] font-semibold text-text-primary leading-tight">{chain.name}</h3>
                          <p className="mt-1 text-[10px] uppercase tracking-[0.12em] text-text-dim">
                            {chain.currency} · alta {fmtDate(chain.createdAt)}
                          </p>
                          <p className="mt-2 text-[11px] text-text-muted">
                            {chain.zonesCount} zonas · {chain.restaurantsCount} sucursales
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <span className="inline-flex items-center rounded border border-[#1e3824] bg-dash-green-bg px-2 py-1 text-[10px] text-dash-green">
                              {chain.adminName}
                            </span>
                            <a
                              href={`/cadena?tenantId=${chain.id}`}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center justify-center rounded border border-border-mid px-3 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:bg-bg-hover hover:text-gold"
                            >
                              Consola →
                            </a>
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })
              )}
            </div>

            <div className="hidden sm:block bg-bg-card border border-border-main rounded-lg overflow-hidden">
              <div className="px-4 sm:px-5 py-3 border-b border-border-main bg-bg-bar text-[11px] font-medium tracking-[0.12em] uppercase text-text-muted">
                {filtered.length} de {rows.length} {rows.length === 1 ? "cadena" : "cadenas"}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-border-main bg-bg-solid/30">
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em]">Cadena</th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] hidden md:table-cell">
                        Moneda
                      </th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] hidden lg:table-cell">
                        Alta
                      </th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em]">Zonas</th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em]">Sucursales</th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] hidden sm:table-cell">
                        Admin
                      </th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em] hidden lg:table-cell">
                        PIN
                      </th>
                      <th className="font-normal text-[10px] text-text-dim px-4 sm:px-5 py-3 tracking-[0.06em]">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="align-middle [&>tr:last-child]:border-b-0">
                    {filtered.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-text-dim text-xs">
                          {rows.length === 0 ? "Aún no hay cadenas en la base de datos." : "Ningún resultado para tu búsqueda."}
                        </td>
                      </tr>
                    ) : (
                      filtered.map((chain) => {
                        const avatar = chain.name.substring(0, 2).toUpperCase();
                        return (
                          <tr key={chain.id} className="border-b border-border-main/40 hover:bg-bg-hover transition-colors">
                            <td className="px-4 sm:px-5 py-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-7 h-7 rounded-md bg-gold-faint border border-gold-dim flex items-center justify-center text-[9px] font-bold text-gold shrink-0">
                                  {avatar}
                                </div>
                                <div className="min-w-0">
                                  <div className="text-[12px] font-medium text-text-primary truncate">{chain.name}</div>
                                  <div className="text-[10px] text-text-faint font-mono truncate lg:hidden">{chain.id.slice(0, 8)}…</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 sm:px-5 py-3 text-[11px] text-text-muted hidden md:table-cell">
                              {chain.currency}
                            </td>
                            <td className="px-4 sm:px-5 py-3 text-[11px] text-text-muted hidden lg:table-cell">
                              {fmtDate(chain.createdAt)}
                            </td>
                            <td className="px-4 sm:px-5 py-3 text-[11px] font-mono text-text-secondary">{chain.zonesCount}</td>
                            <td className="px-4 sm:px-5 py-3 text-[11px] font-mono text-text-secondary">
                              {chain.restaurantsCount}
                            </td>
                            <td className="px-4 sm:px-5 py-3 hidden sm:table-cell">
                              <span className="text-[11px] text-dash-green bg-dash-green-bg px-2 py-0.5 rounded border border-[#1e3824]">
                                {chain.adminName}
                              </span>
                            </td>
                            <td className="px-4 sm:px-5 py-3 hidden lg:table-cell font-mono text-[11px] text-text-primary">
                              {chain.pin}
                            </td>
                            <td className="px-4 sm:px-5 py-3">
                              <a
                                href={`/cadena?tenantId=${chain.id}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex text-[11px] font-medium text-text-secondary hover:text-gold transition-colors border border-border-mid px-2.5 py-1 rounded hover:bg-bg-solid whitespace-nowrap"
                              >
                                Consola →
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

      <CreateTenantDialog open={createOpen} onOpenChange={setCreateOpen} onCreated={load} />
    </div>
  );
}
