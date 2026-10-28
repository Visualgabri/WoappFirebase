<template>
  <div class="monitoraggio-container py-2 py-sm-4 px-2 px-sm-6 max-w-7xl mx-auto">
    <!-- HEADER DELLA PAGINA (COMPATTO SU MOBILE) -->
    <div class="d-flex justify-space-between align-center gap-2 mb-3 mb-sm-5">
      <div>
        <div class="d-flex align-center gap-2 mb-0.5">
          <v-chip size="x-small" color="primary" variant="flat" class="font-weight-black tracking-wider text-uppercase px-1.5" style="font-size: 0.60rem; height: 18px;">
            Coach Dashboard
          </v-chip>
          <span class="text-caption text-slate font-weight-medium" style="font-size: 0.70rem;">
            Sync: {{ orarioUltimoSync || 'Adesso' }}
          </span>
        </div>
        <h1 class="text-h6 text-sm-h4 font-weight-black d-flex align-center gap-1.5 mb-0 title-gradient">
          <v-icon color="primary" :size="$vuetify.display.xs ? 22 : 30" class="mr-0.5">mdi-chart-timeline-variant-shimmer</v-icon>
          Monitoraggio Settimane
        </h1>
        <p class="text-caption text-slate mb-0 d-none d-sm-block mt-0.5">
          Riepilogo in tempo reale dell'avanzamento dei tuoi atleti, settimane rimanenti e aderenza agli allenamenti.
        </p>
      </div>

      <!-- Azione Sincronizza (Icon-only su mobile, con testo su desktop) -->
      <div class="d-flex align-center gap-1.5">
        <v-btn
          color="primary"
          variant="flat"
          class="rounded-xl font-weight-bold elevation-2 btn-sync-pulse"
          :size="$vuetify.display.xs ? 'small' : 'default'"
          :icon="$vuetify.display.xs"
          :loading="caricamentoInCorso"
          @click="ricaricaDati(true)"
          id="btn-sync-monitoraggio"
          title="Sincronizza Dati"
          aria-label="Sincronizza Dati"
        >
          <v-icon :start="!$vuetify.display.xs" size="18">mdi-refresh</v-icon>
          <span v-if="!$vuetify.display.xs">Sincronizza</span>
        </v-btn>
      </div>
    </div>

    <!-- METRICHE KPI COMPATTE (PREMIUM 2x2 SU MOBILE, 4 IN RIGA SU DESKTOP) -->
    <v-row class="mb-3 mb-sm-5 g-2 g-sm-3">
      <!-- Card Totale Attivi -->
      <v-col cols="6" sm="3">
        <v-card class="kpi-card card-glass pa-2.5 pa-sm-3 rounded-2xl h-100" elevation="2">
          <div class="d-flex justify-space-between align-center mb-0.5">
            <span class="kpi-label text-caption font-weight-bold text-slate uppercase">Atleti Attivi</span>
            <v-icon color="blue-lighten-2" :size="$vuetify.display.xs ? 18 : 20">mdi-account-group</v-icon>
          </div>
          <div class="kpi-value text-h5 text-sm-h4 font-weight-black text-theme-primary mb-0.5">
            {{ statistiche.totaleAttivi }}
          </div>
          <div class="kpi-subtext text-super-caption text-slate">Clienti nel programma</div>
        </v-card>
      </v-col>

      <!-- Card In Scadenza (W5-6 in corso) -->
      <v-col cols="6" sm="3">
        <v-card class="kpi-card card-glass pa-2.5 pa-sm-3 rounded-2xl h-100 kpi-card-warning" elevation="2">
          <div class="d-flex justify-space-between align-center mb-0.5">
            <span class="kpi-label text-caption font-weight-bold text-orange-lighten-2 uppercase">In Scadenza (W5-6)</span>
            <v-icon color="orange-lighten-2" :size="$vuetify.display.xs ? 18 : 20" class="animate-pulse">mdi-alert-decagram</v-icon>
          </div>
          <div class="kpi-value text-h5 text-sm-h4 font-weight-black text-orange-accent-3 mb-0.5">
            {{ statistiche.inScadenza }}
          </div>
          <div class="kpi-subtext text-super-caption text-orange-lighten-3 font-weight-bold">Prepara nuove schede!</div>
        </v-card>
      </v-col>

      <!-- Card Completati -->
      <v-col cols="6" sm="3">
        <v-card class="kpi-card card-glass pa-2.5 pa-sm-3 rounded-2xl h-100 kpi-card-success" elevation="2">
          <div class="d-flex justify-space-between align-center mb-0.5">
            <span class="kpi-label text-caption font-weight-bold text-green-lighten-2 uppercase">Completati</span>
            <v-icon color="green-lighten-2" :size="$vuetify.display.xs ? 18 : 20">mdi-trophy</v-icon>
          </div>
          <div class="kpi-value text-h5 text-sm-h4 font-weight-black text-green-accent-3 mb-0.5">
            {{ statistiche.completati }}
          </div>
          <div class="kpi-subtext text-super-caption text-green-lighten-3 font-weight-bold">Hanno finito le 6W</div>
        </v-card>
      </v-col>

      <!-- Card Inattivi (> 5gg) -->
      <v-col cols="6" sm="3">
        <v-card class="kpi-card card-glass pa-2.5 pa-sm-3 rounded-2xl h-100 kpi-card-danger" elevation="2">
          <div class="d-flex justify-space-between align-center mb-0.5">
            <span class="kpi-label text-caption font-weight-bold text-red-lighten-2 uppercase">Inattivi (>5gg)</span>
            <v-icon color="red-lighten-2" :size="$vuetify.display.xs ? 18 : 20">mdi-clock-alert-outline</v-icon>
          </div>
          <div class="kpi-value text-h5 text-sm-h4 font-weight-black text-red-accent-3 mb-0.5">
            {{ statistiche.inattivi }}
          </div>
          <div class="kpi-subtext text-super-caption text-red-lighten-3 font-weight-bold">Da contattare via WA</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- BARRA DI CONTROLLO: RICERCA, FILTRI ORIZZONTALI E ORDINAMENTO -->
    <v-card class="card-glass pa-2.5 pa-sm-3 rounded-2xl mb-3 mb-sm-4 elevation-1">
      <div class="d-flex flex-column flex-md-row justify-space-between align-md-center gap-2">
        <!-- Campo Ricerca Compatto -->
        <div class="flex-grow-1" style="max-width: 360px;">
          <v-text-field
            v-model="ricercaTesto"
            density="compact"
            variant="solo-filled"
            flat
            rounded="xl"
            hide-details
            clearable
            placeholder="Cerca atleta o scheda..."
            prepend-inner-icon="mdi-magnify"
            class="search-input-field"
            id="input-ricerca-atleta"
          ></v-text-field>
        </div>

        <!-- Chips Filtro Rapido con Scroll Orizzontale Fluido -->
        <div class="filter-chips-scroll py-0.5">
          <v-chip
            v-for="filtro in listaFiltri"
            :key="filtro.id"
            size="small"
            :color="filtroAttivo === filtro.id ? 'primary' : 'default'"
            :variant="filtroAttivo === filtro.id ? 'flat' : 'tonal'"
            class="font-weight-bold rounded-lg cursor-pointer px-2"
            @click="filtroAttivo = filtro.id"
          >
            <v-icon start size="14" v-if="filtro.icon">{{ filtro.icon }}</v-icon>
            {{ filtro.label }}
            <span class="ml-1 opacity-75">({{ filtro.conteggio }})</span>
          </v-chip>
        </div>

        <!-- Selettore Ordinamento -->
        <div class="d-flex align-center gap-1.5 flex-shrink-0">
          <span class="text-caption text-slate font-weight-bold text-no-wrap d-none d-lg-inline">Ordina:</span>
          <v-select
            v-model="ordinamentoSelezionato"
            :items="opzioniOrdinamento"
            item-title="label"
            item-value="value"
            density="compact"
            variant="solo-filled"
            flat
            rounded="xl"
            hide-details
            class="sort-select-field"
            style="min-width: 190px;"
          ></v-select>
        </div>
      </div>
    </v-card>

    <!-- STATO CARICAMENTO SCHELETRO -->
    <div v-if="caricamentoInCorso && listaClienti.length === 0" class="py-12 text-center">
      <v-progress-circular indeterminate color="primary" size="40" width="3" class="mb-3"></v-progress-circular>
      <div class="text-body-2 font-weight-bold text-slate">Caricamento stato atleti in corso...</div>
      <div class="text-caption text-slate-dark">Lettura ottimizzata e calcolo avanzamento</div>
    </div>

    <!-- STATO NESSUN RISULTATO -->
    <v-card v-else-if="clientiFiltrati.length === 0" class="card-glass pa-6 rounded-2xl text-center my-4">
      <v-icon size="40" color="grey" class="mb-2">mdi-account-search-outline</v-icon>
      <h3 class="text-subtitle-1 font-weight-bold text-slate mb-1">Nessun atleta trovato</h3>
      <p class="text-caption text-slate-dark mb-3">
        Nessun cliente corrisponde ai criteri di ricerca o al filtro "{{ filtroAttivoLabel }}" selezionato.
      </p>
      <v-btn color="primary" variant="tonal" rounded="xl" size="small" @click="resettaFiltri">
        Ripristina Tutti i Filtri
      </v-btn>
    </v-card>

    <!-- LISTA CARD DEI CLIENTI ORDINATI (PREMIUM & ULTRA-COMPATTA) -->
    <div v-else class="d-flex flex-column gap-2.5">
      <v-card
        v-for="cliente in clientiFiltrati"
        :key="cliente.id"
        class="card-glass card-cliente-progress rounded-2xl pa-2.5 pa-sm-3.5 transition-all"
        :class="{
          'bordo-completato': cliente.programmaCompletato,
          'bordo-scadenza-urgente': !cliente.programmaCompletato && cliente.settimanaCorrente === 6,
          'bordo-scadenza-vicina': !cliente.programmaCompletato && cliente.settimanaCorrente === 5,
          'bordo-inattivo-allerta': cliente.giorniInattivita > 5
        }"
        elevation="2"
      >
        <!-- RIGA 1: AVATAR, NOME, BADGE SCHEDA E PULSANTI AD SOLE ICONE -->
        <div class="d-flex justify-space-between align-center gap-2 mb-1.5">
          <!-- Info Atleta Principale -->
          <div class="d-flex align-center gap-2 min-width-0 flex-grow-1">
            <!-- Avatar Iniziali -->
            <v-avatar
              :color="cliente.sesso === 'F' ? 'pink-darken-3' : 'blue-darken-3'"
              :size="$vuetify.display.xs ? 36 : 42"
              class="font-weight-black text-white elevation-2 flex-shrink-0 avatar-atleta"
            >
              {{ getIniziali(cliente.nomeCompleto) }}
            </v-avatar>

            <!-- Nome Atleta e Scheda -->
            <div class="min-width-0 flex-grow-1">
              <div class="d-flex align-center flex-wrap gap-1">
                <span
                  class="text-subtitle-2 text-sm-subtitle-1 font-weight-black text-slate-dark text-truncate cursor-pointer nome-atleta-link"
                  @click="apriSchedaAtleta(cliente)"
                  :title="cliente.nomeCompleto"
                >
                  {{ cliente.nomeCompleto }}
                </span>
                
                <!-- Badge Scheda Attiva -->
                <v-chip
                  size="x-small"
                  color="blue-grey-darken-3"
                  variant="flat"
                  class="font-weight-bold text-blue-lighten-2 px-1.5"
                  style="font-size: 0.62rem; height: 18px;"
                >
                  #{{ cliente.scheda }}
                </v-chip>
              </div>

              <!-- Recency / Ultimo Inserimento -->
              <div class="d-flex align-center text-caption font-weight-medium text-slate text-truncate mt-0.5" style="font-size: 0.70rem;">
                <!-- Pallino Semaforo Recency -->
                <span
                  class="semaforo-dot mr-1.5"
                  :class="'semaforo-' + cliente.statoInattivita"
                  :title="cliente.statoInattivita === 'green' ? 'Attivo di recente' : (cliente.statoInattivita === 'yellow' ? 'Pausa da 3-5 giorni' : 'Inattivo da oltre 5 giorni!')"
                ></span>
                <span class="text-truncate">
                  {{ cliente.tempoTrascorso }}
                </span>
              </div>
            </div>
          </div>

          <!-- PULSANTI AZIONE RAPIDA AD SOLE ICONE (SENZA TESTO) -->
          <div class="d-flex align-center gap-1.5 flex-shrink-0">
            <!-- Pulsante WhatsApp (solo icona) -->
            <v-btn
              icon="mdi-whatsapp"
              size="small"
              color="green-darken-3"
              variant="flat"
              class="rounded-xl btn-action-icon text-white"
              @click="apriWhatsAppAtleta(cliente)"
              title="Invia messaggio su WhatsApp"
              aria-label="WhatsApp"
            ></v-btn>

            <!-- Pulsante Apri Scheda (solo icona) -->
            <v-btn
              icon="mdi-dumbbell"
              size="small"
              color="primary"
              variant="flat"
              class="rounded-xl btn-action-icon"
              @click="apriSchedaAtleta(cliente)"
              title="Apri Scheda Allenamento"
              aria-label="Apri Scheda"
            ></v-btn>

            <!-- Menu opzioni extra (solo icona) -->
            <v-menu location="bottom end">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="tonal"
                  v-bind="props"
                  class="rounded-xl btn-action-icon text-slate-dark"
                  title="Altre opzioni"
                  aria-label="Altre opzioni"
                ></v-btn>
              </template>
              <v-list class="card-glass rounded-xl py-1" elevation="4">
                <v-list-item
                  density="compact"
                  prepend-icon="mdi-check-circle-outline"
                  title="Promemoria Chiusura (WhatsApp)"
                  @click="inviaPromemoriaChiusuraWhatsApp(cliente)"
                ></v-list-item>
                <v-list-item
                  density="compact"
                  prepend-icon="mdi-bell-ring-outline"
                  title="Promemoria Chiusura (In-App)"
                  @click="inviaPromemoriaChiusuraInApp(cliente)"
                ></v-list-item>
                <v-list-item
                  density="compact"
                  prepend-icon="mdi-refresh"
                  title="Ricalcola da STORYBOARD"
                  @click="ricalcolaSingolo(cliente)"
                  :disabled="cliente.loadingRicalcolo"
                >
                  <template v-slot:append v-if="cliente.loadingRicalcolo">
                    <v-progress-circular indeterminate size="16" width="2"></v-progress-circular>
                  </template>
                </v-list-item>
              </v-list>
            </v-menu>
          </div>
        </div>

        <!-- RIGA 2: BADGE STATO URGENZA / COMPLETAMENTO -->
        <div class="d-flex align-center flex-wrap gap-1.5 mb-2">
          <v-chip
            v-if="cliente.programmaCompletato"
            size="x-small"
            color="green-darken-4"
            variant="flat"
            class="font-weight-black text-white px-2"
            style="font-size: 0.62rem; height: 19px;"
          >
            🏆 PROGRAMMA COMPLETATO
          </v-chip>
          <v-chip
            v-else-if="cliente.settimanaCorrente === 6"
            size="x-small"
            color="red-darken-4"
            variant="flat"
            class="font-weight-black text-white chip-pulse-red px-2"
            style="font-size: 0.62rem; height: 19px;"
          >
            🔥 ULTIMA SETTIMANA (In corso)
          </v-chip>
          <v-chip
            v-else-if="cliente.settimanaCorrente === 5"
            size="x-small"
            color="orange-darken-4"
            variant="flat"
            class="font-weight-bold text-orange-lighten-2 px-2"
            style="font-size: 0.62rem; height: 19px;"
          >
            ⚠️ IN SCADENZA (Manca 1 sett)
          </v-chip>
          <v-chip
            v-else-if="cliente.settimanaCorrente === 1"
            size="x-small"
            color="green-darken-4"
            variant="flat"
            class="font-weight-bold text-green-lighten-2 px-2"
            style="font-size: 0.62rem; height: 19px;"
          >
            🌱 APPENA INIZIATO
          </v-chip>

          <span v-if="cliente.dataFormattata" class="text-super-caption opacity-50 ml-auto d-none d-sm-inline">
            {{ cliente.dataFormattata }}
          </span>
        </div>

        <!-- PROGRESS BAR CON SEGMENTI CAPSULE SETTIMANE (1 A 6) -->
        <div class="pt-2 border-top-soft">
          <!-- Intestazione Barra -->
          <div class="d-flex justify-space-between align-center mb-1">
            <div class="d-flex align-center gap-1.5">
              <span class="text-caption font-weight-black text-theme-primary" style="font-size: 0.72rem;">
                WEEK {{ cliente.settimanaCorrente }} di {{ cliente.settimaneTotali }}
              </span>
              <span class="text-caption text-slate font-weight-bold" style="font-size: 0.70rem;">
                ({{ cliente.percCompletamento }}%)
              </span>
            </div>

            <!-- Settimane Mancanti o Stato Completato -->
            <div class="text-caption font-weight-bold" :class="cliente.programmaCompletato ? 'text-green-lighten-2' : (cliente.settimanaCorrente >= 5 ? 'text-orange-lighten-2' : 'text-slate')" style="font-size: 0.70rem;">
              <v-icon size="13" class="mr-0.5" :color="cliente.programmaCompletato ? 'green-lighten-2' : (cliente.settimanaCorrente >= 5 ? 'orange-lighten-2' : 'grey')">
                {{ cliente.programmaCompletato ? 'mdi-trophy' : 'mdi-timer-sand' }}
              </v-icon>
              <span v-if="cliente.programmaCompletato">
                Programma completato! 🎉
              </span>
              <span v-else-if="cliente.settimanaCorrente === 6">
                {{ cliente.giorniRimanenti !== null && cliente.giorniRimanenti !== undefined ? (cliente.giorniRimanenti === 1 ? 'Manca 1 workout W6' : `Mancano ${cliente.giorniRimanenti} workout W6`) : 'Ultima settimana in corso 🔥' }}
              </span>
              <span v-else-if="cliente.settimaneMancanti === 1">
                Manca solo 1 settimana
              </span>
              <span v-else>
                Mancano {{ cliente.settimaneMancanti }} settimane
              </span>
            </div>
          </div>

          <!-- Capsule visuali Week 1..6 -->
          <div class="tracker-capsule-container">
            <div
              v-for="w in 6"
              :key="w"
              class="week-capsule"
              :class="{
                'capsule-completed': w < cliente.settimanaCorrente || (w === 6 && cliente.programmaCompletato),
                'capsule-active': w === cliente.settimanaCorrente && !cliente.programmaCompletato,
                'capsule-pending': w > cliente.settimanaCorrente
              }"
            >
              <div class="capsule-content">
                <v-icon v-if="w < cliente.settimanaCorrente || (w === 6 && cliente.programmaCompletato)" size="11" class="capsule-icon">mdi-check-bold</v-icon>
                <span v-else-if="w === cliente.settimanaCorrente && !cliente.programmaCompletato" class="capsule-icon-pulse">●</span>
                <span class="capsule-label">W{{ w }}</span>
              </div>
            </div>
          </div>

          <!-- Barra di Progresso Lineare -->
          <v-progress-linear
            :model-value="cliente.percCompletamento"
            height="4"
            rounded
            class="mt-1.5 custom-progress-bar"
            :color="cliente.programmaCompletato ? 'green-accent-3' : (cliente.settimanaCorrente === 6 ? 'red-accent-3' : (cliente.settimanaCorrente === 5 ? 'orange-accent-3' : 'primary'))"
          ></v-progress-linear>
        </div>
      </v-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { setSelectedAthlete, setSelectedSheet } from '../authStore.js';
