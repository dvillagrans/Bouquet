"use client";

import { Network, Map, LayoutTemplate, Users, ShieldAlert } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";

const chainGroups = [
  {
    label: "Panel Maestro",
    items: [
      { label: "Visión General", href: "/cadena", icon: Network },
      { label: "Zonas", href: "/cadena/zonas", icon: Map },
    ],
  },
  {
    label: "Estandarización",
    items: [
      { label: "Plantillas de Menú", href: "/cadena/plantillas", icon: LayoutTemplate },
      { label: "Personal Corporativo", href: "/cadena/staff", icon: Users },
      { label: "Auditoría", href: "/cadena/auditoria", icon: ShieldAlert },
    ],
  },
];

export default function ChainLayout({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navGroups={chainGroups}
      userInitial="C"
      userName="Dir. Operaciones"
      userRole="Cadena Nacional"
      showSidebarLogout
    >
      {children}
    </DashboardShell>
  );
}