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

    <!-- CARD LIVE FEED & UTENTI ATTIVI IN TEMPO REALE (RTDB A QUOTA 0) -->
    <v-card class="card-glass pa-2.5 pa-sm-3 rounded-2xl mb-3 mb-sm-4 elevation-2 live-monitor-card" border>
      <div class="d-flex flex-wrap justify-space-between align-center gap-2 mb-2">
        <div class="d-flex align-center gap-2">
          <span class="live-pulse-dot"></span>
          <span class="font-weight-black text-caption text-sm-body-2 uppercase tracking-wider text-theme-primary">
            Attività Live & Presenza
          </span>
          <v-chip size="x-small" color="green-darken-3" variant="flat" class="font-weight-bold text-white px-2" style="font-size: 0.58rem; height: 18px;">
            <v-icon start size="11">mdi-broadcast</v-icon>
            Quota 0
          </v-chip>
        </div>
        <div class="d-flex align-center gap-1.5 flex-wrap">
          <v-btn
            variant="tonal"
            color="primary"
            density="compact"
            size="small"
            class="rounded-lg text-caption font-weight-bold px-2"
            @click="apriStoricoCompleto"
            title="Consulta tutto lo storico log salvato in tempo reale"
          >
            <v-icon size="15" class="mr-1">mdi-history</v-icon>
            Storico Completo
          </v-btn>
          <v-btn
            variant="text"
            density="compact"
            size="small"
            class="rounded-lg text-caption font-weight-bold text-slate px-1.5"
            @click="feedEspanso = !feedEspanso"
          >
            <v-icon size="16" class="mr-0.5">{{ feedEspanso ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
            {{ feedEspanso ? 'Comprimi' : 'Espandi' }}
          </v-btn>
        </div>
      </div>

      <!-- UTENTI ONLINE ADESSO -->
      <div class="mb-2 pb-2 border-b-subtle">
        <div class="d-flex align-center gap-1.5 mb-1.5">
          <span class="text-caption font-weight-black text-slate uppercase" style="font-size: 0.62rem;">
            Atleti connessi ora:
          </span>
          <span class="font-weight-bold text-caption text-green-accent-3">
            {{ atletiOnlineSolo.length }} {{ atletiOnlineSolo.length === 1 ? 'atleta' : 'atleti' }}
          </span>
        </div>
        
        <div v-if="atletiOnlineSolo.length > 0" class="d-flex flex-wrap gap-1.5 align-center">
          <v-chip
            v-for="u in atletiOnlineSolo"
            :key="u.id"
            size="small"
            color="green-darken-4"
            variant="flat"
            class="chip-online-user font-weight-bold text-white px-2 py-0.5"
            @click="filtraPerAtletaOnline(u.id)"
            title="Clicca per filtrare questo atleta"
          >
            <span class="online-indicator-dot mr-1.5"></span>
            <span class="mr-1">{{ u.nome }}</span>
            <v-icon size="12" class="opacity-75 mr-1">{{ u.device === 'Mobile' ? 'mdi-cellphone' : 'mdi-laptop' }}</v-icon>
            <span class="text-super-caption opacity-75 font-weight-regular" style="font-size: 0.58rem;">{{ tempoFa(u.ultimo_accesso) }}</span>
          </v-chip>
        </div>
        <div v-else class="text-caption text-slate font-italic py-0.5" style="font-size: 0.72rem;">
          Nessun atleta con l'app aperta in questo momento.
        </div>
      </div>

      <!-- FEED ULTIME AZIONI IN TEMPO REALE -->
      <v-expand-transition>
        <div v-if="feedEspanso">
          <div class="d-flex justify-space-between align-center mb-1.5 pt-1">
            <span class="text-caption font-weight-black text-slate uppercase" style="font-size: 0.62rem;">
              Log in tempo reale:
            </span>
            <div class="d-flex gap-1">
              <v-btn
                size="x-small"
                variant="flat"
                :color="filtroFeed === 'tutti' ? 'primary' : 'default'"
                class="rounded px-1.5 text-super-caption"
                style="font-size: 0.60rem; height: 20px;"
                @click="filtroFeed = 'tutti'"
              >Tutti ({{ feedAttivita.length }})</v-btn>
              <v-btn
                size="x-small"
                variant="flat"
                :color="filtroFeed === 'peso' ? 'primary' : 'default'"
                class="rounded px-1.5 text-super-caption"
                style="font-size: 0.60rem; height: 20px;"
                @click="filtroFeed = 'peso'"
              >🏋️ Pesi ({{ feedPesiCount }})</v-btn>
              <v-btn
                size="x-small"
                variant="flat"
                :color="filtroFeed === 'accesso' ? 'primary' : 'default'"
                class="rounded px-1.5 text-super-caption"
                style="font-size: 0.60rem; height: 20px;"
                @click="filtroFeed = 'accesso'"
              >📱 Accessi ({{ feedAccessiCount }})</v-btn>
            </div>
          </div>

          <!-- LISTA SCROLLABILE DEL FEED -->
          <div class="feed-scroll-container">
            <div v-if="feedFiltrato.length === 0" class="text-center text-caption text-slate py-2" style="font-size: 0.72rem;">
              Nessun evento registrato al momento nel feed.
            </div>
            <div
              v-for="item in feedFiltratoConDati"
              :key="item.raw.key || item.raw.timestamp"
              class="feed-item d-flex align-center justify-space-between py-1 px-2 mb-1 rounded-lg cursor-pointer"
              :class="{ 'feed-item-peso': item.tipo === 'peso', 'feed-item-accesso': item.tipo === 'accesso' }"
              @click="apriDettaglioDaFeed(item)"
              title="Clicca per aprire l'esercizio in dettaglio"
            >
              <div class="d-flex align-center min-w-0 mr-1.5 flex-grow-1 overflow-hidden" style="gap: 5px;">
                <span class="font-weight-black text-white flex-shrink-0" style="font-size: 0.72rem;">
                  {{ item.nomeBreve }}
                </span>
                <span
                  v-if="item.badge"
                  class="badge-w-coord flex-shrink-0 font-weight-black"
                >
                  [{{ item.badge }}]
                </span>
                <span class="text-slate-light text-truncate" style="font-size: 0.70rem;">
                  {{ item.esercizio }}
                </span>
                <span
                  v-if="item.tipo === 'accesso' && item.dettaglioDispositivo"
                  class="text-super-caption text-slate flex-shrink-0"
                  style="font-size: 0.62rem;"
                >
                  {{ item.dettaglioDispositivo }}
                </span>
              </div>
              <div class="d-flex align-center flex-shrink-0 ml-auto" style="gap: 6px;">
                <span
                  v-if="item.carico"
                  class="font-weight-black text-orange-accent-2 flex-shrink-0"
                  style="font-size: 0.72rem;"
                >
                  {{ item.carico }}
                </span>
                <span class="text-super-caption text-slate font-weight-bold flex-shrink-0" style="font-size: 0.62rem;">
                  {{ item.tempo }}
                </span>
              </div>
            </div>
          </div>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- METRICHE KPI COMPATTE (PREMIUM 2x2 SU MOBILE, 4 IN RIGA SU DESKTOP) -->
    <v-row class="mb-3 mb-sm-5 g-2 g-sm-3">
      <!-- Card Totale Attivi -->
      <v-col cols="6" sm="3">
        <v-card
          class="kpi-card card-glass pa-2.5 pa-sm-3 rounded-2xl h-100 cursor-pointer"
          :class="{ 'kpi-card-active': filtroAttivo === 'tutti' }"
          elevation="2"
          @click="impostaFiltro('tutti')"
        >
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
        <v-card
          class="kpi-card card-glass pa-2.5 pa-sm-3 rounded-2xl h-100 kpi-card-warning cursor-pointer"
          :class="{ 'kpi-card-active': filtroAttivo === 'in_scadenza' }"
          elevation="2"
          @click="impostaFiltro('in_scadenza')"
        >
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
        <v-card
          class="kpi-card card-glass pa-2.5 pa-sm-3 rounded-2xl h-100 kpi-card-success cursor-pointer"
          :class="{ 'kpi-card-active': filtroAttivo === 'completati' }"
          elevation="2"
          @click="impostaFiltro('completati')"
        >
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
        <v-card
          class="kpi-card card-glass pa-2.5 pa-sm-3 rounded-2xl h-100 kpi-card-danger cursor-pointer"
          :class="{ 'kpi-card-active': filtroAttivo === 'inattivi' }"
          elevation="2"
          @click="impostaFiltro('inattivi')"
        >
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

        <!-- Chips Filtro Rapido con Scroll Orizzontale Fluido (Solo icone/emoji colorate, niente icone bianche) -->
        <div class="filter-chips-scroll py-0.5">
          <v-chip
            v-for="filtro in listaFiltri"
            :key="filtro.id"
            size="small"
            :color="filtroAttivo === filtro.id ? 'primary' : 'default'"
            :variant="filtroAttivo === filtro.id ? 'flat' : 'tonal'"
            class="font-weight-bold rounded-lg cursor-pointer px-2.5 text-no-wrap"
            @click="impostaFiltro(filtro.id)"
          >
            <span>{{ filtro.label }}</span>
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
                <v-chip
                  v-if="idsOnline.has(String(cliente.id))"
                  size="x-small"
                  color="green-accent-4"
                  variant="flat"
                  class="font-weight-black text-black ml-1 px-1.5 pulse-online-chip"
                  style="font-size: 0.55rem; height: 16px;"
                >
                  ● ONLINE
                </v-chip>
                
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

            <!-- Pulsante Comunicazione Coach / Guida Pesi In-App (solo icona) -->
            <v-btn
              icon="mdi-comment-text-outline"
              size="small"
              color="purple-darken-2"
              variant="flat"
              class="rounded-xl btn-action-icon text-white"
              @click="apriMessaggioPrivatoAtleta(cliente, 'messaggio', 'libero')"
              title="Invia comunicazione o guida pesi all'atleta"
              aria-label="Comunicazione Coach"
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
                  prepend-icon="mdi-bullhorn-outline"
                  title="Comunicazione (In-App)"
                  @click="apriMessaggioPrivatoAtleta(cliente, 'messaggio', 'libero')"
                ></v-list-item>
                <v-list-item
                  density="compact"
                  prepend-icon="mdi-bell-ring-outline"
                  title="Promemoria Chiusura (In-App)"
                  @click="apriMessaggioPrivatoAtleta(cliente, 'messaggio', 'chiusura_settimana')"
                ></v-list-item>
                <v-list-item
                  density="compact"
                  prepend-icon="mdi-lightbulb-on"
                  title="Invia Guida Pesi (In-App)"
                  @click="apriMessaggioPrivatoAtleta(cliente, 'guida_pesi')"
                ></v-list-item>
                <v-list-item
                  density="compact"
                  prepend-icon="mdi-check-circle-outline"
                  title="Promemoria Chiusura (WhatsApp)"
                  @click="inviaPromemoriaChiusuraWhatsApp(cliente)"
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

    <!-- MODALE STORICO COMPLETO LOG IN TEMPO REALE (/attivita_live) -->
    <v-dialog v-model="dialogStoricoLog" max-width="860px" scrollable>
      <v-card class="storico-log-card rounded-2xl border overflow-hidden elevation-12">
        <!-- Header Modale -->
        <v-card-title class="storico-log-header pa-3 pa-sm-4 d-flex flex-wrap align-center justify-space-between gap-2">
          <div class="d-flex align-center gap-2.5 min-width-0">
            <v-avatar color="primary" size="34" class="elevation-2 flex-shrink-0">
              <v-icon size="18" color="white">mdi-history</v-icon>
            </v-avatar>
            <div class="min-width-0">
              <div class="d-flex align-center gap-2 flex-wrap">
                <span class="text-subtitle-1 font-weight-black text-slate-dark leading-tight">
                  Storico Completo Log in Tempo Reale
                </span>
                <v-chip size="x-small" color="primary" variant="flat" class="font-weight-black text-white px-2" style="height: 19px; font-size: 0.62rem;">
                  {{ storicoFiltratoFinale.length }} {{ storicoFiltratoFinale.length === 1 ? 'evento' : 'eventi' }}
                </v-chip>
              </div>
              <span class="text-caption text-slate d-block" style="font-size: 0.68rem;">
                Archivio RTDB attivita_live • Quota Firestore 0 • Scaricati {{ storicoLogRaw.length }} record
              </span>
            </div>
          </div>

          <div class="d-flex align-center gap-1.5">
            <!-- Profondità caricamento -->
            <div class="d-flex align-center gap-1 mr-1">
              <v-btn
                v-for="opz in [
                  { label: 'Ultimi 300', val: 300 },
                  { label: 'Ultimi 1000', val: 1000 },
                  { label: 'Tutti', val: 0 }
                ]"
                :key="opz.val"
                size="x-small"
                :variant="limiteCaricamentoStorico === opz.val ? 'flat' : 'tonal'"
                :color="limiteCaricamentoStorico === opz.val ? 'primary' : 'default'"
                class="rounded font-weight-bold text-none px-2"
                style="height: 24px; font-size: 0.64rem;"
                @click="cambiaProfonditaStorico(opz.val)"
              >
                {{ opz.label }}
              </v-btn>
            </div>
            <v-btn icon variant="text" size="small" density="compact" color="grey" @click="dialogStoricoLog = false" aria-label="Chiudi">
              <v-icon size="20">mdi-close</v-icon>
            </v-btn>
          </div>
        </v-card-title>

        <!-- Barra Filtri -->
        <div class="storico-log-filters pa-3">
          <!-- Riga 1: Tipo + Atleta + Ricerca -->
          <div class="d-flex flex-wrap align-center gap-2 mb-2">
            <div class="d-flex align-center gap-1 flex-shrink-0">
              <v-btn
                size="x-small"
                :variant="filtroStoricoTipo === 'tutti' ? 'flat' : 'tonal'"
                :color="filtroStoricoTipo === 'tutti' ? 'primary' : 'default'"
                class="rounded font-weight-bold px-2"
                style="height: 28px; font-size: 0.68rem;"
                @click="filtroStoricoTipo = 'tutti'"
              >Tutti ({{ storicoCountTutti }})</v-btn>
              <v-btn
                size="x-small"
                :variant="filtroStoricoTipo === 'peso' ? 'flat' : 'tonal'"
                :color="filtroStoricoTipo === 'peso' ? 'primary' : 'default'"
                class="rounded font-weight-bold px-2"
                style="height: 28px; font-size: 0.68rem;"
                @click="filtroStoricoTipo = 'peso'"
              >🏋️ Pesi ({{ storicoCountPesi }})</v-btn>
              <v-btn
                size="x-small"
                :variant="filtroStoricoTipo === 'accesso' ? 'flat' : 'tonal'"
                :color="filtroStoricoTipo === 'accesso' ? 'primary' : 'default'"
                class="rounded font-weight-bold px-2"
                style="height: 28px; font-size: 0.68rem;"
                @click="filtroStoricoTipo = 'accesso'"
              >📱 Accessi ({{ storicoCountAccessi }})</v-btn>
            </div>

            <v-autocomplete
              v-model="filtroStoricoAtleta"
              :items="atletiStoricoOptions"
              item-title="title"
              item-value="value"
              placeholder="Tutti gli atleti"
              prepend-inner-icon="mdi-account-filter"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="storico-filter-input flex-grow-1"
              style="min-width: 185px; max-width: 280px;"
            ></v-autocomplete>

            <v-text-field
              v-model="ricercaStoricoTesto"
              placeholder="Cerca esercizio, A1, kg, device..."
              prepend-inner-icon="mdi-magnify"
              variant="outlined"
              density="compact"
              rounded="lg"
              hide-details
              clearable
              class="storico-filter-input flex-grow-1"
              style="min-width: 190px;"
            ></v-text-field>
          </div>

          <!-- Riga 2: Periodo + Data Specifica + Reset -->
          <div class="d-flex flex-wrap align-center justify-space-between gap-2">
            <div class="d-flex align-center gap-1 flex-wrap">
              <span class="text-caption text-slate font-weight-bold mr-1" style="font-size: 0.66rem;">Periodo:</span>
              <v-chip
                v-for="p in [
                  { label: 'Tutti', val: 'tutti' },
                  { label: 'Oggi', val: 'oggi' },
                  { label: 'Ieri', val: 'ieri' },
                  { label: 'Ultimi 7gg', val: '7gg' },
                  { label: 'Ultimi 30gg', val: '30gg' }
                ]"
                :key="p.val"
                size="x-small"
                :variant="filtroStoricoPeriodo === p.val ? 'flat' : 'tonal'"
                :color="filtroStoricoPeriodo === p.val ? 'primary' : 'default'"
                class="font-weight-bold cursor-pointer"
                style="height: 22px; font-size: 0.64rem;"
                @click="selezionaPeriodoStorico(p.val)"
              >
                {{ p.label }}
              </v-chip>

              <div class="d-flex align-center gap-1 ml-1">
                <input
                  type="date"
                  v-model="filtroStoricoData"
                  @change="filtroStoricoPeriodo = filtroStoricoData ? 'data' : 'tutti'"
                  class="storico-date-input rounded-lg px-2 py-0.5 text-caption"
                  title="Filtra per data esatta"
                />
              </div>
            </div>

            <v-btn
              v-if="haFiltriStoricoAttivi"
              size="x-small"
              variant="text"
              color="orange-lighten-2"
              class="font-weight-bold text-none"
              @click="resetFiltriStorico"
            >
              <v-icon size="14" class="mr-1">mdi-filter-remove</v-icon>
              Reset filtri
            </v-btn>
          </div>
        </div>

        <!-- Corpo Scrollabile Raggruppato per Giorno -->
        <v-card-text class="pa-3" style="max-height: 62vh; overflow-y: auto;">
          <div v-if="caricamentoStoricoLog && storicoLogRaw.length === 0" class="text-center py-8">
            <v-progress-circular indeterminate color="primary" size="32" class="mb-2"></v-progress-circular>
            <div class="text-caption text-slate font-weight-bold">Caricamento storico log da Realtime Database...</div>
          </div>

          <div v-else-if="storicoRaggruppatoPerGiorno.length === 0" class="text-center py-8">
            <v-icon size="42" color="grey" class="mb-2">mdi-clipboard-text-search-outline</v-icon>
            <div class="text-subtitle-2 font-weight-bold text-slate-dark">Nessun log trovato</div>
            <p class="text-caption text-slate mt-1 mb-3">Prova a modificare i filtri o aumentare la profondità (es. "Tutti").</p>
            <v-btn v-if="haFiltriStoricoAttivi" size="small" color="primary" variant="tonal" class="text-none font-weight-bold" @click="resetFiltriStorico">
              Reset filtri
            </v-btn>
          </div>

          <div v-else class="d-flex flex-column gap-3">
            <div v-for="gruppo in storicoRaggruppatoPerGiorno" :key="gruppo.dataKey">
              <!-- Intestazione Giorno -->
              <div class="storico-day-header d-flex align-center justify-space-between px-2.5 py-1.5 rounded-lg mb-1.5">
                <div class="d-flex align-center gap-2">
                  <v-icon size="15" color="primary">mdi-calendar-today</v-icon>
                  <span class="text-caption font-weight-black text-slate-dark" style="font-size: 0.74rem;">
                    {{ gruppo.dataLabel }}
                  </span>
                </div>
                <div class="d-flex align-center gap-1.5 text-super-caption text-slate font-weight-bold" style="font-size: 0.64rem;">
                  <span>{{ gruppo.totaleGiorno }} log</span>
                  <span v-if="gruppo.pesiCount > 0">• 🏋️ {{ gruppo.pesiCount }}</span>
                  <span v-if="gruppo.accessiCount > 0">• 📱 {{ gruppo.accessiCount }}</span>
                </div>
              </div>

              <!-- Eventi del Giorno -->
              <div class="d-flex flex-column gap-1">
                <div
                  v-for="item in gruppo.items"
                  :key="item.raw.key || `${item.raw.timestamp}_${item.userId}`"
                  class="feed-item storico-feed-row d-flex align-center justify-space-between py-1.5 px-2.5 rounded-lg cursor-pointer"
                  :class="{ 'feed-item-peso': item.tipo === 'peso', 'feed-item-accesso': item.tipo === 'accesso' }"
                  @click="apriDettaglioDaStorico(item)"
                  title="Clicca per aprire l'esercizio o la scheda dell'atleta"
                >
                  <div class="d-flex align-center min-w-0 mr-2 flex-grow-1 overflow-hidden" style="gap: 6px;">
                    <span class="storico-ora-badge flex-shrink-0 font-weight-bold text-slate">
                      {{ item.oraPrecisa || '--:--' }}
                    </span>
                    <span class="font-weight-black text-slate-dark flex-shrink-0" style="font-size: 0.74rem;">
                      {{ item.nomeCompleto || item.nomeBreve }}
                    </span>
                    <span
                      v-if="item.scheda"
                      class="storico-scheda-badge flex-shrink-0 font-weight-bold"
                    >
                      #{{ item.scheda }}
                    </span>
                    <span
                      v-if="item.badge"
                      class="badge-w-coord flex-shrink-0 font-weight-black"
                    >
                      [{{ item.badge }}]
                    </span>
                    <span class="text-slate text-truncate" style="font-size: 0.72rem;">
                      {{ item.esercizio }}
                    </span>
                    <span
                      v-if="item.tipo === 'accesso' && item.dettaglioDispositivo"
                      class="text-super-caption text-slate flex-shrink-0"
                      style="font-size: 0.64rem;"
                    >
                      {{ item.dettaglioDispositivo }}
                    </span>
                  </div>

                  <div class="d-flex align-center flex-shrink-0 ml-auto" style="gap: 8px;">
                    <span
                      v-if="item.carico"
                      class="font-weight-black text-orange-accent-2 flex-shrink-0"
                      style="font-size: 0.74rem;"
                    >
                      {{ item.carico }}
                    </span>
                    <span class="text-super-caption text-slate font-weight-medium d-none d-sm-inline flex-shrink-0" style="font-size: 0.62rem;">
                      {{ item.tempo }}
                    </span>
                    <v-icon size="14" color="grey" class="flex-shrink-0">mdi-chevron-right</v-icon>
                  </div>
                </div>
              </div>
            </div>

            <!-- Mostra Altri -->
            <div v-if="storicoHaAltri" class="text-center pt-2 pb-1">
              <v-btn
                size="small"
                variant="tonal"
                color="primary"
                class="rounded-xl font-weight-bold text-none px-4"
                @click="limiteRenderStorico += 150"
              >
                Mostra altri (+150) • Visualizzati {{ storicoVisibile.length }} di {{ storicoFiltratoFinale.length }}
              </v-btn>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { ascoltaPresenzaLive, ascoltaAttivitaLive, analizzaEventoFeed, formattaDataKeyLocale } from '../utils/presenceService.js';
