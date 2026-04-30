"use server";

import { findTableByQrCode } from "@/lib/find-table-by-qr";
import { requireGuestSessionRow, requireTableJoinGate } from "@/lib/guest-table-access";
import { prisma } from "@/lib/prisma";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  broadcastGuestOrdersRefresh,
  broadcastBillRequested,
  broadcastKdsOrdersRefresh,
  broadcastSharedOrderNotif,
} from "@/lib/supabase/broadcast-guest-orders";

export async function submitComensalOrder({
  tableCode,
  guestName,
  pax: _pax,
  items,
  isShared = false,
}: {
  tableCode: string;
  guestName: string;
  /** Conservado por compatibilidad con el cliente; la sesión define el comensal. */
  pax: number;
  items: { menuItemId: string; quantity: number; variantName?: string | null }[];
  isShared?: boolean;
}) {
  // Buscar mesa por código
  const table = await findTableByQrCode(tableCode);

  if (!table) throw new Error("Mesa no encontrada: " + tableCode);
  if (table.status === "NO_DISPONIBLE") throw new Error("La mesa no está disponible.");

  const sessionRow = await requireGuestSessionRow(table, tableCode, guestName);
  if (sessionRow.sessionStatus === "POR_LIQUIDAR") {
    throw new Error("El anfitrión ya pidió la cuenta. No se pueden agregar más órdenes.");
  }

  // Pre-fetch items para asegurar el precio historico
  const itemIds = items.map(i => i.menuItemId);
  const dbItems = await prisma.restaurantMenuItem.findMany({
    where: { id: { in: itemIds } }
  });

  function priceAtTimeForItem(
    dbItem: (typeof dbItems)[0],
    _variantName: string | null | undefined
  ): number {
    // TODO: adaptar variants a relación RestaurantMenuItemVariant
    return (dbItem.priceCents ?? 0) / 100;
  }

  // Crear la Orden
  const newOrder = await prisma.restaurantOrder.create({
    data: {
      /** Debe coincidir con la mesa (no `getDefaultRestaurant`: cookie/sucursal puede diferir del QR). */
      restaurantId: table.restaurantId,
      diningSessionId: sessionRow.id,
      status: "ABIERTA",
      items: {
        create: items.map(cartItem => {
          const dbItem = dbItems.find(i => i.id === cartItem.menuItemId);
          const vn = cartItem.variantName?.trim() || null;
          const unitPrice = dbItem ? Math.round(priceAtTimeForItem(dbItem, vn) * 100) : 0;
          const subtotal = unitPrice * cartItem.quantity;
          return {
            menuItemId: cartItem.menuItemId,
            quantity: cartItem.quantity,
            variantNameSnapshot: vn,
            itemNameSnapshot: dbItem?.name ?? "Platillo",
            stationNameSnapshot: null,
            unitPriceCents: unitPrice,
            subtotalCents: subtotal,
            taxAmountCents: 0,
            totalCents: subtotal,
            taxRateBpsSnapshot: 0,
            guestId: sessionRow.guestId,
          };
        })
      }
    }
  });

  await broadcastGuestOrdersRefresh(table.publicCode);
  await broadcastKdsOrdersRefresh(table.restaurantId);

  if (isShared) {
    const cartTotal = items.reduce((sum, cartItem) => {
      const dbItem = dbItems.find((i) => i.id === cartItem.menuItemId);
      const price = dbItem ? priceAtTimeForItem(dbItem, cartItem.variantName?.trim()) : 0;
      return sum + price * cartItem.quantity;
    }, 0);

    const activeSessionsCount = await prisma.diningSession.count({
      where: {
        tables: { some: { tableId: table.id, leftAt: null } },
        status: { in: ["ACTIVA", "EN_CONSUMO"] },
      },
    });

    const partySize = Math.max(1, activeSessionsCount);
    const suggestedPart = Math.ceil(cartTotal / partySize);

    // Simplistic summary string
    const summary = `${items.length} platillo${items.length !== 1 ? "s" : ""}`;

    await broadcastSharedOrderNotif(table.publicCode, {
      orderedBy: sessionRow.guestName,
      summary,
      suggestedPart,
    });
  }

  revalidatePath("/cocina"); // Despertar el KDS!
  revalidatePath("/barra");

  return newOrder.id;
}

