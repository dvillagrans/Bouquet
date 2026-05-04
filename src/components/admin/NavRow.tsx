"use client";

interface NavRowProps {
  label: string;
  active?: boolean;
  badge?: string | null;
  onClick?: () => void;
}

/** Sidebar navigation item with optional badge pill. */
export function NavRow({ label, active = false, badge, onClick }: NavRowProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-[48px] w-full touch-manipulation items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors focus-visible:ring-2 focus-visible:ring-ring ${
        active
          ? "bg-accent text-accent-foreground"
          : "text-dim hover:bg-white/[0.04] hover:text-light"
      }`}
    >
      <span className="flex-1 truncate">{label}</span>
      {badge != null && (
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-muted px-1.5 font-mono text-[10px] font-semibold tabular-nums text-muted-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}
