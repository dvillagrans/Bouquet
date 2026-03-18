"use client";

import { Store, Receipt, Image as ImageIcon, Save, Bell, Smartphone } from "lucide-react";

export default function SettingsView() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configuración</h1>
          <p className="text-gray-400">Personaliza la experiencia de tus comensales y reglas de negocio.</p>
        </div>
        <button className="flex items-center gap-2 bg-amber-600 hover:bg-amber-500 text-white px-5 py-2.5 rounded-lg font-medium transition-colors shadow-lg shadow-amber-500/20">
          <Save className="w-4 h-4" />
          <span>Guardar Cambios</span>
        </button>
      </div>

      <div className="space-y-6">
        
        {/* Identidad del Restaurante */}
        <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
            <Store className="w-5 h-5 text-amber-500" />
            <h2 className="text-lg font-semibold text-white">Identidad del Restaurante</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Nombre Comercial</label>
                <input type="text" defaultValue="Boulevard Bistro" className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-2">Mensaje de Bienvenida QR</label>
                <input type="text" defaultValue="¡Bienvenidos! Escanea para ver el menú." className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Logotipo</label>
              <div className="border-2 border-dashed border-white/10 rounded-xl h-32 flex flex-col items-center justify-center gap-2 text-gray-500 hover:border-amber-500/50 hover:text-amber-500 transition-colors cursor-pointer bg-black/50">
                <ImageIcon className="w-8 h-8" />
                <span className="text-sm font-medium">Click para subir imagen</span>
              </div>
            </div>
          </div>
        </section>

        {/* Facturación y Finanzas */}
        <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
            <Receipt className="w-5 h-5 text-emerald-500" />
            <h2 className="text-lg font-semibold text-white">Facturación y Finanzas</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Moneda</label>
              <select className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none appearance-none">
                <option>MXN ($) Peso Mexicano</option>
                <option>USD ($) US Dollar</option>
                <option>EUR (€) Euro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Impuesto (IVA) %</label>
              <input type="number" defaultValue="16" className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-2">Propinas Sugeridas</label>
              <input type="text" defaultValue="10, 15, 20" placeholder="Separadas por comas" className="w-full bg-black border border-white/10 rounded-lg px-4 py-2 text-white focus:border-amber-500/50 focus:outline-none" />
            </div>
          </div>
        </section>

        {/* Preferencias de Servicio */}
        <section className="bg-[#111] border border-white/5 rounded-2xl overflow-hidden">
          <div className="p-5 border-b border-white/5 flex items-center gap-3 bg-white/[0.02]">
            <Smartphone className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-white">Preferencias de Servicio</h2>
          </div>
          <div className="p-6 space-y-4">
            <label className="flex items-center justify-between p-4 bg-black rounded-xl border border-white/5 cursor-pointer">
              <div>
                <p className="text-white font-medium">Permitir pedidos directos desde el celular</p>
                <p className="text-sm text-gray-500">Si se desactiva, el menú QR será solo de lectura.</p>
              </div>
              <div className="relative inline-block w-12 h-6 rounded-full bg-amber-500">
                <span className="absolute left-[26px] top-1 w-4 h-4 bg-white rounded-full transition-all"></span>
              </div>
            </label>
            <label className="flex items-center justify-between p-4 bg-black rounded-xl border border-white/5 cursor-pointer">
              <div>
                <p className="text-white font-medium">Notificar a meseros de nuevas órdenes</p>
                <p className="text-sm text-gray-500">Enviar alerta visual cuando una mesa envía un pedido.</p>
              </div>
              <div className="relative inline-block w-12 h-6 rounded-full bg-amber-500">
                <span className="absolute left-[26px] top-1 w-4 h-4 bg-white rounded-full transition-all"></span>
              </div>
            </label>
          </div>
        </section>

      </div>
    </div>
  );
}
