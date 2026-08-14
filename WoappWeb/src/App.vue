<template>
  <v-app>
    <!-- BARRA SUPERIORE PREMIUM (Mostrata solo se l'utente è autenticato) -->
    <v-app-bar
      v-if="utente"
      flat
      class="border-bottom px-2 px-sm-4"
      density="compact"
      style="background-color: var(--nav-bg) !important; z-index: 1000 !important;"
    >
      <v-app-bar-title class="text-slate-dark" style="line-height: 1.15;">
        <div class="d-flex flex-column text-left">
          <div class="font-weight-black d-flex align-center cursor-pointer" style="font-size: 1.05rem !important; line-height: 1.1;" @click="gestisciClickLogo" title="FlexCoach">
            <v-icon color="primary" class="mr-1.5 text-theme-primary" size="18">mdi-dumbbell</v-icon>
            FlexCoach<span class="orange-dot">.</span>
          </div>
          <div class="text-super-caption text-muted font-weight-medium" style="font-size: 0.62rem !important; margin-left: 24px; margin-top: 1px;">
            {{ activeAthleteName }} • {{ activeSheetNumber }}
          </div>
        </div>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Profilo utente e Logout -->
      <div class="d-none d-sm-flex flex-column align-end mr-4">
        <span class="text-caption font-weight-bold text-slate-dark">{{ utente.email }}</span>
        <span class="text-caption text-theme-primary font-weight-bold">
          {{ ruolo === 'coach' ? 'Coach 📋' : 'Atleta #' + idCliente }}
        </span>
      </div>

      <!-- Se coach, mostra pulsante Pannello Controllo -->
      <v-btn
        v-if="ruolo === 'coach'"
        icon
        color="primary"
        variant="text"
        class="rounded-lg mr-1.5 btn-header-compact text-theme-primary"
        to="/admin"
        title="Pannello di Controllo Coach"
        id="btn-admin-panel"
      >
        <v-icon size="20">mdi-cog</v-icon>
      </v-btn>

      <!-- Slot per azioni dinamiche di pagina (es. menu 3 puntini Dettaglio esercizio) -->
      <div id="top-app-bar-actions" class="d-flex align-center"></div>

      <!-- Pulsante Toggle Tema Chiaro / Scuro -->
      <v-btn
        icon
        color="primary"
        variant="text"
        class="rounded-lg mr-1.5 btn-header-compact text-theme-primary"
        @click="toggleTema"
        :title="currentTheme === 'light' ? 'Passa al Tema Scuro OLED' : 'Passa al Tema Chiaro Arctic'"
        id="btn-toggle-theme"
      >
        <v-icon size="20">{{ currentTheme === 'light' ? 'mdi-weather-night' : 'mdi-white-balance-sunny' }}</v-icon>
      </v-btn>

      <!-- Pulsante Guida / Aiuto Progressione -->
      <v-btn
        icon
        color="primary"
        variant="text"
        class="rounded-lg mr-1.5 btn-header-compact text-theme-primary"
        @click="mostraDialogGuida = true"
        title="Guida all'Uso e Regole di Progressione"
        id="btn-guida-uso"
      >
        <v-icon size="20">mdi-help-circle-outline</v-icon>
      </v-btn>

      <v-btn
        icon
        color="red-darken-2"
        variant="flat"
        class="rounded-lg text-white btn-header-compact"
        @click="eseguiLogout"
        id="btn-logout"
      >
        <v-icon size="16">mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    
    <!-- L'AREA CENTRALE: Qui appariranno le pagine del Router -->
    <v-main style="background-color: transparent; padding-bottom: 80px;">
      <router-view v-slot="{ Component }">
        <transition :name="globalTransition" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <!-- LA BARRA INFERIORE DI NAVIGAZIONE (Mostrata solo se l'utente è autenticato) -->
    <v-bottom-navigation
      v-if="utente"
      grow
      color="primary"
      fixed
      elevation="4"
      class="premium-nav"
    >
      <v-btn to="/home" id="nav-home" @click="vibraTattile(8)">
        <v-icon>mdi-home</v-icon>
        <span>Home</span>
      </v-btn>

      <v-btn to="/" id="nav-workouts" @click="vibraTattile(8)">
        <v-icon>mdi-dumbbell</v-icon>
        <span>WORKOUTS</span>
      </v-btn>

      <v-btn to="/infortuni" id="nav-infortuni" @click="vibraTattile(8)">
        <v-icon>mdi-bandage</v-icon>
        <span>Infortuni</span>
      </v-btn>

      <v-btn to="/grafici" id="nav-grafici" @click="vibraTattile(8)">
        <v-icon>mdi-chart-bar</v-icon>
        <span>Grafici</span>
      </v-btn>

      <v-btn to="/impostazioni" id="nav-impostazioni" @click="vibraTattile(8)">
        <v-icon>mdi-cog-outline</v-icon>
        <span>Impostazioni</span>
      </v-btn>

    </v-bottom-navigation>

    <!-- WIDGET TIMER DI RECUPERO GLOBALE FLOATING (Premium UX) -->
    <transition name="fade-instant-leave">
      <v-card
        v-if="activeTimer"
        :class="[
          'global-timer-pill rounded-2xl justify-space-between elevation-4',
          timerSizeConfig.paddingClass,
          activeTimer.isMinReached ? (
            timerThemeGlobal === 'solid-contrast' ? 'timer-theme-solid-contrast-success' :
            timerThemeGlobal === 'orange-glow' ? 'timer-theme-green-glow' : 'timer-theme-success-glow'
          ) : (
            timerThemeGlobal === 'solid-contrast' ? 'timer-theme-solid-contrast' :
            timerThemeGlobal === 'orange-glow' ? 'timer-theme-orange-glow' : 'timer-theme-accent-dark'
          )
        ]"
        :style="{ maxWidth: timerSizeConfig.maxWidth }"
      >
        <div class="d-flex align-center min-width-0 flex-grow-1 mr-3">
          <!-- Circular Progress Circle -->
          <v-progress-circular
            :model-value="(activeTimer.remainingSeconds / activeTimer.totalSeconds) * 100"
            :color="activeTimer.isMinReached ? (timerThemeGlobal === 'solid-contrast' ? 'green-darken-2' : 'green-accent-3') : (timerThemeGlobal === 'solid-contrast' ? 'white' : 'orange-darken-3')"
            :size="timerSizeConfig.circleSize"
            :width="timerSizeConfig.circleWidth"
            class="mr-3 flex-shrink-0"
            style="transition: all 0.3s ease;"
          >
            <span 
              class="font-weight-black" 
              :style="{ 
                fontSize: timerSizeConfig.fontSizeProgress,
                color: timerThemeGlobal === 'solid-contrast' ? '#0f172a' : '#f8fafc'
              }"
            >
              {{ formattaTempo(activeTimer.remainingSeconds, true) }}
            </span>
          </v-progress-circular>

          <div class="text-left min-width-0 flex-grow-1">
            <div 
              class="text-super-caption uppercase font-weight-black" 
              :style="{ 
                fontSize: timerSizeConfig.fontSizeSub, 
                color: activeTimer.isMinReached ? (timerThemeGlobal === 'solid-contrast' ? '#1b5e20' : '#4ade80') : (timerThemeGlobal === 'solid-contrast' ? '#431407' : '#fdba74')
              }"
            >
              {{ activeTimer.isMinReached ? 'Recupero Ottimale' : 'Recupero Attivo' }}
              <span v-if="timerThemeGlobal === 'accent-dark' && layoutEserciziGlobal !== 'super_compatto'"> • Totale: {{ formattaTempo(activeTimer.totalSeconds) }}</span>
            </div>
            <div 
              class="text-truncate font-weight-bold" 
              :style="{ 
                fontSize: timerSizeConfig.fontSizeLabel, 
                color: timerThemeGlobal === 'solid-contrast' ? '#0f172a' : '#f1f5f9',
                maxWidth: layoutEserciziGlobal === 'super_compatto' ? '180px' : '260px'
              }"
            >
              {{ activeTimer.label }}
            </div>
            <!-- Tempo originario sotto per temi ad alto impatto -->
            <div 
              v-if="timerThemeGlobal !== 'accent-dark'" 
              class="text-super-caption font-weight-bold"
              :style="{ 
                color: activeTimer.isMinReached ? (timerThemeGlobal === 'solid-contrast' ? '#1b5e20' : '#86efac') : (timerThemeGlobal === 'solid-contrast' ? '#451a03' : '#cbd5e1'),
                fontSize: timerSizeConfig.fontSizeSub,
                marginTop: '1px'
              }"
            >
              Tempo: <span class="font-weight-black">{{ formattaTempo(activeTimer.remainingSeconds) }}</span> di {{ formattaTempo(activeTimer.totalSeconds) }}
            </div>
          </div>
        </div>

        <div class="d-flex align-center flex-shrink-0">
          <!-- Play / Pause Button -->
          <v-btn
            icon
            variant="flat"
            :bg-color="timerThemeGlobal === 'solid-contrast' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)'"
            :color="timerThemeGlobal === 'solid-contrast' ? '#0f172a' : 'orange-lighten-1'"
            size="small"
            class="mr-2"
            :style="{ width: timerSizeConfig.btnSize, height: timerSizeConfig.btnSize }"
            @click="activeTimer.isPaused ? riprendiTimer() : mettiInPausaTimer()"
          >
            <v-icon :size="timerSizeConfig.iconSize">
              {{ activeTimer.isPaused ? 'mdi-play' : 'mdi-pause' }}
            </v-icon>
          </v-btn>

          <!-- Stop / Close Button -->
          <v-btn
            icon
            variant="flat"
            :bg-color="timerThemeGlobal === 'solid-contrast' ? 'rgba(0,0,0,0.1)' : 'rgba(255,255,255,0.06)'"
            :color="timerThemeGlobal === 'solid-contrast' ? '#7f1d1d' : 'red-lighten-2'"
            size="small"
            :style="{ width: timerSizeConfig.btnSize, height: timerSizeConfig.btnSize }"
            @click="cancellaTimer()"
          >
            <v-icon :size="timerSizeConfig.iconSize - 2">mdi-stop</v-icon>
          </v-btn>
        </div>
      </v-card>
    </transition>

    <!-- Pulsante Fluttuante Persistente Play (Fisso sopra la barra di navigazione) -->
    <v-fade-transition>
      <v-btn
        v-if="utente && (globalHaEserciziDaFare || globalSettimanaDaChiudere)"
        color="orange-darken-3"
        icon
        size="large"
        class="fixed-play-fab elevation-6 animate-pulse-slow"
        :style="{ bottom: activeTimer ? timerSizeConfig.bottomOffset : '80px' }"
        @click="cliccaPlayGlobale"
        id="fab-play-da-fare"
      >
        <v-icon size="32" color="white">mdi-play</v-icon>
      </v-btn>
    </v-fade-transition>

    <!-- Dialog Avviso Chiusura Settimana -->
    <v-dialog v-model="mostraDialogAvvisoChiusura" max-width="420" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border text-left" style="background: var(--card-bg-dark) !important; border-color: var(--card-border) !important; backdrop-filter: blur(20px) !important;">
        
        <!-- Caso A: Presenti esercizi da recuperare in questa seduta -->
        <template v-if="infoGiornoDaChiudere.eserciziRecupero && infoGiornoDaChiudere.eserciziRecupero.length > 0">
          <v-card-title class="font-weight-black text-orange-lighten-2 d-flex align-center px-0 text-wrap mb-1">
            <v-icon color="orange-darken-3" class="mr-2 animate-bounce flex-shrink-0" size="24">mdi-alert-circle-outline</v-icon>
            Esercizio da Recuperare! ⚠️
          </v-card-title>

          <v-card-text class="px-0 py-3 text-body-2" style="color: #cbd5e1 !important; line-height: 1.5;">
            In questa seduta (<strong class="text-orange-lighten-2">Giorno {{ infoGiornoDaChiudere.giorno }} • Week {{ infoGiornoDaChiudere.week }}</strong>) c'è un esercizio contrassegnato con <strong class="text-red-lighten-2">RECUPERA</strong>:
            
            <div class="my-3 pa-3 rounded-xl border" style="background: rgba(15, 23, 42, 0.7); border-color: rgba(249, 115, 22, 0.35) !important;">
              <div 
                v-for="ex in infoGiornoDaChiudere.eserciziRecupero" 
                :key="ex.id" 
                class="d-flex align-center gap-2 text-caption font-weight-black text-orange-lighten-2 py-0.5"
              >
                <v-icon size="16" color="orange-darken-3">mdi-dumbbell</v-icon>
                <span class="text-truncate">{{ ex.des_esercizio || ex.des_settore || 'Esercizio incompleto' }}</span>
              </div>
            </div>

            Vuoi recuperare prima questo esercizio oppure chiudere comunque la sessione?
          </v-card-text>

          <v-card-actions class="d-flex flex-column gap-2 px-0 pb-0">
            <v-btn 
              color="orange-darken-3" 
              block 
              variant="flat" 
              rounded="lg" 
              @click="vaiAlRecuperoDaDialog" 
              class="text-white font-weight-black text-none w-100 mx-0 shadow-md"
              height="44"
            >
              <v-icon class="mr-1.5">mdi-sync</v-icon> 
              Recupera {{ infoGiornoDaChiudere.eserciziRecupero.length === 1 ? infoGiornoDaChiudere.eserciziRecupero[0].des_esercizio : 'Esercizio Ora' }} ⚠️
            </v-btn>

            <v-btn 
              color="green-darken-2" 
              block 
              variant="tonal" 
              rounded="lg" 
              @click="chiudiRapido" 
              class="text-white font-weight-black text-none w-100 mx-0"
              height="44"
              :loading="caricamentoChiusuraRapida"
            >
              <v-icon class="mr-1">mdi-flash</v-icon> Chiudi Comunque Sessione Ora ⚡
            </v-btn>

            <v-btn 
              color="slate-dark" 
              block 
              variant="text" 
              rounded="lg" 
              @click="vaiADettaglioEChiudi" 
              class="text-slate-light font-weight-bold text-none w-100 mx-0"
              height="38"
            >
              <v-icon class="mr-1">mdi-pencil-outline</v-icon> Aggiungi Note e Chiudi ⏱️
            </v-btn>
          </v-card-actions>
        </template>

        <!-- Caso B: Standard - Nessun esercizio da recuperare -->
        <template v-else>
          <v-card-title class="font-weight-black text-orange-darken-3 d-flex align-center px-0">
            <v-icon color="orange-darken-3" class="mr-2 animate-bounce">mdi-trophy-outline</v-icon>
            Allenamento Completato! ⚡
          </v-card-title>
          <v-card-text class="px-0 py-4 text-body-2" style="color: #cbd5e1 !important; line-height: 1.5;">
            Ottimo lavoro! Hai completato tutti gli esercizi per l'allenamento di oggi (<strong class="text-orange-lighten-2">Giorno {{ infoGiornoDaChiudere.giorno }} • Week {{ infoGiornoDaChiudere.week }}</strong>).
            <br><br>
            Scegli come vuoi procedere per registrare i tuoi progressi:
          </v-card-text>
          <v-card-actions class="d-flex flex-column gap-2 px-0 pb-0">
            <v-btn 
              color="green-darken-2" 
              block 
              variant="flat" 
              rounded="lg" 
              @click="chiudiRapido" 
              class="text-white font-weight-black text-none w-100 mx-0"
              height="44"
              :loading="caricamentoChiusuraRapida"
            >
              <v-icon class="mr-1">mdi-flash</v-icon> Chiudi Sessione Ora ⚡
            </v-btn>
            <v-btn 
              color="orange-darken-3" 
              block 
              variant="tonal" 
              rounded="lg" 
              @click="vaiADettaglioEChiudi" 
              class="text-white font-weight-bold text-none w-100 mx-0"
              height="44"
            >
              <v-icon class="mr-1">mdi-pencil-outline</v-icon> Aggiungi Note e Durata ⏱️
            </v-btn>
          </v-card-actions>
        </template>

      </v-card>
    </v-dialog>

    <!-- Dialog Congratulazioni Premium -->
    <v-dialog v-model="mostraCongratulazioni" max-width="350" rounded="xl" persistent>
      <v-card class="pa-6 rounded-2xl card-glass border text-center" style="background: linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(249, 115, 22, 0.05)) !important; border-color: rgba(249, 115, 22, 0.3) !important; backdrop-filter: blur(25px) !important;">
        <div class="emoji-celebration mb-4" style="font-size: 3.5rem;">🎉</div>
        <h3 class="text-h6 font-weight-black text-white mb-2">Grandioso!</h3>
        <p class="text-body-2 text-slate-light" style="color: #e2e8f0 !important; line-height: 1.4;">
          La sessione del <span class="font-weight-black text-orange-lighten-2">Giorno {{ infoGiornoDaChiudere.giorno }} (Week {{ infoGiornoDaChiudere.week }})</span> è stata salvata e chiusa con successo!
        </p>
        <div class="mt-4 font-weight-bold text-caption text-orange-lighten-2 animate-pulse">
          Sincronizzazione in corso...
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog Calcolatore Dischi (Plate Calculator) -->
    <v-dialog v-model="mostraDialogCalcolatoreDischi" max-width="450" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border text-left" style="background: var(--card-bg-dark) !important; border-color: var(--card-border) !important; backdrop-filter: blur(25px) !important;">
        <v-card-title class="font-weight-black text-orange-darken-3 d-flex align-center justify-space-between px-0 mb-1">
          <div class="d-flex align-center">
            <v-icon color="orange-darken-3" class="mr-2.5" size="26">mdi-weight-lifter</v-icon>
            Calcolatore Dischi 🏋️
          </div>
          <v-btn icon size="small" variant="text" class="text-slate-dark" @click="mostraDialogCalcolatoreDischi = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Nome dell'esercizio corrente nel calcolatore -->
        <div v-if="nomeEsercizioCalcolatore" class="text-caption font-weight-bold text-orange-lighten-3 mb-3 text-left px-0" style="line-height: 1.2;">
          {{ nomeEsercizioCalcolatore }}
        </div>

        <v-card-text class="px-0 py-2">
          <!-- Input/Visualizzazione Pesi -->
          <div class="d-flex align-center gap-3 mb-4">
            <div class="flex-grow-1 text-center pa-2.5 rounded-xl card-glass border-soft bg-slate-900-op" style="background: var(--card-bg-soft) !important;">
              <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" style="font-size: 0.58rem;">Peso Totale Target</span>
              <span class="text-h6 font-weight-black text-slate-dark">
                {{ targetPesoTotale }} <span class="text-caption text-muted">KG</span>
              </span>
            </div>
            <div v-if="!nascondiLato" class="flex-grow-1 text-center pa-2.5 rounded-xl card-glass border-soft bg-slate-900-op" style="background: var(--card-bg-soft) !important;">
              <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" style="font-size: 0.58rem;">Peso Per Lato</span>
              <span class="text-h6 font-weight-black text-blue-lighten-2">
                {{ targetPesoLato }} <span class="text-caption text-muted">KG</span>
              </span>
            </div>
          </div>

          <!-- Selettore del Bilanciere -->
          <div class="mb-4">
            <span class="text-caption font-weight-black text-slate-dark d-block mb-2" style="font-size: 0.75rem;">Tipo Bilanciere / Attrezzo:</span>
            <v-select
              v-model="selectedBilanciereId"
              :items="opzioniBilanciere"
              item-title="label"
              item-value="id"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="primary"
              bg-color="var(--card-bg-soft)"
              hide-details
            ></v-select>
          </div>

          <!-- Configurazione Caricamento (Due lati o Lato singolo) -->
          <div class="mb-4">
            <span class="text-caption font-weight-black text-slate-dark d-block mb-2" style="font-size: 0.75rem;">Configurazione Caricamento:</span>
            <v-btn-toggle
              v-model="caricoMonolaterale"
              mandatory
              color="primary"
              variant="outlined"
              class="w-100 premium-toggle-group rounded-lg"
              selected-class="bg-primary text-white"
              style="height: 38px; display: flex;"
            >
              <v-btn value="doppio" class="flex-grow-1 text-caption font-weight-bold py-1" style="height: 38px;">
                <v-icon size="16" class="mr-1">mdi-arrow-split-vertical</v-icon>
                Due Lati (x2)
              </v-btn>
              <v-btn value="singolo" class="flex-grow-1 text-caption font-weight-bold py-1" style="height: 38px;">
                <v-icon size="16" class="mr-1">mdi-arrow-right</v-icon>
                Singolo / Cintura
              </v-btn>
            </v-btn-toggle>
          </div>

          <!-- Risultato Dischi -->
          <div class="pa-4 rounded-xl border border-orange-darken-3-op bg-slate-900-op text-center" style="background: var(--card-bg-soft) !important;">
            <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase d-block mb-3" style="font-size: 0.65rem; letter-spacing: 0.05em;">
              {{ caricoMonolaterale === 'singolo' ? 'Dischi da inserire (Carico Singolo / Cintura):' : 'Dischi da inserire su CIASCUN LATO:' }}
            </span>

            <div v-if="pesoDischiDaCalcolare < 0" class="text-caption font-weight-black text-red-lighten-2 py-3">
              ⚠️ Il peso totale è inferiore al peso del bilanciere!
            </div>
            <div v-else-if="elencoDischiPerLato.length === 0" class="text-caption font-weight-black text-slate py-4" style="color: #94a3b8 !important;">
              Nessun disco necessario (carico a corpo libero o solo bilanciere).
            </div>
            <div v-else class="d-flex flex-column gap-2.5">
              <!-- Visualizzazione Grafica delle Piastre stacked -->
              <div class="d-flex align-center justify-center gap-1.5 py-3 border-bottom-soft mb-2 overflow-x-auto min-height-50" style="min-height: 85px;">
                <!-- Sleeve line -->
                <div class="barbell-sleeve-line"></div>
                <div
                  v-for="disco in elencoDischiGrafica"
                  :key="disco.id"
                  class="plate-graphic-item font-weight-black d-flex align-center justify-center"
                  :class="'plate-' + String(disco.size).replace('.', '_')"
                  :title="disco.size + ' kg'"
                >
                  {{ disco.size }}
                </div>
              </div>

              <!-- Elenco Testuale dei dischi -->
              <div
                v-for="item in elencoDischiPerLato"
                :key="item.size"
                class="d-flex align-center justify-space-between py-1.5 px-3 rounded-lg"
                style="background: var(--card-bg-soft) !important;"
              >
                <div class="d-flex align-center">
                  <div class="plate-color-indicator mr-2.5" :class="'plate-bg-' + String(item.size).replace('.', '_')"></div>
                  <span class="font-weight-black text-slate-dark" style="font-size: 0.95rem;">
                    Disco da {{ item.size }} kg
                  </span>
                </div>
                <span class="text-h6 font-weight-black text-orange-lighten-1">
                  x {{ item.count }}
                </span>
              </div>
            </div>

            <!-- Rimanenza se presente -->
            <div v-if="rimanenzaDischi > 0" class="text-super-caption text-amber-lighten-2 mt-3 text-left" style="font-size: 0.65rem; line-height: 1.3; color: #fbbf24 !important;">
              ⚠️ Nota: Rimangono <strong>{{ rimanenzaDischi }} kg</strong> non configurabili con i tagli disponibili (minimo 1.25 kg per lato).
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-0 pt-4 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraDialogCalcolatoreDischi = false" class="text-white font-weight-bold">
            Chiudi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

        <!-- MODALE GUIDA INTERATTIVA & FEATURE SHOWCASE IN APP.VUE -->
    <v-dialog v-model="mostraDialogGuida" max-width="600" scrollable transition="dialog-bottom-transition">
      <v-card class="card-glass-dark rounded-2xl border overflow-hidden" :style="{ backdropFilter: 'blur(25px)', background: 'var(--card-bg-dark, #0f172a) !important' }">
        <!-- Header della Modale con Titolo Compatto e Pulsante Tour -->
        <v-card-title class="pa-3.5 py-3 border-bottom d-flex align-center justify-space-between" :style="{ background: 'var(--card-bg-dark, #0f172a)' }">
          <div class="d-flex align-center text-truncate" style="max-width: 70%;">
            <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" size="22" class="mr-2 flex-shrink-0">mdi-book-open-page-variant</v-icon>
            <span class="font-weight-black dialog-text-primary text-truncate" style="font-size: 0.95rem; letter-spacing: 0.01em;">
              Guida FlexCoach
            </span>
          </div>
          <div class="d-flex align-center gap-1.5">
            <v-btn
              variant="flat"
              size="x-small"
              class="font-weight-black text-white px-2 py-0.5 rounded-lg text-none d-flex align-center"
              style="font-size: 0.62rem; height: 26px;"
              :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316)) !important' }"
              @click="avviaTourGuidatoApp"
            >
              <v-icon size="14" class="mr-1">mdi-rocket-launch</v-icon>
              Tour
            </v-btn>
            <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="mostraDialogGuida = false"></v-btn>
          </div>
        </v-card-title>

        <!-- Searchbar interna & Navigazione Tab a Pillole Alta Visibilità -->
        <div class="px-3 pt-3 pb-2 border-bottom" :style="{ background: 'var(--card-bg-soft, #020617)' }">
          <v-text-field
            v-model="searchGuidaApp"
            placeholder="🔍 Cerca (es. e1RM, r, infortuni, timer, fatica...)"
            density="compact"
            variant="outlined"
            hide-details
            clearable
            class="mb-2.5"
            style="font-size: 0.75rem;"
          ></v-text-field>

          <!-- Segmented Tab Pills Container High-Contrast Dynamic Theme -->
          <div class="d-flex align-center justify-space-between gap-1 pa-1 rounded-xl border" :style="{ background: 'var(--card-bg-glass, #0f172a)', borderColor: 'var(--card-border, rgba(255, 255, 255, 0.12))' }">
            <v-btn
              v-for="(tab, i) in ['Strategia', 'Progressione', 'Esercizi & Timer', 'Infortuni', 'Temi']"
              :key="i"
              size="x-small"
              class="flex-grow-1 font-weight-bold text-none rounded-lg text-truncate px-1 transition-all"
              :style="tabGuidaApp === i 
                ? 'font-size: 0.65rem; height: 30px; min-width: 0; color: #ffffff !important; background: var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316)) !important; font-weight: 900; border: 1px solid var(--theme-primary-border, rgba(249, 115, 22, 0.4)) !important; box-shadow: 0 2px 8px var(--theme-primary-glow, rgba(249, 115, 22, 0.25));' 
                : 'font-size: 0.65rem; height: 30px; min-width: 0; color: var(--text-dark, #1e293b) !important; background: var(--card-bg-soft, rgba(148, 163, 184, 0.12)) !important; border: 1px solid var(--card-border, rgba(148, 163, 184, 0.2)) !important;'"
              @click="tabGuidaApp = i"
            >
              {{ tab }}
            </v-btn>
          </div>
        </div>

        <v-card-text class="pa-3.5 scrollbar-custom text-left" style="max-height: 65vh;">
          <v-window v-model="tabGuidaApp">
            <!-- TAB 0: STRATEGIA COACH & 6 SETTIMANE -->
            <v-window-item :value="0">
              <div class="mb-4">
                <h4 class="font-weight-black text-subtitle-2 mb-1.5 d-flex align-center" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.84rem;">
                  <v-icon size="18" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-brain</v-icon>
                  <span>Strategia Coach & Massimale Stimato</span>
                </h4>
                <p class="text-caption mb-3" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.75rem; line-height: 1.45;">
                  Il motore <strong>FlexCoach</strong> confronta il massimale stimato corrente (<strong>e1RM</strong>) con il record storico dell'esercizio per calcolare i carichi ideali.
                </p>

                <!-- Calcolatore Interattivo e1RM per la Guida -->
                <div class="pa-3 rounded-xl border border-soft mb-3.5" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <span class="text-super-caption font-weight-black uppercase" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.62rem;">Simulatore e1RM</span>
                    <v-chip size="x-small" variant="flat" class="font-weight-black text-white" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316))' }" style="font-size: 0.54rem; height: 16px;">INTERATTIVO</v-chip>
                  </div>
                  <div class="d-flex align-center gap-2 mb-2">
                    <v-text-field
                      v-model.number="simPesoApp"
                      label="Peso (kg)"
                      type="number"
                      density="compact"
                      variant="outlined"
                      hide-details
                      class="flex-grow-1"
                    ></v-text-field>
                    <v-text-field
                      v-model.number="simRepsApp"
                      label="Reps"
                      type="number"
                      density="compact"
                      variant="outlined"
                      hide-details
                      class="flex-grow-1"
                    ></v-text-field>
                  </div>
                  <div class="pa-2 rounded-lg text-center border-soft" :style="{ background: 'var(--card-bg-glass, #020617)' }">
                    <span class="text-super-caption font-weight-bold d-block mb-0.5" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.6rem;">Massimale Stimato (e1RM):</span>
                    <span class="text-subtitle-1 font-weight-black" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 1.05rem;">
                      {{ calcolaSimE1RMApp }} kg
                    </span>
                  </div>
                </div>

                <h4 class="font-weight-black text-subtitle-2 mb-2 d-flex align-center" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.84rem;">
                  <v-icon size="18" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-calendar-clock</v-icon>
                  <span>Roadmap 6 Settimane (W1 - W6)</span>
                </h4>
                <div class="d-flex flex-column gap-2 mb-3.5">
                  <div class="pa-2.5 rounded-xl border border-soft d-flex align-center justify-space-between" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.74rem;">W1 - Accumulo & Tecnica</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.63rem;">Volume sicuro e controllo esecutivo</span>
                    </div>
                    <v-chip color="cyan-darken-2" size="x-small" variant="flat" class="font-weight-black text-white px-2" style="font-size: 0.6rem;">RPE 7-8</v-chip>
                  </div>
                  <div class="pa-2.5 rounded-xl border border-soft d-flex align-center justify-space-between" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.74rem;">W2 - Progressione Carico</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.63rem;">Incremento sostenibile del peso</span>
                    </div>
                    <v-chip color="amber-darken-2" size="x-small" variant="flat" class="font-weight-black text-white px-2" style="font-size: 0.6rem;">RPE 8</v-chip>
                  </div>
                  <div class="pa-2.5 rounded-xl border border-soft d-flex align-center justify-space-between" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.74rem;">W3 - Pareggio PR Storico</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.63rem;">Avvicinamento o pareggio del record</span>
                    </div>
                    <v-chip color="orange-darken-2" size="x-small" variant="flat" class="font-weight-black text-white px-2" style="font-size: 0.6rem;">RPE 8.5-9</v-chip>
                  </div>
                  <div class="pa-2.5 rounded-xl border border-soft d-flex align-center justify-space-between" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.74rem;">W4 - Scarico Rigenerativo</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.63rem;">Riduzione carico per recupero attivo</span>
                    </div>
                    <v-chip color="blue-darken-2" size="x-small" variant="flat" class="font-weight-black text-white px-2" style="font-size: 0.6rem;">RPE 6-7</v-chip>
                  </div>
                  <div class="pa-2.5 rounded-xl border-2 d-flex align-center justify-space-between" :style="{ borderColor: 'var(--theme-primary-border, rgba(249, 115, 22, 0.4)) !important', background: 'var(--theme-primary-bg-soft, rgba(249, 115, 22, 0.12)) !important' }">
                    <div>
                      <div class="d-flex align-center gap-1.5 mb-0.5">
                        <span class="font-weight-black text-caption dialog-text-primary" style="font-size: 0.74rem;">W5 - Picco Intensità</span>
                        <v-chip :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316)) !important' }" size="x-small" variant="flat" class="font-weight-black text-white animate-pulse px-1.5" style="font-size: 0.52rem; height: 15px;">ATTIVA</v-chip>
                      </div>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.63rem;">Superamento del record</span>
                    </div>
                    <v-chip color="purple-darken-2" size="x-small" variant="flat" class="font-weight-black text-white px-2" style="font-size: 0.6rem;">RPE 9-9.5</v-chip>
                  </div>
                  <div class="pa-2.5 rounded-xl border border-soft d-flex align-center justify-space-between" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.74rem;">W6 - Test Nuovo Record</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.63rem;">Test finale AMRAP per il nuovo PR</span>
                    </div>
                    <v-chip color="green-darken-2" size="x-small" variant="flat" class="font-weight-black text-white px-2" style="font-size: 0.6rem;">RPE 10</v-chip>
                  </div>
                </div>

                <div class="pa-3 rounded-xl border border-soft mb-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="16" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-gauge</v-icon>
                    <h5 class="font-weight-black text-caption mb-0" :style="{ color: 'var(--theme-primary, #f97316)' }" style="font-size: 0.76rem;">Indicatori di Fatica a Settimana 6</h5>
                  </div>
                  <p class="text-caption mb-0" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.72rem; line-height: 1.4;">
                    A fine Settimana 6 seleziona la fatica provata (<strong>Leggero</strong>, <strong>Medio</strong>, <strong>Pesante</strong>, <strong>Devastante</strong>) per calibrare i pesi di partenza del programma successivo.
                  </p>
                </div>
              </div>
            </v-window-item>

            <!-- TAB 1: PROPOSTA CARICO, REPS 'r', PROGRESSIONE & ECCEZIONI -->
            <v-window-item :value="1">
              <div class="mb-4">
                <h4 class="font-weight-black text-subtitle-2 mb-1.5 d-flex align-center" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.84rem;">
                  <v-icon size="18" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-scale-balance</v-icon>
                  <span>Proposta Carico & Sintassi Inserimento</span>
                </h4>
                <p class="text-caption mb-3" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.75rem; line-height: 1.45;">
                  Il motore <strong>FlexCoach</strong> calcola il peso consigliato in base ai tempi di recupero, alla fatica registrata e allo storico.
                </p>

                <!-- 1. SINTASSI REPS CON R -->
                <div class="pa-3 rounded-xl border border-soft mb-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="16" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-pencil-outline</v-icon>
                    <h5 class="font-weight-black text-caption mb-0" :style="{ color: 'var(--theme-primary, #f97316)' }" style="font-size: 0.76rem;">Inserimento Reps con "r" (es. 50 12r)</h5>
                  </div>
                  <p class="text-caption mb-0" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.72rem; line-height: 1.4;">
                    Se mantieni lo stesso peso aumentando le ripetizioni, inserisci il numero seguito da <strong>"r"</strong> (es. <code>50 12r</code> o <code>25 x11r</code>). Il sistema registra l'aumento di volume e adegua la progressione per la settimana successiva.
                  </p>
                </div>

                <!-- 2. SEZIONE SPECIALE: CAMBIO PALESTRA & CARRUCOLE DIVERSE -->
                <div class="pa-3 rounded-xl border-2 mb-3 text-left" :style="{ borderColor: 'var(--theme-primary-border, rgba(249, 115, 22, 0.4)) !important', background: 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(15, 23, 42, 0.95) 100%) !important' }">
                  <div class="d-flex align-center mb-2">
                    <v-icon color="orange-darken-2" size="20" class="mr-2 flex-shrink-0">mdi-weight-lifter</v-icon>
                    <h5 class="font-weight-black text-caption mb-0 text-orange-lighten-2" style="font-size: 0.82rem; letter-spacing: 0.02em;">
                      CAMBIO PALESTRA & CARRUCOLE DIVERSE
                    </h5>
                  </div>
                  
                  <!-- Box Regola d'Oro -->
                  <div class="pa-2.5 rounded-lg mb-2.5 border" style="background: rgba(0, 0, 0, 0.4); border-color: rgba(249, 115, 22, 0.35) !important;">
                    <div class="d-flex align-center mb-1">
                      <v-icon size="16" color="amber-darken-2" class="mr-2 flex-shrink-0">mdi-crown</v-icon>
                      <strong class="text-amber-lighten-2 font-weight-black" style="font-size: 0.76rem;">LA REGOLA D'ORO DELLE PARENTESI TONDE ( ... )</strong>
                    </div>
                    <p class="text-caption mb-0 text-slate-light" style="font-size: 0.71rem; line-height: 1.45;">
                      Tutto ciò che racchiudi tra <strong>parentesi tonde <code>( ... )</code></strong> (inclusi carichi in kg, serie, reps o annotazioni) viene <strong>totalmente escluso</strong> dai calcoli della progressione automatica, dei PR e dei grafici. I numeri tra parentesi non genereranno mai falsi record!
                    </p>
                  </div>

                  <div class="d-flex flex-column gap-2 text-caption" style="font-size: 0.72rem; line-height: 1.42;">
                    <!-- Esempio Corretto -->
                    <div class="pa-2.5 rounded-lg" style="background: rgba(15, 23, 42, 0.85); border-left: 3px solid #22c55e;">
                      <div class="d-flex align-center mb-1">
                        <v-icon size="16" color="green-accent-3" class="mr-2 flex-shrink-0">mdi-check-circle-outline</v-icon>
                        <strong class="text-green-accent-3 font-weight-black">Come registrare la sessione in trasferta:</strong>
                      </div>
                      <div class="text-slate-light">
                        1. Scrivi come prima riga il carico teorico/consigliato della <strong>tua palestra abituale</strong>.<br>
                        2. A capo, inserisci tra parentesi tonde il dato reale della palestra ospite per tua memoria:
                        <div class="pa-2 rounded mt-1.5 font-weight-bold" style="background: rgba(0,0,0,0.6); font-family: monospace; font-size: 0.72rem; color: #4ade80;">
                          25 x11r<br>
                          (45 x11r x2s Green Theory)
                        </div>
                        <span class="text-super-caption text-slate mt-1 d-block" style="font-size: 0.62rem;">
                          👉 L'app userà 25kg per le progressioni e conserverà la nota tra parentesi per tuo promemoria visivo.
                        </span>
                      </div>
                    </div>

                    <!-- Errore da evitare -->
                    <div class="pa-2.5 rounded-lg" style="background: rgba(15, 23, 42, 0.85); border-left: 3px solid #ef4444;">
                      <div class="d-flex align-center mb-0.5">
                        <v-icon size="16" color="red-lighten-2" class="mr-2 flex-shrink-0">mdi-alert-circle-outline</v-icon>
                        <strong class="text-red-lighten-2 font-weight-black">Errore comune da evitare (falso PR):</strong>
                      </div>
                      <div class="text-slate-light">
                        Scrivere <code>45 (Green Theory)</code> farà leggere <code>45</code> come nuovo record! Il numero in kg deve stare <strong>interamente DENTRO</strong> le parentesi: <code>(45kg Green Theory)</code>.
                      </div>
                    </div>

                    <!-- Rapporto Carrucole -->
                    <div class="pa-2.5 rounded-lg" style="background: rgba(15, 23, 42, 0.85); border-left: 3px solid #38bdf8;">
                      <div class="d-flex align-center mb-1">
                        <v-icon size="16" color="cyan-lighten-2" class="mr-2 flex-shrink-0">mdi-cog-sync-outline</v-icon>
                        <strong class="text-cyan-lighten-2 font-weight-black">Rapporto Carrucole / Pulegge (Pulley Ratio):</strong>
                      </div>
                      <div class="text-slate-light">
                        • <strong>Carrucola Diretta (1:1):</strong> 25 kg selezionati = 25 kg effettivi sollevati.<br>
                        • <strong>Doppia Carrucola / Dimezzata (2:1):</strong> Il carico percepito è dimezzato. Per avere 25 kg reali devi impostare <strong>50 kg (il doppio del peso)</strong> sul pacco pesi!<br>
                        💡 <em>Se ti alleni su un cavo dimezzato, dividi a mente per 2 il peso del selettore per segnare il carico standard della tua palestra.</em>
                      </div>
                    </div>

                    <!-- Metodo RPE -->
                    <div class="pa-2.5 rounded-lg" style="background: rgba(15, 23, 42, 0.85); border-left: 3px solid #f59e0b;">
                      <div class="d-flex align-center mb-0.5">
                        <v-icon size="16" color="amber-lighten-2" class="mr-2 flex-shrink-0">mdi-bullseye-arrow</v-icon>
                        <strong class="text-amber-lighten-2 font-weight-black">Lavoro a RPE (Sforzo Percepito):</strong>
                      </div>
                      <div class="text-slate-light">
                        Su macchine o leve ignote, allènati cercando lo stesso sforzo (<strong>RPE 8-9</strong>) alle ripetizioni target. Conferma il carico consigliato dalla scheda e annota le sensazioni tra parentesi.
                      </div>
                    </div>
                  </div>
                </div>

                <!-- 3. PULSANTE RECUPERO SERIE -->
                <div class="pa-3 rounded-xl border border-soft mb-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="16" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-bookmark-outline</v-icon>
                    <h5 class="font-weight-black text-caption mb-0" :style="{ color: 'var(--theme-primary, #f97316)' }" style="font-size: 0.76rem;">Pulsante R? / Recupero Serie</h5>
                  </div>
                  <p class="text-caption mb-0 text-slate-light" style="font-size: 0.72rem; line-height: 1.4;">
                    L'etichetta <strong>R? 🔖</strong> situata all'interno del box del carico è un <strong>unico pulsante di contrassegno</strong>. Toccandolo imposti lo stato <code>DA COMPLETARE</code> per ricordarti di recuperare serie mancanti a fine allenamento.
                  </p>
                </div>

                <!-- 4. STORICO -->
                <div class="pa-3 rounded-xl border border-soft mb-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="16" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-history</v-icon>
                    <h5 class="font-weight-black text-caption mb-0" :style="{ color: 'var(--theme-primary, #f97316)' }" style="font-size: 0.76rem;">Cronologia Sessioni & Storico</h5>
                  </div>
                  <p class="text-caption mb-0" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.72rem; line-height: 1.4;">
                    L'icona dell'orologio apre la panoramica delle sessioni svolte nei mesocicli precedenti con carichi, ripetizioni, note e livello di fatica.
                  </p>
                </div>

                <!-- 5. MOTORE PROGRESSIONE -->
                <h4 class="font-weight-black text-subtitle-2 mb-2 mt-4 d-flex align-center" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.84rem;">
                  <v-icon size="18" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-trending-up</v-icon>
                  <span>Motore di Progressione & Profilazione Atleta</span>
                </h4>

                <div class="pa-3 rounded-xl border border-soft mb-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <h5 class="font-weight-black text-caption mb-1.5" :style="{ color: 'var(--theme-primary, #f97316)' }" style="font-size: 0.78rem;">
                    Motore di Progressione
                  </h5>
                  <div class="d-flex flex-column gap-2 text-caption" style="font-size: 0.72rem; line-height: 1.4;">
                    <div class="pa-2 rounded-lg" style="background: rgba(59, 130, 246, 0.08); border-left: 3px solid #3b82f6;">
                      <strong class="text-blue-lighten-2">Ibrida SMART (Consigliata):</strong>
                      <div class="text-muted mt-0.5">Sintesi intelligente tra la scheda e il potenziale stimato reale. Ideale per atleti intermedi e avanzati.</div>
                    </div>
                    <div class="pa-2 rounded-lg" style="background: rgba(148, 163, 184, 0.08); border-left: 3px solid #94a3b8;">
                      <strong class="text-slate-light">Fissa Scheda:</strong>
                      <div class="text-muted mt-0.5">Progressione lineare a step nominali. Ideale per principianti o atleti metodici che seguono target rigidi.</div>
                    </div>
                    <div class="pa-2 rounded-lg" style="background: rgba(249, 115, 22, 0.08); border-left: 3px solid #f97316;">
                      <strong class="text-orange-lighten-2">Dinamica:</strong>
                      <div class="text-muted mt-0.5">Reattività immediata alle ultime prestazioni e agli esuberi di reps. Ideale per atleti esperti.</div>
                    </div>
                  </div>
                </div>

                <div class="pa-3 rounded-xl border border-soft mb-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <h5 class="font-weight-black text-caption mb-1.5" :style="{ color: 'var(--theme-primary, #f97316)' }" style="font-size: 0.78rem;">
                    Sensibilità Fatica
                  </h5>
                  <div class="d-flex flex-column gap-2 text-caption" style="font-size: 0.72rem; line-height: 1.4;">
                    <div class="pa-2 rounded-lg" style="background: rgba(56, 189, 248, 0.08); border-left: 3px solid #38bdf8;">
                      <strong class="text-cyan-lighten-2">Prudente:</strong>
                      <div class="text-muted mt-0.5">Privilegia l'accumulo di ripetizioni e il consolidamento prima di salire di kg. Ideale in cut, atleti master o recupero articolare.</div>
                    </div>
                    <div class="pa-2 rounded-lg" style="background: rgba(34, 197, 94, 0.08); border-left: 3px solid #22c55e;">
                      <strong class="text-green-accent-3">Bilanciata (Default):</strong>
                      <div class="text-muted mt-0.5">Progressione costante e bilanciata, con frenata solo su fatica elevata documentata. Per la maggioranza degli atleti.</div>
                    </div>
                    <div class="pa-2 rounded-lg" style="background: rgba(239, 68, 68, 0.08); border-left: 3px solid #ef4444;">
                      <strong class="text-red-lighten-2">Spinta:</strong>
                      <div class="text-muted mt-0.5">Massimizza il sovraccarico progressivo puntando subito al carico superiore e al PR. Per atleti di forza o in surplus calorico.</div>
                    </div>
                  </div>
                </div>

                <div class="pa-3 rounded-xl border border-soft mb-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="16" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-magnify</v-icon>
                    <h5 class="font-weight-black text-caption mb-0" :style="{ color: 'var(--theme-primary, #f97316)' }" style="font-size: 0.76rem;">
                      Analisi Sforzo da Note (Opzionale)
                    </h5>
                  </div>
                  <p class="text-caption mb-0" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.72rem; line-height: 1.4;">
                    Disattivata di default. Se abilitata nelle Impostazioni, intercetta parole chiave come <em>"difficile"</em> o <em>"limite"</em> per suggerire il consolidamento a pari carico.
                  </p>
                </div>
              </div>
            </v-window-item>

            <!-- TAB 2: ESERCIZI, TIMER & PULSANTI DI CONTROLLO -->
            <v-window-item :value="2">
              <div class="mb-4">
                <h4 class="font-weight-black text-subtitle-2 mb-1.5 d-flex align-center" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.84rem;">
                  <v-icon size="18" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-timer-outline</v-icon>
                  <span>Timer di Recupero</span>
                </h4>
                <p class="text-caption mb-3" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.75rem; line-height: 1.45;">
                  Tocca il chip arancione del tempo di recupero (es. <code>1'30"-1'45"</code>) vicino all'esercizio per avviare il conto alla rovescia con suono e vibrazione.
                </p>

                <h4 class="font-weight-black text-subtitle-2 mb-2 d-flex align-center" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.84rem;">
                  <v-icon size="18" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-tune-vertical</v-icon>
                  <span>Controlli Rapidi Esercizio</span>
                </h4>
                <div class="d-flex flex-column gap-2.5 mb-3">
                  <div class="pa-3 rounded-xl border border-soft d-flex align-center gap-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" size="22">mdi-arrow-left</v-icon>
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.75rem;">Pulsante Precedente</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.68rem; line-height: 1.35;">
                        Torna rapidamente all'esercizio o al giorno svolto in precedenza.
                      </span>
                    </div>
                  </div>
                  <div class="pa-3 rounded-xl border border-soft d-flex align-center gap-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <v-icon color="amber-darken-2" size="22">mdi-star-outline</v-icon>
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.75rem;">Gradimento Esercizio</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.68rem; line-height: 1.35;">
                        Valuta l'esercizio con le stelle per comunicare al Coach le tue preferenze.
                      </span>
                    </div>
                  </div>
                  <div class="pa-3 rounded-xl border border-soft d-flex align-center gap-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" size="22">mdi-dumbbell</v-icon>
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.75rem;">Lista Test Week 6</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.68rem; line-height: 1.35;">
                        Panoramica rapida degli esercizi con test massimale o AMRAP a Week 6.
                      </span>
                    </div>
                  </div>
                  <div class="pa-3 rounded-xl border border-soft d-flex align-center gap-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" size="22">mdi-video-outline</v-icon>
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.75rem;">Video Richiesto</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.68rem; line-height: 1.35;">
                        Esercizi in cui il Coach richiede il video per verificare la corretta esecuzione.
                      </span>
                    </div>
                  </div>
                  <div class="pa-3 rounded-xl border border-soft d-flex align-center gap-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                    <v-icon color="orange-darken-3" size="22">mdi-bookmark-outline</v-icon>
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.75rem;">Recupero Serie (R?)</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.68rem; line-height: 1.35;">
                        Tocca per contrassegnare rapidamente serie non completate da recuperare.
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </v-window-item>

            <!-- TAB 3: GESTIONE INFORTUNI & SOSTITUZIONI -->
            <v-window-item :value="3">
              <div class="mb-4">
                <h4 class="font-weight-black text-subtitle-2 mb-1.5 d-flex align-center" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.84rem;">
                  <v-icon size="18" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-bandage</v-icon>
                  <span>Gestione Infortuni & Sostituzioni</span>
                </h4>
                <p class="text-caption mb-3" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.75rem; line-height: 1.45;">
                  Gestione attiva di fastidi o dolori articolari senza interrompere l'allenamento.
                </p>

                <div class="pa-3 rounded-xl border border-soft mb-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="18" color="red-lighten-2" class="mr-2 flex-shrink-0">mdi-stethoscope</v-icon>
                    <h5 class="font-weight-black text-caption mb-0 text-white" style="font-size: 0.76rem;">Segnalazione Fastidio / Dolore</h5>
                  </div>
                  <p class="text-caption mb-0" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.72rem; line-height: 1.4;">
                    Accedi alla sezione <strong>Infortuni</strong> dalla barra inferiore per monitorare la zona anatomica interessata e informare il Coach.
                  </p>
                </div>

                <div class="pa-3 rounded-xl border border-soft mb-3" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="18" color="cyan-lighten-2" class="mr-2 flex-shrink-0">mdi-swap-horizontal-bold</v-icon>
                    <h5 class="font-weight-black text-caption mb-0 text-white" style="font-size: 0.76rem;">Sostituzione Esercizio in Sicurezza</h5>
                  </div>
                  <p class="text-caption mb-0" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.72rem; line-height: 1.4;">
                    Alternative automatiche per mantenere lo stimolo muscolare preservando l'articolazione dolente.
                  </p>
                </div>

                <div class="pa-3 rounded-xl border border-soft" :style="{ background: 'var(--card-bg-soft, #0f172a)' }">
                  <div class="d-flex align-center mb-1">
                    <v-icon size="18" color="amber-lighten-2" class="mr-2 flex-shrink-0">mdi-email-fast-outline</v-icon>
                    <h5 class="font-weight-black text-caption mb-0 text-white" style="font-size: 0.76rem;">Notifica Diretta al Coach</h5>
                  </div>
                  <p class="text-caption mb-0" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.72rem; line-height: 1.4;">
                    Invia un avviso diretto al Coach per ricevere l'adeguamento immediato della scheda.
                  </p>
                </div>
              </div>
            </v-window-item>

            <!-- TAB 4: TEMI & PERSONALIZZAZIONE UX -->
            <v-window-item :value="4">
              <div class="mb-4">
                <h4 class="font-weight-black text-subtitle-2 mb-1.5 d-flex align-center" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.84rem;">
                  <v-icon size="18" color="orange-darken-2" class="mr-2 flex-shrink-0">mdi-palette-outline</v-icon>
                  <span>Stili & Temi Visivi</span>
                </h4>
                <p class="text-caption mb-3" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.75rem; line-height: 1.45;">
                  Scegli tra modalità Scuro e Chiaro per personalizzare l'esperienza d'uso.
                </p>

                <div class="d-flex flex-column gap-2.5 mb-3">
                  <div class="pa-3 rounded-xl border d-flex align-center justify-space-between cursor-pointer" :style="{ background: 'var(--card-bg-soft, #0f172a)' }" @click="cambiaTemaInterattivoApp('dark', 'slate')">
                    <div class="d-flex align-center">
                      <v-icon size="20" color="purple-lighten-2" class="mr-2.5 flex-shrink-0">mdi-weather-night</v-icon>
                      <div>
                        <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.75rem;">Tema Scuro OLED</span>
                        <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.64rem;">Interfaccia scura ad alto contrasto</span>
                      </div>
                    </div>
                    <v-chip size="x-small" variant="flat" class="font-weight-black text-white px-2" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316))' }">Seleziona</v-chip>
                  </div>
                  <div class="pa-3 rounded-xl border d-flex align-center justify-space-between cursor-pointer" :style="{ background: 'var(--card-bg-soft, #f5f3ef)' }" @click="cambiaTemaInterattivoApp('light', 'slate')">
                    <div class="d-flex align-center">
                      <v-icon size="20" color="amber-darken-2" class="mr-2.5 flex-shrink-0">mdi-white-balance-sunny</v-icon>
                      <div>
                        <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.75rem;">Tema Chiaro Arctic</span>
                        <span class="text-super-caption d-block" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.64rem;">Interfaccia luminosa ad alta leggibilità</span>
                      </div>
                    </div>
                    <v-chip size="x-small" variant="flat" class="font-weight-black text-white px-2" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316))' }">Seleziona</v-chip>
                  </div>
                </div>
              </div>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-card-actions class="pa-3 border-top gap-2" :style="{ background: 'var(--card-bg-dark, #0f172a)' }">
          <v-btn variant="flat" block rounded="lg" size="small" class="font-weight-bold text-white text-none" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316)) !important', fontSize: '0.8rem' }" @click="mostraDialogGuida = false">Chiudi Guida</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- OVERLAY SPOTLIGHT TOUR GUIDATO IN APP.VUE -->
    <v-overlay v-model="mostraSpotlightTourApp" class="align-center justify-center" persistent style="z-index: 9999;">
      <v-card class="pa-5 rounded-2xl text-left border card-glass-dark" max-width="360" style="background: rgba(15, 23, 42, 0.95) !important; backdrop-filter: blur(20px);">
        <div class="d-flex align-center justify-space-between mb-2">
          <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white px-2">
            PASSO {{ tourStepApp + 1 }} DI {{ tourStepsApp.length }}
          </v-chip>
          <v-btn icon="mdi-close" variant="text" size="x-small" color="grey" @click="chiudiTourApp"></v-btn>
        </div>
        <h3 class="text-subtitle-1 font-weight-black text-orange-lighten-2 mb-1">
          {{ tourStepsApp[tourStepApp]?.titolo }}
        </h3>
        <p class="text-caption text-slate mb-4">
          {{ tourStepsApp[tourStepApp]?.descrizione }}
        </p>
        <div class="d-flex align-center justify-space-between gap-2">
          <v-btn v-if="tourStepApp > 0" variant="outlined" color="grey" size="small" rounded="lg" class="font-weight-bold text-none" @click="tourStepApp--">Indietro</v-btn>
          <div class="flex-grow-1"></div>
          <v-btn color="orange-darken-3" variant="flat" size="small" rounded="lg" class="font-weight-bold text-white text-none" @click="avantiTourApp">
            {{ tourStepApp < tourStepsApp.length - 1 ? 'Avanti ›' : 'Ho Capito! 🚀' }}
          </v-btn>
        </div>
      </v-card>
    </v-overlay>

    <!-- HERO SHEET / BANNER DEPLOY & MESSAGGI REAL-TIME (Glassmorphism Premium UX) -->
    <!-- BANNER / DIALOG NOTIFICA NUOVO DEPLOY -->
    <v-dialog v-model="showDeployBanner" max-width="480" rounded="2xl" persistent>
      <v-card
        class="pa-5 rounded-2xl border text-left overflow-hidden position-relative animate-fade-in update-modal-card"
        :style="{
          background: deployVersionInfo?.tipo === 'messaggio' 
            ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 27, 75, 0.98) 100%) !important'
            : 'linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.98) 100%) !important',
          border: deployVersionInfo?.tipo === 'messaggio'
            ? '2px solid rgba(168, 85, 247, 0.5) !important'
            : '2px solid var(--theme-primary) !important',
          backdropFilter: 'blur(30px) !important',
          boxShadow: deployVersionInfo?.tipo === 'messaggio'
            ? '0 20px 50px rgba(168, 85, 247, 0.25) !important'
            : '0 20px 50px var(--theme-primary-glow) !important'
        }"
      >
        <!-- Header Pulito ed Elegante Senza Icona Colorata Circolare -->
        <div class="d-flex align-center gap-2 mb-3 pb-2.5 border-bottom-soft">
          <v-icon :color="deployVersionInfo?.tipo === 'messaggio' ? 'purple-lighten-2' : 'orange-lighten-2'" size="22" class="flex-shrink-0">
            {{ deployVersionInfo?.tipo === 'messaggio' ? 'mdi-message-text-outline' : 'mdi-rocket-launch-outline' }}
          </v-icon>
          <h2 class="text-subtitle-1 font-weight-black text-white mb-0" style="font-size: 0.95rem; line-height: 1.2; color: #ffffff !important;">
            {{ deployVersionInfo?.titolo ? deployVersionInfo.titolo.replace(/^🚀\s*/, '') : (deployVersionInfo?.tipo === 'messaggio' ? 'Messaggio dal Coach' : 'Nuovo Aggiornamento') }}
          </h2>
        </div>

        <!-- Contenuto del Messaggio (Pulito e Leggibile) -->
        <div class="pa-4 rounded-xl mb-4 text-left border" style="background: rgba(15, 23, 42, 0.6) !important; border-color: rgba(255, 255, 255, 0.1) !important;">
          <p class="text-body-1 text-white mb-0" style="font-size: 1.05rem; font-weight: 600; line-height: 1.5; color: #ffffff !important;">
            {{ deployCustomNoteForMe || deployVersionInfo?.message_general || (deployVersionInfo?.tipo === 'messaggio' ? 'Hai una nuova comunicazione dal tuo Coach.' : 'Nuova versione disponibile con miglioramenti e novità.') }}
          </p>
        </div>

        <!-- Azione Unica Principale -->
        <div>
          <v-btn
            v-if="deployVersionInfo?.tipo !== 'messaggio'"
            color="orange-darken-3"
            block
            size="large"
            variant="flat"
            rounded="xl"
            class="font-weight-black text-none text-white elevation-6"
            style="height: 46px; font-size: 0.90rem;"
            @click="accettaEAggiornaDeploy"
          >
            RICARICA ED AGGIORNA ORA
          </v-btn>

          <v-btn
            v-else
            color="purple-darken-3"
            block
            size="large"
            variant="flat"
            rounded="xl"
            class="font-weight-black text-none text-white elevation-6"
            style="height: 46px; font-size: 0.90rem;"
            @click="chiudiBannerNotifica"
          >
            HO CAPITO / CHIUDI
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- EASTER EGG VIDEO JULIE ("profiamma") -->
    <JulieEasterEgg v-model="mostraJulieEasterEgg" />

    <!-- EASTER EGG VIDEO CHRIS PANNEMEN ("pannemen") -->
    <PannemenEasterEgg v-model="mostraPannemenEasterEgg" />

  </v-app>
