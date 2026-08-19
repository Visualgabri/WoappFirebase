<template>
  <v-container class="px-2.5 py-3 max-width-admin min-height-screen pb-12">
    <!-- Header Premium -->
    <div class="premium-header card-glass rounded-xl d-flex align-center justify-space-between elevation-1 border-bottom-soft pa-3 mb-3">
      <div class="d-flex align-center min-width-0">
        <v-avatar size="34" class="mr-2.5 bg-transparent border-orange elevation-1 profile-avatar flex-shrink-0">
          <v-img src="/logo.png" alt="WoApp Logo"></v-img>
        </v-avatar>
        <div class="text-left min-width-0">
          <h1 class="text-subtitle-2 font-weight-black text-slate-dark tracking-tight leading-tight mb-0 text-truncate" style="font-size: 0.90rem !important;">
            Pannello Controllo Coach
          </h1>
          <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase d-block text-truncate" style="font-size: 0.58rem; letter-spacing: 0.03em;">
            Gestione Database & Excel Editor
          </span>
        </div>
      </div>
      <div class="d-flex align-center gap-1.5 flex-shrink-0 ml-2">
        <v-btn to="/" color="orange-darken-3" variant="tonal" rounded="lg" size="x-small" class="font-weight-bold text-none px-2" style="height: 28px; font-size: 0.70rem;">
          <v-icon size="13" class="mr-1">mdi-arrow-left</v-icon>
          App
        </v-btn>
        <v-btn icon color="orange-darken-3" variant="text" @click="caricaDati" size="x-small" style="width: 28px; height: 28px;" :disabled="loadingData || !atletaSelezionato" title="Sincronizza / Ricarica dati da Firestore">
          <v-icon size="16" :class="{ 'animate-spin': loadingData }">mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- SELETTORE CLIENTE & SCHEDA -->
    <v-card class="premium-card rounded-xl text-left border pa-3 mb-3.5" elevation="1">
      <v-row dense class="align-center">
        <!-- Tipo di Dati da Caricare -->
        <v-col cols="12" sm="12" :md="tipoDatiCaricare === 'storyboard' ? 4 : 5">
          <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-1" style="font-size: 0.60rem;">Tabella Database</span>
          <v-btn-toggle
            v-model="tipoDatiCaricare"
            mandatory
            color="orange-darken-3"
            variant="outlined"
            class="d-flex w-100 flex-wrap"
            style="min-height: 34px; border-radius: 8px;"
            @update:model-value="gestisciCambioTipoDati"
          >
            <v-btn value="storyboard" class="flex-grow-1 font-weight-bold text-caption text-slate-dark px-1" style="height: 34px; font-size: 0.68rem !important;">
              <v-icon start size="13" class="mr-1">mdi-format-list-bulleted</v-icon>
              Storyboard
            </v-btn>
            <v-btn value="workout_t" class="flex-grow-1 font-weight-bold text-caption text-slate-dark px-1" style="height: 34px; font-size: 0.68rem !important;">
              <v-icon start size="13" class="mr-1">mdi-calendar-month</v-icon>
              Workout T
            </v-btn>
            <v-btn value="massimali" class="flex-grow-1 font-weight-bold text-caption text-slate-dark px-1" style="height: 34px; font-size: 0.68rem !important;">
              <v-icon start size="13" class="mr-1">mdi-weight-lifter</v-icon>
              Massimali
            </v-btn>
            <v-btn value="clienti" class="flex-grow-1 font-weight-bold text-caption text-slate-dark px-1" style="height: 34px; font-size: 0.68rem !important;">
              <v-icon start size="13" class="mr-1">mdi-account-details</v-icon>
              Cliente
            </v-btn>
            <v-btn value="infortuni" class="flex-grow-1 font-weight-bold text-caption text-slate-dark px-1" style="height: 34px; font-size: 0.68rem !important;">
              <v-icon start size="13" class="mr-1">mdi-bandage</v-icon>
              Infortuni
            </v-btn>
          </v-btn-toggle>
        </v-col>

        <!-- Atleta -->
        <v-col cols="12" sm="6" :md="tipoDatiCaricare === 'storyboard' ? 3 : 4">
          <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-1" style="font-size: 0.60rem;">Atleta</span>
          <v-autocomplete
            v-model="atletaSelezionato"
            :items="itemsAtleti"
            item-title="title"
            item-value="value"
            placeholder="Seleziona Atleta..."
            variant="outlined"
            density="compact"
            rounded="lg"
            color="orange-darken-3"
            prepend-inner-icon="mdi-account"
            hide-details
            @update:model-value="gestisciCambioAtleta"
          ></v-autocomplete>
        </v-col>

        <!-- Scheda (Mesociclo) - Solo per Storyboard -->
        <v-col v-if="tipoDatiCaricare === 'storyboard'" cols="12" sm="6" md="3">
          <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-1" style="font-size: 0.60rem;">Scheda (Mesociclo)</span>
          <v-select
            v-model="schedaSelezionata"
            :items="listaSchede"
            placeholder="Scegli Scheda..."
            variant="outlined"
            density="compact"
            rounded="lg"
            color="orange-darken-3"
            prepend-inner-icon="mdi-clipboard-text-outline"
            hide-details
            :disabled="!atletaSelezionato || loadingSchede"
            @update:model-value="gestisciCambioScheda"
          ></v-select>
        </v-col>

        <!-- Pulsante Caricamento Dati -->
        <v-col cols="12" sm="6" :md="tipoDatiCaricare === 'storyboard' ? 2 : 3" class="d-flex align-end mt-1.5 mt-sm-0">
          <v-btn
            color="orange-darken-3"
            block
            rounded="lg"
            class="text-white font-weight-bold text-none px-3"
            style="height: 36px; font-size: 0.76rem;"
            :disabled="!atletaSelezionato || loadingData"
            :loading="loadingData"
            @click="caricaDati"
          >
            <v-icon class="mr-1" size="16">mdi-cloud-download</v-icon>
            CARICA DATI
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- SEZIONE PARAMETRI ALGORITMO COACH (Mostrata sempre) -->
    <v-card class="premium-card rounded-xl text-left border pa-3 mb-3.5" elevation="1">
      <div class="d-flex align-center mb-2.5">
        <v-icon color="orange-darken-3" class="mr-2" size="18">mdi-tune-variant</v-icon>
        <div>
          <h3 class="text-subtitle-2 font-weight-black text-slate-dark leading-tight mb-0.5" style="font-size: 0.88rem !important;">
            Configurazione Algoritmo Progressioni
          </h3>
          <span class="text-caption text-slate-dark opacity-80 d-block" style="font-size: 0.70rem; line-height: 1.2;">
            Personalizza le regole di proposta carico e le riduzioni per sforzo/fatica.
          </span>
        </div>
      </div>

      <v-row dense>
        <!-- Colonna sinistra: Parametri Proposta Carico -->
        <v-col cols="12" md="6" class="border-right-md">
          <div class="text-subtitle-2 font-weight-black text-orange-darken-3 mb-2 d-flex align-center" style="font-size: 0.80rem;">
            <v-icon size="15" class="mr-1">mdi-target</v-icon>
            Regole & Settimane di Riferimento
          </div>
          
          <v-row dense>
            <!-- W2 -->
            <v-col cols="4" sm="4">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Rif. W2</span>
              <v-select
                v-model="propostaBaseWeek2"
                :items="['W1', 'W2']"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-select>
            </v-col>
            
            <!-- W5 -->
            <v-col cols="4" sm="4">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Rif. W5</span>
              <v-select
                v-model="propostaBaseWeek5"
                :items="['W3', 'W4', 'W5']"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-select>
            </v-col>

            <!-- W6 -->
            <v-col cols="4" sm="4">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Rif. W6</span>
              <v-select
                v-model="propostaBaseWeek6"
                :items="['W5', 'W6']"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-select>
            </v-col>

            <!-- Regola Progressione W2 & Ottimizzazione Note -->
            <v-col cols="12" sm="6" class="mt-1.5">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Progressione Week 2</span>
              <v-select
                v-model="regolaProgressioneW2"
                :items="[
                  { title: 'Peso (+Step)', value: 'peso' },
                  { title: 'Testo \'Aumenta peso\'', value: 'scritta' }
                ]"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-select>
            </v-col>

            <!-- Dimensione GIF Layout Compatto (Coach) -->
            <v-col cols="12" class="mt-1.5">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider" style="font-size: 0.65rem;">
                  Dimensione GIF Compatta (Coach)
                </span>
                <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white" style="height: 18px; font-size: 0.65rem;">
                  {{ DIMENSIONE_GIF_COMPATTA }} px
                </v-chip>
              </div>
              <v-slider
                v-model="DIMENSIONE_GIF_COMPATTA"
                :min="54"
                :max="90"
                :step="2"
                color="orange-darken-3"
                track-color="rgba(255,255,255,0.12)"
                density="compact"
                hide-details
                thumb-size="14"
              ></v-slider>
            </v-col>

            <!-- Editor Note Espanso & Smart Note Cleanup (Coach) -->
            <v-col cols="12" sm="6" class="d-flex align-center mt-2">
              <v-switch
                v-model="editorNoteEspanso"
                color="orange-darken-3"
                hide-details
                density="compact"
                class="mr-2 flex-shrink-0"
              ></v-switch>
              <div class="text-left">
                <span class="text-caption font-weight-bold text-slate-dark d-block" style="font-size: 0.70rem; line-height: 1.1;">Editor Note Espanso (Modal)</span>
                <span class="text-super-caption text-slate-dark opacity-75 d-block" style="font-size: 0.56rem; text-transform: none; line-height: 1.2;">Pannello dedicato dal basso con chip rapidi</span>
              </div>
            </v-col>

            <v-col cols="12" sm="6" class="d-flex align-center mt-2">
              <v-switch
                v-model="smartNoteCleanup"
                color="orange-darken-3"
                hide-details
                density="compact"
                class="mr-2 flex-shrink-0"
              ></v-switch>
              <div class="text-left">
                <span class="text-caption font-weight-bold text-slate-dark d-block" style="font-size: 0.70rem; line-height: 1.1;">Smart Note Cleanup</span>
                <span class="text-super-caption text-slate-dark opacity-75 d-block" style="font-size: 0.56rem; text-transform: none; line-height: 1.2;">Pulisce e uniforma carichi e reps al salvataggio</span>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-2.5 border-soft"></v-divider>

          <div class="text-subtitle-2 font-weight-black text-orange-darken-3 mb-2 d-flex align-center" style="font-size: 0.80rem;">
            <v-icon size="15" class="mr-1">mdi-arrow-expand-vertical</v-icon>
            Margini & Spaziature Dettaglio Esercizio (Coach)
          </div>
          
          <v-row dense>
            <!-- Spazio Sopra Ins -->
            <v-col cols="12" sm="6" class="mb-2">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider" style="font-size: 0.65rem;">
                  Spazio Sopra Ins (Coach)
                </span>
                <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white" style="height: 18px; font-size: 0.65rem;">
                  {{ margineTopInputWeek }} px
                </v-chip>
              </div>
              <v-slider
                v-model="margineTopInputWeek"
                :min="0"
                :max="40"
                :step="1"
                color="orange-darken-3"
                track-color="rgba(255,255,255,0.12)"
                density="compact"
                hide-details
                thumb-size="14"
              ></v-slider>
            </v-col>

            <!-- Spazio Sotto Ins -->
            <v-col cols="12" sm="6" class="mb-2">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider" style="font-size: 0.65rem;">
                  Spazio Sotto Ins (Coach)
                </span>
                <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white" style="height: 18px; font-size: 0.65rem;">
                  {{ margineBottomInputWeek }} px
                </v-chip>
              </div>
              <v-slider
                v-model="margineBottomInputWeek"
                :min="0"
                :max="40"
                :step="1"
                color="orange-darken-3"
                track-color="rgba(255,255,255,0.12)"
                density="compact"
                hide-details
                thumb-size="14"
              ></v-slider>
            </v-col>

            <!-- Spazio Feedback W6 -->
            <v-col cols="12" sm="6" class="mb-2">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider" style="font-size: 0.65rem;">
                  Spazio Feedback W6 (Coach)
                </span>
                <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white" style="height: 18px; font-size: 0.65rem;">
                  {{ margineTopW6Feedback }} px
                </v-chip>
              </div>
              <v-slider
                v-model="margineTopW6Feedback"
                :min="0"
                :max="40"
                :step="1"
                color="orange-darken-3"
                track-color="rgba(255,255,255,0.12)"
                density="compact"
                hide-details
                thumb-size="14"
              ></v-slider>
            </v-col>

            <!-- Spazio Avviso Ghost -->
            <v-col cols="12" sm="6" class="mb-2">
              <div class="d-flex align-center justify-space-between mb-1">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider" style="font-size: 0.65rem;">
                  Spazio Avviso Ghost (Coach)
                </span>
                <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white" style="height: 18px; font-size: 0.65rem;">
                  {{ margineBottomGhostNotice }} px
                </v-chip>
              </div>
              <v-slider
                v-model="margineBottomGhostNotice"
                :min="0"
                :max="40"
                :step="1"
                color="orange-darken-3"
                track-color="rgba(255,255,255,0.12)"
                density="compact"
                hide-details
                thumb-size="14"
              ></v-slider>
            </v-col>
          </v-row>

          <v-divider class="my-2.5 border-soft"></v-divider>

          <div class="text-subtitle-2 font-weight-black text-orange-darken-3 mb-2 d-flex align-center" style="font-size: 0.80rem;">
            <v-icon size="15" class="mr-1">mdi-scale-balance</v-icon>
            Incrementi Post-Scarico & Manubri
          </div>
          
          <v-row dense>
            <!-- Inc. Post Scarico -->
            <v-col cols="6" sm="6">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Post Scarico %</span>
              <v-text-field
                v-model.number="INCREMENTO_PESO_POST_SCARICO_PCT"
                type="number"
                step="0.5"
                min="0"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>

            <!-- Soglia Manubri Forte -->
            <v-col cols="6" sm="6">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Soglia Manubri Forte</span>
              <v-text-field
                v-model.number="SOGLIA_FORZA_MANUBRI"
                type="number"
                step="1"
                min="0"
                suffix="KG"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>

            <!-- Inc. Manubri Leggero -->
            <v-col cols="6" sm="6" class="mt-1.5">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Inc. Manubri Leggero</span>
              <v-text-field
                v-model.number="INCREMENTO_MANUBRI_LEGGERO"
                type="number"
                step="0.5"
                min="0"
                suffix="KG"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>

            <!-- Inc. Manubri Forte -->
            <v-col cols="6" sm="6" class="mt-1.5">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Inc. Manubri Forte</span>
              <v-text-field
                v-model.number="INCREMENTO_MANUBRI_FORTE"
                type="number"
                step="0.5"
                min="0"
                suffix="KG"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
        </v-col>

        <!-- Colonna destra: Regolazione Sforzo/Fatica -->
        <v-col cols="12" md="6" class="mt-2 mt-md-0">
          <div class="text-subtitle-2 font-weight-black text-orange-darken-3 mb-2 d-flex align-center" style="font-size: 0.80rem;">
            <v-icon size="15" class="mr-1">mdi-trending-down</v-icon>
            Riduzioni Fatica Muscolare Week 1 (W1)
          </div>
          
          <v-row dense>
            <!-- Pesante W1 -->
            <v-col cols="6" sm="6">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Fatica Pesante W1 %</span>
              <v-text-field
                v-model.number="FATICA_PESANTE_W1_PCT"
                type="number"
                step="0.5"
                min="0"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>

            <!-- Devastante W1 -->
            <v-col cols="6" sm="6">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Fatica Devastante W1 %</span>
              <v-text-field
                v-model.number="FATICA_DEVASTANTE_W1_PCT"
                type="number"
                step="0.5"
                min="0"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-2.5 border-soft"></v-divider>

          <div class="text-subtitle-2 font-weight-black text-orange-darken-3 mb-2 d-flex align-center" style="font-size: 0.80rem;">
            <v-icon size="15" class="mr-1">mdi-history</v-icon>
            Riduzioni Fatica da Storico (Deallenamento)
          </div>

          <v-row dense>
            <!-- Pesante Storico -->
            <v-col cols="6" sm="6">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Fatica Pesante Storico %</span>
              <v-text-field
                v-model.number="FATICA_PESANTE_STORICO_PCT"
                type="number"
                step="0.5"
                min="0"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>

            <!-- Devastante Storico -->
            <v-col cols="6" sm="6">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Fatica Devastante Storico %</span>
              <v-text-field
                v-model.number="FATICA_DEVASTANTE_STORICO_PCT"
                type="number"
                step="0.5"
                min="0"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-2.5 border-soft"></v-divider>

          <div class="text-subtitle-2 font-weight-black text-orange-darken-3 mb-2 d-flex align-center" style="font-size: 0.80rem;">
            <v-icon size="15" class="mr-1">mdi-clock-alert-outline</v-icon>
            Deallenamento & Sbalzi di Reps
          </div>

          <v-row dense>
            <!-- Soglia 1 -->
            <v-col cols="6" sm="3">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Soglia 1 (gg)</span>
              <v-text-field
                v-model.number="DEALLENAMENTO_SOGLIA1"
                type="number"
                step="1"
                min="0"
                suffix="gg"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
            <!-- Pct 1 -->
            <v-col cols="6" sm="3">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Riduzione 1 (%)</span>
              <v-text-field
                v-model.number="DEALLENAMENTO_PCT1"
                type="number"
                step="0.5"
                min="0"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>

            <!-- Soglia 2 -->
            <v-col cols="6" sm="3">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Soglia 2 (gg)</span>
              <v-text-field
                v-model.number="DEALLENAMENTO_SOGLIA2"
                type="number"
                step="1"
                min="0"
                suffix="gg"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
            <!-- Pct 2 -->
            <v-col cols="6" sm="3">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Riduzione 2 (%)</span>
              <v-text-field
                v-model.number="DEALLENAMENTO_PCT2"
                type="number"
                step="0.5"
                min="0"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>

            <!-- Soglia 3 -->
            <v-col cols="6" sm="3" class="mt-1.5">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Soglia 3 (gg)</span>
              <v-text-field
                v-model.number="DEALLENAMENTO_SOGLIA3"
                type="number"
                step="1"
                min="0"
                suffix="gg"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
            <!-- Pct 3 -->
            <v-col cols="6" sm="3" class="mt-1.5">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Riduzione 3 (%)</span>
              <v-text-field
                v-model.number="DEALLENAMENTO_PCT3"
                type="number"
                step="0.5"
                min="0"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>

            <!-- Soglia 4 -->
            <v-col cols="6" sm="3" class="mt-1.5">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Soglia 4 (gg)</span>
              <v-text-field
                v-model.number="DEALLENAMENTO_SOGLIA4"
                type="number"
                step="1"
                min="0"
                suffix="gg"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
            <!-- Pct 4 -->
            <v-col cols="6" sm="3" class="mt-1.5">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Riduzione 4 (%)</span>
              <v-text-field
                v-model.number="DEALLENAMENTO_PCT4"
                type="number"
                step="0.5"
                min="0"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
            <!-- Riduzione Max Instabili -->
            <v-col cols="6" sm="3" class="mt-1.5">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Riduzione Instabili %</span>
              <v-text-field
                v-model.number="PENALITA_MAX_INSTABILI_PCT"
                type="number"
                step="1"
                min="0"
                max="100"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
            <!-- Riduzione Max Stabili -->
            <v-col cols="6" sm="3" class="mt-1.5">
              <span class="text-super-caption text-slate-dark font-weight-black uppercase tracking-wider d-block mb-0.5" style="font-size: 0.58rem;">Riduzione Stabili %</span>
              <v-text-field
                v-model.number="PENALITA_MAX_STABILI_PCT"
                type="number"
                step="1"
                min="0"
                max="100"
                suffix="%"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
              ></v-text-field>
            </v-col>
          </v-row>
        </v-col>
      </v-row>
    </v-card>

    <!-- TABELLA EDITABILE SPREADSHEET -->
    <v-card
      v-if="atletaSelezionato"
      class="premium-card rounded-2xl border pa-4 mb-16 text-left"
      elevation="2"
      style="overflow: visible;"
    >
      <!-- Titolo Sezione & Informazioni Utili -->
      <div class="d-flex flex-wrap align-center justify-space-between mb-2 border-bottom-soft pb-3">
        <div>
          <h3 class="text-h6 font-weight-black text-slate-dark">Gestione Database Atleta</h3>
          <span class="text-caption text-slate-dark font-weight-bold d-block mt-0.5" style="font-size: 0.75rem;">
            Client ID: <strong>{{ atletaSelezionato }}</strong>
          </span>
        </div>
        <div class="d-flex align-center gap-1.5 mt-2 mt-sm-0">
          <v-btn color="orange-darken-3" size="x-small" variant="tonal" rounded="lg" @click="mostraIstruzioni = true" class="mr-1 font-weight-bold text-none px-2" style="height: 28px; font-size: 0.70rem;">
            <v-icon size="14" class="mr-1">mdi-help-circle-outline</v-icon>
            Scorciatoie Excel
          </v-btn>
          <v-btn v-if="activeTab === 'storyboard' && schedaSelezionata" color="blue-darken-3" size="x-small" variant="flat" rounded="lg" @click="esportaCSVLocale" class="text-white font-weight-bold text-none px-2" style="height: 28px; font-size: 0.70rem;">
            <v-icon size="14" class="mr-1">mdi-download</v-icon>
            Download CSV
          </v-btn>
        </div>
      </div>

      <!-- TABS PER SWITCHARE TRA TUTTE LE TABELLE DATABASE -->
      <v-tabs v-model="activeTab" color="orange-darken-3" density="compact" class="mb-3 border-bottom-soft flex-wrap">
        <v-tab value="storyboard" class="font-weight-black text-none px-2" style="font-size: 0.75rem;">
          <v-icon start size="15" class="mr-1">mdi-format-list-bulleted</v-icon>
          Storyboard
          <v-chip size="x-small" class="ml-1.5 font-weight-bold" color="orange-darken-3" variant="flat" style="height: 16px; font-size: 0.58rem;" v-if="tabCaricate.storyboard && records.length > 0">
            {{ records.length }}
          </v-chip>
        </v-tab>
        <v-tab value="workout_t" class="font-weight-black text-none px-2" style="font-size: 0.75rem;">
          <v-icon start size="15" class="mr-1">mdi-calendar-month</v-icon>
          Workout T
          <v-chip size="x-small" class="ml-1.5 font-weight-bold" color="blue-darken-3" variant="flat" style="height: 16px; font-size: 0.58rem;" v-if="tabCaricate.workout_t && workoutTRecords.length > 0">
            {{ workoutTRecords.length }}
          </v-chip>
        </v-tab>
        <v-tab value="massimali" class="font-weight-black text-none px-2" style="font-size: 0.75rem;">
          <v-icon start size="15" class="mr-1">mdi-weight-lifter</v-icon>
          Massimali (WOAPP_MASSIMALI_R)
          <v-chip size="x-small" class="ml-1.5 font-weight-bold" color="green-darken-3" variant="flat" style="height: 16px; font-size: 0.58rem;" v-if="tabCaricate.massimali && massimaliRecords.length > 0">
            {{ massimaliRecords.length }}
          </v-chip>
        </v-tab>
        <v-tab value="clienti" class="font-weight-black text-none px-2" style="font-size: 0.75rem;">
          <v-icon start size="15" class="mr-1">mdi-account-details</v-icon>
          Anagrafica Cliente
          <v-chip size="x-small" class="ml-1.5 font-weight-bold" color="purple-darken-3" variant="flat" style="height: 16px; font-size: 0.58rem;" v-if="tabCaricate.clienti && clienteRecord">
            1
          </v-chip>
        </v-tab>
        <v-tab value="infortuni" class="font-weight-black text-none px-2" style="font-size: 0.75rem;">
          <v-icon start size="15" class="mr-1">mdi-bandage</v-icon>
          Infortuni
          <v-chip size="x-small" class="ml-1.5 font-weight-bold" color="red-darken-3" variant="flat" style="height: 16px; font-size: 0.58rem;" v-if="tabCaricate.infortuni && infortuniRecords.length > 0">
            {{ infortuniRecords.length }}
          </v-chip>
        </v-tab>
      </v-tabs>

      <!-- TAB 1: STORYBOARD -->
      <div v-show="activeTab === 'storyboard'">
        <!-- Dati non ancora caricati da Firestore -->
        <div v-if="!tabCaricate.storyboard && !loadingData" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="orange-darken-3" size="48" class="mb-2">mdi-cloud-download-outline</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Storyboard non caricato da Firestore</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">
            Seleziona l'atleta e premi <strong class="text-orange-lighten-2">CARICA DATI</strong> in alto per scaricare lo Storyboard.
          </p>
        </div>

        <!-- Nessuna scheda selezionata -->
        <div v-else-if="!schedaSelezionata" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="orange-darken-3" size="48" class="mb-2">mdi-clipboard-text-outline</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Nessuna scheda selezionata</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">
            Seleziona una scheda (Mesociclo) dal menu in alto per visualizzare e modificare gli esercizi dello Storyboard.
          </p>
        </div>

        <div v-else>
          <!-- Spinner Caricamento -->
          <div v-if="loadingData" class="text-center my-12 py-12">
            <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
            <p class="mt-4 text-slate text-body-2">Lettura e sincronizzazione con Firestore...</p>
          </div>

          <!-- Nessun dato trovato -->
          <div v-else-if="records.length === 0" class="text-center py-12 border-dashed rounded-xl my-4">
            <v-icon color="grey" size="48" class="mb-2">mdi-database-alert-outline</v-icon>
            <h4 class="text-slate font-weight-bold text-body-1">Nessun record in Firestore</h4>
            <p class="text-caption text-muted px-4 leading-tight mt-1">Non ci sono esercizi salvati per questa scheda. Clicca su "+ Aggiungi Riga" per crearne di nuovi.</p>
          </div>

          <!-- Tabella Excel (Desktop + Mobile) -->
          <div v-else class="table-container" @paste="handlePaste">
            <table class="excel-table">
              <thead>
                <tr>
                  <th class="sticky-col col-actions">Azioni</th>
                  <th class="sticky-col col-giorno">Giorno</th>
                  <th class="sticky-col col-riga">Riga</th>
                  <th class="sticky-col col-esercizio">Esercizio</th>
                  <th class="col-settore">Settore</th>
                  <th class="col-settore-princ">Settore Princ</th>
                  <th class="col-superserie">SS</th>
                  <th class="col-qta">Q.tà</th>
                  <th class="col-rec">Rec.</th>
                  <th class="col-note">Note Esercizio</th>
                  <th class="col-week">W1</th>
                  <th class="col-week">W2</th>
                  <th class="col-week">W3</th>
                  <th class="col-week">W4</th>
                  <th class="col-week">W5</th>
                  <th class="col-week">W6</th>
                  <th class="col-ins6">Ins 6</th>
                  <th class="col-fatica">Fatica W6</th>
                  <th class="col-peso-bil">Peso Bil.</th>
                  <th class="col-commenti">Commenti</th>
                  <th class="col-note-attr">Note Attrezzo</th>
                  <th class="col-note-gen-attr">Note Gen. Attrezzo</th>
                  <th class="col-url">Url Video/GIF</th>
                  <th class="col-video">Video Req.</th>
                  <th class="col-elimina">No Elimina</th>
                  <th class="col-id">Riga ID</th>
                  <th class="col-timestamp-ute">Aggiornato Utente</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(row, rowIndex) in sortedRecords"
                  :key="row.localId"
                  :class="{
                    'row-dirty': row.isDirty,
                    'row-new': row.isNew,
                    'row-deleted': row.isDeleted
                  }"
                >
                  <!-- Azioni -->
                  <td class="sticky-col col-actions align-center justify-center">
                    <div class="d-flex align-center justify-center gap-1">
                      <!-- Modifica Dettagli 85 campi -->
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        color="orange-lighten-2"
                        title="Modifica tutti gli 85 campi"
                        @click="apriDettaglio(row)"
                      >
                        <v-icon size="14">mdi-pencil</v-icon>
                      </v-btn>
                      <!-- Duplica -->
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        color="blue-lighten-2"
                        title="Duplica record"
                        @click="duplicaRiga(rowIndex)"
                      >
                        <v-icon size="14">mdi-content-copy</v-icon>
                      </v-btn>
                      <!-- Elimina/Ripristina -->
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        :color="row.isDeleted ? 'green-lighten-2' : 'red-lighten-2'"
                        :title="row.isDeleted ? 'Annulla eliminazione' : 'Segna per eliminazione'"
                        @click="toggleEliminaRiga(rowIndex)"
                      >
                        <v-icon size="14">{{ row.isDeleted ? 'mdi-restore' : 'mdi-delete' }}</v-icon>
                      </v-btn>
                    </div>
                  </td>
                  <!-- Giorno -->
                  <td class="sticky-col col-giorno">
                    <input
                      v-model="row.des_giorno"
                      type="text"
                      class="excel-input text-center text-uppercase"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_giorno')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_giorno')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Riga -->
                  <td class="sticky-col col-riga">
                    <input
                      v-model="row.num_riga_giorno"
                      type="number"
                      class="excel-input text-center"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'num_riga_giorno')"
                      :ref="el => registerInputRef(el, rowIndex, 'num_riga_giorno')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Esercizio -->
                  <td class="sticky-col col-esercizio">
                    <input
                      v-model="row.des_esercizio"
                      type="text"
                      class="excel-input select-text"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_esercizio')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_esercizio')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Settore -->
                  <td class="col-settore">
                    <input
                      v-model="row.des_settore"
                      type="text"
                      class="excel-input"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_settore')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_settore')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Settore Princ -->
                  <td class="col-settore-princ">
                    <input
                      v-model="row.des_settore_princ"
                      type="text"
                      class="excel-input"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_settore_princ')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_settore_princ')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Superserie -->
                  <td class="col-superserie">
                    <input
                      v-model="row.alf_superserie"
                      type="text"
                      class="excel-input text-center text-uppercase"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'alf_superserie')"
                      :ref="el => registerInputRef(el, rowIndex, 'alf_superserie')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Qta -->
                  <td class="col-qta">
                    <input
                      v-model="row.des_qta_report"
                      type="text"
                      class="excel-input text-center"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_qta_report')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_qta_report')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Rec -->
                  <td class="col-rec">
                    <input
                      v-model="row.des_rec_report"
                      type="text"
                      class="excel-input text-center"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_rec_report')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_rec_report')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Note Esercizio -->
                  <td class="col-note">
                    <input
                      v-model="row.des_note"
                      type="text"
                      class="excel-input"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_note')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_note')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Weeks (1 to 6) -->
                  <td v-for="w in 6" :key="'w' + w" class="col-week">
                    <input
                      v-model="row['ins_week' + w]"
                      type="text"
                      class="excel-input text-center"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'ins_week' + w)"
                      :ref="el => registerInputRef(el, rowIndex, 'ins_week' + w)"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Ins 6 -->
                  <td class="col-ins6">
                    <input
                      v-model="row.num_ins6"
                      type="text"
                      class="excel-input text-center"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'num_ins6')"
                      :ref="el => registerInputRef(el, rowIndex, 'num_ins6')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Fatica W6 -->
                  <td class="col-fatica">
                    <input
                      v-model="row.num_faticaw6"
                      type="text"
                      class="excel-input text-center"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'num_faticaw6')"
                      :ref="el => registerInputRef(el, rowIndex, 'num_faticaw6')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Peso Bilanciere -->
                  <td class="col-peso-bil">
                    <input
                      v-model="row.num_peso_bilanciere"
                      type="text"
                      class="excel-input text-center"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'num_peso_bilanciere')"
                      :ref="el => registerInputRef(el, rowIndex, 'num_peso_bilanciere')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Commenti -->
                  <td class="col-commenti">
                    <input
                      v-model="row.des_commenti"
                      type="text"
                      class="excel-input"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_commenti')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_commenti')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Note Attrezzo -->
                  <td class="col-note-attr">
                    <input
                      v-model="row.des_note_attrezzo"
                      type="text"
                      class="excel-input"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_note_attrezzo')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_note_attrezzo')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Note Gen Attrezzo -->
                  <td class="col-note-gen-attr">
                    <input
                      v-model="row.des_note_gen_attr"
                      type="text"
                      class="excel-input"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'des_note_gen_attr')"
                      :ref="el => registerInputRef(el, rowIndex, 'des_note_gen_attr')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Url Video -->
                  <td class="col-url">
                    <input
                      v-model="row.UrlNormal"
                      type="text"
                      class="excel-input text-caption font-italic text-slate"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'UrlNormal')"
                      :ref="el => registerInputRef(el, rowIndex, 'UrlNormal')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Video Req. -->
                  <td class="col-video text-center">
                    <v-checkbox-btn
                      v-model="row.flg_video"
                      color="orange-darken-3"
                      @update:model-value="segnaModificato(row)"
                      :disabled="row.isDeleted"
                      class="d-inline-flex"
                    ></v-checkbox-btn>
                  </td>
                  <!-- No Elimina -->
                  <td class="col-elimina text-center">
                    <v-checkbox-btn
                      v-model="row.no_elimina"
                      color="orange-darken-3"
                      @update:model-value="segnaModificato(row)"
                      :disabled="row.isDeleted"
                      class="d-inline-flex"
                    ></v-checkbox-btn>
                  </td>
                  <!-- Riga ID -->
                  <td class="col-id">
                    <input
                      v-model="row.num_riga"
                      type="text"
                      class="excel-input text-center font-weight-bold text-orange-lighten-2"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'num_riga')"
                      :ref="el => registerInputRef(el, rowIndex, 'num_riga')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                  <!-- Timestamp Ute -->
                  <td class="col-timestamp-ute">
                    <input
                      v-model="row.timestamp_ute"
                      type="text"
                      class="excel-input text-center text-muted"
                      @input="segnaModificato(row)"
                      @keydown="handleKeydown($event, rowIndex, 'timestamp_ute')"
                      :ref="el => registerInputRef(el, rowIndex, 'timestamp_ute')"
                      :disabled="row.isDeleted"
                    />
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Pulsanti di azione rapidi sotto-tabella Storyboard -->
          <div class="d-flex flex-wrap justify-space-between align-center mt-4 pt-3 border-top-soft">
            <v-btn color="orange-darken-3" variant="text" rounded="lg" @click="aggiungiRiga" :disabled="loadingData">
              <v-icon class="mr-1">mdi-plus</v-icon>
              AGGIUNGI RIGA
            </v-btn>
            <span class="text-caption text-muted font-italic">
              * Fai doppio clic su una riga o clicca sulla matita per modificare i campi secondari dell'esercizio.
            </span>
          </div>
        </div>
      </div>

      <!-- TAB 2: WORKOUT_T -->
      <div v-show="activeTab === 'workout_t'">
        <!-- Spinner Caricamento -->
        <div v-if="loadingWorkoutT" class="text-center my-12 py-12">
          <v-progress-circular indeterminate color="blue" size="48"></v-progress-circular>
          <p class="mt-4 text-slate text-body-2">Caricamento record WORKOUT_T...</p>
        </div>

        <!-- Dati non ancora caricati -->
        <div v-else-if="!tabCaricate.workout_t" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="blue-lighten-2" size="48" class="mb-2">mdi-cloud-download-outline</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Workout T non caricato da Firestore</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">
            Seleziona l'atleta e premi <strong class="text-orange-lighten-2">CARICA DATI</strong> in alto per scaricare i mesocicli da Firestore.
          </p>
        </div>

        <!-- Nessun dato trovato -->
        <div v-else-if="workoutTRecords.length === 0" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="grey" size="48" class="mb-2">mdi-database-alert-outline</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Nessun record WORKOUT_T trovato</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">Non ci sono mesocicli configurati per questo atleta. Clicca su "+ Aggiungi Mesociclo" per crearne uno nuovo.</p>
        </div>

        <!-- Tabella Excel WORKOUT_T -->
        <div v-else class="table-container">
          <table class="excel-table">
            <thead>
              <tr>
                <th class="sticky-col col-actions">Azioni</th>
                <th class="col-wt-scheda">Scheda #</th>
                <th class="col-wt-date">Data Inizio</th>
                <th class="col-wt-date">Scadenza</th>
                <th class="col-wt-number">Peso Atleta</th>
                <th class="col-wt-desc">Descrizione</th>
                <th class="col-wt-note">Note Mesociclo</th>
                <th class="col-wt-flag">Ramp Test</th>
                <th class="col-wt-flag">Da Finire</th>
                <th class="col-wt-number">Passi GG</th>
                <th class="col-wt-code">Tipo Avanz.</th>
                <th class="col-wt-number">% Compl.</th>
                <th class="col-wt-id">ID Scheda</th>
                <th class="col-wt-flag">Proposta Man.</th>
                <th class="col-wt-giorno">Giorno Att.</th>
                <th class="col-wt-number">Week Att.</th>
                <th class="col-wt-url">URL Mail</th>
                <th class="col-wt-nome">Nome Cognome</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in sortedWorkoutTRecords"
                :key="row.localId"
                :class="{
                  'row-dirty': row.isDirty,
                  'row-new': row.isNew,
                  'row-deleted': row.isDeleted
                }"
              >
                <!-- Azioni -->
                <td class="sticky-col col-actions align-center justify-center">
                  <div class="d-flex align-center justify-center gap-1">
                    <!-- Duplica -->
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="blue-lighten-2"
                      title="Duplica record"
                      @click="duplicaWorkoutT(rowIndex)"
                    >
                      <v-icon size="14">mdi-content-copy</v-icon>
                    </v-btn>
                    <!-- Elimina/Ripristina -->
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      :color="row.isDeleted ? 'green-lighten-2' : 'red-lighten-2'"
                      :title="row.isDeleted ? 'Annulla eliminazione' : 'Segna per eliminazione'"
                      @click="toggleEliminaWorkoutT(rowIndex)"
                    >
                      <v-icon size="14">{{ row.isDeleted ? 'mdi-restore' : 'mdi-delete' }}</v-icon>
                    </v-btn>
                  </div>
                </td>
                
                <!-- Scheda # -->
                <td class="col-wt-scheda">
                  <input
                    v-model="row.num_scheda"
                    type="text"
                    class="excel-input text-center font-weight-bold"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Data Inizio -->
                <td class="col-wt-date">
                  <input
                    v-model="row.dat_data"
                    type="text"
                    class="excel-input text-center"
                    placeholder="DD/MM/YYYY"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Scadenza -->
                <td class="col-wt-date">
                  <input
                    v-model="row.dat_scadenza"
                    type="text"
                    class="excel-input text-center"
                    placeholder="DD/MM/YYYY"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Peso Atleta (num_peso_WT) -->
                <td class="col-wt-number">
                  <input
                    v-model="row.num_peso_WT"
                    type="text"
                    class="excel-input text-center font-weight-bold text-orange-lighten-2"
                    placeholder="Kg"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Descrizione -->
                <td class="col-wt-desc">
                  <input
                    v-model="row.des_descrizione"
                    type="text"
                    class="excel-input"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Note Mesociclo -->
                <td class="col-wt-note">
                  <input
                    v-model="row.des_note"
                    type="text"
                    class="excel-input"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Ramp Test -->
                <td class="col-wt-flag text-center">
                  <v-checkbox-btn
                    v-model="row.flg_ramp_test"
                    true-value="true"
                    false-value="false"
                    color="orange-darken-3"
                    @update:model-value="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                    class="d-inline-flex"
                  ></v-checkbox-btn>
                </td>

                <!-- Da Finire -->
                <td class="col-wt-flag text-center">
                  <v-checkbox-btn
                    v-model="row.flg_da_finire"
                    true-value="true"
                    false-value="false"
                    color="orange-darken-3"
                    @update:model-value="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                    class="d-inline-flex"
                  ></v-checkbox-btn>
                </td>

                <!-- Passi GG -->
                <td class="col-wt-number">
                  <input
                    v-model.number="row.num_passi_gg"
                    type="number"
                    class="excel-input text-center"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Tipo Avanzamento -->
                <td class="col-wt-code">
                  <input
                    v-model="row.cod_tipo_avanz_scheda"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- % Compl -->
                <td class="col-wt-number">
                  <input
                    v-model.number="row.num_perc_compl"
                    type="number"
                    class="excel-input text-center"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- ID Scheda -->
                <td class="col-wt-id">
                  <input
                    v-model="row.ID_scheda"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Proposta Manuale -->
                <td class="col-wt-flag text-center">
                  <v-checkbox-btn
                    v-model="row.PropostaWoManuale"
                    true-value="TRUE"
                    false-value="FALSE"
                    color="orange-darken-3"
                    @update:model-value="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                    class="d-inline-flex"
                  ></v-checkbox-btn>
                </td>

                <!-- Giorno Attivo -->
                <td class="col-wt-giorno">
                  <input
                    v-model="row.SceltaGiorno"
                    type="text"
                    class="excel-input text-center text-uppercase"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Week Attiva -->
                <td class="col-wt-number">
                  <input
                    v-model.number="row.SceltaWeek"
                    type="number"
                    class="excel-input text-center"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- URL Mail -->
                <td class="col-wt-url">
                  <input
                    v-model="row.URLTestiMail"
                    type="text"
                    class="excel-input"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Nome Cognome -->
                <td class="col-wt-nome">
                  <input
                    v-model="row.NomeCognomeTM"
                    type="text"
                    class="excel-input"
                    @input="segnaModificatoWT(row)"
                    :disabled="row.isDeleted"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pulsanti di azione rapidi sotto-tabella WORKOUT_T -->
        <div class="d-flex flex-wrap justify-space-between align-center mt-4 pt-3 border-top-soft">
          <v-btn color="orange-darken-3" variant="text" rounded="lg" @click="aggiungiWorkoutT" :disabled="loadingWorkoutT">
            <v-icon class="mr-1">mdi-plus</v-icon>
            AGGIUNGI MESOCICLO
          </v-btn>
          <span class="text-caption text-muted font-italic">
            * I record di WORKOUT_T definiscono le impostazioni generali, peso atleta, data di inizio e scadenza di ciascun mesociclo.
          </span>
        </div>
      </div>

      <!-- TAB 3: WOAPP_MASSIMALI_R -->
      <div v-show="activeTab === 'massimali'">
        <!-- Spinner Caricamento -->
        <div v-if="loadingMassimali" class="text-center my-12 py-12">
          <v-progress-circular indeterminate color="green" size="48"></v-progress-circular>
          <p class="mt-4 text-slate text-body-2">Caricamento massimali WOAPP_MASSIMALI_R...</p>
        </div>

        <!-- Dati non ancora caricati -->
        <div v-else-if="!tabCaricate.massimali" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="green-lighten-2" size="48" class="mb-2">mdi-cloud-download-outline</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Massimali non caricati da Firestore</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">
            Seleziona l'atleta e premi <strong class="text-orange-lighten-2">CARICA DATI</strong> in alto per scaricare i massimali da Firestore.
          </p>
        </div>

        <!-- Nessun dato trovato -->
        <div v-else-if="massimaliRecords.length === 0" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="grey" size="48" class="mb-2">mdi-database-alert-outline</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Nessun massimale trovato</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">Non ci sono massimali registrati per questo atleta. Clicca su "+ Aggiungi Massimale" per crearne uno.</p>
        </div>

        <!-- Tabella Excel WOAPP_MASSIMALI_R -->
        <div v-else class="table-container">
          <table class="excel-table">
            <thead>
              <tr>
                <th class="sticky-col col-actions">Azioni</th>
                <th class="col-mas-data">Data</th>
                <th class="col-mas-ex">Esercizio</th>
                <th class="col-mas-id">ID Es.</th>
                <th class="col-mas-kg">Kg Massimale</th>
                <th class="col-mas-flag">RM Teorico</th>
                <th class="col-mas-note">Note / Formula</th>
                <th class="col-mas-num">Rapp. BW</th>
                <th class="col-mas-num">Rapp. MM</th>
                <th class="col-mas-num">Peso Atleta</th>
                <th class="col-mas-num">% BF</th>
                <th class="col-mas-data">Data Peso</th>
                <th class="col-mas-num">Livello</th>
                <th class="col-mas-num">Target Kg</th>
                <th class="col-mas-num">Target Liv.</th>
                <th class="col-mas-num">Kg Mancanti</th>
                <th class="col-mas-num">% Mancanti</th>
                <th class="col-mas-flag">Escludi</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in sortedMassimaliRecords"
                :key="row.localId"
                :class="{
                  'row-dirty': row.isDirty,
                  'row-new': row.isNew,
                  'row-deleted': row.isDeleted
                }"
              >
                <!-- Azioni -->
                <td class="sticky-col col-actions align-center justify-center">
                  <div class="d-flex align-center justify-center gap-1">
                    <!-- Duplica -->
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      color="blue-lighten-2"
                      title="Duplica massimale"
                      @click="duplicaMassimale(rowIndex)"
                    >
                      <v-icon size="14">mdi-content-copy</v-icon>
                    </v-btn>
                    <!-- Elimina/Ripristina -->
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      :color="row.isDeleted ? 'green-lighten-2' : 'red-lighten-2'"
                      :title="row.isDeleted ? 'Annulla eliminazione' : 'Segna per eliminazione'"
                      @click="toggleEliminaMassimale(rowIndex)"
                    >
                      <v-icon size="14">{{ row.isDeleted ? 'mdi-restore' : 'mdi-delete' }}</v-icon>
                    </v-btn>
                  </div>
                </td>

                <!-- Data -->
                <td class="col-mas-data">
                  <input
                    v-model="row.dat_data"
                    type="text"
                    class="excel-input text-center font-weight-bold"
                    placeholder="DD/MM/YYYY"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Esercizio -->
                <td class="col-mas-ex">
                  <input
                    v-model="row.des_esercizio"
                    type="text"
                    class="excel-input font-weight-bold"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- ID Es -->
                <td class="col-mas-id">
                  <input
                    v-model="row.ID_esercizio"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Kg Massimale -->
                <td class="col-mas-kg">
                  <input
                    v-model="row.num_kg"
                    type="text"
                    class="excel-input text-center font-weight-black text-orange-lighten-2"
                    placeholder="Kg"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- RM Teorico -->
                <td class="col-mas-flag text-center">
                  <v-checkbox-btn
                    v-model="row.flg_rm_teorico"
                    :true-value="true"
                    :false-value="false"
                    color="orange-darken-3"
                    @update:model-value="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                    class="d-inline-flex"
                  ></v-checkbox-btn>
                </td>

                <!-- Note / Formula -->
                <td class="col-mas-note">
                  <input
                    v-model="row.des_note"
                    type="text"
                    class="excel-input"
                    placeholder="Note o formula (es. Calcolato da 5x90KG)"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Rapp. BW -->
                <td class="col-mas-num">
                  <input
                    v-model="row.num_rapp_BW"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Rapp. MM -->
                <td class="col-mas-num">
                  <input
                    v-model="row.num_rapp_MM"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Peso Atleta -->
                <td class="col-mas-num">
                  <input
                    v-model="row.num_peso"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- % BF -->
                <td class="col-mas-num">
                  <input
                    v-model="row.num_BF"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Data Peso -->
                <td class="col-mas-data">
                  <input
                    v-model="row.data_peso"
                    type="text"
                    class="excel-input text-center"
                    placeholder="DD/MM/YYYY"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Livello -->
                <td class="col-mas-num">
                  <input
                    v-model="row.num_lv"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Target Kg -->
                <td class="col-mas-num">
                  <input
                    v-model="row.num_obiettivo_kg"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Target Liv. -->
                <td class="col-mas-num">
                  <input
                    v-model="row.num_obiettivo_lv"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Kg Mancanti -->
                <td class="col-mas-num">
                  <input
                    v-model="row.num_kg_mancanti_ob"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- % Mancanti -->
                <td class="col-mas-num">
                  <input
                    v-model="row.num_perc_mancanti_ob"
                    type="text"
                    class="excel-input text-center"
                    @input="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Escludi -->
                <td class="col-mas-flag text-center">
                  <v-checkbox-btn
                    v-model="row.flg_escludi"
                    :true-value="true"
                    :false-value="false"
                    color="orange-darken-3"
                    @update:model-value="segnaModificatoMassimali(row)"
                    :disabled="row.isDeleted"
                    class="d-inline-flex"
                  ></v-checkbox-btn>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pulsanti sotto-tabella WOAPP_MASSIMALI_R -->
        <div class="d-flex flex-wrap justify-space-between align-center mt-4 pt-3 border-top-soft">
          <v-btn color="orange-darken-3" variant="text" rounded="lg" @click="aggiungiMassimale" :disabled="loadingMassimali">
            <v-icon class="mr-1">mdi-plus</v-icon>
            AGGIUNGI MASSIMALE
          </v-btn>
          <span class="text-caption text-muted font-italic">
            * I record di WOAPP_MASSIMALI_R tracciano lo storico dei test massimali e le stime teoriche dell'atleta.
          </span>
        </div>
      </div>

      <!-- TAB 4: CLIENTI (Anagrafica Atleta) -->
      <div v-show="activeTab === 'clienti'">
        <!-- Spinner Caricamento -->
        <div v-if="loadingCliente" class="text-center my-12 py-12">
          <v-progress-circular indeterminate color="purple" size="48"></v-progress-circular>
          <p class="mt-4 text-slate text-body-2">Caricamento anagrafica CLIENTE...</p>
        </div>

        <!-- Dati non ancora caricati -->
        <div v-else-if="!tabCaricate.clienti" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="purple-lighten-2" size="48" class="mb-2">mdi-cloud-download-outline</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Anagrafica Cliente non caricata da Firestore</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">
            Seleziona l'atleta e premi <strong class="text-orange-lighten-2">CARICA DATI</strong> in alto per scaricare l'anagrafica da Firestore.
          </p>
        </div>

        <div v-else-if="!clienteRecord" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="grey" size="48" class="mb-2">mdi-account-off-outline</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Nessun dato anagrafico trovato</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">Nessun record trovato nella collezione CLIENTI per questo atleta.</p>
          <v-btn color="orange-darken-3" variant="tonal" rounded="lg" @click="creaSchedaClienteDefault" class="mt-3 text-none">
            <v-icon class="mr-1">mdi-account-plus</v-icon>
            Crea Anagrafica Base
          </v-btn>
        </div>

        <div v-else class="pa-2">
          <v-card class="card-glass border rounded-xl pa-4" style="background: rgba(15, 23, 42, 0.4) !important;">
            <h4 class="text-subtitle-1 font-weight-black text-slate-dark mb-3 d-flex align-center">
              <v-icon color="purple-lighten-2" class="mr-2">mdi-account-circle</v-icon>
              Dati Anagrafici Atleta (ID: {{ clienteRecord.ID_cliente }})
            </h4>

            <v-row dense>
              <v-col cols="12" sm="6" md="4">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Nome</span>
                <v-text-field
                  v-model="clienteRecord.Nome"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Cognome</span>
                <v-text-field
                  v-model="clienteRecord.Cognome"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Email Principale</span>
                <v-text-field
                  v-model="clienteRecord.des_email"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Email WoApp</span>
                <v-text-field
                  v-model="clienteRecord.des_email_woapp"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="2">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Sesso</span>
                <v-select
                  v-model="clienteRecord.flg_sesso"
                  :items="['M', 'F']"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-select>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Data di Nascita</span>
                <v-text-field
                  v-model="clienteRecord.dat_data_nascita"
                  placeholder="DD/MM/YYYY"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="3">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Altezza (cm)</span>
                <v-text-field
                  v-model="clienteRecord.num_altezza"
                  placeholder="es. 175"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Scheda Selezionata</span>
                <v-text-field
                  v-model="clienteRecord.SchedaSelezionata"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-text-field>
              </v-col>

              <v-col cols="12" sm="6" md="4">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Tipo Vista Dettagli</span>
                <v-select
                  v-model="clienteRecord.TipoVistaDettagli"
                  :items="['TRUE', 'FALSE']"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-select>
              </v-col>

              <v-col cols="12">
                <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block mb-1">Note Coach</span>
                <v-textarea
                  v-model="clienteRecord.Note"
                  rows="2"
                  variant="outlined"
                  density="compact"
                  color="orange-darken-3"
                  rounded="lg"
                  @update:model-value="segnaModificatoCliente"
                  hide-details
                ></v-textarea>
              </v-col>
            </v-row>
          </v-card>
        </div>
      </div>

      <!-- TAB 5: INFORTUNI -->
      <div v-show="activeTab === 'infortuni'">
        <!-- Spinner Caricamento -->
        <div v-if="loadingInfortuni" class="text-center my-12 py-12">
          <v-progress-circular indeterminate color="red" size="48"></v-progress-circular>
          <p class="mt-4 text-slate text-body-2">Caricamento infortuni atleta...</p>
        </div>

        <!-- Dati non ancora caricati -->
        <div v-else-if="!tabCaricate.infortuni" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="red-lighten-2" size="48" class="mb-2">mdi-cloud-download-outline</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Infortuni non caricati da Firestore</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">
            Seleziona l'atleta e premi <strong class="text-orange-lighten-2">CARICA DATI</strong> in alto per scaricare gli infortuni da Firestore.
          </p>
        </div>

        <!-- Nessun dato trovato -->
        <div v-else-if="infortuniRecords.length === 0" class="text-center py-12 border-dashed rounded-xl my-4">
          <v-icon color="grey" size="48" class="mb-2">mdi-bandage</v-icon>
          <h4 class="text-slate font-weight-bold text-body-1">Nessun infortunio registrato</h4>
          <p class="text-caption text-muted px-4 leading-tight mt-1">Non ci sono fastidi o infortuni registrati per questo atleta. Clicca su "+ Segnala Infortunio" per aggiungerne uno.</p>
        </div>

        <!-- Tabella Excel INFORTUNI -->
        <div v-else class="table-container">
          <table class="excel-table">
            <thead>
              <tr>
                <th class="sticky-col col-actions">Azioni</th>
                <th class="col-inf-stato">Stato</th>
                <th class="col-inf-data">Data Inizio</th>
                <th class="col-inf-data">Data Risoluzione</th>
                <th class="col-inf-zona">Articolazione / Zona</th>
                <th class="col-inf-gravita">Gravità</th>
                <th class="col-inf-num">Riduzione %</th>
                <th class="col-inf-flag">Applica Riduz.</th>
                <th class="col-inf-ex">Esercizi Coinvolti</th>
                <th class="col-inf-note">Note Fastidio</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(row, rowIndex) in sortedInfortuniRecords"
                :key="row.localId"
                :class="{
                  'row-dirty': row.isDirty,
                  'row-new': row.isNew,
                  'row-deleted': row.isDeleted
                }"
              >
                <!-- Azioni -->
                <td class="sticky-col col-actions align-center justify-center">
                  <div class="d-flex align-center justify-center gap-1">
                    <!-- Elimina/Ripristina -->
                    <v-btn
                      icon
                      size="x-small"
                      variant="text"
                      :color="row.isDeleted ? 'green-lighten-2' : 'red-lighten-2'"
                      :title="row.isDeleted ? 'Annulla eliminazione' : 'Segna per eliminazione'"
                      @click="toggleEliminaInfortuni(rowIndex)"
                    >
                      <v-icon size="14">{{ row.isDeleted ? 'mdi-restore' : 'mdi-delete' }}</v-icon>
                    </v-btn>
                  </div>
                </td>

                <!-- Stato -->
                <td class="col-inf-stato">
                  <select
                    v-model="row.stato"
                    class="excel-input text-center font-weight-bold"
                    @change="segnaModificatoInfortuni(row)"
                    :disabled="row.isDeleted"
                  >
                    <option value="attivo" style="background: #0f172a; color: #f87171;">Attivo</option>
                    <option value="risolto" style="background: #0f172a; color: #4ade80;">Risolto</option>
                  </select>
                </td>

                <!-- Data Inizio -->
                <td class="col-inf-data">
                  <input
                    v-model="row.data_inizio"
                    type="text"
                    class="excel-input text-center"
                    placeholder="YYYY-MM-DD"
                    @input="segnaModificatoInfortuni(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Data Risoluzione -->
                <td class="col-inf-data">
                  <input
                    v-model="row.data_risoluzione"
                    type="text"
                    class="excel-input text-center"
                    placeholder="YYYY-MM-DD"
                    @input="segnaModificatoInfortuni(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Articolazione / Zona -->
                <td class="col-inf-zona">
                  <input
                    v-model="row.articolazione_coinvolta"
                    type="text"
                    class="excel-input font-weight-bold"
                    placeholder="es. Spalla DX, Ginocchio"
                    @input="segnaModificatoInfortuni(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Gravità -->
                <td class="col-inf-gravita">
                  <select
                    v-model="row.gravita"
                    class="excel-input text-center"
                    @change="segnaModificatoInfortuni(row)"
                    :disabled="row.isDeleted"
                  >
                    <option value="lieve" style="background: #0f172a;">Lieve</option>
                    <option value="moderato" style="background: #0f172a;">Moderato</option>
                    <option value="severo" style="background: #0f172a;">Severo</option>
                  </select>
                </td>

                <!-- Riduzione % -->
                <td class="col-inf-num">
                  <input
                    v-model.number="row.percentuale_riduzione"
                    type="number"
                    class="excel-input text-center text-orange-lighten-2"
                    placeholder="%"
                    @input="segnaModificatoInfortuni(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Applica Riduzione -->
                <td class="col-inf-flag text-center">
                  <v-checkbox-btn
                    v-model="row.applica_riduzione"
                    :true-value="true"
                    :false-value="false"
                    color="orange-darken-3"
                    @update:model-value="segnaModificatoInfortuni(row)"
                    :disabled="row.isDeleted"
                    class="d-inline-flex"
                  ></v-checkbox-btn>
                </td>

                <!-- Esercizi Originari -->
                <td class="col-inf-ex">
                  <input
                    v-model="row.esercizi_originari"
                    type="text"
                    class="excel-input text-caption"
                    placeholder="Esercizi limitati"
                    @input="segnaModificatoInfortuni(row)"
                    :disabled="row.isDeleted"
                  />
                </td>

                <!-- Note -->
                <td class="col-inf-note">
                  <input
                    v-model="row.note"
                    type="text"
                    class="excel-input"
                    placeholder="Note e sintomi"
                    @input="segnaModificatoInfortuni(row)"
                    :disabled="row.isDeleted"
                  />
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Pulsanti sotto-tabella INFORTUNI -->
        <div class="d-flex flex-wrap justify-space-between align-center mt-4 pt-3 border-top-soft">
          <v-btn color="orange-darken-3" variant="text" rounded="lg" @click="aggiungiInfortuni" :disabled="loadingInfortuni">
            <v-icon class="mr-1">mdi-plus</v-icon>
            SEGNALA INFORTUNIO
          </v-btn>
          <span class="text-caption text-muted font-italic">
            * Gli infortuni influenzano i calcoli di sicurezza e le riduzioni percentuali negli allenamenti dell'atleta.
          </span>
        </div>
      </div>
    </v-card>

    <!-- BARRA DELLE AZIONI FLUTTUANTE (Salva modifiche / Annulla / Svuota) -->
    <v-fade-transition>
      <div v-if="haModifiche" class="action-bar-floating card-glass border rounded-2xl elevation-4 px-5 py-4 d-flex align-center justify-space-between">
        <div class="text-left">
          <div class="font-weight-black text-white text-body-1">Modifiche non salvate! ⚠️</div>
          <div class="text-caption text-muted">Ci sono modifiche pendenti. Salva per scriverle su Firebase.</div>
        </div>
        <div class="d-flex align-center gap-2">
          <!-- Annulla -->
          <v-btn color="slate" variant="outlined" rounded="lg" class="mr-2" @click="annullaModifiche" :disabled="savingData">
            Annulla
          </v-btn>
          <!-- Salva -->
          <v-btn color="orange-darken-3" rounded="lg" class="text-white font-weight-bold px-5" @click="salvaModifiche" :disabled="savingData">
            <v-icon class="mr-1" v-if="!savingData">mdi-content-save</v-icon>
            <v-progress-circular indeterminate size="16" width="2" color="white" class="mr-1.5" v-else></v-progress-circular>
            {{ savingData ? 'Salvataggio...' : 'SALVA MODIFICHE' }}
          </v-btn>
        </div>
      </div>
    </v-fade-transition>

    <!-- DIALOG DETTAGLI COMPLETI 85 CAMPI (Responsive Mobile & Detail Editing) -->
    <v-dialog v-model="dialogDettaglioOpen" max-width="650" rounded="xl" scrollable>
      <v-card class="pa-5 rounded-2xl card-glass border text-left" style="background: var(--card-bg-dark) !important; border-color: var(--card-border) !important; backdrop-filter: blur(25px) !important;">
        <v-card-title class="font-weight-black text-orange-darken-3 d-flex align-center justify-space-between px-0 mb-1">
          <div class="d-flex align-center">
            <v-icon color="orange-darken-3" class="mr-2.5" size="26">mdi-format-list-bulleted</v-icon>
            Modifica Dettagli Record
          </div>
          <v-btn icon size="small" variant="text" color="slate-dark" @click="chiudiDettaglio(false)">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="px-0 py-2" v-if="selectedRow">
          <!-- Tabs verticali o orizzontali per navigare gli 85 campi -->
          <v-tabs v-model="tabDettaglio" color="orange-darken-3" align-tabs="start" class="border-bottom-soft mb-4">
            <v-tab value="info" class="text-caption font-weight-bold">Info Esercizio</v-tab>
            <v-tab value="weeks" class="text-caption font-weight-bold">Carichi / Reps</v-tab>
            <v-tab value="note" class="text-caption font-weight-bold">Note Coach</v-tab>
            <v-tab value="avanzate" class="text-caption font-weight-bold">Avanzate / ID</v-tab>
          </v-tabs>

          <v-window v-model="tabDettaglio">
            <!-- TAB 1: INFO ESERCIZIO -->
            <v-window-item value="info">
              <v-row dense>
                <v-col cols="4">
                  <v-text-field v-model="selectedRow.des_giorno" label="Giorno (A,B,C...)" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="selectedRow.num_riga_giorno" label="Riga Giorno" type="number" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="selectedRow.alf_superserie" label="Superserie" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="selectedRow.des_esercizio" label="Esercizio Principale" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="selectedRow.des_esercizio_2" label="Dettaglio Esercizio / Variante" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.des_settore_princ" label="Settore Principale (Muscolo)" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.des_settore" label="Sotto Settore" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.des_qta_report" label="Quantità / Serie x Reps" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.des_rec_report" label="Tempo Recupero" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="selectedRow.UrlNormal" label="Url Immagine / Video GIF" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-checkbox v-model="selectedRow.no_elimina" label="No Elimina (Mantieni la riga durante aggiornamenti)" color="orange-darken-3" hide-details></v-checkbox>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- TAB 2: CARICHI / REPS -->
            <v-window-item value="weeks">
              <span class="text-caption text-orange-lighten-2 font-weight-black d-block mb-3">Compilazione Log Settimanali (Carichi inseriti, Reps svolte, Metriche IRT)</span>
              
              <v-row dense v-for="w in 6" :key="'week-log-' + w">
                <v-col cols="4">
                  <v-text-field v-model="selectedRow['ins_week' + w]" :label="'Peso W' + w" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="selectedRow['reps_week' + w]" :label="'Reps W' + w" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="4">
                  <v-text-field v-model="selectedRow['perc_irt_w' + w]" :label="'% IRT W' + w" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- TAB 3: NOTE COACH -->
            <v-window-item value="note">
              <v-row dense>
                <v-col cols="12">
                  <v-textarea v-model="selectedRow.des_note" label="Note Esercizio (Note Coach Generali)" variant="outlined" rows="2" color="orange-darken-3" rounded="lg"></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="selectedRow.des_note_attrezzo" label="Note Attrezzo (es. Regolazioni sedile, posizionamento)" variant="outlined" rows="2" color="orange-darken-3" rounded="lg"></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="selectedRow.des_note_gen_attr" label="Note Generali Attrezzo" variant="outlined" rows="2" color="orange-darken-3" rounded="lg"></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-textarea v-model="selectedRow.des_commenti" label="Commenti Atleta (Feedbacks ricevuti)" variant="outlined" rows="2" color="orange-darken-3" rounded="lg"></v-textarea>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="selectedRow.des_note_immagine" label="Note Immagine / Dettagli media" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
              </v-row>
            </v-window-item>

            <!-- TAB 4: AVANZATE / SYSTEM IDS -->
            <v-window-item value="avanzate">
              <v-row dense>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.num_riga" label="Numero Riga (Identificativo Unico)" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.ID_scheda" label="ID Scheda (AppSheet ID)" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.ID_cliente" label="ID Cliente" disabled variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.num_scheda" label="Numero Scheda" disabled variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="selectedRow.timestamp" label="Timestamp Data Creazione" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="12">
                  <v-text-field v-model="selectedRow.timestamp_ute" label="Ultimo Aggiornamento Utente" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.num_peso_bilanciere" label="Peso Bilanciere di default (KG)" type="number" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.num_lv" label="Livello Difficoltà Esercizio" type="number" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.num_ins6" label="Valore Ins 6" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-text-field v-model="selectedRow.num_faticaw6" label="Fatica registrata W6" variant="outlined" density="comfortable" color="orange-darken-3" rounded="lg"></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-checkbox v-model="selectedRow.flg_video" label="Flag Video attivo" color="orange-darken-3" hide-details></v-checkbox>
                </v-col>
                <v-col cols="6">
                  <v-checkbox v-model="selectedRow.flg_sic" label="Flag Sicurezza" color="orange-darken-3" hide-details></v-checkbox>
                </v-col>
              </v-row>
            </v-window-item>
          </v-window>
        </v-card-text>

        <v-card-actions class="px-0 pt-4 pb-0">
          <v-btn color="slate" variant="outlined" rounded="lg" @click="chiudiDettaglio(false)" class="mr-2">
            Annulla
          </v-btn>
          <v-btn color="orange-darken-3" variant="flat" rounded="lg" @click="chiudiDettaglio(true)" class="text-white font-weight-bold flex-grow-1">
            Conferma & Chiudi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- DIALOG ISTRUZIONI SCORCIATOIE TASTIERA EXCEL -->
    <v-dialog v-model="mostraIstruzioni" max-width="450" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border text-left" style="background: var(--card-bg-dark) !important; border-color: var(--card-border) !important; backdrop-filter: blur(25px) !important;">
        <v-card-title class="font-weight-black text-orange-darken-3 d-flex align-center px-0">
          <v-icon color="orange-darken-3" class="mr-2">mdi-keyboard-outline</v-icon>
          Scorciatoie Excel-like ⌨️
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-2" style="color: #cbd5e1 !important; line-height: 1.6;">
          Per facilitare l'inserimento veloce dei dati sul database, la tabella supporta i seguenti comandi:
          <ul class="mt-2 pl-5">
            <li><strong>Frecce tastiera (Su / Giù):</strong> Sposta il cursore di inserimento sulla riga precedente o successiva.</li>
            <li><strong>Frecce tastiera (Sinistra / Destra):</strong> Sposta il cursore tra i campi della riga.</li>
            <li><strong>Copia/Incolla da Excel:</strong> Seleziona un intervallo di celle da Excel/Google Sheets, copialo (Ctrl+C) e fai <strong>Ctrl+V</strong> in un qualsiasi punto della tabella per importarlo al volo!</li>
            <li>Le righe modificate sono evidenziate con un bordo <span class="text-orange-lighten-2 font-weight-bold">Arancione</span>.</li>
            <li>Le nuove righe aggiunte sono evidenziate in <span class="text-green-lighten-2 font-weight-bold">Verde</span>.</li>
          </ul>
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraIstruzioni = false" class="text-white font-weight-bold">
            Ho capito
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { doc, getDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';
import {
  ruolo,
  MAPPA_CLIENTI,
  ORDINE_ORIGINALE_ATLETI,
  selectedAthlete,
  setSelectedAthlete,
  selectedSheet,
  setSelectedSheet,
  propostaBaseWeek2Global,
  propostaBaseWeek5Global,
  propostaBaseWeek6Global,
  incrementoPesoPostScaricoPctGlobal,
  sogliaForzaManubriGlobal,
  incrementoManubriLeggeroGlobal,
  incrementoManubriForteGlobal,
  faticaPesanteW1PctGlobal,
  faticaDevastanteW1PctGlobal,
  faticaPesanteStoricoPctGlobal,
  faticaDevastanteStoricoPctGlobal,
  regolaProgressioneW2Global,
  deallenamentoSoglia1Global,
  deallenamentoSoglia2Global,
  deallenamentoSoglia3Global,
  deallenamentoSoglia4Global,
  deallenamentoPct1Global,
  deallenamentoPct2Global,
  deallenamentoPct3Global,
  deallenamentoPct4Global,
  penalitaMaxInstabiliPctGlobal,
  penalitaMaxStabiliPctGlobal,
  dimensioneGifCompattaGlobal,
  editorNoteEspansoGlobal,
  smartNoteCleanupGlobal,
  margineTopInputWeekGlobal,
  margineBottomInputWeekGlobal,
  margineTopW6FeedbackGlobal,
  margineBottomGhostNoticeGlobal,
  impostaNomeAtletaDinamico,
  caricaNomiAtletiDinamici
} from '../authStore.js';

// Local mappings for global settings
const propostaBaseWeek2 = propostaBaseWeek2Global;
const propostaBaseWeek5 = propostaBaseWeek5Global;
const propostaBaseWeek6 = propostaBaseWeek6Global;
const INCREMENTO_PESO_POST_SCARICO_PCT = incrementoPesoPostScaricoPctGlobal;
const SOGLIA_FORZA_MANUBRI = sogliaForzaManubriGlobal;
const INCREMENTO_MANUBRI_LEGGERO = incrementoManubriLeggeroGlobal;
const INCREMENTO_MANUBRI_FORTE = incrementoManubriForteGlobal;
const FATICA_PESANTE_W1_PCT = faticaPesanteW1PctGlobal;
const FATICA_DEVASTANTE_W1_PCT = faticaDevastanteW1PctGlobal;
const FATICA_PESANTE_STORICO_PCT = faticaPesanteStoricoPctGlobal;
const FATICA_DEVASTANTE_STORICO_PCT = faticaDevastanteStoricoPctGlobal;
const regolaProgressioneW2 = regolaProgressioneW2Global;
const DIMENSIONE_GIF_COMPATTA = dimensioneGifCompattaGlobal;
const editorNoteEspanso = editorNoteEspansoGlobal;
const smartNoteCleanup = smartNoteCleanupGlobal;
const margineTopInputWeek = margineTopInputWeekGlobal;
const margineBottomInputWeek = margineBottomInputWeekGlobal;
const margineTopW6Feedback = margineTopW6FeedbackGlobal;
const margineBottomGhostNotice = margineBottomGhostNoticeGlobal;
const DEALLENAMENTO_SOGLIA1 = deallenamentoSoglia1Global;
const DEALLENAMENTO_SOGLIA2 = deallenamentoSoglia2Global;
const DEALLENAMENTO_SOGLIA3 = deallenamentoSoglia3Global;
const DEALLENAMENTO_SOGLIA4 = deallenamentoSoglia4Global;
const DEALLENAMENTO_PCT1 = deallenamentoPct1Global;
const DEALLENAMENTO_PCT2 = deallenamentoPct2Global;
const DEALLENAMENTO_PCT3 = deallenamentoPct3Global;
const DEALLENAMENTO_PCT4 = deallenamentoPct4Global;
const PENALITA_MAX_INSTABILI_PCT = penalitaMaxInstabiliPctGlobal;
const PENALITA_MAX_STABILI_PCT = penalitaMaxStabiliPctGlobal;

// Stato di base
const listaAtleti = ref([]);
const atletaSelezionato = ref('');
const schedaSelezionata = ref('');
const listaSchede = ref([]);

const records = ref([]); // Elenco locale di record caricati/modificati

// Stato di base WORKOUT_T
const activeTab = ref('storyboard');
const tipoDatiCaricare = ref('storyboard');
const workoutTRecords = ref([]);
const loadingWorkoutT = ref(false);

// Stato WOAPP_MASSIMALI_R
const massimaliRecords = ref([]);
const loadingMassimali = ref(false);

// Stato CLIENTI
const clienteRecord = ref(null);
const loadingCliente = ref(false);

// Stato INFORTUNI
const infortuniRecords = ref([]);
const loadingInfortuni = ref(false);

// Stato di caricamento selettivo per singola tabella
const tabCaricate = ref({
  storyboard: false,
  workout_t: false,
  massimali: false,
  clienti: false,
  infortuni: false
});

// Cache in-memory a livello di modulo per memorizzare i dati tra i cambi di rotta nella sessione
const dashboardCache = new Map();

// Helper per interpretare i valori booleani (supporta bool, stringhe 'true'/'vero'/'1', numeri)
const isTrue = (val) => {
  if (typeof val === 'boolean') return val;
  if (typeof val === 'number') return val === 1;
  if (typeof val === 'string') {
    const s = val.trim().toLowerCase();
    return s === 'true' || s === 'vero' || s === '1';
  }
  return false;
};

// Salva lo stato corrente dell'atleta e della scheda nella cache in memoria
const salvaInCache = () => {
  if (!atletaSelezionato.value) return;
  const athleteId = String(atletaSelezionato.value);
  const current = dashboardCache.get(athleteId) || {
    storyboardRecords: {},
    tabCaricate: {}
  };
  
  current.tabCaricate = { ...tabCaricate.value };
  current.listaSchede = [...listaSchede.value];
  current.workoutTRecords = JSON.parse(JSON.stringify(workoutTRecords.value));
  current.massimaliRecords = JSON.parse(JSON.stringify(massimaliRecords.value));
  current.clienteRecord = clienteRecord.value ? JSON.parse(JSON.stringify(clienteRecord.value)) : null;
  current.infortuniRecords = JSON.parse(JSON.stringify(infortuniRecords.value));
  
  if (schedaSelezionata.value) {
    if (!current.storyboardRecords) current.storyboardRecords = {};
    current.storyboardRecords[String(schedaSelezionata.value)] = JSON.parse(JSON.stringify(records.value));
  }
  current.lastFetched = Date.now();
  
  dashboardCache.set(athleteId, current);
};

// Ripristina i dati dell'atleta dalla cache in memoria a costo 0 Firestore reads
const ripristinaDaCache = (athleteId) => {
  const cached = dashboardCache.get(String(athleteId));
  if (!cached) return false;
  
  tabCaricate.value = {
    storyboard: false,
    workout_t: false,
    massimali: false,
    clienti: false,
    infortuni: false,
    ...(cached.tabCaricate || {})
  };
  listaSchede.value = [...(cached.listaSchede || [])];
  workoutTRecords.value = JSON.parse(JSON.stringify(cached.workoutTRecords || []));
  massimaliRecords.value = JSON.parse(JSON.stringify(cached.massimaliRecords || []));
  clienteRecord.value = cached.clienteRecord ? JSON.parse(JSON.stringify(cached.clienteRecord)) : null;
  infortuniRecords.value = JSON.parse(JSON.stringify(cached.infortuniRecords || []));
  
  if (listaSchede.value.length > 0 && !schedaSelezionata.value) {
    if (selectedSheet.value && listaSchede.value.includes(String(selectedSheet.value).trim())) {
      schedaSelezionata.value = String(selectedSheet.value).trim();
    } else {
      schedaSelezionata.value = listaSchede.value[listaSchede.value.length - 1];
    }
  }
  
  if (schedaSelezionata.value && cached.storyboardRecords && cached.storyboardRecords[String(schedaSelezionata.value)]) {
    records.value = JSON.parse(JSON.stringify(cached.storyboardRecords[String(schedaSelezionata.value)]));
  } else {
    records.value = [];
  }
  
  return true;
};

// Svuota i dati locali quando si cambia atleta senza avere cache
const svuotaDatiLocali = () => {
  records.value = [];
  workoutTRecords.value = [];
  massimaliRecords.value = [];
  clienteRecord.value = null;
  infortuniRecords.value = [];
  listaSchede.value = [];
  schedaSelezionata.value = '';
  tabCaricate.value = {
    storyboard: false,
    workout_t: false,
    massimali: false,
    clienti: false,
    infortuni: false
  };
};

// Watcher per allineare tipoDatiCaricare e activeTab bidirezionalmente
watch(activeTab, (newVal) => {
  tipoDatiCaricare.value = newVal;
});
const gestisciCambioTipoDati = (val) => {
  activeTab.value = val;
};

// Loading States
const loadingSchede = ref(false);
const loadingData = ref(false);
const savingData = ref(false);

const dialogDettaglioOpen = ref(false);
const selectedRow = ref(null);
const selectedRowIndex = ref(-1);
const tabDettaglio = ref('info');
const mostraIstruzioni = ref(false);

// Refs degli input per la navigazione con frecce
const inputRefs = ref({});

// Colonne editabili della griglia tabellare
const editColumns = [
  'des_giorno', 'num_riga_giorno', 'des_esercizio', 'des_settore', 
  'des_settore_princ', 'alf_superserie', 'des_qta_report', 'des_rec_report', 
  'des_note', 'ins_week1', 'ins_week2', 'ins_week3', 'ins_week4', 
  'ins_week5', 'ins_week6', 'num_ins6', 'num_faticaw6', 'num_peso_bilanciere',
  'des_commenti', 'des_note_attrezzo', 'des_note_gen_attr', 'UrlNormal', 'flg_video', 'no_elimina', 'num_riga', 'timestamp_ute'
];

// Configurazione Atleti per dropdown
const itemsAtleti = computed(() => {
  const ordinati = [...listaAtleti.value].sort((a, b) => {
    const idxA = ORDINE_ORIGINALE_ATLETI.indexOf(String(a).trim());
    const idxB = ORDINE_ORIGINALE_ATLETI.indexOf(String(b).trim());
    const posA = idxA === -1 ? 999 : idxA;
    const posB = idxB === -1 ? 999 : idxB;
    return posA - posB;
  });
  return ordinati.map(id => {
    const c = MAPPA_CLIENTI[id];
    return {
      title: c ? `${c.nome} ${c.cognome} (ID: ${id})` : `Atleta ID: ${id}`,
      value: id
    };
  });
});

// Ordinamento dei record locale basato su Giorno + num_riga_giorno + num_riga per visualizzarlo come nel CSV
const sortedRecords = computed(() => {
  return [...records.value].sort((a, b) => {
    const giornoA = String(a.des_giorno || '').trim().toUpperCase();
    const giornoB = String(b.des_giorno || '').trim().toUpperCase();
    
    if (giornoA !== giornoB) {
      return giornoA.localeCompare(giornoB);
    }
    
    const rigaA = parseInt(a.num_riga_giorno) || 0;
    const rigaB = parseInt(b.num_riga_giorno) || 0;
    
    if (rigaA !== rigaB) {
      return rigaA - rigaB;
    }
    
    const idA = parseInt(a.num_riga) || 0;
    const idB = parseInt(b.num_riga) || 0;
    return idA - idB;
  });
});

// Ordinamento dei record WORKOUT_T
const sortedWorkoutTRecords = computed(() => {
  return [...workoutTRecords.value].sort((a, b) => {
    const sA = Number(a.num_scheda) || 0;
    const sB = Number(b.num_scheda) || 0;
    return sA - sB;
  });
});

// Ordinamento dei massimali WOAPP_MASSIMALI_R
const sortedMassimaliRecords = computed(() => {
  return [...massimaliRecords.value].sort((a, b) => {
    const kgA = parseFloat(String(a.num_kg || 0).replace(',', '.')) || 0;
    const kgB = parseFloat(String(b.num_kg || 0).replace(',', '.')) || 0;
    return kgB - kgA;
  });
});

// Ordinamento degli infortuni
const sortedInfortuniRecords = computed(() => {
  return [...infortuniRecords.value].sort((a, b) => {
    return String(b.data_inizio || '').localeCompare(String(a.data_inizio || ''));
  });
});

// Verifica se ci sono modifiche pendenti non salvate
const haModifiche = computed(() => {
  return records.value.some(r => r.isDirty || r.isNew || r.isDeleted) ||
         workoutTRecords.value.some(r => r.isDirty || r.isNew || r.isDeleted) ||
         massimaliRecords.value.some(r => r.isDirty || r.isNew || r.isDeleted) ||
         (clienteRecord.value && clienteRecord.value.isDirty) ||
         infortuniRecords.value.some(r => r.isDirty || r.isNew || r.isDeleted);
});

// Registrazione dinamica dei riferimenti agli input in griglia per navigazione con tastiera
const registerInputRef = (el, rowIndex, fieldName) => {
  if (el) {
    if (!inputRefs.value[rowIndex]) {
      inputRefs.value[rowIndex] = {};
    }
    inputRefs.value[rowIndex][fieldName] = el;
  }
};

onMounted(async () => {
  // Carica anagrafica clienti per popolare il dropdown
  try {
    const docSnap = await getDoc(doc(db, 'METADATA', 'clienti'));
    if (docSnap.exists()) {
      listaAtleti.value = docSnap.data().lista || [];
    }
    await caricaNomiAtletiDinamici();
  } catch (err) {
    console.error("Errore lettura METADATA clienti:", err);
  }

  // Pre-popola l'atleta e la scheda attivi se impostati
  if (selectedAthlete.value) {
    atletaSelezionato.value = selectedAthlete.value;
  }
  if (selectedSheet.value) {
    schedaSelezionata.value = String(selectedSheet.value).trim();
  }

  // Se l'atleta è già presente nella cache in memoria della sessione, ripristina a costo 0 quote
  if (atletaSelezionato.value && dashboardCache.has(String(atletaSelezionato.value))) {
    ripristinaDaCache(String(atletaSelezionato.value));
  }
  // NOTA: Nessuna lettura automatica a Firestore viene eseguita qui se non in cache, salvaguardando le quote.
});

// Watcher per allineare l'atleta e la scheda selezionati localmente con lo stato globale
watch(atletaSelezionato, (newVal) => {
  if (newVal) {
    setSelectedAthlete(newVal);
  }
});

watch(schedaSelezionata, (newVal) => {
  if (newVal) {
    setSelectedSheet(newVal);
  }
});

// Carica tutte le schede disponibili per l'atleta selezionato
const caricaSchedeAtleta = async () => {
  if (!atletaSelezionato.value) return;
  loadingSchede.value = true;
  listaSchede.value = [];
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', atletaSelezionato.value)
    );
    const snap = await getDocs(q);
    const setSchede = new Set();
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.num_scheda) {
        setSchede.add(String(data.num_scheda).trim());
      }
    });
    listaSchede.value = Array.from(setSchede).sort((a, b) => Number(a) - Number(b));
    
    // Auto-seleziona la scheda precedentemente salvata globalmente o l'ultima disponibile
    if (listaSchede.value.length > 0) {
      if (selectedSheet.value && listaSchede.value.includes(String(selectedSheet.value).trim())) {
        schedaSelezionata.value = String(selectedSheet.value).trim();
      } else if (!schedaSelezionata.value || !listaSchede.value.includes(String(schedaSelezionata.value).trim())) {
        schedaSelezionata.value = listaSchede.value[listaSchede.value.length - 1];
      }
    }
  } catch (err) {
    console.error("Errore caricamento schede:", err);
  } finally {
    loadingSchede.value = false;
  }
};

