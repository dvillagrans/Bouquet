"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

const easeOutQuint = [0.32, 0.72, 0, 1] as const;

/* Dashboard preview card */
function DashboardPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-rose-cream ring-1 ring-burgundy/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_20px_60px_rgba(74,26,44,0.1)]">
      {/* Header del dashboard */}
      <div className="flex items-center justify-between border-b border-burgundy/[0.06] bg-white/60 px-5 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy/5">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-burgundy" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="6" height="6" rx="1" />
              <rect x="11" y="3" width="6" height="6" rx="1" />
              <rect x="3" y="11" width="6" height="6" rx="1" />
              <rect x="11" y="11" width="6" height="6" rx="1" />
            </svg>
          </div>
          <span className="font-serif text-sm font-semibold italic text-burgundy">bouquet</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-burgundy/40">Dashboard</span>
          <div className="h-6 w-6 rounded-full bg-rose-blush" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-4">
        {[
          { label: "Ventas totales", value: "$12,540", color: "text-burgundy" },
          { label: "Mesas activas", value: "18", color: "text-rose" },
          { label: "Órdenes totales", value: "143", color: "text-burgundy" },
          { label: "Ticket promedio", value: "$345", color: "text-sage-deep" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-white/70 p-3 ring-1 ring-burgundy/[0.04]">
            <p className="text-[0.52rem] font-bold uppercase tracking-[0.15em] text-burgundy/35">{kpi.label}</p>
            <p className={`mt-1 font-serif text-[1.1rem] font-semibold tabular-nums ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2">
        {/* Gráfico de línea */}
        <div className="rounded-xl bg-white/70 p-4 ring-1 ring-burgundy/[0.04]">
          <p className="mb-3 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-burgundy/40">Ventas por hora</p>
          <svg viewBox="0 0 200 80" className="h-20 w-full">
            {/* Grid lines */}
            {[0, 20, 40, 60].map((y) => (
              <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#E8D0D8" strokeWidth="0.5" strokeDasharray="2 2" />
            ))}
            {/* Line */}
            <motion.path
              d="M10 55 L40 45 L70 50 L100 35 L130 40 L160 25 L190 20"
              stroke="#C75B7A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              initial={{ pathLength: 0 }}
              whileInView={{ pathLength: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1.5, ease: "easeOut" }}
            />
            {/* Area under line */}
            <motion.path
              d="M10 55 L40 45 L70 50 L100 35 L130 40 L160 25 L190 20 L190 65 L10 65Z"
              fill="url(#salesGradient)"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 0.2 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            />
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C75B7A" />
                <stop offset="100%" stopColor="#C75B7A" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Points */}
            {[
              [10, 55], [40, 45], [70, 50], [100, 35], [130, 40], [160, 25], [190, 20]
            ].map(([cx, cy], i) => (
              <motion.circle
                key={i}
                cx={cx} cy={cy} r="3"
                fill="white"
                stroke="#C75B7A"
                strokeWidth="1.5"
                initial={{ scale: 0 }}
                whileInView={{ scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.8 + i * 0.1, type: "spring" }}
              />
            ))}
          </svg>
          <div className="mt-2 flex justify-between text-[0.5rem] text-burgundy/30">
            <span>10:00</span>
            <span>14:00</span>
            <span>18:00</span>
            <span>22:00</span>
          </div>
        </div>

        {/* Gráfico de dona */}
        <div className="rounded-xl bg-white/70 p-4 ring-1 ring-burgundy/[0.04]">
          <p className="mb-3 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-burgundy/40">Top productos</p>
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0">
              <motion.circle
                cx="40" cy="40" r="32"
                stroke="#C75B7A"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="80 120"
                initial={{ rotate: -90 }}
                whileInView={{ rotate: -90 }}
                viewport={{ once: true }}
              />
              <motion.circle
                cx="40" cy="40" r="32"
                stroke="#D68C9F"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="60 140"
                strokeDashoffset="-85"
                initial={{ rotate: -90 }}
                whileInView={{ rotate: -90 }}
                viewport={{ once: true }}
              />
              <motion.circle
                cx="40" cy="40" r="32"
                stroke="#8A9A84"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="40 160"
                strokeDashoffset="-150"
                initial={{ rotate: -90 }}
                whileInView={{ rotate: -90 }}
                viewport={{ once: true }}
              />
              <motion.circle
                cx="40" cy="40" r="32"
                stroke="#E8A5B0"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="30 170"
                strokeDashoffset="-195"
                initial={{ rotate: -90 }}
                whileInView={{ rotate: -90 }}
                viewport={{ once: true }}
              />
            </svg>
            <div className="space-y-1.5">
              {[
                { label: "Entradas", color: "bg-rose" },
                { label: "Platos fuertes", color: "bg-rose-light" },
                { label: "Bebidas", color: "bg-sage" },
                { label: "Postres", color: "bg-rose-pale" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-[0.6rem] font-medium text-burgundy/60">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProductSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const mockupY = useTransform(scrollYProgress, [0, 1], [100, -100]);
  const textY = useTransform(scrollYProgress, [0, 1], [40, -40]);

  return (
    <section
      ref={sectionRef}
      className="relative bg-burgundy text-white py-28 lg:py-40 overflow-hidden z-10"
      id="producto"
    >
      {/* Transición */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-rose-blush/20 via-transparent to-transparent" aria-hidden="true" />

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      />

      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#2E1B24_0%,transparent_60%)]" aria-hidden="true" />

      <div className="mx-auto max-w-[85rem] px-6 lg:px-10 relative">
        {/* Header editorial */}
        <motion.div style={{ y: textY }} className="flex flex-col gap-6 lg:gap-10 mb-24 lg:mb-36">
          <div className="inline-flex">
            <div className="flex items-center gap-3 px-4 py-2 rounded-full ring-1 ring-white/10 bg-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <span className="w-2 h-2 rounded-full bg-rose animate-pulse" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/70">
                La Plataforma
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-end">
            <h2 className="font-serif text-[clamp(3rem,6.5vw,5.5rem)] font-medium italic leading-[0.9] tracking-tight text-white m-0">
              Control <br />
              <span className="text-white/40">absoluto.</span>
            </h2>
            <p className="max-w-md text-[1.1rem] font-light leading-[1.8] text-white/50 pb-2">
              Bouquet unifica cada vértice del restaurante. Sin hardware excesivo, sin cables, sin fricción entre estaciones.
            </p>
          </div>
        </motion.div>

        {/* Dashboard Preview */}
        <motion.div
          style={{ y: mockupY }}
          className="relative rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-b from-white/[0.07] to-white/[0.02] ring-1 ring-white/10 p-3 lg:p-6 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] mb-24 lg:mb-36 origin-bottom will-change-transform"
        >
          <div className="relative rounded-[calc(2rem-0.75rem)] lg:rounded-[calc(2.5rem-1.5rem)] overflow-hidden bg-black/40 ring-1 ring-white/5 shadow-[inset_0_4px_20px_rgba(255,255,255,0.05)]">
            <DashboardPreview />
          </div>
        </motion.div>

        {/* Bento facts */}
        <div className="relative">
          <div className="flex items-center gap-4 mb-14">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Métricas & Soporte</h3>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-[2rem] ring-1 ring-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {/* Feature 1 (Large) */}
            <div className="col-span-1 md:col-span-7 p-10 lg:p-14 border-b md:border-b-0 md:border-r border-white/10 relative group">
              <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.02]" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/30 mb-8">Deploy Rápido</p>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-serif text-[4rem] lg:text-[5.5rem] font-medium leading-[0.8] text-white tracking-tighter">1</span>
                <span className="font-serif text-[1.8rem] lg:text-[2.2rem] italic text-white/40">Día</span>
              </div>
              <p className="text-[1rem] font-medium leading-relaxed text-white/60 max-w-[30ch]">
                Del primer onboarding técnico a tu primer turno operativo real. Cero configuraciones traumáticas.
              </p>
            </div>

            {/* Constraints Block */}
            <div className="col-span-1 md:col-span-5 flex flex-col divide-y divide-white/10">
              <div className="flex-1 p-10 lg:p-12 relative group">
                <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.02]" />
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/30 mb-4">Ecosistema</p>
                <p className="font-serif text-[2rem] lg:text-[2.2rem] font-medium leading-[1] text-white mb-2 tracking-tight">API Abierta.</p>
                <p className="text-[0.9rem] font-medium leading-snug text-white/50">
                  Integraciones nativas automáticas con POS de caja y terminales bancarias.
                </p>
              </div>

              <div className="flex-1 p-10 lg:p-12 relative group bg-rose/5">
                <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.02]" />
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-rose/60 mb-4">Respaldo</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-[2rem] lg:text-[2.2rem] font-medium leading-[1] text-white mb-2 tracking-tight">24/7</p>
                    <p className="text-[0.9rem] font-medium leading-snug text-white/50">Soporte humano en español.</p>
                  </div>
                  <div className="h-12 w-12 rounded-full border border-rose/30 flex items-center justify-center shrink-0 text-rose shadow-[0_0_20px_rgba(199,91,122,0.15)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
