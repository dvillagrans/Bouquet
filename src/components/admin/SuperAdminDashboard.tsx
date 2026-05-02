"use client";

import { useState, useEffect } from "react";
import { Plus, RefreshCw, Pencil, UserCog, Archive, Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getSuperAdminDashboard, archiveTenant, type SuperAdminDashboardData } from "@/actions/admin";
import { CreateTenantDialog } from "@/components/admin/CreateTenantDialog";
import { EditTenantDialog } from "@/components/admin/EditTenantDialog";
import { ChangeAdminDialog } from "@/components/admin/ChangeAdminDialog";
import { SuperKpiCard } from "@/components/admin/SuperKpiCard";
import { Sparkline } from "@/components/admin/Sparkline";
import { LiveDot } from "@/components/admin/LiveDot";
import { AdminAvatar } from "@/components/admin/AdminAvatar";
import { NavRow } from "@/components/admin/NavRow";

// ─── Mock data (Stage 2 → real API) ───

const mockOrdersHourly = [120, 180, 240, 320, 410, 480, 520, 560, 610, 680, 720, 790, 840, 890, 920, 950, 980, 1020, 1100, 1180, 1240, 1290, 1320, 1340];

// TODO: Connect to real alert/incident API
const mockAlerts = [
  { sev: "crit" as const, area: "Sync · Puerto Madero", msg: "Sync caído > 8m", time: "21:39", link: "TENANT" },
  { sev: "warn" as const, area: "Latencia KDS", msg: "p95 1.2s en sucursal Recoleta", time: "21:42", link: "INFRA" },
  { sev: "warn" as const, area: "Pago Mercadolibre", msg: "Errores 3.2% (umbral 1%)", time: "21:35", link: "PAYM" },
  { sev: "info" as const, area: "Nuevo local", msg: "Activado en Don Julio Group", time: "21:18", link: "TENANT" },
  { sev: "info" as const, area: "Sistema", msg: "Deploy v4.12 completado", time: "20:52", link: "DEPLOY" },
];

const sevStyles = {
  crit: { bg: "bg-dash-red-bg", fg: "text-pink-light-glow", line: "bg-pink-light-glow", pulse: true },
  warn: { bg: "bg-dash-amber-bg/50", fg: "text-dash-amber", line: "bg-dash-amber", pulse: false },
  info: { bg: "bg-dash-blue-bg", fg: "text-dash-blue", line: "bg-dash-blue", pulse: false },
};

// TODO: Connect to real regional distribution API
const mockRegions = [
  { code: "AR · BA", locales: 142, pct: 0.46, color: "var(--color-pink-glow)" },
  { code: "AR · CBA", locales: 38, pct: 0.12, color: "var(--color-rose-light)" },
  { code: "MX · CDMX", locales: 64, pct: 0.21, color: "var(--color-dash-blue)" },
  { code: "MX · MTY", locales: 28, pct: 0.09, color: "#93C5FD" },
  { code: "UY · MVD", locales: 24, pct: 0.08, color: "var(--color-dash-green)" },
  { code: "OTROS", locales: 16, pct: 0.04, color: "var(--color-dim)" },
];

// TODO: Connect to real infrastructure health API
const mockServices = [
  { name: "API · core", up: 99.99, ms: 42, ok: true },
  { name: "Realtime · WS", up: 99.97, ms: 18, ok: true },
  { name: "KDS · gateway", up: 99.82, ms: 280, ok: true },
  { name: "Pagos · MP", up: 96.80, ms: 320, ok: false },
  { name: "Pagos · Stripe", up: 99.95, ms: 110, ok: true },
  { name: "Search", up: 99.91, ms: 64, ok: true },
];

// ─── Helpers ───

function fmtCurrency(n: number) {
  return "$" + n.toLocaleString("en-US", { minimumFractionDigits: 0 });
}

function fmtShort(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(0) + "k";
  return String(n);
}

function pctDiff(current: number, previous: number): string {
  if (!previous) return "+0%";
  const pct = ((current - previous) / previous) * 100;
  const sign = pct >= 0 ? "+" : "";
  return `${sign}${pct.toFixed(1)}%`;
}

// ─── Dashboard Skeleton ───

