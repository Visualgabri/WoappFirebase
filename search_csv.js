const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    // Cerchiamo dove des_esercizio contiene 'Pectoral' o simile, o UrlNormal contiene image037.gif
    const values = Object.values(riga).join(' ');
    if (values.includes('image037') || values.includes('Tricipiti')) {
      console.log('Trovato record:');
      console.log(JSON.stringify(riga, null, 2));
      process.exit(0);
    }
  })
  .on('end', () => {
    console.log('Record non trovato!');
    process.exit(0);
  });
