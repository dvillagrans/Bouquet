"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";

const groups = [
  {
    label: "Operaciones",
    items: [
      { label: "Mesas & QR",     href: "/dashboard/mesas" },
      { label: "Menú digital",   href: "/dashboard/menu"  },
      { label: "Monitor cocina", href: "/cocina"          },
    ],
  },
  {
    label: "Análisis",
    items: [
      { label: "Reportes", href: "/dashboard/reportes" },
    ],
  },
  {
    label: "Equipo",
    items: [
      { label: "Personal",      href: "/dashboard/staff"    },
      { label: "Configuración", href: "/dashboard/settings" },
    ],
  },
];

interface SidebarProps {
  open?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ open = false, onClose }: SidebarProps) {
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

      {/* Logo */}
      <div
        className="flex items-center justify-between border-b border-wire px-7 py-6"
        style={{ animation: "fade-in 0.4s ease-out both" }}
      >
        <Link href="/" className="inline-flex items-baseline gap-2 transition-opacity duration-200 hover:opacity-60">
          <span className="font-serif text-[1.5rem] font-semibold italic tracking-tight text-light">
            bouquet
          </span>
          <span className="text-[0.46rem] font-bold uppercase tracking-[0.34em] text-dim">ops</span>
        </Link>

        {/* Mobile close button */}
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar menú"
            className="flex h-8 w-8 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light lg:hidden"
          >
            <X className="h-3.5 w-3.5" aria-hidden="true" />
          </button>
        )}
      </div>

      {/* Subtitle — desktop only */}
      <div
        className="hidden border-b border-wire px-7 py-3 lg:block"
        style={{ animation: "fade-in 0.4s ease-out 0.05s both" }}
      >
        <p className="text-[0.55rem] font-bold uppercase tracking-[0.3em] text-dim/40">
          Panel de control
        </p>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-4 py-5" aria-label="Navegación principal">
        {groups.map(({ label: groupLabel, items }, gi) => (
          <div
            key={groupLabel}
            className="mb-6"
            style={{ animation: `fade-in 0.35s ease-out ${0.12 + gi * 0.08}s both` }}
          >
            <p className="mb-2 px-3 text-[0.5rem] font-bold uppercase tracking-[0.38em] text-dim/35">
              {groupLabel}
            </p>
            {items.map(({ label, href }, ii) => {
              const active = pathname === href || pathname.startsWith(href + "/");
              return (
                <Link
                  key={href}
                  href={href}
                  onClick={onClose}
                  className={[
                    "relative mb-0.5 flex min-h-[44px] items-center px-3 text-[0.78rem] font-semibold",
                    "transition-[color,background-color] duration-150",
                    active
                      ? "bg-glow/[0.07] text-light before:absolute before:left-0 before:top-0 before:h-full before:w-[2px] before:bg-glow"
                      : "text-dim hover:bg-white/[0.03] hover:text-light",
                  ].join(" ")}
                  style={{
                    animation: `fade-in 0.3s ease-out ${0.18 + gi * 0.08 + ii * 0.05}s both`,
                  }}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User */}
      <div
        className="border-t border-wire px-7 py-5"
        style={{ animation: "fade-in 0.35s ease-out 0.5s both" }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border border-wire text-[0.65rem] font-bold uppercase text-dim">
            D
          </div>
          <div>
            <p className="text-[0.75rem] font-semibold text-light">Dueño</p>
            <p className="text-[0.58rem] font-medium text-dim/50">Administrador</p>
          </div>
        </div>
      </div>

    </aside>
  );
}
