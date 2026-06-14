const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const XLSX = require('xlsx');

// 1. Parsing argomenti da riga di comando
const args = process.argv.slice(2);
let idCliente = null;
let numScheda = null;
let tipo = null; // 'Nuovo' o 'Refresh'

args.forEach(arg => {
  if (arg.startsWith('--idCliente=')) {
    idCliente = arg.split('=')[1].trim();
  } else if (arg.startsWith('--numScheda=')) {
    numScheda = arg.split('=')[1].trim();
  } else if (arg.startsWith('--tipo=')) {
    tipo = arg.split('=')[1].trim();
  }
});

if (!idCliente || !numScheda || !tipo) {
  console.error("[Import Ponte] Errore: Parametri obbligatori mancanti.");
  console.error("Uso: node import_ponte.js --idCliente=<ID> --numScheda=<NUM> --tipo=<Nuovo|Refresh>");
  process.exit(1);
}

if (tipo !== 'Nuovo' && tipo !== 'Refresh') {
  console.error("[Import Ponte] Errore: Il parametro --tipo deve essere 'Nuovo' o 'Refresh'.");
  process.exit(1);
}

const EXCEL_PATH = "C:\\Users\\visua\\Google Drive\\WoApp_ponte.xlsx";

if (!fs.existsSync(EXCEL_PATH)) {
  console.error(`[Import Ponte] Errore: Il file Excel '${EXCEL_PATH}' non esiste.`);
  process.exit(1);
}

// 2. Inizializzazione Firebase Admin SDK
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

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
      console.log(`[Import] Invio blocco #_${batchIndex}...`);
      await currentBatch.commit();
      currentBatch = db.batch();
      counter = 0;
    }
  }

  if (counter > 0) {
    batchIndex++;
    console.log(`[Import] Invio blocco finale #_${batchIndex}...`);
    await currentBatch.commit();
  }
}

function areRecordsEqual(rec1, rec2) {
  const keys1 = Object.keys(rec1);
  const keys2 = Object.keys(rec2);
  const allKeys = new Set([...keys1, ...keys2]);
  
  for (const key of allKeys) {
    if (key === 'timestamp') continue; // Salta il timestamp automatico di importazione
    const val1 = String(rec1[key] !== undefined && rec1[key] !== null ? rec1[key] : '').trim();
    const val2 = String(rec2[key] !== undefined && rec2[key] !== null ? rec2[key] : '').trim();
    if (val1 !== val2) {
      return false;
    }
  }
  return true;
}

