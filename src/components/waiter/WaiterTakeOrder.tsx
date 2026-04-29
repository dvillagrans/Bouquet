"use client";

import { useState, useEffect } from "react";
import { getMenuForOrdering, waiterCreateOrder } from "@/actions/waiter";
import { Plus, Minus, Send, CheckCheck, Loader2 } from "lucide-react";

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
  const [successFeedback, setSuccessFeedback] = useState(false);
  const [variantChoice, setVariantChoice] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadMenu = async () => {
      try {
        const data = await getMenuForOrdering();
        setCategories(data.categories || []);
        setItems(
          (data.items || []).map((it: any) => ({
            id: it.id,
            name: it.name,
            description: it.description,
            price: (it.priceCents || 0) / 100,
            imageUrl: it.imageUrl || null,
            categoryId: it.categoryId || it.category?.id || "",
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
      setSuccessFeedback(true);
      setTimeout(() => {
        setSuccessFeedback(false);
        onOrderAdded();
      }, 1500);
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
      <div className="relative -mx-4 px-4 sm:mx-0 sm:px-0">
        <div className="flex gap-2 overflow-x-auto pb-2 pr-8 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`shrink-0 px-4 py-2 rounded text-sm font-bold uppercase transition-all ${
                selectedCategory === cat.id
                  ? "bg-glow text-canvas"
                  : "border border-wire text-light hover:border-glow"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
        {/* Right fade gradient for mobile horizontal scroll hint */}
        <div className="pointer-events-none absolute right-0 top-0 bottom-2 w-12 bg-gradient-to-l from-bg-card to-transparent" />
      </div>

      <div className="flex flex-col gap-2 pb-2">
        {visibleItems.map((item) => {
          const hasVariants = item.variants && item.variants.length > 0;
          const vn = selectedVariantName(item);
          const up = unitPrice(item);
          return (
            <div
              key={item.id}
              className="flex flex-col border border-wire/50 rounded-lg p-3 hover:border-glow/40 transition-colors bg-canvas/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0 flex flex-col justify-center">
                  <h4 className="text-[0.95rem] font-bold text-light truncate">{item.name}</h4>
                  
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
                            {v.name}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <p className="font-mono text-glow">${up.toFixed(2)}</p>
                  <button
                    type="button"
                    onClick={() => addToCart(item)}
                    className="bg-glow/10 hover:bg-glow/30 text-glow p-2 rounded-xl transition-colors active:scale-95"
                    aria-label={`Agregar ${item.name}`}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
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

                <input
                  type="text"
                  placeholder="Instrucciones (ej: sin cebolla)"
                  value={item.notes}
                  onChange={(e) => updateNotes(item.key, e.target.value)}
                  className="w-full mt-2 px-3 py-1.5 bg-canvas/40 border border-wire/40 rounded text-light text-xs focus:outline-none focus:border-glow/50 placeholder:text-dim transition-colors"
                />
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
        disabled={submitting || successFeedback || cart.length === 0}
        className={`w-full px-4 py-3 rounded font-bold uppercase flex items-center justify-center gap-2 transition-colors ${
          successFeedback 
            ? "bg-dash-green text-bg-solid" 
            : "bg-glow hover:bg-glow/90 text-canvas disabled:opacity-50 disabled:cursor-not-allowed"
        }`}
      >
        {submitting ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Enviando...</>
        ) : successFeedback ? (
          <><CheckCheck className="h-4 w-4" /> Orden enviada a cocina</>
        ) : (
          <><Send className="h-4 w-4" /> Crear Orden</>
        )}
      </button>
    </div>
  );
}
