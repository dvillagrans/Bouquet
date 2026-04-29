"use client";

import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Stage, Layer, Rect, Circle, Text, Group, Path } from "react-konva";
import Konva from "konva";
import { Save, Edit3, Eye, Move, Circle as CircleIcon, Square } from "lucide-react";
import type { DiningTable as Table } from "@/generated/prisma";
import type { TableStatus } from "@/lib/prisma-legacy-types";
import { getSignedGuestPreviewUrl } from "@/actions/tables";
import MesaCapacityPreview from "./MesaCapacityPreview";

/* ── Design tokens (mirrors CSS vars) ─────────────────────────── */
const C = {
  ink:      "#0C0907",
  canvas:   "#131008",
  wire:     "#2C2418",
  wireDim:  "#1F1A0F",
  light:    "#EDE8E1",
  dim:      "#8F8373",
  glow:     "#C9A054",
  sage:     "#6E8B6A",
  ember:    "#A8562A",
  gold:     "#B7925D",
  goldHi:   "#C9A876",
};

const STATUS_FILL: Record<TableStatus, string> = {
  DISPONIBLE: C.sage,
  OCUPADA:    C.glow,
  SUCIA:      C.ember,
  CERRANDO:   C.gold,
};

const STATUS_STROKE: Record<TableStatus, string> = {
  DISPONIBLE: "#8BB887",
  OCUPADA:    "#D4AA5F",
  SUCIA:      "#B85E2A",
  CERRANDO:   C.goldHi,
};

const STATUS_LABEL: Record<TableStatus, string> = {
  DISPONIBLE: "Libre",
  OCUPADA:    "Ocupada",
  SUCIA:      "Sucia",
  CERRANDO:   "Cuenta",
};

const SNAP = 40;      // snap-to-grid resolution
const TABLE_W = 80;   // table rect width/height
const GRID_W = 900;
const GRID_H = 620;

function snap(v: number) {
  return Math.round(v / SNAP) * SNAP;
}

/* ── Dot-grid background ───────────────────────────────────────── */
function DotGrid({ width, height }: { width: number; height: number }) {
  const dots: React.ReactNode[] = [];
  for (let x = 0; x <= width; x += SNAP) {
    for (let y = 0; y <= height; y += SNAP) {
      dots.push(
        <Circle key={`${x}-${y}`} x={x} y={y} radius={1} fill={C.wire} listening={false} />
      );
    }
  }
  return <>{dots}</>;
}

const DotGridMemo = memo(DotGrid);

/* ── Table sizing helpers ──────────────────────────────────────── */
function getTableSize(capacity: number, shape: string): { w: number; h: number } {
  if (shape === "round") {
    const d = capacity <= 2 ? 60 : capacity <= 4 ? 76 : capacity <= 6 ? 92 : 108;
    return { w: d, h: d };
  }
  if (capacity <= 2)  return { w: 64,  h: 64  };
  if (capacity <= 4)  return { w: 80,  h: 80  };
  if (capacity <= 6)  return { w: 108, h: 72  };
  if (capacity <= 8)  return { w: 128, h: 72  };
  if (capacity <= 12) return { w: 152, h: 72  };
  return                     { w: 176, h: 72  };
}

function getSeatPositions(
  capacity: number, w: number, h: number, isRound: boolean
): { x: number; y: number }[] {
  const cx = w / 2, cy = h / 2;

  if (isRound || w === h) {
    const count = Math.min(capacity, isRound ? 10 : 8);
    const orbit = w / 2 + 14;
    return Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * Math.PI * 2 - Math.PI / 2;
      return { x: cx + Math.cos(angle) * orbit, y: cy + Math.sin(angle) * orbit };
    });
  }

  // Rectangular: distribute seats around the perimeter
  const SPACING = 28;
  const OFF = 13;
  const seatsLong  = Math.max(2, Math.floor((w + 4) / SPACING));
  const seatsShort = Math.max(0, Math.floor((h - 8) / SPACING) - 1);
  const positions: { x: number; y: number }[] = [];

  for (let i = 0; i < seatsLong; i++)
    positions.push({ x: w * (i + 0.5) / seatsLong, y: -OFF });
  for (let i = 0; i < seatsLong; i++)
    positions.push({ x: w * (i + 0.5) / seatsLong, y: h + OFF });
  for (let i = 0; i < seatsShort; i++)
    positions.push({ x: -OFF, y: h * (i + 1) / (seatsShort + 1) });
  for (let i = 0; i < seatsShort; i++)
    positions.push({ x: w + OFF, y: h * (i + 1) / (seatsShort + 1) });

  return positions.slice(0, Math.min(capacity, positions.length));
}