// Carica tutti i record di WORKOUT_T relativi al cliente
const caricaWorkoutT = async () => {
  if (!atletaSelezionato.value) return;
  loadingWorkoutT.value = true;
  workoutTRecords.value = [];
  try {
    const q = query(
      collection(db, 'WORKOUT_T'),
      where('ID_cliente', '==', atletaSelezionato.value)
    );
    const snap = await getDocs(q);
    const temp = [];
    let localIdCounter = 1;
    
    snap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.NomeCognomeTM) {
        impostaNomeAtletaDinamico(atletaSelezionato.value, data.NomeCognomeTM);
      }
      temp.push({
        dbId: docSnap.id,
        localId: localIdCounter++,
        isDirty: false,
        isNew: false,
        isDeleted: false,
        num_peso_WT: data.num_peso_WT || '',
        ...data
      });
    });
    
    workoutTRecords.value = temp;
  } catch (err) {
    console.error("Errore caricamento WORKOUT_T da Firestore:", err);
  } finally {
    loadingWorkoutT.value = false;
  }
};

// Carica tutti i massimali di WOAPP_MASSIMALI_R relativi al cliente
const caricaMassimali = async () => {
  if (!atletaSelezionato.value) return;
  loadingMassimali.value = true;
  massimaliRecords.value = [];
  try {
    const q = query(
      collection(db, 'WOAPP_MASSIMALI_R'),
      where('ID_cliente', '==', String(atletaSelezionato.value))
    );
    const snap = await getDocs(q);
    const temp = [];
    let localIdCounter = 1;
    
    snap.forEach(docSnap => {
      const data = docSnap.data();
      temp.push({
        dbId: docSnap.id,
        localId: localIdCounter++,
        isDirty: false,
        isNew: false,
        isDeleted: false,
        ...data,
        flg_rm_teorico: isTrue(data.flg_rm_teorico),
        flg_escludi: isTrue(data.flg_escludi)
      });
    });
    
    massimaliRecords.value = temp;
  } catch (err) {
    console.error("Errore caricamento WOAPP_MASSIMALI_R da Firestore:", err);
  } finally {
    loadingMassimali.value = false;
  }
};

