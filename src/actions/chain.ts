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
  chain: { id: string; name: string; currency: string };
  stats: {
    totalRevenue: number;
    totalSessions: number;
    activeTables: number;
    restaurantCount: number;
    staffTotal: number;
  };
  yesterday: {
    totalRevenue: number;
    totalSessions: number;
  };
  zones: ZoneSummary[];
  restaurants: RestaurantSummary[];
  alerts: {
    id: string;
    name: string;
    type: "NO_SALES" | "NO_TABLES" | "LOW_OCCUPANCY";
    message: string;
  }[];
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

// TODO: migrar a AppUser + UserRole (chainStaff fue eliminado del schema)
export async function verifyChainPin(_tenantId: string, _pin: string) {
  return false;
}

async function fetchRestaurants(chainId?: string, zoneId?: string) {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const whereClause: any = {};
  if (chainId) {
    whereClause.chainId = chainId;
  }
  if (zoneId) {
    whereClause.zoneId = zoneId;
  }

  return prisma.restaurant.findMany({
    where: whereClause,
    include: {
      zone: { select: { id: true, name: true, chainId: true } },
      diningTables: {
        select: {
          id: true,
          status: true,
        },
      },
      userRoles: {
        where: { user: { isActive: true } },
        select: { id: true },
      },
      orders: {
        where: {
          createdAt: { gte: dayStart, lte: dayEnd },
          status: { in: ["READY", "DELIVERED"] },
        },
        include: { items: { select: { quantity: true, totalCents: true } } },
      },
    },
    orderBy: { name: "asc" },
  });
}

function toSummary(r: any, sessionCountMap: Map<string, number>): RestaurantSummary {
  const todayRevenue = r.orders.reduce((a: number, o: any) => {
    const total = o.items.reduce((sum: number, it: any) => sum + it.quantity * (it.totalCents / 100), 0);
    return a + total;
  }, 0);

  const todaySessions = r.diningTables.reduce(
    (a: number, t: any) => a + (sessionCountMap.get(t.id) || 0),
    0
  );

  return {
    id: r.id,
    name: r.name,
    address: r.address,
    zoneName: r.zone?.name || null,
    zoneId: r.zoneId,
    totalTables: r.diningTables.length,
    activeTables: r.diningTables.filter((t: any) => t.status === "OCUPADA").length,
    activeStaff: r.userRoles?.length ?? 0,
    todayRevenue,
    todaySessions,
  };
}

