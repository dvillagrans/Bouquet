"use client";

import { useState, useEffect } from "react";
import { Clock, ChefHat, CheckCircle2, RotateCcw, AlertTriangle, Utensils, Coffee, History } from "lucide-react";

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  station: "cocina" | "barra";
};

type OrderStatus = "pending" | "preparing" | "ready" | "delivered";

type Order = {
  id: string;
  tableCode: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
  deliveredAt?: Date;
};

// Datos simulados para iniciar con alertas de tiempo y estaciones
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001", tableCode: "Mesa 1", status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 3), // 3 min
    items: [
      { id: "item-1", name: "Hamburguesa Clásica", quantity: 2, notes: "Sin cebolla, carne bien cocida", station: "cocina" },
      { id: "item-2", name: "Limonada de Menta", quantity: 1, station: "barra" }
    ]
  },
  {
    id: "ORD-002", tableCode: "Mesa 4", status: "preparing",
    createdAt: new Date(Date.now() - 1000 * 60 * 18), // 18 min -> Alerta Ámbar
    items: [
      { id: "item-3", name: "Ensalada César", quantity: 1, station: "cocina" },
      { id: "item-4", name: "Cerveza Artesanal", quantity: 2, station: "barra" }
    ]
  },
  {
    id: "ORD-004", tableCode: "Mesa 7", status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 35), // 35 min -> Alerta Roja Crítica
    items: [
      { id: "item-6", name: "Tacos de Ribeye", quantity: 3, notes: "Urgente, cliente esperando", station: "cocina" }
    ]
  },
  {
    id: "ORD-003", tableCode: "Mesa 2", status: "ready",
    createdAt: new Date(Date.now() - 1000 * 60 * 25), 
    items: [
      { id: "item-5", name: "Mojito Tradicional", quantity: 1, station: "barra" },
    ]
  },
  {
    id: "ORD-005", tableCode: "Mesa 9", status: "delivered",
    createdAt: new Date(Date.now() - 1000 * 60 * 50),
    deliveredAt: new Date(Date.now() - 1000 * 60 * 10),
    items: [
      { id: "item-7", name: "Agua Mineral", quantity: 1, station: "barra" }
    ]
  }
];