import {
  caricaRiepilogoClientiPerCoach,
  ricalcolaESalvaStatoAtleta
} from '../utils/riepilogoManager.js';

const router = useRouter();

// Stato principale
const listaClienti = ref([]);
const caricamentoInCorso = ref(false);
const orarioUltimoSync = ref('');
const ricercaTesto = ref('');
const filtroAttivo = ref('tutti');
const ordinamentoSelezionato = ref('in_scadenza_prima');

// Opzioni Ordinamento
const opzioniOrdinamento = [
  { label: 'In scadenza prima (W6 ➔ W1)', value: 'in_scadenza_prima' },
  { label: 'Nuovi prima (W1 ➔ W6)', value: 'appena_iniziati_prima' },
  { label: 'Più inattivi prima', value: 'piu_inattivi_prima' },
  { label: 'Più recenti prima', value: 'piu_recenti_prima' },
  { label: 'Nome cliente (A-Z)', value: 'nome_az' }
];

// Helper per iniziali
const getIniziali = (nome) => {
  if (!nome) return 'AT';
  const parts = nome.trim().split(' ');
  if (parts.length >= 2) {
    return `${parts[0][0] || ''}${parts[1][0] || ''}`.toUpperCase();
  }
  return (nome.substring(0, 2) || 'AT').toUpperCase();
};

