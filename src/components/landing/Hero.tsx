"use client";

import { useRef } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";

import Image from "next/image";
import floralLeft from "@/assets/floral-assets/branches/complete_2.png";
import floralRight from "@/assets/floral-assets/branches/complete_3.png";
import iconMesa from "@/assets/mesa.png";
import iconCampana from "@/assets/campana.png";
import iconTarjeta from "@/assets/tarjeta.png";
import iconRecibo from "@/assets/recibo.png";
import iconCuchilloTenedor from "@/assets/cuchillo_tenedor.png";
import { Armchair, Bell, CreditCard, UtensilsCrossed, Receipt, ChevronRight, Clock, Users, CreditCard as CardIcon, MapPin, Utensils } from "lucide-react";

/* ── iPhone Frame Shell ── */
function IPhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative">
      {/* Side buttons — left */}
      <div className="absolute -left-[2px] top-[18%] h-7 w-[3px] rounded-l-sm bg-[#d4a5b5]" />
      <div className="absolute -left-[2px] top-[26%] h-12 w-[3px] rounded-l-sm bg-[#d4a5b5]" />
      <div className="absolute -left-[2px] top-[40%] h-12 w-[3px] rounded-l-sm bg-[#d4a5b5]" />
      {/* Power button — right */}
      <div className="absolute -right-[2px] top-[28%] h-16 w-[3px] rounded-r-sm bg-[#d4a5b5]" />

      {/* Outer frame */}
      <div className="relative rounded-[2.8rem] bg-gradient-to-b from-[#f5e0e8] via-[#e8c8d4] to-[#dcb8c6] p-[3px] shadow-[0_35px_70px_-25px_rgba(74,26,44,0.45),0_0_0_1px_rgba(74,26,44,0.08)]">
        {/* Inner bezel */}
        <div className="relative rounded-[2.6rem] bg-burgundy p-[2px]">
          {/* Screen */}
          <div className="relative overflow-hidden rounded-[2.5rem] bg-rose-cream">
            {/* Dynamic Island */}
            <div className="absolute left-1/2 top-3 z-30 h-[26px] w-[90px] -translate-x-1/2 rounded-full bg-burgundy shadow-inner" />

            {/* Screen content */}
            <div className="relative">
              {children}
            </div>

            {/* Bottom home indicator */}
            <div className="absolute bottom-2 left-1/2 z-30 h-[5px] w-28 -translate-x-1/2 rounded-full bg-burgundy/20" />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Phone Mockup: Guest App ── */
