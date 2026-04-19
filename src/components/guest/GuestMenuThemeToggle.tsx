"use client";

import type { MouseEvent } from "react";
import { Moon, Sun } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { GuestMenuTheme } from "@/lib/guest-menu-theme";
import { cn } from "@/lib/utils";

export type GuestMenuThemeOrigin = { clientX: number; clientY: number };

type GuestMenuThemeToggleProps = {
  mode: GuestMenuTheme;
  /** Origen del punto se usa en la View Transition (dedo/cursor). */
  onChange: (mode: GuestMenuTheme, origin?: GuestMenuThemeOrigin) => void;
  className?: string;
};

/** Alterna aspecto del menú QR entre claro (cream) y oscuro (ink/panel); no modifica `<html>.dark`. */
function themeOriginFromClick(e: MouseEvent<HTMLButtonElement>): GuestMenuThemeOrigin {
  const r = e.currentTarget.getBoundingClientRect();
  const x = e.clientX || r.left + r.width / 2;
  const y = e.clientY || r.top + r.height / 2;
  return { clientX: x, clientY: y };
}

export function GuestMenuThemeToggle({ mode, onChange, className }: GuestMenuThemeToggleProps) {
  const isDark = mode === "dark";

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className={cn(
        "rounded-full shadow-sm touch-manipulation",
        isDark
          ? "border-white/15 bg-panel/80 text-light hover:bg-panel hover:text-light"
          : "border-slate-200/90 bg-white/90 text-slate-700 hover:bg-white",
        className,
      )}
      aria-label={isDark ? "Menú modo claro" : "Menú modo oscuro"}
      aria-pressed={isDark}
      onClick={(e) => onChange(isDark ? "light" : "dark", themeOriginFromClick(e))}
    >
      {isDark ? (
        <Sun className="size-4 shrink-0" aria-hidden />
      ) : (
        <Moon className="size-4 shrink-0" aria-hidden />
      )}
    </Button>
  );
}
