import Link from "next/link";

/*
 *  Hero — complete redesign.
 *  Dark bg (bg-ink), no hard column borders.
 *  Left:  pill status chip · headline cascade · rounded-full CTAs
 *  Right: bento of 3 floating rounded-2xl cards (table map + orders + metric)
 *  Decorative radial glow behind the bento for depth.
 */

/* ─── Types ─────────────────────────────────────────────────────── */
type TableSt = "activa" | "cierre" | "pagando" | "libre";

const tableFrame: Record<TableSt, string> = {
  libre:   "bg-white/[0.025] border border-white/[0.06]",
  activa:  "bg-glow/[0.09]   border border-glow/[0.20]",
  cierre:  "bg-sage/[0.09]   border border-sage/[0.22]",
  pagando: "bg-ember/[0.09]  border border-ember/[0.25]",
};
const tableBar: Record<TableSt, string> = {
  libre: "", activa: "bg-glow/55", cierre: "bg-sage/70", pagando: "bg-ember/60",
};
const tableTime: Record<TableSt, string> = {
  libre: "", activa: "text-glow/70", cierre: "text-sage", pagando: "text-ember",
};
const stLabel: Record<TableSt, string> = {
  libre: "Libre", activa: "En servicio", cierre: "Por cerrar", pagando: "Pagando",
};

const bentoTables: Array<{ n: string; st: TableSt; mins: number; prog: number; wide?: boolean }> = [
  { n: "02", st: "activa",  mins: 22, prog: 24 },
  { n: "03", st: "activa",  mins: 64, prog: 71 },
  { n: "04", st: "cierre",  mins: 72, prog: 80 },
  { n: "07", st: "activa",  mins: 38, prog: 42, wide: true },
  { n: "08", st: "pagando", mins: 85, prog: 94 },
  { n: "01", st: "libre",   mins: 0,  prog: 0  },
];

const bentoOrders = [
  { ticket: "#187", table: "03", detail: "Platos fuertes · 4 pax", st: "Cocina" as const },
  { ticket: "#185", table: "07", detail: "2 cortes, fuego alto",   st: "Pase"   as const },
  { ticket: "#179", table: "08", detail: "Cierre de cuenta",       st: "Caja"   as const },
];

const orderBadge = {
  Cocina: "bg-glow/[0.14] text-glow",
  Pase:   "bg-sage/[0.18] text-sage",
  Caja:   "bg-ember/[0.14] text-ember",
} as const;

