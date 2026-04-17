"use client";

import { Map, Building2, Users, Settings2 } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import { defaultRestaurantGroups } from "@/components/dashboard/Sidebar";

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
      { label: "Personal Zonal",  href: "/zona/staff", icon: Users },
      { label: "Configuración", href: "/zona/settings", icon: Settings2 },
    ],
  },
];

export default function ZoneLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navGroups={zoneGroups}
      userInitial="Z"
      userName="Gerente Zona"
      userRole="Norte"
      showSidebarLogout
    >
      {children}
    </DashboardShell>
  );
}