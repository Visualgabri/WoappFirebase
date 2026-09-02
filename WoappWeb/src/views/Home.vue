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
      <div class="flex-shrink-0 d-flex align-center gap-2">
        <v-btn
          v-if="ruolo === 'coach'"
          color="orange-darken-3"
          variant="flat"
          size="small"
          class="font-weight-black text-none rounded-lg px-2.5"
          style="height: 32px; font-size: 0.72rem !important; box-shadow: 0 0 10px rgba(249, 115, 22, 0.3) !important;"
          @click="avviaAllenamentoGabriele"
          id="btn-play-gabriele"
        >
          <v-icon size="14" class="mr-1">mdi-play-circle</v-icon>
          GABRIELE
        </v-btn>
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

    <!-- Selettore Atleta e Workout (Cerca Wo) -->
    <v-card
      class="premium-card rounded-2xl text-left border pa-4 mb-5 animate-slide-down"
      style="background: linear-gradient(135deg, var(--card-bg-glass) 0%, var(--card-bg-dark) 100%) !important; border-color: rgba(249, 115, 22, 0.15) !important;"
    >
      <div class="d-flex align-center justify-space-between" :class="mostraRicercaPannello ? 'mb-3' : ''">
        <h3 class="text-subtitle-2 font-weight-black text-orange-lighten-2 d-flex align-center uppercase tracking-widest" style="font-size: 0.72rem;">
          <v-icon size="16" class="mr-1.5">mdi-magnify</v-icon>
          Ricerca & Selezione Workout
        </h3>
        <v-btn
          variant="flat"
          color="orange-darken-3"
          size="x-small"
          class="font-weight-black text-white text-none px-2.5 py-0.5 rounded-lg"
          style="height: 22px;"
          @click="mostraRicercaPannello = !mostraRicercaPannello"
        >
          <v-icon size="12" class="mr-1">{{ mostraRicercaPannello ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
          {{ mostraRicercaPannello ? 'Nascondi' : 'Espandi' }}
        </v-btn>
      </div>

      <!-- Selettore Coach Atleta -->
      <div v-if="ruolo === 'coach' && mostraRicercaPannello" class="mt-2 mb-3">
        <v-select
          v-slot:item="{ props, item }"
          v-model="atletaSelezionato"
          :items="itemsAtleti"
          item-title="title"
          item-value="value"
          label="Seleziona Atleta (Coach)"
          variant="outlined"
          density="compact"
          rounded="lg"
          color="orange-darken-3"
          prepend-inner-icon="mdi-account"
          hide-details
          @update:model-value="gestisciCambioAtleta"
          id="coach-atleta-dropdown"
        >
          <v-list-item v-bind="props" class="text-left"></v-list-item>
        </v-select>
      </div>

      <v-expand-transition>
        <div v-show="mostraRicercaPannello">
          <!-- Campo di ricerca del workout -->
          <v-text-field
            v-model="searchQuery"
            prepend-inner-icon="mdi-magnify"
            placeholder="Cerca scheda, focus, note o data..."
            variant="outlined"
            density="compact"
            rounded="lg"
            color="orange-darken-3"
            clearable
            hide-details
            class="mb-3 custom-compact-field"
          ></v-text-field>

          <!-- Lista schede/workout trovati -->
          <div v-if="caricamentoWorkouts" class="text-center py-4">
            <v-progress-circular indeterminate color="orange" size="24"></v-progress-circular>
            <span class="text-caption text-muted ml-2">Caricamento schede...</span>
          </div>
          <div v-else-if="filteredWorkouts.length === 0" class="text-center py-3 border-dashed rounded-xl">
            <span class="text-caption text-muted">Nessun workout trovato</span>
          </div>
          <div v-else class="workout-list-container scrollable-y max-height-300">
            <v-card
              v-for="w in filteredWorkouts"
              :key="w.num_scheda"
              class="workout-item-card pa-3 mb-2 rounded-xl border text-left cursor-pointer transition-all position-relative"
              :class="String(schedaSelezionata) === String(w.num_scheda) ? 'active-workout-border' : 'inactive-workout-border'"
              @click="gestisciSelezioneScheda(w.num_scheda)"
            >
              <div class="d-flex align-center justify-space-between flex-wrap gap-1.5 mb-1.5">
                <div class="d-flex align-center gap-2" style="white-space: nowrap;">
                  <span class="font-weight-black text-slate-dark text-subtitle-2" style="font-size: 0.88rem !important; white-space: nowrap;">
                    Scheda {{ w.num_scheda }}
                  </span>
                  <v-chip
                    v-if="String(schedaSelezionata) === String(w.num_scheda)"
                    color="orange-darken-3"
                    size="x-small"
                    variant="flat"
                    class="font-weight-black text-white px-2"
                    style="height: 18px; font-size: 0.58rem;"
                  >
                    ATTIVA
                  </v-chip>
                </div>
                <div class="d-flex align-center text-super-caption text-slate-dark font-weight-bold" style="font-size: 0.64rem;">
                  <v-icon size="13" color="orange-darken-3" class="mr-1">mdi-calendar-range</v-icon>
                  <span>{{ w.dat_data }} - {{ w.dat_scadenza }}</span>
                </div>
              </div>
              <div class="text-caption text-truncate text-slate-dark font-weight-medium" style="font-size: 0.75rem !important;">
                {{ w.des_descrizione || 'Nessuna descrizione' }}
              </div>
              <div v-if="w.des_note" class="text-super-caption text-muted text-truncate mt-1 d-flex align-center" style="font-size: 0.65rem !important;">
                <v-icon size="12" class="mr-1">mdi-note-text-outline</v-icon>
                <span>{{ w.des_note }}</span>
              </div>
            </v-card>
          </div>
        </div>
      </v-expand-transition>
    </v-card>

    <!-- Stato vuoto se atleta o scheda non sono selezionati -->
    <div v-if="!atletaSelezionato || !schedaSelezionata" class="empty-state text-center my-6 py-8 card-glass rounded-2xl border-dashed animate-fade-in">
      <v-icon size="64" color="orange-lighten-3" class="mb-4 animate-bounce">mdi-clipboard-text-search-outline</v-icon>
      <h3 class="text-h6 font-weight-bold text-slate-dark">Nessun Allenamento Selezionato</h3>
      <p class="text-body-2 text-muted mt-2 px-6">
        Seleziona un atleta (se sei coach) e una scheda dal pannello di ricerca in alto per caricare il mesociclo.
      </p>
    </div>

    <!-- Contenuto Principale se selezionati -->
    <div v-else class="animate-fade-in">
      
          <!-- Warning: Program not definitive ("da finire" flag is active) -->
          <v-card
            v-if="workoutTData && isTrue(workoutTData.flg_da_finire)"
            class="py-3 px-4 mb-4 text-left border card-glass animate-pulse"
            style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.15), rgba(239, 68, 68, 0.05)) !important; border: 1.5px solid rgba(239, 68, 68, 0.4) !important; border-radius: 16px !important;"
          >
            <div>
              <h4 class="text-subtitle-2 font-weight-black text-red-lighten-2 mb-0.5" style="font-size: 0.85rem !important;">
                Programma in elaborazione
              </h4>
              <p class="text-slate font-weight-medium mb-0" style="font-size: 0.72rem; line-height: 1.35; color: var(--text-slate) !important;">
                Questo programma di allenamento <strong>non è ancora definitivo</strong>. Il coach sta lavorando per ultimare la scheda.
              </p>
            </div>
          </v-card>

          <!-- Box Avviso Coach per Nuovo Programma (Metà W5 o successive) -->
          <v-card 
            v-if="mostraAvvisoCoachNuovoProgramma" 
            class="pa-4 mb-4 text-left border rounded-2xl elevation-3 card-glass"
            style="background: linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(249, 115, 22, 0.05)) !important; border: 1.5px solid rgba(249, 115, 22, 0.4) !important; border-radius: 16px !important;"
          >
            <div>
              <h4 class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-1" style="font-size: 0.85rem !important; line-height: 1.25;">
                Tempo di preparare il prossimo programma!
              </h4>
              <p class="text-slate font-weight-medium mb-2" style="font-size: 0.75rem; line-height: 1.45; color: var(--text-slate) !important;">
                Hai superato la metà della 5° settimana di allenamento. Contatta il Coach Gabriele per fargli sapere come sta andando e permettergli di preparare la tua prossima scheda in tempo!
              </p>
              <v-btn
                color="orange-darken-3"
                size="small"
                class="font-weight-black text-none text-white rounded-lg px-3"
                prepend-icon="mdi-whatsapp"
                @click="contattaCoachWhatsApp"
                style="height: 32px; font-size: 0.75rem;"
              >
                Avvisa il Coach
              </v-btn>
            </div>
          </v-card>

          <!-- Card Riepilogo Mesociclo WORKOUT_T -->
          <v-card 
            class="premium-hero-card rounded-2xl text-left border position-relative overflow-hidden pa-4 mb-5" 
            elevation="3"
          >
            <div class="glowing-accent"></div>
            
            <div class="mb-4">
              <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase tracking-widest" style="font-size: 0.6rem;">
                Riepilogo Scheda Attiva
              </span>
            </div>

            <!-- Calendario & Allineamento Tempi -->
            <div class="date-summary-box pa-4 pb-4.5 rounded-xl border-soft mb-4" style="background: var(--card-bg-soft);">
              <div class="text-center mb-3 pb-2.5 border-bottom-soft">
                <v-chip color="orange-darken-3" variant="flat" size="small" class="font-weight-black text-white px-3 py-1">
                  <v-icon start size="14" class="mr-1">mdi-clipboard-text</v-icon>
                  SCHEDA {{ schedaSelezionata }}
                </v-chip>
              </div>
              <v-row dense class="align-center py-1">
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

              <!-- Giorni alla Scadenza -->
              <div v-if="giorniAllaScadenza !== null" class="mt-3.5 pt-3 border-top-soft d-flex align-center justify-space-between flex-wrap gap-2">
                <span class="text-super-caption text-slate-dark font-weight-bold" style="font-size: 0.65rem;">Tempo alla scadenza:</span>
                <v-chip
                  :color="giorniAllaScadenza < 0 ? 'red-darken-3' : (giorniAllaScadenza <= 7 ? 'orange-darken-3' : 'green-darken-3')"
                  size="x-small"
                  class="font-weight-black text-white px-2 py-0.5"
                  variant="flat"
                  style="font-size: 0.62rem; height: 20px;"
                >
                  <v-icon size="11" class="mr-1">
                    {{ giorniAllaScadenza < 0 ? 'mdi-clock-alert-outline' : 'mdi-clock-outline' }}
                  </v-icon>
                  {{ giorniAllaScadenzaText }}
                </v-chip>
              </div>
              
              <!-- Allineamento Programma -->
              <div v-if="allineamentoProgramma" class="mt-3.5 pt-3 border-top-soft d-flex align-center justify-space-between flex-wrap gap-2 mb-1">
                <span class="text-super-caption text-slate-dark font-weight-bold" style="font-size: 0.65rem;">Stato Programma:</span>
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
            style="background: linear-gradient(135deg, var(--card-bg-glass) 0%, var(--card-bg-dark) 100%) !important; border-color: rgba(245, 158, 11, 0.25) !important;"
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
            <div class="text-body-2 text-slate leading-relaxed font-weight-medium" style="color: var(--text-slate) !important; font-size: 0.82rem !important; white-space: pre-wrap;">
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
            style="background: var(--card-bg-soft) !important;"
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
                <div class="heatmap-container rounded-lg pa-1.5 border" style="background: var(--card-bg-soft) !important; border-color: var(--card-border) !important; width: 100px; height: 85px; overflow: hidden;">
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
    <v-dialog v-model="mostraTest" max-width="500" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="pa-3 py-2 border-bottom d-flex align-center justify-space-between bg-slate-900">
          <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
            <v-icon color="orange-darken-3" size="18">mdi-dumbbell</v-icon>
            <span class="font-weight-black dialog-text-primary text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
              Esercizi da Testare 🏋️
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="mostraTest = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-3 scrollbar-custom" style="max-height: 60vh;">
          <div v-if="testList.length === 0" class="text-center py-6">
            <v-icon size="40" color="orange-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
            <p class="text-caption text-muted">Nessun test o AMRAP specifico richiesto in questa scheda.</p>
          </div>
          <div v-else class="d-flex flex-column gap-2.5">
            <div
              v-for="ex in testList"
              :key="ex.id"
              class="connected-exercise-item d-flex align-center py-2 px-3 clickable-item border rounded-xl border-soft bg-slate-950"
              @click="vibraTattile(12); mostraTest = false; router.push({ name: 'DettaglioWorkout', params: { id: ex.id } })"
              style="cursor: pointer; transition: all 0.2s ease;"
            >
              <div class="connected-thumb mr-3 rounded overflow-hidden" style="width: 48px; height: 48px; flex-shrink: 0; border: 1px solid rgba(255, 255, 255, 0.08);">
                <v-img
                  :src="getGifUrl(ex.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=100'"
                  width="48"
                  height="48"
                  cover
                ></v-img>
              </div>
              <div class="flex-grow-1 min-width-0 text-left">
                <div class="text-caption font-weight-black dialog-text-primary text-truncate" style="font-size: 0.82rem !important; line-height: 1.2;">
                  {{ ex.des_esercizio }}
                  <v-icon v-if="ex.flg_video === 'true' || ex.flg_video === true" color="orange" size="14" class="ml-1" title="Video richiesto">mdi-video</v-icon>
                </div>
                <div class="text-super-caption text-muted font-weight-bold mt-0.5" style="font-size: 0.65rem;">
                  Giorno <span class="text-orange-lighten-2 font-weight-black">{{ ex.des_giorno }}<template v-if="ex.num_riga_giorno">{{ ex.num_riga_giorno }}</template></span>
                  <span v-if="ex.des_settore" class="text-orange-lighten-2 font-weight-black"> ({{ ex.des_settore }})</span>
                </div>
                <div v-if="ex.des_qta_report" class="text-super-caption font-weight-black text-orange-lighten-2 mt-1" style="font-size: 0.72rem;">
                  Test: {{ ex.des_qta_report }}
                </div>
              </div>
              <v-icon size="18" color="orange">mdi-chevron-right</v-icon>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top bg-slate-900 gap-2">
          <v-btn color="orange-darken-3" variant="flat" block rounded="lg" size="small" class="font-weight-bold text-white" @click="mostraTest = false">Chiudi</v-btn>
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
    <v-dialog v-model="mostraTestWeek6" max-width="500" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="pa-3 py-2 border-bottom d-flex align-center justify-space-between bg-slate-900">
          <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
            <v-icon color="orange-darken-3" size="18">mdi-dumbbell</v-icon>
            <span class="font-weight-black dialog-text-primary text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
              Test alla Week 6 🏋️
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="mostraTestWeek6 = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-3 scrollbar-custom" style="max-height: 60vh;">
          <div v-if="testWeek6List.length === 0" class="text-center py-6">
            <v-icon size="40" color="orange-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
            <p class="text-caption text-muted">Nessun test previsto per la Week 6 in questa scheda.</p>
          </div>
          <div v-else class="d-flex flex-column gap-2.5">
            <div
              v-for="ex in testWeek6List"
              :key="ex.id"
              class="connected-exercise-item d-flex align-center py-2 px-3 clickable-item border rounded-xl border-soft bg-slate-950"
              @click="vibraTattile(12); mostraTestWeek6 = false; router.push({ name: 'DettaglioWorkout', params: { id: ex.id } })"
              style="cursor: pointer; transition: all 0.2s ease;"
            >
              <div class="connected-thumb mr-3 rounded overflow-hidden" style="width: 48px; height: 48px; flex-shrink: 0; border: 1px solid rgba(255, 255, 255, 0.08);">
                <v-img
                  :src="getGifUrl(ex.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=100'"
                  width="48"
                  height="48"
                  cover
                ></v-img>
              </div>
              <div class="flex-grow-1 min-width-0 text-left">
                <div class="text-caption font-weight-black dialog-text-primary text-truncate" style="font-size: 0.82rem !important; line-height: 1.2;">
                  {{ ex.des_esercizio }}
                  <v-icon v-if="ex.flg_video === 'true' || ex.flg_video === true" color="orange" size="14" class="ml-1" title="Video richiesto">mdi-video</v-icon>
                </div>
                <div class="text-super-caption text-muted font-weight-bold mt-0.5" style="font-size: 0.65rem;">
                  Giorno <span class="text-orange-lighten-2 font-weight-black">{{ ex.des_giorno }}<template v-if="ex.num_riga_giorno">{{ ex.num_riga_giorno }}</template></span>
                  <span v-if="ex.des_settore" class="text-orange-lighten-2 font-weight-black"> ({{ ex.des_settore }})</span>
                </div>
                <div v-if="ex.des_week6" class="text-super-caption font-weight-black text-orange-lighten-2 mt-1" style="font-size: 0.72rem;">
                  Test W6: {{ ex.des_week6 }}
                </div>
              </div>
              <v-icon size="18" color="orange">mdi-chevron-right</v-icon>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top bg-slate-900 gap-2">
          <v-btn color="orange-darken-3" variant="flat" block rounded="lg" size="small" class="font-weight-bold text-white" @click="mostraTestWeek6 = false">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog ESERCIZI NUOVI (Interactive List) -->
    <v-dialog v-model="mostraEserciziNuovi" max-width="500" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="pa-3 py-2 border-bottom d-flex align-center justify-space-between bg-slate-900">
          <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
            <v-icon color="orange-darken-3" size="18">mdi-star-outline</v-icon>
            <span class="font-weight-black dialog-text-primary text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
              Nuovi Esercizi ✨
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="mostraEserciziNuovi = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-3 scrollbar-custom" style="max-height: 60vh;">
          <div v-if="eserciziNuoviList.length === 0" class="text-center py-6">
            <v-icon size="40" color="orange-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
            <p class="text-caption text-muted">Nessun nuovo esercizio introdotto in questo mesociclo.</p>
          </div>
          <div v-else class="d-flex flex-column gap-2.5">
            <div
              v-for="ex in eserciziNuoviList"
              :key="ex.id"
              class="connected-exercise-item d-flex align-center py-2 px-3 clickable-item border rounded-xl border-soft bg-slate-950"
              @click="vibraTattile(12); mostraEserciziNuovi = false; router.push({ name: 'DettaglioWorkout', params: { id: ex.id } })"
              style="cursor: pointer; transition: all 0.2s ease;"
            >
              <div class="connected-thumb mr-3 rounded overflow-hidden" style="width: 48px; height: 48px; flex-shrink: 0; border: 1px solid rgba(255, 255, 255, 0.08);">
                <v-img
                  :src="getGifUrl(ex.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=100'"
                  width="48"
                  height="48"
                  cover
                ></v-img>
              </div>
              <div class="flex-grow-1 min-width-0 text-left">
                <div class="text-caption font-weight-black dialog-text-primary text-truncate" style="font-size: 0.82rem !important; line-height: 1.2;">
                  {{ ex.des_esercizio }}
                  <v-icon v-if="ex.flg_video === 'true' || ex.flg_video === true" color="orange" size="14" class="ml-1" title="Video richiesto">mdi-video</v-icon>
                </div>
                <div class="text-super-caption text-muted font-weight-bold mt-0.5" style="font-size: 0.65rem;">
                  Giorno <span class="text-orange-lighten-2 font-weight-black">{{ ex.des_giorno }}<template v-if="ex.num_riga_giorno">{{ ex.num_riga_giorno }}</template></span>
                  <span v-if="ex.des_settore" class="text-orange-lighten-2 font-weight-black"> ({{ ex.des_settore }})</span>
                </div>
                <div v-if="ex['des_week' + settimanaAttiva] || ex.des_qta_report" class="text-super-caption font-weight-black text-orange-lighten-2 mt-1" style="font-size: 0.72rem;">
                  {{ ex['des_week' + settimanaAttiva] || ex.des_qta_report }}
                </div>
              </div>
              <v-icon size="18" color="orange">mdi-chevron-right</v-icon>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top bg-slate-900 gap-2">
          <v-btn color="orange-darken-3" variant="flat" block rounded="lg" size="small" class="font-weight-bold text-white" @click="mostraEserciziNuovi = false">Chiudi</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- dialog ESERCIZI VIDEO (Interactive List) -->
    <v-dialog v-model="mostraEserciziVideo" max-width="500" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="pa-3 py-2 border-bottom d-flex align-center justify-space-between bg-slate-900">
          <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
            <v-icon color="orange-darken-3" size="18">mdi-video-outline</v-icon>
            <span class="font-weight-black dialog-text-primary text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
              Esercizi con Video richiesto 📹
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="mostraEserciziVideo = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-3 scrollbar-custom" style="max-height: 60vh;">
          <div v-if="videoExercisesList.length === 0" class="text-center py-6">
            <v-icon size="40" color="orange-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
            <p class="text-caption text-muted">Nessun video richiesto per questa scheda dal coach.</p>
          </div>
          <div v-else class="d-flex flex-column gap-2.5">
            <div
              v-for="ex in videoExercisesList"
              :key="ex.id"
              class="connected-exercise-item d-flex align-center py-2 px-3 clickable-item border rounded-xl border-soft bg-slate-950"
              @click="vibraTattile(12); mostraEserciziVideo = false; router.push({ name: 'DettaglioWorkout', params: { id: ex.id } })"
              style="cursor: pointer; transition: all 0.2s ease;"
            >
              <div class="connected-thumb mr-3 rounded overflow-hidden" style="width: 48px; height: 48px; flex-shrink: 0; border: 1px solid rgba(255, 255, 255, 0.08);">
                <v-img
                  :src="getGifUrl(ex.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=100'"
                  width="48"
                  height="48"
                  cover
                ></v-img>
              </div>
              <div class="flex-grow-1 min-width-0 text-left">
                <div class="text-caption font-weight-black dialog-text-primary text-truncate" style="font-size: 0.82rem !important; line-height: 1.2;">
                  {{ ex.des_esercizio }}
                  <v-icon v-if="ex.flg_video === 'true' || ex.flg_video === true" color="orange" size="14" class="ml-1" title="Video richiesto">mdi-video</v-icon>
                </div>
                <div class="text-super-caption text-muted font-weight-bold mt-0.5" style="font-size: 0.65rem;">
                  Giorno <span class="text-orange-lighten-2 font-weight-black">{{ ex.des_giorno }}<template v-if="ex.num_riga_giorno">{{ ex.num_riga_giorno }}</template></span>
                  <span v-if="ex.des_settore" class="text-orange-lighten-2 font-weight-black"> ({{ ex.des_settore }})</span>
                </div>
                <div v-if="ex['des_week' + settimanaAttiva] || ex.des_qta_report" class="text-super-caption font-weight-black text-orange-lighten-2 mt-1" style="font-size: 0.72rem;">
                  {{ ex['des_week' + settimanaAttiva] || ex.des_qta_report }}
                </div>
              </div>
              <v-icon size="18" color="orange">mdi-chevron-right</v-icon>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top bg-slate-900 gap-2">
          <v-btn color="orange-darken-3" variant="flat" block rounded="lg" size="small" class="font-weight-bold text-white" @click="mostraEserciziVideo = false">Chiudi</v-btn>
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
      <v-card class="card-glass rounded-2xl border" style="background: var(--card-bg-dark) !important; border-color: var(--card-border) !important; backdrop-filter: blur(20px) !important;">
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
          <div class="metric-pill metric-pill-box pa-4 rounded-xl mb-4 text-center border-soft">
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
                W{{ w }}: <strong class="text-slate-dark">{{ reportProgressioni.consistenzaGiorni[w] }}</strong> giorni
              </span>
            </div>
          </div>

          <!-- 2. Feeling e Performance -->
          <v-row dense class="mb-4">
            <v-col cols="6">
              <div class="metric-pill metric-pill-box pa-3 rounded-xl text-center border-soft" style="height: 100%;">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block" style="font-size: 0.55rem;">Sensazione Media</span>
                <span class="text-h6 font-weight-black text-orange-lighten-2 mt-1 d-block">
                  ⭐ {{ reportProgressioni.mediaFeeling || '-' }} <span class="text-caption text-muted">/ 5</span>
                </span>
                <span class="text-super-caption text-muted d-block mt-0.5" style="font-size: 0.55rem;">Feeling generale</span>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="metric-pill metric-pill-box pa-3 rounded-xl text-center border-soft" style="height: 100%;">
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

          <div v-if="reportProgressioni.progressioniCarichi.length === 0" class="text-center py-6 card-glass rounded-xl border-soft">
            <v-icon color="grey" size="32">mdi-chart-line-stacked</v-icon>
            <p class="text-caption text-muted mt-2 mb-0">Nessuna progressione registrata tra Week 1 e successive.</p>
          </div>

          <div v-else class="d-flex flex-column gap-2">
            <v-card
              v-for="(p, idx) in reportProgressioni.progressioniCarichi"
              :key="idx"
              class="progression-card-item pa-3 rounded-xl border-soft text-left cursor-pointer clickable-progression-card"
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
                  <span>W1: <strong>{{ p.w1 }}{{ p.isRep ? 'r' : (String(p.w1).includes('(') ? '' : ' kg') }}</strong></span>
                  <v-icon size="12" class="mx-1" color="orange">mdi-arrow-right</v-icon>
                  <span>W{{ p.latestWeek }}: <strong>{{ p.latest }}{{ p.isRep ? 'r' : (String(p.latest).includes('(') ? '' : ' kg') }}</strong></span>
                </div>
                <div class="text-super-caption text-green-accent-4 font-weight-black" style="font-size: 0.68rem;">
                  {{ String(p.delta).startsWith('+') ? p.delta : '+' + p.delta }}{{ p.isRep ? 'r' : (p.isVolume ? '' : ' kg') }}
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

    <!-- MODALE GUIDA INTERATTIVA & FEATURE SHOWCASE -->
    <!-- MODALE GUIDA INTERATTIVA & FEATURE SHOWCASE -->
    <GuidaFlexCoachModal
      v-model="mostraGuidaInterattiva"
      @avvia-tour="avviaTourGuidato"
    />

    <v-overlay v-model="mostraSpotlightTour" class="align-center justify-center" persistent style="z-index: 9999;">
      <v-card class="pa-5 rounded-2xl text-left border card-glass-dark" max-width="360" style="backdrop-filter: blur(20px);">
        <div class="d-flex align-center justify-space-between mb-2">
          <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white px-2">
            PASSO {{ tourStep + 1 }} DI {{ tourSteps.length }}
          </v-chip>
          <v-btn icon="mdi-close" variant="text" size="x-small" color="grey" @click="chiudiTour"></v-btn>
        </div>
        <h3 class="text-subtitle-1 font-weight-black text-orange-lighten-2 mb-1">
          {{ tourSteps[tourStep]?.titolo }}
        </h3>
        <p class="text-caption text-slate mb-4">
          {{ tourSteps[tourStep]?.descrizione }}
        </p>
        <div class="d-flex align-center justify-space-between gap-2">
          <v-btn v-if="tourStep > 0" variant="outlined" color="grey" size="small" rounded="lg" class="font-weight-bold text-none" @click="tourStep--">Indietro</v-btn>
          <div class="flex-grow-1"></div>
          <v-btn color="orange-darken-3" variant="flat" size="small" rounded="lg" class="font-weight-bold text-white text-none" @click="avantiTour">
            {{ tourStep < tourSteps.length - 1 ? 'Avanti ›' : 'Ho Capito! 🚀' }}
          </v-btn>
        </div>
      </v-card>
    </v-overlay>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRouter } from 'vue-router';
