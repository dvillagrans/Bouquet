"use client";

import Image from "next/image";
import { useRef, useState, useCallback } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import floralBranch from "@/assets/floral-assets/branches/complete.png";

gsap.registerPlugin(ScrollTrigger);

const testimonials = [
  {
    quote:
      "Antes perdíamos horas cerrando caja y cuadrando cuentas. Con Bouquet cobramos más rápido y la sala ya no se queda esperando al cierre.",
    name: "Rodrigo Castellanos",
    context: "Dueño de restaurante · CDMX",
    operation: "Operación de +90 cubiertos nocturnos, 2 sucursales",
    initials: "RC",
  },
  {
    quote:
      "El KDS cambió todo. La cocina ya sabe qué sigue sin que nadie grite. Los tiempos bajaron y los errores casi desaparecieron.",
    name: "Mariana Torres",
    context: "Gerente de operaciones · Guadalajara",
    operation: "Cadena de 4 restaurantes de servicio completo",
    initials: "MT",
  },
  {
    quote:
      "Con la división de cuenta por comensal dejamos de perder tiempo al cierre. Los clientes se van más contentos y el equipo también.",
    name: "Carlos Mendoza",
    context: "Propietario · Monterrey",
    operation: "Bar y coctelería, turnos de alta demanda",
    initials: "CM",
  },
];

export const SocialProof = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLQuoteElement>(null);
  const authorRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const isAnimating = useRef(false);

  const animateTransition = useCallback((newIndex: number, direction: "next" | "prev") => {
    if (isAnimating.current || !quoteRef.current || !authorRef.current) return;
    isAnimating.current = true;
    const xOut = direction === "next" ? -30 : 30;
    const xIn = direction === "next" ? 30 : -30;

    const tl = gsap.timeline({
      onComplete: () => {
        isAnimating.current = false;
      },
    });

    tl.to(quoteRef.current, { opacity: 0, x: xOut, duration: 0.35, ease: "power2.in" })
      .to(authorRef.current, { opacity: 0, duration: 0.25, ease: "power2.in" }, 0)
      .add(() => setActive(newIndex))
      .fromTo(quoteRef.current, { opacity: 0, x: xIn }, { opacity: 1, x: 0, duration: 0.4, ease: "power2.out" })
      .fromTo(authorRef.current, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" }, "-=0.2");
  }, []);

  const go = useCallback((direction: "next" | "prev") => {
    if (isAnimating.current) return;
    const newIndex =
      direction === "next"
        ? (active + 1) % testimonials.length
        : active === 0
          ? testimonials.length - 1
          : active - 1;
    animateTransition(newIndex, direction);
  }, [active, animateTransition]);

  useGSAP(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set([".social-label", ".social-quote-wrap", ".social-author", ".social-nav"], { opacity: 1, y: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 80%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(".social-label", { y: 16, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" })
        .fromTo(
          ".social-quote-wrap",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" },
          "-=0.3"
        )
        .fromTo(
          ".social-author",
          { y: 16, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" },
          "-=0.4"
        )
        .fromTo(
          ".social-nav",
          { opacity: 0 },
          { opacity: 1, duration: 0.5, ease: "power2.out" },
          "-=0.3"
        );
    }, sectionRef);

    return () => ctx.revert();
  }, { scope: sectionRef });

  const current = testimonials[active];

  return (
    <section ref={sectionRef} className="relative flex min-h-[90dvh] flex-col justify-center overflow-hidden bg-burgundy py-24 lg:py-32">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(201,80,100,0.08) 0%, transparent 65%)",
        }}
      />

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-0 h-40 bg-gradient-to-b from-black/20 via-transparent to-transparent"
      />

      <Image
        src={floralBranch}
        alt=""
        fill
        sizes="60vw"
        className="pointer-events-none absolute left-0 top-0 z-0 h-full w-[55%] object-cover object-left opacity-[0.04] mix-blend-overlay grayscale"
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto w-full max-w-6xl px-6 lg:px-12">
        <div className="social-label opacity-0 flex items-center justify-center gap-4">
          <span className="h-px w-10 bg-white/20" aria-hidden="true" />
          <span className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/35">
            Prueba social
          </span>
          <span className="h-px w-10 bg-white/20" aria-hidden="true" />
        </div>

        <div className="social-quote-wrap mx-auto mt-16 max-w-4xl text-center opacity-0 relative">
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-2 -top-8 font-serif text-[6rem] leading-none text-rose/20 select-none md:-left-6 md:text-[8rem]"
          >
            &ldquo;
          </span>
          <span aria-hidden="true" className="pointer-events-none absolute -left-2 -top-8 font-serif text-[6rem] leading-none text-rose/20 select-none md:-left-6 md:text-[8rem]">
            &ldquo;
          </span>
          <blockquote ref={quoteRef} className="relative font-serif text-2xl font-medium italic leading-[1.3] tracking-tight text-white/90 md:text-4xl lg:text-[2.75rem] lg:leading-[1.25]">
            {current.quote}
          </blockquote>
        </div>

        <div ref={authorRef} className="social-author mt-12 flex flex-col items-center opacity-0">
          <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/10 bg-white/[0.06] font-serif text-sm font-semibold italic text-white/80">
            {current.initials}
          </span>
          <p className="mt-4 text-base font-medium text-white">{current.name}</p>
          <p className="mt-1 text-sm text-white/50">{current.context}</p>
          <p className="mt-2 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-rose/60">{current.operation}</p>
        </div>

        <div className="social-nav mt-10 flex items-center justify-center gap-2 opacity-0">
          {testimonials.map((_, i) => (
            <button
              key={i}
              onClick={() => {
                if (isAnimating.current || i === active) return;
                animateTransition(i, i > active ? "next" : "prev");
              }}
              aria-label={`Ver testimonio ${i + 1}`}
              className={`h-1.5 rounded-full transition-all duration-300 ${i === active ? "w-6 bg-rose" : "w-1.5 bg-white/20 hover:bg-white/40"}`}
            />
          ))}
        </div>
      </div>

      <button onClick={() => go("prev")} aria-label="Anterior testimonio" className="social-nav absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 opacity-0 md:left-12 lg:flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/40 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/[0.08] hover:text-white">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M12 4l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>
      <button onClick={() => go("next")} aria-label="Siguiente testimonio" className="social-nav absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 opacity-0 md:right-12 lg:flex h-12 w-12 items-center justify-center rounded-full border border-white/15 bg-white/[0.03] text-white/40 backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/[0.08] hover:text-white">
        <svg className="h-4 w-4" viewBox="0 0 20 20" fill="none" aria-hidden="true"><path d="M8 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
      </button>
    </section>
  );
};
