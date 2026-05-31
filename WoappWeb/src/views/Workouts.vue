<template>
  <v-container class="px-3 py-6 max-width-container min-height-screen">
    <!-- Header Premium -->
    <div class="appsheet-header mb-6 d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-white elevation-1">
          <v-img src="https://visualgabri.github.io/Esercizi/WoApp/Immagini/A.png" alt="Superman G"></v-img>
        </v-avatar>
        <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight">WORKOUTS</h1>
      </div>
      <div class="header-actions">
        <v-btn icon color="slate-dark" variant="text" @click="caricaAllenamenti"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>
    </div>

    <!-- Stato vuoto se non selezionati atleta e scheda -->
    <div v-if="!atletaSelezionato || !schedaSelezionata" class="empty-state text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="80" color="orange-lighten-3" class="mb-4 animate-bounce">mdi-clipboard-text-search-outline</v-icon>
      <h3 class="text-h5 font-weight-bold text-slate-dark">Seleziona Atleta e Scheda</h3>
      <p class="text-body-1 text-muted mt-2">
        Scegli l'atleta e la scheda attiva nella scheda **Ricerca Wo** per sbloccare la lista allenamenti.
      </p>
      <v-btn to="/ricerca" color="orange-darken-3" class="font-weight-bold text-none mt-6" rounded="lg">
        Vai a Ricerca Wo
      </v-btn>
    </div>

    <!-- Contenuto Principale -->
    <div v-else>
      
      <!-- Selettore del Giorno (A, B, C, D) in alto stile AppSheet -->
      <v-tabs
        v-model="giornoSelezionato"
        color="orange-darken-3"
        align-tabs="center"
        grow
        class="card-glass border-bottom mb-4 rounded-xl elevation-1"
        @update:model-value="salvaGiornoSelezionato"
      >
        <v-tab v-for="giorno in listaGiorniDisponibili" :key="giorno" :value="giorno" class="font-weight-black text-h6">
          {{ giorno }}
        </v-tab>
      </v-tabs>

      <!-- Indicatore di Caricamento -->
      <div v-if="caricamento" class="text-center my-10">
        <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
        <p class="mt-2 text-caption text-muted">Caricamento esercizi giorno {{ giornoSelezionato }}...</p>
      </div>

      <div v-else>
        <!-- Intestazione del Giorno Attivo (Riga 0) stile AppSheet (cliccabile per completamento) -->
        <v-card
          v-if="headerGiorno"
          class="day-header-card pa-4 rounded-xl mb-6 elevation-2 clickable-header"
          border="left"
          @click="vaiAlDettaglioSessione(headerGiorno.id)"
        >
          <!-- Se il header si può formattare, mostriamo un layout premium strutturato -->
          <div v-if="parseDayHeader(headerGiorno.des_esercizio)" class="w-100">
            <div class="d-flex align-center justify-space-between mb-3">
              <div class="d-flex align-center">
                <div class="giorno-big-letter mr-3">{{ giornoSelezionato }}</div>
                <div class="text-left">
                  <h3 class="text-subtitle-1 font-weight-black text-orange-darken-4">
                    Workout Giorno {{ giornoSelezionato }}
                  </h3>
                  <!-- Visualizzazione Settimana Attiva e Progresso -->
                  <div class="d-flex align-center mt-1 gap-2 flex-wrap">
                    <v-chip size="x-small" color="orange-darken-3" class="font-weight-black px-1.5" variant="flat" style="font-size: 0.58rem; height: 18px;">
                      SETTIMANA {{ settimanaAttiva }} DI 6
                    </v-chip>
                    <div class="d-flex gap-1 align-center mini-weeks-progression">
                      <div
                        v-for="w in [1, 2, 3, 4, 5, 6]"
                        :key="w"
                        class="mini-week-capsule"
                        :class="{
                          'capsule-completed': headerGiorno['cmp' + w] === 'true',
                          'capsule-active': w === settimanaAttiva && headerGiorno['cmp' + w] !== 'true',
                          'capsule-pending': w !== settimanaAttiva && headerGiorno['cmp' + w] !== 'true'
                        }"
                      >
                        <span class="capsule-num">W{{ w }}</span>
                        <v-icon v-if="headerGiorno['cmp' + w] === 'true'" size="8" class="ml-0.5" color="green-accent-4">mdi-check-bold</v-icon>
                      </div>
                    </div>
                  </div>
                  <div class="text-caption text-muted font-weight-bold d-flex align-center mt-1" style="font-size: 0.7rem;">
                    <v-icon size="13" color="orange" class="mr-1">mdi-fire</v-icon>
                    Stima: {{ parseDayHeader(headerGiorno.des_esercizio).calorie }} kcal consumate
                  </div>
                </div>
              </div>
              <v-icon color="orange-darken-3">mdi-chevron-right</v-icon>
            </div>

            <!-- Griglia dei Tempi e Densità con Medie -->
            <v-row dense class="mb-3 text-center">
              <v-col cols="4">
                <div class="prescription-chip-box px-2 py-1.5 rounded-lg">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.65rem;">Week 1</span>
                  <span class="text-body-2 font-weight-bold text-slate-dark d-block mb-0.5">⏱️ {{ parseDayHeader(headerGiorno.des_esercizio).tempo1 }}</span>
                  <span class="text-super-caption text-orange-lighten-1 font-weight-black" style="font-size: 0.65rem;">Densità: {{ parseDayHeader(headerGiorno.des_esercizio).densita1 }}%</span>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="prescription-chip-box px-2 py-1.5 rounded-lg border-orange-darken-3-op bg-orange-darken-3-op">
                  <span class="text-super-caption text-orange-darken-3 uppercase font-weight-black d-block mb-0.5" style="font-size: 0.65rem;">Media</span>
                  <span class="text-body-2 font-weight-black text-orange-darken-3 d-block mb-0.5">⏱️ {{ parseDayHeader(headerGiorno.des_esercizio).tempoMedia }}</span>
                  <span class="text-super-caption text-orange-darken-3 font-weight-black" style="font-size: 0.65rem;">Densità: {{ parseDayHeader(headerGiorno.des_esercizio).densitaMedia }}%</span>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="prescription-chip-box px-2 py-1.5 rounded-lg">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.65rem;">Week 6</span>
                  <span class="text-body-2 font-weight-bold text-slate-dark d-block mb-0.5">⏱️ {{ parseDayHeader(headerGiorno.des_esercizio).tempo2 }}</span>
                  <span class="text-super-caption text-orange-lighten-1 font-weight-black" style="font-size: 0.65rem;">Densità: {{ parseDayHeader(headerGiorno.des_esercizio).densita2 }}%</span>
                </div>
              </v-col>
            </v-row>

            <!-- Sezione Volumi (VOL A, B, C) -->
            <div v-if="parseVolumes(headerGiorno.ins_esercizio)" class="volumes-premium-box pa-2 rounded-lg bg-slate-900 border-soft text-left">
              <div class="d-flex align-center justify-space-between mb-1.5 px-1">
                <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.65rem;">
                  📊 Distribuzione Volumi (Serie Totali: {{ parseVolumes(headerGiorno.ins_esercizio).totale }})
                </span>
              </div>
              <v-row dense class="text-center font-weight-bold text-caption">
                <v-col :cols="parseVolumes(headerGiorno.ins_esercizio).centrale > 0 ? 4 : 6">
                  <div class="pa-1 bg-slate-800 rounded">
                    <span class="text-muted d-block" style="font-size: 0.6rem;">Parte Alta (A)</span>
                    <span class="text-blue-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).alta }} serie</span>
                    <v-progress-linear
                      :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).alta / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                      color="blue-lighten-2"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </v-col>
                <v-col :cols="parseVolumes(headerGiorno.ins_esercizio).centrale > 0 ? 4 : 6">
                  <div class="pa-1 bg-slate-800 rounded">
                    <span class="text-muted d-block" style="font-size: 0.6rem;">Parte Bassa (B)</span>
                    <span class="text-orange-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).bassa }} serie</span>
                    <v-progress-linear
                      :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).bassa / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                      color="orange-lighten-2"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </v-col>
                <v-col v-if="parseVolumes(headerGiorno.ins_esercizio).centrale > 0" cols="4">
                  <div class="pa-1 bg-slate-800 rounded">
                    <span class="text-muted d-block" style="font-size: 0.6rem;">Centrale (C)</span>
                    <span class="text-green-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).centrale }} serie</span>
                    <v-progress-linear
                      :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).centrale / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                      color="green-lighten-2"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- Informazioni RMT se presenti -->
            <div v-if="headerGiorno.des_esercizio_2" class="text-caption text-slate font-weight-bold mt-2 pt-2 border-top-soft text-left d-flex align-center text-truncate">
              <v-icon size="14" color="grey" class="mr-1">mdi-chart-line</v-icon>
              {{ formattaRmtSemplice(headerGiorno.des_esercizio_2) }}
            </div>
          </div>

          <!-- Fallback se non si può parsare -->
          <div v-else class="d-flex align-center w-100">
            <div class="giorno-big-letter mr-4">{{ giornoSelezionato }}</div>
            <div class="flex-grow-1 text-left min-width-0">
              <h3 class="text-subtitle-1 font-weight-black text-orange-darken-4 text-truncate">
                {{ headerGiorno.des_esercizio || 'Sessione di Allenamento' }}
              </h3>
              <!-- Visualizzazione Settimana Attiva e Progresso -->
              <div class="d-flex align-center mt-1 gap-2 flex-wrap">
                <v-chip size="x-small" color="orange-darken-3" class="font-weight-black px-1.5" variant="flat" style="font-size: 0.58rem; height: 18px;">
                  SETTIMANA {{ settimanaAttiva }} DI 6
                </v-chip>
                <div class="d-flex gap-1 align-center mini-weeks-progression">
                  <div
                    v-for="w in [1, 2, 3, 4, 5, 6]"
                    :key="w"
                    class="mini-week-capsule"
                    :class="{
                      'capsule-completed': headerGiorno['cmp' + w] === 'true',
                      'capsule-active': w === settimanaAttiva && headerGiorno['cmp' + w] !== 'true',
                      'capsule-pending': w !== settimanaAttiva && headerGiorno['cmp' + w] !== 'true'
                    }"
                  >
                    <span class="capsule-num">W{{ w }}</span>
                    <v-icon v-if="headerGiorno['cmp' + w] === 'true'" size="8" class="ml-0.5" color="green-accent-4">mdi-check-bold</v-icon>
                  </div>
                </div>
              </div>
              <div v-if="headerGiorno.des_esercizio_2" class="text-caption text-slate font-weight-bold mt-1.5 d-flex align-center text-truncate">
                <v-icon size="14" color="grey" class="mr-1">mdi-chart-line</v-icon>
                {{ formattaRmtSemplice(headerGiorno.des_esercizio_2) }}
              </div>
              
              <!-- Sezione Volumi (VOL A, B, C) in fallback -->
              <div v-if="parseVolumes(headerGiorno.ins_esercizio)" class="volumes-premium-box pa-2 rounded-lg bg-slate-900 border-soft text-left mt-2">
                <div class="d-flex align-center justify-space-between mb-1.5 px-1">
                  <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.65rem;">
                    📊 Distribuzione Volumi (Serie Totali: {{ parseVolumes(headerGiorno.ins_esercizio).totale }})
                  </span>
                </div>
                <v-row dense class="text-center font-weight-bold text-caption">
                  <v-col :cols="parseVolumes(headerGiorno.ins_esercizio).centrale > 0 ? 4 : 6">
                    <div class="pa-1 bg-slate-800 rounded">
                      <span class="text-muted d-block" style="font-size: 0.6rem;">Parte Alta (A)</span>
                      <span class="text-blue-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).alta }} serie</span>
                      <v-progress-linear
                        :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).alta / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                        color="blue-lighten-2"
                        height="3"
                        rounded
                        class="mt-1"
                      ></v-progress-linear>
                    </div>
                  </v-col>
                  <v-col :cols="parseVolumes(headerGiorno.ins_esercizio).centrale > 0 ? 4 : 6">
                    <div class="pa-1 bg-slate-800 rounded">
                      <span class="text-muted d-block" style="font-size: 0.6rem;">Parte Bassa (B)</span>
                      <span class="text-orange-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).bassa }} serie</span>
                      <v-progress-linear
                        :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).bassa / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                        color="orange-lighten-2"
                        height="3"
                        rounded
                        class="mt-1"
                      ></v-progress-linear>
                    </div>
                  </v-col>
                  <v-col v-if="parseVolumes(headerGiorno.ins_esercizio).centrale > 0" cols="4">
                    <div class="pa-1 bg-slate-800 rounded">
                      <span class="text-muted d-block" style="font-size: 0.6rem;">Centrale (C)</span>
                      <span class="text-green-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).centrale }} serie</span>
                      <v-progress-linear
                        :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).centrale / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                        color="green-lighten-2"
                        height="3"
                        rounded
                        class="mt-1"
                      ></v-progress-linear>
                    </div>
                  </v-col>
                </v-row>
              </div>
              <div v-else-if="headerGiorno.ins_esercizio" class="text-caption text-muted mt-1 leading-tight text-truncate">
                {{ headerGiorno.ins_esercizio }}
              </div>
            </div>
            <v-icon color="orange-darken-3" class="ml-2">mdi-chevron-right</v-icon>
          </div>
        </v-card>

        <!-- Stato Vuoto se nessun esercizio -->
        <div v-if="eserciziFiltrati.length === 0" class="text-center my-10 py-6">
          <v-icon color="grey-lighten-1" size="48">mdi-dumbbell-off</v-icon>
          <p class="mt-2 text-caption text-muted">Nessun esercizio presente per il giorno {{ giornoSelezionato }} in questa scheda.</p>
        </div>

        <!-- Lista Esercizi con Miniature a Sinistra stile AppSheet -->
        <div v-else class="exercise-list">
          <v-card
            v-for="ex in eserciziFiltrati"
            :key="ex.id"
            class="exercise-item-card rounded-xl pa-3 mb-4 elevation-1 d-flex align-center"
            @click="vaiAlDettaglio(ex.id)"
          >
            <!-- Miniatura GIF/Immagine sulla Sinistra -->
            <div class="thumbnail-wrapper mr-4 rounded-lg overflow-hidden">
              <v-img
                :src="getGifUrl(ex.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200'"
                width="84"
                height="84"
                cover
                alt="Esercizio"
                class="bg-grey-lighten-4"
              >
                <template v-slot:placeholder>
                  <div class="fill-height d-flex align-center justify-center bg-slate-50">
                    <v-icon color="grey-lighten-1">mdi-dumbbell</v-icon>
                  </div>
                </template>
              </v-img>
            </div>

            <!-- Dettagli Centrali -->
            <div class="flex-grow-1 text-left min-width-0">
              <!-- Titolo Esercizio -->
              <h4 class="text-body-1 font-weight-black text-slate-dark text-truncate leading-tight mb-1">
                {{ ex.des_esercizio || 'Esercizio' }}
              </h4>

              <!-- Settore e Emoji Sforzo -->
              <div class="d-flex align-center text-caption font-weight-bold text-orange-darken-3 mb-1">
                <span>{{ ex.des_settore || 'Corpo Libero' }}</span>
                <v-icon size="12" color="orange" class="ml-1">mdi-fire</v-icon>
              </div>

              <!-- Prescrizione della settimana attiva -->
              <div class="text-caption font-weight-bold text-slate text-truncate mb-1">
                {{ formattaPrescrizioneSemplice(ex['des_week' + settimanaAttiva]) || ex.des_qta_report || 'Prescrizione non definita' }}
              </div>

              <!-- Timer Recupero Clickable -->
              <div v-if="ex.des_rec_report" class="mt-1">
                <v-chip
                  color="orange-darken-3"
                  variant="tonal"
                  size="x-small"
                  class="font-weight-black clickable-timer-chip"
                  prepend-icon="mdi-clock-outline"
                  @click.stop="avviaTimerRecupero(ex.des_rec_report, ex.des_esercizio)"
                >
                  ⏱️ Recupero: {{ ex.des_rec_report }}
                </v-chip>
              </div>
            </div>

            <!-- Colonna Destra (Ordine e Pulsante Navigazione) -->
            <div class="d-flex flex-column align-end justify-center pl-2">
              <div class="text-caption font-weight-black text-slate-dark mb-2">
                {{ ex.num_riga_giorno }}
              </div>
              <v-icon color="orange-darken-3">mdi-book-open-outline</v-icon>
            </div>
          </v-card>
        </div>

      </div>

    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import { selectedAthlete, selectedSheet, startGlobalTimer } from '../authStore.js';

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

