"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import { ArrowLeft, CircleDot, MapPin, RefreshCw, Store, TrendingUp, Users } from "lucide-react";
import { getChainRestaurantDossier } from "@/actions/chain-restaurant";
import type { ChainRestaurantDossierData } from "@/actions/chain-restaurant";

function fmtMoney(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

export default function ChainRestaurantDossier({ restaurantId }: { restaurantId: string }) {
  const [data, setData] = useState<ChainRestaurantDossierData | null>(null);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getChainRestaurantDossier(restaurantId);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [restaurantId]);

  useEffect(() => {
    load();
    const iv = setInterval(load, 45000);
    return () => clearInterval(iv);
  }, [load]);

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-bg-solid px-4 text-text-dim">
        <motion.div
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 18, ease: "linear" }}
          className="text-gold/35"
          aria-hidden
        >
          <Store className="size-12" strokeWidth={1} />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[0.22em]">Cargando dossier…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-solid p-8 text-center text-[13px] text-dash-red">
        No se encontró el restaurante.
      </div>
    );
  }

  const r = data.restaurant;
  const t = data.today;
  const occPct = t.totalTables > 0 ? Math.round((t.activeTables / t.totalTables) * 100) : 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-solid font-sans text-text-primary">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-28 top-0 h-[min(85vh,640px)] w-[min(120vw,900px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.12),transparent_62%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[42vh] w-[60vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(77,132,96,0.08),transparent_58%)] blur-3xl" />
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
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-4">
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href="/cadena/zonas"
                className="inline-flex items-center gap-2 rounded-full border border-border-main bg-bg-card/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted transition-colors hover:border-gold/30 hover:text-gold"
              >
                <ArrowLeft className="size-3" aria-hidden />
                Volver al atlas
              </Link>
              {r.zone ? (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-border-mid bg-bg-solid/70 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-text-dim">
                  <MapPin className="size-3" aria-hidden />
                  {r.zone.name}
                </span>
              ) : null}
            </div>

            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-faint">
                Dossier · sucursal
              </p>
              <h1 className="mt-2 font-serif text-[clamp(1.9rem,4.8vw,3.1rem)] font-semibold leading-[1.05] tracking-tight">
                {r.name}
              </h1>
              <p className="mt-3 max-w-xl text-[13px] leading-relaxed text-text-muted">
                {r.address || "Sin dirección registrada"}{" "}
                {r.chain ? <span className="text-text-faint">· {r.chain.name}</span> : null}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={load}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border-bright bg-bg-card px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary transition-colors hover:border-gold/35 hover:text-gold disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
            {loading ? "Sincronizando" : "Refrescar"}
          </button>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm">
            <TrendingUp className="absolute right-3 top-3 size-12 text-gold/10" aria-hidden />
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Ventas hoy</p>
            <p className="mt-2 font-serif text-2xl text-text-primary">{fmtMoney(t.revenue)}</p>
            <p className="mt-1 text-[11px] text-text-dim">Órdenes READY/DELIVERED</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm">
            <CircleDot className="absolute right-3 top-3 size-12 text-gold/10" aria-hidden />
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Mesas activas</p>
            <p className="mt-2 font-serif text-2xl text-text-primary">
              {t.activeTables}/{t.totalTables}
            </p>
            <p className="mt-1 text-[11px] text-text-dim">Ocupación {occPct}%</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm">
            <Users className="absolute right-3 top-3 size-12 text-gold/10" aria-hidden />
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Staff activo</p>
            <p className="mt-2 font-serif text-2xl text-text-primary">{t.activeStaff}</p>
            <p className="mt-1 text-[11px] text-text-dim">Colaboradores con `isActive=true`</p>
          </div>
          <div className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm">
            <Store className="absolute right-3 top-3 size-12 text-gold/10" aria-hidden />
            <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">Sesiones</p>
            <p className="mt-2 font-serif text-2xl text-text-primary">{t.sessions}</p>
            <p className="mt-1 text-[11px] text-text-dim">Del día (por mesas)</p>
          </div>
        </div>
      </div>
    </div>
  );
}

