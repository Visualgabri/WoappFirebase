<template>
  <v-container class="px-3 pt-1 pb-4 max-width-container bg-slate-50 min-height-screen pb-12">
    <!-- Header -->
    <div class="d-flex align-center justify-space-between appsheet-top-bar mb-3">
      <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight">Infortuni & Comfort</h1>
      <v-btn icon color="slate-dark" variant="text" @click="vibraTattile(10); syncInfortuniListener()"><v-icon>mdi-refresh</v-icon></v-btn>
    </div>

    <!-- Se l'atleta non è selezionato (solo se Coach) -->
    <div v-if="ruolo === 'coach' && !selectedAthlete" class="text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="64" color="orange" class="mb-4">mdi-account-search-outline</v-icon>
      <h3 class="text-h6 font-weight-bold text-slate-dark">Nessun atleta selezionato</h3>
      <p class="text-caption text-muted mt-2">Vai nella scheda <strong>Ricerca Wo</strong> per scegliere un atleta.</p>
    </div>

    <div v-else class="infortuni-content">
      <!-- Info Atleta Attivo -->
      <v-card class="mb-4 pa-3 card-glass border border-soft rounded-xl text-left" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.05) 0%, rgba(249, 115, 22, 0.02) 100%);">
        <div class="d-flex align-center justify-space-between">
          <div>
            <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Atleta Monitorato</span>
            <h2 class="text-subtitle-1 font-weight-black text-slate-dark uppercase mt-0.5">
              👤 {{ getNomeAtleta(selectedAthlete) || 'Atleta' }}
            </h2>
          </div>
          <v-chip color="orange-darken-3" variant="tonal" size="small" class="font-weight-black">
            {{ activeInjuries.length }} ATTIVI
          </v-chip>
        </div>
      </v-card>

      <!-- Pulsante per mostrare il Form di Inserimento -->
      <v-btn
        v-if="!mostraFormNuovo"
        block
        color="red-darken-3"
        class="font-weight-black text-none rounded-xl text-white mb-4"
        style="height: 48px;"
        prepend-icon="mdi-plus-circle-outline"
        @click="apriFormNuovo"
      >
        Segnala Nuovo Infortunio / Fastidio
      </v-btn>

      <!-- Form per Inserimento Nuovo Infortunio (Espandibile) -->
      <v-expand-transition>
        <v-card v-if="mostraFormNuovo" class="card-glass border border-soft rounded-xl mb-4 text-left pa-4">
          <div class="d-flex align-center justify-space-between mb-3 border-bottom-soft pb-2">
            <span class="font-weight-black text-subtitle-1 text-slate-dark d-flex align-center gap-2">
              <v-icon color="red-lighten-2">mdi-bandage</v-icon> Registra Fastidio / Infortunio
            </span>
            <v-btn icon="mdi-close" variant="text" size="small" @click="mostraFormNuovo = false"></v-btn>
          </div>

          <!-- Articolazione Coinvolta -->
          <div class="mb-3">
            <span class="text-caption font-weight-black d-block mb-1 text-slate-dark">Articolazione / Zona coinvolta *</span>
            <v-chip-group
              v-model="nuovoArticolazione"
              column
              mandatory
              color="red-lighten-2"
              selected-class="font-weight-black text-white bg-red-darken-3"
            >
              <v-chip
                v-for="art in listaArticolazioni"
                :key="art"
                :value="art"
                size="small"
                variant="outlined"
                class="rounded-lg"
              >
                {{ art }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Livello Dolore (1-10) -->
          <div class="mb-3">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-caption font-weight-black text-slate-dark">Intensità Dolore / Fastidio (1-10) *</span>
              <v-chip
                :color="nuovoGravita <= 3 ? 'green' : (nuovoGravita <= 7 ? 'amber-darken-2' : 'red-darken-2')"
                size="x-small"
                class="font-weight-black text-white"
                variant="flat"
              >
                {{ nuovoGravita }}/10 - {{ nuovoGravita <= 3 ? 'Lieve' : (nuovoGravita <= 7 ? 'Moderato' : 'Acuto / Stop') }}
              </v-chip>
            </div>
            <v-chip-group
              v-model="nuovoGravita"
              column
              mandatory
              color="red-lighten-2"
              selected-class="font-weight-black text-white bg-red-darken-3"
            >
              <v-chip
                v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                :key="num"
                :value="num"
                size="small"
                variant="outlined"
                class="rounded-lg px-2"
                style="min-width: 32px; justify-content: center;"
              >
                {{ num }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Note/Dettagli dell'infortunio -->
          <div class="mb-4">
            <span class="text-caption font-weight-black d-block mb-1 text-slate-dark">Note / Descrizione dell'accaduto</span>
            <v-textarea
              v-model="nuovoNote"
              placeholder="Indica quando è successo e cosa hai sentito (es. dolore spalla dx durante la panca, avvertita fitta...)"
              variant="outlined"
              density="comfortable"
              rows="3"
              rounded="lg"
              hide-details
              color="red-lighten-2"
            ></v-textarea>
          </div>

          <!-- Esercizi Coinvolti (opzionale) -->
          <div class="mb-4">
            <span class="text-caption font-weight-black d-block mb-1 text-slate-dark">Esercizi in cui si è verificato (es. Panca Piana)</span>
            <v-text-field
              v-model="nuovoEsercizio"
              placeholder="Nome esercizio (opzionale)"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              color="red-lighten-2"
            ></v-text-field>
          </div>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="slate" class="font-weight-bold text-none rounded-lg" @click="mostraFormNuovo = false">Annulla</v-btn>
            <v-btn
              variant="flat"
              color="red-darken-3"
              class="font-weight-black text-none rounded-lg px-4 text-white"
              @click="salvaNuovoInfortunio"
              :loading="salvando"
            >
              Registra Infortunio
            </v-btn>
          </div>
        </v-card>
      </v-expand-transition>

      <!-- SEZIONE 1: INFORTUNI ATTIVI -->
      <div class="text-left mb-6">
        <h3 class="text-subtitle-2 font-weight-black text-slate-dark uppercase tracking-wider mb-2">🩹 Infortuni Attivi</h3>
        
        <div v-if="activeInjuries.length === 0" class="text-center py-6 card-glass border border-soft rounded-xl text-slate">
          <v-icon color="grey-lighten-1" size="28" class="mb-2">mdi-checkbox-marked-circle-outline</v-icon>
          <p class="text-caption mb-0">Ottimo! Nessun infortunio o fastidio attivo registrato al momento.</p>
        </div>

        <div v-else class="d-flex flex-column gap-3">
          <v-card
            v-for="inf in activeInjuries"
            :key="inf.id"
            class="card-glass border border-soft rounded-xl pa-3 d-flex align-start"
            style="border-left: 4px solid rgba(239, 68, 68, 0.8) !important;"
          >
            <v-icon color="red-lighten-2" class="mr-3 mt-0.5">mdi-bandage</v-icon>
            <div class="flex-grow-1">
              <div class="d-flex align-center justify-space-between flex-wrap">
                <span class="font-weight-black text-slate-dark text-subtitle-2">
                  {{ inf.articolazione_coinvolta }}
                </span>
                <v-chip
                  :color="inf.gravita <= 3 ? 'green' : (inf.gravita <= 7 ? 'amber-darken-2' : 'red-darken-2')"
                  size="x-small"
                  class="font-weight-black text-white"
                >
                  Dolore: {{ inf.gravita }}/10
                </v-chip>
              </div>
              <span class="text-super-caption text-muted d-block mt-0.5">
                Segnalato il: {{ formattaData(inf.data_inizio) }}
              </span>
              <p v-if="inf.note" class="text-caption text-slate mt-2 mb-2 italic" style="border-left: 2px solid rgba(255,255,255,0.08); padding-left: 6px;">
                "{{ inf.note }}"
              </p>
              <div v-if="inf.esercizi_originari && inf.esercizi_originari.length > 0" class="mt-1">
                <span class="text-super-caption text-orange-lighten-2 font-weight-bold">
                  Esercizi coinvolti: {{ inf.esercizi_originari.join(', ') }}
                </span>
              </div>
              
              <!-- Azioni -->
              <div class="d-flex justify-end mt-2 pt-2 border-top-soft">
                <v-btn
                  variant="flat"
                  color="green-accent-4"
                  size="x-small"
                  class="font-weight-black text-none text-white rounded-lg"
                  prepend-icon="mdi-check-circle"
                  @click="risolviInfortunioClick(inf.id)"
                >
                  Segna come Guarito / Risolto
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>
      </div>

      <!-- SEZIONE 2: STORICO INFORTUNI RISOLTI -->
      <div class="text-left">
        <div class="d-flex align-center justify-space-between mb-2">
          <h3 class="text-subtitle-2 font-weight-black text-slate-dark uppercase tracking-wider">📜 Storico Guariti</h3>
          <v-chip size="x-small" variant="tonal" class="font-weight-black">{{ resolvedInjuries.length }} RISOLTI</v-chip>
        </div>

        <div v-if="resolvedInjuries.length === 0" class="text-center py-4 card-glass border border-soft rounded-xl text-slate">
          <p class="text-caption mb-0 text-muted">Nessun infortunio risolto nello storico.</p>
        </div>

        <div v-else class="d-flex flex-column gap-2">
          <v-card
            v-for="inf in resolvedInjuries"
            :key="inf.id"
            class="card-glass border border-soft rounded-xl pa-3 d-flex align-start"
            style="opacity: 0.65; border-left: 4px solid rgba(16, 185, 129, 0.5) !important;"
          >
            <v-icon color="green-lighten-2" class="mr-3 mt-0.5">mdi-check-circle-outline</v-icon>
            <div class="flex-grow-1">
              <div class="d-flex align-center justify-space-between flex-wrap">
                <span class="font-weight-bold text-slate-dark text-caption">
                  {{ inf.articolazione_coinvolta }} (Guarito)
                </span>
                <span class="text-super-caption text-muted font-weight-bold">
                  Gravità orig: {{ inf.gravita }}/10
                </span>
              </div>
              <span class="text-super-caption text-muted d-block mt-0.5">
                Periodo: {{ formattaData(inf.data_inizio) }} ➔ {{ formattaData(inf.data_risoluzione) }}
              </span>
              <p v-if="inf.note" class="text-super-caption text-slate mt-1.5 mb-0 italic">
                "{{ inf.note }}"
              </p>
            </div>
          </v-card>
        </div>
      </div>

    </div>
  </v-container>
</template>

<script setup>
import { ref, computed } from 'vue';
import { selectedAthlete, ruolo, getNomeAtleta, globalInfortuni, segnalaInfortunio, risolviInfortunio, syncInfortuniListener } from '../authStore.js';

const mostraFormNuovo = ref(false);
const salvando = ref(false);

const nuovoArticolazione = ref('Spalla');
const nuovoGravita = ref(3);
const nuovoNote = ref('');
const nuovoEsercizio = ref('');

const listaArticolazioni = [
  'Spalla',
  'Gomito',
  'Polso',
  'Cervicale / Collo',
  'Lombare / Schiena',
  'Anche / Bacino',
  'Ginocchio',
  'Caviglia',
  'Altro'
];

const activeInjuries = computed(() => {
  if (!globalInfortuni.value) return [];
  return globalInfortuni.value.filter(inf => inf.stato === 'attivo').sort((a,b) => new Date(b.data_inizio) - new Date(a.data_inizio));
});

const resolvedInjuries = computed(() => {
  if (!globalInfortuni.value) return [];
  return globalInfortuni.value.filter(inf => inf.stato === 'risolto').sort((a,b) => new Date(b.data_risoluzione) - new Date(a.data_risoluzione));
});

const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

const apriFormNuovo = () => {
  vibraTattile(10);
  nuovoArticolazione.value = 'Spalla';
  nuovoGravita.value = 3;
  nuovoNote.value = '';
  nuovoEsercizio.value = '';
  mostraFormNuovo.value = true;
};

const salvaNuovoInfortunio = async () => {
  salvando.value = true;
  vibraTattile(15);
  try {
    const payload = {
      articolazione_coinvolta: nuovoArticolazione.value,
      gravita: nuovoGravita.value,
      note: nuovoNote.value,
      esercizi_originari: nuovoEsercizio.value.trim() ? [nuovoEsercizio.value.trim()] : []
    };
    await segnalaInfortunio(payload);
    mostraFormNuovo.value = false;
  } catch (err) {
    console.error("Errore salvataggio nuovo infortunio:", err);
  } finally {
    salvando.value = false;
  }
};

const risolviInfortunioClick = async (id) => {
  vibraTattile(15);
  try {
    await risolviInfortunio(id);
  } catch (err) {
    console.error("Errore risoluzione infortunio:", err);
  }
};

const formattaData = (isoStr) => {
  if (!isoStr) return '-';
  try {
    const d = new Date(isoStr);
    return d.toLocaleDateString('it-IT', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch (e) {
    return isoStr;
  }
};
</script>

<style scoped>
.gap-2 {
  gap: 8px;
}
.gap-3 {
  gap: 12px;
}
.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}
.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}
</style>
