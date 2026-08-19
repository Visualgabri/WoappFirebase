const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

function toBoolean(val) {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === 'vero' || s === '1';
  }
  return false;
}

async function migrateMassimaliFlags() {
  console.log('[Migrazione Massimali] Inizio scansione collezione WOAPP_MASSIMALI_R...');
  const snap = await db.collection('WOAPP_MASSIMALI_R').get();
  console.log(`[Migrazione Massimali] Trovati ${snap.size} documenti.`);

  const batchSize = 400;
  let currentBatch = db.batch();
  let opsCount = 0;
  let updatedCount = 0;
  let totalBatches = 0;

  let countRmTrue = 0;
  let countRmFalse = 0;
  let countEscludiTrue = 0;
  let countEscludiFalse = 0;

  for (const docSnap of snap.docs) {
    const data = docSnap.data();
    const boolRm = toBoolean(data.flg_rm_teorico);
    const boolEscludi = toBoolean(data.flg_escludi);

    if (boolRm) countRmTrue++; else countRmFalse++;
    if (boolEscludi) countEscludiTrue++; else countEscludiFalse++;

    const needsUpdate = 
      typeof data.flg_rm_teorico !== 'boolean' || 
      typeof data.flg_escludi !== 'boolean' ||
      data.flg_rm_teorico !== boolRm ||
      data.flg_escludi !== boolEscludi;

    if (needsUpdate) {
      currentBatch.update(docSnap.ref, {
        flg_rm_teorico: boolRm,
        flg_escludi: boolEscludi
      });
      opsCount++;
      updatedCount++;

      if (opsCount >= batchSize) {
        await currentBatch.commit();
        totalBatches++;
        console.log(`[Migrazione Massimali] Batch ${totalBatches} eseguito (${opsCount} operazioni).`);
        currentBatch = db.batch();
        opsCount = 0;
      }
    }
  }

  if (opsCount > 0) {
    await currentBatch.commit();
    totalBatches++;
    console.log(`[Migrazione Massimali] Ultimo batch ${totalBatches} eseguito (${opsCount} operazioni).`);
  }

  console.log('====================================================');
  console.log('[Migrazione Massimali] Riepilogo completamento:');
  console.log(` - Documenti totali esaminati: ${snap.size}`);
  console.log(` - Documenti aggiornati con booleani: ${updatedCount}`);
  console.log(` - RM Teorico: ${countRmTrue} VERO (true), ${countRmFalse} FALSO (false)`);
  console.log(` - Escludi: ${countEscludiTrue} VERO (true), ${countEscludiFalse} FALSO (false)`);
  console.log('====================================================');
}

migrateMassimaliFlags().then(() => {
  console.log('[Migrazione Massimali] Processo terminato con successo.');
  process.exit(0);
}).catch(err => {
  console.error('[Migrazione Massimali] Errore:', err);
  process.exit(1);
});
