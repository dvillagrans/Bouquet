"use server";

import { prisma } from "@/lib/prisma";
import { SAAS_USD_PER_SEAT_MONTH } from "@/lib/saas-pricing";
import { cookies } from "next/headers";
import { adminSessionCookieName, resolveAdminAuthSecret, verifyAdminSessionToken } from "@/lib/admin-session";

export interface CurrentAdminUser {
  id: string;
  email: string;
  name: string;
}

export async function getCurrentAdminUser(): Promise<CurrentAdminUser | null> {
  const secret = resolveAdminAuthSecret();
  if (!secret) return null;

  const cookieStore = await cookies();
  const token = cookieStore.get(adminSessionCookieName())?.value;
  const session = await verifyAdminSessionToken(token, secret);
  if (!session.ok) return null;

  const user = await prisma.appUser.findUnique({
    where: { id: session.appUserId },
    select: { id: true, email: true, firstName: true, lastName: true },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
  };
}

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
  }[];
}

export async function getSuperAdminDashboard(): Promise<SuperAdminDashboardData> {
  const chains = await prisma.chain.findMany({
    select: {
      id: true,
      name: true,
      createdBy: true,
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
  const chainsList = await Promise.all(
    chains.map(async (c) => {
      let restCount = 0;
      c.zones.forEach((z) => {
        restCount += z.restaurants.length;
      });

      const creator = await prisma.appUser.findUnique({
        where: { id: c.createdBy },
        select: { firstName: true, lastName: true },
      });
      const adminName = creator ? `${creator.firstName} ${creator.lastName}`.trim() : "Sin admin";

      return {
        id: c.id,
        name: c.name,
        zonesCount: c.zones.length,
        restaurantsCount: restCount,
        adminName,
      };
    })
  );

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
      createdBy: true,
      zones: {
        select: {
          id: true,
          restaurants: { select: { id: true } },
        },
      },
    },
  });

  return await Promise.all(
    chains.map(async (c) => {
      let restaurantsCount = 0;
      for (const z of c.zones) {
        restaurantsCount += z.restaurants.length;
      }
      const creator = await prisma.appUser.findUnique({
        where: { id: c.createdBy },
        select: { firstName: true, lastName: true },
      });
      const adminName = creator ? `${creator.firstName} ${creator.lastName}`.trim() : "Sin admin";
      return {
        id: c.id,
        name: c.name,
        currency: c.currency,
        createdAt: c.createdAt.toISOString(),
        zonesCount: c.zones.length,
        restaurantsCount,
        adminName,
      };
    })
  );
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

export async function createTenant(data: { name: string; adminName: string; currency?: string }) {
  const { hashPassword } = await import("@/lib/auth-password");

  // Crear rol base CHAIN_ADMIN si no existe
  const role = await prisma.role.upsert({
    where: { id: "role-chain-admin" },
    update: {},
    create: {
      id: "role-chain-admin",
      name: "CHAIN_ADMIN",
      scope: "CHAIN",
      isBase: true,
      isActive: true,
    },
  });

  // Asegurar que la moneda exista antes de crear la cadena
  const currencyCode = data.currency || "MXN";
  await prisma.currency.upsert({
    where: { code: currencyCode },
    update: {},
    create: {
      code: currencyCode,
      name: currencyCode === "MXN" ? "Peso Mexicano" : currencyCode,
      symbol: currencyCode === "MXN" ? "$" : currencyCode,
    },
  });

  const names = data.adminName.trim().split(/\s+/);
  const firstName = names[0] ?? "Admin";
  const lastName = names.slice(1).join(" ") ?? "Cadena";
  const email = `admin-${Date.now()}@bouquet.internal`;
  const tempPassword = Math.random().toString(36).slice(-8);
  const passwordHash = await hashPassword(tempPassword);

  const adminUser = await prisma.appUser.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      isActive: true,
    },
  });

  const chain = await prisma.chain.create({
    data: {
      name: data.name,
      currency: currencyCode,
      createdBy: adminUser.id,
    },
  });

  // Asignar rol CHAIN_ADMIN al usuario creador
  await prisma.userRole.create({
    data: {
      userId: adminUser.id,
      roleId: role.id,
      contextType: "CHAIN",
      chainId: chain.id,
    },
  });

  return { success: true, chainId: chain.id };
}
