"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  KeyRound,
  MapPin,
  RefreshCw,
  ShieldCheck,
  UserCheck,
  UserCog,
  Users,
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
  const [pin, setPin] = useState("");
  const [restaurantId, setRestaurantId] = useState("");
  const [error, setError] = useState("");
  const reduceMotion = useReducedMotion();

  const load = useCallback(async (zid: string) => {
    try {
      setLoading(true);
      const res = await getZoneStaff(zid);
      setData(res);
      if (res?.restaurants?.length && !restaurantId) {
        setRestaurantId(res.restaurants[0].id);
      }
      if (res?.restaurants?.length && !restaurantId) {
        setRestaurantId(res.restaurants[0].id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

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
    const res = await createZoneStaffMember({ zoneId, name, pin, restaurantId });
    setCreating(false);
    if (res.success) {
      setName("");
      setPin("");
      await load(zoneId);
    } else {
      setError(res.error);
    }
  };

  const toggle = async (row: RestaurantManagerRow) => {
    if (!data?.zone) return;
    setTogglingId(row.id);
    const res = await setRestaurantAdminActive({
      staffId: row.id,
      isActive: !row.isActive,
    });
    setTogglingId(null);
    if (res.success && zoneId) await load(zoneId);
  };

  if (!zoneId) {
    return <ZoneAuthGuard zoneId={initialZoneId} onAuthenticated={(zid) => setZoneId(zid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-bg-solid px-4 text-text-dim">
        <motion.div
          animate={reduceMotion ? {} : { scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="text-gold/35"
          aria-hidden
        >
          <Users className="size-12" strokeWidth={1} />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[0.22em]">Cargando staff zonal…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-solid p-8 text-center text-[13px] text-dash-red">
        Esta zona no existe o fue eliminada.
      </div>
    );
  }

  const staff = data.staff;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-solid font-sans text-text-primary">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-0 top-0 h-[min(80vh,600px)] w-[min(100vw,720px)] rounded-full bg-[radial-gradient(ellipse_at_top_right,rgba(201,160,84,0.12),transparent_55%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[45vh] w-[60vw] rounded-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(77,132,96,0.08),transparent_58%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-border-bright) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-10 md:px-8 md:pt-14">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/zona"
                className="inline-flex items-center gap-2 rounded-full border border-border-main bg-bg-card/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted transition-colors hover:border-gold/30 hover:text-gold"
              >
                <ArrowLeft className="size-3" aria-hidden />
                Panel de zona
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-mid bg-bg-solid/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-text-dim">
                <MapPin className="size-3" aria-hidden />
                {data.zone.name}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dash-green/25 bg-dash-green-bg/35 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-dash-green">
                <ShieldCheck className="size-3" aria-hidden />
                Personal zonal
              </span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-faint">Accesos · nivel 2</p>
              <h1 className="mt-2 font-serif text-[clamp(1.85rem,4.5vw,3rem)] font-semibold leading-[1.06] tracking-tight">
                Staff de <span className="text-gold">{data.zone.name}</span>
              </h1>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-text-muted">
                Aquí administras identidades para operar esta zona. Los PIN no se muestran, solo se registran al crear.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => load(zoneId)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border-bright bg-bg-card px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary transition-colors hover:border-gold/35 hover:text-gold disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
            {loading ? "Sincronizando" : "Refrescar"}
          </button>
        </motion.header>

        <div className="mb-10 grid gap-4 sm:grid-cols-2">
          <div className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm">
            <Users className="absolute right-3 top-3 size-12 text-gold/10" aria-hidden />
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Personas</p>
            <p className="mt-2 font-serif text-2xl text-text-primary">{totals.total}</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm">
            <UserCheck className="absolute right-3 top-3 size-12 text-gold/10" aria-hidden />
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Accesos activos</p>
            <p className="mt-2 font-serif text-2xl text-text-primary">
              {totals.active}/{totals.total}
            </p>
          </div>
        </div>

        <section className="mb-10 space-y-4 rounded-2xl border border-border-main bg-bg-card/35 p-6 backdrop-blur-md">
          <div className="flex items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg text-text-primary">Alta de miembro</h2>
              <p className="mt-1 text-[12px] text-text-dim">Crea un gerente/supervisor para esta zona.</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-faint">
              <KeyRound className="size-3" aria-hidden />
              PIN solo en este formulario
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                  Sucursal a la que asignas
                </label>
                <select
                  value={restaurantId}
                  onChange={(e) => {
                    setRestaurantId(e.target.value);
                    setError("");
                  }}
                  required
                  className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 text-[13px] text-text-primary outline-none transition-colors focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
                >
                  <option value="" disabled>Selecciona sucursal...</option>
                  {(data?.restaurants ?? []).map((r) => (
                    <option key={r.id} value={r.id}>{r.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                  Nombre completo
                </label>
                <input
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  required
                  placeholder="Ej. Juan Pérez"
                  className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 text-[13px] text-text-primary outline-none transition-colors placeholder:text-text-faint focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                  PIN
                </label>
                <input
                  type="password"
                  inputMode="numeric"
                  autoComplete="new-password"
                  value={pin}
                  onChange={(e) => {
                    setPin(e.target.value);
                    setError("");
                  }}
                  required
                  minLength={4}
                  placeholder="Ej. 7890"
                  className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 font-mono text-[14px] tracking-[0.2em] text-text-primary outline-none placeholder:text-text-faint placeholder:tracking-normal focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
                />
              </div>
            </div>

            {error ? <p className="text-[12px] text-dash-red">{error}</p> : null}

            <button
              type="submit"
              disabled={creating || !name.trim() || !pin.trim()}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/45 bg-gold-faint/45 px-6 py-2.5 text-[12px] font-semibold text-gold transition-colors hover:bg-gold-faint/75 disabled:opacity-45"
            >
              {creating ? <span className="size-3.5 animate-spin rounded-full border-2 border-gold border-t-transparent" /> : null}
              {creating ? "Registrando…" : "Registrar miembro"}
            </button>
          </form>
        </section>

        <section className="space-y-4">
          <div className="flex items-end justify-between gap-4 border-b border-border-main pb-4">
            <div>
              <h2 className="font-serif text-xl text-text-primary">Roster de zona</h2>
              <p className="mt-1 text-[12px] text-text-dim">Ordenado por activos primero, luego nombre.</p>
            </div>
          </div>

          {staff.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-bright/55 bg-bg-card/25 p-10 text-center">
              <Users className="mx-auto size-10 text-gold/25" aria-hidden />
              <p className="mt-4 font-serif text-lg text-text-secondary">Aún no hay staff registrado.</p>
              <p className="mx-auto mt-2 max-w-md text-[13px] text-text-dim">
                Crea el primer miembro para habilitar accesos por PIN.
              </p>
            </div>
          ) : (
            <ul className="flex list-none flex-col gap-4 p-0">
              {staff.map((row) => (
                <li key={row.id} className="rounded-2xl border border-border-main bg-bg-card/35 p-5">
                  <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div className="min-w-0">
                      <p className="font-serif text-lg text-text-primary">{row.name}</p>
                      <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
                        Alta {fmtJoined(row.createdAt)} · ID {row.id.slice(0, 8)}…
                      </p>
                      <p className="mt-2 text-[12px] text-text-dim">Sucursal Asignada: <span className="font-semibold text-text-primary">{row.restaurantName}</span></p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.12em] ${
                          row.isActive ? "bg-dash-green-bg text-dash-green" : "bg-dash-red-bg text-dash-red"
                        }`}
                      >
                        {row.isActive ? "Activo" : "Inactivo"}
                      </span>
                      <button
                        type="button"
                        disabled={togglingId === row.id}
                        onClick={() => toggle(row)}
                        className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-bright bg-bg-hover px-4 py-2 text-[11px] font-semibold text-text-secondary transition-colors hover:border-gold/35 hover:text-gold disabled:opacity-50"
                      >
                        <UserCog className="size-4" aria-hidden />
                        {togglingId === row.id ? "…" : row.isActive ? "Desactivar" : "Reactivar"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}

