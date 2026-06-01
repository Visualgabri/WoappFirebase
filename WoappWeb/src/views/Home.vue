<template>
  <v-container class="px-4 py-6 max-width-container min-height-screen home-dashboard">
    <!-- Header Premium e Moderno -->
    <div class="dashboard-header mb-6 d-flex align-center justify-space-between animate-slide-down">
      <div class="d-flex align-center">
        <div class="profile-avatar-wrapper mr-4">
          <v-avatar size="52" class="profile-avatar elevation-3 bg-transparent border-orange">
            <v-img src="/logo.png" alt="WoApp Logo"></v-img>
          </v-avatar>
          <span class="active-dot"></span>
        </div>
        <div class="text-left">
          <span class="text-super-caption text-muted font-weight-black uppercase tracking-widest d-block" style="font-size: 0.6rem; opacity: 0.8;">
            {{ salutoOrario }}
          </span>
          <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight leading-tight">
            {{ nomeAtleta || 'GABRIELE BELMONTE' }}
          </h1>
          <div class="d-flex align-center mt-1">
            <v-chip size="x-small" color="orange-darken-3" class="font-weight-black px-2 py-1" variant="flat" style="height: 18px; font-size: 0.58rem;">
              SCHEDA N.{{ schedaSelezionata }}
            </v-chip>
            <span class="text-caption font-weight-bold text-muted ml-2" style="font-size: 0.68rem;">
              Mesociclo Definitivo
            </span>
          </div>
        </div>
      </div>
      <div>
        <v-btn
          icon
          color="orange-darken-3"
          variant="tonal"
          size="comfortable"
          class="rounded-xl header-refresh-btn"
          @click="caricaDatiScheda"
          id="btn-refresh"
        >
          <v-icon size="20">mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Stato vuoto se atleta o scheda non sono selezionati -->
    <div v-if="!atletaSelezionato || !schedaSelezionata" class="empty-state text-center my-12 py-12 card-glass rounded-2xl border-dashed animate-fade-in">
      <v-icon size="80" color="orange-lighten-3" class="mb-4 animate-bounce">mdi-clipboard-text-search-outline</v-icon>
      <h3 class="text-h5 font-weight-bold text-slate-dark">Seleziona Atleta e Scheda</h3>
      <p class="text-body-1 text-muted mt-2 px-6">
        Scegli l'atleta e la scheda attiva nella sezione **Ricerca Wo** per caricare la tua dashboard.
      </p>
      <v-btn to="/ricerca" color="orange-darken-3" class="font-weight-bold text-none mt-6" rounded="xl" size="large">
        Vai a Ricerca Wo
      </v-btn>
    </div>

    <!-- Contenuto Principale se selezionati -->
    <div v-else class="animate-fade-in">
      <!-- Sub-Tabs Premium minimaliste -->
      <v-tabs
        v-model="subTab"
        color="orange-darken-3"
        align-tabs="center"
        grow
        class="custom-dashboard-tabs mb-6 rounded-xl elevation-1"
      >
        <v-tab value="dati" class="font-weight-black py-3 text-none">DASHBOARD</v-tab>
        <v-tab value="impostazioni" class="font-weight-black py-3 text-none">CONFIGURAZIONE</v-tab>
      </v-tabs>

      <v-window v-model="subTab">
        
        <!-- WINDOW 1: DATI SCHEDA (DASHBOARD) -->
        <v-window-item value="dati">
          
          <!-- Avanzamento Mesociclo Premium (Timeline Orizzontale a Sfere di Cristallo) -->
          <v-card class="mesocycle-progress-card rounded-2xl pa-4 mb-5 border text-left" elevation="2">
            <div class="d-flex align-center justify-space-between mb-4">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-widest" style="font-size: 0.62rem;">
                Avanzamento del Mesociclo
              </span>
              <v-chip color="orange-darken-3" size="x-small" class="font-weight-black px-2" variant="tonal">
                SETTIMANA {{ settimanaAttiva }} DI 6
              </v-chip>
            </div>
            
            <div class="d-flex align-center justify-space-between gap-1 mb-4 position-relative progression-track-container">
              <div class="progression-line-bg"></div>
              <div class="progression-line-fill" :style="{ width: getProgressionLineFillWidth }"></div>
              
              <div
                v-for="w in [1, 2, 3, 4, 5, 6]"
                :key="w"
                class="progression-step-node d-flex flex-column align-center position-relative"
                :class="{
                  'step-completed': w < settimanaAttiva,
                  'step-active': w === settimanaAttiva,
                  'step-future': w > settimanaAttiva
                }"
              >
                <div class="step-ring d-flex align-center justify-center">
                  <v-icon v-if="w < settimanaAttiva" size="14" color="white">mdi-check</v-icon>
                  <span v-else class="step-number">{{ w }}</span>
                </div>
                <span class="step-label text-super-caption font-weight-black mt-2" style="font-size: 0.58rem;">
                  {{ w < settimanaAttiva ? 'Fatta' : (w === settimanaAttiva ? 'Attiva' : 'Da fare') }}
                </span>
              </div>
            </div>

            <div class="d-flex align-center justify-space-between pt-3 border-top-soft text-caption font-weight-bold text-slate">
              <span class="d-flex align-center">
                <v-icon size="15" color="green-accent-4" class="mr-1">mdi-checkbox-marked-circle-outline</v-icon>
                Settimane fatte: <span class="text-green-lighten-2 ml-1 font-weight-black">{{ settimanaAttiva - 1 }} / 6</span>
              </span>
              <span class="d-flex align-center">
                <v-icon size="15" color="grey" class="mr-1">mdi-clock-outline</v-icon>
                Rimanenti: <span class="text-orange-lighten-2 ml-1 font-weight-black">{{ 6 - (settimanaAttiva - 1) }} settimane</span>
              </span>
            </div>
          </v-card>

          <!-- Card Allenamento Attivo (Gamified Hero Card con bagliore neon) -->
          <v-card class="premium-hero-card rounded-2xl pa-5 mb-6 text-left border position-relative overflow-hidden" elevation="3">
            <!-- Neon background accent -->
            <div class="glowing-accent"></div>
            
            <div class="d-flex align-center justify-space-between mb-4">
              <div class="d-flex align-center">
                <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase tracking-widest mr-2" style="font-size: 0.6rem;">
                  Allenamento del Giorno
                </span>
                <v-chip
                  v-if="giornoAttivo === giornoConsigliato"
                  color="green-accent-4"
                  size="x-small"
                  variant="flat"
                  class="font-weight-black text-white px-2 pulse-badge"
                  style="font-size: 0.58rem; height: 18px;"
                >
                  ⚡ SUGGERITO
                </v-chip>
              </div>
              <v-chip :color="getDayCompletion(giornoAttivo) ? 'green' : 'orange-darken-3'" size="x-small" class="font-weight-black" variant="tonal">
                {{ getDayCompletion(giornoAttivo) ? '✓ COMPLETATO' : 'PRONTO PER INIZIARE' }}
              </v-chip>
            </div>
            
            <div class="d-flex align-start justify-space-between mb-4">
              <div class="d-flex align-center min-width-0">
                <!-- Lettera Workout in grande -->
                <div class="giorno-huge-badge mr-4">{{ giornoAttivo }}</div>
                <div class="text-left min-width-0">
                  <h3 class="text-h5 font-weight-black text-slate-dark tracking-tight leading-tight">
                    Allenamento Giorno {{ giornoAttivo }}
                  </h3>
                  <!-- Focus muscolare -->
                  <div class="text-body-2 font-weight-black text-orange-lighten-2 text-truncate mt-1">
                    🎯 {{ getFocusSectors(giornoAttivo) }}
                  </div>
                  <!-- Calorie stimate -->
                  <div class="text-caption text-muted font-weight-bold d-flex align-center mt-1" style="font-size: 0.72rem;">
                    <v-icon size="14" color="orange" class="mr-1">mdi-fire</v-icon>
                    Stima Consumo: <span class="text-slate-dark ml-1 font-weight-black">{{ activeDayHeaderParsed?.calorie || 350 }} kcal</span>
                  </div>
                </div>
              </div>
            </div>
            
            <!-- Metrics Pills Row -->
            <v-row dense class="mb-4 text-center">
              <v-col cols="4">
                <div class="metric-pill pa-2 rounded-xl">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.55rem;">Durata</span>
                  <span class="text-body-2 font-weight-black text-slate-dark mt-0.5 d-block">
                    ⏱️ {{ activeDayHeaderParsed?.tempoMedia || '60 min' }}
                  </span>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="metric-pill pa-2 rounded-xl">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.55rem;">Serie Totali</span>
                  <span class="text-body-2 font-weight-black text-slate-dark mt-0.5 d-block">
                    🏋️ {{ activeDayVolumesParsed?.totale || '20' }} serie
                  </span>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="metric-pill pa-2 rounded-xl">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.55rem;">Densità</span>
                  <span class="text-body-2 font-weight-black text-slate-dark mt-0.5 d-block">
                    ⚡ {{ activeDayHeaderParsed?.densitaMedia || '60' }}%
                  </span>
                </div>
              </v-col>
            </v-row>
            
            <!-- Equalizzatore Volumi / Progress Bar di precisione -->
            <div v-if="activeDayVolumesParsed" class="volumes-mini-track pa-3 rounded-xl bg-slate-900-op mb-4 text-left border-soft">
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.6rem;">
                  Distribuzione dei Volumi di Lavoro
                </span>
                <span class="text-super-caption text-orange-lighten-2 font-weight-black" style="font-size: 0.6rem;">
                  {{ activeDayVolumesParsed.totale }} serie
                </span>
              </div>
              <v-row dense class="text-center font-weight-bold text-caption">
                <v-col :cols="activeDayVolumesParsed.centrale > 0 ? 4 : 6">
                  <div class="volume-micro-item py-1 px-2 rounded-lg">
                    <span class="text-muted d-block" style="font-size: 0.55rem;">Parte Alta (A)</span>
                    <span class="text-blue-lighten-2 font-weight-black" style="font-size: 0.78rem;">{{ activeDayVolumesParsed.alta }} <span style="font-size: 0.55rem;">serie</span></span>
                    <v-progress-linear
                      :model-value="activeDayVolumesParsed.totale > 0 ? (activeDayVolumesParsed.alta / activeDayVolumesParsed.totale) * 100 : 0"
                      color="blue-lighten-2"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </v-col>
                <v-col :cols="activeDayVolumesParsed.centrale > 0 ? 4 : 6">
                  <div class="volume-micro-item py-1 px-2 rounded-lg">
                    <span class="text-muted d-block" style="font-size: 0.55rem;">Parte Bassa (B)</span>
                    <span class="text-orange-lighten-2 font-weight-black" style="font-size: 0.78rem;">{{ activeDayVolumesParsed.bassa }} <span style="font-size: 0.55rem;">serie</span></span>
                    <v-progress-linear
                      :model-value="activeDayVolumesParsed.totale > 0 ? (activeDayVolumesParsed.bassa / activeDayVolumesParsed.totale) * 100 : 0"
                      color="orange-lighten-2"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </v-col>
                <v-col v-if="activeDayVolumesParsed.centrale > 0" cols="4">
                  <div class="volume-micro-item py-1 px-2 rounded-lg">
                    <span class="text-muted d-block" style="font-size: 0.55rem;">Centrale (C)</span>
                    <span class="text-green-lighten-2 font-weight-black" style="font-size: 0.78rem;">{{ activeDayVolumesParsed.centrale }} <span style="font-size: 0.55rem;">serie</span></span>
                    <v-progress-linear
                      :model-value="activeDayVolumesParsed.totale > 0 ? (activeDayVolumesParsed.centrale / activeDayVolumesParsed.totale) * 100 : 0"
                      color="green-lighten-2"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </v-col>
              </v-row>
            </div>
            
            <!-- Inizia Button con pulsazione neon -->
            <v-btn
              color="orange-darken-3"
              block
              size="large"
              rounded="xl"
              class="font-weight-black text-none py-3 text-white glowing-btn animate-pulse-slow mt-2"
              @click="avviaAllenamento"
              id="hero-play-btn"
            >
              APRI WORKOUT GIORNO {{ giornoAttivo }}
              <v-icon right class="ml-2" size="20">mdi-play-circle-outline</v-icon>
            </v-btn>
          </v-card>

          <!-- Dashboard Actions Grid 2x2 (High-Tech Floating Panels) -->
          <v-row dense class="mb-6 card-actions-grid">
            <!-- COACH NOTES CARD -->
            <v-col cols="6" class="pa-1">
              <v-card class="dashboard-action-card rounded-2xl pa-4 d-flex flex-column justify-space-between border-coaching" @click="apriLeggimi">
                <div class="d-flex align-center justify-space-between w-100">
                  <v-avatar color="amber-lighten-5" size="36" class="action-avatar border-amber">
                    <v-icon color="amber-darken-3" size="20">mdi-comment-text-multiple-outline</v-icon>
                  </v-avatar>
                  <v-chip color="amber-darken-4" size="x-small" class="font-weight-black px-1.5" variant="tonal">COACH</v-chip>
                </div>
                <div class="text-left mt-3">
                  <h4 class="text-caption font-weight-black text-slate-dark">Note Coach</h4>
                  <p class="text-super-caption text-muted text-truncate mt-1 mb-0" style="font-size: 0.65rem;">
                    {{ coachMessage || 'Nessun messaggio specifico' }}
                  </p>
                </div>
              </v-card>
            </v-col>
            
            <!-- FILMATI CARD -->
            <v-col cols="6" class="pa-1">
              <v-card class="dashboard-action-card rounded-2xl pa-4 d-flex flex-column justify-space-between border-video" @click="apriFilmati">
                <div class="d-flex align-center justify-space-between w-100">
                  <v-avatar color="red-lighten-5" size="36" class="action-avatar border-red">
                    <v-icon color="red-darken-3" size="20" :class="{ 'pulse-video-icon': countFilmati > 0 }">
                      {{ countFilmati > 0 ? 'mdi-video-outline' : 'mdi-video-off-outline' }}
                    </v-icon>
                  </v-avatar>
                  <v-chip color="red" size="x-small" class="font-weight-black px-1.5" variant="tonal" v-if="countFilmati > 0">RECORD</v-chip>
                </div>
                <div class="text-left mt-3">
                  <h4 class="text-caption font-weight-black text-slate-dark">Video da fare ({{ countFilmati }})</h4>
                  <p class="text-super-caption text-muted mt-1 mb-0" style="font-size: 0.65rem;">
                    {{ countFilmati > 0 ? 'Esercizi da registrare' : 'Nessuna ripresa richiesta' }}
                  </p>
                </div>
              </v-card>
            </v-col>
            
            <!-- TEST CARD -->
            <v-col cols="6" class="pa-1">
              <v-card class="dashboard-action-card rounded-2xl pa-4 d-flex flex-column justify-space-between border-test" @click="apriTest">
                <div class="d-flex align-center justify-space-between w-100">
                  <v-avatar color="blue-lighten-5" size="36" class="action-avatar border-blue">
                    <v-icon color="blue-darken-3" size="20">mdi-dumbbell</v-icon>
                  </v-avatar>
                  <v-chip color="blue" size="x-small" class="font-weight-black px-1.5" variant="tonal" v-if="countTest > 0">TEST</v-chip>
                </div>
                <div class="text-left mt-3">
                  <h4 class="text-caption font-weight-black text-slate-dark">Test / AMRAP ({{ countTest }})</h4>
                  <p class="text-super-caption text-muted mt-1 mb-0" style="font-size: 0.65rem;">
                    {{ countTest > 0 ? 'Verifica massimali attiva' : 'Nessun test in questa scheda' }}
                  </p>
                </div>
              </v-card>
            </v-col>
            
            <!-- PERIODIZZAZIONE STATS CARD -->
            <v-col cols="6" class="pa-1">
              <v-card class="dashboard-action-card rounded-2xl pa-4 d-flex flex-column justify-space-between border-calendar">
                <div class="d-flex align-center justify-space-between w-100">
                  <v-avatar color="deep-purple-lighten-5" size="36" class="action-avatar border-purple">
                    <v-icon color="deep-purple-darken-3" size="20">mdi-calendar-range</v-icon>
                  </v-avatar>
                  <v-chip color="deep-purple" size="x-small" class="font-weight-black px-1.5" variant="tonal">INFO</v-chip>
                </div>
                <div class="text-left mt-3">
                  <h4 class="text-caption font-weight-black text-slate-dark">Durata Mesociclo</h4>
                  <p class="text-super-caption text-muted mt-1 mb-0" style="font-size: 0.65rem; line-height: 1.2;">
                    Scadenza: {{ dataFine }}
                  </p>
                </div>
              </v-card>
            </v-col>
          </v-row>
        </v-window-item>

        <!-- WINDOW 2: CONFIGURAZIONE SCHEDA -->
        <v-window-item value="impostazioni">
          <v-card class="premium-card rounded-2xl pa-5 text-left border" elevation="2">
            <h3 class="text-h6 font-weight-black text-slate-dark mb-4 d-flex align-center">
              <v-icon color="orange-darken-3" class="mr-2">mdi-cog-outline</v-icon>
              Configura Scheda Attiva
            </h3>
            
            <!-- Pannello di Stato dell'Automazione -->
            <div class="mb-6 pa-4 rounded-xl card-glass border text-left">
              <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase tracking-widest d-block mb-2" style="font-size: 0.6rem;">
                STATO AUTOMATICO RILEVATO
              </span>
              <div class="d-flex align-center justify-space-between mb-2">
                <span class="text-body-2 text-slate font-weight-bold">Settimana Attiva:</span>
                <v-chip color="orange-darken-3" size="small" class="font-weight-black" variant="flat">
                  SETTIMANA {{ settimanaAttiva }}
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between">
                <span class="text-body-2 text-slate font-weight-bold">Allenamento Suggerito:</span>
                <v-chip color="green-accent-4" size="small" class="font-weight-black text-white" variant="flat">
                  GIORNO {{ giornoAttivo }}
                </v-chip>
              </div>
              <div class="text-super-caption text-muted mt-3" style="font-size: 0.65rem; line-height: 1.3;">
                ℹ️ La settimana attiva e il giorno di allenamento vengono calcolati automaticamente in base ai flag di completamento salvati nel database.
              </div>
            </div>

            <!-- Caution Reset Panel -->
            <div class="caution-panel pa-4 rounded-xl mt-6">
              <div class="d-flex align-start">
                <v-icon color="red-darken-2" class="mr-3 mt-1" size="24">mdi-alert-outline</v-icon>
                <div class="text-left">
                  <h4 class="text-caption font-weight-black text-red-lighten-2">Reset Dati di Carico</h4>
                  <p class="text-super-caption text-muted mt-1" style="font-size: 0.65rem; line-height: 1.3; opacity: 0.9;">
                    Questa operazione cancellerà in modo irreversibile tutti i carichi, i pesi e i commenti registrati per questa scheda (n.{{ schedaSelezionata }}).
                  </p>
                  <v-btn
                    color="red-darken-3"
                    variant="flat"
                    size="small"
                    class="font-weight-black text-none mt-3 rounded-lg text-white"
                    @click="apriReset"
                  >
                    Resetta Master Workout
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>
        </v-window-item>

      </v-window>
    </div>

    <!-- DIALOG POPUPS (Unificate stile Glassmorphism Premium) -->
    <!-- dialog LEGGIMI -->
    <v-dialog v-model="mostraLeggimi" max-width="500" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border">
        <v-card-title class="font-weight-black text-slate-dark d-flex align-center px-0">
          <v-icon color="orange-darken-3" class="mr-2">mdi-comment-text-multiple-outline</v-icon>
          Messaggio del Coach 📋
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-1 text-slate font-weight-medium leading-relaxed text-left">
          {{ coachMessage || 'Nessun messaggio o nota specifica per questa scheda dal tuo allenatore.' }}
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraLeggimi = false" class="text-white font-weight-bold">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog FILMATI -->
    <v-dialog v-model="mostraFilmati" max-width="500" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border">
        <v-card-title class="font-weight-black text-slate-dark d-flex align-center px-0">
          <v-icon color="red-darken-3" class="mr-2">mdi-video-outline</v-icon>
          Esercizi da Filmare 📹
        </v-card-title>
        <v-card-text class="px-0 py-4">
          <div v-if="filmatiList.length === 0" class="text-center py-4 text-muted text-body-2">
            Nessun esercizio da riprendere in questa scheda! 👍
          </div>
          <v-list v-else density="comfortable" class="bg-transparent py-0">
            <v-list-item
              v-for="ex in filmatiList"
              :key="ex.id"
              class="px-0 py-2 border-bottom-soft"
            >
              <v-list-item-title class="font-weight-bold text-slate-dark text-left">{{ ex.des_esercizio }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption text-orange-darken-3 text-left">Giorno {{ ex.des_giorno }} • Riga {{ ex.num_riga_giorno }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraFilmati = false" class="text-white font-weight-bold">Ok</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog TEST -->
    <v-dialog v-model="mostraTest" max-width="500" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border">
        <v-card-title class="font-weight-black text-slate-dark d-flex align-center px-0">
          <v-icon color="blue-darken-3" class="mr-2">mdi-dumbbell</v-icon>
          Esercizi da Testare 🏋️
        </v-card-title>
        <v-card-text class="px-0 py-4">
          <div v-if="testList.length === 0" class="text-center py-4 text-muted text-body-2">
            Nessun test o AMRAP specifico richiesto in questa scheda.
          </div>
          <v-list v-else density="comfortable" class="bg-transparent py-0">
            <v-list-item
              v-for="ex in testList"
              :key="ex.id"
              class="px-0 py-2 border-bottom-soft"
            >
              <v-list-item-title class="font-weight-bold text-slate-dark text-left">{{ ex.des_esercizio }}</v-list-item-title>
              <v-list-item-subtitle class="text-caption text-blue-darken-3 text-left">Giorno {{ ex.des_giorno }} • Test: {{ ex.des_qta_report }}</v-list-item-subtitle>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraTest = false" class="text-white font-weight-bold">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog CONFERMA RESET -->
    <v-dialog v-model="confermaReset" max-width="400" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border">
        <v-card-title class="font-weight-black text-red-darken-3 d-flex align-center px-0">
          <v-icon color="red-darken-3" class="mr-2">mdi-alert-outline</v-icon>
          Reset Master Workout
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-2 text-slate font-weight-medium text-left">
          Attenzione! Questa operazione pulirà tutti i carichi e le note inserite per questa specifica scheda (n.{{ schedaSelezionata }}). Vuoi procedere?
        </v-card-text>
        <v-card-actions class="px-0 pb-0 gap-3">
          <v-btn color="grey-darken-1" variant="outlined" class="flex-grow-1 text-slate font-weight-bold" rounded="lg" @click="confermaReset = false">Annulla</v-btn>
          <v-btn color="red-darken-2" variant="flat" class="flex-grow-1 text-white font-weight-bold" rounded="lg" @click="eseguiResetDati" :loading="resettando">Reset</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { selectedAthlete, selectedSheet, getNomeAtleta } from '../authStore.js';

const router = useRouter();

// Micro-vibrazione tattile per smartphone (Haptic feedback)
const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Stato principale
const subTab = ref('dati');
const atletaSelezionato = ref(selectedAthlete.value);
const schedaSelezionata = ref(selectedSheet.value);

// Dati dinamici scheda
const nomeAtleta = ref('');
const settimanaAttiva = ref(parseInt(localStorage.getItem('settimanaAttiva_' + selectedAthlete.value)) || 2);
const giornoAttivo = ref(localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'C');
const dataInizio = ref('18 mag 26');
const dataFine = ref('28 giu 26');

// Modali e popups
const mostraLeggimi = ref(false);
const mostraFilmati = ref(false);
const mostraTest = ref(false);
const confermaReset = ref(false);
const resettando = ref(false);

const coachMessage = ref('');
const filmatiList = ref([]);
const testList = ref([]);
const allExercises = ref([]);

// Conteggi
const countFilmati = ref(0);
const countTest = ref(0);

// Saluto orario dinamico
const salutoOrario = computed(() => {
  const ora = new Date().getHours();
  if (ora >= 5 && ora < 12) return 'Buongiorno ☀️';
  if (ora >= 12 && ora < 18) return 'Buon pomeriggio ⚡';
  if (ora >= 18 && ora < 22) return 'Buonasera 🌙';
  return 'Buonanotte 💤';
});

// Computed per la barra di riempimento del progresso delle settimane nel mesociclo
const getProgressionLineFillWidth = computed(() => {
  if (settimanaAttiva.value <= 1) return '0%';
  if (settimanaAttiva.value >= 6) return '100%';
  return ((settimanaAttiva.value - 1) / 5 * 100) + '%';
});

// Calcola il primo giorno non completato della settimana attiva
const giornoConsigliato = computed(() => {
  const giorni = ['A', 'B', 'C', 'D'];
  for (const g of giorni) {
    if (!getDayCompletion(g)) {
      return g;
    }
  }
  return 'A'; // Default
});

// Helper per applicare le modifiche salvate offline nel localStorage
const applicaModificheLocali = (item) => {
  if (!item) return item;
  const key1 = `offline_storyboard_${item.id}`;
  const key2 = `offline_storyboard_${item.num_riga}`;
  const localData1 = localStorage.getItem(key1);
  const localData2 = localStorage.getItem(key2);
  
  let updates = {};
  if (localData1) {
    try { updates = { ...updates, ...JSON.parse(localData1) }; } catch (e) {}
  }
  if (localData2) {
    try { updates = { ...updates, ...JSON.parse(localData2) }; } catch (e) {}
  }
  
  return { ...item, ...updates };
};

// Ricalcola la settimana attiva globale (prima settimana non completamente completata)
const calcolaSettimanaAttivaGlobale = (exercises) => {
  const giorni = ['A', 'B', 'C', 'D'];
  for (let w = 1; w <= 6; w++) {
    let tuttiCompletati = true;
    for (const g of giorni) {
      const header = exercises.find(
        item => (item.des_giorno || '').trim() === g && parseInt(item.num_riga_giorno) === 0
      );
      if (!header || header['cmp' + w] !== 'true') {
        tuttiCompletati = false;
        break;
      }
    }
    if (!tuttiCompletati) {
      return w;
    }
  }
  return 6; // Se tutte completate, ritorna l'ultima
};

// Caricamento
const caricaDatiScheda = async () => {
  if (!selectedAthlete.value || !selectedSheet.value) return;

  atletaSelezionato.value = selectedAthlete.value;
  schedaSelezionata.value = selectedSheet.value;

  // Carica il nome reale dell'atleta dalla mappa CLIENTI statica, altrimenti fallback su UTENTI
  const nomeMappato = getNomeAtleta(selectedAthlete.value);
  if (nomeMappato) {
    nomeAtleta.value = nomeMappato.toUpperCase();
  } else {
    nomeAtleta.value = 'GABRIELE BELMONTE';
  }
  
  try {
    // Cerca l'atleta per estrarre il nome effettivo (solo se non era presente in anagrafica statica)
    const qAtleta = query(collection(db, 'UTENTI'), where('ID_cliente', '==', selectedAthlete.value));
    const snapAtleta = await getDocs(qAtleta);
    snapAtleta.forEach(d => {
      if (!nomeMappato) {
        const email = d.data().email || '';
        nomeAtleta.value = email.split('@')[0].toUpperCase();
      }
    });

    // Carica gli esercizi per estrarre i test, i video e le note
    const qEx = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', selectedAthlete.value),
      where('num_scheda', '==', selectedSheet.value)
    );
    const snapEx = await getDocs(qEx);
    
    let tempFilmati = [];
    let tempTest = [];
    let tempExercises = [];
    let noteScheda = '';

    snapEx.forEach(d => {
      const data = d.data();
      const mappedEx = applicaModificheLocali({ id: d.id, ...data });
      tempExercises.push(mappedEx);
      
      // Esercizi da filmare (flg_video === 'true')
      if (mappedEx.flg_video === 'true') {
        tempFilmati.push(mappedEx);
      }

      // Esercizi da testare (ad es. AMRAP o test in des_qta_report o tecnica)
      const qta = (mappedEx.des_qta_report || '').toLowerCase();
      if (qta.includes('amrap') || qta.includes('test') || qta.includes('ramp')) {
        tempTest.push(mappedEx);
      }

      // Estrai le note generali del coach
      if (mappedEx.des_note && !noteScheda) {
        noteScheda = mappedEx.des_note;
      }
    });

    // CONTROLLO DI SICUREZZA: se mancano le righe 0 in Firestore, carichiamole dal backup!
    const giorniHeader = ['A', 'B', 'C', 'D'];
    let haMancantiHome = giorniHeader.some(g => !tempExercises.some(item => (item.des_giorno || '').trim() === g && parseInt(item.num_riga_giorno) === 0));
    if (haMancantiHome) {
      try {
        const res = await fetch('/storyboard_backup.json');
        const allData = await res.json();
        giorniHeader.forEach(g => {
          const giaPresente = tempExercises.some(item => (item.des_giorno || '').trim() === g && parseInt(item.num_riga_giorno) === 0);
          if (!giaPresente) {
            const backupHeader = allData.find(
              item => String(item.ID_cliente) === String(selectedAthlete.value) &&
              String(item.num_scheda) === String(selectedSheet.value) &&
              (item.des_giorno || '').trim() === g &&
              parseInt(item.num_riga_giorno) === 0
            );
            if (backupHeader) {
              tempExercises.push(applicaModificheLocali(backupHeader));
            }
          }
        });
      } catch (err) {
        console.error("Errore caricamento righe 0 da backup in Home try block:", err);
      }
    }

    allExercises.value = tempExercises;
    filmatiList.value = tempFilmati;
    countFilmati.value = tempFilmati.length;

    testList.value = tempTest;
    countTest.value = tempTest.length;

    coachMessage.value = noteScheda;

    // Calcola e aggiorna la settimana attiva globale
    const activeW = calcolaSettimanaAttivaGlobale(tempExercises);
    settimanaAttiva.value = activeW;
    localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);

    // Auto-seleziona il primo giorno non completato per la settimana attiva
    const giorni = ['A', 'B', 'C', 'D'];
    let giornoDaFare = '';
    for (const g of giorni) {
      const header = tempExercises.find(
        item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0)
      );
      const completato = header ? (header['cmp' + activeW] === 'true') : false;
      if (!completato) {
        giornoDaFare = g;
        break;
      }
    }
    if (giornoDaFare) {
      giornoAttivo.value = giornoDaFare;
      localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giornoDaFare);
    }

  } catch (error) {
    console.warn("Errore caricamento dettagli Home da Firestore (quota esaurita), provo da backup locale:", error);
    try {
      const res = await fetch('/storyboard_backup.json');
      const allData = await res.json();
      const rawExercises = allData.filter(
        item => String(item.ID_cliente) === String(selectedAthlete.value) && String(item.num_scheda) === String(selectedSheet.value)
      );
      const tempExercises = rawExercises.map(applicaModificheLocali);
      
      let tempFilmati = [];
      let tempTest = [];
      let noteScheda = '';

      tempExercises.forEach(data => {
        if (data.flg_video === 'true') {
          tempFilmati.push(data);
        }
        const qta = (data.des_qta_report || '').toLowerCase();
        if (qta.includes('amrap') || qta.includes('test') || qta.includes('ramp')) {
          tempTest.push(data);
        }
        if (data.des_note && !noteScheda) {
          noteScheda = data.des_note;
        }
      });

      allExercises.value = tempExercises;
      filmatiList.value = tempFilmati;
      countFilmati.value = tempFilmati.length;

      testList.value = tempTest;
      countTest.value = tempTest.length;

      coachMessage.value = noteScheda;

      // Calcola e aggiorna la settimana attiva globale
      const activeW = calcolaSettimanaAttivaGlobale(tempExercises);
      settimanaAttiva.value = activeW;
      localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);

      const giorni = ['A', 'B', 'C', 'D'];
      let giornoDaFare = '';
      for (const g of giorni) {
        const header = tempExercises.find(
          item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0)
        );
        const completato = header ? (header['cmp' + activeW] === 'true') : false;
        if (!completato) {
          giornoDaFare = g;
          break;
        }
      }
      if (giornoDaFare) {
        giornoAttivo.value = giornoDaFare;
        localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giornoDaFare);
      }
    } catch (errBackup) {
      console.error("Errore nel caricamento del backup locale in Home:", errBackup);
    }
  }
};

