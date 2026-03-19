const fs = require('fs');

let content = fs.readFileSync('src/components/guest/SplitBillScreen.tsx', 'utf8');

// Add import
if (!content.includes('import { requestBillAndPay }')) {
  content = content.replace('import { useState } from "react";', 'import { useState, useTransition } from "react";\nimport { requestBillAndPay } from "@/actions/comensal";');
}

// Add state and replace logic
content = content.replace('  const [confirmed, setConfirmed]   = useState(false);', '  const [confirmed, setConfirmed]   = useState(false);\n  const [isPending, startTransition] = useTransition();\n\n  function handlePay() {\n    startTransition(async () => {\n      try {\n        await requestBillAndPay(tableCode);\n        setConfirmed(true);\n      } catch (err) {\n        console.error(err);\n        alert("Ocurrio un error al registrar el pago.");\n      }\n    });\n  }');

content = content.replace('onClick={() => setConfirmed(true)}', 'onClick={handlePay} disabled={isPending}'); // wait I need to find where the confirm button is!

fs.writeFileSync('src/components/guest/SplitBillScreen.tsx', content);
