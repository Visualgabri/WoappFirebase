const fs = require('fs');
const csv = require('csv-parser');

const results = [];
fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (data) => results.push(data))
  .on('end', () => {
    // Stampa i primi 5 record con le chiavi che iniziano con UrlNormal
    for (let i = 0; i < 5; i++) {
      console.log(`Record ${i}:`);
      const keys = Object.keys(results[i]);
      const urlKeys = keys.filter(k => k.toLowerCase().includes('urlnormal'));
      console.log('Keys matching "urlnormal":', urlKeys);
      urlKeys.forEach(k => {
        console.log(`  ${k}: ${results[i][k]}`);
      });
    }
    process.exit(0);
  });
