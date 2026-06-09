const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();
const NOME_COLLEZIONE = 'STORYBOARD';
const destPath = 'WoappWeb/public/storyboard_backup.json';

async function run() {
  console.log(`Querying all records from collection '${NOME_COLLEZIONE}'...`);
  const snap = await db.collection(NOME_COLLEZIONE).get();
  console.log(`Retrieved ${snap.size} documents from Firestore.`);
  
  const records = [];
  snap.forEach(doc => {
    records.push({ id: doc.id, ...doc.data() });
  });
  
  console.log(`Writing records to ${destPath}...`);
  fs.writeFileSync(destPath, JSON.stringify(records, null, 2));
  console.log(`🎉 Backup JSON successfully regenerated at ${destPath}!`);
  process.exit(0);
}

run().catch(err => {
  console.error("Error regenerating backup JSON:", err);
  process.exit(1);
});
