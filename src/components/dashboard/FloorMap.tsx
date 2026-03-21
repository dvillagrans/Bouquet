"use client";

import { memo, useCallback, useEffect, useRef, useState } from "react";
import { Stage, Layer, Rect, Circle, Text, Group } from "react-konva";
import type Konva from "konva";
import { Save, Edit3, Eye, Move, Circle as CircleIcon, Square } from "lucide-react";
import type { Table, TableStatus } from "@/generated/prisma";

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
function DotGrid() {
  const dots: React.ReactNode[] = [];
  for (let x = 0; x <= GRID_W; x += SNAP) {
    for (let y = 0; y <= GRID_H; y += SNAP) {
      dots.push(
        <Circle key={`${x}-${y}`} x={x} y={y} radius={1} fill={C.wire} listening={false} />
      );
    }
  }
  return <>{dots}</>;
}

const DotGridMemo = memo(DotGrid);

/* ── Single table node ─────────────────────────────────────────── */
interface TableNodeProps {
  table: Table;
  editMode: boolean;
  selected: string | null;
  onSelect: (id: string | null) => void;
  onDragEnd: (id: string, x: number, y: number) => void;
}

function TableNode({ table, editMode, selected, onSelect, onDragEnd }: TableNodeProps) {
  const isSelected = selected === table.id;
  const fill   = STATUS_FILL[table.status];
  const stroke = STATUS_STROKE[table.status];
  const isRound = table.shape === "round";
  const half = TABLE_W / 2;
  const seatCount = Math.min(table.capacity, 8);

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
    onTap: () => onSelect(isSelected ? null : table.id),
    onDragEnd: handleDragEnd,
  };

  return (
    <Group {...sharedGroupProps}>
      {/* Selection glow ring */}
      {isSelected && (
        isRound ? (
          <Circle
            x={half} y={half}
            radius={half + 6}
            stroke={fill}
            strokeWidth={2}
            opacity={0.4}
            dash={[4, 4]}
            listening={false}
          />
        ) : (
          <Rect
            x={-6} y={-6}
            width={TABLE_W + 12}
            height={TABLE_W + 12}
            stroke={fill}
            strokeWidth={2}
            opacity={0.4}
            dash={[4, 4]}
            cornerRadius={4}
            listening={false}
          />
        )
      )}

      {/* Table body */}
      {isRound ? (
        <Circle
          x={half} y={half}
          radius={half}
          fill={fill + "28"}
          stroke={stroke}
          strokeWidth={isSelected ? 2 : 1.5}
        />
      ) : (
        <Rect
          width={TABLE_W}
          height={TABLE_W}
          fill={fill + "28"}
          stroke={stroke}
          strokeWidth={isSelected ? 2 : 1.5}
          cornerRadius={4}
        />
      )}

      {/* Seat indicators (small dots around the table) */}
      {Array.from({ length: seatCount }).map((_, i) => {
        const angle = (i / seatCount) * Math.PI * 2 - Math.PI / 2;
        const r = half + 11;
        return (
          <Circle
            key={i}
            x={half + Math.cos(angle) * r}
            y={half + Math.sin(angle) * r}
            radius={4}
            fill={fill + "60"}
            stroke={stroke}
            strokeWidth={1}
            listening={false}
          />
        );
      })}

      {/* Table number */}
      <Text
        x={0} y={half - 12}
        width={TABLE_W}
        align="center"
        text={String(table.number)}
        fontSize={22}
        fontStyle="bold"
        fontFamily="serif"
        fill={C.light}
      />

      {/* Status label */}
      <Text
        x={0} y={half + 8}
        width={TABLE_W}
        align="center"
        text={STATUS_LABEL[table.status]}
        fontSize={9}
        fontFamily="sans-serif"
        fill={fill}
        opacity={0.85}
      />
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

    const prevIsSelected = prev.selected === prev.table.id;
    const nextIsSelected = next.selected === next.table.id;
    return prevIsSelected === nextIsSelected;
  }
);

