type TableStatus = "libre" | "activa" | "cierre" | "pagando";

interface TableEntry {
  n: string;
  status: TableStatus;
  course: string;
  mins: number;
  wide?: boolean;
}

interface OrderEntry {
  ticket: string;
  table: string;
  detail: string;
  status: "Cocina" | "Pase" | "Barra" | "Sala" | "Caja";
}

const tables: TableEntry[] = [
  { n: "01", status: "libre",   course: "",               mins: 0  },
  { n: "02", status: "activa",  course: "Bebidas",        mins: 8  },
  { n: "03", status: "activa",  course: "Platos fuertes", mins: 64 },
  { n: "04", status: "cierre",  course: "Postres",        mins: 72 },
  { n: "05", status: "libre",   course: "",               mins: 0  },
  { n: "06", status: "activa",  course: "Entradas",       mins: 22 },
  { n: "07", status: "activa",  course: "Platos fuertes", mins: 38, wide: true },
  { n: "08", status: "pagando", course: "Cuenta",         mins: 85 },
  { n: "09", status: "activa",  course: "Bebidas",        mins: 14 },
  { n: "10", status: "libre",   course: "",               mins: 0  },
];

const orders: OrderEntry[] = [
  { ticket: "#187", table: "03", detail: "Platos fuertes · 4 pax",  status: "Cocina" },
  { ticket: "#185", table: "07", detail: "Carne, 2 cortes",          status: "Pase"   },
  { ticket: "#183", table: "09", detail: "Mezcal · 2 cocteles",      status: "Barra"  },
  { ticket: "#181", table: "06", detail: "Entradas confirmadas",     status: "Sala"   },
  { ticket: "#179", table: "08", detail: "Cierre de cuenta",         status: "Caja"   },
];

const tableFrame: Record<TableStatus, string> = {
  libre:   "border-dashed border-charcoal/[0.12] bg-transparent",
  activa:  "border-gold/[0.22] bg-gold/[0.045]",
  cierre:  "border-sage/[0.35] bg-sage/[0.07]",
  pagando: "border-ember/[0.38] bg-ember/[0.045]",
};

const timeBarColor: Record<TableStatus, string> = {
  libre:   "",
  activa:  "bg-gold/45",
  cierre:  "bg-sage/80",
  pagando: "bg-ember/55",
};

const timeTextColor: Record<TableStatus, string> = {
  libre:   "",
  activa:  "text-charcoal/35",
  cierre:  "text-sage-deep",
  pagando: "text-ember",
};

const orderStatusStyle: Record<OrderEntry["status"], string> = {
  Cocina: "bg-charcoal/[0.07] text-charcoal/50",
  Pase:   "bg-gold/[0.14] text-gold",
  Barra:  "bg-charcoal/[0.05] text-charcoal/40",
  Sala:   "bg-charcoal/[0.05] text-charcoal/38",
  Caja:   "bg-ember/[0.12] text-ember",
};

