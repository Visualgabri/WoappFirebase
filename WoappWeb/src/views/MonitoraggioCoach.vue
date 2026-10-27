<template>
  <div class="monitoraggio-container py-4 px-3 px-sm-6 max-w-7xl mx-auto">
    <!-- HEADER DELLA PAGINA -->
    <div class="d-flex flex-column flex-sm-row justify-space-between align-sm-center gap-3 mb-6">
      <div>
        <div class="d-flex align-center gap-2 mb-1">
          <v-chip size="x-small" color="primary" variant="flat" class="font-weight-black tracking-wider text-uppercase px-2" style="font-size: 0.65rem;">
            Coach Dashboard
          </v-chip>
          <span class="text-caption text-slate font-weight-medium">
            Ultimo sync: {{ orarioUltimoSync || 'Adesso' }}
          </span>
        </div>
        <h1 class="text-h5 text-sm-h4 font-weight-black d-flex align-center gap-2 mb-1 title-gradient">
          <v-icon color="primary" size="32" class="mr-1">mdi-chart-timeline-variant-shimmer</v-icon>
          Monitoraggio Settimane
        </h1>
        <p class="text-body-2 text-slate mb-0">
          Riepilogo in tempo reale dell'avanzamento dei tuoi atleti, settimane rimanenti e aderenza agli allenamenti.
        </p>
      </div>

      <!-- Azioni Header -->
      <div class="d-flex align-center gap-2 flex-wrap">
        <v-btn
          color="primary"
          variant="flat"
          class="rounded-xl font-weight-bold elevation-2 btn-sync-pulse"
          :loading="caricamentoInCorso"
          @click="ricaricaDati(true)"
          id="btn-sync-monitoraggio"
        >
          <v-icon start size="18">mdi-refresh</v-icon>
          Sincronizza Dati
        </v-btn>
      </div>
    </div>

    <!-- METRICHE KPI A COLPO D'OCCHIO -->
    <v-row class="mb-5 g-3">
      <!-- Card Totale Attivi -->
      <v-col cols="6" sm="3">
        <v-card class="kpi-card card-glass pa-3 rounded-2xl h-100" elevation="2">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="text-caption font-weight-bold text-slate uppercase">Atleti Attivi</span>
            <v-icon color="blue-lighten-2" size="20">mdi-account-group</v-icon>
          </div>
          <div class="text-h4 font-weight-black text-theme-primary mb-0.5">
            {{ statistiche.totaleAttivi }}
          </div>
          <div class="text-super-caption text-slate">Clienti nel programma</div>
        </v-card>
      </v-col>

      <!-- Card In Scadenza -->
      <v-col cols="6" sm="3">
        <v-card class="kpi-card card-glass pa-3 rounded-2xl h-100 kpi-card-warning" elevation="2">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="text-caption font-weight-bold text-orange-lighten-2 uppercase">In Scadenza</span>
            <v-icon color="orange-lighten-2" size="20" class="animate-pulse">mdi-alert-decagram</v-icon>
          </div>
          <div class="text-h4 font-weight-black text-orange-accent-3 mb-0.5">
            {{ statistiche.inScadenza }}
          </div>
          <div class="text-super-caption text-orange-lighten-3 font-weight-bold">Prepara nuove schede!</div>
        </v-card>
      </v-col>

      <!-- Card A Metà / In Corso -->
      <v-col cols="6" sm="3">
        <v-card class="kpi-card card-glass pa-3 rounded-2xl h-100" elevation="2">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="text-caption font-weight-bold text-slate uppercase">Avanzamento Medio</span>
            <v-icon color="green-lighten-2" size="20">mdi-progress-check</v-icon>
          </div>
          <div class="text-h4 font-weight-black text-green-accent-3 mb-0.5">
            {{ statistiche.avanzamentoMedio }}%
          </div>
          <div class="text-super-caption text-slate">Week {{ statistiche.weekMedia }} media</div>
        </v-card>
      </v-col>

      <!-- Card Inattivi (> 5gg) -->
      <v-col cols="6" sm="3">
        <v-card class="kpi-card card-glass pa-3 rounded-2xl h-100 kpi-card-danger" elevation="2">
          <div class="d-flex justify-space-between align-center mb-1">
            <span class="text-caption font-weight-bold text-red-lighten-2 uppercase">Inattivi (>5gg)</span>
            <v-icon color="red-lighten-2" size="20">mdi-clock-alert-outline</v-icon>
          </div>
          <div class="text-h4 font-weight-black text-red-accent-3 mb-0.5">
            {{ statistiche.inattivi }}
          </div>
          <div class="text-super-caption text-red-lighten-3 font-weight-bold">Da contattare via WA</div>
        </v-card>
      </v-col>
    </v-row>

    <!-- BARRA DI CONTROLLO: FILTRI, RICERCA E ORDINAMENTO -->
    <v-card class="card-glass pa-3 rounded-2xl mb-5 elevation-1">
      <div class="d-flex flex-column flex-md-row justify-space-between align-md-center gap-3">
        <!-- Campo Ricerca -->
        <div class="flex-grow-1" style="max-width: 380px;">
          <v-text-field
            v-model="ricercaTesto"
            density="compact"
            variant="solo-filled"
            flat
            rounded="xl"
            hide-details
            clearable
            placeholder="Cerca per nome, cognome o ID..."
            prepend-inner-icon="mdi-magnify"
            class="search-input-field"
            id="input-ricerca-atleta"
          ></v-text-field>
        </div>

        <!-- Chips Filtro Rapido -->
        <div class="d-flex align-center flex-wrap gap-1.5 overflow-x-auto py-1">
          <v-chip
            v-for="filtro in listaFiltri"
            :key="filtro.id"
            size="small"
            :color="filtroAttivo === filtro.id ? 'primary' : 'default'"
            :variant="filtroAttivo === filtro.id ? 'flat' : 'tonal'"
            class="font-weight-bold rounded-lg cursor-pointer"
            @click="filtroAttivo = filtro.id"
          >
            <v-icon start size="14" v-if="filtro.icon">{{ filtro.icon }}</v-icon>
            {{ filtro.label }}
            <span class="ml-1 opacity-75">({{ filtro.conteggio }})</span>
          </v-chip>
        </div>

        <!-- Selettore Ordinamento -->
        <div class="d-flex align-center gap-2">
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
            style="min-width: 220px;"
          ></v-select>
        </div>
      </div>
    </v-card>

    <!-- STATO CARICAMENTO SCHELETRO -->
    <div v-if="caricamentoInCorso && listaClienti.length === 0" class="py-12 text-center">
      <v-progress-circular indeterminate color="primary" size="48" width="4" class="mb-4"></v-progress-circular>
      <div class="text-body-1 font-weight-bold text-slate">Caricamento stato atleti in corso...</div>
      <div class="text-caption text-slate-dark">Lettura ottimizzata e calcolo avanzamento</div>
    </div>

    <!-- STATO NESSUN RISULTATO -->
    <v-card v-else-if="clientiFiltrati.length === 0" class="card-glass pa-8 rounded-2xl text-center my-6">
      <v-icon size="48" color="grey" class="mb-2">mdi-account-search-outline</v-icon>
      <h3 class="text-h6 font-weight-bold text-slate mb-1">Nessun atleta trovato</h3>
      <p class="text-body-2 text-slate-dark mb-4">
        Nessun cliente corrisponde ai criteri di ricerca o al filtro "{{ filtroAttivoLabel }}" selezionato.
      </p>
      <v-btn color="primary" variant="tonal" rounded="xl" @click="resettaFiltri">
        Ripristina Tutti i Filtri
      </v-btn>
    </v-card>

    <!-- LISTA CARD DEI CLIENTI ORDINATI -->
    <div v-else class="d-flex flex-column gap-3">
      <v-card
        v-for="cliente in clientiFiltrati"
        :key="cliente.id"
        class="card-glass card-cliente-progress rounded-2xl pa-4 transition-all"
        :class="{
          'bordo-scadenza-urgente': cliente.settimanaCorrente === 6,
          'bordo-scadenza-vicina': cliente.settimanaCorrente === 5,
          'bordo-inattivo-allerta': cliente.giorniInattivita > 5
        }"
        elevation="2"
      >
        <div class="d-flex flex-column flex-md-row justify-space-between align-md-center gap-3 mb-3">
          <!-- Info Atleta Principale -->
          <div class="d-flex align-center gap-3 min-width-0">
            <!-- Avatar Iniziali con Colore Sesso -->
            <v-avatar
              :color="cliente.sesso === 'F' ? 'pink-darken-3' : 'blue-darken-3'"
              size="44"
              class="font-weight-black text-white elevation-2 flex-shrink-0"
            >
              {{ getIniziali(cliente.nomeCompleto) }}
            </v-avatar>

            <!-- Nome, Scheda e ID -->
            <div class="min-width-0">
              <div class="d-flex align-center flex-wrap gap-2">
                <span
                  class="text-subtitle-1 font-weight-black text-slate-dark text-truncate cursor-pointer nome-atleta-link"
                  @click="apriSchedaAtleta(cliente)"
                  title="Clicca per aprire la scheda di questo atleta"
                >
                  {{ cliente.nomeCompleto }}
                </span>
                
                <!-- Badge Scheda Attiva -->
                <v-chip
                  size="x-small"
                  color="blue-grey-darken-3"
                  variant="flat"
                  class="font-weight-bold text-blue-lighten-2"
                >
                  Scheda #{{ cliente.scheda }}
                </v-chip>

                <!-- Badge Stato Urgenza / Scadenza -->
                <v-chip
                  v-if="cliente.settimanaCorrente === 6"
                  size="x-small"
                  color="red-darken-4"
                  variant="flat"
                  class="font-weight-black text-white chip-pulse-red"
                >
                  🔥 ULTIMA SETTIMANA!
                </v-chip>
                <v-chip
                  v-else-if="cliente.settimanaCorrente === 5"
                  size="x-small"
                  color="orange-darken-4"
                  variant="flat"
                  class="font-weight-bold text-orange-lighten-2"
                >
                  ⚠️ IN SCADENZA (Manca 1 sett)
                </v-chip>
                <v-chip
                  v-else-if="cliente.settimanaCorrente === 1"
                  size="x-small"
                  color="green-darken-4"
                  variant="flat"
                  class="font-weight-bold text-green-lighten-2"
                >
                  🌱 APPENA INIZIATO
                </v-chip>
              </div>

              <!-- Sottotitolo Ultimo Inserimento & Recency -->
              <div class="d-flex align-center flex-wrap gap-2 mt-1">
                <div class="d-flex align-center text-caption font-weight-medium text-slate">
                  <!-- Pallino Semaforo Recency -->
                  <span
                    class="semaforo-dot mr-1.5"
                    :class="'semaforo-' + cliente.statoInattivita"
                    :title="cliente.statoInattivita === 'green' ? 'Attivo di recente' : (cliente.statoInattivita === 'yellow' ? 'Pausa da 3-5 giorni' : 'Inattivo da oltre 5 giorni!')"
                  ></span>
                  <span>Ultimo inserimento: </span>
                  <strong class="ml-1 text-slate-dark" :class="{ 'text-red-lighten-2 font-weight-black': cliente.statoInattivita === 'red' }">
                    {{ cliente.tempoTrascorso }}
                  </strong>
                  <span v-if="cliente.dataFormattata" class="ml-1 opacity-60 text-super-caption">
                    ({{ cliente.dataFormattata }})
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- Pulsanti Azione Rapida -->
          <div class="d-flex align-center gap-2 flex-shrink-0">
            <!-- Pulsante WhatsApp -->
            <v-btn
              size="small"
              color="green-darken-3"
              variant="flat"
              class="rounded-xl font-weight-bold text-white px-3"
              @click="apriWhatsAppAtleta(cliente)"
              title="Invia messaggio di verifica su WhatsApp"
            >
              <v-icon start size="16">mdi-whatsapp</v-icon>
              WhatsApp
            </v-btn>

            <!-- Pulsante Apri Scheda -->
            <v-btn
              size="small"
              color="primary"
              variant="flat"
              class="rounded-xl font-weight-bold px-3"
              @click="apriSchedaAtleta(cliente)"
              title="Apri e consulta gli allenamenti di questo atleta"
            >
              <v-icon start size="16">mdi-dumbbell</v-icon>
              Apri Scheda
            </v-btn>

            <!-- Menu opzioni extra / ricalcolo -->
            <v-menu location="bottom end">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon="mdi-dots-vertical"
                  size="small"
                  variant="text"
                  v-bind="props"
                  class="rounded-lg"
                ></v-btn>
              </template>
              <v-list class="card-glass rounded-xl py-1" elevation="4">
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

        <!-- PROGRESS BAR CON SEGMENTI CAPSULE SETTIMANE (1 A 6) -->
        <div class="mt-2 pt-2 border-top-soft">
          <!-- Intestazione Barra -->
          <div class="d-flex justify-space-between align-center mb-1.5">
            <div class="d-flex align-center gap-2">
              <span class="text-caption font-weight-black text-theme-primary">
                WEEK {{ cliente.settimanaCorrente }} di {{ cliente.settimaneTotali }}
              </span>
              <span class="text-caption text-slate font-weight-bold">
                ({{ cliente.percCompletamento }}%)
              </span>
            </div>

            <!-- Settimane Mancanti -->
            <div class="text-caption font-weight-bold" :class="cliente.settimaneMancanti <= 1 ? 'text-orange-lighten-2' : 'text-slate'">
              <v-icon size="14" class="mr-0.5" :color="cliente.settimaneMancanti <= 1 ? 'orange-lighten-2' : 'grey'">mdi-timer-sand</v-icon>
              <span v-if="cliente.settimaneMancanti === 0">
                Programma completato! 🎉
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
                'capsule-completed': w < cliente.settimanaCorrente,
                'capsule-active': w === cliente.settimanaCorrente,
                'capsule-pending': w > cliente.settimanaCorrente
              }"
            >
              <div class="capsule-content">
                <v-icon v-if="w < cliente.settimanaCorrente" size="12" class="capsule-icon">mdi-check-bold</v-icon>
                <span v-else-if="w === cliente.settimanaCorrente" class="capsule-icon-pulse">●</span>
                <span class="capsule-label">W{{ w }}</span>
              </div>
            </div>
          </div>

          <!-- Barra di Progresso Lineare Morbida -->
          <v-progress-linear
            :model-value="cliente.percCompletamento"
            height="5"
            rounded
            class="mt-2 custom-progress-bar"
            :color="cliente.settimanaCorrente === 6 ? 'red-accent-3' : (cliente.settimanaCorrente === 5 ? 'orange-accent-3' : 'primary')"
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
  { label: 'In alto chi sta per finire (W6 ➔ W1)', value: 'in_scadenza_prima' },
  { label: 'Appena iniziati prima (W1 ➔ W6)', value: 'appena_iniziati_prima' },
  { label: 'Più inattivi prima (Rossi ➔ Verdi)', value: 'piu_inattivi_prima' },
  { label: 'Ultimo inserimento (Più recenti)', value: 'piu_recenti_prima' },
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

