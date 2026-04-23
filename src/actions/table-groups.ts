"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { broadcastKdsOrdersRefresh } from "@/lib/supabase/broadcast-guest-orders";

/**
 * Create a table group from 2+ available tables.
 * All tables must be DISPONIBLE and not already in a group.
 */
export async function createTableGroup(tableIds: string[], createdBy: string) {
  if (tableIds.length < 2) {
    throw new Error("Se necesitan al menos 2 mesas para crear un grupo.");
  }

  const tables = await prisma.table.findMany({
    where: { id: { in: tableIds } },
    select: { id: true, restaurantId: true, status: true, groupId: true, number: true },
  });

  if (tables.length !== tableIds.length) {
    throw new Error("Una o más mesas no fueron encontradas.");
  }

  // Validate same restaurant
  const restaurantIds = new Set(tables.map((t) => t.restaurantId));
  if (restaurantIds.size !== 1) {
    throw new Error("Todas las mesas deben pertenecer al mismo restaurante.");
  }
  const restaurantId = tables[0].restaurantId;

  // Validate all DISPONIBLE
  const notAvailable = tables.filter((t) => t.status !== "DISPONIBLE");
  if (notAvailable.length > 0) {
    const nums = notAvailable.map((t) => t.number).join(", ");
    throw new Error(`Mesa${notAvailable.length > 1 ? "s" : ""} ${nums} no está${notAvailable.length > 1 ? "n" : ""} disponible${notAvailable.length > 1 ? "s" : ""}. Solo se pueden unir mesas libres.`);
  }

  // Validate none already in a group
  const inGroup = tables.filter((t) => t.groupId);
  if (inGroup.length > 0) {
    const nums = inGroup.map((t) => t.number).join(", ");
    throw new Error(`Mesa${inGroup.length > 1 ? "s" : ""} ${nums} ya pertenece${inGroup.length > 1 ? "n" : ""} a un grupo.`);
  }

  // Create group + assign tables atomically
  const group = await prisma.$transaction(async (tx) => {
    const newGroup = await tx.tableGroup.create({
      data: {
        restaurantId,
        createdBy,
      },
    });

    await tx.table.updateMany({
      where: { id: { in: tableIds } },
      data: { groupId: newGroup.id },
    });

    return newGroup;
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(restaurantId);

  return group;
}

/**
 * Release an entire table group — closes all sessions, marks tables as SUCIA.
 * Only used when the waiter explicitly wants to close the whole group.
 */
export async function releaseTableGroup(groupId: string) {
  const group = await prisma.tableGroup.findUnique({
    where: { id: groupId },
    include: { tables: { select: { id: true, restaurantId: true } } },
  });

  if (!group) throw new Error("Grupo no encontrado.");
  if (group.status !== "ACTIVE") throw new Error("Este grupo ya fue cerrado.");
  if (group.tables.length === 0) throw new Error("El grupo no tiene mesas.");

  const restaurantId = group.restaurantId;
  const tableIds = group.tables.map((t) => t.id);

  await prisma.$transaction(async (tx) => {
    // Close all active sessions on group tables
    await tx.session.updateMany({
      where: { tableId: { in: tableIds }, isActive: true },
      data: { isActive: false, closedAt: new Date() },
    });

    // Clear groupId and mark tables as SUCIA
    await tx.table.updateMany({
      where: { id: { in: tableIds } },
      data: { groupId: null, status: "SUCIA" },
    });

    // Close the group
    await tx.tableGroup.update({
      where: { id: groupId },
      data: { status: "CLOSED", closedAt: new Date() },
    });
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(restaurantId);
}

/**
 * Remove a single table from its group.
 * If only 1 table remains after removal, the group auto-closes.
 */
export async function removeFromGroup(tableId: string) {
  const table = await prisma.table.findUnique({
    where: { id: tableId },
    select: { id: true, groupId: true, restaurantId: true, number: true },
  });

  if (!table) throw new Error("Mesa no encontrada.");
  if (!table.groupId) throw new Error(`La mesa ${table.number} no pertenece a ningún grupo.`);

  const group = await prisma.tableGroup.findUnique({
    where: { id: table.groupId },
    include: { tables: { select: { id: true } } },
  });

  if (!group) throw new Error("Grupo no encontrado.");
  if (group.status !== "ACTIVE") throw new Error("Este grupo ya fue cerrado.");

  const remainingCount = group.tables.filter((t) => t.id !== tableId).length;

  await prisma.$transaction(async (tx) => {
    // Remove this table from the group + mark SUCIA
    await tx.table.update({
      where: { id: tableId },
      data: { groupId: null, status: "SUCIA" },
    });

    // Close sessions on this specific table
    await tx.session.updateMany({
      where: { tableId, isActive: true },
      data: { isActive: false, closedAt: new Date() },
    });

    // If only 1 (or 0) tables remain, auto-close the group
    if (remainingCount <= 1) {
      // Clear groupId on remaining table(s) too
      const remainingIds = group.tables
        .filter((t) => t.id !== tableId)
        .map((t) => t.id);

      if (remainingIds.length > 0) {
        await tx.table.updateMany({
          where: { id: { in: remainingIds } },
          data: { groupId: null },
        });
      }

      await tx.tableGroup.update({
        where: { id: group.id },
        data: { status: "CLOSED", closedAt: new Date() },
      });
    }
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(table.restaurantId);
}
