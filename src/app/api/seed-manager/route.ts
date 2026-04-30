import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth-password";

export const dynamic = "force-dynamic";

export async function POST() {
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
    await prisma.appUser.create({
      data: {
        email: adminEmail,
        passwordHash: await hashPassword("temporal123"),
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
