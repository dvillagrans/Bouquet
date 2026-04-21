"use client";

import { AppSidebar } from "./AppSidebar";
import MobileBottomNav from "./MobileBottomNav";
import { NavGroup } from "./Sidebar";
import { ShellChromeProvider, useShellChrome } from "./ShellChromeContext";
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
        <ShellChromeProvider>
          <DashboardShellContent
            navGroups={navGroups}
            userName={userName}
            userRole={userRole}
            userInitial={userInitial}
            showSidebarLogout={showSidebarLogout}
          >
            {children}
          </DashboardShellContent>
        </ShellChromeProvider>
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
  const { hideDashboardChrome } = useShellChrome();

  return (
    <div className="flex h-svh w-full overflow-hidden bg-bg-solid text-base text-text-primary antialiased selection:bg-gold selection:text-bg-solid font-sans lg:text-[14px]">
      {hideDashboardChrome ? null : (
        <AppSidebar
          groups={navGroups}
          userName={userName}
          userRole={userRole}
          userInitial={userInitial}
          showSidebarLogout={showSidebarLogout}
        />
      )}
      <main
        className={
          hideDashboardChrome
            ? "flex min-h-svh min-w-0 flex-1 flex-col pb-0"
            : "flex h-svh min-w-0 flex-1 flex-col overflow-y-auto pb-[calc(7rem+env(safe-area-inset-bottom))] lg:pb-0"
        }
      >
        {children}
      </main>
      {hideDashboardChrome ? null : (
        <MobileBottomNav
          navGroups={navGroups}
          userName={userName}
          userRole={userRole}
          userInitial={userInitial}
          showSidebarLogout={showSidebarLogout}
        />
      )}
    </div>
  );
}