/* ── Single table node ─────────────────────────────────────────── */
export type FloorMapTable = Table & {
  readyCount?: number;
  pendingCount?: number;
  activeSession?: { guestName: string; pax: number; createdAt: Date } | null;
};

function useElapsedTime(createdAt: string | Date | undefined) {
  const [elapsed, setElapsed] = useState("");
  
  useEffect(() => {
    if (!createdAt) return;
    const date = new Date(createdAt);
    
    const update = () => {
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) {
        setElapsed(`${diffMins}m`);
      } else {
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        setElapsed(`${h}h ${m}m`);
      }
    };
    
    update();
    const id = setInterval(update, 60000);
    return () => clearInterval(id);
  }, [createdAt]);
  
  return elapsed;
}

interface TableNodeProps {
  table: FloorMapTable;
  editMode: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
  showSeatGlyphs?: boolean;
}

function TableNode({ table, editMode, selected, onSelect, onDragEnd, showSeatGlyphs = true }: TableNodeProps) {
  const isSelected  = selected === table.id;
  const fill        = STATUS_FILL[table.status as TableStatus];
  const stroke      = STATUS_STROKE[table.status as TableStatus];
  const isRound     = table.shape === "round";

  const { w, h }    = getTableSize(table.capacity, table.shape);
  const cx          = w / 2;
  const cy          = h / 2;
  const seatR       = Math.max(3.5, Math.min(5.5, 3.5 + (w - 64) * 0.016));
  const seatPositions = getSeatPositions(table.capacity, w, h, isRound);
  const cornerR     = Math.max(12, Math.min(20, w * 0.18));
  const fontSize    = w >= 128 ? 22 : w >= 104 ? 20 : 18;

  const isOccupied  = table.status === "OCUPADA" || table.status === "CERRANDO";
  const elapsed     = useElapsedTime(table.activeSession?.createdAt);
  const needsAttention = (table.readyCount ?? 0) > 0;

  const textY = isOccupied && elapsed ? cy - fontSize - 2 : cy - fontSize / 2 - 1;

  const ringRef = useRef<Konva.Circle>(null);

  useEffect(() => {
    const node = ringRef.current;
    if (!node || !needsAttention) return;
    const anim = new Konva.Animation((frame) => {
      if (!frame) return;
      const phase = ((frame.time / 1000) % 1.5) / 1.5;
      node.scale({ x: 1 + phase * 0.35, y: 1 + phase * 0.35 });
      node.opacity(1 - phase);
    }, node.getLayer());
    anim.start();
    return () => {
      anim.stop();
      if (node) { node.scale({ x: 1, y: 1 }); node.opacity(0); }
    };
  }, [needsAttention]);

  const handleDragEnd = (e: Konva.KonvaEventObject<DragEvent>) => {
    const x = snap(e.target.x());
    const y = snap(e.target.y());
    e.target.position({ x, y });
    onDragEnd(table.id, x, y);
  };

  const sharedGroupProps = {
    x: table.posX,
    y: table.posY,
    draggable: editMode,
    onClick: () => onSelect(isSelected ? null : table.id),
    onTap:    () => onSelect(isSelected ? null : table.id),
    onDragEnd: handleDragEnd,
  };

  const bodyGrad = {
    fillLinearGradientStartPoint: { x: 0, y: 0 },
    fillLinearGradientEndPoint:   { x: w, y: h },
    fillLinearGradientColorStops: [0, fill + "2E", 0.48, "#0F0F0FEB", 1, "#00000088"] as (string | number)[],
  };

  return (
    <Group {...sharedGroupProps}>
      {/* Selection ring */}
      {isSelected && (
        isRound ? (
          <Circle x={cx} y={cy} radius={cx + 11}
            stroke={fill} strokeWidth={1.5} opacity={0.4} dash={[3, 5]} listening={false} />
        ) : (
          <Rect x={-9} y={-9} width={w + 18} height={h + 18} cornerRadius={cornerR + 8}
            stroke={fill} strokeWidth={1.5} opacity={0.4} dash={[3, 5]} listening={false} />
        )
      )}

      {/* Table body */}
      {isRound ? (
        <>
          <Circle x={cx} y={cy} radius={cx}
            {...bodyGrad} stroke={stroke}
            strokeWidth={isSelected ? 2 : 1.5}
            shadowColor={fill} shadowBlur={isSelected ? 24 : 10} shadowOpacity={isSelected ? 0.5 : 0.22} />
          <Circle x={cx} y={cy} radius={cx * 0.68}
            fill="#00000040" stroke="#FFFFFF0E" strokeWidth={0.8} listening={false} />
        </>
      ) : (
        <>
          <Rect width={w} height={h} cornerRadius={cornerR}
            {...bodyGrad} stroke={stroke}
            strokeWidth={isSelected ? 2 : 1.5}
            shadowColor={fill} shadowBlur={isSelected ? 24 : 10} shadowOpacity={isSelected ? 0.5 : 0.22} />
          <Rect
            x={w * 0.10} y={h * 0.12}
            width={w * 0.80} height={h * 0.76}
            cornerRadius={Math.max(7, cornerR - 5)}
            fill="#00000040" stroke="#FFFFFF0E" strokeWidth={0.8} listening={false} />
        </>
      )}

      {/* Seat dots */}
      {showSeatGlyphs && seatPositions.map(({ x, y }, i) => (
        <Circle key={i} x={x} y={y} radius={seatR}
          fillLinearGradientStartPoint={{ x: -seatR, y: -seatR }}
          fillLinearGradientEndPoint={{ x: seatR, y: seatR }}
          fillLinearGradientColorStops={[0, fill + "E6", 1, fill + "66"] as (string | number)[]}
          stroke={stroke + "80"} strokeWidth={0.8}
          shadowColor={fill} shadowBlur={10} shadowOpacity={0.55}
          listening={false} />
      ))}

      {/* Pulse ring */}
      {needsAttention && (
        <Circle ref={ringRef} x={cx} y={cy} radius={Math.max(cx, cy)}
          stroke="#4ADE80" strokeWidth={4} listening={false} />
      )}

      {/* Table number */}
      <Text x={0} y={textY} width={w} align="center"
        text={String(table.number)}
        fontSize={isOccupied && elapsed ? fontSize + 2 : fontSize}
        fontStyle="bold" fontFamily="serif"
        fill={C.light} shadowColor="#000000" shadowBlur={6} shadowOpacity={0.8}
        listening={false} />

      {/* Elapsed time */}
      {isOccupied && elapsed && (
        <Text x={0} y={cy + 4} width={w} align="center"
          text={elapsed} fontSize={11} fontStyle="bold" fontFamily="monospace"
          fill={C.dim} shadowColor="#000000" shadowBlur={4} shadowOpacity={0.8}
          listening={false} />
      )}

      {/* Status dot */}
      {(!isOccupied || !elapsed) && (
        <Circle x={cx} y={cy + Math.max(9, h * 0.13)} radius={3}
          fill={fill} shadowColor={fill} shadowBlur={8} shadowOpacity={0.75}
          listening={false} />
      )}

      {/* Bell badge */}
      {needsAttention && (
        <Group x={w - 14} y={-4} listening={false}>
          <Circle radius={14} fill="#4ADE80" shadowColor="#4ADE80" shadowBlur={10} shadowOpacity={0.6} />
          <Path x={-9} y={-9}
            data="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"
            fill="#0F172A" scale={{ x: 0.75, y: 0.75 }} />
        </Group>
      )}
    </Group>
  );
}

