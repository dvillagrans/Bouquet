"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { payGuestShare } from "@/actions/comensal";
import { GuestMenuThemeToggle } from "@/components/guest/GuestMenuThemeToggle";
import { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";

// ─── Constants ───────────────────────────────────────────────────────────────

const TIP_OPTIONS = [
 { label: "Sin propina", rate: 0 },
 { label: "10%", rate: 0.10 },
 { label: "15%", rate: 0.15 },
 { label: "18%", rate: 0.18 },
] as const;

type TipRate = 0 | 0.10 | 0.15 | 0.18;

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

interface SharedItem {
  orderItemId: string;
  name: string;
  qty: number;
  price: number;
  total: number;
  paid: number;
  remaining: number;
  orderedBy: string;
}

interface SplitBillScreenProps {
 tableCode: string;
 guestName: string;
 partySize: number;
 initialBill: {
   guests: GuestBill[];
   sharedItems: SharedItem[];
   total: number;
   guestCount: number;
 };
}

function MiniStepper({
  value,
  onChange,
  max,
}: {
  value: number;
  onChange: (v: number) => void;
  max: number;
}) {
  const isMin = value <= 0;
  const isMax = value >= max;
  return (
    <div className="flex h-8 items-center gap-1 rounded-full border border-slate-200 bg-white/60 p-1 guest-dark:border-wire/55 guest-dark:bg-panel/40">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 50))}
        disabled={isMin}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-slate-100 text-slate-500 transition-colors hover:bg-slate-200 hover:text-slate-700 disabled:opacity-40 guest-dark:bg-wire/30 guest-dark:text-dim guest-dark:hover:bg-wire/60 guest-dark:hover:text-light"
      >
        <span className="text-sm leading-none mt-[-2px]">-</span>
      </button>
      <div className="flex-1 px-1 text-center font-mono text-[0.7rem] font-bold tracking-tight text-slate-800 guest-dark:text-light/90">
        ${value.toLocaleString("es-MX")}
      </div>
      <button
        type="button"
        onClick={() => onChange(Math.min(max, value + 50))}
        disabled={isMax}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gold/15 text-gold transition-colors hover:bg-gold/25 disabled:opacity-40 guest-dark:bg-gold/20 guest-dark:hover:bg-gold/30"
      >
        <span className="text-sm leading-none mt-[-1px]">+</span>
      </button>
      <button
        type="button"
        onClick={() => onChange(max)}
        disabled={isMax}
        className="ml-1 mr-1 text-[10px] font-bold uppercase text-gold/80 hover:text-gold disabled:opacity-0"
      >
        MAX
      </button>
    </div>
  );
}

function ProgressLine({ paid, active, total }: { paid: number; active: number; total: number }) {
  const p1 = Math.min(100, Math.max(0, (paid / total) * 100));
  const p2 = Math.min(100 - p1, Math.max(0, (active / total) * 100));
  
  return (
    <div className="h-1.5 w-full flex overflow-hidden rounded-full bg-slate-200/60 guest-dark:bg-wire/40">
      <div className="bg-emerald-500/60 transition-all duration-300 guest-dark:bg-emerald-500/40" style={{ width: `${p1}%` }} />
      <div className="bg-gold transition-all duration-300 guest-dark:bg-gold/80" style={{ width: `${p2}%` }} />
    </div>
  );
}

// ─── ConfirmedView ───────────────────────────────────────────────────────────

