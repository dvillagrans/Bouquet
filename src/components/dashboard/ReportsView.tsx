"use client";

import { TrendingUp, DollarSign, Users, ShoppingBag, Calendar, Activity } from "lucide-react";

export default function ReportsView() {
  const stats = [
    { title: "Ventas Totales", value: "$42,500.00", change: "+12.5%", isPositive: true, icon: DollarSign },
    { title: "Ticket Promedio", value: "$450.00", change: "+5.2%", isPositive: true, icon: Activity },
    { title: "Mesas Atendidas", value: "98", change: "-2.1%", isPositive: false, icon: Users },
    { title: "Platos Vendidos", value: "312", change: "+8.4%", isPositive: true, icon: ShoppingBag },
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Reportes y Analíticas</h1>
          <p className="text-gray-400">Rendimiento en tiempo real de tu restaurante.</p>
        </div>
        <div className="flex bg-[#111] border border-white/10 rounded-lg p-1">
          <button className="px-4 py-1.5 text-sm font-medium bg-white/10 text-white rounded-md">Hoy</button>
          <button className="px-4 py-1.5 text-sm font-medium text-gray-400 hover:text-white">Semana</button>
          <button className="px-4 py-1.5 text-sm font-medium text-gray-400 hover:text-white">Mes</button>
          <button className="px-4 py-1.5 text-sm font-medium text-gray-400 hover:text-white flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Custom
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => (
          <div key={i} className="bg-[#111] border border-white/5 p-5 rounded-2xl flex flex-col gap-4">
            <div className="flex justify-between items-start">
              <div className="p-2 bg-white/5 rounded-lg border border-white/10">
                <stat.icon className="w-5 h-5 text-amber-500" />
              </div>
              <span className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-full ${
                stat.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
              }`}>
                {stat.isPositive ? <TrendingUp className="w-3 h-3" /> : <TrendingUp className="w-3 h-3 rotate-180" />}
                {stat.change}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-400 mb-1">{stat.title}</p>
              <p className="text-2xl font-bold text-white">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Gráfica Placeholder */}
        <div className="lg:col-span-2 bg-[#111] border border-white/5 rounded-2xl p-6 flex flex-col">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-white">Ingresos por Hora</h2>
          </div>
          <div className="flex-grow min-h-[300px] border-2 border-dashed border-white/5 rounded-xl flex items-center justify-center text-gray-500 flex-col gap-2">
            <Activity className="w-8 h-8 opacity-50" />
            <p className="text-sm font-medium">Gráfica Interactiva (Recharts / Chart.js)</p>
          </div>
        </div>

        {/* Top Platillos */}
        <div className="bg-[#111] border border-white/5 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-6">Platillos Top</h2>
          <div className="space-y-4">
            {[ 
              { name: "Hamburguesa Clásica", sold: 45, revenue: "$8,100" },
              { name: "Limonada de Menta", sold: 32, revenue: "$1,440" },
              { name: "Tacos de Ribeye", sold: 28, revenue: "$7,000" },
              { name: "Ensalada César", sold: 18, revenue: "$2,160" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5 group hover:border-amber-500/30 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center font-bold text-xs text-amber-500 border border-white/10">
                    {i + 1}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.sold} vendidos</p>
                  </div>
                </div>
                <p className="text-sm text-emerald-400 font-medium">{item.revenue}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
