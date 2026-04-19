"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Receipt, Lock, Copy, ExternalLink, CheckCheck, Loader2, Share2 } from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { advanceOrderStatus } from "@/actions/orders";
import { getTableDetail, closeTable } from "@/actions/waiter";
import { createClient } from "@/lib/supabase/client";
import WaiterTakeOrder from "./WaiterTakeOrder";
import WaiterPayment from "./WaiterPayment";

type TabType = "orders" | "add-items" | "payment" | "close";

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
  onClose,
  onRefresh,
}: {
  tableId: string;
  /** Mismo canal Realtime que cocina/listado mesero (`kds-orders:*`). */
  restaurantId?: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [tableData, setTableData] = useState<TableDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [origin, setOrigin] = useState("");
  const [deliveringOrderId, setDeliveringOrderId] = useState<string | null>(null);
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
    loadTableDetail();
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

  if (loading || !tableData) {
    return (
      <div className="fixed inset-0 bg-canvas/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-panel border border-wire p-6 rounded text-light">
          Cargando detalles de mesa...
        </div>
      </div>
    );
  }

  const { table, session, orders } = tableData;

  /** Enlace de invitados (incluye `?k=`); el QR impreso debe coincidir con lo que espera la app. */
  const guestMenuUrl =
    origin && tableData.guestEntryRelativePath ? `${origin}${tableData.guestEntryRelativePath}` : "";

  const seatedMinutes =
    session && new Date(session.createdAt)
      ? Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 60000)
      : 0;

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

  return (
    <div className="fixed inset-0 bg-canvas/90 backdrop-blur-sm z-50 flex items-end md:items-center md:justify-center">
      <div className="w-full md:max-w-2xl bg-panel border border-wire rounded-t-2xl md:rounded-2xl max-h-[90vh] overflow-hidden flex flex-col animation:fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-wire p-4 sticky top-0 bg-canvas">
          <div>
            <h2 className="text-xl font-bold text-light">Mesa {table.number}</h2>
            {session && (
              <p className="text-sm text-dim mt-1">
                {session.guestName} • {session.pax} personas • {seatedMinutes} min
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-dim hover:text-light transition-colors min-w-[44px] min-h-[44px] flex items-center justify-center rounded active:bg-wire/20"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* QR menú — mesa libre */}
        {table.status === "DISPONIBLE" && !session && guestMenuUrl && (
          <div className="border-b border-wire bg-gradient-to-b from-glow/10 to-transparent px-4 py-6">
            <p className="text-center text-[10px] font-bold uppercase tracking-[0.2em] text-glow">
              Escanear para entrar a la mesa y ver el menú
            </p>
            <div className="mx-auto mt-4 flex max-w-sm flex-col items-center gap-4">
              <div className="rounded-2xl bg-white p-4 shadow-[inset_0_0_0_1px_rgba(255,255,255,0.15)]">
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
              <p className="break-all text-center font-mono text-[10px] leading-relaxed text-dim">
                {guestMenuUrl}
              </p>
              <div className="flex w-full flex-wrap justify-center gap-2">
                <button
                  type="button"
                  onClick={() => void handleShareGuestQr()}
                  className="inline-flex items-center gap-2 rounded-lg border border-glow bg-glow/15 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-glow transition-colors hover:bg-glow/25"
                  aria-label="Compartir código QR o enlace"
                >
                  <Share2 className="h-3.5 w-3.5" />
                  Compartir
                </button>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await navigator.clipboard.writeText(guestMenuUrl);
                    } catch {
                      alert("No se pudo copiar el enlace");
                    }
                  }}
                  className="inline-flex items-center gap-2 rounded-lg border border-glow/40 bg-glow/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-glow transition-colors hover:bg-glow/20"
                >
                  <Copy className="h-3.5 w-3.5" />
                  Copiar enlace
                </button>
                <button
                  type="button"
                  onClick={() => window.open(guestMenuUrl, "_blank", "noopener,noreferrer")}
                  className="inline-flex items-center gap-2 rounded-lg border border-wire bg-wire/10 px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-light transition-colors hover:bg-wire/20"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Probar acceso
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 border-b border-wire px-4 pt-3 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors min-h-[44px] flex items-end ${
              activeTab === "orders" ? "text-glow border-b-2 border-glow" : "text-dim hover:text-light"
            }`}
          >
            Órdenes ({orders.length})
          </button>
          {session && (
            <>
              <button
                onClick={() => setActiveTab("add-items")}
                className={`pb-3 px-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors min-h-[44px] flex items-end gap-1 ${
                  activeTab === "add-items" ? "text-glow border-b-2 border-glow" : "text-dim hover:text-light"
                }`}
              >
                <Plus className="h-3 w-3 mb-0.5" /> Agregar
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`pb-3 px-3 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors min-h-[44px] flex items-end gap-1 ${
                  activeTab === "payment" ? "text-glow border-b-2 border-glow" : "text-dim hover:text-light"
                }`}
              >
                <Receipt className="h-3 w-3 mb-0.5" /> Pagar
              </button>
            </>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Orders Tab */}
          {activeTab === "orders" && (
            <div className="space-y-3">
              {orders.length === 0 ? (
                <div className="text-center py-8 text-dim">
                  <p className="text-sm">No hay órdenes en esta mesa</p>
                </div>
              ) : (
                orders.map((order) => (
                  <div
                    key={order.id}
                    className={`border rounded p-4 ${
                      order.status === "PENDING"
                        ? "border-glow/40 bg-glow/5"
                        : order.status === "PREPARING"
                        ? "border-glow/20 bg-glow/3"
                        : order.status === "READY"
                        ? "border-sage-deep/40 bg-sage-deep/5"
                        : "border-wire/40 bg-wire/5"
                    }`}
                  >
                    {/* Order header */}
                    <div className="flex items-center gap-2 mb-3">
                      <span
                        className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded ${
                          order.status === "PENDING"
                            ? "bg-glow/20 text-glow"
                            : order.status === "PREPARING"
                            ? "bg-glow/10 text-glow"
                            : order.status === "READY"
                            ? "bg-sage-deep/20 text-sage-deep"
                            : "bg-wire/20 text-dim"
                        }`}
                      >
                        {order.status === "PENDING"
                          ? "Pendiente"
                          : order.status === "PREPARING"
                          ? "Preparando"
                          : order.status === "READY"
                          ? "Listo"
                          : "Entregado"}
                      </span>
                      <span className="text-xs text-dim">
                        {new Date(order.createdAt).toLocaleTimeString("es-MX", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>

                    {/* Items always visible */}
                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <p className="text-light">
                              {item.quantity}x {item.name}
                            </p>
                            {item.notes && <p className="text-xs text-dim italic">{item.notes}</p>}
                          </div>
                          <p className="text-light font-mono">${item.totalPrice.toFixed(2)}</p>
                        </div>
                      ))}
                    </div>

                    {order.status === "READY" && (
                      <button
                        type="button"
                        onClick={() => void handleMarkDelivered(order.id)}
                        disabled={deliveringOrderId === order.id}
                        className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg bg-sage-deep px-4 py-2.5 text-sm font-bold uppercase tracking-wide text-canvas transition-colors hover:bg-sage-deep/90 disabled:opacity-60 active:scale-[0.98]"
                      >
                        {deliveringOrderId === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                        ) : (
                          <CheckCheck className="h-4 w-4" aria-hidden />
                        )}
                        Marcar entregado
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          )}

          {/* Add Items Tab */}
          {activeTab === "add-items" && session && (
            <WaiterTakeOrder tableId={tableId} onOrderAdded={handleOrderAdded} />
          )}

          {/* Payment Tab */}
          {activeTab === "payment" && session && (
            <WaiterPayment tableCode={table.qrCode} onPaymentComplete={handlePaymentComplete} />
          )}
        </div>

        {/* Footer Actions */}
        {session && (
          <div className="border-t border-wire p-4 bg-canvas flex gap-3 flex-wrap">
            <button
              onClick={handleAddItems}
              className="flex-1 min-w-32 flex items-center justify-center gap-2 bg-glow hover:bg-glow/90 text-canvas px-4 py-2 rounded text-sm font-bold uppercase transition-colors"
            >
              <Plus className="h-4 w-4" /> Agregar Items
            </button>
            <button
              onClick={handleCloseTable}
              className="flex-1 min-w-32 border border-wire hover:bg-wire/20 text-light px-4 py-2 rounded text-sm font-bold uppercase transition-colors"
            >
              <Lock className="inline h-4 w-4 mr-2" /> Cerrar Mesa
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
