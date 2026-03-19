const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/staff/KDSBoard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace standard header with props
content = content.replace(
  /export default function KDSBoard\(\{ initialOrders \}: \{ initialOrders: Order\[\] \}\) \{/,
  `export default function KDSBoard({ initialOrders, defaultStation = "todas" }: { initialOrders: Order[], defaultStation?: "todas" | "cocina" | "barra" }) {`
);

fs.writeFileSync(file, content);
