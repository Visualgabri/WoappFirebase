<template>
  <v-dialog
    v-model="mostra"
    :fullscreen="isMobile"
    :max-width="isMobile ? undefined : 860"
    scrollable
    transition="dialog-bottom-transition"
    class="dialog-controllo-qualita"
  >
    <v-card class="mobile-qc-card text-slate-100 overflow-hidden d-flex flex-column">
      
      <!-- 1. HEADER COMPATTO STICKY (2 RIGHE) -->
      <div class="mobile-qc-header px-3.5 py-2.5 flex-shrink-0">
        <!-- RIGA 1: Titolo + Badge Stato + Azioni Rapide -->
        <div class="d-flex align-center justify-space-between w-100">
          <div class="d-flex align-center gap-2 min-width-0">
            <div class="header-icon-badge flex-shrink-0">
              <v-icon size="17" color="#f97316">mdi-shield-check</v-icon>
            </div>
            <h2 class="mobile-qc-title text-truncate mb-0">
              Controllo Scheda
            </h2>
          </div>

          <div class="d-flex align-center gap-1.5 flex-shrink-0 ml-2">
            <!-- Badge Stato Rapido Compatto -->
            <v-chip
              :color="risultato.totaleErrori === 0 ? (risultato.totaleAnomalie === 0 ? 'green-darken-2' : 'amber-darken-3') : 'red-darken-2'"
              size="x-small"
              variant="flat"
              class="font-weight-black text-white px-2 uppercase tracking-wide status-chip"
            >
              {{ risultato.totaleErrori > 0 
                  ? `${risultato.totaleErrori} ${risultato.totaleErrori === 1 ? 'Errore' : 'Errori'}` 
                  : (risultato.totaleAnomalie > 0 
                      ? `${risultato.totaleAnomalie} ${risultato.totaleAnomalie === 1 ? 'Anomalia' : 'Anomalie'}` 
                      : 'Conforme 100%') }}
            </v-chip>

            <!-- Pulsante Aggiorna -->
            <v-btn
              icon
              size="small"
              variant="tonal"
              color="orange-darken-3"
              class="header-btn"
              @click="eseguiAnalisi(true)"
              title="Riesegui scansione adesso"
              :loading="inScansione"
            >
              <v-icon size="16">mdi-refresh</v-icon>
            </v-btn>

            <!-- Pulsante Chiudi -->
            <v-btn
              icon
              size="small"
              variant="text"
              color="grey-lighten-1"
              class="header-btn"
              @click="chiudi"
              title="Chiudi"
            >
              <v-icon size="20">mdi-close</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- RIGA 2: Sottotitolo discreto (Atleta · Scheda) -->
        <div class="mobile-qc-subtitle text-truncate mt-0.5">
          {{ nomeAtleta || ('Atleta #' + idAtleta) }} · Scheda {{ numScheda }}
        </div>
      </div>

      <!-- 2. PANNELLO CONTROLLO: RIEPILOGO, AFFIDABILITÀ & FILTRI -->
      <div class="mobile-qc-controls px-3.5 py-2 flex-shrink-0">
        
        <!-- RIEPILOGO CHIP (1-2 righe compatte) -->
        <div class="d-flex align-center flex-wrap gap-1.5 mb-2">
          <!-- Esercizi & Valori -->
          <div class="mini-stat-chip neutral">
            <v-icon size="11" class="mr-1 opacity-70">mdi-dumbbell</v-icon>
            <span><strong>{{ risultato.totaleEsercizi }}</strong> es</span>
          </div>

          <div class="mini-stat-chip neutral">
            <v-icon size="11" class="mr-1 opacity-70">mdi-numeric</v-icon>
            <span><strong>{{ risultato.totaleValoriControllati }}</strong> val</span>
          </div>

          <!-- Errori (Cliccabile per filtro) -->
          <div
            class="mini-stat-chip severity-error cursor-pointer"
            :class="{ 'active': filtroSeverita === 'errore' }"
            @click="filtroSeverita = filtroSeverita === 'errore' ? 'tutti' : 'errore'"
          >
            <span>🔴 <strong>{{ risultato.totaleErrori }}</strong> {{ risultato.totaleErrori === 1 ? 'errore' : 'errori' }}</span>
          </div>

          <!-- Anomalie (Cliccabile per filtro) -->
          <div
            class="mini-stat-chip severity-warning cursor-pointer"
            :class="{ 'active': filtroSeverita === 'anomalia' }"
            @click="filtroSeverita = filtroSeverita === 'anomalia' ? 'tutti' : 'anomalia'"
          >
            <span>🟡 <strong>{{ risultato.totaleAnomalie }}</strong> {{ risultato.totaleAnomalie === 1 ? 'anomalia' : 'anomalie' }}</span>
          </div>

          <!-- Da Verificare (Cliccabile per filtro) -->
          <div
            v-if="risultato.totaleParticolari > 0"
            class="mini-stat-chip severity-info cursor-pointer"
            :class="{ 'active': filtroSeverita === 'particolare' }"
            @click="filtroSeverita = filtroSeverita === 'particolare' ? 'tutti' : 'particolare'"
          >
            <span>🔵 <strong>{{ risultato.totaleParticolari }}</strong> da verificare</span>
          </div>
        </div>

        <!-- AFFIDABILITÀ SCHEDA ULTRA-COMPATTA (Singola riga + Barra sottile) -->
        <div class="affidabilita-bar-wrapper mb-2">
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="affidabilita-label">Affidabilità Scheda</span>
            <span
              class="affidabilita-value"
              :class="{
                'text-green-accent-3': risultato.percentualeQualita >= 90,
                'text-amber-accent-3': risultato.percentualeQualita >= 75 && risultato.percentualeQualita < 90,
                'text-red-accent-3': risultato.percentualeQualita < 75
              }"
            >
              {{ risultato.percentualeQualita }}%
            </span>
          </div>
          <div class="progress-bar-track">
            <div
              class="progress-bar-fill"
              :style="{
                width: risultato.percentualeQualita + '%',
                backgroundColor: risultato.percentualeQualita >= 90 ? '#22c55e' : (risultato.percentualeQualita >= 75 ? '#f59e0b' : '#ef4444')
              }"
            ></div>
          </div>
        </div>

        <!-- FILTRO GIORNO (Segmented Control scrollabile con pollice) -->
        <div class="segmented-days-container mb-2">
          <div class="segmented-days-scroll">
            <button
              type="button"
              class="segmented-day-btn"
              :class="{ 'active': filtroGiorno === 'tutti' }"
              @click="filtroGiorno = 'tutti'"
            >
              Tutti
            </button>
            <button
              v-for="giorno in ['A', 'B', 'C', 'D', 'E', 'F']"
              :key="giorno"
              type="button"
              class="segmented-day-btn"
              :class="{ 'active': filtroGiorno === giorno }"
              @click="filtroGiorno = giorno"
            >
              {{ giorno }}
            </button>
          </div>
        </div>

        <!-- BARRA DI RICERCA COMPATTA (42px) -->
        <div class="search-input-wrapper">
          <v-icon size="16" color="#94a3b8" class="search-icon">mdi-magnify</v-icon>
          <input
            v-model="testoRicerca"
            type="text"
            placeholder="Cerca esercizio o coordinata"
            class="mobile-search-input"
          />
          <button
            v-if="testoRicerca"
            type="button"
            class="clear-search-btn"
            @click="testoRicerca = ''"
          >
            <v-icon size="15" color="#94a3b8">mdi-close-circle</v-icon>
          </button>
        </div>
      </div>

      <!-- 3. CORPO CENTRALE SCORREVOLE CON LE CARD -->
      <v-card-text class="mobile-qc-body px-3.5 py-3 flex-grow-1">
        
        <!-- STATO 1: NESSUN PROBLEMA (100% CONFORME) -->
        <div
          v-if="segnalazioniFiltrate.length === 0 && !testoRicerca && filtroSeverita === 'tutti' && filtroGiorno === 'tutti'"
          class="text-center py-8 px-3"
        >
          <div class="success-check-avatar mx-auto mb-3">
            <v-icon size="32" color="#22c55e">mdi-check-decagram</v-icon>
          </div>
          <h3 class="text-subtitle-1 font-weight-black text-green-accent-3 mb-1">
            Scheda Conforme al 100%
          </h3>
          <p class="text-caption text-slate-300 mx-auto mb-3 leading-relaxed" style="max-width: 380px;">
            Tutti i <strong>{{ risultato.totaleValoriControllati }} valori</strong> registrati sono coerenti e perfettamente interpretabili dagli algoritmi di progressione.
          </p>
          <v-chip color="green-darken-4" class="text-green-accent-2 font-weight-bold px-3" size="small" variant="flat">
            ✨ Nessun errore né anomalia
          </v-chip>
        </div>

        <!-- STATO 2: NESSUN RISULTATO PER I FILTRI IMPOSTATI -->
        <div
          v-else-if="segnalazioniFiltrate.length === 0"
          class="text-center py-6 text-slate-400"
        >
          <v-icon size="30" class="mb-1.5 opacity-50">mdi-filter-off</v-icon>
          <div class="text-caption font-weight-bold">Nessuna segnalazione per i filtri attivi.</div>
          <v-btn
            size="x-small"
            variant="text"
            color="orange-darken-3"
            class="mt-1 text-none font-weight-bold"
            @click="resetFiltri"
          >
            Reimposta filtri
          </v-btn>
        </div>

        <!-- STATO 3: ELENCO CARD SEGNALAZIONI MOBILE FIRST -->
        <div v-else class="d-flex flex-column gap-3">
          <!-- BANNER FORMATO STANDARD SUGGERITO (DISCRETO E NON ALLARMANTE) -->
          <div
            v-if="risultato.totaleFormatiColloquiali > 0"
            class="format-tip-banner mb-1 px-3 py-2 d-flex align-center gap-2"
          >
            <v-icon size="16" color="#38bdf8" class="flex-shrink-0">mdi-lightbulb-outline</v-icon>
            <div class="text-caption text-slate-300 leading-snug" style="font-size: 0.72rem;">
              <span class="text-sky-300 font-weight-bold">Consiglio formato:</span> per una lettura ottimale in app, scrivi i carichi come <span class="text-amber-lighten-2 font-weight-bold">3,75 x 15r</span> e il corpo libero solo con le ripetizioni (es. <span class="text-amber-lighten-2 font-weight-bold">12r</span>).
            </div>
          </div>

          <div
            v-for="s in segnalazioniFiltrate"
            :key="s.id"
            class="mobile-anomaly-card"
            :class="{
              'card-error': s.livello === 'errore',
              'card-warning': s.livello === 'anomalia',
              'card-info': s.livello === 'particolare'
            }"
          >
            <!-- RIGA 1: BADGE METADATI + GRAVITÀ -->
            <div class="d-flex align-center justify-space-between gap-1.5 mb-1.5 flex-wrap">
              <div class="d-flex align-center gap-1 flex-wrap min-width-0">
                <!-- Coordinata -->
                <span class="badge-pill badge-coord">{{ s.coordinata }}</span>
                
                <!-- Settore -->
                <span v-if="s.des_settore" class="badge-pill badge-sector">{{ s.des_settore }}</span>
                
                <!-- Week -->
                <span class="badge-pill badge-week">{{ s.settimanaLabel }}</span>
              </div>

              <!-- Badge Gravità -->
              <span
                class="badge-severity"
                :class="{
                  'sev-error': s.livello === 'errore',
                  'sev-warning': s.livello === 'anomalia',
                  'sev-info': s.livello === 'particolare'
                }"
              >
                {{ s.livello === 'errore' ? '🔴 Errore' : (s.livello === 'anomalia' ? '🟠 Anomalia' : '🔵 Verifica') }}
              </span>
            </div>

            <!-- RIGA 2: NOME ESERCIZIO + ICONA NAVIGAZIONE -->
            <div
              class="exercise-title-row d-flex align-center justify-space-between gap-1 cursor-pointer py-1"
              @click="vaiAllEsercizio(s)"
              title="Apri l'esercizio per modificarlo direttamente"
            >
              <div class="exercise-name font-weight-bold text-slate-100 text-truncate">
                {{ s.des_esercizio }}
              </div>
              <div class="open-action-icon flex-shrink-0 d-flex align-center gap-1">
                <span class="open-label d-none d-sm-inline">Apri</span>
                <v-icon size="15" color="#f97316">mdi-open-in-new</v-icon>
              </div>
            </div>

            <!-- RIGA 3: PANNELLO DATI PRINCIPALI (INSERITO, INTERPRETAZIONE, PRESCRIZIONE) - MASSIMA PRIORITÀ -->
            <div class="main-data-card my-2.5">
              <!-- INSERITO -->
              <div class="main-data-row">
                <span class="main-data-label">✍️ Inserito</span>
                <span class="main-data-value val-inserted font-mono">"{{ s.valoreOriginale }}"</span>
              </div>

              <!-- INTERPRETAZIONE -->
              <div class="main-data-row">
                <span class="main-data-label">⚙️ Interpretazione</span>
                <span class="main-data-value val-interpretation">
                  <span v-if="s.interpretatoCustom" class="text-amber-lighten-2">{{ s.interpretatoCustom }}</span>
                  <span v-else-if="s.isCorpoLibero && !s.haSovraccarico" class="text-green-accent-3">
                    Corpo Libero · {{ s.repsEstratte !== null ? (s.repsEstratte + ' reps') : 'n.d.' }}
                  </span>
                  <span v-else-if="s.isCorpoLibero && s.haSovraccarico" class="text-green-accent-3">
                    +{{ s.caricoEstratto }} kg zavorra · {{ s.repsEstratte !== null ? (s.repsEstratte + 'r') : '' }}
                  </span>
                  <span v-else-if="s.caricoEstratto !== null" class="text-green-accent-3">
                    {{ s.caricoEstratto }} kg <span v-if="s.repsEstratte" class="text-slate-300 font-weight-medium">x{{ s.repsEstratte }}r</span>
                  </span>
                  <span v-else class="text-red-lighten-2 d-inline-flex align-center gap-1">
                    <v-icon size="14" color="#f87171">mdi-alert-circle-outline</v-icon>
                    Nessun carico estratto
                  </span>
                </span>
              </div>

              <!-- PRESCRIZIONE -->
              <div class="main-data-row">
                <span class="main-data-label">📋 Prescrizione</span>
                <span class="main-data-value val-prescription text-slate-100">{{ s.prescrizione || 'Non specificata' }}</span>
              </div>
            </div>

            <!-- RIGA 4: CONTENUTO DIAGNOSTICO COMPATTO E FINE (SECONDARIO) -->
            <div class="diagnostic-block mb-1.5">
              <div class="diagnostic-title d-flex align-center">
                <v-icon
                  size="12"
                  class="mr-1 flex-shrink-0"
                  :color="s.livello === 'errore' ? '#ef4444' : (s.livello === 'anomalia' ? '#f59e0b' : '#3b82f6')"
                >
                  {{ s.livello === 'errore' ? 'mdi-alert-circle' : (s.livello === 'anomalia' ? 'mdi-alert' : 'mdi-information') }}
                </v-icon>
                <span>{{ s.titolo }}</span>
              </div>
              
              <div class="diagnostic-desc mt-0.5 ml-3.5">
                {{ s.spiegazione }}
              </div>

              <!-- Impatto sintetico -->
              <div v-if="s.conseguenza" class="diagnostic-impact mt-0.5 ml-3.5 d-flex align-start gap-1">
                <span class="impact-badge flex-shrink-0">⚡ Impatto:</span>
                <span class="impact-text">{{ s.conseguenza }}</span>
              </div>
            </div>

            <!-- RIGA 5: UNIFIED ACTION BOX (SUGGERIMENTO + PULSANTE CORREGGI) -->
            <div class="action-box">
              <div class="d-flex align-center justify-space-between flex-wrap gap-2">
                <div class="suggestion-text d-flex align-start gap-1 flex-grow-1 min-width-0">
                  <v-icon size="12" color="#22c55e" class="mt-0.5 flex-shrink-0">mdi-lightbulb-on</v-icon>
                  <span class="leading-tight">
                    {{ s.correzioneConsigliata }}
                  </span>
                </div>

                <button
                  type="button"
                  class="btn-correggi-action"
                  :class="{ 'btn-active': modificateAperte[s.id] }"
                  @click="toggleModificaRapida(s.id)"
                >
                  <v-icon size="13" class="mr-1">
                    {{ modificateAperte[s.id] ? 'mdi-close' : 'mdi-pencil' }}
                  </v-icon>
                  <span>{{ modificateAperte[s.id] ? 'Annulla' : 'Correggi adesso' }}</span>
                </button>
              </div>

              <!-- PANNELLO MODIFICA RAPIDA INLINE COACH -->
              <div v-if="modificateAperte[s.id]" class="quick-edit-expanded mt-2 pt-2">
                <div class="d-flex align-center gap-2">
                  <div class="quick-input-container flex-grow-1">
                    <input
                      v-model="valoriModifica[s.id]"
                      type="text"
                      placeholder="es. 45 kg o 12r"
                      class="quick-text-input"
                      @keyup.enter="applicaCorrezioneCoach(s)"
                    />
                  </div>
                  <v-btn
                    color="green-darken-2"
                    class="btn-applica-action font-weight-black text-white text-none"
                    style="height: 40px; min-width: 80px;"
                    @click="applicaCorrezioneCoach(s)"
                    :loading="inSalvataggio === s.id"
                  >
                    <v-icon size="16" class="mr-1">mdi-check</v-icon>
                    Applica
                  </v-btn>
                </div>
              </div>
            </div>

          </div>
        </div>
      </v-card-text>

      <!-- 4. FOOTER STICKY (COPIA REPORT & CHIUDI) -->
      <div class="mobile-qc-footer px-3.5 py-2.5 flex-shrink-0 d-flex align-center justify-space-between gap-2">
        <v-btn
          variant="tonal"
          color="slate-300"
          class="btn-footer-copy font-weight-bold text-none"
          style="height: 42px;"
          @click="copiaReportMarkdown"
        >
          <v-icon size="16" class="mr-1.5">mdi-content-copy</v-icon>
          <span>{{ reportCopiato ? 'Copiato!' : 'Copia Report' }}</span>
        </v-btn>

        <v-btn
          color="orange-darken-3"
          variant="flat"
          class="btn-footer-close font-weight-bold text-white text-none flex-grow-1"
          style="height: 42px;"
          @click="chiudi"
        >
          Chiudi Controllo
        </v-btn>
      </div>

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
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue';
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

