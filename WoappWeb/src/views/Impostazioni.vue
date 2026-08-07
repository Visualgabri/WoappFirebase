<template>
  <v-container 
    class="px-3 max-width-container min-height-screen pb-8"
    :class="layoutEserciziGlobal === 'super_compatto' ? 'py-2' : 'py-3.5'"
  >
    <!-- Header Premium -->
    <div 
      class="premium-header card-glass rounded-xl d-flex align-center justify-space-between elevation-1 border-bottom-soft animate-slide-down pa-3.5 mb-4"
    >
      <div class="d-flex align-center">
        <v-avatar size="38" class="mr-3 bg-transparent border-orange elevation-1 profile-avatar">
          <v-img src="/logo.png" alt="WoApp Logo"></v-img>
        </v-avatar>
        <div class="text-left">
          <h1 class="text-subtitle-1 font-weight-black text-slate-dark tracking-tight leading-tight mb-0.5">Impostazioni</h1>
          <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.60rem; letter-spacing: 0.04em;">Profilo & Configurazione</span>
        </div>
      </div>
    </div>

    <!-- SEZIONE 1: PROFILO ATLETA -->
    <v-card 
      class="premium-card rounded-xl text-left border position-relative overflow-hidden mb-4 animate-slide-down pa-4"
      elevation="1"
    >
      <div class="glowing-accent"></div>
      
      <div class="d-flex align-center mb-3">
        <v-icon color="orange-darken-3" class="mr-2" size="18">mdi-account-circle-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-widest" style="font-size: 0.70rem;">Profilo Utente</span>
      </div>

      <div class="d-flex align-center mb-3.5">
        <v-avatar size="40" color="orange-darken-4" class="mr-3 border-orange text-white font-weight-black elevation-1">
          {{ getNomeAtleta(idCliente) ? getNomeAtleta(idCliente).charAt(0).toUpperCase() : (ruolo === 'coach' ? 'C' : 'A') }}
        </v-avatar>
        <div class="text-left">
          <div class="text-body-2 font-weight-black text-slate-dark leading-snug">
            {{ ruolo === 'coach' ? 'Coach' : (getNomeAtleta(idCliente) || 'Atleta') }}
          </div>
          <div class="text-caption text-muted mt-1 d-flex align-center gap-1" style="font-size: 0.74rem;">
            <v-icon size="13" class="mr-1">mdi-email-outline</v-icon>
            {{ utente?.email || 'Non disponibile' }}
          </div>
        </div>
      </div>

      <v-row dense class="border-top-soft pt-2.5">
        <v-col cols="6" class="border-right-soft">
          <div class="text-center py-1">
            <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.60rem;">Ruolo</span>
            <v-chip color="orange-darken-3" size="x-small" class="font-weight-black mt-1 text-white" variant="flat">
              {{ ruolo === 'coach' ? 'Coach' : 'Atleta' }}
            </v-chip>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="text-center py-1">
            <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.60rem;">ID Cliente</span>
            <span class="text-body-2 font-weight-black text-slate-dark mt-1 d-inline-block">
              {{ idCliente || 'N/D' }}
            </span>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- SEZIONE TEMA & ASPETTO -->
    <v-card 
      class="premium-card rounded-xl text-left border mb-4 animate-slide-down pa-4"
      elevation="1"
    >
      <div class="d-flex align-center mb-3">
        <v-icon color="orange-darken-3" class="mr-2" size="18">mdi-palette-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-widest" style="font-size: 0.70rem;">Aspetto & Tema</span>
      </div>

      <div>
        <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.70rem;">Tema Grafico</span>
        <v-btn-toggle
          v-model="selectedTheme"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border mb-2"
          style="height: 36px;"
          @update:model-value="cambiaTemaDaImpostazioni"
        >
          <v-btn value="dark" class="font-weight-bold flex-grow-1" style="font-size: 0.70rem; min-width: 50%;">
            <v-icon class="mr-1" size="16">mdi-weather-night</v-icon> Tema Scuro
          </v-btn>
          <v-btn value="light" class="font-weight-bold flex-grow-1" style="font-size: 0.70rem; min-width: 50%;">
            <v-icon class="mr-1" size="16">mdi-white-balance-sunny</v-icon> Tema Chiaro
          </v-btn>
        </v-btn-toggle>

        <!-- Selettore Variante Tema Chiaro -->
        <div v-if="selectedTheme === 'light'" class="mt-3 pt-2.5 border-top-soft">
          <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.70rem;">Variante Tema Chiaro</span>
          <v-btn-toggle
            v-model="selectedLightStyle"
            mandatory
            selected-class="bg-orange-darken-3 text-white"
            density="compact"
            rounded="lg"
            class="w-100 card-glass border mb-1"
            style="height: 34px;"
            @update:model-value="cambiaStileChiaroDaImpostazioni"
          >
            <v-btn value="slate" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
              Slate Amber
            </v-btn>
            <v-btn value="chalk" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
              Chalk Cobalt
            </v-btn>
            <v-btn value="sand" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
              Warm Sand
            </v-btn>
          </v-btn-toggle>
        </div>
      </div>
    </v-card>

    <!-- SEZIONE 2: LAYOUT & VISUALIZZAZIONE -->
    <v-card 
      class="premium-card rounded-xl text-left border mb-4 animate-slide-down pa-4"
      elevation="1"
    >
      <div class="d-flex align-center mb-3.5">
        <v-icon color="orange-darken-3" class="mr-2" size="18">mdi-view-dashboard-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-widest" style="font-size: 0.70rem;">Layout & Visualizzazione</span>
      </div>

      <!-- Densità Layout Lista -->
      <div class="mb-3.5">
        <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.70rem;">Densità Layout Lista</span>
        <v-btn-toggle
          v-model="layoutEsercizi"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 34px;"
        >
          <v-btn value="super_compatto" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
            Super Compatto
          </v-btn>
          <v-btn value="compatto" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
            Compatto
          </v-btn>
          <v-btn value="standard" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
            Standard
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Densità Layout Dettaglio -->
      <div class="mb-3.5">
        <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.70rem;">Densità Layout Dettaglio</span>
        <v-btn-toggle
          v-model="layoutDettaglio"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 34px;"
        >
          <v-btn value="auto" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 25%;">
            Auto
          </v-btn>
          <v-btn value="super_compatto" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 25%;">
            Super Comp
          </v-btn>
          <v-btn value="compatto" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 25%;">
            Compatto
          </v-btn>
          <v-btn value="standard" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 25%;">
            Standard
          </v-btn>
        </v-btn-toggle>
      </div>

      <!-- Comportamento Tasto Play -->
      <div class="mb-3.5">
        <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.70rem;">Comportamento Tasto Play</span>
        <v-btn-toggle
          v-model="comportamentoPlay"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 34px;"
        >
          <v-btn value="auto" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
            Auto
          </v-btn>
          <v-btn value="dettaglio" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
            Dettaglio
          </v-btn>
          <v-btn value="evidenzia" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
            Evidenzia
          </v-btn>
        </v-btn-toggle>
      </div>

      <v-divider class="my-3.5 border-soft" style="opacity: 0.15;"></v-divider>

      <!-- Tema Card Giorno Workout -->
      <div>
        <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.70rem;">Tema Card Giorno Workout</span>
        <v-btn-toggle
          v-model="temaHeaderGiorno"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 34px;"
        >
          <v-btn value="arancio" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
            Arancio
          </v-btn>
          <v-btn value="blu" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
            Blu Cobalto
          </v-btn>
          <v-btn value="verde" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 33%;">
            Verde Smeraldo
          </v-btn>
        </v-btn-toggle>
      </div>
    </v-card>

    <!-- SEZIONE 3: PARAMETRI ALLENAMENTO -->
    <v-card 
      class="premium-card rounded-xl text-left border mb-4 animate-slide-down pa-4"
      elevation="1"
    >
      <div class="d-flex align-center mb-3.5">
        <v-icon color="orange-darken-3" class="mr-2" size="18">mdi-dumbbell</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-widest" style="font-size: 0.70rem;">Parametri Allenamento</span>
      </div>

      <div class="d-flex flex-column gap-3.5">
        <!-- Peso Bilanciere Default -->
        <div class="d-flex align-center justify-space-between">
          <div>
            <span class="text-body-2 font-weight-bold text-slate-dark d-block" style="font-size: 0.78rem;">Peso Bilanciere Default</span>
            <span class="text-super-caption text-muted mt-0.5 d-block">Usato nel calcolatore dischi</span>
          </div>
          <div style="width: 130px;">
            <v-select
              v-model="defaultBilanciere"
              :items="[
                { title: '20 kg (Olimpico)', value: 20 },
                { title: '15 kg (Femminile)', value: 15 },
                { title: '12 kg (Leggero)', value: 12 },
                { title: '10 kg (Junior)', value: 10 },
                { title: '0 kg (Manubri/Libero)', value: 0 }
              ]"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              color="orange-darken-3"
              style="font-size: 0.75rem;"
            ></v-select>
          </div>
        </div>

        <!-- Feedback Tattile (Vibrazione) -->
        <div class="d-flex align-center justify-space-between">
          <div>
            <span class="text-body-2 font-weight-bold text-slate-dark d-block" style="font-size: 0.78rem;">Vibrazione Tattile</span>
            <span class="text-super-caption text-muted mt-0.5 d-block">Micro-feedback sui tasti ed inserimenti</span>
          </div>
          <div>
            <v-switch
              v-model="vibrazioneAttiva"
              color="orange-darken-3"
              hide-details
              density="compact"
            ></v-switch>
          </div>
        </div>

        <!-- Tempo Default Recupero -->
        <div class="d-flex align-center justify-space-between">
          <div>
            <span class="text-body-2 font-weight-bold text-slate-dark d-block" style="font-size: 0.78rem;">Durata Recupero Default</span>
            <span class="text-super-caption text-muted mt-0.5 d-block">Se non specificato dall'esercizio</span>
          </div>
          <div style="width: 130px;">
            <v-select
              v-model="defaultTimerRec"
              :items="[
                { title: '45 secondi', value: 45 },
                { title: '60 secondi (1m)', value: 60 },
                { title: '90 secondi (1m 30s)', value: 90 },
                { title: '120 secondi (2m)', value: 120 },
                { title: '150 secondi (2m 30s)', value: 150 },
                { title: '180 secondi (3m)', value: 180 }
              ]"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              color="orange-darken-3"
              style="font-size: 0.75rem;"
            ></v-select>
          </div>
        </div>

        <!-- Tema Grafico Timer -->
        <div class="d-flex align-center justify-space-between">
          <div>
            <span class="text-body-2 font-weight-bold text-slate-dark d-block" style="font-size: 0.78rem;">Tema Grafico Timer</span>
            <span class="text-super-caption text-muted mt-0.5 d-block">Stile visivo del widget di recupero</span>
          </div>
          <div style="width: 150px;">
            <v-select
              v-model="timerTheme"
              :items="[
                { title: 'Accent Dark & Glass', value: 'accent-dark' },
                { title: 'Orange Glow Premium', value: 'orange-glow' },
                { title: 'Solid Contrast Orange', value: 'solid-contrast' }
              ]"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              color="orange-darken-3"
              style="font-size: 0.75rem;"
            ></v-select>
          </div>
        </div>

        <v-divider class="my-3.5 border-soft" style="opacity: 0.15;"></v-divider>

        <!-- Configurazione Algoritmo Ghost -->
        <div class="text-left mt-1">
          <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.70rem;">Visualizzazione Suggerimento Ghost</span>
          <v-btn-toggle
            v-model="stileVisualizzazioneGhost"
            mandatory
            selected-class="bg-orange-darken-3 text-white"
            density="compact"
            rounded="lg"
            class="w-100 card-glass border mb-3"
            style="height: 34px;"
          >
            <v-btn value="range" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 50%;">
              Solo Range
            </v-btn>
            <v-btn value="forma" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 50%;">
              Stato Forma
            </v-btn>
          </v-btn-toggle>
          
          <div class="d-flex flex-column gap-2.5 rounded-xl pa-3 inner-setting-box border-soft">
            <!-- Switch PR Attack -->
            <div class="d-flex align-center justify-space-between" style="min-height: 32px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-amber-lighten-2 d-block" style="font-size: 0.72rem;">Attacco al Record (PR)</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.3;">Arrotonda in eccesso vicino al tuo PR</span>
              </div>
              <v-switch
                v-model="ghostPRAttackAttivo"
                color="amber-darken-2"
                hide-details
                density="compact"
                class="ml-2 flex-shrink-0"
              ></v-switch>
            </div>
            
            <v-divider class="border-soft" style="opacity: 0.3;"></v-divider>
            
            <!-- Switch Autoregolazione Reps -->
            <div class="d-flex align-center justify-space-between" style="min-height: 32px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-green-accent-3 d-block" style="font-size: 0.72rem;">Autoregolazione Reps</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.3;">Adatta la proposta in base alle reps eseguite</span>
              </div>
              <v-switch
                v-model="ghostAutoregolazioneRepsAttiva"
                color="green-darken-2"
                hide-details
                density="compact"
                class="ml-2 flex-shrink-0"
              ></v-switch>
            </div>

            <v-divider class="border-soft" style="opacity: 0.3;"></v-divider>
            
            <!-- Switch Sfida Record Week 1 -->
            <div class="d-flex align-center justify-space-between" style="min-height: 32px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-orange-lighten-2 d-block" style="font-size: 0.72rem;">Sfida Record in Week 1</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.3;">Mostra opzioni per superare record in Week 1</span>
              </div>
              <v-switch
                v-model="sfidaRecordWeek1"
                color="orange-darken-3"
                hide-details
                density="compact"
                class="ml-2 flex-shrink-0"
              ></v-switch>
            </div>

            <v-divider class="border-soft" style="opacity: 0.3;"></v-divider>
            
            <!-- Switch Ottimizza Digitazione Note -->
            <div class="d-flex align-center justify-space-between" style="min-height: 32px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-orange-lighten-2 d-block" style="font-size: 0.72rem;">Ottimizza Digitazione Note</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.3;">Evita lag aggiornando i calcoli dopo la scrittura</span>
              </div>
              <v-switch
                v-model="ottimizzaDigitazione"
                color="orange-darken-3"
                hide-details
                density="compact"
                class="ml-2 flex-shrink-0"
              ></v-switch>
            </div>

            <v-divider class="border-soft" style="opacity: 0.3;"></v-divider>

            <!-- Regola Progressione Week 2 -->
            <div class="d-flex align-center justify-space-between" style="min-height: 36px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-orange-lighten-2 d-block" style="font-size: 0.72rem;">Progressione Week 2</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.3;">Regola di calcolo per le proposte della W2</span>
              </div>
              <v-select
                v-model="regolaProgressioneW2"
                :items="[
                  { title: 'Peso (+Step)', value: 'peso' },
                  { title: 'Testo \'Aumenta peso\'', value: 'scritta' }
                ]"
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                color="orange-darken-3"
                style="font-size: 0.70rem; max-width: 150px; min-width: 130px;"
              ></v-select>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- SEZIONE 3: INVIA NOTIFICA DEPLOY REAL-TIME (SOLO COACH) -->
    <v-card 
      v-if="ruolo === 'coach'"
      class="premium-card rounded-xl text-left border mb-4 animate-slide-down pa-4"
      elevation="1"
      :style="{ borderColor: tipoNotificaForm === 'deploy' ? 'rgba(249, 115, 22, 0.45) !important' : 'rgba(168, 85, 247, 0.5) !important' }"
    >
      <div class="d-flex align-center justify-space-between mb-3">
        <div class="d-flex align-center gap-1.5">
          <v-icon :color="tipoNotificaForm === 'deploy' ? 'orange-darken-3' : 'purple-darken-1'" size="18">
            {{ tipoNotificaForm === 'deploy' ? 'mdi-rocket-launch-outline' : 'mdi-comment-text-outline' }}
          </v-icon>
          <span class="font-weight-black uppercase" :class="tipoNotificaForm === 'deploy' ? 'text-orange-lighten-2' : 'text-purple-lighten-2'" style="font-size: 0.70rem; letter-spacing: 0.03em;">
            {{ tipoNotificaForm === 'deploy' ? 'Invia Notifica Deploy' : 'Invia Messaggio Privato' }}
          </span>
        </div>
        <v-chip :color="tipoNotificaForm === 'deploy' ? 'orange-darken-3' : 'purple-darken-2'" size="x-small" variant="flat" class="font-weight-black text-white" style="font-size: 0.55rem; height: 18px;">
          COACH ONLY
        </v-chip>
      </div>

      <div class="pa-3 rounded-xl inner-setting-box border-soft">
        <!-- Selettore Tab Notifica (1. Deploy vs 2. Messaggio Privato) -->
        <div class="mb-3">
          <span class="text-caption font-weight-black text-slate-dark d-block mb-1.5" style="font-size: 0.68rem;">Seleziona Tipo Notifica:</span>
          <v-btn-toggle
            v-model="tipoNotificaForm"
            mandatory
            density="compact"
            rounded="lg"
            class="w-100 card-glass border overflow-hidden"
            style="height: 34px;"
          >
            <v-btn 
              value="deploy" 
              class="font-weight-black flex-grow-1 text-none"
              :class="tipoNotificaForm === 'deploy' ? 'bg-orange-darken-3 text-white' : 'text-slate-dark'"
              style="font-size: 0.65rem; padding: 0 6px;"
            >
              Deploy (Tutti)
            </v-btn>
            <v-btn 
              value="messaggio" 
              class="font-weight-black flex-grow-1 text-none"
              :class="tipoNotificaForm === 'messaggio' ? 'bg-purple-darken-2 text-white' : 'text-slate-dark'"
              style="font-size: 0.65rem; padding: 0 6px;"
            >
              Messaggio Privato
            </v-btn>
          </v-btn-toggle>
        </div>

        <!-- AMBIENTE 1: DEPLOY GLOBALE -->
        <template v-if="tipoNotificaForm === 'deploy'">
          <div class="pa-2.5 rounded-lg border border-orange-500/30 bg-orange-500/10 d-flex align-center gap-2 mb-3">
            <v-icon color="orange-darken-2" size="18">mdi-earth</v-icon>
            <div class="text-left">
              <div class="font-weight-black text-orange-lighten-2 uppercase" style="font-size: 0.62rem;">
                Destinatari: Tutti gli utenti
              </div>
              <div class="text-slate mt-0.5" style="font-size: 0.60rem; line-height: 1.25;">
                Notifica di aggiornamento inviata a tutti gli atleti attivi.
              </div>
            </div>
          </div>

          <!-- Titolo Notifica -->
          <div class="mb-2.5 text-left">
            <span class="text-caption font-weight-black text-slate-dark d-block mb-1" style="font-size: 0.68rem;">
              Titolo Notifica:
            </span>
            <v-text-field
              v-model="titoloDeployForm"
              placeholder="Titolo notifica..."
              variant="outlined"
              density="compact"
              color="orange-darken-3"
              class="custom-compact-field"
              hide-details
            ></v-text-field>
          </div>

          <!-- Note Generali -->
          <div class="mb-2.5 text-left">
            <span class="text-caption font-weight-black text-slate-dark d-block mb-1" style="font-size: 0.68rem;">
              Note di Rilascio:
            </span>
            <v-textarea
              v-model="messaggioDeployGeneraleForm"
              placeholder="Descrizione aggiornamento..."
              variant="outlined"
              density="compact"
              rows="2"
              color="orange-darken-3"
              class="custom-compact-field"
              hide-details
            ></v-textarea>
          </div>

          <v-btn
            color="orange-darken-3"
            block
            size="small"
            variant="flat"
            rounded="lg"
            class="font-weight-black text-none text-white mt-3"
            style="height: 36px; font-size: 0.76rem;"
            @click="eseguiInvioNotificaDeploy"
            :loading="inviandoDeployNotifica"
          >
            INVIA NOTIFICA DEPLOY
          </v-btn>
        </template>

        <!-- AMBIENTE 2: MESSAGGIO PRIVATO -->
        <template v-else>
          <div class="mb-2.5 text-left">
            <span class="text-caption font-weight-black text-purple-lighten-2 d-block mb-1" style="font-size: 0.68rem;">
              Seleziona Atleta Destinatario:
            </span>
            <v-select
              v-model="atletaDeployTargetForm"
              :items="listaAtletiSoloSingoli"
              placeholder="Scegli un atleta..."
              variant="outlined"
              density="compact"
              color="purple-darken-2"
              class="custom-compact-field"
              hide-details
            ></v-select>
          </div>

          <div class="mb-2.5 text-left">
            <span class="text-caption font-weight-black text-purple-lighten-2 d-block mb-1" style="font-size: 0.68rem;">
              Oggetto del Messaggio:
            </span>
            <v-text-field
              v-model="titoloDeployForm"
              placeholder="Oggetto messaggio..."
              variant="outlined"
              density="compact"
              color="purple-darken-2"
              class="custom-compact-field"
              hide-details
            ></v-text-field>
          </div>

          <div class="mb-2.5 text-left">
            <span class="text-caption font-weight-black text-purple-lighten-2 d-block mb-1" style="font-size: 0.68rem;">
              Testo del Messaggio Riservato:
            </span>
            <v-textarea
              v-model="messaggioDeployGeneraleForm"
              placeholder="Scrivi il messaggio riservato all'atleta..."
              variant="outlined"
              density="compact"
              rows="2"
              color="purple-darken-2"
              class="custom-compact-field"
              hide-details
            ></v-textarea>
          </div>

          <v-btn
            color="purple-darken-2"
            block
            size="small"
            variant="flat"
            rounded="lg"
            class="font-weight-black text-none text-white mt-3"
            style="height: 36px; font-size: 0.76rem;"
            :disabled="!atletaDeployTargetForm || atletaDeployTargetForm === 'tutti'"
            @click="eseguiInvioNotificaDeploy"
            :loading="inviandoDeployNotifica"
          >
            Invia Messaggio Privato
          </v-btn>
        </template>
      </div>

      <v-snackbar v-model="snackbarDeployShow" :color="snackbarDeployColor" timeout="4000" rounded="lg">
        {{ snackbarDeployMessage }}
      </v-snackbar>
    </v-card>

    <!-- SEZIONE 4: BACKUP & RIPRISTINO DATI -->
    <v-card 
      v-if="atletaSelezionato && schedaSelezionata"
      class="premium-card rounded-xl text-left border mb-4 animate-slide-down pa-4"
      elevation="1"
    >
      <div class="d-flex align-center mb-3">
        <v-icon color="orange-darken-3" class="mr-2" size="18">mdi-database-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-widest" style="font-size: 0.70rem;">Backup & Ripristino Scheda</span>
      </div>

      <div class="pa-3 rounded-xl inner-setting-box border-soft">
        <div class="text-left mb-3">
          <span class="text-caption font-weight-black text-slate-dark d-block">Esporta / Importa Dati Scheda</span>
          <span class="text-super-caption text-muted d-block mt-1" style="font-size: 0.64rem; line-height: 1.3; text-transform: none;">
            Esporta o importa carichi, note e completamenti per la scheda attiva (n.{{ schedaSelezionata }}).
          </span>
        </div>
        <div class="d-flex gap-2.5 flex-wrap">
          <v-btn
            color="orange-darken-3"
            variant="flat"
            size="small"
            class="font-weight-black text-none rounded-lg text-white flex-grow-1"
            prepend-icon="mdi-download"
            @click="esportaSchedaJSON"
            :loading="esportandoJSON"
            style="height: 36px; font-size: 0.74rem;"
          >
            Esporta JSON
          </v-btn>
          
          <v-btn
            color="blue-darken-3"
            variant="flat"
            size="small"
            class="font-weight-black text-none rounded-lg text-white flex-grow-1"
            prepend-icon="mdi-upload"
            @click="triggerInputFile"
            :loading="importandoJSON"
            style="height: 36px; font-size: 0.74rem;"
          >
            Importa JSON
          </v-btn>
          <input
            type="file"
            ref="inputFileRef"
            accept=".json"
            style="display: none;"
            @change="gestisciImportazioneJSON"
          />
        </div>
      </div>
    </v-card>

    <!-- SEZIONE 5: RESET DATI DI CARICO (SOLO COACH) -->
    <v-card 
      v-if="ruolo === 'coach' && atletaSelezionato && schedaSelezionata"
      class="premium-card rounded-xl text-left border mb-4 animate-slide-down pa-4"
      elevation="1"
      style="border-color: rgba(239, 68, 68, 0.3) !important;"
    >
      <div class="d-flex align-center gap-2 mb-2.5">
        <v-icon color="red-darken-1" size="22">mdi-alert-octagon-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-red-lighten-2 uppercase tracking-wide" style="font-size: 0.76rem;">
          Reset Dati di Carico
        </span>
      </div>

      <p class="text-caption text-muted mb-3.5" style="font-size: 0.70rem; line-height: 1.45;">
        Cancella irreversibilmente tutti i carichi, pesi e commenti registrati per la scheda attiva (n.{{ schedaSelezionata }}).
      </p>

      <v-btn
        color="red-darken-3"
        variant="flat"
        size="small"
        class="font-weight-black text-none rounded-lg text-white"
        style="height: 36px; font-size: 0.76rem;"
        @click="apriReset"
      >
        Resetta Master Workout
      </v-btn>
    </v-card>

    <!-- SEZIONE 6: LOGOUT -->
    <v-btn
      color="red-darken-2"
      variant="outlined"
      block
      size="medium"
      rounded="lg"
      class="font-weight-black text-none py-2 mb-6 animate-slide-down"
      style="height: 42px; font-size: 0.82rem;"
      @click="disconnettiAccount"
    >
      <v-icon left class="mr-2" size="18">mdi-logout</v-icon>
      Disconnetti Account
    </v-btn>

    <!-- Dialog Conferma Reset -->
    <v-dialog v-model="confermaReset" max-width="400" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border" style="background: var(--card-bg-dark) !important; border-color: rgba(239, 68, 68, 0.3) !important;">
        <v-card-title class="font-weight-black text-red-lighten-2 d-flex align-center px-0">
          <v-icon color="red-lighten-2" class="mr-2">mdi-alert-circle-outline</v-icon>
          Conferma Reset
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-2" style="color: var(--text-slate) !important; line-height: 1.5;">
          Sei sicuro di voler resettare <strong>tutti i dati di carico</strong> della scheda n.{{ schedaSelezionata }}?
          <br><br>
          Questa operazione è <strong class="text-red-lighten-2">irreversibile</strong>.
        </v-card-text>
        <v-card-actions class="px-0 pb-0 d-flex gap-2">
          <v-btn color="grey" variant="tonal" class="font-weight-bold flex-grow-1" rounded="lg" @click="confermaReset = false">
            Annulla
          </v-btn>
          <v-btn color="red-darken-3" variant="flat" class="font-weight-bold text-white flex-grow-1" rounded="lg" @click="eseguiReset" :loading="resetInCorso">
            Resetta Tutto
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Conferma Import -->
    <v-dialog v-model="confermaImport" max-width="450" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border" style="background: var(--card-bg-dark) !important; border-color: rgba(30, 144, 255, 0.3) !important;">
        <v-card-title class="font-weight-black text-blue-lighten-2 d-flex align-center px-0">
          <v-icon color="blue-lighten-2" class="mr-2">mdi-database-import</v-icon>
          Conferma Ripristino Dati
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-2" style="color: var(--text-slate) !important; line-height: 1.5;">
          Stai per sovrascrivere i dati correnti con il backup caricato.
          <br><br>
          Dati nel file di backup:
          <ul class="mt-2 mb-3 pl-4">
            <li>Atleta: <strong>{{ importedMetadata.atletaNome || importedMetadata.atletaId }}</strong></li>
            <li>Scheda: <strong>{{ importedMetadata.numScheda }}</strong></li>
            <li>Data backup: <strong>{{ formattaDataEsportazione(importedMetadata.timestamp) }}</strong></li>
          </ul>
          <span v-if="discrepanzaDati" class="text-red-lighten-2 font-weight-black d-block mb-3">
            ATTENZIONE: Il backup caricato non corrisponde all'atleta o alla scheda attualmente attivi (Atleta: {{ getNomeAtleta(atletaSelezionato) }}, Scheda: {{ schedaSelezionata }}).
          </span>
          Questa operazione sovrascriverà tutti i carichi, note e completamenti di questa scheda. Vuoi procedere?
        </v-card-text>
        <v-card-actions class="px-0 pb-0 d-flex gap-2">
          <v-btn color="grey" variant="tonal" class="font-weight-bold flex-grow-1" rounded="lg" @click="confermaImport = false">
            Annulla
          </v-btn>
          <v-btn color="blue-darken-3" variant="flat" class="font-weight-bold text-white flex-grow-1" rounded="lg" @click="eseguiImportazione" :loading="importInCorso">
            Ripristina
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';
import { 
  utente, 
  idCliente, 
  ruolo, 
  logout, 
  getNomeAtleta,
  selectedAthlete,
  selectedSheet,
  layoutEserciziGlobal,
  layoutDettaglioGlobal,
  timerThemeGlobal,
  comportamentoPlayGlobal,
  temaHeaderGiornoGlobal,
  ottimizzaDigitazioneGlobal,
  regolaProgressioneW2Global,
  inviaNotificaDeploy,
  ORDINE_ORIGINALE_ATLETI,
  currentTheme,
  setTheme,
  currentLightStyle,
  setLightStyle
} from '../authStore.js';

