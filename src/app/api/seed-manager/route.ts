import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
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
          role: "ZONE_MANAGER"
        }
      });
      return NextResponse.json({
        mensaje: "✅ Creado Gerente de Zona! Úsalo para probar el Auth de la Zona.",
        idZona: zone.id,
        pin: "1234"
      });
    } else {
      return NextResponse.json({
        mensaje: "✅ Ya existe gerente de zona",
        idZona: zone.id,
        pin: exists.pin
      });
    }
  } else {
    return NextResponse.json({ error: "No hay zonas en la base de datos." });
  }
}
