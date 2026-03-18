import Link from "next/link";

export const CtaBand = () => (
  <section className="relative overflow-hidden bg-canvas py-32 lg:py-44">
    {/* Subtle ambient — just enough, not AI-blob levels */}
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_55%_at_50%_110%,rgba(201,160,84,0.07),transparent)]"
    />

    <div className="relative mx-auto max-w-7xl px-6 lg:px-10">
      {/* Split: big headline left, action right */}
      <div className="flex flex-col gap-12 lg:flex-row lg:items-end lg:justify-between">

        {/* Left — editorial headline */}
        <div>
          <span className="text-[0.63rem] font-bold uppercase tracking-[0.36em] text-dim">
            Empieza hoy
          </span>
          <h2 className="mt-5 max-w-[18ch] font-serif text-[clamp(2.8rem,5.8vw,6rem)] font-medium italic leading-[0.92] tracking-[-0.035em] text-light">
            ¿Listo para operar con claridad?
          </h2>
        </div>

        {/* Right — description + CTA */}
        <div className="flex flex-col gap-6 lg:items-end lg:pb-2">
          <p className="max-w-[34ch] text-[0.9rem] font-medium leading-[1.85] text-dim lg:text-right">
            Únete a los restaurantes que ya coordinan sala, cocina y caja desde un solo lugar. Sin caos, sin papeles.
          </p>
          <div className="flex flex-col items-start gap-3 lg:items-end">
            <Link
              href="#demo"
              className="group inline-flex items-center gap-2.5 rounded-full bg-glow px-9 py-4 text-[0.875rem] font-bold text-ink shadow-[0_0_44px_-10px_rgba(201,160,84,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_0_60px_-8px_rgba(201,160,84,0.68)]"
            >
              Solicitar demo gratuito
              <svg
                className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14m-5-5 5 5-5 5" />
              </svg>
            </Link>
            <p className="text-[0.68rem] font-medium text-dim">
              Sin tarjeta de crédito · Configuración en 1 día
            </p>
          </div>
        </div>
      </div>
    </div>
  </section>
);
