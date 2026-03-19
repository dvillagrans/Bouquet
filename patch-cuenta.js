const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/app/mesa/[codigo]/cuenta/page.tsx');
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  'import { SplitBillScreen } from "@/components/guest/SplitBillScreen";',
  'import { SplitBillScreen } from "@/components/guest/SplitBillScreen";\nimport { getTableBill } from "@/actions/comensal";'
);

content = content.replace(
  'const partySize = Math.max(1, Math.min(20, Number(pax) || 2));',
  'const partySize = Math.max(1, Math.min(20, Number(pax) || 2));\n\n  const bill = await getTableBill(tableCode);'
);

content = content.replace(
  '<SplitBillScreen tableCode={tableCode} guestName={guestName} partySize={partySize} />',
  '<SplitBillScreen tableCode={tableCode} guestName={guestName} partySize={partySize} initialBill={bill} />'
);

fs.writeFileSync(file, content);
