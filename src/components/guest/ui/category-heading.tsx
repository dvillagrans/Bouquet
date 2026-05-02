import { memo } from "react";

export const CategoryHeading = memo(function CategoryHeading({
  title,
  count,
  className = "",
}: {
  title: string;
  count?: number;
  className?: string;
}) {
  return (
    <div className={`pb-3 pt-4 ${className}`}>
      <div className="mb-3 h-px w-12 bg-[color-mix(in_srgb,var(--guest-gold)_18%,transparent)]" aria-hidden />
      <div className="flex items-baseline gap-2">
        <h2 className="font-serif text-2xl font-medium tracking-tight text-[var(--guest-text)]">{title}</h2>
        {count != null && count > 0 && (
          <span className="font-mono text-xs tabular-nums text-[var(--guest-muted)]">({count})</span>
        )}
      </div>
    </div>
  );
});