// Parser delle stringhe di intestazione del giorno e dei volumi (coordinato con Workouts.vue)
const parseDayHeader = (str) => {
  if (!str) return null;
  const cleanStr = str.trim();
  const regex = /WO\s+([A-D])\s*\[\s*([^%]+?)\s+(\d+)\s*%\s*\/\s*([^%]+?)\s+(\d+)\s*%\s*\]\s*K:\s*(\d+)/i;
  const match = cleanStr.match(regex);
  if (match) {
    const giorno = match[1];
    const t1 = match[2];
    const d1 = parseInt(match[3]);
    const t2 = match[4];
    const d2 = parseInt(match[5]);
    const calorie = parseInt(match[6]);
    
    const parseTimeToMins = (tStr) => {
      if (!tStr) return 0;
      const clean = tStr.toLowerCase().replace('min', '').replace('m', '').trim();
      if (clean.includes(':')) {
        const parts = clean.split(':');
        if (parts.length === 2) {
          return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
        }
      }
      return parseInt(clean, 10) || 0;
    };
    
    const formatMinsToTime = (totalMins) => {
      const hours = Math.floor(totalMins / 60);
      const mins = Math.round(totalMins % 60);
      if (hours > 0) {
        return `${hours}:${String(mins).padStart(2, '0')}`;
      }
      return `${mins} min`;
    };
    
    const m1 = parseTimeToMins(t1);
    const m2 = parseTimeToMins(t2);
    const mediaMins = Math.round((m1 + m2) / 2);
    const tempoMedia = formatMinsToTime(mediaMins);
    
    const densitaMedia = Math.round((d1 + d2) / 2);
    
    return {
      giorno,
      tempo1: t1.trim(),
      densita1: d1,
      tempo2: t2.trim(),
      densita2: d2,
      tempoMedia,
      densitaMedia,
      calorie
    };
  }
  return null;
};

