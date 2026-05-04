"use server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-action";
import { resolveTenantScope } from "@/lib/tenant";
import { createAuditLog } from "@/lib/audit";

export async function resolveRestaurantForUser(userId: string) {
  const scope = await resolveTenantScope(userId);
  if (!scope.restaurantId) return null;
  return prisma.restaurant.findUnique({ where: { id: scope.restaurantId } });
}

export const updateRestaurantSettings = withAuth(
  async (ctx, id: string, data: { allowWaiterJoinTables?: boolean }) => {
    await prisma.restaurant.update({
      where: { id },
      data
    });

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: id,
      action: "UPDATE",
      entityType: "Restaurant",
      entityId: id,
      after: data,
    });
  }
);

export const getRestaurantOverview = withAuth(
  async (ctx) => {
    if (!ctx.restaurantId) {
      throw new Error("No restaurant context");
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { id: ctx.restaurantId },
    });
    if (!restaurant) throw new Error("Restaurant not found");

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const tables = await prisma.diningTable.findMany({
      where: { restaurantId: restaurant.id },
      select: { status: true },
    });
    const staffCount = await prisma.userRole.count({
      where: { restaurantId: restaurant.id, user: { isActive: true } },
    });
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
  },
  { requireTenant: true }
);
