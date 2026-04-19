"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { TableStatus } from "@/generated/prisma";
import { revalidatePath } from "next/cache";
import { findTableByQrCode } from "@/lib/find-table-by-qr";
import { generateSecureTableCode } from "@/lib/table-qr-code";
import { signTableJoinProof } from "@/lib/table-join-proof";

export async function getTables() {
  const restaurant = await getDefaultRestaurant();
  return prisma.table.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { number: 'asc' }
  });
}

async function allocateUniqueQrCode(): Promise<string> {
  for (let attempt = 0; attempt < 24; attempt++) {
    const candidate = generateSecureTableCode(10);
    const clash = await prisma.table.findUnique({ where: { qrCode: candidate } });
    if (!clash) return candidate;
  }
  throw new Error("No se pudo generar un código QR único.");
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

  const qrCode = await allocateUniqueQrCode();

  const newTable = await prisma.table.create({
    data: {
      restaurantId: restaurant.id,
      number: nextNumber,
      capacity,
      qrCode,
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

/** Vista previa firmada para staff (mapa / mesero): misma forma que el QR impreso. */
export async function getSignedGuestPreviewUrl(qrCode: string) {
  const table = await findTableByQrCode(qrCode);
  if (!table) throw new Error("Mesa no encontrada");
  const k = signTableJoinProof(table.qrCode);
  return `/mesa/${encodeURIComponent(table.qrCode)}?k=${encodeURIComponent(k)}`;
}
