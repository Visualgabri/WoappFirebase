<template>
  <v-dialog
    v-model="mostra"
    max-width="960"
    scrollable
    transition="dialog-bottom-transition"
    class="dialog-controllo-qualita"
  >
    <v-card class="bg-slate-900 border border-slate-700 text-slate-100 rounded-2xl overflow-hidden elevation-24">
      <!-- HEADER MODALE -->
      <v-card-item class="bg-slate-950 border-b border-slate-800 py-3.5 px-4">
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center min-width-0">
            <v-avatar size="36" color="orange-darken-3" class="mr-3 elevation-2 flex-shrink-0">
              <v-icon size="20" color="white">mdi-shield-check</v-icon>
            </v-avatar>
            <div class="text-left min-width-0">
              <div class="d-flex align-center gap-2">
                <h2 class="text-subtitle-1 font-weight-black text-slate-100 leading-tight mb-0 text-truncate">
                  Controllo Qualità Scheda
                </h2>
                <v-chip
                  :color="risultato.totaleErrori === 0 ? (risultato.totaleAnomalie === 0 ? 'green-darken-2' : 'amber-darken-3') : 'red-darken-2'"
                  size="x-small"
                  variant="flat"
                  class="font-weight-black text-white px-2 uppercase"
                  style="font-size: 0.60rem;"
                >
                  {{ risultato.totaleErrori === 0 ? (risultato.totaleAnomalie === 0 ? 'Conforme 100%' : 'Verifica Consigliata') : 'Errori Rilevati' }}
                </v-chip>
              </div>
              <span class="text-super-caption text-slate-400 font-weight-medium d-block text-truncate mt-0.5" style="font-size: 0.65rem;">
                {{ nomeAtleta || ('Atleta #' + idAtleta) }} · Scheda {{ numScheda }} · Analisi istantanea client-side (0 letture Firebase)
              </span>
            </div>
          </div>

          <div class="d-flex align-center gap-1.5 flex-shrink-0 ml-2">
            <v-btn
              icon
              size="small"
              color="orange-darken-3"
              variant="tonal"
              @click="eseguiAnalisi(true)"
              title="Riesegui scansione adesso"
              :loading="inScansione"
            >
              <v-icon size="16">mdi-refresh</v-icon>
            </v-btn>
            <v-btn
              icon
              size="small"
              variant="text"
              color="grey-lighten-1"
              @click="chiudi"
            >
              <v-icon size="20">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>
      </v-card-item>

      <!-- BARRA STATISTICHE & METRICHE RAPIDE -->
      <div class="bg-slate-900 px-4 py-2.5 border-b border-slate-800">
        <v-row dense class="align-center">
          <v-col cols="12" md="7" class="d-flex align-center flex-wrap gap-1.5">
            <!-- Chip Esercizi -->
            <v-chip size="small" variant="outlined" color="slate-300" class="font-weight-bold px-2" style="font-size: 0.68rem;">
              <v-icon start size="13" class="mr-1">mdi-dumbbell</v-icon>
              {{ risultato.totaleEsercizi }} Esercizi
            </v-chip>

            <!-- Chip Valori -->
            <v-chip size="small" variant="outlined" color="slate-300" class="font-weight-bold px-2" style="font-size: 0.68rem;">
              <v-icon start size="13" class="mr-1">mdi-numeric</v-icon>
              {{ risultato.totaleValoriControllati }} Valori
            </v-chip>

            <!-- Chip Errori -->
            <v-chip
              size="small"
              :variant="filtroSeverita === 'errore' ? 'flat' : 'tonal'"
              color="red-darken-1"
              class="font-weight-black cursor-pointer px-2"
              style="font-size: 0.68rem;"
              @click="filtroSeverita = filtroSeverita === 'errore' ? 'tutti' : 'errore'"
            >
              🔴 {{ risultato.totaleErrori }} {{ risultato.totaleErrori === 1 ? 'Errore' : 'Errori' }}
            </v-chip>

            <!-- Chip Anomalie -->
            <v-chip
              size="small"
              :variant="filtroSeverita === 'anomalia' ? 'flat' : 'tonal'"
              color="amber-darken-2"
              class="font-weight-black cursor-pointer px-2"
              style="font-size: 0.68rem;"
              @click="filtroSeverita = filtroSeverita === 'anomalia' ? 'tutti' : 'anomalia'"
            >
              🟡 {{ risultato.totaleAnomalie }} {{ risultato.totaleAnomalie === 1 ? 'Anomalia' : 'Anomalie' }}
            </v-chip>

            <!-- Chip Da Verificare -->
            <v-chip
              size="small"
              :variant="filtroSeverita === 'particolare' ? 'flat' : 'tonal'"
              color="blue-darken-2"
              class="font-weight-bold cursor-pointer px-2"
              style="font-size: 0.68rem;"
              @click="filtroSeverita = filtroSeverita === 'particolare' ? 'tutti' : 'particolare'"
            >
              🔵 {{ risultato.totaleParticolari }} Da Verificare
            </v-chip>
          </v-col>

          <!-- Punteggio Qualità Dati -->
          <v-col cols="12" md="5" class="d-flex align-center justify-md-end justify-space-between mt-2 mt-md-0">
            <span class="text-super-caption text-slate-400 mr-2 font-weight-bold" style="font-size: 0.65rem;">
              AFFIDABILITÀ SCHEDA:
            </span>
            <div class="d-flex align-center gap-2">
              <v-progress-linear
                :model-value="risultato.percentualeQualita"
                :color="risultato.percentualeQualita >= 90 ? 'green' : (risultato.percentualeQualita >= 75 ? 'amber' : 'red')"
                height="8"
                rounded
                style="width: 90px;"
              ></v-progress-linear>
              <span class="text-caption font-weight-black text-slate-100" style="font-size: 0.75rem;">
                {{ risultato.percentualeQualita }}%
              </span>
            </div>
          </v-col>
        </v-row>
      </div>

      <!-- FILTRI E RICERCA -->
      <div class="bg-slate-950 px-4 py-2 border-b border-slate-800">
        <v-row dense class="align-center">
          <!-- Filtro Giorno -->
          <v-col cols="12" sm="6" md="5" class="d-flex align-center gap-1">
            <span class="text-super-caption text-slate-400 font-weight-bold mr-1" style="font-size: 0.60rem;">GIORNO:</span>
            <v-btn-toggle
              v-model="filtroGiorno"
              mandatory
              color="orange-darken-3"
              density="compact"
              variant="outlined"
              style="height: 26px;"
            >
              <v-btn value="tutti" size="x-small" class="px-2 font-weight-bold" style="font-size: 0.62rem;">TUTTI</v-btn>
              <v-btn value="A" size="x-small" class="px-2 font-weight-bold" style="font-size: 0.62rem;">A</v-btn>
              <v-btn value="B" size="x-small" class="px-2 font-weight-bold" style="font-size: 0.62rem;">B</v-btn>
              <v-btn value="C" size="x-small" class="px-2 font-weight-bold" style="font-size: 0.62rem;">C</v-btn>
              <v-btn value="D" size="x-small" class="px-2 font-weight-bold" style="font-size: 0.62rem;">D</v-btn>
            </v-btn-toggle>
          </v-col>

          <!-- Ricerca Testuale -->
          <v-col cols="12" sm="6" md="7">
            <v-text-field
              v-model="testoRicerca"
              density="compact"
              variant="outlined"
              color="orange-darken-3"
              placeholder="Cerca esercizio, coordinata (es. B3), testo..."
              prepend-inner-icon="mdi-magnify"
              hide-details
              clearable
              rounded="lg"
              style="font-size: 0.72rem;"
            ></v-text-field>
          </v-col>
        </v-row>
      </div>

      <!-- CORPO CENTRALE SCORREVOLE: ELENCO SEGNALAZIONI -->
      <v-card-text class="pa-4 bg-slate-900" style="max-height: 65vh; min-height: 280px; overflow-y: auto;">
        <!-- STATO 1: NESSUN PROBLEMA TROVATO (SCHEDA PERFETTA) -->
        <div
          v-if="segnalazioniFiltrate.length === 0 && !testoRicerca && filtroSeverita === 'tutti' && filtroGiorno === 'tutti'"
          class="text-center py-10 px-4"
        >
          <v-avatar size="64" color="green-darken-3" class="mb-3 elevation-4">
            <v-icon size="36" color="white">mdi-check-decagram</v-icon>
          </v-avatar>
          <h3 class="text-h6 font-weight-black text-green-accent-3 mb-1">
            Controllo Qualità Superato con Successo!
          </h3>
          <p class="text-body-2 text-slate-300 max-width-text mx-auto mb-4" style="font-size: 0.80rem; max-width: 540px; line-height: 1.4;">
            Tutti i <strong>{{ risultato.totaleValoriControllati }} valori</strong> inseriti dall'atleta sono stati analizzati e risultano perfettamente formattati, coerenti con la prescrizione e leggibili al 100% dagli algoritmi Ghost, 1RM e progressioni.
          </p>
          <v-chip color="green-darken-4" class="text-green-accent-2 font-weight-bold px-3" size="small" variant="flat">
            ✨ Nessun errore né anomalia rilevata
          </v-chip>
        </div>

        <!-- STATO 2: FILTRO VUOTO -->
        <div
          v-else-if="segnalazioniFiltrate.length === 0"
          class="text-center py-8 text-slate-400"
        >
          <v-icon size="36" class="mb-2 opacity-50">mdi-filter-off</v-icon>
          <div class="text-subtitle-2 font-weight-bold">Nessuna segnalazione corrisponde ai filtri impostati.</div>
          <v-btn
            size="x-small"
            variant="text"
            color="orange-darken-3"
            class="mt-2 text-none"
            @click="resetFiltri"
          >
            Reimposta tutti i filtri
          </v-btn>
        </div>

        <!-- STATO 3: ELENCO CARD SEGNALAZIONI -->
        <div v-else class="d-flex flex-column gap-3">
          <div
            v-for="s in segnalazioniFiltrate"
            :key="s.id"
            class="card-segnalazione rounded-xl border pa-3 text-left transition-all"
            :class="{
              'border-red-600 bg-red-950/20': s.livello === 'errore',
              'border-amber-600 bg-amber-950/20': s.livello === 'anomalia',
              'border-blue-600 bg-blue-950/20': s.livello === 'particolare'
            }"
          >
            <!-- INTESTAZIONE CARD: Coordinata, Esercizio, Settimana, Livello (Cliccabile per navigare all'esercizio) -->
            <div
              class="d-flex flex-wrap align-center justify-space-between gap-1.5 mb-2 cursor-pointer card-header-clickable rounded-lg pa-1 transition-all"
              @click="vaiAllEsercizio(s)"
              title="Clicca per aprire la scheda di dettaglio di questo esercizio"
            >
              <div class="d-flex align-center gap-1.5 flex-wrap min-width-0">
                <!-- Coordinata Giorno/Riga -->
                <v-chip
                  color="orange-darken-3"
                  size="x-small"
                  variant="flat"
                  class="font-weight-black text-white px-2"
                  style="font-size: 0.65rem;"
                >
                  {{ s.coordinata }}
                </v-chip>

                <!-- Settore -->
                <v-chip
                  v-if="s.des_settore"
                  color="slate-700"
                  size="x-small"
                  variant="tonal"
                  class="text-slate-300 font-weight-bold"
                  style="font-size: 0.60rem;"
                >
                  {{ s.des_settore }}
                </v-chip>

                <!-- Settimana -->
                <v-chip
                  color="purple-darken-3"
                  size="x-small"
                  variant="flat"
                  class="font-weight-black text-white px-2"
                  style="font-size: 0.62rem;"
                >
                  {{ s.settimanaLabel }}
                </v-chip>

                <!-- Nome Esercizio con icona -->
                <span class="text-subtitle-2 font-weight-black text-slate-100 ml-1 text-truncate link-esercizio d-inline-flex align-center gap-1" style="font-size: 0.85rem;">
                  {{ s.des_esercizio }}
                  <v-icon size="13" color="orange-lighten-2" class="icon-open">mdi-open-in-new</v-icon>
                </span>
              </div>

              <!-- Badge Livello di Gravità -->
              <v-chip
                :color="s.livello === 'errore' ? 'red-darken-2' : (s.livello === 'anomalia' ? 'amber-darken-3' : 'blue-darken-3')"
                size="x-small"
                variant="flat"
                class="font-weight-black text-white uppercase px-2"
                style="font-size: 0.58rem; letter-spacing: 0.04em;"
              >
                {{ s.livello === 'errore' ? '🔴 Errore Certo' : (s.livello === 'anomalia' ? '🟡 Possibile Anomalia' : '🔵 Da Verificare') }}
              </v-chip>
            </div>

            <!-- BLOCCO CONFRONTO: Scritto dall'utente vs Interpretato dal sistema -->
            <v-row dense class="mb-2 bg-slate-950/60 rounded-lg pa-2 border border-slate-800/80">
              <!-- Valore Originale Utente -->
              <v-col cols="12" sm="4" class="border-sm-right border-slate-800 pr-sm-2">
                <span class="text-super-caption text-slate-400 font-weight-bold uppercase d-block mb-0.5" style="font-size: 0.58rem;">
                  ✍️ Scritto dall'Utente:
                </span>
                <div class="font-weight-black text-amber-accent-2 font-mono text-break" style="font-size: 0.78rem;">
                  "{{ s.valoreOriginale }}"
                </div>
              </v-col>

              <!-- Carico & Reps Interpretati -->
              <v-col cols="12" sm="4" class="border-sm-right border-slate-800 px-sm-2">
                <span class="text-super-caption text-slate-400 font-weight-bold uppercase d-block mb-0.5" style="font-size: 0.58rem;">
                  ⚙️ Interpretato dal Sistema:
                </span>
                <div class="font-weight-black text-slate-100" style="font-size: 0.78rem;">
                  <span v-if="s.interpretatoCustom" class="text-amber-lighten-2">
                    {{ s.interpretatoCustom }}
                  </span>
                  <span v-else-if="s.isCorpoLibero && !s.haSovraccarico" class="text-green-accent-3">
                    Bodyweight · {{ s.repsEstratte !== null ? (s.repsEstratte + ' reps') : 'Reps n.d.' }}
                  </span>
                  <span v-else-if="s.isCorpoLibero && s.haSovraccarico" class="text-green-accent-3">
                    +{{ s.caricoEstratto }} kg Zavorra · {{ s.repsEstratte !== null ? (s.repsEstratte + 'r') : '' }}
                  </span>
                  <span v-else-if="s.caricoEstratto !== null" class="text-green-accent-3">
                    {{ s.caricoEstratto }} kg <span v-if="s.repsEstratte" class="text-slate-300">x {{ s.repsEstratte }}r</span>
                  </span>
                  <span v-else class="text-red-lighten-2">
                    ⚠️ Nessun carico estratto
                  </span>
                </div>
              </v-col>

              <!-- Prescrizione della Settimana -->
              <v-col cols="12" sm="4" class="pl-sm-2">
                <span class="text-super-caption text-slate-400 font-weight-bold uppercase d-block mb-0.5" style="font-size: 0.58rem;">
                  📋 Prescrizione Scheda:
                </span>
                <div class="text-caption text-slate-300 font-weight-medium text-truncate" style="font-size: 0.72rem;">
                  {{ s.prescrizione || 'Non specificata' }}
                </div>
              </v-col>
            </v-row>

            <!-- TITOLO E MOTIVO DELLA SEGNALAZIONE -->
            <div class="mb-1.5">
              <div class="text-caption font-weight-black text-slate-100 d-flex align-center" style="font-size: 0.76rem;">
                <v-icon size="14" class="mr-1" :color="s.livello === 'errore' ? 'red' : (s.livello === 'anomalia' ? 'amber' : 'blue')">
                  {{ s.livello === 'errore' ? 'mdi-alert-octagon' : (s.livello === 'anomalia' ? 'mdi-alert' : 'mdi-information-outline') }}
                </v-icon>
                {{ s.titolo }}
              </div>
              <p class="text-caption text-slate-300 mb-0 mt-0.5 ml-4 leading-relaxed" style="font-size: 0.70rem;">
                {{ s.spiegazione }}
              </p>
            </div>

            <!-- CONSEGUENZA SUGLI ALGORITMI (GHOST / 1RM) -->
            <div class="mb-1.5 ml-4 d-flex align-start gap-1">
              <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase flex-shrink-0" style="font-size: 0.58rem; line-height: 1.3;">
                ⚡ Impatto Algoritmi:
              </span>
              <span class="text-caption text-slate-400 leading-snug" style="font-size: 0.68rem;">
                {{ s.conseguenza }}
              </span>
            </div>

            <!-- CORREZIONE CONSIGLIATA & QUICK EDIT -->
            <div class="bg-slate-950/80 rounded-lg p-2 mt-2 border border-slate-800 flex-column d-flex gap-1.5">
              <div class="d-flex align-center justify-space-between flex-wrap gap-1">
                <div class="d-flex align-center gap-1 min-width-0">
                  <v-icon size="13" color="green-accent-3">mdi-lightbulb-on</v-icon>
                  <span class="text-caption font-weight-bold text-green-accent-2" style="font-size: 0.68rem;">
                    Consiglio: {{ s.correzioneConsigliata }}
                  </span>
                </div>

                <v-btn
                  size="x-small"
                  variant="tonal"
                  color="orange-darken-3"
                  class="font-weight-bold text-none px-2"
                  style="height: 22px; font-size: 0.62rem;"
                  @click="toggleModificaRapida(s.id)"
                >
                  <v-icon start size="11" class="mr-0.5">mdi-pencil</v-icon>
                  {{ modificateAperte[s.id] ? 'Annulla' : 'Correggi Adesso' }}
                </v-btn>
              </div>

              <!-- PANNELLO MODIFICA RAPIDA INLINE COACH -->
              <div v-if="modificateAperte[s.id]" class="pt-1.5 border-t border-slate-800 d-flex align-center gap-1.5">
                <v-text-field
                  v-model="valoriModifica[s.id]"
                  density="compact"
                  variant="outlined"
                  color="orange-darken-3"
                  label="Nuovo valore ins_week"
                  hide-details
                  style="font-size: 0.75rem;"
                  class="flex-grow-1"
                ></v-text-field>

                <v-btn
                  size="small"
                  color="green-darken-2"
                  class="font-weight-bold text-white text-none px-3"
                  style="height: 36px; font-size: 0.70rem;"
                  @click="applicaCorrezioneCoach(s)"
                  :loading="inSalvataggio === s.id"
                >
                  <v-icon start size="14">mdi-check</v-icon>
                  Applica
                </v-btn>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>

      <!-- FOOTER MODALE -->
      <v-card-actions class="bg-slate-950 border-t border-slate-800 py-2.5 px-4 d-flex align-center justify-space-between flex-wrap gap-2">
        <div class="d-flex align-center gap-1.5">
          <v-btn
            size="small"
            variant="tonal"
            color="slate-300"
            class="text-none font-weight-bold px-2.5"
            style="font-size: 0.68rem; height: 30px;"
            @click="copiaReportMarkdown"
          >
            <v-icon start size="14" class="mr-1">mdi-content-copy</v-icon>
            {{ reportCopiato ? 'Copiato!' : 'Copia Report' }}
          </v-btn>

          <span class="text-super-caption text-slate-400 d-none d-sm-inline" style="font-size: 0.60rem;">
            Analisi completata in &lt;10ms senza chiamate di rete.
          </span>
        </div>

        <v-btn
          size="small"
          color="orange-darken-3"
          variant="flat"
          class="font-weight-bold text-white text-none px-4"
          style="font-size: 0.72rem; height: 30px;"
          @click="chiudi"
        >
          Chiudi Controllo
        </v-btn>
      </v-card-actions>
    </v-card>

    <!-- Toast di notifica rapida interna alla modale -->
    <v-snackbar
      v-model="mostraToast"
      color="green-darken-3"
      location="top"
      :timeout="2200"
      class="font-weight-bold"
    >
      <div class="d-flex align-center gap-2">
        <v-icon color="white">mdi-check-circle</v-icon>
        <span>{{ messaggioToast }}</span>
      </div>
    </v-snackbar>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { analizzaQualitaScheda } from '../utils/qualityChecker.js';
import { globalStoryboard, selectedAthlete, selectedSheet } from '../authStore.js';
import { db } from '../firebase.js';
import { doc, updateDoc, collection, query, where, getDocs } from 'firebase/firestore';

const router = useRouter();

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  records: {
    type: Array,
    default: () => []
  },
  storicoBackup: {
    type: Array,
    default: () => []
  },
  idAtleta: {
    type: [String, Number],
    default: ''
  },
  nomeAtleta: {
    type: String,
    default: ''
  },
  numScheda: {
    type: [String, Number],
    default: ''
  }
});

