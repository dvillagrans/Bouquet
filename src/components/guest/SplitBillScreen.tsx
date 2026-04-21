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
 <svg viewBox="0 0 10 10" fill="none" className="h-2.5 w-2.5 text-[var(--guest-accent,#997a3d)]" aria-hidden="true">
 <path d="M1.5 5l2.5 2.5 4.5-5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
 </svg>
 );
}

function Checkbox({ checked }: { checked: boolean }) {
  return (
    <div
      className={[
        "flex h-4 w-4 shrink-0 items-center justify-center border transition-colors",
        checked
          ? "border-gold/70 bg-glow/10 guest-dark:border-gold/50"
          : "border-slate-300 guest-dark:border-wire/55",
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
 className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-600 hover:border-slate-500 hover:text-slate-900 disabled:opacity-20 guest-dark:border-wire/55 guest-dark:text-dim guest-dark:hover:text-light"
 >
 <svg viewBox="0 0 16 16" fill="none" className="h-2.5 w-2.5" aria-hidden="true">
 <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
 </svg>
 </button>
 <span className="w-6 text-center font-mono text-[0.9rem] font-semibold tabular-nums text-slate-900 guest-dark:text-light">
 {value}
 </span>
 <button
 type="button"
 onClick={() => onChange(Math.min(max, value + 1))}
 disabled={value >= max}
 className="flex h-6 w-6 items-center justify-center rounded border border-slate-300 text-slate-600 hover:border-slate-500 hover:text-slate-900 disabled:opacity-20 guest-dark:border-wire/55 guest-dark:text-dim guest-dark:hover:text-light"
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
  const { menuTheme } = useGuestMenuTheme();
  return (
    <div
      className="guest-menu-vt-root relative flex min-h-screen flex-col items-center justify-center bg-[var(--guest-bg-page,#faf8f5)] px-6 text-center text-[var(--guest-text,#0f172a)]"
    >

      {/* Marca / wordmark */}
      <p
        className="font-sans text-[1.1rem] font-semibold italic tracking-tight text-gold/60 guest-dark:text-gold/50"
        style={{ animation: "fade-in 0.5s ease-out 0.1s both" }}
      >
        bouquet
      </p>

      {/* Importe pagado */}
      <div
        className="mt-16"
        style={{ animation: "reveal-scale 0.55s cubic-bezier(0.22,1,0.36,1) 0.2s both" }}
      >
        <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-slate-400 guest-dark:text-dim">
          Tu parte
        </p>
        <p
          className="mt-3 font-mono font-semibold leading-none text-gold guest-dark:text-gold/70"
          style={{ fontSize: "clamp(4rem,12vw,6rem)" }}
        >
          ${amount.toLocaleString("es-MX")}
        </p>
        <p className="mt-3 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-slate-500 guest-dark:text-dim/80">
          Pago registrado ✓
        </p>
      </div>

      <div
        className="mx-auto mt-14 h-px w-10 bg-slate-300/80 guest-dark:bg-wire/40"
        style={{ animation: "fade-in 0.4s ease-out 0.5s both" }}
      />

      <div className="mt-14" style={{ animation: "fade-in 0.5s ease-out 0.55s both" }}>
        <h1 className="font-sans text-[clamp(2rem,6vw,2.8rem)] font-medium leading-[0.95] tracking-[-0.02em] text-slate-900 guest-dark:text-light">
          Gracias, {guestName}.
        </h1>
        <p className="mt-4 text-[0.78rem] font-medium leading-relaxed text-slate-600 guest-dark:text-dim">
          Fue un placer tenerte en la mesa.<br />
          Esperamos verte pronto.
        </p>
        <Link
          href={`/mesa/${encodeURIComponent(tableCode)}/menu`}
          className="mt-10 inline-flex h-10 items-center justify-center rounded-full bg-text-primary px-8 text-[0.65rem] font-bold uppercase tracking-widest text-bg-solid transition-colors hover:bg-text-primary/90 guest-dark:bg-gold/45 guest-dark:text-[var(--color-charcoal)] guest-dark:hover:bg-gold/55"
        >
          Volver al menú
        </Link>
      </div>

      <p
        className="absolute bottom-10 text-[0.56rem] font-medium uppercase tracking-[0.3em] text-slate-400/60 guest-dark:text-dim/50"
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
  partySize: _partySize,
  initialBill,
}: SplitBillScreenProps) {
  const { menuTheme, changeGuestMenuTheme } = useGuestMenuTheme();
  const [payError, setPayError] = useState<string | null>(null);

  useEffect(() => {
    if (!payError) return;
    const t = setTimeout(() => setPayError(null), 4500);
    return () => clearTimeout(t);
  }, [payError]);

 const myGuest = initialBill.guests.find(g => g.guestName === guestName);
 const otherGuests = initialBill.guests.filter(g => g.guestName !== guestName);
 const allItems = initialBill.guests.flatMap(g => g.items);
 const grandTotal = initialBill.total;
 const guestCount = Math.max(1, initialBill.guestCount);
 const displayTableCode = tableCode.trim().toUpperCase();

 const [mode, setMode] = useState<SplitMode>("own");
 const [tipRate, setTipRate] = useState<TipRate>(0.15);
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

 const grandTip = Math.round(grandTotal * tipRate);
 const grandWithTip = grandTotal + grandTip;

 // Mode: own
 const myBase = myGuest?.subtotal ?? 0;
 const adoptedBase = [...adopted].reduce((sum, key) => {
 const item = allItems.find(i => i.key === key);
 return item ? sum + item.price * item.qty : sum;
 }, 0);
 const ownSubtotal = myBase + adoptedBase;
 const ownTip = Math.round(ownSubtotal * tipRate);
 const ownShare = ownSubtotal + ownTip;

 // Mode: equal
 const perPerson = Math.ceil(grandWithTip / splitCount);

 // Mode: shared
 const sharedBase = Object.entries(sharedItems).reduce((sum, [key, n]) => {
 const item = allItems.find(i => i.key === key);
 if (!item || n < 1) return sum;
 return sum + Math.ceil((item.price * item.qty) / n);
 }, 0);
 const sharedTip = Math.round(sharedBase * tipRate);
 const sharedShare = sharedBase + sharedTip;

 const myShare =
 mode === "own" ? ownShare :
 mode === "equal" ? perPerson :
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
 setPayError("No se pudo registrar el pago. Intenta de nuevo.");
 }
 });
 }

 if (confirmed) {
 return <ConfirmedView tableCode={tableCode} guestName={guestName} amount={paidAmount} />;
 }

 const modeLabel: Record<SplitMode, string> = {
 own: "Lo mío",
 equal: "Por igual",
 shared: "Compartir",
 };
 const modeDesc: Record<SplitMode, string> = {
 own: "Paga lo que pediste, y elige si quieres cubrir algo de otros.",
 equal: "Divide el total de la mesa entre todos por partes iguales.",
 shared: "Elige artículos específicos y cuántas personas los comparten.",
 };

   const canPay =
    myShare > 0 &&
    (mode !== "shared" || Object.keys(sharedItems).length > 0);

  const menuHref = `/mesa/${encodeURIComponent(tableCode)}/menu`;

  return (
    <div
      className="guest-menu-vt-root flex h-[100dvh] min-h-0 flex-col overflow-hidden bg-[var(--guest-bg-page,#faf8f5)] text-[var(--guest-text,#0f172a)]"
    >
      {payError && (
        <div className="fixed inset-x-0 top-8 z-[90] flex justify-center px-4">
          <div
            role="alert"
            className="flex max-w-lg items-center gap-3 rounded-xl border border-red-400/45 bg-white/95 px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.12)] backdrop-blur-md guest-dark:border-red-500/35 guest-dark:bg-panel/95"
          >
            <span className="h-2 w-2 shrink-0 rounded-full bg-red-500 guest-dark:bg-red-400" aria-hidden />
            <p className="flex-1 text-[0.65rem] font-semibold uppercase tracking-wide text-red-700 guest-dark:text-red-300">
              {payError}
            </p>
            <button
              type="button"
              onClick={() => setPayError(null)}
              className="text-[0.65rem] font-bold uppercase text-red-600/70 hover:text-red-700 guest-dark:text-red-400"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Columna: scroll del contenido + barra de pago al final (sin fixed → no tapa el total) */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="relative z-10 min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
          <div className="mx-auto max-w-7xl px-8 pb-12 pt-6 lg:px-12">
        {/* Cabecera al estilo Carta del menú */}
        <div className="flex flex-wrap items-end justify-between gap-x-4 gap-y-3 border-b border-slate-200 pb-4 pt-1 guest-dark:border-wire/50">
          <div className="min-w-0 flex-1">
            <p className="text-[0.62rem] font-semibold uppercase tracking-[0.28em] text-slate-400 guest-dark:text-dim">
              Cuenta
            </p>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-800 guest-dark:text-light">
              <span className="max-w-[min(100%,18rem)] truncate font-semibold" title={guestName}>
                {guestName}
              </span>
              <span className="text-[0.65rem] font-normal text-slate-500 guest-dark:text-dim">
                Mesa {displayTableCode}
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link
              href={menuHref}
              className="flex h-8 items-center justify-center rounded-full bg-text-primary px-5 text-[0.65rem] font-bold uppercase tracking-widest text-bg-solid transition-colors hover:bg-text-primary/90"
            >
              Menú
            </Link>
            <GuestMenuThemeToggle
              mode={menuTheme}
              onChange={changeGuestMenuTheme}
              className="size-8 border-slate-200/70 bg-slate-50/80 shadow-none hover:bg-slate-100/90 guest-dark:border-wire/55 guest-dark:bg-panel/60 guest-dark:hover:bg-panel"
            />
          </div>
        </div>

        <div className="border-b border-slate-200 pb-8 pt-10 guest-dark:border-wire/45">
          <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-slate-400 guest-dark:text-dim">
            Pago de mesa
          </p>
          <h1 className="mt-3 font-serif text-[clamp(2rem,6vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-slate-900 guest-dark:text-light">
            La cuenta
          </h1>
          <p className="mt-3 max-w-lg text-[0.68rem] font-medium leading-relaxed text-slate-600 guest-dark:text-dim/90">
            Si solo te vas tú, elige <strong className="text-slate-900 guest-dark:text-light">Lo mío</strong> y paga tu
            consumo: la mesa sigue activa para los demás hasta que pidan la cuenta.
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1">
            <span className="text-[0.65rem] text-slate-500 guest-dark:text-dim">
              {guestCount} comensal{guestCount !== 1 ? "es" : ""} · Total mesa $
              {grandTotal.toLocaleString("es-MX")}
            </span>
          </div>
        </div>

        {/* ── PROPINA ──────────────────────────────────────────────── */}
        <div className="border-b border-slate-200 py-8 guest-dark:border-wire/45">
          <p className="mb-5 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-slate-400 guest-dark:text-dim">
            Propina
          </p>
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
                    : "border border-slate-200/90 bg-white/70 text-slate-600 hover:border-slate-300 hover:text-slate-900 guest-dark:border-wire/50 guest-dark:bg-panel/50 guest-dark:text-dim guest-dark:hover:border-wire/70 guest-dark:hover:text-light",
                ].join(" ")}
              >
                {label}
              </button>
            ))}
          </div>
          {grandTip > 0 && (
            <p className="mt-4 text-[0.65rem] text-slate-500 guest-dark:text-dim/75">
              ${grandTip.toLocaleString("es-MX")} de propina · total con propina $
              {grandWithTip.toLocaleString("es-MX")}
            </p>
          )}
        </div>

        {/* ── MODE TABS (mismo patrón que categorías del menú) ───── */}
        <div
          className="scrollbar-hide -mx-6 mt-6 flex overflow-x-auto border-b border-slate-200 px-6 lg:mx-0 lg:px-0 guest-dark:border-wire/50"
          role="tablist"
          aria-label="Forma de dividir la cuenta"
        >
          {(["own", "equal", "shared"] as SplitMode[]).map((m) => (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={mode === m}
              onClick={() => setMode(m)}
              className={[
                "shrink-0 px-4 py-3.5 text-xs font-semibold uppercase tracking-widest transition-colors duration-200 ease-[cubic-bezier(0.16,1,0.3,1)]",
                mode === m
                  ? "border-b-[2px] border-gold/50 text-gold guest-dark:border-gold/60 guest-dark:text-gold/60"
                  : "text-slate-600 hover:text-slate-900 guest-dark:text-dim guest-dark:hover:text-light",
              ].join(" ")}
            >
              {modeLabel[m]}
            </button>
          ))}
        </div>

        <p className="mt-5 text-[0.68rem] text-slate-500 guest-dark:text-dim/80">{modeDesc[mode]}</p>

        {/* ── MODE: LO MÍO ─────────────────────────────────────────── */}
        {mode === "own" && (
          <div className="py-6">
            <p className="mb-4 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-slate-400 guest-dark:text-dim">
              Tus artículos
            </p>
            {myGuest && myGuest.items.length > 0 ? (
              <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-5 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md guest-dark:border-wire/45 guest-dark:bg-panel/55 guest-dark:shadow-[0_12px_40px_rgba(0,0,0,0.35)]">
                <div className="flex flex-col gap-2">
                  {myGuest.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3 py-1">
                      <div className="flex min-w-0 items-center gap-3">
                        <Checkbox checked />
                        <span className="truncate text-[0.72rem] font-medium text-slate-900 guest-dark:text-light">
                          {item.qty}× {item.name}
                        </span>
                      </div>
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
              <p className="text-[0.72rem] text-slate-500/70 guest-dark:text-dim/60">Aún no has ordenado nada.</p>
            )}

            {otherGuests.length > 0 && (
              <div className="mt-8">
                <p className="mb-4 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-slate-400 guest-dark:text-dim">
                  Artículos de otros
                </p>
                <div className="flex flex-col gap-6">
                  {otherGuests.map((guest) => (
                    <div
                      key={guest.sessionId}
                      className="rounded-2xl border border-slate-200/30 bg-white/35 p-5 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-md guest-dark:border-wire/40 guest-dark:bg-panel/45"
                    >
                      <p className="mb-3 text-[0.65rem] font-semibold text-slate-600 guest-dark:text-dim">{guest.guestName}</p>
                      <div className="flex flex-col gap-1">
                        {guest.items.map((item) => {
                          const isAdopted = adopted.has(item.key);
                          return (
                            <button
                              key={item.key}
                              type="button"
                              onClick={() => {
                                setAdopted((prev) => {
                                  const next = new Set(prev);
                                  if (next.has(item.key)) next.delete(item.key);
                                  else next.add(item.key);
                                  return next;
                                });
                              }}
                              className="flex w-full items-center justify-between gap-3 rounded-lg py-1.5 text-left transition-colors hover:bg-white/40 guest-dark:hover:bg-panel/50"
                            >
                              <div className="flex min-w-0 items-center gap-3">
                                <Checkbox checked={isAdopted} />
                                <span
                                  className={[
                                    "truncate text-[0.72rem] font-medium transition-colors",
                                    isAdopted ? "text-slate-900 guest-dark:text-light" : "text-slate-500 guest-dark:text-dim/70",
                                  ].join(" ")}
                                >
                                  {item.qty}× {item.name}
                                </span>
                              </div>
                              <span
                                className={[
                                  "shrink-0 font-mono text-[0.8rem] transition-colors",
                                  isAdopted ? "text-slate-700 guest-dark:text-light/75" : "text-slate-400 guest-dark:text-dim/45",
                                ].join(" ")}
                              >
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
            <div className="mt-8 border-t-2 border-gold/50 pt-6 guest-dark:border-gold/35">
              <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-slate-400 guest-dark:text-dim">
                Tu parte
              </p>
              <p
                className="mt-3 font-mono font-semibold leading-none text-gold guest-dark:text-gold/75"
                style={{ fontSize: "clamp(3rem,10vw,4.5rem)" }}
              >
                ${ownShare.toLocaleString("es-MX")}
              </p>
              <p className="mt-3 text-[0.68rem] text-slate-600 guest-dark:text-dim/85">
                ${ownSubtotal.toLocaleString("es-MX")} consumo
                {ownTip > 0 && ` + $${ownTip.toLocaleString("es-MX")} propina`}
              </p>
            </div>
          </div>
        )}

        {/* ── MODE: POR IGUAL ──────────────────────────────────────── */}
        {mode === "equal" && (
          <div className="py-6">
            <p className="mb-5 text-[0.57rem] font-bold uppercase tracking-[0.38em] text-slate-400 guest-dark:text-dim">
              ¿Entre cuántas personas?
            </p>
            <div className="rounded-2xl border border-slate-200/30 bg-white/40 p-6 shadow-[0_8px_32px_rgba(15,23,42,0.08)] backdrop-blur-md guest-dark:border-wire/45 guest-dark:bg-panel/50">
              <div className="flex items-center border-b border-slate-200 pb-8 guest-dark:border-wire/40">
                <button
                  type="button"
                  onClick={() => setSplitCount((prev) => Math.max(1, prev - 1))}
                  disabled={splitCount <= 1}
                  aria-label="Restar persona"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 disabled:opacity-20 guest-dark:border-wire/55 guest-dark:text-dim guest-dark:hover:text-light"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                    <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
                <span className="flex-1 text-center font-mono text-[2.2rem] font-semibold tabular-nums text-slate-900 guest-dark:text-light">
                  {splitCount}
                </span>
                <button
                  type="button"
                  onClick={() => setSplitCount((prev) => Math.min(20, prev + 1))}
                  disabled={splitCount >= 20}
                  aria-label="Agregar persona"
                  className="flex h-11 w-11 items-center justify-center rounded-lg border border-slate-200 text-slate-600 transition-colors hover:border-slate-400 hover:text-slate-900 disabled:opacity-20 guest-dark:border-wire/55 guest-dark:text-dim guest-dark:hover:text-light"
                >
                  <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="mt-8 border-t-2 border-gold/50 pt-6 guest-dark:border-gold/35">
              <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-slate-400 guest-dark:text-dim">
                Tu parte
              </p>
              <p
                className="mt-3 font-mono font-semibold leading-none text-gold guest-dark:text-gold/75"
                style={{ fontSize: "clamp(3rem,10vw,4.5rem)" }}
              >
                ${perPerson.toLocaleString("es-MX")}
              </p>
              <p className="mt-3 text-[0.68rem] text-slate-600 guest-dark:text-dim/85">
                ${grandWithTip.toLocaleString("es-MX")} ÷ {splitCount} persona{splitCount !== 1 ? "s" : ""}
              </p>
            </div>
          </div>
        )}

        {/* ── MODE: COMPARTIR ──────────────────────────────────────── */}
        {mode === "shared" && (
          <div className="py-6">
            <div className="flex flex-col gap-2">
              {initialBill.guests.map((guest) => (
                <div key={guest.sessionId} className="mb-4">
                  <p className="mb-3 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-slate-500 guest-dark:text-dim/70">
                    {guest.guestName}
                  </p>
                  <div className="flex flex-col gap-2">
                    {guest.items.map((item) => {
                      const isShared = item.key in sharedItems;
                      const n = sharedItems[item.key] ?? guestCount;
                      const myPart = isShared ? Math.ceil((item.price * item.qty) / n) : 0;
                      return (
                        <div
                          key={item.key}
                          className={[
                            "rounded-xl border p-3 transition-colors",
                            isShared
                              ? "border-gold/45 bg-glow/10 shadow-sm guest-dark:border-gold/35 guest-dark:bg-panel/40"
                              : "border-slate-200/50 bg-white/30 guest-dark:border-wire/45 guest-dark:bg-panel/35",
                          ].join(" ")}
                        >
                          <button
                            type="button"
                            onClick={() => {
                              setSharedItems((prev) => {
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
                              <span
                                className={[
                                  "truncate text-[0.72rem] font-medium transition-colors",
                                  isShared ? "text-slate-900 guest-dark:text-light" : "text-slate-500 guest-dark:text-dim/70",
                                ].join(" ")}
                              >
                                {item.qty}× {item.name}
                              </span>
                            </div>
                            <span
                              className={[
                                "shrink-0 font-mono text-[0.8rem] transition-colors",
                                isShared ? "text-slate-700 guest-dark:text-light/80" : "text-slate-400 guest-dark:text-dim/50",
                              ].join(" ")}
                            >
                              ${(item.price * item.qty).toLocaleString("es-MX")}
                            </span>
                          </button>

                          {isShared && (
                            <div className="mt-3 flex items-center justify-between border-t border-slate-200/50 pt-3 guest-dark:border-wire/35">
                              <div className="flex items-center gap-2">
                                <span className="text-[0.6rem] text-slate-500 guest-dark:text-dim/75">Entre</span>
                                <MiniStepper
                                  value={n}
                                  onChange={(v) => setSharedItems((prev) => ({ ...prev, [item.key]: v }))}
                                />
                                <span className="text-[0.6rem] text-slate-500 guest-dark:text-dim/75">
                                  persona{n !== 1 ? "s" : ""}
                                </span>
                              </div>
                              <span className="text-[0.68rem] font-semibold text-gold guest-dark:text-gold/75">
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

            {Object.keys(sharedItems).length > 0 ? (
              <div className="mt-8 border-t-2 border-gold/50 pt-6 guest-dark:border-gold/35">
                <p className="text-[0.54rem] font-bold uppercase tracking-[0.44em] text-slate-400 guest-dark:text-dim">
                  Tu contribución
                </p>
                <p
                  className="mt-3 font-mono font-semibold leading-none text-gold guest-dark:text-gold/75"
                  style={{ fontSize: "clamp(3rem,10vw,4.5rem)" }}
                >
                  ${sharedShare.toLocaleString("es-MX")}
                </p>
                <p className="mt-3 text-[0.68rem] text-slate-600 guest-dark:text-dim/85">
                  ${sharedBase.toLocaleString("es-MX")} artículos
                  {sharedTip > 0 && ` + $${sharedTip.toLocaleString("es-MX")} propina`}
                </p>
              </div>
            ) : (
              <p className="mt-10 text-center text-[0.68rem] text-slate-500 guest-dark:text-dim/50">
                Selecciona al menos un artículo para calcular tu contribución.
              </p>
            )}
          </div>
        )}
          </div>
        </div>

        {/* Barra de pago en flujo normal (pie de la columna), no superpuesta */}
        <footer className="shrink-0 border-t border-slate-200 bg-white/40 px-8 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 backdrop-blur-sm lg:px-12 guest-dark:border-wire/60 guest-dark:bg-panel/85">
          <div className="mx-auto max-w-7xl">
            <div className="mb-3 flex items-baseline justify-between">
              <span className="text-[0.58rem] font-bold uppercase tracking-[0.3em] text-slate-500 guest-dark:text-dim">
                Tu parte
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