// Carica dati da Cache o Firestore
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

// Ricalcolo singolo atleta da STORYBOARD
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
  const inScadenza = attivi.filter(c => c.settimanaCorrente >= 5).length;
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
    inattivi,
    weekMedia,
    avanzamentoMedio
  };
});

// Lista filtri con conteggi dinamici
const listaFiltri = computed(() => {
  const attivi = listaClienti.value.filter(c => c.attivo);
  return [
    { id: 'tutti', label: 'Tutti gli Attivi', icon: 'mdi-account-group', conteggio: attivi.length },
    { id: 'in_scadenza', label: '🚨 In Scadenza (W5-6)', icon: 'mdi-alert-decagram', conteggio: attivi.filter(c => c.settimanaCorrente >= 5).length },
    { id: 'inattivi', label: '⚠️ Inattivi (>5gg)', icon: 'mdi-clock-alert', conteggio: attivi.filter(c => c.statoInattivita === 'red').length },
    { id: 'in_corso', label: '⚡ In Corso (W2-4)', icon: 'mdi-dumbbell', conteggio: attivi.filter(c => c.settimanaCorrente >= 2 && c.settimanaCorrente <= 4).length },
    { id: 'appena_iniziati', label: '🌱 Nuovi (W1)', icon: 'mdi-seed-outline', conteggio: attivi.filter(c => c.settimanaCorrente === 1).length }
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

// Apertura Chat WhatsApp con messaggio precompilato
const apriWhatsAppAtleta = (cliente) => {
  const nome = cliente.nome || cliente.nomeCompleto || 'Atleta';
  let messaggio = '';

  if (cliente.statoInattivita === 'red') {
    messaggio = `Ciao ${nome}! Sono Gabriele. Come va? Ho notato che non registri allenamenti da un po' sulla scheda #${cliente.scheda}. Tutto bene? Fammi sapere se posso aiutarti!`;
  } else if (cliente.settimanaCorrente === 6) {
    messaggio = `Ciao ${nome}! Complimenti per essere arrivato alla Week 6 della scheda #${cliente.scheda}! Come ti senti? Inizio a prepararti il nuovo programma per le prossime settimane?`;
  } else {
    messaggio = `Ciao ${nome}! Come procede con la Week ${cliente.settimanaCorrente} della scheda #${cliente.scheda}?`;
  }

  const url = `https://wa.me/?text=${encodeURIComponent(messaggio)}`;
  window.open(url, '_blank');
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
    list = list.filter(c => c.settimanaCorrente >= 5);
  } else if (filtroAttivo.value === 'inattivi') {
    list = list.filter(c => c.statoInattivita === 'red');
  } else if (filtroAttivo.value === 'in_corso') {
    list = list.filter(c => c.settimanaCorrente >= 2 && c.settimanaCorrente <= 4);
  } else if (filtroAttivo.value === 'appena_iniziati') {
    list = list.filter(c => c.settimanaCorrente === 1);
  }

  // Ordinamento
  return list.sort((a, b) => {
    if (ordinamentoSelezionato.value === 'in_scadenza_prima') {
      // Chi sta per finire in alto (Week 6 ➔ Week 1), poi per giorni inattività
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

.kpi-card-danger {
  border-left: 4px solid #ef4444 !important;
}

.card-cliente-progress {
  border: 1px solid var(--card-border);
  transition: all 0.25s ease;
}

.card-cliente-progress:hover {
  border-color: var(--brand-accent);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
}

.bordo-scadenza-urgente {
  border-left: 5px solid #ef4444 !important;
  background: linear-gradient(90deg, rgba(239, 68, 68, 0.06) 0%, transparent 40%) !important;
}

.bordo-scadenza-vicina {
  border-left: 5px solid #f59e0b !important;
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

/* Semaforo Dot */
.semaforo-dot {
  width: 9px;
  height: 9px;
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
  gap: 6px;
  margin-top: 6px;
}

.week-capsule {
  border-radius: 8px;
  padding: 6px 4px;
  text-align: center;
  font-size: 0.68rem;
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
  box-shadow: 0 0 12px rgba(234, 88, 12, 0.45);
  transform: scale(1.03);
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
  gap: 3px;
}

.capsule-icon-pulse {
  color: #ffffff;
  font-size: 0.55rem;
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
</style>
