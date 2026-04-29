"use client";

import { useMemo, useState, useTransition } from "react";
import { UserPlus, Trash2, Eye, EyeOff, Search } from "lucide-react";
import { createStaffMember, deleteStaffMember, toggleStaffStatus } from "@/actions/staff";
// TODO: migrar a AppUser + UserRole
type Staff = { 
  id: string; 
  name: string; 
  role: string; 
  email?: string | null; 
  isActive: boolean; 
  createdAt: Date; 
  updatedAt: Date;
  pin: string;
};

/* ── Role config ─────────────────────────────────────────────────── */
type Role = "ADMIN" | "MESERO" | "COCINA" | "BARRA";

const ROLE_CONFIG: Record<Role, {
  label: string;
  avatarBg: string;
  avatarText: string;
  badgeBorder: string;
  badgeText: string;
  cardBorder: string;
}> = {
  ADMIN:  {
    label:       "Admin",
    avatarBg:    "bg-glow/15",
    avatarText:  "text-glow",
    badgeBorder: "border-glow/35",
    badgeText:   "text-glow",
    cardBorder:  "border-glow/20 hover:border-glow/40",
  },
  MESERO: {
    label:       "Mesero",
    avatarBg:    "bg-sage-deep/15",
    avatarText:  "text-sage-deep",
    badgeBorder: "border-sage-deep/35",
    badgeText:   "text-sage-deep",
    cardBorder:  "border-sage-deep/20 hover:border-sage-deep/40",
  },
  COCINA: {
    label:       "Cocina",
    avatarBg:    "bg-ember/15",
    avatarText:  "text-ember",
    badgeBorder: "border-ember/35",
    badgeText:   "text-ember",
    cardBorder:  "border-ember/20 hover:border-ember/40",
  },
  BARRA: {
    label:       "Barra",
    avatarBg:    "bg-light/[0.07]",
    avatarText:  "text-light",
    badgeBorder: "border-wire",
    badgeText:   "text-dim",
    cardBorder:  "border-wire hover:border-light/20",
  },
};

const ALL_ROLES: Role[] = ["ADMIN", "MESERO", "COCINA", "BARRA"];