const parseVolumes = (str) => {
  if (!str) return null;
  const cleanStr = str.trim();
  const regex = /VOL:\s*([\d,.]+)\s+A:\s*([\d,.]+)\s+B:\s*([\d,.]+)(?:\s+C:\s*([\d,.]+))?/i;
  const match = cleanStr.match(regex);
  if (match) {
    const cleanFloat = (valStr) => {
      if (!valStr) return 0;
      const clean = valStr.replace(',', '.');
      return parseFloat(clean) || 0;
    };
    return {
      totale: cleanFloat(match[1]),
      alta: cleanFloat(match[2]),
      bassa: cleanFloat(match[3]),
      centrale: match[4] ? cleanFloat(match[4]) : 0
    };
  }
  return null;
};

// Computed properties per l'allenamento attivo di oggi
const activeDayHeader = computed(() => {
  return allExercises.value.find(
    item => (item.des_giorno || '').trim() === giornoAttivo.value && (parseInt(item.num_riga_giorno) === 0)
  ) || null;
});

const activeDayHeaderParsed = computed(() => {
  if (!activeDayHeader.value) return null;
  return parseDayHeader(activeDayHeader.value.des_esercizio);
});

const activeDayVolumesParsed = computed(() => {
  if (!activeDayHeader.value) return null;
  return parseVolumes(activeDayHeader.value.ins_esercizio);
});

