"use client";

import Link from "next/link";
import { useState } from "react";


const TIP_OPTIONS = [
  { label: "Sin propina", rate: 0    },
  { label: "10%",         rate: 0.10 },
  { label: "15%",         rate: 0.15 },
  { label: "18%",         rate: 0.18 },
] as const;

type TipRate = 0 | 0.10 | 0.15 | 0.18;
type SplitMode = "equal" | "full";

// ─── ConfirmedView ───────────────────────────────────────────────────────────

function ConfirmedView({
  tableCode,
  guestName,
  amount,
}: {
  tableCode: string;
  guestName: string;
  amount: number;
}) {
  return (
    <div
      className="flex min-h-screen flex-col items-center justify-center px-6 text-center"
      style={{ animation: "reveal-scale 0.45s cubic-bezier(0.22,1,0.36,1) both" }}
    >
      <div className="mb-10 flex h-14 w-14 items-center justify-center border border-glow/40">
        <svg viewBox="0 0 24 24" fill="none" className="h-6 w-6 text-glow" aria-hidden="true">
          <path d="M5 12l5 5L19 7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Pago registrado</p>

      <p
        className="mt-4 font-serif font-semibold leading-none text-glow"
        style={{ fontSize: "clamp(3.5rem,10vw,5.5rem)" }}
      >
        ${amount.toLocaleString("es-MX")}
      </p>

      <p className="mt-5 text-[0.82rem] font-medium text-dim">Gracias, {guestName}</p>

      <div className="mx-auto mt-10 h-px w-12 bg-wire" />

      <p className="mt-8 max-w-[28ch] text-[0.72rem] font-medium leading-relaxed text-dim/55">
        Tu parte quedó registrada en la cuenta de la mesa {tableCode}. El mesero confirmará el cierre.
      </p>

      <Link
        href={`/mesa/${encodeURIComponent(tableCode)}/menu?guest=${encodeURIComponent(guestName)}`}
        className="mt-12 border border-wire px-8 py-3 text-[0.65rem] font-bold uppercase tracking-[0.26em] text-dim transition-colors hover:border-light/20 hover:text-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
      >
        Volver al menú
      </Link>
    </div>
  );
}

// ─── SplitBillScreen ─────────────────────────────────────────────────────────

interface BillItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface SplitBillScreenProps {
  tableCode: string;
  guestName: string;
  partySize: number;
  initialBill: {
    items: BillItem[];
    total: number;
  };
}

