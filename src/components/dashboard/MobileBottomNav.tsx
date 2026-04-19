"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Ellipsis, LogOut } from "lucide-react";
import { NavGroup } from "./Sidebar";
import { useMobileNav } from "./MobileNavContext";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import {
  resolveNavHref,
  restaurantBaseFromPathname,
  toCanonicalDashboardPath,
} from "@/lib/dashboard-nav";

type NavItem = NavGroup["items"][number];

type MobileBottomNavProps = {
  navGroups: NavGroup[];
  userName?: string;
  userRole?: string;
  userInitial?: string;
  showSidebarLogout?: boolean;
};

/** Coincidencia por prefijo (rutas anidadas). Incluye URLs `/restaurant/[id]/...` → equivalente `/dashboard/...`. */
function hrefMatchesPath(pathname: string, href: string) {
  const logical = toCanonicalDashboardPath(pathname);
  return logical === href || logical.startsWith(`${href}/`);
}

/** Entre varios enlaces, el activo debe ser el prefijo más largo (p. ej. /cadena/zonas gana a /cadena). */
function bestMatchHref(pathname: string, items: NavItem[]): string | null {
  let best: string | null = null;
  for (const it of items) {
    if (!hrefMatchesPath(pathname, it.href)) continue;
    if (!best || it.href.length > best.length) best = it.href;
  }
  return best;
}

function flattenNavGroups(groups: NavGroup[]) {
  const seen = new Set<string>();
  const items: NavItem[] = [];

  for (const group of groups) {
    for (const item of group.items) {
      if (seen.has(item.href)) continue;
      seen.add(item.href);
      items.push(item);
    }
  }

  return items;
}

