"use client";

import Link from "next/link";
import { useState, useTransition, useEffect, useRef, useMemo } from "react";
import { submitComensalOrder, getGuestOrders } from "@/actions/comensal";
import { createClient } from "@/lib/supabase/client";
import { ChevronDown } from "lucide-react";
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
  variants: { name: string; price: number }[];
}

/** Clave de línea en el carrito: id suelto o JSON { m, v } si hay tamaño. */
function encodeLineKey(menuItemId: string, variantName: string | null): string {
  if (variantName == null || variantName === "") return menuItemId;
  return JSON.stringify({ m: menuItemId, v: variantName });
}

function decodeLineKey(key: string): { menuItemId: string; variantName: string | null } {
  if (key.startsWith("{")) {
    try {
      const o = JSON.parse(key) as { m: string; v: string };
      return { menuItemId: o.m, variantName: o.v ?? null };
    } catch {
      return { menuItemId: key, variantName: null };
    }
  }
  return { menuItemId: key, variantName: null };
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

type CartLine = {
  key: string;
  item: MenuItem;
  variantName: string | null;
  qty: number;
  unitPrice: number;
};

interface CartPanelProps {
  cartLines: CartLine[];
  cartCount: number;
  cartTotal: number;
  partySize: number;
  tableCode: string;
  scrollable?: boolean;
  onRemove: (lineKey: string) => void;
  onClear: () => void;
  onClose?: () => void;
  onCheckout: () => void;
  isSubmitting?: boolean;
}

function CartPanel({
  cartLines, cartCount, cartTotal, partySize, tableCode,
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
            {cartLines.map(line => (
              <div key={line.key} className="flex items-start justify-between gap-4 py-4">
                <div className="flex-1 min-w-0">
                  <p className="text-[0.82rem] font-medium leading-snug text-light">{line.item.name}</p>
                  {line.variantName && (
                    <p className="mt-0.5 text-[0.62rem] font-medium text-glow/80">{line.variantName}</p>
                  )}
                  <p className="mt-1 text-[0.65rem] text-dim">
                    {line.qty}× · ${(line.unitPrice * line.qty).toLocaleString("es-MX")}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(line.key)}
                  aria-label={`Eliminar ${line.item.name}${line.variantName ? ` (${line.variantName})` : ""}`}
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

// ─── OrderTracker ────────────────────────────────────────────────────────────

const STATUS_LABEL: Record<string, string> = {
  PENDING:   "En espera",
  PREPARING: "Preparando",
  READY:     "Lista ·",
  DELIVERED: "Entregada",
};

const STATUS_BADGE: Record<string, string> = {
  PENDING:   "border-wire text-dim/60",
  PREPARING: "border-glow/40 bg-glow/[0.06] text-glow",
  READY:     "border-sage-deep/50 bg-sage-deep/[0.07] text-sage-deep",
  DELIVERED: "border-wire/40 text-dim/35",
};

function OrderTracker({
  orders,
  tableCode,
  guestName,
  partySize,
}: {
  orders: any[];
  tableCode: string;
  guestName: string;
  partySize: number;
}) {
  const active    = orders.filter(o => o.status !== "DELIVERED");
  const delivered = orders.filter(o => o.status === "DELIVERED");

  const cuentaHref = `/mesa/${encodeURIComponent(tableCode)}/cuenta?guest=${encodeURIComponent(guestName)}&pax=${partySize}`;

  const [open, setOpen] = useState(active.length > 0);

  // Auto-expand whenever a new active order appears
  const prevActiveLen = useRef(active.length);
  useEffect(() => {
    if (active.length > prevActiveLen.current) setOpen(true);
    prevActiveLen.current = active.length;
  }, [active.length]);

  // Summary badge counts (only non-delivered)
  const counts = {
    PENDING:   active.filter(o => o.status === "PENDING").length,
    PREPARING: active.filter(o => o.status === "PREPARING").length,
    READY:     active.filter(o => o.status === "READY").length,
  };

  const summaryBadges = (
    [
      ["READY",     counts.READY,     "border-sage-deep/50 text-sage-deep"],
      ["PREPARING", counts.PREPARING, "border-glow/40 text-glow"],
      ["PENDING",   counts.PENDING,   "border-wire text-dim/50"],
    ] as [string, number, string][]
  ).filter(([, n]) => n > 0);

  return (
    <div className="border-b border-wire">
      {/* Summary bar — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
        aria-expanded={open}
      >
        <div className="flex flex-wrap items-center gap-2 min-w-0">
          <span className="shrink-0 text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">
            Tus pedidos
          </span>
          <span className="shrink-0 font-serif text-[0.82rem] font-semibold text-dim/50">
            ({orders.length})
          </span>

          {active.length === 0 ? (
            <span className="text-[0.6rem] font-medium text-sage-deep/70">
              · todos entregados ✓
            </span>
          ) : (
            summaryBadges.map(([status, count, cls]) => (
              <span
                key={status}
                className={`inline-flex items-center gap-1 border px-2 py-0.5 text-[0.56rem] font-bold uppercase tracking-[0.14em] ${cls}`}
              >
                {status === "READY" && (
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-sage-deep"
                    style={{ animation: "pulse-slow 1.8s ease-in-out infinite" }}
                    aria-hidden="true"
                  />
                )}
                {count} {STATUS_LABEL[status]}
              </span>
            ))
          )}
        </div>

        <ChevronDown
          className={`h-3.5 w-3.5 shrink-0 text-dim/40 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Expandable list */}
      {open && (
        <div
          className="pb-4"
          style={{ animation: "fade-in 0.18s ease-out both" }}
        >
          {/* Scrollable orders */}
          <div className="max-h-52 overflow-y-auto">
            {/* Active orders */}
            {active.length > 0 && (
              <div className="flex flex-col gap-2">
                {active.map(o => (
                  <OrderRow key={o.id} order={o} />
                ))}
              </div>
            )}

            {/* Delivered — dimmed separator */}
            {delivered.length > 0 && (
              <>
                {active.length > 0 && (
                  <div className="my-3 flex items-center gap-3">
                    <div className="h-px flex-1 bg-wire/40" />
                    <span className="text-[0.52rem] font-bold uppercase tracking-[0.24em] text-dim/30">
                      {delivered.length} entregada{delivered.length !== 1 ? "s" : ""}
                    </span>
                    <div className="h-px flex-1 bg-wire/40" />
                  </div>
                )}
                <div className="flex flex-col gap-2">
                  {delivered.map(o => (
                    <OrderRow key={o.id} order={o} />
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Pedir la cuenta CTA */}
          <div className="mt-4">
            {active.length === 0 ? (
              /* All delivered → prominent gold button */
              <Link
                href={cuentaHref}
                className="flex w-full items-center justify-center gap-2 bg-glow py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-ink transition-all active:scale-[0.99]"
                style={{ animation: "scale-in 0.25s cubic-bezier(0.22,1,0.36,1) both" }}
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                  <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                Pedir la cuenta
              </Link>
            ) : (
              /* Still active → secondary ghost link */
              <Link
                href={cuentaHref}
                className="flex w-full items-center justify-center gap-2 border border-wire py-3 text-[0.68rem] font-bold uppercase tracking-[0.2em] text-dim transition-colors hover:border-light/20 hover:text-light"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                </svg>
                Pedir la cuenta
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function OrderRow({ order }: { order: any }) {
  const summary = (order.items as any[])
    .slice(0, 2)
    .map((i: any) => {
      const base = `${i.quantity}× ${i.menuItem?.name ?? "—"}`;
      return i.variantName ? `${base} (${i.variantName})` : base;
    })
    .join(", ")
    + (order.items.length > 2 ? ` +${order.items.length - 2}` : "");

  return (
    <div
      className={[
        "flex items-center justify-between gap-3 px-1",
        order.status === "DELIVERED" ? "opacity-40" : "",
      ].join(" ")}
    >
      <div className="min-w-0">
        <span className="font-mono text-[0.58rem] text-dim/40">#{order.id.slice(-4)}</span>
        <p className="truncate text-[0.72rem] font-medium text-light">{summary}</p>
      </div>
      <span
        className={[
          "shrink-0 border px-2 py-0.5 text-[0.54rem] font-bold uppercase tracking-[0.14em]",
          STATUS_BADGE[order.status] ?? "border-wire text-dim",
        ].join(" ")}
      >
        {STATUS_LABEL[order.status] ?? order.status}
      </span>
    </div>
  );
}

// ─── MenuScreen ──────────────────────────────────────────────────────────────

interface MenuScreenProps {
  guestName: string;
  partySize: number;
  tableCode: string;
  initialCategories: Category[];
  initialItems: MenuItem[];
  initialOrders?: any[];
}

type CartMap = Record<string, number>;

export function MenuScreen({ guestName, partySize, tableCode, initialCategories, initialItems, initialOrders = [] }: MenuScreenProps) {
  const [cart, setCart]               = useState<CartMap>({});
  /** Tamaño elegido por platillo (solo ítems con variantes). */
  const [variantChoice, setVariantChoice] = useState<Record<string, string>>({});
  const [orders, setOrders]           = useState(initialOrders);

  // Escuchar si sus ordenes cambian de estatus
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("table_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "Order" }, async () => {
         // Opcion robusta: fetchear directamente con una server action para evitar el Router Cache de Next.js
         try {
           const freshOrders = await getGuestOrders(tableCode);
           setOrders(freshOrders);
         } catch(err) {
           console.error("Error al refrescar ordenes", err);
         }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tableCode]);
  
  // Sincronizar initialOrders si cambia el prop
  useEffect(() => setOrders(initialOrders), [initialOrders]);
  const [activeCategory, setCategory] = useState<string>("todos");
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const [isPending, startTransition]  = useTransition();
  const [orderSuccess, setOrderSuccess] = useState(false);

      function handleCheckout() {
    startTransition(async () => {
      try {
        const orderItems = Object.entries(cart).map(([key, qty]) => {
          const { menuItemId, variantName } = decodeLineKey(key);
          return {
            menuItemId,
            quantity: qty,
            variantName: variantName ?? undefined,
          };
        });
        
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



  function setQty(lineKey: string, qty: number) {
    setCart(prev => {
      if (qty <= 0) {
        const next = { ...prev };
        delete next[lineKey];
        return next;
      }
      return { ...prev, [lineKey]: qty };
    });
  }

  const cartLines: CartLine[] = useMemo(() => {
    return Object.entries(cart)
      .map(([key, qty]) => {
        const { menuItemId, variantName } = decodeLineKey(key);
        const item = initialItems.find(i => i.id === menuItemId);
        if (!item || qty <= 0) return null;
        let unitPrice = item.price;
        if (variantName && item.variants?.length) {
          const v = item.variants.find(x => x.name === variantName);
          if (v) unitPrice = v.price;
        }
        return { key, item, variantName, qty, unitPrice };
      })
      .filter((x): x is CartLine => x != null);
  }, [cart, initialItems]);

  const cartCount = cartLines.reduce((s, l) => s + l.qty, 0);
  const cartTotal = cartLines.reduce((s, l) => s + l.unitPrice * l.qty, 0);

  const visibleItems = activeCategory === "todos" ? initialItems : initialItems.filter(i => i.categoryId === activeCategory);
  
  // Categorias que tienen al menos un item visible
  const visibleCats = initialCategories.filter(
    cat => visibleItems.some(i => i.categoryId === cat.id)
  );

  const cartPanelProps = {
    cartLines, cartCount, cartTotal, partySize, tableCode,
    onRemove: (lineKey: string) => setQty(lineKey, 0),
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

            
            {/* TRACING DE ORDENES ACTIVAS */}
            {orders && orders.length > 0 && (
              <OrderTracker orders={orders} tableCode={tableCode} guestName={guestName} partySize={partySize} />
            )}

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
                        const hasVariants = item.variants && item.variants.length > 0;
                        const selectedVariantName = hasVariants
                          ? (variantChoice[item.id] ?? item.variants[0]!.name)
                          : null;
                        const lineKey = encodeLineKey(item.id, selectedVariantName);
                        const qty = cart[lineKey] ?? 0;
                        const unitPrice = hasVariants
                          ? item.variants.find(v => v.name === selectedVariantName)?.price ?? item.price
                          : item.price;
                        const qtyLabel = hasVariants && selectedVariantName
                          ? `${item.name} (${selectedVariantName})`
                          : item.name;
                        return (
                          <div key={item.id} className="flex items-start justify-between gap-6 py-5">
                            <div className="flex-1 min-w-0">
                              <p className="font-serif text-[1.05rem] leading-snug text-light">
                                {item.name}
                              </p>
                              <p className="mt-2 text-[0.73rem] font-medium leading-relaxed text-dim">
                                {item.description}
                              </p>
                              {hasVariants && (
                                <div
                                  className="mt-3 flex flex-wrap gap-1.5"
                                  role="group"
                                  aria-label="Tamaño o presentación"
                                >
                                  {item.variants.map(v => {
                                    const active = selectedVariantName === v.name;
                                    return (
                                      <button
                                        key={v.name}
                                        type="button"
                                        onClick={() =>
                                          setVariantChoice(prev => ({ ...prev, [item.id]: v.name }))
                                        }
                                        className={[
                                          "rounded-full border px-3 py-1.5 text-[0.62rem] font-bold uppercase tracking-[0.12em] transition-colors",
                                          active
                                            ? "border-glow bg-glow/[0.12] text-glow"
                                            : "border-wire/60 text-dim hover:border-light/25 hover:text-light",
                                        ].join(" ")}
                                      >
                                        {v.name} · ${v.price.toLocaleString("es-MX")}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                              {item.note && (
                                <p className="mt-2 text-[0.57rem] font-bold uppercase tracking-[0.22em] text-glow/65">
                                  {item.note}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-3">
                              <span className="font-serif text-[0.95rem] font-semibold text-light/80">
                                ${unitPrice.toLocaleString("es-MX")}
                              </span>
                              <QtyControl
                                qty={qty}
                                name={qtyLabel}
                                onAdd={() => setQty(lineKey, 1)}
                                onInc={() => setQty(lineKey, qty + 1)}
                                onDec={() => setQty(lineKey, qty - 1)}
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
