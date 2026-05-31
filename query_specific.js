const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const collectionRef = db.collection('STORYBOARD');
  
  // Utilizziamo l'aggregazione count() per sapere quanti documenti ci sono realmente
  const countSnap = await collectionRef.count().get();
  const totalCount = countSnap.data().count;
  console.log(`Numero totale effettivo di documenti nella collezione 'STORYBOARD': ${totalCount}`);
  
  // Proviamo a cercare specificamente schede con numero 65 per ID_cliente '1'
  const specSnap = await collectionRef
    .where('﻿"ID_cliente"', '==', '1') // Nota la BOM davanti al nome
    .where('num_scheda', '==', '65')
    .get();
  
  console.log(`\nQuery con BOM: Trovati ${specSnap.size} record per la scheda 65 dell'ID_cliente 1`);
  
  const specSnapNoBOM = await collectionRef
    .where('ID_cliente', '==', '1')
    .where('num_scheda', '==', '65')
    .get();
    
  console.log(`Query senza BOM: Trovati ${specSnapNoBOM.size} record per la scheda 65 dell'ID_cliente 1`);

  const specSnapInt = await collectionRef
    .where('ID_cliente', '==', 1)
    .where('num_scheda', '==', 65)
    .get();
    
  console.log(`Query con ID come Interi: Trovati ${specSnapInt.size} record per la scheda 65 dell'ID_cliente 1`);

  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
