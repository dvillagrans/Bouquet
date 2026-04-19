const fs = require('fs');

let content = fs.readFileSync("src/components/dashboard/ReportsView.tsx", "utf-8");

// 1. Add Activity to imports
content = content.replace(
  /TrendingDown, Minus, BarChart3, Clock, DollarSign, Receipt, ArrowUpRight, Flame, Trophy, Coffee } from "lucide-react";/,
  `TrendingDown, Minus, BarChart3, Clock, DollarSign, Receipt, ArrowUpRight, Flame, Trophy, Coffee, Activity } from "lucide-react";`
);

// 2. Fix StatCard usage
// Old: const isPos = stat.trend > 0;
// New: const isPos = stat.up === true; const trendstr = stat.change
content = content.replace(/const isPos = stat\.trend > 0;/g, 'const isPos = stat.up === true;');
content = content.replace(/const isNeg = stat\.trend < 0;/g, 'const isNeg = stat.up === false;');
content = content.replace(/stat\.title\.toLowerCase/g, 'stat.label.toLowerCase');
content = content.replace(/stat\.title/g, 'stat.label');
content = content.replace(/Math\.abs\(stat\.trend\)/g, 'stat.change.replace("%", "")');

content = content.replace(
  /\{stat\.title\.includes\("Ingreso"\) \|\| stat\.title\.includes\("Ticket"\) \? fmtK\(stat\.value as number\) : stat\.value\}/,
  `{stat.value}` // Because stat.value is already a formatted string according to the type '{ ... value: string }'
);

// 3. Fix topItems usage
content = content.replace(/item\.qty/g, 'item.sold');
content = content.replace(/fmtK\(item\.revenue\)/, 'item.revenue');

fs.writeFileSync("src/components/dashboard/ReportsView.tsx", content);
