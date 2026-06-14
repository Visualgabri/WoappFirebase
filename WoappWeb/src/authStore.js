import { ref, watch } from 'vue';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from './firebase.js';

// Inizializza lo stato dal localStorage per mantenere la sessione attiva al refresh
const emailSalvata = localStorage.getItem('utenteEmail');
let initialRuolo = localStorage.getItem('ruolo') || 'atleta';
let initialIdCliente = localStorage.getItem('idCliente') || '';

// Forza il ruolo a 'coach' per l'email del Coach (visualgabri@gmail.com)
if (emailSalvata && emailSalvata.trim().toLowerCase() === 'visualgabri@gmail.com') {
  initialRuolo = 'coach';
  initialIdCliente = '1';
}

export const utente = ref(emailSalvata ? { email: emailSalvata } : null);
export const idCliente = ref(initialIdCliente);
export const ruolo = ref(initialRuolo); // 'atleta' o 'coach'
export const loadingAuth = ref(false); // Immediatamente pronto nel sistema passwordless

// Stato di selezione globale Atleta e Scheda (in stile AppSheet)
export const selectedAthlete = ref(localStorage.getItem('selectedAthlete') || '');
export const selectedSheet = ref(localStorage.getItem('selectedSheet') || '');

// Aggiorna Atleta selezionato globally
export const setSelectedAthlete = (val) => {
  selectedAthlete.value = val;
  localStorage.setItem('selectedAthlete', val);
  syncStoryboardListener();
};

// Aggiorna Scheda selezionata globally
export const setSelectedSheet = (val) => {
  selectedSheet.value = val;
  localStorage.setItem('selectedSheet', val);
  syncStoryboardListener();
};

// Avvia o aggiorna la sessione utente locale
export const inizializzaSessione = (email, idCli, rlo) => {
  const cleanEmail = String(email || '').trim().toLowerCase();

  // Forza il ruolo a 'coach' per l'email del Coach (visualgabri@gmail.com)
  let finalRuolo = rlo || 'atleta';
  let finalIdCliente = idCli || '';

  if (cleanEmail === 'visualgabri@gmail.com') {
    finalRuolo = 'coach';
    finalIdCliente = '1';
  }

  utente.value = { email };
  idCliente.value = finalIdCliente;
  ruolo.value = finalRuolo;

  localStorage.setItem('utenteEmail', email);
  localStorage.setItem('idCliente', idCliente.value);
  localStorage.setItem('ruolo', ruolo.value);

  // Se è un atleta, imposta automaticamente se stesso come atleta selezionato
  if (finalRuolo === 'atleta' && finalIdCliente) {
    setSelectedAthlete(finalIdCliente);
  } else if (finalRuolo === 'coach') {
    // Se entra come coach, pre-seleziona il primo atleta se non ce n'è uno salvato
    if (!selectedAthlete.value) {
      setSelectedAthlete('1'); // Di default Gabriele Belmonte
    }
  }
};

// Chiude la sessione e pulisce il localStorage
export const logout = async () => {
  utente.value = null;
  idCliente.value = '';
  ruolo.value = 'atleta';
  selectedAthlete.value = '';
  selectedSheet.value = '';

  localStorage.removeItem('utenteEmail');
  localStorage.removeItem('idCliente');
  localStorage.removeItem('ruolo');
  localStorage.removeItem('selectedAthlete');
  localStorage.removeItem('selectedSheet');

  if (storyboardUnsubscribe) {
    storyboardUnsubscribe();
    storyboardUnsubscribe = null;
  }
  globalStoryboard.value = [];
};

// Stato di Timer Globale per il Recupero (Premium UX)
export const activeTimer = ref(null); // { remainingSeconds, totalSeconds, label, isPaused, intervalId }

// Stato per il pulsante fluttuante Play globale "Vai al da fare"
export const globalHaEserciziDaFare = ref(localStorage.getItem('globalHaEserciziDaFare') === 'true');
export const globalSettimanaDaChiudere = ref(localStorage.getItem('globalSettimanaDaChiudere') === 'true');
export const playClickTrigger = ref(0);

