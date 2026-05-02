"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Users, User, ShieldCheck, Sun, ArrowLeft, Flower2 } from "lucide-react";
import { guestJoinTable } from "@/actions/comensal";
import { GuestMenuThemeToggle } from "@/components/guest/GuestMenuThemeToggle";
import { useGuestMenuTheme } from "@/hooks/useGuestMenuTheme";

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
  requiresJoinCode = false 
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
    <main className="relative min-h-screen w-full overflow-hidden bg-[#1c0d12] font-sans text-light antialiased selection:bg-pink-glow/20">
      {/* ─── Background Decoration ─── */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <motion.div 
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 0.15, x: 0 }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          className="absolute -left-32 top-1/2 -translate-y-1/2"
        >
          <img src="/floral-assets/branches/complete_2.png" alt="" className="h-[800px] w-auto rotate-[-15deg] brightness-0 invert" />
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 0.15, x: 0 }}
          transition={{ duration: 1.5, ease: "easeOut", delay: 0.2 }}
          className="absolute -right-32 top-1/2 -translate-y-1/2"
        >
          <img src="/floral-assets/branches/complete_3.png" alt="" className="h-[800px] w-auto rotate-[15deg] brightness-0 invert" />
        </motion.div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1c0d12]/60 to-[#1c0d12]" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-8">
        {/* ─── Header ─── */}
        <header className="flex items-center justify-between">
          <Link href="/" className="group flex items-baseline gap-2">
            <span className="text-2xl font-semibold tracking-tight text-white group-hover:text-pink-glow transition-colors">
              bouquet
            </span>
            <span className="text-[10px] font-bold uppercase tracking-[0.4em] text-dim">
              ops
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <button className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-dim hover:text-white transition-all">
              <Sun className="h-5 w-5" />
            </button>
          </div>
        </header>

        {/* ─── Stepper ─── */}
        <div className="mt-12 flex items-center justify-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-pink-glow shadow-[0_0_8px_rgba(244,114,182,0.8)]" />
            <span className="text-[11px] font-bold uppercase tracking-widest text-pink-glow">Listo para unirte</span>
          </div>
          <div className="h-[1px] w-12 bg-white/10" />
          <div className="h-2 w-2 rounded-full border border-white/20 bg-transparent" />
          <div className="h-[1px] w-12 bg-white/10" />
          <div className="h-2 w-2 rounded-full border border-white/20 bg-transparent" />
          <div className="h-[1px] w-12 bg-white/10" />
          <div className="h-2 w-2 rounded-full border border-white/20 bg-transparent" />
        </div>

        {/* ─── Main Content ─── */}
        <div className="mt-16 grid flex-1 grid-cols-1 gap-8 lg:grid-cols-2 lg:items-center">
          
          {/* Left Card: Info */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="flex flex-col items-center rounded-[40px] border border-white/10 bg-white/[0.03] p-10 text-center backdrop-blur-xl lg:h-[600px] lg:justify-center"
          >
            <div className="relative mb-12 flex h-24 w-24 items-center justify-center rounded-full border border-pink-glow/20 bg-pink-glow/5">
              <div className="absolute inset-0 rounded-full bg-pink-glow/10 blur-xl" />
              <Users className="relative h-10 w-10 text-pink-glow" />
            </div>

            <div className="mb-6 flex items-center gap-3">
              <div className="h-[1px] w-4 bg-pink-glow/30" />
              <span className="text-[11px] font-bold uppercase tracking-[0.4em] text-pink-glow">
                ◆ TU CÓDIGO DE MESA ◆
              </span>
              <div className="h-[1px] w-4 bg-pink-glow/30" />
            </div>

            <h2 className="mb-10 font-mono text-[clamp(2.5rem,6vw,4rem)] font-bold tracking-[0.25em] text-white">
              {normalizedCode}
            </h2>

            <div className="mb-10 flex w-full items-center justify-center gap-6 opacity-30">
              <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white" />
              <Flower2 className="h-4 w-4" />
              <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white" />
            </div>

            <h1 className="mb-6 font-serif text-[clamp(1.75rem,4vw,2.5rem)] font-medium leading-tight text-white">
              Identifícate para<br />entrar a tu mesa
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
            className="flex flex-col rounded-[40px] border border-white/10 bg-white/[0.03] p-10 backdrop-blur-xl lg:h-[600px] lg:justify-center"
          >
            <form onSubmit={handleSubmit} className="flex flex-col gap-10">
              <div className="flex flex-col gap-4">
                <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-dim">
                  TU NOMBRE
                </label>
                <div className="group relative">
                  <div className="absolute left-5 top-1/2 -translate-y-1/2">
                    <User className="h-5 w-5 text-dim group-focus-within:text-pink-glow transition-colors" />
                  </div>
                  <input
                    type="text"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="¿Cómo quieres que te llamen?"
                    className="h-16 w-full rounded-2xl border border-white/10 bg-white/5 pl-14 pr-6 text-lg text-white placeholder:text-dim/60 focus:border-pink-glow/30 focus:outline-none focus:ring-4 focus:ring-pink-glow/5 transition-all"
                    maxLength={40}
                    required
                  />
                </div>
                <p className="text-[12px] text-dim/60 italic">
                  Tu nombre será visible para el mesero y tu grupo.
                </p>
              </div>

              {requiresJoinCode && (
                <div className="flex flex-col gap-4">
                  <label className="text-[11px] font-bold uppercase tracking-[0.3em] text-dim">
                    CÓDIGO DE ACCESO
                  </label>
                  <input
                    type="text"
                    value={joinCode}
                    onChange={e => setJoinCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 4))}
                    placeholder="XXXX"
                    className="h-20 w-full rounded-2xl border border-white/10 bg-white/5 text-center text-3xl font-bold tracking-[0.5em] text-white focus:border-pink-glow/30 focus:outline-none transition-all"
                    maxLength={4}
                    required
                  />
                  <p className="text-[12px] text-dim/60 italic">
                    Pídele el código de 4 dígitos al anfitrión de la mesa.
                  </p>
                </div>
              )}

              {submitError && (
                <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-[13px] text-red-400">
                  {submitError}
                </div>
              )}

              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-3 text-[12px] text-dim/80">
                  <ShieldCheck className="h-4 w-4 text-pink-glow/60" />
                  Puedes continuar con al menos 2 letras.
                </div>

                <button
                  type="submit"
                  disabled={!canContinue || isSubmitting}
                  className="relative h-16 w-full overflow-hidden rounded-2xl bg-gradient-to-r from-[#d946ef] to-[#db2777] font-bold uppercase tracking-widest text-white shadow-[0_10px_30px_-10px_rgba(219,39,119,0.5)] transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 disabled:hover:scale-100"
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center gap-3">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Entrando...
                    </div>
                  ) : (
                    "ENTRAR A LA MESA"
                  )}
                </button>

                <Link 
                  href="/"
                  className="mx-auto text-[13px] text-dim underline underline-offset-8 decoration-white/10 hover:text-white hover:decoration-pink-glow transition-all"
                >
                  Volver al inicio
                </Link>
              </div>
            </form>
          </motion.div>
        </div>

        {/* ─── Footer ─── */}
        <footer className="mt-16 flex flex-col items-center gap-4">
          <div className="flex w-full items-center gap-6 opacity-10">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-white" />
            <Flower2 className="h-5 w-5" />
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-white" />
          </div>
          <div className="flex flex-col items-center text-center">
            <p className="text-[13px] font-medium text-dim/60">
              Gracias por elegirnos.
            </p>
            <p className="text-[13px] font-medium text-dim/60">
              Que disfrutes tu visita.
            </p>
          </div>
        </footer>
      </div>
    </main>
  );
}

