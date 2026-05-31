<template>
  <v-container class="px-3 py-4 max-width-container bg-slate-50 min-height-screen pb-12">
    <!-- Barra Superiore con pulsante indietro stile AppSheet -->
    <div class="d-flex align-center justify-space-between mb-4 appsheet-top-bar">
      <v-btn
        icon
        color="orange-darken-3"
        variant="text"
        @click="tornaIndietro"
        id="btn-dettaglio-indietro"
      >
        <v-icon size="28">mdi-arrow-left</v-icon>
      </v-btn>
      <h3 class="text-subtitle-1 font-weight-black text-slate-dark text-truncate">
        {{ workout?.des_esercizio || 'Dettaglio Esercizio' }}
      </h3>
      <v-btn icon color="slate-dark" variant="text" @click="caricaDatiEsercizio"><v-icon>mdi-refresh</v-icon></v-btn>
    </div>

    <!-- Swipe indicator hint -->
    <div class="text-center mb-3 mt-n2 opacity-60 d-flex align-center justify-center gap-1">
      <v-icon size="14" color="grey">mdi-gesture-swipe-horizontal</v-icon>
      <span class="text-super-caption text-muted font-weight-bold uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">Swipe per scorrere gli esercizi</span>
    </div>

    <!-- Stato di caricamento -->
    <div v-if="caricamento" class="text-center my-12">
      <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
      <p class="mt-2 text-caption text-muted">Caricamento dettagli esercizio...</p>
    </div>

    <!-- Errore o esercizio non trovato -->
    <div v-else-if="!workout" class="text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="64" color="red-lighten-2" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h3 class="text-h6 font-weight-bold text-slate-dark">Esercizio non trovato</h3>
    </div>

    <!-- Contenuto Principale (Stile AppSheet verticale fedele) -->
    <div v-else class="exercise-detail-area">
      
      <!-- 1. Grande GIF dell'Esercizio in alto -->
      <v-card class="image-premium-frame rounded-2xl overflow-hidden mb-5 elevation-3" max-height="300">
        <v-img
          :src="getGifUrl(workout.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600'"
          cover
          class="bg-grey-lighten-4"
        >
          <template v-slot:placeholder>
            <div class="fill-height d-flex align-center justify-center bg-slate-100">
              <v-progress-circular indeterminate color="orange"></v-progress-circular>
            </div>
          </template>
        </v-img>
      </v-card>

      <!-- 2. Intestazione Principale con Massimale / RMT -->
      <div class="mb-4 text-left">
        <h2 class="text-h5 font-weight-black text-slate-dark leading-tight d-flex align-center flex-wrap gap-1">
          <v-icon color="orange-darken-3" class="mr-1" size="24">mdi-trophy-outline</v-icon>
          {{ workout.des_esercizio }}
        </h2>

        <!-- Visualizzazione RMT Formattata Premium Gamified -->
        <div v-if="parsedRmt(workout.des_esercizio_2)" class="rmt-premium-card mt-3 pa-3 rounded-xl card-glass border-orange-darken-3-op">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center gap-1">
              <span class="text-caption text-muted font-weight-black uppercase mr-1" style="font-size: 0.65rem;">Livello Forza:</span>
              <v-icon
                v-for="i in parsedRmt(workout.des_esercizio_2).stelle"
                :key="i"
                color="amber-darken-2"
                size="16"
              >
                mdi-star
              </v-icon>
            </div>
            <span class="text-super-caption text-muted font-weight-bold">
              Aggiornato il {{ parsedRmt(workout.des_esercizio_2).data }}
            </span>
          </div>

          <v-row dense class="align-center">
            <v-col cols="6" class="border-right-soft">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block">Massimale Teorico (1RMT)</span>
                <span class="text-h6 font-weight-black text-orange-darken-3">
                  {{ parsedRmt(workout.des_esercizio_2).massimale }} <span class="text-caption text-muted">KG</span>
                </span>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block">Target Prossimo Livello</span>
                <span class="text-h6 font-weight-black text-slate-dark">
                  ~{{ parsedRmt(workout.des_esercizio_2).prossimoLivello }} <span class="text-caption text-muted">KG</span>
                </span>
              </div>
            </v-col>
          </v-row>

          <!-- RPG Level-up Progress Bar -->
          <div class="mt-3 px-1 border-top-soft pt-2">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.6rem;">Progresso Prossima Stella</span>
              <span class="text-super-caption text-amber-darken-2 font-weight-black" style="font-size: 0.6rem;">
                {{ getRmtProgress(parsedRmt(workout.des_esercizio_2)) }}% completato
              </span>
            </div>
            <v-progress-linear
              :model-value="getRmtProgress(parsedRmt(workout.des_esercizio_2))"
              color="amber-darken-2"
              height="5"
              rounded
              striped
              active
              class="elevation-1"
            ></v-progress-linear>
            <span class="text-super-caption text-muted font-weight-bold d-block mt-1 text-right" style="font-size: 0.58rem;">
              Carica ancora <span class="text-amber-lighten-2 font-weight-black">~{{ parsedRmt(workout.des_esercizio_2).prossimoLivello }} KG</span> per salire di livello!
            </span>
          </div>
        </div>

        <!-- Fallback se des_esercizio_2 non è una stringa RMT speciale -->
        <div v-else-if="workout.des_esercizio_2" class="text-subtitle-2 font-weight-black text-red-darken-3 mt-1 uppercase">
          {{ workout.des_esercizio_2 }}
        </div>

        <!-- Rigo Dettaglio Rapido -->
        <div class="text-subtitle-2 font-weight-bold text-slate mt-2 d-flex align-center flex-wrap gap-2">
          <v-chip color="orange-darken-3" size="small" class="font-weight-black">{{ workout.des_settore_princ }}</v-chip>
          <v-chip color="blue-darken-3" variant="outlined" size="small" class="font-weight-bold">
            {{ workout.des_qta_report }}
          </v-chip>
          <v-chip
            color="orange-darken-3"
            variant="tonal"
            size="small"
            class="font-weight-black clickable-timer-chip"
            prepend-icon="mdi-clock-outline"
            @click="avviaTimerRecupero(workout.des_rec_report, workout.des_esercizio)"
          >
            ⏱️ Recupero: {{ workout.des_rec_report }}
          </v-chip>
        </div>
      </div>

      <!-- 3. Coaching Note Card (Cartellino giallo in stile AppSheet) -->
      <v-card class="coaching-note-card pa-4 rounded-xl mb-6 elevation-1" border="left">
        <div class="d-flex align-start">
          <v-icon color="amber-darken-4" class="mr-2 mt-1">mdi-lead-pencil</v-icon>
          <div class="text-left">
            <span class="text-caption text-amber-darken-4 font-weight-black uppercase tracking-wider">Note del Coach:</span>
            <p class="text-body-2 text-slate font-weight-bold mt-1 leading-relaxed">
              {{ workout.des_note || 'Nessuna indicazione specifica per questa scheda.' }}
            </p>
          </div>
        </div>
      </v-card>

      <!-- 4. Lista delle Settimane con opzione di visualizzazione fissa o dinamica -->
      <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2 text-left">
        <h3 class="text-subtitle-2 font-weight-black text-slate-dark d-flex align-center">
          <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-clipboard-list-outline</v-icon>
          Progressione Settimanale
        </h3>
        
        <v-btn-toggle
          v-model="modalitaSettimane"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="xl"
          class="card-glass border"
        >
          <v-btn value="dinamica" size="small" class="font-weight-bold" id="btn-toggle-dinamica">
            <v-icon size="16" class="mr-1">mdi-target</v-icon> Dinamica
          </v-btn>
          <v-btn value="fissa" size="small" class="font-weight-bold" id="btn-toggle-fissa">
            <v-icon size="16" class="mr-1">mdi-calendar-month</v-icon> Fissa
          </v-btn>
        </v-btn-toggle>
      </div>

      <div class="weeks-stacked-list mb-6">
        <v-card
          v-for="sett in settimaneVisualizzate"
          :key="sett"
          class="week-log-card rounded-2xl pa-4 mb-4 border transition-all"
          :class="{
            'week-active-border': sett === settimanaAttiva,
            'week-secondary-card': modalitaSettimane === 'dinamica' && sett !== settimanaAttiva
          }"
          elevation="1"
        >
          <!-- Intestazione della Settimana -->
          <div class="d-flex align-center justify-space-between mb-3">
            <div class="d-flex align-center">
              <v-icon
                :color="isWeekCompleted(sett) ? 'green-darken-2' : 'grey-lighten-1'"
                class="mr-2"
              >
                {{ isWeekCompleted(sett) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
              </v-icon>
              <span class="text-subtitle-2 font-weight-black" :class="sett === settimanaAttiva ? 'text-orange-darken-3' : 'text-slate-dark'">
                WEEK {{ sett }}
              </span>
              <v-chip v-if="sett === settimanaAttiva" color="orange-darken-3" size="x-small" class="ml-2 font-weight-black" variant="flat">ATTIVA</v-chip>
              <v-chip v-else-if="modalitaSettimane === 'dinamica'" color="grey-darken-2" size="x-small" class="ml-2 font-weight-bold" variant="outlined">ALTRE</v-chip>
            </div>
            
            <div v-if="workout['perc_irt_w' + sett]" class="text-caption text-red-darken-3 font-weight-bold">
              IRT: {{ workout['perc_irt_w' + sett] }}%
            </div>
          </div>

          <!-- Prescrizione Tecnica Formattata (senza simboli strani) -->
          <div v-if="parsedPrescription(workout['des_week' + sett])" class="mb-3 px-1">
            <!-- Rigo Principale con Serie e Peso Totale -->
            <v-row dense class="mb-2">
              <!-- Serie e Ripetizioni -->
              <v-col cols="6">
                <div class="prescription-chip-box px-3 py-2 rounded-xl text-left">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5">Lavoro</span>
                  <span class="text-h6 font-weight-black text-orange-darken-3">
                    {{ parsedPrescription(workout['des_week' + sett]).reps }}
                  </span>
                </div>
              </v-col>
              <!-- Peso Totale -->
              <v-col cols="6">
                <div class="prescription-chip-box px-3 py-2 rounded-xl text-left">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5">Carico Totale</span>
                  <span class="text-h6 font-weight-black text-slate-dark">
                    {{ parsedPrescription(workout['des_week' + sett]).total }} <span class="text-caption text-muted">KG</span>
                  </span>
                </div>
              </v-col>
            </v-row>

            <!-- Rigo Secondario con Peso per Lato e Percentuali -->
            <v-row dense>
              <!-- Peso per Lato -->
              <v-col cols="4">
                <div class="prescription-chip-box px-2 py-2 rounded-lg text-left">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5">Per Lato</span>
                  <span class="text-body-2 font-weight-black text-blue-lighten-2">
                    {{ parsedPrescription(workout['des_week' + sett]).side }} <span class="text-super-caption text-muted">KG</span>
                  </span>
                </div>
              </v-col>
              <!-- % Massimale -->
              <v-col cols="4">
                <div class="prescription-chip-box px-2 py-2 rounded-lg text-left">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5">% 1RM</span>
                  <span class="text-body-2 font-weight-black text-orange-lighten-2">
                    {{ parsedPrescription(workout['des_week' + sett]).max }}
                  </span>
                </div>
              </v-col>
              <!-- % Sforzo -->
              <v-col cols="4">
                <div class="prescription-chip-box px-2 py-2 rounded-lg text-left">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5">Sforzo</span>
                  <span class="text-body-2 font-weight-black text-green-lighten-2">
                    {{ parsedPrescription(workout['des_week' + sett]).effort }}
                  </span>
                </div>
              </v-col>
            </v-row>
          </div>
          
          <!-- Fallback se non corrisponde al pattern speciale -->
          <div v-else class="week-prescription-text text-body-2 font-weight-bold text-slate mb-3 py-1 px-2 rounded bg-slate-100">
            {{ workout['des_week' + sett] || 'Nessuna prescrizione' }}
          </div>

          <!-- Input di inserimento Carico (puramente testuale) -->
          <div class="mt-2">
            <v-text-field
              v-model="inputSettimane[sett].ins"
              label="Carico inserito (es. 45kg o note)"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              color="orange-darken-3"
              prepend-inner-icon="mdi-pencil-outline"
              @blur="salvaDatoSettimanale(sett, 'ins')"
              :id="'input-peso-w' + sett"
            ></v-text-field>
          </div>
        </v-card>

        <!-- Bottone Premium per Espandere/Nascondere le altre settimane in modalità Dinamica -->
        <div v-if="modalitaSettimane === 'dinamica'" class="text-center mt-2 mb-4">
          <v-btn
            variant="text"
            color="orange-darken-3"
            class="font-weight-black text-none"
            density="comfortable"
            rounded="xl"
            @click="toggleAltreDinamiche"
            id="btn-toggle-altre-dinamica"
          >
            <v-icon class="mr-1" size="18">
              {{ mostraAltreDinamica ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down' }}
            </v-icon>
            {{ mostraAltreDinamica ? 'Nascondi le altre settimane' : 'Mostra le altre settimane (5)' }}
          </v-btn>
        </div>
      </div>

      <!-- 5. Elenco Dettagli Tecnici (stile AppSheet fedele a fondo pagina) -->
      <h3 class="text-subtitle-2 font-weight-black text-slate-dark mb-4 d-flex align-center">
        <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-cogs</v-icon>
        Dettagli Tecnici Esercizio
      </h3>

      <v-card class="premium-card rounded-2xl pa-4 mb-6" elevation="2">
        <v-list class="bg-transparent py-0" density="comfortable">
          <!-- Muscolo Target -->
          <v-list-item class="px-0 py-2 border-bottom-soft text-left">
            <v-list-item-title class="text-caption text-muted font-weight-bold uppercase">Muscolo target</v-list-item-title>
            <v-list-item-subtitle class="text-body-1 font-weight-black text-slate-dark mt-1">
              {{ workout.des_settore || 'Generico' }}
            </v-list-item-subtitle>
          </v-list-item>

          <!-- Giorno -->
          <v-list-item class="px-0 py-2 border-bottom-soft text-left">
            <v-list-item-title class="text-caption text-muted font-weight-bold uppercase">Giorno</v-list-item-title>
            <v-list-item-subtitle class="text-body-1 font-weight-bold text-slate-dark mt-1">
              Giorno {{ workout.des_giorno }}
            </v-list-item-subtitle>
          </v-list-item>

          <!-- N. Esercizio -->
          <v-list-item class="px-0 py-2 border-bottom-soft text-left">
            <v-list-item-title class="text-caption text-muted font-weight-bold uppercase">N. esercizio o superserie</v-list-item-title>
            <v-list-item-subtitle class="text-body-1 font-weight-bold text-slate-dark mt-1">
              Posizione {{ workout.num_riga_giorno }} {{ workout.alf_superserie ? ' - Superserie ' + workout.alf_superserie : '' }}
            </v-list-item-subtitle>
          </v-list-item>

          <!-- Note Attrezzo -->
          <v-list-item class="px-0 py-2 border-bottom-soft text-left">
            <v-list-item-title class="text-caption text-muted font-weight-bold uppercase">Note attrezzo</v-list-item-title>
            <div class="mt-1 flex-grow-1">
              <v-text-field
                v-model="noteAttrezzo"
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                color="orange-darken-3"
                @blur="salvaDatoGenerale('des_note_attrezzo', noteAttrezzo)"
                id="input-detail-note-attrezzo"
              ></v-text-field>
            </div>
          </v-list-item>

          <!-- Note Esercizio (Input box) -->
          <v-list-item class="px-0 py-2 border-bottom-soft text-left">
            <v-list-item-title class="text-caption text-muted font-weight-bold uppercase">Note esercizio</v-list-item-title>
            <div class="mt-1 flex-grow-1">
              <v-textarea
                v-model="noteEsercizio"
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                rows="2"
                color="orange-darken-3"
                @blur="salvaDatoGenerale('ins_esercizio', noteEsercizio)"
                id="input-detail-note-esercizio"
              ></v-textarea>
            </div>
          </v-list-item>

          <!-- Commenti Atleta -->
          <v-list-item class="px-0 py-2 text-left">
            <v-list-item-title class="text-caption text-muted font-weight-bold uppercase">Commenti</v-list-item-title>
            <div class="mt-1 flex-grow-1">
              <v-textarea
                v-model="commentiAtleta"
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                rows="3"
                color="orange-darken-3"
                @blur="salvaDatoGenerale('des_commenti', commentiAtleta)"
                id="input-detail-commenti"
              ></v-textarea>
            </div>
          </v-list-item>
        </v-list>
      </v-card>

    </div>

    <!-- Snackbar di successo salvataggio -->
    <v-snackbar
      v-model="snackbarSalvataggio"
      color="success"
      timeout="2500"
      rounded="xl"
      elevation="4"
      id="detail-snackbar"
    >
      <div class="d-flex align-center justify-center font-weight-bold">
        <v-icon class="mr-2">mdi-check-circle</v-icon>
        Progressione salvata in tempo reale!
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { startGlobalTimer } from '../authStore.js';

const route = useRoute();
const router = useRouter();

const parseTimeToSeconds = (tStr) => {
  if (!tStr) return 90;
  const clean = tStr.toLowerCase().replace('rec', '').replace('⏱️', '').trim();
  if (clean.includes(':')) {
    const parts = clean.split(':');
    return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
  }
  if (clean.includes("'")) {
    const parts = clean.split("'");
    const mins = parseInt(parts[0], 10) || 0;
    const secs = parseInt(parts[1].replace('"', ''), 10) || 0;
    return mins * 60 + secs;
  }
  if (clean.includes('"')) {
    return parseInt(clean.replace('"', ''), 10) || 90;
  }
  return parseInt(clean.replace('s', ''), 10) || 90;
};

const avviaTimerRecupero = (recStr, label) => {
  const seconds = parseTimeToSeconds(recStr);
  startGlobalTimer(seconds, label);
};

// Parametri
const routeIdLocal = ref(route.params.id);

// Stato
const workout = ref(null);
const riga0 = ref(null);
const caricamento = ref(true);

const settimanaAttiva = ref(2);

// Campi Modificabili
const inputSettimane = ref({
  1: { ins: '', reps: '' },
  2: { ins: '', reps: '' },
  3: { ins: '', reps: '' },
  4: { ins: '', reps: '' },
  5: { ins: '', reps: '' },
  6: { ins: '', reps: '' }
});
const noteAttrezzo = ref('');
const noteEsercizio = ref('');
const commentiAtleta = ref('');

let savedMode = localStorage.getItem('modalitaSettimane');
if (savedMode === 'tutte') savedMode = 'fissa';
if (savedMode === 'attiva') savedMode = 'dinamica';
if (!savedMode) savedMode = 'dinamica';

const modalitaSettimane = ref(savedMode);
watch(modalitaSettimane, (nuovoValore) => {
  vibraTattile(8);
  localStorage.setItem('modalitaSettimane', nuovoValore);
});

const mostraAltreDinamica = ref(false);
const toggleAltreDinamiche = () => {
  vibraTattile(10);
  mostraAltreDinamica.value = !mostraAltreDinamica.value;
};

// Computed per definire l'ordine e la proposizione delle settimane
const settimaneVisualizzate = computed(() => {
  if (modalitaSettimane.value === 'dinamica') {
    if (mostraAltreDinamica.value) {
      // La settimana attiva deve rimanere sempre per prima.
      // Sotto di essa mostriamo le passate in ordine decrescente (es. 2, 1 per la week 3).
      // A seguire mostriamo le future in ordine crescente (es. 4, 5, 6 per la week 3).
      const pastWeeks = [];
      for (let w = settimanaAttiva.value - 1; w >= 1; w--) {
        pastWeeks.push(w);
      }
      const futureWeeks = [];
      for (let w = settimanaAttiva.value + 1; w <= 6; w++) {
        futureWeeks.push(w);
      }
      return [settimanaAttiva.value, ...pastWeeks, ...futureWeeks];
    } else {
      // Mostra solo la settimana attiva
      return [settimanaAttiva.value];
    }
  } else {
    // Visualizzazione fissa classica da 1 a 6
    return [1, 2, 3, 4, 5, 6];
  }
});

// Funzione per rimappare gli URL delle GIF dal dominio scaduto a GitHub Pages
const getGifUrl = (url) => {
  if (!url) return '';
  if (url.includes('definizionemuscolareestrema.com')) {
    let mapped = url.replace('definizionemuscolareestrema.com', 'visualgabri.github.io');
    const mappings = {
      'PectoralSternal_file': 'PettoBasso',
      'BackGeneral_file': 'DorsaliBack',
      'Obliques_file': 'Obliqui',
      'Ischiocrurali_file': 'Femorali',
      'PectoralClavicular_file': 'PettoAlto',
      'DeltoidPosterior_file': 'DeltoidiPosteriori',
      'Triceps_file': 'Tricipiti',
      'Quadriceps_file': 'Quadricipiti',
      'GluteusMaximus_file': 'Glutei',
      'DeltoidLateral_file': 'DeltoidiLaterali',
      'DeltoidAnterior_file': 'DeltoidiAnteriori',
      'LatissimusDorsi_file': 'DorsaliLat',
      'Biceps_file': 'Bicipiti'
    };
    for (const [expiredFolder, githubFolder] of Object.entries(mappings)) {
      if (mapped.includes(expiredFolder)) {
        mapped = mapped.replace(expiredFolder, githubFolder);
        break;
      }
    }
    return mapped;
  }
  return url;
};

// Snackbar
const snackbarSalvataggio = ref(false);

// Micro-vibrazione tattile per smartphone del 2026 (Haptic feedback)
const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// I campi ins sono puramente testuali ed i reps sono gestiti internamente al database, per cui non usiamo incrementatori o pulsanti.

// Carica riga 0 della sessione del giorno per ottenere il completamento delle settimane (cmp1-cmp6)
const caricaRiga0 = async (keyIdCliente, atletaId, numScheda, desGiorno) => {
  try {
    // Cerchiamo il documento della sessione (Riga 0)
    const q1 = query(
      collection(db, 'STORYBOARD'),
      where(keyIdCliente, '==', atletaId),
      where('num_scheda', '==', numScheda),
      where('des_giorno', '==', desGiorno)
    );
    const querySnapshot = await getDocs(q1);
    querySnapshot.forEach((doc) => {
      const d = doc.data();
      const numRiga = parseInt(d.num_riga_giorno);
      if (numRiga === 0) {
        riga0.value = { id: doc.id, ...d };
      }
    });
  } catch (error) {
    console.error("Errore caricamento riga 0 per completamento:", error);
  }
};

// Stato swipe ed elenco esercizi del giorno
const listaIdEsercizi = ref([]);
const indexCorrente = ref(-1);

watch(() => route.params.id, (nuovoId) => {
  if (nuovoId) {
    riga0.value = null;
    workout.value = null;
    routeIdLocal.value = nuovoId;
    caricaDatiEsercizio();
  }
});

const caricaListaEserciziGiorno = async (keyIdCliente, atletaId, numScheda, desGiorno) => {
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where(keyIdCliente, '==', atletaId),
      where('num_scheda', '==', numScheda),
      where('des_giorno', '==', desGiorno)
    );
    const snap = await getDocs(q);
    
    let temp = [];
    snap.forEach((doc) => {
      const d = doc.data();
      const riga = parseInt(d.num_riga_giorno) || 0;
      if (riga > 0) { // Saltiamo la riga 0
        temp.push({ id: doc.id, riga });
      }
    });
    
    // Ordiniamo per riga
    temp.sort((a, b) => a.riga - b.riga);
    
    listaIdEsercizi.value = temp.map(item => item.id);
    indexCorrente.value = listaIdEsercizi.value.indexOf(routeIdLocal.value);
  } catch (error) {
    console.error("Errore caricamento lista esercizi per swipe:", error);
  }
};

const vaiAdEsercizioSuccessivo = () => {
  if (listaIdEsercizi.value.length <= 1 || indexCorrente.value === -1) return;
  const nextIndex = (indexCorrente.value + 1) % listaIdEsercizi.value.length;
  const nextId = listaIdEsercizi.value[nextIndex];
  
  vibraTattile(15);
  router.replace({ name: 'DettaglioWorkout', params: { id: nextId } });
};

const vaiAdEsercizioPrecedente = () => {
  if (listaIdEsercizi.value.length <= 1 || indexCorrente.value === -1) return;
  let prevIndex = indexCorrente.value - 1;
  if (prevIndex < 0) {
    prevIndex = listaIdEsercizi.value.length - 1;
  }
  const prevId = listaIdEsercizi.value[prevIndex];
  
  vibraTattile(15);
  router.replace({ name: 'DettaglioWorkout', params: { id: prevId } });
};

// Gesture di swipe touch
let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  
  // Controllo se lo swipe è orizzontale e sufficientemente lungo (> 80px)
  if (Math.abs(diffX) > 80 && Math.abs(diffY) < 50) {
    if (diffX < 0) {
      // Swipe a sinistra -> Esercizio Successivo
      vaiAdEsercizioSuccessivo();
    } else {
      // Swipe a destra -> Esercizio Precedente
      vaiAdEsercizioPrecedente();
    }
  }
};

// Carica l'esercizio ed estrai i dati
const caricaDatiEsercizio = async () => {
  caricamento.value = true;
  try {
    const docRef = doc(db, 'STORYBOARD', routeIdLocal.value);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dati = docSnap.data();
      workout.value = dati;

      // Recupera la settimana attiva impostata nella Home per l'atleta specifico
      const keyIdCliente = Object.keys(dati).find(k => k.includes('ID_cliente')) || '\uFEFF"ID_cliente"';
      const atletaId = dati[keyIdCliente] || '';
      settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + atletaId)) || 2;

      // Inizializza gli input settimanali
      for (let w = 1; w <= 6; w++) {
        inputSettimane.value[w].ins = dati['ins_week' + w] || '';
        inputSettimane.value[w].reps = dati['reps_week' + w] || '';
      }
      
      noteAttrezzo.value = dati.des_note_attrezzo || '';
      noteEsercizio.value = dati.ins_esercizio || '';
      commentiAtleta.value = dati.des_commenti || '';

      // Carica il completamento del giorno (Riga 0) ed elenco per swipe
      if (atletaId && dati.num_scheda && dati.des_giorno) {
        await caricaRiga0(keyIdCliente, atletaId, dati.num_scheda, dati.des_giorno);
        await caricaListaEserciziGiorno(keyIdCliente, atletaId, dati.num_scheda, dati.des_giorno);
      }
    }
  } catch (error) {
    console.error("Errore caricamento dettagli esercizio:", error);
  } finally {
    caricamento.value = false;
  }
};

