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
      whileHover={reduceMotion || item.isSoldOut ? undefined : { y: -4 }}
      className={cn(
        "group flex flex-col h-full overflow-hidden rounded-2xl",
        "border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)]",
        "shadow-[0_2px_10px_-4px_rgba(0,0,0,0.07)]",
        "transition-[border-color,box-shadow] duration-300",
        item.isSoldOut
          ? "opacity-55 grayscale-[0.4]"
          : "hover:border-[color-mix(in_srgb,var(--guest-gold)_38%,transparent)] hover:shadow-[0_8px_28px_-8px_rgba(0,0,0,0.13)]"
      )}
    >
      {/* ── Image zone ─────────────────────────────────────────── */}
      <div
        className={cn(
          "relative aspect-[4/3] w-full overflow-hidden",
          onViewDetail && !item.isSoldOut && "cursor-pointer"
        )}
        onClick={onViewDetail && !item.isSoldOut ? onViewDetail : undefined}
        role={onViewDetail && !item.isSoldOut ? "button" : undefined}
        tabIndex={onViewDetail && !item.isSoldOut ? 0 : undefined}
        aria-label={onViewDetail && !item.isSoldOut ? `Ver detalles de ${item.name}` : undefined}
        onKeyDown={
          onViewDetail && !item.isSoldOut
            ? (e) => { if (e.key === "Enter" || e.key === " ") onViewDetail(); }
            : undefined
        }
      >
        {item.imageUrl ? (
          <>
            <img
              src={item.imageUrl}
              alt={item.name}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 will-change-transform group-hover:scale-[1.05]"
            />
            {/* Depth gradient */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
            {/* "Tap for details" hint — fades in on hover */}
            {onViewDetail && !item.isSoldOut && (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 flex justify-center pb-2 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[9px] font-bold uppercase tracking-[0.2em] text-white/80 backdrop-blur-sm">
                  Ver detalles
                </span>
              </div>
            )}
          </>
        ) : (
          /* Rich typographic fallback — asymmetric, dark, editorial */
          <div
            className="relative flex h-full w-full items-end justify-end overflow-hidden"
            style={{
              background: `linear-gradient(145deg, ${gradFrom} 0%, ${gradTo} 100%)`,
            }}
          >
            {/* Grain texture overlay */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.04] mix-blend-overlay"
              style={{
                backgroundImage:
                  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
                backgroundRepeat: "repeat",
              }}
              aria-hidden
            />
            {/* Subtle radial glow */}
            <div
              className="pointer-events-none absolute -bottom-4 -right-4 h-32 w-32 rounded-full opacity-20"
              style={{
                background:
                  "radial-gradient(ellipse at center, var(--guest-gold), transparent 65%)",
              }}
              aria-hidden
            />
            {/* Large typographic initial — bottom-right, intentionally cropped */}
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
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col gap-1.5">
          {item.isPopular && !item.isSoldOut && (
            <span className="inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--guest-gold)_30%,transparent)] bg-[var(--guest-bg-surface)]/88 px-2.5 py-[5px] text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--guest-gold)] backdrop-blur-md shadow-sm">
              Top
            </span>
          )}
          {item.isSoldOut && (
            <span className="inline-flex items-center rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)]/88 px-2.5 py-[5px] text-[9px] font-bold uppercase tracking-[0.22em] text-[var(--guest-muted)] backdrop-blur-md shadow-sm">
              Agotado
            </span>
          )}
        </div>

        {/* Price badge — glass chip bottom-right over image */}
        <div className="pointer-events-none absolute bottom-2.5 right-2.5">
          <span className="font-mono text-[13px] font-bold tabular-nums text-[var(--guest-gold)] drop-shadow-[0_1px_2px_rgba(0,0,0,0.45)]">
            ${unitPrice.toLocaleString("es-MX")}
          </span>
        </div>
      </div>

      {/* ── Content ────────────────────────────────────────────── */}
      <div className="flex flex-1 flex-col p-3">
        {/* Name + description — tappable zone for detail sheet */}
        <div
          className={cn(onViewDetail && !item.isSoldOut && "cursor-pointer")}
          onClick={onViewDetail && !item.isSoldOut ? onViewDetail : undefined}
          role={onViewDetail && !item.isSoldOut ? "button" : undefined}
          tabIndex={-1}
          aria-hidden={!!onViewDetail}
        >
        <h3 className="line-clamp-2 text-sm font-bold leading-snug tracking-tight text-[var(--guest-text)]">
          {item.name}
        </h3>

        {item.description && (
          <p className="mt-1.5 line-clamp-2 text-[11px] leading-relaxed text-[var(--guest-muted)]">
            {item.description}
          </p>
        )}
        </div>

        {hasVariants && (
          <div
            className="mt-3 flex flex-wrap gap-1.5"
            role="group"
            aria-label="Tamaño o presentación"
          >
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
                      : "border border-[var(--guest-divider)] bg-transparent text-[var(--guest-muted)] hover:border-[color-mix(in_srgb,var(--guest-gold)_28%,transparent)] hover:text-[var(--guest-text)]"
                  )}
                >
                  {v.name}
                </button>
              );
            })}
          </div>
        )}

        {item.note && (
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.2em] text-[color-mix(in_srgb,var(--guest-gold)_85%,var(--guest-text))]">
            {item.note}
          </p>
        )}

        {/* ── Action ─────────────────────────────────────────── */}
        <div className="mt-auto pt-3">
          {item.isSoldOut ? (
            <div className="flex min-h-[42px] items-center justify-center rounded-xl border border-[var(--guest-divider)] text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--guest-muted)]">
              No disponible
            </div>
          ) : qty === 0 ? (
            <motion.button
              type="button"
              onClick={() => {
                onAdd();
                if (!reduceMotion) setAddPulseKey((k) => k + 1);
              }}
              whileTap={reduceMotion ? undefined : { scale: 0.96 }}
              disabled={disabledQty}
              className={cn(
                "group/btn relative flex min-h-[42px] w-full items-center justify-center overflow-hidden rounded-xl",
                "bg-[color-mix(in_srgb,var(--guest-gold)_90%,#1c1008)] text-[var(--guest-bg-page)]",
                "text-[10px] font-bold uppercase tracking-[0.2em]",
                "shadow-[inset_0_1px_0_rgba(255,255,255,0.12)]",
                "transition-opacity active:scale-[0.98]",
                "disabled:cursor-not-allowed disabled:opacity-40"
              )}
            >
              <AnimatePresence>
                {addPulseKey > 0 && !reduceMotion ? (
                  <motion.span
                    key={`add-pulse-${addPulseKey}`}
                    initial={{ opacity: 0.28, scale: 0.3 }}
                    animate={{ opacity: 0, scale: 1.8 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.36, ease: "easeOut" }}
                    className="pointer-events-none absolute inset-0 m-auto h-24 w-24 rounded-full bg-white/35"
                    aria-hidden
                  />
                ) : null}
              </AnimatePresence>

              {/* Shimmer sweep — enters from left on hover */}
              <span
                className="pointer-events-none absolute inset-y-0 -left-14 w-10 -skew-x-12 bg-gradient-to-r from-transparent via-white/22 to-transparent opacity-0 transition-all duration-500 group-hover/btn:left-[110%] group-hover/btn:opacity-100"
                aria-hidden
              />
              Añadir
            </motion.button>
          ) : (
            <div className="flex justify-center py-0.5">
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
      </div>
    </motion.article>
  );
});
