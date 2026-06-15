<template>
  <v-container 
    class="px-4 max-width-container min-height-screen home-dashboard"
    :class="layoutEserciziGlobal === 'super_compatto' ? 'py-2' : (layoutEserciziGlobal === 'compatto' ? 'py-4' : 'py-6')"
  >
    <!-- Header Premium e Moderno (Sticky & Compatto) -->
    <div 
      class="sticky-dashboard-header d-flex align-center justify-space-between animate-slide-down"
      :style="{
        paddingTop: (layoutEserciziGlobal === 'super_compatto' ? '6px' : (layoutEserciziGlobal === 'compatto' ? '10px' : '16px')) + ' !important',
        paddingBottom: (layoutEserciziGlobal === 'super_compatto' ? '4px' : (layoutEserciziGlobal === 'compatto' ? '6px' : '8px')) + ' !important',
        marginTop: (layoutEserciziGlobal === 'super_compatto' ? '-6px' : (layoutEserciziGlobal === 'compatto' ? '-10px' : '-16px')) + ' !important',
        marginBottom: (layoutEserciziGlobal === 'super_compatto' ? '8px' : (layoutEserciziGlobal === 'compatto' ? '14px' : '20px')) + ' !important'
      }"
    >
      <div class="d-flex align-center min-width-0">
        <v-avatar size="36" class="profile-avatar elevation-2 bg-transparent border-orange mr-3 flex-shrink-0">
          <v-img src="/logo.png" alt="WoApp Logo"></v-img>
        </v-avatar>
        <div class="text-left min-width-0">
          <div class="d-flex align-baseline gap-1.5 flex-wrap" style="line-height: 1.1;">
            <h1 class="text-subtitle-1 font-weight-black text-slate-dark tracking-tight text-truncate mb-0" style="font-size: 1.05rem !important; line-height: 1.1;">
              {{ nomeAtleta || 'CARICAMENTO...' }}
            </h1>
            <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.62rem; opacity: 0.75; line-height: 1.1;">
              ({{ salutoOrario }})
            </span>
          </div>
          <div class="d-flex align-center mt-1" style="line-height: 1;">
            <v-chip size="x-small" color="orange-darken-3" class="font-weight-black px-1.5 py-0.5" variant="flat" style="height: 16px; font-size: 0.55rem; line-height: 1;">
              SCHEDA {{ schedaSelezionata }}
            </v-chip>
            <span class="text-super-caption font-weight-bold text-muted ml-2 text-truncate" style="font-size: 0.65rem; max-width: 180px; line-height: 1;">
              {{ descrizioneMesociclo || 'Mesociclo' }}
            </span>
          </div>
        </div>
      </div>
      <div class="flex-shrink-0">
        <v-btn
          icon
          color="orange-darken-3"
          variant="tonal"
          size="small"
          class="rounded-lg"
          style="width: 32px; height: 32px;"
          @click="caricaDatiScheda"
          id="btn-refresh"
        >
          <v-icon size="16">mdi-refresh</v-icon>
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
      <!-- Sub-Tabs Premium minimaliste (Stile Tab Pillole Compatte) -->
      <v-tabs
        v-model="subTab"
        color="orange-darken-3"
        align-tabs="center"
        grow
        height="38"
        class="custom-dashboard-tabs rounded-xl border-soft"
        :class="layoutEserciziGlobal === 'super_compatto' ? 'mb-2' : (layoutEserciziGlobal === 'compatto' ? 'mb-3' : 'mb-5')"
        style="background: rgba(15, 23, 42, 0.4) !important;"
      >
        <v-tab value="dati" class="font-weight-black text-none" style="font-size: 0.72rem; letter-spacing: 0.05em; min-height: 38px;">DASHBOARD</v-tab>
        <v-tab value="impostazioni" class="font-weight-black text-none" style="font-size: 0.72rem; letter-spacing: 0.05em; min-height: 38px;">CONFIGURAZIONE</v-tab>
      </v-tabs>

      <v-window v-model="subTab">
        
        <!-- WINDOW 1: DATI SCHEDA (DASHBOARD) -->
        <v-window-item value="dati">
          
          <!-- Warning: Program not definitive ("da finire" flag is active) -->
          <v-card
            v-if="workoutTData && isTrue(workoutTData.flg_da_finire)"
            class="py-3 px-4 mb-4 text-left border card-glass animate-pulse"
            style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05)) !important; border: 1.5px solid rgba(239, 68, 68, 0.4) !important; border-radius: 16px !important;"
          >
            <div class="d-flex align-center">
              <v-icon color="red-lighten-2" class="mr-3 flex-shrink-0" size="28">mdi-alert-decagram</v-icon>
              <div>
                <h4 class="text-subtitle-2 font-weight-black text-red-lighten-2 mb-0.5" style="font-size: 0.85rem !important;">
                  Programma in elaborazione
                </h4>
                <p class="text-slate font-weight-medium mb-0" style="font-size: 0.72rem; line-height: 1.35; color: #cbd5e1 !important;">
                  Questo programma di allenamento <strong>non è ancora definitivo</strong>. Il coach sta lavorando per ultimare la scheda.
                </p>
              </div>
            </div>
          </v-card>

          <!-- Card Riepilogo Mesociclo WORKOUT_T -->
          <v-card 
            class="premium-hero-card rounded-2xl text-left border position-relative overflow-hidden pa-4 mb-5" 
            elevation="3"
          >
            <div class="glowing-accent"></div>
            
            <div class="d-flex align-center justify-space-between mb-4 flex-wrap gap-2">
              <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase tracking-widest" style="font-size: 0.6rem;">
                Riepilogo Scheda Attiva
              </span>
              <v-chip
                v-if="workoutTData"
                color="orange-darken-3"
                size="x-small"
                variant="flat"
                class="font-weight-black px-2 py-0.5 text-white"
                style="height: 18px; font-size: 0.55rem;"
              >
                {{ workoutTData.cod_tipo_avanz_scheda || 'STANDARD' }}
              </v-chip>
            </div>

            <!-- Calendario & Allineamento Tempi -->
            <div class="date-summary-box pa-3.5 rounded-xl border-soft mb-4" style="background: rgba(15, 23, 42, 0.5);">
              <div class="text-center font-weight-black text-orange-lighten-2 text-body-2 mb-3 pb-2 border-bottom-soft" style="font-size: 0.8rem !important; letter-spacing: 0.05em;">
                🏋️ SCHEDA SELEZIONATA: N. {{ schedaSelezionata }}
              </div>
              <v-row dense class="align-center">
                <v-col cols="6" class="border-right-soft pr-3">
                  <div class="text-super-caption text-muted uppercase font-weight-black" style="font-size: 0.55rem;">Data Inizio</div>
                  <div class="text-subtitle-2 font-weight-black text-slate-dark mt-1">
                    📅 {{ workoutTData?.dat_data || dataInizio }}
                  </div>
                </v-col>
                <v-col cols="6" class="pl-3">
                  <div class="text-super-caption text-muted uppercase font-weight-black" style="font-size: 0.55rem;">Scadenza</div>
                  <div class="text-subtitle-2 font-weight-black text-orange-lighten-1 mt-1">
                    🏁 {{ workoutTData?.dat_scadenza || dataFine }}
                  </div>
                </v-col>
              </v-row>
              
              <!-- Allineamento Programma -->
              <div v-if="allineamentoProgramma" class="mt-3 pt-3 border-top-soft d-flex align-center justify-space-between flex-wrap gap-2">
                <span class="text-super-caption text-slate font-weight-bold" style="font-size: 0.65rem;">Stato Programma:</span>
                <v-chip
                  :color="allineamentoProgramma.status === 'in-linea' ? 'green-darken-3' : (allineamentoProgramma.status === 'ritardo' ? 'red-darken-3' : 'blue-darken-3')"
                  size="x-small"
                  class="font-weight-black text-white px-2 py-0.5 pulse-badge"
                  variant="flat"
                  style="font-size: 0.62rem; height: 20px;"
                >
                  <v-icon size="11" class="mr-1">
                    {{ allineamentoProgramma.status === 'in-linea' ? 'mdi-check-circle' : (allineamentoProgramma.status === 'ritardo' ? 'mdi-alert-circle' : 'mdi-trending-up') }}
                  </v-icon>
                  {{ allineamentoProgramma.status === 'in-linea' ? 'IN LINEA' : (allineamentoProgramma.status === 'ritardo' ? 'RITARDO W' + allineamentoProgramma.deltaAbs : 'ANTICIPO W' + allineamentoProgramma.deltaAbs) }}
                </v-chip>
              </div>
            </div>

            <!-- Descrizione del Mesociclo (Focus) -->
            <div v-if="descrizioneMesociclo" class="mb-2">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-widest d-block mb-1.5" style="font-size: 0.55rem;">
                Focus del Mesociclo
              </span>
              <div class="description-callout pa-3 rounded-xl border-orange-darken-3-op text-body-2 text-slate-dark leading-relaxed font-italic" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.08), rgba(249, 115, 22, 0.02)); border-left: 4px solid #f97316; font-size: 0.85rem !important;">
                "{{ descrizioneMesociclo }}"
              </div>
            </div>
          </v-card>

          <!-- Coach Notes Section (Prominent Card) -->
          <v-card 
            v-if="finalCoachNote" 
            class="coaching-notes-card rounded-2xl text-left border pa-4 mb-5" 
            style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.65) 0%, rgba(15, 23, 42, 0.85) 100%) !important; border-color: rgba(245, 158, 11, 0.25) !important;"
            elevation="2"
          >
            <div class="d-flex align-center mb-3">
              <v-avatar color="amber-lighten-5" size="28" class="mr-2.5 border-amber">
                <v-icon color="amber-darken-3" size="14">mdi-comment-text-multiple-outline</v-icon>
              </v-avatar>
              <span class="text-subtitle-2 font-weight-black text-amber-lighten-1" style="font-size: 0.85rem !important;">
                Note dell'Allenatore 📋
              </span>
            </div>
            <div class="text-body-2 text-slate leading-relaxed font-weight-medium" style="color: #cbd5e1 !important; font-size: 0.82rem !important; white-space: pre-wrap;">
              {{ finalCoachNote }}
            </div>
          </v-card>

          <!-- Interactive Metrics Stats Panel -->
          <div class="text-left mb-2.5">
            <span class="text-super-caption text-muted font-weight-black uppercase tracking-widest" style="font-size: 0.62rem;">
              Indicatori Chiave del Mesociclo (Clicca per la lista)
            </span>
          </div>

          <v-row dense class="mb-5">
            <!-- 1. ESERCIZI CON TEST (WEEK 6) -->
            <v-col cols="4" class="pa-1">
              <v-card 
                class="dashboard-action-card rounded-2xl pa-3 d-flex flex-column justify-space-between border-test text-center align-center clickable-stat-card" 
                style="height: 110px !important;"
                @click="vibraTattile(12); mostraTestWeek6 = true"
              >
                <v-avatar color="blue-lighten-5" size="28" class="action-avatar border-blue mb-1">
                  <v-icon color="blue-darken-3" size="14">mdi-dumbbell</v-icon>
                </v-avatar>
                <div class="text-center w-100">
                  <div class="text-h6 font-weight-black text-blue-lighten-2 mt-0.5 leading-none">{{ countTestWeek6 }}</div>
                  <div class="text-super-caption text-muted font-weight-bold mt-1 text-truncate" style="font-size: 0.56rem !important;">
                    Test Week 6
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- 2. NUOVI ESERCIZI (STELLINE) -->
            <v-col cols="4" class="pa-1">
              <v-card 
                class="dashboard-action-card rounded-2xl pa-3 d-flex flex-column justify-space-between border-coaching text-center align-center clickable-stat-card" 
                style="height: 110px !important;"
                @click="!isFirstProgram ? (mostraEserciziNuovi = true) : null"
                :style="isFirstProgram ? 'cursor: default !important;' : ''"
              >
                <v-avatar color="amber-lighten-5" size="28" class="action-avatar border-amber mb-1">
                  <v-icon color="amber-darken-3" size="14">mdi-star-outline</v-icon>
                </v-avatar>
                <div class="text-center w-100">
                  <div v-if="isFirstProgram" class="text-super-caption font-weight-black text-amber-lighten-1 mt-1 leading-tight" style="font-size: 0.6rem !important; line-height: 1.25;">
                    Primo<br>Programma
                  </div>
                  <div v-else>
                    <div class="text-h6 font-weight-black text-amber-lighten-1 mt-0.5 leading-none">{{ countEserciziNuovi }}</div>
                    <div class="text-super-caption text-muted font-weight-bold mt-1 text-truncate" style="font-size: 0.56rem !important;">
                      Nuovi Ex
                    </div>
                  </div>
                </div>
              </v-card>
            </v-col>

            <!-- 3. ESERCIZI CON VIDEO -->
            <v-col cols="4" class="pa-1">
              <v-card 
                class="dashboard-action-card rounded-2xl pa-3 d-flex flex-column justify-space-between border-video text-center align-center clickable-stat-card" 
                style="height: 110px !important;"
                @click="vibraTattile(12); mostraEserciziVideo = true"
              >
                <v-avatar color="red-lighten-5" size="28" class="action-avatar border-red mb-1">
                  <v-icon color="red-darken-3" size="14" :class="{ 'pulse-video-icon': countVideoExercises > 0 }">
                    mdi-video-outline
                  </v-icon>
                </v-avatar>
                <div class="text-center w-100">
                  <div class="text-h6 font-weight-black text-red-lighten-2 mt-0.5 leading-none">{{ countVideoExercises }}</div>
                  <div class="text-super-caption text-muted font-weight-bold mt-1 text-truncate" style="font-size: 0.56rem !important;">
                    Esecuzioni Video
                  </div>
                </div>
              </v-card>
            </v-col>
          </v-row>

          <!-- Silhouette Anatomica / Heatmap Muscolare (Collapsible/Visual Panel) -->
          <v-card 
            class="mesocycle-progress-card rounded-2xl border text-left pa-3 mb-5"
            elevation="2"
            style="background: rgba(15, 23, 42, 0.45) !important;"
          >
            <div class="d-flex align-center justify-space-between mb-3">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-widest" style="font-size: 0.6rem;">
                Anatomia dei Volumi di Lavoro
              </span>
              <div class="d-flex align-center gap-1" @click.stop>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  :color="heatmapScope === 'giorno' ? 'orange' : 'grey-lighten-1'"
                  class="px-1"
                  style="height: 18px; font-size: 0.52rem; min-width: 0; border-radius: 4px;"
                  @click="heatmapScope = heatmapScope === 'giorno' ? 'settimana' : 'giorno'"
                >
                  {{ heatmapScope === 'giorno' ? 'Giorno' : 'Sett.' }}
                </v-btn>
                <v-btn
                  size="x-small"
                  variant="tonal"
                  :color="heatmapMode === 'completati' ? 'orange' : 'grey-lighten-1'"
                  class="px-1"
                  style="height: 18px; font-size: 0.52rem; min-width: 0; border-radius: 4px;"
                  @click="heatmapMode = heatmapMode === 'completati' ? 'programmati' : 'completati'"
                >
                  {{ heatmapMode === 'completati' ? 'Fatti' : 'Prog.' }}
                </v-btn>
              </div>
            </div>

            <v-row dense class="align-center">
              <v-col cols="7" class="text-left">
                <!-- Focus muscolare del giorno consigliato -->
                <div class="text-body-2 font-weight-black text-slate-dark">
                  Giorno consigliato: <span class="text-orange-lighten-2 font-weight-black">{{ giornoConsigliato }}</span>
                </div>
                <div class="text-caption font-weight-bold text-slate mt-1">
                  🎯 Focus: {{ getFocusSectors(giornoConsigliato) }}
                </div>
                <!-- Mini Equalizzatore volumi -->
                <div v-if="activeDayVolumesParsed" class="mt-3">
                  <div class="d-flex align-center justify-space-between text-super-caption text-muted uppercase mb-1" style="font-size: 0.52rem;">
                    <span>A/B/C Volumi</span>
                    <span>{{ activeDayVolumesParsed.totale }} serie</span>
                  </div>
                  <v-row dense class="text-center font-weight-bold text-caption mt-0.5">
                    <v-col cols="4" class="pa-0.5">
                      <div class="py-0.5 px-1 bg-slate-900 rounded border-soft" style="font-size: 0.6rem;">
                        <span class="text-blue-lighten-2">{{ activeDayVolumesParsed.alta }}A</span>
                      </div>
                    </v-col>
                    <v-col cols="4" class="pa-0.5">
                      <div class="py-0.5 px-1 bg-slate-900 rounded border-soft" style="font-size: 0.6rem;">
                        <span class="text-orange-lighten-2">{{ activeDayVolumesParsed.bassa }}B</span>
                      </div>
                    </v-col>
                    <v-col cols="4" class="pa-0.5">
                      <div class="py-0.5 px-1 bg-slate-900 rounded border-soft" style="font-size: 0.6rem;">
                        <span class="text-green-lighten-2">{{ activeDayVolumesParsed.centrale }}C</span>
                      </div>
                    </v-col>
                  </v-row>
                </div>
              </v-col>
              <v-col cols="5" class="d-flex align-center justify-center">
                <div class="heatmap-container rounded-lg pa-1.5 border" style="background: rgba(15, 23, 42, 0.55) !important; border-color: rgba(255, 255, 255, 0.08) !important; width: 100px; height: 85px; overflow: hidden;">
                  <svg viewBox="0 0 100 120" width="100%" height="100%" style="display: block;">
                    <!-- FRONTE (X: 10-45) -->
                    <circle cx="27" cy="14" r="5.5" :fill="getMuscleColor('Altro')" :stroke="getMuscleStroke('Altro')" stroke-width="0.8" />
                    <path d="M16,24 L22,23 L25,26 L18,27 Z" :fill="getMuscleColor('Spalle')" :stroke="getMuscleStroke('Spalle')" stroke-width="0.8" />
                    <path d="M38,24 L32,23 L29,26 L36,27 Z" :fill="getMuscleColor('Spalle')" :stroke="getMuscleStroke('Spalle')" stroke-width="0.8" />
                    <rect x="13" y="28" width="4.5" height="15" rx="1.5" :fill="getMuscleColor('Bicipiti')" :stroke="getMuscleStroke('Bicipiti')" stroke-width="0.8" />
                    <rect x="36.5" y="28" width="4.5" height="15" rx="1.5" :fill="getMuscleColor('Bicipiti')" :stroke="getMuscleStroke('Bicipiti')" stroke-width="0.8" />
                    <rect x="19" y="28" width="7.5" height="9" rx="1" :fill="getMuscleColor('Pettorali')" :stroke="getMuscleStroke('Pettorali')" stroke-width="0.8" />
                    <rect x="27.5" y="28" width="7.5" height="9" rx="1" :fill="getMuscleColor('Pettorali')" :stroke="getMuscleStroke('Pettorali')" stroke-width="0.8" />
                    <rect x="21" y="38" width="12" height="14" rx="1" :fill="getMuscleColor('Addome')" :stroke="getMuscleStroke('Addome')" stroke-width="0.8" />
                    <rect x="19.5" y="54" width="6.5" height="30" rx="1.5" :fill="getMuscleColor('Gambe')" :stroke="getMuscleStroke('Gambe')" stroke-width="0.8" />
                    <rect x="28" y="54" width="6.5" height="30" rx="1.5" :fill="getMuscleColor('Gambe')" :stroke="getMuscleStroke('Gambe')" stroke-width="0.8" />
                    
                    <!-- RETRO (X: 55-90) -->
                    <circle cx="73" cy="14" r="5.5" :fill="getMuscleColor('Altro')" :stroke="getMuscleStroke('Altro')" stroke-width="0.8" />
                    <path d="M62,24 L68,23 L71,26 L64,27 Z" :fill="getMuscleColor('Spalle')" :stroke="getMuscleStroke('Spalle')" stroke-width="0.8" />
                    <path d="M84,24 L78,23 L75,26 L82,27 Z" :fill="getMuscleColor('Spalle')" :stroke="getMuscleStroke('Spalle')" stroke-width="0.8" />
                    <rect x="59" y="28" width="4.5" height="15" rx="1.5" :fill="getMuscleColor('Tricipiti')" :stroke="getMuscleStroke('Tricipiti')" stroke-width="0.8" />
                    <rect x="90.5" y="28" width="4.5" height="15" rx="1.5" :fill="getMuscleColor('Tricipiti')" :stroke="getMuscleStroke('Tricipiti')" stroke-width="0.8" />
                    <path d="M65,28 L72.5,30 L72.5,42 L63,36 Z" :fill="getMuscleColor('Dorsali')" :stroke="getMuscleStroke('Dorsali')" stroke-width="0.8" />
                    <path d="M81,28 L73.5,30 L73.5,42 L83,36 Z" :fill="getMuscleColor('Dorsali')" :stroke="getMuscleStroke('Dorsali')" stroke-width="0.8" />
                    <rect x="65.5" y="44" width="13" height="8" rx="1" :fill="getMuscleColor('Gambe')" :stroke="getMuscleStroke('Gambe')" stroke-width="0.8" />
                    <rect x="64.5" y="54" width="6.5" height="30" rx="1.5" :fill="getMuscleColor('Gambe')" :stroke="getMuscleStroke('Gambe')" stroke-width="0.8" />
                    <rect x="73" y="54" width="6.5" height="30" rx="1.5" :fill="getMuscleColor('Gambe')" :stroke="getMuscleStroke('Gambe')" stroke-width="0.8" />
                  </svg>
                </div>
              </v-col>
            </v-row>
          </v-card>

          <!-- Avanzamento Settimanale Orizzontale (Timeline a Sfere di Cristallo) -->
          <v-card 
            class="mesocycle-progress-card rounded-2xl border text-left pa-4 mb-5" 
            elevation="2"
          >
            <div class="d-flex align-center justify-space-between mb-4">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-widest" style="font-size: 0.62rem;">
                Progressione Settimanale
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
                  'step-completed': w <= settimaneChiuse,
                  'step-active': w === settimaneChiuse + 1 && settimaneChiuse < 6,
                  'step-future': w > settimaneChiuse + 1
                }"
              >
                <div class="step-ring d-flex align-center justify-center">
                  <v-icon v-if="w <= settimaneChiuse" size="14" color="white">mdi-check</v-icon>
                  <span v-else class="step-number">{{ w }}</span>
                </div>
                <span class="step-label text-super-caption font-weight-black mt-2" style="font-size: 0.58rem;">
                  {{ w <= settimaneChiuse ? 'Fatta' : (w === settimaneChiuse + 1 && settimaneChiuse < 6 ? 'Attiva' : 'Da fare') }}
                </span>
              </div>
            </div>
          </v-card>

          <!-- Primary launch action -->
          <v-btn
            color="orange-darken-3"
            block
            size="large"
            rounded="xl"
            class="font-weight-black text-none py-3 text-white glowing-btn animate-pulse-slow mb-4"
            @click="avviaAllenamento"
            id="hero-play-btn"
          >
            APRI ALLENAMENTO GIORNO {{ giornoAttivo }}
            <v-icon right class="ml-2" size="20">mdi-play-circle-outline</v-icon>
          </v-btn>

          <!-- Report Progressioni Carichi Button -->
          <v-btn
            color="orange-darken-3"
            block
            variant="outlined"
            size="medium"
            rounded="xl"
            class="font-weight-black text-none py-2 card-glass text-white mb-2"
            style="height: 44px; border-color: rgba(249, 115, 22, 0.45) !important;"
            @click="dialogProgressioni = true"
          >
            📈 ANALISI PROGRESSIONI & REPORT
          </v-btn>
        </v-window-item>

        <!-- WINDOW 2: CONFIGURAZIONE SCHEDA -->
        <v-window-item value="impostazioni">
          <v-card 
            class="premium-card rounded-2xl text-left border" 
            :class="layoutEserciziGlobal === 'super_compatto' ? 'pa-3' : (layoutEserciziGlobal === 'compatto' ? 'pa-4' : 'pa-5')"
            elevation="2"
          >
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
                  <span v-if="settimanaAttiva === 6" class="ml-1 text-white font-weight-black"> (Ultima!)</span>
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
              <v-list-item-subtitle class="text-caption text-orange-darken-3 text-left">Giorno <span class="font-weight-black">{{ ex.des_giorno }}{{ ex.num_riga_giorno }}</span></v-list-item-subtitle>
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

    <!-- dialog TEST WEEK 6 (Interactive List) -->
    <v-dialog v-model="mostraTestWeek6" max-width="500" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border">
        <v-card-title class="font-weight-black text-slate-dark d-flex align-center px-0">
          <v-icon color="blue-darken-3" class="mr-2">mdi-dumbbell</v-icon>
          Test alla Week 6 🏋️
        </v-card-title>
        <v-card-text class="px-0 py-4">
          <div v-if="testWeek6List.length === 0" class="text-center py-4 text-muted text-body-2">
            Nessun test previsto per la Week 6 in questa scheda.
          </div>
          <v-list v-else density="comfortable" class="bg-transparent py-0">
            <v-list-item
              v-for="ex in testWeek6List"
              :key="ex.id"
              class="px-0 py-2 border-bottom-soft cursor-pointer"
              @click="vibraTattile(12); mostraTestWeek6 = false; router.push({ name: 'DettaglioWorkout', params: { id: ex.id } })"
            >
              <div class="d-flex align-center w-100 justify-space-between text-left">
                <div>
                  <div class="font-weight-bold text-slate-dark text-body-2">{{ ex.des_esercizio }}</div>
                  <div class="text-caption text-blue-lighten-2 mt-0.5">
                    Giorno {{ ex.des_giorno }} • Riga {{ ex.num_riga_giorno }} • {{ ex.des_settore }}
                  </div>
                  <div class="text-super-caption text-orange-lighten-2 mt-0.5 font-weight-black">
                    Test W6: {{ ex.des_week6 }}
                  </div>
                </div>
                <v-icon color="orange" size="18">mdi-chevron-right</v-icon>
              </div>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraTestWeek6 = false" class="text-white font-weight-bold">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog ESERCIZI NUOVI (Interactive List) -->
    <v-dialog v-model="mostraEserciziNuovi" max-width="500" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border">
        <v-card-title class="font-weight-black text-slate-dark d-flex align-center px-0">
          <v-icon color="orange-darken-3" class="mr-2">mdi-star-outline</v-icon>
          Nuovi Esercizi ✨
        </v-card-title>
        <v-card-text class="px-0 py-4">
          <div v-if="eserciziNuoviList.length === 0" class="text-center py-4 text-muted text-body-2">
            Nessun nuovo esercizio introdotto in questo mesociclo.
          </div>
          <v-list v-else density="comfortable" class="bg-transparent py-0">
            <v-list-item
              v-for="ex in eserciziNuoviList"
              :key="ex.id"
              class="px-0 py-2 border-bottom-soft cursor-pointer"
              @click="vibraTattile(12); mostraEserciziNuovi = false; router.push({ name: 'DettaglioWorkout', params: { id: ex.id } })"
            >
              <div class="d-flex align-center w-100 justify-space-between text-left">
                <div>
                  <div class="font-weight-bold text-slate-dark text-body-2">{{ ex.des_esercizio }}</div>
                  <div class="text-caption text-orange-lighten-2 mt-0.5">
                    Giorno {{ ex.des_giorno }} • Riga {{ ex.num_riga_giorno }} • {{ ex.des_settore }}
                  </div>
                </div>
                <v-icon color="orange" size="18">mdi-chevron-right</v-icon>
              </div>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraEserciziNuovi = false" class="text-white font-weight-bold">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog ESERCIZI VIDEO (Interactive List) -->
    <v-dialog v-model="mostraEserciziVideo" max-width="500" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border">
        <v-card-title class="font-weight-black text-slate-dark d-flex align-center px-0">
          <v-icon color="red-darken-3" class="mr-2">mdi-video-outline</v-icon>
          Esercizi con Video richiesto 📹
        </v-card-title>
        <v-card-text class="px-0 py-4">
          <div v-if="videoExercisesList.length === 0" class="text-center py-4 text-muted text-body-2">
            Nessun video richiesto per questa scheda dal coach.
          </div>
          <v-list v-else density="comfortable" class="bg-transparent py-0">
            <v-list-item
              v-for="ex in videoExercisesList"
              :key="ex.id"
              class="px-0 py-2 border-bottom-soft cursor-pointer"
              @click="vibraTattile(12); mostraEserciziVideo = false; router.push({ name: 'DettaglioWorkout', params: { id: ex.id } })"
            >
              <div class="d-flex align-center w-100 justify-space-between text-left">
                <div>
                  <div class="font-weight-bold text-slate-dark text-body-2">{{ ex.des_esercizio }}</div>
                  <div class="text-caption text-red-lighten-2 mt-0.5">
                    Giorno {{ ex.des_giorno }} • Riga {{ ex.num_riga_giorno }} • {{ ex.des_settore }}
                  </div>
                </div>
                <v-icon color="orange" size="18">mdi-chevron-right</v-icon>
              </div>
            </v-list-item>
          </v-list>
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraEserciziVideo = false" class="text-white font-weight-bold">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Progressioni Premium -->
    <v-dialog
      v-model="dialogProgressioni"
      max-width="500"
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card class="card-glass rounded-2xl border" style="background: rgba(15, 23, 42, 0.9) !important; border-color: rgba(255, 255, 255, 0.1) !important; backdrop-filter: blur(20px) !important;">
        <v-card-title class="d-flex align-center justify-space-between py-4 px-5 border-bottom">
          <div class="d-flex align-center">
            <v-icon color="orange-darken-3" class="mr-2" size="22">mdi-chart-line-variant</v-icon>
            <span class="font-weight-black text-slate-dark text-subtitle-1" style="letter-spacing: 0.05em; font-size: 1rem !important;">
              REPORT PROGRESSIONI
            </span>
          </div>
          <v-btn icon size="small" variant="text" color="slate-dark" @click="dialogProgressioni = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4 pt-3" style="max-height: 60vh;">
          <!-- 1. Consistenza Generale -->
          <div class="metric-pill pa-4 rounded-xl mb-4 text-center border-soft" style="background: rgba(30, 41, 59, 0.3) !important;">
            <div class="d-flex align-center justify-space-between mb-2">
              <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.6rem;">Consistenza Allenamenti</span>
              <span class="text-caption font-weight-black text-green-accent-4">{{ reportProgressioni.percentualeConsistenza }}%</span>
            </div>
            <v-progress-linear
              :model-value="reportProgressioni.percentualeConsistenza"
              color="green-accent-4"
              height="8"
              rounded
              striped
              class="mb-3"
            ></v-progress-linear>
            <div class="d-flex align-center justify-space-around flex-wrap gap-2 text-super-caption text-muted font-weight-bold" style="font-size: 0.62rem;">
              <span v-for="w in [1, 2, 3, 4, 5, 6]" :key="w" class="px-2 py-0.5 rounded bg-slate-900 border-soft">
                W{{ w }}: <strong class="text-white">{{ reportProgressioni.consistenzaGiorni[w] }}</strong> giorni
              </span>
            </div>
          </div>

          <!-- 2. Feeling e Performance -->
          <v-row dense class="mb-4">
            <v-col cols="6">
              <div class="metric-pill pa-3 rounded-xl text-center border-soft" style="background: rgba(30, 41, 59, 0.3) !important; height: 100%;">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.55rem;">Sensazione Media</span>
                <span class="text-h6 font-weight-black text-orange-lighten-2 mt-1 d-block">
                  ⭐ {{ reportProgressioni.mediaFeeling || '-' }} <span class="text-caption text-muted">/ 5</span>
                </span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.55rem;">Feeling generale</span>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="metric-pill pa-3 rounded-xl text-center border-soft" style="background: rgba(30, 41, 59, 0.3) !important; height: 100%;">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.55rem;">Progressioni Carico</span>
                <span class="text-h6 font-weight-black text-green-accent-4 mt-1 d-block">
                  📈 {{ reportProgressioni.progressioniCarichi.length }}
                </span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.55rem;">Esercizi migliorati</span>
              </div>
            </v-col>
          </v-row>

          <!-- 3. Lista Progressioni Carichi -->
          <div class="text-left mb-2">
            <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.6rem;">Incrementi di Carico Rilevati</span>
          </div>

          <div v-if="reportProgressioni.progressioniCarichi.length === 0" class="text-center py-6 card-glass rounded-xl border-soft" style="background: rgba(30, 41, 59, 0.15) !important;">
            <v-icon color="grey" size="32">mdi-chart-line-stacked</v-icon>
            <p class="text-caption text-muted mt-2 mb-0">Nessuna progressione registrata tra Week 1 e successive.</p>
          </div>

          <div v-else class="d-flex flex-column gap-2">
            <v-card
              v-for="(p, idx) in reportProgressioni.progressioniCarichi"
              :key="idx"
              class="pa-3 rounded-xl border-soft text-left cursor-pointer clickable-progression-card"
              style="background: rgba(30, 41, 59, 0.25) !important; border: 1px solid rgba(255, 255, 255, 0.05) !important;"
              flat
              @click="vibraTattile(10); router.push({ name: 'DettaglioWorkout', params: { id: p.id } }); dialogProgressioni = false"
            >
              <div class="d-flex align-center justify-space-between mb-1.5">
                <span class="text-caption font-weight-black text-slate-dark text-truncate" style="max-width: 70%;">
                  {{ p.nome }}
                </span>
                <v-chip color="green-darken-3" size="x-small" class="font-weight-black text-white px-2 py-0.5" variant="flat">
                  🔥 +{{ p.pct }}%
                </v-chip>
              </div>
              <div class="d-flex align-center justify-space-between">
                <div class="d-flex align-center text-super-caption text-slate" style="font-size: 0.65rem;">
                  <span>W1: <strong>{{ p.w1 }} kg</strong></span>
                  <v-icon size="12" class="mx-1" color="orange">mdi-arrow-right</v-icon>
                  <span>W{{ p.latestWeek }}: <strong>{{ p.latest }} kg</strong></span>
                </div>
                <div class="text-super-caption text-green-accent-4 font-weight-black" style="font-size: 0.68rem;">
                  +{{ p.delta }} kg
                </div>
              </div>
            </v-card>
          </div>

          <!-- 4. Feedback Percezione Sforzo W6 -->
          <div v-if="reportProgressioni.consistenzaGiorni[6] > 0" class="mt-4 pt-4 border-top-soft text-left">
            <span class="text-super-caption text-muted font-weight-black uppercase d-block mb-2" style="font-size: 0.6rem;">Sforzo Percepito Week 6</span>
            <div class="d-flex align-center justify-space-around gap-2 text-center text-super-caption font-weight-bold">
              <div class="flex-grow-1 py-1 rounded bg-slate-900 border-soft text-green-lighten-2">
                Media: <strong>{{ reportProgressioni.miglioriFatiche.Media }}</strong>
              </div>
              <div class="flex-grow-1 py-1 rounded bg-slate-900 border-soft text-orange-lighten-2">
                Pesante: <strong>{{ reportProgressioni.miglioriFatiche.Pesante }}</strong>
              </div>
              <div class="flex-grow-1 py-1 rounded bg-slate-900 border-soft text-red-lighten-2">
                Devastante: <strong>{{ reportProgressioni.miglioriFatiche.Devastante }}</strong>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 pt-1 border-top gap-2">
          <v-btn
            prepend-icon="mdi-file-pdf-box"
            color="red-darken-3"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-black text-none text-white flex-grow-1"
            @click="scaricaReportPDF"
            style="height: 36px; font-size: 0.72rem !important;"
          >
            Esporta PDF
          </v-btn>
          <v-btn
            color="orange-darken-3"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-black text-none text-white flex-grow-1"
            @click="dialogProgressioni = false"
            style="height: 36px; font-size: 0.72rem !important;"
          >
            Chiudi
          </v-btn>
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
import { selectedAthlete, selectedSheet, inizializzaSessione, utente, getNomeAtleta, activeTimer, stopGlobalTimer, setGlobalHaEserciziDaFare, setGlobalSettimanaDaChiudere, globalStoryboard, loadingStoryboard, layoutEserciziGlobal } from '../authStore.js';
import { jsPDF } from 'jspdf';