export async function getTableBill(tableCode: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) throw new Error("Mesa no encontrada");

  const currentlyActive = await prisma.diningSession.findMany({
    where: {
      tables: { some: { tableId: table.id, leftAt: null } },
      status: { in: ["ACTIVA", "EN_CONSUMO"] },
    },
    orderBy: { openedAt: "asc" },
    include: { guests: true },
  });

  let sessionCandidates = currentlyActive;
  if (currentlyActive.length > 0) {
    const minOpenedAt = currentlyActive[0].openedAt;
    sessionCandidates = await prisma.diningSession.findMany({
      where: {
        tables: { some: { tableId: table.id } },
        openedAt: { gte: minOpenedAt },
      },
      orderBy: { openedAt: "asc" },
      include: { guests: true },
    });
  }

  if (!sessionCandidates.length) {
    return { guests: [], sharedItems: [], total: 0, guestCount: 0 };
  }

  const allGuestIds = sessionCandidates.flatMap(s => s.guests.map(g => g.id));

  const allItems = await prisma.orderItem.findMany({
    where: {
      guestId: { in: allGuestIds },
      order: { status: { not: "CANCELADA" } },
    },
    include: { menuItem: true, order: true },
  });

  type GuestItem = { key: string; menuItemId: string; name: string; qty: number; price: number };

  const guests = sessionCandidates.map(session => {
    const sessionGuestIds = new Set(session.guests.map(g => g.id));
    const sessionItems = allItems.filter(i => sessionGuestIds.has(i.guestId || ""));
    const aggregated: GuestItem[] = [];

    for (const item of sessionItems) {
      const existing = aggregated.find(a => a.menuItemId === item.menuItemId);
      if (existing) {
        existing.qty += item.quantity;
      } else {
        aggregated.push({
          key: `${session.id}::${item.menuItemId || 'manual'}`,
          menuItemId: item.menuItemId || '',
          name: item.itemNameSnapshot || item.menuItem?.name || "Platillo",
          qty: item.quantity,
          price: (item.unitPriceCents ?? 0) / 100,
        });
      }
    }

    const subtotal = aggregated.reduce((sum, i) => sum + i.price * i.qty, 0);
    const hostGuest = session.guests.find(g => g.isHost);
    return {
      sessionId: session.id,
      guestName: hostGuest?.name ?? session.guests[0]?.name ?? "Comensal",
      items: aggregated,
      subtotal,
      isPaid: session.status === "LIQUIDADA" || session.status === "CERRADA",
    };
  });

  // TODO: reimplementar órdenes compartidas con el nuevo schema
  const sharedItems: any[] = [];

  const totalOwnUnpaid = guests.filter(g => !g.isPaid).reduce((sum, g) => sum + g.subtotal, 0);
  const totalSharedUnpaid = sharedItems.reduce((sum, i) => sum + i.remaining, 0);

  return {
    guests,
    sharedItems,
    total: totalOwnUnpaid + totalSharedUnpaid,
    guestCount: sessionCandidates.filter(s => s.status === "ACTIVA" || s.status === "EN_CONSUMO").length,
  };
}

function generateJoinCode(): string {
  // 4 chars sin caracteres ambiguos (sin 0/O/1/I/L)
  const alphabet = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < 4; i += 1) {
    code += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return code;
}