const MemoizedTableNode = memo(
  TableNode,
  (prev, next) => {
    if (prev.table !== next.table) return false;
    if (prev.editMode !== next.editMode) return false;
    if (prev.onSelect !== next.onSelect) return false;
    if (prev.onDragEnd !== next.onDragEnd) return false;
    if (prev.showSeatGlyphs !== next.showSeatGlyphs) return false;

    const prevIsSelected = prev.selected === prev.table.id;
    const nextIsSelected = next.selected === next.table.id;
    return prevIsSelected === nextIsSelected;
  }
);

/* ── Live instrument panel ─────────────────────────────────────── */
function StatusPill({
  label,
  color,
  count,
  delay,
  emphasize,
}: {
  label: string;
  color: string;
  count: number;
  delay: number;
  emphasize?: boolean;
}) {
  return (
    <div
      className="group relative flex flex-1 items-center gap-3 rounded-xl px-4 py-3 transition-all"
      style={{
        background: `${color}0C`,
        border: `1px solid ${color}22`,
        animation: `reveal-up 0.55s ${delay}s cubic-bezier(0.22,1,0.36,1) both`,
      }}
    >
      <span className="relative flex size-2 shrink-0">
        <span
          aria-hidden
          className="absolute inline-flex size-full rounded-full opacity-60"
          style={{
            backgroundColor: color,
            animation: emphasize
              ? "ping 0.9s cubic-bezier(0,0,0.2,1) infinite"
              : "ping 2.2s cubic-bezier(0,0,0.2,1) infinite",
            animationDelay: `${delay}s`,
          }}
        />
        <span
          className="relative inline-flex size-2 rounded-full"
          style={{ backgroundColor: color }}
        />
      </span>
      <div className="min-w-0">
        <p
          className="font-serif text-[1.5rem] font-semibold tabular-nums leading-none"
          style={{ color, textShadow: `0 0 20px ${color}50` }}
        >
          {count.toString().padStart(2, "0")}
        </p>
        <p className="mt-1 text-[0.54rem] font-bold uppercase tracking-[0.22em] text-dim group-hover:text-dim/80 transition-colors">
          {label}
        </p>
      </div>
    </div>
  );
}