// Calcola i focus muscolari per ciascun giorno
const getFocusSectors = (giorno) => {
  const exs = allExercises.value.filter(
    e => (e.des_giorno || '').trim() === giorno && parseInt(e.num_riga_giorno) > 0
  );
  const sectors = exs.map(e => e.des_settore).filter(Boolean);
  if (sectors.length === 0) return 'Giorno ' + giorno;
  
  const counts = {};
  sectors.forEach(s => {
    counts[s] = (counts[s] || 0) + 1;
  });
  
  const sorted = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
  
  const humanize = (s) => {
    const map = {
      'PectoralSternal': 'Petto Basso',
      'BackGeneral': 'Dorsali',
      'Obliques': 'Obliqui',
      'Ischiocrurali': 'Femorali',
      'PectoralClavicular': 'Petto Alto',
      'DeltoidPosterior': 'Deltoidi Post.',
      'Triceps': 'Tricipiti',
      'Quadriceps': 'Quadricipiti',
      'GluteusMaximus': 'Glutei',
      'DeltoidLateral': 'Deltoidi Lat.',
      'DeltoidAnterior': 'Deltoidi Ant.',
      'LatissimusDorsi': 'Dorsali Lat',
      'Biceps': 'Bicipiti'
    };
    return map[s] || s;
  };
  
  return sorted.slice(0, 2).map(humanize).join(' & ');
};

