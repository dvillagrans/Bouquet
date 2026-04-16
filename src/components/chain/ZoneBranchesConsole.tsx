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
      className={`group w-full text-left rounded-2xl border p-4 transition-colors ${
        active
          ? "border-gold/40 bg-gold-faint/30"
          : "border-border-main bg-bg-card/30 hover:border-border-bright hover:bg-bg-hover/60"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate font-serif text-[16px] font-semibold tracking-tight text-text-primary">
            {r.name}
          </p>
          <p className="mt-1 truncate text-[11px] text-text-dim">{r.address || "Sin dirección"}</p>
          <div className="mt-3 grid grid-cols-3 gap-2">
            <div className="rounded-xl border border-border-main bg-bg-solid/55 px-2 py-2">
              <p className="font-mono text-[11px] tabular-nums text-gold">{fmtMoney(r.todayRevenue)}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-text-faint">Ventas</p>
            </div>
            <div className="rounded-xl border border-border-main bg-bg-solid/55 px-2 py-2">
              <p className="font-mono text-[11px] tabular-nums text-text-secondary">
                {r.activeTables}/{r.totalTables}
              </p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-text-faint">Mesas</p>
            </div>
            <div className="rounded-xl border border-border-main bg-bg-solid/55 px-2 py-2">
              <p className="font-mono text-[11px] tabular-nums text-text-secondary">{r.activeStaff}</p>
              <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-text-faint">Staff</p>
            </div>
          </div>
        </div>

        <div className="shrink-0 space-y-3">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border-main bg-bg-solid/60 px-2.5 py-1 text-[10px] text-text-dim">
            <CircleDot className="size-3 text-gold/70" aria-hidden />
            {pct}% ocup.
          </span>
          <div className="w-24 rounded-full bg-bg-solid ring-1 ring-border-main overflow-hidden">
            <div
              className={`h-2 bg-gradient-to-r ${tone}`}
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="inline-flex items-center gap-1.5 text-[10px] text-text-faint">
            Ver detalle <ArrowRight className="size-3.5 opacity-70 group-hover:translate-x-0.5 transition-transform" aria-hidden />
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
    if (!selectedId) setSelectedId(data.restaurants[0].id);
  }, [data?.restaurants, selectedId]);

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

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatPill label="Ventas zonales" value={fmtMoney(data.stats.totalRevenue)} icon={TrendingUp} />
          <StatPill label="Mesas activas" value={String(data.stats.activeTables)} icon={CircleDot} />
          <StatPill label="Staff en turno" value={String(data.stats.staffCount)} icon={Users} />
          <StatPill label="Sucursales" value={String(data.restaurants.length)} icon={Building2} />
        </div>

        <div className="mb-6 flex flex-col gap-3 rounded-2xl border border-border-main bg-bg-card/35 p-4 backdrop-blur-md sm:flex-row sm:items-center">
          <div className="flex min-w-0 flex-1 items-center gap-2">
            <Search className="size-4 shrink-0 text-gold/70" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar por nombre o dirección…"
              className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-faint"
            />
          </div>
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-faint">
            {filtered.length}/{data.restaurants.length} visibles
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

          <aside className="space-y-4 rounded-2xl border border-border-main bg-bg-card/35 p-6 backdrop-blur-md">
            <h2 className="font-serif text-lg text-text-primary">Detalle rápido</h2>
            {selected ? (
              <>
                <p className="font-serif text-xl text-text-primary">{selected.name}</p>
                <p className="text-[12px] text-text-dim">{selected.address || "Sin dirección registrada"}</p>
                <div className="mt-3 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-text-dim">
                    <span>Ventas hoy</span>
                    <span className="font-medium text-gold">{fmtMoney(selected.todayRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-dim">
                    <span>Sesiones</span>
                    <span className="font-mono text-text-secondary">{selected.todaySessions}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-dim">
                    <span>Mesas</span>
                    <span className="font-mono text-text-secondary">
                      {selected.activeTables}/{selected.totalTables} ({occPct(selected.activeTables, selected.totalTables)}%)
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-dim">
                    <span>Staff activo</span>
                    <span className="font-mono text-text-secondary">{selected.activeStaff}</span>
                  </div>
                </div>
                <Link
                  href={`/dashboard/impersonate/${selected.id}`}
                  className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold-faint/40 px-4 py-2.5 text-[12px] font-semibold text-gold transition-colors hover:border-gold/60 hover:bg-gold-faint/70"
                >
                  Abrir dashboard de sucursal
                  <ArrowRight className="size-4" aria-hidden />
                </Link>
                <p className="mt-3 text-[10px] text-text-faint">
                  Nota: esto cambia la sucursal activa del dashboard.
                </p>
              </>
            ) : (
              <p className="text-[12px] text-text-dim">Selecciona una sucursal de la lista.</p>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