function LiveBadge() {
  return (
    <div className="flex shrink-0 items-center gap-3">
      <span className="relative flex size-2.5 items-center justify-center">
        <span
          aria-hidden
          className="absolute inline-flex size-full rounded-full bg-ember opacity-60"
          style={{ animation: "ping 1.4s cubic-bezier(0,0,0.2,1) infinite" }}
        />
        <span className="relative inline-flex size-2.5 rounded-full bg-ember shadow-[0_0_8px_rgba(168,86,42,0.8)]" />
      </span>
      <div className="flex flex-col leading-none">
        <span className="font-mono text-[0.5rem] font-bold uppercase tracking-[0.36em] text-ember">
          Live
        </span>
        <span className="mt-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-light/55">
          Plano de sala
        </span>
      </div>
    </div>
  );
}

function SyncClock() {
  const [clock, setClock] = useState<string | null>(null);
  useEffect(() => {
    const tick = () =>
      setClock(
        new Date().toLocaleTimeString("es-MX", {
          hour: "2-digit",
          minute: "2-digit",
          hour12: false,
        })
      );
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);
  return (
    <div className="hidden flex-col items-end md:flex">
      <span className="font-mono text-[0.48rem] font-bold uppercase tracking-[0.3em] text-dim/60">
        Sync
      </span>
      <span className="mt-0.5 font-mono text-[0.9rem] font-semibold tabular-nums text-light/70">
        {clock ?? "--:--"}
      </span>
    </div>
  );
}

function EditButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={[
        "group inline-flex h-9 items-center gap-2 rounded-xl px-5 text-[0.68rem] font-bold uppercase tracking-[0.18em] transition-all hover:-translate-y-px active:translate-y-0",
        active
          ? "border border-wire/60 bg-wire/30 text-dim hover:border-light/20 hover:text-light"
          : "border border-glow/30 bg-glow/[0.08] text-glow hover:border-glow/55 hover:bg-glow/[0.14] hover:shadow-[0_0_24px_-4px_rgba(201,160,84,0.45)]",
      ].join(" ")}
    >
      {active ? (
        <>
          <Eye className="h-3.5 w-3.5" /> Ver plano
        </>
      ) : (
        <>
          <Edit3 className="h-3.5 w-3.5 transition-transform group-hover:rotate-[-6deg]" />
          Editar
        </>
      )}
    </button>
  );
}

