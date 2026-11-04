const fs = require('fs');
const csv = require('csv-parser');

const startRiga = 63074;
const endRiga = 63155;

const results = [];

const GDRIVE_CSV_PATH = "C:\\Users\\visua\\Google Drive\\WOAPP_STORYBOARD.csv";
const CSV_PATH = fs.existsSync(GDRIVE_CSV_PATH) ? GDRIVE_CSV_PATH : 'WOAPP_STORYBOARD.csv';
fs.createReadStream(CSV_PATH)
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    let numRiga = null;
    for (const key of Object.keys(row)) {
      if (key.toLowerCase().includes('num_riga') && !key.toLowerCase().includes('giorno')) {
        numRiga = parseInt(row[key]);
      }
    }
    
    if (numRiga >= startRiga && numRiga <= endRiga) {
      results.push(row);
    }
  })
  .on('end', () => {
    console.log(`Found ${results.length} rows in CSV between row ${startRiga} and ${endRiga}:`);
    results.sort((a,b) => {
      let rA = 0, rB = 0;
      for (const key of Object.keys(a)) {
        if (key.toLowerCase().includes('num_riga') && !key.toLowerCase().includes('giorno')) rA = parseInt(a[key]);
      }
      for (const key of Object.keys(b)) {
        if (key.toLowerCase().includes('num_riga') && !key.toLowerCase().includes('giorno')) rB = parseInt(b[key]);
      }
      return rA - rB;
    }).forEach((row) => {
      let idCliente = null;
      let numScheda = null;
      let numRiga = null;
      for (const key of Object.keys(row)) {
        if (key.includes('ID_cliente')) idCliente = row[key];
        if (key.includes('num_scheda')) numScheda = row[key];
        if (key.toLowerCase().includes('num_riga') && !key.toLowerCase().includes('giorno')) numRiga = row[key];
      }
      console.log(`num_riga: ${numRiga} -> ID_cliente: ${idCliente}, num_scheda: "${numScheda}", Giorno: ${row.des_giorno}, RigaGiorno: ${row.num_riga_giorno}, Esercizio: "${row.des_esercizio}"`);
    });
    process.exit(0);
  });
