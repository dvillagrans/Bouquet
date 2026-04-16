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
    restaurant = await prisma.restaurant.create({
      data: {
        name: "Mi Restaurante",
        welcomeMessage: "¡Bienvenidos!",
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

  const tables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    select: { status: true },
  });
  const staffCount = await prisma.staff.count({ where: { restaurantId: restaurant.id, isActive: true } });
  const ordersToday = await prisma.order.findMany({ 
    where: { restaurantId: restaurant.id, createdAt: { gte: startOfDay } },
    select: { status: true }
  });
  const paymentsToday = await prisma.payment.findMany({
    where: { restaurantId: restaurant.id, status: "PAID", order: { createdAt: { gte: startOfDay } } },
    select: { subtotal: true },
  });

  const activeTables = tables.filter((t) => t.status !== "DISPONIBLE").length;
  const preparingOrders = ordersToday.filter((o) => o.status === "PREPARING").length;
  const deliveredOrders = ordersToday.filter((o) => o.status === "DELIVERED").length;
  const pendingOrders = ordersToday.filter((o) => o.status === "PENDING").length;
  
  const todayRevenue = paymentsToday.reduce((a, p) => a + (p.subtotal || 0), 0);
  
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
