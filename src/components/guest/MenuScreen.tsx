"use client";

import { useState, useTransition, useEffect, useRef, useMemo, useCallback } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { submitComensalOrder, getGuestOrders, requestBill, transferHost, getGuestTableState, cancelGuestOrder } from "@/actions/comensal";
import {
  CartSummaryBar,
  CategoryHeading,
  CategoryTabs,
  ContextIsland,
  GuestAvatar,
  GuestCartPanel,
  GuestMasthead,
  GuestToast,
  MenuRow,
  OrderSheet,
  type GuestCartLine,
  type MenuRowItem,
  type CategoryTabItem,
} from "@/components/guest/ui";
import { createClient } from "@/lib/supabase/client";
import type { GuestMenuTheme } from "@/lib/guest-menu-theme";
import { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";
import { ChevronDown, Clock, CookingPot, Bell, CheckCircle2, XCircle, AlertTriangle, Share2, X } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { getSignedGuestPreviewUrl } from "@/actions/tables";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
// ─── Types ──────────────────────────────────────────────────────────────────

interface Category {
  id: string;
  name: string;
}

interface MenuItem extends MenuRowItem {
  categoryId: string;
  categoryName?: string;
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

type CartLine = {
  key: string;
  item: MenuItem;
  variantName: string | null;
  qty: number;
  unitPrice: number;
};

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

function OrderTracker({
  orders,
  tableCode,
  guestName,
  isHost,
  billRequested,
  onRefreshOrders,
  hasOrderPipeline = false,
  menuTheme = "light",
}: {
  orders: any[];
  tableCode: string;
  guestName: string;
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
    <div className="border-b border-[var(--guest-divider)]">
      {/* Summary bar — always visible */}
      <button
        type="button"
        onClick={() => setOpen(v => !v)}
        className="flex min-h-[52px] w-full items-center justify-between gap-4 rounded-xl py-5 text-left transition-colors hover:bg-[color-mix(in_srgb,var(--guest-bg-surface)_70%,transparent)]"
        aria-expanded={open}
      >
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <span className="shrink-0 text-xs font-bold uppercase tracking-widest text-[var(--guest-text)]">
            {hasOrderPipeline ? "Detalle de pedidos" : "Tus pedidos"}
          </span>
          <span className="shrink-0 font-mono text-base font-semibold text-[var(--guest-muted)]">
            ({orders.length})
          </span>

          {active.length === 0 ? (
            <span className="text-xs font-medium text-[var(--guest-gold)]">
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
                <span
                  key={status}
                  className={`inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${cls}`}
                >
                  {status === "READY" && (
                    <span
                      className="h-2 w-2 rounded-full bg-[var(--guest-gold)] guest-status-dot-pulse"
                      aria-hidden="true"
                    />
                  )}
                  {status === "PREPARING" && (
                    <span
                      className="h-2 w-2 rounded-full bg-amber-500 guest-status-dot-pulse"
                      aria-hidden="true"
                    />
                  )}
                  {count} {meta.summary}
                </span>
              );
            })
          )}
        </div>

        <ChevronDown
          className={`h-5 w-5 shrink-0 text-[var(--guest-muted)] transition-transform duration-300 ${open ? "rotate-180" : ""}`}
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
          ? "border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] opacity-60"
          : "border-[var(--guest-divider)] bg-[var(--guest-bg-surface)]",
        st === "CANCELLED" ? "opacity-50" : "",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            <span className="font-mono text-xs text-[var(--guest-muted)]">#{order.id.slice(-4)}</span>
            {order.items[0]?.session?.guestName && (
              <span className="text-xs font-medium text-[var(--guest-gold)]">{order.items[0].session.guestName}</span>
            )}
          </div>
          <p className="mt-1.5 truncate text-sm font-semibold leading-snug text-[var(--guest-text)]">{summary}</p>
          <p className="mt-1.5 text-xs leading-snug text-[var(--guest-muted)]">{meta.hint}</p>
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
  tableNumber: number;
  restaurantName: string;
  initialCategories: Category[];
  initialItems: MenuItem[];
  initialOrders?: any[];
  isHost?: boolean;
  initialBillRequested?: boolean;
  initialGuests?: { name: string; isHost: boolean }[];
  joinCode?: string | null;
}

type CartMap = Record<string, number>;

