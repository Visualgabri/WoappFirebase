<template>
  <div v-if="overviewData" class="pr-overview-cards-wrapper w-100 min-width-0">
    <div 
      class="rounded-xl border overflow-hidden d-flex flex-column w-100 min-width-0 position-relative"
      style="background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(2, 6, 23, 0.95) 100%); border-color: rgba(255, 255, 255, 0.12) !important; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);"
    >
      
      <!-- RIGO PRINCIPALE A DUE COLONNE SIMMETRICHE -->
      <div class="d-flex align-stretch w-100 min-width-0">
        <!-- COLONNA 1: PR A REPS TARGET (Ambra - Centrato) -->
        <div 
          class="pa-2.5 text-center d-flex flex-column justify-space-between transition-all cursor-pointer select-none min-width-0"
          :class="{ 'card-glow-pr': isCurrentPR }"
          :style="card1Style"
          @click="$emit('click-pr', bestReal)"
          @contextmenu.prevent="$emit('click-pr', bestReal)"
          title="Visualizza dettaglio PR"
        >
          <div>
            <!-- Titolo Centrato -->
            <div class="d-flex align-center justify-center mb-1 gap-1 min-width-0">
              <span class="text-super-caption font-weight-bold uppercase text-truncate text-amber-lighten-1" style="font-size: 0.52rem; letter-spacing: 0.03em;">
                🏆 {{ `RECORD ${cleanTargetReps} REPS` }}
              </span>
              <span v-if="isCurrentPR" title="Scheda attuale" style="font-size: 0.60rem; line-height: 1;">📋</span>
            </div>

            <!-- Valore Principale: 1RM Stimato in Grande -->
            <div class="d-flex align-center justify-center my-0.5 min-width-0">
              <span class="font-weight-black text-amber-300" style="font-size: 1.15rem; line-height: 1.1; letter-spacing: -0.02em;">
                <template v-if="hasPRRecord">
                  {{ isCorpoLiberoPuro ? prWeightDisplay : (prE1rmDisplay ? `${prE1rmDisplay}` : prWeightDisplay) }}
                </template>
                <template v-else>
                  --
                </template>
              </span>
              <span v-if="hasPRRecord && !isCorpoLiberoPuro && prE1rmDisplay" class="text-super-caption font-weight-bold ml-1 text-amber-200/80" style="font-size: 0.52rem; letter-spacing: 0.02em;">
                1RM
              </span>
            </div>

            <!-- Dettaglio Sotto: Peso Reale + Reps + Fatica -->
            <div class="d-flex align-center justify-center text-truncate mt-0.5 gap-0.5" style="line-height: 1.1;">
              <template v-if="hasPRRecord">
                <span class="text-super-caption font-weight-bold text-white text-truncate" style="font-size: 0.60rem;">
                  {{ prWeightDisplay }}
                </span>
                <span 
                  v-if="prRepsDisplay && !isCorpoLiberoPuro" 
                  class="text-super-caption font-weight-bold text-truncate text-amber-200/90" 
                  style="font-size: 0.58rem;"
                >
                  {{ prRepsDisplay }}
                </span>
                <span 
                  v-if="faticaLetter" 
                  class="text-super-caption font-weight-bold text-truncate" 
                  :style="{ color: faticaColor, fontSize: '0.58rem' }"
                  :title="`Fatica: ${bestReal?.fatica || faticaLetter}`"
                >
                  ({{ faticaLetter }})
                </span>
              </template>
              <template v-else>
                <span class="text-super-caption text-slate-400 text-truncate" style="font-size: 0.58rem;">
                  1° ciclo a {{ cleanTargetReps }} reps
                </span>
              </template>
            </div>
          </div>

          <!-- Rigo Inferiore Centrato: Sch. [num] · [tempo] -->
          <div class="mt-2 d-flex align-center justify-center gap-1.5 flex-wrap min-width-0">
            <span 
              class="text-super-caption font-weight-medium text-truncate" 
              :class="isCurrentPR ? 'text-green-accent-3' : 'text-slate-400'" 
              style="font-size: 0.48rem; line-height: 1.2;"
            >
              {{ card1ProvenienzaFormatted }}
            </span>
          </div>
        </div>

        <!-- COLONNA 2: MAX ASSOLUTO STORICO (Ciano - Centrato) -->
        <div 
          class="pa-2.5 text-center d-flex flex-column justify-space-between transition-all cursor-pointer select-none min-width-0"
          :class="{ 'card-glow-1rm': isNewPeak }"
          :style="card2Style"
          @click="$emit('click-e1rm', bestE1RM?.id || bestE1RM)"
          title="Visualizza storico 1RM"
        >
          <div>
            <!-- Titolo Centrato -->
            <div class="d-flex align-center justify-center mb-1 gap-1 min-width-0">
              <span class="text-super-caption font-weight-bold text-cyan-lighten-2 uppercase text-truncate" style="font-size: 0.52rem; letter-spacing: 0.03em;">
                ⚡ {{ isCorpoLiberoPuro ? 'MAX REPS ASSOLUTO' : 'MAX ASSOLUTO' }}
              </span>
              <span v-if="hasAbsoluteRecord || isNewPeak" style="font-size: 0.65rem; line-height: 1;">👑</span>
              <span v-if="isNewPeak" title="Scheda attuale" style="font-size: 0.60rem; line-height: 1;">📋</span>
            </div>

            <!-- Valore Principale: 1RM Storico in Grande -->
            <div class="d-flex align-center justify-center my-0.5 min-width-0">
              <span class="font-weight-black text-cyan-lighten-2" style="font-size: 1.15rem; line-height: 1.1; letter-spacing: -0.02em;">
                {{ isCorpoLiberoPuro ? maxAbsoluteWeightDisplay : (bestE1RM?.maxDisplay || maxAbsoluteWeightDisplay) }}
              </span>
              <span v-if="!isCorpoLiberoPuro" class="text-super-caption font-weight-bold ml-1 text-cyan-200/80" style="font-size: 0.52rem; letter-spacing: 0.02em;">
                1RM
              </span>
            </div>

            <!-- Dettaglio Sotto: Peso Reale Max Storico + Reps + Fatica -->
            <div class="d-flex align-center justify-center text-truncate mt-0.5 gap-0.5" style="line-height: 1.1;">
              <span class="text-super-caption font-weight-bold text-white text-truncate" style="font-size: 0.60rem;">
                {{ maxAbsoluteWeightDisplay }}
              </span>
              <span 
                v-if="maxAbsoluteRepsDisplay" 
                class="text-super-caption font-weight-bold text-truncate text-cyan-200/90" 
                style="font-size: 0.58rem;"
              >
                {{ maxAbsoluteRepsDisplay }}
              </span>
              <span 
                v-if="e1rmFaticaLetter" 
                class="text-super-caption font-weight-bold text-truncate" 
                :style="{ color: e1rmFaticaColor, fontSize: '0.58rem' }"
                :title="`Fatica: ${e1rmFaticaLetter}`"
              >
                ({{ e1rmFaticaLetter }})
              </span>
            </div>
          </div>

          <!-- Rigo Inferiore Centrato: Origine Record Storico (Sch. [num] · [tempo]) -->
          <div class="mt-2 d-flex align-center justify-center gap-1.5 flex-wrap min-width-0">
            <span 
              class="text-super-caption font-weight-medium text-truncate" 
              :class="isNewPeak ? 'text-green-accent-3' : 'text-cyan-lighten-3'" 
              style="font-size: 0.48rem; line-height: 1.2;"
            >
              {{ card2ProvenienzaFormatted }}
            </span>
          </div>
        </div>
      </div>

      <!-- BARRA PROGRESSO VERSO IL MIGLIOR 1RM STORICO (SENZA TESTI LUNGHI, CON % E KG IN EVIDENZA) -->
      <div 
        v-if="bestE1RM && !isCorpoLiberoPuro && bestE1RM.max1RM > 0" 
        class="px-3 py-1.5 border-top d-flex flex-column gap-1"
        style="background: rgba(2, 6, 23, 0.75); border-color: rgba(255, 255, 255, 0.08) !important;"
      >
        <div class="d-flex align-center justify-space-between w-100">
          <!-- Percentuale a sinistra -->
          <div class="d-flex align-center gap-1">
            <v-icon size="13" :color="isNewPeak ? 'green-accent-3' : 'cyan-accent-2'">mdi-chart-timeline-variant</v-icon>
            <span 
              class="font-weight-black text-truncate" 
              :class="isNewPeak ? 'text-green-accent-3' : 'text-cyan-accent-2'"
              style="font-size: 0.72rem; letter-spacing: 0.02em;"
            >
              {{ isNewPeak ? '100% RECORD RAGGIUNTO' : `${bestE1RM.e1rmProximityPct}% DEL PICCO 1RM` }}
            </span>
          </div>

          <!-- KG mancanti / nuovo record a destra ben in grande -->
          <div>
            <span 
              v-if="isNewPeak" 
              class="font-weight-black text-green-accent-3 px-1.5 py-0.5 rounded" 
              style="font-size: 0.68rem; background: rgba(34, 197, 94, 0.15); border: 1px solid rgba(34, 197, 94, 0.35);"
            >
              👑 NUOVO PICCO
            </span>
            <span 
              v-else-if="bestE1RM.maxDeltaKg" 
              class="font-weight-black text-cyan-lighten-1 px-1.5 py-0.5 rounded" 
              style="font-size: 0.70rem; background: rgba(6, 182, 212, 0.15); border: 1px solid rgba(6, 182, 212, 0.35);"
            >
              🎯 -{{ bestE1RM.maxDeltaKg }} kg
            </span>
          </div>
        </div>

        <v-progress-linear
          :model-value="isNewPeak ? 100 : bestE1RM.e1rmProximityPct"
          :color="isNewPeak ? 'green-accent-3' : 'cyan-lighten-1'"
          bg-color="rgba(255, 255, 255, 0.10)"
          height="3.5"
          rounded
        ></v-progress-linear>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  overviewData: {
    type: Object,
    default: null
  },
  workout: {
    type: Object,
    default: null
  },
  targetReps: {
    type: [Number, String],
    default: 10
  },
  mode: {
    type: String,
    default: 'proposta' // 'proposta' | 'cronologia'
  }
});

