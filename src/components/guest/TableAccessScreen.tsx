"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { guestJoinTable } from "@/actions/comensal";

type TableAccessScreenProps = {
  existingPax?: number;
  tableCode: string;
  isLikelyValid: boolean;
  tableNumber?: number;
};

export function TableAccessScreen({ tableCode, isLikelyValid, tableNumber, existingPax }: TableAccessScreenProps) {
  const router = useRouter();
  const [guestName, setGuestName] = useState("");
  const [partySize, setPartySize] = useState(existingPax ?? 2);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const normalizedCode = tableCode.toUpperCase();
  const canContinue = isLikelyValid && guestName.trim().length >= 2 && partySize >= 1;

  function adjustParty(delta: number) {
    setPartySize((prev: number) => Math.min(20, Math.max(1, prev + delta)));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;
    setSubmitError(null);
    setIsSubmitting(true);
    const query = new URLSearchParams({
      guest: guestName.trim(),
      pax: String(partySize),
      from: "qr",
    });
    try {
      await guestJoinTable(tableCode, guestName.trim(), partySize);
      await router.push(`/mesa/${encodeURIComponent(tableCode)}/menu?${query.toString()}`);
    } catch {
      setSubmitError("No pudimos continuar. Intenta nuevamente.");
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="min-h-screen bg-cream pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      aria-labelledby="access-heading"
    >
      <div className="mx-auto max-w-2xl">

      {/* ─── ZONE 1: Logo ───────────────────────────────────────────
          Generous top padding — the logo floats, doesn't crowd.
          Padding respeta safe area y da más espacio en 320px.        */}
      <div
        className="px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-10 lg:px-12"
        style={{ animation: "table-access-enter 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0s both" }}
      >
        <Link
          href="/"
          className="inline-flex items-baseline gap-2 transition-opacity duration-200 hover:opacity-60"
          aria-label="Bouquet — volver al inicio"
        >
          <span className="font-serif text-[1.5rem] font-semibold italic tracking-tight text-charcoal">
            bouquet
          </span>
          <span className="text-[0.5rem] font-bold uppercase tracking-[0.34em] text-charcoal/28">
            ops
          </span>
        </Link>
      </div>

      {/* ─── ZONE 2: Table code ─────────────────────────────────────
          The code is the hero — large, unhurried, with room above
          and below before the divider.                               */}
      <div
        className="border-b border-charcoal/[0.07] px-4 pb-8 sm:px-8 sm:pb-10 lg:px-12"
        style={{ animation: "table-access-enter 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.08s both" }}
      >
        <p className="mb-5 sm:mb-7 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-charcoal/22">
          Mesa detectada
        </p>

        <p
          className="font-sans text-[clamp(3rem,12vw,5.5rem)] font-semibold leading-none tracking-[0.12em] text-charcoal"
          aria-label={`Código de mesa: ${normalizedCode}`}
        >
          {normalizedCode}
        </p>

        <div className="mt-10">
          <span
            className={[
              "inline-flex items-center gap-2 text-[0.56rem] font-bold uppercase tracking-[0.3em]",
              isLikelyValid ? "text-sage-deep" : "text-ember",
            ].join(" ")}
            role="status"
          >
            <span
              className={["h-1.5 w-1.5 rounded-full", isLikelyValid ? "bg-sage-deep" : "bg-ember"].join(" ")}
              aria-hidden="true"
            />
            {isLikelyValid ? "Lista para entrar" : "Formato no reconocido"}
          </span>

          {!isLikelyValid && (
            <p
              className="mt-4 max-w-xs text-sm leading-relaxed text-charcoal/45"
              style={{ animation: "table-access-error-enter 0.22s cubic-bezier(0.25, 1, 0.5, 1) both" }}
            >
              Pide apoyo al personal o intenta con otro QR.
            </p>
          )}
        </div>
      </div>

      {/* ─── ZONE 3: Form ───────────────────────────────────────────
          Each field lives in its own row with breathing room.
          Touch targets ≥44px; labels legibles en móvil.              */}
      <div
        className="px-4 pt-8 sm:px-8 sm:pt-10 lg:px-12"
        style={{ animation: "table-access-enter 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.16s both" }}
      >
        <div className="max-w-sm">

          <h1
            id="access-heading"
            className="mb-6 sm:mb-8 font-serif text-[clamp(1.75rem,5vw,2.2rem)] font-medium leading-[1.08] tracking-[-0.02em] text-charcoal"
          >
            Identifícate para<br />entrar a tu mesa.
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 sm:space-y-10"
            aria-describedby="form-status"
            aria-busy={isSubmitting}
            noValidate
          >

            {/* Name */}
            <div>
              <label
                htmlFor="guest-name"
                className="mb-3 sm:mb-5 block text-xs font-bold uppercase tracking-[0.34em] text-charcoal/30 sm:text-[0.57rem]"
              >
                Tu nombre
              </label>
              <input
                id="guest-name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Como quieres que te llamen"
                className="w-full min-h-[48px] border-b border-charcoal/14 bg-transparent pb-4 pt-2 text-base text-charcoal outline-none placeholder:text-charcoal/20 transition-colors duration-200 focus:border-charcoal/40 sm:text-[1.1rem] sm:pb-5 sm:pt-1"
                maxLength={40}
                autoComplete="given-name"
                required
                aria-required="true"
              />
            </div>

            {/* Party size — escribir número o usar +/− (1–20) */}
            {existingPax ? null : (
              <div>
                <label
                  htmlFor="party-size-input"
                  className="mb-3 sm:mb-5 block text-xs font-bold uppercase tracking-[0.34em] text-charcoal/30 sm:text-[0.57rem]"
                >
                  Comensales
                </label>
                <div
                  className="flex items-center gap-3 border-b border-charcoal/14 pb-4 sm:pb-5"
                  role="group"
                  aria-label={`Comensales: ${partySize}. Escribe el número o usa los botones para cambiar.`}
                >
                  <button
                    type="button"
                    onClick={() => adjustParty(-1)}
                    disabled={partySize <= 1}
                    aria-label="Restar comensal"
                    className="flex h-11 min-w-11 shrink-0 items-center justify-center border border-charcoal/10 text-charcoal/40 transition-[color,background-color,transform] duration-100 ease-[cubic-bezier(0.25,1,0.5,1)] hover:border-charcoal/20 hover:text-charcoal active:scale-[0.98] active:bg-charcoal/5 disabled:opacity-20 touch-manipulation"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>

                  <input
                    id="party-size-input"
                    type="number"
                    min={1}
                    max={20}
                    inputMode="numeric"
                    value={partySize}
                    onChange={(e) => {
                      const v = e.target.value;
                      if (v === "") {
                        setPartySize(1);
                        return;
                      }
                      const n = parseInt(v, 10);
                      if (!Number.isNaN(n)) {
                        setPartySize(Math.min(20, Math.max(1, n)));
                      }
                    }}
                    aria-label="Cantidad de comensales"
                    className="w-14 flex-1 min-w-0 border-0 bg-transparent text-center text-[1.5rem] font-semibold tabular-nums text-charcoal outline-none transition-opacity duration-150 [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none sm:text-[1.6rem]"
                  />

                  <button
                    type="button"
                    onClick={() => adjustParty(1)}
                    disabled={partySize >= 20}
                    aria-label="Sumar comensal"
                    className="flex h-11 min-w-11 shrink-0 items-center justify-center border border-charcoal/10 text-charcoal/40 transition-[color,background-color,transform] duration-100 ease-[cubic-bezier(0.25,1,0.5,1)] hover:border-charcoal/20 hover:text-charcoal active:scale-[0.98] active:bg-charcoal/5 disabled:opacity-20 touch-manipulation"
                  >
                    <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5" aria-hidden="true">
                      <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {submitError && (
              <p
                className="text-sm font-medium text-ember"
                role="alert"
                style={{ animation: "table-access-error-enter 0.22s cubic-bezier(0.25, 1, 0.5, 1) both" }}
              >
                {submitError}
              </p>
            )}

            {/* Submit — altura mínima 48px para touch; pulse sutil al cargar */}
            <div className="pt-4 sm:pt-6">
              <button
                type="submit"
                disabled={!canContinue || isSubmitting}
                aria-busy={isSubmitting}
                className="w-full min-h-12 bg-charcoal py-4 text-[0.76rem] font-bold uppercase tracking-[0.22em] text-cream transition-[transform,opacity] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-px active:scale-[0.99] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-25 touch-manipulation sm:py-5"
                style={
                  isSubmitting
                    ? { animation: "table-access-loading-pulse 1.2s ease-in-out infinite" }
                    : undefined
                }
              >
                {isSubmitting ? "Entrando…" : "Entrar a la mesa"}
              </button>
            </div>

          </form>

        </div>
      </div>

      {/* ─── ZONE 4: Footer ────────────────────────────────────────── */}
      <div
        className="px-4 pb-8 pt-8 sm:px-8 sm:pb-10 sm:pt-10 lg:px-12"
        style={{ animation: "table-access-enter 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.24s both" }}
      >
        <Link
          href="/"
          className="text-[0.65rem] font-medium text-charcoal/25 underline underline-offset-4 decoration-charcoal/10 transition-colors duration-200 hover:text-charcoal/50"
        >
          Volver al inicio
        </Link>
      </div>

      </div>{/* /mx-auto max-w-2xl */}

      <p id="form-status" className="sr-only" aria-live="polite">
        {isSubmitting ? "Procesando acceso a la mesa." : ""}
      </p>
    </main>
  );
}
