"use client";

import { useRef, useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

const rowA = [
  "Mesas sentadas",
  "Órdenes procesadas",
  "Comandas validadas",
  "Envío a cocina",
  "Bebidas servidas",
  "Tiempos de salida",
  "Cuentas pagadas",
  "División inteligente",
  "Cobros confirmados",
  "Mesas liberadas",
  "Métricas en vivo",
  "Operación continua",
];

const rowB = [
  "Tickets promedio",
  "Volumen de ventas",
  "Entradas y fuertes",
  "Tráfico de barra",
  "Postres pendientes",
  "Control de turnos",
  "Velocidad de caja",
  "Propinas exactas",
  "Corte ciego",
  "Cierre perfecto",
  "Inventario sincronizado",
  "Reportes al cierre",
];

const Sep = () => (
  <span className="mx-8 inline-block h-[4px] w-[4px] shrink-0 rounded-full bg-rose/30 shadow-[0_0_8px_rgba(199,91,122,0.5)] align-middle" />
);

function TickerRow({
  items,
  reverse = false,
  speed = 36,
  pauseMotion = false,
}: {
  items: string[];
  reverse?: boolean;
  speed?: number;
  pauseMotion?: boolean;
}) {
  const rowRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (pauseMotion || !rowRef.current || !containerRef.current) return;

    const el = rowRef.current;
    
    const xStart = reverse ? "-33.333333%" : "0%";
    const xEnd = reverse ? "0%" : "-33.333333%";

    const tween = gsap.fromTo(el, 
      { xPercent: parseFloat(xStart) },
      {
        xPercent: parseFloat(xEnd),
        duration: speed,
        ease: "none",
        repeat: -1,
        force3D: true,
        autoRound: false,
      }
    );

    // Smooth velocity transition to avoid jank
    let lastMultiplier = 1;
    const scrollTrigger = ScrollTrigger.create({
      trigger: containerRef.current,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity());
        const multiplier = 1 + Math.min(velocity / 1500, 1.5);
        
        // Only update if change is significant to reduce layout thrashing
        if (Math.abs(multiplier - lastMultiplier) > 0.01) {
          gsap.to(tween, {
            timeScale: multiplier,
            duration: 0.3,
            ease: "power2.out",
            overwrite: true
          });
          lastMultiplier = multiplier;
        }
      },
    });

    return () => {
      tween.kill();
      scrollTrigger.kill();
    };
  }, [reverse, speed, pauseMotion, items]);

  if (pauseMotion) {
    return (
      <div className="overflow-hidden px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-2" role="list">
          {items.map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center" role="listitem">
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.35em] text-white/85 flex items-center gap-4">
                <span className={(i % items.length) % 2 === 0 ? "text-rose" : "text-white/40"} aria-hidden="true">
                  ///
                </span>
                <span>{item}</span>
              </span>
            </span>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="overflow-hidden">
      <div
        ref={rowRef}
        className="flex items-center whitespace-nowrap"
        style={{ 
          willChange: "transform",
          backfaceVisibility: "hidden",
          WebkitBackfaceVisibility: "hidden",
          transformStyle: "preserve-3d"
        }}
      >
        {[...items, ...items, ...items].map((item, i) => {
          const isEven = (i % items.length) % 2 === 0;
          return (
            <span key={i} className="inline-flex items-center">
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.35em] text-white/80 flex items-center gap-4 transition-colors hover:text-white">
                <span className={isEven ? "text-rose shadow-rose/20 drop-shadow-md" : "text-white/40"}>///</span>
                <span>{item}</span>
              </span>
              <Sep />
            </span>
          );
        })}
      </div>
    </div>
  );
}



export const Ticker = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const [prefersReduced, setPrefersReduced] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReduced(mediaQuery.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReduced(e.matches);
    mediaQuery.addEventListener("change", handler);
    return () => mediaQuery.removeEventListener("change", handler);
  }, []);

  useGSAP(() => {
    if (prefersReduced || !sectionRef.current) return;

    gsap.fromTo(sectionRef.current,
      { opacity: 0, y: 30 },
      {
        opacity: 1, y: 0, duration: 1, ease: "power4.out",
        scrollTrigger: {
          trigger: sectionRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        }
      }
    );
  }, { scope: sectionRef, dependencies: [prefersReduced] });

  return (
    <div
      ref={sectionRef}
      className={cn(
        "relative overflow-hidden border-y border-white/5 bg-burgundy py-8 transition-opacity duration-700",
        prefersReduced ? "opacity-100" : "opacity-0"
      )}
      style={
        prefersReduced
          ? undefined
          : {
              WebkitMaskImage: "linear-gradient(to right, transparent 0, black 15%, black 85%, transparent 100%)",
              maskImage: "linear-gradient(to right, transparent 0, black 15%, black 85%, transparent 100%)",
            }
      }
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-30 mix-blend-screen"
        style={{
          background: "radial-gradient(circle at 50% 50%, rgba(199,91,122,0.12) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 mix-blend-overlay opacity-[0.03]"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg viewBox=%220 0 160 160%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.85%22 numOctaves=%222%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E')",
        }}
        aria-hidden
      />

      <div className={cn("relative z-10 flex flex-col", prefersReduced ? "gap-8" : "gap-6")}>
        <TickerRow items={rowA} speed={40} pauseMotion={prefersReduced} />
        <TickerRow items={rowB} speed={50} reverse pauseMotion={prefersReduced} />
      </div>
    </div>
  );
};

