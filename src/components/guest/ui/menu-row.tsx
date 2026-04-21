"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import { QtyStepper } from "@/components/guest/ui/qty-stepper";
import { cn } from "@/lib/utils";

export type MenuRowItem = {
  id: string;
  name: string;
  description: string | null;
  note?: string;
  price: number;
  variants: { name: string; price: number }[];
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
};

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
}: MenuRowProps) {
  const hasVariants = item.variants && item.variants.length > 0;

  return (
    <motion.article
      layout
      className={cn(
        "flex gap-4 py-5 first:pt-2",
        item.isSoldOut && "opacity-55",
      )}
    >
      <div
        className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] font-serif text-lg font-semibold text-[var(--guest-gold)] shadow-[inset_0_1px_0_color-mix(in_srgb,var(--guest-gold)_25%,transparent)]"
        aria-hidden
      >
        {categoryInitial.slice(0, 1).toUpperCase()}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-baseline gap-2">
          <h3 className="text-lg font-semibold leading-tight text-[var(--guest-text)]">{item.name}</h3>
          {item.isPopular && !item.isSoldOut && (
            <span className="rounded-md border border-[color-mix(in_srgb,var(--guest-gold)_40%,transparent)] bg-[var(--guest-halo)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--guest-gold)]">
              Popular
            </span>
          )}
          {item.isSoldOut && (
            <span className="rounded-md border border-[var(--guest-divider)] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--guest-muted)]">
              Agotado
            </span>
          )}
        </div>
        {item.description && (
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-[var(--guest-muted)]">{item.description}</p>
        )}
        {hasVariants && (
          <div className="mt-4 flex flex-wrap gap-2" role="group" aria-label="Tamaño o presentación">
            {item.variants.map((v) => {
              const active = selectedVariantName === v.name;
              return (
                <button
                  key={v.name}
                  type="button"
                  onClick={() => onVariantChange(v.name)}
                  className={cn(
                    "rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-colors min-h-[44px]",
                    active
                      ? "bg-[color-mix(in_srgb,var(--guest-gold)_78%,#14110c)] text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.14)]"
                      : "border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] text-[var(--guest-text)] hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)]",
                  )}
                >
                  {v.name} · <span className="font-mono tabular-nums">${v.price.toLocaleString("es-MX")}</span>
                </button>
              );
            })}
          </div>
        )}
        {item.note && (
          <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[color-mix(in_srgb,var(--guest-gold)_90%,var(--guest-text))]">
            {item.note}
          </p>
        )}
      </div>

      <div className="flex shrink-0 flex-col items-end gap-3">
        <span className="font-mono text-base font-semibold tabular-nums text-[var(--guest-text)]">
          ${unitPrice.toLocaleString("es-MX")}
        </span>
        {!item.isSoldOut && (
          <QtyStepper
            qty={qty}
            name={qtyLabel}
            onAdd={onAdd}
            onInc={onInc}
            onDec={onDec}
            disabled={disabledQty}
          />
        )}
      </div>
    </motion.article>
  );
});

