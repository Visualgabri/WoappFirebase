<template>
  <v-container 
    class="px-3 max-width-container min-height-screen"
    :class="layoutEserciziGlobal === 'super_compatto' ? 'py-2' : (layoutEserciziGlobal === 'compatto' ? 'py-4' : 'py-6')"
  >
    <!-- Header Premium -->
    <div 
      class="appsheet-header d-flex align-center justify-space-between"
      :class="layoutEserciziGlobal === 'super_compatto' ? 'mb-2' : (layoutEserciziGlobal === 'compatto' ? 'mb-4' : 'mb-6')"
    >
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-transparent border-orange elevation-1">
          <v-img src="/logo.png" alt="WoApp Logo"></v-img>
        </v-avatar>
        <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight">Grafici</h1>
      </div>
      <div class="header-actions">
        <v-btn icon color="slate-dark" variant="text" @click="caricaDatiGrafici"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>
    </div>

    <!-- Stato vuoto se non selezionato atleta -->
    <div v-if="!atletaSelezionato" class="empty-state text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="80" color="orange-lighten-3" class="mb-4 animate-bounce">mdi-chart-line</v-icon>
      <h3 class="text-h5 font-weight-bold text-slate-dark">Seleziona un Atleta</h3>
      <p class="text-body-1 text-muted mt-2">
        Vai nella scheda **Ricerca Wo** per scegliere l'atleta per il quale visualizzare i grafici storici.
      </p>
      <v-btn to="/ricerca" color="orange-darken-3" class="font-weight-bold text-none mt-6" rounded="lg">
        Seleziona Atleta
      </v-btn>
    </div>

    <!-- Contenuto dei Grafici -->
    <div v-else>
      <div 
        class="text-subtitle-1 font-weight-bold text-slate d-flex align-center justify-space-between mb-4"
      >
        <div class="d-flex align-center">
          <v-icon color="orange-darken-3" class="mr-2" size="22">mdi-account-circle-outline</v-icon>
          Atleta: <strong class="text-orange-darken-4 ml-1">{{ nomeAtleta || 'Caricamento...' }}</strong>
        </div>
      </div>

      <!-- Navigation Tabs -->
      <v-tabs v-model="activeTab" color="orange-darken-3" class="mb-4" align-tabs="start" grow>
        <v-tab value="volume" class="font-weight-black text-none">Volume Mesocicli</v-tab>
        <v-tab value="esercizio" class="font-weight-black text-none">Storico Esercizio</v-tab>
        <v-tab value="scheda" class="font-weight-black text-none">Analisi Scheda</v-tab>
      </v-tabs>

      <!-- Indicatore di caricamento -->
      <div v-if="caricamento" class="text-center my-12">
        <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
        <p class="mt-2 text-caption text-muted">Elaborazione dati storici per i grafici...</p>
      </div>

      <div v-else-if="listaSchedeStoriche.length === 0" class="text-center my-12 py-6">
        <v-icon color="grey-lighten-1" size="48">mdi-chart-bar-stacked</v-icon>
        <p class="mt-2 text-caption text-muted">Nessun mesociclo registrato per questo atleta.</p>
      </div>

      <div v-else>
        <!-- TAB 1: VOLUME MESOCICLI (Grafici storici aggregati) -->
        <div v-if="activeTab === 'volume'" class="charts-stacked-layout">
          <v-card 
            class="premium-chart-card rounded-2xl elevation-2 pa-4 mb-6" 
            border="top"
          >
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-subtitle-1 font-weight-black text-slate-dark d-flex align-center">
                <v-icon color="orange-darken-3" class="mr-2">mdi-hand-back-right-outline</v-icon>
                Grafico mesocicli upper
              </h3>
              <span class="text-caption text-muted">Unità: kg volume index</span>
            </div>

            <div class="chart-wrapper" style="position: relative; height: 320px; width: 100%;">
              <Bar
                v-if="chartDataReady"
                :data="upperChartData"
                :options="chartOptions"
              />
            </div>
          </v-card>

          <v-card 
            class="premium-chart-card rounded-2xl elevation-2 pa-4 mb-6" 
            border="top"
          >
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-subtitle-1 font-weight-black text-slate-dark d-flex align-center">
                <v-icon color="orange-darken-3" class="mr-2">mdi-run</v-icon>
                Grafico mesocicli lower
              </h3>
              <span class="text-caption text-muted">Unità: kg volume index</span>
            </div>

            <div class="chart-wrapper" style="position: relative; height: 320px; width: 100%;">
              <Bar
                v-if="chartDataReady"
                :data="lowerChartData"
                :options="chartOptions"
              />
            </div>
          </v-card>
        </div>

        <!-- TAB 2: STORICO ESERCIZIO (Grafico a linee per singolo esercizio con filtri) -->
        <div v-if="activeTab === 'esercizio'">
          <!-- Pannello di controllo -->
          <v-card class="premium-chart-card rounded-2xl elevation-2 pa-4 mb-6">
            <v-row dense>
              <v-col cols="12" md="6">
                <span class="text-caption text-muted font-weight-bold d-block mb-1">Esercizio</span>
                <v-autocomplete
                  v-model="esercizioSelezionato"
                  :items="listaEsercizi"
                  label="Cerca esercizio..."
                  variant="outlined"
                  rounded="lg"
                  color="orange-darken-3"
                  hide-details
                  density="comfortable"
                ></v-autocomplete>
              </v-col>
              <v-col cols="12" md="6">
                <span class="text-caption text-muted font-weight-bold d-block mb-1">Ripetizioni</span>
                <v-btn-toggle
                  v-model="tipoAnalisiEsercizio"
                  mandatory
                  color="orange-darken-3"
                  variant="outlined"
                  class="rounded-lg w-100 filter-btn-toggle"
                  density="comfortable"
                >
                  <v-btn value="tutte" class="flex-grow-1 font-weight-bold text-none text-caption">Tutte le reps</v-btn>
                  <v-btn value="stesse" class="flex-grow-1 font-weight-bold text-none text-caption">Stesse reps</v-btn>
                </v-btn-toggle>
              </v-col>
              <v-col cols="12" v-if="tipoAnalisiEsercizio === 'stesse'" class="mt-2">
                <span class="text-caption text-muted font-weight-bold d-block mb-1">Scegli quota ripetizioni</span>
                <v-select
                  v-model="repSelezionata"
                  :items="repsDisponibili"
                  label="Seleziona target reps..."
                  variant="outlined"
                  rounded="lg"
                  color="orange-darken-3"
                  hide-details
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </v-card>

          <!-- Grafico Linee Esercizio -->
          <v-card class="premium-chart-card rounded-2xl elevation-2 pa-4 mb-6">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-subtitle-1 font-weight-black text-slate-dark d-flex align-center">
                <v-icon color="orange-darken-3" class="mr-2">mdi-chart-line</v-icon>
                Progressione: {{ esercizioSelezionato }}
              </h3>
              <span class="text-caption text-muted">Unità: kg</span>
            </div>

            <div v-if="esercizioChartReady && esercizioChartData.labels.length > 0" class="chart-wrapper" style="position: relative; height: 320px; width: 100%;">
              <Line
                :data="esercizioChartData"
                :options="esercizioChartOptions"
              />
            </div>
            <div v-else class="text-center py-12 text-muted">
              <v-icon size="40" color="grey-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
              <p class="text-body-2">Nessun dato registrato per questo esercizio con la configurazione selezionata.</p>
            </div>
          </v-card>
        </div>

        <!-- TAB 3: ANALISI SCHEDA (Bilanciamento e progressive overload del mesociclo) -->
        <div v-if="activeTab === 'scheda'">
          <!-- Pannello di controllo -->
          <v-card class="premium-chart-card rounded-2xl elevation-2 pa-4 mb-6">
            <v-row dense>
              <v-col cols="12">
                <span class="text-caption text-muted font-weight-bold d-block mb-1">Mesociclo da analizzare</span>
                <v-select
                  v-model="mesocicloSelezionato"
                  :items="listaSchedeComplete"
                  item-title="title"
                  item-value="value"
                  label="Seleziona scheda..."
                  variant="outlined"
                  rounded="lg"
                  color="orange-darken-3"
                  hide-details
                  density="comfortable"
                ></v-select>
              </v-col>
            </v-row>
          </v-card>

          <!-- Grafico Distribuzione Volume (Doughnut) -->
          <v-card class="premium-chart-card rounded-2xl elevation-2 pa-4 mb-6">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-subtitle-1 font-weight-black text-slate-dark d-flex align-center">
                <v-icon color="orange-darken-3" class="mr-2">mdi-chart-donut</v-icon>
                Bilanciamento volume muscolare
              </h3>
              <span class="text-caption text-muted">In base a volume index W6</span>
            </div>

            <div v-if="doughnutChartReady" class="chart-wrapper" style="position: relative; height: 300px; width: 100%;">
              <Doughnut
                :data="doughnutChartData"
                :options="doughnutChartOptions"
              />
            </div>
            <div v-else class="text-center py-12 text-muted">
              <v-icon size="40" color="grey-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
              <p class="text-body-2">Nessun dato di volume rilevato in questo mesociclo.</p>
            </div>
          </v-card>

          <!-- Grafico Sovraccarico Progressivo Settimanale (Line) -->
          <v-card class="premium-chart-card rounded-2xl elevation-2 pa-4 mb-6">
            <div class="d-flex justify-space-between align-center mb-4">
              <h3 class="text-subtitle-1 font-weight-black text-slate-dark d-flex align-center">
                <v-icon color="orange-darken-3" class="mr-2">mdi-trending-up</v-icon>
                Andamento volume settimanale (Progressive Overload)
              </h3>
              <span class="text-caption text-muted">Unità: kg volume index cumulativo</span>
            </div>

            <div v-if="progressioneSettimanaleChartReady" class="chart-wrapper" style="position: relative; height: 320px; width: 100%;">
              <Line
                :data="progressioneSettimanaleChartData"
                :options="progressioneSettimanaleChartOptions"
              />
            </div>
            <div v-else class="text-center py-12 text-muted">
              <v-icon size="40" color="grey-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
              <p class="text-body-2">Nessun dato di progressione settimanale in questo mesociclo.</p>
            </div>
          </v-card>
        </div>

      </div>
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase.js';
import { selectedAthlete, getNomeAtleta, layoutEserciziGlobal } from '../authStore.js';