onMounted(() => {
  caricaDatiEsercizio();
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
});

// Parser delle stringhe di prescrizione speciali (es. 5x2(75%)|87,5KG|33,75L 77%)
const parsePrescription = (str) => {
  if (!str) return null;
  const cleanStr = str.trim();
  
  // Split by "|"
  const parts = cleanStr.split('|');
  if (parts.length === 3) {
    const part1 = parts[0].trim();
    const part2 = parts[1].trim();
    const part3 = parts[2].trim();
    
    // Parse Part 1: e.g. "5x2(75%)"
    const m1 = part1.match(/^([0-9xX\s]+)\s*\(([^)]+)\)$/);
    const repsInfo = m1 ? m1[1].trim() : part1;
    const maxInfo = m1 ? m1[2].trim() : '';
    
    // Parse Part 2: e.g. "87,5KG"
    const totalWeight = part2.replace(/KG/i, '').trim();
    
    // Parse Part 3: e.g. "33,75L 77%"
    const m3 = part3.match(/^([\d,.]+)\s*L\s+(.+)$/i);
    const sideWeight = m3 ? m3[1].trim() : part3.replace(/L/i, '').trim();
    const effortInfo = m3 ? m3[2].trim() : '';
    
    return {
      reps: repsInfo,
      max: maxInfo ? (maxInfo.includes('%') ? maxInfo : maxInfo + '%') : '',
      total: totalWeight,
      side: sideWeight,
      effort: effortInfo ? (effortInfo.includes('%') ? effortInfo : effortInfo + '%') : ''
    };
  }
  return null;
};

