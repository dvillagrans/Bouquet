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
  items: { menuItemId: string; quantity: number }[];
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

  // Crear la Orden
  const newOrder = await prisma.order.create({
    data: {
      restaurantId: restaurant.id,
      tableId: table.id,
      status: "PENDING",
      items: {
        create: items.map(cartItem => {
          const dbItem = dbItems.find(i => i.id === cartItem.menuItemId);
          return {
            menuItemId: cartItem.menuItemId,
            quantity: cartItem.quantity,
            priceAtTime: dbItem?.price || 0,
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

export async function requestBillAndPay(tableCode: string) {
  const table = await prisma.table.findUnique({ where: { qrCode: tableCode } });
  if (!table) throw new Error("Mesa no encontrada");

  const session = await prisma.session.findFirst({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "desc" }
  });

  if (!session) throw new Error("No hay sesion activa");

  await prisma.session.update({
    where: { id: session.id },
    data: { isActive: false }
  });

  await prisma.table.update({
    where: { id: table.id },
    data: { status: "SUCIA" }
  });

  const cookieStore = await cookies();
  cookieStore.delete(`bq_session_${tableCode}`);
  cookieStore.delete(`bq_guest_${tableCode}`);

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
