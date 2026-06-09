const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

const targetRighe = ['62756', '62782', '63081', '63098', '63149'];

async function run() {
  for (const r of targetRighe) {
    const snap = await db.collection('STORYBOARD')
      .where('num_riga', '==', r)
      .get();
      
    console.log(`\n=== FIRESTORE: Searching for num_riga = ${r} ===`);
    console.log(`Found ${snap.size} documents.`);
    snap.forEach(doc => {
      const data = doc.data();
      console.log(`DocID: ${doc.id}`);
      console.log(`  ID_cliente: ${data.ID_cliente}`);
      console.log(`  num_scheda: ${data.num_scheda}`);
      console.log(`  des_giorno: ${data.des_giorno}`);
      console.log(`  num_riga_giorno: ${data.num_riga_giorno}`);
      console.log(`  des_esercizio: ${data.des_esercizio}`);
    });
  }
  process.exit(0);
}

run().catch(console.error);
