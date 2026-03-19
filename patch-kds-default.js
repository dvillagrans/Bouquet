const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/staff/KDSBoard.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /export default function KDSBoard\(\{\n  initialOrders,\n\}: \{\n  initialOrders: Order\[\];\n\}\) \{/, 
  `export default function KDSBoard({
  initialOrders,
  defaultStation = "todas"
}: {
  initialOrders: Order[];
  defaultStation?: "todas" | "cocina" | "barra";
}) {`
);

content = content.replace(
  /const \[station, setStation\]         = useState<StationFilter>\("todas"\);/,
  `const [station, setStation]         = useState<StationFilter>(defaultStation);`
);

fs.writeFileSync(file, content);
