<template>
  <v-container class="px-4 py-8 max-width-container min-height-screen">
    <!-- Header Premium -->
    <div class="appsheet-header mb-6 d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-white elevation-1">
          <v-img src="https://visualgabri.github.io/Esercizi/WoApp/Immagini/A.png" alt="Superman G"></v-img>
        </v-avatar>
        <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight">Home Wo</h1>
      </div>
      <div class="header-actions">
        <v-btn icon color="slate-dark" variant="text" @click="caricaDatiScheda"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>
    </div>

    <!-- Stato vuoto se atleta o scheda non sono selezionati -->
    <div v-if="!atletaSelezionato || !schedaSelezionata" class="empty-state text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="80" color="orange-lighten-3" class="mb-4 animate-bounce">mdi-clipboard-text-search-outline</v-icon>
      <h3 class="text-h5 font-weight-bold text-slate-dark">Seleziona Atleta e Scheda</h3>
      <p class="text-body-1 text-muted mt-2">
        Vai nella scheda **Ricerca Wo** per scegliere l'atleta e il mesociclo attivo.
      </p>
      <v-btn to="/ricerca" color="orange-darken-3" class="font-weight-bold text-none mt-6" rounded="lg">
        Vai a Ricerca Wo
      </v-btn>
    </div>

    <!-- Contenuto Principale se selezionati -->
    <div v-else>
      <!-- Sub-Tabs in stile AppSheet -->
      <v-tabs
        v-model="subTab"
        color="orange-darken-3"
        align-tabs="center"
        grow
        class="card-glass border-bottom mb-6 rounded-xl elevation-1"
      >
        <v-tab value="dati" class="font-weight-bold py-3">Dati scheda</v-tab>
        <v-tab value="impostazioni" class="font-weight-bold py-3">Impostazioni scheda</v-tab>
      </v-tabs>

      <v-window v-model="subTab">
        
        <!-- WINDOW 1: DATI SCHEDA -->
        <v-window-item value="dati">
          <div class="text-center mb-8">
            <!-- Nome Atleta -->
            <h2 class="text-h4 font-weight-black text-slate-dark tracking-tight mb-2">
              {{ nomeAtleta || 'Gabriele Belmonte' }}
            </h2>
            
            <!-- Icona e Nome Workout -->
            <div class="d-flex align-center justify-center text-subtitle-1 text-muted mb-4 font-weight-bold">
              <v-icon color="blue-darken-2" class="mr-2" size="22">mdi-file-document-outline</v-icon>
              Workout n.{{ schedaSelezionata }}
            </div>

            <!-- Box Istruzione Dinamica "Devi fare..." (Green Box in stile AppSheet) -->
            <v-card class="instruction-card pa-4 rounded-xl mb-6 mx-auto elevation-1" max-width="500">
              <div class="d-flex align-center justify-center">
                <v-icon color="green-darken-2" size="32" class="mr-3">mdi-check-circle</v-icon>
                <div class="text-left">
                  <h3 class="text-h6 font-weight-black text-green-darken-3 leading-tight">
                    Devi fare la settimana {{ settimanaAttiva }} dell'allenamento {{ giornoAttivo }}
                  </h3>
                </div>
              </div>
            </v-card>
          </div>

          <!-- Pulsanti Circolari in stile AppSheet -->
          <v-row class="justify-center mb-8 gap-4 px-2" dense>
            <!-- LEGGIMI -->
            <v-col cols="5" sm="3" class="text-center d-flex flex-column align-center">
              <v-btn
                color="orange-darken-3"
                icon
                size="large"
                class="circle-btn elevation-3 mb-2"
                @click="apriLeggimi"
                id="btn-leggimi"
              >
                <v-icon size="28">mdi-email-open-outline</v-icon>
              </v-btn>
              <span class="text-caption font-weight-bold text-slate uppercase text-center leading-tight">Leggimi</span>
            </v-col>

            <!-- ESERCIZI DA FILMARE -->
            <v-col cols="5" sm="3" class="text-center d-flex flex-column align-center">
              <v-btn
                color="orange-darken-3"
                icon
                size="large"
                class="circle-btn elevation-3 mb-2"
                @click="apriFilmati"
                id="btn-filmati"
              >
                <v-icon size="28">mdi-video-plus-outline</v-icon>
              </v-btn>
              <span class="text-caption font-weight-bold text-slate uppercase text-center leading-tight">Filmati ({{ countFilmati }})</span>
            </v-col>

            <!-- RESET / ELIMINA -->
            <v-col cols="5" sm="3" class="text-center d-flex flex-column align-center">
              <v-btn
                color="orange-darken-3"
                icon
                size="large"
                class="circle-btn elevation-3 mb-2"
                @click="apriReset"
                id="btn-reset"
              >
                <v-icon size="28">mdi-skull-crossbones-outline</v-icon>
              </v-btn>
              <span class="text-caption font-weight-bold text-slate uppercase text-center leading-tight">Master Wo</span>
            </v-col>

            <!-- ESERCIZI DA TESTARE -->
            <v-col cols="5" sm="3" class="text-center d-flex flex-column align-center">
              <v-btn
                color="orange-darken-3"
                icon
                size="large"
                class="circle-btn elevation-3 mb-2"
                @click="apriTest"
                id="btn-test"
              >
                <v-icon size="28">mdi-dumbbell</v-icon>
              </v-btn>
              <span class="text-caption font-weight-bold text-slate uppercase text-center leading-tight">Testare ({{ countTest }})</span>
            </v-col>
          </v-row>

          <!-- Dettagli scheda in stile AppSheet -->
          <v-card class="premium-card rounded-2xl pa-4 mb-6" elevation="2">
            <v-list class="bg-transparent py-0" density="comfortable">
              <v-list-item class="px-0 py-2 border-bottom-soft">
                <template v-slot:prepend>
                  <v-icon color="blue-darken-2" class="mr-3">mdi-checkbox-marked-circle-outline</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-dark">Stato</v-list-item-title>
                <v-list-item-subtitle class="text-body-1 text-slate font-weight-bold">
                  🆗 Definitiva
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2 border-bottom-soft">
                <template v-slot:prepend>
                  <v-icon color="green-darken-2" class="mr-3">mdi-calendar-range</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-dark">Dal (Data Inizio)</v-list-item-title>
                <v-list-item-subtitle class="text-body-1 text-green-darken-3 font-weight-black">
                  {{ dataInizio }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2 border-bottom-soft">
                <template v-slot:prepend>
                  <v-icon color="red-darken-2" class="mr-3">mdi-calendar-remove</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-dark">Al (Data Scadenza)</v-list-item-title>
                <v-list-item-subtitle class="text-body-1 text-red-darken-3 font-weight-black">
                  {{ dataFine }}
                </v-list-item-subtitle>
              </v-list-item>

              <v-list-item class="px-0 py-2">
                <template v-slot:prepend>
                  <v-icon color="orange-darken-2" class="mr-3">mdi-weight-lifter</v-icon>
                </template>
                <v-list-item-title class="font-weight-bold text-slate-dark">Test presenti</v-list-item-title>
                <v-list-item-subtitle class="text-body-1 text-slate font-weight-bold">
                  🏋️ Massimali e test di carico abilitati
                </v-list-item-subtitle>
              </v-list-item>
            </v-list>
          </v-card>
        </v-window-item>

        <!-- WINDOW 2: IMPOSTAZIONI SCHEDA (Configurazione per Atleta/Coach) -->
        <v-window-item value="impostazioni">
          <v-card class="premium-card rounded-2xl pa-5" elevation="2">
            <h3 class="text-h6 font-weight-bold text-slate-dark mb-4">Configura scheda attiva</h3>
            
            <div class="text-subtitle-2 font-weight-bold text-slate-dark mb-2">Settimana Corrente *</div>
            <v-select
              v-model="settimanaAttiva"
              :items="[1, 2, 3, 4, 5, 6]"
              variant="outlined"
              rounded="lg"
              color="orange-darken-3"
              class="mb-4"
              hide-details
              @update:model-value="salvaImpostazioni"
              id="select-settimana"
            ></v-select>

            <div class="text-subtitle-2 font-weight-bold text-slate-dark mb-2">Allenamento/Giorno Odierno *</div>
            <v-select
              v-model="giornoAttivo"
              :items="['A', 'B', 'C', 'D']"
              variant="outlined"
              rounded="lg"
              color="orange-darken-3"
              class="mb-4"
              hide-details
              @update:model-value="salvaImpostazioni"
              id="select-giorno"
            ></v-select>

            <div class="text-caption text-orange-darken-4 font-weight-medium bg-orange-lighten-5 pa-3 rounded-lg mt-4">
              <v-icon size="16" class="mr-1">mdi-information-outline</v-icon>
              Le impostazioni modificate si rifletteranno subito nella dashboard principale dell'atleta.
            </div>
          </v-card>
        </v-window-item>

      </v-window>
    </div>

    <!-- FAB PLAY: Naviga subito alla scheda dei WORKOUTS per iniziare ad allenarsi -->
    <div v-if="atletaSelezionato && schedaSelezionata" class="fab-container">
      <v-btn
        color="orange-darken-3"
        icon
        size="x-large"
        elevation="6"
        class="fab-play-btn"
        @click="avviaAllenamento"
        id="fab-play"
      >
        <v-icon size="36">mdi-play</v-icon>
      </v-btn>
    </div>

    <!-- DIALOG POPUPS -->
    <!-- dialog LEGGIMI -->
    <v-dialog v-model="mostraLeggimi" max-width="500" rounded="xl">
      <v-card class="pa-5 rounded-2xl">
        <v-card-title class="font-weight-black text-slate-dark d-flex align-center px-0">
          <v-icon color="orange-darken-3" class="mr-2">mdi-email-open-outline</v-icon>
          Messaggio del Coach 📋
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-1 text-slate font-weight-medium leading-relaxed">
          {{ coachMessage || 'Nessun messaggio o nota specifica per questa scheda dal tuo allenatore.' }}
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraLeggimi = false">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog FILMATI -->
    <v-dialog v-model="mostraFilmati" max-width="500" rounded="xl">
      <v-card class="pa-5 rounded-2xl">
        <v-card-title class="font-weight-black text-slate-dark d-flex align-center px-0">
          <v-icon color="orange-darken-3" class="mr-2">mdi-video-plus-outline</v-icon>
          Esercizi da Filmare 📹
        </v-card-title>
        <v-card-text class="px-0 py-4">
          <div v-if="filmatiList.length === 0" class="text-center py-4 text-muted text-body-2">
            Nessun esercizio da riprendere in questa scheda! 👍
          </div>
          <v-list v-else density="comfortable" class="bg-transparent py-0">
            <v-list-item
              v-for="ex in filmatiList"
              :key="ex.id"
              class="px-0 py-2 border-bottom-soft"
            >
              <v-list-item-title class="font-weight-bold text-slate-dark">{{ ex.des_esercizio }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption text-orange-darken-3">Giorno {{ ex.des_giorno }} • Riga {{ ex.num_riga_giorno }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraFilmati = false">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog TEST -->
    <v-dialog v-model="mostraTest" max-width="500" rounded="xl">
      <v-card class="pa-5 rounded-2xl">
        <v-card-title class="font-weight-black text-slate-dark d-flex align-center px-0">
          <v-icon color="orange-darken-3" class="mr-2">mdi-dumbbell</v-icon>
          Esercizi da Testare 🏋️
        </v-card-title>
        <v-card-text class="px-0 py-4">
          <div v-if="testList.length === 0" class="text-center py-4 text-muted text-body-2">
            Nessun test o AMRAP specifico richiesto in questa scheda.
          </div>
          <v-list v-else density="comfortable" class="bg-transparent py-0">
            <v-list-item
              v-for="ex in testList"
              :key="ex.id"
              class="px-0 py-2 border-bottom-soft"
            >
              <v-list-item-title class="font-weight-bold text-slate-dark">{{ ex.des_esercizio }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption text-blue-darken-3">Giorno {{ ex.des_giorno }} • Test: {{ ex.des_qta_report }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraTest = false">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog CONFERMA RESET -->
    <v-dialog v-model="confermaReset" max-width="400" rounded="xl">
      <v-card class="pa-5 rounded-2xl">
        <v-card-title class="font-weight-black text-red-darken-3 d-flex align-center px-0">
          <v-icon color="red-darken-3" class="mr-2">mdi-alert-outline</v-icon>
          Reset Master Workout
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-2 text-slate font-weight-medium">
          Attenzione! Questa operazione pulirà tutti i carichi e le note inserite per questa specifica scheda (Workout n.{{ schedaSelezionata }}). Vuoi procedere?
        </v-card-text>
        <v-card-actions class="px-0 pb-0 gap-3">
          <v-btn color="grey-darken-1" variant="outlined" class="flex-grow-1" rounded="lg" @click="confermaReset = false">Annulla</v-btn>
          <v-btn color="red-darken-2" variant="flat" class="flex-grow-1" rounded="lg" @click="eseguiResetDati" :loading="resettando">Reset</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { selectedAthlete, selectedSheet } from '../authStore.js';

const router = useRouter();

// Micro-vibrazione tattile per smartphone (Haptic feedback)
const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Stato principale
const subTab = ref('dati');
const atletaSelezionato = ref(selectedAthlete.value);
const schedaSelezionata = ref(selectedSheet.value);

// Dati dinamici scheda
const nomeAtleta = ref('');
const settimanaAttiva = ref(parseInt(localStorage.getItem('settimanaAttiva_' + selectedAthlete.value)) || 2);
const giornoAttivo = ref(localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'C');
const dataInizio = ref('18 mag 26');
const dataFine = ref('28 giu 26');

// Modali e popups
const mostraLeggimi = ref(false);
const mostraFilmati = ref(false);
const mostraTest = ref(false);
const confermaReset = ref(false);
const resettando = ref(false);

const coachMessage = ref('');
const filmatiList = ref([]);
const testList = ref([]);

// Conteggi
const countFilmati = ref(0);
const countTest = ref(0);

// Caricamento
const caricaDatiScheda = async () => {
  if (!selectedAthlete.value || !selectedSheet.value) return;

  atletaSelezionato.value = selectedAthlete.value;
  schedaSelezionata.value = selectedSheet.value;

  // Carica i dettagli dall'utente / sessione
  nomeAtleta.value = 'Gabriele Belmonte';
  try {
    // Cerca l'atleta per estrarre il nome effettivo
    const qAtleta = query(collection(db, 'UTENTI'), where('ID_cliente', '==', selectedAthlete.value));
    const snapAtleta = await getDocs(qAtleta);
    snapAtleta.forEach(d => {
      const email = d.data().email || '';
      nomeAtleta.value = email.split('@')[0].toUpperCase();
    });

    // Carica gli esercizi per estrarre i test, i video e le note
    const qEx = query(
      collection(db, 'STORYBOARD'),
      where('\uFEFF"ID_cliente"', '==', selectedAthlete.value),
      where('num_scheda', '==', selectedSheet.value)
    );
    const snapEx = await getDocs(qEx);
    
    let tempFilmati = [];
    let tempTest = [];
    let noteScheda = '';

    snapEx.forEach(d => {
      const data = d.data();
      
      // Esercizi da filmare (flg_video === 'true')
      if (data.flg_video === 'true') {
        tempFilmati.push({ id: d.id, ...data });
      }

      // Esercizi da testare (ad es. AMRAP o test in des_qta_report o tecnica)
      const qta = (data.des_qta_report || '').toLowerCase();
      if (qta.includes('amrap') || qta.includes('test') || qta.includes('ramp')) {
        tempTest.push({ id: d.id, ...data });
      }

      // Estrai le note generali del coach
      if (data.des_note && !noteScheda) {
        noteScheda = data.des_note;
      }
    });

    filmatiList.value = tempFilmati;
    countFilmati.value = tempFilmati.length;

    testList.value = tempTest;
    countTest.value = tempTest.length;

    coachMessage.value = noteScheda;

  } catch (error) {
    console.error("Errore caricamento dettagli Home Wo:", error);
  }
};

onMounted(() => {
  caricaDatiScheda();
});

// Ascolta i cambiamenti di selezione globale
watch([selectedAthlete, selectedSheet], () => {
  caricaDatiScheda();
  settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + selectedAthlete.value)) || 2;
  giornoAttivo.value = localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'C';
});

// Salva impostazioni locali
const salvaImpostazioni = () => {
  vibraTattile(10);
  localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, settimanaAttiva.value);
  localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giornoAttivo.value);
};

