import { ProductMockup } from "@/components/landing/ProductMockup";

/*
 *  H-4 fix: replaced 4 identical rounded-2xl cards with a flat typographic strip.
 *  No card frames — just clean label + value + sub text in a grid row.
 */
export const DashboardSection = () => (
  <section className="bg-canvas py-24 lg:py-32" id="producto">
    <div className="mx-auto max-w-7xl px-6 lg:px-10">

      {/* Header */}
      <div className="mb-14 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="h-px w-6 shrink-0 bg-glow/50" aria-hidden="true" />
          <span className="text-[0.64rem] font-bold uppercase tracking-[0.34em] text-dim">El producto</span>
        </div>
        <h2 className="max-w-[26ch] font-serif text-[clamp(1.9rem,3.2vw,3.2rem)] font-medium italic leading-[1.1] text-light">
          Tu sala, tus órdenes y tus pagos. En un solo lugar.
        </h2>
        <p className="max-w-[46ch] text-[0.9rem] font-medium leading-[1.8] text-dim">
          Bouquet conecta sala, cocina y caja en tiempo real. Sin tablets extra, sin hojas de Excel,
          sin walkie-talkies. Solo control.
        </p>
      </div>

      {/* Mockup */}
      <ProductMockup />

      {/* Fact strip — typographic, no card frames */}
      <div className="mt-12 grid grid-cols-2 gap-x-8 gap-y-8 border-t border-wire pt-10 sm:grid-cols-4 sm:gap-x-0 sm:divide-x sm:divide-wire">
        {[
          { label: "Configuración",  value: "1 día",     sub: "Del onboarding al primer turno" },
          { label: "Dispositivos",   value: "Cualquier", sub: "iPad, tablet, laptop, teléfono"  },
          { label: "Integraciones",  value: "Nativas",   sub: "POS, impresoras, terminales"      },
          { label: "Soporte",        value: "24/7",      sub: "Humano, en español, siempre"      },
        ].map(({ label, value, sub }) => (
          <div key={label} className="flex flex-col gap-1.5 sm:px-8 sm:first:pl-0 sm:last:pr-0">
            <p className="text-[0.6rem] font-bold uppercase tracking-[0.28em] text-dim">{label}</p>
            <p className="font-serif text-[1.5rem] font-semibold leading-none text-glow">{value}</p>
            <p className="text-[0.72rem] font-medium leading-snug text-dim">{sub}</p>
          </div>
        ))}
      </div>

    </div>
  </section>
);
