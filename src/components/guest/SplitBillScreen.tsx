"use client";

import Link from "next/link";
import { useState, useTransition, useMemo } from "react";
import { payGuestShare } from "@/actions/comensal";

// ─── Types ───────────────────────────────────────────────────────────────────

interface LineItem {
  lineItemId: string;
  name: string;
  variantName: string | null;
  qty: number;
  unitPrice: number;
  subtotal: number;
}

interface GuestBill {
  guestName: string;
  items: LineItem[];
  subtotal: number;
}

interface TableBill {
  guests: GuestBill[];
  tableTotal: number;
}

type Mode = "mine" | "equal" | "shared";
type TipRate = 0 | 0.10 | 0.15 | 0.18;

const TIP_OPTIONS: { label: string; rate: TipRate }[] = [
  { label: "Sin propina", rate: 0 },
  { label: "10%",         rate: 0.10 },
  { label: "15%",         rate: 0.15 },
  { label: "18%",         rate: 0.18 },
];

// ─── ConfirmedView ───────────────────────────────────────────────────────────

function ConfirmedView({ tableCode, guestName, amount }: { tableCode: string; guestName: string; amount: number }) {
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
      <p className="mt-4 font-serif font-semibold leading-none text-glow" style={{ fontSize: "clamp(3.5rem,10vw,5.5rem)" }}>
        ${amount.toLocaleString("es-MX")}
      </p>
      <p className="mt-5 text-[0.82rem] font-medium text-dim">Gracias, {guestName}</p>
      <div className="mx-auto mt-10 h-px w-12 bg-wire" />
      <p className="mt-8 max-w-[28ch] text-[0.72rem] font-medium leading-relaxed text-dim/55">
        Tu parte quedó registrada. El mesero confirmará el cierre cuando todos hayan pagado.
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

// ─── TipSelector ─────────────────────────────────────────────────────────────

function TipSelector({ value, onChange }: { value: TipRate; onChange: (r: TipRate) => void }) {
  return (
    <div className="border-b border-wire py-7">
      <p className="mb-4 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">Propina</p>
      <div className="flex flex-wrap gap-2.5">
        {TIP_OPTIONS.map(({ label, rate }) => (
          <button
            key={rate}
            onClick={() => onChange(rate)}
            className={[
              "min-h-[42px] px-4 py-2 text-[0.63rem] font-bold uppercase tracking-[0.2em] transition-colors",
              value === rate ? "bg-glow text-ink" : "border border-wire text-dim hover:border-light/20 hover:text-light",
            ].join(" ")}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── PayButton ───────────────────────────────────────────────────────────────

function PayButton({ amount, disabled, onClick }: { amount: number; disabled: boolean; onClick: () => void }) {
  return (
    <div className="border-t border-wire pt-8" style={{ paddingBottom: "max(4rem, env(safe-area-inset-bottom, 4rem))" }}>
      <button
        onClick={onClick}
        disabled={disabled || amount <= 0}
        className="w-full bg-glow py-5 text-[0.76rem] font-bold uppercase tracking-[0.22em] text-ink transition-all duration-200 hover:-translate-y-px disabled:opacity-40 disabled:hover:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
      >
        {disabled ? "Procesando…" : `Pagar $${amount.toLocaleString("es-MX")}`}
      </button>
      <p className="mt-4 text-center text-[0.6rem] font-medium text-dim/50">
        Al confirmar, tu parte queda registrada en el sistema
      </p>
    </div>
  );
}

// ─── GuestItemList ────────────────────────────────────────────────────────────
// Lista colapsable de ítems de un comensal con checkboxes opcionales.

function GuestItemList({
  guest,
  selected,
  onToggle,
  isMe,
}: {
  guest: GuestBill;
  selected: Set<string>;
  onToggle: (id: string) => void;
  isMe: boolean;
}) {
  const [open, setOpen] = useState(isMe);

  return (
    <div className="border-b border-wire/50">
      <button
        onClick={() => setOpen(v => !v)}
        className="flex w-full items-center justify-between gap-4 py-4 text-left"
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="shrink-0 text-[0.62rem] font-bold uppercase tracking-[0.22em] text-light">
            {guest.guestName}
          </span>
          {isMe && (
            <span className="shrink-0 border border-glow/30 px-2 py-0.5 text-[0.5rem] font-bold uppercase tracking-[0.18em] text-glow">
              Yo
            </span>
          )}
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <span className="font-serif text-[0.9rem] text-light/70">
            ${guest.subtotal.toLocaleString("es-MX")}
          </span>
          <svg
            viewBox="0 0 16 16" fill="none" className="h-3 w-3 text-dim/40 transition-transform duration-150"
            style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
            aria-hidden="true"
          >
            <path d="M3 6l5 5 5-5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </button>

      {open && (
        <div className="pb-4" style={{ animation: "fade-in 0.15s ease-out both" }}>
          {guest.items.map(item => {
            const checked = selected.has(item.lineItemId);
            return (
              <label
                key={item.lineItemId}
                className="flex cursor-pointer items-start gap-3 py-2.5 px-1 transition-colors hover:bg-white/[0.02]"
              >
                <div className={[
                  "mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
                  checked ? "border-glow bg-glow/20" : "border-wire",
                ].join(" ")}>
                  {checked && (
                    <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
                      <path d="M1.5 5l2.5 2.5 4.5-4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" className="text-glow" />
                    </svg>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[0.8rem] font-medium text-light leading-snug">{item.name}</p>
                  <p className="mt-0.5 text-[0.63rem] text-dim">
                    {item.qty}× · ${item.subtotal.toLocaleString("es-MX")}
                  </p>
                </div>
                <input
                  type="checkbox"
                  checked={checked}
                  onChange={() => onToggle(item.lineItemId)}
                  className="sr-only"
                />
              </label>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Mode: Mine ──────────────────────────────────────────────────────────────

function MineMode({
  guestName,
  guests,
  tipRate,
  onTipChange,
  onPay,
  isPending,
}: {
  guestName: string;
  guests: GuestBill[];
  tipRate: TipRate;
  onTipChange: (r: TipRate) => void;
  onPay: (amount: number, selectedIds: string[]) => void;
  isPending: boolean;
}) {
  // Pre-seleccionar todos mis ítems; otros pueden agregarse manualmente
  const myGuest = guests.find(g => g.guestName === guestName);
  const myIds = new Set(myGuest?.items.map(i => i.lineItemId) ?? []);
  const [selected, setSelected] = useState<Set<string>>(new Set(myIds));

  function toggle(id: string) {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  // Calcular subtotal de ítems seleccionados
  const allItems = guests.flatMap(g => g.items);
  const subtotal = allItems
    .filter(i => selected.has(i.lineItemId))
    .reduce((s, i) => s + i.subtotal, 0);

  const tip   = Math.round(subtotal * tipRate);
  const total = subtotal + tip;

  const othersGuests = guests.filter(g => g.guestName !== guestName);

  return (
    <>
      {/* Mi consumo */}
      <div className="border-b border-wire pb-1 pt-8">
        <p className="mb-3 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">Mi consumo</p>
        {myGuest ? (
          <GuestItemList guest={myGuest} selected={selected} onToggle={toggle} isMe />
        ) : (
          <p className="py-4 text-[0.75rem] font-medium text-dim/60">
            Aún no has pedido nada.
          </p>
        )}
      </div>

      {/* Consumo de otros */}
      {othersGuests.length > 0 && (
        <div className="border-b border-wire pb-1 pt-8">
          <p className="mb-1 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">
            Cubrir a alguien más
          </p>
          <p className="mb-3 text-[0.63rem] text-dim/60">
            Selecciona ítems de otros comensales para incluirlos en tu pago.
          </p>
          {othersGuests.map(g => (
            <GuestItemList key={g.guestName} guest={g} selected={selected} onToggle={toggle} isMe={false} />
          ))}
        </div>
      )}

      {/* Resumen */}
      {subtotal > 0 && (
        <div className="pt-7">
          <div className="divide-y divide-wire/30">
            <div className="flex items-baseline justify-between py-2.5">
              <span className="text-[0.75rem] font-medium text-dim">Subtotal</span>
              <span className="font-serif text-[0.9rem] text-light">${subtotal.toLocaleString("es-MX")}</span>
            </div>
            {tip > 0 && (
              <div className="flex items-baseline justify-between py-2.5">
                <span className="text-[0.75rem] font-medium text-dim">Propina ({Math.round(tipRate * 100)}%)</span>
                <span className="font-serif text-[0.9rem] text-light">${tip.toLocaleString("es-MX")}</span>
              </div>
            )}
          </div>
          <div className="mt-4 border-t-2 border-glow pt-5">
            <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Total a pagar</p>
            <p className="mt-2 font-serif font-semibold leading-none text-glow" style={{ fontSize: "clamp(2.8rem,9vw,4.2rem)" }}>
              ${total.toLocaleString("es-MX")}
            </p>
          </div>
        </div>
      )}

      <TipSelector value={tipRate} onChange={onTipChange} />
      <PayButton amount={total} disabled={isPending} onClick={() => onPay(total, Array.from(selected))} />
    </>
  );
}

// ─── Mode: Equal ─────────────────────────────────────────────────────────────

function EqualMode({
  tableTotal,
  partySize,
  tipRate,
  onTipChange,
  onPay,
  isPending,
}: {
  tableTotal: number;
  partySize: number;
  tipRate: TipRate;
  onTipChange: (r: TipRate) => void;
  onPay: (amount: number) => void;
  isPending: boolean;
}) {
  const [splitCount, setSplitCount] = useState(partySize);
  const tip       = Math.round(tableTotal * tipRate);
  const total     = tableTotal + tip;
  const perPerson = Math.ceil(total / splitCount);

  return (
    <>
      <div className="pt-8">
        <p className="mb-5 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">¿Entre cuántas personas?</p>
        <div className="flex items-center border border-wire/50">
          <button
            onClick={() => setSplitCount(p => Math.max(1, p - 1))}
            disabled={splitCount <= 1}
            aria-label="Restar persona"
            className="flex h-12 w-12 shrink-0 items-center justify-center text-dim transition-colors hover:text-light disabled:opacity-20"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
          <span className="flex-1 text-center font-serif text-[2rem] font-semibold tabular-nums text-light">
            {splitCount}
          </span>
          <button
            onClick={() => setSplitCount(p => Math.min(20, p + 1))}
            disabled={splitCount >= 20}
            aria-label="Agregar persona"
            className="flex h-12 w-12 shrink-0 items-center justify-center text-dim transition-colors hover:text-light disabled:opacity-20"
          >
            <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="mt-8 border-t-2 border-glow pt-5">
          <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Tu parte</p>
          <p className="mt-2 font-serif font-semibold leading-none text-glow" style={{ fontSize: "clamp(2.8rem,9vw,4.2rem)" }}>
            ${perPerson.toLocaleString("es-MX")}
          </p>
          <p className="mt-2 text-[0.68rem] font-medium text-dim">
            ${total.toLocaleString("es-MX")} ÷ {splitCount} persona{splitCount !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      <TipSelector value={tipRate} onChange={onTipChange} />
      <PayButton amount={perPerson} disabled={isPending} onClick={() => onPay(perPerson)} />
    </>
  );
}

// ─── Mode: Shared pool ───────────────────────────────────────────────────────

function SharedMode({
  guests,
  tableTotal,
  tipRate,
  onTipChange,
  onPay,
  isPending,
}: {
  guests: GuestBill[];
  tableTotal: number;
  tipRate: TipRate;
  onTipChange: (r: TipRate) => void;
  onPay: (amount: number) => void;
  isPending: boolean;
}) {
  const tip   = Math.round(tableTotal * tipRate);
  const total = tableTotal + tip;

  // Modo de contribución: "equal" = entre N personas, "fixed" = monto específico
  const [contribMode, setContribMode] = useState<"equal" | "fixed">("equal");
  const [splitCount, setSplitCount]   = useState(Math.max(2, guests.length));
  const [fixedInput, setFixedInput]   = useState("");

  const perPerson = Math.ceil(total / splitCount);
  const fixedAmount = Math.max(0, Number(fixedInput.replace(/[^0-9.]/g, "")) || 0);
  const myAmount = contribMode === "equal" ? perPerson : fixedAmount;

  const remaining = total - myAmount;

  return (
    <>
      {/* Resumen total de mesa */}
      <div className="border-b border-wire pt-8 pb-7">
        <p className="mb-4 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">Consumo total de la mesa</p>
        <div className="divide-y divide-wire/30">
          {guests.map(g => (
            <div key={g.guestName} className="flex items-baseline justify-between py-2.5">
              <span className="text-[0.78rem] font-medium text-dim">{g.guestName}</span>
              <span className="font-serif text-[0.88rem] text-light/70">${g.subtotal.toLocaleString("es-MX")}</span>
            </div>
          ))}
          {tip > 0 && (
            <div className="flex items-baseline justify-between py-2.5">
              <span className="text-[0.78rem] font-medium text-dim">Propina ({Math.round(tipRate * 100)}%)</span>
              <span className="font-serif text-[0.88rem] text-light/70">${tip.toLocaleString("es-MX")}</span>
            </div>
          )}
        </div>
        <div className="mt-4 flex items-baseline justify-between">
          <span className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-dim">Total</span>
          <span className="font-serif text-[1.6rem] font-semibold text-glow">${total.toLocaleString("es-MX")}</span>
        </div>
      </div>

      {/* Cómo quieres cooperar */}
      <div className="pt-8">
        <p className="mb-4 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">¿Cómo quieres cooperar?</p>

        <div className="flex border-b border-wire/60">
          {(["equal", "fixed"] as const).map(m => (
            <button
              key={m}
              onClick={() => setContribMode(m)}
              className={[
                "flex-1 pb-3 pt-2.5 text-[0.62rem] font-bold uppercase tracking-[0.22em] transition-colors",
                contribMode === m ? "border-b-[1.5px] border-glow text-glow" : "text-dim hover:text-light",
              ].join(" ")}
            >
              {m === "equal" ? "Partes iguales" : "Monto específico"}
            </button>
          ))}
        </div>

        {contribMode === "equal" && (
          <div className="mt-6">
            <p className="mb-3 text-[0.63rem] font-medium text-dim/70">
              Divide la cuenta completa entre los que quieran cooperar.
            </p>
            <div className="flex items-center border border-wire/50">
              <button
                onClick={() => setSplitCount(p => Math.max(1, p - 1))}
                disabled={splitCount <= 1}
                className="flex h-12 w-12 shrink-0 items-center justify-center text-dim hover:text-light disabled:opacity-20"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
              <span className="flex-1 text-center font-serif text-[2rem] font-semibold text-light tabular-nums">
                {splitCount}
              </span>
              <button
                onClick={() => setSplitCount(p => Math.min(20, p + 1))}
                disabled={splitCount >= 20}
                className="flex h-12 w-12 shrink-0 items-center justify-center text-dim hover:text-light disabled:opacity-20"
              >
                <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                  <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </button>
            </div>
            <p className="mt-2 text-center text-[0.63rem] text-dim/60">personas cooperando</p>
          </div>
        )}

        {contribMode === "fixed" && (
          <div className="mt-6">
            <p className="mb-3 text-[0.63rem] font-medium text-dim/70">
              Ingresa cuánto quieres poner de tu parte.
            </p>
            <div className="flex items-center border border-wire/60 focus-within:border-glow/60 transition-colors">
              <span className="pl-4 font-serif text-[1.2rem] text-dim">$</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                value={fixedInput}
                onChange={e => setFixedInput(e.target.value)}
                placeholder="0"
                className="flex-1 bg-transparent py-3 pl-2 pr-4 font-serif text-[1.4rem] text-light outline-none placeholder:text-dim/30"
              />
            </div>
            {fixedAmount > 0 && fixedAmount < total && (
              <p className="mt-2 text-[0.63rem] text-dim/60">
                Quedan ${remaining.toLocaleString("es-MX")} por cubrir entre los demás.
              </p>
            )}
            {fixedAmount >= total && (
              <p className="mt-2 text-[0.63rem] text-sage-deep/80">
                Cubres la cuenta completa de la mesa.
              </p>
            )}
          </div>
        )}

        {/* Mi contribución */}
        {myAmount > 0 && (
          <div className="mt-8 border-t-2 border-glow pt-5">
            <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Mi aportación</p>
            <p className="mt-2 font-serif font-semibold leading-none text-glow" style={{ fontSize: "clamp(2.8rem,9vw,4.2rem)" }}>
              ${myAmount.toLocaleString("es-MX")}
            </p>
            {contribMode === "equal" && (
              <p className="mt-2 text-[0.68rem] font-medium text-dim">
                ${total.toLocaleString("es-MX")} ÷ {splitCount} persona{splitCount !== 1 ? "s" : ""}
              </p>
            )}
          </div>
        )}
      </div>

      <TipSelector value={tipRate} onChange={onTipChange} />
      <PayButton amount={myAmount} disabled={isPending} onClick={() => onPay(myAmount)} />
    </>
  );
}

// ─── SplitBillScreen ─────────────────────────────────────────────────────────

interface SplitBillScreenProps {
  tableCode: string;
  guestName: string;
  partySize: number;
  initialBill: TableBill;
}

export function SplitBillScreen({ tableCode, guestName, partySize, initialBill }: SplitBillScreenProps) {
  const { guests, tableTotal } = initialBill;

  const [mode, setMode]             = useState<Mode>("mine");
  const [tipRate, setTipRate]       = useState<TipRate>(0.15);
  const [confirmed, setConfirmed]   = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isPending, startTransition] = useTransition();
  const [error, setError]           = useState<string | null>(null);

  function handlePay(amount: number, _selectedIds?: string[]) {
    startTransition(async () => {
      try {
        setError(null);
        await payGuestShare({
          tableCode,
          guestName,
          amountPaid: amount,
          tipRate,
          paymentMethod: "CARD",
        });
        setPaidAmount(amount);
        setConfirmed(true);
      } catch (err) {
        console.error(err);
        setError("No se pudo registrar el pago. Intenta de nuevo.");
        setTimeout(() => setError(null), 4000);
      }
    });
  }

  if (confirmed) {
    return <ConfirmedView tableCode={tableCode} guestName={guestName} amount={paidAmount} />;
  }

  const MODES: { id: Mode; label: string }[] = [
    { id: "mine",   label: "Mi cuenta" },
    { id: "equal",  label: "Por igual" },
    { id: "shared", label: "Cooperar" },
  ];

  return (
    <div className="relative min-h-screen">

      {/* Error toast */}
      {error && (
        <div
          className="fixed inset-x-0 top-4 z-50 flex justify-center px-4"
          style={{ animation: "fade-in 0.2s ease-out both" }}
          role="alert"
        >
          <div className="flex items-center gap-3 border border-red-500/40 bg-ink px-5 py-3 shadow-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-red-500" aria-hidden="true" />
            <p className="text-[0.72rem] font-bold uppercase tracking-[0.22em] text-red-400">{error}</p>
          </div>
        </div>
      )}

      {/* ── TOP BAR ──────────────────────────────────────────────────── */}
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

      {/* ── BODY ─────────────────────────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-6 pb-8 lg:px-10">

        {/* Heading */}
        <div className="border-b border-wire pb-7 pt-10">
          <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Pago de mesa</p>
          <h1 className="mt-3 font-serif text-[clamp(2.2rem,6vw,3.2rem)] font-medium leading-[0.9] tracking-[-0.02em] text-light">
            La cuenta
          </h1>
          <p className="mt-3 text-[0.75rem] font-medium text-dim">
            {guestName} · Mesa {tableCode} · {partySize} comensal{partySize !== 1 ? "es" : ""}
          </p>

          {/* Total de mesa */}
          <div className="mt-5 flex items-baseline gap-3">
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.3em] text-dim">Total mesa</span>
            <span className="font-serif text-[1.4rem] font-semibold text-light">
              ${tableTotal.toLocaleString("es-MX")}
            </span>
          </div>
        </div>

        {/* Mode tabs */}
        <div className="flex border-b border-wire" role="tablist">
          {MODES.map(m => (
            <button
              key={m.id}
              role="tab"
              aria-selected={mode === m.id}
              onClick={() => setMode(m.id)}
              className={[
                "flex-1 pb-4 pt-3.5 text-[0.61rem] font-bold uppercase tracking-[0.22em] transition-colors duration-150",
                mode === m.id ? "border-b-[1.5px] border-glow text-glow" : "text-dim hover:text-light",
              ].join(" ")}
            >
              {m.label}
            </button>
          ))}
        </div>

        {/* Mode content */}
        {mode === "mine" && (
          <MineMode
            guestName={guestName}
            guests={guests}
            tipRate={tipRate}
            onTipChange={setTipRate}
            onPay={handlePay}
            isPending={isPending}
          />
        )}
        {mode === "equal" && (
          <EqualMode
            tableTotal={tableTotal}
            partySize={partySize}
            tipRate={tipRate}
            onTipChange={setTipRate}
            onPay={(amount) => handlePay(amount)}
            isPending={isPending}
          />
        )}
        {mode === "shared" && (
          <SharedMode
            guests={guests}
            tableTotal={tableTotal}
            tipRate={tipRate}
            onTipChange={setTipRate}
            onPay={(amount) => handlePay(amount)}
            isPending={isPending}
          />
        )}

      </div>
    </div>
  );
}
