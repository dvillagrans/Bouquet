const fs = require('fs');
let txt = fs.readFileSync('src/components/chain/ZoneStaffPanel.tsx', 'utf8');

// Hay secuencias como \\\`\${900 + (restIdx * 150)}ms\\\` porque bash escapó el heredoc feamente
txt = txt.replace(/\\\`\\\$\\{900 \+ \\(restIdx \* 150\\)\\}ms\\\`/g, '`${900 + (restIdx * 150)}ms`');

// Replace classes with \\ inside
txt = txt.replace(/\\`/g, '`');
txt = txt.replace(/\\\$/g, '$');

fs.writeFileSync('src/components/chain/ZoneStaffPanel.tsx', txt);
