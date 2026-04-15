"use client";

import { motion } from "framer-motion";
import { ProductMockup } from "@/components/landing/ProductMockup";

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

      <motion.div variants={itemVariants} className="mt-10 grid gap-3 rounded-2xl border border-charcoal/[0.08] bg-ivory p-4 sm:grid-cols-3 sm:p-5">
        {[
          { step: "1", title: "Sala toma la orden", desc: "El mesero captura una vez y queda visible para todo el turno." },
          { step: "2", title: "Cocina y barra ejecutan", desc: "Cada estación recibe su parte con estado y prioridad." },
          { step: "3", title: "Caja cierra sin fricción", desc: "Divide cuentas, cobra y libera mesa sin romper el flujo." },
        ].map(({ step, title, desc }) => (
          <div key={step} className="rounded-xl border border-charcoal/[0.08] bg-cream px-4 py-3.5 transition-colors hover:bg-ivory/50">
            <div className="flex items-center gap-2.5">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-charcoal text-[0.62rem] font-bold text-cream">
                {step}
              </span>
              <p className="text-[0.76rem] font-bold uppercase tracking-[0.18em] text-charcoal/55">{title}</p>
            </div>
            <p className="mt-2.5 text-[0.78rem] font-medium leading-relaxed text-charcoal/58">{desc}</p>
          </div>
        ))}
      </motion.div>

      {/* Mockup */}
      <motion.div variants={itemVariants} className="mt-14">
        <ProductMockup />
      </motion.div>

      {/* Supporting facts */}
      <motion.div variants={itemVariants} className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Configuración",  value: "1 día",    sub: "Del onboarding al primer turno" },
          { label: "Dispositivos",   value: "Cualquier", sub: "iPad, tablet, laptop, teléfono"  },
          { label: "Integraciones",  value: "Nativas",   sub: "POS, impresoras, terminales"      },
          { label: "Soporte",        value: "24/7",      sub: "Humano, en español, siempre"      },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-2xl border border-charcoal/[0.08] bg-ivory p-6 transition-transform hover:-translate-y-1 hover:shadow-sm"
          >
            <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-charcoal/35">
              {label}
            </p>
            <p className="mt-2 font-serif text-[1.75rem] font-semibold leading-none text-charcoal">
              {value}
            </p>
            <p className="mt-2 text-[0.78rem] font-medium leading-snug text-charcoal/50">{sub}</p>
          </div>
        ))}
      </motion.div>
    </motion.div>
  </section>
);
