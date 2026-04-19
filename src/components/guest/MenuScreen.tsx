"use client";

import { useState, useTransition, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitComensalOrder, getGuestOrders, requestBill, transferHost, getGuestTableState, cancelGuestOrder } from "@/actions/comensal";
import { GuestMenuThemeToggle } from "@/components/guest/GuestMenuThemeToggle";
import { createClient } from "@/lib/supabase/client";
import type { GuestMenuTheme } from "@/lib/guest-menu-theme";
import { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";
import { ChevronDown, Clock, CookingPot, Bell, CheckCircle2, XCircle, AlertTriangle, Share2, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { getSignedGuestPreviewUrl } from "@/actions/tables";
import { motion, AnimatePresence } from "framer-motion";
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
  isSoldOut?: boolean;
  isPopular?: boolean;
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
  const [rippleTick, setRippleTick] = useState(0);

  if (qty === 0) {
    return (
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => {
          setRippleTick((t) => t + 1);
          onAdd();
        }}
        aria-label={`Agregar ${name}`}
        className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border-2 border-gold/20 bg-gold/5 text-gold transition-all duration-150 hover:border-gold/60 hover:bg-gold/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50 guest-dark:border-gold/50 guest-dark:bg-gold/95/40 guest-dark:text-gold/30 guest-dark:hover:border-gold/60/70 guest-dark:hover:bg-gold/95/65"
      >
        {rippleTick > 0 && (
          <motion.span
            key={rippleTick}
            className="pointer-events-none absolute inset-0 rounded-xl bg-gold/60/35"
            initial={{ scale: 0, opacity: 0.6 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        <svg viewBox="0 0 16 16" fill="none" className="relative z-[1] h-4 w-4" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </motion.button>
    );
  }
  return (
    <div className="flex items-center gap-2">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95, opacity: 0.85 }}
        onClick={onDec}
        aria-label={`Quitar uno de ${name}`}
        className="flex h-11 w-11 items-center justify-center rounded-xl border-2 border-gold/30 bg-gold/10 text-gold transition-all hover:border-gold/60 hover:bg-gold/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50 guest-dark:border-gold/55 guest-dark:bg-gold/95/55 guest-dark:text-gold/20 guest-dark:hover:border-gold/60 guest-dark:hover:bg-gold/90/60"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </motion.button>
      <span className="w-8 text-center text-sm font-mono font-bold tabular-nums text-gold guest-dark:text-gold/30">
        {qty}
      </span>
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 1.05 }}
        onClick={() => {
          setRippleTick((t) => t + 1);
          onInc();
        }}
        aria-label={`Agregar otro de ${name}`}
        className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border-2 border-gold/30 bg-gold/10 text-gold transition-all hover:border-gold/60 hover:bg-gold/20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50 guest-dark:border-gold/55 guest-dark:bg-gold/95/55 guest-dark:text-gold/20 guest-dark:hover:border-gold/60 guest-dark:hover:bg-gold/90/60"
      >
        {rippleTick > 0 && (
          <motion.span
            key={`p-${rippleTick}`}
            className="pointer-events-none absolute inset-0 rounded-xl bg-gold/60/35"
            initial={{ scale: 0, opacity: 0.55 }}
            animate={{ scale: 2.2, opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          />
        )}
        <svg viewBox="0 0 16 16" fill="none" className="relative z-[1] h-4 w-4" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      </motion.button>
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
      <div className="flex items-end justify-between border-b border-border-main pb-4">
        <div>
          <h2 className="text-2xl font-serif text-text-primary">Tu orden</h2>
          <p className="text-sm text-text-muted mt-1">
            Mesa {tableCode}
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            aria-label="Cerrar orden"
            className="text-sm font-medium text-text-muted transition-colors hover:text-text-primary"
          >
            Cerrar
          </button>
        )}
      </div>

      {cartCount === 0 ? (
        <p className="mt-8 text-sm text-text-muted italic">
          Selecciona platillos del menú para agregarlos a tu orden.
        </p>
      ) : (
        <>
          <div className={`mt-6 divide-y divide-slate-200/30 guest-dark:divide-wire/40 ${scrollable ? "max-h-[38vh] overflow-y-auto" : ""}`}>
            {cartLines.map((line, idx) => (
              <motion.div
                key={line.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className="flex items-start justify-between gap-4 py-4"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold leading-snug text-slate-900 guest-dark:text-light">{line.item.name}</p>
                  {line.variantName && (
                    <p className="mt-1 text-xs font-medium text-gold guest-dark:text-gold/60">{line.variantName}</p>
                  )}
                  <p className="mt-2 text-xs text-slate-500 font-mono guest-dark:text-dim">
                    {line.qty}× · ${(line.unitPrice * line.qty).toLocaleString("es-MX")}
                  </p>
                </div>
                <button
                  onClick={() => onRemove(line.key)}
                  aria-label={`Eliminar ${line.item.name}${line.variantName ? ` (${line.variantName})` : ""}`}
                  className="mt-0.5 shrink-0 text-xs text-slate-400 transition-colors hover:text-red-500 guest-dark:text-dim guest-dark:hover:text-red-400"
                >
                  ✕
                </button>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 border-t border-slate-200/30 pt-6 guest-dark:border-wire/40">
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-semibold uppercase tracking-widest text-slate-500 guest-dark:text-dim">Total</span>
              <span className="font-mono text-2xl font-bold leading-none text-gold guest-dark:text-gold/60">
                ${cartTotal.toLocaleString("es-MX")}
              </span>
            </div>
            <p className="mt-2 text-xs text-slate-500 guest-dark:text-dim">
              {cartCount} platillo{cartCount !== 1 ? "s" : ""} · {partySize} comensal{partySize !== 1 ? "es" : ""}
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onCheckout}
            disabled={isSubmitting}
            className="mt-7 block w-full bg-gold/50 hover:bg-gold py-4 text-center text-sm font-semibold uppercase tracking-wider text-white transition-all duration-200 rounded-xl shadow-lg shadow-gold/50/30 hover:shadow-gold/50/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50 disabled:opacity-50 disabled:hover:bg-gold/50 guest-dark:bg-gold guest-dark:hover:bg-gold/50"
          >
            {isSubmitting ? "Enviando..." : "Enviar orden"}
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onClear}
            className="mt-3 w-full border-2 border-slate-200 hover:border-slate-300 bg-transparent hover:bg-slate-50 py-3 text-xs font-semibold uppercase tracking-widest text-slate-600 transition-all rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50 guest-dark:border-wire guest-dark:text-dim guest-dark:hover:border-glow/40 guest-dark:hover:bg-panel/60 guest-dark:hover:text-light"
          >
            Vaciar
          </motion.button>
        </>
      )}
    </>
  );
}

// ─── OrderTracker ────────────────────────────────────────────────────────────

/** Prisma enum vs KDS lowercase — unificamos para la UI del comensal */
function normalizeOrderStatus(raw: unknown): "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED" {
  const u = String(raw ?? "").toUpperCase();
  if (u === "PENDING" || u === "PREPARING" || u === "READY" || u === "DELIVERED" || u === "CANCELLED") return u;
  const lo = String(raw ?? "").toLowerCase();
  if (lo === "pending") return "PENDING";
  if (lo === "preparing") return "PREPARING";
  if (lo === "ready") return "READY";
  if (lo === "delivered") return "DELIVERED";
  if (lo === "cancelled") return "CANCELLED";
  return "PENDING";
}

const ORDER_STATUS: Record<
  "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED",
  { label: string; summary: string; hint: string; badge: string; badgeGuestDark?: string; icon: typeof Clock }
> = {
  PENDING: {
    label: "Pendiente",
    summary: "en espera",
    hint: "En cola de preparación",
    badge: "border-slate-300 text-slate-600 bg-slate-100/50",
    badgeGuestDark: "guest-dark:border-dim/50 guest-dark:bg-panel/55 guest-dark:text-light/90",
    icon: Clock,
  },
  PREPARING: {
    label: "Preparando",
    summary: "en cocina",
    hint: "Tu pedido se está elaborando",
    badge: "border-amber-400/60 bg-amber-100/50 text-amber-700",
    badgeGuestDark: "guest-dark:border-amber-500/35 guest-dark:bg-amber-950/35 guest-dark:text-amber-200",
    icon: CookingPot,
  },
  READY: {
    label: "Listo",
    summary: "listo",
    hint: "El mesero lo llevará a la mesa",
    badge: "border-gold/60/70 bg-gold/10/50 text-gold",
    badgeGuestDark: "guest-dark:border-gold/50/40 guest-dark:bg-gold/95/35 guest-dark:text-gold/30",
    icon: Bell,
  },
  DELIVERED: {
    label: "Entregado",
    summary: "entregado",
    hint: "Servido en mesa",
    badge: "border-slate-200 bg-slate-50/50 text-slate-500",
    badgeGuestDark: "guest-dark:border-wire guest-dark:bg-panel/40 guest-dark:text-dim",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelado",
    summary: "cancelado",
    hint: "No se cobrará este pedido",
    badge: "border-red-300/50 bg-red-100/40 text-red-600",
    badgeGuestDark: "guest-dark:border-red-500/35 guest-dark:bg-red-950/25 guest-dark:text-red-300",
    icon: XCircle,
  },
};

function guestOrderSummaryPreview(order: any): string {
  const items = order.items as any[];
  if (!items?.length) return "";
  const summary = items
    .slice(0, 2)
    .map((i: any) => {
      const base = `${i.quantity}× ${i.menuItem?.name ?? "—"}`;
      return i.variantName ? `${base} (${i.variantName})` : base;
    })
    .join(", ");
  return summary + (items.length > 2 ? ` +${items.length - 2}` : "");
}

/** Franja superior: pipeline Pendiente → Preparando → Listo (invitado / tema light). */
function CookingPipelineBar({
  pending,
  preparing,
  ready,
}: {
  pending: number;
  preparing: number;
  ready: number;
}) {
  if (pending + preparing + ready === 0) return null;

  return (
    <div className="mt-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 rounded-none border border-border-main bg-bg-solid px-5 py-4 shadow-sm">
      <span className="text-[0.7rem] uppercase tracking-widest font-medium text-text-muted whitespace-nowrap">
        Estado de órdenes:
      </span>
      <div className="flex flex-wrap items-center gap-5">
        {pending > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-300"></span>
            <span className="text-[0.65rem] font-medium text-text-muted uppercase tracking-wider">{pending} Pendiente{pending !== 1 && 's'}</span>
          </div>
        )}
        {preparing > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500"></span>
            <span className="text-[0.65rem] font-medium text-text-muted uppercase tracking-wider">{preparing} Preparando</span>
          </div>
        )}
        {ready > 0 && (
          <div className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-gold shadow-[0_0_8px_rgba(202,138,4,0.3)]"></span>
            <span className="text-[0.65rem] font-bold text-text-primary uppercase tracking-wider">{ready} Listo{ready !== 1 && 's'}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function OrderTracker({
  orders,
  tableCode,
  guestName,
  partySize,
  isHost,
  billRequested,
  onRefreshOrders,
  hasOrderPipeline = false,
  menuTheme = "light",
}: {
  orders: any[];
  tableCode: string;
  guestName: string;
  partySize: number;
  isHost: boolean;
  billRequested: boolean;
  onRefreshOrders: () => void | Promise<void>;
  /** Si ya hay franja de progreso arriba, el título evita duplicar “resumen”. */
  hasOrderPipeline?: boolean;
  menuTheme?: GuestMenuTheme;
}) {
  const router = useRouter();
  const active = orders.filter((o) => {
    const s = normalizeOrderStatus(o.status);
    return s !== "DELIVERED" && s !== "CANCELLED";
  });
  const delivered = orders.filter((o) => normalizeOrderStatus(o.status) === "DELIVERED");
  const cancelledList = orders.filter((o) => normalizeOrderStatus(o.status) === "CANCELLED");
  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelVerifyOrderId, setCancelVerifyOrderId] = useState<string | null>(null);
  const [portalMounted, setPortalMounted] = useState(false);

  useEffect(() => {
    setPortalMounted(true);
  }, []);

  const verifyCancelOrder = cancelVerifyOrderId
    ? orders.find((o) => o.id === cancelVerifyOrderId)
    : null;

  async function executeCancelOrder(orderId: string) {
    setCancellingOrderId(orderId);
    try {
      await cancelGuestOrder(orderId, tableCode, guestName);
      await onRefreshOrders();
    } catch (e) {
      alert((e as Error).message || "No se pudo cancelar");
    } finally {
      setCancellingOrderId(null);
    }
  }

  function requestCancelVerification(orderId: string) {
    setCancelVerifyOrderId(orderId);
  }

  async function confirmCancelFromDialog() {
    if (!cancelVerifyOrderId) return;
    const id = cancelVerifyOrderId;
    setCancelVerifyOrderId(null);
    await executeCancelOrder(id);
  }

  function dismissCancelVerification() {
    if (cancellingOrderId) return;
    setCancelVerifyOrderId(null);
  }

  const cuentaHref = `/mesa/${encodeURIComponent(tableCode)}/cuenta`;
  const [isRequestingBill, startBillTransition] = useTransition();

  function handleRequestBill() {
    startBillTransition(async () => {
      await requestBill(tableCode, guestName);
      router.push(cuentaHref);
    });
  }

  const [open, setOpen] = useState(active.length > 0);

  // Auto-expand whenever a new active order appears
  const prevActiveLen = useRef(active.length);
  useEffect(() => {
    if (active.length > prevActiveLen.current) setOpen(true);
    prevActiveLen.current = active.length;
  }, [active.length]);

  // Summary badge counts (only non-delivered)
  const counts = {
    PENDING: active.filter((o) => normalizeOrderStatus(o.status) === "PENDING").length,
    PREPARING: active.filter((o) => normalizeOrderStatus(o.status) === "PREPARING").length,
    READY: active.filter((o) => normalizeOrderStatus(o.status) === "READY").length,
  };

  const summaryBadges = (
    [
      ["READY",     counts.READY,     "border-gold/50/50 text-gold/50 guest-dark:border-gold/60/45 guest-dark:text-gold/60"],
      ["PREPARING", counts.PREPARING, "border-amber-400/50 text-amber-700 guest-dark:border-amber-500/40 guest-dark:text-amber-300"],
      ["PENDING",   counts.PENDING,   "border-slate-200 text-slate-600/50 guest-dark:border-dim/40 guest-dark:text-dim"],
    ] as [string, number, string][]
  ).filter(([, n]) => n > 0);

  return (
    <div className="border-b border-slate-200/50 guest-dark:border-wire/50">
      {/* Summary bar — always visible */}
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-4 py-6 text-left hover:bg-slate-50/40 transition-colors rounded-lg guest-dark:hover:bg-panel/30"
        aria-expanded={open}
      >
        <div className="flex flex-wrap items-center gap-3 min-w-0">
          <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-slate-600 guest-dark:text-light/85">
            {hasOrderPipeline ? "Detalle de pedidos" : "Tus pedidos"}
          </span>
          <span className="shrink-0 font-mono text-base font-semibold text-slate-500 guest-dark:text-dim">
            ({orders.length})
          </span>

          {active.length === 0 ? (
            <span className="text-xs font-medium text-gold guest-dark:text-gold/60">
              {delivered.length > 0
                ? "· todos entregados"
                : cancelledList.length > 0
                  ? "· sin pedidos en curso"
                  : "· sin pedidos en curso"}
            </span>
          ) : (
            summaryBadges.map(([status, count, cls]) => {
              const st = normalizeOrderStatus(status);
              const meta = ORDER_STATUS[st];
              return (
              <motion.span
                key={status}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`inline-flex items-center gap-2 border px-3 py-1.5 text-xs font-bold uppercase tracking-wider rounded-lg ${cls}`}
              >
                {status === "READY" && (
                  <motion.span
                    className="h-2 w-2 rounded-full bg-gold/50 guest-dark:bg-gold/60"
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1.2, repeat: Infinity }}
                    aria-hidden="true"
                  />
                )}
                {status === "PREPARING" && (
                  <motion.span
                    className="h-2 w-2 rounded-full bg-amber-500 guest-dark:bg-amber-400"
                    animate={{ opacity: [0.5, 1] }}
                    transition={{ duration: 1.8, repeat: Infinity }}
                    aria-hidden="true"
                  />
                )}
                {count} {meta.summary}
              </motion.span>
              );
            })
          )}
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-slate-400 transition-transform duration-300 guest-dark:text-dim ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>

      {/* Expandable list */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="pb-6 pt-4">
              {/* Scrollable orders */}
              <div className="max-h-56 overflow-y-auto space-y-2">
                {/* Active orders */}
                {active.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {active.map((o, idx) => (
                      <motion.div
                        key={o.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                      >
                        <OrderRow
                          order={o}
                          guestName={guestName}
                          billRequested={billRequested}
                          cancellingOrderId={cancellingOrderId}
                          onCancel={requestCancelVerification}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}

                {/* Delivered — dimmed separator */}
                {delivered.length > 0 && (
                  <>
                    {active.length > 0 && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200/30 guest-dark:bg-wire/40" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 guest-dark:text-dim">
                          {delivered.length} entregada{delivered.length !== 1 ? "s" : ""}
                        </span>
                        <div className="h-px flex-1 bg-slate-200/30 guest-dark:bg-wire/40" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      {delivered.map((o) => (
                        <OrderRow key={o.id} order={o} guestName={guestName} billRequested={billRequested} />
                      ))}
                    </div>
                  </>
                )}

                {cancelledList.length > 0 && (
                  <>
                    {(active.length > 0 || delivered.length > 0) && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-slate-200/30 guest-dark:bg-wire/40" />
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400 guest-dark:text-dim">
                          Cancelados
                        </span>
                        <div className="h-px flex-1 bg-slate-200/30 guest-dark:bg-wire/40" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      {cancelledList.map((o) => (
                        <OrderRow key={o.id} order={o} guestName={guestName} billRequested={billRequested} />
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Pedir la cuenta CTA */}
              <div className="mt-6 pt-4 border-t border-slate-200/30 guest-dark:border-wire/45">
                {isHost ? (
                  /* Anfitrión: botón real que cierra la mesa */
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequestBill}
                    disabled={isRequestingBill}
                    className={active.length === 0
                      ? "flex w-full items-center justify-center gap-2 py-4 text-sm font-bold uppercase tracking-wider transition-all rounded-xl bg-gold/50 hover:bg-gold text-white shadow-lg shadow-gold/50/30 guest-dark:bg-gold guest-dark:hover:bg-gold/50"
                      : "flex w-full items-center justify-center gap-2 py-3.5 text-xs font-bold uppercase tracking-wider transition-all rounded-xl border-2 border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50 guest-dark:border-wire guest-dark:text-dim guest-dark:hover:border-glow/35 guest-dark:hover:bg-panel/50 guest-dark:hover:text-light"
                    }
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    {isRequestingBill ? "Cerrando mesa…" : "Pedir la cuenta"}
                  </motion.button>
                ) : (
                  /* No anfitrión: aviso informativo */
                  <p className="text-center text-xs font-medium uppercase tracking-widest text-slate-400 guest-dark:text-dim">
                    Solo el anfitrión puede pedir la cuenta
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {portalMounted &&
        cancelVerifyOrderId &&
        verifyCancelOrder &&
        createPortal(
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="guest-cancel-order-title"
            data-guest-theme={menuTheme}
            className="fixed inset-0 z-[200] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm guest-dark:bg-black/75"
            onClick={dismissCancelVerification}
            onKeyDown={(e) => {
              if (e.key === "Escape") dismissCancelVerification();
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="w-full max-w-sm rounded-2xl border border-slate-200/50 bg-white/95 backdrop-blur-xl p-8 shadow-[0_20px_60px_rgba(0,0,0,0.15)] guest-dark:border-wire guest-dark:bg-panel/95 guest-dark:shadow-[0_24px_60px_rgba(0,0,0,0.55)]"
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
            >
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-red-300 bg-red-100/50">
                  <AlertTriangle className="size-6 text-red-600" aria-hidden />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 id="guest-cancel-order-title" className="text-lg font-semibold leading-tight text-slate-900 guest-dark:text-light">
                    ¿Cancelar este pedido?
                  </h2>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600 guest-dark:text-dim">
                    Solo puedes hacerlo mientras sigue <strong className="text-slate-900 guest-dark:text-light">pendiente</strong>. Si ya entró a cocina, no se puede cancelar desde aquí.
                  </p>
                  <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50/50 px-3 py-2 font-mono text-xs text-slate-600 guest-dark:border-wire guest-dark:bg-ink/80 guest-dark:text-dim">
                    #{verifyCancelOrder.id.slice(-4)} · {guestOrderSummaryPreview(verifyCancelOrder)}
                  </p>
                </div>
              </div>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={dismissCancelVerification}
                  disabled={!!cancellingOrderId}
                  className="order-2 w-full border-2 border-slate-200 hover:border-slate-300 py-3 text-sm font-semibold uppercase tracking-wider text-slate-600 transition-all rounded-xl disabled:opacity-50 sm:order-1 sm:w-auto sm:min-w-[10rem] guest-dark:border-wire guest-dark:text-dim guest-dark:hover:border-glow/40 guest-dark:hover:text-light"
                >
                  No, volver
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => void confirmCancelFromDialog()}
                  disabled={!!cancellingOrderId}
                  className="order-1 w-full bg-red-600 hover:bg-red-700 py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all rounded-xl shadow-lg shadow-red-600/30 disabled:opacity-50 sm:order-2 sm:w-auto sm:min-w-[10rem]"
                >
                  {cancellingOrderId ? "Cancelando…" : "Sí, cancelar"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>,
          document.body
        )}
    </div>
  );
}

function OrderRow({
  order,
  guestName,
  billRequested = false,
  cancellingOrderId,
  onCancel,
}: {
  order: any;
  guestName: string;
  billRequested?: boolean;
  cancellingOrderId?: string | null;
  onCancel?: (orderId: string) => void;
}) {
  const summary = guestOrderSummaryPreview(order);

  const st = normalizeOrderStatus(order.status);
  const meta = ORDER_STATUS[st];
  const Icon = meta.icon;

  const isMine =
    typeof order.guestName === "string"
      ? order.guestName === guestName
      : order.items?.[0]?.session?.guestName === guestName;

  const canCancel =
    typeof onCancel === "function" &&
    st === "PENDING" &&
    isMine &&
    !billRequested;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className={[
        "rounded-xl border px-4 py-3.5 transition-all",
        st === "DELIVERED"
          ? "border-slate-200 bg-slate-50/40 opacity-60 guest-dark:border-wire/50 guest-dark:bg-panel/25"
          : "border-slate-200/50 bg-white/40 backdrop-blur-sm guest-dark:border-wire/45 guest-dark:bg-panel/35",
        st === "CANCELLED" ? "opacity-50" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-xs text-slate-400 guest-dark:text-dim">#{order.id.slice(-4)}</span>
            {order.items[0]?.session?.guestName && (
              <span className="text-xs font-medium text-gold guest-dark:text-gold/60">{order.items[0].session.guestName}</span>
            )}
          </div>
          <p className="mt-1.5 truncate text-sm font-semibold leading-snug text-slate-900 guest-dark:text-light">{summary}</p>
          <p className="mt-1.5 text-xs leading-snug text-slate-600 guest-dark:text-dim">{meta.hint}</p>
          {canCancel && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              type="button"
              onClick={() => onCancel(order.id)}
              disabled={cancellingOrderId === order.id}
              className="mt-2 text-xs font-semibold uppercase tracking-widest text-red-500 hover:text-red-600 transition-colors disabled:opacity-50"
            >
              {cancellingOrderId === order.id ? "Cancelando…" : "Cancelar"}
            </motion.button>
          )}
        </div>

        <div
          className={[
            "flex shrink-0 flex-col items-center gap-1.5 rounded-lg border px-3 py-2.5 text-center",
            meta.badge,
            meta.badgeGuestDark ?? "",
          ].join(" ")}
          role="status"
          aria-label={`Estado del pedido: ${meta.label}`}
        >
          <Icon className="size-4 shrink-0" aria-hidden />
          <span className="max-w-[7rem] text-xs font-bold uppercase leading-tight tracking-wide">
            {meta.label}
          </span>
        </div>
      </div>
    </motion.div>
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
  isHost?: boolean;
  initialBillRequested?: boolean;
  initialGuests?: { name: string; isHost: boolean }[];
  joinCode?: string | null;
}

type CartMap = Record<string, number>;

export function MenuScreen({ guestName, partySize, tableCode, initialCategories, initialItems, initialOrders = [], isHost = false, initialBillRequested = false, initialGuests = [], joinCode }: MenuScreenProps) {
  const router = useRouter();
  const [cart, setCart]               = useState<CartMap>({});
  /** Tamaño elegido por platillo (solo ítems con variantes). */
  const [variantChoice, setVariantChoice] = useState<Record<string, string>>({});
  const [orders, setOrders]           = useState(initialOrders);
  const [billRequested, setBillRequested] = useState(initialBillRequested);
  const [guests, setGuests]               = useState(initialGuests);
  /** Rol anfitrión puede cambiar sin recargar (p. ej. transferencia). */
  const [isHostLive, setIsHostLive]       = useState(isHost);
  const [hostTransferDialogOpen, setHostTransferDialogOpen] = useState(false);
  const [isTransferring, startTransfer]   = useTransition();
  const [activeCategory, setCategory] = useState<string>("todos");
  const [drawerOpen, setDrawerOpen]   = useState(false);
  const { menuTheme, changeGuestMenuTheme } = useGuestMenuTheme();
  const [isPending, startTransition]  = useTransition();
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderError, setOrderError]   = useState<string | null>(null);
  const [inviteFullUrl, setInviteFullUrl] = useState<string | null>(null);
  const qrInviteCanvasRef = useRef<HTMLCanvasElement>(null);
  const [qrInviteFullscreenOpen, setQrInviteFullscreenOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null);
  /** Portal de toasts solo tras montar (evita mismatch SSR/cliente vs `document.body`). */
  const [toastPortalReady, setToastPortalReady] = useState(false);

  useEffect(() => {
    setToastPortalReady(true);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(timeout);
  }, [toast]);

  const cuentaHref = `/mesa/${encodeURIComponent(tableCode)}/cuenta`;
  const displayTableCode = tableCode.trim().toUpperCase();

  const refreshOrders = useCallback(async () => {
    try {
      const fresh = await getGuestOrders(tableCode);
      setOrders(fresh);
    } catch (err) {
      console.error("Error al refrescar pedidos", err);
    }
  }, [tableCode]);

  useEffect(() => {
    setOrders(initialOrders);
  }, [tableCode, initialOrders]);

  useEffect(() => {
    setIsHostLive(isHost);
  }, [isHost]);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const path = await getSignedGuestPreviewUrl(tableCode);
        const origin = typeof window !== "undefined" ? window.location.origin : "";
        if (!cancelled) setInviteFullUrl(`${origin}${path}`);
      } catch {
        if (!cancelled) setInviteFullUrl(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [tableCode]);

  useEffect(() => {
    const overlayOpen = qrInviteFullscreenOpen || hostTransferDialogOpen;
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (hostTransferDialogOpen) setHostTransferDialogOpen(false);
      else setQrInviteFullscreenOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [qrInviteFullscreenOpen, hostTransferDialogOpen]);

  const handleShareInvite = useCallback(async () => {
    let url = inviteFullUrl;
    if (!url) {
      try {
        const path = await getSignedGuestPreviewUrl(tableCode);
        url = `${window.location.origin}${path}`;
        setInviteFullUrl(url);
        await new Promise<void>((resolve) => {
          requestAnimationFrame(() => requestAnimationFrame(() => resolve()));
        });
      } catch {
        setToast({ type: "error", message: "No se pudo crear el enlace" });
        return;
      }
    }

    const title = `Mesa ${displayTableCode} · Bouquet`;
    const text = `Únete al menú en esta mesa:\n${url}`;
    try {
      const canvas = qrInviteCanvasRef.current;
      const pngFile =
        canvas &&
        (await new Promise<File | null>((resolve) => {
          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(null);
                return;
              }
              resolve(
                new File([blob], `mesa-${displayTableCode}-bouquet-qr.png`, {
                  type: "image/png",
                }),
              );
            },
            "image/png",
            1,
          );
        }));

      if (
        pngFile &&
        typeof navigator.canShare === "function" &&
        navigator.canShare({ files: [pngFile] })
      ) {
        await navigator.share({
          files: [pngFile],
          title,
          text,
        });
        return;
      }

      if (typeof navigator.share === "function") {
        await navigator.share({ title, text, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      setToast({ type: "success", message: "Enlace de invitación copiado" });
    } catch (err) {
      const e = err as { name?: string };
      if (e?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        setToast({ type: "success", message: "Enlace copiado al portapapeles" });
      } catch {
        setToast({ type: "error", message: "No se pudo compartir el enlace" });
      }
    }
  }, [inviteFullUrl, tableCode, displayTableCode]);

  /**
   * Estado de pedidos en tiempo casi real:
   * - Broadcast desde cocina/mesero (SUPABASE_SERVICE_ROLE_KEY en servidor)
   * - Sondeo cada 5s si la pestaña está visible (respaldo y sin service role)
   * postgres_changes con anon no recibe Order por RLS (solo authenticated).
   */
  // Si ya se pidió la cuenta al cargar, redirigir
  useEffect(() => {
    if (initialBillRequested) router.replace(cuentaHref);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    void refreshOrders();

    const supabase = createClient();
    const channelName = `guest-orders:${encodeURIComponent(tableCode)}`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "refresh" }, () => {
        void refreshOrders();
        void getGuestTableState(tableCode, guestName).then((s) => {
          setGuests(s.guests);
          setIsHostLive(s.isHost);
        });
      })
      .on("broadcast", { event: "bill-requested" }, () => {
        setBillRequested(true);
        router.push(cuentaHref);
      })
      .subscribe();

    const interval = setInterval(() => {
      if (document.visibilityState === "visible") void refreshOrders();
    }, 5000);

    const onVis = () => {
      if (document.visibilityState === "visible") void refreshOrders();
    };
    document.addEventListener("visibilitychange", onVis);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", onVis);
      void supabase.removeChannel(channel);
    };
  }, [tableCode, refreshOrders]);

  function handleCheckout() {
    if (billRequested) {
      setOrderError("El anfitrión ya pidió la cuenta. No puedes agregar más órdenes.");
      setTimeout(() => setOrderError(null), 4000);
      return;
    }
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

        await refreshOrders();

        // En lugar de ir a pagar, vaciamos carrito, cerramos cajon y avisamos que se mando a la cocina
        setCart({});
        setDrawerOpen(false);
        setOrderSuccess(true);
        setTimeout(() => setOrderSuccess(false), 3000);
      } catch (err) {
        console.error("No se pudo enviar la orden", err);
        setOrderError("No se pudo enviar la orden. Intenta de nuevo.");
        setTimeout(() => setOrderError(null), 4000);
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

  const active = orders.filter((o) => {
    const s = normalizeOrderStatus(o.status);
    return s !== "DELIVERED" && s !== "CANCELLED";
  });
  const orderCounts = {
    PENDING: orders.filter((o) => normalizeOrderStatus(o.status) === "PENDING").length,
    PREPARING: orders.filter((o) => normalizeOrderStatus(o.status) === "PREPARING").length,
    READY: orders.filter((o) => normalizeOrderStatus(o.status) === "READY").length,
  };

  return (
    <div
      data-guest-theme={menuTheme}
      className="guest-menu-vt-root relative min-h-screen bg-[var(--guest-bg-page,#faf8f5)] text-[var(--guest-text,#0f172a)]"
    >

      {/* ── TOASTS (portal a body + z alto: visibles sobre modal QR z-[110] y otros overlays) ── */}
      {toastPortalReady &&
        createPortal(
          (
            <div data-guest-theme={menuTheme}>
              <AnimatePresence>
            {toast && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-x-0 top-8 z-[260] flex justify-center px-4 pointer-events-none"
                role={toast.type === "error" ? "alert" : "status"}
                aria-live={toast.type === "error" ? "assertive" : "polite"}
              >
                {toast.type === "error" ? (
                  <div className="pointer-events-auto flex items-center gap-3 border border-red-400/40 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg shadow-red-500/20 guest-dark:border-red-500/35 guest-dark:bg-panel/95 guest-dark:shadow-red-950/30">
                    <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse guest-dark:bg-red-400" aria-hidden="true" />
                    <p className="text-sm font-semibold uppercase tracking-wider text-red-600 guest-dark:text-red-300">
                      {toast.message}
                    </p>
                  </div>
                ) : (
                  <div className="pointer-events-auto flex items-center gap-3 border border-gold/60/40 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg shadow-gold/50/20 guest-dark:border-gold/50/35 guest-dark:bg-panel/95 guest-dark:shadow-gold/95/40">
                    <motion.span
                      className="h-2 w-2 rounded-full bg-gold/50 guest-dark:bg-gold/60"
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1, repeat: Infinity }}
                      aria-hidden="true"
                    />
                    <p className="text-sm font-semibold uppercase tracking-wider text-gold guest-dark:text-gold/30">
                      {toast.message}
                    </p>
                  </div>
                )}
              </motion.div>
            )}
            {orderSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-x-0 top-8 z-[260] flex justify-center px-4 pointer-events-none"
                role="status"
                aria-live="polite"
              >
                <div className="pointer-events-auto flex items-center gap-3 border border-gold/60/40 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg shadow-gold/50/20 guest-dark:border-gold/50/35 guest-dark:bg-panel/95 guest-dark:shadow-gold/95/40">
                  <motion.span className="h-2 w-2 rounded-full bg-gold/50 guest-dark:bg-gold/60" animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 1, repeat: Infinity }} aria-hidden="true" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-gold guest-dark:text-gold/30">
                    Orden enviada a cocina
                  </p>
                </div>
              </motion.div>
            )}
            {orderError && (
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="fixed inset-x-0 top-8 z-[260] flex justify-center px-4 pointer-events-none"
                role="alert"
                aria-live="assertive"
              >
                <div className="pointer-events-auto flex items-center gap-3 border border-red-400/40 bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg shadow-red-500/20 guest-dark:border-red-500/35 guest-dark:bg-panel/95 guest-dark:shadow-red-950/30">
                  <span className="h-2 w-2 rounded-full bg-red-500 guest-dark:bg-red-400" aria-hidden="true" />
                  <p className="text-sm font-semibold uppercase tracking-wider text-red-600 guest-dark:text-red-300">
                    {orderError}
                  </p>
                </div>
              </motion.div>
            )}
              </AnimatePresence>
            </div>
          ),
          document.body,
        )}



      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-8 pb-32 lg:px-12 lg:pb-24">
        <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(260px,3fr)] lg:gap-12 lg:items-start">

          {/* LEFT: carta primero; mesa/cuenta como secundario */}
          <div>
            {/* Carta + cuenta + tema en una sola fila (sin barra sticky extra) */}
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-slate-200 pb-4 pt-1 guest-dark:border-wire/50">
              <div className="min-w-0 flex-1">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-400 guest-dark:text-dim">
                  Carta
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-800 guest-dark:text-light">
                  <span className="max-w-[min(100%,18rem)] truncate font-semibold" title={guestName}>
                    {guestName}
                  </span>
                  {isHostLive && (
                    <span className="text-[0.6rem] font-bold uppercase tracking-[0.18em] text-gold guest-dark:text-gold/60">
                      Anfitrión
                    </span>
                  )}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2 sm:gap-3">
                {!billRequested ? (
                  <Link
                    href={cuentaHref}
                    className="flex h-8 items-center justify-center rounded-full bg-text-primary px-5 text-[0.65rem] font-bold uppercase tracking-widest text-bg-solid transition-colors hover:bg-text-primary/90"
                  >
                    Cuenta y pago
                  </Link>
                ) : (
                  <span className="flex h-8 items-center justify-center rounded-full border border-border-main px-5 text-[0.65rem] font-bold uppercase tracking-widest text-text-muted">
                    Cuenta solicitada
                  </span>
                )}
                <GuestMenuThemeToggle
                  mode={menuTheme}
                  onChange={changeGuestMenuTheme}
                  className="size-8 border-slate-200/70 bg-slate-50/80 shadow-none hover:bg-slate-100/90 guest-dark:border-wire/55 guest-dark:bg-panel/60 guest-dark:hover:bg-panel"
                />
              </div>
            </div>

            {/* Códigos de mesa vs acceso — tarjeta ancho completo de la columna */}
            <section
              className="mt-4 flex flex-wrap items-end justify-between gap-4 border-b border-border-main pb-4"
              aria-label="Identificación de la mesa"
            >
              <div className="flex gap-8">
                <div>
                  <p className="text-[0.65rem] font-medium text-text-muted">
                    Código de mesa
                  </p>
                  <p
                    className="mt-1 font-mono text-lg font-normal tracking-wider text-text-primary"
                    aria-label={`Código de mesa: ${displayTableCode}`}
                  >
                    {displayTableCode}
                  </p>
                </div>
                {joinCode && (
                  <div>
                    <p className="text-[0.65rem] font-medium text-text-muted">
                      Código de acceso
                    </p>
                    <p
                      className="mt-1 font-mono text-lg font-normal tracking-wider text-text-primary"
                      aria-label={`Código de acceso: ${joinCode}`}
                    >
                      {joinCode}
                    </p>
                  </div>
                )}
              </div>
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-x-3 gap-y-1">
                <button
                  type="button"
                  onClick={() => setQrInviteFullscreenOpen(true)}
                  className="inline-flex items-center gap-2 text-[0.7rem] font-medium text-text-muted transition-colors hover:text-text-primary"
                  aria-haspopup="dialog"
                  aria-expanded={qrInviteFullscreenOpen}
                  aria-label="Abrir código QR para compartir la mesa"
                >
                  <Share2 className="h-3.5 w-3.5" aria-hidden />
                  Compartir
                </button>
                {isHostLive &&
                  guests.filter((g) => g.name !== guestName).length > 0 &&
                  !billRequested && (
                    <>
                      <span className="text-[0.65rem] text-text-muted/40 select-none" aria-hidden>
                        ·
                      </span>
                      <button
                        type="button"
                        onClick={() => setHostTransferDialogOpen(true)}
                        className="inline-flex items-center gap-1.5 text-[0.7rem] font-medium text-text-muted underline-offset-4 transition-colors hover:text-gold hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/40"
                        aria-haspopup="dialog"
                        aria-expanded={hostTransferDialogOpen}
                      >
                        Pasar anfitrión
                      </button>
                    </>
                  )}
              </div>
            </section>

            {/* Category tabs */}
            <div
              className="scrollbar-hide -mx-6 mt-3 flex overflow-x-auto border-b border-slate-200 px-6 lg:mx-0 lg:px-0 guest-dark:border-wire/50"
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
                    "shrink-0 px-4 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                    activeCategory === id
                      ? "border-b-[2px] border-gold/50 text-gold guest-dark:border-gold/60 guest-dark:text-gold/60"
                      : "text-slate-600 hover:text-slate-900 guest-dark:text-dim guest-dark:hover:text-light",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Menu rows */}
            <div role="tabpanel">
              {visibleItems.length === 0 && (
                <p className="py-16 text-center text-[0.75rem] font-medium text-slate-600/60 guest-dark:text-dim/70">
                  No hay platillos disponibles en esta categoría.
                </p>
              )}
              {visibleCats.map(cat => {
                const items = visibleItems.filter(i => i.categoryId === cat.id);
                if (items.length === 0) return null;
                return (
                  <div key={cat.id}>
                    {activeCategory === "todos" && (
                      <p className="pb-3 pt-8 text-xs font-semibold uppercase tracking-widest text-slate-500 guest-dark:text-dim">
                        {cat.name}
                      </p>
                    )}
                    {activeCategory !== "todos" && <div className="pt-8" />}
                    <div className="flex flex-col gap-4">
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
                          <motion.div
                            key={item.id}
                            layout
                            whileHover={{ y: -4, rotateZ: 0.5, transition: { type: "spring", stiffness: 400, damping: 25 } }}
                            className={[
                              "flex items-start justify-between gap-6 rounded-2xl border border-slate-200/30 bg-white/40 p-5 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md transition-shadow duration-200 hover:shadow-[0_20px_40px_rgba(15,23,42,0.14)] guest-dark:border-wire/45 guest-dark:bg-panel/55 guest-dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)] guest-dark:hover:shadow-[0_20px_48px_rgba(0,0,0,0.45)]",
                              item.isSoldOut ? "opacity-50" : "",
                            ].join(" ")}
                          >
                            <div className="min-w-0 flex-1">
                              <div className="flex flex-wrap items-baseline gap-2">
                                <p className="text-lg font-semibold leading-tight text-slate-900 guest-dark:text-light">
                                  {item.name}
                                </p>
                                {item.isPopular && !item.isSoldOut && (
                                  <span className="inline-flex items-center rounded-md border border-gold/50/30 bg-gold/50/[0.07] px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-gold guest-dark:border-gold/50/35 guest-dark:bg-gold/95/40 guest-dark:text-gold/30">
                                    Popular
                                  </span>
                                )}
                                {item.isSoldOut && (
                                  <span className="inline-flex items-center rounded-md border border-slate-200 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-slate-500 guest-dark:border-wire guest-dark:text-dim">
                                    Agotado
                                  </span>
                                )}
                              </div>
                              <p className="mt-2 text-sm font-medium leading-relaxed text-slate-600 guest-dark:text-dim/90">
                                {item.description}
                              </p>
                              {hasVariants && (
                                <div
                                  className="mt-4 flex flex-wrap gap-2"
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
                                          "rounded-lg px-3 py-2 text-xs font-semibold uppercase tracking-wide transition-all duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                                          active
                                            ? "border-0 bg-gold/50 text-white shadow-[0_4px_12px_rgba(16,185,129,0.35)] guest-dark:bg-gold guest-dark:shadow-[0_4px_14px_rgba(16,185,129,0.25)]"
                                            : "border-0 bg-slate-100 text-slate-700 hover:bg-slate-200/90 guest-dark:bg-panel guest-dark:text-light guest-dark:hover:bg-wire/80",
                                        ].join(" ")}
                                      >
                                        {v.name} ·{" "}
                                        <span className="font-mono tabular-nums">${v.price.toLocaleString("es-MX")}</span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                              {item.note && (
                                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-gold/80 guest-dark:text-gold/60/90">
                                  {item.note}
                                </p>
                              )}
                            </div>
                            <div className="flex shrink-0 flex-col items-end gap-3">
                              <span className="font-mono text-base font-semibold tabular-nums text-slate-900 guest-dark:text-light">
                                ${unitPrice.toLocaleString("es-MX")}
                              </span>
                              {!item.isSoldOut && (
                                <QtyControl
                                  qty={qty}
                                  name={qtyLabel}
                                  onAdd={() => setQty(lineKey, 1)}
                                  onInc={() => setQty(lineKey, qty + 1)}
                                  onDec={() => setQty(lineKey, qty - 1)}
                                />
                              )}
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </div>
                );
              })}
            </div>

            {orders && orders.length > 0 && (
              <OrderTracker
                orders={orders}
                tableCode={tableCode}
                guestName={guestName}
                partySize={partySize}
                isHost={isHostLive}
                billRequested={billRequested}
                onRefreshOrders={refreshOrders}
                hasOrderPipeline
                menuTheme={menuTheme}
              />
            )}

            <details className="group mt-14 border-t border-slate-200 pt-8 guest-dark:border-wire/50">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-left text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-slate-500 guest-dark:text-dim [&::-webkit-details-marker]:hidden">
                <span>Tu mesa y compañeros</span>
                <ChevronDown className="size-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180 guest-dark:text-dim" aria-hidden />
              </summary>
              <div className="mt-5 space-y-5">
                {guests.length > 0 && (
                  <div>
                    <p className="text-[0.52rem] font-bold uppercase tracking-[0.36em] text-slate-500/70 guest-dark:text-dim/70">
                      En la mesa
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {guests.map(g => (
                        <span
                          key={g.name}
                          className={[
                            "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.58rem] font-semibold uppercase tracking-[0.16em]",
                            g.name === guestName
                              ? "border-slate-300/20 text-slate-900 guest-dark:border-wire/60 guest-dark:text-light"
                              : "border-slate-200/50 text-slate-600/50 guest-dark:border-wire/35 guest-dark:text-dim/70",
                          ].join(" ")}
                        >
                          {g.isHost && (
                            <svg viewBox="0 0 10 10" fill="none" className="h-2 w-2 shrink-0 text-gold guest-dark:text-gold/60" aria-hidden="true">
                              <path d="M5 1l1.2 2.5L9 4.1 7 6l.5 2.9L5 7.5 2.5 8.9 3 6 1 4.1l2.8-.6L5 1z" fill="currentColor"/>
                            </svg>
                          )}
                          {g.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>

            {!billRequested && (
              <div className="mt-10 border-t border-slate-200/90 pt-6 text-center text-[0.72rem] leading-relaxed text-slate-500 guest-dark:border-wire/45 guest-dark:text-dim">
                {isHostLive && guests.filter((g) => g.name !== guestName).length > 0 ? (
                  <p>
                    Si sales antes y sigues como anfitrión,{" "}
                    <strong className="font-semibold text-slate-700 guest-dark:text-light/90">
                      pulsa «Pasar anfitrión»
                    </strong>{" "}
                    para elegir quién sigue. También puedes{" "}
                    <Link href={cuentaHref} className="font-medium text-gold underline-offset-2 hover:underline guest-dark:text-gold/60">
                      pagar solo tu parte
                    </Link>
                    .
                  </p>
                ) : (
                  <p>
                    Si sales antes, puedes{" "}
                    <Link href={cuentaHref} className="font-medium text-gold underline-offset-2 hover:underline guest-dark:text-gold/60">
                      pagar solo tu parte
                    </Link>
                    .
                  </p>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Sticky order panel (desktop only) */}
          <aside className="z-20 hidden lg:block lg:self-start lg:sticky lg:top-28">
            <div className="mt-8 rounded-none border border-border-main bg-bg-solid p-6 shadow-sm">
              <CartPanel {...cartPanelProps} />
              {!billRequested && (
                <div className="mt-6 border-t border-border-main pt-4 flex justify-end">
                  <Link
                    href={cuentaHref}
                    className="text-sm font-medium text-text-primary hover:text-gold transition-colors"
                  >
                    Pagar solo tu parte →
                  </Link>
                </div>
              )}
            </div>
          </aside>

        </div>
      </div>

      {/* ── MOBILE BOTTOM BAR (shown when cart has items) ────────────── */}
      {cartCount > 0 && (
        <div
          className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/40 backdrop-blur-sm px-6 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:hidden guest-dark:border-wire/60 guest-dark:bg-panel/85"
          style={{ animation: "slide-from-bottom 0.25s cubic-bezier(0.25,0.46,0.45,0.94) both" }}
        >
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex w-full items-center justify-between rounded-xl bg-gold/50 px-5 py-4 text-white shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition-all active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50"
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
            className="absolute inset-0 bg-white/75 guest-dark:bg-black/65"
            style={{ animation: "fade-in 0.2s ease-out both" }}
            onClick={() => setDrawerOpen(false)}
            aria-hidden="true"
          />
          <div
            className="absolute inset-x-0 bottom-0 border-t border-border-main bg-bg-solid px-6 pt-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-[0_-12px_40px_rgba(0,0,0,0.06)]"
            style={{ animation: "slide-from-bottom 0.28s cubic-bezier(0.25,0.46,0.45,0.94) both" }}
          >
            <div className="mx-auto max-w-lg">
              <CartPanel {...cartPanelProps} scrollable onClose={() => setDrawerOpen(false)} />
            </div>
          </div>
        </div>
      )}

      {qrInviteFullscreenOpen &&
        typeof document !== "undefined" &&
        createPortal(
          (
            <div data-guest-theme={menuTheme}>
            <div
            className="fixed inset-0 z-[110] flex items-center justify-center bg-black/88 p-4 backdrop-blur-md"
            role="presentation"
            onClick={() => setQrInviteFullscreenOpen(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="qr-invite-dialog-title"
              aria-describedby="qr-invite-dialog-desc"
              className="relative flex max-h-[min(92dvh,880px)] w-full max-w-md flex-col items-center overflow-y-auto px-2 pb-[max(1rem,env(safe-area-inset-bottom))] pt-[max(2.25rem,env(safe-area-inset-top))]"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setQrInviteFullscreenOpen(false)}
                className="absolute right-1 top-1 z-[1] flex min-h-11 min-w-11 items-center justify-center rounded-full bg-white/12 text-white transition-colors hover:bg-white/22"
                aria-label="Cerrar"
              >
                <X className="h-6 w-6" strokeWidth={2} aria-hidden />
              </button>
              <h2
                id="qr-invite-dialog-title"
                className="mb-5 max-w-sm px-3 text-center text-[1.05rem] font-semibold leading-snug text-white"
              >
                Invitar a la mesa{" "}
                <span className="font-mono tracking-[0.08em] text-white">{displayTableCode}</span>
              </h2>
              <div className="w-full max-w-[280px] rounded-3xl bg-white p-5 shadow-2xl shadow-black/40">
                {inviteFullUrl ? (
                  <QRCodeCanvas
                    ref={qrInviteCanvasRef}
                    value={inviteFullUrl}
                    size={260}
                    level="M"
                    marginSize={2}
                    bgColor="#FFFFFF"
                    fgColor="#000000"
                    className="mx-auto block max-h-[min(56vmin,260px)] w-full max-w-full"
                    title={`QR de invitación — Mesa ${displayTableCode}`}
                  />
                ) : (
                  <div
                    className="flex aspect-square w-full min-h-[200px] items-center justify-center rounded-2xl bg-slate-100 text-sm font-medium text-slate-500"
                    aria-live="polite"
                  >
                    Cargando código…
                  </div>
                )}
              </div>
              <p
                id="qr-invite-dialog-desc"
                className="mt-6 max-w-sm text-center text-xs leading-relaxed text-white/80"
              >
                Otros pueden escanear esta pantalla o usar el botón para enviar el enlace firmado (sin tu
                nombre).
              </p>
              <button
                type="button"
                onClick={() => void handleShareInvite()}
                disabled={!inviteFullUrl}
                className="mt-8 inline-flex min-h-12 w-full max-w-xs items-center justify-center gap-2 rounded-xl bg-gold/50 px-8 text-[0.72rem] font-bold uppercase tracking-[0.14em] text-white shadow-lg shadow-gold/95/40 transition-colors hover:bg-gold/60 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Share2 className="h-4 w-4 shrink-0" aria-hidden />
                Compartir invitación
              </button>
            </div>
          </div>
            </div>
          ),
          document.body,
        )}

      {hostTransferDialogOpen &&
        typeof document !== "undefined" &&
        createPortal(
          (
            <div data-guest-theme={menuTheme}>
            <div
              className="fixed inset-0 z-[115] flex items-center justify-center bg-black/65 p-4 backdrop-blur-sm"
              role="presentation"
              onClick={() => setHostTransferDialogOpen(false)}
            >
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="host-transfer-title"
              aria-describedby="host-transfer-desc"
              className="relative max-h-[90dvh] w-full max-w-md overflow-y-auto rounded-2xl border border-amber-200/90 bg-gradient-to-br from-amber-50 to-white p-6 shadow-xl guest-dark:border-amber-500/25 guest-dark:from-amber-950/45 guest-dark:to-panel"
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                id="host-transfer-title"
                className="text-base font-semibold leading-snug text-amber-950 guest-dark:text-amber-50"
              >
                ¿Te vas antes que los demás?
              </h3>
              <p id="host-transfer-desc" className="mt-2 text-sm leading-relaxed text-amber-950/90 guest-dark:text-amber-50/85">
                Solo el anfitrión puede pedir la cuenta para todos. Elige quién será el nuevo anfitrión antes de salir.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {guests
                  .filter((g) => g.name !== guestName)
                  .map((g) => (
                    <button
                      key={g.name}
                      type="button"
                      disabled={isTransferring}
                      onClick={() => {
                        startTransfer(async () => {
                          await transferHost(tableCode, guestName, g.name);
                          setHostTransferDialogOpen(false);
                          const state = await getGuestTableState(tableCode, guestName);
                          setGuests(state.guests);
                          setIsHostLive(state.isHost);
                        });
                      }}
                      className="min-h-10 rounded-lg border border-amber-800/20 px-4 py-2 text-[0.72rem] font-semibold uppercase tracking-[0.12em] text-amber-950 transition-colors hover:border-gold/50/55 hover:bg-gold/5/90 disabled:opacity-40 guest-dark:border-wire/55 guest-dark:text-light guest-dark:hover:border-gold/60/50 guest-dark:hover:bg-gold/95/35"
                    >
                      {g.name}
                    </button>
                  ))}
              </div>
              <button
                type="button"
                onClick={() => setHostTransferDialogOpen(false)}
                className="mt-6 text-sm font-medium text-amber-900/60 hover:text-amber-950 guest-dark:text-dim guest-dark:hover:text-light"
              >
                Cerrar
              </button>
            </div>
          </div>
            </div>
          ),
          document.body,
        )}
    </div>
  );
}
