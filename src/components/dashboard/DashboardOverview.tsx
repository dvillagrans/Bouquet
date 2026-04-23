
"use client";

import { usePathname } from "next/navigation";
import { motion, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { memo } from "react";
import {
  ArrowRight,
  Armchair,
  CheckCircle,
  ChefHat,
  ClockCountdown,
  CompassTool,
  CurrencyDollar,
  MapPin,
  Receipt,
  Storefront,
  UsersThree,
  WarningCircle,
} from "@phosphor-icons/react";
import Link from "next/link";
import { resolveNavHref, restaurantBaseFromPathname } from "@/lib/dashboard-nav";

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

function MetricTile({
  label,
  value,
  icon,
  delay,
  reduceMotion,
}: {
  label: string;
  value: string;
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
      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100" style={{ backgroundImage: "linear-gradient(120deg, color-mix(in srgb, var(--color-gold) 9%, transparent), transparent 45%)" }} />
      <div className="relative flex items-start justify-between gap-4">
        <p className="max-w-[16ch] text-[10px] uppercase tracking-[0.18em] text-text-dim">{label}</p>
        <Icon size={16} className="text-gold/90" />
      </div>
      <p className="relative mt-7 font-mono text-[clamp(1.6rem,3vw,2.2rem)] leading-none tracking-tight text-text-primary">{value}</p>
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

export default function DashboardOverview({ data }: DashboardOverviewProps) {
  const pathname = usePathname();
  const restaurantBase = restaurantBaseFromPathname(pathname);
  const { metrics, restaurant } = data;
  const reduceMotion = useReducedMotion() ?? false;
  const occPct = metrics.totalTables > 0 ? (metrics.activeTables / metrics.totalTables) * 100 : 0;

  const fmtMoney = (n: number) =>
    "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

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
          className="flex flex-col gap-10 md:gap-12"
        >
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-6 lg:grid-cols-[2fr_1fr] lg:items-end">
            <header className="space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-border-main/80 bg-bg-card/40 px-3 py-1.5 text-[10px] uppercase tracking-[0.18em] text-text-faint">
                <Storefront size={13} className="text-gold" />
                Visión Operativa
              </div>
              <h1 className="max-w-[18ch] text-4xl leading-none tracking-tighter text-text-primary md:text-6xl">
                {restaurant.name}
              </h1>
              {restaurant.address && (
                <p className="flex max-w-[62ch] items-start gap-2 text-sm leading-relaxed text-text-muted">
                  <MapPin size={15} className="mt-0.5 shrink-0 text-text-dim" />
                  {restaurant.address}
                </p>
              )}
            </header>
            <div className="rounded-2xl border border-border-main/80 bg-bg-card/35 p-4 backdrop-blur-sm lg:ml-auto lg:w-full lg:max-w-xs">
              <p className="text-[10px] uppercase tracking-[0.18em] text-text-faint">Traza operativa</p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Salón activo</span>
                  <span className="font-mono text-text-primary">{metrics.activeTables}/{metrics.totalTables}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Comandas</span>
                  <span className="font-mono text-text-primary">{metrics.totalOrders}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Staff</span>
                  <span className="font-mono text-text-primary">{metrics.staffCount}</span>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
            {[
              { label: "Ventas del día", value: fmtMoney(metrics.todayRevenue), icon: CurrencyDollar },
              { label: "Mesas ocupadas", value: `${metrics.activeTables} / ${metrics.totalTables}`, icon: Armchair },
              { label: "Staff en sala", value: metrics.staffCount.toString(), icon: UsersThree },
              { label: "Comandas hoy", value: metrics.totalOrders.toString(), icon: Receipt },
            ].map((metric, index) => (
              <MemoMetricTile
                key={metric.label}
                label={metric.label}
                value={metric.value}
                icon={metric.icon}
                delay={0.05 * index}
                reduceMotion={reduceMotion}
              />
            ))}
          </motion.div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1.8fr_1fr]">
            <motion.article variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-border-main/80 bg-bg-card/45 p-5 sm:p-7 backdrop-blur-sm">
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
                    <CompassTool size={12} />
                    Live
                  </span>
                </div>

                {metrics.totalOrders === 0 ? (
                  <div className="rounded-2xl border border-dashed border-border-main/80 bg-bg-solid/40 p-6">
                    <p className="text-sm text-text-primary">No hay comandas en curso.</p>
                    <p className="mt-1 text-xs text-text-muted">Cuando entren órdenes, esta zona mostrará prioridad por etapa.</p>
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
                      icon={ClockCountdown}
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
          </div>
        </motion.div>
      </div>
    </section>
  );
}
