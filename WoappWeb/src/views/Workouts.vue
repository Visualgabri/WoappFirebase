<template>
  <v-container class="px-3 py-6 max-width-container min-height-screen">
    <!-- Header Premium -->
    <div class="appsheet-header mb-6 d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-avatar size="44" class="mr-3 bg-transparent border-orange elevation-1">
          <v-img src="/logo.png" alt="WoApp Logo"></v-img>
        </v-avatar>
        <div class="text-left d-flex flex-column align-start" style="gap: 4px;">
          <h1 class="text-h5 font-weight-black text-slate-dark tracking-tight mb-0" style="line-height: 1;">WORKOUTS</h1>
          <div class="d-flex align-center flex-wrap gap-1.5 mt-0.5" v-if="atletaSelezionato && schedaSelezionata">
            <v-chip
              color="orange-darken-3"
              size="x-small"
              class="font-weight-black uppercase px-2 py-0.5 text-white elevation-1"
              variant="flat"
              style="font-size: 0.62rem; letter-spacing: 0.02em; height: 20px;"
            >
              👤 {{ getNomeAtleta(atletaSelezionato) }} • Scheda {{ schedaSelezionata }}
            </v-chip>
            
            <v-chip
              v-if="allineamentoProgramma"
              :color="allineamentoProgramma.status === 'in-linea' ? 'green-darken-3' : (allineamentoProgramma.status === 'ritardo' ? 'red-darken-3' : 'blue-darken-3')"
              size="x-small"
              class="font-weight-black px-2 py-0.5 text-white elevation-1"
              variant="flat"
              style="font-size: 0.62rem; letter-spacing: 0.02em; height: 20px;"
            >
              <v-icon size="11" class="mr-1">
                {{ allineamentoProgramma.status === 'in-linea' ? 'mdi-check-circle' : (allineamentoProgramma.status === 'ritardo' ? 'mdi-alert-circle' : 'mdi-trending-up') }}
              </v-icon>
              {{ allineamentoProgramma.status === 'in-linea' ? 'IN LINEA' : (allineamentoProgramma.status === 'ritardo' ? 'RITARDO W' + allineamentoProgramma.deltaAbs : 'ANTICIPO W' + allineamentoProgramma.deltaAbs) }}
            </v-chip>
          </div>
        </div>
      </div>
      <div class="header-actions">
        <v-btn icon color="slate-dark" variant="text" @click="caricaAllenamenti"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>
    </div>

    <!-- Stato vuoto se non selezionati atleta e scheda -->
    <div v-if="!atletaSelezionato || !schedaSelezionata" class="empty-state text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="80" color="orange-lighten-3" class="mb-4 animate-bounce">mdi-clipboard-text-search-outline</v-icon>
      <h3 class="text-h5 font-weight-bold text-slate-dark">Seleziona Atleta e Scheda</h3>
      <p class="text-body-1 text-muted mt-2">
        Scegli l'atleta e la scheda attiva nella scheda **Ricerca Wo** per sbloccare la lista allenamenti.
      </p>
      <v-btn to="/ricerca" color="orange-darken-3" class="font-weight-bold text-none mt-6" rounded="lg">
        Vai a Ricerca Wo
      </v-btn>
    </div>

    <!-- Contenuto Principale -->
    <div v-else>
      
      <!-- Sticky wrapper for the day selector tabs -->
      <div
        class="sticky-tabs-container mb-4"
        :style="{ top: utente ? '48px' : '0px' }"
      >
        <div 
          v-if="!caricamento && listaGiorniDisponibili.length > 0"
          class="card-glass rounded-xl py-1 mb-1.5 text-center font-weight-black tracking-widest"
          style="font-size: 0.62rem; border: 1px solid rgba(255, 255, 255, 0.05); color: rgba(255, 255, 255, 0.6);"
        >
          <span style="color: #f97316;">SETTIMANA CORRENTE:</span>
          <span class="text-white ml-1.5">WEEK {{ settimanaAttiva }}</span>
        </div>

        <!-- Skeleton tabs durante il caricamento per evitare sflash dei giorni A B C D -->
        <div v-if="caricamento" class="card-glass rounded-xl elevation-1 d-flex justify-space-around align-center" style="height: 48px;">
          <div class="skeleton-tab-item"></div>
          <div class="skeleton-tab-item"></div>
          <div class="skeleton-tab-item"></div>
        </div>

        <v-tabs
          v-else
          v-model="giornoSelezionato"
          color="orange-darken-3"
          align-tabs="center"
          grow
          hide-slider
          class="card-glass rounded-xl elevation-1"
          @update:model-value="salvaGiornoSelezionato"
          style="height: 62px;"
        >
          <v-tab v-for="giorno in listaGiorniDisponibili" :key="giorno" :value="giorno" class="px-2" style="height: 62px;">
            <div class="d-flex flex-column align-center justify-center py-1 w-100">
              <div class="d-flex align-center">
                <span class="font-weight-black text-h6" style="line-height: 1.1;">{{ giorno }}</span>
                <v-icon
                  v-if="statoGiorni[giorno] === 'completed'"
                  color="green-accent-4"
                  size="14"
                  class="ml-1"
                >
                  mdi-check-bold
                </v-icon>
                <v-icon
                  v-else-if="statoGiorni[giorno] === 'pending'"
                  color="orange-darken-3"
                  size="13"
                  class="ml-1 pulse-active-tab-icon"
                >
                  mdi-flash
                </v-icon>
              </div>
              <span 
                v-if="ultimoChiusoPerGiorno(giorno)" 
                class="text-super-caption font-weight-bold text-grey-lighten-1" 
                style="font-size: 0.62rem; margin-top: 1.5px; line-height: 1; opacity: 0.85;"
              >
                {{ ultimoChiusoPerGiorno(giorno) }}
              </span>
              <!-- Mini barra di avanzamento del giorno -->
              <div class="day-tab-progress-bg mt-1" style="width: 75%; height: 3px; background: rgba(255, 255, 255, 0.08); border-radius: 2px; overflow: hidden;">
                <div 
                  class="day-tab-progress-fill"
                  :style="{ 
                    width: getProgressoGiorno(giorno).percentuale + '%', 
                    height: '100%', 
                    background: getProgressoGiorno(giorno).percentuale === 100 ? 'linear-gradient(90deg, #4ade80, #22c55e)' : 'linear-gradient(90deg, #f97316, #ff8f00)',
                    transition: 'width 0.3s ease'
                  }"
                ></div>
              </div>
            </div>
          </v-tab>
        </v-tabs>
      </div>

      <!-- Indicatore di Caricamento -->
      <div v-if="caricamento" class="text-center my-10">
        <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
        <p class="mt-2 text-caption text-muted">Caricamento esercizi giorno {{ giornoSelezionato }}...</p>
      </div>

      <div v-else>
        <!-- Banner Celebrativo Mesociclo Completato -->
        <v-card
          v-if="mesocicloCompletato"
          class="py-4 px-5 mb-5 text-left border position-relative overflow-hidden"
          style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(52, 211, 153, 0.05)) !important; border: 1.5px solid rgba(16, 185, 129, 0.4) !important; box-shadow: 0 8px 32px rgba(16, 185, 129, 0.15) !important; border-radius: 16px !important;"
        >
          <div class="d-flex align-start">
            <v-icon color="green-accent-4" class="mr-3 mt-1 flex-shrink-0 animate-bounce" size="32">mdi-trophy</v-icon>
            <div class="flex-grow-1">
              <h3 class="text-subtitle-1 font-weight-black text-green-lighten-2 mb-1" style="font-size: 1.05rem;">
                🎉 Congratulazioni! Mesociclo Completato!
              </h3>
              <p class="text-slate font-weight-medium mb-3" style="font-size: 0.75rem; line-height: 1.45; color: #cbd5e1 !important;">
                Hai chiuso con successo tutte le 6 settimane di allenamento per tutti i giorni della scheda. Ottimo lavoro!
              </p>
              <div class="d-flex gap-3 flex-wrap">
                <v-btn
                  to="/ricerca"
                  variant="outlined"
                  color="green-lighten-3"
                  size="small"
                  class="font-weight-black text-none card-glass"
                  rounded="lg"
                  id="btn-prossima-scheda"
                >
                  📋 Prossima Scheda
                </v-btn>
                <v-btn
                  variant="flat"
                  color="green-darken-3"
                  size="small"
                  class="font-weight-black text-none text-white"
                  rounded="lg"
                  @click="dialogProgressioni = true"
                  id="btn-riepilogo-progressioni"
                >
                  📈 Riepilogo Progressioni
                </v-btn>
              </div>
            </div>
          </div>
        </v-card>

        <transition :name="transitionName" mode="out-in">
          <div :key="giornoSelezionato" class="swipe-transition-wrapper">
            <!-- Pannello Esercizi da Recuperare (Accordion per giorno) -->
            <v-expand-transition>
              <div v-if="eserciziDaRecuperare.length > 0" class="mb-6">
                <v-card
                  class="pa-4 rounded-2xl border"
                  style="background: linear-gradient(135deg, rgba(234, 88, 12, 0.1), rgba(249, 115, 22, 0.03)) !important; border: 1.5px solid rgba(249, 115, 22, 0.3) !important; box-shadow: 0 8px 32px rgba(0, 0, 0, 0.25) !important;"
                >
                  <!-- Header Globale -->
                  <div class="d-flex align-center justify-space-between mb-3">
                    <div class="d-flex align-center">
                      <v-icon color="orange-darken-3" class="mr-1.5 animate-pulse" size="14">mdi-sync</v-icon>
                      <span class="font-weight-black text-orange-lighten-2" style="letter-spacing: 0.03em; font-size: 0.72rem !important;">
                        🔁 ESERCIZI DA RECUPERARE
                      </span>
                    </div>
                    <v-chip color="orange-darken-3" size="x-small" class="font-weight-black text-white px-2" variant="flat" style="height: 18px; font-size: 0.58rem;">
                      {{ eserciziDaRecuperare.length }} TOTALI
                    </v-chip>
                  </div>

                  <!-- Accordion per ogni giorno precedente -->
                  <div class="d-flex flex-column gap-2">
                    <div
                      v-for="gruppo in recuperiRaggruppati"
                      :key="gruppo.giorno"
                      class="recupero-accordion-group rounded-xl overflow-hidden"
                      style="border: 1px solid rgba(249, 115, 22, 0.15); background: rgba(0,0,0,0.15);"
                    >
                      <!-- Accordion Header (sempre visibile) -->
                      <div
                        class="d-flex align-center justify-space-between pa-3 cursor-pointer select-none"
                        style="transition: background 0.2s;"
                        @click="toggleRecuperoAccordion(gruppo.giorno)"
                      >
                        <div class="d-flex align-center">
                          <div
                            class="d-flex align-center justify-center rounded-lg mr-3 font-weight-black"
                            style="width: 32px; height: 32px; background: rgba(249, 115, 22, 0.2); color: #fb923c; font-size: 0.95rem;"
                          >
                            {{ gruppo.giorno }}
                          </div>
                          <div>
                            <div class="text-caption font-weight-black text-slate-dark" style="font-size: 0.8rem !important;">
                              Da Giorno {{ gruppo.giorno }}
                            </div>
                            <div class="text-super-caption text-muted" style="font-size: 0.65rem;">
                              {{ gruppo.esercizi.length }} eserciz{{ gruppo.esercizi.length === 1 ? 'io' : 'i' }} da completare
                            </div>
                          </div>
                        </div>
                        <div class="d-flex align-center gap-2">
                          <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white px-2">
                            {{ gruppo.esercizi.length }}
                          </v-chip>
                          <v-icon size="18" color="orange-lighten-2" :style="{ transform: recuperoAccordionAperto === gruppo.giorno ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }">
                            mdi-chevron-down
                          </v-icon>
                        </div>
                      </div>

                      <!-- Accordion Body (collassabile) -->
                      <v-expand-transition>
                        <div v-show="recuperoAccordionAperto === gruppo.giorno" class="px-3 pb-3">
                          <!-- Coaching Tip -->
                          <div class="d-flex align-center pa-2 mb-2 rounded-lg" style="background: rgba(249, 115, 22, 0.08); border: 1px dashed rgba(249, 115, 22, 0.2);">
                            <v-icon size="14" color="orange-lighten-1" class="mr-2 flex-shrink-0">mdi-lightbulb-outline</v-icon>
                            <span class="text-super-caption text-orange-lighten-2" style="font-size: 0.62rem; line-height: 1.3;">
                              Ordine consigliato: inserisci prima i <strong>multiarticolari</strong> (dopo i tuoi esercizi principali), poi l'<strong>isolamento</strong>, infine il <strong>core</strong>.
                            </span>
                          </div>

                          <div class="d-flex flex-column gap-2">
                            <v-card
                              v-for="(recItem, idx) in gruppo.esercizi"
                              :key="idx"
                              class="pa-3 rounded-xl d-flex align-center"
                              flat
                              style="border: 1px solid rgba(255, 255, 255, 0.06) !important; background: rgba(15, 23, 42, 0.6) !important;"
                            >
                              <!-- Numero ordine + Thumbnail -->
                              <div class="d-flex flex-column align-center mr-3 flex-shrink-0" style="gap: 3px;">
                                <div
                                  class="d-flex align-center justify-center rounded font-weight-black"
                                  style="width: 20px; height: 20px; font-size: 0.6rem; background: rgba(249, 115, 22, 0.25); color: #fb923c;"
                                >
                                  {{ idx + 1 }}
                                </div>
                                <div class="rounded-lg overflow-hidden" style="width: 44px; height: 44px; border: 1px solid rgba(255,255,255,0.08);">
                                  <v-img
                                    :src="getGifUrl(recItem.exercise.UrlNormal) || '/logo.png'"
                                    cover
                                    height="100%"
                                    width="100%"
                                  >
                                    <template v-slot:placeholder>
                                      <div class="fill-height d-flex align-center justify-center" style="background: rgba(30,41,59,0.8);">
                                        <v-icon color="grey" size="14">mdi-dumbbell</v-icon>
                                      </div>
                                    </template>
                                  </v-img>
                                </div>
                              </div>

                              <!-- Testo e controlli -->
                              <div class="flex-grow-1 min-width-0 text-left">
                                <div class="d-flex align-center justify-space-between flex-wrap gap-1">
                                  <h4 class="text-caption font-weight-black text-slate-dark text-truncate mr-2" style="font-size: 0.82rem !important;">
                                    {{ recItem.exercise.des_esercizio }}
                                  </h4>
                                  <div class="d-flex align-center gap-1">
                                    <v-chip size="x-small" variant="flat" class="font-weight-bold px-1" style="font-size: 0.5rem; height: 15px;"
                                      :color="recItem.complessita === 1 ? 'red-darken-3' : recItem.complessita === 2 ? 'orange-darken-3' : recItem.complessita === 4 ? 'green-darken-3' : 'yellow-darken-3'"
                                    >
                                      {{ labelComplessita(recItem.complessita) }}
                                    </v-chip>
                                    <v-chip size="x-small" color="orange-darken-3" variant="outlined" class="font-weight-bold" style="font-size: 0.55rem; height: 15px;">
                                      W{{ recItem.week }}
                                    </v-chip>
                                  </div>
                                </div>

                                <!-- Prescrizione -->
                                <div class="text-super-caption text-muted mt-0.5">
                                  Target: {{ formattaPrescrizioneSemplice(recItem.prescrizione) }}
                                </div>
                                
                                <div v-if="recItem.originalVal.replace(/\s*\[RECUPERA\]/g, '').trim() !== '' && recItem.originalVal.replace(/\s*\[RECUPERA\]/g, '').trim() !== '-'" class="text-super-caption text-orange-lighten-2 mt-0.5">
                                  Log parziale: "{{ recItem.originalVal.replace(/\s*\[RECUPERA\]/g, '').trim() }}"
                                </div>

                                <!-- Campo inserimento log e bottone completa -->
                                <div class="d-flex align-center gap-2 mt-2">
                                  <v-text-field
                                    v-model="logRecuperi[recItem.exercise.id + '_' + recItem.week]"
                                    label="Peso o esecuzione..."
                                    variant="outlined"
                                    density="compact"
                                    hide-details
                                    rounded="lg"
                                    color="orange-darken-3"
                                    style="font-size: 0.68rem !important; height: 26px;"
                                    class="recovery-compact-input flex-grow-1"
                                  ></v-text-field>
                                  <v-btn
                                    color="green-darken-3"
                                    size="x-small"
                                    variant="flat"
                                    class="font-weight-black text-none text-white rounded-lg px-2"
                                    style="height: 26px; font-size: 0.68rem !important; min-width: 44px;"
                                    @click.stop="concludiRecuperoTesto(recItem)"
                                  >
                                    <v-icon size="12" class="mr-0.5">mdi-check</v-icon>
                                    OK
                                  </v-btn>
                                </div>
                              </div>
                            </v-card>
                          </div>
                        </div>
                      </v-expand-transition>
                    </div>
                  </div>
                </v-card>
              </div>
            </v-expand-transition>

            <!-- Ordine Esecuzione Proposto (Auto-generato con Recuperi integrati) -->
            <v-expand-transition>
              <div v-if="eserciziDaRecuperare.length > 0 && ordineEsecuzioneCompleto.length > 0" class="mb-6">
                <v-card
                  class="pa-3 rounded-xl mb-4 border elevation-1"
                  style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.5), rgba(15, 23, 42, 0.7)) !important; border: 1px solid rgba(249, 115, 22, 0.2) !important;"
                >
                  <div
                    class="d-flex align-center justify-space-between cursor-pointer select-none"
                    @click="ordineEsecuzioneAperto = !ordineEsecuzioneAperto"
                  >
                    <div class="d-flex align-center">
                      <v-icon color="orange-darken-3" class="mr-2" size="18">mdi-format-list-numbered</v-icon>
                      <span class="text-caption font-weight-black text-slate-dark" style="font-size: 0.78rem !important; letter-spacing: 0.03em;">
                        ORDINE ESECUZIONE
                      </span>
                      <v-chip
                        v-if="eserciziDaRecuperare.length > 0"
                        color="orange-darken-3"
                        size="x-small"
                        class="ml-2 font-weight-black text-white px-1.5"
                        variant="flat"
                        style="font-size: 0.5rem; height: 16px;"
                      >
                        +{{ eserciziDaRecuperare.length }} RECUPERI
                      </v-chip>
                    </div>
                    <div class="d-flex align-center gap-1">
                      <v-chip
                        color="grey-darken-1"
                        size="x-small"
                        variant="tonal"
                        class="font-weight-black px-1.5"
                        style="font-size: 0.5rem; height: 16px;"
                      >
                        {{ ordineEsecuzioneCompleto.length }} TOT
                      </v-chip>
                      <v-icon size="16" color="orange-lighten-2" :style="{ transform: ordineEsecuzioneAperto ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.25s ease' }">
                        mdi-chevron-down
                      </v-icon>
                    </div>
                  </div>

                  <v-expand-transition>
                    <div v-show="ordineEsecuzioneAperto" class="mt-3">
                      <div class="d-flex flex-column gap-1">
                        <div
                          v-for="(item, idx) in ordineEsecuzioneCompleto"
                          :key="'ord-' + idx"
                          class="d-flex align-center py-1.5 px-2 rounded-lg cursor-pointer"
                          :style="{
                            background: item.tipo === 'recupero' ? 'rgba(249, 115, 22, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                            border: item.tipo === 'recupero' ? '1px solid rgba(249, 115, 22, 0.15)' : '1px solid rgba(255, 255, 255, 0.04)',
                          }"
                          @click="item.id ? vaiAlDettaglio(item.id) : null"
                        >
                          <!-- Numero ordine -->
                          <div
                            class="d-flex align-center justify-center rounded font-weight-black flex-shrink-0 mr-2.5"
                            :style="{
                              width: '22px',
                              height: '22px',
                              fontSize: '0.62rem',
                              background: item.tipo === 'recupero' ? 'rgba(249, 115, 22, 0.3)' : 'rgba(255, 255, 255, 0.08)',
                              color: item.tipo === 'recupero' ? '#fb923c' : '#94a3b8',
                            }"
                          >
                            {{ idx + 1 }}
                          </div>

                          <!-- Info Esercizio -->
                          <div class="flex-grow-1 min-width-0">
                            <div class="d-flex align-center gap-1">
                              <span class="text-caption font-weight-bold text-truncate" :class="item.tipo === 'recupero' ? 'text-orange-lighten-2' : 'text-slate-dark'" style="font-size: 0.72rem !important;">
                                {{ item.nome }}
                              </span>
                              <v-chip
                                v-if="item.tipo === 'recupero'"
                                color="orange-darken-3"
                                size="x-small"
                                variant="flat"
                                class="font-weight-black text-white flex-shrink-0"
                                style="font-size: 0.42rem; height: 13px; padding: 0 4px;"
                              >
                                🔁 REC
                              </v-chip>
                              <v-chip
                                v-if="item.superserie"
                                color="amber-darken-3"
                                size="x-small"
                                variant="tonal"
                                class="font-weight-black flex-shrink-0"
                                style="font-size: 0.42rem; height: 13px; padding: 0 4px;"
                              >
                                ⚡ {{ item.superserie }}
                              </v-chip>
                            </div>
                            <div class="text-super-caption text-muted font-weight-bold" style="font-size: 0.55rem;">
                              {{ item.settore }}
                              <span v-if="item.prescrizione" class="text-slate ml-0.5">• {{ item.prescrizione }}</span>
                            </div>
                          </div>

                          <!-- Status -->
                          <v-icon
                            v-if="item.completato"
                            size="14"
                            color="green-accent-4"
                            class="flex-shrink-0 ml-1"
                          >mdi-check-circle</v-icon>
                          <v-icon
                            v-else
                            size="14"
                            color="grey-darken-1"
                            class="flex-shrink-0 ml-1"
                            style="opacity: 0.4;"
                          >mdi-circle-outline</v-icon>
                        </div>
                      </div>
                    </div>
                  </v-expand-transition>
                </v-card>
              </div>
            </v-expand-transition>

        <!-- Container Unico Sessione Giorno -->
        <v-card
          v-if="headerGiorno"
          class="workout-session-container rounded-2xl overflow-hidden border elevation-2 mb-6"
          style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.35), rgba(15, 23, 42, 0.55)) !important; border: 1.5px solid rgba(255, 255, 255, 0.08) !important;"
        >
          <!-- Intestazione Sessione (ex Day Header Card) -->
          <div
            class="day-header-section pa-4 clickable-header position-relative"
            style="border-bottom: 1.5px solid rgba(255, 255, 255, 0.08); transition: background 0.2s;"
            @click="vaiAlDettaglioSessione(headerGiorno.id)"
          >
          <!-- Se il header si può formattare, mostriamo un layout premium strutturato -->
          <div v-if="parseDayHeader(headerGiorno.des_esercizio)" class="w-100">
            <v-row no-gutters class="align-center mb-3">
              <v-col cols="12" class="text-left">
                <div class="d-flex align-center">
                  <div class="giorno-big-letter mr-3">{{ giornoSelezionato }}</div>
                  <div class="text-left">
                    <h3 class="text-subtitle-1 font-weight-black text-orange-darken-4 mb-0">
                      Workout Giorno {{ giornoSelezionato }}
                    </h3>
                    <!-- Promemoria Chiusura Settimana -->
                    <div v-if="mostraPromemoriaChiusura" class="mt-1">
                      <v-chip
                        size="x-small"
                        color="amber-darken-3"
                        class="font-weight-black px-1.5 animate-pulse text-white elevation-1"
                        variant="flat"
                        style="font-size: 0.58rem; height: 18px;"
                      >
                        ⚠️ SETTIMANA DA CHIUDERE
                      </v-chip>
                    </div>
                    <!-- Progresso Settimane (Tracker Week) -->
                    <div class="d-flex gap-1 align-center mini-weeks-progression mt-1">
                      <div
                        v-for="w in [1, 2, 3, 4, 5, 6]"
                        :key="w"
                        class="mini-week-capsule"
                        :class="{
                          'capsule-completed': isCmpTrue(headerGiorno['cmp' + w]),
                          'capsule-active': w === settimanaAttivaGiorno && !isCmpTrue(headerGiorno['cmp' + w]),
                          'capsule-pending': w !== settimanaAttivaGiorno && !isCmpTrue(headerGiorno['cmp' + w])
                        }"
                      >
                        <span class="capsule-num">W{{ w }}</span>
                        <v-icon v-if="isCmpTrue(headerGiorno['cmp' + w])" size="8" class="ml-0.5" color="green-accent-4">mdi-check-bold</v-icon>
                      </div>
                    </div>
                    <div class="text-caption text-muted font-weight-bold d-flex align-center mt-1" style="font-size: 0.7rem;">
                      <v-icon size="13" color="orange" class="mr-1">mdi-fire</v-icon>
                      Stima: {{ parseDayHeader(headerGiorno.des_esercizio).calorie }} kcal consumate
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Griglia dei Tempi e Densità con Medie -->
            <v-row dense class="mb-3 text-center">
              <v-col cols="4">
                <div class="prescription-chip-box px-2 py-1.5 rounded-lg">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.65rem;">Week 1</span>
                  <span class="text-body-2 font-weight-bold text-slate-dark d-block mb-0.5">⏱️ {{ parseDayHeader(headerGiorno.des_esercizio).tempo1 }}</span>
                  <span class="text-super-caption text-orange-lighten-1 font-weight-black" style="font-size: 0.65rem;">Densità: {{ parseDayHeader(headerGiorno.des_esercizio).densita1 }}%</span>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="prescription-chip-box px-2 py-1.5 rounded-lg border-orange-darken-3-op bg-orange-darken-3-op">
                  <span class="text-super-caption text-orange-darken-3 uppercase font-weight-black d-block mb-0.5" style="font-size: 0.65rem;">Media</span>
                  <span class="text-body-2 font-weight-black text-orange-darken-3 d-block mb-0.5">⏱️ {{ parseDayHeader(headerGiorno.des_esercizio).tempoMedia }}</span>
                  <span class="text-super-caption text-orange-darken-3 font-weight-black" style="font-size: 0.65rem;">Densità: {{ parseDayHeader(headerGiorno.des_esercizio).densitaMedia }}%</span>
                </div>
              </v-col>
              <v-col cols="4">
                <div class="prescription-chip-box px-2 py-1.5 rounded-lg">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.65rem;">Week 6</span>
                  <span class="text-body-2 font-weight-bold text-slate-dark d-block mb-0.5">⏱️ {{ parseDayHeader(headerGiorno.des_esercizio).tempo2 }}</span>
                  <span class="text-super-caption text-orange-lighten-1 font-weight-black" style="font-size: 0.65rem;">Densità: {{ parseDayHeader(headerGiorno.des_esercizio).densita2 }}%</span>
                </div>
              </v-col>
            </v-row>

            <!-- Sezione Volumi (VOL A, B, C) -->
            <div v-if="parseVolumes(headerGiorno.ins_esercizio)" class="volumes-premium-box pa-2 rounded-lg bg-slate-900 border-soft text-left">
              <div class="d-flex align-center justify-space-between mb-1.5 px-1">
                <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.65rem;">
                  📊 Distribuzione Volumi (Serie Totali: {{ parseVolumes(headerGiorno.ins_esercizio).totale }})
                </span>
              </div>
              <v-row dense class="text-center font-weight-bold text-caption">
                <v-col :cols="parseVolumes(headerGiorno.ins_esercizio).centrale > 0 ? 4 : 6">
                  <div class="pa-1 bg-slate-800 rounded">
                    <span class="text-muted d-block" style="font-size: 0.6rem;">Parte Alta (A)</span>
                    <span class="text-blue-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).alta }} serie</span>
                    <v-progress-linear
                      :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).alta / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                      color="blue-lighten-2"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </v-col>
                <v-col :cols="parseVolumes(headerGiorno.ins_esercizio).centrale > 0 ? 4 : 6">
                  <div class="pa-1 bg-slate-800 rounded">
                    <span class="text-muted d-block" style="font-size: 0.6rem;">Parte Bassa (B)</span>
                    <span class="text-orange-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).bassa }} serie</span>
                    <v-progress-linear
                      :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).bassa / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                      color="orange-lighten-2"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </v-col>
                <v-col v-if="parseVolumes(headerGiorno.ins_esercizio).centrale > 0" cols="4">
                  <div class="pa-1 bg-slate-800 rounded">
                    <span class="text-muted d-block" style="font-size: 0.6rem;">Centrale (C)</span>
                    <span class="text-green-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).centrale }} serie</span>
                    <v-progress-linear
                      :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).centrale / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                      color="green-lighten-2"
                      height="3"
                      rounded
                      class="mt-1"
                    ></v-progress-linear>
                  </div>
                </v-col>
              </v-row>
            </div>

            <!-- Informazioni RMT o Volumi se presenti -->
            <div v-if="headerGiorno.des_esercizio_2" class="mt-2 pt-2 border-top-soft text-left d-flex align-center">
              <template v-if="isVolumeString(headerGiorno.des_esercizio_2)">
                <div class="d-flex align-center flex-wrap gap-1.5">
                  <span class="vol-pill vol-pill-total" title="Volume Globale (V)">
                    <span class="mr-1">📊</span>
                    <span class="vol-label">Vol</span>
                    <span class="vol-val">{{ parseVolumeString(headerGiorno.des_esercizio_2).v }}</span>
                  </span>
                  <span class="vol-pill vol-pill-upper" title="Parte Alta / Upper Body (A)">
                    <span class="mr-1">💪</span>
                    <span class="vol-label">Alta</span>
                    <span class="vol-val">{{ parseVolumeString(headerGiorno.des_esercizio_2).a }}</span>
                  </span>
                  <span class="vol-pill vol-pill-lower" title="Parte Bassa / Lower Body (B)">
                    <span class="mr-1">🦵</span>
                    <span class="vol-label">Bassa</span>
                    <span class="vol-val">{{ parseVolumeString(headerGiorno.des_esercizio_2).b }}</span>
                  </span>
                  <span v-if="parseFloat(parseVolumeString(headerGiorno.des_esercizio_2).c.replace(',', '.')) > 0" class="vol-pill vol-pill-core" title="Core / Centro (C)">
                    <span class="mr-1">🎯</span>
                    <span class="vol-label">Core</span>
                    <span class="vol-val">{{ parseVolumeString(headerGiorno.des_esercizio_2).c }}</span>
                  </span>
                </div>
              </template>
              <template v-else>
                <div class="text-caption text-slate font-weight-bold d-flex align-center text-truncate">
                  <v-icon size="14" color="grey" class="mr-1">mdi-chart-line</v-icon>
                  {{ formattaRmtSemplice(headerGiorno.des_esercizio_2) }}
                </div>
              </template>
            </div>
          </div>

          <!-- Fallback se non si può parsare -->
          <div v-else class="w-100">
            <v-row no-gutters class="align-center mb-3">
              <v-col cols="12" class="text-left">
                <div class="d-flex align-center">
                  <div class="giorno-big-letter mr-3">{{ giornoSelezionato }}</div>
                  <div class="text-left min-width-0">
                    <h3 class="text-subtitle-1 font-weight-black text-orange-darken-4 text-truncate mb-0">
                      {{ headerGiorno.des_esercizio || 'Sessione di Allenamento' }}
                    </h3>
                    <!-- Promemoria Chiusura Settimana -->
                    <div v-if="mostraPromemoriaChiusura" class="mt-1">
                      <v-chip
                        size="x-small"
                        color="amber-darken-3"
                        class="font-weight-black px-1.5 animate-pulse text-white elevation-1"
                        variant="flat"
                        style="font-size: 0.58rem; height: 18px;"
                      >
                        ⚠️ SETTIMANA DA CHIUDERE
                      </v-chip>
                    </div>
                    <!-- Progresso Settimane (Tracker Week) -->
                    <div class="d-flex gap-1 align-center mini-weeks-progression mt-1">
                      <div
                        v-for="w in [1, 2, 3, 4, 5, 6]"
                        :key="w"
                        class="mini-week-capsule"
                        :class="{
                          'capsule-completed': isCmpTrue(headerGiorno['cmp' + w]),
                          'capsule-active': w === settimanaAttivaGiorno && !isCmpTrue(headerGiorno['cmp' + w]),
                          'capsule-pending': w !== settimanaAttivaGiorno && !isCmpTrue(headerGiorno['cmp' + w])
                        }"
                      >
                        <span class="capsule-num">W{{ w }}</span>
                        <v-icon v-if="isCmpTrue(headerGiorno['cmp' + w])" size="8" class="ml-0.5" color="green-accent-4">mdi-check-bold</v-icon>
                      </div>
                    </div>
                  </div>
                </div>
              </v-col>
            </v-row>

            <!-- Informazioni RMT o Volumi se presenti (spostate sotto e rese indipendenti) -->
            <div v-if="headerGiorno.des_esercizio_2" class="mt-2 pt-2 border-top-soft">
                <template v-if="isVolumeString(headerGiorno.des_esercizio_2)">
                  <div class="d-flex align-center flex-wrap gap-1.5">
                    <span class="vol-pill vol-pill-total" title="Volume Globale (V)">
                      <span class="mr-1">📊</span>
                      <span class="vol-label">Vol</span>
                      <span class="vol-val">{{ parseVolumeString(headerGiorno.des_esercizio_2).v }}</span>
                    </span>
                    <span class="vol-pill vol-pill-upper" title="Parte Alta / Upper Body (A)">
                      <span class="mr-1">💪</span>
                      <span class="vol-label">Alta</span>
                      <span class="vol-val">{{ parseVolumeString(headerGiorno.des_esercizio_2).a }}</span>
                    </span>
                    <span class="vol-pill vol-pill-lower" title="Parte Bassa / Lower Body (B)">
                      <span class="mr-1">🦵</span>
                      <span class="vol-label">Bassa</span>
                      <span class="vol-val">{{ parseVolumeString(headerGiorno.des_esercizio_2).b }}</span>
                    </span>
                    <span v-if="parseFloat(parseVolumeString(headerGiorno.des_esercizio_2).c.replace(',', '.')) > 0" class="vol-pill vol-pill-core" title="Core / Centro (C)">
                      <span class="mr-1">🎯</span>
                      <span class="vol-label">Core</span>
                      <span class="vol-val">{{ parseVolumeString(headerGiorno.des_esercizio_2).c }}</span>
                    </span>
                  </div>
                </template>
                <template v-else>
                  <div class="text-caption text-slate font-weight-bold d-flex align-center text-truncate">
                    <v-icon size="14" color="grey" class="mr-1">mdi-chart-line</v-icon>
                    {{ formattaRmtSemplice(headerGiorno.des_esercizio_2) }}
                  </div>
                </template>
              </div>
              
              <!-- Sezione Volumi (VOL A, B, C) in fallback -->
              <div v-if="parseVolumes(headerGiorno.ins_esercizio)" class="volumes-premium-box pa-2 rounded-lg bg-slate-900 border-soft text-left mt-2">
                <div class="d-flex align-center justify-space-between mb-1.5 px-1">
                  <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.65rem;">
                    📊 Distribuzione Volumi (Serie Totali: {{ parseVolumes(headerGiorno.ins_esercizio).totale }})
                  </span>
                </div>
                <v-row dense class="text-center font-weight-bold text-caption">
                  <v-col :cols="parseVolumes(headerGiorno.ins_esercizio).centrale > 0 ? 4 : 6">
                    <div class="pa-1 bg-slate-800 rounded">
                      <span class="text-muted d-block" style="font-size: 0.6rem;">Parte Alta (A)</span>
                      <span class="text-blue-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).alta }} serie</span>
                      <v-progress-linear
                        :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).alta / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                        color="blue-lighten-2"
                        height="3"
                        rounded
                        class="mt-1"
                      ></v-progress-linear>
                    </div>
                  </v-col>
                  <v-col :cols="parseVolumes(headerGiorno.ins_esercizio).centrale > 0 ? 4 : 6">
                    <div class="pa-1 bg-slate-800 rounded">
                      <span class="text-muted d-block" style="font-size: 0.6rem;">Parte Bassa (B)</span>
                      <span class="text-orange-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).bassa }} serie</span>
                      <v-progress-linear
                        :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).bassa / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                        color="orange-lighten-2"
                        height="3"
                        rounded
                        class="mt-1"
                      ></v-progress-linear>
                    </div>
                  </v-col>
                  <v-col v-if="parseVolumes(headerGiorno.ins_esercizio).centrale > 0" cols="4">
                    <div class="pa-1 bg-slate-800 rounded">
                      <span class="text-muted d-block" style="font-size: 0.6rem;">Centrale (C)</span>
                      <span class="text-green-lighten-2">{{ parseVolumes(headerGiorno.ins_esercizio).centrale }} serie</span>
                      <v-progress-linear
                        :model-value="parseVolumes(headerGiorno.ins_esercizio).totale > 0 ? (parseVolumes(headerGiorno.ins_esercizio).centrale / parseVolumes(headerGiorno.ins_esercizio).totale) * 100 : 0"
                        color="green-lighten-2"
                        height="3"
                        rounded
                        class="mt-1"
                      ></v-progress-linear>
                    </div>
                  </v-col>
                </v-row>
              </div>
              <div v-else-if="headerGiorno.ins_esercizio" class="text-caption text-muted mt-1 leading-tight text-truncate">
                {{ headerGiorno.ins_esercizio }}
              </div>
            <v-icon color="orange-darken-3" class="ml-2">mdi-chevron-right</v-icon>
          </div>

          <!-- Progress Bar Session Energy (unificata visivamente) -->
          <div class="mt-3 pt-2.5 border-top-soft text-left" @click.stop>
            <div class="d-flex align-center justify-space-between text-super-caption font-weight-black uppercase text-grey-lighten-1 mb-1.5" style="font-size: 0.62rem; letter-spacing: 0.05em;">
              <span>🔋 Avanzamento Allenamento</span>
              <span class="text-orange-lighten-2">{{ progressoSessione.completate }} di {{ progressoSessione.totali }} serie completate • {{ progressoSessione.percentuale }}%</span>
            </div>
            <div class="session-progress-bar-container rounded-full overflow-hidden" style="height: 5px; background: rgba(255, 255, 255, 0.05); border: 1px solid rgba(255, 255, 255, 0.03);">
              <div
                class="session-progress-bar-fill rounded-full"
                :style="{
                  width: progressoSessione.percentuale + '%',
                  height: '100%',
                  background: 'linear-gradient(90deg, #f97316, #ff8f00)',
                  boxShadow: '0 0 10px rgba(249, 115, 22, 0.6)',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }"
              ></div>
            </div>
          </div>
          </div>

          <!-- Sezione Esercizi della Sessione (unita visivamente) -->
          <div class="day-exercises-section pa-3" style="background: rgba(15, 23, 42, 0.25);">
            <!-- Stato Vuoto se nessun esercizio -->
            <div v-if="eserciziFiltrati.length === 0" class="text-center my-10 py-6">
              <v-icon color="grey-lighten-1" size="48">mdi-dumbbell-off</v-icon>
              <p class="mt-2 text-caption text-muted">Nessun esercizio presente per il giorno {{ giornoSelezionato }} in questa scheda.</p>
            </div>

            <!-- Lista Esercizi con Miniature a Sinistra stile AppSheet (Raggruppati in Superserie se presenti) -->
            <div v-else class="exercise-list">
          <template v-for="(block, bIdx) in blocchiEsercizi" :key="bIdx">
            
            <!-- CASO 1: GRUPPO SUPERSET (SUPERSERIE) -->
            <v-card
              v-if="block.type === 'superset'"
              class="superset-group-card rounded-2xl pa-4 mb-4 border-superset elevation-2 text-left"
            >
              <!-- Intestazione del Superset -->
              <div class="superset-header d-flex align-center justify-space-between mb-3">
                <div class="d-flex align-center flex-wrap gap-2">
                  <v-chip color="orange-darken-3" class="font-weight-black text-white px-2 py-1 mr-1" variant="flat" size="x-small">
                    ⚡ SUPERSET {{ block.letter }}
                  </v-chip>
                  <span class="text-caption font-weight-black text-orange-lighten-2" style="font-size: 0.72rem;">
                    Esegui in sequenza senza pausa
                  </span>
                </div>
                <v-chip color="orange-darken-3" size="x-small" variant="tonal" class="font-weight-black px-2">
                  {{ block.exercises.length }} ESERCIZI
                </v-chip>
              </div>
              
              <div class="superset-exercises-wrapper">
                <div
                  v-for="(ex, index) in block.exercises"
                  :key="ex.id"
                  :id="'esercizio-' + ex.id"
                  class="superset-exercise-item position-relative d-flex align-center py-3"
                  :class="{
                    'border-bottom-soft': index < block.exercises.length - 1
                  }"
                  @click="vaiAlDettaglio(ex.id)"
                >
                  <!-- Linea di collegamento tratteggiata tra le miniature degli esercizi in superset -->
                  <div v-if="index < block.exercises.length - 1" class="superset-connector-line"></div>
                  
                  <!-- Miniatura GIF/Immagine sulla Sinistra con badge sotto -->
                  <div class="d-flex flex-column align-center mr-4" style="width: 76px; min-width: 76px;">
                    <div class="thumbnail-wrapper rounded-lg overflow-hidden position-relative mb-1" style="z-index: 2; width: 76px; height: 76px;">
                      <v-img
                        :src="getGifUrl(ex.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200'"
                        width="76"
                        height="76"
                        cover
                        alt="Esercizio"
                        class="bg-grey-lighten-4"
                      >
                        <template v-slot:placeholder>
                          <div class="fill-height d-flex align-center justify-center bg-slate-50">
                            <v-icon color="grey-lighten-1" size="20">mdi-dumbbell</v-icon>
                          </div>
                        </template>
                      </v-img>
                    </div>

                    <!-- Badge Carico Inserito o Da fare sotto l'immagine -->
                    <v-chip
                      v-if="ex['ins_week' + settimanaAttivaGiorno] && String(ex['ins_week' + settimanaAttivaGiorno]).trim()"
                      color="green-darken-3"
                      size="x-small"
                      class="font-weight-black uppercase text-white animate-pulse"
                      variant="flat"
                      style="font-size: 0.52rem; height: 16px; padding: 0 4px; width: 100%; justify-content: center; cursor: pointer;"
                      @click.stop="segnaComeFattoRapido(ex)"
                    >
                      ✔️ {{ String(ex['ins_week' + settimanaAttivaGiorno]).trim() }}
                    </v-chip>
                    
                    <v-chip
                      v-else
                      color="grey-darken-2"
                      size="x-small"
                      class="font-weight-bold uppercase text-slate"
                      variant="outlined"
                      style="font-size: 0.52rem; height: 16px; padding: 0 4px; border-style: dashed !important; opacity: 0.65; width: 100%; justify-content: center; cursor: pointer;"
                      @click.stop="segnaComeFattoRapido(ex)"
                    >
                      ❌ DA FARE
                    </v-chip>
                  </div>

                  <!-- Dettagli Centrali -->
                  <div class="flex-grow-1 text-left min-width-0 position-relative" style="z-index: 2;">
                    <!-- Titolo Esercizio -->
                    <h4 class="text-body-1 font-weight-black leading-tight mb-1 d-flex align-center flex-wrap gap-1" :class="haEsercizioPrecedenteReale(ex) ? 'text-red-lighten-2' : 'text-slate-dark'">
                      {{ ex.des_esercizio || 'Esercizio' }}
                    </h4>

                    <!-- Settore e Emoji Sforzo -->
                    <div class="d-flex align-center text-caption font-weight-bold text-orange-darken-3 mb-1">
                      <span>{{ ex.des_settore || 'Corpo Libero' }}</span>
                      <v-icon size="12" color="orange" class="ml-1">mdi-fire</v-icon>
                    </div>

                    <!-- Prescrizione della settimana attiva -->
                    <div class="text-caption font-weight-bold text-slate text-truncate mb-1">
                      {{ formattaPrescrizioneSemplice(ex['des_week' + settimanaAttivaGiorno]) || ex.des_qta_report || 'Prescrizione non definita' }}
                    </div>

                    <!-- Pulsante Recupero Manuale -->
                    <div class="mt-1" style="z-index: 5;">
                      <v-chip
                        v-if="haRecupero(ex['ins_week' + settimanaAttivaGiorno])"
                        color="orange-darken-3"
                        size="x-small"
                        class="font-weight-black text-white px-2"
                        variant="flat"
                        prepend-icon="mdi-sync"
                        @click.stop="toggleRecupero(ex, false)"
                      >
                        In recupero la prossima volta
                      </v-chip>
                      <v-chip
                        v-else-if="!ex['ins_week' + settimanaAttivaGiorno] || String(ex['ins_week' + settimanaAttivaGiorno]).trim() === '' || String(ex['ins_week' + settimanaAttivaGiorno]).trim() === '-'"
                        color="grey-darken-2"
                        size="x-small"
                        class="font-weight-bold text-slate px-2"
                        variant="outlined"
                        style="border-style: dashed !important; opacity: 0.85;"
                        prepend-icon="mdi-plus"
                        @click.stop="toggleRecupero(ex, true)"
                      >
                        Recupera la prossima volta?
                      </v-chip>
                    </div>

                    <div class="d-flex align-center flex-wrap gap-1 mt-1 pt-1 border-top-soft w-100">
                      <div class="d-flex gap-1 align-center flex-wrap">
                        <div
                          v-for="w in [1, 2, 3, 4, 5, 6]"
                          :key="w"
                          class="mini-week-capsule d-inline-flex align-center"
                          :class="{
                            'capsule-completed': ex['ins_week' + w] && String(ex['ins_week' + w]).trim(),
                            'capsule-active': w === settimanaAttivaGiorno && !(ex['ins_week' + w] && String(ex['ins_week' + w]).trim()),
                            'capsule-pending': w !== settimanaAttivaGiorno && !(ex['ins_week' + w] && String(ex['ins_week' + w]).trim())
                          }"
                          style="font-size: 0.55rem; padding: 1px 4px; height: 16px; min-width: 32px;"
                        >
                          <span class="capsule-num" style="opacity: 0.85;">W{{ w }}</span>
                          <span class="ml-1 font-weight-black" style="font-size: 0.55rem;">
                            {{ formattaCaricoCompatto(ex['ins_week' + w]) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Timer Recupero / Chaining Clickable -->
                    <div class="mt-1">
                      <v-chip
                        v-if="ex.des_rec_report"
                        color="orange-darken-3"
                        variant="tonal"
                        size="x-small"
                        class="font-weight-black clickable-timer-chip"
                        prepend-icon="mdi-clock-outline"
                        @click.stop="avviaTimerRecupero(ex.des_rec_report, ex.des_esercizio)"
                      >
                        ⏱️ Recupero: {{ ex.des_rec_report }}{{ (ex.alf_superserie && ex.alf_superserie.trim()) ? ' (Riposati ora)' : '' }}
                      </v-chip>
                      <v-chip
                        v-else-if="ex.alf_superserie && ex.alf_superserie.trim()"
                        color="green-darken-3"
                        variant="flat"
                        size="x-small"
                        class="font-weight-black text-white"
                        prepend-icon="mdi-arrow-right-bold-circle-outline"
                      >
                        ⚡ VAI AL PROSSIMO (NO PAUSA)
                      </v-chip>
                    </div>
                  </div>

                  <!-- Colonna Destra (Ordine e Pulsante Navigazione) -->
                  <div class="d-flex flex-column align-end justify-center pl-2 position-relative" style="z-index: 2;">
                    <div class="text-caption font-weight-black text-slate-dark">
                      {{ ex.num_riga_giorno }}
                    </div>
                  </div>
                </div>
              </div>
            </v-card>

            <!-- CASO 2: ESERCIZIO STANDARD SINGOLO -->
            <v-card
              v-else
              :id="'esercizio-' + block.exercise.id"
              class="exercise-item-card rounded-xl pa-3 mb-4 elevation-1 d-flex align-center"
              @click="vaiAlDettaglio(block.exercise.id)"
            >
              <!-- Miniatura GIF/Immagine sulla Sinistra con badge sotto -->
              <div class="d-flex flex-column align-center mr-4" style="width: 84px; min-width: 84px;">
                <div class="thumbnail-wrapper rounded-lg overflow-hidden mb-1" style="width: 84px; height: 84px;">
                  <v-img
                    :src="getGifUrl(block.exercise.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200'"
                    width="84"
                    height="84"
                    cover
                    alt="Esercizio"
                    class="bg-grey-lighten-4"
                  >
                    <template v-slot:placeholder>
                      <div class="fill-height d-flex align-center justify-center bg-slate-50">
                        <v-icon color="grey-lighten-1">mdi-dumbbell</v-icon>
                      </div>
                    </template>
                  </v-img>
                </div>

                <!-- Badge Carico Inserito o Da fare sotto l'immagine -->
                <v-chip
                  v-if="block.exercise['ins_week' + settimanaAttivaGiorno] && String(block.exercise['ins_week' + settimanaAttivaGiorno]).trim()"
                  color="green-darken-3"
                  size="x-small"
                  class="font-weight-black uppercase text-white animate-pulse"
                  variant="flat"
                  style="font-size: 0.52rem; height: 16px; padding: 0 4px; width: 100%; justify-content: center; cursor: pointer;"
                  @click.stop="segnaComeFattoRapido(block.exercise)"
                >
                  ✔️ {{ String(block.exercise['ins_week' + settimanaAttivaGiorno]).trim() }}
                </v-chip>
                
                <v-chip
                  v-else
                  color="grey-darken-2"
                  size="x-small"
                  class="font-weight-bold uppercase text-slate"
                  variant="outlined"
                  style="font-size: 0.52rem; height: 16px; padding: 0 4px; border-style: dashed !important; opacity: 0.65; width: 100%; justify-content: center; cursor: pointer;"
                  @click.stop="segnaComeFattoRapido(block.exercise)"
                >
                  ❌ DA FARE
                </v-chip>
              </div>

              <!-- Dettagli Centrali -->
              <div class="flex-grow-1 text-left min-width-0">
                <!-- Titolo Esercizio -->
                <h4 class="text-body-1 font-weight-black leading-tight mb-1 d-flex align-center flex-wrap gap-1" :class="haEsercizioPrecedenteReale(block.exercise) ? 'text-red-lighten-2' : 'text-slate-dark'">
                  {{ block.exercise.des_esercizio || 'Esercizio' }}
                </h4>

                <!-- Settore e Emoji Sforzo -->
                <div class="d-flex align-center text-caption font-weight-bold text-orange-darken-3 mb-1">
                  <span>{{ block.exercise.des_settore || 'Corpo Libero' }}</span>
                  <v-icon size="12" color="orange" class="ml-1">mdi-fire</v-icon>
                </div>

                <!-- Prescrizione della settimana attiva -->
                <div class="text-caption font-weight-bold text-slate text-truncate mb-1">
                  {{ formattaPrescrizioneSemplice(block.exercise['des_week' + settimanaAttivaGiorno]) || block.exercise.des_qta_report || 'Prescrizione non definita' }}
                </div>

                <!-- Pulsante Recupero Manuale -->
                <div class="mt-1" style="z-index: 5;">
                  <v-chip
                    v-if="haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno])"
                    color="orange-darken-3"
                    size="x-small"
                    class="font-weight-black text-white px-2"
                    variant="flat"
                    prepend-icon="mdi-sync"
                    @click.stop="toggleRecupero(block.exercise, false)"
                  >
                    In recupero la prossima volta
                  </v-chip>
                  <v-chip
                    v-else-if="!block.exercise['ins_week' + settimanaAttivaGiorno] || String(block.exercise['ins_week' + settimanaAttivaGiorno]).trim() === '' || String(block.exercise['ins_week' + settimanaAttivaGiorno]).trim() === '-'"
                    color="grey-darken-2"
                    size="x-small"
                    class="font-weight-bold text-slate px-2"
                    variant="outlined"
                    style="border-style: dashed !important; opacity: 0.85;"
                    prepend-icon="mdi-plus"
                    @click.stop="toggleRecupero(block.exercise, true)"
                  >
                    Recupera la prossima volta?
                  </v-chip>
                </div>

                <!-- Cronologia Carichi Settimanali -->
                <div class="d-flex align-center flex-wrap gap-1 mt-1 pt-1 border-top-soft w-100">
                  <div class="d-flex gap-1 align-center flex-wrap">
                    <div
                      v-for="w in [1, 2, 3, 4, 5, 6]"
                      :key="w"
                      class="mini-week-capsule d-inline-flex align-center"
                      :class="{
                        'capsule-completed': block.exercise['ins_week' + w] && String(block.exercise['ins_week' + w]).trim(),
                        'capsule-active': w === settimanaAttivaGiorno && !(block.exercise['ins_week' + w] && String(block.exercise['ins_week' + w]).trim()),
                        'capsule-pending': w !== settimanaAttivaGiorno && !(block.exercise['ins_week' + w] && String(block.exercise['ins_week' + w]).trim())
                      }"
                      style="font-size: 0.55rem; padding: 1px 4px; height: 16px; min-width: 32px;"
                    >
                      <span class="capsule-num" style="opacity: 0.85;">W{{ w }}</span>
                      <span class="ml-1 font-weight-black" style="font-size: 0.55rem;">
                        {{ formattaCaricoCompatto(block.exercise['ins_week' + w]) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Timer Recupero Clickable -->
                <div v-if="block.exercise.des_rec_report" class="mt-1">
                  <v-chip
                    color="orange-darken-3"
                    variant="tonal"
                    size="x-small"
                    class="font-weight-black clickable-timer-chip"
                    prepend-icon="mdi-clock-outline"
                    @click.stop="avviaTimerRecupero(block.exercise.des_rec_report, block.exercise.des_esercizio)"
                  >
                    ⏱️ Recupero: {{ block.exercise.des_rec_report }}
                  </v-chip>
                </div>
              </div>

              <!-- Colonna Destra (Ordine e Pulsante Navigazione) -->
              <div class="d-flex flex-column align-end justify-center pl-2">
                <div class="text-caption font-weight-black text-slate-dark">
                  {{ block.exercise.num_riga_giorno }}
                </div>
              </div>
            </v-card>

          </template>

          <!-- Grande pulsante di completamento giorno in fondo alla lista -->
          <div class="mt-4 mb-4 px-1">
            <v-btn
              v-if="headerGiorno"
              block
              size="default"
              class="font-weight-black text-none rounded-lg elevation-2"
              :color="isCmpTrue(headerGiorno['cmp' + settimanaAttivaGiorno]) ? 'green-darken-3' : 'orange-darken-3'"
              style="height: 42px;"
              @click.stop="toggleGiornoAttivoRapido"
            >
              <v-icon class="mr-2" size="18">
                {{ isCmpTrue(headerGiorno['cmp' + settimanaAttivaGiorno]) ? 'mdi-check-circle' : 'mdi-check-all' }}
              </v-icon>
              {{ isCmpTrue(headerGiorno['cmp' + settimanaAttivaGiorno]) ? 'Giorno Completato (Riapri)' : 'Completa Giorno ' + giornoSelezionato }}
            </v-btn>
          </div>
        </div>
          </div>
        </v-card>
          </div>
        </transition>
      </div>

    </div>

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
              @click="vibraTattile(10); vaiAlDettaglio(p.id); dialogProgressioni = false"
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

    <!-- Dialog di Avviso Esercizi Incompleti al Completamento -->
    <v-dialog v-model="dialogRecuperiAvviso" max-width="450">
      <v-card class="card-glass rounded-2xl border pa-5 text-center" style="background: rgba(15, 23, 42, 0.9) !important; border-color: rgba(255, 255, 255, 0.1) !important; backdrop-filter: blur(20px) !important;">
        <v-icon color="orange-darken-3" size="56" class="mb-4 animate-pulse">mdi-sync</v-icon>
        <h3 class="text-h6 font-weight-black text-slate-dark mb-2">Allenamento Completato!</h3>
        <p class="text-body-2 text-slate mb-5" style="line-height: 1.5; color: #cbd5e1 !important;">
          Ci sono alcuni esercizi saltati o incompleti in questa seduta. Li abbiamo salvati e verranno riproposti automaticamente nella tua prossima sessione per essere recuperati.
        </p>
        <v-btn color="orange-darken-3" block rounded="xl" class="font-weight-black text-none py-2 text-white" height="44" @click="dialogRecuperiAvviso = false">
          Ho capito, grazie!
        </v-btn>
      </v-card>
    </v-dialog>

  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { useRouter } from 'vue-router';
import { collection, getDocs, query, where, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';
import { selectedAthlete, selectedSheet, startGlobalTimer, getNomeAtleta, utente } from '../authStore.js';
import { jsPDF } from 'jspdf';

const router = useRouter();

const isCmpTrue = (val) => {
  if (val === undefined || val === null) return false;
  if (typeof val === 'boolean') return val;
  const str = String(val).toLowerCase().trim();
  return str === 'true' || str === 'sì' || str === 'si' || str === '1';
};

const parseTimeToSeconds = (tStr) => {
  if (!tStr) return 90;

  const parseSinglePartToSeconds = (p) => {
    p = p.trim();
    if (!p) return 0;

    // Se il formato è mm:ss (es. 1:30)
    if (p.includes(':')) {
      const parts = p.split(':');
      return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
    }

    // Minuti e secondi combinati (es. 1'30" o 1'30'')
    if (p.includes("'") && (p.includes('"') || p.includes("''"))) {
      const cleanPart = p.replace("''", '"');
      const parts = cleanPart.split("'");
      const mins = parseFloat(parts[0]) || 0;
      const secs = parseFloat(parts[1].replace('"', '')) || 0;
      return Math.round(mins * 60 + secs);
    }

    // Solo secondi (es. 45" o 45'' o 45s)
    if (p.endsWith('"') || p.endsWith("''") || p.endsWith("s")) {
      const secs = parseFloat(p.replace(/''|"|s/g, '')) || 0;
      return Math.round(secs);
    }

    // Solo minuti (es. 1' o 1m o 1min)
    if (p.endsWith("'") || p.endsWith("m") || p.endsWith("min")) {
      const mins = parseFloat(p.replace(/min|m|'/g, '')) || 0;
      return Math.round(mins * 60);
    }

    // Numero semplice senza unità
    const num = parseFloat(p);
    if (!isNaN(num)) {
      if (num <= 5) return Math.round(num * 60); // Se <= 5 sono minuti
      return Math.round(num); // Altrimenti sono secondi
    }

    return 0;
  };

  const clean = tStr.toLowerCase().replace('rec', '').replace('⏱️', '').trim();

  // Verifica la presenza di intervalli/range tramite '-' o '/'
  let parts = [];
  if (clean.includes('-')) {
    parts = clean.split('-');
  } else if (clean.includes('/')) {
    parts = clean.split('/');
  }

  if (parts.length > 1) {
    // Range individuato: prendiamo il limite superiore (l'ultimo elemento)
    const upperStr = parts[parts.length - 1].trim();
    const upperVal = parseSinglePartToSeconds(upperStr);
    if (upperVal > 0) return upperVal;

    // Fallback al limite inferiore
    const lowerStr = parts[0].trim();
    const lowerVal = parseSinglePartToSeconds(lowerStr);
    if (lowerVal > 0) return lowerVal;
  }

  const val = parseSinglePartToSeconds(clean);
  return val > 0 ? val : 90;
};

const avviaTimerRecupero = (recStr, label) => {
  const seconds = parseTimeToSeconds(recStr);
  startGlobalTimer(seconds, label);
};


// Parser delle stringhe di prescrizione speciali (es. 5x2(75%)|87,5KG|33,75L 77% o 3x6(78%)|45KG 92%)
const parsePrescription = (str) => {
  if (!str) return null;
  const cleanStr = str.trim();
  
  // Split by "|"
  const parts = cleanStr.split('|');
  if (parts.length >= 2) {
    const part1 = parts[0].trim();
    
    // Parse Part 1: reps and optional max (e.g. "5x2(75%)" or "3x12(60%)")
    const m1 = part1.match(/^([0-9xX\s-]+)\s*\(([^)]+)\)$/);
    const repsInfo = m1 ? m1[1].trim() : part1;
    const maxInfo = m1 ? m1[2].trim() : '';
    
    let totalWeight = '';
    let sideWeight = '';
    let effortInfo = '';
    
    if (parts.length === 3) {
      // 3 Parts: e.g. reps | total | side effort
      const part2 = parts[1].trim();
      const part3 = parts[2].trim();
      
      totalWeight = part2.replace(/KG/i, '').trim();
      
      // Check if part 3 has "L"
      const m3 = part3.match(/^([\d,.]+)\s*L\s*(.+)?$/i);
      if (m3) {
        sideWeight = m3[1].trim();
        effortInfo = m3[2] ? m3[2].trim() : '';
      } else {
        if (part3.toUpperCase().includes('L')) {
          sideWeight = part3.replace(/L/i, '').trim();
        } else {
          effortInfo = part3;
        }
      }
    } else if (parts.length === 2) {
      // 2 Parts: e.g. reps | total effort (without side weight)
      const part2 = parts[1].trim();
      
      // Look for effort (e.g. "86%")
      const m2Effort = part2.match(/(\d+(?:,\d+)?\s*%)$/);
      if (m2Effort) {
        effortInfo = m2Effort[1].trim();
        totalWeight = part2.substring(0, part2.lastIndexOf(m2Effort[1])).trim();
      } else {
        totalWeight = part2;
      }
      
      totalWeight = totalWeight.replace(/KG/i, '').trim();
    }
    
    return {
      reps: repsInfo,
      max: maxInfo ? (maxInfo.includes('%') ? maxInfo : maxInfo + '%') : '',
      total: totalWeight,
      side: sideWeight || null,
      effort: effortInfo ? (effortInfo.includes('%') ? effortInfo : effortInfo + '%') : ''
    };
  }
  return null;
};

const formattaPrescrizioneSemplice = (str) => {
  if (!str) return '';
  const parsed = parsePrescription(str);
  if (parsed) {
    let res = `${parsed.reps} @ ${parsed.total} kg`;
    if (parsed.side) {
      res += ` (${parsed.side} kg per lato)`;
    }
    if (parsed.max) {
      res += ` • ${parsed.max} Max`;
    }
    if (parsed.effort) {
      res += ` • ${parsed.effort} Sforzo`;
    }
    return res;
  }
  return str;
};

const formattaCaricoCompatto = (val) => {
  if (!val) return '-';
  let clean = String(val).trim();
  // Rimuove 'kg' o 'KG' con spazi opzionali
  clean = clean.replace(/\s*kg/i, '');
  // Tronca se troppo lungo per mantenere l'interfaccia compatta
  if (clean.length > 5) {
    return clean.substring(0, 4) + '..';
  }
  return clean;
};

const parseRmtString = (str) => {
  if (!str) return null;
  const regex = /(?:\(+)?\s*(\*+[¹²³⁴⁵⁶⁷⁸⁹\d]*)\s*1RMT?:\s*([\d,.]+)\s*KG\s*~([\d,.]+)(?:\s*KG)?\s*(?:del|del\s+)?\s*([\d/]+)(?:\s*([↓↑]\s*\d+%))?\s*(?:\)+)?/i;
  const match = str.trim().match(regex);
  if (match) {
    const rawStelle = match[1];
    const starsCount = (rawStelle.match(/\*/g) || []).length;
    const subLevel = rawStelle.replace(/\*/g, ''); // Estragge il superscript
    return {
      stelle: '*'.repeat(starsCount),
      subLivello: subLevel,
      massimale: match[2],
      prossimo: match[3],
      data: match[4],
      variazione: match[5] || ''
    };
  }
  return null;
};

const formattaRmtSemplice = (str) => {
  if (!str) return '';
  const parsed = parseRmtString(str);
  if (parsed) {
    let result = `Livello Forza: ${parsed.stelle}`;
    if (parsed.subLivello) {
      result += `${parsed.subLivello}`;
    }
    result += ` • 1RMT: ${parsed.massimale} kg (Target: ~${parsed.prossimo} kg)`;
    if (parsed.variazione) {
      result += ` • Delta: ${parsed.variazione}`;
    }
    return result;
  }
  return str;
};

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

const isVolumeString = (str) => {
  if (!str) return false;
  return /V:\s*[\d,.]+\s+A:\s*[\d,.]+/i.test(str);
};

const parseVolumeString = (str) => {
  if (!str) return null;
  const regex = /V:\s*([\d,.]+)\s+A:\s*([\d,.]+)\s+B:\s*([\d,.]+)(?:\s+C:\s*([\d,.]+))?/i;
  const match = str.trim().match(regex);
  if (match) {
    return {
      v: match[1],
      a: match[2],
      b: match[3],
      c: match[4] || '0'
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

// Funzione per rimappare gli URL delle GIF dal dominio scaduto o vecchio a GitHub Pages con cartelle corrette
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
      'Quadriceps_file': 'Quadricipiti',
      'GluteusMaximus_file': 'Glutei',
      'DeltoidLateral_file': 'DeltoidiLaterali',
      'LatissimusDorsi_file': 'DorsaliLat',
      'HipAbductor_file': 'GluteiMed',
      'DeltoidAnterior_file': 'DeltoidiAnteriori',
      'Biceps_file': 'Bicipiti',
      'Soleus_file': 'Soleo',
      'HipAdductors_file': 'Adduttori',
      'RectusAbdomis_file': 'Addome',
      'Brachioradialis_file': 'Brachioradiali',
      'Gastrocnemius_file': 'Gastrocnemio',
      'Brachialis_file': 'Brachiali',
      'HipFlexors_file': 'FlessoriAnca',
      'ErectorSpinae_file': 'ErettoriSpinali',
      'Intrarotatori_file': 'Intrarotatori',
      'Cardio_file': 'Cardio',
      'Mobility_file': 'Mobilita',
      'Infraspinatus_file': 'Sovraspinato',
      'TrapeziusUpper_file': 'Trapezio'
    };
    for (const [expiredFolder, githubFolder] of Object.entries(mappings)) {
      if (mapped.includes(expiredFolder)) {
        mapped = mapped.replace(expiredFolder, githubFolder);
        break;
      }
    }
    return mapped;
  }
  return url;
};

// Stato
const atletaSelezionato = ref(selectedAthlete.value);
const schedaSelezionata = ref(selectedSheet.value);
const giornoSelezionato = ref('A');

const caricamento = ref(true);
const listaAllenamenti = ref([]);
const headerGiorno = ref(null);
const eserciziFiltrati = ref([]);
const allExercisesBackup = ref([]);

const haEsercizioPrecedenteReale = (ex) => {
  if (!ex) return false;
  if (!ex.num_coord_ex_wo_prec) return false;
  
  const nomeEx = String(ex.des_esercizio || '').trim().toLowerCase();
  const currentNumScheda = parseInt(ex.num_scheda);
  const keyIdCliente = Object.keys(ex).find(k => k.includes('ID_cliente')) || 'ID_cliente';
  const atletaId = ex[keyIdCliente] || '';

  if (!nomeEx || isNaN(currentNumScheda) || !atletaId) return false;

  // Cerca nel backup se c'è un esercizio con lo stesso nome in una scheda precedente
  const hasPast = allExercisesBackup.value.some(b => {
    const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
    return String(bAtletaId) === String(atletaId) &&
           String(b.des_esercizio || '').trim().toLowerCase() === nomeEx &&
           parseInt(b.num_scheda) < currentNumScheda &&
           parseInt(b.num_riga_giorno) > 0;
  });

  return hasPast;
};

const listaGiorniDisponibili = computed(() => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) {
    return [];
  }
  const giorni = new Set();
  listaAllenamenti.value.forEach(item => {
    const g = (item.des_giorno || '').trim().toUpperCase();
    if (g) {
      giorni.add(g);
    }
  });
  
  if (giorni.size === 0) {
    return [];
  }
  
  return Array.from(giorni).sort();
});

const transitionName = ref('swipe-left');

// Gestione direzione swipe
watch(giornoSelezionato, (newVal, oldVal) => {
  const days = listaGiorniDisponibili.value;
  const oldIdx = days.indexOf(oldVal);
  const newIdx = days.indexOf(newVal);
  if (oldIdx !== -1 && newIdx !== -1 && oldVal !== newVal) {
    if ((newIdx > oldIdx && !(oldIdx === 0 && newIdx === days.length - 1)) || (oldIdx === days.length - 1 && newIdx === 0)) {
      transitionName.value = 'swipe-left';
    } else {
      transitionName.value = 'swipe-right';
    }
  }
});

// Stato di completamento dei giorni per la settimana attiva globale
const statoGiorni = computed(() => {
  const result = {};
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return result;

  const w = settimanaAttiva.value;
  listaGiorniDisponibili.value.forEach(g => {
    const header = listaAllenamenti.value.find(
      item => (item.des_giorno || '').trim().toUpperCase() === g && parseInt(item.num_riga_giorno) === 0
    );
    if (!header) {
      result[g] = 'none';
      return;
    }
    const isChiusa = isCmpTrue(header['cmp' + w]);
    result[g] = isChiusa ? 'completed' : 'pending';
  });
  return result;
});

// Trova l'ultima settimana chiusa (cmp = true) per un determinato giorno
const ultimoChiusoPerGiorno = (g) => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return '';
  const header = listaAllenamenti.value.find(
    item => (item.des_giorno || '').trim().toUpperCase() === g.trim().toUpperCase() && parseInt(item.num_riga_giorno) === 0
  );
  if (!header) return '';
  for (let w = 6; w >= 1; w--) {
    if (isCmpTrue(header['cmp' + w])) {
      return 'W' + w;
    }
  }
  return '';
};

// Raggruppa gli esercizi consecutivi in blocchi (singoli o superset)
const blocchiEsercizi = computed(() => {
  const blocks = [];
  let currentSuperset = null;
  
  eserciziFiltrati.value.forEach((ex) => {
    const ss = (ex.alf_superserie || '').trim().toUpperCase();
    if (ss) {
      if (currentSuperset && currentSuperset.letter === ss) {
        currentSuperset.exercises.push(ex);
      } else {
        currentSuperset = {
          type: 'superset',
          letter: ss,
          exercises: [ex]
        };
        blocks.push(currentSuperset);
      }
    } else {
      currentSuperset = null;
      blocks.push({
        type: 'single',
        exercise: ex
      });
    }
  });
  return blocks;
});

// Progresso sessione per barra di avanzamento (Energy Bar)
const progressoSessione = computed(() => {
  if (!eserciziFiltrati.value || eserciziFiltrati.value.length === 0) {
    return { completate: 0, totali: 0, percentuale: 0 };
  }
  
  let totali = 0;
  let completate = 0;
  
  eserciziFiltrati.value.forEach(ex => {
    const prescrizione = ex['des_week' + settimanaAttivaGiorno.value] || ex.des_qta_report || '';
    
    // Estraiamo il numero di serie (es. "4x8" -> 4, "3/4x12" -> 3)
    let sets = 3;
    const match = String(prescrizione).trim().toLowerCase().match(/^(\d+)(?:\s*[-/]\s*\d+)?\s*[x*]/);
    if (match) {
      sets = parseInt(match[1]) || 3;
    }
    
    totali += sets;
    
    const logVal = ex['ins_week' + settimanaAttivaGiorno.value] || '';
    if (logVal && logVal.trim() !== '' && logVal.trim() !== '-') {
      completate += sets;
    }
  });
  
  if (totali === 0) {
    totali = eserciziFiltrati.value.length;
    completate = eserciziFiltrati.value.filter(ex => {
      const logVal = ex['ins_week' + settimanaAttivaGiorno.value] || '';
      return logVal && logVal.trim() !== '' && logVal.trim() !== '-';
    }).length;
  }
  
  const percentuale = totali > 0 ? Math.round((completate / totali) * 100) : 0;
  return { completate, totali, percentuale };
});

const getProgressoGiorno = (g) => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) {
    return { completate: 0, totali: 0, percentuale: 0 };
  }
  
  const exercises = listaAllenamenti.value.filter(
    item => (item.des_giorno || '').trim().toUpperCase() === g.trim().toUpperCase() && parseInt(item.num_riga_giorno) > 0
  );
  if (exercises.length === 0) return { completate: 0, totali: 0, percentuale: 0 };
  
  let totali = 0;
  let completate = 0;
  const w = settimanaAttiva.value;
  
  exercises.forEach(ex => {
    const prescrizione = ex['des_week' + w] || ex.des_qta_report || '';
    let sets = 3;
    const match = String(prescrizione).trim().toLowerCase().match(/^(\d+)(?:\s*[-/]\s*\d+)?\s*[x*]/);
    if (match) {
      sets = parseInt(match[1]) || 3;
    }
    
    totali += sets;
    const logVal = ex['ins_week' + w] || '';
    if (logVal && logVal.trim() !== '' && logVal.trim() !== '-') {
      completate += sets;
    }
  });
  
  if (totali === 0) {
    totali = exercises.length;
    completate = exercises.filter(ex => {
      const logVal = ex['ins_week' + w] || '';
      return logVal && logVal.trim() !== '' && logVal.trim() !== '-';
    }).length;
  }
  
  const percentuale = totali > 0 ? Math.round((completate / totali) * 100) : 0;
  return { completate, totali, percentuale };
};


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


// Stato apertura/chiusura ordine esecuzione
const ordineEsecuzioneAperto = ref(false);

// Ordine completo esecuzione proposto: esercizi del giorno + recuperi integrati
const ordineEsecuzioneCompleto = computed(() => {
  if (eserciziFiltrati.value.length === 0) return [];
  
  const w = settimanaAttivaGiorno.value;
  const lista = [];
  
  // 1. Aggiungi tutti gli esercizi del giorno corrente
  eserciziFiltrati.value.forEach((ex) => {
    const val = ex['ins_week' + w] || '';
    const completato = val && val.trim() !== '' && !haRecupero(val);
    const prescrizione = formattaPrescrizioneSemplice(ex['des_week' + w]) || ex.des_qta_report || '';
    const ss = (ex.alf_superserie || '').trim().toUpperCase();
    
    lista.push({
      id: ex.id,
      nome: ex.des_esercizio || 'Esercizio',
      settore: ex.des_settore || 'Corpo Libero',
      prescrizione: prescrizione,
      tipo: 'giorno',
      completato,
      superserie: ss || null,
      complessita: classificaComplessitaEsercizio(ex.des_esercizio),
    });
  });
  
  // 2. Aggiungi gli esercizi da recuperare (da giorni precedenti), in ordine di complessità
  if (eserciziDaRecuperare.value.length > 0) {
    const recuperiOrdinati = [...eserciziDaRecuperare.value]
      .map(item => {
        const complessita = classificaComplessitaEsercizio(item.exercise.des_esercizio);
        const prescrizione = formattaPrescrizioneSemplice(item.prescrizione) || '';
        return {
          id: item.exercise.id,
          nome: item.exercise.des_esercizio || 'Esercizio',
          settore: item.exercise.des_settore || 'Corpo Libero',
          prescrizione: prescrizione,
          tipo: 'recupero',
          completato: false,
          superserie: null,
          complessita,
          weekRecupero: item.week,
        };
      })
      .sort((a, b) => a.complessita - b.complessita);
    
    // Inserimento intelligente: i compound vanno subito dopo gli esercizi principali del giorno,
    // isolamento dopo l'isolamento, core alla fine
    recuperiOrdinati.forEach(rec => {
      // Trova la posizione giusta: dopo l'ultimo esercizio del giorno con complessità <= alla rec
      let insertIdx = lista.length;
      for (let i = lista.length - 1; i >= 0; i--) {
        if (lista[i].complessita <= rec.complessita) {
          insertIdx = i + 1;
          break;
        }
      }
      lista.splice(insertIdx, 0, rec);
    });
  }
  
  return lista;
});

// Settimana Attiva importata da localStorage (placeholder iniziale)
const settimanaAttiva = ref(parseInt(localStorage.getItem('settimanaAttiva_' + selectedAthlete.value)) || 2);

const settimanaAttivaGiorno = computed(() => settimanaAttiva.value);


// Verifica se tutti gli esercizi del giorno sono stati compilati per la settimana attiva
const tuttiEserciziCompilatiGiorno = computed(() => {
  if (eserciziFiltrati.value.length === 0) return false;
  const w = settimanaAttivaGiorno.value;
  return eserciziFiltrati.value.every(ex => {
    const val = ex['ins_week' + w];
    return val && val.trim() !== '';
  });
});

// Mostra il promemoria "Settimana da chiudere" se tutti gli esercizi sono fatti ma la settimana è ancora aperta
const mostraPromemoriaChiusura = computed(() => {
  if (!headerGiorno.value) return false;
  const w = settimanaAttivaGiorno.value;
  const isChiusa = isCmpTrue(headerGiorno.value['cmp' + w]);
  return !isChiusa && tuttiEserciziCompilatiGiorno.value;
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
    if (localTimestamp <= item.timestamp) {
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
      return header && isCmpTrue(header['cmp' + w]);
    });
    if (!isChiusa) {
      return w;
    }
  }

  return 6; // Se tutte le settimane sono chiuse, ritorna l'ultima
};

// Carica tutti gli allenamenti della scheda attiva
const caricaAllenamenti = async () => {
  if (!selectedAthlete.value || !selectedSheet.value) return;

  atletaSelezionato.value = selectedAthlete.value;
  schedaSelezionata.value = selectedSheet.value;
  
  // Ottieni il giorno attivo configurato
  const salvatoGiorno = localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'A';
  giornoSelezionato.value = salvatoGiorno;

  caricamento.value = true;
  
  // 1. Carica preventivamente il backup JSON per le patch di sicurezza GIF
  let backupList = [];
  try {
    const res = await fetch('/storyboard_backup.json');
    allExercisesBackup.value = await res.json();
    backupList = allExercisesBackup.value;
  } catch (errBackup) {
    console.warn("Impossibile caricare backup locale in anticipo:", errBackup);
  }

  const patchMissingUrls = (records) => {
    if (!backupList || backupList.length === 0) return records;
    return records.map(ex => {
      // Se UrlNormal è mancante o non valido (es. vuoto o relativo WORKOUT_R_Images)
      if (!ex.UrlNormal || !ex.UrlNormal.startsWith('http')) {
        const matched = backupList.find(b => 
          String(b.ID_cliente) === String(ex.ID_cliente) &&
          String(b.num_scheda) === String(ex.num_scheda) &&
          String(b.des_giorno).trim() === String(ex.des_giorno).trim() &&
          parseInt(b.num_riga_giorno) === parseInt(ex.num_riga_giorno)
        );
        if (matched && matched.UrlNormal && matched.UrlNormal.startsWith('http')) {
          ex.UrlNormal = matched.UrlNormal;
        }
      }
      return ex;
    });
  };

  try {
     const q = query(
      collection(db, 'STORYBOARD'),
      where('ID_cliente', '==', selectedAthlete.value),
      where('num_scheda', '==', selectedSheet.value)
    );
    const querySnapshot = await getDocs(q);
    
    let temporanei = [];
    querySnapshot.forEach((doc) => {
      temporanei.push(applicaModificheLocali({ id: doc.id, ...doc.data() }));
    });

    // Applica la patch per ripristinare le URL delle GIF mancanti o corrotte da Firestore
    temporanei = patchMissingUrls(temporanei);

    // CONTROLLO DI SICUREZZA: se mancano le righe 0 in Firestore, carichiamole dal backup!
    const giorni = ['A', 'B', 'C', 'D'];
    let haMancanti = giorni.some(g => !temporanei.some(item => (item.des_giorno || '').trim() === g && parseInt(item.num_riga_giorno) === 0));
    if (haMancanti) {
      giorni.forEach(g => {
        const giaPresente = temporanei.some(item => (item.des_giorno || '').trim() === g && parseInt(item.num_riga_giorno) === 0);
        if (!giaPresente) {
          const backupHeader = backupList.find(
            item => String(item.ID_cliente) === String(selectedAthlete.value) &&
            String(item.num_scheda) === String(selectedSheet.value) &&
            (item.des_giorno || '').trim() === g &&
            parseInt(item.num_riga_giorno) === 0
          );
          if (backupHeader) {
            temporanei.push(applicaModificheLocali(backupHeader));
          }
        }
      });
    }

    listaAllenamenti.value = temporanei;

    // Ricalcola la settimana attiva globale
    const activeW = calcolaSettimanaAttivaGlobale(temporanei);
    settimanaAttiva.value = activeW;
    localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);

    filtraEserciziPerGiorno();
    scrollaAllUltimoEsercizio();
  } catch (error) {
    console.warn("Errore caricamento allenamenti da Firestore (quota esaurita), provo da backup locale:", error);
    const rawFiltrati = backupList.filter(
      item => String(item.ID_cliente) === String(selectedAthlete.value) && String(item.num_scheda) === String(selectedSheet.value)
    );
    const filtrati = rawFiltrati.map(applicaModificheLocali);
    listaAllenamenti.value = filtrati;

    // Ricalcola la settimana attiva globale
    const activeW = calcolaSettimanaAttivaGlobale(filtrati);
    settimanaAttiva.value = activeW;
    localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);

    filtraEserciziPerGiorno();
    scrollaAllUltimoEsercizio();
  } finally {
    caricamento.value = false;
  }
};

