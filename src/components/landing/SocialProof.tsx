"use client";

import { motion, useReducedMotion } from "framer-motion";

const easeOutQuint = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.05 },
  },
};

const containerVariantsReduced = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0, delayChildren: 0 },
  },
};

const itemVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.55, ease: easeOutQuint },
  },
};

const itemVariantsReduced = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0 } },
};

export const SocialProof = () => {
  const reduceMotion = useReducedMotion() === true;
  const cVar = reduceMotion ? containerVariantsReduced : containerVariants;
  const iVar = reduceMotion ? itemVariantsReduced : itemVariants;

  return (
    <section className="relative overflow-hidden bg-charcoal py-28 lg:py-36">
      {/* Transición desde ProductSection */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/30 via-transparent to-transparent"
      />
      {/* Profundidad / viñeta */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(201,160,84,0.06)_0%,transparent_55%)]"
      />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={cVar}
        className="relative mx-auto max-w-[90rem] px-6 lg:px-12"
      >
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.08fr)] lg:items-start lg:gap-16 xl:gap-24">
          {/* Columna editorial */}
          <div className="relative lg:pr-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-4 top-2 bottom-8 hidden w-px bg-gradient-to-b from-gold/60 via-gold/20 to-transparent lg:block"
            />

            <motion.p
              variants={iVar}
              className="flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-cream/42"
            >
              <span className="h-px w-10 bg-gradient-to-r from-gold/70 to-transparent" aria-hidden="true" />
              Prueba social
            </motion.p>

            <motion.h2
              variants={iVar}
              className="mt-6 max-w-[13ch] text-balance font-serif text-[clamp(2.6rem,5vw,4.25rem)] font-semibold italic leading-[1.02] tracking-[-0.03em] text-cream"
            >
              El turno se siente más corto.
            </motion.h2>

            <motion.p
              variants={iVar}
              className="mt-8 max-w-lg text-[1.06rem] leading-[1.78] text-cream/58"
            >
              Cuando la sala, la cocina y la caja dejan de pelearse entre sí, el equipo trabaja con más calma
              y el servicio se nota más fluido desde la primera semana.
            </motion.p>

            {/* Métricas — una sola lámina, sin rejilla partida */}
            <motion.div variants={iVar} className="mt-12 max-w-lg">
              <p className="mb-4 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-cream/35">
                En una sola vista
              </p>
              <div className="grid grid-cols-1 divide-y divide-white/10 rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {[
                  { value: "3", label: "frentes sincronizados" },
                  { value: "1", label: "pantalla por turno" },
                  { value: "0", label: "capturas duplicadas" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col justify-center px-6 py-5 sm:min-h-[5.75rem] sm:py-6"
                  >
                    <span className="font-serif text-[2.5rem] font-semibold leading-none tracking-tight text-gold tabular-nums sm:text-[2.75rem]">
                      {item.value}
                    </span>
                    <span className="mt-3 max-w-[14ch] text-[0.58rem] font-bold uppercase leading-snug tracking-[0.22em] text-cream/44">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Testimonios — una sola lectura en L: cita protagonista + ficha */}
          <div className="flex flex-col gap-8 lg:gap-10">
            <motion.div variants={iVar}>
              <p className="mb-4 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-cream/35 lg:text-right">
                En sus palabras
              </p>

              <blockquote className="relative rounded-2xl border border-white/[0.09] bg-white/[0.035] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[12px] lg:p-10">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-6 top-4 font-serif text-[clamp(4rem,12vw,7rem)] italic leading-none text-gold/[0.12] select-none sm:left-8 sm:top-6"
                >
                  &ldquo;
                </span>
                <p className="relative pt-10 font-serif text-[clamp(1.45rem,2.6vw,2.05rem)] font-medium italic leading-[1.35] tracking-[-0.02em] text-cream/[0.92] sm:pt-8">
                  Antes perdíamos horas cerrando caja y cuadrando cuentas. Con Bouquet cobramos más rápido y la sala ya no se
                  queda esperando al cierre.
                </p>
              </blockquote>
            </motion.div>

            <motion.div
              variants={iVar}
              className="flex flex-col gap-6 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.055] to-transparent px-8 py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10"
            >
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-gold/25 bg-gold/[0.08] font-serif text-[1.05rem] font-semibold italic text-gold">
                  RC
                </span>
                <div className="min-w-0">
                  <p className="text-[0.95rem] font-semibold text-cream">Rodrigo Castellanos</p>
                  <p className="mt-1 text-[0.78rem] font-medium text-cream/45">Dueño de restaurante · CDMX</p>
                  <p className="mt-4 text-[0.92rem] leading-[1.65] text-cream/58">
                    Operación de ~90 cubiertos nocturnos, 2 sucursales.
                  </p>
                </div>
              </div>
              <blockquote className="relative border-t border-white/10 pt-6 pl-1 text-[0.92rem] leading-[1.75] text-cream/[0.72] lg:max-w-[22rem] lg:border-l lg:border-t-0 lg:pl-10 lg:pt-1">
                <span className="absolute left-0 top-6 font-serif text-3xl leading-none text-gold/30 lg:left-4 lg:top-5">
                  &ldquo;
                </span>
                <span className="block pl-8">
                  Mis meseros ahora venden más y corren menos detrás de libretas.
                </span>
              </blockquote>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </section>
  );
};
