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
    <div className={`flex items-baseline gap-2 pb-3 pt-8 ${className}`}>
      <h2 className="font-serif text-2xl font-medium tracking-tight text-[var(--guest-text)]">{title}</h2>
      {count != null && count > 0 && (
        <span className="font-mono text-xs tabular-nums text-[var(--guest-muted)]">({count})</span>
      )}
    </div>
  );
});

