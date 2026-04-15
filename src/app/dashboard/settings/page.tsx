import SettingsView from "@/components/dashboard/SettingsView";
import { getDefaultRestaurant } from "@/actions/restaurant";

export const metadata = {
  title: "Configuración | Bouquet Dashboard",
};

export default async function DashboardSettingsPage() {
  const restaurant = await getDefaultRestaurant();
  return <SettingsView initialSettings={{ id: restaurant.id, allowWaiterJoinTables: restaurant.allowWaiterJoinTables }} />;
}