const router = useRouter();
const vuetifyTheme = useTheme();
const selectedTheme = ref(currentTheme.value);
const selectedLightStyle = ref(currentLightStyle.value);

watch(currentTheme, (val) => {
  selectedTheme.value = val;
});

watch(currentLightStyle, (val) => {
  selectedLightStyle.value = val;
});

const cambiaTemaDaImpostazioni = (newVal) => {
  setTheme(newVal, vuetifyTheme);
};

const cambiaStileChiaroDaImpostazioni = (newVal) => {
  setLightStyle(newVal);
};

// Modulo Coach Deploy Notifica
const tipoNotificaForm = ref('deploy'); // 'deploy' | 'messaggio'
const titoloDeployForm = ref('🚀 Nuovo Aggiornamento!');
const messaggioDeployGeneraleForm = ref('Nuova versione disponibile con miglioramenti.');
const atletaDeployTargetForm = ref('tutti');
const notaDeployPersonalizzataForm = ref('');
const inviandoDeployNotifica = ref(false);
const snackbarDeployShow = ref(false);
const snackbarDeployMessage = ref('');
const snackbarDeployColor = ref('success');

watch(tipoNotificaForm, (nuovoTipo) => {
  if (nuovoTipo === 'messaggio') {
    titoloDeployForm.value = '💬 Messaggio dal Coach';
    messaggioDeployGeneraleForm.value = '';
    if (atletaDeployTargetForm.value === 'tutti' && ORDINE_ORIGINALE_ATLETI.length > 0) {
      atletaDeployTargetForm.value = String(ORDINE_ORIGINALE_ATLETI[0]);
    }
  } else {
    titoloDeployForm.value = '🚀 Nuovo Aggiornamento!';
    messaggioDeployGeneraleForm.value = 'Nuova versione disponibile con miglioramenti.';
    atletaDeployTargetForm.value = 'tutti';
  }
});

