import { redirect } from "next/navigation";
import TableManager from "@/components/dashboard/TableManager";
import { getTables } from "@/actions/tables";
import { getCurrentUser } from "@/lib/auth-server";
import { resolveRestaurantForUser } from "@/actions/restaurant";

export const metadata = {
  title: "Gestión de Mesas | Bouquet Dashboard",
  description: "Administra las mesas y genera accesos QR.",
};

export const dynamic = "force-dynamic";

export default async function DashboardMesasPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const restaurant = await resolveRestaurantForUser(user.userId);
  if (!restaurant) throw new Error("No se encontró restaurante asociado");

  const tables = await getTables();

  return <TableManager initialTables={tables} restaurantId={restaurant.id} />;
}
