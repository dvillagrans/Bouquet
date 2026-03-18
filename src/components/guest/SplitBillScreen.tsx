"use client";

import { useState } from "react";
import Link from "next/link";

export type OrderedItem = {
  id: string;
  name: string;
  price: number;
  orderedBy: string;
  status: "pending" | "paid";
};

// Mock de ítems ordenados en la mesa
const getMockItems = (guestName: string): OrderedItem[] => [
  { id: "1", name: "Ceviche Clásico", price: 185, orderedBy: guestName, status: "pending" },
  { id: "2", name: "Camarones al Ajillo", price: 220, orderedBy: "Carlos (Mesa)", status: "pending" },
  { id: "3", name: "Pato Confitado", price: 345, orderedBy: guestName, status: "pending" },
  { id: "4", name: "Agua Fresca de Horchata", price: 45, orderedBy: "Ana (Mesa)", status: "paid" },
  { id: "5", name: "Vino Tinto Reserva", price: 95, orderedBy: "Ana (Mesa)", status: "pending" },
  { id: "6", name: "Vino Tinto Reserva", price: 95, orderedBy: "Carlos (Mesa)", status: "pending" },
  { id: "7", name: "Flan de Vainilla", price: 85, orderedBy: "Compartido", status: "pending" },
];

export function SplitBillScreen({ tableCode, guestName }: { tableCode: string; guestName: string }) {
  const [items] = useState<OrderedItem[]>(() => getMockItems(guestName));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [tipPercent, setTipPercent] = useState<number>(15);

  const toggleSelection = (id: string, status: string) => {
    if (status === "paid") return;
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const selectMine = () => {
    const mine = items
      .filter((i) => i.orderedBy === guestName && i.status === "pending")
      .map((i) => i.id);
    setSelectedIds(new Set([...mine]));
  };

  // Cálculos
  const selectedItems = items.filter((i) => selectedIds.has(i.id));
  const mySubtotal = selectedItems.reduce((acc, i) => acc + i.price, 0);
  const tipAmount = mySubtotal * (tipPercent / 100);
  const myTotal = mySubtotal + tipAmount;

  const totalTable = items.reduce((acc, i) => acc + i.price, 0);
  const remainingTable = items.filter((i) => i.status === "pending").reduce((acc, i) => acc + i.price, 0);

  return (
    <div className="space-y-10">
      {/* HEADER DIV */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-serif text-4xl leading-tight text-light lg:text-5xl">
            La cuenta de la mesa{" "}
            <span className="bg-gradient-to-r from-glow via-light to-glow bg-clip-text text-transparent">
              {tableCode}
            </span>
          </h1>
          <p className="mt-3 text-base leading-relaxed text-light/75">
            Total mesa: <span className="font-semibold text-light">${totalTable.toFixed(2)}</span> ·{" "}
            Faltan por pagar: <span className="text-glow">${remainingTable.toFixed(2)}</span>
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr] lg:gap-12">
        {/* LISTA DE ITEMS (Izquierda) */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-2xl text-light">Monto a dividir</h3>
            <button
              onClick={selectMine}
              className="rounded-full border border-glow/30 px-4 py-2 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-glow transition hover:bg-glow/10 md:text-xs"
            >
              Seleccionar mis pedidos
            </button>
          </div>

          <div className="space-y-3">
            {items.map((item) => {
              const isPaid = item.status === "paid";
              const isSelected = selectedIds.has(item.id);

              return (
                <div
                  key={item.id}
                  onClick={() => toggleSelection(item.id, item.status)}
                  className={`group relative flex items-center justify-between rounded-xl border p-4 transition md:p-5 ${
                    isPaid
                      ? "cursor-not-allowed border-wire/30 bg-canvas/40 opacity-50"
                      : isSelected
                      ? "cursor-pointer border-glow bg-glow/10 shadow-[0_0_15px_rgba(201,160,84,0.1)]"
                      : "cursor-pointer border-wire bg-panel hover:border-glow/40 hover:bg-canvas"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    {/* Checkbox custom */}
                    <div
                      className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border transition md:h-6 md:w-6 ${
                        isPaid
                          ? "border-wire/50 bg-transparent text-wire"
                          : isSelected
                          ? "border-glow bg-glow text-ink"
                          : "border-wire bg-canvas group-hover:border-glow/50"
                      }`}
                    >
                      {(isSelected || isPaid) && (
                        <svg className="h-3 w-3 md:h-3.5 md:w-3.5" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.6666 3.5L5.24992 9.91667L2.33325 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className={`font-serif text-lg leading-tight md:text-xl ${isPaid ? "line-through text-light/60" : "text-light"}`}>
                        {item.name}
                      </p>
                      <p className="mt-0.5 text-[0.7rem] uppercase tracking-wider text-light/50">
                        {item.orderedBy} {isPaid && "· (Pagado)"}
                      </p>
                    </div>
                  </div>
                  <div className={`font-serif text-lg font-semibold md:text-xl ${isSelected ? "text-glow" : "text-light/80"}`}>
                    ${item.price.toFixed(2)}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* RESUMEN DE PAGO (Derecha Sticky) */}
        <div className="h-fit lg:sticky lg:top-8">
          <div className="rounded-[2rem] border border-wire bg-panel p-6 shadow-2xl shadow-ink/50 lg:p-8">
            <h3 className="font-serif text-2xl text-light mb-6">Tu pago</h3>

            {/* Items a pagar */}
            <div className="space-y-4 max-h-48 overflow-y-auto pr-2 rounded-xl mb-6">
              {selectedItems.map((item) => (
                <div key={item.id} className="flex justify-between text-sm">
                  <span className="text-light/80 truncate pr-4">{item.name}</span>
                  <span className="text-light whitespace-nowrap">${item.price.toFixed(2)}</span>
                </div>
              ))}
              {selectedItems.length === 0 && (
                <p className="text-sm text-dim italic">Aún no has seleccionado qué pagar.</p>
              )}
            </div>

            {/* Totales */}
            <div className="border-t border-wire pt-6 space-y-5">
              <div className="flex justify-between items-center text-sm text-light/80">
                <span>Subtotal</span>
                <span>${mySubtotal.toFixed(2)}</span>
              </div>

              {/* Tips */}
              <div className="space-y-3">
                <div className="flex justify-between text-xs font-semibold uppercase tracking-widest text-dim">
                  <span>Propina</span>
                  <span>${tipAmount.toFixed(2)}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {[10, 15, 20].map((tip) => (
                    <button
                      key={tip}
                      onClick={() => setTipPercent(tip)}
                      className={`rounded-lg border py-2.5 text-[0.8rem] font-semibold transition ${
                        tipPercent === tip
                          ? "border-glow bg-glow/15 text-glow"
                          : "border-wire bg-canvas text-dim hover:text-light transition hover:border-glow/40"
                      }`}
                    >
                      {tip}%
                    </button>
                  ))}
                </div>
              </div>

              {/* Total final */}
              <div className="border-t border-wire pt-5 flex justify-between items-end">
                <span className="font-serif text-lg text-light">Total a pagar</span>
                <span className="font-serif text-3xl font-medium text-glow leading-none">${myTotal.toFixed(2)}</span>
              </div>

              <button
                disabled={selectedItems.length === 0}
                className="w-full mt-2 rounded-xl bg-glow px-4 py-4 text-xs font-bold uppercase tracking-[0.14em] text-ink transition hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:brightness-100"
              >
                Proceder al pago
              </button>
              
              <p className="text-center text-xs text-dim">Pagos seguros by Stripe</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