export const setGlobalHaEserciziDaFare = (val) => {
  globalHaEserciziDaFare.value = !!val;
  localStorage.setItem('globalHaEserciziDaFare', val ? 'true' : 'false');
};

export const setGlobalSettimanaDaChiudere = (val) => {
  globalSettimanaDaChiudere.value = !!val;
  localStorage.setItem('globalSettimanaDaChiudere', val ? 'true' : 'false');
};

export const triggerPlayClick = () => {
  playClickTrigger.value++;
};

// Stato per il Calcolatore dei Dischi (Plate Calculator)
export const mostraDialogCalcolatoreDischi = ref(false);
export const targetPesoTotale = ref(0);
export const targetPesoLato = ref(0);
export const modalitaCalcolo = ref('totale'); // 'totale' o 'lato'
export const tipoBilanciere = ref(20);
export const nascondiLato = ref(false);
export const caricoMonolaterale = ref('doppio'); // 'doppio' o 'singolo'
export const nomeEsercizioCalcolatore = ref('');

const rilevaCaricoMonolateraleSmart = (nomeEsercizio) => {
  if (!nomeEsercizio) return 'doppio';
  const lower = String(nomeEsercizio).toLowerCase();
  const keywords = [
    'hip thrust', 'hipthrust', 'belt', 'cintura', 'dip', 'trazioni', 
    'zavorra', 'zavorrate', 'monolaterale', 'singolo', 'one arm',
    'sovraccarico'
  ];
  return keywords.some(k => lower.includes(k)) ? 'singolo' : 'doppio';
};

const rilevaPesoBilanciereSmart = (nomeEsercizio, savedBar) => {
  if (!nomeEsercizio) return savedBar;
  const lower = String(nomeEsercizio).toLowerCase();
  
  // Se contiene esplicitamente "bilanciere", "bil.", "ez" o "barbell", allora usa il bilanciere di default (savedBar)
  if (lower.includes('bilanciere') || lower.includes('bil.') || lower.includes('ez') || lower.includes('barbell')) {
    return savedBar;
  }
  
  // Altrimenti, se contiene parole chiave tipiche di macchine, manubri, cavi o corpo libero, metti 0
  const zeroKeywords = [
    'pressa', 'press', 'cavo', 'cavi', 'cable', 'macchina', 'machine', 
    'manubri', 'manubrio', 'db', 'dumbbell', 'trazioni', 'dip', 'piegamenti',
    'corpo libero', 'crunch', 'addome', 'plank', 'pulley', 'pectoral',
    'extension', 'curl', 'adductor', 'abductor', 'multipower', 'hack squat',
    'smith', 'glute', 'vertical traction', 'low row', 'rower', 'calf',
    'crossover', 'lat', 'peck'
  ];
  
  if (zeroKeywords.some(k => lower.includes(k))) {
    return 0; // Macchina / Senza bilanciere
  }
  
  return savedBar;
};

