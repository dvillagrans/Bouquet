"use server";

import { prisma } from "@/lib/prisma";
import { withAuth } from "@/lib/auth-action";
import { createAuditLog } from "@/lib/audit";
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

export interface ChainDashboardStaffRow {
  id: string;
  name: string;
  email: string;
  role: string;
  restaurantName?: string;
  lastActive?: string;
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
  staff: ChainDashboardStaffRow[];
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

const CHAIN_READ_ROLES = ["PLATFORM_ADMIN", "CHAIN_ADMIN", "ZONE_MANAGER"];
const CHAIN_MUTATE_ROLES = ["PLATFORM_ADMIN", "CHAIN_ADMIN"];

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

export const getChainDashboard = withAuth(
  async (_ctx, tenantId: string): Promise<ChainDashboardData | null> => {
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

    const sessionCountMap = new Map<string, number>();
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

    const staffMembers = await prisma.userRole.findMany({
      where: {
        OR: [
          { chainId: tenantId },
          { restaurant: { chainId: tenantId } }
        ]
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          }
        },
        restaurant: {
          select: { name: true }
        },
        role: {
          select: { name: true }
        }
      },
      take: 50,
      orderBy: { assignedAt: 'desc' }
    });

    const staff: ChainDashboardStaffRow[] = staffMembers.map(sm => ({
      id: sm.user.id,
      name: `${sm.user.firstName} ${sm.user.lastName}`,
      email: sm.user.email,
      role: (sm as any).role?.name || "STAFF",
      restaurantName: sm.restaurant?.name || "Corporativo",
      lastActive: new Date().toISOString()
    }));

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
      staff,
      alerts,
    };
  },
  { allowRoles: CHAIN_READ_ROLES }
);


const ZONE_NAME_MAX_LEN = 120;

export const renameChainZone = withAuth(
  async (ctx, input: {
    chainId: string;
    zoneId: string;
    name: string;
  }): Promise<{ success: boolean; error?: string }> => {
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

    createAuditLog({
      actorUserId: ctx.userId,
      chainId: input.chainId,
      action: "UPDATE",
      entityType: "Zone",
      entityId: input.zoneId,
      after: { name },
    });

    return { success: true };
  },
  { allowRoles: CHAIN_MUTATE_ROLES }
);

export const getZoneDashboard = withAuth(
  async (_ctx, zoneId: string): Promise<ZoneDashboardData | null> => {
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
  },
  { allowRoles: CHAIN_READ_ROLES }
);

export async function verifyZonePin(_zoneId: string, _pin: string): Promise<{ success: boolean; error?: string; token?: string }> {
  return { success: false, error: "Autenticación de zona deshabilitada: chainStaff eliminado del schema." };
}

export const createRestaurantInChain = withAuth(
  async (ctx, data: {
    chainId: string;
    name: string;
    address?: string;
    zoneId?: string;
    newZoneName?: string;
    adminName?: string;
    adminEmail?: string;
    adminPassword?: string;
  }) => {
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

        createAuditLog({
          actorUserId: ctx.userId,
          chainId: data.chainId,
          restaurantId: rest.id,
          action: "CREATE",
          entityType: "Restaurant",
          entityId: rest.id,
          after: { name: data.name, zoneId: finalZoneId, adminEmail: email },
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

      createAuditLog({
        actorUserId: ctx.userId,
        chainId: data.chainId,
        restaurantId: rest.id,
        action: "CREATE",
        entityType: "Restaurant",
        entityId: rest.id,
        after: { name: data.name, zoneId: finalZoneId },
      });

      return { success: true, restaurantId: rest.id };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
  { allowRoles: CHAIN_MUTATE_ROLES }
);

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

export const getChainMenuTemplates = withAuth(
  async (_ctx, tenantId: string): Promise<ChainMenuTemplatesData | null> => {
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
      restaurantCount: 0,
      updatedAt: t.updatedAt.toISOString(),
    }));

    return { chain, templates };
  },
  { allowRoles: CHAIN_READ_ROLES }
);

