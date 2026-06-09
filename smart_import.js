const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const NOME_COLLEZIONE = 'STORYBOARD';

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function svuotaCollezione() {
  console.log(`\n--- FASE 1: Svuotamento della collezione '${NOME_COLLEZIONE}'...`);
  const collectionRef = db.collection(NOME_COLLEZIONE);
  let snap = await collectionRef.limit(500).get();
  let totalDeleted = 0;
  
  while (!snap.empty) {
    const batch = db.batch();
    snap.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    
    await batch.commit();
    totalDeleted += snap.size;
    console.log(`Eliminati ${totalDeleted} documenti...`);
    
    await sleep(200);
    snap = await collectionRef.limit(500).get();
  }
  
  console.log(`Collezione '${NOME_COLLEZIONE}' svuotata completamente!`);
}

async function smartImport() {
  console.log(`\n--- FASE 2: Lettura del backup locale di Gabriele Belmonte (Scheda 66)...`);
  let backupData = [];
  try {
    if (fs.existsSync('firestore_client1_sheet66.json')) {
      backupData = JSON.parse(fs.readFileSync('firestore_client1_sheet66.json', 'utf8'));
      console.log(`Caricato backup di Gabriele Belmonte: ${backupData.length} record.`);
    } else {
      console.warn("ATTENZIONE: firestore_client1_sheet66.json non trovato! Nessun dato di Gabriele Belmonte verrà preservato.");
    }
  } catch (err) {
    console.error("Errore lettura backup:", err);
  }

  // Creiamo una mappa per l'accesso rapido ai dati di backup: giorno_riga -> record
  const backupMap = {};
  backupData.forEach(item => {
    const giorno = String(item.des_giorno || '').trim().toUpperCase();
    const rigaGiorno = String(item.num_riga_giorno || '').trim();
    if (giorno && rigaGiorno) {
      backupMap[`${giorno}_${rigaGiorno}`] = item;
    }
  });

  console.log(`\n--- FASE 3: Lettura e validazione di WOAPP_STORYBOARD.csv...`);
  const content = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf8');
  const lines = content.split('\n');
  
  const headers = lines[0].replace(/"/g, '').split(';').map(h => h.replace(/^\uFEFF/, '').trim());
  console.log(`Headers trovati nel CSV: ${headers.length}`);
  
  const urlNormalIndices = [];
  headers.forEach((h, idx) => {
    if (h === 'UrlNormal') {
      urlNormalIndices.push(idx);
    }
  });

  const tutteLeRigheValide = [];
  let mergeCount = 0;
  let newRecordsFor66 = 0;

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    const cells = line.split(';');
    const record = {};
    
    headers.forEach((header, idx) => {
      let cellVal = cells[idx] ? cells[idx].replace(/^"/, '').replace(/"$/, '').trim() : '';
      
      if (header === 'UrlNormal') {
        const firstUrlVal = cells[urlNormalIndices[0]] ? cells[urlNormalIndices[0]].replace(/^"/, '').replace(/"$/, '').trim() : '';
        const secondUrlVal = cells[urlNormalIndices[1]] ? cells[urlNormalIndices[1]].replace(/^"/, '').replace(/"$/, '').trim() : '';
        
        if (firstUrlVal.startsWith('http')) {
          cellVal = firstUrlVal;
        } else if (secondUrlVal.startsWith('http')) {
          cellVal = secondUrlVal;
        } else {
          cellVal = firstUrlVal || secondUrlVal || '';
        }
      }
      
      if (header && cellVal !== '') {
        record[header] = cellVal;
      }
    });
    
    const idCliente = record['ID_cliente'];
    const numScheda = record['num_scheda'];
    
    if (idCliente && idCliente.trim() !== '' && numScheda && numScheda.trim() !== '') {
      // Logica speciale per preservare i dati di Gabriele Belmonte (Scheda 66)
      if (idCliente.trim() === '1' && numScheda.trim() === '66') {
        const giorno = String(record['des_giorno'] || '').trim().toUpperCase();
        const rigaGiorno = String(record['num_riga_giorno'] || '').trim();
        const key = `${giorno}_${rigaGiorno}`;
        
        const backupRecord = backupMap[key];
        if (backupRecord) {
          // Uniamo il record del CSV (base) con i log storici di Firestore
          const fieldsToPreserve = [
            'ins_week1', 'ins_week2', 'ins_week3', 'ins_week4', 'ins_week5', 'ins_week6',
            'reps_week1', 'reps_week2', 'reps_week3', 'reps_week4', 'reps_week5', 'reps_week6',
            'cmp1', 'cmp2', 'cmp3', 'cmp4', 'cmp5', 'cmp6',
            'timestamp', 'timestamp_ute',
            'start_wo', 'end_wo', 'start2_wo', 'end2_wo', 'start3_wo', 'end3_wo', 'start4_wo', 'end4_wo', 'start5_wo', 'end5_wo', 'start6_wo', 'end6_wo',
            'num_faticaw6', 'des_commenti', 'ins_esercizio', 'des_esercizio_2', 'num_kg_mancanti_ob', 'num_lv',
            'perc_irt_w1', 'perc_irt_w2', 'perc_irt_w3', 'perc_irt_w4', 'perc_irt_w5', 'perc_irt_w6',
            'num_ins6', 'num_peso_bilanciere', 'des_note_immagine', 'des_note_gen_attr', 'des_note_attrezzo'
          ];
          
          fieldsToPreserve.forEach(field => {
            if (backupRecord[field] !== undefined && backupRecord[field] !== '') {
              record[field] = backupRecord[field];
            }
          });
          
          // Preserviamo l'ID del documento originale
          record._targetDocId = backupRecord.id;
          mergeCount++;
        } else {
          newRecordsFor66++;
        }
      }
      
      tutteLeRigheValide.push(record);
    }
  }

  const totaleDaImportare = tutteLeRigheValide.length;
  console.log(`CSV letto: ${totaleDaImportare} righe valide.`);
  console.log(` - Record di Gabriele Belmonte (Scheda 66) uniti/preservati: ${mergeCount}`);
  console.log(` - Record nuovi aggiunti a Gabriele Belmonte (Scheda 66): ${newRecordsFor66}`);
  
  console.log(`\n--- FASE 4: Caricamento su Firestore...`);
  
  let currentBatch = db.batch();
  let operationCounter = 0;
  let batchCounter = 0;
  
  for (let i = 0; i < totaleDaImportare; i++) {
    const item = tutteLeRigheValide[i];
    let docRef;
    
    if (item._targetDocId) {
      docRef = db.collection(NOME_COLLEZIONE).doc(item._targetDocId);
      delete item._targetDocId; // Rimuoviamo la chiave temporanea
    } else {
      docRef = db.collection(NOME_COLLEZIONE).doc();
    }
    
    currentBatch.set(docRef, item);
    operationCounter++;
    
    if (operationCounter === 500 || i === totaleDaImportare - 1) {
      batchCounter++;
      console.log(`Caricamento blocco #${batchCounter}... (salvati ${i + 1} di ${totaleDaImportare})`);
      
      try {
        await currentBatch.commit();
      } catch (error) {
        console.error(`Errore nel blocco ${batchCounter}:`, error);
        await sleep(1000);
        await currentBatch.commit();
      }
      
      currentBatch = db.batch();
      operationCounter = 0;
      await sleep(300);
    }
  }
  
  console.log(`\n🎉 IMPORTAZIONE COMPLETATA! ${totaleDaImportare} record caricati con successo!`);
}

async function esegui() {
  const startTime = Date.now();
  try {
    await svuotaCollezione();
    await smartImport();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nTempo totale impiegato: ${duration} secondi.`);
    process.exit(0);
  } catch (err) {
    console.error("\n❌ ERRORE CRITICO:", err);
    process.exit(1);
  }
}

esegui();