import { useRouter } from 'vue-router';
import { setSelectedAthlete, setSelectedSheet, apriMessaggioPrivatoModal, getTelefonoAtleta, formattaTelefonoPerWhatsApp } from '../authStore.js';
import { db } from '../firebase.js';
import { doc, getDoc } from 'firebase/firestore';
import {
  caricaRiepilogoClientiPerCoach,
  ricalcolaESalvaStatoAtleta
} from '../utils/riepilogoManager.js';

const router = useRouter();

// Stato Realtime Live (Presenza & Feed Pesi a Quota 0)
const utentiOnline = ref([]);
const feedAttivita = ref([]);
const filtroFeed = ref('tutti'); // 'tutti' | 'peso' | 'accesso'
const feedEspanso = ref(true);
let unsubPresenza = null;
let unsubAttivita = null;

const atletiOnlineSolo = computed(() => {
  return utentiOnline.value.filter(u => u && u.id !== 'coach' && u.ruolo !== 'coach');
});

const idsOnline = computed(() => {
  return new Set(atletiOnlineSolo.value.map(u => String(u.id)));
});

const feedPesiCount = computed(() => feedAttivita.value.filter(ev => ev.tipo === 'peso').length);
const feedAccessiCount = computed(() => feedAttivita.value.filter(ev => ev.tipo === 'accesso').length);

