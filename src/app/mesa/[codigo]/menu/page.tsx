import type { Metadata } from "next";
import { MenuScreen } from "@/components/guest/MenuScreen";
import { getMenuData } from "@/actions/menu";
import { getGuestOrders, getGuestTableState } from "@/actions/comensal";

type MenuPageProps = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ guest?: string; pax?: string; from?: string }>;
};

export async function generateMetadata({ params, searchParams }: MenuPageProps): Promise<Metadata> {
  const { codigo } = await params;
  const { guest } = await searchParams;
  const guestName = decodeURIComponent(guest?.trim() || "Invitado");
  return {
    title: `Menú · Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: `Menú activo para ${guestName}`,
  };
}

export default async function MesaMenuPage({ params, searchParams }: MenuPageProps) {
  const { codigo } = await params;
  const { guest, pax } = await searchParams;

  const tableCode = decodeURIComponent(codigo);
  const guestName = decodeURIComponent(guest?.trim() || "Invitado");
  const partySize = Math.max(1, Math.min(20, Number(pax) || 1));

  const [{ categories, items }, initialOrders, { isHost, billRequested, guests, joinCode }] = await Promise.all([
    getMenuData(),
    getGuestOrders(tableCode),
    getGuestTableState(tableCode, guestName),
  ]);

  return (
    <div className="min-h-screen bg-ink text-light">
      <MenuScreen
        guestName={guestName}
        partySize={partySize}
        tableCode={tableCode}
        initialCategories={categories}
        initialItems={items}
        initialOrders={initialOrders}
        isHost={isHost}
        initialBillRequested={billRequested}
        initialGuests={guests}
        joinCode={joinCode}
      />
    </div>
  );
}
