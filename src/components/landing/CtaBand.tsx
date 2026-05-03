"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import floralLeft from "@/assets/floral-assets/branches/complete_2.png";
import floralRight from "@/assets/floral-assets/branches/complete_3.png";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const CtaBand = () => {
  const containerRef = useRef<HTMLElement>(null);
  const [formData, setFormData] = useState({
    restaurantName: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useGSAP(() => {
    const ctx = gsap.context(() => {
      // Entrada del contenido principal
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        }
      });

      tl.fromTo(".cta-label", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" })
        .fromTo(".cta-title", { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, ease: "power3.out" }, "-=0.4")
        .fromTo(".cta-desc", { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }, "-=0.4")
        .fromTo(".cta-chip", { scale: 0.9, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.5, stagger: 0.1, ease: "back.out(1.5)" }, "-=0.2")
        .fromTo(".cta-form", { x: 40, opacity: 0 }, { x: 0, opacity: 1, duration: 1, ease: "power3.out" }, "-=0.8");

      // Animación sutil de las flores
      gsap.to(".cta-floral-1", {
        y: -15,
        rotation: 2,
        duration: 4,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1
      });
      gsap.to(".cta-floral-2", {
        y: 15,
        rotation: -2,
        duration: 5,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
        delay: 1
      });

    }, containerRef);
    return () => ctx.revert();
  }, { scope: containerRef });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section
      ref={containerRef}
      id="contacto"
      className="relative flex min-h-[90dvh] flex-col justify-center bg-[#FCF5F7] py-20 lg:py-32 overflow-hidden"
    >
      {/* Background gradients and noise */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,#FFF0F4_0%,transparent_70%)] opacity-50" />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02] mix-blend-multiply"
        style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.8%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E')" }}
      />

      {/* Decoración floral Izquierda */}
      <Image
        src={floralLeft}
        alt=""
        priority
        loading="eager"
        className="cta-floral-1 pointer-events-none absolute -left-[20%] top-1/2 -translate-y-1/2 w-[700px] opacity-[0.15] mix-blend-multiply drop-shadow-xl z-0"
        aria-hidden="true"
      />

      {/* Decoración floral Derecha */}
      <Image
        src={floralRight}
        alt=""
        priority
        loading="eager"
        className="cta-floral-2 pointer-events-none absolute -right-[15%] bottom-0 w-[500px] opacity-[0.12] mix-blend-multiply drop-shadow-xl z-0"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-[1200px] gap-16 px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:px-8 relative z-10">
        <div className="max-w-xl">
          <div className="cta-label opacity-0 inline-flex items-center gap-3 mb-6">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose/10 text-rose">
              <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </span>
            <span className="text-[0.65rem] font-bold uppercase tracking-[0.3em] text-burgundy/50">
              Siguiente paso
            </span>
          </div>

          <h2 className="cta-title opacity-0 text-balance font-serif text-[clamp(3.5rem,6vw,5rem)] font-medium text-burgundy leading-[0.95] tracking-tight">
            Haz que el <br /> turno <span className="italic text-rose">florezca.</span>
          </h2>

          <p className="cta-desc opacity-0 mt-8 max-w-lg text-balance text-[1.15rem] leading-[1.6] text-burgundy/60 font-medium">
            Si querés que Bouquet se adapte a tu servicio, dejanos tus datos. Te
            contactamos en menos de 2 horas para mostrarte el flujo completo.
          </p>

          <div className="mt-10 flex flex-wrap gap-3">
            {[
              "No tenés que cambiar equipo",
              "Sin migración compleja",
              "Operación ininterrumpida",
            ].map((item) => (
              <p
                key={item}
                className="cta-chip opacity-0 inline-flex items-center gap-2.5 rounded-full border border-rose/10 bg-white/40 backdrop-blur-sm px-5 py-2.5 text-[0.8rem] font-semibold text-burgundy/70 shadow-sm transition-transform hover:scale-105 hover:bg-white/60"
              >
                <span className="flex items-center justify-center h-4 w-4 rounded-full bg-rose/10 text-rose shrink-0">
                  <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                </span>
                {item}
              </p>
            ))}
          </div>
        </div>

        {/* Formulario Glassmórfico Premium */}
        <div className="cta-form opacity-0 relative w-full">
          {/* Sombra de fondo y blur */}
          <div className="absolute inset-0 translate-y-4 translate-x-4 rounded-[2.5rem] bg-rose/5 blur-xl" />
          
          <div className="relative rounded-[2.5rem] border border-white/50 bg-white/40 p-8 shadow-[0_20px_60px_-15px_rgba(199,91,122,0.1)] backdrop-blur-xl sm:p-10">
            {!submitted ? (
              <form suppressHydrationWarning onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <div className="group relative">
                    <input
                      id="restaurantName"
                      type="text"
                      required
                      value={formData.restaurantName}
                      onChange={(e) => setFormData({ ...formData, restaurantName: e.target.value })}
                      className="peer h-14 w-full rounded-2xl border-2 border-white/60 bg-white/30 px-5 text-[0.95rem] font-medium text-burgundy placeholder-transparent outline-none transition-all focus:border-rose/40 focus:bg-white/60"
                      placeholder="Nombre del restaurante"
                    />
                    <label
                      htmlFor="restaurantName"
                      className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[0.85rem] font-semibold text-burgundy/40 transition-all peer-focus:-translate-y-9 peer-focus:scale-85 peer-focus:text-rose peer-valid:-translate-y-9 peer-valid:scale-85"
                    >
                      Nombre del restaurante
                    </label>
                  </div>
                  
                  <div className="group relative">
                    <input
                      id="contactName"
                      type="text"
                      required
                      value={formData.contactName}
                      onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                      className="peer h-14 w-full rounded-2xl border-2 border-white/60 bg-white/30 px-5 text-[0.95rem] font-medium text-burgundy placeholder-transparent outline-none transition-all focus:border-rose/40 focus:bg-white/60"
                      placeholder="Tu nombre"
                    />
                    <label
                      htmlFor="contactName"
                      className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[0.85rem] font-semibold text-burgundy/40 transition-all peer-focus:-translate-y-9 peer-focus:scale-85 peer-focus:text-rose peer-valid:-translate-y-9 peer-valid:scale-85"
                    >
                      Tu nombre
                    </label>
                  </div>
                </div>

                <div className="group relative">
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="peer h-14 w-full rounded-2xl border-2 border-white/60 bg-white/30 px-5 text-[0.95rem] font-medium text-burgundy placeholder-transparent outline-none transition-all focus:border-rose/40 focus:bg-white/60"
                    placeholder="Correo electrónico"
                  />
                  <label
                    htmlFor="email"
                    className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[0.85rem] font-semibold text-burgundy/40 transition-all peer-focus:-translate-y-9 peer-focus:scale-85 peer-focus:text-rose peer-valid:-translate-y-9 peer-valid:scale-85"
                  >
                    Correo electrónico
                  </label>
                </div>

                <div className="group relative">
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="peer h-14 w-full rounded-2xl border-2 border-white/60 bg-white/30 px-5 text-[0.95rem] font-medium text-burgundy placeholder-transparent outline-none transition-all focus:border-rose/40 focus:bg-white/60"
                    placeholder="Teléfono"
                  />
                  <label
                    htmlFor="phone"
                    className="pointer-events-none absolute left-5 top-1/2 -translate-y-1/2 text-[0.85rem] font-semibold text-burgundy/40 transition-all peer-focus:-translate-y-9 peer-focus:scale-85 peer-focus:text-rose peer-valid:-translate-y-9 peer-valid:scale-85"
                  >
                    Teléfono
                  </label>
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="group relative w-full overflow-hidden rounded-2xl bg-burgundy px-10 py-4 text-[1rem] font-bold text-white shadow-xl transition-all duration-300 hover:scale-[1.02] hover:shadow-rose/30 active:scale-95 disabled:pointer-events-none disabled:opacity-70 mt-2"
                >
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  
                  <div className="relative flex items-center justify-center gap-3">
                    <span>
                      {isSubmitting ? "Enviando solicitud..." : "Solicitar Demo"}
                    </span>
                    {!isSubmitting ? (
                      <svg
                        className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    ) : (
                      <svg className="h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                    )}
                  </div>
                </button>
              </form>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center animate-in fade-in zoom-in duration-500">
                <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-rose/10 text-rose ring-1 ring-rose/20 shadow-inner">
                  <svg className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="font-serif text-3xl font-semibold text-burgundy mb-3">
                  ¡Todo listo!
                </h3>
                <p className="text-burgundy/60 text-[1.05rem] max-w-[28ch] mx-auto leading-relaxed">
                  Recibimos tu información. Un experto de Bouquet te contactará muy pronto.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
