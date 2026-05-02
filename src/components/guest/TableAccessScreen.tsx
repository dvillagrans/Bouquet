"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Users, User, ShieldCheck, Sun, Moon, Flower2 } from "lucide-react";
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

const STEP_LABELS = ["Unirse", "Menú", "Ordenar", "Pagar"];

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
      const message = err instanceof Error ? err.message : "No pudimos continuar. Intenta nuevamente.";
      setSubmitError(message);
      setIsSubmitting(false);
    }
  }

  return (
    <main className="relative flex min-h-screen w-full flex-col overflow-hidden bg-ink font-sans text-light antialiased selection:bg-pink-glow/20">
      {/* ─── Atmosphere ─── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {/* Radial glows */}
        <div className="absolute -left-32 top-1/3 h-[400px] w-[400px] sm:h-[600px] sm:w-[600px] rounded-full bg-pink-glow/[0.04] blur-3xl" />
        <div className="absolute -right-32 bottom-1/3 h-[350px] w-[350px] sm:h-[500px] sm:w-[500px] rounded-full bg-dash-green/[0.03] blur-3xl" />
        <div className="absolute left-1/2 top-0 h-[250px] w-[250px] sm:h-[400px] sm:w-[400px] -translate-x-1/2 rounded-full bg-pink-glow/[0.03] blur-3xl" />

        {/* Floral decoration */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut" }}
          className="absolute -left-[5%] top-1/2 -translate-y-1/2"
        >
          <Image
            src={floralLeft}
            alt=""
            priority
            className="h-[400px] w-auto -rotate-[12deg] opacity-[0.05] mix-blend-overlay grayscale sm:h-[700px]"
          />
        </motion.div>
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 1.2, ease: "easeOut", delay: 0.15 }}
          className="absolute -right-[5%] top-1/2 -translate-y-1/2"
        >
          <Image
            src={floralRight}
            alt=""
            priority
            className="h-[400px] w-auto rotate-[14deg] opacity-[0.04] mix-blend-overlay grayscale sm:h-[700px]"
          />
        </motion.div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/40" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-4 py-6 sm:px-6 sm:py-8">
        {/* ─── Header ─── */}
        <header className="flex items-center justify-between">
          <Link href="/" className="inline-flex transition-opacity hover:opacity-80">
            <BouquetLogo variant="light" size="sm" />
          </Link>

          <button
            type="button"
            onClick={() => changeGuestMenuTheme(menuTheme === "dark" ? "light" : "dark")}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.03] text-dim/80 transition-all hover:border-white/[0.12] hover:bg-white/[0.06] hover:text-light"
            aria-label={menuTheme === "dark" ? "Modo claro" : "Modo oscuro"}
          >
            {menuTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </header>


        {/* ─── Main Content ─── */}
        {/* Mobile: unified single card */}
        <div className="mt-6 sm:mt-10 lg:hidden">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col items-center rounded-[28px] border border-white/[0.06] bg-white/[0.015] p-6 text-center backdrop-blur-xl ring-1 ring-white/[0.03] sm:rounded-[36px] sm:p-8"
          >
            {/* Decorative circle */}
            <div className="relative mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-pink-glow/15 bg-pink-glow/[0.04]">
              <div className="absolute inset-0 rounded-full bg-pink-glow/[0.06] blur-xl" />
              <Users className="relative h-8 w-8 text-pink-glow" />
            </div>

            {/* Diamond ornament + code */}
            <div className="mb-4 flex items-center gap-2">
              <div className="h-px w-3 bg-pink-glow/20" />
              <span className="text-[9px] font-bold uppercase tracking-[0.3em] text-pink-glow/80">
                ◆ TU CÓDIGO DE MESA ◆
              </span>
              <div className="h-px w-3 bg-pink-glow/20" />
            </div>

            <h2 className="mb-6 font-mono text-[clamp(2rem,8vw,3.5rem)] font-bold tracking-[0.2em] text-light">
              {normalizedCode}
            </h2>

            {/* Flower divider */}
            <div className="mb-6 flex w-full items-center justify-center gap-4 opacity-20">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-light" />
              <Flower2 className="h-4 w-4 text-rose" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-light" />
            </div>

            {/* Headline */}
            <h1 className="mb-3 font-serif text-[clamp(1.5rem,5vw,2.25rem)] font-medium leading-tight text-light">
              Identifícate para
              <br />
              entrar a tu mesa
            </h1>

            <p className="mb-6 max-w-xs text-[14px] leading-relaxed text-dim">
              Estás a un paso de unirte a tu grupo y comenzar a disfrutar de una gran experiencia.
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="flex w-full flex-col gap-4 text-left">
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-dim">
                  Tu nombre
                </label>
                <div className="group relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2">
                    <User className="h-4 w-4 text-dim/40 transition-colors group-focus-within:text-pink-glow" />
                  </div>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="¿Cómo quieres que te llamen?"
                    className="h-14 w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] pl-11 pr-4 text-base text-light placeholder:text-dim/30 outline-none transition-all focus:border-pink-glow/20 focus:bg-white/[0.04] focus:ring-2 focus:ring-pink-glow/8"
                    maxLength={40}
                    required
                  />
                </div>
              </div>

              {requiresJoinCode && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-[10px] font-bold uppercase tracking-[0.22em] text-dim">
                    Código de acceso
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCode(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4),
                      )
                    }
                    placeholder="XXXX"
                    className="h-14 w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] text-center text-xl font-bold tracking-[0.35em] text-light outline-none transition-all focus:border-pink-glow/20 focus:bg-white/[0.04] focus:ring-2 focus:ring-pink-glow/8"
                    maxLength={4}
                    required
                  />
                </div>
              )}

              {submitError && (
                <div className="rounded-xl border border-pink-light-glow/20 bg-pink-light-glow/[0.06] p-3 text-[12px] leading-relaxed text-rose-pale">
                  {submitError}
                </div>
              )}

              <button
                type="submit"
                disabled={!canContinue || isSubmitting}
                className="group relative mt-1 h-14 w-full overflow-hidden rounded-2xl bg-rose text-sm font-bold uppercase tracking-[0.08em] text-white shadow-[0_8px_24px_-8px_rgba(199,91,122,0.45)] transition-all active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:active:scale-100"
              >
                <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2.5">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/25 border-t-white" />
                    Entrando…
                  </span>
                ) : (
                  "ENTRAR A LA MESA"
                )}
              </button>

              <Link
                href="/"
                className="mx-auto pt-1 text-[12px] text-dim/50 underline underline-offset-4 decoration-white/[0.06] transition-all hover:text-dim hover:decoration-pink-glow/30"
              >
                Volver al inicio
              </Link>
            </form>
          </motion.div>
        </div>

        {/* Stepper (desktop only) */}
        <div className="mt-12 hidden items-center justify-center gap-3 lg:flex">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-3">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={`h-2 w-2 rounded-full ${
                    i === 0
                      ? "bg-pink-glow shadow-[0_0_8px_rgba(244,114,182,0.8)]"
                      : "border border-white/[0.12] bg-transparent"
                  }`}
                />
                <span
                  className={`text-[9px] font-semibold uppercase tracking-[0.15em] ${
                    i === 0 ? "text-pink-glow" : "text-dim/30"
                  }`}
                >
                  {label}
                </span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="mb-3 h-px w-8 bg-gradient-to-r from-white/[0.08] to-transparent" />
              )}
            </div>
          ))}
        </div>

        {/* Desktop: two-column split (unchanged) */}
        <div className="mt-16 hidden flex-1 grid-cols-2 gap-8 lg:grid lg:items-center">
          {/* Left Card: Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center rounded-[40px] border border-white/[0.06] bg-white/[0.02] p-10 text-center backdrop-blur-xl ring-1 ring-white/[0.04] lg:justify-center"
          >
            <div className="relative mb-10 flex h-24 w-24 items-center justify-center rounded-full border border-pink-glow/15 bg-pink-glow/[0.04]">
              <div className="absolute inset-0 rounded-full bg-pink-glow/[0.06] blur-xl" />
              <Users className="relative h-10 w-10 text-pink-glow" />
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="h-px w-4 bg-pink-glow/20" />
              <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-pink-glow/80">
                ◆ TU CÓDIGO DE MESA ◆
              </span>
              <div className="h-px w-4 bg-pink-glow/20" />
            </div>

            <h2 className="mb-10 font-mono text-[clamp(2.5rem,6vw,4rem)] font-bold tracking-[0.25em] text-light">
              {normalizedCode}
            </h2>

            <div className="mb-10 flex w-full items-center justify-center gap-6 opacity-20">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-light" />
              <Flower2 className="h-4 w-4 text-rose" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-light" />
            </div>

            <h1 className="mb-5 font-serif text-[clamp(1.75rem,4vw,2.5rem)] font-medium leading-tight text-light">
              Identifícate para
              <br />
              entrar a tu mesa
            </h1>

            <p className="max-w-xs text-[15px] leading-relaxed text-dim">
              Estás a un paso de unirte a tu grupo y comenzar a disfrutar de una gran experiencia.
            </p>
          </motion.div>

          {/* Right Card: Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut", delay: 0.1 }}
            className="flex flex-col rounded-[40px] border border-white/[0.06] bg-white/[0.02] p-10 backdrop-blur-xl ring-1 ring-white/[0.04] lg:justify-center"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-8">
              <div className="flex flex-col gap-3">
                <label className="text-[11px] font-bold uppercase tracking-[0.28em] text-dim">
                  TU NOMBRE
                </label>
                <div className="group relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <User className="h-5 w-5 text-dim/50 transition-colors group-focus-within:text-pink-glow" />
                  </div>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="¿Cómo quieres que te llamen?"
                    className="h-16 w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] pl-14 pr-6 text-lg text-light placeholder:text-dim/30 outline-none transition-all focus:border-pink-glow/25 focus:bg-white/[0.05] focus:ring-4 focus:ring-pink-glow/10"
                    maxLength={40}
                    required
                  />
                </div>
                <p className="text-[12px] italic text-dim/50">
                  Tu nombre será visible para el mesero y tu grupo.
                </p>
              </div>

              {requiresJoinCode && (
                <div className="flex flex-col gap-3">
                  <label className="text-[11px] font-bold uppercase tracking-[0.28em] text-dim">
                    CÓDIGO DE ACCESO
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={(e) =>
                      setJoinCode(
                        e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4),
                      )
                    }
                    placeholder="XXXX"
                    className="h-20 w-full rounded-2xl border border-white/[0.06] bg-white/[0.03] text-center text-3xl font-bold tracking-[0.5em] text-light outline-none transition-all focus:border-pink-glow/25 focus:bg-white/[0.05] focus:ring-4 focus:ring-pink-glow/10"
                    maxLength={4}
                    required
                  />
                  <p className="text-[12px] italic text-dim/50">
                    Pídele el código de 4 dígitos al anfitrión de la mesa.
                  </p>
                </div>
              )}

              {submitError && (
                <div className="rounded-xl border border-pink-light-glow/20 bg-pink-light-glow/[0.06] p-4 text-[13px] leading-relaxed text-rose-pale">
                  {submitError}
                </div>
              )}

              <div className="flex flex-col gap-5">
                <div className="flex items-center gap-3 text-[12px] text-dim/70">
                  <ShieldCheck className="h-4 w-4 text-pink-glow/50" />
                  Puedes continuar con al menos 2 letras.
                </div>

                <button
                  type="submit"
                  disabled={!canContinue || isSubmitting}
                  className="group relative h-16 w-full overflow-hidden rounded-2xl bg-rose text-sm font-bold uppercase tracking-[0.12em] text-white shadow-[0_10px_30px_-10px_rgba(199,91,122,0.5)] transition-all hover:bg-rose-light hover:shadow-[0_14px_36px_-12px_rgba(199,91,122,0.55)] active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:shadow-none disabled:hover:scale-100 disabled:hover:bg-rose"
                >
                  <div className="pointer-events-none absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Entrando…
                    </span>
                  ) : (
                    "ENTRAR A LA MESA"
                  )}
                </button>

                <Link
                  href="/"
                  className="mx-auto text-[13px] text-dim/60 underline underline-offset-8 decoration-white/[0.08] transition-all hover:text-light hover:decoration-pink-glow/40"
                >
                  Volver al inicio
                </Link>
              </div>
            </form>
          </motion.div>
        </div>

        {/* ─── Footer ─── */}
        <footer className="mt-8 flex flex-col items-center gap-4 pb-6 sm:mt-16 sm:gap-6 sm:pb-4">
          <div className="flex w-full items-center gap-6 opacity-[0.08]">
            <div className="h-px flex-1 bg-gradient-to-r from-transparent to-light" />
            <Flower2 className="h-5 w-5 text-rose" />
            <div className="h-px flex-1 bg-gradient-to-l from-transparent to-light" />
          </div>
          <div className="flex flex-col items-center gap-1.5 text-center">
            <p className="text-[12px] font-medium text-dim/50">
              Gracias por elegirnos.
            </p>
            <p className="text-[12px] font-medium text-dim/50">
              Que disfrutes tu visita.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}
