const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// 1. Inizializzazione argomenti da riga di comando
const args = process.argv.slice(2);
const isCommit = args.includes('--commit');
const isSimula = !isCommit || args.includes('--simula');

// Supporto per filtro singolo cliente da CLI, es: --client 269 o --client=269
let cliClientId = null;
const clientArgIdx = args.findIndex(a => a === '--client' || a === '--cliente');
if (clientArgIdx !== -1 && args[clientArgIdx + 1]) {
  cliClientId = args[clientArgIdx + 1];
} else {
  const inlineClientArg = args.find(a => a.startsWith('--client=') || a.startsWith('--cliente='));
  if (inlineClientArg) {
    cliClientId = inlineClientArg.split('=')[1];
  }
}

console.log(`=== Sincronizzazione Selettiva da CSV a Firestore (Versione Protetta) ===`);
console.log(`Modalità: ${isCommit ? '🔥 SCRITTURA REALE (--commit)' : '🛡️ SIMULAZIONE (--simula / default)'}`);
if (cliClientId) {
  console.log(`Filtro Atleta: 🎯 Solo ID '${cliClientId}'`);
}
console.log('');

// 2. Inizializzazione Firebase Admin SDK
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// 3. Definizione Clienti in Scope
// Default: 4 clienti attivi su Firebase + clienti con nuove schede nel CSV
const DEFAULT_CLIENTS = ['245', '304', '312', '321', '125', '188', '237', '243', '249', '269', '297'];
const TARGET_CLIENTS = cliClientId 
  ? new Set([String(cliClientId).trim()]) 
  : new Set(DEFAULT_CLIENTS);

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

// Funzione helper per verificare se due record STORYBOARD sono identici nei dati reali
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

// Helper per il parsing CSV robusto con gestione virgolette e ritorni a capo
function parseCSV(text) {
  const rows = [];
  let currentRow = [];
  let currentCell = '';
  let insideQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];
    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++;
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === ',' && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentCell.trim());
      if (currentRow.some(c => c.length > 0)) rows.push(currentRow);
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }
  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    rows.push(currentRow);
  }
  return rows;
}

function parseDateString(str) {
  if (!str) return null;
  str = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.substring(0, 10).split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const parts = str.split(' ')[0].split('/');
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  }
  const t = Date.parse(str);
  return !isNaN(t) ? new Date(t) : null;
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

// Caricamento del database WORKOUT_T da CSV (locale o Google Drive)
function loadWorkoutTCsvMap() {
  const possiblePaths = [
    path.join(__dirname, 'WORKOUT_T.csv'),
    'C:\\Users\\visua\\Google Drive\\WORKOUT_T.csv',
    path.join(__dirname, 'workout_t_from_google_sheet.csv')
  ];

  for (const p of possiblePaths) {
    if (fs.existsSync(p)) {
      try {
        console.log(`[WORKOUT_T] Caricamento dati da '${p}'...`);
        const text = fs.readFileSync(p, 'utf8');
        const rows = parseCSV(text);
        if (rows.length < 2) continue;
        const headers = rows[0].map(h => h.replace(/^"|"$/g, '').trim());
        const clientIdx = headers.indexOf('ID_cliente');
        const numSchedaIdx = headers.indexOf('num_scheda');
        if (clientIdx === -1 || numSchedaIdx === -1) continue;

        const map = new Map();
        for (let i = 1; i < rows.length; i++) {
          const r = rows[i];
          const cId = String(r[clientIdx] || '').trim();
          const sNum = String(r[numSchedaIdx] || '').trim();
          if (!cId || !sNum) continue;

          const rec = {};
          headers.forEach((h, colIdx) => {
            rec[h] = r[colIdx] !== undefined ? r[colIdx] : '';
          });
          map.set(`${cId}_${sNum}`, rec);
        }
        console.log(`[WORKOUT_T] Caricate ${map.size} testate da CSV.`);
        return map;
      } catch (err) {
        console.warn(`[WORKOUT_T] Errore lettura '${p}':`, err.message);
      }
    }
  }
  console.log(`[WORKOUT_T] Nessun file CSV WORKOUT_T trovato. Verrà usato il fallback sintetico.`);
  return new Map();
}

