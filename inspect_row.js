const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    if (riga.des_esercizio && riga.des_esercizio.includes('WO A [1:05 32% / 1h 28%]')) {
      console.log("Keys and Values:");
      for (const [k, v] of Object.entries(riga)) {
        console.log(`  Key: [${k}] (hex: ${Buffer.from(k).toString('hex')}) -> Value: [${v}]`);
      }
      process.exit(0);
    }
  });
