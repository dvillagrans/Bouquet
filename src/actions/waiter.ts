"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

/**
 * Update the status of a table
 */
export async function updateTableStatus(tableId: string, status: "DISPONIBLE" | "OCUPADA" | "SUCIA") {
  await prisma.table.update({
    where: { id: tableId },
    data: { status }
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
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
