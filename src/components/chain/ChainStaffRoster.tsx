"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowLeft,
  KeyRound,
  MapPin,
  RefreshCw,
  Shield,
  Sparkles,
  UserCheck,
  UserCog,
  Users,
} from "lucide-react";
import {
  createChainStaffMember,
  getChainStaffList,
  setChainStaffActive,
} from "@/actions/chain";
import type { ChainStaffListData, ChainStaffRole, ChainStaffRow } from "@/actions/chain";
import ChainAuthGuard from "./ChainAuthGuard";

function fmtJoined(iso: string) {
  try {
    return new Date(iso).toLocaleDateString("es-MX", { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return "—";
  }
}

function roleLabel(role: ChainStaffRole) {
  return role === "CHAIN_ADMIN" ? "Administrador de cadena" : "Gerente de zona";
}

function StaffCard({
  row,
  index,
  reduceMotion,
  onToggle,
  toggling,
}: {
  row: ChainStaffRow;
  index: number;
  reduceMotion: boolean | null;
  onToggle: (row: ChainStaffRow) => void;
  toggling: boolean;
}) {
  const isAdmin = row.role === "CHAIN_ADMIN";

  return (
    <motion.article
      layout
      initial={reduceMotion ? false : { opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        type: "spring",
        stiffness: 420,
        damping: 36,
        delay: reduceMotion ? 0 : 0.04 * index,
      }}
      className={`group relative overflow-hidden rounded-2xl border bg-bg-card/55 p-6 shadow-[0_18px_60px_-34px_rgba(0,0,0,0.88)] backdrop-blur-sm transition-[border-color,box-shadow] duration-500 ${
        row.isActive
          ? "border-border-main hover:border-gold-dim/40"
          : "border-border-main/60 opacity-[0.72] hover:opacity-90"
      }`}
    >
      <div
        className="pointer-events-none absolute -right-16 top-0 size-40 rounded-full bg-gradient-to-br from-gold/12 to-transparent blur-2xl transition-opacity group-hover:opacity-100"
        aria-hidden
      />

      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                isAdmin
                  ? "border-gold/35 bg-gold-faint/40 text-gold"
                  : "border-dash-blue/30 bg-dash-blue-bg/50 text-dash-blue"
              }`}
            >
              {isAdmin ? <Shield className="size-3" aria-hidden /> : <MapPin className="size-3" aria-hidden />}
              {roleLabel(row.role)}
            </span>
            <span
              className={`rounded-full px-2 py-0.5 text-[9px] font-medium uppercase tracking-[0.12em] ${
                row.isActive ? "bg-dash-green-bg text-dash-green" : "bg-dash-red-bg text-dash-red"
              }`}
            >
              {row.isActive ? "Activo" : "Inactivo"}
            </span>
          </div>

          <div>
            <h2 className="font-serif text-xl font-semibold tracking-tight text-text-primary sm:text-2xl">{row.name}</h2>
            {!isAdmin && row.zoneName ? (
              <p className="mt-1.5 flex items-center gap-1.5 text-[12px] text-text-muted">
                <MapPin className="size-3.5 shrink-0 text-gold/70" aria-hidden />
                Territorio: <span className="font-medium text-text-secondary">{row.zoneName}</span>
              </p>
            ) : isAdmin ? (
              <p className="mt-1.5 text-[12px] text-text-muted">Acceso corporativo completo · PIN de consola cadena</p>
            ) : (
              <p className="mt-1.5 text-[12px] text-text-dim">Zona asignada sin nombre en catálogo</p>
            )}
            <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-text-faint">
              Alta {fmtJoined(row.createdAt)} · ID {row.id.slice(0, 8)}…
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:w-44">
          <div
            className="flex aspect-[5/3] items-center justify-center rounded-xl border border-border-main bg-bg-solid/90"
            aria-hidden
          >
            <UserCog
              className={`size-9 transition-colors ${isAdmin ? "text-gold/30 group-hover:text-gold/50" : "text-dash-blue/35 group-hover:text-dash-blue/55"}`}
              strokeWidth={1}
            />
          </div>
          <button
            type="button"
            disabled={toggling}
            onClick={() => onToggle(row)}
            className="rounded-xl border border-border-bright bg-bg-hover px-3 py-2 text-[11px] font-semibold text-text-secondary transition-colors hover:border-gold/35 hover:text-gold disabled:opacity-50"
          >
            {toggling ? "…" : row.isActive ? "Desactivar" : "Reactivar"}
          </button>
        </div>
      </div>
    </motion.article>
  );
}

export default function ChainStaffRoster({ initialTenantId }: { initialTenantId?: string }) {
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [data, setData] = useState<ChainStaffListData | null>(null);
  const [loading, setLoading] = useState(true);
  const [togglingId, setTogglingId] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);
  const [formError, setFormError] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<ChainStaffRole>("ZONE_MANAGER");
  const [newZoneId, setNewZoneId] = useState("");
  const [newPin, setNewPin] = useState("");
  const reduceMotion = useReducedMotion();

  const load = useCallback(async (tid: string) => {
    try {
      setLoading(true);
      const res = await getChainStaffList(tid);
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
      const iv = setInterval(() => load(tenantId), 55000);
      return () => clearInterval(iv);
    }
  }, [tenantId, load]);

  const totals = useMemo(() => {
    const s = data?.staff ?? [];
    return {
      total: s.length,
      admins: s.filter((x) => x.role === "CHAIN_ADMIN").length,
      zoneMgr: s.filter((x) => x.role === "ZONE_MANAGER").length,
      active: s.filter((x) => x.isActive).length,
    };
  }, [data?.staff]);

  const submitCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setFormError("");
    setCreating(true);
    const res = await createChainStaffMember({
      chainId: tenantId,
      name: newName,
      role: newRole,
      pin: newPin,
      zoneId: newRole === "ZONE_MANAGER" ? newZoneId || null : null,
    });
    setCreating(false);
    if (res.success) {
      setNewName("");
      setNewPin("");
      setNewZoneId("");
      setNewRole("ZONE_MANAGER");
      await load(tenantId);
    } else {
      setFormError(res.error);
    }
  };

  const handleToggle = async (row: ChainStaffRow) => {
    if (!tenantId) return;
    setTogglingId(row.id);
    const res = await setChainStaffActive({
      chainId: tenantId,
      staffId: row.id,
      isActive: !row.isActive,
    });
    setTogglingId(null);
    if (res.success) await load(tenantId);
  };

  if (!tenantId) {
    return <ChainAuthGuard tenantId={initialTenantId} onAuthenticated={(tid) => setTenantId(tid)} />;
  }

  if (loading && !data) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-4 bg-bg-solid px-4 text-text-dim">
        <motion.div
          animate={reduceMotion ? {} : { scale: [1, 1.04, 1] }}
          transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
          className="text-gold/35"
          aria-hidden
        >
          <Users className="size-12" strokeWidth={1} />
        </motion.div>
        <p className="text-[11px] uppercase tracking-[0.22em]">Cargando nómina corporativa…</p>
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

  const staff = data.staff;
  const zones = data.zones;
  const canAddZoneManager = zones.length > 0;

  return (
    <div className="relative min-h-screen overflow-hidden bg-bg-solid font-sans text-text-primary">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <div className="absolute right-0 top-0 h-[min(80vh,600px)] w-[min(100vw,720px)] rounded-full bg-[radial-gradient(ellipse_at_top_right,rgba(201,160,84,0.12),transparent_55%)] blur-3xl" />
        <div className="absolute bottom-0 left-0 h-[45vh] w-[60vw] rounded-full bg-[radial-gradient(ellipse_at_bottom_left,rgba(77,132,96,0.08),transparent_58%)] blur-3xl" />
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, var(--color-border-bright) 1px, transparent 0)`,
            backgroundSize: "28px 28px",
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
                href="/cadena"
                className="inline-flex items-center gap-2 rounded-full border border-border-main bg-bg-card/70 px-3 py-1.5 text-[10px] font-medium uppercase tracking-[0.18em] text-text-muted transition-colors hover:border-gold/30 hover:text-gold"
              >
                <ArrowLeft className="size-3" aria-hidden />
                Panel maestro
              </Link>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-dash-green/25 bg-dash-green-bg/35 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-dash-green">
                <Sparkles className="size-3" aria-hidden />
                Nómina &amp; accesos
              </span>
            </div>
            <div>
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-text-faint">Personal corporativo</p>
              <h1 className="mt-2 font-serif text-[clamp(1.85rem,4.5vw,3rem)] font-semibold leading-[1.06] tracking-tight">
                Equipo de{" "}
                <span className="bg-gradient-to-r from-gold via-[#dfc08f] to-gold-dim bg-clip-text text-transparent">
                  {data.chain.name}
                </span>
              </h1>
              <p className="mt-4 max-w-xl text-[13px] leading-relaxed text-text-muted">
                Administradores usan el PIN maestro en la consola de cadena. Los gerentes de zona acceden con su PIN a
                la vista de zona asignada. Los PIN no se muestran aquí.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => load(tenantId)}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 self-start rounded-xl border border-border-bright bg-bg-card px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.1em] text-text-secondary transition-colors hover:border-gold/35 hover:text-gold disabled:opacity-50"
          >
            <RefreshCw className={`size-3.5 ${loading ? "animate-spin" : ""}`} aria-hidden />
            {loading ? "Sincronizando" : "Refrescar"}
          </button>
        </motion.header>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: reduceMotion ? 0 : 0.05 }}
          className="mb-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {[
            { label: "Personas registradas", value: String(totals.total), icon: Users },
            { label: "Admins de cadena", value: String(totals.admins), icon: Shield },
            { label: "Gerentes de zona", value: String(totals.zoneMgr), icon: MapPin },
            { label: "Accesos activos", value: String(totals.active), icon: UserCheck },
          ].map((k, i) => (
            <div
              key={k.label}
              className="relative overflow-hidden rounded-2xl border border-border-main bg-bg-card/45 p-5 backdrop-blur-sm"
            >
              <k.icon className="absolute right-3 top-3 size-12 text-gold/10" aria-hidden />
              <p className="text-[9px] font-medium uppercase tracking-[0.18em] text-text-faint">{k.label}</p>
              <p className="mt-2 font-serif text-2xl text-text-primary">{k.value}</p>
              <motion.div
                className="absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-dash-green/60 to-transparent"
                initial={reduceMotion ? false : { width: "0%" }}
                animate={{ width: "100%" }}
                transition={{ delay: reduceMotion ? 0 : 0.08 + i * 0.05, duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          ))}
        </motion.div>

        <motion.section
          initial={reduceMotion ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 space-y-4 rounded-2xl border border-border-main bg-bg-card/40 p-5 backdrop-blur-md md:p-6"
          aria-labelledby="staff-add-heading"
        >
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 id="staff-add-heading" className="font-serif text-lg text-text-primary">
                Alta de miembro
              </h2>
              <p className="mt-1 text-[12px] text-text-dim">Asigna rol y, si aplica, la zona bajo su mando.</p>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] text-text-faint">
              <KeyRound className="size-3" aria-hidden />
              PIN solo en este formulario
            </div>
          </div>

          <form onSubmit={submitCreate} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label htmlFor="staff-name" className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                  Nombre visible
                </label>
                <input
                  id="staff-name"
                  value={newName}
                  onChange={(e) => {
                    setNewName(e.target.value);
                    setFormError("");
                  }}
                  required
                  placeholder="Ej. Mariana López"
                  className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 text-[13px] text-text-primary outline-none transition-colors placeholder:text-text-faint focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
                />
              </div>
              <div>
                <label htmlFor="staff-role" className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                  Rol
                </label>
                <select
                  id="staff-role"
                  value={newRole}
                  onChange={(e) => {
                    setNewRole(e.target.value as ChainStaffRole);
                    setFormError("");
                  }}
                  className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 text-[13px] text-text-primary outline-none focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
                >
                  <option value="ZONE_MANAGER">Gerente de zona</option>
                  <option value="CHAIN_ADMIN">Administrador de cadena</option>
                </select>
              </div>
            </div>

            {newRole === "ZONE_MANAGER" ? (
              <div>
                <label htmlFor="staff-zone" className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                  Zona asignada
                </label>
                <select
                  id="staff-zone"
                  value={newZoneId}
                  onChange={(e) => {
                    setNewZoneId(e.target.value);
                    setFormError("");
                  }}
                  required={newRole === "ZONE_MANAGER"}
                  disabled={!canAddZoneManager}
                  className="w-full rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 text-[13px] text-text-primary outline-none focus:border-gold/45 focus:ring-1 focus:ring-gold/20 disabled:opacity-50"
                >
                  <option value="">{canAddZoneManager ? "Selecciona territorio…" : "Sin zonas en la cadena"}</option>
                  {zones.map((z) => (
                    <option key={z.id} value={z.id}>
                      {z.name}
                    </option>
                  ))}
                </select>
                {!canAddZoneManager ? (
                  <p className="mt-2 text-[11px] text-text-dim">
                    Crea al menos una zona (p. ej. al dar de alta sucursales) antes de asignar gerentes territoriales.
                  </p>
                ) : null}
              </div>
            ) : null}

            <div>
              <label htmlFor="staff-pin" className="mb-1.5 block text-[10px] font-medium uppercase tracking-[0.14em] text-text-dim">
                PIN de acceso
              </label>
              <input
                id="staff-pin"
                type="password"
                inputMode="numeric"
                autoComplete="new-password"
                value={newPin}
                onChange={(e) => {
                  setNewPin(e.target.value);
                  setFormError("");
                }}
                required
                minLength={4}
                placeholder="Mínimo 4 caracteres"
                className="w-full max-w-md rounded-xl border border-border-bright bg-bg-solid px-4 py-2.5 font-mono text-[14px] tracking-[0.2em] text-text-primary outline-none placeholder:text-text-faint placeholder:tracking-normal focus:border-gold/45 focus:ring-1 focus:ring-gold/20"
              />
            </div>

            {formError ? <p className="text-[12px] text-dash-red">{formError}</p> : null}

            <button
              type="submit"
              disabled={
                creating ||
                !newName.trim() ||
                !newPin.trim() ||
                (newRole === "ZONE_MANAGER" && (!canAddZoneManager || !newZoneId))
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-gold/45 bg-gold-faint/45 px-6 py-2.5 text-[12px] font-semibold text-gold transition-colors hover:bg-gold-faint/75 disabled:opacity-45"
            >
              {creating ? <span className="size-3.5 animate-spin rounded-full border-2 border-gold border-t-transparent" /> : null}
              {creating ? "Registrando…" : "Registrar miembro"}
            </button>
          </form>
        </motion.section>

        <div className="space-y-5">
          <div className="flex items-end justify-between gap-4 border-b border-border-main pb-4">
            <div>
              <h2 className="font-serif text-xl text-text-primary">Roster autorizado</h2>
              <p className="mt-1 text-[12px] text-text-dim">Orden: rol y nombre.</p>
            </div>
          </div>

          {staff.length === 0 ? (
            <motion.div
              initial={reduceMotion ? false : { opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-2xl border border-dashed border-border-bright/50 bg-bg-card/30 px-6 py-14 text-center"
            >
              <Users className="mx-auto size-10 text-gold/25" aria-hidden />
              <p className="mt-4 font-serif text-lg text-text-secondary">Aún no hay personas en la nómina.</p>
              <p className="mx-auto mt-2 max-w-md text-[13px] text-text-dim">
                Usa el formulario de arriba para registrar al primer administrador o gerente de zona.
              </p>
            </motion.div>
          ) : (
            <ul className="flex list-none flex-col gap-5 p-0">
              {staff.map((row, index) => (
                <li key={row.id}>
                  <StaffCard
                    row={row}
                    index={index}
                    reduceMotion={reduceMotion}
                    onToggle={handleToggle}
                    toggling={togglingId === row.id}
                  />
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
