import { prisma } from "@/lib/prisma";

export async function resolveTenantScope(userId: string) {
  const userRoles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: true },
  });
  const restaurant = userRoles.find(ur => ur.contextType === "RESTAURANT");
  if (restaurant)
    return {
      restaurantId: restaurant.restaurantId ?? undefined,
      zoneId: restaurant.zoneId ?? undefined,
      chainId: restaurant.chainId ?? undefined,
    };
  const zone = userRoles.find(ur => ur.contextType === "ZONE");
  if (zone)
    return {
      zoneId: zone.zoneId ?? undefined,
      chainId: zone.chainId ?? undefined,
    };
  const chain = userRoles.find(ur => ur.contextType === "CHAIN");
  if (chain) return { chainId: chain.chainId ?? undefined };
  return {};
}
