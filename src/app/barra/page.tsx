import { redirect } from "next/navigation";
import KDSBoard from "@/components/staff/KDSBoard";
import { getLiveOrders } from "@/actions/orders";
import { getCurrentUser } from "@/lib/auth-server";
import { resolveRestaurantForUser } from "@/actions/restaurant";

export const metadata = {
  title: "Barra Display System | Bouquet",
  description: "Monitor de tickets para la barra del restaurante.",
};

export const dynamic = "force-dynamic";

export default async function BarraPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const restaurant = await resolveRestaurantForUser(user.userId);
  if (!restaurant) throw new Error("No se encontró restaurante asociado");

  const initialOrders = await getLiveOrders();
  const initialNowMs = Date.now();
  return (
    <KDSBoard
      initialOrders={initialOrders}
      defaultStation="barra"
      restaurantId={restaurant.id}
      initialNowMs={initialNowMs}
    />
  );
}
