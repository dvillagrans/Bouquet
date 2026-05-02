"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

import cardRestaurant from "@/assets/industries/card_restaurant_waiter.png";
import cardTaqueria from "@/assets/industries/card_taqueria_tacos.png";
import cardBar from "@/assets/industries/card_bar_cocktail.png";

export function ForWhoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  
  const card1Ref = useRef<HTMLDivElement>(null);
  const card2Ref = useRef<HTMLDivElement>(null);
  const card3Ref = useRef<HTMLDivElement>(null);
  
  const waiterRef = useRef<HTMLImageElement>(null);
  const tacosRef = useRef<HTMLImageElement>(null);
  const cocktailRef = useRef<HTMLImageElement>(null);

  useGSAP(
    () => {
      const prefersReduced = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReduced) {
        gsap.set(
          [".forwho-label", ".forwho-headline", ".forwho-desc", card1Ref.current, card2Ref.current, card3Ref.current],
          { opacity: 1, x: 0, y: 0 }
        );
        return;
      }

      const ctx = gsap.context(() => {
        // Header entrances
        gsap.fromTo(
          ".forwho-label",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".forwho-label",
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
        gsap.fromTo(
          ".forwho-headline",
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 1,
            ease: "power4.out",
            scrollTrigger: {
              trigger: ".forwho-headline",
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );
        gsap.fromTo(
          ".forwho-desc",
          { y: 20, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: ".forwho-desc",
              start: "top 85%",
              toggleActions: "play none none none",
            },
          }
        );

        // Cards entrance with stagger
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 75%",
            toggleActions: "play none none none",
          },
        });

        tl.fromTo(
          card1Ref.current,
          { x: -60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, ease: "power2.out" },
          0
        );
        tl.fromTo(
          card2Ref.current,
          { y: 60, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.7, ease: "power2.out" },
          0.2
        );
        tl.fromTo(
          card3Ref.current,
          { x: 60, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7, ease: "power2.out" },
          0.4
        );
      }, sectionRef);

      return () => ctx.revert();
    },
    { scope: sectionRef }
  );

  // Individual hover handlers
  const handleMouseEnter = (index: number) => {
    if (index === 0) {
      gsap.to(waiterRef.current, { y: -12, duration: 0.3, ease: "power2.out" });
      gsap.to(".card1-bg", { y: -4, duration: 0.3, ease: "power2.out" });
    } else if (index === 1) {
      gsap.to(tacosRef.current, { scale: 1.04, rotate: -1, duration: 0.3, ease: "power2.out" });
    } else if (index === 2) {
      gsap.to(cocktailRef.current, { y: -10, duration: 0.3, ease: "power2.out" });
      gsap.to(".card3-bg", { y: -3, duration: 0.3, ease: "power2.out" });
    }
  };

  const handleMouseLeave = (index: number) => {
    if (index === 0) {
      gsap.to(waiterRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(".card1-bg", { y: 0, duration: 0.3, ease: "power2.out" });
    } else if (index === 1) {
      // rotate resets to -2deg as per initial inline styling
      gsap.to(tacosRef.current, { scale: 1, rotate: -2, duration: 0.3, ease: "power2.out" });
    } else if (index === 2) {
      gsap.to(cocktailRef.current, { y: 0, duration: 0.3, ease: "power2.out" });
      gsap.to(".card3-bg", { y: 0, duration: 0.3, ease: "power2.out" });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="segmentos"
      className="relative flex min-h-[90dvh] flex-col justify-center overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#FDF2F5_0%,#F5D5DC_40%,#FAF6F3_100%)] py-24 lg:py-36"
    >
      {/* Capa atmosférica */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.3]"
        style={{
          backgroundImage:
            "radial-gradient(circle at 80% 20%, rgba(199,91,122,0.06) 0%, transparent 45%), radial-gradient(circle at 20% 80%, rgba(168,176,160,0.08) 0%, transparent 42%)",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[88rem] px-6 lg:px-12">
        {/* Header */}
        <div className="mb-6 flex flex-col items-center text-center lg:mb-8">
          <div className="forwho-label opacity-0 mb-6 flex flex-col items-center gap-3">
            <div className="flex items-center gap-4 text-[0.65rem] font-bold uppercase tracking-[0.34em] text-rose-900/40">
              <span className="h-px w-12 bg-gradient-to-r from-transparent to-rose-900/30" aria-hidden="true" />
              <span>PARA QUIÉN ES</span>
              <span className="h-px w-12 bg-gradient-to-l from-transparent to-rose-900/30" aria-hidden="true" />
            </div>
            <span className="text-[0.7rem] opacity-60">🌸</span>
          </div>
          <h2 className="forwho-headline opacity-0 font-serif text-[clamp(2.5rem,5vw,4.5rem)] font-medium italic leading-[1.05] tracking-tight text-rose-950">
            Diseñado para tu tipo de servicio.
          </h2>
          <p className="forwho-desc opacity-0 mx-auto mt-6 max-w-[500px] text-[1.1rem] leading-[1.6] text-rose-900/60 font-medium">
            No importa el formato: si tenés mesas, órdenes y pagos,<br className="hidden md:block"/> Bouquet se adapta a tu operación.
          </p>
        </div>

        {/* Layout Escénico Grid */}
        <div 
          ref={gridRef}
          className="grid gap-x-6 gap-y-24 md:grid-cols-2 lg:grid-cols-[1.1fr_1.6fr_0.8fr] lg:gap-y-0 lg:items-center"
        >
          {/* Card 1 — Restaurante de servicio completo */}
          <div
            ref={card1Ref}
            className="group relative h-[480px] lg:h-[480px] w-full overflow-visible rounded-[2rem] opacity-0 mt-12 lg:mt-0"
            onMouseEnter={() => handleMouseEnter(0)}
            onMouseLeave={() => handleMouseLeave(0)}
          >
            {/* Fondo decorativo interno */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-sm transition-all duration-500 group-hover:shadow-xl border border-white/60"
              style={{ background: "linear-gradient(145deg, #FFF0F4 0%, #FCE3EA 100%)" }}
            >
              <div className="card1-bg absolute inset-0" />
            </div>

            {/* Ilustración desbordante */}
            <Image
              ref={waiterRef}
              src={cardRestaurant}
              alt="Mesero tomando orden en restaurante"
              className="pointer-events-none absolute bottom-0 -left-[20%] z-20 h-[105%] w-auto max-w-none origin-bottom lg:-left-[35%] lg:h-[115%]"
              priority
            />

            {/* Contenido texto */}
            <div className="relative z-30 flex h-full flex-col justify-end p-6 pb-8 lg:absolute lg:right-0 lg:top-0 lg:bottom-0 lg:w-[60%] lg:justify-center lg:p-8 lg:pl-0">
              <span className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-rose-500">
                SERVICIO DE MESA
              </span>
              <h3 className="mb-3 font-serif text-[1.5rem] lg:text-[1.7rem] font-semibold leading-[1.1] text-rose-950">
                Restaurantes de<br/>servicio completo
              </h3>
              <p className="mb-6 text-[0.85rem] font-medium leading-[1.6] text-rose-900/70">
                Tu sala entera en una pantalla. Sabé qué mesa espera, qué pide y cuándo liberar cubiertos, sin correr a preguntar a cocina.
              </p>
              <a
                href="#contacto"
                className="inline-flex items-center gap-2 text-[0.82rem] font-bold text-rose-950 transition-colors hover:text-rose-600"
              >
                Ver cómo funciona
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Card 2 — Taquerías & Fast casual */}
          <div
            ref={card2Ref}
            className="group relative h-[440px] lg:h-[480px] w-full overflow-hidden rounded-[2rem] opacity-0 mt-12 lg:mt-0"
            onMouseEnter={() => handleMouseEnter(1)}
            onMouseLeave={() => handleMouseLeave(1)}
          >
            {/* Fondo interno clipeado */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-sm transition-all duration-500 group-hover:shadow-xl border border-white/60"
              style={{ background: "linear-gradient(145deg, #FDF9F1 0%, #F5EBE0 100%)" }}
            >
              <div className="card2-bg absolute inset-0" />
            </div>

            {/* Ilustración desbordante */}
            <Image
              ref={tacosRef}
              src={cardTaqueria}
              alt="Tacos en taquería"
              className="pointer-events-none absolute -right-[30%] top-[5%] z-20 h-auto w-[110%] max-w-none origin-center rotate-[-2deg] object-contain lg:-right-[25%] lg:top-[12%] lg:w-[85%]"
              priority
            />

            {/* Contenido texto */}
            <div className="relative z-30 flex h-full flex-col justify-end p-6 pb-8 lg:justify-center lg:p-12 lg:w-[50%]">
              <span className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-amber-700">
                VELOCIDAD Y VOLUMEN
              </span>
              <h3 className="mb-4 font-serif text-[1.8rem] lg:text-[2.2rem] font-semibold leading-[1.05] text-rose-950">
                Taquerías &<br/>Fast casual
              </h3>
              <p className="mb-6 text-[0.9rem] font-medium leading-[1.6] text-rose-900/70 max-w-[280px] lg:max-w-none">
                Comandas que llegan directo a la plancha. Cobro en segundos. Sin papelitos, sin gritos, sin cuentas que no cuadran al cierre.
              </p>
              <a
                href="#contacto"
                className="inline-flex items-center gap-2 text-[0.82rem] font-bold text-rose-950 transition-colors hover:text-amber-700"
              >
                Ver cómo funciona
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>

          {/* Card 3 — Bares & Coctelerías */}
          <div
            ref={card3Ref}
            className="group relative h-[500px] lg:h-[540px] w-full overflow-visible rounded-[2rem] opacity-0 mt-20 md:col-span-2 lg:col-span-1 lg:mt-0"
            onMouseEnter={() => handleMouseEnter(2)}
            onMouseLeave={() => handleMouseLeave(2)}
          >
            {/* Fondo interno clipeado */}
            <div
              className="absolute inset-0 overflow-hidden rounded-[2rem] shadow-sm transition-all duration-500 group-hover:shadow-xl border border-white/60"
              style={{ background: "linear-gradient(145deg, #F3F0FA 0%, #E6E0F5 100%)" }}
            >
              <div className="card3-bg absolute inset-0" />
            </div>

            {/* Ilustración desbordante */}
            <Image
              ref={cocktailRef}
              src={cardBar}
              alt="Cóctel en barra"
              className="pointer-events-none absolute -top-[15%] left-[60%] z-20 h-auto w-[160%] max-w-none -translate-x-1/2 lg:-top-[15%] lg:left-[65%] lg:w-[190%]"
              priority
            />

            {/* Contenido texto */}
            <div className="absolute bottom-0 left-0 right-0 z-30 flex flex-col justify-end p-6 pb-8 lg:p-8">
              <span className="mb-3 text-[0.65rem] font-bold uppercase tracking-[0.15em] text-purple-700">
                CONTROL DE BARRA
              </span>
              <h3 className="mb-3 font-serif text-[1.5rem] lg:text-[1.7rem] font-semibold leading-[1.1] text-rose-950">
                Bares &<br/>Coctelerías
              </h3>
              <p className="mb-6 text-[0.85rem] font-medium leading-[1.6] text-rose-900/70">
                Cada trago y cada cuenta dividida bajo control. Sin calculadora, sin pestañas perdidas.
              </p>
              <a
                href="#contacto"
                className="inline-flex items-center gap-2 text-[0.82rem] font-bold text-rose-950 transition-colors hover:text-purple-700"
              >
                Ver cómo funciona
                <span aria-hidden="true">→</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
