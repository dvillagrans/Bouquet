"use client";

import { useState, useEffect } from "react";
import { RotateCcw, Utensils, Coffee, History } from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Mock data ────────────────────────────────────────────────────────────────


// ─── Live clock ───────────────────────────────────────────────────────────────

function LiveClock() {
  const [time, setTime] = useState(() => new Date());

  useEffect(() => {
    const id = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <span className="font-mono text-[0.9rem] font-semibold tabular-nums text-light/70">
      {time.toLocaleTimeString("es-MX", { hour: "2-digit", minute: "2-digit" })}
    </span>
  );
}

// ─── Urgency helpers ──────────────────────────────────────────────────────────

type Urgency = "normal" | "warning" | "critical";

function getUrgency(mins: number, status: OrderStatus): Urgency {
  if (status === "delivered") return "normal";
  if (mins >= 30) return "critical";
  if (mins >= 15) return "warning";
  return "normal";
}

const CARD_BORDER: Record<Urgency, string> = {
  normal:   "border-wire",
  warning:  "border-glow/70",
  critical: "border-ember",
};

const TIME_COLOR: Record<Urgency, string> = {
  normal:   "text-dim",
  warning:  "text-glow",
  critical: "text-ember",
};

const ADVANCE_BTN: Record<Urgency, string> = {
  normal:   "border-wire text-dim hover:border-light/30 hover:text-light",
  warning:  "border-glow/50 text-glow hover:border-glow hover:bg-glow/[0.06]",
  critical: "border-ember/60 text-ember hover:border-ember hover:bg-ember/[0.06]",
};

// ─── OrderCard ────────────────────────────────────────────────────────────────

function OrderCard({
  order,
  currentTime,
  onAdvance,
  onUndo,
}: {
  order: Order;
  currentTime: Date;
  onAdvance: (id: string, status: OrderStatus) => void;
  onUndo: (id: string, status: OrderStatus) => void;
}) {
  const mins = Math.floor((currentTime.getTime() - order.createdAt.getTime()) / 60000);
  const urgency = getUrgency(mins, order.status);

  const ADVANCE_LABEL: Record<OrderStatus, string> = {
    pending:   "Empezar",
    preparing: "Listo para salir",
    ready:     "Entregar a mesa",
    delivered: "",
  };

  return (
    <div
      className={[
        "flex flex-col border bg-ink transition-colors duration-200",
        CARD_BORDER[urgency],
        urgency === "critical" ? "bg-ember/[0.04]" : "",
      ].join(" ")}
      style={{ animation: "dash-row-enter 0.3s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      {/* Card header */}
      <div className="flex items-start justify-between border-b border-wire px-4 py-3">
        <div>
          <div className="flex items-center gap-2">
            {urgency === "critical" && (
              <span
                className="h-2 w-2 rounded-full bg-ember"
                aria-hidden="true"
                style={{ animation: "pulse-slow 1.6s ease-in-out infinite" }}
              />
            )}
            {urgency === "warning" && (
              <span className="h-2 w-2 rounded-full bg-glow" aria-hidden="true" />
            )}
            <span className="text-[0.75rem] font-bold uppercase tracking-[0.22em] text-light">
              {order.tableCode}
            </span>
          </div>
          <p className="mt-0.5 text-[0.58rem] font-medium text-dim/50">#{order.id}</p>
        </div>

        <div className="flex items-center gap-3">
          {/* Elapsed time — large and prominent */}
          <div className={`flex items-baseline gap-1 ${TIME_COLOR[urgency]}`}>
            <span className="font-serif text-[1.6rem] font-semibold leading-none tabular-nums">
              {mins}
            </span>
            <span className="text-[0.58rem] font-bold uppercase tracking-wider">min</span>
          </div>

          {/* Undo */}
          {order.status !== "pending" && order.status !== "delivered" && (
            <button
              onClick={() => onUndo(order.id, order.status)}
              aria-label="Deshacer estado"
              className="flex h-8 w-8 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light"
            >
              <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          )}
        </div>
      </div>

      {/* Items */}
      <div className="flex flex-col divide-y divide-wire/50 px-4">
        {order.items.map(item => (
          <div key={item.id} className="py-3">
            <div className="flex items-baseline gap-3">
              <span className="w-7 shrink-0 text-center text-[0.72rem] font-bold tabular-nums text-dim">
                {item.quantity}×
              </span>
              <span className="flex-1 text-[0.9rem] font-semibold text-light leading-snug">
                {item.name}
              </span>
              <span
                className="shrink-0 text-dim/40"
                aria-label={`Estación: ${item.station}`}
                title={`Estación: ${item.station}`}
              >
                {item.station === "cocina"
                  ? <Utensils className="h-3 w-3" aria-hidden="true" />
                  : <Coffee className="h-3 w-3" aria-hidden="true" />}
              </span>
            </div>
            {item.notes && (
              <p className="ml-10 mt-1.5 border-l-2 border-glow/50 pl-2.5 text-[0.68rem] font-medium text-glow/80">
                {item.notes}
              </p>
            )}
          </div>
        ))}
      </div>

      {/* Action */}
      <div className="mt-auto border-t border-wire p-3">
        {order.status !== "delivered" ? (
          <button
            onClick={() => onAdvance(order.id, order.status)}
            className={[
              "flex min-h-[48px] w-full items-center justify-center border",
              "text-[0.72rem] font-bold uppercase tracking-[0.18em] transition-all duration-150 active:scale-[0.99]",
              ADVANCE_BTN[urgency],
            ].join(" ")}
          >
            {ADVANCE_LABEL[order.status]}
          </button>
        ) : (
          <div className="flex min-h-[40px] w-full items-center justify-center border border-sage-deep/30 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-sage-deep/70">
            Entregada · {Math.floor((currentTime.getTime() - (order.deliveredAt?.getTime() ?? 0)) / 60000)} min
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Column ───────────────────────────────────────────────────────────────────

function KDSColumn({
  label,
  dot,
  count,
  children,
  empty,
}: {
  label: string;
  dot: string;
  count: number;
  children: React.ReactNode;
  empty: string;
}) {
  return (
    <div className="flex min-h-0 flex-col border border-wire bg-canvas">
      {/* Column header */}
      <div className="flex items-center justify-between border-b border-wire px-5 py-4">
        <div className="flex items-center gap-2.5">
          <span className={`h-2 w-2 rounded-full ${dot}`} aria-hidden="true" />
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.32em] text-dim">{label}</span>
        </div>
        <span className="font-serif text-[1.1rem] font-semibold leading-none text-light">{count}</span>
      </div>

      {/* Cards */}
      <div className="flex flex-col gap-3 overflow-y-auto p-4 scrollbar-hide flex-1">
        {count === 0
          ? <p className="mt-8 text-center text-[0.72rem] font-medium text-dim/40 italic">{empty}</p>
          : children}
      </div>
    </div>
  );
}

// ─── KDSBoard ─────────────────────────────────────────────────────────────────

type StationFilter = "todas" | "cocina" | "barra";
type ViewMode = "activas" | "historial";

import { useTransition } from "react";
import { advanceOrderStatus, undoOrderStatus } from "@/actions/orders";

export default function KDSBoard({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders]           = useState<Order[]>(initialOrders);
  const [, startTransition]          = useTransition();

  const [currentTime, setCurrentTime] = useState(new Date());
  const [view, setView]               = useState<ViewMode>("activas");
  const [station, setStation]         = useState<StationFilter>("todas");

  useEffect(() => {
    const id = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(id);
  }, []);

  function advanceOrderState(orderId: string, currentStatus: OrderStatus) {
    // Optimistic Update

    const next: Record<OrderStatus, OrderStatus> = {
      pending: "preparing", preparing: "ready", ready: "delivered", delivered: "delivered",
    };
    const optimisticNextStatus = next[currentStatus];
    setOrders(prev => prev.map(o =>
      o.id === orderId
        ? { ...o, status: optimisticNextStatus, deliveredAt: optimisticNextStatus === "delivered" ? new Date() : o.deliveredAt }
        : o
    ));

    startTransition(async () => {
      try {
        await advanceOrderStatus(orderId, currentStatus);
      } catch (err) {
        console.error("Failed to advance order", err);
        // revert on error
        setOrders(prev => prev.map(o =>
          o.id === orderId
            ? { ...o, status: currentStatus }
            : o
        ));
      }
    });
  }

  function undoOrderState(orderId: string, currentStatus: OrderStatus) {
    const prev: Record<OrderStatus, OrderStatus> = {
      pending: "pending", preparing: "pending", ready: "preparing", delivered: "ready",
    };
    
    const optimisticPrevStatus = prev[currentStatus];
    setOrders(orders => orders.map(o =>
      o.id === orderId ? { ...o, status: optimisticPrevStatus } : o
    ));

    startTransition(async () => {
      try {
        await undoOrderStatus(orderId, currentStatus);
      } catch (err) {
        console.error("Failed to undo order", err);
        // revert on error
        setOrders(orders => orders.map(o =>
          o.id === orderId ? { ...o, status: currentStatus } : o
        ));
      }
    });
  }

  function filterByStation(list: Order[]): Order[] {
    return list
      .map(o => station === "todas" ? o : { ...o, items: o.items.filter(i => i.station === station) })
      .filter(o => o.items.length > 0);
  }

  const active  = filterByStation(orders.filter(o => o.status !== "delivered"));
  const history = filterByStation(orders.filter(o => o.status === "delivered"))
    .sort((a, b) => (b.deliveredAt?.getTime() ?? 0) - (a.deliveredAt?.getTime() ?? 0));

  const pending   = active.filter(o => o.status === "pending");
  const preparing = active.filter(o => o.status === "preparing");
  const ready     = active.filter(o => o.status === "ready");

  const STATION_TABS: { label: string; value: StationFilter }[] = [
    { label: "Todas",  value: "todas"  },
    { label: "Cocina", value: "cocina" },
    { label: "Barra",  value: "barra"  },
  ];

  return (
    <div className="flex h-screen flex-col bg-ink text-light">

      {/* ── Top bar ─────────────────────────────────────────── */}
      <header
        className="shrink-0 border-b border-wire bg-canvas px-6 py-4"
        style={{ animation: "reveal-up 0.4s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-5">
            <div>
              <p className="text-[0.5rem] font-bold uppercase tracking-[0.44em] text-dim">Monitor de cocina</p>
              <h1 className="mt-1 font-serif text-[1.6rem] font-medium leading-none tracking-[-0.02em] text-light">
                Kitchen Display
              </h1>
            </div>
            <div className="hidden items-center border-l border-wire pl-5 sm:flex">
              <LiveClock />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Station filter */}
            <div className="flex border-b border-wire">
              {STATION_TABS.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setStation(value)}
                  className={[
                    "px-4 pb-2.5 pt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] transition-colors duration-150",
                    station === value
                      ? "border-b-[1.5px] border-glow text-glow"
                      : "text-dim hover:text-light",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            <div className="h-5 w-px bg-wire" aria-hidden="true" />

            {/* View mode */}
            <div className="flex border-b border-wire">
              {([
                { label: `Activas · ${active.length}`, value: "activas"   as ViewMode },
                { label: "Historial",                   value: "historial" as ViewMode },
              ] as const).map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setView(value)}
                  className={[
                    "flex items-center gap-1.5 px-4 pb-2.5 pt-1.5 text-[0.62rem] font-bold uppercase tracking-[0.2em] transition-colors duration-150",
                    view === value
                      ? "border-b-[1.5px] border-glow text-glow"
                      : "text-dim hover:text-light",
                  ].join(" ")}
                >
                  {value === "historial" && <History className="h-3 w-3" aria-hidden="true" />}
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* ── Board ───────────────────────────────────────────── */}
      {view === "activas" ? (
        <div className="grid flex-1 grid-cols-1 gap-px overflow-hidden bg-wire md:grid-cols-3">
          <KDSColumn label="Nuevas" dot="bg-ember" count={pending.length} empty="Sin órdenes nuevas">
            {pending.map(o => (
              <OrderCard key={o.id} order={o} currentTime={currentTime} onAdvance={advanceOrderState} onUndo={undoOrderState} />
            ))}
          </KDSColumn>

          <KDSColumn label="En preparación" dot="bg-glow" count={preparing.length} empty="Estación libre">
            {preparing.map(o => (
              <OrderCard key={o.id} order={o} currentTime={currentTime} onAdvance={advanceOrderState} onUndo={undoOrderState} />
            ))}
          </KDSColumn>

          <KDSColumn label="Listos" dot="bg-sage-deep" count={ready.length} empty="Sin platillos esperando salir">
            {ready.map(o => (
              <OrderCard key={o.id} order={o} currentTime={currentTime} onAdvance={advanceOrderState} onUndo={undoOrderState} />
            ))}
          </KDSColumn>
        </div>

      ) : (
        <div className="flex-1 overflow-y-auto p-6">
          <p className="mb-6 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
            Historial
          </p>
          {history.length === 0 ? (
            <p className="mt-16 text-center text-[0.8rem] font-medium text-dim/40 italic">
              No hay órdenes entregadas.
            </p>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-4">
              {history.map(o => (
                <OrderCard key={`h-${o.id}`} order={o} currentTime={currentTime} onAdvance={advanceOrderState} onUndo={undoOrderState} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