defineEmits(['click-pr', 'click-e1rm']);

// Sotto-oggetti
const bestReal = computed(() => props.overviewData?.bestReal || null);
const bestE1RM = computed(() => props.overviewData?.bestE1RM || null);
const isCorpoLiberoPuro = computed(() => Boolean(props.overviewData?.isCorpoLiberoPuro));

const cleanTargetReps = computed(() => {
  return String(props.targetReps || 10).replace(/r$/i, '');
});

// Helper per verificare se un numero di scheda corrisponde alla scheda corrente
const isCurrentSheet = (sheetVal) => {
  if (!sheetVal || !props.workout?.num_scheda) return false;
  return extractCleanSheetNum(sheetVal) === extractCleanSheetNum(props.workout.num_scheda);
};

// Flag Presenza Record Reps reale
const hasPRRecord = computed(() => {
  if (!bestReal.value) return false;
  if (isCorpoLiberoPuro.value) return Boolean(bestReal.value.reps && bestReal.value.reps > 0);
  return Boolean(bestReal.value.weight && bestReal.value.weight > 0);
});

// Flag Scheda Attuale
const isCurrentPR = computed(() => Boolean(
  hasPRRecord.value && (
    bestReal.value?.isCurrentPR || 
    bestReal.value?.isCurrent || 
    isCurrentSheet(bestReal.value?.sheet) || 
    (typeof bestReal.value?.date === 'string' && bestReal.value.date.toLowerCase().includes('questa scheda')) ||
    (typeof bestReal.value?.tempoTrascorso === 'string' && bestReal.value.tempoTrascorso.toLowerCase().includes('questa scheda'))
  )
));

