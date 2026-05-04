/**
 * Seed de Gobernanza — Crea usuarios de prueba para todos los roles.
 *
 * Uso:  npx tsx scripts/seed-governance.ts
 *
 * Requiere: base de datos corriendo y migraciones aplicadas.
 * Crea: roles base, cadena/zona/restaurante demo, y 6 usuarios con contraseñas conocidas.
 *
 * Credenciales resultantes:
 *   admin@bouquet.com       / temporal123  → PLATFORM_ADMIN
 *   cadena@bouquet.demo     / demo123      → CHAIN_ADMIN
 *   zona@bouquet.demo       / demo123      → ZONE_MANAGER
 *   restaurante@bouquet.demo / demo123     → RESTAURANT_ADMIN
 *   mesero@bouquet.demo     / demo123      → MESERO
 *   cocina@bouquet.demo     / demo123      → COCINA
 */

import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth-password";

async function main() {
  console.log("🌱 Iniciando seed de gobernanza...\n");

  // ── 1. Asegurar roles base ──────────────────────────────────────────
  const roles = [
    { id: "role-platform-admin",    name: "PLATFORM_ADMIN",    scope: "PLATFORM" },
    { id: "role-chain-admin",       name: "CHAIN_ADMIN",       scope: "CHAIN" },
    { id: "role-zone-manager",      name: "ZONE_MANAGER",      scope: "ZONE" },
    { id: "role-restaurant-admin",  name: "RESTAURANT_ADMIN",  scope: "RESTAURANT" },
    { id: "role-mesero",            name: "MESERO",            scope: "RESTAURANT" },
    { id: "role-cocina",            name: "COCINA",            scope: "RESTAURANT" },
    { id: "role-barra",             name: "BARRA",             scope: "RESTAURANT" },
  ];

  for (const r of roles) {
    await prisma.role.upsert({
      where: { id: r.id },
      update: {},
      create: { ...r, isBase: true, isActive: true },
    });
  }
  console.log("✅ Roles base asegurados");

  // ── 2. Moneda por defecto ──────────────────────────────────────────
  await prisma.currency.upsert({
    where: { code: "MXN" },
    update: {},
    create: { code: "MXN", name: "Peso Mexicano", symbol: "$" },
  });
  console.log("✅ Moneda MXN asegurada");

  // ── 3. PLATFORM_ADMIN ──────────────────────────────────────────────
  const adminUser = await prisma.appUser.upsert({
    where: { email: "admin@bouquet.com" },
    update: {},
    create: {
      email: "admin@bouquet.com",
      passwordHash: await hashPassword("temporal123"),
      firstName: "Admin",
      lastName: "Bouquet",
      isActive: true,
    },
  });

  // Asegurar el UserRole (por si el usuario ya existía sin el rol)
  const existingPlatformRole = await prisma.userRole.findFirst({
    where: { userId: adminUser.id, roleId: "role-platform-admin" },
  });
  if (!existingPlatformRole) {
    await prisma.userRole.create({
      data: { userId: adminUser.id, roleId: "role-platform-admin", contextType: "PLATFORM" },
    });
  }
  console.log("✅ PLATFORM_ADMIN: admin@bouquet.com / temporal123");

  // ── 4. Cadena de prueba ─────────────────────────────────────────────
  let chain = await prisma.chain.findFirst({ where: { name: "Grupo Demo" } });
  if (!chain) {
    chain = await prisma.chain.create({
      data: { createdBy: adminUser.id, currency: "MXN", name: "Grupo Demo" },
    });
  }
  console.log(`✅ Cadena: ${chain.name} (${chain.id})`);

  // ── 5. CHAIN_ADMIN ──────────────────────────────────────────────────
  const chainAdmin = await prisma.appUser.upsert({
    where: { email: "cadena@bouquet.demo" },
    update: {},
    create: {
      email: "cadena@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "Admin",
      lastName: "Cadena",
      isActive: true,
    },
  });
  const existingChainRole = await prisma.userRole.findFirst({
    where: { userId: chainAdmin.id, roleId: "role-chain-admin", chainId: chain.id },
  });
  if (!existingChainRole) {
    await prisma.userRole.create({
      data: { userId: chainAdmin.id, roleId: "role-chain-admin", contextType: "CHAIN", chainId: chain.id },
    });
  }
  console.log("✅ CHAIN_ADMIN: cadena@bouquet.demo / demo123");

  // ── 6. Zona de prueba ───────────────────────────────────────────────
  let zone = await prisma.zone.findFirst({ where: { chainId: chain.id, name: "Zona Centro" } });
  if (!zone) {
    zone = await prisma.zone.create({
      data: { chainId: chain.id, name: "Zona Centro" },
    });
  }
  console.log(`✅ Zona: ${zone.name} (${zone.id})`);

  // ── 7. ZONE_MANAGER ─────────────────────────────────────────────────
  const zoneManager = await prisma.appUser.upsert({
    where: { email: "zona@bouquet.demo" },
    update: {},
    create: {
      email: "zona@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "Gerente",
      lastName: "Zona",
      isActive: true,
    },
  });
  const existingZoneRole = await prisma.userRole.findFirst({
    where: { userId: zoneManager.id, roleId: "role-zone-manager", zoneId: zone.id },
  });
  if (!existingZoneRole) {
    await prisma.userRole.create({
      data: { userId: zoneManager.id, roleId: "role-zone-manager", contextType: "ZONE", chainId: chain.id, zoneId: zone.id },
    });
  }
  console.log("✅ ZONE_MANAGER: zona@bouquet.demo / demo123");

  // ── 8. Restaurante de prueba ───────────────────────────────────────
  let restaurant = await prisma.restaurant.findFirst({
    where: { chainId: chain.id, name: "Sucursal Lindavista" },
  });
  if (!restaurant) {
    restaurant = await prisma.restaurant.create({
      data: {
        chainId: chain.id,
        zoneId: zone.id,
        currency: "MXN",
        name: "Sucursal Lindavista",
        address: "Av. Lindavista 123, CDMX",
      },
    });
  }
  console.log(`✅ Restaurante: ${restaurant.name} (${restaurant.id})`);

  // ── 9. RESTAURANT_ADMIN ────────────────────────────────────────────
  const restAdmin = await prisma.appUser.upsert({
    where: { email: "restaurante@bouquet.demo" },
    update: {},
    create: {
      email: "restaurante@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "Admin",
      lastName: "Restaurante",
      isActive: true,
    },
  });
  const existingRestRole = await prisma.userRole.findFirst({
    where: { userId: restAdmin.id, roleId: "role-restaurant-admin", restaurantId: restaurant.id },
  });
  if (!existingRestRole) {
    await prisma.userRole.create({
      data: { userId: restAdmin.id, roleId: "role-restaurant-admin", contextType: "RESTAURANT", chainId: chain.id, zoneId: zone.id, restaurantId: restaurant.id },
    });
  }
  console.log("✅ RESTAURANT_ADMIN: restaurante@bouquet.demo / demo123");

  // ── 10. MESERO ─────────────────────────────────────────────────────
  const mesero = await prisma.appUser.upsert({
    where: { email: "mesero@bouquet.demo" },
    update: {},
    create: {
      email: "mesero@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "Carlos",
      lastName: "Mesero",
      isActive: true,
    },
  });
  const existingMeseroRole = await prisma.userRole.findFirst({
    where: { userId: mesero.id, roleId: "role-mesero", restaurantId: restaurant.id },
  });
  if (!existingMeseroRole) {
    await prisma.userRole.create({
      data: { userId: mesero.id, roleId: "role-mesero", contextType: "RESTAURANT", chainId: chain.id, zoneId: zone.id, restaurantId: restaurant.id },
    });
  }
  console.log("✅ MESERO: mesero@bouquet.demo / demo123");

  // ── 11. COCINERO ───────────────────────────────────────────────────
  const cocinero = await prisma.appUser.upsert({
    where: { email: "cocina@bouquet.demo" },
    update: {},
    create: {
      email: "cocina@bouquet.demo",
      passwordHash: await hashPassword("demo123"),
      firstName: "María",
      lastName: "Cocina",
      isActive: true,
    },
  });
  const existingCocinaRole = await prisma.userRole.findFirst({
    where: { userId: cocinero.id, roleId: "role-cocina", restaurantId: restaurant.id },
  });
  if (!existingCocinaRole) {
    await prisma.userRole.create({
      data: { userId: cocinero.id, roleId: "role-cocina", contextType: "RESTAURANT", chainId: chain.id, zoneId: zone.id, restaurantId: restaurant.id },
    });
  }
  console.log("✅ COCINA: cocina@bouquet.demo / demo123");

  // ── Resumen ─────────────────────────────────────────────────────────
  console.log("\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  console.log("🎉 Seed de gobernanza completado.\n");
  console.log("   Credenciales:");
  console.log("   ┌────────────────────────────────┬──────────────┬──────────────────┐");
  console.log("   │ Email                          │ Contraseña   │ Rol              │");
  console.log("   ├────────────────────────────────┼──────────────┼──────────────────┤");
  console.log("   │ admin@bouquet.com              │ temporal123  │ PLATFORM_ADMIN   │");
  console.log("   │ cadena@bouquet.demo            │ demo123      │ CHAIN_ADMIN      │");
  console.log("   │ zona@bouquet.demo              │ demo123      │ ZONE_MANAGER     │");
  console.log("   │ restaurante@bouquet.demo       │ demo123      │ RESTAURANT_ADMIN │");
  console.log("   │ mesero@bouquet.demo            │ demo123      │ MESERO           │");
  console.log("   │ cocina@bouquet.demo            │ demo123      │ COCINA           │");
  console.log("   └────────────────────────────────┴──────────────┴──────────────────┘");
  console.log("\n   Entidades creadas:");
  console.log(`   • Cadena:      ${chain.name}`);
  console.log(`   • Zona:        ${zone.name}`);
  console.log(`   • Restaurante: ${restaurant.name}`);
  console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n");
}

main()
  .catch((e) => {
    console.error("❌ Error en seed de gobernanza:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
