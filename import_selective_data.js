const admin = require('firebase-admin');
const fs = require('fs');

// 1. Inizializzazione argomenti da riga di comando
const args = process.argv.slice(2);
const isCommit = args.includes('--commit');
const isSimula = !isCommit || args.includes('--simula');

console.log(`=== Sincronizzazione Selettiva da CSV a Firestore ===`);
console.log(`Modalità: ${isCommit ? '🔥 SCRITTURA REALE (--commit)' : '🛡️ SIMULAZIONE (--simula / default)'}\n`);

// 2. Inizializzazione Firebase Admin SDK
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// Funzione helper per dividere le operazioni in lotti (max 500 per batch in Firestore)
async function commitBatchOperations(operations) {
  let currentBatch = db.batch();
  let counter = 0;
  let batchIndex = 0;

  for (const op of operations) {
    if (op.type === 'set') {
      currentBatch.set(op.ref, op.data, { merge: op.merge || false });
    } else if (op.type === 'delete') {
      currentBatch.delete(op.ref);
    }
    counter++;

    if (counter === 500) {
      batchIndex++;
      console.log(`[Firestore] Invio blocco #_${batchIndex}...`);
      await currentBatch.commit();
      currentBatch = db.batch();
      counter = 0;
    }
  }

  if (counter > 0) {
    batchIndex++;
    console.log(`[Firestore] Invio blocco finale #_${batchIndex}...`);
    await currentBatch.commit();
  }
}

function parseTimestampToMs(tsVal) {
  if (!tsVal) return 0;
  if (typeof tsVal === 'object') {
    if (typeof tsVal.toMillis === 'function') return tsVal.toMillis();
    if (tsVal.seconds !== undefined) return tsVal.seconds * 1000;
    if (tsVal._seconds !== undefined) return tsVal._seconds * 1000;
    if (typeof tsVal.toDate === 'function') return tsVal.toDate().getTime();
  }
  if (typeof tsVal === 'number') return tsVal;
  let str = String(tsVal).trim();
  if (!str) return 0;

  // Formato DD/MM/YYYY o DD/MM/YYYY HH:mm:ss (italiano)
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const parts = str.split(' ');
    const dateParts = parts[0].split('/');
    const day = parseInt(dateParts[0], 10);
    const month = parseInt(dateParts[1], 10) - 1;
    const year = parseInt(dateParts[2], 10);
    let hours = 0, minutes = 0, seconds = 0;
    if (parts[1]) {
      const timeParts = parts[1].split(':');
      hours = parseInt(timeParts[0] || '0', 10);
      minutes = parseInt(timeParts[1] || '0', 10);
      seconds = parseInt(timeParts[2] || '0', 10);
    }
    const d = new Date(year, month, day, hours, minutes, seconds);
    return isNaN(d.getTime()) ? 0 : d.getTime();
  }

  // Formato YYYY-MM-DD o ISO
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    if (str.includes(' ') && !str.includes('T')) {
      str = str.replace(' ', 'T');
    }
    const parsed = Date.parse(str);
    return isNaN(parsed) ? 0 : parsed;
  }

  const parsed = Date.parse(str);
  return isNaN(parsed) ? 0 : parsed;
}


function getRecordLatestTimestamp(record) {
  const candidateFields = [
    'timestamp_ute', 'timestamp',
    'end6_wo', 'end5_wo', 'end4_wo', 'end3_wo', 'end2_wo', 'end_wo',
    'start6_wo', 'start5_wo', 'start4_wo', 'start3_wo', 'start2_wo', 'start_wo'
  ];
  let maxMs = 0;
  for (const f of candidateFields) {
    const ms = parseTimestampToMs(record[f]);
    if (ms > maxMs) maxMs = ms;
  }
  return maxMs;
}

function shouldCsvOverrideFirestore(csvRec, fsData) {
  const csvTs = getRecordLatestTimestamp(csvRec);
  const fsTs = getRecordLatestTimestamp(fsData);

  // 1. Se il timestamp nel CSV è strettamente più recente di quello su Firestore
  if (csvTs > 0 && csvTs > fsTs) {
    return true;
  }

  // 2. Se il CSV possiede dati di completamento (cmp1..6 = '1') che Firestore NON possiede
  for (let w = 1; w <= 6; w++) {
    const cmpField = `cmp${w}`;
    const csvCmp = String(csvRec[cmpField] || '').trim();
    const fsCmp = String(fsData[cmpField] || '').trim();
    const isCsvCmpDone = csvCmp === '1' || csvCmp.toLowerCase() === 'true';
    const isFsCmpDone = fsCmp === '1' || fsCmp.toLowerCase() === 'true';

    if (isCsvCmpDone && !isFsCmpDone) {
      return true;
    }
  }

  return false;
}