// Carica dati da Cache o Firestore (Zero letture extra se in cache!)
const ricaricaDati = async (force = false) => {
  caricamentoInCorso.value = true;
  try {
    const res = await caricaRiepilogoClientiPerCoach(force);
    listaClienti.value = res.map(c => ({ ...c, loadingRicalcolo: false }));
    
    const now = new Date();
    orarioUltimoSync.value = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  } catch (err) {
    console.error("Errore caricamento dati monitoraggio coach:", err);
  } finally {
    caricamentoInCorso.value = false;
  }
};

// Ricalcolo singolo atleta da STORYBOARD (on-demand su richiesta esplicita coach)
const ricalcolaSingolo = async (cliente) => {
  cliente.loadingRicalcolo = true;
  try {
    const res = await ricalcolaESalvaStatoAtleta(cliente.id, cliente.scheda);
    if (res) {
      await ricaricaDati(true);
    }
  } catch (e) {
    console.error("Errore ricalcolo singolo:", e);
  } finally {
    cliente.loadingRicalcolo = false;
  }
};

// Statistiche generali calcolate
const statistiche = computed(() => {
  const attivi = listaClienti.value.filter(c => c.attivo);
  const inScadenza = attivi.filter(c => c.settimanaCorrente >= 5 && !c.programmaCompletato).length;
  const completati = attivi.filter(c => c.programmaCompletato).length;
  const inattivi = attivi.filter(c => c.statoInattivita === 'red').length;

  let sommaWeek = 0;
  attivi.forEach(c => {
    sommaWeek += (c.settimanaCorrente || 1);
  });
  const weekMedia = attivi.length > 0 ? (sommaWeek / attivi.length).toFixed(1) : 1;
  const avanzamentoMedio = attivi.length > 0 ? Math.round((weekMedia / 6) * 100) : 0;

  return {
    totaleAttivi: attivi.length,
    inScadenza,
    completati,
    inattivi,
    weekMedia,
    avanzamentoMedio
  };
});

