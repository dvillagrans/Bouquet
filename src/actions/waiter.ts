"use server";

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { parseVariantsJson } from "@/lib/menu-variants";
import { broadcastGuestOrdersRefresh } from "@/lib/supabase/broadcast-guest-orders";
import { revalidatePath } from "next/cache";
import { getDefaultRestaurant } from "./restaurant";

/**
 * Update the status of a table.
 * Cleaning now only updates status and clears joinCode.
 * QR rotation is an explicit waiter action via regenerateTableQr.
 */
export async function updateTableStatus(tableId: string, status: "DISPONIBLE" | "OCUPADA" | "SUCIA") {
  const data: Prisma.TableUpdateInput = { status };

  if (status === "DISPONIBLE") {
    // Clear join code so the next host gets a fresh one
    data.joinCode = null;
  }

  await prisma.table.update({ where: { id: tableId }, data });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
}

/**
 * Rotate a table QR explicitly when requested by waiter.
 * Allowed only for available tables to avoid invalidating an active session.
 */
export async function regenerateTableQr(tableId: string) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    select: { id: true, status: true },
  });

  if (!table) throw new Error("Mesa no encontrada");
  if (table.status !== "DISPONIBLE") {
    throw new Error("Solo puedes regenerar QR en mesas libres.");
  }

  let newCode: string;
  do {
    newCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  } while (await prisma.table.findUnique({ where: { qrCode: newCode } }));

  await prisma.table.update({
    where: { id: tableId },
    data: { qrCode: newCode, joinCode: null },
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");

  return { qrCode: newCode };
}

/**
 * Close all active sessions for a table and mark it as SUCIA
 */
export async function closeTable(tableId: string) {
  // 1. Find all active sessions for this table
  const sessions = await prisma.session.findMany({
    where: { tableId, isActive: true }
  });

  // 2. Mark them as closed
  for (const session of sessions) {
    await prisma.session.update({
      where: { id: session.id },
      data: { isActive: false, closedAt: new Date() }
    });
  }

  // 3. Update table status to SUCIA
  await prisma.table.update({
    where: { id: tableId },
    data: { status: "SUCIA" }
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
}

/**
 * Get summary of waiter dashboard: all tables with active sessions and order counts
 */
export async function getWaiterTablesSummary() {
  const restaurant = await getDefaultRestaurant();

  const tables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { number: "asc" },
    include: {
      sessions: {
        where: { isActive: true },
        take: 1,
        select: {
          id: true,
          guestName: true,
          pax: true,
          createdAt: true,
        },
      },
      orders: {
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        select: {
          id: true,
          status: true,
          items: {
            select: { priceAtTime: true, quantity: true },
          },
        },
      },
    },
  });

  // Transform and aggregate data
  return tables.map((table) => {
    const activeSession = table.sessions[0] || null;
    const billTotal = table.orders.reduce(
      (sum, order) =>
        sum + order.items.reduce((orderSum, item) => orderSum + item.priceAtTime * item.quantity, 0),
      0
    );
    const pendingOrders = table.orders.filter((o) => o.status === "PENDING").length;
    const readyOrders = table.orders.filter((o) => o.status === "READY").length;

    return {
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      parentTableId: table.parentTableId,
      qrCode: table.qrCode,
      activeSession,
      orderCount: table.orders.length,
      pendingCount: pendingOrders,
      readyCount: readyOrders,
      billTotal,
    };
  });
}

/**
 * Get detailed info for a specific table
 */
export async function getTableDetail(tableId: string) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    include: {
      sessions: {
        where: { isActive: true },
        take: 1,
        include: {
          orderItems: {
            select: { id: true, quantity: true, notes: true, priceAtTime: true },
          },
        },
      },
      orders: {
        where: {
          createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
        include: {
          items: {
            include: { menuItem: true, session: { select: { guestName: true } } },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!table) throw new Error("Tabla no encontrada");

  const activeSession = table.sessions[0] || null;

  // Calculate bill from active session
  let billTotal = 0;
  if (activeSession) {
    billTotal = activeSession.orderItems.reduce(
      (sum, item) => sum + item.priceAtTime * item.quantity,
      0
    );
  }

  return {
    table: {
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      qrCode: table.qrCode,
    },
    session: activeSession
      ? {
        id: activeSession.id,
        guestName: activeSession.guestName,
        pax: activeSession.pax,
        createdAt: activeSession.createdAt,
      }
      : null,
    orders: table.orders.map((order) => ({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.menuItem.name,
        quantity: item.quantity,
        notes: item.notes,
        price: item.priceAtTime,
        totalPrice: item.priceAtTime * item.quantity,
      })),
    })),
    billTotal,
  };
}

/**
 * Create an order as waiter (for a seated table)
 */
export async function waiterCreateOrder(
  tableId: string,
  items: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
    variantName?: string | null;
  }>
) {
  // 1. Validate table exists and is occupied
  const table = await prisma.table.findUnique({
    where: { id: tableId },
  });

  if (!table) throw new Error("Tabla no encontrada");
  if (table.status !== "OCUPADA") throw new Error("La mesa no está ocupada");

  // 2. Get active session for table
  let session = await prisma.session.findFirst({
    where: { tableId, isActive: true },
    orderBy: { createdAt: "desc" },
  });

  if (!session) throw new Error("No hay sesión activa en esta mesa");

  // 3. Get menu item prices
  const dbItems = await prisma.menuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) } },
  });

  function priceAtTimeForItem(
    dbItem: (typeof dbItems)[0],
    variantName: string | null | undefined
  ): number {
    const raw = dbItem.variants;
    const arr = Array.isArray(raw) ? raw : [];
    if (variantName && arr.length > 0) {
      const found = arr.find(
        (x: unknown) =>
          x &&
          typeof x === "object" &&
          (x as { name?: string }).name === variantName &&
          typeof (x as { price?: unknown }).price === "number"
      ) as { price: number } | undefined;
      if (found) return found.price;
    }
    return dbItem.price;
  }

  // 4. Create order
  const newOrder = await prisma.order.create({
    data: {
      restaurantId: table.restaurantId,
      tableId,
      status: "PENDING",
      items: {
        create: items.map((cartItem) => {
          const dbItem = dbItems.find((i) => i.id === cartItem.menuItemId);
          const vn = cartItem.variantName?.trim() || null;
          return {
            menuItemId: cartItem.menuItemId,
            quantity: cartItem.quantity,
            notes: cartItem.notes || null,
            variantName: vn,
            priceAtTime: dbItem ? priceAtTimeForItem(dbItem, vn) : 0,
            sessionId: session!.id,
          };
        }),
      },
    },
  });

  const tableRow = await prisma.table.findUnique({
    where: { id: tableId },
    select: { qrCode: true },
  });
  if (tableRow) await broadcastGuestOrdersRefresh(tableRow.qrCode);

  revalidatePath("/mesero");
  revalidatePath("/cocina");

  return { orderId: newOrder.id, status: "success" };
}

/**
 * Get menu data for waiter ordering
 */
export async function getMenuForOrdering() {
  const restaurant = await getDefaultRestaurant();

  const [categories, items] = await Promise.all([
    prisma.category.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { order: "asc" },
    }),
    prisma.menuItem.findMany({
      where: { restaurantId: restaurant.id, isSoldOut: false },
      include: { category: true },
    }),
  ]);

  const itemsWithVariants = items.map((item) => ({
    ...item,
    variants: parseVariantsJson(item.variants),
  }));

  return {
    categories,
    items: itemsWithVariants,
  };
}
