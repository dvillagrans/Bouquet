"use client";

import { useState } from "react";
import { UserPlus, Trash2, Edit2 } from "lucide-react";

type Role = "Administrador" | "Mesero" | "Cocina" | "Barra";

type StaffMember = {
  id: string;
  name: string;
  role: Role;
  pin: string;
  active: boolean;
};

const MOCK_STAFF: StaffMember[] = [
  { id: "1", name: "Carlos Dueñas", role: "Administrador", pin: "••••", active: true  },
  { id: "2", name: "Ana López",     role: "Mesero",        pin: "1234", active: true  },
  { id: "3", name: "Miguel Chef",   role: "Cocina",        pin: "5678", active: true  },
  { id: "4", name: "Luis Barman",   role: "Barra",         pin: "9012", active: false },
];

export default function StaffManager() {
  const [staff, setStaff] = useState<StaffMember[]>(MOCK_STAFF);

  function handleDelete(id: string) {
    setStaff(staff.filter(s => s.id !== id));
  }

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-10 border-b border-wire pb-8" style={{ animation: "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
          Gestión de equipo
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
            Personal & accesos
          </h1>
          <button className="inline-flex h-10 items-center gap-2 border border-wire px-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light self-start sm:self-auto">
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Agregar empleado
          </button>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <div className="mb-10 grid grid-cols-3 divide-x divide-wire border border-wire">
        {[
          { label: "Total",    value: staff.length                          },
          { label: "Activos",  value: staff.filter(s => s.active).length    },
          { label: "Inactivos",value: staff.filter(s => !s.active).length   },
        ].map(({ label, value }, i) => (
          <div key={label} className="px-6 py-5" style={{ animation: `dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s both` }}>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">{label}</p>
            <p className="mt-1 font-serif text-[2rem] font-semibold leading-none text-light">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Staff list ──────────────────────────────────────── */}
      <div className="divide-y divide-wire border-t border-wire">
        {staff.map((member, i) => (
          <div key={member.id} className="group flex items-center gap-4 py-4 transition-colors duration-150 hover:bg-ink/40 sm:gap-5" style={{ animation: `dash-row-enter 0.35s cubic-bezier(0.22,1,0.36,1) ${0.22 + Math.min(i * 0.06, 0.28)}s both` }}>

            {/* Initial */}
            <div className="flex h-10 w-10 shrink-0 items-center justify-center border border-wire text-[0.82rem] font-bold text-dim">
              {member.name.charAt(0)}
            </div>

            {/* Name + role */}
            <div className="flex-1 min-w-0">
              <p className="text-[0.85rem] font-semibold text-light">{member.name}</p>
              <p className="mt-0.5 text-[0.68rem] font-medium text-dim">{member.role}</p>
            </div>

            {/* PIN */}
            <div className="hidden w-28 shrink-0 sm:block">
              <p className="text-[0.55rem] font-bold uppercase tracking-[0.24em] text-dim">PIN acceso</p>
              <p className="mt-0.5 font-mono text-[0.9rem] font-semibold tracking-widest text-light">
                {member.pin}
              </p>
            </div>

            {/* Status */}
            <div className="w-24 shrink-0">
              <span className={[
                "inline-flex items-center gap-1.5 border px-2.5 py-1 text-[0.6rem] font-bold uppercase tracking-[0.2em]",
                member.active
                  ? "border-sage-deep/40 text-sage-deep"
                  : "border-wire text-dim",
              ].join(" ")}>
                <span className={`h-1.5 w-1.5 rounded-full ${member.active ? "bg-sage-deep" : "bg-dim"}`} aria-hidden="true" />
                {member.active ? "Activo" : "Inactivo"}
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-100 transition-opacity duration-150 lg:opacity-0 lg:group-hover:opacity-100">
              <button
                aria-label={`Editar a ${member.name}`}
                className="flex h-9 w-9 items-center justify-center border border-wire text-dim transition-colors hover:border-light/20 hover:text-light"
              >
                <Edit2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
              <button
                onClick={() => handleDelete(member.id)}
                aria-label={`Eliminar a ${member.name}`}
                className="flex h-9 w-9 items-center justify-center border border-wire text-dim transition-colors hover:border-ember/40 hover:text-ember"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
              </button>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}
