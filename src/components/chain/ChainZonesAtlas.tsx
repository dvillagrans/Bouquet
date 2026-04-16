"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  Compass,
  MapPinned,
  Orbit,
  RefreshCw,
  Sparkles,
  Store,
  TrendingUp,
  Waves,
} from "lucide-react";
import { getChainDashboard } from "@/actions/chain";
import type { ChainDashboardData, RestaurantSummary, ZoneSummary } from "@/actions/chain";
import ChainAuthGuard from "./ChainAuthGuard";
import { Map, Marker, ZoomControl } from "pigeon-maps";

function fmtMoney(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function gridRefFromId(id: string) {
  const n = id.replace(/-/g, "").slice(0, 6);
  const a = parseInt(n.slice(0, 2) || "0", 16) % 90;
  const b = parseInt(n.slice(2, 4) || "0", 16) % 180;
  return `${(a + 19).toFixed(2)}°N · ${(b + 99).toFixed(2)}°W`;
}

function occupancyTone(pct: number) {
  if (pct >= 70) return "from-dash-green to-emerald-400/90";
  if (pct >= 40) return "from-gold to-amber-200/80";
  return "from-text-muted to-text-dim";
}

function ZoneRing({ sharePct }: { sharePct: number }) {
  const p = Math.min(100, Math.max(0, sharePct));
  return (
    <div
      className="relative size-24 shrink-0 rounded-full border border-border-main/80 bg-bg-solid/80 p-[3px] shadow-[inset_0_0_24px_rgba(0,0,0,0.45)]"
      aria-hidden
    >
      <div
        className="size-full rounded-full"
        style={{
          background: `conic-gradient(var(--color-gold) ${p * 3.6}deg, var(--color-border-mid) 0deg)`,
        }}
      />
      <div className="absolute inset-[10px] flex items-center justify-center rounded-full bg-bg-card/95 text-center">
        <span className="font-mono text-[11px] font-semibold tabular-nums text-gold">{p.toFixed(0)}%</span>
      </div>
    </div>
  );
}

function ZoneCard({
  zone,
  index,
  sharePct,
  totalRestaurants,
  reduceMotion,
}: {
  zone: ZoneSummary;
  index: number;
  sharePct: number;
  totalRestaurants: number;
  reduceMotion: boolean | null;
}) {
  const occPct = zone.totalTables > 0 ? (zone.activeTables / zone.totalTables) * 100 : 0;
  const tone = occupancyTone(occPct);

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 28, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{
        type: "spring",
        stiffness: 380,
        damping: 32,
        delay: reduceMotion ? 0 : 0.06 * index,
      }}
      className="group relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/60 p-6 shadow-[0_24px_80px_-40px_rgba(0,0,0,0.85)] backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-gold-dim/50 hover:shadow-[0_0_0_1px_rgba(201,160,84,0.12),0_32px_100px_-36px_rgba(201,160,84,0.08)]"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-24 size-56 rounded-full bg-gradient-to-br from-gold/12 via-transparent to-transparent opacity-70 blur-2xl transition-opacity duration-700 group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `linear-gradient(var(--color-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)`,
          backgroundSize: "22px 22px",
        }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border-mid bg-bg-solid/80 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-text-dim">
              Territorio {String(index + 1).padStart(2, "0")}
            </span>
            <span className="font-mono text-[10px] text-text-faint">{gridRefFromId(zone.id)}</span>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.65rem]">
              {zone.name}
            </h2>
            <p className="mt-1.5 max-w-md text-[12px] leading-relaxed text-text-muted">
              {zone.restaurantCount}{" "}
              {zone.restaurantCount === 1 ? "unidad operativa" : "unidades operativas"} ·{" "}
              {zone.totalTables} mesas en red
            </p>
          </div>

          <div className="flex flex-wrap gap-6">
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-text-faint">Ventas hoy</p>
              <p className="mt-1 font-serif text-xl text-gold">{fmtMoney(zone.totalRevenue)}</p>
            </div>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-text-faint">Mesas en servicio</p>
              <p className="mt-1 font-mono text-sm tabular-nums text-text-secondary">
                {zone.activeTables}
                <span className="text-text-faint"> / </span>
                {zone.totalTables}
              </p>
            </div>
            <div>
              <p className="text-[9px] font-medium uppercase tracking-[0.22em] text-text-faint">Peso en cadena</p>
              <p className="mt-1 font-mono text-sm tabular-nums text-text-secondary">
                {totalRestaurants > 0
                  ? ((zone.restaurantCount / totalRestaurants) * 100).toFixed(0)
                  : "0"}
                % locales
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-[10px] uppercase tracking-[0.16em] text-text-dim">
              <span className="flex items-center gap-1.5">
                <Orbit className="size-3 text-gold/80" aria-hidden />
                Pulso de sala
              </span>
              <span className="font-mono tabular-nums text-text-muted">{occPct.toFixed(0)}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-solid ring-1 ring-border-main">
              <motion.div
                className={`h-full w-full origin-left rounded-full bg-gradient-to-r ${tone}`}
                initial={reduceMotion ? false : { scaleX: 0 }}
                animate={{ scaleX: occPct / 100 }}
                transition={{ duration: reduceMotion ? 0 : 1.1, ease: [0.22, 1, 0.36, 1], delay: 0.12 * index }}
              />
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <Link
              href={`/zona?zoneId=${zone.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-lg border border-gold/35 bg-gold-faint/40 px-4 py-2 text-[11px] font-semibold text-gold transition-colors hover:border-gold/60 hover:bg-gold-faint/70"
            >
              <MapPinned className="size-3.5" aria-hidden />
              Consola de zona
            </Link>
            <span className="font-mono text-[10px] text-text-faint">ID · {zone.id.slice(0, 8)}…</span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-center gap-3 sm:pt-2">
          <ZoneRing sharePct={sharePct} />
          <p className="max-w-[7rem] text-center text-[9px] uppercase leading-snug tracking-[0.14em] text-text-faint">
            Participación vs. otras zonas
          </p>
        </div>
      </div>
    </motion.article>
  );
}

function EmptyAtlas({ chainName }: { chainName: string }) {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-dashed border-border-bright/60 bg-gradient-to-b from-bg-card/40 to-bg-solid px-8 py-20 text-center"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.07]">
        <Compass className="size-[min(80vw,420px)] text-gold" strokeWidth={0.35} aria-hidden />
      </div>
      <div className="relative mx-auto max-w-lg space-y-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-border-main bg-bg-bar/80 shadow-[0_0_40px_-12px_rgba(201,160,84,0.35)]">
          <Waves className="size-7 text-gold" aria-hidden />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-text-faint">Sin divisiones cartografiadas</p>
          <h2 className="mt-3 font-serif text-2xl text-text-primary sm:text-3xl">
            Tu red <em className="not-italic text-gold">{chainName}</em> aún no declara zonas.
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
            Las zonas agrupan sucursales para reporting, menús derivados y managers territoriales. Crea una sucursal
            asignando una zona nueva desde el panel maestro.
          </p>
        </div>
        <Link
          href="/cadena"
          className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-bright bg-bg-hover px-5 py-2.5 text-[12px] font-medium text-text-secondary transition-colors hover:border-gold/40 hover:text-gold"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Volver al panel maestro
        </Link>
      </div>
    </motion.div>
  );
}

export default function ChainZonesAtlas({ initialTenantId }: { initialTenantId?: string }) {
  const router = useRouter();
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [data, setData] = useState<ChainDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const reduceMotion = useReducedMotion();

  // Geocoder cache
  const [geoPoints, setGeoPoints] = useState<Record<string, [number, number]>>({});
  const [mapCenter, setMapCenter] = useState<[number, number]>([19.432608, -99.133209]); // CDMX central

  const [hovered, setHovered] = useState<{
    rest: RestaurantSummary;
    x: number;
    y: number;
  } | null>(null);

  const load = useCallback(async (tid: string) => {
    try {
      setLoading(true);
      const res = await getChainDashboard(tid);
      setData(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (tenantId) {
      load(tenantId);
      const iv = setInterval(() => load(tenantId), 45000);
      return () => clearInterval(iv);
    }
  }, [tenantId, load]);

  // Client-side geocoding for visual map
  useEffect(() => {
    if (!data?.restaurants || data.restaurants.length === 0) return;
    
    let isMounted = true;
    
    const geocodeAll = async () => {
      const currentCacheStr = sessionStorage.getItem("geoCacheBouquet") || "{}";
      const cache = JSON.parse(currentCacheStr);
      const newPoints = { ...geoPoints };
      let changed = false;
      let firstCenter: [number, number] | null = null;

      for (const r of data.restaurants) {
        if (!r.address || newPoints[r.id]) continue;
        
        if (cache[r.address]) {
           newPoints[r.id] = cache[r.address];
           changed = true;
           if (!firstCenter) firstCenter = cache[r.address];
           continue;
        }

        try {
          // Add artificial delay to avoid hammering Nominatim
          await new Promise((res) => setTimeout(res, 800));
          if (!isMounted) return;

          const res = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
              r.address
            )}&format=json&limit=1&countrycodes=mx`
          );
          const points = await res.json();
          if (points && points.length > 0) {
            const coords: [number, number] = [parseFloat(points[0].lat), parseFloat(points[0].lon)];
            newPoints[r.id] = coords;
            cache[r.address] = coords;
            changed = true;
            if (!firstCenter) firstCenter = coords;
          }
        } catch (e) {
          console.error("Geocode failed for", r.address, e);
        }
      }

      if (changed && isMounted) {
        setGeoPoints(newPoints);
        sessionStorage.setItem("geoCacheBouquet", JSON.stringify(cache));
        if (firstCenter) {
           setMapCenter(firstCenter);
        }
      }
    };

    geocodeAll();
    return () => { isMounted = false; };
  }, [data, geoPoints]);

  const zoneRevenueTotal = useMemo(
    () => (data?.zones ?? []).reduce((a, z) => a + z.totalRevenue, 0),
    [data?.zones]
  );

  if (!tenantId) {
    return <ChainAuthGuard tenantId={initialTenantId} onAuthenticated={(tid) => setTenantId(tid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-bg-solid px-4 font-sans text-text-dim">
        <motion.div
          animate={reduceMotion ? {} : { rotate: 360 }}
          transition={{ repeat: Infinity, duration: 14, ease: "linear" }}
          className="text-gold/40"
          aria-hidden
        >
          <Compass className="size-12" strokeWidth={1} />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[0.24em]">Trazando atlas operativo…</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-bg-solid p-8 text-center text-[13px] text-dash-red">
        No se encontró la cadena o fue eliminada.
      </div>
    );
  }

  const zones = data.zones;
  const totalTablesAll = zones.reduce((a, z) => a + z.totalTables, 0);
  const activeTablesAll = zones.reduce((a, z) => a + z.activeTables, 0);
  const occAll = totalTablesAll > 0 ? (activeTablesAll / totalTablesAll) * 100 : 0;

  const darkTiles = (x: number, y: number, z: number, dpr?: number) => {
    return `https://cartodb-basemaps-a.global.ssl.fastly.net/dark_all/${z}/${x}/${y}${
      dpr && dpr >= 2 ? "@2x" : ""
    }.png`;
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-solid font-sans text-text-primary">
      {/* Atmósfera Subyacente */}
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute -left-1/4 top-0 h-[min(90vh,720px)] w-[min(120vw,900px)] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.14),transparent_65%)] blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[50vh] w-[70vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(77,132,96,0.08),transparent_60%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `linear-gradient(90deg, var(--color-border-bright) 1px, transparent 1px), linear-gradient(var(--color-border-bright) 1px, transparent 1px)`,
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pb-24 pt-10 md:px-8 md:pt-14">
        
        {/* Header Hero + MAP (Split View Banner) */}
        <div className="mb-12 grid grid-cols-1 lg:grid-cols-2 gap-8 rounded-3xl border border-border-main bg-bg-card/40 backdrop-blur-md overflow-hidden shadow-2xl">
           
           {/* Info Side */}
           <motion.header
             initial={reduceMotion ? false : { opacity: 0, x: -20 }}
             animate={{ opacity: 1, x: 0 }}
             transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
             className="relative p-8 md:p-12 flex flex-col justify-center"
           >
             <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: `linear-gradient(var(--color-gold) 1px, transparent 1px), linear-gradient(90deg, var(--color-gold) 1px, transparent 1px)`, backgroundSize: "24px 24px" }} />
             
             <div className="relative z-10 space-y-6">
                <div className="flex flex-wrap items-center gap-3">
                  <Link
                    href="/cadena"
                    className="inline-flex items-center gap-2 rounded-full border border-border-main bg-bg-card/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted transition-colors hover:border-gold/30 hover:text-gold"
                  >
                    <ArrowLeft className="size-3" aria-hidden />
                    Panel maestro
                  </Link>
                  <span className="flex items-center gap-1.5 rounded-full border border-gold/25 bg-gold-faint/30 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] text-gold">
                    <Sparkles className="size-3" aria-hidden />
                    Vista atlas
                  </span>
                </div>

                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.32em] text-text-faint">Cartografía · Red Global</p>
                  <h1 className="mt-2 font-serif text-[clamp(2.2rem,5vw,3.5rem)] font-semibold leading-[1.05] tracking-tight">
                    Zonas de{" "}
                    <span className="bg-gradient-to-r from-gold via-[#e4c78a] to-gold-dim bg-clip-text text-transparent">
                      {data.chain.name}
                    </span>
                  </h1>
                  <p className="mt-4 max-w-md text-[13px] leading-relaxed text-text-muted">
                    Geolocalización en vivo de cada unidad operativa reportando actividad. Analiza la densidad territorial y los frentes de venta activos.
                  </p>
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => load(tenantId)}
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-border-bright bg-bg-card px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-text-secondary transition-colors hover:border-gold/35 hover:text-gold disabled:opacity-50"
                  >
                    <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
                    {loading ? "Rastreando" : "Redibujar mapa"}
                  </button>
                </div>
             </div>
           </motion.header>

           {/* Map Side */}
           <motion.div 
             initial={reduceMotion ? false : { opacity: 0 }}
             animate={{ opacity: 1 }}
             transition={{ duration: 1, delay: 0.2 }}
             className="relative h-64 lg:h-full min-h-[350px] border-t lg:border-t-0 lg:border-l border-border-main bg-[#1a1a1a]"
           >
              <Map
                provider={darkTiles}
                center={mapCenter}
                zoom={11}
                onBoundsChanged={({ center }) => setMapCenter(center)}
                metaWheelZoom={true}
              >
                 {data.restaurants.map((rest) => {
                   const coords = geoPoints[rest.id];
                   if (!coords) return null;
                   return (
                     <Marker
                       key={rest.id}
                       width={36}
                       anchor={coords}
                       color="#E5A85A"
                       payload={rest}
                       onMouseOver={(args: unknown) => {
                         const a = args as { event?: MouseEvent; payload?: RestaurantSummary };
                         const ev = a.event;
                         const payload = a.payload ?? rest;
                         if (!ev) return;
                         const target = ev.target as HTMLElement | null;
                         const rect = target?.getBoundingClientRect?.();
                         if (rect) {
                           setHovered({
                             rest: payload,
                             x: rect.left + rect.width / 2,
                             y: rect.top + rect.height / 2,
                           });
                         } else {
                           setHovered({ rest: payload, x: ev.clientX, y: ev.clientY });
                         }
                       }}
                       onMouseOut={() => setHovered(null)}
                       onClick={(args: unknown) => {
                         const a = args as { payload?: RestaurantSummary };
                         const payload = a.payload ?? rest;
                         router.push(`/cadena/restaurantes/${payload.id}`);
                       }}
                     />
                   );
                 })}
                 <ZoomControl style={{ bottom: 20, right: 20 }} />
              </Map>
              
              {/* Map UI Overlay Elements */}
              <div className="absolute top-4 left-4 z-10 pointer-events-none">
                <div className="inline-flex flex-col gap-2">
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-[#222]/80 backdrop-blur-sm text-[10px] text-text-secondary shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-gold animate-pulse" />
                    Radar Activo
                  </div>
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full border border-border-main bg-[#222]/80 backdrop-blur-sm text-[10px] text-text-muted shadow-lg">
                    {Object.keys(geoPoints).length} Puntos Geofijados
                  </div>
                </div>
              </div>

              {/* Hover card (outside map DOM, but positioned to viewport) */}
              {hovered ? (
                <div
                  className="fixed z-50 pointer-events-none"
                  style={{ left: hovered.x + 14, top: hovered.y + 14 }}
                >
                  <div className="w-[260px] overflow-hidden rounded-2xl border border-border-main bg-bg-card/95 shadow-[0_26px_90px_-50px_rgba(0,0,0,0.9)] backdrop-blur-md">
                    <div className="border-b border-border-main bg-bg-bar/70 px-4 py-3">
                      <p className="text-[10px] font-medium uppercase tracking-[0.18em] text-text-faint">
                        Sucursal
                      </p>
                      <p className="mt-1 font-serif text-[16px] leading-tight text-text-primary">
                        {hovered.rest.name}
                      </p>
                      <p className="mt-1 text-[11px] text-text-dim">
                        {hovered.rest.address || "Sin dirección registrada"}
                      </p>
                    </div>
                    <div className="px-4 py-3">
                      <div className="flex items-center justify-between text-[10px] text-text-dim">
                        <span>Zona</span>
                        <span className="font-medium text-text-secondary">
                          {hovered.rest.zoneName || "—"}
                        </span>
                      </div>
                      <div className="mt-2 grid grid-cols-3 gap-2">
                        <div className="rounded-xl border border-border-main bg-bg-solid/60 px-2 py-2">
                          <p className="font-mono text-[11px] tabular-nums text-gold">{fmtMoney(hovered.rest.todayRevenue)}</p>
                          <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-text-faint">Ventas</p>
                        </div>
                        <div className="rounded-xl border border-border-main bg-bg-solid/60 px-2 py-2">
                          <p className="font-mono text-[11px] tabular-nums text-text-secondary">
                            {hovered.rest.activeTables}/{hovered.rest.totalTables}
                          </p>
                          <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-text-faint">Mesas</p>
                        </div>
                        <div className="rounded-xl border border-border-main bg-bg-solid/60 px-2 py-2">
                          <p className="font-mono text-[11px] tabular-nums text-text-secondary">
                            {hovered.rest.activeStaff}
                          </p>
                          <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-text-faint">Staff</p>
                        </div>
                      </div>
                      <p className="mt-3 text-[10px] text-text-faint">
                        Click para abrir dossier completo
                      </p>
                    </div>
                  </div>
                </div>
              ) : null}
           </motion.div>
        </div>

        {/* Cinta de métricas */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.08, duration: 0.45 }}
          className="mb-12 grid gap-4 sm:grid-cols-3"
        >
          {[
            {
              label: "Territorios activos",
              value: String(zones.length),
              hint: "Zonas con al menos una sucursal",
              icon: MapPinned,
            },
            {
              label: "Ventas consolidadas (zonas)",
              value: fmtMoney(zoneRevenueTotal),
              hint: "Suma del día en territorios mapeados",
              icon: TrendingUp,
            },
            {
              label: "Pulso global de sala",
              value: `${occAll.toFixed(0)}%`,
              hint: `${activeTablesAll} mesas ocupadas / ${totalTablesAll}`,
              icon: Store,
            },
          ].map((item, i) => (
            <div
              key={item.label}
              className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/50 p-5 backdrop-blur-md"
            >
              <div className="absolute right-3 top-3 opacity-[0.12]" aria-hidden>
                <item.icon className="size-14 text-gold" strokeWidth={1} />
              </div>
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">{item.label}</p>
              <p className="mt-3 font-serif text-2xl text-text-primary">{item.value}</p>
              <p className="mt-2 text-[11px] text-text-dim">{item.hint}</p>
              <motion.div
                className="absolute bottom-0 left-0 h-[2px] bg-gold/60"
                initial={reduceMotion ? false : { width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: reduceMotion ? 0 : 0.15 + i * 0.08, duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ))}
        </motion.div>

        {zones.length === 0 ? (
          <EmptyAtlas chainName={data.chain.name} />
        ) : (
          <div className="space-y-8">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border-main pb-4">
              <div>
                <h2 className="font-serif text-xl text-text-primary">Desglose de Territorios</h2>
                <p className="mt-1 text-[12px] text-text-dim">Clasificación de zonas operativas activas.</p>
              </div>
              <div className="flex items-center gap-4">
                <p className="hidden font-mono text-[10px] uppercase tracking-[0.2em] text-text-faint sm:block">
                  Bouquet · V{new Date().getFullYear()}
                </p>
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-dash-green rounded-full" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-text-dim">En línea</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              {zones.map((zone, index) => {
                const sharePct = zoneRevenueTotal > 0 ? (zone.totalRevenue / zoneRevenueTotal) * 100 : 0;
                return (
                  <div key={zone.id} className={index === 0 ? "lg:col-span-2" : undefined}>
                    <ZoneCard
                      zone={zone}
                      index={index}
                      sharePct={sharePct}
                      totalRestaurants={data.stats.restaurantCount}
                      reduceMotion={reduceMotion}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