const timeFmt = (m: number) =>
  m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`;

const pct = (m: number) => Math.min((m / 90) * 100, 100);

export const ProductMockup = () => (
  <div className="relative w-full overflow-hidden rounded-[2rem] border border-charcoal/15 bg-cream shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)]">

    {/* ── HEADER ─────────────────────────────────────────────── */}
    <div className="flex items-center justify-between gap-4 bg-charcoal px-4 py-3 sm:px-5">
      <div className="flex items-center gap-2.5">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center bg-cream/[0.1] text-[0.55rem] font-bold uppercase tracking-[0.18em] text-cream/80">
          BQ
        </span>
        <span className="text-[0.7rem] font-semibold tracking-wide text-cream/52">
          Bouquet OS
        </span>
      </div>
      <div className="flex items-center gap-4">
        <span className="hidden text-[0.6rem] font-medium uppercase tracking-[0.2em] text-cream/30 sm:block">
          Turno nocturno
        </span>
        <span className="text-[0.7rem] font-semibold tabular-nums text-cream/52">21:04</span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-1.5 w-1.5 rounded-full bg-sage-deep"
            style={{ animation: "pulse-slow 2.4s ease-in-out infinite" }}
              aria-hidden="true"
          />
          <span className="text-[0.58rem] font-semibold text-cream/32">18 activas</span>
        </span>
      </div>
    </div>

    {/* ── MAIN CONTENT ───────────────────────────────────────── */}
    <div className="grid lg:grid-cols-[1fr_0.46fr]">

      {/* LEFT — Floor plan */}
      <div className="border-b border-charcoal/[0.07] p-4 sm:p-5 lg:border-b-0 lg:border-r">
        <p className="mb-3.5 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-charcoal/30">
          Piso · Sala principal
        </p>

        {/*
         *  4-column grid. Each cell = one table.
         *  wide=true tables span 2 columns, representing group/banquet tables.
         *  Progress bar = time seated ÷ 90-min target.
         */}
        <div className="grid grid-cols-4 gap-2">
          {tables.map((t) => (
            <div
              key={t.n}
              className={[
                "relative overflow-hidden rounded-2xl border p-3",
                "transition-all duration-300 hover:-translate-y-1 hover:shadow-lg",
                t.wide ? "col-span-2" : "",
                tableFrame[t.status],
              ].join(" ")}
            >
              {/* Number + time */}
              <div className="flex items-start justify-between gap-1">
                <span className="text-[0.6rem] font-bold text-charcoal/42">{t.n}</span>
                {t.status !== "libre" && (
                  <span className={["text-[0.5rem] font-bold tabular-nums", timeTextColor[t.status]].join(" ")}>
                    {timeFmt(t.mins)}
                  </span>
                )}
              </div>

              {/* Course + progress */}
              {t.status !== "libre" ? (
                <>
                  <p className="mt-1.5 truncate text-[0.6rem] font-semibold leading-tight text-charcoal/58">
                    {t.course}
                  </p>
                  <div className="mt-2.5 h-[2px] overflow-hidden rounded-full bg-charcoal/[0.06]">
                    <div
                      className={["h-full rounded-full", timeBarColor[t.status]].join(" ")}
                      style={{ width: `${pct(t.mins)}%` }}
                    />
                  </div>
                </>
              ) : (
                <p className="mt-1.5 text-[0.54rem] font-medium text-charcoal/20">Libre</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* RIGHT — Orders feed */}
      <div className="p-4 sm:p-5">
        <p className="mb-3.5 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-charcoal/30">
          Servicio en curso
        </p>

        <div>
          {orders.map((o, i) => (
            <div
              key={o.ticket}
              className={["py-3", i < orders.length - 1 ? "border-b border-charcoal/[0.06]" : ""].join(" ")}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[0.6rem] font-bold text-charcoal/36">
                    {o.ticket} · Mesa {o.table}
                  </p>
                  <p className="mt-0.5 truncate text-[0.67rem] font-medium text-charcoal/70">
                    {o.detail}
                  </p>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-full px-2 py-1 text-[0.52rem] font-bold uppercase tracking-[0.16em]",
                    orderStatusStyle[o.status],
                  ].join(" ")}
                >
                  {o.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>

    {/* ── METRICS BAR ────────────────────────────────────────── */}
    <div className="grid grid-cols-4 border-t border-charcoal/[0.07] bg-charcoal/[0.02]">
      {(
        [
          { label: "Cubiertos", value: "46"  },
          { label: "Activas",   value: "7"   },
          { label: "Promedio",  value: "68m" },
          { label: "Al ritmo",  value: "92%" },
        ] as const
      ).map(({ label, value }, i) => (
        <div
          key={label}
          className={["px-3 py-2.5 sm:px-4", i < 3 ? "border-r border-charcoal/[0.06]" : ""].join(" ")}
        >
          <p className="text-[0.54rem] font-bold uppercase tracking-[0.2em] text-charcoal/26">
            {label}
          </p>
          <p className="mt-0.5 font-serif text-[0.95rem] font-semibold text-charcoal sm:text-[1.05rem]">
            {value}
          </p>
        </div>
      ))}
    </div>
  </div>
);
