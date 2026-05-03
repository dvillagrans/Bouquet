"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Image from "next/image";
import { LayoutGrid, ListOrdered, Receipt } from "lucide-react";

// ── Assets import ──────────────────────────────────────────
import petalSingle01 from "@/assets/floral-assets/petals/petal_single_01.png";
import petalSingle03 from "@/assets/floral-assets/petals/petal_single_03.png";
import petalSingle05 from "@/assets/floral-assets/petals/petal_single_05.png";
import petalSingle07 from "@/assets/floral-assets/petals/petal_single_07.png";
import petalSingle09 from "@/assets/floral-assets/petals/petal_single_09.png";
import cornerTopRight from "@/assets/floral-assets/branches/corner_top_right.png";
import cornerTopLeft from "@/assets/floral-assets/branches/corner_top_left.png";
import cornerBottomRight from "@/assets/floral-assets/branches/corner_bottom_right.png";
import floralConnectorFull from "@/assets/floral-assets/branches/floral_connector_full.png";

gsap.registerPlugin(ScrollTrigger);

const floatingPetals = [
  { src: petalSingle01, left: "8%", top: "12%", width: "2rem", delay: 0 },
  { src: petalSingle03, left: "22%", top: "78%", width: "1.5rem", delay: 0.8 },
  { src: petalSingle05, left: "48%", top: "-8%", width: "1.75rem", delay: 1.6 },
  { src: petalSingle07, left: "78%", top: "88%", width: "1.25rem", delay: 2.4 },
  { src: petalSingle09, left: "92%", top: "35%", width: "2rem", delay: 3.2 },
];

const features = [
  {
    label: "SALA EN VIVO",
    name: "Mesas",
    subtitle: "Organiza tu sala con claridad",
    description:
      "Visualiza el estado de cada mesa en tiempo real. Sabe quién pide, quién espera y cuándo liberas cubierta.",
    Icon: LayoutGrid,
  },
  {
    label: "KDS INTEGRADO",
    name: "Órdenes",
    subtitle: "Flujo directo a cocina y barra",
    description:
      "Las comandas llegan ordenadas por estación. El pase no se pierde entre páginas sueltas ni gritos.",
    Icon: ListOrdered,
  },
  {
    label: "SPLIT BILL",
    name: "Pagos",
    subtitle: "Cierre sin fricción",
    description:
      "División por comensal, propina y total en una sola línea de cobro. Menos calculadora, menos reclamos.",
    Icon: Receipt,
  },
];

