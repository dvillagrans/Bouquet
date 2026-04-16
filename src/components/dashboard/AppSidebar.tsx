"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavGroup } from "./Sidebar";
import { useMobileNav } from "./MobileNavContext";

export function AppSidebar({
  groups,
  userInitial,
  userName,
  userRole,
}: {
  groups: NavGroup[];
  userInitial?: string;
  userName?: string;
  userRole?: string;
}) {
  const pathname = usePathname();
  const { open, close } = useMobileNav();

  const bestMatchHref = (items: NavGroup["items"]) => {
    let best: string | null = null;
    for (const it of items) {
      const matches = pathname === it.href || pathname.startsWith(it.href + "/");
      if (!matches) continue;
      if (!best || it.href.length > best.length) best = it.href;
    }
    return best;
  };

  return (
    <>
      {/* Backdrop — mobile only */}
      <div
        className={`fixed inset-0 z-30 bg-bg-solid/70 backdrop-blur-sm lg:hidden transition-opacity duration-300 ${
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={close}
        aria-hidden="true"
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:sticky inset-y-0 left-0 top-0 z-40
          flex h-svh w-[240px] shrink-0 flex-col overflow-hidden
          border-r border-border-main bg-bg-bar
          text-[13px] text-text-primary antialiased
          transition-transform duration-300 ease-in-out
          ${open ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
        `}
      >
        {/* Logo + close button (mobile) */}
        <div className="px-6 py-5 border-b border-border-main shrink-0 flex items-center justify-between">
          <Link
            href="/"
            className="font-sans font-light text-[14px] tracking-[0.18em] text-text-secondary hover:text-text-primary transition-colors flex items-baseline"
          >
            bouquet{" "}
            <span className="text-gold text-[9px] tracking-[0.3em] ml-[2px] uppercase align-super font-medium">
              ops
            </span>
          </Link>

          {/* Close button — only visible on mobile */}
          <button
            onClick={close}
            className="lg:hidden w-7 h-7 flex items-center justify-center text-text-dim hover:text-text-primary transition-colors rounded cursor-pointer"
            aria-label="Cerrar menú"
          >
            <svg
              className="w-4 h-4 stroke-current fill-none stroke-[2px]"
              viewBox="0 0 24 24"
            >
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
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

                if (isActive) {
                  return (
                    <Link
                      key={item.label}
                      href={item.href}
                      onClick={close}
                      className="flex items-center gap-3 px-5 py-2.5 text-[12.5px] text-gold cursor-pointer transition-all border-l-2 bg-gradient-to-r from-gold-faint to-transparent border-gold w-full decoration-none"
                    >
                      <item.icon
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
                    href={item.href}
                    onClick={close}
                    className="flex items-center gap-3 px-5 py-2.5 text-[12.5px] text-text-dim cursor-pointer transition-all border-l-2 border-transparent hover:bg-bg-hover hover:text-text-muted w-full decoration-none"
                  >
                    <item.icon
                      className="w-4 h-4 opacity-50 fill-none stroke-[1.75px] shrink-0"
                      aria-hidden="true"
                    />
                    <span className="font-sans">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )})}
        </nav>

        {/* User footer */}
        {userName && (
          <div className="px-4 py-4 border-t border-border-main shrink-0 w-full">
            <div className="flex items-center gap-3 px-3 py-2.5 rounded-md cursor-pointer transition-colors hover:bg-bg-hover group w-full">
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
          </div>
        )}
      </aside>
    </>
  );
}
