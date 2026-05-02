"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

/* Dashboard preview card */
function DashboardPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-rose-cream ring-1 ring-burgundy/5 shadow-[inset_0_1px_0_rgba(255,255,255,0.8),0_20px_60px_rgba(74,26,44,0.1)]">
      {/* Header del dashboard */}
      <div className="flex items-center justify-between border-b border-burgundy/[0.06] bg-white/60 px-5 py-4 md:py-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-burgundy/5">
            <svg viewBox="0 0 20 20" className="h-4 w-4 text-burgundy" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="6" height="6" rx="1" />
              <rect x="11" y="3" width="6" height="6" rx="1" />
              <rect x="3" y="11" width="6" height="6" rx="1" />
              <rect x="11" y="11" width="6" height="6" rx="1" />
            </svg>
          </div>
          <span className="font-serif text-sm font-semibold italic text-burgundy">bouquet</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-burgundy/40">Dashboard</span>
          <div className="h-6 w-6 rounded-full bg-rose-blush" />
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3 px-4 pt-5 pb-4 sm:grid-cols-4">
        {[
          { label: "Ventas totales", value: "$12,540", color: "text-burgundy" },
          { label: "Mesas activas", value: "18", color: "text-rose" },
          { label: "Órdenes totales", value: "143", color: "text-burgundy" },
          { label: "Ticket promedio", value: "$345", color: "text-sage-deep" },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-xl bg-white/70 p-3 ring-1 ring-burgundy/[0.04]">
            <p className="text-[0.52rem] font-bold uppercase tracking-[0.15em] text-burgundy/35">{kpi.label}</p>
            <p className={`mt-1 font-serif text-[1.1rem] font-semibold tabular-nums ${kpi.color}`}>{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 gap-3 px-4 pb-4 sm:grid-cols-2">
        {/* Gráfico de línea */}
        <div className="rounded-xl bg-white/70 p-4 ring-1 ring-burgundy/[0.04]">
          <p className="mb-3 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-burgundy/40">Ventas por hora</p>
          <svg viewBox="0 0 200 80" className="h-20 w-full">
            {/* Grid lines */}
            {[0, 20, 40, 60].map((y) => (
              <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="#E8D0D8" strokeWidth="0.5" strokeDasharray="2 2" />
            ))}
            {/* Line */}
            <path
              className="dash-line-path"
              d="M10 55 L40 45 L70 50 L100 35 L130 40 L160 25 L190 20"
              stroke="#C75B7A"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
              pathLength="1"
              strokeDasharray="1"
              strokeDashoffset="1"
            />
            {/* Area under line */}
            <path
              className="dash-area-path opacity-0"
              d="M10 55 L40 45 L70 50 L100 35 L130 40 L160 25 L190 20 L190 65 L10 65Z"
              fill="url(#salesGradient)"
            />
            <defs>
              <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#C75B7A" />
                <stop offset="100%" stopColor="#C75B7A" stopOpacity="0" />
              </linearGradient>
            </defs>
            {/* Points */}
            {[
              [10, 55], [40, 45], [70, 50], [100, 35], [130, 40], [160, 25], [190, 20]
            ].map(([cx, cy], i) => (
              <circle
                key={i}
                className="dash-point opacity-0"
                cx={cx} cy={cy} r="3"
                fill="white"
                stroke="#C75B7A"
                strokeWidth="1.5"
              />
            ))}
          </svg>
          <div className="mt-2 flex justify-between text-[0.5rem] text-burgundy/30">
            <span>10:00</span>
            <span>14:00</span>
            <span>18:00</span>
            <span>22:00</span>
          </div>
        </div>

        {/* Gráfico de dona */}
        <div className="rounded-xl bg-white/70 p-4 ring-1 ring-burgundy/[0.04]">
          <p className="mb-3 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-burgundy/40">Top productos</p>
          <div className="flex items-center gap-4">
            <svg viewBox="0 0 80 80" className="h-20 w-20 shrink-0">
              {/* Entradas 35% */}
              <circle
                className="dash-donut"
                cx="40" cy="40" r="32"
                stroke="#C75B7A"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="0.35 1"
                strokeDashoffset="0.35"
                pathLength="1"
                transform="rotate(-90 40 40)"
              />
              {/* Platos fuertes 30% */}
              <circle
                className="dash-donut"
                cx="40" cy="40" r="32"
                stroke="#D68C9F"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="0.30 1"
                strokeDashoffset="0.30"
                pathLength="1"
                transform="rotate(36 40 40)"
              />
              {/* Bebidas 20% */}
              <circle
                className="dash-donut"
                cx="40" cy="40" r="32"
                stroke="#8A9A84"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="0.20 1"
                strokeDashoffset="0.20"
                pathLength="1"
                transform="rotate(144 40 40)"
              />
              {/* Postres 15% */}
              <circle
                className="dash-donut"
                cx="40" cy="40" r="32"
                stroke="#E8A5B0"
                strokeWidth="10"
                fill="none"
                strokeLinecap="round"
                strokeDasharray="0.15 1"
                strokeDashoffset="0.15"
                pathLength="1"
                transform="rotate(216 40 40)"
              />
            </svg>
            <div className="space-y-1.5">
              {[
                { label: "Entradas", color: "bg-rose" },
                { label: "Platos fuertes", color: "bg-rose-light" },
                { label: "Bebidas", color: "bg-sage" },
                { label: "Postres", color: "bg-rose-pale" },
              ].map((item) => (
                <div key={item.label} className="flex items-center gap-2">
                  <span className={`h-2 w-2 rounded-full ${item.color}`} />
                  <span className="text-[0.6rem] font-medium text-burgundy/60">{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export const ProductSection = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set([".product-pill", ".product-headline", ".product-desc", ".product-mockup", ".product-bento-item"], {
        opacity: 1, y: 0, x: 0, scale: 1
      });
      gsap.set(".dash-line-path", { strokeDashoffset: 0 });
      gsap.set(".dash-area-path", { opacity: 0.2 });
      gsap.set(".dash-point", { opacity: 1, scale: 1 });
      gsap.set(".dash-donut", { strokeDashoffset: 0 });
      return;
    }

    const ctx = gsap.context(() => {
      // Parallax for text
      gsap.fromTo(".product-text-col",
        { y: 60 },
        {
          y: -60,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.5,
          }
        }
      );

      // Parallax for mockup (slower)
      gsap.fromTo(".product-mockup",
        { y: 120, scale: 0.96 },
        {
          y: -80, scale: 1,
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: 1.2,
          }
        }
      );

      // Header entrance
      gsap.fromTo(".product-pill",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: ".product-pill", start: "top 85%", toggleActions: "play none none none" }
        }
      );
      gsap.fromTo(".product-headline",
        { y: 50, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out",
          scrollTrigger: { trigger: ".product-headline", start: "top 85%", toggleActions: "play none none none" }
        }
      );
      gsap.fromTo(".product-desc",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: ".product-desc", start: "top 85%", toggleActions: "play none none none" }
        }
      );

      // Dashboard chart SVG draw animations
      ScrollTrigger.create({
        trigger: ".product-mockup",
        start: "top 75%",
        onEnter: () => {
          // Line draw
          gsap.to(".dash-line-path", { strokeDashoffset: 0, duration: 1.5, ease: "power2.inOut" });
          // Area fade in
          gsap.to(".dash-area-path", { opacity: 0.2, duration: 1, delay: 0.5, ease: "power2.out" });
          // Points pop in
          gsap.to(".dash-point", { opacity: 1, scale: 1, duration: 0.4, stagger: 0.08, delay: 0.8, ease: "back.out(2)" });
          // Donut segments
          gsap.to(".dash-donut", { strokeDashoffset: 0, duration: 1.2, stagger: 0.15, delay: 0.3, ease: "power2.inOut" });
        },
        once: true,
      });

      // Bento grid items entrance
      gsap.utils.toArray<HTMLElement>(".product-bento-item").forEach((item, i) => {
        gsap.fromTo(item,
          { y: 50, opacity: 0 },
          {
            y: 0, opacity: 1, duration: 1, ease: "power4.out",
            delay: i * 0.1,
            scrollTrigger: {
              trigger: item,
              start: "top 90%",
              toggleActions: "play none none none",
            }
          }
        );
      });

    }, sectionRef);

    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-[90dvh] flex-col justify-center bg-burgundy text-white pt-28 lg:pt-40 pb-32 lg:pb-48 overflow-hidden z-10"
      id="producto"
    >
      {/* Transición */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-rose-blush/20 via-transparent to-transparent" aria-hidden="true" />

      {/* Film grain */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      />

      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#2E1B24_0%,transparent_60%)]" aria-hidden="true" />

      <div className="mx-auto max-w-[85rem] px-6 lg:px-10 relative">
        {/* Header editorial */}
        <div className="product-text-col mb-12 lg:mb-20">
          <div className="inline-flex">
            <div className="product-pill opacity-0 flex items-center gap-3 px-4 py-2 rounded-full ring-1 ring-white/10 bg-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <span className="w-2 h-2 rounded-full bg-rose animate-pulse" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/70">
                La Plataforma
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-end">
            <h2 className="product-headline opacity-0 font-serif text-[clamp(3rem,6.5vw,5.5rem)] font-medium italic leading-[0.9] tracking-tight text-white m-0">
              Control <br />
              <span className="text-white/40">absoluto.</span>
            </h2>
            <p className="product-desc opacity-0 max-w-md text-[1.1rem] font-light leading-[1.8] text-white/50 pb-2">
              Bouquet unifica cada vértice del restaurante. Sin hardware excesivo, sin cables, sin fricción entre estaciones.
            </p>
          </div>
        </div>

        {/* Dashboard Preview */}
        <div className="product-mockup relative rounded-[2rem] lg:rounded-[2.5rem] bg-gradient-to-b from-white/[0.07] to-white/[0.02] ring-1 ring-white/10 p-3 lg:p-6 shadow-[0_40px_100px_-40px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.08)] mb-24 lg:mb-36 origin-bottom will-change-transform">
          <div className="relative rounded-[calc(2rem-0.75rem)] lg:rounded-[calc(2.5rem-1.5rem)] overflow-hidden bg-black/40 ring-1 ring-white/5 shadow-[inset_0_4px_20px_rgba(255,255,255,0.05)]">
            <DashboardPreview />
          </div>
        </div>

        {/* Bento facts */}
        <div className="relative">
          <div className="flex items-center gap-4 mb-14">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Métricas & Soporte</h3>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 lg:gap-6">
            {/* Feature 1 (Large / Main) */}
            <div className="product-bento-item opacity-0 md:col-span-8 md:row-span-2 rounded-3xl ring-1 ring-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-10 lg:p-16 relative group overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.03]" />
              
              {/* Decoración de fondo sutil */}
              <div className="absolute -right-20 -top-20 w-64 h-64 bg-rose/5 rounded-full blur-3xl" />

              {/* Icono */}
              <div className="relative mb-6 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose/10 ring-1 ring-rose/20 text-rose">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>

              <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-white/35 mb-8">Eficacia Operativa</p>
              
              <div className="relative">
                <h4 className="font-serif text-[2.5rem] lg:text-[3.2rem] font-medium leading-none text-white mb-4">Deploy Rápido</h4>
                <div className="flex items-baseline gap-4 mt-6">
                  <span className="font-serif text-[5rem] lg:text-[6.5rem] font-medium leading-none text-white">1</span>
                  <span className="font-serif text-2xl lg:text-3xl italic text-white/30">día</span>
                </div>
              </div>
              
              <div className="relative h-px w-20 bg-white/20 my-8" />
              
              <p className="relative text-[1rem] font-medium leading-relaxed text-white/55 max-w-[36ch]">
                Del primer onboarding técnico a tu primer turno operativo real. Cero configuraciones traumáticas o semanas de espera.
              </p>
            </div>

            {/* API (Standard) */}
            <div className="product-bento-item opacity-0 md:col-span-4 rounded-3xl ring-1 ring-white/10 bg-gradient-to-br from-white/[0.07] to-white/[0.02] p-10 lg:p-12 relative group">
              <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.03]" />
              
              <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-white/70">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                </svg>
              </div>

              <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-white/35 mb-3">Ecosistema</p>
              <p className="relative font-serif text-[1.7rem] lg:text-[2rem] font-medium leading-[1.1] text-white mb-3">API Abierta</p>
              <p className="relative text-[0.9rem] font-medium leading-relaxed text-white/50">
                Integraciones nativas con POS de caja y terminales bancarias líderes.
              </p>
            </div>

            {/* 24/7 (Highlight) */}
            <div className="product-bento-item opacity-0 md:col-span-4 rounded-3xl ring-1 ring-rose/20 bg-gradient-to-br from-rose/[0.08] to-rose/[0.02] p-10 lg:p-12 relative group">
              <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.03]" />
              
              <div className="relative mb-5 flex h-11 w-11 items-center justify-center rounded-2xl bg-rose/15 ring-1 ring-rose/25 text-rose">
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <p className="relative text-[11px] font-bold uppercase tracking-[0.2em] text-rose/60 mb-3">Respaldo</p>
              <p className="relative font-serif text-[1.7rem] lg:text-[2rem] font-medium leading-[1.1] text-white mb-3">Soporte Humano</p>
              <p className="relative text-[0.9rem] font-medium leading-relaxed text-white/50">
                Respuesta en minutos, no en días. 24/7 en español.
              </p>
            </div>

            {/* Feature 4 (Wide Footer) */}
            <div className="product-bento-item opacity-0 md:col-span-12 rounded-3xl ring-1 ring-white/10 bg-gradient-to-r from-white/[0.07] via-white/[0.04] to-white/[0.07] p-10 lg:p-12 relative group flex flex-col md:flex-row items-center justify-between gap-10">
              <div className="max-w-xl">
                <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/35 mb-3">Flexibilidad</p>
                <p className="font-serif text-[2rem] lg:text-[2.4rem] font-medium leading-[1.1] text-white mb-4">Cualquier dispositivo</p>
                <p className="text-[1rem] font-medium leading-relaxed text-white/50">
                  Bouquet corre en la nube. Usa tablets, celulares o terminales de uso rudo. Tú eliges el hardware, nosotros ponemos la potencia.
                </p>
              </div>
              
              {/* Visual aid for devices */}
              <div className="flex gap-6 items-end opacity-20 group-hover:opacity-40 transition-opacity duration-700">
                <div className="w-12 h-20 rounded-lg border border-white/30 bg-white/10 hidden lg:block" />
                <div className="w-32 h-44 rounded-xl border border-white/40 bg-white/10 relative">
                  <div className="absolute top-2 left-1/2 -translate-x-1/2 w-8 h-1 bg-white/20 rounded-full" />
                </div>
                <div className="w-48 h-32 rounded-xl border border-white/40 bg-white/10 relative">
                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-2 h-2 bg-white/20 rounded-full" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
