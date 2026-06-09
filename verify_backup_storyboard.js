const fs = require('fs');

console.log("=== Verification of storyboard_backup.json ===");
const data = JSON.parse(fs.readFileSync('WoappWeb/public/storyboard_backup.json', 'utf8'));
console.log(`Total records in storyboard_backup.json: ${data.length}`);

// Use exact keys!
const client1Sheet66 = data.filter(item => {
  return String(item['ID_cliente'] || '').trim() === '1' && String(item['num_scheda'] || '').trim() === '66';
});

console.log(`Found ${client1Sheet66.length} records for client 1, sheet 66 in backup JSON.`);

if (client1Sheet66.length > 0) {
  const groups = {};
  client1Sheet66.forEach(item => {
    const g = (item.des_giorno || 'UNKNOWN').trim().toUpperCase();
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  });
  
  Object.keys(groups).sort().forEach(g => {
    console.log(`\n=== GIORNO ${g} ===`);
    const sorted = groups[g].sort((a,b) => (parseInt(a.num_riga_giorno)||0) - (parseInt(b.num_riga_giorno)||0));
    sorted.forEach(item => {
      console.log(`RigaGiorno: ${item.num_riga_giorno} (riga: ${item.num_riga}) - Ex: "${item.des_esercizio}" - ins_week1: "${item.ins_week1 || ''}" - ins_week2: "${item.ins_week2 || ''}" - ins_week3: "${item.ins_week3 || ''}"`);
    });
  });
}
process.exit(0);
