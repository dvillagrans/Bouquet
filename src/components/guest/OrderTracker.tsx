"use client";

import { useState, useTransition, useEffect, useRef, useMemo } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, CookingPot, Bell, CheckCircle2, XCircle, AlertTriangle, ChevronDown } from "lucide-react";
import { cancelGuestOrder, requestBill } from "@/actions/comensal";
import { GuestAvatar } from "@/components/guest/ui";
import type { GuestMenuTheme } from "@/lib/guest-menu-theme";

// ─── Constants & Helpers ──────────────────────────────────────────────────

export function normalizeOrderStatus(raw: unknown): "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED" {
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

export const ORDER_STATUS: Record<
  "PENDING" | "PREPARING" | "READY" | "DELIVERED" | "CANCELLED",
  { label: string; summary: string; hint: string; badge: string; icon: any }
> = {
  PENDING: {
    label: "Pendiente",
    summary: "en espera",
    hint: "En cola de preparación",
    badge: "border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] text-[var(--guest-muted)]",
    icon: Clock,
  },
  PREPARING: {
    label: "Preparando",
    summary: "en cocina",
    hint: "Tu pedido se está elaborando",
    badge: "border-amber-500/40 bg-amber-500/10 text-amber-900 guest-dark:border-amber-500/35 guest-dark:bg-amber-950/40 guest-dark:text-amber-200",
    icon: CookingPot,
  },
  READY: {
    label: "Listo",
    summary: "listo",
    hint: "El mesero lo llevará a la mesa",
    badge: "border-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)] bg-[var(--guest-halo)] text-[var(--guest-gold)]",
    icon: Bell,
  },
  DELIVERED: {
    label: "Entregado",
    summary: "entregado",
    hint: "Servido en mesa",
    badge: "border-[var(--guest-divider)] bg-[color-mix(in_srgb,var(--guest-bg-surface)_85%,transparent)] text-[var(--guest-subtle)]",
    icon: CheckCircle2,
  },
  CANCELLED: {
    label: "Cancelado",
    summary: "cancelado",
    hint: "No se cobrará este pedido",
    badge: "border-[color-mix(in_srgb,var(--guest-urgent)_35%,transparent)] bg-[color-mix(in_srgb,var(--guest-urgent)_12%,transparent)] text-[var(--guest-urgent)]",
    icon: XCircle,
  },
};

export function guestOrderSummaryPreview(order: any): string {
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

// ─── Components ─────────────────────────────────────────────────────────────

export function OrderRow({
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

export function OrderTracker({
  orders,
  tableCode,
  guestName,
  isHost,
  activeGuestCount,
  billRequested,
  onRefreshOrders,
  hasOrderPipeline = false,
  menuTheme = "light",
  displayMode = "inline",
}: {
  orders: any[];
  tableCode: string;
  guestName: string;
  isHost: boolean;
  activeGuestCount: number;
  billRequested: boolean;
  onRefreshOrders: () => void | Promise<void>;
  hasOrderPipeline?: boolean;
  menuTheme?: GuestMenuTheme;
  displayMode?: "inline" | "content";
}) {
  const router = useRouter();
  const activeList = useMemo(() => orders.filter((o) => {
    const s = normalizeOrderStatus(o.status);
    return s !== "DELIVERED" && s !== "CANCELLED";
  }), [orders]);

  const deliveredList = useMemo(() => orders.filter((o) => normalizeOrderStatus(o.status) === "DELIVERED"), [orders]);
  const cancelledList = useMemo(() => orders.filter((o) => normalizeOrderStatus(o.status) === "CANCELLED"), [orders]);

  const [cancellingOrderId, setCancellingOrderId] = useState<string | null>(null);
  const [cancelVerifyOrderId, setCancelVerifyOrderId] = useState<string | null>(null);
  const [portalMounted, setPortalMounted] = useState(false);

  useEffect(() => {
    setPortalMounted(true);
  }, []);

  const verifyCancelOrder = useMemo(() => 
    cancelVerifyOrderId ? orders.find((o) => o.id === cancelVerifyOrderId) : null
  , [cancelVerifyOrderId, orders]);

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
  const isSoloGuestFlow = activeGuestCount <= 1;
  const [billDecisionDialogOpen, setBillDecisionDialogOpen] = useState(false);

  function closeBillDecisionDialog() {
    if (isRequestingBill) return;
    setBillDecisionDialogOpen(false);
  }

  function goToBillNow() {
    setBillDecisionDialogOpen(false);
    router.push(cuentaHref);
  }

  function handleRequestBill() {
    startBillTransition(async () => {
      try {
        await requestBill(tableCode, guestName);
        if (isSoloGuestFlow) {
          setBillDecisionDialogOpen(true);
          return;
        }
        router.push(cuentaHref);
      } catch (e) {
        alert((e as Error).message || "No se pudo pedir la cuenta");
      }
    });
  }

  const [open, setOpen] = useState(activeList.length > 0);
  const prevActiveLen = useRef(activeList.length);
  useEffect(() => {
    if (activeList.length > prevActiveLen.current) setOpen(true);
    prevActiveLen.current = activeList.length;
  }, [activeList.length]);

  const contentOpen = displayMode === "content" ? true : open;

  const counts = useMemo(() => ({
    PENDING: activeList.filter((o) => normalizeOrderStatus(o.status) === "PENDING").length,
    PREPARING: activeList.filter((o) => normalizeOrderStatus(o.status) === "PREPARING").length,
    READY: activeList.filter((o) => normalizeOrderStatus(o.status) === "READY").length,
  }), [activeList]);

  const summaryBadges = useMemo(() => {
    return (
      [
        [
          "READY",
          counts.READY,
          "border-[color-mix(in_srgb,var(--guest-gold)_45%,transparent)] bg-[var(--guest-halo)] text-[var(--guest-gold)]",
        ],
        [
          "PREPARING",
          counts.PREPARING,
          "border-amber-500/40 bg-amber-500/10 text-amber-900 guest-dark:border-amber-500/35 guest-dark:bg-amber-950/35 guest-dark:text-amber-200",
        ],
        [
          "PENDING",
          counts.PENDING,
          "border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] text-[var(--guest-muted)]",
        ],
      ] as [string, number, string][]
    ).filter(([, n]) => n > 0);
  }, [counts]);

  return (
    <div className={displayMode === "inline" ? "border-b border-[var(--guest-divider)]" : ""}>
      {displayMode === "inline" ? (
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
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

            {activeList.length === 0 ? (
              <span className="text-xs font-medium text-[var(--guest-gold)]">
                {deliveredList.length > 0
                  ? "· todos entregados"
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
                    {(status === "READY" || status === "PREPARING") && (
                      <span
                        className={`h-2 w-2 rounded-full guest-status-dot-pulse ${status === "READY" ? "bg-[var(--guest-gold)]" : "bg-amber-500"}`}
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
      ) : null}

      <AnimatePresence>
        {contentOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className={displayMode === "content" ? "pb-2 pt-2" : "pb-6 pt-4"}>
              <div className="max-h-56 overflow-y-auto space-y-2">
                {activeList.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {activeList.map((o, idx) => (
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

                {deliveredList.length > 0 && (
                  <>
                    {activeList.length > 0 && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-[var(--guest-divider)]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--guest-muted)]">
                          {deliveredList.length} entregada{deliveredList.length !== 1 ? "s" : ""}
                        </span>
                        <div className="h-px flex-1 bg-[var(--guest-divider)]" />
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      {deliveredList.map((o) => (
                        <OrderRow key={o.id} order={o} guestName={guestName} billRequested={billRequested} />
                      ))}
                    </div>
                  </>
                )}

                {cancelledList.length > 0 && (
                  <>
                    {(activeList.length > 0 || deliveredList.length > 0) && (
                      <div className="my-4 flex items-center gap-3">
                        <div className="h-px flex-1 bg-[var(--guest-divider)]" />
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--guest-muted)]">
                          Cancelados
                        </span>
                        <div className="h-px flex-1 bg-[var(--guest-divider)]" />
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

              <div className="mt-6 border-t border-[var(--guest-divider)] pt-4">
                {isHost ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleRequestBill}
                    disabled={isRequestingBill}
                    className={activeList.length === 0
                      ? "flex w-full min-h-12 items-center justify-center gap-2 rounded-xl bg-[color-mix(in_srgb,var(--guest-gold)_88%,#1a1510)] py-4 text-sm font-bold uppercase tracking-wider text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.12)] transition-all hover:opacity-95"
                      : "flex w-full min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-[var(--guest-divider)] py-3.5 text-xs font-bold uppercase tracking-wider text-[var(--guest-muted)] transition-all hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] hover:bg-[var(--guest-bg-surface)] hover:text-[var(--guest-text)]"
                    }
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-4 w-4" aria-hidden="true">
                      <path d="M2 4h12M2 8h8M2 12h5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
                    </svg>
                    {isRequestingBill ? "Cerrando mesa…" : "Pedir la cuenta"}
                  </motion.button>
                ) : (
                  <p className="text-center text-xs font-medium uppercase tracking-widest text-[var(--guest-muted)]">
                    Solo el anfitrión puede pedir la cuenta
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {portalMounted && billDecisionDialogOpen && createPortal(
        <motion.div
          className="fixed inset-0 z-[201] flex items-center justify-center bg-[color-mix(in_srgb,var(--guest-text)_52%,transparent)] p-4 backdrop-blur-sm"
          onClick={closeBillDecisionDialog}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] bg-[var(--guest-halo)]">
                <CheckCircle2 className="size-6 text-[var(--guest-gold)]" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="guest-bill-decision-title" className="text-lg font-semibold leading-tight text-[var(--guest-text)]">
                  Cuenta solicitada
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--guest-muted)]">
                  Tu mesa ya está en cierre. ¿Quieres ir a pagar ahora o prefieres revisar algo más antes de continuar?
                </p>
              </div>
            </div>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end sm:gap-3">
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={closeBillDecisionDialog}
                className="order-2 w-full rounded-xl border-2 border-[var(--guest-divider)] py-3 text-sm font-semibold uppercase tracking-wider text-[var(--guest-muted)] transition-all hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] hover:text-[var(--guest-text)] sm:order-1 sm:w-auto sm:min-w-[10rem]"
              >
                Seguir pidiendo
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={goToBillNow}
                className="order-1 w-full rounded-xl bg-[color-mix(in_srgb,var(--guest-gold)_88%,#1a1510)] py-3 text-sm font-semibold uppercase tracking-wider text-white transition-all hover:opacity-95 sm:order-2 sm:w-auto sm:min-w-[10rem]"
              >
                Ir a pagar
              </motion.button>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}

      {portalMounted && cancelVerifyOrderId && verifyCancelOrder && createPortal(
        <motion.div
          className="fixed inset-0 z-[200] flex items-center justify-center bg-[color-mix(in_srgb,var(--guest-text)_52%,transparent)] p-4 backdrop-blur-sm"
          onClick={dismissCancelVerification}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-sm rounded-2xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] p-8 shadow-[0_24px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--guest-urgent)_35%,transparent)] bg-[color-mix(in_srgb,var(--guest-urgent)_12%,transparent)]">
                <AlertTriangle className="size-6 text-[var(--guest-urgent)]" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <h2 id="guest-cancel-order-title" className="text-lg font-semibold leading-tight text-[var(--guest-text)]">
                  ¿Cancelar este pedido?
                </h2>
                <p className="mt-3 text-sm leading-relaxed text-[var(--guest-muted)]">
                  Solo puedes hacerlo mientras sigue <strong className="text-[var(--guest-text)]">pendiente</strong>. Si ya entró a cocina, no se puede cancelar desde aquí.
                </p>
                <p className="mt-3 rounded-lg border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-3 py-2 font-mono text-xs text-[var(--guest-muted)]">
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
                className="order-2 w-full rounded-xl border-2 border-[var(--guest-divider)] py-3 text-sm font-semibold uppercase tracking-wider text-[var(--guest-muted)] transition-all hover:border-[color-mix(in_srgb,var(--guest-gold)_35%,transparent)] hover:text-[var(--guest-text)] disabled:opacity-50 sm:order-1 sm:w-auto sm:min-w-[10rem]"
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
