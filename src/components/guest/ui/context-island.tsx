"use client";

import Link from "next/link";
import { ChevronDown, Share2 } from "lucide-react";
import { cn } from "@/lib/utils";

export type ContextIslandProps = {
  displayTableCode: string;
  joinCode: string | null | undefined;
  cuentaHref: string;
  billRequested: boolean;
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
  onShareQr,
  qrOpen,
  showTransferHost,
  onTransferHost,
}: ContextIslandProps) {
  return (
    <>
      <details
        className="group rounded-[22px] border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] px-4 py-3 shadow-[inset_0_1px_0_var(--guest-panel-edge)] backdrop-blur-xl sm:hidden"
        aria-label="Identificación de la mesa"
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--guest-muted)]">Mesa</p>
            <p className="mt-1 truncate font-mono text-[0.95rem] font-semibold tracking-[0.08em] text-[var(--guest-text)]" aria-label={`Código de mesa: ${displayTableCode}`}>
              {displayTableCode}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {joinCode ? (
              <span className="rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-3 py-1 font-mono text-[10px] font-semibold tracking-[0.08em] text-[var(--guest-text)]">
                {joinCode}
              </span>
            ) : null}
            <ChevronDown className="size-4 text-[var(--guest-muted)] transition-transform duration-200 group-open:rotate-180" aria-hidden />
          </div>
        </summary>

        <div className="mt-3 space-y-3 border-t border-[var(--guest-divider)] pt-3">
          {joinCode ? (
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--guest-muted)]">Acceso</p>
              <p className="mt-1 font-mono text-[0.9rem] font-semibold tracking-[0.08em] text-[var(--guest-text)]" aria-label={`Código de acceso: ${joinCode}`}>
                {joinCode}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={onShareQr}
              className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-4 text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--guest-text)] transition-colors hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]"
              aria-haspopup="dialog"
              aria-expanded={qrOpen}
              aria-label="Abrir código QR para compartir la mesa"
            >
              <Share2 className="h-4 w-4 shrink-0" aria-hidden />
              Compartir
            </button>

            {showTransferHost && (
              <button
                type="button"
                onClick={onTransferHost}
                className="min-h-11 text-[11px] font-semibold uppercase tracking-wider text-[var(--guest-muted)] underline-offset-4 transition-colors hover:text-[var(--guest-gold)] hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]"
                aria-haspopup="dialog"
              >
                Pasar anfitrión
              </button>
            )}
          </div>
        </div>
      </details>

      <div
        className={cn(
          "hidden rounded-[22px] border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] px-5 py-3.5 shadow-[inset_0_1px_0_var(--guest-panel-edge)] backdrop-blur-xl sm:flex sm:items-center sm:justify-between sm:gap-5",
        )}
        aria-label="Identificación de la mesa"
      >
        <div className="flex min-w-0 w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-nowrap sm:items-end sm:gap-6">
          <div className="min-w-0 sm:min-w-[11.5rem]">
            <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--guest-muted)] sm:text-[10px] sm:tracking-[0.2em]">Mesa</p>
            <p className="mt-0.5 max-w-full break-all font-mono text-[0.95rem] font-semibold leading-tight tracking-[0.08em] text-[var(--guest-text)] [overflow-wrap:anywhere] sm:break-normal sm:text-[1.02rem] sm:tracking-[0.11em] sm:whitespace-nowrap sm:[overflow-wrap:normal]" aria-label={`Código de mesa: ${displayTableCode}`}>
              {displayTableCode}
            </p>
          </div>

          {joinCode && <span className="hidden h-8 w-px bg-[var(--guest-divider)] sm:block" aria-hidden="true" />}

          {joinCode && (
            <div className="sm:block sm:min-w-[7rem]">
              <p className="text-[11px] font-medium uppercase tracking-wider text-[var(--guest-muted)] sm:text-[10px] sm:tracking-[0.2em]">Acceso</p>
              <p className="mt-0.5 max-w-full break-all font-mono text-[0.95rem] font-semibold leading-tight tracking-[0.08em] text-[var(--guest-text)] [overflow-wrap:anywhere] sm:break-normal sm:text-[1.02rem] sm:tracking-[0.11em] sm:whitespace-nowrap sm:[overflow-wrap:normal]" aria-label={`Código de acceso: ${joinCode}`}>
                {joinCode}
              </p>
            </div>
          )}
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:ml-auto sm:w-auto sm:flex-nowrap sm:justify-end sm:gap-2.5 sm:-mr-1">
          <button
            type="button"
            onClick={onShareQr}
            className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-4 text-[11px] font-semibold uppercase tracking-[0.13em] text-[var(--guest-text)] transition-colors hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]"
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

          {!billRequested ? (
            <Link
              href={cuentaHref}
              className="hidden min-h-11 items-center justify-center rounded-full bg-[var(--guest-text)] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--guest-bg-page)] transition-opacity hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_55%,transparent)] sm:ml-auto sm:inline-flex sm:whitespace-nowrap"
            >
              Pagar mi parte
            </Link>
          ) : (
            <span className="hidden min-h-11 items-center justify-center rounded-full border border-[var(--guest-divider)] px-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--guest-muted)] sm:ml-auto sm:inline-flex sm:whitespace-nowrap" role="status">
              Cuenta pedida
            </span>
          )}
        </div>
      </div>
    </>
  );
}
