import { prisma } from "@/lib/prisma";
import type { Prisma } from "@/generated/prisma";

export function createAuditLog(data: Omit<Prisma.AuditLogUncheckedCreateInput, "id" | "createdAt">) {
  prisma.auditLog.create({ data }).catch(() => {
    /* silent — audit must not block business logic */
  });
}
