const fs = require('fs');
const path = require('path');

const file = path.join(__dirname, 'src/components/guest/SplitBillScreen.tsx');
let content = fs.readFileSync(file, 'utf8');

// Remove MOCK_BILL
content = content.replace(/\/\/ ─── Mock bill [\s\S]*?const SUBTOTAL =.*?;.*?\n/, '');

// Update SplitBillScreenProps
content = content.replace(
  'interface SplitBillScreenProps {\n  tableCode: string;\n  guestName: string;\n  partySize: number;\n}',
  `interface BillItem {
  id: string;
  name: string;
  qty: number;
  price: number;
}

interface SplitBillScreenProps {
  tableCode: string;
  guestName: string;
  partySize: number;
  initialBill: {
    items: BillItem[];
    total: number;
  };
}`
);

// Update Component signature and usage
content = content.replace(
  'export function SplitBillScreen({ tableCode, guestName, partySize }: SplitBillScreenProps) {',
  'export function SplitBillScreen({ tableCode, guestName, partySize, initialBill }: SplitBillScreenProps) {\n  const billItems = initialBill.items;\n  const subtotal = initialBill.total;'
);

content = content.replace(/SUBTOTAL/g, 'subtotal');
content = content.replace(/BILL_ITEMS/g, 'billItems');

fs.writeFileSync(file, content);
