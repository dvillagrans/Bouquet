"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { OrderStatus } from "@/lib/prisma-legacy-types";
import { revalidatePath } from "next/cache";
import {
  broadcastGuestOrdersRefresh,
  broadcastKdsOrdersRefresh,
} from "@/lib/supabase/broadcast-guest-orders";

async function notifyGuestMenuOrderUpdated(orderId: string) {
  const order = await prisma.restaurantOrder.findUnique({
    where: { id: orderId },
    include: { diningSession: { select: { publicCode: true } } },
  });
  if (order?.diningSession?.publicCode) await broadcastGuestOrdersRefresh(order.diningSession.publicCode);
  if (order) await broadcastKdsOrdersRefresh(order.restaurantId);
}

export async function getLiveOrders() {
  const restaurant = await getDefaultRestaurant();

  const startOfDay = new Date(new Date().setHours(0, 0, 0, 0));

  const activeSessions = await prisma.diningSession.findMany({
    where: {
      isActive: true,
      restaurantId: restaurant.id,
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

  // Transformar al tipo esperado por el KDS UI
  return orders.map(order => ({
    id: order.id,
    tableCode: `Sesión ${order.diningSessionId.slice(-4)}`, // Mapeo para el frontend (sin table directo)
    status: order.status.toLowerCase() as
      | "pending"
      | "preparing"
      | "ready"
      | "delivered"
      | "cancelled",
    createdAt: order.createdAt,
    deliveredAt: order.deliveredAt || undefined,
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
}

export async function advanceOrderStatus(orderId: string, currentStatus: string) {
  const statusFlow = {
    "pending": "PREPARING",
    "preparing": "READY",
    "ready": "DELIVERED"
  } as const;

  const nextStatus = statusFlow[currentStatus as keyof typeof statusFlow];
  if (!nextStatus) return;

  await prisma.restaurantOrder.update({
    where: { id: orderId },
    data: { 
      status: nextStatus as OrderStatus,
      ...(nextStatus === "DELIVERED" ? { deliveredAt: new Date() } : {})
    }
  });

  await notifyGuestMenuOrderUpdated(orderId);

  revalidatePath("/cocina");
  revalidatePath("/barra");
  revalidatePath("/mesa/[codigo]/menu", "page");
  revalidatePath("/mesero");
}

export async function undoOrderStatus(orderId: string, currentStatus: string) {
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

  await notifyGuestMenuOrderUpdated(orderId);

  revalidatePath("/cocina");
  revalidatePath("/barra");
  revalidatePath("/mesa/[codigo]/menu", "page");
  revalidatePath("/mesero");
}

export async function moveOrderToStatus(
  orderId: string,
  targetStatus: "pending" | "preparing" | "ready"
) {
  const STATUS_MAP = {
    pending:   "PENDING",
    preparing: "PREPARING",
    ready:     "READY",
  } as const;

  await prisma.restaurantOrder.update({
    where: { id: orderId },
    data:  { status: STATUS_MAP[targetStatus] as OrderStatus },
  });

  await notifyGuestMenuOrderUpdated(orderId);

  revalidatePath("/cocina");
  revalidatePath("/barra");
  revalidatePath("/mesa/[codigo]/menu", "page");

}