const router = useRouter();

const vibraTattile = (ms = 12) => {
  if (localStorage.getItem('woapp_vibrazione_attiva') === 'false') return;
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Stato principale
const subTab = ref('dati');
const atletaSelezionato = ref(selectedAthlete.value);
const schedaSelezionata = ref(selectedSheet.value);

const dialogProgressioni = ref(false);

const reportProgressioni = computed(() => {
  const result = {
    progressioniCarichi: [],
    mediaFeeling: 0,
    totaleEserciziConCarichi: 0,
    consistenzaGiorni: {
      1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
    },
    percentualeConsistenza: 0,
    miglioriFatiche: {
      Media: 0,
      Pesante: 0,
      Devastante: 0
    }
  };

  if (!allExercises.value || allExercises.value.length === 0) return result;

  const parsePeso = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/,/g, '.').replace(/[^\d.]/g, ' ').trim();
    const parts = clean.split(/\s+/);
    const num = parseFloat(parts[0]);
    return isNaN(num) ? 0 : num;
  };

  let sommaFeeling = 0;
  let countFeeling = 0;

  allExercises.value.forEach(ex => {
    if (parseInt(ex.num_riga_giorno) === 0) return;

    const feeling = parseInt(ex.ind_reps_start);
    if (feeling > 0) {
      sommaFeeling += feeling;
      countFeeling++;
    }

    const fatica = ex.num_faticaw6;
    if (fatica && result.miglioriFatiche[fatica] !== undefined) {
      result.miglioriFatiche[fatica]++;
    }

    const w1Peso = parsePeso(ex.ins_week1);
    if (w1Peso > 0) {
      result.totaleEserciziConCarichi++;
      for (let w = 6; w >= 2; w--) {
        const wPeso = parsePeso(ex['ins_week' + w]);
        if (wPeso > w1Peso) {
          const delta = parseFloat((wPeso - w1Peso).toFixed(1));
          const pct = Math.round((delta / w1Peso) * 100);
          result.progressioniCarichi.push({
            id: ex.id,
            nome: ex.des_esercizio || 'Esercizio',
            w1: w1Peso,
            latest: wPeso,
            latestWeek: w,
            delta: delta,
            pct: pct
          });
          break;
        }
      }
    }
  });

  result.mediaFeeling = countFeeling > 0 ? parseFloat((sommaFeeling / countFeeling).toFixed(1)) : 0;

  const righeZero = allExercises.value.filter(item => parseInt(item.num_riga_giorno) === 0);
  const totaleGiorni = righeZero.length;
  if (totaleGiorni > 0) {
    let totaleChiusurePossibili = totaleGiorni * 6;
    let chiusureEffettive = 0;
    
    for (let w = 1; w <= 6; w++) {
      let chiuseInWeek = 0;
      righeZero.forEach(header => {
        if (isTrue(header['cmp' + w])) {
          chiuseInWeek++;
          chiusureEffettive++;
        }
      });
      result.consistenzaGiorni[w] = chiuseInWeek;
    }
    result.percentualeConsistenza = Math.round((chiusureEffettive / totaleChiusurePossibili) * 100);
  }

  result.progressioniCarichi.sort((a, b) => b.pct - a.pct);

  return result;
});

