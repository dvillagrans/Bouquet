"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Variants } from "framer-motion";
import { Plus, Lock, Copy, ExternalLink, CheckCheck, Loader2, Share2, X, CreditCard } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { advanceOrderStatus } from "@/actions/orders";
import { getTableDetail, closeTable } from "@/actions/waiter";
import { createClient } from "@/lib/supabase/client";
import WaiterTakeOrder from "./WaiterTakeOrder";
import WaiterPayment from "./WaiterPayment";
import { SegmentedControl, type SegmentedItem } from "./ui/segmented-control";
import { cn } from "@/lib/utils";

type TabType = "orders" | "add-items" | "payment";

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  price: number;
  totalPrice: number;
}

interface Order {
  id: string;
  status: "PENDING" | "PREPARING" | "READY" | "DELIVERED";
  createdAt: Date;
  items: OrderItem[];
}

interface TableDetailData {
  guestEntryRelativePath?: string;
  table: { id: string; number: number; capacity: number; status: string; qrCode: string };
  session: { id: string; guestName: string; pax: number; createdAt: Date } | null;
  orders: Order[];
  billTotal: number;
}

export default function WaiterTableDetail({
  tableId,
  restaurantId,
  presentation = "modal",
  onClose,
  onRefresh,
}: {
  tableId: string;
  restaurantId?: string;
  presentation?: "modal" | "sheetMd";
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [tableData, setTableData] = useState<TableDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
  const [copyToast, setCopyToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

  const loadTableDetail = useCallback(async (opts?: { silent?: boolean }) => {
    try {
      if (!opts?.silent) setLoading(true);
      const data = await getTableDetail(tableId);
      setTableData(data as TableDetailData);
    } catch (error) {
      console.error("Error loading table detail:", error);
    } finally {
      if (!opts?.silent) setLoading(false);
    }
  }, [tableId]);

  useEffect(() => {
    void loadTableDetail();
  }, [loadTableDetail]);

  useEffect(() => {
    if (!restaurantId) return;
    const supabase = createClient();
    const channelName = `kds-orders:${encodeURIComponent(restaurantId)}`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "refresh" }, () => {
        void loadTableDetail({ silent: true });
      })
      .subscribe();
    return () => {
      void supabase.removeChannel(channel);
    };
  }, [restaurantId, loadTableDetail]);

  useEffect(() => {
    setOrigin(typeof window !== "undefined" ? window.location.origin : "");
  }, []);

  useEffect(() => {
    if (!tableData?.session && (activeTab === "add-items" || activeTab === "payment")) {
      setActiveTab("orders");
    }
  }, [tableData?.session, activeTab]);

  useEffect(() => {
    if (!copyToast) return;
    const timeout = window.setTimeout(() => setCopyToast(null), 2000);
    return () => window.clearTimeout(timeout);
  }, [copyToast]);

  const handleAddItems = async () => {
    setActiveTab("add-items");
  };

  const handleOrderAdded = async () => {
    await loadTableDetail();
    onRefresh();
    setActiveTab("orders");
  };

  const handlePaymentComplete = async () => {
    onRefresh();
    onClose();
  };

  const handleCloseTable = async () => {
    if (confirm("¿Cerrar esta mesa? Se marcará como SUCIA.")) {
      try {
        await closeTable(tableId);
        onRefresh();
        onClose();
      } catch (error) {
        alert("Error al cerrar la mesa: " + (error as Error).message);
      }
    }
  };

  const handleMarkDelivered = async (orderId: string) => {
    setDeliveringOrderId(orderId);
    try {
      await advanceOrderStatus(orderId, "ready");
      await loadTableDetail({ silent: true });
      onRefresh();
    } catch (error) {
      alert("No se pudo marcar como entregado: " + (error as Error).message);
    } finally {
      setDeliveringOrderId(null);
    }
  };

  const orders = tableData?.orders ?? [];

  const activeOrders = useMemo(() => orders.filter((o) => o.status !== "DELIVERED"), [orders]);
  const deliveredOrders = useMemo(() => orders.filter((o) => o.status === "DELIVERED"), [orders]);

  const coalescedDeliveredItems = useMemo(() => {
    const map = new Map<string, { name: string; quantity: number; totalPrice: number }>();
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const key = item.name;
        if (map.has(key)) {
          const existing = map.get(key)!;
          existing.quantity += item.quantity;
          existing.totalPrice += item.totalPrice;
        } else {
          map.set(key, { name: item.name, quantity: item.quantity, totalPrice: item.totalPrice });
        }
      }
    }
    return Array.from(map.values());
  }, [deliveredOrders]);

  const deliveredTotal = coalescedDeliveredItems.reduce((acc, i) => acc + i.totalPrice, 0);

  if (loading || !tableData) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-bg-solid/90 backdrop-blur-sm">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-[1.75rem] border border-border-main bg-bg-card p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]"
        >
          <div className="rounded-[calc(1.75rem-0.375rem)] border border-border-main/50 bg-bg-solid px-8 py-10 font-mono text-xs uppercase tracking-[0.18em] text-text-muted shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
            <Loader2 className="mx-auto mb-3 h-5 w-5 animate-spin text-gold" />
            Cargando detalles…
          </div>
        </motion.div>
      </div>
    );
  }

  const { table, session, billTotal } = tableData;

  const guestMenuUrl =
    origin && tableData.guestEntryRelativePath ? `${origin}${tableData.guestEntryRelativePath}` : "";

  const seatedMinutes =
    session && new Date(session.createdAt)
      ? Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 60000)
      : 0;

  const tabItems: SegmentedItem<TabType>[] = [
    { id: "orders", label: `Órdenes${activeOrders.length > 0 ? ` (${activeOrders.length})` : ""}`, dotClass: "bg-text-muted" },
  ];
  if (session) {
    tabItems.push(
      { id: "add-items", label: "Agregar", dotClass: "bg-gold/70" },
      { id: "payment", label: "Pagar", dotClass: "bg-dash-green/80" },
    );
  }

  const handleShareGuestQr = async () => {
    const url = guestMenuUrl;
    if (!url) return;
    const title = `Mesa ${table.number} · Bouquet`;
    const text = `Entra al menú de esta mesa en Bouquet.\n${url}`;
    try {
      const canvas = qrCanvasRef.current;
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
                new File([blob], `mesa-${table.number}-bouquet-qr.png`, {
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
      alert("Enlace copiado (este navegador no abre el menú de compartir).");
    } catch (err) {
      const e = err as { name?: string };
      if (e?.name === "AbortError") return;
      try {
        await navigator.clipboard.writeText(url);
        alert("Enlace copiado al portapapeles.");
      } catch {
        alert("No se pudo compartir. Copia el enlace manualmente desde abajo.");
      }
    }
  };

  const sheet = presentation === "sheetMd";

  const panelVariants: Variants = {
    initial: sheet ? { y: "100%" } : { opacity: 0, scale: 0.96, y: 20 },
    animate: sheet 
      ? { y: 0, transition: { type: "spring", damping: 28, stiffness: 220 } }
      : { opacity: 1, scale: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 260 } },
    exit: sheet 
      ? { y: "100%", transition: { type: "spring", damping: 30, stiffness: 300 } }
      : { opacity: 0, scale: 0.96, y: 15, transition: { duration: 0.22, ease: "easeOut" } }
  };

  return (
    <div
      className={cn(
        "fixed inset-0 z-50 flex",
        sheet ? "items-end justify-center md:items-stretch md:justify-end md:bg-transparent" : "items-end justify-center md:items-center",
      )}
    >
      <AnimatePresence>
        {copyToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="pointer-events-none absolute inset-x-0 top-4 z-[80] flex justify-center px-4"
            role={copyToast.type === "error" ? "alert" : "status"}
            aria-live={copyToast.type === "error" ? "assertive" : "polite"}
          >
            <div
              className={cn(
                "rounded-full border px-4 py-2 font-mono text-[11px] font-bold uppercase tracking-[0.14em] shadow-[0_14px_36px_rgba(9,9,7,0.55)] backdrop-blur-md",
                copyToast.type === "error"
                  ? "border-dash-red/50 bg-dash-red/15 text-dash-red"
                  : "border-dash-green/50 bg-dash-green/15 text-dash-green",
              )}
            >
              {copyToast.message}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className={cn(
          "absolute inset-0 bg-bg-solid/95 backdrop-blur-md",
          sheet && "md:bg-black/40 md:backdrop-blur-none",
        )}
        aria-label="Cerrar panel"
        onClick={onClose}
      />

      <motion.div
        variants={panelVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className={cn(
          "relative z-10 flex w-full flex-col overflow-hidden border-border-main bg-bg-card shadow-[0_32px_80px_-16px_rgba(0,0,0,0.7)]",
          sheet
            ? "h-[100dvh] rounded-none md:my-4 md:mr-4 md:h-auto md:max-h-[calc(100vh-2rem)] md:w-full md:max-w-md md:rounded-[2.25rem] md:border"
            : "h-[100dvh] rounded-none md:h-auto md:max-h-[90vh] md:max-w-2xl md:rounded-[2.25rem] md:border",
        )}
      >
        <div className="flex h-full flex-col rounded-none border-0 bg-bg-card md:rounded-[calc(1.75rem-0.125rem)] md:border md:border-border-main/35 md:shadow-[inset_0_1px_1px_rgba(255,255,255,0.06)]">
          <div className="sticky top-0 z-10 flex items-center justify-between gap-3 border-b border-border-main/70 bg-bg-solid/95 px-4 py-3 backdrop-blur-md">
            <div className="min-w-0">
              <h2 className="flex items-center gap-3 truncate text-xl font-semibold tracking-tight text-light">
                Mesa {table.number}
              </h2>
              {session ? (
                <p className="mt-1 truncate font-mono text-[11px] uppercase tracking-[0.14em] text-text-muted">
                  {session.guestName} · {session.pax} pax · {seatedMinutes} min
                </p>
              ) : null}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-full border border-border-main text-text-muted transition hover:border-border-bright hover:text-light active:scale-[0.98]"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" strokeWidth={1.8} />
            </button>
          </div>

          {table.status === "DISPONIBLE" && !session && guestMenuUrl ? (
            <div className="border-b border-border-main/70 bg-gradient-to-b from-gold/10 to-transparent px-4 py-6">
              <p className="text-center font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                Escanear para entrar a la mesa y ver el menú
              </p>
              <div className="mx-auto mt-5 flex max-w-sm flex-col items-center gap-4">
                <div className="rounded-[1.25rem] border border-border-main bg-bg-solid p-1.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)]">
                  <div className="rounded-[calc(1.25rem-0.375rem)] border border-border-main/40 bg-white p-4 shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]">
                    <QRCodeCanvas
                      ref={qrCanvasRef}
                      value={guestMenuUrl}
                      size={224}
                      level="M"
                      marginSize={2}
                      bgColor="#FFFFFF"
                      fgColor="#000000"
                      title={`Código QR de acceso — Mesa ${table.number}`}
                    />
                  </div>
                </div>
                <p className="break-all text-center font-mono text-[10px] leading-relaxed text-text-muted">
                  {guestMenuUrl}
                </p>
                <div className="flex w-full flex-wrap justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => void handleShareGuestQr()}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-gold/45 bg-gold/12 px-4 text-[11px] font-bold uppercase tracking-wider text-gold transition hover:bg-gold/20"
                    aria-label="Compartir código QR o enlace"
                  >
                    <Share2 className="h-4 w-4" strokeWidth={1.8} />
                    Compartir
                  </button>
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await navigator.clipboard.writeText(guestMenuUrl);
                        setCopyToast({ type: "success", message: "Link copiado" });
                      } catch {
                        setCopyToast({ type: "error", message: "No se pudo copiar" });
                      }
                    }}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-main px-4 text-[11px] font-bold uppercase tracking-wider text-light transition hover:border-border-bright"
                  >
                    <Copy className="h-4 w-4" strokeWidth={1.8} />
                    Copiar
                  </button>
                  <button
                    type="button"
                    onClick={() => window.open(guestMenuUrl, "_blank", "noopener,noreferrer")}
                    className="inline-flex min-h-11 items-center gap-2 rounded-full border border-border-main px-4 text-[11px] font-bold uppercase tracking-wider text-text-muted transition hover:border-border-bright hover:text-light"
                  >
                    <ExternalLink className="h-4 w-4" strokeWidth={1.8} />
                    Probar
                  </button>
                </div>
              </div>
            </div>
          ) : null}

          <div className="overflow-x-auto border-b border-border-main/70 px-3 pb-3 pt-3 scrollbar-hide">
            <SegmentedControl
              pillLayoutId="waiter-detail-tab-pill"
              items={tabItems}
              value={activeTab}
              onChange={(id) => {
                if (!session && (id === "add-items" || id === "payment")) return;
                setActiveTab(id);
              }}
              scrollClassName="min-w-max"
            />
          </div>

          <div className="flex-1 overflow-y-auto overflow-x-hidden p-4 scrollbar-hide md:max-h-[min(54vh,540px)]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.18, ease: "easeInOut" }}
              >
                {activeTab === "orders" && (
                  <div className="flex flex-col gap-4">
                    <div className="divide-y divide-border-main/60 rounded-xl border border-border-main/50 bg-bg-solid/40">
                      {activeOrders.length === 0 ? (
                        <div className="px-4 py-8 text-center text-sm text-text-muted">
                          No hay órdenes pendientes
                        </div>
                      ) : (
                        activeOrders.map((order) => (
                          <div key={order.id} className="px-4 py-4">
                            <div className="mb-3 flex flex-wrap items-center gap-2">
                              <span
                                className={cn(
                                  "rounded-full px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-[0.14em]",
                                  order.status === "PENDING" && "bg-gold/15 text-gold",
                                  order.status === "PREPARING" && "bg-gold/10 text-gold",
                                  order.status === "READY" && "bg-dash-green/15 text-dash-green",
                                )}
                              >
                                {order.status === "PENDING"
                                  ? "Pendiente"
                                  : order.status === "PREPARING"
                                    ? "Preparando"
                                    : "Listo"}
                              </span>
                              <span className="font-mono text-[11px] text-text-muted">
                                {new Date(order.createdAt).toLocaleTimeString("es-MX", {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>

                            <div className="space-y-2">
                              {order.items.map((item) => (
                                <div key={item.id} className="flex justify-between gap-3 text-sm">
                                  <div className="min-w-0">
                                    <p className="text-light">
                                      {item.quantity}x {item.name}
                                    </p>
                                    {item.notes ? (
                                      <p className="text-xs italic text-text-muted">{item.notes}</p>
                                    ) : null}
                                  </div>
                                  <p className="shrink-0 font-mono text-light">${item.totalPrice.toFixed(2)}</p>
                                </div>
                              ))}
                            </div>

                            {order.status === "READY" ? (
                              <button
                                type="button"
                                onClick={() => void handleMarkDelivered(order.id)}
                                disabled={deliveringOrderId === order.id}
                                className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-dash-green px-4 text-sm font-bold uppercase tracking-wide text-bg-solid transition hover:opacity-95 disabled:opacity-60 active:scale-[0.98]"
                              >
                                {deliveringOrderId === order.id ? (
                                  <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                                ) : (
                                  <CheckCheck className="h-4 w-4" aria-hidden />
                                )}
                                Marcar entregado
                              </button>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>

                    {coalescedDeliveredItems.length > 0 && (
                      <div className="rounded-xl border border-border-main/50 bg-bg-solid/40">
                        <div className="flex items-center justify-between border-b border-border-main/60 bg-bg-hover/30 px-4 py-3">
                          <h3 className="font-mono text-[11px] font-bold uppercase tracking-wider text-text-muted">
                            Historial Entregado
                          </h3>
                          <span className="font-mono text-[11px] text-text-muted">
                            Subtotal:{" "}
                            <span className="text-light">${deliveredTotal.toFixed(2)}</span>
                          </span>
                        </div>
                        <div className="space-y-2 px-4 py-3">
                          {coalescedDeliveredItems.map((item, idx) => (
                            <div key={idx} className="flex justify-between gap-3 text-sm">
                              <div className="min-w-0">
                                <p className="text-text-muted">
                                  <span className="font-medium text-light">{item.quantity}x</span>{" "}
                                  {item.name}
                                </p>
                              </div>
                              <p className="shrink-0 font-mono text-text-muted">
                                ${item.totalPrice.toFixed(2)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === "add-items" && session ? (
                  <WaiterTakeOrder tableId={tableId} onOrderAdded={handleOrderAdded} />
                ) : null}

                {activeTab === "payment" && session ? (
                  <WaiterPayment tableCode={table.qrCode} onPaymentComplete={handlePaymentComplete} />
                ) : null}
              </motion.div>
            </AnimatePresence>
          </div>

          {session && activeTab === "orders" ? (
            <div className="mt-auto border-t border-border-main/70 bg-bg-solid px-4 py-4 md:mt-0">
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleAddItems}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-border-main px-4 text-sm font-bold uppercase tracking-wide text-light transition hover:border-gold hover:text-gold active:scale-[0.98]"
                >
                  <Plus className="h-4 w-4" strokeWidth={2} /> Agregar
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("payment")}
                  className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-glow px-4 text-sm font-bold uppercase tracking-wide text-canvas transition hover:opacity-90 active:scale-[0.98]"
                >
                  <CreditCard className="h-4 w-4" strokeWidth={2} /> Cobrar
                </button>
                <button
                  type="button"
                  onClick={handleCloseTable}
                  title="Liberar mesa (Sin cobrar)"
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-border-main text-text-muted transition hover:border-dash-red hover:bg-dash-red/10 hover:text-dash-red active:scale-[0.98]"
                >
                  <Lock className="h-4 w-4" strokeWidth={2} />
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </motion.div>
    </div>
  );
}
