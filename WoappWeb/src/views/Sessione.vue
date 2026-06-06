<template>
  <v-container class="px-3 py-4 max-width-container min-height-screen pb-12">
    <!-- Barra Superiore con pulsante indietro -->
    <div class="d-flex align-center justify-space-between mb-4 appsheet-top-bar pb-2">
      <v-btn icon color="orange-darken-3" variant="text" @click="tornaIndietro" id="btn-sessione-indietro" size="small">
        <v-icon size="26">mdi-arrow-left</v-icon>
      </v-btn>
      <h3 class="text-subtitle-2 font-weight-black text-slate-dark text-truncate">
        Dettaglio Sessione
      </h3>
      <v-btn icon color="slate-dark" variant="text" @click="caricaDati" size="small"><v-icon size="18">mdi-refresh</v-icon></v-btn>
    </div>

    <!-- Stato di caricamento -->
    <div v-if="caricamento" class="text-center my-12">
      <v-progress-circular indeterminate color="orange" size="36"></v-progress-circular>
      <p class="mt-2 text-caption text-muted">Caricamento sessione...</p>
    </div>

    <!-- Errore o non trovato -->
    <div v-else-if="!workout" class="text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="50" color="red-lighten-2" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h3 class="text-caption font-weight-bold text-slate-dark">Sessione non trovata</h3>
    </div>

    <!-- Contenuto Principale (Spazioso, Intuitivo, Flusso Lineare) -->
    <div v-else class="session-detail-area">
      <!-- Avviso Esercizi Mancanti (Buco nell'ordine numerico) -->
      <v-card
        v-if="eserciziMancantiSessione.length > 0"
        class="py-3 px-4 mb-4 text-left border animate-pulse"
        style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04)) !important; border: 1.5px solid rgba(239, 68, 68, 0.4) !important; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15) !important; border-radius: 12px !important;"
      >
        <div class="d-flex align-center">
          <v-icon color="red-lighten-1" class="mr-3 flex-shrink-0" size="24">mdi-alert-circle</v-icon>
          <div class="flex-grow-1">
            <h4 class="text-subtitle-2 font-weight-black text-red-lighten-2 mb-0.5" style="font-size: 0.82rem !important;">
              Attenzione: Esercizi Mancanti!
            </h4>
            <p class="text-slate font-weight-medium mb-0" style="font-size: 0.72rem; line-height: 1.35; color: #e2e8f0 !important;">
              C'è un buco nell'ordine degli esercizi per il <strong>Giorno {{ workout.des_giorno }}</strong>.
              Manca{{ eserciziMancantiSessione.length === 1 ? ' l\'esercizio alla posizione' : 'no gli esercizi alle posizioni' }}:
              <span class="text-red-lighten-2 font-weight-black">{{ eserciziMancantiSessione.join(', ') }}</span>.
              Verifica l'importazione.
            </p>
          </div>
        </div>
      </v-card>

      <!-- 1. Header Compatto: Mini GIF e Titoli Uniti su una riga -->
      <v-card class="compact-header-card rounded-2xl pa-3 mb-4 card-glass border d-flex align-center" elevation="2">
        <div class="thumbnail-frame mr-3 rounded-xl overflow-hidden bg-black flex-shrink-0" style="width: 52px; height: 52px; border: 1px solid rgba(255,255,255,0.08);">
          <v-img
            :src="getGifUrl(workout.UrlNormal) || '/logo.png'"
            cover
            height="100%"
            width="100%"
          >
            <template v-slot:placeholder>
              <div class="fill-height d-flex align-center justify-center bg-slate-800">
                <v-icon color="grey" size="16">mdi-dumbbell</v-icon>
              </div>
            </template>
          </v-img>
        </div>
        
        <div class="text-left min-width-0 flex-grow-1">
          <div class="d-flex align-center justify-space-between">
            <h2 v-if="parseDayHeader(workout.des_esercizio)" class="text-subtitle-2 font-weight-black text-orange-darken-3 leading-none truncate">
              Giorno {{ parseDayHeader(workout.des_esercizio).giorno }} • Allenamento
            </h2>
            <h2 v-else class="text-subtitle-2 font-weight-black text-slate-dark leading-none truncate">
              {{ workout.des_esercizio }}
            </h2>
            <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase ml-2 flex-shrink-0" style="font-size: 0.58rem;">
              🔥 {{ parseDayHeader(workout.des_esercizio)?.calorie || 350 }} kcal
            </span>
          </div>
          
          <div class="d-flex align-center mt-1.5 text-super-caption text-muted font-weight-medium compact-header-metrics flex-wrap gap-x-2">
            <span>⏱️ Target: {{ parseDayHeader(workout.des_esercizio)?.tempoMedia || '60 min' }}</span>
            <span class="text-muted">•</span>
            <span>⚡ Densità: {{ parseDayHeader(workout.des_esercizio)?.densitaMedia || '60' }}%</span>
            <span class="text-muted">•</span>
            <span>🏋️ Vol: {{ parseVolumes(workout.ins_esercizio)?.totale || '20' }} serie</span>
          </div>
        </div>
      </v-card>

      <!-- RMT Massimale Gamified se presente (Compatto) -->
      <div v-if="parsedRmt(workout.des_esercizio_2)" class="rmt-compact-card pa-2.5 rounded-2xl card-glass border-orange-darken-3-op mb-4 text-left">
        <div class="d-flex align-center justify-space-between mb-1">
          <div class="d-flex align-center flex-wrap gap-1">
            <span class="text-super-caption text-muted font-weight-black uppercase mr-1.5" style="font-size: 0.58rem;">Livello Forza:</span>
            <div class="d-flex align-center gap-0.5 mr-1.5">
              <v-icon v-for="i in parsedRmt(workout.des_esercizio_2).stelle" :key="i" color="amber-darken-2" size="12">mdi-star</v-icon>
            </div>
            <v-chip
              :color="parsedRmt(workout.des_esercizio_2).livelloColore"
              size="x-small"
              class="font-weight-black uppercase text-super-caption px-1.5 py-0.5 elevation-1 animate-pulse"
              variant="flat"
              style="font-size: 0.55rem !important; height: 16px; line-height: 1; letter-spacing: 0.03em;"
            >
              {{ parsedRmt(workout.des_esercizio_2).livelloTesto }}
            </v-chip>
          </div>
          <div class="d-flex align-center gap-2">
            <span v-if="parsedRmt(workout.des_esercizio_2).variazione" class="text-super-caption font-weight-black px-1.5 py-0.5 rounded-lg d-flex align-center" :style="{ backgroundColor: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? '#f87171' : '#34d399', fontSize: '0.62rem', border: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)' }">
              {{ parsedRmt(workout.des_esercizio_2).variazione }}
            </span>
            <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.58rem;">
              1RMT: <span class="text-slate-dark font-weight-black" style="font-size: 0.72rem;">{{ parsedRmt(workout.des_esercizio_2).massimale }}</span> kg
            </span>
          </div>
        </div>
        <v-progress-linear
          :model-value="getRmtProgress(parsedRmt(workout.des_esercizio_2))"
          color="amber-darken-2"
          height="3"
          rounded
          class="elevation-1"
        ></v-progress-linear>
      </div>
      
      <!-- Resoconto Volumi Alternativo se presente nel des_esercizio_2 -->
      <div v-else-if="isVolumeString(workout.des_esercizio_2)" class="pa-3 rounded-2xl card-glass border-soft mb-4 text-left">
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.58rem; letter-spacing: 0.05em;">
            📊 Distribuzione Volumi Giornalieri
          </span>
        </div>
        <div class="d-flex align-center flex-wrap gap-1.5">
          <span class="vol-pill vol-pill-total" title="Volume Globale (V)">
            <span class="mr-1">📊</span>
            <span class="vol-label">Vol</span>
            <span class="vol-val">{{ parseVolumeString(workout.des_esercizio_2).v }}</span>
          </span>
          <span class="vol-pill vol-pill-upper" title="Parte Alta / Upper Body (A)">
            <span class="mr-1">💪</span>
            <span class="vol-label">Alta</span>
            <span class="vol-val">{{ parseVolumeString(workout.des_esercizio_2).a }}</span>
          </span>
          <span class="vol-pill vol-pill-lower" title="Parte Bassa / Lower Body (B)">
            <span class="mr-1">🦵</span>
            <span class="vol-label">Bassa</span>
            <span class="vol-val">{{ parseVolumeString(workout.des_esercizio_2).b }}</span>
          </span>
          <span v-if="parseFloat(parseVolumeString(workout.des_esercizio_2).c.replace(',', '.')) > 0" class="vol-pill vol-pill-core" title="Core / Centro (C)">
            <span class="mr-1">🎯</span>
            <span class="vol-label">Core</span>
            <span class="vol-val">{{ parseVolumeString(workout.des_esercizio_2).c }}</span>
          </span>
        </div>
      </div>

      <!-- 2. Progressioni delle 6 Settimane in Card Espandibili -->
      <div class="week-selector-section mb-6 text-left">
        <div class="text-super-caption text-muted font-weight-black uppercase tracking-wider mb-3" style="font-size: 0.62rem; letter-spacing: 0.05em;">
          Registro delle Settimane (Seleziona una scheda per visualizzare/modificare)
        </div>
        
        <v-card
          v-for="sett in [1, 2, 3, 4, 5, 6]"
          :key="sett"
          class="mb-4 rounded-2xl border week-expandable-card transition-all"
          :class="{
            'card-expanded': selectedWeek === sett,
            'card-completed-border': isWeekCompleted(sett) && selectedWeek !== sett,
            'card-active-border': sett === activeUncompletedWeek && !isWeekCompleted(sett) && selectedWeek !== sett
          }"
          elevation="2"
        >
          <!-- Card Header (Sempre visibile, cliccabile) -->
          <div
            class="pa-3 py-3.5 cursor-pointer d-flex align-center justify-space-between select-none"
            @click="selectedWeek = (selectedWeek === sett ? null : sett)"
          >
            <div class="d-flex align-center min-width-0 flex-grow-1">
              <v-icon
                :color="isWeekCompleted(sett) ? 'green-accent-4' : (sett === activeUncompletedWeek ? 'orange-darken-3' : 'grey-lighten-1')"
                class="mr-3 flex-shrink-0"
                size="20"
              >
                {{ isWeekCompleted(sett) ? 'mdi-check-circle' : (sett === activeUncompletedWeek ? 'mdi-play-circle-outline' : 'mdi-circle-outline') }}
              </v-icon>
              
              <div class="text-left min-width-0 flex-grow-1">
                <div class="d-flex align-center flex-wrap gap-1.5">
                  <span class="font-weight-black text-subtitle-1 text-slate-dark" style="line-height: 1;">
                    Settimana {{ sett }}{{ sett === 6 ? ' (Ultima settimana!)' : '' }}
                  </span>
                  
                  <!-- Badges di Stato -->
                  <v-chip
                    :color="isWeekCompleted(sett) ? 'green-accent-4' : (sett === activeUncompletedWeek ? 'orange-darken-3' : 'grey-darken-2')"
                    size="x-small"
                    class="font-weight-black text-white px-2 flex-shrink-0"
                    variant="flat"
                    style="font-size: 0.55rem; height: 16px;"
                  >
                    {{ isWeekCompleted(sett) ? 'COMPLETATA' : (sett === activeUncompletedWeek ? 'ATTIVA' : 'DA FARE') }}
                  </v-chip>
                </div>
                
                <!-- Riga di Sommario sotto (visibile solo se la card è chiusa) -->
                <v-expand-transition>
                  <div
                    v-if="selectedWeek !== sett && getWeekSummaryLine(sett)"
                    class="text-super-caption text-muted font-weight-bold mt-1 text-truncate"
                    style="font-size: 0.62rem; max-width: 100%;"
                  >
                    {{ getWeekSummaryLine(sett) }}
                  </div>
                </v-expand-transition>
              </div>
            </div>
            
            <div class="d-flex align-center flex-shrink-0 ml-3">
              <!-- Switch di completamento rapido sempre accessibile dal header senza espandere! -->
              <v-switch
                :model-value="isWeekCompleted(sett)"
                @update:model-value="(val) => setWeekCompleted(sett, val)"
                color="green-accent-4"
                hide-details
                density="compact"
                class="scale-switch mr-2"
                @click.stop
              ></v-switch>
              
              <v-icon color="grey" size="18" class="flex-shrink-0">
                {{ selectedWeek === sett ? 'mdi-chevron-up' : 'mdi-chevron-down' }}
              </v-icon>
            </div>
          </div>

          <!-- Card Body (Visibile solo se espansa) -->
          <v-expand-transition>
            <div v-show="selectedWeek === sett" class="pa-4 border-top-soft bg-slate-900-op">
              
              <!-- STEP 1: REGISTRAZIONE ORE -->
              <div class="step-container mb-5">
                <div class="d-flex align-center justify-space-between mb-2.5">
                  <span class="text-caption text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">
                    1. Registro Ore Sessione
                  </span>
                  <span class="text-super-caption text-green-lighten-2 font-weight-bold d-flex align-center" style="font-size: 0.58rem;">
                    <v-icon size="11" color="green" class="mr-1">mdi-cloud-check</v-icon>
                    Auto-save attivo
                  </span>
                </div>
                
                <v-row dense class="mb-3 gap-2">
                  <!-- Record Start -->
                  <v-col cols="6" class="flex-grow-1">
                    <div class="d-flex flex-column text-center">
                      <v-btn
                        :color="inputStart ? 'green-darken-3' : 'orange-darken-3'"
                        variant="tonal"
                        rounded="lg"
                        class="font-weight-black text-none py-2 btn-quick-log"
                        @click="registraInizioOra(sett)"
                        height="44"
                      >
                        <v-icon size="16" class="mr-1">mdi-play-circle-outline</v-icon>
                        Inizio Wo
                      </v-btn>
                      <span class="text-super-caption font-weight-bold d-block mt-2 text-truncate px-1" :class="inputStart ? 'text-green-lighten-2' : 'text-muted'" style="font-size: 0.62rem;">
                        {{ inputStart ? formattaOraLeggibile(inputStart) : 'Non registrato' }}
                      </span>
                    </div>
                  </v-col>
                  
                  <!-- Record End -->
                  <v-col cols="6" class="flex-grow-1">
                    <div class="d-flex flex-column text-center">
                      <v-btn
                        :color="inputEnd ? 'green-darken-3' : 'orange-darken-3'"
                        variant="tonal"
                        rounded="lg"
                        class="font-weight-black text-none py-2 btn-quick-log"
                        @click="registraFineOra(sett)"
                        height="44"
                        :disabled="!inputStart"
                      >
                        <v-icon size="16" class="mr-1">mdi-stop-circle-outline</v-icon>
                        Fine Wo
                      </v-btn>
                      <span class="text-super-caption font-weight-bold d-block mt-2 text-truncate px-1" :class="inputEnd ? 'text-green-lighten-2' : 'text-muted'" style="font-size: 0.62rem;">
                        {{ inputEnd ? formattaOraLeggibile(inputEnd) : 'Non registrato' }}
                      </span>
                    </div>
                  </v-col>
                </v-row>

                <!-- Durata stimata -->
                <div class="text-caption font-weight-bold text-slate d-flex align-center mt-2 pl-1">
                  <v-icon size="14" color="grey" class="mr-1.5">mdi-timer-sand</v-icon>
                  Durata Calcolata: <span class="text-orange-lighten-2 ml-1 font-weight-black">{{ calcolaDurata(inputStart, inputEnd) }}</span>
                </div>
              </div>

              <!-- STEP 2: NOTE E COMMENTI -->
              <div class="step-container mb-5">
                <div class="text-caption text-orange-lighten-2 font-weight-black uppercase mb-2" style="font-size: 0.65rem; letter-spacing: 0.05em;">
                  2. Note & Commenti
                </div>
                <v-textarea
                  v-model="inputNote"
                  label="Note sull'allenamento..."
                  variant="outlined"
                  density="comfortable"
                  rounded="lg"
                  rows="1"
                  auto-grow
                  color="orange-darken-3"
                  prepend-inner-icon="mdi-pencil-outline"
                  class="notes-field-spacious"
                  @blur="salvaDato('ins_week' + sett, inputNote)"
                  hide-details
                ></v-textarea>
              </div>

              <!-- Manual Adjustments -->
              <div class="mt-4">
                <div
                  class="d-flex align-center justify-space-between cursor-pointer py-2 px-3 rounded-lg manual-toggle bg-slate-900 border-soft"
                  @click="mostraManuale = !mostraManuale"
                >
                  <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.58rem;">
                    {{ mostraManuale ? '✓ Nascondi Ora Manuale' : '⚙️ Regola Data/Ora Manualmente' }}
                  </span>
                  <v-icon size="12" color="grey">{{ mostraManuale ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                </div>
                
                <v-expand-transition>
                  <div v-show="mostraManuale" class="mt-3 pt-3 border-top-soft">
                    <v-row dense>
                      <v-col cols="6">
                        <v-text-field
                          v-model="inputStart"
                          type="datetime-local"
                          label="Data/Ora Inizio"
                          variant="outlined"
                          density="compact"
                          rounded="lg"
                          color="orange-darken-3"
                          @change="salvaDato(getStartField(sett), inputStart)"
                          hide-details
                          style="font-size: 0.8rem;"
                        ></v-text-field>
                      </v-col>
                      <v-col cols="6">
                        <v-text-field
                          v-model="inputEnd"
                          type="datetime-local"
                          label="Data/Ora Fine"
                          variant="outlined"
                          density="compact"
                          rounded="lg"
                          color="orange-darken-3"
                          @change="salvaDato(getEndField(sett), inputEnd)"
                          hide-details
                          style="font-size: 0.8rem;"
                        ></v-text-field>
                      </v-col>
                    </v-row>
                  </div>
                </v-expand-transition>
              </div>

            </div>
          </v-expand-transition>
        </v-card>
      </div>

      <!-- 4. Resoconto Durate & Coerenza (Spazioso ed elegante) -->
      <v-card class="premium-card rounded-2xl pa-4 text-left" elevation="2">
        <v-row dense class="align-center">
          <!-- Circular progress ring -->
          <v-col cols="3" class="text-center d-flex flex-column align-center justify-center">
            <v-progress-circular
              :model-value="percentualeCompletamento"
              color="orange-darken-2"
              size="56"
              width="6.5"
              class="ring-glow-orange"
            >
              <span class="text-caption font-weight-black text-slate-dark" style="font-size: 0.68rem;">
                {{ settimaneCompletateCount }}/6
              </span>
            </v-progress-circular>
          </v-col>
          
          <!-- Statistics description -->
          <v-col cols="9" class="pl-4 border-left-soft text-left">
            <div class="d-flex align-center justify-space-between mb-1.5">
              <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.6rem; letter-spacing: 0.05em;">Coerenza Periodizzazione</span>
              <span class="text-super-caption text-orange-lighten-2 font-weight-black" style="font-size: 0.6rem;">{{ percentualeCompletamento }}%</span>
            </div>
            <div class="d-flex align-center justify-space-between text-body-2 font-weight-bold text-slate-dark">
              <span>Durata Media:</span>
              <span class="text-orange-lighten-2 font-weight-black">⏱️ {{ getMediaFormatted() }}</span>
            </div>
          </v-col>
        </v-row>
      </v-card>

    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" color="success" timeout="2000" rounded="xl">
      Sincronizzazione completata!
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { selectedAthlete } from '../authStore.js';

const route = useRoute();
const router = useRouter();
const routeId = route.params.id;

// Helper per applicare le modifiche salvate offline nel localStorage
const applicaModificheLocali = (item) => {
  if (!item) return item;
  const key1 = `offline_storyboard_${item.id}`;
  const key2 = `offline_storyboard_${item.num_riga}`;
  const localData1 = localStorage.getItem(key1);
  const localData2 = localStorage.getItem(key2);
  
  let updates = {};
  let localTimestamp = null;
  
  if (localData1) {
    try {
      const parsed = JSON.parse(localData1);
      if (parsed.timestamp) localTimestamp = parsed.timestamp;
      updates = { ...updates, ...parsed };
    } catch (e) {}
  }
  if (localData2) {
    try {
      const parsed = JSON.parse(localData2);
      if (parsed.timestamp && (!localTimestamp || parsed.timestamp > localTimestamp)) {
        localTimestamp = parsed.timestamp;
      }
      updates = { ...updates, ...parsed };
    } catch (e) {}
  }
  
  // Applica solo se la modifica locale è più recente rispetto a quella su Firestore
  if (localTimestamp && item.timestamp) {
    if (localTimestamp <= item.timestamp) {
      // Rimuovi modifiche locali obsolete per evitare inquinamento della cache
      localStorage.removeItem(key1);
      localStorage.removeItem(key2);
      return item;
    }
  }
  
  return { ...item, ...updates };
};

// Helper per salvare una modifica offline nel localStorage
const salvaModificaLocale = (campo, valore) => {
  const key1 = `offline_storyboard_${routeId}`;
  let updates = {};
  const localData1 = localStorage.getItem(key1);
  if (localData1) {
    try { updates = JSON.parse(localData1); } catch (e) {}
  }
  updates[campo] = valore;
  updates['timestamp'] = new Date().toISOString().replace('T', ' ').substring(0, 19);
  localStorage.setItem(key1, JSON.stringify(updates));
};

// Stato
const workout = ref(null);
const caricamento = ref(true);
const snackbar = ref(false);
const mostraManuale = ref(false);
const selectedWeek = ref(1);

// Aggiunti i ref mancanti
const allExercises = ref([]);
const filmatiList = ref([]);
const countFilmati = ref(0);
const testList = ref([]);
const countTest = ref(0);

// Inputs per la settimana selezionata
const inputNote = ref('');
const inputStart = ref('');
const inputEnd = ref('');

// Micro-vibrazione tattile
const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Rimappatore GIF a GitHub Pages con cartelle corrette
const getGifUrl = (url) => {
  if (!url) return '';
  
  let mapped = url;
  if (url.includes('definizionemuscolareestrema.com')) {
    mapped = url.replace('definizionemuscolareestrema.com', 'visualgabri.github.io');
  }
  
  if (mapped.includes('visualgabri.github.io')) {
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
      'LatissimusDorsi_file': 'DorsaliLat',
      'HipAbductor_file': 'GluteiMed',
      'DeltoidAnterior_file': 'DeltoidiAnteriori',
      'Biceps_file': 'Bicipiti',
      'Soleus_file': 'Soleo',
      'HipAdductors_file': 'Adduttori',
      'RectusAbdomis_file': 'Addome',
      'Brachioradialis_file': 'Brachioradiali',
      'Gastrocnemius_file': 'Gastrocnemio',
      'Brachialis_file': 'Brachiali',
      'HipFlexors_file': 'FlessoriAnca',
      'ErectorSpinae_file': 'ErettoriSpinali',
      'Intrarotatori_file': 'Intrarotatori',
      'Cardio_file': 'Cardio',
      'Mobility_file': 'Mobilita',
      'Infraspinatus_file': 'Sovraspinato',
      'TrapeziusUpper_file': 'Trapezio'
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

// Carica i dati del documento Riga 0
const caricaDati = async () => {
  caricamento.value = true;
  try {
    const docRef = doc(db, 'STORYBOARD', routeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const dati = docSnap.data();
      workout.value = applicaModificheLocali({ id: docSnap.id, ...dati });
      
      // Carica tutti gli esercizi dello stesso atleta, scheda e giorno
      const keyIdCliente = Object.keys(dati).find(k => k.includes('ID_cliente')) || 'ID_cliente';
      const atletaId = dati[keyIdCliente] || '';
      if (atletaId && dati.num_scheda && dati.des_giorno) {
         try {
           const q = query(
             collection(db, 'STORYBOARD'),
             where(keyIdCliente, '==', atletaId),
             where('num_scheda', '==', dati.num_scheda),
             where('des_giorno', '==', dati.des_giorno)
           );
           const snap = await getDocs(q);
           let temp = [];
           snap.forEach((d) => {
             temp.push(applicaModificheLocali({ id: d.id, ...d.data() }));
           });
           allExercises.value = temp;
         } catch (e) {
           console.error("Errore fetch esercizi del giorno in Sessione:", e);
         }
      }

      // Se UrlNormal è vuoto o non valido, proviamo a ripristinarlo dal backup JSON locale
      if (!workout.value.UrlNormal || !workout.value.UrlNormal.startsWith('http')) {
        try {
          const res = await fetch('/storyboard_backup.json');
          const allData = await res.json();
          const matched = allData.find(b => 
            String(b.ID_cliente) === String(workout.value.ID_cliente) &&
            String(b.num_scheda) === String(workout.value.num_scheda) &&
            String(b.des_giorno).trim() === String(workout.value.des_giorno).trim() &&
            parseInt(b.num_riga_giorno) === parseInt(workout.value.num_riga_giorno)
          );
          if (matched && matched.UrlNormal && matched.UrlNormal.startsWith('http')) {
            workout.value.UrlNormal = matched.UrlNormal;
          }
        } catch (errBackup) {
          console.warn("Impossibile applicare patch UrlNormal da backup in Sessione:", errBackup);
        }
      }
      
      // Default sulla prima settimana incompleta all'avvio
      selectedWeek.value = activeUncompletedWeek.value;
    } else {
      console.warn("Documento sessione non trovato su Firestore, provo da backup locale.");
      await caricaDatiDaBackup();
    }
  } catch (error) {
    console.warn("Errore caricamento sessione da Firestore (quota esaurita), provo da backup locale:", error);
    await caricaDatiDaBackup();
  } finally {
    caricamento.value = false;
  }
};

const caricaDatiDaBackup = async () => {
  try {
    const res = await fetch('/storyboard_backup.json');
    const allData = await res.json();
    const found = allData.find(item => String(item.id) === String(routeId) || String(item.num_riga) === String(routeId));
    if (found) {
      workout.value = applicaModificheLocali(found);
      
      // Carica tutti gli esercizi dello stesso atleta e scheda dal backup per l'auto-rilevamento
      const rawExercises = allData.filter(
        item => String(item.ID_cliente) === String(workout.value.ID_cliente) && 
                String(item.num_scheda) === String(workout.value.num_scheda)
      );
      const tempExercises = rawExercises.map(applicaModificheLocali);
      
      let tempFilmati = [];
      let tempTest = [];
      tempExercises.forEach(data => {
        if (data.flg_video === 'true') {
          tempFilmati.push(data);
        }
        const qta = (data.des_qta_report || '').toLowerCase();
        if (qta.includes('amrap') || qta.includes('test') || qta.includes('ramp')) {
          tempTest.push(data);
        }
      });
      
      allExercises.value = tempExercises;
      filmatiList.value = tempFilmati;
      countFilmati.value = tempFilmati.length;
      testList.value = tempTest;
      countTest.value = tempTest.length;

      selectedWeek.value = activeUncompletedWeek.value;
    }
  } catch (errBackup) {
    console.error("Errore nel caricamento del backup locale in Sessione:", errBackup);
  }
};

// Aggiorna gli input quando cambia la settimana selezionata o cambiano i dati della scheda
watch([selectedWeek, workout], () => {
  if (workout.value) {
    const w = selectedWeek.value;
    inputNote.value = workout.value['ins_week' + w] || '';
    inputStart.value = workout.value[getStartField(w)] || '';
    inputEnd.value = workout.value[getEndField(w)] || '';
  }
}, { immediate: true, deep: true });

onMounted(() => {
  caricaDati();
});

// Helper per identificare la prima settimana non completata
const activeUncompletedWeek = computed(() => {
  if (!workout.value) return 1;
  for (let w = 1; w <= 6; w++) {
    const valCmp = workout.value['cmp' + w];
    if (valCmp !== 'true' && valCmp !== true && String(valCmp).toLowerCase() !== 'true') {
      return w;
    }
  }
  return 6;
});

// Ottieni gli esercizi del giorno corrente
const eserciziDelGiorno = computed(() => {
  if (!workout.value || !allExercises.value || allExercises.value.length === 0) return [];
  const giorno = (workout.value.des_giorno || '').trim();
  return allExercises.value.filter(
    item => (item.des_giorno || '').trim() === giorno && parseInt(item.num_riga_giorno) > 0
  );
});

const eserciziMancantiSessione = computed(() => {
  if (!workout.value || !eserciziDelGiorno.value || eserciziDelGiorno.value.length === 0) return [];
  const indiciPresenti = eserciziDelGiorno.value
    .map(item => parseInt(item.num_riga_giorno))
    .filter(n => !isNaN(n) && n > 0);
  if (indiciPresenti.length === 0) return [];
  const maxIndice = Math.max(...indiciPresenti);
  const buchi = [];
  for (let i = 1; i < maxIndice; i++) {
    if (!indiciPresenti.includes(i)) {
      buchi.push(i);
    }
  }
  return buchi;
});

// Verifica se tutti gli esercizi del giorno sono compilati per la settimana selezionata
const tuttiEserciziCompilatiGiorno = computed(() => {
  if (eserciziDelGiorno.value.length === 0) return false;
  const w = selectedWeek.value;
  return eserciziDelGiorno.value.every(ex => {
    const val = ex['ins_week' + w];
    return val && String(val).trim() !== '';
  });
});

// Mostra il promemoria "Settimana da chiudere" nella sessione di allenamento
const mostraPromemoriaChiusura = computed(() => {
  if (!workout.value) return false;
  const w = selectedWeek.value;
  const isChiusa = isWeekCompleted(w);
  return !isChiusa && tuttiEserciziCompilatiGiorno.value;
});

// Controlla se la settimana w è completata
const isWeekCompleted = (w) => {
  if (!workout.value) return false;
  const valCmp = workout.value['cmp' + w];
  return valCmp === 'true' || valCmp === true || String(valCmp).toLowerCase() === 'true';
};

// Conteggio settimane completate
const settimaneCompletateCount = computed(() => {
  let count = 0;
  for (let w = 1; w <= 6; w++) {
    if (isWeekCompleted(w)) count++;
  }
  return count;
});

// Percentuale di completamento
const percentualeCompletamento = computed(() => {
  return Math.round((settimaneCompletateCount.value / 6) * 100);
});

// Funzione per ottenere la data e ora locale formattata per datetime-local
const getLocalDatetimeString = () => {
  const tzoffset = (new Date()).getTimezoneOffset() * 60000;
  const localISOTime = (new Date(Date.now() - tzoffset)).toISOString().slice(0, 16);
  return localISOTime;
};

// Registrazione ora immediata
const registraInizioOra = (w) => {
  const localNow = getLocalDatetimeString();
  inputStart.value = localNow;
  salvaDato(getStartField(w), localNow);
};

const registraFineOra = (w) => {
  const localNow = getLocalDatetimeString();
  inputEnd.value = localNow;
  salvaDato(getEndField(w), localNow);
};

// Formattazione data leggibile sotto i bottoni (DD/MM alle HH:MM)
const formattaOraLeggibile = (datetimeStr) => {
  if (!datetimeStr) return '';
  const dateObj = parseCustomDate(datetimeStr);
  if (!dateObj) return datetimeStr;
  
  const gg = String(dateObj.getDate()).padStart(2, '0');
  const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
  const hh = String(dateObj.getHours()).padStart(2, '0');
  const min = String(dateObj.getMinutes()).padStart(2, '0');
  
  return `${gg}/${mm} alle ${hh}:${min}`;
};

// Genera una riga riassuntiva di durata e note per la card chiusa
const getWeekSummaryLine = (w) => {
  if (!workout.value) return '';
  const start = workout.value[getStartField(w)];
  const end = workout.value[getEndField(w)];
  const note = workout.value['ins_week' + w];
  
  let parts = [];
  if (start) {
    const dtStart = parseCustomDate(start);
    const dtEnd = end ? parseCustomDate(end) : null;
    
    if (dtStart) {
      const gg = String(dtStart.getDate()).padStart(2, '0');
      const mm = String(dtStart.getMonth() + 1).padStart(2, '0');
      const hhStart = String(dtStart.getHours()).padStart(2, '0');
      const minStart = String(dtStart.getMinutes()).padStart(2, '0');
      
      let timeRange = '';
      if (dtEnd) {
        const hhEnd = String(dtEnd.getHours()).padStart(2, '0');
        const minEnd = String(dtEnd.getMinutes()).padStart(2, '0');
        
        // Se è lo stesso giorno
        if (dtStart.getDate() === dtEnd.getDate() && dtStart.getMonth() === dtEnd.getMonth()) {
          timeRange = `${gg}/${mm} ore ${hhStart}:${minStart}-${hhEnd}:${minEnd}`;
        } else {
          timeRange = `${gg}/${mm} ${hhStart}:${minStart} - ${String(dtEnd.getDate()).padStart(2, '0')}/${String(dtEnd.getMonth() + 1).padStart(2, '0')} ${hhEnd}:${minEnd}`;
        }
      } else {
        timeRange = `${gg}/${mm} ore ${hhStart}:${minStart} (in corso)`;
      }
      
      const dur = calcolaDurata(start, end);
      parts.push(`⏱️ ${timeRange} (${dur})`);
    } else {
      // Fallback
      const startStr = formattaOraLeggibile(start);
      const endStr = end ? formattaOraLeggibile(end) : 'in corso';
      const dur = calcolaDurata(start, end);
      parts.push(`⏱️ ${startStr} - ${endStr} (${dur})`);
    }
  }
  
  if (note && note.trim()) {
    // Rimuove eventuali ritorni a capo per tenere la riga singola pulita
    const cleanNote = note.replace(/\s+/g, ' ').trim();
    parts.push(`📝 ${cleanNote.substring(0, 30)}${cleanNote.length > 30 ? '...' : ''}`);
  }
  
  return parts.join('  •  ');
};


const isVolumeString = (str) => {
  if (!str) return false;
  return /V:\s*[\d,.]+\s+A:\s*[\d,.]+/i.test(str);
};

const parseVolumeString = (str) => {
  if (!str) return null;
  const regex = /V:\s*([\d,.]+)\s+A:\s*([\d,.]+)\s+B:\s*([\d,.]+)(?:\s+C:\s*([\d,.]+))?/i;
  const match = str.trim().match(regex);
  if (match) {
    return {
      v: match[1],
      a: match[2],
      b: match[3],
      c: match[4] || '0'
    };
  }
  return null;
};

const parsedRmt = (str) => {
  if (!str) return null;
  const regex = /(?:\(+)?\s*(\*+[¹²³⁴⁵⁶⁷⁸⁹\d]*)\s*1RMT?:\s*([\d,.]+)\s*KG\s*~([\d,.]+)(?:\s*KG)?\s*(?:del|del\s+)?\s*([\d/]+)(?:\s*([↓↑]\s*\d+%))?\s*(?:\)+)?/i;
  const match = str.trim().match(regex);
  if (match) {
    const rawStelle = match[1];
    const starsCount = (rawStelle.match(/\*/g) || []).length;
    const subLevel = rawStelle.replace(/\*/g, '').trim(); // Estrae il superscript (es. '⁴')
    
    // Mappa l'esponente al numero effettivo di stelle da mostrare
    const mapSup = {
      '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9,
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
    };
    const stelleCalcolate = subLevel ? (mapSup[subLevel] || starsCount) : starsCount;
    
    const getLivelloTesto = (s) => {
      if (s <= 1) return 'Neofita';
      if (s === 2) return 'Principiante';
      if (s === 3) return 'Intermedio';
      if (s === 4) return 'Avanzato';
      return 'Elite';
    };
    
    const getLivelloColore = (testo) => {
      const colori = {
        'Neofita': 'grey-darken-1',
        'Principiante': 'blue-darken-2',
        'Intermedio': 'teal-darken-2',
        'Avanzato': 'orange-darken-3',
        'Elite': 'deep-purple-darken-2'
      };
      return colori[testo] || 'orange-darken-3';
    };
    
    const livelloTesto = getLivelloTesto(stelleCalcolate);
    const livelloColore = getLivelloColore(livelloTesto);
    
    return {
      stelle: stelleCalcolate,
      livelloTesto,
      livelloColore,
      livelloEsteso: rawStelle,
      subLivello: subLevel,
      massimale: match[2],
      prossimoLivello: match[3],
      data: match[4],
      variazione: match[5] || ''
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

const parseDayHeader = (str) => {
  if (!str) return null;
  const cleanStr = str.trim();
  const regex = /WO\s+([A-D])\s*\[\s*([^%]+?)\s+(\d+)\s*%\s*\/\s*([^%]+?)\s+(\d+)\s*%\s*\]\s*K:\s*(\d+)/i;
  const match = cleanStr.match(regex);
  if (match) {
    const giorno = match[1];
    const t1 = match[2];
    const d1 = parseInt(match[3]);
    const t2 = match[4];
    const d2 = parseInt(match[5]);
    const calorie = parseInt(match[6]);
    
    const parseTimeToMins = (tStr) => {
      if (!tStr) return 0;
      const clean = tStr.toLowerCase().replace('min', '').replace('m', '').trim();
      if (clean.includes(':')) {
        const parts = clean.split(':');
        if (parts.length === 2) {
          return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
        }
      }
      return parseInt(clean, 10) || 0;
    };
    
    const formatMinsToTime = (totalMins) => {
      const hours = Math.floor(totalMins / 60);
      const mins = Math.round(totalMins % 60);
      if (hours > 0) {
        return `${hours}:${String(mins).padStart(2, '0')}`;
      }
      return `${mins} min`;
    };
    
    const m1 = parseTimeToMins(t1);
    const m2 = parseTimeToMins(t2);
    const mediaMins = Math.round((m1 + m2) / 2);
    const tempoMedia = formatMinsToTime(mediaMins);
    
    const densitaMedia = Math.round((d1 + d2) / 2);
    
    return {
      giorno,
      tempo1: t1.trim(),
      densita1: d1,
      tempo2: t2.trim(),
      densita2: d2,
      tempoMedia,
      densitaMedia,
      calorie
    };
  }
  return null;
};

const parseVolumes = (str) => {
  if (!str) return null;
  const cleanStr = str.trim();
  const regex = /VOL:\s*([\d,.]+)\s+A:\s*([\d,.]+)\s+B:\s*([\d,.]+)(?:\s+C:\s*([\d,.]+))?/i;
  const match = cleanStr.match(regex);
  if (match) {
    const cleanFloat = (valStr) => {
      if (!valStr) return 0;
      const clean = valStr.replace(',', '.');
      return parseFloat(clean) || 0;
    };
    return {
      totale: cleanFloat(match[1]),
      alta: cleanFloat(match[2]),
      bassa: cleanFloat(match[3]),
      centrale: match[4] ? cleanFloat(match[4]) : 0
    };
  }
  return null;
};

// Campi di inizio e fine
const getStartField = (w) => {
  return w === 1 ? 'start_wo' : `start${w}_wo`;
};

const getEndField = (w) => {
  return w === 1 ? 'end_wo' : `end${w}_wo`;
};

// Imposta lo stato di completamento
const setWeekCompleted = async (w, val) => {
  if (!workout.value) return;
  vibraTattile(val ? 25 : 15);
  
  const valString = val ? 'true' : 'false';
  const campo = 'cmp' + w;
  
  // 1. Aggiorna lo stato locale e il localStorage immediatamente (Optimistic Update)
  workout.value[campo] = valString;
  salvaModificaLocale(campo, valString);
  snackbar.value = true;

  // 2. Prova ad aggiornare Firestore in background (con setDoc self-healing)
  try {
    const docRef = doc(db, 'STORYBOARD', routeId);
    workout.value.timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    await setDoc(docRef, workout.value, { merge: true });
    console.log("Firestore completamento week sincronizzato con successo!");
  } catch (error) {
    console.warn("Firestore offline/quota esaurita. Dati salvati localmente:", error);
  }
};

// Salva dato generico del modulo
const salvaDato = async (campo, valore) => {
  if (!workout.value) return;
  const valoreOriginale = workout.value[campo] || '';
  if (valoreOriginale !== valore) {
    try {
      vibraTattile(20);
      
      // 1. Aggiorna lo stato locale e il localStorage immediatamente
      workout.value[campo] = valore;
      salvaModificaLocale(campo, valore);
      snackbar.value = true;

      // 2. Prova ad aggiornare Firestore in background (con setDoc self-healing)
      const docRef = doc(db, 'STORYBOARD', routeId);
      workout.value.timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

      await setDoc(docRef, workout.value, { merge: true });
      console.log("Firestore dato sincronizzato con successo!");
    } catch (error) {
      console.warn("Errore salvataggio:", error);
    }
  }
};

// Robust date parser for both standard ISO/datetime-local and DD/MM/YYYY formats
const parseCustomDate = (dateStr) => {
  if (!dateStr) return null;
  
  // standard ISO or datetime-local
  if (dateStr.includes('T') || dateStr.includes('-')) {
    const d = new Date(dateStr);
    if (!isNaN(d)) return d;
  }
  
  // DD/MM/YYYY HH:mm:ss
  const match = dateStr.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1; // 0-indexed
    const year = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    const second = match[6] ? parseInt(match[6], 10) : 0;
    
    const d = new Date(year, month, day, hour, minute, second);
    if (!isNaN(d)) return d;
  }
  
  const dFallback = new Date(dateStr);
  return isNaN(dFallback) ? null : dFallback;
};

// Calcoli delle durate
const getDurataMinuti = (start, end) => {
  if (!start || !end) return 0;
  const startDate = parseCustomDate(start);
  const endDate = parseCustomDate(end);
  if (!startDate || !endDate) return 0;
  const diffMs = endDate - startDate;
  return diffMs > 0 ? Math.floor(diffMs / (1000 * 60)) : 0;
};

const calcolaDurata = (start, end) => {
  const totalMins = getDurataMinuti(start, end);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  return `${hours}:${String(mins).padStart(2, '0')}`;
};

const getFormattedDurationForWeek = (w) => {
  if (!workout.value) return '0:00';
  const start = workout.value[getStartField(w)];
  const end = workout.value[getEndField(w)];
  return calcolaDurata(start, end);
};

const getMediaFormatted = () => {
  if (!workout.value) return '0:00';
  let sum = 0;
  let countWeeks = 0;
  for (let w = 1; w <= 6; w++) {
    const start = workout.value[getStartField(w)];
    const end = workout.value[getEndField(w)];
    const mins = getDurataMinuti(start, end);
    if (mins > 0) {
      sum += mins;
      countWeeks++;
    }
  }
  if (countWeeks === 0) return '0:00';
  const mediaMins = sum / countWeeks;
  const hours = Math.floor(mediaMins / 60);
  const mins = Math.floor(mediaMins % 60);
  return `${hours}:${String(mins).padStart(2, '0')}`;
};

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

/* Stili per le schede espandibili delle settimane */
.week-expandable-card {
  background: rgba(15, 23, 42, 0.4) !important;
  border-color: rgba(255, 255, 255, 0.05) !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
  overflow: hidden;
}

.week-expandable-card.card-expanded {
  background: rgba(15, 23, 42, 0.85) !important;
  border-color: rgba(249, 115, 22, 0.35) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25) !important;
}

.week-expandable-card.card-completed-border {
  border-color: rgba(0, 230, 118, 0.25) !important;
}

.week-expandable-card.card-active-border {
  border-color: rgba(255, 145, 0, 0.25) !important;
}

.min-height-screen {
  min-height: calc(100vh - 100px);
}

.appsheet-top-bar {
  border-bottom: 2px solid #f97316;
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

.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.border-left-soft {
  border-left: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.premium-card {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.compact-header-card {
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.card-glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
}

.leading-none {
  line-height: 1 !important;
}

/* Focused Week Card */


.btn-quick-log {
  height: 44px !important;
  border: 1px solid rgba(249, 115, 22, 0.25) !important;
  transition: all 0.2s ease !important;
  font-size: 0.85rem !important;
}

.btn-quick-log:hover {
  background: rgba(249, 115, 22, 0.08) !important;
  border-color: #f97316 !important;
}

.btn-quick-log:active {
  transform: scale(0.96);
}

.btn-logged-success {
  border: 1px solid rgba(16, 185, 129, 0.4) !important;
  background: rgba(16, 185, 129, 0.08) !important;
}
.btn-logged-success:hover {
  background: rgba(16, 185, 129, 0.15) !important;
  border-color: #10b981 !important;
}

.notes-field-spacious {
  background: rgba(0, 0, 0, 0.2) !important;
}

.manual-toggle {
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.04);
  transition: background 0.2s ease;
}

.manual-toggle:hover {
  background: rgba(30, 41, 59, 0.5);
}

.border-soft {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.bg-slate-900-op {
  background: rgba(15, 23, 42, 0.5) !important;
}

.ring-glow-orange {
  filter: drop-shadow(0 0 8px rgba(249, 115, 22, 0.2));
}

.bg-green-lighten-5 {
  background: rgba(16, 185, 129, 0.1) !important;
  border: 1px solid rgba(16, 185, 129, 0.2) !important;
  color: #10b981 !important;
}

.rmt-compact-card {
  border: 1px solid rgba(250, 204, 21, 0.15) !important;
}

.scale-switch {
  transform: scale(0.85);
  transform-origin: right center;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  height: 24px !important;
  display: flex !important;
  align-items: center !important;
}

.scale-switch :deep(.v-input__control) {
  min-height: unset !important;
  height: 24px !important;
}

.scale-switch :deep(.v-selection-control) {
  min-height: unset !important;
  height: 24px !important;
}

.success-banner-spacious {
  background: rgba(16, 185, 129, 0.06) !important;
  border: 1px solid rgba(16, 185, 129, 0.15) !important;
  color: #10b981 !important;
  font-size: 0.75rem !important;
}

.compact-header-metrics span {
  font-size: 0.58rem !important;
  white-space: nowrap;
}
</style>