// Dati dinamici scheda
const nomeAtleta = ref(getNomeAtleta(selectedAthlete.value).toUpperCase() || '');
const settimanaAttiva = ref(parseInt(localStorage.getItem('settimanaAttiva_' + selectedAthlete.value)) || 2);
const giornoAttivo = ref(localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'C');
const dataInizio = ref('18 mag 26');
const dataFine = ref('28 giu 26');
const descrizioneMesociclo = ref('');
const workoutTData = ref(null);

const mostraTestWeek6 = ref(false);
const mostraEserciziNuovi = ref(false);
const mostraEserciziVideo = ref(false);

const allineamentoProgramma = computed(() => {
  const dateStr = workoutTData.value?.dat_data || dataInizio.value;
  if (!dateStr) return null;
  const startDate = parseDateString(dateStr);
  if (!startDate) return null;

  const today = new Date();
  today.setHours(0,0,0,0);
  startDate.setHours(0,0,0,0);
  
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let weekTeorica = Math.floor(diffDays / 7) + 1;
  if (weekTeorica < 1) weekTeorica = 1;
  
  const activeW = settimanaAttiva.value;
  const delta = activeW - weekTeorica;
  
  return {
    weekTeorica,
    weekAttiva: activeW,
    delta,
    status: delta === 0 ? 'in-linea' : (delta < 0 ? 'ritardo' : 'anticipo'),
    deltaAbs: Math.abs(delta)
  };
});

