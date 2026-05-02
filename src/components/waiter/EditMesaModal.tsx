"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Circle as CircleIcon, Hexagon, Square, Save, Trash2 } from "lucide-react";
import { deleteTable } from "@/actions/tables";

interface EditMesaModalProps {
  table: {
    id: string;
    number: number;
    capacity: number;
    shape: string;
  } | null;
  open: boolean;
  onClose: () => void;
  onSave: (tableId: string, data: { shape: string; capacity: number; number: number }) => void;
  onDelete: (tableId: string) => void;
}

const SHAPES = [
  { id: "round", label: "Redonda", icon: CircleIcon },
  { id: "hexagon", label: "Hexágono", icon: Hexagon },
  { id: "rect", label: "Rectangular", icon: Square },
];

const CAPACITIES = [2, 4, 6, 8, 10, 12, 16, 20];

export function EditMesaModal({ table, open, onClose, onSave, onDelete }: EditMesaModalProps) {
  const [shape, setShape] = useState(table?.shape ?? "rect");
  const [capacity, setCapacity] = useState(table?.capacity ?? 4);
  const [name, setName] = useState(table ? String(table.number) : "");
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  if (!open || !table) return null;

  const handleSave = async () => {
    setSaving(true);
    await onSave(table.id, { shape, capacity, number: parseInt(name) || table.number });
    setSaving(false);
    onClose();
  };

  const handleDelete = async () => {
    setDeleting(true);
    await onDelete(table.id);
    setDeleting(false);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-xl"
          />
          <motion.div
            role="dialog"
            aria-labelledby="edit-mesa-title"
            aria-modal="true"
            initial={{ opacity: 0, scale: 0.94, y: 14 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 14 }}
            transition={{ type: "spring", stiffness: 320, damping: 28 }}
            className="relative z-10 w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-white/[0.06] bg-bg-card/95 shadow-[0_40px_80px_-24px_rgba(0,0,0,0.85)] backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="relative overflow-hidden px-6 pb-4 pt-6">
              <div
                className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_100%_at_50%_-30%,rgba(244,114,182,0.08),transparent_55%)]"
                aria-hidden
              />
              <div className="pointer-events-none absolute inset-x-10 top-0 h-px bg-gradient-to-r from-transparent via-pink-glow/25 to-transparent" aria-hidden />
              <div className="relative flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-pink-glow/70">
                    Configuración
                  </span>
                  <h3 id="edit-mesa-title" className="mt-1 font-serif text-xl font-medium tracking-tight text-light">
                    Editar Mesa {table.number}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.06] bg-white/[0.02] text-dim transition-colors hover:border-white/[0.12] hover:text-light"
                  aria-label="Cerrar"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Form */}
            <div className="space-y-5 px-6 pb-6">
              {/* Shape selector */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-dim">Forma</p>
                <div className="flex gap-2">
                  {SHAPES.map(({ id, label, icon: Icon }) => {
                    const active = shape === id;
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setShape(id)}
                        className={`flex flex-1 flex-col items-center gap-1.5 rounded-xl border py-3 transition-all ${
                          active
                            ? "border-pink-glow/30 bg-pink-glow/[0.06] text-pink-glow shadow-[0_0_12px_-4px_rgba(244,114,182,0.2)]"
                            : "border-white/[0.06] bg-white/[0.01] text-dim hover:border-white/[0.12] hover:text-light"
                        }`}
                      >
                        <Icon className="h-5 w-5" />
                        <span className="text-[9px] font-semibold">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Capacity selector */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-dim">Capacidad</p>
                <div className="grid grid-cols-4 gap-2">
                  {CAPACITIES.map((cap) => {
                    const active = capacity === cap;
                    return (
                      <button
                        key={cap}
                        type="button"
                        onClick={() => setCapacity(cap)}
                        className={`rounded-xl border py-2.5 text-center font-mono text-sm font-bold tabular-nums transition-all ${
                          active
                            ? "border-pink-glow/30 bg-pink-glow/[0.06] text-pink-glow"
                            : "border-white/[0.06] bg-white/[0.01] text-dim hover:border-white/[0.12] hover:text-light"
                        }`}
                      >
                        {cap}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Number / name */}
              <div className="space-y-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-dim">Número</p>
                <input
                  type="number"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-11 w-full rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 text-sm text-light outline-none transition-all focus:border-pink-glow/20 focus:bg-white/[0.04] focus:ring-2 focus:ring-pink-glow/8"
                  min={1}
                  max={999}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleDelete}
                  disabled={deleting}
                  className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/[0.04] text-[11px] font-bold uppercase tracking-[0.1em] text-red-400 transition-colors hover:bg-red-500/10 disabled:opacity-50"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  {deleting ? "Eliminando…" : "Eliminar"}
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={saving}
                  className="flex h-11 flex-[2] items-center justify-center gap-2 rounded-xl bg-rose text-[11px] font-bold uppercase tracking-[0.1em] text-white shadow-[0_6px_20px_-6px_rgba(199,91,122,0.4)] transition-all hover:bg-rose-light active:scale-[0.98] disabled:opacity-50"
                >
                  <Save className="h-3.5 w-3.5" />
                  {saving ? "Guardando…" : "Guardar"}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
