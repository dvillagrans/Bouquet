import Link from "next/link";
import { ProductMockup } from "@/components/landing/ProductMockup";

const stats = [
  { n: "+40", label: "restaurantes" },
  { n: "4.9★", label: "valoración" },
  { n: "100%", label: "renovación" },
];

export const Hero = () => {
  return (
    <section className="relative min-h-screen overflow-hidden bg-cream">
      {/* Structural column rule — editorial grid marker */}
      <div
        className="pointer-events-none absolute bottom-0 left-[clamp(1.5rem,5.5vw,5.5rem)] top-0 hidden w-px bg-charcoal/[0.065] lg:block"
        aria-hidden
      />

      {/* Live status indicator */}
      <div
        className="absolute right-6 hidden items-center gap-2 lg:right-10 lg:flex"
        style={{ top: "clamp(7rem,9vw,9.5rem)", animation: "fade-in 0.5s ease-out 0.85s both" }}
        aria-hidden
      >
        <span
          className="h-1.5 w-1.5 rounded-full bg-sage-deep"
          style={{ animation: "pulse-slow 2.4s ease-in-out infinite" }}
        />
        <span className="text-[0.56rem] font-bold uppercase tracking-[0.32em] text-charcoal/30">
          Turno activo
        </span>
      </div>

      <div className="relative mx-auto max-w-[1440px] px-6 pb-20 lg:pl-[clamp(6rem,10vw,9rem)] lg:pr-10 lg:pb-28">

        {/* Edition label */}
        <div
          className="pt-28 sm:pt-32 lg:pt-36"
          style={{ animation: "fade-in 0.5s ease-out both" }}
        >
          <span className="inline-flex items-center gap-3 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-charcoal/32">
            <span
              className="inline-block h-px w-5 bg-charcoal/25"
              style={{ animation: "tick-in 0.6s ease-out 0.25s both" }}
            />
            Temporada I · Sistema operativo para restaurantes
          </span>
        </div>

        {/* ── HEADLINE CASCADE ───────────────────────────────────── */}
        {/*
         *  Three typographic registers:
         *    Row 1 — muted italic intro   (~7rem, 40% opacity) — the whisper
         *    Row 2 — massive anchor word  (~14rem, full)        — the declaration
         *    Row 3 — resolved close       (~7rem, full)         — the settle
         *
         *  The size contrast mirrors the product's promise:
         *  clarity is the loud center of everything.
         */}
        <div className="mt-7 select-none">

          {/* Row 1 */}
          <div
            className="overflow-hidden"
            style={{ animation: "reveal-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.08s both" }}
          >
            <p className="font-serif text-[clamp(2.8rem,6.6vw,7rem)] font-normal italic leading-[0.88] tracking-[-0.02em] text-charcoal/38">
              Opera con
            </p>
          </div>

          {/* Row 2 — the mountain */}
          <div
            className="-mt-1 overflow-hidden sm:-mt-2"
            style={{ animation: "reveal-up 0.72s cubic-bezier(0.22,1,0.36,1) 0.16s both" }}
          >
            <h1 className="font-serif text-[clamp(5rem,13.2vw,14rem)] font-medium leading-[0.82] tracking-[-0.05em] text-charcoal">
              claridad,
            </h1>
          </div>

          {/* Row 3 */}
          <div
            className="-mt-1 overflow-hidden"
            style={{ animation: "reveal-up 0.72s cubic-bezier(0.22,1,0.36,1) 0.24s both" }}
          >
            <p className="font-serif text-[clamp(2.8rem,6.6vw,7rem)] font-normal leading-[0.92] tracking-[-0.02em] text-charcoal">
              ritmo y{" "}
              <span className="italic text-gold">control.</span>
            </p>
          </div>
        </div>

        {/* Horizontal rule — separates declaration from execution */}
        <div
          className="mt-10 h-px origin-left bg-charcoal/[0.09]"
          style={{ animation: "tick-in 1s cubic-bezier(0.22,1,0.36,1) 0.38s both" }}
        />

        {/* ── CONTENT GRID ──────────────────────────────────────── */}
        <div
          className="mt-8 grid gap-12 lg:grid-cols-[0.6fr_1.6fr] lg:gap-14"
          style={{ animation: "fade-in 0.7s ease-out 0.52s both" }}
        >

          {/* LEFT — descriptor · CTAs · stats */}
          <div className="flex flex-col gap-9 lg:pt-1.5">

            <p className="max-w-[32ch] text-[0.88rem] font-medium leading-[1.95] text-charcoal/46">
              Gestiona mesas, órdenes y pagos desde una sola plataforma pensada para restaurantes que quieren correr sin caos.
            </p>

            {/* CTAs — sharp corners, operational feel */}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
              <Link
                href="#demo"
                className="group inline-flex h-11 items-center gap-2 bg-charcoal px-6 text-[0.79rem] font-bold text-cream shadow-[0_14px_34px_-18px_rgba(43,36,30,0.65)] transition-all duration-300 hover:-translate-y-px hover:shadow-[0_20px_44px_-16px_rgba(43,36,30,0.8)]"
              >
                Solicitar demo
                <svg
                  className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden
                >
                  <path
                    d="M2 8h12m-5-5 5 5-5 5"
                    stroke="currentColor"
                    strokeWidth="1.6"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </Link>
              <Link
                href="#producto"
                className="text-[0.79rem] font-semibold text-charcoal/40 underline underline-offset-4 decoration-charcoal/20 transition-colors duration-200 hover:text-charcoal hover:decoration-charcoal/40"
              >
                Ver el producto
              </Link>
            </div>

            {/* Stats — typographic, no cards */}
            <div className="flex items-start gap-7 border-t border-charcoal/[0.08] pt-7">
              {stats.map(({ n, label }) => (
                <div key={label}>
                  <p className="font-serif text-[1.65rem] font-semibold leading-none text-charcoal">
                    {n}
                  </p>
                  <p className="mt-1.5 text-[0.56rem] font-bold uppercase tracking-[0.24em] text-charcoal/30">
                    {label}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT — product */}
          <div id="producto" className="lg:sticky lg:top-28">
            <ProductMockup />
          </div>
        </div>
      </div>

      {/* Hidden anchors */}
      <div id="demo"      className="sr-only" aria-hidden>Demo</div>
      <div id="soluciones" className="sr-only" aria-hidden>Soluciones</div>
      <div id="nosotros"  className="sr-only" aria-hidden>Nosotros</div>
      <div id="contacto"  className="sr-only" aria-hidden>Contacto</div>
    </section>
  );
};