const testWeek6List = computed(() => {
  if (!allExercises.value || allExercises.value.length === 0) return [];
  return allExercises.value.filter(ex => {
    if (parseInt(ex.num_riga_giorno) === 0) return false;
    const w6 = String(ex.des_week6 || '').toUpperCase();
    return w6.includes('AMRAP') || w6.includes('RAMP+TEST') || w6.includes('TEST') || w6.includes('RAMP TEST');
  });
});
const countTestWeek6 = computed(() => testWeek6List.value.length);

const isFirstProgram = computed(() => String(schedaSelezionata.value) === '1');

const eserciziNuoviList = computed(() => {
  if (!allExercises.value || allExercises.value.length === 0) return [];
  if (isFirstProgram.value) return [];
  return allExercises.value.filter(ex => {
    if (parseInt(ex.num_riga_giorno) === 0) return false;
    return ex.flg_ex_mai_fatto === 'false' || ex.flg_ex_mai_fatto === false;
  });
});
const countEserciziNuovi = computed(() => eserciziNuoviList.value.length);

const videoExercisesList = computed(() => {
  if (!allExercises.value || allExercises.value.length === 0) return [];
  return allExercises.value.filter(ex => {
    if (parseInt(ex.num_riga_giorno) === 0) return false;
    return ex.flg_video === 'true' || ex.flg_video === true;
  });
});
const countVideoExercises = computed(() => videoExercisesList.value.length);

