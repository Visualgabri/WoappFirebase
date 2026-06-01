const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const collectionRef = db.collection('STORYBOARD');
  
  // Query specific client and sheet
  const snap = await collectionRef
    .where('ID_cliente', '==', '1')
    .where('num_scheda', '==', '65')
    .get();

  console.log(`Trovati ${snap.size} record per ID_cliente '1' e num_scheda '65'`);
  
  snap.forEach(doc => {
    const data = doc.data();
    console.log(`Esercizio: "${data.des_esercizio}", Giorno: "${data.des_giorno}", RigaGiorno: "${data.num_riga_giorno}" (tipo: ${typeof data.num_riga_giorno})`);
  });

  process.exit(0);
}

run().catch(console.error);
