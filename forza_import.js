const admin = require('firebase-admin');
const fs = require('fs');

// Collega il tuo database come Amministratore (scavalca tutti i limiti)
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function forzaRipristino() {
  try {
    console.log("1. Leggo il file Backup_Scheda_66_Gabriele_Belmonte.json...");
    
    // Legge il file con il nome esatto che hai nella cartella
    const rawData = fs.readFileSync('Backup_Scheda_66_Gabriele_Belmonte.json', 'utf8');
    const backup = JSON.parse(rawData);
    const records = backup.datiStoryboard;
    
    console.log(`2. Trovati ${records.length} esercizi. Preparo l'invio forzato a Firebase...`);
    
    const batch = db.batch();
    
    for (const record of records) {
      const docId = record.id;
      const docRef = db.collection('STORYBOARD').doc(docId);
      
      // Creiamo una copia pulita del record
      const dataToSave = { ...record };
      delete dataToSave.id; // Togliamo l'id perché Firebase lo usa già come nome del documento
      
      // Sovrascriviamo in modo chirurgico
      batch.set(docRef, dataToSave, { merge: true });
    }
    
    console.log("3. Invio a Firebase in corso...");
    await batch.commit();
    
    console.log("✅ SUCCESSO! Il database è stato allineato correttamente con i dati dello smartphone.");
    process.exit(0);
  } catch (error) {
    console.error("❌ ERRORE:", error);
    process.exit(1);
  }
}

forzaRipristino();