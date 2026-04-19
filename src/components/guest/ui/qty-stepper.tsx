"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type QtyStepperProps = {
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  name: string;
  disabled?: boolean;
};

export function QtyStepper({ qty, onAdd, onInc, onDec, name, disabled }: QtyStepperProps) {
  const reduceMotion = useReducedMotion();
  const [rippleTick, setRippleTick] = useState(0);

  const ring =
    "rounded-xl border-2 border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_12%,transparent)] text-[var(--guest-gold)] transition-colors hover:border-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]";

  if (qty === 0) {
    return (
      <motion.button
        type="button"
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setRippleTick((t) => t + 1);
          onAdd();
        }}
        aria-label={`Agregar ${name}`}
        aria-disabled={disabled}
        className={cn(
          "relative flex h-11 w-11 items-center justify-center overflow-hidden disabled:cursor-not-allowed disabled:opacity-45",
          ring,
        )}
      >
        {!reduceMotion && rippleTick > 0 && (
          <motion.span
            key={rippleTick}
            className="pointer-events-none absolute inset-0 rounded-xl bg-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)]"
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        <svg viewBox="0 0 16 16" fill="none" className="relative z-[1] h-4 w-4" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </motion.button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <motion.button
        type="button"
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
        whileTap={reduceMotion ? undefined : { scale: 0.96 }}
        disabled={disabled}
        onClick={() => !disabled && onDec()}
        aria-label={`Quitar uno de ${name}`}
        className={cn(
          "flex h-11 w-11 items-center justify-center rounded-xl border-2 border-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_18%,transparent)] text-[var(--guest-gold)] hover:border-[color-mix(in_srgb,var(--guest-gold)_60%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)] disabled:cursor-not-allowed disabled:opacity-45",
        )}
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </motion.button>
      <span className="w-8 text-center text-sm font-mono font-bold tabular-nums text-[var(--guest-gold)]">
        {qty}
      </span>
      <motion.button
        type="button"
        whileHover={reduceMotion ? undefined : { scale: 1.03 }}
        whileTap={reduceMotion ? undefined : { scale: 0.98 }}
        disabled={disabled}
        onClick={() => {
          if (disabled) return;
          setRippleTick((t) => t + 1);
          onInc();
        }}
        aria-label={`Agregar otro de ${name}`}
        className={cn(
          "relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border-2 border-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_18%,transparent)] text-[var(--guest-gold)] hover:border-[color-mix(in_srgb,var(--guest-gold)_60%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)] disabled:cursor-not-allowed disabled:opacity-45",
        )}
      >
        {!reduceMotion && rippleTick > 0 && (
          <motion.span
            key={`p-${rippleTick}`}
            className="pointer-events-none absolute inset-0 rounded-xl bg-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)]"
            initial={{ scale: 0, opacity: 0.5 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        <svg viewBox="0 0 16 16" fill="none" className="relative z-[1] h-4 w-4" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </motion.button>
    </div>
  );
}