import GuidaFlexCoachModal from '../components/GuidaFlexCoachModal.vue';
import { doc, getDoc, setDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { 
  selectedAthlete, 
  selectedSheet, 
  setSelectedAthlete,
  setSelectedSheet,
  inizializzaSessione, 
  utente, 
  ruolo,
  idCliente,
  getNomeAtleta, 
  getEmailAtleta,
  isAtletaObsoleto,
  isAtletaAttivo,
  getSchedaSelezionataAtleta,
  getVistaDettagliAtleta,
  activeTimer, 
  stopGlobalTimer, 
  setGlobalHaEserciziDaFare, 
  setGlobalSettimanaDaChiudere, 
  globalStoryboard, 
  loadingStoryboard, 
  layoutEserciziGlobal,
  ORDINE_ORIGINALE_ATLETI,
  getStoryboardBackup,
  MAPPA_CLIENTI_DINAMICI,
  impostaNomeAtletaDinamico,
  caricaNomiAtletiDinamici,
  temaHeaderGiornoGlobal,
  haRecupero
} from '../authStore.js';
import { jsPDF } from 'jspdf';

const router = useRouter();

const vibraTattile = (ms = 12) => {
  if (localStorage.getItem('woapp_vibrazione_attiva') === 'false') return;
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Stato della ricerca/selezione
const listaAtleti = ref([]);
const workoutsList = ref([]);
const searchQuery = ref('');
const mostraRicercaPannello = ref(false);
const caricamentoWorkouts = ref(false);
const caricamento = ref(false);

const itemsAtleti = computed(() => {
  // Filtra ed esclude completamente i clienti disabilitati
  const soloAttivi = listaAtleti.value.filter(id => isAtletaAttivo(id));
  const ordinati = [...soloAttivi].sort((a, b) => {
    const idxA = ORDINE_ORIGINALE_ATLETI.indexOf(String(a).trim());
    const idxB = ORDINE_ORIGINALE_ATLETI.indexOf(String(b).trim());
    const posA = idxA === -1 ? 999 : idxA;
    const posB = idxB === -1 ? 999 : idxB;
    return posA - posB;
  });

  return ordinati.map(id => {
    const nome = getNomeAtleta(id);
    return {
      title: nome ? `${nome} (ID: ${id})` : `Atleta ID: ${id}`,
      value: id
    };
  });
});

const filteredWorkouts = computed(() => {
  if (!searchQuery.value) return workoutsList.value;
  const q = searchQuery.value.toLowerCase().trim();
  return workoutsList.value.filter(w => {
    const scheda = String(w.num_scheda).toLowerCase();
    const desc = String(w.des_descrizione || '').toLowerCase();
    const note = String(w.des_note || '').toLowerCase();
    const data = String(w.dat_data || '').toLowerCase();
    return scheda.includes(q) || desc.includes(q) || note.includes(q) || data.includes(q);
  });
});

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

  const parsePesoSafe = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/,/g, '.').trim();
    if (/^\d+(?:\.\d+)?\s*[rR]\b/i.test(clean) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(clean)) return 0;
    const matchKg = clean.match(/^(\d+(?:\.\d+)?)/);
    if (matchKg) return parseFloat(matchKg[1]) || 0;
    return 0;
  };

  const estraiRepsVal = (val, des = '') => {
    if (!val && !des) return 0;
    const clean = String(val || '').replace(/,/g, '.').trim();
    const matchX = clean.match(/[xX]\s*(\d+)/) || clean.match(/(\d+)\s*[rR]\b/);
    if (matchX) return parseInt(matchX[1]);
    const cleanDes = String(des || '').trim();
    const matchDes = cleanDes.match(/[xX]\s*(\d+)/) || cleanDes.match(/(\d+)\s*[rR]\b/);
    if (matchDes) return parseInt(matchDes[1]);
    const num = parseInt(clean);
    return isNaN(num) ? 0 : num;
  };

  const isRepProgressionHome = (ex) => {
    const vals = [ex.ins_week1, ex.ins_week2, ex.ins_week3, ex.ins_week4, ex.ins_week5, ex.ins_week6]
      .filter(Boolean).map(v => String(v).trim());
    if (vals.length === 0) return false;
    const repVals = vals.filter(v => /^\d+(?:\.\d+)?\s*[rR]\b/i.test(v) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(v));
    return repVals.length > vals.length / 2;
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

    const useRep = isRepProgressionHome(ex);
    const p1 = parsePesoSafe(ex.ins_week1);
    const r1 = estraiRepsVal(ex.ins_week1, ex.des_week1) || 10;
    const w1Val = useRep ? (estraiRepsVal(ex.ins_week1) || 0) : p1;

    if (w1Val > 0 || p1 > 0) {
      result.totaleEserciziConCarichi++;
      for (let w = 6; w >= 2; w--) {
        const pW = parsePesoSafe(ex['ins_week' + w]);
        const rW = estraiRepsVal(ex['ins_week' + w], ex['des_week' + w]) || 10;
        const wVal = useRep ? (estraiRepsVal(ex['ins_week' + w]) || 0) : pW;

        if (useRep) {
          if (wVal > w1Val) {
            const delta = wVal - w1Val;
            const pct = Math.round((delta / w1Val) * 100);
            result.progressioniCarichi.push({
              id: ex.id,
              nome: ex.des_esercizio || 'Esercizio',
              w1: w1Val,
              latest: wVal,
              latestWeek: w,
              delta: delta,
              pct: pct,
              isRep: true
            });
            break;
          }
        } else if (pW > p1 && p1 > 0) {
          const delta = parseFloat((pW - p1).toFixed(1));
          const pct = Math.round((delta / p1) * 100);
          result.progressioniCarichi.push({
            id: ex.id,
            nome: ex.des_esercizio || 'Esercizio',
            w1: p1,
            latest: pW,
            latestWeek: w,
            delta: delta,
            pct: pct,
            isRep: false
          });
          break;
        } else if (p1 > 0 && pW > 0 && rW > r1 + 1) {
          const e1rm1 = p1 * (1 + r1 / 30);
          const e1rmW = pW * (1 + rW / 30);
          if (e1rmW >= e1rm1 * 0.98) {
            const deltaReps = rW - r1;
            const pct = Math.max(1, Math.round((deltaReps / r1) * 100));
            result.progressioniCarichi.push({
              id: ex.id,
              nome: ex.des_esercizio || 'Esercizio',
              w1: `${p1} (${r1}r)`,
              latest: `${pW} (${rW}r)`,
              latestWeek: w,
              delta: `+${deltaReps}r`,
              pct: pct,
              isRep: false,
              isVolume: true
            });
            break;
          }
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
const nomeAtleta = ref('');
const settimanaAttiva = ref(parseInt(localStorage.getItem('settimanaAttiva_' + selectedAthlete.value)) || 2);
const giornoAttivo = ref(localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'C');
const dataInizio = ref('18 mag 26');
const dataFine = ref('28 giu 26');
const descrizioneMesociclo = ref('');
const workoutTData = ref(null);

watch([selectedAthlete, MAPPA_CLIENTI_DINAMICI], () => {
  const n = getNomeAtleta(selectedAthlete.value);
  if (n) {
    nomeAtleta.value = n.toUpperCase();
  } else if (selectedAthlete.value) {
    nomeAtleta.value = `ATLETA ID: ${selectedAthlete.value}`;
  }
}, { immediate: true });

// Funzione per rimappare gli URL delle GIF dal dominio vecchio a GitHub Pages
const getGifUrl = (url) => {
  if (!url) return '';
  let mapped = url;
  if (url.includes('definizionemuscolareestrema.com')) {
    mapped = url.replace('definizionemuscolareestrema.com', 'visualgabri.github.io');
  }
  if (mapped.includes('visualgabri.github.io')) {
    const mappings = {
      'PectoralSternal_file': 'PettoBasso',
      'BackGeneral_file': 'DorsaliBack',
      'Obliques_file': 'Obliqui',
      'Ischiocrurali_file': 'Femorali',
      'PectoralClavicular_file': 'PettoAlto',
      'DeltoidPosterior_file': 'DeltoidiPosteriori',
      'Triceps_file': 'Tricipiti',
      'Biceps_file': 'Bicipiti',
      'Quadriceps_file': 'Quadricipiti',
      'Calves_file': 'Gastrocnemio',
      'Abs_file': 'Addome',
      'Glutes_file': 'Glutei',
      'DeltoidAnterior_file': 'DeltoidiAnteriori',
      'DeltoidLateral_file': 'DeltoidiLaterali',
      'Trapezius_file': 'Trapezio'
    };
    for (const [key, val] of Object.entries(mappings)) {
      if (mapped.includes(key)) {
        mapped = mapped.replace(key, val);
      }
    }
  }
  return mapped;
};

const mostraTestWeek6 = ref(false);
const mostraEserciziNuovi = ref(false);
const mostraEserciziVideo = ref(false);

// Guida Interattiva & Feature Tour
const mostraGuidaInterattiva = ref(false);
const tabGuida = ref(0);
const searchGuida = ref('');
const simPeso = ref(80);
const simReps = ref(8);

const calcolaSimE1RM = computed(() => {
  if (!simPeso.value || !simReps.value) return 0;
  return Math.round(simPeso.value * (1 + simReps.value / 30) * 10) / 10;
});

const apriGuidaInterattiva = (tabIndex = 0) => {
  tabGuida.value = tabIndex;
  mostraGuidaInterattiva.value = true;
};

const cambiaTemaInterattivo = (theme, style) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-light-style', style);
  localStorage.setItem('woapp_theme', theme);
  localStorage.setItem('woapp_light_style', style);
};

// Tour Guidato Spotlight
const mostraSpotlightTour = ref(false);
const tourStep = ref(0);
const tourSteps = [
  {
    titolo: '👋 Benvenuto in FlexCoach!',
    descrizione: 'Questa è la tua piattaforma avanzata per la forza. Vediamo insieme le funzionalità principali in pochissimi secondi.'
  },
  {
    titolo: '📖 Guida Sempre a Portata di Mano',
    descrizione: 'Tocca l’icona del libro in alto a destra per aprire la Guida Interattiva, calcolare l’e1RM o provare i temi.'
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

const avviaTourGuidato = () => {
  mostraGuidaInterattiva.value = false;
  tourStep.value = 0;
  mostraSpotlightTour.value = true;
};

const avantiTour = () => {
  if (tourStep.value < tourSteps.length - 1) {
    tourStep.value++;
  } else {
    chiudiTour();
  }
};

const chiudiTour = () => {
  mostraSpotlightTour.value = false;
  localStorage.setItem('woapp_tour_completato', 'true');
};

onMounted(() => {
  if (!localStorage.getItem('woapp_tour_completato')) {
    setTimeout(() => {
      mostraSpotlightTour.value = true;
    }, 1500);
  }
});

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

const giorniAllaScadenza = computed(() => {
  const dataScad = workoutTData.value?.dat_scadenza || dataFine.value;
  if (!dataScad) return null;
  const parsedExp = parseDateString(dataScad);
  if (!parsedExp) return null;
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const exp = new Date(parsedExp);
  exp.setHours(0, 0, 0, 0);
  
  const diffTime = exp.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

const giorniAllaScadenzaText = computed(() => {
  if (giorniAllaScadenza.value === null) return '';
  if (giorniAllaScadenza.value < 0) {
    const absDays = Math.abs(giorniAllaScadenza.value);
    return `Scaduto da ${absDays} giorn${absDays === 1 ? 'o' : 'i'}`;
  }
  if (giorniAllaScadenza.value === 0) {
    return 'Scade oggi!';
  }
  return `Mancano ${giorniAllaScadenza.value} giorn${giorniAllaScadenza.value === 1 ? 'o' : 'i'}`;
});

const mostraAvvisoCoachNuovoProgramma = computed(() => {
  if (!allExercises.value || allExercises.value.length === 0) return false;
  if (!settimanaAttiva.value) return false;
  
  if (settimanaAttiva.value > 5) return true;
  
  if (settimanaAttiva.value === 5) {
    const giorniElenco = ['A', 'B', 'C', 'D'];
    const giorniDellaScheda = giorniElenco.filter(g => 
      allExercises.value.some(item => (item.des_giorno || '').trim().toUpperCase() === g)
    );
    
    if (giorniDellaScheda.length === 0) return false;
    
    const giorniCompletatiW5 = giorniDellaScheda.filter(g => {
      const header = allExercises.value.find(
        item => (item.des_giorno || '').trim().toUpperCase() === g && parseInt(item.num_riga_giorno) === 0
      );
      return header && isTrue(header.cmp5);
    });
    
    const metaRaggiunta = giorniCompletatiW5.length >= Math.ceil(giorniDellaScheda.length / 2);
    return metaRaggiunta;
  }
  
  return false;
});

const contattaCoachWhatsApp = () => {
  vibraTattile(12);
  const numeroCoach = '393495525181'; // Coach Gabriele (+39)
  const nScheda = schedaSelezionata.value || '';
  const messaggio = `Ciao Coach Gabriele, ho superato la metà della settimana 5 dell'allenamento (Scheda ${nScheda}). Posso chiederti di preparare il prossimo programma? Grazie!`;
  const url = `https://wa.me/${numeroCoach}?text=${encodeURIComponent(messaggio)}`;
  window.open(url, '_blank');
};

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
  if (clean.includes('petto') || clean.includes('pettorali') || clean.includes('pectoral') || clean.includes('chest')) {
    return 'Pettorali';
  }
  if (clean.includes('dorso') || clean.includes('dorsali') || clean.includes('schiena') || clean.includes('latissimus') || clean.includes('trapezius') || clean.includes('dorsal') || clean.includes('back')) {
    return 'Dorsali';
  }
  if (clean.includes('spalle') || clean.includes('deltoidi') || clean.includes('deltoid') || clean.includes('spall') || clean.includes('shoulder')) {
    return 'Spalle';
  }
  if (clean.includes('bicipiti') || clean.includes('bicipite') || clean.includes('brachialis') || clean.includes('brachioradialis') || clean.includes('biceps')) {
    return 'Bicipiti';
  }
  if (clean.includes('tricipiti') || clean.includes('tricipite') || clean.includes('triceps')) {
    return 'Tricipiti';
  }
  if (clean.includes('gambe') || clean.includes('quadricipiti') || clean.includes('quadriceps') || clean.includes('femorali') || clean.includes('ischio') || clean.includes('ischiocrurali') || clean.includes('glutei') || clean.includes('gluteus') || clean.includes('gluteo') || clean.includes('adduttori') || clean.includes('adductor') || clean.includes('abductor') || clean.includes('leg') || clean.includes('polpacci') || clean.includes('polpaccio') || clean.includes('soleo') || clean.includes('gastrocnemius')) {
    return 'Gambe';
  }
  if (clean.includes('addome') || clean.includes('addominali') || clean.includes('abdomis') || clean.includes('core') || clean.includes('obliqui') || clean.includes('oblique') || clean.includes('abs')) {
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
  const themeColor = temaHeaderGiornoGlobal ? temaHeaderGiornoGlobal.value : 'arancio';
  const rgb = themeColor === 'blu' ? '59, 130, 246' : (themeColor === 'verde' ? '16, 185, 129' : (themeColor === 'fucsia' ? '236, 72, 153' : (themeColor === 'giallo' ? '234, 179, 8' : '249, 115, 22')));
  const hex = themeColor === 'blu' ? '#3b82f6' : (themeColor === 'verde' ? '#10b981' : (themeColor === 'fucsia' ? '#ec4899' : (themeColor === 'giallo' ? '#eab308' : '#f97316')));
  if (v <= 4) return `rgba(${rgb}, 0.35)`;
  if (v <= 8) return `rgba(${rgb}, 0.65)`;
  if (v <= 12) return `rgba(${rgb}, 0.85)`;
  return hex;
};

const getMuscleStroke = (sector) => {
  const v = volumeMuscolare.value[sector] || 0;
  if (v === 0) return 'rgba(255, 255, 255, 0.12)';
  const themeColor = temaHeaderGiornoGlobal ? temaHeaderGiornoGlobal.value : 'arancio';
  const rgb = themeColor === 'blu' ? '59, 130, 246' : (themeColor === 'verde' ? '16, 185, 129' : (themeColor === 'fucsia' ? '236, 72, 153' : (themeColor === 'giallo' ? '234, 179, 8' : '249, 115, 22')));
  return `rgba(${rgb}, 0.9)`;
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
  const pageW = 210;
  const marginL = 12;
  const marginR = 12;
  const contentW = pageW - marginL - marginR;
  
  // ── Helper: testo con wrap automatico ──
  const textWrap = (text, x, yPos, maxW, lineH = 4) => {
    const lines = doc.splitTextToSize(String(text || ''), maxW);
    lines.forEach((line, i) => {
      doc.text(line, x, yPos + i * lineH);
    });
    return lines.length;
  };
  
  // ── Helper: nuova pagina se necessario ──
  const checkPageBreak = (yPos, needed = 20) => {
    if (yPos + needed > 282) {
      doc.addPage();
      return 15;
    }
    return yPos;
  };

  // ── Helper: formato peso con virgola (locale IT) ──
  const fmtVal = (v) => {
    if (v === null || v === undefined || v === 0) return '-';
    return String(v).replace('.', ',');
  };
  
  // ═══════════════════════════════════════
  // HEADER
  // ═══════════════════════════════════════
  doc.setFillColor(249, 115, 22);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('FLEXCOACH — REPORT PROGRESSIONI', marginL + 2, 12);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const oggi = new Date().toLocaleDateString('it-IT', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.text(`${nomeAtleta.value || 'Atleta'}  •  Scheda ${schedaSelezionata.value}  •  ${oggi}`, marginL + 2, 22);
  
  // ═══════════════════════════════════════
  // 1. STATISTICHE
  // ═══════════════════════════════════════
  let y = 38;
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('1. STATISTICHE DI CONSISTENZA E PERFORMANCE', marginL, y);
  doc.setDrawColor(249, 115, 22);
  doc.setLineWidth(0.5);
  doc.line(marginL, y + 2, marginL + contentW, y + 2);
  
  y += 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  // Box statistiche
  const boxW = contentW / 3 - 2;
  const boxH = 18;
  const boxY = y;
  
  // Box 1: Consistenza
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginL, boxY, boxW, boxH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22);
  doc.text(`${reportProgressioni.value.percentualeConsistenza}%`, marginL + boxW / 2, boxY + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('CONSISTENZA', marginL + boxW / 2, boxY + 15, { align: 'center' });
  
  // Box 2: Feeling
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginL + boxW + 3, boxY, boxW, boxH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(249, 115, 22);
  doc.text(`${reportProgressioni.value.mediaFeeling || '-'}`, marginL + boxW + 3 + boxW / 2, boxY + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('FEELING MEDIO / 5', marginL + boxW + 3 + boxW / 2, boxY + 15, { align: 'center' });
  
  // Box 3: Progressioni
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(marginL + (boxW + 3) * 2, boxY, boxW, boxH, 2, 2, 'F');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(16, 185, 129);
  doc.text(`${reportProgressioni.value.progressioniCarichi.length}`, marginL + (boxW + 3) * 2 + boxW / 2, boxY + 10, { align: 'center' });
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('PROGRESSIONI', marginL + (boxW + 3) * 2 + boxW / 2, boxY + 15, { align: 'center' });
  
  y = boxY + boxH + 5;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(100, 116, 139);
  let consistenzaDettaglio = '';
  for (let w = 1; w <= 6; w++) {
    consistenzaDettaglio += `W${w}: ${reportProgressioni.value.consistenzaGiorni[w]}gg   `;
  }
  doc.text(`Dettaglio settimane: ${consistenzaDettaglio}`, marginL, y);
  
  y += 4;
  const fatiche = reportProgressioni.value.miglioriFatiche;
  doc.text(`Sforzo W6 → Media: ${fatiche.Media} | Pesante: ${fatiche.Pesante} | Devastante: ${fatiche.Devastante}`, marginL, y);
  
  // ═══════════════════════════════════════
  // 2. TABELLA PROGRESSIONI (ordinata per forza progressione)
  // ═══════════════════════════════════════
  y += 12;
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('2. DETTAGLIO PROGRESSIONE CARICHI (dalla migliore alla peggiore)', marginL, y);
  doc.setDrawColor(249, 115, 22);
  doc.line(marginL, y + 2, marginL + contentW, y + 2);
  
  y += 8;

  // Colonne: Esercizio | G | REPS | W1 | ULTIMO | PROGR | %
  const colX = {
    nome: marginL + 1,
    giorno: marginL + 56,
    reps: marginL + 67,
    w1: marginL + 90,
    ultimo: marginL + 113,
    delta: marginL + 139,
    pct: marginL + 172
  };
  const colW = {
    nome: 54,
    giorno: 10,
    reps: 22,
    w1: 22,
    ultimo: 25,
    delta: 32,
    pct: 14
  };
  
  // Disegna header tabella
  const drawTableHeader = (yPos) => {
    doc.setFillColor(30, 41, 59);
    doc.rect(marginL, yPos, contentW, 7, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.text('ESERCIZIO', colX.nome + 1, yPos + 5);
    doc.text('G', colX.giorno + 1, yPos + 5);
    doc.text('REPS', colX.reps + 1, yPos + 5);
    doc.text('W1', colX.w1 + 1, yPos + 5);
    doc.text('ULTIMO', colX.ultimo + 1, yPos + 5);
    doc.text('PROGR.', colX.delta + 1, yPos + 5);
    doc.text('%', colX.pct + 1, yPos + 5);
    return yPos + 7;
  };
  
  y = drawTableHeader(y);

  // Costruisci lista ordinata: prima le progressioni positive (dal più alto %), poi stabili, poi negativi
  const isPercVExercise = (ex) => {
    if (!ex) return false;
    const flg = String(ex.flg_perc || '');
    if (flg.includes('V%') || flg.includes('%V') || flg.includes('%')) return true;
    const desConcat = [ex.des_week1, ex.des_week2, ex.des_week3, ex.des_week4, ex.des_week5, ex.des_week6].join(' ');
    return desConcat.includes('%') || /\bRPE\b/i.test(desConcat);
  };

  const parsePeso = (val, ex = null, weekNum = null) => {
    if (ex && weekNum) {
      const explicitNumVal = ex['num_ins' + weekNum];
      if (explicitNumVal !== undefined && explicitNumVal !== null && String(explicitNumVal).trim() !== '') {
        const num = parseFloat(String(explicitNumVal).replace(',', '.'));
        if (!isNaN(num) && num > 0) {
          return num;
        }
      }
    }

    if (!val) return 0;
    const clean = String(val).replace(/,/g, '.').trim();
    
    const isRepVal = /^\d+(?:\.\d+)?\s*[rR]\b/i.test(clean) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(clean);
    if (isRepVal) return 0;

    const isPercString = /%/i.test(clean) || /\bRPE\b/i.test(clean);
    const hasExplicitKg = /kg\b/i.test(clean);

    if ((isPercString || (ex && isPercVExercise(ex))) && !hasExplicitKg) {
      return 0;
    }

    const lines = clean.split(/\r?\n/).map(l => l.trim()).filter(Boolean);
    for (const line of lines) {
      if (/\b(?:trazioni|dip|note|massimale|avambraccio|problema|mezze|forse)\b/i.test(line)) {
        continue;
      }
      const matchLineKg = line.match(/^(\d+(?:\.\d+)?)\s*kg\b/i);
      if (matchLineKg) return parseFloat(matchLineKg[1]);

      const pureNum = parseFloat(line);
      if (!isNaN(pureNum) && pureNum > 0) return pureNum;
    }

    const matchKg = clean.match(/(\d+(?:\.\d+)?)\s*kg\b/i);
    if (matchKg) {
      return parseFloat(matchKg[1]);
    }

    const cleanNum = clean.replace(/[^\d.]/g, ' ').trim();
    const parts = cleanNum.split(/\s+/);
    const num = parseFloat(parts[0]);
    return isNaN(num) ? 0 : num;
  };

  const estraiRepsEsercizio = (strVal, desVal = '') => {
    if (!strVal && !desVal) return 0;
    const cleanStr = String(strVal || '').trim();
    
    const matchRepsIns = cleanStr.match(/(\d+)\s*[rR]\b/) || 
                         cleanStr.match(/(\d+)\s*(?:rep|rip)/i) || 
                         cleanStr.match(/(\d+)\s*@\d+/);
    if (matchRepsIns) {
      return parseInt(matchRepsIns[1]);
    }
    
    const cleanDes = String(desVal || '').trim();
    const matchRepsDes = cleanDes.match(/[xX]\s*(\d+)/) || cleanDes.match(/(\d+)\s*[rR]\b/);
    if (matchRepsDes) {
      return parseInt(matchRepsDes[1]);
    }

    const pureNum = parseInt(cleanStr);
    if (!isNaN(pureNum) && pureNum > 0 && pureNum <= 100) {
      return pureNum;
    }

    return 0;
  };

  const isRepValPDF = (val) => {
    if (!val) return false;
    const clean = String(val).trim();
    return /^\d+(?:\.\d+)?\s*[rR]\b/i.test(clean) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(clean);
  };

  const isRepExPDF = (ex) => {
    const vals = [ex.ins_week1, ex.ins_week2, ex.ins_week3, ex.ins_week4, ex.ins_week5, ex.ins_week6].filter(Boolean);
    if (vals.length === 0) return false;
    const repVals = vals.filter(v => isRepValPDF(v));
    return repVals.length > vals.length / 2;
  };

  const righe = [];
  const items = allExercises.value || [];
  
  items.forEach(ex => {
    if (parseInt(ex.num_riga_giorno) === 0) return;
    
    const weekData = {};
    let hasAny = false;
    for (let w = 1; w <= 6; w++) {
      const rawIns = ex['ins_week' + w] || '';
      const rawDes = ex['des_week' + w] || '';
      if (rawIns) hasAny = true;
      const weight = parsePeso(rawIns, ex, w);
      const reps = estraiRepsEsercizio(rawIns, rawDes);
      weekData[w] = { weight, reps, rawIns, rawDes };
    }
    if (!hasAny) return;
    
    const isRep = isRepExPDF(ex);
    const isPercV = isPercVExercise(ex);

    const w1Info = weekData[1];
    let latestW = 1;
    for (let w = 6; w >= 1; w--) {
      if (weekData[w].weight > 0 || weekData[w].rawIns) {
        latestW = w;
        break;
      }
    }
    const latestInfo = weekData[latestW];

    // 1. Costruisci Reps Column (SOLO ripetizioni, senza numero di serie)
    let targetRange = '-';
    if (w1Info.reps > 0 && latestInfo.reps > 0 && w1Info.reps !== latestInfo.reps) {
      targetRange = `${w1Info.reps}r -> ${latestInfo.reps}r`;
    } else if (latestInfo.reps > 0) {
      targetRange = `${latestInfo.reps}r`;
    } else if (w1Info.reps > 0) {
      targetRange = `${w1Info.reps}r`;
    } else if (ex.des_qta_report) {
      let cleanQ = String(ex.des_qta_report).replace(/^\d+\s*[xX]\s*/, '').trim();
      targetRange = cleanQ.endsWith('r') || cleanQ.includes('%') ? cleanQ : `${cleanQ}r`;
    }

    // 2. Analisi incremento a parità di ripetizioni (es: W1=10r @80, W3=8r @90, W6=8r @100)
    let wSameReps = null;
    if (latestInfo.reps > 0 && w1Info.reps > 0 && w1Info.reps !== latestInfo.reps) {
      for (let w = 2; w < latestW; w++) {
        if (weekData[w].reps === latestInfo.reps && weekData[w].weight > 0) {
          wSameReps = w;
          break;
        }
      }
    }

    const w1Val = w1Info.weight;
    const latestVal = latestInfo.weight;
    const delta = latestVal - w1Val;
    const pct = w1Val > 0 ? Math.round((delta / w1Val) * 100) : 0;
    const unit = isRep ? 'r' : ' kg';
    
    let deltaText = '-';
    let pctText = '-';
    let colorType = 'neutral';
    
    if (delta > 0 && w1Val > 0) {
      colorType = 'positive';
      pctText = `+${pct}%`;

      if (wSameReps && weekData[wSameReps].weight > 0) {
        const deltaSame = latestVal - weekData[wSameReps].weight;
        if (deltaSame > 0) {
          deltaText = `+${fmtVal(parseFloat(delta.toFixed(1)))}${unit} (+${fmtVal(parseFloat(deltaSame.toFixed(1)))} vs W${wSameReps})`;
        } else {
          deltaText = `+${fmtVal(parseFloat(delta.toFixed(1)))}${unit}`;
        }
      } else {
        deltaText = `+${isRep ? delta : fmtVal(parseFloat(delta.toFixed(1)))}${unit}`;
      }
    } else if (delta < 0 && w1Val > 0) {
      const reps1 = w1Info.reps || 10;
      const repsLatest = latestInfo.reps || 10;
      const e1rm1 = w1Val * (1 + reps1 / 30);
      const e1rmLatest = latestVal * (1 + repsLatest / 30);

      if (repsLatest > reps1 && e1rmLatest >= e1rm1 * 0.98) {
        const deltaReps = repsLatest - reps1;
        const e1rmPct = Math.round(((e1rmLatest - e1rm1) / e1rm1) * 100);
        deltaText = `${fmtVal(parseFloat(delta.toFixed(1)))}${unit} (+${deltaReps}r vol)`;
        pctText = e1rmPct >= 0 ? `+${e1rmPct}% e1RM` : `+${deltaReps}r`;
        colorType = 'positive';
      } else {
        deltaText = `${isRep ? '-' + Math.abs(delta) : fmtVal(parseFloat(delta.toFixed(1)))}${unit}`;
        pctText = `${pct}%`;
        colorType = 'negative';
      }
    } else if (isPercV) {
      deltaText = 'Note %V';
      pctText = 'In Target';
      colorType = 'neutral';
    } else if (w1Val === 0 && latestVal > 0) {
      deltaText = `W${latestW}: ${fmtVal(latestVal)}${unit}`;
      pctText = 'N/A';
      colorType = 'neutral';
    }
    
    const rigaNum = ex.num_riga_giorno || ex.num_ordine || '';
    const coordStr = `${ex.des_giorno || ''}${rigaNum}`;

    righe.push({
      nome: ex.des_esercizio || 'Esercizio',
      giorno: coordStr || ex.des_giorno || '-',
      targetRange,
      w1Val, latestVal, latestW, delta, pct, isRep, unit, isPercV,
      deltaText, pctText, colorType,
      wSameReps,
      sameRepsWeight: wSameReps ? weekData[wSameReps].weight : 0,
      sameRepsCount: latestInfo.reps,
      settore: ex.des_settore || '',
      exOriginal: ex
    });
  });
  
  // Ordina: positivi (% decrescente) → stabili → negativi (% crescente)
  righe.sort((a, b) => {
    if (a.colorType === 'positive' && b.colorType !== 'positive') return -1;
    if (a.colorType !== 'positive' && b.colorType === 'positive') return 1;
    if (a.colorType === 'negative' && b.colorType !== 'negative') return 1;
    if (a.colorType !== 'negative' && b.colorType === 'negative') return -1;
    return b.pct - a.pct;
  });
  
  // Disegna righe
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  let rowIdx = 0;
  
  righe.forEach(r => {
    const nomeLines = doc.splitTextToSize(r.nome, colW.nome);
    const rowH = Math.max(6, nomeLines.length * 3.5 + 2);
    
    if (y + rowH > 275) {
      doc.addPage();
      y = 15;
      y = drawTableHeader(y);
      rowIdx = 0;
    }
    
    if (rowIdx % 2 === 1) {
      doc.setFillColor(248, 250, 252);
      doc.rect(marginL, y, contentW, rowH, 'F');
    }
    
    if (r.colorType === 'positive') {
      doc.setFillColor(16, 185, 129);
      doc.rect(marginL, y, 1.5, rowH, 'F');
    } else if (r.colorType === 'negative') {
      doc.setFillColor(239, 68, 68);
      doc.rect(marginL, y, 1.5, rowH, 'F');
    } else {
      doc.setFillColor(148, 163, 184);
      doc.rect(marginL, y, 1.5, rowH, 'F');
    }
    
    const textY = y + rowH / 2 + 1;
    
    // Nome esercizio (con wrap)
    doc.setTextColor(30, 41, 59);
    doc.setFont('helvetica', 'normal');
    nomeLines.forEach((line, i) => {
      doc.text(line, colX.nome + 2, y + 3.5 + i * 3.5);
    });
    
    // Giorno / Coordinata
    doc.setTextColor(100, 116, 139);
    doc.text(String(r.giorno), colX.giorno + 1, textY);
    
    // Target / Range Reps (Solo ripetizioni)
    doc.setTextColor(100, 116, 139);
    const targetStr = String(r.targetRange || '-').slice(0, 12);
    doc.text(targetStr, colX.reps + 1, textY);
    
    // W1: Priorità a quello che ha scritto l'atleta (ins_week1)
    doc.setTextColor(51, 65, 85);
    let w1Str = '-';
    const insW1Clean = String(r.exOriginal?.ins_week1 || '').trim();
    if (insW1Clean) {
      const firstLineW1 = insW1Clean.split(/\r?\n/)[0];
      w1Str = firstLineW1.slice(0, 15);
    } else if (r.w1Val > 0) {
      w1Str = `${fmtVal(r.w1Val)}${r.unit}`;
    } else if (r.exOriginal?.des_week1) {
      w1Str = String(r.exOriginal.des_week1).slice(0, 15);
    }
    doc.text(w1Str, colX.w1 + 1, textY);
    
    // Ultimo valore: Priorità a quello che ha scritto l'atleta (ins_weekX)
    let lastStr = '-';
    const lastWNum = r.latestW || 6;
    const insLastClean = String(r.exOriginal?.['ins_week' + lastWNum] || r.exOriginal?.ins_week6 || '').trim();
    
    if (insLastClean) {
      const firstLineLast = insLastClean.split(/\r?\n/)[0];
      lastStr = `${firstLineLast.slice(0, 14)} (W${lastWNum})`;
    } else if (r.latestVal > 0) {
      lastStr = `${fmtVal(r.latestVal)}${r.unit} (W${lastWNum})`;
    } else if (r.exOriginal?.['des_week' + lastWNum] || r.exOriginal?.des_week6) {
      const desVal = r.exOriginal?.['des_week' + lastWNum] || r.exOriginal?.des_week6;
      lastStr = `${String(desVal).slice(0, 14)} (W${lastWNum})`;
    }
    doc.text(lastStr, colX.ultimo + 1, textY);
    
    // Delta e %
    if (r.colorType === 'positive') {
      doc.setTextColor(16, 185, 129);
      doc.setFont('helvetica', 'bold');
    } else if (r.colorType === 'negative') {
      doc.setTextColor(239, 68, 68);
      doc.setFont('helvetica', 'bold');
    } else {
      doc.setTextColor(100, 116, 139);
    }
    doc.text(r.deltaText, colX.delta + 1, textY);
    doc.text(r.pctText, colX.pct + 1, textY);
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(51, 65, 85);
    
    y += rowH;
    rowIdx++;
  });
  
  // ═══════════════════════════════════════
  // 3. CONSIGLI PER IL PROSSIMO MESOCICLO
  // ═══════════════════════════════════════
  y += 10;
  y = checkPageBreak(y, 60);
  
  doc.setTextColor(51, 65, 85);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.text('3. CONSIGLI PER IL PROSSIMO MESOCICLO', marginL, y);
  doc.setDrawColor(249, 115, 22);
  doc.line(marginL, y + 2, marginL + contentW, y + 2);
  y += 8;
  
  // Analizza i dati per generare consigli
  const positivi = righe.filter(r => r.colorType === 'positive');
  const negativi = righe.filter(r => r.colorType === 'negative');
  const stabili = righe.filter(r => r.colorType === 'neutral' && r.w1Val > 0);
  const totEsercizi = righe.filter(r => r.w1Val > 0).length;
  const percProgressioni = totEsercizi > 0 ? Math.round((positivi.length / totEsercizi) * 100) : 0;
  const consistenza = reportProgressioni.value.percentualeConsistenza;
  const feeling = reportProgressioni.value.mediaFeeling;
  
  const consigli = [];
  
  // ── A. Valutazione globale ──
  if (percProgressioni >= 70) {
    consigli.push({ type: 'positive', title: 'Progressione eccellente', text: `Il ${percProgressioni}% degli esercizi ha registrato un aumento di carico. Il mesociclo e' stato altamente produttivo. Nel prossimo mesociclo si puo' spingere ulteriormente con un leggero aumento di volume o intensita'.` });
  } else if (percProgressioni >= 40) {
    consigli.push({ type: 'warning', title: 'Progressione nella media', text: `Il ${percProgressioni}% degli esercizi ha progredito. E' un risultato solido ma con margine di miglioramento. Valutare se gli esercizi rimasti stabili necessitano di varianti tecniche o progressione di volume.` });
  } else if (percProgressioni > 0) {
    consigli.push({ type: 'moderate', title: 'Progressione limitata', text: `Solo il ${percProgressioni}% degli esercizi ha progredito. Verificare se il volume di allenamento e' adeguato o se gli esercizi scelti sono diventati inefficienti e vanno sostituiti.` });
  } else {
    consigli.push({ type: 'negative', title: 'Nessuna progressione rilevata', text: `Nessun esercizio ha registrato progressioni significative. E' necessario rivedere la programmazione: considerare un cambio di stimolo o una riduzione del volume per favorire il recupero.` });
  }
  
  // ── B. Analisi Esercizi a Percentuale / %V (Massimale Teorico & Scostamento Sforzo) ──
  items.forEach(ex => {
    if (isPercVExercise(ex)) {
      const w6Weight = parsePeso(ex.ins_week6, ex);
      const w6Reps = estraiRepsEsercizio(ex.ins_week6) || 8;
      const w1Weight = parsePeso(ex.ins_week1, ex);
      const w1Reps = estraiRepsEsercizio(ex.ins_week1) || 8;

      if (w6Weight > 0 && w1Weight > 0) {
        const rm1_W1 = Math.round(w1Weight * (1 + w1Reps / 30));
        const rm1_W6 = Math.round(w6Weight * (1 + w6Reps / 30));
        if (rm1_W6 > rm1_W1) {
          consigli.push({
            type: 'positive',
            title: `Massimale teorico superato (${ex.des_esercizio || 'Esercizio %V'})`,
            text: `1RM stimato W1: ${rm1_W1} kg -> 1RM effettivo raggiunto in W6: ${rm1_W6} kg (+${rm1_W6 - rm1_W1} kg). Il massimale teorico target e' stato felicemente superato.`
          });
        }
      }
      
      if (ex.num_faticaw6 === 'Devastante') {
        consigli.push({
          type: 'warning',
          title: `Scostamento sforzo target (${ex.des_esercizio || 'Esercizio %V'})`,
          text: `In W6 la percezione dello sforzo per ${ex.des_esercizio} e' risultata "Devastante". E' presente uno scostamento di carico rispetto all'intensita' target prevista dal coach.`
        });
      }
    }
  });

  // ── B2. Analisi Progressione a Parità di Ripetizioni ──
  righe.forEach(r => {
    if (r.wSameReps && r.sameRepsWeight > 0 && r.latestVal > r.sameRepsWeight) {
      const diffSame = parseFloat((r.latestVal - r.sameRepsWeight).toFixed(1));
      consigli.push({
        type: 'positive',
        title: `Progressione a parita' di ripetizioni (${r.nome})`,
        text: `Da W${r.wSameReps} (${r.sameRepsWeight} kg @${r.sameRepsCount}r) a W${r.latestW} (${r.latestVal} kg @${r.sameRepsCount}r) e' stato registrato un incremento effettivo di +${diffSame} kg a parita' di ripetizioni target.`
      });
    }
  });

  // ── C. Consistenza ──
  if (consistenza < 60) {
    consigli.push({ type: 'negative', title: 'Bassa consistenza di allenamento', text: `Con una consistenza del ${consistenza}%, la frequenza di allenamento e' stata insufficiente. Nessuna programmazione e' efficace senza aderenza. Ridurre i giorni di allenamento o riorganizzare i tempi.` });
  } else if (consistenza < 85) {
    consigli.push({ type: 'warning', title: 'Consistenza migliorabile', text: `Consistenza al ${consistenza}%. Alcune settimane sono state incomplete. Verificare se il carico di lavoro e' eccessivo rispetto agli impegni dell'atleta.` });
  }
  
  // ── D. Feeling ──
  if (feeling > 0 && feeling <= 2.5) {
    consigli.push({ type: 'negative', title: 'Feeling basso', text: `Il feeling medio di ${feeling}/5 indica che l'atleta non si e' trovato bene con gli esercizi. Valutare sostituzioni o adattamenti tecnici per ripristinare la motivazione.` });
  } else if (feeling > 4) {
    consigli.push({ type: 'positive', title: 'Feeling ottimo', text: `Il feeling medio di ${feeling}/5 indica grande confidenza e piacevolezza. Questi esercizi funzionano bene e vanno mantenuti nella prossima scheda dove possibile.` });
  }
  
  // ── E. Esercizi top (da mantenere) ──
  if (positivi.length > 0) {
    const topN = positivi.slice(0, 3);
    const topNames = topN.map(r => `${r.nome} (${r.deltaText})`).join(', ');
    consigli.push({ type: 'positive', title: 'Esercizi da mantenere', text: `I migliori progressi: ${topNames}. Questi esercizi stanno rispondendo bene e andrebbero confermati nel prossimo mesociclo.` });
  }
  
  // ── F. Esercizi in stallo (da variare) ──
  if (stabili.length > 0) {
    const stallNames = stabili.slice(0, 3).map(r => r.nome).join(', ');
    consigli.push({ type: 'warning', title: 'Esercizi in stallo', text: `Esercizi senza variazioni: ${stallNames}. Valutare: cambio variante, incremento di volume (serie o reps aggiuntive), o sostituzione con un esercizio simile.` });
  }
  
  // ── G. Esercizi in calo (attenzione) ──
  if (negativi.length > 0) {
    const negNames = negativi.slice(0, 3).map(r => `${r.nome} (${r.deltaText})`).join(', ');
    consigli.push({ type: 'negative', title: 'Esercizi in calo', text: `Attenzione ai seguenti esercizi in regressione: ${negNames}. Possibili cause: volume eccessivo, fatica accumulata, o tecnica inadeguata. Considerare un deload piu' lungo o sostituire la variante.` });
  }
  
  // Disegna i consigli con bullet vettoriali colorati (senza caratteri emoji corrotti)
  doc.setFontSize(8.5);
  consigli.forEach(c => {
    y = checkPageBreak(y, 18);
    
    let dotColor = [37, 99, 235];
    if (c.type === 'positive') dotColor = [16, 185, 129];
    else if (c.type === 'negative') dotColor = [239, 68, 68];
    else if (c.type === 'warning') dotColor = [245, 158, 11];
    else if (c.type === 'moderate') dotColor = [217, 119, 6];

    doc.setFillColor(dotColor[0], dotColor[1], dotColor[2]);
    doc.circle(marginL + 2, y - 1, 1.2, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 41, 59);
    doc.text(c.title, marginL + 5, y);
    y += 4;
    
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    const lines = doc.splitTextToSize(c.text, contentW - 5);
    lines.forEach(line => {
      y = checkPageBreak(y, 4);
      doc.text(line, marginL + 5, y);
      y += 3.8;
    });
    y += 2.5;
  });
  
  // ═══════════════════════════════════════
  // FOOTER
  // ═══════════════════════════════════════
  const totalPages = doc.internal.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184);
    doc.text('Generato con FlexCoach WoApp — I tuoi dati, i tuoi risultati.', marginL, 290);
    doc.text(`Pagina ${i} di ${totalPages}`, pageW - marginR, 290, { align: 'right' });
  }
  
  doc.save(`FlexCoach_Report_${(nomeAtleta.value || 'Atleta').replace(/\s+/g, '_')}_Scheda_${schedaSelezionata.value}.pdf`);
};

const caricaDatiAtleti = async () => {
  try {
    const docRef = doc(db, 'METADATA', 'clienti');
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      listaAtleti.value = docSnap.data().lista || [];
    }
    await caricaNomiAtletiDinamici();
  } catch (error) {
    console.error("Errore caricamento lista atleti in Home:", error);
  }
};

const caricaWorkouts = async () => {
  if (!atletaSelezionato.value) {
    workoutsList.value = [];
    return;
  }
  
  caricamentoWorkouts.value = true;
  try {
    const athleteIdStr = String(atletaSelezionato.value).trim();
    const athleteIdNum = Number(athleteIdStr);

    let snap = await getDocs(query(collection(db, 'WORKOUT_T'), where('ID_cliente', '==', athleteIdStr)));
    let tempDocs = snap.docs.map(d => {
      const data = d.data();
      if (data.NomeCognomeTM) {
        impostaNomeAtletaDinamico(athleteIdStr, data.NomeCognomeTM);
      }
      return data;
    });

    let snapNum = await getDocs(query(collection(db, 'WORKOUT_T'), where('ID_cliente', '==', athleteIdNum)));
    snapNum.forEach(d => {
      const data = d.data();
      if (data.NomeCognomeTM) {
        impostaNomeAtletaDinamico(athleteIdStr, data.NomeCognomeTM);
      }
      if (!tempDocs.some(x => String(x.num_scheda) === String(data.num_scheda))) {
        tempDocs.push(data);
      }
    });

    // Fallback da backup locale se vuoto
    if (tempDocs.length === 0) {
      try {
        const allData = await getStoryboardBackup();
        const raw = allData.filter(item => String(item.ID_cliente) === athleteIdStr);
        const uniqueSchede = [...new Set(raw.map(item => String(item.num_scheda)))];
        
        uniqueSchede.forEach(sheetNum => {
          tempDocs.push({
            ID_cliente: athleteIdStr,
            num_scheda: sheetNum,
            dat_data: '01/01/2026',
            dat_scadenza: '12/02/2026',
            des_descrizione: `Mesociclo ${sheetNum}`,
            des_note: 'Importato da backup',
            flg_da_finire: 'false',
            cod_tipo_avanz_scheda: 'STANDARD'
          });
        });
      } catch (errBackup) {
        console.warn("Fallback backup fallito in Home:", errBackup);
      }
    }

    // Ordina dal più recente al più vecchio
    tempDocs.sort((a, b) => {
      const dateA = parseDateString(a.dat_data);
      const dateB = parseDateString(b.dat_data);
      if (dateA && dateB) {
        if (dateB.getTime() !== dateA.getTime()) {
          return dateB.getTime() - dateA.getTime();
        }
      }
      return parseInt(b.num_scheda) - parseInt(a.num_scheda);
    });

    workoutsList.value = tempDocs;
    
    // Se non c'è una scheda selezionata, o se quella selezionata non appartiene alla lista, imposta l'ultima
    if (tempDocs.length > 0) {
      if (!schedaSelezionata.value || !tempDocs.some(x => String(x.num_scheda) === String(schedaSelezionata.value))) {
        const ultima = tempDocs[0].num_scheda;
        schedaSelezionata.value = ultima;
        setSelectedSheet(ultima);
      }
    }
  } catch (error) {
    console.error("Errore nel caricamento dei workout per la ricerca:", error);
  } finally {
    caricamentoWorkouts.value = false;
  }
};

const gestisciCambioAtleta = async (nuovoAtleta) => {
  vibraTattile(12);
  if (!nuovoAtleta) {
    setSelectedAthlete('');
    setSelectedSheet('');
    atletaSelezionato.value = '';
    schedaSelezionata.value = '';
    workoutsList.value = [];
    return;
  }

  setSelectedAthlete(nuovoAtleta);
  atletaSelezionato.value = nuevoAtleta;
  setSelectedSheet(''); // Azzera la scheda salvata dal precedente atleta
  schedaSelezionata.value = '';
  await caricaWorkouts();
};

const gestisciSelezioneScheda = (scheda) => {
  vibraTattile(12);
  schedaSelezionata.value = scheda;
  setSelectedSheet(scheda);
};

const caricaDatiWorkoutT = async () => {
  dataInizio.value = '18 mag 26';
  dataFine.value = '28 giu 26';
  descrizioneMesociclo.value = '';
  coachMessage.value = '';

  if (!selectedAthlete.value || !selectedSheet.value) return;

  try {
    const athleteIdStr = String(selectedAthlete.value).trim();
    const athleteIdNum = Number(athleteIdStr);
    const sheetNumStr = String(selectedSheet.value).trim();
    const sheetNumNum = Number(sheetNumStr);

    let snap = await getDocs(query(collection(db, 'WORKOUT_T'), where('ID_cliente', '==', athleteIdStr)));
    if (snap.empty) snap = await getDocs(query(collection(db, 'WORKOUT_T'), where('ID_cliente', '==', athleteIdNum)));

    let targetDocData = null;
    if (!snap.empty) {
      for (const d of snap.docs) {
        const data = d.data();
        if (String(data.num_scheda).trim() === sheetNumStr || Number(data.num_scheda) === sheetNumNum) {
          targetDocData = data;
          break;
        }
      }
    }

    if (targetDocData) {
      workoutTData.value = targetDocData;
      dataInizio.value = targetDocData.dat_data || '18 mag 26';
      dataFine.value = targetDocData.dat_scadenza || '28 giu 26';
      descrizioneMesociclo.value = targetDocData.des_descrizione || '';
      if (targetDocData.des_note) {
        coachMessage.value = targetDocData.des_note;
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
      const allData = await getStoryboardBackup();
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
        const activeW = calcolaSettimanaAttivaGlobale(tempExercises);
        settimanaAttiva.value = activeW;
        localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);
      }

      const giorni = ['A', 'B', 'C', 'D'];
      const settimanaNuova = giorni.every(g => {
        const header = tempExercises.find(item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0));
        return !header || !isTrue(header['cmp' + settimanaAttiva.value]);
      });

      let giornoDaFare = '';
      if (settimanaNuova) {
        for (const g of giorni) {
          if (tempExercises.some(item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0))) {
            giornoDaFare = g;
            break;
          }
        }
      } else {
        for (const g of giorni) {
          const header = tempExercises.find(item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0));
          const completato = header ? isTrue(header['cmp' + settimanaAttiva.value]) : false;
          if (!completato) {
            giornoDaFare = g;
            break;
          }
        }
      }

      if (!giornoDaFare) {
        for (const g of giorni) {
          if (tempExercises.some(item => (item.des_giorno || '').trim() === g)) {
            giornoDaFare = g;
            break;
          }
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
      const allData = await getStoryboardBackup();
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

  // Ricalcola la settimana attiva globale
  if (tempExercises.length > 0) {
    const activeW = calcolaSettimanaAttivaGlobale(tempExercises);
    settimanaAttiva.value = activeW;
    localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);
  }

  // Auto-seleziona il primo giorno non completato per la settimana attiva
  let currentDayExists = false;
  let currentDayCompleted = false;
  if (giornoAttivo.value) {
    const currentHeader = tempExercises.find(
      item => (item.des_giorno || '').trim() === giornoAttivo.value && (parseInt(item.num_riga_giorno) === 0)
    );
    if (currentHeader) {
      currentDayExists = true;
      currentDayCompleted = isTrue(currentHeader['cmp' + settimanaAttiva.value]);
    }
  }

  // Verifica se la settimana è completamente nuova/non iniziata (tutti i giorni sono non completati)
  const giorniElenco = ['A', 'B', 'C', 'D'];
  const settimanaNuova = giorniElenco.every(g => {
    const header = tempExercises.find(
      item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0)
    );
    return !header || !isTrue(header['cmp' + settimanaAttiva.value]);
  });

  if (!giornoAttivo.value || !currentDayExists || currentDayCompleted || settimanaNuova) {
    const giorni = ['A', 'B', 'C', 'D'];
    let giornoDaFare = '';
    
    for (const g of giorni) {
      const header = tempExercises.find(
        item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0)
      );
      if (header) {
        const completato = isTrue(header['cmp' + settimanaAttiva.value]);
        if (!completato) {
          giornoDaFare = g;
          break;
        }
      }
    }
    
    if (!giornoDaFare) {
      for (const g of giorni) {
        if (tempExercises.some(item => (item.des_giorno || '').trim() === g)) {
          giornoDaFare = g;
          break;
        }
      }
    }

    if (giornoDaFare) {
      giornoAttivo.value = giornoDaFare;
      localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giornoDaFare);
    }
  }

  // Fallback se i dati di WORKOUT_T sono mancanti o nulli
  applicaFallbackWorkoutT(tempExercises);
};

// Parser delle stringhe di intestazione del giorno e dei volumi (coordinato con Workouts.vue)
const parseDayHeader = (str) => {
  if (!str) return null;
  const cleanStr = str.trim();
  
  const regex = /(?:WO|WORKOUT)\s+([A-Z\d]+)\s*\[\s*([^/\]]+?)\s*\/\s*([^/\]]+?)\s*\](?:\s*K:\s*(\d+))?/i;
  const match = cleanStr.match(regex);
  if (!match) return null;

  const giorno = match[1].toUpperCase();
  const part1 = match[2].trim();
  const part2 = match[3].trim();
  const calorie = match[4] ? parseInt(match[4], 10) : 0;

  const extractTimeAndDensity = (part) => {
    const matchTD = part.match(/^([^\s%]+(?:\s+[^\s%]+)*?)\s+(\d+)\s*%/i);
    let tempoRaw = '';
    let densita = 0;
    if (matchTD) {
      tempoRaw = matchTD[1].trim();
      densita = parseInt(matchTD[2], 10);
    } else {
      const dMatch = part.match(/(\d+)\s*%/);
      densita = dMatch ? parseInt(dMatch[1], 10) : 0;
      tempoRaw = part.split(/%|\bcardio\b/i)[0].trim();
    }

    const cardioMatch = part.match(/\bcardio\b\s*:?\s*([\d'\-\smin]+)/i);
    let cardioRaw = null;
    let cardioMins = 0;
    if (cardioMatch) {
      cardioRaw = cardioMatch[1].trim();
      const nums = cardioRaw.match(/\d+/g);
      if (nums && nums.length > 0) {
        const parsedNums = nums.map(n => parseInt(n, 10));
        cardioMins = Math.round(parsedNums.reduce((a, b) => a + b, 0) / parsedNums.length);
      }
    }

    return { tempoRaw, densita, cardioRaw, cardioMins };
  };

  const p1 = extractTimeAndDensity(part1);
  const p2 = extractTimeAndDensity(part2);

  const parseTimeToMins = (tStr) => {
    if (!tStr) return 0;
    let clean = tStr.toLowerCase().trim();
    if (clean.includes('h')) {
      const parts = clean.split('h');
      const hours = parseInt(parts[0], 10) || 0;
      const minsStr = parts[1] ? parts[1].replace('min', '').replace('m', '').replace("'", '').trim() : '';
      const mins = parseInt(minsStr, 10) || 0;
      return hours * 60 + mins;
    }
    clean = clean.replace('min', '').replace('m', '').replace("'", '').trim();
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

  const m1 = parseTimeToMins(p1.tempoRaw);
  const m2 = parseTimeToMins(p2.tempoRaw);
  const mediaMins = Math.round((m1 + m2) / 2);
  const tempoMedia = formatMinsToTime(mediaMins);
  const densitaMedia = Math.round((p1.densita + p2.densita) / 2);

  let cardioMinMins = null;
  let cardioMaxMins = null;
  let cardioText = null;

  const validCardioMins = [p1.cardioMins, p2.cardioMins].filter(m => m > 0);
  if (validCardioMins.length > 0) {
    cardioMinMins = Math.min(...validCardioMins);
    cardioMaxMins = Math.max(...validCardioMins);
    if (cardioMinMins === cardioMaxMins) {
      cardioText = `${cardioMinMins}'`;
    } else {
      cardioText = `${cardioMinMins}' - ${cardioMaxMins}'`;
    }
  } else if (p1.cardioRaw || p2.cardioRaw) {
    cardioText = p1.cardioRaw || p2.cardioRaw;
  }

  return {
    giorno,
    tempo1: p1.tempoRaw,
    densita1: p1.densita,
    tempo2: p2.tempoRaw,
    densita2: p2.densita,
    tempoMedia,
    densitaMedia,
    calorie,
    cardio1: p1.cardioRaw,
    cardio2: p2.cardioRaw,
    cardioMinMins,
    cardioMaxMins,
    cardioText
  };
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
  const w = settimanaAttiva.value;
  
  // 1. Controllo globale: ci sono esercizi incompleti o da recuperare tra tutti i giorni per la settimana attiva?
  const tuttiEsercizi = allExercises.value.filter(e => parseInt(e.num_riga_giorno) > 0);
  const haIncompletiGlobale = tuttiEsercizi.some(ex => {
    const val = ex['ins_week' + w];
    return !val || val.trim() === '' || val.trim() === '-' || haRecupero(val);
  });
  if (haIncompletiGlobale) return true;

  // 2. Controllo specifico del giorno attivo
  const g = giornoAttivo.value;
  const exDelGiorno = allExercises.value.filter(
    e => (e.des_giorno || '').trim().toUpperCase() === g.toUpperCase() && parseInt(e.num_riga_giorno) > 0
  );
  return exDelGiorno.some(ex => {
    const val = ex['ins_week' + w];
    return !val || val.trim() === '' || val.trim() === '-' || haRecupero(val);
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
  if (newVal) {
    setGlobalSettimanaDaChiudere(true);
  }
}, { immediate: true });

onMounted(async () => {
  await caricaDatiAtleti();
  await caricaWorkouts();
  await caricaDatiScheda();
});

// Ascolta i cambiamenti di selezione globale
watch([selectedAthlete, selectedSheet], async ([newAthlete, newSheet], [oldAthlete, oldSheet]) => {
  if (newAthlete !== oldAthlete) {
    atletaSelezionato.value = newAthlete;
    await caricaWorkouts();
  }
  if (newSheet !== oldSheet) {
    schedaSelezionata.value = newSheet;
  }
  await caricaDatiScheda();
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
    const header = allExercises.value.find(
      item => (item.des_giorno || '').trim() === g && (parseInt(item.num_riga_giorno) === 0)
    );
    if (header) {
      if (!isTrue(header['cmp' + settimanaAttiva.value])) {
        giornoDaFare = g;
        break;
      }
    }
  }
  
  if (!giornoDaFare) {
    // Se tutti i giorni esistenti sono completati, seleziona il primo giorno esistente
    for (const g of giorni) {
      if (allExercises.value.some(item => (item.des_giorno || '').trim() === g)) {
        giornoDaFare = g;
        break;
      }
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

// Avvia l'allenamento per l'atleta Gabriele Belmonte (ID: '1') sull'ultima scheda programmata
const avviaAllenamentoGabriele = async () => {
  vibraTattile(15);
  
  // 1. Imposta l'atleta a Gabriele Belmonte (ID: '1')
  setSelectedAthlete('1');
  atletaSelezionato.value = '1';
  
  // 2. Carica la lista dei suoi workout per identificare l'ultimo inserito
  await caricaWorkouts();
  
  if (workoutsList.value.length > 0) {
    // Il primo elemento della lista è l'ultimo mesociclo programmato (ordinato decrescente)
    const ultimaScheda = workoutsList.value[0].num_scheda;
    schedaSelezionata.value = ultimaScheda;
    setSelectedSheet(ultimaScheda);
    
    // 3. Carica i dati completi della scheda per impostare settimanaAttiva e giornoAttivo correttamente
    await caricaDatiScheda();
  }
  
  // 4. Avvia l'allenamento navigando alla pagina dei Workouts
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
  background: var(--bg-main) !important; /* solid background matching body */
  padding-top: 16px !important;
  padding-bottom: 8px !important;
  margin-top: -16px !important;
  border-bottom: 1.5px solid var(--card-border) !important;
  margin-bottom: 20px !important;
}

[data-theme="light"] .sticky-dashboard-header {
  background: rgba(255, 255, 255, 0.95) !important;
  border-bottom: 1px solid #e2e8f0 !important;
}

.home-dashboard {
  background-color: transparent;
}

.text-slate-dark {
  color: var(--text-dark) !important;
}

.text-slate {
  color: var(--text-slate) !important;
}

.text-muted {
  color: var(--text-muted) !important;
}

.text-super-caption {
  font-size: 0.65rem !important;
  letter-spacing: 0.08em;
}

.border-top-soft {
  border-top: 1px solid var(--card-border) !important;
}

.border-soft {
  border: 1px solid var(--card-border) !important;
}

.border-right-soft {
  border-right: 1px solid var(--card-border) !important;
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
  background: var(--card-bg-soft) !important;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  border: 1px solid var(--card-border);
}

/* 3. Mesocycle Progress Card */
.mesocycle-progress-card {
  background: var(--card-bg-soft) !important;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--card-border) !important;
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
  background: linear-gradient(90deg, #10b981 0%, var(--theme-primary) 100%) !important;
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
  background: var(--theme-primary-dark) !important;
  border-color: var(--theme-primary) !important;
  box-shadow: 0 0 15px var(--theme-primary-glow) !important;
  transform: scale(1.15);
}

.step-active .step-number {
  color: white;
  font-weight: 900;
}

.step-active .step-label {
  color: var(--theme-primary) !important;
  font-weight: 900;
}

.step-future .step-ring {
  background: var(--card-bg-dark);
  border-color: var(--card-border);
}

/* 4. Journey Day Cards */
.journey-day-card {
  height: 92px;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  border: 1px solid var(--card-border);
  background: var(--card-bg-soft);
}

.journey-day-card:hover {
  transform: translateY(-3px);
  background: var(--card-bg-glass);
  border-color: var(--card-border);
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
  background: linear-gradient(135deg, var(--card-bg-soft) 0%, var(--card-bg-glass) 100%) !important;
  border: 1px solid var(--card-border) !important;
  box-shadow: var(--card-shadow) !important;
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
  background: var(--card-bg-soft) !important;
  border: 1px solid var(--card-border) !important;
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
  background: var(--card-bg-soft) !important;
  backdrop-filter: blur(8px) !important;
  -webkit-backdrop-filter: blur(8px) !important;
  border: 1px solid var(--card-border) !important;
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
  background: var(--card-bg-soft) !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid var(--card-border) !important;
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
  background: var(--card-bg-glass) !important;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid var(--card-border) !important;
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

.scrollable-y {
  overflow-y: auto;
}
.max-height-300 {
  max-height: 200px;
}
.workout-list-container {
  padding-right: 4px;
}
.workout-item-card {
  transition: all 0.2s ease-in-out;
  background: var(--card-bg-soft) !important;
  border-color: var(--card-border) !important;
}
.workout-item-card:hover {
  transform: translateY(-1px);
  background: var(--card-bg-glass) !important;
}
.active-workout-border {
  border: 1.5px solid var(--theme-primary) !important;
  background: var(--theme-primary-bg-soft) !important;
  box-shadow: 0 4px 14px var(--theme-primary-glow) !important;
}
:deep([data-theme="light"]) .active-workout-border,
[data-theme="light"] .active-workout-border {
  border: 1.5px solid #ea580c !important;
  background: #fff7ed !important;
  box-shadow: 0 2px 10px rgba(234, 88, 12, 0.12) !important;
}
.inactive-workout-border {
  border: 1px solid var(--card-border) !important;
}
</style>