export async function getChainDashboard(tenantId: string): Promise<ChainDashboardData | null> {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);
  const yesterdayStart = startOfDay(new Date(now.getTime() - 86400000));
  const yesterdayEnd = endOfDay(new Date(now.getTime() - 86400000));

  const [chain, rawRestaurants, staffTotal] = await Promise.all([
    prisma.chain.findUnique({ where: { id: tenantId }, select: { id: true, name: true, currency: true } }),
    fetchRestaurants(tenantId),
    prisma.userRole.count({ where: { chainId: tenantId, contextType: "CHAIN" } }),
  ]);

  if (!chain) return null;

  const diningTableIds = rawRestaurants.flatMap((r) => r.diningTables.map((t: any) => t.id));

  // Sesiones de hoy
  const sessionCountMap = new Map<string, number>();
  // Sesiones de ayer (para comparativa)
  const yesterdaySessionMap = new Map<string, number>();

  if (diningTableIds.length > 0) {
    const [todayCounts, yesterdayCounts] = await Promise.all([
      prisma.diningSessionTable.groupBy({
        by: ["tableId"],
        where: {
          tableId: { in: diningTableIds },
          joinedAt: { gte: dayStart, lte: dayEnd },
        },
        _count: true,
      }),
      prisma.diningSessionTable.groupBy({
        by: ["tableId"],
        where: {
          tableId: { in: diningTableIds },
          joinedAt: { gte: yesterdayStart, lte: yesterdayEnd },
        },
        _count: true,
      }),
    ]);
    for (const c of todayCounts) {
      sessionCountMap.set(c.tableId, (c._count as any)._all || 0);
    }
    for (const c of yesterdayCounts) {
      yesterdaySessionMap.set(c.tableId, (c._count as any)._all || 0);
    }
  }

  // Órdenes de ayer para comparativa de revenue
  const yesterdayOrders = await prisma.restaurantOrder.findMany({
    where: {
      restaurant: { chainId: tenantId },
      createdAt: { gte: yesterdayStart, lte: yesterdayEnd },
      status: { in: ["READY", "DELIVERED"] },
    },
    include: { items: { select: { quantity: true, totalCents: true } } },
  });
  const yesterdayRevenue = yesterdayOrders.reduce((a, o) => {
    const total = o.items.reduce((sum, it) => sum + it.quantity * (it.totalCents / 100), 0);
    return a + total;
  }, 0);
  const yesterdaySessions = Array.from(yesterdaySessionMap.values()).reduce((a, b) => a + b, 0);

  const restaurants = rawRestaurants
    .map((r) => toSummary(r, sessionCountMap))
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

  // Alertas
  const alerts: ChainDashboardData["alerts"] = [];
  for (const r of restaurants) {
    if (r.todayRevenue === 0 && r.totalTables > 0) {
      alerts.push({ id: r.id, name: r.name, type: "NO_SALES", message: "Sin ventas hoy" });
    } else if (r.totalTables === 0) {
      alerts.push({ id: r.id, name: r.name, type: "NO_TABLES", message: "Sin mesas configuradas" });
    } else if (r.totalTables > 0) {
      const occ = (r.activeTables / r.totalTables) * 100;
      if (occ < 15) {
        alerts.push({ id: r.id, name: r.name, type: "LOW_OCCUPANCY", message: `Ocupación baja (${occ.toFixed(0)}%)` });
      }
    }
  }

  return {
    chain,
    stats: {
      totalRevenue: totals.revenue,
      totalSessions: totals.sessions,
      activeTables: totals.activeTables,
      restaurantCount: restaurants.length,
      staffTotal,
    },
    yesterday: {
      totalRevenue: yesterdayRevenue,
      totalSessions: yesterdaySessions,
    },
    zones: zones.sort((a, b) => b.totalRevenue - a.totalRevenue),
    restaurants,
    alerts,
  };
}

const ZONE_NAME_MAX_LEN = 120;

/** Renombrar zona desde contexto cadena (el cliente envía chainId; revisa sesión en UI). */
export async function renameChainZone(input: {
  chainId: string;
  zoneId: string;
  name: string;
}): Promise<{ success: boolean; error?: string }> {
  const name = input.name.trim();
  if (name.length < 2) {
    return { success: false, error: "El nombre debe tener al menos 2 caracteres." };
  }
  if (name.length > ZONE_NAME_MAX_LEN) {
    return { success: false, error: `Máximo ${ZONE_NAME_MAX_LEN} caracteres.` };
  }

  const zone = await prisma.zone.findFirst({
    where: { id: input.zoneId, chainId: input.chainId },
    select: { id: true },
  });
  if (!zone) {
    return { success: false, error: "La zona no existe o no pertenece a esta cadena." };
  }

  await prisma.zone.update({
    where: { id: input.zoneId },
    data: { name },
  });
  return { success: true };
}