export const apriCalcolatoreDischi = (pesoTotaleStr, pesoLatoStr, cliccatoSu, nomeEsercizio = '') => {
  modalitaCalcolo.value = cliccatoSu || 'totale';
  nomeEsercizioCalcolatore.value = nomeEsercizio;

  // Verifica se l'esercizio ha il peso per lato
  const haPesoLato = !!(pesoLatoStr && String(pesoLatoStr).trim() !== '' && String(pesoLatoStr).trim() !== '0');
  nascondiLato.value = !haPesoLato;

  // Rileva se si tratta di caricamento monolaterale/cintura zavorra
  caricoMonolaterale.value = rilevaCaricoMonolateraleSmart(nomeEsercizio);

  const parseWeight = (val) => {
    if (val === undefined || val === null) return 0;
    const clean = String(val).replace(/,/g, '.').replace(/[^\d.]/g, '').trim();
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : num;
  };

  const tot = parseWeight(pesoTotaleStr);
  const lat = parseWeight(pesoLatoStr);

  const savedBar = parseFloat(localStorage.getItem('woapp_default_bilanciere') || '20');

  // Determina il bilanciere di default in base a smart-detection e presenza del peso per lato
  let defaultBar = savedBar;
  if (!haPesoLato) {
    defaultBar = 0; // Se non ha il peso per lato, metti come default Senza bilanciere (0)
  } else {
    defaultBar = rilevaPesoBilanciereSmart(nomeEsercizio, savedBar);
  }

  const divider = caricoMonolaterale.value === 'singolo' ? 1 : 2;
  const multiplier = caricoMonolaterale.value === 'singolo' ? 1 : 2;

  if (cliccatoSu === 'lato' && haPesoLato) {
    targetPesoLato.value = lat;
    const bar = (lat * multiplier >= defaultBar) ? defaultBar : 0;
    tipoBilanciere.value = bar;
    targetPesoTotale.value = lat * multiplier + bar;
  } else {
    targetPesoTotale.value = tot;
    tipoBilanciere.value = defaultBar;
    
    const bar = defaultBar;
    const latoCalc = (tot - bar) / divider;
    targetPesoLato.value = latoCalc > 0 ? latoCalc : 0;
  }

  mostraDialogCalcolatoreDischi.value = true;
};

let silentAudioCtx = null;
let silentSource = null;

const startBackgroundKeepAlive = () => {
  try {
    if (window.Notification && Notification.permission === 'default') {
      Notification.requestPermission();
    }

    if (silentAudioCtx && silentAudioCtx.state === 'suspended') {
      silentAudioCtx.resume();
      return;
    }
    if (silentAudioCtx) return;

    silentAudioCtx = new (window.AudioContext || window.webkitAudioContext)();

    // Create a 1-second silent buffer (zeros)
    const buffer = silentAudioCtx.createBuffer(1, silentAudioCtx.sampleRate, silentAudioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = 0;
    }

    silentSource = silentAudioCtx.createBufferSource();
    silentSource.buffer = buffer;
    silentSource.loop = true;
    silentSource.connect(silentAudioCtx.destination);
    silentSource.start(0);
  } catch (err) {
    console.warn("Non è stato possibile avviare il keep-alive audio silenzioso:", err);
  }
};

const stopBackgroundKeepAlive = () => {
  try {
    if (silentSource) {
      silentSource.stop();
      silentSource.disconnect();
      silentSource = null;
    }
    if (silentAudioCtx) {
      silentAudioCtx.close();
      silentAudioCtx = null;
    }
  } catch (err) {
    console.warn("Non è stato possibile fermare il keep-alive audio silenzioso:", err);
  }
};

const playBeepSequence = () => {
  try {
    const alarmCtx = new (window.AudioContext || window.webkitAudioContext)();

    const playBeep = (startTime) => {
      const osc = alarmCtx.createOscillator();
      const gainNode = alarmCtx.createGain();

      osc.connect(gainNode);
      gainNode.connect(alarmCtx.destination);

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1000, startTime); // 1000 Hz, nota molto udibile

      gainNode.gain.setValueAtTime(0, startTime);
      gainNode.gain.linearRampToValueAtTime(0.95, startTime + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.38);

      osc.start(startTime);
      osc.stop(startTime + 0.4);
    };

    playBeep(alarmCtx.currentTime);
    playBeep(alarmCtx.currentTime + 0.5);
    playBeep(alarmCtx.currentTime + 1.0);

    setTimeout(() => {
      try {
        alarmCtx.close();
      } catch (e) { }
    }, 2000);
  } catch (err) {
    console.error("Non è stato possibile riprodurre la sequenza di beeps:", err);
  }
};

