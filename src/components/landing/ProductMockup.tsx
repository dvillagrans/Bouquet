export const ProductMockup = () => {
  return (
    <div className="relative mx-auto mt-20 w-full max-w-5xl px-4">
      {/* Glow and framing */}
      <div className="absolute inset-0 top-10 -z-10 rounded-3xl bg-charcoal/5 blur-2xl" />
      
      <div className="overflow-hidden rounded-3xl border border-charcoal/10 bg-ivory-warm p-2 shadow-2xl">
        <div className="flex aspect-[4/3] w-full flex-col overflow-hidden rounded-2xl border border-charcoal/10 bg-cream shadow-inner lg:aspect-[16/9] lg:flex-row">
          
          {/* Sidebar */}
          <div className="hidden w-64 flex-col border-r border-charcoal/10 bg-ivory p-6 lg:flex">
            <div className="mb-10 flex items-center justify-between">
              <span className="font-serif text-xl font-bold text-charcoal">Buquet.</span>
              <span className="flex h-6 w-6 items-center justify-center rounded bg-charcoal text-[10px] text-cream">JM</span>
            </div>
            
            <div className="flex-1 space-y-1">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-widest text-charcoal/40">Espacios</p>
              <div className="flex cursor-pointer items-center justify-between rounded-lg bg-white px-3 py-2.5 text-sm font-medium text-charcoal shadow-sm ring-1 ring-charcoal/5">
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-sage" />
                  Salón Principal
                </span>
              </div>
              <div className="flex cursor-pointer items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium text-charcoal/60 transition-colors hover:bg-white/50 hover:text-charcoal">
                <span className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-charcoal/20" />
                  Terraza
                </span>
              </div>
            </div>
          </div>

          {/* Main Dashboard Area */}
          <div className="flex flex-1 flex-col p-6 lg:p-8">
            <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
              <div>
                <h3 className="font-serif text-3xl font-semibold text-charcoal">Servicio Actual</h3>
                <p className="mt-1 text-sm font-medium text-charcoal/50">Jueves, 21:00 • 45 Comensales</p>
              </div>
              <button className="rounded-full bg-charcoal px-5 py-2.5 text-xs font-semibold text-cream">
                Nueva mesa
              </button>
            </header>

            {/* Grid of Tables */}
            <div className="grid flex-1 grid-cols-2 gap-4 md:grid-cols-3 lg:gap-6">
              {/* Active Table */}
              <div className="flex flex-col justify-between rounded-2xl border border-charcoal/10 bg-white p-5 shadow-sm transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <span className="text-base font-medium text-charcoal">Mesa 4</span>
                  <span className="rounded bg-gold/10 px-2 py-1 text-[10px] font-bold tracking-wide text-gold">ACTIVA</span>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="h-2 w-full rounded bg-charcoal/5" />
                  <div className="h-2 w-3/4 rounded bg-charcoal/5" />
                </div>
              </div>

              {/* Payment Table */}
              <div className="flex flex-col justify-between rounded-2xl border border-sage/30 bg-sage/5 p-5 transition-transform hover:-translate-y-1">
                <div className="flex items-start justify-between">
                  <span className="text-base font-medium text-charcoal">Mesa 8</span>
                  <span className="rounded bg-sage/20 px-2 py-1 text-[10px] font-bold tracking-wide text-[#2e402b]">PAGANDO</span>
                </div>
                <div className="mt-4 flex flex-col gap-2">
                  <div className="h-2 w-full rounded bg-sage/20" />
                  <div className="h-2 w-1/2 rounded bg-sage/20" />
                </div>
              </div>

              {/* Empty Table */}
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-charcoal/20 bg-transparent p-5">
                <span className="text-sm font-medium text-charcoal/40">Mesa 12</span>
                <span className="mt-1 text-[10px] font-semibold text-charcoal/30 uppercase tracking-widest">Libre</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
