/** @jsxImportSource react */
"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, BarChart3, Clock, DollarSign, Receipt, ArrowUpRight, Flame, Trophy, Coffee, Activity } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { DashboardReportData, Period } from "@/actions/reports";

// ─── Framework & Data ─────────────────────────────────────────────────────────
const PERIODS: Period[] = ["Hoy", "Semana", "Mes"];

const NOISE_SVG = `data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.08'/%3E%3C/svg%3E`;

function fmtK(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000)     return `$${(n / 1_000).toFixed(1)}k`;
  // Para cantidades exactas
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(n);
}

// ─── Custom Chart Premium ──────────────────────────────────────────────────────
function BarChart({ data }: { data: { label: string; value: number }[] }) {
  if (!data || data.length === 0) {
    return (
       <div className="h-[250px] w-full flex flex-col items-center justify-center text-white/20 italic">
          <BarChart3 className="w-8 h-8 opacity-30 mb-2" />
          Sin datos para graficar
       </div>
    );
  }

  const chartH  = 220;
  const labelH  = 30;
  const yLabelW = 45;
  const maxVal  = Math.max(...data.map((d) => d.value), 1);
  const ticks   = [0.25, 0.5, 0.75, 1.0];

  return (
    <div className="w-full overflow-x-auto custom-scrollbar relative">
      <svg width="100%" height={chartH + labelH} className="min-w-[500px]">
        {/* Y Axis Guides */}
        {ticks.map((t, i) => {
          const y = chartH - chartH * t;
          return (
            <g key={i}>
              <line
                x1={yLabelW}
                y1={y}
                x2="100%"
                y2={y}
                stroke="rgba(255,255,255,0.05)"
                strokeDasharray="4 4"
              />
              <text
                x={yLabelW - 8}
                y={y + 4}
                fill="rgba(255,255,255,0.4)"
                fontSize="11"
                textAnchor="end"
                className="font-mono uppercase tracking-widest"
              >
                {fmtK(maxVal * t)}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        <g transform={`translate(${yLabelW}, 0)`}>
          {data.map((d, i) => {
            const numBars = data.length;
            const availableSpace = 800; // SVG min-width reference logic
            const barSpacing = Math.min((availableSpace - yLabelW) / numBars, 60);
            const barW = Math.min(barSpacing * 0.6, 32);
            const x = i * barSpacing + (barSpacing - barW) / 2;
            
            const barH = (d.value / maxVal) * chartH;
            const y = chartH - barH;

            return (
              <g key={i}>
                {/* Background Track */}
                <rect 
                  x={x} 
                  y={0} 
                  width={barW} 
                  height={chartH} 
                  rx={4} 
                  fill="rgba(255,255,255,0.02)" 
                />
                
                {/* Foreground Bar */}
                <motion.rect
                  initial={{ height: 0, y: chartH }}
                  animate={{ height: barH, y: y }}
                  transition={{ type: "spring", stiffness: 100, damping: 20, delay: i * 0.05 }}
                  x={x}
                  width={barW}
                  rx={4}
                  fill="url(#goldGradient)"
                  className="drop-shadow-[0_0_8px_rgba(212,175,55,0.3)] hover:opacity-80 transition-opacity cursor-pointer"
                />

                {/* X Axis Labels */}
                <text
                  x={x + barW / 2}
                  y={chartH + 20}
                  fill="rgba(255,255,255,0.6)"
                  fontSize="11"
                  textAnchor="middle"
                  className="font-semibold uppercase tracking-wider"
                >
                  {d.label.slice(0,5)}
                </text>
                
                {/* Tooltip Hover Area */}
                <title>{d.label}: {fmtK(d.value)}</title>
              </g>
            );
          })}
        </g>

        {/* Gradients */}
        <defs>
          <linearGradient id="goldGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#d4af37" />
            <stop offset="100%" stopColor="#8b7324" stopOpacity="0.4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

// ─── Stat Card Premium ─────────────────────────────────────────────────────────
function StatCard({ stat, delay }: { stat: any, delay: number }) {
  const isPos = stat.up === true;
  const isNeg = stat.up === false;
  const TIcon = isPos ? TrendingUp : isNeg ? TrendingDown : Minus;
  
  // Icon Mapping heuristics
  let Icon = Activity;
  if (stat.label.toLowerCase().includes("ingreso") || stat.label.toLowerCase().includes("venta")) Icon = DollarSign;
  else if (stat.label.toLowerCase().includes("ticket")) Icon = Receipt;
  else if (stat.label.toLowerCase().includes("orden") || stat.label.toLowerCase().includes("comanda")) Icon = Flame;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="relative p-6 rounded-2xl bg-bg-card/45 backdrop-blur-xl border border-white/5 overflow-hidden group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-gold/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-white/40 text-xs font-bold tracking-widest uppercase mb-1">
            {stat.label}
          </p>
          <h3 className="text-3xl font-black text-white tracking-tight">
            {stat.label.includes("Ingreso") || stat.label.includes("Ticket") ? fmtK(stat.value as number) : stat.value}
          </h3>
        </div>
        <div className="p-3 bg-black/40 rounded-xl border border-white/5 text-gold">
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2 relative z-10">
        <div className={`
          flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-md
          ${isPos ? "text-dash-green bg-dash-green/10" : isNeg ? "text-dash-red bg-dash-red/10" : "text-white/50 bg-white/5"}
        `}>
          <TIcon className="w-3 h-3" />
          {stat.change.replace("%", "")}%
        </div>
        <span className="text-xs text-white/30 uppercase tracking-wider">vs prev</span>
      </div>
    </motion.div>
  );
}

// ─── Main Reports Component ───────────────────────────────────────────────────
export default function ReportsView({
  reportData,
}: {
  reportData?: DashboardReportData;
}) {
  const [period, setPeriod] = useState<Period>("Hoy");

  const stats    = reportData?.stats[period]     ?? [];
  const topItems = reportData?.topItems[period]  ?? [];
  const chart    = reportData?.chartData[period] ?? [];

  return (
    <div className="relative min-h-screen bg-[#1A0F14] text-white flex flex-col font-sans overflow-hidden p-4 sm:p-8">
      {/* Black/Gold Noise Background */}
      <div 
        className="fixed inset-0 z-0 pointer-events-none opacity-[0.1]"
        style={{ backgroundImage: `url("${NOISE_SVG}")` }}
      />
      <div className="fixed top-[-10%] sm:top-[-20%] right-[-10%] sm:right-[-10%] w-[50%] h-[50%] sm:w-[40%] sm:h-[60%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/15 via-gold/5 to-transparent rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gold/10 via-transparent to-transparent rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -10 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6 mb-8"
      >
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase drop-shadow-md flex items-center gap-3">
             Métricas <span className="text-gold">Financieras</span>
          </h1>
          <p className="text-sm font-mono text-white/40 tracking-widest mt-2 uppercase">
            Rendimiento & Analytics &copy; Bouquet
          </p>
        </div>

        {/* Custom Period Segmented Control */}
        <div className="bg-bg-card/45 p-1 rounded-xl backdrop-blur-xl border border-white/5 flex gap-1 shadow-lg w-full md:w-auto">
          {PERIODS.map((p) => {
            const active = period === p;
            return (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`
                  relative px-6 py-2.5 text-xs font-bold tracking-widest uppercase transition-all flex-1 md:flex-none
                  ${active ? "text-gold" : "text-white/40 hover:text-white/70"}
                `}
              >
                {active && (
                  <motion.div
                    layoutId="periodIndicator"
                    className="absolute inset-0 bg-gold/10 border border-gold/30 rounded-lg"
                    style={{ zIndex: -1 }}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
                {p}
              </button>
            );
          })}
        </div>
      </motion.div>

      {/* KPI Grid */}
      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s, i) => (
          <StatCard key={s.label} stat={s} delay={i * 0.1} />
        ))}
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Main Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="lg:col-span-2 bg-bg-card/45 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl"
        >
          <div className="flex items-center justify-between mb-8 border-b border-white/5 pb-4">
             <h2 className="text-lg font-black tracking-widest uppercase flex items-center gap-2 text-white/90">
               <Activity className="w-5 h-5 text-gold" /> Progreso de Ventas
             </h2>
             <button className="text-white/30 hover:text-gold transition-colors flex items-center text-xs font-bold tracking-widest uppercase">
               Exportar <ArrowUpRight className="w-4 h-4 ml-1" />
             </button>
          </div>
          <BarChart data={chart} />
        </motion.div>

        {/* Top Products */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-bg-card/45 backdrop-blur-xl border border-white/5 rounded-2xl p-6 shadow-2xl flex flex-col"
        >
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
             <h2 className="text-lg font-black tracking-widest uppercase flex items-center gap-2 text-white/90">
               <Trophy className="w-5 h-5 text-gold" /> Best Sellers
             </h2>
          </div>

          <div className="flex-1 flex flex-col gap-3 custom-scrollbar overflow-y-auto">
            {topItems.length === 0 ? (
               <div className="flex flex-col items-center justify-center p-6 text-white/20 italic h-[200px]">
                 <Coffee className="w-8 h-8 opacity-30 mb-2" />
                 Sin productos vendidos
               </div>
            ) : (
              topItems.map((item, i) => (
                <motion.div 
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + (i * 0.05) }}
                  key={item.name} 
                  className="flex items-center justify-between p-4 bg-black/40 border border-white/5 rounded-xl hover:border-gold/30 transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 flex items-center justify-center bg-white/5 text-white/50 text-xs font-black rounded border border-white/10 group-hover:text-gold group-hover:border-gold/30 transition-colors">
                      {i + 1}
                    </span>
                    <div>
                      <p className="text-sm font-bold text-gray-200">{item.name}</p>
                      <p className="text-xs text-dash-green font-semibold mt-0.5 tracking-widest">{item.sold} vnd</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-black text-white/90">{item.revenue}</p>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </motion.div>
      </div>

    </div>
  );
}
