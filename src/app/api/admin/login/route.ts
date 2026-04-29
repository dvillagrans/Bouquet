import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST() {
  // TODO: migrar a AppUser + UserRole (superAdmin fue eliminado del schema)
  return NextResponse.json(
    { ok: false, error: "Login deshabilitado: superAdmin eliminado del schema. Usa AppUser + UserRole." },
    { status: 503 }
  );
}
