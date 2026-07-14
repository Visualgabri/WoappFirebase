<template>
  <v-container 
    class="px-4 max-width-container min-height-screen pb-12"
    :class="layoutEserciziGlobal === 'super_compatto' ? 'py-2' : (layoutEserciziGlobal === 'compatto' ? 'py-4' : 'py-6')"
  >
    <!-- Header Premium -->
    <div 
      class="premium-header card-glass rounded-2xl d-flex align-center justify-space-between elevation-2 border-bottom-soft animate-slide-down"
      :class="layoutEserciziGlobal === 'super_compatto' ? 'pa-2.5 mb-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-3 mb-4' : 'pa-4 mb-5')"
    >
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-transparent border-orange elevation-1 profile-avatar">
          <v-img src="/logo.png" alt="WoApp Logo"></v-img>
        </v-avatar>
        <div class="text-left">
          <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight leading-tight">Impostazioni</h1>
          <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.62rem; letter-spacing: 0.05em;">Profilo, Layout & Configurazione</span>
        </div>
      </div>
    </div>

    <!-- SEZIONE 1: PROFILO ATLETA -->
    <v-card 
      class="premium-card rounded-2xl text-left border position-relative overflow-hidden mb-5 animate-slide-down"
      :class="layoutEserciziGlobal === 'super_compatto' ? 'pa-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-4' : 'pa-5')"
      elevation="2"
    >
      <div class="glowing-accent"></div>
      
      <div class="d-flex align-center mb-3">
        <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-account-circle-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-widest" style="font-size: 0.72rem;">Profilo Utente</span>
      </div>

      <div class="d-flex align-center mb-4">
        <v-avatar size="44" color="orange-darken-4" class="mr-3 border-orange text-white font-weight-black elevation-2">
          {{ getNomeAtleta(idCliente) ? getNomeAtleta(idCliente).charAt(0).toUpperCase() : (ruolo === 'coach' ? 'C' : 'A') }}
        </v-avatar>
        <div class="text-left">
          <div class="text-body-1 font-weight-black text-slate-dark leading-none">
            {{ ruolo === 'coach' ? 'Coach' : (getNomeAtleta(idCliente) || 'Atleta') }}
          </div>
          <div class="text-caption text-muted mt-1.5 d-flex align-center gap-1">
            <v-icon size="12" class="mr-1">mdi-email-outline</v-icon>
            {{ utente?.email || 'Non disponibile' }}
          </div>
        </div>
      </div>

      <v-row dense class="border-top-soft pt-3">
        <v-col cols="6" class="border-right-soft">
          <div class="text-center py-1">
            <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.6rem;">Ruolo</span>
            <v-chip color="orange-darken-3" size="x-small" class="font-weight-black mt-1 text-white" variant="flat">
              {{ ruolo === 'coach' ? 'Coach 📋' : 'Atleta 🏋️' }}
            </v-chip>
          </div>
        </v-col>
        <v-col cols="6">
          <div class="text-center py-1">
            <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.6rem;">ID Cliente</span>
            <span class="text-body-2 font-weight-black text-slate-dark mt-1 d-inline-block">
              {{ idCliente || 'N/D' }}
            </span>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <!-- SEZIONE 2: LAYOUT & VISUALIZZAZIONE -->
    <v-card 
      class="premium-card rounded-2xl text-left border mb-5 animate-slide-down"
      :class="layoutEserciziGlobal === 'super_compatto' ? 'pa-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-4' : 'pa-5')"
      elevation="2"
    >
      <div class="d-flex align-center mb-4">
        <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-view-dashboard-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-widest" style="font-size: 0.72rem;">Layout & Visualizzazione</span>
      </div>

      <!-- Densità Layout Lista -->
      <div class="mb-5">
        <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.72rem;">📐 Densità del Layout Lista</span>
        <v-btn-toggle
          v-model="layoutEsercizi"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="comfortable"
          rounded="xl"
          class="w-100 card-glass border mb-2"
          style="height: 38px;"
        >
          <v-btn value="super_compatto" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 33%;">
            Super Compatto
          </v-btn>
          <v-btn value="compatto" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 33%;">
            Compatto
          </v-btn>
          <v-btn value="standard" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 33%;">
            Standard
          </v-btn>
        </v-btn-toggle>
        <div class="text-super-caption text-muted font-italic leading-tight">
          <template v-if="layoutEsercizi === 'super_compatto'">
            * Super Compatto: Rimuove miniature (immagini/GIF) e capsule W1-W6 della cronologia per la massima densità (card da 50px).
          </template>
          <template v-else-if="layoutEsercizi === 'compatto'">
            * Compatto: Miniature ridotte (48px), layout in linea e capsule W1-W6 compresse (card da 80px).
          </template>
          <template v-else>
            * Standard: Layout esteso classico con miniature da 84px e capsule W1-W6 carichi complete.
          </template>
        </div>
      </div>

      <!-- Densità Layout Dettaglio -->
      <div class="mb-5">
        <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.72rem;">📐 Densità del Layout Dettaglio</span>
        <v-btn-toggle
          v-model="layoutDettaglio"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="comfortable"
          rounded="xl"
          class="w-100 card-glass border mb-2"
          style="height: 38px;"
        >
          <v-btn value="auto" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 25%;">
            Auto
          </v-btn>
          <v-btn value="super_compatto" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 25%;">
            Super Comp
          </v-btn>
          <v-btn value="compatto" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 25%;">
            Compatto
          </v-btn>
          <v-btn value="standard" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 25%;">
            Standard
          </v-btn>
        </v-btn-toggle>
        <div class="text-super-caption text-muted font-italic leading-tight">
          <template v-if="layoutDettaglio === 'auto'">
            * Auto: Segue la modalità scelta per la lista principale ({{ layoutEsercizi }}).
          </template>
          <template v-else-if="layoutDettaglio === 'super_compatto'">
            * Super Compatto: Nasconde la GIF e riduce al minimo gli spazi/scritte nel dettaglio.
          </template>
          <template v-else-if="layoutDettaglio === 'compatto'">
            * Compatto: Layout ridotto nel dettaglio con spaziature minori.
          </template>
          <template v-else>
            * Standard: Layout esteso classico con GIF completa e spaziature originali.
          </template>
        </div>
      </div>

      <!-- Comportamento Tasto Play -->
      <div>
        <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.72rem;">▶️ Comportamento Tasto Play</span>
        <v-btn-toggle
          v-model="comportamentoPlay"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="comfortable"
          rounded="xl"
          class="w-100 card-glass border mb-2"
          style="height: 38px;"
        >
          <v-btn value="auto" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 33%;">
            Auto
          </v-btn>
          <v-btn value="dettaglio" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 33%;">
            Dettaglio
          </v-btn>
          <v-btn value="evidenzia" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 33%;">
            Evidenzia
          </v-btn>
        </v-btn-toggle>
        <div class="text-super-caption text-muted font-italic leading-tight">
          <template v-if="comportamentoPlay === 'auto'">
            * Auto: Dettaglio in vista Compatta/Super e scorrimento in lista in vista Standard.
          </template>
          <template v-else-if="comportamentoPlay === 'dettaglio'">
            * Dettaglio: Naviga sempre direttamente al dettaglio dell'esercizio.
          </template>
          <template v-else>
            * Evidenzia: Scorre ed evidenzia sempre l'esercizio nella lista principale.
          </template>
        </div>
      </div>

      <v-divider class="my-4 border-soft" style="opacity: 0.15;"></v-divider>

      <!-- Tema Card Giorno Workout -->
      <div class="mb-2">
        <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2" style="font-size: 0.72rem;">🎨 Tema Card Giorno Workout</span>
        <v-btn-toggle
          v-model="temaHeaderGiorno"
          mandatory
          selected-class="bg-orange-darken-3 text-white"
          density="comfortable"
          rounded="xl"
          class="w-100 card-glass border mb-2"
          style="height: 38px;"
        >
          <v-btn value="arancio" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 33%;">
            Arancio 🔥
          </v-btn>
          <v-btn value="blu" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 33%;">
            Blu Cobalto 💎
          </v-btn>
          <v-btn value="verde" class="font-weight-bold flex-grow-1" style="font-size: 0.7rem; min-width: 33%;">
            Verde Smeraldo 🌿
          </v-btn>
        </v-btn-toggle>
        <div class="text-super-caption text-muted font-italic leading-tight">
          <template v-if="temaHeaderGiorno === 'arancio'">
            * Arancio: Gradiente ambrato arancione in linea con i colori storici del brand WoApp.
          </template>
          <template v-else-if="temaHeaderGiorno === 'blu'">
            * Blu Cobalto: Stile tecnologico e pulito con sfumature blu neon e notte.
          </template>
          <template v-else>
            * Verde Smeraldo: Look fresco basato sulle tonalità smeraldo e menta.
          </template>
        </div>
      </div>
    </v-card>

    <!-- SEZIONE 3: PARAMETRI ALLENAMENTO -->
    <v-card 
      class="premium-card rounded-2xl text-left border mb-5 animate-slide-down"
      :class="layoutEserciziGlobal === 'super_compatto' ? 'pa-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-4' : 'pa-5')"
      elevation="2"
    >
      <div class="d-flex align-center mb-4">
        <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-dumbbell</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-widest" style="font-size: 0.72rem;">Parametri Allenamento</span>
      </div>

      <div class="d-flex flex-column gap-3.5">
        <!-- Peso Bilanciere Default -->
        <div class="d-flex align-center justify-space-between">
          <div>
            <span class="text-body-2 font-weight-bold text-white d-block">Peso Bilanciere Default</span>
            <span class="text-super-caption text-muted">Usato nel calcolatore dischi</span>
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
              style="font-size: 0.8rem;"
            ></v-select>
          </div>
        </div>

        <!-- Feedback Tattile (Vibrazione) -->
        <div class="d-flex align-center justify-space-between">
          <div>
            <span class="text-body-2 font-weight-bold text-white d-block">Vibrazione Tattile</span>
            <span class="text-super-caption text-muted">Micro-feedback sui tasti ed inserimenti</span>
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
            <span class="text-body-2 font-weight-bold text-white d-block">Durata Recupero Default</span>
            <span class="text-super-caption text-muted">Se non specificato dall'esercizio</span>
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
              style="font-size: 0.8rem;"
            ></v-select>
          </div>
        </div>

        <!-- Tema Grafico Timer -->
        <div class="d-flex align-center justify-space-between">
          <div>
            <span class="text-body-2 font-weight-bold text-white d-block">Tema Grafico Timer</span>
            <span class="text-super-caption text-muted">Stile visivo del widget di recupero</span>
          </div>
          <div style="width: 175px;">
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
              style="font-size: 0.8rem;"
            ></v-select>
          </div>
        </div>

        <v-divider class="my-4 border-soft" style="opacity: 0.15;"></v-divider>

        <!-- Configurazione Algoritmo Ghost -->
        <div class="text-left mt-2">
          <span class="text-caption font-weight-black text-slate-dark uppercase d-block mb-2.5" style="font-size: 0.72rem;">🧬 Visualizzazione Suggerimento Ghost</span>
          <v-btn-toggle
            v-model="stileVisualizzazioneGhost"
            mandatory
            selected-class="bg-orange-darken-3 text-white"
            density="comfortable"
            rounded="xl"
            class="w-100 card-glass border mb-3"
            style="height: 38px;"
          >
            <v-btn value="range" class="font-weight-bold flex-grow-1" style="font-size: 0.68rem; min-width: 50%;">
              📊 Solo Range
            </v-btn>
            <v-btn value="forma" class="font-weight-bold flex-grow-1" style="font-size: 0.68rem; min-width: 50%;">
              🔋 Stato Forma
            </v-btn>
          </v-btn-toggle>
          
          <div class="d-flex flex-column gap-2 bg-slate-900 border rounded-xl pa-3" style="border-color: var(--card-border) !important; background: var(--card-bg-soft) !important;">
            <!-- Switch PR Attack -->
            <div class="d-flex align-center justify-space-between" style="min-height: 32px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-amber-lighten-2 d-block" style="font-size: 0.72rem;">🏆 Attacco al Record (PR)</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.25;">Arrotonda in eccesso se sei vicino al tuo PR di sempre</span>
              </div>
              <v-switch
                v-model="ghostPRAttackAttivo"
                color="amber-darken-2"
                hide-details
                density="compact"
                class="ml-2 flex-shrink-0"
              ></v-switch>
            </div>
            
            <v-divider class="border-soft" style="opacity: 0.5;"></v-divider>
            
            <!-- Switch Autoregolazione Reps -->
            <div class="d-flex align-center justify-space-between" style="min-height: 32px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-green-accent-3 d-block" style="font-size: 0.72rem;">⚡ Autoregolazione Reps</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.25;">Accelera se esegui reps in più, rallenta se in meno</span>
              </div>
              <v-switch
                v-model="ghostAutoregolazioneRepsAttiva"
                color="green-darken-2"
                hide-details
                density="compact"
                class="ml-2 flex-shrink-0"
              ></v-switch>
            </div>

            <v-divider class="border-soft" style="opacity: 0.5;"></v-divider>
            
            <!-- Switch Sfida Record Week 1 -->
            <div class="d-flex align-center justify-space-between" style="min-height: 32px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-orange-lighten-2 d-block" style="font-size: 0.72rem;">🏆 Sfida Record in Week 1</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.25;">Mostra range e opzioni per superare i tuoi record già dalla prima settimana</span>
              </div>
              <v-switch
                v-model="sfidaRecordWeek1"
                color="orange-darken-3"
                hide-details
                density="compact"
                class="ml-2 flex-shrink-0"
              ></v-switch>
            </div>

            <v-divider class="border-soft" style="opacity: 0.5;"></v-divider>
            
            <!-- Switch Ottimizza Digitazione Note -->
            <div class="d-flex align-center justify-space-between" style="min-height: 32px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-orange-lighten-2 d-block" style="font-size: 0.72rem;">✍️ Ottimizza Digitazione Note</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.25;">Evita rallentamenti e lag aggiornando i calcoli grafici solo dopo aver finito di scrivere (consigliato su cellulari datati)</span>
              </div>
              <v-switch
                v-model="ottimizzaDigitazione"
                color="orange-darken-3"
                hide-details
                density="compact"
                class="ml-2 flex-shrink-0"
              ></v-switch>
            </div>

            <v-divider class="border-soft" style="opacity: 0.5;"></v-divider>

            <!-- Regola Progressione Week 2 -->
            <div class="d-flex align-center justify-space-between" style="min-height: 40px;">
              <div class="text-left" style="min-width: 0; flex-grow: 1; padding-right: 8px;">
                <span class="text-caption font-weight-bold text-orange-lighten-2 d-block" style="font-size: 0.72rem;">⚙️ Progressione Week 2</span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.62rem; text-transform: none; line-height: 1.25;">Regola di calcolo per le proposte della seconda settimana</span>
              </div>
              <v-select
                v-model="regolaProgressioneW2"
                :items="[
                  { title: 'Reps (+1)', value: 'reps' },
                  { title: 'Peso (+Step)', value: 'peso' },
                  { title: 'Testo \'Aumenta peso\'', value: 'scritta' }
                ]"
                variant="outlined"
                density="compact"
                hide-details
                rounded="lg"
                color="orange-darken-3"
                style="font-size: 0.72rem; max-width: 175px; min-width: 150px;"
              ></v-select>
            </div>
          </div>
        </div>
      </div>
    </v-card>

    <!-- SEZIONE 4: BACKUP & RIPRISTINO DATI -->
    <v-card 
      v-if="atletaSelezionato && schedaSelezionata"
      class="premium-card rounded-2xl text-left border mb-5 animate-slide-down"
      :class="layoutEserciziGlobal === 'super_compatto' ? 'pa-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-4' : 'pa-5')"
      elevation="2"
    >
      <div class="d-flex align-center mb-4">
        <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-database-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-orange-lighten-2 uppercase tracking-widest" style="font-size: 0.72rem;">Backup & Ripristino Scheda</span>
      </div>

      <div class="pa-4 rounded-xl card-glass border-soft" style="background: rgba(30, 41, 59, 0.2) !important;">
        <div class="text-left mb-3">
          <span class="text-caption font-weight-bold text-white d-block">Esporta / Importa Dati Scheda</span>
          <span class="text-super-caption text-muted d-block mt-1" style="font-size: 0.65rem; line-height: 1.3; text-transform: none;">
            Esporta tutti i carichi, ripetizioni, note e completamenti registrati per la scheda attiva (n.{{ schedaSelezionata }}) in un file JSON locale, oppure importa un file salvato in precedenza.
          </span>
        </div>
        <div class="d-flex gap-3 flex-wrap">
          <v-btn
            color="orange-darken-3"
            variant="flat"
            size="small"
            class="font-weight-black text-none rounded-lg text-white flex-grow-1"
            prepend-icon="mdi-download"
            @click="esportaSchedaJSON"
            :loading="esportandoJSON"
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

    <!-- SEZIONE 5: ZONA PERICOLOSA (Reset) -->
    <v-card 
      v-if="atletaSelezionato && schedaSelezionata"
      class="premium-card rounded-2xl text-left border mb-5 animate-slide-down"
      :class="layoutEserciziGlobal === 'super_compatto' ? 'pa-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-4' : 'pa-5')"
      elevation="2"
      style="border-color: rgba(239, 68, 68, 0.2) !important;"
    >
      <div class="d-flex align-center mb-4">
        <v-icon color="red-darken-2" class="mr-2" size="20">mdi-alert-outline</v-icon>
        <span class="text-subtitle-2 font-weight-black text-red-lighten-2 uppercase tracking-widest" style="font-size: 0.72rem;">Zona Pericolosa</span>
      </div>

      <div class="caution-panel pa-4 rounded-xl">
        <div class="d-flex align-start">
          <v-icon color="red-darken-2" class="mr-3 mt-1" size="24">mdi-alert-outline</v-icon>
          <div class="text-left">
            <h4 class="text-caption font-weight-black text-red-lighten-2">Reset Dati di Carico</h4>
            <p class="text-super-caption text-muted mt-1" style="font-size: 0.65rem; line-height: 1.3; opacity: 0.9;">
              Questa operazione cancellerà in modo irreversibile tutti i carichi, i pesi e i commenti registrati per la scheda attiva (n.{{ schedaSelezionata }}).
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

    <!-- SEZIONE 5: LOGOUT -->
    <v-btn
      color="red-darken-2"
      variant="outlined"
      block
      size="large"
      rounded="xl"
      class="font-weight-black text-none py-3 mb-6 animate-slide-down"
      @click="disconnettiAccount"
    >
      <v-icon left class="mr-2">mdi-logout</v-icon>
      Disconnetti Account
    </v-btn>

    <!-- Dialog Conferma Reset -->
    <v-dialog v-model="confermaReset" max-width="400" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border" style="background: var(--card-bg-dark) !important; border-color: rgba(239, 68, 68, 0.3) !important;">
        <v-card-title class="font-weight-black text-red-lighten-2 d-flex align-center px-0">
          <v-icon color="red-lighten-2" class="mr-2">mdi-alert-circle-outline</v-icon>
          Conferma Reset ⚠️
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-2" style="color: #cbd5e1 !important; line-height: 1.5;">
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
          Conferma Ripristino Dati ⚠️
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-2" style="color: #cbd5e1 !important; line-height: 1.5;">
          Stai per sovrascrivere i dati correnti con il backup caricato.
          <br><br>
          Dati nel file di backup:
          <ul class="mt-2 mb-3 pl-4">
            <li>Atleta: <strong>{{ importedMetadata.atletaNome || importedMetadata.atletaId }}</strong></li>
            <li>Scheda: <strong>{{ importedMetadata.numScheda }}</strong></li>
            <li>Data backup: <strong>{{ formattaDataEsportazione(importedMetadata.timestamp) }}</strong></li>
          </ul>
          <span v-if="discrepanzaDati" class="text-red-lighten-2 font-weight-black d-block mb-3">
            ⚠️ ATTENZIONE: Il backup caricato non corrisponde all'atleta o alla scheda attualmente attivi (Atleta: {{ getNomeAtleta(atletaSelezionato) }}, Scheda: {{ schedaSelezionata }}).
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
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
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
  regolaProgressioneW2Global
} from '../authStore.js';

const router = useRouter();

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
