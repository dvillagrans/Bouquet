import Link from "next/link";

const stats = [
  { n: "+40",   label: "restaurantes" },
  { n: "4.9★",  label: "valoración"   },
  { n: "100%",  label: "renovación"   },
];

/*
 *  Concept: "Hoja de Servicio" — the nightly briefing sheet.
 *  Four horizontal bands divided by hairline rules — like a kitchen
 *  service document. Dark, flat, no glows. Every element earns its place.
 *
 *  Band 1 — edition + live time label         (48px)
 *  Band 2 — big headline + CTA                (flex, generous)
 *  Band 3 — three spread stats                (56px)
 */
export const CtaBand = () => (
  <section className="overflow-hidden bg-canvas" id="contacto">

    {/* Band 1 — document header */}
    <div className="border-b border-light/[0.07] px-6 py-4 lg:px-12">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        <span className="text-[0.56rem] font-bold uppercase tracking-[0.38em] text-dim">
          Bouquet OS · Alto Rendimiento
        </span>
        <span className="flex items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.38em] text-dim">
          <span
            className="h-1.5 w-1.5 rounded-full bg-sage-deep"
            style={{ animation: "pulse-slow 2.4s ease-in-out infinite" }}
              aria-hidden="true"
          />
          Turno nocturno
        </span>
      </div>
    </div>

    {/* Band 2 — headline + action */}
    <div className="px-6 py-20 lg:px-12 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-14 lg:grid-cols-[1fr_auto] lg:items-end lg:gap-20">

          {/* Headline */}
          <h2 className="font-serif text-[clamp(2.5rem,6.8vw,6.5rem)] font-medium leading-[0.88] tracking-[-0.04em] text-light">
            Deja de perder dinero y <br />multiplica tus ventas<br />
            <span className="italic text-light/55">desde tu próximo turno.</span>
          </h2>

          {/* CTA block */}
          <div className="flex flex-col gap-4 lg:items-end lg:pb-2">
            <Link
              href="#demo"
              className="group inline-flex min-h-11 items-center gap-2.5 bg-cream px-8 text-[0.82rem] font-bold text-charcoal shadow-none transition-all duration-300 hover:-translate-y-px hover:bg-ivory focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              style={{ height: "3.25rem" }}
            >
              Agenda una demostración y vende más
              <svg
                className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.2}
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </Link>
            <p className="text-[0.6rem] font-medium text-dim">
              Instalación en 1 día · Acompañamiento VIP · Sin contratos forzosos
            </p>
          </div>
        </div>
      </div>
    </div>

    {/* Band 3 — stats spread */}
    <div className="border-t border-light/[0.07] px-6 py-10 lg:px-12">
      <div className="mx-auto grid max-w-7xl grid-cols-3">
        {stats.map(({ n, label }, i) => (
          <div
            key={label}
            className={[
              "flex flex-col gap-1.5 py-1",
              i === 1 ? "items-center text-center" : "",
              i === 2 ? "items-end text-right" : "",
              i > 0 ? "border-l border-light/[0.07] pl-8 sm:pl-12" : "",
            ].join(" ")}
          >
            <p className="font-serif text-[clamp(1.6rem,3.5vw,2.4rem)] font-semibold leading-none text-glow">
              {n}
            </p>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.26em] text-dim">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
