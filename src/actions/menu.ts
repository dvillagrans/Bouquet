"use server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-action";
import { createAuditLog } from "@/lib/audit";
import { revalidatePath } from "next/cache";
import { Permissions } from "@/lib/permissions";

const DEFAULT_CATEGORIES = ["Entradas", "Platos principales", "Bebidas", "Postres"];

function normalizeCategoryName(name: string) {
  return name.trim().replace(/\s+/g, " ");
}

const MENU_ROLES = ["PLATFORM_ADMIN", "CHAIN_ADMIN", "ZONE_MANAGER", "RESTAURANT_ADMIN", "ADMIN", "MESERO"];

/**
 * Guest-facing: no auth required. Callers may pass restaurantId explicitly.
 * If no restaurantId is provided and the caller is authenticated (e.g. dashboard),
 * this will throw because there is no fallback.
 */
export async function getMenuData(options?: { restaurantId?: string }) {
  const restaurant = options?.restaurantId != null
    ? await prisma.restaurant.findUnique({ where: { id: options.restaurantId } })
    : null;

  if (!restaurant) {
    throw new Error("Restaurante no encontrado");
  }

  let categories = await prisma.restaurantCategory.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { order: 'asc' },
    include: {
      menuItems: {
        include: { variants: true }
      }
    }
  });

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
      include: {
        menuItems: {
          include: { variants: true }
        }
      },
    });
  }

  const allItems = categories.flatMap(cat =>
    cat.menuItems.map(item => ({
      ...item,
      categoryName: cat.name,
      price: (item.priceCents || 0) / 100,
      variants: item.variants.map(v => ({
        name: v.name,
        price: (v.priceCents || 0) / 100,
      })),
    }))
  );

  return { categories, items: allItems };
}

export const createCategory = withAuth(
  async (ctx, name: string) => {
    if (!ctx.restaurantId) throw new Error("No restaurant context");
    const normalizedName = normalizeCategoryName(name);
    if (!normalizedName) {
      revalidatePath("/dashboard/menu");
      return { id: "", name: "" };
    }

    const last = await prisma.restaurantCategory.findFirst({
      where: { restaurantId: ctx.restaurantId },
      orderBy: { order: "desc" },
    });
    const nextOrder = (last?.order ?? -1) + 1;

    let cat = await prisma.restaurantCategory.findFirst({
      where: { restaurantId: ctx.restaurantId, name: normalizedName },
    });
    if (!cat) {
      cat = await prisma.restaurantCategory.create({
        data: {
          name: normalizedName,
          order: nextOrder,
          restaurantId: ctx.restaurantId,
        },
      });
    }

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: ctx.restaurantId,
      action: "CREATE",
      entityType: "RestaurantCategory",
      entityId: cat.id,
      after: { name: normalizedName, order: nextOrder },
    });

    revalidatePath("/dashboard/menu");
    return { id: cat.id, name: cat.name };
  },
  { allowRoles: MENU_ROLES, permission: Permissions.MANAGE_MENU }
);

export const toggleItemSoldOut = withAuth(
  async (ctx, id: string, currentStatus: boolean) => {
    await prisma.restaurantMenuItem.update({
      where: { id },
      data: { isSoldOut: !currentStatus }
    });

    createAuditLog({
      actorUserId: ctx.userId,
      action: "UPDATE",
      entityType: "RestaurantMenuItem",
      entityId: id,
      after: { isSoldOut: !currentStatus },
    });

    revalidatePath("/dashboard/menu");
  },
  { allowRoles: MENU_ROLES, permission: Permissions.MANAGE_MENU }
);

export const deleteMenuItem = withAuth(
  async (ctx, id: string) => {
    await prisma.restaurantMenuItem.delete({
      where: { id }
    });

    createAuditLog({
      actorUserId: ctx.userId,
      action: "DELETE",
      entityType: "RestaurantMenuItem",
      entityId: id,
    });

    revalidatePath("/dashboard/menu");
  },
  { allowRoles: MENU_ROLES, permission: Permissions.MANAGE_MENU }
);

export const updateMenuItem = withAuth(
  async (ctx, id: string, data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    isPopular: boolean;
    variants?: Array<{ name: string; price: number }>;
  }) => {
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

    createAuditLog({
      actorUserId: ctx.userId,
      action: "UPDATE",
      entityType: "RestaurantMenuItem",
      entityId: id,
      after: data,
    });

    revalidatePath("/dashboard/menu");
  },
  { allowRoles: MENU_ROLES, permission: Permissions.MANAGE_MENU }
);

export const createMenuItem = withAuth(
  async (ctx, data: {
    name: string;
    description?: string;
    price: number;
    categoryId: string;
    isPopular: boolean;
    station: "COCINA" | "BARRA";
    variants?: Array<{ name: string; price: number }>;
  }) => {
    if (!ctx.restaurantId) throw new Error("No restaurant context");

    const newItem = await prisma.restaurantMenuItem.create({
      data: {
        name: data.name,
        description: data.description,
        priceCents: Math.round(data.price * 100),
        categoryId: data.categoryId,
        isPopular: data.isPopular,
        restaurantId: ctx.restaurantId,
      }
    });

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: ctx.restaurantId,
      action: "CREATE",
      entityType: "RestaurantMenuItem",
      entityId: newItem.id,
      after: data,
    });

    revalidatePath("/dashboard/menu");
    return newItem;
  },
  { allowRoles: MENU_ROLES, permission: Permissions.MANAGE_MENU }
);
