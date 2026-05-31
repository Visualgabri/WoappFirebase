<template>
  <v-container class="px-3 py-4 max-width-container min-height-screen pb-12">
    <!-- Barra Superiore con pulsante indietro -->
    <div class="d-flex align-center justify-space-between mb-4 appsheet-top-bar">
      <v-btn icon color="orange-darken-3" variant="text" @click="tornaIndietro" id="btn-sessione-indietro">
        <v-icon size="28">mdi-arrow-left</v-icon>
      </v-btn>
      <h3 class="text-subtitle-1 font-weight-black text-slate-dark text-truncate">
        Dettaglio Sessione
      </h3>
      <v-btn icon color="slate-dark" variant="text" @click="caricaDati"><v-icon>mdi-refresh</v-icon></v-btn>
    </div>

    <!-- Stato di caricamento -->
    <div v-if="caricamento" class="text-center my-12">
      <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
      <p class="mt-2 text-caption text-muted">Caricamento sessione...</p>
    </div>

    <!-- Errore o non trovato -->
    <div v-else-if="!workout" class="text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="64" color="red-lighten-2" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h3 class="text-h6 font-weight-bold text-slate-dark">Sessione non trovata</h3>
    </div>

    <!-- Contenuto Principale -->
    <div v-else class="session-detail-area">
      <!-- 1. Grande Lettera 3D / GIF -->
      <v-card class="image-premium-frame rounded-2xl overflow-hidden mb-5 elevation-3 mx-auto" max-width="180">
        <v-img
          :src="getGifUrl(workout.UrlNormal) || 'https://visualgabri.github.io/Esercizi/WoApp/Immagini/A.png'"
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

      <!-- 2. Titoli e Volumi Formattati Premium in Sessione -->
      <div class="mb-6 text-center">
        <!-- Titolo principale o giorno -->
        <h2 v-if="parseDayHeader(workout.des_esercizio)" class="text-h5 font-weight-black text-orange-darken-4 leading-tight px-2 mb-3">
          Sessione di Allenamento - Giorno {{ parseDayHeader(workout.des_esercizio).giorno }}
        </h2>
        <h2 v-else class="text-h5 font-weight-black text-slate-dark leading-tight px-2">
          {{ workout.des_esercizio }}
        </h2>

        <!-- Dashboard Tempi, Densità e Calorie in Sessione -->
        <div v-if="parseDayHeader(workout.des_esercizio)" class="rmt-premium-card pa-3 rounded-xl card-glass border-orange-darken-3-op max-width-rmt mx-auto mb-3">
          <div class="d-flex align-center justify-space-between mb-3 px-1">
            <span class="text-caption text-muted font-weight-black uppercase" style="font-size: 0.65rem;">Statistiche Sessione</span>
            <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.65rem;">
              🔥 {{ parseDayHeader(workout.des_esercizio).calorie }} kcal stimate
            </span>
          </div>

          <v-row dense class="text-center mb-3">
            <v-col cols="4">
              <div class="prescription-chip-box px-2 py-1.5 rounded-lg">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.65rem;">Week 1</span>
                <span class="text-body-2 font-weight-bold text-slate-dark d-block mb-0.5">⏱️ {{ parseDayHeader(workout.des_esercizio).tempo1 }}</span>
                <span class="text-super-caption text-orange-lighten-1 font-weight-black" style="font-size: 0.65rem;">Densità: {{ parseDayHeader(workout.des_esercizio).densita1 }}%</span>
              </div>
            </v-col>
            <v-col cols="4">
              <div class="prescription-chip-box px-2 py-1.5 rounded-lg border-orange-darken-3-op bg-orange-darken-3-op">
                <span class="text-super-caption text-orange-darken-3 uppercase font-weight-black d-block mb-0.5" style="font-size: 0.65rem;">Media</span>
                <span class="text-body-2 font-weight-black text-orange-darken-3 d-block mb-0.5">⏱️ {{ parseDayHeader(workout.des_esercizio).tempoMedia }}</span>
                <span class="text-super-caption text-orange-darken-3 font-weight-black" style="font-size: 0.65rem;">Densità: {{ parseDayHeader(workout.des_esercizio).densitaMedia }}%</span>
              </div>
            </v-col>
            <v-col cols="4">
              <div class="prescription-chip-box px-2 py-1.5 rounded-lg">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.65rem;">Week 6</span>
                <span class="text-body-2 font-weight-bold text-slate-dark d-block mb-0.5">⏱️ {{ parseDayHeader(workout.des_esercizio).tempo2 }}</span>
                <span class="text-super-caption text-orange-lighten-1 font-weight-black" style="font-size: 0.65rem;">Densità: {{ parseDayHeader(workout.des_esercizio).densita2 }}%</span>
              </div>
            </v-col>
          </v-row>

          <!-- Sezione Volumi (VOL A, B, C) in Sessione -->
          <div v-if="parseVolumes(workout.ins_esercizio)" class="volumes-premium-box pa-2 rounded-lg bg-slate-900 border-soft text-left mt-2">
            <div class="d-flex align-center justify-space-between mb-1.5 px-1">
              <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.65rem;">
                📊 Distribuzione Volumi (Serie Totali: {{ parseVolumes(workout.ins_esercizio).totale }})
              </span>
            </div>
            <v-row dense class="text-center font-weight-bold text-caption">
              <v-col :cols="parseVolumes(workout.ins_esercizio).centrale > 0 ? 4 : 6">
                <div class="pa-1 bg-slate-800 rounded">
                  <span class="text-muted d-block" style="font-size: 0.6rem;">Alta (A)</span>
                  <span class="text-blue-lighten-2">{{ parseVolumes(workout.ins_esercizio).alta }} serie</span>
                  <v-progress-linear
                    :model-value="parseVolumes(workout.ins_esercizio).totale > 0 ? (parseVolumes(workout.ins_esercizio).alta / parseVolumes(workout.ins_esercizio).totale) * 100 : 0"
                    color="blue-lighten-2"
                    height="3"
                    rounded
                    class="mt-1"
                  ></v-progress-linear>
                </div>
              </v-col>
              <v-col :cols="parseVolumes(workout.ins_esercizio).centrale > 0 ? 4 : 6">
                <div class="pa-1 bg-slate-800 rounded">
                  <span class="text-muted d-block" style="font-size: 0.6rem;">Bassa (B)</span>
                  <span class="text-orange-lighten-2">{{ parseVolumes(workout.ins_esercizio).bassa }} serie</span>
                  <v-progress-linear
                    :model-value="parseVolumes(workout.ins_esercizio).totale > 0 ? (parseVolumes(workout.ins_esercizio).bassa / parseVolumes(workout.ins_esercizio).totale) * 100 : 0"
                    color="orange-lighten-2"
                    height="3"
                    rounded
                    class="mt-1"
                  ></v-progress-linear>
                </div>
              </v-col>
              <v-col v-if="parseVolumes(workout.ins_esercizio).centrale > 0" cols="4">
                <div class="pa-1 bg-slate-800 rounded">
                  <span class="text-muted d-block" style="font-size: 0.6rem;">Centrale (C)</span>
                  <span class="text-green-lighten-2">{{ parseVolumes(workout.ins_esercizio).centrale }} serie</span>
                  <v-progress-linear
                    :model-value="parseVolumes(workout.ins_esercizio).totale > 0 ? (parseVolumes(workout.ins_esercizio).centrale / parseVolumes(workout.ins_esercizio).totale) * 100 : 0"
                    color="green-lighten-2"
                    height="3"
                    rounded
                    class="mt-1"
                  ></v-progress-linear>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- Sezione Volumi standalone se parseDayHeader fallisce ma parseVolumes riesce -->
        <div v-if="!parseDayHeader(workout.des_esercizio) && parseVolumes(workout.ins_esercizio)" class="rmt-premium-card pa-3 rounded-xl card-glass border-orange-darken-3-op max-width-rmt mx-auto mb-3">
          <div class="volumes-premium-box pa-2 rounded-lg bg-slate-900 border-soft text-left">
            <div class="d-flex align-center justify-space-between mb-1.5 px-1">
              <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.65rem;">
                📊 Distribuzione Volumi (Serie Totali: {{ parseVolumes(workout.ins_esercizio).totale }})
              </span>
            </div>
            <v-row dense class="text-center font-weight-bold text-caption">
              <v-col :cols="parseVolumes(workout.ins_esercizio).centrale > 0 ? 4 : 6">
                <div class="pa-1 bg-slate-800 rounded">
                  <span class="text-muted d-block" style="font-size: 0.6rem;">Alta (A)</span>
                  <span class="text-blue-lighten-2">{{ parseVolumes(workout.ins_esercizio).alta }} serie</span>
                  <v-progress-linear
                    :model-value="parseVolumes(workout.ins_esercizio).totale > 0 ? (parseVolumes(workout.ins_esercizio).alta / parseVolumes(workout.ins_esercizio).totale) * 100 : 0"
                    color="blue-lighten-2"
                    height="3"
                    rounded
                    class="mt-1"
                  ></v-progress-linear>
                </div>
              </v-col>
              <v-col :cols="parseVolumes(workout.ins_esercizio).centrale > 0 ? 4 : 6">
                <div class="pa-1 bg-slate-800 rounded">
                  <span class="text-muted d-block" style="font-size: 0.6rem;">Bassa (B)</span>
                  <span class="text-orange-lighten-2">{{ parseVolumes(workout.ins_esercizio).bassa }} serie</span>
                  <v-progress-linear
                    :model-value="parseVolumes(workout.ins_esercizio).totale > 0 ? (parseVolumes(workout.ins_esercizio).bassa / parseVolumes(workout.ins_esercizio).totale) * 100 : 0"
                    color="orange-lighten-2"
                    height="3"
                    rounded
                    class="mt-1"
                  ></v-progress-linear>
                </div>
              </v-col>
              <v-col v-if="parseVolumes(workout.ins_esercizio).centrale > 0" cols="4">
                <div class="pa-1 bg-slate-800 rounded">
                  <span class="text-muted d-block" style="font-size: 0.6rem;">Centrale (C)</span>
                  <span class="text-green-lighten-2">{{ parseVolumes(workout.ins_esercizio).centrale }} serie</span>
                  <v-progress-linear
                    :model-value="parseVolumes(workout.ins_esercizio).totale > 0 ? (parseVolumes(workout.ins_esercizio).centrale / parseVolumes(workout.ins_esercizio).totale) * 100 : 0"
                    color="green-lighten-2"
                    height="3"
                    rounded
                    class="mt-1"
                  ></v-progress-linear>
                </div>
              </v-col>
            </v-row>
          </div>
        </div>

        <!-- RMT Formattata Premium Gamified in Sessione -->
        <div v-if="parsedRmt(workout.des_esercizio_2)" class="rmt-premium-card mt-3 pa-3 rounded-xl card-glass border-orange-darken-3-op max-width-rmt mx-auto">
          <div class="d-flex align-center justify-space-between mb-2 px-1">
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
              Valutazione: {{ parsedRmt(workout.des_esercizio_2).data }}
            </span>
          </div>

          <v-row dense class="align-center">
            <v-col cols="6" class="border-right-soft">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block">Target 1RM (1RMT)</span>
                <span class="text-h6 font-weight-black text-orange-darken-3">
                  {{ parsedRmt(workout.des_esercizio_2).massimale }} <span class="text-caption text-muted">KG</span>
                </span>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block">Target Livello Successivo</span>
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
        
        <!-- Fallback standard -->
        <p v-else-if="workout.des_esercizio_2" class="text-subtitle-1 font-weight-black text-orange-darken-3 mt-2">
          {{ workout.des_esercizio_2 }}
        </p>
      </div>

      <!-- 3. Lista delle 6 Settimane con Toggle ed Inputs speciali per la prima non completata -->
      <h3 class="text-subtitle-2 font-weight-black text-slate-dark mb-4 text-left d-flex align-center">
        <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-calendar-check</v-icon>
        Completamento Settimanale
      </h3>

      <div class="weeks-stacked-list mb-6">
        <v-card
          v-for="sett in 6"
          :key="sett"
          class="week-log-card rounded-2xl pa-4 mb-4 border text-left"
          :class="{ 'week-active-border': sett === activeUncompletedWeek }"
          elevation="1"
        >
          <!-- Intestazione Week con Switch -->
          <div class="d-flex align-center justify-space-between">
            <span class="text-subtitle-2 font-weight-black" :class="sett === activeUncompletedWeek ? 'text-orange-darken-3' : 'text-slate-dark'">
              Week {{ sett }} completata
            </span>
            <v-switch
              :model-value="isWeekCompleted(sett)"
              @update:model-value="(val) => setWeekCompleted(sett, val)"
              color="orange-darken-3"
              hide-details
              density="compact"
            ></v-switch>
          </div>

          <!-- Dettagli della settimana inseribili solo se è la prima settimana non completata -->
          <div v-if="sett === activeUncompletedWeek" class="mt-4 pt-3 border-top-soft">
            <v-text-field
              v-model="inputNote"
              label="Note week"
              variant="outlined"
              density="compact"
              class="mb-3"
              rounded="lg"
              color="orange-darken-3"
              prepend-inner-icon="mdi-pencil-outline"
              @blur="salvaDato('ins_week' + sett, inputNote)"
            ></v-text-field>

            <v-row dense>
              <v-col cols="6">
                <v-text-field
                  v-model="inputStart"
                  type="datetime-local"
                  label="Inizio wo"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  color="orange-darken-3"
                  @change="salvaDato(getStartField(sett), inputStart)"
                ></v-text-field>
              </v-col>
              <v-col cols="6">
                <v-text-field
                  v-model="inputEnd"
                  type="datetime-local"
                  label="Fine wo"
                  variant="outlined"
                  density="compact"
                  rounded="lg"
                  color="orange-darken-3"
                  @change="salvaDato(getEndField(sett), inputEnd)"
                ></v-text-field>
              </v-col>
            </v-row>

            <div class="text-caption font-weight-bold text-slate d-flex align-center mt-1">
              <v-icon size="14" color="grey" class="mr-1">mdi-clock-outline</v-icon>
              Durata Wo{{ sett }}: <span class="text-orange-darken-3 ml-1">{{ calcolaDurata(inputStart, inputEnd) }}</span>
            </div>
          </div>
        </v-card>
      </div>

      <!-- 4. Resoconto Durate e Media in fondo -->
      <h3 class="text-subtitle-2 font-weight-black text-slate-dark mb-4 text-left d-flex align-center">
        <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-clipboard-pulse-outline</v-icon>
        Riepilogo Durate Sessioni
      </h3>

      <v-card class="premium-card rounded-2xl pa-4 mb-6 text-left" elevation="2">
        <v-list class="bg-transparent py-0" density="comfortable">
          <v-list-item v-for="sett in 6" :key="sett" class="px-0 py-1 border-bottom-soft">
            <template v-slot:prepend>
              <v-icon size="18" :color="isWeekCompleted(sett) ? 'green' : 'grey'">mdi-timer-outline</v-icon>
            </template>
            <div class="d-flex align-center justify-space-between w-100">
              <span class="text-body-2 font-weight-bold text-slate-dark">Durata Week {{ sett }}</span>
              <span class="text-body-2 font-weight-black text-slate">{{ getFormattedDurationForWeek(sett) }}</span>
            </div>
          </v-list-item>

          <v-list-item class="px-0 py-2">
            <template v-slot:prepend>
              <v-icon size="20" color="orange-darken-3">mdi-chart-line-stacked</v-icon>
            </template>
            <div class="d-flex align-center justify-space-between w-100 font-weight-black text-subtitle-1 text-orange-darken-3">
              <span>Media</span>
              <span>{{ getMediaFormatted() }}</span>
            </div>
          </v-list-item>
        </v-list>
      </v-card>

    </div>

    <!-- Snackbar -->
    <v-snackbar v-model="snackbar" color="success" timeout="2000" rounded="xl">
      Sincronizzazione in tempo reale completata!
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { selectedAthlete } from '../authStore.js';

