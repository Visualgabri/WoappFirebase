import { collection, doc, getDocs, getDoc, setDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import { MAPPA_CLIENTI, getNomeAtleta, isAtletaAttivo } from '../authStore.js';

const CACHE_KEY = 'woapp_riepilogo_clienti_cache';
const CACHE_TIMESTAMP_KEY = 'woapp_riepilogo_clienti_timestamp';
const CACHE_TTL_MS = 15 * 60 * 1000; // 15 minuti di cache per evitare qualsiasi consumo quote superfluo

/**
 * Converte timestamp Firestore, stringa ISO o stringa italiana 'DD/MM/YYYY HH:mm:ss' in oggetto Date.
 */
export const analizzaDataInserimento = (raw) => {
  if (!raw) return null;
  if (raw instanceof Date) return raw;
  if (typeof raw === 'object' && typeof raw.toDate === 'function') {
    return raw.toDate();
  }

  const str = String(raw).trim();
  if (!str) return null;

  // Formato ISO (es. 2026-10-27T18:49:05 o 2026-10-27 18:49:05)
  if (str.includes('-')) {
    const isoClean = str.replace(' ', 'T');
    const parsed = new Date(isoClean);
    if (!isNaN(parsed.getTime())) return parsed;
  }

  // Formato italiano (es. 27/10/2026 18:49:05 o 27/10/2026)
  if (str.includes('/')) {
    const parts = str.split(' ');
    const dateParts = parts[0].split('/');
    if (dateParts.length === 3) {
      const gg = parseInt(dateParts[0], 10);
      const mm = parseInt(dateParts[1], 10) - 1;
      const aaaa = parseInt(dateParts[2], 10);
      let hh = 0, min = 0, ss = 0;
      if (parts[1]) {
        const timeParts = parts[1].split(':');
        hh = parseInt(timeParts[0] || '0', 10);
        min = parseInt(timeParts[1] || '0', 10);
        ss = parseInt(timeParts[2] || '0', 10);
      }
      const d = new Date(aaaa, mm, gg, hh, min, ss);
      if (!isNaN(d.getTime())) return d;
    }
  }

  const generic = new Date(str);
  return isNaN(generic.getTime()) ? null : generic;
};

/**
 * Calcola la formattazione testuale del tempo trascorso e il semaforo (green, yellow, red).
 */
export const calcolaTempoTrascorso = (data) => {
  if (!data) {
    return {
      testo: 'Nessun inserimento registrato',
      giorni: 999,
      stato: 'red',
      etichettaBreve: 'Mai inserito'
    };
  }

  const target = analizzaDataInserimento(data);
  if (!target) {
    return {
      testo: 'Data non disponibile',
      giorni: 999,
      stato: 'red',
      etichettaBreve: 'N/D'
    };
  }

  const adesso = new Date();
  const diffMs = adesso.getTime() - target.getTime();
  const diffMinuti = Math.floor(diffMs / (60 * 1000));
  const diffOre = Math.floor(diffMs / (60 * 60 * 1000));
  const diffGiorni = Math.floor(diffMs / (24 * 60 * 60 * 1000));

  let testo = '';
  let etichettaBreve = '';
  let stato = 'green';

  if (diffMinuti < 2) {
    testo = 'Pochi secondi fa';
    etichettaBreve = 'Adesso';
    stato = 'green';
  } else if (diffMinuti < 60) {
    testo = `${diffMinuti} minuti fa`;
    etichettaBreve = `${diffMinuti}m fa`;
    stato = 'green';
  } else if (diffOre < 24) {
    testo = `${diffOre} ${diffOre === 1 ? 'ora' : 'ore'} fa`;
    etichettaBreve = `${diffOre}h fa`;
    stato = 'green';
  } else if (diffGiorni === 1) {
    testo = 'Ieri';
    etichettaBreve = 'Ieri';
    stato = 'green';
  } else if (diffGiorni <= 2) {
    testo = `${diffGiorni} giorni fa`;
    etichettaBreve = `${diffGiorni}gg fa`;
    stato = 'green';
  } else if (diffGiorni <= 5) {
    testo = `${diffGiorni} giorni fa`;
    etichettaBreve = `${diffGiorni}gg fa`;
    stato = 'yellow';
  } else {
    testo = `${diffGiorni} giorni fa ⚠️`;
    etichettaBreve = `${diffGiorni}gg fa`;
    stato = 'red';
  }

  return {
    testo,
    giorni: diffGiorni >= 0 ? diffGiorni : 0,
    stato,
    etichettaBreve,
    dataFormattata: target.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
  };
};

/**
 * Calcola al volo e salva lo stato su Firestore CLIENT/{id} analizzando la scheda attuale in STORYBOARD.
 * Utilizzato solo in caso di ricalcolo o se il record non è ancora presente.
 */
export const ricalcolaESalvaStatoAtleta = async (idCliente, numSchedaInput = null) => {
  const cleanId = String(idCliente || '').trim();
  if (!cleanId) return null;

  try {
    let scheda = numSchedaInput;
    if (!scheda) {
      // Cerca in CLIENTI
      const cSnap = await getDoc(doc(db, 'CLIENTI', cleanId));
      if (cSnap.exists()) {
        scheda = cSnap.data().SchedaSelezionata;
      }
      if (!scheda) {
        scheda = MAPPA_CLIENTI[cleanId]?.scheda;
      }
    }

    if (!scheda) return null;

    // Leggi le righe della scheda attiva in STORYBOARD
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', cleanId),
      where('num_scheda', '==', String(scheda))
    );
    let sSnap = await getDocs(q);
    if (sSnap.empty && !isNaN(Number(cleanId))) {
      sSnap = await getDocs(query(collection(db, 'STORYBOARD'), where('ID_cliente', '==', Number(cleanId)), where('num_scheda', '==', String(scheda))));
    }

    let maxWeek = 1;
    let latestTimestamp = null;
    let giorniTotali = new Set();
    let giorniChiusiPerWeek = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 };

    sSnap.forEach((docSnap) => {
      const data = docSnap.data();
      const g = (data.des_giorno || '').trim().toUpperCase();
      if (g) giorniTotali.add(g);

      for (let w = 1; w <= 6; w++) {
        const ins = data['ins_week' + w];
        if (ins && String(ins).trim() !== '' && String(ins).trim() !== '-') {
          if (w > maxWeek) maxWeek = w;
        }

        const isCmp = data['cmp' + w] === 'SI' || data['cmp' + w] === true || data['cmp' + w] === '1';
        if (isCmp) {
          giorniChiusiPerWeek[w] = (giorniChiusiPerWeek[w] || 0) + 1;
          if (w >= maxWeek) {
            maxWeek = Math.min(6, w + 1);
          }
        }
      }

      const t = data.timestamp_ute || data.timestamp;
      if (t) {
        const parsedT = analizzaDataInserimento(t);
        const parsedLatest = analizzaDataInserimento(latestTimestamp);
        if (parsedT && (!parsedLatest || parsedT.getTime() > parsedLatest.getTime())) {
          latestTimestamp = t;
        }
      }
    });

    const settimaneTotali = 6;
    const settimaneMancanti = Math.max(0, settimaneTotali - maxWeek);
    const percCompletamento = Math.min(100, Math.round((maxWeek / settimaneTotali) * 100));

    const statoPayload = {
      num_scheda: String(scheda),
      settimana_corrente: maxWeek,
      settimane_totali: settimaneTotali,
      settimane_mancanti: settimaneMancanti,
      perc_completamento: percCompletamento,
      ultimo_inserimento: latestTimestamp ? (analizzaDataInserimento(latestTimestamp)?.toISOString() || latestTimestamp) : null,
      ultimo_inserimento_ute: latestTimestamp ? String(latestTimestamp) : null,
      aggiornato_il: new Date().toISOString()
    };

    // Scrivi su Firestore in CLIENTI/{cleanId} con merge
    await setDoc(doc(db, 'CLIENTI', cleanId), { riepilogo_workout: statoPayload }, { merge: true });

    return statoPayload;
  } catch (err) {
    console.error(`Errore ricalcolo stato atleta ${cleanId}:`, err);
    return null;
  }
};

