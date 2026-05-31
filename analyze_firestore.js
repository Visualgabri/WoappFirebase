const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  console.log("Analisi della collezione STORYBOARD in Firestore...");
  const snap = await db.collection('STORYBOARD').get();
  console.log(`Numero totale di documenti letti: ${snap.size}`);
  
  const clienteCounts = {};
  const schedeByCliente = {};
  
  snap.forEach(doc => {
    const data = doc.data();
    
    // Trova la chiave ID_cliente
    let idCliente = 'Sconosciuto';
    for (const key of Object.keys(data)) {
      if (key.includes('ID_cliente')) {
        idCliente = data[key];
      }
    }
    
    // Trova la chiave num_scheda
    let numScheda = 'Sconosciuta';
    for (const key of Object.keys(data)) {
      if (key.includes('num_scheda')) {
        numScheda = data[key];
      }
    }
    
    clienteCounts[idCliente] = (clienteCounts[idCliente] || 0) + 1;
    
    if (!schedeByCliente[idCliente]) {
      schedeByCliente[idCliente] = new Set();
    }
    schedeByCliente[idCliente].add(numScheda);
  });
  
  console.log("\nDistribuzione per ID_cliente in Firestore:");
  for (const [cli, count] of Object.entries(clienteCounts)) {
    const schede = Array.from(schedeByCliente[cli]).sort((a, b) => parseInt(a) - parseInt(b));
    console.log(`  - ID_cliente '${cli}': ${count} record. Schede: ${schede.join(', ')}`);
  }
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
