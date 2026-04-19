const fs = require('fs');

let code = fs.readFileSync('src/components/staff/KDSBoard.tsx', 'utf-8');

// Fix 1: Type & props
// export default function KDSBoard({ initialOrders }: { initialOrders: Order[] }) {
code = code.replace(
  /export default function KDSBoard\({ initialOrders }: { initialOrders: Order\[\] }\) {/,
  `export default function KDSBoard({ initialOrders, defaultStation }: { initialOrders: Order[], defaultStation?: string }) {`
);

// Fix 2: undoOrderStatus parameters
code = code.replace(/await undoOrderStatus\(o\.id\);/g, `await undoOrderStatus(o.id, "delivered");`);

// Fix 3: dangerouslySetInnerHTML
code = code.replace(/dangerouslySetInline/g, `dangerouslySetInnerHTML`);

fs.writeFileSync('src/components/staff/KDSBoard.tsx', code);
