"use client";

/** Pulsing green dot + label for live status indicator. */
export function LiveDot({ label = "LIVE", className }: { label?: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-dash-green/20 bg-dash-green/8 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-dash-green ${className ?? ""}`}
    >
      <span className="relative flex size-1.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-dash-green opacity-60" />
        <span className="relative inline-flex size-1.5 rounded-full bg-dash-green" />
      </span>
      {label}
    </span>
  );
}