// Lista filtri con conteggi dinamici
const listaFiltri = computed(() => {
  const attivi = listaClienti.value.filter(c => c.attivo);
  return [
    { id: 'tutti', label: 'Tutti', icon: 'mdi-account-group', conteggio: attivi.length },
    { id: 'in_scadenza', label: '🚨 In Scadenza (W5-6)', icon: 'mdi-alert-decagram', conteggio: attivi.filter(c => c.settimanaCorrente >= 5 && !c.programmaCompletato).length },
    { id: 'completati', label: '🏆 Completati', icon: 'mdi-trophy', conteggio: attivi.filter(c => c.programmaCompletato).length },
    { id: 'inattivi', label: '⚠️ Inattivi (>5gg)', icon: 'mdi-clock-alert', conteggio: attivi.filter(c => c.statoInattivita === 'red').length },
    { id: 'in_corso', label: '⚡ In Corso (W2-4)', icon: 'mdi-dumbbell', conteggio: attivi.filter(c => c.settimanaCorrente >= 2 && c.settimanaCorrente <= 4 && !c.programmaCompletato).length },
    { id: 'appena_iniziati', label: '🌱 Nuovi (W1)', icon: 'mdi-seed-outline', conteggio: attivi.filter(c => c.settimanaCorrente === 1 && !c.programmaCompletato).length }
  ];
});