export function SplitBillScreen({ tableCode, guestName, partySize, initialBill }: SplitBillScreenProps) {
  const billItems = initialBill.items;
  const subtotal = initialBill.total;
  const [mode, setMode]             = useState<SplitMode>("equal");
  const [splitCount, setSplitCount] = useState(partySize);
  const [tipRate, setTipRate]       = useState<TipRate>(0.15);
  const [billOpen, setBillOpen]     = useState(false);
  const [confirmed, setConfirmed]   = useState(false);

  const tip       = Math.round(subtotal * tipRate);
  const total     = subtotal + tip;
  const perPerson = Math.ceil(total / splitCount);
  const myShare   = mode === "equal" ? perPerson : total;

  function adjustSplit(delta: number) {
    setSplitCount(prev => Math.max(1, Math.min(20, prev + delta)));
  }

  if (confirmed) {
    return <ConfirmedView tableCode={tableCode} guestName={guestName} amount={myShare} />;
  }

  return (
    <div className="relative min-h-screen">

      {/* ── TOP BAR ────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-wire bg-ink">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-6 py-4 lg:px-10">
          <Link
            href={`/mesa/${encodeURIComponent(tableCode)}/menu?guest=${encodeURIComponent(guestName)}&pax=${partySize}`}
            className="inline-flex items-center gap-2 text-[0.65rem] font-bold uppercase tracking-[0.3em] text-dim transition-colors hover:text-light"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Menú
          </Link>
          <span className="text-[0.58rem] font-bold uppercase tracking-[0.32em] text-dim">
            Cuenta · {tableCode}
          </span>
        </div>
      </header>

      {/* ── BODY ───────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-6 pb-24 lg:px-10">

        {/* Heading */}
        <div className="border-b border-wire pb-8 pt-10">
          <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Pago de mesa</p>
          <h1 className="mt-3 font-serif text-[clamp(2.2rem,6vw,3.2rem)] font-medium leading-[0.9] tracking-[-0.02em] text-light">
            La cuenta
          </h1>
          <p className="mt-3 text-[0.75rem] font-medium text-dim">
            {guestName} · Mesa {tableCode} · {partySize} comensal{partySize !== 1 ? "es" : ""}
          </p>
        </div>

        {/* ── CONSUMO (collapsible) ─────────────────────────────────── */}
        <div className="border-b border-wire">
          <button
            onClick={() => setBillOpen(v => !v)}
            className="flex w-full items-center justify-between py-6 text-left"
            aria-expanded={billOpen}
            aria-controls="bill-detail"
          >
            <div>
              <p className="text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">Consumo</p>
              <p className="mt-1 font-serif text-[1.6rem] font-semibold leading-none text-light">
                ${subtotal.toLocaleString("es-MX")}
              </p>
            </div>
            <span className="flex items-center gap-2 text-[0.62rem] font-bold uppercase tracking-[0.24em] text-dim">
              {billItems.length} platillos
              <svg
                viewBox="0 0 16 16" fill="none" className="h-3 w-3 transition-transform duration-200"
                style={{ transform: billOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                aria-hidden="true"
              >
                <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </button>

          {billOpen && (
            <div id="bill-detail" className="pb-6">
              <div className="divide-y divide-wire/40">
                {billItems.map(item => (
                  <div key={item.id} className="flex items-baseline justify-between gap-4 py-3">
                    <div className="flex items-baseline gap-3">
                      <span className="w-5 shrink-0 text-[0.68rem] font-semibold tabular-nums text-dim">
                        {item.qty}×
                      </span>
                      <span className="text-[0.85rem] font-medium text-light">{item.name}</span>
                    </div>
                    <span className="shrink-0 font-serif text-[0.88rem] text-light/65">
                      ${(item.price * item.qty).toLocaleString("es-MX")}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ── PROPINA ──────────────────────────────────────────────── */}
        <div className="border-b border-wire py-8">
          <p className="mb-5 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">Propina</p>
          <div className="flex flex-wrap gap-3">
            {TIP_OPTIONS.map(({ label, rate }) => (
              <button
                key={rate}
                onClick={() => setTipRate(rate as TipRate)}
                className={[
                  "min-h-[44px] px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] transition-colors duration-150",
                  tipRate === rate
                    ? "bg-glow text-ink"
                    : "border border-wire text-dim hover:border-light/20 hover:text-light",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
          {tip > 0 && (
            <p className="mt-4 text-[0.68rem] font-medium text-dim">
              ${tip.toLocaleString("es-MX")} · total con propina ${total.toLocaleString("es-MX")}
            </p>
          )}
        </div>

        {/* ── SPLIT MODE ───────────────────────────────────────────── */}
        <div className="py-8">
          <p className="mb-5 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">¿Cómo pagan?</p>

          <div className="flex border-b border-wire">
            {(["equal", "full"] as SplitMode[]).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={[
                  "flex-1 pb-4 pt-3 text-[0.63rem] font-bold uppercase tracking-[0.24em] transition-colors duration-150",
                  mode === m
                    ? "border-b-[1.5px] border-glow text-glow"
                    : "text-dim hover:text-light",
                ].join(" ")}
              >
                {m === "equal" ? "Por igual" : "Pago completo"}
              </button>
            ))}
          </div>

          {/* Equal split */}
          {mode === "equal" && (
            <div className="mt-8">
              <p className="mb-5 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">
                ¿Entre cuántas personas?
              </p>

              <div className="flex items-center border-b border-wire/50 pb-6">
                <button
                  type="button"
                  onClick={() => adjustSplit(-1)}
                  disabled={splitCount <= 1}
                  aria-label="Restar persona"
                  className="flex h-11 w-11 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light disabled:opacity-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                    <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="flex-1 text-center font-serif text-[2.2rem] font-semibold tabular-nums text-light">
                  {splitCount}
                </span>
                <button
                  type="button"
                  onClick={() => adjustSplit(1)}
                  disabled={splitCount >= 20}
                  aria-label="Agregar persona"
                  className="flex h-11 w-11 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light disabled:opacity-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>

              <div className="mt-8 border-t-2 border-glow pt-6">
                <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Tu parte</p>
                <p
                  className="mt-3 font-serif font-semibold leading-none text-glow"
                  style={{ fontSize: "clamp(3rem,10vw,4.5rem)" }}
                >
                  ${perPerson.toLocaleString("es-MX")}
                </p>
                <p className="mt-3 text-[0.68rem] font-medium text-dim">
                  ${total.toLocaleString("es-MX")} ÷ {splitCount} persona{splitCount !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          )}

          {/* Full payment */}
          {mode === "full" && (
            <div className="mt-8">
              <div className="divide-y divide-wire/40">
                <div className="flex items-baseline justify-between py-3">
                  <span className="text-[0.8rem] font-medium text-dim">Consumo</span>
                  <span className="font-serif text-[0.9rem] text-light">
                    ${subtotal.toLocaleString("es-MX")}
                  </span>
                </div>
                {tip > 0 && (
                  <div className="flex items-baseline justify-between py-3">
                    <span className="text-[0.8rem] font-medium text-dim">
                      Propina ({Math.round(tipRate * 100)}%)
                    </span>
                    <span className="font-serif text-[0.9rem] text-light">
                      ${tip.toLocaleString("es-MX")}
                    </span>
                  </div>
                )}
              </div>

              <div className="mt-6 border-t-2 border-glow pt-6">
                <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Total a pagar</p>
                <p
                  className="mt-3 font-serif font-semibold leading-none text-glow"
                  style={{ fontSize: "clamp(3rem,10vw,4.5rem)" }}
                >
                  ${total.toLocaleString("es-MX")}
                </p>
                <p className="mt-3 text-[0.68rem] font-medium text-dim">
                  Cubre el consumo completo de la mesa
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── CONFIRM ──────────────────────────────────────────────── */}
        <div className="border-t border-wire pt-8" style={{ paddingBottom: "max(4rem, env(safe-area-inset-bottom, 4rem))" }}>
          <button
            onClick={() => setConfirmed(true)}
            className="w-full bg-glow py-5 text-[0.76rem] font-bold uppercase tracking-[0.22em] text-ink transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
          >
            Pagar ${myShare.toLocaleString("es-MX")}
          </button>
          <p className="mt-4 text-center text-[0.6rem] font-medium text-dim/50">
            Al confirmar, tu parte queda registrada en el sistema
          </p>
        </div>

      </div>
    </div>
  );
}
