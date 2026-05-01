"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(ScrollTrigger);

export const SocialProof = () => {
  const sectionRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) {
      gsap.set([".social-label", ".social-headline", ".social-desc", ".social-metrics", ".social-quote", ".social-testimonial"], {
        opacity: 1, y: 0, x: 0, scale: 1
      });
      return;
    }

    const ctx = gsap.context(() => {
      // Left column entrance
      gsap.fromTo(".social-label",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: ".social-label", start: "top 85%", toggleActions: "play none none none" }
        }
      );
      gsap.fromTo(".social-headline",
        { y: 40, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.2, ease: "power4.out",
          scrollTrigger: { trigger: ".social-headline", start: "top 85%", toggleActions: "play none none none" }
        }
      );
      gsap.fromTo(".social-desc",
        { y: 20, opacity: 0 },
        { y: 0, opacity: 1, duration: 0.8, ease: "power3.out",
          scrollTrigger: { trigger: ".social-desc", start: "top 85%", toggleActions: "play none none none" }
        }
      );

      // Metrics box entrance with staggered numbers
      gsap.fromTo(".social-metrics",
        { y: 50, opacity: 0, scale: 0.98 },
        {
          y: 0, opacity: 1, scale: 1, duration: 1, ease: "power4.out",
          scrollTrigger: { trigger: ".social-metrics", start: "top 88%", toggleActions: "play none none none" }
        }
      );

      // Quote entrance
      gsap.fromTo(".social-quote",
        { y: 60, opacity: 0, rotation: 0.5 },
        {
          y: 0, opacity: 1, rotation: 0, duration: 1.2, ease: "power4.out",
          scrollTrigger: { trigger: ".social-quote", start: "top 85%", toggleActions: "play none none none" }
        }
      );

      // Testimonial card entrance
      gsap.fromTo(".social-testimonial",
        { y: 50, opacity: 0, x: 20 },
        {
          y: 0, opacity: 1, x: 0, duration: 1, ease: "power4.out",
          scrollTrigger: { trigger: ".social-testimonial", start: "top 88%", toggleActions: "play none none none" }
        }
      );

    }, sectionRef);

    return () => ctx.revert();
  }, { scope: sectionRef });

  return (
    <section ref={sectionRef} className="relative overflow-hidden bg-burgundy py-24 lg:py-32">
      {/* Transición */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_-10%,rgba(199,91,122,0.08)_0%,transparent_55%)]"
      />

      <div className="relative mx-auto max-w-[90rem] px-6 lg:px-12">
        <div className="grid gap-14 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,1.08fr)] lg:items-start lg:gap-16 xl:gap-24">
          {/* Columna editorial */}
          <div className="relative lg:pr-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-4 top-2 bottom-8 hidden w-px bg-gradient-to-b from-rose/60 via-rose/20 to-transparent lg:block"
            />

            <p className="social-label opacity-0 flex items-center gap-3 text-[0.62rem] font-bold uppercase tracking-[0.34em] text-white/42">
              <span className="h-px w-10 bg-gradient-to-r from-rose/70 to-transparent" aria-hidden="true" />
              Prueba social
            </p>

            <h2 className="social-headline opacity-0 mt-6 max-w-[13ch] text-balance font-serif text-[clamp(2.4rem,4.5vw,3.8rem)] font-semibold italic leading-[1.02] tracking-[-0.03em] text-white">
              El turno se siente más corto.
            </h2>

            <p className="social-desc opacity-0 mt-8 max-w-lg text-[1.05rem] leading-[1.78] text-white/55">
              Cuando la sala, la cocina y la caja dejan de pelearse entre sí, el equipo trabaja con más calma
              y el servicio se nota más fluido desde la primera semana.
            </p>

            {/* Métricas */}
            <div className="social-metrics opacity-0 mt-12 max-w-lg">
              <p className="mb-4 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-white/35">
                En una sola vista
              </p>
              <div className="grid grid-cols-1 divide-y divide-white/10 rounded-2xl border border-white/[0.08] bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                {[
                  { value: "3", label: "frentes sincronizados" },
                  { value: "1", label: "pantalla por turno" },
                  { value: "0", label: "capturas duplicadas" },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-col justify-center px-6 py-5 sm:min-h-[5.75rem] sm:py-6"
                  >
                    <span className="font-serif text-[2.25rem] font-semibold leading-none tracking-tight text-rose tabular-nums sm:text-[2.5rem]">
                      {item.value}
                    </span>
                    <span className="mt-3 max-w-[14ch] text-[0.55rem] font-bold uppercase leading-snug tracking-[0.22em] text-white/44">
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Testimonios */}
          <div className="flex flex-col gap-8 lg:gap-10">
            <div className="social-quote opacity-0">
              <p className="mb-4 text-[0.58rem] font-bold uppercase tracking-[0.28em] text-white/35 lg:text-right">
                En sus palabras
              </p>

              <blockquote className="relative rounded-2xl border border-white/[0.09] bg-white/[0.035] p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] backdrop-blur-[12px] lg:p-10">
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute left-6 top-4 font-serif text-[clamp(3.5rem,10vw,5.5rem)] italic leading-none text-rose/[0.12] select-none sm:left-8 sm:top-6"
                >
                  &ldquo;
                </span>
                <p className="relative pt-10 font-serif text-[clamp(1.35rem,2.2vw,1.8rem)] font-medium italic leading-[1.35] tracking-[-0.02em] text-white/[0.92] sm:pt-8">
                  Antes perdíamos horas cerrando caja y cuadrando cuentas. Con Bouquet cobramos más rápido y la sala ya no se
                  queda esperando al cierre.
                </p>
              </blockquote>
            </div>

            <div className="social-testimonial opacity-0 flex flex-col gap-6 rounded-2xl border border-white/[0.07] bg-gradient-to-br from-white/[0.055] to-transparent px-8 py-7 lg:flex-row lg:items-center lg:justify-between lg:gap-10">
              <div className="flex min-w-0 flex-1 items-start gap-4">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-rose/25 bg-rose/[0.08] font-serif text-[1.05rem] font-semibold italic text-rose">
                  RC
                </span>
                <div className="min-w-0">
                  <p className="text-[0.95rem] font-semibold text-white">Rodrigo Castellanos</p>
                  <p className="mt-1 text-[0.78rem] font-medium text-white/45">Dueño de restaurante · CDMX</p>
                  <p className="mt-4 text-[0.92rem] leading-[1.65] text-white/55">
                    Operación de ~90 cubiertos nocturnos, 2 sucursales.
                  </p>
                </div>
              </div>
              <blockquote className="relative border-t border-white/10 pt-6 pl-1 text-[0.92rem] leading-[1.75] text-white/[0.72] lg:max-w-[22rem] lg:border-l lg:border-t-0 lg:pl-10 lg:pt-1">
                <span className="absolute left-0 top-6 font-serif text-3xl leading-none text-rose/30 lg:left-4 lg:top-5">
                  &ldquo;
                </span>
                <span className="block pl-8">
                  Mis meseros ahora venden más y corren menos detrás de libretas.
                </span>
              </blockquote>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
