"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { revalidatePath } from "next/cache";

// Las categorias por default que podemos crear si esta vacio
const DEFAULT_CATEGORIES = ["Entradas", "Platos principales", "Bebidas", "Postres"];

export async function getMenuData() {
  const restaurant = await getDefaultRestaurant();
  
  // Buscar categorías
  let categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { order: 'asc' },
    include: { items: true } // Traemos los items de una vez
  });

  // Crearlas si el usuario recién inicia
  if (categories.length === 0) {
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
        await prisma.category.create({
            data: {
                name: DEFAULT_CATEGORIES[i],
                order: i,
                restaurantId: restaurant.id
            }
        });
    }

    // Consultamos otra vez
    categories = await prisma.category.findMany({
        where: { restaurantId: restaurant.id },
        orderBy: { order: 'asc' },
        include: { items: true }
    });
  }

  // Devolvemos las categorias puras y una lista plana de todos los items concatenados (para que sea mas facil en el state actual del UI)
  const allItems = categories.flatMap(cat => 
    cat.items.map(item => ({
      ...item,
      categoryName: cat.name
    }))
  );

  return { categories, items: allItems };
}

export async function toggleItemSoldOut(id: string, currentStatus: boolean) {
  await prisma.menuItem.update({
    where: { id },
    data: { isSoldOut: !currentStatus }
  });
  revalidatePath("/dashboard/menu");
}

export async function deleteMenuItem(id: string) {
  await prisma.menuItem.delete({
    where: { id }
  });
  revalidatePath("/dashboard/menu");
}

export async function createMenuItem(data: {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isPopular: boolean;
  station: "COCINA" | "BARRA";
}) {
  const restaurant = await getDefaultRestaurant();
  
  const newItem = await prisma.menuItem.create({
    data: {
      ...data,
      restaurantId: restaurant.id
    }
  });
  
  revalidatePath("/dashboard/menu");
  return newItem;
}
