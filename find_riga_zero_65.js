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
      // exact match for num_scheda to avoid matching num_scheda_ult_ex
      if (key.replace(/^\uFEFF/, '').replace(/^"/, '').replace(/"$/, '') === 'num_scheda') numScheda = riga[key];
    }
    if (idCliente === athlete && numScheda === selectedSheet) {
      if (parseInt(riga.num_riga_giorno) === 0) {
        console.log(`TROVATO RIGA 0 PER SCHEDA 65:`, riga.des_esercizio);
      }
    }
  })
  .on('end', () => {
    console.log("Fine ricerca.");
    process.exit(0);
  });