export const Features = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const prefersReducedMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)"
      ).matches;

      if (prefersReducedMotion) {
        gsap.set(
          [
            ".features-corner",
            ".features-label",
            ".features-title",
            ".features-desc",
            ".features-floral",
            ".features-card",
            ".features-petal",
          ],
          { opacity: 1, y: 0, x: 0, scale: 1 }
        );
        return;
      }

      // ── Corner decorations ─────────────────────────
      gsap.fromTo(
        ".features-corner",
        { opacity: 0, scale: 0.92 },
        {
          opacity: 1,
          scale: 1,
          duration: 1.6,
          ease: "power2.out",
          stagger: 0.2,
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      // ── Header timeline ────────────────────────────
      const headerTl = gsap.timeline({
        scrollTrigger: {
          trigger: ".features-header",
          start: "top 80%",
          toggleActions: "play none none none",
        },
        defaults: { ease: "power3.out" },
      });

      headerTl
        .fromTo(
          ".features-label",
          { x: -20, opacity: 0 },
          { x: 0, opacity: 1, duration: 0.7 }
        )
        .fromTo(
          ".features-title",
          { y: 40, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.9 },
          "-=0.5"
        )
        .fromTo(
          ".features-desc",
          { y: 30, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.8 },
          "-=0.6"
        );

      // ── Floral image ───────────────────────────────
      gsap.fromTo(
        ".features-floral",
        { opacity: 0, scale: 0.96, y: 30 },
        {
          opacity: 1,
          scale: 1,
          y: 0,
          duration: 1.2,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".features-floral",
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );



      // ── Feature cards ──────────────────────────────
      gsap.fromTo(
        ".features-card",
        { y: 50, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.15,
          scrollTrigger: {
            trigger: ".features-grid",
            start: "top 82%",
            toggleActions: "play none none none",
          },
        }
      );

      // ── Floating petals organic drift ──────────────
      gsap.utils.toArray<HTMLElement>(".features-petal").forEach((petal) => {
        const delay = parseFloat(petal.dataset.delay || "0");
        gsap.to(petal, {
          y: "random(-18, 18)",
          x: "random(-10, 10)",
          rotation: "random(-8, 8)",
          duration: "random(3.5, 5.5)",
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
          delay,
        });
      });
    },
    { scope: sectionRef }
  );

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="relative flex min-h-[80dvh] flex-col justify-center overflow-hidden py-24 md:py-32 lg:py-40 px-6 md:px-10 lg:px-12"
      style={{
        background:
          "radial-gradient(ellipse at center, #FDF0F4 0%, #F5E8ED 60%, #EDE0E6 100%)",
      }}
    >
      {/* ── Esquinas decorativas ─────────────────────── */}
      <Image
        src={cornerTopRight}
        alt=""
        className="features-corner absolute -top-12 -right-12 md:-top-20 md:-right-20 lg:-top-24 lg:-right-24 w-64 md:w-80 lg:w-[28rem] opacity-90 pointer-events-none z-0"
        aria-hidden="true"
      />
      <Image
        src={cornerTopLeft}
        alt=""
        className="features-corner absolute -top-12 -left-12 md:-top-20 md:-left-20 lg:-top-24 lg:-left-24 w-64 md:w-80 lg:w-[28rem] opacity-90 pointer-events-none z-0"
        style={{ transform: "scaleX(-1)" }}
        aria-hidden="true"
      />
      <Image
        src={cornerBottomRight}
        alt=""
        className="features-corner absolute -bottom-12 -right-12 md:-bottom-20 md:-right-20 lg:-bottom-24 lg:-right-24 w-56 md:w-72 lg:w-[24rem] opacity-90 pointer-events-none z-0"
        aria-hidden="true"
      />

      {/* ── Pétalos flotantes ────────────────────────── */}
      {floatingPetals.map((petal, i) => (
        <Image
          key={i}
          src={petal.src}
          alt=""
          data-delay={petal.delay}
          className="features-petal absolute pointer-events-none z-20 opacity-80"
          style={{
            left: petal.left,
            top: petal.top,
            width: petal.width,
          }}
          aria-hidden="true"
        />
      ))}

      {/* ── Header ───────────────────────────────────── */}
      <div className="features-header relative z-10 max-w-6xl mx-auto mb-10 md:mb-14 lg:mb-20">
        <div className="flex items-center gap-4 mb-6 md:mb-8">
          <div className="features-label h-[1px] w-10 md:w-12 bg-rose-800/30" />
          <p className="features-label text-[11px] md:text-xs tracking-[0.25em] uppercase text-rose-800/60 font-medium">
            CÓMO FUNCIONA
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 lg:gap-16 items-end">
          <h2 className="features-title font-serif italic text-4xl md:text-5xl lg:text-6xl text-rose-950 leading-[1.1]">
            Tres pilares...
          </h2>
          <p className="features-desc text-[15px] md:text-base text-rose-950/70 leading-relaxed font-medium md:pb-1 lg:pb-2 max-w-md md:max-w-none">
            Nada de pantallas que compiten entre sí: mesa, cocina, barra y caja
            comparten el mismo estado del turno.
          </p>
        </div>
      </div>

      {/* ── Floral connector (tablet + desktop) ──────── */}
      <div className="features-floral relative z-10 w-full max-w-xl md:max-w-3xl lg:max-w-5xl xl:max-w-6xl mx-auto mb-10 md:mb-6 lg:mb-2">
        <Image
          src={floralConnectorFull}
          alt=""
          className="w-full h-auto object-contain scale-105 md:scale-110"
          sizes="(min-width: 1280px) 72rem, (min-width: 768px) 88vw, 94vw"
          aria-hidden="true"
        />


      </div>

      {/* ── Feature cards grid ───────────────────────── */}
      <div className="features-grid relative z-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-6 lg:gap-10 max-w-6xl mx-auto px-2 md:px-0">
        {features.map((feature, i) => {
          const Icon = feature.Icon;
          return (
            <div
              key={i}
              className="features-card group flex flex-col text-center md:text-left"
            >
              {/* Icono — visible en mobile y tablet, oculto en desktop */}
              <div className="lg:hidden mx-auto md:mx-0 mb-5 w-12 h-12 md:w-14 md:h-14 rounded-full bg-white/70 shadow-md border border-white/80 flex items-center justify-center transition-transform duration-300 group-hover:scale-105">
                <Icon className="w-6 h-6 md:w-7 md:h-7 text-rose-950" />
              </div>

              {/* Línea decorativa sutil */}
              <div className="hidden md:block h-px w-8 bg-rose-800/15 mb-4 mx-auto md:mx-0 transition-all duration-500 group-hover:w-12 group-hover:bg-rose-800/30" />

              <span className="text-[10px] md:text-[11px] tracking-[0.15em] font-bold uppercase text-rose-800/60 mb-2">
                {feature.label}
              </span>

              <h3 className="font-serif italic text-2xl md:text-3xl lg:text-4xl text-rose-950 mb-1 md:mb-2">
                {feature.name}
              </h3>

              <p className="text-sm md:text-[13px] lg:text-sm font-semibold text-rose-900 mb-2 md:mb-3">
                {feature.subtitle}
              </p>

              <p className="text-[13px] lg:text-sm text-rose-950/65 leading-relaxed max-w-xs mx-auto md:mx-0">
                {feature.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
};
