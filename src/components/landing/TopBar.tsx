"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BouquetLogo } from "./BouquetLogo";

const nav = [
  { label: "Plataforma", href: "#producto" },
  { label: "Flujo", href: "#como-funciona" },
  { label: "Segmentos", href: "#segmentos" },
  { label: "Contacto", href: "#contacto" },
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
      className="fixed inset-x-0 top-0 z-50 animate-[fade-in_0.5s_ease-out_forwards]"
      aria-label="Barra de navegación"
    >
      <div
        className={[
          "mx-auto flex items-center justify-between transition-[max-width,padding,background,border-color,box-shadow,border-radius,margin] duration-[500ms]",
          "ease-[cubic-bezier(0.32,0.72,0,1)]",
          scrolled
            ? "mt-4 max-w-[min(1180px,calc(100vw-1.5rem))] rounded-full border border-burgundy/10 bg-rose-cream/85 px-4 py-2.5 shadow-[0_18px_50px_-30px_rgba(74,26,44,0.25)] backdrop-blur-xl lg:px-6 lg:py-3"
            : "mt-0 max-w-7xl rounded-none border border-transparent bg-transparent px-6 py-4 lg:px-10 lg:py-5",
        ].join(" ")}
      >
        {/* Logo */}
        <Link href="/" className="shrink-0">
          <BouquetLogo size={scrolled ? "sm" : "md"} variant="dark" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center lg:flex lg:gap-8 xl:gap-10" aria-label="Menú principal">
          {nav.map(({ label, href }) => (
            <Link
              key={href}
              href={href}
              className="relative whitespace-nowrap rounded-full px-4 py-2 text-[0.84rem] font-medium text-burgundy/65 transition-colors duration-200 hover:bg-burgundy/[0.04] hover:text-burgundy lg:px-5"
            >
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/scan"
            className="hidden lg:inline-flex text-[0.78rem] font-semibold text-burgundy/55 transition-colors hover:text-burgundy px-3"
          >
            App Comensal
          </Link>
          {/* Desktop CTA */}
          <Link
            href="#contacto"
            className={[
              "group relative isolate hidden shrink-0 overflow-hidden lg:inline-flex",
              "h-10 min-h-[40px] items-center gap-2 rounded-full px-5 py-2",
              "bg-burgundy text-[0.8125rem] font-semibold tracking-tight text-white",
              "shadow-[0_12px_34px_-14px_rgba(74,26,44,0.45)] ring-1 ring-white/12",
              "transition-[transform,background-color,box-shadow] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)]",
              "before:pointer-events-none before:absolute before:inset-0 before:rounded-full before:bg-gradient-to-b before:from-white/[0.07] before:to-transparent",
              "hover:-translate-y-[2px] hover:bg-burgundy-light hover:shadow-[0_16px_42px_-16px_rgba(74,26,44,0.4)] hover:ring-white/18",
              "active:translate-y-0 active:scale-[0.98]",
              "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose",
            ].join(" ")}
          >
            <span className="relative z-[1] shrink-0 whitespace-nowrap">
              Demo en 20 min
            </span>
            <span className="relative z-[1] flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-rose/95 text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.35)] ring-1 ring-burgundy/10 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:brightness-105">
              <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
          </Link>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen(!open)}
            className={[
              "flex items-center justify-center rounded-full border border-burgundy/10 text-burgundy/65 transition-[height,width,background-color,color] duration-300 hover:border-burgundy/25 hover:text-burgundy lg:hidden",
              scrolled ? "h-9 w-9 bg-white/40" : "h-11 w-11",
            ].join(" ")}
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

      {/* Mobile menu */}
      <div
        id="mobile-menu"
        aria-hidden={!open}
        className={[
          "mx-3 grid overflow-hidden lg:hidden",
          "transition-[grid-template-rows,margin,border-color,box-shadow,background-color,backdrop-filter] duration-[350ms] ease-[cubic-bezier(0.25,0.46,0.45,0.94)]",
          open
            ? "mt-2 grid-rows-[1fr] rounded-[1.5rem] border border-burgundy/10 bg-rose-cream/95 shadow-[0_30px_60px_-30px_rgba(74,26,44,0.25)] backdrop-blur-xl"
            : "pointer-events-none mt-0 grid-rows-[0fr] border-0 bg-transparent shadow-none backdrop-blur-none",
        ].join(" ")}
      >
        <div className="min-h-0">
          <nav className="mx-auto flex flex-col px-5 pb-6 pt-4" aria-label="Menú móvil">
            {nav.map(({ label, href }, i) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className="block border-b border-burgundy/10 py-4 text-[0.9rem] font-medium text-burgundy/68 transition-[opacity,transform] hover:text-burgundy active:bg-burgundy/[0.03]"
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
                className="block rounded-full bg-burgundy px-6 py-3.5 text-center text-sm font-semibold text-white transition-colors hover:bg-burgundy-light active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose"
              >
                Demo en 20 min
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};