export function MenuScreen({
  guestName,
  partySize,
  tableCode,
  tableNumber,
  restaurantName,
  initialCategories,
  initialItems,
  initialOrders = [],
  isHost = false,
  initialBillRequested = false,
  initialGuests = [],
  joinCode,
}: MenuScreenProps) {
  const router = useRouter();
  const reducedMotion = useReducedMotion();
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

  const guestCartLines: GuestCartLine[] = useMemo(
    () =>
      cartLines.map((l) => ({
        key: l.key,
        name: l.item.name,
        variantLabel: l.variantName,
        qty: l.qty,
        lineTotal: l.unitPrice * l.qty,
      })),
    [cartLines],
  );

  const categoryTabItems: CategoryTabItem[] = useMemo(() => {
    const todosCount = initialItems.length;
    const tabs: CategoryTabItem[] = [{ id: "todos", label: "Todo", count: todosCount }];
    for (const c of initialCategories) {
      const n = initialItems.filter((i) => i.categoryId === c.id).length;
      tabs.push({ id: c.id, label: c.name, count: n });
    }
    return tabs;
  }, [initialCategories, initialItems]);

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
                    key={`toast-${toast.type}-${toast.message}`}
                    initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -16 }}
                    transition={{ duration: reducedMotion ? 0 : 0.22 }}
                    className="fixed inset-x-0 top-8 z-[260] flex justify-center px-4 pointer-events-none"
                    role={toast.type === "error" ? "alert" : "status"}
                    aria-live={toast.type === "error" ? "assertive" : "polite"}
                  >
                    <GuestToast tone={toast.type === "error" ? "error" : "success"}>
                      {toast.message}
                    </GuestToast>
                  </motion.div>
                )}
                {orderSuccess && (
                  <motion.div
                    key="order-success"
                    initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -16 }}
                    transition={{ duration: reducedMotion ? 0 : 0.22 }}
                    className="fixed inset-x-0 top-8 z-[260] flex justify-center px-4 pointer-events-none"
                    role="status"
                    aria-live="polite"
                  >
                    <GuestToast tone="success">
                      Orden enviada a cocina
                    </GuestToast>
                  </motion.div>
                )}
                {orderError && (
                  <motion.div
                    key={`err-${orderError}`}
                    initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -16 }}
                    transition={{ duration: reducedMotion ? 0 : 0.22 }}
                    className="fixed inset-x-0 top-8 z-[260] flex justify-center px-4 pointer-events-none"
                    role="alert"
                    aria-live="assertive"
                  >
                    <GuestToast tone="error">
                      {orderError}
                    </GuestToast>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ),
          document.body,
        )}



      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-36 sm:px-8 lg:px-12 lg:pb-24">
        <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-12 lg:items-start">
          <div>
            <GuestMasthead
              restaurantName={restaurantName}
              tableNumber={tableNumber}
              guestName={guestName}
              isHost={isHostLive}
              billRequested={billRequested}
            />

            <div className="sticky top-0 z-30 mt-6 space-y-4 border-b border-[var(--guest-divider)] bg-[color-mix(in_srgb,var(--guest-bg-page)_92%,transparent)] py-4 backdrop-blur-xl">
              <ContextIsland
                displayTableCode={displayTableCode}
                joinCode={joinCode}
                cuentaHref={cuentaHref}
                billRequested={billRequested}
                menuTheme={menuTheme}
                onThemeChange={changeGuestMenuTheme}
                onShareQr={() => setQrInviteFullscreenOpen(true)}
                qrOpen={qrInviteFullscreenOpen}
                showTransferHost={
                  Boolean(isHostLive && guests.filter((g) => g.name !== guestName).length > 0 && !billRequested)
                }
                onTransferHost={() => setHostTransferDialogOpen(true)}
              />
              <CategoryTabs
                tabs={categoryTabItems}
                activeId={activeCategory}
                onChange={setCategory}
                layoutId="guest-menu-cat"
              />
            </div>

            <div role="tabpanel" className="mt-8">
              {visibleItems.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] px-6 py-16 text-center">
                  <p className="font-serif text-2xl text-[var(--guest-text)]">Sin platillos aquí</p>
                  <p className="mt-2 text-sm text-[var(--guest-muted)]">
                    Prueba otra categoría o vuelve a ver toda la carta.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCategory("todos")}
                    className="mt-6 min-h-11 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-page)] px-6 text-sm font-semibold text-[var(--guest-text)] transition-colors hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)]"
                  >
                    Ver toda la carta
                  </button>
                </div>
              )}
              {visibleCats.map((cat) => {
                const items = visibleItems.filter((i) => i.categoryId === cat.id);
                if (items.length === 0) return null;
                return (
                  <div key={cat.id} className="divide-y divide-[var(--guest-divider)]">
                    <CategoryHeading title={cat.name} count={items.length} />
                    {items.map((item) => {
                      const hasVariants = item.variants && item.variants.length > 0;
                      const selectedVariantName = hasVariants
                        ? (variantChoice[item.id] ?? item.variants[0]!.name)
                        : null;
                      const lineKey = encodeLineKey(item.id, selectedVariantName);
                      const qty = cart[lineKey] ?? 0;
                      const unitPrice = hasVariants
                        ? item.variants.find((v) => v.name === selectedVariantName)?.price ?? item.price
                        : item.price;
                      const qtyLabel =
                        hasVariants && selectedVariantName ? `${item.name} (${selectedVariantName})` : item.name;
                      return (
                        <MenuRow
                          key={item.id}
                          item={item}
                          categoryInitial={cat.name}
                          selectedVariantName={selectedVariantName}
                          onVariantChange={(name) => setVariantChoice((prev) => ({ ...prev, [item.id]: name }))}
                          unitPrice={unitPrice}
                          qty={qty}
                          qtyLabel={qtyLabel}
                          onAdd={() => setQty(lineKey, 1)}
                          onInc={() => setQty(lineKey, qty + 1)}
                          onDec={() => setQty(lineKey, qty - 1)}
                          disabledQty={billRequested}
                        />
                      );
                    })}
                  </div>
                );
              })}
            </div>

            {orders && orders.length > 0 && (
              <OrderTracker
                orders={orders}
                tableCode={tableCode}
                guestName={guestName}
                isHost={isHostLive}
                billRequested={billRequested}
                onRefreshOrders={refreshOrders}
                hasOrderPipeline
                menuTheme={menuTheme}
              />
            )}

            <details className="group mt-14 border-t border-[var(--guest-divider)] pt-8">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-2 text-left text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--guest-muted)] [&::-webkit-details-marker]:hidden">
                <span>Tu mesa y compañeros</span>
                <ChevronDown
                  className="size-4 shrink-0 text-[var(--guest-muted)] transition-transform duration-200 group-open:rotate-180"
                  aria-hidden
                />
              </summary>
              <div className="mt-5 space-y-5">
                {guests.length > 0 && (
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-[var(--guest-muted)]">
                      En la mesa
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {guests.map((g) => (
                        <span
                          key={g.name}
                          className="inline-flex min-h-11 items-center gap-2 rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] py-1.5 pl-1.5 pr-4 text-sm font-medium text-[var(--guest-text)]"
                          aria-label={g.isHost ? `${g.name}, anfitrión` : g.name}
                        >
                          <GuestAvatar name={g.name} size="sm" />
                          <span className="min-w-0 truncate">{g.name}</span>
                          {g.isHost && (
                            <svg
                              viewBox="0 0 10 10"
                              fill="none"
                              className="h-3 w-3 shrink-0 text-[var(--guest-gold)]"
                              aria-hidden="true"
                            >
                              <path d="M5 1l1.2 2.5L9 4.1 7 6l.5 2.9L5 7.5 2.5 8.9 3 6 1 4.1l2.8-.6L5 1z" fill="currentColor" />
                            </svg>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </details>

            {!billRequested && (
              <div className="mt-10 border-t border-[var(--guest-divider)] pt-6 text-center text-sm leading-relaxed text-[var(--guest-muted)]">
                {isHostLive && guests.filter((g) => g.name !== guestName).length > 0 ? (
                  <p>
                    Si sales antes y sigues como anfitrión,{" "}
                    <strong className="font-semibold text-[var(--guest-text)]">pulsa «Pasar anfitrión»</strong> para
                    elegir quién sigue. También puedes{" "}
                    <Link
                      href={cuentaHref}
                      className="font-medium text-[var(--guest-gold)] underline-offset-2 hover:underline"
                    >
                      pagar solo tu parte
                    </Link>
                    .
                  </p>
                ) : (
                  <p>
                    Si sales antes, puedes{" "}
                    <Link
                      href={cuentaHref}
                      className="font-medium text-[var(--guest-gold)] underline-offset-2 hover:underline"
                    >
                      pagar solo tu parte
                    </Link>
                    .
                  </p>
                )}
              </div>
            )}
          </div>

          <aside className="z-20 hidden lg:block lg:self-start lg:sticky lg:top-8">
            <div className="mt-8 rounded-[22px] border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] p-6 shadow-[inset_0_1px_0_var(--guest-panel-edge)]">
              <GuestCartPanel
                cartLines={guestCartLines}
                cartCount={cartCount}
                cartTotal={cartTotal}
                partySize={partySize}
                tableCode={tableCode}
                onRemove={(lineKey) => setQty(lineKey, 0)}
                onClear={() => setCart({})}
                onCheckout={handleCheckout}
                isSubmitting={isPending}
                cuentaHref={billRequested ? undefined : cuentaHref}
                showCelebration={orderSuccess}
              />
            </div>
          </aside>
        </div>
      </div>

      {cartCount > 0 && !drawerOpen && (
        <CartSummaryBar cartCount={cartCount} cartTotal={cartTotal} onOpen={() => setDrawerOpen(true)} />
      )}

      <OrderSheet open={drawerOpen} onClose={() => setDrawerOpen(false)} titleId="guest-cart-title">
        <GuestCartPanel
          cartLines={guestCartLines}
          cartCount={cartCount}
          cartTotal={cartTotal}
          partySize={partySize}
          tableCode={tableCode}
          scrollable
          onRemove={(lineKey) => setQty(lineKey, 0)}
          onClear={() => setCart({})}
          onClose={() => setDrawerOpen(false)}
          onCheckout={handleCheckout}
          isSubmitting={isPending}
          cuentaHref={billRequested ? undefined : cuentaHref}
          showCelebration={orderSuccess}
        />
      </OrderSheet>

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
