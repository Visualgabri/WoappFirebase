import { ref } from 'vue';

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
};

// Aggiorna Scheda selezionata globally
export const setSelectedSheet = (val) => {
  selectedSheet.value = val;
  localStorage.setItem('selectedSheet', val);
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
};

// Stato di Timer Globale per il Recupero (Premium UX)
export const activeTimer = ref(null); // { remainingSeconds, totalSeconds, label, isPaused, intervalId }

export const startGlobalTimer = (seconds, label = 'Recupero') => {
  if (activeTimer.value && activeTimer.value.intervalId) {
    clearInterval(activeTimer.value.intervalId);
  }
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
  }
};

export const resumeGlobalTimer = () => {
  if (!activeTimer.value) return;
  activeTimer.value.isPaused = false;
  if (navigator.vibrate) {
    navigator.vibrate(35);
  }
  activeTimer.value.intervalId = setInterval(() => {
    if (!activeTimer.value) return;
    if (activeTimer.value.remainingSeconds > 1) {
      activeTimer.value.remainingSeconds--;
      if (activeTimer.value.remainingSeconds === 10 && navigator.vibrate) {
        navigator.vibrate([40, 40, 40]);
      }
    } else {
      if (navigator.vibrate) {
        navigator.vibrate([150, 80, 150, 80, 200]);
      }
      try {
        const ctx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
        osc.start();
        osc.stop(ctx.currentTime + 0.8);
      } catch (e) {}
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
  '1': { nome: 'Gabriele', cognome: 'Belmonte', email: 'visualgabri@gmail.com', scheda: 49, vista: false, obsoleto: false },
  '57': { nome: 'Jessica', cognome: 'Carletti', email: 'Jessica.carletti89@gmail.com', scheda: 36, vista: false, obsoleto: false },
  '93': { nome: 'Tiziano', cognome: 'Passetti', email: 'tizypass@gmail.com', scheda: 55, vista: null, obsoleto: false },
  '186': { nome: 'Jenny', cognome: 'Pichini', email: 'Pichinijenny@gmail.com', scheda: 14, vista: true, obsoleto: true },
  '219': { nome: 'Chiara', cognome: 'Lazzarini', email: 'chiara.lazzarini15@hotmail.com', scheda: 12, vista: true, obsoleto: true },
  '125': { nome: 'Carla', cognome: 'Leone', email: 'carlaleone59@gmail.com', scheda: 45, vista: true, obsoleto: false },
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