const feedFiltrato = computed(() => {
  if (filtroFeed.value === 'tutti') return feedAttivita.value;
  return feedAttivita.value.filter(ev => ev.tipo === filtroFeed.value);
});

const feedFiltratoConDati = computed(() => {
  return feedFiltrato.value.map(ev => ({
    raw: ev,
    ...analizzaEventoFeed(ev)
  }));
});

// Stato e Logica Modale Storico Completo Log (/attivita_live)
const dialogStoricoLog = ref(false);
const storicoLogRaw = ref([]);
const caricamentoStoricoLog = ref(false);
const limiteCaricamentoStorico = ref(300); // 300 | 1000 | 0 (Tutti)
const filtroStoricoTipo = ref('tutti'); // 'tutti' | 'peso' | 'accesso'
const filtroStoricoAtleta = ref(null);
const filtroStoricoPeriodo = ref('tutti'); // 'tutti' | 'oggi' | 'ieri' | '7gg' | '30gg' | 'data'
const filtroStoricoData = ref('');
const ricercaStoricoTesto = ref('');
const limiteRenderStorico = ref(150);
let unsubStoricoCompleto = null;

const avviaListenerStoricoCompleto = (limite = limiteCaricamentoStorico.value) => {
  if (unsubStoricoCompleto) {
    unsubStoricoCompleto();
    unsubStoricoCompleto = null;
  }
  caricamentoStoricoLog.value = true;
  unsubStoricoCompleto = ascoltaAttivitaLive((events) => {
    storicoLogRaw.value = events || [];
    caricamentoStoricoLog.value = false;
  }, limite);
};

