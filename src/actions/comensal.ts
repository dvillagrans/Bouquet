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
  if (table.status === "SUCIA") throw new Error("La mesa está siendo limpiada, pide al personal que la habilite.");
  if (table.status === "CERRANDO") throw new Error("El anfitrión ya pidió la cuenta. No se pueden agregar más órdenes.");

  /** La sesión solo debe existir vía `guestJoinTable`; el nombre efectivo viene de la fila Session. */
  const sessionRow = await requireGuestSessionRow(table, tableCode, guestName);

  // Pre-fetch items para asegurar el precio historico (priceAtTime)
  const itemIds = items.map(i => i.menuItemId);
  const dbItems = await prisma.menuItem.findMany({
    where: { id: { in: itemIds } }
  });

  function priceAtTimeForItem(
    dbItem: (typeof dbItems)[0],
    variantName: string | null | undefined
  ): number {
    const raw = dbItem.variants;
    const arr = Array.isArray(raw) ? raw : [];
    if (variantName && arr.length > 0) {
      const found = arr.find(
        (x: unknown) =>
          x &&
          typeof x === "object" &&
          (x as { name?: string }).name === variantName &&
          typeof (x as { price?: unknown }).price === "number"
      ) as { price: number } | undefined;
      if (found) return found.price;
    }
    return dbItem.price;
  }

  // Crear la Orden
  const newOrder = await prisma.order.create({
    data: {
      /** Debe coincidir con la mesa (no `getDefaultRestaurant`: cookie/sucursal puede diferir del QR). */
      restaurantId: table.restaurantId,
      tableId: table.id,
      guestName: sessionRow.guestName,
      status: "PENDING",
      isShared,
      items: {
        create: items.map(cartItem => {
          const dbItem = dbItems.find(i => i.id === cartItem.menuItemId);
          const vn = cartItem.variantName?.trim() || null;
          return {
            menuItemId: cartItem.menuItemId,
            quantity: cartItem.quantity,
            variantName: vn,
            priceAtTime: dbItem ? priceAtTimeForItem(dbItem, vn) : 0,
            sessionId: sessionRow.id,
          };
        })
      }
    }
  });

  await broadcastGuestOrdersRefresh(table.qrCode);
  await broadcastKdsOrdersRefresh(table.restaurantId);

  if (isShared) {
    const cartTotal = items.reduce((sum, cartItem) => {
      const dbItem = dbItems.find((i) => i.id === cartItem.menuItemId);
      const price = dbItem ? priceAtTimeForItem(dbItem, cartItem.variantName?.trim()) : 0;
      return sum + price * cartItem.quantity;
    }, 0);

    const activeSessionsCount = await prisma.session.count({
      where: { tableId: table.id, isActive: true },
    });

    const partySize = Math.max(1, activeSessionsCount);
    const suggestedPart = Math.ceil(cartTotal / partySize);

    // Simplistic summary string
    const summary = `${items.length} platillo${items.length !== 1 ? "s" : ""}`;

    await broadcastSharedOrderNotif(table.qrCode, {
      orderedBy: sessionRow.guestName,
      summary,
      suggestedPart,
    });
  }

  revalidatePath("/cocina"); // Despertar el KDS!

  return newOrder.id;
}

