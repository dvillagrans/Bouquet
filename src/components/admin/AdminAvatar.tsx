"use client";

interface AdminAvatarProps {
  initials: string;
  hue?: string;
  size?: number;
  className?: string;
}

/** Small circular avatar for admin user with dynamic gradient background. */
export function AdminAvatar({
  initials,
  hue = "var(--color-pink-glow)",
  size = 36,
  className,
}: AdminAvatarProps) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-mono text-[0.7em] font-bold tracking-[-0.02em] text-ink ${className ?? ""}`}
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${hue}, color-mix(in srgb, ${hue} 60%, transparent))`,
        boxShadow: `0 2px 8px -2px color-mix(in srgb, ${hue} 40%, transparent)`,
      }}
      aria-hidden="true"
    >
      {initials.substring(0, 2).toUpperCase()}
    </div>
  );
}
