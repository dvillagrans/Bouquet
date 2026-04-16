import { getRestaurantOverview } from "@/actions/restaurant";
import DashboardOverview from "@/components/dashboard/DashboardOverview";

export const metadata = {
  title: "Panel de Sucursal | Bouquet Dashboard",
  description: "Visión global operativa de la sucursal activa.",
};

export const dynamic = "force-dynamic";

export default async function DashboardIndex() {
  const data = await getRestaurantOverview();

  return <DashboardOverview data={data} />;
}
