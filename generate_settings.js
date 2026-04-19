const fs = require('fs');

const code = `
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  KeyRound,
  MapPin,
  RefreshCw,
  ShieldCheck,
  SlidersHorizontal,
  Store,
  Users,
} from "lucide-react";
import { getZoneSettings, rotateZonePin } from "@/actions/chain";
import type { ZoneSettingsData } from "@/actions/chain";
import ZoneAuthGuard from "./ZoneAuthGuard";

function shortId(id: string) {
  return id.length > 10 ? \\\`\\\${id.slice(0, 6)}…\\\${id.slice(-4)}\\\` : id;
}

export default function ZoneSettingsPanel({ initialZoneId }: { initialZoneId?: string }) {
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [data, setData] = useState<ZoneSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const load = useCallback(async (zid: string) => {
    try {
      setLoading(true);
      const res = await getZoneSettings(zid);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!zoneId) return;
    load(zoneId);
    const iv = setInterval(() => load(zoneId), 60000);
    return () => clearInterval(iv);
  }, [zoneId, load]);

  const status = useMemo(() => {
    if (!data) return null;
    const { restaurants, staffActive, staffTotal } = data.stats;
    const ok = restaurants > 0 && staffActive > 0;
    return { ok, staffActive, staffTotal };
  }, [data]);

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setMsg("Copiado al portapapeles.");
      setTimeout(() => setMsg(null), 2000);
    } catch {
      setErr("No se pudo copiar.");
      setTimeout(() => setErr(null), 2000);
    }
  };

  const rotate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId) return;
    setErr(null);
    setMsg(null);

    const actorStaffId = sessionStorage.getItem(\\\`bq_auth_z_\\\${zoneId}\\\`) ?? "";
    if (!actorStaffId) {
      setErr("Sesión no encontrada. Reingresa con tu PIN.");
      return;
    }

    setSaving(true);
    const res = await rotateZonePin({ zoneId, actorStaffId, newPin: pin });
    setSaving(false);
    if (res.success) {
      setPin("");
      setMsg("PIN actualizado con éxito.");
      setTimeout(() => setMsg(null), 2000);
    } else {
      setErr(res.error ?? "No se pudo rotar el PIN.");
    }
  };

  if (!zoneId) {
    return <ZoneAuthGuard zoneId={initialZoneId} onAuthenticated={(zid) => setZoneId(zid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-6 bg-[#0a0a0a] px-4 text-neutral-400">
        <div className="relative flex size-16 items-center justify-center rounded-full bg-white/[0.02] border border-white/5 shadow-inner">
          <SlidersHorizontal className="size-6 text-gold/50 animate-pulse" />
        </div>
        <p className="text-[11px] uppercase tracking-[0.22em] text-neutral-500">Cargando configuración…</p>
      </div>
    );
  }

  if (!data || !status) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a0a0a] p-8 text-center text-[13px] text-red-500/80">
        <p>Esta zona no existe o fue eliminada.</p>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0a0a0a] font-sans text-neutral-200">
      {/* Premium Background Effects */}
      <div className="pointer-events-none absolute inset-0 transition-opacity duration-1000 ease-out opacity-100">
        <div className="absolute -top-[20%] -left-[10%] h-[70vh] w-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.15),transparent_60%)] blur-3xl" />
        <div className="absolute top-[60%] -right-[10%] h-[60vh] w-[50vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(68,114,160,0.08),transparent_60%)] blur-3xl opacity-50" />
        <div 
          className="absolute inset-0 mix-blend-overlay opacity-[0.03]" 
          style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=\\'0 0 200 200\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cfilter id=\\'noiseFilter\\'%3E%3CfeTurbulence type=\\'fractalNoise\\' baseFrequency=\\'0.65\\' numOctaves=\\'3\\' stitchTiles=\\'stitch\\'/%3E%3C/filter%3E%3Crect width=\\'100%25\\' height=\\'100%25\\' filter=\\'url(%23noiseFilter)\\'/%3E%3C/svg%3E")' }} 
        />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:64px_64px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-20" />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 md:px-8 pt-12 md:pt-20 pb-24">
        {/* Header / Staggered entry 1 */}
        <header className="mb-14 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between animate-in fade-in slide-in-from-bottom-[20px] duration-700 ease-out" style={{ animationFillMode: "both", animationDelay: "150ms" }}>
          <div className="max-w-2xl space-y-5">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/zona"
                className="group flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3.5 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-400 transition-all hover:bg-white/[0.08] hover:text-gold"
              >
                <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1" />
                Panel de Zona
              </Link>
              <div className="flex h-1 w-1 rounded-full bg-white/20" />
              <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-neutral-300">
                <MapPin className="size-3" />
                {data.zone.name}
              </span>
              <div className="flex h-1 w-1 rounded-full bg-white/20" />
              <span className={\\\`flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-[0.18em] \\\${status.ok ? "text-emerald-400/90" : "text-gold/90"}\\\`}>
                <ShieldCheck className="size-3" />
                {status.ok ? "Operativa" : "Revisar"}
              </span>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold/60 mb-3">Settings · Perfil</p>
              <h1 className="font-serif text-4xl md:text-5xl lg:text-[3.5rem] font-medium leading-[1.05] tracking-tight text-white">
                Configuración <span className="italic text-white/50">de Zona</span>
              </h1>
              <p className="mt-5 max-w-xl text-[14px] leading-relaxed text-neutral-400 font-light">
                Identidad, salud operativa y administración de credenciales exclusivas. Operaciones protegidas bajo el escudo de tu sesión actual.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => load(zoneId)}
            disabled={loading}
            className="group inline-flex items-center justify-center gap-2 self-start rounded-full border border-white/10 bg-white/[0.03] px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-300 transition-all hover:border-gold/30 hover:text-gold disabled:opacity-50"
          >
            <RefreshCw className={\\\`size-3.5 transition-transform \\\${loading ? "animate-spin" : "group-hover:rotate-180"}\\\`} />
            {loading ? "Sincronizando..." : "Refrescar datos"}
          </button>
        </header>

        {/* Grid Stats / Staggered entry 2 */}
        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          
          {/* Branch Card */}
          <div 
            className="rounded-3xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-[20px] duration-700 ease-out" 
            style={{ animationFillMode: "both", animationDelay: "300ms" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 shadow-inner">
                <Store className="size-5 text-gold/70" />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Cadena Respaldo</p>
            </div>
            <p className="font-serif text-2xl text-white mb-6">{data.zone.chainName}</p>
            
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-4">
              <div className="min-w-0 pr-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Chain ID</p>
                <p className="truncate font-mono text-[11px] text-neutral-300">{data.zone.chainId}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(data.zone.chainId)}
                className="flex items-center justify-center rounded-xl bg-white/[0.05] p-2.5 text-neutral-400 transition-colors hover:bg-white/[0.1] hover:text-gold shrink-0 border border-white/5"
                title="Copiar ID"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Zone ID Card */}
          <div 
            className="rounded-3xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-[20px] duration-700 ease-out" 
            style={{ animationFillMode: "both", animationDelay: "400ms" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 shadow-inner">
                <MapPin className="size-5 text-gold/70" />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Identificador</p>
            </div>
            <p className="font-serif text-2xl text-white mb-6">{data.zone.name}</p>
            
            <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-4">
              <div className="min-w-0 pr-3">
                <p className="font-mono text-[9px] uppercase tracking-[0.15em] text-neutral-500 mb-1.5">Zone ID</p>
                <p className="truncate font-mono text-[11px] text-neutral-300">{shortId(data.zone.id)}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(data.zone.id)}
                className="flex items-center justify-center rounded-xl bg-white/[0.05] p-2.5 text-neutral-400 transition-colors hover:bg-white/[0.1] hover:text-gold shrink-0 border border-white/5"
                title="Copiar ID"
              >
                <Copy className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Health Card */}
          <div 
            className="rounded-3xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-[20px] duration-700 ease-out" 
            style={{ animationFillMode: "both", animationDelay: "500ms" }}
          >
             <div className="flex items-center gap-3 mb-6">
              <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 shadow-inner">
                <ShieldCheck className="size-5 text-gold/70" />
              </div>
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">Estado Operativo</p>
            </div>

            <div className="flex flex-col gap-3 h-[calc(100%-4rem)] justify-end">
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">Vol. Sucursales</div>
                <span className="font-mono text-[13px] text-white">{data.stats.restaurants}</span>
              </div>
              <div className="flex items-center justify-between rounded-2xl border border-white/5 bg-black/40 p-4">
                <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-neutral-500">Tráfico Personal</div>
                <span className="font-mono text-[13px] text-white">
                  {data.stats.staffActive} <span className="text-neutral-600">/ {data.stats.staffTotal}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Security / Pin Rotation / Staggered entry 3 */}
        <section 
          className="rounded-3xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.02),rgba(255,255,255,0))] p-6 md:p-8 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] animate-in fade-in slide-in-from-bottom-[20px] duration-700 ease-out relative overflow-hidden" 
          style={{ animationFillMode: "both", animationDelay: "600ms" }}
        >
          <div className="absolute right-0 top-0 h-full w-[40%] bg-[radial-gradient(ellipse_at_top_right,rgba(201,160,84,0.06),transparent_70%)] pointer-events-none" />
          
          <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
            <div className="max-w-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex size-10 items-center justify-center rounded-full bg-white/[0.05] border border-white/10 shadow-inner">
                  <KeyRound className="size-5 text-gold/70" />
                </div>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-gold/60">Credenciales</p>
              </div>
              <h2 className="font-serif text-2xl text-white mb-2">Renovación de Pases</h2>
              <p className="text-[13px] leading-relaxed text-neutral-400 font-light mb-6">
                Rota la acreditación PIN del supervisor en caso de transiciones de turno, altas de nuevo equipo o incidentes de política interna.
              </p>

              {(msg || err) && (
                <div className={\\\`mb-6 rounded-xl border p-4 backdrop-blur-md \\\${msg ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-300' : 'border-red-500/20 bg-red-500/10 text-red-300'}\\\`}>
                  <p className="text-[12px] font-medium">{msg || err}</p>
                </div>
              )}
            </div>

            <form onSubmit={rotate} className="w-full md:w-auto relative z-10 flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative w-full sm:w-[220px]">
                  <input
                    type="password"
                    inputMode="numeric"
                    autoComplete="new-password"
                    value={pin}
                    onChange={(e) => {
                      setPin(e.target.value);
                      setErr(null);
                      setMsg(null);
                    }}
                    minLength={4}
                    required
                    placeholder="Nuevo PIN..."
                    className="w-full rounded-2xl border border-white/10 bg-black/50 px-5 py-4 font-mono text-[14px] tracking-[0.2em] text-white outline-none placeholder:text-neutral-600 placeholder:tracking-normal focus:border-gold/30 focus:bg-white/[0.02] focus:ring-1 focus:ring-gold/30 transition-all shadow-inner"
                  />
                </div>
                <button
                  type="submit"
                  disabled={saving || !pin.trim()}
                  className="rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-[12px] font-medium uppercase tracking-[0.1em] text-white transition-all hover:bg-white/10 hover:text-gold disabled:opacity-40 disabled:hover:bg-white/5 disabled:hover:text-white shrink-0 shadow-[0_0_20px_rgba(255,255,255,0.02)]"
                >
                  {saving ? "Procesando..." : "Sellar Acceso"}
                </button>
              </div>
            </form>
          </div>
        </section>

      </div>
    </div>
  );
}
\`;

// Replacing literal string artifacts if any
const finalCode = code.replace(/\\\\\`/g, '\`').replace(/\\\\\$/g, '$');
fs.writeFileSync('src/components/chain/ZoneSettingsPanel.tsx', finalCode);
console.log("Written!");
