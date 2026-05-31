const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snap = await db.collection('STORYBOARD').get();
  let countWithNumRiga = 0;
  let countWithoutNumRiga = 0;
  const numRigaSet = new Set();
  let duplicateNumRiga = 0;

  snap.forEach(doc => {
    const data = doc.data();
    if (data.num_riga !== undefined && data.num_riga !== null && data.num_riga !== '') {
      countWithNumRiga++;
      if (numRigaSet.has(data.num_riga)) {
        duplicateNumRiga++;
      } else {
        numRigaSet.add(data.num_riga);
      }
    } else {
      countWithoutNumRiga++;
    }
  });

  console.log(`Documenti in Firestore: ${snap.size}`);
  console.log(`Con num_riga: ${countWithNumRiga}`);
  
  // Stampa primi 5 valori del set
  console.log("Esempi di num_riga:", Array.from(numRigaSet).slice(0, 5));
  
  console.log(`Senza num_riga: ${countWithoutNumRiga}`);
  console.log(`num_riga duplicati in Firestore: ${duplicateNumRiga}`);
  process.exit(0);
}

run().catch(console.error);
