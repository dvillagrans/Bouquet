export const Hero = () => {
  return (
    <div className="relative mx-auto mt-32 max-w-5xl px-4 text-center lg:mt-40">
      
      <div className="mb-8 flex items-center justify-center">
        <span className="flex items-center gap-2 rounded-full border border-charcoal/10 bg-ivory px-4 py-1.5 text-xs font-bold uppercase tracking-[0.2em] text-charcoal/70">
          <div className="h-1.5 w-1.5 rounded-full bg-gold animate-pulse-slow" />
          La nueva capa operativa
        </span>
      </div>

      <h1 className="text-5xl font-medium tracking-tight text-charcoal sm:text-6xl md:text-7xl">
        Opera tu restaurante con{" "}
        <span className="mt-2 block font-serif italic font-normal text-charcoal">
          claridad, ritmo y control
        </span>
      </h1>

      <p className="mx-auto mt-8 max-w-2xl text-base font-medium leading-relaxed text-charcoal/70 sm:text-lg">
        Gestiona mesas, órdenes y pagos desde una sola plataforma diseñada para restaurantes que quieren operar con más orden y estilo.
      </p>

      <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
        <button className="w-full rounded-2xl bg-charcoal px-8 py-4 text-sm font-semibold text-cream transition-transform hover:-translate-y-0.5 hover:bg-charcoal/90 hover:shadow-xl sm:w-auto">
          Solicitar demo
        </button>
        <button className="w-full rounded-2xl border border-charcoal/10 bg-transparent px-8 py-4 text-sm font-semibold text-charcoal transition-colors hover:bg-charcoal/5 sm:w-auto">
          Ver producto
        </button>
      </div>

    </div>
  );
};