function PhoneMockup() {
  return (
    <div className="hero-mockup-phone relative w-[300px] shrink-0 opacity-0">
      <IPhoneFrame>
        {/* Status bar area */}
        <div className="flex items-center justify-between px-8 pt-3 pb-1">
          <span className="text-[0.6rem] font-semibold text-burgundy/60">9:41</span>
          <div className="flex items-center gap-1">
            <svg className="h-3 w-3 text-burgundy/40" viewBox="0 0 24 24" fill="currentColor"><path d="M12 3C7.46 3 3.34 4.78.29 7.67c-.18.18-.29.43-.29.71 0 .28.11.53.29.71l2.48 2.48c.18.18.43.29.71.29.27 0 .52-.11.7-.28.79-.74 1.69-1.36 2.66-1.85.33-.16.56-.5.56-.9v-3.1c1.45-.48 3-.73 4.6-.73s3.15.25 4.6.72v3.1c0 .39.23.74.56.9.98.49 1.87 1.12 2.67 1.85.18.18.43.28.7.28.28 0 .53-.11.71-.29l2.48-2.48c.18-.18.29-.43.29-.71 0-.28-.11-.53-.29-.71C20.66 4.78 16.54 3 12 3z"/></svg>
            <svg className="h-3 w-3 text-burgundy/40" viewBox="0 0 24 24" fill="currentColor"><path d="M15.67 4H14V2h-4v2H8.33C7.6 4 7 4.6 7 5.33v15.33C7 21.4 7.6 22 8.33 22h7.33c.74 0 1.34-.6 1.34-1.33V5.33C17 4.6 16.4 4 15.67 4z"/></svg>
          </div>
        </div>

        <div className="px-6 pt-6 pb-8">
          {/* Restaurant header */}
          <div className="mb-6 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-burgundy/5 ring-1 ring-burgundy/10">
              <span className="font-serif text-base font-bold italic text-burgundy">B</span>
            </div>
            <div>
              <p className="text-[0.75rem] font-bold text-burgundy">Bistro Florecer</p>
              <div className="flex items-center gap-1 text-[0.6rem] text-burgundy/50">
                <MapPin className="h-2.5 w-2.5" />
                <span>Mesa 12 · Terraza</span>
              </div>
            </div>
          </div>

          {/* Welcome */}
          <div className="mb-6">
            <p className="font-serif text-2xl font-semibold italic leading-tight text-burgundy">
              ¡Bienvenidos!
            </p>
            <p className="mt-1 text-[0.75rem] text-burgundy/50">
              Tu mesa está lista. Escanea o explora el menú.
            </p>
          </div>

          {/* Action cards */}
          <div className="space-y-3">
            {[
              { icon: iconCuchilloTenedor, label: "Explorar menú", desc: "Carta completa", color: "bg-rose/10 text-rose", ring: "ring-rose/20" },
              { icon: iconCampana, label: "Mis órdenes", desc: "3 ítems en preparación", color: "bg-amber-50 text-amber-600", ring: "ring-amber-200" },
              { icon: iconMesa, label: "Cuenta compartida", desc: "4 comensales", color: "bg-sky-50 text-sky-600", ring: "ring-sky-200" },
              { icon: iconTarjeta, label: "Pagar", desc: "$1,240 total", color: "bg-emerald-50 text-emerald-600", ring: "ring-emerald-200" },
            ].map((item) => (
              <button
                key={item.label}
                className="group flex w-full items-center gap-4 rounded-2xl bg-white/70 px-4 py-3.5 shadow-[0_1px_3px_rgba(74,26,44,0.05)] ring-1 ring-burgundy/[0.06] backdrop-blur-sm transition-all active:scale-[0.98]"
              >
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${item.color} ring-1 ${item.ring}`}>
                  <Image src={item.icon} alt="" className="h-5.5 w-5.5 object-contain" />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-[0.82rem] font-semibold text-burgundy">{item.label}</p>
                  <p className="text-[0.65rem] text-burgundy/45">{item.desc}</p>
                </div>
                <ChevronRight className="h-4 w-4 text-burgundy/25 transition-transform group-hover:translate-x-0.5" />
              </button>
            ))}
          </div>
        </div>
      </IPhoneFrame>
    </div>
  );
}

/* ── Ticket / Receipt Mockup ── */
function TicketMockup() {
  return (
    <div className="hero-mockup-ticket relative w-[260px] shrink-0 opacity-0">
      {/* Paper texture background */}
      <div className="relative rounded-2xl bg-white p-6 shadow-[0_20px_50px_-15px_rgba(74,26,44,0.2)] ring-1 ring-rose-blush/30">
        {/* Subtle paper grain */}
        <div
          className="pointer-events-none absolute inset-0 rounded-2xl opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
          }}
        />

        {/* Header */}
        <div className="relative mb-5 text-center">
          <div className="mx-auto mb-2 flex h-8 w-8 items-center justify-center rounded-full bg-burgundy/5 ring-1 ring-burgundy/10">
            <span className="font-serif text-sm font-bold italic text-burgundy">B</span>
          </div>
          <p className="font-serif text-base font-semibold italic text-burgundy">bouquet</p>
          <p className="mt-0.5 font-mono text-[0.55rem] font-bold uppercase tracking-[0.15em] text-burgundy/40">Mesa 12 · Orden #48</p>
        </div>

        {/* Divider with dots */}
        <div className="relative mb-5 flex items-center gap-2">
          <div className="h-px flex-1 bg-dashed border-t border-dashed border-burgundy/15" />
          <div className="flex gap-1">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-1 w-1 rounded-full bg-rose/30" />
            ))}
          </div>
          <div className="h-px flex-1 bg-dashed border-t border-dashed border-burgundy/15" />
        </div>

        {/* Items */}
        <div className="relative mb-4 space-y-3">
          {[
            { item: "Entrada compartida", price: "$180", qty: "1" },
            { item: "Rib eye · Medio", price: "$340", qty: "1" },
            { item: "Bebida", price: "$120", qty: "2" },
            { item: "Postre compartido", price: "$160", qty: "1" },
          ].map((line) => (
            <div key={line.item} className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <span className="text-[0.78rem] font-medium text-burgundy/80">{line.item}</span>
                <span className="ml-1.5 text-[0.65rem] text-burgundy/35">x{line.qty}</span>
              </div>
              <span className="font-mono text-[0.78rem] font-semibold tabular-nums text-burgundy">{line.price}</span>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="relative mb-4 border-t border-dashed border-burgundy/10" />

        {/* Totals */}
        <div className="relative mb-5 space-y-2">
          <div className="flex justify-between text-[0.72rem]">
            <span className="text-burgundy/50">Subtotal</span>
            <span className="font-mono font-medium text-burgundy/70">$800</span>
          </div>
          <div className="flex justify-between text-[0.72rem]">
            <span className="text-burgundy/50">Propina (10%)</span>
            <span className="font-mono font-medium text-burgundy/70">$80</span>
          </div>
          <div className="flex justify-between border-t border-burgundy/8 pt-2">
            <span className="text-[0.85rem] font-bold text-burgundy">Total</span>
            <span className="font-mono text-[0.95rem] font-bold text-burgundy">$880</span>
          </div>
        </div>

        {/* Split section */}
        <div className="relative mb-5 rounded-xl bg-rose-cream/40 p-4 ring-1 ring-rose-blush/20">
          <p className="mb-3 text-[0.6rem] font-bold uppercase tracking-[0.18em] text-burgundy/40">Dividido por comensal</p>
          <div className="space-y-2.5">
            {[
              { name: "Ana", amount: "$220", avatar: "A", color: "bg-rose/15 text-rose" },
              { name: "Luis", amount: "$220", avatar: "L", color: "bg-sky-50 text-sky-600" },
              { name: "María", amount: "$220", avatar: "M", color: "bg-amber-50 text-amber-600" },
              { name: "Carlos", amount: "$220", avatar: "C", color: "bg-emerald-50 text-emerald-600" },
            ].map((p) => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className={`flex h-6 w-6 items-center justify-center rounded-full text-[0.6rem] font-bold ${p.color}`}>
                    {p.avatar}
                  </span>
                  <span className="text-[0.75rem] font-medium text-burgundy/70">{p.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <svg className="h-3.5 w-3.5 text-sage-deep" viewBox="0 0 20 20" fill="none">
                    <path d="M4 10l4 4 8-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </svg>
                  <span className="font-mono text-[0.75rem] font-semibold text-burgundy/80">{p.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="relative text-center">
          <p className="font-serif text-lg italic text-rose">¡Gracias!</p>
          <p className="mt-1 text-[0.6rem] font-medium tracking-wide text-burgundy/30">Florecemos juntos · bouquet.io</p>
        </div>

        {/* Perforated edge bottom */}
        <div className="pointer-events-none absolute -bottom-3 left-0 right-0 flex justify-between px-3">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="h-5 w-5 rounded-full bg-[#FAF6F3]" />
          ))}
        </div>
      </div>
    </div>
  );
}

export const Hero = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Media query to check for reduced motion preference
    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReducedMotion) {
      gsap.set([
        ".hero-floral-left", ".hero-floral-right", ".bg-blob", ".hero-title-inner", 
        ".hero-subtitle", ".hero-desc", ".hero-pillar-item", ".hero-pillar-divider", ".hero-cta", ".hero-pink-circle",
        ".hero-mockup-phone", ".hero-mockup-ticket", ".hero-toast"
      ], { opacity: 1, y: 0, x: 0, scale: 1 });
      return;
    }

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Fondo + flores + círculo rosa (escenografía)
    tl.fromTo([".bg-blob", ".hero-floral-left", ".hero-floral-right", ".hero-pink-circle"],
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 1, stagger: 0.08 },
      0
    )
    // 2. Título
    .fromTo(".hero-title-inner",
      { y: 30, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.7 },
      0.2
    )
    // 3. Subtítulo, descripción y pilares
    .fromTo([".hero-subtitle", ".hero-desc", ".hero-pillar-item"],
      { y: 20, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, stagger: 0.06 },
      0.4
    )
    // 4. CTAs
    .fromTo(".hero-cta",
      { y: 15, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.5, stagger: 0.1 },
      0.6
    )
    // 5. Teléfonos
    .fromTo([".hero-mockup-phone", ".hero-mockup-ticket"],
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.15 },
      0.5
    )
    // 6. Toasts
    .fromTo(".hero-toast",
      { x: 30, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, stagger: 0.2 },
      0.9
    );
  }, { scope: containerRef });

  return (
    <section ref={containerRef} className="relative flex min-h-[100dvh] flex-col justify-center overflow-hidden pt-32 pb-20 lg:pt-44 lg:pb-28">
      {/* Fondo atmosférico */}
      <div className="absolute inset-0 -z-10 pointer-events-none">
        <div className="bg-blob absolute left-[-10%] top-[-5%] h-[30rem] w-[30rem] rounded-full bg-rose/10 blur-3xl opacity-0" />
        <div className="bg-blob absolute right-[-8%] bottom-[10%] h-[25rem] w-[25rem] rounded-full bg-sage/10 blur-3xl opacity-0" />
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-burgundy/10 to-transparent" />
      </div>

      <div className="mx-auto grid w-full max-w-7xl gap-6 px-6 md:gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center lg:gap-8 lg:px-10">
        {/* Columna izquierda — texto */}
        <div className="max-w-xl mx-auto lg:mx-0 text-center lg:text-left">
          {/* Logo grande */}
          <div className="mt-0 lg:mt-8">
            <p className="hero-subtitle opacity-0 mb-2 text-xs tracking-[0.25em] uppercase text-rose-700/60">
              PARA RESTAURANTES QUE QUIEREN CRECER
            </p>
            {/* Wrapper for overflow hidden reveal effect */}
            <div className="overflow-hidden leading-[0.85] pb-2">
              <h1 className="hero-title-inner opacity-0 origin-left font-serif text-3xl sm:text-4xl md:text-[2.75rem] lg:text-7xl font-semibold italic tracking-[-0.03em] text-burgundy">
                El sistema que <span style={{ color: '#C06A78' }}>ordena el servicio</span> de tu restaurante.
              </h1>
            </div>
          </div>

          {/* Tagline */}
          <p className="hero-desc opacity-0 mt-5 lg:mt-6 max-w-lg mx-auto lg:mx-0 text-balance text-[0.95rem] md:text-[1.1rem] leading-[1.7] text-burgundy/65">
            Bouquet conecta mesas, órdenes y pagos en una sola operación.
            Menos caos, más control y un mejor servicio para tus clientes.
          </p>

          {/* Pilares Unificados */}
          <div className="hero-pillars mt-6 lg:mt-10 flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-start gap-3 md:gap-4">
            {[
              { label: "Gestión de Mesas", icon: iconMesa },
              { label: "Flujo de Órdenes", icon: iconCampana },
              { label: "Pagos Centrales", icon: iconTarjeta }
            ].map((pillar, idx) => (
              <div 
                key={idx} 
                className="hero-pillar-item opacity-0 group flex items-center gap-2.5 rounded-xl border border-rose/10 bg-white/40 px-3 py-1.5 backdrop-blur-md shadow-[0_4px_15px_-10px_rgba(199,91,122,0.1)] transition-all duration-300 hover:bg-white/60 hover:-translate-y-0.5"
              >
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-rose/10 transition-colors duration-300 group-hover:bg-rose/20">
                  <Image src={pillar.icon} alt="" className="h-3.5 w-3.5 object-contain opacity-80" />
                </div>
                <span className="font-serif text-[0.85rem] font-medium text-burgundy whitespace-nowrap">{pillar.label}</span>
              </div>
            ))}
          </div>

          {/* CTAs */}
          <div className="mt-8 lg:mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center lg:justify-start">
            <a
              href="#contacto"
              className="hero-cta opacity-0 group inline-flex h-11 w-full items-center justify-center gap-2.5 rounded-full bg-burgundy px-5 text-[0.9rem] md:text-[0.9375rem] font-semibold text-white shadow-[0_20px_40px_-20px_rgba(74,26,44,0.5)] transition-colors duration-200 active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose sm:w-auto sm:justify-between"
            >
              <span className="whitespace-nowrap">Reservar demo de 20 min</span>
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-rose/95 ring-1 ring-white/20 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                <svg className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                  <path d="M4 10h12m-6-6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
            </a>

            <a
              href="#como-funciona"
              className="hero-cta opacity-0 group inline-flex h-11 w-full items-center justify-center gap-2 rounded-full border-[1.5px] border-burgundy/10 bg-white/60 px-5 text-[0.9rem] md:text-[0.9375rem] font-semibold text-burgundy transition-colors duration-200 hover:border-burgundy/25 hover:bg-white active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-rose sm:w-auto"
            >
              <span className="whitespace-nowrap">Ver recorrido operativo</span>
              <svg className="h-3.5 w-3.5 shrink-0 text-burgundy/50 transition-transform duration-300 group-hover:translate-x-1" viewBox="0 0 20 20" fill="none" aria-hidden="true">
                <path d="M6 4l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </a>
          </div>

        </div>

        {/* Columna derecha — mockups */}
        <div className="relative flex h-[340px] sm:h-[400px] md:h-[400px] lg:h-[600px] w-full max-w-[500px] items-center justify-center mx-auto lg:mx-0 mt-2 sm:mt-4 md:mt-6 lg:mt-0 lg:ml-auto md:scale-[0.7] md:origin-center">
          {/* Flores decorativas detrás de los mockups */}
          <Image
            src={floralLeft}
            alt=""
            priority
            className="hero-floral-left pointer-events-none absolute -left-[5%] sm:-left-[10%] md:-left-[30%] lg:-left-[55%] -top-[5%] sm:-top-[8%] md:-top-[12%] lg:-top-[15%] z-[2] opacity-0 -rotate-[8deg] w-[280px] sm:w-[350px] md:w-[500px] lg:w-[1600px]"
          />
          <Image
            src={floralRight}
            alt=""
            priority
            className="hero-floral-right pointer-events-none absolute -right-[5%] sm:-right-[10%] md:-right-[35%] lg:-right-[65%] -bottom-[5%] sm:-bottom-[8%] md:-bottom-[12%] lg:-bottom-[16%] z-[2] opacity-0 rotate-[12deg] w-[220px] sm:w-[280px] md:w-[380px] lg:w-[1100px]"
          />

          {/* Círculo rosa de fondo */}
          <div
            className="hero-pink-circle absolute opacity-0 w-[300px] h-[300px] sm:w-[380px] sm:h-[380px] md:w-[420px] md:h-[420px] lg:w-[720px] lg:h-[720px]"
            style={{
              borderRadius: '50%',
              backgroundColor: '#F9D9E3',
              zIndex: 1,
            }}
          />

          {/* Teléfono principal */}
          <div className="hero-mockup-phone opacity-0 absolute z-10 -translate-x-10 sm:-translate-x-14 md:-translate-x-16 lg:-translate-x-32 translate-y-2 sm:translate-y-3 md:translate-y-4 lg:translate-y-8 -rotate-[2deg] scale-[0.65] sm:scale-[0.7] md:scale-[0.75] lg:scale-100">
            <PhoneMockup />
          </div>

          {/* Teléfono secundario (Cuenta) */}
          <div className="hero-mockup-ticket hidden sm:block opacity-0 absolute z-10 translate-x-14 sm:translate-x-20 md:translate-x-24 lg:translate-x-40 -translate-y-4 sm:-translate-y-6 md:-translate-y-6 lg:-translate-y-12 rotate-[3deg] scale-[0.65] sm:scale-[0.7] md:scale-[0.75] lg:scale-100">
            <TicketMockup />
          </div>

          {/* Toast Superior: Orden enviada */}
          <div className="hero-toast opacity-0 absolute top-[8%] sm:top-[2%] md:top-[5%] lg:-top-[18%] right-2 sm:right-0 md:right-0 lg:-right-24 z-20 hidden sm:flex items-center gap-3 md:gap-3 rounded-2xl bg-white px-4 md:px-4 lg:px-5 py-3 md:py-3 lg:py-4 shadow-xl ring-1 ring-black/5">
            <div className="flex h-10 w-10 md:h-10 lg:h-12 md:w-10 lg:w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 p-2 md:p-2 lg:p-2.5">
              <Image src={iconCuchilloTenedor} alt="" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-burgundy text-xs md:text-xs lg:text-sm">Orden enviada</p>
              <p className="text-[0.7rem] md:text-[0.7rem] lg:text-xs font-medium text-burgundy/50">Mesa 12 &middot; 14:32</p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.6rem] md:text-[0.6rem] lg:text-[0.65rem] font-bold text-sage-deep">
                <span className="h-1.5 w-1.5 rounded-full bg-sage-deep" />
                En preparación
              </p>
            </div>
          </div>

          {/* Toast Inferior: Pago registrado */}
          <div className="hero-toast opacity-0 absolute -bottom-[2%] sm:-bottom-[5%] md:-bottom-[5%] lg:-bottom-[12%] -left-2 sm:-left-4 md:-left-4 lg:-left-8 z-20 hidden sm:flex items-center gap-3 md:gap-3 rounded-2xl bg-white px-4 md:px-4 lg:px-5 py-3 md:py-3 lg:py-4 shadow-xl ring-1 ring-black/5">
            <div className="flex h-10 w-10 md:h-10 lg:h-12 md:w-10 lg:w-12 shrink-0 items-center justify-center rounded-full bg-rose-100 p-2 md:p-2 lg:p-2.5">
              <Image src={iconRecibo} alt="" className="h-full w-full object-contain" />
            </div>
            <div>
              <p className="font-bold text-burgundy text-xs md:text-xs lg:text-sm">Pago registrado</p>
              <p className="text-[0.7rem] md:text-[0.7rem] lg:text-xs font-medium text-burgundy/50">Mesa 12 &middot; 14:45</p>
              <p className="mt-1 flex items-center gap-1.5 text-[0.6rem] md:text-[0.6rem] lg:text-[0.65rem] font-bold text-sage-deep">
                <span className="h-1.5 w-1.5 rounded-full bg-sage-deep" />
                Completado
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
