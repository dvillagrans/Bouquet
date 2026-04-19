/** @jsxImportSource react */
"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import { RotateCcw, Utensils, Coffee, History, GripVertical, Clock, CheckCircle2, ChevronRight, Flame, ArrowRight, PackageCheck, ChefHat, X, Loader2 } from "lucide-react";
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

type OrderStatus = "pending" | "preparing" | "ready" | "delivered" | "cancelled";
type ColumnId    = "pending" | "preparing" | "ready";

function normalizeBoardStatus(status: string): OrderStatus {
  const s = status.toLowerCase();
  if (s === "pending" || s === "preparing" || s === "ready" || s === "delivered" || s === "cancelled") return s;
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
  if (status === "delivered" || status === "cancelled") return "normal";
  if (mins >= 30) return "critical";
  if (mins >= 15) return "warning";
  return "normal";
}

const URGENCY_STYLES = {
  normal:   "border-border-main bg-bg-card/45 hover:border-border-bright hover:bg-bg-card/60",
  warning:  "border-gold/40 bg-gold/5 hover:border-gold/60",
  critical: "border-dash-red/50 bg-dash-red/10 shadow-[0_0_15px_rgba(239,68,68,0.15)] hover:border-dash-red/70",
};

const STATUS_ICONS = {
  pending: Clock,
  preparing: Flame,
  ready: CheckCircle2,
};

const ADVANCE_LABEL: Record<ColumnId, { label: string; icon: typeof ArrowRight; color: string }> = {
  pending:   { label: "Comenzar",      icon: ArrowRight,    color: "text-gold border-gold/30 hover:bg-gold/10 hover:border-gold/60" },
  preparing: { label: "Marcar listo",  icon: CheckCircle2,  color: "text-dash-green border-dash-green/30 hover:bg-dash-green/10 hover:border-dash-green/60" },
  ready:     { label: "Entregar",      icon: PackageCheck,  color: "text-dash-blue border-dash-blue/30 hover:bg-dash-blue/10 hover:border-dash-blue/60" },
};

// ─── Toast ────────────────────────────────────────────────────────────────────

