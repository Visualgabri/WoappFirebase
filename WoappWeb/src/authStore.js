import { ref } from 'vue';

// Inizializza lo stato dal localStorage per mantenere la sessione attiva al refresh
const emailSalvata = localStorage.getItem('utenteEmail');
export const utente = ref(emailSalvata ? { email: emailSalvata } : null);
export const idCliente = ref(localStorage.getItem('idCliente') || '');
export const ruolo = ref(localStorage.getItem('ruolo') || 'atleta'); // 'atleta' o 'coach'
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
  utente.value = { email };
  idCliente.value = idCli || '';
  ruolo.value = rlo || 'atleta';

  localStorage.setItem('utenteEmail', email);
  localStorage.setItem('idCliente', idCliente.value);
  localStorage.setItem('ruolo', ruolo.value);

  // Se è un atleta, imposta automaticamente se stesso come atleta selezionato
  if (rlo === 'atleta' && idCli) {
    setSelectedAthlete(idCli);
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
