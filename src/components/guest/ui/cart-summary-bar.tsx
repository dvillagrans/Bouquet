"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ShoppingBag, ArrowRight } from "lucide-react";

type CartSummaryBarProps = {
  cartCount: number;
  cartTotal: number;
  onOpen: () => void;
};

export function CartSummaryBar({ cartCount, cartTotal, onOpen }: CartSummaryBarProps) {
  const [tapPulseKey, setTapPulseKey] = useState(0);
  const reduceMotion = useReducedMotion();

  return (
    <div className="fixed inset-x-0 bottom-6 z-40 flex justify-center px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-sm rounded-[28px] border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] p-2 shadow-2xl backdrop-blur-xl flex items-center justify-between">
        
        <div className="flex items-center gap-3 pl-2">
          {/* Bag Icon with Badge */}
          <div className="relative flex size-12 shrink-0 items-center justify-center rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)]">
            <ShoppingBag className="size-5 text-[var(--guest-muted)]" strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 flex size-5 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--guest-gold)_80%,#dd9d9d)] text-[10px] font-bold text-white shadow-sm ring-2 ring-[var(--guest-bg-surface-2)]">
              {cartCount}
            </span>
          </div>
          
          {/* Text Stack */}
          <div className="flex flex-col">
            <span className="text-[11px] text-[var(--guest-muted)] leading-tight">{cartCount} productos</span>
            <span className="font-mono text-[15px] font-bold tabular-nums text-[var(--guest-text)]">
              ${cartTotal.toLocaleString("es-MX")} <span className="text-[10px] text-[var(--guest-muted)]">MXN</span>
            </span>
          </div>
        </div>

        {/* Action Button */}
        <motion.button
          type="button"
          onClick={() => {
            if (!reduceMotion) setTapPulseKey((k) => k + 1);
            onOpen();
          }}
          whileTap={reduceMotion ? undefined : { scale: 0.96 }}
          className="group relative flex h-12 items-center gap-2 overflow-hidden rounded-[20px] bg-[color-mix(in_srgb,var(--guest-gold)_80%,#dd9d9d)] px-5 text-white shadow-sm transition-transform"
          aria-haspopup="dialog"
          aria-label={`Ver orden: ${cartCount} platillos, total ${cartTotal.toLocaleString("es-MX")} pesos`}
        >
          {/* Sheen */}
          <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
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

          <span className="text-[13px] font-semibold">Ver pedido</span>
          <ArrowRight className="size-4" strokeWidth={2} />
        </motion.button>
      </div>
    </div>
  );
}
