import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, query, where } from "firebase/firestore";

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
  try {
    const q = query(collection(db, 'WORKOUT_T'), where('ID_cliente', '==', "1"), where('num_scheda', '==', "66"));
    const snap = await getDocs(q);
    console.log("Found:", snap.docs.length);
  } catch(e) {
    console.error("Error querying:", e.message);
  }
  process.exit(0);
}
run();
