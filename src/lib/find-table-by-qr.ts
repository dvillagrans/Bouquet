import { Prisma } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

/**
 * Busca mesa por código QR ignorando diferencias de mayúsculas/minúsculas en la URL.
 */
export async function findTableByQrCode(raw: string) {
  const q = raw.trim();
  if (!q) return null;

  const exact = await prisma.diningTable.findUnique({ where: { publicCode: q } });
  if (exact) return exact;

  try {
    const ci = await prisma.diningTable.findFirst({
      where: {
        publicCode: { equals: q, mode: "insensitive" },
      },
    });
    if (ci) return ci;
  } catch {
    /* continuar al fallback SQL */
  }

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id FROM "DiningTable"
    WHERE LOWER(TRIM("publicCode")) = LOWER(TRIM(${q}))
    LIMIT 1
  `);
  const id = rows[0]?.id;
  if (!id) return null;
  return prisma.diningTable.findUnique({ where: { id } });
}