// Computed per la lista atleti esclusiva dei messaggi individuali (SENZA "Tutti gli Atleti")
const listaAtletiSoloSingoli = computed(() => {
  const items = [];
  ORDINE_ORIGINALE_ATLETI.forEach(id => {
    const nome = getNomeAtleta(id);
    if (nome) {
      items.push({
        title: `${nome} (ID: ${id})`,
        value: String(id)
      });
    }
  });
  return items;
});

const getNomeAtletaTarget = (id) => {
  if (!id || id === 'tutti') return '';
  const nome = getNomeAtleta(id);
  return nome ? nome.toUpperCase() : `ATLETA #${id}`;
};

const eseguiInvioNotificaDeploy = async () => {
  try {
    inviandoDeployNotifica.value = true;
    const payload = {
      tipo: tipoNotificaForm.value,
      titolo: titoloDeployForm.value,
      message_general: messaggioDeployGeneraleForm.value,
      target_atleta_id: atletaDeployTargetForm.value !== 'tutti' ? atletaDeployTargetForm.value : null,
      notes_per_athlete: {}
    };
    if (atletaDeployTargetForm.value !== 'tutti' && notaDeployPersonalizzataForm.value.trim()) {
      payload.notes_per_athlete[atletaDeployTargetForm.value] = notaDeployPersonalizzataForm.value.trim();
    }
    await inviaNotificaDeploy(payload);
    snackbarDeployColor.value = 'success';
    snackbarDeployMessage.value = payload.tipo === 'messaggio' 
      ? "💬 Messaggio inviato in tempo reale!" 
      : "🚀 Notifica Deploy inviata in tempo reale a tutti gli utenti!";
    snackbarDeployShow.value = true;
  } catch (err) {
    console.error("Errore invio notifica deploy:", err);
    snackbarDeployColor.value = 'error';
    snackbarDeployMessage.value = "Errore nell'invio notifica: " + (err.message || 'Controlla i permessi di rete');
    snackbarDeployShow.value = true;
  } finally {
    inviandoDeployNotifica.value = false;
  }
};

