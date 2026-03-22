"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { payGuestShare } from "@/actions/comensal";

// ─── Constants ───────────────────────────────────────────────────────────────

const TIP_OPTIONS = [
  { label: "Sin propina", rate: 0 },
  { label: "10%",         rate: 0.10 },
  { label: "15%",         rate: 0.15 },
  { label: "18%",         rate: 0.18 },
] as const;

type TipRate = 0 | 0.10 | 0.15 | 0.18;
type SplitMode = "own" | "equal" | "shared";

// ─── Types ───────────────────────────────────────────────────────────────────

interface GuestItem {
  key: string;
  menuItemId: string;
  name: string;
  qty: number;
  price: number;
}

interface GuestBill {
  sessionId: string;
  guestName: string;
  items: GuestItem[];
  subtotal: number;
}

interface SplitBillScreenProps {
  tableCode: string;
  guestName: string;
  partySize: number;
  initialBill: {
    guests: GuestBill[];
    total: number;
    guestCount: number;
  };
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5 text-glow" aria-hidden="true">
      <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={[
        "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
        checked ? "border-glow/50 bg-glow/10" : "border-wire",
      ].join(" ")}
      aria-hidden="true"
    >
      {checked && <CheckIcon />}
    </div>
  );
}

function MiniStepper({
  value,
  onChange,
  min = 1,
  max = 20,
}: {
  value: number;
  onChange: (v: number) => void;
  min?: number;
  max?: number;
}) {
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className="flex h-6 w-6 items-center justify-center border border-wire text-dim hover:border-light/20 hover:text-light disabled:opacity-20"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
          <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      <span className="w-6 text-center font-serif text-[0.9rem] font-semibold tabular-nums text-light">
        {value}
      </span>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className="flex h-6 w-6 items-center justify-center border border-wire text-dim hover:border-light/20 hover:text-light disabled:opacity-20"
      >
        <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
          <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
    </div>
  );
}

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
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">

      {/* Marca / wordmark */}
      <p
        className="font-serif text-[1.1rem] font-semibold italic tracking-tight text-glow/60"
        style={{ animation: "fade-in 0.5s ease-out 0.1s both" }}
      >
        bouquet
      </p>

      {/* Importe pagado */}
      <div
        className="mt-16"
        style={{ animation: "reveal-scale 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}
      >
        <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim/50">
          Tu parte
        </p>
        <p
          className="mt-3 font-serif font-semibold leading-none text-glow"
          style={{ fontSize: "clamp(4rem,12vw,6rem)" }}
        >
          ${amount.toLocaleString("es-MX")}
        </p>
        <p className="mt-3 text-[0.65rem] font-medium text-dim/40 uppercase tracking-[0.2em]">
          Pago registrado ✓
        </p>
      </div>

      {/* Divisor */}
      <div
        className="mx-auto mt-14 h-px w-10 bg-wire/40"
        style={{ animation: "fade-in 0.4s ease-out 0.5s both" }}
      />

      {/* Mensaje de despedida */}
      <div
        className="mt-14"
        style={{ animation: "fade-in 0.5s ease-out 0.55s both" }}
      >
        <h1 className="font-serif text-[clamp(2rem,6vw,2.8rem)] font-medium leading-[0.95] tracking-[-0.02em] text-light">
          Gracias, {guestName}.
        </h1>
        <p className="mt-4 text-[0.78rem] font-medium leading-relaxed text-dim/55">
          Fue un placer tenerte en la mesa.<br />Esperamos verte pronto.
        </p>
        <Link
          href={`/mesa/${encodeURIComponent(tableCode)}/menu?guest=${encodeURIComponent(guestName)}`}
          className="mt-10 inline-block border border-wire px-8 py-3 text-[0.65rem] font-bold uppercase tracking-[0.26em] text-dim transition-colors hover:border-light/20 hover:text-light"
        >
          Volver al menú
        </Link>
      </div>

      {/* Pie */}
      <p
        className="absolute bottom-10 text-[0.56rem] font-medium uppercase tracking-[0.3em] text-dim/20"
        style={{ animation: "fade-in 0.4s ease-out 0.9s both" }}
      >
        bouquet · experiencia de mesa
      </p>
    </div>
  );
}

// ─── SplitBillScreen ─────────────────────────────────────────────────────────

