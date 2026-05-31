const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const NOME_COLLEZIONE = 'STORYBOARD';

// Funzione di utilità per dormire (pausa per evitare limitazioni di Google)
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
    
    // Piccola pausa per stabilità
    await sleep(200);
    snap = await collectionRef.limit(500).get();
  }
  
  console.log(`🎉 Collezione '${NOME_COLLEZIONE}' svuotata completamente!`);
}

async function importaRecordValidi() {
  console.log(`\n--- FASE 2: Lettura e validazione del CSV (Riga per Riga)...`);
  const tutteLeRigheValide = [];
  
  try {
    const content = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf8');
    const lines = content.split('\n');
    
    const headers = lines[0].replace(/"/g, '').split(';').map(h => h.replace(/^\uFEFF/, '').trim());
    
    const urlNormalIndices = [];
    headers.forEach((h, idx) => {
      if (h === 'UrlNormal') {
        urlNormalIndices.push(idx);
      }
    });
    
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
        tutteLeRigheValide.push(record);
      }
    }
    
    const totaleDaImportare = tutteLeRigheValide.length;
    console.log(`\nCSV letto con successo: trovate ${totaleDaImportare} righe valide da importare!`);
    
    let currentBatch = db.batch();
    let operationCounter = 0;
    let batchCounter = 0;
    
    for (let i = 0; i < totaleDaImportare; i++) {
      const docRef = db.collection(NOME_COLLEZIONE).doc(); // Nuovo ID casuale
      currentBatch.set(docRef, tutteLeRigheValide[i]);
      operationCounter++;
      
      if (operationCounter === 500 || i === totaleDaImportare - 1) {
        batchCounter++;
        console.log(`Caricamento blocco #${batchCounter}... (salvati ${i + 1} di ${totaleDaImportare})`);
        
        try {
          await currentBatch.commit();
        } catch (error) {
          console.error(`Errore nel blocco ${batchCounter}:`, error);
          // Riprova una volta se fallisce
          await sleep(1000);
          await currentBatch.commit();
        }
        
        currentBatch = db.batch();
        operationCounter = 0;
        // Pausa di 300ms tra i blocchi per stabilità dell'API
        await sleep(300);
      }
    }
    
    console.log(`\n🎉 IMPORTAZIONE COMPLETATA! ${totaleDaImportare} record validi caricati con successo in Firebase!`);
  } catch (err) {
    console.error("Errore durante l'importazione:", err);
    throw err;
  }
}

async function esegui() {
  const startTime = Date.now();
  try {
    await svuotaCollezione();
    await importaRecordValidi();
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(`\nTempo totale impiegato: ${duration} secondi.`);
    process.exit(0);
  } catch (err) {
    console.error("\n❌ ERRORE CRITICO:", err);
    process.exit(1);
  }
}

esegui();
