import Link from "next/link";

/*
 *  Hero — dark bg, floating app-window panel on the right.
 *  Panel = single rounded-2xl card (browser-chrome style):
 *    browser top bar → app header → table rows → metric strip
 *  No nested grids, no tiny cells.
 */

/* ─── Panel data ────────────────────────────────────────────────── */
type St = "activa" | "cierre" | "pagando" | "libre";

const barCls: Record<St, string> = {
  libre:   "",
  activa:  "bg-glow/55",
  cierre:  "bg-sage/70",
  pagando: "bg-ember/60",
};
const timeCls: Record<St, string> = {
  libre:   "text-dim/50",
  activa:  "text-glow/75",
  cierre:  "text-sage",
  pagando: "text-ember",
};
const badgeCls: Record<St, string> = {
  libre:   "bg-white/[0.05] text-dim",
  activa:  "bg-glow/[0.12] text-glow",
  cierre:  "bg-sage/[0.14] text-sage",
  pagando: "bg-ember/[0.12] text-ember",
};
const stLabel: Record<St, string> = {
  libre: "Libre", activa: "Servicio", cierre: "Por cerrar", pagando: "Pagando",
};

const rows: Array<{ n: string; st: St; course: string; mins: number; prog: number }> = [
  { n: "03", st: "activa",  course: "Cervezas", mins: 64, prog: 71 },
  { n: "07", st: "activa",  course: "Tacos",         mins: 38, prog: 42 },
  { n: "04", st: "cierre",  course: "Postres",         mins: 72, prog: 80 },
  { n: "08", st: "pagando", course: "Cuenta",          mins: 85, prog: 94 },
  { n: "02", st: "activa",  course: "Entradas",        mins: 22, prog: 24 },
];

const fmt = (m: number) =>
  m < 60 ? `${m}m` : `${Math.floor(m / 60)}h${m % 60 > 0 ? ` ${m % 60}m` : ""}`;

