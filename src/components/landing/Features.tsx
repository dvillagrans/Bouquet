"use client";

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
  hidden: { opacity: 0, y: 15 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: easeOutQuint },
  },
};

export const Features = () => {
  return (
    <section id="como-funciona" className="relative bg-cream py-24 lg:py-32 overflow-hidden border-t border-charcoal/10">
      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-10% 0px" }}
        variants={containerVariants}
        className="mx-auto max-w-7xl px-6 lg:px-10"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-24 lg:mb-32">
          <div className="max-w-2xl">
            <motion.p variants={itemVariants} className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-charcoal/40 mb-6">
              Flujo del turno
            </motion.p>
            <motion.h2 variants={itemVariants} className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-medium italic leading-[1] text-charcoal">
              Menos improvisación. <br /> Más ritmo de servicio.
            </motion.h2>
          </div>
          <motion.p variants={itemVariants} className="max-w-md text-[0.95rem] font-medium leading-[1.8] text-charcoal/50">
            Bouquet te da visibilidad completa de la operación sin interponerse en la atención. Entra la orden, avanza a cocina, se divide o se cobra sin fricción, y la mesa queda lista.
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-x-16 gap-y-24 md:grid-cols-2">
          {/* Sala */}
          <motion.div variants={itemVariants} className="group relative flex flex-col border-t border-charcoal/10 pt-10">
            <span className="absolute -top-[1px] left-0 h-[2px] w-0 bg-charcoal transition-all duration-700 group-hover:w-full" />
            <div className="mb-10 h-32 w-full overflow-hidden flex flex-col justify-end gap-3 opacity-60 transition-opacity duration-500 group-hover:opacity-100">
              {[60, 85, 30].map((width, i) => (
                <div key={i} className="flex h-5 w-full items-center gap-4">
                  <div className="h-px w-8 bg-charcoal/20" />
                  <div className="h-[2px] w-full overflow-hidden bg-charcoal/5">
                    <motion.div 
                      className="h-full bg-charcoal"
                      initial={{ width: 0 }}
                      whileInView={{ width: `${width}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 1.5, delay: 0.5 + i * 0.1, ease: easeOutQuint }}
                    />
                  </div>
                  <span className="text-[0.55rem] font-bold text-charcoal/30">T{i+1}</span>
                </div>
              ))}
            </div>
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-charcoal/40">01 · Sala</p>
            <h3 className="mb-4 font-serif text-[2.2rem] font-semibold leading-tight text-charcoal">Rotación de mesas en tiempo real.</h3>
            <p className="text-[0.9rem] font-medium leading-[1.7] text-charcoal/60">Ve exactamente quién está pagando, quién aún consume y qué mesas ya pueden liberarse para recibir la siguiente reserva en segundos.</p>
          </motion.div>

          {/* Cocina */}
          <motion.div variants={itemVariants} className="group relative flex flex-col border-t border-charcoal/10 pt-10">
            <span className="absolute -top-[1px] left-0 h-[2px] w-0 bg-charcoal transition-all duration-700 group-hover:w-full" />
            <div className="mb-10 h-32 w-full overflow-hidden flex items-end gap-2 opacity-60 transition-opacity duration-500 group-hover:opacity-100">
              {[4, 7, 5, 8, 3, 6, 9].map((height, i) => (
                <motion.div
                  key={i}
                  className="w-full bg-charcoal/10"
                  initial={{ height: 0 }}
                  whileInView={{ height: `${height * 10}%` }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, delay: 0.3 + i * 0.05, ease: easeOutQuint }}
                >
                  <motion.div 
                    className="w-full bg-charcoal"
                    initial={{ height: 0 }}
                    whileHover={{ height: '100%' }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-charcoal/40">02 · Cocina & Barra</p>
            <h3 className="mb-4 font-serif text-[2.2rem] font-semibold leading-tight text-charcoal">Pase sin distracciones.</h3>
            <p className="text-[0.9rem] font-medium leading-[1.7] text-charcoal/60">Cada estación recibe únicamente lo que debe preparar. El pase no se congestiona, el comandero dicta el ritmo exacto de salida.</p>
          </motion.div>

          {/* Caja */}
          <motion.div variants={itemVariants} className="group relative flex flex-col border-t border-charcoal/10 pt-10">
            <span className="absolute -top-[1px] left-0 h-[2px] w-0 bg-charcoal transition-all duration-700 group-hover:w-full" />
            <div className="mb-10 h-32 w-full overflow-hidden flex flex-col justify-end opacity-60 transition-opacity duration-500 group-hover:opacity-100">
              <div className="flex justify-between border-b border-charcoal/10 pb-2 mb-2">
                <div className="h-1.5 w-16 bg-charcoal/20" />
                <div className="h-1.5 w-8 bg-charcoal/40" />
              </div>
              <div className="flex justify-between border-b border-charcoal/10 pb-2 mb-2">
                <div className="h-1.5 w-24 bg-charcoal/20" />
                <div className="h-1.5 w-8 bg-charcoal/40" />
              </div>
              <div className="flex justify-between pt-2">
                <div className="h-2 w-12 bg-charcoal/80" />
                <div className="h-2 w-12 bg-charcoal/80" />
              </div>
            </div>
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-charcoal/40">03 · Caja</p>
            <h3 className="mb-4 font-serif text-[2.2rem] font-semibold leading-tight text-charcoal">Cierre contable a prueba de errores.</h3>
            <p className="text-[0.9rem] font-medium leading-[1.7] text-charcoal/60">Maneja múltiples terminales, divisas, división de cuentas y porcentajes de propina directamente desde la cuenta sin utilizar calculadoras extra.</p>
          </motion.div>

          {/* Gerencia */}
          <motion.div variants={itemVariants} className="group relative flex flex-col border-t border-charcoal/10 pt-10">
            <span className="absolute -top-[1px] left-0 h-[2px] w-0 bg-charcoal transition-all duration-700 group-hover:w-full" />
            <div className="mb-10 h-32 w-full overflow-hidden flex items-center justify-center opacity-60 transition-opacity duration-500 group-hover:opacity-100 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div 
                  initial={{ rotate: 0 }}
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="h-24 w-24 rounded-full border-[1px] border-dashed border-charcoal/30 flex items-center justify-center"
                >
                   <div className="h-16 w-16 rounded-full border-[1px] border-charcoal/20" />
                </motion.div>
              </div>
              <div className="z-10 font-serif text-3xl font-medium text-charcoal tracking-tighter">84%</div>
            </div>
            <p className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.25em] text-charcoal/40">04 · Gerencia</p>
            <h3 className="mb-4 font-serif text-[2.2rem] font-semibold leading-tight text-charcoal">Control estadístico desde remoto.</h3>
            <p className="text-[0.9rem] font-medium leading-[1.7] text-charcoal/60">Vigila tu promedio por cubierto, las cancelaciones críticas y el ticket promedio desde tu teléfono mientras operas otras sucursales.</p>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
