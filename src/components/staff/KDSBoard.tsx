/** @jsxImportSource react */
"use client";

import { useState, useEffect, useTransition } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Utensils, Coffee, History, GripVertical, Clock, CheckCircle2, ChevronRight, Flame } from "lucide-react";
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { motion, AnimatePresence } from "framer-motion";
import { advanceOrderStatus, undoOrderStatus, moveOrderToStatus } from "@/actions/orders";
import { createClient } from "@/lib/supabase/client";

// ─── Constants ────────────────────────────────────────────────────────────────

const NOISE_SVG = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MDAiIGhlaWdodD0iNDAwIj4KICA8ZmlsdGVyIGlkPSJub2lzZSI+CiAgICA8ZmVUdXJidWxlbmNlIHR5cGU9ImZyYWN0YWxOb2lzZSIgYmFzZUZyZXF1ZW5jeT0iMC44NSIgbnVtT2N0YXZlcz0iMyIgc3RpdGNoVGlsZXM9InN0aXRjaCIvPgogIDwvZmlsdGVyPgogIDxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMDgiIG1peC1ibGVuZC1tb2RlPSJvdmVybGF5IiAvPgo8L3N2Zz4=";

// ─── Types ────────────────────────────────────────────────────────────────────

type OrderItem = {
  id: string;
  name: string;
  quantity: number;
  notes?: string;
  variantName?: string | null;
  station: "cocina" | "barra";
};

type OrderStatus = "pending" | "preparing" | "ready" | "delivered";
type ColumnId    = "pending" | "preparing" | "ready";

/** Estado normalizado para filtros (DB/caché pueden variar mayúsculas). */
function normalizeBoardStatus(status: string): OrderStatus {
  const s = status.toLowerCase();
  if (s === "pending" || s === "preparing" || s === "ready" || s === "delivered") return s;
  return "pending";
}

type Order = {
  id: string;
  tableCode: string;
  status: OrderStatus;
  items: OrderItem[];
  createdAt: Date;
  deliveredAt?: Date;
  guestName?: string | null;
};

// ─── Urgency helpers ──────────────────────────────────────────────────────────

type Urgency = "normal" | "warning" | "critical";

function getUrgency(mins: number, status: OrderStatus): Urgency {
  if (status === "delivered") return "normal";
  if (mins >= 30) return "critical";
  if (mins >= 15) return "warning";
  return "normal";
}

const URGENGY_STYLES = {
  normal:   "border-border-main bg-bg-card/45 hover:border-border-bright hover:bg-bg-card/60",
  warning:  "border-gold/40 bg-gold/5 hover:border-gold/60",
  critical: "border-dash-red/50 bg-dash-red/10 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:border-dash-red/70",
};

const STATUS_ICONS = {
  pending: Clock,
  preparing: Flame,
  ready: CheckCircle2,
};

// ─── Item Badge ───────────────────────────────────────────────────────────────

function KDSItemRow({ it, mode = "normal" }: { it: OrderItem; mode?: "normal" | "compact" }) {
  const isCocina = it.station === "cocina";
  const Icon = isCocina ? Utensils : Coffee;
  const icColor = isCocina ? "text-gold" : "text-dash-blue";
  
  return (
    <div className="flex flex-col gap-1 py-3 border-b border-border-main/20 last:border-0">
      <div className="flex items-start gap-3 justify-between">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 bg-bg-card p-1.5 rounded-md border border-border-main shadow-sm">
            <span className="text-text-primary text-[11px] font-mono tracking-wider font-bold leading-none">{it.quantity}x</span>
          </div>
          <div className="flex flex-col">
            <span className={`text-[13px] text-text-primary font-medium leading-relaxed ${mode === "compact" && "truncate w-32"}`}>{it.name}</span>
            {it.variantName && (
              <span className="text-[11px] text-gold/80 italic mt-1 flex items-center before:content-[''] before:w-1 before:h-[1px] before:bg-gold/40 before:mr-1.5">
                {it.variantName}
              </span>
            )}
            {it.notes && (
              <span className="text-[10px] text-dash-red/90 bg-dash-red/10 px-1.5 py-[2px] rounded uppercase tracking-wider font-bold mt-1.5 w-fit leading-tight break-words border border-dash-red/20 shadow-sm">
                ⚠ {it.notes}
              </span>
            )}
          </div>
        </div>
        <Icon className={`w-4 h-4 shrink-0 ${icColor} opacity-50`} />
      </div>
    </div>
  );
}

