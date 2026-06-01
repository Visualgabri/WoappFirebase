const fs = require('fs');

const data = JSON.parse(fs.readFileSync('WoappWeb/public/storyboard_backup.json', 'utf8'));

const filtrati = data.filter(
  item => String(item.ID_cliente) === '1' && String(item.num_scheda) === '66'
);

console.log(`Trovati ${filtrati.length} record in totale per scheda 66 nel backup JSON!`);

const rigaZero = filtrati.filter(item => parseInt(item.num_riga_giorno) === 0);
console.log(`Trovati ${rigaZero.length} record di Riga 0 per scheda 66:`);
rigaZero.forEach(item => {
  console.log(`- Giorno: ${item.des_giorno}, Esercizio: "${item.des_esercizio}", RigaGiorno: "${item.num_riga_giorno}"`);
});

process.exit(0);
