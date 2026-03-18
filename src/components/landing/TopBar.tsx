"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

/*
 *  Fixes applied (audit):
 *  C-1  — removed id="contacto" from CTA button
 *  C-3  — removed #casos nav item (no target on page)
 *  H-2  — removed backdrop-blur-xl; flat bg-ink on scroll
 *  H-3  — replaced Framer Motion with CSS grid-template-rows transition
 *  M-3  — added aria-label to desktop <nav>
 *  CTAs — href updated to #contacto
 */

const nav = [
  { label: "Producto",      href: "#producto"      },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Contacto",      href: "#contacto"      },
];

export const TopBar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 opacity-0 animate-[fade-in_0.5s_ease-out_forwards] ${
        scrolled ? "bg-ink/97 border-b border-wire" : "bg-transparent"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4 lg:px-10 lg:py-5">

        {/* Logo */}
        <Link href="/" className="group flex items-baseline gap-2">
          <span className="font-serif text-[1.6rem] font-semibold italic tracking-tight text-light transition-opacity duration-200 group-hover:opacity-70">
            bouquet
          </span>
          <span className="mb-0.5 hidden text-[0.56rem] font-bold uppercase tracking-[0.38em] text-dim sm:block">
            ops
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Menú principal">
          {nav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="text-[0.85rem] font-medium text-dim transition-colors duration-200 hover:text-light"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {/* Desktop CTA — no id="contacto" here (belongs on the section) */}
          <Link
            href="#contacto"
            className="hidden items-center gap-2 border border-glow/25 px-5 py-2.5 text-[0.8rem] font-semibold text-glow transition-all duration-200 hover:border-glow/40 hover:bg-glow/[0.08] lg:inline-flex focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-glow"
          >
            Solicitar demo
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className="flex h-11 w-11 items-center justify-center rounded-full border border-wire text-dim transition-colors hover:border-light/20 hover:text-light lg:hidden"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            aria-expanded={open}
            aria-controls="mobile-menu"
          >
            {open ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/*
       *  Mobile menu — CSS only (no Framer Motion).
       *  Uses grid-template-rows: 0fr → 1fr transition to animate height
       *  without touching layout properties (width/height/padding).
       *  Individual items get staggered opacity+translateX via inline transition-delay.
       */}
      <div
        id="mobile-menu"
        className={`grid overflow-hidden border-t border-wire bg-ink transition-[grid-template-rows] duration-[350ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)] lg:hidden ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="min-h-0">
          <nav
            className="mx-auto flex max-w-7xl flex-col px-6 pb-8 pt-2"
            aria-label="Menú móvil"
          >
            {nav.map(({ label, href }, i) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block border-b border-wire py-4 text-[0.9rem] font-medium text-dim transition-[opacity,transform] hover:text-light active:bg-light/5"
                style={{
                  transitionDuration: "0.4s",
                  transitionDelay: open ? `${0.05 + i * 0.06}s` : "0s",
                  transitionTimingFunction: "cubic-bezier(0.25,0.46,0.45,0.94)",
                  opacity: open ? 1 : 0,
                  transform: open ? "translateX(0)" : "translateX(-12px)",
                }}
              >
                {label}
              </Link>
            ))}

            <div
              className="mt-6 px-1"
              style={{
                transitionProperty: "opacity, transform",
                transitionDuration: "0.4s",
                transitionDelay: open ? "0.26s" : "0s",
                transitionTimingFunction: "cubic-bezier(0.25,0.46,0.45,0.94)",
                opacity: open ? 1 : 0,
                transform: open ? "translateY(0)" : "translateY(8px)",
              }}
            >
              <Link
                href="#contacto"
                onClick={() => setOpen(false)}
                className="block bg-cream px-6 py-3.5 text-center text-sm font-semibold text-charcoal transition-colors hover:bg-ivory active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gold"
              >
                Solicitar demo
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
