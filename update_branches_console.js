const fs = require('fs');
const filePath = 'src/components/chain/ZoneBranchesConsole.tsx';

let code = `
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  CircleDot,
  MapPin,
  RefreshCw,
  Search,
  Store,
  TrendingUp,
  Users,
  ChevronRight,
  Briefcase
} from "lucide-react";
import { getZoneDashboard } from "@/actions/chain";
import type { RestaurantSummary, ZoneDashboardData } from "@/actions/chain";
import ZoneAuthGuard from "./ZoneAuthGuard";
import { useIsMobile } from "@/hooks/use-mobile";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";

function fmtMoney(n: number) {
  return "\\$" + n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

function occPct(active: number, total: number) {
  return total > 0 ? Math.round((active / total) * 100) : 0;
}

function occColor(pct: number) {
  if (pct >= 80) return "bg-emerald-400";
  if (pct >= 50) return "bg-gold";
  return "bg-white/30";
}

function StatPill({
  label,
  value,
  icon: Icon,
  delay
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  delay: string;
}) {
  return (
    <article 
      className="relative group overflow-hidden rounded-2xl border border-white/5 bg-[linear-gradient(145deg,rgba(255,255,255,0.03),rgba(255,255,255,0.01))] p-6 shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] transition-all duration-500 hover:-translate-y-1 hover:border-gold/20 hover:shadow-[0_48px_80px_-12px_rgba(0,0,0,0.6)] animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
      style={{ animationFillMode: "both", animationDelay: delay }}
    >
      <div className="flex items-center justify-between mb-4 relative z-10">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-white">{label}</p>
        <Icon className="size-4 text-white/50 group-hover:text-white group-hover:scale-110 transition-all duration-500" aria-hidden />
      </div>
      <p className="font-serif text-3xl sm:text-4xl font-semibold text-white tabular-nums leading-none tracking-tight relative z-10">
        {value}
      </p>
      <Icon className="absolute -bottom-4 -right-4 size-24 text-white/[0.02] group-hover:text-gold/[0.05] transition-colors duration-500" aria-hidden />
    </article>
  );
}

function BranchRow({
  r,
  active,
  onSelect,
  delay
}: {
  r: RestaurantSummary;
  active: boolean;
  onSelect: () => void;
  delay: string;
}) {
  const pct = occPct(r.activeTables, r.totalTables);
  const color = occColor(pct);

  return (
    <button
      type="button"
      onClick={onSelect}
      className={\`group relative w-full text-left rounded-2xl border p-5 transition-all duration-500 ease-out animate-in fade-in slide-in-from-bottom-6 \${
        active
          ? "border-gold/40 bg-[linear-gradient(135deg,rgba(183,146,93,0.1),rgba(0,0,0,0))] shadow-[0_32px_64px_-16px_rgba(183,146,93,0.15)] -translate-y-1"
          : "border-white/5 bg-[#0a0a0a] hover:border-white/10 hover:bg-white/[0.02] shadow-[0_24px_48px_-12px_rgba(0,0,0,0.4)] hover:-translate-y-0.5"
      }\`}
      style={{ animationFillMode: "both", animationDelay: delay }}
    >
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between sm:gap-5">
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <p className="font-serif text-xl font-medium tracking-tight text-white line-clamp-1">
              {r.name}
            </p>
            {!active && pct < 40 && (
              <span className="size-1.5 rounded-full bg-none shadow-[0_0_8px_rgba(255,255,255,0.2)] border border-white/20" aria-hidden />
            )}
          </div>

          <p className="mt-1 line-clamp-1 text-[13px] text-text-dim">
            {r.address || "Sin dirección registrada"}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-6 sm:gap-8 border-t border-white/5 pt-4">
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim">Ventas</p>
              <p className="font-mono text-[14px] font-semibold tabular-nums text-gold">{fmtMoney(r.todayRevenue)}</p>
            </div>
            <div className="h-6 w-px bg-white/10" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim">Staff</p>
              <p className="font-mono text-[14px] font-medium tabular-nums text-white/80">{r.activeStaff}</p>
            </div>
            <div className="h-6 w-px bg-white/10" aria-hidden />
            <div className="flex flex-col gap-1">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-text-dim">Tickets</p>
              <p className="font-mono text-[14px] font-medium tabular-nums text-white/80">{r.todaySessions}</p>
            </div>
          </div>
        </div>

        <div className="mt-5 sm:mt-0 flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4">
          <div className="flex flex-col sm:items-end gap-2 w-full sm:w-auto">
            <span className="inline-flex items-center gap-1.5 text-[12px] font-medium text-text-dim">
              <CircleDot className={\`size-3.5 \${active ? 'text-gold' : 'text-white/50'}\`} aria-hidden />
              <span>{pct}% Ocupación</span>
            </span>
            <div className="h-1.5 w-full sm:w-28 rounded-full bg-white/5 overflow-hidden">
              <div
                className={\`h-full rounded-full transition-all duration-1000 ease-out \${color}\`}
                style={{ width: \\\`\${pct}%\\\` }}
              />
            </div>
          </div>
          <span className={\`hidden sm:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider transition-colors mt-4 \${active ? 'text-gold' : 'text-text-dim group-hover:text-gold'}\`}>
            Detalles <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
          </span>
        </div>
      </div>
    </button>
  );
}

export default function ZoneBranchesConsole({ initialZoneId }: { initialZoneId?: string }) {
  const [zoneId, setZoneId] = useState<string | null>(null);
  const [data, setData] = useState<ZoneDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const isMobile = useIsMobile();

  const load = useCallback(async (zid: string) => {
    try {
      setLoading(true);
      const res = await getZoneDashboard(zid);
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
    const iv = setInterval(() => load(zoneId), 45000);
    return () => clearInterval(iv);
  }, [zoneId, load]);

  useEffect(() => {
    if (!data?.restaurants?.length) return;
    if (!isMobile && !selectedId) setSelectedId(data.restaurants[0].id);
  }, [data?.restaurants, selectedId, isMobile]);

  const filtered = useMemo(() => {
    const list = data?.restaurants ?? [];
    const needle = q.trim().toLowerCase();
    if (!needle) return list;
    return list.filter((r) => {
      const name = r.name.toLowerCase();
      const addr = (r.address ?? "").toLowerCase();
      return name.includes(needle) || addr.includes(needle);
    });
  }, [data?.restaurants, q]);

  const selected = useMemo(
    () => (data?.restaurants ?? []).find((r) => r.id === selectedId) ?? null,
    [data?.restaurants, selectedId]
  );

  if (!zoneId) {
    return <ZoneAuthGuard zoneId={initialZoneId} onAuthenticated={(zid) => setZoneId(zid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg-solid">
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-white/5 px-5 py-2.5 backdrop-blur-md animate-in fade-in zoom-in-95 duration-700">
          <RefreshCw className="size-4 animate-spin text-gold" />
          <span className="text-[13px] font-medium tracking-wide text-text-dim">Cargando Consola...</span>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex min-h-[100dvh] items-center justify-center bg-bg-solid animate-in fade-in duration-1000">
        <div className="text-center">
          <h2 className="font-serif text-2xl text-white mb-2">Zona no encontrada</h2>
          <p className="text-[14px] text-text-dim">Esta zona no existe o fue eliminada del sistema.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-[100dvh] flex-col overflow-hidden bg-bg-solid text-[14px] text-text-primary antialiased selection:bg-gold/30">
      <div
        className="pointer-events-none fixed inset-0 opacity-40 mix-blend-color-dodge animate-in fade-in duration-[2000ms]"
        style={{
          background:
            "radial-gradient(circle at 10% 20%, rgba(183,146,93,0.1) 0%, transparent 50%), radial-gradient(circle at 90% 80%, rgba(68,114,160,0.05) 0%, transparent 50%)",
        }}
        aria-hidden
      />
      <div
        className="pointer-events-none fixed inset-0 transition-opacity duration-1000 animate-in fade-in duration-[2000ms]"
        style={{
          backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')",
          opacity: 0.03,
          mixBlendMode: "overlay",
        }}
        aria-hidden
      />

      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center justify-between gap-4 border-b border-white/5 bg-bg-solid/80 px-6 backdrop-blur-2xl sm:px-10 animate-in slide-in-from-top-full fade-in duration-700">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[12px] font-medium text-text-dim uppercase tracking-wider">
            <span className="text-white">Bouquet OPS</span>
            <ChevronRight className="size-3 text-white/20" />
            <Link href={\`/zona?zoneId=\${zoneId}\`} className="text-white/60 hover:text-white transition-colors">
              ZONAS
            </Link>
            <ChevronRight className="size-3 text-white/20" />
            <span className="text-gold tracking-widest">{data.zone.name}</span>
          </div>
        </div>

        <button
          type="button"
          onClick={() => load(zoneId)}
          disabled={loading}
          className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/10 bg-transparent text-text-dim transition-colors hover:border-white/20 hover:text-white disabled:opacity-50 sm:w-auto sm:gap-2 sm:px-4"
        >
          <RefreshCw className={\`size-4 shrink-0 \${loading ? "animate-spin text-gold" : ""}\`} aria-hidden />
          <span className="hidden text-[12px] font-medium sm:inline">Refrescar Consola</span>
        </button>
      </header>

      <div className="relative z-10 mx-auto max-w-7xl w-full px-6 pb-24 pt-10 md:px-10 md:pt-14 flex-1">
        
        <header 
          className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
          style={{ animationFillMode: "both", animationDelay: "150ms" }}
        >
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gold">
              <Briefcase className="size-3.5" /> Consola de Sucursales
            </p>
            <h1 className="font-serif text-4xl font-medium leading-[1.05] tracking-tight text-white sm:text-6xl text-balance">
              Dossier <em className="not-italic text-gold">{data.zone.name}</em>.
            </h1>
            <p className="mt-5 text-[15px] leading-relaxed text-text-dim">
              Busca, compara y desglosa los KPIs en vivo de cualquiera de las {data.restaurants.length} unidades adscritas. Pensado para control de territorio.
            </p>
          </div>
        </header>

        <div className="mb-14 grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          <StatPill label="Ventas zonales" value={fmtMoney(data.stats.totalRevenue)} icon={TrendingUp} delay="300ms" />
          <StatPill label="Staff activo" value={String(data.stats.staffCount)} icon={Users} delay="450ms" />
          <StatPill label="Mesas conectadas" value={String(data.stats.activeTables)} icon={CircleDot} delay="600ms" />
          <StatPill label="Sucursales" value={String(data.restaurants.length)} icon={Building2} delay="750ms" />
        </div>

        <div 
          className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-6 border-b border-white/5 pb-6 animate-in fade-in slide-in-from-bottom-8 duration-1000 ease-out"
          style={{ animationFillMode: "both", animationDelay: "900ms" }}
        >
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-4 text-white/30" aria-hidden />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Buscar sucursal o dirección..."
              className="w-full rounded-xl border border-white/10 bg-white/5 py-3 pl-11 pr-4 text-[14px] text-white placeholder:text-text-dim outline-none transition-colors focus:border-gold/50 focus:bg-white/10 focus:ring-1 focus:ring-gold/30"
            />
          </div>
          <p className="text-[12px] font-medium uppercase tracking-widest text-text-dim">
            <span className="text-white">{filtered.length}</span> de <span className="text-white">{data.restaurants.length}</span> resultados
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3 items-start">
          <div className="space-y-4 lg:col-span-2">
            {filtered.length === 0 ? (
              <div 
                className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-12 text-center animate-in fade-in duration-700"
              >
                <Store className="size-10 text-white/20 mx-auto mb-4" />
                <p className="font-serif text-2xl text-white mb-2">Resultados en cero</p>
                <p className="text-[14px] text-text-dim">No encontramos coincidencias para "{q}".</p>
              </div>
            ) : (
              filtered.map((r, idx) => (
                <BranchRow
                  key={r.id}
                  r={r}
                  active={r.id === selectedId}
                  onSelect={() => setSelectedId(r.id)}
                  delay={\`\${1000 + (idx * 100)}ms\`}
                />
              ))
            )}
          </div>

          <aside 
            className="hidden lg:block lg:sticky lg:top-24 rounded-3xl border border-white/5 bg-[#0a0a0a] p-8 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] animate-in fade-in slide-in-from-bottom-12 duration-1000 ease-out"
            style={{ animationFillMode: "both", animationDelay: "1100ms" }}
          >
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-text-dim mb-6 flex items-center gap-2">
              <span className="h-px flex-1 bg-white/10" />
              Inspector a Detalle
              <span className="h-px flex-1 bg-white/10" />
            </h2>
            {selected ? (
              <div className="animate-in fade-in zoom-in-95 duration-500">
                <p className="font-serif text-3xl font-medium tracking-tight text-white mb-1 leading-snug">{selected.name}</p>
                <p className="text-[13px] text-text-dim mb-8">{selected.address || "Sin dirección registrada en sistema"}</p>
                
                <div className="space-y-0 rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden">
                  <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-text-dim">Ingreso (Hoy)</span>
                    <span className="font-mono text-[16px] font-bold text-gold tabular-nums">{fmtMoney(selected.todayRevenue)}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01]">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-text-dim">Tickets Abiertos</span>
                    <span className="font-mono text-[14px] text-white/90 tabular-nums">{selected.todaySessions}</span>
                  </div>
                  <div className="flex items-center justify-between p-4 border-b border-white/5">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-text-dim">Mesas en Uso</span>
                    <span className="font-mono text-[14px] text-white/90 tabular-nums">
                      {selected.activeTables} <span className="text-white/30">/</span> {selected.totalTables} <span className="text-gold">({occPct(selected.activeTables, selected.totalTables)}%)</span>
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-white/[0.01]">
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-text-dim">Staff en Piso</span>
                    <span className="font-mono text-[14px] text-white/90 tabular-nums">{selected.activeStaff}</span>
                  </div>
                </div>

                <Link
                  href={\`/dashboard/impersonate/\${selected.id}\`}
                  className="mt-8 flex w-full items-center justify-center gap-3 rounded-full bg-white text-[13px] font-bold text-black py-4 transition-all hover:bg-gold shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(183,146,93,0.3)] group"
                >
                  IMPERSONAR OPERACIÓN
                  <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                </Link>
                <p className="mt-4 text-center text-[11px] text-text-dim uppercase tracking-wider">
                  Acceso full-admin a la sucursal
                </p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <div className="w-16 h-16 rounded-full border border-white/5 bg-white/[0.02] flex items-center justify-center mb-4">
                  <MapPin className="size-6 text-white/20" />
                </div>
                <p className="text-[13px] text-text-dim leading-relaxed">Selecciona una sucursal del listado para inspeccionar su telemetría en tiempo real y acceder a su consola.</p>
              </div>
            )}
          </aside>
        </div>

        <Sheet open={isMobile && !!selectedId} onOpenChange={(open) => !open && setSelectedId(null)}>
          <SheetContent
            side="bottom"
            showCloseButton={false}
            className="rounded-t-[2rem] border-x-0 border-b-0 border-t border-white/10 bg-[#0a0a0a] p-0 outline-none"
          >
            <div className="absolute left-1/2 top-4 h-1.5 w-12 -translate-x-1/2 rounded-full bg-white/20" />
            
            <div className="mx-auto max-w-sm px-6 pb-[calc(2rem+env(safe-area-inset-bottom))] pt-10">
              {selected && (
                <>
                  <SheetHeader className="px-0 pb-6 text-center">
                    <SheetTitle className="font-serif text-[28px] font-medium tracking-tight text-white mb-2 leading-none">
                      {selected.name}
                    </SheetTitle>
                    <SheetDescription className="text-[13px] text-text-dim">
                      {selected.address || "Sin dirección"}
                    </SheetDescription>
                  </SheetHeader>

                  <div className="space-y-0 rounded-2xl border border-white/5 bg-white/[0.02] overflow-hidden mb-6">
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                      <span className="text-[12px] font-semibold uppercase tracking-wider text-text-dim">Recaudación</span>
                      <span className="font-mono text-[16px] font-bold text-gold">{fmtMoney(selected.todayRevenue)}</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-white/5 bg-white/[0.01]">
                      <span className="text-[12px] font-semibold uppercase tracking-wider text-text-dim">Ocupación</span>
                      <span className="font-mono text-[14px] text-white">
                        {occPct(selected.activeTables, selected.totalTables)}%
                      </span>
                    </div>
                  </div>

                  <Link
                    href={\`/dashboard/impersonate/\${selected.id}\`}
                    onClick={() => setSelectedId(null)}
                    className="flex w-full items-center justify-center gap-3 rounded-full bg-white py-4 text-[14px] font-bold text-black transition-all hover:bg-gold shadow-[0_0_20px_rgba(255,255,255,0.1)] active:scale-[0.98] group"
                  >
                    ENTRAR A SUCURSAL
                    <ArrowRight className="size-[1.25rem] transition-transform group-hover:translate-x-1" />
                  </Link>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}
`;

fs.writeFileSync(filePath, code);
console.log("Updated ZoneBranchesConsole.tsx");