// Filtra ed ordina gli esercizi in base al giorno selezionato
const filtraEserciziPerGiorno = () => {
  let giorno = (giornoSelezionato.value || '').trim().toUpperCase();

  // Se il giorno selezionato non è tra quelli disponibili, seleziona il primo disponibile
  if (listaGiorniDisponibili.value.length > 0 && !listaGiorniDisponibili.value.includes(giorno)) {
    giorno = listaGiorniDisponibili.value[0];
    giornoSelezionato.value = giorno;
    localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giorno);
  }

  // Cerca la riga di intestazione (num_riga_giorno === 0 oppure '0')
  headerGiorno.value = listaAllenamenti.value.find(
    item => (item.des_giorno || '').trim().toUpperCase() === giorno && (parseInt(item.num_riga_giorno) === 0)
  ) || null;

  // Cerca gli esercizi reali del giorno (num_riga_giorno > 0)
  const filtrati = listaAllenamenti.value.filter(
    item => (item.des_giorno || '').trim().toUpperCase() === giorno && (parseInt(item.num_riga_giorno) > 0)
  );

  // Ordina per num_riga_giorno numerico
  filtrati.sort((a, b) => {
    const rigaA = parseInt(a.num_riga_giorno) || 0;
    const rigaB = parseInt(b.num_riga_giorno) || 0;
    return rigaA - rigaB;
  });

  eserciziFiltrati.value = filtrati;
  
  // Controllo di chiusura automatica se tutti compilati
  controllaEChiudiGiornoAutomatico();
};

