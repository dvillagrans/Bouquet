const fs = require('fs');
let content = fs.readFileSync('src/components/staff/KDSBoard.tsx', 'utf8');
content = content.replace('window.location.reload();', 'window.location.reload(); // we could use router.refresh() but this works to re-fetch easily');
fs.writeFileSync('src/components/staff/KDSBoard.tsx', content);