const parsedPrescription = (str) => {
  return parsePrescription(str);
};

const parsedRmt = (str) => {
  if (!str) return null;
  const match = str.trim().match(/(?:\(+)?\s*(\*+)\s*1RMT?:\s*([\d,.]+)\s*KG\s*~([\d,.]+)\s*(?:del|del\s+)?\s*([\d/]+)\s*(?:\)+)?/i);
  if (match) {
    return {
      stelle: match[1].length,
      massimale: match[2],
      prossimoLivello: match[3],
      data: match[4]
    };
  }
  return null;
};

const getRmtProgress = (rmt) => {
  if (!rmt || !rmt.massimale || !rmt.prossimoLivello) return 0;
  const current = parseFloat(rmt.massimale.replace(',', '.')) || 0;
  const targetDiff = parseFloat(rmt.prossimoLivello.replace(',', '.')) || 0;
  if (current + targetDiff === 0) return 0;
  return Math.round((current / (current + targetDiff)) * 100);
};

// Controlla se la settimana w è completata (cmp1-cmp6 da Riga 0)
const isWeekCompleted = (w) => {
  if (!riga0.value) return false;
  return riga0.value['cmp' + w] === 'true';
};

// Controlla se la settimana ha dati loggati
const isWeekLogged = (w) => {
  return inputSettimane.value[w].ins || inputSettimane.value[w].reps;
};

