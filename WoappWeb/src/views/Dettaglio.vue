<template>
  <v-container class="px-3 py-4 max-width-container bg-slate-50 min-height-screen pb-12">
    <!-- Header Sticky Wrapper -->
    <div class="sticky-detail-header">
      <!-- Barra Superiore con pulsante indietro stile AppSheet -->
      <div class="d-flex align-center justify-space-between mb-3 appsheet-top-bar">
        <v-btn
          icon
          color="orange-darken-3"
          variant="text"
          @click="tornaIndietro"
          id="btn-dettaglio-indietro"
        >
          <v-icon size="28">mdi-arrow-left</v-icon>
        </v-btn>
        <div class="d-flex align-center justify-center flex-grow-1 px-2 text-truncate" style="gap: 8px;">
          <v-chip
            v-if="workout?.num_riga_giorno"
            color="orange-darken-3"
            size="small"
            class="font-weight-black text-white px-2 py-0.5 flex-shrink-0"
            variant="flat"
          >
            Es. {{ workout.num_riga_giorno }}
          </v-chip>
          <h3 class="text-subtitle-1 font-weight-black text-slate-dark text-truncate mb-0">
            {{ workout?.des_esercizio || 'Dettaglio Esercizio' }}
          </h3>
        </div>
        <v-btn icon color="slate-dark" variant="text" @click="caricaDatiEsercizio"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>

      <!-- Avviso Giorno Completato -->
      <v-card
        v-if="workout && isWeekCompleted(settimanaAttiva)"
        class="py-2.5 px-4 mb-3 text-left border d-flex align-center card-glass"
        style="background: rgba(16, 185, 129, 0.08) !important; border: 1.5px solid rgba(16, 185, 129, 0.25) !important; box-shadow: 0 4px 20px rgba(16, 185, 129, 0.05); border-radius: 12px !important;"
      >
        <v-icon color="green-lighten-2" class="mr-3 flex-shrink-0" size="20">mdi-check-circle-outline</v-icon>
        <div class="text-slate-dark" style="font-size: 0.75rem; line-height: 1.45;">
          <strong class="text-green-lighten-2">Giorno Completato!</strong> Questa sessione è già stata contrassegnata come completata per la <strong class="text-white">Week {{ settimanaAttiva }}</strong>.
        </div>
      </v-card>
    </div>

    <!-- Swipe indicator hint -->
    <div class="text-center mb-3 mt-n2 opacity-60 d-flex align-center justify-center gap-1">
      <v-icon size="14" color="grey">mdi-gesture-swipe-horizontal</v-icon>
      <span class="text-super-caption text-muted font-weight-bold uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">Swipe per scorrere gli esercizi</span>
    </div>

    <!-- Stato di caricamento -->
    <div v-if="caricamento" class="text-center my-12">
      <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
      <p class="mt-2 text-caption text-muted">Caricamento dettagli esercizio...</p>
    </div>

    <!-- Errore o esercizio non trovato -->
    <div v-else-if="!workout" class="text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="64" color="red-lighten-2" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h3 class="text-h6 font-weight-bold text-slate-dark">Esercizio non trovato</h3>
    </div>

    <!-- Contenuto Principale (Stile AppSheet verticale fedele) -->
    <div v-else class="exercise-detail-area">

      <!-- 1. Grande GIF dell'Esercizio in alto -->
      <v-card class="image-premium-frame rounded-xl overflow-hidden mb-3 elevation-2 bg-black mx-auto" max-width="280" height="150">
        <v-img
          :src="getGifUrl(workout.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600'"
          contain
          class="bg-black"
          height="100%"
        >
          <template v-slot:placeholder>
            <div class="fill-height d-flex align-center justify-center bg-black">
              <v-progress-circular indeterminate color="orange"></v-progress-circular>
            </div>
          </template>
        </v-img>
      </v-card>

      <!-- 2. Intestazione Principale con Massimale / RMT -->
      <div class="mb-2 text-left">
        <h2 class="text-h6 font-weight-black text-slate-dark leading-tight d-flex align-center flex-wrap gap-1" style="font-size: 1.1rem; line-height: 1.2;">
          <v-icon color="orange-darken-3" class="mr-1" size="18">mdi-trophy-outline</v-icon>
          {{ workout.des_esercizio }}
        </h2>

        <!-- Visualizzazione RMT Formattata Premium Gamified -->
        <div v-if="parsedRmt(workout.des_esercizio_2)" class="rmt-premium-card mt-3 pa-3 rounded-xl card-glass border-orange-darken-3-op">
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center gap-1.5 flex-wrap">
              <span class="text-caption text-muted font-weight-black uppercase mr-1" style="font-size: 0.65rem;">Livello Forza:</span>
              <div class="d-flex align-center gap-0.5">
                <v-icon
                  v-for="i in parsedRmt(workout.des_esercizio_2).stelle"
                  :key="i"
                  color="amber-darken-2"
                  size="16"
                >
                  mdi-star
                </v-icon>
              </div>
              <v-chip
                :color="parsedRmt(workout.des_esercizio_2).livelloColore"
                size="x-small"
                class="font-weight-black uppercase text-super-caption px-2 py-0.5 ml-1.5 elevation-1"
                variant="flat"
                style="letter-spacing: 0.05em;"
              >
                {{ parsedRmt(workout.des_esercizio_2).livelloTesto }}
              </v-chip>
            </div>
            <div class="d-flex align-center gap-2">
              <span v-if="parsedRmt(workout.des_esercizio_2).variazione" class="text-super-caption font-weight-black px-1.5 py-0.5 rounded-lg d-flex align-center animate-pulse" :style="{ backgroundColor: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? '#f87171' : '#34d399', fontSize: '0.62rem', border: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)' }">
                {{ parsedRmt(workout.des_esercizio_2).variazione }}
              </span>
              <span class="text-super-caption text-muted font-weight-bold">
                Aggiornato il {{ parsedRmt(workout.des_esercizio_2).data }}
              </span>
            </div>
          </div>

          <v-row dense class="align-center">
            <v-col cols="6" class="border-right-soft">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block">Massimale Teorico (1RMT)</span>
                <span class="text-h6 font-weight-black text-orange-darken-3">
                  {{ parsedRmt(workout.des_esercizio_2).massimale }} <span class="text-caption text-muted">KG</span>
                </span>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block">Target Prossimo Livello</span>
                <span class="text-h6 font-weight-black text-slate-dark">
                  ~{{ parsedRmt(workout.des_esercizio_2).prossimoLivello }} <span class="text-caption text-muted">KG</span>
                </span>
              </div>
            </v-col>
          </v-row>

          <!-- RPG Level-up Progress Bar -->
          <div class="mt-3 px-1 border-top-soft pt-2">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.6rem;">Progresso Prossima Stella</span>
              <span class="text-super-caption text-amber-darken-2 font-weight-black" style="font-size: 0.6rem;">
                {{ getRmtProgress(parsedRmt(workout.des_esercizio_2)) }}% completato
              </span>
            </div>
            <v-progress-linear
              :model-value="getRmtProgress(parsedRmt(workout.des_esercizio_2))"
              color="amber-darken-2"
              height="5"
              rounded
              striped
              active
              class="elevation-1"
            ></v-progress-linear>
            <span class="text-super-caption text-muted font-weight-bold d-block mt-1 text-right" style="font-size: 0.58rem;">
              Carica ancora <span class="text-amber-lighten-2 font-weight-black">~{{ parsedRmt(workout.des_esercizio_2).prossimoLivello }} KG</span> per salire di livello!
            </span>
          </div>
        </div>

        <!-- Fallback se des_esercizio_2 non è una stringa RMT speciale -->
        <div v-else-if="workout.des_esercizio_2" class="text-subtitle-2 font-weight-black text-red-darken-3 mt-1 uppercase">
          {{ workout.des_esercizio_2 }}
        </div>

        <!-- Rigo Dettaglio Rapido -->
        <div class="text-caption font-weight-bold text-slate mt-1 d-flex align-center flex-wrap gap-1.5">
          <v-chip color="orange-darken-3" size="x-small" class="font-weight-black px-2 py-0.5" variant="flat">{{ workout.des_settore }}</v-chip>
          <v-chip
            v-if="workout.des_rec_report"
            color="orange-darken-3"
            variant="tonal"
            size="x-small"
            class="font-weight-black clickable-timer-chip px-2 py-0.5"
            prepend-icon="mdi-clock-outline"
            @click="avviaTimerRecupero(workout.des_rec_report, workout.des_esercizio)"
          >
            ⏱️ {{ workout.des_rec_report }}
          </v-chip>
          <!-- Mostra "VAI AL PROSSIMO" solo se è in superserie E non ha recupero -->
          <v-chip
            v-else-if="workout.alf_superserie"
            color="green-darken-3"
            variant="flat"
            size="x-small"
            class="font-weight-black text-white px-2 py-0.5"
            prepend-icon="mdi-arrow-right-bold-circle-outline"
          >
            ⚡ PROSSIMO (NO PAUSA)
          </v-chip>
        </div>
      </div>

      <!-- Banner Superserie e Lista Esercizi Associati -->
      <div v-if="workout.alf_superserie" class="mb-4">
        <v-card class="superset-detail-card rounded-xl pa-3 border-superset elevation-2 text-left">
          <div class="d-flex align-center mb-2">
            <v-chip color="orange-darken-3" class="font-weight-black text-white px-1.5 py-0.5 mr-2 animate-pulse-slow" variant="flat" size="x-small" style="height: 18px; font-size: 0.55rem;">
              ⚡ SUPERSET {{ workout.alf_superserie }}
            </v-chip>
            <span v-if="workout.des_rec_report" class="text-caption font-weight-black text-orange-lighten-2" style="font-size: 0.7rem;">
              (Riposati ora)
            </span>
            <span v-else class="text-caption font-weight-black text-orange-lighten-2" style="font-size: 0.7rem;">
              Esegui in sequenza senza pausa!
            </span>
          </div>
          
          <p v-if="workout.des_rec_report" class="text-slate font-weight-medium mb-2 leading-tight" style="font-size: 0.7rem; line-height: 1.35;">
            Questo esercizio è l'ultimo della <strong>Superserie {{ workout.alf_superserie }}</strong>. Completata questa serie, effettua il recupero previsto prima di ricominciare il giro.
          </p>
          <p v-else class="text-slate font-weight-medium mb-2 leading-tight" style="font-size: 0.7rem; line-height: 1.35;">
            Questo esercizio fa parte della <strong>Superserie {{ workout.alf_superserie }}</strong>. Completata una serie di questo esercizio, passa immediatamente all'esercizio successivo prima del recupero.
          </p>
          
          <!-- Esercizi correlati nella superserie -->
          <div v-if="eserciziSupersetCollegati.length > 0">
            <div class="text-super-caption text-muted font-weight-black uppercase mb-2" style="font-size: 0.65rem; letter-spacing: 0.05em;">
              Altri esercizi in questa superserie:
            </div>
            
            <div class="superset-connected-list rounded-lg overflow-hidden card-glass border">
              <div
                v-for="connEx in eserciziSupersetCollegati"
                :key="connEx.id"
                class="connected-exercise-item d-flex align-center py-1.5 px-2.5 clickable-item border-bottom-soft"
                @click="vaiAdEsercizioCollegato(connEx.id)"
                style="cursor: pointer;"
              >
                <div class="connected-thumb mr-2 rounded overflow-hidden" style="width: 40px; height: 40px; flex-shrink: 0; border: 1px solid rgba(255, 255, 255, 0.08);">
                  <v-img
                    :src="getGifUrl(connEx.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=100'"
                    width="40"
                    height="40"
                    cover
                  ></v-img>
                </div>
                <div class="flex-grow-1 min-width-0 text-left">
                  <div class="text-caption font-weight-black text-slate-dark text-truncate" style="font-size: 0.78rem !important;">
                    {{ connEx.des_esercizio }}
                  </div>
                  <div class="text-super-caption text-orange-darken-3 font-weight-bold" style="font-size: 0.58rem;">
                    {{ connEx.des_settore || 'Corpo Libero' }} • Pos. {{ connEx.num_riga_giorno }}
                    <span v-if="connEx.des_rec_report" class="text-amber-lighten-2 ml-1">⏱️ {{ connEx.des_rec_report }}</span>
                    <span v-else class="text-green-lighten-2 ml-1">⚡ No Pausa</span>
                  </div>
                </div>
                <v-icon size="16" color="orange-darken-3">mdi-arrow-right-circle-outline</v-icon>
              </div>
            </div>
          </div>
        </v-card>
      </div>



      <!-- 3. Coaching Note Card (Compact callout) -->
      <v-card
        v-if="workout && workout.des_note && String(workout.des_note).trim()"
        class="py-2 px-3 rounded-lg mb-5 elevation-0 text-left d-flex align-center"
        style="background: rgba(249, 115, 22, 0.08) !important; border: 1px solid rgba(249, 115, 22, 0.2) !important; border-left: 4px solid #f97316 !important;"
      >
        <v-icon color="orange-lighten-2" class="mr-2 flex-shrink-0" size="15">mdi-information-outline</v-icon>
        <span class="text-orange-lighten-4 font-weight-medium" style="font-size: 0.75rem; line-height: 1.35; color: #ffedd5 !important;">
          {{ String(workout.des_note).trim() }}
        </span>
      </v-card>

      <div class="weeks-stacked-list mb-4">
        <!-- Raccomandazione Carico Week 1 (Proposta automatica) -->
        <v-card
          v-if="settimanaAttiva === 1 && propostaWeek1"
          class="py-3.5 px-4 mb-4 text-left border position-relative overflow-hidden"
          style="background: linear-gradient(135deg, rgba(234, 88, 12, 0.15), rgba(249, 115, 22, 0.05)) !important; border: 1.5px solid rgba(234, 88, 12, 0.35) !important; box-shadow: 0 8px 24px rgba(234, 88, 12, 0.1) !important; border-radius: 16px !important;"
        >
          <div class="d-flex align-start">
            <v-icon color="orange-darken-1" class="mr-3 mt-1 flex-shrink-0" size="24">mdi-lightbulb-on</v-icon>
            <div class="flex-grow-1">
              <div class="text-subtitle-2 font-weight-black text-orange-lighten-1 mb-1" style="font-size: 0.9rem;">
                Carico Consigliato per Week 1: <span class="text-white font-weight-black text-h6 ml-1" style="font-size: 1.15rem !important;">{{ propostaWeek1.peso }} KG</span>
              </div>
              <div class="text-slate font-weight-medium" style="font-size: 0.72rem; line-height: 1.45; color: #cbd5e1 !important;">
                Proposta calcolata sul carico della Week 6 del mesociclo precedente (Scheda {{ previousWorkout.num_scheda }}):
                <strong>{{ propostaWeek1.prevPeso }} KG</strong> per <strong>{{ propostaWeek1.prevReps }} reps</strong> con fatica <strong>{{ propostaWeek1.fatica }}</strong>.
                L'algoritmo ha scalato il carico sulle <strong>{{ propostaWeek1.currReps }} reps</strong> previste per questa Week 1.
              </div>
            </div>
          </div>
        </v-card>

        <!-- Nota Esponenti (Ripetizioni di Riserva RIR) -->
         <v-card
          v-if="haEsponenti"
          class="py-2.5 px-3.5 mb-4 text-left border d-flex align-start"
          style="background: rgba(15, 23, 42, 0.45) !important; border: 1.5px solid rgba(249, 115, 22, 0.25) !important; box-shadow: 0 4px 20px rgba(249, 115, 22, 0.05); border-radius: 12px !important;"
        >
          <v-icon color="orange-lighten-2" class="mr-2.5 mt-0.5 flex-shrink-0" size="18">mdi-information-outline</v-icon>
          <div class="text-slate-dark" style="font-size: 0.72rem; line-height: 1.4;">
            <strong class="text-orange-lighten-2">Nota sulle Ripetizioni di Riserva (RIR):</strong> I numeri ad esponente (es. 8² o 10³) indicano il margine dal cedimento muscolare. Ad esempio, 8² significa eseguire 8 ripetizioni con una riserva di altre 2 ripetizioni possibili prima del cedimento completo.
          </div>
        </v-card>

        <v-card
          v-for="sett in settimaneVisualizzate"
          :key="sett"
          class="week-log-card rounded-xl py-2.5 px-3 mb-6 border transition-all"
          :class="{
            'week-active-border': sett === settimanaAttiva,
            'week-secondary-card': modalitaSettimane === 'dinamica' && sett !== settimanaAttiva
          }"
          elevation="1"
        >
          <!-- Intestazione della Settimana -->
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center">
              <v-icon
                :color="isWeekCompleted(sett) ? 'green-darken-2' : 'grey-lighten-1'"
                class="mr-2"
                size="18"
              >
                {{ isWeekCompleted(sett) ? 'mdi-check-circle' : 'mdi-circle-outline' }}
              </v-icon>
              <span class="text-caption font-weight-black" :class="sett === settimanaAttiva ? 'text-orange-darken-3' : 'text-slate-dark'" style="font-size: 0.8rem !important;">
                WEEK {{ sett }}
              </span>
              <v-chip
                v-if="sett === settimanaAttiva"
                :color="isWeekCompleted(sett) ? 'green-accent-4' : 'orange-darken-3'"
                size="x-small"
                class="ml-2 font-weight-black px-1.5 text-white"
                style="height: 16px; font-size: 0.55rem;"
                variant="flat"
              >
                {{ isWeekCompleted(sett) ? 'COMPLETATA' : 'ATTIVA' }}
              </v-chip>
              <v-chip v-else-if="modalitaSettimane === 'dinamica'" color="grey-darken-2" size="x-small" class="ml-2 font-weight-bold px-1.5" style="height: 16px; font-size: 0.55rem;" variant="outlined">ALTRE</v-chip>
            </div>
          </div>

          <!-- Prescrizione Tecnica Formattata (senza simboli strani) -->
          <div v-if="parsedPrescription(workout['des_week' + sett])" class="mb-2 px-1">
            <!-- Rigo Principale con Serie e Peso Totale -->
            <v-row dense class="mb-1.5">
              <!-- Serie e Ripetizioni -->
              <v-col cols="6">
                <div class="prescription-chip-box px-2.5 py-1 rounded-lg text-left">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.55rem;">Lavoro</span>
                  <span class="text-body-1 font-weight-black text-orange-darken-3" style="font-size: 0.95rem !important; line-height: 1.25;">
                    {{ parsedPrescription(workout['des_week' + sett]).reps }}
                  </span>
                </div>
              </v-col>
              <!-- Peso Totale -->
              <v-col cols="6">
                <div class="prescription-chip-box px-2.5 py-1 rounded-lg text-left">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.55rem;">Carico Totale</span>
                  <span class="text-body-1 font-weight-black text-slate-dark" style="font-size: 0.95rem !important; line-height: 1.25;">
                    {{ parsedPrescription(workout['des_week' + sett]).total }} <span class="text-caption text-muted" style="font-size: 0.7rem;">KG</span>
                  </span>
                </div>
              </v-col>
            </v-row>

            <!-- Rigo Secondario con Peso per Lato e Percentuali (Coerente con presenza o assenza di pesi per lato) -->
            <v-row dense>
              <!-- Peso per Lato (solo se presente) -->
              <v-col v-if="parsedPrescription(workout['des_week' + sett]).side" cols="4">
                <div class="prescription-chip-box px-2 py-0.5 rounded-lg text-left">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.52rem;">Per Lato</span>
                  <span class="text-caption font-weight-black text-blue-lighten-2" style="font-size: 0.75rem !important;">
                    {{ parsedPrescription(workout['des_week' + sett]).side }} <span class="text-super-caption text-muted" style="font-size: 0.55rem;">KG</span>
                  </span>
                </div>
              </v-col>
              <!-- % Massimale -->
              <v-col :cols="parsedPrescription(workout['des_week' + sett]).side ? 4 : 6">
                <div class="prescription-chip-box px-2 py-0.5 rounded-lg text-left">
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.52rem;">% 1RM</span>
                  <span class="text-caption font-weight-black text-orange-lighten-2" style="font-size: 0.75rem !important;">
                    {{ parsedPrescription(workout['des_week' + sett]).max || '-' }}
                  </span>
                </div>
              </v-col>
              <!-- % Sforzo -->
              <v-col :cols="parsedPrescription(workout['des_week' + sett]).side ? 4 : 6">
                <div class="prescription-chip-box px-2 py-0.5 rounded-lg text-left">
                  <span class="text-caption font-weight-black text-green-lighten-2" style="font-size: 0.75rem !important;">
                    {{ parsedPrescription(workout['des_week' + sett]).effort || '-' }}
                  </span>
                </div>
              </v-col>
            </v-row>
          </div>
          
          <!-- Fallback se non corrisponde al pattern speciale -->
          <div v-else class="week-prescription-text text-caption font-weight-bold text-slate mb-2 py-0.5 px-2 rounded bg-slate-100" style="font-size: 0.75rem;">
            {{ workout['des_week' + sett] || 'Nessuna prescrizione' }}
          </div>

          <!-- Istruzioni Esecuzione / Test sotto il Lavoro (LAVORO) -->
          <div 
            v-if="sett === 6 && workout && ((workout.des_estesa_start && String(workout.des_estesa_start).trim()) || (workout.des_estesa_end && String(workout.des_estesa_end).trim()))"
            class="mt-2.5 mb-2 px-2.5 py-2 rounded-lg text-left"
            style="background: rgba(249, 115, 22, 0.03) !important; border: 1px dashed rgba(249, 115, 22, 0.15) !important;"
          >
            <div v-if="workout.des_estesa_start && String(workout.des_estesa_start).trim()" class="mb-2">
              <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase d-flex align-center mb-0.5" style="font-size: 0.58rem; letter-spacing: 0.02em;">
                💡 ROM ed Esecuzione:
              </span>
              <p class="text-slate font-weight-medium mb-0" style="font-size: 0.7rem; line-height: 1.35; color: #cbd5e1 !important;">
                {{ String(workout.des_estesa_start).trim() }}
              </p>
            </div>
            <div v-if="workout.des_estesa_end && String(workout.des_estesa_end).trim()">
              <p v-html="'📢 ' + formattaIstruzioneFine(workout.des_estesa_end, sett)" class="text-orange-lighten-3 font-weight-bold mb-0" style="font-size: 0.72rem; line-height: 1.4; color: #ffb74d !important;"></p>
            </div>
          </div>

          <!-- Input di inserimento Carico (puramente testuale) -->
          <div class="mt-3.5 mb-1">
            <v-textarea
              v-model="inputSettimane[sett].ins"
              label="Carico inserito (es. 45kg o note)"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              rows="1"
              auto-grow
              color="orange-darken-3"
              class="custom-weight-input"
              @blur="salvaDatoSettimanale(sett, 'ins')"
              :id="'input-peso-w' + sett"
            ></v-textarea>
          </div>

          <!-- Campi Aggiuntivi per Week 6 (Miglior Carico e Sforzo Percepito) -->
          <div v-if="sett === 6 && (!workout.flg_perc || !String(workout.flg_perc).includes('V%'))" class="mt-4 pt-4 border-top-soft">
            <div class="d-flex align-center justify-space-between mb-2">
              <div>
                <span class="text-caption font-weight-black text-slate-dark d-block">Miglior Carico (W6) *</span>
                <span class="text-super-caption text-orange-darken-3" style="font-size: 0.58rem;">(Solo valore numerico)</span>
              </div>
              
              <!-- Stepper per Miglior Carico W6 -->
              <div class="d-flex align-center card-glass border rounded-xl px-1 py-0.5" style="background: rgba(30, 41, 59, 0.4) !important; border-color: rgba(255, 255, 255, 0.08) !important;">
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  color="orange-lighten-2"
                  @click="decrementaKgUnico"
                  id="btn-decrementa-kg-unico"
                >
                  <v-icon size="18">mdi-minus</v-icon>
                </v-btn>
                <input
                  v-model="numIns6Val"
                  type="text"
                  class="text-center font-weight-black text-white px-1"
                  style="width: 55px; border: none; outline: none; background: transparent; font-size: 0.9rem;"
                  @blur="salvaKgUnico"
                  id="input-kg-unico-w6"
                />
                <v-btn
                  icon
                  size="x-small"
                  variant="text"
                  color="orange-lighten-2"
                  @click="incrementaKgUnico"
                  id="btn-incrementa-kg-unico"
                >
                  <v-icon size="18">mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>

            <p class="text-super-caption text-italic text-muted text-left mb-4" style="line-height: 1.35; font-size: 0.65rem !important;">
              Inserisci qui sopra il massimo peso della week6 e qui sotto la tua percezione di sforzo. È essenziale per calcolare il peso della week1 nel prossimo mesociclo.
            </p>

            <!-- Selettore Sforzo Percepito W6 -->
            <div class="text-left mb-2">
              <span class="text-caption font-weight-black text-slate-dark d-block mb-2">Sforzo Percepito (W6)</span>
              <v-row dense class="gap-2 justify-space-between">
                <v-col cols="4">
                  <v-btn
                    block
                    variant="flat"
                    :color="numFaticaw6Val === 'Media' ? 'green-darken-3' : 'grey-darken-3'"
                    size="small"
                    rounded="lg"
                    class="font-weight-black text-none"
                    :class="{'text-white': numFaticaw6Val === 'Media', 'text-slate': numFaticaw6Val !== 'Media'}"
                    style="font-size: 0.72rem; height: 32px;"
                    @click="salvaFatica('Media')"
                    id="btn-fatica-media"
                  >
                    Media
                  </v-btn>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    block
                    variant="flat"
                    :color="numFaticaw6Val === 'Pesante' ? 'orange-darken-3' : 'grey-darken-3'"
                    size="small"
                    rounded="lg"
                    class="font-weight-black text-none"
                    :class="{'text-white': numFaticaw6Val === 'Pesante', 'text-slate': numFaticaw6Val !== 'Pesante'}"
                    style="font-size: 0.72rem; height: 32px;"
                    @click="salvaFatica('Pesante')"
                    id="btn-fatica-pesante"
                  >
                    Pesante
                  </v-btn>
                </v-col>
                <v-col cols="4">
                  <v-btn
                    block
                    variant="flat"
                    :color="numFaticaw6Val === 'Devastante' ? 'red-darken-4' : 'grey-darken-3'"
                    size="small"
                    rounded="lg"
                    class="font-weight-black text-none"
                    :class="{'text-white': numFaticaw6Val === 'Devastante', 'text-slate': numFaticaw6Val !== 'Devastante'}"
                    style="font-size: 0.72rem; height: 32px;"
                    @click="salvaFatica('Devastante')"
                    id="btn-fatica-devastante"
                  >
                    Devastante
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </div>
        </v-card>

        <!-- Bottone Premium per Espandere/Nascondere le altre settimane in modalità Dinamica -->
        <div v-if="modalitaSettimane === 'dinamica'" class="text-center mt-2 mb-4">
          <v-btn
            variant="text"
            color="orange-darken-3"
            class="font-weight-black text-none"
            density="comfortable"
            rounded="xl"
            @click="toggleAltreDinamiche"
            id="btn-toggle-altre-dinamica"
          >
            <v-icon class="mr-1" size="18">
              {{ mostraAltreDinamica ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down' }}
            </v-icon>
            {{ mostraAltreDinamica ? 'Nascondi le altre settimane' : 'Mostra le altre settimane (5)' }}
          </v-btn>
        </div>
      </div>

      <!-- Opzioni di Visualizzazione delle Settimane (Spostato a fondo lista per non disturbare) -->
      <v-expansion-panels class="mb-6 card-glass border-soft rounded-2xl overflow-hidden shadow-sm" style="background: rgba(15, 23, 42, 0.4);">
        <v-expansion-panel bg-color="transparent" class="elevation-0">
          <v-expansion-panel-title class="py-2.5 px-4 font-weight-black text-subtitle-2 text-slate-dark d-flex align-center">
            <v-icon color="orange" class="mr-2" size="18">mdi-cog-outline</v-icon>
            Opzioni Visualizzazione Settimane
          </v-expansion-panel-title>
          <v-expansion-panel-text class="px-2 pb-3">
            <div class="d-flex flex-column gap-2 text-left pt-1">
              <span class="text-super-caption text-muted font-weight-bold uppercase mb-1" style="font-size: 0.6rem;">Modalità elenco settimane:</span>
              <v-btn-toggle
                v-model="modalitaSettimane"
                mandatory
                selected-class="bg-orange-darken-3 text-white"
                density="comfortable"
                rounded="xl"
                class="w-100 card-glass border"
              >
                <v-btn value="dinamica" class="font-weight-bold flex-grow-1" id="btn-toggle-dinamica" style="min-width: 50%;">
                  <v-icon size="16" class="mr-1">mdi-target</v-icon> Dinamica
                </v-btn>
                <v-btn value="fissa" class="font-weight-bold flex-grow-1" id="btn-toggle-fissa" style="min-width: 50%;">
                  <v-icon size="16" class="mr-1">mdi-calendar-month</v-icon> Fissa
                </v-btn>
              </v-btn-toggle>
              <p class="text-super-caption text-muted mt-2 leading-snug">
                * <strong>Dinamica</strong>: Mette in evidenza la settimana attiva ordinando le altre in sequenza.<br>
                * <strong>Fissa</strong>: Mostra la progressione lineare classica dalla settimana 1 alla 6.
              </p>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- 5. Dettagli Tecnici Esercizio (Stile Grid ultra-compatto per evitare dispersioni) -->
      <div class="d-flex align-center justify-space-between mb-4 text-left">
        <h3 class="text-subtitle-2 font-weight-black text-slate-dark d-flex align-center">
          <v-icon color="orange-darken-3" class="mr-2" size="20">mdi-cogs</v-icon>
          Dettagli Tecnici Esercizio
        </h3>
      </div>

      <!-- Griglia compattata dei Dettagli statici -->
      <v-row dense class="mb-4">
        <!-- Muscolo Target -->
        <v-col cols="4">
          <div class="pa-2.5 rounded-xl border border-orange-darken-3-op card-glass text-center fill-height d-flex flex-column justify-center position-relative overflow-hidden" style="background: rgba(15, 23, 42, 0.4); border-color: rgba(249, 115, 22, 0.15) !important;">
            <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" style="font-size: 0.58rem; letter-spacing: 0.02em;">Muscolo Target</span>
            <span class="text-body-2 font-weight-black text-slate-dark text-truncate d-block">
              {{ workout.des_settore || 'Generico' }}
            </span>
          </div>
        </v-col>
        <!-- Giorno -->
        <v-col cols="4">
          <div class="pa-2.5 rounded-xl border border-orange-darken-3-op card-glass text-center fill-height d-flex flex-column justify-center position-relative overflow-hidden" style="background: rgba(15, 23, 42, 0.4); border-color: rgba(249, 115, 22, 0.15) !important;">
            <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" style="font-size: 0.58rem; letter-spacing: 0.02em;">Giorno</span>
            <span class="text-body-2 font-weight-black text-orange-lighten-1 text-truncate d-block">
              Giorno {{ workout.des_giorno }}
            </span>
          </div>
        </v-col>
        <!-- Posizione / Superserie -->
        <v-col cols="4">
          <div class="pa-2.5 rounded-xl border border-orange-darken-3-op card-glass text-center fill-height d-flex flex-column justify-center position-relative overflow-hidden" style="background: rgba(15, 23, 42, 0.4); border-color: rgba(249, 115, 22, 0.15) !important;">
            <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" style="font-size: 0.58rem; letter-spacing: 0.02em;">Posizione</span>
            <span class="text-body-2 font-weight-black text-slate-dark text-truncate d-block">
              N. {{ workout.num_riga_giorno }}{{ workout.alf_superserie ? ' (' + workout.alf_superserie + ')' : '' }}
            </span>
          </div>
        </v-col>
      </v-row>

      <!-- Card Note e Commenti (Campi Modificabili) -->
      <v-card class="premium-card rounded-2xl pa-4 mb-6" elevation="2">
        <div class="text-left d-flex flex-column gap-4">
          <!-- Note Attrezzo -->
          <div>
            <div class="d-flex align-center justify-space-between mb-1.5">
              <span class="text-caption text-muted font-weight-bold uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">Note attrezzo:</span>
              <v-icon size="14" color="orange-darken-3">mdi-wrench-outline</v-icon>
            </div>
            <v-textarea
              v-model="noteAttrezzo"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              rows="1"
              auto-grow
              color="orange-darken-3"
              class="custom-textarea-input"
              @blur="salvaDatoGenerale('des_note_attrezzo', noteAttrezzo)"
              id="input-detail-note-attrezzo"
            ></v-textarea>
          </div>

          <!-- Note Esercizio -->
          <div>
            <div class="d-flex align-center justify-space-between mb-1.5">
              <span class="text-caption text-muted font-weight-bold uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">Note esercizio:</span>
              <v-icon size="14" color="orange-darken-3">mdi-note-text-outline</v-icon>
            </div>
            <v-textarea
              v-model="noteEsercizio"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              rows="2"
              color="orange-darken-3"
              class="custom-textarea-input"
              @blur="salvaDatoGenerale('ins_esercizio', noteEsercizio)"
              id="input-detail-note-esercizio"
            ></v-textarea>
          </div>

          <!-- Commenti Atleta -->
          <div>
            <div class="d-flex align-center justify-space-between mb-1.5">
              <span class="text-caption text-muted font-weight-bold uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">Commenti personali:</span>
              <v-icon size="14" color="orange-darken-3">mdi-comment-text-outline</v-icon>
            </div>
            <v-textarea
              v-model="commentiAtleta"
              variant="outlined"
              density="compact"
              hide-details
              rounded="lg"
              rows="3"
              color="orange-darken-3"
              class="custom-textarea-input"
              @blur="salvaDatoGenerale('des_commenti', commentiAtleta)"
              id="input-detail-commenti"
            ></v-textarea>
          </div>
        </div>
      </v-card>

      <!-- Card Feedback Feeling Esercizio (ind_reps_start) -->
      <v-card class="premium-card rounded-2xl pa-4 mb-6" elevation="2">
        <div class="text-left">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-black text-slate-dark uppercase" style="font-size: 0.65rem; letter-spacing: 0.05em;">
              Dai un voto da 1 a 5 sul feeling dell'esercizio
            </span>
            <v-icon size="16" color="orange">mdi-emoticon-happy-outline</v-icon>
          </div>
          
          <div class="d-flex align-center justify-space-between mt-3 px-1 gap-2">
            <v-btn
              v-for="voto in [1, 2, 3, 4, 5]"
              :key="voto"
              variant="flat"
              :color="parseInt(indRepsStartVal) === voto ? 'orange-darken-3' : 'grey-darken-3'"
              class="font-weight-black rounded-lg text-none flex-grow-1"
              :class="{'text-white': parseInt(indRepsStartVal) === voto, 'text-slate': parseInt(indRepsStartVal) !== voto}"
              style="min-width: 45px; height: 40px; font-size: 0.9rem;"
              @click="salvaVotoFeeling(voto)"
              :id="'btn-feeling-' + voto"
            >
              {{ voto }}
            </v-btn>
          </div>
        </div>
      </v-card>

    </div>

    <!-- Snackbar di successo salvataggio -->
    <v-snackbar
      v-model="snackbarSalvataggio"
      color="success"
      timeout="2500"
      rounded="xl"
      elevation="4"
      id="detail-snackbar"
    >
      <div class="d-flex align-center justify-center font-weight-bold">
        <v-icon class="mr-2">mdi-check-circle</v-icon>
        Progressione salvata in tempo reale!
      </div>
    </v-snackbar>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase.js';
import { startGlobalTimer } from '../authStore.js';

const route = useRoute();
const router = useRouter();

// Blocco storico rimosso per modifiche sempre abilitate


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

// Parametri
const routeIdLocal = ref(route.params.id);

// Stato
const workout = ref(null);
const riga0 = ref(null);
const caricamento = ref(true);

const settimanaAttiva = ref(2);
const tuttiEserciziGiorno = ref([]);

// Trova altri esercizi dello stesso blocco superserie consecutivo (stessa logica di Workouts.vue)
const eserciziSupersetCollegati = computed(() => {
  if (!workout.value || !workout.value.alf_superserie || tuttiEserciziGiorno.value.length === 0) return [];
  
  // 1. Raggruppa gli esercizi del giorno in blocchi consecutivi
  const blocks = [];
  let currentSuperset = null;
  
  tuttiEserciziGiorno.value.forEach((ex) => {
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
  
  // 2. Trova il blocco superset specifico che contiene l'esercizio corrente (confronto super robusto string/number)
  const currentId = String(routeIdLocal.value || '');
  const currentNumRiga = workout.value?.num_riga ? String(workout.value.num_riga) : '';
  
  const targetBlock = blocks.find(
    block => block.type === 'superset' && block.exercises.some(item => {
      const itemId = String(item.id || '');
      const itemNumRiga = item.num_riga ? String(item.num_riga) : '';
      return (itemId && itemId === currentId) || (itemNumRiga && itemNumRiga === currentId) ||
             (itemId && itemId === currentNumRiga) || (itemNumRiga && itemNumRiga === currentNumRiga);
    })
  );
  
  if (!targetBlock) return [];
  
  // 3. Ritorna gli altri esercizi dello stesso identico blocco (confronto robusto per escludere il corrente)
  return targetBlock.exercises.filter(item => {
    const itemId = String(item.id || '');
    const itemNumRiga = item.num_riga ? String(item.num_riga) : '';
    const isCurrent = (itemId && itemId === currentId) || (itemNumRiga && itemNumRiga === currentId) ||
                      (itemId && itemId === currentNumRiga) || (itemNumRiga && itemNumRiga === currentNumRiga);
    return !isCurrent;
  });
});

const vaiAdEsercizioCollegato = (id) => {
  vibraTattile(12);
  router.replace({ name: 'DettaglioWorkout', params: { id } });
};

const haEsponenti = computed(() => {
  if (!workout.value) return false;
  const esponentiRegex = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/;
  for (let w = 1; w <= 6; w++) {
    const des = workout.value['des_week' + w] || '';
    const ins = (inputSettimane.value && inputSettimane.value[w] && inputSettimane.value[w].ins) || '';
    const reps = (inputSettimane.value && inputSettimane.value[w] && inputSettimane.value[w].reps) || '';
    if (esponentiRegex.test(des) || esponentiRegex.test(ins) || esponentiRegex.test(reps)) {
      return true;
    }
  }
  return false;
});

// Campi Modificabili
const inputSettimane = ref({
  1: { ins: '', reps: '' },
  2: { ins: '', reps: '' },
  3: { ins: '', reps: '' },
  4: { ins: '', reps: '' },
  5: { ins: '', reps: '' },
  6: { ins: '', reps: '' }
});
const noteAttrezzo = ref('');
const noteEsercizio = ref('');
const commentiAtleta = ref('');
const numIns6Val = ref('');
const numFaticaw6Val = ref('');
const indRepsStartVal = ref('');

const previousWorkout = ref(null);

const getAtletaInfo = (wObj) => {
  if (!wObj) return { key: 'ID_cliente', id: '' };
  const key = Object.keys(wObj).find(k => k.includes('ID_cliente')) || 'ID_cliente';
  return { key, id: wObj[key] || '' };
};

const estraiRepsDaPrescrizione = (prescrizioneStr) => {
  if (!prescrizioneStr) return null;
  const part = String(prescrizioneStr).split('|')[0].trim();
  const cleanPart = part.replace(/\([^)]+\)/g, '').trim();
  
  const matchX = cleanPart.match(/\d+\s*[xX]\s*(\d+)/);
  if (matchX) {
    return parseInt(matchX[1], 10);
  }
  
  const matchNum = cleanPart.match(/^(\d+)$/);
  if (matchNum) {
    return parseInt(matchNum[1], 10);
  }
  
  const matchFirstNum = cleanPart.match(/(\d+)/);
  if (matchFirstNum) {
    return parseInt(matchFirstNum[1], 10);
  }
  
  return null;
};

const calcolaPropostaCarico = (prevW6Weight, prevW6Reps, currW1Reps, fatica) => {
  if (!prevW6Weight) return null;
  const w6 = parseFloat(String(prevW6Weight).replace(',', '.'));
  if (isNaN(w6) || w6 <= 0) return null;
  
  const r6 = prevW6Reps ? parseInt(prevW6Reps, 10) : (currW1Reps ? parseInt(currW1Reps, 10) : 10);
  const r1 = currW1Reps ? parseInt(currW1Reps, 10) : (prevW6Reps ? parseInt(prevW6Reps, 10) : 10);
  
  // 1RM estimation via Epley formula
  const estimated1RM = w6 * (1 + r6 / 30);
  
  // Theoretical weight for week 1
  let proposedWeight = estimated1RM / (1 + r1 / 30);
  
  // Adjust based on fatigue
  const faticaLower = (fatica || '').toLowerCase().trim();
  let adjustment = 1.0;
  if (faticaLower === 'media' || faticaLower === 'bassa') {
    adjustment = 1.03; // Increase by 3%
  } else if (faticaLower === 'devastante') {
    adjustment = 0.95; // Decrease by 5%
  } else {
    adjustment = 1.0;
  }
  
  proposedWeight = proposedWeight * adjustment;
  
  // Round to nearest 0.5 kg
  return Math.round(proposedWeight * 2) / 2;
};

const propostaWeek1 = computed(() => {
  if (!previousWorkout.value || !workout.value) return null;
  
  const prevW6Weight = previousWorkout.value.num_ins6;
  if (!prevW6Weight) return null;
  
  const prevW6Reps = parseInt(previousWorkout.value.reps_week6) || estraiRepsDaPrescrizione(previousWorkout.value.des_week6);
  const currW1Reps = parseInt(workout.value.reps_week1) || estraiRepsDaPrescrizione(workout.value.des_week1);
  const fatica = previousWorkout.value.num_faticaw6;
  
  const proposta = calcolaPropostaCarico(prevW6Weight, prevW6Reps, currW1Reps, fatica);
  if (proposta === null) return null;

  return {
    peso: proposta,
    prevPeso: prevW6Weight,
    prevReps: prevW6Reps || 'N/D',
    currReps: currW1Reps || 'N/D',
    fatica: fatica || 'Non specificata'
  };
});

const caricaEsercizioPrecedente = async () => {
  if (!workout.value) return;
  
  const { key: keyIdCliente, id: atletaId } = getAtletaInfo(workout.value);
  const currentNumScheda = workout.value.num_scheda;
  const desEsercizio = workout.value.des_esercizio;
  
  if (!atletaId || !currentNumScheda || !desEsercizio) return;
  
  try {
    const currentSchedaNum = parseInt(currentNumScheda);
    if (isNaN(currentSchedaNum)) return;
    
    const q = query(
      collection(db, 'STORYBOARD'),
      where(keyIdCliente, '==', atletaId),
      where('des_esercizio', '==', desEsercizio)
    );
    const snap = await getDocs(q);
    
    let bestPrev = null;
    snap.forEach((doc) => {
      const d = doc.data();
      const sNum = parseInt(d.num_scheda);
      if (sNum < currentSchedaNum) {
        if (!bestPrev || sNum > parseInt(bestPrev.num_scheda)) {
          bestPrev = { id: doc.id, ...d };
        }
      }
    });
    
    if (bestPrev) {
      previousWorkout.value = applicaModificheLocali(bestPrev);
    } else {
      const res = await fetch('/storyboard_backup.json');
      const allData = await res.json();
      const matched = allData.filter(b => {
        const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
        return String(bAtletaId) === String(atletaId) &&
               String(b.des_esercizio).trim() === String(desEsercizio).trim() &&
               parseInt(b.num_scheda) < currentSchedaNum;
      });
      if (matched.length > 0) {
        matched.sort((a, b) => parseInt(b.num_scheda) - parseInt(a.num_scheda));
        previousWorkout.value = applicaModificheLocali(matched[0]);
      }
    }
  } catch (error) {
    console.error("Errore caricamento esercizio precedente:", error);
  }
};


let savedMode = localStorage.getItem('modalitaSettimane');
if (savedMode === 'tutte') savedMode = 'fissa';
if (savedMode === 'attiva') savedMode = 'dinamica';
if (!savedMode) savedMode = 'dinamica';

const modalitaSettimane = ref(savedMode);
watch(modalitaSettimane, (nuovoValore) => {
  vibraTattile(8);
  localStorage.setItem('modalitaSettimane', nuovoValore);
});

const mostraAltreDinamica = ref(true);
const toggleAltreDinamiche = () => {
  vibraTattile(10);
  mostraAltreDinamica.value = !mostraAltreDinamica.value;
};

// Computed per definire l'ordine e la proposizione delle settimane
const settimaneVisualizzate = computed(() => {
  if (modalitaSettimane.value === 'dinamica') {
    if (mostraAltreDinamica.value) {
      // La settimana attiva deve rimanere sempre per prima.
      // Sotto di essa mostriamo le passate in ordine decrescente (es. 2, 1 per la week 3).
      // A seguire mostriamo le future in ordine crescente (es. 4, 5, 6 per la week 3).
      const pastWeeks = [];
      for (let w = settimanaAttiva.value - 1; w >= 1; w--) {
        pastWeeks.push(w);
      }
      const futureWeeks = [];
      for (let w = settimanaAttiva.value + 1; w <= 6; w++) {
        futureWeeks.push(w);
      }
      return [settimanaAttiva.value, ...pastWeeks, ...futureWeeks];
    } else {
      // Mostra solo la settimana attiva
      return [settimanaAttiva.value];
    }
  } else {
    // Visualizzazione fissa classica da 1 a 6
    return [1, 2, 3, 4, 5, 6];
  }
});

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

// Snackbar
const snackbarSalvataggio = ref(false);

// Micro-vibrazione tattile per smartphone del 2026 (Haptic feedback)
const vibraTattile = (ms = 12) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

// Helper per applicare le modifiche salvate offline nel localStorage
const applicaModificheLocali = (item) => {
  if (!item) return item;
  const key1 = `offline_storyboard_${item.id}`;
  const key2 = `offline_storyboard_${item.num_riga}`;
  const localData1 = localStorage.getItem(key1);
  const localData2 = localStorage.getItem(key2);
  
  let updates = {};
  if (localData1) {
    try { updates = { ...updates, ...JSON.parse(localData1) }; } catch (e) {}
  }
  if (localData2) {
    try { updates = { ...updates, ...JSON.parse(localData2) }; } catch (e) {}
  }
  
  return { ...item, ...updates };
};

// I campi ins sono puramente testuali ed i reps sono gestiti internamente al database, per cui non usiamo incrementatori o pulsanti.

// Carica riga 0 della sessione del giorno per ottenere il completamento delle settimane (cmp1-cmp6)
const caricaRiga0 = async (keyIdCliente, atletaId, numScheda, desGiorno) => {
  try {
    // Cerchiamo il documento della sessione (Riga 0) provando sia stringa che numero
    const q1 = query(
      collection(db, 'STORYBOARD'),
      where(keyIdCliente, '==', atletaId),
      where('num_scheda', 'in', [numScheda, String(numScheda), Number(numScheda)])
    );
    const querySnapshot = await getDocs(q1);
    let trovato = false;
    querySnapshot.forEach((doc) => {
      const d = doc.data();
      const numRiga = parseInt(d.num_riga_giorno);
      // Controllo des_giorno localmente per robustezza contro spazi
      if (numRiga === 0 && String(d.des_giorno).trim().toUpperCase() === String(desGiorno).trim().toUpperCase()) {
        riga0.value = applicaModificheLocali({ id: doc.id, ...d });
        trovato = true;
      }
    });

    // Fallback al backup se non trovato (es. problemi di sincronizzazione Firestore)
    if (!trovato) {
      const res = await fetch('/storyboard_backup.json');
      const allData = await res.json();
      const riga0Trovata = allData.find(
        item => (String(item[keyIdCliente]) === String(atletaId) || String(item['ID_cliente']) === String(atletaId)) &&
        String(item.num_scheda) === String(numScheda) &&
        String(item.des_giorno).trim().toUpperCase() === String(desGiorno).trim().toUpperCase() &&
        parseInt(item.num_riga_giorno) === 0
      );
      if (riga0Trovata) {
        riga0.value = applicaModificheLocali(riga0Trovata);
      }
    }
  } catch (error) {
    console.error("Errore caricamento riga 0 per completamento:", error);
  }
};

// Stato swipe ed elenco esercizi del giorno
const listaIdEsercizi = ref([]);
const indexCorrente = ref(-1);

const riportaAInizioPagina = () => {
  window.scrollTo({ top: 0, behavior: 'instant' });
  const appContainer = document.querySelector('.v-main') || document.documentElement || document.body;
  if (appContainer) {
    appContainer.scrollTop = 0;
  }
};

watch(() => route.params.id, (nuovoId) => {
  if (nuovoId) {
    riportaAInizioPagina();
    riga0.value = null;
    workout.value = null;
    routeIdLocal.value = nuovoId;
    localStorage.setItem('ultimoEsercizioDettaglio', nuovoId);
    caricaDatiEsercizio();
  }
});

// Allineato alla settimana attiva globale per evitare disallineamenti di visualizzazione dei giorni completati

const caricaListaEserciziGiorno = async (keyIdCliente, atletaId, numScheda, desGiorno) => {
  try {
    const q = query(
      collection(db, 'STORYBOARD'),
      where(keyIdCliente, '==', atletaId),
      where('num_scheda', '==', numScheda),
      where('des_giorno', '==', desGiorno)
    );
    const snap = await getDocs(q);
    
    let temp = [];
    snap.forEach((doc) => {
      const d = doc.data();
      const riga = parseInt(d.num_riga_giorno) || 0;
      if (riga > 0) { // Saltiamo la riga 0
        temp.push(applicaModificheLocali({ id: doc.id, riga, ...d }));
      }
    });
    
    // Ordiniamo per riga
    temp.sort((a, b) => a.riga - b.riga);
    
    tuttiEserciziGiorno.value = temp;
    listaIdEsercizi.value = temp.map(item => item.id);
    
    // Ricerca robusta dell'indice per lo swipe touch
    indexCorrente.value = temp.findIndex(item => {
      const itemId = String(item.id || '');
      const itemNumRiga = item.num_riga ? String(item.num_riga) : '';
      const currentId = String(routeIdLocal.value || '');
      return itemId === currentId || itemNumRiga === currentId;
    });
  } catch (error) {
    console.error("Errore caricamento lista esercizi per swipe:", error);
  }
};

const vaiAdEsercizioSuccessivo = () => {
  if (listaIdEsercizi.value.length <= 1 || indexCorrente.value === -1) return;
  if (indexCorrente.value === listaIdEsercizi.value.length - 1) return;
  const nextIndex = indexCorrente.value + 1;
  const nextId = listaIdEsercizi.value[nextIndex];
  
  vibraTattile(15);
  router.replace({ name: 'DettaglioWorkout', params: { id: nextId } });
};

const vaiAdEsercizioPrecedente = () => {
  if (listaIdEsercizi.value.length <= 1 || indexCorrente.value === -1) return;
  if (indexCorrente.value === 0) return;
  const prevIndex = indexCorrente.value - 1;
  const prevId = listaIdEsercizi.value[prevIndex];
  
  vibraTattile(15);
  router.replace({ name: 'DettaglioWorkout', params: { id: prevId } });
};

// Gesture di swipe touch
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
  
  // Controllo se lo swipe è orizzontale e sufficientemente lungo (> 80px)
  if (Math.abs(diffX) > 80 && Math.abs(diffY) < 50) {
    if (diffX < 0) {
      // Swipe a sinistra -> Esercizio Successivo
      vaiAdEsercizioSuccessivo();
    } else {
      // Swipe a destra -> Esercizio Precedente
      vaiAdEsercizioPrecedente();
    }
  }
};

// Carica l'esercizio ed estrai i dati
const caricaDatiEsercizio = async () => {
  caricamento.value = true;
  try {
    const docRef = doc(db, 'STORYBOARD', routeIdLocal.value);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const dati = docSnap.data();
      workout.value = applicaModificheLocali({ id: docSnap.id, ...dati });

      // Recupera la settimana attiva impostata nella Home per l'atleta specifico
      const keyIdCliente = Object.keys(dati).find(k => k.includes('ID_cliente')) || '\uFEFF"ID_cliente"';
      const atletaId = dati[keyIdCliente] || '';
      settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + atletaId)) || 2;

      // Se UrlNormal è vuoto o non valido, proviamo a ripristinarlo dal backup JSON locale
      if (!workout.value.UrlNormal || !workout.value.UrlNormal.startsWith('http')) {
        try {
          const res = await fetch('/storyboard_backup.json');
          const allData = await res.json();
          const matched = allData.find(b => 
            String(b.ID_cliente) === String(atletaId) &&
            String(b.num_scheda) === String(dati.num_scheda) &&
            String(b.des_giorno).trim() === String(dati.des_giorno).trim() &&
            parseInt(b.num_riga_giorno) === parseInt(dati.num_riga_giorno)
          );
          if (matched && matched.UrlNormal && matched.UrlNormal.startsWith('http')) {
            workout.value.UrlNormal = matched.UrlNormal;
          }
        } catch (errBackup) {
          console.warn("Impossibile applicare patch UrlNormal da backup in Dettaglio:", errBackup);
        }
      }

      // Inizializza gli input settimanali
      for (let w = 1; w <= 6; w++) {
        inputSettimane.value[w].ins = workout.value['ins_week' + w] || '';
        inputSettimane.value[w].reps = workout.value['reps_week' + w] || '';
      }
      
      noteAttrezzo.value = workout.value.des_note_attrezzo || '';
      noteEsercizio.value = workout.value.ins_esercizio || '';
      commentiAtleta.value = workout.value.des_commenti || '';

      numIns6Val.value = workout.value.num_ins6 || '';
      numFaticaw6Val.value = workout.value.num_faticaw6 || '';
      indRepsStartVal.value = workout.value.ind_reps_start || '';

      // Carica l'esercizio del mesociclo precedente per consigliare il carico in Week 1
      await caricaEsercizioPrecedente();

      // Carica il completamento del giorno (Riga 0) ed elenco per swipe
      if (atletaId && dati.num_scheda && dati.des_giorno) {
        await caricaRiga0(keyIdCliente, atletaId, dati.num_scheda, dati.des_giorno);
        await caricaListaEserciziGiorno(keyIdCliente, atletaId, dati.num_scheda, dati.des_giorno);
      }
    } else {
      console.warn("Documento esercizio non trovato su Firestore, provo da backup locale.");
      await caricaEsercizioDaBackup();
    }
  } catch (error) {
    console.warn("Errore caricamento dettagli esercizio da Firestore (quota esaurita), provo da backup locale:", error);
    await caricaEsercizioDaBackup();
  } finally {
    caricamento.value = false;
  }
};

