const { PrismaClient } = require('./src/generated/prisma/index.js');
const prisma = new PrismaClient();

async function main() {
  const zones = await prisma.zone.findMany({ include: { chain: true, staff: true } });
  console.log(JSON.stringify(zones, null, 2));
}
main().catch(console.error).finally(() => prisma.$disconnect());