// Refs locali collegati ai globali
const atletaSelezionato = ref(selectedAthlete.value);
const schedaSelezionata = ref(selectedSheet.value);

// Sync con store globale
watch(selectedAthlete, (v) => { atletaSelezionato.value = v; });
watch(selectedSheet, (v) => { schedaSelezionata.value = v; });

// Layout refs (collegati direttamente ai global refs)
const layoutEsercizi = layoutEserciziGlobal;
const layoutDettaglio = layoutDettaglioGlobal;
const timerTheme = timerThemeGlobal;
const temaHeaderGiorno = temaHeaderGiornoGlobal;

// Refs salvati in localStorage
const defaultBilanciere = ref(parseFloat(localStorage.getItem('woapp_default_bilanciere') || '20'));
const vibrazioneAttiva = ref(localStorage.getItem('woapp_vibrazione_attiva') !== 'false');
const comportamentoPlay = comportamentoPlayGlobal;
const defaultTimerRec = ref(parseInt(localStorage.getItem('woapp_default_timer_rec') || '90', 10));

const getActiveAtletaId = () => {
  return selectedAthlete.value || idCliente.value || '';
};

const modalitaIncrementoGhost = ref('ibrida');
const stileVisualizzazioneGhost = ref(localStorage.getItem('stileVisualizzazioneGhost_' + getActiveAtletaId()) || 'range');
const ghostPRAttackAttivo = ref(localStorage.getItem('ghostPRAttackAttivo_' + getActiveAtletaId()) !== 'false');
const ghostAutoregolazioneRepsAttiva = ref(localStorage.getItem('ghostAutoregolazioneRepsAttiva_' + getActiveAtletaId()) !== 'false');
const sfidaRecordWeek1 = ref(localStorage.getItem('sfidaRecordWeek1_' + getActiveAtletaId()) === 'true');
const ottimizzaDigitazione = ottimizzaDigitazioneGlobal;
const regolaProgressioneW2 = regolaProgressioneW2Global;

