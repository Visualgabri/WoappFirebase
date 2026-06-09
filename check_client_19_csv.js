const fs = require('fs');
const csv = require('csv-parser');

const results = [];

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    let idCliente = null;
    let numScheda = null;
    
    for (const key of Object.keys(row)) {
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('id_cliente')) idCliente = row[key];
      if (lowerKey.includes('num_scheda')) numScheda = row[key];
    }
    
    if (numScheda === '66') {
      results.push({ idCliente, row });
    }
  })
  .on('end', () => {
    console.log(`Found ${results.length} rows for sheet 66 in CSV:`);
    results.forEach((item, idx) => {
      console.log(`[${idx}] Client: ${item.idCliente}, Giorno: ${item.row.des_giorno}, RigaGiorno: ${item.row.num_riga_giorno}, Esercizio: ${item.row.des_esercizio}`);
    });
    process.exit(0);
  });
