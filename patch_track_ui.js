const fs = require('fs');

let content = fs.readFileSync('src/components/guest/MenuScreen.tsx', 'utf8');

// Ensure realtime updates
if (!content.includes('import { createClient }')) {
  content = content.replace('import { submitComensalOrder } from "@/actions/comensal";', 'import { submitComensalOrder } from "@/actions/comensal";\nimport { createClient } from "@/lib/supabase/client";\nimport { useEffect } from "react";');
}

// 1. Update Props
content = content.replace('initialItems: MenuItem[];\n}', 'initialItems: MenuItem[];\n  initialOrders?: any[];\n}');
content = content.replace('initialCategories, initialItems }: MenuScreenProps) {', 'initialCategories, initialItems, initialOrders = [] }: MenuScreenProps) {');

// 2. Add Live State for orders
let stateHook = `  const router = useRouter();
  const [cart, setCart]               = useState<CartMap>({});
  const [orders, setOrders]           = useState(initialOrders);

  // Escuchar si sus ordenes cambian de estatus
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase.channel("table_orders")
      .on("postgres_changes", { event: "*", schema: "public", table: "Order" }, () => {
         // Opcion sencilla: refrescar servidor usando router
         router.refresh();
         // El layout de next rehidrata initialOrders magicamente
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [router]);
  
  // Sincronizar initialOrders si cambia el prop
  useEffect(() => setOrders(initialOrders), [initialOrders]);
`;
content = content.replace(/const router = useRouter\(\);\n  const \[cart, setCart\].*?\n/, stateHook);

// 3. Render tracking block at the top of the menu body
let trackingUI = `      
      {/* TRACING DE ORDENES ACTIVAS */}
      {orders && orders.length > 0 && (
        <div className="px-4 sm:px-8 lg:px-12 mb-8 max-w-2xl mx-auto">
          <h3 className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim mb-4">Estado de tus órdenes</h3>
          <div className="flex flex-col gap-3">
            {orders.map(o => (
              <div key={o.id} className="border border-wire p-4 rounded-none flex items-center justify-between">
                <div>
                  <p className="text-[0.75rem] text-light">Orden #{o.id.slice(-4)}</p>
                  <p className="text-[0.6rem] text-dim">{o.items.length} items</p>
                </div>
                <div>
                  {o.status === 'PENDING' && <span className="text-[0.6rem] font-bold tracking-widest text-dim border border-wire px-2 py-1">EN ESPERA</span>}
                  {o.status === 'PREPARING' && <span className="text-[0.6rem] font-bold tracking-widest text-glow border border-glow/30 bg-glow/5 px-2 py-1">PREPARANDO</span>}
                  {o.status === 'READY' && <span className="text-[0.6rem] font-bold tracking-widest text-green-400 border border-green-500/30 bg-green-500/5 px-2 py-1">LISTA</span>}
                  {o.status === 'DELIVERED' && <span className="text-[0.6rem] font-bold tracking-widest text-sage-deep border border-sage-deep/30 px-2 py-1">ENTREGADA</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Categories */}
`;

content = content.replace('{/* Categories */}', trackingUI);

fs.writeFileSync('src/components/guest/MenuScreen.tsx', content);