const formattaPrescrizioneSemplice = (str) => {
  if (!str) return '';
  const parsed = parsePrescription(str);
  if (parsed) {
    return `${parsed.reps} @ ${parsed.total} kg (${parsed.side} kg per lato) • ${parsed.max} Max • ${parsed.effort} Sforzo`;
  }
  return str;
};

const parseRmtString = (str) => {
  if (!str) return null;
  const regex = /(?:\(+)?\s*(\*+[¹²³⁴⁵⁶⁷⁸⁹\d]*)\s*1RMT?:\s*([\d,.]+)\s*KG\s*~([\d,.]+)(?:\s*KG)?\s*(?:del|del\s+)?\s*([\d/]+)(?:\s*([↓↑]\s*\d+%))?\s*(?:\)+)?/i;
  const match = str.trim().match(regex);
  if (match) {
    const rawStelle = match[1];
    const starsCount = (rawStelle.match(/\*/g) || []).length;
    const subLevel = rawStelle.replace(/\*/g, ''); // Estragge il superscript
    return {
      stelle: '*'.repeat(starsCount),
      subLivello: subLevel,
      massimale: match[2],
      prossimo: match[3],
      data: match[4],
      variazione: match[5] || ''
    };
  }
  return null;
};

const formattaRmtSemplice = (str) => {
  if (!str) return '';
  const parsed = parseRmtString(str);
  if (parsed) {
    let result = `Livello Forza: ${parsed.stelle}`;
    if (parsed.subLivello) {
      result += `${parsed.subLivello}`;
    }
    result += ` • 1RMT: ${parsed.massimale} kg (Target: ~${parsed.prossimo} kg)`;
    if (parsed.variazione) {
      result += ` • Delta: ${parsed.variazione}`;
    }
    return result;
  }
  return str;
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

// Funzione per rimappare gli URL delle GIF dal dominio scaduto o vecchio a GitHub Pages con cartelle corrette
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

// Stato
const atletaSelezionato = ref(selectedAthlete.value);
const schedaSelezionata = ref(selectedSheet.value);
const giornoSelezionato = ref('A');
const listaGiorniDisponibili = ref(['A', 'B', 'C', 'D']);

const caricamento = ref(true);
const listaAllenamenti = ref([]);
const headerGiorno = ref(null);
const eserciziFiltrati = ref([]);

// Settimana Attiva importata da localStorage (placeholder iniziale)
const settimanaAttiva = ref(parseInt(localStorage.getItem('settimanaAttiva_' + selectedAthlete.value)) || 2);

// Helper per applicare le modifiche salvate offline nel localStorage
const applicaModificheLocali = (item) => {
  if (!item) return item;
  const key1 = `offline_storyboard_${item.id}`;
  const key2 = `offline_storyboard_${item.num_riga}`;
  const localData1 = localStorage.getItem(key1);
  const localData2 = localStorage.getItem(key2);
  
  let updates = {};
  if (localData1) {
    try { updates = { ...updates, ...JSON.parse(localData1) }; } catch (e) {}
  }
  if (localData2) {
    try { updates = { ...updates, ...JSON.parse(localData2) }; } catch (e) {}
  }
  
  return { ...item, ...updates };
};

// Ricalcola la settimana attiva globale (prima settimana non completamente completata)
const calcolaSettimanaAttivaGlobale = (exercises) => {
  const giorni = ['A', 'B', 'C', 'D'];
  for (let w = 1; w <= 6; w++) {
    let tuttiCompletati = true;
    for (const g of giorni) {
      const header = exercises.find(
        item => (item.des_giorno || '').trim() === g && parseInt(item.num_riga_giorno) === 0
      );
      if (!header || header['cmp' + w] !== 'true') {
        tuttiCompletati = false;
        break;
      }
    }
    if (!tuttiCompletati) {
      return w;
    }
  }
  return 6; // Se tutte completate, ritorna l'ultima
};

// Carica tutti gli allenamenti della scheda attiva
const caricaAllenamenti = async () => {
  if (!selectedAthlete.value || !selectedSheet.value) return;

  atletaSelezionato.value = selectedAthlete.value;
  schedaSelezionata.value = selectedSheet.value;
  
  // Ottieni il giorno attivo configurato
  const salvatoGiorno = localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'A';
  giornoSelezionato.value = salvatoGiorno;

  caricamento.value = true;
  
  // 1. Carica preventivamente il backup JSON per le patch di sicurezza GIF
  let backupList = [];
  try {
    const res = await fetch('/storyboard_backup.json');
    backupList = await res.json();
  } catch (errBackup) {
    console.warn("Impossibile caricare backup locale in anticipo:", errBackup);
  }

  const patchMissingUrls = (records) => {
    if (!backupList || backupList.length === 0) return records;
    return records.map(ex => {
      // Se UrlNormal è mancante o non valido (es. vuoto o relativo WORKOUT_R_Images)
      if (!ex.UrlNormal || !ex.UrlNormal.startsWith('http')) {
        const matched = backupList.find(b => 
          String(b.ID_cliente) === String(ex.ID_cliente) &&
          String(b.num_scheda) === String(ex.num_scheda) &&
          String(b.des_giorno).trim() === String(ex.des_giorno).trim() &&
          parseInt(b.num_riga_giorno) === parseInt(ex.num_riga_giorno)
        );
        if (matched && matched.UrlNormal && matched.UrlNormal.startsWith('http')) {
          ex.UrlNormal = matched.UrlNormal;
        }
      }
      return ex;
    });
  };

  try {
     const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', selectedAthlete.value),
      where('num_scheda', '==', selectedSheet.value)
    );
    const querySnapshot = await getDocs(q);
    
    let temporanei = [];
    querySnapshot.forEach((doc) => {
      temporanei.push(applicaModificheLocali({ id: doc.id, ...doc.data() }));
    });

    // Applica la patch per ripristinare le URL delle GIF mancanti o corrotte da Firestore
    temporanei = patchMissingUrls(temporanei);

    // CONTROLLO DI SICUREZZA: se mancano le righe 0 in Firestore, carichiamole dal backup!
    const giorni = ['A', 'B', 'C', 'D'];
    let haMancanti = giorni.some(g => !temporanei.some(item => (item.des_giorno || '').trim() === g && parseInt(item.num_riga_giorno) === 0));
    if (haMancanti) {
      giorni.forEach(g => {
        const giaPresente = temporanei.some(item => (item.des_giorno || '').trim() === g && parseInt(item.num_riga_giorno) === 0);
        if (!giaPresente) {
          const backupHeader = backupList.find(
            item => String(item.ID_cliente) === String(selectedAthlete.value) &&
            String(item.num_scheda) === String(selectedSheet.value) &&
            (item.des_giorno || '').trim() === g &&
            parseInt(item.num_riga_giorno) === 0
          );
          if (backupHeader) {
            temporanei.push(applicaModificheLocali(backupHeader));
          }
        }
      });
    }

    listaAllenamenti.value = temporanei;

    // Ricalcola la settimana attiva globale
    const activeW = calcolaSettimanaAttivaGlobale(temporanei);
    settimanaAttiva.value = activeW;
    localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);

    filtraEserciziPerGiorno();
  } catch (error) {
    console.warn("Errore caricamento allenamenti da Firestore (quota esaurita), provo da backup locale:", error);
    const rawFiltrati = backupList.filter(
      item => String(item.ID_cliente) === String(selectedAthlete.value) && String(item.num_scheda) === String(selectedSheet.value)
    );
    const filtrati = rawFiltrati.map(applicaModificheLocali);
    listaAllenamenti.value = filtrati;

    // Ricalcola la settimana attiva globale
    const activeW = calcolaSettimanaAttivaGlobale(filtrati);
    settimanaAttiva.value = activeW;
    localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);

    filtraEserciziPerGiorno();
  } finally {
    caricamento.value = false;
  }
};

