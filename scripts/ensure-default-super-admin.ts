/**
 * Crea o actualiza el super admin por defecto (email + hash de contraseña).
 * Uso: npx tsx scripts/ensure-default-super-admin.ts
 * 
 * TODO: migrar a AppUser + UserRole. SuperAdmin fue eliminado del schema.
 */
import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

import { prisma } from "../src/lib/prisma";
import { hashSuperAdminPassword } from "../src/lib/super-admin-password";

const EMAIL = "admin@bouquet.com";
const PASSWORD = "temporal123";

async function main() {
  const passwordHash = await hashSuperAdminPassword(PASSWORD);
  // TODO: crear AppUser con role de PLATFORM admin
  console.log("TODO: migrar a AppUser + UserRole. SuperAdmin eliminado del schema.");
  console.log(`Email pretendido: ${EMAIL}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
