const fs = require('fs');
const csv = require('csv-parser');

const athlete = '1';
const sheetsWithRigaZero = new Set();
const sheetsWithoutRigaZero = new Set();
const allSheets = new Set();

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    let idCliente = null;
    let numScheda = null;
    for (const key of Object.keys(riga)) {
      if (key.includes('ID_cliente')) idCliente = riga[key];
      if (key.includes('num_scheda')) numScheda = riga[key];
    }
    if (idCliente === athlete) {
      allSheets.add(numScheda);
      if (parseInt(riga.num_riga_giorno) === 0) {
        sheetsWithRigaZero.add(numScheda);
      }
    }
  })
  .on('end', () => {
    allSheets.forEach(s => {
      if (!sheetsWithRigaZero.has(s)) {
        sheetsWithoutRigaZero.add(s);
      }
    });
    console.log("Schede CON riga 0:", Array.from(sheetsWithRigaZero).sort((a,b) => parseInt(a) - parseInt(b)).join(', '));
    console.log("Schede SENZA riga 0:", Array.from(sheetsWithoutRigaZero).sort((a,b) => parseInt(a) - parseInt(b)).join(', '));
    process.exit(0);
  });