// Filtra ed ordina gli esercizi in base al giorno selezionato
const filtraEserciziPerGiorno = () => {
  const giorno = giornoSelezionato.value;

  // Cerca la riga di intestazione (num_riga_giorno === 0 oppure '0')
  headerGiorno.value = listaAllenamenti.value.find(
    item => (item.des_giorno || '').trim() === giorno && (parseInt(item.num_riga_giorno) === 0)
  ) || null;

  // Cerca gli esercizi reali del giorno (num_riga_giorno > 0)
  const filtrati = listaAllenamenti.value.filter(
    item => (item.des_giorno || '').trim() === giorno && (parseInt(item.num_riga_giorno) > 0)
  );

  // Ordina per num_riga_giorno numerico
  filtrati.sort((a, b) => {
    const rigaA = parseInt(a.num_riga_giorno) || 0;
    const rigaB = parseInt(b.num_riga_giorno) || 0;
    return rigaA - rigaB;
  });

  eserciziFiltrati.value = filtrati;
};

// Salva e filtra quando si cambia scheda/giorno
const salvaGiornoSelezionato = (giorno) => {
  localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giorno);
  filtraEserciziPerGiorno();
};

onMounted(() => {
  caricaAllenamenti();
});

// Ascolta cambiamenti globali
watch([selectedAthlete, selectedSheet], () => {
  caricaAllenamenti();
});

