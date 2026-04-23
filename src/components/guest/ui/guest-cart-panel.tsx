"use client";

import { memo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { User, Users, Send, X } from "lucide-react";
import { cn } from "@/lib/utils";

// ── Celebration ─────────────────────────────────────────────────────────────

const PARTICLES = [
  { dx:   0, dy: -88, color: "var(--guest-gold)",  r: 4.5 },
  { dx:  44, dy: -76, color: "#10b981",             r: 3.5 },
  { dx:  76, dy: -44, color: "#f59e0b",             r: 4   },
  { dx:  88, dy:   0, color: "var(--guest-gold)",  r: 4.5 },
  { dx:  76, dy:  44, color: "#10b981",             r: 3.5 },
  { dx:  44, dy:  76, color: "#f59e0b",             r: 4   },
  { dx:   0, dy:  88, color: "var(--guest-gold)",  r: 4.5 },
  { dx: -44, dy:  76, color: "#10b981",             r: 3.5 },
  { dx: -76, dy:  44, color: "#f59e0b",             r: 4   },
  { dx: -88, dy:   0, color: "var(--guest-gold)",  r: 4.5 },
  { dx: -76, dy: -44, color: "#10b981",             r: 3.5 },
  { dx: -44, dy: -76, color: "#f59e0b",             r: 4   },
  // Inner ring — smaller, staggered
  { dx:   0, dy: -52, color: "#10b981",             r: 3   },
  { dx:  52, dy:   0, color: "var(--guest-gold)",  r: 3   },
  { dx:   0, dy:  52, color: "#f59e0b",             r: 3   },
  { dx: -52, dy:   0, color: "var(--guest-gold)",  r: 3   },
] as const;

const OrderCelebration = memo(function OrderCelebration() {
  const rm = useReducedMotion();
  return (
    <div className="flex min-h-[300px] flex-col items-center justify-center gap-5 py-8">
      {/* ── Check + particles ── */}
      <div className="relative flex items-center justify-center">
        {/* Particles */}
        {!rm && PARTICLES.map((p, i) => (
          <motion.span
            key={i}
            className="absolute rounded-full"
            style={{ width: p.r * 2, height: p.r * 2, backgroundColor: p.color }}
            initial={{ x: 0, y: 0, opacity: 1, scale: 1 }}
            animate={{ x: p.dx, y: p.dy, opacity: [1, 1, 0], scale: [1, 1.5, 0] }}
            transition={{ duration: 0.72, delay: 0.22 + i * 0.022, ease: "easeOut" }}
            aria-hidden="true"
          />
        ))}

        {/* Glow burst */}
        {!rm && (
          <motion.span
            className="absolute size-28 rounded-full"
            style={{ background: "radial-gradient(ellipse, color-mix(in srgb, var(--guest-gold) 22%, transparent) 0%, transparent 70%)" }}
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: [0.4, 1.8, 1.1], opacity: [0, 0.7, 0] }}
            transition={{ duration: 0.85, delay: 0.18 }}
            aria-hidden="true"
          />
        )}

        {/* Breathing glow — after check appears */}
        {!rm && (
          <motion.span
            className="absolute size-[72px] rounded-full"
            style={{ background: "radial-gradient(ellipse, color-mix(in srgb, var(--guest-gold) 18%, transparent), transparent 70%)" }}
            initial={{ opacity: 0 }}
            animate={{ scale: [1, 1.22, 1], opacity: [0, 0.35, 0.12, 0.35] }}
            transition={{ delay: 1.1, duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            aria-hidden="true"
          />
        )}

        {/* SVG animated check */}
        <motion.svg
          viewBox="0 0 64 64"
          className="relative z-[1] size-[72px]"
          initial={{ scale: 0.65, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.08, type: "spring", stiffness: 360, damping: 22 }}
          aria-hidden="true"
        >
          {/* Background fill */}
          <circle
            cx="32" cy="32" r="28"
            fill="color-mix(in srgb, var(--guest-gold) 9%, transparent)"
          />
          {/* Circle draw — rotated so it starts from 12 o'clock */}
          <g transform="rotate(-90 32 32)">
            <motion.circle
              cx="32" cy="32" r="28"
              stroke="var(--guest-gold)"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.52, ease: "easeOut", delay: 0.14 }}
            />
          </g>
          {/* Check path */}
          <motion.path
            d="M20 32 L29 41 L44 23"
            stroke="var(--guest-gold)"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.36, delay: 0.62, ease: "easeOut" }}
          />
        </motion.svg>
      </div>

      {/* ── Text ── */}
      <div className="text-center">
        <motion.p
          initial={{ opacity: 0, scale: 0.88, y: 6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.76, type: "spring", stiffness: 440, damping: 22 }}
          className="text-[1.25rem] font-bold tracking-tight text-[var(--guest-text)]"
        >
          ¡Orden enviada!
        </motion.p>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.0 }}
          className="mt-1.5 text-[12px] text-[var(--guest-muted)]"
        >
          Tu pedido está en camino a la cocina
        </motion.p>
      </div>
    </div>
  );
});

