const fs = require('fs');

const content = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf8');
const lines = content.split('\n');

const headers = lines[0].replace(/"/g, '').split(';').map(h => h.replace(/^\uFEFF/, '').trim());

let validCount = 0;
let invalidCount = 0;
const invalidDetails = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const cells = line.split(';');
  const record = {};
  
  headers.forEach((header, idx) => {
    let cellVal = cells[idx] ? cells[idx].replace(/^"/, '').replace(/"$/, '').trim() : '';
    if (header && cellVal !== '') {
      record[header] = cellVal;
    }
  });
  
  const idCliente = record['ID_cliente'];
  const numScheda = record['num_scheda'];
  
  if (idCliente && idCliente.trim() !== '' && numScheda && numScheda.trim() !== '') {
    validCount++;
  } else {
    invalidCount++;
    if (invalidDetails.length < 10) {
      invalidDetails.push({ lineNum: i, num_riga: record['num_riga'], idCliente, numScheda, ex: record['des_esercizio'] });
    }
  }
}

console.log(`Total lines: ${lines.length}`);
console.log(`Valid rows for import: ${validCount}`);
console.log(`Invalid rows (skipped): ${invalidCount}`);
console.log("\nSample of skipped rows:");
console.log(JSON.stringify(invalidDetails, null, 2));

process.exit(0);
