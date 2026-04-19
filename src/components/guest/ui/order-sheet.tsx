"use client";

import { useEffect, type ReactNode } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

type OrderSheetProps = {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  titleId?: string;
};

export function OrderSheet({ open, onClose, children, titleId }: OrderSheetProps) {
  const reduceMotion = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 lg:hidden" role="dialog" aria-modal="true" aria-labelledby={titleId}>
          <motion.button
            type="button"
            aria-label="Cerrar"
            className="absolute inset-0 bg-[color-mix(in_srgb,var(--guest-text)_45%,transparent)] backdrop-blur-sm"
            initial={{ opacity: reduceMotion ? 1 : 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: reduceMotion ? 1 : 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.2 }}
            onClick={onClose}
          />
          <motion.div
            drag="y"
            dragConstraints={{ top: 0, bottom: 320 }}
            dragElastic={0.08}
            onDragEnd={(_, info) => {
              if (info.offset.y > 96 || info.velocity.y > 420) onClose();
            }}
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 380, damping: 38 }}
            className={cn(
              "absolute inset-x-0 bottom-0 max-h-[min(92dvh,760px)] overflow-hidden rounded-t-[26px]",
              "border border-b-0 border-[var(--guest-divider)] bg-[var(--guest-bg-page)] shadow-[0_-24px_60px_rgba(0,0,0,0.18)]",
            )}
          >
            <div className="flex justify-center pb-2 pt-3">
              <span className="guest-sheet-handle h-1.5 w-14 shrink-0 rounded-full bg-[var(--guest-muted)] opacity-70" aria-hidden />
            </div>
            <div className="max-h-[calc(min(92dvh,760px)-2.5rem)] overflow-y-auto px-5 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
