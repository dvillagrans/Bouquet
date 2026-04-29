"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { revalidatePath } from "next/cache";

// Las categorias por default que podemos crear si esta vacio
const DEFAULT_CATEGORIES = ["Entradas", "Platos principales", "Bebidas", "Postres"];

function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function getMenuData(options?: { restaurantId?: string }) {
  const restaurant =
    options?.restaurantId != null
      ? await prisma.restaurant.findUnique({ where: { id: options.restaurantId } })
      : await getDefaultRestaurant();

  if (!restaurant) {
    throw new Error("Restaurante no encontrado");
  }
  
  // Buscar categorías
  let categories = await prisma.restaurantCategory.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { order: 'asc' },
    include: { menuItems: true }
  });

  // Crearlas si el usuario recién inicia
  if (categories.length === 0) {
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const name = DEFAULT_CATEGORIES[i];
      const existing = await prisma.restaurantCategory.findFirst({
        where: { restaurantId: restaurant.id, name },
      });
      if (!existing) {
        await prisma.restaurantCategory.create({
          data: { name, order: i, restaurantId: restaurant.id },
        });
      }
    }

    categories = await prisma.restaurantCategory.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { order: "asc" },
      include: { menuItems: true },
    });
  }

  // Devolvemos las categorias puras y una lista plana de todos los items concatenados
  const allItems = categories.flatMap(cat =>
    cat.menuItems.map(item => ({
      ...item,
      categoryName: cat.name,
      // TODO: adaptar variants a relación RestaurantMenuItemVariant en vez de JSON
      variants: [],
    }))
  );

  return { categories, items: allItems };
}

export async function createCategory(name: string) {
  const restaurant = await getDefaultRestaurant();
  const normalizedName = normalizeCategoryName(name);
  if (!normalizedName) {
    revalidatePath("/dashboard/menu");
    return { id: "", name: "" };
  }

  const last = await prisma.restaurantCategory.findFirst({
    where: { restaurantId: restaurant.id },
    orderBy: { order: "desc" },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  let cat = await prisma.restaurantCategory.findFirst({
    where: { restaurantId: restaurant.id, name: normalizedName },
  });
  if (!cat) {
    cat = await prisma.restaurantCategory.create({
      data: {
        name: normalizedName,
        order: nextOrder,
        restaurantId: restaurant.id,
      },
    });
  }
  revalidatePath("/dashboard/menu");
  return { id: cat.id, name: cat.name };
}

export async function toggleItemSoldOut(id: string, currentStatus: boolean) {
  await prisma.restaurantMenuItem.update({
    where: { id },
    data: { isSoldOut: !currentStatus }
  });
  revalidatePath("/dashboard/menu");
}

export async function deleteMenuItem(id: string) {
  await prisma.restaurantMenuItem.delete({
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
  variants?: Array<{ name: string; price: number }>;
}) {
  // TODO: adaptar a priceCents y relación de variants
  await prisma.restaurantMenuItem.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      priceCents: Math.round(data.price * 100),
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
  variants?: Array<{ name: string; price: number }>;
}) {
  const restaurant = await getDefaultRestaurant();

  // TODO: adaptar station a stationId (tabla Station) y variants a relación
  const newItem = await prisma.restaurantMenuItem.create({
    data: {
      name: data.name,
      description: data.description,
      priceCents: Math.round(data.price * 100),
      categoryId: data.categoryId,
      isPopular: data.isPopular,
      restaurantId: restaurant.id,
    }
  });

  revalidatePath("/dashboard/menu");
  return newItem;
}