// Chart.js e Vue-Chartjs
import { Bar, Line, Doughnut } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement
);

// Stato principale
const atletaSelezionato = ref(selectedAthlete.value);
const nomeAtleta = ref(getNomeAtleta(selectedAthlete.value).toUpperCase() || '');
const caricamento = ref(true);
const activeTab = ref('volume');

// Cache dati completa storyboard
const tuttiWorkoutGlobal = ref([]);

// Liste schede storiche
const listaSchedeStoriche = ref([]);
const listaSchedeComplete = ref([]);

// Configurazione grafici principali
const chartDataReady = ref(false);
const upperChartData = ref({ labels: [], datasets: [] });
const lowerChartData = ref({ labels: [], datasets: [] });

// Stato Tab 2: Storico Esercizio
const listaEsercizi = ref([]);
const esercizioSelezionato = ref('');
const tipoAnalisiEsercizio = ref('tutte'); // 'tutte' o 'stesse'
const repSelezionata = ref(null);
const repsDisponibili = ref([]);
const filteredPointsLocal = ref([]);
const esercizioChartData = ref({ labels: [], datasets: [] });
const esercizioChartReady = ref(false);

// Stato Tab 3: Analisi Scheda (Mesociclo)
const mesocicloSelezionato = ref('');
const doughnutChartData = ref({ labels: [], datasets: [] });
const doughnutChartReady = ref(false);
const progressioneSettimanaleChartData = ref({ labels: [], datasets: [] });
const progressioneSettimanaleChartReady = ref(false);

