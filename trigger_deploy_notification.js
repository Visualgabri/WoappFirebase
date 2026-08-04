const admin = require('firebase-admin');
const path = require('path');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

async function triggerDeploy() {
  const versionId = 'v_' + Date.now();
  const timestamp = new Date().toISOString();
  
  await db.collection('METADATA').doc('deploy_version').set({
    version_id: versionId,
    timestamp: timestamp,
    tipo: 'deploy',
    titolo: '🚀 Nuovo Aggiornamento!',
    message_general: 'Nuova versione disponibile con miglioramenti e novità.',
    target_atleta_id: null,
    notes_per_athlete: {}
  }, { merge: true });

  console.log(`\n===============================================================`);
  console.log(`✅ [DEPLOY NOTIFICATION AUTO] Firestore METADATA/deploy_version aggiornato!`);
  console.log(`📌 Version ID: ${versionId}`);
  console.log(`===============================================================\n`);
  process.exit(0);
}

triggerDeploy().catch(err => {
  console.error("❌ Errore nell'aggiornamento automatico deploy su Firestore:", err);
  process.exit(1);
});
