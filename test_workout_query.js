const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const athlete = '1';
  // Let's find the latest or any sheet that exists for client '1'
  const collectionRef = db.collection('STORYBOARD');
  const snap = await collectionRef
    .where('ID_cliente', '==', athlete)
    .get();
  
  console.log(`Trovati ${snap.size} record totali per ID_cliente = '${athlete}'`);
  
  const schede = new Set();
  snap.forEach(doc => {
    schede.add(doc.data().num_scheda);
  });
  console.log("Schede disponibili per ID_cliente '1':", Array.from(schede).sort());

  // Let's choose the highest/latest sheet number
  const selectedSheet = Array.from(schede).sort((a,b) => parseInt(b) - parseInt(a))[0];
  console.log(`Analisi scheda selezionata: '${selectedSheet}'`);

  const sheetSnap = await collectionRef
    .where('ID_cliente', '==', athlete)
    .where('num_scheda', '==', selectedSheet)
    .get();

  console.log(`Trovati ${sheetSnap.size} record per scheda '${selectedSheet}'`);
  
  sheetSnap.forEach(doc => {
    const data = doc.data();
    if (parseInt(data.num_riga_giorno) === 0) {
      console.log(`[RIGA 0 CON RIGA_GIORNO == 0] ID: ${doc.id}`);
      console.log(JSON.stringify(data, null, 2));
    }
  });

  process.exit(0);
}

run().catch(console.error);
