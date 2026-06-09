const fs = require('fs');

const data = JSON.parse(fs.readFileSync('firestore_client1_sheet66.json', 'utf8'));

const groups = {};
data.forEach(item => {
  const g = (item.des_giorno || 'UNKNOWN').trim().toUpperCase();
  if (!groups[g]) groups[g] = [];
  groups[g].push(item);
});

Object.keys(groups).sort().forEach(g => {
  console.log(`\n=== GIORNO ${g} ===`);
  const sorted = groups[g].sort((a,b) => (parseInt(a.num_riga_giorno) || 0) - (parseInt(b.num_riga_giorno) || 0));
  sorted.forEach(item => {
    console.log(`RigaGiorno: ${item.num_riga_giorno} (riga: ${item.num_riga}) - Ex: "${item.des_esercizio}" - Superset: "${item.alf_superserie || ''}" - DocID: ${item.id}`);
  });
});
