"use client";

function hueFromString(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h + s.charCodeAt(i) * (i + 37)) % 360;
  }
  return h;
}

export function GuestAvatar({
  name,
  size = "md",
  className = "",
}: {
  name: string;
  size?: "sm" | "md";
  className?: string;
}) {
  const h = hueFromString(name || "invitado");
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

  const dim = size === "sm" ? "h-8 w-8 text-[11px]" : "h-10 w-10 text-xs";

  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-mono font-bold uppercase tracking-wide text-[var(--guest-bg-page)] shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] ${dim} ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${h} 42% 52%), hsl(${(h + 40) % 360} 38% 38%))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
