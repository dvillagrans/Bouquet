"use client";

import { memo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { QtyStepper } from "@/components/guest/ui/qty-stepper";
import { cn } from "@/lib/utils";

export type MenuRowItem = {
  id: string;
  name: string;
  description: string | null;
  note?: string;
  price: number;
  variants: { name: string; price: number }[];
  imageUrl?: string | null;
  isSoldOut?: boolean;
  isPopular?: boolean;
};

type MenuRowProps = {
  item: MenuRowItem;
  categoryInitial: string;
  selectedVariantName: string | null;
  onVariantChange: (variantName: string) => void;
  unitPrice: number;
  qty: number;
  qtyLabel: string;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  disabledQty?: boolean;
  onViewDetail?: () => void;
  layoutVariant?: "horizontal" | "vertical";
};

// Deterministic dark gradient per category letter — warm/earthy tones
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

export const MenuRow = memo(function MenuRow({
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
  disabledQty,
  onViewDetail,
  layoutVariant = "vertical",
}: MenuRowProps) {
  const hasVariants = item.variants && item.variants.length > 0;
  const reduceMotion = useReducedMotion();
  const [gradFrom, gradTo] = getFallbackGradient(categoryInitial);
  const [addPulseKey, setAddPulseKey] = useState(0);

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 280, damping: 30 }}
      whileHover={reduceMotion || item.isSoldOut ? undefined : { y: -2 }}
      className={cn(
        "group overflow-hidden rounded-3xl",
        "border border-[var(--guest-divider)] bg-[color-mix(in_srgb,var(--guest-bg-surface)_92%,transparent)]",
        "backdrop-blur-sm shadow-md",
        "transition-all duration-300",
        item.isSoldOut
          ? "opacity-55 grayscale-[0.4]"
          : "hover:border-[color-mix(in_srgb,var(--guest-gold)_30%,transparent)] hover:shadow-lg",
        layoutVariant === "horizontal" ? "relative min-h-[160px] flex items-center" : "flex h-full flex-col"
      )}
    >
      {layoutVariant === "horizontal" ? (
        <>
          {/* ── HORIZONTAL LAYOUT ── */}
          {/* Background Image Container */}
          <div className="absolute inset-0 right-0 left-1/3 z-0 overflow-hidden" aria-hidden>
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt=""
                className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
            ) : (
              <div
                className="h-full w-full opacity-40"
                style={{ background: `linear-gradient(145deg, ${gradFrom} 0%, ${gradTo} 100%)` }}
              />
            )}
            {/* Fade to transparent from left to right to blend with surface */}
            <div className="absolute inset-0 bg-gradient-to-r from-[var(--guest-bg-surface)] via-[var(--guest-bg-surface)]/80 to-transparent" />
          </div>
          
          {/* Content Overlaid */}
          <div className="relative z-10 flex w-[65%] flex-col p-4 sm:p-5">
            {/* Top-left badges */}
            <div className="mb-2 flex items-center gap-1.5">
              {item.isPopular && !item.isSoldOut && (
                <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--guest-gold)_30%,transparent)] bg-[var(--guest-bg-surface)]/88 px-2.5 py-[5px] text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--guest-gold)] backdrop-blur-md shadow-sm">
                  Top
                </span>
              )}
            </div>

            <div
              className={cn(onViewDetail && !item.isSoldOut && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--guest-gold)]/40 rounded-lg")}
              onClick={onViewDetail && !item.isSoldOut ? onViewDetail : undefined}
              role={onViewDetail && !item.isSoldOut ? "button" : undefined}
              tabIndex={onViewDetail && !item.isSoldOut ? 0 : undefined}
              aria-label={onViewDetail && !item.isSoldOut ? `Ver detalles de ${item.name}` : undefined}
              onKeyDown={(e) => {
                if (onViewDetail && !item.isSoldOut && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onViewDetail();
                }
              }}
            >
              <h3 className="line-clamp-2 text-lg sm:text-xl font-medium tracking-tight text-white mb-1.5">
                {item.name}
              </h3>
              {item.description && (
                <p className="line-clamp-2 text-xs sm:text-sm leading-relaxed text-[var(--guest-muted)] mb-3">
                  {item.description}
                </p>
              )}
            </div>

            {hasVariants && (
              <div className="mb-3 flex flex-wrap gap-1.5" role="group">
                {item.variants.map((v) => {
                  const active = selectedVariantName === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => onVariantChange(v.name)}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all active:scale-[0.96]",
                        active
                          ? "border border-[color-mix(in_srgb,var(--guest-gold)_42%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_10%,transparent)] text-[var(--guest-gold)]"
                          : "border border-[var(--guest-divider)] bg-transparent text-[var(--guest-muted)]"
                      )}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Bottom Row Actions */}
            <div className="mt-2 flex items-center gap-3">
              <div className="rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)]/60 px-3 py-1.5 font-mono text-[11px] font-bold text-[var(--guest-muted)] backdrop-blur-md">
                ${unitPrice.toLocaleString("es-MX")} <span className="text-[9px]">MXN</span>
              </div>
              
              {qty === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    onAdd();
                    if (!reduceMotion) setAddPulseKey((k) => k + 1);
                  }}
                  disabled={disabledQty || item.isSoldOut}
                  className="flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--guest-gold)_80%,#dd9d9d)] pl-4 pr-1.5 py-1.5 text-[11px] font-bold text-white transition-transform active:scale-[0.96] disabled:opacity-50"
                >
                  <span>Añadir</span>
                  <span className="flex size-6 items-center justify-center rounded-full bg-black/20 pb-px text-sm">+</span>
                </button>
              ) : (
                <div className="scale-90 origin-left">
                  <QtyStepper qty={qty} name={qtyLabel} onAdd={onAdd} onInc={onInc} onDec={onDec} disabled={disabledQty} />
                </div>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* ── VERTICAL LAYOUT ── */}
          {/* Image zone */}
          <div
            className={cn(
              "relative aspect-[4/3] w-full overflow-hidden",
              onViewDetail && !item.isSoldOut && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--guest-gold)]/40"
            )}
            onClick={onViewDetail && !item.isSoldOut ? onViewDetail : undefined}
            role={onViewDetail && !item.isSoldOut ? "button" : undefined}
            tabIndex={onViewDetail && !item.isSoldOut ? 0 : undefined}
            aria-label={onViewDetail && !item.isSoldOut ? `Ver detalles de ${item.name}` : undefined}
            onKeyDown={(e) => {
              if (onViewDetail && !item.isSoldOut && (e.key === "Enter" || e.key === " ")) {
                e.preventDefault();
                onViewDetail();
              }
            }}
          >
            {item.imageUrl ? (
              <img
                src={item.imageUrl}
                alt={item.name}
                loading="lazy"
                className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.05]"
              />
            ) : (
              <div
                className="relative flex h-full w-full items-end justify-end overflow-hidden"
                style={{ background: `linear-gradient(145deg, ${gradFrom} 0%, ${gradTo} 100%)` }}
              >
                <span
                  className="relative z-[1] select-none font-serif font-semibold leading-none"
                  style={{
                    fontSize: "clamp(4.5rem, 14vw, 6.5rem)",
                    color: "color-mix(in srgb, var(--guest-gold) 18%, transparent)",
                    marginBottom: "-0.1em",
                    marginRight: "-0.05em",
                  }}
                  aria-hidden
                >
                  {categoryInitial.slice(0, 1).toUpperCase()}
                </span>
              </div>
            )}

            {/* Top-left badges */}
            <div className="pointer-events-none absolute left-3 top-3 flex flex-col gap-1.5 z-10">
              {item.isPopular && !item.isSoldOut && (
                <span className="inline-flex items-center rounded-full border border-white/20 bg-black/40 px-2.5 py-[5px] text-[9px] font-bold uppercase tracking-[0.22em] text-white backdrop-blur-md shadow-sm">
                  Top
                </span>
              )}
              {item.isSoldOut && (
                <span className="inline-flex items-center rounded-full border border-[var(--guest-divider)] bg-black/60 px-2.5 py-[5px] text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--guest-muted)] backdrop-blur-md shadow-sm">
                  Agotado
                </span>
              )}
            </div>
            
            {/* Gradient bottom for text readability */}
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-[var(--guest-bg-surface)] to-transparent" />
          </div>

          {/* Content */}
          <div className="flex flex-1 flex-col px-3 pb-3 pt-1 relative z-10 -mt-2">
            <div
              className={cn(onViewDetail && !item.isSoldOut && "cursor-pointer focus:outline-none focus:ring-2 focus:ring-[var(--guest-gold)]/40 rounded-lg")}
              onClick={onViewDetail && !item.isSoldOut ? onViewDetail : undefined}
              role={onViewDetail && !item.isSoldOut ? "button" : undefined}
              tabIndex={onViewDetail && !item.isSoldOut ? 0 : undefined}
              aria-label={onViewDetail && !item.isSoldOut ? `Ver detalles de ${item.name}` : undefined}
              onKeyDown={(e) => {
                if (onViewDetail && !item.isSoldOut && (e.key === "Enter" || e.key === " ")) {
                  e.preventDefault();
                  onViewDetail();
                }
              }}
            >
              <h3 className="line-clamp-2 text-sm font-semibold tracking-tight text-white">
                {item.name}
              </h3>
              {item.description && (
                <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-[var(--guest-muted)]">
                  {item.description}
                </p>
              )}
            </div>

            {hasVariants && (
              <div className="mt-2 flex flex-wrap gap-1.5" role="group">
                {item.variants.map((v) => {
                  const active = selectedVariantName === v.name;
                  return (
                    <button
                      key={v.name}
                      type="button"
                      onClick={() => onVariantChange(v.name)}
                      className={cn(
                        "rounded-lg px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wide transition-all active:scale-[0.96]",
                        active
                          ? "border border-[color-mix(in_srgb,var(--guest-gold)_42%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_10%,transparent)] text-[var(--guest-gold)]"
                          : "border border-[var(--guest-divider)] bg-transparent text-[var(--guest-muted)]"
                      )}
                    >
                      {v.name}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Action */}
            <div className="mt-auto pt-4 flex items-center justify-between">
              <div className="rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)]/60 px-3 py-1.5 font-mono text-[11px] font-bold text-[var(--guest-muted)] backdrop-blur-md">
                ${unitPrice.toLocaleString("es-MX")} <span className="text-[9px]">MXN</span>
              </div>
              
              {qty === 0 ? (
                <button
                  type="button"
                  onClick={() => {
                    onAdd();
                    if (!reduceMotion) setAddPulseKey((k) => k + 1);
                  }}
                  disabled={disabledQty || item.isSoldOut}
                  className="flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--guest-gold)_80%,#dd9d9d)] pl-3 pr-1.5 py-1.5 text-[10px] font-bold text-white transition-transform active:scale-[0.96] disabled:opacity-50"
                >
                  <span>Añadir</span>
                  <span className="flex size-[22px] items-center justify-center rounded-full bg-black/20 pb-px text-xs">+</span>
                </button>
              ) : (
                <div className="scale-[0.85] origin-right">
                  <QtyStepper qty={qty} name={qtyLabel} onAdd={onAdd} onInc={onInc} onDec={onDec} disabled={disabledQty} />
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </motion.article>
  );
});