async function run() {
  console.log(`[Import Ponte] Avvio sincronizzazione: idCliente=${idCliente}, numScheda=${numScheda}, tipo=${tipo}`);
  console.log(`[Import Ponte] Lettura del file Excel: ${EXCEL_PATH}`);

  const workbook = XLSX.readFile(EXCEL_PATH);

  // === FASE 1: CLIENTE E METADATA ===
  console.log(`[Import Ponte] Elaborazione foglio 'CLIENTI'...`);
  const clientiSheet = workbook.Sheets['CLIENTI'];
  if (clientiSheet) {
    const clientiRows = XLSX.utils.sheet_to_json(clientiSheet, { defval: "" });
    if (clientiRows.length > 0) {
      const clientRow = clientiRows[0];
      const idClienteStr = String(clientRow.ID_cliente || idCliente).trim();

      // Aggiorna la lista atleti in METADATA/clienti
      const docRef = db.collection('METADATA').doc('clienti');
      const docSnap = await docRef.get();
      let listaAtleti = [];
      if (docSnap.exists) {
        listaAtleti = docSnap.data().lista || [];
      }
      if (!listaAtleti.includes(idClienteStr)) {
        listaAtleti.push(idClienteStr);
        listaAtleti.sort((a, b) => Number(a) - Number(b));
        await docRef.set({
          lista: listaAtleti,
          aggiornatoAl: new Date().toISOString()
        }, { merge: true });
        console.log(`[Import Ponte] Atleta ${idClienteStr} aggiunto/verificato in METADATA/clienti.`);
      }
    }
  }

  // === FASE 2: WORKOUT_T ===
  console.log(`[Import Ponte] Elaborazione foglio 'WORKOUT_T'...`);
  const wtSheet = workbook.Sheets['WORKOUT_T'];
  if (wtSheet) {
    const wtRows = XLSX.utils.sheet_to_json(wtSheet, { defval: "" });
    if (wtRows.length > 0) {
      const wtRecord = {};
      for (const [key, value] of Object.entries(wtRows[0])) {
        const cleanKey = key.trim().replace(/^\uFEFF/, '');
        wtRecord[cleanKey] = value !== undefined && value !== null ? String(value).trim() : '';
      }
      const docId = `${idCliente}_${numScheda}`;
      await db.collection('WORKOUT_T').doc(docId).set(wtRecord, { merge: true });
      console.log(`[Import Ponte] Sincronizzato testata WORKOUT_T per '${docId}'.`);
    }
  }

  // === FASE 3: STORYBOARD (WORKOUT_R) ===
  console.log(`[Import Ponte] Elaborazione foglio 'WORKOUT_R'...`);
  const wrSheet = workbook.Sheets['WORKOUT_R'];
  if (!wrSheet) {
    console.error("[Import Ponte] Errore: Il foglio 'WORKOUT_R' non è presente nel file Excel.");
    process.exit(1);
  }

  const wrRows = XLSX.utils.sheet_to_json(wrSheet, { defval: "" });
  console.log(`[Import Ponte] Record letti da Excel: ${wrRows.length}`);

  const newExcelRecords = wrRows.map(row => {
    const cleanRow = {};
    for (const [key, value] of Object.entries(row)) {
      const cleanKey = key.trim().replace(/^\uFEFF/, '');
      cleanRow[cleanKey] = value !== undefined && value !== null ? String(value).trim() : '';
    }
    return cleanRow;
  });

  const storyboardRef = db.collection('STORYBOARD');
  console.log(`[Import Ponte] Recupero record esistenti in Firestore per cliente ${idCliente} e scheda ${numScheda}...`);
  const querySnap = await storyboardRef
    .where('ID_cliente', '==', String(idCliente))
    .where('num_scheda', '==', String(numScheda))
    .get();

  console.log(`[Import Ponte] Record esistenti su Firestore: ${querySnap.size}`);

  const operations = [];

  if (tipo === 'Nuovo') {
    console.log("[Import Ponte] Modalità 'Nuovo': Eliminazione totale dei vecchi record...");
    querySnap.forEach(docSnap => {
      operations.push({
        ref: docSnap.ref,
        type: 'delete'
      });
    });

    console.log("[Import Ponte] Preparazione nuovi inserimenti...");
    newExcelRecords.forEach(record => {
      const docRef = storyboardRef.doc();
      operations.push({
        ref: docRef,
        type: 'set',
        data: record
      });
    });
  } else if (tipo === 'Refresh') {
    console.log("[Import Ponte] Modalità 'Refresh': Allineamento intelligente...");
    
    // Mappa dei record esistenti per des_giorno + num_riga_giorno
    const existingDocsMap = {};
    querySnap.forEach(docSnap => {
      const data = docSnap.data();
      const giorno = String(data.des_giorno || '').trim().toUpperCase();
      const rigaGiorno = String(data.num_riga_giorno || '').trim();
      if (giorno && rigaGiorno) {
        existingDocsMap[`${giorno}_${rigaGiorno}`] = {
          id: docSnap.id,
          ref: docSnap.ref,
          data: data
        };
      }
    });

    const processedDocIds = new Set();
    let updatedCount = 0;
    let skippedCount = 0;
    let insertedCount = 0;
    let replacedCount = 0;

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

    newExcelRecords.forEach(excelRec => {
      const giorno = String(excelRec.des_giorno || '').trim().toUpperCase();
      const rigaGiorno = String(excelRec.num_riga_giorno || '').trim();
      const key = `${giorno}_${rigaGiorno}`;
      
      const existing = existingDocsMap[key];
      if (existing) {
        processedDocIds.add(existing.id);
        const cleanExistingEx = String(existing.data.des_esercizio || '').trim().toLowerCase();
        const cleanNewEx = String(excelRec.des_esercizio || '').trim().toLowerCase();
        
        let mergedRecord = { ...excelRec };
        let shouldWrite = false;
        
        if (cleanExistingEx === cleanNewEx) {
          // 1. Stesso esercizio: preserviamo i log dell'atleta
          fieldsToPreserve.forEach(field => {
            if (existing.data[field] !== undefined && existing.data[field] !== '') {
              mergedRecord[field] = existing.data[field];
            }
          });
          
          // Verifica se ci sono reali cambiamenti (esclusi timestamp) per evitare di sprecare quote di scrittura
          if (!areRecordsEqual(mergedRecord, existing.data)) {
            shouldWrite = true;
            updatedCount++;
          } else {
            skippedCount++;
          }
        } else {
          // 2. Esercizio differente: sovrascriviamo e puliamo i log dell'atleta
          console.log(`  [Sostituzione] Riga ${key}: '${existing.data.des_esercizio}' -> '${excelRec.des_esercizio}'. Log atleta ripuliti.`);
          shouldWrite = true;
          replacedCount++;
        }
        
        if (shouldWrite) {
          operations.push({
            ref: existing.ref,
            type: 'set',
            data: mergedRecord
          });
        }
      } else {
        // 3. Nuovo esercizio non presente
        const docRef = storyboardRef.doc();
        operations.push({
          ref: docRef,
          type: 'set',
          data: excelRec
        });
        insertedCount++;
      }
    });

    // 4. Rimozione degli esercizi rimossi dall'Excel
    let deletedCount = 0;
    querySnap.forEach(docSnap => {
      if (!processedDocIds.has(docSnap.id)) {
        const data = docSnap.data();
        console.log(`  [Rimozione] Riga ${data.des_giorno}_${data.num_riga_giorno}: Esercizio '${data.des_esercizio}' eliminato.`);
        operations.push({
          ref: docSnap.ref,
          type: 'delete'
        });
        deletedCount++;
      }
    });

    console.log(`[Import Ponte] Punti di riepilogo per il Refresh:`);
    console.log(` - Record già allineati (scrittura saltata): ${skippedCount}`);
    console.log(` - Record aggiornati (prescrizioni cambiate, log preservati): ${updatedCount}`);
    console.log(` - Record aggiornati con cambio es. (log puliti): ${replacedCount}`);
    console.log(` - Nuovi record aggiunti: ${insertedCount}`);
    console.log(` - Vecchi record rimossi: ${deletedCount}`);
  }

  // === FASE 4: ESECUZIONE DELLE OPERAZIONI SU FIRESTORE ===
  console.log(`[Import Ponte] Esecuzione di ${operations.length} operazioni totali su Firestore...`);
  await commitBatchOperations(operations);
  console.log(`🎉 [Import Ponte] Sincronizzazione completata con successo!`);
  process.exit(0);
}

run().catch(err => {
  console.error("[Import Ponte] Errore critico durante la sincronizzazione:", err);
  process.exit(1);
});
