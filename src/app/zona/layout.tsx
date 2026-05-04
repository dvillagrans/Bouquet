import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth-server";
import DashboardShell from "@/components/dashboard/DashboardShell";

const zoneGroups = [
  {
    label: "Visión Global",
    items: [
      { label: "Panel de Zona", href: "/zona", icon: "Map" },
      { label: "Sucursales", href: "/zona/sucursales", icon: "Building2" },
    ],
  },
  {
    label: "Gestión",
    items: [
      { label: "Personal Zonal", href: "/zona/staff", icon: "Users" },
      { label: "Configuración", href: "/zona/settings", icon: "Settings2" },
    ],
  },
];

export default async function ZoneLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const allowed = ["PLATFORM_ADMIN", "CHAIN_ADMIN", "ZONE_MANAGER"];
  if (!user.roles.some((r) => allowed.includes(r))) {
    redirect("/login?error=unauthorized");
  }

  // Tenant scope: ZONE_MANAGER must administer at least one zone
  if (user.roles.includes("ZONE_MANAGER") && user.zoneIds.length === 0) {
    redirect("/login?error=unauthorized");
  }

  const userName = user.name || "Gerente";
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