// Funzione helper per verificare se due record sono identici
function areRecordsEqual(rec1, rec2) {
  const keys1 = Object.keys(rec1);
  const keys2 = Object.keys(rec2);
  const allKeys = new Set([...keys1, ...keys2]);
  
  for (const key of allKeys) {
    if (key === 'timestamp' || key === 'timestamp_ute') continue; // Ignora i timestamp automatici
    const val1 = String(rec1[key] !== undefined && rec1[key] !== null ? rec1[key] : '').trim();
    const val2 = String(rec2[key] !== undefined && rec2[key] !== null ? rec2[key] : '').trim();
    if (val1 !== val2) {
      return false;
    }
  }
  return true;
}

const fieldsToPreserve = [
  'ins_week1', 'ins_week2', 'ins_week3', 'ins_week4', 'ins_week5', 'ins_week6',
  'reps_week1', 'reps_week2', 'reps_week3', 'reps_week4', 'reps_week5', 'reps_week6',
  'cmp1', 'cmp2', 'cmp3', 'cmp4', 'cmp5', 'cmp6',
  'timestamp', 'timestamp_ute',
  'start_wo', 'end_wo', 'start2_wo', 'end2_wo', 'start3_wo', 'end3_wo', 'start4_wo', 'end4_wo', 'start5_wo', 'end5_wo', 'start6_wo', 'end6_wo',
  'num_faticaw6', 'des_commenti',
  'perc_irt_w1', 'perc_irt_w2', 'perc_irt_w3', 'perc_irt_w4', 'perc_irt_w5', 'perc_irt_w6',
  'num_ins6', 'num_peso_bilanciere'
];

