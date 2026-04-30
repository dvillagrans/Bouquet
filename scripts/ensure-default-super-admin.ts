/**
 * Crea o actualiza el super admin por defecto (email + hash de contraseña).
 * Uso: npx tsx scripts/ensure-default-super-admin.ts
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { prisma } from "../src/lib/prisma";
import { hashPassword } from "../src/lib/auth-password";

const EMAIL = "admin@bouquet.com";
const PASSWORD = "temporal123";
const ROLE_NAME = "PLATFORM_ADMIN";

async function main() {
  const passwordHash = await hashPassword(PASSWORD);

  // Upsert del rol base de plataforma
  const role = await prisma.role.upsert({
    where: { id: "role-platform-admin" },
    update: {},
    create: {
      id: "role-platform-admin",
      name: ROLE_NAME,
      scope: "PLATFORM",
      isBase: true,
      isActive: true,
    },
  });

  // Upsert del AppUser admin
  const user = await prisma.appUser.upsert({
    where: { email: EMAIL },
    update: { passwordHash },
    create: {
      email: EMAIL,
      passwordHash,
      firstName: "Admin",
      lastName: "Bouquet",
      isActive: true,
    },
  });

  // Asignar rol de plataforma si no existe
  const existingUserRole = await prisma.userRole.findFirst({
    where: { userId: user.id, roleId: role.id },
  });

  if (!existingUserRole) {
    await prisma.userRole.create({
      data: {
        userId: user.id,
        roleId: role.id,
        contextType: "PLATFORM",
      },
    });
  }

  console.log(`AppUser listo: ${user.email} (${user.id})`);
  console.log(`Rol asignado: ${role.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
