"use client";

import { motion, useReducedMotion } from "framer-motion";

const easeOutQuint = [0.32, 0.72, 0, 1] as const;

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  show: {
    opacity: 1, y: 0,
    transition: { duration: 0.8, ease: easeOutQuint },
  },
};

const mockupVariants = {
  hidden: { opacity: 0, scale: 0.95, y: 40 },
  show: {
    opacity: 1, scale: 1, y: 0,
    transition: { duration: 1, ease: easeOutQuint, delay: 0.3 },
  },
};

/* Ilustración floral decorativa SVG */
function FloralAccent({ className, variant = "left" }: { className?: string; variant?: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 200 300"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      {variant === "left" ? (
        <>
          <motion.path
            d="M100 280 Q80 200 60 150 Q40 100 20 80"
            stroke="#C75B7A"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          />
          <motion.circle cx="20" cy="80" r="8" fill="#E8A5B0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: "spring" }} />
          <motion.circle cx="45" cy="120" r="6" fill="#D68C9F" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.7, type: "spring" }} />
          <motion.circle cx="60" cy="160" r="7" fill="#C75B7A" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.9, type: "spring" }} />
          <motion.path d="M45 120 Q35 110 30 125 Q40 130 45 120Z" fill="#A8B0A0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }} />
          <motion.path d="M60 160 Q50 150 48 168 Q58 170 60 160Z" fill="#8A9A84" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.1 }} />
        </>
      ) : (
        <>
          <motion.path
            d="M100 280 Q120 200 140 150 Q160 100 180 80"
            stroke="#C75B7A"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 2, ease: "easeOut", delay: 0.5 }}
          />
          <motion.circle cx="180" cy="80" r="8" fill="#E8A5B0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.5, type: "spring" }} />
          <motion.circle cx="155" cy="120" r="6" fill="#D68C9F" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.7, type: "spring" }} />
          <motion.circle cx="140" cy="160" r="7" fill="#C75B7A" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 1.9, type: "spring" }} />
          <motion.path d="M155 120 Q165 110 170 125 Q160 130 155 120Z" fill="#A8B0A0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }} />
          <motion.path d="M140 160 Q150 150 152 168 Q142 170 140 160Z" fill="#8A9A84" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.1 }} />
        </>
      )}
    </svg>
  );
}