const sendTimerNotification = (label) => {
  if (window.Notification && Notification.permission === 'granted') {
    try {
      new Notification("Tempo Scaduto! ⏱️", {
        body: label ? `Fine recupero per: ${label}` : 'Il recupero è terminato!',
        icon: '/logo.png',
        vibrate: [200, 100, 200, 100, 200],
        tag: 'timer-recupero',
        requireInteraction: true
      });
    } catch (e) {
      console.warn("Errore nell'invio della notifica nativa:", e);
    }
  }
};

export const startGlobalTimer = (seconds, label = 'Recupero') => {
  if (activeTimer.value && activeTimer.value.intervalId) {
    clearInterval(activeTimer.value.intervalId);
  }
  stopBackgroundKeepAlive();
  activeTimer.value = {
    remainingSeconds: seconds,
    totalSeconds: seconds,
    label: label,
    isPaused: false,
    intervalId: null
  };
  resumeGlobalTimer();
};

export const pauseGlobalTimer = () => {
  if (activeTimer.value) {
    activeTimer.value.isPaused = true;
    if (activeTimer.value.intervalId) {
      clearInterval(activeTimer.value.intervalId);
      activeTimer.value.intervalId = null;
    }
    stopBackgroundKeepAlive();
  }
};

export const resumeGlobalTimer = () => {
  if (!activeTimer.value) return;
  activeTimer.value.isPaused = false;
  if (navigator.vibrate) {
    navigator.vibrate(35);
  }

  startBackgroundKeepAlive();

  activeTimer.value.intervalId = setInterval(() => {
    if (!activeTimer.value) return;
    if (activeTimer.value.remainingSeconds > 1) {
      activeTimer.value.remainingSeconds--;
      if (activeTimer.value.remainingSeconds === 10 && navigator.vibrate) {
        navigator.vibrate([40, 40, 40]);
      }
    } else {
      stopBackgroundKeepAlive();

      if (navigator.vibrate) {
        navigator.vibrate([150, 80, 150, 80, 200]);
      }

      playBeepSequence();

      if (document.visibilityState === 'hidden') {
        sendTimerNotification(activeTimer.value.label);
      }

      clearInterval(activeTimer.value.intervalId);
      activeTimer.value = null;
    }
  }, 1000);
};

export const stopGlobalTimer = () => {
  if (activeTimer.value) {
    if (activeTimer.value.intervalId) {
      clearInterval(activeTimer.value.intervalId);
    }
    activeTimer.value = null;
    stopBackgroundKeepAlive();
  }
};

// Ordine originale degli atleti (estratto dal foglio Google)
export const ORDINE_ORIGINALE_ATLETI = [
  '1', '57', '93', '186', '219', '125', '188', '232', '193', '245',
  '164', '196', '228', '276', '19', '237', '249', '243', '263', '54',
  '268', '269', '281', '211', '178', '175', '297', '304', '274', '14',
  '313', '312', '314'
];

