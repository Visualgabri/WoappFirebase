<template>
  <div v-if="overviewData" class="pr-overview-cards-wrapper w-100 min-width-0">
    <div class="d-flex align-stretch gap-2 w-100 min-width-0">
      
      <!-- CARD 1: PR A X REPS -->
      <div 
        class="pr-overview-card pa-2.5 rounded-xl border d-flex flex-column justify-space-between transition-all cursor-pointer position-relative select-none"
        :class="{ 'card-glow-pr': isCurrentPR }"
        :style="card1Style"
        @click="$emit('click-pr', bestReal)"
        @contextmenu.prevent="$emit('click-pr', bestReal)"
        title="Visualizza dettaglio PR"
      >
        <div>
          <!-- Rigo Superiore: Titolo a sinistra, Icone + Carico in alto a destra -->
          <div class="d-flex align-center justify-space-between mb-1 gap-1 min-width-0">
            <!-- Sinistra: Titolo -->
            <div class="d-flex align-center gap-1 text-truncate min-width-0">
              <span class="text-super-caption font-weight-bold uppercase text-truncate text-amber-lighten-1" style="font-size: 0.52rem; letter-spacing: 0.02em;">
                PR A {{ cleanTargetReps }} REPS
              </span>
            </div>
            <!-- Destra: 🏆 + 📋 (se scheda attuale) + Carico -->
            <div class="d-flex align-center gap-1 text-no-wrap flex-shrink-0 font-weight-black text-amber-lighten-2" style="font-size: 0.82rem; line-height: 1;">
              <span style="font-size: 0.74rem; line-height: 1;">🏆</span>
              <span v-if="isCurrentPR" title="Scheda attuale" style="font-size: 0.68rem; line-height: 1;">📋</span>
              <span class="font-weight-black text-white ml-0.5" style="font-size: 0.88rem; line-height: 1;">
                {{ prWeightDisplay }}
              </span>
            </div>
          </div>

          <!-- Rigo Centrale: Reps effettive + Livello di Sforzo con lettera (es. (P)) -->
          <div class="d-flex align-baseline gap-1 text-truncate my-0.5">
            <span 
              v-if="prRepsDisplay"
              class="text-super-caption font-weight-bold text-truncate" 
              :class="isCurrentPR ? 'text-amber-lighten-3' : 'text-slate-300'"
              style="font-size: 0.62rem;"
            >
              {{ prRepsDisplay }}
            </span>
            <span 
              v-if="faticaLetter"
              class="text-super-caption font-weight-bold text-truncate" 
              :style="{ color: faticaColor + ' !important' }"
              style="font-size: 0.58rem;"
              :title="'Sforzo: ' + (bestReal?.fatica || '')"
            >
              ({{ faticaLetter }})
            </span>
          </div>

          <!-- Sotto al PR se presente (es. prestazione inferiore da scheda passata) -->
          <div 
            v-if="bestReal?.sottoPRText" 
            class="mt-0.5 text-super-caption text-orange-lighten-2 font-weight-regular text-truncate d-flex align-center gap-0.5" 
            style="font-size: 0.48rem; line-height: 1.1;"
          >
            <v-icon size="10" color="orange-lighten-2">mdi-trending-down</v-icon>
            <span class="text-truncate">{{ bestReal.sottoPRText }}</span>
          </div>
        </div>

        <!-- Rigo Inferiore: Angolo in basso a sinistra nel formato: Sch. [numero] · [tempo trascorso] -->
        <div class="mt-1 text-truncate">
          <span 
            class="text-super-caption font-weight-medium text-truncate" 
            :class="isCurrentPR ? 'text-green-accent-3' : 'text-slate-400'" 
            style="font-size: 0.50rem; line-height: 1.2;"
          >
            {{ card1ProvenienzaFormatted }}
          </span>
        </div>
      </div>

      <!-- CARD 2: 1RM ATTUALE / RECORD ASSOLUTO -->
      <div 
        class="pr-overview-card pa-2.5 rounded-xl border d-flex flex-column justify-space-between transition-all cursor-pointer position-relative select-none"
        :class="{ 'card-glow-1rm': isNewPeak }"
        :style="card2Style"
        @click="$emit('click-e1rm', bestE1RM?.id || bestE1RM)"
        title="Visualizza storico 1RM"
      >
        <div>
          <!-- Rigo Superiore: Titolo a sinistra, Icone + Carico 1RM in alto a destra -->
          <div class="d-flex align-center justify-space-between mb-1 gap-1 min-width-0">
            <!-- Sinistra: Titolo -->
            <div class="d-flex align-center gap-1 text-truncate min-width-0">
              <span class="text-super-caption font-weight-bold text-cyan-lighten-2 uppercase text-truncate" style="font-size: 0.52rem; letter-spacing: 0.02em;">
                {{ isCorpoLiberoPuro ? 'MAX REPS STORICO' : (mode === 'cronologia' ? 'RECORD ASSOLUTO' : '1RM ATTUALE') }}
              </span>
            </div>
            <!-- Destra: 👑 (se presente record) + 📋 (se scheda attuale) + Carico 1RM -->
            <div class="d-flex align-center gap-1 text-no-wrap flex-shrink-0 font-weight-black text-cyan-lighten-2" style="font-size: 0.82rem; line-height: 1;">
              <span v-if="mode === 'cronologia' || hasAbsoluteRecord || isNewPeak" style="font-size: 0.74rem; line-height: 1;">👑</span>
              <span v-if="isNewPeak" title="Scheda attuale" style="font-size: 0.68rem; line-height: 1;">📋</span>
              <span class="font-weight-black text-cyan-lighten-2 ml-0.5" style="font-size: 0.88rem; line-height: 1;">
                {{ e1rmDisplay }}
              </span>
            </div>
          </div>

          <!-- Rigo Centrale: Origine Calcolo + Fatica + Badge Picco -->
          <div class="d-flex align-center justify-space-between gap-1 text-truncate my-0.5">
            <div class="d-flex align-center gap-1 text-truncate">
              <span 
                v-if="bestE1RM?.calcoloBaseShort"
                class="text-super-caption font-weight-bold rounded px-1 text-truncate"
                :class="isNewPeak ? 'text-cyan-950 bg-cyan-300' : 'text-cyan-200'"
                :style="isNewPeak ? 'font-size: 0.44rem; letter-spacing: 0.01em; padding: 1px 4px; white-space: nowrap;' : 'font-size: 0.44rem; background: rgba(6, 182, 212, 0.2); letter-spacing: 0.01em; padding: 1px 4px; white-space: nowrap;'"
              >
                da {{ bestE1RM.calcoloBaseShort }}
              </span>
              <span 
                v-if="e1rmFaticaLetter"
                class="text-super-caption font-weight-bold text-truncate" 
                :style="{ color: e1rmFaticaColor + ' !important' }"
                style="font-size: 0.54rem;"
                :title="'Sforzo: ' + (bestE1RM?.fatica || '')"
              >
                ({{ e1rmFaticaLetter }})
              </span>
            </div>
            <span v-if="isNewPeak && mode !== 'cronologia'" class="text-super-caption font-weight-bold text-green-accent-3 text-no-wrap" style="font-size: 0.46rem;">
              Picco assoluto
            </span>
          </div>

          <!-- Barra Progresso verso il Record Assoluto (solo per proposta carico) -->
          <div v-if="mode === 'proposta' && bestE1RM?.e1rmProximityPct" class="mt-1">
            <div class="d-flex align-center justify-space-between text-super-caption font-weight-bold text-cyan-lighten-3 mb-0.5" style="font-size: 0.45rem; line-height: 1;">
              <span>{{ bestE1RM.e1rmProximityPct }}%</span>
              <span v-if="!isNewPeak && bestE1RM.maxDeltaKg">-{{ bestE1RM.maxDeltaKg }} kg</span>
              <span v-else-if="isNewPeak" class="text-green-accent-3 font-weight-black">100%</span>
            </div>
            <div 
              class="w-100 rounded-pill overflow-hidden" 
              style="height: 3px; background: rgba(255, 255, 255, 0.08);"
            >
              <div 
                class="h-100 rounded-pill transition-all" 
                :style="{ 
                  width: bestE1RM.e1rmProximityPct + '%', 
                  background: isNewPeak ? 'linear-gradient(90deg, #10b981, #34d399)' : 'linear-gradient(90deg, #06b6d4, #22d3ee)' 
                }"
              ></div>
            </div>
          </div>
        </div>

        <!-- Rigo Inferiore: Angolo in basso a sinistra nel formato: Sch. [numero] · [tempo trascorso] -->
        <div class="mt-1 text-truncate">
          <span 
            class="text-super-caption font-weight-medium text-truncate" 
            :class="isNewPeak ? 'text-green-accent-3' : 'text-cyan-lighten-3'" 
            style="font-size: 0.50rem; line-height: 1.2;"
          >
            {{ card2ProvenienzaFormatted }}
          </span>
        </div>
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