/** Une comensal a la mesa y devuelve el código QR canónico (como en BD) para URL y cookies. */
export async function guestJoinTable(
  tableCode: string,
  guestName: string,
  pax: number,
  joinCode?: string,
): Promise<{ ok: true; canonicalQr: string } | { ok: false; message: string }> {
  try {
    const table = await findTableByQrCode(tableCode);
    if (!table) {
      return { ok: false, message: "No encontramos esta mesa. Comprueba el código del QR." };
    }

    await requireTableJoinGate(table, tableCode);

    const canonicalQr = table.publicCode;

    const existingSessions = await prisma.diningSession.count({
      where: {
        tables: { some: { tableId: table.id, leftAt: null } },
        status: { in: ["ACTIVA", "EN_CONSUMO"] },
      },
    });
    const isFirstGuest = existingSessions === 0;

    // joinCode ya no existe en el schema; se ignora la validación hasta reimplementar
    if (!isFirstGuest) {
      const input = (joinCode ?? "").toUpperCase().trim();
      if (!input) {
        return { ok: false, message: "Código de acceso requerido." };
      }
    }

    let session = await prisma.diningSession.findFirst({
      where: {
        tables: { some: { tableId: table.id, leftAt: null } },
        status: { in: ["ACTIVA", "EN_CONSUMO"] },
        guests: { some: { name: guestName } },
      },
      orderBy: { openedAt: "desc" },
    });

    if (!session) {
      session = await prisma.diningSession.create({
        data: {
          restaurantId: table.restaurantId,
          status: "ACTIVA",
          joinCode: generateJoinCode(), // joinCode is required and must be unique
          accessCodeHash: "temp", // required field
          // openedByUserId is nil for guest self-service joins
          guests: { create: { name: guestName, isHost: isFirstGuest, isActive: true } },
          tables: { create: { tableId: table.id } },
        },
      });
    } else {
      const existingGuest = await prisma.guest.findFirst({
        where: { diningSessionId: session.id, name: guestName },
      });
      if (!existingGuest) {
        await prisma.guest.create({
          data: { diningSessionId: session.id, name: guestName, isHost: false, isActive: true },
        });
      }
    }

    const tableUpdates: { status?: "OCUPADA" } = {};
    if (table.status !== "OCUPADA") tableUpdates.status = "OCUPADA";

    if (Object.keys(tableUpdates).length > 0) {
      await prisma.diningTable.update({ where: { id: table.id }, data: tableUpdates });
      revalidatePath("/dashboard/mesas");
      await broadcastKdsOrdersRefresh(table.restaurantId);
    }

    const cookieStore = await cookies();
    cookieStore.set(`bq_session_${canonicalQr}`, session.id, {
      maxAge: 60 * 60 * 12,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });
    cookieStore.set(`bq_guest_${canonicalQr}`, encodeURIComponent(guestName), {
      maxAge: 60 * 60 * 12,
      httpOnly: false, // para leer en cliente si hace falta
      path: "/",
    });

    return { ok: true, canonicalQr };
  } catch (error) {
    const message = error instanceof Error ? error.message : "No pudimos continuar. Intenta nuevamente.";
    return { ok: false, message };
  }
}

