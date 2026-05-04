"use client";

import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

type Status = "active" | "steady" | "closing" | "open";

interface TableDef {
  id: string;
  x: number; y: number;
  w: number; h: number;
  rx?: number;
  status: Status;
}

const STATUS_ORDER: Status[] = ["open", "active", "steady", "closing", "open"];
function nextStatus(s: Status): Status {
  const i = STATUS_ORDER.indexOf(s);
  return STATUS_ORDER[(i + 1) % STATUS_ORDER.length];
}

const PALETTE: Record<Status, { fill: string; stroke: string; dot: string; text: string }> = {
  active:  { fill: "rgba(199,91,122,0.14)",  stroke: "rgba(199,91,122,0.50)",  dot: "#E8A5B0", text: "#E8A5B0" },
  steady:  { fill: "rgba(245,230,235,0.05)", stroke: "rgba(245,230,235,0.18)", dot: "rgba(245,230,235,0.45)", text: "rgba(245,230,235,0.50)" },
  closing: { fill: "rgba(168,176,160,0.12)", stroke: "rgba(168,176,160,0.48)", dot: "#A8B0A0", text: "#A8B0A0" },
  open:    { fill: "transparent",            stroke: "rgba(245,230,235,0.10)", dot: "rgba(245,230,235,0.20)", text: "rgba(245,230,235,0.22)" },
};

const TABLES: TableDef[] = [
  // Left zone — small 2-4 pax (52×52)
  { id: "01", x: 18, y: 20,  w: 52, h: 52, rx: 10, status: "active"  },
  { id: "02", x: 86, y: 20,  w: 52, h: 52, rx: 10, status: "open"    },
  { id: "03", x: 154,y: 20,  w: 52, h: 52, rx: 10, status: "active"  },
  { id: "05", x: 18, y: 94,  w: 52, h: 52, rx: 10, status: "steady"  },
  { id: "06", x: 86, y: 94,  w: 52, h: 52, rx: 10, status: "active"  },
  { id: "07", x: 154,y: 94,  w: 52, h: 52, rx: 10, status: "steady"  },
  { id: "09", x: 86, y: 168, w: 52, h: 52, rx: 10, status: "active"  },
  { id: "10", x: 154,y: 168, w: 52, h: 52, rx: 10, status: "steady"  },
  { id: "12", x: 18, y: 244, w: 52, h: 52, rx: 10, status: "open"    },
  { id: "13", x: 86, y: 244, w: 52, h: 52, rx: 10, status: "steady"  },
  { id: "14", x: 154,y: 244, w: 52, h: 52, rx: 10, status: "open"    },
  // Right zone — large 4-6 pax booths (86×58)
  { id: "04", x: 234,y: 16,  w: 86, h: 58, rx: 12, status: "active"  },
  { id: "08", x: 234,y: 90,  w: 86, h: 58, rx: 12, status: "closing" },
  { id: "11", x: 234,y: 164, w: 86, h: 58, rx: 12, status: "open"    },
];

const TRANSITION = "fill 0.6s ease, stroke 0.6s ease, stroke-dasharray 0.4s ease";

function TableShape({
  id,
  x,
  y,
  w,
  h,
  rx = 8,
  status,
  reduceMotion,
}: TableDef & { reduceMotion: boolean }) {
  const p = PALETTE[status];
  const isAnimated =
    !reduceMotion && (status === "active" || status === "closing");

  return (
    <g className="floor-table">
      <rect
        x={x} y={y} width={w} height={h} rx={rx}
        fill={p.fill}
        stroke={p.stroke}
        strokeWidth={1}
        strokeDasharray={status === "open" ? "3 2" : undefined}
        style={{ transition: TRANSITION }}
      />
      {/* Table number */}
      <text
        x={x + w / 2}
        y={y + h / 2 + 5}
        textAnchor="middle"
        fontSize={10}
        fontWeight={600}
        fill={p.text}
        fontFamily="system-ui, sans-serif"
        style={{ transition: "fill 0.6s ease" }}
      >
        {id}
      </text>
      {/* Status dot */}
      <circle
        cx={x + w - 11}
        cy={y + 11}
        r={3.5}
        fill={p.dot}
        style={{ transition: "fill 0.6s ease" }}
      >
        {isAnimated ? (
          <animate
            attributeName="opacity"
            values="1;0.3;1"
            dur={status === "active" ? "2.2s" : "1.5s"}
            repeatCount="indefinite"
          />
        ) : null}
      </circle>
    </g>
  );
}

