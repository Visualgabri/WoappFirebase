const admin = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');
const fb = require('firebase-admin');

if (!fb.apps.length) {
  fb.initializeApp({
    credential: fb.credential.cert(admin)
  });
}
const db = fb.firestore();

function analizzaData(raw) {
  if (!raw) return null;
  const str = String(raw).trim();
  if (str.includes('-')) {
    const p = new Date(str.replace(' ', 'T'));
    if (!isNaN(p.getTime())) return p;
  }
  if (str.includes('/')) {
    const parts = str.split(' ');
    const dParts = parts[0].split('/');
    if (dParts.length === 3) {
      const gg = parseInt(dParts[0], 10);
      const mm = parseInt(dParts[1], 10) - 1;
      const aa = parseInt(dParts[2], 10);
      let hh = 0, min = 0, ss = 0;
      if (parts[1]) {
        const tParts = parts[1].split(':');
        hh = parseInt(tParts[0] || '0', 10);
        min = parseInt(tParts[1] || '0', 10);
        ss = parseInt(tParts[2] || '0', 10);
      }
      const d = new Date(aa, mm, gg, hh, min, ss);
      if (!isNaN(d.getTime())) return d;
    }
  }
  return null;
}

async function runMigration() {
  console.log("=== AVVIO CALCOLO E POPOLAMENTO RIEPILOGO WORKOUT CLIENTI ===");
  const cSnap = await db.collection('CLIENTI').get();
  let aggiornati = 0;

  for (const doc of cSnap.docs) {
    const data = doc.data();
    const id = doc.id;
    const isAttivo = data.flg_attivo !== false && data.flg_obsoleto !== 'SI';
    const scheda = data.SchedaSelezionata;

    if (!isAttivo || !scheda) {
      console.log(`Salto cliente ${id} (Attivo: ${isAttivo}, Scheda: ${scheda})`);
      continue;
    }

    console.log(`Elaborazione cliente ${id} (${data.Nome || ''} ${data.Cognome || ''}) - Scheda #${scheda}...`);

    const sSnap = await db.collection('STORYBOARD')
      .where('ID_cliente', '==', String(id))
      .where('num_scheda', '==', String(scheda))
      .get();

    let maxWeek = 1;
    let latestTimestamp = null;

    sSnap.forEach((docSnap) => {
      const sData = docSnap.data();
      for (let w = 1; w <= 6; w++) {
        const ins = sData['ins_week' + w];
        if (ins && String(ins).trim() !== '' && String(ins).trim() !== '-') {
          if (w > maxWeek) maxWeek = w;
        }
        const isCmp = sData['cmp' + w] === 'SI' || sData['cmp' + w] === true || sData['cmp' + w] === '1';
        if (isCmp && w >= maxWeek) {
          maxWeek = Math.min(6, w + 1);
        }
      }

      const t = sData.timestamp_ute || sData.timestamp;
      if (t) {
        const parsedT = analizzaData(t);
        const parsedLatest = analizzaData(latestTimestamp);
        if (parsedT && (!parsedLatest || parsedT.getTime() > parsedLatest.getTime())) {
          latestTimestamp = t;
        }
      }
    });

    const parsedLatestDate = analizzaData(latestTimestamp);
    const payload = {
      num_scheda: String(scheda),
      settimana_corrente: maxWeek,
      settimane_totali: 6,
      settimane_mancanti: Math.max(0, 6 - maxWeek),
      perc_completamento: Math.round((maxWeek / 6) * 100),
      ultimo_inserimento: parsedLatestDate ? parsedLatestDate.toISOString() : null,
      ultimo_inserimento_ute: latestTimestamp ? String(latestTimestamp) : null,
      aggiornato_il: new Date().toISOString()
    };

    await doc.ref.set({ riepilogo_workout: payload }, { merge: true });
    console.log(` -> Salvato: Week ${maxWeek}/6, Mancanti: ${payload.settimane_mancanti}, Ultimo: ${latestTimestamp}`);
    aggiornati++;
  }

  console.log(`\nCOMPLETATO! ${aggiornati} profili cliente aggiornati con successo.`);
  process.exit(0);
}

runMigration().catch(console.error);