const emit = defineEmits(['update:modelValue', 'applica-correzione', 'salva-record', 'seleziona-esercizio']);

const mostra = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const inScansione = ref(false);
const inSalvataggio = ref(null);
const filtroSeverita = ref('tutti'); // 'tutti', 'errore', 'anomalia', 'particolare'
const filtroGiorno = ref('tutti'); // 'tutti', 'A', 'B', 'C', 'D'
const testoRicerca = ref('');
const reportCopiato = ref(false);

const risultato = ref({
  totaleEsercizi: 0,
  totaleValoriControllati: 0,
  totaleErrori: 0,
  totaleAnomalie: 0,
  totaleParticolari: 0,
  totaleValidi: 0,
  percentualeQualita: 100,
  segnalazioni: [],
  riepilogoPerGiorno: {},
  superato: true
});

const mostraToast = ref(false);
const messaggioToast = ref('');

const modificateAperte = ref({});
const valoriModifica = ref({});

const getEffectiveRecords = () => {
  if (props.records && Array.isArray(props.records) && props.records.length > 0) {
    return props.records;
  }
  const currAthlete = String(props.idAtleta || selectedAthlete.value || '').trim();
  const currSheet = String(props.numScheda || selectedSheet.value || '').trim();
  if (globalStoryboard.value && Array.isArray(globalStoryboard.value) && globalStoryboard.value.length > 0) {
    const filtrati = globalStoryboard.value.filter(r => {
      const rCli = String(r.ID_cliente || r.id_cliente || '').trim();
      const rSch = String(r.num_scheda || '').trim();
      return (!currAthlete || rCli === currAthlete) && (!currSheet || rSch === currSheet);
    });
    if (filtrati.length > 0) return filtrati;
    return globalStoryboard.value;
  }
  return [];
};

