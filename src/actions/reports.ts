"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { OrderStatus } from "@/generated/prisma";
import { startOfDay, startOfWeek, startOfMonth, subDays, subWeeks, subMonths, endOfDay } from "date-fns";

export type Period = "Hoy" | "Semana" | "Mes";

export interface DashboardReportData {
  stats: Record<Period, { label: string; value: string; change: string; up: boolean; }[]>;
  topItems: Record<Period, { name: string; sold: number; revenue: string }[]>;
}

export async function getDashboardReports(): Promise<DashboardReportData> {
  const restaurant = await getDefaultRestaurant();
  const restId = restaurant.id;
  const now = new Date();

  // Helper to fetch data for a specific period
  async function fetchPeriodData(startDate: Date, endDate: Date) {
    // Fetch orders and sessions in parallel — independent queries
    const [orders, sessions] = await Promise.all([
      prisma.order.findMany({
        where: {
          restaurantId: restId,
          createdAt: { gte: startDate, lte: endDate },
          status: { in: ["READY", "DELIVERED"] },
        },
        include: { items: { include: { menuItem: true } } },
      }),
      prisma.session.findMany({
        where: {
          table: { restaurantId: restId },
          createdAt: { gte: startDate, lte: endDate },
        },
      }),
    ]);

    let totalVentas = 0;
    let totalPlatos = 0;
    const itemSoldCount: Record<string, { name: string, sold: number, revenue: number }> = {};

    for (const o of orders) {
      for (const i of o.items) {
        const lineTotal = i.quantity * i.priceAtTime;
        totalVentas += lineTotal;
        totalPlatos += i.quantity;

        const itemName = i.menuItem.name;
        if (!itemSoldCount[itemName]) {
          itemSoldCount[itemName] = { name: itemName, sold: 0, revenue: 0 };
        }
        itemSoldCount[itemName].sold += i.quantity;
        itemSoldCount[itemName].revenue += lineTotal;
      }
    }

    const mesasAtendidas = sessions.length;
    const ticketPromedio = mesasAtendidas > 0 ? totalVentas / mesasAtendidas : 0;

    const topItemsArray = Object.values(itemSoldCount)
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 5)
      .map(item => ({
        name: item.name,
        sold: item.sold,
        revenue: `$${item.revenue.toFixed(2)}`
      }));

    return {
      stats: [
        { label: "Ventas totales", value: `${totalVentas.toFixed(2)}`, change: "--", up: true },
        { label: "Ticket promedio", value: `${ticketPromedio.toFixed(2)}`, change: "--", up: true },
        { label: "Mesas atendidas", value: `${mesasAtendidas}`, change: "--", up: true },
        { label: "Platos vendidos", value: `${totalPlatos}`, change: "--", up: true }
      ],
      topItems: topItemsArray
    };
  }

  // Fetch all three periods in parallel — fully independent
  const [hoyData, semanaData, mesData] = await Promise.all([
    fetchPeriodData(startOfDay(now), endOfDay(now)),
    fetchPeriodData(startOfWeek(now, { weekStartsOn: 1 }), endOfDay(now)),
    fetchPeriodData(startOfMonth(now), endOfDay(now)),
  ]);

  return {
    stats: {
      Hoy: hoyData.stats,
      Semana: semanaData.stats,
      Mes: mesData.stats,
    },
    topItems: {
      Hoy: hoyData.topItems,
      Semana: semanaData.topItems,
      Mes: mesData.topItems,
    }
  };
}