const finalCoachNote = computed(() => {
  return workoutTData.value?.des_note || coachMessage.value || '';
});

const formattaPassi = (val) => {
  if (val === undefined || val === null || val === '') return 'N/D';
  const cleanStr = String(val).replace(/\./g, '').replace(/,/g, '').trim();
  const num = parseInt(cleanStr);
  if (isNaN(num) || num === 0) return 'Libero 🏃';
  return num.toLocaleString('it-IT') + ' / giorno';
};

const isTrue = (val) => {
  if (val === undefined || val === null) return false;
  if (typeof val === 'boolean') return val;
  const str = String(val).toUpperCase().trim();
  return str === 'TRUE' || str === 'SÌ' || str === 'SI' || str === '1';
};

const parsePercentuale = (val) => {
  if (!val) return 0;
  const clean = String(val).replace(',', '.').trim();
  return parseFloat(clean) || 0;
};

const parseDateString = (str) => {
  if (!str) return null;
  const s = String(str).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
    const parts = s.substring(0, 10).split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  }
  if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(s)) {
    const parts = s.split(' ')[0].split('/');
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  }
  const t = Date.parse(s);
  if (!isNaN(t)) {
    return new Date(t);
  }
  return null;
};

const applicaFallbackWorkoutT = (tempExercises) => {
  if (workoutTData.value || tempExercises.length === 0) return;

  let minDate = null;
  let sheetId = "";
  let coachNote = "";

  for (const rec of tempExercises) {
    if (rec.ID_scheda && !sheetId) sheetId = String(rec.ID_scheda);
    if (rec.des_note && !coachNote) coachNote = rec.des_note;

    if (parseInt(rec.num_riga_giorno) === 0) {
      const dates = [
        rec.start_wo, rec.start2_wo, rec.start3_wo,
        rec.start4_wo, rec.start5_wo, rec.start6_wo
      ].filter(Boolean);

      for (const dStr of dates) {
        const parsed = parseDateString(dStr);
        if (parsed) {
          if (!minDate || parsed < minDate) {
            minDate = parsed;
          }
        }
      }
    }
  }

  if (minDate) {
    const d = String(minDate.getDate()).padStart(2, '0');
    const m = String(minDate.getMonth() + 1).padStart(2, '0');
    const y = minDate.getFullYear();
    const startDateStr = `${d}/${m}/${y}`;
    
    const expDate = new Date(minDate.getTime() + 42 * 24 * 60 * 60 * 1000);
    const ed = String(expDate.getDate()).padStart(2, '0');
    const em = String(expDate.getMonth() + 1).padStart(2, '0');
    const ey = expDate.getFullYear();
    const expDateStr = `${ed}/${em}/${ey}`;

    dataInizio.value = startDateStr;
    dataFine.value = expDateStr;
    descrizioneMesociclo.value = "Mesociclo Definitivo";

    workoutTData.value = {
      ID_cliente: selectedAthlete.value,
      num_scheda: selectedSheet.value,
      dat_data: startDateStr,
      dat_scadenza: expDateStr,
      des_descrizione: "Mesociclo Definitivo",
      des_note: coachNote,
      flg_da_finire: "true",
      flg_ramp_test: "true",
      num_passi_gg: 0,
      cod_tipo_avanz_scheda: "0DEF",
      num_perc_compl: 0,
      ID_scheda: sheetId || "0",
      PropostaWoManuale: "FALSE",
      SceltaGiorno: "A",
      SceltaWeek: 1
    };
  }
};

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

