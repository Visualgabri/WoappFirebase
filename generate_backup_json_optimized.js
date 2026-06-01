const fs = require('fs');

console.log("=== Generating Optimized Backup JSON from CSV ===");

const content = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf8');
const lines = content.split('\n');

const headers = lines[0].replace(/"/g, '').split(';').map(h => h.replace(/^\uFEFF/, '').trim());
console.log("Headers parsed. Count:", headers.length);

const urlNormalIndices = [];
headers.forEach((h, idx) => {
  if (h === 'UrlNormal') {
    urlNormalIndices.push(idx);
  }
});
console.log("UrlNormal column indices:", urlNormalIndices);

const tutteLeRigheValide = [];

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
  
  if (record['ID_cliente'] && record['num_scheda']) {
    record.id = record.num_riga || Math.random().toString(36).substring(2);
    tutteLeRigheValide.push(record);
  }
}

console.log(`Trovate ${tutteLeRigheValide.length} righe valide.`);
const destPath = 'WoappWeb/public/storyboard_backup.json';
fs.writeFileSync(destPath, JSON.stringify(tutteLeRigheValide)); // Minified
console.log(`🎉 Backup JSON corretto e ottimizzato generato con successo in ${destPath}!`);
process.exit(0);
