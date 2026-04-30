import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";
import DashboardShell from "@/components/dashboard/DashboardShell";

const chainGroups = [
  {
    label: "Panel Maestro",
    items: [
      { label: "Visión General", href: "/cadena", icon: "Network" },
      { label: "Zonas", href: "/cadena/zonas", icon: "Map" },
    ],
  },
  {
    label: "Estandarización",
    items: [
      { label: "Plantillas de Menú", href: "/cadena/plantillas", icon: "LayoutTemplate" },
      { label: "Personal Corporativo", href: "/cadena/staff", icon: "Users" },
      { label: "Auditoría", href: "/cadena/auditoria", icon: "ShieldAlert" },
    ],
  },
];

export default async function ChainLayout({ children }: { children: React.ReactNode }) {
  const session = await getCurrentSession();
  if (!session?.ok) {
    redirect("/login");
  }

  const allowed = ["PLATFORM_ADMIN", "CHAIN_ADMIN"];
  if (!session.roles.some((r) => allowed.includes(r))) {
    redirect("/login?error=unauthorized");
  }

  const user = await prisma.appUser.findUnique({
    where: { id: session.appUserId },
    select: { firstName: true, lastName: true },
  });

  const userName = user ? `${user.firstName} ${user.lastName}`.trim() : "Operaciones";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <DashboardShell
      navGroups={chainGroups}
      userInitial={userInitial}
      userName={userName}
      userRole="Cadena"
      showSidebarLogout
    >
      {children}
    </DashboardShell>
  );
}
