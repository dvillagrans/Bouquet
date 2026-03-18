import TableManager from "@/components/dashboard/TableManager";

export const metadata = {
  title: "Gestión de Mesas | Bouquet Dashboard",
  description: "Administra las mesas y genera accesos QR.",
};

export default function DashboardMesasPage() {
  return <TableManager />;
}
