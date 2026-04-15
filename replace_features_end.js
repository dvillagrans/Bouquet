const fs = require('fs');
const filePath = '/home/dvillagrans/Documentos/TT/bouquet/src/components/landing/Features.tsx';
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace('      </div></div>\n    </div>\n  </section>\n);', '      </div>\n    </div>\n  </section>\n);');

fs.writeFileSync(filePath, content);
