const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/actions/reports.ts');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /\{ label: "Ventas totales", value: \`\$\$\{totalVentas.toFixed\(2\)\}\` \},/,
  `{ label: "Ventas totales", value: \`$$\{totalVentas.toFixed(2)}\`, change: "--", up: true },`
);
content = content.replace(
  /\{ label: "Ticket promedio", value: \`\$\$\{ticketPromedio.toFixed\(2\)\}\` \},/,
  `{ label: "Ticket promedio", value: \`$$\{ticketPromedio.toFixed(2)}\`, change: "--", up: true },`
);
content = content.replace(
  /\{ label: "Mesas atendidas", value: \`\$\{mesasAtendidas\}\` \},/,
  `{ label: "Mesas atendidas", value: \`\$\{mesasAtendidas\}\`, change: "--", up: true },`
);
content = content.replace(
  /\{ label: "Platos vendidos", value: \`\$\{totalPlatos\}\` \}/,
  `{ label: "Platos vendidos", value: \`\$\{totalPlatos\}\`, change: "--", up: true }`
);

fs.writeFileSync(file, content);
