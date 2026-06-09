const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function run() {
  const snap = await db.collection('STORYBOARD')
    .where('ID_cliente', '==', '1')
    .where('num_scheda', '==', '66')
    .get();
    
  console.log(`Current Firestore records count: ${snap.size}`);
  
  const groups = {};
  snap.forEach(doc => {
    const data = doc.data();
    const g = (data.des_giorno || 'UNKNOWN').trim().toUpperCase();
    if (!groups[g]) groups[g] = [];
    groups[g].push({ id: doc.id, ...data });
  });

  Object.keys(groups).sort().forEach(g => {
    console.log(`\n=== GIORNO ${g} ===`);
    const sorted = groups[g].sort((a,b) => (parseInt(a.num_riga_giorno) || 0) - (parseInt(b.num_riga_giorno) || 0));
    sorted.forEach(item => {
      console.log(`RigaGiorno: ${item.num_riga_giorno} (riga: ${item.num_riga}) - Ex: "${item.des_esercizio}" - Superset: "${item.alf_superserie || ''}" - DocID: ${item.id}`);
    });
  });
  process.exit(0);
}

run().catch(console.error);