/* ── Legend bar ────────────────────────────────────────────────── */
function Legend() {
  const items = [
    { label: "Disponible", color: C.sage },
    { label: "Ocupada",    color: C.glow },
    { label: "Por limpiar",color: C.ember },
  ];
  return (
    <div className="flex items-center gap-5">
      {items.map(({ label, color }) => (
        <div key={label} className="flex items-center gap-1.5">
          <span
            className="h-2 w-2 rounded-full"
            style={{ background: color }}
          />
          <span className="text-[0.6rem] font-medium text-dim">{label}</span>
        </div>
      ))}
    </div>
  );
}

/* ── Main component ────────────────────────────────────────────── */
export type FloorMapTable = Table;

interface FloorMapProps {
  tables: FloorMapTable[];
  readOnly?: boolean;
  onTableClick?: (tableId: string) => void;
}

export default function FloorMap({ tables: initialTables, readOnly = false, onTableClick }: FloorMapProps) {
  const [tables, setTables]     = useState<FloorMapTable[]>(initialTables);
  const [editMode, setEditMode] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  // Sync when parent refreshes table data (e.g. waiter polling)
  useEffect(() => {
    setTables(initialTables);
  }, [initialTables]);
  const [saving, setSaving]     = useState(false);
  const [saved, setSaved]       = useState(false);
  const containerRef            = useRef<HTMLDivElement>(null);
  const [scale, setScale]       = useState(1);

  // Track pending position updates
  const pendingRef = useRef<Map<string, { posX: number; posY: number }>>(new Map());

  // Responsive scale
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const obs = new ResizeObserver(() => {
      const s = Math.min(1, (el.clientWidth - 2) / GRID_W);
      setScale(s);
    });
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

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
    if (readOnly) {
      if (id && onTableClick) onTableClick(id);
      return;
    }
    setSelected(id);
  };

  return (
    <div className="flex flex-col gap-4">

      {/* ── Toolbar ────────────────────────────────────────────── */}
      {!readOnly && <div className="flex items-center justify-between border border-wire px-5 py-3">
        <Legend />

        <div className="flex items-center gap-3">
          {editMode && (
            <p className="hidden text-[0.62rem] font-medium text-glow sm:block">
              Arrastra las mesas para reposicionarlas
            </p>
          )}

          {editMode ? (
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex h-9 items-center gap-2 bg-light px-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-ink transition-all hover:-translate-y-px hover:bg-light/90 disabled:opacity-50"
            >
              <Save className="h-3.5 w-3.5" />
              {saving ? "Guardando…" : saved ? "Guardado ✓" : "Guardar"}
            </button>
          ) : null}

          <button
            onClick={() => {
              if (editMode) handleSave();
              else { setEditMode(true); setSelected(null); }
            }}
            className={[
              "inline-flex h-9 items-center gap-2 border px-4 text-[0.68rem] font-bold uppercase tracking-[0.18em] transition-all hover:-translate-y-px",
              editMode
                ? "border-wire text-dim hover:border-light/20 hover:text-light"
                : "border-wire text-dim hover:border-glow/40 hover:text-glow",
            ].join(" ")}
          >
            {editMode
              ? <><Eye className="h-3.5 w-3.5" /> Ver</>
              : <><Edit3 className="h-3.5 w-3.5" /> Editar</>
            }
          </button>
        </div>
      </div>}

      {/* ── Legend (read-only mode) ─────────────────────────────── */}
      {readOnly && (
        <div className="flex items-center border border-wire px-5 py-3">
          <Legend />
        </div>
      )}

      {/* ── Canvas ─────────────────────────────────────────────── */}
      <div
        ref={containerRef}
        className="relative overflow-hidden border border-wire"
        style={{ height: GRID_H * scale + 2 }}
      >
        <Stage
          width={GRID_W}
          height={GRID_H}
          scaleX={scale}
          scaleY={scale}
          style={{ display: "block" }}
          onClick={(e) => {
            if (e.target === e.target.getStage()) setSelected(null);
          }}
        >
          <Layer>
            {/* Background */}
            <Rect
              width={GRID_W}
              height={GRID_H}
              fill={C.canvas}
              listening={false}
            />

            {/* Dot grid */}
            <DotGridMemo />

            {/* Room border */}
            <Rect
              x={20} y={20}
              width={GRID_W - 40}
              height={GRID_H - 40}
              stroke={C.wire}
              strokeWidth={2}
              fill="transparent"
              dash={[8, 6]}
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
              />
            ))}
          </Layer>
        </Stage>

        {/* Edit mode overlay hint */}
        {editMode && (
          <div
            className="pointer-events-none absolute left-1/2 top-4 -translate-x-1/2 border border-glow/20 bg-ink/80 px-4 py-1.5 backdrop-blur-sm"
            style={{ animation: "fade-in 0.3s ease-out both" }}
          >
            <div className="flex items-center gap-2">
              <Move className="h-3 w-3 text-glow" />
              <p className="text-[0.62rem] font-semibold text-glow/80">
                Modo edición — arrastra para mover
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ── Selected table panel ─────────────────────────────── */}
      {selectedTable && !editMode && (
        <div
          className="flex items-center justify-between border border-wire px-5 py-4"
          style={{ animation: "reveal-up 0.25s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <div className="flex items-center gap-6">
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
                style={{ color: STATUS_FILL[selectedTable.status] }}
              >
                {STATUS_LABEL[selectedTable.status]}
              </p>
            </div>
            <div>
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.38em] text-dim">Asientos</p>
              <p className="mt-0.5 text-[0.75rem] font-semibold text-light">{selectedTable.capacity}</p>
            </div>
            <div>
              <p className="text-[0.52rem] font-bold uppercase tracking-[0.38em] text-dim">Código QR</p>
              <p className="mt-0.5 font-mono text-[0.75rem] font-semibold text-light/50">
                {selectedTable.qrCode}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShapeToggle(selectedTable.id, selectedTable.shape)}
              className="inline-flex h-9 items-center gap-2 border border-wire px-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-dim transition-colors hover:border-light/20 hover:text-light"
              title="Cambiar forma"
            >
              {selectedTable.shape === "round"
                ? <><Square className="h-3.5 w-3.5" /> Cuadrada</>
                : <><CircleIcon className="h-3.5 w-3.5" /> Redonda</>
              }
            </button>
            <button
              onClick={() => window.open(`/mesa/${selectedTable.qrCode}/menu`, "_blank")}
              className="inline-flex h-9 items-center gap-2 border border-wire px-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-dim transition-colors hover:border-light/20 hover:text-light"
            >
              Ver menú
            </button>
          </div>
        </div>
      )}

      {/* ── Edit mode: selected table shape toggle ───────────── */}
      {selectedTable && editMode && (
        <div
          className="flex items-center justify-between border border-glow/20 bg-glow/[0.04] px-5 py-3"
          style={{ animation: "reveal-up 0.25s cubic-bezier(0.22,1,0.36,1) both" }}
        >
          <p className="text-[0.68rem] font-semibold text-glow">
            Mesa {selectedTable.number} seleccionada
          </p>
          <button
            onClick={() => handleShapeToggle(selectedTable.id, selectedTable.shape)}
            className="inline-flex h-8 items-center gap-2 border border-glow/30 px-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-glow transition-colors hover:bg-glow/10"
          >
            {selectedTable.shape === "round"
              ? <><Square className="h-3.5 w-3.5" /> Cambiar a cuadrada</>
              : <><CircleIcon className="h-3.5 w-3.5" /> Cambiar a redonda</>
            }
          </button>
        </div>
      )}
    </div>
  );
}