// Carica il record CLIENTE
const caricaCliente = async () => {
  if (!atletaSelezionato.value) return;
  loadingCliente.value = true;
  try {
    const docSnap = await getDoc(doc(db, 'CLIENTI', String(atletaSelezionato.value)));
    if (docSnap.exists()) {
      clienteRecord.value = {
        isDirty: false,
        ID_cliente: String(atletaSelezionato.value),
        ...docSnap.data()
      };
    } else {
      clienteRecord.value = null;
    }
  } catch (err) {
    console.error("Errore caricamento CLIENTE da Firestore:", err);
  } finally {
    loadingCliente.value = false;
  }
};

// Carica tutti gli infortuni relativi al cliente
const caricaInfortuni = async () => {
  if (!atletaSelezionato.value) return;
  loadingInfortuni.value = true;
  infortuniRecords.value = [];
  try {
    const q = query(
      collection(db, 'infortuni'),
      where('id_cliente', '==', String(atletaSelezionato.value))
    );
    const snap = await getDocs(q);
    const temp = [];
    let localIdCounter = 1;
    
    snap.forEach(docSnap => {
      const data = docSnap.data();
      temp.push({
        dbId: docSnap.id,
        localId: localIdCounter++,
        isDirty: false,
        isNew: false,
        isDeleted: false,
        ...data
      });
    });
    
    infortuniRecords.value = temp;
  } catch (err) {
    console.error("Errore caricamento infortuni da Firestore:", err);
  } finally {
    loadingInfortuni.value = false;
  }
};