const apriStoricoCompleto = () => {
  dialogStoricoLog.value = true;
  limiteRenderStorico.value = 150;
  if (!unsubStoricoCompleto) {
    avviaListenerStoricoCompleto(limiteCaricamentoStorico.value);
  }
};

const cambiaProfonditaStorico = (nuovoLimite) => {
  if (limiteCaricamentoStorico.value === nuovoLimite && unsubStoricoCompleto) return;
  limiteCaricamentoStorico.value = nuovoLimite;
  limiteRenderStorico.value = 150;
  avviaListenerStoricoCompleto(nuovoLimite);
};

const selezionaPeriodoStorico = (periodo) => {
  filtroStoricoPeriodo.value = periodo;
  if (periodo !== 'data') {
    filtroStoricoData.value = '';
  }
};

watch([filtroStoricoTipo, filtroStoricoAtleta, filtroStoricoPeriodo, filtroStoricoData, ricercaStoricoTesto], () => {
  limiteRenderStorico.value = 150;
});

const storicoAnalizzato = computed(() => {
  return storicoLogRaw.value.map(ev => ({
    raw: ev,
    ...analizzaEventoFeed(ev)
  }));
});

const atletiStoricoOptions = computed(() => {
  const mappa = new Map();
  for (const c of listaClienti.value) {
    if (c?.id) {
      mappa.set(String(c.id), c.nomeCompleto || `Atleta #${c.id}`);
    }
  }
  for (const item of storicoAnalizzato.value) {
    if (item.userId && !mappa.has(item.userId)) {
      mappa.set(item.userId, item.nomeCompleto || `Atleta #${item.userId}`);
    }
  }
  return Array.from(mappa.entries())
    .map(([id, nome]) => ({ title: `${nome} (#${id})`, value: id }))
    .sort((a, b) => a.title.localeCompare(b.title));
});

