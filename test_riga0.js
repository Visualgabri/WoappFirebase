const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    if (parseInt(riga.num_riga_giorno) === 0) {
      console.log('Trovato record Riga 0:');
      console.log(JSON.stringify(riga, null, 2));
      process.exit(0);
    }
  })
  .on('end', () => {
    console.log('Riga 0 non trovata!');
    process.exit(0);
  });
