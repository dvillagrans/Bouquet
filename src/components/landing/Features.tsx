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

export const Features = () => {
          return (
            <section
              id="como-funciona"
              className="relative border-t border-charcoal/8 bg-cream py-28 lg:py-32 overflow-hidden"
            >
              <motion.div
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-10% 0px" }}
                variants={containerVariants}
                className="mx-auto max-w-[1200px] px-6 lg:px-8"
              >
                <div className="mb-20 max-w-3xl">
                  <motion.p variants={itemVariants} className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-charcoal/40">
                    Cómo fluye el turno
                  </motion.p>
                  <motion.h2 variants={itemVariants} className="mt-4 text-balance font-sans text-5xl font-black tracking-[-0.06em] text-charcoal md:text-6xl">
                    Menos improvisación. <br /> Más ritmo de servicio.
                  </motion.h2>
                  <motion.p variants={itemVariants} className="mt-6 max-w-2xl text-xl leading-relaxed text-charcoal/62">
                    Bouquet convierte el flujo del restaurante en una secuencia visible: entra la orden, avanza a cocina,
                    se cobra sin fricción y la mesa queda lista para el siguiente servicio.
                  </motion.p>
                </div>

                <div className="grid grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-2">
                  <motion.div variants={itemVariants} className="md:col-span-2 rounded-[2rem] border border-charcoal/10 bg-white/70 p-10 shadow-[0_18px_50px_-32px_rgba(43,36,30,0.38)] backdrop-blur-sm flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10 max-w-md">
                      <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-charcoal/36">Sala</p>
                      <h3 className="mb-4 text-3xl font-black tracking-[-0.05em] text-charcoal">
                        Rotación de mesas visible al instante
                      </h3>
                      <p className="text-lg leading-relaxed text-charcoal/62">
                        Ve quién está por cerrar, quién aún consume y qué mesa puede pasar al siguiente turno sin perder segundos.
                      </p>
                    </div>

                    <div className="mt-12 w-full max-w-lg rounded-2xl border border-charcoal/8 bg-cream p-6 shadow-inner transition-transform duration-700 ease-out group-hover:-translate-y-2">
                      <div className="mb-6 flex items-center justify-between">
                        <div className="h-6 w-32 rounded-full bg-charcoal/10" />
                        <div className="h-6 w-16 rounded-full bg-gold/18" />
                      </div>
                      <div className="space-y-3">
                        <div className="flex h-12 w-full items-center rounded-xl border border-charcoal/8 bg-white px-4">
                          <div className="h-3 w-1/3 rounded-full bg-charcoal/16" />
                        </div>
                        <div className="flex h-12 w-full items-center rounded-xl border border-charcoal/8 bg-white px-4">
                          <div className="h-3 w-1/2 rounded-full bg-gold/25" />
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="rounded-[2rem] border border-ember/10 bg-[#fbf4ee] p-10 shadow-[0_18px_50px_-36px_rgba(168,86,42,0.35)] flex flex-col relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-ember/50">Cocina</p>
                      <h3 className="mb-4 text-2xl font-black tracking-[-0.04em] text-charcoal">
                        Pase limpio, sin dobles capturas
                      </h3>
                      <p className="text-charcoal/58">
                        La orden entra una sola vez y llega donde debe llegar. Menos errores, menos retrabajo, menos ruido.
                      </p>
                    </div>
                    <div className="mt-auto pt-10">
                      <div className="aspect-square w-full rounded-2xl border border-ember/10 bg-white p-4 shadow-sm flex flex-col gap-4 transition-transform duration-500 ease-out group-hover:scale-105">
                        <div className="h-8 w-8 rounded-full bg-ember/12" />
                        <div className="h-3 w-full rounded-full bg-ember/8" />
                        <div className="h-3 w-4/5 rounded-full bg-ember/8" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="rounded-[2rem] border border-sage/10 bg-[#f3f6f1] p-10 shadow-[0_18px_50px_-36px_rgba(110,139,106,0.32)] flex flex-col relative overflow-hidden group">
                    <div className="relative z-10">
                      <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-sage-deep/55">Caja</p>
                      <h3 className="mb-4 text-2xl font-black tracking-[-0.04em] text-charcoal">
                        Cobro que no detiene la mesa
                      </h3>
                      <p className="text-charcoal/58">
                        Divide cuentas, cobra por QR y libera la mesa sin cambiar de sistema ni perder el contexto del turno.
                      </p>
                    </div>
                    <div className="mt-auto pt-10">
                      <div className="flex h-32 w-full items-end gap-2 rounded-2xl border border-sage/10 bg-white p-4 shadow-sm transition-transform duration-500 ease-out group-hover:scale-105 origin-bottom">
                        <div className="h-1/3 w-1/4 rounded-t-md bg-sage/22" />
                        <div className="h-2/3 w-1/4 rounded-t-md bg-sage/32" />
                        <div className="h-1/2 w-1/4 rounded-t-md bg-sage/42" />
                        <div className="h-full w-1/4 rounded-t-md bg-sage-deep/65" />
                      </div>
                    </div>
                  </motion.div>

                  <motion.div variants={itemVariants} className="md:col-span-2 rounded-[2rem] bg-charcoal p-10 shadow-[0_28px_80px_-30px_rgba(43,36,30,0.75)] flex flex-col justify-between relative overflow-hidden group">
                    <div className="relative z-10 max-w-md">
                      <p className="mb-4 text-[0.62rem] font-bold uppercase tracking-[0.3em] text-cream/34">Operación</p>
                      <h3 className="mb-4 text-3xl font-black tracking-[-0.05em] text-cream">
                        El equipo ve el turno completo
                      </h3>
                      <p className="text-lg leading-relaxed text-cream/62">
                        Bouquet une sala, cocina y caja en una vista compartida para que cada decisión llegue antes del caos.
                      </p>
                    </div>

                    <div className="mt-12 w-full max-w-lg rounded-2xl border border-white/10 bg-white/[0.04] p-6 flex gap-4">
                      <div className="flex aspect-square w-1/2 items-center justify-center rounded-xl border border-white/10 bg-white/[0.03]">
                        <div className="h-16 w-16 rounded-full border-4 border-cream/20 border-t-cream animate-spin" />
                      </div>
                      <div className="flex flex-1 flex-col justify-center gap-3">
                        <div className="h-4 w-full rounded-full bg-white/10" />
                        <div className="h-4 w-3/4 rounded-full bg-white/10" />
                        <div className="h-4 w-1/2 rounded-full bg-white/10" />
                      </div>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            </section>
          );
        };