/* Mockup de teléfono con app Bouquet */
function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[240px] shrink-0">
      {/* Marco del teléfono */}
      <div className="relative rounded-[2.5rem] bg-burgundy p-2 shadow-[0_25px_60px_-20px_rgba(74,26,44,0.4)]">
        <div className="relative overflow-hidden rounded-[2rem] bg-rose-cream">
          {/* Notch */}
          <div className="absolute left-1/2 top-0 z-10 h-6 w-24 -translate-x-1/2 rounded-b-2xl bg-burgundy" />
          
          {/* Contenido de la app */}
          <div className="px-5 pt-10 pb-6">
            {/* Header */}
            <div className="mb-6 text-center">
              <p className="font-mono text-[0.65rem] font-bold uppercase tracking-[0.2em] text-burgundy/50">Mesa 12</p>
              <p className="mt-1 font-serif text-lg font-semibold italic text-burgundy">¡Bienvenidos!</p>
            </div>
            
            {/* Ilustración de comensales */}
            <div className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-full bg-rose-blush/60">
              <svg viewBox="0 0 100 80" className="h-20 w-20" aria-hidden="true">
                <circle cx="35" cy="25" r="10" fill="#D68C9F" />
                <circle cx="65" cy="25" r="10" fill="#E8A5B0" />
                <path d="M25 45 Q35 35 45 45 L55 45 Q65 35 75 45 L80 60 Q50 70 20 60Z" fill="#C75B7A" />
                <circle cx="50" cy="35" r="6" fill="#F5D5DC" />
                <path d="M42 42 Q50 38 58 42 L55 50 Q50 52 45 50Z" fill="#8A9A84" />
              </svg>
            </div>
            
            {/* Opciones del menú */}
            <div className="space-y-2.5">
              {[
                { icon: "🍽️", label: "Ver menú", arrow: true },
                { icon: "📋", label: "Mis órdenes", arrow: true },
                { icon: "👥", label: "Cuenta compartida", arrow: true },
                { icon: "💳", label: "Pagar cuenta", arrow: true },
              ].map((item) => (
                <div
                  key={item.label}
                  className="flex items-center justify-between rounded-xl bg-white/80 px-4 py-3 shadow-[0_1px_3px_rgba(74,26,44,0.06)]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-[0.82rem] font-semibold text-burgundy">{item.label}</span>
                  </div>
                  {item.arrow && (
                    <svg className="h-4 w-4 text-burgundy/40" viewBox="0 0 20 20" fill="none">
                      <path d="M8 6l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
              ))}
            </div>
          </div>
          
          {/* Bottom bar */}
          <div className="flex items-center justify-around border-t border-burgundy/5 bg-white/50 px-4 py-3">
            <div className="h-5 w-5 rounded-full bg-rose/20" />
            <div className="h-5 w-5 rounded-full bg-burgundy/20" />
            <div className="h-5 w-5 rounded-full bg-sage/30" />
            <div className="h-5 w-5 rounded-full bg-burgundy/20" />
          </div>
        </div>
      </div>
      
      {/* Badge QR flotante */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ delay: 1.2, duration: 0.6, ease: easeOutQuint }}
        className="absolute -right-8 -bottom-4 flex h-20 w-20 flex-col items-center justify-center rounded-full bg-white shadow-[0_8px_24px_rgba(74,26,44,0.15)] ring-1 ring-rose-blush"
      >
        <svg viewBox="0 0 40 40" className="h-10 w-10">
          <rect x="4" y="4" width="12" height="12" rx="2" fill="#4A1A2C" />
          <rect x="6" y="6" width="8" height="8" rx="1" fill="white" />
          <rect x="8" y="8" width="4" height="4" rx="0.5" fill="#4A1A2C" />
          <rect x="24" y="4" width="12" height="12" rx="2" fill="#4A1A2C" />
          <rect x="26" y="6" width="8" height="8" rx="1" fill="white" />
          <rect x="28" y="8" width="4" height="4" rx="0.5" fill="#4A1A2C" />
          <rect x="4" y="24" width="12" height="12" rx="2" fill="#4A1A2C" />
          <rect x="6" y="26" width="8" height="8" rx="1" fill="white" />
          <rect x="8" y="28" width="4" height="4" rx="0.5" fill="#4A1A2C" />
          <rect x="20" y="20" width="4" height="4" rx="1" fill="#C75B7A" />
          <rect x="26" y="20" width="4" height="4" rx="1" fill="#4A1A2C" />
          <rect x="32" y="20" width="4" height="4" rx="1" fill="#C75B7A" />
          <rect x="20" y="26" width="4" height="4" rx="1" fill="#4A1A2C" />
          <rect x="26" y="26" width="4" height="4" rx="1" fill="#C75B7A" />
          <rect x="32" y="26" width="4" height="4" rx="1" fill="#4A1A2C" />
          <rect x="20" y="32" width="4" height="4" rx="1" fill="#C75B7A" />
          <rect x="26" y="32" width="4" height="4" rx="1" fill="#4A1A2C" />
          <rect x="32" y="32" width="4" height="4" rx="1" fill="#C75B7A" />
        </svg>
        <span className="mt-0.5 text-[0.35rem] font-bold uppercase tracking-[0.1em] text-burgundy/70">Escanea</span>
      </motion.div>
    </div>
  );
}

