"use client";

import { useRef, useEffect } from "react";
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

  useEffect(() => {
    if (pauseMotion || !rowRef.current) return;
    const el = rowRef.current;
    // Calculate total width
    const totalWidth = el.scrollWidth / 3;
    const direction = reverse ? -1 : 1;

    // Base animation
    const tween = gsap.to(el, {
      x: direction * -totalWidth,
      duration: speed,
      ease: "none",
      repeat: -1,
      modifiers: {
        x: gsap.utils.unitize((x) => parseFloat(x) % totalWidth),
      },
    });

    // Scroll-driven speed multiplier
    const scrollTrigger = ScrollTrigger.create({
      trigger: el,
      start: "top bottom",
      end: "bottom top",
      onUpdate: (self) => {
        const velocity = Math.abs(self.getVelocity());
        const multiplier = 1 + Math.min(velocity / 2000, 2);
        tween.timeScale(multiplier);
      },
    });

    return () => {
      tween.kill();
      scrollTrigger.kill();
    };
  }, [reverse, speed, pauseMotion]);

  if (pauseMotion) {
    return (
      <div className="overflow-hidden px-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-4 py-2" role="list">
          {items.map((item, i) => (
            <span key={`${item}-${i}`} className="inline-flex items-center" role="listitem">
              <span className="text-[0.75rem] font-bold uppercase tracking-[0.35em] text-white/85 flex items-center gap-4">
                <span className={i % 2 === 0 ? "text-rose" : "text-white/40"} aria-hidden="true">
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
    <div className="overflow-hidden">
      <div
        ref={rowRef}
        className="flex items-center whitespace-nowrap"
        style={{ willChange: "transform" }}
      >
        {[...items, ...items, ...items].map((item, i) => (
          <span key={i} className="inline-flex items-center">
            <span className="text-[0.75rem] font-bold uppercase tracking-[0.35em] text-white/80 flex items-center gap-4 transition-colors hover:text-white">
              <span className={i % 2 === 0 ? "text-rose shadow-rose/20 drop-shadow-md" : "text-white/40"}>///</span>
              <span>{item}</span>
            </span>
            <Sep />
          </span>
        ))}
      </div>
    </div>
  );
}

export const Ticker = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const prefersReduced = typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  useGSAP(() => {
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
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
    }, sectionRef);

    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <div
      ref={sectionRef}
      className="relative overflow-hidden border-y border-white/5 bg-burgundy py-8 opacity-0"
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
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
        aria-hidden
      />

      <div className={`relative z-10 flex flex-col ${prefersReduced ? "gap-8" : "gap-6"}`}>
        <TickerRow items={rowA} speed={40} pauseMotion={prefersReduced} />
        <TickerRow items={rowB} speed={50} reverse pauseMotion={prefersReduced} />
      </div>
    </div>
  );
};
