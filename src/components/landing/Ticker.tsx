import { cn } from "@/lib/utils";

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

function TickerRow({
  items,
  reverse = false,
  speed = 36,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
}) {
  const repeatedItems = [...items, ...items, ...items];

  return (
    <div className="overflow-hidden px-4">
      <div
        className={cn(
          "ticker-track flex w-max items-center whitespace-nowrap",
          reverse && "ticker-track-reverse"
        )}
        style={{ animationDuration: `${speed}s` }}
        role="list"
      >
        {repeatedItems.map((item, i) => {
          const isEven = (i % items.length) % 2 === 0;
          return (
            <span key={`${item}-${i}`} className="inline-flex items-center" role="listitem">
              <span className="ticker-item flex items-center gap-4 text-[0.75rem] font-bold uppercase tracking-[0.35em] text-white/80 transition-colors hover:text-white">
                <span className={isEven ? "text-rose shadow-rose/20 drop-shadow-md" : "text-white/40"}>///</span>
                <span>{item}</span>
              </span>
              <Sep />
            </span>
          );
        })}
      </div>
    </div>
  );
}

export const Ticker = () => {
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-burgundy py-8 ticker-fade-mask">
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(199,91,122,0.12) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.03]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 160 160%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
        }}
        aria-hidden
      />

      <div className="relative z-10 flex flex-col gap-6 motion-reduce:gap-8">
        <TickerRow items={rowA} speed={40} />
        <TickerRow items={rowB} speed={50} reverse />
      </div>
    </div>
  );
};

