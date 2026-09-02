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

    <!-- TAB NAVIGATION -->
    <v-tabs v-model="activeTab" density="compact" color="orange-darken-3" class="mb-3 rounded-lg bg-slate-900 border" align-tabs="center">
      <v-tab value="generali" class="text-caption font-weight-bold" style="text-transform: none;">⚙️ Generali</v-tab>
      <v-tab value="step" class="text-caption font-weight-bold" style="text-transform: none;">⚖️ Salti di Carico</v-tab>
    </v-tabs>

    <!-- SEZIONE 2: TEMA & ASPETTO -->
    <v-card 
      v-show="activeTab === 'generali'"
      class="premium-card rounded-xl text-left border mb-2.5 animate-slide-down pa-3"
      elevation="1"
    >
      <div class="d-flex align-center mb-2.5">
        <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" class="mr-2" size="17">mdi-palette-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black uppercase tracking-wide" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.72rem;">Tema & Aspetto</span>
      </div>

      <!-- Modalità Tema Scuro / Chiaro -->
      <div class="mb-2.5">
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Modalità Tema</span>
        <v-btn-toggle
          v-model="selectedTheme"
          mandatory
          selected-class="v-btn--active bg-theme-primary text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
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
      </div>

      <!-- Colore Tema Generale (Arancio / Blu / Verde / Fucsia / Giallo) -->
      <div>
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Colore Tema Generale</span>
        <v-btn-toggle
          v-model="temaHeaderGiorno"
          mandatory
          selected-class="v-btn--active bg-theme-primary text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 32px;"
        >
          <v-btn value="arancio" class="font-weight-bold flex-grow-1 px-0.5" style="font-size: 0.62rem; min-width: 0;">
            🍊 Arancio
          </v-btn>
          <v-btn value="blu" class="font-weight-bold flex-grow-1 px-0.5" style="font-size: 0.62rem; min-width: 0;">
            🔷 Blu
          </v-btn>
          <v-btn value="verde" class="font-weight-bold flex-grow-1 px-0.5" style="font-size: 0.62rem; min-width: 0;">
            🟢 Verde
          </v-btn>
          <v-btn value="fucsia" class="font-weight-bold flex-grow-1 px-0.5" style="font-size: 0.62rem; min-width: 0;">
            🌸 Fucsia
          </v-btn>
          <v-btn value="giallo" class="font-weight-bold flex-grow-1 px-0.5" style="font-size: 0.62rem; min-width: 0;">
            🟡 Giallo
          </v-btn>
        </v-btn-toggle>
      </div>
    </v-card>

    <!-- SEZIONE 3: LAYOUT & INTERFACCIA -->
    <v-card 
      v-show="activeTab === 'generali'"
      class="premium-card rounded-xl text-left border mb-2.5 animate-slide-down pa-3"
      elevation="1"
    >
      <div class="d-flex align-center mb-2.5">
        <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" class="mr-2" size="17">mdi-view-dashboard-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black uppercase tracking-wide" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.72rem;">Layout & Interfaccia</span>
      </div>

      <!-- Layout Lista -->
      <div class="mb-2.5">
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Layout Lista</span>
        <v-btn-toggle
          v-model="layoutEsercizi"
          mandatory
          selected-class="v-btn--active bg-theme-primary text-white"
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
          selected-class="v-btn--active bg-theme-primary text-white"
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

      <!-- Posizione Esercizi da Recuperare -->
      <div class="mb-2.5">
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Posizione Esercizi da Recuperare</span>
        <v-btn-toggle
          v-model="posizioneRecuperi"
          mandatory
          selected-class="v-btn--active bg-theme-primary text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 32px;"
        >
          <v-btn value="strategica" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.62rem;">🧠 Strategica</v-btn>
          <v-btn value="inizio" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.62rem;">🔝 Inizio</v-btn>
          <v-btn value="fine" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.62rem;">🔚 Fine</v-btn>
        </v-btn-toggle>
      </div>

      <!-- Tasto Play -->
      <div class="mb-2.5">
        <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Tasto Play</span>
        <v-btn-toggle
          v-model="comportamentoPlay"
          mandatory
          selected-class="v-btn--active bg-theme-primary text-white"
          density="compact"
          rounded="lg"
          class="w-100 card-glass border"
          style="height: 32px;"
        >
          <v-btn value="evidenzia" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Evidenzia</v-btn>
          <v-btn value="dettaglio" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Dettaglio</v-btn>
          <v-btn value="auto" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">Auto</v-btn>
        </v-btn-toggle>
      </div>
    </v-card>

    <!-- SEZIONE 4: PARAMETRI ALLENAMENTO -->
    <v-card 
      v-show="activeTab === 'generali'"
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

        <!-- Suggerimenti e Stile Carico Consigliato -->
        <div>
          <div class="d-flex align-center justify-space-between mb-1">
            <span class="text-caption font-weight-bold text-slate-dark uppercase" style="font-size: 0.65rem;">Stile Suggerimento Carichi</span>
            <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.58rem;">
              {{ (stileVisualizzazioneGhost === 'multichip' || stileVisualizzazioneGhost === 'forma') ? '⚡ Multi-Chip' : '📄 Classico' }}
            </span>
          </div>
          <v-btn-toggle
            v-model="stileVisualizzazioneGhost"
            mandatory
            selected-class="v-btn--active bg-theme-primary text-white"
            density="compact"
            rounded="lg"
            class="w-100 card-glass border mb-1"
            style="height: 34px;"
          >
            <v-btn value="range" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">
              <v-icon size="14" class="mr-1">mdi-text-box-outline</v-icon> Classico (Come prima)
            </v-btn>
            <v-btn value="multichip" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.65rem;">
              <v-icon size="14" class="mr-1">mdi-view-grid-plus-outline</v-icon> Multi-Chip (Soluzione 3)
            </v-btn>
          </v-btn-toggle>
          <div class="text-super-caption text-slate-400 mb-2.5 px-0.5" style="font-size: 0.58rem; line-height: 1.25;">
            {{ (stileVisualizzazioneGhost === 'multichip' || stileVisualizzazioneGhost === 'forma') 
              ? '⚡ Mostra 3 chip rapidi sotto l’input: 🛡️ Prudenziale (Volume), 🎯 Consigliato (Rotta), ⚡ Sfidante (Picco).' 
              : '📄 Mostra il suggerimento compatto lineare nel box superiore, senza chip invasivi sotto l’input.' }}
          </div>

          <!-- Attitudine alla Progressione / Sensibilità Fatica -->
          <div class="mb-2.5">
            <span class="text-caption font-weight-bold text-slate-dark uppercase d-block mb-1" style="font-size: 0.65rem;">Attitudine alla Progressione (Sensibilità)</span>
            <v-btn-toggle
              v-model="sensibilitaFaticaGhost"
              mandatory
              selected-class="v-btn--active bg-theme-primary text-white"
              density="compact"
              rounded="lg"
              class="w-100 card-glass border"
              style="height: 32px;"
            >
              <v-btn value="conservativa" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.60rem;">🛡️ Prudente</v-btn>
              <v-btn value="bilanciata" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.60rem;">⚖️ Bilanciata</v-btn>
              <v-btn value="aggressiva" class="font-weight-bold flex-grow-1 px-1" style="font-size: 0.60rem;">🔥 Spinta</v-btn>
            </v-btn-toggle>
          </div>
          
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
            
            <!-- Blocco Ghost in Digitazione -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <span class="text-caption font-weight-bold text-blue-grey-lighten-2" style="font-size: 0.72rem;">Blocco Ghost Digitazione</span>
              <div class="compact-switch">
                <v-switch
                  v-model="bloccoGhostDigitazioneAttivo"
                  color="blue-grey-darken-1"
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

            <!-- Analisi Sforzo da Note (Difficile/Duro) -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <div>
                <span class="text-caption font-weight-bold text-cyan-lighten-2 d-block" style="font-size: 0.72rem;">Analisi Sforzo da Note</span>
                <span class="text-super-caption text-muted d-block" style="font-size: 0.58rem; line-height: 1.1;">Legge parole come "difficile/duro" per frenare il carico</span>
              </div>
              <div class="compact-switch">
                <v-switch
                  v-model="ghostAnalisiNoteAttiva"
                  color="cyan-darken-2"
                  hide-details
                  density="compact"
                ></v-switch>
              </div>
            </div>

            <v-divider class="border-soft" style="opacity: 0.2;"></v-divider>

            <!-- Arrotondamento Carichi Reali (Palestra / Dischi) -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <div>
                <span class="text-caption font-weight-bold text-green-lighten-2 d-block" style="font-size: 0.72rem;">Arrotondamento Carichi Reali</span>
                <span class="text-super-caption text-muted d-block" style="font-size: 0.58rem; line-height: 1.1;">Arrotonda le stime a numeri interi o multipli di 1,25kg da palestra</span>
              </div>
              <div class="compact-switch">
                <v-switch
                  v-model="arrotondamentoCarichiRealisticiGlobal"
                  color="green-darken-2"
                  hide-details
                  density="compact"
                ></v-switch>
              </div>
            </div>

            <v-divider class="border-soft" style="opacity: 0.2;"></v-divider>

            <!-- Analisi Predittiva & Rotta PR (W1 -> W6) -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <div>
                <span class="text-caption font-weight-bold text-amber-accent-2 d-block" style="font-size: 0.72rem;">Analisi Predittiva & Rotta PR (W1 → W6)</span>
                <span class="text-super-caption text-muted d-block" style="font-size: 0.58rem; line-height: 1.1;">Valuta se W1 porta al superamento del PR e stima la week di attacco record</span>
              </div>
              <div class="compact-switch">
                <v-switch
                  v-model="previsioneStrategicaAttiva"
                  color="amber-darken-2"
                  hide-details
                  density="compact"
                ></v-switch>
              </div>
            </div>

            <v-divider class="border-soft" style="opacity: 0.2;"></v-divider>

            <!-- Priorità Rotta di Carico (Allineamento Strategia Coach) -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <div>
                <span class="text-caption font-weight-bold text-cyan-accent-2 d-block" style="font-size: 0.72rem;">Priorità Rotta di Carico (Allineamento Strategia)</span>
                <span class="text-super-caption text-muted d-block" style="font-size: 0.58rem; line-height: 1.1;">Allinea le proposte Ghost ai carichi target della Strategia (+Kg su step reale) evitando blocchi a sole reps</span>
              </div>
              <div class="compact-switch">
                <v-switch
                  v-model="allineamentoRottaGhost"
                  color="cyan-darken-2"
                  hide-details
                  density="compact"
                ></v-switch>
              </div>
            </div>

            <v-divider class="border-soft" style="opacity: 0.2;"></v-divider>
            
            <!-- Ottimizza Digitazione Note -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <div>
                <span class="text-caption font-weight-bold text-orange-lighten-2 d-block" style="font-size: 0.72rem;">Ottimizza Note</span>
                <span class="text-super-caption text-muted d-block" style="font-size: 0.58rem; line-height: 1.1;">Elimina rallentamenti durante la digitazione di note lunghe (.lazy)</span>
              </div>
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

            <!-- Risalto Numerico nei Carichi W1-W6 -->
            <div class="d-flex align-center justify-space-between py-0.5" style="min-height: 34px;">
              <div>
                <span class="text-caption font-weight-bold text-orange-lighten-2 d-block" style="font-size: 0.72rem;">Risalto Numerico Ins Week</span>
                <span class="text-super-caption text-muted d-block" style="font-size: 0.58rem; line-height: 1.1;">Carichi grandi, reps medie, note e parentesi piccole sui log W1–W6</span>
              </div>
              <div class="compact-switch">
                <v-switch
                  v-model="risaltoNumeriInsWeek"
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

    <!-- SEZIONE 4.1: ELENCO STEP INCREMENTO PERSONALIZZATI (Nuova Schermata/Card Dedicata) -->
    <v-card 
      v-show="activeTab === 'step'"
      class="premium-card rounded-xl text-left border mb-2.5 animate-slide-down pa-3"
      elevation="1"
    >
      <div class="d-flex align-center justify-space-between mb-2">
        <div class="d-flex align-center">
          <v-icon color="cyan-lighten-2" class="mr-2" size="18">mdi-scale</v-icon>
          <span class="text-subtitle-2 font-weight-black text-cyan-lighten-2 uppercase tracking-wide" style="font-size: 0.72rem;">Step Incremento Personalizzati</span>
        </div>
        <v-chip size="x-small" color="cyan-darken-3" class="font-weight-black text-white px-1.5" style="height: 18px; font-size: 0.60rem;">
          {{ listaEserciziStepPersonalizzati.length }} salvati
        </v-chip>
      </div>

      <!-- Coach Solo: Selettore Atleta -->
      <div v-if="ruolo === 'coach'" class="mb-3">
        <v-select
          v-model="selectedAthlete"
          :items="listaAtletiSoloSingoli"
          item-title="title"
          item-value="value"
          label="Seleziona Atleta per gestire gli step"
          density="compact"
          variant="outlined"
          color="cyan-lighten-2"
          base-color="slate-600"
          bg-color="slate-900"
          hide-details
          class="text-caption"
          @update:model-value="cambiaAtletaStep"
        >
          <template v-slot:item="{ props, item }">
            <v-list-item v-bind="props" :title="item.raw.nome"></v-list-item>
          </template>
        </v-select>
      </div>

      <div class="text-super-caption text-slate-300 mb-2.5 font-weight-medium" style="font-size: 0.65rem; line-height: 1.35;">
        Elenco degli esercizi per i quali hai modificato il salto di carico.
      </div>
      
      <!-- Barra di ricerca -->
      <div v-if="haEserciziSalvatiOFiltrati" class="mb-3">
        <v-text-field
          v-model="searchQueryStep"
          placeholder="Cerca esercizio..."
          prepend-inner-icon="mdi-magnify"
          density="compact"
          variant="outlined"
          color="cyan-lighten-2"
          base-color="slate-600"
          bg-color="slate-900"
          hide-details
          clearable
          class="text-caption"
        ></v-text-field>
      </div>

      <!-- Lista degli esercizi con Step Personalizzato -->
      <div v-if="listaEserciziStepPersonalizzati.length > 0" class="d-flex flex-column gap-1.5">
        <div 
          v-for="item in listaEserciziStepPersonalizzati" 
          :key="item.key"
          class="d-flex align-center justify-space-between pa-2 rounded-lg bg-slate-900 border border-slate-700"
        >
          <div class="min-width-0 pr-2">
            <div class="text-caption font-weight-bold text-slate-100 text-truncate" style="font-size: 0.72rem; line-height: 1.2;">
              {{ item.name }}
            </div>
            <div class="text-super-caption text-slate-400" style="font-size: 0.55rem;">
              Step minimo: <strong class="text-cyan-lighten-2">{{ item.step }} kg</strong>
            </div>
          </div>

          <div class="d-flex align-center gap-1 flex-shrink-0">
            <v-chip 
              size="x-small" 
              color="cyan-darken-2" 
              class="font-weight-black text-white px-1.5 cursor-pointer"
              style="height: 22px; font-size: 0.65rem;"
              @click="apriModificaStepDaImpostazioni(item)"
              title="Modifica Step"
            >
              ✏️ {{ item.step }}kg
            </v-chip>
            <v-btn
              icon
              size="x-small"
              variant="text"
              color="red-lighten-2"
              style="width: 24px; height: 24px;"
              @click="eliminaStepDaImpostazioni(item.key)"
              title="Ripristina step standard"
            >
              <v-icon size="15">mdi-delete-outline</v-icon>
            </v-btn>
          </div>
        </div>
      </div>

      <!-- Messaggio se nessun esercizio è personalizzato -->
      <div v-else class="text-center pa-3 rounded-lg border-soft text-slate-400" style="font-size: 0.68rem;">
        <v-icon size="20" color="slate-500" class="mb-1 d-block mx-auto">mdi-information-outline</v-icon>
        Nessun esercizio personalizzato. Tutti gli esercizi usano gli step standard (1.25kg macchine/cavi, 1.0kg manubri, 2.5kg bilancieri).
      </div>
    </v-card>

    <!-- Dialog Rapido Modifica Step da Impostazioni -->
    <v-dialog v-model="dialogModificaStepImp" max-width="360">
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: #0b111e !important; border: 1.5px solid rgba(6, 182, 212, 0.4) !important;">
        <v-card-title class="pa-3 pb-2 d-flex align-center justify-space-between bg-slate-900 border-bottom">
          <div class="d-flex align-center gap-1.5">
            <v-icon color="cyan-lighten-2" size="18">mdi-scale</v-icon>
            <span class="text-subtitle-2 font-weight-black text-white" style="font-size: 0.82rem;">Modifica Step</span>
          </div>
          <v-btn icon size="x-small" variant="text" color="grey" @click="dialogModificaStepImp = false">
            <v-icon size="16">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-3 text-left">
          <div class="text-caption text-slate-200 mb-2.5 font-weight-medium" style="font-size: 0.72rem;">
            Imposta lo step per <strong class="text-cyan-lighten-2">{{ esercizioInModificaStep?.name }}</strong>:
          </div>

          <div class="d-flex flex-wrap gap-1.5 justify-center mb-3">
            <v-btn
              v-for="st in [0.5, 1.0, 1.25, 2.0, 2.5, 5.0]"
              :key="st"
              size="small"
              :variant="esercizioInModificaStep?.step === st ? 'flat' : 'outlined'"
              :color="esercizioInModificaStep?.step === st ? 'cyan-darken-2' : 'slate-600'"
              class="font-weight-black text-white px-2 rounded-lg"
              style="min-width: 52px; height: 32px; font-size: 0.72rem;"
              @click="salvaNuovoStepDaImpostazioni(st)"
            >
              {{ st }} kg
            </v-btn>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- SEZIONE 5: NOTIFICA DEPLOY / MESSAGGIO (SOLO COACH) -->
    <v-card 
      v-if="ruolo === 'coach'"
      v-show="activeTab === 'generali'"
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
              item-title="title"
              item-value="value"
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
      v-show="activeTab === 'generali'"
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
      v-show="activeTab === 'generali'"
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
import { ref, watch, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useTheme } from 'vuetify';
import { collection, query, where, getDocs, writeBatch, doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { 
  utente, 
  idCliente, 
  ruolo, 
  logout, 
  getNomeAtleta,
  selectedAthlete,
  setSelectedAthlete,
  selectedSheet,
  layoutEserciziGlobal,
  layoutDettaglioGlobal,
  posizioneRecuperiGlobal,
  timerThemeGlobal,
  comportamentoPlayGlobal,
  temaHeaderGiornoGlobal,
  ottimizzaDigitazioneGlobal,
  regolaProgressioneW2Global,
  inviaNotificaDeploy,
  currentTheme,
  setTheme,
  currentLightStyle,
  setLightStyle,
  stileVisualizzazioneGhost,
  modalitaIncrementoGhost,
  ghostPRAttackAttivo,
  bloccoGhostDigitazioneAttivo,
  ghostAutoregolazioneRepsAttiva,
  sfidaRecordWeek1,
  sensibilitaFaticaGhost,
  ghostAnalisiNoteAttiva,
  arrotondamentoCarichiRealisticiGlobal,
  previsioneStrategicaAttiva,
  allineamentoRottaGhost,
  defaultBilanciereGlobal,
  vibrazioneAttivaGlobal,
  defaultTimerRecGlobal,
  dimensioneGifCompattaGlobal,
  risaltoNumeriInsWeekGlobal,
  margineTopInputWeekGlobal,
  margineBottomInputWeekGlobal,
  margineTopW6FeedbackGlobal,
  margineBottomGhostNoticeGlobal,
  ORDINE_ORIGINALE_ATLETI,
  MAPPA_CLIENTI,
  MAPPA_CLIENTI_DINAMICI,
  caricaNomiAtletiDinamici,
  isAtletaAttivo,
  userCustomExerciseSteps,
  setCustomExerciseStep,
  removeCustomExerciseStep
} from '../authStore.js';

const router = useRouter();
const vuetifyTheme = useTheme();
const activeTab = ref('generali');
const selectedTheme = ref(currentTheme.value);
const selectedLightStyle = ref(currentLightStyle.value);

// Gestione Sezione Step Incremento Personalizzati
const dialogModificaStepImp = ref(false);
const esercizioInModificaStep = ref(null);

const searchQueryStep = ref('');

const listaEserciziStepPersonalizzati = computed(() => {
  if (!userCustomExerciseSteps.value) return [];
  const entries = Object.entries(userCustomExerciseSteps.value);
  let arr = entries.map(([key, val]) => {
    const isObj = typeof val === 'object' && val !== null;
    const name = isObj ? (val.name || key) : key;
    const step = isObj ? parseFloat(val.step || 0) : parseFloat(val || 0);
    return { key, name, step };
  }).filter(item => item.step > 0);
  
  if (searchQueryStep.value) {
    const q = searchQueryStep.value.toLowerCase();
    arr = arr.filter(item => item.name.toLowerCase().includes(q));
  }
  return arr.sort((a, b) => a.name.localeCompare(b.name));
});

const haEserciziSalvatiOFiltrati = computed(() => {
  return (userCustomExerciseSteps.value && Object.keys(userCustomExerciseSteps.value).length > 0) || searchQueryStep.value;
});

const cambiaAtletaStep = (nuovoAtleta) => {
  setSelectedAthlete(nuovoAtleta);
};

const apriModificaStepDaImpostazioni = (item) => {
  esercizioInModificaStep.value = { ...item };
  dialogModificaStepImp.value = true;
};

const salvaNuovoStepDaImpostazioni = async (nuovoStep) => {
  if (!esercizioInModificaStep.value) return;
  const { name, key } = esercizioInModificaStep.value;
  await setCustomExerciseStep(name || key, nuovoStep);
  dialogModificaStepImp.value = false;
};

const eliminaStepDaImpostazioni = async (key) => {
  await removeCustomExerciseStep(key);
};

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
const listaAtleti = ref([]);
const tipoNotificaForm = ref('deploy'); // 'deploy' | 'messaggio'
const titoloDeployForm = ref('🚀 Nuovo Aggiornamento!');
const messaggioDeployGeneraleForm = ref('Nuova versione disponibile con miglioramenti.');
const atletaDeployTargetForm = ref('tutti');
const notaDeployPersonalizzataForm = ref('');
const inviandoDeployNotifica = ref(false);
const snackbarDeployShow = ref(false);
const snackbarDeployMessage = ref('');
const snackbarDeployColor = ref('success');

const caricaDatiAtleti = async () => {
  try {
    const docRef = doc(db, 'METADATA', 'clienti');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      listaAtleti.value = docSnap.data().lista || [];
    }
    await caricaNomiAtletiDinamici();
  } catch (error) {
    console.error("Errore caricamento lista atleti in Impostazioni:", error);
  }
};

