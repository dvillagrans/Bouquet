import { memo } from "react";
import { Flower2 } from "lucide-react";

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
    <div className={`flex items-center gap-3 pb-4 pt-6 ${className}`}>
      <Flower2 className="size-6 shrink-0 text-[color-mix(in_srgb,var(--guest-gold)_80%,#dd9d9d)]" strokeWidth={1.5} />
      <div className="flex items-baseline gap-2 shrink-0">
        <h2 className="font-serif text-3xl font-medium tracking-tight text-[var(--guest-text)]">{title}</h2>
        {count != null && count > 0 && (
          <span className="font-mono text-sm tabular-nums text-[var(--guest-muted)]">({count})</span>
        )}
      </div>
      <div className="h-px flex-grow bg-[color-mix(in_srgb,var(--guest-divider)_60%,transparent)] mt-2" aria-hidden />
    </div>
  );
});