// Mappa statica anagrafica clienti del foglio Google originario
export const MAPPA_CLIENTI = {
  '1': { nome: 'Gabriele', cognome: 'Belmonte', email: 'visualgabri@gmail.com', scheda: 49, vista: false, obsoleto: false, stileStorico: 'timeline', modalitaSettimane: 'fissa' },
  '57': { nome: 'Jessica', cognome: 'Carletti', email: 'Jessica.carletti89@gmail.com', scheda: 36, vista: false, obsoleto: false },
  '93': { nome: 'Tiziano', cognome: 'Passetti', email: 'tizypass@gmail.com', scheda: 55, vista: null, obsoleto: false },
  '186': { nome: 'Jenny', cognome: 'Pichini', email: 'Pichinijenny@gmail.com', scheda: 14, vista: true, obsoleto: true },
  '219': { nome: 'Chiara', cognome: 'Lazzarini', email: 'chiara.lazzarini15@hotmail.com', scheda: 12, vista: true, obsoleto: true },
  '125': { nome: 'Carla', cognome: 'Leone', email: 'carlaleone59@gmail.com', scheda: 45, vista: true, obsoleto: false, stileStorico: 'tabella', modalitaSettimane: 'dinamica' },
  '188': { nome: 'Gabriele', cognome: 'Cappelli', email: 'gabrielecappelli290723@gmail.com', scheda: 29, vista: false, obsoleto: false },
  '232': { nome: 'Damiano', cognome: 'Rossi', email: 'damianorossi6@gmail.com', scheda: 23, vista: false, obsoleto: false },
  '193': { nome: 'Giulietta', cognome: 'Bernareggi', email: 'giuli@intercom.it', scheda: 23, vista: null, obsoleto: false },
  '245': { nome: 'Emanuele', cognome: 'Furia', email: 'emanuelefuria@gmail.com', scheda: 22, vista: false, obsoleto: false },
  '164': { nome: 'Riccardo', cognome: 'Manetta', email: 'rick.manetta@hotmail.it', scheda: 21, vista: false, obsoleto: true },
  '196': { nome: 'Anastasia', cognome: 'Ciampoletta', email: 'anastasia.ciampoletta@gmail.com', scheda: 19, vista: true, obsoleto: true },
  '228': { nome: 'Francesco', cognome: 'Severini', email: 'francescoseverini2001@gmail.com', scheda: 6, vista: true, obsoleto: true },
  '276': { nome: 'Gessica', cognome: 'Zucchini', email: 'gessi.zucchini@gmail.com', scheda: 18, vista: false, obsoleto: true },
  '19': { nome: 'Gianni', cognome: 'Ferranti', email: 'g.ferranti@hotmail.com', scheda: 71, vista: false, obsoleto: false },
  '237': { nome: 'Claudia', cognome: 'Caligiana', email: 'clud69@gmail.com', scheda: 23, vista: false, obsoleto: false },
  '249': { nome: 'Stefania', cognome: 'Tantari', email: 'stefysweet@hotmail.it', scheda: 20, vista: false, obsoleto: false },
  '243': { nome: 'Francesco', cognome: 'De Vitis', email: 'francesco.devitis1@gmail.com', scheda: 17, vista: false, obsoleto: false },
  '263': { nome: 'Filippo', cognome: 'Primieri', email: 'primieri.filippo@gmail.com', scheda: 1, vista: false, obsoleto: true },
  '54': { nome: 'Alessia', cognome: 'Peroli', email: 'aleperoli@gmail.com', scheda: 31, vista: false, obsoleto: true },
  '268': { nome: 'Elisa', cognome: 'Sanna', email: 'elisasanna92@gmail.com', scheda: 3, vista: true, obsoleto: true },
  '269': { nome: 'Emma', cognome: 'Viali', email: 'emmaviali02@gmail.com', scheda: 17, vista: false, obsoleto: false },
  '281': { nome: 'Claudia', cognome: 'Antonini', email: 'Antoniniclaudia3@gmail.com', scheda: 5, vista: false, obsoleto: true },
  '211': { nome: 'Eugenia', cognome: 'Falini', email: 'eugenia.falini@gmail.com', scheda: 28, vista: false, obsoleto: false },
  '178': { nome: 'Andrea', cognome: 'Giommetti', email: 'elioandreagiommetti@gmail.com', scheda: 21, vista: false, obsoleto: true },
  '175': { nome: 'Laura', cognome: 'Becchetti', email: 'becchettilauramaria@gmail.com', scheda: 26, vista: false, obsoleto: true },
  '297': { nome: 'Marina', cognome: 'Torre', email: 'marinatorre94@gmail.com', scheda: 6, vista: false, obsoleto: false },
  '304': { nome: 'Franca', cognome: 'Balducci', email: 'francabalducci@libero.it', scheda: 5, vista: false, obsoleto: false },
  '274': { nome: 'Francesco', cognome: 'Gradi', email: 'francesco.gradi.fg@gmail.com', scheda: 13, vista: false, obsoleto: false },
  '14': { nome: 'Filippo', cognome: 'Cruccolini', email: 'filippo.cruccolini@gmail.com', scheda: 7, vista: false, obsoleto: false },
  '313': { nome: 'Lucia', cognome: 'Gozzi', email: 'Luciagozzi88@hotmail.com', scheda: 3, vista: false, obsoleto: false },
  '312': { nome: 'Rachele', cognome: 'Cucurnia', email: 'Rachele.cucurnia@gmail.com', scheda: 2, vista: false, obsoleto: false },
  '314': { nome: 'Matteo', cognome: 'Delle Fate', email: 'matteodellefate@gmail.com', scheda: 1, vista: false, obsoleto: false }
};

