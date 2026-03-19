const fs = require('fs');

// ==== 1. API Changes ====
let api = fs.readFileSync('src/actions/comensal.ts', 'utf8');

// Modificamos guestJoinTable
api = api.replace('export async function guestJoinTable(tableCode: string, guestName: string, pax: number) {', 'export async function guestJoinTable(tableCode: string, guestName: string, pax: number) {\n  const table = await prisma.table.findUnique({ where: { qrCode: tableCode } });\n  if (!table) return false;\n\n  if (table.status !== "OCUPADA") {\n    await prisma.table.update({ where: { id: table.id }, data: { status: "OCUPADA" } });\n    revalidatePath("/dashboard/mesas");\n  }\n\n  let session = await prisma.session.findFirst({ where: { tableId: table.id, isActive: true }, orderBy: { createdAt: "desc" } });\n\n  if (!session) {\n    session = await prisma.session.create({ data: { tableId: table.id, guestName, pax, isActive: true } });\n  } else {\n    // Si ya existe sesión activa no sobreescribimos los comensales y devolvemos que se ha unido.\n    await prisma.session.update({ where: { id: session.id }, data: { pax: Math.max(session.pax, pax) } }); // Aseguramos que el count en BD tenga el mayor detectado just in case\n  }\n\n  const cookieStore = await cookies();\n  cookieStore.set(`bq_session_${tableCode}`, session.id, { maxAge: 60 * 60 * 12, httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });\n  cookieStore.set(`bq_guest_${tableCode}`, encodeURIComponent(guestName), { maxAge: 60 * 60 * 12, httpOnly: false, path: "/" });\n\n  return session.pax;\n}');

// we need to completely replace the previous function since we just injected it...
// Actually, safer if I just write a proper replacer.
