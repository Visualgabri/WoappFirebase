// src/firebase.js
import { initializeApp, getApps } from "firebase/app";
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager, getFirestore } from "firebase/firestore";

// Configurazione reale di Firebase per WoappWeb
const firebaseConfig = {
  projectId: "woapp-56ae7",
  appId: "1:58672301333:web:1e970134166ca44413551c",
  databaseURL: "https://woapp-56ae7-default-rtdb.europe-west1.firebasedatabase.app",
  storageBucket: "woapp-56ae7.firebasestorage.app",
  apiKey: "AIzaSyDEhXXADVrmka6SbdgsiCpsH_UbzewKpNg",
  authDomain: "woapp-56ae7.firebaseapp.com",
  messagingSenderId: "58672301333"
};

// Inizializza l'app prevenendo l'errore di duplicazione durante l'HMR di Vite
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];

// Inizializza il database con persistenza offline locale reattiva (IndexedDB)
let firestoreDb;
try {
  firestoreDb = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager()
    })
  });
} catch (e) {
  console.warn("Firestore già inizializzato, uso getFirestore fallback:", e);
  firestoreDb = getFirestore(app);
}

export const db = firestoreDb;

// Inizializza ed esporta Firebase Auth
import { getAuth } from "firebase/auth";
export const auth = getAuth(app);