export default function KDSBoard() {
  const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView] = useState<"activas" | "historial">("activas");
  const [stationFilter, setStationFilter] = useState<"todas" | "cocina" | "barra">("todas");

  // Actualizar el reloj cada 30 segundos para las alertas
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(interval);
  }, []);

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
        o.id === orderId ? { 
            ...o, 
            status: nextStatusMap[currentStatus],
            deliveredAt: nextStatusMap[currentStatus] === "delivered" ? new Date() : o.deliveredAt
        } : o
      )
    );
  };

  // Botón "Deshacer"
  const undoOrderState = (orderId: string, currentStatus: OrderStatus) => {
    const prevStatusMap: Record<OrderStatus, OrderStatus> = {
      pending: "pending", 
      preparing: "pending",
      ready: "preparing",
      delivered: "ready",
    };
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: prevStatusMap[currentStatus] } : o
      )
    );
  };

  // Lógica de filtrado por estación
  const getFilteredOrders = (ordersToFilter: Order[]) => {
    return ordersToFilter.map(order => {
      if (stationFilter === "todas") return order;
      // Solo dejamos los items que coinciden con la estación
      return { ...order, items: order.items.filter(i => i.station === stationFilter) };
    }).filter(order => order.items.length > 0); // Ocultar orden si no tiene items para esa estación
  };

  const activeOrders = getFilteredOrders(orders.filter((o) => o.status !== "delivered"));
  // Historial ordenado por más reciente primero
  const historyOrders = getFilteredOrders(orders.filter((o) => o.status === "delivered"))
                        .sort((a,b) => (b.deliveredAt?.getTime() || 0) - (a.deliveredAt?.getTime() || 0));

  const pendingOrders = activeOrders.filter((o) => o.status === "pending");
  const preparingOrders = activeOrders.filter((o) => o.status === "preparing");
  const readyOrders = activeOrders.filter((o) => o.status === "ready");

  const OrderCard = ({ order, accentColor }: { order: Order, accentColor: string }) => {
    const mins = Math.floor((currentTime.getTime() - order.createdAt.getTime()) / 60000);
    
    // Lógica de criticidad de tiempos
    let isCritical = false;
    let isWarning = false;
    let cardBg = "bg-[#111] border-white/5";
    
    if (order.status !== "delivered") {
        if (mins >= 30) {
            isCritical = true;
            cardBg = "bg-red-950/20 border-red-500/50 shadow-[0_0_15px_rgba(239,68,68,0.15)]";
        } else if (mins >= 15) {
            isWarning = true;
            cardBg = "bg-amber-950/20 border-amber-500/40";
        }
    }

    return (
      <div className={`${cardBg} border rounded-xl p-4 flex flex-col gap-4 transition-all duration-300 relative group`}>
        {order.status !== "pending" && (
            <button 
              onClick={() => undoOrderState(order.id, order.status)}
              className="absolute top-2 right-2 p-1.5 bg-black/50 hover:bg-white/10 rounded-md text-gray-400 hover:text-white opacity-0 group-hover:opacity-100 transition-opacity"
              title="Deshacer estado (Errores)"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
        )}

        <div className="flex justify-between items-start border-b border-white/10 pb-3 pr-8">
          <div>
            <h3 className={`text-lg font-bold flex items-center gap-2 ${accentColor}`}>
                {order.tableCode}
                {isCritical && <AlertTriangle className="w-4 h-4 text-red-500 animate-pulse" />}
                {!isCritical && isWarning && <AlertTriangle className="w-4 h-4 text-amber-500" />}
            </h3>
            <p className="text-sm text-gray-400">#{order.id}</p>
          </div>
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md ${isCritical ? 'bg-red-500/20 text-red-400' : isWarning ? 'bg-amber-500/20 text-amber-400' : 'bg-white/5 text-gray-300'}`}>
            <Clock className="w-4 h-4" />
            <span className="text-sm font-medium">{mins} min</span>
          </div>
        </div>

        <div className="flex flex-col gap-3 flex-grow">
          {order.items.map((item) => (
            <div key={item.id} className="flex flex-col gap-1">
              <div className="flex items-start gap-3 text-gray-200">
                <span className="font-bold border border-white/20 px-2 py-0.5 rounded text-sm min-w-8 text-center bg-gray-600/20">
                  {item.quantity}x
                </span>
                <div className="flex-1 flex justify-between items-start">
                    <span className="font-medium text-[15px] mt-0.5">{item.name}</span>
                    <span title={`Estación: ${item.station}`}>
                      {item.station === 'cocina' ? <Utensils className="w-3.5 h-3.5 text-gray-500 mt-1" /> : <Coffee className="w-3.5 h-3.5 text-gray-500 mt-1" />}
                    </span>
                </div>
              </div>
              {item.notes && (
                <div className="ml-11 text-sm text-amber-500/90 bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20 inline-block font-medium">
                  ⚠️ Nota: {item.notes}
                </div>
              )}
            </div>
          ))}
        </div>

        {order.status !== "delivered" ? (
          <button
            onClick={() => advanceOrderState(order.id, order.status)}
            className={`mt-2 w-full font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2 active:scale-95 duration-150 ${isCritical ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30' : 'bg-white/5 hover:bg-white/10 text-white border border-white/10'}`}
          >
            {order.status === "pending" && <><ChefHat className="w-4 h-4" /> Empezar a Preparar</>}
            {order.status === "preparing" && <><CheckCircle2 className="w-4 h-4" /> Marcar como Listo</>}
            {order.status === "ready" && "Entregar a Mesa"}
          </button>
        ) : (
            <div className="mt-2 w-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-medium py-2.5 rounded-lg flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> 
                Entregada ({Math.floor((currentTime.getTime() - (order.deliveredAt?.getTime() || 0))/60000)} min atrás)
            </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white p-4 sm:p-6 lg:p-8 font-sans">
      <div className="max-w-7xl mx-auto flex flex-col gap-8 h-[calc(100vh-4rem)]">
        
        {/* Header KDS y Controles */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-[#111] border border-white/10 p-5 rounded-2xl gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white mb-1 flex items-center gap-3">
                Kitchen Display System
                {stationFilter !== 'todas' && (
                    <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2.5 py-1 rounded-full uppercase tracking-wider font-semibold">
                        Estación: {stationFilter}
                    </span>
                )}
            </h1>
            <p className="text-gray-400 text-sm">Monitor de comandos y tiempos en línea</p>
          </div>
          
          <div className="flex flex-wrap items-center gap-3">
            {/* Filtros de Estación */}
            <div className="flex bg-[#0a0a0a] p-1 rounded-lg border border-white/10">
                <button onClick={() => setStationFilter('todas')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all ${stationFilter === 'todas' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                    Todas
                </button>
                <button onClick={() => setStationFilter('cocina')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${stationFilter === 'cocina' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                    <Utensils className="w-4 h-4"/> Cocina
                </button>
                <button onClick={() => setStationFilter('barra')} className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all ${stationFilter === 'barra' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-400 hover:text-gray-200'}`}>
                    <Coffee className="w-4 h-4"/> Barra
                </button>
            </div>

            <div className="w-px h-8 bg-white/10 hidden md:block mx-1"></div>

            {/* Cambiador de Vistas: Activas / Historial */}
            <div className="flex bg-[#0a0a0a] p-1 rounded-lg border border-white/10">
                <button onClick={() => setView('activas')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === 'activas' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-gray-200'}`}>
                    Activas
                    <span className="bg-black/50 text-white px-2 py-0.5 rounded-full text-xs font-bold border border-white/10">{activeOrders.length}</span>
                </button>
                <button onClick={() => setView('historial')} className={`px-4 py-2 text-sm font-medium rounded-md transition-all flex items-center gap-2 ${view === 'historial' ? 'bg-indigo-500/20 text-indigo-300' : 'text-gray-400 hover:text-gray-200'}`}>
                    <History className="w-4 h-4"/> Historial
                </button>
            </div>
          </div>
        </div>

        {view === 'activas' ? (
          /* Tableros de Kanban / KDS Activo */
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 flex-grow overflow-hidden">
            {/* Columna: Pendientes */}
            <div className="flex flex-col gap-4 bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse"></span> Nuevas
                </h2>
                <span className="bg-red-500/20 text-red-500 text-xs font-bold px-2 py-1 rounded-full">{pendingOrders.length}</span>
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto pb-4 pr-1 scrollbar-hide flex-grow">
                {pendingOrders.map((order) => <OrderCard key={order.id} order={order} accentColor="text-red-500" />)}
                {pendingOrders.length === 0 && <p className="text-gray-500 text-sm text-center italic mt-10">No hay órdenes pendientes.</p>}
              </div>
            </div>

            {/* Columna: En Preparación */}
            <div className="flex flex-col gap-4 bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> En Preparación
                </h2>
                <span className="bg-amber-500/20 text-amber-500 text-xs font-bold px-2 py-1 rounded-full">{preparingOrders.length}</span>
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto pb-4 pr-1 scrollbar-hide flex-grow">
                {preparingOrders.map((order) => <OrderCard key={order.id} order={order} accentColor="text-amber-500" />)}
                {preparingOrders.length === 0 && <p className="text-gray-500 text-sm text-center italic mt-10">La estación está libre.</p>}
              </div>
            </div>

            {/* Columna: Listos para Entrega */}
            <div className="flex flex-col gap-4 bg-[#0a0a0a] border border-white/5 rounded-2xl p-4 overflow-hidden">
              <div className="flex justify-between items-center mb-2">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Listos
                </h2>
                <span className="bg-emerald-500/20 text-emerald-500 text-xs font-bold px-2 py-1 rounded-full">{readyOrders.length}</span>
              </div>
              <div className="flex flex-col gap-4 overflow-y-auto pb-4 pr-1 scrollbar-hide flex-grow">
                {readyOrders.map((order) => <OrderCard key={order.id} order={order} accentColor="text-emerald-500" />)}
                {readyOrders.length === 0 && <p className="text-gray-500 text-sm text-center italic mt-10">No hay platillos esperando salir.</p>}
              </div>
            </div>
          </div>
        ) : (
          /* Vista: Historial (Órdenes Entregadas) */
          <div className="bg-[#0a0a0a] border border-white/5 rounded-2xl p-6 flex-grow overflow-y-auto">
             <h2 className="text-xl font-semibold mb-6 flex items-center gap-2 border-b border-white/10 pb-4">
               <History className="w-5 h-5 text-indigo-400" />
               Órdenes Entregadas Recientemente
             </h2>
             {historyOrders.length === 0 ? (
                 <p className="text-gray-500 text-center py-10 italic">No hay historial de órdenes entregadas con los filtros actuales.</p>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {historyOrders.map(order => <OrderCard key={`hist-${order.id}`} order={order} accentColor="text-gray-400" />)}
                 </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
}
