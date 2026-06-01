const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snap = await db.collection('STORYBOARD')
    .where('ID_cliente', '==', '1')
    .where('num_scheda', '==', '65')
    .where('num_riga_giorno', '==', '0')
    .get();

  if (snap.empty) {
    console.log("Nessun documento trovato per ID_cliente = '1', num_scheda = '65', num_riga_giorno = '0' in Firestore!");
    
    // Let's print any document for client 1 and sheet 65
    const anySnap = await db.collection('STORYBOARD')
      .where('ID_cliente', '==', '1')
      .where('num_scheda', '==', '65')
      .limit(3)
      .get();
      
    console.log(`\nEsempio di altri documenti trovati per scheda 65 (${anySnap.size}):`);
    anySnap.forEach(doc => {
      console.log(`Documento ID: ${doc.id}`);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  } else {
    console.log(`Trovati ${snap.size} documenti di Riga 0 per scheda 65!`);
    snap.forEach(doc => {
      console.log("Documento ID:", doc.id);
      console.log(JSON.stringify(doc.data(), null, 2));
    });
  }
  process.exit(0);
}

run().catch(console.error);
