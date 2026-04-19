"use client";

import { motion, useReducedMotion } from "framer-motion";

const easeOutQuint = [0.22, 1, 0.36, 1] as const;

/** Vista simplificada de sala — SVG propio, lectura inmediata (no barras abstractas). */
function SalaFloorGraphic({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 360 200"
      className={className}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <pattern id="featuresSalaGrid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            stroke="currentColor"
            strokeOpacity="0.06"
            strokeWidth="0.6"
          />
        </pattern>
      </defs>
      <rect width="360" height="200" fill="url(#featuresSalaGrid)" className="text-charcoal" />
      <rect
        x="12"
        y="12"
        width="336"
        height="176"
        rx="14"
        stroke="currentColor"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      {/* Mesas — lectura tipo plano */}
      <g strokeWidth="1">
        <rect x="40" y="44" width="52" height="52" rx="10" fill="rgba(185,146,93,0.12)" stroke="rgba(185,146,93,0.45)" />
        <text x="66" y="77" textAnchor="middle" fill="#2b241e" fillOpacity={0.72} fontSize={11} fontWeight={600} style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
          03
        </text>
        <rect x="106" y="44" width="52" height="52" rx="10" fill="rgba(168,185,165,0.1)" stroke="rgba(110,139,106,0.5)" />
        <text x="132" y="77" textAnchor="middle" fill="#2b241e" fillOpacity={0.72} fontSize={11} fontWeight={600} style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
          08
        </text>
        <rect x="172" y="44" width="52" height="52" rx="10" fill="transparent" stroke="rgba(43,36,30,0.18)" strokeDasharray="4 3" />
        <text x="198" y="77" textAnchor="middle" fill="#2b241e" fillOpacity={0.38} fontSize={11} fontWeight={600} style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
          11
        </text>
        <rect x="246" y="38" width="84" height="58" rx="12" fill="rgba(185,146,93,0.08)" stroke="rgba(185,146,93,0.35)" />
        <text x="288" y="73" textAnchor="middle" fill="#2b241e" fillOpacity={0.72} fontSize={11} fontWeight={600} style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
          04
        </text>
        <rect x="52" y="118" width="52" height="52" rx="10" fill="rgba(237,232,225,0.06)" stroke="rgba(43,36,30,0.12)" />
        <text x="78" y="151" textAnchor="middle" fill="#2b241e" fillOpacity={0.48} fontSize={11} fontWeight={600} style={{ fontFamily: "var(--font-manrope), system-ui, sans-serif" }}>
          02
        </text>
      </g>
    </svg>
  );
}

/** Cola cocina — lista continua (sin mini-cards apilados). */
function CocinaQueueGraphic() {
  const rows = [
    { table: "07", dish: "Ribeye · pase", lane: "Pase", laneClass: "text-gold" },
    { table: "03", dish: "Pasta · cocina", lane: "Cocina", laneClass: "text-charcoal/45" },
    { table: "09", dish: "Mezcal · barra", lane: "Barra", laneClass: "text-charcoal/40" },
  ];
  return (
    <div
      className="overflow-hidden rounded-xl border border-charcoal/[0.07] bg-charcoal/[0.015]"
      aria-hidden="true"
    >
      {rows.map((r, i) => (
        <div
          key={r.table}
          className={[
            "flex items-center justify-between gap-3 px-3.5 py-3 sm:px-4",
            i > 0 ? "border-t border-charcoal/[0.06]" : "",
          ].join(" ")}
        >
          <div className="flex min-w-0 items-center gap-3">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center font-mono text-[0.62rem] font-semibold tabular-nums text-charcoal/40">
              {r.table}
            </span>
            <span className="truncate text-[0.74rem] font-medium text-charcoal/70">{r.dish}</span>
          </div>
          <span className={`shrink-0 text-[0.56rem] font-bold uppercase tracking-[0.16em] ${r.laneClass}`}>
            {r.lane}
          </span>
        </div>
      ))}
    </div>
  );
}

