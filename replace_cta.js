const fs = require("fs");
const file = "src/components/landing/CtaBand.tsx";
let content = fs.readFileSync(file, 'utf8');
content = content.replace("Trae Air a tu restaurante hoy.", "Usa Bouquet en tu restaurante hoy.");
fs.writeFileSync(file, content);
console.log("CtaBand fixed");