// Flag Scheda Attuale
const isCurrentPR = computed(() => Boolean(bestReal.value?.isCurrentPR));
const isNewPeak = computed(() => Boolean(bestE1RM.value?.isNewPeak));

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

// Reps PR
const prRepsDisplay = computed(() => {
  if (!bestReal.value) return '';
  const r = bestReal.value.reps;
  if (!r) return '';
  const isDiff = String(r).replace(/r$/i, '') !== cleanTargetReps.value;
  return isDiff ? `x${String(r).replace(/r$/i, '')}r` : `x${r}r`;
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
const e1rmFaticaLetter = computed(() => parseFaticaLetter(bestE1RM.value?.fatica));
const e1rmFaticaColor = computed(() => parseFaticaColor(bestE1RM.value?.fatica));

// 1RM Carico Display
const e1rmDisplay = computed(() => {
  if (!bestE1RM.value) return '-';
  return bestE1RM.value.display || '-';
});

// Formattazione tempo trascorso abbreviato
const formatTimeAgo = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return '';
  const now = new Date();
  const diffMs = now - d;
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) return 'oggi';
  if (diffDays === 1) return '1g fa';
  if (diffDays < 7) return `${diffDays}g fa`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks}set fa`;
  const diffMonths = Math.floor(diffDays / 30.4375);
  if (diffMonths < 12) return `${diffMonths}m fa`;
  const diffYears = Math.floor(diffDays / 365.25);
  return `${diffYears}a fa`;
};

// Formato standard: Sch. [numero] · [tempo trascorso abbreviato]
const card1ProvenienzaFormatted = computed(() => {
  if (!bestReal.value) return 'Storico';
  const sNum = isCurrentPR.value ? (props.workout?.num_scheda || bestReal.value.sheet) : bestReal.value.sheet;
  const sNumStr = sNum ? `Sch. ${sNum}` : 'Sch. -';
  
  if (isCurrentPR.value) {
    const timeAgo = bestReal.value.date ? formatTimeAgo(bestReal.value.date) : '';
    return timeAgo && timeAgo !== 'oggi' ? `${sNumStr} · ${timeAgo}` : `${sNumStr} · questa scheda`;
  }
  
  const timeAgo = bestReal.value.date ? formatTimeAgo(bestReal.value.date) : (bestReal.value.tempoTrascorso || 'Storico');
  return `${sNumStr} · ${timeAgo}`;
});

const card2ProvenienzaFormatted = computed(() => {
  if (!bestE1RM.value) return 'Storico';
  const sNum = isNewPeak.value ? (props.workout?.num_scheda || bestE1RM.value.sheet) : bestE1RM.value.sheet;
  const sNumStr = sNum ? `Sch. ${sNum}` : 'Sch. -';
  
  if (isNewPeak.value) {
    const timeAgo = bestE1RM.value.date ? formatTimeAgo(bestE1RM.value.date) : '';
    return timeAgo && timeAgo !== 'oggi' ? `${sNumStr} · ${timeAgo}` : `${sNumStr} · questa scheda`;
  }
  
  const timeAgo = bestE1RM.value.date ? formatTimeAgo(bestE1RM.value.date) : (bestE1RM.value.tempoTrascorso || 'Storico');
  return `${sNumStr} · ${timeAgo}`;
});

// Stili dinamici e Glow elegante
const card1Style = computed(() => {
  if (isCurrentPR.value) {
    return {
      background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.22) 0%, rgba(217, 119, 6, 0.10) 100%) !important',
      borderColor: 'rgba(245, 158, 11, 0.70) !important',
      boxShadow: '0 0 16px rgba(245, 158, 11, 0.22), inset 0 0 12px rgba(245, 158, 11, 0.06)',
      flex: '1 1 0%',
      minWidth: '0'
    };
  }
  return {
    background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%) !important',
    borderColor: 'rgba(245, 158, 11, 0.35) !important',
    flex: '1 1 0%',
    minWidth: '0'
  };
});

const card2Style = computed(() => {
  if (isNewPeak.value) {
    return {
      background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(6, 182, 212, 0.08) 100%) !important',
      borderColor: 'rgba(6, 182, 212, 0.70) !important',
      boxShadow: '0 0 16px rgba(6, 182, 212, 0.22), inset 0 0 12px rgba(6, 182, 212, 0.06)',
      flex: '1 1 0%',
      minWidth: '0'
    };
  }
  return {
    background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%) !important',
    borderColor: 'rgba(6, 182, 212, 0.35) !important',
    flex: '1 1 0%',
    minWidth: '0'
  };
});
</script>

<style scoped>
.pr-overview-cards-wrapper {
  margin-bottom: 10px;
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
