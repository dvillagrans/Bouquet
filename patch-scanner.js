const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, 'src/components/guest/ScannerScreen.tsx');
let content = fs.readFileSync(file, 'utf8');

// replace handleScan declaration
content = content.replace(
  /function handleScan\(decodedText: string\) \{[\s\S]*?\} catch \{[\s\S]*?\}[\s\S]*?\}/,
  ""
);

content = content.replace(
  /useEffect\(\(\) => \{/,
  `useEffect(() => {
    function handleScan(decodedText: string) {
      if (!isScanning) return;
      setIsScanning(false);
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
      
      try {
        let tableCode = decodedText;
        if (decodedText.includes('/mesa/')) {
           const url = new URL(decodedText);
           const parts = url.pathname.split('/');
           tableCode = parts[parts.length - 1];
        }
        
        router.push(\`/mesa/\${tableCode}\`);
      } catch {
        router.push(\`/mesa/\${decodedText}\`);
      }
    }
`
);

content = content.replace(/catch \(err: any\)/, 'catch (err: unknown)');
content = content.replace(/\(errorMessage\) => \{/, '() => {');
content = content.replace(/err\.message \|\|/, '(err as Error).message ||');

fs.writeFileSync(file, content);
