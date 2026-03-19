const fs = require('fs');

let content = fs.readFileSync('src/components/guest/MenuScreen.tsx', 'utf8');

// replace the useEffect doing router.refresh() with one that calls getGuestOrders directly

content = content.replace(
  'import { submitComensalOrder } from "@/actions/comensal";',
  'import { submitComensalOrder, getGuestOrders } from "@/actions/comensal";'
);

content = content.replace(
  /useEffect\(\(\) => \{\s*const supabase = createClient\(\);\s*const channel = supabase\.channel\("table_orders"\)\s*\.on\("postgres_changes", \{ event: "\*", schema: "public", table: "Order" \}, \(\) => \{\s*\/\/[^\n]*\n\s*router\.refresh\(\);\s*\/\/[^\n]*\n\s*\}\)\s*\.subscribe\(\);\s*return \(\) => \{ supabase\.removeChannel\(channel\); \};\s*\}, \[router\]\);/g,
  `useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("table_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "Order" }, async () => {
         // Opcion robusta: fetchear directamente con una server action para evitar el Router Cache de Next.js
         try {
           const freshOrders = await getGuestOrders(tableCode);
           setOrders(freshOrders);
         } catch(err) {
           console.error("Error al refrescar ordenes", err);
         }
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [tableCode]);`
);

fs.writeFileSync('src/components/guest/MenuScreen.tsx', content);

