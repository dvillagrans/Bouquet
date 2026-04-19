import KDSBoard from "@/components/staff/KDSBoard";
import { getLiveOrders } from "@/actions/orders";
import { getDefaultRestaurant } from "@/actions/restaurant";

export const metadata = {
  title: "Barra Display System | Bouquet",
  description: "Monitor de tickets para la barra del restaurante.",
};

export const dynamic = "force-dynamic";

export default async function BarraPage() {
  const restaurant = await getDefaultRestaurant();
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
