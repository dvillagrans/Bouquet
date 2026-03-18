import Link from "next/link";

/*
 *  Fixes applied (audit):
 *  C-1  — removed id="contacto" and id="soluciones" hidden divs; no duplicate IDs
 *  C-2  — full headline wrapped in a single <h1> using block <span>s
 *  M-2  — hidden anchors now use aria-hidden only (no contradictory sr-only)
 *  H-5  — stats removed from Hero; kept only in SocialProof
 *  M-7  — ProductMockup removed; DashboardSection is the sole showcase
 *  CTAs — href updated to #contacto (the real CTA section)
 */
export const Hero = () => (
  <section className="relative flex min-h-screen flex-col overflow-hidden bg-cream">

    {/* Structural column rule */}
    <div
      className="pointer-events-none absolute bottom-0 left-[clamp(1.5rem,5.5vw,5.5rem)] top-0 hidden w-px bg-charcoal/[0.065] lg:block"
      aria-hidden="true"
    />

    {/* Live status indicator */}
    <div
      className="absolute right-6 hidden items-center gap-2 lg:right-10 lg:flex"
      style={{ top: "clamp(7rem,9vw,9.5rem)", animation: "fade-in 0.5s ease-out 0.85s both" }}
      aria-hidden="true"
    >
      <span
        className="h-1.5 w-1.5 rounded-full bg-sage-deep"
        style={{ animation: "pulse-slow 2.4s ease-in-out infinite" }}
      />
      <span className="text-[0.56rem] font-bold uppercase tracking-[0.32em] text-charcoal/30">
        Turno activo
      </span>
    </div>

    <div className="relative mx-auto flex w-full max-w-[1440px] flex-grow flex-col px-6 pb-20 lg:pl-[clamp(6rem,10vw,9rem)] lg:pr-10">

      {/* Edition label */}
      <div
        className="pt-28 sm:pt-32 lg:pt-36"
        style={{ animation: "fade-in 0.5s ease-out both" }}
      >
        <span className="inline-flex items-center gap-3 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-charcoal/32">
          <span
            className="inline-block h-px w-5 bg-charcoal/25"
            style={{ animation: "tick-in 0.6s ease-out 0.25s both" }}
            aria-hidden="true"
          />
          Temporada I · Sistema operativo para restaurantes
        </span>
      </div>

      {/*
       *  HEADLINE CASCADE — single <h1>, three typographic registers via block spans.
       *  Outer span: overflow clip + animation.
       *  Inner span: font styles (avoids block elements inside heading).
       *
       *  Row 1 "Opera con"   — muted italic whisper  (~7rem, 38% opacity)
       *  Row 2 "claridad,"   — massive declaration   (~14rem, full)
       *  Row 3 "ritmo y…"    — resolved close        (~7rem, full)
       */}
      <div className="flex flex-grow flex-col justify-center py-8">
        <h1 className="select-none">

          <span
            className="block overflow-hidden"
            style={{ animation: "reveal-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.08s both" }}
          >
            <span className="block font-serif text-[clamp(2.8rem,6.6vw,7rem)] font-normal italic leading-[0.88] tracking-[-0.02em] text-charcoal/38">
              Opera con
            </span>
          </span>

          <span
            className="-mt-1 block overflow-hidden sm:-mt-2"
            style={{ animation: "reveal-up 0.72s cubic-bezier(0.22,1,0.36,1) 0.16s both" }}
          >
            <span className="block font-serif text-[clamp(5rem,13.2vw,14rem)] font-medium leading-[0.82] tracking-[-0.05em] text-charcoal">
              claridad,
            </span>
          </span>

          <span
            className="-mt-1 block overflow-hidden"
            style={{ animation: "reveal-up 0.72s cubic-bezier(0.22,1,0.36,1) 0.24s both" }}
          >
            <span className="block font-serif text-[clamp(2.8rem,6.6vw,7rem)] font-normal leading-[0.92] tracking-[-0.02em] text-charcoal">
              ritmo y{" "}
              <span className="italic text-gold">control.</span>
            </span>
          </span>

        </h1>
      </div>

      {/* Divider + description + CTAs */}
      <div style={{ animation: "fade-in 0.7s ease-out 0.52s both" }}>
        <div
          className="h-px origin-left bg-charcoal/[0.09]"
          style={{ animation: "tick-in 1s cubic-bezier(0.22,1,0.36,1) 0.38s both" }}
          aria-hidden="true"
        />

        <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between lg:gap-20">
          <p className="max-w-[40ch] text-[0.88rem] font-medium leading-[1.95] text-charcoal/46">
            Gestiona mesas, órdenes y pagos desde una sola plataforma pensada para restaurantes que quieren correr sin caos.
          </p>

          <div className="flex shrink-0 items-center gap-5">
            <Link
              href="#contacto"
              className="group inline-flex items-center gap-2 bg-charcoal px-6 text-[0.79rem] font-bold text-cream transition-all duration-300 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              style={{ height: "2.75rem" }}
            >
              Solicitar demo
              <svg
                className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2 8h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="#producto"
              className="inline-flex min-h-[44px] items-center text-[0.79rem] font-semibold text-charcoal/40 underline underline-offset-4 decoration-charcoal/20 transition-colors duration-200 hover:text-charcoal hover:decoration-charcoal/40"
            >
              Ver el producto
            </Link>
          </div>
        </div>
      </div>
    </div>

    {/* Scroll anchor — no sr-only+aria-hidden contradiction */}
    <div id="demo" aria-hidden="true" className="pointer-events-none absolute bottom-0 h-0 w-0" />
  </section>
);
