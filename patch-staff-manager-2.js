const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/dashboard/StaffManager.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace active with isActive
content = content.replace(/s\.active/g, 's.isActive');
content = content.replace(/member\.active/g, 'member.isActive');

const createBtn = `<button className="inline-flex h-10 items-center gap-2 border border-wire px-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light self-start sm:self-auto">
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Agregar empleado
          </button>`;
          
const newCreateBtn = `<button 
            onClick={() => setIsCreating(true)}
            className="inline-flex h-10 items-center gap-2 border border-wire px-4 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-dim transition-colors hover:border-light/20 hover:text-light self-start sm:self-auto"
          >
            <UserPlus className="h-3.5 w-3.5" aria-hidden="true" />
            Agregar empleado
          </button>`;

content = content.replace(createBtn, newCreateBtn);


// Create a form inside the UI before the list
const listStart = `{/* ── Staff list ──────────────────────────────────────── */}`;

const createFormBlock = `{/* ── Create Form ─────────────────────────────────────── */}
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
                        onChange={e => setNewRole(e.target.value as any)} 
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
      
      {/* ── Staff list ──────────────────────────────────────── */}`;

content = content.replace(listStart, createFormBlock);


// Toggle status replace
const statusLabelOld = `{member.isActive ? "Activo" : "Inactivo"}`;
const statusLabelNew = `<button onClick={() => handleToggleStatus(member.id, member.isActive)} className="hover:underline">{member.isActive ? "Activo" : "Inactivo"}</button>`;
content = content.replace(statusLabelOld, statusLabelNew);

fs.writeFileSync(file, content);