function DashboardSkeleton() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-5">
      <div className="grid grid-cols-4 gap-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-[160px] animate-pulse rounded-[22px] border border-wire bg-white/[0.02]" />
        ))}
      </div>
      <div className="grid flex-1 grid-cols-[1.3fr_0.95fr_0.85fr] gap-3">
        <div className="animate-pulse rounded-[22px] border border-wire bg-white/[0.02]" />
        <div className="animate-pulse rounded-[22px] border border-wire bg-white/[0.02]" />
        <div className="animate-pulse rounded-[22px] border border-wire bg-white/[0.02]" />
      </div>
    </div>
  );
}

// ─── Main Component ───

export default function SuperAdminDashboard() {
  const [data, setData] = useState<SuperAdminDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isCreatingTenant, setIsCreatingTenant] = useState(false);

  const [editChain, setEditChain] = useState<{ id: string; name: string; currency: string } | null>(null);
  const [changeAdminChainId, setChangeAdminChainId] = useState<string | null>(null);
  const [changeAdminChainName, setChangeAdminChainName] = useState("");
  const [archiveConfirm, setArchiveConfirm] = useState<{ id: string; name: string } | null>(null);
  const [archiveConfirmText, setArchiveConfirmText] = useState("");
  const [archiving, setArchiving] = useState(false);

  const load = async () => {
    try {
      const res = await getSuperAdminDashboard();
      setData(res);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 60000);
    return () => clearInterval(iv);
  }, []);

  const handleArchive = async () => {
    if (!archiveConfirm) return;
    if (archiveConfirmText.trim() !== archiveConfirm.name) return;
    setArchiving(true);
    try {
      await archiveTenant(archiveConfirm.id);
      setArchiveConfirm(null);
      setArchiveConfirmText("");
      await load();
    } catch (err) {
      console.error(err);
    } finally {
      setArchiving(false);
    }
  };

  const now = new Date();
  const dateLabel = now
    .toLocaleDateString("es-AR", { weekday: "short", day: "2-digit", month: "short", year: "numeric" })
    .toUpperCase()
    .replace(/\./g, "");
  const timeLabel = now.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit", hour12: false });

  return (
    <div className="relative flex min-h-screen bg-ink font-sans text-[13px] text-light antialiased selection:bg-pink-glow/20">
      {/* ── Atmosphere ── */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse 60% 40% at 80% 0%, rgba(244,114,182,0.18), transparent 60%), radial-gradient(ellipse 50% 50% at 0% 100%, rgba(167,243,208,0.04), transparent 60%)",
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
              CONTROL · GOD
            </div>
          </div>
        </div>

        {/* View selector */}
        <button
          type="button"
          className="rounded-[10px] border border-pink-glow/20 bg-pink-glow/8 px-3 py-2.5 text-left transition-colors hover:bg-pink-glow/12"
        >
          <div className="text-[8.5px] font-bold uppercase tracking-[0.3em] text-pink-glow">
            VISTA
          </div>
          <div className="mt-1 flex items-center justify-between text-[13px] font-medium text-light">
            Toda la red
            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
              <path d="M2 4l4 4 4-4" stroke="var(--color-dim)" strokeWidth="1.4" />
            </svg>
          </div>
          <div className="mt-0.5 font-mono text-[10px] text-dim">
            {data ? `${data.stats.chains} cadenas · ${data.stats.restaurants} locales` : "…"}
          </div>
        </button>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5">
          <div className="px-3 pb-2 pt-1 text-[8.5px] font-bold uppercase tracking-[0.3em] text-dim">
            OVERVIEW
          </div>
          <NavRow label="Control" active badge={null} />
          <NavRow label="Cadenas" badge={data ? String(data.stats.chains) : "…"} />
          <NavRow label="Locales" badge={data ? String(data.stats.restaurants) : "…"} />
          <NavRow label="Usuarios" badge="…" />

          <div className="px-3 pb-2 pt-4 text-[8.5px] font-bold uppercase tracking-[0.3em] text-dim">
            SISTEMA
          </div>
          <NavRow label="Infraestructura" badge={null} />
          <NavRow label="Pagos" badge={null} />
          <NavRow label="Integraciones" badge={null} />
          <NavRow label="Despliegues" badge={null} />
          <NavRow label="Auditoría" badge={null} />

          <div className="px-3 pb-2 pt-4 text-[8.5px] font-bold uppercase tracking-[0.3em] text-dim">
            NEGOCIO
          </div>
          <NavRow label="Facturación" badge={null} />
          <NavRow label="Plans & SLAs" badge={null} />
        </nav>

        <div className="flex-1" />

        {/* Status footer */}
        <div className="border-t border-wire pt-3 font-mono text-[10px] text-dim">
          <div className="flex items-center gap-1.5">
            <span
              className="inline-block h-1.5 w-1.5 rounded-full bg-dash-green"
              style={{ boxShadow: "0 0 6px var(--color-dash-green)" }}
            />
            <span className="text-light">ALL SYSTEMS</span>
          </div>
          <div className="mt-1 opacity-70">us-east-1 · prod</div>
        </div>
      </aside>

      {/* ═══════ MAIN ═══════ */}
      <div className="relative z-10 flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* ── Header ── */}
        <header className="flex items-end justify-between border-b border-wire px-6 py-4">
          <div>
            <p className="font-mono text-[10px] tracking-[0.25em] text-dim">
              {dateLabel} · {timeLabel} · CONTROL CENTER
            </p>
            <h1 className="mt-1.5 font-serif text-[28px] font-medium leading-[1.05] tracking-[-0.015em] text-light">
              Toda la{" "}
              <span className="italic text-pink-glow">red</span>, una pantalla.
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            <span
              className="inline-flex items-center gap-1.5 rounded-full bg-dash-red-bg px-2.5 py-1 font-mono text-[10px] font-bold tracking-[0.12em] text-pink-light-glow"
            >
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-pink-light-glow" />
              1 INCIDENTE
            </span>
            <LiveDot />

            <div className="bq-glass flex items-center gap-2.5 rounded-full px-3.5 py-2 text-[12px] text-dim">
              <Search className="h-3 w-3 shrink-0" />
              <span className="min-w-[140px]">Buscar cadena, local…</span>
              <span className="rounded bg-white/[0.06] px-1.5 py-0.5 font-mono text-[9.5px] text-light">
                ⌘K
              </span>
            </div>

            <button
              onClick={() => {
                setLoading(true);
                load();
              }}
              disabled={loading}
              className="hidden h-9 w-9 items-center justify-center rounded-xl border border-white/10 text-dim transition-colors hover:border-white/20 hover:text-light disabled:opacity-40 sm:flex"
              title="Actualizar"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              onClick={() => setIsCreatingTenant(true)}
              className="inline-flex h-9 items-center gap-1.5 rounded-full bg-white px-3.5 text-[12px] font-semibold text-ink transition-all hover:bg-white/90 active:scale-95"
            >
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">Añadir</span>
            </button>

            <AdminAvatar initials="MN" />
          </div>
        </header>

        {/* ── Content ── */}
        <main className="flex flex-1 flex-col gap-3 overflow-y-auto p-5">
          {!data ? (
            <DashboardSkeleton />
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key="loaded"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-1 flex-col gap-3"
              >
                {/* ── KPI Strip ── */}
                <motion.section
                  initial="hidden"
                  animate="show"
                  variants={{
                    hidden: { opacity: 0 },
                    show: { opacity: 1, transition: { staggerChildren: 0.08 } },
                  }}
                  className="grid grid-cols-4 gap-3"
                >
                  <SuperKpiCard
                    label="MRR · RED"
                    value={`$${fmtShort(data.stats.mrr)}`}
                    delta="+8.2%"
                    deltaTone="green"
                    unit="USD · {month}"
                    trend={[180, 200, 220, 240, 250, 260, 265, 272, 280, 284]}
                    accent="pink"
                    delay={0}
                  />
                  <SuperKpiCard
                    label="CADENAS B2B"
                    value={String(data.stats.chains)}
                    delta="+2"
                    deltaTone="green"
                    unit="TENANTS ACTIVOS"
                    trend={[36, 37, 38, 39, 40, 40, 41, 41, 42, 42]}
                    accent="blue"
                    delay={80}
                  />
                  <SuperKpiCard
                    label="LOCALES"
                    value={String(data.stats.restaurants)}
                    delta="+12"
                    deltaTone="green"
                    unit="SUCURSALES · UP"
                    trend={[304, 306, 308, 309, 310, 311, 312, 312, 312, 311, 312]}
                    accent="pink"
                    delay={160}
                  />
                  <SuperKpiCard
                    label="ZONAS SERVIDAS"
                    value={String(data.stats.zones)}
                    delta="+4"
                    deltaTone="green"
                    unit="DENSIDAD GEOGRÁFICA"
                    trend={[58, 60, 62, 64, 65, 66, 68, 70, 71, 72]}
                    accent="green"
                    delay={240}
                  />
                </motion.section>

                {/* ── Lower Grid (3 cols) ── */}
                <div className="grid flex-1 grid-cols-[1.3fr_0.95fr_0.85fr] gap-3">
                  {/* ── CHAINS LEAGUE TABLE ── */}
                  <div className="bq-card flex flex-col overflow-hidden !p-0">
                    <div className="flex items-end justify-between border-b border-wire px-4 py-3.5">
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                          CADENAS · TOP PERFORMERS
                        </p>
                        <p className="mt-0.5 font-serif text-[20px] font-medium leading-tight text-light">
                          El <span className="italic text-pink-glow">ramo</span>
                        </p>
                      </div>
                      <div className="flex gap-1 rounded-full border border-white/[0.06] bg-white/[0.02] p-0.5">
                        {["GMV", "MRR", "LOCALES"].map((t, i) => (
                          <button
                            key={t}
                            type="button"
                            className={`rounded-full px-2.5 py-1 font-mono text-[9.5px] tracking-[0.12em] transition-colors ${
                              i === 0
                                ? "bg-pink-glow font-bold text-burgundy-dark"
                                : "font-medium text-dim hover:text-light"
                            }`}
                          >
                            {t}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Table header */}
                    <div
                      className="grid items-center gap-2 border-b border-white/[0.04] px-4 py-2.5 font-mono text-[9px] tracking-[0.2em] text-dim"
                      style={{ gridTemplateColumns: "14px minmax(0,1fr) 28px 36px 52px 52px 44px 44px" }}
                    >
                      <span>#</span>
                      <span>CADENA</span>
                      <span />
                      <span className="text-right">LOC</span>
                      <span className="text-right">MRR</span>
                      <span className="text-right">GMV</span>
                      <span>HEALTH</span>
                      <span className="text-right">ACCIONES</span>
                    </div>

                    {/* Chains rows */}
                    <div className="flex-1 overflow-hidden">
                      {data.chains.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-[13px] text-dim">
                          Sin cadenas aún. Añade la primera.
                        </div>
                      ) : (
                        data.chains.map((chain, i) => {
                          const initials = chain.name.substring(0, 1).toUpperCase();
                          const hue = (i * 55 + 340) % 360;
                          const mockHealth = 0.85 + Math.random() * 0.14; // TODO: real health metric
                          const mockTrend = Array.from({ length: 10 }, () => 20 + Math.random() * 80); // TODO: real trend data

                          return (
                            <div
                              key={chain.id}
                              className="group grid items-center gap-2 border-b border-white/[0.04] px-4 py-2.5 text-[12px] text-light transition-colors hover:bg-white/[0.015]"
                              style={{
                                gridTemplateColumns: "14px minmax(0,1fr) 28px 36px 52px 52px 44px 44px",
                                animation: `dash-row-enter 500ms ${i * 60}ms var(--ease, ease) both`,
                              }}
                            >
                              <span className="font-mono text-[10px] text-dim">
                                {String(i + 1).padStart(2, "0")}
                              </span>
                              <span className="flex min-w-0 items-center gap-2">
                                <span
                                  className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] font-mono text-[9px] font-bold tracking-[-0.02em] text-ink"
                                  style={{
                                    background: `linear-gradient(135deg, hsl(${hue} 60% 60%) 0%, hsl(${hue} 60% 40%) 100%)`,
                                  }}
                                >
                                  {initials}
                                </span>
                                <span className="min-w-0 truncate font-medium">{chain.name}</span>
                              </span>
                              <Sparkline data={mockTrend} w={28} h={18} color="var(--color-dash-green)" />
                              <span className="font-mono tabular-nums text-right">{chain.restaurantsCount}</span>
                              <span className="font-mono tabular-nums text-right text-dim">
                                {/* TODO: real MRR per chain */}
                                ${fmtShort(chain.restaurantsCount * 800)}
                              </span>
                              <span className="font-mono tabular-nums text-right font-semibold">
                                {/* TODO: real GMV per chain */}
                                ${fmtShort(chain.restaurantsCount * 3200)}
                              </span>
                              <span className="flex items-center gap-1.5">
                                <span className="h-1 flex-1 overflow-hidden rounded-full bg-white/[0.06]">
                                  <span
                                    className="block h-full rounded-full"
                                    style={{
                                      width: `${mockHealth * 100}%`,
                                      background:
                                        mockHealth > 0.9
                                          ? "var(--color-dash-green)"
                                          : mockHealth > 0.85
                                            ? "var(--color-dash-amber)"
                                            : "var(--color-pink-light-glow)",
                                    }}
                                  />
                                </span>
                              </span>
                              <span className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                                <a
                                  href={`/cadena?tenantId=${chain.id}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="grid h-7 w-7 place-items-center rounded-lg text-dim transition-colors hover:bg-white/10 hover:text-light"
                                  title="Entrar"
                                >
                                  <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                                    <path d="M3 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                                  </svg>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => setEditChain({ id: chain.id, name: chain.name, currency: chain.currency || "MXN" })}
                                  className="grid h-7 w-7 place-items-center rounded-lg text-dim transition-colors hover:bg-white/10 hover:text-light"
                                  title="Editar"
                                >
                                  <Pencil className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setChangeAdminChainId(chain.id);
                                    setChangeAdminChainName(chain.name);
                                  }}
                                  className="grid h-7 w-7 place-items-center rounded-lg text-dim transition-colors hover:bg-white/10 hover:text-light"
                                  title="Cambiar admin"
                                >
                                  <UserCog className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setArchiveConfirm({ id: chain.id, name: chain.name })}
                                  className="grid h-7 w-7 place-items-center rounded-lg text-dim transition-colors hover:bg-red-500/10 hover:text-red-400"
                                  title="Dar de baja"
                                >
                                  <Archive className="h-3 w-3" />
                                </button>
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Table footer */}
                    <div className="flex items-center justify-between border-t border-wire bg-white/[0.015] px-4 py-2.5">
                      <span className="font-mono text-[10px] tracking-[0.2em] text-dim">
                        {data.chains.length} / {data.stats.chains} CADENAS
                      </span>
                      <button
                        type="button"
                        onClick={() => setIsCreatingTenant(true)}
                        className="font-mono text-[10px] font-bold tracking-[0.2em] text-pink-glow transition-colors hover:text-pink-light-glow"
                      >
                        AÑADIR ↗
                      </button>
                    </div>
                  </div>

                  {/* ── MIDDLE: Alerts ── */}
                  <div className="flex flex-col gap-3">
                    {/* GMV mini card */}
                    <div className="bq-card p-4">
                      <div className="flex items-end justify-between">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                            GMV · 24H
                          </p>
                          <p className="mt-0.5 font-serif text-[17px] font-medium leading-tight text-light">
                            Flujo <span className="italic text-pink-glow">continuo</span>
                          </p>
                        </div>
                        <span className="font-mono text-[18px] font-bold tabular-nums text-light">$1.28M</span>
                      </div>
                      <div className="mt-2.5">
                        <Sparkline data={mockOrdersHourly} w={320} h={70} fill color="var(--color-pink-glow)" />
                      </div>
                      <div className="mt-1 flex justify-between font-mono text-[9px] text-dim">
                        <span>00h</span>
                        <span>06h</span>
                        <span>12h</span>
                        <span>18h</span>
                        <span>24h</span>
                      </div>
                    </div>

                    {/* Alerts panel */}
                    <div className="bq-card flex flex-1 flex-col overflow-hidden !p-0">
                      <div className="flex items-end justify-between border-b border-wire px-4 py-3.5">
                        <div>
                          <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                            ALERTAS · 5
                          </p>
                          <p className="mt-0.5 font-serif text-[17px] font-medium leading-tight text-light">
                            <span className="italic text-pink-glow">Espinas</span> a sacar
                          </p>
                        </div>
                        <button
                          type="button"
                          className="rounded-full border border-white/10 px-2.5 py-1 font-mono text-[9px] tracking-[0.12em] text-dim transition-colors hover:text-light"
                        >
                          FILTRAR
                        </button>
                      </div>
                      <div className="flex-1 overflow-hidden">
                        {/* TODO: Connect to real alert management */}
                        {mockAlerts.map((a, i) => {
                          const s = sevStyles[a.sev];
                          return (
                            <div
                              key={i}
                              className="relative flex gap-2.5 border-b border-white/[0.04] px-4 py-2.5"
                              style={{ animation: `dash-row-enter 500ms ${i * 60}ms var(--ease, ease) both` }}
                            >
                              {a.sev === "crit" && (
                                <span className={`absolute inset-y-0 left-0 w-[2px] ${s.line}`} />
                              )}
                              <span
                                className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${s.line} ${
                                  s.pulse ? "animate-pulse" : ""
                                }`}
                                style={s.pulse ? { boxShadow: `0 0 6px var(--color-pink-light-glow)` } : undefined}
                              />
                              <div className="min-w-0 flex-1">
                                <div className="flex items-baseline justify-between gap-2">
                                  <span className="truncate text-[11.5px] font-medium text-light">
                                    {a.area}
                                  </span>
                                  <span className="shrink-0 font-mono text-[9px] text-dim">{a.time}</span>
                                </div>
                                <p className={`mt-0.5 text-[11px] ${s.fg}`}>{a.msg}</p>
                                <p className="mt-0.5 font-mono text-[8.5px] tracking-[0.15em] text-dim">
                                  {a.link} ↗
                                </p>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* ── RIGHT: Regions + System health ── */}
                  <div className="flex flex-col gap-3">
                    {/* Regional split */}
                    <div className="bq-card p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                        DISTRIBUCIÓN · POR REGIÓN
                      </p>
                      <p className="mt-0.5 font-serif text-[17px] font-medium leading-tight text-light">
                        {data.stats.restaurants}{" "}
                        <span className="italic text-pink-glow">locales</span>
                      </p>
                      {/* TODO: Real regional distribution data */}
                      <div className="mt-3 flex h-2 overflow-hidden rounded-full">
                        {mockRegions.map((r) => (
                          <div key={r.code} style={{ flex: r.pct, background: r.color }} />
                        ))}
                      </div>
                      <div className="mt-2.5 flex flex-col gap-1.5">
                        {mockRegions.map((r) => (
                          <div key={r.code} className="flex items-center justify-between text-[11px]">
                            <span className="flex items-center gap-1.5 text-light">
                              <span
                                className="inline-block h-2 w-2 rounded-[2px]"
                                style={{ background: r.color }}
                              />
                              <span className="font-mono text-[10px] tracking-[0.1em]">{r.code}</span>
                            </span>
                            <span className="font-mono tabular-nums text-dim">
                              {r.locales} · {Math.round(r.pct * 100)}%
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* System health */}
                    <div className="bq-card flex flex-1 flex-col p-4">
                      <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-dim">
                        INFRA · STATUS
                      </p>
                      <p className="mt-0.5 font-serif text-[17px] font-medium leading-tight text-light">
                        Salud del <span className="italic text-pink-glow">jardín</span>
                      </p>
                      <div className="mt-3 flex flex-1 flex-col gap-2">
                        {/* TODO: Connect to real infrastructure monitoring */}
                        {mockServices.map((s, i) => (
                          <div
                            key={s.name}
                            className="flex items-center gap-2.5"
                            style={{ animation: `dash-row-enter 500ms ${i * 50}ms var(--ease, ease) both` }}
                          >
                            <span
                              className={`h-1.5 w-1.5 shrink-0 rounded-full ${
                                s.ok ? "bg-dash-green" : "bg-pink-light-glow"
                              }`}
                              style={{
                                boxShadow: s.ok
                                  ? "0 0 4px var(--color-dash-green)"
                                  : "0 0 6px var(--color-pink-light-glow)",
                                animation: s.ok ? "none" : "pulse-slow 1.4s infinite",
                              }}
                            />
                            <span className="flex-1 text-[11px] text-light">{s.name}</span>
                            <span className="font-mono text-[10px] tabular-nums text-dim">
                              {s.up.toFixed(2)}%
                            </span>
                            <span
                              className={`w-[44px] text-right font-mono text-[10px] tabular-nums ${
                                s.ms > 200 ? "text-dash-amber" : "text-dim"
                              }`}
                            >
                              {s.ms}ms
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-3 flex justify-between border-t border-white/[0.04] pt-2.5">
                        <span className="font-mono text-[9px] tracking-[0.15em] text-dim">
                          p95 · 30D
                        </span>
                        <button
                          type="button"
                          className="font-mono text-[9px] tracking-[0.15em] text-pink-glow transition-colors hover:text-pink-light-glow"
                        >
                          STATUS PAGE ↗
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* ── Dialogs ── */}

      <CreateTenantDialog
        open={isCreatingTenant}
        onOpenChange={setIsCreatingTenant}
        onCreated={load}
      />

      <EditTenantDialog
        open={!!editChain}
        onOpenChange={(next) => !next && setEditChain(null)}
        chain={editChain}
        onUpdated={load}
      />

      <ChangeAdminDialog
        open={!!changeAdminChainId}
        onOpenChange={(next) => {
          if (!next) {
            setChangeAdminChainId(null);
            setChangeAdminChainName("");
          }
        }}
        chainId={changeAdminChainId}
        chainName={changeAdminChainName}
        onChanged={load}
      />

      {/* Archive confirm modal */}
      {archiveConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[22px] border border-red-500/20 bg-bg-card p-6 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-red-500/20 bg-red-500/10">
                <svg className="h-5 w-5 text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
                </svg>
              </div>
              <div>
                <h3 className="font-serif text-lg font-bold text-white">Eliminar cadena permanentemente</h3>
                <p className="text-[12px] text-dim">Esta acción no se puede deshacer.</p>
              </div>
            </div>

            <div className="mt-4 space-y-3 rounded-xl border border-red-500/10 bg-red-500/[0.03] p-4">
              <p className="text-[13px] leading-relaxed text-dim">
                Estás por eliminar <strong className="text-white">{archiveConfirm.name}</strong>. Esto desactivará:
              </p>
              <ul className="space-y-1.5 text-[12px] text-dim">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                  Todas las sucursales y zonas asociadas
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                  El acceso de todos los administradores y staff
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-red-400" />
                  Menús, plantillas y configuraciones de la cadena
                </li>
              </ul>
            </div>

            <div className="mt-4 flex flex-col gap-1.5">
              <label htmlFor="confirm-name" className="text-[10px] font-medium tracking-[0.16em] uppercase text-red-400/80">
                Escribe el nombre de la cadena para confirmar
              </label>
              <input
                id="confirm-name"
                type="text"
                autoFocus
                value={archiveConfirmText}
                onChange={(e) => setArchiveConfirmText(e.target.value)}
                placeholder={archiveConfirm.name}
                className="h-10 rounded-md border border-border-bright bg-bg-solid px-3 text-[12px] text-light outline-none placeholder:text-text-faint focus:border-red-400 focus:ring-1 focus:ring-red-400/30"
              />
            </div>

            <div className="mt-5 flex gap-3">
              <button
                type="button"
                disabled={archiving}
                onClick={() => {
                  setArchiveConfirm(null);
                  setArchiveConfirmText("");
                }}
                className="flex-1 rounded-xl border border-border-mid px-4 py-2.5 text-[13px] font-medium text-dim transition-colors hover:text-light"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={archiving || archiveConfirmText.trim() !== archiveConfirm.name}
                onClick={handleArchive}
                className="flex-1 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2.5 text-[13px] font-medium text-red-400 transition-colors hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {archiving ? "Eliminando..." : "Eliminar permanentemente"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