// Muscle Heatmap States and Helpers
const heatmapScope = ref('giorno'); // 'giorno' or 'settimana'
const heatmapMode = ref('programmati'); // 'programmati' or 'completati'

const getSettorePrincipale = (s) => {
  if (!s) return 'Altro';
  const clean = s.toLowerCase().trim();
  if (clean.includes('petto') || clean.includes('pettorali') || clean.includes('chest')) {
    return 'Pettorali';
  }
  if (clean.includes('dorso') || clean.includes('dorsali') || clean.includes('schiena') || clean.includes('back')) {
    return 'Dorsali';
  }
  if (clean.includes('spalle') || clean.includes('deltoidi') || clean.includes('shoulder')) {
    return 'Spalle';
  }
  if (clean.includes('bicipiti') || clean.includes('bicipite') || clean.includes('biceps')) {
    return 'Bicipiti';
  }
  if (clean.includes('tricipiti') || clean.includes('tricipite') || clean.includes('triceps')) {
    return 'Tricipiti';
  }
  if (clean.includes('gambe') || clean.includes('quadricipiti') || clean.includes('femorali') || clean.includes('glutei') || clean.includes('leg') || clean.includes('polpacci')) {
    return 'Gambe';
  }
  if (clean.includes('addome') || clean.includes('addominali') || clean.includes('core') || clean.includes('obliqui') || clean.includes('abs')) {
    return 'Addome';
  }
  return 'Altro';
};

const volumeMuscolare = computed(() => {
  const vol = {
    Pettorali: 0,
    Dorsali: 0,
    Spalle: 0,
    Bicipiti: 0,
    Tricipiti: 0,
    Gambe: 0,
    Addome: 0,
    Altro: 0
  };
  
  if (!allExercises.value || allExercises.value.length === 0) return vol;
  
  const targetExercises = allExercises.value.filter(ex => {
    if (parseInt(ex.num_riga_giorno) === 0) return false;
    if (heatmapScope.value === 'giorno') {
      return (ex.des_giorno || '').trim().toUpperCase() === giornoAttivo.value;
    }
    return true; // Settimana
  });
  
  targetExercises.forEach(ex => {
    const isCompleted = () => {
      const logVal = ex['ins_week' + settimanaAttiva.value] || '';
      return logVal && logVal.trim() !== '' && logVal.trim() !== '-';
    };
    
    if (heatmapMode.value === 'programmati' || isCompleted()) {
      const settore = getSettorePrincipale(ex.des_settore);
      const prescrizione = ex['des_week' + settimanaAttiva.value] || ex.des_qta_report || '';
      
      let sets = 3;
      const match = String(prescrizione).trim().toLowerCase().match(/^(\d+)(?:\s*[-/]\s*\d+)?\s*[x*]/);
      if (match) {
        sets = parseInt(match[1]) || 3;
      }
      
      if (vol[settore] !== undefined) {
        vol[settore] += sets;
      }
    }
  });
  
  return vol;
});

const getMuscleColor = (sector) => {
  const v = volumeMuscolare.value[sector] || 0;
  if (v === 0) return 'rgba(255, 255, 255, 0.05)';
  if (v <= 4) return 'rgba(249, 115, 22, 0.35)';
  if (v <= 8) return 'rgba(249, 115, 22, 0.65)';
  if (v <= 12) return 'rgba(249, 115, 22, 0.85)';
  return '#f97316';
};

const getMuscleStroke = (sector) => {
  const v = volumeMuscolare.value[sector] || 0;
  if (v === 0) return 'rgba(255, 255, 255, 0.12)';
  return 'rgba(249, 115, 22, 0.9)';
};


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

// Calcola quante settimane sono state completamente chiuse sequentially a partire dalle righe zero
const settimaneChiuse = computed(() => {
  const exercises = allExercises.value;
  const activeDays = [...new Set(exercises
    .filter(item => parseInt(item.num_riga_giorno) === 0)
    .map(item => (item.des_giorno || '').trim().toUpperCase())
  )].filter(Boolean);

  if (activeDays.length === 0) return 0;

  let count = 0;
  for (let w = 1; w <= 6; w++) {
    const isChiusa = activeDays.every(g => {
      const header = exercises.find(
        item => (item.des_giorno || '').trim().toUpperCase() === g && parseInt(item.num_riga_giorno) === 0
      );
      return header && isTrue(header['cmp' + w]);
    });
    if (isChiusa) {
      count++;
    } else {
      break;
    }
  }
  return count;
});

