"use server";

import { prisma } from "@/lib/prisma";
import { startOfDay, endOfDay } from "date-fns";

export interface RestaurantSummary {
  id: string;
  name: string;
  address: string | null;
  zoneName: string | null;
  zoneId: string | null;
  totalTables: number;
  activeTables: number;
  activeStaff: number;
  todayRevenue: number;
  todaySessions: number;
}

export interface ZoneSummary {
  id: string;
  name: string;
  restaurantCount: number;
  totalRevenue: number;
  totalTables: number;
  activeTables: number;
}

export interface ChainDashboardData {
  chain: { id: string; name: string };
  stats: {
    totalRevenue: number;
    totalSessions: number;
    activeTables: number;
    restaurantCount: number;
  };
  zones: ZoneSummary[];
  restaurants: RestaurantSummary[];
}

export interface ZoneDashboardData {
  zone: { id: string; name: string; chainName: string };
  stats: {
    totalRevenue: number;
    totalSessions: number;
    activeTables: number;
    staffCount: number;
  };
  restaurants: RestaurantSummary[];
}

// 1. Verificación del PIN Maestro
export async function verifyChainPin(tenantId: string, pin: string) {
  if (!tenantId || !pin) return false;
  
  const staff = await prisma.chainStaff.findFirst({
    where: {
      chainId: tenantId,
      role: "CHAIN_ADMIN",
      pin: pin
    }
  });

  return !!staff; // true si existe el admin con ese PIN
}

