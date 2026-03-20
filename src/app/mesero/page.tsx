import WaiterDashboard from "@/components/waiter/WaiterDashboard";

export const metadata = {
  title: "Panel del Mesero | Bouquet",
  description: "Gestión de mesas y órdenes para meseros",
};

export const dynamic = "force-dynamic";

export default function WaiterPage() {
  return <WaiterDashboard />;
}

