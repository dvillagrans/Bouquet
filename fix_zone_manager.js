const fs = require('fs');

let content = fs.readFileSync('src/actions/chain.ts', 'utf8');

if (!content.includes('createZoneManager')) {
  const newAction = `
export async function createZoneManager(data: { chainId: string; zoneId: string; name: string; pin: string }) {
  await prisma.chainStaff.create({
    data: {
      chainId: data.chainId,
      zoneId: data.zoneId,
      name: data.name,
      pin: data.pin,
      role: 'ZONE_MANAGER'
    }
  });
  return { success: true };
}

export async function getZoneManagers(zoneId: string) {
  return prisma.chainStaff.findMany({
    where: { zoneId, role: 'ZONE_MANAGER', isActive: true },
    select: { id: true, name: true, pin: true }
  });
}
`;
  fs.writeFileSync('src/actions/chain.ts', content + newAction);
}
