const admin = require('firebase-admin');
const fs = require('fs');
const csv = require('csv-parser');

// Collegamento a Firebase
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function uploadMetadata() {
  const atletiSet = new Set();

  console.log('Lettura del CSV per estrarre gli atleti univoci...');

  fs.createReadStream('WOAPP_STORYBOARD.csv')
    .pipe(csv({ separator: ';' }))
    .on('data', (riga) => {
      const chiave = Object.keys(riga).find(k => k.includes('ID_cliente'));
      const val = chiave ? riga[chiave] : null;
      if (val) {
        atletiSet.add(val.trim());
      }
    })
    .on('end', async () => {
      const atletiUnivoci = Array.from(atletiSet).sort((a, b) => Number(a) - Number(b));
      console.log(`Trovati ${atletiUnivoci.length} atleti univoci:`, atletiUnivoci);

      console.log('Salvataggio della lista atleti su Firestore in METADATA/clienti...');
      try {
        await db.collection('METADATA').doc('clienti').set({
          lista: atletiUnivoci,
          aggiornatoAl: new Date().toISOString()
        });
        console.log('🎉 Salvataggio completato con successo!');
      } catch (error) {
        console.error('Errore durante il salvataggio:', error);
      }
      process.exit(0);
    });
}

uploadMetadata();