const route = useRoute();
const router = useRouter();
const routeId = route.params.id;

// Stato
const workout = ref(null);
const caricamento = ref(true);
const snackbar = ref(false);

// Inputs per la settimana in corso
const inputNote = ref('');
const inputStart = ref('');
const inputEnd = ref('');

// Micro-vibrazione tattile
const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Rimappatore GIF a GitHub Pages
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

// Carica i dati del documento Riga 0
const caricaDati = async () => {
  caricamento.value = true;
  try {
    const docRef = doc(db, 'STORYBOARD', routeId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      workout.value = docSnap.data();
      
      // Inizializza gli input per la settimana attiva
      const activeWeek = activeUncompletedWeek.value;
      inputNote.value = workout.value['ins_week' + activeWeek] || '';
      inputStart.value = workout.value[getStartField(activeWeek)] || '';
      inputEnd.value = workout.value[getEndField(activeWeek)] || '';
    }
  } catch (error) {
    console.error("Errore caricamento sessione:", error);
  } finally {
    caricamento.value = false;
  }
};

onMounted(() => {
  caricaDati();
});

// Helper per identificare la prima settimana non completata
const activeUncompletedWeek = computed(() => {
  if (!workout.value) return 1;
  for (let w = 1; w <= 6; w++) {
    if (workout.value['cmp' + w] !== 'true') {
      return w;
    }
  }
  return 6; // Se tutte completate, rimaniamo alla 6
});

