const fs = require('fs');

const code = `
"use client";

import { usePathname } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  MapPin,
  TrendingUp,
  Store,
  Users,
  ChefHat,
  Receipt,
  LayoutGrid,
  ArrowRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
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

export default function DashboardOverview({ data }: DashboardOverviewProps) {
  const pathname = usePathname();
  const restaurantBase = restaurantBaseFromPathname(pathname);
  const { metrics, restaurant } = data;
  const reduceMotion = useReducedMotion();
  const occPct = metrics.totalTables > 0 ? (metrics.activeTables / metrics.totalTables) * 100 : 0;

  const fmtMoney = (n: number) =>
    "$" + n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const NOISE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDgiIG1peC1ibGVuZC1tb2RlPSJvdmVybGF5IiAvPgo8L3N2Zz4=";

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] } },
  };

  return (
    <div className="relative min-h-screen bg-bg-solid font-sans text-text-primary">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 z-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: \`url("\${NOISE_SVG}")\`, backgroundRepeat: "repeat" }}
        />
        <div className="absolute -left-40 -top-40 h-[min(80vh,600px)] w-[min(100vw,800px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.08),transparent_60%)] blur-3xl" />
        <div className="absolute -bottom-40 -right-40 h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(77,132,96,0.05),transparent_60%)] blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto max-w-[1400px] px-6 py-12 md:px-12 md:py-16">
        <motion.div
          variants={containerVariants}
          initial={reduceMotion ? "visible" : "hidden"}
          animate="visible"
          className="flex flex-col gap-12"
        >
          {/* Header */}
          <motion.div variants={itemVariants} className="flex flex-col gap-4 border-b border-border-main pb-8">
            <div className="flex items-center gap-3">
              <Store className="size-4 text-gold" aria-hidden="true" />
              <p className="font-mono text-[10px] sm:text-[11px] uppercase tracking-[0.3em] text-text-faint">
                Visión Global Operativa
              </p>
            </div>
            <h1 className="font-serif text-[clamp(2.5rem,5vw,4rem)] font-medium leading-[0.95] tracking-tight text-text-primary">
              {restaurant.name}
            </h1>
            {restaurant.address && (
              <p className="max-w-xl text-[13px] leading-relaxed text-text-muted flex items-center gap-2">
                <MapPin className="size-3.5 text-text-dim" aria-hidden="true" />
                {restaurant.address}
              </p>
            )}
          </motion.div>

          {/* Primary KPIs */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
            {[
              {
                label: "Ventas del Día",
                value: fmtMoney(metrics.todayRevenue),
                icon: TrendingUp,
              },
              {
                label: "Mesas Ocupadas",
                value: \`\${metrics.activeTables} / \${metrics.totalTables}\`,
                icon: LayoutGrid,
              },
              {
                label: "Staff en Sala",
                value: metrics.staffCount.toString(),
                icon: Users,
              },
              {
                label: "Comandas Hoy",
                value: metrics.totalOrders.toString(),
                icon: Receipt,
              },
            ].map((kpi, idx) => (
              <div
                key={idx}
                className="group relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-6 backdrop-blur-sm transition-colors hover:border-border-bright hover:bg-bg-card/60"
              >
                <div className="absolute -right-6 -top-6 rounded-full bg-gold/5 p-8 opacity-0 transition-opacity group-hover:opacity-100">
                  <kpi.icon className="size-16 text-gold/10" aria-hidden="true" />
                </div>
                <div className="relative z-10 flex flex-col justify-between h-full">
                  <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-dim w-24">
                    {kpi.label}
                  </p>
                  <p className="mt-8 font-serif text-3xl font-medium tracking-tight text-text-primary group-hover:text-gold transition-colors">
                    {kpi.value}
                  </p>
                </div>
              </div>
            ))}
          </motion.div>

          {/* Secondary Areas */}
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            {/* Kitchen Pulse */}
            <motion.div variants={itemVariants} className="lg:col-span-2 relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-6 sm:p-8 backdrop-blur-sm">
               <div className="absolute right-0 top-0 p-8 opacity-[0.02] pointer-events-none">
                 <ChefHat className="size-64" aria-hidden="true" />
               </div>
               
               <div className="relative z-10 mb-8 flex items-center justify-between">
                 <div>
                   <h2 className="flex items-center gap-2 font-serif text-xl sm:text-2xl text-text-primary">
                     <ChefHat className="size-5 text-gold" aria-hidden="true" />
                     Pulso de Cocina
                   </h2>
                   <p className="mt-2 text-[12px] text-text-muted">Estado en tiempo real de los tickets de operación.</p>
                 </div>
               </div>

               <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div className="flex flex-col items-center justify-center rounded-xl border border-border-bright bg-bg-solid/60 p-6">
                   <AlertCircle className="mb-3 size-5 text-dash-red/50" aria-hidden="true" />
                   <p className="font-serif text-[clamp(2rem,3vw,2.5rem)] leading-none text-dash-red">{metrics.pendingOrders}</p>
                   <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint">Pendientes</p>
                 </div>
                 <div className="flex flex-col items-center justify-center rounded-xl border border-border-bright bg-bg-solid/60 p-6">
                   <Clock className="mb-3 size-5 text-gold/50" aria-hidden="true" />
                   <p className="font-serif text-[clamp(2rem,3vw,2.5rem)] leading-none text-gold">{metrics.preparingOrders}</p>
                   <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint">En Fuego</p>
                 </div>
                 <div className="flex flex-col items-center justify-center rounded-xl border border-border-bright bg-bg-solid/60 p-6">
                   <CheckCircle2 className="mb-3 size-5 text-dash-green/50" aria-hidden="true" />
                   <p className="font-serif text-[clamp(2rem,3vw,2.5rem)] leading-none text-dash-green">{metrics.deliveredOrders}</p>
                   <p className="mt-2 text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint">Despachados</p>
                 </div>
               </div>
            </motion.div>

            {/* Floor Operations */}
            <motion.div variants={itemVariants} className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-6 sm:p-8 backdrop-blur-sm flex flex-col items-center justify-center text-center">
              <h2 className="mb-8 text-[11px] font-medium uppercase tracking-[0.2em] text-text-dim">
                Densidad de Piso
              </h2>

              <div className="relative mb-8 size-40 shrink-0 rounded-full border border-border-bright/50 bg-bg-solid/80 p-[3px] shadow-[inset_0_0_24px_rgba(0,0,0,0.6)]">
                 <div
                   className="size-full rounded-full transition-all duration-1000 ease-out"
                   style={{
                     background: \`conic-gradient(var(--color-gold) \${occPct * 3.6}deg, var(--color-border-main) 0deg)\`,
                   }}
                 />
                 <div className="absolute inset-[12px] flex flex-col items-center justify-center rounded-full bg-bg-card shadow-2xl">
                   <span className="font-serif text-4xl text-text-primary">{occPct.toFixed(0)}<span className="text-xl text-text-dim">%</span></span>
                 </div>
              </div>
              
              <p className="text-[12px] leading-relaxed text-text-muted">
                Capacidad utilizada: <span className="text-text-primary font-medium">{metrics.activeTables}</span> de <span className="text-text-primary font-medium">{metrics.totalTables}</span> mesas configuradas.
              </p>

              <Link 
                href={resolveNavHref("/dashboard/mesas", restaurantBase)}
                className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gold py-3 text-[11px] font-semibold uppercase tracking-[0.1em] text-bg-solid transition-all hover:bg-white hover:shadow-[0_0_20px_rgba(201,160,84,0.3)] shadow-lg"
              >
                Plano de piso
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/components/dashboard/DashboardOverview.tsx', code);