/** Extracto de cuenta — bloque sobrio, sin segundo “card inside card”. */
function CajaReceiptGraphic() {
  return (
    <div
      className="rounded-xl border border-charcoal/[0.07] bg-white/[0.5] p-5 shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]"
      aria-hidden="true"
    >
      <div className="flex items-center justify-between border-b border-dashed border-charcoal/15 pb-3">
        <span className="text-[0.58rem] font-bold uppercase tracking-[0.28em] text-charcoal/35">Mesa 08</span>
        <span className="text-[0.62rem] font-semibold tabular-nums text-charcoal/55">21:52</span>
      </div>
      <dl className="mt-4 space-y-2.5 font-medium tabular-nums">
        <div className="flex justify-between text-[0.78rem] text-charcoal/55">
          <dt>Subtotal</dt>
          <dd>$1,842.00</dd>
        </div>
        <div className="flex justify-between text-[0.78rem] text-charcoal/55">
          <dt>Propina sugerida</dt>
          <dd>$276.30</dd>
        </div>
        <div className="flex justify-between border-t border-charcoal/10 pt-3 text-[0.92rem] font-semibold text-charcoal">
          <dt>Total</dt>
          <dd>$2,118.30</dd>
        </div>
      </dl>
      <p className="mt-4 text-center text-[0.58rem] font-bold uppercase tracking-[0.22em] text-sage-deep">
        Cierre enviado · caja
      </p>
    </div>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

/** Solo opacidad — evita `transform` residual en <article> (mejor para capas y hover). */
const itemVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0.55, ease: easeOutQuint },
  },
};

const containerVariantsReduced = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0, delayChildren: 0 },
  },
};

const itemVariantsReduced = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { duration: 0 },
  },
};