// Controlla se la settimana w è completata
const isWeekCompleted = (w) => {
  if (!workout.value) return false;
  return workout.value['cmp' + w] === 'true';
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
  
  try {
    const docRef = doc(db, 'STORYBOARD', routeId);
    const payload = {
      [campo]: valString,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    
    await updateDoc(docRef, payload);
    workout.value[campo] = valString;
    snackbar.value = true;

    // Ricalcola la settimana attiva globale per l'atleta ed aggiorna il localStorage
    const nuovaSettimanaAttiva = calcolaSettimanaAttivaG();
    const atletaId = selectedAthlete.value || '';
    if (atletaId) {
      localStorage.setItem('settimanaAttiva_' + atletaId, nuovaSettimanaAttiva);
    }
    
    // Aggiorna gli input locali della settimana attiva
    const activeWeek = activeUncompletedWeek.value;
    inputNote.value = workout.value['ins_week' + activeWeek] || '';
    inputStart.value = workout.value[getStartField(activeWeek)] || '';
    inputEnd.value = workout.value[getEndField(activeWeek)] || '';

  } catch (error) {
    console.error("Errore aggiornamento completamento week:", error);
  }
};

// Ricalcola settimana attiva globale
const calcolaSettimanaAttivaG = () => {
  for (let w = 1; w <= 6; w++) {
    if (workout.value['cmp' + w] !== 'true') {
      return w;
    }
  }
  return 6;
};

// Salva dato generico del modulo
const salvaDato = async (campo, valore) => {
  if (!workout.value) return;
  const valoreOriginale = workout.value[campo] || '';
  if (valoreOriginale !== valore) {
    try {
      vibraTattile(20);
      const docRef = doc(db, 'STORYBOARD', routeId);
      const payload = {
        [campo]: valore,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
      };
      
      await updateDoc(docRef, payload);
      workout.value[campo] = valore;
      snackbar.value = true;
    } catch (error) {
      console.error("Errore salvataggio dato sessione:", error);
    }
  }
};

// Calcoli delle durate
const getDurataMinuti = (start, end) => {
  if (!start || !end) return 0;
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate) || isNaN(endDate)) return 0;
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
  for (let w = 1; w <= 6; w++) {
    const start = workout.value[getStartField(w)];
    const end = workout.value[getEndField(w)];
    sum += getDurataMinuti(start, end);
  }
  const mediaMins = sum / 6;
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

.min-height-screen {
  min-height: calc(100vh - 100px);
}

.appsheet-top-bar {
  border-bottom: 2px solid #f97316;
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

.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.premium-card {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.image-premium-frame {
  border: 4px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5) !important;
}

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

.card-glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
}

.leading-tight {
  line-height: 1.25;
}

.max-width-rmt {
  max-width: 450px;
}
.border-right-soft {
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.text-super-caption {
  font-size: 0.65rem !important;
  letter-spacing: 0.05em;
}
.border-orange-darken-3-op {
  border: 1px solid rgba(249, 115, 22, 0.15) !important;
}

.border-soft {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.bg-slate-900 {
  background: rgba(15, 23, 42, 0.5) !important;
}

.bg-slate-800 {
  background: rgba(30, 41, 59, 0.4) !important;
}

.prescription-chip-box {
  background: rgba(30, 41, 59, 0.35) !important;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.bg-orange-darken-3-op {
  background: rgba(249, 115, 22, 0.08) !important;
}
</style>
