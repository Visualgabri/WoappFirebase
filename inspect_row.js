const fs = require('fs');
const csv = require('csv-parser');

fs.createReadStream('WOAPP_STORYBOARD.csv')
  .pipe(csv({ separator: ';' }))
  .on('data', (riga) => {
    let numRiga = null;
    for (const key of Object.keys(riga)) {
      if (key.toLowerCase().includes('num_riga') && !key.toLowerCase().includes('giorno')) {
        numRiga = riga[key];
      }
    }
    
    if (numRiga === '62756' || numRiga === '62782') {
      console.log(`=== Raw keys and values for num_riga ${numRiga} ===`);
      for (const [k, v] of Object.entries(riga)) {
        if (v !== '') {
          console.log(`  Key: [${k}] -> Value: [${v}]`);
        }
      }
    }
  })
  .on('end', () => {
    process.exit(0);
  });
