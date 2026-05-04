"use server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-action";
import { createAuditLog } from "@/lib/audit";
import { OrderStatus } from "@/lib/prisma-legacy-types";
import { revalidatePath } from "next/cache";
import { Permissions } from "@/lib/permissions";
import {
  broadcastGuestOrdersRefresh,
  broadcastKdsOrdersRefresh,
} from "@/lib/supabase/broadcast-guest-orders";

async function notifyGuestMenuOrderUpdated(orderId: string) {
  const order = await prisma.restaurantOrder.findUnique({
    where: { id: orderId },
    select: { restaurantId: true, diningSessionId: true },
  });
  if (order?.diningSessionId) {
    const session = await prisma.diningSession.findUnique({
      where: { id: order.diningSessionId },
      select: { joinCode: true },
    });
    if (session?.joinCode) await broadcastGuestOrdersRefresh(session.joinCode);
  }
  if (order) await broadcastKdsOrdersRefresh(order.restaurantId);
}

const ORDER_ROLES = ["PLATFORM_ADMIN", "CHAIN_ADMIN", "ZONE_MANAGER", "RESTAURANT_ADMIN", "ADMIN", "MESERO", "COCINA", "BARRA"];

export const getLiveOrders = withAuth(
  async (ctx) => {
    if (!ctx.restaurantId) throw new Error("No restaurant context");

    const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

    const activeSessions = await prisma.diningSession.findMany({
      where: {
        status: { in: ["ACTIVA", "EN_CONSUMO"] },
        restaurantId: ctx.restaurantId,
      },
      select: { id: true },
    });
    const activeSessionIds = activeSessions.map((s) => s.id);

    if (activeSessionIds.length === 0) {
      return [];
    }

    const orders = await prisma.restaurantOrder.findMany({
      where: {
        createdAt: { gte: startOfDay },
        diningSessionId: { in: activeSessionIds },
      },
      include: {
        items: {
          include: {
            menuItem: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return orders.map(order => ({
      id: order.id,
      tableCode: `Sesión ${order.diningSessionId.slice(-4)}`,
      status: order.status.toLowerCase() as
        | "pending"
        | "preparing"
        | "ready"
        | "delivered"
        | "cancelled",
      createdAt: order.createdAt,
      deliveredAt: undefined,
      guestName: undefined as string | undefined,
      items: order.items.map((item) => {
        const raw = String(item.menuItem?.stationId ?? "COCINA").toLowerCase();
        const station: "cocina" | "barra" = raw === "barra" ? "barra" : "cocina";
        return {
          id: item.id,
          name: item.itemNameSnapshot ?? item.menuItem?.name ?? "Platillo",
          quantity: item.quantity,
          notes: item.notes || undefined,
          variantName: item.variantNameSnapshot ?? undefined,
          station,
        };
      }),
    }));
  },
  { allowRoles: ORDER_ROLES, requireTenant: true }
);

export const advanceOrderStatus = withAuth(
  async (ctx, orderId: string, currentStatus: string) => {
    const statusFlow = {
      "pending": "PREPARING",
      "preparing": "READY",
      "ready": "DELIVERED"
    } as const;

    const nextStatus = statusFlow[currentStatus as keyof typeof statusFlow];
    if (!nextStatus) return;

    await prisma.restaurantOrder.update({
      where: { id: orderId },
      data: { status: nextStatus as OrderStatus }
    });

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: ctx.restaurantId,
      action: "UPDATE",
      entityType: "RestaurantOrder",
      entityId: orderId,
      metadata: { oldStatus: currentStatus, newStatus: nextStatus },
    });

    await notifyGuestMenuOrderUpdated(orderId);

    revalidatePath("/cocina");
    revalidatePath("/barra");
    revalidatePath("/mesa/[codigo]/menu", "page");
    revalidatePath("/mesero");
  },
  { allowRoles: ORDER_ROLES, permission: Permissions.ADVANCE_ORDER }
);

export const undoOrderStatus = withAuth(
  async (ctx, orderId: string, currentStatus: string) => {
    const undoFlow = {
      "preparing": "PENDING",
      "ready": "PREPARING"
    } as const;

    const prevStatus = undoFlow[currentStatus as keyof typeof undoFlow];
    if (!prevStatus) return;

    await prisma.restaurantOrder.update({
      where: { id: orderId },
      data: { status: prevStatus as OrderStatus }
    });

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: ctx.restaurantId,
      action: "UPDATE",
      entityType: "RestaurantOrder",
      entityId: orderId,
      metadata: { oldStatus: currentStatus, newStatus: prevStatus },
    });

    await notifyGuestMenuOrderUpdated(orderId);

    revalidatePath("/cocina");
    revalidatePath("/barra");
    revalidatePath("/mesa/[codigo]/menu", "page");
    revalidatePath("/mesero");
  },
  { allowRoles: ORDER_ROLES }
);

export const moveOrderToStatus = withAuth(
  async (ctx, orderId: string, targetStatus: "pending" | "preparing" | "ready") => {
    const STATUS_MAP = {
      pending:   "PENDING",
      preparing: "PREPARING",
      ready:     "READY",
    } as const;

    await prisma.restaurantOrder.update({
      where: { id: orderId },
      data:  { status: STATUS_MAP[targetStatus] as OrderStatus },
    });

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: ctx.restaurantId,
      action: "UPDATE",
      entityType: "RestaurantOrder",
      entityId: orderId,
      metadata: { newStatus: STATUS_MAP[targetStatus] },
    });

    await notifyGuestMenuOrderUpdated(orderId);

    revalidatePath("/cocina");
    revalidatePath("/barra");
    revalidatePath("/mesa/[codigo]/menu", "page");
  },
  { allowRoles: ORDER_ROLES }
);
