"use client";

import Link from "next/link";
import { Share2 } from "lucide-react";
import { GuestMenuThemeToggle } from "@/components/guest/GuestMenuThemeToggle";
import type { GuestMenuTheme } from "@/lib/guest-menu-theme";
import type { GuestMenuThemeOrigin } from "@/components/guest/GuestMenuThemeToggle";
import { cn } from "@/lib/utils";

export type ContextIslandProps = {
  displayTableCode: string;
  joinCode: string | null | undefined;
  cuentaHref: string;
  billRequested: boolean;
  menuTheme: GuestMenuTheme;
  onThemeChange: (mode: GuestMenuTheme, origin?: GuestMenuThemeOrigin) => void;
  onShareQr: () => void;
  qrOpen: boolean;
  showTransferHost: boolean;
  onTransferHost: () => void;
};

export function ContextIsland({
  displayTableCode,
  joinCode,
  cuentaHref,
  billRequested,
  menuTheme,
  onThemeChange,
  onShareQr,
  qrOpen,
  showTransferHost,
  onTransferHost,
}: ContextIslandProps) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-center justify-between gap-3 rounded-[22px] border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] px-4 py-3 shadow-[inset_0_1px_0_var(--guest-panel-edge)] backdrop-blur-xl",
      )}
      aria-label="Identificación de la mesa"
    >
      <div className="flex min-w-0 flex-wrap items-center gap-x-6 gap-y-2">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--guest-muted)]">Mesa</p>
          <p className="mt-0.5 font-mono text-base font-semibold tracking-wider text-[var(--guest-text)]" aria-label={`Código de mesa: ${displayTableCode}`}>
            {displayTableCode}
          </p>
        </div>
        {joinCode && (
          <div>
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--guest-muted)]">Acceso</p>
            <p className="mt-0.5 font-mono text-base font-semibold tracking-wider text-[var(--guest-text)]" aria-label={`Código de acceso: ${joinCode}`}>
              {joinCode}
            </p>
          </div>
        )}
      </div>

      <div className="flex shrink-0 flex-wrap items-center justify-end gap-2 sm:gap-3">
        <button
          type="button"
          onClick={onShareQr}
          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-4 text-[11px] font-semibold uppercase tracking-wider text-[var(--guest-text)] transition-colors hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]"
          aria-haspopup="dialog"
          aria-expanded={qrOpen}
          aria-label="Abrir código QR para compartir la mesa"
        >
          <Share2 className="h-4 w-4 shrink-0" aria-hidden />
          Compartir
        </button>

        {showTransferHost && (
          <>
            <span className="hidden text-[var(--guest-subtle)] sm:inline" aria-hidden>
              ·
            </span>
            <button
              type="button"
              onClick={onTransferHost}
              className="min-h-11 text-[11px] font-semibold uppercase tracking-wider text-[var(--guest-muted)] underline-offset-4 transition-colors hover:text-[var(--guest-gold)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]"
              aria-haspopup="dialog"
            >
              Pasar anfitrión
            </button>
          </>
        )}

        <GuestMenuThemeToggle mode={menuTheme} onChange={onThemeChange} className="size-11 border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] shadow-none" />

        {!billRequested ? (
          <Link
            href={cuentaHref}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-[var(--guest-text)] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--guest-bg-page)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)]"
          >
            Cuenta
          </Link>
        ) : (
          <span className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--guest-divider)] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--guest-muted)]" role="status">
            Cuenta pedida
          </span>
        )}
      </div>
    </div>
  );
}