// Mappature dei colori premium per i gruppi muscolari stile AppSheet
const COLORI_UPPER = {
  'DOR': 'rgba(230, 81, 0, 0.85)',       // Deep Orange
  'PET': 'rgba(197, 160, 0, 0.85)',      // Dark Yellow/Olive
  'SPA': 'rgba(30, 136, 229, 0.85)',     // Bright Blue
  'ADD': 'rgba(67, 160, 71, 0.85)',      // Green
  'TRI': 'rgba(236, 64, 122, 0.85)',     // Pink
  'BIC': 'rgba(126, 87, 194, 0.85)'      // Purple
};

const BORDER_UPPER = {
  'DOR': '#e65100',
  'PET': '#c5a000',
  'SPA': '#1e88e5',
  'ADD': '#43a047',
  'TRI': '#ec407a',
  'BIC': '#7e57c2'
};

const COLORI_LOWER = {
  'Quadricipiti': 'rgba(198, 40, 40, 0.85)',  // Red
  'Femorali': 'rgba(46, 125, 50, 0.85)',      // Dark Green
  'Adduttori': 'rgba(21, 101, 192, 0.85)',    // Dark Blue
  'Glutei': 'rgba(216, 27, 96, 0.85)',        // Magenta/Glutei pink
  'Gambe': 'rgba(109, 76, 65, 0.85)',         // Brown (generico polpacci/gambe)
  'Polpacci': 'rgba(120, 144, 156, 0.85)'     // Slate Grey
};

const BORDER_LOWER = {
  'Quadricipiti': '#c62828',
  'Femorali': '#2e7d32',
  'Adduttori': '#1565c0',
  'Glutei': '#d81b60',
  'Gambe': '#6d4c41',
  'Polpacci': '#78909c'
};

// Parser di sicurezza
const parseWeight = (val) => {
  if (!val) return 0;
  const clean = String(val).replace(/,/g, '.').trim();
  if (/^\d+(?:\.\d+)?\s*[rR]\b/i.test(clean) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(clean)) return 0;
  const cleanNum = clean.replace(/[^\d.]/g, ' ').trim();
  const parts = cleanNum.split(/\s+/);
  const num = parseFloat(parts[0]);
  return isNaN(num) ? 0 : num;
};