const eseguiAnalisi = (manual = false) => {
  inScansione.value = true;
  try {
    const effectiveRecords = getEffectiveRecords();
    const res = analizzaQualitaScheda(effectiveRecords, {
      storicoBackup: props.storicoBackup,
      atletaId: props.idAtleta || selectedAthlete.value,
      numScheda: props.numScheda || selectedSheet.value
    });
    risultato.value = res;

    // Pre-popola i valori per eventuale quick-edit
    const mapValori = {};
    res.segnalazioni.forEach(s => {
      mapValori[s.id] = s.valoreOriginale;
    });
    valoriModifica.value = mapValori;

    if (manual === true) {
      messaggioToast.value = 'Analisi aggiornata!';
      mostraToast.value = true;
    }
  } catch (err) {
    console.error("Errore durante l'analisi di qualità della scheda:", err);
  } finally {
    inScansione.value = false;
  }
};

watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      eseguiAnalisi();
    }
  }
);

watch(
  () => props.records,
  () => {
    if (props.modelValue) {
      eseguiAnalisi();
    }
  },
  { deep: true }
);

const segnalazioniFiltrate = computed(() => {
  let list = risultato.value.segnalazioni || [];

  if (filtroSeverita.value !== 'tutti') {
    list = list.filter(s => s.livello === filtroSeverita.value);
  }

  if (filtroGiorno.value !== 'tutti') {
    list = list.filter(s => s.giorno === filtroGiorno.value);
  }

  if (testoRicerca.value && testoRicerca.value.trim()) {
    const q = testoRicerca.value.toLowerCase().trim();
    list = list.filter(s =>
      s.des_esercizio.toLowerCase().includes(q) ||
      s.coordinata.toLowerCase().includes(q) ||
      s.valoreOriginale.toLowerCase().includes(q) ||
      s.titolo.toLowerCase().includes(q) ||
      s.spiegazione.toLowerCase().includes(q)
    );
  }

  return list;
});

