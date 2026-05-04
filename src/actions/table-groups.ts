"use server";

import { withAuth } from "@/lib/auth-action";

export const createTableGroup = withAuth(
  async (_ctx, _tableIds: string[], _createdBy: string) => {
    throw new Error("Grupos de mesas deshabilitados: tableGroup eliminado del schema.");
  }
);

export const releaseTableGroup = withAuth(
  async (_ctx, _groupId: string) => {
    throw new Error("Grupos de mesas deshabilitados: tableGroup eliminado del schema.");
  }
);

export const removeFromGroup = withAuth(
  async (_ctx, _tableId: string) => {
    throw new Error("Grupos de mesas deshabilitados: tableGroup eliminado del schema.");
  }
);
