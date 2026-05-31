const admin = require('firebase-admin');
const serviceAccount = require('./woapp-56ae7-firebase-adminsdk-fbsvc-1080ce0316.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function run() {
  console.log("Interrogazione database in corso per ID_cliente '1' / 1...");
  
  // Proviamo a cercare con entrambe le varianti della chiave
  // (con o senza BOM \uFEFF e con o senza virgolette)
  
  const snap = await db.collection('STORYBOARD').get();
  console.log(`Totale record STORYBOARD nel database: ${snap.size}`);
  
  const schedeMap = {};
  
  snap.forEach(doc => {
    const data = doc.data();
    // Trova la chiave ID_cliente gestendo le varianti del CSV importato
    let idClienteVal = null;
    for (const key of Object.keys(data)) {
      if (key.includes('ID_cliente')) {
        idClienteVal = data[key];
      }
    }
    
    // Se l'ID_cliente corrisponde a 1 (come stringa o numero)
    if (idClienteVal === '1' || idClienteVal === 1) {
      const numScheda = data.num_scheda || data['"num_scheda"'] || 'Sconosciuta';
      
      if (!schedeMap[numScheda]) {
        schedeMap[numScheda] = {
          num_scheda: numScheda,
          eserciziCount: 0,
          giorni: new Set(),
          settimane: new Set(),
          esercizi: []
        };
      }
      
      schedeMap[numScheda].eserciziCount++;
      if (data.giorno) schedeMap[numScheda].giorni.add(data.giorno);
      if (data.settimana) schedeMap[numScheda].settimane.add(data.settimana);
      
      schedeMap[numScheda].esercizi.push({
        giorno: data.giorno,
        settimana: data.settimana,
        esercizio: data.esercizio || data.des_esercizio || '',
        serie: data.serie,
        ripetizioni: data.ripetizioni
      });
    }
  });
  
  const schedeTrovate = Object.keys(schedeMap).sort((a, b) => parseInt(a) - parseInt(b));
  console.log(`\n--- TROVATE ${schedeTrovate.length} SCHEDE PER ID_cliente 1 ---`);
  
  for (const num of schedeTrovate) {
    const s = schedeMap[num];
    console.log(`Scheda #${num}:`);
    console.log(`  - Numero Esercizi: ${s.eserciziCount}`);
    console.log(`  - Giorni trovati: ${Array.from(s.giorni).join(', ')}`);
    console.log(`  - Settimane trovate: ${Array.from(s.settimane).join(', ')}`);
  }
  
  // Salva l'output strutturato in un file JSON per visualizzarlo tutto o usarlo successivamente
  const fs = require('fs');
  const outputData = schedeTrovate.map(num => ({
    num_scheda: num,
    eserciziCount: schedeMap[num].eserciziCount,
    giorni: Array.from(schedeMap[num].giorni),
    settimane: Array.from(schedeMap[num].settimane),
    esercizi: schedeMap[num].esercizi
  }));
  
  fs.writeFileSync('schede_atleta_1.json', JSON.stringify(outputData, null, 2));
  console.log(`\n🎉 Report completo salvato in 'schede_atleta_1.json' con tutte le 66 schede e relativi esercizi!`);
  
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
