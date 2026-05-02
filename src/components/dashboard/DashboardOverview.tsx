"use client";

import { usePathname } from "next/navigation";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { memo, useMemo } from "react";
import {
  AlertCircle as WarningCircle,
  Armchair,
  ArrowRight,
  CheckCircle2 as CheckCircle,
  ChefHat,
  Clock,
  Compass,
  DollarSign as CurrencyDollar,
  MapPin,
  Plus,
  QrCode,
  Receipt,
  Store,
  Users as UsersThree,
} from "lucide-react";
import Link from "next/link";
import { resolveNavHref, restaurantBaseFromPathname } from "@/lib/dashboard-nav";
import { PeakHourBar } from "@/components/chain/PeakHourBar";

interface DashboardOverviewProps {
  data: {
    restaurant: { name: string; address: string | null };
    metrics: {
      totalTables: number;
      activeTables: number;
      staffCount: number;
      todayRevenue: number;
      totalOrders: number;
      preparingOrders: number;
      deliveredOrders: number;
      pendingOrders: number;
    };
  };
}

const SPRING = { type: "spring", stiffness: 100, damping: 20 } as const;

const NOISE_SVG =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIj4KICA8ZmlsdGVyIGlkPSJuIj4KICAgIDxmZVR1cmJ1bGVuY2UgdHlwZT0iZnJhY3RhbE5vaXNlIiBiYXNlRnJlcXVlbmN5PSIxLjQiIG51bU9jdGF2ZXM9IjIiIHN0aXRjaFRpbGVzPSJzdGl0Y2giIC8+CiAgPC9maWx0ZXI+CiAgPHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsdGVyPSJ1cmwoI24pIiBvcGFjaXR5PSIwLjA4Ii8+Cjwvc3ZnPg==";

// ─── Sub-components ───

function MetricTile({
  label,
  value,
  sub,
  icon,
  delay,
  reduceMotion,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  delay: number;
  reduceMotion: boolean;
}) {
  const Icon = icon;
  return (
    <motion.article
      initial={reduceMotion ? undefined : { opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ ...SPRING, delay }}
      whileHover={reduceMotion ? undefined : { y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border-main/80 bg-bg-card/50 p-5 shadow-[0_18px_42px_-22px_rgba(12,9,7,0.7)] backdrop-blur-sm"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ backgroundImage: "linear-gradient(120deg, color-mix(in srgb, var(--color-gold) 9%, transparent), transparent 45%)" }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <p className="max-w-[16ch] text-[10px] uppercase tracking-[0.18em] text-text-dim">{label}</p>
        <Icon size={16} className="text-gold/90" />
      </div>
      <p className="relative mt-7 font-mono text-[clamp(1.6rem,3vw,2.2rem)] leading-none tracking-tight text-text-primary">
        {value}
      </p>
      {sub && (
        <p className="relative mt-1.5 text-[10px] uppercase tracking-[0.12em] text-text-faint">{sub}</p>
      )}
    </motion.article>
  );
}

const MemoMetricTile = memo(MetricTile);

function KitchenSignal({
  value,
  label,
  tone,
  icon,
  reduceMotion,
}: {
  value: number;
  label: string;
  tone: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  reduceMotion: boolean;
}) {
  const Icon = icon;
  return (
    <div className="rounded-2xl border border-border-bright/80 bg-bg-solid/55 p-5">
      <motion.div
        animate={reduceMotion ? undefined : { opacity: [0.45, 1, 0.45], y: [0, -2, 0] }}
        transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
        className="mb-4"
      >
        <Icon size={18} className={tone} />
      </motion.div>
      <p className="font-mono text-3xl tracking-tight text-text-primary">{value}</p>
      <p className="mt-2 text-[10px] uppercase tracking-[0.18em] text-text-faint">{label}</p>
    </div>
  );
}

const MemoKitchenSignal = memo(KitchenSignal);

function MagneticCta({ href }: { href: string }) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 18, mass: 0.55 });
  const springY = useSpring(y, { stiffness: 180, damping: 18, mass: 0.55 });

  return (
    <motion.div style={{ x: springX, y: springY }}>
      <Link
        href={href}
        onMouseMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const dx = e.clientX - (r.left + r.width / 2);
          const dy = e.clientY - (r.top + r.height / 2);
          x.set(dx * 0.08);
          y.set(dy * 0.08);
        }}
        onMouseLeave={() => {
          x.set(0);
          y.set(0);
        }}
        className="group mt-7 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-gold/70 bg-gold/90 py-3 text-[11px] font-semibold uppercase tracking-[0.11em] text-bg-solid shadow-[0_16px_36px_-24px_rgba(201,160,84,0.8)] transition-all hover:bg-gold active:scale-[0.98]"
      >
        <span>Plano de piso</span>
        <ArrowRight size={14} aria-hidden="true" className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </motion.div>
  );
}

