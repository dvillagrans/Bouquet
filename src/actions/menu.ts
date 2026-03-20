"use server";

import { prisma } from "@/lib/prisma";
import { parseVariantsJson } from "@/lib/menu-variants";
import { getDefaultRestaurant } from "./restaurant";
import { revalidatePath } from "next/cache";

// Las categorias por default que podemos crear si esta vacio
const DEFAULT_CATEGORIES = ["Entradas", "Platos principales", "Bebidas", "Postres"];

function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

export async function getMenuData() {
  const restaurant = await getDefaultRestaurant();
  
  // Buscar categorías
  let categories = await prisma.category.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { order: 'asc' },
    include: { items: true } // Traemos los items de una vez
  });

  // Crearlas si el usuario recién inicia (upsert secuencial: evita duplicados por requests paralelas)
  if (categories.length === 0) {
    for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
      const name = DEFAULT_CATEGORIES[i];
      await prisma.category.upsert({
        where: {
          restaurantId_name: {
            restaurantId: restaurant.id,
            name,
          },
        },
        create: { name, order: i, restaurantId: restaurant.id },
        update: {},
      });
    }

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
      categoryName: cat.name,
      variants: parseVariantsJson(item.variants),
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

  const last = await prisma.category.findFirst({
    where: { restaurantId: restaurant.id },
    orderBy: { order: "desc" },
  });
  const nextOrder = (last?.order ?? -1) + 1;

  const cat = await prisma.category.upsert({
    where: {
      restaurantId_name: {
        restaurantId: restaurant.id,
        name: normalizedName,
      },
    },
    create: {
      name: normalizedName,
      order: nextOrder,
      restaurantId: restaurant.id,
    },
    update: {},
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
  variants?: Array<{ name: string; price: number }>;
}) {
  await prisma.menuItem.update({
    where: { id },
    data: {
      name: data.name,
      description: data.description,
      price: data.price,
      categoryId: data.categoryId,
      isPopular: data.isPopular,
      variants: data.variants ?? [],
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

  const newItem = await prisma.menuItem.create({
    data: {
      ...data,
      variants: data.variants ?? [],
      restaurantId: restaurant.id,
    }
  });

  revalidatePath("/dashboard/menu");
  return newItem;
}
