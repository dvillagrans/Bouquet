"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  TrendingUp,
  Store,
  Users,
  UtensilsCrossed,
  ChefHat,
  Receipt,
  LayoutGrid,
} from "lucide-react";
import Link from "next/link";

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
  const { metrics, restaurant } = data;
  const occPct = metrics.totalTables > 0 ? (metrics.activeTables / metrics.totalTables) * 100 : 0;

  const fmtMoney = (n: number) =>
    `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12 bg-[#101010]">
      {/* ── Header ───────────────────────────── */}
      <div className="border-b border-border-main pb-8">
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-text-dim flex items-center gap-2">
          <Store className="w-3 h-3 text-gold" />
          Visión Global
        </p>
        <h1 className="font-serif text-[clamp(2rem,4vw,3.2rem)] font-medium leading-[0.92] tracking-[-0.02em] text-text-primary">
          <span className="text-gold">{restaurant.name}</span>
        </h1>
        {restaurant.address && (
          <p className="mt-3 flex items-center gap-2 text-[12px] text-text-muted">
            <MapPin className="w-3.5 h-3.5 text-text-dim" />
            {restaurant.address}
          </p>
        )}
      </div>

      {/* ── Quick KPI Strip ───────────────────────────── */}
      <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            label: "Ventas del Día",
            value: fmtMoney(metrics.todayRevenue),
            icon: TrendingUp,
            color: "text-dash-green",
          },
          {
            label: "Mesas Ocupadas",
            value: `${metrics.activeTables} / ${metrics.totalTables}`,
            icon: LayoutGrid,
            color: "text-gold",
          },
          {
            label: "Staff en Sala",
            value: `${metrics.staffCount} activos`,
            icon: Users,
            color: "text-text-secondary",
          },
          {
            label: "Comandas Hoy",
            value: `${metrics.totalOrders}`,
            icon: Receipt,
            color: "text-text-secondary",
          },
        ].map((kpi, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/50 p-6 flex flex-col justify-between"
          >
            <div className="flex justify-between items-start">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-dim w-24 leading-snug">
                {kpi.label}
              </p>
              <kpi.icon className={`w-5 h-5 opacity-80 ${kpi.color}`} />
            </div>
            <p className="mt-6 font-serif text-3xl font-medium tracking-tight text-text-primary">
              {kpi.value}
            </p>
          </motion.div>
        ))}
      </div>

      {/* ── Secondary Metrics (Kitchen / Occupation) ───────────────────────────── */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Col: Kitchen Pulse */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="lg:col-span-2 rounded-2xl border border-border-main bg-bg-card p-8 flex flex-col justify-between relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
            <ChefHat className="w-40 h-40" />
          </div>
          
          <div>
             <h3 className="text-base font-semibold text-text-primary tracking-wide flex items-center gap-2 lg:text-[14px]">
               <ChefHat className="w-4 h-4 text-gold" />
               Pulso de Cocina
             </h3>
             <p className="text-[11px] text-text-dim mt-1">
               Estatus en tiempo real de los tickets (comandas).
             </p>
          </div>

          <div className="mt-8 grid grid-cols-3 gap-4">
             <div className="border border-border-bright bg-bg-solid/50 rounded-xl p-5 text-center">
               <p className="text-[32px] font-serif font-medium text-gold">{metrics.pendingOrders}</p>
               <p className="text-[10px] uppercase tracking-widest text-text-faint mt-1">Pendientes</p>
             </div>
             <div className="border border-border-bright bg-bg-solid/50 rounded-xl p-5 text-center">
               <p className="text-[32px] font-serif font-medium text-dash-blue">{metrics.preparingOrders}</p>
               <p className="text-[10px] uppercase tracking-widest text-text-faint mt-1">En Fuego</p>
             </div>
             <div className="border border-border-bright bg-bg-solid/50 rounded-xl p-5 text-center">
               <p className="text-[32px] font-serif font-medium text-text-dim">{metrics.deliveredOrders}</p>
               <p className="text-[10px] uppercase tracking-widest text-text-faint mt-1">Despachados</p>
             </div>
          </div>
        </motion.div>

        {/* Right Col: Floor Operations */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="rounded-2xl border border-border-main bg-gradient-to-b from-[#222222] to-[#1a1a1a] p-8 flex flex-col justify-center items-center text-center relative"
        >
           <h3 className="text-[11px] uppercase tracking-[0.2em] font-semibold text-text-dim mb-6">
             Densidad de Piso
           </h3>

           <div className="relative size-32 shrink-0 rounded-full border border-border-bright/50 bg-bg-solid/80 p-[3px] shadow-[inset_0_0_24px_rgba(0,0,0,0.6)]">
              <div
                className="size-full rounded-full"
                style={{
                  background: `conic-gradient(var(--color-gold) ${occPct * 3.6}deg, var(--color-border-main) 0deg)`,
                }}
              />
              <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-bg-card shadow-2xl">
                <span className="font-serif text-3xl font-medium tracking-tight text-white">{occPct.toFixed(0)}%</span>
              </div>
           </div>
           
           <p className="mt-6 text-[12px] text-text-muted leading-relaxed">
             Capacidad instalada sobre el total de <strong className="text-white">{metrics.totalTables}</strong> mesas configuradas.
           </p>

           <Link 
             href="/dashboard/mesas"
             className="mt-6 inline-flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-[11px] font-medium uppercase tracking-[0.1em] text-gold transition-colors hover:bg-gold/20"
           >
             <LayoutGrid className="w-3.5 h-3.5" />
             Ir a plano de piso
           </Link>
        </motion.div>
      </div>

    </div>
  );
}
