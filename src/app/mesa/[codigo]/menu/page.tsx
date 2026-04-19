import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect, notFound } from "next/navigation";
import { MenuScreen } from "@/components/guest/MenuScreen";
import { getMenuData } from "@/actions/menu";
import { getGuestOrders, getGuestTableState } from "@/actions/comensal";
import { prisma } from "@/lib/prisma";

type MenuPageProps = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ guest?: string; pax?: string; from?: string }>;
};

export async function generateMetadata({ params, searchParams }: MenuPageProps): Promise<Metadata> {
  const { codigo } = await params;
  const { guest } = await searchParams;
  const raw = guest?.trim();
  let guestName = "Invitado";
  if (raw) {
    try {
      guestName = decodeURIComponent(raw);
    } catch {
      guestName = raw;
    }
  }
  return {
    title: `Menú · Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: `Menú activo para ${guestName}`,
  };
}

export default async function MesaMenuPage({ params, searchParams }: MenuPageProps) {
  const { codigo } = await params;
  const sp = await searchParams;

  const tableCode = decodeURIComponent(codigo);

  const table = await prisma.table.findUnique({
    where: { qrCode: tableCode },
    select: { id: true, restaurantId: true },
  });
  if (!table) notFound();

  const guestFromQuery = sp.guest?.trim();
  let guestName = "";
  let partySize = 1;

  if (guestFromQuery && guestFromQuery.length >= 2) {
    try {
      guestName = decodeURIComponent(guestFromQuery);
    } catch {
      guestName = guestFromQuery;
    }
    partySize = Math.max(1, Math.min(20, Number(sp.pax) || 1));
  } else {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(`bq_session_${tableCode}`)?.value;
    const guestCookie = cookieStore.get(`bq_guest_${tableCode}`)?.value;

    if (sessionId && guestCookie) {
      const activeSession = await prisma.session.findUnique({
        where: { id: sessionId },
        select: { isActive: true, pax: true, tableId: true },
      });
      if (activeSession?.isActive && activeSession.tableId === table.id) {
        try {
          guestName = decodeURIComponent(guestCookie);
        } catch {
          guestName = guestCookie;
        }
        partySize = Math.max(1, Math.min(20, activeSession.pax || 1));
      }
    }
  }

  if (!guestName || guestName.length < 2) {
    redirect(`/mesa/${encodeURIComponent(tableCode)}`);
  }

  const [{ categories, items }, initialOrders, { isHost, billRequested, guests, joinCode }] = await Promise.all([
    getMenuData({ restaurantId: table.restaurantId }),
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
