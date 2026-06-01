const fs = require('fs');
const csv = require('csv-parser');

const athlete = '1';
const selectedSheet = '65';

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    let idCliente = null;
    let numScheda = null;
    for (const key of Object.keys(riga)) {
      if (key.includes('ID_cliente')) idCliente = riga[key];
      if (key.includes('num_scheda')) numScheda = riga[key];
    }
    if (idCliente === athlete && numScheda === selectedSheet) {
      console.log(`Esercizio: "${riga.des_esercizio}", RigaGiorno: "${riga.num_riga_giorno}"`);
    }
  })
  .on('end', () => {
    process.exit(0);
  });
