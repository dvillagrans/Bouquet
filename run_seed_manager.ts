import { prisma } from "./src/lib/prisma";

async function main() {
  const zones = await prisma.zone.findMany({ include: { chain: true } });
  
  if (zones.length > 0) {
    const zone = zones[0];
    const exists = await prisma.chainStaff.findFirst({
      where: { zoneId: zone.id, role: "ZONE_MANAGER" },
    });
    
    if (!exists) {
      await prisma.chainStaff.create({
        data: {
          chainId: zone.chainId,
          zoneId: zone.id,
          name: "Gerente MVP",
          pin: "1234",
          role: "ZONE_MANAGER",
        }
      });
      console.log(`✅ Creado gerente para zona ${zone.name} con PIN 1234. ID: ${zone.id}`);
    } else {
      console.log(`✅ Ya existe gerente para ${zone.name}: PIN ${exists.pin}, ID de la Zona: ${zone.id}`);
    }
  } else {
    console.log("No hay zonas en la base de datos.");
  }
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