export async function getZoneDashboard(zoneId: string): Promise<ZoneDashboardData | null> {
  const now = new Date();
  const dayStart = startOfDay(now);
  const dayEnd = endOfDay(now);

  const [zone, rawRestaurants] = await Promise.all([
    prisma.zone.findUnique({
      where: { id: zoneId },
      include: { chain: { select: { name: true } } },
    }),
    fetchRestaurants(undefined, zoneId),
  ]);

  if (!zone) return null;

  const diningTableIds = rawRestaurants.flatMap((r) => r.diningTables.map((t: any) => t.id));
  const sessionCountMap = new Map<string, number>();
  if (diningTableIds.length > 0) {
    const counts = await prisma.diningSessionTable.groupBy({
      by: ["tableId"],
      where: {
        tableId: { in: diningTableIds },
        joinedAt: { gte: dayStart, lte: dayEnd },
      },
      _count: true,
    });
    for (const c of counts) {
      sessionCountMap.set(c.tableId, (c._count as any)._all || 0);
    }
  }

  const restaurants = rawRestaurants
    .map((r) => toSummary(r, sessionCountMap))
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

// TODO: migrar a AppUser + UserRole (chainStaff fue eliminado del schema)
export async function verifyZonePin(_zoneId: string, _pin: string): Promise<{ success: boolean; error?: string; token?: string }> {
  return { success: false, error: "Autenticación de zona deshabilitada: chainStaff eliminado del schema." };
}

export async function createRestaurantInChain(data: {
  chainId: string;
  name: string;
  address?: string;
  zoneId?: string;
  newZoneName?: string;
  adminName?: string;
  adminEmail?: string;
  adminPassword?: string;
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
        chainId: data.chainId,
        currency: "MXN",
      }
    });

    // Si se proporcionó un admin, crearlo y asignar rol RESTAURANT_ADMIN
    if (data.adminName?.trim()) {
      const { hashPassword } = await import("@/lib/auth-password");

      const role = await prisma.role.upsert({
        where: { id: "role-restaurant-admin" },
        update: {},
        create: {
          id: "role-restaurant-admin",
          name: "RESTAURANT_ADMIN",
          scope: "RESTAURANT",
          isBase: true,
          isActive: true,
        },
      });

      const names = data.adminName.trim().split(/\s+/);
      const firstName = names[0] ?? "Admin";
      const lastName = names.slice(1).join(" ") ?? "Restaurante";
      const email = data.adminEmail?.trim() || `admin-${Date.now()}@bouquet.internal`;
      const tempPassword = data.adminPassword?.trim() || Math.random().toString(36).slice(-8);
      const passwordHash = await hashPassword(tempPassword);

      const adminUser = await prisma.appUser.create({
        data: {
          email,
          passwordHash,
          firstName,
          lastName,
          isActive: true,
        },
      });

      await prisma.userRole.create({
        data: {
          userId: adminUser.id,
          roleId: role.id,
          contextType: "RESTAURANT",
          restaurantId: rest.id,
        },
      });

      return {
        success: true,
        restaurantId: rest.id,
        credentials: {
          email,
          tempPassword,
          name: `${firstName} ${lastName}`.trim(),
        },
      };
    }

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
    },
  });

  const templates: ChainMenuTemplateRow[] = rows.map((t) => ({
    id: t.id,
    name: t.name,
    isDefault: t.isDefault,
    categoryCount: t.categories.length,
    itemCount: t.categories.reduce((acc, c) => acc + c._count.items, 0),
    restaurantCount: 0, // TODO: restaurar cuando se defina relación restaurants en MenuTemplate
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
// TODO: migrar a AppUser + UserRole (chainStaff fue eliminado del schema)

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

  const userRoles = await prisma.userRole.findMany({
    where: {
      OR: [
        { chainId: tenantId, contextType: "CHAIN" },
        { chainId: tenantId, contextType: "ZONE" },
        { chainId: tenantId, contextType: "RESTAURANT" },
      ],
    },
    include: {
      user: { select: { id: true, firstName: true, lastName: true, isActive: true, createdAt: true } },
      role: { select: { name: true } },
      zone: { select: { id: true, name: true } },
    },
    orderBy: { assignedAt: "desc" },
  });

  const staff: ChainStaffRow[] = userRoles.map((ur) => ({
    id: ur.user.id,
    name: `${ur.user.firstName} ${ur.user.lastName}`.trim(),
    role: (ur.role.name === "CHAIN_ADMIN" ? "CHAIN_ADMIN" : "ZONE_MANAGER") as ChainStaffRole,
    isActive: ur.user.isActive,
    zoneId: ur.zone?.id ?? null,
    zoneName: ur.zone?.name ?? null,
    createdAt: ur.user.createdAt.toISOString(),
  }));

  const zones = await prisma.zone.findMany({
    where: { chainId: tenantId },
    select: { id: true, name: true },
    orderBy: { name: "asc" },
  });

  return { chain, staff, zones };
}

export async function createChainStaffMember(input: {
  chainId: string;
  name: string;
  role: ChainStaffRole;
  zoneId?: string | null;
}): Promise<{ success: true } | { success: false; error: string }> {
  const { hashPassword } = await import("@/lib/auth-password");

  const names = input.name.trim().split(/\s+/);
  const firstName = names[0] ?? "Staff";
  const lastName = names.slice(1).join(" ") ?? "Cadena";
  const email = `staff-${Date.now()}@bouquet.internal`;
  const tempPassword = Math.random().toString(36).slice(-8);
  const passwordHash = await hashPassword(tempPassword);

  const roleName = input.role; // CHAIN_ADMIN | ZONE_MANAGER

  const role = await prisma.role.upsert({
    where: { id: `role-${roleName.toLowerCase().replace("_", "-")}` },
    update: {},
    create: {
      id: `role-${roleName.toLowerCase().replace("_", "-")}`,
      name: roleName,
      scope: input.role === "CHAIN_ADMIN" ? "CHAIN" : "ZONE",
      isBase: true,
      isActive: true,
    },
  });

  const user = await prisma.appUser.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      isActive: true,
    },
  });

  await prisma.userRole.create({
    data: {
      userId: user.id,
      roleId: role.id,
      contextType: input.role === "CHAIN_ADMIN" ? "CHAIN" : "ZONE",
      chainId: input.chainId,
      zoneId: input.zoneId ?? null,
    },
  });

  return { success: true };
}