// Gestione Responsive Mobile (<= 600px)
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < 600 : true);

const updateViewportSize = () => {
  if (typeof window !== 'undefined') {
    isMobile.value = window.innerWidth < 600;
  }
};

onMounted(() => {
  if (typeof window !== 'undefined') {
    window.addEventListener('resize', updateViewportSize);
  }
});

onBeforeUnmount(() => {
  if (typeof window !== 'undefined') {
    window.removeEventListener('resize', updateViewportSize);
  }
});

const inScansione = ref(false);
const inSalvataggio = ref(null);
const filtroSeverita = ref('errore'); // Default 'errore' all'apertura
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

const eseguiAnalisi = async (manual = false) => {
  inScansione.value = true;
  try {
    let effectiveRecords = getEffectiveRecords();
    const currAthlete = String(props.idAtleta || selectedAthlete.value || '').trim();
    const currSheet = String(props.numScheda || selectedSheet.value || '').trim();

    // Se i records locali sono vuoti, recuperiamo gli esercizi direttamente da Firestore o dal backup!
    if ((!effectiveRecords || effectiveRecords.length === 0) && currAthlete && currSheet) {
      try {
        const numSch = parseInt(currSheet, 10);
        const numAth = parseInt(currAthlete, 10);

        let snap = await getDocs(query(collection(db, 'STORYBOARD'), where('ID_cliente', '==', currAthlete), where('num_scheda', '==', currSheet)));
        if (snap.empty && !isNaN(numSch)) {
          snap = await getDocs(query(collection(db, 'STORYBOARD'), where('ID_cliente', '==', currAthlete), where('num_scheda', '==', numSch)));
        }
        if (snap.empty && !isNaN(numAth)) {
          snap = await getDocs(query(collection(db, 'STORYBOARD'), where('ID_cliente', '==', numAth), where('num_scheda', '==', isNaN(numSch) ? currSheet : numSch)));
        }
        if (snap.empty && !isNaN(numAth)) {
          snap = await getDocs(query(collection(db, 'STORYBOARD'), where('ID_cliente', '==', numAth), where('num_scheda', '==', currSheet)));
        }
        if (!snap.empty) {
          effectiveRecords = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        } else {
          const allBackup = await getStoryboardBackup();
          if (allBackup && allBackup.length > 0) {
            effectiveRecords = allBackup.filter(r => {
              const rCli = String(r.ID_cliente || r.id_cliente || '').trim();
              const rSch = String(r.num_scheda || '').trim();
              return rCli === currAthlete && rSch === currSheet;
            });
          }
        }
      } catch (eDb) {
        console.warn("Fetch fallback STORYBOARD fallito in ControlloQualitaModal:", eDb);
      }
    }

    const res = analizzaQualitaScheda(effectiveRecords || [], {
      storicoBackup: props.storicoBackup,
      atletaId: currAthlete,
      numScheda: currSheet
    });
    risultato.value = res;

    // Pre-popola i valori per eventuale quick-edit
    const mapValori = {};
    res.segnalazioni.forEach(s => {
      if ((s.tipo === 'formato_fatte_info' || s.tipo === 'delta_reps_info') && s.caricoEstratto !== null && s.repsEstratte !== null) {
        mapValori[s.id] = `${String(s.caricoEstratto).replace('.', ',')} x ${s.repsEstratte}r`;
      } else if (s.tipo === 'amrap_mancano_reps' && s.caricoEstratto !== null) {
        mapValori[s.id] = `${String(s.caricoEstratto).replace('.', ',')} x 10r`;
      } else if (s.tipo === 'macchina_diversa_parentesi' && s.valoreOriginale) {
        const raw = s.valoreOriginale.trim();
        mapValori[s.id] = raw.startsWith('(') && raw.endsWith(')') ? raw : `(${raw})`;
      } else {
        mapValori[s.id] = s.valoreOriginale;
      }
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
      filtroSeverita.value = 'errore';
      filtroGiorno.value = 'tutti';
      testoRicerca.value = '';
      eseguiAnalisi();
    }
  }
);

watch(
  [() => props.records, () => props.idAtleta, () => props.numScheda],
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
/* ==========================================================================
   MOBILE FIRST PREMIUM DESIGN - CONTROLLO QUALITÀ SCHEDA
   Linear / Apple Fitness / Notion Dark Aesthetic
   ========================================================================== */

.dialog-controllo-qualita :deep(.v-overlay__content) {
  margin: 0 !important;
  max-height: 100dvh !important;
}

@media (max-width: 599px) {
  .dialog-controllo-qualita :deep(.v-overlay__content) {
    width: 100vw !important;
    height: 100dvh !important;
    max-width: 100vw !important;
    border-radius: 0 !important;
  }
  
  .mobile-qc-card {
    border-radius: 0 !important;
    height: 100dvh !important;
    max-height: 100dvh !important;
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }
}

.mobile-qc-card {
  background: #090d16 !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9) !important;
  height: 100%;
}

@media (min-width: 600px) {
  .mobile-qc-card {
    border-radius: 20px !important;
    max-height: 88vh !important;
  }
}

/* 1. HEADER COMPATTO */
.mobile-qc-header {
  background: rgba(11, 17, 30, 0.95);
  border-bottom: 1px solid rgba(255, 255, 255, 0.07);
  backdrop-filter: blur(12px);
}

.header-icon-badge {
  width: 28px;
  height: 28px;
  border-radius: 8px;
  background: rgba(249, 115, 22, 0.12);
  border: 1px solid rgba(249, 115, 22, 0.25);
  display: flex;
  align-items: center;
  justify-content: center;
}

.mobile-qc-title {
  font-size: 1.05rem;
  font-weight: 800;
  color: #f8fafc;
  letter-spacing: -0.02em;
}

.mobile-qc-subtitle {
  font-size: 0.72rem;
  color: #94a3b8;
  font-weight: 500;
  padding-left: 36px;
}

.status-chip {
  font-size: 0.60rem !important;
  height: 20px !important;
  letter-spacing: 0.03em !important;
}

.header-btn {
  width: 32px !important;
  height: 32px !important;
}

/* 2. CONTROLLI: STATISTICHE, PROGRESS BAR, FILTRI GIORNO, SEARCH */
.mobile-qc-controls {
  background: rgba(15, 23, 42, 0.75);
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

/* MINI STAT CHIPS */
.mini-stat-chip {
  font-size: 0.68rem;
  padding: 3px 8px;
  border-radius: 9999px;
  display: inline-flex;
  align-items: center;
  font-weight: 600;
  transition: all 0.15s ease;
  user-select: none;
}

.mini-stat-chip.neutral {
  background: rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.mini-stat-chip.severity-error {
  background: rgba(239, 68, 68, 0.12);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.25);
}
.mini-stat-chip.severity-error.active {
  background: #dc2626;
  color: #ffffff;
  border-color: #ef4444;
}

.mini-stat-chip.severity-warning {
  background: rgba(245, 158, 11, 0.12);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.25);
}
.mini-stat-chip.severity-warning.active {
  background: #d97706;
  color: #ffffff;
  border-color: #f59e0b;
}

.mini-stat-chip.severity-info {
  background: rgba(59, 130, 246, 0.12);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.25);
}
.mini-stat-chip.severity-info.active {
  background: #2563eb;
  color: #ffffff;
  border-color: #3b82f6;
}

/* AFFIDABILITÀ */
.affidabilita-bar-wrapper {
  background: rgba(0, 0, 0, 0.2);
  padding: 4px 8px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.04);
}

