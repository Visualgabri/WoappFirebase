import { ref, watch } from 'vue';
import { collection, query, where, onSnapshot, doc, setDoc, deleteDoc, getDocs, getDoc } from 'firebase/firestore';
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

// Stato del tema utente (scuro di default, 'light' o 'dark')
export const currentTheme = ref(localStorage.getItem('userTheme') || 'dark');
export const currentLightStyle = ref(localStorage.getItem('userLightStyle') || 'slate');

export const setLightStyle = (styleName) => {
  const targetStyle = (styleName === 'chalk' || styleName === 'sand') ? styleName : 'slate';
  currentLightStyle.value = targetStyle;
  localStorage.setItem('userLightStyle', targetStyle);

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-light-style', targetStyle);
    document.body.setAttribute('data-light-style', targetStyle);
  }
};

export const setTheme = (themeName, vuetifyInstance = null) => {
  const targetTheme = (themeName === 'light') ? 'light' : 'dark';
  currentTheme.value = targetTheme;
  localStorage.setItem('userTheme', targetTheme);

  if (typeof document !== 'undefined') {
    document.documentElement.setAttribute('data-theme', targetTheme);
    document.body.setAttribute('data-theme', targetTheme);
    document.documentElement.setAttribute('data-light-style', currentLightStyle.value);
    document.body.setAttribute('data-light-style', currentLightStyle.value);
  }

  if (vuetifyInstance && vuetifyInstance.theme && vuetifyInstance.theme.global) {
    vuetifyInstance.theme.global.name.value = targetTheme;
  }
};

// Inizializza data-theme e data-light-style al caricamento dello script
if (typeof document !== 'undefined') {
  const initTheme = localStorage.getItem('userTheme') || 'dark';
  const initStyle = localStorage.getItem('userLightStyle') || 'slate';
  document.documentElement.setAttribute('data-theme', initTheme);
  document.body.setAttribute('data-theme', initTheme);
  document.documentElement.setAttribute('data-light-style', initStyle);
  document.body.setAttribute('data-light-style', initStyle);
}

// Stato di selezione globale Atleta e Scheda (in stile AppSheet)
export const selectedAthlete = ref(localStorage.getItem('selectedAthlete') || '');
export const selectedSheet = ref(localStorage.getItem('selectedSheet') || '');

