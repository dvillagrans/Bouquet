const items = [
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

const Sep = () => (
  <span className="mx-7 inline-block h-[3px] w-[3px] shrink-0 rounded-full bg-glow/35 align-middle" />
);

export const Ticker = () => (
  <div className="overflow-hidden border-y border-wire bg-canvas py-4">
    <div
      className="flex items-center whitespace-nowrap"
      style={{ animation: "ticker 36s linear infinite" }}
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
