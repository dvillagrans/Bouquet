/** @jsxImportSource react */
/** @jsxImportSource react */
"use client";

import { useMemo, useState, useTransition } from "react";
import { Plus, Search, Edit2, Trash2, X, ChefHat, GlassWater, Star, Layers } from "lucide-react";
import { toggleItemSoldOut, deleteMenuItem } from "@/actions/menu";

/* ── Types ──────────────────────────────────────────────────────── */
type Variant = { name: string; price: number };

type MenuItemDB = {
  id: string;
  name: string;
  description: string | null;
  priceCents?: number; // nuevo campo
  price: number; // calculado para UI
  variants: Variant[];
  categoryName: string;
  isPopular: boolean;
  isSoldOut: boolean;
  station?: string;
  archivedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
  restaurantId?: string;
  categoryId?: string;
};

type CategoryDB = {
  id: string;
  name: string;
};

/* ── Shared form classes ─────────────────────────────────────────── */
const inputCls  = "h-10 w-full border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30";
const selectCls = "h-10 w-full cursor-pointer appearance-none border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30";
const labelCls  = "mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim";

const priceSpinNone =
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

/** Campo de precio con prefijo $ (MXN). */
function PriceInputWithPrefix({
  value,
  onChange,
  readOnly,
  required,
  placeholder = "0.00",
  className = "",
  compact = false,
}: {
  value: string | number;
  onChange: (v: string) => void;
  readOnly?: boolean;
  required?: boolean;
  placeholder?: string;
  className?: string;
  /** Filas de VariantsEditor (más bajo y estrecho). */
  compact?: boolean;
}) {
  return (
    <div
      className={`flex w-full items-stretch border border-wire bg-transparent transition-colors focus-within:border-light/30 ${compact ? "h-9" : "h-10"} ${readOnly ? "opacity-40 pointer-events-none" : ""} ${className}`}
    >
      <span
        className={`flex flex-none items-center border-r border-wire/40 font-medium tabular-nums text-dim ${compact ? "px-2 text-[0.7rem]" : "px-2.5 text-[0.72rem]"}`}
      >
        $
      </span>
      <input
        type="number"
        min={0}
        step={0.01}
        value={value}
        onChange={e => onChange(e.target.value)}
        readOnly={readOnly}
        required={required}
        placeholder={placeholder}
        className={`min-w-0 flex-1 border-0 bg-transparent text-light outline-none ${priceSpinNone} ${compact ? "px-2 text-[0.78rem]" : "px-3 text-[0.8rem]"}`}
      />
    </div>
  );
}