function Toast({ msg, onClose }: { msg: string; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-5 py-3 bg-dash-red/90 backdrop-blur-md border border-dash-red/50 rounded-xl shadow-xl text-white text-sm font-bold"
    >
      <span>{msg}</span>
      <button onClick={onClose} className="opacity-70 hover:opacity-100 transition-opacity">
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
}

// ─── Item Row ─────────────────────────────────────────────────────────────────

function KDSItemRow({ it, dimmed = false }: { it: OrderItem; dimmed?: boolean }) {
  const isCocina = it.station === "cocina";
  const Icon = isCocina ? Utensils : Coffee;
  const icColor = isCocina ? "text-gold" : "text-dash-blue";

  return (
    <div className={`flex flex-col gap-1 py-3 border-b border-border-main/20 last:border-0 transition-opacity ${dimmed ? "opacity-40" : ""}`}>
      <div className="flex items-start gap-3 justify-between">
        <div className="flex flex-col">
          <span className="text-base text-text-primary font-bold leading-tight flex items-baseline">
            <span className="font-mono text-xl text-gold mr-2 font-black">{it.quantity}x</span>
            {it.name}
          </span>
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
        <Icon className={`w-4 h-4 shrink-0 ${icColor} opacity-50 mt-0.5`} />
      </div>
    </div>
  );
}

// ─── Draggable Ticket ────────────────────────────────────────────────────────

function SortableTicket({
  order,
  now,
  isOverlay = false,
  stationScope,
  isNew = false,
  onAdvance,
}: {
  order: Order;
  now: Date;
  isOverlay?: boolean;
  stationScope?: "cocina" | "barra";
  isNew?: boolean;
  onAdvance: (orderId: string, currentStatus: OrderStatus) => void;
}) {
  const [isPending, setIsPending] = useState(false);
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: order.id,
    data: { status: order.status },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  const mins = Math.floor((now.getTime() - new Date(order.createdAt).getTime()) / 60000);
  const urgency = getUrgency(mins, order.status);
  const normalStatus = normalizeBoardStatus(order.status);

  const kitchenItems = order.items.filter((i) => i.station === "cocina");
  const barItems     = order.items.filter((i) => i.station === "barra");
  const otherItems   = order.items.filter((i) => i.station !== "cocina" && i.station !== "barra");

  /** Cocina solo hasta "listo"; entregado lo marca el mesero en sala. */
  const advance =
    stationScope === "cocina" && normalStatus === "ready"
      ? undefined
      : ADVANCE_LABEL[normalStatus as ColumnId];
  const AdvIcon = advance?.icon;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`
        relative group outline-none select-none
        border-b border-border-main/40 pb-3
        transition-colors duration-200
        ${urgency === "critical" ? "border-l-4 border-l-dash-red pl-3 bg-dash-red/5" : urgency === "warning" ? "border-l-4 border-l-gold pl-3 bg-gold/[0.04]" : "pl-3"}
        ${isNew ? "ring-1 ring-gold/40 animate-[newOrderPulse_1s_ease-out_2]" : ""}
        ${isOverlay ? "scale-[1.01] opacity-95 z-50 cursor-grabbing" : ""}
        ${isDragging ? "opacity-30" : "opacity-100"}
        ${isPending ? "opacity-50 grayscale" : ""}
      `}
    >
      {/* Drag Handle / Header */}
      <div
        {...attributes}
        {...listeners}
        className={`
          flex items-center justify-between py-2 cursor-grab active:cursor-grabbing
        `}
      >
        <div className="flex items-center gap-3">
          <GripVertical className="w-4 h-4 text-text-primary/30" />
          <span className="font-serif font-medium text-2xl text-text-primary">
            {order.tableCode}
          </span>
          {order.guestName && (
            <span className="text-[10px] text-gold uppercase tracking-[0.18em] font-bold">
              {order.guestName}
            </span>
          )}
          {isNew && (
            <span className="text-[9px] text-gold uppercase tracking-[0.15em] font-bold animate-pulse">
              Nueva
            </span>
          )}
        </div>

        <div className={`flex items-center gap-1.5 text-[12px] font-mono font-bold tracking-wider tabular-nums
          ${urgency === "critical" ? "text-dash-red animate-pulse" :
            urgency === "warning" ? "text-gold" :
            "text-text-muted"}
        `}>
          <Clock className="w-3.5 h-3.5" />
          {mins}m
        </div>
      </div>

      {/* Items */}
      <div className="pt-2 flex flex-col max-h-[320px] overflow-y-auto custom-scrollbar">
        {kitchenItems.length > 0 && (
          <div className="mb-2">
            <div className="text-[10px] uppercase font-bold text-gold tracking-[0.2em] mb-2 border-b border-gold/10 pb-1.5">
              Cocina
            </div>
            {kitchenItems.map(it => <KDSItemRow key={it.id} it={it} />)}
          </div>
        )}

        {barItems.length > 0 && (
          <div className={`${kitchenItems.length > 0 ? "mt-2 pt-2 border-t border-dashed border-border-main/30" : ""}`}>
            <div className="text-[10px] uppercase font-bold tracking-[0.2em] mb-2 border-b pb-1.5 flex items-center justify-between
              ${stationScope === 'cocina' ? 'text-text-muted/50 border-border-main/20' : 'text-dash-blue border-dash-blue/10'}">
              <span className={stationScope === "cocina" ? "text-text-muted/50" : "text-dash-blue"}>Barra</span>
              {stationScope === "cocina" && (
                <span className="text-[9px] text-text-muted/40 font-normal normal-case tracking-normal">no aplica aquí</span>
              )}
            </div>
            {barItems.map(it => <KDSItemRow key={it.id} it={it} dimmed={stationScope === "cocina"} />)}
          </div>
        )}

        {otherItems.length > 0 && (
          <div className={`${kitchenItems.length + barItems.length > 0 ? "mt-2 pt-2 border-t border-dashed border-border-main/50" : ""}`}>
            <div className="text-[10px] uppercase font-bold text-text-muted tracking-[0.2em] mb-2 border-b border-border-main/30 pb-1.5">General</div>
            {otherItems.map(it => <KDSItemRow key={it.id} it={{ ...it, station: "cocina" }} />)}
          </div>
        )}
      </div>

      {/* Quick Action Footer */}
      {!isOverlay && advance && AdvIcon && (
        <div className="pt-2">
          <button
            disabled={isPending}
            onClick={async () => { setIsPending(true); await onAdvance(order.id, normalStatus); setIsPending(false); }}
            className={`w-full flex items-center justify-center gap-2 py-2 border text-[11px] font-bold uppercase tracking-[0.15em] transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${advance.color}`}
          >
            {isPending ? (
              <span className="opacity-60">Actualizando...</span>
            ) : (
              <>
                <AdvIcon className="w-3.5 h-3.5" />
                {advance.label}
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Droppable Column ─────────────────────────────────────────────────────────

function KDSColumn({
  id,
  title,
  orders,
  now,
  stationScope,
  newOrderIds,
  onAdvance,
}: {
  id: ColumnId;
  title: string;
  orders: Order[];
  now: Date;
  stationScope?: "cocina" | "barra";
  newOrderIds: Set<string>;
  onAdvance: (orderId: string, currentStatus: OrderStatus) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id });
  const Icon = STATUS_ICONS[id];

  return (
    <div className="flex flex-col h-full bg-bg-card/30 backdrop-blur-md rounded-2xl border border-border-main overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.4)] relative">
      {isOver && <div className="absolute inset-0 ring-1 ring-gold/40 border border-gold/40 bg-gold/5 z-0 pointer-events-none transition-all duration-300" />}

      <div className={`
        relative px-6 py-4 flex items-center justify-between border-b z-10 backdrop-blur-sm
        ${id === "pending"   ? "border-border-bright bg-bg-card/80" :
          id === "preparing" ? "border-gold/20 bg-gold/[0.08]" :
          "border-dash-green/20 bg-dash-green/[0.05]"}
      `}>
        <div className="flex items-center gap-3">
          <Icon className={`w-5 h-5 ${
            id === "pending"   ? "text-text-muted" :
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
                <SortableTicket
                  order={o}
                  now={now}
                  stationScope={stationScope}
                  isNew={newOrderIds.has(o.id)}
                  onAdvance={onAdvance}
                />
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ─── Main Board ───────────────────────────────────────────────────────────────

function orderTouchesStation(order: Order, scope: "cocina" | "barra"): boolean {
  return order.items.some((it) => it.station === scope);
}

export default function KDSBoard({
  initialOrders,
  defaultStation,
  restaurantId,
  initialNowMs,
}: {
  initialOrders: Order[];
  defaultStation?: "cocina" | "barra";
  restaurantId?: string;
  initialNowMs?: number;
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [now, setNow] = useState<Date>(() => new Date(initialNowMs ?? Date.now()));
  const [showHistory, setShowHistory] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [mobileColumn, setMobileColumn] = useState<ColumnId>("pending");
  const [newOrderIds, setNewOrderIds] = useState<Set<string>>(new Set());
  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const knownIdsRef = useRef(new Set(initialOrders.map(o => o.id)));

  const boardScopedOrders = useMemo(() => {
    if (!defaultStation) return orders;
    return orders.filter((o) => orderTouchesStation(o, defaultStation));
  }, [orders, defaultStation]);

  useEffect(() => {
    const int = setInterval(() => setNow(new Date()), 30000);
    return () => clearInterval(int);
  }, []);

  useEffect(() => {
    if (!restaurantId) return;
    const supabase = createClient();
    const channelName = `kds-orders:${encodeURIComponent(restaurantId)}`;
    const ch = supabase
      .channel(channelName)
      .on("broadcast", { event: "refresh" }, () => { router.refresh(); })
      .subscribe();
    return () => { void supabase.removeChannel(ch); };
  }, [router, restaurantId]);

  // Detect new orders on refresh and highlight them
  useEffect(() => {
    const incoming = initialOrders.map(o => o.id);
    const brandNew = incoming.filter(id => !knownIdsRef.current.has(id));
    knownIdsRef.current = new Set(incoming);
    setOrders(initialOrders);

    if (brandNew.length > 0) {
      setNewOrderIds(new Set(brandNew));
      const t = setTimeout(() => setNewOrderIds(new Set()), 4000);
      return () => clearTimeout(t);
    }
  }, [initialOrders]);

  function showToast(msg: string) {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  }

  async function handleAdvance(orderId: string, currentStatus: OrderStatus) {
    if (defaultStation === "cocina" && currentStatus === "ready") return;

    const snapshot = [...orders];
    const nextMap: Partial<Record<OrderStatus, OrderStatus>> = {
      pending: "preparing",
      preparing: "ready",
      ready: "delivered",
    };
    const nextStatus = nextMap[currentStatus];
    if (!nextStatus) return;

    // Optimistic
    setOrders(prev =>
      nextStatus === "delivered"
        ? prev.map(o => o.id === orderId ? { ...o, status: "delivered" as OrderStatus } : o)
        : prev.map(o => o.id === orderId ? { ...o, status: nextStatus } : o)
    );

    try {
      await advanceOrderStatus(orderId, currentStatus);
    } catch {
      setOrders(snapshot);
      showToast("Error al actualizar el ticket. Intenta de nuevo.");
    }
  }

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  async function handleDragEnd(e: any) {
    setActiveId(null);
    const { active, over } = e;
    if (!over) return;

    const orderId = active.id as string;
    const newStatus = over.id as ColumnId;
    const order = boardScopedOrders.find((o) => o.id === orderId);
    if (!order) return;
    const lo = String(order.status).toLowerCase();
    if (lo === "delivered" || lo === "cancelled" || normalizeBoardStatus(order.status) === newStatus) return;

    const snapshot = [...orders];
    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status: newStatus } : o)));

    try {
      await moveOrderToStatus(orderId, newStatus);
    } catch {
      setOrders(snapshot);
      showToast("Error al mover el ticket. Intenta de nuevo.");
    }
  }

  const boardOrders = boardScopedOrders.filter((o) => {
    const s = String(o.status).toLowerCase();
    return s !== "delivered" && s !== "cancelled";
  });

  const activeOrder = activeId ? boardScopedOrders.find((o) => o.id === activeId) : null;

  const pending  = boardOrders.filter(o => normalizeBoardStatus(o.status) === "pending").sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const prep     = boardOrders.filter(o => normalizeBoardStatus(o.status) === "preparing").sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const ready    = boardOrders.filter(o => normalizeBoardStatus(o.status) === "ready").sort((a,b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  const mobileCounts: Record<ColumnId, number> = {
    pending: pending.length,
    preparing: prep.length,
    ready: ready.length,
  };

  const recentHist = boardScopedOrders
    .filter(o => normalizeBoardStatus(o.status) === "delivered")
    .sort((a,b) => new Date(b.deliveredAt || b.createdAt).getTime() - new Date(a.deliveredAt || a.createdAt).getTime())
    .slice(0, 15);

  return (
    <div className="relative min-h-screen bg-bg-solid text-text-primary flex flex-col font-sans overflow-hidden">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden="true">
        <div className="absolute inset-0 z-0 opacity-30 mix-blend-overlay" style={{ backgroundImage: `url("${NOISE_SVG}")`, backgroundRepeat: "repeat" }} />
        <div className="absolute -left-[20%] -top-[20%] h-[min(80vh,600px)] w-[min(100vw,800px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.08),transparent_60%)] blur-[100px]" />
        <div className="absolute top-[20%] -right-[10%] h-[60vh] w-[60vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(77,132,96,0.05),transparent_60%)] blur-[100px]" />
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-3 md:px-8 md:py-5 flex items-center justify-between border-b border-border-main bg-bg-card/40 backdrop-blur-md sticky top-0">
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center gap-3">
            <ChefHat className="w-6 h-6 text-gold" strokeWidth={1.5} />
            <h1 className="font-serif text-2xl md:text-3xl font-medium tracking-tight text-text-primary">
              {defaultStation === "barra" ? "Barra" : "Cocina"}
            </h1>
          </div>
          <span className="hidden md:inline font-mono text-[10px] uppercase tracking-[0.3em] font-bold text-text-muted mt-0.5" style={{ marginLeft: "36px" }}>
            Bouquet &mdash; Sincronización en vivo
          </span>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <button
            onClick={() => setShowHistory(true)}
            className="group min-h-11 inline-flex items-center gap-1.5 px-2.5 py-2 rounded-lg border border-gold/50 bg-gold/10 hover:bg-gold/15 active:scale-[0.98] transition-all md:gap-2 md:px-4 md:rounded-none md:border-gold/35 md:bg-bg-solid/85 md:hover:bg-gold/10 md:hover:border-gold/70"
            aria-label="Abrir historial"
          >
            <History className="w-4 h-4 text-gold" strokeWidth={1.9} />
            <span className="text-[10px] sm:text-[11px] font-mono font-bold uppercase tracking-[0.14em] sm:tracking-[0.18em] text-text-primary group-hover:text-gold transition-colors">Historial</span>
            <span className="hidden md:inline text-[9px] font-mono uppercase tracking-[0.14em] text-text-muted/90 border-l border-border-main pl-2">
              tickets
            </span>
          </button>
        </div>
      </header>

      {/* Board */}
      <main className="relative z-10 flex-1 px-3 pb-3 pt-3 md:p-8 overflow-hidden flex gap-8 h-[calc(100vh-74px)] md:h-[calc(100vh-94px)]">
        <DndContext
          sensors={sensors}
          onDragStart={(e) => setActiveId(e.active.id as string)}
          onDragEnd={handleDragEnd}
        >
          <div className="flex-1 flex flex-col min-h-0">
            <div className="md:hidden mb-3 grid grid-cols-3 gap-2">
              {[
                { id: "pending", label: "Entrantes" },
                { id: "preparing", label: "Preparación" },
                { id: "ready", label: "Listos" },
              ].map((tab) => {
                const active = mobileColumn === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setMobileColumn(tab.id as ColumnId)}
                    className={`min-h-11 rounded-lg border px-2 py-2 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors ${
                      active
                        ? "bg-gold/15 border-gold/60 text-gold"
                        : "bg-bg-card/40 border-border-main text-text-muted"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className="ml-1 tabular-nums">({mobileCounts[tab.id as ColumnId]})</span>
                  </button>
                );
              })}
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6 h-full min-h-0">
              <div className={mobileColumn === "pending" ? "block md:block min-h-0" : "hidden md:block min-h-0"}>
                <KDSColumn id="pending" title="Entrantes" orders={pending} now={now} stationScope={defaultStation} newOrderIds={newOrderIds} onAdvance={handleAdvance} />
              </div>
              <div className={mobileColumn === "preparing" ? "block md:block min-h-0" : "hidden md:block min-h-0"}>
                <KDSColumn id="preparing" title="En Preparación" orders={prep} now={now} stationScope={defaultStation} newOrderIds={newOrderIds} onAdvance={handleAdvance} />
              </div>
              <div className={mobileColumn === "ready" ? "block md:block min-h-0" : "hidden md:block min-h-0"}>
                <KDSColumn id="ready" title="Listos para salir" orders={ready} now={now} stationScope={defaultStation} newOrderIds={newOrderIds} onAdvance={handleAdvance} />
              </div>
            </div>
          </div>

          <DragOverlay dropAnimation={{ duration: 250, easing: "cubic-bezier(0.18, 0.67, 0.6, 1.22)" }}>
            {activeOrder ? (
              <SortableTicket
                order={activeOrder}
                now={now}
                isOverlay
                stationScope={defaultStation}
                onAdvance={handleAdvance}
              />
            ) : null}
          </DragOverlay>
        </DndContext>
      </main>

      {/* History Sidemenu */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-bg-card/60 backdrop-blur-sm z-50 flex justify-end"
            onClick={() => setShowHistory(false)}
          >
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 250 }}
              className="w-full max-w-md h-full bg-bg-card/95 backdrop-blur-2xl border-l border-border-main shadow-[-10px_0_40px_rgba(0,0,0,0.3)] flex flex-col"
              onClick={e => e.stopPropagation()}
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
                            <span><span className="font-bold text-text-primary mr-1">{it.quantity}x</span>{it.name}</span>
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
                          <RotateCcw className="w-3.5 h-3.5" /> Revertir salida
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

      {/* Toast */}
      <AnimatePresence>
        {toastMsg && <Toast msg={toastMsg} onClose={() => setToastMsg(null)} />}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{__html:`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(255,255,255,0.3); }
        @keyframes newOrderPulse {
          0%   { box-shadow: 0 0 0 0 rgba(201,160,84,0.5); }
          70%  { box-shadow: 0 0 0 12px rgba(201,160,84,0); }
          100% { box-shadow: 0 0 0 0 rgba(201,160,84,0); }
        }
      `}} />
    </div>
  );
}
