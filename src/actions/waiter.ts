"use server";

import type { Prisma } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { parseVariantsJson } from "@/lib/menu-variants";
import {
  broadcastGuestOrdersRefresh,
  broadcastKdsOrdersRefresh,
} from "@/lib/supabase/broadcast-guest-orders";
import { revalidatePath } from "next/cache";
import { getDefaultRestaurant } from "./restaurant";
import { generateSecureTableCode } from "@/lib/table-qr-code";
import { signTableJoinProof } from "@/lib/table-join-proof";
import { removeFromGroup } from "./table-groups";

function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** Solo pedidos del día cuyos ítems pertenecen a sesiones activas en esa mesa (no arrastra turnos ya cerrados). */
function ordersWhereActiveSessionsForTable(tableId: string): Prisma.RestaurantOrderWhereInput {
  return {
    createdAt: { gte: startOfToday() },
    diningSession: {
      tables: {
        some: { tableId, leftAt: null },
      },
    },
    items: {
      some: {
        guest: {
          isActive: true,
        },
      },
    },
  };
}

/**
 * Update the status of a table.
 * Cleaning now only updates status and clears joinCode.
 * QR rotation is an explicit waiter action via regenerateTableQr.
 */
export async function updateTableStatus(tableId: string, status: "DISPONIBLE" | "OCUPADA" | "SUCIA") {
  const data: Prisma.DiningTableUpdateInput = { status };

  const updated = await prisma.diningTable.update({ where: { id: tableId }, data });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(updated.restaurantId);
}

/**
 * Rotate a table QR explicitly when requested by waiter.
 * Allowed only for available tables to avoid invalidating an active session.
 */
