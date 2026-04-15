import SuperAdminDashboard from "@/components/admin/SuperAdminDashboard";

export const metadata = {
  title: "Super Admin SaaS | Bouquet",
  description: "Consola Maestra de BouquetOps",
};

export const dynamic = "force-dynamic";

export default function SuperAdminPage() {
  return <SuperAdminDashboard />;
}
