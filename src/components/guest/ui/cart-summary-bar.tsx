"use client";

import { ChevronRight } from "lucide-react";

type CartSummaryBarProps = {
  cartCount: number;
  cartTotal: number;
  onOpen: () => void;
};

export function CartSummaryBar({ cartCount, cartTotal, onOpen }: CartSummaryBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 lg:hidden">
      <div className="border-t border-[var(--guest-divider)] bg-[color-mix(in_srgb,var(--guest-bg-surface)_94%,transparent)] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-xl">
        <button
          type="button"
          onClick={onOpen}
          className="flex min-h-[52px] w-full items-center justify-between rounded-[18px] border border-[color-mix(in_srgb,var(--guest-gold)_42%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_82%,#2a2318)] px-5 py-3.5 text-[var(--guest-bg-page)] shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-transform active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)]"
          aria-haspopup="dialog"
          aria-label={`Ver orden: ${cartCount} platillos, total ${cartTotal.toLocaleString("es-MX")} pesos`}
        >
          <span className="text-left font-mono text-sm font-semibold tabular-nums">
            {cartCount} platillo{cartCount !== 1 ? "s" : ""} · ${cartTotal.toLocaleString("es-MX")}
          </span>
          <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-[0.18em]">
            Ver orden
            <ChevronRight className="h-4 w-4" aria-hidden />
          </span>
        </button>
      </div>
    </div>
  );
}