// Calcola il completamento della giornata per la settimana attiva
const getDayCompletion = (giorno) => {
  const header = allExercises.value.find(
    item => (item.des_giorno || '').trim() === giorno && (parseInt(item.num_riga_giorno) === 0)
  );
  if (!header) return false;
  return header['cmp' + settimanaAttiva.value] === 'true';
};

// Selezione rapida del giorno dal Journey Track
const selezionaGiornoRapido = (giorno) => {
  vibraTattile(12);
  giornoAttivo.value = giorno;
  localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giorno);
};

onMounted(() => {
  caricaDatiScheda();
});

// Ascolta i cambiamenti di selezione globale
watch([selectedAthlete, selectedSheet], () => {
  caricaDatiScheda();
  settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + selectedAthlete.value)) || 2;
  giornoAttivo.value = localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'C';
});

// Configurazione dalle Impostazioni
const salvaSettimanaConfig = (w) => {
  vibraTattile(12);
  settimanaAttiva.value = w;
  localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, w);
  
  // Auto-seleziona il primo giorno non completato per la nuova settimana attiva
  const giorni = ['A', 'B', 'C', 'D'];
  let giornoDaFare = '';
  for (const g of giorni) {
    if (!getDayCompletion(g)) {
      giornoDaFare = g;
      break;
    }
  }
  if (giornoDaFare) {
    giornoAttivo.value = giornoDaFare;
    localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giornoDaFare);
  }
};