export async function regenerateTableQr(tableId: string) {
  const table = await prisma.diningTable.findUnique({
    where: { id: tableId },
    select: { id: true, status: true },
  });

  if (!table) throw new Error("Mesa no encontrada");
  if (table.status !== "DISPONIBLE") {
    throw new Error("Solo puedes regenerar QR en mesas libres.");
  }

  let newCode: string | undefined;
  for (let attempt = 0; attempt < 24; attempt++) {
    const candidate = generateSecureTableCode(10);
    const clash = await prisma.diningTable.findUnique({ where: { publicCode: candidate } });
    if (!clash) {
      newCode = candidate;
      break;
    }
  }
  if (!newCode) throw new Error("No se pudo regenerar el código QR.");

  const rotated = await prisma.diningTable.update({
    where: { id: tableId },
    data: { publicCode: newCode },
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(rotated.restaurantId);

  return { qrCode: newCode };
}

/**
 * Close all active sessions for a table and mark it as SUCIA
 */
export async function closeTable(tableId: string) {
  /* const tableCheck = await prisma.diningTable.findUnique({
    where: { id: tableId },
    select: { groupId: true },
  });

  if (tableCheck?.groupId) {
    // removeFromGroup handles: session closing, SUCIA status, and auto-close if ≤1 table left
    await removeFromGroup(tableId);
    return;
  } */

  // 1. Find all active sessions for this table
  const sessions = await prisma.diningSession.findMany({
    where: {
      tables: { some: { tableId, leftAt: null } },
      status: { in: ["ACTIVA", "EN_CONSUMO"] },
    },
  });

  // 2. Mark them as closed
  for (const session of sessions) {
    await prisma.diningSession.update({
      where: { id: session.id },
      data: { status: "CERRADA", closedAt: new Date() },
    });
  }

  // 3. Update table status to SUCIA
  const closed = await prisma.diningTable.update({
    where: { id: tableId },
    data: { status: "SUCIA" }
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(closed.restaurantId);
}

/**
 * Get summary of waiter dashboard: all tables with active sessions and order counts
 */
export async function getWaiterTablesSummary() {
  const restaurant = await getDefaultRestaurant();

  const tables = await prisma.diningTable.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { number: "asc" },
    include: {
      sessions: {
        where: { leftAt: null, diningSession: { status: { in: ["ACTIVA", "EN_CONSUMO"] } } },
        include: {
          diningSession: {
            include: {
              guests: true,
              orders: {
                where: { createdAt: { gte: startOfToday() }, status: { not: "CANCELADA" } },
                include: { items: { select: { unitPriceCents: true, quantity: true } } }
              }
            }
          }
        }
      }
    },
  });

  // Transform and aggregate data
  return tables.map((table) => {
    const sessionTable = table.sessions[0];
    const activeSession = sessionTable?.diningSession || null;
    const hostGuest = activeSession?.guests.find(g => g.isHost) || activeSession?.guests[0];

    const allOrders = table.sessions.flatMap(st => st.diningSession.orders);
    
    const billTotalCents = allOrders.reduce(
        (sum, order) =>
          sum + order.items.reduce((orderSum, item) => orderSum + item.unitPriceCents * item.quantity, 0),
        0
      );
    const billTotal = billTotalCents / 100;

    const pendingOrders = allOrders.filter((o) => o.status === "PENDIENTE" || o.status === "ABIERTA" || o.status === "PENDING").length;
    const readyOrders = allOrders.filter((o) => o.status === "LISTA" || o.status === "READY").length;

    return {
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      qrCode: table.publicCode,
      activeSession: activeSession ? {
        id: activeSession.id,
        guestName: hostGuest?.name || "Comensal",
        pax: activeSession.pax,
        createdAt: activeSession.openedAt,
      } : null,
      orderCount: allOrders.length,
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
  const table = await prisma.diningTable.findUnique({
    where: { id: tableId },
    include: {
      sessions: {
        where: { leftAt: null, diningSession: { status: { in: ["ACTIVA", "EN_CONSUMO"] } } },
        take: 1,
        include: {
          diningSession: {
            include: {
              guests: true,
              orders: {
                where: { status: { not: "CANCELADA" } },
                include: {
                  items: {
                    include: { menuItem: true, guest: { select: { name: true } } },
                  },
                },
                orderBy: { createdAt: "desc" },
              },
            },
          },
        },
      },
    },
  });

  if (!table) throw new Error("Tabla no encontrada");

  const sessionTable = table.sessions[0];
  const activeSession = sessionTable?.diningSession || null;
  const hostGuest = activeSession?.guests.find(g => g.isHost) || activeSession?.guests[0];

  const allOrders = activeSession?.orders || [];

  // Calculate bill from active session
  let billTotal = 0;
  if (activeSession) {
    const allItems = allOrders.flatMap(o => o.items);
    billTotal = allItems.reduce(
      (sum, item) => sum + (item.unitPriceCents * item.quantity) / 100,
      0
    );
  }

  let guestEntryRelativePath: string | undefined;
  try {
    const proof = signTableJoinProof(table.publicCode);
    guestEntryRelativePath = `/mesa/${encodeURIComponent(table.publicCode)}?k=${encodeURIComponent(proof)}`;
  } catch (error) {
    console.error("No se pudo firmar enlace de acceso para mesa", {
      tableId,
      reason: error instanceof Error ? error.message : String(error),
    });
  }

  return {
    table: {
      id: table.id,
      number: table.number,
      capacity: table.capacity,
      status: table.status,
      qrCode: table.publicCode,
    },
    guestEntryRelativePath,
    session: activeSession
      ? {
        id: activeSession.id,
        guestName: hostGuest?.name || "Comensal",
        pax: activeSession.pax,
        createdAt: activeSession.openedAt,
      }
      : null,
    orders: allOrders.map((order) => ({
      id: order.id,
      status: order.status,
      createdAt: order.createdAt,
      items: order.items.map((item) => ({
        id: item.id,
        name: item.menuItem?.name || item.itemNameSnapshot,
        quantity: item.quantity,
        notes: item.notes,
        price: item.unitPriceCents / 100,
        totalPrice: (item.unitPriceCents * item.quantity) / 100,
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
  const table = await prisma.diningTable.findUnique({
    where: { id: tableId },
  });

  if (!table) throw new Error("Tabla no encontrada");
  if (table.status !== "OCUPADA") throw new Error("La mesa no está ocupada");

  // 2. Get active session for table
  const sessionTable = await prisma.diningSessionTable.findFirst({
    where: { tableId, leftAt: null, diningSession: { status: { in: ["ACTIVA", "EN_CONSUMO"] } } },
    orderBy: { joinedAt: "desc" },
    include: { diningSession: { include: { guests: true } } },
  });

  if (!sessionTable) throw new Error("No hay sesión activa en esta mesa");
  const session = sessionTable.diningSession;
  const hostGuest = session.guests.find(g => g.isHost) || session.guests[0];
  if (!hostGuest) throw new Error("No hay comensales en esta sesión");

  // 3. Get menu item prices
  const dbItems = await prisma.restaurantMenuItem.findMany({
    where: { id: { in: items.map((i) => i.menuItemId) } },
  });

  function priceAtTimeForItem(
    dbItem: (typeof dbItems)[0],
    variantName: string | null | undefined
  ): number {
    return dbItem.priceCents;
  }

  // 4. Create order
  const newOrder = await prisma.restaurantOrder.create({
    data: {
      restaurantId: table.restaurantId,
      diningSessionId: session.id,
      status: "ABIERTA",
      items: {
        create: items.map((cartItem) => {
          const dbItem = dbItems.find((i) => i.id === cartItem.menuItemId);
          const vn = cartItem.variantName?.trim() || null;
          const unitPrice = dbItem ? priceAtTimeForItem(dbItem, vn) : 0;
          return {
            menuItemId: cartItem.menuItemId,
            quantity: cartItem.quantity,
            notes: cartItem.notes || null,
            variantNameSnapshot: vn,
            itemNameSnapshot: dbItem?.name || "Platillo",
            unitPriceCents: unitPrice,
            subtotalCents: unitPrice * cartItem.quantity,
            taxAmountCents: 0,
            totalCents: unitPrice * cartItem.quantity,
            taxRateBpsSnapshot: 0,
            guestId: hostGuest.id,
          };
        }),
      },
    },
  });

  const tableRow = await prisma.diningTable.findUnique({
    where: { id: tableId },
    select: { publicCode: true },
  });
  if (tableRow) await broadcastGuestOrdersRefresh(tableRow.publicCode);
  await broadcastKdsOrdersRefresh(table.restaurantId);

  revalidatePath("/mesero");
  revalidatePath("/cocina");
  revalidatePath("/barra");

  return { orderId: newOrder.id, status: "success" };
}

/**
 * Get menu data for waiter ordering
 */
export async function getMenuForOrdering() {
  const restaurant = await getDefaultRestaurant();

  const [categories, items] = await Promise.all([
    prisma.restaurantCategory.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { order: "asc" },
    }),
    prisma.restaurantMenuItem.findMany({
      where: { restaurantId: restaurant.id, isSoldOut: false },
      include: { category: true, variants: true },
    }),
  ]);

  const itemsWithVariants = items.map((item) => ({
    ...item,
    variants: item.variants.map(v => ({
      name: v.name,
      price: v.priceCents / 100
    })),
  }));

  return {
    categories,
    items: itemsWithVariants,
  };
}