// ─── Mock data ───

// TODO: replace with real hourly sales API
function generateMockHourlySales() {
  const hours: { hour: string; orders: number }[] = [];
  for (let h = 0; h < 24; h++) {
    let base = 0;
    // Deterministic pseudo-randomness based on hour to avoid hydration mismatch
    const pseudoRand = ((h * 17) % 10) / 10; 
    if (h >= 13 && h <= 15) base = 1800 + pseudoRand * 1200;
    else if (h >= 19 && h <= 21) base = 1400 + pseudoRand * 1000;
    else if (h >= 9 && h <= 11) base = 600 + pseudoRand * 400;
    else base = pseudoRand * 200;
    hours.push({ hour: `${h.toString().padStart(2, "0")}h`, orders: Math.round(base) });
  }
  return hours;
}

// TODO: replace with real activity feed / SSE
const MOCK_ACTIVITY = [
  { type: "comanda" as const, msg: "Mesa 4 · Comanda B-2401 recibida", time: "14:32" },
  { type: "pago" as const, msg: "Mesa 7 · Cobro completado · $840", time: "14:28" },
  { type: "staff" as const, msg: "Carlos inició sesión · Mesero", time: "14:15" },
  { type: "alerta" as const, msg: "Mesa 3 · Sin actividad 45 min", time: "14:10" },
  { type: "comanda" as const, msg: "Mesa 2 · Comanda B-2400 lista", time: "13:58" },
  { type: "pago" as const, msg: "Mesa 5 · Cobro completado · $620", time: "13:44" },
];

const activityIcons: Record<string, { Icon: React.ComponentType<{ size?: number; className?: string }>; tone: string }> = {
  comanda: { Icon: Receipt, tone: "text-gold" },
  pago: { Icon: CurrencyDollar, tone: "text-dash-green" },
  staff: { Icon: UsersThree, tone: "text-dash-blue" },
  alerta: { Icon: WarningCircle, tone: "text-dash-red" },
};

// ─── Main Component ───