const resetFiltri = () => {
  filtroSeverita.value = 'tutti';
  filtroGiorno.value = 'tutti';
  testoRicerca.value = '';
};

const toggleModificaRapida = (id) => {
  modificateAperte.value[id] = !modificateAperte.value[id];
};

const vaiAllEsercizio = (segnalazione) => {
  emit('update:modelValue', false);
  emit('seleziona-esercizio', segnalazione);

  const targetRecords = getEffectiveRecords();
  const ex = targetRecords.find(r => 
    (segnalazione.docId && (r.id === segnalazione.docId || r.dbId === segnalazione.docId)) ||
    (segnalazione.numRiga && String(r.num_riga) === String(segnalazione.numRiga)) ||
    (segnalazione.des_esercizio && String(r.des_esercizio || '').trim() === String(segnalazione.des_esercizio).trim())
  );
  const targetId = ex?.id || ex?.dbId || segnalazione.docId;
  if (targetId) {
    router.push({
      name: 'DettaglioWorkout',
      params: { id: targetId },
      query: { targetWeek: segnalazione.settimana, scrollWeek: segnalazione.settimana }
    });
  } else {
    console.warn("Impossibile trovare ID esercizio per la navigazione:", segnalazione);
  }
};

const applicaCorrezioneCoach = async (segnalazione) => {
  const nuovoVal = valoriModifica.value[segnalazione.id];
  if (nuovoVal === undefined || nuovoVal === null) return;

  inSalvataggio.value = segnalazione.id;
  try {
    const strNuovoVal = String(nuovoVal).trim();
    const w = segnalazione.settimana;
    const targetRecords = getEffectiveRecords();
    const ex = targetRecords.find(r => 
      (segnalazione.docId && (r.id === segnalazione.docId || r.dbId === segnalazione.docId)) ||
      (segnalazione.numRiga && String(r.num_riga) === String(segnalazione.numRiga)) ||
      (segnalazione.des_esercizio && String(r.des_esercizio || '').trim() === String(segnalazione.des_esercizio).trim())
    );

    // 1. Aggiorna in locale per reattività immediata su tutti i riferimenti
    if (ex) {
      ex['ins_week' + w] = strNuovoVal;
      if (w === 6 && (segnalazione.tipo === 'w6_manca_num_ins6' || !ex.num_ins6)) {
        ex.num_ins6 = strNuovoVal;
      }
    }

    if (globalStoryboard.value && Array.isArray(globalStoryboard.value)) {
      const gEx = globalStoryboard.value.find(r => 
        (segnalazione.docId && (r.id === segnalazione.docId || r.dbId === segnalazione.docId)) ||
        (segnalazione.numRiga && String(r.num_riga) === String(segnalazione.numRiga)) ||
        (segnalazione.des_esercizio && String(r.des_esercizio || '').trim() === String(segnalazione.des_esercizio).trim())
      );
      if (gEx) {
        gEx['ins_week' + w] = strNuovoVal;
        if (w === 6 && (segnalazione.tipo === 'w6_manca_num_ins6' || !gEx.num_ins6)) {
          gEx.num_ins6 = strNuovoVal;
        }
      }
    }

    // 2. Salva in Firestore
    let savedToFirestore = false;
    const updatePayload = {
      ['ins_week' + w]: strNuovoVal,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      timestamp_ute: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    if (w === 6 && (segnalazione.tipo === 'w6_manca_num_ins6' || !ex?.num_ins6)) {
      updatePayload.num_ins6 = strNuovoVal;
    }

    const docId = ex?.id || ex?.dbId || segnalazione.docId;
    if (docId && typeof docId === 'string' && !docId.startsWith('STORICO_') && docId.length > 5) {
      try {
        await updateDoc(doc(db, 'STORYBOARD', docId), updatePayload);
        savedToFirestore = true;
      } catch (errDoc) {
        console.warn("Tentativo updateDoc diretto fallito, fallback query:", errDoc);
      }
    }

    if (!savedToFirestore) {
      // Query fallback per trovare il doc in STORYBOARD
      const atletaId = props.idAtleta || selectedAthlete.value || ex?.ID_cliente || ex?.id_cliente;
      const numScheda = props.numScheda || selectedSheet.value || ex?.num_scheda;
      const numRiga = segnalazione.numRiga || ex?.num_riga;
      const desEsercizio = segnalazione.des_esercizio || ex?.des_esercizio;
      const desGiorno = segnalazione.giorno || ex?.des_giorno;
      const numRigaGiorno = ex?.num_riga_giorno;

      if (atletaId && numScheda) {
        try {
          const q = query(
            collection(db, 'STORYBOARD'),
            where('ID_cliente', 'in', [String(atletaId), Number(atletaId)]),
            where('num_scheda', 'in', [String(numScheda), Number(numScheda)])
          );
          const snap = await getDocs(q);
          for (const d of snap.docs) {
            const data = d.data();
            const matchRiga = numRiga && String(data.num_riga) === String(numRiga);
            const matchCoord = desGiorno && numRigaGiorno && String(data.des_giorno).trim().toUpperCase() === String(desGiorno).trim().toUpperCase() && String(data.num_riga_giorno) === String(numRigaGiorno);
            const matchDes = desEsercizio && String(data.des_esercizio || '').trim() === String(desEsercizio).trim();

            if (matchRiga || matchCoord || matchDes) {
              await updateDoc(doc(db, 'STORYBOARD', d.id), updatePayload);
              savedToFirestore = true;
              if (ex) ex.id = d.id;
              break;
            }
          }
        } catch (errQuery) {
          console.warn("Query fallback Firestore fallita:", errQuery);
        }
      }
    }

    emit('applica-correzione', {
      docId: docId,
      numRiga: segnalazione.numRiga,
      settimana: w,
      nuovoValore: strNuovoVal,
      des_esercizio: segnalazione.des_esercizio
    });

    modificateAperte.value[segnalazione.id] = false;

    // 3. Rianalizza subito in locale per aggiornare la modale in-place
    eseguiAnalisi();

    // 4. Mostra feedback di successo
    messaggioToast.value = `Modifica applicata con successo!`;
    mostraToast.value = true;

  } catch (err) {
    console.error("Errore salvataggio correzione Firestore:", err);
    alert("Errore durante il salvataggio: " + (err.message || err));
  } finally {
    inSalvataggio.value = null;
  }
};

const copiaReportMarkdown = async () => {
  const res = risultato.value;
  let md = `### 📊 Report Controllo Qualità Scheda\n`;
  md += `**Atleta:** ${props.nomeAtleta || props.idAtleta} | **Scheda:** ${props.numScheda}\n`;
  md += `**Esercizi analizzati:** ${res.totaleEsercizi} | **Valori controllati:** ${res.totaleValoriControllati}\n`;
  md += `**Errori:** ${res.totaleErrori} | **Anomalie:** ${res.totaleAnomalie} | **Da verificare:** ${res.totaleParticolari}\n`;
  md += `**Affidabilità complessiva:** ${res.percentualeQualita}%\n\n`;

  if (res.segnalazioni.length === 0) {
    md += `✅ *Scheda conforme al 100%. Nessun problema riscontrato.*\n`;
  } else {
    md += `| Coord | Esercizio | Week | Valore Utente | Interpretato | Livello | Motivo |\n`;
    md += `|---|---|---|---|---|---|---|\n`;
    res.segnalazioni.forEach(s => {
      const icon = s.livello === 'errore' ? '🔴' : (s.livello === 'anomalia' ? '🟡' : '🔵');
      const interp = s.isCorpoLibero && !s.haSovraccarico
        ? `${s.repsEstratte} reps`
        : (s.caricoEstratto !== null ? `${s.caricoEstratto}kg` : 'n.d.');
      md += `| ${s.coordinata} | ${s.des_esercizio} | ${s.settimanaLabel} | ${s.valoreOriginale} | ${interp} | ${icon} ${s.livello} | ${s.titolo} |\n`;
    });
  }

  try {
    await navigator.clipboard.writeText(md);
    reportCopiato.value = true;
    setTimeout(() => {
      reportCopiato.value = false;
    }, 2500);
  } catch (err) {
    console.warn("Impossibile copiare negli appunti:", err);
  }
};

const chiudi = () => {
  mostra.value = false;
};
</script>

<style scoped>
.dialog-controllo-qualita :deep(.v-card) {
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.75) !important;
}

.card-segnalazione {
  background-color: rgba(15, 23, 42, 0.65);
  backdrop-filter: blur(8px);
}

.card-segnalazione:hover {
  background-color: rgba(30, 41, 59, 0.85);
}

.card-header-clickable {
  border-radius: 8px;
  padding: 4px;
}

.card-header-clickable:hover {
  background: rgba(249, 115, 22, 0.12);
}

.card-header-clickable:hover .link-esercizio {
  color: #fb923c !important;
}

.card-header-clickable:hover .icon-open {
  transform: translateX(2px) translateY(-1px);
}

.icon-open {
  transition: transform 0.15s ease;
}

.text-break {
  word-break: break-word;
}
</style>
