const fs = require("fs");
const file = "src/components/landing/Hero.tsx";
fs.writeFileSync(file, `import Link from "next/link";

export const Hero = () => (
  <section className="relative flex min-h-[90vh] flex-col items-center justify-center overflow-hidden bg-white pt-24 pb-20">
    <div className="relative z-10 mx-auto flex w-full max-w-[1200px] flex-col items-center px-6 text-center lg:px-8">
      
      {/* Badge */}
      <div className="mb-6 inline-flex items-center rounded-full border border-black/10 bg-black/5 px-4 py-2 text-xs font-semibold uppercase tracking-widest text-black/80">
        <span className="mr-2.5 h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
        Nuevo: Módulo de Cocina Inteligente
      </div>

      {/* Typography Headline - Big, bold, sans-serif like Air.inc */}
      <h1 className="max-w-5xl text-balance font-sans text-6xl font-bold tracking-tighter text-black sm:text-7xl md:text-8xl lg:text-[6rem] lg:leading-[0.95]">
        Tu restaurante. <br className="hidden sm:block" /> En automático.
      </h1>

      {/* Description */}
      <p className="mt-8 max-w-2xl text-balance text-lg font-medium leading-relaxed text-black/60 sm:text-xl">
        Conecta las comandas de tu piso con la cocina en milisegundos.
        Controla los insumos, cobra con un clic y escala sin estrés.
      </p>

      {/* CTAs */}
      <div className="mt-10 flex w-full flex-col sm:flex-row justify-center items-center gap-4">
        <Link
          href="#contacto"
          className="group flex h-14 w-full sm:w-auto items-center justify-center gap-2 rounded-full bg-black px-10 text-[1.1rem] font-medium text-white transition-transform hover:scale-[1.02] active:scale-[0.98]"
        >
          Probar Bouquet Gratis
          <svg className="h-5 w-5 opacity-70 transition-transform group-hover:translate-x-1" viewBox="0 0 20 20" fill="none">
            <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </Link>
        <Link
          href="#como-funciona"
          className="flex h-14 w-full sm:w-auto items-center justify-center rounded-full border border-black/10 bg-transparent px-10 text-[1.1rem] font-medium text-black transition-colors hover:bg-black/5"
        >
          Ver demostración
        </Link>
      </div>

      {/* Trust elements underneath CTA */}
      <div className="mt-8 opacity-60 flex items-center justify-center gap-2 font-medium text-sm">
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
        Sin tarjeta de crédito
        <span className="mx-2">•</span>
        Configuración en 5 min
      </div>

    </div>

    {/* Decorative huge background image or mockup below hero like Air.inc */}
    <div className="mt-16 w-full max-w-[1400px] px-6">
      <div className="aspect-[21/9] w-full relative rounded-[2rem] border border-black/5 bg-zinc-50 shadow-2xl overflow-hidden flex items-center justify-center">
         {/* Faux Interface for visual wow factor */}
         <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-orange-50 opacity-50" />
         <div className="w-[85%] h-[80%] rounded-xl bg-white shadow-xl flex border border-black/5">
           <div className="w-[200px] h-full border-r border-black/5 flex flex-col gap-4 p-4">
              <div className="h-6 w-full rounded-md bg-zinc-100" />
              <div className="h-4 w-2/3 rounded-md bg-zinc-50" />
              <div className="h-4 w-3/4 rounded-md bg-zinc-50" />
           </div>
           <div className="flex-1 p-8 flex flex-col gap-6">
              <div className="h-8 w-[250px] rounded-md bg-zinc-100" />
              <div className="grid grid-cols-3 gap-4">
                <div className="h-[120px] rounded-xl bg-blue-50/50 border border-blue-100 p-4">
                   <div className="w-10 h-10 rounded-full bg-blue-100 mb-4" />
                   <div className="w-1/2 h-3 rounded-full bg-blue-200" />
                </div>
                <div className="h-[120px] rounded-xl bg-orange-50/50 border border-orange-100 p-4">
                   <div className="w-10 h-10 rounded-full bg-orange-100 mb-4" />
                   <div className="w-1/2 h-3 rounded-full bg-orange-200" />
                </div>
                <div className="h-[120px] rounded-xl bg-green-50/50 border border-green-100 p-4">
                   <div className="w-10 h-10 rounded-full bg-green-100 mb-4" />
                   <div className="w-1/2 h-3 rounded-full bg-green-200" />
                </div>
              </div>
           </div>
         </div>
      </div>
    </div>
  </section>
);
`);
console.log("Hero modified");
