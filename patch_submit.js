const fs = require('fs');
let c = fs.readFileSync('src/actions/comensal.ts', 'utf8');

c = c.replace('if (!table) throw new Error("Mesa no encontrada: " + tableCode);', 'if (!table) throw new Error("Mesa no encontrada: " + tableCode);\n  if (table.status === "SUCIA") throw new Error("La mesa esta siendo limpiada, pide al personal que la habilite.");');

fs.writeFileSync('src/actions/comensal.ts', c);
