import Link from "next/link";

export const CtaBand = () => {
  return (
    <section className="relative bg-white py-32 border-t border-black/5">
      <div className="mx-auto flex max-w-[1200px] flex-col items-center justify-center px-6 text-center lg:px-8">
        
        <h2 className="text-balance font-sans text-5xl font-bold tracking-tighter text-black sm:text-6xl md:text-7xl lg:text-[5rem] lg:leading-[0.95]">
          Organiza. <br/> Cobra. Multiplica.
        </h2>

        <p className="mt-8 max-w-2xl text-balance text-lg text-black/60 font-medium">
          Dile adiós a las libretas de notas, a los sistemas lentos de los 2000s y al desorden en tu cocina. Usa Bouquet en tu restaurante hoy.
        </p>

        <div className="mt-12 flex w-full flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="#contacto"
            className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full bg-blue-600 px-10 text-lg font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            Iniciar gratis ahora
          </Link>
          <Link
            href="#demo"
            className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full border border-black/10 px-10 text-lg font-medium text-black transition-colors hover:bg-black/5"
          >
            Hablar con ventas
          </Link>
        </div>

        {/* Minimal metrics below */}
        <div className="mt-20 w-full max-w-3xl grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-black/5 border-t border-b border-black/5 py-10">
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-bold tracking-tighter text-black">98%</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">Satisfacción</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-bold tracking-tighter text-black">+2M</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">Comandas</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-bold tracking-tighter text-black">100%</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">Cloud</span>
          </div>
          <div className="flex flex-col gap-2">
            <span className="text-4xl font-bold tracking-tighter text-black">24/7</span>
            <span className="text-xs font-semibold uppercase tracking-widest text-black/50">Soporte</span>
          </div>
        </div>

      </div>
    </section>
  );
};
