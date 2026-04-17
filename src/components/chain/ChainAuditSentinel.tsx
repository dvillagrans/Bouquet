"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ClipboardCheck,
  Eye,
  FileWarning,
  Flame,
  RefreshCw,
  ShieldAlert,
  SplitSquareVertical,
  Users,
} from "lucide-react";
import { getChainAuditOverview } from "@/actions/chain";
import type { ChainAuditOverviewData } from "@/actions/chain";
import ChainAuthGuard from "./ChainAuthGuard";

function fmtStamp(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function riskFrom(stats: ChainAuditOverviewData["stats"]) {
  // Heurística intencionalmente simple: da señal sin inventar seguridad.
  const hasZones = stats.zones > 0;
  const hasTemplates = stats.templates > 0 && stats.templateItems > 0;
  const hasStaff = stats.staffTotal > 0;
  const inactiveRate = stats.staffTotal > 0 ? 1 - stats.staffActive / stats.staffTotal : 1;
  const overrideDensity =
    stats.restaurants > 0 ? (stats.zoneOverrides + stats.restaurantOverrides) / stats.restaurants : 0;

  let score = 0;
  if (!hasZones) score += 18;
  if (!hasTemplates) score += 22;
  if (!hasStaff) score += 14;
  score += clamp(Math.round(inactiveRate * 18), 0, 18);
  score += clamp(Math.round(Math.min(overrideDensity, 3) * 10), 0, 30);

  const risk = clamp(score, 0, 100);
  const tier =
    risk >= 70 ? "alto" : risk >= 40 ? "medio" : risk >= 20 ? "bajo" : "mínimo";
  return { risk, tier, overrideDensity };
}

function KPI({
  label,
  value,
  hint,
  icon: Icon,
  i,
  reduceMotion,
}: {
  label: string;
  value: string;
  hint: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  i: number;
  reduceMotion: boolean | null;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm">
      <Icon className="absolute right-3 top-3 size-12 text-gold/10" aria-hidden />
      <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">{label}</p>
      <p className="mt-2 font-serif text-2xl text-text-primary">{value}</p>
      <p className="mt-1 text-[11px] text-text-dim">{hint}</p>
      <motion.div
        className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gold/70 to-transparent"
        initial={reduceMotion ? false : { width: "0%" }}
        animate={{ width: "100%" }}
        transition={{ delay: reduceMotion ? 0 : 0.08 + i * 0.05, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      />
    </div>
  );
}

function Finding({
  icon: Icon,
  title,
  body,
  severity,
}: {
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  body: string;
  severity: "alto" | "medio" | "bajo";
}) {
  const tone =
    severity === "alto"
      ? "border-[#3e1818] bg-dash-red-bg/70 text-dash-red"
      : severity === "medio"
        ? "border-gold/25 bg-gold-faint/35 text-gold"
        : "border-dash-blue/25 bg-dash-blue-bg/40 text-dash-blue";

  return (
    <div className={`relative overflow-hidden rounded-2xl border p-5 ${tone}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex size-9 items-center justify-center rounded-xl border border-border-main bg-bg-solid/70 text-text-primary/70">
          <Icon className="size-4.5" aria-hidden />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold tracking-tight text-text-primary">{title}</p>
          <p className="mt-1 text-[12px] leading-relaxed text-text-muted">{body}</p>
        </div>
        <span className="rounded-full border border-border-main bg-bg-solid/60 px-2 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-text-dim">
          {severity}
        </span>
      </div>
    </div>
  );
}

export default function ChainAuditSentinel({ initialTenantId }: { initialTenantId?: string }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [data, setData] = useState<ChainAuditOverviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  const load = useCallback(async (tid: string) => {
    try {
      setLoading(true);
      const res = await getChainAuditOverview(tid);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!tenantId) return;
    load(tenantId);
    const iv = setInterval(() => load(tenantId), 60000);
    return () => clearInterval(iv);
  }, [tenantId, load]);

  const derived = useMemo(() => {
    if (!data) return null;
    return riskFrom(data.stats);
  }, [data]);

  if (!tenantId) {
    return <ChainAuthGuard tenantId={initialTenantId} onAuthenticated={(tid) => setTenantId(tid)} />;
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
          <ShieldAlert className="size-12" strokeWidth={1} />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[0.22em]">Compilando señales de auditoría…</p>
      </div>
    );
  }

  if (!data || !derived) {
    return (
      <div className="min-h-screen bg-bg-solid p-8 text-center text-[13px] text-dash-red">
        No se encontró la cadena o fue eliminada.
      </div>
    );
  }

  const { stats } = data;
  const { overrideDensity } = derived;

  const findings = [
    ...(stats.templates === 0
      ? [
          {
            icon: FileWarning,
            title: "Sin plantillas publicadas",
            body: "La cadena no tiene una base de carta. Esto suele disparar divergencias por sucursal y dificulta overrides consistentes.",
            severity: "alto" as const,
          },
        ]
      : []),
    ...(stats.zones === 0
      ? [
          {
            icon: SplitSquareVertical,
            title: "Zonas no declaradas",
            body: "Sin territorios definidos, el control jerárquico (managers de zona, overrides por territorio) pierde sentido.",
            severity: "medio" as const,
          },
        ]
      : []),
    ...(stats.staffTotal === 0
      ? [
          {
            icon: Users,
            title: "Sin personal corporativo",
            body: "No hay identidades de administración/gerencia registradas para operar cadena y zonas.",
            severity: "alto" as const,
          },
        ]
      : []),
    ...(stats.staffTotal > 0 && stats.staffActive === 0
      ? [
          {
            icon: Flame,
            title: "Todos los accesos están inactivos",
            body: "Existen registros de staff, pero ningún acceso activo. Riesgo operativo: no hay quién administre.",
            severity: "alto" as const,
          },
        ]
      : []),
    ...((stats.zoneOverrides + stats.restaurantOverrides) > 0
      ? [
          {
            icon: Eye,
            title: "Overrides detectados",
            body: `Hay ${stats.zoneOverrides + stats.restaurantOverrides} overrides entre zonas y sucursales. Densidad ≈ ${overrideDensity.toFixed(1)} por sucursal. Útil para flexibilidad, peligroso si se vuelve ruido.`,
            severity: overrideDensity >= 2 ? ("medio" as const) : ("bajo" as const),
          },
        ]
      : []),
  ];

  const checklist = [
    { ok: stats.templates > 0, label: "Existe al menos 1 plantilla de menú" },
    { ok: stats.templateItems > 0, label: "La carta tiene platillos (TemplateItem)" },
    { ok: stats.zones > 0, label: "Zonas creadas para control territorial" },
    { ok: stats.staffActive > 0, label: "Hay accesos activos (admin o managers)" },
    { ok: stats.restaurants > 0, label: "Sucursales registradas en la red" },
  ];

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-solid font-sans text-text-primary">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-0 top-0 h-[min(85vh,640px)] w-[min(120vw,900px)] rounded-full bg-[radial-gradient(ellipse_at_top_left,rgba(201,160,84,0.12),transparent_60%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[42vh] w-[58vw] rounded-full bg-[radial-gradient(ellipse_at_bottom_right,rgba(68,114,160,0.07),transparent_58%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(90deg, var(--color-border-mid) 1px, transparent 1px), linear-gradient(var(--color-border-mid) 1px, transparent 1px)",
            backgroundSize: "56px 56px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pb-24 pt-10 md:px-8 md:pt-14">
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-faint">
                Auditoría · gobernanza operativa
              </p>
              <h1 className="mt-2 font-serif text-[clamp(1.9rem,4.8vw,3.2rem)] font-semibold leading-[1.05] tracking-tight">
                Auditoría de{" "}
                <span className="bg-gradient-to-r from-gold via-[#dfc08f] to-gold-dim bg-clip-text text-transparent">
                  {data.chain.name}
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-text-muted">
                Señales de configuración (plantillas, overrides, staff y estructura). Esto no reemplaza un log de eventos:
                es una radiografía de consistencia para operar en escala.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => load(tenantId)}
              disabled={loading}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-bright bg-bg-card px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary transition-colors hover:border-gold/35 hover:text-gold disabled:opacity-50"
            >
              <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
              {loading ? "Sincronizando" : "Refrescar"}
            </button>
            <p className="text-center font-mono text-[10px] uppercase tracking-[0.2em] text-text-faint sm:text-right">
              Corte {fmtStamp(data.updatedAt)}
            </p>
          </div>
        </motion.header>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.05 }}
          className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Zonas", value: String(stats.zones), hint: "Territorios declarados", icon: SplitSquareVertical },
            { label: "Sucursales", value: String(stats.restaurants), hint: "En red (cadena)", icon: ClipboardCheck },
            { label: "Plantillas", value: String(stats.templates), hint: `${stats.templateItems} platillos indexados`, icon: ShieldAlert },
            { label: "Accesos activos", value: `${stats.staffActive}/${stats.staffTotal}`, hint: "Admins y managers", icon: Users },
          ].map((k, i) => (
            <KPI key={k.label} {...k} i={i} reduceMotion={reduceMotion} />
          ))}
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-3">
          <motion.section
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2 space-y-4"
            aria-labelledby="findings-title"
          >
            <div className="flex items-end justify-between gap-4 border-b border-border-main pb-4">
              <div>
                <h2 id="findings-title" className="font-serif text-xl text-text-primary">
                  Hallazgos (configuración)
                </h2>
                <p className="mt-1 text-[12px] text-text-dim">
                  Derivados de conteos actuales. Úsalos como checklist operativo.
                </p>
              </div>
              <Link
                href="/cadena/plantillas"
                className="hidden rounded-xl border border-border-main bg-bg-card/50 px-4 py-2 text-[11px] font-semibold text-text-secondary transition-colors hover:border-gold/35 hover:text-gold sm:inline-flex"
              >
                Ver plantillas
              </Link>
            </div>

            {findings.length === 0 ? (
              <div className="rounded-2xl border border-border-main bg-bg-card/35 p-8 text-center">
                <ClipboardCheck className="mx-auto size-10 text-dash-green/40" aria-hidden />
                <p className="mt-4 font-serif text-lg text-text-secondary">Sin banderas obvias.</p>
                <p className="mx-auto mt-2 max-w-md text-[13px] text-text-dim">
                  La estructura base parece consistente. El siguiente nivel sería auditar cambios con eventos y responsables.
                </p>
              </div>
            ) : (
              <div className="grid gap-4">
                {findings.map((f) => (
                  <Finding key={f.title} {...f} />
                ))}
              </div>
            )}
          </motion.section>

          <motion.aside
            initial={reduceMotion ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4 rounded-2xl border border-border-main bg-bg-card/35 p-6 backdrop-blur-md"
            aria-labelledby="checklist-title"
          >
            <div>
              <h2 id="checklist-title" className="font-serif text-lg text-text-primary">
                Checklist de gobernanza
              </h2>
              <p className="mt-1 text-[12px] text-text-dim">Estado “verde” para operar en escala.</p>
            </div>

            <div className="space-y-3">
              {checklist.map((c) => (
                <div
                  key={c.label}
                  className="flex items-start gap-3 rounded-xl border border-border-main bg-bg-solid/60 p-3"
                >
                  <span
                    className={`mt-0.5 inline-flex size-5 items-center justify-center rounded-md border ${c.ok ? "border-dash-green/30 bg-dash-green-bg text-dash-green" : "border-gold/25 bg-gold-faint/40 text-gold"}`}
                    aria-hidden
                  >
                    {c.ok ? "✓" : "!"}
                  </span>
                  <p className="text-[12px] leading-relaxed text-text-secondary">{c.label}</p>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-border-main/70">
              <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-text-faint">Trazabilidad (próximo)</p>
              <p className="mt-2 text-[12px] leading-relaxed text-text-dim">
                Si quieres, el siguiente paso es un log real: quién cambió plantillas, overrides y accesos, con diffs y
                timestamps.
              </p>
              <div className="mt-3 flex flex-col gap-2">
                <Link
                  href="/cadena/staff"
                  className="rounded-xl border border-border-main bg-bg-card/50 px-4 py-2 text-[11px] font-semibold text-text-secondary transition-colors hover:border-gold/35 hover:text-gold"
                >
                  Gestionar staff
                </Link>
                <Link
                  href="/cadena/zonas"
                  className="rounded-xl border border-border-main bg-bg-card/50 px-4 py-2 text-[11px] font-semibold text-text-secondary transition-colors hover:border-gold/35 hover:text-gold"
                >
                  Ver atlas de zonas
                </Link>
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}

