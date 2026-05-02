"use client";

import { memo } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const spring = { type: "spring" as const, stiffness: 320, damping: 28 };

/**
 * Estado en vivo / sincronización / mensaje temporal (banner) controlado por el padre.
 */
function DynamicIslandInner({
  loading,
  banner,
}: {
  loading: boolean;
  banner: string | null;
}) {
  const reduceMotion = useReducedMotion();

  const label =
    loading ? "Sincronizando" : banner && banner.length > 0 ? banner : "En vivo";

  const dotClass =
    loading ? "bg-text-muted animate-pulse" : banner ? "bg-pink-glow animate-pulse" : "bg-dash-green";

  if (reduceMotion) {
    return (
      <div
        className="inline-flex max-w-full items-center gap-2 rounded-full border border-border-main/60 bg-bg-card/90 px-3 py-1.5 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted shadow-[0_8px_24px_rgba(9,9,7,0.35)]"
        role="status"
        aria-live="polite"
      >
        <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} aria-hidden />
        <span className="min-w-0 truncate text-light">{label}</span>
      </div>
    );
  }

  return (
    <motion.div
      layout
      className="inline-flex max-w-full items-center overflow-hidden rounded-full border border-border-main/60 bg-bg-card/90 font-mono text-[10px] font-bold uppercase tracking-[0.16em] text-text-muted shadow-[0_8px_24px_rgba(9,9,7,0.35)]"
      style={{ willChange: "transform" }}
      role="status"
      aria-live="polite"
      transition={spring}
    >
      <motion.div
        layout
        className="flex min-h-9 max-w-[min(100vw-2rem,22rem)] items-center gap-2 px-3 py-1.5"
        transition={spring}
      >
        <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${dotClass}`} aria-hidden />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={label}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="min-w-0 truncate text-light"
          >
            {label}
          </motion.span>
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}

export const DynamicIsland = memo(DynamicIslandInner);
