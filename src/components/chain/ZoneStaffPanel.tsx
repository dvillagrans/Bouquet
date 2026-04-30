
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { createZoneStaffMember, getZoneStaff, setRestaurantAdminActive } from "@/actions/chain";
import type { RestaurantManagerRow, ZoneStaffData } from "@/actions/chain";
import ZoneAuthGuard from "./ZoneAuthGuard";

function fmtJoined(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

export default function ZoneStaffPanel({ initialZoneId }: { initialZoneId?: string }) {
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [data, setData] = useState<ZoneStaffData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async (zid: string) => {
    try {
      setLoading(true);
      const res = await getZoneStaff(zid);
      setData(res);
      if (res?.restaurants?.length && !restaurantId) {
        setRestaurantId(res.restaurants[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    if (!zoneId) return;
    load(zoneId);
    const iv = setInterval(() => load(zoneId), 60000);
    return () => clearInterval(iv);
  }, [zoneId, load]);

  const totals = useMemo(() => {
    const s = data?.staff ?? [];
    return {
      total: s.length,
      active: s.filter((x) => x.isActive).length,
    };
  }, [data?.staff]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId) return;
    setError("");
    setCreating(true);
    if (!restaurantId) { setError("Selecciona una sucursal."); setCreating(false); return; }
    const res = await createZoneStaffMember({ zoneId, name, restaurantId });
    setCreating(false);
    if (res.success) {
      setName("");
      load(zoneId);
    } else {
      setError(res.error || "No se pudo crear.");
    }
  };

  const toggle = async (uid: string, act: boolean) => {
    if (!zoneId) return;
    setTogglingId(uid);
    await setRestaurantAdminActive({ staffId: uid, isActive: act });
    setTogglingId(null);
    load(zoneId);
  };

  if (!zoneId) {
    return <ZoneAuthGuard zoneId={initialZoneId} onAuthenticated={(zid) => setZoneId(zid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-4 bg-bg-solid px-4 text-text-dim">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-700">
          <RefreshCw className="size-4 animate-spin text-gold" />
          <span className="text-[13px] font-medium tracking-wide text-text-dim">Cargando Staff...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg-solid animate-in fade-in duration-1000">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-white mb-2">Zona no encontrada</h2>
          <p className="text-[14px] text-text-dim">El panel de staff no localizó los recursos del nivel regional.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-[100dvh] flex flex-col overflow-hidden bg-[#0a0a0a] text-[14px] text-text-primary antialiased selection:bg-gold/30">
      <div
        className="pointer-events-none fixed inset-0 opacity-40 mix-blend-color-dodge animate-in fade-in duration-[2000ms]"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(183,146,93,0.1) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(68,114,160,0.05) 0%, transparent 50%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-1000 animate-in fade-in duration-[2000ms]"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
        aria-hidden
      />

      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/5 bg-[#0a0a0a]/80 px-6 backdrop-blur-2xl sm:px-10 animate-in slide-in-from-top-full fade-in duration-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[12px] font-medium text-text-dim uppercase tracking-wider">
            <span className="text-white">Bouquet OPS</span>
            <ChevronRight className="size-3 text-white/20" />
            <Link href={`/zona?zoneId=${zoneId}`} className="text-white/60 hover:text-white transition-colors">
              ZONAS
            </Link>
            <ChevronRight className="size-3 text-white/20" />
            <span className="text-gold tracking-widest">{data.zone.name}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => load(zoneId)}
          disabled={loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-transparent text-text-dim transition-colors hover:border-white/20 hover:text-white disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4"
        >
          <RefreshCw className={`size-4 shrink-0 ${loading ? "animate-spin text-gold" : ""}`} aria-hidden />
          <span className="hidden text-[12px] font-medium sm:inline">Refrescar</span>
        </button>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 pb-24 pt-10 md:px-10 md:pt-14 flex-1">
        <header 
          className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
          style={{ animationFillMode: "both", animationDelay: "150ms" }}
        >
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              <Users className="size-3.5" /> Staff Operativo
            </p>
            <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl text-balance">
              Personal de la <em className="not-italic text-gold">Zona</em>.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-text-dim">
              Gestión de administradores y cuentas locales. Alta rápida de gerentes ({data.restaurants.length} sucursales adscritas).
            </p>
          </div>
        </header>

        <div className="mb-14 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {/* STAT 1 */}
          <article 
            className="group overflow-hidden rounded-2xl border border-gold/30 bg-[linear-gradient(135deg,rgba(183,146,93,0.1),rgba(0,0,0,0))] p-6 shadow-[0_32px_64px_-16px_rgba(183,146,93,0.15)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_48px_80px_-16px_rgba(183,146,93,0.25)] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
            style={{ animationFillMode: "both", animationDelay: "300ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-dim">Comitivas Activas</p>
              <UserCheck className="size-4 text-gold group-hover:scale-110 transition-transform duration-500" />
            </div>
            <p className="font-serif text-4xl sm:text-5xl font-semibold text-gold tabular-nums leading-none tracking-tight">
              {totals.active}
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
              Personal con acceso al PIN
            </div>
          </article>
          {/* STAT 2 */}
          <article 
            className="group overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/20 hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
            style={{ animationFillMode: "both", animationDelay: "450ms" }}
          >
            <div className="flex items-center justify-between mb-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">Histórico Total</p>
              <Users className="size-4 text-white/50 group-hover:text-white group-hover:scale-110 transition-all duration-500" />
            </div>
            <p className="font-serif text-4xl sm:text-5xl font-semibold text-white tabular-nums leading-none tracking-tight">
              {totals.total}
            </p>
            <div className="mt-4 pt-4 border-t border-white/5 text-[12px] text-text-dim">
              Perfiles registrados en la zona
            </div>
          </article>
          {/* STAT 3 */}
          <article 
            className="hidden sm:block group overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] lg:col-span-2 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
            style={{ animationFillMode: "both", animationDelay: "600ms" }}
          >
            <div className="flex h-full flex-col justify-center">
              <p className="text-[13px] text-text-dim leading-relaxed">
                Los perfiles locales (Admin Local y Mesero) otorgan control total dentro de su respectiva unidad operativa. Utiliza el conmutador para revocar credenciales instantáneamente sin requerir que las sucursales detengan sus operaciones.
              </p>
            </div>
          </article>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 xl:gap-12 items-start">
          {/* NEW ROLE */}
          <aside 
            className="order-last lg:order-first lg:sticky lg:top-24 space-y-6 rounded-3xl border border-white/5 bg-[#0a0a0a] p-6 sm:p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out"
            style={{ animationFillMode: "both", animationDelay: "750ms" }}
          >
            <div className="space-y-4 border-b border-white/5 pb-6">
              <div className="flex size-12 items-center justify-center rounded-2xl bg-white/[0.03] border border-white/5">
                <ShieldCheck className="size-6 text-gold" />
              </div>
              <div>
                <h2 className="font-serif text-2xl font-medium tracking-tight text-white mb-2">Nuevo Gerente</h2>
                <p className="text-[13px] text-text-dim leading-relaxed">Alta y credenciales PIN para el administrador de una sucursal específica. Recibe control POS local.</p>
              </div>
            </div>

            <form onSubmit={submit} className="flex flex-col gap-6 pt-2">
              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Sucursal asignada</label>
                <div className="relative">
                  <select
                    required
                    value={restaurantId}
                    onChange={(e) => setRestaurantId(e.target.value)}
                    className="w-full appearance-none rounded-xl border border-white/10 bg-white/5 py-3.5 pl-4 pr-10 text-[14px] text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 focus:ring-1 focus:ring-gold/30"
                  >
                    {!restaurantId && <option value="">Selecciona...</option>}
                    {data.restaurants.map((r) => (
                      <option key={r.id} value={r.id} className="text-black">
                        {r.name}
                      </option>
                    ))}
                  </select>
                  <MapPin className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 size-4 text-white/30" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold uppercase tracking-widest text-text-dim">Nombre</label>
                <input
                  required
                  placeholder="Ej. Roberto Admin"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-[14px] text-white placeholder:text-text-dim outline-none transition-colors focus:border-gold/50 focus:bg-white/10 focus:ring-1 focus:ring-gold/30"
                />
              </div>

              {error ? (
                <div className="rounded-xl bg-red-500/10 p-3.5 border border-red-500/20 text-[13px] text-red-200">
                  {error}
                </div>
              ) : null}

              <button
                type="submit"
                disabled={creating || !name}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-4 text-[13px] font-bold uppercase tracking-wider text-gold transition-all hover:bg-gold hover:text-black hover:border-gold disabled:opacity-50 active:scale-[0.98] group"
              >
                {creating ? <RefreshCw className="size-4 animate-spin" /> : "Generar Perfil"}
              </button>
            </form>
          </aside>

          {/* LIST */}
          <section className="lg:col-span-2 space-y-6">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-dim flex items-center gap-2">
               Padrones Operativos <span className="h-px flex-1 bg-white/10 ml-2" />
            </h2>

            {data.restaurants.map((rest, restIdx) => {
              const staffForRest = data.staff.filter((s) => s.restaurantId === rest.id);
              if (!staffForRest.length) return null;

              return (
                <div 
                  key={rest.id} 
                  className="rounded-3xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] overflow-hidden shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-[30px] duration-1000 ease-out"
                  style={{ animationFillMode: "both", animationDelay: `${900 + (restIdx * 150)}ms` }}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/5 bg-white/[0.02] p-5 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 shadow-inner">
                        <MapPin className="size-5 text-gold" />
                      </div>
                      <h3 className="font-serif text-xl font-medium tracking-tight text-white">{rest.name}</h3>
                    </div>
                    <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-dim">
                      {staffForRest.length} perfiles
                    </span>
                  </div>

                  <div className="divide-y divide-white/5">
                    {staffForRest.map((m, usrIdx) => (
                      <div 
                        key={m.id} 
                        className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div className={`flex size-12 shrink-0 items-center justify-center rounded-2xl shadow-inner ${
                            m.isActive ? 'bg-gold/10 border border-gold/20' : 'bg-dash-error/10 border border-dash-error/20'
                          }`}>
                            {m.role === "ADMIN" ? (
                              <UserCog className={`size-5 ${m.isActive ? 'text-gold' : 'text-dash-error'}`} />
                            ) : (
                              <Users className={`size-5 ${m.isActive ? 'text-emerald-400' : 'text-dash-error'}`} />
                            )}
                          </div>
                          <div>
                            <div className="flex flex-wrap gap-2 items-center mb-1">
                              <p className="text-[16px] font-semibold text-white tracking-tight">{m.name}</p>
                              {m.role === "ADMIN" && (
                                <span className="inline-block rounded-full bg-gold px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider text-black">
                                  Gerente
                                </span>
                              )}
                            </div>
                            <p className="text-[12px] text-text-dim truncate">Alta: {fmtJoined(m.createdAt)}</p>
                          </div>
                        </div>

                        <div className="flex min-w-0 items-center gap-3 sm:min-w-[12rem] sm:justify-end">
                          <span
                            className={`inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-widest ${
                              m.isActive ? "text-emerald-400" : "text-dash-error"
                            }`}
                          >
                            <span className={`size-1.5 rounded-full ${m.isActive ? "bg-emerald-400 shadow-[0_0_8px_var(--color-emerald-400)]" : "bg-dash-error"}`} />
                            {m.isActive ? "Activo" : "Baja"}
                          </span>
                          <button
                            type="button"
                            onClick={() => toggle(m.id, !m.isActive)}
                            disabled={togglingId === m.id}
                            className="ml-auto inline-flex items-center justify-center rounded-xl border border-white/10 bg-white/5 p-2 transition-colors hover:border-white/20 hover:bg-white/10 disabled:opacity-50"
                            title={m.isActive ? "Desactivar perfil" : "Activar perfil"}
                          >
                            {togglingId === m.id ? (
                              <RefreshCw className="size-4 animate-spin text-white/50" />
                            ) : m.isActive ? (
                              <ShieldCheck className="size-4 text-emerald-400" />
                            ) : (
                              <RefreshCw className="size-4 text-gold hover:rotate-180 transition-transform duration-500" />
                            )}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </section>
        </div>
      </div>
    </div>
  );
}
