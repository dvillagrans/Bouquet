"use client";

import { useState } from "react";
import Link from "next/link";

export type MenuItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  category: "entrada" | "plato" | "bebida" | "postre";
  image?: string;
  tags?: string[];
  isPopular?: boolean;
  isSoldOut?: boolean;
};

type MenuGridProps = {
  guestName: string;
  partySize: number;
  tableCode: string;
};

// Mock data - en producción vendría de la base de datos
const MENU_ITEMS: MenuItem[] = [
  {
    id: "1",
    name: "Ceviche Clásico",
    description: "Filete de pescado fresco marinado en limón con cebolla y cilantro",
    price: 185,
    category: "entrada",
    tags: ["pescado", "fresco", "sin gluten"],
    isPopular: true,
  },
  {
    id: "2",
    name: "Camarones al Ajillo",
    description: "Camarones salteados con ajo, mantequilla y vino blanco",
    price: 220,
    category: "entrada",
    tags: ["mariscos", "ajillo"],
  },
  {
    id: "3",
    name: "Pato Confitado",
    description: "Pechuga de pato en su jugo, acompañada de papas doradas y vegetales",
    price: 345,
    category: "plato",
    tags: ["pato", "gourmet"],
  },
  {
    id: "4",
    name: "Filete Mignon",
    description: "Filete de res premium de 250g con salsa demi-glace y hongos",
    price: 450,
    category: "plato",
    tags: ["res", "premium"],
    isPopular: true,
  },
  {
    id: "5",
    name: "Branzino a la Sal",
    description: "Filete de branzino fresco cocinado bajo corteza de sal",
    price: 320,
    category: "plato",
    tags: ["pescado", "salado"],
    isSoldOut: true,
  },
  {
    id: "6",
    name: "Risotto de Champiñones",
    description: "Risotto cremoso con champiñones frescos y queso parmesano",
    price: 210,
    category: "plato",
    tags: ["vegetariano", "cremoso"],
  },
  {
    id: "7",
    name: "Agua Fresca de Horchata",
    description: "Bebida refrescante tradicional con nueces y especias",
    price: 45,
    category: "bebida",
    tags: ["fresca", "tradicional"],
    isPopular: true,
  },
  {
    id: "8",
    name: "Vino Tinto Reserva",
    description: "Copa de vino tinto de la casa, selección premium",
    price: 95,
    category: "bebida",
    tags: ["vino", "premium"],
  },
  {
    id: "9",
    name: "Flan de Vainilla",
    description: "Flan clásico con caramelo casero y crema fresca",
    price: 85,
    category: "postre",
    tags: ["clásico", "cremoso"],
  },
  {
    id: "10",
    name: "Chocolate Derretido",
    description: "Chocolate belga derretido con frutos rojos y pan tostado",
    price: 110,
    category: "postre",
    tags: ["chocolate", "frutos"],
  },
];

type CartItem = MenuItem & { quantity: number; notes?: string };


