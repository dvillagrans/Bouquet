"use client";

import { useState, useTransition, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { submitComensalOrder, getGuestOrders, requestBill, transferHost, getGuestTableState, cancelGuestOrder } from "@/actions/comensal";
import {
  CartSummaryBar,
  CategoryHeading,
  CategoryTabs,
  ContextIsland,
  DishDetailSheet,
  GuestAvatar,
  GuestCartPanel,
  GuestMasthead,
  GuestToast,
  MenuRow,
  NetworkBanner,
  OrderSheet,
  type GuestCartLine,
  type MenuRowItem,
  type CategoryTabItem,
} from "@/components/guest/ui";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";
import type { AssistantAddToCartItem } from "@/components/guest/GuestMenuAIAssistant";
import { OrderTracker } from "./OrderTracker";
import { createClient } from "@/lib/supabase/client";
import type { GuestMenuTheme } from "@/lib/guest-menu-theme";
import { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";
import { cn } from "@/lib/utils";
import { ChevronDown, Share2, X } from "lucide-react";
import { getSignedGuestPreviewUrl } from "@/actions/tables";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

// ─── Lazy Loading ───────────────────────────────────────────────────────────

const LazyGuestMenuAIAssistant = dynamic(
  () => import("@/components/guest/GuestMenuAIAssistant").then(mod => mod.GuestMenuAIAssistant),
  { ssr: false }
);

const LazyQRCodeCanvas = dynamic(
  () => import("qrcode.react").then(mod => mod.QRCodeCanvas),
  { ssr: false }
);
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

function normalizeMenuText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

type CartLine = {
  key: string;
  item: MenuItem;
  variantName: string | null;
  qty: number;
  unitPrice: number;
};

// Extracted to OrderTracker.tsx

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
  const networkStatus = useNetworkStatus();
  const [cart, setCart]               = useState<CartMap>({});
  /** Tamaño elegido por platillo (solo ítems con variantes). */
  const [variantChoice, setVariantChoice] = useState<Record<string, string>>({});
  const [orders, setOrders]           = useState(initialOrders);
  const [billRequested, setBillRequested] = useState(initialBillRequested);
  const [guests, setGuests]               = useState(initialGuests);
  /** Rol anfitrión puede cambiar sin recargar (p. ej. transferencia). */
  const [isHostLive, setIsHostLive]       = useState(isHost);
  const [tableCompanionsOpen, setTableCompanionsOpen] = useState(false);
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
  const [orderTrackerModalOpen, setOrderTrackerModalOpen] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error"; onClick?: () => void } | null>(null);
  /** Portal de toasts solo tras montar (evita mismatch SSR/cliente vs `document.body`). */
  const [toastPortalReady, setToastPortalReady] = useState(false);
  const [detailItem, setDetailItem] = useState<MenuItem | null>(null);

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
    const overlayOpen = qrInviteFullscreenOpen || tableCompanionsOpen || orderTrackerModalOpen;
    if (!overlayOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (tableCompanionsOpen) setTableCompanionsOpen(false);
      else if (qrInviteFullscreenOpen) setQrInviteFullscreenOpen(false);
      else setOrderTrackerModalOpen(false);
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [qrInviteFullscreenOpen, tableCompanionsOpen, orderTrackerModalOpen]);

  const orderTrackerSummary = useMemo(() => {
    const active = orders.filter((o) => {
      const s = String(o.status ?? "").toUpperCase();
      return s !== "DELIVERED" && s !== "CANCELLED";
    });
    const pending = active.filter((o) => String(o.status ?? "").toUpperCase() === "PENDING").length;
    const delivered = orders.filter((o) => String(o.status ?? "").toUpperCase() === "DELIVERED").length;
    return {
      total: orders.length,
      active: active.length,
      ready: active.filter((o) => String(o.status ?? "").toUpperCase() === "READY").length,
      preparing: active.filter((o) => String(o.status ?? "").toUpperCase() === "PREPARING").length,
      pending,
      delivered,
    };
  }, [orders]);


  const orderTrackerTone = useMemo(() => {
    const tones: Record<string, {
      key: "ready" | "preparing" | "pending" | "delivered";
      label: string;
      container: string;
      title: string;
      ring: string;
      icon: string;
    }> = {
      ready: {
        key: "ready",
        label: "Listo para servir",
        container: "border-emerald-400/45 bg-emerald-500/12 text-emerald-900 guest-dark:text-emerald-200",
        title: "text-emerald-700 guest-dark:text-emerald-300",
        ring: "bg-emerald-500",
        icon: "border-emerald-400/40 bg-emerald-500/15 text-emerald-700 guest-dark:text-emerald-300",
      },
      preparing: {
        key: "preparing",
        label: "En preparación",
        container: "border-amber-400/45 bg-amber-500/12 text-amber-900 guest-dark:text-amber-200",
        title: "text-amber-700 guest-dark:text-amber-300",
        ring: "bg-amber-500",
        icon: "border-amber-400/40 bg-amber-500/15 text-amber-700 guest-dark:text-amber-300",
      },
      pending: {
        key: "pending",
        label: "Pendiente en cola",
        container: "border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] text-[var(--guest-text)]",
        title: "text-[var(--guest-muted)]",
        ring: "bg-[var(--guest-muted)]",
        icon: "border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] text-[var(--guest-muted)]",
      },
      delivered: {
        key: "delivered",
        label: "Todo entregado",
        container: "border-[color-mix(in_srgb,var(--guest-gold)_30%,transparent)] bg-[var(--guest-halo)] text-[var(--guest-text)]",
        title: "text-[var(--guest-gold)]",
        ring: "bg-[var(--guest-gold)]",
        icon: "border-[color-mix(in_srgb,var(--guest-gold)_30%,transparent)] bg-[var(--guest-bg-surface)] text-[var(--guest-gold)]",
      },
    };

    if (orderTrackerSummary.ready > 0) return tones.ready;
    if (orderTrackerSummary.preparing > 0) return tones.preparing;
    if (orderTrackerSummary.pending > 0) return tones.pending;
    return tones.delivered;
  }, [orderTrackerSummary]);

  const orderTrackerSummaryText = useMemo(() => {
    const segments = [
      `${orderTrackerSummary.total} pedidos`,
      `${orderTrackerSummary.ready} listo${orderTrackerSummary.ready === 1 ? "" : "s"}`,
    ];
    if (orderTrackerSummary.preparing > 0) {
      segments.push(`${orderTrackerSummary.preparing} en cocina`);
    }
    if (orderTrackerSummary.pending > 0) {
      segments.push(`${orderTrackerSummary.pending} pendientes`);
    }
    return segments.join(" · ");
  }, [orderTrackerSummary]);

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
      .on("broadcast", { event: "shared-order" }, (payload) => {
        const p = payload.payload as { orderedBy: string; summary: string; suggestedPart: number };
        if (p.orderedBy !== guestName) {
          setToast({
            type: "success",
            message: `${p.orderedBy} ordenó ${p.summary} para compartir — tu parte sugerida: $${p.suggestedPart.toLocaleString("es-MX")}`
          });
        }
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

  function handleCheckout(isShared: boolean) {
    if (networkStatus === "offline") {
      setOrderError("Sin conexión. Conéctate a internet para enviar tu orden.");
      setTimeout(() => setOrderError(null), 4000);
      return;
    }
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
          isShared,
        });

        await refreshOrders();

        // Vaciamos carrito y mostramos celebración; el drawer cierra solo tras la animación
        setCart({});
        setOrderSuccess(true);
        setTimeout(() => {
          setOrderSuccess(false);
          setDrawerOpen(false);
        }, 2600);
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

  const handleAssistantAddToCart = useCallback((requestedItems: AssistantAddToCartItem[]) => {
    if (billRequested) {
      setToast({ type: "error", message: "Ya se solicito la cuenta para esta mesa. No se pueden agregar ordenes." });
      return;
    }

    const normalizedRequests = requestedItems
      .map((item) => ({
        name: typeof item?.name === "string" ? item.name.trim() : "",
        quantity: Number.isFinite(item?.quantity)
          ? Math.max(1, Math.min(20, Math.trunc(item.quantity)))
          : 1,
      }))
      .filter((item) => item.name.length > 0);

    if (normalizedRequests.length === 0) return;

    const missing: string[] = [];
    let addedUnits = 0;

    setCart((prev) => {
      const next = { ...prev };

      for (const req of normalizedRequests) {
        const reqName = normalizeMenuText(req.name);

        const matchedItem =
          initialItems.find((item) => normalizeMenuText(item.name) === reqName) ??
          initialItems.find((item) => normalizeMenuText(item.name).includes(reqName) || reqName.includes(normalizeMenuText(item.name)));

        if (!matchedItem || matchedItem.isSoldOut) {
          missing.push(req.name);
          continue;
        }

        const variantName = matchedItem.variants?.length
          ? (variantChoice[matchedItem.id] ?? matchedItem.variants[0]?.name ?? null)
          : null;
        const lineKey = encodeLineKey(matchedItem.id, variantName);
        next[lineKey] = (next[lineKey] ?? 0) + req.quantity;
        addedUnits += req.quantity;
      }

      return next;
    });

    if (addedUnits === 0) {
      setToast({ type: "error", message: "No pude agregar esos platillos al carrito." });
      return;
    }

    const missingSuffix = missing.length > 0
      ? ` · No encontrados: ${missing.slice(0, 2).join(", ")}${missing.length > 2 ? "..." : ""}`
      : "";
    setToast({
      type: "success",
      message: `Listo: agregue ${addedUnits} platillo${addedUnits !== 1 ? "s" : ""} al carrito${missingSuffix}`,
    });
  }, [billRequested, initialItems, variantChoice]);

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

  // Derived props for the detail sheet — recomputed when detailItem, variantChoice or cart changes
  const detailSheetState = useMemo(() => {
    if (!detailItem) return null;
    const hasVariants = detailItem.variants && detailItem.variants.length > 0;
    const selectedVariantName = hasVariants
      ? (variantChoice[detailItem.id] ?? detailItem.variants[0]!.name)
      : null;
    const lineKey = encodeLineKey(detailItem.id, selectedVariantName);
    const qty = cart[lineKey] ?? 0;
    const unitPrice = hasVariants
      ? detailItem.variants.find((v) => v.name === selectedVariantName)?.price ?? detailItem.price
      : detailItem.price;
    const qtyLabel =
      hasVariants && selectedVariantName
        ? `${detailItem.name} (${selectedVariantName})`
        : detailItem.name;
    return { selectedVariantName, lineKey, qty, unitPrice, qtyLabel };
  }, [detailItem, variantChoice, cart]);

  const visibleItems = useMemo(
    () => (activeCategory === "todos" ? initialItems : initialItems.filter(i => i.categoryId === activeCategory)),
    [activeCategory, initialItems]
  );
  
  // Categorias que tienen al menos un item visible
  const visibleCats = useMemo(
    () => initialCategories.filter(cat => visibleItems.some(i => i.categoryId === cat.id)),
    [initialCategories, visibleItems]
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
    <div className="guest-menu-vt-root relative min-h-screen bg-[var(--guest-bg-page,#faf8f5)] text-[var(--guest-text,#0f172a)]"
    >

      {/* ── TOASTS (portal a body + z alto: visibles sobre modal QR z-[110] y otros overlays) ── */}
      {toastPortalReady &&
        createPortal(
          (
            <div>
              <AnimatePresence>
                {toast && (
                  <motion.div
                    key={`toast-${toast.type}-${toast.message}`}
                    initial={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: reducedMotion ? 1 : 0, y: reducedMotion ? 0 : -16 }}
                    transition={{ duration: reducedMotion ? 0 : 0.22 }}
                    onClick={() => {
                      if (toast.onClick) toast.onClick();
                    }}
                    className={cn(
                      "fixed inset-x-0 top-8 z-[260] flex justify-center px-4",
                      toast.onClick ? "cursor-pointer pointer-events-auto active:scale-95 transition-transform" : "pointer-events-none"
                    )}
                    role={toast.onClick ? "button" : toast.type === "error" ? "alert" : "status"}
                    aria-live={toast.type === "error" ? "assertive" : "polite"}
                  >
                    <GuestToast tone={toast.type === "error" ? "error" : "success"}>
                      {toast.message}
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



      {/* ── NETWORK BANNER ───────────────────────────────────────────── */}
      <NetworkBanner status={networkStatus} />

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-36 sm:px-8 lg:px-12 lg:pb-24">
        <div className="lg:grid lg:grid-cols-[minmax(0,7fr)_minmax(280px,3fr)] lg:gap-12 lg:items-start">
          <div>
            <GuestMasthead
              restaurantName={restaurantName}
              tableNumber={tableNumber}
              guestName={guestName}
              isHost={isHostLive}
              guests={guests}
              billRequested={billRequested}
              menuTheme={menuTheme}
              onThemeChange={changeGuestMenuTheme}
              displayTableCode={displayTableCode}
              joinCode={joinCode}
              onShareQr={() => setQrInviteFullscreenOpen(true)}
              qrOpen={qrInviteFullscreenOpen}
              onOpenCompanions={() => setTableCompanionsOpen(true)}
              orderStatusVisible={orders.length > 0}
              orderStatusLabel={orderTrackerSummary.active === 0 ? "Opciones de pago" : orderTrackerTone.label}
              orderStatusSummary={orderTrackerSummary.active === 0 ? "Ver tu cuenta y pagar" : orderTrackerSummaryText}
              orderStatusToneKey={(orderTrackerSummary.active === 0 ? "checkout" : orderTrackerTone.key) as any}
              hasOrderActivity={orderTrackerSummary.active > 0}
              onOpenOrderStatus={() => {
                if (orderTrackerSummary.active === 0) {
                  router.push(cuentaHref);
                } else {
                  setOrderTrackerModalOpen(true);
                }
              }}
            />

            <div className="sticky top-0 z-30 mt-4 border-b border-[var(--guest-divider)] bg-[color-mix(in_srgb,var(--guest-bg-page)_92%,transparent)] py-3 backdrop-blur-xl">
              <div className="min-w-0">
                <CategoryTabs
                  tabs={categoryTabItems}
                  activeId={activeCategory}
                  onChange={setCategory}
                  layoutId="guest-menu-cat"
                />
              </div>
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
                  <div key={cat.id} style={{ contentVisibility: "auto", containIntrinsicSize: "0 500px" }}>
                    <CategoryHeading title={cat.name} count={items.length} />
                    <div className="grid grid-cols-2 gap-4 pb-8 sm:grid-cols-3 lg:grid-cols-3">
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
                          onViewDetail={() => setDetailItem(item)}
                        />
                      );
                    })}
                    </div>
                  </div>
                );
              })}
            </div>

            {orders && orders.length > 0 && (
              <div className="hidden lg:block">
              <OrderTracker
                orders={orders}
                tableCode={tableCode}
                guestName={guestName}
                isHost={isHostLive}
                activeGuestCount={guests.length || 1}
                billRequested={billRequested}
                onRefreshOrders={refreshOrders}
                hasOrderPipeline
                menuTheme={menuTheme}
              />
              </div>
            )}

            {/* Legacy block removed */}
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
                showCelebration={orderSuccess}
              />
            </div>
          </aside>
        </div>
      </div>

      {toastPortalReady && orderTrackerModalOpen && orders.length > 0 && createPortal(
        <AnimatePresence>
          <motion.div
            className="fixed inset-0 z-[240] bg-[color-mix(in_srgb,var(--guest-text)_58%,transparent)] backdrop-blur-sm lg:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOrderTrackerModalOpen(false)}
          >
            <motion.div
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 250 }}
              className="absolute inset-x-0 bottom-0 max-h-[88dvh] overflow-hidden rounded-t-[2rem] border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] p-4 shadow-[0_-16px_42px_rgba(0,0,0,0.35)]"
              onClick={(e) => e.stopPropagation()}
              role="dialog"
              aria-modal="true"
              aria-label="Detalle de pedidos"
            >
              <div className="mx-auto mb-3 h-1.5 w-14 rounded-full bg-[var(--guest-divider)]" aria-hidden />
              <div className="mb-3 flex items-center justify-between gap-3 border-b border-[var(--guest-divider)] pb-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--guest-muted)]">Seguimiento en vivo</p>
                  <h2 className="mt-1 text-lg font-semibold text-[var(--guest-text)]">Detalle de pedidos</h2>
                </div>
                <button
                  type="button"
                  onClick={() => setOrderTrackerModalOpen(false)}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-[var(--guest-divider)] text-[var(--guest-muted)] transition hover:text-[var(--guest-text)]"
                  aria-label="Cerrar detalle de pedidos"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>

              <div className="overflow-y-auto pb-4">
                <OrderTracker
                  orders={orders}
                  tableCode={tableCode}
                  guestName={guestName}
                  isHost={isHostLive}
                  activeGuestCount={guests.length || 1}
                  billRequested={billRequested}
                  onRefreshOrders={refreshOrders}
                  hasOrderPipeline
                  menuTheme={menuTheme}
                  displayMode="content"
                />
              </div>
            </motion.div>
          </motion.div>
        </AnimatePresence>,
        document.body,
      )}

      {/* Legacy 'Ir a pagar' floating button removed in favor of Masthead integration */}

      <AnimatePresence initial={false}>
        {cartCount > 0 && !drawerOpen ? (
          <motion.div
            key="cart-summary-bar"
            initial={reducedMotion ? { opacity: 1 } : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: 24 }}
            transition={{ duration: reducedMotion ? 0.15 : 0.24, ease: [0.22, 1, 0.36, 1] }}
          >
            <CartSummaryBar cartCount={cartCount} cartTotal={cartTotal} onOpen={() => setDrawerOpen(true)} />
          </motion.div>
        ) : null}
      </AnimatePresence>

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
          showCelebration={orderSuccess}
        />
      </OrderSheet>

      {qrInviteFullscreenOpen &&
        typeof document !== "undefined" &&
        createPortal(
          (
            <div>
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
                {joinCode ? (
                  <span className="mt-2 block font-mono text-[0.78rem] font-bold tracking-[0.18em] text-white/85">
                    Acceso: {joinCode}
                  </span>
                ) : null}
              </h2>
              <div className="w-full max-w-[280px] rounded-3xl bg-white p-5 shadow-2xl shadow-black/40">
                {inviteFullUrl ? (
                  <LazyQRCodeCanvas
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
                    className="flex aspect-square w-full min-h-[200px] items-center justify-center rounded-2xl bg-[var(--guest-bg-surface-2)] text-sm font-medium text-[var(--guest-muted)]"
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

      {tableCompanionsOpen &&
        typeof document !== "undefined" &&
        createPortal(
          (
            <div>
            <div
              className="fixed inset-0 z-[115] flex items-end sm:items-center justify-center bg-black/65 p-0 sm:p-4 backdrop-blur-sm"
              role="presentation"
              onClick={() => setTableCompanionsOpen(false)}
            >
            <motion.div
              initial={{ y: "100%", opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="companions-title"
              className="relative max-h-[90dvh] w-full max-w-md overflow-hidden rounded-t-3xl sm:rounded-2xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] shadow-[inset_0_1px_0_var(--guest-panel-edge)] backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-[var(--guest-divider)] p-5">
                <div>
                  <h3 id="companions-title" className="text-base font-semibold leading-snug text-[var(--guest-text)]">
                    Tu mesa y compañeros
                  </h3>
                  <p className="mt-0.5 text-xs text-[var(--guest-muted)]">
                    {guests.length} participante{guests.length === 1 ? '' : 's'} activo{guests.length === 1 ? '' : 's'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setTableCompanionsOpen(false)}
                  className="rounded-full bg-[var(--guest-bg-surface-2)] p-2 text-[var(--guest-text)] hover:bg-[var(--guest-divider)] transition-colors"
                >
                  <X className="size-4" />
                </button>
              </div>

              <div className="overflow-y-auto p-2">
                <div className="space-y-1">
                  {guests.map((g) => (
                    <div key={g.name} className="flex items-center justify-between rounded-xl px-3 py-3 hover:bg-[var(--guest-bg-surface-2)] transition-colors">
                      <div className="flex items-center gap-3">
                        <GuestAvatar name={g.name} size="md" />
                        <div>
                          <p className="text-sm font-medium text-[var(--guest-text)] flex items-center gap-1.5">
                            {g.name} 
                            {g.name === guestName && <span className="text-[10px] text-[var(--guest-muted)] font-normal">(Tú)</span>}
                          </p>
                          {g.isHost && (
                            <p className="text-[10px] font-bold uppercase tracking-wider text-[var(--guest-gold)]">Anfitrión</p>
                          )}
                        </div>
                      </div>
                      
                      {isHostLive && g.name !== guestName && !billRequested && (
                        <button
                          type="button"
                          disabled={isTransferring}
                          onClick={() => {
                            startTransfer(async () => {
                              await transferHost(tableCode, guestName, g.name);
                              const state = await getGuestTableState(tableCode, guestName);
                              setGuests(state.guests);
                              setIsHostLive(state.isHost);
                            });
                          }}
                          className="rounded-lg border border-[var(--guest-divider)] bg-[var(--guest-bg-surface)] px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-[var(--guest-text)] transition-colors hover:border-[var(--guest-gold)] hover:text-[var(--guest-gold)] disabled:opacity-40"
                        >
                          Hacer Anfitrión
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
            </div>
          ),
          document.body,
        )}

      <LazyGuestMenuAIAssistant
        restaurantName={restaurantName}
        tableCode={tableCode}
        menuItems={initialItems.map((item) => ({
          name: item.name,
          description: item.description,
          categoryName: item.categoryName,
          price: item.price,
          isPopular: item.isPopular,
          isSoldOut: item.isSoldOut,
        }))}
        disabled={qrInviteFullscreenOpen || tableCompanionsOpen || drawerOpen}
        onAddToCart={handleAssistantAddToCart}
        liftFabForBottomBar={cartCount > 0 && !drawerOpen}
      />

      {/* ── Dish detail sheet ────────────────────────────────────── */}
      <DishDetailSheet
        open={detailItem !== null}
        item={detailItem}
        categoryInitial={
          detailItem
            ? (initialCategories.find((c) => c.id === detailItem.categoryId)?.name ?? detailItem.name)
            : ""
        }
        selectedVariantName={detailSheetState?.selectedVariantName ?? null}
        onVariantChange={(name) =>
          detailItem && setVariantChoice((prev) => ({ ...prev, [detailItem.id]: name }))
        }
        unitPrice={detailSheetState?.unitPrice ?? 0}
        qty={detailSheetState?.qty ?? 0}
        qtyLabel={detailSheetState?.qtyLabel ?? ""}
        onAdd={() => detailSheetState && setQty(detailSheetState.lineKey, 1)}
        onInc={() =>
          detailSheetState && setQty(detailSheetState.lineKey, detailSheetState.qty + 1)
        }
        onDec={() =>
          detailSheetState && setQty(detailSheetState.lineKey, detailSheetState.qty - 1)
        }
        onClose={() => setDetailItem(null)}
        disabledQty={billRequested}
      />
    </div>
  );
}
