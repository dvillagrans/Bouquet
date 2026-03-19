const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/staff/KDSBoard.tsx');
let content = fs.readFileSync(file, 'utf8');

// Replace exports default function KDSBoard({ ... })
content = content.replace(
  /export default function KDSBoard\(\{\n  initialOrders,\n\}: \{\n  initialOrders: Order\[\];\n\}\) \{/, 
  `export default function KDSBoard({
  initialOrders,
  station = "COCINA"
}: {
  initialOrders: Order[];
  station?: "COCINA" | "BARRA";
}) {`
);

// Now look for `items.map` and filter them by station
content = content.replace(
    /\{order\.items\.map\(item => \(/g,
    `{order.items.filter(i => i.station.toUpperCase() === station).map(item => (`
);

// We should also change the title.
content = content.replace(
    /<h1 className="text-xl font-bold uppercase tracking-\[0.2em\] text-light">\s*Kitchen Display System\s*<\/h1>/,
    `<h1 className="text-xl font-bold uppercase tracking-[0.2em] text-light">
            {station === "COCINA" ? "Kitchen Display System" : "Barra Display System"}
          </h1>`
);

content = content.replace(
    /<p className="mt-2 text-\[0.7rem\] font-medium uppercase tracking-\[0.1em\] text-dim">\s*Cocina • Tickets activos\s*<\/p>/,
    `<p className="mt-2 text-[0.7rem] font-medium uppercase tracking-[0.1em] text-dim">
            {station === "COCINA" ? "Cocina" : "Barra"} • Tickets activos
          </p>`
);


fs.writeFileSync(file, content);
