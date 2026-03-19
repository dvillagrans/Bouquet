"use client";

import { useMemo, useState, useTransition } from "react";
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

export default function MenuEditor({
  initialCategories,
  initialItems,
}: {
  initialCategories: CategoryDB[];
  initialItems: MenuItemDB[];
}) {
  const [items, setItems]                   = useState<MenuItemDB[]>(initialItems);
  const [search, setSearch]                 = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("Todas");
  const [isPending, startTransition]        = useTransition();

  const [isAdding, setIsAdding]             = useState(false);
  const [newItem, setNewItem]               = useState({
    name: "", description: "", price: "", categoryId: "",
    isPopular: false, station: "COCINA" as "COCINA" | "BARRA",
  });
  const [editingItem, setEditingItem] = useState<MenuItemDB | null>(null);
  const [editForm, setEditForm]       = useState({
    name: "", description: "", price: "", categoryId: "", isPopular: false,
  });

  const CATEGORIES = useMemo(
    () => ["Todas", ...initialCategories.map(c => c.name)],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const filtered = useMemo(
    () =>
      items.filter(
        item =>
          (activeCategory === "Todas" || item.categoryName === activeCategory) &&
          item.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, activeCategory, search],
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
        station: newItem.station,
      });

      const catName = initialCategories.find(c => c.id === newItem.categoryId)?.name || "";
      setItems(prev => [...prev, { ...created, categoryName: catName }]);
      setIsAdding(false);
      setNewItem({ name: "", description: "", price: "", categoryId: "", isPopular: false, station: "COCINA" });
    });
  }

  function openEdit(item: MenuItemDB) {
    setEditingItem(item);
    setEditForm({
      name: item.name,
      description: item.description || "",
      price: item.price.toString(),
      categoryId: initialCategories.find(c => c.name === item.categoryName)?.id || "",
      isPopular: item.isPopular,
    });
  }

  function handleEditItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem || !editForm.name || !editForm.price || !editForm.categoryId) return;

    const catName = initialCategories.find(c => c.id === editForm.categoryId)?.name || editingItem.categoryName;

    setItems(prev => prev.map(item =>
      item.id === editingItem.id
        ? { ...item, name: editForm.name, description: editForm.description || null,
            price: parseFloat(editForm.price), categoryName: catName, isPopular: editForm.isPopular }
        : item
    ));
    setEditingItem(null);

    startTransition(async () => {
      const { updateMenuItem } = await import("@/actions/menu");
      await updateMenuItem(editingItem.id, {
        name: editForm.name,
        description: editForm.description || undefined,
        price: parseFloat(editForm.price),
        categoryId: editForm.categoryId,
        isPopular: editForm.isPopular,
      });
    });
  }

  function handleToggleSoldOut(id: string, currentStatus: boolean) {
    setItems(items.map(item => item.id === id ? { ...item, isSoldOut: !currentStatus } : item));
    startTransition(async () => { await toggleItemSoldOut(id, currentStatus); });
  }

  function handleDelete(id: string) {
    setItems(items.filter(item => item.id !== id));
    startTransition(async () => { await deleteMenuItem(id); });
  }

  /* ── Shared form field classes ── */
  const inputCls = "h-10 w-full border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none focus:border-light/30";
  const selectCls = "h-10 w-full cursor-pointer appearance-none border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none focus:border-light/30";
  const labelCls = "mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim";

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12">

      {/* ── Header ────────────────────────────────────────────── */}
      <div
        className="mb-10 border-b border-wire pb-8"
        style={{ animation: "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
          Gestión de menú
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
            Menú digital
          </h1>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim/50"
                aria-hidden="true"
              />
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

      {/* ── Modal: Nuevo platillo ─────────────────────────────── */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm">
          <div
            className="w-full max-w-md border border-wire bg-canvas p-8"
            style={{ animation: "scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <p className="mb-1 text-[0.52rem] font-bold uppercase tracking-[0.44em] text-dim">Registro</p>
            <h2 className="mb-8 font-serif text-[1.6rem] font-medium leading-none text-light">Nuevo Platillo</h2>

            <form onSubmit={handleCreateItem} className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>Nombre</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={2} value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full resize-none border border-wire bg-transparent p-3 text-[0.8rem] text-light outline-none focus:border-light/30" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelCls}>Precio</label>
                  <input required type="number" min="0" step="0.01" value={newItem.price} onChange={e => setNewItem({ ...newItem, price: e.target.value })} className={inputCls} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Categoría</label>
                  <select required value={newItem.categoryId} onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })} className={selectCls}>
                    <option value="" className="bg-ink text-dim">Seleccionar</option>
                    {initialCategories.map(c => (
                      <option key={c.id} value={c.id} className="bg-ink">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelCls}>KDS Estación</label>
                  <select required value={newItem.station} onChange={e => setNewItem({ ...newItem, station: e.target.value as "COCINA" | "BARRA" })} className={selectCls}>
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
              <div className="mt-2 flex gap-3 border-t border-wire/50 pt-5">
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

      {/* ── Modal: Editar platillo ────────────────────────────── */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm">
          <div
            className="w-full max-w-md border border-wire bg-canvas p-8"
            style={{ animation: "scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <p className="mb-1 text-[0.52rem] font-bold uppercase tracking-[0.44em] text-dim">Edición</p>
            <h2 className="mb-8 font-serif text-[1.6rem] font-medium leading-none text-light">Editar platillo</h2>

            <form onSubmit={handleEditItem} className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>Nombre</label>
                <input required type="text" value={editForm.name} onChange={e => setEditForm({ ...editForm, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={2} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full resize-none border border-wire bg-transparent p-3 text-[0.8rem] text-light outline-none focus:border-light/30" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelCls}>Precio</label>
                  <input required type="number" min="0" step="0.01" value={editForm.price} onChange={e => setEditForm({ ...editForm, price: e.target.value })} className={inputCls} />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Categoría</label>
                  <select required value={editForm.categoryId} onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })} className={selectCls}>
                    <option value="" className="bg-ink text-dim">Seleccionar</option>
                    {initialCategories.map(c => (
                      <option key={c.id} value={c.id} className="bg-ink">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex items-center gap-2 pt-1">
                <label className="flex cursor-pointer items-center gap-2">
                  <input type="checkbox" checked={editForm.isPopular} onChange={e => setEditForm({ ...editForm, isPopular: e.target.checked })} className="accent-glow" />
                  <span className="text-[0.7rem] text-light">Es Platillo Top</span>
                </label>
              </div>
              <div className="mt-2 flex gap-3 border-t border-wire/50 pt-5">
                <button type="button" onClick={() => setEditingItem(null)} className="flex-1 border border-wire py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="flex-1 bg-light py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-light/90 disabled:opacity-50">
                  {isPending ? "Guardando..." : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Category tabs ─────────────────────────────────────── */}
      <div
        className="mb-8 flex overflow-x-auto border-b border-wire scrollbar-hide"
        style={{ animation: "fade-in 0.4s ease-out 0.15s both" }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={[
              "shrink-0 whitespace-nowrap px-5 pb-3 pt-2 text-[0.65rem] font-bold uppercase tracking-[0.22em] transition-colors",
              activeCategory === cat
                ? "border-b-[1.5px] border-glow text-glow"
                : "text-dim hover:text-light",
            ].join(" ")}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* ── Items grid ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="border border-dashed border-wire py-20 text-center">
          <p className="text-[0.8rem] font-medium text-dim">No se encontraron platillos.</p>
          <button
            onClick={() => { setSearch(""); setActiveCategory("Todas"); }}
            className="mt-3 text-[0.72rem] font-semibold text-glow underline underline-offset-4"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className="group flex flex-col border border-wire bg-canvas transition-all duration-200 hover:border-light/20"
              style={{
                animation: `dash-row-enter 0.35s cubic-bezier(0.22,1,0.36,1) ${0.18 + Math.min(i * 0.04, 0.28)}s both`,
              }}
            >
              {/* Card body */}
              <div className="flex flex-1 flex-col p-5">

                {/* Name + badges */}
                <div className="mb-3">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <p className="text-[0.88rem] font-semibold leading-tight text-light">
                      {item.name}
                    </p>
                    {item.isPopular && (
                      <span className="border border-glow/40 px-1.5 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.18em] text-glow">
                        Top
                      </span>
                    )}
                  </div>
                  {item.description && (
                    <p className="mt-1.5 line-clamp-2 text-[0.68rem] font-medium leading-relaxed text-dim">
                      {item.description}
                    </p>
                  )}
                </div>

                {/* Category pill */}
                <p className="text-[0.54rem] font-bold uppercase tracking-[0.26em] text-dim/50">
                  {item.categoryName}
                </p>
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between gap-3 border-t border-wire px-5 py-3">
                {/* Price */}
                <p className="font-serif text-[1.15rem] font-semibold text-light">
                  ${item.price.toFixed(0)}
                </p>

                {/* Status + actions */}
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleSoldOut(item.id, item.isSoldOut)}
                    disabled={isPending}
                    className={[
                      "flex items-center gap-1.5 border px-2.5 py-1 text-[0.58rem] font-bold uppercase tracking-[0.2em] transition-colors disabled:opacity-50",
                      item.isSoldOut
                        ? "border-ember/40 text-ember hover:border-ember hover:bg-ember/10"
                        : "border-sage-deep/40 text-sage-deep hover:border-sage-deep hover:bg-sage-deep/10",
                    ].join(" ")}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${item.isSoldOut ? "bg-ember" : "bg-sage-deep"}`}
                      aria-hidden="true"
                    />
                    {item.isSoldOut ? "Agotado" : "Disponible"}
                  </button>

                  <button
                    onClick={() => openEdit(item)}
                    aria-label={`Editar ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light"
                  >
                    <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    aria-label={`Eliminar ${item.name}`}
                    className="flex h-8 w-8 items-center justify-center border border-wire text-dim transition-colors hover:border-ember/40 hover:text-ember disabled:opacity-50"
                  >
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
