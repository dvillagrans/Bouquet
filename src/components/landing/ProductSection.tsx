"use client";

import { motion } from "framer-motion";
import { ProductMockup } from "@/components/landing/ProductMockup";

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

export const ProductSection = () => (
  <section
    className="bg-cream py-24 lg:py-32 overflow-hidden"
    id="producto"
  >
    <motion.div
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-10% 0px" }}
      variants={containerVariants}
      className="mx-auto max-w-7xl px-6 lg:px-10"
    >
      {/* Section header */}
      <motion.div variants={itemVariants} className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="h-px w-6 bg-ember" />
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-charcoal/40">
            El producto
          </span>
        </div>
        <h2 className="max-w-[22ch] font-serif text-[clamp(2rem,3.5vw,3.5rem)] font-medium italic leading-[1.1] text-charcoal">
          Tu sala, tus órdenes y tus pagos. En un solo lugar.
        </h2>
        <p className="mt-2 max-w-lg text-[0.9rem] font-medium leading-[1.8] text-charcoal/50">
          Bouquet conecta sala, cocina y caja en tiempo real. Sin tablets extra, sin hojas de Excel,
          sin walkie-talkies.
        </p>
      </motion.div>

      {/* Step Process */}
      <motion.div variants={itemVariants} className="mt-16 grid gap-8 sm:grid-cols-3 sm:gap-0 relative">
        {/* Continuous background line */}
        <div className="absolute top-[0.4rem] left-0 right-0 h-px bg-charcoal/10 hidden sm:block" />
        
        {/* Animated progressive line */}
        <motion.div 
          className="absolute top-[0.4rem] left-0 h-px bg-ember hidden sm:block origin-left"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.5, delay: 0.5, ease: easeOutQuint }}
        />

        {[
          { step: "01", title: "Sala toma la orden", desc: "El mesero captura una vez y queda visible para todo el turno." },
          { step: "02", title: "Cocina y barra ejecutan", desc: "Cada estación recibe su parte con estado y prioridad." },
          { step: "03", title: "Caja cierra sin fricción", desc: "Divide cuentas, cobra y libera mesa sin romper el flujo." },
        ].map(({ step, title, desc }) => (
          <div key={step} className="flex flex-col pr-8 pt-6 sm:pt-0 relative group">
            {/* Dot marker */}
            <div className="absolute left-0 top-0 sm:-top-[0.4rem] h-[0.8rem] w-[0.8rem] rounded-full border-[2px] border-cream bg-ember z-10 transition-transform duration-500 group-hover:scale-125" />
            
            <div className="mt-4 flex flex-col gap-2">
              <span className="text-[0.65rem] font-bold text-ember">
                {step}
              </span>
              <p className="text-[0.85rem] font-bold uppercase tracking-[0.15em] text-charcoal">{title}</p>
            </div>
            <p className="mt-4 text-[0.85rem] font-medium leading-relaxed text-charcoal/60">{desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Mockup */}
      <motion.div variants={itemVariants} className="mt-20">
        <ProductMockup />
      </motion.div>

      {/* Supporting facts */}
      <motion.div variants={itemVariants} className="mt-16 grid grid-cols-2 gap-x-8 gap-y-10 border-t border-charcoal/10 pt-12 sm:grid-cols-4 sm:divide-x sm:divide-charcoal/10">
        {[
          { label: "Configuración",  value: "1 día",    sub: "Del onboarding al turno" },
          { label: "Dispositivos",   value: "Todos", sub: "Tablets, cel, laptop"  },
          { label: "Integraciones",  value: "Nativas",   sub: "POS, terminales, cash"      },
          { label: "Soporte",        value: "24/7",      sub: "Humano y en español"      },
        ].map(({ label, value, sub }) => (
          <div key={label} className="flex flex-col sm:px-6 sm:first:pl-0 sm:last:pr-0 transition-opacity duration-300 hover:opacity-70">
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-charcoal/40">
              {label}
            </p>
            <p className="mt-2 font-serif text-[1.75rem] font-semibold leading-none text-charcoal">
              {value}
            </p>
            <p className="mt-3 text-[0.78rem] font-medium leading-snug text-charcoal/50">{sub}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  </section>
);
