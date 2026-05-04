"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import { useMobileSheetAnimation } from "@/hooks/use-mobile-sheet-animation";
import {
  MobileTabPills,
  MobileTabPillsList,
  MobileTabPillsTab,
  MobileTabPillsPanel,
} from "@/components/mobile-tab-pills";
import {
  Plus,
  MapPin,
  Store,
  Users,
  ArrowRight,
  Search,
  Mail,
  Menu,
  Pencil,
  X,
} from "lucide-react";
import { getChainDashboard } from "@/actions/chain";
import type { ChainDashboardData } from "@/actions/chain";
import ChainAuthGuard from "./ChainAuthGuard";
import CreateRestaurantDialog from "./CreateRestaurantDialog";
import { NavRow } from "@/components/admin/NavRow";
import { MultiLineChart } from "./MultiLineChart";
import { PeakHourBar } from "./PeakHourBar";
import { Map, Marker } from "pigeon-maps";
import { DayHeroCard } from "./DayHeroCard";
import { SecondaryMetrics } from "./SecondaryMetrics";
import { BranchStatusList } from "./BranchStatusList";
import { RankingTable } from "./RankingTable";

// ─── Helpers ───

function fmt(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

// ─── Typography System ───
const SUBLABEL = "text-[12px] opacity-60";
const SECTION = "text-[13px] font-bold uppercase tracking-[0.12em]";

// ─── Mock data for features without API ───

const DAY_LABELS = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"];

// TODO: Replace with real 7-day-per-branch API
function generateMock7Day(revenue: number) {
  const base = revenue / 7;
  return DAY_LABELS.map((day, idx) => {
    // Deterministic factor based on day index
    const factor = 0.65 + ((idx * 7) % 10) * 0.07;
    return {
      day,
      revenue: Math.round(base * factor),
    };
  });
}

// TODO: Replace with real hourly orders API
function generateMockHourly(peak: number) {
  const hours: number[] = [];
  for (let h = 0; h < 24; h++) {
    const pseudoRand = ((h * 13) % 10) / 10;
    if (h >= 12 && h <= 15) hours.push(peak * (0.5 + pseudoRand * 0.5));
    else if (h >= 18 && h <= 21) hours.push(peak * (0.4 + pseudoRand * 0.6));
    else if (h >= 7 && h <= 10) hours.push(peak * (0.15 + pseudoRand * 0.25));
    else hours.push(peak * (0.01 + pseudoRand * 0.08));
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
        <p className="mt-1 text-[28px] sm:text-[36px] font-light leading-none tabular-nums text-pink-glow">
          {p.toFixed(0)}
          <span className="ml-0.5 text-base text-pink-glow/70">%</span>
        </p>
        <p className="mt-1 font-mono text-[9px] text-dim">en tiempo real</p>
      </div>
      <div className="pointer-events-none absolute inset-[-14px] rounded-full border border-pink-glow/10 [mask-image:radial-gradient(circle,transparent_60%,black_70%)]" aria-hidden />
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const sheetRef = useRef<HTMLElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  useMobileSheetAnimation(sheetRef, backdropRef, sidebarOpen);

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
    <div className="relative flex flex-col md:flex-row min-h-screen bg-ink font-sans text-[13px] text-light antialiased selection:bg-pink-glow/20">
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

      {/* ═══════ SIDEBAR (desktop only) ═══════ */}
      <aside className="relative z-10 hidden md:flex w-[232px] shrink-0 flex-col gap-5 border-r border-wire bg-burgundy-dark p-5">
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
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light focus-visible:ring-2 focus-visible:ring-ring"
          >
            Plantillas
          </Link>
          <Link
            href={`/cadena/auditoria?tenantId=${tenantId}`}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light focus-visible:ring-2 focus-visible:ring-ring"
          >
            Auditoría
          </Link>
          <Link
            href={`/cadena/staff?tenantId=${tenantId}`}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light focus-visible:ring-2 focus-visible:ring-ring"
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
            className="flex w-full items-center gap-2 rounded-lg bg-white px-3 py-2 text-[12px] font-semibold text-ink transition-all hover:bg-white/90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Nueva sucursal
          </button>
          <Link
            href={`/cadena/zonas?tenantId=${tenantId}`}
            className="flex w-full items-center gap-2 rounded-lg border border-white/[0.08] px-3 py-2 text-[12px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light focus-visible:ring-2 focus-visible:ring-ring"
          >
            <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
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

      {/* ═══════ MOBILE SIDEBAR OVERLAY ═══════ */}
      <div
        ref={backdropRef}
        className={cn(
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden opacity-0",
          sidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        )}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />
      <aside
        ref={sheetRef}
        className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col gap-5 bg-burgundy-dark p-5 overflow-y-auto shadow-2xl md:hidden"
        style={{ transform: "translateX(-100%)" }}
        aria-hidden={!sidebarOpen}
      >
        <button
          onClick={() => setSidebarOpen(false)}
          className="self-end flex min-h-[44px] min-w-[44px] items-center justify-center rounded-lg text-dim hover:text-light focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
          aria-label="Cerrar menú"
        >
          <X className="h-5 w-5" aria-hidden="true" />
        </button>
        {/* Brand */}
        <div className="flex items-center gap-2.5 px-1">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[9px] font-serif text-[18px] font-semibold italic text-ink"
            style={{ background: "linear-gradient(135deg, var(--color-rose) 0%, var(--color-rose-light) 100%)", boxShadow: "0 4px 12px -4px rgba(199,91,122,0.6), inset 0 1px 0 rgba(255,255,255,0.3)" }}>
            b
          </div>
          <div className="min-w-0">
            <div className="font-serif text-[18px] font-semibold italic leading-tight tracking-[-0.02em] text-light">bouquet</div>
            <div className="font-mono text-[8.5px] tracking-[0.3em] text-pink-glow/55">CADENA · MASTER</div>
          </div>
        </div>
        {/* Chain badge */}
        {data && (
          <div className="rounded-[10px] border border-pink-glow/20 bg-pink-glow/8 px-3 py-2.5">
            <div className="text-[8.5px] font-bold uppercase tracking-[0.3em] text-pink-glow">CADENA</div>
            <div className="mt-1 text-[13px] font-medium text-light truncate">{data.chain.name}</div>
            <div className="mt-0.5 font-mono text-[10px] text-dim">{data.stats.restaurantCount} sucursales · {data.stats.staffTotal} staff</div>
          </div>
        )}
        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          <div className="mt-6 mb-2 px-3 text-[8.5px] font-bold uppercase tracking-[0.3em] text-dim">PANEL MAESTRO</div>
          {[
            { id: "OVERVIEW" as const, label: "Visión General", badge: null },
            { id: "ZONES" as const, label: "Zonas", badge: data ? String(data.zones.length) : null },
            { id: "RESTAURANTS" as const, label: "Sucursales", badge: data ? String(data.stats.restaurantCount) : null },
            { id: "STAFF" as const, label: "Staff", badge: data ? String(data.stats.staffTotal) : null },
          ].map(tab => {
            const active = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex w-full min-h-[48px] touch-manipulation items-center justify-between rounded-lg px-5 text-left text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring",
                  active
                    ? "bg-accent text-accent-foreground"
                    : "text-dim hover:bg-white/[0.04] hover:text-light"
                )}
              >
                <span>{tab.label}</span>
                {tab.badge != null && (
                  <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
          <div className="mt-6 mb-2 px-3 text-[8.5px] font-bold uppercase tracking-[0.3em] text-dim">ESTANDARIZACIÓN</div>
          <Link
            href={`/cadena/plantillas?tenantId=${tenantId}`}
            onClick={() => setSidebarOpen(false)}
            className="flex w-full min-h-[48px] touch-manipulation items-center gap-3 rounded-lg px-5 text-left text-[13px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex-1">Plantillas</span>
            <span className="text-dim/40" aria-hidden="true">›</span>
          </Link>
          <Link
            href={`/cadena/auditoria?tenantId=${tenantId}`}
            onClick={() => setSidebarOpen(false)}
            className="flex w-full min-h-[48px] touch-manipulation items-center gap-3 rounded-lg px-5 text-left text-[13px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex-1">Auditoría</span>
            <span className="text-dim/40" aria-hidden="true">›</span>
          </Link>
          <Link
            href={`/cadena/staff?tenantId=${tenantId}`}
            onClick={() => setSidebarOpen(false)}
            className="flex w-full min-h-[48px] touch-manipulation items-center gap-3 rounded-lg px-5 text-left text-[13px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light focus-visible:ring-2 focus-visible:ring-ring"
          >
            <span className="flex-1">Staff</span>
            <span className="text-dim/40" aria-hidden="true">›</span>
          </Link>
        </nav>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => { setSidebarOpen(false); setIsCreating(true); }}
          className="flex w-full min-h-[48px] touch-manipulation items-center gap-2 rounded-lg bg-white px-5 py-2 text-[12px] font-semibold text-ink transition-all hover:bg-white/90 active:scale-[0.98] focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Plus className="h-3.5 w-3.5" aria-hidden="true" /> Nueva sucursal
        </button>
        <Link
          href={`/cadena/zonas?tenantId=${tenantId}`}
          onClick={() => setSidebarOpen(false)}
          className="flex w-full min-h-[48px] touch-manipulation items-center gap-2 rounded-lg border border-white/[0.08] px-5 py-2 text-[12px] font-medium text-dim transition-colors hover:bg-white/[0.04] hover:text-light focus-visible:ring-2 focus-visible:ring-ring"
        >
          <MapPin className="h-3.5 w-3.5" aria-hidden="true" /> Gestionar zonas
        </Link>
      </aside>

      {/* ═══════ MOBILE TOP BAR ═══════ */}
      <div className="md:hidden flex items-center justify-between border-b border-wire bg-burgundy-dark px-4 py-3">
        <button
          onClick={() => setSidebarOpen(true)}
          className="flex size-11 items-center justify-center -ml-2 text-dim hover:text-light focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
          aria-label="Abrir menú"
        >
          <Menu className="h-5 w-5" aria-hidden="true" />
        </button>
        <div className="flex flex-col items-center min-w-0 mx-2">
          <span className="font-serif text-[16px] font-semibold italic leading-tight tracking-[-0.02em] text-light">bouquet</span>
          <span className="text-[11px] text-dim/50 truncate max-w-[160px]">{data?.chain?.name ?? "Cadena"}</span>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="flex size-11 items-center justify-center text-dim hover:text-light focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
          aria-label="Nueva sucursal"
        >
          <Plus className="h-5 w-5" aria-hidden="true" />
        </button>
      </div>

      {/* ═══════ MOBILE TAB PILLS ═══════ */}
      <MobileTabPills value={activeTab} onChange={setActiveTab}>
        <MobileTabPillsList className="md:hidden border-b border-wire bg-bg-solid px-3 py-3">
          <MobileTabPillsTab value="OVERVIEW">Visión General</MobileTabPillsTab>
          <MobileTabPillsTab value="ZONES">Zonas</MobileTabPillsTab>
          <MobileTabPillsTab value="RESTAURANTS">Sucursales</MobileTabPillsTab>
          <MobileTabPillsTab value="STAFF">Staff</MobileTabPillsTab>
        </MobileTabPillsList>

        {/* ═══════ MAIN ═══════ */}
        <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ── Header (desktop only) ── */}
        <header className="hidden sm:flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 border-b border-wire px-4 py-3 sm:px-6 sm:py-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim">
              {dateLabel} · CADENA
            </p>
            <h1 className="mt-1.5 text-[22px] sm:text-[28px] font-medium leading-[1.05] tracking-[-0.015em] text-light">
              {data.chain.name}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
        <main className="flex flex-1 flex-col gap-5 overflow-y-auto p-3 sm:p-5 px-4 custom-scrollbar">
          <MobileTabPillsPanel value="OVERVIEW">
            <>
              {/* ── Day Hero Card ── */}
              <DayHeroCard
                totalRevenue={data.stats.totalRevenue}
                yesterdayRevenue={data.yesterday.totalRevenue}
                currency={data.chain.currency}
              />

              {/* ── Secondary Metrics ── */}
              <SecondaryMetrics
                avgTicket={derived!.avgTicket}
                yesterdayAvgTicket={derived!.yesterdayAvgTicket}
                activeTables={data.stats.activeTables}
                totalTables={data.restaurants.reduce((acc, r) => acc + r.totalTables, 0)}
                totalSessions={data.stats.totalSessions}
                yesterdaySessions={data.yesterday.totalSessions}
              />

              {/* ── Branch Status List ── */}
              <BranchStatusList
                branches={data.restaurants}
                alerts={data.alerts}
              />

              {/* ── Lower Grid ── */}
              <div className="grid flex-1 gap-3 lg:grid-cols-1 xl:grid-cols-[1.3fr_0.95fr_0.85fr]">
                {/* LEFT: 7-day chart */}
                <div className="bq-card flex flex-col !p-0 overflow-hidden lg:order-1">
                  <div className="border-b border-wire px-4 py-3.5">
                    <p className={SECTION}>VENTAS 7 DÍAS</p>
                    <p className={`${SUBLABEL} mt-0.5`}>Ventas por sucursal, últimos 7 días</p>
                  </div>
                  <div className="flex-1 p-3 w-full overflow-hidden">
                    <MultiLineChart branches={mock7DayBranches} className="h-full" />
                  </div>
                  <div className="border-t border-wire px-4 py-2">
                    <span className="font-mono text-[9px] tracking-[0.15em] text-dim">
                      {mock7DayBranches.length} sucursales · {/* TODO: real 7-day API */} datos simulados
                    </span>
                  </div>
                </div>

                {/* MIDDLE: Ranking Table */}
                <div className="lg:order-2">
                  <RankingTable branches={data.restaurants} currency={data.chain.currency} />
                </div>

                {/* RIGHT: Occupancy + Peak + Quick stats */}
                <div className="flex flex-col gap-3 lg:order-3">
                  {/* Occupancy dial */}
                  <div className="bq-card flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 p-3 sm:p-5">
                    <OccupancyDial pct={derived!.occPct} reduceMotion={reduceMotion} />
                    <div className="space-y-2">
                      <div>
                        <p className="font-mono text-[15px] sm:text-[18px] font-semibold tabular-nums text-light">
                          {data.stats.activeTables}
                          <span className="ml-1 font-mono text-[11px] text-dim">
                            / {data.restaurants.reduce((acc, r) => acc + r.totalTables, 0)}
                          </span>
                        </p>
                        <p className="text-[10px] text-dim">mesas activas/total</p>
                      </div>
                      <div>
                        <p className="font-mono text-[15px] sm:text-[18px] font-semibold tabular-nums text-light">
                          {data.stats.restaurantCount}
                        </p>
                        <p className="text-[10px] text-dim">sucursales</p>
                      </div>
                    </div>
                  </div>

                  {/* Peak hour */}
                  <div className="bq-card flex flex-col p-4">
                    <p className={SECTION}>HORA PICO</p>
                    <p className={`${SUBLABEL} mt-0.5`}>Pico a las {peakLabel}</p>
                    <div className="mt-2 h-[120px]">
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
          </MobileTabPillsPanel>
          <MobileTabPillsPanel value="ZONES">
            <div className="flex flex-1 flex-col gap-6">
              <div className="flex items-end justify-between px-2">
                <div>
                  <p className={SECTION}>ZONAS</p>
                  <p className={`${SUBLABEL} mt-0.5`}>Atlas de territorios</p>
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
                      <h3 className="text-lg font-medium text-light group-hover:text-pink-glow transition-colors">
                        {zone.name}
                      </h3>
                      <p className="mt-1 text-[11px] text-dim">ID: {zone.id.slice(0, 8)}</p>
                    </div>

                    <div className="mt-4 flex items-center justify-between border-t border-white/5 pt-4">
                      <button className="text-[11px] font-medium text-dim hover:text-light transition-colors focus-visible:ring-2 focus-visible:ring-ring touch-manipulation">
                        Gestionar zona
                      </button>
                      <ArrowRight className="h-3.5 w-3.5 text-dim/40 group-hover:text-pink-glow transition-all group-hover:translate-x-1" />
                    </div>

                    {/* Gradient deco */}
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-pink-glow/5 blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                  </motion.div>
                ))}

                <button className="flex flex-col items-center justify-center rounded-[24px] border-2 border-dashed border-white/5 bg-white/[0.01] p-8 text-dim transition-all hover:border-pink-glow/20 hover:bg-pink-glow/[0.02] hover:text-light focus-visible:ring-2 focus-visible:ring-ring touch-manipulation">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/5 mb-4">
                    <Plus className="h-6 w-6" />
                  </div>
                  <p className="font-medium text-[13px]">Nueva Zona</p>
                  <p className="mt-1 text-[13px] text-dim">Dividir territorio</p>
                </button>
              </div>
            </div>
          </MobileTabPillsPanel>
          <MobileTabPillsPanel value="RESTAURANTS">
            <div className="flex flex-1 flex-col gap-6 overflow-hidden">
              <div className="flex items-end justify-between px-2">
                <div>
                  <p className={SECTION}>SUCURSALES</p>
                  <p className={`${SUBLABEL} mt-0.5`}>Unidades operativas</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
                    <input 
                      type="text" 
                      placeholder="Buscar sucursal..." 
                      className="h-9 w-full sm:w-64 rounded-full border border-white/5 bg-white/[0.03] pl-9 pr-4 text-[12px] text-light placeholder:text-dim focus:border-pink-glow/30 focus:outline-none transition-all"
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
                        <th className="px-3 py-2.5 sm:px-6 sm:py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Sucursal</th>
                        <th className="px-3 py-2.5 sm:px-6 sm:py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Zona</th>
                        <th className="px-3 py-2.5 sm:px-6 sm:py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Ventas Hoy</th>
                        <th className="px-3 py-2.5 sm:px-6 sm:py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Ocupación</th>
                        <th className="px-3 py-2.5 sm:px-6 sm:py-4 text-[10px] font-bold uppercase tracking-widest text-dim">Estado</th>
                        <th className="px-3 py-2.5 sm:px-6 sm:py-4 text-[10px] font-bold uppercase tracking-widest text-dim"></th>
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
                            <td className="px-3 py-2.5 sm:px-6 sm:py-4">
                              <div className="flex flex-col">
                                <span className="font-medium text-light group-hover:text-pink-glow transition-colors">{res.name}</span>
                                <span className="text-[10px] text-dim font-mono">{res.id.slice(0, 8)}</span>
                              </div>
                            </td>
                            <td className="px-3 py-2.5 sm:px-6 sm:py-4 text-[12px] text-dim">{res.zoneName}</td>
                            <td className="px-3 py-2.5 sm:px-6 sm:py-4 font-mono text-[13px] text-light">{fmt(res.todayRevenue)}</td>
                            <td className="px-3 py-2.5 sm:px-6 sm:py-4">
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
                            <td className="px-3 py-2.5 sm:px-6 sm:py-4">
                              <span className="flex items-center gap-1.5 rounded-full bg-emerald-400/10 px-2 py-0.5 text-[9px] font-bold text-emerald-400 border border-emerald-400/20">
                                <span className="h-1 w-1 rounded-full bg-emerald-400" />
                                ACTIVA
                              </span>
                            </td>
                            <td className="px-3 py-2.5 sm:px-6 sm:py-4 text-right">
                              <button
                                onClick={() => router.push(`/cadena/restaurantes/${res.id}`)}
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-white/5 bg-white/[0.02] text-dim hover:bg-white/10 hover:text-light transition-all focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
                                aria-label={`Ver detalle de ${res.name}`}
                              >
                                <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
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
          </MobileTabPillsPanel>
          <MobileTabPillsPanel value="STAFF">
            <div className="flex flex-1 flex-col gap-6 overflow-hidden">
              <div className="flex items-end justify-between px-2">
                <div>
                  <p className={SECTION}>STAFF</p>
                  <p className={`${SUBLABEL} mt-0.5`}>Recursos humanos</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim" />
                    <input 
                      type="text" 
                      placeholder="Buscar personal..." 
                      className="h-9 w-full sm:w-64 rounded-full border border-white/5 bg-white/[0.03] pl-9 pr-4 text-[12px] text-light placeholder:text-dim focus:border-pink-glow/30 focus:outline-none transition-all"
                    />
                  </div>
                  <button className="flex h-9 items-center gap-2 rounded-full border border-white/5 bg-white/[0.03] px-4 text-[12px] text-dim hover:bg-white/10 hover:text-light transition-all focus-visible:ring-2 focus-visible:ring-ring touch-manipulation">
                    <Mail className="h-3.5 w-3.5" aria-hidden="true" />
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
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
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
                            <button className="text-dim hover:text-light transition-colors focus-visible:ring-2 focus-visible:ring-ring touch-manipulation" aria-label="Editar colaborador">
                              <Pencil className="h-3.5 w-3.5" aria-hidden="true" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </MobileTabPillsPanel>
          <MobileTabPillsPanel value="ZONES_MAP">
            <div className="flex flex-1 flex-col overflow-hidden rounded-[32px] border border-white/10 bg-ink relative min-h-[200px] sm:min-h-[350px]">
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
                        width={28}
                        anchor={coords}
                        onClick={() => router.push(`/cadena/restaurantes/${rest.id}`)}
                        className="w-7 h-7 sm:w-10 sm:h-10"
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
                  className="flex h-10 items-center gap-2 rounded-full bg-ink/80 backdrop-blur-md border border-white/10 px-4 text-[12px] font-medium text-light hover:bg-ink transition-all focus-visible:ring-2 focus-visible:ring-ring touch-manipulation"
                >
                  <ArrowRight className="h-4 w-4 rotate-180" aria-hidden="true" />
                  Volver a Lista
                </button>
                <div className="flex flex-col gap-1 rounded-2xl bg-ink/80 backdrop-blur-md border border-white/10 p-3 shadow-2xl">
                  <p className="text-[9px] font-bold uppercase tracking-widest text-dim">Radar Operativo</p>
                  <p className="text-[11px] text-light">{data.restaurants.length} sucursales fijadas</p>
                </div>
              </div>

              <div className="absolute bottom-6 right-6 z-10 flex flex-col overflow-hidden rounded-xl border border-white/10 bg-ink/80 backdrop-blur-md">
                <button onClick={() => setMapZoom(z => Math.min(18, z + 1))} className="flex h-10 w-10 items-center justify-center text-lg text-light hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-ring touch-manipulation" aria-label="Acercar mapa">+</button>
                <button onClick={() => setMapZoom(z => Math.max(1, z - 1))} className="flex h-10 w-10 items-center justify-center text-lg text-light hover:bg-white/10 border-t border-white/10 focus-visible:ring-2 focus-visible:ring-ring touch-manipulation" aria-label="Alejar mapa">−</button>
              </div>
            </div>
          </MobileTabPillsPanel>
        </main>
      </div>
      </MobileTabPills>

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