export function MenuGrid({ guestName, partySize, tableCode }: MenuGridProps) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<MenuItem["category"] | "todos">("todos");
  const [searchQuery, setSearchQuery] = useState("");
  const [noteModalItem, setNoteModalItem] = useState<CartItem | null>(null);
  const [noteInput, setNoteInput] = useState("");

  const categories = [
    { value: "todos" as const, label: "Todo el menú" },
    { value: "entrada" as const, label: "Entradas" },
    { value: "plato" as const, label: "Platos principales" },
    { value: "bebida" as const, label: "Bebidas" },
    { value: "postre" as const, label: "Postres" },
  ];

  const filteredItems = MENU_ITEMS.filter((item) => {
    const matchesCategory = selectedCategory === "todos" || item.category === selectedCategory;
    const matchesSearch =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.tags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesSearch;
  });

  function addToCart(item: MenuItem) {
    if (item.isSoldOut) return;
    setCart((prev) => {
      const existing = prev.find((cartItem) => cartItem.id === item.id);
      if (existing) {
        return prev.map((cartItem) =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }

  function removeFromCart(itemId: string) {
    setCart((prev) => prev.filter((item) => item.id !== itemId));
  }

  function updateQuantity(itemId: string, quantity: number) {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  }

  function saveNote() {
    if (!noteModalItem) return;
    setCart((prev) =>
      prev.map((item) =>
        item.id === noteModalItem.id
          ? { ...item, notes: noteInput.trim() || undefined }
          : item
      )
    );
    setNoteModalItem(null);
    setNoteInput("");
  }

  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div data-guest-theme="light" className="space-y-8">
      {/* Header con info de la sesión */}
      <div className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-[0.63rem] font-semibold uppercase tracking-[0.28em] text-dim">
              Sesión activa
            </p>
            <h1 className="mt-2 font-sans text-4xl leading-tight text-light lg:text-5xl">
              Menú de{" "}
              <span className="bg-gradient-to-r from-glow via-light to-glow bg-clip-text text-transparent">
                {tableCode}
              </span>
            </h1>
            <p className="mt-3 text-base leading-relaxed text-light/75">
              Hola <span className="font-semibold text-glow">{guestName}</span>, grupo de{" "}
              <span className="font-semibold">{partySize}</span> persona{partySize === 1 ? "" : "s"}.
            </p>
          </div>
        </div>

        {/* Status badges */}
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-full border border-glow/30 bg-glow/8 px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-glow">
            <span className="h-1.5 w-1.5 rounded-full bg-glow animate-pulse" />
            En línea
          </span>
          <span className="rounded-full border border-wire bg-canvas px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.12em] text-dim">
            Orden lista para enviar
          </span>
        </div>
      </div>

      {/* Layout: Menú + Carrito */}
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* Menú */}
        <div className="space-y-6">
          {/* Controls: Search & Categories */}
          <div className="flex flex-col gap-4">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-dim" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="Buscar platillos, ingredientes..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-xl border border-wire bg-panel pl-10 pr-4 py-2.5 text-sm text-light placeholder-dim outline-none transition focus:border-glow focus:ring-1 focus:ring-glow/50"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-dim hover:text-light transition"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category filter */}
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={[
                    "rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.1em] transition",
                    selectedCategory === cat.value
                      ? "border border-glow bg-glow/15 text-glow"
                      : "border border-wire bg-canvas text-dim hover:border-glow/40 hover:text-light",
                  ].join(" ")}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Product grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className={`group relative overflow-hidden rounded-xl border p-4 transition ${
                  item.isSoldOut ? "border-wire/50 bg-panel/50 opacity-60 grayscale-[0.8]" : "border-wire bg-panel hover:border-glow/40"
                }`}
              >
                {/* Image placeholder */}
                <div className="relative aspect-square rounded-lg bg-gradient-to-br from-canvas via-panel to-ink mb-4 flex items-center justify-center text-dim text-xs">
                  {item.name[0]}
                  
                  {/* Badges */}
                  <div className="absolute top-2 left-2 flex flex-col gap-1.5">
                    {item.isPopular && (
                      <span className="rounded bg-glow px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-ink shadow-sm">
                        Popular
                      </span>
                    )}
                    {item.isSoldOut && (
                      <span className="rounded bg-wire px-2 py-0.5 text-[0.6rem] font-bold uppercase tracking-wider text-dim shadow-sm">
                        Agotado
                      </span>
                    )}
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className={`font-sans text-lg leading-tight ${item.isSoldOut ? "text-dim" : "text-light"}`}>{item.name}</h3>
                  <p className="text-xs leading-relaxed text-light/65 line-clamp-2">{item.description}</p>

                  {/* Tags */}
                  {item.tags && item.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-2">
                      {item.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full bg-glow/10 px-2 py-0.5 text-[0.6rem] font-semibold uppercase tracking-[0.08em] text-glow"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Price + Add button */}
                <div className="mt-4 flex items-center justify-between pt-4 border-t border-wire">
                  <div className={`font-mono text-lg font-semibold ${item.isSoldOut ? "text-dim" : "text-glow"}`}>${item.price}</div>
                  <button
                    onClick={() => addToCart(item)}
                    disabled={item.isSoldOut}
                    className="rounded-lg bg-glow px-3 py-2 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredItems.length === 0 && (
            <div className="rounded-xl border border-wire bg-panel p-12 text-center">
              <p className="text-light/65">No hay items en esta categoría</p>
            </div>
          )}
        </div>

        {/* Carrito (Sticky) */}
        <div className="lg:h-fit lg:sticky lg:top-6">
          <div className="space-y-4 rounded-xl border border-wire bg-panel p-5">
            <h2 className="font-sans text-xl text-light">Tu orden</h2>

            {cart.length === 0 ? (
              <p className="text-center text-sm text-light/65 py-8">
                Selecciona items del menú
              </p>
            ) : (
              <>
                {/* Cart items */}
                <div className="max-h-96 space-y-3 overflow-y-auto pr-1">
                  {cart.map((item) => (
                    <div key={item.id} className="flex flex-col gap-2 pb-3 border-b border-wire/50">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-light truncate">{item.name}</p>
                          <p className="text-xs text-light/60">${item.price} c/u</p>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="h-6 w-6 flex items-center justify-center rounded border border-wire bg-canvas text-xs text-light hover:border-glow/40 transition"
                          >
                            −
                          </button>
                          <span className="w-5 text-center text-xs font-semibold text-light">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="h-6 w-6 flex items-center justify-center rounded border border-wire bg-canvas text-xs text-light hover:border-glow/40 transition"
                          >
                            +
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="ml-1 text-xs text-light/50 hover:text-light transition"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      
                      {/* Notes Section */}
                      <div className="flex items-center gap-2">
                        {item.notes ? (
                          <div
                            onClick={() => {
                              setNoteModalItem(item);
                              setNoteInput(item.notes || "");
                            }}
                            className="flex-1 cursor-pointer rounded bg-canvas px-2 py-1.5 text-[0.65rem] text-light/70 hover:bg-wire/50 transition flex items-center gap-1"
                          >
                            <svg className="h-3 w-3 shrink-0 text-glow" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                            <span className="truncate">{item.notes}</span>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setNoteModalItem(item);
                              setNoteInput("");
                            }}
                            className="text-[0.65rem] text-glow hover:underline underline-offset-2 flex items-center gap-1"
                          >
                            <span>+ Agregar notas (ej. sin cebolla)</span>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Total */}
                <div className="space-y-3 border-t border-wire pt-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-light/70">Subtotal ({cartCount} item{cartCount === 1 ? "" : "s"})</span>
                    <span className="font-sans text-sm font-semibold text-light">${cartTotal}</span>
                  </div>
                  <Link 
                    href={`/mesa/${encodeURIComponent(tableCode)}/cuenta`}
                    className="flex w-full items-center justify-center rounded-lg bg-glow px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-ink transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
                  >
                    Enviar orden a cocina
                  </Link>
                  <button
                    onClick={() => setCart([])}
                    className="w-full rounded-lg border border-wire bg-transparent px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.12em] text-light/70 transition hover:border-wire hover:text-light"
                  >
                    Limpiar carrito
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Note Modal */}
      {noteModalItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[2rem] border border-wire bg-panel p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-sans text-xl text-light">Añadir instrucciones</h3>
              <button onClick={() => setNoteModalItem(null)} className="text-dim hover:text-light">✕</button>
            </div>
            <p className="text-sm text-dim mb-4">
              ¿Hay algo que debamos saber sobre este platillo: <span className="text-light">{noteModalItem.name}</span>?
            </p>
            <textarea
              autoFocus
              value={noteInput}
              onChange={(e) => setNoteInput(e.target.value)}
              placeholder="Ej: Sin cebolla, extra mayonesa..."
              className="w-full rounded-xl border border-wire bg-canvas p-3 text-sm text-light outline-none transition focus:border-glow resize-none min-h-[100px]"
            />
            <div className="mt-5 flex gap-3">
              <button
                onClick={() => setNoteModalItem(null)}
                className="flex-1 rounded-xl border border-wire py-3 text-xs font-semibold uppercase tracking-[0.1em] text-light transition hover:bg-canvas"
              >
                Cancelar
              </button>
              <button
                onClick={saveNote}
                className="flex-1 rounded-xl bg-glow py-3 text-xs font-semibold uppercase tracking-[0.1em] text-ink transition hover:brightness-110"
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
