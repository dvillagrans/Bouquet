"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";

const RESTAURANT_COOKIE = "bq_restaurant_id";

/**
 * Solo para propósitos de demostración.
 * Busca o crea un Restaurante base para asignar todo
 * (mesas, menú) al mismo restaurante.
 *
 * Wrapped with React.cache() para deduplicar dentro del mismo
 * ciclo de render — evita múltiples hits a la BD cuando varios
 * server components / actions lo llaman en la misma request.
 */
export const getDefaultRestaurant = cache(async function getDefaultRestaurant() {
  const cookieStore = await cookies();
  const selectedId = cookieStore.get(RESTAURANT_COOKIE)?.value;

  let restaurant = selectedId
    ? await prisma.restaurant.findUnique({ where: { id: selectedId } })
    : null;

  if (!restaurant) {
    restaurant = await prisma.restaurant.findFirst();
  }

  if (!restaurant) {
    // Encontrar una cadena para asignar el restaurante demo
    let chain = await prisma.chain.findFirst();
    if (!chain) {
      // Encontrar un usuario para asignar la cadena
      let user = await prisma.appUser.findFirst();
      if (!user) {
         user = await prisma.appUser.create({
           data: {
             email: "admin@bouquet.com",
             passwordHash: "temp",
             firstName: "Admin",
             lastName: "Bouquet"
           }
         });
      }
      chain = await prisma.chain.create({
        data: {
          name: "Cadena Principal",
          currency: "MXN",
          createdBy: user.id
        }
      });
    }

    restaurant = await prisma.restaurant.create({
      data: {
        name: "Mi Restaurante",
        welcomeMessage: "¡Bienvenidos!",
        chainId: chain.id,
        currency: "MXN",
      }
    });
  }

  return restaurant;
});

export async function updateRestaurantSettings(id: string, data: { allowWaiterJoinTables?: boolean }) {
  await prisma.restaurant.update({
    where: { id },
    data
  });
}


export async function getRestaurantOverview() {
  const restaurant = await getDefaultRestaurant();
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const tables = await prisma.diningTable.findMany({
    where: { restaurantId: restaurant.id },
    select: { status: true },
  });
  // TODO: migrar staff a AppUser + UserRole
  const staffCount = 0;
  const ordersToday = await prisma.restaurantOrder.findMany({ 
    where: { restaurantId: restaurant.id, createdAt: { gte: startOfDay } },
    select: { status: true }
  });
  const paymentsToday = await prisma.settlement.findMany({
    where: { restaurantId: restaurant.id, status: "LIQUIDADA", createdAt: { gte: startOfDay } },
    select: { subtotalCents: true },
  });

  const activeTables = tables.filter((t) => t.status !== "DISPONIBLE").length;
  const preparingOrders = ordersToday.filter((o) => o.status === "PREPARING").length;
  const deliveredOrders = ordersToday.filter((o) => o.status === "DELIVERED").length;
  const pendingOrders = ordersToday.filter((o) => o.status === "PENDING").length;
  
  const todayRevenue = paymentsToday.reduce((a, p) => a + ((p.subtotalCents || 0) / 100), 0);
  
  return {
    restaurant,
    metrics: {
      totalTables: tables.length,
      activeTables,
      staffCount,
      todayRevenue,
      totalOrders: ordersToday.length,
      preparingOrders,
      deliveredOrders,
      pendingOrders
    }
  };
}