function OperationsBar({
  tables,
  readOnly,
  editMode,
  saving,
  saved,
  onToggleEdit,
  onSave,
}: {
  tables: FloorMapTable[];
  readOnly: boolean;
  editMode: boolean;
  saving: boolean;
  saved: boolean;
  onToggleEdit: () => void;
  onSave: () => void;
}) {
  const counts = useMemo(() => {
    let disponible = 0;
    let ocupada = 0;
    let sucia = 0;
    for (const t of tables) {
      if (t.status === "DISPONIBLE") disponible++;
      else if (t.status === "OCUPADA" || t.status === "CERRANDO") ocupada++;
      else if (t.status === "SUCIA") sucia++;
    }
    return { disponible, ocupada, sucia };
  }, [tables]);

  return (
    <div
      className="relative flex flex-col gap-3 overflow-hidden rounded-2xl border border-wire/50 bg-ink/75 px-5 py-4 shadow-[0_4px_32px_-8px_rgba(0,0,0,0.6)] backdrop-blur-xl sm:flex-row sm:items-center sm:gap-4"
      style={{ animation: "fade-in 0.5s ease-out both" }}
    >
      {/* Subtle gold glow from left */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: "radial-gradient(ellipse 60% 120% at 0% 50%, rgba(201,160,84,0.06), transparent 65%)",
        }}
      />
      {/* Hairline top border */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-8 top-0 h-px"
        style={{
          background:
            "linear-gradient(90deg, transparent 0%, rgba(201,160,84,0.5) 25%, rgba(237,232,225,0.25) 50%, rgba(201,160,84,0.5) 75%, transparent 100%)",
          animation: "draw-line 1s cubic-bezier(0.22,1,0.36,1) both",
        }}
      />

      {/* Live badge */}
      <LiveBadge />

      {/* Divider */}
      <div className="hidden h-8 w-px shrink-0 bg-wire/50 sm:block" aria-hidden />

      {/* Stats */}
      <div className="flex flex-1 gap-2">
        <StatusPill label="Disponibles" color={C.sage} count={counts.disponible} delay={0.05} />
        <StatusPill label="Ocupadas" color={C.glow} count={counts.ocupada} delay={0.15} />
        <StatusPill
          label="Por limpiar"
          color={C.ember}
          count={counts.sucia}
          delay={0.25}
          emphasize={counts.sucia > 0}
        />
      </div>

      {/* Right: clock + controls */}
      <div className="flex items-center gap-3">
        <SyncClock />

        {!readOnly && (
          <>
            {/* Divider */}
            <div className="hidden h-8 w-px shrink-0 bg-wire/50 md:block" aria-hidden />
            <div className="flex items-center gap-2">
              {editMode && (
                <>
                  <p
                    className="hidden text-[0.6rem] font-semibold uppercase tracking-[0.18em] text-glow/65 lg:block"
                    style={{ animation: "fade-in 0.3s ease-out both" }}
                  >
                    Arrastra para mover
                  </p>
                  <button
                    onClick={onSave}
                    disabled={saving}
                    className="inline-flex h-9 items-center gap-2 rounded-xl bg-light px-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink transition-all hover:-translate-y-px hover:bg-light/90 disabled:opacity-50"
                  >
                    <Save className="h-3.5 w-3.5" />
                    {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar"}
                  </button>
                </>
              )}
              <EditButton active={editMode} onClick={onToggleEdit} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */

interface FloorMapProps {
  tables: FloorMapTable[];
  readOnly?: boolean;
  onTableClick?: (tableId: string) => void;
  /** Mostrar puntos de capacidad alrededor de cada mesa (mapa mesero). */
  showSeatGlyphs?: boolean;
  showOperationsBar?: boolean;
}

export default function FloorMap({
  tables: initialTables,
  readOnly = false,
  onTableClick,
  showSeatGlyphs = true,
  showOperationsBar = true,
}: FloorMapProps) {
  const [tables, setTables]     = useState<FloorMapTable[]>(initialTables);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);
  const prefersReducedMotion = useReducedMotion();

  // Sync when parent refreshes table data (e.g. waiter polling)
  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const layoutBounds = useMemo(() => {
    if (tables.length === 0) {
      return { logicalWidth: GRID_W, logicalHeight: GRID_H, marginX: 0, marginY: 0, actualMaxX: GRID_W, actualMaxY: GRID_H };
    }

    let minX = Infinity;
    let minY = Infinity;
    let maxX = 0;
    let maxY = 0;

    for (const t of tables) {
      if (t.posX < minX) minX = t.posX;
      if (t.posY < minY) minY = t.posY;
      if (t.posX > maxX) maxX = t.posX;
      if (t.posY > maxY) maxY = t.posY;
    }

    // Compute the actual right/bottom edge of the farthest table
    let farX = 0, farY = 0;
    for (const t of tables) {
      const { w: tw, h: th } = getTableSize(t.capacity, t.shape);
      if (t.posX + tw > farX) farX = t.posX + tw;
      if (t.posY + th > farY) farY = t.posY + th;
    }

    if (!readOnly) {
      const w = Math.max(GRID_W, farX + 80);
      const h = Math.max(GRID_H, farY + 80);
      return { logicalWidth: w, logicalHeight: h, marginX: 0, marginY: 0, actualMaxX: w, actualMaxY: h };
    }

    const PADDING_X = 80;
    const PADDING_Y = 80;

    const marginX = Math.max(0, minX - PADDING_X);
    const marginY = Math.max(0, minY - PADDING_Y);

    const actualMaxX = farX + PADDING_X;
    const actualMaxY = Math.max(farY + PADDING_Y + 40, marginY + 280); 
    // enforced a min bound for extreme cases

    const contentW = actualMaxX - marginX;
    const contentH = actualMaxY - marginY;

    return {
      logicalWidth: contentW,
      logicalHeight: contentH,
      marginX,
      marginY,
      actualMaxX,
      actualMaxY
    };
  }, [tables, readOnly]);

  const containerRef            = useRef<HTMLDivElement>(null);
  const [scale, setScale]       = useState(1);

  // Track pending position updates
  const pendingRef = useRef<Map<string, { posX: number; posY: number }>>(new Map());

  // Responsive scale
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const updateScale = () => {
      const s = Math.min(1, (el.clientWidth - 2) / layoutBounds.logicalWidth);
      setScale(s);
    };
    const obs = new ResizeObserver(updateScale);
    obs.observe(el);
    updateScale(); // call immediately after mount
    return () => obs.disconnect();
  }, [layoutBounds.logicalWidth]);

  const handleDragEnd = useCallback((id: string, x: number, y: number) => {
    setTables(prev =>
      prev.map(t => t.id === id ? { ...t, posX: x, posY: y } : t)
    );
    pendingRef.current.set(id, { posX: x, posY: y });
  }, []);

  const handleSave = async () => {
    if (pendingRef.current.size === 0) {
      setEditMode(false);
      return;
    }
    setSaving(true);
    const positions = Array.from(pendingRef.current.entries()).map(
      ([id, pos]) => ({ id, ...pos })
    );
    // Defer importing the (server action) until the user saves.
    const { updateTablePositions } = await import("@/actions/tables");
    await updateTablePositions(positions);
    pendingRef.current.clear();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setEditMode(false);
  };

  const handleShapeToggle = async (id: string, currentShape: string) => {
    const newShape = currentShape === "round" ? "rect" : "round";
    const current = tables.find(t => t.id === id);
    if (!current) return;

    setTables(prev =>
      prev.map(t => t.id === id ? { ...t, shape: newShape } : t)
    );
    const { updateTablePositions } = await import("@/actions/tables");
    await updateTablePositions([{
      id,
      posX: current.posX,
      posY: current.posY,
      shape: newShape,
    }]);
  };

  const selectedTable = selected ? tables.find(t => t.id === selected) : null;

  const handleTableSelect = (id: string | null) => {
    setSelected(id);
    if (id && onTableClick && !editMode) {
      onTableClick(id);
    }
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Operations instrument panel ─────────────────────────── */}
      {showOperationsBar ? (
        <OperationsBar
          tables={tables}
          readOnly={readOnly}
          editMode={editMode}
          saving={saving}
          saved={saved}
          onSave={handleSave}
          onToggleEdit={() => {
            if (editMode) handleSave();
            else {
              setEditMode(true);
              setSelected(null);
            }
          }}
        />
      ) : null}

      {/* ── Canvas ─────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-wire/40 shadow-[0_8px_40px_-12px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(237,232,225,0.03)]"
        style={{ height: layoutBounds.logicalHeight * scale + 2 }}
      >
        <Stage
          width={layoutBounds.logicalWidth * scale}
          height={layoutBounds.logicalHeight * scale}
          scaleX={scale}
          scaleY={scale}
          offsetX={layoutBounds.marginX}
          offsetY={layoutBounds.marginY}
          style={{ display: "block", aspectRatio: `${layoutBounds.logicalWidth} / ${layoutBounds.logicalHeight}` }}
          onClick={(e) => {
            if (e.target === e.target.getStage()) setSelected(null);
          }}
        >
          <Layer>
            {/* Background */}
            <Rect
              x={layoutBounds.marginX}
              y={layoutBounds.marginY}
              width={layoutBounds.logicalWidth}
              height={layoutBounds.logicalHeight}
              fill={C.canvas}
              listening={false}
            />

            {/* Dot grid */}
            <Group x={layoutBounds.marginX} y={layoutBounds.marginY}>
              <DotGridMemo width={layoutBounds.logicalWidth} height={layoutBounds.logicalHeight} />
            </Group>

            {/* Room border */}
            <Rect
              x={layoutBounds.marginX + 20} y={layoutBounds.marginY + 20}
              width={layoutBounds.logicalWidth - 40}
              height={layoutBounds.logicalHeight - 40}
              stroke={C.wire}
              strokeWidth={1}
              fill="transparent"
              dash={[4, 8]}
              opacity={0.5}
              listening={false}
            />

            {/* Tables */}
            {tables.map(table => (
              <MemoizedTableNode
                key={table.id}
                table={table}
                editMode={!readOnly && editMode}
                selected={selected}
                onSelect={handleTableSelect}
                onDragEnd={handleDragEnd}
                showSeatGlyphs={showSeatGlyphs}
              />
            ))}
          </Layer>
        </Stage>

        {/* Edit mode overlay hint */}
        {editMode && (
          <div
            className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2"
            style={{ animation: "fade-in 0.3s ease-out both" }}
          >
            <div className="flex items-center gap-2 rounded-full border border-glow/25 bg-ink/85 px-4 py-2 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.6)] backdrop-blur-md">
              <Move className="h-3 w-3 text-glow/80" />
              <p className="text-[0.62rem] font-semibold uppercase tracking-[0.18em] text-glow/75">
                Modo edición — arrastra para mover
              </p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {selectedTable && !editMode && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 8 }}
            transition={{ type: "spring", damping: 20, stiffness: 280 }}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-wire/40 bg-ink/60 px-5 py-4 backdrop-blur-md shadow-[0_4px_24px_-8px_rgba(0,0,0,0.5)]"
          >
          <div className="flex flex-wrap items-center gap-5 sm:gap-6">
            <div className="flex shrink-0 items-center gap-3 sm:gap-4">
              <MesaCapacityPreview
                capacity={selectedTable.capacity}
                reduceMotion={prefersReducedMotion}
                scale={0.62}
              />
              <div className="border-l border-wire/50 pl-3 sm:pl-4">
                <p className="text-[0.52rem] font-bold uppercase tracking-[0.38em] text-dim">Capacidad</p>
                <p className="mt-0.5 font-serif text-xl font-semibold tabular-nums leading-none text-light sm:text-2xl">
                  {selectedTable.capacity}
                </p>
                <p className="mt-0.5 text-[0.62rem] text-dim">asientos</p>
              </div>
            </div>
            <div>
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.38em] text-dim">Mesa</p>
              <p className="font-serif text-[2rem] font-semibold leading-none text-light">
                {selectedTable.number}
              </p>
            </div>
            <div>
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.38em] text-dim">Estado</p>
              <p
                className="mt-0.5 text-[0.75rem] font-semibold"
                style={{ color: STATUS_FILL[selectedTable.status as TableStatus] }}
              >
                {STATUS_LABEL[selectedTable.status as TableStatus]}
              </p>
            </div>
            <div className="min-w-0">
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.38em] text-dim">Código QR</p>
              <p className="mt-0.5 truncate font-mono text-[0.75rem] font-semibold text-light/40">
                {selectedTable.publicCode}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {readOnly ? (
              <>
                {onTableClick ? (
                  <button
                    type="button"
                    onClick={() => onTableClick(selectedTable.id)}
                    className="inline-flex h-9 items-center gap-2 rounded-xl border border-glow/35 bg-glow/[0.1] px-4 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-glow transition-all hover:border-glow/55 hover:bg-glow/[0.18] hover:shadow-[0_0_18px_-4px_rgba(201,160,84,0.35)]"
                  >
                    <Eye className="h-3.5 w-3.5" />
                    Abrir mesa
                  </button>
                ) : null}
                <button
                  type="button"
                  onClick={() =>
                    void (async () => {
                      try {
                        const url = await getSignedGuestPreviewUrl(selectedTable.publicCode);
                        window.open(url, "_blank", "noopener,noreferrer");
                      } catch {
                        alert("No se pudo abrir la vista de comensal.");
                      }
                    })()
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-wire/50 px-4 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-dim transition-colors hover:border-light/20 hover:text-light"
                >
                  Ver menú
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => handleShapeToggle(selectedTable.id, selectedTable.shape)}
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-wire/50 px-4 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-dim transition-colors hover:border-light/20 hover:text-light"
                  title="Cambiar forma"
                >
                  {selectedTable.shape === "round"
                    ? <><Square className="h-3.5 w-3.5" /> Cuadrada</>
                    : <><CircleIcon className="h-3.5 w-3.5" /> Redonda</>
                  }
                </button>
                <button
                  type="button"
                  onClick={() =>
                    void (async () => {
                      try {
                        const url = await getSignedGuestPreviewUrl(selectedTable.publicCode);
                        window.open(url, "_blank", "noopener,noreferrer");
                      } catch {
                        alert("No se pudo abrir la vista de comensal.");
                      }
                    })()
                  }
                  className="inline-flex h-9 items-center gap-2 rounded-xl border border-wire/50 px-4 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-dim transition-colors hover:border-light/20 hover:text-light"
                >
                  Ver menú
                </button>
              </>
            )}
          </div>
        </motion.div>
      )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedTable && editMode && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex items-center justify-between rounded-2xl border border-glow/20 bg-glow/[0.04] px-5 py-3 backdrop-blur-md"
          >
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-glow/80">
            Mesa {selectedTable.number} seleccionada
          </p>
          <button
            onClick={() => handleShapeToggle(selectedTable.id, selectedTable.shape)}
            className="inline-flex h-8 items-center gap-2 rounded-xl border border-glow/30 px-4 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-glow transition-colors hover:bg-glow/10"
          >
            {selectedTable.shape === "round"
              ? <><Square className="h-3.5 w-3.5" /> Cambiar a cuadrada</>
              : <><CircleIcon className="h-3.5 w-3.5" /> Cambiar a redonda</>
            }
          </button>
        </motion.div>
      )}
      </AnimatePresence>
    </div>
  );
}