export const createChainMenuTemplate = withAuth(
  async (ctx, input: {
    chainId: string;
    name: string;
  }): Promise<{ success: true } | { success: false; error: string }> => {
    const name = input.name?.trim();
    if (!name) return { success: false, error: "El nombre es obligatorio." };

    try {
      const chain = await prisma.chain.findUnique({
        where: { id: input.chainId },
        select: { id: true },
      });
      if (!chain) return { success: false, error: "Cadena no encontrada." };

      const template = await prisma.menuTemplate.create({
        data: {
          chainId: input.chainId,
          name,
          isDefault: false,
        },
      });

      createAuditLog({
        actorUserId: ctx.userId,
        chainId: input.chainId,
        action: "CREATE",
        entityType: "MenuTemplate",
        entityId: template.id,
        after: { name },
      });

      return { success: true };
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : "No se pudo crear la plantilla.";
      return { success: false, error: msg };
    }
  },
  { allowRoles: CHAIN_MUTATE_ROLES }
);

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

export const getChainStaffList = withAuth(
  async (_ctx, tenantId: string): Promise<ChainStaffListData | null> => {
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
  },
  { allowRoles: CHAIN_READ_ROLES }
);

export const createChainStaffMember = withAuth(
  async (ctx, input: {
    chainId: string;
    name: string;
    role: ChainStaffRole;
    zoneId?: string | null;
  }): Promise<{ success: true } | { success: false; error: string }> => {
    const { hashPassword } = await import("@/lib/auth-password");

    const names = input.name.trim().split(/\s+/);
    const firstName = names[0] ?? "Staff";
    const lastName = names.slice(1).join(" ") ?? "Cadena";
    const email = `staff-${Date.now()}@bouquet.internal`;
    const tempPassword = Math.random().toString(36).slice(-8);
    const passwordHash = await hashPassword(tempPassword);

    const roleName = input.role;

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

    createAuditLog({
      actorUserId: ctx.userId,
      chainId: input.chainId,
      action: "CREATE",
      entityType: "AppUser",
      entityId: user.id,
      after: { name: input.name, role: roleName, email },
    });

    return { success: true };
  },
  { allowRoles: CHAIN_MUTATE_ROLES }
);

export const setChainStaffActive = withAuth(
  async (ctx, input: {
    chainId: string;
    staffId: string;
    isActive: boolean;
  }): Promise<{ success: true } | { success: false; error: string }> => {
    try {
      await prisma.appUser.update({
        where: { id: input.staffId },
        data: { isActive: input.isActive },
      });

      createAuditLog({
        actorUserId: ctx.userId,
        chainId: input.chainId,
        action: "UPDATE",
        entityType: "AppUser",
        entityId: input.staffId,
        after: { isActive: input.isActive },
      });

      return { success: true };
    } catch (e: any) {
      return { success: false, error: e.message };
    }
  },
  { allowRoles: CHAIN_MUTATE_ROLES }
);

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

export const getChainAuditOverview = withAuth(
  async (_ctx, tenantId: string): Promise<ChainAuditOverviewData | null> => {
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
  },
  { allowRoles: CHAIN_READ_ROLES }
);

export interface ZoneSettingsData {
  zone: { id: string; name: string; chainId: string; chainName: string };
  stats: {
    restaurants: number;
    staffActive: number;
    staffTotal: number;
  };
}

export const getZoneSettings = withAuth(
  async (_ctx, zoneId: string): Promise<ZoneSettingsData | null> => {
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
  },
  { allowRoles: CHAIN_READ_ROLES }
);

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

export const getZoneStaff = withAuth(
  async (_ctx, zoneId: string): Promise<ZoneStaffData | null> => {
    const zone = await prisma.zone.findUnique({
      where: { id: zoneId },
      include: {
        chain: { select: { id: true, name: true } },
        restaurants: { select: { id: true, name: true } }
      },
    });
    if (!zone) return null;

    const rows: RestaurantManagerRow[] = [];

    return {
      zone: { id: zone.id, name: zone.name, chainId: zone.chainId, chainName: zone.chain.name },
      staff: rows,
      restaurants: zone.restaurants,
    };
  },
  { allowRoles: CHAIN_READ_ROLES }
);

export async function createZoneStaffMember(_input: {
  zoneId: string;
  name: string;
  restaurantId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  return { success: false, error: "staff eliminado del schema. Usa AppUser + UserRole." };
}

export async function setRestaurantAdminActive(_input: {
  staffId: string;
  isActive: boolean;
}): Promise<{ success: true } | { success: false; error: string }> {
  return { success: false, error: "staff eliminado del schema. Usa AppUser + UserRole." };
}
