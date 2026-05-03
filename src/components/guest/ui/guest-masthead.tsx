"use client";

import { useEffect, useRef, useState } from "react";
import type { GuestMenuTheme } from "@/lib/guest-menu-theme";
import type { GuestMenuThemeOrigin } from "@/components/guest/GuestMenuThemeToggle";
import { cn } from "@/lib/utils";
import { User, ChevronDown, Share2, Crown, Copy, Check, Hash } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type GuestMastheadProps = {
  restaurantName: string;
  tableNumber: number;
  guestName: string;
  isHost: boolean;
  billRequested: boolean;
  displayTableCode: string;
  joinCode: string | null | undefined;
  guests?: { name: string; isHost: boolean }[];
  onShareQr: () => void;
  qrOpen: boolean;
  onOpenCompanions?: () => void;
  orderStatusVisible?: boolean;
  orderStatusLabel?: string;
  orderStatusSummary?: string;
  orderStatusToneKey?: "ready" | "preparing" | "pending" | "delivered" | "checkout";
  hasOrderActivity?: boolean;
  onOpenOrderStatus?: () => void;
};

export function GuestMasthead({
  guestName,
  isHost,
  billRequested: _billRequested,
  displayTableCode,
  joinCode,
  guests = [],
  onShareQr,
  qrOpen: _qrOpen,
  onOpenCompanions,
  orderStatusVisible = false,
  orderStatusLabel,
  orderStatusSummary,
  orderStatusToneKey = "pending",
  hasOrderActivity = false,
  onOpenOrderStatus,
}: GuestMastheadProps) {
  const primaryCode = joinCode ?? displayTableCode;
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open]);

  const handleCopyCode = async () => {
    const code = joinCode ?? displayTableCode;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  const toneStyles = {
    ready: {
      bar: "border-emerald-400/45 bg-emerald-500/10",
      text: "text-emerald-700 guest-dark:text-emerald-300",
      dot: "bg-emerald-500",
    },
    preparing: {
      bar: "border-amber-400/45 bg-amber-500/10",
      text: "text-amber-700 guest-dark:text-amber-300",
      dot: "bg-amber-500",
    },
    pending: {
      bar: "border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)]",
      text: "text-[var(--guest-muted)]",
      dot: "bg-[var(--guest-muted)]",
    },
    delivered: {
      bar: "border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] bg-[var(--guest-halo)]",
      text: "text-[var(--guest-gold)]",
      summaryText: "text-[var(--guest-text)]",
      dot: "bg-[var(--guest-gold)]",
    },
    checkout: {
      bar: "border-[color-mix(in_srgb,var(--guest-gold)_15%,transparent)] bg-[var(--guest-bg-surface-2)]",
      text: "text-[var(--guest-muted)]",
      summaryText: "text-[var(--guest-text)]",
      dot: "bg-emerald-400",
    },
  } as const;

  const activeTone = toneStyles[orderStatusToneKey];

  return (
    <header className="relative z-40">
      <div className="flex justify-center">
      <div
        className="scrollbar-hide flex min-w-0 items-center gap-2.5 overflow-x-auto pb-2 pl-1 pr-4"
        style={{
          WebkitMaskImage: "linear-gradient(to right, transparent 0%, black 1%, black 96%, transparent 100%)",
          maskImage: "linear-gradient(to right, transparent 0%, black 1%, black 96%, transparent 100%)",
        }}
      >

        {/* ── Left: guest avatar stack ─────────────────────────── */}
        <button
          type="button"
          onClick={onOpenCompanions}
          className="flex shrink-0 items-center gap-2.5 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] px-1.5 py-1.5 pr-4 shadow-sm backdrop-blur-md transition-colors hover:border-[color-mix(in_srgb,var(--guest-gold)_30%,transparent)]"
          aria-label="Ver integrantes de la mesa"
        >
          <div className="flex items-center -space-x-2">
            {guests.slice(0, 3).map((g, i) => (
              <div
                key={g.name}
                className="relative flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--guest-bg-surface)] bg-[var(--guest-bg-surface-2)] text-[var(--guest-text)] shadow-sm"
                style={{ zIndex: 10 - i }}
                title={g.name}
              >
                {g.isHost ? (
                  <Crown className="size-3" aria-label="Anfitrión" strokeWidth={1.8} />
                ) : (
                  <User className="size-3.5" strokeWidth={1.8} />
                )}
              </div>
            ))}
            {guests.length > 3 && (
              <div className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--guest-bg-surface)] bg-[var(--guest-bg-surface-2)] text-[9px] font-bold text-[var(--guest-text)] shadow-sm">
                +{guests.length - 3}
              </div>
            )}
            {guests.length === 0 && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--guest-bg-surface-2)] text-[var(--guest-text)]">
                <User className="size-3.5" strokeWidth={1.8} />
              </div>
            )}
          </div>

          <div className="flex min-w-0 flex-col text-left">
            <span className="max-w-[80px] truncate text-sm font-semibold leading-tight text-[var(--guest-text)] sm:max-w-[120px]" title={guestName}>
              {guestName}
            </span>
            {isHost ? (
              <span className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--guest-gold)]">
                Anfitrión
              </span>
            ) : (
              <span className="truncate text-[10px] font-bold uppercase tracking-wider text-[var(--guest-muted)]">
                {guests.length} en mesa
              </span>
            )}
          </div>
        </button>

        {/* ── Center: order status pill ────────────────────────── */}
        {orderStatusVisible ? (
          <button
            type="button"
            onClick={onOpenOrderStatus}
            className={cn(
              "relative flex shrink-0 items-center gap-2 rounded-full border px-3.5 py-2 text-left shadow-sm backdrop-blur-md transition-transform active:scale-[0.99]",
              activeTone.bar,
            )}
            aria-haspopup="dialog"
            aria-label="Abrir detalle de pedidos"
          >
            <span className="relative flex size-2.5 shrink-0">
              {hasOrderActivity && (
                <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", activeTone.dot)} aria-hidden />
              )}
              <span className={cn("relative inline-flex size-2.5 rounded-full", activeTone.dot)} aria-hidden />
            </span>
            <div className="min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`lbl-${orderStatusLabel}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className={cn("text-[10px] font-bold uppercase tracking-[0.14em]", activeTone.text)}
                >
                  {orderStatusLabel ?? "Estado"}
                </motion.p>
              </AnimatePresence>
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`sum-${orderStatusSummary}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className={cn("truncate text-[10px] font-semibold", "summaryText" in activeTone ? (activeTone as { summaryText?: string }).summaryText : "text-[var(--guest-text)]")}
                >
                  {orderStatusSummary ?? "Sin pedidos"}
                </motion.p>
              </AnimatePresence>
            </div>
          </button>
        ) : null}

        {/* ── Right: code pill + theme toggle ─────────────────── */}
        <div className="flex items-center gap-2 shrink-0">
          <div ref={dropdownRef} className="relative">
            {/* Trigger */}
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-haspopup="true"
              className={cn(
                "flex shrink-0 items-center gap-2.5 rounded-full border bg-[var(--guest-bg-surface)] px-1.5 py-1.5 pr-3 shadow-sm backdrop-blur-md",
                "transition-colors",
                open
                  ? "border-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)] bg-[var(--guest-halo)]"
                  : "border-[var(--guest-divider)] hover:border-[color-mix(in_srgb,var(--guest-gold)_30%,transparent)]"
              )}
            >
              <div className={cn(
                "flex size-7 shrink-0 items-center justify-center rounded-full",
                open ? "bg-[color-mix(in_srgb,var(--guest-gold)_15%,transparent)] text-[var(--guest-gold)]" : "bg-[var(--guest-bg-surface-2)] text-[var(--guest-muted)]"
              )}>
                <Hash className="size-3.5" strokeWidth={1.8} />
              </div>
              <div className="flex min-w-0 flex-col text-left">
                <span className={cn(
                  "text-[10px] font-bold uppercase tracking-wider",
                  open ? "text-[var(--guest-gold)]" : "text-[var(--guest-muted)]"
                )}>
                  Mesa
                </span>
                <span className={cn(
                  "font-mono text-[13px] font-bold tracking-[0.1em]",
                  open ? "text-[var(--guest-gold)]" : "text-[var(--guest-text)]"
                )}>
                  {primaryCode}
                </span>
              </div>
              <motion.span
                animate={{ rotate: open ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 340, damping: 28 }}
                className="flex"
              >
                <ChevronDown className={cn("size-3.5", open ? "text-[var(--guest-gold)]" : "text-[var(--guest-muted)]")} strokeWidth={2} />
              </motion.span>
            </button>

            {/* ── Dropdown panel ─────────────────────────────────── */}
            <AnimatePresence>
              {open && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -6 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -4 }}
                  transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  style={{ transformOrigin: "top right" }}
                  className="absolute right-0 top-full z-[90] mt-2.5 w-72 overflow-hidden rounded-2xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] shadow-[0_24px_60px_-16px_rgba(0,0,0,0.42),inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl"
                >
                  {/* Top accent line */}
                  <div className="h-px w-full bg-gradient-to-r from-transparent via-[color-mix(in_srgb,var(--guest-gold)_38%,transparent)] to-transparent" />

                  {/* Session block */}
                  <div className="px-4 pt-4 pb-3">
                    <p className="mb-3 text-[9px] font-bold uppercase tracking-[0.24em] text-[var(--guest-muted)]">
                      Tu sesión
                    </p>

                    <div className="space-y-1 rounded-xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] overflow-hidden">
                      {/* Access code row */}
                      <button
                        type="button"
                        onClick={handleCopyCode}
                        className="group/copy flex w-full items-center justify-between gap-3 px-3 py-2.5 transition-colors hover:bg-[color-mix(in_srgb,var(--guest-gold)_5%,transparent)]"
                        aria-label="Copiar código de acceso"
                      >
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--guest-muted)]">
                          {joinCode ? "Acceso" : "Mesa"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <span className="font-mono text-[13px] font-bold tracking-[0.14em] text-[var(--guest-text)]">
                            {joinCode ?? displayTableCode}
                          </span>
                          <AnimatePresence mode="wait" initial={false}>
                            {copied ? (
                              <motion.span key="check"
                                initial={{ opacity: 0, scale: 0.7 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.7 }}
                                transition={{ type: "spring", stiffness: 380, damping: 26 }}
                              >
                                <Check className="size-3 text-emerald-500" strokeWidth={2.5} />
                              </motion.span>
                            ) : (
                              <span key="copy" className="opacity-0 transition-opacity duration-150 group-hover/copy:opacity-100">
                                <Copy className="size-3 text-[var(--guest-muted)]" strokeWidth={2} />
                              </span>
                            )}
                          </AnimatePresence>
                        </span>
                      </button>

                      {/* Divider */}
                      <div className="h-px mx-3 bg-[var(--guest-divider)]" aria-hidden />

                      {/* Table code row */}
                      <div className="flex items-center justify-between gap-3 px-3 py-2.5">
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--guest-muted)]">
                          Mesa
                        </span>
                        <span className="font-mono text-[13px] font-bold tracking-[0.14em] text-[var(--guest-text)]">
                          {displayTableCode}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="mx-4 h-px bg-[var(--guest-divider)]" aria-hidden />

                  {/* Share CTA */}
                  <div className="p-3">
                    <button
                      type="button"
                      onClick={() => { setOpen(false); onShareQr(); }}
                      className={cn(
                        "group/share relative flex w-full items-center gap-3 overflow-hidden rounded-xl px-4 py-3 text-left",
                        "border border-[color-mix(in_srgb,var(--guest-gold)_32%,transparent)]",
                        "bg-[color-mix(in_srgb,var(--guest-gold)_7%,transparent)]",
                        "transition-colors hover:bg-[color-mix(in_srgb,var(--guest-gold)_14%,transparent)]",
                        "active:scale-[0.98]"
                      )}
                    >
                      {/* Icon container */}
                      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--guest-gold)_28%,transparent)] bg-[color-mix(in_srgb,var(--guest-gold)_12%,transparent)]">
                        <Share2 className="size-3.5 text-[var(--guest-gold)]" strokeWidth={1.9} />
                      </span>

                      <div className="min-w-0">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--guest-gold)]">
                          Compartir mesa
                        </p>
                        <p className="mt-0.5 text-[10px] leading-tight text-[var(--guest-muted)]">
                          Invita a más personas a ordenar
                        </p>
                      </div>

                      {/* Shimmer sweep */}
                      <span
                        className="pointer-events-none absolute inset-y-0 -left-10 w-8 -skew-x-12 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 transition-all duration-500 group-hover/share:left-[110%] group-hover/share:opacity-100"
                        aria-hidden
                      />
                    </button>
                  </div>

                  {/* Bottom safe area */}
                  <div className="h-1" aria-hidden />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
      </div>
    </header>
  );
}
