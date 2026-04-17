"use client";

import { Shield, Building, CreditCard, Wrench } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";

const adminGroups = [
  {
    label: "SaaS",
    items: [
      { label: "Console", href: "/admin", icon: Shield },
      { label: "Tenants/Cadenas", href: "/admin/clientes", icon: Building },
      { label: "Facturación SaaS", href: "/admin/billing", icon: CreditCard },
    ],
  },
  {
    label: "Mantenimiento",
    items: [
      { label: "Ajustes del Sistema", href: "/admin/system", icon: Wrench },
    ],
  },
];

export default function AdminShellClient({ children }: { children: React.ReactNode }) {
  return (
    <DashboardShell
      navGroups={adminGroups}
      userInitial="SA"
      userName="Admin Supremo"
      userRole="BouquetOps"
    >
      {children}
    </DashboardShell>
  );
}
