const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

function parseDateString(str) {
  if (!str) return null;
  str = str.trim();
  // Check if it's ISO or YYYY-MM-DD format (starts with 4 digits and a dash)
  if (/^\d{4}-\d{2}-\d{2}/.test(str)) {
    const parts = str.substring(0, 10).split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  // Check if it's DD/MM/YYYY format
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(str)) {
    const parts = str.split(' ')[0].split('/');
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  }
  // Fallback try Date.parse
  const t = Date.parse(str);
  if (!isNaN(t)) {
    return new Date(t);
  }
  return null;
}

function formatDate(date) {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = date.getFullYear();
  return `${d}/${m}/${y}`;
}

async function run() {
  console.log("Reading workout_t.json...");
  const workoutTRecords = JSON.parse(fs.readFileSync('workout_t.json', 'utf8'));
  console.log(`Found ${workoutTRecords.length} records in JSON.`);

  // 1. Upload known records from Excel
  console.log("Uploading Excel WORKOUT_T records to Firestore...");
  const uploadedKeys = new Set();
  let batch = db.batch();
  let count = 0;
  let batchCount = 0;

  for (const record of workoutTRecords) {
    const docId = `${record.ID_cliente}_${record.num_scheda}`;
    uploadedKeys.add(docId);

    const docRef = db.collection('WORKOUT_T').doc(docId);
    batch.set(docRef, record);
    count++;

    if (count === 500) {
      batchCount++;
      console.log(`Committing batch ${batchCount}...`);
      await batch.commit();
      batch = db.batch();
      count = 0;
    }
  }
  if (count > 0) {
    batchCount++;
    console.log(`Committing final batch ${batchCount}...`);
    await batch.commit();
  }
  console.log(`Successfully imported ${workoutTRecords.length} WORKOUT_T records.`);

  // 2. Fetch STORYBOARD records to find missing combinations
  console.log("Analyzing STORYBOARD collection to identify missing sheets...");
  const storyboardSnap = await db.collection('STORYBOARD').get();
  console.log(`Found ${storyboardSnap.size} storyboard records in Firestore.`);

  const storyboardSheets = {};
  storyboardSnap.forEach(doc => {
    const data = doc.data();
    const client = String(data.ID_cliente).trim();
    const sheet = String(data.num_scheda).trim();
    if (!client || !sheet) return;

    const key = `${client}_${sheet}`;
    if (!storyboardSheets[key]) {
      storyboardSheets[key] = [];
    }
    storyboardSheets[key].push(data);
  });

  const missingKeys = Object.keys(storyboardSheets).filter(key => !uploadedKeys.has(key));
  console.log(`Identified ${missingKeys.length} sheets in STORYBOARD that are missing in WORKOUT_T:`, missingKeys);

  // 3. Generate synthetic records for missing sheets
  if (missingKeys.length > 0) {
    console.log("Generating synthetic WORKOUT_T records for missing sheets...");
    batch = db.batch();
    count = 0;
    batchCount = 0;
    let syntheticCount = 0;

    for (const key of missingKeys) {
      const [client, sheet] = key.split('_');
      const recordsForSheet = storyboardSheets[key];

      // Find minimum start_wo date in row 0 headers
      let minDate = null;
      let sheetId = "";
      let coachNote = "";

      for (const rec of recordsForSheet) {
        if (rec.ID_scheda && !sheetId) {
          sheetId = String(rec.ID_scheda);
        }
        if (rec.des_note && !coachNote) {
          coachNote = rec.des_note;
        }
        
        // Look at start_wo, start2_wo, etc. for row zero
        if (parseInt(rec.num_riga_giorno) === 0) {
          const dates = [
            rec.start_wo, rec.start2_wo, rec.start3_wo,
            rec.start4_wo, rec.start5_wo, rec.start6_wo
          ].filter(Boolean);

          for (const dStr of dates) {
            const parsed = parseDateString(dStr);
            if (parsed) {
              if (!minDate || parsed < minDate) {
                minDate = parsed;
              }
            }
          }
        }
      }

      // If no date found in storyboard logs, use a default date (e.g. now)
      if (!minDate) {
        minDate = new Date();
        console.log(`  No start_wo dates found for ${key}. Using current date as fallback.`);
      }

      const startDateStr = formatDate(minDate);
      // Expiration is 6 weeks (42 days) later
      const expDate = new Date(minDate.getTime() + 42 * 24 * 60 * 60 * 1000);
      const expDateStr = formatDate(expDate);

      const syntheticRecord = {
        ID_cliente: client,
        num_scheda: sheet,
        dat_data: startDateStr,
        dat_scadenza: expDateStr,
        des_descrizione: "Mesociclo Definitivo",
        des_note: "",
        flg_da_finire: "true",
        flg_ramp_test: "true",
        num_passi_gg: 0,
        cod_tipo_avanz_scheda: "0DEF",
        num_perc_compl: 0,
        ID_scheda: sheetId || "0",
        URLTestiMail: "",
        NomeCognomeTM: "",
        PropostaWoManuale: "FALSE",
        SceltaGiorno: "A",
        SceltaWeek: 1
      };

      console.log(`  Generated synthetic for ${key}: Start = ${startDateStr}, End = ${expDateStr}`);
      const docRef = db.collection('WORKOUT_T').doc(key);
      batch.set(docRef, syntheticRecord);
      syntheticCount++;
      count++;

      if (count === 500) {
        batchCount++;
        console.log(`Committing batch ${batchCount}...`);
        await batch.commit();
        batch = db.batch();
        count = 0;
      }
    }

    if (count > 0) {
      batchCount++;
      console.log(`Committing final synthetic batch ${batchCount}...`);
      await batch.commit();
    }
    console.log(`Successfully generated and uploaded ${syntheticCount} synthetic WORKOUT_T records.`);
  }

  console.log("🎉 All WORKOUT_T records imported successfully!");
  process.exit(0);
}

run().catch(console.error);
