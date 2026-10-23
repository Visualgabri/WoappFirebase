const admin = require('firebase-admin');
const fs = require('fs');
const readline = require('readline');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}

const db = admin.firestore();

async function checkClient237() {
  console.log('=== VERIFICA CLIENTE 237 ===\n');

  // 1. Check WORKOUT_T in Firestore
  console.log('--- 1. COLLEZIONE WORKOUT_T IN FIRESTORE ---');
  const wtSnapStr = await db.collection('WORKOUT_T').where('ID_cliente', '==', '237').get();
  const wtSnapNum = await db.collection('WORKOUT_T').where('ID_cliente', '==', 237).get();
  
  const wtDocs = new Map();
  wtSnapStr.forEach(doc => wtDocs.set(doc.id, doc.data()));
  wtSnapNum.forEach(doc => wtDocs.set(doc.id, doc.data()));

  console.log(`Documenti WORKOUT_T trovati: ${wtDocs.size}`);
  const wtSchede = [];
  wtDocs.forEach((data, id) => {
    wtSchede.push({
      docId: id,
      num_scheda: data.num_scheda,
      dat_data: data.dat_data,
      dat_scadenza: data.dat_scadenza,
      des_descrizione: data.des_descrizione,
      NomeCognomeTM: data.NomeCognomeTM
    });
  });

  wtSchede.sort((a, b) => Number(a.num_scheda) - Number(b.num_scheda));
  console.log('Schede presenti in WORKOUT_T per 237:');
  console.table(wtSchede);

  const wtSchedeSet = new Set(wtSchede.map(s => String(s.num_scheda)));
  console.log(`WORKOUT_T contiene scheda 24? ${wtSchedeSet.has('24')}`);
  console.log(`WORKOUT_T contiene scheda 25? ${wtSchedeSet.has('25')}`);
  console.log(`WORKOUT_T contiene scheda 26? ${wtSchedeSet.has('26')}`);

  // 2. Check STORYBOARD in Firestore
  console.log('\n--- 2. COLLEZIONE STORYBOARD IN FIRESTORE ---');
  const sbSnapStr = await db.collection('STORYBOARD').where('ID_cliente', '==', '237').get();
  const sbSnapNum = await db.collection('STORYBOARD').where('ID_cliente', '==', 237).get();

  const sbDocs = new Map();
  sbSnapStr.forEach(doc => sbDocs.set(doc.id, doc.data()));
  sbSnapNum.forEach(doc => sbDocs.set(doc.id, doc.data()));

  console.log(`Record totali in STORYBOARD per ID_cliente 237: ${sbDocs.size}`);

  const sbByScheda = {};
  sbDocs.forEach((data, id) => {
    const s = String(data.num_scheda || '').trim();
    if (!sbByScheda[s]) {
      sbByScheda[s] = { totalRows: 0, rigaZero: [], sampleExercises: [] };
    }
    sbByScheda[s].totalRows++;
    if (Number(data.num_riga_giorno) === 0 || String(data.num_riga_giorno).trim() === '0') {
      sbByScheda[s].rigaZero.push({
        id,
        giorno: data.cod_giorno,
        start_wo: data.start_wo,
        des_note: data.des_note,
        ID_scheda: data.ID_scheda
      });
    } else if (sbByScheda[s].sampleExercises.length < 3) {
      sbByScheda[s].sampleExercises.push({
        giorno: data.cod_giorno,
        riga: data.num_riga_giorno,
        esercizio: data.des_esercizio || data.esercizio
      });
    }
  });

  const sbSchedeKeys = Object.keys(sbByScheda).sort((a, b) => Number(a) - Number(b));
  console.log('Elenco schede presenti in STORYBOARD (Firestore):', sbSchedeKeys.join(', '));

  [24, 25, 26].forEach(sn => {
    const sKey = String(sn);
    if (sbByScheda[sKey]) {
      console.log(`\n-> Scheda ${sKey} in STORYBOARD Firestore:`);
      console.log(`   Righe totali: ${sbByScheda[sKey].totalRows}`);
      console.log(`   Righe zero (header giorni): ${sbByScheda[sKey].rigaZero.length}`);
      console.log(`   Dettagli riga zero:`, JSON.stringify(sbByScheda[sKey].rigaZero, null, 2));
      console.log(`   Esempi esercizi:`, JSON.stringify(sbByScheda[sKey].sampleExercises, null, 2));
    } else {
      console.log(`\n-> Scheda ${sKey} NON presente in STORYBOARD Firestore!`);
    }
  });

  // 3. Check CSV WOAPP_STORYBOARD.csv
  console.log('\n--- 3. VERIFICA NEL FILE CSV (WOAPP_STORYBOARD.csv) ---');
  if (fs.existsSync('WOAPP_STORYBOARD.csv')) {
    const fileStream = fs.createReadStream('WOAPP_STORYBOARD.csv');
    const rl = readline.createInterface({ input: fileStream, crlfDelay: Infinity });

    let headers = null;
    let clientColIdx = -1;
    let schedaColIdx = -1;
    let rigaColIdx = -1;
    let esColIdx = -1;

    const csvByScheda = {};

    for await (const line of rl) {
      if (!headers) {
        // parse headers
        headers = line.split(';').map(h => h.trim().replace(/^"|"$/g, ''));
        clientColIdx = headers.indexOf('ID_cliente');
        schedaColIdx = headers.indexOf('num_scheda');
        rigaColIdx = headers.indexOf('num_riga_giorno');
        esColIdx = headers.indexOf('des_esercizio');
        continue;
      }

      const cols = line.split(';').map(c => c.trim().replace(/^"|"$/g, ''));
      const clientId = cols[clientColIdx];
      if (clientId === '237') {
        const s = cols[schedaColIdx];
        if (!csvByScheda[s]) csvByScheda[s] = 0;
        csvByScheda[s]++;
      }
    }

    console.log('Schede per 237 trovate in WOAPP_STORYBOARD.csv:');
    console.table(Object.entries(csvByScheda).map(([scheda, count]) => ({ scheda, righe_nel_csv: count })).sort((a, b) => Number(a.scheda) - Number(b.scheda)));
  } else {
    console.log('WOAPP_STORYBOARD.csv non trovato.');
  }

  // 4. Check workout_t.json if exists
  console.log('\n--- 4. VERIFICA IN workout_t.json ---');
  if (fs.existsSync('workout_t.json')) {
    const raw = JSON.parse(fs.readFileSync('workout_t.json', 'utf8'));
    const for237 = raw.filter(r => String(r.ID_cliente).trim() === '237');
    console.log(`Record trovati per 237 in workout_t.json: ${for237.length}`);
    console.table(for237);
  } else {
    console.log('workout_t.json non trovato in root.');
  }

  process.exit(0);
}

checkClient237().catch(err => {
  console.error(err);
  process.exit(1);
});
