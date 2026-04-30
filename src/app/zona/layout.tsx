import { redirect } from "next/navigation";
import { Map, Building2, Users, Settings2 } from "lucide-react";
import { getCurrentSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";

const zoneGroups = [
  {
    label: "Visión Global",
    items: [
      { label: "Panel de Zona", href: "/zona", icon: Map },
      { label: "Sucursales", href: "/zona/sucursales", icon: Building2 },
    ],
  },
  {
    label: "Gestión",
    items: [
      { label: "Personal Zonal", href: "/zona/staff", icon: Users },
      { label: "Configuración", href: "/zona/settings", icon: Settings2 },
    ],
  },
];

export default async function ZoneLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.ok) {
    redirect("/login");
  }

  const allowed = ["PLATFORM_ADMIN", "CHAIN_ADMIN", "ZONE_MANAGER"];
  if (!session.roles.some((r) => allowed.includes(r))) {
    redirect("/login?error=unauthorized");
  }

  const user = await prisma.appUser.findUnique({
    where: { id: session.appUserId },
    select: { firstName: true, lastName: true },
  });

  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : "Gerente";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <DashboardShell
      navGroups={zoneGroups}
      userInitial={userInitial}
      userName={userName}
      userRole="Zona"
      showSidebarLogout
    >
      {children}
    </DashboardShell>
  );
}