function ConfirmedView({ tableCode, guestName, amount }: { tableCode: string; guestName: string; amount: number }) {
  return (
    <div className="guest-menu-vt-root relative flex min-h-screen flex-col items-center justify-center bg-[var(--guest-bg-page,#faf8f5)] px-6 text-center text-[var(--guest-text,#0f172a)]">
      <p className="font-sans text-[1.1rem] font-semibold italic tracking-tight text-gold/60 guest-dark:text-gold/50" style={{ animation: "fade-in 0.5s ease-out 0.1s both" }}>
        bouquet
      </p>
      <div className="mt-16" style={{ animation: "reveal-scale 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}>
        <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-slate-400 guest-dark:text-dim">Tu parte</p>
        <p className="mt-3 font-mono font-semibold leading-none text-gold guest-dark:text-gold/70" style={{ fontSize: "clamp(4rem,12vw,6rem)" }}>
          ${amount.toLocaleString("es-MX")}
        </p>
        <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-slate-500 guest-dark:text-dim/80">
          Pago registrado ✓
        </p>
      </div>
      <div className="mx-auto mt-14 h-px w-10 bg-slate-300/80 guest-dark:bg-wire/40" style={{ animation: "fade-in 0.4s ease-out 0.5s both" }}/>
      <div className="mt-14" style={{ animation: "fade-in 0.5s ease-out 0.55s both" }}>
        <h1 className="font-sans text-[clamp(2rem,6vw,2.8rem)] font-medium leading-[0.95] tracking-[-0.02em] text-slate-900 guest-dark:text-light">Gracias, {guestName}.</h1>
        <p className="mt-4 text-[0.78rem] font-medium leading-relaxed text-slate-600 guest-dark:text-dim">Fue un placer tenerte en la mesa.</p>
        <Link href={`/mesa/${encodeURIComponent(tableCode)}/menu`} className="mt-10 inline-flex h-10 items-center justify-center rounded-full bg-text-primary px-8 text-[0.65rem] font-bold uppercase tracking-widest text-bg-solid transition-colors hover:bg-text-primary/90 guest-dark:bg-gold/45 guest-dark:text-[var(--color-charcoal)] guest-dark:hover:bg-gold/55">
          Volver al menú
        </Link>
      </div>
    </div>
  );
}

// ─── SplitBillScreen ─────────────────────────────────────────────────────────

export function SplitBillScreen({ tableCode, guestName, partySize, initialBill }: SplitBillScreenProps) {
  const { menuTheme, changeGuestMenuTheme } = useGuestMenuTheme();
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!payError) return;
    const t = setTimeout(() => setPayError(null), 4500);
    return () => clearTimeout(t);
  }, [payError]);

  const myGuest = initialBill.guests.find(g => g.guestName === guestName);
  const displayTableCode = tableCode.trim().toUpperCase();

  const [tipRate, setTipRate] = useState<TipRate>(0.15);
  const [confirmed, setConfirmed] = useState(false);
  const [paidAmount, setPaidAmount] = useState(0);
  const [isPending, startTransition] = useTransition();

  // Initialize shared item contributions: active remaining split by party size
  const [allocations, setAllocations] = useState<Record<string, number>>(() => {
    const initial: Record<string, number> = {};
    initialBill.sharedItems.forEach((item) => {
      // partySize at table, OR initialBill.guestCount, avoiding div by 0
      const activeCount = Math.max(1, initialBill.guestCount);
      const perGuest = Math.ceil(item.remaining / activeCount);
      initial[item.orderItemId] = Math.min(perGuest, item.remaining);
    });
    return initial;
  });

  const myBase = myGuest?.subtotal ?? 0;
  const sharedBase = Object.values(allocations).reduce((s, a) => s + (a || 0), 0);
  
  const ownSubtotal = myBase + sharedBase;
  const ownTip = Math.round(ownSubtotal * tipRate);
  const myShare = ownSubtotal + ownTip;

  function handlePay() {
    startTransition(async () => {
      try {
        await payGuestShare({
          tableCode,
          guestName,
          amountPaid: myShare,
          tipRate,
          paymentMethod: "CARD",
          allocations: Object.entries(allocations).map(([id, amount]) => ({
            orderItemId: id,
            amount
          })).filter(a => a.amount > 0)
        });
        setPaidAmount(myShare);
        setConfirmed(true);
      } catch (err) {
        console.error(err);
        setPayError((err as Error).message ?? "No se pudo registrar el pago. Intenta de nuevo.");
      }
    });
  }

  if (confirmed) {
    return <ConfirmedView tableCode={tableCode} guestName={guestName} amount={paidAmount} />;
  }

  const canPay = myShare > 0;
  const menuHref = `/mesa/${encodeURIComponent(tableCode)}/menu`;

  return (
    <div className="guest-menu-vt-root flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[var(--guest-bg-page,#faf8f5)] text-[var(--guest-text,#0f172a)]">
      {payError && (
        <div className="fixed inset-x-0 top-8 z-[90] flex justify-center px-4">
          <div role="alert" className="flex max-w-lg items-center gap-3 rounded-xl border border-red-400/45 bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md guest-dark:border-red-500/35 guest-dark:bg-panel/95">
            <p className="flex-1 text-[0.65rem] font-semibold uppercase tracking-wide text-red-700 guest-dark:text-red-300">{payError}</p>
            <button onClick={() => setPayError(null)} className="text-[0.65rem] font-bold uppercase text-red-600/70 hover:text-red-700">Cerrar</button>
          </div>
        </div>
      )}

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="mx-auto max-w-7xl px-8 pb-12 pt-6 lg:px-12">
            
            {/* Header */}
            <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-slate-200 pb-4 pt-1 guest-dark:border-wire/50">
              <div className="min-w-0 flex-1">
                <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-400 guest-dark:text-dim">Cuenta</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-800 guest-dark:text-light">
                  <span className="max-w-[min(100%,18rem)] truncate font-semibold">{guestName}</span>
                  <span className="text-[0.65rem] font-normal text-slate-500">Mesa {displayTableCode}</span>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link href={menuHref} className="flex h-8 items-center justify-center rounded-full bg-text-primary px-5 text-[0.65rem] font-bold uppercase tracking-widest text-bg-solid transition-colors hover:bg-text-primary/90">
                  Menú
                </Link>
                <GuestMenuThemeToggle mode={menuTheme} onChange={changeGuestMenuTheme} className="size-8" />
              </div>
            </div>

            {/* Title block */}
            <div className="border-b border-slate-200 pb-8 pt-10 guest-dark:border-wire/45">
              <h1 className="font-serif text-[clamp(2rem,6vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-slate-900 guest-dark:text-light">Tu cuenta</h1>
              <p className="mt-3 max-w-lg text-[0.68rem] font-medium leading-relaxed text-slate-600 guest-dark:text-dim/90">
                Ajusta las aportaciones de órdenes compartidas, elige tu propina y confirma tu parte.
              </p>
            </div>

            {/* TIP_OPTIONS */}
            <div className="border-b border-slate-200 py-8 guest-dark:border-wire/45">
              <p className="mb-5 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-slate-400 guest-dark:text-dim">Propina</p>
              <div className="flex flex-wrap gap-3">
                {TIP_OPTIONS.map(({ label, rate }) => (
                  <button
                    key={rate}
                    type="button"
                    onClick={() => setTipRate(rate as TipRate)}
                    className={[
                      "min-h-[44px] rounded-xl px-5 py-2.5 text-[0.65rem] font-bold uppercase tracking-[0.22em] transition-colors duration-150",
                      tipRate === rate
                        ? "border border-gold/50 bg-glow text-ink shadow-sm guest-dark:border-gold/40"
                        : "border border-slate-200/90 bg-white/70 text-slate-600 hover:border-slate-300 hover:text-slate-900 guest-dark:border-wire/50 guest-dark:bg-panel/50 guest-dark:text-dim"
                    ].join(" ")}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="py-8">
              {/* Individual Items */}
              <p className="mb-4 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-slate-400 guest-dark:text-dim">Tus artículos</p>
              {myGuest && myGuest.items.length > 0 ? (
                <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md guest-dark:border-wire/45 guest-dark:bg-panel/55">
                  <div className="flex flex-col gap-2">
                    {myGuest.items.map((item) => (
                      <div key={item.key} className="flex items-center justify-between gap-3 py-1">
                        <span className="truncate text-[0.72rem] font-medium text-slate-900 guest-dark:text-light">
                          {item.qty}× {item.name}
                        </span>
                        <span className="shrink-0 font-mono text-[0.8rem] text-slate-700 guest-dark:text-light/80">
                          ${(item.price * item.qty).toLocaleString("es-MX")}
                        </span>
                      </div>
                    ))}
                    <div className="mt-2 flex justify-end border-t border-slate-200/80 pt-3 guest-dark:border-wire/40">
                      <span className="text-[0.65rem] font-semibold text-slate-600 guest-dark:text-dim">
                        ${myBase.toLocaleString("es-MX")}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="mb-8 text-[0.72rem] text-slate-500/70 guest-dark:text-dim/60">No ordenaste artículos individuales.</p>
              )}

              {/* Shared Items */}
              {initialBill.sharedItems.length > 0 && (
                <div className="mt-10">
                  <p className="mb-4 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-slate-400 guest-dark:text-dim">Órdenes Compartidas</p>
                  <div className="flex flex-col gap-4">
                    {initialBill.sharedItems.map(item => {
                      const amount = allocations[item.orderItemId] || 0;
                      return (
                        <div key={item.orderItemId} className="rounded-2xl border border-slate-200/50 bg-white/60 p-5 shadow-sm guest-dark:border-wire/40 guest-dark:bg-panel/40">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <div>
                              <p className="text-[0.72rem] font-medium text-slate-900 guest-dark:text-light">
                                {item.qty}× {item.name}
                              </p>
                              <p className="text-[0.6rem] uppercase tracking-wide text-slate-500">Ordenado por {item.orderedBy}</p>
                            </div>
                            <span className="shrink-0 font-mono text-[0.8rem] text-slate-700 guest-dark:text-light/80">
                              Total ${item.total.toLocaleString("es-MX")}
                            </span>
                          </div>
                          
                          <div className="my-4">
                            <ProgressLine paid={item.paid} active={amount} total={item.total} />
                            <div className="mt-2 flex justify-between text-[0.65rem] font-medium text-slate-500">
                              <span>Abonado: ${item.paid.toLocaleString("es-MX")}</span>
                              <span className="text-[var(--guest-gold)]">Restante: ${item.remaining.toLocaleString("es-MX")}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-between border-t border-slate-200/80 pt-4 guest-dark:border-wire/40">
                            <span className="text-[0.65rem] font-bold uppercase tracking-wider text-slate-700 guest-dark:text-light/90">Tu Aportación</span>
                            <MiniStepper 
                              value={amount} 
                              max={item.remaining} 
                              onChange={(v) => {
                                setAllocations(prev => ({ ...prev, [item.orderItemId]: v }));
                              }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <footer className="shrink-0 border-t border-slate-200 bg-white/40 px-8 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm lg:px-12 guest-dark:border-wire/60 guest-dark:bg-panel/85">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.3em] text-slate-500 guest-dark:text-dim">
                Total a Pagar
              </span>
              <span className="font-mono text-[1.6rem] font-semibold leading-none text-gold guest-dark:text-gold/75">
                ${myShare.toLocaleString("es-MX")}
              </span>
            </div>
            <button
              type="button"
              onClick={handlePay}
              disabled={isPending || !canPay}
              className="flex w-full items-center justify-center rounded-xl bg-gold/50 px-5 py-4 text-[0.7rem] font-bold uppercase tracking-[0.22em] text-white shadow-[0_8px_24px_rgba(16,185,129,0.35)] transition-all hover:brightness-105 active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold/50 disabled:cursor-not-allowed disabled:opacity-45 disabled:shadow-none disabled:hover:brightness-100 disabled:active:scale-100 guest-dark:shadow-[0_8px_28px_rgba(201,160,84,0.25)]"
            >
              {isPending ? "Registrando…" : `Pagar $${myShare.toLocaleString("es-MX")}`}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}
