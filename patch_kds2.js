const fs = require('fs');
let content = fs.readFileSync('src/components/staff/KDSBoard.tsx', 'utf8');

if (!content.includes('useRouter')) {
  content = content.replace('useEffect } from "react";', 'useEffect } from "react";\nimport { useRouter } from "next/navigation";');
}

content = content.replace('const [orders, setOrders]           = useState<Order[]>(initialOrders);', 'const router = useRouter();\n  const [orders, setOrders]           = useState<Order[]>(initialOrders);\n  useEffect(() => setOrders(initialOrders), [initialOrders]);');

content = content.replace('window.location.reload(); // we could use router.refresh() but this works to re-fetch easily', 'setTimeout(() => router.refresh(), 500);');

fs.writeFileSync('src/components/staff/KDSBoard.tsx', content);
