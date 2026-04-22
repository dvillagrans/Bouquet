"use client";

import { useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { User, Users } from "lucide-react";
import { cn } from "@/lib/utils";

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
        <p className="mt-8 text-sm italic text-[var(--guest-muted)]">Selecciona platillos del menú para agregarlos a tu orden.</p>
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
                  className="mt-0.5 shrink-0 text-xs text-[var(--guest-subtle)] transition-colors hover:text-[var(--guest-urgent)]"
                >
                  ✕
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

          <motion.button
            type="button"
            whileHover={reduceMotion ? undefined : { scale: 1.01 }}
            whileTap={reduceMotion ? undefined : { scale: 0.99 }}
            onClick={() => onCheckout(isShared)}
            disabled={isSubmitting}
            className="mt-5 block min-h-12 w-full rounded-xl bg-[color-mix(in_srgb,var(--guest-gold)_88%,#333)] py-4 text-center text-sm font-semibold uppercase tracking-wider text-[var(--guest-bg-page)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-opacity focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)] disabled:opacity-50"
          >
            {isSubmitting ? "Enviando…" : "Enviar orden"}
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

        </>
      )}
    </div>
  );
}
