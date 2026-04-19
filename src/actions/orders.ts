"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { OrderStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { broadcastGuestOrdersRefresh } from "@/lib/supabase/broadcast-guest-orders";

async function notifyGuestMenuOrderUpdated(orderId: string) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
    include: { table: { select: { qrCode: true } } },
  });
  if (order?.table) await broadcastGuestOrdersRefresh(order.table.qrCode);
}

export async function getLiveOrders() {
  const restaurant = await getDefaultRestaurant();

  const orders = await prisma.order.findMany({
    where: { 
      restaurantId: restaurant.id,
      // Solo tomamos las ordenes del dia, o que no esten de dias pasados
      createdAt: { gte: new Date(new Date().setHours(0,0,0,0)) }
    },
    include: {
      table: true,
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
    tableCode: `Mesa ${order.table.number}`, // Mapeo para el frontend
    status: order.status.toLowerCase() as "pending" | "preparing" | "ready" | "delivered",
    createdAt: order.createdAt,
    deliveredAt: order.deliveredAt || undefined,
    items: order.items.map(item => ({
      id: item.id,
      name: item.menuItem.name,
      quantity: item.quantity,
      notes: item.notes || undefined,
      variantName: item.variantName ?? undefined,
      station: item.menuItem.station.toLowerCase() as "cocina" | "barra"
    }))
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

  await prisma.order.update({
    where: { id: orderId },
    data: { 
      status: nextStatus as OrderStatus,
      ...(nextStatus === "DELIVERED" ? { deliveredAt: new Date() } : {})
    }
  });

  await notifyGuestMenuOrderUpdated(orderId);

  revalidatePath("/cocina");
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

  await prisma.order.update({
    where: { id: orderId },
    data: { status: prevStatus as OrderStatus }
  });

  await notifyGuestMenuOrderUpdated(orderId);

  revalidatePath("/cocina");
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

  await prisma.order.update({
    where: { id: orderId },
    data:  { status: STATUS_MAP[targetStatus] as OrderStatus },
  });

  await notifyGuestMenuOrderUpdated(orderId);

  revalidatePath("/cocina");
  revalidatePath("/mesa/[codigo]/menu", "page");

}