// Salvataggio automatico al cambio
watch(layoutEsercizi, (newVal) => {
  localStorage.setItem('woapp_layout_esercizi', newVal);
});
watch(layoutDettaglio, (newVal) => {
  localStorage.setItem('woapp_layout_dettaglio', newVal);
});
watch(defaultBilanciere, (newVal) => {
  localStorage.setItem('woapp_default_bilanciere', String(newVal));
});
watch(vibrazioneAttiva, (newVal) => {
  localStorage.setItem('woapp_vibrazione_attiva', String(newVal));
});
watch(comportamentoPlay, (newVal) => {
  localStorage.setItem('woapp_comportamento_play', newVal);
});
watch(defaultTimerRec, (newVal) => {
  localStorage.setItem('woapp_default_timer_rec', String(newVal));
});
watch(timerTheme, (newVal) => {
  localStorage.setItem('woapp_timer_theme', newVal);
});

// Sincronizzazione Ghost Settings
watch([selectedAthlete, idCliente], () => {
  const atletaId = getActiveAtletaId();
  modalitaIncrementoGhost.value = 'ibrida';
  stileVisualizzazioneGhost.value = localStorage.getItem('stileVisualizzazioneGhost_' + atletaId) || 'range';
  ghostPRAttackAttivo.value = localStorage.getItem('ghostPRAttackAttivo_' + atletaId) !== 'false';
  ghostAutoregolazioneRepsAttiva.value = localStorage.getItem('ghostAutoregolazioneRepsAttiva_' + atletaId) !== 'false';
  sfidaRecordWeek1.value = localStorage.getItem('sfidaRecordWeek1_' + atletaId) === 'true';
});

