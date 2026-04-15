"use client";

import { motion } from "framer-motion";

/*
 *  Ticker — dual counter-scrolling rows.
 *  Row A scrolls left  (ticker / marquee keyframe)
 *  Row B scrolls right (marquee-reverse keyframe)
 *  Different item sets per row to avoid redundancy when both are visible.
 */

const rowA = [
  "Mesa se sienta",
  "Mesero levanta orden",
  "Comanda validada",
  "Pase directo a cocina",
  "Barra recibe bebidas",
  "Alerta de salida",
  "Cuenta solicitada",
  "División por comensal",
  "Cobro confirmado",
  "Mesa liberada",
  "Nuevo turno entra",
  "Servicio sin fricción",
];

const rowB = [
  "Ticket por mesa",
  "Promedio de servicio",
  "Entradas en proceso",
  "Platos en pase",
  "Postres pendientes",
  "Incidencias del turno",
  "Tiempo en caja",
  "Propina registrada",
  "Cierre por mesero",
  "Corte de turno",
  "Inventario crítico",
  "Reporte listo",
];

const Sep = () => (
  <span className="mx-7 inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-glow/30 align-middle" />
);

const TickerRow = ({
  items,
  reverse = false,
  speed = 36,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
}) => (
  <div className="overflow-hidden">
    <div
      className="flex items-center whitespace-nowrap"
      style={{
        animation: `${reverse ? "marquee-reverse" : "marquee"} ${speed}s linear infinite`,
      }}
    >
      {[...items, ...items].map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.28em] text-dim">
            {item}
          </span>
          <Sep />
        </span>
      ))}
    </div>
  </div>
);

export const Ticker = () => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 1, delay: 0.2 }}
    className="overflow-hidden border-y border-wire bg-canvas py-3.5"
  >
    <div className="flex flex-col gap-3">
      <TickerRow items={rowA} speed={38} />
      <TickerRow items={rowB} speed={44} reverse />
    </div>
  </motion.div>
);