const salvaGiornoConfig = (g) => {
  vibraTattile(12);
  giornoAttivo.value = g;
  localStorage.setItem('giornoAttivo_' + selectedAthlete.value, g);
};

// Resetta tutti i dati di input per questo mesociclo
const eseguiResetDGrid = async () => {
  resettando.value = true;
  try {
    vibraTattile(35); // Vibrazione forte di allerta
    const qEx = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', selectedAthlete.value),
      where('num_scheda', '==', selectedSheet.value)
    );
    const snapEx = await getDocs(qEx);
    
    // Esegui pulizia di ins_week e reps_week
    const promesse = [];
    snapEx.forEach(documento => {
      const docRef = doc(db, 'STORYBOARD', documento.id);
      const puliziaPayload = {};
      for (let w = 1; w <= 6; w++) {
        puliziaPayload['ins_week' + w] = '';
        puliziaPayload['reps_week' + w] = '';
      }
      puliziaPayload['des_commenti'] = '';
      promesse.push(updateDoc(docRef, puliziaPayload));
    });

    await Promise.all(promesse);
    confermaReset.value = false;
    await caricaDatiScheda();
  } catch (error) {
    console.error("Errore durante il reset della scheda:", error);
  } finally {
    resettando.value = false;
  }
};

const eseguiResetDati = () => {
  eseguiResetDGrid();
};