// ─── Draggable Ticket ────────────────────────────────────────────────────────

function SortableTicket({
  order,
  now,
  isOverlay = false,
}: {
  order: Order;
  now: Date;
  isOverlay?: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { status: order.status },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const mins = Math.floor((now.getTime() - new Date(order.createdAt).getTime()) / 60000);
  const urgency = getUrgency(mins, order.status);

  // Group items by station for better scannability
  const kitchenItems = order.items.filter(i => i.station === "cocina");
  const barItems = order.items.filter(i => i.station === "barra");

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group rounded-xl overflow-hidden backdrop-blur-sm border outline-none select-none
        transition-colors duration-300
        ${URGENGY_STYLES[urgency]}
        ${isOverlay ? "scale-[1.02] shadow-[0_0_30px_rgba(0,0,0,0.4)] opacity-95 z-50 cursor-grabbing bg-bg-card border-gold" : "shadow-md hover:shadow-lg"}
        ${isDragging ? "opacity-30" : "opacity-100"}
        ${isPending ? "opacity-50 grayscale" : ""}
      `}
    >
      {/* Top Header / Drag Handle */}
      <div 
        {...attributes}
        {...listeners}
        className={`
          flex items-center justify-between p-4 border-b border-border-main cursor-grab active:cursor-grabbing
          ${urgency === "critical" ? "bg-dash-red/10" : urgency === "warning" ? "bg-gold/5" : "bg-bg-card/40"}
        `}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-text-primary/20" />
          <span className="font-serif font-medium text-2xl text-text-primary bg-bg-solid/60 px-3 py-0.5 rounded-lg shadow-sm border border-border-bright">
            {order.tableCode}
          </span>
          {order.guestName && (
             <span className="text-[9px] text-gold uppercase tracking-[0.2em] font-bold border border-gold/20 bg-gold/5 px-2 py-1 rounded shadow-sm">
                {order.guestName}
             </span>
          )}
        </div>
        
        <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-[11px] font-mono font-bold tracking-widest tabular-nums
          ${urgency === "critical" ? "bg-dash-red text-text-primary border-dash-red-bg animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.2)]" :
            urgency === "warning" ? "bg-gold text-bg-solid border-gold-light shadow-sm" :
            "bg-bg-solid/80 text-text-muted border-border-bright shadow-sm"}
        `}>
          <Clock className="w-3.5 h-3.5" />
          {mins}M
        </div>
      </div>

      {/* Items List */}
      <div className="p-4 bg-transparent flex flex-col max-h-[350px] overflow-y-auto custom-scrollbar">
        {kitchenItems.length > 0 && (
          <div className="mb-4">
            <div className="text-[10px] uppercase font-bold text-gold tracking-[0.2em] mb-2 border-b border-gold/10 pb-1.5 flex items-center justify-between">
              <span>Cocina</span>
            </div>
            {kitchenItems.map(it => <KDSItemRow key={it.id} it={it} />)}
          </div>
        )}
        
        {barItems.length > 0 && (
          <div className={`${kitchenItems.length > 0 ? "mt-2 pt-2 border-t border-dashed border-border-main/50" : ""}`}>
            <div className="text-[10px] uppercase font-bold text-dash-blue tracking-[0.2em] mb-2 border-b border-dash-blue/10 pb-1.5 flex items-center justify-between">
              <span>Barra</span>
            </div>
            {barItems.map(it => <KDSItemRow key={it.id} it={it} />)}
          </div>
        )}
      </div>

      {/* Footer Actions (Optional on Tap/Hold) */}
      <div className="h-1.5 w-full bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
    </div>
  );
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