// Computed per la barra di riempimento del progresso delle settimane nel mesociclo
const getProgressionLineFillWidth = computed(() => {
  const closed = settimaneChiuse.value;
  if (closed <= 0) return '0%';
  if (closed >= 6) return '100%';
  return (closed / 5 * 100) + '%';
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
  
  // Applica solo se la modifica locale è più recente rispetto a quella su Firestore
  if (localTimestamp && item.timestamp) {
    if (localTimestamp < item.timestamp) {
      // Rimuovi modifiche locali obsolete per evitare inquinamento della cache
      localStorage.removeItem(key1);
      localStorage.removeItem(key2);
      return item;
    }
  }
  
  return { ...item, ...updates };
};

// Ricalcola la settimana attiva globale in base alle settimane chiuse delle righe zero
const calcolaSettimanaAttivaGlobale = (exercises) => {
  const activeDays = [...new Set(exercises
    .filter(item => parseInt(item.num_riga_giorno) === 0)
    .map(item => (item.des_giorno || '').trim().toUpperCase())
  )].filter(Boolean);

  if (activeDays.length === 0) return 1;

  for (let w = 1; w <= 6; w++) {
    const isChiusa = activeDays.every(g => {
      const header = exercises.find(
        item => (item.des_giorno || '').trim().toUpperCase() === g && parseInt(item.num_riga_giorno) === 0
      );
      return header && isTrue(header['cmp' + w]);
    });
    if (!isChiusa) {
      return w;
    }
  }

  return 6; // Se tutte le settimane sono chiuse, ritorna l'ultima
};

const scaricaReportPDF = () => {
  vibraTattile(12);
  const doc = new jsPDF();
  
  // Header Style
  doc.setFillColor(249, 115, 22); // Orange Accent
  doc.rect(0, 0, 210, 30, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.text('FLEXCOACH - REPORT PROGRESSIONI', 15, 20);
  
  // Metadata section
  doc.setTextColor(51, 65, 85);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  const oggi = new Date().toLocaleDateString('it-IT');
  doc.text(`Data Generazione: ${oggi}`, 140, 20);
  
  let y = 45;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('1. INFORMAZIONI GENERALI', 15, y);
  doc.line(15, y + 2, 195, y + 2);
  
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Atleta: ${nomeAtleta.value || 'N/D'}`, 15, y);
  doc.text(`Scheda: N. ${schedaSelezionata.value}`, 80, y);
  doc.text(`Mesociclo: ${descrizioneMesociclo.value || 'N/D'}`, 130, y);
  
  y += 6;
  doc.text(`Inizio: ${dataInizio.value}`, 15, y);
  doc.text(`Scadenza: ${dataFine.value}`, 80, y);
  doc.text(`Stato Programma: ${settimaneChiuse.value === 6 ? 'COMPLETATO' : 'ATTIVO'}`, 130, y);
  
  y += 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('2. STATISTICHE DI CONSISTENZA E PERFORMANCE', 15, y);
  doc.line(15, y + 2, 195, y + 2);
  
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Consistenza Allenamenti: ${reportProgressioni.value.percentualeConsistenza}%`, 15, y);
  doc.text(`Feeling Medio Esercizi: ${reportProgressioni.value.mediaFeeling || '-'} / 5`, 80, y);
  
  y += 6;
  let consistenzaDettaglio = '';
  for (let w = 1; w <= 6; w++) {
    consistenzaDettaglio += `W${w}: ${reportProgressioni.value.consistenzaGiorni[w]}gg  `;
  }
  doc.text(`Consistenza per Settimana: ${consistenzaDettaglio}`, 15, y);
  
  y += 6;
  const fatiche = reportProgressioni.value.miglioriFatiche;
  doc.text(`Sforzo Week 6 -> Media: ${fatiche.Media} | Pesante: ${fatiche.Pesante} | Devastante: ${fatiche.Devastante}`, 15, y);
  
  y += 14;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('3. DETTAGLIO PROGRESSIONE CARICHI', 15, y);
  doc.line(15, y + 2, 195, y + 2);
  
  // Table Header
  y += 10;
  doc.setFillColor(30, 41, 59); // Dark header
  doc.rect(15, y, 180, 8, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('Esercizio', 17, y + 5);
  doc.text('Giorno', 85, y + 5);
  doc.text('W1', 105, y + 5);
  doc.text('W6', 125, y + 5);
  doc.text('Progressione', 150, y + 5);
  
  y += 8;
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  
  const items = allExercises.value || [];
  let rowCount = 0;
  
  const parsePeso = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/,/g, '.').replace(/[^\d.]/g, ' ').trim();
    const parts = clean.split(/\s+/);
    const num = parseFloat(parts[0]);
    return isNaN(num) ? 0 : num;
  };
  
  items.forEach(ex => {
    if (parseInt(ex.num_riga_giorno) === 0) return;
    
    const w1 = ex.ins_week1 || '';
    const w2 = ex.ins_week2 || '';
    const w3 = ex.ins_week3 || '';
    const w4 = ex.ins_week4 || '';
    const w5 = ex.ins_week5 || '';
    const w6 = ex.ins_week6 || '';
    
    if (!w1 && !w2 && !w3 && !w4 && !w5 && !w6) return;
    
    if (y > 270) {
      doc.addPage();
      y = 20;
      doc.setFillColor(30, 41, 59);
      doc.rect(15, y, 180, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.text('Esercizio', 17, y + 5);
      doc.text('Giorno', 85, y + 5);
      doc.text('W1', 105, y + 5);
      doc.text('W6', 125, y + 5);
      doc.text('Progressione', 150, y + 5);
      y += 8;
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(51, 65, 85);
    }
    
    if (rowCount % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(15, y, 180, 7, 'F');
    }
    
    const w1Peso = parsePeso(w1);
    let latestPeso = 0;
    let latestW = 1;
    for (let w = 6; w >= 1; w--) {
      const wVal = parsePeso(ex['ins_week' + w]);
      if (wVal > 0) {
        latestPeso = wVal;
        latestW = w;
        break;
      }
    }
    
    const delta = latestPeso - w1Peso;
    let progText = 'Stabile';
    if (delta > 0 && w1Peso > 0) {
      const pct = Math.round((delta / w1Peso) * 100);
      progText = `+${delta.toFixed(1)} kg (+${pct}%)`;
    } else if (delta < 0 && w1Peso > 0) {
      const pct = Math.round((Math.abs(delta) / w1Peso) * 100);
      progText = `-${Math.abs(delta).toFixed(1)} kg (-${pct}%)`;
    } else if (w1Peso === 0 && latestPeso > 0) {
      progText = `Partito da W${latestW}: ${latestPeso} kg`;
    }
    
    const nomeTrunc = (ex.des_esercizio || 'Esercizio').substring(0, 36);
    doc.text(nomeTrunc, 17, y + 5);
    doc.text(String(ex.des_giorno || '-'), 85, y + 5);
    doc.text(w1 ? `${w1} kg` : '-', 105, y + 5);
    
    const lastWVal = ex['ins_week' + latestW] || '-';
    doc.text(lastWVal ? `${lastWVal} kg` : '-', 125, y + 5);
    
    if (delta > 0) {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
    } else if (delta < 0) {
      doc.setTextColor(239, 68, 68);
    }
    doc.text(progText, 150, y + 5);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    
    y += 7;
    rowCount++;
  });
  
  doc.setFontSize(8);
  doc.setTextColor(148, 163, 184);
  doc.text('Generato con FlexCoach WoApp - I tuoi dati, i tuoi risultati.', 15, 287);
  
  doc.save(`FlexCoach_Report_${nomeAtleta.value.replace(/\s+/g, '_')}_Scheda_${schedaSelezionata.value}.pdf`);
};

const caricaDatiWorkoutT = async () => {
  dataInizio.value = '18 mag 26';
  dataFine.value = '28 giu 26';
  descrizioneMesociclo.value = '';
  coachMessage.value = '';

  if (!selectedAthlete.value || !selectedSheet.value) return;

  try {
    const athleteId = selectedAthlete.value;
    const sheetNum = selectedSheet.value;

    const q1 = query(
      collection(db, 'WORKOUT_T'),
      where('ID_cliente', '==', athleteId),
      where('num_scheda', '==', sheetNum)
    );
    let snap = await getDocs(q1);

    if (snap.empty) {
      const q2 = query(
        collection(db, 'WORKOUT_T'),
        where('ID_cliente', '==', Number(athleteId)),
        where('num_scheda', '==', Number(sheetNum))
      );
      snap = await getDocs(q2);
    }

    if (!snap.empty) {
      const docData = snap.docs[0].data();
      workoutTData.value = docData;
      dataInizio.value = docData.dat_data || '18 mag 26';
      dataFine.value = docData.dat_scadenza || '28 giu 26';
      descrizioneMesociclo.value = docData.des_descrizione || '';
      if (docData.des_note) {
        coachMessage.value = docData.des_note;
      }
    } else {
      workoutTData.value = null;
    }
  } catch (err) {
    workoutTData.value = null;
    console.warn("Errore caricamento da WORKOUT_T, uso i default:", err);
  }
};

// Caricamento
const caricaDatiScheda = async () => {
  if (!selectedAthlete.value || !selectedSheet.value) return;

  atletaSelezionato.value = selectedAthlete.value;
  schedaSelezionata.value = selectedSheet.value;

  caricamento.value = true;
  await caricaDatiWorkoutT();

  // Carica il nome reale dell'atleta dalla mappa CLIENTI statica, altrimenti fallback su UTENTI
  const nomeMappato = getNomeAtleta(selectedAthlete.value);
  if (nomeMappato) {
    nomeAtleta.value = nomeMappato.toUpperCase();
  } else {
    nomeAtleta.value = '';
  }
  
  await aggiornaDatiSchedaDaStore();

  if (allExercises.value.length === 0 && !loadingStoryboard.value) {
    // Prova il fallback da backup locale
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

      tempExercises.forEach(mappedEx => {
        if (mappedEx.flg_video === 'true') tempFilmati.push(mappedEx);
        const qta = (mappedEx.des_qta_report || '').toLowerCase();
        if (qta.includes('amrap') || qta.includes('test') || qta.includes('ramp')) tempTest.push(mappedEx);
        if (mappedEx.des_note && !noteScheda) noteScheda = mappedEx.des_note;
      });

      allExercises.value = tempExercises;
      filmatiList.value = tempFilmati;
      countFilmati.value = tempFilmati.length;
      testList.value = tempTest;
      countTest.value = tempTest.length;
      if (tempExercises.length > 0) {
        const savedW = localStorage.getItem('settimanaAttiva_' + selectedAthlete.value);
        if (!savedW) {
          const activeW = calcolaSettimanaAttivaGlobale(tempExercises);
          settimanaAttiva.value = activeW;
          localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);
        }
      }

      const giorni = ['A', 'B', 'C', 'D'];
      let giornoDaFare = '';
      for (const g of giorni) {
        const header = tempExercises.find(item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0));
        const completato = header ? isTrue(header['cmp' + settimanaAttiva.value]) : false;
        if (!completato) {
          giornoDaFare = g;
          break;
        }
      }
      if (giornoDaFare) {
        giornoAttivo.value = giornoDaFare;
        localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giornoDaFare);
      }
      applicaFallbackWorkoutT(tempExercises);
    } catch (e) {
      console.warn("Impossibile fare fallback locale:", e);
    }
  }

  if (!loadingStoryboard.value) {
    caricamento.value = false;
  }
};

