"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronRight } from "lucide-react";

type CartSummaryBarProps = {
  cartCount: number;
  cartTotal: number;
  onOpen: () => void;
};

export function CartSummaryBar({ cartCount, cartTotal, onOpen }: CartSummaryBarProps) {
  const [tapPulseKey, setTapPulseKey] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="border-t border-[var(--guest-divider)] bg-[color-mix(in_srgb,var(--guest-bg-surface)_94%,transparent)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <motion.button
          type="button"
          onClick={() => {
            if (!reduceMotion) setTapPulseKey((k) => k + 1);
            onOpen();
          }}
          whileTap={reduceMotion ? undefined : { scale: 0.985 }}
          className="relative flex min-h-[52px] w-full items-center justify-between overflow-hidden rounded-[18px] border border-[color-mix(in_srgb,var(--guest-gold)_42%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_82%,#2a2318)] px-5 py-3.5 text-[var(--guest-bg-page)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)]"
          aria-haspopup="dialog"
          aria-label={`Ver orden: ${cartCount} platillos, total ${cartTotal.toLocaleString("es-MX")} pesos`}
        >
          <AnimatePresence>
            {tapPulseKey > 0 && !reduceMotion ? (
              <motion.span
                key={`cart-pulse-${tapPulseKey}`}
                initial={{ opacity: 0.3, scale: 0.35 }}
                animate={{ opacity: 0, scale: 1.6 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.35, ease: "easeOut" }}
                className="pointer-events-none absolute inset-0 m-auto h-24 w-24 rounded-full bg-white/30"
                aria-hidden
              />
            ) : null}
          </AnimatePresence>

          <span className="text-left font-mono text-sm font-semibold tabular-nums">
            {cartCount} platillo{cartCount !== 1 ? "s" : ""} · ${cartTotal.toLocaleString("es-MX")}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em]">
            Ver orden
            <motion.span
              animate={reduceMotion ? undefined : { x: [0, 2, 0] }}
              transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.8, ease: "easeInOut" }}
            >
              <ChevronRight className="h-4 w-4" aria-hidden />
            </motion.span>
          </span>
        </motion.button>
      </div>
    </div>
  );
}
