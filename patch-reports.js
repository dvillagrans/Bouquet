const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/dashboard/ReportsView.tsx');
let content = fs.readFileSync(file, 'utf8');

// The original signature is `export default function ReportsView() {`
content = content.replace(
  /export default function ReportsView\(\) \{/,
  `export default function ReportsView({ reportData }: { reportData: import("@/actions/reports").DashboardReportData }) {`
);

// Delete the STATS_BY_PERIOD and TOP_ITEMS_BY_PERIOD from the component file since we get it from props
content = content.replace(/const STATS_BY_PERIOD[\s\S]*?(?=export default function ReportsView)/g, '');

// Update variable access inside the component
content = content.replace(/const stats = STATS_BY_PERIOD\[period\];/g, 'const stats = reportData.stats[period];');
content = content.replace(/const topItems = TOP_ITEMS_BY_PERIOD\[period\];/g, 'const topItems = reportData.topItems[period];');

fs.writeFileSync(file, content);
