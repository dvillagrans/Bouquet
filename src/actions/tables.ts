"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { TableStatus } from "@/lib/prisma-legacy-types";
import { revalidatePath } from "next/cache";
import { broadcastKdsOrdersRefresh } from "@/lib/supabase/broadcast-guest-orders";
import { findTableByQrCode } from "@/lib/find-table-by-qr";
import { generateSecureTableCode } from "@/lib/table-qr-code";
import { signTableJoinProof } from "@/lib/table-join-proof";

export async function getTables() {
  const restaurant = await getDefaultRestaurant();
  return prisma.diningTable.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { number: 'asc' }
  });
}

async function allocateUniquePublicCode(): Promise<string> {
  for (let attempt = 0; attempt < 24; attempt++) {
    const candidate = generateSecureTableCode(10);
    const clash = await prisma.diningTable.findUnique({ where: { publicCode: candidate } });
    if (!clash) return candidate;
  }
  throw new Error("No se pudo generar un código QR único.");
}

export async function createTable(capacity: number) {
  const restaurant = await getDefaultRestaurant();

  const existingTables = await prisma.diningTable.findMany({
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

  const publicCode = await allocateUniquePublicCode();

  const newTable = await prisma.diningTable.create({
    data: {
      restaurantId: restaurant.id,
      number: nextNumber,
      capacity,
      publicCode,
      status: "DISPONIBLE",
      posX,
      posY,
    }
  });

  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(restaurant.id);
  return newTable;
}

export async function updateTableStatus(id: string, status: TableStatus) {
  const table = await prisma.diningTable.update({
    where: { id },
    data: { status }
  });
  
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(table.restaurantId);
  return table;
}

export async function deleteTable(id: string) {
  const existing = await prisma.diningTable.findUnique({
    where: { id },
    select: { restaurantId: true },
  });
  await prisma.diningTable.delete({ where: { id } });
  revalidatePath("/dashboard/mesas");
  if (existing) await broadcastKdsOrdersRefresh(existing.restaurantId);
}

export async function updateTablePositions(
  positions: { id: string; posX: number; posY: number; shape?: string }[]
) {
  await Promise.all(
    positions.map(({ id, posX, posY, shape }) =>
      prisma.diningTable.update({
        where: { id },
        data: { posX, posY, ...(shape ? { shape } : {}) },
      })
    )
  );
  revalidatePath("/dashboard/mesas");
  const firstId = positions[0]?.id;
  if (firstId) {
    const row = await prisma.diningTable.findUnique({
      where: { id: firstId },
      select: { restaurantId: true },
    });
    if (row) await broadcastKdsOrdersRefresh(row.restaurantId);
  }
}


/** Vista previa firmada para staff (mapa / mesero): misma forma que el QR impreso. */
export async function getSignedGuestPreviewUrl(publicCode: string) {
  const table = await findTableByQrCode(publicCode);
  if (!table) throw new Error("Mesa no encontrada");
  const k = signTableJoinProof(table.publicCode);
  return `/mesa/${encodeURIComponent(table.publicCode)}?k=${encodeURIComponent(k)}`;
}
