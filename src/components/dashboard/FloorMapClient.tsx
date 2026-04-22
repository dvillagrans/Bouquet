"use client";

import dynamic from "next/dynamic";
import type { FloorMapTable } from "./FloorMap";

// react-konva uses browser APIs — must be loaded client-side only
const FloorMap = dynamic(() => import("./FloorMap"), {
  ssr: false,
  loading: () => (
    <div className="flex min-h-[400px] items-center justify-center border border-wire bg-canvas">
      <p className="text-[0.72rem] font-medium text-dim/50">Cargando mapa…</p>
    </div>
  ),
});

interface FloorMapClientProps {
  tables: FloorMapTable[];
  readOnly?: boolean;
  onTableClick?: (tableId: string) => void;
  showSeatGlyphs?: boolean;
  showOperationsBar?: boolean;
}

export default function FloorMapClient({
  tables,
  readOnly,
  onTableClick,
  showSeatGlyphs = true,
  showOperationsBar = true,
}: FloorMapClientProps) {
  return (
    <FloorMap
      tables={tables}
      readOnly={readOnly}
      onTableClick={onTableClick}
      showSeatGlyphs={showSeatGlyphs}
      showOperationsBar={showOperationsBar}
    />
  );
}
