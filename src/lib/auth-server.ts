import { cookies } from "next/headers";
import {
  sessionCookieName,
  resolveAuthSecret,
  verifySessionToken,
} from "@/lib/auth-session";

export async function getCurrentSession() {
  const secret = resolveAuthSecret();

  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  if (!token) return null;

  return verifySessionToken(token, secret);
}

export async function getCurrentUser() {
  const secret = resolveAuthSecret();

  const cookieStore = await cookies();
  const token = cookieStore.get(sessionCookieName())?.value;
  if (!token) return null;

  const session = await verifySessionToken(token, secret);
  if (!session.ok) return null;

  const { prisma } = await import("@/lib/prisma");
  const user = await prisma.appUser.findUnique({
    where: { id: session.appUserId },
    include: {
      userRoles: {
        include: {
          role: { include: { permissions: { include: { permission: true } } } },
        },
      },
    },
  });
  if (!user) return null;

  const roles = user.userRoles.map((ur) => ur.role.name);
  const permissions = user.userRoles.flatMap((ur) =>
    ur.role.permissions.map((rp) => rp.permission.code)
  );

  const chainIds = [
    ...new Set(user.userRoles.map((ur) => ur.chainId).filter(Boolean)),
  ] as string[];
  const zoneIds = [
    ...new Set(user.userRoles.map((ur) => ur.zoneId).filter(Boolean)),
  ] as string[];
  const restaurantIds = [
    ...new Set(user.userRoles.map((ur) => ur.restaurantId).filter(Boolean)),
  ] as string[];

  return {
    userId: user.id,
    email: user.email,
    name: `${user.firstName} ${user.lastName}`.trim(),
    firstName: user.firstName,
    lastName: user.lastName,
    roles,
    permissions,
    chainIds,
    zoneIds,
    restaurantIds,
  };
}
