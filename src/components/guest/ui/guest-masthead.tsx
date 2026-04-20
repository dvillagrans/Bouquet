"use client";

import { GuestMenuThemeToggle } from "@/components/guest/GuestMenuThemeToggle";
import type { GuestMenuTheme } from "@/lib/guest-menu-theme";
import type { GuestMenuThemeOrigin } from "@/components/guest/GuestMenuThemeToggle";
import { cn } from "@/lib/utils";

type GuestMastheadProps = {
  restaurantName: string;
  tableNumber: number;
  guestName: string;
  isHost: boolean;
  billRequested: boolean;
  menuTheme: GuestMenuTheme;
  onThemeChange: (mode: GuestMenuTheme, origin?: GuestMenuThemeOrigin) => void;
};

export function GuestMasthead({
  restaurantName,
  tableNumber,
  guestName,
  isHost,
  billRequested,
  menuTheme,
  onThemeChange,
}: GuestMastheadProps) {
  return (
    <header className="pt-2">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--guest-muted)]">
            Carta del día · <span className="text-[var(--guest-text)]">{restaurantName}</span>
          </p>
          <h1 className="mt-3 font-serif text-4xl font-medium tracking-tight text-[var(--guest-text)] sm:text-5xl lg:text-6xl">
            Mesa {tableNumber}
          </h1>
        </div>

        <GuestMenuThemeToggle
          mode={menuTheme}
          onChange={onThemeChange}
          className="size-11 shrink-0 border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] shadow-none"
        />
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <span
          className="inline-flex max-w-[min(100%,20rem)] items-center truncate rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] px-4 py-2 text-sm font-medium text-[var(--guest-text)]"
          title={guestName}
        >
          {guestName}
        </span>
        {isHost && (
          <span className="rounded-full border border-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)] bg-[var(--guest-halo)] px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em] text-[var(--guest-gold)]">
            Anfitrión
          </span>
        )}
        {billRequested && (
          <span
            className={cn(
              "rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.14em]",
              "border-[color-mix(in_srgb,var(--guest-urgent)_45%,transparent)] bg-[color-mix(in_srgb,var(--guest-urgent)_12%,transparent)] text-[var(--guest-urgent)]",
            )}
            role="status"
          >
            Cuenta solicitada — sin nuevos pedidos
          </span>
        )}
      </div>
    </header>
  );
}
