"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { TableStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";

export async function getTables() {
  const restaurant = await getDefaultRestaurant();
  return prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { number: 'asc' }
  });
}

function generateCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

export async function createTable(capacity: number) {
  const restaurant = await getDefaultRestaurant();
  
  // Buscar el numero siguiente de mesa
  const existingTables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { number: 'desc' },
    take: 1
  });
  
  const nextNumber = existingTables.length > 0 ? existingTables[0].number + 1 : 1;

  const newTable = await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      number: nextNumber,
      capacity,
      qrCode: generateCode(),
      status: "DISPONIBLE",
    }
  });

  revalidatePath("/dashboard/mesas");
  return newTable;
}

export async function updateTableStatus(id: string, status: TableStatus) {
  const table = await prisma.table.update({
    where: { id },
    data: { status }
  });
  
  revalidatePath("/dashboard/mesas");
  return table;
}

export async function deleteTable(id: string) {
  await prisma.table.delete({ where: { id } });
  revalidatePath("/dashboard/mesas");
}