function areWorkoutTRecordsEqual(target, existing) {
  if (!existing) return false;
  const fieldsToCheck = [
    'dat_data', 'dat_scadenza', 'des_descrizione', 'des_note',
    'cod_tipo_avanz_scheda', 'ID_scheda', 'NomeCognomeTM'
  ];
  for (const f of fieldsToCheck) {
    const v1 = String(target[f] !== undefined && target[f] !== null ? target[f] : '').trim();
    const v2 = String(existing[f] !== undefined && existing[f] !== null ? existing[f] : '').trim();
    if (v1 !== v2) return false;
  }
  return true;
}

async function run() {
  console.log(`Clienti in scope per l'importazione: ${Array.from(TARGET_CLIENTS).join(', ')}`);
  console.log(`Clienti esclusi tassativamente: ${Array.from(EXCLUDED_CLIENTS).join(', ')}\n`);

  // Fase 1: Caricamento database Firestore in memoria
  console.log("Fase 1: Caricamento database Firestore in memoria...");
  let query = db.collection('STORYBOARD');
  if (cliClientId) {
    console.log(`Ottimizzazione lettura: carico solo i record per ID_cliente == '${cliClientId}'...`);
    query = query.where('ID_cliente', '==', String(cliClientId).trim());
  }
  const snap = await query.get();
  console.log(`Scaricati ${snap.size} record totali da Firestore STORYBOARD.`);

  // Mappatura multi-record per gestire in sicurezza superserie o righe duplicate
  const fsMultiMap = {};
  // Tiene traccia delle schede esistenti in Firestore per ogni cliente
  const existingSheetsPerClient = {};

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

      if (!existingSheetsPerClient[idCliente]) {
        existingSheetsPerClient[idCliente] = new Set();
      }
      if (numScheda) existingSheetsPerClient[idCliente].add(numScheda);
    }
  });

  const indexedCount = Object.values(fsMultiMap).reduce((acc, arr) => acc + arr.length, 0);
  console.log(`Indicizzati ${indexedCount} record Firestore per i clienti in scope.`);

  // Fase 2: Lettura e analisi del file CSV STORYBOARD
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

  // Dati per sintesi WORKOUT_T nel caso di schede nuove senza CSV testate
  const storyboardSheetsInfo = {}; // key: idCliente_numScheda -> { idScheda, desNote, minDate, athleteName }

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

    if (!existingSheetsPerClient[idCliente]) {
      existingSheetsPerClient[idCliente] = new Set();
    }
    existingSheetsPerClient[idCliente].add(numScheda);

    // Raccolta metadati per WORKOUT_T
    const sheetKey = `${idCliente}_${numScheda}`;
    if (!storyboardSheetsInfo[sheetKey]) {
      storyboardSheetsInfo[sheetKey] = { idScheda: '', desNote: '', minDate: null, athleteName: '' };
    }
    if (record['ID_scheda'] && !storyboardSheetsInfo[sheetKey].idScheda) {
      storyboardSheetsInfo[sheetKey].idScheda = String(record['ID_scheda']).trim();
    }
    if (record['des_note'] && !storyboardSheetsInfo[sheetKey].desNote) {
      storyboardSheetsInfo[sheetKey].desNote = record['des_note'];
    }
    if (rigaGiorno === '0') {
      const dates = [
        record['start_wo'], record['start2_wo'], record['start3_wo'],
        record['start4_wo'], record['start5_wo'], record['start6_wo']
      ].filter(Boolean);
      for (const d of dates) {
        const parsed = parseDateString(d);
        if (parsed) {
          if (!storyboardSheetsInfo[sheetKey].minDate || parsed < storyboardSheetsInfo[sheetKey].minDate) {
            storyboardSheetsInfo[sheetKey].minDate = parsed;
          }
        }
      }
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

  console.log(`\n=== STATISTICHE DI ANALISI STORYBOARD ===`);
  console.log(`Righe totali nel CSV: ${totalCsvRows}`);
  console.log(`Record esclusi tassativamente (Atleti 1 e 57): ${skippedExcludedCount}`);
  console.log(`Record saltati (altri clienti non in scope): ${skippedOutOfScopeCount}`);
  console.log(`Record già allineati (scrittura saltata): ${skippedAlignedCount}`);
  console.log(`Record da aggiornare (prescrizioni nuove o dati mancanti): ${toUpdateCount}`);
  console.log(`Record da creare (nuove schede): ${toInsertCount}`);
  console.log(`Operazioni di scrittura totali STORYBOARD: ${operations.length}`);

  console.log(`\nRipartizione modifiche STORYBOARD per Atleta:`);
  for (const [id, stats] of Object.entries(changesSummary)) {
    console.log(`  - ID Atleta '${id}': ${stats.inserted} nuovi, ${stats.updated} aggiornati (saltati ${stats.skipped} già allineati)`);
  }

  // ----------------------------------------------------
  // Fase 3: Sincronizzazione Testata Mesocicli (WORKOUT_T)
  // ----------------------------------------------------
  console.log(`\n--- Fase 3: Sincronizzazione Testata Mesocicli (WORKOUT_T) ---`);
  const wtCsvMap = loadWorkoutTCsvMap();
  const operationsWT = [];
  const wtSummary = {};

  for (const idCliente of TARGET_CLIENTS) {
    if (EXCLUDED_CLIENTS.has(idCliente)) continue;

    wtSummary[idCliente] = { inserted: 0, updated: 0, skipped: 0, details: [] };

    // Recupero documenti esistenti in WORKOUT_T per questo atleta
    const wtDocsMap = new Map();
    const wtSnapStr = await db.collection('WORKOUT_T').where('ID_cliente', '==', String(idCliente)).get();
    wtSnapStr.forEach(d => wtDocsMap.set(String(d.data().num_scheda).trim(), { id: d.id, ref: d.ref, data: d.data() }));

    if (!isNaN(Number(idCliente))) {
      const wtSnapNum = await db.collection('WORKOUT_T').where('ID_cliente', '==', Number(idCliente)).get();
      wtSnapNum.forEach(d => {
        const s = String(d.data().num_scheda).trim();
        if (!wtDocsMap.has(s)) {
          wtDocsMap.set(s, { id: d.id, ref: d.ref, data: d.data() });
        }
      });
    }

    // Elenco di tutte le schede dell'atleta da verificare (presenti in CSV o in Firestore)
    const sheetsToCheck = Array.from(existingSheetsPerClient[idCliente] || []).sort((a, b) => Number(a) - Number(b));

    for (const numScheda of sheetsToCheck) {
      const key = `${idCliente}_${numScheda}`;
      const csvRecord = wtCsvMap.get(key);
      const existingDoc = wtDocsMap.get(numScheda);
      const sbInfo = storyboardSheetsInfo[key] || {};

      let targetRecord = null;

      if (csvRecord) {
        // Dati autentici dal Google Sheet / CSV WORKOUT_T
        targetRecord = {
          ID_cliente: String(idCliente).trim(),
          num_scheda: String(numScheda).trim(),
          dat_data: csvRecord.dat_data || '',
          dat_scadenza: csvRecord.dat_scadenza || '',
          des_descrizione: csvRecord.des_descrizione || `Mesociclo ${numScheda}`,
          des_note: csvRecord.des_note || '',
          flg_da_finire: csvRecord.flg_da_finire !== undefined ? csvRecord.flg_da_finire : 'false',
          flg_ramp_test: csvRecord.flg_ramp_test !== undefined ? csvRecord.flg_ramp_test : 'true',
          num_passi_gg: csvRecord.num_passi_gg !== undefined ? csvRecord.num_passi_gg : '0',
          cod_tipo_avanz_scheda: csvRecord.cod_tipo_avanz_scheda || '0DEF',
          num_perc_compl: csvRecord.num_perc_compl !== undefined ? csvRecord.num_perc_compl : '0',
          ID_scheda: csvRecord.ID_scheda ? String(csvRecord.ID_scheda) : (sbInfo.idScheda || ''),
          URLTestiMail: csvRecord.URLTestiMail || '',
          NomeCognomeTM: csvRecord.NomeCognomeTM || '',
          PropostaWoManuale: csvRecord.PropostaWoManuale || '',
          SceltaGiorno: csvRecord.SceltaGiorno || '',
          SceltaWeek: csvRecord.SceltaWeek || ''
        };
      } else {
        // Fallback sintetico generato dalle informazioni di STORYBOARD per garantire visibilità immediata in Home
        let minDate = sbInfo.minDate || new Date();
        const startDateStr = formatDate(minDate);
        const expDate = new Date(minDate.getTime() + 42 * 24 * 60 * 60 * 1000);
        const expDateStr = formatDate(expDate);

        targetRecord = {
          ID_cliente: String(idCliente).trim(),
          num_scheda: String(numScheda).trim(),
          dat_data: startDateStr,
          dat_scadenza: expDateStr,
          des_descrizione: `Mesociclo ${numScheda}`,
          des_note: sbInfo.desNote || '',
          flg_da_finire: 'true',
          flg_ramp_test: 'true',
          num_passi_gg: 0,
          cod_tipo_avanz_scheda: '0DEF',
          num_perc_compl: 0,
          ID_scheda: sbInfo.idScheda || '',
          URLTestiMail: '',
          NomeCognomeTM: '',
          PropostaWoManuale: 'FALSE',
          SceltaGiorno: 'A',
          SceltaWeek: 1
        };
      }

      if (!existingDoc) {
        // Scheda mancante in WORKOUT_T: creala per renderla immediatamente visibile nella WebApp
        const docRef = db.collection('WORKOUT_T').doc(key);
        operationsWT.push({
          ref: docRef,
          type: 'set',
          data: targetRecord
        });
        wtSummary[idCliente].inserted++;
        wtSummary[idCliente].details.push(`+ Scheda ${numScheda} (NUOVA CREAZIONE: ${targetRecord.dat_data} - ${targetRecord.des_descrizione})`);
      } else {
        // Scheda già esistente: verifica se occorre aggiornare date o descrizioni
        if (!areWorkoutTRecordsEqual(targetRecord, existingDoc.data)) {
          operationsWT.push({
            ref: existingDoc.ref,
            type: 'set',
            data: targetRecord,
            merge: true
          });
          wtSummary[idCliente].updated++;
          wtSummary[idCliente].details.push(`~ Scheda ${numScheda} (AGGIORNAMENTO: ${targetRecord.dat_data} - ${targetRecord.des_descrizione})`);
        } else {
          wtSummary[idCliente].skipped++;
        }
      }
    }
  }

  console.log(`\n=== STATISTICHE DI ANALISI WORKOUT_T ===`);
  for (const [id, stats] of Object.entries(wtSummary)) {
    console.log(`  - ID Atleta '${id}': ${stats.inserted} da creare, ${stats.updated} da aggiornare, ${stats.skipped} già allineati`);
    if (stats.details.length > 0) {
      stats.details.forEach(d => console.log(`      ${d}`));
    }
  }
  console.log(`Operazioni di scrittura totali WORKOUT_T: ${operationsWT.length}`);

  const totalOps = operations.length + operationsWT.length;
  console.log(`\n>>> OPERAZIONI TOTALI (STORYBOARD + WORKOUT_T): ${totalOps} <<<`);

  // ----------------------------------------------------
  // Fase 4: Scrittura reale o Simulazione
  // ----------------------------------------------------
  if (isCommit) {
    if (totalOps === 0) {
      console.log("\n🎉 Nessuna scrittura necessaria. Sia STORYBOARD che WORKOUT_T sono già allineati al 100%!");
      process.exit(0);
    }
    console.log(`\nAvvio scrittura sicura di ${totalOps} record su Firestore (${operations.length} STORYBOARD, ${operationsWT.length} WORKOUT_T)...`);
    
    if (operations.length > 0) {
      await commitBatchOperations(operations);
    }
    if (operationsWT.length > 0) {
      await commitBatchOperations(operationsWT);
    }

    console.log(`\n🎉 Sincronizzazione reale completata con successo e schede allineate al 100%!`);
  } else {
    console.log(`\n🛡️ [SIMULAZIONE] Nessun dato è stato modificato su Firestore.`);
    console.log(`Per applicare queste modifiche reali in sicurezza, esegui:`);
    console.log(`node import_selective_data.js ${cliClientId ? `--client ${cliClientId} ` : ''}--commit\n`);
  }

  process.exit(0);
}

run().catch(err => {
  console.error("Errore critico durante la sincronizzazione:", err);
  process.exit(1);
});