const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  const snap = await db.collection('STORYBOARD').limit(1).get();
  const data = snap.docs[0].data();
  console.log("Esempio di documento in Firestore:");
  console.log(JSON.stringify(data, null, 2));
  process.exit(0);
}

run().catch(console.error);