// Gestione selezione Atleta
const gestisciCambioAtleta = () => {
  const athleteId = String(atletaSelezionato.value || '');
  if (!athleteId) {
    svuotaDatiLocali();
    return;
  }

  // Se l'atleta è già presente nella cache della sessione, ripristina istantaneamente a costo 0
  if (dashboardCache.has(athleteId)) {
    ripristinaDaCache(athleteId);
  } else {
    // Altrimenti svuota la visualizzazione locale e attende il click su "CARICA DATI"
    svuotaDatiLocali();
  }
};

// Gestione cambio Scheda
const gestisciCambioScheda = async () => {
  if (!atletaSelezionato.value || !schedaSelezionata.value) return;
  const athleteId = String(atletaSelezionato.value);
  const sheetId = String(schedaSelezionata.value);

  const cached = dashboardCache.get(athleteId);
  if (cached && cached.storyboardRecords && cached.storyboardRecords[sheetId]) {
    records.value = JSON.parse(JSON.stringify(cached.storyboardRecords[sheetId]));
    tabCaricate.value.storyboard = true;
  } else if (tabCaricate.value.storyboard) {
    await caricaEsercizi();
    salvaInCache();
  }
};

// Carica su richiesta ESCLUSIVAMENTE la tabella attualmente selezionata per risparmiare quote Firestore
const caricaDati = async () => {
  if (!atletaSelezionato.value) return;
  const tab = activeTab.value || tipoDatiCaricare.value || 'storyboard';
  
  if (tab === 'storyboard') {
    loadingData.value = true;
    try {
      if (listaSchede.value.length === 0) {
        await caricaSchedeAtleta();
      }
      if (schedaSelezionata.value) {
        await caricaEsercizi();
      }
      tabCaricate.value.storyboard = true;
      salvaInCache();
    } finally {
      loadingData.value = false;
    }
  } else if (tab === 'workout_t') {
    await caricaWorkoutT();
    tabCaricate.value.workout_t = true;
    salvaInCache();
  } else if (tab === 'massimali') {
    await caricaMassimali();
    tabCaricate.value.massimali = true;
    salvaInCache();
  } else if (tab === 'clienti') {
    await caricaCliente();
    tabCaricate.value.clienti = true;
    salvaInCache();
  } else if (tab === 'infortuni') {
    await caricaInfortuni();
    tabCaricate.value.infortuni = true;
    salvaInCache();
  }
};

