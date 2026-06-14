const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

// Inizializza Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const NOME_COLLEZIONE = 'STORYBOARD';
const CSV_DEST_PATH = "C:\\Users\\visua\\Google Drive\\FLEXCOACHFIREBASE.csv";

// Struttura esatta delle colonne in base a WOAPP_STORYBOARD.csv (85 colonne in totale)
const headers = [
  "ID_cliente", "num_scheda", "des_giorno", "num_riga_giorno", "des_settore_princ",
  "des_settore", "des_esercizio", "des_esercizio_2", "alf_superserie", "des_qta_report",
  "des_rec_report", "des_week1", "des_week2", "des_week3", "des_week4", "des_week5",
  "des_week6", "ins_week1", "ins_week2", "ins_week3", "ins_week4", "ins_week5",
  "ins_week6", "ins_esercizio", "des_estesa_start", "des_estesa_end", "flg_sic",
  "des_note", "flg_ex_mai_fatto", "flg_escludi_lista_ex_wo_prec", "flg_stampa_wo_grafici",
  "flg_perc", "ind_reps_start", "ind_reps_end", "reps_week1", "reps_week2", "reps_week3",
  "reps_week4", "reps_week5", "reps_week6", "flg_video", "num_lv", "num_kg_mancanti_ob",
  "num_coord_ex_wo_prec", "des_note_attrezzo", "des_note_gen_attr", "perc_irt_w1",
  "perc_irt_w2", "perc_irt_w3", "perc_irt_w4", "perc_irt_w5", "perc_irt_w6", "UrlNormal",
  "num_riga", "no_elimina", "cmp1", "cmp2", "cmp3", "cmp4", "cmp5", "cmp6", "timestamp",
  "num_scheda_ult_ex", "dat_scheda_ult_ex", "num_buffer", "ID_scheda", "num_peso_bilanciere",
  "des_commenti", "des_note_immagine", "num_ins6", "start_wo", "end_wo", "start2_wo",
  "end2_wo", "start3_wo", "end3_wo", "start4_wo", "end4_wo", "start5_wo", "end5_wo",
  "start6_wo", "end6_wo", "num_faticaw6", "UrlNormal", "timestamp_ute"
];

// Parsing argomenti da riga di comando per il filtraggio
// Formato accettato: node export_firebase_to_csv.js --idCliente=1 --numScheda=66
const args = process.argv.slice(2);
let filterCliente = null;
let filterScheda = null;

args.forEach(arg => {
  if (arg.startsWith('--idCliente=')) {
    filterCliente = arg.split('=')[1].trim();
  } else if (arg.startsWith('--numScheda=')) {
    filterScheda = arg.split('=')[1].trim();
  }
});

async function run() {
  console.log(`[Firebase Export] Avvio esportazione...`);
  
  // Impedisce l'esportazione totale se non ci sono filtri, per evitare consumi di quota eccessivi
  if (!filterCliente && !filterScheda) {
    console.error("[Firebase Export] Errore: L'esportazione totale senza filtri non è consentita per prevenire l'esaurimento delle quote Firebase.");
    process.exit(1);
  }
  
  let query = db.collection(NOME_COLLEZIONE);
  
  // Applica i filtri direttamente alla query Firestore per ridurre l'uso di banda e velocizzare l'export
  if (filterCliente) {
    console.log(`[Firebase Export] Applicato filtro ID_cliente = "${filterCliente}"`);
    query = query.where('ID_cliente', '==', filterCliente);
  }
  if (filterScheda) {
    console.log(`[Firebase Export] Applicato filtro num_scheda = "${filterScheda}"`);
    query = query.where('num_scheda', '==', filterScheda);
  }

  console.log(`[Firebase Export] Lettura dei documenti in corso...`);
  const snapshot = await query.get();
  console.log(`[Firebase Export] Letti ${snapshot.size} documenti.`);

  const records = [];
  snapshot.forEach(doc => {
    records.push(doc.data());
  });

  // Ordina per num_riga crescente (se presente) come nel CSV originale
  console.log("[Firebase Export] Ordinamento record in corso...");
  records.sort((a, b) => {
    const numA = parseInt(a.num_riga) || 0;
    const numB = parseInt(b.num_riga) || 0;
    return numA - numB;
  });

  console.log("[Firebase Export] Generazione tracciato CSV...");
  
  // Costruisce la prima riga degli header racchiusi tra doppi apici e separati da ";"
  const headerLine = headers.map(h => `"${h}"`).join(';');
  const csvLines = [headerLine];

  // Popola ciascuna riga con i valori dei documenti
  for (const record of records) {
    const rowCells = headers.map(header => {
      let val = record[header];
      if (val === undefined || val === null) {
        val = '';
      }
      
      // Converte booleani e numeri in stringhe pulite
      val = String(val).trim();
      
      // Escapa i doppi apici raddoppiandoli per conformità allo standard CSV
      const escapedVal = val.replace(/"/g, '""');
      return `"${escapedVal}"`;
    });
    csvLines.push(rowCells.join(';'));
  }

  // Aggiunge il BOM UTF-8 (\ufeff) per far sì che Excel e MS Access riconoscano correttamente la codifica dei caratteri accentati
  const csvContent = '\ufeff' + csvLines.join('\r\n') + '\r\n';

  // Verifica ed eventuale creazione della cartella Google Drive se non esistente
  const destDir = path.dirname(CSV_DEST_PATH);
  if (!fs.existsSync(destDir)) {
    console.log(`[Firebase Export] Creazione cartella di destinazione mancante: ${destDir}`);
    fs.mkdirSync(destDir, { recursive: true });
  }

  console.log(`[Firebase Export] Scrittura file CSV in corso su: ${CSV_DEST_PATH}`);
  fs.writeFileSync(CSV_DEST_PATH, csvContent, 'utf8');
  console.log(`🎉 [Firebase Export] Esportazione completata con successo in '${CSV_DEST_PATH}'!`);
  
  process.exit(0);
}

run().catch(err => {
  console.error("[Firebase Export] Errore critico durante l'esecuzione:", err);
  process.exit(1);
});
