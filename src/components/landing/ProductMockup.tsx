export const ProductMockup = () => {
  const tables = [
    {
      name: "Mesa 04",
      guests: "4 cubiertos",
      detail: "2 platos en pase",
      state: "En servicio",
      tone:
        "border-[rgba(183,146,93,0.18)] bg-[linear-gradient(180deg,rgba(255,252,246,0.98),rgba(247,240,228,0.96))] text-charcoal shadow-[0_18px_35px_-24px_rgba(183,146,93,0.35)]",
      badge: "bg-gold/[0.12] text-gold",
      dot: "bg-gold",
    },
    {
      name: "Mesa 08",
      guests: "2 cubiertos",
      detail: "Pago pendiente",
      state: "Por cerrar",
      tone:
        "border-[rgba(168,185,165,0.32)] bg-[linear-gradient(180deg,rgba(247,250,245,0.98),rgba(236,243,232,0.96))] text-charcoal shadow-[0_18px_35px_-24px_rgba(122,140,114,0.35)]",
      badge: "bg-sage/[0.18] text-charcoal",
      dot: "bg-sage",
    },
    {
      name: "Mesa 11",
      guests: "6 cubiertos",
      detail: "Entrada servida hace 4 min",
      state: "En ritmo",
      tone:
        "border-charcoal/8 bg-white/[0.82] text-charcoal shadow-[0_16px_32px_-26px_rgba(43,36,30,0.25)]",
      badge: "bg-charcoal/[0.07] text-charcoal/70",
      dot: "bg-charcoal/[0.45]",
    },
    {
      name: "Mesa 15",
      guests: "Libre",
      detail: "Lista para recibir",
      state: "Disponible",
      tone:
        "border-dashed border-charcoal/[0.14] bg-white/[0.45] text-charcoal/[0.82] shadow-none",
      badge: "bg-white/[0.80] text-charcoal/[0.48]",
      dot: "bg-charcoal/[0.18]",
    },
  ];

  const serviceFeed = [
    { ticket: "#184", table: "Mesa 04", detail: "3 platos salen en 6 min", state: "Cocina" },
    { ticket: "#176", table: "Mesa 11", detail: "Postres confirmados por sala", state: "Servicio" },
    { ticket: "#162", table: "Mesa 08", detail: "Cuenta solicitada desde terminal", state: "Pago" },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[1100px]">
      <div className="absolute inset-x-[8%] top-12 -z-10 h-40 rounded-full bg-[radial-gradient(circle,rgba(168,185,165,0.22),rgba(168,185,165,0))] blur-3xl" />
      <div className="absolute -left-8 top-10 hidden h-24 w-24 rounded-full border border-gold/[0.15] bg-ivory/[0.45] backdrop-blur-sm md:block" />
      <div className="absolute -right-4 bottom-14 hidden h-28 w-28 rounded-full border border-charcoal/8 bg-white/[0.35] backdrop-blur-sm md:block" />

      <div className="group relative overflow-hidden rounded-[34px] border border-charcoal/[0.12] bg-[linear-gradient(180deg,rgba(240,232,217,0.98),rgba(250,246,240,0.94))] p-3 shadow-[0_50px_120px_-65px_rgba(43,36,30,0.72)] transition-transform duration-500 hover:-translate-y-1">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.85),transparent_32%),radial-gradient(circle_at_bottom_right,rgba(183,146,93,0.08),transparent_28%)]" />
        <div className="relative overflow-hidden rounded-[28px] border border-charcoal/10 bg-[linear-gradient(180deg,rgba(255,254,252,0.94),rgba(248,243,235,0.96))]">
          <div className="border-b border-charcoal/8 bg-[linear-gradient(180deg,rgba(250,246,240,0.96),rgba(245,238,228,0.9))] px-5 py-4 sm:px-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-2xl bg-charcoal text-[0.62rem] font-semibold uppercase tracking-[0.24em] text-cream">
                  BQ
                </span>
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.28em] text-charcoal/[0.45]">
                    Turno nocturno
                  </p>
                  <p className="mt-1 text-sm font-semibold text-charcoal">
                    Operación sincronizada en sala
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-sage/[0.25] bg-sage/[0.12] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-[#32442d]">
                  18 mesas activas
                </span>
                <span className="rounded-full border border-charcoal/10 bg-white/[0.72] px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-charcoal/[0.58]">
                  21:00 servicio
                </span>
              </div>
            </div>
          </div>

          <div className="grid gap-4 p-4 sm:p-5 lg:grid-cols-[1.28fr_0.92fr] lg:p-6">
            <section className="rounded-[24px] border border-charcoal/10 bg-white/[0.78] p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)] sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-charcoal/[0.45]">
                    Mapa de sala
                  </p>
                  <h3 className="mt-2 font-serif text-[1.85rem] font-semibold leading-none text-charcoal sm:text-[2.1rem]">
                    Control de piso
                  </h3>
                </div>
                <div className="rounded-full border border-charcoal/10 bg-cream px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-charcoal/[0.55]">
                  92% al ritmo
                </div>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                {tables.map((table) => (
                  <div
                    key={table.name}
                    className={`rounded-[22px] border p-4 transition-transform duration-300 hover:-translate-y-0.5 ${table.tone}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-inherit">{table.name}</p>
                        <p className="mt-1 text-xs font-medium text-charcoal/[0.52]">{table.guests}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.22em] ${table.badge}`}>
                        <span className={`h-1.5 w-1.5 rounded-full ${table.dot}`} />
                        {table.state}
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-xs font-medium text-charcoal/[0.58]">{table.detail}</p>
                      <div className="flex items-center gap-1.5">
                        <span className="h-1.5 w-6 rounded-full bg-charcoal/10" />
                        <span className="h-1.5 w-3 rounded-full bg-charcoal/20" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <div className="flex flex-col gap-4">
              <section className="rounded-[24px] border border-charcoal/10 bg-[linear-gradient(180deg,rgba(250,246,240,0.96),rgba(244,237,227,0.96))] p-4 sm:p-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-charcoal/[0.45]">
                      Flujo del servicio
                    </p>
                    <p className="mt-2 font-serif text-[1.65rem] font-semibold text-charcoal">
                      Órdenes vivas
                    </p>
                  </div>
                  <span className="text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-charcoal/[0.42]">
                    7 en curso
                  </span>
                </div>
                <div className="mt-4 space-y-3">
                  {serviceFeed.map((item) => (
                    <div
                      key={item.ticket}
                      className="rounded-[18px] border border-charcoal/8 bg-white/[0.78] p-3.5 shadow-[0_12px_30px_-24px_rgba(43,36,30,0.4)]"
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <p className="text-sm font-semibold text-charcoal">
                            {item.ticket} · {item.table}
                          </p>
                          <p className="mt-1 text-xs font-medium leading-relaxed text-charcoal/[0.56]">
                            {item.detail}
                          </p>
                        </div>
                        <span className="rounded-full bg-charcoal/[0.06] px-2.5 py-1 text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-charcoal/[0.52]">
                          {item.state}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
                <div className="rounded-[24px] border border-sage/20 bg-[linear-gradient(180deg,rgba(243,248,241,0.96),rgba(233,241,230,0.9))] p-4 sm:p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-charcoal/60">
                    Pagos
                  </p>
                  <p className="mt-2 text-3xl font-semibold tracking-tight text-charcoal">8</p>
                  <p className="mt-1 text-sm font-medium text-charcoal/70">
                    completados en el turno
                  </p>
                  <div className="mt-4 h-2 overflow-hidden rounded-full bg-sage/20">
                    <div className="h-full w-[74%] rounded-full bg-sage" />
                  </div>
                </div>

                <div className="rounded-[24px] border border-charcoal/10 bg-white/[0.78] p-4 sm:p-5">
                  <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-charcoal/[0.45]">
                    Cierre de cuenta
                  </p>
                  <div className="mt-3 space-y-2.5 text-sm font-medium text-charcoal/70">
                    <div className="flex items-center justify-between">
                      <span>Pendientes</span>
                      <span className="font-semibold text-charcoal">3</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Tiempo medio</span>
                      <span className="font-semibold text-charcoal">1m 24s</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Propinas registradas</span>
                      <span className="font-semibold text-charcoal">94%</span>
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
        </div>

        <div className="absolute -left-8 bottom-12 hidden w-56 rounded-[24px] border border-charcoal/10 bg-[linear-gradient(180deg,rgba(250,246,240,0.95),rgba(244,237,226,0.92))] p-4 shadow-[0_28px_48px_-34px_rgba(43,36,30,0.45)] xl:block">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.26em] text-charcoal/[0.42]">
            Ritmo del turno
          </p>
          <p className="mt-2 font-serif text-[1.75rem] font-semibold text-charcoal">
            Armónico
          </p>
          <p className="mt-2 text-xs font-medium leading-relaxed text-charcoal/[0.58]">
            Sala, cocina y caja operando bajo la misma capa de control.
          </p>
        </div>

        <div className="absolute -right-6 top-18 hidden w-60 rounded-[24px] border border-gold/[0.18] bg-[linear-gradient(180deg,rgba(255,251,243,0.96),rgba(247,239,226,0.92))] p-4 shadow-[0_30px_58px_-36px_rgba(112,84,42,0.38)] xl:block">
          <p className="text-[0.64rem] font-semibold uppercase tracking-[0.26em] text-gold/[0.8]">
            Pago listo
          </p>
          <div className="mt-3 flex items-start justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-charcoal">Mesa 08</p>
              <p className="mt-1 text-xs font-medium text-charcoal/[0.56]">
                Tarjeta validada. Cuenta enviada al terminal.
              </p>
            </div>
            <span className="mt-0.5 h-2.5 w-2.5 rounded-full bg-gold" />
          </div>
        </div>
      </div>
    </div>
  );
};
