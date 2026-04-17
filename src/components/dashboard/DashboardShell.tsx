"use client";

import { Menu } from "lucide-react";
import { AppSidebar } from "./AppSidebar";
import { NavGroup } from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { useMobileNav } from "./MobileNavContext";
import { MobileNavProvider } from "./MobileNavContext";

interface DashboardShellProps {
  children: React.ReactNode;
  navGroups: NavGroup[];
  userName?: string;
  userRole?: string;
  userInitial?: string;
}

export default function DashboardShell({
  children,
  navGroups,
  userName,
  userRole,
  userInitial,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <MobileNavProvider>
        <DashboardShellContent
          navGroups={navGroups}
          userName={userName}
          userRole={userRole}
          userInitial={userInitial}
        >
          {children}
        </DashboardShellContent>
      </MobileNavProvider>
    </SidebarProvider>
  );
}

function DashboardShellContent({
  children,
  navGroups,
  userName,
  userRole,
  userInitial,
}: DashboardShellProps) {
  const { toggle } = useMobileNav();

  return (
    <div className="flex min-h-screen w-full bg-bg-solid text-text-primary antialiased selection:bg-gold selection:text-bg-solid font-sans">
      <AppSidebar
        groups={navGroups}
        userName={userName}
        userRole={userRole}
        userInitial={userInitial}
      />
      <main className="flex min-h-svh min-w-0 flex-1 flex-col">
        <button
          type="button"
          onClick={toggle}
          className="fixed bottom-4 left-4 z-50 inline-flex h-12 items-center gap-2 rounded-full border border-border-main bg-bg-card px-4 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary shadow-lg shadow-black/20 lg:hidden"
          aria-label="Abrir menú"
        >
          <Menu className="h-4 w-4" aria-hidden="true" />
          Menú
        </button>
        {children}
      </main>
    </div>
  );
}
