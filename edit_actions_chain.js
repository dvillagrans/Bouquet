const fs = require('fs');

const path = 'src/actions/chain.ts';
let code = fs.readFileSync(path, 'utf8');

const regexZoneStaffData = /export interface ZoneStaffData \{[\s\S]*?export async function getZoneStaff/g;
code = code.replace(regexZoneStaffData, `export interface RestaurantManagerRow {
  id: string;
  name: string;
  role: string;
  isActive: boolean;
  restaurantId: string;
  restaurantName: string;
  createdAt: string;
}

export interface ZoneStaffData {
  zone: { id: string; name: string; chainId: string; chainName: string };
  staff: RestaurantManagerRow[];
  restaurants: { id: string; name: string }[];
}

export async function getZoneStaff`);

const regexGetZoneStaff = /export async function getZoneStaff\(zoneId: string\): Promise<ZoneStaffData \| null> \{[\s\S]*?return \{\s*zone: \{ id: zone.id, name: zone.name, chainId: zone.chainId, chainName: zone.chain.name \},\s*staff: rows,\s*\};\s*\}/g;

code = code.replace(regexGetZoneStaff, `export async function getZoneStaff(zoneId: string): Promise<ZoneStaffData | null> {
  const zone = await prisma.zone.findUnique({
    where: { id: zoneId },
    include: { 
      chain: { select: { id: true, name: true } },
      restaurants: { select: { id: true, name: true } }
    },
  });
  if (!zone) return null;

  const staff = await prisma.staff.findMany({
    where: { 
      restaurant: { zoneId },
      role: 'ADMIN'
    },
    include: { restaurant: { select: { name: true } } },
    orderBy: [{ isActive: "desc" }, { name: "asc" }],
  });

  const rows: RestaurantManagerRow[] = staff.map((s) => ({
    id: s.id,
    name: s.name,
    role: s.role,
    isActive: s.isActive,
    restaurantId: s.restaurantId,
    restaurantName: s.restaurant.name,
    createdAt: s.createdAt.toISOString(),
  }));

  return {
    zone: { id: zone.id, name: zone.name, chainId: zone.chainId, chainName: zone.chain.name },
    staff: rows,
    restaurants: zone.restaurants,
  };
}`);

const regexCreateZoneStaffMember = /export async function createZoneStaffMember\(input: \{[\s\S]*?\} catch \(e\) \{[\s\S]*?return \{ success: false, error: "Error al crear miembro" \};\s*\}/g;

code = code.replace(regexCreateZoneStaffMember, `export async function createZoneStaffMember(input: {
  zoneId: string;
  name: string;
  pin: string;
  restaurantId: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const name = input.name?.trim();
  if (!name) return { success: false, error: "El nombre es obligatorio." };
  const pin = input.pin?.trim() ?? "";
  if (pin.length < 4) return { success: false, error: "El PIN debe tener al menos 4 caracteres." };
  if (!input.restaurantId) return { success: false, error: "Debes seleccionar una sucursal." };

  const res = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId }
  });
  if (!res || res.zoneId !== input.zoneId) return { success: false, error: "Sucursal inválida." };

  try {
    await prisma.staff.create({
      data: {
        restaurantId: input.restaurantId,
        name,
        role: "ADMIN",
        pin,
        isActive: true,
      }
    });
    return { success: true };
  } catch (e) {
    return { success: false, error: "Error al crear gerente de sucursal" };
  }`);

fs.writeFileSync(path, code);
