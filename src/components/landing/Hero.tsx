import Link from "next/link";

import {
  AmbientLeaf,
  CornerOrnament,
  FloralEngraving,
} from "@/components/landing/BotanicalElements";
import { ProductMockup } from "@/components/landing/ProductMockup";

const inlineStats = [
  { n: "+40", label: "restaurantes" },
  { n: "4.9★", label: "valoración" },
  { n: "100%", label: "renovación" },
];

export const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-cream px-6 pb-20 pt-28 sm:pt-32 lg:px-10 lg:pt-36">
      {/* Decorative botanicals */}
      <CornerOrnament className="absolute left-6 top-28 hidden h-20 w-20 text-charcoal/18 xl:block" />
      <CornerOrnament className="absolute bottom-20 right-6 hidden h-20 w-20 text-charcoal/14 xl:block" flip />
      <AmbientLeaf className="absolute left-0 top-44 hidden h-32 w-32 -rotate-12 text-charcoal/45 xl:block" size={128} />
      <FloralEngraving className="absolute right-[9%] top-28 hidden h-36 w-36 text-gold/45 xl:block" />

      {/* Ambient glows */}
      <div className="pointer-events-none absolute left-[10%] top-[22%] hidden h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(168,185,165,0.14),rgba(168,185,165,0))] blur-3xl lg:block" />
      <div className="pointer-events-none absolute right-[8%] top-[10%] hidden h-52 w-52 rounded-full bg-[radial-gradient(circle,rgba(183,146,93,0.11),rgba(183,146,93,0))] blur-3xl lg:block" />

      <div className="relative mx-auto max-w-7xl">
        {/* Split layout: editorial text left, product right */}
        <div className="grid items-start gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-12 xl:gap-16">

          {/* ── LEFT: Editorial content ── */}
          <div className="flex flex-col lg:pt-6">

            {/* Overline */}
            <div className="opacity-0 animate-[fade-in_0.6s_ease-out_forwards]">
              <span className="inline-flex items-center gap-3 text-[0.63rem] font-bold uppercase tracking-[0.32em] text-charcoal/45">
                <span className="h-px w-8 bg-gold/55 opacity-0 animate-[draw-line_0.7s_ease-out_0.3s_forwards]" />
                Sistema operativo para restaurantes
              </span>
            </div>

            {/* Big headline */}
            <h1 className="mt-6 max-w-[14ch] font-serif text-[clamp(3.4rem,7.2vw,7rem)] font-medium leading-[0.91] tracking-[-0.04em] text-charcoal opacity-0 animate-[fade-in_0.8s_ease-out_0.08s_forwards,slide-from-bottom_0.8s_cubic-bezier(0.22,1,0.36,1)_0.08s_forwards]">
              Opera con
              <span className="mt-1 block italic text-charcoal/65">claridad,</span>
              ritmo y{" "}
              <span className="font-light italic text-gold">control.</span>
            </h1>

            {/* Description */}
            <p className="mt-8 max-w-[38ch] text-[0.93rem] font-medium leading-[1.85] text-charcoal/55 opacity-0 animate-[fade-in_0.8s_ease-out_0.22s_forwards]">
              Gestiona mesas, órdenes y pagos desde una sola plataforma pensada para restaurantes que quieren correr sin caos.
            </p>

            {/* CTAs */}
            <div className="mt-10 flex items-center gap-5 opacity-0 animate-[fade-in_0.8s_ease-out_0.34s_forwards]">
              <Link
                href="#demo"
                className="group inline-flex h-12 items-center gap-2 rounded-full bg-charcoal px-7 text-[0.83rem] font-bold text-cream shadow-[0_18px_38px_-18px_rgba(43,36,30,0.72)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_26px_48px_-16px_rgba(43,36,30,0.88)]"
              >
                Solicitar demo
                <svg
                  className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-5-5 5 5-5 5" />
                </svg>
              </Link>
              <Link
                href="#producto"
                className="text-[0.83rem] font-semibold text-charcoal/55 transition-colors duration-200 hover:text-charcoal"
              >
                Ver el producto →
              </Link>
            </div>

            {/* Inline stats */}
            <div className="mt-12 flex items-center gap-8 border-t border-charcoal/[0.08] pt-8 opacity-0 animate-[fade-in_0.8s_ease-out_0.5s_forwards]">
              {inlineStats.map(({ n, label }) => (
                <div key={label}>
                  <p className="font-serif text-[1.85rem] font-semibold leading-none text-charcoal">{n}</p>
                  <p className="mt-1.5 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-charcoal/38">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT: Product mockup ── */}
          <div
            id="producto"
            className="opacity-0 animate-[fade-in_1s_ease-out_0.2s_forwards,slide-from-bottom_1s_cubic-bezier(0.22,1,0.36,1)_0.2s_forwards] lg:sticky lg:top-28"
          >
            <ProductMockup />
          </div>
        </div>

        {/* Hidden anchors */}
        <div id="demo" className="sr-only" aria-hidden>Demo</div>
        <div id="soluciones" className="sr-only" aria-hidden>Soluciones</div>
        <div id="nosotros" className="sr-only" aria-hidden>Nosotros</div>
        <div id="contacto" className="sr-only" aria-hidden>Contacto</div>
      </div>
    </section>
  );
};
