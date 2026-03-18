import Link from "next/link";
import { LayoutDashboard, UtensilsCrossed, QrCode, PieChart, Users, Settings, ChefHat } from "lucide-react";

export default function Sidebar() {
  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Gestión de Mesas", href: "/dashboard/mesas", icon: QrCode },
    { name: "Menú Digital", href: "/dashboard/menu", icon: UtensilsCrossed },
    { name: "Monitor Cocina", href: "/cocina", icon: ChefHat },
    { name: "Reportes", href: "/dashboard/reportes", icon: PieChart },
    { name: "Personal", href: "/dashboard/staff", icon: Users },
    { name: "Configuración", href: "/dashboard/settings", icon: Settings },
  ];

  return (
    <div className="w-64 h-screen bg-[#0a0a0a] border-r border-white/10 flex flex-col fixed left-0 top-0 text-gray-300">
      <div className="p-6 border-b border-white/10">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
          Bouquet Admin
        </h1>
        <p className="text-xs text-gray-500 mt-1">Panel de Control</p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 hover:text-white transition-colors group"
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />
              <span className="font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/10">
        <div className="flex items-center gap-3 px-3 py-2">
          <div className="w-8 h-8 rounded-full bg-amber-500/20 flex items-center justify-center border border-amber-500/50">
            <span className="text-amber-500 font-bold text-xs">D</span>
          </div>
          <div>
            <p className="text-sm font-medium text-white">Dueño</p>
            <p className="text-xs text-gray-500">Administrador</p>
          </div>
        </div>
      </div>
    </div>
  );
}
