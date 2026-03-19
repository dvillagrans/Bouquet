const fs = require('fs');
let c = fs.readFileSync('src/components/staff/KDSBoard.tsx', 'utf8');
c = c.replace(/const router = useRouter\(\);\n\s+const router = useRouter\(\);/, 'const router = useRouter();');
fs.writeFileSync('src/components/staff/KDSBoard.tsx', c);
