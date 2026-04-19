"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { ProductMockup } from "@/components/landing/ProductMockup";

const easeOutQuint = [0.32, 0.72, 0, 1] as const;

export const ProductSection = () => {
  const sectionRef = useRef<HTMLElement>(null);
  
  // High-End Parallax & Scrubbing Effects
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  // Heavy parallax on the mockup to give it a cinematic feel
  const mockupY = useTransform(scrollYProgress, [0, 1], [150, -150]);
  const textY = useTransform(scrollYProgress, [0, 1], [50, -50]);
  
  return (
    <section
      ref={sectionRef}
      className="relative bg-charcoal text-cream py-32 lg:py-48 overflow-hidden z-10"
      id="producto"
    >
      {/* Top bookend: fade from previous cream section → charcoal */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-cream/18 via-charcoal/0 to-charcoal/0" aria-hidden="true" />

      {/* Cinematic Film Grain Overlay — fixed via background-attachment to avoid GPU repaints on scroll */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-screen"
        style={{
          backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')",
          backgroundAttachment: "fixed",
        }}
        aria-hidden="true"
      />

      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,#2a241f_0%,transparent_60%)]" aria-hidden="true" />

      <div className="mx-auto max-w-[85rem] px-6 lg:px-10 relative">
        
        {/* Elite Editorial Header */}
        <motion.div style={{ y: textY }} className="flex flex-col gap-6 lg:gap-10 mb-32 lg:mb-48">
          <div className="inline-flex">
            {/* Double bezel pill for category */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-full ring-1 ring-white/10 bg-white/5 backdrop-blur-md shadow-[inset_0_1px_0_rgba(255,255,255,0.1)]">
              <span className="w-2 h-2 rounded-full bg-gold animate-pulse" />
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/70">
                La Plataforma
              </span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-12 lg:gap-20 items-end">
            <h2 className="font-serif text-[clamp(3.5rem,7vw,6.5rem)] font-medium italic leading-[0.9] tracking-tight text-white m-0">
              Control <br />
              <span className="text-white/40">absoluto.</span>
            </h2>
            <p className="max-w-md text-[1.15rem] font-light leading-[1.8] text-white/50 pb-2">
              Bouquet unifica cada vértice del restaurante. Sin hardware excesivo, sin cables, sin fricción entre estaciones.
            </p>
          </div>
        </motion.div>

        {/* Cinematic Mockup Core */}
        <motion.div
          style={{ y: mockupY }}
           className="relative rounded-[2.5rem] lg:rounded-[3.5rem] bg-gradient-to-b from-white/[0.07] to-white/[0.02] ring-1 ring-white/10 p-4 lg:p-8 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.7),inset_0_1px_0_rgba(255,255,255,0.08)] mb-32 lg:mb-48 origin-bottom will-change-transform"
        >
           {/* Inner core — concentric radius */}
           <div className="relative rounded-[calc(2.5rem-1rem)] lg:rounded-[calc(3.5rem-2rem)] overflow-hidden bg-black/60 ring-1 ring-white/5 shadow-[inset_0_4px_20px_rgba(255,255,255,0.05)]">
             <ProductMockup />
           </div>
        </motion.div>

        {/* Asymmetrical Bento Facts (Gapless Aesthetic) */}
        <div className="relative">
          <div className="flex items-center gap-4 mb-16">
            <h3 className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-white/40">Métricas & Soporte</h3>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 overflow-hidden rounded-[2.5rem] ring-1 ring-white/10 bg-white/[0.03] shadow-[inset_0_1px_0_rgba(255,255,255,0.05)]">
            {/* Feature 1 (Large) */}
            <div className="col-span-1 md:col-span-7 p-10 lg:p-14 border-b md:border-b-0 md:border-r border-white/10 relative group">
              <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.02]" />
              <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/30 mb-8">Deploy Rápido</p>
              <div className="flex items-baseline gap-4 mb-4">
                <span className="font-serif text-[4.5rem] lg:text-[6rem] font-medium leading-[0.8] text-white tracking-tighter">1</span>
                <span className="font-serif text-[2rem] lg:text-[2.5rem] italic text-white/40">Día</span>
              </div>
              <p className="text-[1.05rem] font-medium leading-relaxed text-white/60 max-w-[30ch]">
                Del primer onboarding técnico a tu primer turno operativo real. Cero configuraciones traumáticas.
              </p>
            </div>

            {/* Constraints Block (Vertical Stack) */}
            <div className="col-span-1 md:col-span-5 flex flex-col divide-y divide-white/10">
              
              <div className="flex-1 p-10 lg:p-12 relative group">
                <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.02]" />
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-white/30 mb-4">Ecosistema</p>
                <p className="font-serif text-[2.5rem] font-medium leading-[1] text-white mb-2 tracking-tight">API Abierta.</p>
                <p className="text-[0.95rem] font-medium leading-snug text-white/50">
                  Integraciones nativas automáticas con POS de caja y terminales bancarias.
                </p>
              </div>

              <div className="flex-1 p-10 lg:p-12 relative group bg-gold/5">
                <div className="pointer-events-none absolute inset-0 bg-white/0 transition-colors duration-500 group-hover:bg-white/[0.02]" />
                <p className="text-[0.65rem] font-bold uppercase tracking-[0.25em] text-gold/60 mb-4">Respaldo</p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-serif text-[2.5rem] font-medium leading-[1] text-white mb-2 tracking-tight">24/7</p>
                    <p className="text-[0.95rem] font-medium leading-snug text-white/50">Soporte humano en español.</p>
                  </div>
                  <div className="h-12 w-12 rounded-full border border-gold/30 flex items-center justify-center shrink-0 text-gold shadow-[0_0_20px_rgba(212,175,55,0.15)]">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
