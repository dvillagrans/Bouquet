"use server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-action";
import { createAuditLog } from "@/lib/audit";
import { hashPassword } from "@/lib/auth-password";
import { Permissions } from "@/lib/permissions";
import { invalidateAllSessions } from "@/lib/auth-session";

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

const STAFF_ROLES = ["PLATFORM_ADMIN", "CHAIN_ADMIN", "ZONE_MANAGER", "RESTAURANT_ADMIN", "ADMIN"];

export const getStaffData = withAuth(
  async (ctx): Promise<Staff[]> => {
    if (!ctx.restaurantId) throw new Error("No restaurant context");
    const users = await prisma.appUser.findMany({
      where: {
        isActive: true,
        userRoles: {
          some: {
            restaurantId: ctx.restaurantId,
            contextType: "RESTAURANT",
          },
        },
      },
      include: {
        userRoles: {
          where: { restaurantId: ctx.restaurantId },
          include: { role: { select: { name: true } } },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return users.map(toStaff);
  },
  { allowRoles: STAFF_ROLES, requireTenant: true }
);

export const createStaffMember = withAuth(
  async (ctx, data: {
    name: string;
    role: "ADMIN" | "MESERO" | "COCINA" | "BARRA";
  }) => {
    if (!ctx.restaurantId) throw new Error("No restaurant context");
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
            restaurantId: ctx.restaurantId,
          },
        },
      },
      include: {
        userRoles: {
          where: { restaurantId: ctx.restaurantId },
          include: { role: { select: { name: true } } },
        },
      },
    });

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: ctx.restaurantId,
      action: "CREATE",
      entityType: "AppUser",
      entityId: user.id,
      after: { name: data.name, role: roleName, email },
    });

    return toStaff(user);
  },
  { allowRoles: STAFF_ROLES, permission: Permissions.MANAGE_STAFF }
);

export const deleteStaffMember = withAuth(
  async (ctx, id: string) => {
    if (!ctx.restaurantId) throw new Error("No restaurant context");
    await prisma.appUser.update({
      where: { id },
      data: { isActive: false, archivedAt: new Date() },
    });
    await prisma.userRole.deleteMany({
      where: { userId: id, restaurantId: ctx.restaurantId },
    });
    invalidateAllSessions(id);

    createAuditLog({
      actorUserId: ctx.userId,
      restaurantId: ctx.restaurantId,
      action: "DELETE",
      entityType: "AppUser",
      entityId: id,
    });
  },
  { allowRoles: STAFF_ROLES, permission: Permissions.MANAGE_STAFF }
);

export const toggleStaffStatus = withAuth(
  async (ctx, id: string, _currentStatus: boolean) => {
    const user = await prisma.appUser.findUnique({ where: { id } });
    if (!user) throw new Error("Usuario no encontrado");
    const newStatus = !user.isActive;
    await prisma.appUser.update({
      where: { id },
      data: { isActive: newStatus },
    });

    createAuditLog({
      actorUserId: ctx.userId,
      action: "UPDATE",
      entityType: "AppUser",
      entityId: id,
      after: { isActive: newStatus },
    });
  },
  { allowRoles: STAFF_ROLES, permission: Permissions.MANAGE_STAFF }
);
