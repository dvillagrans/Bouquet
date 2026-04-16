"use server";

import { prisma } from "@/lib/prisma";

export interface SuperAdminDashboardData {
  stats: {
    chains: number;
    zones: number;
    restaurants: number;
    mrr: number; // Mock o calculado
  };
  chains: {
    id: string;
    name: string;
    zonesCount: number;
    restaurantsCount: number;
    adminName?: string;
    pin?: string;
  }[];
}

export async function getSuperAdminDashboard(): Promise<SuperAdminDashboardData> {
  const chains = await prisma.chain.findMany({
    select: {
      id: true,
      name: true,
      zones: {
        select: {
          id: true,
          restaurants: { select: { id: true } }
        }
      },
      chainStaff: {
        where: { role: "CHAIN_ADMIN" },
        select: { name: true, pin: true },
        take: 1
      }
    },
  });

  const totalChains = chains.length;
  const totalZones = chains.reduce((acc, c) => acc + c.zones.length, 0);
  const totalRestaurants = await prisma.restaurant.count();

  // Mapeamos los datos de las cadenas
  const chainsList = chains.map((c) => {
    let restCount = 0;
    c.zones.forEach((z) => {
      restCount += z.restaurants.length;
    });

    const admin = c.chainStaff?.[0];

    return {
      id: c.id,
      name: c.name,
      zonesCount: c.zones.length,
      restaurantsCount: restCount,
      adminName: admin?.name || "Sin admin",
      pin: admin?.pin || "—",
    };
  });

  const mrr = totalRestaurants * 199; 

  return {
    stats: {
      chains: totalChains,
      zones: totalZones,
      restaurants: totalRestaurants,
      mrr,
    },
    chains: chainsList,
  };
}

export async function createTenant(data: { name: string; adminName: string; pin: string; currency?: string }) {
  const chain = await prisma.chain.create({
    data: {
      name: data.name,
      currency: data.currency || "MXN",
      chainStaff: {
        create: {
          name: data.adminName,
          pin: data.pin,
          role: "CHAIN_ADMIN"
        }
      }
    },
  });
  return { success: true, chainId: chain.id };
}
