/*
 *  SocialProof — stats strip + editorial blockquote.
 *  Improvements:
 *  – Stats get a hairline accent line + subtle label treatment
 *  – Blockquote attribution gets a typographic rule + restaurant detail
 *  – Added a second pull quote for rhythm
 */

const stats = [
  { value: "4.9",  unit: "★", label: "Valoración promedio", sub: "de 5 estrellas"     },
  { value: "+40",  unit: "",  label: "Restaurantes activos", sub: "en México"          },
  { value: "100%", unit: "",  label: "Renovación anual",     sub: "contratos vigentes" },
];

export const SocialProof = () => (
  <section className="bg-ink py-28 lg:py-40">
    <div className="mx-auto max-w-7xl px-6 lg:px-10">

      {/* Stats strip */}
      <div className="mb-20 grid grid-cols-3 gap-6 border-b border-wire pb-20 sm:gap-12 lg:gap-16">
        {stats.map(({ value, unit, label, sub }) => (
          <div key={label} className="flex flex-col gap-3">
            {/* Accent line — 24px gold hairline above each stat */}
            <div className="h-px w-6 bg-glow/40" aria-hidden="true" />
            <p className="font-serif text-[clamp(2.4rem,4.5vw,4.5rem)] font-semibold leading-none text-glow">
              {value}
              {unit && (
                <span className="ml-0.5 text-[0.55em] text-glow/60">{unit}</span>
              )}
            </p>
            <div>
              <p className="text-[0.78rem] font-semibold text-light">{label}</p>
              <p className="mt-0.5 text-[0.63rem] font-medium text-dim">{sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Two-column testimonial zone */}
      <div className="grid gap-16 lg:grid-cols-[1fr_0.55fr] lg:gap-24 lg:items-end">

        {/* Primary quote — large editorial */}
        <div>
          <blockquote className="font-serif text-[clamp(2rem,4.2vw,4.4rem)] font-medium italic leading-[1.15] tracking-[-0.025em] text-light/70">
            &ldquo;Antes del turno revisaba notas, apps y papeles. Ahora abro Bouquet y sé exactamente en qué va cada mesa y cada orden.&rdquo;
          </blockquote>

          <footer className="mt-10 flex items-center gap-5">
            {/* Typographic monogram — more editorial than a circle avatar */}
            <div className="flex h-10 w-10 shrink-0 items-end justify-end border border-wire pb-1 pr-1.5">
              <span className="font-serif text-[1.6rem] font-semibold italic leading-none text-glow">
                R
              </span>
            </div>
            <div>
              <p className="text-[0.85rem] font-semibold text-light/70">Chef Rodrigo Castellanos</p>
              <p className="mt-0.5 flex items-center gap-2 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-dim">
                <span className="h-px w-3 bg-dim/40" aria-hidden="true" />
                Restaurante Nuo · Ciudad de México
              </p>
            </div>
          </footer>
        </div>

        {/* Secondary pull — compact, contrasting weight */}
        <div className="border-l border-wire pl-8 lg:pl-10">
          <p className="font-serif text-[clamp(1.1rem,1.6vw,1.55rem)] font-normal italic leading-[1.5] tracking-[-0.01em] text-dim">
            &ldquo;El equipo dejó de correr a buscarme para preguntar el estado de una mesa. Eso por sí solo lo vale todo.&rdquo;
          </p>
          <p className="mt-5 text-[0.6rem] font-bold uppercase tracking-[0.22em] text-wire">
            Gerencia de operaciones · Grupo Pujol
          </p>
        </div>
      </div>

    </div>
  </section>
);
