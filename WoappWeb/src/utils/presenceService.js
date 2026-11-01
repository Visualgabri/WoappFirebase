// src/utils/presenceService.js
import { ref, set, onDisconnect, onValue, push, query, limitToLast, remove } from 'firebase/database';
import { rtdb } from '../firebase.js';
import { utente, idCliente, ruolo, getNomeAtleta } from '../authStore.js';

let presenceInitialized = false;
let connectedUnsubscribe = null;
let currentPresenceRef = null;

/**
 * Risolve ID e Nome dell'utente attivo corrente
 */
export const getDatiUtenteCorrente = () => {
  const user = utente.value;
  const currentRole = ruolo.value || 'atleta';
  const rawId = idCliente.value;
  const email = (user?.email || '').trim().toLowerCase();

  let id = String(rawId || '').trim();
  if (!id) {
    if (currentRole === 'coach' || email === 'visualgabri@gmail.com') {
      id = 'coach';
    } else {
      id = email.replace(/[^a-zA-Z0-9]/g, '_') || 'anonimo';
    }
  }

  let nome = '';
  if (currentRole === 'coach' || id === 'coach' || email === 'visualgabri@gmail.com') {
    nome = 'Coach (Gabriele)';
  } else {
    nome = getNomeAtleta(id) || email.split('@')[0] || `Atleta #${id}`;
  }

  return { id, nome, ruolo: currentRole, email };
};

/**
 * Inizializza il tracciamento della presenza in tempo reale tramite RTDB (.info/connected + onDisconnect)
 * Consumo quote Firestore: ZERO
 */
export const initPresenceTracking = () => {
  if (!rtdb) return;

  const { id, nome, ruolo: userRuolo, email } = getDatiUtenteCorrente();
  if (!id || id === 'anonimo') return;

  // Evita re-inizializzazioni duplicate per lo stesso utente
  if (presenceInitialized && currentPresenceRef) {
    return;
  }

  try {
    const isMobile = /Mobi|Android|iPhone|iPad/i.test(typeof navigator !== 'undefined' ? navigator.userAgent : '');
    const userPresenceRef = ref(rtdb, `presenza/${id}`);
    currentPresenceRef = userPresenceRef;

    const connectedRef = ref(rtdb, '.info/connected');
    connectedUnsubscribe = onValue(connectedRef, (snap) => {
      if (snap.val() === true) {
        // Quando cade la connessione o si chiude la scheda, Firebase rimuove automaticamente il nodo
        onDisconnect(userPresenceRef).remove().catch((e) => {
          console.warn('[Presence] onDisconnect error:', e);
        });

        // Imposta lo stato online
        set(userPresenceRef, {
          id,
          nome,
          ruolo: userRuolo,
          email,
          online: true,
          ultimo_accesso: Date.now(),
          device: isMobile ? 'Mobile' : 'Desktop'
        }).then(() => {
          presenceInitialized = true;
        }).catch((e) => {
          console.warn('[Presence] set error:', e);
        });

        // Registra il log di accesso (massimo 1 volta ogni 15 minuti per sessione)
        const sessionKey = `woapp_access_logged_${id}`;
        const lastLog = sessionStorage.getItem(sessionKey);
        const adesso = Date.now();
        if (!lastLog || (adesso - parseInt(lastLog, 10)) > 15 * 60 * 1000) {
          sessionStorage.setItem(sessionKey, String(adesso));
          logAttivitaRealtime({
            tipo: 'accesso',
            azione: 'Ha aperto l\'app',
            dettagli: isMobile ? 'Smartphone' : 'Computer',
            customId: id,
            customNome: nome
          });
        }
      }
    });
  } catch (error) {
    console.warn('[Presence] Errore inizializzazione presenza:', error);
  }
};

/**
 * Rimuove lo stato di presenza (es. al logout)
 */
export const cleanupPresence = async () => {
  if (connectedUnsubscribe) {
    try { connectedUnsubscribe(); } catch (e) {}
    connectedUnsubscribe = null;
  }
  if (currentPresenceRef) {
    try { await remove(currentPresenceRef); } catch (e) {}
    currentPresenceRef = null;
  }
  presenceInitialized = false;
};

/**
 * Scrive un evento nel feed in tempo reale di RTDB (/attivita_live)
 * @param {Object} param
 * @param {'accesso' | 'peso'} param.tipo
 * @param {string} param.azione - es. "Ha salvato 80kg su Panca Piana"
 * @param {string} [param.dettagli]
 * @param {string} [param.customId]
 * @param {string} [param.customNome]
 */
export const logAttivitaRealtime = async ({ tipo = 'peso', azione, dettagli = '', customId = null, customNome = null }) => {
  if (!rtdb || !azione) return;

  try {
    const dati = getDatiUtenteCorrente();
    const userId = customId || dati.id;
    const nome = customNome || dati.nome;

    const logRef = ref(rtdb, 'attivita_live');
    await push(logRef, {
      userId: String(userId),
      nome,
      tipo,
      azione,
      dettagli: String(dettagli || ''),
      timestamp: Date.now()
    });
  } catch (err) {
    console.warn('[Presence] Errore scrittura log attività live:', err);
  }
};

/**
 * Ascolta la presenza in tempo reale di tutti gli utenti online (/presenza)
 * ATTENZIONE: Da invocare SOLO nella vista Coach per non consumare banda negli atleti.
 * @param {Function} callback - Riceve un array di utenti online: [{ id, nome, ruolo, device, ultimo_accesso }]
 * @returns {Function} unsubscribe
 */
export const ascoltaPresenzaLive = (callback) => {
  if (!rtdb) return () => {};

  const presenceRef = ref(rtdb, 'presenza');
  const unsubscribe = onValue(presenceRef, (snap) => {
    const val = snap.val() || {};
    const utentiOnline = Object.values(val).filter(u => u && u.online);
    callback(utentiOnline);
  }, (err) => {
    console.warn('[Presence] Errore listener presenza:', err);
  });

  return unsubscribe;
};

/**
 * Ascolta il feed delle ultime attività live (/attivita_live)
 * ATTENZIONE: Da invocare SOLO nella vista Coach.
 * @param {Function} callback - Riceve array ordinato dal più recente al meno recente
 * @param {number} [limit=30]
 * @returns {Function} unsubscribe
 */
export const ascoltaAttivitaLive = (callback, limit = 30) => {
  if (!rtdb) return () => {};

  const liveQuery = query(ref(rtdb, 'attivita_live'), limitToLast(limit));
  const unsubscribe = onValue(liveQuery, (snap) => {
    const val = snap.val() || {};
    const list = Object.keys(val).map(key => ({
      key,
      ...val[key]
    }));
    // Ordina dal più recente al più vecchio
    list.sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
    callback(list);
  }, (err) => {
    console.warn('[Presence] Errore listener attività live:', err);
  });

  return unsubscribe;
};