/* ─── App window panel ──────────────────────────────────────────── */
const AppPanel = () => (
  <div
    className="w-full max-w-[420px] overflow-hidden rounded-2xl"
    style={{
      boxShadow:
        "0 32px 80px rgba(0,0,0,0.65), 0 0 0 1px rgba(255,255,255,0.06)",
      animation: "fade-in 0.9s ease-out 0.5s both",
    }}
  >
    {/* Browser chrome bar */}
    <div className="flex items-center gap-3 border-b border-white/[0.05] bg-canvas px-4 py-3">
      <div className="flex gap-1.5" aria-hidden="true">
        <span className="h-[9px] w-[9px] rounded-full bg-white/[0.09]" />
        <span className="h-[9px] w-[9px] rounded-full bg-white/[0.09]" />
        <span className="h-[9px] w-[9px] rounded-full bg-white/[0.09]" />
      </div>
      <div className="flex flex-1 justify-center">
        <div className="flex h-5 items-center rounded-md bg-white/[0.05] px-3">
          <span className="text-[0.52rem] font-medium text-light/20">bouquet.app/sala</span>
        </div>
      </div>
    </div>

    {/* App header */}
    <div className="flex items-center justify-between bg-panel px-5 pb-3 pt-4">
      <div>
        <p className="text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">
          Sala principal
        </p>
        <p className="mt-1 font-serif text-[1.15rem] font-semibold leading-none text-light">
          Turno nocturno
        </p>
      </div>
      <div className="flex items-center gap-2 rounded-full bg-sage-deep/[0.14] px-3 py-1.5">
        <span
          className="h-1.5 w-1.5 rounded-full bg-sage-deep"
          style={{ animation: "pulse-slow 2.4s ease-in-out infinite" }}
          aria-hidden="true"
        />
        <span className="text-[0.6rem] font-semibold text-sage-deep">21:04</span>
      </div>
    </div>

    {/* Table rows */}
    <div className="divide-y divide-white/[0.04] bg-panel px-5">
      {rows.map(t => (
        <div key={t.n} className="flex items-center gap-4 py-3">
          {/* Mesa number */}
          <span className="w-12 shrink-0 text-[0.65rem] font-bold text-light/35">
            Mesa {t.n}
          </span>

          {/* Course + progress */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <span className="truncate text-[0.72rem] font-medium text-light/68">
                {t.course}
              </span>
              <span className={["shrink-0 text-[0.58rem] font-bold tabular-nums", timeCls[t.st]].join(" ")}>
                {fmt(t.mins)}
              </span>
            </div>
            <div className="mt-1.5 h-[2px] overflow-hidden rounded-full bg-white/[0.06]">
              <div
                className={["h-full rounded-full", barCls[t.st]].join(" ")}
                style={{ width: `${t.prog}%` }}
              />
            </div>
          </div>

          {/* Status badge */}
          <span
            className={[
              "shrink-0 rounded-full px-2.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.1em]",
              badgeCls[t.st],
            ].join(" ")}
          >
            {stLabel[t.st]}
          </span>
        </div>
      ))}
    </div>

    {/* Metric strip */}
    <div className="grid grid-cols-3 divide-x divide-white/[0.05] border-t border-white/[0.05] bg-canvas">
      {(
        [
          { v: "46",   l: "Cubiertos" },
          { v: "7",    l: "Activas"   },
          { v: "92%",  l: "Al ritmo"  },
        ] as const
      ).map(({ v, l }) => (
        <div key={l} className="px-5 py-3.5">
          <p className="font-serif text-[1.05rem] font-semibold leading-none text-light">{v}</p>
          <p className="mt-1 text-[0.52rem] font-bold uppercase tracking-[0.18em] text-dim">{l}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ─── Hero ──────────────────────────────────────────────────────── */
export const Hero = () => (
  <section className="relative flex min-h-screen flex-col overflow-hidden bg-ink">

    {/* Atmospheric glow — left-side warm bloom */}
    <div
      className="pointer-events-none absolute inset-0"
      aria-hidden="true"
      style={{
        background:
          "radial-gradient(ellipse 50% 55% at 10% 60%, rgba(201,160,84,0.06) 0%, transparent 65%)",
      }}
    />

    {/*
     *  Layout:
     *  mobile   — flex column, panel hidden
     *  lg+      — 2-col grid [text | app panel]
     */}
    <div className="relative mx-auto flex w-full max-w-[1440px] flex-grow flex-col px-6 lg:grid lg:grid-cols-[1fr_0.8fr] lg:px-0">

      {/* ── LEFT: content ── */}
      <div className="flex flex-col pb-20 lg:pb-28 lg:pl-[clamp(4rem,8vw,8rem)] lg:pr-16">

        {/*
         *  HEADLINE CASCADE — three typographic registers:
         *  Row 1 "Opera con"  — italic whisper  (32% cream)
         *  Row 2 "claridad,"  — massive          (full cream)
         *  Row 3 "control."   — gold italic close
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
              Deja de perder miles de pesos por mesas trabadas, fugas y comandas mal hechas. El único software de restaurantes en México enfocado en rotar tus mesas más rápido y disparar tu facturación.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {/* Primary — gold pill */}
              <Link
                href="#contacto"
                className="group inline-flex items-center gap-2 rounded-full bg-glow px-7 text-[0.8rem] font-bold text-ink transition-all duration-300 hover:-translate-y-px hover:bg-gold-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
                style={{ height: "2.75rem" }}
              >
                Agenda tu demo gratuita
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
                Comienza a facturar más
                <svg className="h-3 w-3 opacity-40" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M2 8h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* ── RIGHT: app window panel (lg only) ── */}
      <div
        className="hidden lg:flex lg:items-center lg:justify-center lg:py-20 lg:pr-10"
        aria-hidden="true"
      >
        <AppPanel />
      </div>
    </div>

    <div id="demo" aria-hidden="true" className="pointer-events-none absolute bottom-0 h-0 w-0" />
  </section>
);
