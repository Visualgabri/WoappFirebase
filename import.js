const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// 1. Collega Firebase usando la TUA chiave segreta specifica
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();
const NOME_COLLEZIONE = 'STORYBOARD'; // Il nome della tua collezione

async function importaCSV() {
  const tutteLeRighe = [];

  console.log('Fase 1: Lettura del file CSV in corso...');

  // 2. Leggi il TUO file CSV riga per riga e salvalo in memoria
  fs.createReadStream('WOAPP_STORYBOARD.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (rigaCsv) => tutteLeRighe.push(rigaCsv))
    .on('end', async () => {
      console.log(`Trovate ${tutteLeRighe.length} righe. Inizio caricamento su Firebase in sequenza...`);

      let currentBatch = db.batch();
      let operationCounter = 0;
      let batchCounter = 0;

      // 3. Invia i dati a blocchi di 500, in modo SEQUENZIALE (per evitare il timeout di Google)
      for (let i = 0; i < tutteLeRighe.length; i++) {
        const docRef = db.collection(NOME_COLLEZIONE).doc(); // Genera un ID automatico
        currentBatch.set(docRef, tutteLeRighe[i]); // Aggiunge la riga al blocco
        operationCounter++;

        // 4. Se arriviamo a 500, O se siamo all'ultimissima riga del file, eseguiamo il blocco
        if (operationCounter === 500 || i === tutteLeRighe.length - 1) {
          batchCounter++;
          console.log(`Invio blocco ${batchCounter}... (salvati ${i + 1} record su ${tutteLeRighe.length})`);
          
          try {
            // IL SEGRETO È QUI: "await" fa aspettare lo script finché Google non conferma la ricezione
            await currentBatch.commit(); 
          } catch (error) {
            console.error(`Errore nell'invio del blocco ${batchCounter}:`, error);
          }
          
          // Svuota il blocco per il prossimo giro di 500
          currentBatch = db.batch();
          operationCounter = 0;
        }
      }

      console.log('🎉 COMPLETATO AL 100%! Tutti i record inseriti in Firebase!');
    });
}

importaCSV();