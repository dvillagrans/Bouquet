"use client";

import { useState, useEffect } from "react";
import { MapPin } from "lucide-react";
import { useShellChrome } from "@/components/dashboard/ShellChromeContext";

interface GuardProps {
  zoneId?: string;
  onAuthenticated: (zoneId: string) => void;
}

export default function ZoneAuthGuard({ zoneId, onAuthenticated }: GuardProps) {
  const { setHideDashboardChrome } = useShellChrome();
  const [zid, setZid] = useState(zoneId || "");

  useEffect(() => {
    setHideDashboardChrome(true);
    return () => setHideDashboardChrome(false);
  }, [setHideDashboardChrome]);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedZid = localStorage.getItem("bq_current_zone");
      if (savedZid) {
        setZid(savedZid);
        onAuthenticated(savedZid);
      } else if (zoneId) {
        localStorage.setItem("bq_current_zone", zoneId);
        setZid(zoneId);
        onAuthenticated(zoneId);
      }
    }
  }, [zoneId, onAuthenticated]);

  if (!zid) {
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
          <div className="bg-bg-card border border-border-main rounded-2xl shadow-xl overflow-hidden backdrop-blur-xl p-6 md:p-8 text-center">
            <p className="text-[12px] text-text-dim">ID de zona no proporcionado.</p>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