const parseReps = (val) => {
  if (!val) return 0;
  const clean = String(val).replace(/,/g, '.').trim();
  if (/^\d+(?:\.\d+)?\s*[rR]\b/i.test(clean) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(clean)) {
    const num = parseInt(clean);
    return isNaN(num) ? 0 : num;
  }
  const cleanNum = clean.replace(/[^\d]/g, ' ').trim();
  const parts = cleanNum.split(/\s+/);
  const num = parseInt(parts[0]);
  return isNaN(num) ? 0 : num;
};

const estraiRepsDaPrescrizione = (prescrizioneStr) => {
  if (!prescrizioneStr) return 0;
  const part = String(prescrizioneStr).split('|')[0].trim();
  const cleanPart = part.replace(/\([^)]+\)/g, '').trim();
  
  const matchX = cleanPart.match(/\d+\s*[xX]\s*(\d+)/);
  if (matchX) {
    return parseInt(matchX[1], 10);
  }
  
  const matchNum = cleanPart.match(/^(\d+)$/);
  if (matchNum) {
    return parseInt(matchNum[1], 10);
  }
  
  const matchFirstNum = cleanPart.match(/(\d+)/);
  if (matchFirstNum) {
    return parseInt(matchFirstNum[1], 10);
  }
  
  return 0;
};