export const Features = () => {
  const pauseOrbits = useReducedMotion() === true;
  const reduceMotion = pauseOrbits;

  const cVar = reduceMotion ? containerVariantsReduced : containerVariants;
  const iVar = reduceMotion ? itemVariantsReduced : itemVariants;

  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden border-t border-charcoal/[0.06] bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#fffdf8_0%,#f7efe4_45%,#efe8dc_100%)] py-28 lg:py-40"
    >
      {/* Capa atmosférica */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(185,146,93,0.07) 0%, transparent 45%), radial-gradient(circle at 88% 60%, rgba(168,185,165,0.08) 0%, transparent 42%)",
        }}
        aria-hidden="true"
      />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-8% 0px" }}
        variants={cVar}
        className="relative mx-auto max-w-[88rem] px-6 lg:px-12"
      >
        {/* Encabezado editorial */}
        <header className="mb-16 lg:mb-24">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <motion.p
                variants={iVar}
                className="mb-6 inline-flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-charcoal/45"
              >
                <span className="h-px w-12 bg-gradient-to-r from-gold/80 to-gold/20" aria-hidden="true" />
                Cómo funciona
              </motion.p>
              <motion.h2
                variants={iVar}
                className="font-serif text-[clamp(2.75rem,5.5vw,4.75rem)] font-medium italic leading-[1.02] tracking-[-0.02em] text-charcoal"
              >
                Cuatro frentes.
                <span className="block font-sans text-[0.42em] font-black not-italic tracking-[-0.055em] text-charcoal/45 sm:mt-1">
                  Una sola línea de verdad.
                </span>
              </motion.h2>
            </div>
            <motion.p
              variants={iVar}
              className="max-w-md text-[1.08rem] font-medium leading-[1.75] text-charcoal/58 lg:pb-1"
            >
              Nada de pantallas que compiten entre sí: mesa, cocina, barra y caja comparten el mismo estado del turno,
              sin duplicar capturas ni gritar órdenes por el pasillo.
            </motion.p>
          </div>

          {/* Índice 01–04 — micro-navegación visual */}
          <motion.ol
            variants={iVar}
            className="mt-14 flex flex-wrap gap-3 border-t border-charcoal/10 pt-8 lg:gap-4"
          >
            {[
              { n: "01", label: "Sala" },
              { n: "02", label: "Cocina" },
              { n: "03", label: "Caja" },
              { n: "04", label: "Gerencia" },
            ].map((step) => (
              <li
                key={step.n}
                className="flex items-center gap-2.5 text-[0.68rem] font-semibold text-charcoal/50"
              >
                <span className="font-mono text-[0.62rem] tabular-nums text-gold">{step.n}</span>
                <span className="uppercase tracking-[0.18em]">{step.label}</span>
              </li>
            ))}
          </motion.ol>
        </header>

        {/* Bento: sala grande | cocina + caja apiladas */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:grid-rows-2 lg:gap-7">
          {/* ── Sala — superficie tipo “vidrio” + un solo marco para el mock ── */}
          <motion.article
            variants={iVar}
            className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-charcoal/[0.09] bg-white/[0.42] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.95)] backdrop-blur-md lg:col-span-7 lg:row-span-2 lg:min-h-[520px] lg:p-10"
          >
            <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent opacity-80" />

            <div className="relative mb-8 flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.3em] text-charcoal/38">01 · Sala</p>
                <h3 className="mt-3 max-w-[18ch] font-serif text-[clamp(1.85rem,3vw,2.65rem)] font-semibold leading-[1.08] tracking-tight text-charcoal">
                  Mesas vivas, sin adivinar.
                </h3>
              </div>
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.28em] text-charcoal/38">
                En vivo
              </span>
            </div>

            <figure className="relative mb-8 overflow-hidden rounded-xl border border-charcoal/[0.1] bg-[#f6f2ec] shadow-[inset_0_2px_12px_rgba(43,36,30,0.06)]">
              <SalaFloorGraphic className="h-auto w-full text-charcoal" />
              <figcaption className="border-t border-charcoal/[0.06] bg-white/[0.35] px-4 py-2.5 text-[0.58rem] font-bold uppercase tracking-[0.32em] text-charcoal/35 backdrop-blur-[2px]">
                Vista sala · tiempo real
              </figcaption>
            </figure>

            <p className="relative mt-auto max-w-[46ch] text-[1.02rem] font-medium leading-[1.72] text-charcoal/58">
              Estado por mesa en el mismo lienzo que ve el capitán: quién paga, quién espera postre y cuándo liberas cubierta
              para la siguiente llegada.
            </p>
          </motion.article>

          {/* ── Cocina ───────────────────────────────────── */}
          <motion.article
            variants={iVar}
            className="relative flex flex-col rounded-[1.75rem] border border-charcoal/[0.09] bg-white/[0.38] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-md lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:p-9"
          >
            <div className="mb-6 flex items-baseline justify-between gap-3 border-b border-charcoal/[0.07] pb-5">
              <div>
                <p className="text-[0.62rem] font-bold uppercase tracking-[0.3em] text-charcoal/38">02 · Cocina</p>
                <h3 className="mt-2.5 font-serif text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-charcoal">
                  Ritmo de pases.
                </h3>
              </div>
              <span className="shrink-0 font-mono text-[0.58rem] font-semibold uppercase tracking-[0.12em] text-gold/90">
                KDS
              </span>
            </div>

            <CocinaQueueGraphic />

            <p className="mt-7 text-[0.96rem] font-medium leading-[1.65] text-charcoal/55">
              Tickets ordenados por estación; el pase no se pierde entre páginas sueltas ni gritos al fondo.
            </p>
          </motion.article>

          {/* ── Caja ─────────────────────────────────────── */}
          <motion.article
            variants={iVar}
            className="relative flex flex-col rounded-[1.75rem] border border-charcoal/[0.09] bg-white/[0.38] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.92)] backdrop-blur-md lg:col-span-5 lg:col-start-8 lg:row-start-2 lg:p-9"
          >
            <div className="mb-6 border-b border-charcoal/[0.07] pb-5">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.3em] text-charcoal/38">03 · Caja</p>
              <h3 className="mt-2.5 font-serif text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-charcoal">
                Cierre sin fricción.
              </h3>
            </div>

            <CajaReceiptGraphic />

            <p className="mt-7 text-[0.96rem] font-medium leading-[1.65] text-charcoal/55">
              División por comensal, propina y total en una sola línea de cobro — menos calculadora, menos reclamos en el cierre.
            </p>
          </motion.article>

          {/* ── Gerencia — menos “bloque macizo”, más lámina oscura ── */}
          <motion.article
            variants={iVar}
            className="relative flex flex-col gap-10 overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-charcoal px-8 py-10 text-cream shadow-[0_20px_60px_-35px_rgba(0,0,0,0.45)] lg:col-span-12 lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:px-12 lg:py-11"
          >
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage:
                  "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
              }}
              aria-hidden="true"
            />
            <div className="pointer-events-none absolute -right-20 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-gold/[0.07] blur-3xl" aria-hidden="true" />

            {/* Dial */}
            <div className="relative hidden shrink-0 lg:flex lg:h-44 lg:w-44 lg:items-center lg:justify-center" aria-hidden="true">
              <motion.div
                initial={{ rotate: 0 }}
                animate={pauseOrbits ? false : { rotate: 360 }}
                transition={
                  pauseOrbits ? undefined : { duration: 40, repeat: Infinity, ease: "linear" }
                }
                className="absolute inset-0 rounded-full border-[1.5px] border-dashed border-white/18"
              />
              <motion.div
                initial={{ rotate: 0 }}
                animate={pauseOrbits ? false : { rotate: -360 }}
                transition={
                  pauseOrbits ? undefined : { duration: 26, repeat: Infinity, ease: "linear" }
                }
                className="absolute inset-2.5 rounded-full border-t border-l border-gold/35"
              />
              <div className="absolute inset-9 rounded-full bg-gradient-to-br from-gold/12 via-transparent to-transparent" />
              <div className="relative text-center">
                <p className="font-serif text-[3rem] font-medium leading-none tracking-tighter text-white tabular-nums">
                  84<span className="text-xl text-white/45">%</span>
                </p>
                <p className="mt-2 text-[0.5rem] font-bold uppercase tracking-[0.3em] text-white/38">
                  Al ritmo
                </p>
              </div>
            </div>

            <div className="relative max-w-2xl flex-1">
              <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-white/40">04 · Gerencia</p>
              <h3 className="mt-3 font-serif text-[clamp(1.85rem,3.2vw,2.85rem)] font-semibold leading-[1.05] tracking-tight text-white">
                Un solo panel para varias sucursales.
              </h3>
              <p className="mt-4 text-[1.05rem] font-medium leading-[1.75] text-white/58">
                Ticket medio, rotación y excepciones del turno en el teléfono del dueño — sin exportar Excel a medianoche.
              </p>

              <dl className="mt-8 grid max-w-xl grid-cols-3 gap-6 border-t border-white/10 pt-8">
                {[
                  { label: "Ticket medio", value: "$286" },
                  { label: "Rotación / h", value: "2.4×" },
                  { label: "A pase", value: "11m" },
                ].map(({ label, value }) => (
                  <div key={label}>
                    <dt className="text-[0.52rem] font-bold uppercase tracking-[0.26em] text-white/38">{label}</dt>
                    <dd className="mt-2 font-serif text-[1.35rem] font-semibold tabular-nums text-white">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative shrink-0">
              <motion.a
                href="#contacto"
                whileHover={reduceMotion ? undefined : { y: -2 }}
                whileTap={reduceMotion ? undefined : { scale: 0.98 }}
                className="group/btn inline-flex items-center gap-3 rounded-full bg-white/10 py-2 pl-5 pr-1.5 text-[0.82rem] font-semibold text-white ring-1 ring-white/15 transition-colors hover:bg-white/[0.14]"
              >
                <span>Hablar con el equipo</span>
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-gold text-charcoal transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5 group-hover/btn:scale-105">
                  <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                    <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </motion.a>
            </div>
          </motion.article>
        </div>
      </motion.div>
    </section>
  );
};