async function run() {
  // 3. Caricamento Firestore in memoria
  console.log("Fase 1: Caricamento database Firestore in memoria...");
  const snap = await db.collection('STORYBOARD').get();
  console.log(`Scaricati ${snap.size} record totali da Firestore.`);

  const firestoreMap = {};
  snap.forEach(doc => {
    const data = doc.data();
    const idCliente = String(data.ID_cliente || '').trim();
    
    // Escludiamo Gabriele (1) e Jessica (57)
    if (idCliente !== '1' && idCliente !== '57') {
      const numScheda = String(data.num_scheda || '').trim();
      const giorno = String(data.des_giorno || '').trim().toUpperCase();
      const rigaGiorno = String(data.num_riga_giorno || '').trim();
      const key = `${idCliente}_${numScheda}_${giorno}_${rigaGiorno}`;
      firestoreMap[key] = { id: doc.id, ref: doc.ref, data };
    }
  });
  console.log(`Indicizzati ${Object.keys(firestoreMap).length} record di atleti attivi da Firestore.`);

  // 4. Parsing del file CSV
  console.log("\nFase 2: Lettura e analisi del file WOAPP_STORYBOARD.csv...");
  if (!fs.existsSync('WOAPP_STORYBOARD.csv')) {
    console.error("Errore: Il file 'WOAPP_STORYBOARD.csv' non esiste nella directory corrente.");
    process.exit(1);
  }
  const content = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].replace(/"/g, '').split(';').map(h => h.replace(/^\uFEFF/, '').trim());

  // Rilevamento di tutte le colonne UrlNormal
  const urlNormalIndices = [];
  headers.forEach((h, idx) => {
    if (h === 'UrlNormal') {
      urlNormalIndices.push(idx);
    }
  });
  console.log(`Indici trovati per la colonna UrlNormal:`, urlNormalIndices);

  let totalCsvRows = 0;
  let skippedExcludedCount = 0;
  let skippedAlignedCount = 0;
  let toUpdateCount = 0;
  let toInsertCount = 0;

  const operations = [];
  const changesSummary = {}; // Per stampare statistiche per atleta

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    totalCsvRows++;

    const cells = line.split(';');
    const record = {};

    headers.forEach((header, idx) => {
      let cellVal = cells[idx] ? cells[idx].replace(/^"/, '').replace(/"$/, '').trim() : '';

      // GESTIONE SPECIALE DUPLICATO UrlNormal
      if (header === 'UrlNormal' && urlNormalIndices.length > 0) {
        const firstUrlVal = cells[urlNormalIndices[0]] ? cells[urlNormalIndices[0]].replace(/^"/, '').replace(/"$/, '').trim() : '';
        const secondUrlVal = urlNormalIndices[1] && cells[urlNormalIndices[1]] ? cells[urlNormalIndices[1]].replace(/^"/, '').replace(/"$/, '').trim() : '';

        if (firstUrlVal.startsWith('http')) {
          cellVal = firstUrlVal;
        } else if (secondUrlVal.startsWith('http')) {
          cellVal = secondUrlVal;
        } else {
          cellVal = firstUrlVal || secondUrlVal || '';
        }
      }

      if (header) {
        record[header] = cellVal;
      }
    });

    // Mappatura speciale des_week1Estratto se presente
    if (record['des_week1Estratto'] && !record['des_week1']) {
      record['des_week1'] = record['des_week1Estratto'];
    }

    const idCliente = record['ID_cliente'];
    const numScheda = record['num_scheda'];
    const giorno = String(record['des_giorno'] || '').trim().toUpperCase();
    const rigaGiorno = String(record['num_riga_giorno'] || '').trim();

    if (!idCliente || !numScheda) continue;

    // Filtro esclusioni
    if (idCliente === '1' || idCliente === '57') {
      skippedExcludedCount++;
      continue;
    }

    if (!changesSummary[idCliente]) {
      changesSummary[idCliente] = { updated: 0, inserted: 0, skipped: 0 };
    }

    const key = `${idCliente}_${numScheda}_${giorno}_${rigaGiorno}`;
    const existing = firestoreMap[key];

    if (existing) {
      // Record esistente: eseguiamo lo Smart Merge
      const mergedRecord = { ...record };
      const csvIsNewerOrMoreComplete = shouldCsvOverrideFirestore(record, existing.data);
      
      // Preserva i dati dell'atleta se già popolati su Firestore solo se Firestore è più recente o più completo
      if (!csvIsNewerOrMoreComplete) {
        fieldsToPreserve.forEach(field => {
          if (existing.data[field] !== undefined && existing.data[field] !== '') {
            mergedRecord[field] = existing.data[field];
          }
        });
      }

      // Protezione ulteriore: Se l'UrlNormal estratto dal CSV è vuoto ma Firestore ne possiede già uno valido, manteniamo quello di Firestore
      if (!mergedRecord.UrlNormal && existing.data.UrlNormal && existing.data.UrlNormal.startsWith('http')) {
        mergedRecord.UrlNormal = existing.data.UrlNormal;
      }

      // Confronto Delta: scriviamo solo se c'è una reale differenza
      if (!areRecordsEqual(mergedRecord, existing.data)) {
        if (toUpdateCount < 5) {
          console.log(`\nDiff per chiave ${key} (Es: ${existing.data.des_esercizio || record.des_esercizio}):`);
          const diffKeys = new Set([...Object.keys(mergedRecord), ...Object.keys(existing.data)]);
          for (const k of diffKeys) {
            if (k === 'timestamp' || k === 'timestamp_ute') continue;
            const v1 = String(mergedRecord[k] !== undefined && mergedRecord[k] !== null ? mergedRecord[k] : '').trim();
            const v2 = String(existing.data[k] !== undefined && existing.data[k] !== null ? existing.data[k] : '').trim();
            if (v1 !== v2) {
              console.log(`  - Campo [${k}]: CSV='${v1}' vs Firestore='${v2}'`);
            }
          }
        }
        operations.push({
          ref: existing.ref,
          type: 'set',
          data: mergedRecord,
          merge: true
        });
        toUpdateCount++;
        changesSummary[idCliente].updated++;
      } else {
        skippedAlignedCount++;
        changesSummary[idCliente].skipped++;
      }
    } else {
      // Record nuovo: lo creiamo su Firestore
      const docRef = db.collection('STORYBOARD').doc();
      operations.push({
        ref: docRef,
        type: 'set',
        data: record
      });
      toInsertCount++;
      changesSummary[idCliente].inserted++;
    }
  }

  console.log(`\n=== STATISTICHE DI ANALISI ===`);
  console.log(`Righe totali nel CSV: ${totalCsvRows}`);
  console.log(`Record esclusi (Atleti 1 e 57): ${skippedExcludedCount}`);
  console.log(`Record già allineati (scrittura saltata): ${skippedAlignedCount}`);
  console.log(`Record da aggiornare (prescrizioni nuove o log da ripristinare): ${toUpdateCount}`);
  console.log(`Record da creare (nuovi): ${toInsertCount}`);
  console.log(`Operazioni di scrittura totali stimate: ${operations.length}`);

  console.log(`\nRipartizione modifiche per Atleta:`);
  for (const [id, stats] of Object.entries(changesSummary)) {
    if (stats.updated > 0 || stats.inserted > 0) {
      console.log(`  - ID Atleta '${id}': ${stats.updated} aggiornati, ${stats.inserted} nuovi (saltati ${stats.skipped} già allineati)`);
    }
  }

  // 5. Esecuzione reale se richiesto
  if (isCommit) {
    if (operations.length === 0) {
      console.log("\n🎉 Nessuna scrittura necessaria. Il database è già completamente allineato!");
      process.exit(0);
    }
    console.log(`\nAvvio scrittura di ${operations.length} record su Firestore...`);
    await commitBatchOperations(operations);
    console.log(`\n🎉 Sincronizzazione reale completata con successo!`);
  } else {
    console.log(`\n🛡️ [SIMULAZIONE] Nessun dato è stato modificato su Firestore.`);
    console.log(`Per applicare queste modifiche reali, esegui lo script con: node import_selective_data.js --commit`);
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Errore critico durante la sincronizzazione:", err);
  process.exit(1);
});