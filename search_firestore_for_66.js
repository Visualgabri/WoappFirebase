const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snap = await db.collection('STORYBOARD')
    .where('ID_cliente', '==', '1')
    .where('num_scheda', '==', '66')
    .get();
    
  console.log(`Found ${snap.size} records in STORYBOARD for client 1, sheet 66`);
  const dataList = [];
  snap.forEach(doc => {
    dataList.push({ id: doc.id, ...doc.data() });
  });
  
  fs.writeFileSync('firestore_client1_sheet66.json', JSON.stringify(dataList, null, 2));
  console.log("Written all 38 records to firestore_client1_sheet66.json");
  
  process.exit(0);
}

run().catch(console.error);
