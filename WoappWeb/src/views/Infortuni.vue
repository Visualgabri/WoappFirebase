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
        Segnala Nuovo Fastidio / Infortunio
      </v-btn>

      <!-- Form per Inserimento/Modifica Infortunio (Espandibile) -->
      <v-expand-transition>
        <v-card v-if="mostraFormNuovo" class="card-glass border border-soft rounded-xl mb-4 text-left pa-4">
          <div class="d-flex align-center justify-space-between mb-3 border-bottom-soft pb-2">
            <span class="font-weight-black text-subtitle-1 text-slate-dark d-flex align-center gap-2">
              <v-icon color="red-lighten-2">mdi-bandage</v-icon>
              {{ infortunioInModificaId ? 'Modifica Fastidio / Infortunio' : 'Registra Fastidio / Infortunio' }}
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
                {{ nuovoGravita }}/10 - {{ nuovoGravita <= 2 ? 'Lievissimo' : (nuovoGravita <= 4 ? 'Fastidio Lieve' : (nuovoGravita <= 7 ? 'Moderato' : 'Acuto / Stop')) }}
              </v-chip>
            </div>
            <v-chip-group
              v-model="nuovoGravita"
              column
              mandatory
              color="red-lighten-2"
              selected-class="font-weight-black text-white bg-red-darken-3"
              @update:model-value="onGravitaChange"
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

          <!-- Riduzione Carico Custom (3A + 3C) -->
          <div class="mb-3 pa-3 rounded-lg border border-soft" style="background: rgba(255, 255, 255, 0.03);">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-caption font-weight-black text-slate-dark d-flex align-center gap-1">
                🛡️ Applica Riduzione Carico
              </span>
              <v-switch
                v-model="nuovoApplicaRiduzione"
                color="orange-darken-2"
                density="compact"
                hide-details
                inset
              ></v-switch>
            </div>

            <div v-if="nuovoApplicaRiduzione" class="mt-2">
              <span class="text-super-caption text-muted font-weight-bold d-block mb-1">
                Percentuale di riduzione consigliata:
              </span>
              <v-chip-group
                v-model="nuovoPercentuale"
                column
                mandatory
                selected-class="font-weight-black text-white bg-orange-darken-3"
              >
                <v-chip
                  v-for="pct in [0, 10, 15, 20, 25, 30, 40]"
                  :key="pct"
                  :value="pct"
                  size="small"
                  variant="outlined"
                  class="rounded-lg"
                >
                  {{ pct === 0 ? '0% (Solo avviso)' : '-' + pct + '%' }}
                </v-chip>
              </v-chip-group>
            </div>
            <div v-else class="text-super-caption text-muted italic mt-1">
              * La segnalazione verrà registrata per monitoraggio, ma non taglierà il peso nei suggerimenti.
            </div>
          </div>

          <!-- Note/Dettagli dell'infortunio -->
          <div class="mb-4">
            <span class="text-caption font-weight-black d-block mb-1 text-slate-dark">Note / Descrizione dell'accaduto</span>
            <v-textarea
              v-model="nuovoNote"
              placeholder="Indica quando è successo e cosa hai sentito (es. fastidio spalla dx durante panca...)"
              variant="outlined"
              density="comfortable"
              rows="2"
              rounded="lg"
              hide-details
              color="red-lighten-2"
            ></v-textarea>
          </div>

          <!-- Esercizi Coinvolti (opzionale) -->
          <div class="mb-4">
            <span class="text-caption font-weight-black d-block mb-1 text-slate-dark">Esercizi in cui si è verificato (es. Panca Piana)</span>
            <v-combobox
              v-model="nuovoEsercizio"
              :items="opzioniEsercizi"
              placeholder="Seleziona o cerca esercizio della scheda..."
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              color="red-lighten-2"
              no-data-text="Nessun esercizio trovato nella scheda"
            ></v-combobox>
          </div>

          <div class="d-flex justify-end gap-2">
            <v-btn variant="text" color="slate" class="font-weight-bold text-none rounded-lg" @click="mostraFormNuovo = false">Annulla</v-btn>
            <v-btn
              variant="flat"
              color="red-darken-3"
              class="font-weight-black text-none rounded-lg px-4 text-white"
              @click="salvaInfortunio"
              :loading="salvando"
            >
              {{ infortunioInModificaId ? 'Aggiorna Infortunio' : 'Registra Infortunio' }}
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
              <div class="d-flex align-center justify-space-between flex-wrap gap-1">
                <span class="font-weight-black text-slate-dark text-subtitle-2">
                  {{ inf.articolazione_coinvolta }}
                </span>
                <div class="d-flex align-center gap-1">
                  <v-chip
                    :color="inf.gravita <= 3 ? 'green' : (inf.gravita <= 7 ? 'amber-darken-2' : 'red-darken-2')"
                    size="x-small"
                    class="font-weight-black text-white"
                  >
                    Dolore: {{ inf.gravita }}/10
                  </v-chip>
                  <v-chip
                    v-if="inf.applica_riduzione !== false && (inf.percentuale_riduzione ?? 20) > 0"
                    color="orange-darken-3"
                    size="x-small"
                    class="font-weight-black text-white"
                  >
                    -{{ inf.percentuale_riduzione ?? 20 }}% Carico
                  </v-chip>
                  <v-chip
                    v-else
                    color="grey-darken-1"
                    size="x-small"
                    class="font-weight-bold text-white"
                  >
                    Solo Monitoraggio
                  </v-chip>
                </div>
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
              
              <!-- Azioni Infortunio Attivo -->
              <div class="d-flex justify-end align-center mt-2 pt-2 border-top-soft gap-2 flex-wrap">
                <v-btn
                  variant="text"
                  color="red-lighten-3"
                  size="x-small"
                  class="font-weight-bold text-none rounded-lg"
                  icon
                  title="Elimina Definitivamente"
                  @click="eliminaInfortunioClick(inf)"
                >
                  <v-icon size="16">mdi-delete-outline</v-icon>
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="orange-lighten-2"
                  size="x-small"
                  class="font-weight-bold text-none rounded-lg"
                  prepend-icon="mdi-pencil"
                  @click="apriFormModifica(inf)"
                >
                  Modifica
                </v-btn>
                <v-btn
                  variant="flat"
                  color="green-accent-4"
                  size="x-small"
                  class="font-weight-black text-none text-white rounded-lg"
                  prepend-icon="mdi-check-circle"
                  @click="risolviInfortunioClick(inf.id)"
                >
                  Guarito / Risolto
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
            style="opacity: 0.8; border-left: 4px solid rgba(16, 185, 129, 0.5) !important;"
          >
            <v-icon color="green-lighten-2" class="mr-3 mt-0.5">mdi-check-circle-outline</v-icon>
            <div class="flex-grow-1">
              <div class="d-flex align-center justify-space-between flex-wrap gap-1">
                <span class="font-weight-bold text-white text-caption">
                  {{ inf.articolazione_coinvolta }} (Guarito)
                </span>
                <span class="text-super-caption text-muted font-weight-bold">
                  Gravità orig: {{ inf.gravita }}/10
                </span>
              </div>
              <span class="text-super-caption text-muted d-block mt-0.5">
                Periodo: {{ formattaData(inf.data_inizio) }} ➔ {{ formattaData(inf.data_risoluzione) }}
              </span>
              <p v-if="inf.note" class="text-super-caption text-slate mt-1.5 mb-1 italic">
                "{{ inf.note }}"
              </p>

              <!-- Azioni Infortunio Storico (Modifica, Riapri, Elimina) -->
              <div class="d-flex justify-end align-center mt-2 pt-1 border-top-soft gap-2 flex-wrap">
                <v-btn
                  variant="text"
                  color="red-lighten-3"
                  size="x-small"
                  class="font-weight-bold text-none rounded-lg"
                  icon
                  title="Elimina Definitivamente"
                  @click="eliminaInfortunioClick(inf)"
                >
                  <v-icon size="16">mdi-delete-outline</v-icon>
                </v-btn>
                <v-btn
                  variant="outlined"
                  color="orange-lighten-2"
                  size="x-small"
                  class="font-weight-bold text-none rounded-lg"
                  prepend-icon="mdi-pencil"
                  @click="apriFormModifica(inf)"
                >
                  Modifica
                </v-btn>
                <v-btn
                  variant="tonal"
                  color="amber-darken-2"
                  size="x-small"
                  class="font-weight-bold text-none rounded-lg"
                  prepend-icon="mdi-refresh"
                  @click="riapriInfortunioClick(inf.id)"
                >
                  Riapri
                </v-btn>
              </div>
            </div>
          </v-card>
        </div>
      </div>
    </div>

    <!-- Dialog Custom Conferma Eliminazione (Premium App UI) -->
    <v-dialog v-model="dialogConfermaElimina" max-width="400" rounded="xl">
      <v-card class="card-glass border border-soft pa-5 text-center rounded-2xl" style="background: rgba(15, 23, 42, 0.95) !important; backdrop-filter: blur(20px) !important;">
        <div class="d-flex align-center justify-center gap-2 mx-auto mb-3 px-4 py-2 rounded-pill border border-soft text-red-lighten-2" style="background: rgba(239, 68, 68, 0.12); width: fit-content;">
          <v-icon size="20" color="red-lighten-2">mdi-delete-outline</v-icon>
          <span class="font-weight-black text-subtitle-2 text-red-lighten-2 uppercase tracking-wide">
            {{ infortunioDaEliminare?.articolazione_coinvolta || 'Segnalazione' }}
          </span>
        </div>
        <h3 class="text-subtitle-1 font-weight-black text-white mb-1">
          Eliminare questa segnalazione?
        </h3>
        <p class="text-caption text-slate mb-4" style="color: #94a3b8 !important;">
          Sei sicuro di voler eliminare definitivamente <strong>{{ infortunioDaEliminare?.articolazione_coinvolta }}</strong> dallo storico del tuo profilo?
        </p>
        <div class="d-flex justify-center gap-2">
          <v-btn
            variant="outlined"
            color="slate"
            class="font-weight-bold text-none rounded-xl flex-grow-1"
            height="38"
            style="font-size: 0.78rem;"
            @click="dialogConfermaElimina = false"
          >
            No, Annulla
          </v-btn>
          <v-btn
            color="red-darken-3"
            variant="flat"
            class="font-weight-black text-none rounded-xl text-white flex-grow-1 elevation-2"
            height="38"
            style="font-size: 0.78rem;"
            :loading="eliminandoInfortunio"
            @click="confermaEliminazioneInfortunio"
          >
            Sì, Elimina
          </v-btn>
        </div>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { selectedAthlete, selectedSheet, ruolo, getNomeAtleta, globalInfortuni, globalStoryboard, syncStoryboardListener, getStoryboardBackup, segnalaInfortunio, aggiornaInfortunio, risolviInfortunio, eliminaInfortunio, calcolaPercentualeConsigliata, syncInfortuniListener } from '../authStore.js';