export const getNomeAtleta = (id) => {
  const cleanId = String(id || '').trim();
  const c = MAPPA_CLIENTI[cleanId];
  if (c) {
    return `${c.nome} ${c.cognome}`;
  }
  return '';
};

export const getEmailAtleta = (id) => {
  const cleanId = String(id || '').trim();
  return MAPPA_CLIENTI[cleanId]?.email || '';
};

export const isAtletaObsoleto = (id) => {
  const cleanId = String(id || '').trim();
  return !!MAPPA_CLIENTI[cleanId]?.obsoleto;
};

export const getSchedaSelezionataAtleta = (id) => {
  const cleanId = String(id || '').trim();
  return MAPPA_CLIENTI[cleanId]?.scheda || null;
};

export const getVistaDettagliAtleta = (id) => {
  const cleanId = String(id || '').trim();
  return !!MAPPA_CLIENTI[cleanId]?.vista;
};

export const getStileStoricoAtleta = (id) => {
  const cleanId = String(id || '').trim();
  return MAPPA_CLIENTI[cleanId]?.stileStorico || 'tabella'; // Default a tabella
};

export const getModalitaSettimaneAtleta = (id) => {
  const cleanId = String(id || '').trim();
  return MAPPA_CLIENTI[cleanId]?.modalitaSettimane || 'dinamica'; // Default a dinamica
};

// Nuove opzioni UI per la pagina Workouts
export const getVisualizzazioneCronologiaAtleta = (id) => {
  const cleanId = String(id || '').trim();
  return localStorage.getItem('visualizzazioneCronologia_' + cleanId) || 'completa'; // 'completa', 'comparativa', 'minimalista'
};

export const getDensitaLayoutAtleta = (id) => {
  const cleanId = String(id || '').trim();
  return localStorage.getItem('densitaLayout_' + cleanId) || 'standard'; // 'standard', 'compatta'
};

export const layoutEserciziGlobal = ref(localStorage.getItem('woapp_layout_esercizi') || 'standard');
export const layoutDettaglioGlobal = ref(localStorage.getItem('woapp_layout_dettaglio') || 'auto');
export const timerThemeGlobal = ref(localStorage.getItem('woapp_timer_theme') || 'accent-dark');

// Stato di cache globale per lo Storyboard dell'atleta e della scheda selezionata
export const globalStoryboard = ref([]);
export const loadingStoryboard = ref(false);
let storyboardUnsubscribe = null;

export const syncStoryboardListener = () => {
  if (storyboardUnsubscribe) {
    storyboardUnsubscribe();
    storyboardUnsubscribe = null;
  }

  const athlete = selectedAthlete.value;
  const sheet = selectedSheet.value;

  if (!athlete || !sheet) {
    globalStoryboard.value = [];
    return;
  }

  loadingStoryboard.value = true;

  const q = query(
    collection(db, 'STORYBOARD'),
    where('ID_cliente', '==', athlete),
    where('num_scheda', '==', sheet)
  );

  storyboardUnsubscribe = onSnapshot(q, (snapshot) => {
    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    globalStoryboard.value = data;
    loadingStoryboard.value = false;
  }, (error) => {
    console.error("Errore nel listener in tempo reale dello Storyboard:", error);
    loadingStoryboard.value = false;
  });
};

