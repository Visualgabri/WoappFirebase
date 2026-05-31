<template>
  <v-container class="px-4 py-8 max-width-container bg-slate-50 min-height-screen">
    <!-- Header Premium con stile AppSheet Evoluto -->
    <div class="appsheet-header mb-6 d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-white elevation-1">
          <v-img src="https://visualgabri.github.io/Esercizi/WoApp/Immagini/A.png" alt="Superman G"></v-img>
        </v-avatar>
        <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight">Ricerca Wo</h1>
      </div>
      <div class="header-actions">
        <v-btn icon color="slate-dark" variant="text" @click="caricaDatiAtleti"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>
    </div>

    <!-- Sezione di Selezione Atleta (Mostrata solo se Coach, se Atleta è bloccata) -->
    <v-card class="premium-card rounded-2xl pa-5 mb-6" elevation="2">
      <div class="d-flex align-center mb-4">
        <v-avatar color="orange-lighten-5" size="44" class="mr-3">
          <v-icon color="orange-darken-3">mdi-account-search</v-icon>
        </v-avatar>
        <div>
          <div class="text-caption text-muted font-weight-bold uppercase">SceltaNomeCognome *</div>
          <h3 v-if="ruolo === 'atleta'" class="text-h6 font-weight-bold text-slate-dark">Atleta Corrente</h3>
          <h3 v-else class="text-h6 font-weight-bold text-slate-dark">Seleziona Atleta</h3>
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
        hide-details
        @update:model-value="gestisciCambioAtleta"
        id="atleta-dropdown"
      ></v-autocomplete>
      
      <!-- Box bloccato per l'Atleta loggato -->
      <div v-else class="pa-3 rounded-lg bg-orange-lighten-5 border-orange d-flex align-center justify-space-between">
        <div class="d-flex align-center">
          <v-icon color="orange-darken-3" class="mr-2">mdi-account-check</v-icon>
          <span class="font-weight-bold text-slate-dark text-body-1">{{ utente?.email }}</span>
        </div>
        <v-chip color="orange-darken-3" size="small" class="font-weight-bold">ID: {{ idCliente }}</v-chip>
      </div>
    </v-card>

    <!-- Bottone ULTIMA SCHEDA (Premium Orange) -->
    <div v-if="atletaSelezionato" class="d-flex justify-center mb-6">
      <v-btn
        color="orange-darken-3"
        size="large"
        rounded="xl"
        class="font-weight-black text-none px-8 py-3 elevation-3"
        @click="selezionaUltimaScheda"
        :disabled="listaSchede.length === 0"
        id="btn-ultima-scheda"
      >
        <v-icon left class="mr-2">mdi-skip-next</v-icon>
        ULTIMA SCHEDA
      </v-btn>
    </div>

    <!-- Griglia dei Numeri Scheda (Scegli scheda * stile AppSheet) -->
    <v-card v-if="atletaSelezionato" class="premium-card rounded-2xl pa-5 mb-6" elevation="2">
      <div class="text-subtitle-2 font-weight-bold text-slate-dark mb-4 d-flex align-center">
        <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-grid-large</v-icon>
        Scegli scheda *
      </div>

      <div v-if="caricamentoSchede" class="text-center my-6">
        <v-progress-circular indeterminate color="orange" size="40"></v-progress-circular>
        <p class="mt-2 text-caption text-muted">Caricamento schede disponibili...</p>
      </div>

      <div v-else-if="listaSchede.length === 0" class="text-center my-6 py-4">
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
          {{ scheda }}
        </button>
      </div>
    </v-card>

    <!-- Info email di riferimento dell'atleta loggato -->
    <v-card v-if="atletaSelezionato" class="premium-card rounded-2xl pa-4" elevation="1">
      <div class="text-caption text-muted font-weight-bold uppercase">des_emailRef</div>
      <div class="text-body-1 font-weight-bold text-slate-dark d-flex align-center mt-1">
        <v-icon size="18" color="grey" class="mr-2">mdi-email-outline</v-icon>
        {{ emailRiferimento || 'Nessuna mail di riferimento' }}
      </div>
    </v-card>

    <!-- Pulsanti Fluttuanti FAB in stile AppSheet -->
    <div class="fab-container">
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
      where('\uFEFF"ID_cliente"', '==', atletaSelezionato.value)
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
  min-height: calc(100vh - 140px);
}

/* Stile Intestazione Superman G */
.appsheet-header {
  border-bottom: 2px solid #ef6c00;
  padding-bottom: 12px;
}

.text-slate-dark {
  color: #1e293b;
}

.text-muted {
  color: #64748b;
}

.uppercase {
  text-transform: uppercase;
}

.bg-orange-lighten-5 {
  background-color: #fff8e1;
}

.border-orange {
  border: 1px solid rgba(239, 108, 0, 0.3);
}

.premium-card {
  background: white;
  border: 1px solid #e2e8f0;
}

/* Griglia dei numeri scheda in stile AppSheet originale */
.scheda-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(68px, 1fr));
  gap: 12px;
  justify-content: center;
}

.scheda-grid-btn {
  background-color: #f8fafc;
  border: 1px solid #cbd5e1;
  color: #334155;
  font-weight: 700;
  font-size: 1.1rem;
  height: 52px;
  border-radius: 8px;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 1px 3px rgba(0,0,0,0.05);
}

.scheda-grid-btn:hover {
  border-color: #ef6c00;
  background-color: #fff8e1;
}

.scheda-grid-btn-active {
  background-color: #ef6c00 !important;
  border-color: #ef6c00 !important;
  color: white !important;
  box-shadow: 0 4px 10px rgba(239, 108, 0, 0.3) !important;
  transform: scale(1.05);
}

/* FAB Container in stile AppSheet originale */
.fab-container {
  position: fixed;
  bottom: 90px;
  right: 20px;
  display: flex;
  flex-direction: column;
  z-index: 99;
}

.fab-btn {
  transition: transform 0.2s ease;
}

.fab-btn:hover {
  transform: scale(1.08);
}
</style>