// Salva e filtra quando si cambia scheda/giorno
const salvaGiornoSelezionato = (giorno) => {
  localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giorno);
  filtraEserciziPerGiorno();
};

// Gesture di swipe touch per cambiare giorno di allenamento
let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = (e) => {
  const touchEndX = e.changedTouches[0].clientX;
  const touchEndY = e.changedTouches[0].clientY;
  
  const diffX = touchEndX - touchStartX;
  const diffY = touchEndY - touchStartY;
  
  // Swipe orizzontale e sufficientemente lungo (> 80px), non verticale
  if (Math.abs(diffX) > 80 && Math.abs(diffY) < 50) {
    if (diffX < 0) {
      // Swipe a sinistra -> Giorno Successivo
      vaiAlGiornoSuccessivo();
    } else {
      // Swipe a destra -> Giorno Precedente
      vaiAlGiornoPrecedente();
    }
  }
};

const vaiAlGiornoSuccessivo = () => {
  if (listaGiorniDisponibili.value.length <= 1) return;
  const idx = listaGiorniDisponibili.value.indexOf(giornoSelezionato.value);
  if (idx !== -1) {
    const nextIdx = (idx + 1) % listaGiorniDisponibili.value.length;
    giornoSelezionato.value = listaGiorniDisponibili.value[nextIdx];
    salvaGiornoSelezionato(giornoSelezionato.value);
    vibraTattile(12);
  }
};

