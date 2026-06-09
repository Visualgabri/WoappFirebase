const fs = require('fs');
const csv = require('csv-parser');

const targetIdCliente = '1';
const targetNumScheda = '66';

const results = [];
const uniqueSchede = new Set();

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    // Access keys exactly
    const idCliente = row['﻿"ID_cliente"'] || row['ID_cliente'];
    const numScheda = row['num_scheda'];
    
    if (idCliente === targetIdCliente) {
      if (numScheda) {
        uniqueSchede.add(numScheda);
      }
      if (numScheda === targetNumScheda) {
        results.push(row);
      }
    }
  })
  .on('end', () => {
    console.log(`Unique schede for ID_cliente '${targetIdCliente}' in CSV:`, Array.from(uniqueSchede).sort((a,b) => parseInt(a)-parseInt(b)).join(', '));
    console.log(`Found ${results.length} records in CSV for ID_cliente = '${targetIdCliente}', num_scheda = '${targetNumScheda}'`);
    if (results.length > 0) {
      results.forEach((r, idx) => {
        console.log(`[${idx}] Giorno: ${r.des_giorno}, RigaGiorno: ${r.num_riga_giorno}, Esercizio: ${r.des_esercizio}`);
      });
    }
    process.exit(0);
  });
