"use client";

import type { ReactNode } from "react";

type GuestToastTone = "success" | "error" | "neutral";

export function GuestToast({
  tone,
  children,
}: {
  tone: GuestToastTone;
  children: ReactNode;
  reducedMotion?: boolean | null;
}) {
  const border =
    tone === "error"
      ? "border-[color-mix(in_srgb,var(--guest-urgent)_42%,transparent)]"
      : tone === "success"
        ? "border-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]"
        : "border-[var(--guest-divider)]";

  return (
    <div className={`pointer-events-auto flex items-center gap-3 rounded-2xl border ${border} bg-[var(--guest-bg-surface)] px-5 py-4 shadow-lg backdrop-blur-md`}>
      {tone === "error" && (
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--guest-urgent)]" aria-hidden />
      )}
      {tone === "success" && (
        <span className="h-2 w-2 shrink-0 rounded-full bg-[var(--guest-gold)]" aria-hidden />
      )}
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[var(--guest-text)]">{children}</p>
    </div>
  );
}
