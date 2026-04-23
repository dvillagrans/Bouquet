"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckoutSuccessScreenProps {
  guestName: string;
  isLastPayer: boolean;
  branchName: string;
}

export default function CheckoutSuccessScreen({
  guestName,
  isLastPayer,
  branchName,
}: CheckoutSuccessScreenProps) {
  const [rating, setRating] = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const reduceMotion = useReducedMotion();

  function handleRate(star: number) {
    setRating(star);
  }

  function handleSubmitRating() {
    if (!rating) return;
    setSubmitted(true);
    window.setTimeout(() => {
      window.location.href = "/";
    }, 360);
  }

  return (
    <main className="fixed inset-0 z-50 overflow-x-hidden bg-bg-solid text-center">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.9]"
        style={{
          background:
            "radial-gradient(120% 90% at 20% 0%, rgba(201,160,84,0.16), transparent 56%), radial-gradient(120% 90% at 80% 100%, rgba(77,132,96,0.15), transparent 58%), linear-gradient(180deg, rgba(7,8,10,0.96), rgba(9,10,12,1))",
        }}
      />

      {!reduceMotion && (
        <>
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -left-24 top-16 h-72 w-72 rounded-full blur-3xl"
            style={{ background: "rgba(201,160,84,0.18)" }}
            animate={{ x: [0, 24, 0], y: [0, -18, 0], opacity: [0.45, 0.65, 0.45] }}
            transition={{ duration: 8.5, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
          <motion.div
            aria-hidden
            className="pointer-events-none absolute -right-20 bottom-10 h-64 w-64 rounded-full blur-3xl"
            style={{ background: "rgba(77,132,96,0.2)" }}
            animate={{ x: [0, -20, 0], y: [0, 14, 0], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: 9.2, repeat: Number.POSITIVE_INFINITY, ease: "easeInOut" }}
          />
        </>
      )}

      <div className="relative flex min-h-dvh items-center justify-center px-6 py-10">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: reduceMotion ? 0.2 : 0.62, ease: [0.22, 1, 0.36, 1] }}
        className="relative flex w-full max-w-md flex-col items-center overflow-hidden rounded-3xl border border-gold/20 bg-bg-card/75 px-7 py-10 shadow-[0_28px_90px_-32px_rgba(0,0,0,0.9)] backdrop-blur-2xl sm:px-10"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(80% 120% at 50% 0%, rgba(201,160,84,0.1), transparent 62%), linear-gradient(180deg, rgba(255,255,255,0.02), transparent 42%)",
          }}
        />

        {/* Logo / Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.84 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.08, duration: reduceMotion ? 0.2 : 0.5 }}
          className="mb-8 flex h-[76px] w-[76px] items-center justify-center rounded-full border border-gold/35 bg-gold/10 shadow-[0_0_42px_rgba(201,160,84,0.22)]"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            className="h-9 w-9 text-gold"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.14, duration: reduceMotion ? 0.2 : 0.42 }}
          className="font-serif text-[clamp(2rem,7.2vw,3rem)] font-medium leading-[1.03] tracking-tight text-light"
        >
          ¡Gracias, {guestName}!
        </motion.h1>

        {/* Message */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.2, duration: reduceMotion ? 0.2 : 0.42 }}
          className="mt-4 max-w-[26ch] font-sans text-[15px] leading-relaxed text-text-muted"
        >
          {isLastPayer ? (
            <>
              Fue un placer atenderte<br />en <span className="text-light">{branchName}</span>.
            </>
          ) : (
            <>
              Tu parte está lista.<br />Los demás de tu mesa<br />aún están pagando.
            </>
          )}
        </motion.p>

        {/* Rating component */}
        {!submitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: reduceMotion ? 0 : 0.26, duration: reduceMotion ? 0.2 : 0.4 }}
            className="mt-12 w-full max-w-[270px]"
          >
            <p className="mb-4 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-text-muted">
              Califica tu experiencia
            </p>
            <div className="flex items-center justify-between rounded-2xl border border-gold/18 bg-bg-solid/55 px-3 py-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => handleRate(star)}
                  className="group relative flex h-11 w-11 items-center justify-center rounded-full transition-transform duration-300 hover:scale-110 active:scale-95"
                  aria-label={`Calificar con ${star} estrellas`}
                >
                  <Star
                    className={cn(
                      "h-7 w-7 transition-colors duration-300",
                      rating && star <= rating
                        ? "fill-gold text-gold"
                        : "text-border-main group-hover:text-gold/55"
                    )}
                    strokeWidth={1.5}
                  />
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <AnimatePresence>
            <motion.div
              initial={{ opacity: 0, y: 6, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: reduceMotion ? 0.2 : 0.34 }}
              className="mt-12 flex w-full max-w-[270px] items-center justify-center gap-2 rounded-2xl border border-dash-green/28 bg-dash-green/10 px-4 py-3"
            >
              <CheckCircle2 className="h-4 w-4 text-dash-green" strokeWidth={2} />
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.12em] text-dash-green">
                Gracias por tu calificación
              </p>
            </motion.div>
          </AnimatePresence>
        )}

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.3, duration: reduceMotion ? 0.2 : 0.4 }}
          className="mt-14 w-full max-w-[270px]"
        >
          <button
            type="button"
            onClick={handleSubmitRating}
            disabled={!rating || submitted}
            className="inline-flex min-h-11 w-full items-center justify-center rounded-full border border-gold/35 bg-gold/92 px-9 text-[0.68rem] font-bold uppercase tracking-[0.18em] text-charcoal transition-transform duration-300 hover:-translate-y-px hover:bg-gold-light active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-45"
          >
            Enviar y continuar
          </button>
        </motion.div>

        {/* Minimal branding */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: reduceMotion ? 0 : 0.36, duration: reduceMotion ? 0.2 : 0.42 }}
          className="mt-20 font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-border-main"
        >
          POWERED BY BOUQUET
        </motion.div>
      </motion.div>
      </div>
    </main>
  );
}