/* ── Helpers ─────────────────────────────────────────────────────── */
function initials(name: string) {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

/* ── Card component ──────────────────────────────────────────────── */
function StaffCard({
  member,
  onToggle,
  onDelete,
}: {
  member: Staff;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const [showPin, setShowPin] = useState(false);
  const cfg = ROLE_CONFIG[member.role as Role] ?? ROLE_CONFIG.BARRA;

  return (
    <div
      className={[
        "group flex flex-col border bg-canvas transition-all duration-200",
        cfg.cardBorder,
        !member.isActive ? "opacity-60" : "",
      ].join(" ")}
    >
      {/* Card top */}
      <div className="flex items-center gap-4 flex-1">

        {/* Avatar */}
        <div className={[
          "flex h-14 w-14 items-center justify-center border font-serif text-[1.5rem] font-semibold",
          cfg.avatarBg, cfg.avatarText,
          member.isActive ? cfg.badgeBorder : "border-wire",
        ].join(" ")}>
          {initials(member.name)}
        </div>

        {/* Name */}
        <div className="text-center">
          <p className="text-[0.9rem] font-semibold leading-tight text-light">
            {member.name}
          </p>

          {/* Role badge */}
          <span className={[
            "mt-1.5 inline-flex items-center border px-2 py-0.5 text-[0.52rem] font-bold uppercase tracking-[0.22em]",
            cfg.badgeBorder, cfg.badgeText,
          ].join(" ")}>
            {cfg.label}
          </span>
        </div>
      </div>

      {/* PIN row */}
      <div className="flex items-center justify-between border-t border-wire px-5 py-3">
        <div>
          <p className="text-[0.48rem] font-bold uppercase tracking-[0.3em] text-dim/50">PIN acceso</p>
          <p className="mt-0.5 font-mono text-[0.9rem] font-semibold tracking-[0.22em] text-light">
            {showPin ? member.pin : "• • • •"}
          </p>
        </div>
        <button
          onClick={() => setShowPin(v => !v)}
          aria-label={showPin ? "Ocultar PIN" : "Mostrar PIN"}
          className="flex h-8 w-8 items-center justify-center text-dim/50 transition-colors hover:text-light"
        >
          {showPin
            ? <EyeOff className="h-3.5 w-3.5" aria-hidden="true" />
            : <Eye    className="h-3.5 w-3.5" aria-hidden="true" />}
        </button>
      </div>

      {/* Footer actions */}
      <div className="flex items-center justify-between border-t border-wire px-4 py-3">
        {/* Status toggle */}
        <button
          onClick={onToggle}
          className={[
            "flex items-center gap-2 border px-3 py-1.5 text-[0.58rem] font-bold uppercase tracking-[0.2em] transition-all",
            member.isActive
              ? "border-sage-deep/35 text-sage-deep hover:border-ember/35 hover:text-ember"
              : "border-wire text-dim hover:border-sage-deep/35 hover:text-sage-deep",
          ].join(" ")}
          title={member.isActive ? "Desactivar" : "Activar"}
        >
          <span className={[
            "h-1.5 w-1.5 rounded-full transition-colors",
            member.isActive ? "bg-sage-deep" : "bg-dim/50",
          ].join(" ")} aria-hidden="true" />
          {member.isActive ? "Activo" : "Inactivo"}
        </button>

        {/* Delete */}
        <button
          onClick={onDelete}
          aria-label={`Eliminar a ${member.name}`}
          className="flex h-8 w-8 items-center justify-center border border-wire text-dim/50 transition-colors hover:border-ember/40 hover:text-ember"
        >
          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

/* ── Main component ──────────────────────────────────────────────── */
export default function StaffManager({ initialStaff }: { initialStaff: Staff[] }) {
  const [staff, setStaff]           = useState<Staff[]>(initialStaff);
  const [isPending, startTransition] = useTransition();
  const [isCreating, setIsCreating] = useState(false);
  const [search, setSearch]         = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "Todos">("Todos");

  /* Create form state */
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<Role>("MESERO");
  const [newPin, setNewPin]   = useState("");

  /* ── Handlers ──────────────────────────────────────────────────── */
  function handleDelete(id: string) {
    const backup = [...staff];
    setStaff(staff.filter(s => s.id !== id));
    startTransition(async () => {
      try { await deleteStaffMember(id); }
      catch { setStaff(backup); }
    });
  }

  function handleToggleStatus(id: string, currentStatus: boolean) {
    const backup = [...staff];
    setStaff(staff.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
    startTransition(async () => {
      try { await toggleStaffStatus(id, currentStatus); }
      catch { setStaff(backup); }
    });
  }

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newName.trim() || newPin.length !== 4) return;

    const fakeId = "optimistic-" + Date.now();
    const optimistic: Staff = {
      id: fakeId,
      name: newName.trim(), role: newRole, pin: newPin,
      isActive: true, createdAt: new Date(), updatedAt: new Date(),
    };

    setStaff(prev => [...prev, optimistic]);
    setIsCreating(false);
    setNewName(""); setNewPin("");

    startTransition(async () => {
      try {
        const created = (await createStaffMember({ name: optimistic.name, role: newRole, pin: newPin })) as unknown as Staff;
        setStaff(prev => prev.map(s => s.id === fakeId ? created : s));
      } catch {
        setStaff(prev => prev.filter(s => s.id !== fakeId));
      }
    });
  }

  /* ── Derived data ──────────────────────────────────────────────── */
  const staffStats = useMemo(() => {
    let activos = 0, inactivos = 0;
    for (const s of staff) { if (s.isActive) activos++; else inactivos++; }
    return [
      { label: "Total",     value: staff.length },
      { label: "Activos",   value: activos      },
      { label: "Inactivos", value: inactivos    },
    ];
  }, [staff]);

  const roleCounts = useMemo(() => {
    const counts: Record<string, number> = { Todos: staff.length };
    for (const s of staff) counts[s.role] = (counts[s.role] ?? 0) + 1;
    return counts;
  }, [staff]);

  const filtered = useMemo(() =>
    staff.filter(s =>
      (roleFilter === "Todos" || s.role === roleFilter) &&
      s.name.toLowerCase().includes(search.toLowerCase())
    ),
    [staff, roleFilter, search],
  );

  /* ─────────────────────────────────────────────────────────────── */
  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12">

      {/* ── Header ────────────────────────────────────────────── */}
      <div
        className="mb-10 border-b border-wire pb-8"
        style={{ animation: "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}
      >
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
          Gestión de equipo
        </p>
        <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
            Personal & accesos
          </h1>
          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-dim/50" aria-hidden="true" />
              <input
                type="text"
                placeholder="Buscar empleado…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="h-10 w-44 border border-wire bg-transparent pl-8 pr-3 text-[0.78rem] text-light placeholder:text-dim/40 outline-none transition-colors focus:border-light/20"
              />
            </div>
            <button
              onClick={() => setIsCreating(true)}
              className="inline-flex h-10 items-center gap-2 border border-wire px-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-all hover:border-light/20 hover:text-light hover:-translate-y-px active:translate-y-0"
            >
              <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
              Agregar
            </button>
          </div>
        </div>
      </div>

      {/* ── Stats strip ───────────────────────────────────────── */}
      <div className="mb-10 grid grid-cols-3 divide-x divide-wire border border-wire">
        {staffStats.map(({ label, value }, i) => (
          <div
            key={label}
            className="px-6 py-5"
            style={{ animation: `dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.08 + i * 0.06}s both` }}
          >
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">{label}</p>
            <p className="mt-1 font-serif text-[2rem] font-semibold leading-none text-light">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Modal: Nuevo empleado ─────────────────────────────── */}
      {isCreating && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-6 backdrop-blur-sm"
          style={{ animation: "fade-in 0.2s ease-out both" }}
        >
          <div
            className="w-full max-w-md border border-wire bg-canvas p-8"
            style={{ animation: "scale-in 0.3s cubic-bezier(0.22,1,0.36,1) both" }}
          >
            <p className="mb-1 text-[0.52rem] font-bold uppercase tracking-[0.44em] text-dim">Registro</p>
            <h2 className="mb-8 font-serif text-[1.6rem] font-medium leading-none text-light">Nuevo empleado</h2>

            <form onSubmit={handleCreate} className="flex flex-col gap-6">
              {/* Name */}
              <div>
                <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">
                  Nombre completo
                </label>
                <input
                  required
                  type="text"
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ej. José Pérez"
                  className="h-10 w-full border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30"
                />
              </div>

              {/* Role selector */}
              <div>
                <label className="mb-3 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">Rol</label>
                <div className="grid grid-cols-2 gap-2">
                  {ALL_ROLES.map(role => {
                    const cfg = ROLE_CONFIG[role];
                    const active = newRole === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setNewRole(role)}
                        className={[
                          "flex items-center gap-2.5 border px-4 py-3 text-left transition-all",
                          active
                            ? [cfg.badgeBorder, cfg.avatarBg, cfg.badgeText].join(" ")
                            : "border-wire text-dim hover:border-light/20 hover:text-light",
                        ].join(" ")}
                      >
                        <span className={[
                          "flex h-8 w-8 shrink-0 items-center justify-center border font-serif text-[0.85rem] font-bold",
                          active ? [cfg.badgeBorder, cfg.avatarBg, cfg.avatarText].join(" ") : "border-wire/50 bg-ink/40 text-dim",
                        ].join(" ")}>
                          {cfg.label.charAt(0)}
                        </span>
                        <div>
                          <p className="text-[0.72rem] font-bold">{cfg.label}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* PIN */}
              <div>
                <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">
                  PIN de acceso (4 dígitos)
                </label>
                <input
                  required
                  type="text"
                  inputMode="numeric"
                  pattern="\d{4}"
                  maxLength={4}
                  value={newPin}
                  onChange={e => setNewPin(e.target.value.replace(/\D/g, "").slice(0, 4))}
                  placeholder="1234"
                  className="h-10 w-full border border-wire bg-transparent px-3 font-mono text-[0.9rem] tracking-[0.4em] text-light outline-none transition-colors focus:border-light/30"
                />
                <p className="mt-1.5 text-[0.58rem] font-medium text-dim/50">
                  El empleado usará este PIN para autenticarse en el sistema.
                </p>
              </div>

              <div className="flex gap-3 border-t border-wire/50 pt-2">
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setNewName(""); setNewPin(""); }}
                  className="flex-1 border border-wire py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isPending || !newName.trim() || newPin.length !== 4}
                  className="flex-1 bg-light py-3 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-ink transition-all hover:-translate-y-px hover:bg-light/90 disabled:opacity-50"
                >
                  {isPending ? "Guardando…" : "Crear empleado"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Role filter tabs ───────────────────────────────────── */}
      <div
        className="mb-8 flex overflow-x-auto border-b border-wire scrollbar-hide"
        style={{ animation: "fade-in 0.4s ease-out 0.15s both" }}
      >
        {(["Todos", ...ALL_ROLES] as (Role | "Todos")[]).map(role => {
          const label = role === "Todos" ? "Todos" : ROLE_CONFIG[role].label;
          const count = roleCounts[role] ?? 0;
          const active = roleFilter === role;
          return (
            <button
              key={role}
              onClick={() => setRoleFilter(role)}
              className={[
                "shrink-0 whitespace-nowrap px-5 pb-3 pt-2 transition-colors",
                active ? "border-b-[1.5px] border-glow text-glow" : "text-dim hover:text-light",
              ].join(" ")}
            >
              <span className="text-[0.65rem] font-bold uppercase tracking-[0.22em]">{label}</span>
              <span className={[
                "ml-1.5 text-[0.55rem] font-semibold tabular-nums",
                active ? "text-glow/60" : "text-dim/40",
              ].join(" ")}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Staff grid ────────────────────────────────────────── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center border border-dashed border-wire py-20">
          <p className="text-[0.8rem] font-medium text-dim">
            {search ? "No se encontraron empleados." : "Sin empleados en este rol."}
          </p>
          {search && (
            <button
              onClick={() => setSearch("")}
              className="mt-3 text-[0.72rem] font-semibold text-glow underline underline-offset-4"
            >
              Limpiar búsqueda
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col border-t border-wire divide-y divide-wire mt-4">
          {filtered.map((member, i) => (
            <div
              key={member.id}
              style={{
                animation: `dash-row-enter 0.35s cubic-bezier(0.22,1,0.36,1) ${0.12 + Math.min(i * 0.05, 0.3)}s both`,
              }}
            >
              <StaffCard
                member={member}
                onToggle={() => handleToggleStatus(member.id, member.isActive)}
                onDelete={() => handleDelete(member.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
