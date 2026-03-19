import { prisma } from "@/lib/prisma";
import WaiterDashboard from "@/components/waiter/WaiterDashboard";
import { TableStatus } from "@/generated/prisma";

export const dynamic = "force-dynamic";

export default async function WaiterPage() {
  const tables = await prisma.table.findMany({
    orderBy: { number: 'asc' },
    include: {
      sessions: {
        where: { isActive: true },
        take: 1,
      }
    }
  });

  const formattedTables = tables.map((t: any) => ({
    id: t.id,
    restaurantId: t.restaurantId,
    number: t.number,
    capacity: t.capacity,
    qrCode: t.qrCode,
    status: t.status,
    posX: t.posX,
    posY: t.posY,
    shape: t.shape,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    activeSession: t.sessions[0] ? {
      guestName: t.sessions[0].guestName,
      pax: t.sessions[0].pax,
      since: t.sessions[0].createdAt,
    } : null
  }));

  return <WaiterDashboard tables={formattedTables} />;
}
