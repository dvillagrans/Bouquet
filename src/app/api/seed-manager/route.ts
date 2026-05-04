import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-password";
import { getCurrentUser } from "@/lib/auth-server";
import { Permissions } from "@/lib/permissions";

export const dynamic = "force-dynamic";

export async function POST() {
  const currentUser = await getCurrentUser();
  if (!currentUser) {
    return NextResponse.json({ ok: false, error: "No autenticado." }, { status: 401 });
  }
  if (!currentUser.roles.includes("PLATFORM_ADMIN")) {
    return NextResponse.json({ ok: false, error: "Acceso denegado." }, { status: 403 });
  }
  if (!currentUser.permissions.includes(Permissions.RUN_SEED)) {
    if (process.env.NODE_ENV !== "production") {
      console.warn(`[auth] Missing permission "${Permissions.RUN_SEED}" for user ${currentUser.email} — allowing in dev`);
    } else {
      return NextResponse.json({ ok: false, error: "Acceso denegado." }, { status: 403 });
    }
  }

  // Crear roles base si no existen
  const roles = [
    { id: "role-platform-admin", name: "PLATFORM_ADMIN", scope: "PLATFORM" },
    { id: "role-chain-admin", name: "CHAIN_ADMIN", scope: "CHAIN" },
    { id: "role-zone-manager", name: "ZONE_MANAGER", scope: "ZONE" },
    { id: "role-restaurant-admin", name: "RESTAURANT_ADMIN", scope: "RESTAURANT" },
    { id: "role-mesero", name: "MESERO", scope: "RESTAURANT" },
    { id: "role-cocina", name: "COCINA", scope: "RESTAURANT" },
    { id: "role-barra", name: "BARRA", scope: "RESTAURANT" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: {},
      create: { ...r, isBase: true, isActive: true },
    });
  }

  // Crear admin por defecto si no existe
  const adminEmail = "admin@bouquet.com";
  const existing = await prisma.appUser.findUnique({ where: { email: adminEmail } });
  if (!existing) {
    const defaultPassword = randomBytes(16).toString("base64url");
    console.log(`[seed-manager] Default admin password: ${defaultPassword}`);
    await prisma.appUser.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword(defaultPassword),
        firstName: "Admin",
        lastName: "Bouquet",
        isActive: true,
        userRoles: {
          create: {
            roleId: "role-platform-admin",
            contextType: "PLATFORM",
          },
        },
      },
    });
  }

  return NextResponse.json({ ok: true, mensaje: "Seed completado con AppUser + UserRole." });
}