// Naviga subito ai workouts
const avviaAllenamento = () => {
  vibraTattile(15);
  router.push('/');
};

// Gestione click bottoni con vibrazione
const apriLeggimi = () => {
  vibraTattile(12);
  mostraLeggimi.value = true;
};

const apriFilmati = () => {
  vibraTattile(12);
  mostraFilmati.value = true;
};

const apriReset = () => {
  vibraTattile(15);
  confermaReset.value = true;
};

const apriTest = () => {
  vibraTattile(12);
  mostraTest.value = true;
};
</script>

<style scoped>
.max-width-container {
  max-width: 600px;
  margin: 0 auto;
}

.min-height-screen {
  min-height: calc(100vh - 140px);
}

.home-dashboard {
  background-color: transparent;
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

.text-super-caption {
  font-size: 0.65rem !important;
  letter-spacing: 0.08em;
}

.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
}

/* 1. Header Styles */
.profile-avatar-wrapper {
  position: relative;
  display: inline-block;
}

.profile-avatar {
  border: 2px solid rgba(249, 115, 22, 0.35);
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.15);
  background: white;
}

.active-dot {
  position: absolute;
  bottom: 0;
  right: 2px;
  width: 12px;
  height: 12px;
  background-color: #10b981;
  border: 2px solid #0b0f19;
  border-radius: 50%;
  box-shadow: 0 0 8px #10b981;
}

.header-refresh-btn {
  background: rgba(249, 115, 22, 0.08) !important;
  border: 1px solid rgba(249, 115, 22, 0.25) !important;
  transition: all 0.25s ease;
}

.header-refresh-btn:hover {
  transform: rotate(180deg);
  background: rgba(249, 115, 22, 0.15) !important;
}

