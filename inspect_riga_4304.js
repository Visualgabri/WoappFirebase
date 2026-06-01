const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snap = await db.collection('STORYBOARD')
    .where('num_riga', '==', '4304')
    .get();

  if (snap.empty) {
    console.log("Nessun documento trovato con num_riga = '4304'");
  } else {
    console.log(`Trovati ${snap.size} documenti con num_riga = '4304'`);
    snap.forEach(doc => {
      console.log("Documento ID:", doc.id);
      const data = doc.data();
      for (const [k, v] of Object.entries(data)) {
        console.log(`  Key: [${k}] (hex: ${Buffer.from(k).toString('hex')}) -> Value: [${v}]`);
      }
    });
  }
  process.exit(0);
}

run().catch(console.error);
