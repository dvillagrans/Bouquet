"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export interface RestaurantSummary {
  id: string;
  name: string;
  address: string | null;
  zoneName: string | null;
  zoneId: string | null;
  totalTables: number;
  activeTables: number;
  activeStaff: number;
  todayRevenue: number;
  todaySessions: number;
}

export interface ZoneSummary {
  id: string;
  name: string;
  restaurantCount: number;
  totalRevenue: number;
  totalTables: number;
  activeTables: number;
}

export interface ChainDashboardData {
  chain: { id: string; name: string };
  stats: {
    totalRevenue: number;
    totalSessions: number;
    activeTables: number;
    restaurantCount: number;
  };
  zones: ZoneSummary[];
  restaurants: RestaurantSummary[];
}

export interface ZoneDashboardData {
  zone: { id: string; name: string; chainName: string };
  stats: {
    totalRevenue: number;
    totalSessions: number;
    activeTables: number;
    staffCount: number;
  };
  restaurants: RestaurantSummary[];
}

async function fetchRestaurants(zoneId?: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  return prisma.restaurant.findMany({
    where: zoneId ? { zoneId } : {},
    include: {
      zone: { select: { id: true, name: true } },
      tables: {
        select: {
          status: true,
          sessions: {
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
            select: { id: true },
          },
        },
      },
      staff: { where: { isActive: true }, select: { id: true } },
      orders: {
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          status: { in: ["READY", "DELIVERED"] },
        },
        include: { items: { select: { quantity: true, priceAtTime: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

function toSummary(
  rest: Awaited<ReturnType<typeof fetchRestaurants>>[number]
): RestaurantSummary {
  const todayRevenue = rest.orders.reduce(
    (sum, o) => sum + o.items.reduce((s, i) => s + i.quantity * i.priceAtTime, 0),
    0
  );
  const activeTables = rest.tables.filter(
    (t) => t.status === "OCUPADA" || t.status === "CERRANDO"
  ).length;
  const todaySessions = rest.tables.reduce(
    (sum, t) => sum + t.sessions.length,
    0
  );

  return {
    id: rest.id,
    name: rest.name,
    address: rest.address,
    zoneName: rest.zone?.name ?? null,
    zoneId: rest.zone?.id ?? null,
    totalTables: rest.tables.length,
    activeTables,
    activeStaff: rest.staff.length,
    todayRevenue,
    todaySessions,
  };
}

export async function getChainDashboard(): Promise<ChainDashboardData> {
  const [chain, rawRestaurants] = await Promise.all([
    prisma.chain.findFirst({ select: { id: true, name: true } }),
    fetchRestaurants(),
  ]);

  const restaurants = rawRestaurants
    .map(toSummary)
    .sort((a, b) => b.todayRevenue - a.todayRevenue);

  // Aggregate zones
  const zoneMap = new Map<string, ZoneSummary>();
  for (const r of restaurants) {
    if (r.zoneId && r.zoneName) {
      const z = zoneMap.get(r.zoneId) ?? {
        id: r.zoneId,
        name: r.zoneName,
        restaurantCount: 0,
        totalRevenue: 0,
        totalTables: 0,
        activeTables: 0,
      };
      z.restaurantCount++;
      z.totalRevenue += r.todayRevenue;
      z.totalTables += r.totalTables;
      z.activeTables += r.activeTables;
      zoneMap.set(r.zoneId, z);
    }
  }

  const zones = Array.from(zoneMap.values()).sort(
    (a, b) => b.totalRevenue - a.totalRevenue
  );

  return {
    chain: chain ?? { id: "demo", name: "Vista General" },
    stats: {
      totalRevenue: restaurants.reduce((s, r) => s + r.todayRevenue, 0),
      totalSessions: restaurants.reduce((s, r) => s + r.todaySessions, 0),
      activeTables: restaurants.reduce((s, r) => s + r.activeTables, 0),
      restaurantCount: restaurants.length,
    },
    zones,
    restaurants,
  };
}

export async function getZoneDashboard(): Promise<ZoneDashboardData> {
  const zone = await prisma.zone.findFirst({
    select: { id: true, name: true, chain: { select: { name: true } } },
  });

  const rawRestaurants = await fetchRestaurants(zone?.id);

  const restaurants = rawRestaurants
    .map(toSummary)
    .sort((a, b) => b.todayRevenue - a.todayRevenue);

  return {
    zone: zone
      ? { id: zone.id, name: zone.name, chainName: zone.chain.name }
      : { id: "demo", name: "Vista de Zona", chainName: "Demo" },
    stats: {
      totalRevenue: restaurants.reduce((s, r) => s + r.todayRevenue, 0),
      totalSessions: restaurants.reduce((s, r) => s + r.todaySessions, 0),
      activeTables: restaurants.reduce((s, r) => s + r.activeTables, 0),
      staffCount: restaurants.reduce((s, r) => s + r.activeStaff, 0),
    },
    restaurants,
  };
}
