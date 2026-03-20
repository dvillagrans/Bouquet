"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";

export async function submitComensalOrder({
  tableCode,
  guestName,
  pax,
  items
}: {
  tableCode: string;
  guestName: string;
  pax: number;
  items: { menuItemId: string; quantity: number; variantName?: string | null }[];
}) {
  const restaurant = await getDefaultRestaurant();

  // Buscar mesa por código
  const table = await prisma.table.findUnique({
    where: { qrCode: tableCode }
  });

  if (!table) throw new Error("Mesa no encontrada: " + tableCode);
  if (table.status === "SUCIA") throw new Error("La mesa esta siendo limpiada, pide al personal que la habilite.");

  // Buscar o crear la sesión del comensal (simplificado: siempre creamos una o reusamos la de esta mesa hoy)
  let session = await prisma.session.findFirst({
    where: { 
      tableId: table.id, 
      isActive: true 
    },
    orderBy: { createdAt: "desc" }
  });

  if (!session) {
    session = await prisma.session.create({
      data: {
        tableId: table.id,
        guestName,
        pax,
        isActive: true
      }
    });

    // Actualizar mesa a ocupada
    if (table.status !== "OCUPADA") {
      await prisma.table.update({
        where: { id: table.id },
        data: { status: "OCUPADA" }
      });
      revalidatePath("/dashboard/mesas");
    }
  }

  // Pre-fetch items para asegurar el precio historico (priceAtTime)
  const itemIds = items.map(i => i.menuItemId);
  const dbItems = await prisma.menuItem.findMany({
    where: { id: { in: itemIds } }
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

  // Crear la Orden
  const newOrder = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: table.id,
      status: "PENDING",
      items: {
        create: items.map(cartItem => {
          const dbItem = dbItems.find(i => i.id === cartItem.menuItemId);
          const vn = cartItem.variantName?.trim() || null;
          return {
            menuItemId: cartItem.menuItemId,
            quantity: cartItem.quantity,
            variantName: vn,
            priceAtTime: dbItem ? priceAtTimeForItem(dbItem, vn) : 0,
            sessionId: session!.id,
          };
        })
      }
    }
  });

  revalidatePath("/cocina"); // Despertar el KDS!

  return newOrder.id;
}

export async function getTableBill(tableCode: string) {
  const table = await prisma.table.findUnique({
    where: { qrCode: tableCode },
    include: {
      orders: {
        include: {
          items: {
            include: {
              menuItem: true
            }
          }
        }
      }
    }
  });

  if (!table) throw new Error("Mesa no encontrada");

  const activeSession = await prisma.session.findFirst({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "desc" }
  });

  if (!activeSession) {
    return { items: [], total: 0 };
  }

  const items = await prisma.orderItem.findMany({
    where: { sessionId: activeSession.id },
    include: { menuItem: true }
  });

  const aggregated = items.reduce((acc, item) => {
    const existing = acc.find(i => i.id === item.menuItemId);
    if (existing) {
      existing.qty += item.quantity;
    } else {
      acc.push({
        id: item.menuItemId,
        name: item.menuItem.name,
        qty: item.quantity,
        price: item.priceAtTime,
      });
    }
    return acc;
  }, [] as { id: string; name: string; qty: number; price: number }[]);

  const total = aggregated.reduce((sum, item) => sum + (item.price * item.qty), 0);

  return { items: aggregated, total };
}

export async function guestJoinTable(tableCode: string, guestName: string, pax: number) {
  const table = await prisma.table.findUnique({ where: { qrCode: tableCode } });
  if (!table) return false;

  if (table.status !== "OCUPADA") {
    await prisma.table.update({
      where: { id: table.id },
      data: { status: "OCUPADA" }
    });
    revalidatePath("/dashboard/mesas");
  }

  let session = await prisma.session.findFirst({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "desc" }
  });

  if (!session) {
    session = await prisma.session.create({
      data: { tableId: table.id, guestName, pax, isActive: true }
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(`bq_session_${tableCode}`, session.id, {
    maxAge: 60 * 60 * 12,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  cookieStore.set(`bq_guest_${tableCode}`, encodeURIComponent(guestName), {
    maxAge: 60 * 60 * 12,
    httpOnly: false, // para leer en cliente si hace falta
    path: "/",
  });

  return true;
}

interface RequestBillAndPayInput {
  tableCode: string;
  splitMode?: "EQUAL" | "FULL";
  splitCount?: number;
  tipRate?: number;
  tipAmount?: number;
  totalAmount?: number;
  amountPaid?: number;
  paymentMethod?: "CASH" | "CARD" | "TRANSFER" | "OTHER";
}

export async function requestBillAndPay(input: RequestBillAndPayInput) {
  const table = await prisma.table.findUnique({
    where: { qrCode: input.tableCode },
    include: { restaurant: true }
  });
  if (!table) throw new Error("Mesa no encontrada");

  const session = await prisma.session.findFirst({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "desc" }
  });

  if (!session) throw new Error("No hay sesion activa");

  const billItems = await prisma.orderItem.findMany({
    where: { sessionId: session.id },
    select: { quantity: true, priceAtTime: true }
  });

  const subtotal = billItems.reduce((sum, item) => sum + (item.quantity * item.priceAtTime), 0);
  const tipRate = typeof input.tipRate === "number" ? Math.max(0, input.tipRate) : 0;
  const computedTipAmount = Math.round(subtotal * tipRate);
  const tipAmount = typeof input.tipAmount === "number" ? Math.max(0, input.tipAmount) : computedTipAmount;
  const totalAmount = typeof input.totalAmount === "number" ? Math.max(0, input.totalAmount) : subtotal + tipAmount;
  const splitMode = input.splitMode === "EQUAL" ? "EQUAL" : "FULL";
  const splitCount = Math.max(1, Math.min(20, input.splitCount ?? 1));
  const paxPaid = splitMode === "EQUAL" ? splitCount : 1;
  const amountPaid = typeof input.amountPaid === "number"
    ? Math.max(0, input.amountPaid)
    : (splitMode === "EQUAL" ? Math.ceil(totalAmount / splitCount) : totalAmount);
  const paymentMethod = input.paymentMethod ?? "CARD";

  await prisma.$transaction(async tx => {
    await tx.payment.create({
      data: {
        restaurantId: table.restaurantId,
        tableId: table.id,
        sessionId: session.id,
        status: "PAID",
        method: paymentMethod,
        splitMode,
        splitCount,
        paxPaid,
        currency: table.restaurant.currency,
        subtotal,
        tipRate,
        tipAmount,
        totalAmount,
        amountPaid,
        paidAt: new Date(),
        allocations: {
          create: {
            sessionId: session.id,
            guestName: session.guestName,
            amount: amountPaid,
          }
        }
      }
    });

    await tx.session.update({
      where: { id: session.id },
      data: { isActive: false, closedAt: new Date() }
    });

    await tx.table.update({
      where: { id: table.id },
      data: { status: "SUCIA" }
    });
  });

  const cookieStore = await cookies();
  cookieStore.delete(`bq_session_${input.tableCode}`);
  cookieStore.delete(`bq_guest_${input.tableCode}`);

  revalidatePath("/dashboard/mesas");
  return true;
}

export async function getGuestOrders(tableCode: string) {
  const table = await prisma.table.findUnique({ where: { qrCode: tableCode } });
  if (!table) return [];

  const session = await prisma.session.findFirst({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "desc" }
  });

  if (!session) return [];

  const orders = await prisma.order.findMany({
    where: { items: { some: { sessionId: session.id } } },
    include: {
      items: {
        include: { menuItem: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return orders;
}