.affidabilita-label {
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #94a3b8;
}

.affidabilita-value {
  font-size: 0.80rem;
  font-weight: 900;
  letter-spacing: -0.01em;
}

.progress-bar-track {
  width: 100%;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 9999px;
  overflow: hidden;
}

.progress-bar-fill {
  height: 100%;
  border-radius: 9999px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

/* SEGMENTED DAY CONTROL */
.segmented-days-container {
  width: 100%;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.segmented-days-container::-webkit-scrollbar {
  display: none;
}

.segmented-days-scroll {
  display: inline-flex;
  background: rgba(0, 0, 0, 0.35);
  padding: 2.5px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  gap: 2px;
  min-width: 100%;
}

.segmented-day-btn {
  flex: 1 0 auto;
  padding: 4px 10px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #94a3b8;
  border-radius: 6px;
  background: transparent;
  border: none;
  cursor: pointer;
  transition: all 0.15s ease;
  text-align: center;
  min-height: 26px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.segmented-day-btn.active {
  background: #f97316;
  color: #ffffff;
  box-shadow: 0 1px 4px rgba(249, 115, 22, 0.4);
}

/* SEARCH INPUT */
.search-input-wrapper {
  position: relative;
  width: 100%;
}

.search-icon {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
}

.mobile-search-input {
  width: 100%;
  height: 38px;
  background: rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 8px;
  padding: 0 32px 0 32px;
  font-size: 0.75rem;
  color: #f8fafc;
  outline: none;
  transition: border-color 0.2s ease, background 0.2s ease;
}

.mobile-search-input:focus {
  border-color: #f97316;
  background: rgba(0, 0, 0, 0.45);
}

.mobile-search-input::placeholder {
  color: #64748b;
  font-size: 0.72rem;
}

.clear-search-btn {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* 3. CARD SEGNALAZIONI MOBILE FIRST */
.format-tip-banner {
  background: rgba(56, 189, 248, 0.08);
  border: 1px solid rgba(56, 189, 248, 0.25);
  border-radius: 8px;
}

.mobile-qc-body {
  background: #090d16;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}

.mobile-anomaly-card {
  background: rgba(15, 23, 42, 0.75);
  border-radius: 14px;
  padding: 12px;
  border: 1px solid rgba(255, 255, 255, 0.07);
  transition: transform 0.15s ease, border-color 0.15s ease;
}

.mobile-anomaly-card.card-error {
  border-left: 3px solid #ef4444;
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.06) 0%, rgba(15, 23, 42, 0.85) 100%);
}

.mobile-anomaly-card.card-warning {
  border-left: 3px solid #f59e0b;
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.06) 0%, rgba(15, 23, 42, 0.85) 100%);
}

.mobile-anomaly-card.card-info {
  border-left: 3px solid #3b82f6;
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.06) 0%, rgba(15, 23, 42, 0.85) 100%);
}

