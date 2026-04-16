const fs = require('fs');

let content = fs.readFileSync('src/actions/restaurant.ts', 'utf8');

content = content.replace(
  `const staffCount = await prisma.session.count({ where: { restaurantId: restaurant.id, endedAt: null } });`,
  `const staffCount = await prisma.staff.count({ where: { restaurantId: restaurant.id, isActive: true } });`
);

content = content.replace(
  `status: 'COMPLETED'`,
  `status: 'PAID'`
);

fs.writeFileSync('src/actions/restaurant.ts', content);
