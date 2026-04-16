"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
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
  return id.length > 10 ? `${id.slice(0, 6)}…${id.slice(-4)}` : id;
}

export default function ZoneSettingsPanel({ initialZoneId }: { initialZoneId?: string }) {
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [data, setData] = useState<ZoneSettingsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [pin, setPin] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const reduceMotion = useReducedMotion();

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
      setMsg("Copiado.");
      setTimeout(() => setMsg(null), 1200);
    } catch {
      setErr("No se pudo copiar.");
      setTimeout(() => setErr(null), 1500);
    }
  };

  const rotate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!zoneId) return;
    setErr(null);
    setMsg(null);

    const actorStaffId = sessionStorage.getItem(`bq_auth_z_${zoneId}`) ?? "";
    if (!actorStaffId) {
      setErr("Sesión no encontrada. Reingresa con tu PIN.");
      return;
    }

    setSaving(true);
    const res = await rotateZonePin({ zoneId, actorStaffId, newPin: pin });
    setSaving(false);
    if (res.success) {
      setPin("");
      setMsg("PIN actualizado.");
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
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-bg-solid px-4 text-text-dim">
        <motion.div
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className="text-gold/35"
          aria-hidden
        >
          <SlidersHorizontal className="size-12" strokeWidth={1} />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[0.22em]">Cargando configuración…</p>
      </div>
    );
  }

  if (!data || !status) {
    return (
      <div className="min-h-screen bg-bg-solid p-8 text-center text-[13px] text-dash-red">
        Esta zona no existe o fue eliminada.
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-solid font-sans text-text-primary">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-0 top-0 h-[min(85vh,640px)] w-[min(120vw,900px)] rounded-full bg-[radial-gradient(ellipse_at_top_left,rgba(201,160,84,0.12),transparent_62%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[42vh] w-[60vw] rounded-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(68,114,160,0.07),transparent_58%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--color-border-mid) 1px, transparent 1px), linear-gradient(var(--color-border-mid) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-10 md:px-8 md:pt-14">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/zona"
                className="inline-flex items-center gap-2 rounded-full border border-border-main bg-bg-card/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted transition-colors hover:border-gold/30 hover:text-gold"
              >
                <ArrowLeft className="size-3" aria-hidden />
                Panel de zona
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-border-mid bg-bg-solid/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-text-dim">
                <MapPin className="size-3" aria-hidden />
                {data.zone.name}
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                  status.ok
                    ? "border-dash-green/25 bg-dash-green-bg/35 text-dash-green"
                    : "border-gold/25 bg-gold-faint/35 text-gold"
                }`}
              >
                <ShieldCheck className="size-3" aria-hidden />
                {status.ok ? "Operativa" : "Revisar"}
              </span>
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-faint">Settings · nivel 2</p>
              <h1 className="mt-2 font-serif text-[clamp(1.85rem,4.5vw,3rem)] font-semibold leading-[1.06] tracking-tight">
                Configuración de zona
              </h1>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-text-muted">
                Identidad, salud operativa y rotación del PIN del supervisor. Cambios sensibles quedan dentro del alcance
                de tu sesión zonal.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => load(zoneId)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border-bright bg-bg-card px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary transition-colors hover:border-gold/35 hover:text-gold disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
            {loading ? "Sincronizando" : "Refrescar"}
          </button>
        </motion.header>

        <div className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <div className="rounded-2xl border border-border-main bg-bg-card/45 p-6 backdrop-blur-sm">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Cadena</p>
            <p className="mt-2 font-serif text-lg text-text-primary">{data.zone.chainName}</p>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border-main bg-bg-solid/60 px-4 py-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">chainId</p>
                <p className="mt-1 truncate font-mono text-[12px] text-text-secondary">{data.zone.chainId}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(data.zone.chainId)}
                className="inline-flex items-center gap-2 rounded-lg border border-border-main bg-bg-card/40 px-3 py-2 text-[11px] font-semibold text-text-secondary hover:border-gold/35 hover:text-gold"
              >
                <Copy className="size-4" aria-hidden />
                Copiar
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border-main bg-bg-card/45 p-6 backdrop-blur-sm">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Zona</p>
            <p className="mt-2 font-serif text-lg text-text-primary">{data.zone.name}</p>
            <div className="mt-4 flex items-center justify-between rounded-xl border border-border-main bg-bg-solid/60 px-4 py-3">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">zoneId</p>
                <p className="mt-1 font-mono text-[12px] text-text-secondary">{shortId(data.zone.id)}</p>
              </div>
              <button
                type="button"
                onClick={() => copy(data.zone.id)}
                className="inline-flex items-center gap-2 rounded-lg border border-border-main bg-bg-card/40 px-3 py-2 text-[11px] font-semibold text-text-secondary hover:border-gold/35 hover:text-gold"
              >
                <Copy className="size-4" aria-hidden />
                Copiar
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-border-main bg-bg-card/45 p-6 backdrop-blur-sm">
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Salud operativa</p>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between rounded-xl border border-border-main bg-bg-solid/60 px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] text-text-dim">
                  <Store className="size-4 text-gold/70" aria-hidden /> Sucursales
                </div>
                <span className="font-mono text-[12px] text-text-secondary">{data.stats.restaurants}</span>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border-main bg-bg-solid/60 px-4 py-3">
                <div className="flex items-center gap-2 text-[12px] text-text-dim">
                  <Users className="size-4 text-gold/70" aria-hidden /> Accesos activos
                </div>
                <span className="font-mono text-[12px] text-text-secondary">
                  {data.stats.staffActive}/{data.stats.staffTotal}
                </span>
              </div>
            </div>
          </div>
        </div>

        <section className="space-y-4 rounded-2xl border border-border-main bg-bg-card/35 p-6 backdrop-blur-md">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-serif text-lg text-text-primary">Seguridad</h2>
              <p className="mt-1 text-[12px] text-text-dim">Rotación de PIN para el supervisor actual.</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-faint">
              <KeyRound className="size-3" aria-hidden />
              Requiere sesión activa
            </div>
          </div>

          <form onSubmit={rotate} className="grid gap-4 md:grid-cols-3 md:items-end">
            <div className="md:col-span-2">
              <label className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                Nuevo PIN
              </label>
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
                placeholder="Mínimo 4 caracteres"
                className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 font-mono text-[14px] tracking-[0.2em] text-text-primary outline-none placeholder:text-text-faint placeholder:tracking-normal focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
              />
            </div>
            <button
              type="submit"
              disabled={saving || !pin.trim()}
              className="rounded-xl border border-gold/45 bg-gold-faint/45 px-6 py-2.5 text-[12px] font-semibold text-gold transition-colors hover:bg-gold-faint/75 disabled:opacity-45"
            >
              {saving ? "Actualizando…" : "Rotar PIN"}
            </button>
          </form>

          {msg ? <p className="text-[12px] text-dash-green">{msg}</p> : null}
          {err ? <p className="text-[12px] text-dash-red">{err}</p> : null}

          <p className="text-[11px] text-text-faint">
            Consejo: rota el PIN al cambiar responsables de turno o si sospechas filtración.
          </p>
        </section>
      </div>
    </div>
  );
}

