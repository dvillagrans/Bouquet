"use client";

import { useState, useEffect } from "react";
import { Lock, ArrowRight, ShieldCheck, MapPin } from "lucide-react";
import { verifyZonePin } from "@/actions/chain";

interface GuardProps {
  zoneId?: string;
  onAuthenticated: (zoneId: string) => void;
}

export default function ZoneAuthGuard({ zoneId, onAuthenticated }: GuardProps) {
  const [zid, setZid] = useState(zoneId || "");
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Attempt auto-login if saved session
    if (typeof window !== "undefined") {
      const savedZid = localStorage.getItem("bq_current_zone");
      const savedTkn = sessionStorage.getItem(`bq_auth_z_${savedZid}`);
      
      if (savedZid && savedTkn) {
         if (!zid || savedZid === zid) {
             onAuthenticated(savedZid);
         }
      } else if (savedZid && !zid) {
          setZid(savedZid);
      }
    }
  }, [zid, onAuthenticated]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zid || !pin) {
      setError("Se requiere ID de zona y PIN");
      return;
    }
    
    setLoading(true);
    setError("");

    try {
      const res = await verifyZonePin(zid, pin);
      if (res.success) {
        localStorage.setItem("bq_current_zone", zid);
        sessionStorage.setItem(`bq_auth_z_${zid}`, res.token!);
        onAuthenticated(zid);
      } else {
        setError(res.error || "Acesso denegado");
      }
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-solid flex flex-col items-center justify-center p-4 font-sans relative overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-gold/5 blur-[120px] rounded-full pointer-events-none" />

      <div className="w-full max-w-sm z-10">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-bg-card border border-border-main rounded-xl flex items-center justify-center shadow-sm mb-4">
            <MapPin className="w-5 h-5 text-gold" />
          </div>
          <h1 className="font-serif text-2xl font-bold tracking-tight text-text-primary text-center">
            Acceso Nivel 2
          </h1>
          <h2 className="text-xs text-text-muted mt-1 uppercase tracking-widest text-center flex items-center gap-2">
             Operaciones de Zona
          </h2>
        </div>

        <div className="bg-bg-card border border-border-main rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl">
           <form onSubmit={handleSubmit} className="p-6 md:p-8">
              {error && (
                 <div className="mb-6 p-3 bg-dash-red-bg/50 border border-dash-red-border text-dash-red text-[11px] rounded-md text-center">
                   {error}
                 </div>
              )}
             
              <div className="space-y-5">
                 <div className="space-y-1.5">
                   <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">
                     ID de Zona
                   </label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <input
                        autoFocus={!zid}
                         required
                         type="text" 
                         value={zid}
                         onChange={(e) => setZid(e.target.value)}
                         placeholder="Ej. zn_8f7a6"
                         className="w-full bg-bg-solid border border-border-main rounded-md py-2.5 pl-9 pr-3 text-text-primary focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all font-mono text-[13px] placeholder:text-text-faint placeholder:font-sans"
                      />
                   </div>
                 </div>

                 <div className="space-y-1.5">
                   <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim">
                     PIN de Supervisor
                   </label>
                   <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="w-3.5 h-3.5 text-text-muted" />
                      </div>
                      <input
                         autoFocus={!!zid}
                         required
                         type="password" 
                         pattern="[0-9]*"
                         inputMode="numeric"
                         value={pin}
                         onChange={(e) => setPin(e.target.value)}
                         placeholder="••••"
                         className="w-full bg-bg-solid border border-border-main rounded-md py-2.5 pl-9 pr-3 text-text-primary focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/30 transition-all font-mono text-[20px] tracking-[0.5em] placeholder:text-text-faint placeholder:font-sans placeholder:tracking-normal placeholder:text-[13px]"
                      />
                   </div>
                 </div>
              </div>

              <button
                type="submit"
                disabled={loading || !pin || !zid}
                className="mt-8 w-full group relative flex justify-center items-center gap-2 py-3 px-4 border border-transparent text-[12px] font-medium rounded-md text-bg-solid bg-gold hover:bg-gold-light focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gold/50 focus:ring-offset-bg-solid transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                 {loading ? (
                   <span className="w-3.5 h-3.5 border-2 border-bg-solid border-t-white/30 rounded-full animate-spin" />
                 ) : (
                   <>
                     Entrar al Dashboard
                     <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                   </>
                 )}
              </button>
           </form>

           <div className="border-t border-border-main p-4 bg-bg-solid/30 flex items-center justify-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-gold" />
              <span className="text-[10px] text-text-dim">Verificado por Plataforma Bouquet</span>
           </div>
        </div>
      </div>
    </div>
  );
}
