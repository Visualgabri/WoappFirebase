const fs = require('fs');

console.log("Reading storyboard_backup.json...");
const data = JSON.parse(fs.readFileSync('WoappWeb/public/storyboard_backup.json', 'utf8'));
console.log(`Loaded ${data.length} records from backup.`);

const targetIdCliente = '1';
const targetNumScheda = '66';

const results = [];
const uniqueSchede = new Set();

data.forEach(row => {
  let idCliente = null;
  let numScheda = null;
  
  for (const key of Object.keys(row)) {
    if (key.includes('ID_cliente')) {
      idCliente = String(row[key]);
    }
    if (key.includes('num_scheda')) {
      numScheda = String(row[key]);
    }
  }
  
  if (idCliente === targetIdCliente) {
    uniqueSchede.add(numScheda);
    if (numScheda === targetNumScheda) {
      results.push(row);
    }
  }
});

console.log(`Unique schede for client ${targetIdCliente} in backup:`, Array.from(uniqueSchede).sort((a,b) => parseInt(a)-parseInt(b)).join(', '));
console.log(`Found ${results.length} records in backup for client ${targetIdCliente}, sheet ${targetNumScheda}`);

if (results.length > 0) {
  // Group by day and sort by num_riga_giorno
  const groups = {};
  results.forEach(item => {
    const g = (item.des_giorno || 'UNKNOWN').trim().toUpperCase();
    if (!groups[g]) groups[g] = [];
    groups[g].push(item);
  });
  
  Object.keys(groups).sort().forEach(g => {
    console.log(`\n=== GIORNO ${g} ===`);
    const sorted = groups[g].sort((a,b) => (parseInt(a.num_riga_giorno) || 0) - (parseInt(b.num_riga_giorno) || 0));
    sorted.forEach(item => {
      console.log(`RigaGiorno: ${item.num_riga_giorno} (riga: ${item.num_riga}) - Ex: "${item.des_esercizio}" - Superset: "${item.alf_superserie || ''}"`);
    });
  });
}
process.exit(0);
