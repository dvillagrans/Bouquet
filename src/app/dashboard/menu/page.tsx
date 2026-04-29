import MenuEditor from "@/components/dashboard/MenuEditor";
import { getMenuData } from "@/actions/menu";

export const metadata = {
  title: "Menú Digital | Bouquet Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardMenuPage() {
  const { categories, items } = await getMenuData();
  
  return <MenuEditor initialCategories={categories} initialItems={items as any} />;
}
