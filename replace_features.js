const fs = require("fs");
const file = "src/components/landing/Features.tsx";
fs.writeFileSync(file, `export const Features = () => {
  return (
    <section id="como-funciona" className="relative bg-zinc-50 py-32">
      <div className="mx-auto max-w-[1200px] px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="mb-20 max-w-3xl">
          <h2 className="text-balance font-sans text-5xl font-bold tracking-tighter text-black md:text-6xl">
            Todo lo que necesitas. <br/> Y nada de lo que no.
          </h2>
          <p className="mt-6 text-xl text-black/60 leading-relaxed max-w-2xl">
            Un diseño limpio y poderoso para que tú y tu equipo se enfoquen en lo importante: dar un buen servicio y vender más.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:grid-rows-2">
          
          {/* Main Feature: spans 2 cols */}
          <div className="md:col-span-2 md:row-span-1 rounded-[2rem] bg-white border border-black/5 shadow-sm p-10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10 max-w-md">
              <h3 className="text-3xl font-bold tracking-tight text-black mb-4">
                Rotación de mesas optimizada
              </h3>
              <p className="text-lg text-black/60">
                Ve exactamente el estado de cada mesa. Cuánto tiempo llevan, si ya pidieron, o si están esperando la cuenta.
              </p>
            </div>
            
            {/* Visual element */}
            <div className="mt-12 w-full max-w-lg rounded-2xl bg-zinc-50 border border-black/5 shadow-inner p-6">
               <div className="flex justify-between items-center mb-6">
                 <div className="h-6 w-32 bg-zinc-200 rounded-full" />
                 <div className="h-6 w-16 bg-blue-100 rounded-full" />
               </div>
               <div className="space-y-3">
                 <div className="h-12 w-full bg-white border border-zinc-100 rounded-xl flex items-center px-4">
                    <div className="h-3 w-1/3 bg-zinc-200 rounded-full" />
                 </div>
                 <div className="h-12 w-full bg-white border border-zinc-100 rounded-xl flex items-center px-4">
                    <div className="h-3 w-1/2 bg-blue-200 rounded-full" />
                 </div>
               </div>
            </div>
          </div>

          {/* Secondary Feature 1 */}
          <div className="rounded-[2rem] bg-[#FDF8F5] border border-orange-900/5 shadow-sm p-10 flex flex-col relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold tracking-tight text-orange-900 mb-4">
                Cero Mermas
              </h3>
              <p className="text-orange-900/60">
                Las comandas van directo del mesero a la cocina sin perderse ni malinterpretarse.
              </p>
            </div>
            <div className="mt-auto pt-10">
              <div className="aspect-square w-full bg-white rounded-2xl shadow-sm border border-orange-900/5 p-4 flex flex-col gap-4">
                 <div className="h-8 w-8 rounded-full bg-orange-100" />
                 <div className="h-3 w-full bg-orange-50 rounded-full" />
                 <div className="h-3 w-4/5 bg-orange-50 rounded-full" />
              </div>
            </div>
          </div>

          {/* Secondary Feature 2 */}
          <div className="rounded-[2rem] bg-[#F4F6FB] border border-blue-900/5 shadow-sm p-10 flex flex-col relative overflow-hidden group">
            <div className="relative z-10">
              <h3 className="text-2xl font-bold tracking-tight text-blue-900 mb-4">
                Métricas en Vivo
              </h3>
              <p className="text-blue-900/60">
                Monitorea el ticket promedio, las ventas totales y tus mejores platos en tiempo real.
              </p>
            </div>
            <div className="mt-auto pt-10">
              <div className="h-32 w-full bg-white rounded-2xl shadow-sm border border-blue-900/5 flex items-end gap-2 p-4">
                 <div className="w-1/4 bg-blue-100 rounded-t-md h-1/3" />
                 <div className="w-1/4 bg-blue-200 rounded-t-md h-2/3" />
                 <div className="w-1/4 bg-blue-300 rounded-t-md h-1/2" />
                 <div className="w-1/4 bg-blue-400 rounded-t-md h-full" />
              </div>
            </div>
          </div>

          {/* Secondary Feature 3: spans 2 cols */}
          <div className="md:col-span-2 md:row-span-1 rounded-[2rem] bg-zinc-900 shadow-xl p-10 flex flex-col justify-between relative overflow-hidden group">
            <div className="relative z-10 max-w-md">
              <h3 className="text-3xl font-bold tracking-tight text-white mb-4">
                Cobro a la velocidad de la luz
              </h3>
              <p className="text-lg text-white/60">
                Factura con código QR, divide cuentas fácil y cierra la venta con 3 toques.
              </p>
            </div>
            
            <div className="mt-12 w-full max-w-lg rounded-2xl bg-black border border-white/10 p-6 flex gap-4">
               <div className="w-1/2 aspect-square rounded-xl border border-white/10 bg-zinc-800/50 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-white/20 border-t-white rounded-full animate-spin" />
               </div>
               <div className="w-1/2 aspect-square bg-zinc-800 rounded-xl" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
`);
console.log("Features modified");
