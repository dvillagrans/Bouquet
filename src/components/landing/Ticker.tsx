/*
 *  Ticker — dual counter-scrolling rows.
 *  Row A scrolls left  (ticker / marquee keyframe)
 *  Row B scrolls right (marquee-reverse keyframe)
 *  Different item sets per row to avoid redundancy when both are visible.
 */

const rowA = [
  "Mesas en vivo",
  "Órdenes activas",
  "Flujo de cocina",
  "Cobro instantáneo",
  "Control de piso",
  "Turnos coordinados",
  "Métricas de turno",
  "Reservas integradas",
  "Sala sincronizada",
  "Pagos sin fricción",
  "Alertas de servicio",
  "Vista de cocina",
];

const rowB = [
  "Tiempo en mesa",
  "División de cuenta",
  "Pase a cocina",
  "Propina digital",
  "Control de acceso",
  "Comensal digital",
  "Resumen de turno",
  "Confirmación de orden",
  "Cierre exprés",
  "Nota de cocina",
  "Servicio coordinado",
  "Mesa en tiempo real",
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
        animation: `${reverse ? "marquee-reverse" : "ticker"} ${speed}s linear infinite`,
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
  <div className="overflow-hidden border-y border-wire bg-canvas py-3.5">
    <div className="flex flex-col gap-3">
      <TickerRow items={rowA} speed={38} />
      <TickerRow items={rowB} speed={44} reverse />
    </div>
  </div>
);
