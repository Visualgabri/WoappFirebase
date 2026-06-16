import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query } from "firebase/firestore";

const firebaseConfig = {
  projectId: "woapp-56ae7",
  appId: "1:58672301333:web:1e970134166ca44413551c",
  databaseURL: "https://woapp-56ae7-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "woapp-56ae7.firebasestorage.app",
  apiKey: "AIzaSyDEhXXADVrmka6SbdgsiCpsH_UbzewKpNg",
  authDomain: "woapp-56ae7.firebaseapp.com",
  messagingSenderId: "58672301333"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function run() {
  const snap = await getDocs(collection(db, "WORKOUT_T"));
  snap.docs.forEach(doc => {
    const data = doc.data();
    if (String(data.NomeCognomeTM).toLowerCase().includes("gabriele") || String(data.ID_cliente) === "8" || String(data.ID_cliente) === "6") {
      console.log("ID:", doc.id, "Data:", JSON.stringify(data, null, 2));
    }
  });
  
  // also check STORYBOARD to find gabriele's ID
  const snap2 = await getDocs(collection(db, "STORYBOARD"));
  let gabId = null;
  for (let d of snap2.docs) {
    if (String(d.data().nome_atleta).toLowerCase().includes("gabriele")) {
      console.log("STORYBOARD Gabriele ID:", d.data().ID_cliente, "scheda:", d.data().num_scheda);
      gabId = d.data().ID_cliente;
      break;
    }
  }
  process.exit(0);
}
run();