const filtroAttivoLabel = computed(() => {
  const f = listaFiltri.value.find(x => x.id === filtroAttivo.value);
  return f ? f.label : 'Tutti';
});

const resettaFiltri = () => {
  ricercaTesto.value = '';
  filtroAttivo.value = 'tutti';
};

// Navigazione e Apertura Scheda
const apriSchedaAtleta = (cliente) => {
  setSelectedAthlete(String(cliente.id));
  if (cliente.scheda && cliente.scheda !== 'N/D') {
    setSelectedSheet(String(cliente.scheda));
  }
  router.push('/');
};

// Apertura Chat WhatsApp con messaggio precompilato calibrato
const apriWhatsAppAtleta = (cliente) => {
  const nome = cliente.nome || cliente.nomeCompleto || 'Atleta';
  let messaggio = '';

  if (cliente.programmaCompletato) {
    messaggio = `Ciao ${nome}! Complimenti per aver completato tutte le 6 settimane della scheda #${cliente.scheda}! 🎉 Come ti senti? Ti preparo la nuova scheda?`;
  } else if (cliente.statoInattivita === 'red') {
    messaggio = `Ciao ${nome}! Sono Gabriele. Come va? Ho notato che non registri allenamenti da un po' sulla scheda #${cliente.scheda}. Tutto bene? Fammi sapere se posso aiutarti!`;
  } else if (cliente.settimanaCorrente === 6) {
    messaggio = `Ciao ${nome}! Sei all'ultima settimana (Week 6) della scheda #${cliente.scheda}! Dacci dentro per questi ultimi allenamenti e fammi sapere quando hai finito che ti preparo il nuovo programma!`;
  } else {
    messaggio = `Ciao ${nome}! Come procede con la Week ${cliente.settimanaCorrente} della scheda #${cliente.scheda}?`;
  }

  const url = `https://wa.me/?text=${encodeURIComponent(messaggio)}`;
  window.open(url, '_blank');
};