const mostraFormNuovo = ref(false);
const infortunioInModificaId = ref(null);
const salvando = ref(false);

const nuovoArticolazione = ref('Spalla');
const nuovoGravita = ref(3);
const nuovoPercentuale = ref(10);
const nuovoApplicaRiduzione = ref(true);
const nuovoNote = ref('');
const nuovoEsercizio = ref('');

const eserciziBackup = ref([]);

onMounted(async () => {
  try {
    syncStoryboardListener();
  } catch (e) {}
  try {
    const backup = await getStoryboardBackup();
    if (backup && Array.isArray(backup)) {
      eserciziBackup.value = backup;
    }
  } catch (e) {
    console.warn("Impossibile caricare backup per esercizi infortuni:", e);
  }
});

const opzioniEsercizi = computed(() => {
  const nomi = new Set();
  const currentAthlete = String(selectedAthlete.value || '').trim();
  const currentSheet = String(selectedSheet.value || '').trim();

  // 1. Dati dallo storyboard globale (scheda corrente dell'atleta)
  if (globalStoryboard.value && globalStoryboard.value.length > 0) {
    globalStoryboard.value.forEach(item => {
      if (item && item.des_esercizio && String(item.des_esercizio).trim()) {
        const riga = item.num_riga_giorno !== undefined ? parseInt(item.num_riga_giorno) : 1;
        if (isNaN(riga) || riga > 0 || !String(item.des_esercizio).toUpperCase().startsWith('GIORNO')) {
          nomi.add(String(item.des_esercizio).trim());
        }
      }
    });
  }

  // 2. Se vuoto o come supporto dal backup offline
  if (nomi.size === 0 && eserciziBackup.value && eserciziBackup.value.length > 0) {
    eserciziBackup.value.forEach(item => {
      if (!item || !item.des_esercizio || !String(item.des_esercizio).trim()) return;
      const itemAthlete = String(item.ID_cliente || item.id_cliente || '').trim();
      const itemSheet = String(item.num_scheda || '').trim();

      const matchAthlete = !currentAthlete || itemAthlete === currentAthlete;
      const matchSheet = !currentSheet || itemSheet === currentSheet;

      if (matchAthlete && matchSheet) {
        nomi.add(String(item.des_esercizio).trim());
      }
    });

    if (nomi.size === 0 && currentAthlete) {
      eserciziBackup.value.forEach(item => {
        if (!item || !item.des_esercizio || !String(item.des_esercizio).trim()) return;
        const itemAthlete = String(item.ID_cliente || item.id_cliente || '').trim();
        if (itemAthlete === currentAthlete) {
          nomi.add(String(item.des_esercizio).trim());
        }
      });
    }
  }

  return Array.from(nomi).sort((a, b) => a.localeCompare(b, 'it', { sensitivity: 'base' }));
});

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

