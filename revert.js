const fs = require('fs');
let comp = fs.readFileSync('src/components/guest/TableAccessScreen.tsx', 'utf8');
comp = comp.replace('</div>\n            </div>\n\n            {/* Actions */}', '</div>\n\n            {/* Actions */}');
comp = comp.replace('</div>\n\n            {/* Actions */}', '</div>\n            </div>\n\n            {/* Actions */}');
fs.writeFileSync('src/components/guest/TableAccessScreen.tsx', comp);
