const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snap = await db.collection('STORYBOARD').get();
  let count = 0;
  snap.forEach(doc => {
    const data = doc.data();
    if ((data.num_riga === undefined || data.num_riga === null || data.num_riga === '') && count < 3) {
      console.log(`Documento #${count} (ID: ${doc.id}):`);
      console.log(JSON.stringify(data, null, 2));
      count++;
    }
  });
  process.exit(0);
}

run().catch(console.error);
