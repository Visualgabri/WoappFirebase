const fs = require('fs');
const csv = require('csv-parser');

const targetRigaNumbers = new Set(['62749', '62750', '62751', '62752', '62753', '62754', '62755', '62756', '62757', '62776', '62777', '62778', '62779', '62780', '62781', '62782', '62783', '62784', '62871', '62873']);

const results = [];

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    let numRiga = null;
    for (const key of Object.keys(row)) {
      if (key.toLowerCase().includes('num_riga') && !key.toLowerCase().includes('giorno')) {
        numRiga = row[key];
      }
    }
    
    if (targetRigaNumbers.has(numRiga)) {
      results.push(row);
    }
  })
  .on('end', () => {
    console.log(`Found ${results.length} rows matching target num_riga in CSV:`);
    results.forEach((row) => {
      let idCliente = null;
      let numScheda = null;
      let numRiga = null;
      for (const key of Object.keys(row)) {
        if (key.includes('ID_cliente')) idCliente = row[key];
        if (key.includes('num_scheda')) numScheda = row[key];
        if (key.toLowerCase().includes('num_riga') && !key.toLowerCase().includes('giorno')) numRiga = row[key];
      }
      console.log(`num_riga: ${numRiga} -> ID_cliente: ${idCliente}, num_scheda: ${numScheda}, Giorno: ${row.des_giorno}, RigaGiorno: ${row.num_riga_giorno}, Esercizio: "${row.des_esercizio}"`);
    });
    process.exit(0);
  });
