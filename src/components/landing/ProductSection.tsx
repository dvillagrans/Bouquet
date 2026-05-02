"use client";

import { useRef } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

import floralLeft from "@/assets/floral-assets/branches/complete_2.png";
import floralRight from "@/assets/floral-assets/branches/complete_3.png";

/* Dashboard preview card */
function DashboardPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-2xl bg-[#1A0C11] ring-1 ring-white/10 shadow-2xl">
      {/* Header del dashboard */}
      <div className="flex items-center justify-between border-b border-white/5 px-5 py-4">
        <div className="flex items-center gap-2.5">
          <div className="flex h-6 w-6 items-center justify-center rounded-md bg-white/10">
            <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="6" height="6" rx="1" />
              <rect x="11" y="3" width="6" height="6" rx="1" />
              <rect x="3" y="11" width="6" height="6" rx="1" />
              <rect x="11" y="11" width="6" height="6" rx="1" />
            </svg>
          </div>
          <span className="font-serif text-sm font-semibold italic text-white">bouquet</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-white/40">Dashboard</span>
          <div className="h-2 w-2 rounded-full bg-rose-500" />
        </div>
      </div>
      {/* KPIs */}
      <div className="grid grid-cols-2 gap-px border-b border-white/5 bg-white/5 sm:grid-cols-4">
        {[
          { label: "Ventas totales", value: "$12,540", detail: "+12.5% vs ayer \u2191" },
          { label: "Mesas activas", value: "18", detail: "En tiempo real" },
          { label: "Órdenes totales", value: "143", detail: "+8.2% vs ayer" },
          { label: "Ticket promedio", value: "$345", detail: "+5.1% vs ayer \u2191" },
        ].map((kpi, idx) => (
          <div key={kpi.label} className="bg-[#1A0C11] p-5">
            <p className="text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/40">{kpi.label}</p>
            <p className="mt-2 font-serif text-[1.4rem] font-semibold tabular-nums text-white leading-none">{kpi.value}</p>
            <p className="mt-2 text-[0.6rem] text-white/30">{kpi.detail}</p>
          </div>
        ))}
      </div>

      {/* Charts area */}
      <div className="grid grid-cols-1 gap-px bg-white/5 sm:grid-cols-[1.5fr_1fr]">
        {/* Gráfico de línea */}
        <div className="bg-[#1A0C11] p-5">
          <p className="mb-4 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/40">Ventas por hora</p>
          <div className="flex">
            <div className="flex flex-col justify-between text-[0.5rem] text-white/30 mr-2 h-[80px]">
              <span>$2.5k</span>
              <span>$2k</span>
              <span>$1.5k</span>
              <span>$1k</span>
              <span>$500</span>
              <span>$0</span>
            </div>
            <svg viewBox="0 0 200 80" className="h-[80px] w-full flex-1">
              {/* Grid lines */}
              {[0, 16, 32, 48, 64, 80].map((y) => (
                <line key={y} x1="0" y1={y} x2="200" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="2 2" />
              ))}
              {/* Line */}
              <path
                className="dash-line-path"
                d="M10 55 L40 45 L70 50 L100 35 L130 40 L160 25 L190 20"
                stroke="#F472B6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                pathLength="1"
                strokeDasharray="1"
                strokeDashoffset="1"
                style={{ filter: "drop-shadow(0px 4px 6px rgba(244,114,182,0.3))" }}
              />
              {/* Points */}
              {[
                [10, 55], [40, 45], [70, 50], [100, 35], [130, 40], [160, 25], [190, 20]
              ].map(([cx, cy], i) => (
                <circle
                  key={i}
                  className="dash-point opacity-0"
                  cx={cx} cy={cy} r="2.5"
                  fill="#F472B6"
                  stroke="#1A0C11"
                  strokeWidth="1.5"
                />
              ))}
            </svg>
          </div>
          <div className="mt-3 ml-6 flex justify-between text-[0.5rem] text-white/30">
            <span>10:00</span>
            <span>14:00</span>
            <span>18:00</span>
            <span>22:00</span>
          </div>
        </div>

        {/* Gráfico de dona */}
        <div className="bg-[#1A0C11] p-5">
          <p className="mb-4 text-[0.55rem] font-bold uppercase tracking-[0.15em] text-white/40">Top productos</p>
          <div className="flex items-center gap-6 mt-2">
            <svg viewBox="0 0 80 80" className="h-24 w-24 shrink-0">
              {/* Entradas 32% */}
              <circle
                className="dash-donut"
                cx="40" cy="40" r="32"
                stroke="#F472B6"
                strokeWidth="12"
                fill="none"
                strokeDasharray="0.32 1"
                strokeDashoffset="0.32"
                pathLength="1"
                transform="rotate(-90 40 40)"
              />
              {/* Platos fuertes 45% */}
              <circle
                className="dash-donut"
                cx="40" cy="40" r="32"
                stroke="#A7F3D0"
                strokeWidth="12"
                fill="none"
                strokeDasharray="0.45 1"
                strokeDashoffset="0.45"
                pathLength="1"
                transform="rotate(25.2 40 40)"
              />
              {/* Bebidas 15% */}
              <circle
                className="dash-donut"
                cx="40" cy="40" r="32"
                stroke="#E4E4E7"
                strokeWidth="12"
                fill="none"
                strokeDasharray="0.15 1"
                strokeDashoffset="0.15"
                pathLength="1"
                transform="rotate(187.2 40 40)"
              />
              {/* Postres 8% */}
              <circle
                className="dash-donut"
                cx="40" cy="40" r="32"
                stroke="#FDA4AF"
                strokeWidth="12"
                fill="none"
                strokeDasharray="0.08 1"
                strokeDashoffset="0.08"
                pathLength="1"
                transform="rotate(241.2 40 40)"
              />
            </svg>
            <div className="space-y-2.5 flex-1">
              {[
                { label: "Entradas", color: "bg-[#F472B6]", perc: "32%" },
                { label: "Platos fuertes", color: "bg-[#A7F3D0]", perc: "45%" },
                { label: "Bebidas", color: "bg-[#E4E4E7]", perc: "15%" },
                { label: "Postres", color: "bg-[#FDA4AF]", perc: "8%" },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={`h-1.5 w-1.5 rounded-full ${item.color}`} />
                    <span className="text-[0.65rem] font-medium text-white/50">{item.label}</span>
                  </div>
                  <span className="text-[0.65rem] font-bold text-white/70">{item.perc}</span>
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
        { y: 120, scale: 0.96, opacity: 0 },
        {
          y: -80, scale: 1, opacity: 1,
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
      className="relative flex flex-col justify-center bg-[#1A0C11] text-white pt-28 lg:pt-40 pb-32 lg:pb-48 overflow-hidden z-10"
      id="producto"
    >
      {/* Flores en fondo */}
      <Image src={floralLeft} alt="" className="absolute -left-[15%] top-[10%] w-[800px] opacity-20 pointer-events-none mix-blend-screen brightness-125 sepia-[.3] hue-rotate-[-30deg]" />
      <Image src={floralRight} alt="" className="absolute -right-[10%] bottom-[10%] w-[600px] opacity-20 pointer-events-none mix-blend-screen brightness-125 sepia-[.3] hue-rotate-[-30deg]" />

      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,rgba(244,114,182,0.05)_0%,transparent_60%)]" aria-hidden="true" />

      <div className="mx-auto max-w-[85rem] px-6 lg:px-10 relative">
        {/* Layout Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-[0.8fr_1.2fr] gap-16 lg:gap-24 items-center mb-24 lg:mb-32">
          
          {/* Text Column */}
          <div className="product-text-col relative z-10">
            <div className="product-pill opacity-0 mb-6 flex items-center gap-3">
              <span className="w-1.5 h-1.5 rounded-full bg-[#F472B6]" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/50">
                La Plataforma
              </span>
            </div>

            <h2 className="product-headline opacity-0 font-serif text-[clamp(3.5rem,6vw,4.5rem)] font-medium leading-[1] text-white m-0">
              Control <br />
              <span className="italic text-[#F472B6]">absoluto.</span>
            </h2>

            {/* Divisor decorativo */}
            <div className="my-8 flex items-center justify-start gap-3 opacity-40">
              <div className="h-px w-16 bg-gradient-to-r from-transparent to-[#F472B6]/60" />
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="w-4 h-4 text-[#F472B6]">
                <path d="M12 2L15 12L22 15L15 18L12 22L9 18L2 15L9 12Z" fill="currentColor" stroke="none" />
              </svg>
              <div className="h-px w-16 bg-gradient-to-l from-transparent to-[#F472B6]/60" />
            </div>

            <p className="product-desc opacity-0 text-[1rem] font-medium leading-[1.8] text-white/50 max-w-sm">
              Bouquet unifica cada vértice del restaurante. Sin hardware excesivo, sin cables, sin fricción entre estaciones.
            </p>
          </div>

          {/* Dashboard Preview */}
          <div className="product-mockup opacity-0 relative rounded-3xl bg-gradient-to-b from-white/[0.05] to-white/[0.01] ring-1 ring-white/10 p-3 lg:p-4 shadow-2xl origin-center will-change-transform">
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
            <div className="product-bento-item opacity-0 md:col-span-12 lg:col-span-7 rounded-3xl ring-1 ring-white/10 bg-[#1A0C11] p-10 lg:p-14 relative group overflow-hidden">
              <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.03]" />
              
              {/* Decoración de fondo sutil */}
              <div className="absolute right-0 top-0 w-64 h-64 bg-[#F472B6]/5 rounded-full blur-3xl pointer-events-none" />

              {/* Icono */}
              <div className="relative mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F472B6]/10 ring-1 ring-[#F472B6]/20 text-[#F472B6]">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                </svg>
              </div>

              <p className="relative text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#F472B6]/60 mb-8">Eficacia Operativa</p>
              
              <div className="relative">
                <h4 className="font-serif text-[2.5rem] lg:text-[3.2rem] font-medium leading-none text-white mb-6">Deploy Rápido</h4>
                
                <div className="h-px w-12 bg-white/10 my-8" />
                
                <div className="flex items-baseline gap-4 mb-4">
                  <span className="font-serif text-[4.5rem] lg:text-[5.5rem] font-medium leading-none text-white">1</span>
                  <span className="font-serif text-2xl lg:text-3xl italic text-[#F472B6]/70">día</span>
                </div>
                
                <p className="text-[0.95rem] font-medium leading-relaxed text-white/50 max-w-[25ch]">
                  Para tener tu restaurante operando con Bouquet.
                </p>
              </div>

              {/* SVG Clock (absolute right bottom) */}
              <div className="absolute -bottom-10 -right-10 opacity-30 pointer-events-none hidden md:block">
                <svg width="300" height="300" viewBox="0 0 200 200" fill="none" className="text-[#F472B6]">
                  <circle cx="100" cy="100" r="80" stroke="currentColor" strokeWidth="1" strokeDasharray="4 4" />
                  <circle cx="100" cy="100" r="70" stroke="currentColor" strokeWidth="0.5" />
                  {/* Tick marks */}
                  {Array.from({ length: 12 }).map((_, i) => (
                    <line key={i} x1="100" y1="35" x2="100" y2="40" stroke="currentColor" strokeWidth="2" transform={`rotate(${i * 30} 100 100)`} />
                  ))}
                  {/* Hands */}
                  <line x1="100" y1="100" x2="130" y2="70" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <line x1="100" y1="100" x2="90" y2="140" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
                  <circle cx="100" cy="100" r="3" fill="currentColor" />
                </svg>
              </div>
            </div>

            {/* Right Column Stack */}
            <div className="md:col-span-12 lg:col-span-5 flex flex-col gap-4 lg:gap-6">
              {/* Ecosistema */}
              <div className="product-bento-item opacity-0 flex-1 rounded-3xl ring-1 ring-white/10 bg-[#1A0C11] p-8 lg:p-10 relative group overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.03]" />
                
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/5 ring-1 ring-white/10 text-white/70">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 6.75L22.5 12l-5.25 5.25m-10.5 0L1.5 12l5.25-5.25m7.5-3l-4.5 16.5" />
                  </svg>
                </div>

                <p className="relative text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#F472B6]/60 mb-3">Ecosistema</p>
                <p className="relative font-serif text-[1.8rem] font-medium leading-[1.1] text-white mb-4">API Abierta</p>
                <p className="relative text-[0.95rem] font-medium leading-relaxed text-white/50 max-w-[30ch]">
                  Integraciones nativas con POS de caja y terminales bancarias líderes.
                </p>
              </div>

              {/* Soporte */}
              <div className="product-bento-item opacity-0 flex-1 rounded-3xl ring-1 ring-[#F472B6]/20 bg-[#211319] p-8 lg:p-10 relative group overflow-hidden">
                <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.03]" />
                
                <div className="relative mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F472B6]/10 ring-1 ring-[#F472B6]/20 text-[#F472B6]">
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>

                <p className="relative text-[0.65rem] font-bold uppercase tracking-[0.2em] text-[#F472B6]/60 mb-3">Soporte Humano</p>
                <p className="relative font-serif text-[1.8rem] font-medium leading-[1.1] text-white mb-4">Acompañamiento real</p>
                <p className="relative text-[0.95rem] font-medium leading-relaxed text-white/50 max-w-[30ch]">
                  Expertos que te guían en cada paso. Antes, durante y después.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
