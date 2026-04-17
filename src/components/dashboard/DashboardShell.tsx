"use client";

import { AppSidebar } from "./AppSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { NavGroup } from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { MobileNavProvider } from "./MobileNavContext";

interface DashboardShellProps {
  children: React.ReactNode;
  navGroups: NavGroup[];
  userName?: string;
  userRole?: string;
  userInitial?: string;
  /** Muestra “Cerrar sesión” en el pie del sidebar (p. ej. consola super admin). */
  showSidebarLogout?: boolean;
}

export default function DashboardShell({
  children,
  navGroups,
  userName,
  userRole,
  userInitial,
  showSidebarLogout,
}: DashboardShellProps) {
  return (
    <SidebarProvider>
      <MobileNavProvider>
        <DashboardShellContent
          navGroups={navGroups}
          userName={userName}
          userRole={userRole}
          userInitial={userInitial}
          showSidebarLogout={showSidebarLogout}
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
  showSidebarLogout,
}: DashboardShellProps) {
  return (
    <div className="flex min-h-screen w-full bg-bg-solid text-text-primary antialiased selection:bg-gold selection:text-bg-solid font-sans">
      <AppSidebar
        groups={navGroups}
        userName={userName}
        userRole={userRole}
        userInitial={userInitial}
        showSidebarLogout={showSidebarLogout}
      />
      <main className="flex min-h-svh min-w-0 flex-1 flex-col pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-0">
        {children}
      </main>
      <MobileBottomNav
        navGroups={navGroups}
        userName={userName}
        userRole={userRole}
        userInitial={userInitial}
        showSidebarLogout={showSidebarLogout}
      />
    </div>
  );
}