</template>

<script setup>
import { onMounted, onUnmounted, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import JulieEasterEgg from './components/JulieEasterEgg.vue';
import PannemenEasterEgg from './components/PannemenEasterEgg.vue';
import { utente, idCliente, ruolo, logout, activeTimer, pauseGlobalTimer, resumeGlobalTimer, stopGlobalTimer, selectedAthlete, selectedSheet, getNomeAtleta, globalHaEserciziDaFare, globalSettimanaDaChiudere, setGlobalSettimanaDaChiudere, triggerPlayClick, mostraDialogCalcolatoreDischi, targetPesoTotale, targetPesoLato, modalitaCalcolo, tipoBilanciere, nascondiLato, caricoMonolaterale, nomeEsercizioCalcolatore, timerThemeGlobal, layoutEserciziGlobal, chiudiSettimanaAttivaGiornoAttivo, globalStoryboard, showDeployBanner, deployVersionInfo, deployCustomNoteForMe, accettaEAggiornaDeploy, ignoraBannerDeploy, chiudiBannerNotifica, currentTheme, setTheme, haRecupero } from './authStore.js';

const router = useRouter();
const vuetifyTheme = useTheme();
const globalTransition = ref('fade');
const mostraDialogGuida = ref(false);
const mostraJulieEasterEgg = ref(false);
const mostraPannemenEasterEgg = ref(false);

// Gestione Easter Egg per parole chiave "profiamma" e "pannemen" (Desktop + Smartphone)
let typedKeysBuffer = '';
const handleGlobalKeydown = (event) => {
  if (event.ctrlKey || event.altKey || event.metaKey) return;
  if (event.key && event.key.length === 1) {
    typedKeysBuffer += event.key.toLowerCase();
    if (typedKeysBuffer.length > 20) {
      typedKeysBuffer = typedKeysBuffer.slice(-20);
    }
    if (typedKeysBuffer.endsWith('profiamma')) {
      mostraJulieEasterEgg.value = true;
      typedKeysBuffer = '';
    } else if (typedKeysBuffer.endsWith('pannemen')) {
      mostraPannemenEasterEgg.value = true;
      typedKeysBuffer = '';
    }
  }
};

const handleGlobalInput = (event) => {
  const val = event?.target?.value;
  if (val && typeof val === 'string') {
    const lower = val.toLowerCase();
    if (lower.includes('profiamma')) {
      mostraJulieEasterEgg.value = true;
    }
    if (lower.includes('pannemen')) {
      mostraPannemenEasterEgg.value = true;
    }
  }
};

let countLogoClick = 0;
let timerLogoClick = null;
const gestisciClickLogo = () => {
  countLogoClick++;
  if (timerLogoClick) clearTimeout(timerLogoClick);
  if (countLogoClick >= 3) {
    mostraJulieEasterEgg.value = true;
    countLogoClick = 0;
  } else {
    timerLogoClick = setTimeout(() => {
      countLogoClick = 0;
    }, 1800);
  }
};

const tabGuidaApp = ref(0);
const searchGuidaApp = ref('');
const simPesoApp = ref(80);
const simRepsApp = ref(8);

const calcolaSimE1RMApp = computed(() => {
  if (!simPesoApp.value || !simRepsApp.value) return 0;
  return Math.round(simPesoApp.value * (1 + simRepsApp.value / 30) * 10) / 10;
});

const apriGuidaInterattivaApp = (tabIndex = 0) => {
  tabGuidaApp.value = tabIndex;
  mostraDialogGuida.value = true;
};

const cambiaTemaInterattivoApp = (theme, style) => {
  setTheme(theme, vuetifyTheme);
  document.documentElement.setAttribute('data-light-style', style);
  localStorage.setItem('woapp_light_style', style);
};

// Tour Guidato Spotlight in App.vue
const mostraSpotlightTourApp = ref(false);
const tourStepApp = ref(0);
const tourStepsApp = [
  {
    titolo: '👋 Benvenuto in FlexCoach!',
    descrizione: 'Questa è la tua piattaforma avanzata per la forza. Vediamo insieme le funzionalità principali in pochissimi secondi.'
  },
  {
    titolo: '📖 Guida Sempre a Portata di Mano',
    descrizione: 'Tocca l’icona col punto interrogativo o del libro in alto a destra per aprire la Guida Interattiva, calcolare l’e1RM o provare i temi.'
  },
  {
    titolo: '🧠 Strategia Coach & 6 Settimane',
    descrizione: 'In ogni esercizio trovi la Roadmap delle 6 Settimane per conoscere esattamente l’RPE e il carico target consigliato.'
  },
  {
    titolo: '📊 Grafici e Proposta Carico',
    descrizione: 'L’algoritmo calcola in automatico i kg da caricare tenendo conto del tuo deallenamento e della fatica passata.'
  }
];

const avviaTourGuidatoApp = () => {
  mostraDialogGuida.value = false;
  tourStepApp.value = 0;
  mostraSpotlightTourApp.value = true;
};

const avantiTourApp = () => {
  if (tourStepApp.value < tourStepsApp.length - 1) {
    tourStepApp.value++;
  } else {
    chiudiTourApp();
  }
};

const chiudiTourApp = () => {
  mostraSpotlightTourApp.value = false;
  localStorage.setItem('woapp_tour_completato', 'true');
};

const toggleTema = () => {
  const nextTheme = currentTheme.value === 'light' ? 'dark' : 'light';
  setTheme(nextTheme, vuetifyTheme);
};

onMounted(() => {
  setTheme(currentTheme.value, vuetifyTheme);
  window.addEventListener('keydown', handleGlobalKeydown);
  window.addEventListener('input', handleGlobalInput, true);
});

onUnmounted(() => {
  window.removeEventListener('keydown', handleGlobalKeydown);
  window.removeEventListener('input', handleGlobalInput, true);
});

const controllaPrimoAccesso = () => {
  const guidaVista = localStorage.getItem('woapp_guida_vista');
  if (guidaVista !== 'true') {
    mostraDialogGuida.value = true;
    localStorage.setItem('woapp_guida_vista', 'true');
  }
};

watch(utente, (nuovoUtente) => {
  if (nuovoUtente) {
    setTimeout(() => {
      controllaPrimoAccesso();
    }, 1000);
  }
});

// Configurazione delle dimensioni del timer in base alla densità e al tema
const timerSizeConfig = computed(() => {
  const density = layoutEserciziGlobal.value || 'standard';
  const theme = timerThemeGlobal.value || 'accent-dark';
  
  if (density === 'super_compatto') {
    return {
      paddingClass: 'pa-3',
      maxWidth: '380px',
      circleSize: theme === 'accent-dark' ? 50 : theme === 'orange-glow' ? 46 : 44,
      circleWidth: 4.0,
      fontSizeProgress: '0.82rem',
      fontSizeLabel: '0.88rem',
      fontSizeSub: '0.70rem',
      btnSize: '32px',
      iconSize: 18,
      bottomOffset: '160px'
    };
  } else if (density === 'compatto') {
    return {
      paddingClass: 'pa-4',
      maxWidth: '420px',
      circleSize: theme === 'accent-dark' ? 56 : theme === 'orange-glow' ? 52 : 50,
      circleWidth: 4.5,
      fontSizeProgress: '0.90rem',
      fontSizeLabel: '0.98rem',
      fontSizeSub: '0.74rem',
      btnSize: '36px',
      iconSize: 20,
      bottomOffset: '176px'
    };
  } else { // standard
    return {
      paddingClass: theme === 'orange-glow' ? 'pa-5' : 'pa-4',
      maxWidth: '460px',
      circleSize: theme === 'accent-dark' ? 64 : theme === 'orange-glow' ? 60 : 58,
      circleWidth: theme === 'accent-dark' ? 5.2 : 4.8,
      fontSizeProgress: theme === 'accent-dark' ? '1.05rem' : '0.98rem',
      fontSizeLabel: theme === 'orange-glow' ? '1.12rem' : '1.04rem',
      fontSizeSub: '0.78rem',
      btnSize: '40px',
      iconSize: 22,
      bottomOffset: '196px'
    };
  }
});

// Funzione per formattare il tempo (es. se >= 60s mostra "1m 30s", altrimenti "45s")
const formattaTempo = (secondi, compatto = false) => {
  if (secondi === undefined || secondi === null) return '';
  if (secondi < 60) {
    return compatto ? `${secondi}` : `${secondi}s`;
  }
  const m = Math.floor(secondi / 60);
  const s = secondi % 60;
  if (compatto) {
    const sStr = s < 10 ? `0${s}` : `${s}`;
    return `${m}:${sStr}`;
  } else {
    return s > 0 ? `${m}m ${s}s` : `${m}m`;
  }
};

// Gestione intelligente delle transizioni globali in base alla direzione
router.beforeEach((to, from) => {
  if (from.name === 'Workouts' && (to.name === 'DettaglioSessione' || to.name === 'DettaglioWorkout')) {
    globalTransition.value = 'fade'; // 1. Entra nel dettaglio (Morbido/Fade)
  } else if (from.name === 'DettaglioSessione' && to.name === 'DettaglioWorkout') {
    globalTransition.value = 'swipe-next'; // 2. Da Intestazione Giorno a Esercizio 1 (Avanza a sinistra)
  } else if (from.name === 'DettaglioWorkout' && to.name === 'DettaglioSessione') {
    globalTransition.value = 'swipe-prev'; // 3. Da Esercizio 1 torna a Intestazione Giorno (Indietro a destra)
  } else {
    globalTransition.value = 'fade'; // 4. Ritorno alla lista generale o altre pagine (Morbido/Fade)
  }
});

const activeAthleteName = computed(() => {
  return getNomeAtleta(selectedAthlete.value) || 'Ospite';
});

const activeSheetNumber = computed(() => {
  return selectedSheet.value || '-';
});

onMounted(() => {
  // Gestione del tasto indietro fisico di Android per PWA Standalone
  window.addEventListener('popstate', (event) => {
    const routeName = router.currentRoute.value.name;
    if (routeName === 'DettaglioWorkout' || routeName === 'DettaglioSessione') {
      // Se non c'è una rotta precedente nella cronologia della PWA,
      // evitiamo che il browser esca e chiuda l'app, reindirizzandolo alla lista dei Workouts.
      if (!window.history.state || !window.history.state.back) {
        router.push('/');
      }
    }
  });

  // Richiesta permessi di notifica per timer in background
  if (window.Notification && Notification.permission === 'default') {
    Notification.requestPermission();
  }

  if (utente.value) {
    setTimeout(() => {
      controllaPrimoAccesso();
    }, 1000);
  }
});

// Micro-vibrazione tattile per smartphone (Haptic feedback)
const vibraTattile = (ms = 8) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

const mettiInPausaTimer = () => {
  vibraTattile(10);
  pauseGlobalTimer();
};

const riprendiTimer = () => {
  vibraTattile(15);
  resumeGlobalTimer();
};

const cancellaTimer = () => {
  vibraTattile(20);
  stopGlobalTimer();
};

const eseguiLogout = async () => {
  try {
    vibraTattile(12);
    await logout();
    router.push({ name: 'Login' });
  } catch (error) {
    console.error("Errore durante il logout:", error);
  }
};

const mostraDialogAvvisoChiusura = ref(false);
const mostraCongratulazioni = ref(false);
const caricamentoChiusuraRapida = ref(false);
const infoGiornoDaChiudere = ref({ giorno: 'A', week: 1, eserciziRecupero: [] });

const getGiornoDaChiudereGlobale = () => {
  const athlete = selectedAthlete.value;
  const sheet = selectedSheet.value;
  if (!athlete || !sheet || !globalStoryboard.value || globalStoryboard.value.length === 0) return null;

  const isCmpTrue = (val) => String(val).toLowerCase() === 'true';

  // Raccogli tutti i giorni della scheda (riga 0)
  const headers = globalStoryboard.value.filter(item => {
    const riga = parseInt(item.num_riga_giorno);
    const keyIdCliente = Object.keys(item).find(k => k.includes('ID_cliente')) || 'ID_cliente';
    return riga === 0 &&
           String(item[keyIdCliente]) === String(athlete) &&
           String(item.num_scheda) === String(sheet);
  });

  for (const header of headers) {
    const day = (header.des_giorno || '').trim().toUpperCase();
    if (!day) continue;

    // Trova la prima settimana non chiusa per questo giorno
    let activeW = null;
    for (let w = 1; w <= 6; w++) {
      if (!isCmpTrue(header['cmp' + w])) {
        activeW = w;
        break;
      }
    }
    if (!activeW) continue; // Tutte le 6 settimane sono chiuse per questo giorno

    // Se l'utente ha impostato keepOpen per questa specifica settimana, non considerarla come da chiudere
    const keepOpenKey = `keepOpen_${athlete}_${day}_W${activeW}`;
    if (localStorage.getItem(keepOpenKey) === 'true') {
      continue;
    }

    // Verifica se tutti gli esercizi di questo giorno per activeW sono compilati
    const eserciziDelGiorno = globalStoryboard.value.filter(item => {
      const riga = parseInt(item.num_riga_giorno);
      const keyIdCliente = Object.keys(item).find(k => k.includes('ID_cliente')) || 'ID_cliente';
      return riga > 0 &&
             (item.des_giorno || '').trim().toUpperCase() === day &&
             String(item[keyIdCliente]) === String(athlete) &&
             String(item.num_scheda) === String(sheet);
    });

    if (eserciziDelGiorno.length === 0) continue;

    const tuttiCompilati = eserciziDelGiorno.every(ex => {
      const val = ex['ins_week' + activeW];
      return val && val.trim() !== '';
    });

    if (tuttiCompilati) {
      const eserciziConRecupero = eserciziDelGiorno.filter(ex => {
        const val = ex['ins_week' + activeW];
        return haRecupero(val);
      });

      return {
        giorno: day,
        week: activeW,
        headerId: header.id,
        eserciziRecupero: eserciziConRecupero
      };
    }
  }

  return null;
};

// Watcher per tenere sincronizzato lo stato globale di settimana da chiudere
watch([globalStoryboard, selectedAthlete, selectedSheet], () => {
  const daChiudere = getGiornoDaChiudereGlobale();
  if (daChiudere) {
    setGlobalSettimanaDaChiudere(true);
  } else {
    setGlobalSettimanaDaChiudere(false);
  }
}, { deep: true, immediate: true });

const cliccaPlayGlobale = () => {
  if (typeof vibraTattile === 'function') vibraTattile(12);
  console.log('[Play - App.vue] CliccaPlayGlobale triggered.');
  
  const daChiudere = getGiornoDaChiudereGlobale();

  if (daChiudere) {
    console.log('[Play - App.vue] Settimana da chiudere dialog shown:', daChiudere);
    infoGiornoDaChiudere.value = {
      giorno: daChiudere.giorno,
      week: daChiudere.week,
      headerId: daChiudere.headerId,
      eserciziRecupero: daChiudere.eserciziRecupero || []
    };
    const athlete = selectedAthlete.value || 'default';
    localStorage.setItem('giornoDaChiudereTemporaneo_' + athlete, daChiudere.giorno);
    localStorage.setItem('settimanaDaChiudereTemporanea_' + athlete, String(daChiudere.week));
    mostraDialogAvvisoChiusura.value = true;
  } else {
    console.log('[Play - App.vue] Executing eseguiAzionePlay.');
    eseguiAzionePlay();
  }
};

const vaiAlRecuperoDaDialog = () => {
  mostraDialogAvvisoChiusura.value = false;
  const exRec = infoGiornoDaChiudere.value.eserciziRecupero && infoGiornoDaChiudere.value.eserciziRecupero[0];
  const athlete = selectedAthlete.value || 'default';
  
  localStorage.removeItem('giornoDaChiudereTemporaneo_' + athlete);
  localStorage.removeItem('settimanaDaChiudereTemporanea_' + athlete);

  if (exRec && exRec.id) {
    const week = infoGiornoDaChiudere.value.week;
    if (typeof vibraTattile === 'function') vibraTattile(12);
    
    if (router.currentRoute.value.name === 'Workouts') {
      triggerPlayClick();
    } else {
      router.push({
        name: 'DettaglioWorkout',
        params: { id: exRec.id },
        query: { targetWeek: week }
      });
    }
  } else {
    eseguiAzionePlay();
  }
};

const getActiveHeaderIdForDay = (day) => {
  const athlete = selectedAthlete.value;
  const sheet = selectedSheet.value;
  if (!athlete || !sheet) return null;

  const header = globalStoryboard.value.find(item => {
    const riga = parseInt(item.num_riga_giorno);
    const keyIdCliente = Object.keys(item).find(k => k.includes('ID_cliente')) || 'ID_cliente';
    return riga === 0 &&
           (item.des_giorno || '').trim().toUpperCase() === day.trim().toUpperCase() &&
           String(item[keyIdCliente]) === String(athlete) &&
           String(item.num_scheda) === String(sheet);
  });
  return header ? header.id : null;
};

const chiudiRapido = async () => {
  caricamentoChiusuraRapida.value = true;
  try {
    const success = await chiudiSettimanaAttivaGiornoAttivo();
    if (success) {
      mostraDialogAvvisoChiusura.value = false;
      mostraCongratulazioni.value = true;
      setTimeout(() => {
        mostraCongratulazioni.value = false;
      }, 2500);
    }
  } catch (err) {
    console.error("Errore durante la chiusura rapida:", err);
  } finally {
    caricamentoChiusuraRapida.value = false;
  }
};

const vaiADettaglioEChiudi = () => {
  mostraDialogAvvisoChiusura.value = false;
  const athlete = selectedAthlete.value;
  const tempDay = localStorage.getItem('giornoDaChiudereTemporaneo_' + athlete);
  const tempWeekStr = localStorage.getItem('settimanaDaChiudereTemporanea_' + athlete);

  const day = tempDay || localStorage.getItem('giornoAttivo_' + athlete) || 'A';
  const week = tempWeekStr ? parseInt(tempWeekStr) : (parseInt(localStorage.getItem('settimanaAttiva_' + athlete)) || 1);

  // Pulisci i valori temporanei
  localStorage.removeItem('giornoDaChiudereTemporaneo_' + athlete);
  localStorage.removeItem('settimanaDaChiudereTemporanea_' + athlete);

  const activeHeaderId = getActiveHeaderIdForDay(day);
  if (activeHeaderId) {
    localStorage.setItem('highlightChiusuraWeek', 'true');
    localStorage.setItem('highlightChiusuraWeekNumber', String(week));
    router.push({ name: 'DettaglioSessione', params: { id: activeHeaderId } });
  } else {
    // Fallback: se non troviamo la riga, andiamo alla home
    eseguiAzionePlay();
  }
};

const confermaVaiAlWorkout = () => {
  mostraDialogAvvisoChiusura.value = false;
  eseguiAzionePlay();
};

const eseguiAzionePlay = () => {
  console.log('[Play - App.vue] Current route name:', router.currentRoute.value.name);
  if (router.currentRoute.value.name === 'Workouts') {
    console.log('[Play - App.vue] triggerPlayClick incremented.');
    triggerPlayClick();
  } else {
    console.log('[Play - App.vue] Redirecting to / with scroll flag.');
    localStorage.setItem('scrollPrimoEsercizioDaFare', 'true');
    router.push('/');
  }
};

// Calcolatore Dischi
const opzioniBilanciere = [
  { id: 'olimpico-20', label: 'Bilanciere Olimpico Standard (20 kg)', peso: 20 },
  { id: 'olimpico-15', label: 'Bilanciere Olimpico Donna/Junior (15 kg)', peso: 15 },
  { id: 'standard-12', label: 'Bilanciere EZ o Standard (12 kg)', peso: 12 },
  { id: 'standard-10', label: 'Bilanciere Standard Leggero (10 kg)', peso: 10 },
  { id: 'standard-8',  label: 'Bilanciere Super Leggero (8 kg)', peso: 8 },
  { id: 'carrucola-0',  label: 'Manubrio / Macchina a Carrucola (0 kg)', peso: 0 },
  { id: 'senza-0',     label: 'Senza Bilanciere (0 kg)', peso: 0 }
];

const ultimoIdSelezionatoPesoZero = ref(localStorage.getItem('ultimoIdSelezionatoPesoZero') || 'senza-0');

const selectedBilanciereId = computed({
  get() {
    const peso = tipoBilanciere.value;
    if (peso === 0) {
      return ultimoIdSelezionatoPesoZero.value;
    }
    const trovato = opzioniBilanciere.find(o => o.peso === peso);
    return trovato ? trovato.id : 'olimpico-20';
  },
  set(id) {
    const trovato = opzioniBilanciere.find(o => o.id === id);
    if (trovato) {
      if (trovato.peso === 0) {
        ultimoIdSelezionatoPesoZero.value = id;
        localStorage.setItem('ultimoIdSelezionatoPesoZero', id);
      }
      tipoBilanciere.value = trovato.peso;
    }
  }
});

watch([tipoBilanciere, caricoMonolaterale], () => {
  const isMono = caricoMonolaterale.value === 'singolo';
  const divider = isMono ? 1 : 2;
  const multiplier = isMono ? 1 : 2;
  const newBar = tipoBilanciere.value;

  if (modalitaCalcolo.value === 'totale') {
    const tot = targetPesoTotale.value;
    const latoCalc = (tot - newBar) / divider;
    targetPesoLato.value = latoCalc > 0 ? latoCalc : 0;
  } else {
    const lat = targetPesoLato.value;
    targetPesoTotale.value = lat * multiplier + newBar;
  }
});

const pesoDischiDaCalcolare = computed(() => {
  return targetPesoLato.value;
});

const elencoDischiPerLato = computed(() => {
  let remaining = targetPesoLato.value;
  if (remaining <= 0) return [];
  
  const plates = [20, 10, 5, 2.5, 1.25];
  const result = [];
  
  for (const p of plates) {
    const count = Math.floor(remaining / p);
    if (count > 0) {
      result.push({ size: p, count });
      remaining = parseFloat((remaining - (count * p)).toFixed(2));
    }
  }
  return result;
});

const rimanenzaDischi = computed(() => {
  let remaining = targetPesoLato.value;
  if (remaining <= 0) return 0;
  
  const plates = [20, 10, 5, 2.5, 1.25];
  for (const p of plates) {
    const count = Math.floor(remaining / p);
    remaining = parseFloat((remaining - (count * p)).toFixed(2));
  }
  return remaining;
});

const elencoDischiGrafica = computed(() => {
  const result = [];
  let idCounter = 0;
  for (const item of elencoDischiPerLato.value) {
    for (let i = 0; i < item.count; i++) {
      result.push({ id: idCounter++, size: item.size });
    }
  }
  return result.sort((a, b) => b.size - a.size);
});
</script>

<style scoped>
.text-slate-dark {
  color: #f8fafc !important;
}

.orange-dot {
  color: var(--theme-primary);
}

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.btn-header-compact {
  width: 34px !important;
  height: 34px !important;
  min-width: 34px !important;
  padding: 0 !important;
}

.premium-nav {
  background: #0f172a !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Transizioni fluide sui pulsanti della barra inferiore */
.v-bottom-navigation .v-btn {
  transition: transform 0.2s ease;
}

.v-bottom-navigation .v-btn--active {
  transform: translateY(-2px);
}

/* Timer Pill Floating Premium */
.global-timer-pill {
  position: fixed;
  bottom: 86px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 480px;
  z-index: 999;
  display: flex;
  align-items: center;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.timer-theme-accent-dark {
  border: 2px solid var(--theme-primary-border) !important;
  background: rgba(10, 15, 30, 0.94) !important;
  backdrop-filter: blur(16px) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px var(--theme-primary-glow) !important;
  animation: pulse-border-accent 2s infinite alternate;
}

@keyframes pulse-border-accent {
  0% {
    border-color: var(--theme-primary-border) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 10px var(--theme-primary-glow) !important;
  }
  100% {
    border-color: var(--theme-primary) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 22px var(--theme-primary-glow) !important;
  }
}

.timer-theme-orange-glow {
  border: 1px solid var(--card-border) !important;
  background: linear-gradient(135deg, var(--card-bg-dark) 65%, var(--theme-primary-bg-soft) 100%) !important;
  backdrop-filter: blur(16px) !important;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55), 0 0 30px var(--theme-primary-glow) !important;
  animation: pulse-glow-orange 2.5s infinite alternate;
}

@keyframes pulse-glow-orange {
  0% {
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55), 0 0 15px var(--theme-primary-glow) !important;
  }
  100% {
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55), 0 0 35px var(--theme-primary-glow) !important;
  }
}

