import type { TableStatus } from "@/lib/prisma-legacy-types";

export interface WaiterTableSummary {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  groupId: string | null;
  qrCode: string;
  activeSession: { guestName: string; pax: number; createdAt: Date } | null;
  orderCount: number;
  pendingCount: number;
  readyCount: number;
  billTotal: number;
}
