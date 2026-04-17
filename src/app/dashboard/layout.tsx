import DashboardShell from "@/components/dashboard/DashboardShell";
import { defaultRestaurantGroups } from "@/components/dashboard/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DashboardShell 
      navGroups={defaultRestaurantGroups}
      userInitial="M"
      userName="Manager"
      userRole="Sucursal"
      showSidebarLogout
    >
      {children}
    </DashboardShell>
  );
}
