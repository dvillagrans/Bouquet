import KDSBoard from "@/components/staff/KDSBoard";
import { getLiveOrders } from "@/actions/orders";

export const metadata = {
  title: "Kitchen Display System | Boulevard",
  description: "Monitor KDS para el personal de cocina.",
};

export const dynamic = "force-dynamic";

export default async function CocinaPage() {
  const initialOrders = await getLiveOrders();
  return <KDSBoard initialOrders={initialOrders} defaultStation="cocina" />;
}