const vaiAlGiornoPrecedente = () => {
  if (listaGiorniDisponibili.value.length <= 1) return;
  const idx = listaGiorniDisponibili.value.indexOf(giornoSelezionato.value);
  if (idx !== -1) {
    let prevIdx = idx - 1;
    if (prevIdx < 0) {
      prevIdx = listaGiorniDisponibili.value.length - 1;
    }
    giornoSelezionato.value = listaGiorniDisponibili.value[prevIdx];
    salvaGiornoSelezionato(giornoSelezionato.value);
    vibraTattile(12);
  }
};

const impostaChiusuraGiorno = async (w, val) => {
  if (!headerGiorno.value) return;
  vibraTattile(val ? 25 : 15);
  
  const valString = val ? 'true' : 'false';
  const campoCmp = 'cmp' + w;
  const campoIns = 'ins_week' + w;

  // Rimuovi flag keepOpen se stiamo completando/chiudendo
  const athlete = selectedAthlete.value || 'default';
  const giorno = giornoSelezionato.value || 'A';
  const keepOpenKey = `keepOpen_${athlete}_${giorno}_W${w}`;
  if (val) {
    localStorage.removeItem(keepOpenKey);
  }
  
  // Aggiorna localmente
  headerGiorno.value[campoCmp] = valString;
  
  // Salva offline nel localStorage per consentire il funzionamento offline istantaneo
  const key1 = `offline_storyboard_${headerGiorno.value.id}`;
  let updates = {};
  const localData1 = localStorage.getItem(key1);
  if (localData1) {
    try { updates = JSON.parse(localData1); } catch (e) {}
  }
  updates[campoCmp] = valString;
  updates['timestamp'] = new Date().toISOString().replace('T', ' ').substring(0, 19);
  localStorage.setItem(key1, JSON.stringify(updates));

  // Salva su Firebase in background
  try {
    const docRef = doc(db, 'STORYBOARD', headerGiorno.value.id);
    await setDoc(docRef, { [campoCmp]: valString, timestamp: updates['timestamp'] }, { merge: true });
    console.log("Completamento giorno sincronizzato con Firebase!");
  } catch (err) {
    console.warn("Errore salvataggio completamento giorno Firebase:", err);
  }

  // Ricalcola la settimana attiva globale dopo il cambio di stato del giorno
  const activeW = calcolaSettimanaAttivaGlobale(listaAllenamenti.value);
  if (activeW !== settimanaAttiva.value) {
    settimanaAttiva.value = activeW;
    localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, activeW);
    filtraEserciziPerGiorno();
  }

  // Notifica all'utente se ci sono esercizi incompleti da recuperare alla chiusura
  if (val) {
    const haIncompleti = eserciziFiltrati.value.some(ex => {
      const valIns = ex['ins_week' + w] || '';
      return haRecupero(valIns);
    });
    if (haIncompleti) {
      dialogRecuperiAvviso.value = true;
    }
  }
};

