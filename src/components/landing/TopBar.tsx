"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const nav = [
  { label: "Producto",      href: "#producto"      },
  { label: "Cómo funciona", href: "#como-funciona" },
  { label: "Casos de uso",  href: "#casos"         },
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
        scrolled ? "bg-ink/95 backdrop-blur-xl border-b border-wire" : "bg-transparent"
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

        {/* Nav */}
        <nav className="hidden items-center gap-7 lg:flex">
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
          <Link
            href="#demo"
            id="contacto"
            className="hidden items-center gap-2 rounded-full border border-glow/30 bg-glow/10 px-5 py-2.5 text-[0.8rem] font-semibold text-glow transition-all duration-200 hover:bg-glow/18 lg:inline-flex"
          >
            Solicitar demo
          </Link>
          <button
            onClick={() => setOpen(!open)}
            className="flex h-9 w-9 items-center justify-center rounded-full border border-wire text-dim transition-colors hover:border-light/20 hover:text-light lg:hidden"
            aria-label={open ? "Cerrar" : "Menú"}
          >
            {open ? (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.75}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, maxHeight: 0 }}
            animate={{ opacity: 1, maxHeight: 400 }}
            exit={{ opacity: 0, maxHeight: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="overflow-hidden border-t border-wire bg-ink/98 backdrop-blur-xl lg:hidden"
          >
            <nav
              className="mx-auto flex max-w-7xl flex-col px-6 pb-8 pt-2"
              aria-label="Menú principal"
            >
              {nav.map(({ label, href }, i) => (
                <motion.div
                  key={href}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.05 + i * 0.06,
                    ease: [0.25, 0.46, 0.45, 0.94],
                  }}
                >
                  <Link
                    href={href}
                    onClick={() => setOpen(false)}
                    className="block border-b border-wire py-4 text-[0.9rem] font-medium text-dim transition-colors hover:text-light active:bg-light/5"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.28,
                  ease: [0.25, 0.46, 0.45, 0.94],
                }}
                className="mt-6 px-1"
              >
                <Link
                  href="#demo"
                  onClick={() => setOpen(false)}
                  className="block rounded-full bg-glow/15 px-6 py-3.5 text-center text-sm font-semibold text-glow transition-colors hover:bg-glow/25 active:scale-[0.98]"
                >
                  Solicitar demo
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
