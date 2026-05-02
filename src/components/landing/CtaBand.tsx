"use client";

import { useState } from "react";
import Link from "next/link";

export const CtaBand = () => {
  const [formData, setFormData] = useState({
    restaurantName: "",
    contactName: "",
    email: "",
    phone: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulación de envío — en producción conectar con Server Action o webhook
    await new Promise((resolve) => setTimeout(resolve, 1500));

    setIsSubmitting(false);
    setSubmitted(true);
  };

  return (
    <section
      id="contacto"
      className="relative flex min-h-[80dvh] flex-col justify-center border-t border-burgundy/10 bg-rose-cream py-20 lg:py-28 overflow-hidden"
    >
      {/* Bookend */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-burgundy/8 via-burgundy/0 to-transparent"
      />

      {/* Decoración floral */}
      <svg viewBox="0 0 400 100" className="absolute -right-20 top-10 h-24 w-96 opacity-20" aria-hidden="true">
        <path d="M0 50 Q100 10 200 50 Q300 90 400 50" stroke="#C75B7A" strokeWidth="1" fill="none" />
        <circle cx="50" cy="35" r="6" fill="#E8A5B0" />
        <circle cx="150" cy="55" r="5" fill="#D68C9F" />
        <circle cx="250" cy="40" r="7" fill="#C75B7A" />
        <circle cx="350" cy="60" r="5" fill="#E8A5B0" />
      </svg>

      <div className="mx-auto grid max-w-[1200px] gap-12 px-6 lg:grid-cols-[1fr_auto] lg:items-start lg:px-8">
        <div className="max-w-2xl">
          <p className="text-[0.68rem] font-bold uppercase tracking-[0.32em] text-burgundy/38">
            Siguiente paso
          </p>
          <h2 className="mt-4 text-balance font-sans text-4xl font-black tracking-[-0.05em] text-burgundy sm:text-5xl md:text-6xl lg:text-[4.5rem] lg:leading-[0.95]">
            Haz que el turno florezca.
          </h2>

          <p className="mt-7 max-w-xl text-balance text-lg leading-[1.8] text-burgundy/60 font-medium">
            Si querés que Bouquet se adapte a tu servicio, dejanos tus datos. Te
            contactamos en menos de 2 horas para mostrarte el flujo completo.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "No tenés que cambiar de equipo",
              "No necesitás migración compleja",
              "Tu operación sigue corriendo",
            ].map((item) => (
              <p
                key={item}
                className="inline-flex items-center gap-2.5 rounded-full border border-burgundy/10 bg-white px-4 py-2 text-[0.75rem] font-semibold text-burgundy/70 shadow-[0_1px_2px_rgba(74,26,44,0.04)]"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-sage-deep shrink-0" aria-hidden="true" />
                {item}
              </p>
            ))}
          </div>

          {/* Formulario */}
          {!submitted ? (
            <form suppressHydrationWarning onSubmit={handleSubmit} className="mt-10 space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="restaurantName"
                    className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.25em] text-burgundy/50"
                  >
                    Nombre del restaurante
                  </label>
                  <input
                    id="restaurantName"
                    type="text"
                    required
                    value={formData.restaurantName}
                    onChange={(e) =>
                      setFormData({ ...formData, restaurantName: e.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-burgundy/10 bg-white px-4 text-[0.9rem] text-burgundy placeholder:text-burgundy/30 transition-colors focus:border-rose/50 focus:outline-none focus:ring-2 focus:ring-rose/20"
                    placeholder="Ej: La Casa de Toño"
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label
                    htmlFor="contactName"
                    className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.25em] text-burgundy/50"
                  >
                    Tu nombre
                  </label>
                  <input
                    id="contactName"
                    type="text"
                    required
                    value={formData.contactName}
                    onChange={(e) =>
                      setFormData({ ...formData, contactName: e.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-burgundy/10 bg-white px-4 text-[0.9rem] text-burgundy placeholder:text-burgundy/30 transition-colors focus:border-rose/50 focus:outline-none focus:ring-2 focus:ring-rose/20"
                    placeholder="Ej: María González"
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="email"
                    className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.25em] text-burgundy/50"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-burgundy/10 bg-white px-4 text-[0.9rem] text-burgundy placeholder:text-burgundy/30 transition-colors focus:border-rose/50 focus:outline-none focus:ring-2 focus:ring-rose/20"
                    placeholder="maria@restaurante.com"
                    suppressHydrationWarning
                  />
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="mb-1.5 block text-[0.68rem] font-bold uppercase tracking-[0.25em] text-burgundy/50"
                  >
                    Teléfono
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    className="h-12 w-full rounded-xl border border-burgundy/10 bg-white px-4 text-[0.9rem] text-burgundy placeholder:text-burgundy/30 transition-colors focus:border-rose/50 focus:outline-none focus:ring-2 focus:ring-rose/20"
                    placeholder="55 1234 5678"
                    suppressHydrationWarning
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="group inline-flex h-14 items-center justify-center gap-3 rounded-full bg-burgundy px-10 text-[1rem] font-semibold text-white shadow-[0_20px_40px_-20px_rgba(74,26,44,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-burgundy-light active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                suppressHydrationWarning
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="h-5 w-5 animate-spin"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      />
                    </svg>
                    Enviando...
                  </>
                ) : (
                  <>
                    Quiero mi demo gratis
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-rose/95 ring-1 ring-white/20 transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-0.5 group-hover:scale-105">
                      <svg
                        className="h-4 w-4"
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
                    </span>
                  </>
                )}
              </button>
              <p className="text-[0.72rem] font-medium text-burgundy/40">
                Sin compromiso. Sin tarjeta de crédito. Te contactamos en menos
                de 2 horas.
              </p>
            </form>
          ) : (
            <div className="mt-10 rounded-2xl border border-sage/20 bg-sage/5 p-8 text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-sage/10">
                <svg
                  className="h-8 w-8 text-sage-deep"
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
              </div>
              <h3 className="font-serif text-[1.5rem] font-semibold italic text-burgundy">
                ¡Mensaje enviado!
              </h3>
              <p className="mt-2 text-[0.9rem] text-burgundy/60">
                Te contactaremos en menos de 2 horas para coordinar tu demo.
              </p>
            </div>
          )}
        </div>

        {/* Summary card */}
        <div className="relative rounded-[2rem] p-1.5 ring-1 ring-burgundy/10 bg-gradient-to-b from-white/80 to-rose-cream/50 shadow-[0_30px_60px_-34px_rgba(74,26,44,0.3),inset_0_1px_0_rgba(255,255,255,0.9)]">
          <div className="rounded-[calc(2rem-0.375rem)] bg-white/65 p-6 ring-1 ring-burgundy/[0.05]">
            <p className="mb-5 flex items-center gap-3 text-[0.6rem] font-bold uppercase tracking-[0.32em] text-burgundy/40">
              <span className="h-[2px] w-5 bg-rose/70" aria-hidden="true" />
              Plan práctico
            </p>
            <div className="grid gap-3.5">
              {[
                ["Configuración", "1 día"],
                ["Dispositivos", "Cualquiera"],
                ["Integración", "Nativa"],
                ["Soporte", "Humano"],
              ].map(([label, value]) => (
                <div
                  key={label}
                  className="flex items-baseline justify-between gap-8 border-b border-burgundy/8 pb-3 last:border-b-0 last:pb-0"
                >
                  <span className="text-[0.62rem] font-bold uppercase tracking-[0.28em] text-burgundy/42">
                    {label}
                  </span>
                  <span className="font-serif text-[1.3rem] italic text-burgundy">
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