async function fetchRestaurants(chainId?: string, zoneId?: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const whereClause: any = {};
  if (chainId) {
    whereClause.zone = { chainId: chainId };
  }
  if (zoneId) {
    whereClause.zoneId = zoneId;
  }

  return prisma.restaurant.findMany({
    where: whereClause,
    include: {
      zone: { select: { id: true, name: true, chainId: true } },
      tables: {
        select: {
          status: true,
          sessions: {
            where: { createdAt: { gte: dayStart, lte: dayEnd } },
            select: { id: true },
          },
        },
      },
      staff: { where: { isActive: true }, select: { id: true } },
      orders: {
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          status: { in: ["READY", "DELIVERED"] },
        },
        include: { items: { select: { quantity: true, priceAtTime: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

function toSummary(r: any): RestaurantSummary {
  const todayRevenue = r.orders.reduce((a: number, o: any) => {
    const total = o.items.reduce((sum: number, it: any) => sum + it.quantity * Number(it.priceAtTime), 0);
    return a + total;
  }, 0);

  const todaySessions = r.tables.reduce((a: number, t: any) => a + t.sessions.length, 0);

  return {
    id: r.id,
    name: r.name,
    address: r.address,
    zoneName: r.zone?.name || null,
    zoneId: r.zoneId,
    totalTables: r.tables.length,
    activeTables: r.tables.filter((t: any) => t.status === "OCCUPIED").length,
    activeStaff: r.staff.length,
    todayRevenue,
    todaySessions,
  };
}

export async function getChainDashboard(tenantId: string): Promise<ChainDashboardData | null> {
  const [chain, rawRestaurants] = await Promise.all([
    prisma.chain.findUnique({ where: { id: tenantId }, select: { id: true, name: true } }),
    fetchRestaurants(tenantId),
  ]);

  if (!chain) return null;

  const restaurants = rawRestaurants
    .map(toSummary)
    .sort((a, b) => b.todayRevenue - a.todayRevenue);

  const zones: ZoneSummary[] = [];
  const zoneMap: Record<string, ZoneSummary> = {};

  for (const r of restaurants) {
    if (r.zoneId && r.zoneName) {
      if (!zoneMap[r.zoneId]) {
        const z: ZoneSummary = {
          id: r.zoneId,
          name: r.zoneName,
          restaurantCount: 0,
          totalRevenue: 0,
          activeTables: 0,
          totalTables: 0,
        };
        zoneMap[r.zoneId] = z;
        zones.push(z);
      }
      zoneMap[r.zoneId].restaurantCount++;
      zoneMap[r.zoneId].totalRevenue += r.todayRevenue;
      zoneMap[r.zoneId].activeTables += r.activeTables;
      zoneMap[r.zoneId].totalTables += r.totalTables;
    }
  }

  const totals = restaurants.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.todayRevenue,
      sessions: acc.sessions + r.todaySessions,
      activeTables: acc.activeTables + r.activeTables,
    }),
    { revenue: 0, sessions: 0, activeTables: 0 }
  );

  return {
    chain,
    stats: {
      totalRevenue: totals.revenue,
      totalSessions: totals.sessions,
      activeTables: totals.activeTables,
      restaurantCount: restaurants.length,
    },
    zones: zones.sort((a, b) => b.totalRevenue - a.totalRevenue),
    restaurants,
  };
}

export async function getZoneDashboard(zoneId: string): Promise<ZoneDashboardData | null> {
  const [zone, rawRestaurants] = await Promise.all([
    prisma.zone.findUnique({
      where: { id: zoneId },
      include: { chain: { select: { name: true } } },
    }),
    fetchRestaurants(undefined, zoneId),
  ]);

  if (!zone) return null;

  const restaurants = rawRestaurants
    .map(toSummary)
    .sort((a, b) => b.todayRevenue - a.todayRevenue);

  const stats = restaurants.reduce(
    (acc, r) => ({
      revenue: acc.revenue + r.todayRevenue,
      sessions: acc.sessions + r.todaySessions,
      activeTables: acc.activeTables + r.activeTables,
      staffCount: acc.staffCount + r.activeStaff,
    }),
    { revenue: 0, sessions: 0, activeTables: 0, staffCount: 0 }
  );

  return {
    zone: { id: zone.id, name: zone.name, chainName: zone.chain.name },
    stats: {
      totalRevenue: stats.revenue,
      totalSessions: stats.sessions,
      activeTables: stats.activeTables,
      staffCount: stats.staffCount,
    },
    restaurants,
  };
}

export async function verifyZonePin(zoneId: string, pin: string) {
  try {
    const st = await prisma.chainStaff.findFirst({
      where: { 
        zoneId: zoneId, 
        pin: pin, 
        role: "ZONE_MANAGER", 
        isActive: true 
      }
    });
    if (!st) return { success: false, error: "Credenciales de zona inválidas" };
    return { success: true, token: st.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function createRestaurantInChain(data: {
  chainId: string;
  name: string;
  address?: string;
  zoneId?: string;
  newZoneName?: string;
}) {
  try {
    let finalZoneId = data.zoneId;
    
    if (!finalZoneId && data.newZoneName) {
      const zone = await prisma.zone.create({
        data: {
          name: data.newZoneName,
          chainId: data.chainId,
        }
      });
      finalZoneId = zone.id;
    } else if (!finalZoneId) {
      // Intentar buscar una zona por defecto, si no crearla
      let defZone = await prisma.zone.findFirst({
        where: { chainId: data.chainId }
      });
      if (!defZone) {
        defZone = await prisma.zone.create({
          data: { name: "Zona Principal", chainId: data.chainId }
        });
      }
      finalZoneId = defZone.id;
    }

    const rest = await prisma.restaurant.create({
      data: {
        name: data.name,
        address: data.address || null,
        zoneId: finalZoneId,
      }
    });

    return { success: true, restaurantId: rest.id };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

// ── Plantillas de menú (cadena) ─────────────────────────────

export interface ChainMenuTemplateRow {
  id: string;
  name: string;
  isDefault: boolean;
  categoryCount: number;
  itemCount: number;
  restaurantCount: number;
  updatedAt: string;
}

export interface ChainMenuTemplatesData {
  chain: { id: string; name: string };
  templates: ChainMenuTemplateRow[];
}

export async function getChainMenuTemplates(tenantId: string): Promise<ChainMenuTemplatesData | null> {
  const chain = await prisma.chain.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true },
  });
  if (!chain) return null;

  const rows = await prisma.menuTemplate.findMany({
    where: { chainId: tenantId },
    orderBy: [{ isDefault: "desc" }, { updatedAt: "desc" }],
    include: {
      categories: {
        select: { _count: { select: { items: true } } },
      },
      _count: { select: { restaurants: true } },
    },
  });

  const templates: ChainMenuTemplateRow[] = rows.map((t) => ({
    id: t.id,
    name: t.name,
    isDefault: t.isDefault,
    categoryCount: t.categories.length,
    itemCount: t.categories.reduce((acc, c) => acc + c._count.items, 0),
    restaurantCount: t._count.restaurants,
    updatedAt: t.updatedAt.toISOString(),
  }));

  return { chain, templates };
}

export async function createChainMenuTemplate(input: {
  chainId: string;
  name: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const name = input.name?.trim();
  if (!name) return { success: false, error: "El nombre es obligatorio." };

  try {
    const chain = await prisma.chain.findUnique({
      where: { id: input.chainId },
      select: { id: true },
    });
    if (!chain) return { success: false, error: "Cadena no encontrada." };

    await prisma.menuTemplate.create({
      data: {
        chainId: input.chainId,
        name,
        isDefault: false,
      },
    });
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "No se pudo crear la plantilla.";
    return { success: false, error: msg };
  }
}

// ── Personal corporativo (ChainStaff) ───────────────────────

export type ChainStaffRole = "CHAIN_ADMIN" | "ZONE_MANAGER";

export interface ChainStaffRow {
  id: string;
  name: string;
  role: ChainStaffRole;
  isActive: boolean;
  zoneId: string | null;
  zoneName: string | null;
  createdAt: string;
}

export interface ChainStaffListData {
  chain: { id: string; name: string };
  staff: ChainStaffRow[];
  zones: { id: string; name: string }[];
}

export async function getChainStaffList(tenantId: string): Promise<ChainStaffListData | null> {
  const chain = await prisma.chain.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true },
  });
  if (!chain) return null;

  const [staff, zones] = await Promise.all([
    prisma.chainStaff.findMany({
      where: { chainId: tenantId },
      orderBy: [{ role: "asc" }, { name: "asc" }],
    }),
    prisma.zone.findMany({
      where: { chainId: tenantId },
      select: { id: true, name: true },
      orderBy: { name: "asc" },
    }),
  ]);

  const zoneMap = Object.fromEntries(zones.map((z) => [z.id, z.name]));

  const rows: ChainStaffRow[] = staff.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role as ChainStaffRole,
    isActive: s.isActive,
    zoneId: s.zoneId,
    zoneName: s.zoneId ? (zoneMap[s.zoneId] ?? null) : null,
    createdAt: s.createdAt.toISOString(),
  }));

  return { chain, staff: rows, zones };
}

export async function createChainStaffMember(input: {
  chainId: string;
  name: string;
  role: ChainStaffRole;
  pin: string;
  zoneId?: string | null;
}): Promise<{ success: true } | { success: false; error: string }> {
  const name = input.name?.trim();
  if (!name) return { success: false, error: "El nombre es obligatorio." };
  const pin = input.pin?.trim() ?? "";
  if (pin.length < 4) return { success: false, error: "El PIN debe tener al menos 4 caracteres." };

  if (input.role === "ZONE_MANAGER") {
    if (!input.zoneId) {
      return { success: false, error: "Selecciona una zona para el gerente de zona." };
    }
    const zone = await prisma.zone.findFirst({
      where: { id: input.zoneId, chainId: input.chainId },
      select: { id: true },
    });
    if (!zone) return { success: false, error: "La zona no pertenece a esta cadena." };
  }

  try {
    const chain = await prisma.chain.findUnique({
      where: { id: input.chainId },
      select: { id: true },
    });
    if (!chain) return { success: false, error: "Cadena no encontrada." };

    await prisma.chainStaff.create({
      data: {
        chainId: input.chainId,
        name,
        role: input.role,
        pin,
        zoneId: input.role === "ZONE_MANAGER" ? input.zoneId! : null,
      },
    });
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "No se pudo registrar al miembro.";
    return { success: false, error: msg };
  }
}

export async function setChainStaffActive(input: {
  chainId: string;
  staffId: string;
  isActive: boolean;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await prisma.chainStaff.updateMany({
      where: { id: input.staffId, chainId: input.chainId },
      data: { isActive: input.isActive },
    });
    if (res.count === 0) return { success: false, error: "Miembro no encontrado." };
    return { success: true };
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "No se pudo actualizar el estado.";
    return { success: false, error: msg };
  }
}

// ── Auditoría (cadena) ──────────────────────────────────────

export interface ChainAuditOverviewData {
  chain: { id: string; name: string };
  stats: {
    zones: number;
    restaurants: number;
    templates: number;
    templateCategories: number;
    templateItems: number;
    staffTotal: number;
    staffActive: number;
    zoneOverrides: number;
    restaurantOverrides: number;
  };
  updatedAt: string;
}

export async function getChainAuditOverview(tenantId: string): Promise<ChainAuditOverviewData | null> {
  const chain = await prisma.chain.findUnique({
    where: { id: tenantId },
    select: { id: true, name: true },
  });
  if (!chain) return null;

  const [
    zones,
    restaurants,
    templates,
    templateCategories,
    templateItems,
    staffTotal,
    staffActive,
    zoneOverrides,
    restaurantOverrides,
  ] = await Promise.all([
    prisma.zone.count({ where: { chainId: tenantId } }),
    prisma.restaurant.count({ where: { zone: { chainId: tenantId } } }),
    prisma.menuTemplate.count({ where: { chainId: tenantId } }),
    prisma.templateCategory.count({ where: { template: { chainId: tenantId } } }),
    prisma.templateItem.count({ where: { category: { template: { chainId: tenantId } } } }),
    prisma.chainStaff.count({ where: { chainId: tenantId } }),
    prisma.chainStaff.count({ where: { chainId: tenantId, isActive: true } }),
    prisma.zoneMenuOverride.count({ where: { template: { chainId: tenantId } } }),
    prisma.restaurantMenuOverride.count({ where: { restaurant: { zone: { chainId: tenantId } } } }),
  ]);

  return {
    chain,
    stats: {
      zones,
      restaurants,
      templates,
      templateCategories,
      templateItems,
      staffTotal,
      staffActive,
      zoneOverrides,
      restaurantOverrides,
    },
    updatedAt: new Date().toISOString(),
  };
}



// --- ZONE ACTIONS RESTORED ---

export interface ZoneSettingsData {
  zone: { id: string; name: string; chainId: string; chainName: string };
  stats: {
    restaurants: number;
    staffActive: number;
    staffTotal: number;
  };
}

export async function getZoneSettings(zoneId: string): Promise<ZoneSettingsData | null> {
  const zone = await prisma.zone.findUnique({ 
    where: { id: zoneId }, 
    include: { chain: { select: { name: true } } }
  });
  if (!zone) return null;

  const restaurants = await prisma.restaurant.count({ where: { zoneId } });
  
  const staffCounts = await prisma.staff.groupBy({
    by: ['isActive'],
    where: { restaurant: { zoneId }, role: 'ADMIN' },
    _count: true
  });
  
  let staffTotal = 0;
  let staffActive = 0;
  staffCounts.forEach(g => {
    staffTotal += g._count;
    if (g.isActive) staffActive += g._count;
  });

  return {
    zone: { id: zone.id, name: zone.name, chainId: zone.chainId, chainName: zone.chain.name },
    stats: { restaurants, staffActive, staffTotal }
  };
}

export async function rotateZonePin(input: { zoneId: string; actorStaffId: string; newPin: string }): Promise<{ success: boolean; error?: string }> {
  try {
     const count = await prisma.chainStaff.updateMany({
         where: { zoneId: input.zoneId, role: "ZONE_MANAGER" },
         data: { pin: input.newPin }
     });
     return { success: true };
  } catch (e: any) {
     return { success: false, error: e.message };
  }
}

export interface RestaurantManagerRow {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  restaurantId: string;
  restaurantName: string;
  createdAt: string;
}

export interface ZoneStaffData {
  zone: { id: string; name: string; chainId: string; chainName: string };
  staff: RestaurantManagerRow[];
  restaurants: { id: string; name: string }[];
}

export async function getZoneStaff(zoneId: string): Promise<ZoneStaffData | null> {
  const zone = await prisma.zone.findUnique({
    where: { id: zoneId },
    include: { 
      chain: { select: { id: true, name: true } },
      restaurants: { select: { id: true, name: true } }
    },
  });
  if (!zone) return null;

  const staff = await prisma.staff.findMany({
    where: { 
      restaurant: { zoneId },
      role: 'ADMIN'
    },
    include: { restaurant: { select: { name: true } } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const rows: RestaurantManagerRow[] = staff.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    isActive: s.isActive,
    restaurantId: s.restaurantId,
    restaurantName: s.restaurant.name,
    createdAt: s.createdAt.toISOString(),
  }));

  return {
    zone: { id: zone.id, name: zone.name, chainId: zone.chainId, chainName: zone.chain.name },
    staff: rows,
    restaurants: zone.restaurants,
  };
}

export async function createZoneStaffMember(input: {
  zoneId: string;
  name: string;
  pin: string;
  restaurantId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const name = input.name?.trim();
  if (!name) return { success: false, error: "El nombre es obligatorio." };
  const pin = input.pin?.trim() ?? "";
  if (pin.length < 4) return { success: false, error: "El PIN debe tener al menos 4 caracteres." };
  if (!input.restaurantId) return { success: false, error: "Debes seleccionar una sucursal." };

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId },
  });
  
  if (!restaurant || restaurant.zoneId !== input.zoneId) {
    return { success: false, error: "Sucursal inválida." };
  }

  try {
    await prisma.staff.create({
      data: {
        restaurantId: input.restaurantId,
        name,
        role: "ADMIN",
        pin,
        isActive: true,
      },
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}

export async function setRestaurantAdminActive(input: {
  staffId: string;
  isActive: boolean;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    const res = await prisma.staff.updateMany({
      where: { id: input.staffId, role: 'ADMIN' },
      data: { isActive: input.isActive },
    });
    if (res.count === 0) return { success: false, error: "Gerente no encontrado." };
    return { success: true };
  } catch (e: unknown) {
    return { success: false, error: "No se pudo actualizar el estado." };
  }
}

