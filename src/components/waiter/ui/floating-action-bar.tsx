"use client";

import { motion, useReducedMotion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const spring = { type: "spring" as const, stiffness: 420, damping: 30 };

export function FloatingActionBar({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { y: 24, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      exit={reduceMotion ? undefined : { y: 24, opacity: 0 }}
      transition={spring}
      className={`fixed bottom-4 left-4 right-4 z-[70] md:left-1/2 md:right-auto md:w-full md:max-w-xl md:-translate-x-1/2 ${className}`}
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0)" }}
    >
      <div className="rounded-[1.75rem] border border-border-main/70 bg-bg-solid/75 p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-md">
        <div className="rounded-[calc(1.75rem-0.375rem)] border border-border-main/40 bg-bg-card/95 shadow-[inset_0_1px_1px_rgba(255,255,255,0.08)]">
          {children}
        </div>
      </div>
    </motion.div>
  );
}

export function FloatingActionPrimary({
  label,
  onClick,
  disabled,
  busy,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  busy?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled === true || busy === true}
      className="group inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-1 rounded-full border border-gold bg-gold px-4 py-2.5 text-xs font-semibold text-bg-solid transition hover:bg-gold-light disabled:opacity-50 active:scale-[0.98] sm:w-auto sm:justify-between"
    >
      <span>{busy ? "Uniendo…" : label}</span>
      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-bg-solid/15 transition group-hover:translate-x-0.5 group-hover:-translate-y-px">
        <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
      </span>
    </button>
  );
}