export type GuestCartLine = {
  key: string;
  name: string;
  variantLabel: string | null;
  qty: number;
  lineTotal: number;
};

export type GuestCartPanelProps = {
  cartLines: GuestCartLine[];
  cartCount: number;
  cartTotal: number;
  partySize: number;
  tableCode: string;
  scrollable?: boolean;
  onRemove: (lineKey: string) => void;
  onClear: () => void;
  onClose?: () => void;
  onCheckout: (isShared: boolean) => void;
  isSubmitting?: boolean;
  showCelebration?: boolean;
};

export function GuestCartPanel({
  cartLines,
  cartCount,
  cartTotal,
  partySize,
  tableCode,
  scrollable,
  onRemove,
  onClear,
  onClose,
  onCheckout,
  isSubmitting,
  showCelebration,
}: GuestCartPanelProps) {
  const reduceMotion = useReducedMotion();
  const [isShared, setIsShared] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <div
      className={cn(
        showCelebration && !reduceMotion && "guest-celebrate-ring rounded-[22px]",
      )}
    >
      <div className="flex items-end justify-between border-b border-[var(--guest-divider)] pb-4">
        <div>
          <h2 id="guest-cart-title" className="font-serif text-2xl text-[var(--guest-text)]">
            Tu orden
          </h2>
          <p className="mt-1 font-mono text-sm text-[var(--guest-muted)]">Mesa {tableCode}</p>
        </div>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="min-h-11 min-w-11 text-sm font-medium text-[var(--guest-muted)] transition-colors hover:text-[var(--guest-text)]"
          >
            Cerrar
          </button>
        )}
      </div>

      {cartCount === 0 ? (
        showCelebration
          ? <OrderCelebration />
          : <p className="mt-8 text-sm italic text-[var(--guest-muted)]">Selecciona platillos del menú para agregarlos a tu orden.</p>
      ) : (
        <>
          <div
            className={cn(
              "mt-6 divide-y divide-[var(--guest-divider)]",
              scrollable && "max-h-[38vh] overflow-y-auto",
            )}
          >
            {cartLines.map((line, idx) => (
              <motion.div
                key={line.key}
                initial={reduceMotion ? false : { opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={reduceMotion ? undefined : { delay: idx * 0.04 }}
                className="flex items-start justify-between gap-4 py-4"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold leading-snug text-[var(--guest-text)]">{line.name}</p>
                  {line.variantLabel && (
                    <p className="mt-1 text-xs font-medium text-[var(--guest-gold)]">{line.variantLabel}</p>
                  )}
                  <p className="mt-2 font-mono text-xs tabular-nums text-[var(--guest-muted)]">
                    {line.qty}× · ${line.lineTotal.toLocaleString("es-MX")}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => onRemove(line.key)}
                  aria-label={`Eliminar ${line.name}${line.variantLabel ? ` (${line.variantLabel})` : ""}`}
                  className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full text-[var(--guest-subtle)] transition-colors hover:bg-[var(--guest-divider)] hover:text-[var(--guest-urgent)]"
                >
                  <X className="size-3" strokeWidth={2.5} />
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 border-t border-[var(--guest-divider)] pt-6">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--guest-muted)]">Total</span>
              <span className="font-mono text-2xl font-bold tabular-nums leading-none text-[var(--guest-gold)]">
                ${cartTotal.toLocaleString("es-MX")}
              </span>
            </div>
            <p className="mt-2 text-xs text-[var(--guest-muted)]">
              {cartCount} platillo{cartCount !== 1 ? "s" : ""} · {partySize} comensal{partySize !== 1 ? "es" : ""}
            </p>
          </div>

          {/* Tipo de orden */}
          <div className="mt-6">
            <p className="mb-2.5 text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--guest-muted)]">
              Tipo de orden
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setIsShared(false)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 transition-all",
                  !isShared
                    ? "border-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_7%,transparent)] text-[var(--guest-text)]"
                    : "border-[var(--guest-divider)] text-[var(--guest-muted)] hover:border-[color-mix(in_srgb,var(--guest-gold)_25%,transparent)]"
                )}
              >
                <User className={cn("size-4", !isShared ? "text-[var(--guest-gold)]" : "text-[var(--guest-muted)]")} />
                <span className="text-xs font-semibold">Solo para mí</span>
                <span className="text-[10px] leading-tight opacity-60">Cuenta individual</span>
              </button>
              <button
                type="button"
                onClick={() => setIsShared(true)}
                className={cn(
                  "flex flex-col items-center gap-1.5 rounded-2xl border px-3 py-3.5 transition-all",
                  isShared
                    ? "border-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_7%,transparent)] text-[var(--guest-text)]"
                    : "border-[var(--guest-divider)] text-[var(--guest-muted)] hover:border-[color-mix(in_srgb,var(--guest-gold)_25%,transparent)]"
                )}
              >
                <Users className={cn("size-4", isShared ? "text-[var(--guest-gold)]" : "text-[var(--guest-muted)]")} />
                <span className="text-xs font-semibold">Para compartir</span>
                <span className="text-[10px] leading-tight opacity-60">Se divide entre todos</span>
              </button>
            </div>

            <AnimatePresence>
              {isShared && (
                <motion.div
                  initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: -4, height: 0 }}
                  animate={{ opacity: 1, y: 0, height: "auto" }}
                  exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -4, height: 0 }}
                  className="mt-3 overflow-hidden"
                >
                  <div className="rounded-xl bg-[color-mix(in_srgb,var(--guest-gold)_10%,transparent)] px-4 py-3 border border-[color-mix(in_srgb,var(--guest-gold)_24%,transparent)]">
                    <p className="flex items-center justify-between text-xs font-medium text-[var(--guest-text)]">
                      <span>Total compartible</span>
                      <strong className="font-mono">${cartTotal.toLocaleString("es-MX")}</strong>
                    </p>
                    <div className="mt-2 flex items-center justify-between text-xs font-bold text-[color-mix(in_srgb,var(--guest-gold)_85%,#333)]">
                      <span>Sugerido por persona (×{partySize})</span>
                      <span className="font-mono text-sm">${Math.ceil(cartTotal / partySize).toLocaleString("es-MX")}</span>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* ── Checkout / Confirm ────────────────────────────────── */}
          <AnimatePresence mode="wait" initial={false}>
            {showConfirm ? (
              /* ── Confirmation card ─────────────────────────────── */
              <motion.div
                key="confirm"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 22, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: 10, scale: 0.97 }}
                transition={{ type: "spring", stiffness: 420, damping: 30 }}
                className="mt-5 overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--guest-gold)_32%,transparent)] bg-[var(--guest-bg-surface)] shadow-[0_8px_32px_-8px_rgba(0,0,0,0.18),inset_0_1px_0_rgba(255,255,255,0.06)]"
              >
                {/* Gold accent hairline */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--guest-gold)_60%,transparent)] to-transparent" />

                <div className="px-5 pt-5 pb-5">
                  {/* Label */}
                  <p className="text-[9px] font-bold uppercase tracking-[0.28em] text-[var(--guest-muted)]">
                    Confirmar envío
                  </p>

                  {/* Total — hero element */}
                  <motion.p
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08, type: "spring", stiffness: 380, damping: 28 }}
                    className="mt-1.5 font-mono text-[2.6rem] font-bold leading-none tabular-nums text-[var(--guest-text)]"
                  >
                    ${cartTotal.toLocaleString("es-MX")}
                  </motion.p>

                  {/* Summary line */}
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.14 }}
                    className="mt-2 flex items-center gap-2"
                  >
                    <span className="text-[11px] text-[var(--guest-muted)]">
                      {cartCount} platillo{cartCount !== 1 ? "s" : ""}
                    </span>
                    <span className="text-[var(--guest-divider)]" aria-hidden="true">·</span>
                    <span className="flex items-center gap-1 text-[11px] text-[var(--guest-muted)]">
                      {isShared
                        ? <Users className="size-3 shrink-0" strokeWidth={1.8} />
                        : <User className="size-3 shrink-0" strokeWidth={1.8} />}
                      {isShared ? "Para compartir" : "Solo para mí"}
                    </span>
                  </motion.div>

                  {/* Note */}
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4 text-[11px] leading-relaxed text-[var(--guest-muted)]"
                  >
                    Tu orden se enviará a cocina de inmediato y no podrá modificarse.
                  </motion.p>

                  {/* Primary CTA */}
                  <motion.button
                    type="button"
                    whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.24, type: "spring", stiffness: 380, damping: 28 }}
                    onClick={() => {
                      setShowConfirm(false);
                      onCheckout(isShared);
                    }}
                    disabled={isSubmitting}
                    className={cn(
                      "group/confirm relative mt-5 flex min-h-[50px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-xl",
                      "bg-[color-mix(in_srgb,var(--guest-gold)_90%,#1c1008)] text-[var(--guest-bg-page)]",
                      "text-[11px] font-bold uppercase tracking-[0.2em]",
                      "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_20px_-6px_color-mix(in_srgb,var(--guest-gold)_35%,transparent)]",
                      "disabled:cursor-not-allowed disabled:opacity-40"
                    )}
                  >
                    <Send className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                    {isSubmitting ? "Enviando…" : "Enviar a cocina"}
                    <span
                      className="pointer-events-none absolute inset-y-0 -left-12 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-0 transition-all duration-500 group-hover/confirm:left-[110%] group-hover/confirm:opacity-100"
                      aria-hidden="true"
                    />
                  </motion.button>

                  {/* Cancel — text link */}
                  <motion.button
                    type="button"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    onClick={() => setShowConfirm(false)}
                    className="mt-3 w-full py-1.5 text-center text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--guest-muted)] transition-colors hover:text-[var(--guest-text)]"
                  >
                    Cancelar
                  </motion.button>
                </div>
              </motion.div>
            ) : (
              /* ── Default actions ──────────────────────────────── */
              <motion.div
                key="actions"
                initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                transition={{ duration: 0.16 }}
              >
                <motion.button
                  type="button"
                  whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  onClick={() => setShowConfirm(true)}
                  disabled={isSubmitting}
                  className="mt-5 block min-h-12 w-full rounded-xl bg-[color-mix(in_srgb,var(--guest-gold)_88%,#333)] py-4 text-center text-sm font-semibold uppercase tracking-wider text-[var(--guest-bg-page)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)] disabled:opacity-50"
                >
                  Enviar orden
                </motion.button>
                <motion.button
                  type="button"
                  whileHover={reduceMotion ? undefined : { scale: 1.01 }}
                  whileTap={reduceMotion ? undefined : { scale: 0.99 }}
                  onClick={onClear}
                  className="mt-3 min-h-12 w-full rounded-xl border-2 border-[var(--guest-divider)] bg-transparent py-3 text-xs font-semibold uppercase tracking-widest text-[var(--guest-muted)] transition-colors hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] hover:text-[var(--guest-text)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]"
                >
                  Vaciar
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
