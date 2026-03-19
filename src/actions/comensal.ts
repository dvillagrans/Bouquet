"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { revalidatePath } from "next/cache";

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