// Carica ed aggrega i dati storici dell'atleta
const caricaDatiGrafici = async () => {
  if (!selectedAthlete.value) return;

  atletaSelezionato.value = selectedAthlete.value;
  caricamento.value = true;
  chartDataReady.value = false;

  try {
    const nomeMappato = getNomeAtleta(selectedAthlete.value);
    if (nomeMappato) {
      nomeAtleta.value = nomeMappato.toUpperCase();
    } else {
      nomeAtleta.value = '';
    }

    const qAtleta = query(collection(db, 'UTENTI'), where('ID_cliente', '==', selectedAthlete.value));
    const snapAtleta = await getDocs(qAtleta);
    snapAtleta.forEach(d => {
      if (!nomeMappato) {
        nomeAtleta.value = (d.data().email || '').split('@')[0].toUpperCase();
      }
    });

    // Recupera TUTTI i workout storici dell'atleta
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', selectedAthlete.value)
    );
    const querySnapshot = await getDocs(q);

    let tuttiWorkout = [];
    let schedeSet = new Set();

    querySnapshot.forEach(doc => {
      const data = doc.data();
      if (data.num_scheda) {
        tuttiWorkout.push(data);
        schedeSet.add(data.num_scheda.trim());
      }
    });

    tuttiWorkoutGlobal.value = tuttiWorkout;

    // Ordina tutti i mesocicli
    const schedeOrdinate = Array.from(schedeSet).sort((a, b) => Number(a) - Number(b));
    listaSchedeComplete.value = schedeOrdinate.map(s => ({
      title: `Scheda ${s}`,
      value: s
    }));

    // Prendi gli ultimi 8 mesocicli per la visualizzazione a barre complessiva
    const schedeInEvidenza = schedeOrdinate.slice(-8);
    listaSchedeStoriche.value = schedeInEvidenza;

    // Default selezione mesociclo per Tab 3
    if (schedeOrdinate.length > 0) {
      mesocicloSelezionato.value = schedeOrdinate[schedeOrdinate.length - 1];
    }

    // 1. Elabora dati per grafici BARRE STACKED UPPER & LOWER (Tab 1)
    const upperAggregato = {
      'DOR': Array(schedeInEvidenza.length).fill(0),
      'PET': Array(schedeInEvidenza.length).fill(0),
      'SPA': Array(schedeInEvidenza.length).fill(0),
      'ADD': Array(schedeInEvidenza.length).fill(0),
      'TRI': Array(schedeInEvidenza.length).fill(0),
      'BIC': Array(schedeInEvidenza.length).fill(0)
    };

    const lowerAggregato = {
      'Quadricipiti': Array(schedeInEvidenza.length).fill(0),
      'Femorali': Array(schedeInEvidenza.length).fill(0),
      'Adduttori': Array(schedeInEvidenza.length).fill(0),
      'Glutei': Array(schedeInEvidenza.length).fill(0),
      'Gambe': Array(schedeInEvidenza.length).fill(0)
    };

    const mappaIndiciSchede = {};
    schedeInEvidenza.forEach((s, index) => {
      mappaIndiciSchede[s] = index;
    });

    tuttiWorkout.forEach(workout => {
      const numScheda = (workout.num_scheda || '').trim();
      if (mappaIndiciSchede[numScheda] === undefined) return;

      const idxX = mappaIndiciSchede[numScheda];
      const settore = (workout.des_settore_princ || '').trim().toLowerCase();
      const muscolo = (workout.des_settore || '').trim().toLowerCase();

      const rawW6 = workout.ins_week6;
      const isRepStyle = rawW6 && (/^\d+(?:\.\d+)?\s*[rR]\b/i.test(String(rawW6).trim()) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(String(rawW6).trim()));
      const peso = isRepStyle ? 1 : parseWeight(rawW6);
      const reps = isRepStyle ? parseReps(rawW6) : parseReps(workout.reps_week6);
      const volumeIndex = parseFloat(((peso * reps) / 100).toFixed(1));

      // Smistamento Upper Body
      if (settore.includes('petto') || muscolo.includes('petto')) {
        upperAggregato['PET'][idxX] += volumeIndex;
      } else if (settore.includes('dorsali') || muscolo.includes('dorsali') || settore.includes('dor')) {
        upperAggregato['DOR'][idxX] += volumeIndex;
      } else if (settore.includes('spalle') || muscolo.includes('delt') || settore.includes('spalla')) {
        upperAggregato['SPA'][idxX] += volumeIndex;
      } else if (settore.includes('addome') || muscolo.includes('obliqui')) {
        upperAggregato['ADD'][idxX] += volumeIndex;
      } else if (settore.includes('tricipiti')) {
        upperAggregato['TRI'][idxX] += volumeIndex;
      } else if (settore.includes('bicipiti') || muscolo.includes('brachio')) {
        upperAggregato['BIC'][idxX] += volumeIndex;
      }
      // Smistamento Lower Body
      else if (muscolo.includes('quadricipiti')) {
        lowerAggregato['Quadricipiti'][idxX] += volumeIndex;
      } else if (muscolo.includes('femorali') || muscolo.includes('ischio')) {
        lowerAggregato['Femorali'][idxX] += volumeIndex;
      } else if (muscolo.includes('adduttori')) {
        lowerAggregato['Adduttori'][idxX] += volumeIndex;
      } else if (muscolo.includes('glutei') || muscolo.includes('gluteus')) {
        lowerAggregato['Glutei'][idxX] += volumeIndex;
      } else if (settore.includes('gambe') || muscolo.includes('polpacci') || muscolo.includes('soleo')) {
        lowerAggregato['Gambe'][idxX] += volumeIndex;
      }
    });

    const arrotondaArray = (arr) => arr.map(v => parseFloat(v.toFixed(1)));

    upperChartData.value = {
      labels: schedeInEvidenza.map(s => 'Wo ' + s),
      datasets: Object.keys(upperAggregato).map(key => ({
        label: key,
        data: arrotondaArray(upperAggregato[key]),
        backgroundColor: COLORI_UPPER[key],
        borderColor: BORDER_UPPER[key],
        borderWidth: 1.5,
        stack: 'upper',
        borderRadius: 4
      }))
    };

    lowerChartData.value = {
      labels: schedeInEvidenza.map(s => 'Wo ' + s),
      datasets: Object.keys(lowerAggregato).map(key => ({
        label: key,
        data: arrotondaArray(lowerAggregato[key]),
        backgroundColor: COLORI_LOWER[key],
        borderColor: BORDER_LOWER[key],
        borderWidth: 1.5,
        stack: 'lower',
        borderRadius: 4
      }))
    };

    chartDataReady.value = true;

    // 2. Popola ed elabora la lista degli esercizi per Tab 2
    const uniqueExSet = new Set();
    tuttiWorkout.forEach(w => {
      if (w.des_esercizio && Number(w.num_riga_giorno) > 0) {
        uniqueExSet.add(w.des_esercizio.trim());
      }
    });

    const mapNorm = new Map();
    uniqueExSet.forEach(ex => {
      const norm = ex.toLowerCase().replace(/\s+/g, ' ');
      if (!mapNorm.has(norm)) {
        mapNorm.set(norm, ex);
      }
    });

    listaEsercizi.value = Array.from(mapNorm.values()).sort((a, b) => a.localeCompare(b));

    if (listaEsercizi.value.length > 0) {
      if (!esercizioSelezionato.value || !listaEsercizi.value.includes(esercizioSelezionato.value)) {
        esercizioSelezionato.value = listaEsercizi.value[0];
      } else {
        aggiornaOpzioniEsercizio();
      }
    }

    // 3. Elabora i dati del mesociclo selezionato per Tab 3
    rigeneraGraficoMesociclo();

  } catch (error) {
    console.error("Errore caricamento dati grafici:", error);
  } finally {
    caricamento.value = false;
  }
};

