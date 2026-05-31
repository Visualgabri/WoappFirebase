<template>
  <v-container class="px-4 py-8 max-width-container min-height-screen pb-12">
    <!-- Header Premium con stile AppSheet Evoluto (Coerente Dark Mode) -->
    <div class="premium-header card-glass rounded-2xl pa-4 mb-6 d-flex align-center justify-space-between elevation-2 border-bottom-soft">
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-white elevation-1 profile-avatar">
          <v-img src="https://visualgabri.github.io/Esercizi/WoApp/Immagini/A.png" alt="Superman G"></v-img>
        </v-avatar>
        <div class="text-left">
          <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight leading-tight">Ricerca Wo</h1>
          <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.62rem; letter-spacing: 0.05em;">Configurazione Atleta & Schede</span>
        </div>
      </div>
      <div class="header-actions">
        <v-btn icon color="orange-darken-3" variant="text" @click="caricaDatiAtleti" size="small"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>
    </div>

    <!-- Sezione di Selezione Atleta (Mostrata solo se Coach, se Atleta è bloccata) -->
    <v-card class="premium-card rounded-2xl pa-5 mb-6 text-left border" elevation="2">
      <div class="d-flex align-center mb-4">
        <v-avatar color="orange-lighten-5" size="44" class="mr-3 bg-slate-900-op border-soft">
          <v-icon color="orange-darken-3">mdi-account-search</v-icon>
        </v-avatar>
        <div class="text-left">
          <div class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">SceltaNomeCognome *</div>
          <h3 v-if="ruolo === 'atleta'" class="text-h6 font-weight-black text-slate-dark">Atleta Corrente</h3>
          <h3 v-else class="text-h6 font-weight-black text-slate-dark">Seleziona Atleta</h3>
        </div>
      </div>

      <!-- Autocomplete Atleta per il Coach -->
      <v-autocomplete
        v-if="ruolo === 'coach'"
        v-model="atletaSelezionato"
        :items="listaAtleti"
        label="Scegli Atleta..."
        variant="outlined"
        rounded="lg"
        color="orange-darken-3"
        prepend-inner-icon="mdi-account"
        class="search-autocomplete-field"
        hide-details
        @update:model-value="gestisciCambioAtleta"
        id="atleta-dropdown"
      ></v-autocomplete>
      
      <!-- Box bloccato per l'Atleta loggato -->
      <div v-else class="pa-4 rounded-xl bg-orange-darken-3-op border-orange d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon color="orange" class="mr-2.5">mdi-account-check</v-icon>
          <span class="font-weight-black text-slate-dark text-body-1">{{ utente?.email }}</span>
        </div>
        <v-chip color="orange-darken-3" size="small" class="font-weight-black">ID: {{ idCliente }}</v-chip>
      </div>
    </v-card>

    <!-- Bottone ULTIMA SCHEDA (Premium Orange) -->
    <div v-if="atletaSelezionato" class="d-flex justify-center mb-6 w-100">
      <v-btn
        color="orange-darken-3"
        size="large"
        block
        rounded="xl"
        class="font-weight-black text-none py-3 text-white glowing-btn animate-pulse-slow"
        @click="selezionaUltimaScheda"
        :disabled="listaSchede.length === 0"
        id="btn-ultima-scheda"
      >
        <v-icon left class="mr-2">mdi-skip-next</v-icon>
        ULTIMA SCHEDA DISPONIBILE
      </v-btn>
    </div>

    <!-- Griglia dei Numeri Scheda (Scegli scheda * stile AppSheet) -->
    <v-card v-if="atletaSelezionato" class="premium-card rounded-2xl pa-5 mb-6 text-left border" elevation="2">
      <div class="text-subtitle-2 font-weight-black text-slate-dark mb-4 d-flex align-center">
        <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-grid-large</v-icon>
        Scegli scheda *
      </div>

      <div v-if="caricamentoSchede" class="text-center my-6">
        <v-progress-circular indeterminate color="orange" size="40"></v-progress-circular>
        <p class="mt-2 text-caption text-muted">Caricamento schede disponibili...</p>
      </div>

      <div v-else-if="listaSchede.length === 0" class="text-center my-6 py-8">
        <v-icon color="grey-lighten-1" size="48">mdi-clipboard-alert-outline</v-icon>
        <p class="mt-2 text-caption text-muted">Nessuna scheda trovata per questo atleta.</p>
      </div>

      <!-- Griglia pulsanti quadrati premium -->
      <div v-else class="scheda-grid">
        <button
          v-for="scheda in listaSchede"
          :key="scheda"
          class="scheda-grid-btn"
          :class="{ 'scheda-grid-btn-active': schedaSelezionata === scheda }"
          @click="gestisciSelezioneScheda(scheda)"
          :id="'btn-scheda-' + scheda"
        >
          <div class="d-flex flex-column align-center">
            <span class="font-weight-black" style="font-size: 1.2rem;">{{ scheda }}</span>
            <span class="text-super-caption uppercase opacity-75 mt-0.5" style="font-size: 0.52rem; font-weight: 700;">Scheda</span>
          </div>
        </button>
      </div>
    </v-card>

    <!-- Info email di riferimento dell'atleta loggato -->
    <v-card v-if="atletaSelezionato" class="premium-card rounded-2xl pa-4 text-left border" elevation="1">
      <div class="text-caption text-muted font-weight-black uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">des_emailRef</div>
      <div class="text-body-1 font-weight-black text-slate-dark d-flex align-center mt-1">
        <v-icon size="18" color="orange" class="mr-2">mdi-email-outline</v-icon>
        {{ emailRiferimento || 'Nessuna mail di riferimento' }}
      </div>
    </v-card>

    <!-- Nuova Barra Azioni Navigazione a Fondo Pagina (Altamente Intuitiva) -->
    <v-row dense v-if="schedaSelezionata" class="mt-6 gap-3 justify-space-between">
      <v-col cols="6" class="flex-grow-1">
        <v-btn
          color="blue-darken-3"
          block
          size="large"
          rounded="xl"
          class="font-weight-black text-none py-3 text-white glowing-btn-blue"
          @click="navigaAiWorkouts"
        >
          <v-icon size="18" class="mr-2">mdi-dumbbell</v-icon>
          Vedi Esercizi
        </v-btn>
      </v-col>
      <v-col cols="6" class="flex-grow-1">
        <v-btn
          color="orange-darken-3"
          block
          size="large"
          rounded="xl"
          class="font-weight-black text-none py-3 text-white glowing-btn"
          @click="navigaAllaHome"
        >
          <v-icon size="18" class="mr-2">mdi-home-outline</v-icon>
          Vai alla Home
        </v-btn>
      </v-col>
    </v-row>

    <!-- Pulsanti Fluttuanti FAB in stile AppSheet (Stilizzati Glassmorphic) -->
    <div class="fab-container d-sm-none">
      <v-btn
        color="orange-darken-3"
        icon
        size="large"
        elevation="6"
        class="fab-btn mb-3"
        @click="navigaAiWorkouts"
        :disabled="!schedaSelezionata"
        id="fab-eye"
      >
        <v-icon size="28">mdi-eye</v-icon>
      </v-btn>

      <v-btn
        color="orange-darken-3"
        icon
        size="large"
        elevation="6"
        class="fab-btn"
        @click="navigaAllaHome"
        :disabled="!schedaSelezionata"
        id="fab-smiley"
      >
        <v-icon size="28">mdi-emoticon-outline</v-icon>
      </v-btn>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { 
  utente, 
  idCliente, 
  ruolo, 
  selectedAthlete, 
  selectedSheet,
  setSelectedAthlete,
  setSelectedSheet
} from '../authStore.js';

