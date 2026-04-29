"use client";

import { memo, useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { FloorMapTable } from "@/components/dashboard/FloorMap";
import type { TableStatus } from "@/lib/prisma-legacy-types";

/* ── Design tokens (matches Konva map + dashboard theme) ────────── */

const STATUS_COLOR: Record<TableStatus, string> = {
  DISPONIBLE: "var(--color-dash-green)",
  OCUPADA:    "var(--color-gold)",
  SUCIA:      "var(--color-dash-red)",
  CERRANDO:   "var(--color-gold)",
};

const STATUS_TINT: Record<TableStatus, string> = {
  DISPONIBLE: "rgba(77, 132, 96, 0.14)",
  OCUPADA:    "rgba(201, 160, 84, 0.12)",
  SUCIA:      "rgba(160, 64, 64, 0.16)",
  CERRANDO:   "rgba(201, 160, 84, 0.16)",
};

const STATUS_BORDER: Record<TableStatus, string> = {
  DISPONIBLE: "rgba(77, 132, 96, 0.35)",
  OCUPADA:    "rgba(201, 160, 84, 0.30)",
  SUCIA:      "rgba(160, 64, 64, 0.40)",
  CERRANDO:   "rgba(201, 160, 84, 0.38)",
};

const STATUS_GLOW: Record<TableStatus, string> = {
  DISPONIBLE: "rgba(77, 132, 96, 0.20)",
  OCUPADA:    "rgba(201, 160, 84, 0.18)",
  SUCIA:      "rgba(160, 64, 64, 0.25)",
  CERRANDO:   "rgba(201, 160, 84, 0.22)",
};

const STATUS_LABEL: Record<TableStatus, string> = {
  DISPONIBLE: "Libre",
  OCUPADA:    "Activa",
  SUCIA:      "Limpiar",
  CERRANDO:   "Cuenta",
};

/* ── Sizing helpers (matches Konva getTableSize for proportional mapping) ── */
function getTableFootprint(capacity: number, shape: string): { w: number; h: number } {
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

/* ── Elapsed time hook ────────────────────────────────────────────── */
function useElapsedTime(createdAt: Date | string | undefined) {
  const [elapsed, setElapsed] = useState("");

  useEffect(() => {
    if (!createdAt) { setElapsed(""); return; }
    const date = new Date(createdAt);

    const update = () => {
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 60) {
        setElapsed(`${diffMins}m`);
      } else {
        const h = Math.floor(diffMins / 60);
        const m = diffMins % 60;
        setElapsed(`${h}h${m > 0 ? ` ${m}m` : ""}`);
      }
    };

    update();
    const id = setInterval(update, 30_000);
    return () => clearInterval(id);
  }, [createdAt]);

  return elapsed;
}

/* ── Single table chip ────────────────────────────────────────────── */
interface MobileTableChipProps {
  table: FloorMapTable;
  left: number;
  top: number;
  chipSize: number;
  delay: number;
  onTap: (id: string) => void;
  selectionMode?: boolean;
  isSelected?: boolean;
  isDisabled?: boolean;
  label?: string;
  isGroup?: boolean;
}

const MobileTableChip = memo(function MobileTableChip({
  table,
  left,
  top,
  chipSize,
  delay,
  onTap,
  selectionMode = false,
  isSelected = false,
  isDisabled = false,
  label,
  isGroup = false,
}: MobileTableChipProps) {
  const isOccupied = table.status === "OCUPADA" || table.status === "CERRANDO";
  const elapsed = useElapsedTime(table.activeSession?.createdAt);
  const needsAttention = (table.readyCount ?? 0) > 0;
  const pendingCount = table.pendingCount ?? 0;

  const color = STATUS_COLOR[table.status];
  const tint = STATUS_TINT[table.status];
  const border = STATUS_BORDER[table.status];
  const glow = STATUS_GLOW[table.status];

  const isRound = table.shape === "round";

  return (
    <motion.button
      type="button"
      onClick={() => onTap(table.id)}
      initial={{ opacity: 0, scale: 0.7 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 25,
        delay: delay,
      }}
      whileTap={{ scale: 0.92 }}
      className="absolute flex flex-col items-center justify-center px-1"
      style={{
        left,
        top,
        width: isGroup ? chipSize * 1.5 : chipSize,
        height: chipSize,
        borderRadius: isGroup ? "32px" : isRound ? "50%" : "16px",
        background: tint,
        border: `1.5px solid`,
        borderColor: border,
        boxShadow: isSelected
          ? `0 0 20px rgba(201,160,84,0.4), 0 0 40px rgba(201,160,84,0.2), inset 0 1px 0 rgba(237,232,225,0.04)`
          : needsAttention
            ? `0 0 20px ${glow}, 0 0 40px ${glow}, inset 0 1px 0 rgba(237,232,225,0.04)`
            : `0 4px 16px rgba(0,0,0,0.35), inset 0 1px 0 rgba(237,232,225,0.04)`,
        outline: isSelected ? "2px solid var(--color-gold)" : "none",
        outlineOffset: 2,
        opacity: selectionMode && isDisabled ? 0.35 : 1,
        filter: selectionMode && isDisabled ? "grayscale(0.6)" : "none",
        transform: "translate(-50%, -50%)",
        touchAction: "manipulation",
        WebkitTapHighlightColor: "transparent",
      }}
      aria-label={`Mesa ${table.number} — ${STATUS_LABEL[table.status]}`}
    >
      {/* Urgency badge — platos listos (top-right overlay) */}
      {needsAttention && (
        <span
          className="absolute flex items-center justify-center"
          style={{
            top: isRound ? -2 : -4,
            right: isRound ? -2 : -4,
            width: 22,
            height: 22,
            borderRadius: "50%",
            background: "var(--color-dash-green)",
            boxShadow: "0 0 10px rgba(77,132,96,0.6), 0 2px 6px rgba(0,0,0,0.4)",
            animation: "waiter-chip-pulse 1.5s ease-in-out infinite",
            zIndex: 10,
          }}
        >
          <span
            className="font-mono font-bold text-bg-solid"
            style={{ fontSize: 10, lineHeight: 1 }}
          >
            {table.readyCount}
          </span>
        </span>
      )}

      {/* Pending badge — en cocina (top-left, subtle) */}
      {pendingCount > 0 && !needsAttention && (
        <span
          className="absolute flex items-center justify-center"
          style={{
            top: isRound ? -2 : -4,
            left: isRound ? -2 : -4,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "rgba(201,160,84,0.25)",
            border: "1px solid rgba(201,160,84,0.4)",
            zIndex: 10,
          }}
        >
          <span
            className="font-mono font-bold"
            style={{ fontSize: 9, lineHeight: 1, color: "var(--color-gold)" }}
          >
            {pendingCount}
          </span>
        </span>
      )}

      {/* Line 1: Number + status dot */}
      <div className="flex items-center gap-1.5">
        <span
          className="shrink-0 rounded-full"
          style={{
            width: 6,
            height: 6,
            background: color,
            boxShadow: `0 0 6px ${color}`,
          }}
          aria-hidden
        />
        <span
          className="font-semibold tabular-nums leading-none"
          style={{
            fontSize: isGroup ? (chipSize >= 72 ? 18 : 14) : (chipSize >= 72 ? 22 : 18),
            color: "var(--color-light)",
            textShadow: "0 1px 4px rgba(0,0,0,0.6)",
          }}
        >
          {label ?? table.number}
        </span>
      </div>

      {/* Line 2: Elapsed time (only for occupied) */}
      {isOccupied && elapsed && (
        <span
          className="font-mono font-bold tabular-nums leading-none"
          style={{
            fontSize: 10,
            marginTop: 3,
            color: "var(--color-text-muted)",
            letterSpacing: "0.04em",
          }}
        >
          {elapsed}
        </span>
      )}

      {/* Status label for non-occupied */}
      {!isOccupied && (
        <span
          className="font-mono font-bold uppercase leading-none"
          style={{
            fontSize: 8,
            marginTop: 3,
            color: color,
            letterSpacing: "0.1em",
            opacity: 0.85,
          }}
        >
          {STATUS_LABEL[table.status]}
        </span>
      )}

      {/* Pulse ring for attention */}
      {needsAttention && (
        <span
          className="pointer-events-none absolute inset-0"
          style={{
            borderRadius: isRound ? "50%" : "16px",
            border: "2px solid var(--color-dash-green)",
            animation: "waiter-chip-ring 1.8s ease-out infinite",
          }}
          aria-hidden
        />
      )}
    </motion.button>
  );
});

/* ── Main component ───────────────────────────────────────────────── */
interface WaiterMobileFloorMapProps {
  tables: FloorMapTable[];
  onTableClick?: (tableId: string) => void;
  selectionMode?: boolean;
  selectedIds?: string[];
  disabledIds?: string[];
}

export default function WaiterMobileFloorMap({
  tables,
  onTableClick,
  selectionMode = false,
  selectedIds = [],
  disabledIds = [],
}: WaiterMobileFloorMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerSize, setContainerSize] = useState<{ w: number; h: number } | null>(null);

  // Observe container size
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      setContainerSize({ w: el.clientWidth, h: el.clientHeight });
    };
    const obs = new ResizeObserver(update);
    obs.observe(el);
    update();
    return () => obs.disconnect();
  }, []);

  // Compute layout: uniform scale with proper bounds
  const layout = useMemo(() => {
    if (!containerSize || tables.length === 0) return null;

    const PADDING = 40; // px padding inside container
    const MIN_CHIP = 56;
    const MAX_CHIP = 80;

    // 1. Find the bounding box of all tables (using center points)
    let minX = Infinity, minY = Infinity;
    let maxX = -Infinity, maxY = -Infinity;

    for (const t of tables) {
      const fp = getTableFootprint(t.capacity, t.shape);
      const cx = t.posX + fp.w / 2;
      const cy = t.posY + fp.h / 2;
      if (cx < minX) minX = cx;
      if (cy < minY) minY = cy;
      if (cx > maxX) maxX = cx;
      if (cy > maxY) maxY = cy;
    }

    // Bounds of the spatial layout (center-to-center)
    const boundsW = maxX - minX || 1;
    const boundsH = maxY - minY || 1;

    // 2. Available space inside container (minus padding and half a chip on each side)
    const availW = containerSize.w - PADDING * 2 - MAX_CHIP;
    const availH = containerSize.h - PADDING * 2 - MAX_CHIP;

    // 3. Uniform scale factor — same for both axes to preserve proportions
    const scaleX = availW / boundsW;
    const scaleY = availH / boundsH;
    const scale = Math.min(scaleX, scaleY);

    // 4. Compute final positions (centered in container)
    const scaledW = boundsW * scale;
    const scaledH = boundsH * scale;
    const offsetX = (containerSize.w - scaledW) / 2;
    const offsetY = (containerSize.h - scaledH) / 2;

    // For single table, center it
    if (tables.length === 1) {
      return tables.map((t) => ({
        table: t,
        left: containerSize.w / 2,
        top: containerSize.h / 2,
        chipSize: Math.min(MAX_CHIP, Math.max(MIN_CHIP, 72)),
        label: undefined as string | undefined,
        isGroup: false,
      }));
    }

    const initialLayout = tables.map((t) => {
      const fp = getTableFootprint(t.capacity, t.shape);
      const cx = t.posX + fp.w / 2;
      const cy = t.posY + fp.h / 2;

      const left = offsetX + (cx - minX) * scale;
      const top = offsetY + (cy - minY) * scale;

      // Chip size: slightly larger for bigger capacity tables
      const chipSize = Math.min(MAX_CHIP, Math.max(MIN_CHIP, 56 + t.capacity * 2));

      return { table: t, left, top, chipSize, label: undefined as string | undefined, isGroup: false };
    });

    const groupedLayout: typeof initialLayout = [];
    const groupMap = new Map<string, typeof initialLayout>();

    for (const item of initialLayout) {
      const gid = (item.table as FloorMapTable & { groupId?: string | null }).groupId;
      if (gid) {
        if (!groupMap.has(gid)) groupMap.set(gid, []);
        groupMap.get(gid)!.push(item);
      } else {
        groupedLayout.push(item);
      }
    }

    for (const [gid, items] of groupMap.entries()) {
      let sumX = 0, sumY = 0, sumCap = 0;
      let readyCount = 0, pendingCount = 0;
      const labels: number[] = [];

      for (const it of items) {
        sumX += it.left;
        sumY += it.top;
        sumCap += it.table.capacity;
        readyCount += it.table.readyCount ?? 0;
        pendingCount += it.table.pendingCount ?? 0;
        labels.push(it.table.number);
      }

      labels.sort((a,b) => a - b);
      const mergedLabel = labels.join("·");

      const firstTable = items[0].table;
      
      const mergedTable = {
        ...firstTable,
        capacity: sumCap,
        readyCount,
        pendingCount,
      } as FloorMapTable;

      groupedLayout.push({
        table: mergedTable,
        left: sumX / items.length,
        top: sumY / items.length,
        chipSize: Math.min(MAX_CHIP + 10, Math.max(MIN_CHIP, 56 + sumCap * 2)),
        label: mergedLabel,
        isGroup: true,
      });
    }

    return groupedLayout;
  }, [containerSize, tables]);

  const handleTap = (id: string) => {
    onTableClick?.(id);
  };

  return (
    <div className="relative flex flex-col">
      {/* Map container */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card"
        style={{
          minHeight: 340,
          height: "max(50vh, 340px)",
          background:
            "radial-gradient(ellipse 80% 60% at 50% 40%, rgba(201,160,84,0.03), transparent 70%), var(--color-bg-card)",
        }}
      >
        {/* Dot grid pattern */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle, var(--color-border-main) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
          aria-hidden
        />

        {/* Room border (dashed) */}
        <div
          className="pointer-events-none absolute"
          style={{
            top: 12,
            left: 12,
            right: 12,
            bottom: 12,
            border: "1px dashed",
            borderColor: "var(--color-border-main)",
            borderRadius: 12,
            opacity: 0.5,
          }}
          aria-hidden
        />

        {/* Tables */}
        <AnimatePresence mode="popLayout">
          {layout?.map((item, i) => (
            <MobileTableChip
              key={item.table.id}
              table={item.table}
              left={item.left}
              top={item.top}
              chipSize={item.chipSize}
              delay={i * 0.04}
              onTap={handleTap}
              selectionMode={selectionMode}
              isSelected={selectedIds.includes(item.table.id)}
              isDisabled={disabledIds.includes(item.table.id)}
              label={item.label}
              isGroup={item.isGroup}
            />
          ))}
        </AnimatePresence>

        {/* Empty state */}
        {tables.length === 0 && (
          <div className="flex h-full items-center justify-center">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.16em] text-text-muted">
              Sin mesas
            </p>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-center gap-4">
        {(
          [
            ["Libre", "var(--color-dash-green)"],
            ["Activa", "var(--color-gold)"],
            ["Cuenta", "var(--color-gold)"],
            ["Limpiar", "var(--color-dash-red)"],
          ] as const
        ).map(([label, dotColor]) => (
          <div key={label} className="flex items-center gap-1.5">
            <span
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: dotColor }}
              aria-hidden
            />
            <span className="font-mono text-[9px] font-bold uppercase tracking-[0.14em] text-text-muted">
              {label}
            </span>
          </div>
        ))}
      </div>

      {/* CSS Animations (scoped) */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes waiter-chip-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.15); }
        }
        @keyframes waiter-chip-ring {
          0% { transform: scale(1); opacity: 0.7; }
          70% { transform: scale(1.3); opacity: 0; }
          100% { transform: scale(1.3); opacity: 0; }
        }
      `}} />
    </div>
  );
}
