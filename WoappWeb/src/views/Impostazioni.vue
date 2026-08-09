<template>
  <v-container 
    class="px-3 max-width-container min-height-screen pb-6 pt-1"
    :class="layoutEserciziGlobal === 'super_compatto' ? 'py-1' : 'py-1.5'"
  >
    <!-- Header Compatto -->
    <div class="d-flex align-center justify-space-between px-0.5 mb-2 animate-slide-down">
      <div class="d-flex align-center">
        <v-icon color="orange-darken-3" class="mr-1.5" size="17">mdi-cog</v-icon>
        <h1 class="text-subtitle-2 font-weight-black text-slate-dark tracking-tight leading-none" style="font-size: 0.88rem; letter-spacing: -0.01em;">Impostazioni</h1>
      </div>
    </div>

    <!-- SEZIONE 1: PROFILO UTENTE (COMPATTO 1 RIGA) -->
    <v-card 
      class="premium-card rounded-xl text-left border position-relative overflow-hidden mb-2.5 animate-slide-down pa-3"
      elevation="1"
    >
      <div class="glowing-accent"></div>
      
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center min-width-0">
          <v-avatar size="36" color="orange-darken-4" class="mr-2.5 border-orange text-white font-weight-black elevation-1 flex-shrink-0">
            {{ getNomeAtleta(idCliente) ? getNomeAtleta(idCliente).charAt(0).toUpperCase() : (ruolo === 'coach' ? 'C' : 'A') }}
          </v-avatar>
          <div class="text-left min-width-0">
            <div class="text-body-2 font-weight-black text-slate-dark text-truncate leading-snug">
              {{ ruolo === 'coach' ? 'Coach' : (getNomeAtleta(idCliente) || 'Atleta') }}
            </div>
            <div class="text-caption text-muted text-truncate" style="font-size: 0.72rem; line-height: 1.2;">
              {{ utente?.email || 'Non disponibile' }}
            </div>
          </div>
        </div>

        <div class="d-flex align-center gap-1 flex-shrink-0 ml-2">
          <v-chip color="orange-darken-3" size="x-small" class="font-weight-black text-white" variant="flat" style="font-size: 0.65rem; height: 20px;">
            {{ ruolo === 'coach' ? 'Coach' : 'Atleta' }}
          </v-chip>
          <span v-if="idCliente && idCliente !== 'N/D'" class="text-super-caption text-muted font-weight-bold ml-1" style="font-size: 0.65rem;">
            #{{ idCliente }}
          </span>
        </div>
      </div>
    </v-card>

    <!-- SEZIONE 2: TEMA & ASPETTO -->
    <v-card 
      class="premium-card rounded-xl text-left border mb-2.5 animate-slide-down pa-3"
      elevation="1"
    >
      <div class="d-flex align-center mb-2.5">
        <v-icon color="orange-darken-3" class="mr-2" size="17">mdi-palette-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-wide" style="font-size: 0.72rem;">Tema & Aspetto</span>
      </div>

      <v-btn-toggle
        v-model="selectedTheme"
        mandatory
        selected-class="bg-orange-darken-3 text-white"
        density="compact"
        rounded="lg"
        class="w-100 card-glass border mb-1"
        style="height: 32px;"
        @update:model-value="cambiaTemaDaImpostazioni"
      >
        <v-btn value="dark" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 50%;">
          <v-icon class="mr-1" size="14">mdi-weather-night</v-icon> Scuro
        </v-btn>
        <v-btn value="light" class="font-weight-bold flex-grow-1" style="font-size: 0.65rem; min-width: 50%;">
          <v-icon class="mr-1" size="14">mdi-white-balance-sunny</v-icon> Chiaro
        </v-btn>
      </v-btn-toggle>

      <!-- Variante Tema Chiaro -->
      <div v-if="selectedTheme === 'light'" class="mt-2.5 pt-2 border-top-soft">
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Stile Chiaro</span>
        <v-btn-toggle
          v-model="selectedLightStyle"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 32px;"
          @update:model-value="cambiaStileChiaroDaImpostazioni"
        >
          <v-btn value="slate" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Slate</v-btn>
          <v-btn value="chalk" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Chalk</v-btn>
          <v-btn value="sand" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Sand</v-btn>
        </v-btn-toggle>
      </div>
    </v-card>

    <!-- SEZIONE 3: LAYOUT & INTERFACCIA -->
    <v-card 
      class="premium-card rounded-xl text-left border mb-2.5 animate-slide-down pa-3"
      elevation="1"
    >
      <div class="d-flex align-center mb-2.5">
        <v-icon color="orange-darken-3" class="mr-2" size="17">mdi-view-dashboard-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-wide" style="font-size: 0.72rem;">Layout & Interfaccia</span>
      </div>

      <!-- Layout Lista -->
      <div class="mb-2.5">
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Layout Lista</span>
        <v-btn-toggle
          v-model="layoutEsercizi"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 32px;"
        >
          <v-btn value="super_compatto" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Super</v-btn>
          <v-btn value="compatto" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Compatto</v-btn>
          <v-btn value="standard" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Standard</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Layout Dettaglio -->
      <div class="mb-2.5">
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Layout Dettaglio</span>
        <v-btn-toggle
          v-model="layoutDettaglio"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 32px;"
        >
          <v-btn value="auto" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Auto</v-btn>
          <v-btn value="super_compatto" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Super</v-btn>
          <v-btn value="compatto" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Compatto</v-btn>
          <v-btn value="standard" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Standard</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Tasto Play -->
      <div class="mb-2.5">
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Tasto Play</span>
        <v-btn-toggle
          v-model="comportamentoPlay"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 32px;"
        >
          <v-btn value="auto" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Auto</v-btn>
          <v-btn value="dettaglio" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Dettaglio</v-btn>
          <v-btn value="evidenzia" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Evidenzia</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Colore Giorni Workout -->
      <div>
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Colore Giorni</span>
        <v-btn-toggle
          v-model="temaHeaderGiorno"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 32px;"
        >
          <v-btn value="arancio" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Arancio</v-btn>
          <v-btn value="blu" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Blu</v-btn>
          <v-btn value="verde" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Verde</v-btn>
        </v-btn-toggle>
      </div>
    </v-card>

    <!-- SEZIONE 4: PARAMETRI ALLENAMENTO -->
    <v-card 
      class="premium-card rounded-xl text-left border mb-2.5 animate-slide-down pa-3"
      elevation="1"
    >
      <div class="d-flex align-center mb-2.5">
        <v-icon color="orange-darken-3" class="mr-2" size="17">mdi-dumbbell</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-wide" style="font-size: 0.72rem;">Parametri Allenamento</span>
      </div>

      <div class="d-flex flex-column gap-1.5">
        <!-- Bilanciere Default -->
        <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
          <span class="text-caption font-weight-bold text-slate-dark pr-2" style="font-size: 0.72rem;">Bilanciere Default</span>
          <div style="width: 140px; flex-shrink: 0;">
            <v-select
              v-model="defaultBilanciere"
              :items="[
                { title: '20 kg (Olimpico)', value: 20 },
                { title: '15 kg (Femminile)', value: 15 },
                { title: '12 kg (Leggero)', value: 12 },
                { title: '10 kg (Junior)', value: 10 },
                { title: '0 kg (Libero)', value: 0 }
              ]"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              color="primary"
              class="ultra-compact-select"
            ></v-select>
          </div>
        </div>

        <!-- Vibrazione Tattile -->
        <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
          <span class="text-caption font-weight-bold text-slate-dark" style="font-size: 0.72rem;">Vibrazione Tattile</span>
          <div class="compact-switch">
            <v-switch
              v-model="vibrazioneAttiva"
              color="primary"
              hide-details
              density="compact"
            ></v-switch>
          </div>
        </div>

        <!-- Recupero Default -->
        <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
          <span class="text-caption font-weight-bold text-slate-dark pr-2" style="font-size: 0.72rem;">Recupero Default</span>
          <div style="width: 140px; flex-shrink: 0;">
            <v-select
              v-model="defaultTimerRec"
              :items="[
                { title: '45s', value: 45 },
                { title: '60s (1m)', value: 60 },
                { title: '90s (1m 30s)', value: 90 },
                { title: '120s (2m)', value: 120 },
                { title: '150s (2m 30s)', value: 150 },
                { title: '180s (3m)', value: 180 }
              ]"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              color="primary"
              class="ultra-compact-select"
            ></v-select>
          </div>
        </div>

        <!-- Tema Timer -->
        <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
          <span class="text-caption font-weight-bold text-slate-dark pr-2" style="font-size: 0.72rem;">Tema Timer</span>
          <div style="width: 140px; flex-shrink: 0;">
            <v-select
              v-model="timerTheme"
              :items="[
                { title: 'Dark & Glass', value: 'accent-dark' },
                { title: 'Orange Glow', value: 'orange-glow' },
                { title: 'Solid Contrast', value: 'solid-contrast' }
              ]"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              color="primary"
              class="ultra-compact-select"
            ></v-select>
          </div>
        </div>

        <v-divider class="my-2 border-soft" style="opacity: 0.2;"></v-divider>

        <!-- Suggerimenti Ghost -->
        <div>
          <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Suggerimenti Ghost</span>
          <v-btn-toggle
            v-model="stileVisualizzazioneGhost"
            mandatory
            selected-class="bg-orange-darken-3 text-white"
            density="compact"
            rounded="lg"
            class="w-100 card-glass border mb-2"
            style="height: 32px;"
          >
            <v-btn value="range" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Solo Range</v-btn>
            <v-btn value="forma" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Stato Forma</v-btn>
          </v-btn-toggle>
          
          <div class="d-flex flex-column gap-1.5 rounded-xl pa-2.5 inner-setting-box border-soft">
            <!-- Attacco al Record (PR) -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <span class="text-caption font-weight-bold text-amber-lighten-2" style="font-size: 0.72rem;">Attacco Record (PR)</span>
              <div class="compact-switch">
                <v-switch
                  v-model="ghostPRAttackAttivo"
                  color="amber-darken-2"
                  hide-details
                  density="compact"
                ></v-switch>
              </div>
            </div>
            
            <v-divider class="border-soft" style="opacity: 0.2;"></v-divider>
            
            <!-- Autoregolazione Reps -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <span class="text-caption font-weight-bold text-green-accent-3" style="font-size: 0.72rem;">Autoregolazione Reps</span>
              <div class="compact-switch">
                <v-switch
                  v-model="ghostAutoregolazioneRepsAttiva"
                  color="green-darken-2"
                  hide-details
                  density="compact"
                ></v-switch>
              </div>
            </div>

            <v-divider class="border-soft" style="opacity: 0.2;"></v-divider>
            
            <!-- Sfida Record Week 1 -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <span class="text-caption font-weight-bold text-orange-lighten-2" style="font-size: 0.72rem;">Sfida Record in W1</span>
              <div class="compact-switch">
                <v-switch
                  v-model="sfidaRecordWeek1"
                  color="orange-darken-3"
                  hide-details
                  density="compact"
                ></v-switch>
              </div>
            </div>

            <v-divider class="border-soft" style="opacity: 0.2;"></v-divider>
            
            <!-- Ottimizza Digitazione Note -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <span class="text-caption font-weight-bold text-orange-lighten-2" style="font-size: 0.72rem;">Ottimizza Note</span>
              <div class="compact-switch">
                <v-switch
                  v-model="ottimizzaDigitazione"
                  color="orange-darken-3"
                  hide-details
                  density="compact"
                ></v-switch>
              </div>
            </div>

            <v-divider class="border-soft" style="opacity: 0.2;"></v-divider>

            <!-- Regola Progressione Week 2 -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <span class="text-caption font-weight-bold text-orange-lighten-2 pr-2" style="font-size: 0.72rem;">Progressione W2</span>
              <div style="width: 140px; flex-shrink: 0;">
                <v-select
                  v-model="regolaProgressioneW2"
                  :items="[
                    { title: 'Peso (+Step)', value: 'peso' },
                    { title: 'Testo \'Aumenta\'', value: 'scritta' }
                  ]"
                  variant="outlined"
                  density="compact"
                  hide-details
                  rounded="lg"
                  color="orange-darken-3"
                  class="ultra-compact-select"
                ></v-select>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- SEZIONE 5: NOTIFICA DEPLOY / MESSAGGIO (SOLO COACH) -->
    <v-card 
      v-if="ruolo === 'coach'"
      class="premium-card rounded-xl text-left border mb-2.5 animate-slide-down pa-3"
      elevation="1"
      :style="{ borderColor: tipoNotificaForm === 'deploy' ? 'var(--theme-primary-border) !important' : 'rgba(168, 85, 247, 0.5) !important' }"
    >
      <div class="d-flex align-center justify-space-between mb-2.5">
        <div class="d-flex align-center gap-1.5">
          <v-icon :color="tipoNotificaForm === 'deploy' ? 'primary' : 'purple-darken-1'" size="17">
            {{ tipoNotificaForm === 'deploy' ? 'mdi-rocket-launch-outline' : 'mdi-comment-text-outline' }}
          </v-icon>
          <span class="text-subtitle-2 font-weight-black uppercase tracking-wide" :class="tipoNotificaForm === 'deploy' ? 'text-theme-primary' : 'text-purple-lighten-2'" style="font-size: 0.72rem;">
            {{ tipoNotificaForm === 'deploy' ? 'Notifica Deploy' : 'Messaggio Privato' }}
          </span>
        </div>
        <v-chip :color="tipoNotificaForm === 'deploy' ? 'primary' : 'purple-darken-2'" size="x-small" variant="flat" class="font-weight-black text-white" style="font-size: 0.55rem; height: 18px;">
          COACH
        </v-chip>
      </div>

      <div class="pa-2.5 rounded-xl inner-setting-box border-soft">
        <div class="mb-2.5">
          <v-btn-toggle
            v-model="tipoNotificaForm"
            mandatory
            density="compact"
            rounded="lg"
            class="w-100 card-glass border overflow-hidden"
            style="height: 32px;"
          >
            <v-btn 
              value="deploy" 
              class="font-weight-black flex-grow-1 text-none"
              :class="tipoNotificaForm === 'deploy' ? 'bg-theme-primary text-white' : 'text-slate-dark'"
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
          <div class="mb-2 text-left">
            <span class="text-caption font-weight-bold text-slate-dark d-block mb-1" style="font-size: 0.65rem;">Titolo Notifica</span>
            <v-text-field
              v-model="titoloDeployForm"
              placeholder="Titolo..."
              variant="outlined"
              density="compact"
              color="primary"
              class="custom-compact-field"
              hide-details
            ></v-text-field>
          </div>

          <div class="mb-2 text-left">
            <span class="text-caption font-weight-bold text-slate-dark d-block mb-1" style="font-size: 0.65rem;">Note Rilascio</span>
            <v-textarea
              v-model="messaggioDeployGeneraleForm"
              placeholder="Descrizione..."
              variant="outlined"
              density="compact"
              rows="2"
              color="primary"
              class="custom-compact-field"
              hide-details
            ></v-textarea>
          </div>

          <v-btn
            color="primary"
            block
            size="small"
            variant="flat"
            rounded="lg"
            class="font-weight-black text-none text-white mt-2"
            style="height: 32px; font-size: 0.72rem;"
            @click="eseguiInvioNotificaDeploy"
            :loading="inviandoDeployNotifica"
          >
            INVIA NOTIFICA DEPLOY
          </v-btn>
        </template>

        <!-- AMBIENTE 2: MESSAGGIO PRIVATO -->
        <template v-else>
          <div class="mb-2 text-left">
            <span class="text-caption font-weight-bold text-purple-lighten-2 d-block mb-1" style="font-size: 0.65rem;">Atleta Destinatario</span>
            <v-select
              v-model="atletaDeployTargetForm"
              :items="listaAtletiSoloSingoli"
              placeholder="Scegli atleta..."
              variant="outlined"
              density="compact"
              color="purple-darken-2"
              class="custom-compact-field"
              hide-details
            ></v-select>
          </div>

          <div class="mb-2 text-left">
            <span class="text-caption font-weight-bold text-purple-lighten-2 d-block mb-1" style="font-size: 0.65rem;">Oggetto</span>
            <v-text-field
              v-model="titoloDeployForm"
              placeholder="Oggetto..."
              variant="outlined"
              density="compact"
              color="purple-darken-2"
              class="custom-compact-field"
              hide-details
            ></v-text-field>
          </div>

          <div class="mb-2 text-left">
            <span class="text-caption font-weight-bold text-purple-lighten-2 d-block mb-1" style="font-size: 0.65rem;">Testo Messaggio</span>
            <v-textarea
              v-model="messaggioDeployGeneraleForm"
              placeholder="Scrivi messaggio..."
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
            class="font-weight-black text-none text-white mt-2"
            style="height: 32px; font-size: 0.72rem;"
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

    <!-- SEZIONE 6: BACKUP & RIPRISTINO DATI -->
    <v-card 
      v-if="atletaSelezionato && schedaSelezionata"
      class="premium-card rounded-xl text-left border mb-2.5 animate-slide-down pa-3"
      elevation="1"
    >
      <div class="d-flex align-center mb-2.5">
        <v-icon color="orange-darken-3" class="mr-2" size="17">mdi-database-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-wide" style="font-size: 0.72rem;">Backup & Ripristino (Scheda {{ schedaSelezionata }})</span>
      </div>

      <div class="d-flex gap-2">
        <v-btn
          color="orange-darken-3"
          variant="flat"
          size="small"
          class="font-weight-black text-none rounded-lg text-white flex-grow-1"
          prepend-icon="mdi-download"
          @click="esportaSchedaJSON"
          :loading="esportandoJSON"
          style="height: 32px; font-size: 0.72rem;"
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
          style="height: 32px; font-size: 0.72rem;"
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
    </v-card>

    <!-- SEZIONE 7: RESET DATI CARICO (SOLO COACH) -->
    <v-card 
      v-if="ruolo === 'coach' && atletaSelezionato && schedaSelezionata"
      class="premium-card rounded-xl text-left border mb-2.5 animate-slide-down pa-3"
      elevation="1"
      style="border-color: rgba(239, 68, 68, 0.3) !important;"
    >
      <div class="d-flex align-center justify-space-between">
        <div class="d-flex align-center gap-1.5">
          <v-icon color="red-darken-1" size="17">mdi-alert-octagon-outline</v-icon>
          <span class="text-subtitle-2 font-weight-black text-red-lighten-2 uppercase tracking-wide" style="font-size: 0.72rem;">
            Reset Carichi (Scheda {{ schedaSelezionata }})
          </span>
        </div>
        <v-btn
          color="red-darken-3"
          variant="flat"
          size="x-small"
          class="font-weight-black text-none rounded-lg text-white"
          style="height: 28px; font-size: 0.70rem;"
          @click="apriReset"
        >
          Resetta
        </v-btn>
      </div>
    </v-card>

    <!-- SEZIONE 8: LOGOUT -->
    <v-btn
      color="red-darken-2"
      variant="outlined"
      block
      size="small"
      rounded="lg"
      class="font-weight-black text-none py-1 mb-4 animate-slide-down"
      style="height: 36px; font-size: 0.76rem;"
      @click="disconnettiAccount"
    >
      <v-icon left class="mr-1.5" size="16">mdi-logout</v-icon>
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