const toggleGiornoAttivoRapido = async () => {
  if (!headerGiorno.value) return;
  const w = settimanaAttivaGiorno.value;
  const campoCmp = 'cmp' + w;
  const giaChiusa = isCmpTrue(headerGiorno.value[campoCmp]);
  
  // Imposta flag keepOpen se riapriamo manualmente il giorno
  if (giaChiusa) {
    const athlete = selectedAthlete.value || 'default';
    const giorno = giornoSelezionato.value || 'A';
    const keepOpenKey = `keepOpen_${athlete}_${giorno}_W${w}`;
    localStorage.setItem(keepOpenKey, 'true');
  }
  
  await impostaChiusuraGiorno(w, !giaChiusa);
};

const segnaComeFattoRapido = async (ex) => {
  vibraTattile(15);
  const w = settimanaAttivaGiorno.value;
  const campo = 'ins_week' + w;
  const valoreAttuale = (ex[campo] || '').trim();
  
  let nuovoValore = '';
  if (!valoreAttuale) {
    nuovoValore = '-'; // Segna come fatto con un trattino
  } else if (valoreAttuale === '-') {
    nuovoValore = ''; // Toglie il completamento
  } else {
    // Evita di sovrascrivere carichi reali inseriti a mano
    return;
  }

  // Aggiorna lo stato locale immediatamente
  ex[campo] = nuovoValore;
  
  // Salva offline nel localStorage
  const key1 = `offline_storyboard_${ex.id}`;
  let updates = {};
  const localData1 = localStorage.getItem(key1);
  if (localData1) {
    try { updates = JSON.parse(localData1); } catch (e) {}
  }
  updates[campo] = nuovoValore;
  updates['timestamp'] = new Date().toISOString().replace('T', ' ').substring(0, 19);
  localStorage.setItem(key1, JSON.stringify(updates));

  // Salva su Firebase in background
  try {
    const docRef = doc(db, 'STORYBOARD', ex.id);
    await setDoc(docRef, { [campo]: nuovoValore, timestamp: updates['timestamp'] }, { merge: true });
    console.log("Stato esercizio rapido salvato in Firebase!");
  } catch (err) {
    console.warn("Errore salvataggio esercizio rapido Firebase:", err);
  }

  // Esegui il controllo per la chiusura automatica
  controllaEChiudiGiornoAutomatico();
};