/* PILLS & BADGES */
.badge-pill {
  font-size: 0.60rem;
  font-weight: 800;
  padding: 2px 6px;
  border-radius: 4px;
  text-transform: uppercase;
}

.badge-coord {
  background: rgba(249, 115, 22, 0.2);
  color: #fb923c;
  border: 1px solid rgba(249, 115, 22, 0.35);
}

.badge-sector {
  background: rgba(255, 255, 255, 0.06);
  color: #cbd5e1;
}

.badge-week {
  background: rgba(168, 85, 247, 0.2);
  color: #d8b4fe;
  border: 1px solid rgba(168, 85, 247, 0.3);
}

.badge-severity {
  font-size: 0.60rem;
  font-weight: 800;
  padding: 2px 7px;
  border-radius: 9999px;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}

.badge-severity.sev-error {
  background: rgba(239, 68, 68, 0.2);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.4);
}

.badge-severity.sev-warning {
  background: rgba(245, 158, 11, 0.2);
  color: #fde68a;
  border: 1px solid rgba(245, 158, 11, 0.4);
}

.badge-severity.sev-info {
  background: rgba(59, 130, 246, 0.2);
  color: #93c5fd;
  border: 1px solid rgba(59, 130, 246, 0.4);
}

/* EXERCISE TITLE */
.exercise-title-row {
  border-radius: 6px;
  transition: background 0.15s ease;
}

