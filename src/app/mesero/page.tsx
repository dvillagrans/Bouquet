import { redirect } from "next/navigation";
import WaiterDashboard from "@/components/waiter/WaiterDashboard";
import { getCurrentUser } from "@/lib/auth-server";
import { resolveRestaurantForUser } from "@/actions/restaurant";

export const metadata = {
  title: "Panel del Mesero | Bouquet",
  description: "Gestión de mesas y órdenes para meseros",
};

export const dynamic = "force-dynamic";

export default async function WaiterPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const restaurant = await resolveRestaurantForUser(user.userId);
  if (!restaurant) throw new Error("No se encontró restaurante asociado");

  return (
    <WaiterDashboard
      allowJoinTables={restaurant.allowWaiterJoinTables}
      restaurantId={restaurant.id}
      restaurantName={restaurant.name}
    />
  );
}