export function SplitBillScreen({
  tableCode,
  guestName,
  partySize,
  initialBill,
}: SplitBillScreenProps) {
  const myGuest     = initialBill.guests.find(g => g.guestName === guestName);
  const otherGuests = initialBill.guests.filter(g => g.guestName !== guestName);
  const allItems    = initialBill.guests.flatMap(g => g.items);
  const grandTotal  = initialBill.total;
  const guestCount  = Math.max(1, initialBill.guestCount);

  const [mode, setMode]         = useState<SplitMode>("own");
  const [tipRate, setTipRate]   = useState<TipRate>(0.15);
  const [confirmed, setConfirmed] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Mode: own — adopted item keys from other guests
  const [adopted, setAdopted] = useState<Set<string>>(new Set());

  // Mode: equal — number of people splitting
  const [splitCount, setSplitCount] = useState(guestCount);

  // Mode: shared — { itemKey: numberOfPeopleSharing }
  const [sharedItems, setSharedItems] = useState<Record<string, number>>({});

  // ── Calculations ────────────────────────────────────────────────────────────

  const grandTip     = Math.round(grandTotal * tipRate);
  const grandWithTip = grandTotal + grandTip;

  // Mode: own
  const myBase = myGuest?.subtotal ?? 0;
  const adoptedBase = [...adopted].reduce((sum, key) => {
    const item = allItems.find(i => i.key === key);
    return item ? sum + item.price * item.qty : sum;
  }, 0);
  const ownSubtotal = myBase + adoptedBase;
  const ownTip      = Math.round(ownSubtotal * tipRate);
  const ownShare    = ownSubtotal + ownTip;

  // Mode: equal
  const perPerson = Math.ceil(grandWithTip / splitCount);

  // Mode: shared
  const sharedBase = Object.entries(sharedItems).reduce((sum, [key, n]) => {
    const item = allItems.find(i => i.key === key);
    if (!item || n < 1) return sum;
    return sum + Math.ceil((item.price * item.qty) / n);
  }, 0);
  const sharedTip   = Math.round(sharedBase * tipRate);
  const sharedShare = sharedBase + sharedTip;

  const myShare =
    mode === "own"    ? ownShare :
    mode === "equal"  ? perPerson :
    sharedShare;

  // ── Pay handler ─────────────────────────────────────────────────────────────

  function handlePay() {
    startTransition(async () => {
      try {
        await payGuestShare({
          tableCode,
          guestName,
          amountPaid: myShare,
          tipRate,
          paymentMethod: "CARD",
        });
        setPaidAmount(myShare);
        setConfirmed(true);
      } catch (err) {
        console.error(err);
        alert("Ocurrió un error al registrar el pago.");
      }
    });
  }

  if (confirmed) {
    return <ConfirmedView tableCode={tableCode} guestName={guestName} amount={paidAmount} />;
  }

  const modeLabel: Record<SplitMode, string> = {
    own:    "Lo mío",
    equal:  "Por igual",
    shared: "Compartir",
  };
  const modeDesc: Record<SplitMode, string> = {
    own:    "Paga lo que pediste, y elige si quieres cubrir algo de otros.",
    equal:  "Divide el total de la mesa entre todos por partes iguales.",
    shared: "Elige artículos específicos y cuántas personas los comparten.",
  };

  const canPay =
    myShare > 0 &&
    (mode !== "shared" || Object.keys(sharedItems).length > 0);

  return (
    <div className="relative min-h-screen">

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
      <div className="mx-auto max-w-2xl px-6 pb-40 lg:px-10">

        {/* Heading */}
        <div className="border-b border-wire pb-8 pt-10">
          <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Pago de mesa</p>
          <h1 className="mt-3 font-serif text-[clamp(2.2rem,6vw,3.2rem)] font-medium leading-[0.9] tracking-[-0.02em] text-light">
            La cuenta
          </h1>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[0.75rem] font-medium text-dim">{guestName} · Mesa {tableCode}</span>
            <span className="text-[0.65rem] text-dim/40">
              {guestCount} comensal{guestCount !== 1 ? "es" : ""} · total ${grandTotal.toLocaleString("es-MX")}
            </span>
          </div>
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
          {grandTip > 0 && (
            <p className="mt-4 text-[0.65rem] text-dim/50">
              ${grandTip.toLocaleString("es-MX")} de propina · total con propina ${grandWithTip.toLocaleString("es-MX")}
            </p>
          )}
        </div>

        {/* ── MODE TABS ────────────────────────────────────────────── */}
        <div className="flex border-b border-wire">
          {(["own", "equal", "shared"] as SplitMode[]).map(m => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className={[
                "flex-1 pb-4 pt-5 text-[0.62rem] font-bold uppercase tracking-[0.2em] transition-colors duration-150",
                mode === m
                  ? "border-b-[1.5px] border-glow text-glow"
                  : "text-dim hover:text-light",
              ].join(" ")}
            >
              {modeLabel[m]}
            </button>
          ))}
        </div>

        <p className="mt-5 text-[0.68rem] text-dim/50">{modeDesc[mode]}</p>

        {/* ── MODE: LO MÍO ─────────────────────────────────────────── */}
        {mode === "own" && (
          <div className="py-6">

            {/* My items */}
            <p className="mb-4 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">
              Tus artículos
            </p>
            {myGuest && myGuest.items.length > 0 ? (
              <div className="flex flex-col gap-2">
                {myGuest.items.map(item => (
                  <div key={item.key} className="flex items-center justify-between gap-3 py-1">
                    <div className="flex min-w-0 items-center gap-3">
                      <Checkbox checked />
                      <span className="truncate text-[0.72rem] font-medium text-light">
                        {item.qty}× {item.name}
                      </span>
                    </div>
                    <span className="shrink-0 font-serif text-[0.8rem] text-light/70">
                      ${(item.price * item.qty).toLocaleString("es-MX")}
                    </span>
                  </div>
                ))}
                <div className="mt-2 flex justify-end border-t border-wire/40 pt-3">
                  <span className="text-[0.65rem] font-semibold text-dim">
                    ${myBase.toLocaleString("es-MX")}
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-[0.72rem] text-dim/40">Aún no has ordenado nada.</p>
            )}

            {/* Other guests */}
            {otherGuests.length > 0 && (
              <div className="mt-8">
                <p className="mb-4 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">
                  Artículos de otros
                </p>
                <div className="flex flex-col gap-6">
                  {otherGuests.map(guest => (
                    <div key={guest.sessionId}>
                      <p className="mb-3 text-[0.65rem] font-semibold text-dim/60">{guest.guestName}</p>
                      <div className="flex flex-col gap-1">
                        {guest.items.map(item => {
                          const isAdopted = adopted.has(item.key);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setAdopted(prev => {
                                  const next = new Set(prev);
                                  if (next.has(item.key)) next.delete(item.key);
                                  else next.add(item.key);
                                  return next;
                                });
                              }}
                              className="flex w-full items-center justify-between gap-3 py-1.5 text-left"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <Checkbox checked={isAdopted} />
                                <span className={["truncate text-[0.72rem] font-medium transition-colors", isAdopted ? "text-light" : "text-dim/55"].join(" ")}>
                                  {item.qty}× {item.name}
                                </span>
                              </div>
                              <span className={["shrink-0 font-serif text-[0.8rem] transition-colors", isAdopted ? "text-light/70" : "text-dim/35"].join(" ")}>
                                ${(item.price * item.qty).toLocaleString("es-MX")}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Own total */}
            <div className="mt-8 border-t-2 border-glow pt-6">
              <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Tu parte</p>
              <p
                className="mt-3 font-serif font-semibold leading-none text-glow"
                style={{ fontSize: "clamp(3rem,10vw,4.5rem)" }}
              >
                ${ownShare.toLocaleString("es-MX")}
              </p>
              <p className="mt-3 text-[0.68rem] text-dim/60">
                ${ownSubtotal.toLocaleString("es-MX")} consumo
                {ownTip > 0 && ` + $${ownTip.toLocaleString("es-MX")} propina`}
              </p>
            </div>
          </div>
        )}

        {/* ── MODE: POR IGUAL ──────────────────────────────────────── */}
        {mode === "equal" && (
          <div className="py-6">
            <p className="mb-5 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-dim">
              ¿Entre cuántas personas?
            </p>
            <div className="flex items-center border-b border-wire/50 pb-8">
              <button
                type="button"
                onClick={() => setSplitCount(prev => Math.max(1, prev - 1))}
                disabled={splitCount <= 1}
                aria-label="Restar persona"
                className="flex h-11 w-11 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light disabled:opacity-20"
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
                onClick={() => setSplitCount(prev => Math.min(20, prev + 1))}
                disabled={splitCount >= 20}
                aria-label="Agregar persona"
                className="flex h-11 w-11 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light disabled:opacity-20"
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
              <p className="mt-3 text-[0.68rem] text-dim/60">
                ${grandWithTip.toLocaleString("es-MX")} ÷ {splitCount} persona{splitCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* ── MODE: COMPARTIR ──────────────────────────────────────── */}
        {mode === "shared" && (
          <div className="py-6">
            <div className="flex flex-col gap-2">
              {initialBill.guests.map(guest => (
                <div key={guest.sessionId} className="mb-4">
                  <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-dim/50">
                    {guest.guestName}
                  </p>
                  <div className="flex flex-col gap-2">
                    {guest.items.map(item => {
                      const isShared = item.key in sharedItems;
                      const n       = sharedItems[item.key] ?? guestCount;
                      const myPart  = isShared ? Math.ceil((item.price * item.qty) / n) : 0;
                      return (
                        <div
                          key={item.key}
                          className={[
                            "border p-3 transition-colors",
                            isShared ? "border-glow/30 bg-glow/5" : "border-wire/60",
                          ].join(" ")}
                        >
                          {/* Item row */}
                          <button
                            type="button"
                            onClick={() => {
                              setSharedItems(prev => {
                                if (item.key in prev) {
                                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
                                  const { [item.key]: _removed, ...rest } = prev;
                                  return rest;
                                }
                                return { ...prev, [item.key]: guestCount };
                              });
                            }}
                            className="flex w-full items-center justify-between gap-3 text-left"
                          >
                            <div className="flex min-w-0 items-center gap-3">
                              <Checkbox checked={isShared} />
                              <span className={["truncate text-[0.72rem] font-medium transition-colors", isShared ? "text-light" : "text-dim/55"].join(" ")}>
                                {item.qty}× {item.name}
                              </span>
                            </div>
                            <span className={["shrink-0 font-serif text-[0.8rem] transition-colors", isShared ? "text-light/70" : "text-dim/35"].join(" ")}>
                              ${(item.price * item.qty).toLocaleString("es-MX")}
                            </span>
                          </button>

                          {/* Split controls (only when selected) */}
                          {isShared && (
                            <div className="mt-3 flex items-center justify-between border-t border-wire/30 pt-3">
                              <div className="flex items-center gap-2">
                                <span className="text-[0.6rem] text-dim/60">Entre</span>
                                <MiniStepper
                                  value={n}
                                  onChange={v => setSharedItems(prev => ({ ...prev, [item.key]: v }))}
                                />
                                <span className="text-[0.6rem] text-dim/60">
                                  persona{n !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <span className="text-[0.68rem] font-semibold text-glow">
                                tu parte ${myPart.toLocaleString("es-MX")}
                              </span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* Shared total */}
            {Object.keys(sharedItems).length > 0 ? (
              <div className="mt-8 border-t-2 border-glow pt-6">
                <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">Tu contribución</p>
                <p
                  className="mt-3 font-serif font-semibold leading-none text-glow"
                  style={{ fontSize: "clamp(3rem,10vw,4.5rem)" }}
                >
                  ${sharedShare.toLocaleString("es-MX")}
                </p>
                <p className="mt-3 text-[0.68rem] text-dim/60">
                  ${sharedBase.toLocaleString("es-MX")} artículos
                  {sharedTip > 0 && ` + $${sharedTip.toLocaleString("es-MX")} propina`}
                </p>
              </div>
            ) : (
              <p className="mt-10 text-center text-[0.68rem] text-dim/35">
                Selecciona al menos un artículo para calcular tu contribución.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── STICKY PAY BAR ───────────────────────────────────────────── */}
      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-wire bg-ink px-6 pb-8 pt-4"
        style={{ paddingBottom: "max(2rem, env(safe-area-inset-bottom, 2rem))" }}
      >
        <div className="mx-auto max-w-2xl">
          <div className="mb-3 flex items-baseline justify-between">
            <span className="text-[0.58rem] font-bold uppercase tracking-[0.3em] text-dim">Tu parte</span>
            <span className="font-serif text-[1.6rem] font-semibold leading-none text-glow">
              ${myShare.toLocaleString("es-MX")}
            </span>
          </div>
          <button
            onClick={handlePay}
            disabled={isPending || !canPay}
            className="w-full bg-glow py-5 text-[0.76rem] font-bold uppercase tracking-[0.22em] text-ink transition-all duration-200 hover:-translate-y-px disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {isPending ? "Registrando…" : `Pagar $${myShare.toLocaleString("es-MX")}`}
          </button>
        </div>
      </div>
    </div>
  );
}
