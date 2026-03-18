const items = [
  "Mesas en vivo",
  "Órdenes activas",
  "Flujo de cocina",
  "Cobro instantáneo",
  "Control de piso",
  "Turnos coordinados",
  "Métricas de servicio",
  "Reservas integradas",
  "Sala sincronizada",
  "Pagos sin fricción",
];

const Dot = () => (
  <span className="mx-6 inline-block h-1 w-1 shrink-0 rounded-full bg-gold/40" />
);

export const MarqueeStrip = () => (
  <div className="overflow-hidden bg-charcoal py-5" id="features">
    {/* Row 1 — left to right */}
    <div className="flex items-center whitespace-nowrap" style={{ animation: "marquee 32s linear infinite" }}>
      {[...items, ...items].map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-cream/55">
            {item}
          </span>
          <Dot />
        </span>
      ))}
    </div>

    {/* Row 2 — right to left, offset */}
    <div
      className="mt-2 flex items-center whitespace-nowrap"
      style={{ animation: "marquee-reverse 40s linear infinite" }}
    >
      {[...items.slice(4), ...items, ...items.slice(0, 4)].map((item, i) => (
        <span key={i} className="inline-flex items-center">
          <span className="text-[0.68rem] font-bold uppercase tracking-[0.3em] text-cream/30">
            {item}
          </span>
          <Dot />
        </span>
      ))}
    </div>
  </div>
);