/* Ultra Compact Select Dropdowns for Settings */
.ultra-compact-select {
  height: 28px !important;
}
.ultra-compact-select :deep(.v-field) {
  min-height: 28px !important;
  height: 28px !important;
  border-radius: 8px !important;
  padding-inline-start: 8px !important;
  padding-inline-end: 4px !important;
  box-shadow: none !important;
}
.ultra-compact-select :deep(.v-field__input) {
  min-height: 28px !important;
  height: 28px !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
  font-size: 0.70rem !important;
  align-items: center !important;
  line-height: 28px !important;
}
.ultra-compact-select :deep(.v-field__append-inner) {
  padding-top: 0 !important;
  align-items: center !important;
  height: 28px !important;
}
.ultra-compact-select :deep(.v-field__append-inner .v-icon) {
  font-size: 14px !important;
  opacity: 0.7;
}

/* Compact Switch Alignment */
.compact-switch {
  display: flex !important;
  align-items: center !important;
  justify-content: flex-end !important;
  height: 28px !important;
}
.compact-switch :deep(.v-selection-control) {
  min-height: 28px !important;
  height: 28px !important;
  margin-inline-end: -6px !important;
}
.compact-switch :deep(.v-selection-control__wrapper) {
  height: 24px !important;
}

/* Light Theme Overrides in Settings */
:deep([data-theme="light"]) .premium-card,
[data-theme="light"] .premium-card {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04) !important;
}

