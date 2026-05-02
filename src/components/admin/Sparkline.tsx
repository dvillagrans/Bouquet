"use client";

interface SparklineProps {
  data: number[];
  w?: number;
  h?: number;
  fill?: boolean;
  color?: string;
  className?: string;
}

/** Mini SVG sparkline chart. Fill option draws a gradient area under the line. */
export function Sparkline({
  data,
  w = 56,
  h = 22,
  fill = false,
  color = "var(--color-dash-green)",
  className,
}: SparklineProps) {
  if (!data.length) return null;
  const max = Math.max(...data, 1);
  const min = Math.min(...data, 0);
  const range = max - min || 1;
  const pad = 1;

  const points = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * (w - pad * 2) + pad},${h - pad - ((v - min) / range) * (h - pad * 2)}`
    )
    .join(" ");

  const polyPoints = `0,${h} ${points} ${w},${h}`;

  return (
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className={className}
      aria-hidden="true"
    >
      {fill && (
        <defs>
          <linearGradient id={`spark-fill-${data[0]}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.22} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
      )}
      {fill && <polygon points={polyPoints} fill={`url(#spark-fill-${data[0]})`} />}
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth={1.4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
