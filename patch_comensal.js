const fs = require('fs');

let content = fs.readFileSync('src/actions/comensal.ts', 'utf8');
const index = content.indexOf("export async function guestJoinTable");
content = content.substring(0, index) + `export async function guestJoinTable(tableCode: string, guestName: string, pax: number) {
  const table = await prisma.table.findUnique({ where: { qrCode: tableCode } });
  if (!table) return false;

  if (table.status !== "OCUPADA") {
    await prisma.table.update({
      where: { id: table.id },
      data: { status: "OCUPADA" }
    });
    revalidatePath("/dashboard/mesas");
  }

  let session = await prisma.session.findFirst({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "desc" }
  });

  if (!session) {
    session = await prisma.session.create({
      data: { tableId: table.id, guestName, pax, isActive: true }
    });
  }

  const cookieStore = await cookies();
  cookieStore.set(\`bq_session_\${tableCode}\`, session.id, {
    maxAge: 60 * 60 * 12,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
  });
  cookieStore.set(\`bq_guest_\${tableCode}\`, encodeURIComponent(guestName), {
    maxAge: 60 * 60 * 12,
    httpOnly: false, // para leer en cliente si hace falta
    path: "/",
  });

  return true;
}

export async function requestBillAndPay(tableCode: string) {
  const table = await prisma.table.findUnique({ where: { qrCode: tableCode } });
  if (!table) throw new Error("Mesa no encontrada");

  const session = await prisma.session.findFirst({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "desc" }
  });

  if (!session) throw new Error("No hay sesion activa");

  await prisma.session.update({
    where: { id: session.id },
    data: { isActive: false }
  });

  await prisma.table.update({
    where: { id: table.id },
    data: { status: "SUCIA" }
  });

  const cookieStore = await cookies();
  cookieStore.delete(\`bq_session_\${tableCode}\`);
  cookieStore.delete(\`bq_guest_\${tableCode}\`);

  revalidatePath("/dashboard/mesas");
  return true;
}
`;
fs.writeFileSync('src/actions/comensal.ts', content);