onMounted(async () => {
  if (ruolo.value === 'coach') {
    await caricaDatiAtleti();
  }
});

// Computed per la lista atleti esclusiva dei messaggi individuali (SENZA "Tutti gli Atleti" e solo attivi)
const listaAtletiSoloSingoli = computed(() => {
  const idsSet = new Set([
    ...(listaAtleti.value || []),
    ...(ORDINE_ORIGINALE_ATLETI || []),
    ...Object.keys(MAPPA_CLIENTI || {}),
    ...Object.keys(MAPPA_CLIENTI_DINAMICI.value || {})
  ]);

  const ordinati = Array.from(idsSet)
    .map(id => String(id).trim())
    .filter(id => id && isAtletaAttivo(id))
    .sort((a, b) => {
      const idxA = ORDINE_ORIGINALE_ATLETI ? ORDINE_ORIGINALE_ATLETI.indexOf(a) : -1;
      const idxB = ORDINE_ORIGINALE_ATLETI ? ORDINE_ORIGINALE_ATLETI.indexOf(b) : -1;
      const posA = idxA === -1 ? 999 : idxA;
      const posB = idxB === -1 ? 999 : idxB;
      if (posA !== posB) return posA - posB;
      return a.localeCompare(b, undefined, { numeric: true });
    });

  const items = [];
  ordinati.forEach(id => {
    const nome = getNomeAtleta(id);
    items.push({
      title: nome ? `${nome} (ID: ${id})` : `Atleta #${id}`,
      value: String(id)
    });
  });
  return items;
});

