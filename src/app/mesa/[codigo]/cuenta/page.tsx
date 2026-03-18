import Link from "next/link";
import type { Metadata } from "next";
import { SplitBillScreen } from "@/components/guest/SplitBillScreen";

type CuentaPageProps = {
  params: Promise<{
    codigo: string;
  }>;
  searchParams: Promise<{
    guest?: string;
    pax?: string;
  }>;
};

export async function generateMetadata({ params }: CuentaPageProps): Promise<Metadata> {
  const { codigo } = await params;

  return {
    title: `Cuenta - Mesa ${codigo} | Bouquet`,
    description: `División de cuenta para la mesa ${codigo}`,
  };
}

export default async function CuentaPage({ params, searchParams }: CuentaPageProps) {
  const { codigo } = await params;
  const query = await searchParams;

  const guest = decodeURIComponent(query.guest?.trim() || "Invitado");

  return (
    <main className="relative min-h-screen overflow-hidden bg-ink px-6 py-8 text-light lg:px-10 lg:py-10">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(201,160,84,0.12),transparent_34%),radial-gradient(circle_at_82%_12%,rgba(168,185,165,0.08),transparent_28%),radial-gradient(circle_at_50%_110%,rgba(122,92,62,0.06),transparent_36%)]"
        aria-hidden="true"
      />

      <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-[linear-gradient(180deg,rgba(19,16,8,0.85),rgba(19,16,8,0))]" aria-hidden="true" />

      <div className="relative mx-auto w-full max-w-6xl">
        {/* Top nav con link de regreso al menú */}
        <div className="mb-10 flex items-center justify-between gap-4">
          <Link
            href={`/mesa/${encodeURIComponent(codigo)}/menu?guest=${encodeURIComponent(guest)}`}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-light/60 transition hover:text-glow"
          >
            <span>← Volver al Menú</span>
          </Link>
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.28em] text-dim">
            Pago de Mesa
          </span>
        </div>

        {/* Split Bill Component */}
        <SplitBillScreen tableCode={decodeURIComponent(codigo)} guestName={guest} />
      </div>
    </main>
  );
}