const ricaricaTutto = async () => {
  await caricaDati();
};

// Carica i record dello storyboard per la scheda selezionata
const caricaEsercizi = async () => {
  if (!atletaSelezionato.value || !schedaSelezionata.value) return;
  loadingData.value = true;
  records.value = [];
  inputRefs.value = {};
  
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', atletaSelezionato.value),
      where('num_scheda', '==', String(schedaSelezionata.value))
    );
    const snap = await getDocs(q);
    const temp = [];
    let localIdCounter = 1;
    
    snap.forEach(docSnap => {
      temp.push({
        dbId: docSnap.id,
        localId: localIdCounter++,
        isDirty: false,
        isNew: false,
        isDeleted: false,
        ...docSnap.data()
      });
    });
    
    records.value = temp;
  } catch (err) {
    console.error("Errore caricamento esercizi da Firestore:", err);
  } finally {
    loadingData.value = false;
  }
};

// Segna la riga come modificata ("dirty")
const segnaModificato = (row) => {
  if (!row.isNew) row.isDirty = true;
};
const segnaModificatoWT = (row) => {
  if (!row.isNew) row.isDirty = true;
};
const segnaModificatoMassimali = (row) => {
  if (!row.isNew) row.isDirty = true;
};
const segnaModificatoCliente = () => {
  if (clienteRecord.value) clienteRecord.value.isDirty = true;
};
const segnaModificatoInfortuni = (row) => {
  if (!row.isNew) row.isDirty = true;
};