// Resetta tutti i dati di input per questo mesociclo
const eseguiResetDGrid = async () => {
  resettando.value = true;
  try {
    vibraTattile(35); // Vibrazione forte di allerta
    const qEx = query(
      collection(db, 'STORYBOARD'),
      where('\uFEFF"ID_cliente"', '==', selectedAthlete.value),
      where('num_scheda', '==', selectedSheet.value)
    );
    const snapEx = await getDocs(qEx);
    
    // Esegui pulizia di ins_week e reps_week
    const promesse = [];
    snapEx.forEach(documento => {
      const docRef = doc(db, 'STORYBOARD', documento.id);
      const puliziaPayload = {};
      for (let w = 1; w <= 6; w++) {
        puliziaPayload['ins_week' + w] = '';
        puliziaPayload['reps_week' + w] = '';
      }
      puliziaPayload['des_commenti'] = '';
      promesse.push(updateDoc(docRef, puliziaPayload));
    });

    await Promise.all(promesse);
    confermaReset.value = false;
    await caricaDatiScheda();
  } catch (error) {
    console.error("Errore durante il reset della scheda:", error);
  } finally {
    resettando.value = false;
  }
};

const eseguiResetDati = () => {
  eseguiResetDGrid();
};

// Naviga subito ai workouts
const avviaAllenamento = () => {
  vibraTattile(15);
  router.push('/');
};

