const admin = require('firebase-admin');
const fs = require('fs');

const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

// Helper per dividere le operazioni in batch (max 500 per batch)
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
      console.log(`[Firestore] Invio blocco #${batchIndex}...`);
      await currentBatch.commit();
      currentBatch = db.batch();
      counter = 0;
    }
  }

  if (counter > 0) {
    batchIndex++;
    console.log(`[Firestore] Invio blocco finale #${batchIndex}...`);
    await currentBatch.commit();
  }
}

async function run() {
  console.log("=== AVVIO AGGIORNAMENTO CLIENTE 211 (Eugenia Falini) ===");

  // ----------------------------------------------------
  // FASE 1: STORYBOARD Scheda 29 da WOAPP_STORYBOARD.csv
  // ----------------------------------------------------
  console.log("\n1. Lettura WOAPP_STORYBOARD.csv per Scheda 29...");
  const content = fs.readFileSync('WOAPP_STORYBOARD.csv', 'utf8');
  const lines = content.split('\n');
  const headers = lines[0].replace(/"/g, '').split(';').map(h => h.replace(/^\uFEFF/, '').trim());
  const clientIdx = headers.indexOf('ID_cliente');
  const numSchedaIdx = headers.indexOf('num_scheda');

  const urlNormalIndices = [];
  headers.forEach((h, idx) => {
    if (h === 'UrlNormal') urlNormalIndices.push(idx);
  });

  const csvRows29 = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    const cells = line.split(';');
    const client = cells[clientIdx] ? cells[clientIdx].replace(/"/g, '').trim() : '';
    const s = cells[numSchedaIdx] ? cells[numSchedaIdx].replace(/"/g, '').trim() : '';
    if (client === '211' && s === '29') {
      const record = {};
      headers.forEach((header, idx) => {
        let cellVal = cells[idx] ? cells[idx].replace(/^"/, '').replace(/"$/, '').trim() : '';
        if (header === 'UrlNormal' && urlNormalIndices.length > 0) {
          const u1 = cells[urlNormalIndices[0]] ? cells[urlNormalIndices[0]].replace(/^"/, '').replace(/"$/, '').trim() : '';
          const u2 = urlNormalIndices[1] && cells[urlNormalIndices[1]] ? cells[urlNormalIndices[1]].replace(/^"/, '').replace(/"$/, '').trim() : '';
          if (u1.startsWith('http')) cellVal = u1;
          else if (u2.startsWith('http')) cellVal = u2;
          else cellVal = u1 || u2 || '';
        }
        if (header) record[header] = cellVal;
      });
      if (record['des_week1Estratto'] && !record['des_week1']) {
        record['des_week1'] = record['des_week1Estratto'];
      }
      csvRows29.push(record);
    }
  }
  console.log(`Trovate ${csvRows29.length} righe per scheda 29 nel CSV.`);

  // Recupero documenti esistenti su Firestore per 211 / 29
  console.log("Recupero record esistenti da Firestore STORYBOARD...");
  const sbSnap = await db.collection('STORYBOARD')
    .where('ID_cliente', '==', '211')
    .where('num_scheda', '==', '29')
    .get();

  console.log(`Trovati ${sbSnap.size} documenti esistenti su Firestore.`);
  const fsMap = {};
  sbSnap.forEach(d => {
    const data = d.data();
    const key = `${data.des_giorno}_${data.num_riga_giorno}`;
    fsMap[key] = { id: d.id, ref: d.ref, data };
  });

  const operations = [];
  csvRows29.forEach(csvRec => {
    const key = `${csvRec.des_giorno}_${csvRec.num_riga_giorno}`;
    const existing = fsMap[key];
    const toSave = { ...csvRec };

    if (existing) {
      // Preserva UrlNormal se il CSV è vuoto e Firestore possiede l'immagine corretta
      if (!toSave.UrlNormal && existing.data.UrlNormal && existing.data.UrlNormal.startsWith('http')) {
        toSave.UrlNormal = existing.data.UrlNormal;
      }
      operations.push({
        ref: existing.ref,
        type: 'set',
        data: toSave,
        merge: true
      });
    } else {
      const newRef = db.collection('STORYBOARD').doc();
      operations.push({
        ref: newRef,
        type: 'set',
        data: toSave
      });
    }
  });

  console.log(`Preparate ${operations.length} operazioni di scrittura per STORYBOARD.`);

  // ----------------------------------------------------
  // FASE 2: WORKOUT_T per Schede 27, 28, 29
  // ----------------------------------------------------
  console.log("\n2. Preparazione aggiornamenti WORKOUT_T per Schede 27, 28, 29...");
  const workoutTRecords = [
    {
      id: '211_27',
      data: {
        id: '211_27',
        ID_cliente: '211',
        num_scheda: '27',
        dat_data: '16/03/2026',
        dat_scadenza: '26/04/2026',
        des_descrizione: 'Focus: Glutei, Glutei med, Dorsali, Petto alto, Quads, Delt lat',
        des_note: '',
        flg_da_finire: false,
        flg_ramp_test: true,
        num_passi_gg: 0,
        cod_tipo_avanz_scheda: '0DEF',
        num_perc_compl: 56.6,
        ID_scheda: 2202,
        URLTestiMail: 'C:\\Users\\visua\\Google Drive\\Job Personal Trainer\\Clienti\\Eugenia Falini\\TestiMail\\211-Eugenia Falini-W27.html',
        NomeCognomeTM: 'Eugenia Falini',
        PropostaWoManuale: '',
        SceltaGiorno: '',
        SceltaWeek: ''
      }
    },
    {
      id: '211_28',
      data: {
        id: '211_28',
        ID_cliente: '211',
        num_scheda: '28',
        dat_data: '04/05/2026',
        dat_scadenza: '14/06/2026',
        des_descrizione: 'Focus: Petto alto, Glutei, Glutei med, Dorsali, Quads, Delt lat',
        des_note: '',
        flg_da_finire: false,
        flg_ramp_test: true,
        num_passi_gg: 0,
        cod_tipo_avanz_scheda: '0DEF',
        num_perc_compl: 56.6,
        ID_scheda: 2245,
        URLTestiMail: 'C:\\Users\\visua\\Google Drive\\Job Personal Trainer\\Clienti\\Eugenia Falini\\TestiMail\\211-Eugenia Falini-W28.html',
        NomeCognomeTM: 'Eugenia Falini',
        PropostaWoManuale: '',
        SceltaGiorno: '',
        SceltaWeek: ''
      }
    },
    {
      id: '211_29',
      data: {
        id: '211_29',
        ID_cliente: '211',
        num_scheda: '29',
        dat_data: '29/06/2026',
        dat_scadenza: '09/08/2026',
        des_descrizione: 'Focus: Glutei, Glutei med, Dorsali, Femorali, Quads, Delt post',
        des_note: '',
        flg_da_finire: false,
        flg_ramp_test: true,
        num_passi_gg: 0,
        cod_tipo_avanz_scheda: '0DEF',
        num_perc_compl: 56.6,
        ID_scheda: 2283,
        URLTestiMail: 'C:\\Users\\visua\\Google Drive\\Job Personal Trainer\\Clienti\\Eugenia Falini\\TestiMail\\211-Eugenia Falini-W29.html',
        NomeCognomeTM: 'Eugenia Falini',
        PropostaWoManuale: '',
        SceltaGiorno: '',
        SceltaWeek: ''
      }
    }
  ];

  workoutTRecords.forEach(wt => {
    const docRef = db.collection('WORKOUT_T').doc(wt.id);
    operations.push({
      ref: docRef,
      type: 'set',
      data: wt.data,
      merge: true
    });
  });

  // Esecuzione batch su Firestore
  console.log(`\n3. Scrittura di ${operations.length} operazioni totali su Firestore...`);
  await commitBatchOperations(operations);
  console.log("Scrittura su Firestore completata con successo!");

  // ----------------------------------------------------
  // FASE 3: Aggiornamento Backup Locale WebApp
  // ----------------------------------------------------
  console.log("\n4. Aggiornamento storyboard_backup.json per WebApp...");
  const backupPaths = [
    'WoappWeb/public/storyboard_backup.json',
    'WoappWeb/dist/storyboard_backup.json'
  ];

  backupPaths.forEach(p => {
    if (fs.existsSync(p)) {
      try {
        const existingBackup = JSON.parse(fs.readFileSync(p, 'utf8'));
        // Rimuoviamo eventuali record vecchi per 211 scheda 29
        const filtered = existingBackup.filter(r => !(String(r.ID_cliente) === '211' && String(r.num_scheda) === '29'));
        
        // Aggiungiamo i record aggiornati
        csvRows29.forEach(r => {
          const item = { ...r };
          const key = `${r.des_giorno}_${r.num_riga_giorno}`;
          if (fsMap[key] && fsMap[key].data.UrlNormal) {
            item.UrlNormal = fsMap[key].data.UrlNormal;
          }
          filtered.push(item);
        });

        fs.writeFileSync(p, JSON.stringify(filtered, null, 2), 'utf8');
        console.log(`Aggiornato ${p} con i record della scheda 29.`);
      } catch (err) {
        console.warn(`Errore aggiornamento ${p}:`, err.message);
      }
    }
  });

  console.log("\n🎉 TUTTE LE OPERAZIONI SONO STATE COMPLETATE CON SUCCESSO!");
  process.exit(0);
}

run().catch(err => {
  console.error("Errore critico durante l'esecuzione:", err);
  process.exit(1);
});