const isNewPeak = computed(() => Boolean(
  bestE1RM.value?.isNewPeak || 
  isCurrentSheet(bestE1RM.value?.sheet) || 
  (typeof bestE1RM.value?.date === 'string' && bestE1RM.value.date.toLowerCase().includes('questa scheda')) ||
  (typeof bestE1RM.value?.tempoTrascorso === 'string' && bestE1RM.value.tempoTrascorso.toLowerCase().includes('questa scheda'))
));

// Presenza Record Assoluto
const hasAbsoluteRecord = computed(() => {
  if (!bestE1RM.value) return false;
  return (bestE1RM.value.max1RM > 0 || bestE1RM.value.currentE1RM > 0 || Boolean(bestE1RM.value.display && bestE1RM.value.display !== 'N.D.'));
});

// Carico PR
const prWeightDisplay = computed(() => {
  if (!bestReal.value) return '-';
  return bestReal.value.weightDisplay || (bestReal.value.weight > 0 ? `${bestReal.value.weight} kg` : `${bestReal.value.reps || cleanTargetReps.value}r`);
});

// Carico Reale Max Assoluto (Card 2)
const maxAbsoluteWeightDisplay = computed(() => {
  if (isCorpoLiberoPuro.value) {
    return bestE1RM.value?.display || '-';
  }
  if (bestE1RM.value?.rawWeight > 0) {
    return `${bestE1RM.value.rawWeight} kg`;
  }
  if (bestE1RM.value?.max1RM > 0) {
    return `${bestE1RM.value.max1RM} kg`;
  }
  return bestE1RM.value?.display || '-';
});