/* ── Variants editor sub-component ─────────────────────────────── */
function VariantsEditor({
  variants,
  onChange,
}: {
  variants: Variant[];
  onChange: (v: Variant[]) => void;
}) {
  function addRow() {
    onChange([...variants, { name: "", price: 0 }]);
  }
  function updateRow(i: number, field: keyof Variant, value: string) {
    const updated = variants.map((v, idx) =>
      idx === i ? { ...v, [field]: field === "price" ? parseFloat(value) || 0 : value } : v
    );
    onChange(updated);
  }
  function removeRow(i: number) {
    onChange(variants.filter((_, idx) => idx !== i));
  }

  return (
    <div className="flex flex-col gap-2">
      {variants.map((v, i) => (
        <div key={i} className="flex items-center gap-2">
          <input
            type="text"
            placeholder="Nombre (Chico, Mediano…)"
            value={v.name}
            onChange={e => updateRow(i, "name", e.target.value)}
            className="h-9 flex-1 border border-wire bg-transparent px-2.5 text-[0.78rem] text-light outline-none focus:border-light/30"
          />
          <div className="w-[6.75rem] shrink-0">
            <PriceInputWithPrefix
              compact
              value={v.price || ""}
              onChange={val => updateRow(i, "price", val)}
              placeholder="0"
            />
          </div>
          <button
            type="button"
            onClick={() => removeRow(i)}
            className="flex h-9 w-9 shrink-0 items-center justify-center border border-wire text-dim hover:border-ember/40 hover:text-ember transition-colors"
          >
            <X className="h-3 w-3" />
          </button>
        </div>
      ))}
      <button
        type="button"
        onClick={addRow}
        className="flex items-center gap-1.5 border border-dashed border-wire px-3 py-2 text-[0.62rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light"
      >
        <Plus className="h-3 w-3" />
        Agregar tamaño
      </button>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function MenuEditor({
  initialCategories,
  initialItems,
}: {
  initialCategories: CategoryDB[];
  initialItems: MenuItemDB[];
}) {
  const [items, setItems]                     = useState<MenuItemDB[]>(initialItems);
  const [categories, setCategories]           = useState<CategoryDB[]>(initialCategories);
  const [search, setSearch]                   = useState("");
  const [activeCategory, setActiveCategory]   = useState<string>("Todas");
  const [isPending, startTransition]          = useTransition();

  /* form states */
  const [isAdding, setIsAdding]               = useState(false);
  const [newItem, setNewItem]                 = useState({
    name: "", description: "", price: "", categoryId: "",
    isPopular: false, station: "COCINA" as "COCINA" | "BARRA",
  });
  const [newVariants, setNewVariants]         = useState<Variant[]>([]);
  const [editingItem, setEditingItem]         = useState<MenuItemDB | null>(null);
  const [editForm, setEditForm]               = useState({
    name: "", description: "", price: "", categoryId: "", isPopular: false,
  });
  const [editVariants, setEditVariants]       = useState<Variant[]>([]);
  const [isAddingCat, setIsAddingCat]         = useState(false);
  const [newCatName, setNewCatName]           = useState("");

  /* ── Derived data ────────────────────────────────────────────── */
  type CategoryTab = { id: string; label: string; value: string };

  const CATEGORY_TABS = useMemo<CategoryTab[]>(
    () => [
      { id: "Todas", label: "Todas", value: "Todas" },
      ...categories.map(c => ({ id: c.id, label: c.name, value: c.name })),
    ],
    [categories],
  );

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { Todas: items.length };
    for (const item of items) {
      counts[item.categoryName] = (counts[item.categoryName] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const filtered = useMemo(
    () =>
      items.filter(
        item =>
          (activeCategory === "Todas" || item.categoryName === activeCategory) &&
          item.name.toLowerCase().includes(search.toLowerCase()),
      ),
    [items, activeCategory, search],
  );

  const stats = useMemo(() => {
    let disponibles = 0, agotados = 0, populares = 0;
    for (const item of items) {
      if (item.isSoldOut) agotados++; else disponibles++;
      if (item.isPopular) populares++;
    }
    return [
      { label: "Total",      value: items.length },
      { label: "Disponibles",value: disponibles  },
      { label: "Agotados",   value: agotados     },
      { label: "Populares",  value: populares    },
    ];
  }, [items]);

  /* ── Handlers ────────────────────────────────────────────────── */
  function handleCreateItem(e: React.FormEvent) {
    e.preventDefault();
    const hasVariants = newVariants.length > 0;
    if (!newItem.name || !newItem.categoryId) return;
    if (!hasVariants && !newItem.price) return;
    // When variants exist, use the lowest variant price as base price
    const basePrice = hasVariants
      ? Math.min(...newVariants.map(v => v.price))
      : parseFloat(newItem.price);
    startTransition(async () => {
      const { createMenuItem } = await import("@/actions/menu");
      const created = (await createMenuItem({
        name:        newItem.name,
        description: newItem.description || undefined,
        price:       basePrice,
        categoryId:  newItem.categoryId,
        isPopular:   newItem.isPopular,
        station:     newItem.station,
        variants:    newVariants,
      })) as any;
      const catName = categories.find(c => c.id === newItem.categoryId)?.name || "";
      setItems(prev => [...prev, { ...created, price: (created.priceCents || 0) / 100, categoryName: catName, variants: newVariants }]);
      setIsAdding(false);
      setNewItem({ name: "", description: "", price: "", categoryId: "", isPopular: false, station: "COCINA" });
      setNewVariants([]);
    });
  }

  function openEdit(item: MenuItemDB) {
    setEditingItem(item);
    setEditForm({
      name:       item.name,
      description:item.description || "",
      price:      item.price.toString(),
      categoryId: categories.find(c => c.name === item.categoryName)?.id || "",
      isPopular:  item.isPopular,
    });
    setEditVariants(item.variants ?? []);
  }

  function handleEditItem(e: React.FormEvent) {
    e.preventDefault();
    if (!editingItem || !editForm.name || !editForm.categoryId) return;
    const hasVariants = editVariants.length > 0;
    if (!hasVariants && !editForm.price) return;
    const basePrice = hasVariants
      ? Math.min(...editVariants.map(v => v.price))
      : parseFloat(editForm.price);
    const catName = categories.find(c => c.id === editForm.categoryId)?.name || editingItem.categoryName;
    setItems(prev => prev.map(item =>
      item.id === editingItem.id
        ? { ...item, name: editForm.name, description: editForm.description || null,
            price: basePrice, categoryName: catName, isPopular: editForm.isPopular,
            variants: editVariants }
        : item
    ));
    setEditingItem(null);
    startTransition(async () => {
      const { updateMenuItem } = await import("@/actions/menu");
      await updateMenuItem(editingItem.id, {
        name:        editForm.name,
        description: editForm.description || undefined,
        price:       basePrice,
        categoryId:  editForm.categoryId,
        isPopular:   editForm.isPopular,
        variants:    editVariants,
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

  function handleCreateCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!newCatName.trim()) return;
    const name = newCatName.trim();
    setIsAddingCat(false);
    setNewCatName("");
    startTransition(async () => {
      const { createCategory } = await import("@/actions/menu");
      const cat = await createCategory(name);
      if (!cat.id) return;
      setCategories(prev => (prev.some(c => c.id === cat.id) ? prev : [...prev, cat]));
    });
  }

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen px-4 py-6 sm:px-6 sm:py-8 lg:px-12 lg:py-12">

      {/* ── Header ────────────────────────────────────────────── */}
      <div
        className="mb-10 border-b border-wire pb-8"
        style={{ animation: "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
          Gestión de menú
        </p>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
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
                className="h-11 w-52 border border-wire bg-transparent pl-8 pr-4 text-[0.78rem] text-light placeholder:text-dim/40 outline-none transition-colors focus:border-light/20"
              />
            </div>
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex min-h-[44px] items-center gap-2 border border-wire px-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-all hover:border-light/20 hover:text-light hover:-translate-y-px active:translate-y-0"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              Nuevo platillo
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div className="mb-10 grid grid-cols-2 divide-x divide-y divide-wire border border-wire sm:grid-cols-4 sm:divide-y-0">
        {stats.map(({ label, value }, i) => (
          <div
            key={label}
            className="px-6 py-5"
            style={{ animation: `dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.08 + i * 0.06}s both` }}
          >
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">{label}</p>
            <p className="mt-1 font-serif text-[2rem] font-semibold leading-none text-light">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Modal: Nuevo platillo ─────────────────────────────── */}
      {isAdding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm">
          <div
            className="w-full max-w-md border border-wire bg-canvas p-8"
            style={{ animation: "scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <p className="mb-1 text-[0.52rem] font-bold uppercase tracking-[0.44em] text-dim">Registro</p>
            <h2 className="mb-8 font-serif text-[1.6rem] font-medium leading-none text-light">Nuevo platillo</h2>
            <form onSubmit={handleCreateItem} className="flex flex-col gap-5">
              <div>
                <label className={labelCls}>Nombre</label>
                <input required type="text" value={newItem.name} onChange={e => setNewItem({ ...newItem, name: e.target.value })} className={inputCls} placeholder="Ej. Tacos de ribey" />
              </div>
              <div>
                <label className={labelCls}>Descripción</label>
                <textarea rows={2} value={newItem.description} onChange={e => setNewItem({ ...newItem, description: e.target.value })} className="w-full resize-none border border-wire bg-transparent p-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30" placeholder="Ingredientes, preparación…" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelCls}>
                    {newVariants.length > 0 ? "Precio base (auto)" : "Precio"}
                  </label>
                  <PriceInputWithPrefix
                    value={newVariants.length > 0 ? Math.min(...newVariants.map(v => v.price)) || "" : newItem.price}
                    onChange={v => setNewItem({ ...newItem, price: v })}
                    readOnly={newVariants.length > 0}
                    required={newVariants.length === 0}
                  />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Categoría</label>
                  <select required value={newItem.categoryId} onChange={e => setNewItem({ ...newItem, categoryId: e.target.value })} className={selectCls}>
                    <option value="" className="bg-ink text-dim">Seleccionar</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-ink">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Variants / Tamaños */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelCls + " mb-0 flex items-center gap-1.5"}>
                    <Layers className="h-3 w-3" />
                    Tamaños
                  </label>
                  {newVariants.length === 0 && (
                    <span className="text-[0.58rem] text-dim/50">Opcional — Chico, Mediano, Grande…</span>
                  )}
                </div>
                <VariantsEditor variants={newVariants} onChange={setNewVariants} />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelCls}>Estación KDS</label>
                  <select value={newItem.station} onChange={e => setNewItem({ ...newItem, station: e.target.value as "COCINA" | "BARRA" })} className={selectCls}>
                    <option value="COCINA" className="bg-ink">Cocina</option>
                    <option value="BARRA"  className="bg-ink">Barra</option>
                  </select>
                </div>
                <div className="flex flex-1 items-end pb-2">
                  <label className="flex cursor-pointer items-center gap-2.5">
                    <input type="checkbox" checked={newItem.isPopular} onChange={e => setNewItem({ ...newItem, isPopular: e.target.checked })} className="accent-glow h-4 w-4" />
                    <span className="text-[0.72rem] font-medium text-light">Platillo popular</span>
                  </label>
                </div>
              </div>
              <div className="mt-2 flex gap-3 border-t border-wire/50 pt-5">
                <button type="button" onClick={() => setIsAdding(false)} className="flex-1 border border-wire py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light">
                  Cancelar
                </button>
                <button type="submit" disabled={isPending} className="flex-1 bg-light py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-ink transition-all hover:-translate-y-px hover:bg-light/90 disabled:opacity-50">
                  {isPending ? "Guardando…" : "Guardar"}
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
                <textarea rows={2} value={editForm.description} onChange={e => setEditForm({ ...editForm, description: e.target.value })} className="w-full resize-none border border-wire bg-transparent p-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className={labelCls}>
                    {editVariants.length > 0 ? "Precio base (auto)" : "Precio"}
                  </label>
                  <PriceInputWithPrefix
                    value={editVariants.length > 0 ? Math.min(...editVariants.map(v => v.price)) || "" : editForm.price}
                    onChange={v => setEditForm({ ...editForm, price: v })}
                    readOnly={editVariants.length > 0}
                    required={editVariants.length === 0}
                  />
                </div>
                <div className="flex-1">
                  <label className={labelCls}>Categoría</label>
                  <select required value={editForm.categoryId} onChange={e => setEditForm({ ...editForm, categoryId: e.target.value })} className={selectCls}>
                    <option value="" className="bg-ink text-dim">Seleccionar</option>
                    {categories.map(c => (
                      <option key={c.id} value={c.id} className="bg-ink">{c.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              {/* Variants / Tamaños */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className={labelCls + " mb-0 flex items-center gap-1.5"}>
                    <Layers className="h-3 w-3" />
                    Tamaños
                  </label>
                  {editVariants.length === 0 && (
                    <span className="text-[0.58rem] text-dim/50">Opcional — Chico, Mediano, Grande…</span>
                  )}
                </div>
                <VariantsEditor variants={editVariants} onChange={setEditVariants} />
              </div>
              <div className="flex items-center gap-2.5 pt-1">
                <label className="flex cursor-pointer items-center gap-2.5">
                  <input type="checkbox" checked={editForm.isPopular} onChange={e => setEditForm({ ...editForm, isPopular: e.target.checked })} className="accent-glow h-4 w-4" />
                  <span className="text-[0.72rem] font-medium text-light">Platillo popular</span>
                </label>
              </div>
              <div className="mt-2 flex gap-3 border-t border-wire/50 pt-5">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 min-h-[44px] border border-wire py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="flex-1 min-h-[44px] bg-light py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-ink transition-all hover:-translate-y-px hover:bg-light/90 disabled:opacity-50"
                >
                  {isPending ? "Guardando…" : "Guardar cambios"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Category tabs + "agregar categoría" ───────────────── */}
      <div
        className="mb-8 flex items-end gap-0 border-b border-wire"
        style={{ animation: "fade-in 0.4s ease-out 0.15s both" }}
      >
        {/* Tabs */}
        <div className="flex flex-1 overflow-x-auto scrollbar-hide">
          {CATEGORY_TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveCategory(tab.value)}
              className={[
                "group shrink-0 whitespace-nowrap px-4 pb-3 pt-2 min-h-[44px] transition-colors",
                activeCategory === tab.value
                  ? "border-b-[1.5px] border-glow text-glow"
                  : "text-dim hover:text-light",
              ].join(" ")}
            >
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.22em]">{tab.label}</span>
              <span className={[
                "ml-1.5 text-[0.55rem] font-semibold tabular-nums",
                activeCategory === tab.value ? "text-glow/60" : "text-dim/40",
              ].join(" ")}>
                {categoryCounts[tab.value] ?? 0}
              </span>
            </button>
          ))}
        </div>

        {/* Add category */}
        <div className="shrink-0 pb-2 pl-3">
          {isAddingCat ? (
            <form onSubmit={handleCreateCategory} className="flex items-center gap-1.5">
              <input
                type="text"
                value={newCatName}
                onChange={e => setNewCatName(e.target.value)}
                placeholder="Nombre…"
                autoFocus
                className="h-11 w-32 border border-glow/40 bg-transparent px-2.5 text-[0.72rem] text-light outline-none focus:border-glow"
              />
              <button
                type="submit"
                disabled={isPending || !newCatName.trim()}
                className="h-11 border border-glow/40 px-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-glow transition-colors hover:bg-glow/10 disabled:opacity-40"
              >
                OK
              </button>
              <button
                type="button"
                onClick={() => { setIsAddingCat(false); setNewCatName(""); }}
                className="flex h-11 w-11 items-center justify-center text-dim transition-colors hover:text-light"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </form>
          ) : (
            <button
              onClick={() => setIsAddingCat(true)}
              className="flex h-11 items-center gap-1.5 border border-wire px-3 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-dim transition-colors hover:border-light/20 hover:text-light"
            >
              <Plus className="h-3 w-3" />
              Categoría
            </button>
          )}
        </div>
      </div>

      {/* ── Items grid ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-wire py-20">
          <p className="text-[0.8rem] font-medium text-dim">No se encontraron platillos.</p>
          <button
            onClick={() => { setSearch(""); setActiveCategory("Todas"); }}
            className="mt-3 text-[0.72rem] font-semibold text-glow underline underline-offset-4"
          >
            Limpiar filtros
          </button>
        </div>
      ) : (
        <div className="flex flex-col border-t border-wire divide-y divide-wire mt-4">
          {filtered.map((item, i) => (
            <div
              key={item.id}
              className={[
                "group flex flex-row items-center justify-between px-6 transition-all duration-300 hover:bg-wire/10",
                item.isSoldOut ? "opacity-50 grayscale-[0.8]" : "",
              ].join(" ")}
              style={{
                animation: `dash-row-enter 0.35s cubic-bezier(0.22,1,0.36,1) ${0.12 + Math.min(i * 0.035, 0.28)}s both`,
              }}
            >
              {/* Popular accent line */}
              {item.isPopular && !item.isSoldOut && (
                <div className="h-[2px] w-full bg-gradient-to-r from-glow/70 via-glow/30 to-transparent" />
              )}

              {/* Card body */}
              <div className="flex flex-1 flex-col p-5">

                {/* Top row: badges */}
                <div className="mb-3 flex items-center gap-2">
                  {/* Station badge */}
                  <span className={[
                    "flex items-center gap-1 border px-1.5 py-0.5 text-[0.48rem] font-bold uppercase tracking-[0.18em]",
                    item.station === "COCINA"
                      ? "border-sage-deep/30 text-sage-deep/70"
                      : "border-glow/30 text-glow/70",
                  ].join(" ")}>
                    {item.station === "COCINA"
                      ? <ChefHat   className="h-2.5 w-2.5" aria-hidden="true" />
                      : <GlassWater className="h-2.5 w-2.5" aria-hidden="true" />}
                    {item.station === "COCINA" ? "Cocina" : "Barra"}
                  </span>

                  {item.isPopular && (
                    <span className="flex items-center gap-1 border border-glow/40 px-1.5 py-0.5 text-[0.48rem] font-bold uppercase tracking-[0.18em] text-glow">
                      <Star className="h-2.5 w-2.5" aria-hidden="true" />
                      Popular
                    </span>
                  )}
                </div>

                {/* Name */}
                <p className={[
                  "text-[0.9rem] font-semibold leading-tight",
                  item.isSoldOut ? "text-dim line-through decoration-dim/50" : "text-light",
                ].join(" ")}>
                  {item.name}
                </p>

                {/* Description */}
                {item.description && (
                  <p className="mt-1.5 line-clamp-2 text-[0.68rem] font-medium leading-relaxed text-dim">
                    {item.description}
                  </p>
                )}

                {/* Category */}
                <p className="mt-auto pt-4 text-[0.52rem] font-bold uppercase tracking-[0.28em] text-dim/40">
                  {item.categoryName}
                </p>
              </div>

              {/* Card footer */}
              <div className="flex items-center justify-between gap-2 border-t border-wire px-5 py-3">
                {/* Price / Variants */}
                {item.variants && item.variants.length > 0 ? (
                  <div className="flex flex-wrap gap-1">
                    {item.variants.map((v) => (
                      <span
                        key={v.name}
                        className={[
                          "border px-2 py-0.5 text-[0.6rem] font-semibold",
                          item.isSoldOut ? "border-wire/40 text-dim/50" : "border-wire text-dim",
                        ].join(" ")}
                      >
                        {v.name} <span className="text-light/70">${v.price.toFixed(0)}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className={[
                    "font-serif text-[1.2rem] font-semibold tabular-nums",
                    item.isSoldOut ? "text-dim/60" : "text-light",
                  ].join(" ")}>
                    ${item.price.toFixed(0)}
                  </p>
                )}

                {/* Actions */}
                <div className="flex items-center gap-1.5">
                  {/* Sold-out toggle */}
                  <button
                    onClick={() => handleToggleSoldOut(item.id, item.isSoldOut)}
                    disabled={isPending}
                    className={[
                      "min-h-[44px] flex items-center gap-1.5 border px-3 py-2 text-[0.56rem] font-bold uppercase tracking-[0.2em] transition-all disabled:opacity-50",
                      item.isSoldOut
                        ? "border-wire text-dim hover:border-sage-deep/40 hover:text-sage-deep"
                        : "border-sage-deep/30 text-sage-deep hover:border-ember/40 hover:text-ember",
                    ].join(" ")}
                    title={item.isSoldOut ? "Marcar disponible" : "Marcar agotado"}
                  >
                    <span
                      className={`h-1.5 w-1.5 rounded-full ${item.isSoldOut ? "bg-dim" : "bg-sage-deep"}`}
                      aria-hidden="true"
                    />
                    {item.isSoldOut ? "Agotado" : "Disponible"}
                  </button>

                  <button
                    onClick={() => openEdit(item)}
                    aria-label={`Editar ${item.name}`}
                    className="flex h-11 w-11 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light"
                  >
                    <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    disabled={isPending}
                    aria-label={`Eliminar ${item.name}`}
                    className="flex h-11 w-11 items-center justify-center border border-wire text-dim transition-colors hover:border-ember/40 hover:text-ember disabled:opacity-50"
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
