"use client";

import { useState } from "react";
import { ChevronDown, Plus, Receipt, Lock, Clock } from "lucide-react";
import { getTableDetail, closeTable } from "@/actions/waiter";
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
  table: { id: string; number: number; capacity: number; status: string; qrCode: string };
  session: { id: string; guestName: string; pax: number; createdAt: Date } | null;
  orders: Order[];
  billTotal: number;
}

export default function WaiterTableDetail({
  tableId,
  onClose,
  onRefresh,
}: {
  tableId: string;
  onClose: () => void;
  onRefresh: () => void;
}) {
  const [activeTab, setActiveTab] = useState<TabType>("orders");
  const [tableData, setTableData] = useState<TableDetailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedOrder, setExpandedOrder] = useState<string | null>(null);

  // Load table details on mount
  const loadTableDetail = async () => {
    try {
      setLoading(true);
      const data = await getTableDetail(tableId);
      setTableData(data as TableDetailData);
    } catch (error) {
      console.error("Error loading table detail:", error);
    } finally {
      setLoading(false);
    }
  };

  // Initial load
  if (!tableData && loading) {
    loadTableDetail();
  }

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

  if (loading || !tableData) {
    return (
      <div className="fixed inset-0 bg-canvas/90 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-panel border border-wire p-6 rounded text-light">
          Cargando detalles de mesa...
        </div>
      </div>
    );
  }

  const { table, session, orders, billTotal } = tableData;
  const seatedMinutes =
    session && new Date(session.createdAt)
      ? Math.floor((Date.now() - new Date(session.createdAt).getTime()) / 60000)
      : 0;

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
            className="text-dim hover:text-light transition-colors p-2"
            aria-label="Cerrar"
          >
            ✕
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-wire px-4 pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
              activeTab === "orders" ? "text-glow border-b-2 border-glow" : "text-dim hover:text-light"
            }`}
          >
            Órdenes ({orders.length})
          </button>
          {session && (
            <>
              <button
                onClick={() => setActiveTab("add-items")}
                className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  activeTab === "add-items" ? "text-glow border-b-2 border-glow" : "text-dim hover:text-light"
                }`}
              >
                <Plus className="inline h-3 w-3 mr-1" /> Agregar
              </button>
              <button
                onClick={() => setActiveTab("payment")}
                className={`pb-3 px-2 text-sm font-bold uppercase tracking-wider whitespace-nowrap transition-colors ${
                  activeTab === "payment" ? "text-glow border-b-2 border-glow" : "text-dim hover:text-light"
                }`}
              >
                <Receipt className="inline h-3 w-3 mr-1" /> Pagar
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
                    className={`border rounded p-4 cursor-pointer transition-all ${
                      order.status === "PENDING"
                        ? "border-glow/40 bg-glow/5"
                        : order.status === "PREPARING"
                        ? "border-glow/20 bg-glow/3"
                        : order.status === "READY"
                        ? "border-sage-deep/40 bg-sage-deep/5"
                        : "border-wire/40 bg-wire/5"
                    }`}
                    onClick={() =>
                      setExpandedOrder(expandedOrder === order.id ? null : order.id)
                    }
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
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
                        <p className="text-sm text-light mt-2">
                          {order.items.length} item{order.items.length !== 1 ? "s" : ""}
                        </p>
                      </div>
                      <ChevronDown
                        className={`h-4 w-4 text-dim transition-transform ${
                          expandedOrder === order.id ? "rotate-180" : ""
                        }`}
                      />
                    </div>

                    {/* Expanded Item List */}
                    {expandedOrder === order.id && (
                      <div className="mt-3 pt-3 border-t border-wire/30 space-y-2">
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