// Crea anagrafica cliente default
const creaSchedaClienteDefault = () => {
  const c = MAPPA_CLIENTI[String(atletaSelezionato.value)];
  clienteRecord.value = {
    isDirty: true,
    ID_cliente: String(atletaSelezionato.value),
    Nome: c?.nome || '',
    Cognome: c?.cognome || '',
    des_email: c?.email || '',
    des_email_woapp: '',
    flg_sesso: 'M',
    dat_data_nascita: '',
    num_altezza: '',
    SchedaSelezionata: schedaSelezionata.value || '1',
    TipoVistaDettagli: 'FALSE',
    Note: ''
  };
};

// Aggiunge un mesociclo in WORKOUT_T
const aggiungiWorkoutT = () => {
  const maxScheda = workoutTRecords.value.reduce((max, r) => {
    const s = parseInt(r.num_scheda) || 0;
    return s > max ? s : max;
  }, 0);

  const localId = workoutTRecords.value.length + 1;
  
  const oggi = new Date();
  const formattaData = (d) => {
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  };
  
  const datInizio = formattaData(oggi);
  const datFine = formattaData(new Date(oggi.getTime() + 42 * 24 * 60 * 60 * 1000));

  const newRow = {
    localId,
    dbId: '',
    isDirty: false,
    isNew: true,
    isDeleted: false,
    ID_cliente: String(atletaSelezionato.value),
    num_scheda: String(maxScheda + 1),
    dat_data: datInizio,
    dat_scadenza: datFine,
    num_peso_WT: '',
    des_descrizione: 'Mesociclo Definitivo',
    des_note: '',
    flg_da_finire: 'true',
    flg_ramp_test: 'true',
    num_passi_gg: 0,
    cod_tipo_avanz_scheda: '0DEF',
    num_perc_compl: 0,
    ID_scheda: '0',
    PropostaWoManuale: 'FALSE',
    SceltaGiorno: 'A',
    SceltaWeek: 1,
    URLTestiMail: '',
    NomeCognomeTM: ''
  };
  workoutTRecords.value.push(newRow);
};