const storicoFiltratoSenzaTipo = computed(() => {
  const now = new Date();
  const oggiKey = formattaDataKeyLocale(now);
  const ieri = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
  const ieriKey = formattaDataKeyLocale(ieri);
  const cutoff7gg = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 6).getTime();
  const cutoff30gg = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 29).getTime();

  const qText = (ricercaStoricoTesto.value || '').trim().toLowerCase();
  const targetAtleta = filtroStoricoAtleta.value ? String(filtroStoricoAtleta.value) : null;
  const periodo = filtroStoricoPeriodo.value;
  const dataEsatta = filtroStoricoData.value;

  return storicoAnalizzato.value.filter(item => {
    if (targetAtleta && item.userId !== targetAtleta) {
      return false;
    }

    if (periodo === 'oggi' && item.dataKey !== oggiKey) {
      return false;
    } else if (periodo === 'ieri' && item.dataKey !== ieriKey) {
      return false;
    } else if (periodo === '7gg' && Number(item.raw.timestamp || 0) < cutoff7gg) {
      return false;
    } else if (periodo === '30gg' && Number(item.raw.timestamp || 0) < cutoff30gg) {
      return false;
    } else if (periodo === 'data' && dataEsatta && item.dataKey !== dataEsatta) {
      return false;
    }

    if (qText) {
      const testo = [
        item.nomeCompleto,
        item.esercizio,
        item.badge,
        item.carico,
        item.dettaglioDispositivo,
        item.scheda ? `#${item.scheda}` : '',
        item.raw?.azione,
        item.raw?.dettagli
      ].filter(Boolean).join(' ').toLowerCase();
      if (!testo.includes(qText)) {
        return false;
      }
    }

    return true;
  });
});

