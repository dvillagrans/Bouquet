"use client";

import { useState } from "react";
import { Plus, Users, QrCode, Trash2, MoreVertical, Search, CheckCircle2, XCircle } from "lucide-react";

type TableStatus = "disponible" | "ocupada" | "sucia";

type Table = {
  id: string;
  number: number;
  capacity: number;
  code: string; // El códgio para la URL (ej: MESA-001)
  status: TableStatus;
};

// Datos simulados iniciales
const INITIAL_TABLES: Table[] = [
  { id: "1", number: 1, capacity: 2, code: "X7B9K2", status: "ocupada" },
  { id: "2", number: 2, capacity: 4, code: "M9P1L4", status: "disponible" },
  { id: "3", number: 3, capacity: 4, code: "A3C8N5", status: "disponible" },
  { id: "4", number: 4, capacity: 6, code: "Z5W2Q9", status: "sucia" },
  { id: "5", number: 5, capacity: 2, code: "J8R4D1", status: "ocupada" },
];

export default function TableManager() {
  const [tables, setTables] = useState<Table[]>(INITIAL_TABLES);
  const [search, setSearch] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newTableCap, setNewTableCap] = useState(4);

  // Filtrado de mesas
  const filteredTables = tables.filter(t => 
    t.number.toString().includes(search) || t.code.toLowerCase().includes(search.toLowerCase())
  );

  // Generar cadena aleatoria para QR
  const generateCode = () => Math.random().toString(36).substring(2, 8).toUpperCase();

  const handleCreateMenu = () => {
    const nextNumber = tables.length > 0 ? Math.max(...tables.map(t => t.number)) + 1 : 1;
    const newTable: Table = {
      id: Date.now().toString(),
      number: nextNumber,
      capacity: newTableCap,
      code: generateCode(),
      status: "disponible"
    };
    setTables([...tables, newTable]);
    setIsAdding(false);
    setNewTableCap(4);
  };

  const handleDelete = (id: string) => {
    setTables(tables.filter(t => t.id !== id));
  };

  const getStatusColor = (status: TableStatus) => {
    switch (status) {
      case "disponible": return "bg-emerald-500/20 text-emerald-400 border-emerald-500/20";
      case "ocupada": return "bg-blue-500/20 text-blue-400 border-blue-500/20";
      case "sucia": return "bg-red-500/20 text-red-400 border-red-500/20";
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Mesas y QR</h1>
          <p className="text-gray-400">Configura la distribución y genera los accesos para el comensal.</p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-64">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input 
              type="text" 
              placeholder="Buscar mesa o código..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#111] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
            />
          </div>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Nueva Mesa</span>
          </button>
        </div>
      </div>

      {/* Stats Quick View */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Mesas", value: tables.length, color: "text-white" },
          { label: "Disponibles", value: tables.filter(t => t.status === "disponible").length, color: "text-emerald-400" },
          { label: "Ocupadas", value: tables.filter(t => t.status === "ocupada").length, color: "text-blue-400" },
          { label: "Por Limpiar", value: tables.filter(t => t.status === "sucia").length, color: "text-red-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-[#111] border border-white/5 rounded-xl p-4">
            <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Modal Agregar Mesa */}
      {isAdding && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#111] border border-white/10 rounded-2xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold text-white mb-4">Agregar Nueva Mesa</h2>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1.5">Capacidad (Personas)</label>
                <div className="flex items-center gap-3">
                  {[2, 4, 6, 8, 10].map(cap => (
                    <button
                      key={cap}
                      onClick={() => setNewTableCap(cap)}
                      className={`flex-1 py-2 rounded-lg border text-sm font-medium transition-all ${
                        newTableCap === cap 
                        ? 'bg-amber-500/20 border-amber-500/50 text-amber-500' 
                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                      }`}
                    >
                      {cap}
                    </button>
                  ))}
                </div>
              </div>
              <p className="text-xs text-gray-500 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                El código QR de acceso se generará automáticamente.
              </p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setIsAdding(false)}
                className="flex-1 px-4 py-2 rounded-lg font-medium text-gray-400 hover:bg-white/5 transition-colors border border-transparent"
              >
                Cancelar
              </button>
              <button 
                onClick={handleCreateMenu}
                className="flex-1 px-4 py-2 rounded-lg font-medium bg-white text-black hover:bg-gray-200 transition-colors"
              >
                Crear Mesa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Grid de Mesas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTables.map((table) => (
          <div key={table.id} className="bg-[#0a0a0a] border border-white/10 rounded-2xl p-5 flex flex-col group hover:border-white/20 transition-all">
            
            {/* Cabecera Tarjeta */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10">
                  <span className="font-bold text-lg text-white">{table.number}</span>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-gray-400">Mesa</h3>
                  <div className={`px-2 py-0.5 mt-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(table.status)}`}>
                    {table.status}
                  </div>
                </div>
              </div>
              
              <button onClick={() => handleDelete(table.id)} className="p-1.5 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors opacity-0 group-hover:opacity-100">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Detalles de la Mesa */}
            <div className="grid grid-cols-2 gap-4 mb-5 flex-grow">
              <div className="bg-[#111] rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs font-medium">Asientos</span>
                </div>
                <span className="text-lg font-semibold text-white">{table.capacity}</span>
              </div>
              
              <div className="bg-[#111] rounded-lg p-3 border border-white/5">
                <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                  <QrCode className="w-4 h-4" />
                  <span className="text-xs font-medium">Código</span>
                </div>
                <span className="text-lg font-mono font-semibold text-amber-500 truncate">{table.code}</span>
              </div>
            </div>

            {/* Acciones */}
            <div className="pt-4 border-t border-white/10 flex gap-2">
              <button 
                onClick={() => window.open(`/mesa/${table.code}/menu`, "_blank")}
                className="flex-1 bg-white/5 hover:bg-white/10 text-white py-2 rounded-lg text-sm font-medium transition-colors border border-white/5 flex items-center justify-center gap-2"
              >
                <QrCode className="w-4 h-4" />
                Imprimir QR
              </button>
            </div>

          </div>
        ))}
        
        {filteredTables.length === 0 && (
          <div className="col-span-full py-12 text-center border-2 border-dashed border-white/10 rounded-2xl">
            <p className="text-gray-400 mb-2">No se encontraron mesas con esos filtros.</p>
            <button onClick={() => setSearch('')} className="text-amber-500 hover:underline text-sm font-medium">Limpiar búsqueda</button>
          </div>
        )}
      </div>

    </div>
  );
}
