import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  // TODO: migrar a AppUser + UserRole (chainStaff fue eliminado del schema)
  return NextResponse.json({
    mensaje: "Seed manager deshabilitado: chainStaff eliminado del schema. Usa AppUser + UserRole.",
  });
}
