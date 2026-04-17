"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  BookMarked,
  ChefHat,
  Layers,
  LayoutTemplate,
  Plus,
  RefreshCw,
  Store,
  UtensilsCrossed,
} from "lucide-react";
import {
  createChainMenuTemplate,
  getChainMenuTemplates,
} from "@/actions/chain";
import type { ChainMenuTemplatesData, ChainMenuTemplateRow } from "@/actions/chain";
import ChainAuthGuard from "./ChainAuthGuard";
import ChefAIAssistant from "./ai/ChefAIAssistant";

function fmtUpdated(iso: string) {
  try {
    return new Date(iso).toLocaleString("es-MX", { dateStyle: "medium", timeStyle: "short" });
  } catch {
    return "—";
  }
}

function TemplateCard({
  row,
  index,
  reduceMotion,
}: {
  row: ChainMenuTemplateRow;
  index: number;
  reduceMotion: boolean | null;
}) {
  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 400,
        damping: 34,
        delay: reduceMotion ? 0 : 0.05 * index,
      }}
      className="group relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/55 p-6 shadow-[0_20px_70px_-36px_rgba(0,0,0,0.85)] backdrop-blur-sm transition-[border-color,box-shadow] duration-500 hover:border-gold-dim/45 hover:shadow-[0_0_0_1px_rgba(201,160,84,0.1),0_28px_90px_-32px_rgba(201,160,84,0.07)]"
    >
      <div
        className="pointer-events-none absolute -right-20 -top-28 size-48 rounded-full bg-gradient-to-br from-gold/15 to-transparent opacity-60 blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage: `repeating-linear-gradient(-12deg, transparent, transparent 12px, var(--color-border-mid) 12px, var(--color-border-mid) 13px)`,
        }}
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            {row.isDefault ? (
              <span className="rounded-full border border-gold/40 bg-gold-faint/50 px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em] text-gold">
                Plantilla por defecto
              </span>
            ) : (
              <span className="rounded-full border border-border-mid bg-bg-solid/80 px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.16em] text-text-dim">
                Menú · {String(index + 1).padStart(2, "0")}
              </span>
            )}
            <span className="font-mono text-[10px] text-text-faint">Act. {fmtUpdated(row.updatedAt)}</span>
          </div>

          <div>
            <h2 className="font-serif text-2xl font-semibold tracking-tight text-text-primary sm:text-[1.6rem]">
              {row.name}
            </h2>
            <p className="mt-2 max-w-md text-[12px] leading-relaxed text-text-muted">
              Base corporativa para precios, categorías y platillos. Las sucursales heredan esta estructura y pueden
              aplicar overrides por zona o local.
            </p>
          </div>

          <dl className="grid grid-cols-3 gap-3 border-t border-border-main/80 pt-4">
            <div>
              <dt className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.14em] text-text-faint">
                <Layers className="size-3 text-gold/70" aria-hidden />
                Secciones
              </dt>
              <dd className="mt-1 font-mono text-lg tabular-nums text-text-secondary">{row.categoryCount}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.14em] text-text-faint">
                <UtensilsCrossed className="size-3 text-gold/70" aria-hidden />
                Platillos
              </dt>
              <dd className="mt-1 font-mono text-lg tabular-nums text-text-secondary">{row.itemCount}</dd>
            </div>
            <div>
              <dt className="flex items-center gap-1 text-[9px] font-medium uppercase tracking-[0.14em] text-text-faint">
                <Store className="size-3 text-gold/70" aria-hidden />
                Sucursales
              </dt>
              <dd className="mt-1 font-mono text-lg tabular-nums text-text-secondary">{row.restaurantCount}</dd>
            </div>
          </dl>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-40">
          <div
            className="flex aspect-[4/3] items-center justify-center rounded-xl border border-border-main bg-bg-solid/90 shadow-inner"
            aria-hidden
          >
            <LayoutTemplate className="size-10 text-gold/25 transition-colors group-hover:text-gold/45" strokeWidth={1} />
          </div>
          <p className="text-center text-[9px] uppercase leading-snug tracking-[0.12em] text-text-faint">
            Vista previa editorial
          </p>
        </div>
      </div>

      <div className="relative mt-6 flex flex-wrap gap-2 border-t border-border-main/60 pt-5">
        <span className="inline-flex items-center gap-1.5 rounded-lg border border-border-mid bg-bg-solid/60 px-3 py-1.5 font-mono text-[10px] text-text-dim">
          ID {row.id.slice(0, 8)}…
        </span>
        <span className="inline-flex items-center gap-1.5 text-[11px] text-text-dim">
          <ChefHat className="size-3.5 shrink-0 text-gold/60" aria-hidden />
          Sincroniza con POS y menú digital
        </span>
      </div>
    </motion.article>
  );
}

