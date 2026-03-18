"use client";

import { useState } from "react";
import { Clock, ChefHat, CheckCircle2 } from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
};

type OrderStatus = "pending" | "preparing" | "ready" | "delivered";

type Order = {
  id: string;
  tableCode: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
};

// Datos simulados para iniciar (luego vendrán de Supabase/Prisma)
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    tableCode: "Mesa 1",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 3), // Hace 3 min
    items: [
      { id: "item-1", name: "Hamburguesa Clásica", quantity: 2, notes: "Sin cebolla, carne bien cocida" },
      { id: "item-2", name: "Papas Fritas", quantity: 1 }
    ]
  },
  {
    id: "ORD-002",
    tableCode: "Mesa 4",
    status: "preparing",
    createdAt: new Date(Date.now() - 1000 * 60 * 12), // Hace 12 min
    items: [
      { id: "item-3", name: "Ensalada César", quantity: 1, notes: "Aderezo aparte" },
      { id: "item-4", name: "Limonada Menta", quantity: 2 }
    ]
  },
  {
    id: "ORD-003",
    tableCode: "Mesa 2",
    status: "ready",
    createdAt: new Date(Date.now() - 1000 * 60 * 25), // Hace 25 min
    items: [
      { id: "item-5", name: "Tacos de Ribeye", quantity: 3, notes: "Sin cilantro" },
    ]
  }
];

export default function KDSBoard() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);

  // Mover orden al siguiente estado
  const advanceOrderState = (orderId: string, currentStatus: OrderStatus) => {
    const nextStatusMap: Record<OrderStatus, OrderStatus> = {
      pending: "preparing",
      preparing: "ready",
      ready: "delivered",
      delivered: "delivered",
    };

    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: nextStatusMap[currentStatus] } : o
      ).filter(o => o.status !== "delivered") // Ocultar las entregadas
    );
  };

  const pendingOrders = orders.filter((o) => o.status === "pending");
  const preparingOrders = orders.filter((o) => o.status === "preparing");
  const readyOrders = orders.filter((o) => o.status === "ready");

  const formatTime = (date: Date) => {
    const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
    return `${minutes} min`;
  };

  const OrderCard = ({ order, accentColor }: { order: Order, accentColor: string }) => (
    <div className="bg-[#111] border border-white/5 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
      <div className="flex justify-between items-start border-b border-white/10 pb-3">
        <div>
          <h3 className={`text-lg font-bold ${accentColor}`}>{order.tableCode}</h3>
          <p className="text-sm text-gray-400">#{order.id}</p>
        </div>
        <div className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 rounded-md">
          <Clock className="w-4 h-4 text-gray-400" />
          <span className="text-sm font-medium text-gray-300">{formatTime(order.createdAt)}</span>
        </div>
      </div>

      <div className="flex flex-col gap-3 flex-grow">
        {order.items.map((item) => (
          <div key={item.id} className="flex flex-col gap-1">
            <div className="flex items-start gap-3 text-gray-200">
              <span className="font-bold border border-white/20 bg-white/5 px-2 py-0.5 rounded text-sm min-w-8 text-center bg-gray-600/20">
                {item.quantity}x
              </span>
              <span className="font-medium text-[15px] mt-0.5">{item.name}</span>
            </div>
            {item.notes && (
              <div className="ml-11 text-sm text-amber-500/90 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 inline-block font-medium">
                {/* Visualizador de la nota que generó el cliente */}
                ⚠️ Nota: {item.notes}
              </div>
            )}
          </div>
        ))}
      </div>

      <button
        onClick={() => advanceOrderState(order.id, order.status)}
        className="mt-2 w-full bg-white/5 hover:bg-white/10 border border-white/10 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95 duration-150"
      >
        {order.status === "pending" && <><ChefHat className="w-4 h-4" /> Preparar</>}
        {order.status === "preparing" && <><CheckCircle2 className="w-4 h-4" /> Marcar Listo</>}
        {order.status === "ready" && "Entregado"}
      </button>
    </div>
  );

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)]">
        
        {/* Header KDS */}
        <div className="flex justify-between items-center bg-[#111] border border-white/10 p-5 rounded-2xl">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1">Kitchen Display System</h1>
            <p className="text-gray-400 text-sm">Monitor de Comandas en Tiempo Real</p>
          </div>
          <div className="flex gap-4">
            <div className="text-center bg-white/5 px-4 py-2 rounded-xl">
              <div className="text-2xl font-bold text-white">{orders.length}</div>
              <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total</div>
            </div>
          </div>
        </div>

        {/* Tableros de Kanban / KDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow overflow-hidden">
          
          {/* Columna: Pendientes */}
          <div className="flex flex-col gap-4 bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span>
                Nuevas
              </h2>
              <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded-full">{pendingOrders.length}</span>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pb-4 pr-1 scrollbar-hide flex-grow">
              {pendingOrders.map((order) => (
                <OrderCard key={order.id} order={order} accentColor="text-red-500" />
              ))}
              {pendingOrders.length === 0 && <p className="text-gray-500 text-sm text-center italic mt-10">No hay órdenes pendientes.</p>}
            </div>
          </div>

          {/* Columna: En Preparación */}
          <div className="flex flex-col gap-4 bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
                En Preparación
              </h2>
              <span className="bg-amber-500/20 text-amber-500 text-xs font-bold px-2 py-1 rounded-full">{preparingOrders.length}</span>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pb-4 pr-1 scrollbar-hide flex-grow">
              {preparingOrders.map((order) => (
                <OrderCard key={order.id} order={order} accentColor="text-amber-500" />
              ))}
              {preparingOrders.length === 0 && <p className="text-gray-500 text-sm text-center italic mt-10">La cocina está libre.</p>}
            </div>
          </div>

          {/* Columna: Listos para Entrega */}
          <div className="flex flex-col gap-4 bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
                Listos
              </h2>
              <span className="bg-emerald-500/20 text-emerald-500 text-xs font-bold px-2 py-1 rounded-full">{readyOrders.length}</span>
            </div>
            <div className="flex flex-col gap-4 overflow-y-auto pb-4 pr-1 scrollbar-hide flex-grow">
              {readyOrders.map((order) => (
                <OrderCard key={order.id} order={order} accentColor="text-emerald-500" />
              ))}
              {readyOrders.length === 0 && <p className="text-gray-500 text-sm text-center italic mt-10">No hay platillos esperando salir.</p>}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