export async function setChainStaffActive(input: {
  chainId: string;
  staffId: string;
  isActive: boolean;
}): Promise<{ success: true } | { success: false; error: string }> {
  try {
    await prisma.appUser.update({
      where: { id: input.staffId },
      data: { isActive: input.isActive },
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
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
  ] = await Promise.all([
    prisma.zone.count({ where: { chainId: tenantId } }),
    prisma.restaurant.count({ where: { chainId: tenantId } }),
    prisma.menuTemplate.count({ where: { chainId: tenantId } }),
    prisma.templateCategory.count({ where: { template: { chainId: tenantId } } }),
    prisma.templateItem.count({ where: { category: { template: { chainId: tenantId } } } }),
    prisma.userRole.count({ where: { chainId: tenantId } }),
    prisma.userRole.count({ where: { chainId: tenantId, user: { isActive: true } } }),
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
      zoneOverrides: 0,
      restaurantOverrides: 0,
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
  
  const staffTotal = await prisma.userRole.count({ where: { zoneId } });
  const staffActive = await prisma.userRole.count({ where: { zoneId, user: { isActive: true } } });

  return {
    zone: { id: zone.id, name: zone.name, chainId: zone.chainId, chainName: zone.chain.name },
    stats: { restaurants, staffActive, staffTotal }
  };
}

// TODO: migrar a AppUser + UserRole
export async function rotateZonePin(_input: { zoneId: string; actorStaffId: string; newPin: string }): Promise<{ success: boolean; error?: string }> {
  return { success: false, error: "chainStaff eliminado del schema." };
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

  // TODO: migrar staff a AppUser + UserRole
  const rows: RestaurantManagerRow[] = [];

  return {
    zone: { id: zone.id, name: zone.name, chainId: zone.chainId, chainName: zone.chain.name },
    staff: rows,
    restaurants: zone.restaurants,
  };
}

// TODO: migrar a AppUser + UserRole
export async function createZoneStaffMember(_input: {
  zoneId: string;
  name: string;
  restaurantId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  return { success: false, error: "staff eliminado del schema. Usa AppUser + UserRole." };
}

// TODO: migrar a AppUser + UserRole
export async function setRestaurantAdminActive(_input: {
  staffId: string;
  isActive: boolean;
}): Promise<{ success: true } | { success: false; error: string }> {
  return { success: false, error: "staff eliminado del schema. Usa AppUser + UserRole." };
}
