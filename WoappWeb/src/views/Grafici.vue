<template>
  <v-container class="px-3 py-6 max-width-container min-height-screen">
    <!-- Header Premium -->
    <div class="appsheet-header mb-6 d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-white elevation-1">
          <v-img src="https://visualgabri.github.io/Esercizi/WoApp/Immagini/A.png" alt="Superman G"></v-img>
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

    <!-- Contenuto dei Grafici (Sdoppiati Upper & Lower stile AppSheet) -->
    <div v-else>
      <div class="text-subtitle-1 font-weight-bold text-slate mb-6 d-flex align-center">
        <v-icon color="orange-darken-3" class="mr-2" size="22">mdi-account-circle-outline</v-icon>
        Atleta: <strong class="text-orange-darken-4 ml-1">{{ nomeAtleta }}</strong>
      </div>

      <!-- Indicatore di caricamento -->
      <div v-if="caricamento" class="text-center my-12">
        <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
        <p class="mt-2 text-caption text-muted">Elaborazione dati storici per i grafici...</p>
      </div>

      <div v-else-if="listaSchedeStoriche.length === 0" class="text-center my-12 py-6">
        <v-icon color="grey-lighten-1" size="48">mdi-chart-bar-stacked</v-icon>
        <p class="mt-2 text-caption text-muted">Nessun mesociclo registrato per questo atleta.</p>
      </div>

      <div v-else class="charts-stacked-layout">
        
        <!-- GRAFICO 1: Grafico mesocicli upper -->
        <v-card class="premium-chart-card rounded-2xl pa-4 mb-8 elevation-2" border="top">
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

        <!-- GRAFICO 2: Grafico mesocicli lower -->
        <v-card class="premium-chart-card rounded-2xl pa-4 mb-6 elevation-2" border="top">
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
    </div>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue';
import { collection, getDocs, query, where, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { selectedAthlete } from '../authStore.js';

// Chart.js e Vue-Chartjs
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// Stato
const atletaSelezionato = ref(selectedAthlete.value);
const nomeAtleta = ref('Gabriele Belmonte');
const caricamento = ref(true);

const listaSchedeStoriche = ref([]);
const chartDataReady = ref(false);

const upperChartData = ref({ labels: [], datasets: [] });
const lowerChartData = ref({ labels: [], datasets: [] });

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
  const clean = String(val).replace(/,/g, '.').replace(/[^\d.]/g, ' ').trim();
  const parts = clean.split(/\s+/);
  const num = parseFloat(parts[0]);
  return isNaN(num) ? 0 : num;
};

const parseReps = (val) => {
  if (!val) return 0;
  const clean = String(val).replace(/[^\d]/g, ' ').trim();
  const parts = clean.split(/\s+/);
  const num = parseInt(parts[0]);
  return isNaN(num) ? 0 : num;
};

// Carica ed aggrega i dati
const caricaDatiGrafici = async () => {
  if (!selectedAthlete.value) return;

  atletaSelezionato.value = selectedAthlete.value;
  caricamento.value = true;
  chartDataReady.value = false;

  try {
    // Cerca il nome dell'atleta
    const qAtleta = query(collection(db, 'UTENTI'), where('ID_cliente', '==', selectedAthlete.value));
    const snapAtleta = await getDocs(qAtleta);
    snapAtleta.forEach(d => {
      nomeAtleta.value = (d.data().email || '').split('@')[0].toUpperCase();
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

    // Ordina e limita i mesocicli (prendiamo gli ultimi 8 per rispecchiare fedelmente lo screenshot)
    const schedeOrdinate = Array.from(schedeSet).sort((a, b) => Number(a) - Number(b));
    const schedeInEvidenza = schedeOrdinate.slice(-8); // Prendi gli ultimi 8 mesocicli
    listaSchedeStoriche.value = schedeInEvidenza;

    // Struttura dati per accumulo
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

    // Mappa per individuare al volo l'indice del mesociclo nell'asse X
    const mappaIndiciSchede = {};
    schedeInEvidenza.forEach((s, index) => {
      mappaIndiciSchede[s] = index;
    });

    // Elabora ciascun workout storico
    tuttiWorkout.forEach(workout => {
      const numScheda = (workout.num_scheda || '').trim();
      
      // Considera solo se fa parte delle schede selezionate per l'asse X
      if (mappaIndiciSchede[numScheda] === undefined) return;

      const idxX = mappaIndiciSchede[numScheda];
      const settore = (workout.des_settore_princ || '').trim().toLowerCase();
      const muscolo = (workout.des_settore || '').trim().toLowerCase();

      // Calcola l'indice di volume per l'ultima settimana (W6)
      const peso = parseWeight(workout.ins_week6);
      const reps = parseReps(workout.reps_week6);
      
      // Calcolo volume index in kg (diviso per 100 per renderlo leggibile e in scala 10-80 come lo screenshot)
      const volumeIndex = parseFloat(((peso * reps) / 100).toFixed(1));

      // 1. Smista in UPPER BODY
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

      // 2. Smista in LOWER BODY
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

    // Arrotonda a un solo decimale
    const arrotondaArray = (arr) => arr.map(v => parseFloat(v.toFixed(1)));

    // Formatta per UPPER
    const upperDatasets = Object.keys(upperAggregato).map(key => ({
      label: key,
      data: arrotondaArray(upperAggregato[key]),
      backgroundColor: COLORI_UPPER[key],
      borderColor: BORDER_UPPER[key],
      borderWidth: 1.5,
      stack: 'upper',
      borderRadius: 4
    }));

    upperChartData.value = {
      labels: schedeInEvidenza.map(s => 'Wo ' + s),
      datasets: upperDatasets
    };

    // Formatta per LOWER
    const lowerDatasets = Object.keys(lowerAggregato).map(key => ({
      label: key,
      data: arrotondaArray(lowerAggregato[key]),
      backgroundColor: COLORI_LOWER[key],
      borderColor: BORDER_LOWER[key],
      borderWidth: 1.5,
      stack: 'lower',
      borderRadius: 4
    }));

    lowerChartData.value = {
      labels: schedeInEvidenza.map(s => 'Wo ' + s),
      datasets: lowerDatasets
    };

    chartDataReady.value = true;
  } catch (error) {
    console.error("Errore caricamento dati grafici:", error);
  } finally {
    caricamento.value = false;
  }
};

onMounted(() => {
  caricaDatiGrafici();
});

// Ascolta cambiamenti
watch(selectedAthlete, () => {
  caricaDatiGrafici();
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
          family: 'Outfit, sans-serif',
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
</style>