const controllaEChiudiGiornoAutomatico = async () => {
  // Disabilitata la chiusura automatica per consentire il controllo manuale esclusivo ed evitare confusioni.
  return;
};

const scrollaAllUltimoEsercizio = () => {
  const ultimoId = localStorage.getItem('ultimoEsercizioDettaglio');
  if (ultimoId) {
    nextTick(() => {
      setTimeout(() => {
        const el = document.getElementById('esercizio-' + ultimoId);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-exercise');
          setTimeout(() => {
            el.classList.remove('highlight-exercise');
          }, 1500);
        }
        localStorage.removeItem('ultimoEsercizioDettaglio');
      }, 100);
    });
  }
};

onMounted(() => {
  caricaAllenamenti();
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
});

// Ascolta cambiamenti globali
watch([selectedAthlete, selectedSheet], () => {
  caricaAllenamenti();
});

// Naviga al dettaglio dell'esercizio
const vaiAlDettaglio = (id) => {
  vibraTattile(10);
  router.push({ name: 'DettaglioWorkout', params: { id } });
};

const vaiAlDettaglioSessione = (id) => {
  if (id) {
    vibraTattile(12);
    router.push({ name: 'DettaglioSessione', params: { id } });
  }
};

const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

const mesocicloCompletato = computed(() => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return false;
  const righeZero = listaAllenamenti.value.filter(item => parseInt(item.num_riga_giorno) === 0);
  if (righeZero.length === 0) return false;
  return righeZero.every(header => {
    for (let w = 1; w <= 6; w++) {
      if (!isCmpTrue(header['cmp' + w])) return false;
    }
  });
});