// Aggiorna Atleta selezionato globally
export const setSelectedAthlete = (val) => {
  selectedAthlete.value = val;
  localStorage.setItem('selectedAthlete', val);
  syncStoryboardListener();
  syncInfortuniListener();
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
  if (infortuniUnsubscribe) {
    infortuniUnsubscribe();
    infortuniUnsubscribe = null;
  }
  globalStoryboard.value = [];
  globalInfortuni.value = [];
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

const playMinWarningBeep = () => {
  try {
    const alarmCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = alarmCtx.createOscillator();
    const gainNode = alarmCtx.createGain();

    osc.connect(gainNode);
    gainNode.connect(alarmCtx.destination);

    osc.type = 'sine'; // Suono più dolce
    osc.frequency.setValueAtTime(880, alarmCtx.currentTime); // 880 Hz (La5)

    gainNode.gain.setValueAtTime(0, alarmCtx.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.6, alarmCtx.currentTime + 0.05);
    gainNode.gain.exponentialRampToValueAtTime(0.01, alarmCtx.currentTime + 0.55);

    osc.start(alarmCtx.currentTime);
    osc.stop(alarmCtx.currentTime + 0.6);

    setTimeout(() => {
      try {
        alarmCtx.close();
      } catch (e) { }
    }, 1000);
  } catch (err) {
    console.error("Non è stato possibile riprodurre il beep di avviso minimo:", err);
  }
};

const sendMinWarningNotification = (label) => {
  if (window.Notification && Notification.permission === 'granted') {
    try {
      new Notification("Recupero Minimo Raggiunto! ⏱️", {
        body: label ? `Puoi ripartire per: ${label}` : 'Puoi riprendere l\'allenamento!',
        icon: '/logo.png',
        vibrate: [100, 50, 100],
        tag: 'timer-recupero-min',
        requireInteraction: false
      });
    } catch (e) {
      console.warn("Errore nell'invio della notifica di recupero minimo:", e);
    }
  }
};

export const startGlobalTimer = (seconds, label = 'Recupero', minSeconds = null) => {
  if (activeTimer.value && activeTimer.value.intervalId) {
    clearInterval(activeTimer.value.intervalId);
  }
  stopBackgroundKeepAlive();
  activeTimer.value = {
    remainingSeconds: seconds,
    totalSeconds: seconds,
    minSeconds: minSeconds,
    label: label,
    isPaused: false,
    intervalId: null,
    hasPlayedMinWarning: false,
    isMinReached: false
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

      // Controllo per la soglia minima del recupero
      if (activeTimer.value.minSeconds) {
        const elapsed = activeTimer.value.totalSeconds - activeTimer.value.remainingSeconds;
        if (elapsed >= activeTimer.value.minSeconds) {
          activeTimer.value.isMinReached = true;
          if (!activeTimer.value.hasPlayedMinWarning) {
            activeTimer.value.hasPlayedMinWarning = true;
            if (navigator.vibrate) {
              navigator.vibrate([100, 50, 100]);
            }
            playMinWarningBeep();
            if (document.visibilityState === 'hidden') {
              sendMinWarningNotification(activeTimer.value.label);
            }
          }
        }
      }

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

// Mappa dinamica per i nuovi clienti caricati su Firestore che non sono in MAPPA_CLIENTI statica
export const MAPPA_CLIENTI_DINAMICI = ref(JSON.parse(localStorage.getItem('mappa_clienti_dinamici') || '{}'));

export const impostaNomeAtletaDinamico = (id, nome) => {
  const cleanId = String(id || '').trim();
  const cleanNome = String(nome || '').trim();
  if (!cleanId || !cleanNome) return;
  
  if (MAPPA_CLIENTI_DINAMICI.value[cleanId] !== cleanNome) {
    const nuovaMappa = { ...MAPPA_CLIENTI_DINAMICI.value, [cleanId]: cleanNome };
    MAPPA_CLIENTI_DINAMICI.value = nuovaMappa;
    localStorage.setItem('mappa_clienti_dinamici', JSON.stringify(nuovaMappa));
  }
};

export const getNomeAtleta = (id) => {
  const cleanId = String(id || '').trim();
  if (!cleanId) return '';
  
  const c = MAPPA_CLIENTI[cleanId];
  if (c && c.nome) {
    return `${c.nome} ${c.cognome || ''}`.trim();
  }
  
  if (MAPPA_CLIENTI_DINAMICI.value[cleanId]) {
    return MAPPA_CLIENTI_DINAMICI.value[cleanId];
  }

  return '';
};

export const caricaNomiAtletiDinamici = async () => {
  try {
    const q = query(collection(db, 'WORKOUT_T'));
    const snap = await getDocs(q);
    const mappa = { ...MAPPA_CLIENTI_DINAMICI.value };
    let haCambiamenti = false;

    snap.forEach(docSnap => {
      const data = docSnap.data();
      const id = String(data.ID_cliente || '').trim();
      const nome = (data.NomeCognomeTM || data.des_nome_cognome || data.des_atleta || '').trim();
      if (id && nome && mappa[id] !== nome) {
        mappa[id] = nome;
        haCambiamenti = true;
      }
    });

    if (haCambiamenti) {
      MAPPA_CLIENTI_DINAMICI.value = mappa;
      localStorage.setItem('mappa_clienti_dinamici', JSON.stringify(mappa));
    }
  } catch (err) {
    console.error("Errore caricamento nomi atleti dinamici:", err);
  }
};

// Avvia subito il caricamento dei nomi atleti da WORKOUT_T in background
caricaNomiAtletiDinamici();

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
export const comportamentoPlayGlobal = ref(localStorage.getItem('woapp_comportamento_play') || 'auto');
export const temaHeaderGiornoGlobal = ref(localStorage.getItem('woapp_tema_header_giorno') || 'arancio');

// Stato di cache globale per lo Storyboard dell'atleta e della scheda selezionata
export const globalStoryboard = ref([]);
export const loadingStoryboard = ref(false);
let storyboardUnsubscribe = null;

// Stato cache globale Infortuni
export const globalInfortuni = ref([]);
export const loadingInfortuni = ref(false);
let infortuniUnsubscribe = null;

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

export const syncInfortuniListener = () => {
  if (infortuniUnsubscribe) {
    infortuniUnsubscribe();
    infortuniUnsubscribe = null;
  }

  const athlete = selectedAthlete.value;
  if (!athlete) {
    globalInfortuni.value = [];
    return;
  }

  loadingInfortuni.value = true;

  const q = query(
    collection(db, 'infortuni'),
    where('id_cliente', '==', athlete)
  );

  infortuniUnsubscribe = onSnapshot(q, (snapshot) => {
    const data = [];
    snapshot.forEach((doc) => {
      data.push({ id: doc.id, ...doc.data() });
    });
    globalInfortuni.value = data;
    loadingInfortuni.value = false;
  }, (error) => {
    console.error("Errore nel listener degli infortuni:", error);
    loadingInfortuni.value = false;
  });
};

export const calcolaPercentualeConsigliata = (gravita) => {
  const g = parseInt(gravita) || 1;
  if (g <= 2) return 0;
  if (g <= 4) return 10;
  if (g <= 6) return 20;
  if (g <= 8) return 30;
  return 40;
};

export const segnalaInfortunio = async (infortunioData) => {
  try {
    const newDocRef = doc(collection(db, 'infortuni'));
    const defaultPct = calcolaPercentualeConsigliata(infortunioData.gravita || 3);
    const payload = {
      id_cliente: selectedAthlete.value,
      data_inizio: new Date().toISOString(),
      data_risoluzione: null,
      stato: 'attivo',
      percentuale_riduzione: infortunioData.percentuale_riduzione !== undefined ? infortunioData.percentuale_riduzione : defaultPct,
      applica_riduzione: infortunioData.applica_riduzione !== undefined ? infortunioData.applica_riduzione : true,
      ...infortunioData
    };
    await setDoc(newDocRef, payload);
    return { success: true, id: newDocRef.id };
  } catch (error) {
    console.error("Errore nel salvataggio dell'infortunio:", error);
    throw error;
  }
};

export const aggiornaInfortunio = async (idInfortunio, infortunioData) => {
  try {
    const docRef = doc(db, 'infortuni', idInfortunio);
    await setDoc(docRef, {
      ...infortunioData
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Errore nell'aggiornamento dell'infortunio:", error);
    throw error;
  }
};

export const eliminaInfortunio = async (idInfortunio) => {
  try {
    const docRef = doc(db, 'infortuni', idInfortunio);
    await deleteDoc(docRef);
    if (globalInfortuni.value) {
      globalInfortuni.value = globalInfortuni.value.filter(inf => inf.id !== idInfortunio);
    }
    return { success: true };
  } catch (error) {
    console.error("Errore nell'eliminazione dell'infortunio:", error);
    throw error;
  }
};

export const risolviInfortunio = async (idInfortunio) => {
  try {
    const docRef = doc(db, 'infortuni', idInfortunio);
    await setDoc(docRef, {
      stato: 'risolto',
      data_risoluzione: new Date().toISOString()
    }, { merge: true });
    return { success: true };
  } catch (error) {
    console.error("Errore nella risoluzione dell'infortunio:", error);
    throw error;
  }
};

// Avvia il listener al caricamento se abbiamo già un atleta e una scheda salvati
if (selectedAthlete.value && selectedSheet.value) {
  syncStoryboardListener();
}
if (selectedAthlete.value) {
  syncInfortuniListener();
}

// --- STATO NOTIFICA DEPLOY & AGGIORNAMENTO REAL-TIME ---
export const showDeployBanner = ref(false);
export const deployVersionInfo = ref(null);
export const deployCustomNoteForMe = ref('');
export const lastSeenDeployVersion = ref(localStorage.getItem('woapp_last_deploy_version') || '');

let deployVersionUnsubscribe = null;

export const syncDeployVersionListener = () => {
  if (deployVersionUnsubscribe) {
    deployVersionUnsubscribe();
    deployVersionUnsubscribe = null;
  }

  const docRef = doc(db, 'METADATA', 'deploy_version');

  deployVersionUnsubscribe = onSnapshot(docRef, (docSnap) => {
    if (docSnap.exists()) {
      const data = docSnap.data();
      const versionId = data.version_id || data.timestamp || '';
      
      // Se c'è un version_id e non è mai stato visto da questo utente
      if (versionId && versionId !== lastSeenDeployVersion.value) {
        deployVersionInfo.value = data;

        // Se la notifica ha un destinatario specifico (target_atleta_id):
        if (data.target_atleta_id) {
          // Si mostra ESCLUSIVAMENTE se l'utente connesso è un atleta E il suo idCliente corrisponde a target_atleta_id
          const isTargetedAthlete = ruolo.value === 'atleta' && String(idCliente.value) === String(data.target_atleta_id);
          if (isTargetedAthlete) {
            deployCustomNoteForMe.value = (data.notes_per_athlete && data.notes_per_athlete[idCliente.value]) || data.message_general || data.titolo || '';
            showDeployBanner.value = true;
          } else {
            // Se sono il coach o un altro atleta, NON mostrare il banner del messaggio privato
            showDeployBanner.value = false;
          }
        } else {
          // Notifica Deploy Generale (Broadcast a tutti)
          const myId = idCliente.value || '';
          if (myId && data.notes_per_athlete && data.notes_per_athlete[myId]) {
            deployCustomNoteForMe.value = data.notes_per_athlete[myId];
          } else {
            deployCustomNoteForMe.value = '';
          }
          showDeployBanner.value = true;
        }
      }
    }
  }, (err) => {
    console.warn("Errore listener deploy_version:", err);
  });
};

export const chiudiBannerNotifica = () => {
  if (deployVersionInfo.value && deployVersionInfo.value.version_id) {
    localStorage.setItem('woapp_last_deploy_version', deployVersionInfo.value.version_id);
    lastSeenDeployVersion.value = deployVersionInfo.value.version_id;
  } else {
    const fallbackId = 'v_' + Date.now();
    localStorage.setItem('woapp_last_deploy_version', fallbackId);
    lastSeenDeployVersion.value = fallbackId;
  }
  showDeployBanner.value = false;
};

export const accettaEAggiornaDeploy = async () => {
  const versionId = deployVersionInfo.value?.version_id || ('v_' + Date.now());
  chiudiBannerNotifica();

  try {
    // 1. Invia messaggio SKIP_WAITING e disregistra tutti i Service Worker attivi
    if ('serviceWorker' in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const reg of registrations) {
        try {
          if (reg.waiting) reg.waiting.postMessage({ type: 'SKIP_WAITING' });
          if (reg.active) reg.active.postMessage({ type: 'SKIP_WAITING' });
          await reg.unregister();
        } catch (swErr) {
          console.warn("Errore unregister SW:", swErr);
        }
      }
    }

    // 2. Elimina completamente tutte le cache (Workbox e PWA cache)
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map(name => caches.delete(name)));
    }
  } catch (err) {
    console.warn("Pulizia cache SW durante aggiornamento:", err);
  }

  // 3. Esegui hard replacement dell'URL con timestamp unico e senza cache
  const cleanPath = window.location.pathname;
  const targetUrl = window.location.origin + cleanPath + '?v=' + versionId + '&reload=' + Date.now();
  window.location.replace(targetUrl);
};

export const ignoraBannerDeploy = () => {
  chiudiBannerNotifica();
};

export const inviaNotificaDeploy = async (payload) => {
  try {
    const docRef = doc(db, 'METADATA', 'deploy_version');
    const newVersionId = 'v_' + Date.now();
    const dataToSave = {
      version_id: newVersionId,
      timestamp: new Date().toISOString(),
      tipo: payload.tipo || 'deploy', // 'deploy' oppure 'messaggio'
      titolo: payload.titolo || (payload.tipo === 'messaggio' ? '💬 Messaggio dal Coach' : '🚀 Nuovo Aggiornamento!'),
      message_general: payload.message_general || 'Nuova versione applicazione disponibile.',
      target_atleta_id: payload.target_atleta_id || null,
      notes_per_athlete: payload.notes_per_athlete || {}
    };
    await setDoc(docRef, dataToSave, { merge: true });
    return { success: true, version_id: newVersionId };
  } catch (error) {
    console.error("Errore nell'invio notifica deploy:", error);
    throw error;
  }
};

// Avvia immediatamente il listener per le notifiche di deploy
syncDeployVersionListener();

// Parametri di proposta carichi globali (generici per tutti gli atleti)
const athleteIdForInit = localStorage.getItem('selectedAthlete') || '';

export const propostaBaseWeek2Global = ref(localStorage.getItem('propostaBaseWeek2') || localStorage.getItem('propostaBaseWeek2_' + athleteIdForInit) || 'W1');
export const propostaBaseWeek5Global = ref(localStorage.getItem('propostaBaseWeek5') || localStorage.getItem('propostaBaseWeek5_' + athleteIdForInit) || 'W3');
export const propostaBaseWeek6Global = ref(localStorage.getItem('propostaBaseWeek6') || localStorage.getItem('propostaBaseWeek6_' + athleteIdForInit) || 'W5');
export const incrementoPesoPostScaricoPctGlobal = ref(parseFloat(localStorage.getItem('incrementoPesoPostScaricoPct') || localStorage.getItem('incrementoPesoPostScaricoPct_' + athleteIdForInit) || '2.5'));
export const sogliaForzaManubriGlobal = ref(parseFloat(localStorage.getItem('sogliaForzaManubri') || localStorage.getItem('sogliaForzaManubri_' + athleteIdForInit) || '20'));
export const incrementoManubriLeggeroGlobal = ref(parseFloat(localStorage.getItem('incrementoManubriLeggero') || localStorage.getItem('incrementoManubriLeggero_' + athleteIdForInit) || '1'));
export const incrementoManubriForteGlobal = ref(parseFloat(localStorage.getItem('incrementoManubriForte') || localStorage.getItem('incrementoManubriForte_' + athleteIdForInit) || '2'));
export const faticaPesanteW1PctGlobal = ref(parseFloat(localStorage.getItem('faticaPesanteW1Pct') || localStorage.getItem('faticaPesanteW1Pct_' + athleteIdForInit) || '5'));
export const faticaDevastanteW1PctGlobal = ref(parseFloat(localStorage.getItem('faticaDevastanteW1Pct') || localStorage.getItem('faticaDevastanteW1Pct_' + athleteIdForInit) || '10'));
export const faticaPesanteStoricoPctGlobal = ref(parseFloat(localStorage.getItem('faticaPesanteStoricoPct') || localStorage.getItem('faticaPesanteStorico_' + athleteIdForInit) || '3')); // Note: historical typo key check
export const faticaDevastanteStoricoPctGlobal = ref(parseFloat(localStorage.getItem('faticaDevastanteStoricoPct') || localStorage.getItem('faticaDevastanteStorico_' + athleteIdForInit) || '6'));
export const ottimizzaDigitazioneGlobal = ref(localStorage.getItem('ottimizzaDigitazioneGlobal') === 'true');
export const deallenamentoSoglia1Global = ref(parseInt(localStorage.getItem('deallenamentoSoglia1') || localStorage.getItem('deallenamentoSoglia1_' + athleteIdForInit) || '30', 10));
export const deallenamentoSoglia2Global = ref(parseInt(localStorage.getItem('deallenamentoSoglia2') || localStorage.getItem('deallenamentoSoglia2_' + athleteIdForInit) || '90', 10));
export const deallenamentoSoglia3Global = ref(parseInt(localStorage.getItem('deallenamentoSoglia3') || localStorage.getItem('deallenamentoSoglia3_' + athleteIdForInit) || '180', 10));
export const deallenamentoSoglia4Global = ref(parseInt(localStorage.getItem('deallenamentoSoglia4') || localStorage.getItem('deallenamentoSoglia4_' + athleteIdForInit) || '365', 10));
export const deallenamentoPct1Global = ref(parseFloat(localStorage.getItem('deallenamentoPct1') || localStorage.getItem('deallenamentoPct1_' + athleteIdForInit) || '1'));
export const deallenamentoPct2Global = ref(parseFloat(localStorage.getItem('deallenamentoPct2') || localStorage.getItem('deallenamentoPct2_' + athleteIdForInit) || '3'));
export const deallenamentoPct3Global = ref(parseFloat(localStorage.getItem('deallenamentoPct3') || localStorage.getItem('deallenamentoPct3_' + athleteIdForInit) || '10'));
export const deallenamentoPct4Global = ref(parseFloat(localStorage.getItem('deallenamentoPct4') || localStorage.getItem('deallenamentoPct4_' + athleteIdForInit) || '25'));
export const penalitaMaxInstabiliPctGlobal = ref(parseFloat(localStorage.getItem('penalitaMaxInstabiliPct') || localStorage.getItem('penalitaMaxInstabiliPct_' + athleteIdForInit) || '64'));
export const penalitaMaxStabiliPctGlobal = ref(parseFloat(localStorage.getItem('penalitaMaxStabiliPct') || localStorage.getItem('penalitaMaxStabiliPct_' + athleteIdForInit) || '14'));
const localW2 = localStorage.getItem('regolaProgressioneW2Global');
export const regolaProgressioneW2Global = ref(localW2 && localW2 !== 'reps' ? localW2 : 'peso');
if (localW2 === 'reps') {
  localStorage.setItem('regolaProgressioneW2Global', 'peso');
}

// Flag per evitare loop di sincronizzazione bidirezionale Firestore -> local -> Firestore
let isSyncingFromFirestore = false;
let debounceTimeout = null;

const salvaConfigurazioniGlobaliFirestore = () => {
  if (isSyncingFromFirestore) return;
  if (debounceTimeout) {
    clearTimeout(debounceTimeout);
  }
  debounceTimeout = setTimeout(async () => {
    try {
      const docRefConfig = doc(db, 'METADATA', 'progressioni_globali');
      await setDoc(docRefConfig, {
        propostaBaseWeek2: propostaBaseWeek2Global.value,
        propostaBaseWeek5: propostaBaseWeek5Global.value,
        propostaBaseWeek6: propostaBaseWeek6Global.value,
        incrementoPesoPostScaricoPct: incrementoPesoPostScaricoPctGlobal.value,
        sogliaForzaManubri: sogliaForzaManubriGlobal.value,
        incrementoManubriLeggero: incrementoManubriLeggeroGlobal.value,
        incrementoManubriForte: incrementoManubriForteGlobal.value,
        faticaPesanteW1Pct: faticaPesanteW1PctGlobal.value,
        faticaDevastanteW1Pct: faticaDevastanteW1PctGlobal.value,
        faticaPesanteStoricoPct: faticaPesanteStoricoPctGlobal.value,
        faticaDevastanteStoricoPct: faticaDevastanteStoricoPctGlobal.value,
        ottimizzaDigitazione: ottimizzaDigitazioneGlobal.value,
        regolaProgressioneW2: regolaProgressioneW2Global.value,
        deallenamentoSoglia1: deallenamentoSoglia1Global.value,
        deallenamentoSoglia2: deallenamentoSoglia2Global.value,
        deallenamentoSoglia3: deallenamentoSoglia3Global.value,
        deallenamentoSoglia4: deallenamentoSoglia4Global.value,
        deallenamentoPct1: deallenamentoPct1Global.value,
        deallenamentoPct2: deallenamentoPct2Global.value,
        deallenamentoPct3: deallenamentoPct3Global.value,
        deallenamentoPct4: deallenamentoPct4Global.value,
        penalitaMaxInstabiliPct: penalitaMaxInstabiliPctGlobal.value,
        penalitaMaxStabiliPct: penalitaMaxStabiliPctGlobal.value,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      console.log("[Firestore Sync] Configurazioni globali salvate su Cloud!");
    } catch (err) {
      console.error("[Firestore Sync] Errore salvataggio configurazioni:", err);
    }
  }, 1200); // 1.2 secondi di debounce per evitare spam durante la digitazione
};

// Listener in tempo reale per sincronizzare le configurazioni globali su tutti i dispositivi
let configUnsubscribe = null;
export const syncConfigurazioniListener = () => {
  if (configUnsubscribe) {
    configUnsubscribe();
  }
  const docRefConfig = doc(db, 'METADATA', 'progressioni_globali');
  configUnsubscribe = onSnapshot(docRefConfig, (docSnap) => {
    isSyncingFromFirestore = true;
    if (docSnap.exists()) {
      const data = docSnap.data();
      if (data.propostaBaseWeek2 !== undefined) propostaBaseWeek2Global.value = data.propostaBaseWeek2;
      if (data.propostaBaseWeek5 !== undefined) propostaBaseWeek5Global.value = data.propostaBaseWeek5;
      if (data.propostaBaseWeek6 !== undefined) propostaBaseWeek6Global.value = data.propostaBaseWeek6;
      if (data.incrementoPesoPostScaricoPct !== undefined) incrementoPesoPostScaricoPctGlobal.value = parseFloat(data.incrementoPesoPostScaricoPct);
      if (data.sogliaForzaManubri !== undefined) sogliaForzaManubriGlobal.value = parseFloat(data.sogliaForzaManubri);
      if (data.incrementoManubriLeggero !== undefined) incrementoManubriLeggeroGlobal.value = parseFloat(data.incrementoManubriLeggero);
      if (data.incrementoManubriForte !== undefined) incrementoManubriForteGlobal.value = parseFloat(data.incrementoManubriForte);
      if (data.faticaPesanteW1Pct !== undefined) faticaPesanteW1PctGlobal.value = parseFloat(data.faticaPesanteW1Pct);
      if (data.faticaDevastanteW1Pct !== undefined) faticaDevastanteW1PctGlobal.value = parseFloat(data.faticaDevastanteW1Pct);
      if (data.faticaPesanteStoricoPct !== undefined) faticaPesanteStoricoPctGlobal.value = parseFloat(data.faticaPesanteStoricoPct);
      if (data.faticaDevastanteStoricoPct !== undefined) faticaDevastanteStoricoPctGlobal.value = parseFloat(data.faticaDevastanteStoricoPct);
      if (data.ottimizzaDigitazione !== undefined) ottimizzaDigitazioneGlobal.value = data.ottimizzaDigitazione === true || data.ottimizzaDigitazione === 'true';
      if (data.regolaProgressioneW2 !== undefined) {
        regolaProgressioneW2Global.value = data.regolaProgressioneW2 === 'reps' ? 'peso' : data.regolaProgressioneW2;
      }
      if (data.deallenamentoSoglia1 !== undefined) deallenamentoSoglia1Global.value = parseInt(data.deallenamentoSoglia1, 10);
      if (data.deallenamentoSoglia2 !== undefined) deallenamentoSoglia2Global.value = parseInt(data.deallenamentoSoglia2, 10);
      if (data.deallenamentoSoglia3 !== undefined) deallenamentoSoglia3Global.value = parseInt(data.deallenamentoSoglia3, 10);
      if (data.deallenamentoSoglia4 !== undefined) deallenamentoSoglia4Global.value = parseInt(data.deallenamentoSoglia4, 10);
      if (data.deallenamentoPct1 !== undefined) deallenamentoPct1Global.value = parseFloat(data.deallenamentoPct1);
      if (data.deallenamentoPct2 !== undefined) deallenamentoPct2Global.value = parseFloat(data.deallenamentoPct2);
      if (data.deallenamentoPct3 !== undefined) deallenamentoPct3Global.value = parseFloat(data.deallenamentoPct3);
      if (data.deallenamentoPct4 !== undefined) deallenamentoPct4Global.value = parseFloat(data.deallenamentoPct4);
      if (data.penalitaMaxInstabiliPct !== undefined) penalitaMaxInstabiliPctGlobal.value = parseFloat(data.penalitaMaxInstabiliPct);
      if (data.penalitaMaxStabiliPct !== undefined) penalitaMaxStabiliPctGlobal.value = parseFloat(data.penalitaMaxStabiliPct);
    } else {
      // Se non esiste ancora su Firestore, lo creiamo inizializzandolo con i valori correnti del client
      salvaConfigurazioniGlobaliFirestore();
    }
    // Rilascia il flag asincronamente per non intercettare i watchers immediati
    setTimeout(() => {
      isSyncingFromFirestore = false;
    }, 100);
  }, (err) => {
    console.error("[Firestore Sync] Errore listener configurazioni globali:", err);
    isSyncingFromFirestore = false;
  });
};

// Avvia il listener al caricamento iniziale
syncConfigurazioniListener();

// Watchers per allineare localStorage e propagare modifiche a Firestore
watch(propostaBaseWeek2Global, (newVal) => {
  localStorage.setItem('propostaBaseWeek2', newVal);
  salvaConfigurazioniGlobaliFirestore();
});
watch(propostaBaseWeek5Global, (newVal) => {
  localStorage.setItem('propostaBaseWeek5', newVal);
  salvaConfigurazioniGlobaliFirestore();
});
watch(propostaBaseWeek6Global, (newVal) => {
  localStorage.setItem('propostaBaseWeek6', newVal);
  salvaConfigurazioniGlobaliFirestore();
});
watch(incrementoPesoPostScaricoPctGlobal, (newVal) => {
  localStorage.setItem('incrementoPesoPostScaricoPct', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(sogliaForzaManubriGlobal, (newVal) => {
  localStorage.setItem('sogliaForzaManubri', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(incrementoManubriLeggeroGlobal, (newVal) => {
  localStorage.setItem('incrementoManubriLeggero', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(incrementoManubriForteGlobal, (newVal) => {
  localStorage.setItem('incrementoManubriForte', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(faticaPesanteW1PctGlobal, (newVal) => {
  localStorage.setItem('faticaPesanteW1Pct', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(faticaDevastanteW1PctGlobal, (newVal) => {
  localStorage.setItem('faticaDevastanteW1Pct', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(faticaPesanteStoricoPctGlobal, (newVal) => {
  localStorage.setItem('faticaPesanteStoricoPct', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(faticaDevastanteStoricoPctGlobal, (newVal) => {
  localStorage.setItem('faticaDevastanteStoricoPct', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(ottimizzaDigitazioneGlobal, (newVal) => {
  localStorage.setItem('ottimizzaDigitazioneGlobal', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(regolaProgressioneW2Global, (newVal) => {
  localStorage.setItem('regolaProgressioneW2Global', newVal);
  salvaConfigurazioniGlobaliFirestore();
});
watch(deallenamentoSoglia1Global, (newVal) => {
  localStorage.setItem('deallenamentoSoglia1', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(deallenamentoSoglia2Global, (newVal) => {
  localStorage.setItem('deallenamentoSoglia2', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(deallenamentoSoglia3Global, (newVal) => {
  localStorage.setItem('deallenamentoSoglia3', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(deallenamentoSoglia4Global, (newVal) => {
  localStorage.setItem('deallenamentoSoglia4', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(deallenamentoPct1Global, (newVal) => {
  localStorage.setItem('deallenamentoPct1', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(deallenamentoPct2Global, (newVal) => {
  localStorage.setItem('deallenamentoPct2', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(deallenamentoPct3Global, (newVal) => {
  localStorage.setItem('deallenamentoPct3', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(deallenamentoPct4Global, (newVal) => {
  localStorage.setItem('deallenamentoPct4', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(penalitaMaxInstabiliPctGlobal, (newVal) => {
  localStorage.setItem('penalitaMaxInstabiliPct', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(penalitaMaxStabiliPctGlobal, (newVal) => {
  localStorage.setItem('penalitaMaxStabiliPct', String(newVal));
  salvaConfigurazioniGlobaliFirestore();
});
watch(temaHeaderGiornoGlobal, (newVal) => {
  localStorage.setItem('woapp_tema_header_giorno', newVal);
});

// Caching globale per il backup dello storyboard da 22MB per evitare freeze e download duplicati
let backupDataPromise = null;
let backupDataCache = null;

export const getStoryboardBackup = async () => {
  if (backupDataCache) return backupDataCache;
  if (!backupDataPromise) {
    backupDataPromise = (async () => {
      try {
        console.log("Fetching storyboard_backup.json (22MB)...");
        const res = await fetch('/storyboard_backup.json');
        backupDataCache = await res.json();
        console.log("Parsed storyboard_backup.json successfully, items count:", backupDataCache.length);
        return backupDataCache;
      } catch (err) {
        console.error("Errore caricamento backup JSON:", err);
        backupDataPromise = null; // Consente di riprovare in caso di errore di rete temporaneo
        return [];
      }
    })();
  }
  return backupDataPromise;
};

// Chiude la settimana attiva del giorno attivo dell'atleta selezionato
export const chiudiSettimanaAttivaGiornoAttivo = async () => {
  const athlete = selectedAthlete.value;
  const sheet = selectedSheet.value;
  if (!athlete || !sheet) return false;

  // Controlla se c'è un giorno/settimana temporaneo impostato dalla modale di chiusura globale
  const tempDay = localStorage.getItem('giornoDaChiudereTemporaneo_' + athlete);
  const tempWeekStr = localStorage.getItem('settimanaDaChiudereTemporanea_' + athlete);
  
  const day = tempDay || localStorage.getItem('giornoAttivo_' + athlete) || 'A';
  const week = tempWeekStr ? parseInt(tempWeekStr) : (parseInt(localStorage.getItem('settimanaAttiva_' + athlete)) || 1);

  // Pulisci i valori temporanei dopo averli letti
  localStorage.removeItem('giornoDaChiudereTemporaneo_' + athlete);
  localStorage.removeItem('settimanaDaChiudereTemporanea_' + athlete);

  // Trova l'intestazione del giorno (riga 0)
  const header = globalStoryboard.value.find(item => {
    const riga = parseInt(item.num_riga_giorno);
    const keyIdCliente = Object.keys(item).find(k => k.includes('ID_cliente')) || 'ID_cliente';
    return riga === 0 &&
           (item.des_giorno || '').trim().toUpperCase() === day.trim().toUpperCase() &&
           String(item[keyIdCliente]) === String(athlete) &&
           String(item.num_scheda) === String(sheet);
  });

  if (!header) {
    console.warn("Intestazione giorno non trovata per la chiusura rapida.");
    return false;
  }

  const campoCmp = 'cmp' + week;
  const valString = 'true';

  // Rimuovi flag keepOpen
  const keepOpenKey = `keepOpen_${athlete}_${day}_W${week}`;
  localStorage.removeItem(keepOpenKey);

  // Formatta timestamps
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const now = new Date();
  const gg = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  const timestamp_ute = `${gg}/${mm}/${yyyy} ${hh}:${min}:${ss}`;

  // Aggiorna localmente nello store
  header[campoCmp] = valString;
  header.timestamp = timestamp;
  header.timestamp_ute = timestamp_ute;

  // Salva offline nel localStorage per funzionamento istantaneo
  const key1 = `offline_storyboard_${header.id}`;
  let updates = {};
  const localData1 = localStorage.getItem(key1);
  if (localData1) {
    try { updates = JSON.parse(localData1); } catch (e) {}
  }
  updates[campoCmp] = valString;
  updates['timestamp'] = timestamp;
  updates['timestamp_ute'] = timestamp_ute;
  localStorage.setItem(key1, JSON.stringify(updates));

  // Salva su Firebase in background
  try {
    const docRef = doc(db, 'STORYBOARD', header.id);
    await setDoc(docRef, { [campoCmp]: valString, timestamp, timestamp_ute }, { merge: true });
    console.log("Completamento giorno sincronizzato con Firebase da Chiusura Rapida!");
    return true;
  } catch (err) {
    console.warn("Errore salvataggio completamento giorno Firebase da Chiusura Rapida:", err);
    return false;
  }
};



