"use client";

import { motion, useReducedMotion } from "framer-motion";

const rowA = [
  "Mesas sentadas",
  "Órdenes procesadas",
  "Comandas validadas",
  "Envío a cocina",
  "Bebidas servidas",
  "Tiempos de salida",
  "Cuentas pagadas",
  "División inteligente",
  "Cobros confirmados",
  "Mesas liberadas",
  "Métricas en vivo",
  "Operación continua",
];

const rowB = [
  "Tickets promedio",
  "Volumen de ventas",
  "Entradas y fuertes",
  "Tráfico de barra",
  "Postres pendientes",
  "Control de turnos",
  "Velocidad de caja",
  "Propinas exactas",
  "Corte ciego",
  "Cierre perfecto",
  "Inventario sincronizado",
  "Reportes al cierre",
];

const Sep = () => (
  <span className="mx-8 inline-block h-[4px] w-[4px] shrink-0 rounded-full bg-rose/30 shadow-[0_0_8px_rgba(199,91,122,0.5)] align-middle" />
);

const TickerRow = ({
  items,
  reverse = false,
  speed = 36,
  pauseMotion = false,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
  pauseMotion?: boolean;
}) => {
  if (pauseMotion) {
    return (
      <div className="overflow-hidden px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-2" role="list">
          {items.map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center" role="listitem">
                <span className="text-[0.75rem] font-bold uppercase tracking-[0.35em] text-white/85 flex items-center gap-4">
                <span className={i % 2 === 0 ? "text-rose" : "text-white/30"} aria-hidden="true">
                  ///
                </span>
                <span>{item}</span>
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div
        className="flex items-center whitespace-nowrap"
        style={{
          animation: `${reverse ? "marquee-reverse" : "marquee"} ${speed}s linear infinite`,
        }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="text-[0.75rem] font-bold uppercase tracking-[0.35em] text-white/80 flex items-center gap-4 transition-colors hover:text-white">
              <span className={i % 2 === 0 ? "text-rose shadow-rose/20 drop-shadow-md" : "text-white/40"}>///</span>
              <span>{item}</span>
            </span>
            <Sep />
          </span>
        ))}
      </div>
    </div>
  );
};

export const Ticker = () => {
  const pauseMotion = useReducedMotion() === true;

  return (
    <motion.div
      initial={{ opacity: pauseMotion ? 1 : 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: pauseMotion ? 0 : 1, ease: [0.16, 1, 0.3, 1] }}
      className="relative overflow-hidden border-y border-white/5 bg-burgundy py-8"
      style={
        pauseMotion
          ? undefined
          : {
              WebkitMaskImage: "linear-gradient(to right, transparent 0, black 15%, black 85%, transparent 100%)",
              maskImage: "linear-gradient(to right, transparent 0, black 15%, black 85%, transparent 100%)",
            }
      }
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(199,91,122,0.12) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.03]"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        aria-hidden
      />

      <div className={`relative z-10 flex flex-col ${pauseMotion ? "gap-8" : "gap-6"}`}>
        <TickerRow items={rowA} speed={40} pauseMotion={pauseMotion} />
        <TickerRow items={rowB} speed={50} reverse pauseMotion={pauseMotion} />
      </div>
    </motion.div>
  );
};
