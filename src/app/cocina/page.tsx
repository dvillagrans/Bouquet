import KDSBoard from "@/components/staff/KDSBoard";
import { getLiveOrders } from "@/actions/orders";
import { getDefaultRestaurant } from "@/actions/restaurant";

export const metadata = {
  title: "Kitchen Display System | Boulevard",
  description: "Monitor KDS para el personal de cocina.",
};

export const dynamic = "force-dynamic";

export default async function CocinaPage() {
  const restaurant = await getDefaultRestaurant();
  const initialOrders = await getLiveOrders();
  const initialNowMs = Date.now();
  return (
    <KDSBoard
      initialOrders={initialOrders}
      defaultStation="cocina"
      restaurantId={restaurant.id}
      initialNowMs={initialNowMs}
    />
  );
}
