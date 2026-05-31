const fs = require('fs');
const csv = require('csv-parser');

let totalRows = 0;
let validRows = 0;
let emptyRows = 0;

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    totalRows++;
    
    // Controlla se ha ID_cliente e num_scheda validi
    let idCliente = null;
    let numScheda = null;
    for (const key of Object.keys(riga)) {
      if (key.includes('ID_cliente')) idCliente = riga[key];
      if (key.includes('num_scheda')) numScheda = riga[key];
    }
    
    if (idCliente && idCliente.trim() !== '' && numScheda && numScheda.trim() !== '') {
      validRows++;
    } else {
      emptyRows++;
    }
  })
  .on('end', () => {
    console.log(`Totale righe lette: ${totalRows}`);
    console.log(`Righe valide (con ID_cliente e num_scheda): ${validRows}`);
    console.log(`Righe vuote o incomplete: ${emptyRows}`);
    process.exit(0);
  });