const storicoCountTutti = computed(() => storicoFiltratoSenzaTipo.value.length);
const storicoCountPesi = computed(() => storicoFiltratoSenzaTipo.value.filter(i => i.tipo === 'peso').length);
const storicoCountAccessi = computed(() => storicoFiltratoSenzaTipo.value.filter(i => i.tipo === 'accesso').length);

const storicoFiltratoFinale = computed(() => {
  if (filtroStoricoTipo.value === 'tutti') return storicoFiltratoSenzaTipo.value;
  return storicoFiltratoSenzaTipo.value.filter(i => i.tipo === filtroStoricoTipo.value);
});

const storicoVisibile = computed(() => storicoFiltratoFinale.value.slice(0, limiteRenderStorico.value));
const storicoHaAltri = computed(() => storicoFiltratoFinale.value.length > limiteRenderStorico.value);

const conteggiPerGiornoStorico = computed(() => {
  const counts = new Map();
  for (const item of storicoFiltratoFinale.value) {
    let entry = counts.get(item.dataKey);
    if (!entry) {
      entry = { totaleGiorno: 0, pesiCount: 0, accessiCount: 0 };
      counts.set(item.dataKey, entry);
    }
    entry.totaleGiorno++;
    if (item.tipo === 'accesso') entry.accessiCount++;
    else entry.pesiCount++;
  }
  return counts;
});

const storicoRaggruppatoPerGiorno = computed(() => {
  const gruppi = [];
  const gruppiMap = new Map();
  const totalsMap = conteggiPerGiornoStorico.value;

  for (const item of storicoVisibile.value) {
    let gruppo = gruppiMap.get(item.dataKey);
    if (!gruppo) {
      const totals = totalsMap.get(item.dataKey) || { totaleGiorno: 0, pesiCount: 0, accessiCount: 0 };
      gruppo = {
        dataKey: item.dataKey,
        dataLabel: item.dataLabel,
        totaleGiorno: totals.totaleGiorno,
        pesiCount: totals.pesiCount,
        accessiCount: totals.accessiCount,
        items: []
      };
      gruppiMap.set(item.dataKey, gruppo);
      gruppi.push(gruppo);
    }
    gruppo.items.push(item);
  }
  return gruppi;
});

const haFiltriStoricoAttivi = computed(() => {
  return filtroStoricoTipo.value !== 'tutti'
    || filtroStoricoAtleta.value !== null
    || filtroStoricoPeriodo.value !== 'tutti'
    || Boolean(filtroStoricoData.value)
    || (ricercaStoricoTesto.value || '').trim() !== '';
});

const resetFiltriStorico = () => {
  filtroStoricoTipo.value = 'tutti';
  filtroStoricoAtleta.value = null;
  filtroStoricoPeriodo.value = 'tutti';
  filtroStoricoData.value = '';
  ricercaStoricoTesto.value = '';
  limiteRenderStorico.value = 150;
};

const apriDettaglioDaStorico = (item) => {
  dialogStoricoLog.value = false;
  apriDettaglioDaFeed(item);
};

