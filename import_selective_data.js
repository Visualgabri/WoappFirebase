const admin = require('firebase-admin');
const fs = require('fs');

// 1. Inizializzazione argomenti da riga di comando
const args = process.argv.slice(2);
const isCommit = args.includes('--commit');
const isSimula = !isCommit || args.includes('--simula');

console.log(`=== Sincronizzazione Selettiva da CSV a Firestore (Versione Protetta) ===`);
console.log(`Modalità: ${isCommit ? '🔥 SCRITTURA REALE (--commit)' : '🛡️ SIMULAZIONE (--simula / default)'}\n`);

// 2. Inizializzazione Firebase Admin SDK
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// 3. Definizione Clienti in Scope
// 4 clienti attivi su Firebase + clienti con nuove schede nel CSV
const TARGET_CLIENTS = new Set(['245', '304', '312', '321', '125', '188', '237', '243', '249', '269', '297']);

// Gabriele (1) e Jessica (57) restano tassativamente ESCLUSI
const EXCLUDED_CLIENTS = new Set(['1', '57']);

// Campi compilati dall'atleta durante l'allenamento da PRESERVARE AL 100%
const athleteDataFields = [
  'ins_week1', 'ins_week2', 'ins_week3', 'ins_week4', 'ins_week5', 'ins_week6',
  'reps_week1', 'reps_week2', 'reps_week3', 'reps_week4', 'reps_week5', 'reps_week6',
  'cmp1', 'cmp2', 'cmp3', 'cmp4', 'cmp5', 'cmp6',
  'timestamp_ute',
  'start_wo', 'end_wo', 'start2_wo', 'end2_wo', 'start3_wo', 'end3_wo', 'start4_wo', 'end4_wo', 'start5_wo', 'end5_wo', 'start6_wo', 'end6_wo',
  'num_faticaw6', 'des_commenti',
  'perc_irt_w1', 'perc_irt_w2', 'perc_irt_w3', 'perc_irt_w4', 'perc_irt_w5', 'perc_irt_w6',
  'num_ins6', 'num_peso_bilanciere'
];

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
      console.log(`[Firestore] Invio blocco #${batchIndex} (500 operazioni)...`);
      await currentBatch.commit();
      currentBatch = db.batch();
      counter = 0;
    }
  }

  if (counter > 0) {
    batchIndex++;
    console.log(`[Firestore] Invio blocco finale #${batchIndex} (${counter} operazioni)...`);
    await currentBatch.commit();
  }
}

// Funzione helper per verificare se due record sono identici nei dati reali (ignora campi tecnici)
function areRecordsEqual(rec1, rec2) {
  const ignoredKeys = new Set(['timestamp', 'timestamp_ute', 'des_week1Estratto', 'id']);
  const allKeys = new Set([...Object.keys(rec1), ...Object.keys(rec2)]);
  
  for (const key of allKeys) {
    if (ignoredKeys.has(key)) continue;
    const val1 = String(rec1[key] !== undefined && rec1[key] !== null ? rec1[key] : '').trim();
    const val2 = String(rec2[key] !== undefined && rec2[key] !== null ? rec2[key] : '').trim();
    if (val1 !== val2) {
      return false;
    }
  }
  return true;
}