/**
 * Aggiorna lo stato in background mentre l'atleta si allena (Zero costo aggiuntivo di lettura).
 */
export const aggiornaRiepilogoAtletaLive = async ({ idCliente, numScheda, settimanaCorrente }) => {
  const cleanId = String(idCliente || '').trim();
  if (!cleanId || !numScheda) return;

  try {
    const week = Math.min(6, Math.max(1, parseInt(settimanaCorrente, 10) || 1));
    const now = new Date();
    const nowIso = now.toISOString();
    const gg = String(now.getDate()).padStart(2, '0');
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const aaaa = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, '0');
    const min = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const nowUte = `${gg}/${mm}/${aaaa} ${hh}:${min}:${ss}`;

    const payload = {
      num_scheda: String(numScheda),
      settimana_corrente: week,
      settimane_totali: 6,
      settimane_mancanti: Math.max(0, 6 - week),
      perc_completamento: Math.round((week / 6) * 100),
      ultimo_inserimento: nowIso,
      ultimo_inserimento_ute: nowUte,
      aggiornato_il: nowIso
    };

    await setDoc(doc(db, 'CLIENTI', cleanId), { riepilogo_workout: payload }, { merge: true });

    // Invalida cache locale per riflettere le modifiche
    localStorage.removeItem(CACHE_TIMESTAMP_KEY);
  } catch (e) {
    console.warn("Aggiornamento riepilogo live saltato:", e);
  }
};

/**
 * Carica il riepilogo completo di tutti i clienti attivi:
 * - Se la cache locale è valida (< 15 min), restituisce subito i dati a 0 letture Firestore!
 * - Altrimenti effettua una singola lettura della collezione CLIENTI (soli ~22 documenti).
 */
