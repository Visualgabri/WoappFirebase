<template>
  <v-container class="px-4 py-6 max-width-admin min-height-screen pb-12">
    <!-- Header Premium -->
    <div class="premium-header card-glass rounded-2xl d-flex flex-wrap align-center justify-space-between elevation-2 border-bottom-soft pa-4 mb-6">
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-transparent border-orange elevation-1 profile-avatar">
          <v-img src="/logo.png" alt="WoApp Logo"></v-img>
        </v-avatar>
        <div class="text-left">
          <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight leading-tight">Pannello Controllo Coach 📋</h1>
          <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.62rem; letter-spacing: 0.05em;">Gestione Database & Excel Editor</span>
        </div>
      </div>
      <div class="d-flex align-center gap-2 mt-2 mt-sm-0">
        <v-btn to="/" color="slate" variant="outlined" rounded="lg" size="small" class="mr-2">
          <v-icon size="16" class="mr-1">mdi-arrow-left</v-icon>
          Torna all'App
        </v-btn>
        <v-btn icon color="orange-darken-3" variant="text" @click="caricaDati" size="small" :disabled="loadingData">
          <v-icon :class="{ 'animate-spin': loadingData }">mdi-refresh</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- SELETTORE CLIENTE & SCHEDA -->
    <v-card class="premium-card rounded-2xl text-left border pa-5 mb-5" elevation="2">
      <v-row>
        <!-- Tipo di Dati da Caricare -->
        <v-col cols="12" sm="6" :md="tipoDatiCaricare === 'storyboard' ? 3 : 4">
          <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Tipo Dati</span>
          <v-btn-toggle
            v-model="tipoDatiCaricare"
            mandatory
            color="orange-darken-3"
            variant="outlined"
            class="d-flex w-100 mt-1"
            style="height: 56px; border-radius: 8px;"
            @update:model-value="gestisciCambioTipoDati"
          >
            <v-btn value="storyboard" class="flex-grow-1 font-weight-bold text-caption text-slate" style="height: 100%;">
              <v-icon start size="18">mdi-format-list-bulleted</v-icon>
              Storyboard
            </v-btn>
            <v-btn value="workout_t" class="flex-grow-1 font-weight-bold text-caption text-slate" style="height: 100%;">
              <v-icon start size="18">mdi-calendar-month</v-icon>
              Workout T
            </v-btn>
          </v-btn-toggle>
        </v-col>

        <!-- Atleta -->
        <v-col cols="12" sm="6" :md="tipoDatiCaricare === 'storyboard' ? 4 : 5">
          <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Atleta</span>
          <v-autocomplete
            v-model="atletaSelezionato"
            :items="itemsAtleti"
            item-title="title"
            item-value="value"
            label="Seleziona Atleta..."
            variant="outlined"
            rounded="lg"
            color="orange-darken-3"
            prepend-inner-icon="mdi-account"
            hide-details
            class="mt-1"
            @update:model-value="gestisciCambioAtleta"
          ></v-autocomplete>
        </v-col>

        <!-- Scheda (Mesociclo) - Solo per Storyboard -->
        <v-col v-if="tipoDatiCaricare === 'storyboard'" cols="12" sm="6" md="3">
          <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Scheda (Mesociclo)</span>
          <v-select
            v-model="schedaSelezionata"
            :items="listaSchede"
            label="Scegli Scheda..."
            variant="outlined"
            rounded="lg"
            color="orange-darken-3"
            prepend-inner-icon="mdi-clipboard-text-outline"
            hide-details
            class="mt-1"
            :disabled="!atletaSelezionato || loadingSchede"
            @update:model-value="caricaEsercizi"
          ></v-select>
        </v-col>

        <!-- Pulsante Caricamento Dati -->
        <v-col cols="12" sm="6" :md="tipoDatiCaricare === 'storyboard' ? 2 : 3" class="d-flex align-end">
          <v-btn
            color="orange-darken-3"
            block
            rounded="lg"
            class="text-white font-weight-bold"
            style="height: 56px;"
            :disabled="!atletaSelezionato || (tipoDatiCaricare === 'storyboard' && !schedaSelezionata)"
            @click="caricaEsercizi"
          >
            <v-icon class="mr-1">mdi-cloud-download</v-icon>
            CARICA DATI
          </v-btn>
        </v-col>
      </v-row>
    </v-card>

    <!-- SEZIONE PARAMETRI ALGORITMO COACH (Mostrata sempre) -->
    <v-card class="premium-card rounded-2xl text-left border pa-5 mb-5" elevation="2">
      <div class="d-flex align-center mb-4">
        <v-icon color="orange-darken-3" class="mr-2.5" size="26">mdi-cog-outline</v-icon>
        <div>
          <h3 class="text-h6 font-weight-black text-slate-dark">Configurazione Algoritmo Progressioni ⚙️</h3>
          <span class="text-caption text-muted">Personalizza le regole di proposta carico e le riduzioni per sforzo/fatica (comuni a tutti gli atleti).</span>
        </div>
      </div>

      <v-row>
        <!-- Colonna sinistra: Parametri Proposta Carico -->
        <v-col cols="12" md="6" class="border-right-md">
          <div class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-3">
            🎯 Regole & Settimane di Riferimento
          </div>
          
          <v-row dense>
            <!-- W2 -->
            <v-col cols="12" sm="4">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Rif. Proposta W2</span>
              <v-select
                v-model="propostaBaseWeek2"
                :items="['W1', 'W2']"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
                class="mt-1"
              ></v-select>
            </v-col>
            
            <!-- W5 -->
            <v-col cols="12" sm="4">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Rif. Proposta W5</span>
              <v-select
                v-model="propostaBaseWeek5"
                :items="['W3', 'W4', 'W5']"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
                class="mt-1"
              ></v-select>
            </v-col>

            <!-- W6 -->
            <v-col cols="12" sm="4">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Rif. Proposta W6</span>
              <v-select
                v-model="propostaBaseWeek6"
                :items="['W5', 'W6']"
                variant="outlined"
                density="compact"
                color="orange-darken-3"
                rounded="lg"
                hide-details
                class="mt-1"
              ></v-select>
            </v-col>

            <!-- Regola Progressione W2 & Ottimizzazione Note -->
            <v-col cols="12" sm="6" class="mt-2">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Progressione Week 2</span>
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
                class="mt-1"
              ></v-select>
            </v-col>

            <v-col cols="12" sm="6" class="d-flex align-center mt-4">
              <v-switch
                v-model="ottimizzaDigitazione"
                color="orange-darken-3"
                hide-details
                density="compact"
                class="mr-2"
              ></v-switch>
              <div class="text-left">
                <span class="text-caption font-weight-bold text-white d-block" style="font-size: 0.72rem; line-height: 1.1;">Ottimizza Note (.lazy)</span>
                <span class="text-super-caption text-muted d-block" style="font-size: 0.58rem; text-transform: none; line-height: 1.2;">Evita rallentamenti durante la digitazione</span>
              </div>
            </v-col>
          </v-row>

          <v-divider class="my-4 border-soft"></v-divider>

          <div class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-3">
            ⚖️ Incrementi Post-Scarico & Manubri
          </div>
          
          <v-row dense>
            <!-- Inc. Post Scarico -->
            <v-col cols="12" sm="6">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Post Scarico %</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>

            <!-- Soglia Manubri Forte -->
            <v-col cols="12" sm="6">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Soglia Manubri Forte</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>

            <!-- Inc. Manubri Leggero -->
            <v-col cols="12" sm="6" class="mt-2">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Inc. Manubri Leggero</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>

            <!-- Inc. Manubri Forte -->
            <v-col cols="12" sm="6" class="mt-2">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Inc. Manubri Forte</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>
          </v-row>
        </v-col>

        <!-- Colonna destra: Regolazione Sforzo/Fatica -->
        <v-col cols="12" md="6">
          <div class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-3">
            📉 Riduzioni Fatica Muscolare Week 1 (W1)
          </div>
          
          <v-row dense>
            <!-- Pesante W1 -->
            <v-col cols="12" sm="6">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Fatica Pesante W1 %</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>

            <!-- Devastante W1 -->
            <v-col cols="12" sm="6">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Fatica Devastante W1 %</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4 border-soft"></v-divider>

          <div class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-3">
            📚 Riduzioni Fatica da Storico (Deallenamento)
          </div>

          <v-row dense>
            <!-- Pesante Storico -->
            <v-col cols="12" sm="6">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Fatica Pesante Storico %</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>

            <!-- Devastante Storico -->
            <v-col cols="12" sm="6">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Fatica Devastante Storico %</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-divider class="my-4 border-soft"></v-divider>

          <div class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-3">
            ⏱️ Deallenamento & Sbalzi di Reps
          </div>

          <v-row dense>
            <!-- Soglia 1 -->
            <v-col cols="12" sm="6" md="3">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Soglia 1 (gg)</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>
            <!-- Pct 1 -->
            <v-col cols="12" sm="6" md="3">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Riduzione 1 (%)</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>

            <!-- Soglia 2 -->
            <v-col cols="12" sm="6" md="3">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Soglia 2 (gg)</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>
            <!-- Pct 2 -->
            <v-col cols="12" sm="6" md="3">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Riduzione 2 (%)</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>
          </v-row>

          <v-row dense class="mt-2">
            <!-- Soglia 3 -->
            <v-col cols="12" sm="6" md="3">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Soglia 3 (gg)</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>
            <!-- Pct 3 -->
            <v-col cols="12" sm="6" md="3">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Riduzione 3 (%)</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>

            <!-- Soglia 4 -->
            <v-col cols="12" sm="6" md="3">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Soglia 4 (gg)</span>
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
                class="mt-1"
              ></v-text-field>
            </v-col>
            <!-- Pct 4 -->
            <v-col cols="12" sm="6" md="3">
              <span class="text-super-caption text-muted font-weight-black uppercase tracking-wider" style="font-size: 0.58rem;">Riduzione 4 (%)</span>
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
                class="mt-1"
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
          <span class="text-caption text-muted d-block mt-0.5">
            Client ID: <strong>{{ atletaSelezionato }}</strong>
          </span>
        </div>
        <div class="d-flex align-center gap-2 mt-2 mt-sm-0">
          <v-btn color="orange-darken-4" size="small" variant="outlined" rounded="lg" @click="mostraIstruzioni = true" class="mr-2">
            <v-icon size="16" class="mr-1">mdi-help-circle-outline</v-icon>
            Scorciatoie Excel
          </v-btn>
          <v-btn v-if="activeTab === 'storyboard' && schedaSelezionata" color="blue-darken-3" size="small" variant="flat" rounded="lg" @click="esportaCSVLocale" class="text-white">
            <v-icon size="16" class="mr-1">mdi-download</v-icon>
            Download CSV
          </v-btn>
        </div>
      </div>

      <!-- TABS PER SWITCHARE TRA STORYBOARD E WORKOUT_T -->
      <v-tabs v-model="activeTab" color="orange-darken-3" class="mb-4">
        <v-tab value="storyboard" class="font-weight-black">
          <v-icon start>mdi-format-list-bulleted</v-icon>
          Storyboard (Esercizi)
          <v-chip size="x-small" class="ml-2 font-weight-bold" color="orange" variant="flat" v-if="records.length > 0">
            {{ records.length }}
          </v-chip>
        </v-tab>
        <v-tab value="workout_t" class="font-weight-black">
          <v-icon start>mdi-calendar-month</v-icon>
          Workout T (Mesocicli)
          <v-chip size="x-small" class="ml-2 font-weight-bold" color="blue" variant="flat" v-if="workoutTRecords.length > 0">
            {{ workoutTRecords.length }}
          </v-chip>
        </v-tab>
      </v-tabs>

      <!-- TAB STORYBOARD -->
      <div v-show="activeTab === 'storyboard'">
        <!-- Nessuna scheda selezionata -->
        <div v-if="!schedaSelezionata" class="text-center py-12 border-dashed rounded-xl my-4">
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

      <!-- TAB WORKOUT_T -->
      <div v-show="activeTab === 'workout_t'">
        <!-- Spinner Caricamento -->
        <div v-if="loadingWorkoutT" class="text-center my-12 py-12">
          <v-progress-circular indeterminate color="blue" size="48"></v-progress-circular>
          <p class="mt-4 text-slate text-body-2">Caricamento record WORKOUT_T...</p>
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
            * I record di WORKOUT_T definiscono le impostazioni generali, la data di inizio e la scadenza di ciascun mesociclo.
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
  ottimizzaDigitazioneGlobal,
  regolaProgressioneW2Global,
  deallenamentoSoglia1Global,
  deallenamentoSoglia2Global,
  deallenamentoSoglia3Global,
  deallenamentoSoglia4Global,
  deallenamentoPct1Global,
  deallenamentoPct2Global,
  deallenamentoPct3Global,
  deallenamentoPct4Global
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
const ottimizzaDigitazione = ottimizzaDigitazioneGlobal;
const regolaProgressioneW2 = regolaProgressioneW2Global;
const DEALLENAMENTO_SOGLIA1 = deallenamentoSoglia1Global;
const DEALLENAMENTO_SOGLIA2 = deallenamentoSoglia2Global;
const DEALLENAMENTO_SOGLIA3 = deallenamentoSoglia3Global;
const DEALLENAMENTO_SOGLIA4 = deallenamentoSoglia4Global;
const DEALLENAMENTO_PCT1 = deallenamentoPct1Global;
const DEALLENAMENTO_PCT2 = deallenamentoPct2Global;
const DEALLENAMENTO_PCT3 = deallenamentoPct3Global;
const DEALLENAMENTO_PCT4 = deallenamentoPct4Global;

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
    // Gestione righe contrassegnate per eliminazione (mantengono l'ordine ma con classe css barrata)
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

