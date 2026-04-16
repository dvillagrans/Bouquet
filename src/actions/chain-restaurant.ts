"use server";

import { prisma } from "@/lib/prisma";
import { endOfDay, startOfDay } from "date-fns";

export interface ChainRestaurantDossierData {
  restaurant: {
    id: string;
    name: string;
    address: string | null;
    zone: { id: string; name: string } | null;
    chain: { id: string; name: string } | null;
  };
  today: {
    revenue: number;
    sessions: number;
    activeTables: number;
    totalTables: number;
    activeStaff: number;
  };
}

export async function getChainRestaurantDossier(restaurantId: string): Promise<ChainRestaurantDossierData | null> {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const r = await prisma.restaurant.findUnique({
    where: { id: restaurantId },
    include: {
      zone: { select: { id: true, name: true, chain: { select: { id: true, name: true } } } },
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
  });

  if (!r) return null;

  const revenue = r.orders.reduce((a, o) => {
    const total = o.items.reduce((sum, it) => sum + it.quantity * Number(it.priceAtTime), 0);
    return a + total;
  }, 0);
  const sessions = r.tables.reduce((a, t) => a + t.sessions.length, 0);
  const totalTables = r.tables.length;
  const activeTables = r.tables.filter((t) => t.status === "OCUPADA").length;
  const activeStaff = r.staff.length;

  return {
    restaurant: {
      id: r.id,
      name: r.name,
      address: r.address,
      zone: r.zone ? { id: r.zone.id, name: r.zone.name } : null,
      chain: r.zone?.chain ? { id: r.zone.chain.id, name: r.zone.chain.name } : null,
    },
    today: {
      revenue,
      sessions,
      activeTables,
      totalTables,
      activeStaff,
    },
  };
}