function KDSColumn({
  id,
  title,
  orders,
  now,
}: {
  id: ColumnId;
  title: string;
  orders: Order[];
  now: Date;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const Icon = STATUS_ICONS[id];

  return (
    <div className="flex flex-col h-full bg-bg-card/30 backdrop-blur-md rounded-2xl border border-border-main overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
      {/* Heavy shadow for drop affordance */}
      {isOver && <div className="absolute inset-0 ring-1 ring-gold/40 border border-gold/40 bg-gold/5 z-0 pointer-events-none transition-all duration-300"></div>}

      <div className={`
        relative px-6 py-4 flex items-center justify-between border-b z-10 backdrop-blur-sm
        ${id === "pending" ? "border-border-bright bg-bg-card/80" : 
          id === "preparing" ? "border-gold/20 bg-gold/[0.08]" : 
          "border-dash-green/20 bg-dash-green/[0.05]"}
      `}>
            <div className="flex items-center gap-3">
              <Icon className={`w-5 h-5 ${
                id === "pending" ? "text-text-muted" :
                id === "preparing" ? "text-gold" :
                "text-dash-green"
              }`} />
              <h2 className="text-[11px] font-bold tracking-[0.2em] font-mono uppercase text-text-primary drop-shadow-md">
                {title}
              </h2>
            </div>
            <span className="flex items-center justify-center bg-bg-solid/90 border border-border-main shadow-inner text-gold font-mono text-[11px] font-bold px-3 py-1 rounded-sm min-w-[32px] tabular-nums">
              {orders.length}
            </span>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto p-4 md:p-6 space-y-5 relative z-10 custom-scrollbar"
      >
        <AnimatePresence>
          {orders.length === 0 ? (
             <motion.div 
               initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
               className="h-full flex flex-col items-center justify-center text-center text-text-primary/20 italic space-y-3"
             >
                <div className="p-6 rounded-full border border-dashed border-border-main/50 mb-2">
                  <Icon className="w-8 h-8 opacity-20" />
                </div>
                <span className="text-[10px] tracking-[0.2em] font-bold uppercase">Sin comandas</span>
             </motion.div>
          ) : (
            orders.map(o => (
              <motion.div
                key={o.id}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.15 } }}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
              >
                <SortableTicket order={o} now={now} />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────

export default function KDSBoard({ initialOrders, defaultStation }: { initialOrders: Order[], defaultStation?: string }) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [now, setNow] = useState(new Date());
  const [showHistory, setShowHistory] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Time refresher
  useEffect(() => {
    const int = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(int);
  }, []);

  // Supabase RT
  useEffect(() => {
    const supabase = createClient();
    const ch = supabase
      .channel("live_orders_kds")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "orders" },
        () => router.refresh() 
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, [router]);

  useEffect(() => setOrders(initialOrders), [initialOrders]);

  const activeOrder = activeId ? orders.find(o => o.id === activeId) : null;

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  async function handleDragEnd(e: any) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const orderId = active.id as string;
    const newStatus = over.id as OrderStatus;
    const order = orders.find((o) => o.id === orderId);
    if (
      !order ||
      normalizeBoardStatus(order.status) === "delivered" ||
      normalizeBoardStatus(order.status) === newStatus ||
      newStatus === "delivered"
    )
      return;

    const snapshot = [...orders];
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));

    try {
      await moveOrderToStatus(orderId, newStatus);
    } catch (err) {
      setOrders(snapshot);
      alert("Error moviendo el ticket");
    }
  }

  // Solo tablero activo: nunca mostrar entregadas en columnas (p. ej. tras marcar desde mesero).
  const boardOrders = orders.filter((o) => normalizeBoardStatus(o.status) !== "delivered");

  const pending = boardOrders
    .filter((o) => normalizeBoardStatus(o.status) === "pending")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const prep = boardOrders
    .filter((o) => normalizeBoardStatus(o.status) === "preparing")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const ready = boardOrders
    .filter((o) => normalizeBoardStatus(o.status) === "ready")
    .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

  const recentHist = orders
    .filter((o) => normalizeBoardStatus(o.status) === "delivered")
    .sort((a, b) => new Date(b.deliveredAt || b.createdAt).getTime() - new Date(a.deliveredAt || a.createdAt).getTime())
    .slice(0, 15);

  return (
    <div className="relative min-h-screen bg-bg-solid text-text-primary flex flex-col font-sans overflow-hidden">
      {/* Background Noise & Lighting */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute inset-0 z-0 opacity-30 mix-blend-overlay"
          style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundRepeat: "repeat" }}
        />
        <div className="absolute -left-[20%] -top-[20%] h-[min(80vh,600px)] w-[min(100vw,800px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.08),transparent_60%)] blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(77,132,96,0.05),transparent_60%)] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-8 py-5 flex items-center justify-between border-b border-border-main bg-bg-card/40 backdrop-blur-md sticky top-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
             <Flame className="w-6 h-6 text-gold" strokeWidth={1.5} />
             <h1 className="font-serif text-3xl font-medium tracking-tight text-text-primary">
               Kitchen UI Station
             </h1>
          </div>
          <span className="font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted mt-0.5" style={{ marginLeft: "36px" }}>
             Bouquet OS &copy; Live Sync
          </span>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setShowHistory(true)}
            className="group flex items-center gap-2.5 px-5 py-2.5 bg-bg-solid/60 hover:bg-gold/10 rounded-lg transition-all border border-border-main hover:border-gold/30 shadow-sm"
          >
            <History className="w-4 h-4 text-gold" strokeWidth={2} /> 
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-primary group-hover:text-gold transition-colors">Historial</span>
          </button>
        </div>
      </header>

      {/* Main Board */}
      <main className="relative z-10 flex-1 p-8 overflow-hidden flex gap-8 h-[calc(100vh-94px)]">
        <DndContext
          sensors={sensors}
          onDragStart={(e) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
        >
          {/* Columns */}
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-6 h-full min-h-0">
            <KDSColumn id="pending" title="Entrantes" orders={pending} now={now} />
            <KDSColumn id="preparing" title="En Preparación" orders={prep} now={now} />
            <KDSColumn id="ready" title="Listos para salir" orders={ready} now={now} />
          </div>

          <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeOrder ? <SortableTicket order={activeOrder} now={now} isOverlay /> : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* History Sidemenu */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-card backdrop-blur-sm z-50 flex justify-end"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="w-full max-w-md h-full bg-bg-card/95 backdrop-blur-2xl border-l border-border-main shadow-[-10px_0_40px_rgba(0,0,0,0.3)] flex flex-col"
              onClick={e => e.stopPropagation()} // prevent dismiss
            >
              <div className="px-8 py-6 border-b border-border-main bg-bg-card/40 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <History className="w-5 h-5 text-gold" strokeWidth={1.5} />
                  <h2 className="font-serif text-2xl tracking-tight text-text-primary">Recientes</h2>
                </div>
                <button onClick={() => setShowHistory(false)} className="p-2.5 rounded-full border border-border-main hover:bg-bg-hover hover:border-border-bright transition-all group">
                  <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                {recentHist.length === 0 ? (
                  <p className="text-center font-mono font-bold text-[10px] uppercase tracking-[0.2em] text-text-muted mt-12">No hay tickets entregados recientemente.</p>
                ) : (
                  recentHist.map(o => (
                    <div key={o.id} className="bg-bg-solid/40 rounded-xl border border-border-main p-6 opacity-70 hover:opacity-100 hover:border-gold/30 hover:bg-gold/[0.02] transition-colors duration-300">
                      <div className="flex justify-between items-start mb-4 pb-3 border-b border-border-main/50">
                        <div className="flex items-center gap-3">
                          <span className="font-serif font-medium text-xl text-text-primary bg-bg-card/80 px-2.5 py-[1px] rounded shadow-sm border border-border-main">
                            {o.tableCode}
                          </span>
                          {o.guestName && <span className="text-[9px] text-gold uppercase tracking-[0.2em] font-bold border border-gold/20 bg-gold/5 px-2 py-1 rounded">{o.guestName}</span>}
                        </div>
                        <span className="text-[10px] font-bold text-dash-green bg-dash-green/10 border border-dash-green/20 px-2 py-1 uppercase tracking-[0.1em] rounded shadow-sm">Entregado</span>
                      </div>
                      
                      <div className="space-y-2 opacity-60">
                         {o.items.map(it => (
                           <div key={it.id} className="flex justify-between text-[13px] font-medium text-text-muted">
                             <span><span className="font-bold text-text-primary mr-1">{it.quantity}x</span> {it.name}</span>
                           </div>
                         ))}
                      </div>

                      <div className="mt-5 pt-4 border-t border-border-main/50 flex gap-3">
                        <button
                          onClick={async () => {
                            await undoOrderStatus(o.id, "delivered");
                            setShowHistory(false);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-bg-card border border-dash-red/20 text-dash-red text-[11px] font-bold rounded-lg hover:bg-dash-red/[0.05] hover:border-dash-red/40 transition-all uppercase tracking-[0.1em]"
                        >
                          <RotateCcw className="w-3.5 h-3.5" /> Revertir Salida
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0,0,0,0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.1);
          border-radius: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255,255,255,0.3);
        }
      `}} />
    </div>
  );
}
