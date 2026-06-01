const fs = require('fs');
const csv = require('csv-parser');

const athletes = {};

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    let idCliente = null;
    for (const key of Object.keys(riga)) {
      if (key.includes('ID_cliente')) {
        idCliente = riga[key];
        break;
      }
    }
    if (idCliente) {
      athletes[idCliente] = (athletes[idCliente] || 0) + 1;
    }
  })
  .on('end', () => {
    console.log("Atleti totali e numero record:");
    console.log(JSON.stringify(athletes, null, 2));
    process.exit(0);
  });