// Invio rapido del promemoria di chiusura settimana su WhatsApp
const inviaPromemoriaChiusuraWhatsApp = (cliente) => {
  const rawNome = cliente.nome || cliente.nomeCompleto || 'Atleta';
  const nome = rawNome.trim().split(' ')[0];
  const messaggio = `Ciao ${nome}! Ricordati di chiudere il workout quando lo hai completato: entra nel tab Workout e metti la spunta sulla settimana completata premendo 'Completa Giorno' in fondo alla scheda (oppure dal pulsante rapido Play ⚡). In questo modo il tuo programma rimarrà sempre sincronizzato e aggiornato!`;
  const url = `https://wa.me/?text=${encodeURIComponent(messaggio)}`;
  window.open(url, '_blank');
};

// Reindirizzamento a Impostazioni per invio notifica in-app con template precompilato
const inviaPromemoriaChiusuraInApp = (cliente) => {
  router.push({
    path: '/impostazioni',
    query: {
      action: 'promemoria_chiusura',
      atletaId: String(cliente.id),
      t: Date.now()
    }
  });
};

// Filtraggio e Ordinamento Clienti
const clientiFiltrati = computed(() => {
  let list = listaClienti.value.filter(c => c.attivo);

  // Filtro testo
  if (ricercaTesto.value && ricercaTesto.value.trim() !== '') {
    const q = ricercaTesto.value.trim().toLowerCase();
    list = list.filter(c => {
      const nomeMatch = c.nomeCompleto.toLowerCase().includes(q);
      const idMatch = String(c.id).includes(q);
      const schedaMatch = String(c.scheda).includes(q);
      return nomeMatch || idMatch || schedaMatch;
    });
  }

  // Filtro Categoria
  if (filtroAttivo.value === 'in_scadenza') {
    list = list.filter(c => c.settimanaCorrente >= 5 && !c.programmaCompletato);
  } else if (filtroAttivo.value === 'completati') {
    list = list.filter(c => c.programmaCompletato);
  } else if (filtroAttivo.value === 'inattivi') {
    list = list.filter(c => c.statoInattivita === 'red');
  } else if (filtroAttivo.value === 'in_corso') {
    list = list.filter(c => c.settimanaCorrente >= 2 && c.settimanaCorrente <= 4 && !c.programmaCompletato);
  } else if (filtroAttivo.value === 'appena_iniziati') {
    list = list.filter(c => c.settimanaCorrente === 1 && !c.programmaCompletato);
  }

  // Ordinamento
  return list.sort((a, b) => {
    if (ordinamentoSelezionato.value === 'in_scadenza_prima') {
      if (b.settimanaCorrente !== a.settimanaCorrente) {
        return b.settimanaCorrente - a.settimanaCorrente;
      }
      return a.giorniInattivita - b.giorniInattivita;
    } else if (ordinamentoSelezionato.value === 'appena_iniziati_prima') {
      if (a.settimanaCorrente !== b.settimanaCorrente) {
        return a.settimanaCorrente - b.settimanaCorrente;
      }
      return a.giorniInattivita - b.giorniInattivita;
    } else if (ordinamentoSelezionato.value === 'piu_inattivi_prima') {
      return b.giorniInattivita - a.giorniInattivita;
    } else if (ordinamentoSelezionato.value === 'piu_recenti_prima') {
      return a.giorniInattivita - b.giorniInattivita;
    } else if (ordinamentoSelezionato.value === 'nome_az') {
      return a.nomeCompleto.localeCompare(b.nomeCompleto);
    }
    return 0;
  });
});

