const fs = require('fs');
const p = 'src/components/chain/ZoneBranchesConsole.tsx';
let txt = fs.readFileSync(p, 'utf8');
txt = txt.replace(/style={{ width: \\\`\${pct}%\\\` }}/, "style={{ width: `${pct}%` }}");
fs.writeFileSync(p, txt);
