"use client";

import { AppSidebar } from "./AppSidebar";
import { NavGroup } from "./Sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
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
        <div className="flex min-h-screen w-full bg-bg-solid text-text-primary antialiased selection:bg-gold selection:text-bg-solid font-sans">
          <AppSidebar
            groups={navGroups}
            userName={userName}
            userRole={userRole}
            userInitial={userInitial}
          />
          {/* On mobile the sidebar is fixed/overlay, so main takes full width.
              On desktop the sidebar is sticky in the flex flow, so flex-1 applies. */}
          <main className="flex min-h-svh min-w-0 flex-1 flex-col">
            {children}
          </main>
        </div>
      </MobileNavProvider>
    </SidebarProvider>
  );
}