/* Ticket / Recibo mockup */
function TicketMockup() {
  return (
    <motion.div
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.8, ease: easeOutQuint }}
      className="relative w-[200px] shrink-0"
    >
      <div className="rounded-xl bg-white p-5 shadow-[0_12px_40px_rgba(74,26,44,0.12)] ring-1 ring-rose-blush/60">
        {/* Header */}
        <div className="mb-4 text-center">
          <p className="font-serif text-sm font-semibold italic text-burgundy">bouquet</p>
          <p className="font-mono text-[0.55rem] font-bold uppercase tracking-[0.15em] text-burgundy/50">Mesa 12</p>
        </div>
        
        <div className="space-y-2.5 border-b border-dashed border-burgundy/10 pb-4">
          {[
            { item: "Entrada compartida", price: "$180" },
            { item: "Plato fuerte", price: "$340" },
            { item: "Bebida", price: "$120" },
            { item: "Postre compartido", price: "$160" },
          ].map((line) => (
            <div key={line.item} className="flex justify-between text-[0.72rem]">
              <span className="text-burgundy/70">{line.item}</span>
              <span className="font-mono font-semibold text-burgundy">{line.price}</span>
            </div>
          ))}
        </div>
        
        <div className="mt-3 flex justify-between border-b border-burgundy/10 pb-3">
          <span className="text-[0.75rem] font-bold text-burgundy">Total</span>
          <span className="font-mono text-[0.85rem] font-bold text-burgundy">$800</span>
        </div>
        
        <div className="mt-3">
          <p className="mb-2 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-burgundy/40">Aporte por comensal</p>
          <div className="space-y-1.5">
            {[
              { name: "Ana", amount: "$250", paid: true },
              { name: "Luis", amount: "$250", paid: true },
              { name: "María", amount: "$300", paid: true },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between text-[0.7rem]">
                <div className="flex items-center gap-2">
                  <span className="text-burgundy/60">{p.name}</span>
                  {p.paid && (
                    <svg className="h-3 w-3 text-sage-deep" viewBox="0 0 20 20" fill="none">
                      <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  )}
                </div>
                <span className="font-mono font-medium text-burgundy/80">{p.amount}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="mt-4 text-center">
          <p className="font-serif text-sm italic text-rose">¡Gracias!</p>
          <p className="mt-0.5 text-[0.55rem] text-burgundy/40">Florecemos juntos</p>
        </div>
      </div>
      
      {/* Flores decorativas abajo */}
      <svg viewBox="0 0 100 30" className="absolute -bottom-2 left-1/2 h-8 w-20 -translate-x-1/2" aria-hidden="true">
        <motion.path
          d="M10 15 Q30 5 50 15 Q70 25 90 15"
          stroke="#C75B7A"
          strokeWidth="1.5"
          strokeLinecap="round"
          fill="none"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1.5, delay: 1.5 }}
        />
        <motion.circle cx="20" cy="12" r="4" fill="#E8A5B0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2 }} />
        <motion.circle cx="50" cy="15" r="5" fill="#D68C9F" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.2 }} />
        <motion.circle cx="80" cy="12" r="4" fill="#E8A5B0" initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 2.4 }} />
      </svg>
    </motion.div>
  );
}

