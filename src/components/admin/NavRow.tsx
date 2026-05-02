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
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-[13px] font-medium transition-colors ${
        active
          ? "bg-pink-glow/8 text-light"
          : "text-dim hover:bg-white/[0.04] hover:text-light"
      }`}
    >
      <span className="flex-1 truncate">{label}</span>
      {badge != null && (
        <span className="inline-flex h-5 min-w-[20px] items-center justify-center rounded-full bg-white/[0.07] px-1.5 font-mono text-[10px] font-semibold tabular-nums text-dim">
          {badge}
        </span>
      )}
    </button>
  );
}