// Avvia il listener al caricamento se abbiamo già un atleta e una scheda salvati
if (selectedAthlete.value && selectedSheet.value) {
  syncStoryboardListener();
}

// Parametri di proposta carichi globali (sincronizzati per atleta)
export const propostaBaseWeek5Global = ref(localStorage.getItem('propostaBaseWeek5_' + (localStorage.getItem('selectedAthlete') || '')) || 'W3');
export const propostaBaseWeek6Global = ref(localStorage.getItem('propostaBaseWeek6_' + (localStorage.getItem('selectedAthlete') || '')) || 'W5');
export const incrementoPesoPostScaricoPctGlobal = ref(parseFloat(localStorage.getItem('incrementoPesoPostScaricoPct_' + (localStorage.getItem('selectedAthlete') || '')) || '2.5'));
export const sogliaForzaManubriGlobal = ref(parseFloat(localStorage.getItem('sogliaForzaManubri_' + (localStorage.getItem('selectedAthlete') || '')) || '20'));
export const incrementoManubriLeggeroGlobal = ref(parseFloat(localStorage.getItem('incrementoManubriLeggero_' + (localStorage.getItem('selectedAthlete') || '')) || '1'));
export const incrementoManubriForteGlobal = ref(parseFloat(localStorage.getItem('incrementoManubriForte_' + (localStorage.getItem('selectedAthlete') || '')) || '2'));

// Watcher per ricaricare quando cambia l'atleta
watch(selectedAthlete, (newAthlete) => {
  if (newAthlete) {
    propostaBaseWeek5Global.value = localStorage.getItem('propostaBaseWeek5_' + newAthlete) || 'W3';
    propostaBaseWeek6Global.value = localStorage.getItem('propostaBaseWeek6_' + newAthlete) || 'W5';
    
    const pct = localStorage.getItem('incrementoPesoPostScaricoPct_' + newAthlete);
    incrementoPesoPostScaricoPctGlobal.value = pct !== null ? parseFloat(pct) : 2.5;
    
    const soglia = localStorage.getItem('sogliaForzaManubri_' + newAthlete);
    sogliaForzaManubriGlobal.value = soglia !== null ? parseFloat(soglia) : 20;
    
    const legg = localStorage.getItem('incrementoManubriLeggero_' + newAthlete);
    incrementoManubriLeggeroGlobal.value = legg !== null ? parseFloat(legg) : 1;
    
    const forte = localStorage.getItem('incrementoManubriForte_' + newAthlete);
    incrementoManubriForteGlobal.value = forte !== null ? parseFloat(forte) : 2;
  }
});

// Watcher per salvare in localStorage quando cambiano le variabili globali
watch(propostaBaseWeek5Global, (newVal) => {
  if (selectedAthlete.value) {
    localStorage.setItem('propostaBaseWeek5_' + selectedAthlete.value, newVal);
  }
});
watch(propostaBaseWeek6Global, (newVal) => {
  if (selectedAthlete.value) {
    localStorage.setItem('propostaBaseWeek6_' + selectedAthlete.value, newVal);
  }
});
watch(incrementoPesoPostScaricoPctGlobal, (newVal) => {
  if (selectedAthlete.value) {
    localStorage.setItem('incrementoPesoPostScaricoPct_' + selectedAthlete.value, String(newVal));
  }
});
watch(sogliaForzaManubriGlobal, (newVal) => {
  if (selectedAthlete.value) {
    localStorage.setItem('sogliaForzaManubri_' + selectedAthlete.value, String(newVal));
  }
});
watch(incrementoManubriLeggeroGlobal, (newVal) => {
  if (selectedAthlete.value) {
    localStorage.setItem('incrementoManubriLeggero_' + selectedAthlete.value, String(newVal));
  }
});
watch(incrementoManubriForteGlobal, (newVal) => {
  if (selectedAthlete.value) {
    localStorage.setItem('incrementoManubriForte_' + selectedAthlete.value, String(newVal));
  }
});