// Verifica se ci sono modifiche pendenti non salvate
const haModifiche = computed(() => {
  return records.value.some(r => r.isDirty || r.isNew || r.isDeleted) ||
         workoutTRecords.value.some(r => r.isDirty || r.isNew || r.isDeleted);
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
  // Carica anagrafica clienti
  try {
    const docSnap = await getDoc(doc(db, 'METADATA', 'clienti'));
    if (docSnap.exists()) {
      listaAtleti.value = docSnap.data().lista || [];
    }
  } catch (err) {
    console.error("Errore lettura METADATA clienti:", err);
  }

  // Pre-popola l'atleta attivo se impostato
  if (selectedAthlete.value) {
    atletaSelezionato.value = selectedAthlete.value;
    await caricaSchedeAtleta();
  }
});

// Watcher per allineare l'atleta e la scheda selezionati localmente con lo stato globale
watch(atletaSelezionato, (newVal) => {
  if (newVal && newVal !== selectedAthlete.value) {
    setSelectedAthlete(newVal);
  }
});

watch(schedaSelezionata, (newVal) => {
  if (newVal && newVal !== selectedSheet.value) {
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
    snap.forEach(doc => {
      const data = doc.data();
      if (data.num_scheda) {
        setSchede.add(data.num_scheda.trim());
      }
    });
    listaSchede.value = Array.from(setSchede).sort((a, b) => Number(a) - Number(b));
    
    // Auto-seleziona la scheda precedentemente salvata globalmente o l'ultima disponibile
    if (listaSchede.value.length > 0) {
      if (selectedSheet.value && listaSchede.value.includes(String(selectedSheet.value).trim())) {
        schedaSelezionata.value = String(selectedSheet.value).trim();
      } else {
        schedaSelezionata.value = listaSchede.value[listaSchede.value.length - 1];
      }
    } else {
      // Carica comunque WORKOUT_T se lo storyboard è vuoto per questo atleta
      await caricaWorkoutT();
    }
  } catch (err) {
    console.error("Errore caricamento schede:", err);
  } finally {
    loadingSchede.value = false;
  }
};

const gestisciCambioAtleta = async () => {
  schedaSelezionata.value = '';
  records.value = [];
  workoutTRecords.value = [];
  if (tipoDatiCaricare.value === 'storyboard') {
    await caricaSchedeAtleta();
  } else {
    await caricaWorkoutT();
  }
};

// Carica tutti i record di WORKOUT_T relativi a cliente
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
    
    snap.forEach(doc => {
      temp.push({
        dbId: doc.id,
        localId: localIdCounter++,
        isDirty: false,
        isNew: false,
        isDeleted: false,
        ...doc.data()
      });
    });
    
    workoutTRecords.value = temp;
  } catch (err) {
    console.error("Errore caricamento WORKOUT_T da Firestore:", err);
  } finally {
    loadingWorkoutT.value = false;
  }
};

