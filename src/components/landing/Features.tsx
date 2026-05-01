"use client";

import { motion, useReducedMotion } from "framer-motion";

const easeOutQuint = [0.22, 1, 0.36, 1] as const;

/* Iconografía estilo línea minimalista */
function IconMesas({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="8" y="8" width="14" height="14" rx="3" />
      <rect x="26" y="8" width="14" height="14" rx="3" />
      <rect x="8" y="26" width="14" height="14" rx="3" />
      <rect x="26" y="26" width="14" height="14" rx="3" />
    </svg>
  );
}

function IconOrdenes({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <path d="M12 12h24M12 20h20M12 28h16M12 36h22" />
      <circle cx="38" cy="28" r="4" fill="currentColor" fillOpacity="0.15" />
      <path d="M36 28l1.5 1.5L40 26" strokeWidth="2" />
    </svg>
  );
}

function IconPagos({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" className={className} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
      <rect x="6" y="14" width="36" height="20" rx="4" />
      <path d="M6 22h36" strokeWidth="1" />
      <circle cx="30" cy="24" r="6" fill="currentColor" fillOpacity="0.1" stroke="none" />
      <text x="30" y="27" textAnchor="middle" fontSize="8" fontWeight="bold" fill="currentColor">$</text>
    </svg>
  );
}

/* Decoración floral SVG */
function FloralDivider({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 20" className={className} fill="none" aria-hidden="true">
      <circle cx="10" cy="10" r="3" fill="#E8A5B0" />
      <circle cx="30" cy="8" r="2.5" fill="#D68C9F" />
      <circle cx="50" cy="10" r="4" fill="#C75B7A" />
      <circle cx="70" cy="8" r="2.5" fill="#D68C9F" />
      <circle cx="90" cy="10" r="3" fill="#E8A5B0" />
      <circle cx="110" cy="9" r="2" fill="#F5D5DC" />
      <path d="M10 10 Q30 5 50 10 Q70 15 90 10 Q100 7 110 9" stroke="#C75B7A" strokeWidth="0.8" strokeLinecap="round" opacity="0.4" />
    </svg>
  );
}

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.06 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.55, ease: easeOutQuint },
  },
};

