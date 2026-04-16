"use client";

import { useState, useEffect } from "react";
import { verifyChainPin } from "@/actions/chain";
import { useRouter } from "next/navigation";

export default function ChainAuthGuard({ tenantId, onAuthenticated }: { tenantId: string | undefined; onAuthenticated: (tenantId: string) => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [localTenantId, setLocalTenantId] = useState(tenantId || "");

  useEffect(() => {
    // Si llegó un tenantId por url, guardémoslo en localStorage por si luego recarga
    if (tenantId) {
      localStorage.setItem("bq_current_tenant", tenantId);
      setLocalTenantId(tenantId);
    } else {
      const stored = localStorage.getItem("bq_current_tenant");
      if (stored) setLocalTenantId(stored);
    }
  }, [tenantId]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!localTenantId) {
      setError("Falta ID del Inquilino (Tenant).");
      return;
    }

    setLoading(true);
    setError("");
    const isValid = await verifyChainPin(localTenantId, pin);
    setLoading(false);

    if (isValid) {
      // Éxito. Guardar en memoria si es necesario y notificar al padre
      sessionStorage.setItem(`bq_auth_${localTenantId}`, "true");
      onAuthenticated(localTenantId);
    } else {
      setError("PIN Inválido o usuario no encontrado.");
    }
  };

  useEffect(() => {
    // Auto-login si ya existe la sesión en la pestaña actual
    if (localTenantId) {
      const isAuth = sessionStorage.getItem(`bq_auth_${localTenantId}`);
      if (isAuth === "true") {
        onAuthenticated(localTenantId);
      }
    }
  }, [localTenantId, onAuthenticated]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-bg-solid text-text-primary px-4 font-sans">
      <div className="w-full max-w-[360px] p-8 border border-border-main bg-bg-card rounded-xl shadow-2xl relative overflow-hidden">
        {/* Glow effect */}
        <div className="absolute -top-[100px] left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-gold/20 blur-[60px] pointer-events-none rounded-full" />
        
        <div className="text-center mb-8 relative z-10">
          <div className="text-[10px] tracking-[0.2em] uppercase text-gold mb-3 flex items-center justify-center gap-2 font-medium">
             <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 stroke-gold fill-none stroke-[2px] rounded-none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
             </svg>
            Operaciones B2B
          </div>
          <h1 className="font-serif text-[24px] font-bold tracking-tight text-text-primary leading-none mb-1">
            Plataforma de <em className="not-italic text-gold">Cadena.</em>
          </h1>
          <p className="text-[12px] text-text-dim font-light">
            Introduce tu PIN Maestro para administrar tus sucursales.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5 relative z-10">
          {!localTenantId ? (
            <div className="text-[12px] text-dash-red bg-dash-red-bg border border-[#3e1818] p-3 rounded text-center">
              ⚠️ Inquilino no identificado. Por favor, usa el enlace proporcionado por Bouquet SaaS.
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim block">Tenand ID <span className="opacity-50">(Auto)</span></label>
              <input 
                type="text" 
                disabled
                value={localTenantId}
                className="w-full bg-bg-solid border border-border-main rounded p-3 text-[12px] text-text-dim placeholder:text-text-faint outline-none font-mono h-11"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className="text-[10px] font-medium tracking-[0.16em] uppercase text-text-dim block">PIN Maestro</label>
            </div>
            <input 
              type="password" 
              required 
              disabled={!localTenantId || loading}
              placeholder="••••••" 
              autoFocus
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError("");
              }}
              className="w-full bg-bg-solid border border-border-bright rounded p-3 text-[16px] tracking-[0.3em] font-mono text-center text-text-primary placeholder:text-text-faint outline-none focus:border-gold focus:ring-1 focus:ring-gold/30 transition-all h-11"
            />
          </div>

          {error && (
             <div className="text-[11px] text-dash-red border border-[#3e1818] px-2 py-1 bg-dash-red-bg rounded text-center">
               {error}
             </div>
          )}

          <button 
            type="submit" 
            disabled={!localTenantId || loading || !pin} 
            className="w-full bg-gold border border-gold text-bg-solid rounded py-3 mt-2 text-[12px] font-bold hover:opacity-90 disabled:opacity-50 transition-opacity cursor-pointer shadow-[0_4px_12px_rgba(201,160,84,0.15)] flex justify-center items-center gap-2"
          >
            {loading && <span className="w-3.5 h-3.5 rounded-full border-2 border-bg-solid border-t-transparent animate-spin"/>}
            {loading ? "Verificando..." : "Acceder al Consola"}
          </button>
        </form>
      </div>
      <div className="mt-8 text-[10px] text-text-faint tracking-[0.06em]">
        © {new Date().getFullYear()} Bouquet Platform. Acceso restringido.
      </div>
    </div>
  );
}
