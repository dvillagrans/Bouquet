/**
 * Crea o actualiza el super admin por defecto (email + hash de contraseña).
 * Uso: npx tsx scripts/ensure-default-super-admin.ts
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { prisma } from "../src/lib/prisma";
import { hashSuperAdminPassword } from "../src/lib/super-admin-password";

const EMAIL = "admin@bouquet.com";
const PASSWORD = "temporal123";

async function main() {
  const passwordHash = await hashSuperAdminPassword(PASSWORD);
  await prisma.superAdmin.upsert({
    where: { email: EMAIL },
    create: {
      email: EMAIL,
      passwordHash,
      name: "Super Admin",
    },
    update: {
      passwordHash,
      isActive: true,
    },
  });
  console.log(`Super admin listo: ${EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
