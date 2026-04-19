"use client";

import { useId } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

export type SegmentedItem<T extends string> = {
  id: T;
  label: string;
  count?: number;
  dotClass?: string;
};

export function SegmentedControl<T extends string>({
  items,
  value,
  onChange,
  pillLayoutId,
  className,
  scrollClassName,
}: {
  items: SegmentedItem<T>[];
  value: T;
  onChange: (id: T) => void;
  /** Unique per control instance on page (e.g. waiter-view vs waiter-filter) */
  pillLayoutId: string;
  className?: string;
  /** e.g. snap-x overflow-x-auto for narrow viewports */
  scrollClassName?: string;
}) {
  const reduceMotion = useReducedMotion();
  const groupId = useId();

  return (
    <div
      className={cn(
        "rounded-full border border-border-main/70 bg-bg-card p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]",
        className,
      )}
    >
      <div
        role="tablist"
        aria-label="Segmented control"
        className={cn("flex min-h-11 items-center gap-0.5", scrollClassName)}
      >
        {items.map((item) => {
          const active = value === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              id={`${groupId}-${item.id}`}
              aria-selected={active}
              tabIndex={active ? 0 : -1}
              onClick={() => onChange(item.id)}
              className={cn(
                "relative inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-xs font-medium transition-colors",
                active ? "text-light" : "text-text-muted hover:text-light",
                "motion-reduce:transition-none",
              )}
            >
              {active && !reduceMotion && (
                <motion.span
                  layoutId={pillLayoutId}
                  className="absolute inset-0 rounded-full border border-border-bright bg-bg-solid"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                  aria-hidden
                />
              )}
              {active && reduceMotion && (
                <span
                  className="absolute inset-0 rounded-full border border-border-bright bg-bg-solid"
                  aria-hidden
                />
              )}
              {item.dotClass ? (
                <span
                  className={cn("relative z-10 h-1.5 w-1.5 rounded-full", item.dotClass)}
                  aria-hidden
                />
              ) : null}
              <span className="relative z-10">{item.label}</span>
              {item.count !== undefined ? (
                <span className="relative z-10 tabular-nums opacity-80">{item.count}</span>
              ) : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