export const caricaRiepilogoClientiPerCoach = async (forceRefresh = false) => {
  const now = Date.now();
  const lastTime = parseInt(localStorage.getItem(CACHE_TIMESTAMP_KEY) || '0', 10);
  const isCacheValida = (now - lastTime) < CACHE_TTL_MS;

  if (!forceRefresh && isCacheValida) {
    try {
      const cached = JSON.parse(localStorage.getItem(CACHE_KEY) || '[]');
      if (Array.isArray(cached) && cached.length > 0) {
        // Ricalcola solo i giorni di inattività rispetto al momento attuale
        return cached.map(item => {
          const recency = calcolaTempoTrascorso(item.ultimoInserimentoRaw);
          return {
            ...item,
            tempoTrascorso: recency.testo,
            etichettaTempo: recency.etichettaBreve,
            giorniInattivita: recency.giorni,
            statoInattivita: recency.stato,
            dataFormattata: recency.dataFormattata
          };
        });
      }
    } catch (e) {
      console.warn("Lettura cache riepilogo fallita, scarico da Firestore:", e);
    }
  }

  // Lettura da Firestore: solo la collezione CLIENTI (circa 22 letture in totale!)
  const snap = await getDocs(collection(db, 'CLIENTI'));
  const listaClienti = [];
  const mapPresenti = new Set();

  snap.forEach((docSnap) => {
    const data = docSnap.data();
    const id = String(data.ID_cliente || docSnap.id).trim();
    if (!id) return;
    mapPresenti.add(id);

    // Verifica se attivo
    let attivo = true;
    if (data.flg_attivo !== undefined) {
      attivo = Boolean(data.flg_attivo);
    } else if (data.flg_obsoleto !== undefined) {
      attivo = !(data.flg_obsoleto === 'SI' || data.flg_obsoleto === 'TRUE' || data.flg_obsoleto === '1');
    } else if (MAPPA_CLIENTI[id]?.obsoleto !== undefined) {
      attivo = !MAPPA_CLIENTI[id].obsoleto;
    }

    const nome = (data.Nome || data.nome || MAPPA_CLIENTI[id]?.nome || '').trim();
    const cognome = (data.Cognome || data.cognome || MAPPA_CLIENTI[id]?.cognome || '').trim();
    const nomeCompleto = `${nome} ${cognome}`.trim() || getNomeAtleta(id);
    const scheda = String(data.SchedaSelezionata || MAPPA_CLIENTI[id]?.scheda || '').trim();
    const sesso = String(data.flg_sesso || MAPPA_CLIENTI[id]?.sesso || 'M').toUpperCase();

    const riepilogo = data.riepilogo_workout || null;
    const settimanaCorrente = riepilogo?.settimana_corrente || 1;
    const settimaneTotali = riepilogo?.settimane_totali || 6;
    const settimaneMancanti = riepilogo?.settimane_mancanti !== undefined 
      ? riepilogo.settimane_mancanti 
      : Math.max(0, settimaneTotali - settimanaCorrente);
    const percCompletamento = riepilogo?.perc_completamento || Math.round((settimanaCorrente / settimaneTotali) * 100);

    const ultimoInsRaw = riepilogo?.ultimo_inserimento || riepilogo?.ultimo_inserimento_ute || null;
    const recency = calcolaTempoTrascorso(ultimoInsRaw);

    listaClienti.push({
      id,
      nome,
      cognome,
      nomeCompleto,
      sesso,
      attivo,
      scheda: scheda || (riepilogo?.num_scheda || 'N/D'),
      settimanaCorrente,
      settimaneTotali,
      settimaneMancanti,
      percCompletamento,
      ultimoInserimentoRaw: ultimoInsRaw,
      tempoTrascorso: recency.testo,
      etichettaTempo: recency.etichettaBreve,
      giorniInattivita: recency.giorni,
      statoInattivita: recency.stato,
      dataFormattata: recency.dataFormattata,
      haRiepilogoSalvato: !!riepilogo
    });
  });

  // Aggiungi eventuali atleti attivi da MAPPA_CLIENTI che non avevano il doc su Firestore
  Object.keys(MAPPA_CLIENTI).forEach((id) => {
    if (!mapPresenti.has(id)) {
      const c = MAPPA_CLIENTI[id];
      const attivo = isAtletaAttivo(id);
      const nomeCompleto = `${c.nome || ''} ${c.cognome || ''}`.trim() || `Atleta #${id}`;
      const recency = calcolaTempoTrascorso(null);

      listaClienti.push({
        id,
        nome: c.nome || '',
        cognome: c.cognome || '',
        nomeCompleto,
        sesso: c.sesso || 'M',
        attivo,
        scheda: String(c.scheda || 'N/D'),
        settimanaCorrente: 1,
        settimaneTotali: 6,
        settimaneMancanti: 5,
        percCompletamento: 16,
        ultimoInserimentoRaw: null,
        tempoTrascorso: recency.testo,
        etichettaTempo: recency.etichettaBreve,
        giorniInattivita: recency.giorni,
        statoInattivita: recency.stato,
        dataFormattata: recency.dataFormattata,
        haRiepilogoSalvato: false
      });
    }
  });

  // Salva nella cache locale
  localStorage.setItem(CACHE_KEY, JSON.stringify(listaClienti));
  localStorage.setItem(CACHE_TIMESTAMP_KEY, String(Date.now()));

  return listaClienti;
};