/* 2. Custom Tabs */
.custom-dashboard-tabs {
  background: rgba(15, 23, 42, 0.5) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* 3. Mesocycle Progress Card */
.mesocycle-progress-card {
  background: rgba(15, 23, 42, 0.55) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
}

.progression-track-container {
  padding: 10px 4px;
}

.progression-line-bg {
  position: absolute;
  top: calc(50% - 10px);
  left: 12px;
  right: 12px;
  height: 4px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 2px;
  z-index: 0;
}

.progression-line-fill {
  position: absolute;
  top: calc(50% - 10px);
  left: 12px;
  height: 4px;
  background: linear-gradient(90deg, #10b981 0%, #f97316 100%);
  border-radius: 2px;
  z-index: 1;
  transition: width 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.progression-step-node {
  z-index: 2;
  flex: 1;
  transition: all 0.2s ease;
}

.progression-step-node:hover {
  transform: translateY(-2px);
}

.step-ring {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: rgba(30, 41, 59, 0.9);
  border: 2px solid rgba(255, 255, 255, 0.12);
  transition: all 0.3s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.step-number {
  font-size: 0.72rem;
  font-weight: 800;
  color: #94a3b8;
}

.step-label {
  color: #94a3b8;
  transition: all 0.3s ease;
}

/* Progression Step States */
.step-completed .step-ring {
  background: #10b981;
  border-color: #10b981;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.3);
}

.step-completed .step-label {
  color: #10b981;
}

.step-active .step-ring {
  background: #ea580c;
  border-color: #f97316;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.5);
  transform: scale(1.15);
}

.step-active .step-number {
  color: white;
  font-weight: 900;
}

.step-active .step-label {
  color: #f97316;
  font-weight: 900;
}

.step-future .step-ring {
  background: rgba(15, 23, 42, 0.95);
  border-color: rgba(255, 255, 255, 0.06);
}

/* 4. Journey Day Cards */
.journey-day-card {
  height: 92px;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: 1px solid rgba(255, 255, 255, 0.04);
  background: rgba(15, 23, 42, 0.45);
}

.journey-day-card:hover {
  transform: translateY(-3px);
  background: rgba(15, 23, 42, 0.7);
  border-color: rgba(255, 255, 255, 0.08);
}

.journey-day-card:active {
  transform: scale(0.96);
}

.active-day-border {
  border-color: #f97316 !important;
  background: rgba(249, 115, 22, 0.08) !important;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.15);
}

.active-day-border .day-letter {
  color: #f97316 !important;
  font-weight: 900;
}

.completed-day-bg {
  border-color: rgba(16, 185, 129, 0.25) !important;
  background: rgba(16, 185, 129, 0.03) !important;
}

.day-badge-wrapper {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.day-letter {
  font-size: 1.25rem;
  font-weight: 800;
  color: #f8fafc;
}

.completed-checkmark {
  top: -6px;
  right: -8px;
  background: #0b0f19;
  border-radius: 50%;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.6);
}

/* 5. Premium Hero Card */
.premium-hero-card {
  background: linear-gradient(135deg, rgba(15, 23, 42, 0.85) 0%, rgba(3, 7, 18, 0.95) 100%) !important;
  border: 1px solid rgba(249, 115, 22, 0.2) !important;
  box-shadow: 0 12px 40px -10px rgba(0, 0, 0, 0.5) !important;
}

.glowing-accent {
  position: absolute;
  top: -50px;
  right: -50px;
  width: 160px;
  height: 160px;
  border-radius: 50%;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.14) 0%, rgba(249, 115, 22, 0) 70%);
  filter: blur(20px);
  pointer-events: none;
}

.giorno-huge-badge {
  background: linear-gradient(135deg, #ea580c, #f97316);
  color: white;
  width: 60px;
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 16px;
  font-weight: 900;
  font-size: 2rem;
  box-shadow: 0 8px 20px rgba(249, 115, 22, 0.35);
  flex-shrink: 0;
}

.metric-pill {
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.bg-slate-900-op {
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.04) !important;
}

.volume-micro-item {
  background: rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.glowing-btn {
  box-shadow: 0 8px 25px -5px rgba(249, 115, 22, 0.4) !important;
  transition: all 0.25s ease !important;
}

.glowing-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 30px -5px rgba(249, 115, 22, 0.55) !important;
}

.glowing-btn:active {
  transform: translateY(0);
}

/* 6. Dashboard Action Cards & Grid */
.card-actions-grid {
  margin: 0 -4px;
}

.dashboard-action-card {
  background: rgba(15, 23, 42, 0.5) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  height: 124px;
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

.action-avatar {
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.dashboard-action-card:hover {
  transform: translateY(-4px);
  background: rgba(30, 41, 59, 0.4) !important;
}

.border-coaching:hover {
  border-color: rgba(245, 158, 11, 0.3) !important;
  box-shadow: 0 8px 25px -8px rgba(245, 158, 11, 0.25) !important;
}

.border-video:hover {
  border-color: rgba(239, 68, 68, 0.3) !important;
  box-shadow: 0 8px 25px -8px rgba(239, 68, 68, 0.25) !important;
}

.border-test:hover {
  border-color: rgba(59, 130, 246, 0.3) !important;
  box-shadow: 0 8px 25px -8px rgba(59, 130, 246, 0.25) !important;
}

.border-calendar:hover {
  border-color: rgba(139, 92, 246, 0.3) !important;
  box-shadow: 0 8px 25px -8px rgba(139, 92, 246, 0.25) !important;
}

.pulse-video-icon {
  animation: pulse-video 2s infinite alternate;
}

@keyframes pulse-video {
  0% {
    opacity: 0.5;
    transform: scale(0.92);
  }
  100% {
    opacity: 1;
    transform: scale(1.08);
    color: #ef4444 !important;
  }
}

/* 7. Settings tab select buttons */
.premium-card {
  background: rgba(15, 23, 42, 0.5) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.chip-select-btn {
  background: rgba(30, 41, 59, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #cbd5e1;
  font-weight: 700;
  width: 50px;
  height: 50px;
  border-radius: 12px;
  font-size: 0.95rem;
  transition: all 0.2s cubic-bezier(0.2, 0.8, 0.2, 1);
}

.day-chip {
  width: calc(50% - 8px);
  height: 48px;
}

.chip-select-btn:hover {
  border-color: rgba(249, 115, 22, 0.4);
  background: rgba(249, 115, 22, 0.04);
}

.chip-select-btn-active {
  background: linear-gradient(135deg, #ea580c, #f97316) !important;
  border-color: #f97316 !important;
  color: white !important;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.35) !important;
}

.caution-panel {
  background: rgba(239, 68, 68, 0.06);
  border: 1px solid rgba(239, 68, 68, 0.2);
  border-left: 4px solid #ef4444;
}

/* Animations */
.animate-pulse-slow {
  animation: pulse-slow 3s infinite alternate;
}

@keyframes pulse-slow {
  0% {
    box-shadow: 0 8px 25px -5px rgba(249, 115, 22, 0.3) !important;
  }
  100% {
    box-shadow: 0 8px 30px 2px rgba(249, 115, 22, 0.45) !important;
  }
}

.pulse-badge {
  box-shadow: 0 0 8px rgba(16, 185, 129, 0.5);
  animation: pulse-green 1.5s infinite alternate;
}

@keyframes pulse-green {
  0% {
    transform: scale(0.95);
    box-shadow: 0 0 4px rgba(16, 185, 129, 0.3);
  }
  100% {
    transform: scale(1.05);
    box-shadow: 0 0 10px rgba(16, 185, 129, 0.6);
  }
}

.animate-slide-down {
  animation: slide-down 0.4s ease-out;
}

@keyframes slide-down {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fade-in {
  animation: fade-in 0.4s ease-out;
}

@keyframes fade-in {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
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

/* Glassmorphism popups */
.card-glass {
  background: rgba(15, 23, 42, 0.75) !important;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}
</style>