const tempoFa = (timestamp) => {
  if (!timestamp) return 'Adesso';
  const diffMs = Date.now() - Number(timestamp);
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return 'Adesso';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m fa`;
  const diffOre = Math.floor(diffMin / 60);
  if (diffOre < 24) return `${diffOre}h fa`;
  return `${Math.floor(diffOre / 24)}g fa`;
};

const filtraPerAtletaOnline = (atletaId) => {
  ricercaTesto.value = String(atletaId);
  filtroAttivo.value = 'tutti';
};

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
    { id: 'tutti', label: '👥 Tutti', conteggio: attivi.length },
    { id: 'online', label: '🟢 Online Ora', conteggio: atletiOnlineSolo.value.length },
    { id: 'in_scadenza', label: '🚨 In Scadenza (W5-6)', conteggio: attivi.filter(c => c.settimanaCorrente >= 5 && !c.programmaCompletato).length },
    { id: 'completati', label: '🏆 Completati', conteggio: attivi.filter(c => c.programmaCompletato).length },
    { id: 'inattivi', label: '⚠️ Inattivi (>5gg)', conteggio: attivi.filter(c => c.statoInattivita === 'red').length },
    { id: 'in_corso', label: '⚡ In Corso (W2-4)', conteggio: attivi.filter(c => c.settimanaCorrente >= 2 && c.settimanaCorrente <= 4 && !c.programmaCompletato).length },
    { id: 'appena_iniziati', label: '🌱 Nuovi (W1)', conteggio: attivi.filter(c => c.settimanaCorrente === 1 && !c.programmaCompletato).length }
  ];
});

const filtroAttivoLabel = computed(() => {
  const f = listaFiltri.value.find(x => x.id === filtroAttivo.value);
  return f ? f.label : 'Tutti';
});

const impostaFiltro = (nuovoFiltro) => {
  if (filtroAttivo.value === nuovoFiltro && nuovoFiltro !== 'tutti') {
    filtroAttivo.value = 'tutti';
  } else {
    filtroAttivo.value = nuovoFiltro;
  }
};

const resettaFiltri = () => {
  ricercaTesto.value = '';
  filtroAttivo.value = 'tutti';
};

// Navigazione diretta all'esercizio dal Feed Live (apre proprio quell'esercizio di quell'utente in quella settimana)
const apriDettaglioDaFeed = async (item) => {
  if (!item) return;
  const raw = item.raw || {};
  const userId = raw.userId;
  if (!userId || userId === 'coach') return;

  if (navigator.vibrate) navigator.vibrate(15);

  try {
    // 1. Imposta atleta attivo
    setSelectedAthlete(String(userId));

    // Se è un evento di solo accesso (nessun esercizio specifico)
    if (item.tipo === 'accesso') {
      const cliente = listaClienti.value.find(c => String(c.id) === String(userId));
      if (cliente?.scheda && cliente.scheda !== 'N/D') {
        setSelectedSheet(String(cliente.scheda));
      }
      router.push('/');
      return;
    }

    // 2. Determina la settimana target
    let targetWeek = raw.settimana;
    if (!targetWeek && item.badge) {
      const mW = String(item.badge).match(/W(\d+)/i);
      if (mW) targetWeek = parseInt(mW[1], 10);
    }
    targetWeek = targetWeek || 1;

    // 3. Determina la scheda dell'atleta
    let numScheda = raw.scheda;
    if (!numScheda) {
      const cliente = listaClienti.value.find(c => String(c.id) === String(userId));
      if (cliente?.scheda && cliente.scheda !== 'N/D') {
        numScheda = cliente.scheda;
      }
    }
    if (numScheda) {
      setSelectedSheet(String(numScheda));
    }

    // 4. Se abbiamo già il docId esatto in STORYBOARD
    if (raw.docId) {
      router.push({
        name: 'DettaglioWorkout',
        params: { id: String(raw.docId) },
        query: {
          targetWeek: String(targetWeek),
          scrollWeek: String(targetWeek),
          week: String(targetWeek)
        }
      });
      return;
    }

    // 5. Fallback dinamico su STORYBOARD per coordinata o nome esercizio
    const coord = (raw.coordinata || '').toUpperCase().trim();
    let desGiorno = '';
    let numRigaGiorno = null;
    if (coord) {
      const matchC = coord.match(/^([A-Z])(\d+)$/);
      if (matchC) {
        desGiorno = matchC[1];
        numRigaGiorno = parseInt(matchC[2], 10);
      }
    }

    const { collection, query: firestoreQuery, where, getDocs } = await import('firebase/firestore');
    const colRef = collection(db, 'STORYBOARD');
    const qConstraints = [where('ID_cliente', '==', String(userId))];
    if (numScheda) {
      qConstraints.push(where('num_scheda', '==', String(numScheda)));
    }
    if (desGiorno) {
      qConstraints.push(where('des_giorno', '==', desGiorno));
    }

    const q = firestoreQuery(colRef, ...qConstraints);
    const snap = await getDocs(q);

    let docTrovato = null;
    if (!snap.empty) {
      const docs = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      if (numRigaGiorno !== null) {
        docTrovato = docs.find(d => parseInt(d.num_riga_giorno, 10) === numRigaGiorno);
      }
      if (!docTrovato && item.esercizio) {
        const queryEs = item.esercizio.toLowerCase().trim();
        docTrovato = docs.find(d => (d.des_esercizio || '').toLowerCase().includes(queryEs));
      }
      if (!docTrovato) {
        docTrovato = docs[0];
      }
    }

    if (docTrovato) {
      router.push({
        name: 'DettaglioWorkout',
        params: { id: docTrovato.id },
        query: {
          targetWeek: String(targetWeek),
          scrollWeek: String(targetWeek),
          week: String(targetWeek)
        }
      });
    } else {
      router.push('/');
    }
  } catch (err) {
    console.warn("Errore navigazione feed:", err);
    router.push('/');
  }
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
const apriWhatsAppAtleta = async (cliente) => {
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

  let tel = formattaTelefonoPerWhatsApp(cliente.num_telefono || getTelefonoAtleta(cliente.id) || localStorage.getItem('telefono_cliente_' + cliente.id));
  if (!tel && cliente.id) {
    try {
      const snap = await getDoc(doc(db, 'CLIENTI', String(cliente.id)));
      if (snap.exists()) {
        const rawT = snap.data().num_telefono || snap.data().telefono || '';
        if (rawT) {
          cliente.num_telefono = rawT;
          localStorage.setItem('telefono_cliente_' + cliente.id, rawT);
          tel = formattaTelefonoPerWhatsApp(rawT);
        }
      }
    } catch (e) {
      console.warn("Fallback telefono Firestore:", e);
    }
  }

  const baseUrl = tel ? `https://wa.me/${tel}` : 'https://wa.me/';
  const url = `${baseUrl}?text=${encodeURIComponent(messaggio)}`;
  window.open(url, '_blank');
};

// Invio rapido del promemoria di chiusura settimana su WhatsApp
const inviaPromemoriaChiusuraWhatsApp = async (cliente) => {
  const rawNome = cliente.nome || cliente.nomeCompleto || 'Atleta';
  const nome = rawNome.trim().split(' ')[0];
  const messaggio = `Ciao ${nome}! Ricordati di chiudere il workout quando lo hai completato: entra nel tab Workout e metti la spunta sulla settimana completata premendo 'Completa Giorno' in fondo alla scheda (oppure dal pulsante rapido Play ⚡). In questo modo il tuo programma rimarrà sempre sincronizzato e aggiornato!`;
  
  let tel = formattaTelefonoPerWhatsApp(cliente.num_telefono || getTelefonoAtleta(cliente.id) || localStorage.getItem('telefono_cliente_' + cliente.id));
  if (!tel && cliente.id) {
    try {
      const snap = await getDoc(doc(db, 'CLIENTI', String(cliente.id)));
      if (snap.exists()) {
        const rawT = snap.data().num_telefono || snap.data().telefono || '';
        if (rawT) {
          cliente.num_telefono = rawT;
          localStorage.setItem('telefono_cliente_' + cliente.id, rawT);
          tel = formattaTelefonoPerWhatsApp(rawT);
        }
      }
    } catch (e) {
      console.warn("Fallback telefono Firestore:", e);
    }
  }

  const baseUrl = tel ? `https://wa.me/${tel}` : 'https://wa.me/';
  const url = `${baseUrl}?text=${encodeURIComponent(messaggio)}`;
  window.open(url, '_blank');
};

// Apertura modale unificata per messaggio privato o guida pesi in-app
const apriMessaggioPrivatoAtleta = (cliente, tipo = 'messaggio', template = 'libero') => {
  apriMessaggioPrivatoModal({
    atletaId: cliente?.id,
    tipo,
    template
  });
};

