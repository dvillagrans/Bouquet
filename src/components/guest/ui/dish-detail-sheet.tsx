"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { X, ShoppingBag } from "lucide-react";
import { QtyStepper } from "@/components/guest/ui/qty-stepper";
import { cn } from "@/lib/utils";
import type { MenuRowItem } from "./menu-row";

const FALLBACK_GRADIENTS = [
  ["#1c1007", "#0d0804"],
  ["#0c1a0e", "#060d07"],
  ["#1a0c0c", "#0d0606"],
  ["#0c1018", "#060810"],
  ["#181409", "#0d0b05"],
] as const;

function getFallbackGradient(initial: string) {
  const firstChar = initial.trim().charAt(0);
  const code = firstChar ? firstChar.charCodeAt(0) : 0;
  const idx = Number.isFinite(code) ? code % FALLBACK_GRADIENTS.length : 0;
  return FALLBACK_GRADIENTS[idx] ?? FALLBACK_GRADIENTS[0];
}

export interface DishDetailSheetProps {
  open: boolean;
  item: MenuRowItem | null;
  categoryInitial: string;
  selectedVariantName: string | null;
  onVariantChange: (variantName: string) => void;
  unitPrice: number;
  qty: number;
  qtyLabel: string;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  onClose: () => void;
  disabledQty?: boolean;
}

// ── Animation variants ──────────────────────────────────────────────────────

const sheetVariants = {
  hidden: { y: "100%" },
  visible: { y: 0 },
  exit: { y: "105%" },
};

const reducedSheetVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const contentParentVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.065, delayChildren: 0.15 } },
};

const contentChildVariants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 360, damping: 30 },
  },
};

// ── Sheet ───────────────────────────────────────────────────────────────────

