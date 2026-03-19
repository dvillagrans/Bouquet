"use server";

import { prisma } from "@/lib/prisma";
import { getDefaultRestaurant } from "./restaurant";
import { revalidatePath } from "next/cache";

export async function getStaffData() {
  const restaurant = await getDefaultRestaurant();

  const staffList = await prisma.staff.findMany({
    where: { restaurantId: restaurant.id },
    orderBy: { createdAt: "asc" }
  });

  if (staffList.length === 0) {
    const roles: Array<"ADMIN" | "MESERO" | "COCINA" | "BARRA"> = ["ADMIN", "MESERO", "COCINA", "BARRA"];
    const defaults = [
      { name: "Admin Principal", role: roles[0], pin: "1234", active: true },
      { name: "Mesero Uno",      role: roles[1], pin: "1111", active: true },
      { name: "El Chef",         role: roles[2], pin: "2222", active: true },
    ];

    // Create all defaults in parallel — independent operations
    await Promise.all(
      defaults.map(d =>
        prisma.staff.create({
          data: {
            restaurantId: restaurant.id,
            name: d.name,
            role: d.role,
            pin: d.pin,
            isActive: d.active,
          },
        })
      )
    );

    return await prisma.staff.findMany({
      where: { restaurantId: restaurant.id },
      orderBy: { createdAt: "asc" }
    });
  }

  return staffList;
}

export async function deleteStaffMember(id: string) {
  await prisma.staff.delete({
    where: { id }
  });
  revalidatePath("/dashboard/staff");
}

export async function createStaffMember(data: { name: string; role: "ADMIN" | "MESERO" | "COCINA" | "BARRA", pin: string }) {
  const restaurant = await getDefaultRestaurant();

  const newStaff = await prisma.staff.create({
    data: {
      ...data,
      restaurantId: restaurant.id,
      isActive: true,
    }
  });

  revalidatePath("/dashboard/staff");
  return newStaff;
}

export async function toggleStaffStatus(id: string, currentStatus: boolean) {
    await prisma.staff.update({
        where: { id },
        data: { isActive: !currentStatus }
    });
    revalidatePath("/dashboard/staff");
}
