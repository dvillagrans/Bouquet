"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { getNavIcon } from "@/lib/nav-icons";

export type NavItem = { label: string; href: string; icon: string };
export type NavGroup = { label: string; items: NavItem[] };

export const defaultRestaurantGroups: NavGroup[] = [
  {
    label: "Visión Operativa",
    items: [
      { label: "Panel Principal", href: "/dashboard",       icon: "Store"      },
    ],
  },
  {
    label: "Operaciones",
    items: [
      { label: "Mesas & QR",     href: "/dashboard/mesas",   icon: "LayoutGrid" },
      { label: "Menú digital",   href: "/dashboard/menu",    icon: "BookOpen"   },
      { label: "Monitor cocina", href: "/cocina",             icon: "ChefHat"    },
      { label: "Vista mesero",   href: "/mesero",             icon: "UserRound"  },
    ],
  },
  {
    label: "Análisis",
    items: [
      { label: "Reportes", href: "/dashboard/reportes", icon: "BarChart3" },
    ],
  },
  {
    label: "Equipo",
    items: [
      { label: "Personal",      href: "/dashboard/staff",    icon: "Users"     },
      { label: "Configuración", href: "/dashboard/settings", icon: "Settings2" },
    ],
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
  groups?: NavGroup[];
  userInitial?: string;
  userName?: string;
  userRole?: string;
}

export default function Sidebar({ 
  open = false, 
  onClose,
  groups = defaultRestaurantGroups,
  userInitial = "D",
  userName = "Dueño",
  userRole = "Administrador"
}: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside
      className={[
        "fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r border-wire bg-ink",
        "transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)]",
        "lg:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full",
      ].join(" ")}
    >
      {/* ── Logo ── */}
      <div
        className="flex items-center justify-between border-b border-wire px-7 py-6"
        style={{ animation: "fade-in 0.4s ease-out both" }}
      >
        <Link
          href="/"
          className="inline-flex items-baseline gap-2 transition-opacity duration-200 hover:opacity-60"
        >
          <span className="font-serif text-[1.5rem] font-semibold italic tracking-tight text-light">
            bouquet
          </span>
          <span className="text-[0.46rem] font-bold uppercase tracking-[0.34em] text-dim">ops</span>
        </Link>

        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex min-h-[44px] min-w-[44px] items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light focus-visible:ring-2 focus-visible:ring-ring touch-manipulation lg:hidden"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* ── Subtitle ── */}
      <div
        className="hidden border-b border-wire px-7 py-3 lg:block"
        style={{ animation: "fade-in 0.4s ease-out 0.05s both" }}
      >
        <p className="text-[0.55rem] font-bold uppercase tracking-[0.3em] text-dim/60">
          Panel de control
        </p>
      </div>

      {/* ── Nav ── */}
      <nav
        className="flex-1 overflow-y-auto px-3 py-5"
        aria-label="Navegación principal"
      >
        {groups.map(({ label: groupLabel, items }, gi) => (
          <div
            key={groupLabel}
            className="md:mb-5"
            style={{ animation: `fade-in 0.35s ease-out ${0.12 + gi * 0.08}s both` }}
          >
            <p className="mt-6 mb-2 px-5 text-[0.48rem] font-bold uppercase tracking-[0.38em] text-dim/35 md:mt-0 md:mb-1 md:px-3">
              {groupLabel}
            </p>

            {items.map(({ label, href, icon }, ii) => {
              const Icon = getNavIcon(icon);
              const active =
                pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  aria-current={active ? "page" : undefined}
                  className={[
                    "relative mb-2 flex min-h-[48px] touch-manipulation items-center gap-3 px-5 text-[0.78rem] font-semibold",
                    "transition-[color,background-color] duration-150 focus-visible:ring-2 focus-visible:ring-ring",
                    active
                      ? "bg-accent text-accent-foreground md:bg-glow/[0.08] md:text-light md:before:absolute md:before:left-0 md:before:top-0 md:before:h-full md:before:w-[2px] md:before:bg-glow"
                      : "text-dim hover:bg-white/[0.03] hover:text-light",
                    "md:mb-0.5 md:min-h-[42px] md:px-3",
                  ].join(" ")}
                  style={{
                    animation: `fade-in 0.3s ease-out ${0.18 + gi * 0.08 + ii * 0.05}s both`,
                  }}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 transition-colors ${
                      active ? "text-glow md:text-glow" : "text-dim/60"
                    }`}
                    aria-hidden="true"
                  />
                  <span className="flex-1">{label}</span>
                  <span className="text-dim/40" aria-hidden="true">›</span>
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* ── User ── */}
      <div
        className="border-t border-wire px-6 py-5 shrink-0"
        style={{ animation: "fade-in 0.35s ease-out 0.5s both" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-glow/30 bg-glow/10 text-[0.65rem] font-bold uppercase text-glow">
            {userInitial}
          </div>
          <div className="min-w-0">
            <p className="truncate text-[0.75rem] font-semibold text-light">{userName}</p>
            <p className="truncate text-[0.58rem] font-medium text-dim/50">{userRole}</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
