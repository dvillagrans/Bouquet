import TableManager from "@/components/dashboard/TableManager";
import { getTables } from "@/actions/tables";

export const metadata = {
  title: "Gestión de Mesas | Bouquet Dashboard",
  description: "Administra las mesas y genera accesos QR.",
};

export const dynamic = "force-dynamic";

export default async function DashboardMesasPage() {
  const tables = await getTables();

  return <TableManager initialTables={tables} />;
}