onMounted(() => {
  ricaricaDati(false);
});
</script>

<style scoped>
.monitoraggio-container {
  min-height: calc(100vh - 120px);
}

.title-gradient {
  letter-spacing: -0.02em;
}

.kpi-card {
  border: 1px solid var(--card-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.kpi-card-warning {
  border-left: 4px solid #f97316 !important;
}

.kpi-card-success {
  border-left: 4px solid #22c55e !important;
}

.kpi-card-danger {
  border-left: 4px solid #ef4444 !important;
}

.kpi-label {
  font-size: 0.70rem;
  letter-spacing: 0.4px;
}

.kpi-value {
  line-height: 1.15;
}

.kpi-subtext {
  font-size: 0.65rem;
}

/* Card Cliente Progress */
.card-cliente-progress {
  border: 1px solid var(--card-border);
  transition: all 0.25s ease;
}

.card-cliente-progress:hover {
  border-color: var(--brand-accent);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.bordo-completato {
  border-left: 4px solid #22c55e !important;
  background: linear-gradient(90deg, rgba(34, 197, 94, 0.06) 0%, transparent 40%) !important;
}

.bordo-scadenza-urgente {
  border-left: 4px solid #ef4444 !important;
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.06) 0%, transparent 40%) !important;
}

.bordo-scadenza-vicina {
  border-left: 4px solid #f59e0b !important;
}

.bordo-inattivo-allerta {
  box-shadow: 0 0 0 1px rgba(239, 68, 68, 0.3) !important;
}

.nome-atleta-link {
  transition: color 0.15s ease;
}
.nome-atleta-link:hover {
  color: var(--brand-accent) !important;
  text-decoration: underline;
}

/* Pulsanti Azione Ad Sole Icone */
.btn-action-icon {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
  transition: transform 0.15s ease;
}

.btn-action-icon:hover {
  transform: scale(1.06);
}

/* Chips Filtro Scrollabile */
.filter-chips-scroll {
  display: flex;
  align-items: center;
  gap: 6px;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;
  white-space: nowrap;
}
.filter-chips-scroll::-webkit-scrollbar {
  display: none;
}

/* Semaforo Dot */
.semaforo-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
  flex-shrink: 0;
}

