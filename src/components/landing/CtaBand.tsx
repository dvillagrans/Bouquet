"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const easeOutQuint = [0.22, 1, 0.36, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOutQuint },
  },
};

export const CtaBand = () => {
  return (
    <section
      id="contacto"
      className="relative border-t border-charcoal/10 bg-ivory py-24 lg:py-32 overflow-hidden"
    >
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={containerVariants}
        className="mx-auto grid max-w-[1200px] gap-12 px-6 lg:grid-cols-[1fr_auto] lg:items-center lg:px-8"
      >
        <div className="max-w-2xl">
          <motion.p variants={itemVariants} className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-charcoal/38">
            Siguiente paso
          </motion.p>
          <motion.h2 variants={itemVariants} className="mt-4 text-balance font-sans text-5xl font-black tracking-[-0.06em] text-charcoal sm:text-6xl md:text-7xl lg:text-[5.2rem] lg:leading-[0.95]">
            Haz que el turno se vea igual de bien que se siente.
          </motion.h2>

          <motion.p variants={itemVariants} className="mt-7 max-w-xl text-balance text-lg leading-[1.8] text-charcoal/64 font-medium">
            Si quieres que Bouquet se adapte a tu servicio, agenda una demo. Te mostramos el flujo completo
            con sala, cocina y caja en una sola vista para taquerias, barras y casual dining.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-7 grid gap-2.5 sm:grid-cols-3">
            {[
              "No tienes que cambiar de equipo",
              "No necesitas migracion compleja",
              "Tu operacion sigue corriendo",
            ].map((item) => (
              <p
                key={item}
                className="inline-flex items-center gap-2 rounded-full border border-charcoal/10 bg-cream px-3 py-1.5 text-[0.72rem] font-semibold text-charcoal/65"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sage-deep" aria-hidden="true" />
                {item}
              </p>
            ))}
          </motion.div>

          <motion.div variants={itemVariants} className="mt-10 flex w-full flex-col sm:flex-row items-center gap-4">
            <Link
              href="#contacto"
              className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full bg-charcoal px-10 text-lg font-semibold text-cream shadow-[0_18px_40px_-20px_rgba(43,36,30,0.6)] transition-transform hover:-translate-y-0.5 hover:bg-charcoal-light active:scale-[0.98]"
            >
              Reservar demo de 20 min
            </Link>
            <Link
              href="#como-funciona"
              className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full border border-charcoal/12 px-10 text-lg font-semibold text-charcoal transition-colors hover:bg-white/60 hover:-translate-y-0.5"
            >
              Revisar flujo completo
            </Link>
          </motion.div>
        </div>

        <motion.div
          variants={itemVariants}
          className="grid gap-4 rounded-[2rem] border border-charcoal/10 bg-white/70 p-6 shadow-[0_20px_50px_-34px_rgba(43,36,30,0.35)]"
        >
          {[
            ["Configuración", "1 día"],
            ["Dispositivos", "Cualquier"],
            ["Integración", "Nativa"],
            ["Soporte", "Humano"],
          ].map(([label, value]) => (
            <div key={label} className="flex items-center justify-between gap-8 border-b border-charcoal/8 pb-3 last:border-b-0 last:pb-0">
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.28em] text-charcoal/38">{label}</span>
              <span className="font-serif text-[1.4rem] italic text-charcoal">{value}</span>
            </div>
          ))}
        </motion.div>

      </motion.div>
    </section>
  );
};
