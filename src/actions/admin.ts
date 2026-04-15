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
      }
    },
  });

  const totalChains = chains.length;
  // Total zones acroos all chains
  const totalZones = chains.reduce((acc, c) => acc + c.zones.length, 0);
  
  // A restaurant might belong to a zone, or be completely independent. 
  // Let's get total restaurants overall just to be safe.
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
    };
  });

  // Un MRR simulado o basado en el número de restaurantes (ej. $100 usd por restaurante)
  const mrr = totalRestaurants * 199; // $199 USD al mes por local como ejemplo

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