// Salva dato settimanale al blur
const salvaDatoSettimanale = async (settimana, tipo) => {
  if (!workout.value) return;

  const campo = `${tipo}_week${settimana}`;
  const valoreOriginale = workout.value[campo] || '';
  const valoreNuovo = inputSettimane.value[settimana][tipo];

  if (valoreOriginale !== valoreNuovo) {
    try {
      vibraTattile(20); // Vibrazione forte di successo salvataggio
      const docRef = doc(db, 'STORYBOARD', routeIdLocal.value);
      const payload = {
        [campo]: valoreNuovo,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      await updateDoc(docRef, payload);
      workout.value[campo] = valoreNuovo;
      snackbarSalvataggio.value = true;
    } catch (error) {
      console.error("Errore salvataggio automatico settimanale:", error);
    }
  }
};

// Salva campo generale
const salvaDatoGenerale = async (campo, valore) => {
  if (!workout.value) return;

  const valoreOriginale = workout.value[campo] || '';

  if (valoreOriginale !== valore) {
    try {
      vibraTattile(20);
      const docRef = doc(db, 'STORYBOARD', routeIdLocal.value);
      const payload = {
        [campo]: valore,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };

      await updateDoc(docRef, payload);
      workout.value[campo] = valore;
      snackbarSalvataggio.value = true;
    } catch (error) {
      console.error("Errore salvataggio automatico generale:", error);
    }
  }
};

// Torna indietro
const tornaIndietro = () => {
  vibraTattile(8);
  router.back();
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

.appsheet-top-bar {
  border-bottom: 2px solid #ef6c00;
  padding-bottom: 8px;
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

.bg-slate-50 {
  background-color: transparent !important;
}

.bg-slate-100 {
  background-color: rgba(30, 41, 59, 0.4) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.premium-card {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Grande frame della GIF dell'esercizio */
.image-premium-frame {
  border: 4px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5) !important;
}

/* Cartellino note del Coach (stile AppSheet originale) */
.coaching-note-card {
  background-color: rgba(254, 240, 138, 0.06) !important;
  border-left: 6px solid #facc15 !important;
  border: 1px solid rgba(250, 204, 21, 0.1) !important;
}

/* Stili Week log list */
.week-log-card {
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.week-active-border {
  border: 2px solid #f97316 !important;
  background-color: rgba(249, 115, 22, 0.03) !important;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.15) !important;
}

.week-prescription-text {
  border-left: 3px solid #ffb74d;
  color: #fb923c !important;
  background-color: rgba(30, 41, 59, 0.3) !important;
}

.card-glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
}

.leading-tight {
  line-height: 1.25;
}

.leading-relaxed {
  line-height: 1.625;
}

/* Stile speciale per le settimane secondarie in visualizzazione Dinamica */
.week-secondary-card {
  opacity: 0.55;
  background: rgba(15, 23, 42, 0.2) !important;
  border: 1px dashed rgba(255, 255, 255, 0.08) !important;
  transform: scale(0.975);
  box-shadow: none !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.week-secondary-card:focus-within,
.week-secondary-card:hover {
  opacity: 0.95;
  transform: scale(1);
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}

/* Stili per la prescrizione formattata */
.prescription-chip-box {
  background: rgba(30, 41, 59, 0.45) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.prescription-chip-box:hover {
  background: rgba(30, 41, 59, 0.6) !important;
  border-color: rgba(249, 115, 22, 0.25);
}

.text-super-caption {
  font-size: 0.65rem !important;
  letter-spacing: 0.05em;
}

.border-orange-darken-3-op {
  border: 1px solid rgba(249, 115, 22, 0.15) !important;
}

.border-right-soft {
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.clickable-timer-chip {
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}
.clickable-timer-chip:hover {
  background: rgba(249, 115, 22, 0.2) !important;
  transform: translateY(-1px) scale(1.02);
}
</style>
