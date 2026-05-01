"use client";

import { useState, useEffect } from "react";
import { Wrench, Shield, Database, Bell, Check, Loader2 } from "lucide-react";

export default function AdminSystemPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const handleSave = () => {
    setSaving(true);
    setTimeout(() => setSaving(false), 1000);
  };

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-bg-solid text-base text-text-primary antialiased selection:bg-gold/30 lg:text-[14px]">
      <div
        className="pointer-events-none absolute inset-0 opacity-40 mix-blend-color-dodge"
        style={{
          background:
            "radial-gradient(circle at 80% 0%, rgba(183,146,93,0.12) 0%, transparent 40%), radial-gradient(circle at 10% 90%, rgba(183,146,93,0.06) 0%, transparent 40%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-1000"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
        aria-hidden
      />

      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/5 bg-bg-solid/80 px-6 backdrop-blur-2xl sm:px-10">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[12px] font-medium text-text-dim">
            <span className="text-white">Bouquet OPS</span>
            <span className="text-white/20">/</span>
            <span className="tracking-wide">SISTEMA</span>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSave}
          disabled={saving || loading}
          className="inline-flex h-9 items-center justify-center rounded-xl bg-gold text-bg-solid transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-50 px-5 gap-2 font-medium"
        >
          {saving ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Check className="size-4" />
          )}
          <span className="text-[13px]">Guardar</span>
        </button>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-6 pb-20 pt-10 sm:px-10 sm:pt-14">
        <header className="mb-12">
          <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
            <span className="h-px w-6 bg-gold" /> Parámetros Globales
          </p>
          <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl text-balance">
            Ajustes del Sistema.
          </h1>
          <p className="mt-5 text-[15px] leading-relaxed text-text-dim max-w-xl">
            Configuración global de la infraestructura SaaS. Estos parámetros afectan a todos los inquilinos y cadenas operando bajo Bouquet.
          </p>
        </header>

        {loading ? (
          <div className="space-y-6">
            <div className="h-[240px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
            <div className="h-[240px] animate-pulse rounded-2xl border border-white/5 bg-white/[0.02]" />
          </div>
        ) : (
          <div className="space-y-8">
            <section className="rounded-2xl border border-white/5 bg-[#1A0F14] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="border-b border-white/5 px-6 py-5 sm:px-8 flex items-center gap-3">
                <Shield className="size-5 text-gold" />
                <h2 className="text-base font-medium tracking-tight text-white">Seguridad & Cumplimiento</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-text-dim">Tiempo de Sesión (Min)</label>
                    <input 
                      type="number" 
                      defaultValue={120}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 lg:text-[14px]" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-text-dim">Forzar 2FA Admin</label>
                    <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 appearance-none lg:text-[14px]">
                      <option value="yes">Requerido</option>
                      <option value="no">Opcional</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[12px] font-bold uppercase tracking-widest text-text-dim">Mapeo de Dominios (CORS)</label>
                  <input 
                    type="text" 
                    defaultValue="*.bouquet.app, dashboard.bouquet.app"
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 lg:text-[14px]" 
                  />
                  <p className="text-[11px] text-text-dim">Direcciones autorizadas para solicitudes API.</p>
                </div>
              </div>
            </section>

            <section className="rounded-2xl border border-white/5 bg-[#1A0F14] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
              <div className="border-b border-white/5 px-6 py-5 sm:px-8 flex items-center gap-3">
                <Database className="size-5 text-emerald-400" />
                <h2 className="text-base font-medium tracking-tight text-white">Infraestructura</h2>
              </div>
              <div className="p-6 sm:p-8 space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-text-dim">Política de Retención (Logs)</label>
                    <select className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 appearance-none lg:text-[14px]">
                      <option value="30">30 Días</option>
                      <option value="90">90 Días</option>
                      <option value="365">1 Año</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[12px] font-bold uppercase tracking-widest text-text-dim">Caché Redis (TTL)</label>
                    <input 
                      type="number" 
                      defaultValue={3600}
                      className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-base text-white outline-none transition-colors focus:border-gold/50 focus:bg-white/10 tabular-nums lg:text-[14px]" 
                    />
                  </div>
                </div>
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
