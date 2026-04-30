"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-password";
import { getDefaultRestaurant } from "./restaurant";

async function ensureRestaurantRole(name: string) {
  return prisma.role.upsert({
    where: { id: `role-restaurant-${name.toLowerCase()}` },
    update: {},
    create: {
      id: `role-restaurant-${name.toLowerCase()}`,
      name,
      scope: "RESTAURANT",
      isBase: true,
      isActive: true,
    },
  });
}

export type Staff = {
  id: string;
  name: string;
  role: string;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

function toStaff(user: {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  userRoles: { role: { name: string } }[];
}): Staff {
  const name = `${user.firstName} ${user.lastName}`.trim();
  const role = user.userRoles[0]?.role.name ?? "MESERO";
  return {
    id: user.id,
    name,
    role,
    email: user.email,
    isActive: user.isActive,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  };
}

export async function getStaffData(): Promise<Staff[]> {
  const restaurant = await getDefaultRestaurant();
  const users = await prisma.appUser.findMany({
    where: {
      isActive: true,
      userRoles: {
        some: {
          restaurantId: restaurant.id,
          contextType: "RESTAURANT",
        },
      },
    },
    include: {
      userRoles: {
        where: { restaurantId: restaurant.id },
        include: { role: { select: { name: true } } },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return users.map(toStaff);
}

export async function createStaffMember(data: {
  name: string;
  role: "ADMIN" | "MESERO" | "COCINA" | "BARRA";
}) {
  const restaurant = await getDefaultRestaurant();
  const roleName = data.role === "ADMIN" ? "ADMIN" : data.role;
  const role = await ensureRestaurantRole(roleName);

  const names = data.name.trim().split(/\s+/);
  const firstName = names[0] ?? "Sin";
  const lastName = names.slice(1).join(" ") ?? "Nombre";
  const email = `staff-${Date.now()}@bouquet.internal`;
  const tempPassword = Math.random().toString(36).slice(-8);
  const passwordHash = await hashPassword(tempPassword);

  const user = await prisma.appUser.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      isActive: true,
      userRoles: {
        create: {
          roleId: role.id,
          contextType: "RESTAURANT",
          restaurantId: restaurant.id,
        },
      },
    },
    include: {
      userRoles: {
        where: { restaurantId: restaurant.id },
        include: { role: { select: { name: true } } },
      },
    },
  });

  return toStaff(user);
}

export async function deleteStaffMember(id: string) {
  const restaurant = await getDefaultRestaurant();
  // Soft-delete: archivar el AppUser y desactivar
  await prisma.appUser.update({
    where: { id },
    data: { isActive: false, archivedAt: new Date() },
  });
  // Eliminar UserRole del restaurante
  await prisma.userRole.deleteMany({
    where: { userId: id, restaurantId: restaurant.id },
  });
}

export async function toggleStaffStatus(id: string, _currentStatus: boolean) {
  const user = await prisma.appUser.findUnique({ where: { id } });
  if (!user) throw new Error("Usuario no encontrado");
  await prisma.appUser.update({
    where: { id },
    data: { isActive: !user.isActive },
  });
}