const router = useRouter();

// Stato
const listaAtleti = ref([]);
const atletaSelezionato = ref(selectedAthlete.value || null);
const schedaSelezionata = ref(selectedSheet.value || null);
const listaSchede = ref([]);
const emailRiferimento = ref('');

// Loading state
const caricamentoAtleti = ref(true);
const caricamentoSchede = ref(false);

// Carica la lista degli atleti all'avvio
const caricaDatiAtleti = async () => {
  caricamentoAtleti.value = true;
  try {
    const docRef = doc(db, 'METADATA', 'clienti');
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      listaAtleti.value = docSnap.data().lista || [];
    }

    // Se è un atleta loggato, blocca la selezione a se stesso
    if (ruolo.value === 'atleta') {
      atletaSelezionato.value = idCliente.value;
      setSelectedAthlete(idCliente.value);
    }

    if (atletaSelezionato.value) {
      await caricaSchedeAtleta();
      await caricaEmailRiferimento();
    }
  } catch (error) {
    console.error("Errore caricamento atleti:", error);
  } finally {
    caricamentoAtleti.value = false;
  }
};

onMounted(() => {
  caricaDatiAtleti();
});

// Carica tutti i numeri scheda univoci dell'atleta
const caricaSchedeAtleta = async () => {
  if (!atletaSelezionato.value) return;
  
  caricamentoSchede.value = true;
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', atletaSelezionato.value)
    );
    const querySnapshot = await getDocs(q);
    
    let schedeSet = new Set();
    querySnapshot.forEach((doc) => {
      const data = doc.data();
      if (data.num_scheda) {
        schedeSet.add(data.num_scheda.trim());
      }
    });

    // Ordina numericamente
    listaSchede.value = Array.from(schedeSet).sort((a, b) => Number(a) - Number(b));

    // Se c'è una scheda globale selezionata e fa parte di questa lista, mantienila.
    // Altrimenti, seleziona l'ultima disponibile per default.
    if (selectedSheet.value && listaSchede.value.includes(selectedSheet.value)) {
      schedaSelezionata.value = selectedSheet.value;
    } else if (listaSchede.value.length > 0) {
      schedaSelezionata.value = listaSchede.value[listaSchede.value.length - 1];
      setSelectedSheet(schedaSelezionata.value);
    } else {
      schedaSelezionata.value = null;
      setSelectedSheet('');
    }
  } catch (error) {
    console.error("Errore caricamento schede atleta:", error);
  } finally {
    caricamentoSchede.value = false;
  }
};

