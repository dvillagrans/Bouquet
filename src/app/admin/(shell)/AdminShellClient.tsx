"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";

const adminGroups = [
  {
    label: "SaaS",
    items: [
      { label: "Console", href: "/admin", icon: "Shield" },
      { label: "Tenants/Cadenas", href: "/admin/clientes", icon: "Building" },
      { label: "Facturación SaaS", href: "/admin/billing", icon: "CreditCard" },
    ],
  },
  {
    label: "Mantenimiento",
    items: [
      { label: "Ajustes del Sistema", href: "/admin/system", icon: "Wrench" },
    ],
  },
];

export default function AdminShellClient({
  children,
  userName,
  userInitial,
}: {
  children: React.ReactNode;
  userName: string;
  userInitial: string;
}) {
  return (
    <DashboardShell
      navGroups={adminGroups}
      userInitial={userInitial}
      userName={userName}
      userRole="BouquetOps"
      showSidebarLogout
    >
      {children}
    </DashboardShell>
  );
}
