"use client";

import { useState } from "react";
import { Save } from "lucide-react";
import { updateRestaurantSettings } from "@/actions/restaurant";

export default function SettingsView({ initialSettings }: { initialSettings?: { id: string; allowWaiterJoinTables: boolean } }) {
  const [allowOrders,    setAllowOrders]    = useState(true);
  const [notifyWaiters, setNotifyWaiters] = useState(true);
  const [allowWaiterJoinTables, setAllowWaiterJoinTables] = useState(initialSettings?.allowWaiterJoinTables ?? false);

  const [isSaving, setIsSaving] = useState(false);

  async function handleSave() {
    if (!initialSettings?.id) return;
    setIsSaving(true);
    await updateRestaurantSettings(initialSettings.id, { allowWaiterJoinTables });
    setIsSaving(false);
  }

  return (
    <div className="min-h-screen px-8 py-10 lg:px-12 lg:py-12">

      {/* ── Header ──────────────────────────────────────────── */}
      <div className="mb-10 border-b border-wire pb-8" style={{ animation: "reveal-up 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>
        <p className="mb-2 text-[0.54rem] font-bold uppercase tracking-[0.44em] text-dim">
          Sistema
        </p>
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-serif text-[clamp(2rem,4vw,3rem)] font-medium leading-[0.92] tracking-[-0.02em] text-light">
            Configuración
          </h1>
          <button 
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex h-10 items-center gap-2 bg-light px-5 text-[0.72rem] font-bold uppercase tracking-[0.18em] text-ink transition-colors hover:bg-light/90 self-start sm:self-auto disabled:opacity-50"
          >
            <Save className="h-3.5 w-3.5" aria-hidden="true" />
            {isSaving ? "Guardando..." : "Guardar cambios"}
          </button>
        </div>
      </div>

      <div className="flex flex-col gap-12">

        {/* ── 01 · Identidad ──────────────────────────────────── */}
        <section style={{ animation: "dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) 0.1s both" }}>
          <div className="mb-7 border-b border-wire pb-4">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.38em] text-dim/50">01</p>
            <h2 className="mt-1 text-[0.95rem] font-semibold tracking-[-0.01em] text-light">
              Identidad del restaurante
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">
                Nombre comercial
              </label>
              <input
                type="text"
                defaultValue="Boulevard Bistro"
                className="h-10 w-full border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">
                Mensaje de bienvenida QR
              </label>
              <input
                type="text"
                defaultValue="¡Bienvenidos! Escanea para ver el menú."
                className="h-10 w-full border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">
                Logotipo
              </label>
              <div className="flex h-28 cursor-pointer items-center justify-center border border-dashed border-wire transition-colors hover:border-light/20">
                <p className="text-[0.72rem] font-medium text-dim/40">
                  Click para subir imagen
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ── 02 · Facturación ────────────────────────────────── */}
        <section style={{ animation: "dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) 0.18s both" }}>
          <div className="mb-7 border-b border-wire pb-4">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.38em] text-dim/50">02</p>
            <h2 className="mt-1 text-[0.95rem] font-semibold tracking-[-0.01em] text-light">
              Facturación y finanzas
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div>
              <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">
                Moneda
              </label>
              <select className="h-10 w-full cursor-pointer appearance-none border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30">
                <option className="bg-ink">MXN ($) Peso Mexicano</option>
                <option className="bg-ink">USD ($) US Dollar</option>
                <option className="bg-ink">EUR (€) Euro</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">
                Impuesto IVA (%)
              </label>
              <input
                type="number"
                defaultValue="16"
                className="h-10 w-full border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30"
              />
            </div>

            <div>
              <label className="mb-2 block text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">
                Propinas sugeridas
              </label>
              <input
                type="text"
                defaultValue="10, 15, 20"
                placeholder="Separadas por comas"
                className="h-10 w-full border border-wire bg-transparent px-3 text-[0.8rem] text-light outline-none transition-colors focus:border-light/30 placeholder:text-dim/30"
              />
            </div>
          </div>
        </section>

        {/* ── 03 · Servicio ───────────────────────────────────── */}
        <section style={{ animation: "dash-stat-enter 0.4s cubic-bezier(0.22,1,0.36,1) 0.26s both" }}>
          <div className="mb-7 border-b border-wire pb-4">
            <p className="text-[0.5rem] font-bold uppercase tracking-[0.38em] text-dim/50">03</p>
            <h2 className="mt-1 text-[0.95rem] font-semibold tracking-[-0.01em] text-light">
              Preferencias de servicio
            </h2>
          </div>

          <div className="divide-y divide-wire border-t border-wire">
            <ToggleRow
              label="Pedidos directos desde el celular"
              description="Si se desactiva, el menú QR será solo de lectura."
              checked={allowOrders}
              onChange={setAllowOrders}
            />
            <ToggleRow
              label="Notificaciones a meseros"
              description="Enviar alerta visual cuando una mesa envía un pedido."
              checked={notifyWaiters}
              onChange={setNotifyWaiters}
            />
            <ToggleRow
              label="Permitir a meseros juntar mesas"
              description="Habilita la opción para que los meseros liguen meses desde su dispositivo."
              checked={allowWaiterJoinTables}
              onChange={setAllowWaiterJoinTables}
            />
          </div>
        </section>

      </div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-8 py-5">
      <div className="min-w-0">
        <p className="text-[0.82rem] font-semibold text-light">{label}</p>
        <p className="mt-0.5 text-[0.68rem] font-medium text-dim">{description}</p>
      </div>

      <button
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={[
          "relative flex h-6 w-11 shrink-0 items-center border px-0.5 transition-colors duration-200",
          checked ? "border-sage-deep/60 bg-sage-deep/[0.15]" : "border-wire",
        ].join(" ")}
      >
        <span
          className={[
            "h-4 w-4 shrink-0 border transition-all duration-200",
            checked
              ? "translate-x-5 border-sage-deep bg-sage-deep"
              : "border-dim bg-dim/40",
          ].join(" ")}
        />
      </button>
    </div>
  );
}
