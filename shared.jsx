// Shared components for all dashboard variants
const { useState, useEffect, useRef } = React;

// ====== Abstract floral ornaments — no literal flowers, geometric petals ======
const PetalCluster = ({ size = 80, hue = "var(--rose)", style = {} }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" style={style} aria-hidden>
    <g opacity="0.7">
      {[0, 60, 120, 180, 240, 300].map((deg) => (
        <ellipse
          key={deg}
          cx="40" cy="22" rx="6" ry="14"
          fill={hue}
          opacity="0.18"
          transform={`rotate(${deg} 40 40)`}
        />
      ))}
      <circle cx="40" cy="40" r="3" fill={hue} opacity="0.55" />
    </g>
  </svg>
);

const Sprig = ({ width = 120, style = {} }) => (
  <svg width={width} height={width * 0.5} viewBox="0 0 120 60" style={style} aria-hidden>
    <path d="M 4 30 Q 30 18, 60 30 T 116 30" stroke="var(--sage-deep)" strokeWidth="1" fill="none" opacity="0.6" />
    {[18, 36, 54, 72, 90].map((cx, i) => (
      <ellipse key={cx} cx={cx} cy={30 + (i % 2 ? -6 : 6)} rx="5" ry="2.4"
        fill="var(--sage)" opacity="0.5"
        transform={`rotate(${i % 2 ? -25 : 25} ${cx} ${30 + (i % 2 ? -6 : 6)})`} />
    ))}
  </svg>
);

// ====== Logo — typographic Bouquet ======
const BouquetMark = ({ size = 28, color = "var(--burgundy)" }) => (
  <div style={{
    width: size, height: size, borderRadius: size * 0.28,
    background: "var(--rose-blush)",
    display: "grid", placeItems: "center",
    fontFamily: "var(--font-mono)", fontWeight: 700,
    fontSize: size * 0.5, color,
    letterSpacing: "-0.04em",
    boxShadow: "inset 0 0 0 1px color-mix(in srgb, var(--burgundy) 10%, transparent)"
  }}>
    b
  </div>
);

// ====== Sparkline ======
const Sparkline = ({ data, color = "var(--rose)", w = 120, h = 32, fill = true }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const step = w / (data.length - 1);
  const points = data.map((v, i) => [i * step, h - ((v - min) / range) * h * 0.85 - h * 0.075]);
  const linePath = points.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
  const fillPath = `${linePath} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg className="spark" width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {fill && <path className="fill" d={fillPath} fill={color} />}
      <path className="line" d={linePath} stroke={color} />
    </svg>
  );
};

// ====== Bar chart (vertical) ======
const Bars = ({ data, color = "var(--rose)", w = 220, h = 80, gap = 4 }) => {
  const max = Math.max(...data);
  const bw = (w - gap * (data.length - 1)) / data.length;
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.map((v, i) => {
        const bh = (v / max) * h * 0.92;
        return (
          <rect
            key={i}
            x={i * (bw + gap)}
            y={h - bh}
            width={bw}
            height={bh}
            rx={2}
            fill={color}
            opacity={i === data.length - 1 ? 1 : 0.35 + (i / data.length) * 0.4}
          />
        );
      })}
    </svg>
  );
};

// ====== Donut ======
const Donut = ({ segments, size = 120, thickness = 14 }) => {
  const r = size / 2 - thickness / 2;
  const c = 2 * Math.PI * r;
  const total = segments.reduce((s, x) => s + x.value, 0);
  let acc = 0;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none"
        stroke="color-mix(in srgb, var(--burgundy) 7%, transparent)" strokeWidth={thickness} />
      {segments.map((s, i) => {
        const len = (s.value / total) * c;
        const off = c - acc;
        acc += len;
        return (
          <circle key={i}
            cx={size / 2} cy={size / 2} r={r}
            fill="none"
            stroke={s.color}
            strokeWidth={thickness}
            strokeDasharray={`${len} ${c}`}
            strokeDashoffset={off}
            strokeLinecap="butt"
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
            style={{ transition: "stroke-dasharray 600ms var(--ease)" }}
          />
        );
      })}
    </svg>
  );
};

// ====== Live dot ======
const LiveDot = ({ label = "EN VIVO" }) => (
  <span className="pill" style={{
    background: "color-mix(in srgb, var(--rose) 10%, transparent)",
    color: "var(--rose)",
    padding: "3px 8px"
  }}>
    <span className="dot live" /> {label}
  </span>
);

// ====== Number with rolling tnum animation hook ======
const useTickingNumber = (target, ms = 1200) => {
  const [v, setV] = useState(0);
  useEffect(() => {
    const start = performance.now();
    let raf;
    const tick = (t) => {
      const p = Math.min(1, (t - start) / ms);
      const eased = 1 - Math.pow(1 - p, 3);
      setV(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return v;
};

// ====== Avatar ======
const Avatar = ({ initials, hue = "var(--rose)", size = 28 }) => (
  <div style={{
    width: size, height: size, borderRadius: "50%",
    background: `color-mix(in srgb, ${hue} 18%, white)`,
    color: hue,
    display: "grid", placeItems: "center",
    fontSize: size * 0.4,
    fontFamily: "var(--font-mono)",
    fontWeight: 700,
    border: "1px solid color-mix(in srgb, var(--burgundy) 8%, transparent)"
  }}>{initials}</div>
);

// ====== Heatmap (hours x days) ======
const Heatmap = ({ data, w = 380, h = 120 }) => {
  const rows = data.length;
  const cols = data[0].length;
  const cw = w / cols - 2;
  const ch = h / rows - 2;
  const max = Math.max(...data.flat());
  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`}>
      {data.map((row, r) =>
        row.map((v, c) => (
          <rect key={`${r}-${c}`}
            x={c * (cw + 2)} y={r * (ch + 2)}
            width={cw} height={ch} rx={2}
            fill="var(--rose)"
            opacity={0.08 + (v / max) * 0.85}
          />
        ))
      )}
    </svg>
  );
};

// ====== Status chip ======
const Chip = ({ children, tone = "rose" }) => {
  const tones = {
    rose: { bg: "color-mix(in srgb, var(--rose) 12%, transparent)", fg: "var(--rose)" },
    sage: { bg: "color-mix(in srgb, var(--sage-deep) 14%, transparent)", fg: "var(--sage-deep)" },
    burgundy: { bg: "color-mix(in srgb, var(--burgundy) 8%, transparent)", fg: "var(--burgundy)" },
    warm: { bg: "var(--wheat)", fg: "var(--burgundy)" },
  };
  const t = tones[tone] || tones.rose;
  return (
    <span className="pill" style={{ background: t.bg, color: t.fg }}>{children}</span>
  );
};

// Expose
Object.assign(window, {
  PetalCluster, Sprig, BouquetMark, Sparkline, Bars, Donut, LiveDot,
  useTickingNumber, Avatar, Heatmap, Chip
});