function normalize(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

async function run() {
  console.log(`Clienti in scope per l'importazione: ${Array.from(TARGET_CLIENTS).join(', ')}`);
  console.log(`Clienti esclusi tassativamente: ${Array.from(EXCLUDED_CLIENTS).join(', ')}\n`);

  // Fase 1: Caricamento database Firestore in memoria
  console.log("Fase 1: Caricamento database Firestore in memoria...");
  const snap = await db.collection('STORYBOARD').get();
  console.log(`Scaricati ${snap.size} record totali da Firestore.`);

  // Mappatura multi-record per gestire in sicurezza superserie o righe duplicate
  const fsMultiMap = {};
  snap.forEach(doc => {
    const data = doc.data();
    const idCliente = String(data.ID_cliente || '').trim();
    
    if (TARGET_CLIENTS.has(idCliente) && !EXCLUDED_CLIENTS.has(idCliente)) {
      const numScheda = String(data.num_scheda || '').trim();
      const giorno = String(data.des_giorno || '').trim().toUpperCase();
      const rigaGiorno = String(data.num_riga_giorno || '').trim();
      const baseKey = `${idCliente}_${numScheda}_${giorno}_${rigaGiorno}`;
      
      if (!fsMultiMap[baseKey]) fsMultiMap[baseKey] = [];
      fsMultiMap[baseKey].push({ id: doc.id, ref: doc.ref, data });
    }
  });

  const indexedCount = Object.values(fsMultiMap).reduce((acc, arr) => acc + arr.length, 0);
  console.log(`Indicizzati ${indexedCount} record Firestore per i clienti in scope.`);

  // Fase 2: Lettura e analisi del file CSV
  console.log("\nFase 2: Lettura e analisi del file WOAPP_STORYBOARD.csv...");
  if (!fs.existsSync('WOAPP_STORYBOARD.csv')) {
    console.error("Errore: Il file 'WOAPP_STORYBOARD.csv' non esiste nella directory corrente.");
    process.exit(1);
  }

  const content = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].replace(/"/g, '').split(';').map(h => h.replace(/^\uFEFF/, '').trim());

  const urlNormalIndices = [];
  headers.forEach((h, idx) => {
    if (h === 'UrlNormal') urlNormalIndices.push(idx);
  });

  let totalCsvRows = 0;
  let skippedExcludedCount = 0;
  let skippedOutOfScopeCount = 0;
  let skippedAlignedCount = 0;
  let toUpdateCount = 0;
  let toInsertCount = 0;

  const operations = [];
  const changesSummary = {};
  const matchedDocIds = new Set();

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    totalCsvRows++;

    const cells = line.split(';');
    const record = {};

    headers.forEach((header, idx) => {
      let cellVal = cells[idx] ? cells[idx].replace(/^"/, '').replace(/"$/, '').trim() : '';

      // Gestione speciale duplicato colonna UrlNormal
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

    if (record['des_week1Estratto'] && !record['des_week1']) {
      record['des_week1'] = record['des_week1Estratto'];
    }

    const idCliente = record['ID_cliente'];
    const numScheda = record['num_scheda'];
    const giorno = String(record['des_giorno'] || '').trim().toUpperCase();
    const rigaGiorno = String(record['num_riga_giorno'] || '').trim();
    const exName = record['des_esercizio'] || '';
    const numRiga = record['num_riga'] || '';

    if (!idCliente || !numScheda) continue;

    // Filtro esclusioni esplicite
    if (EXCLUDED_CLIENTS.has(idCliente)) {
      skippedExcludedCount++;
      continue;
    }

    // Filtro clienti fuori scope
    if (!TARGET_CLIENTS.has(idCliente)) {
      skippedOutOfScopeCount++;
      continue;
    }

    if (!changesSummary[idCliente]) {
      changesSummary[idCliente] = { updated: 0, inserted: 0, skipped: 0 };
    }

    const baseKey = `${idCliente}_${numScheda}_${giorno}_${rigaGiorno}`;
    const candidates = fsMultiMap[baseKey] || [];

    // Ricerca del match perfetto per evitare qualsiasi scambio di esercizi (es. superserie)
    let matched = null;
    if (candidates.length === 1 && !matchedDocIds.has(candidates[0].id)) {
      matched = candidates[0];
    } else if (candidates.length > 1) {
      if (numRiga) {
        matched = candidates.find(c => !matchedDocIds.has(c.id) && String(c.data.num_riga || '').trim() === String(numRiga).trim());
      }
      if (!matched && exName) {
        matched = candidates.find(c => !matchedDocIds.has(c.id) && normalize(c.data.des_esercizio) === normalize(exName));
      }
      if (!matched) {
        matched = candidates.find(c => !matchedDocIds.has(c.id));
      }
    }

    if (matched) {
      matchedDocIds.add(matched.id);
      const mergedRecord = { ...record };

      // REGOLA D'ORO DI PROTEZIONE: I dati inseriti dall'atleta in Firestore NON VENGONO MAI SOVRASCRITTI
      athleteDataFields.forEach(field => {
        const fsVal = matched.data[field];
        if (fsVal !== undefined && fsVal !== null && String(fsVal).trim() !== '') {
          mergedRecord[field] = fsVal;
        }
      });

      // Protezione UrlNormal: Se il CSV è vuoto ma Firestore possiede un'immagine valida, mantienila
      if (!mergedRecord.UrlNormal && matched.data.UrlNormal && matched.data.UrlNormal.startsWith('http')) {
        mergedRecord.UrlNormal = matched.data.UrlNormal;
      }

      // Protezione configurazioni esercizio se valorizzate su Firestore ma vuote nel CSV
      ['step_kg', 'flg_corpo_libero'].forEach(f => {
        if (!mergedRecord[f] && matched.data[f]) {
          mergedRecord[f] = matched.data[f];
        }
      });

      // Confronto Delta (ignora campi tecnici come des_week1Estratto e id)
      if (!areRecordsEqual(mergedRecord, matched.data)) {
        operations.push({
          ref: matched.ref,
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
      // Record nuovo (nuova scheda o esercizio nuovo): creazione sicura su Firestore
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
  console.log(`Record esclusi tassativamente (Atleti 1 e 57): ${skippedExcludedCount}`);
  console.log(`Record saltati (altri clienti non in scope): ${skippedOutOfScopeCount}`);
  console.log(`Record già allineati (scrittura saltata): ${skippedAlignedCount}`);
  console.log(`Record da aggiornare (prescrizioni nuove o dati mancanti): ${toUpdateCount}`);
  console.log(`Record da creare (nuove schede): ${toInsertCount}`);
  console.log(`Operazioni di scrittura totali stimate: ${operations.length}`);

  console.log(`\nRipartizione modifiche per Atleta:`);
  for (const [id, stats] of Object.entries(changesSummary)) {
    console.log(`  - ID Atleta '${id}': ${stats.inserted} nuovi, ${stats.updated} aggiornati (saltati ${stats.skipped} già allineati)`);
  }

  // 5. Esecuzione reale se richiesto
  if (isCommit) {
    if (operations.length === 0) {
      console.log("\n🎉 Nessuna scrittura necessaria. Il database è già completamente allineato!");
      process.exit(0);
    }
    console.log(`\nAvvio scrittura sicura di ${operations.length} record su Firestore...`);
    await commitBatchOperations(operations);
    console.log(`\n🎉 Sincronizzazione reale completata con successo e dati atleti preservati al 100%!`);
  } else {
    console.log(`\n🛡️ [SIMULAZIONE] Nessun dato è stato modificato su Firestore.`);
    console.log(`Per applicare queste modifiche reali in sicurezza, esegui: node import_selective_data.js --commit`);
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Errore critico durante la sincronizzazione:", err);
  process.exit(1);
});