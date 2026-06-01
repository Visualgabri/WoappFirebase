const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    if (parseInt(riga.num_riga_giorno) === 0) {
      let idCliente = null;
      let numScheda = null;
      for (const key of Object.keys(riga)) {
        if (key.includes('ID_cliente')) idCliente = riga[key];
        if (key.includes('num_scheda')) numScheda = riga[key];
      }
      console.log(`RIGA ZERO: ID_cliente="${idCliente}", num_scheda="${numScheda}", des_giorno="${riga.des_giorno}", des_esercizio="${riga.des_esercizio}"`);
    }
  })
  .on('end', () => {
    process.exit(0);
  });
