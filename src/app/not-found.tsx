import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col bg-ink text-light">

      {/* Top rule */}
      <div className="h-px w-full bg-wire" />

      {/* Logo */}
      <div className="px-8 pt-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <Link
            href="/"
            className="inline-flex items-baseline gap-2 transition-opacity hover:opacity-50"
            aria-label="Bouquet — volver al inicio"
          >
            <span className="font-serif text-[1.4rem] font-semibold italic tracking-tight text-light/70">
              bouquet
            </span>
            <span className="text-[0.5rem] font-bold uppercase tracking-[0.34em] text-dim">ops</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-grow flex-col justify-center px-8 lg:px-16">
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
            className="overflow-hidden"
            style={{ animation: "reveal-up 0.55s cubic-bezier(0.22,1,0.36,1) 0.05s both" }}
          >
            <p
              className="font-serif font-medium leading-[0.82] tracking-[-0.05em] text-light/[0.07]"
              aria-hidden="true"
              style={{ fontSize: "clamp(8rem,28vw,22rem)" }}
            >
              404
            </p>
          </div>

          {/* Message */}
          <div
            className="-mt-4 max-w-[32ch]"
            style={{ animation: "reveal-up 0.6s cubic-bezier(0.22,1,0.36,1) 0.14s both" }}
          >
            <h1 className="font-serif text-[clamp(1.8rem,4vw,3rem)] font-medium leading-[1.05] tracking-[-0.02em] text-light">
              Esta página<br />
              <span className="italic text-light/45">no está en el menú.</span>
            </h1>
            <p className="mt-5 text-[0.82rem] font-medium leading-[1.8] text-dim">
              La dirección que buscas no existe o fue movida. Verifica el enlace o vuelve al inicio.
            </p>
          </div>

          {/* Actions */}
          <div
            className="mt-10 flex flex-wrap items-center gap-5"
            style={{ animation: "fade-in 0.5s ease-out 0.3s both" }}
          >
            <Link
              href="/"
              className="inline-flex items-center gap-2 bg-cream px-7 py-3.5 text-[0.72rem] font-bold uppercase tracking-[0.22em] text-charcoal transition-all duration-200 hover:-translate-y-px focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
            >
              Volver al inicio
              <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" aria-hidden="true">
                <path d="M2 8h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link
              href="/#contacto"
              className="inline-flex min-h-[44px] items-center text-[0.72rem] font-semibold text-dim underline underline-offset-4 decoration-dim/30 transition-colors hover:text-light hover:decoration-light/40"
            >
              Contactar soporte
            </Link>
          </div>

        </div>
      </div>

      {/* Bottom bar */}
      <div
        className="border-t border-wire px-8 py-5 lg:px-16"
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