.timer-theme-solid-contrast {
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  background: var(--theme-btn-gradient) !important;
  box-shadow: 0 10px 25px var(--theme-primary-glow) !important;
}

.timer-theme-solid-contrast-success {
  border: 2px solid rgba(255, 255, 255, 0.2) !important;
  background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%) !important;
  box-shadow: 0 10px 25px rgba(22, 163, 74, 0.45) !important;
}

.timer-theme-green-glow {
  border: 1px solid var(--card-border) !important;
  background: linear-gradient(135deg, var(--card-bg-dark) 65%, rgba(34, 197, 94, 0.22) 100%) !important;
  backdrop-filter: blur(16px) !important;
  box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55), 0 0 30px rgba(34, 197, 94, 0.3) !important;
  animation: pulse-glow-green 2.5s infinite alternate;
}

@keyframes pulse-glow-green {
  0% {
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55), 0 0 15px rgba(34, 197, 94, 0.15) !important;
  }
  100% {
    box-shadow: 0 12px 35px rgba(0, 0, 0, 0.55), 0 0 35px rgba(34, 197, 94, 0.4) !important;
  }
}

.timer-theme-success-glow {
  border: 2px solid rgba(34, 197, 94, 0.5) !important;
  background: rgba(10, 25, 15, 0.94) !important;
  backdrop-filter: blur(16px) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(34, 197, 94, 0.25) !important;
  animation: pulse-border-success 2s infinite alternate;
}

