const fs = require('fs');

const data = JSON.parse(fs.readFileSync('WoappWeb/public/storyboard_backup.json', 'utf8'));

const filtrati = data.filter(
  item => String(item.ID_cliente) === '1' && String(item.num_scheda) === '65' && parseInt(item.num_riga_giorno) === 0
);

console.log(`Trovati ${filtrati.length} record di Riga 0 per scheda 65 nel backup JSON!`);
filtrati.forEach(item => {
  console.log(`- Giorno: ${item.des_giorno}, Esercizio: "${item.des_esercizio}", RigaGiorno: "${item.num_riga_giorno}"`);
});

process.exit(0);
