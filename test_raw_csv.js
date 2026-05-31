const fs = require('fs');

const fileContent = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf-8');
const lines = fileContent.split('\n');

// Estrai gli header
const headers = lines[0].split(';');
console.log('Total headers:', headers.length);
headers.forEach((h, idx) => {
  if (h.toLowerCase().includes('urlnormal')) {
    console.log(`Header: ${h} at index ${idx}`);
  }
});

// Cerca una riga con Tricipiti o Dorsali
for (let i = 1; i < 20; i++) {
  const parts = lines[i].split(';');
  if (parts.length > 53) {
    console.log(`Line ${i}:`);
    console.log(`  Col 52 (UrlNormal): ${parts[52]}`);
    console.log(`  Col 83 (UrlNormal): ${parts[83]}`);
  }
}
process.exit(0);
