"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const segments = [
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8 16h32M8 24h32M8 32h20" />
        <circle cx="38" cy="32" r="4" fill="currentColor" fillOpacity="0.15" />
        <path d="M36 32l1.5 1.5L40 30" strokeWidth="2" />
        <rect x="12" y="8" width="24" height="32" rx="4" strokeDasharray="2 2" />
      </svg>
    ),
    title: "Restaurantes de servicio completo",
    benefit: "Control de salón y tiempos de salida",
    description:
      "Visualizá cada mesa en tiempo real, gestioná reservas y optimizá la rotación de cubiertos sin perder la calidad del servicio.",
    color: "text-rose",
    bgColor: "bg-rose/5",
    ringColor: "ring-rose/15",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M12 20c0-8 8-12 12-12s12 4 12 12-8 16-12 20c-4-4-12-12-12-20z" />
        <circle cx="24" cy="20" r="4" fill="currentColor" fillOpacity="0.15" />
        <path d="M24 28v8M20 32h8" strokeWidth="1.5" />
      </svg>
    ),
    title: "Taquerías & Fast casual",
    benefit: "Velocidad en órdenes y caja",
    description:
      "Turnos de alta demanda sin caos. Órdenes directo a cocina, cobro rápido y métricas que te ayudan a identificar tu producto estrella.",
    color: "text-burgundy",
    bgColor: "bg-burgundy/5",
    ringColor: "ring-burgundy/15",
  },
  {
    icon: (
      <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M14 38V20c0-6 4-10 10-10s10 4 10 10v18" />
        <path d="M10 38h28" strokeWidth="2" />
        <circle cx="24" cy="14" r="3" fill="currentColor" fillOpacity="0.15" />
        <path d="M18 24h12M18 28h10M18 32h8" strokeWidth="1" />
      </svg>
    ),
    title: "Bares & Coctelerías",
    benefit: "División de cuenta y control de barra",
    description:
      "Split bill sin dolor de cabeza, control de inventario de barra en tiempo real y comandas que nunca se pierden entre la música.",
    color: "text-sage-deep",
    bgColor: "bg-sage/10",
    ringColor: "ring-sage/20",
  },
];

export function ForWhoSection() {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReduced) {
      gsap.set(
        [
          ".forwho-label",
          ".forwho-headline",
          ".forwho-desc",
          ".forwho-card",
        ],
        { opacity: 1, y: 0 }
      );
      return;
    }

    const ctx = gsap.context(() => {
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

      gsap.utils.toArray<HTMLElement>(".forwho-card").forEach((card, i) => {
        gsap.fromTo(
          card,
          { y: 50, opacity: 0, scale: 0.97 },
          {
            y: 0,
            opacity: 1,
            scale: 1,
            duration: 1,
            ease: "power4.out",
            delay: i * 0.12,
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
      id="segmentos"
      className="relative overflow-hidden bg-[radial-gradient(ellipse_120%_80%_at_50%_-20%,#FDF2F5_0%,#F5D5DC_40%,#FAF6F3_100%)] py-24 lg:py-36"
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
        <div className="mb-16 text-center lg:mb-20">
          <p className="forwho-label opacity-0 mb-5 inline-flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-burgundy/45">
            <span
              className="h-px w-10 bg-gradient-to-r from-rose/80 to-rose/20"
              aria-hidden="true"
            />
            Para quién es
          </p>
          <h2 className="forwho-headline opacity-0 font-serif text-[clamp(2.4rem,5vw,4rem)] font-medium italic leading-[1.02] tracking-tight text-burgundy">
            Diseñado para tu tipo de servicio.
          </h2>
          <p className="forwho-desc opacity-0 mx-auto mt-6 max-w-lg text-[1.05rem] leading-[1.75] text-burgundy/55">
            No importa el formato: si tenés mesas, órdenes y pagos, Bouquet se
            adapta a tu operación.
          </p>
        </div>

        {/* Cards */}
        <div className="grid gap-6 lg:grid-cols-3 lg:gap-8">
          {segments.map((segment) => (
            <div
              key={segment.title}
              className="forwho-card opacity-0 group relative flex flex-col overflow-hidden rounded-[1.75rem] border border-burgundy/[0.08] bg-white/[0.5] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.95),0_8px_32px_rgba(74,26,44,0.06)] backdrop-blur-md transition-shadow duration-500 hover:shadow-[0_12px_40px_rgba(74,26,44,0.1)] lg:p-10"
            >
              {/* Top line decorativa */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-rose/20 to-transparent opacity-80" />

              {/* Icono */}
              <div
                className={`mb-6 flex h-14 w-14 items-center justify-center rounded-2xl ${segment.bgColor} ring-1 ${segment.ringColor}`}
              >
                <div className={`h-7 w-7 ${segment.color}`}>
                  {segment.icon}
                </div>
              </div>

              {/* Contenido */}
              <div className="mb-2">
                <span
                  className={`inline-block rounded-full px-2.5 py-0.5 text-[0.55rem] font-bold uppercase tracking-[0.15em] ${segment.bgColor} ${segment.color} mb-3`}
                >
                  {segment.benefit}
                </span>
                <h3 className="font-serif text-[1.5rem] font-semibold leading-[1.15] tracking-tight text-burgundy lg:text-[1.65rem]">
                  {segment.title}
                </h3>
              </div>

              <p className="mt-4 text-[0.95rem] font-medium leading-[1.7] text-burgundy/55">
                {segment.description}
              </p>

              {/* Hover indicator */}
              <div className="mt-auto pt-6">
                <a
                  href="#contacto"
                  className={`inline-flex items-center gap-2 text-[0.82rem] font-semibold ${segment.color} transition-colors`}
                >
                  Ver cómo funciona
                  <svg
                    className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5"
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
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
