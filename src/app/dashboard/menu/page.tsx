import { redirect } from "next/navigation";
import MenuEditor from "@/components/dashboard/MenuEditor";
import { getMenuData } from "@/actions/menu";
import { getCurrentUser } from "@/lib/auth-server";
import { resolveRestaurantForUser } from "@/actions/restaurant";

export const metadata = {
  title: "Menú Digital | Bouquet Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardMenuPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const restaurant = await resolveRestaurantForUser(user.userId);
  if (!restaurant) throw new Error("No se encontró restaurante asociado");

  const { categories, items } = await getMenuData({ restaurantId: restaurant.id });

  return <MenuEditor initialCategories={categories} initialItems={items as any} />;
}
