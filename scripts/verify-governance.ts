import { loadEnvConfig } from "@next/env";
loadEnvConfig(process.cwd());
import { prisma } from "../src/lib/prisma";

async function main() {
  const users = await prisma.appUser.findMany({
    where: { email: { contains: "bouquet" } },
    include: {
      userRoles: {
        include: {
          role: true,
          chain: { select: { name: true } },
          zone: { select: { name: true } },
          restaurant: { select: { name: true } },
        },
      },
    },
  });

  console.log(
    "Email".padEnd(32) +
      "| Rol".padEnd(20) +
      "| Contexto | " +
      "Cadena".padEnd(18) +
      "| Zona".padEnd(18) +
      "| Restaurante",
  );
  console.log("-".repeat(130));
  for (const u of users) {
    for (const ur of u.userRoles) {
      console.log(
        u.email.padEnd(32) + "| " +
        ur.role.name.padEnd(19) + "| " +
        ur.contextType.padEnd(9) + "| " +
        (ur.chain?.name ?? "-").padEnd(17) + "| " +
        (ur.zone?.name ?? "-").padEnd(17) + "| " +
        (ur.restaurant?.name ?? "-"),
      );
    }
  }
  await prisma.$disconnect();
}

main();