export async function getTableBill(tableCode: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) throw new Error("Mesa no encontrada");

  const currentlyActive = await prisma.session.findMany({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "asc" }
  });

  let sessionCandidates = currentlyActive;
  if (currentlyActive.length > 0) {
    const minCreatedAt = currentlyActive[0].createdAt;
    sessionCandidates = await prisma.session.findMany({
      where: { tableId: table.id, createdAt: { gte: minCreatedAt } },
      orderBy: { createdAt: "asc" }
    });
  }

  if (!sessionCandidates.length) {
    return { guests: [], sharedItems: [], total: 0, guestCount: 0 };
  }

  const sessionIds = sessionCandidates.map(s => s.id);

  const allItems = await prisma.orderItem.findMany({
    where: {
      sessionId: { in: sessionIds },
      order: { status: { not: "CANCELLED" } },
    },
    include: { menuItem: true, order: true, allocations: true },
  });

  type GuestItem = { key: string; menuItemId: string; name: string; qty: number; price: number };

  const guests = sessionCandidates.map(session => {
    // Individual items
    const sessionItems = allItems.filter(i => i.sessionId === session.id && !i.order.isShared);
    const aggregated: GuestItem[] = [];

    for (const item of sessionItems) {
      const existing = aggregated.find(a => a.menuItemId === item.menuItemId);
      if (existing) {
        existing.qty += item.quantity;
      } else {
        aggregated.push({
          key: `${session.id}::${item.menuItemId}`,
          menuItemId: item.menuItemId,
          name: item.menuItem.name,
          qty: item.quantity,
          price: item.priceAtTime,
        });
      }
    }

    const subtotal = aggregated.reduce((sum, i) => sum + i.price * i.qty, 0);
    return { 
      sessionId: session.id, 
      guestName: session.guestName, 
      items: aggregated, 
      subtotal,
      isPaid: !session.isActive
    };
  });

  const sharedOrderItems = allItems.filter(i => i.order.isShared);
  
  const sharedItems = sharedOrderItems.map(item => {
    const totalItemPrice = item.quantity * item.priceAtTime;
    const paidByAllocations = item.allocations.reduce((sum, alloc) => sum + alloc.amount, 0);
    const remaining = Math.max(0, totalItemPrice - paidByAllocations);

    const orderedBySession = sessionCandidates.find(s => s.id === item.sessionId);
    const orderedBy = orderedBySession ? orderedBySession.guestName : "Anónimo";

    return {
      orderItemId: item.id,
      name: item.menuItem.name,
      qty: item.quantity,
      price: item.priceAtTime,
      total: totalItemPrice,
      paid: paidByAllocations,
      remaining,
      orderedBy
    };
  }).filter(i => i.remaining > 0);

  const totalOwnUnpaid = guests.filter(g => !g.isPaid).reduce((sum, g) => sum + g.subtotal, 0);
  const totalSharedUnpaid = sharedItems.reduce((sum, i) => sum + i.remaining, 0);

  return { 
    guests, 
    sharedItems,
    total: totalOwnUnpaid + totalSharedUnpaid, 
    guestCount: sessionCandidates.filter(s => s.isActive).length 
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
    if (table.status === "SUCIA") {
      return {
        ok: false,
        message: "La mesa está siendo limpiada. Pide al personal que la habilite.",
      };
    }

    await requireTableJoinGate(table, tableCode);

    const canonicalQr = table.qrCode;

    const existingSessions = await prisma.session.count({
      where: { tableId: table.id, isActive: true }
    });
    const isFirstGuest = existingSessions === 0;

    // Si ya hay alguien en la mesa, verificar el código de acceso (comparación insensible a mayúsculas)
    if (!isFirstGuest) {
      const input = (joinCode ?? "").toUpperCase().trim();
      if (!table.joinCode) {
        return {
          ok: false,
          message: "Esta mesa tiene la sesión incompleta (sin código de acceso). Pide al personal que reinicie la mesa.",
        };
      }
      const stored = table.joinCode.toUpperCase();
      if (!input || input !== stored) {
        return { ok: false, message: "Código de acceso incorrecto." };
      }
    }

      let session = await prisma.session.findFirst({
        where: { tableId: table.id, isActive: true, guestName },
        orderBy: { createdAt: "desc" }
      });
  
      if (!session) {
        session = await prisma.session.create({
          data: { tableId: table.id, guestName, pax, isActive: true }
        });
      }
  
      const tableUpdates: { status?: "OCUPADA"; joinCode?: string; hostSessionId?: string } = {};
      if (table.status !== "OCUPADA") tableUpdates.status = "OCUPADA";
      if (isFirstGuest) {
        tableUpdates.joinCode = generateJoinCode();
        tableUpdates.hostSessionId = session.id;
      }
  
      if (Object.keys(tableUpdates).length > 0) {
        await prisma.table.update({ where: { id: table.id }, data: tableUpdates });
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

  const table = await prisma.table.findUnique({
    where: { id: base.id },
    include: { restaurant: true },
  });
  if (!table) throw new Error("Mesa no encontrada");

  const session = await prisma.session.findFirst({
    where: { id: sessionAuth.id, tableId: table.id, isActive: true },
  });
  if (!session) throw new Error("El comensal ya no tiene sesión activa.");

  const effectiveGuest = sessionAuth.guestName;

  // Calcular subtotal de este comensal
  const myItems = await prisma.orderItem.findMany({
    where: {
      sessionId: session.id,
      order: { guestName: effectiveGuest, status: { not: "CANCELLED" } },
    },
    select: { quantity: true, priceAtTime: true },
  });
  const subtotalIndividual = myItems.reduce((s, i) => s + i.quantity * i.priceAtTime, 0);
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
    // Prevent double-charging race condition by validating shared contributions
    if (input.allocations && input.allocations.length > 0) {
      for (const req of input.allocations) {
        if (req.amount <= 0) continue;
        const item = await tx.orderItem.findUnique({
          where: { id: req.orderItemId },
          include: { allocations: true },
        });
        if (!item) throw new Error("Un platillo compartido ya no está disponible.");

        const totalItemPrice = item.quantity * item.priceAtTime;
        const paidSoFar = item.allocations.reduce((sum, a) => sum + a.amount, 0);
        const remaining = totalItemPrice - paidSoFar;
        if (req.amount > remaining) {
          throw new Error("El saldo compartido de un artículo cambió. Intenta nuevamente.");
        }
      }
    }

    const payloadAllocations = [];
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

    await tx.payment.create({
      data: {
        restaurantId: table.restaurantId,
        tableId: table.id,
        sessionId: session.id,
        status: "PAID",
        method: input.paymentMethod ?? "CARD",
        splitMode: "FULL",
        splitCount: 1,
        paxPaid: 1,
        currency: table.restaurant.currency,
        subtotal,
        tipRate: safeTipRate,
        tipAmount,
        totalAmount,
        amountPaid,
        paidAt: new Date(),
        allocations: {
          create: payloadAllocations,
        },
      },
    });

    // Determinar temporalidad de la mesa para el cálculo de deficit antes de cerrar la sesión
    const oldestActive = await tx.session.findFirst({
      where: { tableId: table.id, isActive: true },
      orderBy: { createdAt: "asc" },
      select: { createdAt: true }
    });
    const minCreatedAt = oldestActive?.createdAt || session.createdAt;
    
    const sessionCandidates = await tx.session.findMany({
      where: { tableId: table.id, createdAt: { gte: minCreatedAt } },
      select: { id: true }
    });
    const sessionIds = sessionCandidates.map(s => s.id);

    // Close only this guest session so the rest of the table can continue ordering/paying.
    await tx.session.update({
      where: { id: session.id },
      data: { isActive: false, closedAt: new Date() },
    });

    const remainingActive = await tx.session.count({
      where: { tableId: table.id, isActive: true },
    });

    // HOST DEFICIT ENFORCEMENT:
    if (table.hostSessionId === session.id || remainingActive === 0) {
      const allSharedItems = await tx.orderItem.findMany({
        where: {
          sessionId: { in: sessionIds },
          order: { isShared: true, status: { not: "CANCELLED" } }
        },
        include: { allocations: true },
      });

      let globalDeficit = 0;
      for (const item of allSharedItems) {
        const itemTotal = item.quantity * item.priceAtTime;
        const paidSoFar = item.allocations.reduce((sum, a) => sum + a.amount, 0);
        if (paidSoFar < itemTotal) {
          globalDeficit += (itemTotal - paidSoFar);
        }
      }

      if (globalDeficit > 0) {
        if (remainingActive === 0) {
          throw new Error(`Eres el último comensal en la mesa. Queda un faltante de $${globalDeficit.toLocaleString("es-MX")} en órdenes compartidas que debes cubrir.`);
        } else {
          throw new Error(`Como anfitrión, debes cubrir el faltante de $${globalDeficit.toLocaleString("es-MX")} en órdenes compartidas antes de retirarte, o bien, espera a que otros lo paguen o transfiere tu rol.`);
        }
      }
    }

    if (remainingActive === 0) {
      await tx.table.update({
        where: { id: table.id },
        data: { status: "SUCIA" },
      });
    }

    return remainingActive;
  });

  revalidatePath("/mesero");
  revalidatePath("/dashboard/mesas");
  await broadcastKdsOrdersRefresh(table.restaurantId);

  const cookieStore = await cookies();
  cookieStore.set(`bq_checkout_${table.qrCode}`, JSON.stringify({
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
  const table = await prisma.table.findUnique({
    where: { qrCode: input.tableCode },
    include: { restaurant: true }
  });
  if (!table) throw new Error("Mesa no encontrada");

  const activeSessions = await prisma.session.findMany({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "asc" },
    select: { id: true, guestName: true },
  });

  if (!activeSessions.length) throw new Error("No hay sesion activa");

  const billItems = await prisma.orderItem.findMany({
    where: {
      sessionId: { in: activeSessions.map((s) => s.id) },
      order: { status: { not: "CANCELLED" } },
    },
    select: { quantity: true, priceAtTime: true },
  });

  const subtotal = billItems.reduce((sum, item) => sum + (item.quantity * item.priceAtTime), 0);
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
  const paymentMethod = input.paymentMethod ?? "CARD";

  const referenceSessionId = activeSessions[0].id;

  await prisma.$transaction(async tx => {
    await tx.payment.create({
      data: {
        restaurantId: table.restaurantId,
        tableId: table.id,
        sessionId: referenceSessionId,
        status: "PAID",
        method: paymentMethod,
        splitMode,
        splitCount,
        paxPaid,
        currency: table.restaurant.currency,
        subtotal,
        tipRate,
        tipAmount,
        totalAmount,
        amountPaid,
        paidAt: new Date(),
        allocations: {
          create: splitMode === "EQUAL"
            ? activeSessions.map((session) => ({
              sessionId: session.id,
              guestName: session.guestName,
              amount: amountPaid,
            }))
            : [{
              sessionId: referenceSessionId,
              guestName: "MESA_COMPLETA",
              amount: amountPaid,
            }]
        }
      }
    });

    await tx.session.updateMany({
      where: { id: { in: activeSessions.map((s) => s.id) } },
      data: { isActive: false, closedAt: new Date() }
    });

    await tx.table.update({
      where: { id: table.id },
      data: { status: "SUCIA" }
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

  const [fromSession, toSession] = await Promise.all([
    prisma.session.findFirst({ where: { tableId: table.id, isActive: true, guestName: fromGuest, id: table.hostSessionId ?? undefined } }),
    prisma.session.findFirst({ where: { tableId: table.id, isActive: true, guestName: toGuest } }),
  ]);

  if (!fromSession) throw new Error("Solo el anfitrión puede transferir el rol.");
  if (!toSession) throw new Error("El comensal destino no está en la mesa.");

  await prisma.table.update({
    where: { id: table.id },
    data: { hostSessionId: toSession.id }
  });

  await broadcastGuestOrdersRefresh(tableCode); // reusar para que todos refresquen la UI
}

// ─── Host: pedir la cuenta ───────────────────────────────────────────────────

export async function requestBill(tableCode: string, guestName: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) throw new Error("Mesa no encontrada");

  await requireGuestSessionRow(table, tableCode, guestName);

  const activeSessions = await prisma.session.findMany({
    where: { tableId: table.id, isActive: true },
    select: { id: true, guestName: true },
  });

  const mySession = activeSessions.find((s) => s.guestName === guestName && s.id === table.hostSessionId);
  if (!mySession) throw new Error("Solo el anfitrión puede pedir la cuenta.");

  // Si solo queda 1 comensal activo, no bloqueamos la mesa completa.
  // Esto permite que el mismo comensal pueda volver al menú y pedir más.
  if (activeSessions.length <= 1) {
    revalidatePath("/dashboard/mesas");
    await broadcastKdsOrdersRefresh(table.restaurantId);
    return;
  }

  await prisma.table.update({
    where: { id: table.id },
    data: { status: "CERRANDO" }
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

  const activeSessions = await prisma.session.findMany({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "asc" },
  });

  const mySession = activeSessions.find(s => s.guestName === guestName);
  const isHost = mySession?.id === table.hostSessionId && mySession !== undefined;

  return {
    isHost,
    billRequested: table.status === "CERRANDO",
    guests: activeSessions.map(s => ({ name: s.guestName, isHost: s.id === table.hostSessionId })),
    /** Misma mesa misma sesión: todos ven el código para invitar (no exponemos si no hay sesión activa). */
    joinCode: mySession ? table.joinCode : null,
  };
}

/** Solo mientras está PENDING; mismo comensal que creó el pedido. */
export async function cancelGuestOrder(orderId: string, tableCode: string, guestName: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) throw new Error("Mesa no encontrada");
  if (table.status === "CERRANDO") {
    throw new Error("Ya se pidió la cuenta; no puedes cancelar pedidos.");
  }

  await requireGuestSessionRow(table, tableCode, guestName);

  const order = await prisma.order.findFirst({
    where: { id: orderId, tableId: table.id },
  });
  if (!order) throw new Error("Pedido no encontrado");
  if (order.guestName !== guestName) {
    throw new Error("Solo puedes cancelar tus propios pedidos.");
  }
  if (order.status !== "PENDING") {
    throw new Error("Este pedido ya está en preparación y no puede cancelarse aquí.");
  }

  await prisma.order.update({
    where: { id: orderId },
    data: { status: "CANCELLED" },
  });

  await broadcastGuestOrdersRefresh(tableCode);
  await broadcastKdsOrdersRefresh(table.restaurantId);

  revalidatePath("/cocina");
  revalidatePath("/mesero");
  revalidatePath("/mesa/[codigo]/menu", "page");

  return { ok: true as const };
}

export async function getGuestOrders(tableCode: string) {
  const table = await findTableByQrCode(tableCode);
  if (!table) return [];

  const sessions = await prisma.session.findMany({
    where: { tableId: table.id, isActive: true },
  });

  if (!sessions.length) return [];

  const sessionIds = sessions.map(s => s.id);

  const orders = await prisma.order.findMany({
    where: { items: { some: { sessionId: { in: sessionIds } } } },
    include: {
      items: {
        include: { menuItem: true, session: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return orders;
}