const fmt = (m: number) =>
  m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`;

/* ─── Bento panel ───────────────────────────────────────────────── */
const BentoPanel = () => (
  <div
    className="relative w-full max-w-[380px]"
    style={{ animation: "fade-in 0.9s ease-out 0.5s both" }}
  >
    {/* Ambient glow blob behind cards */}
    <div
      className="pointer-events-none absolute -inset-8 -z-10"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse 80% 70% at 55% 45%, rgba(201,160,84,0.10) 0%, transparent 70%)",
      }}
    />

    <div className="flex flex-col gap-3">

      {/* Card 1 — Table map */}
      <div
        className="overflow-hidden rounded-2xl bg-panel p-5"
        style={{ boxShadow: "0 24px 64px rgba(0,0,0,0.55)" }}
      >
        <div className="mb-3.5 flex items-center justify-between">
          <p className="text-[0.6rem] font-bold uppercase tracking-[0.26em] text-dim">
            Sala principal
          </p>
          <div className="flex items-center gap-1.5 rounded-full bg-sage-deep/[0.14] px-2.5 py-1">
            <span
              className="h-1.5 w-1.5 rounded-full bg-sage-deep"
              style={{ animation: "pulse-slow 2.4s ease-in-out infinite" }}
              aria-hidden="true"
            />
            <span className="text-[0.56rem] font-semibold text-sage-deep">7 activas</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2">
          {bentoTables.map(t => (
            <div
              key={t.n}
              className={[
                "rounded-xl p-2.5",
                t.wide ? "col-span-2" : "",
                tableFrame[t.st],
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-1">
                <span className="text-[0.54rem] font-bold text-light/40">{t.n}</span>
                {t.st !== "libre" && (
                  <span className={["text-[0.48rem] font-bold tabular-nums", tableTime[t.st]].join(" ")}>
                    {fmt(t.mins)}
                  </span>
                )}
              </div>
              <p className="mt-0.5 text-[0.52rem] font-semibold text-light/50">
                {stLabel[t.st]}
              </p>
              {t.st !== "libre" && (
                <div className="mt-2 h-[2px] overflow-hidden rounded-full bg-white/[0.06]">
                  <div
                    className={["h-full rounded-full", tableBar[t.st]].join(" ")}
                    style={{ width: `${t.prog}%` }}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Row 2 — orders + metric chip */}
      <div className="grid grid-cols-[1fr_auto] gap-3">

        {/* Card 2 — Order feed */}
        <div
          className="overflow-hidden rounded-2xl bg-panel p-4"
          style={{ boxShadow: "0 12px 40px rgba(0,0,0,0.4)" }}
        >
          <p className="mb-2.5 text-[0.58rem] font-bold uppercase tracking-[0.24em] text-dim">
            En curso
          </p>
          <div className="space-y-2">
            {bentoOrders.map(o => (
              <div key={o.ticket} className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[0.54rem] font-bold text-light/35">{o.ticket} · Mesa {o.table}</p>
                  <p className="truncate text-[0.62rem] font-medium text-light/65">{o.detail}</p>
                </div>
                <span
                  className={[
                    "shrink-0 rounded-full px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.12em]",
                    orderBadge[o.st],
                  ].join(" ")}
                >
                  {o.st}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3 — Metric highlight */}
        <div
          className="flex w-[88px] flex-col justify-between rounded-2xl border border-glow/[0.20] bg-glow/[0.08] p-4"
          style={{ boxShadow: "0 12px 40px rgba(201,160,84,0.12)" }}
        >
          <p className="text-[0.52rem] font-bold uppercase leading-tight tracking-[0.18em] text-glow/55">
            Al ritmo
          </p>
          <p className="font-serif text-[2rem] font-semibold leading-none text-glow">
            92%
          </p>
          <p className="text-[0.5rem] font-medium text-glow/45">de mesas</p>
        </div>
      </div>

      {/* Bottom strip — minimal metric row */}
      <div
        className="grid grid-cols-3 divide-x divide-white/[0.05] overflow-hidden rounded-2xl bg-panel"
        style={{ boxShadow: "0 8px 24px rgba(0,0,0,0.3)" }}
      >
        {(
          [
            { v: "46",   l: "Cubiertos" },
            { v: "21:04", l: "Turno"     },
            { v: "1m24s", l: "Cierre"    },
          ] as const
        ).map(({ v, l }) => (
          <div key={l} className="px-4 py-3">
            <p className="font-serif text-[0.95rem] font-semibold leading-none text-light">{v}</p>
            <p className="mt-1 text-[0.5rem] font-bold uppercase tracking-[0.18em] text-dim">{l}</p>
          </div>
        ))}
      </div>
    </div>
  </div>
);

/* ─── Hero ──────────────────────────────────────────────────────── */
export const Hero = () => (
  <section className="relative flex min-h-screen flex-col overflow-hidden bg-ink">

    {/* Large ambient gradient — purely atmospheric */}
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse 55% 60% at 15% 55%, rgba(201,160,84,0.055) 0%, transparent 65%)",
      }}
    />

    {/*
     *  Layout:
     *  mobile/tablet — flex column, bento hidden
     *  lg+           — 2-col grid [text | bento]
     */}
    <div className="relative mx-auto flex w-full max-w-[1440px] flex-grow flex-col px-6 lg:grid lg:grid-cols-[1fr_0.75fr] lg:px-0">

      {/* ── LEFT: content ── */}
      <div className="flex flex-col pb-20 lg:pb-28 lg:pl-[clamp(4rem,8vw,8rem)] lg:pr-16">

        {/*
         *  HEADLINE CASCADE — single <h1>, three typographic registers.
         *  Row 1 "Opera con"  — muted italic whisper  (35% opacity)
         *  Row 2 "claridad,"  — massive declaration   (full cream)
         *  Row 3 "ritmo y…"   — resolved close        (glow gold italic)
         */}
        <div className="flex flex-grow flex-col justify-center pt-28 pb-8 sm:pt-32 lg:pt-36">
          <h1 className="select-none">

            <span
              className="block overflow-hidden"
              style={{ animation: "reveal-up 0.65s cubic-bezier(0.22,1,0.36,1) 0.08s both" }}
            >
              <span className="block font-serif text-[clamp(2.8rem,6.6vw,7rem)] font-normal italic leading-[0.88] tracking-[-0.02em] text-light/32">
                Opera con
              </span>
            </span>

            <span
              className="-mt-1 block overflow-hidden sm:-mt-2"
              style={{ animation: "reveal-up 0.72s cubic-bezier(0.22,1,0.36,1) 0.16s both" }}
            >
              <span className="block font-serif text-[clamp(5rem,13.2vw,14rem)] font-medium leading-[0.82] tracking-[-0.05em] text-light">
                claridad,
              </span>
            </span>

            <span
              className="-mt-1 block overflow-hidden"
              style={{ animation: "reveal-up 0.72s cubic-bezier(0.22,1,0.36,1) 0.24s both" }}
            >
              <span className="block font-serif text-[clamp(2.8rem,6.6vw,7rem)] font-normal leading-[0.92] tracking-[-0.02em] text-light">
                ritmo y{" "}
                <span className="italic text-glow">control.</span>
              </span>
            </span>

          </h1>
        </div>

        {/* Description + CTAs */}
        <div style={{ animation: "fade-in 0.7s ease-out 0.52s both" }}>
          <div
            className="h-px bg-light/[0.07]"
            style={{ animation: "tick-in 1s cubic-bezier(0.22,1,0.36,1) 0.38s both" }}
            aria-hidden="true"
          />

          <div className="mt-8 flex flex-col gap-8">
            <p className="max-w-[40ch] text-[0.88rem] font-medium leading-[1.95] text-dim">
              Gestiona mesas, órdenes y pagos desde una sola plataforma pensada para restaurantes que quieren correr sin caos.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {/* Primary — gold pill */}
              <Link
                href="#contacto"
                className="group inline-flex items-center gap-2 rounded-full bg-glow px-7 text-[0.8rem] font-bold text-ink transition-all duration-300 hover:-translate-y-px hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
                style={{ height: "2.75rem" }}
              >
                Solicitar demo
                <svg
                  className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-0.5"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path d="M2 8h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>

              {/* Secondary — ghost */}
              <Link
                href="#producto"
                className="inline-flex min-h-[44px] items-center gap-1.5 text-[0.79rem] font-semibold text-dim transition-colors duration-200 hover:text-light"
              >
                Ver el producto
                <svg className="h-3 w-3 opacity-50" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 8h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: bento panel (lg only) ── */}
      <div
        className="hidden lg:flex lg:items-center lg:justify-center lg:py-24 lg:pr-10"
        aria-hidden="true"
      >
        <BentoPanel />
      </div>
    </div>

    <div id="demo" aria-hidden="true" className="pointer-events-none absolute bottom-0 h-0 w-0" />
  </section>
);
