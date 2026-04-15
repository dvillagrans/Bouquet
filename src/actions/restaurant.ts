"use server";

import { cache } from "react";
import { prisma } from "@/lib/prisma";

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
  let restaurant = await prisma.restaurant.findFirst();

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
