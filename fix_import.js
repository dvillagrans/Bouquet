const fs = require('fs');

let content = fs.readFileSync('src/components/staff/KDSBoard.tsx', 'utf8');
content = content.replace(
  'import { advanceOrderStatus, undoOrderStatus, moveOrderToStatus } from "@/actions/orders";',
  'import { advanceOrderStatus, undoOrderStatus, moveOrderToStatus, getLiveOrders } from "@/actions/orders";'
);
fs.writeFileSync('src/components/staff/KDSBoard.tsx', content);

