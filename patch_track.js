const fs = require('fs');

// ==== 1. Update Server Actions to fetch existing orders ====
let actions = fs.readFileSync('src/actions/comensal.ts', 'utf8');

if (!actions.includes('getGuestOrders')) {
  actions += `
export async function getGuestOrders(tableCode: string) {
  const table = await prisma.table.findUnique({ where: { qrCode: tableCode } });
  if (!table) return [];

  const session = await prisma.session.findFirst({
    where: { tableId: table.id, isActive: true },
    orderBy: { createdAt: "desc" }
  });

  if (!session) return [];

  const orders = await prisma.order.findMany({
    where: { sessionId: session.id },
    include: {
      items: {
        include: { menuItem: true }
      }
    },
    orderBy: { createdAt: "asc" }
  });

  return orders;
}
`;
  fs.writeFileSync('src/actions/comensal.ts', actions);
}

// ==== 2. Pass orders to MenuScreen ====
let page = fs.readFileSync('src/app/mesa/[codigo]/menu/page.tsx', 'utf8');

if (!page.includes('getGuestOrders')) {
  page = page.replace('import { getMenuData } from "@/actions/menu";', 'import { getMenuData } from "@/actions/menu";\nimport { getGuestOrders } from "@/actions/comensal";');
  
  page = page.replace('const { categories, items } = await getMenuData();', 'const { categories, items } = await getMenuData();\n  const initialOrders = await getGuestOrders(tableCode);');

  page = page.replace('initialItems={items} />', 'initialItems={items}\n        initialOrders={initialOrders}\n      />');

  fs.writeFileSync('src/app/mesa/[codigo]/menu/page.tsx', page);
}