// Reps Reali Max Assoluto
const maxAbsoluteRepsDisplay = computed(() => {
  if (isCorpoLiberoPuro.value) return '';
  const r = bestE1RM.value?.rawReps;
  if (!r) return '';
  const rStr = String(r).replace(/r$/i, '');
  return `x${rStr}r`;
});

// Reps PR
const prRepsDisplay = computed(() => {
  if (!bestReal.value) return '';
  const r = bestReal.value.reps;
  if (!r) return '';
  const rStr = String(r).replace(/r$/i, '');
  return `x${rStr}r`;
});

// Helper Fatica
const parseFaticaLetter = (f) => {
  if (!f) return '';
  const fStr = String(f).trim().toLowerCase();
  if (fStr.startsWith('m')) return 'M';
  if (fStr.startsWith('p')) return 'P';
  if (fStr.startsWith('d')) return 'D';
  return String(f).trim().charAt(0).toUpperCase();
};

const parseFaticaColor = (f) => {
  if (!f) return '#94a3b8';
  const fStr = String(f).trim().toLowerCase();
  if (fStr === 'media' || fStr === 'm') return '#81c784'; // Verde
  if (fStr === 'pesante' || fStr === 'p') return '#ffb74d'; // Ambra
  if (fStr === 'devastante' || fStr === 'd') return '#ef4444'; // Rosso
  return '#fbbf24';
};

// Livello di sforzo / Fatica PR
const faticaLetter = computed(() => parseFaticaLetter(bestReal.value?.fatica));
const faticaColor = computed(() => parseFaticaColor(bestReal.value?.fatica));

// Livello di sforzo / Fatica 1RM
const e1rmFaticaLetter = computed(() => parseFaticaLetter(bestE1RM.value?.rawFatica || bestE1RM.value?.fatica));
const e1rmFaticaColor = computed(() => parseFaticaColor(bestE1RM.value?.rawFatica || bestE1RM.value?.fatica));

// 1RM Carico Display Card 2
const e1rmDisplay = computed(() => {
  if (!bestE1RM.value) return '-';
  return bestE1RM.value.display || '-';
});

// 1RM Stimato corrispondente al PR (Card 1)
const prE1rmDisplay = computed(() => {
  if (isCorpoLiberoPuro.value || !bestReal.value) return '';
  if (bestReal.value.e1rmDisplay) return bestReal.value.e1rmDisplay;
  if (bestReal.value.e1rm && bestReal.value.e1rm > 0) return `${bestReal.value.e1rm} kg`;
  const w = parseFloat(bestReal.value.weight);
  const r = parseInt(bestReal.value.reps || cleanTargetReps.value, 10);
  if (!w || isNaN(w) || w <= 0 || !r || isNaN(r) || r <= 0) return '';
  // Calcolo di fallback se non presente a monte
  const e1 = Math.round((w * (1 + r / 30)) * 10) / 10;
  return `${e1} kg`;
});

// Estrai solo il numero intero della scheda escludendo lettere (es. "12A" -> "12", "Scheda 5" -> "5")
const extractCleanSheetNum = (sheetVal) => {
  if (!sheetVal) return '';
  const match = String(sheetVal).match(/\d+/);
  return match ? match[0] : '';
};