watch(tipoNotificaForm, (nuovoTipo) => {
  if (nuovoTipo === 'messaggio') {
    titoloDeployForm.value = '💬 Messaggio dal Coach';
    messaggioDeployGeneraleForm.value = '';
    if (atletaDeployTargetForm.value === 'tutti' && listaAtletiSoloSingoli.value.length > 0) {
      atletaDeployTargetForm.value = String(listaAtletiSoloSingoli.value[0].value);
    }
  } else {
    titoloDeployForm.value = '🚀 Nuovo Aggiornamento!';
    messaggioDeployGeneraleForm.value = 'Nuova versione disponibile con miglioramenti.';
    atletaDeployTargetForm.value = 'tutti';
  }
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
const posizioneRecuperi = posizioneRecuperiGlobal;
const timerTheme = timerThemeGlobal;
const temaHeaderGiorno = temaHeaderGiornoGlobal;
const dimensioneGifCompatta = dimensioneGifCompattaGlobal;
const margineTopInputWeek = margineTopInputWeekGlobal;
const margineBottomInputWeek = margineBottomInputWeekGlobal;
const margineTopW6Feedback = margineTopW6FeedbackGlobal;
const margineBottomGhostNotice = margineBottomGhostNoticeGlobal;

// Refs collegati allo store centralizzato
const defaultBilanciere = defaultBilanciereGlobal;
const vibrazioneAttiva = vibrazioneAttivaGlobal;
const comportamentoPlay = comportamentoPlayGlobal;
const defaultTimerRec = defaultTimerRecGlobal;

const getActiveAtletaId = () => {
  return selectedAthlete.value || idCliente.value || '';
};

const ottimizzaDigitazione = ottimizzaDigitazioneGlobal;
const regolaProgressioneW2 = regolaProgressioneW2Global;
const risaltoNumeriInsWeek = risaltoNumeriInsWeekGlobal;

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
  background: #f1f5f9 !important;
  border: 1px solid #cbd5e1 !important;
}

:deep([data-theme="light"]) .v-btn-toggle .v-btn:not(.v-btn--active):not(.v-item--active),
[data-theme="light"] .v-btn-toggle .v-btn:not(.v-btn--active):not(.v-item--active) {
  background: #f8fafc !important;
  color: #334155 !important;
  font-weight: 700 !important;
  border-right: 1px solid #e2e8f0 !important;
}

:deep([data-theme="light"]) .v-btn-toggle .v-btn.v-btn--active,
:deep([data-theme="light"]) .v-btn-toggle .v-btn.v-item--active,
:deep([data-theme="light"]) .v-btn-toggle .v-btn.v-btn--selected,
:deep([data-theme="light"]) .v-btn-toggle .v-btn.bg-orange-darken-3,
:deep([data-theme="light"]) .v-btn-toggle .v-btn.bg-theme-primary,
[data-theme="light"] .v-btn-toggle .v-btn.v-btn--active,
[data-theme="light"] .v-btn-toggle .v-btn.v-item--active,
[data-theme="light"] .v-btn-toggle .v-btn.v-btn--selected,
[data-theme="light"] .v-btn-toggle .v-btn.bg-orange-darken-3,
[data-theme="light"] .v-btn-toggle .v-btn.bg-theme-primary {
  background: var(--theme-btn-gradient, var(--brand-accent, linear-gradient(135deg, #f97316 0%, #ea580c 100%))) !important;
  color: #ffffff !important;
  font-weight: 900 !important;
  box-shadow: 0 2px 8px var(--theme-primary-glow, rgba(234, 88, 12, 0.35)) !important;
  border-color: transparent !important;
}

:deep([data-theme="light"]) .v-btn-toggle .v-btn.v-btn--active .v-icon,
:deep([data-theme="light"]) .v-btn-toggle .v-btn.v-item--active .v-icon,
[data-theme="light"] .v-btn-toggle .v-btn.v-btn--active .v-icon,
[data-theme="light"] .v-btn-toggle .v-btn.v-item--active .v-icon {
  color: #ffffff !important;
}

:deep([data-theme="light"]) .v-slider .v-slider-track__background {
  background: #cbd5e1 !important;
  opacity: 0.8 !important;
}
:deep([data-theme="light"]) .v-slider .v-slider-track__fill {
  background: var(--theme-primary, #ea580c) !important;
}
:deep([data-theme="light"]) .v-slider .v-slider-thumb__surface {
  background: var(--theme-primary, #ea580c) !important;
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
