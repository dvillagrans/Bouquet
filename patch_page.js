const fs = require('fs');
let content = fs.readFileSync('src/app/mesa/[codigo]/page.tsx', 'utf8');

content = content.replace('isLikelyValid={!!table}', 'isLikelyValid={!!table && table.status !== "SUCIA"}');

fs.writeFileSync('src/app/mesa/[codigo]/page.tsx', content);
