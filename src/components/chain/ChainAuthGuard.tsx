"use client";

import { useEffect, useState } from "react";
import { verifyChainPin } from "@/actions/chain";

export default function ChainAuthGuard({ tenantId, onAuthenticated }: { tenantId: string | undefined; onAuthenticated: (tenantId: string) => void }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [localTenantId, setLocalTenantId] = useState(tenantId || "");

  useEffect(() => {
    if (tenantId) {
      localStorage.setItem("bq_current_tenant", tenantId);
      setLocalTenantId(tenantId);
      return;
    }

    const stored = localStorage.getItem("bq_current_tenant");
    if (stored) setLocalTenantId(stored);
  }, [tenantId]);

  useEffect(() => {
    if (!localTenantId) return;

    const isAuth = sessionStorage.getItem(`bq_auth_${localTenantId}`);
    if (isAuth === "true") {
      onAuthenticated(localTenantId);
    }
  }, [localTenantId, onAuthenticated]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!localTenantId) {
      setError("Falta ID del inquilino.");
      return;
    }

    setLoading(true);
    setError("");

    const isValid = await verifyChainPin(localTenantId, pin);

    setLoading(false);

    if (isValid) {
      sessionStorage.setItem(`bq_auth_${localTenantId}`, "true");
      onAuthenticated(localTenantId);
      return;
    }

    setError("PIN inválido o usuario no encontrado.");
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg-solid px-4 py-8 font-sans text-text-primary sm:px-6">
      <div className="relative w-full max-w-[390px] overflow-hidden rounded-2xl border border-border-main bg-bg-card p-6 shadow-2xl sm:p-8">
        <div className="pointer-events-none absolute -top-[100px] left-1/2 h-[100px] w-[200px] -translate-x-1/2 rounded-full bg-gold/20 blur-[60px]" />

        <div className="relative z-10 mb-7 text-center sm:mb-8">
          <div className="mb-3 flex items-center justify-center gap-2 text-[10px] font-medium uppercase tracking-[0.2em] text-gold">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-[2px] stroke-gold rounded-none">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
            Operaciones B2B
          </div>
          <h1 className="mb-2 font-serif text-[24px] font-bold leading-none tracking-tight text-text-primary sm:text-[26px]">
            Plataforma de <em className="not-italic text-gold">Cadena.</em>
          </h1>
          <p className="text-[12px] leading-5 font-light text-text-dim">
            Introduce tu PIN maestro para administrar tus sucursales.
          </p>
        </div>

        <form onSubmit={handleLogin} className="relative z-10 space-y-4 sm:space-y-5">
          {!localTenantId ? (
            <div className="rounded-lg border border-[#3e1818] bg-dash-red-bg p-4 text-center text-[12px] text-dash-red">
              Inquilino no identificado. Abre el acceso desde el enlace de Bouquet SaaS.
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="block text-[10px] font-medium uppercase tracking-[0.16em] text-text-dim">
                Tenant ID <span className="opacity-50">(auto)</span>
              </label>
              <input
                type="text"
                disabled
                value={localTenantId}
                className="h-11 w-full rounded border border-border-main bg-bg-solid p-3 font-mono text-[12px] text-text-dim outline-none placeholder:text-text-faint"
              />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="block text-[10px] font-medium uppercase tracking-[0.16em] text-text-dim">
              PIN Maestro
            </label>
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
              className="h-12 w-full rounded border border-border-bright bg-bg-solid p-3 text-center font-mono text-[16px] tracking-[0.3em] text-text-primary outline-none transition-all placeholder:text-text-faint focus:border-gold focus:ring-1 focus:ring-gold/30"
            />
          </div>

          {error && (
            <div className="rounded border border-[#3e1818] bg-dash-red-bg px-3 py-2 text-center text-[11px] text-dash-red">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={!localTenantId || loading || !pin}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded border border-gold bg-gold py-3 text-[12px] font-bold text-bg-solid shadow-[0_4px_12px_rgba(201,160,84,0.15)] transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading && <span className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-bg-solid border-t-transparent" />}
            {loading ? "Verificando..." : "Acceder a la consola"}
          </button>

          <p className="text-center text-[10px] tracking-[0.06em] text-text-faint">
            La sesión queda guardada en esta pestaña.
          </p>
        </form>
      </div>

      <div className="mt-7 text-[10px] tracking-[0.06em] text-text-faint">
        © {new Date().getFullYear()} Bouquet Platform. Acceso restringido.
      </div>
    </div>
  );
}