// Logica Tab 2: Storico Esercizio
const aggiornaOpzioniEsercizio = () => {
  if (!esercizioSelezionato.value || tuttiWorkoutGlobal.value.length === 0) {
    repsDisponibili.value = [];
    repSelezionata.value = null;
    return;
  }

  const normSel = esercizioSelezionato.value.toLowerCase().trim();
  const repSet = new Set();

  tuttiWorkoutGlobal.value.forEach(w => {
    if (w.des_esercizio && w.des_esercizio.toLowerCase().trim() === normSel) {
      for (let wNum = 1; wNum <= 6; wNum++) {
        const rawIns = w[`ins_week${wNum}`];
        if (rawIns && parseWeight(rawIns) > 0) {
          let reps = 0;
          if (w[`reps_week${wNum}`]) {
            reps = parseReps(w[`reps_week${wNum}`]);
          } else if (w[`des_week${wNum}`]) {
            reps = estraiRepsDaPrescrizione(w[`des_week${wNum}`]);
          }
          if (reps > 0) {
            repSet.add(reps);
          }
        }
      }
    }
  });

  repsDisponibili.value = Array.from(repSet).sort((a, b) => a - b);
  if (repsDisponibili.value.length > 0) {
    if (repSelezionata.value === null || !repsDisponibili.value.includes(repSelezionata.value)) {
      repSelezionata.value = repsDisponibili.value[0];
    }
  } else {
    repSelezionata.value = null;
  }

  rigeneraGraficoEsercizio();
};

const rigeneraGraficoEsercizio = () => {
  esercizioChartReady.value = false;
  if (!esercizioSelezionato.value || tuttiWorkoutGlobal.value.length === 0) return;

  const normSel = esercizioSelezionato.value.toLowerCase().trim();

  // Filtra e ordina cronologicamente
  const records = tuttiWorkoutGlobal.value.filter(w => 
    w.des_esercizio && w.des_esercizio.toLowerCase().trim() === normSel
  ).sort((a, b) => {
    const sA = Number(a.num_scheda) || 0;
    const sB = Number(b.num_scheda) || 0;
    if (sA !== sB) return sA - sB;
    const gA = String(a.des_giorno || '').trim().toUpperCase();
    const gB = String(b.des_giorno || '').trim().toUpperCase();
    if (gA !== gB) return gA.localeCompare(gB);
    const rA = Number(a.num_riga_giorno) || 0;
    const rB = Number(b.num_riga_giorno) || 0;
    return rA - rB;
  });

  const dataPoints = [];

  records.forEach(w => {
    const numScheda = String(w.num_scheda || '').trim();
    for (let wNum = 1; wNum <= 6; wNum++) {
      const rawIns = w[`ins_week${wNum}`];
      const peso = parseWeight(rawIns);
      if (peso > 0) {
        let reps = 0;
        if (w[`reps_week${wNum}`]) {
          reps = parseReps(w[`reps_week${wNum}`]);
        } else if (w[`des_week${wNum}`]) {
          reps = estraiRepsDaPrescrizione(w[`des_week${wNum}`]);
        }

        if (reps > 0) {
          const e1rm = parseFloat((peso * (1 + reps / 30)).toFixed(1));
          dataPoints.push({
            label: `Wo ${numScheda} - W${wNum}`,
            peso: peso,
            reps: reps,
            e1rm: e1rm
          });
        }
      }
    }
  });

  let filteredPoints = [];
  if (tipoAnalisiEsercizio.value === 'stesse') {
    if (repSelezionata.value) {
      filteredPoints = dataPoints.filter(p => p.reps === repSelezionata.value);
    }
  } else {
    filteredPoints = dataPoints;
  }

  filteredPointsLocal.value = filteredPoints;

  const labels = filteredPoints.map(p => p.label);
  const dataCarico = filteredPoints.map(p => p.peso);
  const data1RM = filteredPoints.map(p => p.e1rm);

  const datasets = [];

  // Linea Carico Sollevato
  datasets.push({
    label: tipoAnalisiEsercizio.value === 'stesse' ? `Carico a ${repSelezionata.value} reps` : 'Carico sollevato',
    data: dataCarico,
    borderColor: '#f97316',
    backgroundColor: 'rgba(249, 115, 22, 0.06)',
    borderWidth: 3,
    pointBackgroundColor: '#ea580c',
    pointBorderColor: '#ffffff',
    pointRadius: 4,
    pointHoverRadius: 6,
    fill: true,
    tension: 0.15
  });

  // Linea 1RM stimato (solo in visualizzazione "Tutte le reps")
  if (tipoAnalisiEsercizio.value === 'tutte') {
    datasets.push({
      label: 'Massimale stimato (1RM)',
      data: data1RM,
      borderColor: '#38bdf8',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      pointBackgroundColor: '#0284c7',
      pointBorderColor: '#ffffff',
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: false,
      tension: 0.15
    });
  }

  esercizioChartData.value = {
    labels: labels,
    datasets: datasets
  };

  esercizioChartReady.value = true;
};

