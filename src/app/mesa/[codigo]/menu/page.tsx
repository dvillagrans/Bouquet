import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { MenuScreen } from "@/components/guest/MenuScreen";
import { getMenuData } from "@/actions/menu";
import { getGuestOrders, getGuestTableState } from "@/actions/comensal";
import { consumeTableJoinProofQuery } from "@/lib/consume-table-join-proof";
import { resolveGuestTableAccess } from "@/lib/guest-table-access";
import { prisma } from "@/lib/prisma";
import CheckoutSuccessScreen from "@/components/guest/CheckoutSuccessScreen";
import { cookies } from "next/headers";

type MenuPageProps = {
  params: Promise<{ codigo: string }>;
  searchParams: Promise<{ guest?: string; pax?: string; from?: string; k?: string }>;
};

export async function generateMetadata({ params }: MenuPageProps): Promise<Metadata> {
  const { codigo } = await params;
  return {
    title: `Menú · Mesa ${decodeURIComponent(codigo)} · Bouquet`,
    description: "Menú activo en tu mesa",
  };
}

export default async function MesaMenuPage({ params, searchParams }: MenuPageProps) {
  const { codigo } = await params;
  const sp = await searchParams;

  const tableCode = decodeURIComponent(codigo);

  consumeTableJoinProofQuery(tableCode, sp, `/mesa/${encodeURIComponent(tableCode)}/menu`);

  const access = await resolveGuestTableAccess(tableCode);
  if (access.status === "not_found") notFound();
  if (access.status === "need_login") {
    redirect(`/mesa/${encodeURIComponent(access.canonicalQr)}/`);
  }
  if (access.status === "session_ended") {
    const store = await cookies();
    const checkoutCookie = store.get(`bq_checkout_${access.canonicalQr}`)?.value;
    if (checkoutCookie) {
      try {
        const data = JSON.parse(checkoutCookie);
        return <CheckoutSuccessScreen guestName={data.guestName} isLastPayer={data.isLastPayer} branchName="Bouquet" />;
      } catch (e) {}
    }

    return (
      <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-[#0a0a08] px-6 text-center text-white">
        <h1 className="font-serif text-3xl font-medium tracking-tight">Esta sesión ha terminado</h1>
        <p className="mt-4 max-w-sm font-sans text-sm leading-relaxed text-gray-400">
          Ya has completado tu pago o tu sesión fue cerrada. Esperamos verte de nuevo pronto.
        </p>
      </div>
    );
  }

  if (
    access.status === "ok" &&
    (sp.guest !== undefined || sp.pax !== undefined || sp.from !== undefined)
  ) {
    redirect(`/mesa/${encodeURIComponent(access.table.qrCode)}/menu`);
  }

  const { table, guestName, partySize } = access;

  const [
    { categories, items },
    initialOrders,
    { isHost, billRequested, guests, joinCode },
    restaurant,
  ] = await Promise.all([
    getMenuData({ restaurantId: table.restaurantId }),
    getGuestOrders(table.qrCode),
    getGuestTableState(table.qrCode, guestName),
    prisma.restaurant.findUnique({
      where: { id: table.restaurantId },
      select: { name: true },
    }),
  ]);

  return (
    <div className="min-h-screen">
      {/* Textura muy sutil — no compite con la carta */}
      <div
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.14] mix-blend-overlay"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'repeat',
          backgroundSize: '128px 128px'
        }}
      />

      <MenuScreen
        guestName={guestName}
        partySize={partySize}
        tableCode={table.qrCode}
        tableNumber={table.number}
        restaurantName={restaurant?.name ?? "Restaurante"}
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
