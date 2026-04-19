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
  className = "",
}: {
  name: string;
  className?: string;
}) {
  const h = hueFromString(name || "invitado");
  const initials = name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("") || "?";

  return (
    <span
      className={`inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-mono text-[10px] font-bold uppercase tracking-wide text-bg-solid shadow-[inset_0_1px_1px_rgba(255,255,255,0.18)] ${className}`}
      style={{
        background: `linear-gradient(135deg, hsl(${h} 42% 52%), hsl(${(h + 40) % 360} 38% 38%))`,
      }}
      aria-hidden
    >
      {initials}
    </span>
  );
}