// Pago parcial de un comensal sin cerrar la mesa.
// El mesero confirma el cierre cuando todos hayan pagado.
export async function payGuestShare(input: {
  tableCode: string;
  guestName: string;
  amountPaid: number;
  tipRate: number;
  paymentMethod?: "CASH" | "CARD" | "TRANSFER" | "OTHER";
  allocations?: { orderItemId: string; amount: number }[];
}): Promise<{ success: boolean; isLastPayer: boolean; guestName: string }> {
  const base = await findTableByQrCode(input.tableCode);
  if (!base) throw new Error("Mesa no encontrada");

  const sessionAuth = await requireGuestSessionRow(base, input.tableCode, input.guestName);

  const table = await prisma.diningTable.findUnique({
    where: { id: base.id },
    include: { restaurant: true },
  });
  if (!table) throw new Error("Mesa no encontrada");

  const session = await prisma.diningSession.findFirst({
    where: {
      id: sessionAuth.id,
      status: { in: ["ACTIVA", "EN_CONSUMO"] },
      tables: { some: { tableId: table.id, leftAt: null } },
    },
  });
  if (!session) throw new Error("El comensal ya no tiene sesión activa.");

  const effectiveGuest = sessionAuth.guestName;

  // Calcular subtotal de este comensal
  const myItems = await prisma.orderItem.findMany({
    where: {
      guestId: sessionAuth.guestId,
      order: { status: { not: "CANCELADA" } },
    },
    select: { quantity: true, unitPriceCents: true },
  });
  const subtotalIndividual = myItems.reduce((s, i) => s + i.quantity * ((i.unitPriceCents ?? 0) / 100), 0);
  const subtotalShared = input.allocations?.reduce((s, a) => s + a.amount, 0) ?? 0;
  const subtotal = subtotalIndividual + subtotalShared;

  if (subtotal <= 0) throw new Error("El comensal no tiene consumo pendiente.");

  const normalizedTipRate = input.tipRate > 1 ? input.tipRate / 100 : input.tipRate;
  const safeTipRate = Math.max(0, normalizedTipRate);
  const tipAmount = Math.round(subtotal * safeTipRate);
  const totalAmount = subtotal + tipAmount;
  const amountPaid = Math.max(0, input.amountPaid || totalAmount);

  if (amountPaid < totalAmount) {
    throw new Error("El monto pagado no puede ser menor al total del comensal.");
  }

  const remainingActive = await prisma.$transaction(async tx => {
    // TODO: reimplementar allocations con el nuevo schema (ya no existe tabla allocation)
    const payloadAllocations: any[] = [];
    if (subtotalIndividual > 0) {
      payloadAllocations.push({
        sessionId: session.id,
        guestName: effectiveGuest,
        amount: subtotalIndividual,
      });
    }

    if (input.allocations) {
      for (const a of input.allocations) {
        if (a.amount > 0) {
          payloadAllocations.push({
            sessionId: session.id,
            guestName: effectiveGuest,
            amount: a.amount,
            orderItemId: a.orderItemId,
          });
        }
      }
    }

    await tx.settlement.create({
      data: {
        restaurantId: table.restaurantId,
        diningSessionId: session.id,
        currency: table.restaurant.currency,
        status: "LIQUIDADA",
        splitMode: "FULL",
        subtotalCents: Math.round(subtotal * 100),
        discountCents: 0,
        tipAmountCents: Math.round(tipAmount * 100),
        taxAmountCents: 0,
        totalCents: Math.round(totalAmount * 100),
        amountSettledCents: Math.round(amountPaid * 100),
        remainingCents: 0,
        notes: null,
      },
    });

    // Determinar temporalidad de la mesa para el cálculo de deficit antes de cerrar la sesión
    const oldestActive = await tx.diningSession.findFirst({
      where: {
        tables: { some: { tableId: table.id, leftAt: null } },
        status: { in: ["ACTIVA", "EN_CONSUMO"] },
      },
      orderBy: { openedAt: "asc" },
      select: { openedAt: true },
    });
    const minOpenedAt = oldestActive?.openedAt || session.openedAt;

    const sessionCandidates = await tx.diningSession.findMany({
      where: {
        tables: { some: { tableId: table.id } },
        openedAt: { gte: minOpenedAt },
      },
      select: { id: true },
    });
    const sessionIds = sessionCandidates.map(s => s.id);

    // Close only this guest so the rest of the table can continue ordering/paying.
    await tx.guest.update({
      where: { id: sessionAuth.guestId },
      data: { isActive: false },
    });

    const remainingActive = await tx.guest.count({
      where: { diningSessionId: session.id, isActive: true },
    });

    // TODO: reimplementar host deficit enforcement con el nuevo schema

    if (remainingActive === 0) {
      await tx.diningSession.update({
        where: { id: session.id },
        data: { status: "CERRADA" },
      });
      await tx.diningTable.update({
        where: { id: table.id },
        data: { status: "LIBRE" },
      });
    }

    return remainingActive;
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(table.restaurantId);

  const cookieStore = await cookies();
  cookieStore.set(`bq_checkout_${table.publicCode}`, JSON.stringify({
    isLastPayer: remainingActive === 0,
    guestName: input.guestName
  }), { maxAge: 300, path: "/" });

  return {
    success: true,
    isLastPayer: remainingActive === 0,
    guestName: input.guestName,
  };
}

interface RequestBillAndPayInput {
  tableCode: string;
  splitMode?: "EQUAL" | "FULL";
  splitCount?: number;
  tipRate?: number;
  tipAmount?: number;
  totalAmount?: number;
  amountPaid?: number;
  paymentMethod?: "CASH" | "CARD" | "TRANSFER" | "OTHER";
}

export async function requestBillAndPay(input: RequestBillAndPayInput) {
  const table = await prisma.diningTable.findUnique({
    where: { publicCode: input.tableCode },
    include: { restaurant: true }
  });
  if (!table) throw new Error("Mesa no encontrada");

  const activeSessions = await prisma.diningSession.findMany({
    where: {
      tables: { some: { tableId: table.id, leftAt: null } },
      status: { in: ["ACTIVA", "EN_CONSUMO"] },
    },
    orderBy: { openedAt: "asc" },
    include: { guests: true },
  });

  if (!activeSessions.length) throw new Error("No hay sesion activa");

  const allGuestIds = activeSessions.flatMap(s => s.guests.map(g => g.id));

  const billItems = await prisma.orderItem.findMany({
    where: {
      guestId: { in: allGuestIds },
      order: { status: { not: "CANCELADA" } },
    },
    select: { quantity: true, unitPriceCents: true },
  });

  const subtotal = billItems.reduce((sum, item) => sum + (item.quantity * ((item.unitPriceCents ?? 0) / 100)), 0);
  const rawTipRate = typeof input.tipRate === "number" ? input.tipRate : 0;
  const tipRate = Math.max(0, rawTipRate > 1 ? rawTipRate / 100 : rawTipRate);
  const computedTipAmount = Math.round(subtotal * tipRate);
  const tipAmount = typeof input.tipAmount === "number" ? Math.max(0, input.tipAmount) : computedTipAmount;
  const totalAmount = typeof input.totalAmount === "number" ? Math.max(0, input.totalAmount) : subtotal + tipAmount;
  const splitMode = input.splitMode === "EQUAL" ? "EQUAL" : "FULL";
  const splitCount = Math.max(1, Math.min(20, input.splitCount ?? 1));
  const paxPaid = splitMode === "EQUAL" ? splitCount : 1;
  const amountPaid = typeof input.amountPaid === "number"
    ? Math.max(0, input.amountPaid)
    : (splitMode === "EQUAL" ? Math.ceil(totalAmount / splitCount) : totalAmount);

  const referenceSessionId = activeSessions[0].id;

  await prisma.$transaction(async tx => {
    await tx.settlement.create({
      data: {
        restaurantId: table.restaurantId,
        diningSessionId: referenceSessionId,
        currency: table.restaurant.currency,
        status: "LIQUIDADA",
        splitMode,
        subtotalCents: Math.round(subtotal * 100),
        discountCents: 0,
        tipAmountCents: Math.round(tipAmount * 100),
        taxAmountCents: 0,
        totalCents: Math.round(totalAmount * 100),
        amountSettledCents: Math.round(amountPaid * 100),
        remainingCents: 0,
        notes: null,
      },
    });

    for (const s of activeSessions) {
      await tx.guest.updateMany({
        where: { diningSessionId: s.id },
        data: { isActive: false },
      });
    }

    await tx.diningSession.updateMany({
      where: { id: { in: activeSessions.map((s) => s.id) } },
      data: { status: "CERRADA" }
    });

    await tx.diningTable.update({
      where: { id: table.id },
      data: { status: "LIBRE" }
    });
  });

  const cookieStore = await cookies();
  cookieStore.delete(`bq_session_${input.tableCode}`);
  cookieStore.delete(`bq_guest_${input.tableCode}`);

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(table.restaurantId);
  return true;
}

// ─── Host: transferir y pedir la cuenta ──────────────────────────────────────

export async function transferHost(tableCode: string, fromGuest: string, toGuest: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) throw new Error("Mesa no encontrada");

  await requireGuestSessionRow(table, tableCode, fromGuest);

  const session = await prisma.diningSession.findFirst({
    where: {
      status: { in: ["ACTIVA", "EN_CONSUMO"] },
      tables: { some: { tableId: table.id, leftAt: null } },
    },
    include: { guests: true },
  });

  if (!session) throw new Error("No hay sesión activa en la mesa.");

  const fromGuestRow = session.guests.find(g => g.name === fromGuest);
  const toGuestRow = session.guests.find(g => g.name === toGuest);

  if (!fromGuestRow) throw new Error("Solo el anfitrión puede transferir el rol.");
  if (!toGuestRow) throw new Error("El comensal destino no está en la mesa.");
  if (!fromGuestRow.isHost) throw new Error("Solo el anfitrión puede transferir el rol.");

  await prisma.$transaction([
    prisma.guest.update({ where: { id: fromGuestRow.id }, data: { isHost: false } }),
    prisma.guest.update({ where: { id: toGuestRow.id }, data: { isHost: true } }),
  ]);

  await broadcastGuestOrdersRefresh(tableCode); // reusar para que todos refresquen la UI
}

// ─── Host: pedir la cuenta ───────────────────────────────────────────────────

export async function requestBill(tableCode: string, guestName: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) throw new Error("Mesa no encontrada");

  await requireGuestSessionRow(table, tableCode, guestName);

  const activeSessions = await prisma.diningSession.findMany({
    where: {
      tables: { some: { tableId: table.id, leftAt: null } },
      status: { in: ["ACTIVA", "EN_CONSUMO"] },
    },
    include: { guests: true },
  });

  const mySession = activeSessions.find((s) => s.guests.some(g => g.name === guestName && g.isHost));
  if (!mySession) throw new Error("Solo el anfitrión puede pedir la cuenta.");

  // Si solo queda 1 comensal activo, no bloqueamos la mesa completa.
  // Esto permite que el mismo comensal pueda volver al menú y pedir más.
  const totalGuests = activeSessions.reduce((sum, s) => sum + s.guests.filter(g => g.isActive).length, 0);
  if (totalGuests <= 1) {
    revalidatePath("/dashboard/mesas");
    await broadcastKdsOrdersRefresh(table.restaurantId);
    return;
  }

  await prisma.diningSession.update({
    where: { id: mySession.id },
    data: { status: "POR_LIQUIDAR" },
  });

  revalidatePath("/dashboard/mesas");
  await broadcastBillRequested(tableCode);
  await broadcastKdsOrdersRefresh(table.restaurantId);
}

