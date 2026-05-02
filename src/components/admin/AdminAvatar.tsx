"use client";

interface AdminAvatarProps {
  initials: string;
  hue?: string;
  size?: number | "sm" | "md" | "lg";
  className?: string;
}

const SIZES = {
  sm: 24,
  md: 36,
  lg: 48,
};

/** Small circular avatar for admin user with dynamic gradient background. */
export function AdminAvatar({
  initials,
  hue = "var(--color-pink-glow)",
  size = "md",
  className,
}: AdminAvatarProps) {
  const finalSize = typeof size === "number" ? size : SIZES[size] || 36;

  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-mono text-[0.7em] font-bold tracking-[-0.02em] text-ink ${className ?? ""}`}
      style={{
        width: finalSize,
        height: finalSize,
        background: `linear-gradient(135deg, ${hue}, color-mix(in srgb, ${hue} 60%, transparent))`,
        boxShadow: `0 2px 8px -2px color-mix(in srgb, ${hue} 40%, transparent)`,
      }}
      aria-hidden="true"
    >
      {initials.substring(0, 2).toUpperCase()}
    </div>
  );
}
