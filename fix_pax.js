const fs = require('fs');
let page = fs.readFileSync('src/app/mesa/[codigo]/page.tsx', 'utf8');

// Also check globally if a session is already alive for this table regardless of who it is
page = page.replace(
  'const table = await prisma.table.findUnique({',
  `// Revisamos si la mesa YA tiene una sesion activa
  const existingSessionForTable = await prisma.session.findFirst({
    where: { 
      table: { qrCode: decodedCode }, 
      isActive: true 
    },
    select: { pax: true }
  });

  const table = await prisma.table.findUnique({`
);

page = page.replace(
  'return <TableAccessScreen tableCode={decodedCode} isLikelyValid={!!table && table.status !== "SUCIA"} tableNumber={table?.number} />;',
  'return <TableAccessScreen tableCode={decodedCode} isLikelyValid={!!table && table.status !== "SUCIA"} tableNumber={table?.number} existingPax={existingSessionForTable?.pax} />;'
);

fs.writeFileSync('src/app/mesa/[codigo]/page.tsx', page);

// Update Component
let comp = fs.readFileSync('src/components/guest/TableAccessScreen.tsx', 'utf8');

comp = comp.replace('type TableAccessScreenProps = {', 'type TableAccessScreenProps = {\n  existingPax?: number;');
// find useState(2)
comp = comp.replace('const [partySize, setPartySize] = useState(2);', 'const [partySize, setPartySize] = useState(existingPax || 2);');
// if existingPax is set, hide the input
comp = comp.replace(
  '{/* Party size — escribir número o usar +/− (1–20) */}',
  `{/* Party size — escribir número o usar +/− (1–20) */}
            <div style={{ display: existingPax ? "none" : "block" }}>`
);
comp = comp.replace('</div>\n\n            {/* Actions */}', '</div>\n            </div>\n\n            {/* Actions */}');

fs.writeFileSync('src/components/guest/TableAccessScreen.tsx', comp);