// Invio rapido del promemoria di chiusura settimana (In-App)
const inviaPromemoriaChiusuraInApp = (cliente) => {
  apriMessaggioPrivatoAtleta(cliente, 'messaggio', 'chiusura_settimana');
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
  if (filtroAttivo.value === 'online') {
    list = list.filter(c => idsOnline.value.has(String(c.id)));
  } else if (filtroAttivo.value === 'in_scadenza') {
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
  unsubPresenza = ascoltaPresenzaLive((online) => {
    utentiOnline.value = online || [];
  });
  unsubAttivita = ascoltaAttivitaLive((events) => {
    feedAttivita.value = events || [];
  }, 40);
});

onUnmounted(() => {
  if (unsubPresenza) unsubPresenza();
  if (unsubAttivita) unsubAttivita();
  if (unsubStoricoCompleto) unsubStoricoCompleto();
});
</script>

<style scoped>
.live-monitor-card {
  border: 1px solid rgba(34, 197, 94, 0.3) !important;
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.05) 0%, rgba(3, 7, 18, 0.6) 100%);
}

.live-pulse-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background-color: #22c55e;
  box-shadow: 0 0 0 rgba(34, 197, 94, 0.7);
  animation: pulse-green 1.8s infinite;
  display: inline-block;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.7);
  }
  70% {
    transform: scale(1);
    box-shadow: 0 0 0 7px rgba(34, 197, 94, 0);
  }
  100% {
    transform: scale(0.95);
    box-shadow: 0 0 0 0 rgba(34, 197, 94, 0);
  }
}

.chip-online-user {
  cursor: pointer;
  transition: transform 0.15s ease;
}
.chip-online-user:hover {
  transform: translateY(-1px);
}

.online-indicator-dot {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: #4ade80;
  display: inline-block;
}

.pulse-online-chip {
  animation: pulse-badge 2s infinite;
}

@keyframes pulse-badge {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.75; }
}

.border-b-subtle {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.feed-scroll-container {
  max-height: 140px;
  overflow-y: auto;
  scrollbar-width: thin;
}

.feed-item {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: background 0.2s ease;
}

.feed-item {
  cursor: pointer;
  user-select: none;
  transition: all 0.2s ease;
}

.feed-item:hover {
  background: rgba(255, 255, 255, 0.09);
  transform: translateX(2px);
}

.feed-item:active {
  transform: scale(0.99);
}

.feed-item-peso {
  border-left: 3px solid #f97316;
}

.feed-item-accesso {
  border-left: 3px solid #06b6d4;
}

.badge-w-coord {
  background: rgba(245, 158, 11, 0.15);
  color: #fbbf24;
  border: 1px solid rgba(245, 158, 11, 0.4);
  font-size: 0.60rem;
  padding: 0px 4px;
  border-radius: 4px;
  letter-spacing: 0.2px;
  line-height: 1.3;
}

.feed-item-accesso .badge-w-coord {
  background: rgba(6, 182, 212, 0.15);
  color: #22d3ee;
  border-color: rgba(6, 182, 212, 0.4);
}
.monitoraggio-container {
  min-height: calc(100vh - 120px);
}

.title-gradient {
  letter-spacing: -0.02em;
}

.kpi-card {
  border: 1px solid var(--card-border);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  cursor: pointer;
  user-select: none;
}

.kpi-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.kpi-card:active {
  transform: scale(0.98);
}

.kpi-card-active {
  box-shadow: 0 0 0 2px #3b82f6, 0 8px 20px rgba(59, 130, 246, 0.25) !important;
  background: rgba(59, 130, 246, 0.08) !important;
}

.kpi-card-warning.kpi-card-active {
  box-shadow: 0 0 0 2px #f97316, 0 8px 20px rgba(249, 115, 22, 0.25) !important;
  background: rgba(249, 115, 22, 0.08) !important;
}

.kpi-card-success.kpi-card-active {
  box-shadow: 0 0 0 2px #22c55e, 0 8px 20px rgba(34, 197, 94, 0.25) !important;
  background: rgba(34, 197, 94, 0.08) !important;
}

.kpi-card-danger.kpi-card-active {
  box-shadow: 0 0 0 2px #ef4444, 0 8px 20px rgba(239, 68, 68, 0.25) !important;
  background: rgba(239, 68, 68, 0.08) !important;
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
.storico-log-card {
  background: var(--card-bg-dark, rgba(15, 23, 42, 0.96)) !important;
  border: 1px solid var(--card-border, rgba(255, 255, 255, 0.1)) !important;
  backdrop-filter: blur(18px);
}

.storico-log-header {
  border-bottom: 1px solid var(--card-border, rgba(255, 255, 255, 0.08));
  background: var(--card-bg-soft, rgba(30, 41, 59, 0.45));
}

.storico-log-filters {
  border-bottom: 1px solid var(--card-border, rgba(255, 255, 255, 0.08));
  background: rgba(15, 23, 42, 0.25);
}

[data-theme='light'] .storico-log-filters {
  background: rgba(241, 245, 249, 0.85);
}

.storico-day-header {
  background: var(--card-bg-soft, rgba(30, 41, 59, 0.55));
  border: 1px solid var(--card-border, rgba(255, 255, 255, 0.08));
}

.storico-ora-badge {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.64rem;
  min-width: 52px;
  opacity: 0.9;
}

.storico-scheda-badge {
  background: rgba(148, 163, 184, 0.16);
  border: 1px solid rgba(148, 163, 184, 0.35);
  color: var(--text-slate, #cbd5e1);
  font-size: 0.60rem;
  padding: 0 4px;
  border-radius: 4px;
  line-height: 1.3;
}

.storico-date-input {
  background: var(--v-field-bg, rgba(30, 41, 59, 0.5));
  border: 1px solid var(--v-field-border, rgba(255, 255, 255, 0.14));
  color: var(--text-dark, #f8fafc);
  font-size: 0.68rem;
  height: 24px;
  outline: none;
}

[data-theme='light'] .feed-item {
  background: rgba(15, 23, 42, 0.03);
  border-color: rgba(15, 23, 42, 0.08);
}

[data-theme='light'] .feed-item:hover {
  background: rgba(15, 23, 42, 0.07);
}
</style>