const onGravitaChange = (val) => {
  nuovoPercentuale.value = calcolaPercentualeConsigliata(val);
};

const apriFormNuovo = () => {
  vibraTattile(10);
  infortunioInModificaId.value = null;
  nuovoArticolazione.value = 'Spalla';
  nuovoGravita.value = 3;
  nuovoPercentuale.value = calcolaPercentualeConsigliata(3);
  nuovoApplicaRiduzione.value = true;
  nuovoNote.value = '';
  nuovoEsercizio.value = '';
  mostraFormNuovo.value = true;
};

const apriFormModifica = (inf) => {
  vibraTattile(10);
  infortunioInModificaId.value = inf.id;
  nuovoArticolazione.value = inf.articolazione_coinvolta || 'Spalla';
  nuovoGravita.value = inf.gravita || 3;
  nuovoPercentuale.value = inf.percentuale_riduzione !== undefined ? inf.percentuale_riduzione : calcolaPercentualeConsigliata(inf.gravita || 3);
  nuovoApplicaRiduzione.value = inf.applica_riduzione !== undefined ? inf.applica_riduzione : true;
  nuovoNote.value = inf.note || '';
  nuovoEsercizio.value = (inf.esercizi_originari && inf.esercizi_originari[0]) || '';
  mostraFormNuovo.value = true;
};

