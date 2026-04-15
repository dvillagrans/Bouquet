"use client";

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
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: easeOutQuint },
  },
};

export const SocialProof = () => (
  <section className="bg-charcoal py-24 lg:py-32 overflow-hidden">
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={containerVariants}
      className="mx-auto max-w-7xl px-6 lg:px-10"
    >
      <div className="grid gap-12 lg:grid-cols-[0.72fr_1fr] lg:items-start">
        <div>
          <motion.p variants={itemVariants} className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-cream/34">
            Prueba social
          </motion.p>
          <motion.h2 variants={itemVariants} className="mt-4 max-w-[9ch] font-serif text-[clamp(2.8rem,5vw,4.8rem)] font-semibold italic leading-[0.95] tracking-[-0.03em] text-cream">
            El turno se siente más corto.
          </motion.h2>
          <motion.p variants={itemVariants} className="mt-6 max-w-xl text-[1rem] leading-[1.8] text-cream/62">
            Cuando la sala, la cocina y la caja dejan de pelearse entre sí, el equipo trabaja con más calma
            y el servicio se nota más fluido desde la primera semana.
          </motion.p>

          <motion.div variants={itemVariants} className="mt-12 flex flex-wrap gap-x-12 gap-y-6">
            {[
              { value: "3", label: "frentes sincronizados" },
              { value: "1", label: "pantalla para el turno" },
              { value: "0", label: "capturas duplicadas" },
            ].map((item) => (
              <div key={item.label} className="flex flex-col">
                <p className="font-serif text-[2.5rem] font-semibold leading-none text-gold">{item.value}</p>
                <p className="mt-2 text-[0.6rem] font-bold uppercase tracking-[0.24em] text-cream/42">{item.label}</p>
              </div>
            ))}
          </motion.div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
          <motion.blockquote variants={itemVariants} className="rounded-[2rem] border border-white/10 bg-white/[0.04] p-8 font-serif text-[clamp(1.8rem,3vw,3.2rem)] font-medium italic leading-[1.18] tracking-[-0.025em] text-cream/80">
            &ldquo;Antes perdíamos horas cerrando caja y cuadrando cuentas. Con Bouquet cobramos más rápido y la sala ya no se queda esperando al cierre.&rdquo;
          </motion.blockquote>

          <motion.div variants={itemVariants} className="flex flex-col justify-between rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <div>
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.3em] text-cream/34">
                Rodrigo Castellanos
              </p>
              <p className="mt-3 max-w-sm text-[0.95rem] leading-[1.75] text-cream/58">
                Dueño de restaurante · CDMX
              </p>
            </div>

            <div className="mt-8 border-t border-white/10 pt-6 text-[0.8rem] leading-[1.8] text-cream/52">
              “Mis meseros ahora venden más y corren menos detrás de libretas.”
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  </section>
);