:deep([data-theme="light"]) .inner-setting-box,
[data-theme="light"] .inner-setting-box {
  background: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02) !important;
}

:deep([data-theme="light"]) .v-btn-toggle,
[data-theme="light"] .v-btn-toggle {
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
}

:deep([data-theme="light"]) .v-btn-toggle .v-btn:not(.v-btn--selected),
[data-theme="light"] .v-btn-toggle .v-btn:not(.v-btn--selected) {
  background: #ffffff !important;
  color: #334155 !important;
  font-weight: 700 !important;
  border-right: 1px solid #e2e8f0 !important;
}

:deep([data-theme="light"]) .v-btn-toggle .v-btn.v-btn--selected,
[data-theme="light"] .v-btn-toggle .v-btn.v-btn--selected {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
  color: #ffffff !important;
  font-weight: 900 !important;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.35) !important;
}

:deep([data-theme="light"]) .ultra-compact-select .v-field,
[data-theme="light"] .ultra-compact-select .v-field {
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
}

:deep([data-theme="light"]) .ultra-compact-select .v-field__input,
[data-theme="light"] .ultra-compact-select .v-field__input {
  color: #0f172a !important;
  font-weight: 700 !important;
}

:deep([data-theme="light"]) .ultra-compact-select .v-icon,
[data-theme="light"] .ultra-compact-select .v-icon {
  color: #ea580c !important;
}

:deep([data-theme="light"]) .text-orange-lighten-2,
[data-theme="light"] .text-orange-lighten-2 {
  color: #ea580c !important;
  font-weight: 800 !important;
}

:deep([data-theme="light"]) .text-amber-lighten-2,
[data-theme="light"] .text-amber-lighten-2 {
  color: #d97706 !important;
  font-weight: 800 !important;
}

:deep([data-theme="light"]) .text-green-accent-3,
[data-theme="light"] .text-green-accent-3 {
  color: #16a34a !important;
  font-weight: 800 !important;
}

:deep([data-theme="light"]) .text-purple-lighten-2,
[data-theme="light"] .text-purple-lighten-2 {
  color: #9333ea !important;
}

:deep([data-theme="light"]) .text-slate-dark,
[data-theme="light"] .text-slate-dark {
  color: #0f172a !important;
  font-weight: 800 !important;
}

:deep([data-theme="light"]) .text-purple-lighten-2,
[data-theme="light"] .text-purple-lighten-2 {
  color: #7e22ce !important;
}

:deep([data-theme="light"]) .text-slate-dark,
[data-theme="light"] .text-slate-dark {
  color: #0f172a !important;
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