.semaforo-green {
  background-color: #22c55e;
  box-shadow: 0 0 8px rgba(34, 197, 94, 0.6);
}

.semaforo-yellow {
  background-color: #eab308;
  box-shadow: 0 0 8px rgba(234, 179, 8, 0.6);
}

.semaforo-red {
  background-color: #ef4444;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.8);
  animation: pulse-red-dot 1.8s infinite;
}

@keyframes pulse-red-dot {
  0% { transform: scale(0.95); opacity: 0.8; }
  50% { transform: scale(1.2); opacity: 1; }
  100% { transform: scale(0.95); opacity: 0.8; }
}

/* Capsule Week Tracker */
.tracker-capsule-container {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 5px;
  margin-top: 4px;
}

.week-capsule {
  border-radius: 6px;
  padding: 4px 2px;
  text-align: center;
  font-size: 0.62rem;
  font-weight: 800;
  transition: all 0.2s ease;
  user-select: none;
}

.capsule-completed {
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.4);
  color: #4ade80;
}

.capsule-active {
  background: var(--brand-accent);
  color: #ffffff;
  border: 1px solid var(--brand-accent);
  box-shadow: 0 0 10px rgba(234, 88, 12, 0.4);
  transform: scale(1.02);
}

.capsule-pending {
  background: rgba(255, 255, 255, 0.03);
  border: 1px dashed rgba(255, 255, 255, 0.12);
  color: #64748b;
}

.capsule-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
}

.capsule-icon-pulse {
  color: #ffffff;
  font-size: 0.50rem;
  animation: blink 1.2s infinite;
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.chip-pulse-red {
  animation: pulse-red-chip 2s infinite;
}

@keyframes pulse-red-chip {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.04); }
}

.btn-sync-pulse:hover {
  transform: scale(1.02);
}

.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}

[data-theme='light'] .border-top-soft {
  border-top: 1px solid rgba(0, 0, 0, 0.06);
}

[data-theme='light'] .week-capsule.capsule-pending {
  background: rgba(0, 0, 0, 0.03);
  border: 1px dashed rgba(0, 0, 0, 0.15);
  color: #94a3b8;
}

[data-theme='light'] .card-cliente-progress:hover {
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.08);
}

/* OTTIMIZZAZIONI SMARTPHONE (< 600px) */
@media (max-width: 600px) {
  .monitoraggio-container {
    padding-left: 8px !important;
    padding-right: 8px !important;
    padding-top: 8px !important;
  }
  
  .kpi-card {
    padding: 8px 10px !important;
  }
  
  .kpi-value {
    font-size: 1.25rem !important;
  }

  .kpi-label {
    font-size: 0.62rem !important;
  }

  .kpi-subtext {
    font-size: 0.58rem !important;
  }

  .card-cliente-progress {
    padding: 10px 12px !important;
  }

  .btn-action-icon {
    width: 32px !important;
    height: 32px !important;
    min-width: 32px !important;
  }

  .tracker-capsule-container {
    gap: 3.5px !important;
  }

  .week-capsule {
    padding: 3.5px 1px !important;
    font-size: 0.58rem !important;
    border-radius: 5px !important;
  }
}
</style>
