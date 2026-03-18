const stats = [
  { value: "4.9",  label: "Valoración promedio", sub: "de 5 estrellas" },
  { value: "+40",  label: "Restaurantes activos", sub: "en México"      },
  { value: "100%", label: "Renovación anual",     sub: "de contratos"   },
];

export const SocialProof = () => (
  <section className="relative overflow-hidden bg-ink py-28 lg:py-40">
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_0%,rgba(201,160,84,0.065),transparent)]"
    />

    <div className="relative mx-auto max-w-7xl px-6 lg:px-10">

      {/* Stats strip */}
      <div className="mb-20 grid grid-cols-3 gap-6 border-b border-wire pb-20 sm:gap-12 lg:gap-16">
        {stats.map(({ value, label, sub }) => (
          <div key={label}>
            <p className="font-serif text-[clamp(2.4rem,4.5vw,4.5rem)] font-semibold leading-none text-glow">
              {value}
            </p>
            <p className="mt-3 text-[0.78rem] font-semibold text-light">{label}</p>
            <p className="mt-1 text-[0.65rem] text-dim">{sub}</p>
          </div>
        ))}
      </div>

      {/* Editorial blockquote — let the type do the work */}
      <div className="max-w-[28ch] lg:max-w-none">
        <blockquote className="font-serif text-[clamp(2rem,4.2vw,4.4rem)] font-medium italic leading-[1.15] tracking-[-0.025em] text-light/70">
          "Antes del turno revisaba notas, apps y papeles. Ahora abro Bouquet y sé exactamente en qué va cada mesa y cada orden."
        </blockquote>

        <footer className="mt-10 flex items-center gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-wire bg-panel font-serif text-base font-semibold italic text-glow">
            R
          </div>
          <div>
            <p className="text-[0.85rem] font-semibold text-light/70">Chef Rodrigo Castellanos</p>
            <p className="mt-0.5 text-[0.63rem] font-bold uppercase tracking-[0.24em] text-dim">
              Restaurante Nuo · Ciudad de México
            </p>
          </div>
        </footer>
      </div>
    </div>
  </section>
);
