"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  AlertTriangle,
  Plus,
  MapPin,
  Store,
  Users,
  ArrowRight,
  Maximize2,
  Minimize2,
  RefreshCw,
  Search,
  ShieldAlert,
  UserCheck,
  Mail,
  Pencil,
} from "lucide-react";
import { getChainDashboard } from "@/actions/chain";
import type { ChainDashboardData } from "@/actions/chain";
import ChainAuthGuard from "./ChainAuthGuard";
import CreateRestaurantDialog from "./CreateRestaurantDialog";
import { Sparkline } from "@/components/admin/Sparkline";
import { NavRow } from "@/components/admin/NavRow";
import { SuperKpiCard } from "@/components/admin/SuperKpiCard";
import { MultiLineChart } from "./MultiLineChart";
import { PeakHourBar } from "./PeakHourBar";
import { Map, Marker } from "pigeon-maps";

// ─── Helpers ───

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function compact(n: number) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}k`;
  return String(n);
}

function pctDiff(current: number, previous: number): string {
  if (!previous) return "+0%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

// ─── Mock data for features without API ───

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// TODO: Replace with real 7-day-per-branch API
function generateMock7Day(revenue: number) {
  const base = revenue / 7;
  return DAY_LABELS.map((day) => ({
    day,
    revenue: Math.round(base * (0.65 + Math.random() * 0.7)),
  }));
}

// TODO: Replace with real hourly orders API
function generateMockHourly(peak: number) {
  const hours: number[] = [];
  for (let h = 0; h < 24; h++) {
    if (h >= 12 && h <= 15) hours.push(peak * (0.5 + Math.random() * 0.5));
    else if (h >= 18 && h <= 21) hours.push(peak * (0.4 + Math.random() * 0.6));
    else if (h >= 7 && h <= 10) hours.push(peak * (0.15 + Math.random() * 0.25));
    else hours.push(peak * (0.01 + Math.random() * 0.08));
  }
  return hours.map((v, i) => ({
    hour: `${i.toString().padStart(2, "0")}h`,
    orders: Math.round(v),
  }));
}

const BRANCH_COLORS = [
  "var(--color-pink-glow)",
  "var(--color-dash-blue)",
  "var(--color-dash-green)",
  "var(--color-dash-amber)",
  "#A78BFA",
  "#F9A8D4",
  "#93C5FD",
  "#86EFAC",
];

// ─── OccupancyDial (restyled to Bouquet) ───

function OccupancyDial({ pct, reduceMotion }: { pct: number; reduceMotion: boolean | null }) {
  const p = Math.min(100, Math.max(0, pct));
  return (
    <div className="relative size-36 shrink-0 sm:size-44">
      <motion.div
        className="absolute inset-0 rounded-full border border-wire bg-ink/80 p-[3px] shadow-[inset_0_0_50px_rgba(0,0,0,0.55)]"
        initial={reduceMotion ? false : { rotate: -90, opacity: 0 }}
        animate={{ rotate: 0, opacity: 1 }}
        transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
      >
        <div
          className="size-full rounded-full"
          style={{
            background: `conic-gradient(var(--color-pink-glow) ${p * 3.6}deg, var(--color-wire) 0deg)`,
          }}
        />
      </motion.div>
      <div className="absolute inset-[12px] flex flex-col items-center justify-center rounded-full bg-bg-card/95 text-center shadow-[inset_0_0_30px_rgba(0,0,0,0.6)]">
        <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-dim">Pulso de sala</p>
        <p className="mt-1 font-serif text-[36px] font-semibold leading-none tabular-nums text-pink-glow">
          {p.toFixed(0)}
          <span className="ml-0.5 text-base text-pink-glow/70">%</span>
        </p>
        <p className="mt-1 font-mono text-[9px] text-dim">en tiempo real</p>
      </div>
      <div className="pointer-events-none absolute inset-[-14px] rounded-full border border-pink-glow/10 [mask-image:radial-gradient(circle,transparent_60%,black_70%)]" aria-hidden />
    </div>
  );
}

// ─── Branch Rankings Table ───

interface BranchRankRow {
  id: string;
  name: string;
  zoneName: string | null;
  todayRevenue: number;
  yesterdayRevenue: number;
  occupancyPct: number;
}

function BranchRankings({ branches }: { branches: BranchRankRow[] }) {
  const sorted = [...branches].sort((a, b) => b.todayRevenue - a.todayRevenue);

  if (sorted.length === 0) {
    return (
      <div className="flex flex-1 items-center justify-center text-[13px] text-dim">
        Sin sucursales. Añade la primera.
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-hidden">
      {sorted.map((b, i) => {
        const delta = b.yesterdayRevenue > 0
          ? ((b.todayRevenue - b.yesterdayRevenue) / b.yesterdayRevenue) * 100
          : 0;
        const isUp = delta >= 0;

        return (
          <div
            key={b.id}
            className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2.5 text-[12px] text-light transition-colors hover:bg-white/[0.015]"
            style={{ animation: `dash-row-enter 500ms ${i * 55}ms ease both` }}
          >
            <span className="w-5 font-mono text-[10px] text-dim">
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 flex-1 truncate font-medium">{b.name}</span>
            <span className="shrink-0 font-mono text-[11px] tabular-nums font-semibold">
              {fmt(b.todayRevenue)}
            </span>
            <span
              className={`shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[9px] font-semibold tabular-nums ${
                isUp ? "bg-dash-green/10 text-dash-green" : "bg-pink-light-glow/10 text-pink-light-glow"
              }`}
            >
              {isUp ? "+" : ""}{delta.toFixed(0)}%
            </span>
            <span className="flex w-16 items-center gap-1.5">
              <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                <span
                  className="block h-full rounded-full"
                  style={{
                    width: `${Math.min(100, b.occupancyPct)}%`,
                    background:
                      b.occupancyPct >= 70
                        ? "var(--color-dash-green)"
                        : b.occupancyPct >= 40
                          ? "var(--color-dash-amber)"
                          : "var(--color-pink-light-glow)",
                  }}
                />
              </span>
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── Main Component ───

export default function ChainDashboard({ tenantId }: { tenantId: string }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const [data, setData] = useState<ChainDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState<"OVERVIEW" | "ZONES" | "ZONES_MAP" | "RESTAURANTS" | "STAFF">("OVERVIEW");
  const [geoPoints, setGeoPoints] = useState<Record<string, [number, number]>>({});
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.432608, -99.133209]);
  const [mapZoom, setMapZoom] = useState(11);

  const load = useCallback(async () => {
    try {
      const res = await getChainDashboard(tenantId);
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [tenantId]);

  // Client-side geocoding for the map
  useEffect(() => {
    if (!data?.restaurants || data.restaurants.length === 0) return;
    
    const geocodeAll = async () => {
      const currentCacheStr = typeof window !== "undefined" ? sessionStorage.getItem("geoCacheBouquet") || "{}" : "{}";
      const cache = JSON.parse(currentCacheStr);
      const newPoints = { ...geoPoints };
      let changed = false;
      let firstCenter: [number, number] | null = null;

      for (const r of data.restaurants) {
        if (!r.address || newPoints[r.id]) continue;
        
        if (cache[r.address]) {
           newPoints[r.id] = cache[r.address];
           changed = true;
           if (!firstCenter) firstCenter = cache[r.address];
           continue;
        }

        try {
          await new Promise((res) => setTimeout(res, 800));
          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(r.address)}&format=json&limit=1&countrycodes=mx`
          );
          const points = await res.json();
          if (points && points.length > 0) {
            const coords: [number, number] = [parseFloat(points[0].lat), parseFloat(points[0].lon)];
            newPoints[r.id] = coords;
            cache[r.address] = coords;
            changed = true;
            if (!firstCenter) firstCenter = coords;
          }
        } catch (e) {
          console.error("Geocode failed for", r.address, e);
        }
      }

      if (changed) {
        setGeoPoints(newPoints);
        if (typeof window !== "undefined") {
          sessionStorage.setItem("geoCacheBouquet", JSON.stringify(cache));
        }
        if (firstCenter) setMapCenter(firstCenter);
      }
    };

    geocodeAll();
  }, [data]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 45000);
    return () => clearInterval(iv);
  }, [load]);

  const derived = useMemo(() => {
    if (!data) return null;
    const occPct =
      data.restaurants.reduce((acc, r) => acc + r.totalTables, 0) > 0
        ? (data.stats.activeTables /
            data.restaurants.reduce((acc, r) => acc + r.totalTables, 0)) *
          100
        : 0;
    const avgTicket =
      data.stats.totalSessions > 0
        ? data.stats.totalRevenue / data.stats.totalSessions
        : 0;
    const yesterdayAvgTicket =
      data.yesterday.totalSessions > 0
        ? data.yesterday.totalRevenue / data.yesterday.totalSessions
        : 0;

    return { occPct, avgTicket, yesterdayAvgTicket };
  }, [data]);

  // Mock data (TODO: real APIs)
  const mock7DayBranches = useMemo(() => {
    if (!data) return [];
    return data.restaurants.slice(0, 8).map((r, i) => ({
      name: r.name,
      data: generateMock7Day(r.todayRevenue),
      color: BRANCH_COLORS[i % BRANCH_COLORS.length],
    }));
  }, [data]);

  const mockPeakHours = useMemo(() => {
    return generateMockHourly(data ? Math.round(data.stats.totalSessions || 100) : 100);
  }, [data]);

  const peakLabel = useMemo(() => {
    if (mockPeakHours.length === 0) return "—";
    let maxI = 0;
    mockPeakHours.forEach((d, i) => {
      if (d.orders > mockPeakHours[maxI].orders) maxI = i;
    });
    return mockPeakHours[maxI].hour;
  }, [mockPeakHours]);

  const now = new Date();
  const dateLabel = now
    .toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()
    .replace(/\./g, "");

  if (!tenantId) {
    return (
      <ChainAuthGuard
        tenantId={tenantId}
        onAuthenticated={(tid) => {
          router.replace(`/cadena?tenantId=${tid}`);
        }}
      />
    );
  }

  if (loading || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-ink font-sans text-[13px] text-light antialiased">
        <div className="flex flex-col items-center gap-4">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
          >
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="12" r="10" stroke="var(--color-pink-glow)" strokeWidth="1.5" strokeDasharray="12 50" />
            </svg>
          </motion.div>
          <span className="font-mono text-[12px] tracking-[0.2em] text-dim">Sincronizando cadena…</span>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen bg-ink font-sans text-[13px] text-light antialiased selection:bg-pink-glow/20">
      {/* ── Atmosphere ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 0%, rgba(244,114,182,0.16), transparent 60%), radial-gradient(ellipse 50% 50% at 0% 100%, rgba(167,243,208,0.04), transparent 60%)",
        }}
        aria-hidden
      />
      <div className="bq-grain" />

      {/* ═══════ SIDEBAR ═══════ */}
      <aside className="relative z-10 flex w-[232px] shrink-0 flex-col gap-5 border-r border-wire bg-burgundy-dark p-5">
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-1">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] font-serif text-[18px] font-semibold italic text-ink"
            style={{
              background: "linear-gradient(135deg, var(--color-rose) 0%, var(--color-rose-light) 100%)",
              boxShadow: "0 4px 12px -4px rgba(199,91,122,0.6), inset 0 1px 0 rgba(255,255,255,0.3)",
            }}
          >
            b
          </div>
          <div className="min-w-0">
            <div className="font-serif text-[18px] font-semibold italic leading-tight tracking-[-0.02em] text-light">
              bouquet
            </div>
            <div className="font-mono text-[8.5px] tracking-[0.3em] text-pink-glow/55">
              CADENA · MASTER
            </div>
          </div>
        </div>

        {/* Chain name badge */}
        <div className="rounded-[10px] border border-pink-glow/20 bg-pink-glow/8 px-3 py-2.5">
          <div className="text-[8.5px] font-bold uppercase tracking-[0.3em] text-pink-glow">
            CADENA
          </div>
          <div className="mt-1 text-[13px] font-medium text-light truncate">
            {data.chain.name}
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-dim">
            {data.stats.restaurantCount} sucursales · {data.stats.staffTotal} staff
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          <div className="px-3 pb-2 pt-1 text-[8.5px] font-bold uppercase tracking-[0.3em] text-dim">
            PANEL MAESTRO
          </div>
          <NavRow 
            label="Visión General" 
            active={activeTab === "OVERVIEW"} 
            onClick={() => setActiveTab("OVERVIEW")}
            badge={null} 
          />
          <NavRow 
            label="Zonas" 
            active={activeTab === "ZONES"} 
            onClick={() => setActiveTab("ZONES")}
            badge={data ? String(data.zones.length) : null} 
          />
          <NavRow 
            label="Sucursales" 
            active={activeTab === "RESTAURANTS"} 
            onClick={() => setActiveTab("RESTAURANTS")}
            badge={data ? String(data.stats.restaurantCount) : null} 
          />
          <NavRow 
            label="Staff" 
            active={activeTab === "STAFF"} 
            onClick={() => setActiveTab("STAFF")}
            badge={data ? String(data.stats.staffTotal) : null} 
          />

          <div className="px-3 pb-2 pt-4 text-[8.5px] font-bold uppercase tracking-[0.3em] text-dim">
            ESTANDARIZACIÓN
          </div>
          <Link
            href={`/cadena/plantillas?tenantId=${tenantId}`}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light"
          >
            Plantillas
          </Link>
          <Link
            href={`/cadena/auditoria?tenantId=${tenantId}`}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light"
          >
            Auditoría
          </Link>
          <Link
            href={`/cadena/staff?tenantId=${tenantId}`}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light"
          >
            Staff
          </Link>
        </nav>

        <div className="flex-1" />

        {/* Actions */}
        <div className="flex flex-col gap-1.5">
          <button
            type="button"
            onClick={() => setIsCreating(true)}
            className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-[12px] font-semibold text-ink transition-all hover:bg-white/90 active:scale-[0.98]"
          >
            <Plus className="h-3.5 w-3.5" />
            Nueva sucursal
          </button>
          <Link
            href={`/cadena/zonas?tenantId=${tenantId}`}
            className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-[12px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light"
          >
            <MapPin className="h-3.5 w-3.5" />
            Atlas de zonas
          </Link>
        </div>

        {/* Status footer */}
        <div className="border-t border-wire pt-3 font-mono text-[10px] text-dim">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-dash-green"
              style={{ boxShadow: "0 0 6px var(--color-dash-green)" }}
            />
            <span className="text-light">OPERATIVO</span>
          </div>
          <div className="mt-1 opacity-70">{data.chain.currency}</div>
        </div>
      </aside>

      {/* ═══════ MAIN ═══════ */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ── Header ── */}
        <header className="flex items-end justify-between border-b border-wire px-6 py-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim">
              {dateLabel} · CADENA
            </p>
            <h1 className="mt-1.5 font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.015em] text-light">
              {data.chain.name}{" "}
              <span className="italic text-pink-glow">bajo control</span>
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-pink-glow/15 bg-pink-glow/8 px-3 py-1.5 font-mono text-[11px] font-semibold text-pink-glow">
              {data.chain.currency}
            </span>
            <Link
              href={`/cadena/zonas?tenantId=${tenantId}`}
              className="hidden rounded-full border border-white/10 px-3.5 py-1.5 text-[11px] font-medium text-dim transition-colors hover:border-white/20 hover:text-light sm:inline-flex sm:items-center sm:gap-1.5"
            >
              <MapPin className="h-3.5 w-3.5" />
              Zonas
            </Link>
            <Link
              href={`/cadena/staff?tenantId=${tenantId}`}
              className="hidden rounded-full border border-white/10 px-3.5 py-1.5 text-[11px] font-medium text-dim transition-colors hover:border-white/20 hover:text-light sm:inline-flex sm:items-center sm:gap-1.5"
            >
              <Users className="h-3.5 w-3.5" />
              Staff
            </Link>
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex flex-1 flex-col gap-5 overflow-y-auto p-5 custom-scrollbar">
          {activeTab === "OVERVIEW" ? (
            <>
              {/* ── KPI Strip ── */}
              <section className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <SuperKpiCard
                  label="VENTAS DEL DÍA"
                  value={fmt(data.stats.totalRevenue)}
                  delta={pctDiff(data.stats.totalRevenue, data.yesterday.totalRevenue)}
                  deltaTone="green"
                  unit={data.chain.currency}
                  trend={[120, 180, 240, 310, 380, 420, 480, 520, 560, data.stats.totalRevenue / 1000]}
                  accent="pink"
                  delay={0}
                />
                <SuperKpiCard
                  label="TICKET PROMEDIO"
                  value={fmt(derived!.avgTicket)}
                  delta={pctDiff(derived!.avgTicket, derived!.yesterdayAvgTicket)}
                  deltaTone={derived!.avgTicket >= derived!.yesterdayAvgTicket ? "green" : "amber"}
                  unit="POR COMANDA"
                  accent="blue"
                  delay={80}
                />
                <SuperKpiCard
                  label="MESAS ACTIVAS"
                  value={String(data.stats.activeTables)}
                  delta={derived!.occPct.toFixed(0) + "%"}
                  deltaTone={derived!.occPct >= 50 ? "green" : "amber"}
                  unit="OCUPACIÓN RED"
                  trend={[40, 45, 50, 55, 60, 62, 65, 68, 70, derived!.occPct]}
                  accent="pink"
                  delay={160}
                />
                <SuperKpiCard
                  label="SESIONES"
                  value={String(data.stats.totalSessions)}
                  delta={pctDiff(data.stats.totalSessions, data.yesterday.totalSessions)}
                  deltaTone="green"
                  unit="COMENSALES HOY"
                  accent="green"
                  delay={240}
                />
              </section>

              {/* ── Alerts Banner ── */}
              {data.alerts.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="rounded-[18px] border border-pink-light-glow/20 bg-pink-light-glow/[0.04] p-4"
                >
                  <div className="mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-pink-light-glow" />
                    <h3 className="text-[13px] font-semibold text-rose-pale">
                      {data.alerts.length} sucursal{data.alerts.length > 1 ? "es" : ""} requiere{data.alerts.length === 1 ? "" : "n"} atención
                    </h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {data.alerts.map((a) => (
                      <Link
                        key={a.id}
                        href={`/dashboard?restaurantId=${a.id}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-pink-light-glow/15 bg-pink-light-glow/10 px-2.5 py-1.5 text-[11px] text-rose-pale transition-colors hover:bg-pink-light-glow/20"
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-pink-light-glow" />
                        <span className="font-medium">{a.name}</span>
                        <span className="text-pink-light-glow/70">· {a.message}</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* ── Lower Grid ── */}
              <div className="grid flex-1 gap-3 lg:grid-cols-1 xl:grid-cols-[1.3fr_0.95fr_0.85fr]">
                {/* LEFT: 7-day chart */}
                <div className="bq-card flex flex-col !p-0 overflow-hidden lg:order-1">
                  <div className="border-b border-wire px-4 py-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                      VENTAS · 7 DÍAS POR SUCURSAL
                    </p>
                    <p className="mt-0.5 font-serif text-[20px] font-medium leading-tight text-light">
                      El <span className="italic text-pink-glow">jardín</span> completo
                    </p>
                  </div>
                  <div className="flex-1 p-3">
                    <MultiLineChart branches={mock7DayBranches} className="h-full" />
                  </div>
                  <div className="border-t border-wire px-4 py-2">
                    <span className="font-mono text-[9px] tracking-[0.15em] text-dim">
                      {mock7DayBranches.length} sucursales · {/* TODO: real 7-day API */} datos simulados
                    </span>
                  </div>
                </div>

                {/* MIDDLE: Branch rankings */}
                <div className="bq-card flex flex-col !p-0 overflow-hidden lg:order-2">
                  <div className="border-b border-wire px-4 py-3.5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                      RANKING · HOY
                    </p>
                    <p className="mt-0.5 font-serif text-[20px] font-medium leading-tight text-light">
                      ¿Quién <span className="italic text-pink-glow">lidera</span>?
                    </p>
                  </div>
                  {/* Table header */}
                  <div className="flex items-center gap-2 border-b border-white/[0.04] px-4 py-2 font-mono text-[9px] tracking-[0.2em] text-dim">
                    <span className="w-5">#</span>
                    <span className="min-w-0 flex-1">SUCURSAL</span>
                    <span className="w-[72px] text-right">HOY</span>
                    <span className="w-[44px] text-right">Δ</span>
                    <span className="w-16">OCUP</span>
                  </div>
                  <BranchRankings
                    branches={data.restaurants.map((r) => ({
                      id: r.id,
                      name: r.name,
                      zoneName: r.zoneName,
                      todayRevenue: r.todayRevenue,
                      yesterdayRevenue: r.todayRevenue * (0.75 + Math.random() * 0.5), // TODO: real yesterday per branch
                      occupancyPct: r.totalTables > 0 ? (r.activeTables / r.totalTables) * 100 : 0,
                    }))}
                  />
                  <div className="border-t border-wire px-4 py-2.5">
                    <span className="font-mono text-[9px] tracking-[0.15em] text-dim">
                      {data.restaurants.length} sucursales activas
                    </span>
                  </div>
                </div>

                {/* RIGHT: Occupancy + Peak + Quick stats */}
                <div className="flex flex-col gap-3 lg:order-3">
                  {/* Occupancy dial */}
                  <div className="bq-card flex items-center justify-center gap-6 p-5">
                    <OccupancyDial pct={derived!.occPct} reduceMotion={reduceMotion} />
                    <div className="space-y-2">
                      <div>
                        <p className="font-mono text-[18px] font-semibold tabular-nums text-light">
                          {data.stats.activeTables}
                          <span className="ml-1 font-mono text-[11px] text-dim">
                            / {data.restaurants.reduce((acc, r) => acc + r.totalTables, 0)}
                          </span>
                        </p>
                        <p className="text-[10px] text-dim">mesas activas/total</p>
                      </div>
                      <div>
                        <p className="font-mono text-[18px] font-semibold tabular-nums text-light">
                          {data.stats.restaurantCount}
                        </p>
                        <p className="text-[10px] text-dim">sucursales</p>
                      </div>
                    </div>
                  </div>

                  {/* Peak hour */}
                  <div className="bq-card flex flex-col p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                      HORA PICO · CONSOLIDADO
                    </p>
                    <p className="mt-0.5 font-serif text-[17px] font-medium leading-tight text-light">
                      Pico a las{" "}
                      <span className="italic text-pink-glow">{peakLabel}</span>
                    </p>
                    <div className="mt-2 h-[72px]">
                      <PeakHourBar data={mockPeakHours} className="h-full" />
                    </div>
                    <div className="mt-1 font-mono text-[9px] tracking-[0.15em] text-dim">
                      {/* TODO: real hourly API */} simulado
                    </div>
                  </div>

                  {/* Zones summary */}
                  <div className="bq-card p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                      ZONAS · TOP
                    </p>
                    <div className="mt-3 flex flex-col gap-2">
                      {data.zones.slice(0, 4).map((z) => {
                        const zoneOcc =
                          z.totalTables > 0
                            ? Math.round((z.activeTables / z.totalTables) * 100)
                            : 0;
                        return (
                          <div key={z.id} className="flex items-center justify-between text-[12px]">
                            <div className="flex min-w-0 items-center gap-2">
                              <Store className="h-3.5 w-3.5 shrink-0 text-dim" />
                              <span className="truncate font-medium text-light">{z.name}</span>
                              <span className="font-mono text-[10px] text-dim">
                                {z.restaurantCount} loc.
                              </span>
                            </div>
                            <div className="flex items-center gap-2.5">
                              <span className="font-mono text-[11px] tabular-nums text-dim">
                                {fmt(z.totalRevenue)}
                              </span>
                              <span className="flex w-16 items-center gap-1.5">
                                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                                  <span
                                    className="block h-full rounded-full"
                                    style={{
                                      width: `${zoneOcc}%`,
                                      background:
                                        zoneOcc >= 70
                                          ? "var(--color-dash-green)"
                                          : zoneOcc >= 40
                                            ? "var(--color-dash-amber)"
                                            : "var(--color-pink-light-glow)",
                                    }}
                                  />
                                </span>
                                <span className="font-mono text-[9px] tabular-nums text-dim">
                                  {zoneOcc}%
                                </span>
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : activeTab === "ZONES" ? (
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex items-end justify-between px-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                    CADENA · TERRITORIOS
                  </p>
                  <h2 className="mt-1 font-serif text-[24px] font-medium leading-tight text-light">
                    Atlas de <span className="italic text-pink-glow">zonas</span>
                  </h2>
                </div>
                <button
                  onClick={() => setActiveTab("ZONES_MAP")}
                  className="flex h-9 items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 text-[12px] text-dim hover:bg-white/10 hover:text-light transition-all"
                >
                  <MapPin className="h-3.5 w-3.5" />
                  Ver Mapa Completo
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {data.zones.map((zone, i) => (
                  <motion.div
                    key={zone.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bq-card group relative flex flex-col gap-4 overflow-hidden"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-pink-glow/10 text-pink-glow">
                        <MapPin className="h-5 w-5" />
                      </div>
                      <div className="text-right">
                        <div className="text-[10px] font-bold text-dim uppercase tracking-wider">Sucursales</div>
                        <div className="text-xl font-bold text-light font-mono">{zone.restaurantCount}</div>
                      </div>
                    </div>
                    
                    <div>
                      <h3 className="font-serif text-lg font-medium text-light group-hover:text-pink-glow transition-colors">
                        {zone.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-dim">ID: {zone.id.slice(0, 8)}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                      <button className="text-[11px] font-medium text-dim hover:text-light transition-colors">
                        Gestionar zona
                      </button>
                      <ArrowRight className="h-3.5 w-3.5 text-dim/40 group-hover:text-pink-glow transition-all group-hover:translate-x-1" />
                    </div>

                    {/* Gradient deco */}
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-pink-glow/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}

                <button className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-white/5 bg-white/[0.01] p-8 text-dim transition-all hover:border-pink-glow/20 hover:bg-pink-glow/[0.02] hover:text-light">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-4">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-[13px]">Nueva Zona</p>
                  <p className="mt-1 text-[13px] text-dim">Dividir territorio</p>
                </button>
              </div>
            </div>
          ) : activeTab === "RESTAURANTS" ? (
            <div className="flex flex-1 flex-col gap-6 overflow-hidden">
              <div className="flex items-end justify-between px-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                    CADENA · UNIDADES OPERATIVAS
                  </p>
                  <h2 className="mt-1 font-serif text-[24px] font-medium leading-tight text-light">
                    Control de <span className="italic text-pink-glow">sucursales</span>
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
                    <input 
                      type="text" 
                      placeholder="Buscar sucursal..." 
                      className="h-9 w-64 rounded-full border border-white/5 bg-white/[0.03] pl-9 pr-4 text-[12px] text-light placeholder:text-dim focus:border-pink-glow/30 focus:outline-none transition-all"
                    />
                  </div>
                  <button 
                    onClick={() => setIsCreating(true)}
                    className="flex h-9 items-center gap-2 rounded-full bg-pink-glow px-4 text-[12px] font-bold text-ink hover:opacity-90 active:scale-95 transition-all"
                  >
                    <Plus className="h-4 w-4" />
                    Nueva Sucursal
                  </button>
                </div>
              </div>

              <div className="bq-card flex flex-1 flex-col overflow-hidden !p-0">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Sucursal</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Zona</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Ventas Hoy</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Ocupación</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Estado</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {data.restaurants.map((res, i) => {
                        const occPct = res.totalTables > 0 ? Math.round((res.activeTables / res.totalTables) * 100) : 0;
                        return (
                          <tr 
                            key={res.id} 
                            className="group hover:bg-white/[0.02] transition-colors"
                            style={{ animation: `dash-row-enter 500ms ${i * 40}ms ease both` }}
                          >
                            <td className="px-6 py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-light group-hover:text-pink-glow transition-colors">{res.name}</span>
                                <span className="text-[10px] text-dim font-mono">{res.id.slice(0, 8)}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-[12px] text-dim">{res.zoneName}</td>
                            <td className="px-6 py-4 font-mono text-[13px] text-light">{fmt(res.todayRevenue)}</td>
                            <td className="px-6 py-4">
                              <div className="flex w-32 items-center gap-3">
                                <div className="h-1 flex-1 overflow-hidden rounded-full bg-white/5">
                                  <div 
                                    className="h-full rounded-full transition-all duration-1000"
                                    style={{ 
                                      width: `${occPct}%`,
                                      background: occPct >= 70 ? 'var(--color-dash-green)' : occPct >= 40 ? 'var(--color-dash-amber)' : 'var(--color-pink-glow)'
                                    }}
                                  />
                                </div>
                                <span className="font-mono text-[11px] text-dim">{occPct}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <span className="flex items-center gap-1.5 rounded-full bg-dash-green/10 px-2 py-0.5 text-[9px] font-bold text-dash-green border border-dash-green/20">
                                <span className="h-1 w-1 rounded-full bg-dash-green" />
                                ACTIVA
                              </span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button 
                                onClick={() => router.push(`/cadena/restaurantes/${res.id}`)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-dim hover:bg-white/10 hover:text-light transition-all"
                              >
                                <ArrowRight className="h-3.5 w-3.5" />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : activeTab === "STAFF" ? (
            <div className="flex flex-1 flex-col gap-6 overflow-hidden">
              <div className="flex items-end justify-between px-2">
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                    CADENA · RECURSOS HUMANOS
                  </p>
                  <h2 className="mt-1 font-serif text-[24px] font-medium leading-tight text-light">
                    Personal de la <span className="italic text-pink-glow">red</span>
                  </h2>
                </div>
                <div className="flex items-center gap-3">
                  <div className="relative hidden sm:block">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
                    <input 
                      type="text" 
                      placeholder="Buscar personal..." 
                      className="h-9 w-64 rounded-full border border-white/5 bg-white/[0.03] pl-9 pr-4 text-[12px] text-light placeholder:text-dim focus:border-pink-glow/30 focus:outline-none transition-all"
                    />
                  </div>
                  <button className="flex h-9 items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 text-[12px] text-dim hover:bg-white/10 hover:text-light transition-all">
                    <Mail className="h-3.5 w-3.5" />
                    Invitar Staff
                  </button>
                </div>
              </div>

              <div className="bq-card flex flex-1 flex-col overflow-hidden !p-0">
                <div className="overflow-x-auto custom-scrollbar">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-white/[0.04] bg-white/[0.01]">
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Colaborador</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Rol</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Ubicación</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Estado</th>
                        <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-dim"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.02]">
                      {data.staff?.map((s, i) => (
                        <tr 
                          key={s.id + s.role} 
                          className="group hover:bg-white/[0.02] transition-colors"
                          style={{ animation: `dash-row-enter 500ms ${i * 30}ms ease both` }}
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/5 text-[12px] font-bold text-light group-hover:bg-pink-glow/10 group-hover:text-pink-glow transition-all">
                                {s.name.charAt(0)}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-medium text-light">{s.name}</span>
                                <span className="text-[10px] text-dim">{s.email}</span>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/5 bg-white/[0.02] px-2.5 py-1 text-[10px] font-medium text-dim">
                              {s.role === 'CHAIN_ADMIN' ? 'Admin Cadena' : 
                               s.role === 'RESTAURANT_ADMIN' ? 'Admin Local' : 
                               s.role === 'WAITER' ? 'Mesero' : s.role}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-[12px] text-dim">{s.restaurantName}</td>
                          <td className="px-6 py-4">
                            <span className="flex items-center gap-1.5 text-[10px] text-dash-green">
                              <div className="h-1.5 w-1.5 rounded-full bg-dash-green" />
                              ACTIVO
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right">
                            <button className="text-dim hover:text-light transition-colors">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-1 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-ink relative">
              <div className="absolute inset-0 z-0">
                <Map
                  provider={(x, y, z) => `https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/${z}/${x}/${y}.png`}
                  center={mapCenter}
                  zoom={mapZoom}
                  onBoundsChanged={({ center, zoom }) => {
                    setMapCenter(center);
                    setMapZoom(zoom);
                  }}
                  metaWheelZoom={true}
                  attribution={false}
                >
                  {data.restaurants.map((rest) => {
                    const coords = geoPoints[rest.id];
                    if (!coords) return null;
                    return (
                      <Marker
                        key={rest.id}
                        width={40}
                        anchor={coords}
                        onClick={() => router.push(`/cadena/restaurantes/${rest.id}`)}
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-white bg-pink-glow text-[10px] font-bold text-ink shadow-lg transition-transform hover:scale-110">
                          {rest.name.charAt(0)}
                        </div>
                      </Marker>
                    );
                  })}
                </Map>
              </div>
              
              {/* Map UI Overlay */}
              <div className="absolute top-6 left-6 z-10 flex flex-col gap-3">
                <button 
                  onClick={() => setActiveTab("ZONES")}
                  className="flex h-10 items-center gap-2 rounded-full bg-ink/80 backdrop-blur-md border border-white/10 px-4 text-[12px] font-medium text-light hover:bg-ink transition-all"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" />
                  Volver a Lista
                </button>
                <div className="flex flex-col gap-1 rounded-2xl bg-ink/80 backdrop-blur-md border border-white/10 p-3 shadow-2xl">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-dim">Radar Operativo</p>
                  <p className="text-[11px] text-light">{data.restaurants.length} sucursales fijadas</p>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 z-10 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-ink/80 backdrop-blur-md">
                <button onClick={() => setMapZoom(z => Math.min(18, z + 1))} className="flex h-10 w-10 items-center justify-center text-lg text-light hover:bg-white/10">+</button>
                <button onClick={() => setMapZoom(z => Math.max(1, z - 1))} className="flex h-10 w-10 items-center justify-center text-lg text-light hover:bg-white/10 border-t border-white/10">−</button>
              </div>
            </div>
          )}
        </main>
      </div>

      {isCreating && (
        <CreateRestaurantDialog
          chainId={tenantId}
          zones={data.zones.map((z) => ({ id: z.id, name: z.name }))}
          onCreated={() => { setIsCreating(false); load(); }}
          onClose={() => setIsCreating(false)}
        />
      )}
    </div>
  );
}
