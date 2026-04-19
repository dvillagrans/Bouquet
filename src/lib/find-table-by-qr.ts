import { Prisma } from "@/generated/prisma";

import { prisma } from "@/lib/prisma";

/**
 * Busca mesa por código QR ignorando diferencias de mayúsculas/minúsculas en la URL.
 */
export async function findTableByQrCode(raw: string) {
  const q = raw.trim();
  if (!q) return null;

  const exact = await prisma.table.findUnique({ where: { qrCode: q } });
  if (exact) return exact;

  try {
    const ci = await prisma.table.findFirst({
      where: {
        qrCode: { equals: q, mode: "insensitive" },
      },
    });
    if (ci) return ci;
  } catch {
    /* continuar al fallback SQL */
  }

  const rows = await prisma.$queryRaw<Array<{ id: string }>>(Prisma.sql`
    SELECT id FROM "Table"
    WHERE LOWER(TRIM("qrCode")) = LOWER(TRIM(${q}))
    LIMIT 1
  `);
  const id = rows[0]?.id;
  if (!id) return null;
  return prisma.table.findUnique({ where: { id } });
}
