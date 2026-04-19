import { cookies } from "next/headers";

import type { Table } from "@/generated/prisma";

import { findTableByQrCode } from "@/lib/find-table-by-qr";
import { prisma } from "@/lib/prisma";

/** Campos necesarios para acciones firmadas por sesión */
export type GuestSessionRow = {
  id: string;
  guestName: string;
  pax: number | null;
  isActive: boolean;
  tableId: string;
};

export type GuestTableResolution =
  | { status: "not_found" }
  | { status: "need_login"; canonicalQr: string }
  | {
      status: "ok";
      table: Table;
      guestName: string;
      partySize: number;
    };

/**
 * Quién es el comensal solo puede deducirse de la sesión en servidor (cookie httpOnly +
 * fila Session), no de query params manipulables.
 */
export async function resolveGuestTableAccess(rawTableCode: string): Promise<GuestTableResolution> {
  const table = await findTableByQrCode(rawTableCode);
  if (!table) return { status: "not_found" };

  const store = await cookies();
  const sessionId =
    store.get(`bq_session_${table.qrCode}`)?.value ??
    store.get(`bq_session_${rawTableCode.trim()}`)?.value;

  if (!sessionId) {
    return { status: "need_login", canonicalQr: table.qrCode };
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      guestName: true,
      pax: true,
      isActive: true,
      tableId: true,
    },
  });

  if (!session?.isActive || session.tableId !== table.id) {
    return { status: "need_login", canonicalQr: table.qrCode };
  }

  return {
    status: "ok",
    table,
    guestName: session.guestName,
    partySize: Math.max(1, Math.min(20, session.pax || 1)),
  };
}

/** Cookie `bq_gate_*`: el usuario abrió al menos una vez una URL firmada desde el QR (no solo el código corto). */
export async function hasTableJoinGate(canonicalQr: string, decodedHint: string): Promise<boolean> {
  const store = await cookies();
  const v =
    store.get(`bq_gate_${canonicalQr}`)?.value ??
    store.get(`bq_gate_${decodedHint.trim()}`)?.value;
  return v === "1";
}

export async function requireTableJoinGate(
  table: { qrCode: string },
  cookieTableCodeHint: string,
): Promise<void> {
  const ok = await hasTableJoinGate(table.qrCode, cookieTableCodeHint);
  if (!ok) {
    throw new Error(
      "Debes escanear el código QR físico de la mesa para unirte. Un enlace sin la firma del QR no es válido.",
    );
  }
}

/**
 * Para server actions: solo el titular del cookie httpOnly puede actuar como ese nombre.
 */
export async function requireGuestSessionRow(
  table: { id: string; qrCode: string },
  cookieTableCodeHint: string,
  claimedGuestName: string,
): Promise<GuestSessionRow> {
  const store = await cookies();
  const sessionId =
    store.get(`bq_session_${table.qrCode}`)?.value ??
    store.get(`bq_session_${cookieTableCodeHint.trim()}`)?.value;

  if (!sessionId) {
    throw new Error("Entra a la mesa desde el código QR antes de continuar.");
  }

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    select: {
      id: true,
      guestName: true,
      pax: true,
      isActive: true,
      tableId: true,
    },
  });

  if (!session?.isActive || session.tableId !== table.id) {
    throw new Error("Tu sesión en esta mesa ya no es válida. Vuelve a entrar desde el QR.");
  }

  const claimed = claimedGuestName.trim();
  if (!claimed || session.guestName.trim() !== claimed) {
    throw new Error("La sesión no coincide con este perfil.");
  }

  return session;
}
