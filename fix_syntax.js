const fs = require('fs');
const filePath = 'src/components/chain/ZoneStaffPanel.tsx';
let txt = fs.readFileSync(filePath, 'utf8');

// The regex approach didn't stick perfectly in node heredoc with the triple backslashes last time. 
// We will replace exactly the buggy line.
txt = txt.replace(
  /style={{ animationFillMode: "both", animationDelay: \\\`\\\${900 \+ \(restIdx \* 150\)}ms\\\` }}/,
  'style={{ animationFillMode: "both", animationDelay: `${900 + (restIdx * 150)}ms` }}'
);

fs.writeFileSync(filePath, txt);
