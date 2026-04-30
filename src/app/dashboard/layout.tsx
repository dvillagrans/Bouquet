import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { defaultRestaurantGroups } from "@/components/dashboard/Sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.ok) {
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
  if (!session.roles.some((r) => allowed.includes(r))) {
    redirect("/login?error=unauthorized");
  }

  const user = await prisma.appUser.findUnique({
    where: { id: session.appUserId },
    select: { firstName: true, lastName: true },
  });

  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : "Staff";
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
