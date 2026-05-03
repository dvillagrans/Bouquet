"use client";

import { LayoutGroup, motion } from "framer-motion";
import { cn } from "@/lib/utils";

export type CategoryTabItem = { id: string; label: string; count?: number };

type CategoryTabsProps = {
  tabs: CategoryTabItem[];
  activeId: string;
  onChange: (id: string) => void;
  layoutId: string;
};

export function CategoryTabs({ tabs, activeId, onChange, layoutId }: CategoryTabsProps) {
  return (
    <div className="relative">
      <div
        className="pointer-events-none absolute inset-y-0 left-0 z-[1] w-1 bg-gradient-to-r from-[var(--guest-bg-page)] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-y-0 right-0 z-[1] w-3 bg-gradient-to-l from-[var(--guest-bg-page)] to-transparent"
        aria-hidden
      />

      <LayoutGroup id={layoutId}>
        <div
          className="scrollbar-hide flex gap-2 overflow-x-auto py-1.5 px-0"
          role="tablist"
          aria-label="Categorías del menú"
        >
          {tabs.map(({ id, label, count }) => {
            const active = activeId === id;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onChange(id)}
                className={cn(
                  "relative shrink-0 rounded-full px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.14em] transition-colors",
                  active ? "text-white" : "text-[var(--guest-muted)] hover:text-[var(--guest-text)] hover:bg-[var(--guest-bg-surface)]",
                )}
              >
                {active && (
                  <motion.span
                    layoutId={`${layoutId}-pill`}
                    className="absolute inset-0 z-0 rounded-full bg-[color-mix(in_srgb,var(--guest-gold)_80%,#dd9d9d)] shadow-sm"
                    transition={{ type: "spring", stiffness: 420, damping: 34 }}
                  />
                )}
                <span className="relative z-[1] inline-flex items-center gap-1.5">
                  {label}
                  {count != null && count > 0 && (
                    <span className="font-mono text-[10px] tabular-nums opacity-70">({count})</span>
                  )}
                </span>
              </button>
            );
          })}
        </div>
      </LayoutGroup>
    </div>
  );
}
