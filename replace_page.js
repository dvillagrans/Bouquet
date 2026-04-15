const fs = require("fs");
const file = "src/app/page.tsx";
let content = fs.readFileSync(file, 'utf8');
content = content.replace(/className="min-h-screen[^"]+"/g, 'className="min-h-screen bg-white font-sans text-black selection:bg-blue-500/25 selection:text-black"');
fs.writeFileSync(file, content);
console.log("page.tsx fixed");