const caricaEsercizioDaBackup = async () => {
  try {
    const res = await fetch('/storyboard_backup.json');
    const allData = await res.json();
    const found = allData.find(item => String(item.id) === String(routeIdLocal.value) || String(item.num_riga) === String(routeIdLocal.value));
    if (found) {
      workout.value = applicaModificheLocali(found);
      const keyIdCliente = Object.keys(found).find(k => k.includes('ID_cliente')) || 'ID_cliente';
      const atletaId = found[keyIdCliente] || '';
      settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + atletaId)) || 2;

      for (let w = 1; w <= 6; w++) {
        inputSettimane.value[w].ins = workout.value['ins_week' + w] || '';
        inputSettimane.value[w].reps = workout.value['reps_week' + w] || '';
      }
      
      noteAttrezzo.value = workout.value.des_note_attrezzo || '';
      noteEsercizio.value = workout.value.ins_esercizio || '';
      commentiAtleta.value = workout.value.des_commenti || '';

      numIns6Val.value = workout.value.num_ins6 || '';
      numFaticaw6Val.value = workout.value.num_faticaw6 || '';
      indRepsStartVal.value = workout.value.ind_reps_start || '';

      await caricaEsercizioPrecedente();

      if (atletaId && found.num_scheda && found.des_giorno) {
        // Riga 0 locale da backup
        const riga0Trovata = allData.find(
          item => String(item.ID_cliente) === String(atletaId) &&
          String(item.num_scheda) === String(found.num_scheda) &&
          String(item.des_giorno) === String(found.des_giorno) &&
          parseInt(item.num_riga_giorno) === 0
        );
        if (riga0Trovata) {
          riga0.value = applicaModificheLocali(riga0Trovata);
        }

        // Lista per swipe da backup
        const filtratiEsercizi = allData.filter(
          item => String(item.ID_cliente) === String(atletaId) &&
          String(item.num_scheda) === String(found.num_scheda) &&
          String(item.des_giorno) === String(found.des_giorno) &&
          parseInt(item.num_riga_giorno) > 0
        );
        const filtratiMappati = filtratiEsercizi.map(applicaModificheLocali);
        filtratiMappati.sort((a, b) => (parseInt(a.num_riga_giorno) || 0) - (parseInt(b.num_riga_giorno) || 0));
        tuttiEserciziGiorno.value = filtratiMappati;
        listaIdEsercizi.value = filtratiMappati.map(item => item.id);
        
        // Ricerca robusta dell'indice per lo swipe touch
        indexCorrente.value = filtratiEsercizi.findIndex(item => {
          const itemId = String(item.id || '');
          const itemNumRiga = item.num_riga ? String(item.num_riga) : '';
          const currentId = String(routeIdLocal.value || '');
          return itemId === currentId || itemNumRiga === currentId;
        });
      }
    }
  } catch (errBackup) {
    console.error("Errore nel caricamento del backup locale in Dettaglio:", errBackup);
  }
};