export default function DashboardOverview({ data }: DashboardOverviewProps) {
  const pathname = usePathname();
  const restaurantBase = restaurantBaseFromPathname(pathname);
  const { metrics, restaurant } = data;
  const reduceMotion = useReducedMotion() ?? false;
  const occPct = metrics.totalTables > 0 ? (metrics.activeTables / metrics.totalTables) * 100 : 0;

  const fmtMoney = (n: number) =>
    "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const avgTicket = metrics.totalOrders > 0
    ? Math.round(metrics.todayRevenue / metrics.totalOrders)
    : 0;

  // Mock: average service time + hourly sales
  const avgTimeMin = 24; // TODO: real avg service time API
  const mockHourlySales = useMemo(() => generateMockHourlySales(), []);
  const peakEntry = useMemo(() => {
    let max = mockHourlySales[0];
    for (const h of mockHourlySales) {
      if (h.orders > max.orders) max = h;
    }
    return max;
  }, [mockHourlySales]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { ...SPRING } },
  };

  if (!restaurant?.name) {
    return (
      <section className="mx-auto max-w-7xl px-4 py-12 md:px-8">
        <div className="rounded-2xl border border-dash-red/40 bg-dash-red/10 p-6">
          <p className="text-sm font-medium text-dash-red">No se pudo cargar la sucursal activa.</p>
          <p className="mt-1 text-sm text-text-muted">Recarga la vista o vuelve a entrar desde el selector de sucursal.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-[100dvh] bg-bg-solid font-sans text-text-primary">
      {/* ── Atmosphere ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 z-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundRepeat: "repeat" }}
        />
        <div className="absolute -left-56 -top-52 h-[46rem] w-[46rem] rounded-full bg-[radial-gradient(circle,rgba(201,160,84,0.08),transparent_62%)] blur-3xl" />
        <div className="absolute -bottom-40 right-[-12rem] h-[30rem] w-[38rem] rounded-full bg-[radial-gradient(circle,rgba(91,128,116,0.09),transparent_62%)] blur-3xl" />
        {!reduceMotion && (
          <>
            <motion.div
              className="absolute -left-24 top-24 h-52 w-52 rounded-full bg-gold/10 blur-3xl"
              animate={{ x: [0, 30, 0], y: [0, -20, 0], opacity: [0.3, 0.72, 0.3] }}
              transition={{ duration: 8.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
            <motion.div
              className="absolute right-20 top-16 h-44 w-44 rounded-full bg-sage-deep/20 blur-3xl"
              animate={{ x: [0, -25, 0], y: [0, 16, 0], opacity: [0.3, 0.58, 0.3] }}
              transition={{ duration: 9.8, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
            />
          </>
        )}
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-4 py-10 md:px-8 md:py-14 lg:px-12">
        <motion.div
          variants={containerVariants}
          initial={reduceMotion ? "visible" : "hidden"}
          animate="visible"
          className="flex flex-col gap-8 md:gap-10"
        >
          {/* ═══ Header + action buttons ═══ */}
          <motion.header variants={itemVariants} className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-border-main/80 bg-bg-card/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-faint">
              <Store size={13} className="text-gold" />
              Visión Operativa
            </div>
            <h1 className="max-w-[18ch] text-4xl leading-none tracking-tighter text-text-primary md:text-6xl">
              {restaurant.name}
            </h1>
            <div className="flex flex-wrap items-center gap-3">
              {restaurant.address && (
                <p className="flex max-w-[62ch] items-start gap-2 text-sm leading-relaxed text-text-muted">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-text-dim" />
                  {restaurant.address}
                </p>
              )}
              <div className="flex items-center gap-2">
                <Link
                  href={resolveNavHref("/dashboard/mesas", restaurantBase)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-main/80 bg-bg-card/40 px-3 py-1.5 text-[11px] font-medium text-text-dim backdrop-blur-sm transition-colors hover:border-gold/30 hover:text-text-primary"
                >
                  <Plus size={13} />
                  Crear mesa
                </Link>
                <Link
                  href={resolveNavHref("/dashboard/mesas", restaurantBase)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border-main/80 bg-bg-card/40 px-3 py-1.5 text-[11px] font-medium text-text-dim backdrop-blur-sm transition-colors hover:border-gold/30 hover:text-text-primary"
                >
                  <QrCode size={13} />
                  Generar QR
                </Link>
              </div>
            </div>
          </motion.header>

          {/* ═══ KPI Strip (5 cols) ═══ */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-5"
          >
            {[
              { label: "Ventas del día", value: fmtMoney(metrics.todayRevenue), icon: CurrencyDollar, sub: undefined as string | undefined },
              { label: "Mesas ocupadas", value: `${metrics.activeTables} / ${metrics.totalTables}`, icon: Armchair, sub: `${occPct.toFixed(0)}% ocupación` },
              { label: "Ticket promedio", value: fmtMoney(avgTicket), icon: Receipt, sub: "POR COMANDA" },
              { label: "Staff en sala", value: metrics.staffCount.toString(), icon: UsersThree, sub: undefined as string | undefined },
              { label: "Comandas hoy", value: metrics.totalOrders.toString(), icon: CheckCircle, sub: undefined as string | undefined },
            ].map((metric, index) => (
              <MemoMetricTile
                key={metric.label}
                label={metric.label}
                value={metric.value}
                sub={metric.sub}
                icon={metric.icon}
                delay={0.05 * index}
                reduceMotion={reduceMotion}
              />
            ))}
          </motion.div>

          {/* ═══ Lower grid row 1 (3 cols) ═══ */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.5fr_1fr_1fr]">

            {/* ── Pulso de cocina ── */}
            <motion.article
              variants={itemVariants}
              className={`relative overflow-hidden rounded-2xl border border-border-main/80 bg-bg-card/45 p-5 backdrop-blur-sm transition-all duration-300 sm:p-7 ${
                metrics.totalOrders === 0 ? "lg:row-span-1" : ""
              }`}
            >
              <div className="pointer-events-none absolute -right-16 -top-16 rounded-full border border-gold/15 p-16">
                <ChefHat size={70} className="text-gold/10" />
              </div>
              <div className="relative z-10">
                <div className="mb-6 flex items-start justify-between gap-4">
                  <div>
                    <h2 className="flex items-center gap-2 text-xl tracking-tight text-text-primary">
                      <ChefHat size={18} className="text-gold" />
                      Pulso de cocina
                    </h2>
                    <p className="mt-1 text-xs text-text-muted">Estado en tiempo real de los tickets de operación.</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border-main/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-text-faint">
                    <Compass size={12} />
                    Live
                  </span>
                </div>

                {metrics.totalOrders === 0 ? (
                  <div className="flex h-32 items-center justify-center rounded-2xl border border-dashed border-border-main/80 bg-bg-solid/40">
                    <div className="text-center">
                      <ChefHat size={18} className="mx-auto mb-2 text-text-dim/50" />
                      <p className="text-xs text-text-muted">Sin comandas en curso</p>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <MemoKitchenSignal
                      value={metrics.pendingOrders}
                      label="Pendientes"
                      tone="text-dash-red"
                      icon={WarningCircle}
                      reduceMotion={reduceMotion}
                    />
                    <MemoKitchenSignal
                      value={metrics.preparingOrders}
                      label="En fuego"
                      tone="text-gold"
                      icon={Clock}
                      reduceMotion={reduceMotion}
                    />
                    <MemoKitchenSignal
                      value={metrics.deliveredOrders}
                      label="Despachados"
                      tone="text-dash-green"
                      icon={CheckCircle}
                      reduceMotion={reduceMotion}
                    />
                  </div>
                )}
              </div>
            </motion.article>

            {/* ── Densidad de piso ── */}
            <motion.article variants={itemVariants} className="rounded-2xl border border-border-main/80 bg-bg-card/45 p-6 backdrop-blur-sm">
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-text-dim">Densidad de piso</h2>

              {metrics.totalTables === 0 ? (
                <div className="mt-6 rounded-2xl border border-dashed border-border-main/80 bg-bg-solid/40 p-5">
                  <p className="text-sm text-text-primary">Aún no hay mesas configuradas.</p>
                  <p className="mt-1 text-xs text-text-muted">Configura el plano para habilitar ocupación y monitoreo en sala.</p>
                </div>
              ) : (
                <>
                  <div className="relative mx-auto mt-7 size-40 rounded-full border border-border-bright/70 bg-bg-solid/70 p-[3px] shadow-[inset_0_1px_0_rgba(255,255,255,0.08),inset_0_0_30px_rgba(0,0,0,0.45)]">
                    <motion.div
                      className="size-full rounded-full"
                      animate={reduceMotion ? undefined : { rotate: [0, 360] }}
                      transition={{ duration: 22, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
                      style={{
                        background: `conic-gradient(var(--color-gold) ${occPct * 3.6}deg, color-mix(in srgb, var(--color-border-main) 85%, transparent) 0deg)`,
                      }}
                    />
                    <div className="absolute inset-[12px] flex items-center justify-center rounded-full border border-white/10 bg-bg-card shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
                      <span className="font-mono text-4xl leading-none tracking-tight text-text-primary">
                        {occPct.toFixed(0)}
                        <span className="ml-0.5 text-lg text-text-dim">%</span>
                      </span>
                    </div>
                  </div>

                  <p className="mt-6 text-sm leading-relaxed text-text-muted">
                    Capacidad utilizada: <span className="font-mono text-text-primary">{metrics.activeTables}</span> de <span className="font-mono text-text-primary">{metrics.totalTables}</span> mesas configuradas.
                  </p>
                </>
              )}

              <MagneticCta href={resolveNavHref("/dashboard/mesas", restaurantBase)} />
            </motion.article>

            {/* ── Tiempo promedio + Staff ── */}
            <motion.article
              variants={itemVariants}
              className="flex flex-col gap-4 rounded-2xl border border-border-main/80 bg-bg-card/45 p-6 backdrop-blur-sm"
            >
              {/* Tiempo promedio */}
              <div>
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-text-dim">
                  Tiempo promedio · hoy
                </h2>
                <p className="mt-4 font-mono text-[2.5rem] leading-none tracking-tight text-text-primary">
                  {avgTimeMin}
                  <span className="ml-1 text-xl text-text-dim">min</span>
                </p>
                <p className="mt-2 text-xs text-text-muted">
                  por mesa · desde seated hasta cobro
                </p>
                <p className="mt-3 inline-flex items-center gap-1 rounded-full bg-dash-green/10 px-2 py-0.5 text-[10px] font-medium text-dash-green">
                  <ArrowRight size={10} className="-rotate-45" />
                  3 min vs ayer
                </p>
                <p className="mt-3 text-[9px] text-text-faint">
                  {/* TODO: real avg service time API */} estimado
                </p>
              </div>

              {/* Staff summary */}
              <div className="mt-auto rounded-xl border border-border-main/80 bg-bg-solid/40 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">Personal activo</span>
                  <span className="font-mono text-lg tabular-nums text-text-primary">
                    {metrics.staffCount}
                  </span>
                </div>
                <p className="mt-1 text-[10px] text-text-faint">en sala ahora</p>
              </div>
            </motion.article>
          </div>

          {/* ═══ Lower grid row 2 (2 cols) ═══ */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[2.5fr_1fr]">

            {/* ── Ventas por hora ── */}
            <motion.article
              variants={itemVariants}
              className="rounded-2xl border border-border-main/80 bg-bg-card/45 p-6 backdrop-blur-sm"
            >
              <h2 className="text-[11px] uppercase tracking-[0.18em] text-text-dim">
                Ventas · hoy por hora
              </h2>
              <p className="mt-1 text-sm text-text-muted">
                Pico a las <span className="font-mono text-gold">{peakEntry.hour}</span>
                {" · "}
                <span className="font-mono text-text-primary">${peakEntry.orders.toLocaleString("es-MX")}</span>
              </p>
              <div className="mt-4 h-[120px]">
                <PeakHourBar data={mockHourlySales} className="h-full" />
              </div>
              <p className="mt-2 text-[9px] text-text-faint">
                {/* TODO: real hourly sales API */} datos simulados
              </p>
            </motion.article>

            {/* ── Actividad reciente ── */}
            <motion.article
              variants={itemVariants}
              className="flex flex-col overflow-hidden rounded-2xl border border-border-main/80 bg-bg-card/45 backdrop-blur-sm"
            >
              <div className="border-b border-border-main/80 px-5 py-4">
                <h2 className="text-[11px] uppercase tracking-[0.18em] text-text-dim">
                  Actividad reciente
                </h2>
              </div>
              {/* TODO: replace with real activity feed / SSE */}
              <div className="flex-1 divide-y divide-border-main/60">
                {MOCK_ACTIVITY.map((ev, i) => {
                  const { Icon, tone } = activityIcons[ev.type];
                  return (
                    <div
                      key={i}
                      className="flex items-start gap-3 px-5 py-3"
                      style={{ animation: `dash-row-enter 400ms ${i * 50}ms ease both` }}
                    >
                      <Icon size={14} className={`mt-0.5 shrink-0 ${tone}`} />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs leading-relaxed text-text-primary">{ev.msg}</p>
                        <p className="mt-0.5 font-mono text-[10px] text-text-faint">{ev.time}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="border-t border-border-main/80 px-5 py-2.5">
                <span className="text-[9px] text-text-faint">
                  {/* TODO: real activity feed */} últimos 6 eventos
                </span>
              </div>
            </motion.article>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
