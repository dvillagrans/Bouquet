import { redirect } from "next/navigation";
import SettingsView from "@/components/dashboard/SettingsView";
import { getCurrentUser } from "@/lib/auth-server";
import { resolveRestaurantForUser } from "@/actions/restaurant";

export const metadata = {
  title: "Configuración | Bouquet Dashboard",
};

export default async function DashboardSettingsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const restaurant = await resolveRestaurantForUser(user.userId);
  if (!restaurant) throw new Error("No se encontró restaurante asociado");

  return <SettingsView initialSettings={{ id: restaurant.id, allowWaiterJoinTables: restaurant.allowWaiterJoinTables }} />;
}