export function DishDetailSheet({
  open,
  item,
  categoryInitial,
  selectedVariantName,
  onVariantChange,
  unitPrice,
  qty,
  qtyLabel,
  onAdd,
  onInc,
  onDec,
  onClose,
  disabledQty,
}: DishDetailSheetProps) {
  const [mounted, setMounted] = useState(false);
  const reduceMotion = useReducedMotion();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setMounted(true); }, []);

  // Scroll reset when a new item opens
  useEffect(() => {
    if (open && scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [open, item?.id]);

  // Scroll lock — use documentElement to avoid layout shift on mobile
  useEffect(() => {
    if (!open) return;
    const el = document.documentElement;
    const prev = el.style.overflow;
    el.style.overflow = "hidden";
    return () => { el.style.overflow = prev; };
  }, [open]);

  // Escape to close
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  const [gradFrom, gradTo] = getFallbackGradient(categoryInitial);
  const hasVariants = item?.variants && item.variants.length > 0;
  const totalInCart = unitPrice * qty;

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && item && (
        <>
          {/* ── Scrim ─────────────────────────────────────────────── */}
          <motion.div
            key="dish-scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            className="fixed inset-0 z-[200] bg-black/62 backdrop-blur-[3px]"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* ── Sheet ─────────────────────────────────────────────── */}
          <motion.div
            key="dish-sheet"
            role="dialog"
            aria-modal="true"
            aria-label={item.name}
            variants={reduceMotion ? reducedSheetVariants : sheetVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ type: "spring", stiffness: 340, damping: 34, mass: 0.9 }}
            className="fixed inset-x-0 bottom-0 z-[201] flex max-h-[93dvh] flex-col overflow-hidden rounded-t-[28px] bg-[var(--guest-bg-surface)] shadow-[0_-40px_100px_-20px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.05)]"
          >
            {/* Drag pill */}
            <div className="pointer-events-none flex justify-center pt-3 pb-1 shrink-0" aria-hidden="true">
              <div className="h-[3px] w-12 rounded-full bg-[var(--guest-divider)]" />
            </div>

            {/* Close */}
            <button
              type="button"
              onClick={onClose}
              aria-label="Cerrar"
              className="absolute right-4 top-4 z-10 flex size-9 items-center justify-center rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)]/85 text-[var(--guest-muted)] backdrop-blur-md transition hover:text-[var(--guest-text)] active:scale-95"
            >
              <X className="size-4" strokeWidth={2} />
            </button>

            {/* ── Hero ────────────────────────────────────────────── */}
            <div
              className="relative w-full shrink-0 overflow-hidden"
              style={{ height: "clamp(210px, 52vw, 300px)" }}
            >
              {item.imageUrl ? (
                <>
                  <motion.img
                    src={item.imageUrl}
                    alt={item.name}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
                    className="h-full w-full object-cover"
                  />
                  {/* Cinematic bottom fade */}
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                  {/* Side vignette */}
                  <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_160%_110%_at_50%_100%,transparent_55%,rgba(0,0,0,0.28)_100%)]" />
                </>
              ) : (
                <div
                  className="relative flex h-full w-full items-end justify-end overflow-hidden"
                  style={{ background: `linear-gradient(145deg, ${gradFrom} 0%, ${gradTo} 100%)` }}
                >
                  <div
                    className="pointer-events-none absolute inset-0 opacity-[0.045] mix-blend-overlay"
                    style={{
                      backgroundImage:
                        "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                      backgroundRepeat: "repeat",
                    }}
                    aria-hidden="true"
                  />
                  <div
                    className="pointer-events-none absolute -bottom-8 -right-8 h-56 w-56 rounded-full opacity-[0.18]"
                    style={{ background: "radial-gradient(ellipse at center, var(--guest-gold), transparent 65%)" }}
                    aria-hidden="true"
                  />
                  <span
                    className="relative z-[1] select-none font-serif font-semibold leading-none"
                    style={{
                      fontSize: "clamp(8rem, 28vw, 13rem)",
                      color: "color-mix(in srgb, var(--guest-gold) 12%, transparent)",
                      marginBottom: "-0.07em",
                      marginRight: "-0.04em",
                    }}
                    aria-hidden="true"
                  >
                    {categoryInitial.slice(0, 1).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Status chips — top-left */}
              <div className="absolute left-4 top-4 flex flex-col gap-1.5">
                {item.isPopular && !item.isSoldOut && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.18, type: "spring", stiffness: 320, damping: 28 }}
                    className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--guest-gold)_32%,transparent)] bg-[var(--guest-bg-surface)]/90 px-2.5 py-[5px] text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--guest-gold)] backdrop-blur-md shadow-sm"
                  >
                    Popular
                  </motion.span>
                )}
                {item.isSoldOut && (
                  <span className="inline-flex items-center rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)]/90 px-2.5 py-[5px] text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--guest-muted)] backdrop-blur-md shadow-sm">
                    Agotado
                  </span>
                )}
              </div>

              {/* Price badge — glass chip overlaid on image */}
              {!item.isSoldOut && (
                <motion.div
                  className="absolute bottom-4 right-4"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1, type: "spring", stiffness: 420, damping: 28 }}
                >
                  <span className="rounded-full border border-[color-mix(in_srgb,var(--guest-gold)_28%,transparent)] bg-black/55 px-3.5 py-1.5 font-mono text-[0.9rem] font-bold tabular-nums text-[var(--guest-gold)] backdrop-blur-md shadow-sm">
                    ${unitPrice.toLocaleString("es-MX")}
                  </span>
                </motion.div>
              )}
            </div>

            {/* ── Scrollable body ──────────────────────────────────── */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain">
              <motion.div
                className="px-5 pt-5 pb-2"
                variants={contentParentVariants}
                initial="hidden"
                animate="visible"
              >
                {/* Name */}
                <motion.h2
                  variants={contentChildVariants}
                  className="text-[1.45rem] font-bold leading-tight tracking-tight text-[var(--guest-text)]"
                >
                  {item.name}
                </motion.h2>

                {/* Description — full, never truncated */}
                {item.description && (
                  <motion.p
                    variants={contentChildVariants}
                    className="mt-3 text-[13px] leading-relaxed text-[var(--guest-muted)]"
                  >
                    {item.description}
                  </motion.p>
                )}

                {/* Note */}
                {item.note && (
                  <motion.p
                    variants={contentChildVariants}
                    className="mt-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color-mix(in_srgb,var(--guest-gold)_85%,var(--guest-text))]"
                  >
                    {item.note}
                  </motion.p>
                )}

                {/* Variant selector */}
                {hasVariants && item.variants.length > 0 && (
                  <motion.div variants={contentChildVariants} className="mt-5">
                    <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.22em] text-[var(--guest-muted)]">
                      Presentación
                    </p>
                    <div className="flex flex-wrap gap-2" role="group" aria-label="Tamaño o presentación">
                      {item.variants.map((v, idx) => {
                        const active = selectedVariantName === v.name;
                        const diff = v.price - item.price;
                        return (
                          <motion.button
                            key={v.name}
                            type="button"
                            onClick={() => onVariantChange(v.name)}
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.24 + idx * 0.06, type: "spring", stiffness: 340, damping: 28 }}
                            whileTap={{ scale: 0.95 }}
                            className={cn(
                              "flex flex-col items-start rounded-xl border px-4 py-2.5 text-left transition-colors",
                              active
                                ? "border-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_10%,transparent)] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]"
                                : "border-[var(--guest-divider)] hover:border-[color-mix(in_srgb,var(--guest-gold)_28%,transparent)]"
                            )}
                          >
                            <span
                              className={cn(
                                "text-[11px] font-bold uppercase tracking-wide",
                                active ? "text-[var(--guest-gold)]" : "text-[var(--guest-muted)]"
                              )}
                            >
                              {v.name}
                            </span>
                            <span
                              className={cn(
                                "mt-0.5 font-mono text-[10px] tabular-nums",
                                active
                                  ? "text-[color-mix(in_srgb,var(--guest-gold)_70%,var(--guest-text))]"
                                  : "text-[var(--guest-muted)] opacity-60"
                              )}
                            >
                              ${v.price.toLocaleString("es-MX")}
                              {diff !== 0 && (
                                <span className="ml-1 opacity-70">
                                  ({diff > 0 ? "+" : ""}{diff.toLocaleString("es-MX")})
                                </span>
                              )}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </motion.div>

              {/* Footer spacer so content isn't hidden behind sticky CTA */}
              <div className="h-28" aria-hidden="true" />
            </div>

            {/* ── Sticky CTA ───────────────────────────────────────── */}
            <div
              className="absolute inset-x-0 bottom-0 border-t border-[var(--guest-divider)] bg-[var(--guest-bg-surface)]/96 px-5 py-4 backdrop-blur-md"
              style={{ paddingBottom: "max(env(safe-area-inset-bottom), 1rem)" }}
            >
              {item.isSoldOut ? (
                <div className="flex min-h-[50px] items-center justify-center rounded-2xl border border-[var(--guest-divider)] text-[11px] font-semibold uppercase tracking-[0.2em] text-[var(--guest-muted)]">
                  No disponible
                </div>
              ) : qty === 0 ? (
                <motion.button
                  type="button"
                  onClick={onAdd}
                  whileTap={reduceMotion ? undefined : { scale: 0.97 }}
                  disabled={disabledQty}
                  className={cn(
                    "group/cta relative flex min-h-[50px] w-full items-center justify-center gap-2.5 overflow-hidden rounded-2xl",
                    "bg-[color-mix(in_srgb,var(--guest-gold)_90%,#1c1008)] text-[var(--guest-bg-page)]",
                    "text-[11px] font-bold uppercase tracking-[0.2em]",
                    "shadow-[inset_0_1px_0_rgba(255,255,255,0.14),0_4px_20px_-6px_color-mix(in_srgb,var(--guest-gold)_30%,transparent)]",
                    "disabled:cursor-not-allowed disabled:opacity-40"
                  )}
                >
                  <ShoppingBag className="size-4 shrink-0" strokeWidth={2} aria-hidden="true" />
                  Añadir al carrito
                  {/* Shimmer sweep */}
                  <span
                    className="pointer-events-none absolute inset-y-0 -left-16 w-14 -skew-x-12 bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 transition-all duration-500 group-hover/cta:left-[110%] group-hover/cta:opacity-100"
                    aria-hidden="true"
                  />
                </motion.button>
              ) : (
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--guest-muted)]">
                      En carrito
                    </p>
                    <p className="mt-0.5 font-mono text-[13px] font-bold tabular-nums text-[var(--guest-gold)]">
                      ${totalInCart.toLocaleString("es-MX")}
                    </p>
                  </div>
                  <QtyStepper
                    qty={qty}
                    name={qtyLabel}
                    onAdd={onAdd}
                    onInc={onInc}
                    onDec={onDec}
                    disabled={disabledQty}
                  />
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>,
    document.body,
  );
}
