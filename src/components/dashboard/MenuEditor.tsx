"use client";

import { useState } from "react";
import { Plus, Search, Edit2, Trash2, Image as ImageIcon, CheckCircle2, XCircle } from "lucide-react";

type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isPopular: boolean;
  isSoldOut: boolean;
};

const MOCK_ITEMS: MenuItem[] = [
  { id: "1", name: "Hamburguesa Clásica", description: "Carne de res, queso, lechuga, tomate y aderezo.", price: 180, category: "Platos Principales", isPopular: true, isSoldOut: false },
  { id: "2", name: "Papas a la Francesa", description: "Porción de papas crujientes con sal de mar.", price: 60, category: "Entradas", isPopular: false, isSoldOut: false },
  { id: "3", name: "Limonada de Menta", description: "Limonada fresca con hojas de menta.", price: 45, category: "Bebidas", isPopular: true, isSoldOut: false },
  { id: "4", name: "Cheesecake de Frambuesa", description: "Pastel de queso con jalea de frambuesa.", price: 90, category: "Postres", isPopular: false, isSoldOut: true },
];

const CATEGORIES = ["Todas", "Entradas", "Platos Principales", "Bebidas", "Postres"];

export default function MenuEditor() {
  const [items, setItems] = useState<MenuItem[]>(MOCK_ITEMS);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Todas");

  const filteredItems = items.filter(item => 
    (activeCategory === "Todas" || item.category === activeCategory) &&
    (item.name.toLowerCase().includes(search.toLowerCase()))
  );

  const toggleStatus = (id: string, field: "isSoldOut" | "isPopular") => {
    setItems(items.map(item => item.id === id ? { ...item, [field]: !item[field] } : item));
  };

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Editor de Menú</h1>
          <p className="text-gray-400">Gestiona tus platillos, categorías y disponibilidad en tiempo real.</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-4 py-2 rounded-lg font-medium transition-colors">
          <Plus className="w-4 h-4" />
          <span>Nuevo Platillo</span>
        </button>
      </div>

      {/* Controles: Filtros y Búsqueda */}
      <div className="flex flex-col md:flex-row justify-between gap-4 bg-[#111] p-4 rounded-2xl border border-white/5">
        <div className="flex overflow-x-auto gap-2 scrollbar-hide pb-2 md:pb-0">
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                activeCategory === cat ? 'bg-amber-500/20 text-amber-500 border border-amber-500/50' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-transparent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="relative md:w-64 flex-shrink-0">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            type="text" 
            placeholder="Buscar platillo..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#0a0a0a] border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
          />
        </div>
      </div>

      {/* Lista de Platillos */}
      <div className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-white/5 border-b border-white/10 text-sm font-medium text-gray-400">
              <th className="p-4 font-medium">Platillo</th>
              <th className="p-4 font-medium hidden md:table-cell">Categoría</th>
              <th className="p-4 font-medium">Precio</th>
              <th className="p-4 font-medium text-center">Estado</th>
              <th className="p-4 font-medium text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {filteredItems.map(item => (
              <tr key={item.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-white/5 rounded-lg border border-white/10 flex items-center justify-center text-gray-500 flex-shrink-0">
                      <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium text-white flex items-center gap-2">
                        {item.name}
                        {item.isPopular && <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-500 border border-amber-500/20 uppercase tracking-wider">Top</span>}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 line-clamp-1 max-w-[200px] md:max-w-xs">{item.description}</p>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-sm text-gray-400 hidden md:table-cell">
                  <span className="bg-white/5 px-2.5 py-1 rounded border border-white/10">{item.category}</span>
                </td>
                <td className="p-4 text-white font-medium">${item.price.toFixed(2)}</td>
                <td className="p-4">
                  <div className="flex justify-center">
                    <button 
                      onClick={() => toggleStatus(item.id, "isSoldOut")}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-all border ${
                        item.isSoldOut 
                          ? 'bg-red-500/10 text-red-500 border-red-500/20 hover:bg-red-500/20' 
                          : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500/20'
                      }`}
                    >
                      {item.isSoldOut ? <XCircle className="w-3.5 h-3.5" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                      {item.isSoldOut ? "Agotado" : "Disponible"}
                    </button>
                  </div>
                </td>
                <td className="p-4 text-right">
                  <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 text-gray-400 hover:text-amber-500 bg-white/5 hover:bg-amber-500/10 rounded-md transition-colors">
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-gray-400 hover:text-red-500 bg-white/5 hover:bg-red-500/10 rounded-md transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredItems.length === 0 && (
              <tr>
                <td colSpan={5} className="p-8 text-center text-gray-500">
                  No se encontraron platillos con estos filtros.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}