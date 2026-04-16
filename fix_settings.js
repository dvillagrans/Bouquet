const fs = require('fs');

const path = 'src/actions/chain.ts';
let code = fs.readFileSync(path, 'utf-8');

const updatedSettings = `
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
`;

code = code.replace(/\/\/ --- ZONE ACTIONS RESTORED ---[\s\S]*?export interface RestaurantManagerRow/m, updatedSettings + '\nexport interface RestaurantManagerRow');

fs.writeFileSync(path, code);
