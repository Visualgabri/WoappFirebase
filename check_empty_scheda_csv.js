const fs = require('fs');
const csv = require('csv-parser');

const emptySchede = {};
const allEmptyRows = [];

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (row) => {
    let idCliente = null;
    let numScheda = null;
    
    for (const key of Object.keys(row)) {
      if (key.includes('ID_cliente')) idCliente = row[key];
      if (key.includes('num_scheda')) numScheda = row[key];
    }
    
    if (!numScheda || numScheda.trim() === '') {
      emptySchede[idCliente] = (emptySchede[idCliente] || 0) + 1;
      allEmptyRows.push(row);
    }
  })
  .on('end', () => {
    console.log("Distribution of empty num_scheda rows by ID_cliente:");
    Object.keys(emptySchede).forEach(id => {
      console.log(`  - ID_cliente '${id}': ${emptySchede[id]} rows`);
    });
    
    // For ID_cliente = '1', print the row numbers and exercises of some of them
    const client1Empty = allEmptyRows.filter(r => {
      let idCliente = null;
      for (const key of Object.keys(r)) {
        if (key.includes('ID_cliente')) idCliente = r[key];
      }
      return idCliente === '1';
    });
    
    console.log(`\nClient 1 empty num_scheda rows count: ${client1Empty.length}`);
    client1Empty.slice(0, 20).forEach(r => {
      console.log(`  - num_riga: ${r.num_riga}, Giorno: ${r.des_giorno}, RigaGiorno: ${r.num_riga_giorno}, Esercizio: "${r.des_esercizio}"`);
    });
    process.exit(0);
  });
