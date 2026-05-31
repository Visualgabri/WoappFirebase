const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkDoc() {
  const snap = await db.collection('STORYBOARD').limit(1).get();
  if (snap.empty) {
    console.log('No documents found!');
    process.exit(1);
  }
  const doc = snap.docs[0];
  console.log('ID:', doc.id);
  console.log('Data Keys:', Object.keys(doc.data()));
  console.log('UrlNormal value:', doc.data().UrlNormal);
  process.exit(0);
}

checkDoc().catch(console.error);
