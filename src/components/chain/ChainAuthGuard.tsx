"use client";

import { useEffect, useState } from "react";
import { Hash } from "lucide-react";
import { useShellChrome } from "@/components/dashboard/ShellChromeContext";

export default function ChainAuthGuard({ tenantId, onAuthenticated }: { tenantId: string | undefined; onAuthenticated: (tenantId: string) => void }) {
  const { setHideDashboardChrome } = useShellChrome();
  const [localTenantId, setLocalTenantId] = useState(tenantId || "");

  useEffect(() => {
    setHideDashboardChrome(true);
    return () => setHideDashboardChrome(false);
  }, [setHideDashboardChrome]);

  useEffect(() => {
    if (tenantId) {
      localStorage.setItem("bq_current_tenant", tenantId);
      setLocalTenantId(tenantId);
      onAuthenticated(tenantId);
      return;
    }

    const stored = localStorage.getItem("bq_current_tenant");
    if (stored) {
      setLocalTenantId(stored);
      onAuthenticated(stored);
    }
  }, [tenantId, onAuthenticated]);

  if (!localTenantId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg-solid px-4 py-8 font-sans text-text-primary sm:px-6">
        <div className="relative w-full max-w-[390px] overflow-hidden rounded-2xl border border-border-main bg-bg-card p-6 shadow-2xl sm:p-8">
          <div className="relative z-10 mb-7 text-center sm:mb-8">
            <h1 className="mb-2 font-serif text-[24px] font-bold leading-none tracking-tight text-text-primary sm:text-[26px]">
              Plataforma de <em className="not-italic text-gold">Cadena.</em>
            </h1>
            <p className="text-[12px] leading-5 font-light text-text-dim">
              Inquilino no identificado. Abre el acceso desde el enlace de Bouquet SaaS.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
