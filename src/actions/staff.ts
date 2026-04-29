"use server";

import { getDefaultRestaurant } from "./restaurant";

// TODO: migrar a AppUser + UserRole (staff fue eliminado del schema)
export async function getStaffData() {
  await getDefaultRestaurant();
  return [] as any[];
}

export async function deleteStaffMember(_id: string) {
  throw new Error("staff eliminado del schema. Usa AppUser + UserRole.");
}

export async function createStaffMember(_data: { name: string; role: "ADMIN" | "MESERO" | "COCINA" | "BARRA"; pin: string }) {
  throw new Error("staff eliminado del schema. Usa AppUser + UserRole.");
}

export async function toggleStaffStatus(_id: string, _currentStatus: boolean) {
  throw new Error("staff eliminado del schema. Usa AppUser + UserRole.");
}