// Carica tutti i record (sia WORKOUT_T che STORYBOARD) dopo salvataggio/annullamento
const ricaricaTutto = async () => {
  if (!atletaSelezionato.value) return;
  
  await caricaWorkoutT();
  
  if (schedaSelezionata.value) {
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
      snap.forEach(doc => {
        temp.push({
          dbId: doc.id,
          localId: localIdCounter++,
          isDirty: false,
          isNew: false,
          isDeleted: false,
          ...doc.data()
        });
      });
      records.value = temp;
    } catch (err) {
      console.error("Errore ricaricamento esercizi:", err);
    } finally {
      loadingData.value = false;
    }
  }
};

// Carica i record in base alla selezione del filtro
const caricaEsercizi = async () => {
  if (!atletaSelezionato.value) return;
  
  if (tipoDatiCaricare.value === 'workout_t') {
    await caricaWorkoutT();
  } else {
    if (!schedaSelezionata.value) return;
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
      
      snap.forEach(doc => {
        temp.push({
          dbId: doc.id,
          localId: localIdCounter++,
          isDirty: false,
          isNew: false,
          isDeleted: false,
          ...doc.data()
        });
      });
      
      records.value = temp;
    } catch (err) {
      console.error("Errore caricamento esercizi da Firestore:", err);
    } finally {
      loadingData.value = false;
    }
  }
};