// Gestione click bottoni rotondi con vibrazione
const apriLeggimi = () => {
  vibraTattile(12);
  mostraLeggimi.value = true;
};

const apriFilmati = () => {
  vibraTattile(12);
  mostraFilmati.value = true;
};

const apriReset = () => {
  vibraTattile(15);
  confermaReset.value = true;
};

const apriTest = () => {
  vibraTattile(12);
  mostraTest.value = true;
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

.appsheet-header {
  border-bottom: 2px solid #f97316;
  padding-bottom: 12px;
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

.bg-orange-lighten-5 {
  background: rgba(249, 115, 22, 0.1) !important;
  border: 1px solid rgba(249, 115, 22, 0.3) !important;
}

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.premium-card {
  /* Eredita Glassmorphism globale da style.css */
}

/* Green box per le istruzioni attive */
.instruction-card {
  border: 1px solid rgba(16, 185, 129, 0.3) !important;
  background: rgba(16, 185, 129, 0.1) !important;
  backdrop-filter: blur(10px) !important;
  -webkit-backdrop-filter: blur(10px) !important;
  box-shadow: 0 4px 15px -5px rgba(16, 185, 129, 0.3) !important;
}

/* Pulsanti circolari stile AppSheet */
.circle-btn {
  width: 56px !important;
  height: 56px !important;
  transition: transform 0.2s ease;
}

.circle-btn:hover {
  transform: scale(1.08);
}

.leading-relaxed {
  line-height: 1.625;
}

/* FAB Play in basso a destra */
.fab-container {
  position: fixed;
  bottom: 90px;
  right: 20px;
  z-index: 99;
}

.fab-play-btn {
  width: 64px !important;
  height: 64px !important;
  transition: transform 0.2s ease;
}

.fab-play-btn:hover {
  transform: scale(1.08);
}

.animate-bounce {
  animation: bounce 2s infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}
</style>
