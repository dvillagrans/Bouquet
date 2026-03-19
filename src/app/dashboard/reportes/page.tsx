import ReportsView from "@/components/dashboard/ReportsView";
import { getDashboardReports } from "@/actions/reports";

export const metadata = {
  title: "Reportes | Bouquet Dashboard",
};

export const dynamic = "force-dynamic";

export default async function DashboardReportsPage() {
  const reportData = await getDashboardReports();
  return <ReportsView reportData={reportData} />;
}
