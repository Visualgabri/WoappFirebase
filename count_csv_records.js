const fs = require('fs');
const csv = require('csv-parser');

const ID_CLIENTE_KEY = 'ID_cliente';
let totalRows = 0;
const clienteStats = {};
const schedeForCliente1 = new Set();
const schedeCounts = {};

console.log("Analisi in corso di WOAPP_STORYBOARD.csv...");

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('headers', (headers) => {
    console.log("Headers rilevati nel CSV:", headers);
  })
  .on('data', (riga) => {
    totalRows++;
    
    // Trova la chiave ID_cliente
    let idCliente = null;
    for (const key of Object.keys(riga)) {
      if (key.includes('ID_cliente')) {
        idCliente = riga[key];
      }
    }
    
    if (idCliente) {
      clienteStats[idCliente] = (clienteStats[idCliente] || 0) + 1;
    }
    
    if (idCliente === '1') {
      let numScheda = null;
      for (const key of Object.keys(riga)) {
        if (key.includes('num_scheda')) {
          numScheda = riga[key];
        }
      }
      if (numScheda) {
        schedeForCliente1.add(numScheda);
        schedeCounts[numScheda] = (schedeCounts[numScheda] || 0) + 1;
      }
    }
  })
  .on('end', () => {
    console.log(`\n--- RISULTATI ANALISI CSV ---`);
    console.log(`Righe totali nel CSV: ${totalRows}`);
    
    console.log(`\nDistribuzione record per ID_cliente nel CSV:`);
    Object.keys(clienteStats).forEach(id => {
      console.log(`  - ID_cliente '${id}': ${clienteStats[id]} record`);
    });
    
    console.log(`\nSchede trovate per ID_cliente '1' nel CSV (totale: ${schedeForCliente1.size}):`);
    const sortedSchede = Array.from(schedeForCliente1).sort((a, b) => parseInt(a) - parseInt(b));
    sortedSchede.forEach(num => {
      console.log(`  - Scheda #${num}: ${schedeCounts[num]} record`);
    });
    
    process.exit(0);
  });
