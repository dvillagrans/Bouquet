"use server";

import { prisma } from "@/lib/prisma";
import { SAAS_USD_PER_SEAT_MONTH } from "@/lib/saas-pricing";

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

  const mrr = totalRestaurants * SAAS_USD_PER_SEAT_MONTH;

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

export interface AdminClienteRow {
  id: string;
  name: string;
  currency: string;
  createdAt: string;
  zonesCount: number;
  restaurantsCount: number;
  adminName: string;
  pin: string;
}

/** Listado de cadenas (tenants) para la consola super-admin, ordenado por fecha de alta. */
export async function getAdminClientesList(): Promise<AdminClienteRow[]> {
  const chains = await prisma.chain.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      currency: true,
      createdAt: true,
      zones: {
        select: {
          id: true,
          restaurants: { select: { id: true } },
        },
      },
      chainStaff: {
        where: { role: "CHAIN_ADMIN" },
        select: { name: true, pin: true },
        take: 1,
      },
    },
  });

  return chains.map((c) => {
    let restaurantsCount = 0;
    for (const z of c.zones) {
      restaurantsCount += z.restaurants.length;
    }
    const admin = c.chainStaff?.[0];
    return {
      id: c.id,
      name: c.name,
      currency: c.currency,
      createdAt: c.createdAt.toISOString(),
      zonesCount: c.zones.length,
      restaurantsCount,
      adminName: admin?.name ?? "Sin admin",
      pin: admin?.pin ?? "—",
    };
  });
}

export interface AdminBillingChainRow {
  id: string;
  name: string;
  currency: string;
  restaurantsCount: number;
  projectedMrrUsd: number;
}

export interface AdminBillingOverview {
  pricePerSeatUsdMonth: number;
  stats: {
    totalRestaurants: number;
    standaloneRestaurants: number;
    chainedRestaurants: number;
    chains: number;
    projectedMrrUsd: number;
    projectedArrUsd: number;
  };
  chains: AdminBillingChainRow[];
}

/**
 * Vista de facturación SaaS (proyección): no hay tabla de suscripciones aún;
 * se deriva de sucursales en BD y la tarifa de referencia.
 */
export async function getAdminBillingOverview(): Promise<AdminBillingOverview> {
  const P = SAAS_USD_PER_SEAT_MONTH;

  const [chains, standaloneCount, totalRestaurants] = await Promise.all([
    prisma.chain.findMany({
      orderBy: { name: "asc" },
      select: {
        id: true,
        name: true,
        currency: true,
        zones: { select: { restaurants: { select: { id: true } } } },
      },
    }),
    prisma.restaurant.count({ where: { zoneId: null } }),
    prisma.restaurant.count(),
  ]);

  const chainRows: AdminBillingChainRow[] = chains.map((c) => {
    let restaurantsCount = 0;
    for (const z of c.zones) {
      restaurantsCount += z.restaurants.length;
    }
    return {
      id: c.id,
      name: c.name,
      currency: c.currency,
      restaurantsCount,
      projectedMrrUsd: restaurantsCount * P,
    };
  });

  chainRows.sort((a, b) => b.projectedMrrUsd - a.projectedMrrUsd);

  const chainedRestaurants = chainRows.reduce((acc, r) => acc + r.restaurantsCount, 0);
  const projectedFromChains = chainRows.reduce((acc, r) => acc + r.projectedMrrUsd, 0);
  const projectedStandalone = standaloneCount * P;
  const projectedMrrUsd = projectedFromChains + projectedStandalone;

  return {
    pricePerSeatUsdMonth: P,
    stats: {
      totalRestaurants,
      standaloneRestaurants: standaloneCount,
      chainedRestaurants,
      chains: chains.length,
      projectedMrrUsd,
      projectedArrUsd: projectedMrrUsd * 12,
    },
    chains: chainRows,
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
