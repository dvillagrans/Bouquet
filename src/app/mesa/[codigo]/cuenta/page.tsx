import type { Metadata } from "next";
import { SplitBillScreen } from "@/components/guest/SplitBillScreen";
import { getTableBill } from "@/actions/comensal";

type CuentaPageProps = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ guest?: string; pax?: string }>;
};

export async function generateMetadata({ params, searchParams }: CuentaPageProps): Promise<Metadata> {
  const { codigo } = await params;
  const { guest } = await searchParams;
  const guestName = decodeURIComponent(guest?.trim() || "Invitado");
  return {
    title: `Cuenta · Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: `División de cuenta para ${guestName}`,
  };
}

export default async function CuentaPage({ params, searchParams }: CuentaPageProps) {
  const { codigo } = await params;
  const { guest, pax } = await searchParams;

  const tableCode = decodeURIComponent(codigo);
  const guestName = decodeURIComponent(guest?.trim() || "Invitado");
  const partySize = Math.max(1, Math.min(20, Number(pax) || 2));

  const bill = await getTableBill(tableCode);

  return (
    <div className="min-h-screen bg-ink text-light">
      <SplitBillScreen
        tableCode={tableCode}
        guestName={guestName}
        partySize={partySize}
        initialBill={bill}
      />
    </div>
  );
}
