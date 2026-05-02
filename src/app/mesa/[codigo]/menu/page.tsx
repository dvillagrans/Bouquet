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
    redirect(`/mesa/${encodeURIComponent(access.table.publicCode)}/menu`);
  }

  const { table, guestName, partySize } = access;

  const [
    { categories, items },
    initialOrders,
    { isHost, billRequested, guests, joinCode },
    restaurant,
  ] = await Promise.all([
    getMenuData({ restaurantId: table.restaurantId }),
    getGuestOrders(table.publicCode),
    getGuestTableState(table.publicCode, guestName),
    prisma.restaurant.findUnique({
      where: { id: table.restaurantId },
      select: { name: true },
    }),
  ]);

  return (
    <div className="min-h-screen">
      {/* Grain texture — matches Bouquet design system */}
      <div className="bq-grain opacity-[0.03]" aria-hidden />

      <MenuScreen
        guestName={guestName}
        partySize={partySize}
        tableCode={table.publicCode}
        tableNumber={table.number}
        restaurantName={restaurant?.name ?? "Restaurante"}
        initialCategories={categories}
        initialItems={items as any}
        initialOrders={initialOrders}
        isHost={isHost}
        initialBillRequested={billRequested}
        initialGuests={guests.map(g => ({ ...g, name: g.name || "Comensal" }))}
        joinCode={joinCode}
      />
    </div>
  );
}