// Formattazione tempo trascorso abbreviato (supporta Firestore Timestamp, Date, stringhe)
const formatTimeAgo = (dateVal) => {
  if (!dateVal) return '';
  let d = null;
  if (dateVal instanceof Date) {
    d = dateVal;
  } else if (dateVal && typeof dateVal.toDate === 'function') {
    d = dateVal.toDate();
  } else if (dateVal && typeof dateVal.seconds === 'number') {
    d = new Date(dateVal.seconds * 1000);
  } else if (typeof dateVal === 'string') {
    const s = dateVal.trim();
    if (s.toLowerCase().includes('questa scheda')) return 'questa scheda';
    if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(s)) {
      const parts = s.split(' ')[0].split('/');
      d = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const parts = s.substring(0, 10).split('-');
      d = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else {
      d = new Date(s);
    }
  } else {
    d = new Date(dateVal);
  }
  if (!d || isNaN(d.getTime())) {
    if (typeof dateVal === 'string') {
      return dateVal.trim();
    }
    return '';
  }
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'oggi';
  if (diffDays === 1) return '1g fa';
  if (diffDays < 7) return `${diffDays}g fa`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}w fa`;
  const diffMonths = Math.floor(diffDays / 30.4375);
  if (diffMonths < 12) return `${diffMonths}m fa`;
  const diffYears = Math.floor(diffDays / 365.25);
  return `${diffYears}a fa`;
};

// Formato standard: Sch. [numero] · [tempo trascorso abbreviato] (mostra solo il numero senza lettere e solo tempo trascorso)
const card1ProvenienzaFormatted = computed(() => {
  if (!hasPRRecord.value) return `Nuovo target ${cleanTargetReps.value}r`;
  const rawSheet = bestReal.value.sheet || props.workout?.num_scheda;
  const cleanNum = extractCleanSheetNum(rawSheet) || extractCleanSheetNum(props.workout?.num_scheda);
  const sNumStr = cleanNum ? `Sch. ${cleanNum}` : 'Sch. -';
  
  if (isCurrentPR.value || isCurrentSheet(rawSheet)) {
    return `${sNumStr} · questa scheda`;
  }
  
  const timeAgo = bestReal.value.date ? formatTimeAgo(bestReal.value.date) : formatTimeAgo(bestReal.value.tempoTrascorso);
  return timeAgo ? `${sNumStr} · ${timeAgo}` : `${sNumStr} · Storico`;
});

const card2ProvenienzaFormatted = computed(() => {
  if (!bestE1RM.value) return 'Storico';
  const rawSheet = bestE1RM.value.sheet || props.workout?.num_scheda;
  const cleanNum = extractCleanSheetNum(rawSheet) || extractCleanSheetNum(props.workout?.num_scheda);
  const sNumStr = cleanNum ? `Sch. ${cleanNum}` : 'Sch. -';
  
  if (isNewPeak.value || isCurrentSheet(rawSheet)) {
    return `${sNumStr} · questa scheda`;
  }
  
  const timeAgo = bestE1RM.value.date ? formatTimeAgo(bestE1RM.value.date) : formatTimeAgo(bestE1RM.value.tempoTrascorso);
  return timeAgo ? `${sNumStr} · ${timeAgo}` : `${sNumStr} · Storico`;
});

// Stili dinamici e Glow elegante
const card1Style = computed(() => {
  if (isCurrentPR.value) {
    return {
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.10) 100%) !important',
      borderRight: '1px solid rgba(255, 255, 255, 0.10)',
      boxShadow: 'inset 0 0 14px rgba(245, 158, 11, 0.15)',
      flex: '1 1 0%',
      minWidth: '0'
    };
  }
  return {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.10) 0%, rgba(217, 119, 6, 0.02) 100%) !important',
    borderRight: '1px solid rgba(255, 255, 255, 0.08)',
    flex: '1 1 0%',
    minWidth: '0'
  };
});

const card2Style = computed(() => {
  if (isNewPeak.value) {
    return {
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(6, 182, 212, 0.08) 100%) !important',
      boxShadow: 'inset 0 0 14px rgba(6, 182, 212, 0.15)',
      flex: '1 1 0%',
      minWidth: '0'
    };
  }
  return {
    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.10) 0%, rgba(6, 182, 212, 0.02) 100%) !important',
    flex: '1 1 0%',
    minWidth: '0'
  };
});
</script>

<style scoped>
.pr-overview-cards-wrapper {
  margin-top: 6px;
  margin-bottom: 14px;
}

.pr-overview-card {
  min-height: 80px;
}

.card-glow-pr {
  animation: pulse-pr-glow 3s infinite ease-in-out;
}

.card-glow-1rm {
  animation: pulse-1rm-glow 3s infinite ease-in-out;
}

@keyframes pulse-pr-glow {
  0%, 100% {
    box-shadow: 0 0 14px rgba(245, 158, 11, 0.20), inset 0 0 10px rgba(245, 158, 11, 0.05);
  }
  50% {
    box-shadow: 0 0 20px rgba(245, 158, 11, 0.32), inset 0 0 14px rgba(245, 158, 11, 0.09);
  }
}

@keyframes pulse-1rm-glow {
  0%, 100% {
    box-shadow: 0 0 14px rgba(6, 182, 212, 0.20), inset 0 0 10px rgba(6, 182, 212, 0.05);
  }
  50% {
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.32), inset 0 0 14px rgba(6, 182, 212, 0.09);
  }
}
</style>