function EmptyAtelier({ chainName, onCreate }: { chainName: string; onCreate: (name: string) => Promise<void> }) {
  const reduceMotion = useReducedMotion();
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr("");
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onCreate(name.trim());
      setName("");
    } catch (e) {
      setErr(e instanceof Error ? e.message : "No se pudo crear. Intenta de nuevo.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-3xl border border-dashed border-border-bright/55 bg-gradient-to-b from-bg-card/50 to-bg-solid px-6 py-16 text-center sm:px-12 sm:py-20"
    >
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06]">
        <BookMarked className="size-[min(72vw,380px)] text-gold" strokeWidth={0.35} aria-hidden />
      </div>
      <div className="relative mx-auto max-w-md space-y-6">
        <div className="mx-auto flex size-16 items-center justify-center rounded-2xl border border-border-main bg-bg-bar/90 shadow-[0_0_36px_-10px_rgba(201,160,84,0.35)]">
          <LayoutTemplate className="size-7 text-gold" aria-hidden />
        </div>
        <div>
          <p className="font-mono text-[10px] uppercase tracking-[0.26em] text-text-faint">Biblioteca corporativa</p>
          <h2 className="mt-3 font-serif text-2xl text-text-primary sm:text-3xl">
            <em className="not-italic text-gold">{chainName}</em> aún no publica plantillas.
          </h2>
          <p className="mt-3 text-[13px] leading-relaxed text-text-muted">
            Las plantillas centralizan categorías y platillos para que cada sucursal arranque con el mismo ADN de
            carta. Crea la primera y luego edítala desde tu flujo de contenido.
          </p>
        </div>
        <form onSubmit={submit} className="space-y-3 text-left">
          <label htmlFor="tpl-name" className="sr-only">
            Nombre de la plantilla
          </label>
          <input
            id="tpl-name"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setErr("");
            }}
            placeholder="Ej. Menú estándar 2026"
            className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-3 text-[13px] text-text-primary outline-none transition-colors placeholder:text-text-faint focus:border-gold/50 focus:ring-1 focus:ring-gold/25"
          />
          {err ? <p className="text-center text-[11px] text-dash-red">{err}</p> : null}
          <button
            type="submit"
            disabled={busy || !name.trim()}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-gold/40 bg-gold-faint/50 py-3 text-[12px] font-semibold text-gold transition-colors hover:border-gold/60 hover:bg-gold-faint/80 disabled:opacity-45"
          >
            {busy ? (
              <span className="size-3.5 animate-spin rounded-full border-2 border-gold border-t-transparent" />
            ) : (
              <Plus className="size-4" aria-hidden />
            )}
            {busy ? "Creando…" : "Crear primera plantilla"}
          </button>
        </form>
        <Link
          href="/cadena"
          className="inline-flex items-center justify-center gap-2 text-[11px] text-text-dim transition-colors hover:text-gold"
        >
          <ArrowLeft className="size-3.5" aria-hidden />
          Volver al panel maestro
        </Link>
      </div>
    </motion.div>
  );
}