// Carica email di riferimento da UTENTI
const caricaEmailRiferimento = async () => {
  if (!atletaSelezionato.value) return;
  emailRiferimento.value = '';

  try {
    // Cerchiamo nella collezione UTENTI se c'è un atleta con questo ID
    const q = query(
      collection(db, 'UTENTI'),
      where('ID_cliente', '==', atletaSelezionato.value)
    );
    const querySnapshot = await getDocs(q);
    
    querySnapshot.forEach((doc) => {
      emailRiferimento.value = doc.data().email || '';
    });

    // Fallback su sessione se siamo l'atleta loggato
    if (!emailRiferimento.value && atletaSelezionato.value === idCliente.value) {
      emailRiferimento.value = utente.value?.email || '';
    }
  } catch (error) {
    console.error("Errore caricamento email ref:", error);
  }
};

// Micro-vibrazione tattile per smartphone (Haptic feedback)
const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Gestisce il cambio dell'atleta
const gestisciCambioAtleta = async () => {
  vibraTattile(12);
  if (!atletaSelezionato.value) {
    setSelectedAthlete('');
    setSelectedSheet('');
    schedaSelezionata.value = null;
    listaSchede.value = [];
    return;
  }

  setSelectedAthlete(atletaSelezionato.value);
  await caricaSchedeAtleta();
  await caricaEmailRiferimento();
};

