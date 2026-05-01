"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const plans = [
  {
    name: "Bouquet Básico",
    price: "$1,490",
    period: "/mes",
    description: "Para restaurantes de una sola sucursal que quieren ordenar su operación.",
    features: [
      "Hasta 30 mesas",
      "Gestión de órdenes en tiempo real",
      "División de cuenta por comensal",
      "Panel de caja básico",
      "Soporte por email",
    ],
    cta: "Empezar gratis",
    highlighted: false,
  },
  {
    name: "Bouquet Profesional",
    price: "$2,990",
    period: "/mes",
    description: "Para equipos que necesitan velocidad, reportes y control total del turno.",
    features: [
      "Mesas ilimitadas",
      "Dashboard en tiempo real",
      "Reportes de ventas y métricas",
      "Multi-usuario con roles",
      "Soporte humano prioritario",
      "Integración con POS",
    ],
    cta: "Agendar demo",
    highlighted: true,
  },
  {
    name: "Bouquet Cadena",
    price: "Personalizado",
    period: "",
    description: "Para grupos gastronómicos que operan varias sucursales con un solo comando.",
    features: [
      "Multi-sucursal centralizado",
      "API abierta para integraciones",
      "Onboarding dedicado",
      "Account manager asignado",
      "SLA de soporte 24/7",
      "Desarrollo a medida",
    ],
    cta: "Hablar con ventas",
    highlighted: false,
  },
];

export function PricingSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [hoveredPlan, setHoveredPlan] = useState<number | null>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      gsap.set(
        [
          ".pricing-label",
          ".pricing-headline",
          ".pricing-desc",
          ".pricing-card",
        ],
        { opacity: 1, y: 0 }
      );
      return;
    }

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".pricing-label",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".pricing-label",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
      gsap.fromTo(
        ".pricing-headline",
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 1,
          ease: "power4.out",
          scrollTrigger: {
            trigger: ".pricing-headline",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );
      gsap.fromTo(
        ".pricing-desc",
        { y: 20, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          ease: "power3.out",
          scrollTrigger: {
            trigger: ".pricing-desc",
            start: "top 85%",
            toggleActions: "play none none none",
          },
        }
      );

      gsap.utils.toArray<HTMLElement>(".pricing-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 60, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power4.out",
            delay: i * 0.15,
            scrollTrigger: {
              trigger: card,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          }
        );
      });
    }, sectionRef);

    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      id="precios"
      className="relative overflow-hidden bg-burgundy py-24 lg:py-36"
    >
      {/* Transición suave desde arriba */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-rose-blush/10 via-transparent to-transparent"
      />

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-screen"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-[85rem] px-6 lg:px-10">
        {/* Header */}
        <div className="mb-16 text-center lg:mb-20">
          <p className="pricing-label opacity-0 mb-5 inline-flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-white/40">
            <span
              className="h-px w-10 bg-gradient-to-r from-rose/70 to-transparent"
              aria-hidden="true"
            />
            Precios transparentes
          </p>
          <h2 className="pricing-headline opacity-0 font-serif text-[clamp(2.4rem,5vw,4rem)] font-medium italic leading-[1.02] tracking-tight text-white">
            Un plan para cada etapa.
          </h2>
          <p className="pricing-desc opacity-0 mx-auto mt-6 max-w-lg text-[1.05rem] leading-[1.75] text-white/50">
            Sin costos ocultos, sin sorpresas. Empezás cuando querés y cancelás
            cuando querés.
          </p>
        </div>

        {/* Grid de planes */}
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {plans.map((plan, i) => (
            <div
              key={plan.name}
              className={`pricing-card opacity-0 relative flex flex-col overflow-hidden rounded-[1.75rem] p-8 lg:p-10 transition-all duration-500 ${
                plan.highlighted
                  ? "bg-white text-burgundy shadow-[0_20px_60px_-20px_rgba(0,0,0,0.4)] ring-2 ring-rose"
                  : "bg-white/[0.04] text-white ring-1 ring-white/10 hover:bg-white/[0.07]"
              }`}
              onMouseEnter={() => setHoveredPlan(i)}
              onMouseLeave={() => setHoveredPlan(null)}
            >
              {/* Badge destacado */}
              {plan.highlighted && (
                <div className="absolute right-6 top-6">
                  <span className="inline-flex items-center rounded-full bg-rose/10 px-3 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em] text-rose">
                    Más elegido
                  </span>
                </div>
              )}

              {/* Nombre y precio */}
              <div className="mb-6">
                <h3
                  className={`text-[0.72rem] font-bold uppercase tracking-[0.25em] ${
                    plan.highlighted ? "text-burgundy/50" : "text-white/40"
                  }`}
                >
                  {plan.name}
                </h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span
                    className={`font-serif text-[3rem] font-semibold leading-none tracking-tight ${
                      plan.highlighted ? "text-burgundy" : "text-white"
                    }`}
                  >
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span
                      className={`text-[0.9rem] font-medium ${
                        plan.highlighted ? "text-burgundy/50" : "text-white/40"
                      }`}
                    >
                      {plan.period}
                    </span>
                  )}
                </div>
                <p
                  className={`mt-3 text-[0.9rem] leading-[1.65] ${
                    plan.highlighted ? "text-burgundy/55" : "text-white/45"
                  }`}
                >
                  {plan.description}
                </p>
              </div>

              {/* Features */}
              <ul className="mb-8 flex-1 space-y-3">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-3">
                    <span
                      className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                        plan.highlighted
                          ? "bg-rose/10"
                          : "bg-white/10"
                      }`}
                    >
                      <svg
                        className={`h-3 w-3 ${
                          plan.highlighted ? "text-rose" : "text-rose/70"
                        }`}
                        viewBox="0 0 20 20"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M4 10l4 4 8-8"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </span>
                    <span
                      className={`text-[0.88rem] ${
                        plan.highlighted
                          ? "text-burgundy/75"
                          : "text-white/65"
                      }`}
                    >
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <a
                href="#contacto"
                className={`group inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-[0.9rem] font-semibold transition-all duration-300 ${
                  plan.highlighted
                    ? "bg-burgundy text-white shadow-[0_12px_30px_-12px_rgba(74,26,44,0.5)] hover:bg-burgundy-light hover:-translate-y-0.5"
                    : "bg-white/10 text-white ring-1 ring-white/15 hover:bg-white/[0.14]"
                }`}
              >
                {plan.cta}
                <svg
                  className={`h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5 ${
                    hoveredPlan === i ? "translate-x-0.5" : ""
                  }`}
                  viewBox="0 0 20 20"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M4 10h12m-6-6l6 6-6 6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </a>
            </div>
          ))}
        </div>

        {/* Nota al pie */}
        <p className="mt-10 text-center text-[0.78rem] font-medium text-white/35">
          ¿No sabés cuál elegir?{" "}
          <a
            href="#contacto"
            className="text-rose/70 underline underline-offset-2 transition-colors hover:text-rose"
          >
            Agendá una demo gratuita
          </a>{" "}
          y te asesoramos sin compromiso.
        </p>
      </div>
    </section>
  );
}
