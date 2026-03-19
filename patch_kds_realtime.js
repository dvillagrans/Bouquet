const fs = require('fs');

let content = fs.readFileSync('src/components/staff/KDSBoard.tsx', 'utf8');

// replace router.refresh with a direct fetch
content = content.replace(
  'import { advanceOrderStatus, undoOrderStatus } from "@/actions/orders";',
  'import { advanceOrderStatus, undoOrderStatus, getLiveOrders } from "@/actions/orders";'
);

content = content.replace(
  /\.on\("postgres_changes", \{ event: "\*", schema: "public", table: "Order" \}, \(\) => \{\s*setTimeout\(\(\) => router\.refresh\(\), 500\);\s*\}\)/g,
  `.on("postgres_changes", { event: "*", schema: "public", table: "Order" }, async () => {
        try {
          const freshOrders = await getLiveOrders();
          setOrders(freshOrders);
        } catch(e) {
          console.error(e);
        }
      })`
);

fs.writeFileSync('src/components/staff/KDSBoard.tsx', content);

