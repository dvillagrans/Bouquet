"use client";

import { GuestMenuThemeToggle } from "@/components/guest/GuestMenuThemeToggle";
import type { GuestMenuTheme } from "@/lib/guest-menu-theme";
import type { GuestMenuThemeOrigin } from "@/components/guest/GuestMenuThemeToggle";
import { cn } from "@/lib/utils";
import { User, ChevronDown, Share2, KeyRound } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

type GuestMastheadProps = {
  restaurantName: string;
  tableNumber: number;
  guestName: string;
  isHost: boolean;
  billRequested: boolean;
  menuTheme: GuestMenuTheme;
  onThemeChange: (mode: GuestMenuTheme, origin?: GuestMenuThemeOrigin) => void;
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
  billRequested,
  menuTheme,
  onThemeChange,
  displayTableCode,
  joinCode,
  guests = [],
  onShareQr,
  qrOpen,
  onOpenCompanions,
  orderStatusVisible = false,
  orderStatusLabel,
  orderStatusSummary,
  orderStatusToneKey = "pending",
  hasOrderActivity = false,
  onOpenOrderStatus,
}: GuestMastheadProps) {
  const primaryCode = joinCode ?? displayTableCode;
  const primaryCodeLabel = joinCode ? "Código de acceso" : "Código de mesa";

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
      bar: "border-transparent bg-[color-mix(in_srgb,var(--guest-gold)_85%,#221b14)] shadow-[0_4px_12px_rgba(183,146,93,0.3)]",
      text: "text-white/80",
      summaryText: "text-white",
      dot: "bg-emerald-400",
    },
  } as const;

  const activeTone = toneStyles[orderStatusToneKey];

  return (
    <header className="relative z-40 pt-3 sm:pt-4">
      <div className="flex items-center justify-between gap-2 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] px-3 py-2 shadow-sm backdrop-blur-md">
        
        {/* Left: Guest/Session Info (Avatar Stack) */}
        <button 
          onClick={onOpenCompanions}
          className="flex min-w-0 shrink cursor-pointer items-center gap-2.5 rounded-full p-1 pl-2 transition-colors hover:bg-[var(--guest-bg-surface-2)]"
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
                  <span className="text-[10px]" aria-label="Anfitrión">👑</span>
                ) : (
                  <User className="size-3.5" />
                )}
              </div>
            ))}
            {guests.length > 3 && (
              <div 
                className="relative z-[1] flex size-7 shrink-0 items-center justify-center rounded-full border-2 border-[var(--guest-bg-surface)] bg-[var(--guest-bg-surface-2)] text-[9px] font-bold text-[var(--guest-text)] shadow-sm"
              >
                +{guests.length - 3}
              </div>
            )}
            {guests.length === 0 && (
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-[var(--guest-bg-surface-2)] text-[var(--guest-text)]">
                <User className="size-3.5" />
              </div>
            )}
          </div>
          
          <div className="flex min-w-0 flex-col text-left">
            <span className="truncate text-sm font-semibold leading-tight text-[var(--guest-text)] max-w-[80px] sm:max-w-[120px]" title={guestName}>
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

        {orderStatusVisible ? (
          <button
            type="button"
            onClick={onOpenOrderStatus}
            className={cn(
              "relative flex min-w-0 flex-1 items-center gap-2 rounded-full border px-3 py-2 text-left shadow-sm transition-transform active:scale-[0.99]",
              activeTone.bar,
            )}
            aria-haspopup="dialog"
            aria-label="Abrir detalle de pedidos"
          >
            <span className="relative flex size-2.5 shrink-0">
              {hasOrderActivity ? (
                <span className={cn("absolute inline-flex h-full w-full animate-ping rounded-full opacity-75", activeTone.dot)} aria-hidden />
              ) : null}
              <span className={cn("relative inline-flex size-2.5 rounded-full", activeTone.dot)} aria-hidden />
            </span>

            <div className="min-w-0">
              <AnimatePresence mode="wait" initial={false}>
                <motion.p
                  key={`masthead-order-label-${orderStatusLabel ?? "estado"}`}
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
                  key={`masthead-order-summary-${orderStatusSummary ?? "sin-resumen"}`}
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.18 }}
                  className={cn("truncate text-[10px] font-semibold", "summaryText" in activeTone ? (activeTone as any).summaryText : "text-[var(--guest-text)]")}
                >
                  {orderStatusSummary ?? "Sin pedidos"}
                </motion.p>
              </AnimatePresence>
            </div>
          </button>
        ) : null}

        {/* Right: Table Context & Theme */}
        <div className="flex items-center gap-2 shrink-0">
          <details className="group relative z-[70]" aria-label="Opciones de mesa">
            <summary className="flex cursor-pointer items-center gap-2 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-3 py-1.5 shadow-sm transition-all hover:border-[var(--guest-gold)] hover:bg-[var(--guest-bg-surface)] [&::-webkit-details-marker]:hidden">
              <span className="font-mono text-[11px] font-bold tracking-[0.1em] text-[var(--guest-text)]" aria-label={`${primaryCodeLabel}: ${primaryCode}`}>
                {primaryCode}
              </span>
              <ChevronDown className="size-3.5 text-[var(--guest-muted)] transition-transform duration-200 group-open:rotate-180" />
            </summary>

            <div className="absolute right-0 top-full z-[90] mt-2 w-64 overflow-hidden rounded-2xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] shadow-[0_24px_48px_-18px_rgba(0,0,0,0.58)] ring-1 ring-black/5">
              <div className="space-y-2 border-b border-[var(--guest-divider)] p-3">
                <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[var(--guest-muted)]">Identificación</p>
                <div className="space-y-1.5 rounded-xl bg-[var(--guest-bg-surface-2)] p-2">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--guest-muted)]">Acceso</span>
                    <span className="font-mono text-xs font-bold tracking-[0.12em] text-[var(--guest-text)]">{joinCode ?? "N/A"}</span>
                  </div>
                  <div className="h-px bg-[var(--guest-divider)]" aria-hidden />
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-[var(--guest-muted)]">Mesa</span>
                    <span className="font-mono text-xs font-bold tracking-[0.12em] text-[var(--guest-text)]">{displayTableCode}</span>
                  </div>
                </div>
              </div>
              <div className="p-2">
                <button
                  type="button"
                  onClick={onShareQr}
                  className="flex w-full items-center gap-2 rounded-xl border border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] bg-[var(--guest-halo)] px-3 py-2.5 text-left text-xs font-semibold uppercase tracking-[0.12em] text-[var(--guest-gold)] transition-colors hover:bg-[color-mix(in_srgb,var(--guest-gold)_18%,transparent)]"
                >
                  <Share2 className="size-3.5" />
                  Compartir mesa
                </button>
              </div>
            </div>
          </details>

          <GuestMenuThemeToggle
            mode={menuTheme}
            onChange={onThemeChange}
            className="size-8 shrink-0 rounded-full border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] shadow-none sm:size-9"
          />
        </div>

      </div>
    </header>
  );
}
