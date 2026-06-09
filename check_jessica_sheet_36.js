const fs = require('fs');
const csv = require('csv-parser');
const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

const idCliente = '57';
const numScheda = '36';

async function run() {
  // 1. Fetch from Firestore
  const snap = await db.collection('STORYBOARD')
    .where('ID_cliente', '==', idCliente)
    .where('num_scheda', '==', numScheda)
    .get();
    
  console.log(`=== FIRESTORE: Trovati ${snap.size} record per cliente ${idCliente}, scheda ${numScheda} ===`);
  const fsGroups = {};
  snap.forEach(doc => {
    const data = doc.data();
    const g = (data.des_giorno || 'UNKNOWN').trim().toUpperCase();
    if (!fsGroups[g]) fsGroups[g] = [];
    fsGroups[g].push(data);
  });
  
  Object.keys(fsGroups).sort().forEach(g => {
    console.log(`Giorno ${g}:`);
    fsGroups[g].sort((a,b) => (parseInt(a.num_riga_giorno)||0) - (parseInt(b.num_riga_giorno)||0)).forEach(item => {
      console.log(`  - RigaGiorno: ${item.num_riga_giorno} (riga: ${item.num_riga}) - Ex: "${item.des_esercizio}" - Superset: "${item.alf_superserie || ''}"`);
    });
  });

  // 2. Fetch from CSV
  const csvRows = [];
  await new Promise((resolve) => {
    fs.createReadStream('WOAPP_STORYBOARD.csv')
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        let rId = null;
        let rScheda = null;
        for (const key of Object.keys(row)) {
          if (key.includes('ID_cliente')) rId = row[key];
          if (key.includes('num_scheda')) rScheda = row[key];
        }
        if (rId === idCliente && rScheda === numScheda) {
          csvRows.push(row);
        }
      })
      .on('end', resolve);
  });
  
  console.log(`\n=== CSV: Trovati ${csvRows.length} record per cliente ${idCliente}, scheda ${numScheda} ===`);
  const csvGroups = {};
  csvRows.forEach(row => {
    const g = (row.des_giorno || 'UNKNOWN').trim().toUpperCase();
    if (!csvGroups[g]) csvGroups[g] = [];
    csvGroups[g].push(row);
  });
  
  Object.keys(csvGroups).sort().forEach(g => {
    console.log(`Giorno ${g}:`);
    csvGroups[g].sort((a,b) => (parseInt(a.num_riga_giorno)||0) - (parseInt(b.num_riga_giorno)||0)).forEach(item => {
      console.log(`  - RigaGiorno: ${item.num_riga_giorno} (riga: ${item.num_riga}) - Ex: "${item.des_esercizio}" - Superset: "${item.alf_superserie || ''}"`);
    });
  });

  // 3. Fetch from Backup JSON
  const backup = JSON.parse(fs.readFileSync('WoappWeb/public/storyboard_backup.json', 'utf8'));
  const backupRows = backup.filter(row => {
    let rId = null;
    let rScheda = null;
    for (const key of Object.keys(row)) {
      if (key.includes('ID_cliente')) rId = String(row[key]);
      if (key.includes('num_scheda')) rScheda = String(row[key]);
    }
    return rId === idCliente && rScheda === numScheda;
  });
  
  console.log(`\n=== BACKUP JSON: Trovati ${backupRows.length} record per cliente ${idCliente}, scheda ${numScheda} ===`);
  const bkGroups = {};
  backupRows.forEach(row => {
    const g = (row.des_giorno || 'UNKNOWN').trim().toUpperCase();
    if (!bkGroups[g]) bkGroups[g] = [];
    bkGroups[g].push(row);
  });
  
  Object.keys(bkGroups).sort().forEach(g => {
    console.log(`Giorno ${g}:`);
    bkGroups[g].sort((a,b) => (parseInt(a.num_riga_giorno)||0) - (parseInt(b.num_riga_giorno)||0)).forEach(item => {
      console.log(`  - RigaGiorno: ${item.num_riga_giorno} (riga: ${item.num_riga}) - Ex: "${item.des_esercizio}" - Superset: "${item.alf_superserie || ''}"`);
    });
  });
  
  process.exit(0);
}

run().catch(console.error);