const salvaInfortunio = async () => {
  salvando.value = true;
  vibraTattile(15);
  try {
    const exVal = typeof nuovoEsercizio.value === 'string'
      ? nuovoEsercizio.value.trim()
      : (nuovoEsercizio.value ? String(nuovoEsercizio.value).trim() : '');

    const payload = {
      articolazione_coinvolta: nuovoArticolazione.value,
      gravita: nuovoGravita.value,
      percentuale_riduzione: nuovoPercentuale.value,
      applica_riduzione: nuovoApplicaRiduzione.value,
      note: nuovoNote.value,
      esercizi_originari: exVal ? [exVal] : []
    };
    if (infortunioInModificaId.value) {
      await aggiornaInfortunio(infortunioInModificaId.value, payload);
    } else {
      await segnalaInfortunio(payload);
    }
    mostraFormNuovo.value = false;
    infortunioInModificaId.value = null;
  } catch (err) {
    console.error("Errore salvataggio infortunio:", err);
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

const riapriInfortunioClick = async (id) => {
  vibraTattile(15);
  try {
    await aggiornaInfortunio(id, {
      stato: 'attivo',
      data_risoluzione: null
    });
  } catch (err) {
    console.error("Errore riapertura infortunio:", err);
  }
};

const dialogConfermaElimina = ref(false);
const idInfortunioDaEliminare = ref(null);
const infortunioDaEliminare = ref(null);
const eliminandoInfortunio = ref(false);

const eliminaInfortunioClick = (target) => {
  vibraTattile(15);
  if (typeof target === 'object' && target !== null) {
    infortunioDaEliminare.value = target;
    idInfortunioDaEliminare.value = target.id;
  } else {
    idInfortunioDaEliminare.value = target;
    infortunioDaEliminare.value = globalInfortuni.value?.find(i => i.id === target) || null;
  }
  dialogConfermaElimina.value = true;
};

const confermaEliminazioneInfortunio = async () => {
  if (!idInfortunioDaEliminare.value) return;
  eliminandoInfortunio.value = true;
  vibraTattile(20);
  try {
    await eliminaInfortunio(idInfortunioDaEliminare.value);
    dialogConfermaElimina.value = false;
    idInfortunioDaEliminare.value = null;
    infortunioDaEliminare.value = null;
  } catch (err) {
    console.error("Errore eliminazione infortunio:", err);
  } finally {
    eliminandoInfortunio.value = false;
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
