import Link from "next/link";
import Image from "next/image";
import { Flower2 } from "lucide-react";
import { BouquetLogo } from "@/components/landing/BouquetLogo";
import floralLeft from "@/assets/floral-assets/branches/complete_2.png";
import floralRight from "@/assets/floral-assets/branches/complete_3.png";

export default function NotFound() {
  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-ink text-light font-sans selection:bg-pink-glow/20">
      {/* ── Atmosphere ── */}
      <div className="pointer-events-none absolute inset-0 z-0" aria-hidden>
        {/* Radial glows */}
        <div className="absolute -left-32 -top-20 h-[600px] w-[600px] rounded-full bg-pink-glow/[0.05] blur-3xl" />
        <div className="absolute -right-32 -bottom-20 h-[500px] w-[500px] rounded-full bg-dash-green/[0.03] blur-3xl" />

        {/* Floral decorations */}
        <div className="absolute -left-[4%] top-1/3 -translate-y-1/2">
          <Image
            src={floralLeft}
            alt=""
            priority
            className="h-[500px] w-auto -rotate-[10deg] opacity-[0.04] mix-blend-overlay grayscale lg:h-[800px]"
          />
        </div>
        <div className="absolute -right-[4%] bottom-1/3 translate-y-1/2">
          <Image
            src={floralRight}
            alt=""
            priority
            className="h-[500px] w-auto rotate-[12deg] opacity-[0.03] mix-blend-overlay grayscale lg:h-[800px]"
          />
        </div>

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-ink/30" />
      </div>

      {/* ── Film grain ── */}
      <div className="bq-grain opacity-[0.025]" aria-hidden />

      {/* ── Top rule ── */}
      <div className="relative z-10 h-px w-full bg-wire" />

      {/* ── Logo ── */}
      <div className="relative z-10 px-6 pt-8 sm:px-10 lg:px-16 lg:pt-12">
        <div className="mx-auto max-w-7xl">
          <Link href="/" className="inline-flex transition-opacity hover:opacity-70" aria-label="Bouquet — volver al inicio">
            <BouquetLogo variant="light" size="sm" />
          </Link>
        </div>
      </div>

      {/* ── Main content ── */}
      <div className="relative z-10 flex flex-grow flex-col justify-center px-6 sm:px-10 lg:px-16">
        <div className="mx-auto w-full max-w-7xl">

          {/* Status label */}
          <p
            className="text-[0.56rem] font-bold uppercase tracking-[0.44em] text-dim"
            style={{ animation: "fade-in 0.4s ease-out both" }}
          >
            Error 404
          </p>

          {/* Large number */}
          <div
            className="pb-4"
            style={{ animation: "reveal-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both" }}
          >
            <p
              className="font-serif font-medium leading-[0.9] tracking-[-0.06em] text-light/[0.055] select-none"
              aria-hidden="true"
              style={{ fontSize: "clamp(8rem,28vw,22rem)" }}
            >
              404
            </p>
          </div>

          {/* Message */}
          <div
            className="-mt-2 max-w-[36ch] sm:-mt-4"
            style={{ animation: "reveal-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.14s both" }}
          >
            <h1 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-light">
              Esta página<br />
              <span className="italic text-pink-glow/60">no está en el menú.</span>
            </h1>

            {/* Flower divider */}
            <div className="my-5 flex items-center gap-4 opacity-[0.15] sm:my-6">
              <div className="h-px flex-1 bg-gradient-to-r from-transparent to-light" />
              <Flower2 className="h-4 w-4 text-rose" />
              <div className="h-px flex-1 bg-gradient-to-l from-transparent to-light" />
            </div>

            <p className="text-[0.85rem] leading-[1.75] text-dim sm:text-[0.92rem]">
              La dirección que buscas no existe o fue movida.<br className="hidden sm:block" />
              Verifica el enlace o vuelve al inicio para seguir explorando.
            </p>
          </div>

          {/* Actions */}
          <div
            className="mt-8 flex flex-wrap items-center gap-4 sm:mt-10 sm:gap-5"
            style={{ animation: "fade-in 0.5s ease-out 0.3s both" }}
          >
            <Link
              href="/"
              className="group relative inline-flex h-12 items-center gap-2.5 overflow-hidden rounded-full bg-rose px-6 text-[0.72rem] font-bold uppercase tracking-[0.15em] text-white shadow-[0_10px_30px_-10px_rgba(199,91,122,0.5)] transition-all hover:bg-rose-light hover:shadow-[0_14px_36px_-12px_rgba(199,91,122,0.55)] active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-pink-glow/50"
            >
              <div className="pointer-events-none absolute inset-0 -translate-x-full rounded-full bg-gradient-to-r from-transparent via-white/15 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
              Volver al inicio
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                <path d="M2 8h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/#contacto"
              className="inline-flex min-h-[44px] items-center rounded-full border border-white/[0.08] px-5 py-2.5 text-[0.72rem] font-semibold text-dim/80 transition-all hover:border-white/[0.15] hover:text-light"
            >
              Contactar soporte
            </Link>
          </div>

        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div
        className="relative z-10 border-t border-wire px-6 py-5 sm:px-10 lg:px-16"
        style={{ animation: "fade-in 0.5s ease-out 0.4s both" }}
      >
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <p className="text-[0.6rem] font-medium text-dim/40">
            Bouquet Operations · {new Date().getFullYear()}
          </p>
          <p className="text-[0.6rem] font-medium text-dim/30">
            Hecho en México
          </p>
        </div>
      </div>
    </div>
  );
}