@keyframes pulse-border-success {
  0% {
    border-color: rgba(34, 197, 94, 0.35) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 10px rgba(34, 197, 94, 0.15) !important;
  }
  100% {
    border-color: rgba(34, 197, 94, 0.7) !important;
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5), 0 0 22px rgba(34, 197, 94, 0.35) !important;
  }
}

.fixed-play-fab {
  position: fixed !important;
  right: 20px !important;
  z-index: 998 !important;
  width: 56px !important;
  height: 56px !important;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4) !important;
  transition: bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease !important;
}

.fixed-play-fab:active {
  transform: scale(0.92) !important;
}

/* Stili per Calcolatore Dischi */
.barbell-sleeve-line {
  height: 6px;
  background: #64748b;
  width: 25px;
  border-radius: 3px;
  margin-right: -4px;
}

.plate-graphic-item {
  border-radius: 3px;
  color: white;
  font-size: 0.65rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plate-graphic-item:hover {
  transform: scale(1.08);
}

/* Dimensioni e colori delle piastre */
.plate-20 {
  width: 14px;
  height: 72px;
  background: linear-gradient(180deg, #1d4ed8, #1e3a8a) !important; /* Blue */
}
.plate-10 {
  width: 13px;
  height: 60px;
  background: linear-gradient(180deg, #15803d, #14532d) !important; /* Green */
}
.plate-5 {
  width: 12px;
  height: 48px;
  background: linear-gradient(180deg, #d1d5db, #4b5563) !important; /* White/Grey */
  color: #111827 !important;
  text-shadow: none !important;
}
.plate-2_5 {
  width: 11px;
  height: 38px;
  background: linear-gradient(180deg, #374151, #111827) !important; /* Black */
}
.plate-1_25 {
  width: 10px;
  height: 30px;
  background: linear-gradient(180deg, #9ca3af, #6b7280) !important; /* Chrome */
}

/* Indicatori di colore nel testo */
.plate-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.plate-bg-20 { background: #1d4ed8; }
.plate-bg-10 { background: #15803d; }
.plate-bg-5 { background: #d1d5db; }
.plate-bg-2_5 { background: #374151; }
.plate-bg-1_25 { background: #9ca3af; }

/* Stile Premium Selettori Caricamento Singolo/Doppio */
.premium-toggle-group {
  background: var(--card-bg-soft) !important;
  border: 1px solid var(--card-border) !important;
}
.premium-toggle-group .v-btn {
  border: none !important;
  color: var(--text-slate, #94a3b8) !important;
  text-transform: none !important;
}
.premium-toggle-group .v-btn--active,
.premium-toggle-group .v-btn.v-item--active,
.premium-toggle-group .v-btn--selected {
  background: var(--theme-btn-gradient, var(--brand-accent, #f97316)) !important;
  color: #ffffff !important;
  font-weight: 800 !important;
  box-shadow: 0 2px 8px var(--theme-primary-glow, rgba(249, 115, 22, 0.4)) !important;
}
</style>

<style>
/* TRANSIZIONI SWIPE PREMIUM (Effetto App Nativa) */

/* Swipe verso il PROSSIMO (Entra da destra, esce a sinistra) */
.swipe-next-enter-active, .swipe-next-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.swipe-next-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.swipe-next-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

/* Swipe verso il PRECEDENTE (Entra da sinistra, esce a destra) */
.swipe-prev-enter-active, .swipe-prev-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.swipe-prev-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}
.swipe-prev-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Rende la transizione fluida evitando salti di altezza */
.exercise-detail-area, .session-detail-area {
  width: 100%;
  will-change: transform, opacity;
}

/* Rimuove il flash bianco durante il cambio componente */
.v-main {
  background-color: #030712 !important;
}

/* Transizione morbida (Fade) per i cambi pagina standard (es. da Home a Grafici) */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.20s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

/* Transizione per il timer globale: fade in all'entrata, istantanea all'uscita */
.fade-instant-leave-enter-active {
  transition: opacity 0.2s ease;
}
.fade-instant-leave-enter-from {
  opacity: 0;
}
.fade-instant-leave-leave-active {
  transition: none !important;
}
.fade-instant-leave-leave-to {
  opacity: 0;
}

/* Fix Troncamento Header su Schermi Mobile */
.v-app-bar {
  padding: 0 4px !important;
}
.btn-header-compact {
  margin-right: 6px !important; /* mr-1.5 */
}
</style>

<style>
.v-app-bar .v-app-bar-title {
  min-width: 170px !important;
  flex: 0 1 auto !important;
}
.v-app-bar .v-toolbar-title__placeholder {
  overflow: visible !important;
  text-overflow: clip !important;
}
</style>