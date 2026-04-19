
import { Table } from "@/generated/prisma";
import TableManagerClient from "./TableManagerClient";

export default function TableManager({
  initialTables,
  restaurantId,
}: {
  initialTables: Table[];
  restaurantId: string;
}) {
  const NOISE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDgiIG1peC1ibGVuZC1tb2RlPSJvdmVybGF5IiAvPgo8L3N2Zz4=";

  return (
    <div className="relative min-h-screen bg-bg-solid font-sans text-text-primary">
      {/* Background Effects */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 z-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundRepeat: "repeat" }}
        />
        <div className="absolute top-0 right-0 h-[min(80vh,600px)] w-[min(100vw,800px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.06),transparent_60%)] blur-3xl opacity-60" />
      </div>

      <div className="relative z-10 px-6 py-12 md:px-12 md:py-16 mx-auto max-w-[1600px]">
        <TableManagerClient initialTables={initialTables} restaurantId={restaurantId} />
      </div>
    </div>
  );
}
