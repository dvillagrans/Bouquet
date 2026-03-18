import { ProductMockup } from "@/components/landing/ProductMockup";

export const ProductSection = () => (
  <section className="bg-cream py-24 lg:py-32" id="producto">
    <div className="mx-auto max-w-7xl px-6 lg:px-10">
      {/* Section header */}
      <div className="flex flex-col gap-3">
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
      </div>

      {/* Mockup */}
      <div className="mt-14">
        <ProductMockup />
      </div>

      {/* Supporting facts */}
      <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Configuración",  value: "1 día",    sub: "Del onboarding al primer turno" },
          { label: "Dispositivos",   value: "Cualquier", sub: "iPad, tablet, laptop, teléfono"  },
          { label: "Integraciones",  value: "Nativas",   sub: "POS, impresoras, terminales"      },
          { label: "Soporte",        value: "24/7",      sub: "Humano, en español, siempre"      },
        ].map(({ label, value, sub }) => (
          <div
            key={label}
            className="rounded-2xl border border-charcoal/[0.08] bg-ivory p-6"
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
      </div>
    </div>
  </section>
);
