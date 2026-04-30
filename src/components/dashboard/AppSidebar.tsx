"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LogOut } from "lucide-react";
import { NavGroup } from "./Sidebar";
import { getNavIcon } from "@/lib/nav-icons";
import {
  canonicalPathMatchesNavHref,
  resolveNavHref,
  restaurantBaseFromPathname,
  toCanonicalDashboardPath,
} from "@/lib/dashboard-nav";

export function AppSidebar({
  groups,
  userInitial,
  userName,
  userRole,
  showSidebarLogout,
}: {
  groups: NavGroup[];
  userInitial?: string;
  userName?: string;
  userRole?: string;
  showSidebarLogout?: boolean;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [loggingOut, setLoggingOut] = useState(false);
  const restaurantBase = restaurantBaseFromPathname(pathname);
  const pathForNavMatch = toCanonicalDashboardPath(pathname);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch("/api/logout", { method: "POST" });
      router.push("/admin/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setLoggingOut(false);
    }
  };

  const bestMatchHref = (items: NavGroup["items"]) => {
    let best: string | null = null;
    for (const it of items) {
      if (!canonicalPathMatchesNavHref(pathForNavMatch, it.href)) continue;
      if (!best || it.href.length > best.length) best = it.href;
    }
    return best;
  };

  return (
    <aside
      className="hidden lg:flex lg:flex-col lg:sticky inset-y-0 left-0 top-0 z-40 h-svh w-[240px] shrink-0 overflow-hidden border-r border-border-main bg-bg-bar/60 text-[13px] text-text-primary antialiased backdrop-blur-3xl backdrop-saturate-[1.8] [-webkit-backdrop-filter:blur(40px)_saturate(1.8)] shadow-[1px_0_0_rgba(255,255,255,0.03)]"
    >
      <div className="px-6 py-5 border-b border-border-main shrink-0 flex items-center justify-between">
        <Link
          href="/"
          className="font-sans font-light text-base tracking-[0.18em] text-text-secondary hover:text-text-primary transition-colors flex items-baseline lg:text-[14px]"
        >
          bouquet{" "}
          <span className="text-gold text-[9px] tracking-[0.3em] ml-[2px] uppercase align-super font-medium">
            ops
          </span>
        </Link>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border-main shrink-0">
        <input
          className="w-full bg-bg-solid border border-border-main rounded px-3 py-2 text-xs text-text-primary font-sans outline-none transition-colors placeholder:text-text-faint focus:border-border-bright focus:text-text-secondary"
          type="text"
          placeholder="Buscar..."
        />
      </div>

      {/* Nav groups */}
      <nav className="flex-1 min-h-0 py-5 overflow-y-auto w-full scrollbar-none">
        {groups.map((group) => {
          const activeHref = bestMatchHref(group.items);
          return (
            <div key={group.label} className="mb-7 w-full">
            <div className="text-[9px] font-semibold tracking-[0.24em] uppercase text-text-void px-5 mb-2 w-full">
              {group.label}
            </div>

              {group.items.map((item) => {
                const isActive = activeHref === item.href;
                const Icon = getNavIcon(item.icon);

                if (isActive) {
                  return (
                    <Link
                      key={item.label}
                      href={resolveNavHref(item.href, restaurantBase)}
                      className="flex items-center gap-3 px-5 py-2.5 text-[12.5px] text-gold cursor-pointer transition-all border-l-2 bg-gradient-to-r from-gold-faint to-transparent border-gold w-full decoration-none"
                    >
                      <Icon
                        className="w-4 h-4 opacity-100 fill-none stroke-[1.75px] shrink-0"
                        aria-hidden="true"
                      />
                      <span className="font-sans font-medium">{item.label}</span>
                    </Link>
                  );
                }
                return (
                  <Link
                    key={item.label}
                    href={resolveNavHref(item.href, restaurantBase)}
                    className="flex items-center gap-3 px-5 py-2.5 text-[12.5px] text-text-dim cursor-pointer transition-all border-l-2 border-transparent hover:bg-bg-hover hover:text-text-muted w-full decoration-none"
                  >
                    <Icon
                      className="w-4 h-4 opacity-50 fill-none stroke-[1.75px] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-sans">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}
        </nav>

      {/* User + salir (admin) */}
      {(userName || showSidebarLogout) && (
        <div className="px-4 py-4 border-t border-border-main shrink-0 w-full space-y-2">
          {userName ? (
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-default transition-colors hover:bg-bg-hover group w-full">
              <div className="w-[32px] h-[32px] rounded-full bg-gold-faint border border-gold-dim flex items-center justify-center text-[10px] font-medium text-gold shrink-0 uppercase">
                {userInitial || "U"}
              </div>
              <div className="flex flex-col truncate flex-1 min-w-0">
                <div className="text-[12px] font-medium text-text-secondary leading-[1.2] group-hover:text-text-primary transition-colors truncate">
                  {userName}
                </div>
                <div className="text-[10px] text-text-dim tracking-[0.06em] mt-0.5 truncate uppercase">
                  {userRole}
                </div>
              </div>
              <div className="w-[6px] h-[6px] rounded-full bg-dash-green shadow-[0_0_6px_var(--color-dash-green)] shrink-0 animate-pulse ml-auto" />
            </div>
          ) : null}
          {showSidebarLogout ? (
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex w-full items-center gap-2.5 rounded-md border border-border-main bg-transparent px-3 py-2.5 text-left text-[12px] font-medium text-text-dim transition-colors hover:border-dash-red/35 hover:bg-bg-hover hover:text-dash-red disabled:opacity-50 cursor-pointer"
            >
              <LogOut className="size-4 shrink-0 opacity-70" aria-hidden />
              {loggingOut ? "Saliendo…" : "Cerrar sesión"}
            </button>
          ) : null}
        </div>
      )}
    </aside>
  );
}