.exercise-title-row:hover {
  background: rgba(249, 115, 22, 0.08);
}

.exercise-name {
  font-size: 0.95rem;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.open-label {
  font-size: 0.65rem;
  color: #f97316;
  font-weight: 700;
}

/* MAIN DATA CARD (INSERITO, INTERPRETAZIONE, PRESCRIZIONE) - MASSIMA PRIORITÀ */
.main-data-card {
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
}

.main-data-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.main-data-label {
  color: #cbd5e1;
  font-weight: 600;
  font-size: 0.84rem; /* ~13.5px */
  letter-spacing: -0.01em;
  white-space: nowrap;
}

.main-data-value {
  text-align: right;
  font-size: 0.96rem; /* ~15.5px */
  font-weight: 700;
  letter-spacing: -0.01em;
  word-break: break-word;
}

.main-data-value.val-inserted {
  color: #fde047; /* Giallo ambra luminoso */
}

.main-data-value.val-interpretation {
  font-weight: 700;
}

.main-data-value.val-prescription {
  color: #ffffff;
  font-weight: 600;
}

/* DIAGNOSTIC BLOCK (SECONDARIO, MOLTO PIÙ PICCOLO E FINO) */
.diagnostic-block {
  padding: 1px 2px;
}

.diagnostic-title {
  font-size: 0.68rem; /* ~11px */
  font-weight: 500;   /* Fino */
  color: #e2e8f0;
  letter-spacing: -0.01em;
}

.diagnostic-desc {
  font-size: 0.62rem; /* ~10px */
  font-weight: 400;   /* Fino/Regular */
  color: #94a3b8;
  line-height: 1.25;
}

.diagnostic-impact {
  font-size: 0.60rem; /* ~9.5px */
  line-height: 1.2;
}

.impact-badge {
  font-size: 0.58rem;
  font-weight: 600;
  color: #fb923c;
  text-transform: uppercase;
}

.impact-text {
  color: #fdba74;
  font-weight: 400;
}

/* ACTION BOX */
.action-box {
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 8px;
  padding: 6px 9px;
}

.suggestion-text {
  font-size: 0.64rem; /* ~10px */
  font-weight: 400;   /* Fino */
  color: #86efac;
}

.btn-correggi-action {
  background: rgba(249, 115, 22, 0.16);
  border: 1px solid rgba(249, 115, 22, 0.4);
  color: #fb923c;
  padding: 6px 14px;
  border-radius: 7px;
  font-size: 0.75rem; /* ~12px */
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 36px;
  white-space: nowrap;
}

.btn-correggi-action:hover,
.btn-correggi-action.btn-active {
  background: #f97316;
  color: #ffffff;
  border-color: #ea580c;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35);
}

/* QUICK EDIT */
.quick-edit-expanded {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.quick-text-input {
  width: 100%;
  height: 40px;
  background: rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(249, 115, 22, 0.4);
  border-radius: 6px;
  padding: 0 10px;
  font-size: 0.78rem;
  color: #ffffff;
  outline: none;
}

.quick-text-input:focus {
  border-color: #f97316;
  box-shadow: 0 0 0 1px #f97316;
}

/* 4. FOOTER STICKY */
.mobile-qc-footer {
  background: rgba(11, 17, 30, 0.95);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
}

.btn-footer-copy {
  font-size: 0.72rem !important;
}

.btn-footer-close {
  font-size: 0.76rem !important;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.35) !important;
}

/* AVATAR SUCCESS */
.success-check-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.35);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
