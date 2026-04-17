"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CircleDot,
  MapPin,
  RefreshCw,
  Search,
  Store,
  TrendingUp,
  Users,
} from "lucide-react";
import { getZoneDashboard } from "@/actions/chain";
import type { RestaurantSummary, ZoneDashboardData } from "@/actions/chain";
import ZoneAuthGuard from "./ZoneAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

function fmtMoney(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function occPct(active: number, total: number) {
  return total > 0 ? Math.round((active / total) * 100) : 0;
}

function occTone(pct: number) {
  if (pct >= 70) return "from-dash-green to-emerald-300/80";
  if (pct >= 40) return "from-gold to-amber-200/80";
  return "from-text-muted to-text-dim";
}

function StatPill({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm">
      <Icon className="absolute right-3 top-3 size-12 text-gold/10" aria-hidden />
      <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">{label}</p>
      <p className="mt-2 font-serif text-2xl text-text-primary">{value}</p>
    </div>
  );
}

function BranchRow({
  r,
  active,
  onSelect,
  reduceMotion,
}: {
  r: RestaurantSummary;
  active: boolean;
  onSelect: () => void;
  reduceMotion: boolean | null;
}) {
  const pct = occPct(r.activeTables, r.totalTables);
  const tone = occTone(pct);

  return (
    <motion.button
      type="button"
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={onSelect}
      className={`group relative w-full text-left rounded-[1.5rem] border p-4 sm:p-5 transition-all duration-300 ease-out active:scale-[0.98] ${
        active
          ? "border-gold/40 bg-gold/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_20px_-8px_rgba(0,0,0,0.4)]"
          : "border-white/5 bg-bg-card/40 hover:border-white/10 hover:bg-white/[0.04]"
      }`}
    >
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="truncate font-serif text-[18px] font-medium tracking-tight text-white">
              {r.name}
            </p>
            {!active && pct < 40 && (
              <span className="inline-flex size-2 mt-0.5 shrink-0 rounded-full bg-dash-red shadow-[0_0_8px_var(--color-dash-red)]" />
            )}
          </div>
          <p className="mt-1 truncate text-[12px] text-neutral-400">{r.address || "Sin dirección"}</p>
          <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
            <div className="rounded-[1rem] border border-white/5 bg-white/[0.03] px-3 py-2">
              <p className="font-mono text-[13px] font-medium tabular-nums text-gold">{fmtMoney(r.todayRevenue)}</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Ventas</p>
            </div>
            <div className="rounded-[1rem] border border-white/5 bg-white/[0.03] px-3 py-2">
              <p className="font-mono text-[13px] font-medium tabular-nums text-white">
                {r.activeTables}/{r.totalTables}
              </p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Mesas</p>
            </div>
            <div className="rounded-[1rem] border border-white/5 bg-white/[0.03] px-3 py-2">
              <p className="font-mono text-[13px] font-medium tabular-nums text-white">{r.activeStaff}</p>
              <p className="mt-1 text-[9px] font-semibold uppercase tracking-[0.15em] text-neutral-500">Staff</p>
            </div>
          </div>
        </div>

        <div className="flex w-full sm:w-auto items-center justify-between sm:flex-col sm:items-end gap-3 sm:space-y-3 rounded-[1rem] sm:rounded-none border sm:border-0 border-white/5 bg-white/[0.02] sm:bg-transparent p-3 sm:p-0">
          <div className="flex sm:flex-col items-center sm:items-end gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-neutral-300">
              <CircleDot className="size-3 text-gold" aria-hidden />
              {pct}% ocup.
            </span>
            <div className="h-1.5 w-24 sm:w-28 overflow-hidden rounded-full bg-white/5 ring-1 ring-white/10">
              <div
                className={`h-full bg-gradient-to-r ${tone} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-neutral-400 group-hover:text-gold transition-colors">
            Ver detalle <ArrowRight className="size-3.5 opacity-70 transition-transform group-hover:translate-x-1" aria-hidden />
          </span>
        </div>
      </div>
    </motion.button>
  );
}

export default function ZoneBranchesConsole({ initialZoneId }: { initialZoneId?: string }) {
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [data, setData] = useState<ZoneDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();
  const isMobile = useIsMobile();

  const load = useCallback(async (zid: string) => {
    try {
      setLoading(true);
      const res = await getZoneDashboard(zid);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!zoneId) return;
    load(zoneId);
    const iv = setInterval(() => load(zoneId), 45000);
    return () => clearInterval(iv);
  }, [zoneId, load]);

  useEffect(() => {
    if (!data?.restaurants?.length) return;
    if (!isMobile && !selectedId) setSelectedId(data.restaurants[0].id);
  }, [data?.restaurants, selectedId, isMobile]);

  const filtered = useMemo(() => {
    const list = data?.restaurants ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((r) => {
      const name = r.name.toLowerCase();
      const addr = (r.address ?? "").toLowerCase();
      return name.includes(needle) || addr.includes(needle);
    });
  }, [data?.restaurants, q]);

  const selected = useMemo(
    () => (data?.restaurants ?? []).find((r) => r.id === selectedId) ?? null,
    [data?.restaurants, selectedId]
  );

  if (!zoneId) {
    return <ZoneAuthGuard zoneId={initialZoneId} onAuthenticated={(zid) => setZoneId(zid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-bg-solid px-4 text-text-dim">
        <motion.div
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className="text-gold/35"
          aria-hidden
        >
          <Building2 className="size-12" strokeWidth={1} />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[0.22em]">Cargando sucursales…</p>
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

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-solid font-sans text-text-primary">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-0 top-0 h-[min(85vh,640px)] w-[min(120vw,900px)] rounded-full bg-[radial-gradient(ellipse_at_top_left,rgba(201,160,84,0.12),transparent_62%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[42vh] w-[60vw] rounded-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(68,114,160,0.07),transparent_58%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--color-border-mid) 1px, transparent 1px), linear-gradient(var(--color-border-mid) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-10 md:px-8 md:pt-14">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-main bg-bg-card/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted">
                <MapPin className="size-3" aria-hidden />
                Zona {data.zone.name}
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold-faint/35 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-gold">
                <Store className="size-3" aria-hidden />
                Consola de sucursales
              </span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-faint">
                Nivel 2 · desempeño regional
              </p>
              <h1 className="mt-2 font-serif text-[clamp(1.9rem,4.8vw,3.2rem)] font-semibold leading-[1.05] tracking-tight">
                Sucursales de <span className="text-gold">{data.zone.name}</span>
              </h1>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-text-muted">
                Busca, compara y abre el dossier operativo de cualquier unidad. Pensado para managers territoriales.
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

        <div className="mb-10 grid gap-4 grid-cols-2 lg:grid-cols-4">
          <StatPill label="Ventas zonales" value={fmtMoney(data.stats.totalRevenue)} icon={TrendingUp} />
          <StatPill label="Mesas activas" value={String(data.stats.activeTables)} icon={CircleDot} />
          <StatPill label="Staff en turno" value={String(data.stats.staffCount)} icon={Users} />
          <StatPill label="Sucursales" value={String(data.restaurants.length)} icon={Building2} />
        </div>

        <div className="mb-8 flex flex-col gap-3 border-b border-border-main/70 pb-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <Search className="size-[18px] shrink-0 text-text-faint" aria-hidden />
            <label htmlFor="zone-branch-search" className="sr-only">
              Buscar sucursales por nombre o dirección
            </label>
            <input
              id="zone-branch-search"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o dirección…"
              className="min-w-0 flex-1 border-0 bg-transparent py-1 text-[14px] text-text-primary outline-none placeholder:text-text-faint"
            />
          </div>
          <p className="shrink-0 text-[12px] leading-snug text-text-muted sm:text-right">
            <span className="tabular-nums font-medium text-text-secondary">{filtered.length}</span>
            <span className="text-text-faint"> de </span>
            <span className="tabular-nums font-medium text-text-secondary">{data.restaurants.length}</span>
            <span className="text-text-faint"> sucursales</span>
            {q.trim() ? <span className="ml-1.5 text-text-faint">· coincidencias</span> : null}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            {filtered.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border-bright/55 bg-bg-card/25 p-10 text-center">
                <p className="font-serif text-lg text-text-secondary">Sin resultados.</p>
                <p className="mt-2 text-[13px] text-text-dim">Intenta con otro término de búsqueda.</p>
              </div>
            ) : (
              filtered.map((r) => (
                <BranchRow
                  key={r.id}
                  r={r}
                  active={r.id === selectedId}
                  onSelect={() => setSelectedId(r.id)}
                  reduceMotion={reduceMotion}
                />
              ))
            )}
          </div>

          <aside className="hidden space-y-5 rounded-[2rem] border border-white/5 bg-neutral-950/40 p-7 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05),0_8px_32px_-8px_rgba(0,0,0,0.5)] backdrop-blur-2xl lg:block lg:sticky lg:top-8 h-fit">
            <h2 className="font-serif text-xl font-medium tracking-tight text-white mb-2">Detalle rápido</h2>
            {selected ? (
              <>
                <p className="font-serif text-[22px] font-semibold text-gold">{selected.name}</p>
                <p className="text-[13px] text-neutral-400">{selected.address || "Sin dirección registrada"}</p>
                <div className="mt-8 space-y-4 rounded-[1.25rem] bg-white/[0.02] p-4 ring-1 ring-white/5">
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-[12px] font-medium text-neutral-400">Ventas hoy</span>
                    <span className="font-mono text-[14px] font-bold text-gold">{fmtMoney(selected.todayRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-[12px] font-medium text-neutral-400">Sesiones</span>
                    <span className="font-mono text-[14px] text-white">{selected.todaySessions}</span>
                  </div>
                  <div className="flex items-center justify-between pb-3 border-b border-white/5">
                    <span className="text-[12px] font-medium text-neutral-400">Mesas activas</span>
                    <span className="font-mono text-[14px] text-white">
                      {selected.activeTables}/{selected.totalTables} ({occPct(selected.activeTables, selected.totalTables)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[12px] font-medium text-neutral-400">Staff activo</span>
                    <span className="font-mono text-[14px] text-white">{selected.activeStaff}</span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/impersonate/${selected.id}`}
                  className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-4 py-3.5 text-[13px] font-semibold tracking-tight text-gold shadow-inner transition-all hover:bg-gold/20 active:scale-[0.98]"
                >
                  Abrir panel de este restaurante
                  <ArrowRight className="size-[1.125rem]" aria-hidden />
                </Link>
                <p className="mt-4 text-center text-[11px] text-neutral-500">
                  Cambiarás temporalmente al contexto de esta unidad.
                </p>
              </>
            ) : (
              <div className="rounded-[1.25rem] border border-dashed border-white/10 p-8 text-center bg-white/[0.02]">
                <p className="text-[13px] text-neutral-400">Selecciona un restaurante de la lista para ver sus métricas detalladas aquí.</p>
              </div>
            )}
          </aside>
        </div>

        {/* Mobile Detail Sheet */}
        <Sheet open={isMobile && !!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="rounded-t-[2rem] border-x-0 border-b-0 border-t border-white/10 bg-neutral-950/80 p-0 backdrop-blur-3xl backdrop-saturate-200 outline-none"
          >
            <div className="absolute left-1/2 top-4 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/20" />
            
            <div className="mx-auto max-w-sm px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-10">
              {selected && (
                <>
                  <SheetHeader className="px-0 pb-6 text-center">
                    <SheetTitle className="font-serif text-[24px] font-medium tracking-tight text-white mb-1">
                      {selected.name}
                    </SheetTitle>
                    <SheetDescription className="text-[13px] text-neutral-400 overflow-hidden text-ellipsis whitespace-nowrap px-4">
                      {selected.address || "Sin dirección registrada"}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-4 rounded-[1.5rem] border border-white/5 bg-white/[0.03] p-5 shadow-inner">
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                      <span className="text-[13px] font-medium text-neutral-400">Ventas hoy</span>
                      <span className="font-mono text-[16px] font-bold tracking-tight text-gold">{fmtMoney(selected.todayRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                      <span className="text-[13px] font-medium text-neutral-400">Sesiones</span>
                      <span className="font-mono text-[14px] text-white">{selected.todaySessions}</span>
                    </div>
                    <div className="flex items-center justify-between pb-3.5 border-b border-white/5">
                      <span className="text-[13px] font-medium text-neutral-400">Ocupación (mesas)</span>
                      <span className="font-mono text-[14px] text-white">
                        {selected.activeTables}/{selected.totalTables} ({occPct(selected.activeTables, selected.totalTables)}%)
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-[13px] font-medium text-neutral-400">Personal activo</span>
                      <span className="font-mono text-[14px] text-white">{selected.activeStaff}</span>
                    </div>
                  </div>

                  <Link
                    href={`/dashboard/impersonate/${selected.id}`}
                    onClick={() => setSelectedId(null)}
                    className="mt-6 flex w-full items-center justify-center gap-2 rounded-full border border-gold/40 bg-gold/10 px-5 py-4 text-[14px] font-semibold tracking-tight text-gold shadow-inner transition-all hover:bg-gold/20 active:scale-[0.96]"
                  >
                    Entrar al dashboard
                    <ArrowRight className="size-[1.25rem] transition-transform group-hover:translate-x-1" aria-hidden />
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

