const fs = require('fs');
let c = fs.readFileSync('src/components/guest/MenuScreen.tsx', 'utf8');

if (!c.includes('Pedir la cuenta')) {
  let btn = `        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 sm:px-8 lg:px-12">
          {/* Logo & Info */}
          <div className="flex items-center gap-3">
            <span className="font-serif text-[1.2rem] font-semibold italic tracking-tight text-light">bouquet</span>
            <div className="h-3.5 w-px bg-wire/60" />
            <span className="text-[0.62rem] font-bold uppercase tracking-[0.2em] text-dim">{tableCode} · {guestName}</span>
          </div>

          <div className="flex items-center gap-3">
            <Link href={\`/mesa/\${encodeURIComponent(tableCode)}/cuenta\`} className="hidden sm:inline-flex px-4 py-2 border border-wire text-[0.65rem] font-bold uppercase tracking-widest text-dim hover:text-light transition-colors">
              Pedir Cuenta
            </Link>
`;
  
  c = c.replace(/<div className="mx-auto flex max-w-2xl items-center justify-between px-4 sm:px-8 lg:px-12">\s+{\/\* Logo & Info \*\/}\s+<div className="flex items-center gap-3">\s+<span className="font-serif text-\[1.2rem\] font-semibold italic tracking-tight text-light">bouquet<\/span>\s+<div className="h-3.5 w-px bg-wire\/60" \/>\s+<span className="text-\[0.62rem\] font-bold uppercase tracking-\[0.2em\] text-dim">{tableCode} · {guestName}<\/span>\s+<\/div>/, btn);

  // Add mobile button near the bottom of drawer toggle
  c = c.replace(/\{cartCount > 0 && \(\s+<div className="absolute /g, `<Link href={\`/mesa/\${encodeURIComponent(tableCode)}/cuenta\`} className="sm:hidden flex items-center justify-center h-12 px-5 ml-4 bg-transparent border border-wire text-[0.65rem] font-bold uppercase tracking-widest text-dim rounded-none">Cuenta</Link>\n            {cartCount > 0 && (\n              <div className="absolute `);

}
fs.writeFileSync('src/components/guest/MenuScreen.tsx', c);
