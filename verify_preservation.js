const fs = require('fs');
const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function run() {
  console.log("=== Verification of Preserved Logs ===");
  
  // 1. Read local backup JSON
  const backupData = JSON.parse(fs.readFileSync('firestore_client1_sheet66.json', 'utf8'));
  const backupMap = {};
  backupData.forEach(item => {
    const key = `${item.des_giorno}_${item.num_riga_giorno}`;
    backupMap[key] = item;
  });
  
  // 2. Fetch from Firestore
  const snap = await db.collection('STORYBOARD')
    .where('ID_cliente', '==', '1')
    .where('num_scheda', '==', '66')
    .get();
    
  console.log(`Firestore record count for client 1, sheet 66: ${snap.size} (Expected: 40)`);
  
  let matchCount = 0;
  let mismatchCount = 0;
  const newExercises = [];
  
  snap.forEach(doc => {
    const data = doc.data();
    const key = `${data.des_giorno}_${data.num_riga_giorno}`;
    const backupRecord = backupMap[key];
    
    if (backupRecord) {
      // Compare some log values
      let isMatch = true;
      const fieldsToCheck = ['ins_week1', 'ins_week2', 'ins_week3', 'cmp1', 'cmp2', 'cmp3'];
      fieldsToCheck.forEach(f => {
        const backupVal = String(backupRecord[f] || '').trim();
        const firestoreVal = String(data[f] || '').trim();
        if (backupVal !== firestoreVal) {
          isMatch = false;
          console.warn(`Mismatch on key ${key}, field [${f}]: Backup=[${backupVal}] vs Firestore=[${firestoreVal}]`);
        }
      });
      
      if (isMatch) {
        matchCount++;
      } else {
        mismatchCount++;
      }
    } else {
      newExercises.push(data);
    }
  });
  
  console.log(`Matching records (logs fully preserved): ${matchCount}`);
  console.log(`Mismatching records: ${mismatchCount}`);
  console.log(`New exercises imported from CSV (not in backup): ${newExercises.length}`);
  
  newExercises.forEach((ex, idx) => {
    console.log(`  [New ${idx + 1}] Giorno ${ex.des_giorno}, RigaGiorno: ${ex.num_riga_giorno}, Esercizio: "${ex.des_esercizio}"`);
  });
  
  process.exit(0);
}

run().catch(console.error);