watch(stileVisualizzazioneGhost, (newVal) => {
  localStorage.setItem('stileVisualizzazioneGhost_' + getActiveAtletaId(), newVal);
});
watch(ghostPRAttackAttivo, (newVal) => {
  localStorage.setItem('ghostPRAttackAttivo_' + getActiveAtletaId(), String(newVal));
});
watch(ghostAutoregolazioneRepsAttiva, (newVal) => {
  localStorage.setItem('ghostAutoregolazioneRepsAttiva_' + getActiveAtletaId(), String(newVal));
});
watch(sfidaRecordWeek1, (newVal) => {
  localStorage.setItem('sfidaRecordWeek1_' + getActiveAtletaId(), String(newVal));
});

const vibraTattile = (ms = 12) => {
  if (localStorage.getItem('woapp_vibrazione_attiva') === 'false') return;
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Logout
const disconnettiAccount = async () => {
  vibraTattile(15);
  await logout();
  router.push({ name: 'Login' });
};

// Reset
const confermaReset = ref(false);
const resetInCorso = ref(false);

const apriReset = () => {
  vibraTattile(15);
  confermaReset.value = true;
};

const eseguiReset = async () => {
  if (!atletaSelezionato.value || !schedaSelezionata.value) return;
  
  resetInCorso.value = true;
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', atletaSelezionato.value),
      where('num_scheda', '==', String(schedaSelezionata.value))
    );
    const snap = await getDocs(q);
    
    const batch = writeBatch(db);
    const campiDaCancellare = [
      'num_peso_w1', 'num_peso_w2', 'num_peso_w3', 'num_peso_w4', 'num_peso_w5', 'num_peso_w6',
      'des_commento_w1', 'des_commento_w2', 'des_commento_w3', 'des_commento_w4', 'des_commento_w5', 'des_commento_w6',
      'flg_fatto_w1', 'flg_fatto_w2', 'flg_fatto_w3', 'flg_fatto_w4', 'flg_fatto_w5', 'flg_fatto_w6',
      'num_feeling_w1', 'num_feeling_w2', 'num_feeling_w3', 'num_feeling_w4', 'num_feeling_w5', 'num_feeling_w6',
      'des_inizio_w1', 'des_inizio_w2', 'des_inizio_w3', 'des_inizio_w4', 'des_inizio_w5', 'des_inizio_w6',
      'des_fine_w1', 'des_fine_w2', 'des_fine_w3', 'des_fine_w4', 'des_fine_w5', 'des_fine_w6'
    ];
    
    snap.forEach((docSnap) => {
      const update = {};
      campiDaCancellare.forEach(campo => {
        update[campo] = '';
      });
      batch.update(docSnap.ref, update);
    });
    
    await batch.commit();
    confermaReset.value = false;
  } catch (err) {
    console.error("Errore durante il reset:", err);
  } finally {
    resetInCorso.value = false;
  }
};