const dialogProgressioni = ref(false);

const allineamentoProgramma = computed(() => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return null;
  
  const header = listaAllenamenti.value.find(
    item => parseInt(item.num_riga_giorno) === 0 && item.start_wo
  );
  
  if (!header || !header.start_wo) return null;
  
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
    if (!isNaN(t)) return new Date(t);
    return null;
  };

  const startDate = parseDateString(header.start_wo);
  if (!startDate) return null;

  const today = new Date();
  today.setHours(0,0,0,0);
  startDate.setHours(0,0,0,0);
  
  const diffTime = today.getTime() - startDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  let weekTeorica = Math.floor(diffDays / 7) + 1;
  if (weekTeorica < 1) weekTeorica = 1;
  
  const weekAttiva = settimanaAttiva.value;
  const delta = weekAttiva - weekTeorica;
  
  return {
    weekTeorica,
    weekAttiva,
    delta,
    status: delta === 0 ? 'in-linea' : (delta < 0 ? 'ritardo' : 'anticipo'),
    deltaAbs: Math.abs(delta)
  };
});

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
  doc.text(`Atleta: ${getNomeAtleta(atletaSelezionato.value) || 'N/D'}`, 15, y);
  doc.text(`Scheda: N. ${schedaSelezionata.value}`, 80, y);
  doc.text(`Stato Programma: ${mesocicloCompletato.value ? 'COMPLETATO' : 'ATTIVO'}`, 130, y);
  
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
  
  const items = listaAllenamenti.value || [];
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
  
  doc.save(`FlexCoach_Report_${(getNomeAtleta(atletaSelezionato.value) || 'Atleta').replace(/\s+/g, '_')}_Scheda_${schedaSelezionata.value}.pdf`);
};

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

  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return result;

  const parsePeso = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/,/g, '.').replace(/[^\d.]/g, ' ').trim();
    const parts = clean.split(/\s+/);
    const num = parseFloat(parts[0]);
    return isNaN(num) ? 0 : num;
  };

  let sommaFeeling = 0;
  let countFeeling = 0;

  listaAllenamenti.value.forEach(ex => {
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

  const righeZero = listaAllenamenti.value.filter(item => parseInt(item.num_riga_giorno) === 0);
  const totaleGiorni = righeZero.length;
  if (totaleGiorni > 0) {
    let totaleChiusurePossibili = totaleGiorni * 6;
    let chiusureEffettive = 0;
    
    for (let w = 1; w <= 6; w++) {
      let chiuseInWeek = 0;
      righeZero.forEach(header => {
        if (isCmpTrue(header['cmp' + w])) {
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


const ripristinaMesociclo = async () => {
  const conferma = confirm("Sei sicuro di voler resettare tutti i log e le spunte di questo mesociclo? L'operazione è irreversibile.");
  if (!conferma) return;
  
  caricamento.value = true;
  vibraTattile(50);
  
  try {
    const batch = writeBatch(db);
    for (const ex of listaAllenamenti.value) {
      const updates = {};
      if (parseInt(ex.num_riga_giorno) === 0) {
        for (let w = 1; w <= 6; w++) {
          updates['cmp' + w] = 'false';
          ex['cmp' + w] = 'false';
        }
      } else {
        for (let w = 1; w <= 6; w++) {
          updates['ins_week' + w] = '';
          updates['reps_week' + w] = '';
          ex['ins_week' + w] = '';
          ex['reps_week' + w] = '';
        }
        updates['num_ins6'] = '';
        updates['num_faticaw6'] = '';
        updates['ind_reps_start'] = '';
        ex['num_ins6'] = '';
        ex['num_faticaw6'] = '';
        ex['ind_reps_start'] = '';
      }
      
      updates['timestamp'] = new Date().toISOString().replace('T', ' ').substring(0, 19);
      ex['timestamp'] = updates['timestamp'];
      
      const key = `offline_storyboard_${ex.id}`;
      localStorage.setItem(key, JSON.stringify(updates));
      
      const docRef = doc(db, 'STORYBOARD', ex.id);
      batch.set(docRef, updates, { merge: true });
    }
    
    await batch.commit();
    settimanaAttiva.value = 1;
    localStorage.setItem('settimanaAttiva_' + selectedAthlete.value, 1);
    filtraEserciziPerGiorno();
    alert("Mesociclo resettato con successo! Puoi ripartire dalla Week 1.");
  } catch (err) {
    console.error("Errore reset mesociclo:", err);
    alert("Si è verificato un errore durante il reset del mesociclo.");
  } finally {
    caricamento.value = false;
  }
};

// --- LOGICA DI RECUPERO E COMPLETAMENTO ESERCIZI (COMBINAZIONE A+B) ---
const dialogRecuperiAvviso = ref(false);
const logRecuperi = ref({});
const recuperoAccordionAperto = ref(null);

const toggleRecuperoAccordion = (giorno) => {
  recuperoAccordionAperto.value = recuperoAccordionAperto.value === giorno ? null : giorno;
};

const haRecupero = (val) => {
  if (!val) return false;
  const str = String(val).toLowerCase();
  
  // Se è stato marcato come recuperato (esplicitamente o implicitamente), non richiede più recupero
  if (str.includes('[recuperato]') || str.includes('recuperato') || str.includes('recuperata') || str.includes('recuperati')) {
    return false;
  }
  
  // Se contiene il tag manuale inserito dal sistema
  if (str.includes('[recupera]')) {
    return true;
  }
  
  // Parole chiave comuni utilizzate dagli utenti per indicare esercizi incompleti o da recuperare
  const keywords = [
    'da finire',
    'da fare',
    'manca',
    'mancano',
    'saltato',
    'saltata',
    'saltati',
    'incompleto',
    'incompleta',
    'incompleti',
    'prossima volta',
    'prox volta',
    'altra serie',
    'altre serie',
    'da completare',
    'recupera',
    'recuperare',
    'non fatto',
    'non fatta',
    'non fatti',
    'fatto solo',
    'fatta solo',
    'fatte solo',
    'solo 1',
    'solo 2',
    'solo 3',
    'solo una',
    'solo due',
    'solo tre'
  ];
  
  return keywords.some(kw => str.includes(kw));
};

const impostaRecuperoValore = (valoreAttuale, attivo) => {
  let str = (valoreAttuale || '').trim();
  if (attivo) {
    if (!str.includes('[RECUPERA]')) {
      str = str ? `${str} [RECUPERA]` : '[RECUPERA]';
    }
  } else {
    str = str.replace(/\s*\[RECUPERA\]/g, '').trim();
  }
  return str;
};

const salvaValoreEsercizio = async (ex, w, valore) => {
  const campo = 'ins_week' + w;
  ex[campo] = valore;
  
  const key1 = `offline_storyboard_${ex.id}`;
  let updates = {};
  const localData1 = localStorage.getItem(key1);
  if (localData1) {
    try { updates = JSON.parse(localData1); } catch (e) {}
  }
  updates[campo] = valore;
  updates['timestamp'] = new Date().toISOString().replace('T', ' ').substring(0, 19);
  localStorage.setItem(key1, JSON.stringify(updates));

  try {
    const docRef = doc(db, 'STORYBOARD', ex.id);
    await setDoc(docRef, { [campo]: valore, timestamp: updates['timestamp'] }, { merge: true });
    console.log("Valore esercizio salvato con successo!");
  } catch (err) {
    console.warn("Errore salvataggio esercizio:", err);
  }
  
  controllaEChiudiGiornoAutomatico();
};

const toggleRecupero = async (ex, attivo) => {
  vibraTattile(15);
  const w = settimanaAttivaGiorno.value;
  const valoreAttuale = ex['ins_week' + w] || '';
  const nuovoValore = impostaRecuperoValore(valoreAttuale, attivo);
  await salvaValoreEsercizio(ex, w, nuovoValore);
};

const concludiRecuperoTesto = async (recItem) => {
  vibraTattile(20);
  const ex = recItem.exercise;
  const w = recItem.week;
  const key = ex.id + '_' + w;
  const inputNuovo = (logRecuperi.value[key] || '').trim();
  
  let valoreFinale = inputNuovo;
  if (!valoreFinale) {
    let original = recItem.originalVal.replace(/\s*\[RECUPERA\]/g, '').replace(/\s*\[RECUPERATO\]/g, '').trim();
    if (!original || original === '-') {
      valoreFinale = 'Recuperato';
    } else {
      valoreFinale = `${original} [RECUPERATO]`;
    }
  } else {
    valoreFinale = valoreFinale.replace(/\s*\[RECUPERA\]/g, '').replace(/\s*\[RECUPERATO\]/g, '').trim();
  }
  
  await salvaValoreEsercizio(ex, w, valoreFinale);
  logRecuperi.value[key] = '';
};

const eserciziDaRecuperare = computed(() => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return [];
  
  const giornoCorrente = (giornoSelezionato.value || '').trim().toUpperCase();
  if (!giornoCorrente) return [];
  
  const giorniOrdinati = listaGiorniDisponibili.value.map(g => g.toUpperCase());
  const idxCorrente = giorniOrdinati.indexOf(giornoCorrente);
  if (idxCorrente < 0) return [];
  
  const list = [];
  
  const headersMap = {};
  listaAllenamenti.value.forEach(item => {
    if (parseInt(item.num_riga_giorno) === 0) {
      const g = (item.des_giorno || '').trim().toUpperCase();
      headersMap[g] = item;
    }
  });

  listaAllenamenti.value.forEach(ex => {
    if (parseInt(ex.num_riga_giorno) === 0) return;
    
    const giornoEx = (ex.des_giorno || '').trim().toUpperCase();
    const idxEx = giorniOrdinati.indexOf(giornoEx);
    
    const header = headersMap[giornoEx];
    if (!header) return;
    
    for (let w = 1; w <= 6; w++) {
      let isPastSession = false;
      if (w < settimanaAttiva.value) {
        isPastSession = true;
      } else if (w === settimanaAttiva.value && idxEx >= 0 && idxEx < idxCorrente) {
        isPastSession = true;
      }
      
      if (isPastSession) {
        const giornoCompletato = isCmpTrue(header['cmp' + w]);
        if (giornoCompletato) {
          const val = ex['ins_week' + w] || '';
          if (haRecupero(val)) {
            const prescrizione = ex['des_week' + w] || ex.des_qta_report || '';
            list.push({
              exercise: ex,
              week: w,
              prescrizione,
              originalVal: val
            });
          }
        }
      }
    }
  });
  
  return list;
});

// Classificazione complessità esercizi per ordinamento intelligente
// Priorità: 1 = Multiarticolari pesanti (alto impatto SNC) → 2 = Multiarticolari leggeri → 3 = Isolamento → 4 = Core/Stabilità
const classificaComplessitaEsercizio = (nomeEsercizio) => {
  const nome = (nomeEsercizio || '').toLowerCase();
  
  // 1 — Multiarticolari pesanti (alto impatto SNC, eseguire per primi)
  const compound_heavy = [
    'squat', 'stacco', 'deadlift', 'panca piana', 'bench press',
    'military press', 'overhead press', 'pressa', 'leg press',
    'distensioni', 'trazioni', 'pull-up', 'chin-up', 'pullup',
    'rematore', 'row', 'hip thrust', 'clean', 'snatch', 'jerk',
    'good morning', 'front squat', 'back squat', 'bulgaro',
    'affondi', 'lunge', 'dip', 'muscle up'
  ];
  
  // 2 — Multiarticolari leggeri / accessori compound
  const compound_light = [
    'lat machine', 'lat pull', 'pulldown', 'cable row',
    'chest press', 'shoulder press', 'push up', 'piegamenti',
    'leg curl', 'leg extension', 'hack squat', 'step up',
    'tirata', 'alzate', 'remata', 'pulley', 'seated row',
    'incline', 'decline', 't-bar', 'pendlay'
  ];
  
  // 4 — Core e stabilità (eseguire per ultimi)
  const core = [
    'plank', 'crunch', 'addominali', 'obliqui', 'core',
    'sit up', 'sit-up', 'russian twist', 'hollow', 'ab wheel',
    'woodchop', 'pallof', 'bird dog', 'dead bug', 'superman',
    'hyperextension', 'iperestensioni', 'back extension'
  ];
  
  if (compound_heavy.some(kw => nome.includes(kw))) return 1;
  if (compound_light.some(kw => nome.includes(kw))) return 2;
  if (core.some(kw => nome.includes(kw))) return 4;
  return 3; // Default: isolamento / accessorio
};

const labelComplessita = (livello) => {
  switch (livello) {
    case 1: return '🔴 Alta intensità SNC';
    case 2: return '🟠 Compound accessorio';
    case 3: return '🟡 Isolamento';
    case 4: return '🟢 Core / Stabilità';
    default: return '';
  }
};

// Raggruppa gli esercizi da recuperare per giorno di origine
const recuperiRaggruppati = computed(() => {
  const grouped = {};
  eserciziDaRecuperare.value.forEach(item => {
    const g = (item.exercise.des_giorno || '').trim().toUpperCase();
    if (!grouped[g]) {
      grouped[g] = { giorno: g, esercizi: [] };
    }
    // Aggiungi livello di complessità per ordinamento
    const complessita = classificaComplessitaEsercizio(item.exercise.des_esercizio);
    grouped[g].esercizi.push({ ...item, complessita });
  });
  
  // Ordina per giorno, e dentro ogni giorno ordina per complessità (compound first → core last)
  const result = Object.values(grouped).sort((a, b) => a.giorno.localeCompare(b.giorno));
  result.forEach(gruppo => {
    gruppo.esercizi.sort((a, b) => a.complessita - b.complessita);
  });
  
  // Se l'accordion aperto non esiste più (esercizi completati), resetta a null
  if (recuperoAccordionAperto.value && !grouped[recuperoAccordionAperto.value]) {
    recuperoAccordionAperto.value = null;
  }
  
  return result;
});
</script>

<style scoped>
.max-width-container {
  max-width: 600px;
  margin: 0 auto;
}

.min-height-screen {
  min-height: calc(100vh - 140px);
}

.appsheet-header {
  border-bottom: 2px solid #f97316;
  padding-bottom: 12px;
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

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Card del Giorno (Riga 0) stile AppSheet */
.day-header-card {
  border-left: 6px solid #f97316 !important;
  background: rgba(249, 115, 22, 0.1) !important;
  border-top: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.clickable-header {
  cursor: pointer;
  transition: transform 0.2s ease, border-color 0.2s ease !important;
}

.clickable-header:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.4) !important;
}

.giorno-big-letter {
  background: linear-gradient(135deg, #e65100, #ff8f00);
  color: white;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  font-weight: 900;
  font-size: 1.5rem;
  box-shadow: 0 4px 10px rgba(230, 81, 0, 0.3);
  flex-shrink: 0;
}

/* Card Esercizio */
.exercise-item-card {
  /* Eredita Glassmorphism globale da style.css */
  cursor: pointer;
}

.thumbnail-wrapper {
  width: 84px;
  height: 84px;
  flex-shrink: 0;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.2);
}

.leading-tight {
  line-height: 1.25;
}

.min-width-0 {
  min-width: 0;
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

/* Stili per il box telemetria */
.bg-orange-darken-3-op {
  background: rgba(249, 115, 22, 0.08) !important;
}
.border-orange-darken-3-op {
  border: 1px solid rgba(249, 115, 22, 0.2) !important;
}
.border-soft {
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}
.bg-slate-900 {
  background: rgba(15, 23, 42, 0.5) !important;
}
.bg-slate-800 {
  background: rgba(30, 41, 59, 0.4) !important;
}
.prescription-chip-box {
  background: rgba(30, 41, 59, 0.35) !important;
  border: 1px solid rgba(255, 255, 255, 0.04);
}
.text-super-caption {
  font-size: 0.65rem !important;
  letter-spacing: 0.04em;
}
.border-top-soft {
  border-top: 1px solid rgba(255, 255, 255, 0.05) !important;
}

/* Segmenti capsule per il progresso delle settimane */
.mini-weeks-progression {
  margin-top: 2px !important;
}

.mini-week-capsule {
  font-size: 0.62rem;
  font-weight: 800;
  padding: 1px 5px;
  border-radius: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  min-width: 25px;
  height: 15px;
}

.capsule-completed {
  background: rgba(16, 185, 129, 0.18) !important;
  border: 1px solid rgba(16, 185, 129, 0.45) !important;
  color: #10b981 !important;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.12);
}

.capsule-active {
  background: linear-gradient(135deg, #ea580c, #f97316) !important;
  color: white !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.4);
  transform: scale(1.05);
}

.capsule-pending {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #cbd5e1 !important;
  opacity: 0.75;
}

.capsule-num {
  font-size: 0.55rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

/* Nuovi Stili Premium per le Superserie (Supersets) */
.superset-group-card {
  background: rgba(249, 115, 22, 0.02) !important;
  border: 1.5px solid rgba(249, 115, 22, 0.25) !important;
  box-shadow: 0 8px 32px 0 rgba(249, 115, 22, 0.05) !important;
  transition: transform 0.2s ease, border-color 0.2s ease !important;
}

.superset-group-card:hover {
  transform: translateY(-2px);
  border-color: rgba(249, 115, 22, 0.45) !important;
}

.border-superset {
  border-left: 6px solid #ea580c !important;
}

.superset-exercise-item {
  transition: background-color 0.2s ease;
  border-radius: 8px;
  padding-left: 8px;
  padding-right: 8px;
}

.superset-exercise-item:hover {
  background-color: rgba(255, 255, 255, 0.03);
}

.superset-connector-line {
  position: absolute;
  left: 45px; /* Centrato rispetto alla miniatura da 76px (8px padding + 38px metà larghezza) */
  top: 72px; /* Inizia sotto la miniatura */
  bottom: -22px; /* Si estende fino alla miniatura successiva */
  width: 2px;
  border-left: 2px dashed rgba(249, 115, 22, 0.35);
  pointer-events: none;
  z-index: 1;
}

.superset-exercises-wrapper {
  position: relative;
}

.sticky-tabs-container {
  position: sticky !important;
  z-index: 99 !important;
  background: #030712 !important; /* solid background matching body to hide scrolling content */
  padding-top: 8px !important;
  padding-bottom: 8px !important;
  margin-top: -8px !important;
}

@keyframes pulse-active-icon {
  0%, 100% {
    opacity: 1;
    transform: scale(1);
    filter: drop-shadow(0 0 1px rgba(249, 115, 22, 0.4));
  }
  50% {
    opacity: 0.7;
    transform: scale(1.15);
    filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.8));
  }
}
.pulse-active-tab-icon {
  animation: pulse-active-icon 1.8s infinite ease-in-out;
}

/* Day Selection Tabs Styling */
.sticky-tabs-container .v-tab {
  transition: all 0.3s ease !important;
  border-radius: 12px !important;
  margin: 4px 6px !important;
  height: calc(100% - 8px) !important;
  min-width: 0 !important;
}

.sticky-tabs-container .v-tab--selected {
  background: rgba(249, 115, 22, 0.18) !important;
  border: 1.5px solid rgba(249, 115, 22, 0.5) !important;
  color: #ea580c !important;
  box-shadow: 0 4px 12px rgba(234, 88, 12, 0.15) !important;
}
.sticky-tabs-container .v-tabs-slider,
.sticky-tabs-container .v-tabs-slider-wrapper,
.sticky-tabs-container .v-tab-slider,
.sticky-tabs-container .v-tab-slider-wrapper,
.sticky-tabs-container :deep(.v-tabs-slider),
.sticky-tabs-container :deep(.v-tabs-slider-wrapper),
.sticky-tabs-container :deep(.v-tab-slider),
.sticky-tabs-container :deep(.v-tab-slider-wrapper) {
  display: none !important;
  height: 0 !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

.sticky-tabs-container .v-tabs,
.sticky-tabs-container .v-slide-group,
.sticky-tabs-container .v-slide-group__container,
.sticky-tabs-container :deep(.v-tabs),
.sticky-tabs-container :deep(.v-slide-group),
.sticky-tabs-container :deep(.v-slide-group__container) {
  border-bottom: none !important;
  border-bottom-width: 0 !important;
  box-shadow: none !important;
}

@keyframes highlight-glow {
  0% {
    background-color: rgba(249, 115, 22, 0.25) !important;
    box-shadow: 0 0 15px rgba(249, 115, 22, 0.4) !important;
  }
  100% {
    background-color: transparent !important;
    box-shadow: none !important;
  }
}
.highlight-exercise {
  animation: highlight-glow 1.5s ease-out;
}

/* Swipe transitions */
.swipe-transition-wrapper {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  width: 100%;
}

/* Swipe Left (moving forward) */
.swipe-left-enter-active,
.swipe-left-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.swipe-left-enter-from {
  opacity: 0;
  transform: translateX(30px);
}
.swipe-left-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

/* Swipe Right (moving backward) */
.swipe-right-enter-active,
.swipe-right-leave-active {
  transition: all 0.18s cubic-bezier(0.4, 0, 0.2, 1);
}
.swipe-right-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}
.swipe-right-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

/* Skeleton loader for days tabs */
.skeleton-tab-item {
  width: 52px;
  height: 20px;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  animation: skeleton-pulse-tab 1.5s infinite ease-in-out;
}

@keyframes skeleton-pulse-tab {
  0%, 100% {
    opacity: 0.6;
    background: rgba(255, 255, 255, 0.08);
  }
  50% {
    opacity: 0.35;
    background: rgba(255, 255, 255, 0.12);
  }
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

/* Stili per pallini serie e input compatti */
.dot-set-btn {
  margin: 0 !important;
  padding: 0 !important;
}
.dot-set-btn:hover {
  background: rgba(255, 255, 255, 0.05) !important;
}

.custom-compact-input :deep(.v-field) {
  height: 32px !important;
  font-size: 0.75rem !important;
  background: rgba(0, 0, 0, 0.2) !important;
  border-radius: 8px !important;
}
.recovery-compact-input :deep(input) {
  padding: 0px !important;
  height: 26px !important;
}

.day-header-section {
  background: rgba(30, 41, 59, 0.35) !important;
  cursor: pointer;
  transition: background 0.2s ease;
}
.day-header-section:hover {
  background: rgba(30, 41, 59, 0.55) !important;
}
.day-header-section:active {
  background: rgba(30, 41, 59, 0.7) !important;
}

.heatmap-container {
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  transition: border-color 0.3s ease;
}

.recovery-compact-input :deep(.v-field) {
  height: 26px !important;
  font-size: 0.7rem !important;
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}
.recovery-compact-input :deep(.v-field--focused) {
  background: rgba(255, 255, 255, 0.18) !important;
  border-color: #f97316 !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.5) !important;
}
.recovery-compact-input :deep(.v-field__outline) {
  display: none !important;
}

.custom-compact-input :deep(.v-field) {
  height: 32px !important;
  font-size: 0.75rem !important;
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}
.custom-compact-input :deep(.v-field--focused) {
  background: rgba(255, 255, 255, 0.18) !important;
  border-color: #f97316 !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.5) !important;
}
.custom-compact-input :deep(.v-field__outline) {
  display: none !important;
}

.custom-compact-input :deep(.v-field__input) {
  padding-top: 4px !important;
  padding-bottom: 4px !important;
  min-height: 32px !important;
}
.custom-compact-input :deep(.v-label) {
  top: 6px !important;
  font-size: 0.75rem !important;
  opacity: 0.4 !important;
}
</style>