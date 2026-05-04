import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { defaultRestaurantGroups } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Cualquier rol de restaurante o superior puede acceder
  const allowed = [
    "PLATFORM_ADMIN",
    "CHAIN_ADMIN",
    "ZONE_MANAGER",
    "RESTAURANT_ADMIN",
    "ADMIN",
    "MESERO",
  ];
  if (!user.roles.some((r) => allowed.includes(r))) {
    redirect("/login?error=unauthorized");
  }

  const userName = user.name || "Staff";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <DashboardShell
      navGroups={defaultRestaurantGroups}
      userInitial={userInitial}
      userName={userName}
      userRole="Sucursal"
      showSidebarLogout
    >
      {children}
    </DashboardShell>
  );
}
