"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sun, Moon } from "lucide-react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { guestJoinTable } from "@/actions/comensal";
import { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";
import { BouquetLogo } from "@/components/landing/BouquetLogo";
import floralLeft from "@/assets/floral-assets/branches/complete_2.png";
import floralRight from "@/assets/floral-assets/branches/complete_3.png";

type TableAccessScreenProps = {
  existingPax?: number;
  tableCode: string;
  isLikelyValid: boolean;
  requiresJoinCode?: boolean;
};

export function TableAccessScreen({
  tableCode,
  isLikelyValid,
  existingPax,
  requiresJoinCode = false,
}: TableAccessScreenProps) {
  const router = useRouter();
  const { menuTheme, changeGuestMenuTheme } = useGuestMenuTheme();
  const [guestName, setGuestName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const mainRef = useRef<HTMLElement>(null);

  const paxForSession = Math.max(1, Math.min(20, existingPax ?? 1));
  const normalizedCode = tableCode.toUpperCase();
  const trimmedName = guestName.trim();
  const joinChars = joinCode.replace(/\s/g, "").length;

  const canContinue =
    isLikelyValid &&
    trimmedName.length >= 2 &&
    (!requiresJoinCode || joinChars === 4);

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
      await router.push(`/mesa/${encodeURIComponent(result.canonicalQr)}/menu`);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "No pudimos continuar. Intenta nuevamente.";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  }

  useGSAP(
    () => {
      gsap.to(".floral-left", {
        y: -12,
        rotation: 1.5,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });
      gsap.to(".floral-right", {
        y: -12,
        rotation: -1.5,
        duration: 8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1,
      });
    },
    { scope: mainRef },
  );

  const isDark = menuTheme === "dark";
  const floralBlend = isDark
    ? "mix-blend-screen sepia-[.2] hue-rotate-[-15deg]"
    : "mix-blend-multiply";

  return (
    <main
      ref={mainRef}
      className="relative min-h-[100dvh] overflow-hidden bg-[var(--guest-bg-page)] font-sans text-[var(--guest-text)] antialiased selection:bg-[var(--guest-gold)]/20"
    >
      {/* Film grain overlay */}
      <div
        className="pointer-events-none fixed inset-0 z-[1] opacity-[0.02] mix-blend-multiply"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
        }}
      />

      {/* Floral decoration */}
      <Image
        src={floralLeft}
        alt=""
        priority
        className={`floral-left pointer-events-none absolute -left-[15%] top-1/2 -translate-y-1/2 w-[600px] lg:w-[800px] opacity-[0.14] ${floralBlend}`}
        aria-hidden="true"
      />
      <Image
        src={floralRight}
        alt=""
        priority
        className={`floral-right pointer-events-none absolute -right-[10%] bottom-0 w-[500px] lg:w-[650px] opacity-[0.10] ${floralBlend}`}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-6xl px-5 sm:px-8 lg:px-12 py-8 lg:py-0">
        {/* Header */}
        <header className="flex items-center justify-between py-4 lg:py-6">
          <Link href="/" className="inline-flex transition-opacity hover:opacity-80">
            <BouquetLogo variant={isDark ? "light" : "dark"} size="sm" />
          </Link>

          <button
            type="button"
            onClick={() => changeGuestMenuTheme(isDark ? "light" : "dark")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] text-[var(--guest-muted)] transition-all hover:border-[var(--guest-gold)]/30 hover:text-[var(--guest-text)]"
            aria-label={isDark ? "Modo claro" : "Modo oscuro"}
          >
            {isDark ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
        </header>

        {/* Main content */}
        <div className="lg:grid lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:items-center lg:min-h-[100dvh]">
          {/* Left column */}
          <div className="flex flex-col items-start py-8 lg:py-16">
            <motion.span
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--guest-muted)]"
            >
              Identifícate
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.05 }}
              className="mt-4 font-serif text-[clamp(2.5rem,5vw,4rem)] font-medium leading-tight text-[var(--guest-text)]"
            >
              Bienvenido a
              <br />
              tu mesa
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
              className="mt-5 max-w-sm text-[1.05rem] leading-[1.6] text-[var(--guest-muted)]"
            >
              Estás a un paso de unirte a tu grupo y comenzar a disfrutar de una
              gran experiencia.
            </motion.p>

            {/* Table code card */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, ease: "easeOut", delay: 0.15 }}
              className="mt-8 w-full max-w-sm bg-[var(--guest-bg-surface-2)] border border-[var(--guest-divider)] rounded-2xl px-6 py-5"
            >
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-[var(--guest-muted)]">
                TU MESA
              </span>
              <div className="mt-1 font-serif text-[clamp(2rem,4vw,3.5rem)] text-[var(--guest-gold)] leading-none">
                {normalizedCode}
              </div>
              <p className="mt-3 text-[0.8rem] text-[var(--guest-muted)]">
                Comparte este código con los demás comensales
              </p>
            </motion.div>
          </div>

          {/* Right column — Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
            className={`bg-[var(--guest-bg-surface)] backdrop-blur-md border border-[var(--guest-divider)] rounded-[2.5rem] p-6 sm:p-8 lg:p-10 ${
              isDark
                ? "shadow-[0_1px_3px_rgba(0,0,0,0.2),inset_0_1px_0_rgba(255,255,255,0.04)]"
                : "shadow-[0_1px_3px_rgba(74,26,44,0.05),inset_0_1px_0_rgba(255,255,255,0.06)]"
            }`}
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {/* Guest name */}
              <div className="group relative">
                <input
                  id="guestName"
                  type="text"
                  required
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="Tu nombre"
                  className="peer h-14 w-full rounded-2xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-5 text-[0.95rem] font-medium text-[var(--guest-text)] placeholder-transparent outline-none transition-all focus:border-[var(--guest-gold)]/40 focus:bg-[var(--guest-bg-surface)]"
                  maxLength={40}
                />
                <label
                  htmlFor="guestName"
                  className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[0.85rem] font-semibold text-[var(--guest-muted)] transition-all peer-focus:-translate-y-9 peer-focus:scale-[0.85] peer-focus:text-[var(--guest-gold)] peer-valid:-translate-y-9 peer-valid:scale-[0.85]"
                >
                  Tu nombre
                </label>
              </div>

              {/* Join code */}
              {requiresJoinCode && (
                <div className="group relative">
                  <input
                    id="joinCode"
                    type="text"
                    required
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCode(
                        e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]/g, "")
                          .slice(0, 4),
                      )
                    }
                    placeholder="Código de acceso"
                    className="peer h-14 w-full rounded-2xl border border-[var(--guest-divider)] bg-[var(--guest-bg-surface-2)] px-5 text-[0.95rem] font-medium text-[var(--guest-text)] placeholder-transparent outline-none transition-all focus:border-[var(--guest-gold)]/40 focus:bg-[var(--guest-bg-surface)] text-center tracking-[0.2em]"
                    maxLength={4}
                  />
                  <label
                    htmlFor="joinCode"
                    className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[0.85rem] font-semibold text-[var(--guest-muted)] transition-all peer-focus:-translate-y-9 peer-focus:scale-[0.85] peer-focus:text-[var(--guest-gold)] peer-valid:-translate-y-9 peer-valid:scale-[0.85]"
                  >
                    Código de acceso
                  </label>
                </div>
              )}

              {submitError && (
                <div className="rounded-xl border border-[var(--guest-gold)]/20 bg-[var(--guest-gold)]/[0.06] p-4 text-[0.85rem] leading-relaxed text-[var(--guest-gold)]">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={!canContinue || isSubmitting}
                className="group relative mt-2 h-14 w-full overflow-hidden rounded-2xl bg-[var(--guest-gold)] text-sm font-bold uppercase tracking-[0.08em] text-white transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:active:scale-100"
              >
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Entrando…
                  </span>
                ) : (
                  "ENTRAR A LA MESA"
                )}
              </button>

              <Link
                href="/"
                className="mx-auto text-[0.8rem] text-[var(--guest-muted)] underline underline-offset-4 decoration-[var(--guest-divider)] transition-all hover:text-[var(--guest-text)] hover:decoration-[var(--guest-gold)]/30"
              >
                Volver al inicio
              </Link>
            </form>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
