"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowUpRight,
  CircleDot,
  Compass,
  MapPin,
  MapPinned,
  Orbit,
  Plus,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { getChainDashboard } from "@/actions/chain";
import type { ChainDashboardData, RestaurantSummary, ZoneSummary } from "@/actions/chain";
import { useShellChrome } from "@/components/dashboard/ShellChromeContext";
import ChainAuthGuard from "./ChainAuthGuard";
import CreateRestaurantDialog from "./CreateRestaurantDialog";

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function occupancyTone(pct: number) {
  if (pct >= 70) return "from-dash-green to-emerald-400/90";
  if (pct >= 40) return "from-gold to-amber-200/80";
  return "from-text-muted to-text-dim";
}

function OccupancyBar({ active, total, reduceMotion }: { active: number; total: number; reduceMotion: boolean | null }) {
  const pct = total > 0 ? (active / total) * 100 : 0;
  const tone = occupancyTone(pct);
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-[9px] uppercase tracking-[0.14em] text-text-faint">
        <span>Ocupación</span>
        <span className="font-mono tabular-nums text-text-muted">{pct.toFixed(0)}% · {active}/{total}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-bg-solid ring-1 ring-border-main">
        <motion.div
          className={`h-full w-full origin-left rounded-full bg-gradient-to-r ${tone}`}
          initial={reduceMotion ? false : { scaleX: 0 }}
          animate={{ scaleX: pct / 100 }}
          transition={{ duration: reduceMotion ? 0 : 0.9, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

function OccupancyDial({ pct, reduceMotion }: { pct: number; reduceMotion: boolean | null }) {
  const p = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative size-48 shrink-0 sm:size-56">
      <motion.div
        className="absolute inset-0 rounded-full border border-border-main/70 bg-bg-solid/80 p-[3px] shadow-[inset_0_0_50px_rgba(0,0,0,0.55)]"
        initial={reduceMotion ? false : { rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="size-full rounded-full"
          style={{
            background: `conic-gradient(var(--color-gold) ${p * 3.6}deg, var(--color-border-mid) 0deg)`,
          }}
        />
      </motion.div>
      <div className="absolute inset-[14px] flex flex-col items-center justify-center rounded-full bg-bg-card/95 text-center shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-text-faint">Pulso de sala</p>
        <p className="mt-1 font-serif text-[44px] font-semibold leading-none tabular-nums text-gold">
          {p.toFixed(0)}
          <span className="ml-0.5 text-lg text-gold/70">%</span>
        </p>
        <p className="mt-1.5 font-mono text-[10px] text-text-dim">en tiempo real</p>
      </div>
      <div className="pointer-events-none absolute inset-[-18px] rounded-full border border-gold/10 [mask-image:radial-gradient(circle,transparent_60%,black_70%)]" aria-hidden />
    </div>
  );
}

function ZoneSharePill({ pct }: { pct: number }) {
  const p = Math.min(100, Math.max(0, pct));
  return (
    <div
      className="relative size-12 shrink-0 rounded-full border border-border-main/80 bg-bg-solid/70 p-[2px] shadow-[inset_0_0_14px_rgba(0,0,0,0.5)]"
      aria-hidden
    >
      <div
        className="size-full rounded-full"
        style={{ background: `conic-gradient(var(--color-gold) ${p * 3.6}deg, var(--color-border-mid) 0deg)` }}
      />
      <div className="absolute inset-[6px] flex items-center justify-center rounded-full bg-bg-card/95">
        <span className="font-mono text-[9px] font-semibold tabular-nums text-gold">{p.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function ZoneMiniCard({
  zone,
  index,
  sharePct,
  reduceMotion,
  tenantId,
}: {
  zone: ZoneSummary;
  index: number;
  sharePct: number;
  reduceMotion: boolean | null;
  tenantId: string;
}) {
  const occPct = zone.totalTables > 0 ? (zone.activeTables / zone.totalTables) * 100 : 0;
  const tone = occupancyTone(occPct);

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 320, damping: 30, delay: reduceMotion ? 0 : 0.04 * index }}
      className="group relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/60 p-5 backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-gold-dim/50 hover:shadow-[0_0_0_1px_rgba(201,160,84,0.12),0_28px_80px_-36px_rgba(201,160,84,0.08)]"
    >
      <div
        className="pointer-events-none absolute -right-12 -top-16 size-40 rounded-full bg-gradient-to-br from-gold/10 via-transparent to-transparent opacity-60 blur-2xl transition-opacity duration-500 group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-mid bg-bg-solid/80 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
            Territorio {String(index + 1).padStart(2, "0")}
          </span>
          <h3 className="mt-2 font-serif text-[18px] font-semibold leading-tight tracking-tight text-text-primary truncate">
            {zone.name}
          </h3>
          <p className="mt-0.5 text-[11px] text-text-dim font-light">
            {zone.restaurantCount} {zone.restaurantCount === 1 ? "sucursal" : "sucursales"} · {zone.totalTables} mesas
          </p>
        </div>
        <ZoneSharePill pct={sharePct} />
      </div>

      <div className="relative mt-4 space-y-3.5">
        <div className="flex items-end justify-between gap-3">
          <div>
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Ventas hoy</p>
            <p className="mt-0.5 font-serif text-xl font-semibold text-gold tabular-nums">{fmt(zone.totalRevenue)}</p>
          </div>
          <div className="text-right">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Pulso</p>
            <p className="mt-0.5 font-mono text-[13px] tabular-nums text-text-secondary">{occPct.toFixed(0)}%</p>
          </div>
        </div>

        <div className="h-1.5 overflow-hidden rounded-full bg-bg-solid ring-1 ring-border-main">
          <motion.div
            className={`h-full w-full origin-left rounded-full bg-gradient-to-r ${tone}`}
            initial={reduceMotion ? false : { scaleX: 0 }}
            animate={{ scaleX: occPct / 100 }}
            transition={{ duration: reduceMotion ? 0 : 0.9, delay: 0.08 * index, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>
      </div>

      <div className="relative mt-4 flex items-center justify-between gap-2 border-t border-border-main/60 pt-3">
        <Link
          href={`/zona?zoneId=${zone.id}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-[11px] font-medium text-gold/90 transition-colors hover:text-gold"
        >
          Consola
          <ArrowUpRight className="size-3" aria-hidden />
        </Link>
        <Link
          href={`/cadena/zonas?tenantId=${tenantId}#${zone.id}`}
          className="font-mono text-[10px] text-text-faint transition-colors hover:text-gold"
        >
          Ver en atlas →
        </Link>
      </div>
    </motion.article>
  );
}

function RestaurantRow({
  rest,
  reduceMotion,
  index,
}: {
  rest: RestaurantSummary;
  reduceMotion: boolean | null;
  index: number;
}) {
  const occPct = rest.totalTables > 0 ? (rest.activeTables / rest.totalTables) * 100 : 0;

  return (
    <motion.tr
      initial={reduceMotion ? false : { opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.02 * index, duration: 0.35 }}
      className="group border-b border-border-main/40 transition-colors last:border-b-0 hover:bg-bg-hover/50"
    >
      <td className="px-5 py-3.5">
        <div className="font-medium text-[12.5px] text-text-primary group-hover:text-gold transition-colors">
          {rest.name}
        </div>
        <div className="truncate max-w-[220px] text-[10px] font-light text-text-faint">
          {rest.address || "Sin dirección registrada"}
        </div>
      </td>
      <td className="px-5 py-3.5">
        {rest.zoneName ? (
          <span className="inline-flex items-center gap-1.5 rounded-md border border-border-mid bg-bg-solid/80 px-2 py-1 font-mono text-[10px] text-text-muted">
            <MapPinned className="size-2.5 text-gold/70" aria-hidden />
            {rest.zoneName}
          </span>
        ) : (
          <span className="text-[10px] italic text-text-faint">Independiente</span>
        )}
      </td>
      <td className="px-5 py-3.5">
        <div className="font-serif text-[14px] font-medium tabular-nums tracking-tight text-gold">
          {fmt(rest.todayRevenue)}
        </div>
        <div className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.14em] text-text-faint">
          {rest.todaySessions} sesiones
        </div>
      </td>
      <td className="w-40 px-5 py-3.5">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between font-mono text-[9px] tabular-nums text-text-dim">
            <span>{rest.activeTables}/{rest.totalTables}</span>
            <span>{occPct.toFixed(0)}%</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-bg-solid ring-1 ring-border-main/70">
            <div
              className={`h-full rounded-full bg-gradient-to-r ${occupancyTone(occPct)}`}
              style={{ width: `${occPct}%` }}
            />
          </div>
        </div>
      </td>
      <td className="px-5 py-3.5 text-right">
        <span className="inline-flex items-center gap-1.5 font-mono text-[11px] tabular-nums text-text-secondary">
          <Users className="size-3 text-text-faint" aria-hidden />
          {rest.activeStaff}
        </span>
      </td>
    </motion.tr>
  );
}

function RestaurantCard({
  rest,
  reduceMotion,
  index,
}: {
  rest: RestaurantSummary;
  reduceMotion: boolean | null;
  index: number;
}) {
  return (
    <motion.article
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: reduceMotion ? 0 : 0.04 * index, duration: 0.4 }}
      className="rounded-xl border border-border-main bg-bg-card/60 p-4 backdrop-blur-sm"
    >
      <div className="mb-3 flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[13.5px] font-medium text-text-primary leading-tight">{rest.name}</h3>
          <p className="mt-0.5 truncate text-[10px] font-light text-text-faint">
            {rest.address || "Sin dirección registrada"}
          </p>
        </div>
        {rest.zoneName ? (
          <span className="shrink-0 rounded border border-border-mid bg-bg-solid/80 px-1.5 py-0.5 font-mono text-[9px] text-text-muted">
            {rest.zoneName}
          </span>
        ) : (
          <span className="shrink-0 text-[9px] italic text-text-faint">Indep.</span>
        )}
      </div>

      <div className="mb-3 grid grid-cols-3 gap-[1px] overflow-hidden rounded border border-border-main bg-border-main">
        <div className="bg-bg-solid/60 px-2 py-1.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-faint">Ventas</p>
          <p className="mt-0.5 font-serif text-[13px] font-medium tabular-nums tracking-tight text-gold">
            {fmt(rest.todayRevenue)}
          </p>
        </div>
        <div className="bg-bg-solid/60 px-2 py-1.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-faint">Sesiones</p>
          <p className="mt-0.5 font-mono text-[13px] tabular-nums text-text-primary">{rest.todaySessions}</p>
        </div>
        <div className="bg-bg-solid/60 px-2 py-1.5">
          <p className="font-mono text-[9px] uppercase tracking-[0.14em] text-text-faint">Staff</p>
          <p className="mt-0.5 font-mono text-[13px] tabular-nums text-text-primary">{rest.activeStaff}</p>
        </div>
      </div>

      <OccupancyBar active={rest.activeTables} total={rest.totalTables} reduceMotion={reduceMotion} />
    </motion.article>
  );
}

export default function ChainDashboard({ initialTenantId }: { initialTenantId?: string }) {
  const reduceMotion = useReducedMotion();
  const { setHideDashboardChrome } = useShellChrome();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [data, setData] = useState<ChainDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingRest, setIsCreatingRest] = useState(false);

  useEffect(() => {
    if (!isCreatingRest) return;
    setHideDashboardChrome(true);
    return () => setHideDashboardChrome(false);
  }, [isCreatingRest, setHideDashboardChrome]);

  const load = useCallback(async (tid: string) => {
    try {
      setLoading(true);
      const res = await getChainDashboard(tid);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      load(tenantId);
      const iv = setInterval(() => load(tenantId), 30000);
      return () => clearInterval(iv);
    }
  }, [tenantId, load]);

  const derived = useMemo(() => {
    if (!data) return null;
    const totalTables = data.zones.reduce((a, z) => a + z.totalTables, 0);
    const activeTables = data.stats.activeTables;
    const occPct = totalTables > 0 ? (activeTables / totalTables) * 100 : 0;
    const zoneRevenueTotal = data.zones.reduce((a, z) => a + z.totalRevenue, 0);
    const topZones = [...data.zones].slice(0, 4);
    return { totalTables, activeTables, occPct, zoneRevenueTotal, topZones };
  }, [data]);

  if (!tenantId) {
    return <ChainAuthGuard tenantId={initialTenantId} onAuthenticated={(tid) => setTenantId(tid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-bg-solid px-4 font-sans text-text-dim">
        <motion.div
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
          className="text-gold/40"
          aria-hidden
        >
          <Compass className="size-12" strokeWidth={1} />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[0.24em]">Sincronizando cadena…</p>
      </div>
    );
  }

  if (!data || !derived) {
    return (
      <div className="min-h-screen bg-bg-solid p-8 text-center text-[13px] text-dash-red">
        No se encontró la cadena o fue eliminada.
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-bg-solid font-sans text-text-primary antialiased">
      {/* ATMÓSFERA */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-1/4 top-0 h-[min(90vh,720px)] w-[min(120vw,900px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.14),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[50vh] w-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(77,132,96,0.08),transparent_60%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(90deg, var(--color-border-bright) 1px, transparent 1px), linear-gradient(var(--color-border-bright) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* CONTENT */}
      <div className="relative z-10 mx-auto w-full max-w-7xl flex-1 px-4 pb-20 pt-6 sm:px-8 sm:pt-10 space-y-10 sm:space-y-12">
        {/* HERO SPLIT */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="relative flex flex-col justify-center py-1"
          >
            <div
              className="absolute inset-0 opacity-[0.02]"
              style={{
                backgroundImage: `linear-gradient(var(--color-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)`,
                backgroundSize: "24px 24px",
              }}
              aria-hidden
            />

            <div className="relative z-10 space-y-6">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-faint">Vista consolidada · {new Date().toLocaleDateString("es-MX", { weekday: "long", day: "numeric", month: "long" })}</p>
                <h1 className="mt-2 font-serif text-[clamp(2rem,4.5vw,3.25rem)] font-semibold leading-[1.04] tracking-tight">
                  Cadena{" "}
                  <span className="bg-gradient-to-r from-gold via-[#e4c78a] to-gold-dim bg-clip-text text-transparent">
                    {data.chain.name}
                  </span>
                </h1>
                <p className="mt-3.5 max-w-lg text-[13px] leading-relaxed text-text-muted">
                  Monitoreo en tiempo real del desempeño territorial. Analiza zonas activas, pulso de servicio y actividad de cada sucursal en tu red.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 border-t border-border-main/40 pt-5">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-faint">Territorios</p>
                  <p className="mt-1 font-serif text-[22px] font-semibold tabular-nums text-text-primary">{data.zones.length}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-faint">Sucursales</p>
                  <p className="mt-1 font-serif text-[22px] font-semibold tabular-nums text-text-primary">{data.restaurants.length}</p>
                </div>
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-faint">Sesiones hoy</p>
                  <p className="mt-1 font-serif text-[22px] font-semibold tabular-nums text-text-primary">{compact(data.stats.totalSessions)}</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setIsCreatingRest(true)}
                  className="inline-flex items-center gap-2 rounded-xl border border-gold bg-gold px-5 py-2.5 text-[12px] font-semibold tracking-[0.04em] text-bg-solid shadow-[0_6px_24px_-8px_rgba(201,160,84,0.55)] transition-opacity hover:opacity-90"
                >
                  <Plus className="size-3.5" aria-hidden />
                  Nueva sucursal
                </button>
                <Link
                  href={`/cadena/zonas?tenantId=${tenantId}`}
                  className="inline-flex items-center gap-2 rounded-xl border border-border-bright bg-bg-solid/40 px-5 py-2.5 text-[12px] font-semibold text-text-secondary transition-colors hover:border-gold/35 hover:text-gold"
                >
                  <Compass className="size-3.5" aria-hidden />
                  Abrir atlas de zonas
                </Link>
              </div>
            </div>
          </motion.section>

          <motion.aside
            initial={reduceMotion ? false : { opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="relative flex flex-col items-center justify-center gap-5 p-7 sm:p-10"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: `linear-gradient(var(--color-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)`,
                backgroundSize: "22px 22px",
              }}
              aria-hidden
            />
            <div className="pointer-events-none absolute -left-16 -top-24 size-56 rounded-full bg-gold/12 blur-3xl" aria-hidden />

            <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full border border-gold/30 bg-bg-solid/50 px-3 py-1 text-[10px] text-gold backdrop-blur">
              <span className="size-1.5 animate-pulse rounded-full bg-gold" />
              Pulso en vivo
            </div>

            <OccupancyDial pct={derived.occPct} reduceMotion={reduceMotion} />

            <div className="relative grid w-full max-w-[280px] grid-cols-2 gap-2.5">
              <div className="text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-faint">Activas</p>
                <p className="mt-0.5 font-mono text-[16px] font-semibold tabular-nums text-dash-green">{derived.activeTables}</p>
              </div>
              <div className="text-center">
                <p className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-faint">Totales</p>
                <p className="mt-0.5 font-mono text-[16px] font-semibold tabular-nums text-text-secondary">{derived.totalTables}</p>
              </div>
            </div>

            <div className="relative w-full max-w-[280px] border-t border-border-main pt-4 text-center">
              <p className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-faint">Ventas consolidadas</p>
              <p className="mt-1 font-serif text-[28px] font-semibold tabular-nums leading-none text-gold">
                {fmt(data.stats.totalRevenue)}
              </p>
              <p className="mt-1.5 font-mono text-[10px] text-text-dim">MXN · acumulado del día</p>
            </div>
          </motion.aside>
        </div>

        {/* MÉTRICAS SECUNDARIAS */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.08, duration: 0.45 }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            {
              label: "Ventas del día",
              value: fmt(data.stats.totalRevenue),
              hint: "Acumulado MXN",
              icon: TrendingUp,
              tint: "text-gold",
            },
            {
              label: "Mesas activas",
              value: String(derived.activeTables),
              hint: `de ${derived.totalTables} en red`,
              icon: CircleDot,
              tint: "text-dash-green",
            },
            {
              label: "Sesiones",
              value: String(data.stats.totalSessions),
              hint: "Comensales / grupos",
              icon: Users,
              tint: "text-text-primary",
            },
            {
              label: "Sucursales",
              value: String(data.stats.restaurantCount),
              hint: `en ${data.zones.length} ${data.zones.length === 1 ? "zona" : "zonas"}`,
              icon: Store,
              tint: "text-text-primary",
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/50 p-5 backdrop-blur-md"
            >
              <div className="pointer-events-none absolute right-3 top-3 opacity-[0.12]" aria-hidden>
                <item.icon className="size-14 text-gold" strokeWidth={1} />
              </div>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">{item.label}</p>
              <p className={`mt-3 font-serif text-[26px] font-semibold leading-none tabular-nums ${item.tint}`}>
                {item.value}
              </p>
              <p className="mt-2 text-[11px] text-text-dim">{item.hint}</p>
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-gold/60"
                initial={reduceMotion ? false : { width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: reduceMotion ? 0 : 0.15 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ))}
        </motion.div>

        {/* ZONAS — PREVIEW */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border-main pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-faint">Cartografía operativa</p>
              <h2 className="mt-1 font-serif text-[22px] font-semibold tracking-tight text-text-primary">
                Territorios <em className="not-italic text-gold">activos.</em>
              </h2>
              <p className="mt-1 text-[12px] text-text-dim">
                Top {Math.min(4, data.zones.length)} zonas por ventas · {data.zones.length} en total.
              </p>
            </div>
            <Link
              href={`/cadena/zonas?tenantId=${tenantId}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border-main bg-bg-card/60 px-3.5 py-2 text-[11px] font-medium text-text-muted transition-colors hover:border-gold/35 hover:text-gold"
            >
              <Compass className="size-3.5 text-gold/70" aria-hidden />
              Atlas completo
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </div>

          {data.zones.length === 0 ? (
            <div className="relative overflow-hidden rounded-2xl border border-dashed border-border-bright/60 bg-gradient-to-b from-bg-card/40 to-bg-solid px-6 py-14 text-center">
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
                <Orbit className="size-[min(50vw,260px)] text-gold" strokeWidth={0.35} aria-hidden />
              </div>
              <div className="relative mx-auto max-w-md space-y-3">
                <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-border-main bg-bg-bar/80">
                  <MapPin className="size-5 text-gold" aria-hidden />
                </div>
                <h3 className="font-serif text-xl text-text-primary">Aún no hay zonas cartografiadas</h3>
                <p className="text-[12px] leading-relaxed text-text-muted">
                  Designa una zona al crear una sucursal para agrupar tus operaciones territoriales.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
              {derived.topZones.map((zone, i) => {
                const sharePct = derived.zoneRevenueTotal > 0 ? (zone.totalRevenue / derived.zoneRevenueTotal) * 100 : 0;
                return (
                  <ZoneMiniCard
                    key={zone.id}
                    zone={zone}
                    index={i}
                    sharePct={sharePct}
                    reduceMotion={reduceMotion}
                    tenantId={tenantId}
                  />
                );
              })}
            </div>
          )}
        </section>

        {/* SUCURSALES */}
        <section className="space-y-5">
          <div className="flex flex-wrap items-end justify-between gap-3 border-b border-border-main pb-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-faint">Unidades operativas</p>
              <h2 className="mt-1 font-serif text-[22px] font-semibold tracking-tight text-text-primary">
                Desempeño por <em className="not-italic text-gold">sucursal.</em>
              </h2>
              <p className="mt-1 text-[12px] text-text-dim">
                Todas las ubicaciones reportando actividad en vivo.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-main bg-bg-card/60 px-2.5 py-1 font-mono text-[10px] text-text-muted">
                <span className="size-1.5 rounded-full bg-dash-green animate-pulse" />
                {data.restaurants.length} ubicaciones
              </span>
            </div>
          </div>

          {data.restaurants.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-border-bright/60 bg-bg-card/30 px-6 py-14 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-2xl border border-border-main bg-bg-bar/80">
                <Store className="size-5 text-gold" aria-hidden />
              </div>
              <h3 className="mt-3 font-serif text-lg text-text-primary">Aún no hay sucursales</h3>
              <p className="mx-auto mt-1.5 max-w-xs text-[12px] text-text-muted">
                Crea la primera ubicación usando el botón <span className="text-gold">Nueva sucursal</span> del encabezado.
              </p>
              <button
                type="button"
                onClick={() => setIsCreatingRest(true)}
                className="mt-5 inline-flex items-center gap-2 rounded-xl border border-gold bg-gold px-4 py-2 text-[11px] font-semibold text-bg-solid transition-opacity hover:opacity-90"
              >
                <Plus className="size-3.5" aria-hidden />
                Crear sucursal
              </button>
            </div>
          ) : (
            <>
              {/* MOBILE */}
              <div className="space-y-3 sm:hidden">
                {data.restaurants.map((rest, i) => (
                  <RestaurantCard key={rest.id} rest={rest} reduceMotion={reduceMotion} index={i} />
                ))}
              </div>

              {/* DESKTOP */}
              <div className="hidden overflow-hidden rounded-2xl border border-border-main bg-bg-card/40 backdrop-blur-sm sm:block">
                <div className="scrollbar-hide overflow-x-auto">
                  <table className="w-full border-collapse text-left">
                    <thead>
                      <tr className="border-b border-border-main bg-bg-bar/60">
                        <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">Sucursal</th>
                        <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">Zona</th>
                        <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">Ventas hoy</th>
                        <th className="px-5 py-3 font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">Ocupación</th>
                        <th className="px-5 py-3 text-right font-mono text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">Staff</th>
                      </tr>
                    </thead>
                    <tbody className="align-middle">
                      {data.restaurants.map((rest, i) => (
                        <RestaurantRow key={rest.id} rest={rest} reduceMotion={reduceMotion} index={i} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </section>

        <div className="flex items-center justify-between border-t border-border-main/60 pt-4 text-[10px] text-text-faint">
          <p className="font-mono uppercase tracking-[0.2em]">Bouquet · V{new Date().getFullYear()}</p>
          <div className="flex items-center gap-1.5">
            <div className="h-1.5 w-1.5 rounded-full bg-dash-green" />
            <span className="font-mono uppercase tracking-widest">Data stream activo</span>
          </div>
        </div>
      </div>

      {isCreatingRest && (
        <CreateRestaurantDialog
          chainId={tenantId}
          zones={data.zones}
          onCreated={() => {
            load(tenantId);
          }}
          onClose={() => setIsCreatingRest(false)}
        />
      )}
    </div>
  );
}
