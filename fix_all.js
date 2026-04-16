const fs = require('fs');

// 1. FIX chain.ts
let chainCode = fs.readFileSync('src/actions/chain.ts', 'utf-8');

// The implementation of createZoneStaffMember is currently:
/*
export async function createZoneStaffMember(input: {
  zoneId: string;
  name: string;
  pin: string;
}) ...
*/

const oldCreateStr = `export async function createZoneStaffMember(input: {
  zoneId: string;
  name: string;
  pin: string;
}): Promise<{ success: true } | { success: false; error: string }> {
  const name = input.name?.trim();
  if (!name) return { success: false, error: "El nombre es obligatorio." };
  const pin = input.pin?.trim() ?? "";
  if (pin.length < 4) return { success: false, error: "El PIN debe tener al menos 4 caracteres." };

  const zone = await prisma.zone.findUnique({
    where: { id: input.zoneId },
    select: { id: true, chainId: true },
  });
  if (!zone) return { success: false, error: "Zona no encontrada." };

  try {
    await prisma.chainStaff.create({
      data: {
        chainId: zone.chainId,
        zoneId: zone.id,
        name,
        role: "ZONE_MANAGER",
        pin,
        isActive: true,
      },
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}`;

const newCreateStr = `export async function createZoneStaffMember(input: {
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

  const restaurant = await prisma.restaurant.findUnique({
    where: { id: input.restaurantId },
  });
  
  if (!restaurant || restaurant.zoneId !== input.zoneId) {
    return { success: false, error: "Sucursal inválida." };
  }

  try {
    await prisma.staff.create({
      data: {
        restaurantId: input.restaurantId,
        name,
        role: "ADMIN",
        pin,
        isActive: true,
      },
    });
    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
}`;

if (chainCode.includes('export async function createZoneStaffMember')) {
  // If exact match fails, use substring
  const startIdx = chainCode.indexOf('export async function createZoneStaffMember(input: {');
  let endIdx = chainCode.indexOf('export async function createRestaurantInChain');
  if (endIdx === -1) {
    // try to find the next function or end of file
    endIdx = chainCode.indexOf('export async', startIdx + 10);
    if (endIdx === -1) endIdx = chainCode.length;
  }
  
  const toReplace = chainCode.substring(startIdx, endIdx);
  chainCode = chainCode.replace(toReplace, newCreateStr + '\n\n');
}

fs.writeFileSync('src/actions/chain.ts', chainCode);


// 2. FIX ZoneStaffPanel.tsx
let panelCode = fs.readFileSync('src/components/chain/ZoneStaffPanel.tsx', 'utf-8');

// remove duplicate useState
panelCode = panelCode.replace(/const \[restaurantId, setRestaurantId\] = useState\(""\);\n\s*const \[restaurantId, setRestaurantId\] = useState\(""\);/, 'const [restaurantId, setRestaurantId] = useState("");');
panelCode = panelCode.replace(/const \[pin, setPin\] = useState\(""\);\s*const \[restaurantId, setRestaurantId\] = useState\(""\);\s*const \[restaurantId, setRestaurantId\] = useState\(""\);/, `const [pin, setPin] = useState("");
  const [restaurantId, setRestaurantId] = useState("");`);

fs.writeFileSync('src/components/chain/ZoneStaffPanel.tsx', panelCode);

