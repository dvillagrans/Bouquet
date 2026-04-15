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

  const existingTables = await prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { number: 'desc' },
  });

  const nextNumber = existingTables.length > 0 ? existingTables[0].number + 1 : 1;

  // Auto-position: grid layout starting at (80,80), step 140px
  const COLS = 5;
  const STEP = 140;
  const MARGIN = 80;
  const idx = existingTables.length;
  const posX = MARGIN + (idx % COLS) * STEP;
  const posY = MARGIN + Math.floor(idx / COLS) * STEP;

  const newTable = await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      number: nextNumber,
      capacity,
      qrCode: generateCode(),
      status: "DISPONIBLE",
      posX,
      posY,
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

export async function updateTablePositions(
  positions: { id: string; posX: number; posY: number; shape?: string }[]
) {
  await Promise.all(
    positions.map(({ id, posX, posY, shape }) =>
      prisma.table.update({
        where: { id },
        data: { posX, posY, ...(shape ? { shape } : {}) },
      })
    )
  );
  revalidatePath("/dashboard/mesas");
}

export async function joinTables(parentTableId: string, childTableIds: string[]) {
  await prisma.table.updateMany({
    where: { id: { in: childTableIds } },
    data: { parentTableId }
  });
  revalidatePath("/dashboard/mesas");
}

export async function separateTable(tableId: string) {
  await prisma.table.update({
    where: { id: tableId },
    data: { parentTableId: null }
  });
  revalidatePath("/dashboard/mesas");
}
