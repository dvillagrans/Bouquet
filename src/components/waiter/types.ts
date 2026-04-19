import type { TableStatus } from "@/generated/prisma";

export interface WaiterTableSummary {
  id: string;
  number: number;
  capacity: number;
  status: TableStatus;
  parentTableId: string | null;
  qrCode: string;
  activeSession: { guestName: string; pax: number; createdAt: Date } | null;
  orderCount: number;
  pendingCount: number;
  readyCount: number;
  billTotal: number;
}
