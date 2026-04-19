import WaiterDashboard from "@/components/waiter/WaiterDashboard";
import { getDefaultRestaurant } from "@/actions/restaurant";

export const metadata = {
  title: "Panel del Mesero | Bouquet",
  description: "Gestión de mesas y órdenes para meseros",
};

export const dynamic = "force-dynamic";

export default async function WaiterPage() {
  const restaurant = await getDefaultRestaurant();
  return (
    <WaiterDashboard
      allowJoinTables={restaurant.allowWaiterJoinTables}
      restaurantId={restaurant.id}
    />
  );
}

