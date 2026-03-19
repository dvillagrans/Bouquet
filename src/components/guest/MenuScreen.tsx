"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { submitComensalOrder } from "@/actions/comensal";

// ─── Types ──────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
}

interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  categoryId: string;
  categoryName?: string;
  note?: string;
}

// ─── QtyControl ──────────────────────────────────────────────────────────────

function QtyControl({
  qty,
  onAdd,
  onInc,
  onDec,
  name,
}: {
  qty: number;
  onAdd: () => void;
  onInc: () => void;
  onDec: () => void;
  name: string;
}) {
  if (qty === 0) {
    return (
      <button
        onClick={onAdd}
        aria-label={`Agregar ${name}`}
        className="flex h-11 w-11 items-center justify-center border border-wire text-dim transition-colors duration-150 hover:border-glow/60 hover:text-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    );
  }
  return (
    <div className="flex items-center">
      <button
        onClick={onDec}
        aria-label={`Quitar uno de ${name}`}
        className="flex h-11 w-11 items-center justify-center border border-glow/40 text-glow transition-colors hover:border-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
      <span className="w-8 text-center text-[0.82rem] font-bold tabular-nums text-glow">
        {qty}
      </span>
      <button
        onClick={onInc}
        aria-label={`Agregar otro de ${name}`}
        className="flex h-11 w-11 items-center justify-center border border-glow/40 text-glow transition-colors hover:border-glow focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

// ─── CartPanel ───────────────────────────────────────────────────────────────

interface CartPanelProps {
  cartItems: MenuItem[];
  cart: Record<string, number>;
  cartCount: number;
  cartTotal: number;
  partySize: number;
  tableCode: string;
  scrollable?: boolean;
  onRemove: (id: string) => void;
  onClear: () => void;
  onClose?: () => void;
  onCheckout: () => void;
  isSubmitting?: boolean;
}

function CartPanel({
  cartItems, cart, cartCount, cartTotal, partySize, tableCode,
  scrollable, onRemove, onClear, onClose, onCheckout, isSubmitting
}: CartPanelProps) {
  return (
    <>
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-serif text-[1.3rem] font-medium text-light">Tu orden</h2>
          <p className="mt-1 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-dim">
            Mesa {tableCode}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar orden"
            className="mt-1 shrink-0 text-[0.65rem] font-bold uppercase tracking-[0.28em] text-dim transition-colors hover:text-light"
          >
            Cerrar
          </button>
        )}
      </div>

      {cartCount === 0 ? (
        <p className="mt-8 text-[0.78rem] font-medium leading-relaxed text-dim">
          Selecciona platillos del menú para armar tu orden.
        </p>
      ) : (
        <>
          <div className={`mt-4 divide-y divide-wire/50 ${scrollable ? "max-h-[38vh] overflow-y-auto" : ""}`}>
            {cartItems.map(item => (
              <div key={item.id} className="flex items-start justify-between gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[0.82rem] font-medium leading-snug text-light">{item.name}</p>
                  <p className="mt-1 text-[0.65rem] text-dim">
                    {cart[item.id]}× · ${(item.price * (cart[item.id] ?? 0)).toLocaleString("es-MX")}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(item.id)}
                  aria-label={`Eliminar ${item.name}`}
                  className="mt-0.5 shrink-0 text-[0.62rem] text-dim/50 transition-colors hover:text-dim"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>

          <div className="mt-4 border-t border-wire pt-5">
            <div className="flex items-baseline justify-between">
              <span className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-dim">Total</span>
              <span className="font-serif text-[1.6rem] font-semibold leading-none text-glow">
                ${cartTotal.toLocaleString("es-MX")}
              </span>
            </div>
            <p className="mt-1 text-[0.58rem] text-dim">
              {cartCount} platillo{cartCount !== 1 ? "s" : ""} · {partySize} comensal{partySize !== 1 ? "es" : ""}
            </p>
          </div>

          <button
            onClick={onCheckout}
            disabled={isSubmitting}
            className="mt-6 block w-full bg-glow py-4 text-center text-[0.72rem] font-bold uppercase tracking-[0.22em] text-ink transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow disabled:opacity-50 disabled:hover:-translate-y-0"
          >
            {isSubmitting ? "Enviando..." : "Enviar orden"}
          </button>
          <button
            onClick={onClear}
            className="mt-3 w-full border border-wire py-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-dim transition-colors hover:border-light/20 hover:text-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
          >
            Vaciar
          </button>
        </>
      )}
    </>
  );
}

// ─── MenuScreen ──────────────────────────────────────────────────────────────

interface MenuScreenProps {
  guestName: string;
  partySize: number;
  tableCode: string;
  initialCategories: Category[];
  initialItems: MenuItem[];
}

type CartMap = Record<string, number>;

export function MenuScreen({ guestName, partySize, tableCode, initialCategories, initialItems }: MenuScreenProps) {
  const router = useRouter();
  const [cart, setCart]               = useState<CartMap>({});
  const [activeCategory, setCategory] = useState<string>("todos");
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [isPending, startTransition]  = useTransition();
  const [orderSuccess, setOrderSuccess] = useState(false);

      function handleCheckout() {
    startTransition(async () => {
      try {
        const orderItems = Object.entries(cart).map(([id, qty]) => ({
          menuItemId: id,
          quantity: qty,
        }));
        
        await submitComensalOrder({
          tableCode,
          guestName,
          pax: partySize,
          items: orderItems,
        });

        // En lugar de ir a pagar, vaciamos carrito, cerramos cajon y avisamos que se mando a la cocina
        setCart({});
        setDrawerOpen(false);
        setOrderSuccess(true);
        setTimeout(() => setOrderSuccess(false), 3000);
      } catch (err) {
        console.error("No se pudo enviar la orden", err);
        alert("Ocurrió un error al enviar la orden. Intenta de nuevo.");
      }
    });
  }



  function setQty(id: string, qty: number) {
    setCart(prev => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: qty };
    });
  }

  const cartItems = initialItems.filter(item => (cart[item.id] ?? 0) > 0);
  const cartCount = Object.values(cart).reduce((s, q) => s + q, 0);
  const cartTotal = cartItems.reduce((s, item) => s + item.price * (cart[item.id] ?? 0), 0);

  const visibleItems = activeCategory === "todos" ? initialItems : initialItems.filter(i => i.categoryId === activeCategory);
  
  // Categorias que tienen al menos un item visible
  const visibleCats = initialCategories.filter(
    cat => visibleItems.some(i => i.categoryId === cat.id)
  );

  const cartPanelProps = {
    cartItems, cart, cartCount, cartTotal, partySize, tableCode,
    onRemove: (id: string) => setQty(id, 0),
    onClear:  () => setCart({}),
    onCheckout: handleCheckout,
    isSubmitting: isPending,
  } satisfies Omit<CartPanelProps, "onClose" | "scrollable">;

  return (
    <div className="relative min-h-screen">

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-wire bg-ink">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4 lg:px-10">
          <Link
            href={`/mesa/${encodeURIComponent(tableCode)}`}
            className="inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-dim transition-colors hover:text-light"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {tableCode}
          </Link>
          <span className="flex items-center gap-2 text-[0.58rem] font-bold uppercase tracking-[0.32em] text-dim">
            <span
              className="h-1.5 w-1.5 rounded-full bg-sage-deep"
              style={{ animation: "pulse-slow 2.4s ease-in-out infinite" }}
              aria-hidden="true"
            />
            Turno activo
          </span>
        </div>
      </header>

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-5xl px-6 pb-32 lg:px-10 lg:pb-24">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12 lg:items-start">

          {/* LEFT: Menu list */}
          <div>
            {/* Session heading */}
            <div className="border-b border-wire pb-8 pt-10">
              <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
                Sesión activa
              </p>
              <h1 className="mt-3 font-serif text-[clamp(2rem,5vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
                {guestName}
              </h1>
              <p className="mt-3 text-[0.75rem] font-medium text-dim">
                Mesa {tableCode} · {partySize} comensal{partySize !== 1 ? "es" : ""}
              </p>
            </div>

            {/* Category tabs */}
            <div
              className="scrollbar-hide -mx-6 flex overflow-x-auto border-b border-wire px-6 lg:mx-0 lg:px-0"
              role="tablist"
              aria-label="Categorías del menú"
            >
              {[ { id: "todos", name: "Todo" }, ...initialCategories ].map(({ id, name: label }) => (
                <button
                  key={id}
                  role="tab"
                  aria-selected={activeCategory === id}
                  onClick={() => setCategory(id)}
                  className={[
                    "shrink-0 px-5 py-4 text-[0.63rem] font-bold uppercase tracking-[0.28em] transition-colors duration-150",
                    activeCategory === id
                      ? "border-b-[1.5px] border-glow text-glow"
                      : "text-dim hover:text-light",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Menu rows */}
            <div role="tabpanel">
              {visibleCats.map(cat => {
                const items = visibleItems.filter(i => i.categoryId === cat.id);
                if (items.length === 0) return null;
                return (
                  <div key={cat.id}>
                    {activeCategory === "todos" && (
                      <p className="pb-4 pt-8 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim/55">
                        {cat.name}
                      </p>
                    )}
                    {activeCategory !== "todos" && <div className="pt-6" />}
                    <div className="divide-y divide-wire/40">
                      {items.map(item => {
                        const qty = cart[item.id] ?? 0;
                        return (
                          <div key={item.id} className="flex items-start justify-between gap-6 py-5">
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-[1.05rem] leading-snug text-light">
                                {item.name}
                              </p>
                              <p className="mt-2 text-[0.73rem] font-medium leading-relaxed text-dim">
                                {item.description}
                              </p>
                              {item.note && (
                                <p className="mt-2 text-[0.57rem] font-bold uppercase tracking-[0.22em] text-glow/65">
                                  {item.note}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-3">
                              <span className="font-serif text-[0.95rem] font-semibold text-light/80">
                                ${item.price.toLocaleString("es-MX")}
                              </span>
                              <QtyControl
                                qty={qty}
                                name={item.name}
                                onAdd={() => setQty(item.id, 1)}
                                onInc={() => setQty(item.id, qty + 1)}
                                onDec={() => setQty(item.id, qty - 1)}
                              />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT: Sticky order panel (desktop only) */}
          <aside
            className="hidden lg:block z-20"
            // Ajuste del offset para alinear mejor con el header sticky.
            style={{ position: "sticky", top: "60px" }}
          >
            <div className="mt-6 rounded-2xl border border-wire bg-panel/40 p-6 backdrop-blur-sm">
              <CartPanel {...cartPanelProps} />
            </div>
          </aside>

        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR (shown when cart has items) ────────────── */}
      {cartCount > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-wire bg-panel px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden"
          style={{ animation: "slide-from-bottom 0.25s cubic-bezier(0.25,0.46,0.45,0.94) both" }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex w-full items-center justify-between bg-glow px-5 py-4 text-ink transition-all active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
          >
            <span className="text-[0.7rem] font-bold uppercase tracking-[0.22em]">
              {cartCount} platillo{cartCount !== 1 ? "s" : ""} · ${cartTotal.toLocaleString("es-MX")}
            </span>
            <span className="flex items-center gap-1.5 text-[0.7rem] font-bold uppercase tracking-[0.22em]">
              Ver orden
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                <path d="M3 8h10m-4-4 4 4-4 4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>
        </div>
      )}

      {/* ── MOBILE DRAWER ────────────────────────────────────────────── */}
      {drawerOpen && (
        <div
          className="fixed inset-0 z-50 lg:hidden"
          role="dialog"
          aria-modal="true"
          aria-label="Tu orden"
        >
          <div
            className="absolute inset-0 bg-ink/75"
            style={{ animation: "fade-in 0.2s ease-out both" }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 border-t border-wire bg-panel px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
            style={{ animation: "slide-from-bottom 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both" }}
          >
            <CartPanel {...cartPanelProps} scrollable onClose={() => setDrawerOpen(false)} />
          </div>
        </div>
      )}

    </div>
  );
}