// Naviga al dettaglio dell'esercizio
const vaiAlDettaglio = (id) => {
  vibraTattile(10);
  router.push({ name: 'DettaglioWorkout', params: { id } });
};

const vaiAlDettaglioSessione = (id) => {
  if (id) {
    vibraTattile(12);
    router.push({ name: 'DettaglioSessione', params: { id } });
  }
};

const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
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

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Card del Giorno (Riga 0) stile AppSheet */
.day-header-card {
  border-left: 6px solid #f97316 !important;
  background: rgba(249, 115, 22, 0.1) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.clickable-header {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease !important;
}

.clickable-header:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.4) !important;
}

.giorno-big-letter {
  background: linear-gradient(135deg, #e65100, #ff8f00);
  color: white;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 900;
  font-size: 1.5rem;
  box-shadow: 0 4px 10px rgba(230, 81, 0, 0.3);
  flex-shrink: 0;
}

/* Card Esercizio */
.exercise-item-card {
  /* Eredita Glassmorphism globale da style.css */
  cursor: pointer;
}

.thumbnail-wrapper {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
}

.leading-tight {
  line-height: 1.25;
}

.min-width-0 {
  min-width: 0;
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

/* Stili per il box telemetria */
.bg-orange-darken-3-op {
  background: rgba(249, 115, 22, 0.08) !important;
}
.border-orange-darken-3-op {
  border: 1px solid rgba(249, 115, 22, 0.2) !important;
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
.text-super-caption {
  font-size: 0.65rem !important;
  letter-spacing: 0.04em;
}
.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* Segmenti capsule per il progresso delle settimane */
.mini-weeks-progression {
  margin-top: 2px !important;
}

.mini-week-capsule {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  min-width: 25px;
  height: 15px;
}

.capsule-completed {
  background: rgba(16, 185, 129, 0.18) !important;
  border: 1px solid rgba(16, 185, 129, 0.45) !important;
  color: #10b981 !important;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.12);
}

.capsule-active {
  background: linear-gradient(135deg, #ea580c, #f97316) !important;
  color: white !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
  transform: scale(1.05);
}

.capsule-pending {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #cbd5e1 !important;
  opacity: 0.75;
}

.capsule-num {
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}
</style>