// Logica Tab 3: Analisi Scheda
const rigeneraGraficoMesociclo = () => {
  doughnutChartReady.value = false;
  progressioneSettimanaleChartReady.value = false;

  if (!mesocicloSelezionato.value || tuttiWorkoutGlobal.value.length === 0) return;

  const mSel = mesocicloSelezionato.value.trim();
  const workoutsScheda = tuttiWorkoutGlobal.value.filter(w => 
    w.num_scheda && w.num_scheda.trim() === mSel
  );

  // 1. Doughnut: Distribuzione Volume per Gruppo Muscolare
  const volPerMuscle = {};

  workoutsScheda.forEach(w => {
    const settore = (w.des_settore_princ || '').trim().toLowerCase();
    const muscolo = (w.des_settore || '').trim().toLowerCase();
    if (!settore && !muscolo && Number(w.num_riga_giorno) === 0) return;

    let gruppo = 'Altri';
    if (settore.includes('petto') || muscolo.includes('petto')) {
      gruppo = 'Pettorali';
    } else if (settore.includes('dorsali') || muscolo.includes('dorsali') || settore.includes('dor')) {
      gruppo = 'Dorsali';
    } else if (settore.includes('spalle') || muscolo.includes('delt') || settore.includes('spalla')) {
      gruppo = 'Spalle';
    } else if (settore.includes('addome') || muscolo.includes('obliqui')) {
      gruppo = 'Addome';
    } else if (settore.includes('tricipiti')) {
      gruppo = 'Tricipiti';
    } else if (settore.includes('bicipiti') || muscolo.includes('brachio')) {
      gruppo = 'Bicipiti';
    } else if (muscolo.includes('quadricipiti')) {
      gruppo = 'Quadricipiti';
    } else if (muscolo.includes('femorali') || muscolo.includes('ischio')) {
      gruppo = 'Femorali';
    } else if (muscolo.includes('adduttori')) {
      gruppo = 'Adduttori';
    } else if (muscolo.includes('glutei') || muscolo.includes('gluteus')) {
      gruppo = 'Glutei';
    } else if (settore.includes('gambe') || muscolo.includes('polpacci') || muscolo.includes('soleo')) {
      gruppo = 'Polpacci/Gambe';
    }

    const rawW6 = w.ins_week6;
    const isRepStyle = rawW6 && (/^\d+(?:\.\d+)?\s*[rR]\b/i.test(String(rawW6).trim()) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(String(rawW6).trim()));
    const peso = isRepStyle ? 1 : parseWeight(rawW6);
    const reps = isRepStyle ? parseReps(rawW6) : parseReps(w.reps_week6);
    const volumeIndex = parseFloat(((peso * reps) / 100).toFixed(1));

    if (volumeIndex > 0) {
      volPerMuscle[gruppo] = (volPerMuscle[gruppo] || 0) + volumeIndex;
    }
  });

  const COLORI_DOUGHNUT = {
    'Pettorali': 'rgba(197, 160, 0, 0.85)',      // Yellow
    'Dorsali': 'rgba(230, 81, 0, 0.85)',        // Deep Orange
    'Spalle': 'rgba(30, 136, 229, 0.85)',       // Blue
    'Addome': 'rgba(67, 160, 71, 0.85)',        // Green
    'Tricipiti': 'rgba(236, 64, 122, 0.85)',      // Pink
    'Bicipiti': 'rgba(126, 87, 194, 0.85)',       // Purple
    'Quadricipiti': 'rgba(198, 40, 40, 0.85)',   // Red
    'Femorali': 'rgba(46, 125, 50, 0.85)',       // Dark Green
    'Adduttori': 'rgba(21, 101, 192, 0.85)',     // Dark Blue
    'Glutei': 'rgba(216, 27, 96, 0.85)',         // Glutei pink
    'Polpacci/Gambe': 'rgba(109, 76, 65, 0.85)',  // Brown
    'Altri': 'rgba(120, 144, 156, 0.85)'         // Slate Grey
  };

  const labelsDoughnut = Object.keys(volPerMuscle).filter(k => volPerMuscle[k] > 0);
  const dataDoughnut = labelsDoughnut.map(k => parseFloat(volPerMuscle[k].toFixed(1)));
  const colorsDoughnut = labelsDoughnut.map(k => COLORI_DOUGHNUT[k] || 'rgba(120, 144, 156, 0.85)');
  const borderColorsDoughnut = colorsDoughnut.map(c => c.replace('0.85', '1.0'));

  doughnutChartData.value = {
    labels: labelsDoughnut,
    datasets: [{
      data: dataDoughnut,
      backgroundColor: colorsDoughnut,
      borderColor: borderColorsDoughnut,
      borderWidth: 1.5
    }]
  };
  doughnutChartReady.value = labelsDoughnut.length > 0;

  // 2. Line: Progressione Settimanale del Volume (W1-W6)
  const volPerWeek = Array(6).fill(0);

  workoutsScheda.forEach(w => {
    if (Number(w.num_riga_giorno) === 0) return; // Salta intestazione giorno
    for (let wNum = 1; wNum <= 6; wNum++) {
      const rawVal = w[`ins_week${wNum}`];
      const isRepStyle = rawVal && (/^\d+(?:\.\d+)?\s*[rR]\b/i.test(String(rawVal).trim()) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(String(rawVal).trim()));
      const peso = isRepStyle ? 1 : parseWeight(rawVal);
      const reps = isRepStyle ? parseReps(rawVal) : parseReps(w[`reps_week${wNum}`]);
      const volumeIndex = parseFloat(((peso * reps) / 100).toFixed(1));

      if (volumeIndex > 0) {
        volPerWeek[wNum - 1] += volumeIndex;
      }
    }
  });

  const roundedVolPerWeek = volPerWeek.map(v => parseFloat(v.toFixed(1)));

  progressioneSettimanaleChartData.value = {
    labels: ['Settimana 1', 'Settimana 2', 'Settimana 3', 'Settimana 4', 'Settimana 5', 'Settimana 6'],
    datasets: [{
      label: 'Volume cumulativo mesociclo',
      data: roundedVolPerWeek,
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.06)',
      borderWidth: 3,
      pointBackgroundColor: '#ea580c',
      pointBorderColor: '#ffffff',
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: true,
      tension: 0.15
    }]
  };

  progressioneSettimanaleChartReady.value = roundedVolPerWeek.some(v => v > 0);
};

