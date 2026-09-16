const admin = require('firebase-admin');
const fs = require('fs');

const args = process.argv.slice(2);
const isCommit = args.includes('--commit');

console.log(`=== RIPRISTINO / SINCRONIZZAZIONE ESCLUSIVA: RACHELE CUCURNIA (ID 312) ===`);
console.log(`Modalità: ${isCommit ? '🔥 SCRITTURA REALE (--commit)' : '🛡️ SIMULAZIONE (--simula / default)'}\n`);

const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

function normalize(s) {
  return String(s || '').trim().toLowerCase().replace(/\s+/g, ' ');
}

function areRecordsEqual(rec1, rec2) {
  const ignoredKeys = new Set(['timestamp', 'timestamp_ute', 'des_week1Estratto', 'id']);
  const allKeys = new Set([...Object.keys(rec1), ...Object.keys(rec2)]);
  for (const key of allKeys) {
    if (ignoredKeys.has(key)) continue;
    const val1 = String(rec1[key] !== undefined && rec1[key] !== null ? rec1[key] : '').trim();
    const val2 = String(rec2[key] !== undefined && rec2[key] !== null ? rec2[key] : '').trim();
    if (val1 !== val2) return false;
  }
  return true;
}

async function run() {
  console.log("Fase 1: Caricamento documenti di Rachele Cucurnia (ID 312) da Firestore...");
  const snap = await db.collection('STORYBOARD')
    .where('ID_cliente', '==', '312')
    .get();

  console.log(`Trovati ${snap.size} record di Rachele su Firestore.`);

  const fsMultiMap = {};
  snap.forEach(doc => {
    const data = doc.data();
    const baseKey = `${data.num_scheda}_${String(data.des_giorno).toUpperCase()}_${data.num_riga_giorno}`;
    if (!fsMultiMap[baseKey]) fsMultiMap[baseKey] = [];
    fsMultiMap[baseKey].push({ id: doc.id, ref: doc.ref, data });
  });

  console.log("\nFase 2: Lettura di WOAPP_STORYBOARD.csv per Rachele Cucurnia...");
  const content = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].replace(/"/g, '').split(';').map(h => h.replace(/^\uFEFF/, '').trim());

  const urlNormalIndices = [];
  headers.forEach((h, idx) => {
    if (h === 'UrlNormal') urlNormalIndices.push(idx);
  });

  const operations = [];
  const matchedDocIds = new Set();
  const summaryByScheda = {};

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const cells = line.split(';');
    const client = cells[0].replace(/"/g, '').trim();
    if (client !== '312') continue;

    const record = {};
    headers.forEach((h, idx) => {
      let val = cells[idx] ? cells[idx].replace(/^"/, '').replace(/"$/, '').trim() : '';
      if (h === 'UrlNormal' && urlNormalIndices.length > 0) {
        const u1 = cells[urlNormalIndices[0]] ? cells[urlNormalIndices[0]].replace(/^"/, '').replace(/"$/, '').trim() : '';
        const u2 = urlNormalIndices[1] && cells[urlNormalIndices[1]] ? cells[urlNormalIndices[1]].replace(/^"/, '').replace(/"$/, '').trim() : '';
        if (u1.startsWith('http')) val = u1;
        else if (u2.startsWith('http')) val = u2;
        else val = u1 || u2 || '';
      }
      if (h) record[h] = val;
    });

    if (record['des_week1Estratto'] && !record['des_week1']) {
      record['des_week1'] = record['des_week1Estratto'];
    }

    const numScheda = record['num_scheda'];
    const giorno = String(record['des_giorno'] || '').trim().toUpperCase();
    const rigaGiorno = String(record['num_riga_giorno'] || '').trim();
    const exName = record['des_esercizio'] || '';
    const numRiga = record['num_riga'] || '';

    if (!summaryByScheda[numScheda]) {
      summaryByScheda[numScheda] = { updated: 0, skipped: 0, new: 0 };
    }

    const baseKey = `${numScheda}_${giorno}_${rigaGiorno}`;
    const candidates = fsMultiMap[baseKey] || [];

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
      const toSave = { ...record };

      // Preserva UrlNormal valido da Firestore se nel CSV è vuoto
      if (!toSave.UrlNormal && matched.data.UrlNormal && matched.data.UrlNormal.startsWith('http')) {
        toSave.UrlNormal = matched.data.UrlNormal;
      }

      // Preserva campi tecnici presenti in Firestore e assenti nel CSV
      const fieldsToKeepFromFirestore = ['ID_esercizio', 'flg_forza_reps_salita', 'step_kg', 'flg_corpo_libero', 'num_buffer'];
      fieldsToKeepFromFirestore.forEach(f => {
        if (!toSave[f] && matched.data[f] !== undefined && matched.data[f] !== null) {
          toSave[f] = matched.data[f];
        }
      });

      if (!areRecordsEqual(toSave, matched.data)) {
        operations.push({
          ref: matched.ref,
          data: toSave,
          type: 'set',
          merge: true
        });
        summaryByScheda[numScheda].updated++;
      } else {
        summaryByScheda[numScheda].skipped++;
      }
    } else {
      const docRef = db.collection('STORYBOARD').doc();
      operations.push({
        ref: docRef,
        data: record,
        type: 'set'
      });
      summaryByScheda[numScheda].new++;
    }
  }

  console.log(`\n=== RIEPILOGO OPERAZIONI PER RACHELE CUCURNIA ===`);
  console.log(`Operazioni di scrittura totali: ${operations.length}`);
  for (const [s, stats] of Object.entries(summaryByScheda)) {
    console.log(`  - Scheda ${s}: ${stats.updated} aggiornati, ${stats.new} nuovi, ${stats.skipped} già allineati`);
  }

  if (isCommit) {
    if (operations.length === 0) {
      console.log("\n🎉 Nessuna scrittura necessaria. I dati di Rachele sono già allineati!");
      process.exit(0);
    }
    console.log(`\nAvvio scrittura di ${operations.length} record per Rachele Cucurnia su Firestore...`);
    let batch = db.batch();
    let c = 0;
    for (const op of operations) {
      batch.set(op.ref, op.data, { merge: true });
      c++;
      if (c === 500) {
        await batch.commit();
        batch = db.batch();
        c = 0;
      }
    }
    if (c > 0) await batch.commit();
    console.log(`\n🎉 Sincronizzazione di Rachele Cucurnia completata con successo!`);
  } else {
    console.log(`\n🛡️ [SIMULAZIONE] Nessun dato modificato. Per applicare, esegui con --commit`);
  }

  process.exit(0);
}

run().catch(console.error);
