import KDSBoard from "@/components/staff/KDSBoard";
import { getLiveOrders } from "@/actions/orders";

export const metadata = {
  title: "Barra Display System | Bouquet",
  description: "Monitor de tickets para la barra del restaurante.",
};

export const dynamic = "force-dynamic";

export default async function BarraPage() {
  const initialOrders = await getLiveOrders();
  return <KDSBoard initialOrders={initialOrders} defaultStation="barra" />;
}