// Backup & Ripristino JSON
const esportandoJSON = ref(false);
const importandoJSON = ref(false);
const confermaImport = ref(false);
const importInCorso = ref(false);
const discrepanzaDati = ref(false);
const inputFileRef = ref(null);

const importedMetadata = ref({
  atletaId: '',
  atletaNome: '',
  numScheda: '',
  timestamp: ''
});

let datiStoryboardDaImportare = [];

const esportaSchedaJSON = async () => {
  if (!atletaSelezionato.value || !schedaSelezionata.value) return;
  vibraTattile(12);
  esportandoJSON.value = true;
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', atletaSelezionato.value),
      where('num_scheda', '==', String(schedaSelezionata.value))
    );
    const snap = await getDocs(q);
    const dataList = [];
    
    snap.forEach(docSnap => {
      let item = { id: docSnap.id, ...docSnap.data() };
      
      // APPLICHIAMO LE MODIFICHE LOCALI (Il salvataggio offline del telefono!)
      const key1 = `offline_storyboard_${item.id}`;
      const key2 = `offline_storyboard_${item.num_riga}`;
      const localData1 = localStorage.getItem(key1);
      const localData2 = localStorage.getItem(key2);
      
      let updates = {};
      let localTimestamp = null;
      
      if (localData1) {
        try {
          const parsed = JSON.parse(localData1);
          if (parsed.timestamp) localTimestamp = parsed.timestamp;
          updates = { ...updates, ...parsed };
        } catch (e) {}
      }
      if (localData2) {
        try {
          const parsed = JSON.parse(localData2);
          if (parsed.timestamp && (!localTimestamp || parsed.timestamp > localTimestamp)) {
            localTimestamp = parsed.timestamp;
          }
          updates = { ...updates, ...parsed };
        } catch (e) {}
      }
      
      // Se il dato sul server fosse più nuovo, ignora la cache (ma in questo caso vince la cache)
      if (localTimestamp && item.timestamp && localTimestamp < item.timestamp) {
        updates = {}; 
      }
      
      // Uniamo il documento del server con i pesi salvati sul telefono
      dataList.push({ ...item, ...updates });
    });
    
    const backupData = {
      atletaId: atletaSelezionato.value,
      atletaNome: getNomeAtleta(atletaSelezionato.value),
      numScheda: schedaSelezionata.value,
      timestamp: new Date().toISOString(),
      datiStoryboard: dataList
    };

    const jsonString = JSON.stringify(backupData, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const nomeAtletaClean = (getNomeAtleta(atletaSelezionato.value) || 'Atleta').replace(/\s+/g, '_');
    link.href = url;
    link.download = `Backup_Scheda_${schedaSelezionata.value}_${nomeAtletaClean}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (err) {
    console.error("Errore durante l'esportazione:", err);
    alert("Errore durante l'esportazione: " + err.message);
  } finally {
    esportandoJSON.value = false;
  }
};

const triggerInputFile = () => {
  vibraTattile(12);
  if (inputFileRef.value) {
    inputFileRef.value.click();
  }
};

const gestisciImportazioneJSON = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const imported = JSON.parse(e.target.result);
      if (!imported.atletaId || !imported.numScheda || !Array.isArray(imported.datiStoryboard)) {
        alert("File JSON non valido. Assicurati che sia un file di backup generato da FlexCoach.");
        return;
      }

      importedMetadata.value = {
        atletaId: imported.atletaId,
        atletaNome: imported.atletaNome || '',
        numScheda: imported.numScheda,
        timestamp: imported.timestamp || ''
      };

      datiStoryboardDaImportare = imported.datiStoryboard;
      
      // Controlla discrepanza
      discrepanzaDati.value = (imported.atletaId !== atletaSelezionato.value) || 
                              (String(imported.numScheda) !== String(schedaSelezionata.value));

      confermaImport.value = true;
    } catch (err) {
      alert("Errore nel parsing del file JSON: " + err.message);
    } finally {
      event.target.value = ''; // Reset input file
    }
  };
  reader.readAsText(file);
};

const fieldsToRestore = [
  'ins_week1', 'ins_week2', 'ins_week3', 'ins_week4', 'ins_week5', 'ins_week6',
  'reps_week1', 'reps_week2', 'reps_week3', 'reps_week4', 'reps_week5', 'reps_week6',
  'cmp1', 'cmp2', 'cmp3', 'cmp4', 'cmp5', 'cmp6',
  'timestamp', 'timestamp_ute',
  'start_wo', 'end_wo', 'start2_wo', 'end2_wo', 'start3_wo', 'end3_wo', 'start4_wo', 'end4_wo', 'start5_wo', 'end5_wo', 'start6_wo', 'end6_wo',
  'num_faticaw6', 'des_commenti', 'ind_reps_start',
  'perc_irt_w1', 'perc_irt_w2', 'perc_irt_w3', 'perc_irt_w4', 'perc_irt_w5', 'perc_irt_w6',
  'num_ins6', 'num_peso_bilanciere'
];

const eseguiImportazione = async () => {
  if (!atletaSelezionato.value || !schedaSelezionata.value || datiStoryboardDaImportare.length === 0) return;
  importInCorso.value = true;
  vibraTattile(20);
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', atletaSelezionato.value),
      where('num_scheda', '==', String(schedaSelezionata.value))
    );
    const snap = await getDocs(q);
    
    const batch = writeBatch(db);
    let count = 0;

    snap.forEach((docSnap) => {
      const currentData = docSnap.data();
      
      const matched = datiStoryboardDaImportare.find(b => 
        b.id === docSnap.id || 
        (String(b.des_giorno).trim().toUpperCase() === String(currentData.des_giorno).trim().toUpperCase() &&
         parseInt(b.num_riga_giorno) === parseInt(currentData.num_riga_giorno))
      );

      if (matched) {
        const updateObj = {};
        fieldsToRestore.forEach(field => {
          if (matched[field] !== undefined) {
            updateObj[field] = matched[field];
          }
        });
        batch.update(docSnap.ref, updateObj);
        count++;
      }
    });

    await batch.commit();
    alert(`Importazione completata con successo! Ripristinati ${count} record.`);
    confermaImport.value = false;
  } catch (err) {
    console.error("Errore durante il ripristino:", err);
    alert("Errore durante il ripristino dei dati: " + err.message);
  } finally {
    importInCorso.value = false;
  }
};

const formattaDataEsportazione = (isoString) => {
  if (!isoString) return '-';
  try {
    const d = new Date(isoString);
    return d.toLocaleString('it-IT');
  } catch (e) {
    return isoString;
  }
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

.text-slate-dark {
  color: #f8fafc;
}

.text-slate {
  color: #cbd5e1;
}

.text-muted {
  color: #94a3b8;
}

:deep([data-theme="light"]) .text-slate-dark,
[data-theme="light"] .text-slate-dark {
  color: var(--text-dark) !important;
}

:deep([data-theme="light"]) .text-slate,
[data-theme="light"] .text-slate {
  color: var(--text-slate) !important;
}

:deep([data-theme="light"]) .text-muted,
[data-theme="light"] .text-muted {
  color: var(--text-muted) !important;
}

.text-super-caption {
  font-size: 0.65rem !important;
  letter-spacing: 0.08em;
}

.uppercase {
  text-transform: uppercase;
}

.border-soft {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-right-soft {
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.border-orange {
  border: 1px solid rgba(249, 115, 22, 0.25) !important;
}

.card-glass {
  background: var(--card-bg-glass) !important;
  backdrop-filter: blur(10px);
}

.premium-header {
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.premium-card {
  background: var(--card-bg-glass) !important;
  border-color: var(--card-border) !important;
}

.profile-avatar {
  border: 1.5px solid rgba(249, 115, 22, 0.5) !important;
}

.glowing-accent {
  position: absolute;
  top: -30px;
  right: -30px;
  width: 100px;
  height: 100px;
  background: radial-gradient(circle, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0) 70%);
  pointer-events: none;
}

.caution-panel {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(239, 68, 68, 0.03)) !important;
  border: 1px solid rgba(239, 68, 68, 0.25) !important;
}

.animate-slide-down {
  animation: slideDown 0.4s ease-out;
}

.inner-setting-box {
  background: var(--card-bg-soft) !important;
}

:deep([data-theme="light"]) .inner-setting-box,
[data-theme="light"] .inner-setting-box {
  background: var(--card-bg-soft) !important;
  border: 1px solid var(--card-border) !important;
}

:deep([data-theme="light"]) .v-btn-toggle .v-btn:not(.v-btn--selected),
[data-theme="light"] .v-btn-toggle .v-btn:not(.v-btn--selected) {
  color: var(--text-dark) !important;
}

.custom-compact-field :deep(.v-field__input),
.custom-compact-field :deep(input),
.custom-compact-field :deep(textarea) {
  font-size: 0.78rem !important;
}
.custom-compact-field :deep(.v-label) {
  font-size: 0.72rem !important;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