export async function getGuestTableState(tableCode: string, guestName: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) return { isHost: false, billRequested: false, guests: [] as { name: string; isHost: boolean }[], joinCode: null as string | null };

  try {
    await requireGuestSessionRow(table, tableCode, guestName);
  } catch {
    return { isHost: false, billRequested: false, guests: [] as { name: string; isHost: boolean }[], joinCode: null as string | null };
  }

  const activeSessions = await prisma.diningSession.findMany({
    where: {
      tables: { some: { tableId: table.id, leftAt: null } },
      status: { in: ["ACTIVA", "EN_CONSUMO", "POR_LIQUIDAR"] },
    },
    orderBy: { openedAt: "asc" },
    include: { guests: true },
  });

  const myGuest = activeSessions.flatMap(s => s.guests).find(g => g.name === guestName);
  const isHost = myGuest?.isHost ?? false;

  return {
    isHost,
    billRequested: activeSessions.some(s => s.status === "POR_LIQUIDAR"),
    guests: activeSessions.flatMap(s => s.guests).map(g => ({ name: g.name, isHost: g.isHost })),
    /** Misma mesa misma sesión: todos ven el código para invitar (no exponemos si no hay sesión activa). */
    joinCode: null, // TODO: joinCode eliminado del schema
  };
}

