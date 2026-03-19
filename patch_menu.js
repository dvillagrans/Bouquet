const fs = require('fs');

let content = fs.readFileSync('src/components/guest/MenuScreen.tsx', 'utf8');

// Replace the router.push to the bill with a local state reset and success message
let handleCheckout = `  function handleCheckout() {
    startTransition(async () => {
      try {
        const orderItems = Object.entries(cart).map(([id, qty]) => ({
          menuItemId: id,
          quantity: qty,
        }));
        
        await submitComensalOrder({
          tableCode,
          guestName,
          pax: partySize,
          items: orderItems,
        });

        // En lugar de ir a pagar, vaciamos carrito, cerramos cajon y avisamos que se mando a la cocina
        setCart({});
        setDrawerOpen(false);
        setOrderSuccess(true);
        setTimeout(() => setOrderSuccess(false), 3000);
      } catch (err) {
        console.error("No se pudo enviar la orden", err);
        alert("Ocurrió un error al enviar la orden. Intenta de nuevo.");
      }
    });
  }
`;

content = content.replace(/function handleCheckout\(\) \{[\s\S]*?\}\);[\s]*\}/, handleCheckout);

// Add the success state
if (!content.includes('const [orderSuccess, setOrderSuccess]')) {
  content = content.replace('const [isPending, startTransition]  = useTransition();', 'const [isPending, startTransition]  = useTransition();\n  const [orderSuccess, setOrderSuccess] = useState(false);');
}

// Add the floating success notification in the render function
if (!content.includes('orden enviada a la cocina')) {
  let toInsert = `      {orderSuccess && (
        <div className="fixed inset-x-4 top-4 z-[60] animate-in fade-in slide-in-from-top-4 flex items-center justify-center pointer-events-none">
          <div className="bg-sage-deep text-ink px-6 py-3 rounded-full text-[0.75rem] font-bold uppercase tracking-widest shadow-xl">
            ¡Orden enviada a cocina!
          </div>
        </div>
      )}`;
  
  content = content.replace('<div className="relative flex flex-col pt-16 sm:pt-20">', '<div className="relative flex flex-col pt-16 sm:pt-20">\n' + toInsert);
}


fs.writeFileSync('src/components/guest/MenuScreen.tsx', content);

