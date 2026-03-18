"use client";

import { useState } from "react";
import { UserPlus, Shield, User, Key, MoreVertical, Edit2, Trash2, ChefHat, Coffee } from "lucide-react";

type StaffMember = {
  id: string;
  name: string;
  role: "Administrador" | "Mesero" | "Cocina" | "Barra";
  pin: string;
  status: "Activo" | "Inactivo";
};

const MOCK_STAFF: StaffMember[] = [
  { id: "1", name: "Carlos Dueñas", role: "Administrador", pin: "****", status: "Activo" },
  { id: "2", name: "Ana López", role: "Mesero", pin: "1234", status: "Activo" },
  { id: "3", name: "Miguel Chef", role: "Cocina", pin: "5678", status: "Activo" },
  { id: "4", name: "Luis Barman", role: "Barra", pin: "9012", status: "Inactivo" },
];

export default function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);

  const getRoleIcon = (role: string) => {
    switch(role) {
      case "Administrador": return <Shield className="w-4 h-4 text-purple-500" />;
      case "Mesero": return <User className="w-4 h-4 text-blue-500" />;
      case "Cocina": return <ChefHat className="w-4 h-4 text-amber-500" />;
      case "Barra": return <Coffee className="w-4 h-4 text-emerald-500" />;
      default: return <User className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Personal y Accesos</h1>
          <p className="text-gray-400">Gestiona los roles, permisos y PINs de tu equipo.</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <UserPlus className="w-4 h-4" />
          <span>Agregar Empleado</span>
        </button>
      </div>

      {/* Grid de Personal */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {staff.map((user) => (
          <div key={user.id} className="bg-[#111] border border-white/5 p-6 rounded-2xl relative group hover:border-white/10 transition-colors">
            
            <div className="flex justify-between items-start mb-4">
              <div className="flex gap-4 items-center">
                <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center border border-white/10 text-xl font-bold text-gray-300">
                  {user.name.charAt(0)}
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">{user.name}</h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {getRoleIcon(user.role)}
                    <span className="text-sm text-gray-400">{user.role}</span>
                  </div>
                </div>
              </div>
              <button className="text-gray-500 hover:text-white p-1">
                <MoreVertical className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm bg-black/50 p-2.5 rounded-lg border border-white/5">
                <span className="text-gray-500 flex items-center gap-2">
                  <Key className="w-4 h-4" /> PIN Acceso
                </span>
                <span className="text-white font-mono tracking-widest">{user.pin}</span>
              </div>
              
              <div className="flex justify-between items-center text-sm p-1">
                <span className="text-gray-400">Estado</span>
                <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider ${
                  user.status === "Activo" ? "bg-emerald-500/10 text-emerald-500" : "bg-red-500/10 text-red-500"
                }`}>
                  {user.status}
                </span>
              </div>
            </div>

            {/* Hover Actions */}
            <div className="absolute inset-0 bg-[#111]/90 rounded-2xl flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-[2px]">
              <button className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg font-medium transition-colors">
                <Edit2 className="w-4 h-4" /> Editar
              </button>
              <button className="flex items-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 px-4 py-2 rounded-lg font-medium transition-colors">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}
