const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/dashboard/ReportsView.tsx');
let content = fs.readFileSync(file, 'utf8');

// Use this to dynamically calculate changes if we want, but for now we just map the hardcoded stats with server data
content = content.replace(
  /export default function ReportsView\(\) \{/,
  `export default function ReportsView({ reportData }: { reportData?: import("@/actions/reports").DashboardReportData }) {`
);

let replaceStats = `const stats     = reportData ? reportData.stats[period] : STATS_BY_PERIOD[period];`;
let replaceTop = `const topItems  = reportData ? reportData.topItems[period] : TOP_ITEMS_BY_PERIOD[period];`;

content = content.replace(/const stats     = STATS_BY_PERIOD\[period\];/g, replaceStats);
content = content.replace(/const topItems  = TOP_ITEMS_BY_PERIOD\[period\];/g, replaceTop);

fs.writeFileSync(file, content);