export const Hero = () => {
  const reduceMotion = useReducedMotion() === true;
  const cVariants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0, delayChildren: 0 } } }
    : containerVariants;
  const iVariants = reduceMotion
    ? { hidden: { opacity: 0 }, show: { opacity: 1, transition: { duration: 0 } } }
    : itemVariants;
  const mVariants = reduceMotion
    ? { hidden: { opacity: 1, scale: 1, y: 0 }, show: { opacity: 1, scale: 1, y: 0, transition: { duration: 0 } } }
    : mockupVariants;

  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
      {/* Fondo atmosférico */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5 }}
          className="absolute left-[-10%] top-[-5%] h-[30rem] w-[30rem] rounded-full bg-rose/10 blur-3xl"
        />
        <motion.div
          initial={reduceMotion ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.5, delay: 0.3 }}
          className="absolute right-[-8%] bottom-[10%] h-[25rem] w-[25rem] rounded-full bg-sage/10 blur-3xl"
        />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-burgundy/10 to-transparent" />
      </div>

      {/* Acentos florales */}
      <FloralAccent className="absolute left-4 top-20 h-40 w-24 opacity-40 lg:left-12 lg:top-28 lg:h-56 lg:w-32" variant="left" />
      <FloralAccent className="absolute right-4 bottom-20 h-40 w-24 opacity-40 lg:right-12 lg:bottom-28 lg:h-56 lg:w-32" variant="right" />

      <div className="mx-auto grid w-full max-w-7xl gap-12 px-6 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-8 lg:px-10">
        {/* Columna izquierda — texto */}
        <motion.div variants={cVariants} initial="hidden" animate="show" className="max-w-xl">
          <motion.div variants={iVariants}>
            <div className="inline-flex items-center gap-3 rounded-full px-3.5 py-1.5 ring-1 ring-burgundy/10 bg-white/60 backdrop-blur-sm shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
              <span className="relative flex h-2 w-2">
                {!reduceMotion && (
                  <span className="absolute inline-flex h-full w-full rounded-full bg-rose/50 animate-ping" aria-hidden="true" />
                )}
                <span className="relative inline-flex h-2 w-2 rounded-full bg-rose" aria-hidden="true" />
              </span>
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-burgundy/65">
                Hospitality OS · servicio real
              </span>
            </div>
          </motion.div>

          {/* Logo grande */}
          <motion.div variants={iVariants} className="mt-8">
            <p className="mb-2 font-mono text-[0.75rem] font-bold uppercase tracking-[0.25em] text-rose">
              crea tu
            </p>
            <h1 className="font-serif text-[clamp(3.5rem,8vw,6.5rem)] font-semibold italic leading-[0.85] tracking-[-0.03em] text-burgundy">
              bouquet
            </h1>
          </motion.div>

          {/* Tagline */}
          <motion.p variants={iVariants} className="mt-6 max-w-lg text-balance text-[1.1rem] leading-[1.75] text-burgundy/65">
            Ordena el turno para que el equipo vea qué mesa pide, qué pasa a cocina y qué se cobra.
            Sin libretas, sin walkie-talkies, sin duplicados.
          </motion.p>

          {/* Pilares */}
          <motion.div variants={iVariants} className="mt-8 flex flex-wrap items-center gap-3">
            {["MESAS", "ÓRDENES", "PAGOS"].map((pilar, i) => (
              <span key={pilar} className="flex items-center gap-3">
                <span className="font-mono text-[0.72rem] font-bold uppercase tracking-[0.2em] text-burgundy/80">
                  {pilar}
                </span>
                {i < 2 && (
                  <span className="h-1 w-1 rounded-full bg-rose/60" />
                )}
              </span>
            ))}
          </motion.div>

          {/* CTAs */}
          <motion.div variants={iVariants} className="mt-10 flex flex-col gap-4 sm:flex-row">
            <motion.a
              href="#contacto"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className="group inline-flex h-14 w-full items-center justify-between gap-4 rounded-full bg-burgundy px-2 pl-8 text-[1rem] font-semibold text-white shadow-[0_20px_40px_-20px_rgba(74,26,44,0.5)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose sm:min-w-[280px]"
            >
              <span>Reservar demo de 20 min</span>
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose/95 ring-1 ring-white/20 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </motion.a>

            <motion.a
              href="#como-funciona"
              whileHover={reduceMotion ? undefined : { y: -2 }}
              whileTap={reduceMotion ? undefined : { scale: 0.98 }}
              transition={{ type: "spring", stiffness: 380, damping: 24 }}
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-burgundy/10 bg-white/60 px-8 text-[1rem] font-semibold text-burgundy transition-[border-color,background-color] duration-300 hover:border-burgundy/25 hover:bg-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose sm:min-w-[240px]"
            >
              Ver recorrido operativo
              <svg className="h-3.5 w-3.5 text-burgundy/50" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M6 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </motion.a>
          </motion.div>

          {/* Badges de confianza */}
          <motion.div variants={iVariants} className="mt-8 flex flex-wrap items-center gap-2 text-[0.82rem] font-medium text-burgundy/55">
            {[
              { text: "Sin tarjeta de crédito", dot: "bg-burgundy/20" },
              { text: "Configuración en 1 día", dot: "bg-burgundy/20" },
              { text: "Soporte humano", dot: "bg-rose" },
            ].map((badge) => (
              <span key={badge.text} className="flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ring-burgundy/5 bg-white/50 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
                <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`} />
                {badge.text}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {/* Columna derecha — mockups */}
        <motion.div
          variants={mVariants}
          initial="hidden"
          animate="show"
          className="relative flex items-center justify-center gap-4 lg:gap-6"
        >
          <PhoneMockup />
          <div className="hidden sm:block">
            <TicketMockup />
          </div>
        </motion.div>
      </div>
    </section>
  );
};
