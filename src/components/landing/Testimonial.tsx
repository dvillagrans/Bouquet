export const Testimonial = () => (
  <section className="overflow-hidden bg-charcoal py-24 lg:py-32">
    <div className="mx-auto max-w-5xl px-6 lg:px-10">
      {/* Overline */}
      <div className="flex items-center gap-4">
        <span className="h-px w-10 bg-gold/40" />
        <span className="text-[0.65rem] font-bold uppercase tracking-[0.35em] text-cream/30">
          Lo que dicen nuestros operadores
        </span>
      </div>

      {/* Quote */}
      <blockquote className="mt-10 font-serif text-[clamp(1.7rem,3.2vw,3rem)] font-medium italic leading-[1.25] text-cream/85">
        &ldquo;Antes del turno revisaba notas, apps y papeles. Ahora abro Bouquet y sé exactamente en qué va cada mesa, cada orden.&rdquo;
      </blockquote>

      {/* Attribution */}
      <footer className="mt-10 flex items-center gap-5">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-cream/10 bg-cream/8 font-serif text-lg font-semibold italic text-cream/60">
          R
        </div>
        <div>
          <p className="text-[0.85rem] font-semibold text-cream/70">Chef Rodrigo Castellanos</p>
          <p className="mt-0.5 text-[0.65rem] font-medium uppercase tracking-[0.25em] text-cream/30">
            Restaurante Nuo · Ciudad de México
          </p>
        </div>
      </footer>

      {/* Decorative accent */}
      <div
        aria-hidden
        className="mt-16 h-px bg-gradient-to-r from-transparent via-cream/10 to-transparent"
      />

      {/* Social proof row */}
      <div className="mt-10 flex flex-wrap items-center gap-10">
        {[
          { value: "4.9", label: "Valoración promedio" },
          { value: "+40", label: "Restaurantes activos" },
          { value: "100%", label: "Renovación anual" },
        ].map(({ value, label }) => (
          <div key={label}>
            <p className="font-serif text-[2rem] font-semibold leading-none text-cream/80">{value}</p>
            <p className="mt-1.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] text-cream/30">
              {label}
            </p>
          </div>
        ))}
      </div>
    </div>
  </section>
);