const duplicaWorkoutT = (rowIndex) => {
  const original = sortedWorkoutTRecords.value[rowIndex];
  if (!original) return;

  const maxScheda = workoutTRecords.value.reduce((max, r) => {
    const s = parseInt(r.num_scheda) || 0;
    return s > max ? s : max;
  }, 0);

  const localId = workoutTRecords.value.length + 1;
  const clone = {
    ...original,
    localId,
    dbId: '',
    isNew: true,
    isDirty: false,
    isDeleted: false,
    num_scheda: String(maxScheda + 1)
  };
  workoutTRecords.value.push(clone);
};

const toggleEliminaWorkoutT = (rowIndex) => {
  const row = sortedWorkoutTRecords.value[rowIndex];
  if (row) {
    if (row.isNew) {
      workoutTRecords.value = workoutTRecords.value.filter(r => r.localId !== row.localId);
    } else {
      row.isDeleted = !row.isDeleted;
    }
  }
};

// Massimali Actions
const aggiungiMassimale = () => {
  const oggi = new Date();
  const d = String(oggi.getDate()).padStart(2, '0');
  const m = String(oggi.getMonth() + 1).padStart(2, '0');
  const y = oggi.getFullYear();
  const dataOggi = `${d}/${m}/${y}`;

  const newRow = {
    localId: massimaliRecords.value.length + 1,
    dbId: '',
    isDirty: false,
    isNew: true,
    isDeleted: false,
    ID_cliente: String(atletaSelezionato.value),
    dat_data: dataOggi,
    des_esercizio: 'Panca piana',
    ID_esercizio: '',
    num_kg: '100',
    flg_rm_teorico: false,
    des_note: '',
    num_rapp_BW: '',
    num_rapp_MM: '',
    num_peso: '',
    num_BF: '',
    data_peso: dataOggi,
    num_lv: '',
    num_obiettivo_kg: '',
    num_obiettivo_lv: '',
    num_kg_mancanti_ob: '',
    num_perc_mancanti_ob: '',
    flg_escludi: false
  };
  massimaliRecords.value.push(newRow);
};

const duplicaMassimale = (rowIndex) => {
  const original = sortedMassimaliRecords.value[rowIndex];
  if (!original) return;
  const clone = {
    ...original,
    localId: massimaliRecords.value.length + 1,
    dbId: '',
    isNew: true,
    isDirty: false,
    isDeleted: false
  };
  massimaliRecords.value.push(clone);
};

const toggleEliminaMassimale = (rowIndex) => {
  const row = sortedMassimaliRecords.value[rowIndex];
  if (row) {
    if (row.isNew) {
      massimaliRecords.value = massimaliRecords.value.filter(r => r.localId !== row.localId);
    } else {
      row.isDeleted = !row.isDeleted;
    }
  }
};

// Infortuni Actions
const aggiungiInfortuni = () => {
  const oggi = new Date().toISOString().substring(0, 10);
  const newRow = {
    localId: infortuniRecords.value.length + 1,
    dbId: '',
    isDirty: false,
    isNew: true,
    isDeleted: false,
    id_cliente: String(atletaSelezionato.value),
    stato: 'attivo',
    data_inizio: oggi,
    data_risoluzione: '',
    articolazione_coinvolta: '',
    gravita: 'lieve',
    percentuale_riduzione: 20,
    applica_riduzione: true,
    esercizi_originari: '',
    note: ''
  };
  infortuniRecords.value.push(newRow);
};

const toggleEliminaInfortuni = (rowIndex) => {
  const row = sortedInfortuniRecords.value[rowIndex];
  if (row) {
    if (row.isNew) {
      infortuniRecords.value = infortuniRecords.value.filter(r => r.localId !== row.localId);
    } else {
      row.isDeleted = !row.isDeleted;
    }
  }
};

// Aggiunge una riga vuota nello Storyboard
const aggiungiRiga = () => {
  const maxRiga = records.value.reduce((max, r) => {
    const riga = parseInt(r.num_riga) || 0;
    return riga > max ? riga : max;
  }, 0);

  const localId = records.value.length + 1;
  const newRow = {
    localId,
    dbId: '',
    isDirty: false,
    isNew: true,
    isDeleted: false,
    ID_cliente: String(atletaSelezionato.value),
    num_scheda: String(schedaSelezionata.value),
    des_giorno: 'A',
    num_riga_giorno: '1',
    des_esercizio: 'Nuovo Esercizio',
    des_settore_princ: '',
    des_settore: '',
    alf_superserie: '',
    des_qta_report: '',
    des_rec_report: '',
    des_note: '',
    ins_week1: '', ins_week2: '', ins_week3: '', ins_week4: '', ins_week5: '', ins_week6: '',
    reps_week1: '0', reps_week2: '0', reps_week3: '0', reps_week4: '0', reps_week5: '0', reps_week6: '0',
    perc_irt_w1: '0', perc_irt_w2: '0', perc_irt_w3: '0', perc_irt_w4: '0', perc_irt_w5: '0', perc_irt_w6: '0',
    no_elimina: true,
    flg_video: false,
    UrlNormal: '',
    num_riga: String(maxRiga + 1),
    timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
  };
  records.value.push(newRow);
};

// Duplica una riga esistente nello Storyboard
const duplicaRiga = (rowIndex) => {
  const original = sortedRecords.value[rowIndex];
  if (!original) return;
  
  const maxRiga = records.value.reduce((max, r) => {
    const riga = parseInt(r.num_riga) || 0;
    return riga > max ? riga : max;
  }, 0);

  const localId = records.value.length + 1;
  const clone = {
    ...original,
    localId,
    dbId: '',
    isNew: true,
    isDirty: false,
    isDeleted: false,
    num_riga: String(maxRiga + 1)
  };
  records.value.push(clone);
};

// Segna/rimuove flag di cancellazione riga nello Storyboard
const toggleEliminaRiga = (rowIndex) => {
  const row = sortedRecords.value[rowIndex];
  if (row) {
    if (row.isNew) {
      records.value = records.value.filter(r => r.localId !== row.localId);
    } else {
      row.isDeleted = !row.isDeleted;
    }
  }
};

// Annulla tutte le modifiche locali ricaricando da Firebase
const annullaModifiche = async () => {
  await ricaricaTutto();
};

// Salva in blocco (Batch) su Firestore tutte le modifiche (Insert, Update, Delete) su tutte e 5 le collezioni
const salvaModifiche = async () => {
  if (!atletaSelezionato.value) return;
  savingData.value = true;
  
  try {
    // Validazione schede duplicate in WORKOUT_T
    const activeSchede = workoutTRecords.value
      .filter(r => !r.isDeleted)
      .map(r => String(r.num_scheda).trim());
    const duplicates = activeSchede.filter((item, index) => activeSchede.indexOf(item) !== index);
    if (duplicates.length > 0) {
      alert(`Errore: Numero scheda duplicato rilevato in WORKOUT_T: ${duplicates.join(', ')}. Ogni scheda deve avere un numero unico.`);
      savingData.value = false;
      return;
    }

    const batch = writeBatch(db);
    
    // 1. Process STORYBOARD records (only if schedaSelezionata is set)
    if (schedaSelezionata.value) {
      for (const row of records.value) {
        const cleanData = { ...row };
        const dbId = cleanData.dbId;
        
        delete cleanData.dbId;
        delete cleanData.localId;
        delete cleanData.isDirty;
        delete cleanData.isNew;
        delete cleanData.isDeleted;
        
        if (row.isDeleted && dbId) {
          batch.delete(doc(db, 'STORYBOARD', dbId));
        } else if (row.isNew) {
          batch.set(doc(collection(db, 'STORYBOARD')), cleanData);
        } else if (row.isDirty && dbId) {
          batch.set(doc(db, 'STORYBOARD', dbId), cleanData, { merge: true });
        }
      }
    }
    
    // 2. Process WORKOUT_T records
    for (const row of workoutTRecords.value) {
      const cleanData = { ...row };
      const dbId = cleanData.dbId;
      
      delete cleanData.dbId;
      delete cleanData.localId;
      delete cleanData.isDirty;
      delete cleanData.isNew;
      delete cleanData.isDeleted;
      
      const expectedDbId = `${atletaSelezionato.value}_${row.num_scheda}`;
      
      if (row.isDeleted) {
        if (dbId) {
          batch.delete(doc(db, 'WORKOUT_T', dbId));
        }
      } else if (row.isNew) {
        batch.set(doc(db, 'WORKOUT_T', expectedDbId), cleanData);
      } else if (row.isDirty) {
        if (dbId) {
          if (dbId !== expectedDbId) {
            batch.delete(doc(db, 'WORKOUT_T', dbId));
            batch.set(doc(db, 'WORKOUT_T', expectedDbId), cleanData);
          } else {
            batch.set(doc(db, 'WORKOUT_T', dbId), cleanData, { merge: true });
          }
        }
      }
    }

    // 3. Process WOAPP_MASSIMALI_R records
    for (const row of massimaliRecords.value) {
      const cleanData = { ...row };
      const dbId = cleanData.dbId;
      delete cleanData.dbId;
      delete cleanData.localId;
      delete cleanData.isDirty;
      delete cleanData.isNew;
      delete cleanData.isDeleted;
      
      cleanData.flg_rm_teorico = isTrue(cleanData.flg_rm_teorico);
      cleanData.flg_escludi = isTrue(cleanData.flg_escludi);
      
      if (row.isDeleted) {
        if (dbId) batch.delete(doc(db, 'WOAPP_MASSIMALI_R', dbId));
      } else if (row.isNew) {
        batch.set(doc(collection(db, 'WOAPP_MASSIMALI_R')), cleanData);
      } else if (row.isDirty && dbId) {
        batch.set(doc(db, 'WOAPP_MASSIMALI_R', dbId), cleanData, { merge: true });
      }
    }

    // 4. Process CLIENTI record
    if (clienteRecord.value && clienteRecord.value.isDirty) {
      const cleanClient = { ...clienteRecord.value };
      delete cleanClient.isDirty;
      batch.set(doc(db, 'CLIENTI', String(atletaSelezionato.value)), cleanClient, { merge: true });
    }

    // 5. Process INFORTUNI records
    for (const row of infortuniRecords.value) {
      const cleanData = { ...row };
      const dbId = cleanData.dbId;
      delete cleanData.dbId;
      delete cleanData.localId;
      delete cleanData.isDirty;
      delete cleanData.isNew;
      delete cleanData.isDeleted;
      
      if (row.isDeleted) {
        if (dbId) batch.delete(doc(db, 'infortuni', dbId));
      } else if (row.isNew) {
        batch.set(doc(collection(db, 'infortuni')), cleanData);
      } else if (row.isDirty && dbId) {
        batch.set(doc(db, 'infortuni', dbId), cleanData, { merge: true });
      }
    }
    
    await batch.commit();
    console.log("Firebase Batch commit completato con successo per tutte le tabelle!");
    await ricaricaTutto();
  } catch (err) {
    console.error("Errore durante il salvataggio in batch di Firestore:", err);
    alert("Errore durante il salvataggio su Firestore: " + err.message);
  } finally {
    savingData.value = false;
  }
};

// Gestione navigazione Excel con tasti freccia
const handleKeydown = (event, rowIndex, fieldName) => {
  const key = event.key;
  if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) return;
  
  const colIndex = editColumns.indexOf(fieldName);
  let targetRowIndex = rowIndex;
  let targetColIndex = colIndex;
  
  if (key === 'ArrowUp') {
    targetRowIndex = rowIndex - 1;
  } else if (key === 'ArrowDown') {
    targetRowIndex = rowIndex + 1;
  } else if (key === 'ArrowLeft') {
    targetColIndex = colIndex - 1;
  } else if (key === 'ArrowRight') {
    targetColIndex = colIndex + 1;
  }
  
  // Verifica i limiti della griglia
  if (targetRowIndex >= 0 && targetRowIndex < sortedRecords.value.length) {
    if (targetColIndex >= 0 && targetColIndex < editColumns.length) {
      event.preventDefault();
      const targetFieldName = editColumns[targetColIndex];
      const targetRef = inputRefs.value[targetRowIndex]?.[targetFieldName];
      if (targetRef) {
        targetRef.focus();
        targetRef.select(); // Seleziona il testo per editare in stile Excel
      }
    }
  }
};

