const pillars = [
  {
    number: "01",
    title: "Mesas en vivo",
    body: "Estado en tiempo real de cada mesa. Sabe quién está, qué pidió y en qué momento del servicio va. Sin preguntar, sin correr.",
    tags: ["Mapa de sala", "Progreso de servicio", "Alertas automáticas"],
    accent: "text-glow border-glow/25 bg-glow/8",
    accentColor: "text-glow",
    preview: (
      <div className="space-y-2.5">
        {[
          { id: "04", status: "En servicio", prog: 65, color: "bg-glow" },
          { id: "08", status: "Por cerrar",  prog: 92, color: "bg-sage" },
          { id: "11", status: "En ritmo",    prog: 44, color: "bg-light/30" },
          { id: "15", status: "Disponible",  prog: 0,  color: "bg-wire" },
        ].map(t => (
          <div key={t.id} className="flex items-center justify-between gap-4 rounded-xl border border-wire bg-panel/60 px-3.5 py-2.5">
            <div className="flex items-center gap-2.5">
              <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${t.color}`} />
              <span className="text-[0.68rem] font-semibold text-light">Mesa {t.id}</span>
            </div>
            <div className="flex flex-1 items-center gap-2">
              <div className="h-[2px] flex-1 overflow-hidden rounded-full bg-wire">
                {t.prog > 0 && <div className={`h-full rounded-full ${t.color} opacity-60`} style={{ width: `${t.prog}%` }} />}
              </div>
              <span className="text-[0.58rem] font-semibold text-dim">{t.status}</span>
            </div>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "02",
    title: "Flujo de servicio",
    body: "Cocina y sala sincronizadas sin palabras. Las órdenes fluyen, los tiempos se cumplen, el ritmo se mantiene sin esfuerzo.",
    tags: ["Paso a cocina", "Confirmación de pase", "Tiempos de espera"],
    accent: "text-sage border-sage/25 bg-sage/8",
    accentColor: "text-sage",
    preview: (
      <div className="space-y-2.5">
        {[
          { ticket: "#184", table: "Mesa 04", detail: "3 platos salen en 6 min", phase: "Cocina",   dot: "bg-glow"     },
          { ticket: "#176", table: "Mesa 11", detail: "Postres confirmados",     phase: "Servicio", dot: "bg-sage"     },
          { ticket: "#162", table: "Mesa 08", detail: "Cuenta solicitada",       phase: "Pago",     dot: "bg-light/40" },
        ].map(o => (
          <div key={o.ticket} className="rounded-xl border border-wire bg-panel/60 px-3.5 py-2.5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[0.68rem] font-bold text-light">{o.ticket} · {o.table}</span>
              <span className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${o.dot}`} />
                <span className="text-[0.58rem] font-semibold text-dim">{o.phase}</span>
              </span>
            </div>
            <p className="mt-1 text-[0.6rem] text-dim">{o.detail}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    number: "03",
    title: "Pagos sincronizados",
    body: "Cierra cuentas en segundos. Divisiones, propinas y comprobantes digitales sin papel, sin errores, sin esperas.",
    tags: ["División de cuenta", "Propina automática", "Comprobante digital"],
    accent: "text-gold border-gold/25 bg-gold/8",
    accentColor: "text-gold",
    preview: (
      <div className="space-y-2.5">
        <div className="rounded-xl border border-wire bg-panel/60 px-4 py-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">Turno actual</span>
            <span className="text-[0.62rem] font-bold text-dim">21:47</span>
          </div>
          <p className="mt-2.5 font-serif text-[1.75rem] font-semibold leading-none text-light">$14,280</p>
          <p className="mt-1 text-[0.58rem] text-dim">acumulado · 8 cuentas cerradas</p>
          <div className="mt-3 h-[2px] overflow-hidden rounded-full bg-wire">
            <div className="h-full w-[74%] rounded-full bg-glow/55" />
          </div>
        </div>
        <div className="flex gap-2.5">
          <div className="flex-1 rounded-xl border border-wire bg-panel/60 px-3.5 py-3">
            <p className="text-[0.58rem] text-dim">Cierre medio</p>
            <p className="mt-1.5 text-[0.82rem] font-bold text-light">1m 24s</p>
          </div>
          <div className="flex-1 rounded-xl border border-wire bg-panel/60 px-3.5 py-3">
            <p className="text-[0.58rem] text-dim">Propinas</p>
            <p className="mt-1.5 text-[0.82rem] font-bold text-sage">94%</p>
          </div>
        </div>
      </div>
    ),
  },
] as const;

export const Features = () => (
  <section className="bg-ink py-24 lg:py-36" id="como-funciona">
    <div className="mx-auto max-w-7xl px-6 lg:px-10">

      {/* Section header */}
      <div className="flex flex-col gap-3 border-b border-wire pb-14 md:flex-row md:items-end md:justify-between">
        <h2 className="max-w-[20ch] font-serif text-[clamp(2rem,3.6vw,3.5rem)] font-medium italic leading-[1.05] text-light">
          Todo lo que necesita una operación de excelencia
        </h2>
        <p className="max-w-[30ch] text-[0.85rem] font-medium leading-[1.75] text-dim md:text-right">
          Una plataforma que entiende cómo funciona realmente un restaurante en servicio.
        </p>
      </div>

      {/* Feature rows — editorial horizontal layout */}
      <div className="divide-y divide-wire">
        {pillars.map(({ number, title, body, tags, accent, accentColor, preview }) => (
          <div
            key={number}
            className="group grid gap-8 py-14 md:grid-cols-[2.5rem_1fr] md:gap-14 lg:grid-cols-[2.5rem_1fr_1.1fr] lg:py-16"
          >
            {/* Number — large, background-like */}
            <span className="font-serif text-[2.2rem] font-light leading-none text-wire transition-colors duration-400 group-hover:text-dim">
              {number}
            </span>

            {/* Content */}
            <div className="flex flex-col justify-center">
              <h3 className={`text-[1.2rem] font-bold ${accentColor}`}>{title}</h3>
              <p className="mt-4 max-w-[36ch] text-[0.875rem] font-medium leading-[1.8] text-dim">{body}</p>
              <div className="mt-6 flex flex-wrap gap-2">
                {tags.map(tag => (
                  <span
                    key={tag}
                    className={`rounded-full border px-2.5 py-1 text-[0.57rem] font-bold uppercase tracking-[0.18em] ${accent}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Preview panel */}
            <div className="rounded-2xl border border-wire bg-canvas p-5 lg:p-6">
              {preview}
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);
