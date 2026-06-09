const fs = require('fs');

const content = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf8');
const lines = content.split('\n');

const headers = lines[0].replace(/"/g, '').split(';').map(h => h.replace(/^\uFEFF/, '').trim());

const urlNormalIndices = [];
headers.forEach((h, idx) => {
  if (h === 'UrlNormal') {
    urlNormalIndices.push(idx);
  }
});

const targetRighe = ['62756', '62782', '63081', '63098', '63149'];
const recordsFound = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (!line) continue;
  
  const cells = line.split(';');
  const record = {};
  
  headers.forEach((header, idx) => {
    let cellVal = cells[idx] ? cells[idx].replace(/^"/, '').replace(/"$/, '').trim() : '';
    
    if (header === 'UrlNormal') {
      const firstUrlVal = cells[urlNormalIndices[0]] ? cells[urlNormalIndices[0]].replace(/^"/, '').replace(/"$/, '').trim() : '';
      const secondUrlVal = cells[urlNormalIndices[1]] ? cells[urlNormalIndices[1]].replace(/^"/, '').replace(/"$/, '').trim() : '';
      
      if (firstUrlVal.startsWith('http')) {
        cellVal = firstUrlVal;
      } else if (secondUrlVal.startsWith('http')) {
        cellVal = secondUrlVal;
      } else {
        cellVal = firstUrlVal || secondUrlVal || '';
      }
    }
    
    if (header && cellVal !== '') {
      record[header] = cellVal;
    }
  });
  
  const numRiga = record['num_riga'];
  if (targetRighe.includes(numRiga)) {
    recordsFound.push({ lineNum: i, record });
  }
}

console.log(`Found ${recordsFound.length} matching rows in simulation:`);
recordsFound.forEach(({ lineNum, record }) => {
  const idCliente = record['ID_cliente'];
  const numScheda = record['num_scheda'];
  const isValid = (idCliente && idCliente.trim() !== '' && numScheda && numScheda.trim() !== '');
  console.log(`Line in CSV: ${lineNum} -> num_riga: ${record['num_riga']}, ID_cliente: "${idCliente}", num_scheda: "${numScheda}", isValid: ${isValid}, Ex: "${record['des_esercizio']}"`);
});
process.exit(0);
