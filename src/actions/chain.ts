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

// 1. Verificación del PIN Maestro
export async function verifyChainPin(tenantId: string, pin: string) {
  if (!tenantId || !pin) return false;
  
  const staff = await prisma.chainStaff.findFirst({
    where: {
      chainId: tenantId,
      role: "CHAIN_ADMIN",
      pin: pin
    }
  });

  return !!staff; // true si existe el admin con ese PIN
}

async function fetchRestaurants(chainId?: string, zoneId?: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const whereClause: any = {};
  if (chainId) {
    whereClause.zone = { chainId: chainId };
  }
  if (zoneId) {
    whereClause.zoneId = zoneId;
  }

  return prisma.restaurant.findMany({
    where: whereClause,
    include: {
      zone: { select: { id: true, name: true, chainId: true } },
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

function toSummary(r: any): RestaurantSummary {
  const todayRevenue = r.orders.reduce((a: number, o: any) => {
    const total = o.items.reduce((sum: number, it: any) => sum + it.quantity * Number(it.priceAtTime), 0);
    return a + total;
  }, 0);

  const todaySessions = r.tables.reduce((a: number, t: any) => a + t.sessions.length, 0);

  return {
    id: r.id,
    name: r.name,
    address: r.address,
    zoneName: r.zone?.name || null,
    zoneId: r.zoneId,
    totalTables: r.tables.length,
    activeTables: r.tables.filter((t: any) => t.status === "OCCUPIED").length,
    activeStaff: r.staff.length,
    todayRevenue,
    todaySessions,
  };
}

export async function getChainDashboard(tenantId: string): Promise<ChainDashboardData | null> {
  const [chain, rawRestaurants] = await Promise.all([
    prisma.chain.findUnique({ where: { id: tenantId }, select: { id: true, name: true } }),
    fetchRestaurants(tenantId),
  ]);

  if (!chain) return null;

  const restaurants = rawRestaurants
    .map(toSummary)
    .sort((a, b) => b.todayRevenue - a.todayRevenue);

  const zones: ZoneSummary[] = [];
  const zoneMap: Record<string, ZoneSummary> = {};

  for (const r of restaurants) {
    if (r.zoneId && r.zoneName) {
      if (!zoneMap[r.zoneId]) {
        const z: ZoneSummary = {
          id: r.zoneId,
          name: r.zoneName,
          restaurantCount: 0,
          totalRevenue: 0,
          activeTables: 0,
          totalTables: 0,
        };
        zoneMap[r.zoneId] = z;
        zones.push(z);
      }
      zoneMap[r.zoneId].restaurantCount++;
      zoneMap[r.zoneId].totalRevenue += r.todayRevenue;
      zoneMap[r.zoneId].activeTables += r.activeTables;
      zoneMap[r.zoneId].totalTables += r.totalTables;
    }
  }

  const totals = restaurants.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.todayRevenue,
      sessions: acc.sessions + r.todaySessions,
      activeTables: acc.activeTables + r.activeTables,
    }),
    { revenue: 0, sessions: 0, activeTables: 0 }
  );

  return {
    chain,
    stats: {
      totalRevenue: totals.revenue,
      totalSessions: totals.sessions,
      activeTables: totals.activeTables,
      restaurantCount: restaurants.length,
    },
    zones: zones.sort((a, b) => b.totalRevenue - a.totalRevenue),
    restaurants,
  };
}

export async function getZoneDashboard(zoneId: string): Promise<ZoneDashboardData | null> {
  const [zone, rawRestaurants] = await Promise.all([
    prisma.zone.findUnique({
      where: { id: zoneId },
      include: { chain: { select: { name: true } } },
    }),
    fetchRestaurants(undefined, zoneId),
  ]);

  if (!zone) return null;

  const restaurants = rawRestaurants
    .map(toSummary)
    .sort((a, b) => b.todayRevenue - a.todayRevenue);

  const stats = restaurants.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.todayRevenue,
      sessions: acc.sessions + r.todaySessions,
      activeTables: acc.activeTables + r.activeTables,
      staffCount: acc.staffCount + r.activeStaff,
    }),
    { revenue: 0, sessions: 0, activeTables: 0, staffCount: 0 }
  );

  return {
    zone: { id: zone.id, name: zone.name, chainName: zone.chain.name },
    stats: {
      totalRevenue: stats.revenue,
      totalSessions: stats.sessions,
      activeTables: stats.activeTables,
      staffCount: stats.staffCount,
    },
    restaurants,
  };
}

export async function verifyZonePin(zoneId: string, pin: string) {
  try {
    const st = await prisma.chainStaff.findFirst({
      where: { 
        zoneId: zoneId, 
        pin: pin, 
        role: "ZONE_MANAGER", 
        isActive: true 
      }
    });
    if (!st) return { success: false, error: "Credenciales de zona inválidas" };
    return { success: true, token: st.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createRestaurantInChain(data: {
  chainId: string;
  name: string;
  address?: string;
  zoneId?: string;
  newZoneName?: string;
}) {
  try {
    let finalZoneId = data.zoneId;
    
    if (!finalZoneId && data.newZoneName) {
      const zone = await prisma.zone.create({
        data: {
          name: data.newZoneName,
          chainId: data.chainId,
        }
      });
      finalZoneId = zone.id;
    } else if (!finalZoneId) {
      // Intentar buscar una zona por defecto, si no crearla
      let defZone = await prisma.zone.findFirst({
        where: { chainId: data.chainId }
      });
      if (!defZone) {
        defZone = await prisma.zone.create({
          data: { name: "Zona Principal", chainId: data.chainId }
        });
      }
      finalZoneId = defZone.id;
    }

    const rest = await prisma.restaurant.create({
      data: {
        name: data.name,
        address: data.address || null,
        zoneId: finalZoneId,
      }
    });

    return { success: true, restaurantId: rest.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}