const aggiornaDatiSchedaDaStore = async () => {
  // Prendi i dati grezzi direttamente da globalStoryboard
  let tempExercises = globalStoryboard.value.map(doc => {
    return applicaModificheLocali({ id: doc.id, ...doc });
  });

  let tempFilmati = [];
  let tempTest = [];
  let noteScheda = '';

  tempExercises.forEach(mappedEx => {
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

  // Ricalcola la settimana attiva globale solo se non è già salvata nel localStorage per questo atleta
  if (tempExercises.length > 0) {
    const savedW = localStorage.getItem('settimanaAttiva_' + selectedAthlete.value);
    if (!savedW) {
      const activeW = calcolaSettimanaAttivaGlobale(tempExercises);
      settimanaAttiva.value = activeW;
      localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);
    }
  }

  // Auto-seleziona il primo giorno non completato per la settimana attiva
  const giorni = ['A', 'B', 'C', 'D'];
  let giornoDaFare = '';
  for (const g of giorni) {
    const header = tempExercises.find(
      item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0)
    );
    const completato = header ? isTrue(header['cmp' + settimanaAttiva.value]) : false;
    if (!completato) {
      giornoDaFare = g;
      break;
    }
  }
  if (giornoDaFare) {
    giornoAttivo.value = giornoDaFare;
    localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giornoDaFare);
  }

  // Fallback se i dati di WORKOUT_T sono mancanti o nulli
  applicaFallbackWorkoutT(tempExercises);
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
      let clean = tStr.toLowerCase().trim();
      if (clean.includes('h')) {
        const parts = clean.split('h');
        const hours = parseInt(parts[0], 10) || 0;
        const minsStr = parts[1] ? parts[1].replace('min', '').replace('m', '').trim() : '';
        const mins = parseInt(minsStr, 10) || 0;
        return hours * 60 + mins;
      }
      clean = clean.replace('min', '').replace('m', '').trim();
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

const eserciziMancantiGiornoAttivo = computed(() => {
  if (!allExercises.value || allExercises.value.length === 0) return [];
  const exDelGiorno = allExercises.value.filter(
    e => (e.des_giorno || '').trim().toUpperCase() === (giornoAttivo.value || '').trim().toUpperCase() && parseInt(e.num_riga_giorno) > 0
  );
  const indiciPresenti = exDelGiorno
    .map(item => parseInt(item.num_riga_giorno))
    .filter(n => !isNaN(n) && n > 0);
  if (indiciPresenti.length === 0) return [];
  const maxIndice = Math.max(...indiciPresenti);
  const buchi = [];
  for (let i = 1; i < maxIndice; i++) {
    if (!indiciPresenti.includes(i)) {
      buchi.push(i);
    }
  }
  return buchi;
});

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
  return isTrue(header['cmp' + settimanaAttiva.value]);
};

// Selezione rapida del giorno dal Journey Track
const selezionaGiornoRapido = (giorno) => {
  vibraTattile(12);
  giornoAttivo.value = giorno;
  localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giorno);
};

const haEserciziDaFareGiornoAttivo = computed(() => {
  if (!allExercises.value || allExercises.value.length === 0) return false;
  const g = giornoAttivo.value;
  const w = settimanaAttiva.value;
  const exDelGiorno = allExercises.value.filter(
    e => (e.des_giorno || '').trim().toUpperCase() === g.toUpperCase() && parseInt(e.num_riga_giorno) > 0
  );
  return exDelGiorno.some(ex => {
    const val = ex['ins_week' + w];
    return !val || val.trim() === '' || val.trim() === '-';
  });
});

const settimanaDaChiudereGiornoAttivo = computed(() => {
  if (!allExercises.value || allExercises.value.length === 0) return false;
  const g = giornoAttivo.value;
  const w = settimanaAttiva.value;
  
  // Cerca intestazione riga 0 per vedere se è già chiusa
  const header = allExercises.value.find(
    item => (item.des_giorno || '').trim().toUpperCase() === g.toUpperCase() && parseInt(item.num_riga_giorno) === 0
  );
  if (!header) return false;
  
  const isChiusa = isTrue(header['cmp' + w]);
  if (isChiusa) return false;

  // Esercizi reali del giorno
  const exDelGiorno = allExercises.value.filter(
    e => (e.des_giorno || '').trim().toUpperCase() === g.toUpperCase() && parseInt(e.num_riga_giorno) > 0
  );
  if (exDelGiorno.length === 0) return false;

  // Se tutti gli esercizi sono compilati
  const tuttiCompilati = exDelGiorno.every(ex => {
    const val = ex['ins_week' + w];
    return val && val.trim() !== '';
  });
  return tuttiCompilati;
});

watch(haEserciziDaFareGiornoAttivo, (newVal) => {
  setGlobalHaEserciziDaFare(newVal);
}, { immediate: true });

watch(settimanaDaChiudereGiornoAttivo, (newVal) => {
  setGlobalSettimanaDaChiudere(newVal);
}, { immediate: true });

onMounted(() => {
  caricaDatiScheda();
});

// Ascolta i cambiamenti di selezione globale
watch([selectedAthlete, selectedSheet], () => {
  caricaDatiScheda();
  settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + selectedAthlete.value)) || 2;
  giornoAttivo.value = localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'C';
});

// Watch per aggiornare i dati da globalStoryboard in tempo reale
watch(globalStoryboard, () => {
  aggiornaDatiSchedaDaStore();
}, { deep: true });

watch(loadingStoryboard, (newVal) => {
  caricamento.value = newVal;
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
  localStorage.setItem('scrollPrimoEsercizioDaFare', 'true');
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

.sticky-dashboard-header {
  position: sticky !important;
  top: 48px !important; /* sticks below the 48px compact global app bar */
  z-index: 100 !important;
  background: #030712 !important; /* solid background matching body */
  padding-top: 16px !important;
  padding-bottom: 8px !important;
  margin-top: -16px !important;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.08) !important;
  margin-bottom: 20px !important;
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

.border-soft {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.border-right-soft {
  border-right: 1px solid rgba(255, 255, 255, 0.05) !important;
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

/* Capsule tabs style */
.custom-dashboard-tabs {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
  padding: 3px;
}
.custom-dashboard-tabs :deep(.v-tab.v-tab) {
  border-radius: 10px;
  min-width: 0;
  padding: 0 12px;
  color: #94a3b8;
}
.custom-dashboard-tabs :deep(.v-tab--selected) {
  background: rgba(249, 115, 22, 0.15) !important;
  color: #f97316 !important;
}
.custom-dashboard-tabs :deep(.v-tab__slider) {
  display: none !important;
}

/* Clickable progression card in report */
.clickable-progression-card {
  cursor: pointer;
  transition: all 0.2s ease-in-out;
}
.clickable-progression-card:active {
  transform: scale(0.98);
  background: rgba(249, 115, 22, 0.15) !important;
}

.heatmap-container {
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  transition: border-color 0.3s ease;
}
</style>