onMounted(() => {
  caricaDatiGrafici();
});

// Watcher per cambi atleta
watch(selectedAthlete, () => {
  esercizioSelezionato.value = '';
  repSelezionata.value = null;
  mesocicloSelezionato.value = '';
  caricaDatiGrafici();
});

// Watcher per ri-analizzare l'esercizio o il mesociclo
watch(esercizioSelezionato, () => {
  aggiornaOpzioniEsercizio();
});

watch([tipoAnalisiEsercizio, repSelezionata], () => {
  rigeneraGraficoEsercizio();
});

watch(mesocicloSelezionato, () => {
  rigeneraGraficoMesociclo();
});

watch(activeTab, (newTab) => {
  if (newTab === 'esercizio') {
    aggiornaOpzioniEsercizio();
  } else if (newTab === 'scheda') {
    rigeneraGraficoMesociclo();
  }
});

// Configurazione opzioni grafici
const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#cbd5e1',
        boxWidth: 16,
        padding: 10,
        font: {
          weight: 'bold',
          family: 'sans-serif',
          size: 10
        }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          return ` ${context.dataset.label}: ${context.raw} kg`;
        }
      }
    }
  },
  scales: {
    x: {
      stacked: true,
      grid: { display: false },
      ticks: {
        color: '#94a3b8',
        font: { weight: 'bold', size: 11 }
      }
    },
    y: {
      stacked: true,
      grid: { color: 'rgba(255, 255, 255, 0.08)' },
      ticks: {
        color: '#94a3b8',
        callback: function(value) {
          return value + ' kg';
        }
      }
    }
  }
});

const esercizioChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: '#cbd5e1',
        font: { weight: 'bold', size: 10 }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const index = context.dataIndex;
          const datasetIndex = context.datasetIndex;
          const label = context.dataset.label;
          const val = context.raw;
          
          if (datasetIndex === 0 && tipoAnalisiEsercizio.value === 'tutte') {
            const pt = filteredPointsLocal.value[index];
            if (pt) {
              return ` Carico: ${pt.peso} kg (${pt.reps} reps)`;
            }
          }
          return ` ${label}: ${val} kg`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#94a3b8',
        font: { weight: 'bold', size: 9 }
      }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.08)' },
      ticks: {
        color: '#94a3b8',
        callback: function(value) {
          return value + ' kg';
        }
      }
    }
  }
});

const doughnutChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'right',
      labels: {
        color: '#cbd5e1',
        boxWidth: 12,
        font: { size: 10, weight: 'bold' }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const val = context.raw;
          const total = context.dataset.data.reduce((a, b) => a + b, 0);
          const percent = total > 0 ? ((val / total) * 100).toFixed(1) : 0;
          return ` ${context.label}: ${val} kg (${percent}%)`;
        }
      }
    }
  }
});

const progressioneSettimanaleChartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      callbacks: {
        label: function(context) {
          return ` Volume: ${context.raw} kg`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: '#94a3b8',
        font: { weight: 'bold', size: 10 }
      }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.08)' },
      ticks: {
        color: '#94a3b8',
        callback: function(value) {
          return value + ' kg';
        }
      }
    }
  }
});
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

.premium-chart-card {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  box-shadow: 0 12px 32px 0 rgba(0, 0, 0, 0.25) !important;
}

.card-glass {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(16px) !important;
  -webkit-backdrop-filter: blur(16px) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
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

.filter-btn-toggle {
  height: 48px;
  border-radius: 8px !important;
  border: 1px solid rgba(255, 255, 255, 0.12) !important;
}

.filter-btn-toggle .v-btn {
  height: 100% !important;
  border: none !important;
  color: #94a3b8 !important;
}

.filter-btn-toggle .v-btn--active {
  color: #ffffff !important;
}
</style>