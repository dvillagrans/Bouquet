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
    // Create all default categories in parallel — independent operations
    await Promise.all(
      DEFAULT_CATEGORIES.map((name, i) =>
        prisma.category.create({
          data: { name, order: i, restaurantId: restaurant.id },
        })
      )
    );

    categories = await prisma.category.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { order: "asc" },
      include: { items: true },
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

export async function createCategory(name: string) {
  const restaurant = await getDefaultRestaurant();
  const normalizedName = name.trim();

  // Evita duplicar categorías con el mismo nombre en el mismo restaurante.
  const existing = await prisma.category.findFirst({
    where: { restaurantId: restaurant.id, name: normalizedName },
  });
  if (existing) {
    revalidatePath("/dashboard/menu");
    return { id: existing.id, name: existing.name };
  }

  const last = await prisma.category.findFirst({
    where: { restaurantId: restaurant.id },
    orderBy: { order: "desc" },
  });
  const cat = await prisma.category.create({
    data: { name: normalizedName, order: (last?.order ?? -1) + 1, restaurantId: restaurant.id },
  });
  revalidatePath("/dashboard/menu");
  return { id: cat.id, name: cat.name };
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

export async function updateMenuItem(id: string, data: {
  name: string;
  description?: string;
  price: number;
  categoryId: string;
  isPopular: boolean;
}) {
  await prisma.menuItem.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      isPopular: data.isPopular,
    },
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
