const fs = require('fs');
const csv = require('csv-parser');

const athlete = '1';
// Let's find all sheets for this athlete in the CSV
const sheets = new Set();
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
      sheets.add(numScheda);
    }
  })
  .on('end', () => {
    const list = Array.from(sheets).sort((a,b) => parseInt(a) - parseInt(b));
    console.log("Tutte le schede nel CSV per ID_cliente '1':", list.join(', '));
    
    // Cerchiamo i record per l'ultima scheda (es. '65' o '66')
    const selectedSheet = list[list.length - 1]; // o '65' o '66'
    console.log(`\nCerca record per scheda ${selectedSheet}:`);
    
    const matchingRows = [];
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
          matchingRows.push(riga);
        }
      })
      .on('end', () => {
        console.log(`Trovati ${matchingRows.length} record per scheda ${selectedSheet}`);
        matchingRows.forEach(r => {
          if (parseInt(r.num_riga_giorno) === 0) {
            console.log(`[RIGA 0] Giorno: ${r.des_giorno}, Esercizio: "${r.des_esercizio}", RigaGiorno: "${r.num_riga_giorno}"`);
          }
        });
        process.exit(0);
      });
  });
