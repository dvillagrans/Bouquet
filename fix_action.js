const fs = require('fs');
let txt = fs.readFileSync('src/components/chain/ZoneStaffPanel.tsx', 'utf8');

// The function takes an object: { staffId: uid, isActive: act }
txt = txt.replace(/await setRestaurantAdminActive\(uid\);/, "await setRestaurantAdminActive({ staffId: uid, isActive: act });");

fs.writeFileSync('src/components/chain/ZoneStaffPanel.tsx', txt);
