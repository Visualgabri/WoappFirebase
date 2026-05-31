const fs = require('fs');
const csv = require('csv-parser');

const righeMap = new Map();
let duplicateCount = 0;
let totalCount = 0;

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    totalCount++;
    const numRiga = riga.num_riga || riga['"num_riga"'];
    if (numRiga) {
      if (righeMap.has(numRiga)) {
        duplicateCount++;
      } else {
        righeMap.set(numRiga, riga);
      }
    }
  })
  .on('end', () => {
    console.log(`Totale righe: ${totalCount}`);
    console.log(`Chiavi num_riga uniche: ${righeMap.size}`);
    console.log(`Duplicati di num_riga: ${duplicateCount}`);
    process.exit(0);
  });