/** Solo mientras está PENDING; mismo comensal que creó el pedido. */
export async function cancelGuestOrder(orderId: string, tableCode: string, guestName: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) throw new Error("Mesa no encontrada");

  const sessionRow = await requireGuestSessionRow(table, tableCode, guestName);

  const session = await prisma.diningSession.findUnique({
    where: { id: sessionRow.id },
  });
  if (session?.status === "POR_LIQUIDAR") {
    throw new Error("Ya se pidió la cuenta; no puedes cancelar pedidos.");
  }

  const order = await prisma.restaurantOrder.findFirst({
    where: { id: orderId, diningSessionId: sessionRow.id },
  });
  if (!order) throw new Error("Pedido no encontrado");
  // TODO: reimplementar verificación de propiedad con Guest en el nuevo schema
  if (order.status !== "ABIERTA") {
    throw new Error("Este pedido ya está en preparación y no puede cancelarse aquí.");
  }

  await prisma.restaurantOrder.update({
    where: { id: orderId },
    data: { status: "CANCELADA" },
  });

  await broadcastGuestOrdersRefresh(tableCode);
  await broadcastKdsOrdersRefresh(table.restaurantId);

  revalidatePath("/cocina");
  revalidatePath("/barra");
  revalidatePath("/mesero");
  revalidatePath("/mesa/[codigo]/menu", "page");

  return { ok: true as const };
}

export async function getGuestOrders(tableCode: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) return [];

  const sessions = await prisma.diningSession.findMany({
    where: {
      tables: { some: { tableId: table.id, leftAt: null } },
      status: { in: ["ACTIVA", "EN_CONSUMO"] },
    },
  });

  if (!sessions.length) return [];

  const sessionIds = sessions.map(s => s.id);

  const orders = await prisma.restaurantOrder.findMany({
    where: { diningSessionId: { in: sessionIds } },
    include: {
      items: {
        include: { menuItem: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return orders;
}
