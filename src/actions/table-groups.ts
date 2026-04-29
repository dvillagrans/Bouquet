"use server";

import { revalidatePath } from "next/cache";

// TODO: migrar lógica de grupos de mesas al nuevo schema (tableGroup fue eliminado)
export async function createTableGroup(_tableIds: string[], _createdBy: string) {
  throw new Error("Grupos de mesas deshabilitados: tableGroup eliminado del schema.");
}

export async function releaseTableGroup(_groupId: string) {
  throw new Error("Grupos de mesas deshabilitados: tableGroup eliminado del schema.");
}

export async function removeFromGroup(_tableId: string) {
  throw new Error("Grupos de mesas deshabilitados: tableGroup eliminado del schema.");
}