export const FloorPlan = () => {
  const [reduceMotion, setReduceMotion] = useState(false);
  const [statusById, setStatusById] = useState<Record<string, Status>>(() =>
    Object.fromEntries(TABLES.map((t) => [t.id, t.status]))
  );
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduceMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReduceMotion(e.matches);
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);

  useEffect(() => {
    if (reduceMotion) return;
    const advanceRandomTables = () => {
      setStatusById((prev) => {
        const next = { ...prev };
        const ids = TABLES.map((t) => t.id);
        const howMany = 1 + Math.floor(Math.random() * 2);
        const shuffled = [...ids].sort(() => Math.random() - 0.5);
        for (let i = 0; i < howMany && i < shuffled.length; i++) {
          const id = shuffled[i];
          next[id] = nextStatus(next[id]);
        }
        return next;
      });
    };
    const t0 = 2800 + Math.random() * 1800;
    const id = setInterval(advanceRandomTables, t0);
    return () => clearInterval(id);
  }, [reduceMotion]);

  useGSAP(() => {
    if (reduceMotion || !containerRef.current) return;

    const ctx = gsap.context(() => {
      // Container entrance
      gsap.fromTo(containerRef.current,
        { y: 40, opacity: 0, scale: 0.98 },
        {
          y: 0, opacity: 1, scale: 1, duration: 1.2, ease: "power4.out",
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          }
        }
      );

      // Table shapes staggered pop-in
      gsap.fromTo(".floor-table",
        { scale: 0.8, opacity: 0, transformOrigin: "center" },
        {
          scale: 1, opacity: 1, duration: 0.6, ease: "back.out(1.8)", stagger: 0.04,
          scrollTrigger: {
            trigger: containerRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          }
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, { scope: containerRef });

  const active  = TABLES.filter((t) => statusById[t.id] === "active").length;
  const closing = TABLES.filter((t) => statusById[t.id] === "closing").length;
  const open    = TABLES.filter((t) => statusById[t.id] === "open").length;

  return (
    <div
      ref={containerRef}
      className="floor-plan-container overflow-hidden rounded-[18px] border border-wire bg-canvas shadow-[0_32px_64px_-24px_rgba(0,0,0,0.8),0_0_0_1px_rgba(255,255,255,0.03)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between border-b border-wire px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sage opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-sage-deep" />
          </span>
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.3em] text-dim">
            En vivo · Turno nocturno
          </span>
        </div>
        <span className="rounded-full bg-glow/10 px-2.5 py-1 text-[0.58rem] font-bold text-glow">
          18 mesas
        </span>
      </div>

      {/* SVG floor plan */}
      <div className="px-2 pt-2">
        <svg viewBox="0 0 340 312" className="w-full" aria-label="Plano de sala en vivo">
          <defs>
            <pattern id="floorGrid" width="22" height="22" patternUnits="userSpaceOnUse">
              <path
                d="M 22 0 L 0 0 0 22"
                fill="none"
                stroke="rgba(237,232,225,0.04)"
                strokeWidth="0.6"
              />
            </pattern>
          </defs>

          {/* Grid background */}
          <rect width="340" height="312" fill="url(#floorGrid)" />

          {/* Room perimeter */}
          <rect
            x="8" y="8" width="324" height="296"
            rx="6" fill="none"
            stroke="rgba(237,232,225,0.06)" strokeWidth="1"
          />

          {/* Zone separator */}
          <line
            x1="222" y1="16" x2="222" y2="296"
            stroke="rgba(237,232,225,0.07)" strokeWidth="0.8" strokeDasharray="4 3"
          />

          {/* Zone labels */}
          <text x="115" y="302" textAnchor="middle" fontSize={7} fill="rgba(237,232,225,0.18)" letterSpacing="3" fontFamily="system-ui">
            SALÓN
          </text>
          <text x="277" y="302" textAnchor="middle" fontSize={7} fill="rgba(237,232,225,0.18)" letterSpacing="3" fontFamily="system-ui">
            TERRAZA
          </text>

          {/* Tables */}
          {TABLES.map((t) => (
            <TableShape
              key={t.id}
              {...t}
              status={statusById[t.id] ?? t.status}
              reduceMotion={reduceMotion}
            />
          ))}

          {/* Bar — decorative bottom element */}
          <rect
            x="18" y="308" width="0" height="0"
            rx="5" fill="rgba(237,232,225,0.04)"
            stroke="rgba(237,232,225,0.1)" strokeWidth="0.8"
          />
        </svg>
      </div>

      {/* Status footer */}
      <div className="flex items-center justify-between border-t border-wire px-4 py-2.5">
        <div className="flex items-center gap-5">
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-glow" />
            <span className="text-[0.6rem] font-semibold text-dim">{active} activas</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-sage" />
            <span className="text-[0.6rem] font-semibold text-dim">{closing} por cerrar</span>
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-light/20" />
            <span className="text-[0.6rem] font-semibold text-dim">{open} libres</span>
          </span>
        </div>
        <span className="font-serif text-[0.7rem] italic text-dim">21:47</span>
      </div>
    </div>
  );
};
