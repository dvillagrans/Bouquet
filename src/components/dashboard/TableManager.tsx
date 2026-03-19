import { Table } from "@/generated/prisma";
import TableManagerClient from "./TableManagerClient";

export default function TableManager({ initialTables }: { initialTables: Table[] }) {
  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12">
      {/* ── Header (SSR: LCP target) ───────────────────────────── */}
      <div
        className="border-b border-wire pb-8"
      >
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Gestión de mesas</p>
        <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
          Mesas & QR
        </h1>
      </div>

      <TableManagerClient initialTables={initialTables} />
    </div>
  );
}

