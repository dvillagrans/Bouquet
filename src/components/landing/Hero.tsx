"use client";

import { motion, useReducedMotion } from "framer-motion";
import { FloorPlan } from "@/components/landing/FloorPlan";

const easeOutQuint = [0.32, 0.72, 0, 1] as const;

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

/** Entrada instantánea cuando el usuario tiene prefers-reduced-motion */
const containerVariantsReduced = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0, delayChildren: 0 },
  },
};

const itemVariantsReduced = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0 },
  },
};

const mockupVariantsReduced = {
  hidden: { opacity: 1, scale: 1, y: 0 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0 },
  },
};

export const Hero = () => {
  const reduceMotion = useReducedMotion() === true;

  const cVariants = reduceMotion ? containerVariantsReduced : containerVariants;
  const iVariants = reduceMotion ? itemVariantsReduced : itemVariants;
  const mVariants = reduceMotion ? mockupVariantsReduced : mockupVariants;

  return (
  <section className="relative overflow-hidden pt-32 pb-24 lg:pt-48 lg:pb-32">
    <div className="absolute inset-0 -z-10">
      <motion.div
        initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 1.5, ease: easeOutQuint }
        }
        className="absolute left-[-12%] top-[-8%] h-[28rem] w-[28rem] rounded-full bg-gold/10 blur-3xl"
      />
      <motion.div
        initial={reduceMotion ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={
          reduceMotion
            ? { duration: 0 }
            : { duration: 1.5, delay: 0.2, ease: easeOutQuint }
        }
        className="absolute right-[-8%] top-[12%] h-[24rem] w-[24rem] rounded-full bg-sage/12 blur-3xl"
      />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-charcoal/10 to-transparent" />
    </div>

    <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:px-10">
      <motion.div
        variants={cVariants}
        initial="hidden"
        animate="show"
        className="max-w-3xl"
      >
        <motion.div variants={iVariants}>
          <div className="inline-flex items-center gap-3 rounded-full px-3.5 py-1.5 ring-1 ring-charcoal/10 bg-white/55 backdrop-blur-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] text-[0.65rem] font-bold uppercase tracking-[0.3em] text-charcoal/65">
            <span className="relative flex h-2 w-2">
              {!reduceMotion && (
                <span
                  className="absolute inline-flex h-full w-full rounded-full bg-gold/50 animate-ping"
                  aria-hidden="true"
                />
              )}
              <span className="relative inline-flex h-2 w-2 rounded-full bg-gold" aria-hidden="true" />
            </span>
            Hospitality OS · servicio real
          </div>
        </motion.div>

        <motion.h1 variants={iVariants} className="mt-7 max-w-[12ch] text-balance font-sans text-[clamp(3.25rem,7.6vw,7.6rem)] font-black tracking-[-0.06em] leading-[0.9] text-charcoal">
          Sala, cocina y caja. <span className="font-serif italic font-medium text-charcoal/55">Sin fricción.</span>
        </motion.h1>

        <motion.p variants={iVariants} className="mt-7 max-w-2xl text-balance text-[1.05rem] leading-[1.8] text-charcoal/68 sm:text-[1.15rem]">
          Bouquet ordena el turno para que el equipo vea qué mesa pide, qué pasa a cocina y qué se cobra,
          sin depender de libretas, walkie-talkies ni capturas duplicadas. Funciona igual de bien para
          taquerías de alto flujo, barras y casual dining.
        </motion.p>

        <motion.div variants={iVariants} className="mt-10 flex flex-col gap-4 sm:flex-row">
          <motion.a
            href="#contacto"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="group inline-flex h-14 w-full items-center justify-between gap-4 rounded-full bg-charcoal px-2 pl-8 text-[1rem] font-semibold text-cream shadow-[0_20px_40px_-20px_rgba(43,36,30,0.65)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-w-[280px]"
          >
            <span>Reservar demo de 20 min</span>
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/15 ring-1 ring-white/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
              <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </motion.a>

          <motion.a
            href="#como-funciona"
            whileHover={reduceMotion ? undefined : { y: -2 }}
            whileTap={reduceMotion ? undefined : { scale: 0.98 }}
            transition={{ type: "spring", stiffness: 380, damping: 24 }}
            className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-charcoal/10 bg-cream/75 px-8 text-[1rem] font-semibold text-charcoal transition-[border-color,background-color] duration-300 hover:border-charcoal/25 hover:bg-cream focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold sm:min-w-[240px]"
          >
            Ver recorrido operativo
            <svg className="h-3.5 w-3.5 text-charcoal/50" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M6 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </motion.a>
        </motion.div>

        <motion.div variants={iVariants} className="mt-8 flex flex-wrap items-center gap-2 text-[0.82rem] font-medium text-charcoal/58">
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-charcoal/5 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"><span className="w-1.5 h-1.5 rounded-full bg-charcoal/20"></span>Sin tarjeta de crédito</span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-charcoal/5 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"><span className="w-1.5 h-1.5 rounded-full bg-charcoal/20"></span>Configuración en 1 día</span>
          <span className="flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-charcoal/5 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]"><span className="w-1.5 h-1.5 rounded-full bg-gold"></span>Soporte humano</span>
        </motion.div>
      </motion.div>

      <motion.div
        variants={mVariants}
        initial="hidden"
        animate="show"
        className="relative"
      >
        <div className="absolute -inset-6 rounded-[3rem] bg-[radial-gradient(circle_at_top,#f4e6cf_0%,transparent_66%)] blur-2xl" aria-hidden="true" />

        {/* Double-bezel: outer shell */}
        <div className="relative rounded-[2.25rem] p-2 ring-1 ring-charcoal/10 bg-gradient-to-b from-white/70 to-cream/50 shadow-[0_30px_70px_-40px_rgba(43,36,30,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]">
          {/* Inner core */}
          <div className="relative overflow-hidden rounded-[calc(2.25rem-0.5rem)] bg-cream/80 ring-1 ring-charcoal/[0.06]">
            <div className="flex items-center justify-between border-b border-charcoal/8 px-5 pt-5 pb-3">
              <div>
                <p className="text-[0.6rem] font-bold uppercase tracking-[0.32em] text-charcoal/35">Turno nocturno</p>
                <p className="mt-1 text-sm font-semibold text-charcoal">18 mesas activas · 5 cierres en curso</p>
              </div>
              <div className="flex items-center gap-2 rounded-full bg-charcoal/[0.04] px-2.5 py-1 ring-1 ring-charcoal/[0.06]">
                <span className="h-1.5 w-1.5 rounded-full bg-sage-deep" aria-hidden="true" />
                <span className="text-[0.7rem] font-semibold tabular-nums text-charcoal/70">21:47</span>
              </div>
            </div>

            <div className="px-3 pt-4 pb-3">
              <FloorPlan />
            </div>

            <div className="flex flex-wrap gap-x-5 gap-y-2 border-t border-charcoal/8 bg-charcoal/[0.015] px-5 py-3">
              {[
                { label: "Mesa 03", value: "Pase a cocina",     tone: "text-gold"      },
                { label: "Mesa 08", value: "Cierre de cuenta",  tone: "text-ember"     },
                { label: "Mesa 11", value: "Libre para sentar", tone: "text-sage-deep" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.22em] text-charcoal/40">{item.label}</span>
                  <span className="text-[0.62rem] font-medium text-charcoal/20">·</span>
                  <span className={`text-[0.7rem] font-semibold ${item.tone}`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  </section>
  );
};

