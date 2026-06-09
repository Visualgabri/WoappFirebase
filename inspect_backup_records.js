const fs = require('fs');
const backup = JSON.parse(fs.readFileSync('WoappWeb/public/storyboard_backup.json', 'utf8'));

const r1 = backup.find(item => String(item.num_riga) === '62756');
const r2 = backup.find(item => String(item.num_riga) === '62782');

console.log("Record 62756 in backup:", JSON.stringify(r1, null, 2));
console.log("Record 62782 in backup:", JSON.stringify(r2, null, 2));
process.exit(0);