// Segna la riga come modificata ("dirty")
const segnaModificato = (row) => {
  if (!row.isNew) {
    row.isDirty = true;
  }
};

const segnaModificatoWT = (row) => {
  if (!row.isNew) {
    row.isDirty = true;
  }
};

// Aggiunge un mesociclo in WORKOUT_T
const aggiungiWorkoutT = () => {
  const maxScheda = workoutTRecords.value.reduce((max, r) => {
    const s = parseInt(r.num_scheda) || 0;
    return s > max ? s : max;
  }, 0);

  const localId = workoutTRecords.value.length + 1;
  
  // Calcolo delle date di default: oggi e oggi + 42 giorni
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

// Duplica un mesociclo in WORKOUT_T
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

// Segna/rimuove flag di cancellazione riga in WORKOUT_T
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

// Aggiunge una riga vuota
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

// Duplica una riga esistente
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
    dbId: '', // Pulisci ID database per forzare creazione
    isNew: true,
    isDirty: false,
    isDeleted: false,
    num_riga: String(maxRiga + 1)
  };
  records.value.push(clone);
};

// Segna/rimuove flag di cancellazione riga
const toggleEliminaRiga = (rowIndex) => {
  const row = sortedRecords.value[rowIndex];
  if (row) {
    if (row.isNew) {
      // Se è un record appena creato locale, lo togliamo direttamente dall'array
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

// Salva in blocco (Batch) su Firestore tutte le modifiche (Insert, Update, Delete)
const salvaModifiche = async () => {
  if (!atletaSelezionato.value) return;
  savingData.value = true;
  
  try {
    // Validation for WORKOUT_T duplicate cards
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
    
    // Process STORYBOARD records (only if schedaSelezionata is set)
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
    
    // Process WORKOUT_T records
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
    
    await batch.commit();
    console.log("Firebase Batch commit completato con successo!");
    await ricaricaTutto(); // Ricarica i dati freschi da Firestore
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
</style>
