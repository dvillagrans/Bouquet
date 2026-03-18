"use client";

import { useState, useTransition, useOptimistic } from "react";
import { Plus, Search, Edit2, Trash2 } from "lucide-react";
import { toggleItemSoldOut, deleteMenuItem } from "@/actions/menu";

type MenuItemDB = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryName: string;
  isPopular: boolean;
  isSoldOut: boolean;
};

type CategoryDB = {
  id: string;
  name: string;
};

export default function MenuEditor({ initialCategories, initialItems }: { initialCategories: CategoryDB[], initialItems: MenuItemDB[] }) {
  const [items, setItems]               = useState<MenuItemDB[]>(initialItems);
  const [search, setSearch]             = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [isPending, startTransition] = useTransition();
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState({
    name: "", description: "", price: "", categoryId: "", isPopular: false, station: "COCINA" as "COCINA" | "BARRA"
  });

  const CATEGORIES = ["Todas", ...initialCategories.map(c => c.name)];

  const filtered = items.filter(item =>
    (activeCategory === "Todas" || item.categoryName === activeCategory) &&
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    if (!newItem.name || !newItem.price || !newItem.categoryId) return;

    startTransition(async () => {
      const { createMenuItem } = await import("@/actions/menu");
      const created = await createMenuItem({
        name: newItem.name,
        description: newItem.description || undefined,
        price: parseFloat(newItem.price),
        categoryId: newItem.categoryId,
        isPopular: newItem.isPopular,
        station: newItem.station
      });

      const catName = initialCategories.find(c => c.id === newItem.categoryId)?.name || "";
      
      setItems(prev => [...prev, { ...created, categoryName: catName }]);
      setIsAdding(false);
      setNewItem({ name: "", description: "", price: "", categoryId: "", isPopular: false, station: "COCINA" });
    });
  }

  function handleToggleSoldOut(id: string, currentStatus: boolean) {
    // Optimistic update
    setItems(items.map(item => item.id === id ? { ...item, isSoldOut: !currentStatus } : item));
    startTransition(async () => {
      await toggleItemSoldOut(id, currentStatus);
    });
  }

  function handleDelete(id: string) {
    setItems(items.filter(item => item.id !== id));
    startTransition(async () => {
      await deleteMenuItem(id);
    });
  }

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-10 border-b border-wire pb-8" style={{ animation: "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
          Gestión de menú
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
            Menú digital
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim/50" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar platillo…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-10 w-52 border border-wire bg-transparent pl-8 pr-4 text-[0.78rem] text-light placeholder:text-dim/40 outline-none transition-colors focus:border-light/20"
              />
            </div>
            <button 
              onClick={() => setIsAdding(true)}
              className="inline-flex h-10 items-center gap-2 border border-wire px-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Nuevo platillo
            </button>
          </div>
        </div>
      </div>

      {/* ── Modal: Formulario Nuevo Platillo ───────────────── */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm">
          <div className="w-full max-w-md border border-wire bg-canvas p-8">
            <p className="mb-1 text-[0.52rem] font-bold uppercase tracking-[0.44em] text-dim">Registro</p>
            <h2 className="mb-8 font-serif text-[1.6rem] font-medium leading-none text-light">Nuevo Platillo</h2>

            <form onSubmit={handleCreateItem} className="flex flex-col gap-5">
              <div>
                <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">Nombre</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className="h-10 w-full border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none focus:border-light/30" />
              </div>

              <div>
                <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">Descripción</label>
                <textarea rows={2} value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full resize-none border border-wire bg-transparent p-3 text-[0.8rem] text-light outline-none focus:border-light/30" />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">Precio</label>
                  <input required type="number" min="0" step="0.01" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className="h-10 w-full border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none focus:border-light/30" />
                </div>
                <div className="flex-1">
                  <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">Categoría</label>
                  <select required value={newItem.categoryId} onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })} className="h-10 w-full cursor-pointer appearance-none border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none focus:border-light/30">
                    <option value="" className="bg-ink text-dim">Seleccionar</option>
                    {initialCategories.map(c => (
                      <option key={c.id} value={c.id} className="bg-ink">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-4">
                 <div className="flex-1">
                  <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">KDS Estación</label>
                  <select required value={newItem.station} onChange={e => setNewItem({ ...newItem, station: e.target.value as "COCINA"|"BARRA" })} className="h-10 w-full cursor-pointer appearance-none border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none focus:border-light/30">
                    <option value="COCINA" className="bg-ink">Cocina</option>
                    <option value="BARRA" className="bg-ink">Barra</option>
                  </select>
                </div>
                <div className="flex flex-1 items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2">
                    <input type="checkbox" checked={newItem.isPopular} onChange={e => setNewItem({ ...newItem, isPopular: e.target.checked })} className="accent-glow" />
                    <span className="text-[0.7rem] text-light">Es Platillo Top</span>
                  </label>
                </div>
              </div>

              <div className="mt-4 flex gap-3 pt-4 border-t border-wire/50">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 border border-wire py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="flex-1 bg-light py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-light/90 disabled:opacity-50">
                  {isPending ? "Guardando..." : "Guardar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Category tabs ───────────────────────────────────── */}
      <div className="mb-8 flex border-b border-wire overflow-x-auto scrollbar-hide" style={{ animation: "fade-in 0.4s ease-out 0.15s both" }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              "shrink-0 px-5 pb-3 pt-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] transition-colors whitespace-nowrap",
              activeCategory === cat
                ? "border-b-[1.5px] border-glow text-glow"
                : "text-dim hover:text-light",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Items list ──────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-wire py-16 text-center">
          <p className="text-[0.8rem] font-medium text-dim">No se encontraron platillos.</p>
          <button
            onClick={() => { setSearch(""); setActiveCategory("Todas"); }}
            className="mt-3 text-[0.72rem] font-semibold text-glow underline underline-offset-4"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="divide-y divide-wire border-t border-wire">
          {filtered.map((item, i) => (
            <div key={item.id} className="group flex flex-wrap items-center gap-4 py-4 transition-colors duration-150 hover:bg-ink/40 sm:flex-nowrap sm:gap-5" style={{ animation: `dash-row-enter 0.35s cubic-bezier(0.22,1,0.36,1) ${0.25 + Math.min(i * 0.05, 0.25)}s both` }}>

              {/* Name + desc */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline gap-2">
                  <p className="text-[0.85rem] font-semibold text-light">{item.name}</p>
                  {item.isPopular && (
                    <span className="border border-glow/40 px-1.5 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.18em] text-glow">
                      Top
                    </span>
                  )}
                </div>
                <p className="mt-0.5 truncate text-[0.7rem] font-medium text-dim max-w-xs">
                  {item.description}
                </p>
              </div>

              {/* Category */}
              <div className="hidden w-36 shrink-0 md:block">
                <p className="text-[0.55rem] font-bold uppercase tracking-[0.24em] text-dim">Categoría</p>
                <p className="mt-0.5 text-[0.75rem] font-medium text-light">{item.categoryName}</p>
              </div>

              {/* Price */}
              <div className="w-20 shrink-0 text-right">
                <p className="font-serif text-[1rem] font-semibold text-light">
                  ${item.price.toFixed(0)}
                </p>
              </div>

              {/* Status toggle */}
              <div className="w-28 shrink-0">
                <button
                  onClick={() => handleToggleSoldOut(item.id, item.isSoldOut)}
                  disabled={isPending}
                  className={[
                    "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-50",
                    item.isSoldOut
                      ? "border-ember/40 text-ember hover:border-ember hover:bg-ember/10"
                      : "border-sage-deep/40 text-sage-deep hover:border-sage-deep hover:bg-sage-deep/10",
                  ].join(" ")}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${item.isSoldOut ? "bg-ember" : "bg-sage-deep"}`} aria-hidden="true" />
                  {item.isSoldOut ? "Agotado" : "Disponible"}
                </button>
              </div>

              {/* Actions */}
              <div className="flex items-center gap-2 opacity-100 transition-opacity duration-150 lg:opacity-0 lg:group-hover:opacity-100">
                <button
                  aria-label={`Editar ${item.name}`}
                  className="flex h-9 w-9 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light"
                >
                  <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  disabled={isPending}
                  aria-label={`Eliminar ${item.name}`}
                  className="flex h-9 w-9 items-center justify-center border border-wire text-dim transition-colors hover:border-ember/40 hover:text-ember disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
}