export default function MobileBottomNav({
  navGroups,
  userName,
  userRole,
  userInitial,
  showSidebarLogout,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const restaurantBase = restaurantBaseFromPathname(pathname);
  const router = useRouter();
  const { open, toggle, close } = useMobileNav();
  const items = flattenNavGroups(navGroups);
  const activeHref = bestMatchHref(pathname, items);
  const handleLogout = async () => {
    await fetch("/api/admin/logout", { method: "POST" });
    close();
    router.push("/admin/login");
    router.refresh();
  };

  const activeIndex = activeHref ? items.findIndex((item) => item.href === activeHref) : -1;
  const primaryItems =
    activeIndex >= 3 && items[activeIndex]
      ? [...items.slice(0, 2), items[activeIndex]].filter((item, index, array) => array.findIndex((it) => it.href === item.href) === index)
      : items.slice(0, 3);

  return (
    <>
      {/* Viñeta + barra: zona del pulgar, targets ≥44px, más aire en landscape */}
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center bg-gradient-to-t from-bg-solid via-bg-solid/55 to-transparent px-4 pt-10 pb-[calc(1.625rem+env(safe-area-inset-bottom))] sm:px-6 sm:pt-14 sm:pb-[calc(1.875rem+env(safe-area-inset-bottom))] landscape:px-5 landscape:pt-6 landscape:pb-[calc(1.25rem+env(safe-area-inset-bottom))] lg:hidden">
        <nav
          className="pointer-events-auto relative isolate w-[min(20.5rem,calc(100vw-2.25rem))] max-w-full shrink-0 overflow-hidden rounded-[2.35rem] border border-white/[0.14] bg-white/[0.06] p-1.5 shadow-[0_12px_48px_-12px_rgba(0,0,0,0.65),inset_0_1px_0_rgba(255,255,255,0.11),inset_0_0_0_1px_rgba(255,255,255,0.04)] backdrop-blur-[48px] backdrop-saturate-[1.85] [-webkit-backdrop-filter:blur(48px)_saturate(1.85)] ring-1 ring-white/[0.04] sm:w-[min(28rem,calc(100vw-2.75rem))]"
          aria-label="Navegación móvil"
        >
          {/* Capas “vidrio”: brillo superior + reflejo suave */}
          <div
            className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/[0.14] via-white/[0.03] to-transparent opacity-90"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute inset-x-6 top-0 h-[1px] rounded-full bg-gradient-to-r from-transparent via-white/45 to-transparent blur-[0.5px]"
            aria-hidden
          />
          <div className="relative z-[1] flex w-full max-w-full items-stretch justify-between gap-1 px-1 py-1 sm:gap-2">
          {primaryItems.map((item) => {
            const active = activeHref !== null && item.href === activeHref;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={resolveNavHref(item.href, restaurantBase)}
                className={`group relative flex min-h-[52px] min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1.5 rounded-[1.25rem] px-2 py-1.5 transition-all duration-500 ease-out active:scale-95 ${
                  active
                    ? "text-gold"
                    : "text-text-muted hover:text-white"
                }`}
                aria-current={active ? "page" : undefined}
              >
                {active ? (
                  <span className="absolute inset-0 rounded-[1.25rem] border border-gold/20 bg-[linear-gradient(180deg,rgba(183,146,93,0.15)_0%,rgba(183,146,93,0.05)_100%)] shadow-[0_8px_16px_-6px_rgba(183,146,93,0.25)] backdrop-blur-md" />
                ) : (
                  <span className="absolute inset-0 scale-95 rounded-[1.25rem] bg-white/5 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
                )}
                <Icon
                  className={`relative z-10 size-5 shrink-0 transition-transform duration-500 ease-out sm:size-6 ${
                    active ? "scale-110 drop-shadow-[0_2px_8px_rgba(183,146,93,0.6)]" : "group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:text-white"
                  }`}
                  aria-hidden
                />
                <span className={`relative z-10 line-clamp-1 max-w-[6rem] text-center text-[10px] font-bold uppercase tracking-[0.15em] transition-colors duration-300 sm:max-w-[7rem] sm:text-[11px] ${
                  active ? "text-gold" : "text-text-dim group-hover:text-white"
                }`}>
                  {item.label}
                </span>
              </Link>
            );
          })}

          <button
            type="button"
            onClick={toggle}
            className="group relative flex min-h-[52px] min-w-0 flex-1 touch-manipulation flex-col items-center justify-center gap-1.5 rounded-[1.25rem] px-2 py-1.5 text-text-muted transition-all duration-500 ease-out hover:text-white active:scale-95"
            aria-label="Abrir menú"
          >
            <span className="absolute inset-0 scale-95 rounded-[1.25rem] bg-white/5 opacity-0 transition-all duration-300 group-hover:scale-100 group-hover:opacity-100" />
            <Ellipsis className="relative z-10 size-5 shrink-0 transition-transform duration-500 ease-out group-hover:-translate-y-0.5 group-hover:scale-105 group-hover:text-white sm:size-6" aria-hidden />
            <span className="relative z-10 line-clamp-1 max-w-[6rem] text-center text-[10px] font-bold uppercase tracking-[0.15em] text-text-dim transition-colors duration-300 group-hover:text-white sm:max-w-[7rem] sm:text-[11px]">
              Más
            </span>
          </button>
          </div>
        </nav>
      </div>

      <Sheet open={open} onOpenChange={(next) => (next ? toggle() : close())}>
        <SheetContent
          side="bottom"
          showCloseButton={false}
          className="rounded-t-[2.25rem] border-x-0 border-b-0 border-t border-white/[0.12] bg-white/[0.07] p-0 text-text-primary shadow-[0_-16px_56px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.1)] outline-none backdrop-blur-[44px] backdrop-saturate-[1.75] [-webkit-backdrop-filter:blur(44px)_saturate(1.75)]"
        >
          <div className="pointer-events-none absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white/[0.10] to-transparent opacity-70" aria-hidden />
          {/* iOS-style Drag Handle */}
          <div className="absolute left-1/2 top-3 z-10 h-1.5 w-11 -translate-x-1/2 rounded-full bg-white/25 shadow-[0_1px_2px_rgba(0,0,0,0.35)]" />

          <div className="relative z-[1] mx-auto max-w-lg px-4 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-9 sm:px-6 sm:pt-10">
            <SheetHeader className="px-0 pb-5 text-center sm:pb-6">
              <SheetTitle className="font-serif text-[clamp(1.25rem,4.5vw,1.375rem)] font-medium tracking-tight text-white sm:text-[22px]">
                Más opciones
              </SheetTitle>
              <SheetDescription className="mt-1.5 text-[13px] leading-relaxed text-neutral-400 sm:text-[12px] sm:leading-normal">
                Accesos secundarios y acciones de cuenta
              </SheetDescription>
            </SheetHeader>

            <div className="space-y-4 sm:space-y-5">
              {userName ? (
                <div className="rounded-[1.25rem] border border-white/5 bg-white/5 p-4 shadow-inner">
                  <div className="flex items-center gap-3.5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-gold/30 to-gold/10 text-[11px] font-semibold uppercase text-gold shadow-[inset_0_1px_1px_rgba(255,255,255,0.2)] ring-1 ring-gold/20">
                      {userInitial || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-[13px] font-medium tracking-tight text-white">{userName}</div>
                      <div className="truncate text-[10px] uppercase tracking-[0.1em] text-neutral-400">{userRole}</div>
                    </div>
                  </div>
                </div>
              ) : null}

              {navGroups.map((group) => (
                <div key={group.label} className="space-y-2">
                  <div className="pl-1 text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-500">
                    {group.label}
                  </div>
                  <div className="overflow-hidden rounded-[1.25rem] border border-white/5 bg-white/5 shadow-inner">
                    {group.items.map((item, idx, arr) => {
                      const active = activeHref !== null && item.href === activeHref;
                      const Icon = item.icon;
                      return (
                        <Link
                          key={item.href}
                          href={resolveNavHref(item.href, restaurantBase)}
                          onClick={close}
                          className={`relative flex min-h-[48px] touch-manipulation items-center gap-3 px-4 py-3.5 text-[15px] transition-colors active:bg-white/10 sm:text-[13px] ${
                            active
                              ? "bg-gold/10 text-gold"
                              : "text-neutral-300 hover:bg-white/[0.08] hover:text-white"
                          } ${idx < arr.length - 1 ? "border-b border-white/5" : ""}`}
                          aria-current={active ? "page" : undefined}
                        >
                          <Icon className={`size-5 shrink-0 sm:size-[1.125rem] ${active ? "text-gold shadow-sm" : "text-neutral-400"}`} aria-hidden />
                          <span className="font-medium leading-snug tracking-tight">{item.label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              ))}

              {showSidebarLogout ? (
                <button
                  type="button"
                  onClick={() => void handleLogout()}
                  className="flex min-h-[48px] w-full touch-manipulation items-center justify-center gap-2 rounded-[1.25rem] border border-red-500/20 bg-red-500/10 px-4 py-3.5 text-[15px] font-medium text-red-400 shadow-inner transition-colors active:bg-red-500/20 hover:bg-red-500/15 hover:text-red-300 sm:text-[13px]"
                >
                  <LogOut className="size-[1.125rem] shrink-0" aria-hidden />
                  Cerrar sesión
                </button>
              ) : null}
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}