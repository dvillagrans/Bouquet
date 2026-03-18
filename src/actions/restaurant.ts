"use server";

import { prisma } from "@/lib/prisma";

/**
 * Solo para propósitos de demostración. 
 * Busca o crea un Restaurante base para asignar todo 
 * (mesas, menú) al mismo restaurante.
 */
export async function getDefaultRestaurant() {
  let restaurant = await prisma.restaurant.findFirst();

  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        name: "Restaurante Base",
        welcomeMessage: "¡Bienvenidos!",
      },
    });
  }

  return restaurant;
}
