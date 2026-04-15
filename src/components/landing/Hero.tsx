"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FloorPlan } from "@/components/landing/FloorPlan";

const easeOutQuint = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.8,
      ease: easeOutQuint,
    },
  },
};

const mockupVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 1,
      ease: easeOutQuint,
      delay: 0.3, // Let text come in first
    },
  },
};

export const Hero = () => (
  <section className="relative overflow-hidden pt-28 pb-20 lg:pt-32 lg:pb-28">
    <div className="absolute inset-0 -z-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, ease: easeOutQuint }}
        className="absolute left-[-12%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-gold/10 blur-3xl"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1.5, delay: 0.2, ease: easeOutQuint }}
        className="absolute right-[-8%] top-[12%] h-[24rem] w-[24rem] rounded-full bg-sage/12 blur-3xl"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-charcoal/10 to-transparent" />
    </div>

    <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:px-10">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="max-w-3xl"
      >
        <motion.div variants={itemVariants}>
          <div className="inline-flex items-center gap-3 text-[0.68rem] font-bold uppercase tracking-[0.32em] text-charcoal/60">
            <span className="h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
            Hospitality OS para servicio real
          </div>
        </motion.div>

        <motion.h1 variants={itemVariants} className="mt-7 max-w-[11ch] text-balance font-sans text-[clamp(3.25rem,7.6vw,7.6rem)] font-black tracking-[-0.06em] leading-[0.9] text-charcoal">
          Sala, cocina y caja. <span className="text-charcoal/60">Sin fricciÃ³n.</span>
        </motion.h1>

        <motion.p variants={itemVariants} className="mt-7 max-w-2xl text-balance text-[1.05rem] leading-[1.8] text-charcoal/68 sm:text-[1.15rem]">
          Bouquet ordena el turno para que el equipo vea quÃ© mesa pide, quÃ© pasa a cocina y quÃ© se cobra,
          sin depender de libretas, walkie-talkies ni capturas duplicadas. Funciona igual de bien para
          taquerias de alto flujo, barras y casual dining.
        </motion.p>

        <motion.div variants={itemVariants} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link href="#contacto" className="block focus:outline-none">
            <motion.div
              whileHover={{ y: -2, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-full bg-charcoal px-8 text-[1rem] font-semibold text-cream shadow-[0_20px_40px_-20px_rgba(43,36,30,0.65)]"
            >
              Reservar demo de 20 min
              <svg className="h-5 w-5 transition-transform group-hover:translate-x-0.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.div>
          </Link>
          
          <Link href="#como-funciona" className="block focus:outline-none">
            <motion.div
              whileHover={{ y: -2, backgroundColor: "var(--color-cream)" }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex h-14 w-full items-center justify-center rounded-full border border-charcoal/12 bg-cream/75 px-8 text-[1rem] font-semibold text-charcoal transition-colors hover:border-charcoal/20"
            >
              Ver recorrido operativo
            </motion.div>
          </Link>
        </motion.div>

        <motion.div variants={itemVariants} className="mt-8 flex flex-wrap items-center text-[0.82rem] font-medium text-charcoal/58">
          <span className="px-2 py-1 border-r border-charcoal/10 last:border-r-0">Sin tarjeta de crÃ©dito</span>
          <span className="px-2 py-1 border-r border-charcoal/10 last:border-r-0">ConfiguraciÃ³n en 1 dÃ­a</span>
          <span className="px-2 py-1 border-r border-charcoal/10 last:border-r-0">Soporte humano en espaÃ±ol</span>
        </motion.div>
      </motion.div>

      <motion.div
        variants={mockupVariants}
        initial="hidden"
        animate="show"
        className="relative"
      >
        <div className="absolute -inset-4 rounded-[2.5rem] bg-[radial-gradient(circle_at_top,#f4e6cf_0%,transparent_66%)] blur-2xl" aria-hidden="true" />
        <div className="relative overflow-hidden border-t border-charcoal/10 pt-8">
          <div className="flex items-center justify-between border-b border-charcoal/8 px-2 pb-3">
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.32em] text-charcoal/35">Turno nocturno</p>
              <p className="mt-1 text-sm font-semibold text-charcoal">18 mesas activas, 5 cierres en curso</p>
            </div>
            <div className="text-[0.7rem] font-semibold text-charcoal/70">
              21:47
            </div>
          </div>

          <div className="pt-4">
            <FloorPlan />
          </div>

          <div className="mt-6 flex flex-wrap gap-4">
            {[
              { label: "Mesa 03", value: "Pase a cocina", tone: "text-gold" },
              { label: "Mesa 08", value: "Cierre de cuenta", tone: "text-ember" },
              { label: "Mesa 11", value: "Libre para sentar", tone: "text-sage-deep" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2">
                <span className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-charcoal/40">{item.label}</span>
                <span className="text-[0.65rem] font-medium text-charcoal/20">|</span>
                <span className={`text-[0.72rem] font-semibold ${item.tone}`}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>
    </div>
  </section>
);