// Copia/Incolla dati integrato da Microsoft Excel / Google Sheets (Ctrl+V)
const handlePaste = (event) => {
  const clipboardData = event.clipboardData || window.clipboardData;
  const pastedText = clipboardData.getData('text');
  
  // Se non ci sono tabulazioni o ritorni a capo, lascia gestire il paste nativo
  if (!pastedText.includes('\t') && !pastedText.includes('\n')) return;
  
  event.preventDefault();
  
  console.log("Incollamento griglia da Excel rilevato!");
  
  const rowsText = pastedText.split(/\r?\n/);
  const maxRiga = records.value.reduce((max, r) => {
    const riga = parseInt(r.num_riga) || 0;
    return riga > max ? riga : max;
  }, 0);
  
  let newLocalId = records.value.length + 1;
  let rigaCounter = maxRiga + 1;
  
  rowsText.forEach(rowText => {
    if (!rowText.trim()) return;
    const cells = rowText.split('\t');
    
    // Mappa le colonne del file Excel in base all'ordine di visualizzazione
    const newRow = {
      localId: newLocalId++,
      dbId: '',
      isDirty: false,
      isNew: true,
      isDeleted: false,
      ID_cliente: String(atletaSelezionato.value),
      num_scheda: String(schedaSelezionata.value),
      des_giorno: cells[0] ? cells[0].trim().toUpperCase() : 'A',
      num_riga_giorno: cells[1] ? cells[1].trim() : '0',
      des_esercizio: cells[2] ? cells[2].trim() : '',
      des_settore: cells[3] ? cells[3].trim() : '',
      des_settore_princ: cells[4] ? cells[4].trim() : '',
      alf_superserie: cells[5] ? cells[5].trim().toUpperCase() : '',
      des_qta_report: cells[6] ? cells[6].trim() : '',
      des_rec_report: cells[7] ? cells[7].trim() : '',
      des_note: cells[8] ? cells[8].trim() : '',
      ins_week1: cells[9] ? cells[9].trim() : '',
      ins_week2: cells[10] ? cells[10].trim() : '',
      ins_week3: cells[11] ? cells[11].trim() : '',
      ins_week4: cells[12] ? cells[12].trim() : '',
      ins_week5: cells[13] ? cells[13].trim() : '',
      ins_week6: cells[14] ? cells[14].trim() : '',
      num_ins6: cells[15] ? cells[15].trim() : '',
      num_faticaw6: cells[16] ? cells[16].trim() : '',
      num_peso_bilanciere: cells[17] ? cells[17].trim() : '',
      des_commenti: cells[18] ? cells[18].trim() : '',
      des_note_attrezzo: cells[19] ? cells[19].trim() : '',
      des_note_gen_attr: cells[20] ? cells[20].trim() : '',
      UrlNormal: cells[21] ? cells[21].trim() : '',
      no_elimina: cells.length > 24 ? (cells[23] ? cells[23].trim().toLowerCase() === 'true' : true) : (cells[22] ? cells[22].trim().toLowerCase() === 'true' : true),
      flg_video: cells.length > 24 ? (cells[22] ? (cells[22].trim().toLowerCase() === 'true' || cells[22].trim() === '1') : false) : false,
      num_riga: cells.length > 24 ? (cells[24] ? cells[24].trim() : String(rigaCounter++)) : (cells[23] ? cells[23].trim() : String(rigaCounter++)),
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19)
    };
    records.value.push(newRow);
  });
};

// Apri Dialog Dettagli completi per un singolo Record (85 campi)
const apriDettaglio = (row) => {
  selectedRow.value = { ...row };
  selectedRowIndex.value = records.value.findIndex(r => r.localId === row.localId);
  tabDettaglio.value = 'info';
  dialogDettaglioOpen.value = true;
};

// Chiudi Dialog Dettagli e scrivi le modifiche nello stato locale
const chiudiDettaglio = (conferma) => {
  if (conferma && selectedRowIndex.value !== -1) {
    const original = records.value[selectedRowIndex.value];
    
    // Controlla se è cambiato qualcosa per sporcare il record
    let isDifferent = false;
    for (const key of Object.keys(selectedRow.value)) {
      if (selectedRow.value[key] !== original[key]) {
        isDifferent = true;
        break;
      }
    }
    
    if (isDifferent) {
      records.value[selectedRowIndex.value] = {
        ...selectedRow.value,
        isDirty: !original.isNew
      };
    }
  }
  dialogDettaglioOpen.value = false;
  selectedRow.value = null;
  selectedRowIndex.value = -1;
};

// Esportazione del file CSV locale direttamente dal browser (Download istantaneo)
const esportaCSVLocale = () => {
  if (records.value.length === 0) return;
  
  const headersList = [
    "ID_cliente", "num_scheda", "des_giorno", "num_riga_giorno", "des_settore_princ",
    "des_settore", "des_esercizio", "des_esercizio_2", "alf_superserie", "des_qta_report",
    "des_rec_report", "des_week1", "des_week2", "des_week3", "des_week4", "des_week5",
    "des_week6", "ins_week1", "ins_week2", "ins_week3", "ins_week4", "ins_week5",
    "ins_week6", "ins_esercizio", "des_estesa_start", "des_estesa_end", "flg_sic",
    "des_note", "flg_ex_mai_fatto", "flg_escludi_lista_ex_wo_prec", "flg_stampa_wo_grafici",
    "flg_perc", "ind_reps_start", "ind_reps_end", "reps_week1", "reps_week2", "reps_week3",
    "reps_week4", "reps_week5", "reps_week6", "flg_video", "num_lv", "num_kg_mancanti_ob",
    "num_coord_ex_wo_prec", "des_note_attrezzo", "des_note_gen_attr", "perc_irt_w1",
    "perc_irt_w2", "perc_irt_w3", "perc_irt_w4", "perc_irt_w5", "perc_irt_w6", "UrlNormal",
    "num_riga", "no_elimina", "cmp1", "cmp2", "cmp3", "cmp4", "cmp5", "cmp6", "timestamp",
    "num_scheda_ult_ex", "dat_scheda_ult_ex", "num_buffer", "ID_scheda", "num_peso_bilanciere",
    "des_commenti", "des_note_immagine", "num_ins6", "start_wo", "end_wo", "start2_wo",
    "end2_wo", "start3_wo", "end3_wo", "start4_wo", "end4_wo", "start5_wo", "end5_wo",
    "start6_wo", "end6_wo", "num_faticaw6", "UrlNormal", "timestamp_ute"
  ];
  
  // Header line
  const headerLine = headersList.map(h => `"${h}"`).join(';');
  const lines = [headerLine];
  
  // Sort rows before exporting
  const sorted = [...records.value].sort((a, b) => {
    const numA = parseInt(a.num_riga) || 0;
    const numB = parseInt(b.num_riga) || 0;
    return numA - numB;
  });
  
  for (const row of sorted) {
    const cells = headersList.map(h => {
      let val = row[h];
      if (val === undefined || val === null) {
        val = '';
      }
      val = String(val).trim().replace(/"/g, '""');
      return `"${val}"`;
    });
    lines.push(cells.join(';'));
  }
  
  // Aggiunge BOM per compatibilità con Excel in Windows
  const csvContent = '\ufeff' + lines.join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  
  link.setAttribute("href", url);
  link.setAttribute("download", `FLEXCOACH_STORYBOARD_CLI_${atletaSelezionato.value}_SCH_${schedaSelezionata.value}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
</script>

<style scoped>
.max-width-admin {
  max-width: 100%;
  margin: 0 auto;
}

.min-height-screen {
  min-height: calc(100vh - 120px);
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

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* Griglia Excel Style */
.table-container {
  overflow-x: auto;
  overflow-y: auto;
  max-height: calc(100vh - 280px); /* Altezza massima per mantenere la scrollbar orizzontale sempre visibile */
  max-width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  margin-top: 10px;
  position: relative;
}

.excel-table {
  border-collapse: collapse;
  width: 100%;
  font-size: 0.8rem;
  background-color: var(--card-bg-soft);
  table-layout: auto;
}

.excel-table th, 
.excel-table td {
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 0;
  vertical-align: middle;
  height: 38px;
}

.excel-table th {
  background-color: #0f172a;
  color: #cbd5e1;
  font-weight: 800;
  text-align: center;
  padding: 6px 8px;
  position: sticky;
  top: 0;
  z-index: 10;
  white-space: nowrap;
}

/* Input in griglia stile Excel */
.excel-input {
  width: 100%;
  height: 38px;
  border: none;
  background: transparent;
  color: #f8fafc;
  padding: 2px 8px;
  font-family: inherit;
  font-size: inherit;
  outline: none;
  border-radius: 0;
  transition: all 0.15s ease;
}

.excel-input:focus {
  background-color: rgba(249, 115, 22, 0.08);
  box-shadow: inset 0 0 0 1.5px #f97316;
}

/* Classi di stato righe */
.row-dirty {
  background-color: rgba(249, 115, 22, 0.03) !important;
}
.row-dirty td {
  border-color: rgba(249, 115, 22, 0.15) !important;
}

.row-new {
  background-color: rgba(74, 222, 128, 0.04) !important;
}
.row-new td {
  border-color: rgba(74, 222, 128, 0.18) !important;
}

.row-deleted {
  background-color: rgba(239, 68, 68, 0.08) !important;
  text-decoration: line-through;
  opacity: 0.5;
}

/* Colonne Congelate a sinistra per Mobile & Desktop Scroll */
.sticky-col {
  position: sticky;
  background-color: #0b0f19;
  z-index: 5;
}

.excel-table th.sticky-col {
  z-index: 15; /* Più alto per impedire sovrapposizioni tra scroll verticale e orizzontale */
  background-color: #0f172a;
}

.col-actions {
  left: 0;
  width: 80px;
  min-width: 80px;
  text-align: center;
}

.col-giorno {
  left: 80px;
  width: 50px;
  min-width: 50px;
  text-align: center;
}

/* Colori e larghezze delle colonne */
.col-riga {
  width: 50px;
  min-width: 50px;
  left: 130px;
}
.col-esercizio {
  width: 300px;
  min-width: 300px;
  left: 180px;
}
.col-settore { min-width: 120px; }
.col-settore-princ { min-width: 120px; }
.col-superserie { width: 40px; min-width: 40px; }
.col-qta { min-width: 90px; }
.col-rec { min-width: 90px; }
.col-note { min-width: 200px; }
.col-week { width: 80px; min-width: 80px; }
.col-ins6 { width: 65px; min-width: 65px; }
.col-fatica { width: 85px; min-width: 85px; }
.col-peso-bil { width: 75px; min-width: 75px; }
.col-commenti { min-width: 200px; width: 250px; }
.col-note-attr { min-width: 200px; width: 250px; }
.col-note-gen-attr { min-width: 200px; width: 250px; }
.col-url { min-width: 180px; }
.col-video { width: 70px; min-width: 70px; }
.col-elimina { width: 70px; min-width: 70px; }
.col-id { width: 80px; min-width: 80px; }
.col-timestamp-ute { width: 140px; min-width: 140px; }

/* Barra azioni fluttuante in basso */
.action-bar-floating {
  position: fixed;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 900px;
  z-index: 100;
  display: flex;
  align-items: center;
  border: 1px solid rgba(249, 115, 22, 0.45) !important;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(249, 115, 22, 0.22) !important;
  animation: floating-glow 2.5s infinite alternate;
}

@keyframes floating-glow {
  0% { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 10px rgba(249, 115, 22, 0.1) !important; }
  100% { box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6), 0 0 25px rgba(249, 115, 22, 0.3) !important; }
}

.animate-spin {
  animation: spin 1.2s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.gap-2 { gap: 8px; }
.gap-3 { gap: 12px; }
.gap-1 { gap: 4px; }

/* Mobile design */
@media (max-width: 959px) {
  .max-width-admin {
    padding-bottom: 120px !important;
  }
  
  .table-container {
    max-height: calc(100vh - 360px);
  }
}

.border-right-md {
  border-right: none;
}
@media (min-width: 960px) {
  .border-right-md {
    border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
  }
}
.border-soft {
  border-color: rgba(255, 255, 255, 0.08) !important;
}

/* WORKOUT_T Columns widths */
.col-wt-scheda { width: 80px; min-width: 80px; }
.col-wt-date { width: 110px; min-width: 110px; }
.col-wt-desc { min-width: 180px; width: 220px; }
.col-wt-note { min-width: 200px; width: 250px; }
.col-wt-flag { width: 90px; min-width: 90px; }
.col-wt-number { width: 80px; min-width: 80px; }
.col-wt-code { width: 90px; min-width: 90px; }
.col-wt-id { width: 100px; min-width: 100px; }
.col-wt-giorno { width: 80px; min-width: 80px; }
.col-wt-url { min-width: 180px; width: 220px; }
.col-wt-nome { min-width: 150px; width: 180px; }

/* MASSIMALI (WOAPP_MASSIMALI_R) Columns widths */
.col-mas-data { width: 110px; min-width: 110px; }
.col-mas-ex { min-width: 180px; width: 220px; }
.col-mas-id { width: 75px; min-width: 75px; }
.col-mas-kg { width: 100px; min-width: 100px; }
.col-mas-flag { width: 85px; min-width: 85px; }
.col-mas-note { min-width: 180px; width: 220px; }
.col-mas-num { width: 90px; min-width: 90px; }

/* INFORTUNI Columns widths */
.col-inf-stato { width: 100px; min-width: 100px; }
.col-inf-data { width: 120px; min-width: 120px; }
.col-inf-zona { min-width: 150px; width: 180px; }
.col-inf-gravita { width: 110px; min-width: 110px; }
.col-inf-num { width: 100px; min-width: 100px; }
.col-inf-flag { width: 90px; min-width: 90px; }
.col-inf-ex { min-width: 160px; width: 200px; }
.col-inf-note { min-width: 180px; width: 220px; }


:deep([data-theme="light"]) .text-slate-dark,
[data-theme="light"] .text-slate-dark {
  color: #0f172a !important;
}

:deep([data-theme="light"]) .text-slate,
[data-theme="light"] .text-slate {
  color: #334155 !important;
}

:deep([data-theme="light"]) .v-btn-toggle .v-btn:not(.v-btn--active):not(.v-item--active) {
  color: #0f172a !important;
  background-color: #f8fafc !important;
}

:deep([data-theme="light"]) .v-btn-toggle .v-btn.v-btn--active,
:deep([data-theme="light"]) .v-btn-toggle .v-btn.v-item--active,
:deep([data-theme="light"]) .v-btn-toggle .v-btn.v-btn--selected {
  color: #ffffff !important;
  background-color: var(--brand-accent, #ea580c) !important;
}

/* Light Theme Overrides for Spreadsheet Table */
:deep([data-theme="light"]) .excel-table,
[data-theme="light"] .excel-table {
  background-color: #ffffff !important;
  color: #0f172a !important;
}

:deep([data-theme="light"]) .excel-table th {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
  border-color: #cbd5e1 !important;
}

:deep([data-theme="light"]) .excel-table td {
  border-color: #e2e8f0 !important;
}

:deep([data-theme="light"]) .excel-input {
  color: #0f172a !important;
}

:deep([data-theme="light"]) .sticky-col {
  background-color: #f8fafc !important;
}

:deep([data-theme="light"]) .excel-table th.sticky-col {
  background-color: #f1f5f9 !important;
}

/* Compact Form Inputs for Mobile */
:deep(.v-field--density-compact) {
  --v-field-padding-start: 8px !important;
  --v-field-padding-end: 8px !important;
  --v-field-padding-top: 2px !important;
  --v-field-padding-bottom: 2px !important;
  min-height: 34px !important;
}

:deep(.v-field__input) {
  min-height: 34px !important;
  padding-top: 2px !important;
  padding-bottom: 2px !important;
  font-size: 0.78rem !important;
}

:deep(.v-input__details) {
  display: none !important;
}
</style>
