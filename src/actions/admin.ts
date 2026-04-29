"use server";

import { prisma } from "@/lib/prisma";
import { SAAS_USD_PER_SEAT_MONTH } from "@/lib/saas-pricing";

export interface SuperAdminDashboardData {
  stats: {
    chains: number;
    zones: number;
    restaurants: number;
    mrr: number;
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

    return {
      id: c.id,
      name: c.name,
      zonesCount: c.zones.length,
      restaurantsCount: restCount,
      adminName: "Sin admin", // TODO: migrar a AppUser + UserRole
      pin: "—",
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
    },
  });

  return chains.map((c) => {
    let restaurantsCount = 0;
    for (const z of c.zones) {
      restaurantsCount += z.restaurants.length;
    }
    return {
      id: c.id,
      name: c.name,
      currency: c.currency,
      createdAt: c.createdAt.toISOString(),
      zonesCount: c.zones.length,
      restaurantsCount,
      adminName: "Sin admin", // TODO: AppUser + UserRole
      pin: "—",
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

// TODO: migrar a AppUser + UserRole (chainStaff fue eliminado del schema)
export async function createTenant(data: { name: string; adminName: string; pin: string; currency?: string }) {
  let user = await prisma.appUser.findFirst();
  if (!user) {
    user = await prisma.appUser.create({
      data: {
        email: "admin@bouquet.com",
        passwordHash: "temp",
        firstName: "Admin",
        lastName: "Bouquet",
      }
    });
  }

  const chain = await prisma.chain.create({
    data: {
      name: data.name,
      currency: data.currency || "MXN",
      createdBy: user.id,
    },
  });
  // TODO: crear AppUser con rol CHAIN_ADMIN aquí
  return { success: true, chainId: chain.id };
}
