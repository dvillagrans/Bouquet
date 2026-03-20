"use client";

import { useState, useEffect } from "react";
import { getMenuForOrdering, waiterCreateOrder } from "@/actions/waiter";
import { ChevronDown, Plus, Minus, Send } from "lucide-react";

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  categoryId: string;
  variants: { name: string; price: number }[];
}

interface Category {
  id: string;
  name: string;
  order: number;
}

function encodeLineKey(menuItemId: string, variantName: string | null): string {
  if (variantName == null || variantName === "") return menuItemId;
  return JSON.stringify({ m: menuItemId, v: variantName });
}

interface CartItem {
  key: string;
  menuItemId: string;
  name: string;
  variantName: string | null;
  quantity: number;
  notes: string;
  price: number;
}

export default function WaiterTakeOrder({
  tableId,
  onOrderAdded,
}: {
  tableId: string;
  onOrderAdded: () => void;
}) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [expandedNotes, setExpandedNotes] = useState<string | null>(null);
  const [variantChoice, setVariantChoice] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await getMenuForOrdering();
        setCategories(data.categories || []);
        setItems(
          (data.items || []).map((it: MenuItem) => ({
            ...it,
            variants: Array.isArray(it.variants) ? it.variants : [],
          }))
        );
        if (data.categories && data.categories.length > 0) {
          setSelectedCategory(data.categories[0].id);
        }
      } catch (error) {
        console.error("Error loading menu:", error);
      } finally {
        setLoading(false);
      }
    };

    loadMenu();
  }, []);

  const visibleItems = selectedCategory ? items.filter((i) => i.categoryId === selectedCategory) : [];

  function selectedVariantName(item: MenuItem): string | null {
    if (!item.variants?.length) return null;
    return variantChoice[item.id] ?? item.variants[0]!.name;
  }

  function unitPrice(item: MenuItem): number {
    const vn = selectedVariantName(item);
    if (!vn || !item.variants?.length) return item.price;
    return item.variants.find((v) => v.name === vn)?.price ?? item.price;
  }

  const addToCart = (item: MenuItem) => {
    const vn = selectedVariantName(item);
    const price = unitPrice(item);
    const key = encodeLineKey(item.id, vn);
    setCart((prev) => {
      const existing = prev.find((c) => c.key === key);
      if (existing) {
        return prev.map((c) =>
          c.key === key ? { ...c, quantity: c.quantity + 1 } : c
        );
      }
      return [
        ...prev,
        {
          key,
          menuItemId: item.id,
          name: item.name,
          variantName: vn,
          quantity: 1,
          notes: "",
          price,
        },
      ];
    });
  };

  const removeFromCart = (key: string) => {
    setCart((prev) => prev.filter((c) => c.key !== key));
  };

  const updateQuantity = (key: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(key);
    } else {
      setCart((prev) =>
        prev.map((c) => (c.key === key ? { ...c, quantity } : c))
      );
    }
  };

  const updateNotes = (key: string, notes: string) => {
    setCart((prev) =>
      prev.map((c) => (c.key === key ? { ...c, notes } : c))
    );
  };

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleSubmit = async () => {
    if (cart.length === 0) {
      alert("Agrega al menos un item");
      return;
    }

    try {
      setSubmitting(true);
      const orderItems = cart.map((c) => ({
        menuItemId: c.menuItemId,
        quantity: c.quantity,
        notes: c.notes || undefined,
        variantName: c.variantName ?? undefined,
      }));

      await waiterCreateOrder(tableId, orderItems);
      setCart([]);
      onOrderAdded();
    } catch (error) {
      alert("Error al crear orden: " + (error as Error).message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <p className="text-dim">Cargando menú...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded whitespace-nowrap text-sm font-bold uppercase transition-all ${
              selectedCategory === cat.id
                ? "bg-glow text-canvas"
                : "border border-wire text-light hover:border-glow"
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
        {visibleItems.map((item) => {
          const hasVariants = item.variants && item.variants.length > 0;
          const vn = selectedVariantName(item);
          const up = unitPrice(item);
          return (
            <div
              key={item.id}
              className="border border-wire rounded-lg p-3 hover:border-glow/40 transition-colors bg-canvas/50"
            >
              <h4 className="text-sm font-bold text-light line-clamp-2">{item.name}</h4>
              {item.description && (
                <p className="text-xs text-dim mt-1 line-clamp-1">{item.description}</p>
              )}
              {hasVariants && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {item.variants.map((v) => {
                    const active = vn === v.name;
                    return (
                      <button
                        key={v.name}
                        type="button"
                        onClick={() =>
                          setVariantChoice((prev) => ({ ...prev, [item.id]: v.name }))
                        }
                        className={`rounded px-2 py-0.5 text-[0.58rem] font-bold uppercase tracking-wide transition-colors ${
                          active
                            ? "bg-glow/25 text-glow border border-glow/50"
                            : "border border-wire/50 text-dim hover:text-light"
                        }`}
                      >
                        {v.name} ${v.price.toFixed(0)}
                      </button>
                    );
                  })}
                </div>
              )}
              <div className="flex items-end justify-between mt-2">
                <p className="font-mono text-glow">${up.toFixed(2)}</p>
                <button
                  type="button"
                  onClick={() => addToCart(item)}
                  className="bg-glow/20 hover:bg-glow/40 text-glow p-1 rounded transition-colors"
                  aria-label={`Agregar ${item.name}`}
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="border border-wire/50 rounded-lg bg-canvas/50 p-3 space-y-2">
        <h4 className="text-sm font-bold text-light">Carrito ({cart.length} líneas)</h4>

        {cart.length === 0 ? (
          <p className="text-xs text-dim">Ningún item agregado</p>
        ) : (
          <div className="space-y-3 max-h-48 overflow-y-auto">
            {cart.map((item) => (
              <div key={item.key} className="border border-wire/30 rounded p-2 bg-panel">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-light">{item.name}</p>
                    {item.variantName && (
                      <p className="text-[0.65rem] font-medium text-glow/90">{item.variantName}</p>
                    )}
                    <p className="text-xs text-glow">${item.price.toFixed(2)} c/u</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity - 1)}
                      className="text-dim hover:text-light p-1"
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <span className="text-light font-mono w-6 text-center">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.key, item.quantity + 1)}
                      className="text-dim hover:text-light p-1"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                </div>

                <button
                  onClick={() =>
                    setExpandedNotes(expandedNotes === item.key ? null : item.key)
                  }
                  className="text-xs text-dim hover:text-light mt-1 flex items-center gap-1 transition-colors"
                >
                  <ChevronDown
                    className={`h-3 w-3 transition-transform ${
                      expandedNotes === item.key ? "rotate-180" : ""
                    }`}
                  />
                  Instrucciones
                </button>
                {expandedNotes === item.key && (
                  <input
                    type="text"
                    placeholder="Ej: Sin cebolla, bien cocido..."
                    value={item.notes}
                    onChange={(e) => updateNotes(item.key, e.target.value)}
                    className="w-full mt-2 px-2 py-1 bg-canvas border border-wire/30 rounded text-light text-xs focus:outline-none focus:border-glow/50"
                  />
                )}
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <div className="border-t border-wire/30 pt-2 flex justify-between items-center">
            <span className="text-sm font-bold text-light">Total:</span>
            <span className="font-mono text-lg text-glow">${cartTotal.toFixed(2)}</span>
          </div>
        )}
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || cart.length === 0}
        className="w-full bg-glow hover:bg-glow/90 disabled:opacity-50 disabled:cursor-not-allowed text-canvas px-4 py-3 rounded font-bold uppercase flex items-center justify-center gap-2 transition-colors"
      >
        <Send className="h-4 w-4" /> Crear Orden
      </button>
    </div>
  );
}
