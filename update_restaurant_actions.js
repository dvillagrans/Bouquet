const fs = require('fs');

let content = fs.readFileSync('src/actions/restaurant.ts', 'utf8');

const newAction = `
export async function getRestaurantOverview() {
  const restaurant = await getDefaultRestaurant();
  
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [tables, staffCount, ordersToday, paymentsToday] = await prisma.$transaction([
    prisma.table.findMany({ where: { restaurantId: restaurant.id } }),
    prisma.waiterSession.count({ where: { restaurantId: restaurant.id, endedAt: null } }),
    prisma.order.findMany({ 
      where: { restaurantId: restaurant.id, createdAt: { gte: startOfDay } },
      select: { status: true }
    }),
    prisma.payment.findMany({
      where: { restaurantId: restaurant.id, status: 'COMPLETED', order: { createdAt: { gte: startOfDay } } }
    })
  ]);

  const activeTables = tables.filter(t => t.status !== 'AVAILABLE').length;
  const preparingOrders = ordersToday.filter(o => o.status === 'PREPARING').length;
  const deliveredOrders = ordersToday.filter(o => o.status === 'DELIVERED').length;
  const pendingOrders = ordersToday.filter(o => o.status === 'PENDING').length;
  
  const todayRevenue = paymentsToday.reduce((a, p) => a + (p.subtotal || 0), 0);
  
  return {
    restaurant,
    metrics: {
      totalTables: tables.length,
      activeTables,
      staffCount,
      todayRevenue,
      totalOrders: ordersToday.length,
      preparingOrders,
      deliveredOrders,
      pendingOrders
    }
  };
}
`;

fs.writeFileSync('src/actions/restaurant.ts', content + newAction);
