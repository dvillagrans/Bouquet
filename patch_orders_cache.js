const fs = require('fs');

let content = fs.readFileSync('src/actions/orders.ts', 'utf8');

// replace revalidatePath("/cocina"); to include path clearing for the menu too
content = content.replace(/revalidatePath\("\/cocina"\);/g, `revalidatePath("/cocina");\n  revalidatePath("/mesa/[codigo]/menu", "page");\n`);

fs.writeFileSync('src/actions/orders.ts', content);