// Seleziona la scheda più alta (ULTIMA SCHEDA)
const selezionaUltimaScheda = () => {
  if (listaSchede.value.length === 0) return;
  
  vibraTattile(15);
  const ultima = listaSchede.value[listaSchede.value.length - 1];
  schedaSelezionata.value = ultima;
  setSelectedSheet(ultima);
};

// Gestisce la scelta manuale della scheda nella griglia
const gestisciSelezioneScheda = (scheda) => {
  vibraTattile(12);
  schedaSelezionata.value = { value: scheda }.value; // Assicura slegamento reattivo
  setSelectedSheet(scheda);
};

// Navigazione
const navigaAiWorkouts = () => {
  vibraTattile(10);
  router.push('/');
};

const navigaAllaHome = () => {
  vibraTattile(10);
  router.push('/home');
};
</script>

<style scoped>
.max-width-container {
  max-width: 600px;
  margin: 0 auto;
}

.min-height-screen {
  min-height: calc(100vh - 100px);
}

.text-slate-dark {
  color: #f8fafc !important;
}

.text-slate {
  color: #cbd5e1 !important;
}

.text-muted {
  color: #94a3b8 !important;
}

.uppercase {
  text-transform: uppercase;
}

.border-soft {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.bg-slate-900-op {
  background: rgba(15, 23, 42, 0.5) !important;
}

.bg-orange-darken-3-op {
  background: rgba(249, 115, 22, 0.08) !important;
}

.border-orange {
  border: 1px solid rgba(249, 115, 22, 0.25) !important;
}

.card-glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
}

.premium-header {
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.profile-avatar {
  border: 2px solid rgba(249, 115, 22, 0.4);
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.2);
}

.premium-card {
  background: rgba(15, 23, 42, 0.6) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* Griglia pulsanti scheda */
.scheda-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(76px, 1fr));
  gap: 12px;
  justify-content: center;
}

.scheda-grid-btn {
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
  font-weight: 800;
  height: 60px;
  border-radius: 12px;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}

.scheda-grid-btn:hover {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.05);
}

.scheda-grid-btn:active {
  transform: scale(0.95);
}

.scheda-grid-btn-active {
  background: linear-gradient(135deg, #ea580c, #f97316) !important;
  border-color: #f97316 !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4) !important;
  transform: scale(1.04);
}

/* Glowing buttons */
.glowing-btn {
  box-shadow: 0 8px 25px -5px rgba(249, 115, 22, 0.4) !important;
  transition: all 0.2s ease !important;
}

.glowing-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -5px rgba(249, 115, 22, 0.55) !important;
}

.glowing-btn:active {
  transform: scale(0.96);
}

.glowing-btn-blue {
  box-shadow: 0 8px 25px -5px rgba(37, 99, 235, 0.4) !important;
  transition: all 0.2s ease !important;
}

.glowing-btn-blue:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -5px rgba(37, 99, 235, 0.55) !important;
}

.glowing-btn-blue:active {
  transform: scale(0.96);
}

/* Autocomplete field custom styling */
.search-autocomplete-field :deep(.v-field) {
  background: rgba(0, 0, 0, 0.2) !important;
}

/* FABs modern glassmorphic */
.fab-container {
  position: fixed;
  bottom: 84px;
  right: 20px;
  display: flex;
  flex-direction: column;
  z-index: 99;
}

.fab-btn {
  background: rgba(15, 23, 42, 0.75) !important;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(249, 115, 22, 0.3) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4) !important;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.fab-btn:hover {
  transform: scale(1.1) translateY(-2px);
  border-color: #f97316 !important;
  box-shadow: 0 10px 35px rgba(249, 115, 22, 0.3) !important;
}

.animate-pulse-slow {
  animation: pulse-slow 3s infinite alternate;
}

@keyframes pulse-slow {
  0% {
    box-shadow: 0 8px 25px -5px rgba(249, 115, 22, 0.35) !important;
  }
  100% {
    box-shadow: 0 8px 30px 2px rgba(249, 115, 22, 0.5) !important;
  }
}
</style>