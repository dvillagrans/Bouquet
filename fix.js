const fs = require('fs');
let c = fs.readFileSync('src/components/guest/SplitBillScreen.tsx', 'utf8');

c = c.replace(/const \[isPending, startTransition\] = useTransition\(\);\s+function handlePay\(\) {\s+startTransition\(async \(\) => {\s+try {\s+await requestBillAndPay\(tableCode\);\s+setConfirmed\(true\);\s+} catch \(err\) {\s+console.error\(err\);\s+alert\("Ocurrio un error al registrar el pago."\);\s+}\s+}\);\s+}\s+/g, '');

c = c.replace('const [confirmed, setConfirmed]   = useState(false);', 'const [confirmed, setConfirmed]   = useState(false);\n  const [isPending, startTransition] = useTransition();\n\n  function handlePay() {\n    startTransition(async () => {\n      try {\n        await requestBillAndPay(tableCode);\n        setConfirmed(true);\n      } catch (err) {\n        console.error(err);\n        alert("Ocurrio un error al registrar el pago.");\n      }\n    });\n  }');

fs.writeFileSync('src/components/guest/SplitBillScreen.tsx', c);