export const Features = () => {
  const reduceMotion = useReducedMotion() === true;
  const cVar = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } } }
    : containerVariants;
  const iVar = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0 } } }
    : itemVariants;

  const features = [
    {
      num: "01",
      title: "Mesas",
      subtitle: "Organiza tu sala con claridad",
      description: "Visualiza el estado de cada mesa en tiempo real. Sabe quién pide, quién espera y cuándo liberas cubierta.",
      icon: IconMesas,
      color: "text-rose",
      bgColor: "bg-rose/5",
      ringColor: "ring-rose/15",
      highlight: "Sala en vivo",
    },
    {
      num: "02",
      title: "Órdenes",
      subtitle: "Flujo directo a cocina y barra",
      description: "Las comandas llegan ordenadas por estación. El pase no se pierde entre páginas sueltas ni gritos.",
      icon: IconOrdenes,
      color: "text-burgundy",
      bgColor: "bg-burgundy/5",
      ringColor: "ring-burgundy/15",
      highlight: "KDS integrado",
    },
    {
      num: "03",
      title: "Pagos",
      subtitle: "Cierre sin fricción",
      description: "División por comensal, propina y total en una sola línea de cobro. Menos calculadora, menos reclamos.",
      icon: IconPagos,
      color: "text-sage-deep",
      bgColor: "bg-sage/10",
      ringColor: "ring-sage/20",
      highlight: "Split bill",
    },
  ];

  return (
    <section
      id="como-funciona"
      className="relative overflow-hidden border-t border-burgundy/[0.06] bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#FDF2F5_0%,#F5D5DC_40%,#FAF6F3_100%)] py-24 lg:py-36"
    >
      {/* Capa atmosférica */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 20% 30%, rgba(199,91,122,0.06) 0%, transparent 45%), radial-gradient(circle at 80% 70%, rgba(168,176,160,0.08) 0%, transparent 42%)",
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
        {/* Encabezado */}
        <header className="mb-16 lg:mb-20">
          <div className="flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <motion.p
                variants={iVar}
                className="mb-5 inline-flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-burgundy/45"
              >
                <span className="h-px w-12 bg-gradient-to-r from-rose/80 to-rose/20" aria-hidden="true" />
                Cómo funciona
              </motion.p>
              <motion.h2
                variants={iVar}
                className="font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-medium italic leading-[1.02] tracking-[-0.02em] text-burgundy"
              >
                Tres pilares.
                <span className="block font-sans text-[0.45em] font-black not-italic tracking-[-0.05em] text-burgundy/45 sm:mt-1">
                  Una sola plataforma.
                </span>
              </motion.h2>
            </div>
            <motion.p
              variants={iVar}
              className="max-w-md text-[1.05rem] font-medium leading-[1.75] text-burgundy/55 lg:pb-1"
            >
              Nada de pantallas que compiten entre sí: mesa, cocina, barra y caja comparten el mismo estado del turno.
            </motion.p>
          </div>
        </header>

        {/* Grid de 3 features */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3 lg:gap-8">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <motion.article
                key={feature.num}
                variants={iVar}
                className="group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-burgundy/[0.08] bg-white/[0.5] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_32px_rgba(74,26,44,0.06)] backdrop-blur-md lg:p-10 transition-all duration-500 hover:shadow-[0_12px_40px_rgba(74,26,44,0.1)] hover:-translate-y-1"
              >
                {/* Top line decorativa */}
                <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent opacity-80" />

                {/* Header de la card */}
                <div className="mb-6 flex items-start justify-between">
                  <div className={`flex h-14 w-14 items-center justify-center rounded-2xl ${feature.bgColor} ring-1 ${feature.ringColor}`}>
                    <Icon className={`h-7 w-7 ${feature.color}`} />
                  </div>
                  <span className="font-mono text-[0.6rem] font-bold uppercase tracking-[0.15em] text-burgundy/30">
                    {feature.num}
                  </span>
                </div>

                {/* Contenido */}
                <div className="mb-2">
                  <span className={`inline-block rounded-full px-2.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.15em] ${feature.bgColor} ${feature.color} mb-3`}>
                    {feature.highlight}
                  </span>
                  <h3 className="font-serif text-[1.65rem] font-semibold leading-[1.12] tracking-tight text-burgundy">
                    {feature.title}
                  </h3>
                  <p className="mt-1.5 text-[0.85rem] font-medium text-burgundy/50">
                    {feature.subtitle}
                  </p>
                </div>

                <p className="mt-4 text-[0.95rem] font-medium leading-[1.7] text-burgundy/55">
                  {feature.description}
                </p>

                {/* Decoración floral sutil */}
                <div className="mt-auto pt-6">
                  <FloralDivider className="h-3 w-full opacity-40" />
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Gerencia — card ancha */}
        <motion.article
          variants={iVar}
          className="relative mt-6 flex flex-col gap-10 overflow-hidden rounded-[1.75rem] border border-white/[0.07] bg-burgundy px-8 py-10 text-white shadow-[0_20px_60px_-35px_rgba(74,26,44,0.45)] lg:flex-row lg:items-center lg:justify-between lg:gap-14 lg:px-12 lg:py-11"
        >
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
            }}
            aria-hidden="true"
          />
          <div className="pointer-events-none absolute -right-20 top-1/2 h-[28rem] w-[28rem] -translate-y-1/2 rounded-full bg-rose/[0.07] blur-3xl" aria-hidden="true" />

          <div className="relative max-w-2xl flex-1">
            <p className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-white/40">04 · Gerencia</p>
            <h3 className="mt-3 font-serif text-[clamp(1.65rem,3vw,2.5rem)] font-semibold leading-[1.05] tracking-tight text-white">
              Un solo panel para varias sucursales.
            </h3>
            <p className="mt-4 text-[1.05rem] font-medium leading-[1.75] text-white/55">
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
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-rose text-white transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover/btn:translate-x-0.5 group-hover/btn:scale-105">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </motion.a>
          </div>
        </motion.article>
      </motion.div>
    </section>
  );
};
