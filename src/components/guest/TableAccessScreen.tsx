"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { guestJoinTable } from "@/actions/comensal";
import { GuestMenuThemeToggle } from "@/components/guest/GuestMenuThemeToggle";
import { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";

type TableAccessScreenProps = {
  /** Si ya hay mesa ocupada, reutilizamos el pax declarado en la primera sesión. Si no, 1 (solo quien escanea). */
  existingPax?: number;
  tableCode: string;
  isLikelyValid: boolean;
  requiresJoinCode?: boolean;
};

export function TableAccessScreen({ tableCode, isLikelyValid, existingPax, requiresJoinCode = false }: TableAccessScreenProps) {
  const router = useRouter();
  const { menuTheme, changeGuestMenuTheme } = useGuestMenuTheme();
  const [guestName, setGuestName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  /** Sin selector: 1 comensal por defecto; al unirse a mesa ya abierta se alinea con la sesión existente. */
  const paxForSession = Math.max(1, Math.min(20, existingPax ?? 1));

  const normalizedCode = tableCode.toUpperCase();
  const trimmedName = guestName.trim();
  const joinChars = joinCode.replace(/\s/g, "").length;
  const canContinue =
    isLikelyValid &&
    trimmedName.length >= 2 &&
    (!requiresJoinCode || joinChars === 4);

  /** Por qué el botón puede seguir deshabilitado — evita confusiones cuando falta nombre o código. */
  const accessBlockedHint =
    !isLikelyValid || isSubmitting
      ? null
      : trimmedName.length < 2
        ? "Escribe tu nombre con al menos 2 letras para poder continuar."
        : requiresJoinCode && joinChars !== 4
          ? "Ya hay personas en esta mesa: introduce el código de acceso completo (4 caracteres)."
          : null;

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canContinue) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const result = await guestJoinTable(
        tableCode,
        trimmedName,
        paxForSession,
        requiresJoinCode ? joinCode.replace(/\s/g, "").toUpperCase() : undefined,
      );
      if (!result.ok) {
        setSubmitError(result.message);
        setIsSubmitting(false);
        return;
      }
      /** Sin nombre en URL: la identidad queda solo en sesión+cookie httpOnly */
      await router.push(`/mesa/${encodeURIComponent(result.canonicalQr)}/menu`);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "No pudimos continuar. Intenta nuevamente.";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <main
      className="guest-menu-vt-root min-h-screen bg-cream pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] guest-dark:bg-[var(--guest-bg-page,#0c0907)]"
      aria-labelledby="access-heading"
    >
      <div className="mx-auto max-w-2xl">

      {/* ─── ZONE 1: Logo ───────────────────────────────────────────
          Generous top padding — the logo floats, doesn't crowd.
          Padding respeta safe area y da más espacio en 320px.        */}
      <div
        className="flex items-start justify-between gap-4 px-4 pt-6 pb-8 sm:px-8 sm:pt-10 sm:pb-10 lg:px-12"
        style={{ animation: "table-access-enter 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0s both" }}
      >
        <Link
          href="/"
          className="inline-flex items-baseline gap-2 transition-opacity duration-200 hover:opacity-60"
          aria-label="Bouquet — volver al inicio"
        >
          <span className="text-[1.5rem] font-semibold tracking-tight text-charcoal guest-dark:text-light font-sans">
            bouquet
          </span>
          <span className="text-[0.5rem] font-bold uppercase tracking-[0.34em] text-charcoal/28 guest-dark:text-dim">
            ops
          </span>
        </Link>
        <GuestMenuThemeToggle mode={menuTheme} onChange={changeGuestMenuTheme} className="shrink-0" />
      </div>

      {/* ─── ZONE 2: Table code ─────────────────────────────────────
          The code is the hero — large, unhurried, with room above
          and below before the divider.                               */}
      <div
        className="border-b border-charcoal/[0.07] px-4 pb-8 guest-dark:border-wire/40 sm:px-8 sm:pb-10 lg:px-12"
        style={{ animation: "table-access-enter 0.5s cubic-bezier(0.25, 1, 0.5, 1) 0.08s both" }}
      >
        <p
          className="max-w-full break-all font-sans text-[clamp(2.1rem,11vw,5.5rem)] font-semibold leading-[0.95] tracking-[0.05em] text-charcoal [overflow-wrap:anywhere] sm:tracking-[0.12em] guest-dark:text-light"
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
              className="mt-4 max-w-xs text-sm leading-relaxed text-charcoal/45 guest-dark:text-dim"
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
            className="mb-6 sm:mb-8 font-sans text-[clamp(1.75rem,5vw,2.2rem)] font-semibold leading-[1.08] tracking-tight text-charcoal guest-dark:text-light"
          >
            Identifícate para<br />entrar a tu mesa.
          </h1>

          <form
            onSubmit={handleSubmit}
            className="space-y-8 sm:space-y-10"
            aria-describedby="form-status"
            aria-busy={isSubmitting}
            noValidate
            suppressHydrationWarning
          >

            {/* Name */}
            <div>
              <label
                htmlFor="guest-name"
                className="mb-3 sm:mb-5 block text-xs font-bold uppercase tracking-[0.34em] text-charcoal/30 guest-dark:text-dim sm:text-[0.57rem]"
              >
                Tu nombre
              </label>
              <input
                id="guest-name"
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Como quieres que te llamen"
                className="w-full min-h-[48px] border-b border-charcoal/14 bg-transparent pb-4 pt-2 text-base text-charcoal outline-none placeholder:text-charcoal/20 transition-colors duration-200 focus:border-charcoal/40 guest-dark:border-wire/55 guest-dark:text-light guest-dark:placeholder:text-dim guest-dark:focus:border-glow sm:text-[1.1rem] sm:pb-5 sm:pt-1"
                maxLength={40}
                autoComplete="given-name"
                required
                aria-required="true"
              />
            </div>

            {/* Código de acceso — solo si la mesa ya tiene gente */}
            {requiresJoinCode && (
              <div>
                <label
                  htmlFor="join-code"
                  className="mb-3 sm:mb-5 block text-xs font-bold uppercase tracking-[0.34em] text-charcoal/30 guest-dark:text-dim sm:text-[0.57rem]"
                >
                  Código de acceso
                </label>
                <p className="mb-3 text-[0.72rem] text-charcoal/40 guest-dark:text-dim leading-relaxed">
                  Pídele el código al anfitrión de tu mesa.
                </p>
                <input
                  id="join-code"
                  type="text"
                  value={joinCode}
                  onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
                  placeholder="XXXX"
                  className="w-full min-h-[48px] border-b border-charcoal/14 bg-transparent pb-4 pt-2 text-center text-[1.8rem] font-bold tracking-[0.3em] text-charcoal outline-none placeholder:text-charcoal/15 transition-colors duration-200 focus:border-charcoal/40 guest-dark:border-wire/55 guest-dark:text-light guest-dark:placeholder:text-dim guest-dark:focus:border-glow"
                  maxLength={4}
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  inputMode="text"
                  required
                />
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
              {accessBlockedHint && (
                <p
                  id="access-blocked-hint"
                  role="status"
                  className="mb-4 text-sm font-medium leading-relaxed text-charcoal/55 guest-dark:text-dim"
                >
                  {accessBlockedHint}
                </p>
              )}
              <button
                type="submit"
                disabled={!canContinue || isSubmitting}
                aria-busy={isSubmitting}
                aria-describedby={accessBlockedHint ? "access-blocked-hint" : undefined}
                className="w-full min-h-12 bg-gold py-4 text-[0.76rem] font-bold uppercase tracking-[0.22em] text-charcoal transition-[transform,opacity,background-color] duration-200 ease-[cubic-bezier(0.25,1,0.5,1)] hover:-translate-y-px hover:bg-gold-light active:scale-[0.99] active:translate-y-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold disabled:cursor-not-allowed disabled:opacity-[0.42] touch-manipulation sm:py-5"
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
          className="text-[0.65rem] font-medium text-charcoal/25 underline underline-offset-4 decoration-charcoal/10 transition-colors duration-200 hover:text-charcoal/50 guest-dark:text-dim guest-dark:decoration-wire/40 guest-dark:hover:text-light"
        >
          Volver al inicio
        </Link>
      </div>

      </div>{/* /mx-auto max-w-2xl */}

      <p id="form-status" className="sr-only" aria-live="polite">
        {accessBlockedHint ? `${accessBlockedHint} ` : ""}
        {isSubmitting ? "Procesando acceso a la mesa." : ""}
      </p>
    </main>
  );
}
