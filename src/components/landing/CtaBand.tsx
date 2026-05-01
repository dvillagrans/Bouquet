"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const easeOutQuint = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: easeOutQuint },
  },
};

export const CtaBand = () => {
  return (
    <section
      id="contacto"
      className="relative border-t border-burgundy/10 bg-rose-cream py-20 lg:py-28 overflow-hidden"
    >
      {/* Bookend */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-burgundy/8 via-burgundy/0 to-transparent"
      />

      {/* Decoración floral */}
      <svg viewBox="0 0 400 100" className="absolute -right-20 top-10 h-24 w-96 opacity-20" aria-hidden="true">
        <path d="M0 50 Q100 10 200 50 Q300 90 400 50" stroke="#C75B7A" strokeWidth="1" fill="none" />
        <circle cx="50" cy="35" r="6" fill="#E8A5B0" />
        <circle cx="150" cy="55" r="5" fill="#D68C9F" />
        <circle cx="250" cy="40" r="7" fill="#C75B7A" />
        <circle cx="350" cy="60" r="5" fill="#E8A5B0" />
      </svg>

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={containerVariants}
        className="mx-auto grid max-w-[1200px] gap-12 px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8"
      >
        <div className="max-w-2xl">
          <motion.p variants={itemVariants} className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-burgundy/38">
            Siguiente paso
          </motion.p>
          <motion.h2 variants={itemVariants} className="mt-4 text-balance font-sans text-4xl font-black tracking-[-0.05em] text-burgundy sm:text-5xl md:text-6xl lg:text-[4.5rem] lg:leading-[0.95]">
            Haz que el turno florezca.
          </motion.h2>

          <motion.p variants={itemVariants} className="mt-7 max-w-xl text-balance text-lg leading-[1.8] text-burgundy/60 font-medium">
            Si quieres que Bouquet se adapte a tu servicio, agenda una demo. Te mostramos el flujo completo
            con sala, cocina y caja en una sola vista.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-7 grid gap-2.5 sm:grid-cols-3">
            {[
              "No tienes que cambiar de equipo",
              "No necesitas migracion compleja",
              "Tu operacion sigue corriendo",
            ].map((item) => (
              <p
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-burgundy/10 bg-white px-3 py-1.5 text-[0.72rem] font-semibold text-burgundy/65"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sage-deep" aria-hidden="true" />
                {item}
              </p>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 flex w-full flex-col sm:flex-row items-center gap-4">
            <Link
              href="#contacto"
              className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full bg-burgundy px-10 text-lg font-semibold text-white shadow-[0_18px_40px_-20px_rgba(74,26,44,0.5)] transition-transform hover:-translate-y-0.5 hover:bg-burgundy-light active:scale-[0.98]"
            >
              Reservar demo de 20 min
            </Link>
            <Link
              href="#como-funciona"
              className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full border border-burgundy/12 px-10 text-lg font-semibold text-burgundy transition-colors hover:bg-white/80 hover:-translate-y-0.5"
            >
              Revisar flujo completo
            </Link>
          </motion.div>
        </div>

        {/* Summary card */}
        <motion.div
          variants={itemVariants}
          className="relative rounded-[2rem] p-1.5 ring-1 ring-burgundy/10 bg-gradient-to-b from-white/80 to-rose-cream/50 shadow-[0_30px_60px_-34px_rgba(74,26,44,0.3),inset_0_1px_0_rgba(255,255,255,0.9)]"
        >
          <div className="rounded-[calc(2rem-0.375rem)] bg-white/65 p-6 ring-1 ring-burgundy/[0.05]">
            <p className="mb-5 flex items-center gap-3 text-[0.6rem] font-bold uppercase tracking-[0.32em] text-burgundy/40">
              <span className="h-[2px] w-5 bg-rose/70" aria-hidden="true" />
              Plan práctico
            </p>
            <div className="grid gap-3.5">
              {[
                ["Configuración", "1 día"],
                ["Dispositivos", "Cualquier"],
                ["Integración", "Nativa"],
                ["Soporte", "Humano"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-8 border-b border-burgundy/8 pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-burgundy/42">
                    {label}
                  </span>
                  <span className="font-serif text-[1.3rem] italic text-burgundy">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
};
