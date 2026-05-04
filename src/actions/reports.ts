"use server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-action";
import {
  startOfDay, startOfWeek, startOfMonth,
  subDays, subWeeks, subMonths, endOfDay,
} from "date-fns";

export type Period = "Hoy" | "Semana" | "Mes";

export interface DashboardReportData {
  stats:     Record<Period, { label: string; value: string; change: string; up: boolean }[]>;
  topItems:  Record<Period, { name: string; sold: number; revenue: string; maxSold: number }[]>;
  chartData: Record<Period, { label: string; value: number }[]>;
}

interface PeriodRaw {
  totalVentas:    number;
  ticketPromedio: number;
  mesasAtendidas: number;
  totalPlatos:    number;
  topItems:       { name: string; sold: number; revenue: number }[];
  chartData:      { label: string; value: number }[];
}

const DAY_LABELS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

async function fetchPeriodData(
  restId:    string,
  startDate: Date,
  endDate:   Date,
  mode:      "hoy" | "semana" | "mes",
): Promise<PeriodRaw> {
  const [orders, sessions] = await Promise.all([
    prisma.restaurantOrder.findMany({
      where: {
        restaurantId: restId,
        createdAt:    { gte: startDate, lte: endDate },
        status:       { in: ["READY", "DELIVERED"] },
      },
      include: { items: { include: { menuItem: true } } },
    }),
    prisma.diningSession.findMany({
      where: { restaurantId: restId, openedAt: { gte: startDate, lte: endDate } },
    }),
  ]);

  let totalVentas = 0;
  let totalPlatos = 0;
  const itemMap:  Record<string, { name: string; sold: number; revenue: number }> = {};
  const timeMap:  Record<string, number> = {};

  for (const o of orders) {
    const d = new Date(o.createdAt);
    let timeKey: string;
    if      (mode === "hoy")    timeKey = String(d.getHours());
    else if (mode === "semana") timeKey = String(d.getDay());
    else                        timeKey = String(Math.floor((d.getDate() - 1) / 7));

    for (const i of o.items) {
      const line = i.quantity * ((i.unitPriceCents || 0) / 100);
      totalVentas += line;
      totalPlatos += i.quantity;
      timeMap[timeKey] = (timeMap[timeKey] ?? 0) + line;

      const key = i.menuItem?.name || i.itemNameSnapshot || "Platillo";
      if (!itemMap[key]) itemMap[key] = { name: key, sold: 0, revenue: 0 };
      itemMap[key].sold    += i.quantity;
      itemMap[key].revenue += line;
    }
  }

  const mesasAtendidas = sessions.length;
  const ticketPromedio = mesasAtendidas > 0 ? totalVentas / mesasAtendidas : 0;
  const topItems = Object.values(itemMap).sort((a, b) => b.sold - a.sold).slice(0, 5);

  let chartData: { label: string; value: number }[];
  if (mode === "hoy") {
    chartData = Array.from({ length: 14 }, (_, i) => {
      const h = i + 9;
      return { label: `${h}h`, value: timeMap[String(h)] ?? 0 };
    });
  } else if (mode === "semana") {
    chartData = [1, 2, 3, 4, 5, 6, 0].map(dayIdx => ({
      label: DAY_LABELS[dayIdx],
      value: timeMap[String(dayIdx)] ?? 0,
    }));
  } else {
    chartData = Array.from({ length: 5 }, (_, i) => ({
      label: `Sem ${i + 1}`,
      value: timeMap[String(i)] ?? 0,
    }));
  }

  return { totalVentas, ticketPromedio, mesasAtendidas, totalPlatos, topItems, chartData };
}

function fmtCurrency(n: number) {
  return `$${n.toLocaleString("es-MX", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function calcChange(curr: number, prev: number): { change: string; up: boolean } {
  if (prev === 0) return { change: "—", up: true };
  const pct = ((curr - prev) / prev) * 100;
  return { change: `${pct >= 0 ? "+" : ""}${pct.toFixed(1)}%`, up: pct >= 0 };
}

function buildStats(curr: PeriodRaw, prev: PeriodRaw) {
  return [
    { label: "Ventas totales",  value: fmtCurrency(curr.totalVentas),    ...calcChange(curr.totalVentas,    prev.totalVentas)    },
    { label: "Ticket promedio", value: fmtCurrency(curr.ticketPromedio),  ...calcChange(curr.ticketPromedio, prev.ticketPromedio)  },
    { label: "Mesas atendidas", value: `${curr.mesasAtendidas}`,          ...calcChange(curr.mesasAtendidas, prev.mesasAtendidas)  },
    { label: "Platos vendidos", value: `${curr.totalPlatos}`,             ...calcChange(curr.totalPlatos,    prev.totalPlatos)     },
  ];
}

function buildTopItems(raw: PeriodRaw) {
  const maxSold = raw.topItems[0]?.sold ?? 1;
  return raw.topItems.map(item => ({
    name:    item.name,
    sold:    item.sold,
    revenue: fmtCurrency(item.revenue),
    maxSold,
  }));
}

export const getDashboardReports = withAuth(
  async (ctx): Promise<DashboardReportData> => {
    if (!ctx.restaurantId) throw new Error("No restaurant context");
    const restId = ctx.restaurantId;
    const now    = new Date();

    const [hoy, semana, mes, hoyPrev, semanaPrev, mesPrev] = await Promise.all([
      fetchPeriodData(restId, startOfDay(now),                              endOfDay(now),                              "hoy"),
      fetchPeriodData(restId, startOfWeek(now, { weekStartsOn: 1 }),        endOfDay(now),                              "semana"),
      fetchPeriodData(restId, startOfMonth(now),                            endOfDay(now),                              "mes"),
      fetchPeriodData(restId, startOfDay(subDays(now, 1)),                  endOfDay(subDays(now, 1)),                  "hoy"),
      fetchPeriodData(restId, startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 }), endOfDay(subWeeks(now, 1)),           "semana"),
      fetchPeriodData(restId, startOfMonth(subMonths(now, 1)),              endOfDay(subMonths(now, 1)),                "mes"),
    ]);

    return {
      stats:    { Hoy: buildStats(hoy, hoyPrev),       Semana: buildStats(semana, semanaPrev),       Mes: buildStats(mes, mesPrev)       },
      topItems: { Hoy: buildTopItems(hoy),              Semana: buildTopItems(semana),                Mes: buildTopItems(mes)              },
      chartData:{ Hoy: hoy.chartData,                   Semana: semana.chartData,                     Mes: mes.chartData                   },
    };
  },
  { requireTenant: true }
);
