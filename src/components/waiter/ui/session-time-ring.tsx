"use client";

/**
 * Anillo pequeño con minutos de sesión; tono de alerta tras `warnMinutes`.
 */
export function SessionTimeRing({
  minutes,
  warnMinutes = 45,
  className = "",
}: {
  minutes: number;
  warnMinutes?: number;
  className?: string;
}) {
  const r = 17;
  const c = 2 * Math.PI * r;
  const pct = Math.min(Math.max(minutes / 60, 0), 1);
  const offset = c * (1 - pct);
  const warn = minutes >= warnMinutes;

  return (
    <div className={`relative flex h-11 w-11 shrink-0 items-center justify-center ${className}`}>
      <svg
        width="44"
        height="44"
        viewBox="0 0 44 44"
        className="-rotate-90 transform"
        aria-hidden
      >
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="text-border-main"
        />
        <circle
          cx="22"
          cy="22"
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className={warn ? "text-dash-red" : "text-gold/80"}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-mono text-[10px] font-bold tabular-nums leading-none ${warn ? "text-dash-red" : "text-light"}`}
      >
        {minutes}
      </span>
      <span className="sr-only">{minutes} minutos en mesa</span>
    </div>
  );
}