export default function ChainMenuTemplatesAtelier({ initialTenantId }: { initialTenantId?: string }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [data, setData] = useState<ChainMenuTemplatesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [formError, setFormError] = useState("");
  const reduceMotion = useReducedMotion();

  const load = useCallback(async (tid: string) => {
    try {
      setLoading(true);
      const res = await getChainMenuTemplates(tid);
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
      const iv = setInterval(() => load(tenantId), 60000);
      return () => clearInterval(iv);
    }
  }, [tenantId, load]);

  const totals = useMemo(() => {
    const t = data?.templates ?? [];
    return {
      templates: t.length,
      items: t.reduce((a, r) => a + r.itemCount, 0),
      restaurantsOnTemplate: t.reduce((a, r) => a + r.restaurantCount, 0),
    };
  }, [data?.templates]);

  const handleCreate = async (name: string) => {
    if (!tenantId) return;
    const res = await createChainMenuTemplate({ chainId: tenantId, name });
    if (!res.success) throw new Error(res.error);
    await load(tenantId);
  };

  const submitBar = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    if (!tenantId || !newName.trim()) return;
    setCreating(true);
    const res = await createChainMenuTemplate({ chainId: tenantId, name: newName.trim() });
    setCreating(false);
    if (res.success) {
      setNewName("");
      await load(tenantId);
    } else {
      setFormError(res.error);
    }
  };

  if (!tenantId) {
    return <ChainAuthGuard tenantId={initialTenantId} onAuthenticated={(tid) => setTenantId(tid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-bg-solid px-4 text-text-dim">
        <motion.div
          animate={reduceMotion ? {} : { rotate: [0, 6, -6, 0] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          className="text-gold/35"
          aria-hidden
        >
          <BookMarked className="size-12" strokeWidth={1} />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[0.22em]">Abriendo biblioteca de cartas…</p>
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

  const templates = data.templates;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-solid font-sans text-text-primary">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute left-1/2 top-0 h-[min(85vh,640px)] w-[min(140vw,920px)] -translate-x-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(201,160,84,0.11),transparent_62%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[42vh] w-[55vw] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(68,114,160,0.07),transparent_58%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `linear-gradient(0deg, transparent 24px, var(--color-border-mid) 24px, var(--color-border-mid) 25px, transparent 25px)`,
            backgroundSize: "100% 25px",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-5xl px-4 pb-24 pt-10 md:px-8 md:pt-14">
        <ChefAIAssistant />
        <motion.header
          initial={reduceMotion ? false : { opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className="mb-10 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between"
        >
          <div className="max-w-2xl space-y-4">
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-faint">Estandarización · Menú</p>
              <h1 className="mt-2 font-serif text-[clamp(1.85rem,4.5vw,3rem)] font-semibold leading-[1.06] tracking-tight">
                Plantillas de{" "}
                <span className="bg-gradient-to-r from-gold via-[#dfc08f] to-gold-dim bg-clip-text text-transparent">
                  {data.chain.name}
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-text-muted">
                Un solo lugar para ver qué cartas existen en la cadena, cuánto pesan en sucursales y cuándo se
                actualizaron por última vez.
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
          </div>
        </motion.header>

        {templates.length > 0 ? (
          <motion.form
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={submitBar}
            className="mb-10 space-y-2 rounded-2xl border border-border-main bg-bg-card/40 p-4 backdrop-blur-md"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-2">
                <Plus className="size-4 shrink-0 text-gold/70" aria-hidden />
                <input
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setFormError("");
                  }}
                  placeholder="Nombre de una nueva plantilla…"
                  className="min-w-0 flex-1 border-0 bg-transparent text-[13px] text-text-primary outline-none placeholder:text-text-faint"
                />
              </div>
              <button
                type="submit"
                disabled={creating || !newName.trim()}
                className="shrink-0 rounded-xl border border-gold/45 bg-gold-faint/40 px-5 py-2.5 text-[12px] font-semibold text-gold transition-colors hover:bg-gold-faint/70 disabled:opacity-45"
              >
                {creating ? "Creando…" : "Nueva plantilla"}
              </button>
            </div>
            {formError ? <p className="text-[11px] text-dash-red">{formError}</p> : null}
          </motion.form>
        ) : null}

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.06 }}
          className="mb-12 grid gap-4 sm:grid-cols-3"
        >
          {[
            { label: "Plantillas vivas", value: String(totals.templates), sub: "Versiones de carta" },
            { label: "Platillos indexados", value: String(totals.items), sub: "En todas las plantillas" },
            {
              label: "Sucursales ancladas",
              value: String(totals.restaurantsOnTemplate),
              sub: "Usan alguna plantilla",
            },
          ].map((k, i) => (
            <div
              key={k.label}
              className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm"
            >
              <p className="text-[9px] font-medium uppercase tracking-[0.2em] text-text-faint">{k.label}</p>
              <p className="mt-2 font-serif text-2xl text-text-primary">{k.value}</p>
              <p className="mt-1 text-[11px] text-text-dim">{k.sub}</p>
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-gold/70 to-transparent"
                initial={reduceMotion ? false : { width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: reduceMotion ? 0 : 0.1 + i * 0.06, duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ))}
        </motion.div>

        {templates.length === 0 ? (
          <EmptyAtelier chainName={data.chain.name} onCreate={handleCreate} />
        ) : (
          <div className="space-y-6">
            <div className="flex items-end justify-between gap-4 border-b border-border-main pb-4">
              <div>
                <h2 className="font-serif text-xl text-text-primary">Catálogo de plantillas</h2>
                <p className="mt-1 text-[12px] text-text-dim">Orden: por defecto primero, luego por última edición.</p>
              </div>
            </div>
            <ul className="flex list-none flex-col gap-6 p-0">
              {templates.map((row, index) => (
                <li key={row.id}>
                  <TemplateCard row={row} index={index} reduceMotion={reduceMotion} />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
