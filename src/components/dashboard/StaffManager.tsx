"use client";

import { useState, useTransition } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { createStaffMember, deleteStaffMember, toggleStaffStatus } from "@/actions/staff";
import { Staff } from "@/generated/prisma";

export default function StaffManager({ initialStaff }: { initialStaff: Staff[] }) {
  const [staff, setStaff] = useState<Staff[]>(initialStaff);
  const [isPending, startTransition] = useTransition();

  // Create form state
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<"ADMIN" | "MESERO" | "COCINA" | "BARRA">("MESERO");
  const [newPin, setNewPin] = useState("");

  function handleDelete(id: string) {
    const backup = [...staff];
    setStaff(staff.filter(s => s.id !== id));
    
    startTransition(async () => {
        try {
            await deleteStaffMember(id);
        } catch {
            setStaff(backup);
        }
    });
  }
  
  function handleToggleStatus(id: string, currentStatus: boolean) {
      const backup = [...staff];
      setStaff(staff.map(s => s.id === id ? { ...s, isActive: !currentStatus } : s));
      
      startTransition(async () => {
          try {
              await toggleStaffStatus(id, currentStatus);
          } catch {
              setStaff(backup);
          }
      });
  }
  
  function handleCreate(e: React.FormEvent) {
      e.preventDefault();
      if (!newName || !newPin) return;
      
      // Fake optimistic object
      const fakeId = "optimistic-" + Date.now();
      const optimisticObj: Staff = {
          id: fakeId,
          restaurantId: "",
          name: newName,
          role: newRole,
          pin: newPin,
          isActive: true,
          createdAt: new Date(),
      };
      
      setStaff([...staff, optimisticObj]);
      setIsCreating(false);
      setNewName("");
      setNewPin("");
      
      startTransition(async () => {
          try {
              const created = await createStaffMember({ name: optimisticObj.name, role: optimisticObj.role as "MESERO" | "COCINA" | "BARRA" | "ADMIN", pin: optimisticObj.pin });
              setStaff(prev => prev.map(s => s.id === fakeId ? created : s));
          } catch {
              setStaff(prev => prev.filter(s => s.id !== fakeId));
          }
      });
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
          <button 
            onClick={() => setIsCreating(true)}
            className="inline-flex h-10 items-center gap-2 border border-wire px-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light self-start sm:self-auto"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Agregar empleado
          </button>
        </div>
      </div>

      {/* ── Stats strip ─────────────────────────────────────── */}
      <div className="mb-10 grid grid-cols-3 divide-x divide-wire border border-wire">
        {[
          { label: "Total",    value: staff.length                          },
          { label: "Activos",  value: staff.filter(s => s.isActive).length    },
          { label: "Inactivos",value: staff.filter(s => !s.isActive).length   },
        ].map(({ label, value }, i) => (
          <div key={label} className="px-6 py-5" style={{ animation: `dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) ${0.1 + i * 0.06}s both` }}>
            <p className="text-[0.56rem] font-bold uppercase tracking-[0.28em] text-dim">{label}</p>
            <p className="mt-1 font-serif text-[2rem] font-semibold leading-none text-light">{value}</p>
          </div>
        ))}
      </div>

      {/* ── Create Form ─────────────────────────────────────── */}
      {isCreating && (
        <form onSubmit={handleCreate} className="mb-10 border border-wire p-6" style={{ animation: "reveal-up 0.4s cubic-bezier(0.22,1,0.36,1) both" }}>
            <p className="mb-6 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-light">Nuevo empleado</p>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                    <label className="mb-2 block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-dim">Nombre</label>
                    <input 
                        type="text" 
                        value={newName} 
                        onChange={e => setNewName(e.target.value)} 
                        required 
                        className="w-full border-b border-wire bg-transparent pb-2 text-[0.85rem] text-light outline-none focus:border-glow focus:text-glow" 
                        placeholder="Ej: Jose Pérez"
                    />
                </div>
                <div>
                    <label className="mb-2 block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-dim">Rol</label>
                    <select 
                        value={newRole} 
                        onChange={e => setNewRole(e.target.value as "MESERO" | "COCINA" | "BARRA" | "ADMIN")} 
                        className="w-full border-b border-wire bg-transparent pb-2 text-[0.85rem] text-light outline-none focus:border-glow focus:text-glow"
                    >
                        <option value="MESERO" className="bg-ink text-light">Mesero</option>
                        <option value="COCINA" className="bg-ink text-light">Cocina</option>
                        <option value="BARRA" className="bg-ink text-light">Barra</option>
                        <option value="ADMIN" className="bg-ink text-light">Administrador</option>
                    </select>
                </div>
                <div>
                    <label className="mb-2 block text-[0.6rem] font-bold uppercase tracking-[0.2em] text-dim">PIN (4 dígitos)</label>
                    <input 
                        type="text" 
                        value={newPin} 
                        onChange={e => setNewPin(e.target.value)} 
                        required 
                        maxLength={4}
                        className="w-full border-b border-wire bg-transparent pb-2 font-mono text-[0.85rem] text-light outline-none focus:border-glow focus:text-glow" 
                        placeholder="1234"
                    />
                </div>
            </div>
            <div className="mt-8 flex justify-end gap-4">
                <button type="button" onClick={() => setIsCreating(false)} className="text-[0.65rem] font-bold uppercase tracking-[0.2em] text-dim hover:text-light">Cancelar</button>
                <button type="submit" disabled={isPending} className="border border-wire px-6 py-2 text-[0.65rem] font-bold uppercase tracking-[0.2em] text-light hover:border-light/30 disabled:opacity-50">Guardar</button>
            </div>
        </form>
      )}
      
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
                member.isActive
                  ? "border-sage-deep/40 text-sage-deep"
                  : "border-wire text-dim",
              ].join(" ")}>
                <span className={`h-1.5 w-1.5 rounded-full ${member.isActive ? "bg-sage-deep" : "bg-dim"}`} aria-hidden="true" />
                <button onClick={() => handleToggleStatus(member.id, member.isActive)} className="hover:underline">{member.isActive ? "Activo" : "Inactivo"}</button>
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 opacity-100 transition-opacity duration-150 lg:opacity-0 lg:group-hover:opacity-100">
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
