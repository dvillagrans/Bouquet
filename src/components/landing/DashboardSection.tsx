import { ProductMockup } from "@/components/landing/ProductMockup";

export const DashboardSection = () => (
  <section className="bg-canvas py-24 lg:py-32" id="producto">
    <div className="mx-auto max-w-7xl px-6 lg:px-10">

      {/* Header */}
      <div className="mb-14 flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <span className="h-px w-6 shrink-0 bg-glow/60" />
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

      {/* Fact cards */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Configuración",  value: "1 día",     sub: "Del onboarding al primer turno" },
          { label: "Dispositivos",   value: "Cualquier", sub: "iPad, tablet, laptop, teléfono"  },
          { label: "Integraciones",  value: "Nativas",   sub: "POS, impresoras, terminales"      },
          { label: "Soporte",        value: "24/7",      sub: "Humano, en español, siempre"      },
        ].map(({ label, value, sub }) => (
          <div key={label} className="rounded-2xl border border-wire bg-panel p-6">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.26em] text-dim">{label}</p>
            <p className="mt-2 font-serif text-[1.8rem] font-semibold leading-none text-glow">{value}</p>
            <p className="mt-2 text-[0.78rem] font-medium leading-snug text-dim">{sub}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
