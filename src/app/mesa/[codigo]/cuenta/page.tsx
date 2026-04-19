import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getTableBill } from "@/actions/comensal";
import { SplitBillScreen } from "@/components/guest/SplitBillScreen";
import { consumeTableJoinProofQuery } from "@/lib/consume-table-join-proof";
import { resolveGuestTableAccess } from "@/lib/guest-table-access";

type CuentaPageProps = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ guest?: string; pax?: string; from?: string; k?: string }>;
};

export async function generateMetadata({ params }: CuentaPageProps): Promise<Metadata> {
  const { codigo } = await params;
  return {
    title: `Cuenta · Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: "División de cuenta de la mesa",
  };
}

export default async function CuentaPage({ params, searchParams }: CuentaPageProps) {
  const { codigo } = await params;
  const sp = await searchParams;
  const tableCode = decodeURIComponent(codigo);

  consumeTableJoinProofQuery(tableCode, sp, `/mesa/${encodeURIComponent(tableCode)}/cuenta`);

  const access = await resolveGuestTableAccess(tableCode);
  if (access.status === "not_found") notFound();
  if (access.status === "need_login") {
    redirect(`/mesa/${encodeURIComponent(access.canonicalQr)}/`);
  }

  if (
    access.status === "ok" &&
    (sp.guest !== undefined || sp.pax !== undefined || sp.from !== undefined)
  ) {
    redirect(`/mesa/${encodeURIComponent(access.table.qrCode)}/cuenta`);
  }

  const { table, guestName, partySize } = access;
  const bill = await getTableBill(table.qrCode);
  const partySizeDisplay = bill.guestCount > 0 ? bill.guestCount : partySize;

  return (
    <div className="flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-bg-solid text-text-primary">
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-40 mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px 128px",
        }}
      />
      <SplitBillScreen
        tableCode={table.qrCode}
        guestName={guestName}
        partySize={partySizeDisplay}
        initialBill={bill}
      />
    </div>
  );
}
