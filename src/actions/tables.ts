"use server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-action";
import { createAuditLog } from "@/lib/audit";
import { TableStatus } from "@/lib/prisma-legacy-types";
import { revalidatePath } from "next/cache";
import { broadcastKdsOrdersRefresh } from "@/lib/supabase/broadcast-guest-orders";
import { findTableByQrCode } from "@/lib/find-table-by-qr";
import { generateSecureTableCode } from "@/lib/table-qr-code";
import { signTableJoinProof } from "@/lib/table-join-proof";
import { Permissions } from "@/lib/permissions";

const TABLE_ROLES = ["PLATFORM_ADMIN", "CHAIN_ADMIN", "ZONE_MANAGER", "RESTAURANT_ADMIN", "ADMIN", "MESERO"];

export const getTables = withAuth(
  async (ctx) => {
    if (!ctx.restaurantId) throw new Error("No restaurant context");
    return prisma.diningTable.findMany({
      where: { restaurantId: ctx.restaurantId },
      orderBy: { number: 'asc' }
    });
  },
  { allowRoles: TABLE_ROLES, requireTenant: true }
);

async function allocateUniquePublicCode(): Promise<string> {
  for (let attempt = 0; attempt < 24; attempt++) {
    const candidate = generateSecureTableCode(10);
    const clash = await prisma.diningTable.findUnique({ where: { publicCode: candidate } });
    if (!clash) return candidate;
  }
  throw new Error("No se pudo generar un código QR único.");
}

export const createTable = withAuth(
  async (ctx, capacity: number) => {
    if (!ctx.restaurantId) throw new Error("No restaurant context");

    const existingTables = await prisma.diningTable.findMany({
      where: { restaurantId: ctx.restaurantId },
      orderBy: { number: 'desc' },
    });

    const nextNumber = existingTables.length > 0 ? existingTables[0].number + 1 : 1;

    const COLS = 5;
    const STEP = 140;
    const MARGIN = 80;
    const idx = existingTables.length;
    const posX = MARGIN + (idx % COLS) * STEP;
    const posY = MARGIN + Math.floor(idx / COLS) * STEP;

    const publicCode = await allocateUniquePublicCode();

    const newTable = await prisma.diningTable.create({
      data: {
        restaurantId: ctx.restaurantId,
        number: nextNumber,
        capacity,
        publicCode,
        status: "DISPONIBLE",
        posX,
        posY,
      }
    });

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: ctx.restaurantId,
      action: "CREATE",
      entityType: "DiningTable",
      entityId: newTable.id,
      after: { number: nextNumber, capacity, publicCode },
    });

    revalidatePath("/dashboard/mesas");
    await broadcastKdsOrdersRefresh(ctx.restaurantId);
    return newTable;
  },
  { allowRoles: TABLE_ROLES, permission: Permissions.MANAGE_TABLES }
);

export const updateTableStatus = withAuth(
  async (ctx, id: string, status: TableStatus) => {
    const table = await prisma.diningTable.update({
      where: { id },
      data: { status }
    });

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: table.restaurantId,
      action: "UPDATE",
      entityType: "DiningTable",
      entityId: id,
      after: { status },
    });

    revalidatePath("/dashboard/mesas");
    await broadcastKdsOrdersRefresh(table.restaurantId);
    return table;
  },
  { allowRoles: TABLE_ROLES, permission: Permissions.MANAGE_TABLES }
);

export const deleteTable = withAuth(
  async (ctx, id: string) => {
    const existing = await prisma.diningTable.findUnique({
      where: { id },
      select: { restaurantId: true },
    });
    await prisma.diningTable.delete({ where: { id } });

    if (existing) {
      createAuditLog({
        actorUserId: ctx.userId,
        restaurantId: existing.restaurantId,
        action: "DELETE",
        entityType: "DiningTable",
        entityId: id,
      });
    }

    revalidatePath("/dashboard/mesas");
    if (existing) await broadcastKdsOrdersRefresh(existing.restaurantId);
  },
  { allowRoles: TABLE_ROLES, permission: Permissions.MANAGE_TABLES }
);

export const updateTablePositions = withAuth(
  async (ctx, positions: { id: string; posX: number; posY: number; shape?: string }[]) => {
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
  },
  { allowRoles: TABLE_ROLES, permission: Permissions.MANAGE_TABLES }
);

export const getSignedGuestPreviewUrl = withAuth(
  async (_ctx, publicCode: string) => {
    const table = await findTableByQrCode(publicCode);
    if (!table) throw new Error("Mesa no encontrada");
    const k = signTableJoinProof(table.publicCode);
    return `/mesa/${encodeURIComponent(table.publicCode)}?k=${encodeURIComponent(k)}`;
  },
  { allowRoles: TABLE_ROLES }
);

export const updateTableConfig = withAuth(
  async (ctx, tableId: string, data: { shape?: string; capacity?: number; number?: number }) => {
    const table = await prisma.diningTable.findUnique({
      where: { id: tableId },
      select: { restaurantId: true },
    });
    if (!table) throw new Error("Mesa no encontrada");

    const update: { shape?: string; capacity?: number; number?: number } = {};
    if (data.shape != null) update.shape = data.shape;
    if (data.capacity != null) update.capacity = data.capacity;
    if (data.number != null) update.number = data.number;

    await prisma.diningTable.update({ where: { id: tableId }, data: update });

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: table.restaurantId,
      action: "UPDATE",
      entityType: "DiningTable",
      entityId: tableId,
      after: update as any,
    });

    revalidatePath("/mesero");
    revalidatePath("/dashboard/mesas");
    await broadcastKdsOrdersRefresh(table.restaurantId);
  },
  { allowRoles: TABLE_ROLES, permission: Permissions.MANAGE_TABLES }
);