onMounted(() => {
  riportaAInizioPagina();
  caricaDatiEsercizio();
  if (routeIdLocal.value) {
    localStorage.setItem('ultimoEsercizioDettaglio', routeIdLocal.value);
  }
  window.addEventListener('touchstart', handleTouchStart, { passive: true });
  window.addEventListener('touchend', handleTouchEnd, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('touchstart', handleTouchStart);
  window.removeEventListener('touchend', handleTouchEnd);
});

// Parser delle stringhe di prescrizione speciali (es. 5x2(75%)|87,5KG|33,75L 77% o 3x12(60%)|95KG 86%)
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

const parsedPrescription = (str) => {
  return parsePrescription(str);
};

const estraiPesoDaInput = (str) => {
  if (!str) return null;
  const clean = str.replace(/,/g, '.').trim();
  
  // Cerca l'ultimo numero seguito da "kg"
  const kgMatches = clean.match(/([\d.]+)\s*kg/gi);
  if (kgMatches && kgMatches.length > 0) {
    const lastKg = kgMatches[kgMatches.length - 1];
    const val = lastKg.match(/([\d.]+)/);
    if (val) return val[1];
  }

  // Se non c'è "kg", prendiamo l'ultimo numero della stringa
  const allNumbers = clean.match(/\d+(?:\.\d+)?/g);
  if (allNumbers && allNumbers.length > 0) {
    return allNumbers[allNumbers.length - 1];
  }
  
  return null;
};

const getTestWeight = (sett) => {
  if (!workout.value) return '';
  
  // 1. Carico prescritto per la settimana del test (sett 6)
  const prescrizioneAttiva = parsedPrescription(workout.value['des_week' + sett]);
  if (prescrizioneAttiva && prescrizioneAttiva.total) {
    const peso = prescrizioneAttiva.total.trim();
    if (peso && parseFloat(peso.replace(',', '.')) > 0) {
      return `${peso} KG`;
    }
  }

  // 2. Carico inserito dall'utente nella settimana precedente (week 5, poi 4, 3, etc.)
  for (let w = sett - 1; w >= 1; w--) {
    const inputVal = inputSettimane.value[w]?.ins;
    if (inputVal && inputVal.trim()) {
      const pesoEstratto = estraiPesoDaInput(inputVal);
      if (pesoEstratto) {
        return `${pesoEstratto} KG`;
      }
    }
  }

  // 3. Carico prescritto nella settimana precedente (week 5)
  const prescrizionePrecedente = parsedPrescription(workout.value['des_week' + (sett - 1)]);
  if (prescrizionePrecedente && prescrizionePrecedente.total) {
    const pesoPrev = prescrizionePrecedente.total.trim();
    if (pesoPrev && parseFloat(pesoPrev.replace(',', '.')) > 0) {
      return `${pesoPrev} KG`;
    }
  }

  return '';
};

const formattaIstruzioneFine = (testo, sett) => {
  if (!testo) return '';
  
  const lowerTesto = testo.toLowerCase();
  const isAmrapOrMaxReps = lowerTesto.includes('massime ripetizioni') || lowerTesto.includes('massimo di ripetizioni');
  
  if (isAmrapOrMaxReps) {
    const peso = getTestWeight(sett);
    if (peso) {
      return `Dopo il riscaldamento fai una serie con le <strong>massime ripetizioni possibili</strong> con il carico reale di <strong class="text-white">${peso}</strong>. Scrivi quante ripetizioni sei riuscito a fare!`;
    } else {
      return `Dopo il riscaldamento fai una serie con le <strong>massime ripetizioni possibili</strong> con l'ultimo carico allenante. Scrivi quante ripetizioni sei riuscito a fare!`;
    }
  }
  
  let formatta = testo;
  const prescrizione = parsedPrescription(workout.value?.['des_week' + sett]);
  if (prescrizione && prescrizione.total) {
    const peso = prescrizione.total.trim();
    formatta = formatta.replace(/\(con x% del carico massimale\)/gi, `(con il carico reale di <strong class="text-white">${peso} KG</strong>)`);
    formatta = formatta.replace(/con x% del carico massimale/gi, `con il carico reale di <strong class="text-white">${peso} KG</strong>`);
  }
  return formatta;
};


const parsedRmt = (str) => {
  if (!str) return null;
  const regex = /(?:\(+)?\s*(\*+[¹²³⁴⁵⁶⁷⁸⁹\d]*)\s*1RMT?:\s*([\d,.]+)\s*KG\s*~([\d,.]+)(?:\s*KG)?\s*(?:del|del\s+)?\s*([\d/]+)(?:\s*([↓↑]\s*\d+%))?\s*(?:\)+)?/i;
  const match = str.trim().match(regex);
  if (match) {
    const rawStelle = match[1];
    const starsCount = (rawStelle.match(/\*/g) || []).length;
    const subLevel = rawStelle.replace(/\*/g, '').trim(); // Estrae il superscript (es. '⁴')
    
    // Mappa l'esponente al numero effettivo di stelle da mostrare
    const mapSup = {
      '¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9,
      '1': 1, '2': 2, '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9
    };
    const stelleCalcolate = subLevel ? (mapSup[subLevel] || starsCount) : starsCount;
    
    const getLivelloTesto = (s) => {
      if (s <= 1) return 'Neofita';
      if (s === 2) return 'Principiante';
      if (s === 3) return 'Intermedio';
      if (s === 4) return 'Avanzato';
      return 'Elite';
    };
    
    const getLivelloColore = (testo) => {
      const colori = {
        'Neofita': 'grey-darken-1',
        'Principiante': 'blue-darken-2',
        'Intermedio': 'teal-darken-2',
        'Avanzato': 'orange-darken-3',
        'Elite': 'deep-purple-darken-2'
      };
      return colori[testo] || 'orange-darken-3';
    };
    
    const livelloTesto = getLivelloTesto(stelleCalcolate);
    const livelloColore = getLivelloColore(livelloTesto);
    
    return {
      stelle: stelleCalcolate,
      livelloTesto,
      livelloColore,
      livelloEsteso: rawStelle,
      subLivello: subLevel,
      massimale: match[2],
      prossimoLivello: match[3],
      data: match[4],
      variazione: match[5] || ''
    };
  }
  return null;
};

const getRmtProgress = (rmt) => {
  if (!rmt || !rmt.massimale || !rmt.prossimoLivello) return 0;
  const current = parseFloat(rmt.massimale.replace(',', '.')) || 0;
  const targetDiff = parseFloat(rmt.prossimoLivello.replace(',', '.')) || 0;
  if (current + targetDiff === 0) return 0;
  return Math.round((current / (current + targetDiff)) * 100);
};

// Controlla se la settimana w è completata (cmp1-cmp6 da Riga 0)
const isWeekCompleted = (w) => {
  if (!riga0.value) return false;
  return riga0.value['cmp' + w] === 'true';
};

// Controlla se la settimana ha dati loggati
const isWeekLogged = (w) => {
  return inputSettimane.value[w].ins || inputSettimane.value[w].reps;
};

const aggiornaDatoECommit = async (updates) => {
  if (!workout.value) return;
  
  try {
    vibraTattile(20);
    const docRef = doc(db, 'STORYBOARD', routeIdLocal.value);
    
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    
    // Aggiorna oggetto reattivo locale
    for (const [campo, valore] of Object.entries(updates)) {
      workout.value[campo] = valore;
    }
    workout.value.timestamp = timestamp;

    // Aggiorna localStorage per supporto offline
    const key1 = `offline_storyboard_${routeIdLocal.value}`;
    const localData1 = localStorage.getItem(key1);
    let currentUpdates = {};
    if (localData1) {
      try { currentUpdates = JSON.parse(localData1); } catch (e) {}
    }
    currentUpdates = { ...currentUpdates, ...updates, timestamp };
    localStorage.setItem(key1, JSON.stringify(currentUpdates));
    
    if (workout.value.num_riga) {
      const key2 = `offline_storyboard_${workout.value.num_riga}`;
      localStorage.setItem(key2, JSON.stringify(currentUpdates));
    }

    // Carica su Firestore inviando solo i campi modificati (evita conflitti offline/online)
    await updateDoc(docRef, { ...updates, timestamp });
    snackbarSalvataggio.value = true;
  } catch (error) {
    console.error("Errore salvataggio e commit:", error);
  }
};

const estraiNumeroMassimo = (str) => {
  if (!str) return null;
  const numbers = str.replace(/,/g, '.').match(/\d+(?:\.\d+)?/g);
  if (numbers && numbers.length > 0) {
    return Math.max(...numbers.map(Number));
  }
  return null;
};

// Salva dato settimanale al blur
const salvaDatoSettimanale = async (settimana, tipo) => {
  if (!workout.value) return;

  const campo = `${tipo}_week${settimana}`;
  const valoreOriginale = workout.value[campo] || '';
  const valoreNuovo = inputSettimane.value[settimana][tipo];

  if (valoreOriginale !== valoreNuovo) {
    const updates = { [campo]: valoreNuovo };
    
    // Auto-estrazione per la week 6
    if (settimana === 6 && tipo === 'ins' && valoreNuovo) {
      const estratto = estraiNumeroMassimo(valoreNuovo);
      if (estratto !== null) {
        const vecchioEstratto = estraiNumeroMassimo(valoreOriginale);
        if (!numIns6Val.value || (vecchioEstratto !== null && parseFloat(numIns6Val.value) === vecchioEstratto)) {
          numIns6Val.value = String(estratto);
          updates.num_ins6 = String(estratto);
        }
      }
    }
    
    await aggiornaDatoECommit(updates);
  }
};

// Salva campo generale
const salvaDatoGenerale = async (campo, valore) => {
  if (!workout.value) return;

  const valoreOriginale = workout.value[campo] || '';

  if (valoreOriginale !== valore) {
    await aggiornaDatoECommit({ [campo]: valore });
  }
};

const parseKg = (val) => {
  if (!val) return 0;
  const parsed = parseFloat(String(val).replace(',', '.'));
  return isNaN(parsed) ? 0 : parsed;
};

const incrementaKgUnico = () => {
  vibraTattile(10);
  let current = parseKg(numIns6Val.value);
  current += 0.5;
  numIns6Val.value = String(current);
  salvaKgUnico();
};

const decrementaKgUnico = () => {
  vibraTattile(10);
  let current = parseKg(numIns6Val.value);
  if (current > 0) {
    current = Math.max(0, current - 0.5);
    numIns6Val.value = String(current);
    salvaKgUnico();
  }
};

const salvaKgUnico = async () => {
  await salvaDatoGenerale('num_ins6', numIns6Val.value);
};

const salvaFatica = async (fatica) => {
  vibraTattile(15);
  if (numFaticaw6Val.value === fatica) {
    numFaticaw6Val.value = '';
  } else {
    numFaticaw6Val.value = fatica;
  }
  await salvaDatoGenerale('num_faticaw6', numFaticaw6Val.value);
};

const salvaVotoFeeling = async (voto) => {
  vibraTattile(15);
  const votoStr = String(voto);
  if (indRepsStartVal.value === votoStr) {
    indRepsStartVal.value = '';
  } else {
    indRepsStartVal.value = votoStr;
  }
  await salvaDatoGenerale('ind_reps_start', indRepsStartVal.value);
};

// Torna indietro
const tornaIndietro = () => {
  vibraTattile(8);
  router.back();
};
</script>

<style scoped>
.max-width-container {
  max-width: 600px;
  margin: 0 auto;
}

.min-height-screen {
  min-height: calc(100vh - 100px);
}

.sticky-detail-header {
  position: sticky !important;
  top: 0;
  z-index: 100 !important;
  background: #030712 !important; /* solid background matching body */
  padding-top: 16px !important;
  padding-bottom: 8px !important;
  margin-top: -16px !important;
}

.appsheet-top-bar {
  border-bottom: 2px solid #ef6c00;
  padding-bottom: 8px;
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

.uppercase {
  text-transform: uppercase;
}

.bg-slate-50 {
  background-color: transparent !important;
}

.bg-slate-100 {
  background-color: rgba(30, 41, 59, 0.4) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid rgba(255, 255, 255, 0.05) !important;
}

.premium-card {
  background: rgba(15, 23, 42, 0.65) !important;
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Grande frame della GIF dell'esercizio */
.image-premium-frame {
  border: 4px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 10px 30px -10px rgba(0,0,0,0.5) !important;
}

/* Cartellino note del Coach (stile AppSheet originale) */
.coaching-note-card {
  background-color: rgba(254, 240, 138, 0.06) !important;
  border-left: 6px solid #facc15 !important;
  border: 1px solid rgba(250, 204, 21, 0.1) !important;
}

/* Stili Week log list */
.week-log-card {
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.06);
  transition: all 0.2s ease;
}

.week-active-border {
  border: 2px solid #f97316 !important;
  background-color: rgba(249, 115, 22, 0.03) !important;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.15) !important;
  padding: 14px 14px 16px 14px !important;
}

.week-prescription-text {
  border-left: 3px solid #ffb74d;
  color: #fb923c !important;
  background-color: rgba(30, 41, 59, 0.3) !important;
}

.card-glass {
  background: rgba(15, 23, 42, 0.7);
  backdrop-filter: blur(10px);
}

.leading-tight {
  line-height: 1.25;
}

.leading-relaxed {
  line-height: 1.625;
}

/* Stile speciale per le settimane secondarie in visualizzazione Dinamica */
.week-secondary-card {
  opacity: 0.55;
  background: rgba(15, 23, 42, 0.2) !important;
  border: 1px dashed rgba(255, 255, 255, 0.08) !important;
  transform: scale(0.975);
  box-shadow: none !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.week-secondary-card:focus-within,
.week-secondary-card:hover {
  opacity: 0.95;
  transform: scale(1);
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
}

/* Stili per la prescrizione formattata */
.prescription-chip-box {
  background: rgba(30, 41, 59, 0.45) !important;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
  transition: all 0.2s ease;
}

.prescription-chip-box:hover {
  background: rgba(30, 41, 59, 0.6) !important;
  border-color: rgba(249, 115, 22, 0.25);
}

.text-super-caption {
  font-size: 0.65rem !important;
  letter-spacing: 0.05em;
}

.border-orange-darken-3-op {
  border: 1px solid rgba(249, 115, 22, 0.15) !important;
}

.border-right-soft {
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.clickable-timer-chip {
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}
.clickable-timer-chip:hover {
  background: rgba(249, 115, 22, 0.2) !important;
  transform: translateY(-1px) scale(1.02);
}

/* Nuovi Stili Premium per Superserie in Dettaglio */
.superset-detail-card {
  background: rgba(249, 115, 22, 0.02) !important;
  border: 1.5px solid rgba(249, 115, 22, 0.25) !important;
  box-shadow: 0 8px 32px 0 rgba(249, 115, 22, 0.05) !important;
}

.border-superset {
  border-left: 6px solid #ea580c !important;
}

.superset-connected-list {
  background: rgba(15, 23, 42, 0.4) !important;
}

.connected-exercise-item {
  transition: background-color 0.2s ease;
}

.connected-exercise-item:hover {
  background-color: rgba(255, 255, 255, 0.04) !important;
}

.connected-thumb {
  background: rgba(0, 0, 0, 0.2);
}

/* Matite e label trasparenti per input carico settimanale */
.custom-weight-input :deep(.v-label) {
  opacity: 0.35 !important;
  color: #cbd5e1 !important;
  font-weight: 500 !important;
}

.custom-weight-input :deep(.v-field__outline) {
  opacity: 0.45 !important;
}
</style>
