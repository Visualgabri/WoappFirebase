<template>
  <v-container class="px-3 pt-1 pb-4 max-width-container bg-slate-50 min-height-screen pb-12">
    <!-- Header Sticky Wrapper -->
    <div class="sticky-detail-header">
      <!-- Barra Superiore con pulsante indietro stile AppSheet -->
      <div class="d-flex align-center justify-space-between appsheet-top-bar mb-0">
        <v-btn
          icon
          color="orange-darken-3"
          variant="text"
          @click="vaiAdEsercizioPrecedente"
          id="btn-dettaglio-indietro"
        >
          <v-icon :size="layoutCorrente === 'super_compatto' ? 22 : (layoutCorrente === 'compatto' ? 24 : 28)">mdi-arrow-left</v-icon>
        </v-btn>
        <div class="d-flex align-center justify-center flex-grow-1 px-2 min-width-0" style="gap: 8px;">
          <h3 
            class="font-weight-black mb-0 text-center" 
            :class="[
              (previousWorkout && parseInt(previousWorkout.num_scheda) === parseInt(workout?.num_scheda) - 1) ? 'text-red-lighten-3' : 'text-slate-dark'
            ]"
            :style="{
              fontSize: getTitoloFontSize(workout?.des_esercizio),
              whiteSpace: 'normal',
              wordBreak: 'break-word',
              lineHeight: 1.15
            }"
          >
            <v-chip
              v-if="workout?.num_riga_giorno"
              color="orange-darken-3"
              size="x-small"
              class="font-weight-black text-white mr-1.5 px-1.5 py-0 cursor-pointer elevation-1"
              variant="flat"
              style="min-width: 20px; height: 16px; font-size: 0.62rem; display: inline-flex; vertical-align: middle; line-height: 1;"
              @click.stop="vaiAlGiornoAllenamento"
              title="Vai al Giorno Allenamento e alla settimana attiva"
            >
              {{ workout.des_giorno }}{{ workout.num_riga_giorno }}
            </v-chip>
            <v-chip
              v-if="workout?.des_settore"
              color="orange-darken-3"
              variant="tonal"
              size="x-small"
              class="font-weight-black mr-1.5 px-1.5 py-0"
              style="height: 16px; font-size: 0.58rem; display: inline-flex; vertical-align: middle; cursor: pointer; line-height: 1;"
              @click.stop="apriListaSettore"
            >
              {{ workout.des_settore }} ›
            </v-chip>
            <v-chip
              v-if="infoSuperset.inSuperset"
              color="deep-purple-accent-4"
              variant="flat"
              size="x-small"
              class="font-weight-black text-white mr-1.5 px-1.5 py-0"
              style="height: 16px; font-size: 0.58rem; display: inline-flex; vertical-align: middle; line-height: 1; letter-spacing: 0.05em;"
            >
              🔗 SUPERSET {{ infoSuperset.letter }} ({{ infoSuperset.currentIndex }}/{{ infoSuperset.total }})
            </v-chip>
            <br v-if="workout?.num_riga_giorno || workout?.des_settore || infoSuperset.inSuperset">
            <span v-if="trendFreccia" :class="trendFreccia === '▲' ? 'text-red-lighten-3' : 'text-blue-lighten-2'" class="font-weight-black mr-0.5" style="display: inline; white-space: nowrap; vertical-align: middle;">{{ trendFreccia }}</span><span style="vertical-align: middle;">{{ (workout?.flg_ex_mai_fatto === 'false' || workout?.flg_ex_mai_fatto === false) && String(workout?.num_scheda) !== '1' ? '✨' : '' }}{{ workout?.des_esercizio || 'Dettaglio Esercizio' }}</span> <span v-if="workout?.des_esercizio_2 && !parsedTut && !isVolumeString(workout.des_esercizio_2) && !parsedRmt(workout.des_esercizio_2)" class="text-caption text-muted font-weight-regular" style="font-size: 0.78em; opacity: 0.8; vertical-align: middle;">{{ workout.des_esercizio_2 }}</span>
            <v-icon v-if="workout?.flg_video === 'true' || workout?.flg_video === true" color="orange" :size="layoutCorrente === 'super_compatto' ? 14 : (layoutCorrente === 'compatto' ? 16 : 18)" class="ml-1.5 align-center" title="Video richiesto" style="vertical-align: middle;">mdi-video</v-icon>
            <v-chip
              v-if="workout?.des_rec_report"
              color="orange-darken-3"
              variant="flat"
              size="x-small"
              class="font-weight-black text-white ml-1.5 px-2 py-0.5"
              style="font-size: 0.65rem; height: auto; min-height: 20px; display: inline-flex; align-items: center; justify-content: center; cursor: pointer; vertical-align: middle; line-height: 1.2;"
              @click="avviaTimerRecupero(workout.des_rec_report, workout.des_esercizio)"
            >
              ⏱️ {{ workout.des_rec_report }}
            </v-chip>
          </h3>
        </div>
        <div class="d-flex align-center flex-shrink-0 gap-0.5">
          <!-- Teleport del Menu a 3 Puntini nella barra fissa in alto (#top-app-bar-actions) -->
          <teleport to="#top-app-bar-actions">
            <v-menu location="bottom end" transition="scale-transition">
              <template v-slot:activator="{ props }">
                <v-btn
                  icon
                  color="orange-darken-3"
                  variant="text"
                  v-bind="props"
                  title="Opzioni Esercizio"
                  id="btn-dettaglio-menu-opzioni"
                  class="rounded-lg mr-1.5 btn-header-compact"
                >
                  <v-icon size="20">mdi-dots-vertical</v-icon>
                </v-btn>
              </template>
              <v-list class="bg-slate-900 border border-slate-700 py-1" density="compact" width="210">
                <!-- Modifica Esercizio (Coach) -->
                <v-list-item
                  v-if="ruolo === 'coach'"
                  @click="apriDialogModifica"
                  class="px-3"
                >
                  <template v-slot:prepend>
                    <v-icon color="amber-lighten-2" size="20" class="mr-2">mdi-pencil</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-caption text-slate-100">Modifica Esercizio</v-list-item-title>
                </v-list-item>

                <!-- Elimina Esercizio (Coach) -->
                <v-list-item
                  v-if="ruolo === 'coach'"
                  @click="dialogElimina = true"
                  class="px-3"
                >
                  <template v-slot:prepend>
                    <v-icon color="red-lighten-2" size="20" class="mr-2">mdi-delete</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-caption text-slate-100">Elimina Esercizio</v-list-item-title>
                </v-list-item>

                <v-divider v-if="ruolo === 'coach'" class="my-1 border-slate-700"></v-divider>

                <!-- Invia Video WhatsApp -->
                <v-list-item
                  @click="inviaVideoWhatsApp"
                  class="px-3"
                >
                  <template v-slot:prepend>
                    <v-icon color="green-accent-3" size="20" class="mr-2">mdi-whatsapp</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-caption text-slate-100">Invia Video WhatsApp</v-list-item-title>
                </v-list-item>

                <!-- Cerca Esercizio -->
                <v-list-item
                  @click="dialogRicercaRapida = true"
                  class="px-3"
                >
                  <template v-slot:prepend>
                    <v-icon color="orange-darken-3" size="20" class="mr-2">mdi-magnify</v-icon>
                  </template>
                  <v-list-item-title class="font-weight-bold text-caption text-slate-100">Cerca Esercizio</v-list-item-title>
                </v-list-item>
              </v-list>
            </v-menu>
          </teleport>

          <!-- Tasto Avanti -->
          <v-btn
            icon
            color="orange-darken-3"
            variant="text"
            @click="vaiAdEsercizioSuccessivo"
            id="btn-dettaglio-avanti"
            :disabled="listaIdEsercizi.length <= 1 || indexCorrente === listaIdEsercizi.length - 1"
          >
            <v-icon :size="layoutCorrente === 'super_compatto' ? 22 : (layoutCorrente === 'compatto' ? 24 : 28)">mdi-arrow-right</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Avviso Scheda Passata (Modalità Storico) -->
      <v-card
        v-if="isSchedaPassata"
        class="text-left border d-flex align-start card-glass mt-2"
        :class="layoutCorrente === 'super_compatto' ? 'py-1 px-2 mb-1.5' : (layoutCorrente === 'compatto' ? 'py-1.5 px-2.5 mb-2' : 'py-2 px-3 mb-3')"
        :style="{
          background: 'rgba(239, 68, 68, 0.08) !important',
          border: '1.5px solid rgba(239, 68, 68, 0.3) !important',
          boxShadow: '0 4px 20px rgba(239, 68, 68, 0.1)',
          borderRadius: layoutCorrente === 'super_compatto' ? '4px !important' : (layoutCorrente === 'compatto' ? '8px !important' : '10px !important')
        }"
      >
        <v-icon color="red-lighten-2" class="mr-2.5 mt-0.5 flex-shrink-0" size="18">mdi-history</v-icon>
        <div class="text-slate-dark" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : '0.72rem', lineSpace: 1.35 }">
          <strong class="text-red-lighten-2 text-uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem', letterSpacing: '0.05em' }">Modalità Storico</strong><br>
          Stai guardando l'esercizio della <strong class="text-slate-dark">Scheda {{ workout.num_scheda }}</strong>. Le modifiche qui alterano il passato.
        </div>
      </v-card>

      <!-- Avviso Giorno Completato -->
      <v-card
        v-if="workout && isWeekCompleted(settimanaAttiva) && !isSchedaPassata"
        class="text-left border d-flex align-center card-glass mt-2"
        :class="layoutCorrente === 'super_compatto' ? 'py-1.5 px-2.5 mb-1.5' : (layoutCorrente === 'compatto' ? 'py-2 px-3.5 mb-2' : 'py-2.5 px-4 mb-3')"
        :style="{
          background: 'rgba(16, 185, 129, 0.08) !important',
          border: '1.5px solid rgba(16, 185, 129, 0.25) !important',
          boxShadow: '0 4px 20px rgba(16, 185, 129, 0.05)',
          borderRadius: layoutCorrente === 'super_compatto' ? '4px !important' : (layoutCorrente === 'compatto' ? '8px !important' : '12px !important')
        }"
      >
        <v-icon color="green-lighten-2" class="mr-3 flex-shrink-0" :size="layoutCorrente === 'super_compatto' ? 16 : 20">mdi-check-circle-outline</v-icon>
        <div class="text-slate-dark" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.68rem' : '0.75rem', lineSpace: 1.45 }">
          <strong class="text-green-lighten-2">Giorno Completato!</strong> Questa sessione è già stata contrassegnata come completata per la <strong class="text-slate-dark">Week {{ settimanaAttiva }}</strong>.
        </div>
      </v-card>

      <!-- Avviso Infortunio Attivo / Comfort Articolare (Option 2A Sintetica & Super Compatta) -->
      <div v-if="infortuniAttiviEsercizio.length > 0" class="mt-1 mb-1.5">
        <v-chip
          color="red-darken-3"
          variant="flat"
          class="w-100 justify-space-between font-weight-black px-2.5 rounded-lg cursor-pointer"
          style="height: 28px; font-size: 0.65rem;"
          @click="apriGestioneFastidioPannello(infortuniAttiviEsercizio[0])"
        >
          <div class="d-flex align-center gap-1.5 text-truncate">
            <v-icon size="14" color="white">mdi-bandage</v-icon>
            <span class="font-weight-black text-white text-truncate" style="font-size: 0.65rem;">
              {{ infortuniAttiviEsercizio[0].articolazione_coinvolta }} ({{ infortuniAttiviEsercizio[0].gravita }}/10)
              <template v-if="infortuniAttiviEsercizio[0].applica_riduzione !== false && (infortuniAttiviEsercizio[0].percentuale_riduzione ?? 20) > 0">
                • -{{ infortuniAttiviEsercizio[0].percentuale_riduzione ?? 20 }}%
              </template>
              <template v-else>
                • Monitoraggio (100%)
              </template>
            </span>
          </div>
          <div class="d-flex align-center flex-shrink-0 ml-1">
            <span class="text-white font-weight-bold" style="font-size: 0.58rem; opacity: 0.9;">
              ✏️ Modifica
            </span>
          </div>
        </v-chip>
      </div>
    </div>


    <transition :name="transitionName" mode="out-in">
    <div :key="routeIdLocal" class="swipe-transition-wrapper w-100">
    <!-- Stato di caricamento -->
    <div v-if="caricamento" class="text-center my-12">
      <v-progress-circular indeterminate color="orange" size="48"></v-progress-circular>
      <p class="mt-2 text-caption text-muted">Caricamento dettagli esercizio...</p>
    </div>

    <!-- Errore o esercizio non trovato -->
    <div v-else-if="!workout" class="text-center my-12 py-12 card-glass" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : (layoutCorrente === 'compatto' ? 'rounded-lg' : 'rounded-xl')">
      <v-icon size="64" color="red-lighten-2" class="mb-4">mdi-alert-circle-outline</v-icon>
      <h3 class="text-h6 font-weight-bold text-slate-dark">Esercizio non trovato</h3>
    </div>

    <!-- Contenuto Principale (Stile AppSheet verticale fedele) -->
    <div v-else class="exercise-detail-area mt-3.5">

      <!-- Layout Flessibile per GIF a sinistra e scritte a destra in modalità compatto/super_compatto -->
      <div 
        :class="{'d-flex align-start': ['compatto', 'super_compatto'].includes(layoutCorrente)}" 
        :style="['compatto', 'super_compatto'].includes(layoutCorrente) ? 'gap: 12px;' : ''"
      >
        <!-- Colonna Sinistra (solo compatto/super_compatto): GIF + Azioni Rapide per riempire lo spazio vuoto -->
        <div 
          v-if="['compatto', 'super_compatto'].includes(layoutCorrente)"
          class="d-flex flex-column align-center flex-shrink-0"
          :style="{ width: layoutCorrente === 'super_compatto' ? '90px' : '120px' }"
        >
          <v-card 
            class="image-premium-frame overflow-hidden elevation-2 bg-black w-100 position-relative" 
            :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : 'rounded-lg'"
            :style="{ height: layoutCorrente === 'super_compatto' ? '70px' : '95px' }"
          >
            <v-img
              :src="getGifUrl(workout.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600'"
              contain
              class="bg-black"
              height="100%"
              style="cursor: pointer;"
              @click="dialogGifFullScreen = true"
            >
              <template v-slot:placeholder>
                <div class="fill-height d-flex align-center justify-center bg-black">
                  <v-progress-circular indeterminate color="orange" size="16"></v-progress-circular>
                </div>
              </template>
            </v-img>
          </v-card>

        </div>

        <!-- GIF dell'Esercizio Standard (per layout normale) -->
        <v-card 
          v-else
          class="image-premium-frame overflow-hidden elevation-2 bg-black flex-shrink-0 mx-auto mb-3 rounded-xl position-relative" 
          max-width="280px"
          height="150px"
        >
          <v-img
            :src="getGifUrl(workout.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600'"
            contain
            class="bg-black"
            height="100%"
            style="cursor: pointer;"
            @click="dialogGifFullScreen = true"
          >
            <template v-slot:placeholder>
              <div class="fill-height d-flex align-center justify-center bg-black">
                <v-progress-circular indeterminate color="orange" size="16"></v-progress-circular>
              </div>
            </template>
          </v-img>
        </v-card>

        <!-- 2. Intestazione Principale con Massimale / RMT -->
        <div class="mb-2 text-left flex-grow-1" style="min-width: 0;">


        <!-- Visualizzazione RMT Formattata Premium Gamified -->
        <div 
          v-if="parsedRmt(workout.des_esercizio_2)" 
          class="rmt-premium-card card-glass border-orange-darken-3-op"
          :class="[
            layoutCorrente === 'super_compatto' ? 'rounded-sm mt-1.5 pa-2' : (layoutCorrente === 'compatto' ? 'rounded-lg mt-2 pa-2.5' : 'rounded-xl mt-3 pa-3')
          ]"
          style="cursor: pointer;"
          @click="dialogLivelloForza = true"
        >
          <div class="d-flex align-center justify-space-between mb-2">
            <div class="d-flex align-center gap-1 flex-wrap">
              <span class="text-caption text-muted font-weight-black uppercase mr-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem' }">Livello Forza:</span>
              <div class="d-flex align-center gap-0.5">
                <v-icon
                  v-for="i in parsedRmt(workout.des_esercizio_2).stelle"
                  :key="i"
                  color="amber-darken-2"
                  :size="layoutCorrente === 'super_compatto' ? 12 : (layoutCorrente === 'compatto' ? 14 : 16)"
                >
                  mdi-star
                </v-icon>
              </div>
              <v-chip
                :color="parsedRmt(workout.des_esercizio_2).livelloColore"
                size="x-small"
                class="font-weight-black uppercase text-super-caption px-1.5 py-0.5 ml-1 elevation-1"
                variant="flat"
                style="letter-spacing: 0.05em; height: 16px; font-size: 0.52rem;"
              >
                {{ parsedRmt(workout.des_esercizio_2).livelloTesto }}
              </v-chip>
            </div>
            <div class="d-flex align-center gap-2">
              <span v-if="parsedRmt(workout.des_esercizio_2).variazione" class="text-super-caption font-weight-black px-1 py-0.5 rounded d-flex align-center animate-pulse" :style="{ backgroundColor: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? 'rgba(239, 68, 68, 0.12)' : 'rgba(16, 185, 129, 0.12)', color: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? '#f87171' : '#34d399', fontSize: '0.55rem', border: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? '1px solid rgba(239, 68, 68, 0.25)' : '1px solid rgba(16, 185, 129, 0.25)' }">
                {{ parsedRmt(workout.des_esercizio_2).variazione }}
              </span>
              <span class="text-super-caption text-muted font-weight-bold" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.58rem' }">
                {{ parsedRmt(workout.des_esercizio_2).data }}
              </span>
            </div>
          </div>
 
          <v-row dense class="align-center">
            <v-col cols="6" class="border-right-soft">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.58rem' }">1RMT</span>
                <span class="font-weight-black text-orange-darken-3" :class="layoutCorrente === 'super_compatto' ? 'text-body-1' : (layoutCorrente === 'compatto' ? 'text-subtitle-1' : 'text-h6')">
                  {{ parsedRmt(workout.des_esercizio_2).massimale }} <span class="text-super-caption text-muted">KG</span>
                </span>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-black d-block" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.58rem' }">Target Prossimo</span>
                <span class="font-weight-black text-slate-dark" :class="layoutCorrente === 'super_compatto' ? 'text-body-1' : (layoutCorrente === 'compatto' ? 'text-subtitle-1' : 'text-h6')">
                  <template v-if="parsedRmt(workout.des_esercizio_2).prossimoLivello">
                    ~{{ parsedRmt(workout.des_esercizio_2).prossimoLivello }} <span class="text-super-caption text-muted">KG</span>
                  </template>
                  <template v-else>
                    MAX
                  </template>
                </span>
              </div>
            </v-col>
          </v-row>
 
          <!-- RPG Level-up Progress Bar -->
          <div v-if="layoutCorrente !== 'super_compatto'" class="mt-2.5 px-1 border-top-soft pt-2">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.6rem;">Progresso Stella</span>
              <span class="text-super-caption text-amber-darken-2 font-weight-black" style="font-size: 0.6rem;">
                {{ getRmtProgress(parsedRmt(workout.des_esercizio_2)) }}%
              </span>
            </div>
            <v-progress-linear
              :model-value="getRmtProgress(parsedRmt(workout.des_esercizio_2))"
              color="amber-darken-2"
              height="4"
              rounded
              striped
              active
              class="elevation-1"
            ></v-progress-linear>
          </div>
        </div>
 
        <!-- Alternativo se des_esercizio_2 è una stringa Volume speciale -->
        <div 
          v-else-if="isVolumeString(workout.des_esercizio_2)" 
          class="card-glass border-soft"
          :class="[
            layoutCorrente === 'super_compatto' ? 'rounded-sm mt-1.5 pa-2' : (layoutCorrente === 'compatto' ? 'rounded-lg mt-2 pa-2.5' : 'rounded-xl mt-3 pa-3')
          ]"
        >
          <div class="text-super-caption text-muted font-weight-black uppercase mb-1.5" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem' }">
            📊 Volumi Allenamento
          </div>
          <div class="d-flex align-center flex-wrap" :class="layoutCorrente === 'super_compatto' ? 'gap-1' : 'gap-1.5'">
            <span class="vol-pill vol-pill-total" title="Volume Globale (V)">
              <span class="mr-1">📊</span>
              <span class="vol-label">Vol</span>
              <span class="vol-val">{{ parseVolumeString(workout.des_esercizio_2).v }}</span>
            </span>
            <span class="vol-pill vol-pill-upper" title="Parte Alta / Upper Body (A)">
              <span class="mr-1">💪</span>
              <span class="vol-label">Alta</span>
              <span class="vol-val">{{ parseVolumeString(workout.des_esercizio_2).a }}</span>
            </span>
            <span class="vol-pill vol-pill-lower" title="Parte Bassa / Lower Body (B)">
              <span class="mr-1">🦵</span>
              <span class="vol-label">Bassa</span>
              <span class="vol-val">{{ parseVolumeString(workout.des_esercizio_2).b }}</span>
            </span>
            <span v-if="parseFloat(parseVolumeString(workout.des_esercizio_2).c.replace(',', '.')) > 0" class="vol-pill vol-pill-core" title="Core / Centro (C)">
              <span class="mr-1">🎯</span>
              <span class="vol-label">Core</span>
              <span class="vol-val">{{ parseVolumeString(workout.des_esercizio_2).c }}</span>
            </span>
          </div>
        </div>

        <!-- Alternativo: Card Record Assoluto & Record a Reps per esercizi senza Livello Forza (RMT) -->
        <div 
          v-else 
          class="rmt-premium-card card-glass border-amber-darken-3-op cursor-pointer"
          :class="[
            layoutCorrente === 'super_compatto' ? 'rounded-sm mt-1.5 pa-2' : (layoutCorrente === 'compatto' ? 'rounded-lg mt-2 pa-2.5' : 'rounded-xl mt-3 pa-3')
          ]"
          @click="apriStoricoEsercizio"
        >
          <!-- Header Card Record: Pulsante Strategia a Destra -->
          <div class="d-flex align-center justify-end mb-2">
            <v-chip
              size="x-small"
              color="orange-darken-3"
              variant="outlined"
              class="font-weight-black cursor-pointer px-2 text-orange-lighten-2 flex-shrink-0"
              style="font-size: 0.58rem; height: 20px; z-index: 2; background: var(--theme-primary-bg-soft); border-color: var(--theme-primary-border) !important;"
              @click.stop="vibraTattile(15); dialogStrategiaCoach = true"
            >
              <v-icon icon="mdi-brain" size="12" class="mr-1" color="orange-lighten-2" />
              Strategia
            </v-chip>
          </div>

          <v-row dense class="align-center">
            <v-col cols="6" class="border-right-soft">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-bold d-block mb-0.5" style="font-size: 0.50rem; letter-spacing: 0.02em;">Max Assoluto</span>
                <span class="font-weight-black text-cyan-lighten-2" :class="layoutCorrente === 'super_compatto' ? 'text-body-1' : (layoutCorrente === 'compatto' ? 'text-subtitle-1' : 'text-h6')">
                  <template v-if="suggerimentoRecord && (suggerimentoRecord.recordAbsolute > 0 || suggerimentoRecord.recordAbsoluteReps > 0)">
                    <template v-if="isCorpoLiberoEsercizio(workout) && !suggerimentoRecord.recordAbsoluteHasWeight">
                      {{ formatRepsDisplay(suggerimentoRecord.recordAbsoluteReps || suggerimentoRecord.recordAbsolute) }}
                    </template>
                    <template v-else>
                      {{ formatWeight(suggerimentoRecord.recordAbsolute) }} <span class="text-super-caption text-muted ml-0.5">kg</span>
                      <span v-if="suggerimentoRecord.recordAbsoluteReps && suggerimentoRecord.recordAbsoluteReps > 0" class="text-super-caption text-cyan-lighten-3 ml-1" style="font-size: 0.60rem;">
                        x{{ formatRepsDisplay(suggerimentoRecord.recordAbsoluteReps) }}
                      </span>
                      <span v-if="suggerimentoRecord.recordAbsoluteDate && tempoTrascorsoBreve(suggerimentoRecord.recordAbsoluteDate)" class="text-super-caption text-cyan-lighten-4 font-weight-regular ml-1" style="font-size: 0.52rem; opacity: 0.85; white-space: nowrap;">
                        ({{ tempoTrascorsoBreve(suggerimentoRecord.recordAbsoluteDate) }})
                      </span>
                    </template>
                  </template>
                  <template v-else-if="isCorpoLiberoEsercizio(workout)">
                    --
                  </template>
                  <template v-else-if="getRiferimentoSfidaRecord(settimanaAttiva)">
                    {{ formatWeight(getRiferimentoSfidaRecord(settimanaAttiva).peso) }} <span class="text-super-caption text-muted ml-0.5">kg</span>
                  </template>
                  <template v-else>
                    --
                  </template>
                </span>
              </div>
            </v-col>
            <v-col cols="6">
              <div class="text-center">
                <span class="text-super-caption text-muted uppercase font-weight-bold d-block mb-0.5" style="font-size: 0.50rem; letter-spacing: 0.02em;">
                  <template v-if="recordMaxRepsInfo && recordMaxRepsInfo.maxReps > getRepsPerWeek(settimanaAttiva)">
                    Record {{ recordMaxRepsInfo.maxReps }} Reps
                  </template>
                  <template v-else-if="suggerimentoRecord && (suggerimentoRecord.record > 0 || suggerimentoRecord.recordRepsValue > 0)">
                    Max {{ getRepsPerWeek(settimanaAttiva) }} Reps
                  </template>
                  <template v-else-if="currentWeekLoggedWeight">
                    Record {{ getRepsPerWeek(settimanaAttiva) }} Reps
                  </template>
                  <template v-else>
                    Target {{ getRepsPerWeek(settimanaAttiva) }} Reps
                  </template>
                </span>
                <span class="font-weight-black" :class="[layoutCorrente === 'super_compatto' ? 'text-body-1' : (layoutCorrente === 'compatto' ? 'text-subtitle-1' : 'text-h6'), (recordMaxRepsInfo?.isCurrentMeso || currentWeekLoggedWeight) ? 'text-green-accent-3' : 'text-amber-lighten-1']">
                  <template v-if="recordMaxRepsInfo && recordMaxRepsInfo.maxReps > getRepsPerWeek(settimanaAttiva)">
                    <template v-if="isCorpoLiberoEsercizio(workout)">
                      {{ formatRepsDisplay(recordMaxRepsInfo.maxReps) }}
                    </template>
                    <template v-else>
                      {{ formatWeight(recordMaxRepsInfo.peso) }} <span class="text-super-caption text-muted ml-0.5">kg</span>
                      <span class="text-super-caption text-green-lighten-3 ml-1 font-weight-regular" style="font-size: 0.52rem; opacity: 0.9; white-space: nowrap;">
                        {{ recordMaxRepsInfo.isCurrentMeso ? '(questa scheda)' : '' }}
                      </span>
                    </template>
                  </template>
                  <template v-else-if="suggerimentoRecord && (suggerimentoRecord.record > 0 || suggerimentoRecord.recordRepsValue > 0)">
                    <template v-if="isCorpoLiberoEsercizio(workout) && !suggerimentoRecord.recordHasWeight">
                      {{ formatRepsDisplay(suggerimentoRecord.recordRepsValue || suggerimentoRecord.record) }}
                    </template>
                    <template v-else>
                      {{ formatWeight(suggerimentoRecord.record) }} <span class="text-super-caption text-muted ml-0.5">kg</span>
                      <span v-if="suggerimentoRecord.recordRepsValue" class="text-super-caption text-amber-lighten-2 ml-1" style="font-size: 0.60rem;">
                        x{{ formatRepsDisplay(suggerimentoRecord.recordRepsValue) }}
                      </span>
                      <span v-if="suggerimentoRecord.recordRepsDate && tempoTrascorsoBreve(suggerimentoRecord.recordRepsDate)" class="text-super-caption text-amber-lighten-3 font-weight-regular ml-1" style="font-size: 0.52rem; opacity: 0.85; white-space: nowrap;">
                        ({{ tempoTrascorsoBreve(suggerimentoRecord.recordRepsDate) }})
                      </span>
                    </template>
                  </template>
                  <template v-else-if="currentWeekLoggedWeight">
                    {{ formatWeight(currentWeekLoggedWeight) }} <span class="text-super-caption text-muted ml-0.5">kg</span>
                    <span class="text-super-caption text-green-lighten-3 ml-1 font-weight-regular" style="font-size: 0.52rem; opacity: 0.9; white-space: nowrap;">(questa scheda)</span>
                  </template>
                  <template v-else-if="isCorpoLiberoEsercizio(workout) && (!suggerimentoRecord || !suggerimentoRecord.recordHasWeight)">
                    🎯 {{ formatRepsDisplay(getRepsPerWeek(settimanaAttiva)) }}
                  </template>
                  <template v-else-if="getRiferimentoSfidaRecord(settimanaAttiva)">
                    🎯 {{ formatWeight(getRiferimentoSfidaRecord(settimanaAttiva).peso) }} <span class="text-super-caption text-muted ml-0.5">kg</span>
                  </template>
                  <template v-else>
                    --
                  </template>
                </span>
              </div>
            </v-col>
          </v-row>

          <!-- Status Linea Trend Progressione / Suggerimento Target -->
          <div v-if="valutazioneProgressione" class="mt-1.5 pt-1 border-top-soft d-flex align-center justify-center px-1">
            <span class="text-super-caption font-weight-black d-flex align-center justify-center gap-1 text-center" :class="valutazioneProgressione.colore" style="font-size: 0.62rem; width: 100%; white-space: normal; word-break: break-word; line-height: 1.3;">
              <v-icon size="12" class="mr-0.5 flex-shrink-0">{{ valutazioneProgressione.icona }}</v-icon>
              {{ valutazioneProgressione.testo }}
            </span>
          </div>
        </div>

        <div 
          v-if="parsedTut || (workout.des_esercizio_2 && !parsedRmt(workout.des_esercizio_2) && !isVolumeString(workout.des_esercizio_2))"
          :class="[layoutCorrente === 'super_compatto' ? 'mt-0.5 gap-1' : (layoutCorrente === 'compatto' ? 'mt-1 gap-1.25' : 'mt-1 gap-1.5'), 'text-caption font-weight-bold text-slate d-flex align-center flex-wrap']"
        >
          <!-- 1. Chip TUT (se presente) -->
          <v-chip
            v-if="parsedTut"
            color="orange-darken-3"
            variant="tonal"
            size="x-small"
            class="font-weight-black clickable-timer-chip px-2 py-0.5"
            prepend-icon="mdi-clock-outline"
            :append-icon="mostraSpiegazioneTut ? 'mdi-chevron-up' : 'mdi-chevron-down'"
            @click="mostraSpiegazioneTut = !mostraSpiegazioneTut"
          >
            ⏱️ TUT {{ parsedTut.digits }} • Nota
          </v-chip>

          <!-- 2. Fallback Chip per altre descrizioni -->
          <v-chip
            v-else-if="workout.des_esercizio_2 && !parsedRmt(workout.des_esercizio_2) && !isVolumeString(workout.des_esercizio_2)"
            color="orange-darken-3"
            variant="tonal"
            size="x-small"
            class="font-weight-black px-2 py-0.5"
          >
            {{ workout.des_esercizio_2 }}
          </v-chip>
        </div>

        <!-- Spiegazione espandibile del TUT -->
        <v-expand-transition>
          <v-card
            v-if="parsedTut && mostraSpiegazioneTut"
            class="py-2.5 px-3.5 mt-3 text-left border card-glass"
            :style="{
              background: 'rgba(249, 115, 22, 0.08) !important',
              border: '1.5px solid rgba(249, 115, 22, 0.25) !important',
              boxShadow: '0 4px 20px rgba(249, 115, 22, 0.05)',
              borderRadius: layoutCorrente === 'super_compatto' ? '4px !important' : (layoutCorrente === 'compatto' ? '8px !important' : '12px !important')
            }"
          >
            <div class="d-flex align-center mb-2">
              <v-icon color="orange-lighten-2" class="mr-2" size="18">mdi-clock-outline</v-icon>
              <span class="text-caption font-weight-black text-orange-lighten-2 uppercase">Tempo Sotto Tensione (TUT {{ parsedTut.digits }})</span>
            </div>
            <div class="text-slate-dark" style="font-size: 0.72rem; line-height: 1.45;">
              <div class="mb-1">
                ⏱️ <strong class="text-slate-dark">1ª Cifra ({{ parsedTut.f1 }}s):</strong> Fase iniziale del movimento (da quando parte l’esercizio).
              </div>
              <div class="mb-1">
                ⏱️ <strong class="text-slate-dark">2ª Cifra ({{ parsedTut.f2 }}s):</strong> Fase di contrazione (mantenere la tensione).
              </div>
              <div class="mb-1.5">
                ⏱️ <strong class="text-slate-dark">3ª Cifra ({{ parsedTut.f3 }}s):</strong> Fase di ritorno (quando il movimento torna indietro o si conclude).
              </div>
              <div class="pt-2 text-super-caption text-muted font-italic" style="border-top: 1px solid rgba(255, 255, 255, 0.08) !important;">
                Attenzione: la prima e la terza fase non sono per forza concentrica o eccentrica in modo fisso, dipende da come inizia l’esercizio (1ª fase da quando parte, 2ª in contrazione, 3ª di ritorno o chiusura).
              </div>
            </div>
          </v-card>
        </v-expand-transition>

        <!-- Action Row (Scorso, Storico) - Accesso Diretto e Rapido -->
        <div class="d-flex align-center justify-end gap-1.5 mt-2 mb-1 px-0.5">
          <v-btn
            v-if="previousWorkout"
            prepend-icon="mdi-calendar-arrow-left"
            variant="tonal"
            color="orange-darken-2"
            size="x-small"
            class="font-weight-black text-none px-2 rounded-lg elevation-1 btn-scorso-action"
            style="font-size: 0.62rem; height: 24px; letter-spacing: 0.02em;"
            @click="dialogProgressioniPrecedente = true"
          >
            Scorso
          </v-btn>

          <v-btn
            prepend-icon="mdi-chart-timeline-variant"
            variant="tonal"
            color="cyan-darken-2"
            size="x-small"
            class="font-weight-black text-none px-2 rounded-lg elevation-1 btn-storico-action"
            style="font-size: 0.62rem; height: 24px; letter-spacing: 0.02em;"
            @click="apriStoricoEsercizio"
            title="Mostra Cronologia & Grafico Prestazioni Esercizio"
          >
            Storico
          </v-btn>
        </div>

          </div>
        </div>

      <!-- Banner Avviso Coach: Stallo Mesociclo Precedente -->
      <v-card
        v-if="settimanaAttiva === 1 && isStalledInPreviousMesocycle"
        class="text-left border d-flex flex-column mb-3 animate-pulse"
        style="background: linear-gradient(135deg, rgba(234, 88, 12, 0.18), rgba(239, 68, 68, 0.08)) !important; border: 1.5px solid rgba(249, 115, 22, 0.5) !important; border-left: 4px solid #f97316 !important; border-radius: 12px !important; padding: 12px;"
      >
        <div class="d-flex align-start">
          <v-icon color="orange-darken-1" class="mr-2 flex-shrink-0 mt-0.5" size="20">mdi-alert-circle</v-icon>
          <div class="flex-grow-1">
            <h4 class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-1" style="font-size: 0.85rem !important;">
              Coach Warning: Nessuna Progressione nel Mesociclo Precedente
            </h4>
            <p class="text-slate font-weight-medium mb-2" style="font-size: 0.72rem; line-height: 1.4;">
              Su questo esercizio non sono state registrate progressioni tra W1 e W6 dello scorso mesociclo. 
              In questa Week 1 prova a segnare anche solo <strong>+1 rep o +0.5/1 kg</strong>!
            </p>
            <div class="d-flex align-center gap-2">
              <v-btn
                color="orange-darken-3"
                size="x-small"
                variant="flat"
                class="font-weight-black text-white text-none"
                rounded="lg"
                @click="impostaCaricoLimite"
              >
                🏋️ Carico ancora al limite
              </v-btn>
            </div>
          </div>
        </div>
      </v-card>

      <div class="weeks-stacked-list mb-4">
        <template v-for="sett in settimaneVisualizzate" :key="sett">
        <v-card
          :id="'week-card-' + sett"
          class="week-log-card border transition-all"
          :class="[
            layoutCorrente === 'super_compatto' ? 'rounded-sm py-1.5 px-2 mb-2.5' : (layoutCorrente === 'compatto' ? 'rounded-lg py-2 px-3 mb-4' : 'rounded-xl py-2.5 px-3 mb-6'),
            {
              'week-active-border': sett === settimanaAttiva,
              'week-secondary-card': modalitaSettimane === 'dinamica' && sett !== settimanaAttiva
            }
          ]"
          :style="[
            sett === settimanaAttiva ? (layoutCorrente === 'super_compatto' ? 'padding: 10px 10px 10px 10px !important;' : (layoutCorrente === 'compatto' ? 'padding: 12px 12px 14px 12px !important;' : 'padding: 14px 14px 16px 14px !important;')) : (modalitaSettimane === 'dinamica' ? (currentTheme === 'light' ? 'opacity: 0.9 !important;' : 'opacity: 0.50 !important;') : '')
          ]"
          elevation="1"
        >
          <!-- Header Integrato Note Coach, Setup Attrezzo, Macchina e RIR (solo sulla settimana attiva) -->
          <div
            v-if="sett === settimanaAttiva && ((workout.des_note && String(workout.des_note).trim()) || (workout.des_note_attrezzo && String(workout.des_note_attrezzo).trim()) || (workout.des_note_gen_attr && String(workout.des_note_gen_attr).trim()) || (workout.des_estesa_start && String(workout.des_estesa_start).trim()) || haEsponenti)"
            class="coaching-integrated-header mb-2.5 pa-2 rounded-lg"
          >
            <!-- 1. Setup Attrezzo (evidente e ingrandito) -->
            <div v-if="workout.des_note_attrezzo && String(workout.des_note_attrezzo).trim()" class="d-flex align-center py-0.5" style="gap: 6px;">
              <v-icon color="orange-darken-1" size="16" class="flex-shrink-0">mdi-wrench</v-icon>
              <div class="text-slate-dark font-weight-bold" style="font-size: 0.76rem; line-height: 1.3;">
                <span class="text-orange-lighten-2 uppercase font-weight-black mr-1" style="font-size: 0.66rem; letter-spacing: 0.04em;">SETUP:</span>
                <span class="text-slate-dark font-weight-black">{{ String(workout.des_note_attrezzo).trim() }}</span>
              </div>
            </div>

            <!-- 2. Note Coach -->
            <div
              v-if="workout.des_note && String(workout.des_note).trim()"
              class="d-flex align-start py-0.5"
              style="gap: 6px;"
              :class="{'mt-1 pt-1 border-top-soft': workout.des_note_attrezzo}"
            >
              <v-icon color="orange-lighten-2" size="15" class="flex-shrink-0 mt-0.5">mdi-information-outline</v-icon>
              <div class="text-slate-dark font-weight-medium" style="font-size: 0.74rem; line-height: 1.35;">
                <span class="text-orange-lighten-2 uppercase font-weight-black mr-1" style="font-size: 0.65rem; letter-spacing: 0.03em;">COACH:</span>
                <span>{{ String(workout.des_note).trim() }}</span>
              </div>
            </div>

            <!-- 3. Note Macchina -->
            <div
              v-if="workout.des_note_gen_attr && String(workout.des_note_gen_attr).trim()"
              class="d-flex align-start py-0.5"
              style="gap: 6px;"
              :class="{'mt-1 pt-1 border-top-soft': workout.des_note || workout.des_note_attrezzo}"
            >
              <v-icon color="cyan-lighten-2" size="15" class="flex-shrink-0 mt-0.5">mdi-cogs</v-icon>
              <div class="text-slate-dark font-weight-medium" style="font-size: 0.72rem; line-height: 1.3;">
                <span class="text-cyan-lighten-2 uppercase font-weight-black mr-1" style="font-size: 0.65rem; letter-spacing: 0.03em;">MACCHINA:</span>
                <span>{{ String(workout.des_note_gen_attr).trim() }}</span>
              </div>
            </div>

            <!-- 4. Tecnica / ROM -->
            <div
              v-if="workout.des_estesa_start && String(workout.des_estesa_start).trim()"
              class="d-flex align-start py-0.5"
              style="gap: 6px;"
              :class="{'mt-1 pt-1 border-top-soft': workout.des_note || workout.des_note_attrezzo || workout.des_note_gen_attr}"
            >
              <v-icon color="amber-lighten-2" size="15" class="flex-shrink-0 mt-0.5">mdi-cog-play-outline</v-icon>
              <div class="text-slate-dark font-weight-medium" style="font-size: 0.72rem; line-height: 1.35;">
                <span class="text-amber-lighten-2 uppercase font-weight-black mr-1" style="font-size: 0.65rem; letter-spacing: 0.03em;">TECNICA/ROM:</span>
                <span>{{ getDescrizioneBreve(workout.des_estesa_start) }}</span>
              </div>
            </div>

            <!-- 5. RIR (se presenti esponenti) -->
            <div
              v-if="haEsponenti"
              class="d-flex align-start py-0.5"
              style="gap: 6px;"
              :class="{'mt-1 pt-1 border-top-soft': workout.des_note || workout.des_note_attrezzo || workout.des_note_gen_attr || workout.des_estesa_start}"
            >
              <v-icon color="blue-lighten-2" size="15" class="flex-shrink-0 mt-0.5">mdi-information-outline</v-icon>
              <div class="text-slate-dark font-weight-medium" style="font-size: 0.70rem; line-height: 1.3;">
                <span class="text-blue-lighten-2 uppercase font-weight-black mr-1" style="font-size: 0.65rem; letter-spacing: 0.03em;">RIR:</span>
                <span>Il numero ad esponente (es. 8²) indica le ripetizioni di margine da tenere prima del cedimento.</span>
              </div>
            </div>
          </div>
          <!-- Intestazione della Settimana -->
          <div class="d-flex align-center justify-space-between" :class="layoutCorrente === 'super_compatto' ? 'mb-1' : 'mb-2'">
            <div class="d-flex align-center">
              <v-icon
                :color="haRecupero(inputSettimane[sett].ins) ? 'red-lighten-2' : (isWeekCompleted(sett) || (inputSettimane[sett]?.ins && String(inputSettimane[sett].ins).trim() !== '' && String(inputSettimane[sett].ins).trim() !== '-') ? 'green-darken-2' : 'grey-lighten-1')"
                class="mr-2"
                :size="layoutCorrente === 'super_compatto' ? 14 : 18"
              >
                {{ haRecupero(inputSettimane[sett].ins) ? 'mdi-sync' : ((isWeekCompleted(sett) || (inputSettimane[sett]?.ins && String(inputSettimane[sett].ins).trim() !== '' && String(inputSettimane[sett].ins).trim() !== '-')) ? 'mdi-check-circle' : 'mdi-circle-outline') }}
              </v-icon>
              <span class="text-caption font-weight-black d-flex align-center flex-wrap gap-1" :class="sett === settimanaAttiva ? 'text-orange-darken-3' : 'text-slate-dark'" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.7rem !important' : '0.8rem !important' }">
                WEEK {{ sett }}
                <span v-if="parsedPrescription(workout['des_week' + sett])" class="ml-1 font-weight-black" :class="sett === settimanaAttiva ? 'text-orange-lighten-2' : 'text-slate'" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.95rem !important' : '1.1rem !important' }">
                  ({{ parsedPrescription(workout['des_week' + sett]).reps }})
                </span>
                <span v-else-if="workout['des_week' + sett]" class="ml-1 font-weight-black" :class="sett === settimanaAttiva ? 'text-orange-lighten-2' : 'text-slate'" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.95rem !important' : '1.1rem !important' }">
                  ({{ pulisciParentesiQuadre(workout['des_week' + sett]) }})
                </span>
              </span>
            </div>

            <!-- Tag di Stato (Etichetta informativa non cliccabile) -->
            <v-chip
              v-if="sett === settimanaAttiva || haRecupero(inputSettimane[sett].ins)"
              :color="haRecupero(inputSettimane[sett].ins) ? 'red-lighten-2' : ((isWeekCompleted(sett) || (inputSettimane[sett]?.ins && String(inputSettimane[sett].ins).trim() !== '' && String(inputSettimane[sett].ins).trim() !== '-')) ? 'green-lighten-2' : 'orange-lighten-2')"
              size="x-small"
              class="font-weight-black px-1.5 week-active-chip"
              :style="{ height: '16px', fontSize: '0.54rem', letterSpacing: '0.04em', pointerEvents: 'none' }"
              variant="tonal"
            >
              {{ haRecupero(inputSettimane[sett].ins) ? 'DA COMPLETARE' : ((isWeekCompleted(sett) || (inputSettimane[sett]?.ins && String(inputSettimane[sett].ins).trim() !== '' && String(inputSettimane[sett].ins).trim() !== '-')) ? '✓ COMPLETATA' : 'ATTIVA') }}
            </v-chip>
            <v-chip v-else-if="modalitaSettimane === 'dinamica'" color="grey-darken-2" size="x-small" class="font-weight-bold px-1.5 week-altre-chip" style="height: 16px; font-size: 0.52rem; pointer-events: none;" variant="outlined">ALTRE</v-chip>
          </div>

          <!-- Prescrizione Tecnica Formattata (senza simboli strani) -->
          <div v-if="parsedPrescription(workout['des_week' + sett])" :class="layoutCorrente === 'super_compatto' ? 'mb-1 px-0.5' : 'mb-2 px-1'">
            <!-- Rigo Unico con Dettagli Carico e Intensità -->
            <v-row dense>
              <!-- Carico Totale -->
              <v-col :cols="parsedPrescription(workout['des_week' + sett]).side ? 4 : 4">
                <div 
                  class="prescription-chip-box text-center fill-height d-flex flex-column justify-center"
                  :class="[
                    layoutCorrente === 'super_compatto' ? 'rounded-sm px-1 py-0.5' : (layoutCorrente === 'compatto' ? 'rounded-md px-1.5 py-1' : 'rounded-lg px-1.5 py-1')
                  ]"
                  style="cursor: pointer;"
                  @click="apriCalcolatoreDischi(parsedPrescription(workout['des_week' + sett]).total, parsedPrescription(workout['des_week' + sett]).side, 'totale', workout?.des_esercizio)"
                >
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : '0.52rem', lineHeight: 1 }">Carico</span>
                  <span class="text-caption font-weight-black text-slate-dark" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem !important' : '0.85rem !important', whiteSpace: 'nowrap' }">
                    {{ parsedPrescription(workout['des_week' + sett]).total }} <span class="text-super-caption text-muted" style="font-size: 0.55rem;">KG</span>
                  </span>
                </div>
              </v-col>
              <!-- Peso per Lato (solo se presente) -->
              <v-col v-if="parsedPrescription(workout['des_week' + sett]).side" cols="3">
                <div 
                  class="prescription-chip-box text-center fill-height d-flex flex-column justify-center"
                  :class="[
                    layoutCorrente === 'super_compatto' ? 'rounded-sm px-1 py-0.5' : (layoutCorrente === 'compatto' ? 'rounded-md px-1.5 py-1' : 'rounded-lg px-1.5 py-1')
                  ]"
                  style="cursor: pointer;"
                  @click="apriCalcolatoreDischi(parsedPrescription(workout['des_week' + sett]).total, parsedPrescription(workout['des_week' + sett]).side, 'totale', workout?.des_esercizio)"
                >
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : '0.52rem', lineHeight: 1 }">Lato</span>
                  <span class="text-caption font-weight-black text-blue-lighten-2" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem !important' : '0.85rem !important', whiteSpace: 'nowrap' }">
                    {{ parsedPrescription(workout['des_week' + sett]).side }} <span class="text-super-caption text-muted" style="font-size: 0.55rem;">KG</span>
                  </span>
                </div>
              </v-col>
              <!-- % Massimale -->
              <v-col :cols="parsedPrescription(workout['des_week' + sett]).side ? 2 : 4">
                <div 
                  class="prescription-chip-box text-center fill-height d-flex flex-column justify-center"
                  :class="[
                    layoutCorrente === 'super_compatto' ? 'rounded-sm px-1 py-0.5' : (layoutCorrente === 'compatto' ? 'rounded-md px-1.5 py-1' : 'rounded-lg px-1.5 py-1')
                  ]"
                >
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5 text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : '0.52rem', lineHeight: 1 }">%1RM</span>
                  <span class="text-caption font-weight-black text-orange-lighten-2" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem !important' : '0.85rem !important', whiteSpace: 'nowrap' }">
                    {{ parsedPrescription(workout['des_week' + sett]).max || '-' }}
                  </span>
                </div>
              </v-col>
              <!-- % Sforzo -->
              <v-col :cols="parsedPrescription(workout['des_week' + sett]).side ? 3 : 4">
                <div 
                  class="prescription-chip-box text-center fill-height d-flex flex-column justify-center"
                  :class="[
                    layoutCorrente === 'super_compatto' ? 'rounded-sm px-1 py-0.5' : (layoutCorrente === 'compatto' ? 'rounded-md px-1.5 py-1' : 'rounded-lg px-1.5 py-1')
                  ]"
                >
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5 text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : '0.52rem', lineHeight: 1 }">Sforzo</span>
                  <span class="text-caption font-weight-black text-green-lighten-2" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem !important' : '0.85rem !important', whiteSpace: 'nowrap' }">
                    {{ parsedPrescription(workout['des_week' + sett]).effort || '-' }}
                  </span>
                </div>
              </v-col>
            </v-row>
          </div>
          
          <!-- Fallback se non corrisponde al pattern speciale -->
          <div v-else-if="!workout['des_week' + sett]" class="week-prescription-text text-caption font-weight-bold text-slate mb-2 py-0.5 px-2 rounded bg-slate-100" style="font-size: 0.75rem;">
            Nessuna prescrizione
          </div>


          <!-- Istruzioni Esecuzione / Test sotto il Lavoro (LAVORO) -->
          <div 
            v-if="workout && sett === 6 && workout.des_estesa_end && String(workout.des_estesa_end).trim()"
            class="mt-2.5 mb-2 px-2.5 py-2 text-left"
            :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : (layoutCorrente === 'compatto' ? 'rounded-md' : 'rounded-lg')"
            style="background: rgba(249, 115, 22, 0.03) !important; border: 1px dashed rgba(249, 115, 22, 0.15) !important;"
          >
            <div>
              <p v-html="'📢 ' + formattaIstruzioneFine(workout.des_estesa_end, sett)" class="text-orange-lighten-3 font-weight-bold mb-0" style="font-size: 0.72rem; line-height: 1.4;"></p>
            </div>
          </div>

          <div :class="[layoutCorrente === 'super_compatto' ? 'mt-1 mb-0.5' : (layoutCorrente === 'compatto' ? 'mt-2 mb-0.5' : 'mt-3.5 mb-1'), 'position-relative']">
            <div v-if="getGhostRenderInfo(sett)" :class="layoutCorrente === 'super_compatto' ? 'mb-0.5 px-1 animate-fade-in' : 'mb-1.5 px-1 animate-fade-in'">
              <div class="d-flex flex-column text-left">
                <!-- RIGA 1: Carico Consigliato + Badge / Icone -->
                <div class="d-flex align-center justify-space-between w-100">
                  <div 
                    class="d-flex align-center gap-1.5 min-width-0 cursor-pointer"
                    style="user-select: none; -webkit-user-select: none; -webkit-touch-callout: none;"
                    @pointerdown="startGhostLongPress(sett, $event)"
                    @pointerup="cancelGhostLongPress"
                    @pointerleave="cancelGhostLongPress"
                    @pointercancel="cancelGhostLongPress"
                    @contextmenu.prevent
                    @click="handleGhostClick(sett)"
                    :title="getGhostRenderInfo(sett).deltaW1 ? 'Tieni premuto per vedere l’incremento vs W1' : ''"
                  >
                    <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" :color="getGhostRenderInfo(sett).color" class="flex-shrink-0">
                      {{ getGhostRenderInfo(sett).icon }}
                    </v-icon>
                    
                    <span class="font-weight-black text-uppercase text-truncate mr-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.55rem' : '0.62rem', color: getGhostRenderInfo(sett).color, letterSpacing: '0.04em' }">
                      {{ getGhostRenderInfo(sett).label }}
                    </span>
                    
                    <span class="text-green-accent-3 font-weight-black text-no-wrap flex-shrink-0" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.75rem' : '0.85rem' }">
                      {{ getGhostRenderInfo(sett).valueText }}
                    </span>
                  </div>
                  
                  <div class="d-flex align-center gap-1">


                    <span v-if="analizzaRecordSettimana(sett)" :class="analizzaRecordSettimana(sett).stato === 'record' ? 'text-amber-lighten-1' : 'text-orange-lighten-2'" class="font-weight-black mr-1 cursor-pointer animate-pulse" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.55rem' : '0.62rem' }" @click.stop="apriAiutoCaricoDettagliato(sett)">
                      {{ analizzaRecordSettimana(sett).stato === 'record' ? '🏆 PR' : '🔥 Quasi' }}
                    </span>

                    <span class="cursor-pointer text-muted font-weight-bold" @click.stop="apriAiutoCaricoDettagliato(sett)" style="font-size: 0.75rem;">
                      💡
                    </span>
                  </div>
                </div>

                <!-- RIGA 2: Dettagli di Riferimento Storico (Muted, più piccolo) -->
                <div v-if="getGhostRenderInfo(sett).hasReference" class="text-muted mt-0.5" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.60rem' }" style="padding-left: 16px; text-transform: none;">
                  <!-- Caso Week 1 -->
                  <template v-if="getGhostLiftSmart(sett).isWeek1">
                    (prec. W{{ getGhostLiftSmart(sett).proposta?.settimanaBase || 6 }}: 
                    <strong v-if="parseFloat(getGhostLiftSmart(sett).text) > 0" class="text-slate-light">{{ getGhostLiftSmart(sett).text }}kg</strong>
                    <span v-if="getGhostLiftSmart(sett).reps">
                      <span v-if="parseFloat(getGhostLiftSmart(sett).text) > 0">x</span><strong :class="getColoreRepsPrecedentiClass(sett, getGhostLiftSmart(sett).reps)">{{ getGhostLiftSmart(sett).reps }}</strong>r
                    </span>
                    <span v-if="getGhostLiftSmart(sett).fatica && getGhostLiftSmart(sett).fatica !== 'Non specificata'">
                      - sforzo: <span :style="getColoreFaticaStyle(getGhostLiftSmart(sett).fatica)" class="font-weight-black">{{ getGhostLiftSmart(sett).fatica.trim().charAt(0).toUpperCase() }}</span>
                    </span>)
                    <span v-if="getGhostLiftSmart(sett).stimaMenoAccurata" class="text-amber-lighten-2 ml-1" title="Carica il Miglior Carico W6 per una stima più precisa">
                      ⚠️ stima W{{ getGhostLiftSmart(sett).proposta?.settimanaBase || 5 }}
                    </span>
                  </template>
                  
                  <!-- Caso Scarico -->
                  <template v-else-if="getGhostLiftSmart(sett).isScarico">
                    <template v-if="getGhostLiftSmart(sett).isRepExercise">
                      Usa <span class="text-green-accent-3 font-weight-bold">{{ scaricoWeek4Weights.textW2 || (formatRepsDisplay(getGhostLiftSmart(sett).peso) || 'W2') }}</span> (W2)
                      <span v-if="scaricoWeek4Weights.textW3">
                        • prec. W3: <strong class="text-slate-light">{{ scaricoWeek4Weights.textW3 }}</strong>
                      </span>
                    </template>
                    <template v-else>
                      Usa <span class="text-green-accent-3 font-weight-bold">{{ formatWeight(getGhostLiftSmart(sett).peso) }} kg</span> (W2)
                      <span v-if="scaricoWeek4Weights.textW3 || scaricoWeek4Weights.pesoW3">
                        • prec. W3: <strong class="text-slate-light">{{ scaricoWeek4Weights.textW3 || (formatWeight(scaricoWeek4Weights.pesoW3) + ' kg') }}</strong>
                      </span>
                    </template>
                  </template>
                  
                  <!-- Caso Post Scarico o progressione standard -->
                  <template v-else>
                    <span v-if="stileVisualizzazioneGhost === 'range' && getGhostWeightsRangeText(sett)" class="text-green-accent-3 font-weight-bold mr-2">
                      ↔ {{ getGhostWeightsRangeText(sett) }}
                    </span>
                    <span v-if="getGhostLiftSmart(sett).text">
                      (prec. {{ getGhostLiftSmart(sett).label }}: <strong class="text-slate-light">{{ getGhostLiftSmart(sett).text }}</strong>)
                    </span>
                  </template>
                </div>
              </div>
            </div>
            
            <div v-if="getGhostLiftSmart(sett) && getGhostLiftSmart(sett).isScarico" class="text-super-caption font-weight-medium text-amber-lighten-1" :class="layoutCorrente === 'super_compatto' ? 'mt-0.5' : 'mt-1'" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.55rem', lineSpace: 1.2, letterSpacing: '0.02em' }">
              💡 Se reputi il carico troppo leggero, puoi fare 1+ rep in più e registrarla (es. <span class="text-green-accent-3 font-weight-black">{{ formatWeight(getGhostLiftSmart(sett).peso) }}kg x{{ getRepsPerWeek(sett) + 1 }}r</span>).
            </div>

            <div v-if="getGhostRenderInfo(sett) && getGhostRenderInfo(sett).maxEffortNotice" class="text-super-caption font-weight-bold text-amber-lighten-2 text-left px-1 mt-1 mb-2" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.55rem', letterSpacing: '0.02em', marginBottom: (margineBottomGhostNoticeGlobal ?? 10) + 'px !important' }">
              {{ getGhostRenderInfo(sett).maxEffortNotice }}
            </div>


            <!-- BOTTONI DI SUGGERIMENTO RAPIDO PER ATTIVA -->
            <div 
              v-if="sett === settimanaAttiva && !isSchedaPassata && getGhostLiftSmart(sett) && !getGhostLiftSmart(sett).isRepExercise && getGhostWeightsRangeForWeek(sett) && (stileVisualizzazioneGhost === 'forma' || sett === 1)"
              class="d-flex flex-wrap gap-1.5 mt-1.5 mb-2.5 w-100 align-center justify-space-between animate-fade-in"
            >
              <div class="w-100 text-super-caption text-left text-muted mb-1" style="font-size: 0.58rem !important; letter-spacing: 0.05em;">
                {{ (sett === 1 && getGhostLiftSmart(sett).recordVal) ? '🏆 SFIDA IL RECORD IN WEEK 1:' : (sett === 1 ? '💡 RANGE PROPOSTO IN WEEK 1:' : (stileVisualizzazioneGhost === 'forma' ? '💡 COME TI SENTI OGGI?' : (stileVisualizzazioneGhost === 'marce' ? '⚙️ SELEZIONA LA MARCIA:' : '💡 TOCCA PER APPLICARE:'))) }}
              </div>
              
              <!-- 1. PRUDENZIALE / STANCO / MARCIA 1 -->
              <v-btn
                :variant="sensibilitaFaticaGhost === 'conservativa' ? 'flat' : 'outlined'"
                :color="sensibilitaFaticaGhost === 'conservativa' ? 'green-darken-2' : 'blue-lighten-2'"
                size="x-small"
                class="flex-grow-1 text-none px-2 rounded-lg"
                :class="{ 'text-white': sensibilitaFaticaGhost === 'conservativa' }"
                style="height: 32px; font-size: 0.72rem; min-width: 30%; max-width: 32%; background: rgba(144, 205, 244, 0.04);"
                @click="applicaPropostaCaricoRapida(sett, getGhostWeightsRangeForWeek(sett).prudenziale.value)"
              >
                <div class="d-flex flex-column align-center line-height-tight">
                  <span class="font-weight-black" :class="sensibilitaFaticaGhost === 'conservativa' ? 'text-white' : 'text-blue-lighten-3'">{{ getGhostWeightsRangeForWeek(sett).prudenziale.display }}</span>
                  <span style="font-size: 0.52rem; opacity: 0.85;" class="text-truncate">
                    {{ sett === 1 ? getGhostWeightsRangeForWeek(sett).prudenziale.label : (stileVisualizzazioneGhost === 'forma' ? 'Stanco' : (stileVisualizzazioneGhost === 'marce' ? 'M1 (Safe)' : getGhostWeightsRangeForWeek(sett).prudenziale.label)) }}
                  </span>
                </div>
              </v-btn>

              <!-- 2. CONSIGLIATO / NORMALE / MARCIA 2 -->
              <v-btn
                :variant="sensibilitaFaticaGhost === 'bilanciata' ? 'flat' : 'outlined'"
                color="green-darken-2"
                size="x-small"
                class="flex-grow-1 text-none px-2 rounded-lg"
                :class="{ 'text-white': sensibilitaFaticaGhost === 'bilanciata' }"
                style="height: 32px; font-size: 0.72rem; min-width: 30%; max-width: 32%;"
                @click="applicaPropostaCaricoRapida(sett, getGhostWeightsRangeForWeek(sett).consigliato.value)"
              >
                <div class="d-flex flex-column align-center line-height-tight">
                  <span class="font-weight-black" :class="sensibilitaFaticaGhost === 'bilanciata' ? 'text-white' : ''">{{ getGhostWeightsRangeForWeek(sett).consigliato.display }}</span>
                  <span style="font-size: 0.52rem; opacity: 0.9;" class="text-truncate">
                    {{ sett === 1 ? getGhostWeightsRangeForWeek(sett).consigliato.label : (stileVisualizzazioneGhost === 'forma' ? 'Normale' : (stileVisualizzazioneGhost === 'marce' ? 'M2 (Prog)' : getGhostWeightsRangeForWeek(sett).consigliato.label)) }}
                  </span>
                </div>
              </v-btn>

              <!-- 3. SFIDANTE / FORTE / MARCIA 3 -->
              <v-btn
                :variant="sensibilitaFaticaGhost === 'aggressiva' ? 'flat' : 'outlined'"
                :color="sensibilitaFaticaGhost === 'aggressiva' ? 'green-darken-2' : 'amber-darken-2'"
                size="x-small"
                class="flex-grow-1 text-none px-2 rounded-lg"
                :class="{ 'text-white': sensibilitaFaticaGhost === 'aggressiva' }"
                style="height: 32px; font-size: 0.72rem; min-width: 30%; max-width: 32%; background: rgba(245, 158, 11, 0.04);"
                @click="applicaPropostaCaricoRapida(sett, getGhostWeightsRangeForWeek(sett).sfidante.value)"
              >
                <div class="d-flex flex-column align-center line-height-tight">
                  <span class="font-weight-black" :class="sensibilitaFaticaGhost === 'aggressiva' ? 'text-white' : 'text-amber-lighten-2'">{{ getGhostWeightsRangeForWeek(sett).sfidante.display }}</span>
                  <span style="font-size: 0.52rem; opacity: 0.85;" class="text-truncate">
                    {{ sett === 1 ? getGhostWeightsRangeForWeek(sett).sfidante.label : (stileVisualizzazioneGhost === 'forma' ? 'Forte' : (stileVisualizzazioneGhost === 'marce' ? 'M3 (PR!)' : getGhostWeightsRangeForWeek(sett).sfidante.label)) }}
                  </span>
                </div>
              </v-btn>
            </div>
            
            <!-- Box Formattato con Numeri in Risalto (Visualizzazione) -->
            <div
              v-if="risaltoNumeriInsWeek && activeEditingWeek !== sett && inputSettimane[sett]?.ins && String(inputSettimane[sett].ins).trim()"
              class="custom-weight-input v-input--density-compact position-relative cursor-text d-flex align-start justify-space-between transition-all"
              :class="[getGhostFieldClass(sett), layoutCorrente === 'super_compatto' ? 'custom-compact-textarea' : '']"
              :style="{
                marginTop: (margineTopInputWeekGlobal ?? 14) + 'px !important',
                marginBottom: (margineBottomInputWeekGlobal ?? 16) + 'px !important',
                minHeight: layoutCorrente === 'super_compatto' ? '36px' : '40px',
                padding: layoutCorrente === 'super_compatto' ? '6px 10px' : '8px 12px',
                borderRadius: layoutCorrente === 'super_compatto' ? '4px' : (layoutCorrente === 'compatto' ? '8px' : '12px')
              }"
              @click="attivaEditingWeek(sett)"
            >
              <!-- Testo Formattato (Numeri grandi, Note alfanumeriche piccole) -->
              <div 
                class="flex-grow-1 text-left pr-2 font-weight-medium"
                style="white-space: pre-wrap; word-break: break-word; font-size: 0.92rem; line-height: 1.45;"
                v-html="formattaInsWeekHtml(inputSettimane[sett].ins)"
              ></div>

              <!-- Icone Azioni Rapide (Editor Espanso se abilitato + Recupero) -->
              <div class="d-flex align-center gap-1.5 pr-0 flex-shrink-0" style="margin-top: 2px;">
                <!-- Icona Editor Espanso (Opzione 2 Coach) -->
                <v-btn
                  v-if="editorNoteEspansoGlobal"
                  icon="mdi-arrow-expand-all"
                  variant="text"
                  size="x-small"
                  color="orange-darken-3"
                  class="opacity-80 hover-opacity-100"
                  style="width: 20px; height: 20px;"
                  title="Apri Editor Note a Schermo Intero"
                  @click.stop="apriEditorNoteEspanso(sett)"
                ></v-btn>

                <!-- Append Icon Recupero / R? -->
                <div 
                  class="d-flex align-center gap-1"
                  style="cursor: pointer; transition: all 0.2s; opacity: 0.85;"
                  @click.stop="toggleRecuperoDettaglio(sett, !haRecupero(inputSettimane[sett].ins))"
                  @mouseover="$event.currentTarget.style.opacity = '1'"
                  @mouseleave="$event.currentTarget.style.opacity = '0.85'"
                >
                  <span 
                    class="font-weight-black uppercase"
                    :class="haRecupero(inputSettimane[sett].ins) ? 'text-orange-darken-3' : 'text-grey-darken-1'"
                    :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.48rem' : '0.55rem', letterSpacing: '0.05em', paddingTop: '1px' }"
                  >
                    {{ haRecupero(inputSettimane[sett].ins) ? 'Recupero' : 'R?' }}
                  </span>
                  <v-icon
                    :color="haRecupero(inputSettimane[sett].ins) ? 'orange-darken-3' : 'grey-darken-1'"
                    :class="{'animate-pulse': haRecupero(inputSettimane[sett].ins)}"
                    :size="layoutCorrente === 'super_compatto' ? 14 : 18"
                  >
                    {{ haRecupero(inputSettimane[sett].ins) ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}
                  </v-icon>
                </div>
              </div>
            </div>

            <!-- Textarea Editabile ad altissime prestazioni (in digitazione o se risalto disattivo o se vuoto) -->
            <div
              v-else
              class="custom-weight-input position-relative d-flex align-start justify-space-between transition-all"
              :class="[getGhostFieldClass(sett), layoutCorrente === 'super_compatto' ? 'custom-compact-textarea' : '']"
              :style="{
                marginTop: (margineTopInputWeekGlobal ?? 14) + 'px !important',
                marginBottom: (margineBottomInputWeekGlobal ?? 16) + 'px !important',
                minHeight: layoutCorrente === 'super_compatto' ? '36px' : '40px',
                padding: layoutCorrente === 'super_compatto' ? '6px 10px' : '8px 12px',
                borderRadius: layoutCorrente === 'super_compatto' ? '4px' : (layoutCorrente === 'compatto' ? '8px' : '12px')
              }"
            >
              <textarea
                :id="'input-peso-w' + sett"
                :value="localEditingRaw[sett] !== undefined ? localEditingRaw[sett] : (inputSettimane[sett]?.ins || '')"
                @input="e => onInputWeek(sett, e.target.value)"
                @focus="onFocusWeek(sett)"
                @blur="e => onBlurWeek(sett, e.target.value)"
                :placeholder="getGhostLiftSmart(sett)?.isRepExercise ? 'Ripetizioni eseguite (es. 12r o 3x12r)' : 'Carico o note (es. 45kg)'"
                class="native-week-textarea flex-grow-1 text-left pr-2 font-weight-black"
                rows="1"
                style="background: transparent; border: none; outline: none; resize: none; width: 100%; color: inherit; font-size: 0.92rem; line-height: 1.45; font-family: inherit; box-sizing: border-box; padding: 0; margin: 0; min-height: 24px; field-sizing: content;"
              ></textarea>

              <!-- Icone Azioni Rapide (Editor Espanso se abilitato + Recupero) -->
              <div class="d-flex align-center gap-1.5 pr-0 flex-shrink-0" style="margin-top: 2px;">
                <!-- Icona Editor Espanso (Opzione 2 Coach) -->
                <v-btn
                  v-if="editorNoteEspansoGlobal"
                  icon="mdi-arrow-expand-all"
                  variant="text"
                  size="x-small"
                  color="orange-darken-3"
                  class="opacity-80 hover-opacity-100"
                  style="width: 20px; height: 20px;"
                  title="Apri Editor Note a Schermo Intero"
                  @click.stop="apriEditorNoteEspanso(sett)"
                ></v-btn>

                <!-- Append Icon Recupero / R? -->
                <div 
                  class="d-flex align-center gap-1"
                  style="cursor: pointer; transition: all 0.2s; opacity: 0.85;"
                  @click.stop="toggleRecuperoDettaglio(sett, !haRecupero(inputSettimane[sett]?.ins || localEditingRaw[sett]))"
                  @mouseover="$event.currentTarget.style.opacity = '1'"
                  @mouseleave="$event.currentTarget.style.opacity = '0.85'"
                >
                  <span 
                    class="font-weight-black uppercase"
                    :class="haRecupero(inputSettimane[sett]?.ins || localEditingRaw[sett]) ? 'text-orange-darken-3' : 'text-grey-darken-1'"
                    :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.48rem' : '0.55rem', letterSpacing: '0.05em', paddingTop: '1px' }"
                  >
                    {{ haRecupero(inputSettimane[sett]?.ins || localEditingRaw[sett]) ? 'Recupero' : 'R?' }}
                  </span>
                  <v-icon
                    :color="haRecupero(inputSettimane[sett]?.ins || localEditingRaw[sett]) ? 'orange-darken-3' : 'grey-darken-1'"
                    :class="{'animate-pulse': haRecupero(inputSettimane[sett]?.ins || localEditingRaw[sett])}"
                    :size="layoutCorrente === 'super_compatto' ? 14 : 18"
                  >
                    {{ haRecupero(inputSettimane[sett]?.ins || localEditingRaw[sett]) ? 'mdi-bookmark' : 'mdi-bookmark-outline' }}
                  </v-icon>
                </div>
              </div>
            </div>

            <!-- Suggerimento Formattazione Reps (es. 3x12 -> 3x12r) -->
            <div
              v-if="(!ottimizzaDigitazione || activeEditingWeek !== sett) && getRepFormattingSuggestion(sett)"
              class="d-flex align-center mt-1.5 px-2.5 py-1.5 rounded-lg cursor-pointer animate-fade-in text-left"
              style="border: 1px solid rgba(245, 158, 11, 0.4) !important; background: rgba(245, 158, 11, 0.08) !important;"
              @click="applicaSuggerimentoFormattazioneReps(sett, getRepFormattingSuggestion(sett).suggested)"
            >
              <v-icon color="amber-darken-2" size="15" class="mr-2 flex-shrink-0">mdi-lightbulb-on</v-icon>
              <span class="text-caption font-weight-bold text-amber-lighten-2" style="font-size: 0.70rem; line-height: 1.3;">
                {{ getRepFormattingSuggestion(sett).message }} <strong class="text-white text-decoration-underline ml-1">Tocca per formattare</strong>
              </span>
            </div>
          </div>

          <!-- BANNER SMART STAGNATION GUARD & CHIP RAPIDI (Soluzione 1) -->
          <div 
            v-if="isStagnazioneSettimana(sett)" 
            class="my-2 pa-2.5 rounded-xl border text-left animate-fade-in"
            style="background: linear-gradient(135deg, rgba(168, 85, 247, 0.12) 0%, rgba(168, 85, 247, 0.03) 100%) !important; border: 1.5px solid rgba(168, 85, 247, 0.35) !important;"
          >
            <div class="d-flex align-center justify-space-between mb-1.5">
              <div class="d-flex align-center gap-1.5">
                <v-icon size="16" color="purple-lighten-2">mdi-alert-decagram</v-icon>
                <span class="font-weight-black text-purple-lighten-2 text-super-caption uppercase" style="letter-spacing: 0.04em; font-size: 0.60rem;">
                  Progressione Non Rilevata su kg/reps
                </span>
              </div>
              <v-chip color="purple-darken-3" size="x-small" density="compact" class="font-weight-black text-white" style="font-size: 0.5rem; height: 16px;">
                EDUCATIVO
              </v-chip>
            </div>
            <p class="text-super-caption text-slate-light mb-2" style="font-size: 0.65rem; line-height: 1.35; color: #cbd5e1 !important;">
              Stesso peso di W{{ sett - 1 }} senza ripetizioni in più. Hai migliorato uno di questi parametri qualitativi oggi?
            </p>
            <div class="d-flex flex-wrap gap-1">
              <v-chip
                v-for="chip in chipProgressioneQualitativa"
                :key="chip.id"
                size="x-small"
                :variant="chip.primary ? 'flat' : 'tonal'"
                :color="chip.primary ? 'amber-accent-3' : 'purple-lighten-3'"
                class="font-weight-black cursor-pointer"
                :class="{'text-black animate-pulse': chip.primary}"
                :style="{ fontSize: chip.primary ? '0.62rem' : '0.58rem', height: chip.primary ? '24px' : '22px' }"
                @click="applicaDriverProgressione(sett, chip.label)"
              >
                {{ chip.icon }} {{ chip.label }}
              </v-chip>
            </div>
          </div>

          <!-- BADGE PROGRESSIONE QUALITATIVA ACCREDITATA -->
          <div 
            v-else-if="haDriverQualitativoAccreditato(sett) && (inputSettimane[sett]?.ins)" 
            class="my-1.5 px-2.5 py-1 rounded-lg border d-flex align-center gap-1.5 bg-slate-900 text-left"
            style="border-color: rgba(168, 85, 247, 0.3) !important;"
          >
            <span style="font-size: 0.75rem;">🌟</span>
            <span class="text-super-caption text-purple-lighten-3 font-weight-black" style="font-size: 0.62rem;">
              Progressione Qualitativa Registrata!
            </span>
          </div>

          <!-- RESOCONTO AUDIT STALLO WEEK 6 - SGRIDATA BONARIA DEL COACH (Soluzione 3) -->
          <v-card
            v-if="sett === 6 && auditStalloW6.hasStall"
            class="mt-3 mb-2 pa-3 rounded-xl border text-left animate-fade-in"
            style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(168, 85, 247, 0.1) 100%) !important; border: 1.5px solid rgba(245, 158, 11, 0.4) !important;"
            elevation="0"
          >
            <div class="d-flex align-center gap-2 mb-2">
              <span style="font-size: 1.4rem; line-height: 1;">🛋️</span>
              <div>
                <div class="text-amber-lighten-1 font-weight-black text-caption uppercase" style="font-size: 0.68rem; letter-spacing: 0.05em;">
                 ZONA DI COMFORT RILEVATA!
                </div>
              </div>
            </div>
            <p class="text-super-caption text-white mb-2" style="font-size: 0.68rem; line-height: 1.4;">
              Hai usato <strong>{{ auditStalloW6.peso }} kg</strong> per più settimane, senza registrare variazioni di peso, reps, tempo sotto tensione o sensazioni.
            </p>
            <div class="pa-2 rounded-lg mb-2.5 bg-slate-950 border border-soft text-super-caption text-amber-lighten-2" style="font-size: 0.62rem; line-height: 1.35; border-color: rgba(245, 158, 11, 0.2) !important;">
              💡 <em>"Se i parametri restano invariati, l'’'esercizio non sta progredendo."</em>
            </div>
            <v-btn
              block
              color="amber-darken-3"
              size="small"
              class="font-weight-black text-none rounded-lg text-white"
              style="font-size: 0.70rem;"
              @click="apriAiutoCaricoDettagliato(6)"
            >
              🚀 Scopri come sbloccarlo nella prossima scheda
            </v-btn>
          </v-card>

          <!-- Card Premium Feedback e Miglior Carico per Week 6 -->
          <div 
            v-if="sett === 6 && isEsercizioEligibileW6(workout)" 
            class="w6-feedback-premium-box pt-3 pb-2.5 px-3 rounded-2xl border"
            :class="layoutCorrente === 'super_compatto' ? 'pt-2 pb-2 px-2' : ''"
            :style="{
              marginTop: (margineTopW6FeedbackGlobal ?? 16) + 'px !important'
            }"
          >
            <!-- Header Box W6 -->
            <div class="d-flex align-center justify-space-between mb-2">
              <div class="d-flex align-center gap-1.5">
                <v-icon color="amber-lighten-2" size="17">mdi-trophy-award</v-icon>
                <span class="text-caption font-weight-black text-amber-lighten-2 uppercase tracking-wide" style="font-size: 0.72rem;">
                  Feedback Week 6
                </span>
              </div>
              <span class="text-super-caption font-weight-bold text-slate" style="font-size: 0.58rem; letter-spacing: 0.05em;">
                RIFERIMENTO PROX MESO
              </span>
            </div>

            <!-- Riga 1: Miglior Carico W6 (Stepper Premium Vetro & Glow) -->
            <div class="d-flex align-center justify-space-between w-100 mb-2.5 pa-1.5 rounded-xl stepper-row-glass border-soft">
              <div class="d-flex flex-column text-left pl-1">
                <span class="font-weight-black text-slate-dark text-uppercase tracking-wider" style="font-size: 0.68rem; line-height: 1.1;">
                  Max Raggiunto
                </span>
                <span class="text-super-caption text-slate" style="font-size: 0.54rem;">
                  Carico top chiuso a target
                </span>
              </div>

              <div class="d-flex align-center w6-stepper-container rounded-xl px-1 py-0.5 border">
                <v-btn
                  icon
                  size="28px"
                  variant="flat"
                  color="transparent"
                  class="stepper-btn text-orange-lighten-2"
                  @click="decrementaKgUnico"
                  id="btn-decrementa-kg-unico"
                >
                  <v-icon size="16">mdi-minus</v-icon>
                </v-btn>

                <div class="d-flex align-center justify-center px-1">
                  <input
                    v-model="numIns6Val"
                    type="text"
                    class="text-center font-weight-black text-slate-dark w6-stepper-input"
                    @input="numIns6ModificatoManualmente = true"
                    @blur="salvaKgUnico"
                    id="input-kg-unico-w6"
                    placeholder="--"
                  />
                  <span class="text-super-caption font-weight-black text-orange-lighten-3 ml-0.5" style="font-size: 0.60rem;">KG</span>
                </div>

                <v-btn
                  icon
                  size="28px"
                  variant="flat"
                  color="transparent"
                  class="stepper-btn text-orange-lighten-2"
                  @click="incrementaKgUnico"
                  id="btn-incrementa-kg-unico"
                >
                  <v-icon size="16">mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>

            <!-- Riga 2: Sforzo Percepito (Pill Segments Responsive) -->
            <div class="d-flex flex-column gap-1.5 w-100 text-left">
              <div class="d-flex align-center justify-space-between">
                <span class="font-weight-black text-slate-dark text-uppercase tracking-wider" style="font-size: 0.65rem;">
                  ⚡ Sforzo Percepito
                </span>
                <span v-if="numFaticaw6Val" class="text-super-caption font-weight-black" :style="getColoreFaticaStyle(numFaticaw6Val)">
                  {{ numFaticaw6Val }}
                </span>
              </div>

              <div class="w6-fatica-grid">
                <button
                  type="button"
                  class="w6-fatica-pill"
                  :class="{ 'active-media': numFaticaw6Val === 'Media' }"
                  @click="salvaFatica('Media')"
                  id="btn-fatica-media"
                >
                  <span class="pill-icon">🙂</span>
                  <span class="pill-text">Media</span>
                </button>

                <button
                  type="button"
                  class="w6-fatica-pill"
                  :class="{ 'active-pesante': numFaticaw6Val === 'Pesante' }"
                  @click="salvaFatica('Pesante')"
                  id="btn-fatica-pesante"
                >
                  <span class="pill-icon">🔥</span>
                  <span class="pill-text">Pesante</span>
                </button>

                <button
                  type="button"
                  class="w6-fatica-pill"
                  :class="{ 'active-devastante': numFaticaw6Val === 'Devastante' }"
                  @click="salvaFatica('Devastante')"
                  id="btn-fatica-devastante"
                >
                  <span class="pill-icon">💀</span>
                  <span class="pill-text">Devastante</span>
                </button>
              </div>
            </div>
          </div>
            <!-- Sezione Recupero (Fine Giro) per Superset inside orange active card -->
            <div 
              v-if="sett === settimanaAttiva && infoSuperset.inSuperset && infoSuperset.isLast && workout.des_rec_report" 
              class="border-top-soft d-flex align-center justify-space-between flex-wrap gap-1.5 animate-fade-in"
              :class="layoutCorrente === 'super_compatto' ? 'mt-2.5 pt-2' : (layoutCorrente === 'compatto' ? 'mt-3.5 pt-3' : 'mt-4 pt-3.5')"
            >
              <span 
                class="text-super-caption text-orange-lighten-3 font-weight-medium"
                :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.62rem' }"
              >
                🔄 Fine Giro! Recupera prima di ricominciare.
              </span>
              <v-chip
                color="orange-darken-3"
                variant="flat"
                size="x-small"
                class="font-weight-black text-white px-2.5 py-1"
                style="font-size: 0.62rem; height: auto; min-height: 22px; cursor: pointer; line-height: 1.2; text-align: center;"
                @click="avviaTimerRecupero(workout.des_rec_report, workout.des_esercizio)"
              >
                ⏱️ AVVIA RECUPERO: {{ workout.des_rec_report }}
              </v-chip>
            </div>

            <!-- Option B (dentro la week attiva): se renderSupersetPosizione === 'dentro_week' e sett === settimanaAttiva -->
            <div v-if="infoSuperset.inSuperset && renderSupersetPosizione === 'dentro_week' && sett === settimanaAttiva" class="mt-4 border-top-soft pt-3 animate-fade-in">
              <!-- Indicatore direzionale superset senza recupero -->
              <div v-if="!infoSuperset.isLast" class="d-flex align-center justify-center gap-1.5 animate-pulse mb-3">
                <v-icon color="deep-purple-accent-4" size="18">mdi-arrow-down-bold</v-icon>
                <span class="text-super-caption text-purple-lighten-2 font-weight-black uppercase" style="font-size: 0.52rem; letter-spacing: 0.05em; padding-top: 2px;">
                  SUPERSET {{ infoSuperset.letter }}: PASSA AL SUCCESSIVO ({{ infoSuperset.currentIndex + 1 }} di {{ infoSuperset.total }}) SENZA RECUPERO!
                </span>
                <v-icon color="deep-purple-accent-4" size="18">mdi-arrow-down-bold</v-icon>
              </div>
              <div 
                class="text-left position-relative"
                :class="layoutCorrente === 'super_compatto' ? 'pa-2' : (layoutCorrente === 'compatto' ? 'pa-2.5' : 'pa-3')"
                :style="{
                  background: 'rgba(124, 58, 237, 0.05) !important',
                  border: '1px solid rgba(124, 58, 237, 0.2) !important',
                  borderLeft: '4px solid #7c3aed !important',
                  borderRadius: layoutCorrente === 'super_compatto' ? '4px !important' : (layoutCorrente === 'compatto' ? '8px !important' : '10px !important'),
                  boxShadow: '0 4px 15px rgba(124, 58, 237, 0.05)'
                }"
              >
                <!-- Intestazione con badge e modalità (solo per il prossimo giro) -->
                <div v-if="infoSuperset.isLast" class="d-flex align-center mb-2">
                  <v-icon color="purple-lighten-2" size="14" class="mr-1.5">mdi-link-variant</v-icon>
                  <span 
                    class="text-super-caption font-weight-black uppercase superset-header-title"
                    :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.58rem', letterSpacing: '0.05em' }"
                  >
                    👉 Prossimo Giro: Ricomincia da (1 di {{ infoSuperset.total }})
                  </span>
                </div>
                
                <!-- Card dell'Esercizio Collegato -->
                <div
                  v-if="infoSuperset.nextExercise"
                  class="d-flex align-center py-2 px-3 superset-linked-item clickable-item"
                  :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : (layoutCorrente === 'compatto' ? 'rounded-md' : 'rounded-lg')"
                  @click="vaiAdEsercizioCollegato(infoSuperset.nextExercise.id)"
                  style="cursor: pointer;"
                >
                  <div class="overflow-hidden mr-4 bg-black border-soft" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : 'rounded'" :style="{ width: layoutCorrente === 'super_compatto' ? '28px' : '36px', height: layoutCorrente === 'super_compatto' ? '28px' : '36px', flexShrink: 0 }">
                    <v-img :src="getGifUrl(infoSuperset.nextExercise.UrlNormal)" :width="layoutCorrente === 'super_compatto' ? 28 : 36" :height="layoutCorrente === 'super_compatto' ? 28 : 36" cover></v-img>
                  </div>
                  
                  <div class="flex-grow-1 text-truncate">
                    <div class="text-caption font-weight-black text-truncate superset-ex-name" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.7rem !important' : '0.78rem !important' }">
                      {{ infoSuperset.nextExercise.des_esercizio }}
                      <v-icon v-if="infoSuperset.nextExercise.flg_video === 'true' || infoSuperset.nextExercise.flg_video === true" color="orange" size="12" class="ml-1" title="Video richiesto">mdi-video</v-icon>
                    </div>
                    <div class="text-super-caption font-weight-bold superset-ex-sub" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.58rem' }">
                      {{ formatPrescrizioneSuperset(infoSuperset.nextExercise) }}
                    </div>
                  </div>
                  
                  <!-- Bottone VAI chiaro -->
                  <v-btn 
                    variant="flat" 
                    color="deep-purple-accent-4" 
                    size="x-small" 
                    class="font-weight-black text-none ml-2 px-2.5" 
                    style="height: 24px; font-size: 0.65rem; border-radius: 4px; letter-spacing: 0.05em;"
                  >
                    VAI ➔
                  </v-btn>
                </div>
              </div>
            </div>
          </v-card>

          <!-- Option A (sotto la week attiva): se renderSupersetPosizione === 'sotto_week' e sett === settimanaAttiva -->
          <div v-if="infoSuperset.inSuperset && renderSupersetPosizione === 'sotto_week' && sett === settimanaAttiva" :class="layoutCorrente === 'super_compatto' ? 'mb-2.5 mt-0.5' : (layoutCorrente === 'compatto' ? 'mb-4 mt-1' : 'mb-6 mt-1')">
            <!-- Indicatore direzionale superset senza recupero -->
            <div v-if="!infoSuperset.isLast" class="d-flex align-center justify-center gap-1.5 animate-pulse mb-3">
              <v-icon color="deep-purple-accent-4" size="18">mdi-arrow-down-bold</v-icon>
              <span class="text-super-caption text-purple-lighten-2 font-weight-black uppercase" style="font-size: 0.52rem; letter-spacing: 0.05em; padding-top: 2px;">
                SUPERSET {{ infoSuperset.letter }}: PASSA AL SUCCESSIVO ({{ infoSuperset.currentIndex + 1 }} di {{ infoSuperset.total }}) SENZA RECUPERO!
              </span>
              <v-icon color="deep-purple-accent-4" size="18">mdi-arrow-down-bold</v-icon>
            </div>
            <div 
              class="text-left position-relative animate-fade-in"
              :class="layoutCorrente === 'super_compatto' ? 'pa-2' : (layoutCorrente === 'compatto' ? 'pa-2.5' : 'pa-3')"
              :style="{
                background: 'rgba(124, 58, 237, 0.05) !important',
                border: '1px solid rgba(124, 58, 237, 0.2) !important',
                borderLeft: '4px solid #7c3aed !important',
                borderRadius: layoutCorrente === 'super_compatto' ? '4px !important' : (layoutCorrente === 'compatto' ? '8px !important' : '10px !important'),
                boxShadow: '0 4px 15px rgba(124, 58, 237, 0.05)'
              }"
            >
              <!-- Intestazione con badge e modalità (solo per il prossimo giro) -->
              <div v-if="infoSuperset.isLast" class="d-flex align-center mb-2">
                <v-icon color="purple-lighten-2" size="14" class="mr-1.5">mdi-link-variant</v-icon>
                <span 
                  class="text-super-caption font-weight-black uppercase superset-header-title"
                  :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.58rem', letterSpacing: '0.05em' }"
                >
                  👉 Prossimo Giro: Ricomincia da (1 di {{ infoSuperset.total }})
                </span>
              </div>
              
              <!-- Card dell'Esercizio Collegato -->
              <div
                v-if="infoSuperset.nextExercise"
                class="d-flex align-center py-2 px-3 superset-linked-item clickable-item"
                :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : (layoutCorrente === 'compatto' ? 'rounded-md' : 'rounded-lg')"
                @click="vaiAdEsercizioCollegato(infoSuperset.nextExercise.id)"
                style="cursor: pointer;"
              >
                <div class="overflow-hidden mr-4 bg-black border-soft" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : 'rounded'" :style="{ width: layoutCorrente === 'super_compatto' ? '28px' : '36px', height: layoutCorrente === 'super_compatto' ? '28px' : '36px', flexShrink: 0 }">
                  <v-img :src="getGifUrl(infoSuperset.nextExercise.UrlNormal)" :width="layoutCorrente === 'super_compatto' ? 28 : 36" :height="layoutCorrente === 'super_compatto' ? 28 : 36" cover></v-img>
                </div>
                
                <div class="flex-grow-1 text-truncate">
                  <div class="text-caption font-weight-black text-truncate superset-ex-name" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.7rem !important' : '0.78rem !important' }">
                    {{ infoSuperset.nextExercise.des_esercizio }}
                    <v-icon v-if="infoSuperset.nextExercise.flg_video === 'true' || infoSuperset.nextExercise.flg_video === true" color="orange" size="12" class="ml-1" title="Video richiesto">mdi-video</v-icon>
                  </div>
                  <div class="text-super-caption font-weight-bold superset-ex-sub" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.58rem' }">
                    {{ formatPrescrizioneSuperset(infoSuperset.nextExercise) }}
                  </div>
                </div>
                
                <!-- Bottone VAI chiaro -->
                <v-btn 
                  variant="flat" 
                  color="deep-purple-accent-4" 
                  size="x-small" 
                  class="font-weight-black text-none ml-2 px-2.5" 
                  style="height: 24px; font-size: 0.65rem; border-radius: 4px; letter-spacing: 0.05em;"
                >
                  VAI ➔
                </v-btn>
              </div>
            </div>
          </div>
        </template>

        <!-- Bottone Premium per Espandere/Nascondere le altre settimane in modalità Dinamica -->
        <div v-if="modalitaSettimane === 'dinamica'" class="text-center" :class="layoutCorrente === 'super_compatto' ? 'mt-1 mb-2' : 'mt-2 mb-4'">
          <v-btn
            variant="text"
            color="orange-darken-3"
            class="font-weight-black text-none"
            :size="layoutCorrente === 'super_compatto' ? 'x-small' : (layoutCorrente === 'compatto' ? 'small' : 'default')"
            :density="layoutCorrente === 'super_compatto' ? 'compact' : (layoutCorrente === 'compatto' ? 'compact' : 'comfortable')"
            rounded="xl"
            @click="toggleAltreDinamiche"
            id="btn-toggle-altre-dinamica"
            :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.70rem' : (layoutCorrente === 'compatto' ? '0.75rem' : '0.85rem') }"
          >
            <v-icon class="mr-1" :size="layoutCorrente === 'super_compatto' ? 13 : (layoutCorrente === 'compatto' ? 15 : 18)">
              {{ mostraAltreDinamica ? 'mdi-chevron-double-up' : 'mdi-chevron-double-down' }}
            </v-icon>
            {{ mostraAltreDinamica ? 'Nascondi le altre settimane' : 'Mostra le altre settimane (5)' }}
          </v-btn>
        </div>
      </div>

      <!-- Opzioni di Visualizzazione delle Settimane (Spostato a fondo lista per non disturbare) -->
      <v-expansion-panels 
        class="card-glass border-soft overflow-hidden shadow-sm animate-all" 
        :class="layoutCorrente === 'super_compatto' ? 'mb-3 rounded-sm' : (layoutCorrente === 'compatto' ? 'mb-4.5 rounded-lg' : 'mb-6 rounded-2xl')"
        style="background: var(--card-bg-soft);"
      >
        <v-expansion-panel bg-color="transparent" class="elevation-0">
          <v-expansion-panel-title 
            class="font-weight-black text-slate-dark d-flex align-center"
            :class="layoutCorrente === 'super_compatto' ? 'py-1.5 px-3' : (layoutCorrente === 'compatto' ? 'py-2 px-3.5' : 'py-2.5 px-4')"
          >
            <v-icon color="orange" class="mr-2" :size="layoutCorrente === 'super_compatto' ? 13 : (layoutCorrente === 'compatto' ? 15 : 18)">mdi-cog-outline</v-icon>
            <span :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem' : (layoutCorrente === 'compatto' ? '0.78rem' : '0.85rem') }">Opzioni Visualizzazione Settimane</span>
          </v-expansion-panel-title>
          <v-expansion-panel-text :class="layoutCorrente === 'super_compatto' ? 'px-1 pb-1.5' : (layoutCorrente === 'compatto' ? 'px-1.5 pb-2' : 'px-2 pb-3')">
            <div class="d-flex flex-column gap-2 text-left pt-1">
              <span class="text-super-caption text-muted font-weight-bold uppercase mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.50rem' : (layoutCorrente === 'compatto' ? '0.55rem' : '0.6rem') }">Modalità elenco settimane:</span>
              <v-btn-toggle
                v-model="modalitaSettimane"
                mandatory
                selected-class="bg-orange-darken-3 text-white"
                :density="layoutCorrente === 'super_compatto' ? 'compact' : (layoutCorrente === 'compatto' ? 'compact' : 'comfortable')"
                :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'xl')"
                class="w-100 card-glass border"
                :style="{ height: layoutCorrente === 'super_compatto' ? '30px' : (layoutCorrente === 'compatto' ? '34px' : '38px') }"
              >
                <v-btn value="dinamica" class="font-weight-bold flex-grow-1" id="btn-toggle-dinamica" style="min-width: 50%; height: 100%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.68rem' : (layoutCorrente === 'compatto' ? '0.74rem' : '0.80rem') }">
                  <v-icon :size="layoutCorrente === 'super_compatto' ? 11 : (layoutCorrente === 'compatto' ? 13 : 16)" class="mr-1">mdi-target</v-icon> Dinamica
                </v-btn>
                <v-btn value="fissa" class="font-weight-bold flex-grow-1" id="btn-toggle-fissa" style="min-width: 50%; height: 100%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.68rem' : (layoutCorrente === 'compatto' ? '0.74rem' : '0.80rem') }">
                  <v-icon :size="layoutCorrente === 'super_compatto' ? 11 : (layoutCorrente === 'compatto' ? 13 : 16)" class="mr-1">mdi-calendar-month</v-icon> Fissa
                </v-btn>
              </v-btn-toggle>

              <!-- Posizionamento Superserie (se presente nell'esercizio) -->
              <template v-if="infoSuperset.inSuperset">
                <span class="text-super-caption text-muted font-weight-bold uppercase mb-1 mt-2" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.50rem' : (layoutCorrente === 'compatto' ? '0.55rem' : '0.6rem') }">Posizione Box Superserie:</span>
                <v-btn-toggle
                  v-model="posizionamentoSuperset"
                  mandatory
                  selected-class="bg-deep-purple-accent-4 text-white"
                  :density="layoutCorrente === 'super_compatto' ? 'compact' : (layoutCorrente === 'compatto' ? 'compact' : 'comfortable')"
                  :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'xl')"
                  class="w-100 card-glass border"
                  :style="{ height: layoutCorrente === 'super_compatto' ? '30px' : (layoutCorrente === 'compatto' ? '34px' : '38px') }"
                >
                  <v-btn value="auto" class="font-weight-bold flex-grow-1" id="btn-toggle-auto" style="min-width: 33%; height: 100%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : (layoutCorrente === 'compatto' ? '0.70rem' : '0.76rem') }">
                    <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : (layoutCorrente === 'compatto' ? 12 : 14)" class="mr-1">mdi-auto-fix</v-icon> Auto
                  </v-btn>
                  <v-btn value="sotto_week" class="font-weight-bold flex-grow-1" id="btn-toggle-sotto-week" style="min-width: 33%; height: 100%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : (layoutCorrente === 'compatto' ? '0.70rem' : '0.76rem') }">
                    <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : (layoutCorrente === 'compatto' ? 12 : 14)" class="mr-1">mdi-arrow-down-bold-box-outline</v-icon> Sotto Week
                  </v-btn>
                  <v-btn value="dentro_week" class="font-weight-bold flex-grow-1" id="btn-toggle-dentro-week" style="min-width: 33%; height: 100%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : (layoutCorrente === 'compatto' ? '0.70rem' : '0.76rem') }">
                    <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : (layoutCorrente === 'compatto' ? 12 : 14)" class="mr-1">mdi-arrow-collapse-all</v-icon> Dentro Week
                  </v-btn>
                </v-btn-toggle>
              </template>
              <p class="text-super-caption text-muted mt-2 leading-snug" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : (layoutCorrente === 'compatto' ? '0.63rem' : '0.68rem') }">
                * <strong>Dinamica</strong>: Mette in evidenza la settimana attiva ordinando le altre in sequenza.<br>
                * <strong>Fissa</strong>: Mostra la progressione lineare classica dalla settimana 1 alla 6.<br>
                <template v-if="infoSuperset.inSuperset">
                  * <strong>Auto</strong>: Il box si posiziona dentro se non c'è recupero, o sotto se c'è recupero.<br>
                  * <strong>Sotto Week</strong>: Il box si posiziona sempre subito all'esterno sotto la settimana attiva.<br>
                  * <strong>Dentro Week</strong>: Il box si inserisce sempre direttamente dentro la settimana attiva.
                </template>
              </p>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- 5. Dettagli Tecnici Esercizio -->
      <v-card 
        :class="[
          layoutCorrente === 'super_compatto' ? 'pa-2.5 rounded-sm mb-3' : (layoutCorrente === 'compatto' ? 'pa-3 rounded-lg mb-4.5' : 'pa-4 rounded-2xl mb-6'),
          'premium-card'
        ]" 
        elevation="2"
      >
        <div class="text-left">
          <div class="d-flex align-center justify-space-between mb-1.5">
            <span class="text-caption text-muted font-weight-bold uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem', letterSpacing: '0.05em' }">Dettagli Tecnici Esercizio:</span>
            <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="orange-darken-3">mdi-cogs</v-icon>
          </div>
          
<div class="text-caption font-weight-medium text-slate-light mt-2" style="line-height: 1.6;">
  <div>
    <span class="font-weight-black text-orange-lighten-2">Wo n.{{ workout.num_scheda }}</span>
    <span v-if="dataMesociclo"> del {{ dataMesociclo }}</span>
    <br>

    Giorno 
    <span class="font-weight-black text-orange-lighten-2">
      {{ workout.des_giorno }}{{ workout.num_riga_giorno }}
    </span>

    <template v-if="workout.alf_superserie">
      <span class="mx-1"></span>
      <span class="font-weight-black text-amber-lighten-2">
        Superserie {{ workout.alf_superserie }}
      </span>

      <br>

      <span v-if="eserciziSupersetCollegati.length > 0" class="text-muted text-super-caption">
        (in superserie con {{ eserciziSupersetCollegati.map(e => e.des_esercizio).join(', ') }})
      </span>
    </template>

    <br>

    Muscolo target: 
    <span class="font-weight-black" :class="currentTheme === 'light' ? 'text-slate-dark' : 'text-white'">
      {{ workout.des_settore || 'Generico' }}
    </span>
  </div>
</div>
        </div>
      </v-card>

      <!-- Card Note e Commenti (Campi Modificabili) -->
      <v-card 
        :class="[
          layoutCorrente === 'super_compatto' ? 'pa-2.5 rounded-sm mb-3' : (layoutCorrente === 'compatto' ? 'pa-3 rounded-lg mb-4.5' : 'pa-4 rounded-2xl mb-6'),
          'premium-card'
        ]" 
        elevation="2"
      >
        <div class="text-left d-flex flex-column" :class="layoutCorrente === 'super_compatto' ? 'gap-2.5' : 'gap-4'">
          <!-- Note Esercizio -->
          <div>
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption text-muted font-weight-bold uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem', letterSpacing: '0.05em' }">Note esercizio:</span>
              <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="orange-darken-3">mdi-note-text-outline</v-icon>
            </div>
            <v-textarea
              v-model="noteEsercizio"
              variant="outlined"
              density="compact"
              hide-details
              :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'lg')"
              rows="2"
              color="orange-darken-3"
              class="custom-textarea-input"
              :class="layoutCorrente === 'super_compatto' ? 'custom-compact-textarea' : ''"
              @blur="salvaDatoGenerale('ins_esercizio', noteEsercizio)"
              id="input-detail-note-esercizio"
            ></v-textarea>
          </div>

          <!-- Commenti Atleta -->
          <div>
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption text-muted font-weight-bold uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem', letterSpacing: '0.05em' }">Commenti personali:</span>
              <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="orange-darken-3">mdi-comment-text-outline</v-icon>
            </div>
            <v-textarea
              v-model="commentiAtleta"
              variant="outlined"
              density="compact"
              hide-details
              :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'lg')"
              rows="3"
              color="orange-darken-3"
              class="custom-textarea-input"
              :class="layoutCorrente === 'super_compatto' ? 'custom-compact-textarea' : ''"
              @blur="salvaDatoGenerale('des_commenti', commentiAtleta)"
              id="input-detail-commenti"
            ></v-textarea>
          </div>
        </div>
      </v-card>

      <!-- Card Feedback Feeling Esercizio (ind_reps_start) -->
      <v-card 
        :class="[
          layoutCorrente === 'super_compatto' ? 'pa-2.5 rounded-sm mb-3' : (layoutCorrente === 'compatto' ? 'pa-3 rounded-lg mb-4.5' : 'pa-4 rounded-2xl mb-6'),
          'premium-card'
        ]" 
        elevation="2"
      >
        <div class="text-left">
          <div class="d-flex align-center justify-space-between mb-2">
            <span class="text-caption font-weight-black text-slate-dark uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem', letterSpacing: '0.05em' }">
              Dai un voto da 1 a 5 sul feeling dell'esercizio
            </span>
            <v-icon :size="layoutCorrente === 'super_compatto' ? 14 : 16" color="orange">mdi-emoticon-happy-outline</v-icon>
          </div>
          
          <div class="d-flex align-center justify-space-between mt-3 px-1" :class="layoutCorrente === 'super_compatto' ? 'gap-1' : 'gap-2'">
            <v-btn
              v-for="voto in [1, 2, 3, 4, 5]"
              :key="voto"
              variant="flat"
              class="font-weight-black text-none flex-grow-1 btn-feeling-item"
              :class="[
                layoutCorrente === 'super_compatto' ? 'rounded-sm' : (layoutCorrente === 'compatto' ? 'rounded-md' : 'rounded-lg'),
                'btn-feeling-' + voto,
                { 
                  'btn-feeling-selected': parseInt(indRepsStartVal) === voto,
                  ['btn-feeling-selected-' + voto]: parseInt(indRepsStartVal) === voto
                }
              ]"
              :size="layoutCorrente === 'super_compatto' ? 'small' : 'default'"
              :style="{
                minWidth: layoutCorrente === 'super_compatto' ? '35px' : '45px', 
                height: layoutCorrente === 'super_compatto' ? '32px' : '40px', 
                fontSize: layoutCorrente === 'super_compatto' ? '0.74rem' : '0.88rem',
                padding: '0 4px'
              }"
              @click="salvaVotoFeeling(voto)"
              :id="'btn-feeling-' + voto"
            >
              <span v-if="voto === 1">😡 1</span>
              <span v-else-if="voto === 2">😕 2</span>
              <span v-else-if="voto === 3">😐 3</span>
              <span v-else-if="voto === 4">🙂 4</span>
              <span v-else-if="voto === 5">🤩 5</span>
            </v-btn>
          </div>
        </div>
      </v-card>

      <!-- Stato Esercizio Mai Fatto -->
      <v-card 
        v-if="workout && (workout.flg_ex_mai_fatto === 'false' || workout.flg_ex_mai_fatto === false) && String(workout.num_scheda) !== '1'"
        class="premium-card card-glass text-center border-soft"
        :class="[
          layoutCorrente === 'super_compatto' ? 'pa-2.5 rounded-sm mb-3' : (layoutCorrente === 'compatto' ? 'pa-3 rounded-lg mb-4.5' : 'pa-4 rounded-2xl mb-6')
        ]"
        elevation="1"
        style="border: 1px solid rgba(255, 255, 255, 0.08);"
      >
        <div class="text-super-caption text-muted font-weight-black uppercase mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem', letterSpacing: '0.05em' }">
          Stato Esercizio
        </div>
        <div 
          class="font-weight-bold text-slate-light"
          :class="layoutCorrente === 'super_compatto' ? 'text-super-caption' : 'text-body-2'"
        >
          🌱 Questo esercizio non è mai stato eseguito in precedenza.
        </div>
      </v-card>
      
      <!-- Analisi Ripetizioni (Continuità o Storico) - CLICCABILE -->
      <v-card 
        v-else-if="previousWorkout && analisiRipetizioniCiclo"
        class="premium-card card-glass text-left border-soft clickable-timer-chip"
        :class="[
          layoutCorrente === 'super_compatto' ? 'pa-2.5 rounded-sm mb-3' : (layoutCorrente === 'compatto' ? 'pa-3 rounded-lg mb-4.5' : 'pa-4 rounded-2xl mb-6')
        ]"
        elevation="2"
        style="border: 1px solid rgba(255, 255, 255, 0.08);"
        @click="vibraTattile(12); dialogProgressioniPrecedente = true"
      >
        <div class="d-flex align-center justify-space-between mb-2">
          <span class="text-super-caption text-muted font-weight-black uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem', letterSpacing: '0.05em' }">
            {{ analisiRipetizioniCiclo.isContinuitato ? 'Continuità Mesociclo' : 'Richiamo Esercizio Storico' }}
          </span>
          <v-icon color="orange-lighten-2" :size="layoutCorrente === 'super_compatto' ? 14 : 16">mdi-open-in-new</v-icon>
        </div>
        
        <div 
          class="font-weight-medium text-slate-dark" 
          :class="layoutCorrente === 'super_compatto' ? 'text-super-caption' : 'text-body-2'"
          style="line-height: 1.45;"
        >
          <template v-if="analisiRipetizioniCiclo.isContinuitato">
            Questo esercizio era presente nella <strong>scheda precedente</strong> (Wo <span class="text-slate-dark font-weight-black">{{ previousWorkout.num_scheda }} {{ previousWorkout.des_giorno }}{{ previousWorkout.num_riga_giorno }}</span>).<br>
          </template>
          <template v-else>
            Eseguito l'ultima volta <strong class="text-orange-lighten-2">{{ tempoTrascorso(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }}</strong> (il <span class="text-slate-dark">{{ formattaDataStorico(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }}</span>) su Wo <span class="text-slate-dark font-weight-black">{{ previousWorkout.num_scheda }} {{ previousWorkout.des_giorno }}{{ previousWorkout.num_riga_giorno }}</span>.<br>
          </template>
          
          Prosegue il ciclo con <strong :class="'text-' + analisiRipetizioniCiclo.color">{{ analisiRipetizioniCiclo.testo }}</strong>
          <v-icon :color="analisiRipetizioniCiclo.color" :size="layoutCorrente === 'super_compatto' ? 15 : 18" class="ml-1 mb-1">{{ analisiRipetizioniCiclo.icon }}</v-icon>
        </div>
        
        <div 
          class="text-super-caption text-muted mt-3 pt-2 border-top-soft d-flex align-center"
          :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '' }"
        >
          <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="grey" class="mr-1">mdi-gesture-tap</v-icon>
          <span v-if="analisiRipetizioniCiclo.isContinuitato">Ultima esecuzione il {{ formattaDataStorico(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }} <span class="text-slate-dark ml-1 font-weight-black">({{ tempoTrascorso(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }})</span> - Clicca per i dettagli</span>
          <span v-else>Clicca per vedere pesi e note di questa esecuzione</span>
        </div>
      </v-card>

      <!-- Fallback Sicurezza (Se JSON non ha ancora scaricato l'oggetto previousWorkout) -->
      <v-card 
        v-else-if="workout && (workout.dat_scheda_ult_ex || workout.timestamp)"
        class="premium-card card-glass text-center border-soft"
        :class="[
          layoutCorrente === 'super_compatto' ? 'pa-2.5 rounded-sm mb-3' : (layoutCorrente === 'compatto' ? 'pa-3 rounded-lg mb-4.5' : 'pa-4 rounded-2xl mb-6')
        ]"
        elevation="1"
        style="border: 1px solid rgba(255, 255, 255, 0.08);"
      >
        <div class="text-super-caption text-muted font-weight-black uppercase mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem', letterSpacing: '0.05em' }">
          Tempo Trascorso dall'Ultima Esecuzione
        </div>
        <div 
          class="font-weight-bold text-slate-dark" 
          :class="layoutCorrente === 'super_compatto' ? 'text-super-caption' : 'text-body-2'"
          style="line-height: 1.4;"
        >
          Eseguito l'ultima volta su Wo <span class="text-slate-dark font-weight-black">{{ workout.num_scheda_ult_ex || '?' }} {{ workout.num_coord_ex_wo_prec || '' }}</span> il: <span class="text-orange-lighten-2">{{ formattaDataStorico(workout.dat_scheda_ult_ex || workout.timestamp) }}</span> 
          <span class="text-slate-dark ml-1 font-weight-black">({{ tempoTrascorso(workout.dat_scheda_ult_ex || workout.timestamp) }})</span>
        </div>
      </v-card>

    </div>
    </div>
    </transition>

    <!-- Snackbar di successo salvataggio -->
    <v-snackbar
      v-model="snackbarSalvataggio"
      color="success"
      timeout="1200"
      rounded="xl"
      elevation="3"
      location="bottom"
      :class="{'tiny-save-snackbar': !snackbarMessaggio}"
      style="margin: 0 auto;"
      id="detail-snackbar"
    >
      <div class="d-flex align-center justify-center font-weight-black py-0 px-0.5" style="font-size: 0.65rem; gap: 4px;">
        <v-icon size="11">mdi-check-circle</v-icon>
        <span>{{ snackbarMessaggio || 'Salvato' }}</span>
      </div>
    </v-snackbar>

    <!-- Snackbar Info Ghost Long-Press / Progression -->
    <v-snackbar
      v-model="snackbarGhostShow"
      :color="snackbarGhostColor"
      timeout="3500"
      rounded="xl"
      elevation="4"
      location="top"
      style="margin: 12px auto 0;"
    >
      <div class="d-flex align-center justify-center font-weight-black py-0.5 px-1" style="font-size: 0.72rem; gap: 6px;">
        <v-icon size="14">mdi-trending-up</v-icon>
        <span>{{ snackbarGhostMessaggio }}</span>
      </div>
    </v-snackbar>

    <!-- Dialog 1: Progressione Scheda Precedente (PRECEDENTE) -->
    <v-dialog v-model="dialogProgressioniPrecedente" max-width="650" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="px-3 py-2 border-bottom d-flex align-center justify-space-between bg-slate-900" style="min-height: 40px;">
          <div class="d-flex align-center gap-2">
            <v-icon color="orange-darken-3" size="18">mdi-history</v-icon>
            <span class="font-weight-black text-slate-dark" style="font-size: 0.82rem !important; letter-spacing: 0.02em;">Progressione Scheda Precedente</span>
          </div>
          <!-- Pulsante X più piccolo -->
          <v-btn icon variant="text" width="24" height="24" color="grey" @click="dialogProgressioniPrecedente = false">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <!-- Info Esercizio Precedente (Fisso in primo piano nello scroll) -->
        <div v-if="previousWorkout" class="px-3 py-2 border-bottom bg-slate-900 text-left" style="line-height: 1.1; flex-shrink: 0;">
          <h4 class="font-weight-black text-slate-dark mt-0" style="font-size: 0.82rem !important; margin-bottom: 2px;">{{ previousWorkout.des_esercizio }}</h4>
          <div class="text-orange-lighten-2 font-weight-black uppercase d-flex align-center flex-wrap gap-1" style="font-size: 0.58rem !important; letter-spacing: 0.02em;">
            <span>Scheda {{ previousWorkout.num_scheda }} • Giorno {{ previousWorkout.des_giorno }}{{ previousWorkout.num_riga_giorno }}</span>
            <template v-if="getExecutionDate(previousWorkout, storicoEsercizio, workout)">
              <span>•</span>
              <span class="text-slate-dark">🗓️ {{ formattaDataStorico(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }}</span>
              <span v-if="tempoTrascorso(getExecutionDate(previousWorkout, storicoEsercizio, workout))" class="text-slate-light font-weight-bold ml-1"> ({{ tempoTrascorso(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }})</span>
            </template>
          </div>
        </div>

        <v-card-text class="px-3 pt-2 pb-3 scrollbar-custom" style="max-height: 85vh;">
          <div v-if="!previousWorkout" class="text-center py-6">
            <v-icon size="36" color="orange-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
            <p class="text-caption text-muted">Nessun dato o scheda precedente trovata per questo esercizio.</p>
          </div>
          <div v-else>
            <!-- Lista delle 6 settimane delle progressioni precedenti (Carico a tutta larghezza e prescrizione sopra) -->
            <div class="d-flex flex-column gap-2 mb-3">
              <div v-for="w in [6, 5, 4, 3, 2, 1]" :key="w" class="rounded-xl border border-soft card-glass-dark pa-2 text-left">
                <!-- Settimana + Prescrizione (Sopra) -->
                <div class="d-flex align-center justify-space-between mb-1.5" style="line-height: 1.1;">
                  <div class="font-weight-black text-slate-dark uppercase d-flex align-center gap-1" style="font-size: 0.72rem !important; letter-spacing: 0.03em;">
                    <span>Week {{ w }}</span>
                    <span class="text-orange-lighten-2 font-weight-black ml-1" style="font-size: 1.05rem !important; text-transform: none;">
                      ({{ previousWorkout['des_week' + w] ? pulisciParentesiQuadre(previousWorkout['des_week' + w]) : 'N.D.' }})
                    </span>
                  </div>
                </div>
                
                <!-- Carico (A tutta larghezza con regole dimensione e colori caselle ins_) -->
                <div class="w-100">
                  <!-- Box Formattato con Numeri e Colori in Risalto (Visualizzazione) -->
                  <div
                    v-if="risaltoNumeriInsWeek && activeEditingWeekPrecedente !== w && inputSettimanePrecedente[w]?.ins && String(inputSettimanePrecedente[w].ins).trim()"
                    class="custom-prev-ins-field cursor-text w-100 font-weight-medium transition-all"
                    :class="getGhostFieldClassPrecedente(w)"
                    style="padding: 8px 12px; border-radius: 8px; text-align: left; min-height: 38px; white-space: pre-wrap; word-break: break-word; font-size: 0.92rem; line-height: 1.45; box-sizing: border-box;"
                    @click="attivaEditingWeekPrecedente(w)"
                    v-html="formattaInsWeekHtml(inputSettimanePrecedente[w].ins)"
                  ></div>

                  <!-- Textarea Editabile (in digitazione o se vuoto o se risalto disattivo) -->
                  <textarea
                    v-else
                    :id="'input-prev-peso-w' + w"
                    v-model="inputSettimanePrecedente[w].ins"
                    placeholder="Carico (es. 45 kg)"
                    class="custom-prev-ins-field font-weight-black w-100 transition-all"
                    :class="getGhostFieldClassPrecedente(w)"
                    rows="1"
                    style="width: 100%; outline: none; font-size: 0.92rem; padding: 8px 12px; border-radius: 8px; text-align: left; min-height: 38px; height: auto; field-sizing: content; resize: vertical; line-height: 1.35; box-sizing: border-box;"
                    @focus="activeEditingWeekPrecedente = w"
                    @blur="onBlurWeekPrecedente(w)"
                  ></textarea>
                </div>

                <!-- Card Premium Feedback e Miglior Carico W6 Precedente -->
                <div 
                  v-if="w === 6 && isEsercizioEligibileW6(previousWorkout)" 
                  class="w6-feedback-premium-box mt-3 pt-3 pb-2.5 px-3 rounded-2xl border"
                >
                  <!-- Header Box W6 Precedente -->
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div class="d-flex align-center gap-1.5">
                      <v-icon color="amber-lighten-2" size="16">mdi-trophy-award</v-icon>
                      <span class="text-caption font-weight-black text-amber-lighten-2 uppercase tracking-wide" style="font-size: 0.70rem;">
                        Picco W6 Mesociclo Scorso
                      </span>
                    </div>
                  </div>

                  <!-- Riga 1: Miglior Carico W6 Precedente -->
                  <div class="d-flex align-center justify-space-between w-100 mb-2.5 pa-1.5 rounded-xl stepper-row-glass border-soft">
                    <div class="d-flex flex-column text-left pl-1">
                      <span class="font-weight-black text-slate-dark text-uppercase tracking-wider" style="font-size: 0.68rem; line-height: 1.1;">
                        Max Raggiunto
                      </span>
                      <span class="text-super-caption text-slate" style="font-size: 0.54rem;">
                        Carico top archiviato
                      </span>
                    </div>

                    <div class="d-flex align-center w6-stepper-container rounded-xl px-1 py-0.5 border">
                      <v-btn
                        icon
                        size="28px"
                        variant="flat"
                        color="transparent"
                        class="stepper-btn text-orange-lighten-2"
                        @click="decrementaKgUnicoPrecedente"
                      >
                        <v-icon size="16">mdi-minus</v-icon>
                      </v-btn>
                      <div class="d-flex align-center justify-center px-1">
                        <input
                          v-model="numIns6ValPrecedente"
                          type="text"
                          class="text-center font-weight-black text-slate-dark w6-stepper-input"
                          @blur="salvaKgUnicoPrecedente"
                          placeholder="--"
                        />
                        <span class="text-super-caption font-weight-black text-orange-lighten-3 ml-0.5" style="font-size: 0.60rem;">KG</span>
                      </div>
                      <v-btn
                        icon
                        size="28px"
                        variant="flat"
                        color="transparent"
                        class="stepper-btn text-orange-lighten-2"
                        @click="incrementaKgUnicoPrecedente"
                      >
                        <v-icon size="16">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <!-- Riga 2: Sforzo Percepito W6 Precedente -->
                  <div class="d-flex flex-column gap-1.5 w-100 text-left">
                    <div class="d-flex align-center justify-space-between">
                      <span class="font-weight-black text-slate-dark text-uppercase tracking-wider" style="font-size: 0.65rem;">
                        ⚡ Sforzo Percepito
                      </span>
                      <span v-if="numFaticaw6ValPrecedente" class="text-super-caption font-weight-black" :style="getColoreFaticaStyle(numFaticaw6ValPrecedente)">
                        {{ numFaticaw6ValPrecedente }}
                      </span>
                    </div>

                    <div class="w6-fatica-grid">
                      <button
                        type="button"
                        class="w6-fatica-pill"
                        :class="{ 'active-media': numFaticaw6ValPrecedente === 'Media' }"
                        @click="salvaFaticaPrecedente('Media')"
                      >
                        <span class="pill-icon">🙂</span>
                        <span class="pill-text">Media</span>
                      </button>

                      <button
                        type="button"
                        class="w6-fatica-pill"
                        :class="{ 'active-pesante': numFaticaw6ValPrecedente === 'Pesante' }"
                        @click="salvaFaticaPrecedente('Pesante')"
                      >
                        <span class="pill-icon">🔥</span>
                        <span class="pill-text">Pesante</span>
                      </button>

                      <button
                        type="button"
                        class="w6-fatica-pill"
                        :class="{ 'active-devastante': numFaticaw6ValPrecedente === 'Devastante' }"
                        @click="salvaFaticaPrecedente('Devastante')"
                      >
                        <span class="pill-icon">💀</span>
                        <span class="pill-text">Devastante</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-if="previousWorkout.des_note_attrezzo" class="mt-4 pa-3 rounded-lg bg-slate-900 border-soft text-left">
              <span class="text-super-caption text-muted font-weight-bold uppercase d-block mb-1" style="font-size: 0.6rem;">Note Coach:</span>
              <p class="text-caption text-slate-dark mb-0 font-weight-medium" style="line-height: 1.35;">{{ previousWorkout.des_note_attrezzo }}</p>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top bg-slate-900 gap-2">
          <v-btn color="orange-darken-3" variant="flat" block rounded="lg" size="small" class="font-weight-bold text-white" @click="dialogProgressioniPrecedente = false">
            Chiudi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Ricerca Rapida Esercizio (Tutta la Scheda Raggruppata) -->
    <v-dialog v-model="dialogRicercaRapida" max-width="550" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden text-left" style="backdrop-filter: blur(25px);">
        <v-card-title class="pa-3 pb-2 border-bottom d-flex align-center justify-space-between bg-slate-900">
          <div class="d-flex align-center gap-2">
            <v-icon color="orange-lighten-2" size="20">mdi-magnify</v-icon>
            <div>
              <span class="text-subtitle-2 font-weight-black text-white d-block leading-tight">Ricerca Rapida Scheda</span>
              <span class="text-super-caption text-orange-lighten-2 font-weight-bold" style="font-size: 0.58rem;">Tutti gli esercizi della Scheda {{ workout?.num_scheda || '' }}</span>
            </div>
          </div>
          <v-btn icon variant="text" width="28" height="28" color="grey" @click="dialogRicercaRapida = false">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-3">
          <v-text-field
            v-model="testoRicercaDettaglio"
            placeholder="Cerca per nome o settore muscolare..."
            variant="outlined"
            density="compact"
            hide-details
            clearable
            autofocus
            color="orange-darken-3"
            prepend-inner-icon="mdi-magnify"
            class="mb-3 rounded-xl"
          ></v-text-field>

          <!-- Lista risultati della ricerca raggruppati per giorno -->
          <div v-if="eserciziRicercatiDettaglioRaggruppati.length === 0" class="text-center py-6 text-muted text-caption">
            Nessun esercizio trovato per "{{ testoRicercaDettaglio }}".
          </div>

          <div v-else class="d-flex flex-column gap-3 scrollbar-custom" style="max-height: 65vh;">
            <div
              v-for="gruppo in eserciziRicercatiDettaglioRaggruppati"
              :key="gruppo.giorno"
              class="d-flex flex-column gap-1.5"
            >
              <div class="d-flex align-center px-1">
                <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white px-2 mr-2" style="height: 18px; font-size: 0.6rem;">
                  GIORNO {{ gruppo.giorno }}
                </v-chip>
                <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.6rem;">
                  {{ gruppo.esercizi.length }} eserciz{{ gruppo.esercizi.length === 1 ? 'io' : 'i' }}
                </span>
              </div>

              <div
                v-for="item in gruppo.esercizi"
                :key="item.id"
                class="pa-2.5 rounded-xl border border-soft d-flex align-center justify-space-between cursor-pointer card-glass hover-scale ml-1"
                :style="{
                  background: String(item.id) === String(workout?.id) ? 'rgba(249, 115, 22, 0.18)' : 'rgba(255, 255, 255, 0.03)',
                  borderColor: String(item.id) === String(workout?.id) ? 'rgba(249, 115, 22, 0.45)' : 'rgba(255, 255, 255, 0.08)'
                }"
                @click="vaiADettaglioEsercizioRicercato(item.id)"
              >
                <div class="d-flex align-center gap-2 min-width-0">
                  <v-chip size="x-small" color="orange-darken-3" variant="outlined" class="font-weight-black px-1.5 flex-shrink-0" style="height: 18px; font-size: 0.58rem;">
                    {{ item.des_giorno }}{{ item.num_riga_giorno }}
                  </v-chip>
                  <div class="text-truncate">
                    <div class="text-caption font-weight-black text-white text-truncate" style="font-size: 0.8rem;">
                      {{ item.des_esercizio }}
                    </div>
                    <div v-if="item.des_settore" class="text-super-caption text-orange-lighten-2 font-weight-bold" style="font-size: 0.6rem;">
                      {{ item.des_settore }}
                    </div>
                  </div>
                </div>
                <v-icon size="18" color="orange-lighten-2" class="flex-shrink-0 ml-2">mdi-chevron-right</v-icon>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>

    <!-- Dialog Modifica Esercizio (MODIFICA - solo Coach) -->
    <v-dialog v-model="dialogModifica" max-width="650" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="pa-4 pb-2 border-bottom d-flex align-center justify-space-between bg-slate-900">
          <div class="d-flex align-center gap-2">
            <v-icon color="orange-lighten-2" size="22">mdi-pencil</v-icon>
            <span class="text-subtitle-1 font-weight-black text-white">Modifica Esercizio</span>
          </div>
          <v-btn icon variant="text" width="24" height="24" color="grey" @click="dialogModifica = false">
            <v-icon size="16">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="pa-4 text-slate font-weight-medium" style="font-size: 0.85rem; max-height: 70vh;">
          <v-form ref="formModifica" class="d-flex flex-column gap-3">
            <!-- Info Esercizio -->
            <div class="text-subtitle-2 font-weight-bold text-orange-lighten-2 mb-1">Informazioni Base</div>
            
            <v-text-field
              v-model="modificaForm.des_esercizio"
              label="Nome Esercizio"
              density="comfortable"
              variant="outlined"
              color="orange-darken-3"
              hide-details
            ></v-text-field>

            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="modificaForm.des_giorno"
                  label="Giorno di Allenamento (es. A, B, C, D)"
                  density="comfortable"
                  variant="outlined"
                  color="orange-darken-3"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="modificaForm.num_riga_giorno"
                  label="Numero Esercizio (Posizione)"
                  type="number"
                  density="comfortable"
                  variant="outlined"
                  color="orange-darken-3"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12" sm="6">
                <v-combobox
                  v-model="modificaForm.des_settore"
                  :items="['PETTORALI', 'DORSALI', 'SPALLE', 'BICIPITI', 'TRICIPITI', 'GAMBE', 'FEMORALI', 'POLPACCI', 'CORE', 'ADDOME', 'CARDIO', 'FULL BODY']"
                  label="Settore"
                  density="comfortable"
                  variant="outlined"
                  color="orange-darken-3"
                  hide-details
                ></v-combobox>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="modificaForm.des_rec_report"
                  label="Recupero (es. 2' o 1'30'')"
                  density="comfortable"
                  variant="outlined"
                  color="orange-darken-3"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>

            <v-row dense>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="modificaForm.des_esercizio_2"
                  label="1RMT / Volume (des_esercizio_2)"
                  density="comfortable"
                  variant="outlined"
                  color="orange-darken-3"
                  hide-details
                ></v-text-field>
              </v-col>
              <v-col cols="12" sm="6">
                <v-text-field
                  v-model="modificaForm.alf_superserie"
                  label="Superset (es. A1, A2)"
                  density="comfortable"
                  variant="outlined"
                  color="orange-darken-3"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>

            <v-text-field
              v-model="modificaForm.UrlNormal"
              label="URL GIF / Esercizio (UrlNormal)"
              density="comfortable"
              variant="outlined"
              color="orange-darken-3"
              hide-details
            ></v-text-field>

            <v-divider class="my-2 border-soft"></v-divider>

            <!-- Note & Setup -->
            <div class="text-subtitle-2 font-weight-bold text-orange-lighten-2 mb-1">Note & Setup</div>
            
            <v-textarea
              v-model="modificaForm.des_note"
              label="Note Coach (des_note)"
              density="comfortable"
              variant="outlined"
              color="orange-darken-3"
              rows="2"
              auto-grow
              hide-details
            ></v-textarea>

            <v-textarea
              v-model="modificaForm.des_note_attrezzo"
              label="Setup Attrezzo (des_note_attrezzo)"
              density="comfortable"
              variant="outlined"
              color="orange-darken-3"
              rows="2"
              auto-grow
              hide-details
            ></v-textarea>

            <v-textarea
              v-model="modificaForm.des_note_gen_attr"
              label="Generiche Macchinario (des_note_gen_attr)"
              density="comfortable"
              variant="outlined"
              color="orange-darken-3"
              rows="2"
              auto-grow
              hide-details
            ></v-textarea>

            <v-textarea
              v-model="modificaForm.des_estesa_start"
              label="ROM / Esecuzione Tecnica (des_estesa_start)"
              density="comfortable"
              variant="outlined"
              color="orange-darken-3"
              rows="2"
              auto-grow
              hide-details
            ></v-textarea>

            <v-textarea
              v-model="modificaForm.des_estesa_end"
              label="Note Fine / Istruzioni Test (des_estesa_end)"
              density="comfortable"
              variant="outlined"
              color="orange-darken-3"
              rows="2"
              auto-grow
              hide-details
            ></v-textarea>

            <v-divider class="my-2 border-soft"></v-divider>

            <!-- Prescrizioni Settimanali -->
            <div class="text-subtitle-2 font-weight-bold text-orange-lighten-2 mb-1">Prescrizioni Settimane</div>
            <v-row dense>
              <v-col cols="12" sm="6" v-for="w in 6" :key="w">
                <v-text-field
                  v-model="modificaForm['des_week' + w]"
                  :label="'Week ' + w + ' (es. 4x8 @70% RIR2)'"
                  density="comfortable"
                  variant="outlined"
                  color="orange-darken-3"
                  hide-details
                ></v-text-field>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        
        <v-card-actions class="pa-3 border-top bg-slate-900 gap-2">
          <v-btn variant="text" color="grey" rounded="lg" size="small" class="font-weight-bold text-none flex-grow-1" @click="dialogModifica = false">
            Annulla
          </v-btn>
          <v-btn color="orange-darken-3" variant="flat" rounded="lg" size="small" class="font-weight-bold text-none flex-grow-1 text-white" :loading="modificandoEsercizio" @click="salvaModificheEsercizio">
            Salva Modifiche
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog 2: Conferma Eliminazione (ELIMINA) -->
    <v-dialog v-model="dialogElimina" max-width="400">
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="pa-4 pb-2 border-bottom d-flex align-center gap-2 bg-slate-900">
          <v-icon color="red-lighten-2" size="22">mdi-alert-outline</v-icon>
          <span class="text-subtitle-1 font-weight-black text-white">Conferma Eliminazione</span>
        </v-card-title>
        <v-card-text class="pa-4 text-slate font-weight-medium" style="font-size: 0.85rem; line-height: 1.5;">
          Sei sicuro di voler eliminare l'esercizio <strong class="text-white">{{ workout.des_esercizio }}</strong>?<br>
          Questa azione lo rimuoverà permanentemente da questo mesociclo (Scheda {{ workout.num_scheda }}, Giorno {{ workout.des_giorno }}).
        </v-card-text>
        <v-card-actions class="pa-3 border-top bg-slate-900 gap-2">
          <v-btn variant="text" color="grey" rounded="lg" size="small" class="font-weight-bold text-none flex-grow-1" @click="dialogElimina = false">
            Annulla
          </v-btn>
          <v-btn color="red-darken-3" variant="flat" rounded="lg" size="small" class="font-weight-bold text-none flex-grow-1 text-white" :loading="eliminandoEsercizio" @click="eliminaEsercizio">
            Elimina
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Controllo Diretto: Mancano Ripetizioni AMRAP -->
    <v-dialog v-model="dialogMancanoRepsAmrap" max-width="440" persistent>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden text-center" style="backdrop-filter: blur(25px); background: #0b111e !important; border: 1.5px solid rgba(249, 115, 22, 0.4) !important;">
        <v-card-title class="pa-4 pb-2 d-flex align-center justify-center gap-2 bg-slate-900 border-bottom">
          <v-icon color="orange-accent-3" size="24">mdi-fire</v-icon>
          <span class="text-subtitle-1 font-weight-black text-white">Quante reps hai fatto nell'AMRAP?</span>
        </v-card-title>

        <v-card-text class="pa-4 text-left">
          <p class="text-caption text-slate-200 mb-3" style="font-size: 0.82rem; line-height: 1.45;">
            Hai inserito il carico di <strong class="text-amber-lighten-2">{{ caricoMancanoReps }} kg</strong> senza specificare le ripetizioni massime completate.
          </p>
          <div class="text-super-caption text-slate-400 font-weight-bold uppercase mb-2" style="font-size: 0.65rem;">
            Tocca le ripetizioni completate per salvare:
          </div>

          <!-- Griglia rapida reps -->
          <div class="d-flex flex-wrap gap-1.5 justify-center mb-3">
            <v-btn
              v-for="r in [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 18, 20]"
              :key="r"
              size="small"
              variant="flat"
              color="grey-darken-3"
              class="font-weight-black text-white px-2"
              style="min-width: 44px; height: 36px; border: 1px solid rgba(255, 255, 255, 0.12);"
              @click="applicaRepsAmrap(r)"
            >
              {{ r }}r
            </v-btn>
          </div>

          <!-- Input manuale -->
          <div class="d-flex align-center gap-2 mt-2">
            <v-text-field
              v-model="inputRepsManualeAmrap"
              placeholder="Altre reps (es. 22)"
              type="number"
              density="compact"
              variant="outlined"
              hide-details
              class="flex-grow-1"
            ></v-text-field>
            <v-btn
              color="orange-darken-3"
              variant="flat"
              size="small"
              class="font-weight-bold text-none px-3"
              style="height: 40px;"
              :disabled="!inputRepsManualeAmrap || parseInt(inputRepsManualeAmrap) <= 0"
              @click="applicaRepsAmrap(inputRepsManualeAmrap)"
            >
              Salva
            </v-btn>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top bg-slate-900 justify-space-between">
          <v-btn variant="text" color="grey" size="x-small" class="text-none font-weight-bold" @click="dialogMancanoRepsAmrap = false">
            Solo carico (lascia così)
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Strategia Coach (Roadmap & Analisi e1RM) -->
    <v-dialog v-model="dialogStrategiaCoach" max-width="580" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <!-- Header -->
        <v-card-title class="pa-3 border-bottom bg-slate-900 d-flex align-center justify-space-between" style="min-height: 48px;">
          <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
            <v-icon color="amber-darken-2" size="20">mdi-brain</v-icon>
            <span class="dialog-header-title font-weight-black text-truncate" style="font-size: 0.88rem; letter-spacing: 0.02em;">
              Strategia Coach: {{ workout?.des_esercizio }}
            </span>
          </div>
          <v-btn icon variant="text" width="26" height="26" color="grey" @click="dialogStrategiaCoach = false">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4 text-left" style="max-height: 75vh;">
          <!-- BANNER NARRATIVO DIAGNOSI -->
          <div 
            class="pa-3 rounded-xl border mb-3" 
            :style="{
              background: meStatoBg(strategiaCoachData.stato),
              borderColor: meStatoBorder(strategiaCoachData.stato)
            }"
          >
            <div class="d-flex align-center gap-2 mb-1">
              <v-icon size="18" :color="meStatoColor(strategiaCoachData.stato)" class="mr-2 flex-shrink-0">
                {{ meStatoIcona(strategiaCoachData.stato) }}
              </v-icon>
              <span class="font-weight-black text-caption uppercase" :class="meStatoTextClass(strategiaCoachData.stato)" style="letter-spacing: 0.04em;">
                {{ meStatoTitolo(strategiaCoachData.stato) }}
              </span>
            </div>
            <p class="text-caption text-slate-light mb-0" style="font-size: 0.72rem; line-height: 1.4;">
              {{ meStatoDescrizione(strategiaCoachData) }}
            </p>
          </div>

          <!-- BARRA STATO PRESTAZIONALE E SPUNTI -->
          <div class="mb-3 text-left">
            <div class="text-super-caption text-slate-light uppercase font-weight-black mb-1.5" style="font-size: 0.58rem; letter-spacing: 0.04em;">
              {{ strategiaCoachData.isCorpoLiberoPuro ? '📊 CONFRONTO RECORD RIPETIZIONI' : '📊 CONFRONTO MASSIMALE STIMATO (E1RM)' }}
            </div>

            <v-row dense class="mb-2">
              <!-- SINISTRI: PRESTAZIONE ATTUALE -->
              <v-col cols="6">
                <div class="pa-2 rounded-lg card-attuale-box border text-center">
                  <span class="text-super-caption text-orange-lighten-2 font-weight-bold d-block" style="font-size: 0.58rem;">Attuale</span>
                  <span class="text-subtitle-2 font-weight-black dialog-text-primary" style="font-size: 0.95rem;">
                    <template v-if="strategiaCoachData.isCorpoLiberoPuro">
                      {{ (strategiaCoachData.bestCurrentReps > 0 && meFormatNum(strategiaCoachData.bestCurrentReps) !== '0') ? formatRepsDisplay(strategiaCoachData.bestCurrentReps) : '--' }}
                    </template>
                    <template v-else>
                      {{ strategiaCoachData.bestCurrentWeight > 0 ? formatWeight(strategiaCoachData.bestCurrentWeight) + 'kg' : '--' }}
                    </template>
                  </span>
                  <span v-if="!strategiaCoachData.isCorpoLiberoPuro && strategiaCoachData.bestCurrentWeight > 0" class="text-super-caption text-muted d-block" style="font-size: 0.55rem;">
                    ×{{ meFormatNum(strategiaCoachData.bestCurrentReps) }}r (e1RM ~{{ meFormatNum(strategiaCoachData.e1rmAttuale) }}kg)
                  </span>
                  <span v-else-if="!strategiaCoachData.isCorpoLiberoPuro" class="text-super-caption text-muted d-block" style="font-size: 0.55rem;">Non ancora inserito</span>
                </div>
              </v-col>

              <!-- DESTRI: RECORD STORICO (ALLINEATO CON COLONNA TARGET TEORICO SOTTO) -->
              <v-col cols="6">
                <div class="pa-2 rounded-lg card-record-box border text-center">
                  <span class="text-super-caption text-cyan-lighten-2 font-weight-bold d-block" style="font-size: 0.58rem;">Record Storico</span>
                  <span class="text-subtitle-2 font-weight-black dialog-text-primary" style="font-size: 0.95rem;">
                    <template v-if="strategiaCoachData.isCorpoLiberoPuro">
                      {{ (strategiaCoachData.prReps > 0 && meFormatNum(strategiaCoachData.prReps) !== '0') ? formatRepsDisplay(strategiaCoachData.prReps) : '--' }}
                    </template>
                    <template v-else>
                      {{ strategiaCoachData.prWeight > 0 ? formatWeight(strategiaCoachData.prWeight) + 'kg' : '--' }}
                    </template>
                  </span>
                  <span v-if="!strategiaCoachData.isCorpoLiberoPuro && strategiaCoachData.prWeight > 0" class="text-super-caption text-muted d-block" style="font-size: 0.55rem;">
                    ×{{ meFormatNum(strategiaCoachData.prReps) }}r (e1RM ~{{ meFormatNum(strategiaCoachData.e1rmStorico) }}kg)
                  </span>
                </div>
              </v-col>
            </v-row>
          </div>

          <!-- ROADMAP PROGETTATA A 6 SETTIMANE -->
          <div class="mb-3">
            <div class="d-flex align-center justify-space-between mb-2 gap-2">
              <span class="text-super-caption font-weight-black dialog-text-primary uppercase text-truncate" style="font-size: 0.65rem; letter-spacing: 0.05em;">
                🗺️ Roadmap di Progressione (W1 - W6)
              </span>
              <v-chip color="amber-darken-3" size="x-small" density="compact" class="font-weight-black text-white px-2 flex-shrink-0" style="font-size: 0.55rem; height: 20px; white-space: nowrap;">
                {{ meAttrezzoLabel(strategiaCoachData.isManubri, strategiaCoachData.isCorpoLiberoPuro, strategiaCoachData.isComfortAttivo, strategiaCoachData.percentualeInfortunio) }}
              </v-chip>
            </div>

            <div class="d-flex flex-column gap-2">
              <div 
                v-for="step in strategiaCoachData.roadmap" 
                :key="step.week"
                class="pa-2.5 rounded-xl border text-left position-relative"
                :style="getStepCardStyle(step)"
              >
                <!-- Intestazione Settimana & Fase -->
                <div class="d-flex align-center justify-space-between mb-1.5">
                  <div class="d-flex align-center gap-1.5">
                    <v-chip 
                      :color="step.color + '-darken-2'" 
                      size="x-small" 
                      variant="flat" 
                      class="font-weight-black text-white px-1.5 mr-2 flex-shrink-0" 
                      style="font-size: 0.58rem; height: 18px;"
                    >
                      W{{ step.week }}
                    </v-chip>
                    <span class="font-weight-black dialog-text-primary text-caption" style="font-size: 0.75rem;">
                      {{ step.fase }}
                    </span>
                  </div>
                  <div class="d-flex align-center gap-1">
                    <v-chip 
                      v-if="step.isLogged" 
                      color="green-darken-2" 
                      size="x-small" 
                      variant="flat"
                      class="font-weight-black text-white px-1.5" 
                      style="font-size: 0.50rem; height: 16px;"
                    >
                      ✓ ESEGUITO
                    </v-chip>
                    <v-chip 
                      v-if="step.week === settimanaAttiva" 
                      color="amber-darken-3" 
                      size="x-small" 
                      variant="flat"
                      class="font-weight-black text-white animate-pulse px-2" 
                      style="font-size: 0.55rem; height: 18px; letter-spacing: 0.03em;"
                    >
                      ⚡ ATTIVA ORA
                    </v-chip>
                  </div>
                </div>

                <!-- BOX A DOPPIO INDICATORE (REALE / RICALIBRATO + TARGET TEORICO PR) -->
                <div class="pa-2 rounded-lg d-flex align-center justify-space-between gap-1 inner-indicator-box">
                  <!-- Indicatore 1: Dato Reale Sollevato o Proiezione Reale -->
                  <div>
                    <span class="text-super-caption font-weight-black uppercase d-block" :class="step.isLogged ? 'text-green-lighten-2' : 'text-amber-lighten-2'" style="font-size: 0.53rem; letter-spacing: 0.03em;">
                      {{ step.isLogged ? '⚡ Reale:' : '⚡ Proiezione:' }}
                    </span>
                    <div class="d-flex align-baseline gap-1 mt-0.5">
                      <span class="text-subtitle-2 font-weight-black" :class="step.isLogged ? 'text-green-accent-3' : 'text-amber-lighten-1'" style="font-size: 0.95rem; line-height: 1;">
                        {{ step.caricoReale }}
                      </span>
                      <span v-if="step.repsReali" class="text-super-caption font-weight-bold ml-1" :class="step.isLogged ? 'text-green-lighten-3' : 'text-slate-300'" style="font-size: 0.65rem;">
                        ({{ step.repsReali }})
                      </span>
                    </div>
                  </div>

                  <!-- Indicatore 2: Target Teorico PR Storico / Target Comfort -->
                  <div class="text-right pl-2" style="border-left: 1px solid var(--card-border);">
                    <span class="text-super-caption font-weight-bold text-cyan-lighten-3 uppercase d-block" style="font-size: 0.52rem; letter-spacing: 0.02em; white-space: nowrap;">
                      {{ strategiaCoachData.isComfortAttivo ? '🎯 Target Comfort' : '🎯 Target PR' }}
                    </span>
                    <div class="d-flex align-baseline justify-end gap-1 mt-0.5">
                      <span class="text-caption font-weight-black text-cyan-lighten-2" style="font-size: 0.78rem; line-height: 1;">
                        {{ step.caricoTeorico }}
                      </span>
                      <span v-if="step.repsTeoriche" class="text-super-caption text-cyan-lighten-4 opacity-80 ml-1" style="font-size: 0.58rem;">
                        ({{ step.repsTeoriche }})
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Note & RPE (Senza text-truncate per mostrare tutto il testo senza puntini) -->
                <div class="d-flex align-start justify-space-between mt-1.5 px-0.5 gap-2">
                  <p class="text-super-caption text-slate-light mb-0" style="font-size: 0.60rem; line-height: 1.35; white-space: normal; word-break: break-word; flex: 1;">
                    {{ step.note }}
                  </p>
                  <span class="text-super-caption font-weight-black text-purple-lighten-3 flex-shrink-0 mt-0.5" style="font-size: 0.60rem;">
                    {{ step.rpe }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <!-- TACTICAL TIPS -->
          <div class="pa-2.5 rounded-xl border card-tactical-box">
            <div class="d-flex align-center gap-1.5 mb-1">
              <v-icon color="amber-lighten-2" size="14">mdi-lightbulb-on</v-icon>
              <span class="text-super-caption font-weight-black text-amber-lighten-2 uppercase" style="font-size: 0.60rem;">
                Consigli Tattici FlexCoach
              </span>
            </div>
            <ul v-if="strategiaCoachData.isComfortAttivo" class="text-super-caption text-slate-light pl-4 mb-0" style="font-size: 0.62rem; line-height: 1.35;">
              <li>Non forzare aumenti di peso finché il fastidio articolare non scende a 0-2/10.</li>
              <li>Se tolleri bene il carico, dai priorità alla qualità esecutiva e alle ripetizioni prima dei kg.</li>
              <li>Mantieni un tempo sotto tensione (TUT) controllato e curato sulla fase eccentrica.</li>
            </ul>
            <ul v-else class="text-super-caption text-slate-light pl-4 mb-0" style="font-size: 0.62rem; line-height: 1.35;">
              <li v-if="!strategiaCoachData.isCorpoLiberoPuro">Non forzare carichi elevati nella settimana 4 di scarico.</li>
              <li v-else>Nella settimana 4 di scarico, mantieni le ripetizioni senza cercare l'esaurimento.</li>
              <li>Se in W2 completi le {{ getRepsPerWeek(2) }} ripetizioni con RPE &lt; 8, {{ strategiaCoachData.isCorpoLiberoPuro ? 'incrementa le ripetizioni o aggiungi peso' : (strategiaCoachData.isManubri ? 'incrementa di 1 kg' : 'incrementa di 2.5 kg') }} in W3.</li>
              <li>Mantieni un tempo sotto tensione (TUT) controllato sulla fase eccentrica.</li>
            </ul>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top bg-slate-900">
          <v-btn color="orange-darken-3" variant="flat" block rounded="xl" class="font-weight-black text-none text-white py-2" @click="dialogStrategiaCoach = false">
            Ho capito il piano!
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog 3: Riepilogo Storico Esercizi (Cronologia) -->
    <!-- Dialog 3: Riepilogo Storico e Proposta Carico Unificati (Analisi Esercizio) -->
    <v-dialog v-model="dialogStorico" :max-width="activeTabAnalisi === 0 ? 550 : (stileStorico === 'tabella' ? 1200 : (stileStorico === 'grafico' ? 700 : 650))" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" :style="{ backdropFilter: 'blur(25px)', background: 'var(--card-bg-dark, #0f172a) !important' }">
        <v-card-title class="pa-0 border-bottom" :style="{ background: 'var(--card-bg-dark, #0f172a)' }">
          <!-- Rigo 1: Titolo e Chiudi -->
          <div class="px-3 py-2 d-flex align-center justify-space-between" style="min-height: 40px;">
            <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
              <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" size="18">
                {{ activeTabAnalisi === 0 ? 'mdi-lightbulb-on' : 'mdi-history' }}
              </v-icon>
              <span class="dialog-header-title font-weight-black text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
                {{ activeTabAnalisi === 0 ? 'Proposta Carico: ' : 'Storico: ' }}{{ workout?.des_esercizio }}
              </span>
            </div>
            <!-- Pulsante X più piccolo -->
            <v-btn icon variant="text" width="24" height="24" color="grey" @click="dialogStorico = false">
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
          </div>
          
          <!-- Tabs Unificati -->
          <v-tabs v-model="activeTabAnalisi" color="orange-darken-3" grow class="border-top" style="border-top: 1px solid var(--card-border, rgba(255, 255, 255, 0.08)) !important; height: 36px;">
            <v-tab :value="0" class="font-weight-black text-none" :style="{ color: activeTabAnalisi === 0 ? 'var(--theme-primary, #f97316)' : 'var(--text-dark, #1e293b)' }" style="font-size: 0.72rem; height: 36px;">
              <v-icon start size="14" class="mr-1">mdi-lightbulb-on-outline</v-icon>
              Proposta Carico (W{{ aiutoWeek }})
            </v-tab>
            <v-tab :value="1" class="font-weight-black text-none" :style="{ color: activeTabAnalisi === 1 ? 'var(--theme-primary, #f97316)' : 'var(--text-dark, #1e293b)' }" style="font-size: 0.72rem; height: 36px;">
              <v-icon start size="14" class="mr-1">mdi-history</v-icon>
              Cronologia
            </v-tab>
          </v-tabs>
          
          <!-- Rigo 2: Subheader WEEK & REPS per Proposta Carico (esattamente come nella cronologia) -->
          <div v-if="activeTabAnalisi === 0" class="mb-1.5 px-3 py-2 border-top d-flex align-center justify-center position-relative" :style="{ background: 'var(--card-bg-soft, #020617)', borderColor: 'var(--card-border, rgba(255, 255, 255, 0.08))' }">
            <v-chip size="x-small" class="font-weight-black text-white px-2 position-absolute" variant="flat" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316))', fontSize: '0.65rem', height: '20px', left: '12px' }">
              WEEK {{ aiutoWeek }}
            </v-chip>
            <span class="text-caption font-weight-black text-center" :style="{ color: 'var(--theme-primary-light, #fb923c)', fontSize: '0.85rem', letterSpacing: '0.02em' }">
              {{ String(targetRepsAttive).replace(/r$/i, '') }} REPS
            </span>
          </div>

          <!-- Rigo 2: Target Reps Settimana Attiva (per Cronologia) -->
          <div v-if="activeTabAnalisi === 1" class="mb-1.5 px-3 py-2 border-top d-flex align-center justify-center position-relative" :style="{ background: 'var(--card-bg-soft, #020617)', borderColor: 'var(--card-border, rgba(255, 255, 255, 0.08))' }">
            <v-chip size="x-small" class="font-weight-black text-white px-2 position-absolute" variant="flat" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316))', fontSize: '0.65rem', height: '20px', left: '12px' }">
              WEEK {{ settimanaAttiva }}
            </v-chip>
            <span class="text-caption font-weight-black text-center" :style="{ color: 'var(--theme-primary-light, #fb923c)', fontSize: '0.85rem', letterSpacing: '0.02em' }">
              {{ String(getRepsPerWeek(settimanaAttiva)).replace(/r$/i, '') }} REPS
            </span>
          </div>

          <!-- Rigo 3: Hero Banner dei Due Record Assoluti & Obiettivo W -->
          <div v-if="activeTabAnalisi === 1 && suggerimentoRecord" class="px-3 py-2 border-top text-left" :style="{ background: 'var(--card-bg-dark, #000000)', borderColor: 'var(--card-border, rgba(249, 115, 22, 0.2))' }">
            
            <!-- HERO BANNER PR: RECORD ASSOLUTO GENERALE -->
            <div 
              v-if="suggerimentoRecord.recordAbsolute > 0" 
              class="record-hero-pr-assoluto pa-2.5 rounded-xl border mb-2 text-left transition-colors" 
              style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.03) 100%); border-color: rgba(6, 182, 212, 0.35) !important; cursor: pointer;"
              @click="vaiADettaglioStorico(suggerimentoRecord.recordAbsoluteItem || suggerimentoRecord.recordAbsoluteId)"
            >
              <div class="d-flex align-center justify-space-between mb-0.5">
                <div class="d-flex align-center gap-1">
                  <v-icon color="cyan-lighten-2" size="13">mdi-fire</v-icon>
                  <span class="text-super-caption font-weight-black text-cyan-lighten-2 uppercase" style="font-size: 0.58rem; letter-spacing: 0.04em;">
                    RECORD ASSOLUTO ESERCIZIO
                  </span>
                </div>
                <v-chip color="cyan-darken-2" size="x-small" class="font-weight-black text-white" variant="flat" style="font-size: 0.5rem; height: 16px; padding: 0 6px;">
                  PR ASSOLUTO
                </v-chip>
              </div>

              <div class="d-flex align-baseline gap-1.5">
                <span class="record-hero-num text-subtitle-1 font-weight-black" style="font-size: 1.05rem; line-height: 1.1;">
                  <template v-if="isCorpoLiberoEsercizio(workout) && !suggerimentoRecord.recordAbsoluteHasWeight">
                    {{ formatRepsDisplay(suggerimentoRecord.recordAbsoluteReps || suggerimentoRecord.recordAbsolute) }}
                  </template>
                  <template v-else>
                    {{ formatWeight(suggerimentoRecord.recordAbsolute) }} kg
                  </template>
                </span>
                <span v-if="suggerimentoRecord.recordAbsoluteReps && suggerimentoRecord.recordAbsoluteReps > 0 && (!isCorpoLiberoEsercizio(workout) || suggerimentoRecord.recordAbsoluteHasWeight)" class="text-caption font-weight-black ml-2" :style="{ color: 'var(--theme-primary-light, #38bdf8)' }" style="font-size: 0.72rem;">
                  &nbsp;x{{ formatRepsDisplay(suggerimentoRecord.recordAbsoluteReps) }}
                </span>
              </div>

              <div class="text-super-caption font-weight-bold mt-0.5 d-flex align-center gap-1 flex-wrap" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.53rem; line-height: 1.2;">
                <span>📍 Sch. {{ suggerimentoRecord.recordAbsoluteSheet || '-' }}{{ suggerimentoRecord.recordAbsoluteDay ? ' ' + suggerimentoRecord.recordAbsoluteDay : '' }}{{ (suggerimentoRecord.recordAbsoluteRow !== null && suggerimentoRecord.recordAbsoluteRow !== undefined) ? suggerimentoRecord.recordAbsoluteRow : '' }}</span>
                <span> 🗓️ {{ formattaDataStorico(suggerimentoRecord.recordAbsoluteDate) || 'N.D.' }}</span>
                <span v-if="tempoTrascorso(suggerimentoRecord.recordAbsoluteDate)" class="ml-1" :style="{ color: 'var(--theme-primary-light, #0284c7)' }">({{ tempoTrascorso(suggerimentoRecord.recordAbsoluteDate) }})</span>
              </div>
            </div>

            <!-- RIGA INFERIORE: RECORD A STESSE REPS + OBIETTIVO W -->
            <div class="d-flex align-stretch gap-1.5 w-100 min-width-0">
              <!-- Card 1: Record a Stesse Reps -->
              <div 
                v-if="suggerimentoRecord.record > 0 || suggerimentoRecord.recordRepsValue > 0" 
                class="record-hero-reps pa-2 rounded-xl border text-left d-flex flex-column justify-center transition-colors overflow-hidden" 
                style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.3) !important; cursor: pointer; flex: 1 1 0%; min-width: 0;"
                @click="vaiADettaglioStorico(suggerimentoRecord.recordRepsItem || suggerimentoRecord.recordRepsId)"
              >
                <div class="d-flex align-center justify-space-between mb-0.5">
                  <div class="d-flex align-center gap-1 text-truncate">
                    <v-icon color="amber-lighten-1" size="12">mdi-trophy</v-icon>
                    <span class="text-super-caption font-weight-black uppercase text-truncate" :style="{ color: 'var(--theme-primary-light, #d97706)' }" style="font-size: 0.55rem; letter-spacing: 0.03em;">
                      RECORD A {{ getRepsPerWeek(settimanaAttiva) }} REPS
                    </span>
                  </div>
                </div>

                <div class="d-flex align-baseline gap-1 text-truncate">
                  <span class="record-hero-num text-subtitle-2 font-weight-black" style="font-size: 0.95rem; line-height: 1.1;">
                    <template v-if="isCorpoLiberoEsercizio(workout) && !suggerimentoRecord.recordHasWeight">
                      {{ formatRepsDisplay(suggerimentoRecord.recordRepsValue || suggerimentoRecord.record) }}
                    </template>
                    <template v-else>
                      {{ formatWeight(suggerimentoRecord.record) }} kg
                    </template>
                  </span>
                  <span v-if="suggerimentoRecord.recordRepsValue && suggerimentoRecord.recordRepsValue > 0 && (!isCorpoLiberoEsercizio(workout) || suggerimentoRecord.recordHasWeight)" class="text-super-caption font-weight-bold text-truncate ml-2" :class="suggerimentoRecord.recordRepsFatica ? '' : 'text-amber-lighten-2'" :style="suggerimentoRecord.recordRepsFatica ? getColoreFaticaStyle(suggerimentoRecord.recordRepsFatica) : {}" style="font-size: 0.62rem;">
                    &nbsp;x{{ formatRepsDisplay(suggerimentoRecord.recordRepsValue) }} {{ suggerimentoRecord.recordRepsFatica ? '(' + formatFaticaAbbr(suggerimentoRecord.recordRepsFatica) + ')' : '' }}
                  </span>
                </div>

                <div class="text-super-caption font-weight-bold mt-0.5 text-truncate" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.51rem; line-height: 1.15; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                  <span v-if="suggerimentoRecord.recordRepsSheet">
                    Sch. {{ suggerimentoRecord.recordRepsSheet }}{{ suggerimentoRecord.recordRepsDay ? ' ' + suggerimentoRecord.recordRepsDay : '' }} • 
                  </span>
                  {{ formattaDataStorico(suggerimentoRecord.recordRepsDate) || 'N.D.' }}
                </div>
              </div>

              <!-- Card 2: Obiettivo W Attiva -->
              <div v-if="suggerimentoRecord.target > 0 || suggerimentoRecord.isScarico" class="record-hero-target pa-2 rounded-xl border text-left d-flex flex-column justify-center overflow-hidden" style="background: rgba(249, 115, 22, 0.08); border-color: rgba(249, 115, 22, 0.3) !important; flex: 1 1 0%; min-width: 0;">
                <div class="d-flex align-center gap-1 mb-0.5 text-truncate">
                  <v-icon color="orange-lighten-2" size="12">mdi-target</v-icon>
                  <span class="text-super-caption font-weight-black uppercase text-truncate" :style="{ color: 'var(--theme-primary-light, #fb923c)' }" style="font-size: 0.55rem; letter-spacing: 0.03em;">
                    <span v-if="suggerimentoRecord.isScarico">SCARICO W{{settimanaAttiva}}</span>
                    <span v-else>OBIETTIVO W{{settimanaAttiva}}</span>
                  </span>
                </div>

                <div class="record-hero-num text-subtitle-2 font-weight-black text-truncate" style="font-size: 0.95rem; line-height: 1.1; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                  <span v-if="suggerimentoRecord.isScarico">{{ estraiPesoDaInput(suggerimentoRecord.pesoWeek2) ? formatWeight(estraiPesoDaInput(suggerimentoRecord.pesoWeek2)) + (isCorpoLiberoEsercizio(workout) ? 'r' : ' kg') : 'Scarico' }}</span>
                  <span v-else>{{ suggerimentoRecord.targetDisplay || (isCorpoLiberoEsercizio(workout) ? getRepsPerWeek(settimanaAttiva) + 'r' : suggerimentoRecord.target + ' kg') }}</span>
                </div>
                <div class="text-super-caption font-weight-bold text-truncate" :style="{ color: 'var(--text-slate, #64748b)' }" style="font-size: 0.51rem; overflow: hidden; white-space: nowrap; text-overflow: ellipsis;">
                  {{ suggerimentoRecord.targetSubtext || ('a ' + getRepsPerWeek(settimanaAttiva) + ' reps target') }}
                </div>
              </div>
            </div>
          </div>

          <!-- Rigo 4: Controlli Visualizzazione (Solo per Cronologia) -->
          <div v-if="activeTabAnalisi === 1" class="px-3 py-2 border-top d-flex align-center justify-space-between" :style="{ background: 'var(--card-bg-soft, #0f172a)', borderColor: 'var(--card-border, rgba(255,255,255,0.05))' }">
            <v-btn
              :color="soloCorrispondenti ? 'red-darken-3' : 'grey-darken-3'"
              variant="flat"
              size="x-small"
              class="font-weight-black text-none"
              style="height: 28px; font-size: 0.68rem;"
              @click="toggleFiltroCorrispondenti"
            >
              <v-icon size="14" class="mr-1">
                {{ soloCorrispondenti ? 'mdi-filter-remove' : 'mdi-filter' }}
              </v-icon>
              Solo Stessi Reps ({{ targetRepsRange ? formatRepsDisplay(targetRepsRange) : 'N.D.' }})
            </v-btn>
            
            <v-btn-toggle
              v-model="stileStorico"
              mandatory
              selected-class="bg-orange-darken-3 text-white"
              density="compact"
              rounded="lg"
              class="card-glass border"
              style="height: 28px;"
            >
              <!-- TABELLA PRIMO -->
              <v-btn value="tabella" class="px-2" style="min-width: 40px; height: 28px;" title="Vista a Tabella">
                <v-icon size="18">mdi-table</v-icon>
              </v-btn>
              <!-- TIMELINE SECONDO -->
              <v-btn value="timeline" class="px-2" style="min-width: 40px; height: 28px;" title="Vista a Lista">
                <v-icon size="18">mdi-view-sequential</v-icon>
              </v-btn>
              <!-- GRAFICO TERZO -->
              <v-btn value="grafico" class="px-2" style="min-width: 40px; height: 28px;" title="Vista Grafico">
                <v-icon size="18">mdi-chart-line</v-icon>
              </v-btn>
            </v-btn-toggle>
          </div>
        </v-card-title>
        
        <v-card-text ref="storicoScrollContainer" class="px-3 pt-2 pb-3 scrollbar-custom" style="max-height: 85vh;">

          <!-- TAB 0: PROPOSTA CARICO (SMART & HIERARCHICAL) -->
          <div v-if="activeTabAnalisi === 0" class="pt-0">

            <!-- CASO SCARICO WEEK 4 -->
            <div v-if="aiutoWeek === 4 && isWeek4Scarico && !getGhostLiftSmart(aiutoWeek)?.isCoachSet" class="mb-2.5 pa-2.5 rounded-xl text-left" style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.04) 100%); border: 1.5px solid rgba(251, 191, 36, 0.35) !important;">
              <div class="d-flex align-center justify-space-between mb-1.5">
                <span class="text-super-caption text-amber-lighten-1 font-weight-black uppercase" style="font-size: 0.58rem; letter-spacing: 0.04em;">
                  🔋 SCARICO ATTIVO (W4)
                </span>
                <v-chip color="amber-darken-3" size="x-small" density="compact" class="font-weight-black text-white" style="font-size: 0.5rem; height: 16px;">
                  RECUPERO ATTIVO
                </v-chip>
              </div>
              
              <!-- Opzione 1: W2 -->
              <div class="d-flex align-center justify-space-between bg-slate-900 border rounded-lg pa-1.5 mb-1.5" style="border-color: rgba(255,255,255,0.05) !important;">
                <span class="text-caption dialog-text-primary font-weight-black" style="font-size: 0.72rem;">Usa peso W2: <strong class="text-green-accent-3">{{ scaricoWeek4Weights.pesoW2 ? scaricoWeek4Weights.pesoW2 + ' kg' : 'N.D.' }}</strong></span>
                <v-btn
                  color="amber-darken-2"
                  size="x-small"
                  class="font-weight-black text-white px-2 text-none"
                  rounded="md"
                  style="font-size: 0.62rem; height: 24px;"
                  :disabled="!scaricoWeek4Weights.pesoW2"
                  @click="applicaPropostaCaricoStorico(scaricoWeek4Weights.pesoW2)"
                >
                  Applica W2
                </v-btn>
              </div>
              
              <!-- Opzione 2: W3 -->
              <div class="d-flex align-center justify-space-between bg-slate-900 border rounded-lg pa-1.5" style="border-color: rgba(255,255,255,0.05) !important;">
                <span class="text-caption dialog-text-primary font-weight-black" style="font-size: 0.72rem;">Usa peso W3: <strong class="text-green-accent-3">{{ scaricoWeek4Weights.pesoW3 ? scaricoWeek4Weights.pesoW3 + ' kg' : 'N.D.' }}</strong></span>
                <v-btn
                  color="amber-darken-4"
                  size="x-small"
                  class="font-weight-black text-white px-2 text-none"
                  rounded="md"
                  style="font-size: 0.62rem; height: 24px;"
                  :disabled="!scaricoWeek4Weights.pesoW3"
                  @click="applicaPropostaCaricoStorico(scaricoWeek4Weights.pesoW3)"
                >
                  Applica W3
                </v-btn>
              </div>
            </div>

            <!-- CASO GHOST COACH SET -->
            <div v-else-if="getGhostLiftSmart(aiutoWeek)?.isCoachSet" class="mb-2.5 text-left animate-fade-in">
              <div class="pa-3 rounded-xl border bg-slate-900" style="border-color: rgba(251, 191, 36, 0.3) !important; background: linear-gradient(135deg, rgba(251, 191, 36, 0.1) 0%, rgba(251, 191, 36, 0.02) 100%) !important;">
                <div class="d-flex align-center gap-2 mb-1">
                  <v-icon color="amber-darken-2" size="18">mdi-alert-decagram-outline</v-icon>
                  <span class="text-caption font-weight-black text-amber-lighten-2 uppercase" style="font-size: 0.72rem; letter-spacing: 0.04em;">
                    Carichi impostati dal Coach
                  </span>
                </div>
                <div class="text-super-caption text-slate-light font-weight-bold" style="font-size: 0.68rem; line-height: 1.4;">
                  I carichi per questo esercizio di forza sono già impostati dal coach, per cui non c'è alcuna proposta o variazione da consigliare.
                </div>
              </div>
            </div>

            <!-- CASO WEEK 1 PROPOSTA ERROR -->
            <div v-else-if="aiutoWeek === 1 && propostaWeek1?.erroreCarichi" class="mb-2.5 text-left">
              <div class="pa-2.5 rounded-lg text-red-accent-4" style="background: rgba(239, 68, 68, 0.1) !important; border: 1px solid rgba(239, 68, 68, 0.35) !important;">
                <div class="d-flex align-center gap-1.5 font-weight-bold text-caption" style="font-size: 0.68rem !important; color: #ff5252 !important;">
                  <v-icon color="red-accent-4" size="14">mdi-alert-circle-outline</v-icon>
                  <span>⚠️ Scheda prec. senza carichi. Carica il Miglior Carico W6 per la stima.</span>
                </div>
              </div>
            </div>

            <div v-else-if="caricandoAiutoCarico" class="text-center py-6">
              <v-progress-circular indeterminate color="orange" size="28" class="mb-2"></v-progress-circular>
              <p class="text-super-caption text-muted">Calcolo proposta in corso...</p>
            </div>

            <template v-else>
              <!-- 2. BLOCCO RECORD IN ALTO (2 COLONNE: PR A STESSE REPS + e1RM MASSIMO) -->
              <div v-if="recordOverviewData" class="mb-2 text-left">
                <div class="d-flex gap-1.5 w-100">
                  <!-- Colonna 1: PR a Stesse Reps -->
                  <div 
                    class="pa-2.5 rounded-xl border flex-grow-1 d-flex flex-column justify-space-between transition-colors cursor-pointer position-relative select-none"
                    :style="{
                      background: recordOverviewData.bestReal.isCurrentPR 
                        ? 'linear-gradient(135deg, rgba(245, 158, 11, 0.28) 0%, rgba(217, 119, 6, 0.14) 100%)' 
                        : 'rgba(255, 255, 255, 0.03)',
                      borderColor: recordOverviewData.bestReal.isCurrentPR 
                        ? 'rgba(245, 158, 11, 0.75) !important' 
                        : 'rgba(255, 255, 255, 0.10) !important',
                      boxShadow: recordOverviewData.bestReal.isCurrentPR 
                        ? '0 4px 18px rgba(245, 158, 11, 0.20)' 
                        : 'none',
                      flex: '1 1 0%',
                      minWidth: '0'
                    }"
                    @click="apriResocontoCoachPR"
                    @contextmenu.prevent="apriResocontoCoachPR"
                    @touchstart="handlePRTouchStart"
                    @touchend="handlePRTouchEnd"
                  >
                    <div>
                      <div class="d-flex align-center justify-space-between mb-0.5 gap-1">
                        <div class="d-flex align-center gap-1 text-truncate">
                          <span style="font-size: 0.75rem; line-height: 1;">🏆</span>
                          <span 
                            class="text-super-caption font-weight-bold uppercase text-truncate text-amber-lighten-1"
                            style="font-size: 0.44rem; letter-spacing: 0.02em;"
                          >
                            PR A {{ String(getRepsPerWeek(aiutoWeek)).replace(/r$/i, '') }} REPS
                          </span>
                        </div>
                        <span 
                          v-if="recordOverviewData.bestReal.isCurrentPR" 
                          class="font-weight-bold text-amber-950 bg-amber-400 rounded text-truncate"
                          style="font-size: 0.38rem; letter-spacing: 0.01em; padding: 1px 4px;"
                        >
                          NUOVO PR
                        </span>
                      </div>
                      <div class="d-flex align-baseline gap-1 text-truncate">
                        <span 
                          class="font-weight-black text-truncate" 
                          :class="recordOverviewData.bestReal.isCurrentPR ? 'text-amber-lighten-2' : 'text-white'"
                          style="font-size: 1.05rem; line-height: 1.15;"
                        >
                          {{ recordOverviewData.bestReal.weightDisplay }}
                        </span>
                        <span 
                          v-if="recordOverviewData.bestReal.repsDisplay"
                          class="text-super-caption font-weight-medium ml-1 text-truncate"
                          :class="recordOverviewData.bestReal.isCurrentPR ? 'text-amber-lighten-3' : 'text-red-lighten-3'"
                          style="font-size: 0.54rem;"
                        >
                          {{ recordOverviewData.bestReal.repsDisplay }}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <div 
                        class="mt-0.5 text-super-caption font-weight-medium text-truncate" 
                        :class="recordOverviewData.bestReal.isCurrentPR ? 'text-green-accent-3' : 'text-slate-400'" 
                        style="font-size: 0.41rem; line-height: 1.2;"
                      >
                        {{ recordOverviewData.bestReal.provenienzaSenzaCoppa }}
                      </div>
                      
                      <!-- Sotto al PR (se da scheda passata ed inferiore) -->
                      <div 
                        v-if="recordOverviewData.bestReal.sottoPRText" 
                        class="mt-0.5 text-super-caption text-orange-lighten-2 font-weight-regular text-truncate d-flex align-center gap-0.5" 
                        style="font-size: 0.42rem; line-height: 1.1; letter-spacing: -0.01em;"
                      >
                        <v-icon size="9" color="orange-lighten-2">mdi-trending-down</v-icon>
                        <span class="text-truncate">{{ recordOverviewData.bestReal.sottoPRText }}</span>
                      </div>
                    </div>
                  </div>

                  <!-- Colonna 2: 1RM ATTUALE (in grande) & Max Storico (in piccolo sotto) -->
                  <div 
                    class="pa-2.5 rounded-xl border flex-grow-1 d-flex flex-column justify-space-between transition-colors cursor-pointer"
                    :style="{
                      background: recordOverviewData.bestE1RM.isNewPeak
                        ? 'linear-gradient(135deg, rgba(6, 182, 212, 0.22) 0%, rgba(6, 182, 212, 0.05) 100%)'
                        : 'linear-gradient(135deg, rgba(6, 182, 212, 0.10) 0%, rgba(6, 182, 212, 0.02) 100%)',
                      borderColor: recordOverviewData.bestE1RM.isNewPeak
                        ? 'rgba(6, 182, 212, 0.65) !important'
                        : 'rgba(6, 182, 212, 0.30) !important',
                      flex: '1 1 0%',
                      minWidth: '0'
                    }"
                    @click="recordOverviewData.bestE1RM.id && vaiADettaglioStorico(recordOverviewData.bestE1RM.id)"
                  >
                    <div>
                      <div class="d-flex align-center justify-space-between mb-0.5 gap-1">
                        <div class="d-flex align-center gap-1 text-truncate">
                          <v-icon color="cyan-lighten-2" size="12">{{ recordOverviewData.isCorpoLiberoPuro ? 'mdi-counter' : 'mdi-chart-line' }}</v-icon>
                          <span class="text-super-caption font-weight-bold text-cyan-lighten-2 uppercase text-truncate" style="font-size: 0.44rem; letter-spacing: 0.02em;">
                            {{ recordOverviewData.isCorpoLiberoPuro ? 'MAX REPS STORICO' : '1RM ATTUALE' }}
                          </span>
                        </div>
                        <span 
                          v-if="recordOverviewData.bestE1RM.isNewPeak"
                          class="font-weight-bold text-cyan-950 bg-cyan-300 rounded"
                          style="font-size: 0.38rem; letter-spacing: 0.01em; padding: 1px 4px; white-space: nowrap;"
                        >
                          TOP<template v-if="recordOverviewData.bestE1RM.calcoloBaseShort"> ({{ recordOverviewData.bestE1RM.calcoloBaseShort }})</template>
                        </span>
                        <span 
                          v-else-if="recordOverviewData.bestE1RM.calcoloBaseShort"
                          class="font-weight-medium text-cyan-200 rounded"
                          style="font-size: 0.38rem; background: rgba(6, 182, 212, 0.2); letter-spacing: 0.01em; padding: 1px 4px; white-space: nowrap;"
                        >
                          {{ recordOverviewData.bestE1RM.calcoloBaseShort }}
                        </span>
                      </div>
                      <!-- 1RM Attuale o Max Reps in GRANDE -->
                      <div class="font-weight-black text-cyan-lighten-2 text-truncate" style="font-size: 1.05rem; line-height: 1.15;">
                        {{ recordOverviewData.bestE1RM.display }}
                      </div>
                    </div>

                    <div>
                      <!-- Max Storico & Delta in PICCOLO sotto -->
                      <div v-if="recordOverviewData.bestE1RM.isNewPeak" class="mt-0.5 text-super-caption font-weight-medium text-cyan-accent-2" style="font-size: 0.41rem; line-height: 1.2; letter-spacing: -0.01em;">
                        {{ recordOverviewData.isCorpoLiberoPuro ? (recordOverviewData.bestE1RM.maxDeltaText || ('👑 Record: ' + recordOverviewData.bestE1RM.display + ' • W' + (recordOverviewData.bestE1RM.week || aiutoWeek))) : ('👑 Rec: ' + (recordOverviewData.bestE1RM.calcoloBase || '') + ' • W' + (recordOverviewData.bestE1RM.week || aiutoWeek)) }}
                      </div>
                      <div v-else>
                        <div 
                          class="mt-0.5 text-super-caption text-cyan-lighten-3 font-weight-regular text-truncate d-flex align-center gap-0.5" 
                          style="font-size: 0.42rem; line-height: 1.1; letter-spacing: -0.01em;"
                        >
                          <span class="text-truncate">{{ recordOverviewData.bestE1RM.maxDeltaText }}</span>
                        </div>

                        <!-- Mini Progress Bar di Prossimità al Picco Assoluto -->
                        <div 
                          v-if="recordOverviewData.bestE1RM.e1rmProximityPct"
                          class="w-100 rounded-pill overflow-hidden mt-1" 
                          style="height: 2px; background: rgba(255, 255, 255, 0.08);"
                        >
                          <div 
                            class="h-100 rounded-pill transition-all" 
                            :style="{ width: recordOverviewData.bestE1RM.e1rmProximityPct + '%', background: 'linear-gradient(90deg, #06b6d4, #22d3ee)' }"
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 3. STRATEGIE (SAFE / SMART / SFIDANTE) - Card consigliata in evidenza, senza duplicazioni -->
              <div v-if="strategieAlternativeCards.length > 0" class="mb-2 text-left">
                <div class="d-flex gap-1.5 w-100">
                  <div 
                    v-for="card in strategieAlternativeCards" 
                    :key="card.tipo" 
                    class="flex-grow-1"
                    :style="{
                      flex: card.isConsigliato ? '1.12 1 0%' : '0.94 1 0%',
                      minWidth: '0'
                    }"
                  >
                    <v-card 
                      class="pa-2 rounded-xl border d-flex flex-column justify-space-between fill-height text-center position-relative transition-all"
                      :style="{
                        borderColor: card.isConsigliato 
                          ? 'rgba(74, 222, 128, 0.85) !important' 
                          : (card.tipo === 'sfidante' ? 'rgba(249, 115, 22, 0.35) !important' : 'rgba(59, 130, 246, 0.35) !important'),
                        background: card.isConsigliato 
                          ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(16, 185, 129, 0.04) 100%) !important' 
                          : (card.tipo === 'sfidante' ? 'linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(249, 115, 22, 0.02) 100%) !important' : 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(59, 130, 246, 0.02) 100%) !important'),
                        boxShadow: card.isConsigliato ? '0 4px 16px rgba(74, 222, 128, 0.20)' : 'none',
                        transform: card.isConsigliato ? 'scale(1.02)' : 'none',
                        zIndex: card.isConsigliato ? 2 : 1
                      }"
                      elevation="0"
                    >
                      <!-- Badge Consigliato se attiva -->
                      <div v-if="card.isConsigliato" class="mb-1">
                        <span 
                          class="font-weight-black uppercase px-1.5 py-0.2 rounded text-white" 
                          style="background: #15803d; font-size: 0.46rem; letter-spacing: 0.04em; display: inline-block;"
                        >
                          ✓ CONSIGLIATO
                        </span>
                      </div>

                      <!-- Intestazione Card -->
                      <div>
                        <div class="d-flex align-center justify-center gap-1">
                          <span 
                            class="font-weight-bold uppercase text-truncate"
                            :class="card.isConsigliato ? 'text-green-accent-3' : (card.tipo === 'sfidante' ? 'text-orange-lighten-2' : 'text-blue-lighten-2')"
                            style="font-size: 0.54rem; letter-spacing: 0.02em;"
                          >
                            {{ card.icon }} {{ card.nome }}
                          </span>
                        </div>

                        <!-- Valore Peso x Reps -->
                        <div 
                          class="font-weight-black text-white mt-0.5 text-truncate" 
                          :class="card.isConsigliato ? 'text-green-accent-3' : 'text-white'"
                          :style="{ fontSize: card.valoreDisplay && card.valoreDisplay.length > 9 ? '0.76rem' : (card.isConsigliato ? '1.05rem' : '0.90rem'), lineHeight: '1.15' }"
                        >
                          {{ card.valoreDisplay }}
                        </div>

                        <!-- Sottotitolo Dinamico Sintetico (senza troncamento forzato, multiline armonioso) -->
                        <div class="text-super-caption text-slate-400 font-weight-regular mt-0.5 text-center d-flex align-center justify-center" style="font-size: 0.44rem; line-height: 1.22; min-height: 22px; word-break: break-word;">
                          {{ card.sottotitolo }}
                        </div>

                        <!-- Pillola Incremento (Esclusiva della card Consigliata) -->
                        <div v-if="card.isConsigliato && card.mesoPillText" class="mt-1 d-flex justify-center">
                          <div 
                            class="d-inline-flex align-center justify-center px-1.5 py-0.5 rounded-lg border font-weight-bold text-green-accent-3 text-no-wrap"
                            style="background: rgba(16, 185, 129, 0.16); border: 1px solid rgba(74, 222, 128, 0.45) !important; font-size: 0.45rem; letter-spacing: 0.01em; line-height: 1.15;"
                          >
                            ↗ {{ card.mesoPillText }}
                          </div>
                        </div>

                        <!-- Pillola PR (Esclusiva della card Sfidante) -->
                        <div v-else-if="card.prGoalText" class="mt-1 d-flex justify-center">
                          <div 
                            class="d-inline-flex align-center justify-center px-1.5 py-0.5 rounded-lg border font-weight-bold text-amber-accent-2 text-no-wrap cursor-pointer"
                            style="background: rgba(245, 158, 11, 0.16); border: 1px solid rgba(245, 158, 11, 0.40) !important; font-size: 0.41rem; letter-spacing: 0.01em; line-height: 1.15;"
                            @click.stop="apriDettaglioSfidantePR(card.prDetail)"
                          >
                            {{ card.prGoalText }}
                            <v-icon size="9" color="amber-accent-2" class="ml-0.5">mdi-information-outline</v-icon>
                          </div>
                        </div>
                      </div>

                      <!-- Separatore e Metrica Rischio/Probabilità -->
                      <div class="pt-1 mt-1 border-top" style="border-color: rgba(255,255,255,0.06) !important;">
                        <div class="text-super-caption text-slate-400 font-weight-regular text-truncate" style="font-size: 0.44rem;">
                          {{ card.metricLabel }}
                        </div>
                        <div 
                          class="font-weight-bold text-truncate"
                          :class="card.isConsigliato ? 'text-green-accent-3' : (card.tipo === 'sfidante' ? 'text-orange-lighten-2' : 'text-blue-lighten-2')"
                          style="font-size: 0.50rem; letter-spacing: 0.02em;"
                        >
                          {{ card.metricValue }}
                        </div>

                        <!-- Tasti Applica Sfidante con doppio bersaglio -->
                        <div v-if="card.recordAssolutoPesoToApply" class="d-flex gap-1 mt-1">
                          <v-btn
                            color="orange-darken-3"
                            size="x-small"
                            variant="tonal"
                            class="font-weight-bold text-white text-none flex-grow-1 rounded-lg px-1"
                            style="font-size: 0.48rem; height: 21px;"
                            @click="applicaPropostaCaricoStorico(card.pesoToApply)"
                          >
                            {{ card.pesoToApply }}k
                          </v-btn>
                          <v-btn
                            color="amber-darken-3"
                            size="x-small"
                            variant="flat"
                            class="font-weight-black text-white text-none flex-grow-1 rounded-lg px-1"
                            style="font-size: 0.48rem; height: 21px; background: linear-gradient(135deg, #d97706 0%, #b45309 100%) !important;"
                            @click="applicaPropostaCaricoStorico(card.recordAssolutoPesoToApply)"
                          >
                            👑 {{ card.recordAssolutoPesoToApply }}k
                          </v-btn>
                        </div>
                        <!-- Tasto Applica Standard -->
                        <v-btn
                          v-else
                          :color="card.isConsigliato ? 'green-darken-1' : (card.tipo === 'sfidante' ? 'orange-darken-3' : 'blue-darken-3')"
                          size="x-small"
                          :variant="card.isConsigliato ? 'flat' : 'tonal'"
                          class="font-weight-bold text-white text-none w-100 rounded-lg mt-1"
                          :class="{ 'elevation-2': card.isConsigliato }"
                          :style="{ fontSize: '0.55rem', height: card.isConsigliato ? '24px' : '20px' }"
                          @click="applicaPropostaCaricoStorico(card.pesoToApply)"
                        >
                          <v-icon v-if="card.isConsigliato" start size="11" class="mr-0.5">mdi-check</v-icon>
                          Applica
                        </v-btn>
                      </div>
                    </v-card>
                  </div>
                </div>
              </div>

              <!-- 5. SIMULATORE CARICO CUSTOM (ACCORDION ESPANDIBILE) -->
              <div v-if="!isCorpoLiberoEsercizio(workout)" class="mb-2 text-left">
                <v-card 
                  class="rounded-xl border bg-slate-950 overflow-hidden" 
                  style="border-color: rgba(255, 255, 255, 0.1) !important;"
                >
                  <div 
                    class="d-flex align-center justify-space-between px-3 py-1.5 cursor-pointer transition-colors"
                    style="background: rgba(255, 255, 255, 0.02);"
                    @click="toggleSimulatoreCarico"
                  >
                    <div class="d-flex align-center gap-1.5">
                      <span style="font-size: 0.85rem;">🧮</span>
                      <span class="font-weight-black text-amber-lighten-2 uppercase" style="font-size: 0.62rem; letter-spacing: 0.03em;">
                        SIMULATORE CARICO CUSTOM
                      </span>
                    </div>
                    <v-icon size="16" color="grey">{{ showSimulatoreCarico ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  </div>

                  <div v-if="showSimulatoreCarico" class="px-2.5 pt-2 pb-2.5 border-top animate-fade-in" style="border-color: rgba(255, 255, 255, 0.06) !important;">
                    <!-- Stepper [ - ] 45 KG [ + ] e Istruzione -->
                    <div class="d-flex align-center justify-space-between gap-2 mb-2">
                      <div class="d-flex align-center gap-1.5 pa-1 rounded-xl border bg-slate-900" style="border-color: rgba(251, 191, 36, 0.3) !important;">
                        <v-btn
                          icon
                          variant="tonal"
                          color="amber-darken-3"
                          size="x-small"
                          class="rounded-lg"
                          style="width: 28px; height: 28px;"
                          @click="decrementaSimulatore"
                        >
                          <v-icon size="14">mdi-minus</v-icon>
                        </v-btn>

                        <div class="d-flex align-center px-1 text-no-wrap">
                          <span class="text-super-caption text-amber-lighten-2 font-weight-black mr-1" style="font-size: 0.58rem;">KG</span>
                          <input
                            v-model="pesoCustomSimulatore"
                            type="number"
                            step="0.5"
                            class="font-weight-black text-center text-white"
                            style="width: 48px; background: transparent; border: none; outline: none; font-size: 1.05rem;"
                          />
                        </div>

                        <v-btn
                          icon
                          variant="tonal"
                          color="amber-darken-3"
                          size="x-small"
                          class="rounded-lg"
                          style="width: 28px; height: 28px;"
                          @click="incrementaSimulatore"
                        >
                          <v-icon size="14">mdi-plus</v-icon>
                        </v-btn>
                      </div>

                      <div class="text-super-caption text-slate-300 font-weight-medium" style="font-size: 0.54rem; line-height: 1.25;">
                        Calcola rep per progredire col peso scelto.
                      </div>
                    </div>

                    <!-- Base di Riferimento e le 3 Opzioni -->
                    <div v-if="calcolaProgressioneRepCustom" class="d-flex flex-column gap-1.5 pa-2 rounded-lg bg-slate-900 border" style="border-color: rgba(255, 255, 255, 0.05) !important;">
                      <div class="text-super-caption text-slate-300 font-weight-medium mb-0.5" style="font-size: 0.54rem;">
                        🎯 Base: <strong>{{ calcolaProgressioneRepCustom.pesoRef }}kg × {{ calcolaProgressioneRepCustom.repsRef }}r</strong> (e1RM: {{ calcolaProgressioneRepCustom.e1rmRef }}kg)
                      </div>

                      <!-- 1. PARITÀ -->
                      <div 
                        class="d-flex align-center justify-space-between pa-1.5 rounded-lg border bg-blue-950/30 border-blue-500/20 cursor-pointer hover:bg-blue-900/40 transition-colors"
                        @click="applicaPropostaCaricoStorico(calcolaProgressioneRepCustom.parita.valore)"
                      >
                        <div class="d-flex align-center gap-1.5">
                          <span class="font-weight-black text-blue-lighten-3" style="font-size: 0.58rem;">🟡 PARITÀ</span>
                          <span class="text-super-caption text-slate-400 font-weight-medium" style="font-size: 0.50rem;">Stessa Forza</span>
                        </div>
                        <div class="d-flex align-center gap-1.5">
                          <span class="font-weight-black text-white px-2 py-0.5 rounded bg-blue-900/80 border border-blue-400/30" style="font-size: 0.75rem;">
                            {{ calcolaProgressioneRepCustom.parita.valore }}
                          </span>
                          <v-btn color="blue-darken-3" size="x-small" density="compact" class="font-weight-black text-white text-none px-2 rounded" style="font-size: 0.55rem; height: 20px;">
                            Applica
                          </v-btn>
                        </div>
                      </div>

                      <!-- 2. TARGET (+1r) -->
                      <div 
                        class="d-flex align-center justify-space-between pa-1.5 rounded-lg border bg-green-950/30 border-green-500/20 cursor-pointer hover:bg-green-900/40 transition-colors"
                        @click="applicaPropostaCaricoStorico(calcolaProgressioneRepCustom.target.valore)"
                      >
                        <div class="d-flex align-center gap-1.5">
                          <span class="font-weight-black text-green-accent-3" style="font-size: 0.58rem;">🟢 TARGET</span>
                          <span class="text-super-caption text-green-accent-2 font-weight-medium" style="font-size: 0.50rem;">Progressione +1r</span>
                        </div>
                        <div class="d-flex align-center gap-1.5">
                          <span class="font-weight-black text-white px-2 py-0.5 rounded bg-green-900/80 border border-green-400/30" style="font-size: 0.75rem;">
                            {{ calcolaProgressioneRepCustom.target.valore }}
                          </span>
                          <v-btn color="green-darken-2" size="x-small" density="compact" class="font-weight-black text-white text-none px-2 rounded" style="font-size: 0.55rem; height: 20px;">
                            Applica
                          </v-btn>
                        </div>
                      </div>

                      <!-- 3. SFIDANTE (+2r / PR) -->
                      <div 
                        class="d-flex align-center justify-space-between pa-1.5 rounded-lg border bg-orange-950/30 border-orange-500/20 cursor-pointer hover:bg-orange-900/40 transition-colors"
                        @click="applicaPropostaCaricoStorico(calcolaProgressioneRepCustom.sfidante.valore)"
                      >
                        <div class="d-flex align-center gap-1.5">
                          <span class="font-weight-black text-orange-lighten-2" style="font-size: 0.58rem;">🔥 SFIDANTE</span>
                          <span class="text-super-caption font-weight-medium" :class="calcolaProgressioneRepCustom.sfidante.isPR ? 'text-amber-accent-2 font-weight-black' : 'text-orange-lighten-3'" style="font-size: 0.50rem;">
                            {{ calcolaProgressioneRepCustom.sfidante.label }}
                          </span>
                        </div>
                        <div class="d-flex align-center gap-1.5">
                          <span class="font-weight-black text-white px-2 py-0.5 rounded bg-orange-900/80 border border-orange-400/30" style="font-size: 0.75rem;">
                            {{ calcolaProgressioneRepCustom.sfidante.valore }}
                          </span>
                          <v-btn color="orange-darken-3" size="x-small" density="compact" class="font-weight-black text-white text-none px-2 rounded" style="font-size: 0.55rem; height: 20px;">
                            Applica
                          </v-btn>
                        </div>
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>

              <!-- 6. ANDAMENTO DEL CARICO NEL MESOCICLO (W1 -> W6 COMPATTO) -->
              <div v-if="andamentoMesocicloData" class="mb-2 text-left pa-2 rounded-xl border bg-slate-950" style="border-color: rgba(255, 255, 255, 0.08) !important;">
                <div class="d-flex align-center justify-space-between mb-1 px-0.5">
                  <span class="text-super-caption font-weight-black uppercase" style="color: var(--text-slate, #94a3b8); font-size: 0.55rem; letter-spacing: 0.04em;">
                    📊 ANDAMENTO CARICO NEL MESOCICLO
                  </span>
                </div>

                <!-- Griglia Orizzontale W1..W6 -->
                <div class="d-flex align-center gap-1 w-100">
                  <div 
                    v-for="item in andamentoMesocicloData.settimane" 
                    :key="item.week"
                    class="pa-1 rounded-lg border text-center flex-grow-1 transition-all"
                    :style="{
                      flex: '1 1 0%',
                      minWidth: '0',
                      borderColor: item.isCurrent ? '#4ade80 !important' : 'rgba(255, 255, 255, 0.08) !important',
                      background: item.isCurrent ? 'rgba(74, 222, 128, 0.16) !important' : 'rgba(255, 255, 255, 0.02) !important',
                      boxShadow: item.isCurrent ? '0 0 6px rgba(74, 222, 128, 0.2)' : 'none'
                    }"
                  >
                    <span 
                      class="d-block font-weight-black uppercase text-truncate"
                      :class="item.isCurrent ? 'text-green-accent-3' : 'text-muted'"
                      style="font-size: 0.48rem; line-height: 1;"
                    >
                      {{ item.label }}
                    </span>
                    <strong 
                      class="d-block mt-0.5 text-truncate"
                      :class="item.isCurrent ? 'text-green-accent-3 font-weight-black' : 'text-slate-200 font-weight-bold'"
                      style="font-size: 0.75rem; line-height: 1;"
                    >
                      {{ item.value }}
                    </strong>
                  </div>
                </div>

                <!-- Progressione Totale -->
                <div class="text-center mt-1 font-weight-black text-green-accent-3" style="font-size: 0.58rem; letter-spacing: 0.02em;">
                  {{ andamentoMesocicloData.deltaProgressioneText }}
                </div>
              </div>

              <!-- 7. "PERCHÉ QUESTO CONSIGLIO?" (ACCORDION ESPANDIBILE) -->
              <div v-if="percheConsiglioData" class="mb-1.5 text-left">
                <v-card class="rounded-xl border bg-slate-950 overflow-hidden" style="border-color: rgba(255, 255, 255, 0.08) !important;">
                  <div 
                    class="d-flex align-center justify-space-between px-3 py-1.5 cursor-pointer transition-colors"
                    style="background: rgba(255, 255, 255, 0.02);"
                    @click="showPercheConsiglio = !showPercheConsiglio"
                  >
                    <div>
                      <div class="d-flex align-center gap-1.5">
                        <span style="font-size: 0.85rem;">🧠</span>
                        <span class="font-weight-black text-cyan-lighten-2 uppercase" style="font-size: 0.62rem; letter-spacing: 0.03em;">
                          PERCHÉ QUESTO CONSIGLIO?
                        </span>
                      </div>
                      <div class="text-super-caption text-slate-400 font-weight-medium" style="font-size: 0.48rem; margin-left: 18px;">
                        Scopri come è stato calcolato
                      </div>
                    </div>
                    <v-icon size="16" color="grey">{{ showPercheConsiglio ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  </div>

                  <div v-if="showPercheConsiglio" class="px-2.5 pt-1.5 pb-2.5 border-top animate-fade-in" style="border-color: rgba(255, 255, 255, 0.06) !important;">
                    <!-- Griglia Metriche Tecniche -->
                    <div class="d-flex flex-column gap-1 mb-2">
                      <div class="d-flex align-center justify-space-between pa-1 rounded bg-slate-900 border text-super-caption" style="border-color: rgba(255,255,255,0.04) !important; font-size: 0.58rem;">
                        <span class="text-slate-400 font-weight-medium">📍 Base di partenza:</span>
                        <strong class="text-white">{{ percheConsiglioData.baseDiPartenza }}</strong>
                      </div>

                      <div v-if="!recordOverviewData?.isCorpoLiberoPuro" class="d-flex align-center justify-space-between pa-1 rounded bg-slate-900 border text-super-caption" style="border-color: rgba(255,255,255,0.04) !important; font-size: 0.58rem;">
                        <span class="text-slate-400 font-weight-medium">📈 e1RM recente stimato:</span>
                        <strong class="text-cyan-lighten-2">{{ percheConsiglioData.e1rmRecente }}</strong>
                      </div>

                      <div class="d-flex align-center justify-space-between pa-1 rounded bg-slate-900 border text-super-caption" style="border-color: rgba(255,255,255,0.04) !important; font-size: 0.58rem;">
                        <span class="text-slate-400 font-weight-medium">🎯 Target attuale:</span>
                        <strong class="text-amber-lighten-2">{{ percheConsiglioData.targetAttuale }}</strong>
                      </div>

                      <div class="d-flex align-center justify-space-between pa-1 rounded bg-slate-900 border text-super-caption" style="border-color: rgba(255,255,255,0.04) !important; font-size: 0.58rem;">
                        <span class="text-slate-400 font-weight-medium">⚙️ Strategia attiva:</span>
                        <strong class="text-green-accent-3">{{ percheConsiglioData.strategiaAttiva }}</strong>
                      </div>

                      <div class="d-flex align-center justify-space-between pa-1 rounded bg-slate-900 border text-super-caption" style="border-color: rgba(255,255,255,0.04) !important; font-size: 0.58rem;">
                        <span class="text-slate-400 font-weight-medium">↗ Incremento vs base:</span>
                        <strong class="text-green-accent-3">{{ percheConsiglioData.incrementoVsBase }}</strong>
                      </div>
                    </div>

                    <!-- Logica Discorsiva Naturale -->
                    <div class="pa-2 rounded-lg bg-slate-900 border" style="border-color: rgba(6, 182, 212, 0.25) !important;">
                      <span class="text-super-caption font-weight-black text-cyan-lighten-3 uppercase d-block mb-0.5" style="font-size: 0.52rem; letter-spacing: 0.03em;">
                        Logica del calcolo
                      </span>
                      <p class="mb-0 text-super-caption text-slate-300 font-weight-medium" style="font-size: 0.58rem; line-height: 1.35;">
                        {{ percheConsiglioData.logicaCalcolo }}
                      </p>
                    </div>
                  </div>
                </v-card>
              </div>

              <!-- 8. STORICO COMPLETO (ACCORDION ESPANDIBILE) -->
              <div class="mb-1.5 text-left">
                <v-card class="rounded-xl border bg-slate-950 overflow-hidden" style="border-color: rgba(255, 255, 255, 0.08) !important;">
                  <div 
                    class="d-flex align-center justify-space-between px-3 py-1.5 cursor-pointer transition-colors"
                    style="background: rgba(255, 255, 255, 0.02);"
                    @click="showStoricoCompleto = !showStoricoCompleto"
                  >
                    <div>
                      <div class="d-flex align-center gap-1.5">
                        <span style="font-size: 0.85rem;">📖</span>
                        <span class="font-weight-black text-slate-200 uppercase" style="font-size: 0.62rem; letter-spacing: 0.03em;">
                          STORICO COMPLETO
                        </span>
                      </div>
                      <div class="text-super-caption text-slate-400 font-weight-medium" style="font-size: 0.48rem; margin-left: 18px;">
                        Vedi tutte le serie e le schede
                      </div>
                    </div>
                    <v-icon size="16" color="grey">{{ showStoricoCompleto ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  </div>

                  <div v-if="showStoricoCompleto" class="px-2.5 pt-1.5 pb-2.5 border-top animate-fade-in" style="border-color: rgba(255, 255, 255, 0.06) !important;">
                    <!-- Timeline compatta -->
                    <div v-if="storicoTimelineItems.length > 0" class="d-flex flex-column gap-1 mb-2">
                      <div 
                        v-for="it in storicoTimelineItems" 
                        :key="it.id"
                        class="d-flex align-center justify-space-between pa-1.5 rounded border text-super-caption transition-colors"
                        :style="{
                          borderColor: it.isPR ? 'rgba(245, 158, 11, 0.45) !important' : (it.isCurrent ? 'rgba(74, 222, 128, 0.3) !important' : 'rgba(255,255,255,0.04) !important'),
                          background: it.isPR ? 'rgba(245, 158, 11, 0.12) !important' : (it.isCurrent ? 'rgba(74, 222, 128, 0.08) !important' : '#0f172a')
                        }"
                        style="font-size: 0.58rem;"
                      >
                        <div class="d-flex align-center gap-1.5">
                          <span class="font-weight-black" :class="it.isPR ? 'text-amber-lighten-2' : (it.isCurrent ? 'text-green-accent-3' : 'text-slate-300')">
                            {{ it.titolo }}
                          </span>
                          <v-chip v-if="it.isPR" color="amber-darken-3" size="x-small" density="compact" class="font-weight-black text-white" style="font-size: 0.45rem; height: 14px; padding: 0 3px;">
                            🏆 PR
                          </v-chip>
                        </div>

                        <div class="d-flex align-center gap-2">
                          <strong :class="it.isPR ? 'text-amber-lighten-1 font-weight-black' : 'text-white'">{{ it.caricoReps }}</strong>
                          <span class="text-super-caption text-slate-400" style="font-size: 0.48rem;">{{ it.tempo }}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Riepilogo Miglior Prestazione in fondo -->
                    <div v-if="recordOverviewData" class="pa-1.5 rounded-lg bg-slate-900 border text-center" style="border-color: rgba(251, 191, 36, 0.25) !important;">
                      <span class="text-super-caption font-weight-black text-amber-lighten-2" style="font-size: 0.55rem;">
                        🏆 Miglior prestazione: {{ recordOverviewData.bestReal.display }} • {{ recordOverviewData.bestReal.provenienza }}
                      </span>
                    </div>
                  </div>
                </v-card>
              </div>

              <!-- 9. CAMBIO PALESTRA O CARICO DIVERSO? (ACCORDION ESPANDIBILE) -->
              <div class="mb-1.5 text-left">
                <v-card class="rounded-xl border bg-slate-950 overflow-hidden" style="border-color: rgba(255, 255, 255, 0.08) !important;">
                  <div 
                    class="d-flex align-center justify-space-between px-3 py-1.5 cursor-pointer transition-colors"
                    style="background: rgba(255, 255, 255, 0.02);"
                    @click="showCambioPalestra = !showCambioPalestra"
                  >
                    <div>
                      <div class="d-flex align-center gap-1.5">
                        <span style="font-size: 0.85rem;">⚡</span>
                        <span class="font-weight-black text-amber-lighten-2 uppercase" style="font-size: 0.62rem; letter-spacing: 0.03em;">
                          Cambio palestra o carico diverso?
                        </span>
                      </div>
                      <div class="text-super-caption text-slate-400 font-weight-medium" style="font-size: 0.48rem; margin-left: 18px;">
                        Regola d'oro per adattare il carico
                      </div>
                    </div>
                    <v-icon size="16" color="grey">{{ showCambioPalestra ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                  </div>

                  <div v-if="showCambioPalestra" class="px-2.5 pt-1.5 pb-2.5 border-top text-slate-light animate-fade-in" style="border-color: rgba(255, 255, 255, 0.06) !important; font-size: 0.60rem; line-height: 1.35;">
                    <!-- Regola parentesi -->
                    <div class="pa-1.5 rounded-lg mb-1.5" style="background: rgba(245, 158, 11, 0.08); border-left: 3px solid #f59e0b;">
                      <strong class="text-amber-lighten-1">👑 Regola d'Oro delle Parentesi ( ... ):</strong>
                      <div class="mt-0.5">
                        Tutto ciò che scrivi tra parentesi tonde <code>( ... )</code> (inclusi carichi e serie) viene escluso dal calcolo della progressione e dei PR.
                      </div>
                    </div>

                    <!-- Formato trasferta -->
                    <div class="pa-1.5 rounded-lg mb-1.5 bg-slate-900 border" style="border-color: rgba(255,255,255,0.05) !important;">
                      <strong class="text-green-accent-3">✅ Formato Consigliato in Trasferta:</strong>
                      <div class="font-mono mt-0.5 font-weight-bold" style="color: #4ade80; font-size: 0.62rem;">
                        25 x11r<br>
                        (45 x11r x2s Green Theory)
                      </div>
                      <div class="text-super-caption text-slate-400 mt-0.5" style="font-size: 0.50rem;">
                        L'app userà il 25kg per le progressioni future e salverà il 45kg tra parentesi come tuo promemoria.
                      </div>
                    </div>

                    <!-- Pulegge -->
                    <div class="pa-1.5 rounded-lg bg-slate-900 border" style="border-color: rgba(255,255,255,0.05) !important;">
                      <strong class="text-cyan-lighten-2">⚙️ Pulegge 1:1 vs 2:1:</strong>
                      <div class="mt-0.5">
                        Se la macchina ospite ha carrucole dimezzate (2:1), imposta <strong>il doppio del peso</strong> sul selettore per ottenere lo stesso stimolo reale.
                      </div>
                    </div>
                  </div>
                </v-card>
              </div>
            </template>
          </div>

          <!-- TAB 1: CRONOLOGIA (STORICO) -->
          <div v-show="activeTabAnalisi === 1" class="d-flex flex-column fill-height">
            <!-- Loader caricamento storico -->
            <div v-if="caricandoStorico" class="text-center py-8">
              <v-progress-circular indeterminate color="orange" size="36"></v-progress-circular>
              <p class="mt-2 text-caption text-muted">Caricamento dello storico...</p>
            </div>
            
            <div v-else-if="storicoFiltrato.length === 0 && !(settimanaAttiva === 4 && isWeek4Scarico)" class="text-center py-6">
              <v-icon size="40" color="orange-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
              <p class="text-caption text-muted">Nessuna scheda passata corrispondente trovata.</p>
            </div>

            <!-- LAYOUT 1: TIMELINE (Mobile-first Cards) -->
            <div v-if="!caricandoStorico && storicoFiltrato.length > 0 && stileStorico === 'timeline'" class="d-flex flex-column gap-2.5">
              <div 
                v-for="prevEx in storicoFiltrato" 
                :key="prevEx.id" 
                class="rounded-xl border border-soft bg-slate-950 p-2.5 text-left position-relative" 
                style="cursor: pointer;" 
                @click="vaiADettaglioStorico(prevEx)"
              >
                <div 
                  class="d-flex align-center justify-space-between mb-1 px-1.5 py-1 rounded sticky-timeline-header"
                  :class="{'red-scheda-header': !soloCorrispondenti && haSettimanaCorrispondente(prevEx), 'bg-slate-900': soloCorrispondenti || !haSettimanaCorrispondente(prevEx)}"
                >
                  <span class="text-caption font-weight-black text-slate-dark uppercase" style="font-size: 0.72rem !important;">
                    Scheda {{ prevEx.num_scheda }}
                  </span>
                  <div class="d-flex align-center gap-1.5">
                    <span v-if="prevEx.dat_scheda_ult_ex || prevEx.timestamp" class="text-super-caption text-muted font-weight-bold" style="font-size: 0.58rem;">
                      {{ formattaDataStorico(getExecutionDate(prevEx, storicoEsercizio, workout)) }} <span class="text-orange-lighten-2 ml-1">({{ tempoTrascorso(getExecutionDate(prevEx, storicoEsercizio, workout)) }})</span>
                    </span>
                  </div>
                </div>

                <!-- Note statiche -->
                <div class="text-super-caption text-muted mb-1.5 italic" style="font-size: 0.62rem !important; line-height: 1.25;">
                  <span v-if="prevEx.des_giorno" class="font-weight-black text-orange-lighten-2 mr-1">Giorno {{ prevEx.des_giorno }}{{ prevEx.num_riga_giorno }}</span>
                  <span v-if="(prevEx.des_note_attrezzo || prevEx.des_note) && String(prevEx.des_note_attrezzo || prevEx.des_note).trim()">
                    • Note: {{ prevEx.des_note_attrezzo || prevEx.des_note }}
                  </span>
                </div>

                <!-- Griglia dei carichi -->
                <v-row dense class="mt-1 bg-slate-900 rounded-lg pa-1.5 mx-0 align-center text-center">
                  <v-col v-for="w in [1, 2, 3, 4, 5, 6]" :key="w" cols="4" class="py-0.5">
                    <div 
                      class="border-soft rounded py-0.5 px-0.5" 
                      :class="{
                        'border-right': w !== 3 && w !== 6,
                        'timeline-red-cell': isMatchingReps(prevEx, w)
                      }"
                      :style="{ opacity: (soloCorrispondenti && !isMatchingReps(prevEx, w)) ? 0.45 : 1.0 }"
                    >
                      <span class="text-super-caption text-muted font-weight-bold d-block uppercase" style="font-size: 0.48rem; line-height: 1;">W{{ w }}</span>
                      <span class="table-prescription-text text-super-caption font-weight-medium d-block text-truncate px-0.5" style="font-size: 0.6rem; line-height: 1;">
                        {{ prevEx['des_week' + w] ? (parsedPrescription(prevEx['des_week' + w])?.reps || prevEx['des_week' + w]) : 'N.D.' }}
                      </span>
                      <strong 
                        class="font-weight-black d-block mt-1" 
                        style="font-size: 0.95rem; line-height: 1;" 
                        :style="getInsWeekTextStyle(prevEx, w)"
                        v-html="formattaInsWeekHtml(prevEx['ins_week' + w]) || '-'"
                      ></strong>
                      <span v-if="w === 6 && prevEx.num_faticaw6" class="text-super-caption font-weight-bold d-block mt-0.5" style="font-size: 0.50rem; line-height: 1;" :style="getColoreFaticaStyle(prevEx.num_faticaw6)">
                        {{ prevEx.num_faticaw6 }}
                      </span>
                    </div>
                  </v-col>
                </v-row>

              </div>
            </div>

            <!-- LAYOUT 2: TABELLA MATRICE -->
            <div v-else-if="!caricandoStorico && storicoFiltrato.length > 0 && stileStorico === 'tabella'" ref="storicoTableContainer" class="table-responsive-wrapper rounded-xl border border-soft overflow-x-auto scrollbar-hidden">
              <table class="premium-storico-table" style="width: 1740px; table-layout: fixed; border-collapse: collapse;">
                <thead>
                  <tr>
                    <th class="sticky-col header-cell text-left" style="width: 75px;">Scheda</th>
                    <th v-for="w in [1, 2, 3, 4, 5, 6]" :key="w" class="header-cell" style="width: 110px;" :class="{'bg-orange-darken-4': w === settimanaAttiva}" :style="{ opacity: (soloCorrispondenti && getRepsPerWeek(w) !== targetRepsRange) ? 0.45 : 1.0 }">
                      <div class="table-header-title font-weight-bold">W{{ w }}</div>
                    </th>
                    <th class="header-cell text-amber-lighten-1" style="width: 80px;">Miglior W6</th>
                    <th class="header-cell" style="width: 75px;">Peso Corp.</th>
                    <th class="header-cell" style="width: 110px;">Giorno</th>
                    <th class="header-cell" style="width: 250px;">Note</th>
                    <th class="header-cell" style="width: 200px;">Note Attrezzo</th>
                    <th class="header-cell" style="width: 200px;">Note Gen. Attrezzo</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="prevEx in storicoFiltrato" :key="prevEx.id" class="table-row" style="cursor: pointer;" @click="vaiADettaglioStorico(prevEx)">
                    <td class="sticky-col body-cell text-left" :class="{'red-scheda-cell': !soloCorrispondenti && haSettimanaCorrispondente(prevEx)}">
                      <div class="table-scheda-title font-weight-black" style="font-size: 0.75rem; line-height: 1.15;">S. {{ prevEx.num_scheda }}</div>
                      <div v-if="prevEx.dat_scheda_ult_ex || prevEx.timestamp" class="text-super-caption text-muted" style="font-size: 0.55rem; white-space: nowrap; line-height: 1.15; margin-top: 1px;">
                        {{ formattaDataStorico(getExecutionDate(prevEx, storicoEsercizio, workout)) }}
                      </div>
                      <div v-if="prevEx.dat_scheda_ult_ex || prevEx.timestamp" class="text-orange-lighten-2 font-weight-bold" style="font-size: 0.52rem; white-space: nowrap; line-height: 1.1; margin-top: 1px;">
                        {{ tempoTrascorso(getExecutionDate(prevEx, storicoEsercizio, workout)) }}
                      </div>
                    </td>
                    
                    <td v-for="w in [1, 2, 3, 4, 5, 6]" :key="w" class="body-cell font-weight-bold text-center" :class="{'red-cell': isMatchingReps(prevEx, w)}" style="word-wrap: break-word;" :style="{ opacity: (soloCorrispondenti && !isMatchingReps(prevEx, w)) ? 0.45 : 1.0 }">
                      <div v-if="prevEx['des_week' + w]" class="table-prescription-text text-super-caption font-weight-medium" style="font-size: 0.65rem; line-height: 1;">
                        {{ parsedPrescription(prevEx['des_week' + w])?.reps || prevEx['des_week' + w] }}
                      </div>
                      <div 
                        class="font-weight-black mt-1" 
                        style="font-size: 0.9rem; line-height: 1.1; letter-spacing: -0.02em;" 
                        :style="getInsWeekTextStyle(prevEx, w)"
                        v-html="formattaInsWeekHtml(prevEx['ins_week' + w]) || '-'"
                      ></div>
                      <div v-if="w === 6 && prevEx.num_faticaw6" class="text-super-caption font-weight-bold mt-0.5" style="font-size: 0.55rem; line-height: 1.1;" :style="getColoreFaticaStyle(prevEx.num_faticaw6)">
                        {{ prevEx.num_faticaw6 }}
                      </div>
                    </td>
                    
                    <td class="body-cell font-weight-black text-center" style="font-size: 1rem; word-wrap: break-word; border-left: 1px solid rgba(255,255,255,0.1);" :style="getW6BestColorStyle(prevEx)">
                      {{ prevEx.num_ins6 ? (isCorpoLiberoEsercizio(workout) ? (String(prevEx.num_ins6).toLowerCase().endsWith('r') ? prevEx.num_ins6 : prevEx.num_ins6 + 'r') : (String(prevEx.num_ins6).toLowerCase().includes('kg') ? prevEx.num_ins6 : prevEx.num_ins6 + ' kg')) : '-' }}
                    </td>
                    <td class="body-cell text-center" style="font-size: 0.7rem; word-wrap: break-word;">{{ prevEx.peso_corporeo || '-' }}</td>
                    <td class="body-cell font-weight-medium text-center" style="font-size: 0.7rem; word-wrap: break-word;">{{ prevEx.des_giorno }}{{ prevEx.num_riga_giorno }}</td>
                    <td class="body-cell text-left note-cell" style="font-size: 0.68rem; word-wrap: break-word;" :title="prevEx.des_note_attrezzo || ''">{{ prevEx.des_note_attrezzo || '-' }}</td>
                    <td class="body-cell text-left note-cell" style="font-size: 0.68rem; word-wrap: break-word;" :title="prevEx.des_note_gen_attr || ''">{{ prevEx.des_note_gen_attr || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- LAYOUT 3: GRAFICO DELLE PROGRESSIONI -->
            <div v-else-if="!caricandoStorico && storicoFiltrato.length > 0 && stileStorico === 'grafico'" class="d-flex flex-column gap-3 py-1">
              <!-- Se l'esercizio NON è V%, mostra i selettori standard A/B/C e Raggruppamento Reps -->
              <template v-if="!isEsercizioVPercentuale">
                <!-- Selettore Modalità Grafico -->
                <div class="text-left">
                  <span class="text-super-caption text-muted font-weight-black uppercase d-block mb-1.5" style="font-size: 0.55rem; letter-spacing: 0.05em;">Modalità Grafico (Tutte le Reps)</span>
                  <v-btn-toggle
                    v-model="modeGraficoStorico"
                    mandatory
                    selected-class="bg-orange-darken-3 text-white"
                    density="compact"
                    rounded="xl"
                    class="card-glass border w-100"
                    style="height: 32px;"
                  >
                    <v-btn value="A" class="flex-grow-1 font-weight-black text-none" style="font-size: 0.65rem; min-height: 30px;">
                      A: Linee + 1RM
                    </v-btn>
                    <v-btn value="B" class="flex-grow-1 font-weight-black text-none" style="font-size: 0.65rem; min-height: 30px;">
                      B: Punti + 1RM
                    </v-btn>
                    <v-btn value="C" class="flex-grow-1 font-weight-black text-none" style="font-size: 0.65rem; min-height: 30px;">
                      C: Linea Unica
                    </v-btn>
                  </v-btn-toggle>
                </div>

                <!-- Selettore Raggruppamento Reps -->
                <div class="text-left">
                  <span class="text-super-caption text-muted font-weight-black uppercase d-block mb-1.5" style="font-size: 0.55rem; letter-spacing: 0.05em;">Raggruppamento Reps</span>
                  <v-btn-toggle
                    v-model="raggruppamentoReps"
                    mandatory
                    selected-class="bg-orange-darken-3 text-white"
                    density="compact"
                    rounded="xl"
                    class="card-glass border w-100"
                    style="height: 32px;"
                  >
                    <v-btn value="esatto" class="flex-grow-1 font-weight-black text-none" style="font-size: 0.65rem; min-height: 30px;">
                      Esatto
                    </v-btn>
                    <v-btn value="zone" class="flex-grow-1 font-weight-black text-none" style="font-size: 0.65rem; min-height: 30px;">
                      Zone
                    </v-btn>
                    <v-btn value="fasce" class="flex-grow-1 font-weight-black text-none" style="font-size: 0.65rem; min-height: 30px;">
                      Fasce (3r)
                    </v-btn>
                  </v-btn-toggle>
                </div>

                <!-- Filtro Reps (Multi-selezione) -->
                <div v-if="availableBuckets.length > 0" class="text-left">
                  <div class="d-flex align-center justify-space-between mb-1.5">
                    <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.55rem; letter-spacing: 0.05em;">Filtra Reps</span>
                    <v-btn 
                      variant="text" 
                      color="orange-lighten-2" 
                      class="px-1 py-0 text-none font-weight-black" 
                      style="font-size: 0.58rem; height: 16px; min-width: auto;"
                      @click="toggleAllBuckets"
                    >
                      {{ selectedBuckets.length === availableBuckets.length ? 'Deseleziona Tutti' : 'Seleziona Tutti' }}
                    </v-btn>
                  </div>
                  <div class="d-flex align-center gap-1.5 overflow-x-auto pb-1 scrollbar-hidden" style="white-space: nowrap;">
                    <v-chip
                      v-for="b in availableBuckets"
                      :key="b"
                      :color="selectedBuckets.includes(b) ? 'orange-darken-3' : 'grey-lighten-1'"
                      :variant="selectedBuckets.includes(b) ? 'flat' : 'tonal'"
                      size="x-small"
                      class="font-weight-black px-2 py-0.5"
                      style="cursor: pointer; height: 22px; font-size: 0.62rem;"
                      @click="toggleBucketFilter(b)"
                    >
                      {{ b }}
                    </v-chip>
                  </div>
                </div>
              </template>

              <!-- Se l'esercizio È V%, mostra scheda esplicativa dedicata Reale vs Teorico -->
              <template v-else>
                <div class="pa-3 rounded-xl border text-left position-relative overflow-hidden" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.14) 0%, rgba(6, 182, 212, 0.08) 100%); border-color: rgba(249, 115, 22, 0.3) !important;">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <div class="d-flex align-center gap-1.5">
                      <v-icon color="orange-lighten-2" size="18">mdi-chart-bell-curve-cumulative</v-icon>
                      <span class="text-caption font-weight-black text-orange-lighten-2 uppercase" style="font-size: 0.72rem; letter-spacing: 0.03em;">
                        GRAFICO PROGRESSIONE V%: REALE vs TEORICO
                      </span>
                    </div>
                    <v-chip color="orange-darken-3" size="x-small" class="font-weight-black text-white px-2" variant="flat" style="font-size: 0.58rem; height: 18px;">
                      V% PERCENTUALE
                    </v-chip>
                  </div>
                  <p class="text-super-caption text-slate-300 font-weight-medium mb-2" style="font-size: 0.64rem; line-height: 1.35;">
                    Esercizio a percentuale con progressioni prescritte. Il grafico mette in confronto diretto il <strong>Massimale Teorico Target (1RMT)</strong> di partenza con il <strong>Massimale Reale Effettivo (e1RM)</strong> raggiunto nelle sessioni.
                  </p>

                  <!-- Micro Statistiche V% -->
                  <div v-if="vPercStats" class="d-flex align-center gap-2 pt-1 border-top" style="border-color: rgba(255, 255, 255, 0.08) !important;">
                    <div class="pa-1.5 rounded-lg bg-black/40 flex-grow-1 border border-cyan-500/20 text-center">
                      <span class="text-super-caption text-cyan-lighten-3 font-weight-bold d-block uppercase" style="font-size: 0.52rem;">1RM Teorico Target</span>
                      <span class="text-caption font-weight-black text-cyan-lighten-2" style="font-size: 0.82rem;">{{ vPercStats.rmtBase }} kg</span>
                    </div>
                    <div class="pa-1.5 rounded-lg bg-black/40 flex-grow-1 border border-orange-500/20 text-center">
                      <span class="text-super-caption text-orange-lighten-3 font-weight-bold d-block uppercase" style="font-size: 0.52rem;">1RM Reale Massimo</span>
                      <span class="text-caption font-weight-black text-orange-lighten-2" style="font-size: 0.82rem;">{{ vPercStats.bestReale }} kg</span>
                    </div>
                    <div class="pa-1.5 rounded-lg bg-black/40 flex-grow-1 border text-center" :class="String(vPercStats.diffKg).startsWith('+') ? 'border-green-500/20' : 'border-red-500/20'">
                      <span class="text-super-caption font-weight-bold d-block uppercase" :class="String(vPercStats.diffKg).startsWith('+') ? 'text-green-lighten-3' : 'text-red-lighten-3'" style="font-size: 0.52rem;">Scostamento</span>
                      <span class="text-caption font-weight-black" :class="String(vPercStats.diffKg).startsWith('+') ? 'text-green-accent-3' : 'text-red-lighten-2'" style="font-size: 0.82rem;">{{ vPercStats.diffKg }} kg ({{ vPercStats.diffPct }}%)</span>
                    </div>
                  </div>
                </div>
              </template>

              <!-- Contenitore Grafico Line -->
              <div class="bg-slate-950 border border-soft rounded-xl pa-3" style="background-color: var(--card-bg-soft) !important;">
                <div v-if="storicoChartReady" style="position: relative; height: 280px; width: 100%;">
                  <Line :data="storicoChartData" :options="storicoChartOptions" />
                </div>
                <div v-else class="text-center py-12 text-muted text-caption">
                  <v-progress-circular indeterminate color="orange" size="24" class="mb-2"></v-progress-circular>
                  <p class="mb-0">Elaborazione dati del grafico in corso...</p>
                </div>
              </div>

              <!-- Card Dettaglio Punto Selezionato -->
              <v-expand-transition>
                <div v-if="selectedPointDetails">
                  <v-card 
                    class="card-glass border text-left" 
                    style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%) !important; border-color: rgba(249, 115, 22, 0.3) !important; border-radius: 12px !important;"
                  >
                    <div class="d-flex align-center justify-space-between px-3 py-2 bg-slate-900 border-bottom">
                      <span class="text-caption font-weight-black dialog-text-primary uppercase" style="font-size: 0.72rem !important; letter-spacing: 0.02em;">
                        🔍 Dettaglio Sessione: {{ selectedPointDetails.label }}
                      </span>
                      <v-btn icon="mdi-close" variant="text" width="20" height="20" size="x-small" color="grey" @click="selectedPointDetails = null"></v-btn>
                    </div>
                    
                    <div class="pa-3 text-slate-light" style="font-size: 0.72rem; line-height: 1.45;">
                      <v-row dense class="mb-2.5 align-center text-center">
                        <v-col cols="4" class="border-right pr-2" style="border-color: rgba(255, 255, 255, 0.08) !important;">
                          <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.52rem;">Carico</span>
                          <span class="font-weight-black text-orange-lighten-2" style="font-size: 0.85rem;">
                            {{ selectedPointDetails.peso }} kg
                          </span>
                        </v-col>
                        <v-col cols="4" class="border-right px-2" style="border-color: rgba(255, 255, 255, 0.08) !important;">
                          <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.52rem;">Reps</span>
                          <span class="font-weight-black dialog-text-primary" style="font-size: 0.85rem;">
                            {{ selectedPointDetails.reps }} r
                          </span>
                        </v-col>
                        <v-col cols="4" class="pl-2">
                          <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" style="font-size: 0.52rem;">Stima 1RM</span>
                          <span class="font-weight-black text-green-accent-3" style="font-size: 0.85rem;">
                            {{ selectedPointDetails.e1rm }} kg
                          </span>
                        </v-col>
                      </v-row>
                      
                      <div class="mt-2 text-super-caption d-flex align-center gap-1.5 flex-wrap font-weight-bold" style="font-size: 0.65rem;">
                        <span v-if="selectedPointDetails.date">
                          📅 Data: <span class="dialog-text-primary">{{ formattaDataStorico(selectedPointDetails.date) }} ({{ tempoTrascorso(selectedPointDetails.date) }})</span>
                        </span>
                        <span v-if="selectedPointDetails.giorno">
                          • Giorno: <span class="dialog-text-primary">{{ selectedPointDetails.giorno }}</span>
                        </span>
                      </div>
                      
                      <!-- Note storiche -->
                      <div 
                        v-if="String(selectedPointDetails.note).trim() || String(selectedPointDetails.noteAttrezzo).trim() || String(selectedPointDetails.noteGen).trim()" 
                        class="mt-2.5 pt-2 border-top-soft"
                      >
                        <span class="text-super-caption text-muted font-weight-black uppercase d-block mb-1" style="font-size: 0.58rem;">Note registrate:</span>
                        <div v-if="String(selectedPointDetails.note).trim()" class="mb-1 text-white font-italic">
                          "{{ selectedPointDetails.note }}"
                        </div>
                        <div v-if="String(selectedPointDetails.noteAttrezzo).trim()" style="font-size: 0.65rem;" class="text-slate-dark">
                          🔧 Setup: {{ selectedPointDetails.noteAttrezzo }}
                        </div>
                        <div v-if="String(selectedPointDetails.noteGen).trim()" style="font-size: 0.65rem;" class="text-slate-dark mt-0.5">
                          ⚙️ Macchina: {{ selectedPointDetails.noteGen }}
                        </div>
                      </div>
                    </div>
                  </v-card>
                </div>
              </v-expand-transition>

              <!-- Analisi Andamento e Consigli Tecnici -->
              <div v-if="analisiAndamentoEsercizio">
                <v-card class="card-glass border text-left" :style="{ background: 'var(--card-bg-soft, #0f172a)', borderColor: 'var(--card-border, rgba(255, 255, 255, 0.08)) !important', borderRadius: '12px !important' }">
                  <div 
                    class="d-flex align-center justify-space-between px-3 py-2 clickable-item" 
                    style="cursor: pointer; min-height: 36px;"
                    :style="{ background: 'var(--card-bg-soft, #0f172a)' }"
                    @click="showAnalisiAndamento = !showAnalisiAndamento"
                  >
                    <div class="d-flex align-center gap-2">
                      <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" size="16">mdi-google-analytics</v-icon>
                      <span class="text-caption font-weight-black dialog-text-primary uppercase" style="font-size: 0.72rem !important; letter-spacing: 0.02em;">
                        Analisi Progressioni & Consigli
                      </span>
                    </div>
                    <div class="d-flex align-center gap-2">
                      <v-chip 
                        :color="analisiAndamentoEsercizio.badgeColor" 
                        size="x-small" 
                        class="font-weight-black text-white uppercase px-1.5"
                        style="height: 18px; font-size: 0.55rem; border-radius: 4px;"
                        variant="flat"
                      >
                        {{ analisiAndamentoEsercizio.badgeText }}
                      </v-chip>
                      <v-icon size="16" color="grey">{{ showAnalisiAndamento ? 'mdi-chevron-up' : 'mdi-chevron-down' }}</v-icon>
                    </div>
                  </div>
                  
                  <v-expand-transition>
                    <div v-show="showAnalisiAndamento" class="pa-3 border-top-soft" style="font-size: 0.72rem; line-height: 1.45;">
                      <!-- Giudizio -->
                      <div class="mb-3 d-flex align-start gap-2">
                        <span style="font-size: 1.15rem; line-height: 1;">📊</span>
                        <div>
                          <strong class="dialog-text-primary">Giudizio sull'Andamento:</strong>
                          <p class="mb-0 mt-0.5" :style="{ color: 'var(--text-slate, #64748b)' }" v-html="renderMarkdownBold(analisiAndamentoEsercizio.giudizio)"></p>
                        </div>
                      </div>
                      
                      <!-- Consigli -->
                      <div class="mb-3 d-flex align-start gap-2">
                        <span style="font-size: 1.15rem; line-height: 1;">💡</span>
                        <div>
                          <strong :style="{ color: 'var(--theme-primary, #f97316)' }">Consigli Tecnici:</strong>
                          <p class="mb-0 mt-0.5" :style="{ color: 'var(--text-slate, #64748b)' }">{{ analisiAndamentoEsercizio.consigli }}</p>
                        </div>
                      </div>
                      
                      <!-- Record per fascia -->
                      <div v-if="analisiAndamentoEsercizio.records.length > 0" class="pt-2.5 border-top-soft">
                        <strong class="dialog-text-primary uppercase font-weight-black d-block mb-2" style="font-size: 0.58rem; letter-spacing: 0.05em;">
                          Migliori Prestazioni Registrate per Fascia:
                        </strong>
                        <div class="d-flex flex-column gap-1.5">
                          <div 
                            v-for="rec in analisiAndamentoEsercizio.records" 
                            :key="rec.bucket"
                            class="d-flex align-center justify-space-between rounded px-2.5 py-1.5 border border-soft"
                            :style="{ background: 'var(--card-bg-glass, #020617)', borderColor: 'var(--card-border, rgba(255, 255, 255, 0.05))' }"
                          >
                            <div>
                              <span class="font-weight-black" :style="{ color: 'var(--theme-primary, #f97316)' }">{{ rec.bucket }}</span>
                              <span class="text-super-caption ml-2 font-weight-bold" :style="{ color: 'var(--text-slate, #64748b)' }">({{ rec.label }})</span>
                            </div>
                            <div class="font-weight-black dialog-text-primary">
                              {{ rec.maxPeso }} kg <span class="text-super-caption font-weight-bold" :style="{ color: 'var(--text-slate, #64748b)' }" v-if="rec.date">• {{ tempoTrascorso(rec.date) }}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </v-expand-transition>
                </v-card>
              </div>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top gap-2" :style="{ background: 'var(--card-bg-dark, #0f172a)' }">
          <v-btn variant="flat" block rounded="lg" size="small" class="font-weight-bold text-white" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316)) !important' }" @click="dialogStorico = false">
            Chiudi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog 4: Esercizi dello Stesso Gruppo Muscolare (Settore Principale) -->
    <v-dialog v-model="dialogSettore" max-width="650" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="pa-3 py-2 border-bottom d-flex align-center justify-space-between bg-slate-900">
          <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
            <v-icon color="orange-darken-3" size="18">mdi-format-list-bulleted</v-icon>
            <span class="font-weight-black text-white text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
              Gruppo: {{ settoreSelezionatoNome }}
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="dialogSettore = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-3 scrollbar-custom" style="max-height: 60vh;">
          <!-- Loader caricamento settore -->
          <div v-if="caricandoSettore" class="text-center py-8">
            <v-progress-circular indeterminate color="orange" size="36"></v-progress-circular>
            <p class="mt-2 text-caption text-muted">Caricamento esercizi...</p>
          </div>

          <div v-else-if="eserciziSettore.length === 0" class="text-center py-6">
            <v-icon size="40" color="orange-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
            <p class="text-caption text-muted">Nessun esercizio trovato per questo gruppo.</p>
          </div>

          <!-- Lista degli esercizi del settore -->
          <div v-else class="d-flex flex-column gap-2.5">
            <div
              v-for="ex in eserciziSettore"
              :key="ex.id"
              class="connected-exercise-item d-flex align-center py-2 px-3 clickable-item border rounded-xl"
              :class="ex.id === workout?.id ? 'week-active-border border-orange-darken-3-op' : 'border-soft bg-slate-950'"
              @click="vaiAdEsercizioSettore(ex.id)"
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
                <div class="text-caption font-weight-black text-white text-truncate" style="font-size: 0.82rem !important; line-height: 1.2;">
                  {{ ex.des_esercizio }}
                  <v-icon v-if="ex.flg_video === 'true' || ex.flg_video === true" color="orange" size="14" class="ml-1" title="Video richiesto">mdi-video</v-icon>
                </div>
                <div class="text-super-caption text-muted font-weight-bold mt-0.5" style="font-size: 0.65rem;">
                  Giorno <span class="text-orange-lighten-2 font-weight-black">{{ ex.des_giorno }}{{ ex.num_riga_giorno }}</span>
                  <span
                    v-if="ex.des_settore && (ex.des_settore === settoreSecondarioTarget || ex.des_settore !== settoreSelezionatoNome)"
                    :class="{
                      'text-orange-accent-4 font-weight-black': ex.des_settore === settoreSecondarioTarget,
                      'text-orange-lighten-2': ex.des_settore !== settoreSecondarioTarget
                    }"
                    :style="ex.des_settore === settoreSecondarioTarget ? 'color: #ff6d00 !important; font-size: 0.68rem;' : ''"
                  >
                     ({{ ex.des_settore }})
                  </span>
                </div>
                <div class="text-super-caption font-weight-black mt-1" :class="ex.id === workout?.id ? 'text-orange-lighten-2' : 'text-slate'" style="font-size: 0.72rem;">
                  {{ ex['des_week' + settimanaAttiva] || ex.des_qta_report || 'N.D.' }}
                </div>
              </div>
              <v-icon size="18" :color="ex.id === workout?.id ? 'orange-darken-3' : 'grey'">mdi-chevron-right</v-icon>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top bg-slate-900 gap-2">
          <v-btn color="orange-darken-3" variant="flat" block rounded="lg" size="small" class="font-weight-bold text-white" @click="dialogSettore = false">
            Chiudi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog per GIF a tutto schermo -->
    <v-dialog v-model="dialogGifFullScreen" max-width="95vw" max-height="95vh">
      <v-card class="bg-black border-0 rounded-2xl position-relative d-flex justify-center align-center overflow-hidden" style="height: 100%; max-height: 95vh;">
        <v-btn
          icon="mdi-close"
          variant="flat"
          color="rgba(0,0,0,0.6)"
          size="small"
          class="position-absolute text-white"
          style="top: 10px; right: 10px; z-index: 10;"
          @click="dialogGifFullScreen = false"
        ></v-btn>
        <v-img
          :src="getGifUrl(workout?.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600'"
          alt="Esercizio Full Screen"
          contain
          style="max-height: 90vh; width: 100%; max-width: 100%; cursor: pointer;"
          @click="dialogGifFullScreen = false"
        ></v-img>
      </v-card>
    </v-dialog>

    <!-- Dialog per Segnalazione Infortunio / Fastidio (Premium Glassmorphism Style) -->
    <v-dialog v-model="dialogInfortunio" max-width="450" rounded="xl">
      <v-card class="card-glass border border-soft text-slate-dark rounded-xl elevation-24" style="background: rgba(15, 23, 42, 0.93) !important; backdrop-filter: blur(15px); border: 1.5px solid rgba(255,255,255,0.08) !important;">
        <v-card-title class="font-weight-black d-flex align-center justify-space-between pt-3 pb-1.5 border-bottom-soft" style="border-color: rgba(255,255,255,0.08) !important;">
          <div class="d-flex align-center gap-1.5">
            <v-icon color="red-lighten-2" size="small">mdi-bandage</v-icon>
            <span style="font-size: 0.92rem; letter-spacing: 0.02em;" class="text-white">Segnala Fastidio / Infortunio</span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialogInfortunio = false" color="white" style="width: 28px; height: 28px;"></v-btn>
        </v-card-title>
        
        <v-card-text class="pt-3 pb-2 px-4" style="font-size: 0.72rem;">
          <p class="text-slate-light mb-3" style="color: rgba(255,255,255,0.65) !important; font-size: 0.70rem !important; line-height: 1.3;">
            Registra un problema articolare riscontrato in questo esercizio. Il sistema applicherà automaticamente una riduzione del 20% sul carico consigliato per proteggerti.
          </p>

          <!-- Articolazione Coinvolta -->
          <div class="mb-3 text-left">
            <span class="font-weight-black d-block mb-1 text-white" style="font-size: 0.70rem; opacity: 0.9;">Articolazione / Zona coinvolta *</span>
            <v-chip-group
              v-model="infortunioArticolazione"
              column
              mandatory
              color="red-lighten-2"
              selected-class="font-weight-black text-white bg-red-darken-3"
            >
              <v-chip
                v-for="art in listaArticolazioni"
                :key="art"
                :value="art"
                size="x-small"
                variant="outlined"
                class="rounded-lg text-white"
                style="border-color: rgba(255,255,255,0.2) !important; font-size: 0.65rem;"
              >
                {{ art }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Intensità Dolore/Fastidio (Scala 1-10) -->
          <div class="mb-3 text-left">
            <div class="d-flex justify-space-between align-center mb-0.5">
              <span class="font-weight-black text-white" style="font-size: 0.70rem; opacity: 0.9;">Intensità Dolore / Fastidio (1-10) *</span>
              <v-chip
                :color="infortunioGravita <= 3 ? 'green' : (infortunioGravita <= 7 ? 'amber-darken-2' : 'red-darken-2')"
                size="x-small"
                class="font-weight-black text-white px-1.5"
                variant="flat"
                style="height: 16px; font-size: 0.58rem;"
              >
                {{ infortunioGravita }}/10 - {{ infortunioGravita <= 3 ? 'Lieve' : (infortunioGravita <= 7 ? 'Mod.' : 'Acuto') }}
              </v-chip>
            </div>
            <v-chip-group
              v-model="infortunioGravita"
              column
              mandatory
              color="red-lighten-2"
              selected-class="font-weight-black text-white bg-red-darken-3"
            >
              <v-chip
                v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]"
                :key="num"
                :value="num"
                size="x-small"
                variant="outlined"
                class="rounded-lg text-white"
                style="min-width: 26px; justify-content: center; border-color: rgba(255,255,255,0.2) !important; font-size: 0.65rem; height: 22px;"
              >
                {{ num }}
              </v-chip>
            </v-chip-group>
          </div>

          <!-- Note/Dettagli dell'infortunio -->
          <div class="text-left mb-2">
            <span class="font-weight-black d-block mb-1 text-white" style="font-size: 0.70rem; opacity: 0.9;">Dettagli / Note aggiuntive</span>
            <v-textarea
              v-model="infortunioNote"
              placeholder="Descrivi cosa hai avvertito..."
              variant="outlined"
              density="compact"
              rows="2"
              rounded="lg"
              hide-details
              color="red-lighten-2"
              theme="dark"
              class="text-white text-caption"
              style="background: rgba(0,0,0,0.2); font-size: 0.72rem;"
            ></v-textarea>
          </div>
        </v-card-text>

        <v-card-actions class="px-4 pb-3 pt-1 justify-end gap-2 border-top-soft" style="border-color: rgba(255,255,255,0.08) !important;">
          <v-btn
            variant="text"
            color="white"
            class="font-weight-bold text-none rounded-lg text-white"
            size="small"
            style="font-size: 0.72rem;"
            @click="dialogInfortunio = false"
            :disabled="salvataggioInfortunio"
          >
            Annulla
          </v-btn>
          <v-btn
            variant="flat"
            color="red-darken-3"
            class="font-weight-black text-none rounded-lg px-3 text-white"
            size="small"
            style="font-size: 0.72rem;"
            @click="confermaSegnalazioneInfortunio"
            :loading="salvataggioInfortunio"
          >
            Salva Segnalazione
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Dettaglio Livello Forza Premium -->
    <v-dialog v-model="dialogLivelloForza" max-width="480" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border text-left" style="background: var(--card-bg-dark) !important; border-color: var(--card-border) !important; backdrop-filter: blur(25px) !important;">
        <v-card-title class="font-weight-black text-orange-darken-3 d-flex align-center justify-space-between px-0 mb-3 border-bottom-soft" style="padding-bottom: 12px !important;">
          <div class="d-flex align-center">
            <v-icon color="orange-darken-3" class="mr-2" size="24">mdi-sword-cross</v-icon>
            <span class="text-slate-dark" style="font-size: 1rem; letter-spacing: 0.05em;">DETTAGLIO LIVELLO FORZA</span>
          </div>
          <v-btn icon size="small" variant="text" class="text-slate-dark" @click="dialogLivelloForza = false" style="width: 28px; height: 28px;">
            <v-icon size="16">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <div v-if="parsedRmt(workout?.des_esercizio_2)" class="text-left">
          <!-- Livello Corrente Header -->
          <div class="d-flex align-center justify-space-between mb-4 pa-3 rounded-xl card-glass border-soft" style="background: var(--card-bg-soft) !important;">
            <div>
              <span class="text-super-caption text-muted font-weight-black uppercase d-block" style="font-size: 0.58rem;">Livello Attuale</span>
              <div class="d-flex align-center gap-1 mt-1">
                <v-chip
                  :color="parsedRmt(workout.des_esercizio_2).livelloColore"
                  size="x-small"
                  class="font-weight-black uppercase px-2 text-white"
                  variant="flat"
                  style="letter-spacing: 0.05em; height: 20px;"
                >
                  {{ parsedRmt(workout.des_esercizio_2).livelloTesto }}
                </v-chip>
                <div class="d-flex align-center gap-0.5 ml-1.5">
                  <v-icon v-for="i in parsedRmt(workout.des_esercizio_2).stelle" :key="i" color="amber-darken-2" size="14">
                    mdi-star
                  </v-icon>
                </div>
              </div>
            </div>
            <div class="text-right">
              <span class="text-super-caption text-muted font-weight-black uppercase d-block" style="font-size: 0.58rem;">Massimale (1RMT)</span>
              <span class="text-subtitle-1 font-weight-black text-slate-dark mt-1 d-block" style="line-height: 1;">
                {{ parsedRmt(workout.des_esercizio_2).massimale }} <span class="text-caption text-muted" style="font-size: 0.68rem;">KG</span>
              </span>
            </div>
          </div>

          <!-- Discorso di Congratulazioni e Motivazione -->
          <div class="mb-4">
            <div class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-1.5" style="font-size: 0.88rem;">
              {{ getStrengthGreeting(parsedRmt(workout.des_esercizio_2).livelloTesto) }}
            </div>
            <p class="text-body-2 text-slate-light" style="line-height: 1.5; font-size: 0.78rem;">
              {{ getStrengthSpeech(parsedRmt(workout.des_esercizio_2)) }}
            </p>
          </div>

          <!-- Analisi Variazione Mesociclo Precedente -->
          <div 
            v-if="parsedRmt(workout.des_esercizio_2).variazione" 
            class="pa-3 mb-4 rounded-xl border" 
            :style="{ 
              background: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? 'linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04))' : 'linear-gradient(135deg, rgba(16, 185, 129, 0.12), rgba(16, 185, 129, 0.04))', 
              borderColor: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? 'rgba(239, 68, 68, 0.25)' : 'rgba(16, 185, 129, 0.25)'
            }"
          >
            <div class="d-flex align-start gap-2.5">
              <v-icon 
                :color="parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? 'red-lighten-2' : 'green-lighten-2'"
                size="18"
                class="flex-shrink-0 mt-0.5"
              >
                {{ parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? 'mdi-trending-down' : 'mdi-trending-up' }}
              </v-icon>
              <div>
                <span class="text-super-caption font-weight-black uppercase d-block" style="font-size: 0.58rem;" :style="{ color: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? 'var(--variation-red-color, #dc2626)' : 'var(--variation-green-color, #059669)' }">
                  Andamento Mesociclo Precedente
                </span>
                <span class="text-body-2 text-slate-light mt-1 d-block" style="font-size: 0.76rem; line-height: 1.45;">
                  {{ getVariationExplanation(parsedRmt(workout.des_esercizio_2)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Progresso al Prossimo Livello -->
          <div class="pa-3 rounded-xl card-glass border-soft" style="background: var(--card-bg-soft) !important;">
            <div class="d-flex justify-space-between align-center mb-1.5">
              <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.58rem;">Progresso al Prossimo Livello</span>
              <span class="text-super-caption text-amber-darken-2 font-weight-black" style="font-size: 0.58rem;">
                {{ getRmtProgress(parsedRmt(workout.des_esercizio_2)) }}%
              </span>
            </div>
            <v-progress-linear
              :model-value="getRmtProgress(parsedRmt(workout.des_esercizio_2))"
              color="amber-darken-2"
              height="6"
              rounded
              striped
              active
              class="elevation-1 mb-2"
            ></v-progress-linear>
            <div class="text-super-caption text-muted font-weight-bold" style="font-size: 0.65rem; line-height: 1.3;">
              {{ getNextLevelRequirement(parsedRmt(workout.des_esercizio_2)) }}
            </div>
          </div>
        </div>

        <v-card-actions class="px-0 pt-4 pb-0 mt-2">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="dialogLivelloForza = false" class="text-white font-weight-black text-none" height="42" style="font-size: 0.85rem;">
            Continua a Spingere! ⚡
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Bottom Sheet Gestione Fastidio/Infortunio (Premium & Touch Friendly - 1A, 2A, 3A, 3C, 4A) -->
    <v-dialog v-model="dialogFastidio" max-width="500" transition="dialog-bottom-transition">
      <v-card class="card-glass border border-soft rounded-t-xl rounded-b-xl pa-4 text-left">
        <div class="d-flex align-center justify-space-between mb-3 border-bottom-soft pb-2">
          <span class="font-weight-black text-subtitle-1 text-slate-dark d-flex align-center gap-2">
            <v-icon color="red-lighten-2">mdi-bandage</v-icon>
            {{ (fastidioSelezionato && !mostraModificaDirettaForm) ? 'Gestisci Fastidio / Infortunio' : (fastidioSelezionato ? 'Modifica Fastidio' : 'Segnala Fastidio') }}
          </span>
          <v-btn icon="mdi-close" variant="text" size="small" @click="dialogFastidio = false"></v-btn>
        </div>

        <!-- Vista 1: Gestione Infortunio Esistente -->
        <div v-if="fastidioSelezionato && !mostraModificaDirettaForm" class="mb-2">
          <div class="pa-3 rounded-xl border border-soft mb-4" style="background: rgba(239, 68, 68, 0.08);">
            <div class="d-flex align-center justify-space-between mb-1">
              <strong class="text-subtitle-1 font-weight-black text-slate-dark">{{ fastidioSelezionato.articolazione_coinvolta }}</strong>
              <v-chip size="x-small" color="red-darken-2" class="font-weight-black text-white" variant="flat">
                Dolore: {{ fastidioSelezionato.gravita }}/10
              </v-chip>
            </div>
            <p v-if="fastidioSelezionato.note" class="text-caption text-slate italic mb-0">
              "{{ fastidioSelezionato.note }}"
            </p>
          </div>

          <!-- Pulsanti Modale Fastidio/Infortunio (Più compatti e separati) -->
          <div class="d-flex flex-column gap-2.5 mb-2" style="gap: 10px !important;">
            <v-btn
              v-if="ghostSbloccato"
              block
              color="orange-darken-3"
              variant="flat"
              class="font-weight-black text-none rounded-lg text-white"
              height="36"
              style="font-size: 0.75rem;"
              @click="ghostSbloccato = false; dialogFastidio = false;"
            >
              🛡️ Applica Riduzione Carico Proposta (-{{ fastidioSelezionato.percentuale_riduzione ?? 20 }}%)
            </v-btn>
            <v-btn
              v-else
              block
              color="blue-grey-darken-3"
              variant="flat"
              class="font-weight-black text-none rounded-lg text-white"
              height="36"
              style="font-size: 0.75rem;"
              @click="ghostSbloccato = true; dialogFastidio = false;"
            >
              🔓 Sblocca / Usa Peso Originale (100%)
            </v-btn>

            <v-btn
              block
              color="orange-lighten-2"
              variant="outlined"
              class="font-weight-black text-none rounded-lg"
              height="36"
              style="font-size: 0.75rem;"
              @click="inviaAFormModificaFastidio"
            >
              ✏️ Modifica Gravità / Note / % Riduzione
            </v-btn>

            <v-btn
              block
              color="green-darken-2"
              variant="flat"
              class="font-weight-black text-none rounded-lg text-white"
              height="36"
              style="font-size: 0.75rem;"
              @click="risolviInfortunioEChiudi(fastidioSelezionato.id)"
            >
              ✅ Segna come Guarito / Risolto
            </v-btn>

            <v-btn
              block
              color="red-darken-4"
              variant="tonal"
              class="font-weight-black text-none rounded-lg text-red-lighten-2"
              height="36"
              style="font-size: 0.75rem;"
              @click="apriConfermaEliminaDettaglio(fastidioSelezionato.id)"
            >
              🗑️ Elimina Definitivamente
            </v-btn>
          </div>
        </div>

        <!-- Vista 2: Form Inserimento / Modifica Fastidio (1A, 3A, 3C) -->
        <div v-else class="mb-2">
          <!-- Zona -->
          <div class="mb-3">
            <span class="text-caption font-weight-black d-block mb-1 text-slate-dark">Zona Interessata *</span>
            <v-chip-group v-model="formFastidioArticolazione" column mandatory color="red-lighten-2" selected-class="font-weight-black text-white bg-red-darken-3">
              <v-chip v-for="art in listaArticolazioniLocal" :key="art" :value="art" size="small" variant="outlined" class="rounded-lg">{{ art }}</v-chip>
            </v-chip-group>
          </div>

          <!-- Gravità (1-10) -->
          <div class="mb-3">
            <div class="d-flex justify-space-between align-center mb-1">
              <span class="text-caption font-weight-black text-slate-dark">Intensità Fastidio (1-10) *</span>
              <v-chip :color="formFastidioGravita <= 3 ? 'green' : (formFastidioGravita <= 7 ? 'amber-darken-2' : 'red-darken-2')" size="x-small" class="font-weight-black text-white" variant="flat">
                {{ formFastidioGravita }}/10 - {{ formFastidioGravita <= 2 ? 'Lievissimo' : (formFastidioGravita <= 4 ? 'Lieve' : (formFastidioGravita <= 7 ? 'Moderato' : 'Acuto / Stop')) }}
              </v-chip>
            </div>
            <v-chip-group v-model="formFastidioGravita" column mandatory color="red-lighten-2" selected-class="font-weight-black text-white bg-red-darken-3" @update:model-value="onFormFastidioGravitaChange">
              <v-chip v-for="num in [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]" :key="num" :value="num" size="small" variant="outlined" class="rounded-lg px-2" style="min-width: 32px; justify-content: center;">{{ num }}</v-chip>
            </v-chip-group>
          </div>

          <!-- Riduzione Custom (3C) -->
          <div class="mb-3 pa-3 rounded-lg border border-soft" style="background: rgba(255, 255, 255, 0.03);">
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption font-weight-black text-slate-dark d-flex align-center gap-1">🛡️ Applica Riduzione Carico</span>
              <v-switch v-model="formFastidioApplica" color="orange-darken-2" density="compact" hide-details inset></v-switch>
            </div>
            <div v-if="formFastidioApplica" class="mt-2">
              <span class="text-super-caption text-muted font-weight-bold d-block mb-1">Percentuale di riduzione:</span>
              <v-chip-group v-model="formFastidioPct" column mandatory selected-class="font-weight-black text-white bg-orange-darken-3">
                <v-chip v-for="pct in [0, 10, 15, 20, 25, 30, 40]" :key="pct" :value="pct" size="small" variant="outlined" class="rounded-lg">
                  {{ pct === 0 ? '0% (Solo avviso)' : '-' + pct + '%' }}
                </v-chip>
              </v-chip-group>
            </div>
            <div v-else class="text-super-caption text-muted italic mt-1">
              * Verrà registrato solo come avviso/monitoraggio senza tagliare i pesi consigliati.
            </div>
          </div>

          <!-- Note -->
          <div class="mb-4">
            <span class="text-caption font-weight-black d-block mb-1 text-slate-dark">Note / Descrizione dell'accaduto</span>
            <v-textarea v-model="formFastidioNote" placeholder="Es. avvertito leggero fastidio alla spalla durante le ultime rep..." variant="outlined" density="comfortable" rows="2" rounded="lg" hide-details color="red-lighten-2"></v-textarea>
          </div>

          <div class="d-flex justify-end gap-2">
            <v-btn v-if="fastidioSelezionato && mostraModificaDirettaForm" variant="text" color="slate" class="font-weight-bold text-none rounded-lg" @click="mostraModificaDirettaForm = false">Annulla</v-btn>
            <v-btn block color="red-darken-3" variant="flat" class="font-weight-black text-none rounded-lg text-white" height="38" style="font-size: 0.78rem;" @click="salvaFastidioDaDettaglio" :loading="salvandoFastidio">
              {{ fastidioSelezionato ? 'Salva Modifiche Fastidio' : 'Registra Fastidio / Infortunio' }}
            </v-btn>
          </div>
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog Custom Conferma Eliminazione da Dettaglio -->
    <v-dialog v-model="dialogConfermaEliminaDettaglio" max-width="400" rounded="xl">
      <v-card class="card-glass border border-soft pa-5 text-center rounded-2xl" style="background: rgba(15, 23, 42, 0.95) !important; backdrop-filter: blur(20px) !important;">
        <div class="d-flex align-center justify-center gap-2 mx-auto mb-3 px-4 py-2 rounded-pill border border-soft text-red-lighten-2" style="background: rgba(239, 68, 68, 0.12); width: fit-content;">
          <v-icon size="20" color="red-lighten-2">mdi-delete-outline</v-icon>
          <span class="font-weight-black text-subtitle-2 text-red-lighten-2 uppercase tracking-wide">
            {{ fastidioSelezionato?.articolazione_coinvolta || 'Segnalazione' }}
          </span>
        </div>
        <h3 class="text-subtitle-1 font-weight-black text-white mb-1">Eliminare questa segnalazione?</h3>
        <p class="text-caption text-slate mb-4" style="color: #94a3b8 !important;">
          Sei sicuro di voler eliminare definitivamente <strong>{{ fastidioSelezionato?.articolazione_coinvolta }}</strong> dallo storico del tuo profilo?
        </p>
        <div class="d-flex justify-center gap-2">
          <v-btn
            variant="outlined"
            color="slate"
            class="font-weight-bold text-none rounded-xl flex-grow-1"
            height="38"
            style="font-size: 0.78rem;"
            @click="dialogConfermaEliminaDettaglio = false"
          >
            No, Annulla
          </v-btn>
          <v-btn
            color="red-darken-3"
            variant="flat"
            class="font-weight-black text-none rounded-xl text-white flex-grow-1 elevation-2"
            height="38"
            style="font-size: 0.78rem;"
            :loading="eliminandoFastidioDettaglio"
            @click="confermaEliminaFastidioDaDettaglio"
          >
            Sì, Elimina
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog Avviso Sforzo Percepito (W6) Mancante -->
    <v-dialog v-model="dialogAvvisoFaticaW6" max-width="420" rounded="xl">
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden pa-4 text-center" style="backdrop-filter: blur(20px);">
        <div class="d-flex justify-center mb-2">
          <div class="pa-3 rounded-circle alert-circle-w6" style="background: rgba(245, 158, 11, 0.12); border: 1px solid rgba(245, 158, 11, 0.35);">
            <v-icon color="amber-lighten-2" size="32">mdi-alert-decagram-outline</v-icon>
          </div>
        </div>

        <h3 class="text-subtitle-1 font-weight-black text-amber-lighten-2 mb-1">
          Sforzo Percepito (W6) Mancante
        </h3>
        
        <p class="text-caption text-slate mb-4" style="font-size: 0.75rem; line-height: 1.45;">
          Hai inserito il carico per la <strong>Week 6</strong>. Seleziona lo sforzo provato per calcolare con precisione i carichi del prossimo mesociclo!
        </p>

        <div class="d-flex flex-column gap-2.5 mb-3" style="gap: 10px !important;">
          <v-btn
            block
            color="light-blue-darken-3"
            variant="flat"
            class="font-weight-black text-none text-white py-2"
            rounded="xl"
            @click="salvaFatica('Media'); dialogAvvisoFaticaW6 = false;"
          >
            🙂 Media
          </v-btn>
          
          <v-btn
            block
            color="orange-darken-3"
            variant="flat"
            class="font-weight-black text-none text-white py-2"
            rounded="xl"
            @click="salvaFatica('Pesante'); dialogAvvisoFaticaW6 = false;"
          >
            🔥 Pesante
          </v-btn>

          <v-btn
            block
            color="purple-darken-3"
            variant="flat"
            class="font-weight-black text-none text-white py-2"
            rounded="xl"
            @click="salvaFatica('Devastante'); dialogAvvisoFaticaW6 = false;"
          >
            💀 Devastante
          </v-btn>
        </div>

        <v-btn
          variant="text"
          color="grey"
          size="small"
          class="font-weight-bold text-none"
          style="font-size: 0.7rem;"
          @click="dialogAvvisoFaticaW6 = false;"
        >
          Scegli più tardi
        </v-btn>
      </v-card>
    </v-dialog>

    <!-- DIALOG EDITOR NOTE ESPANSO (OPZIONE 2 COACH) -->
    <v-dialog 
      v-model="dialogEditorEspanso" 
      max-width="540" 
      rounded="xl"
    >
      <v-card class="card-glass-dark rounded-2xl border overflow-hidden" :style="{ backdropFilter: 'blur(25px)', background: 'var(--card-bg-dark, #0f172a) !important' }">
        <v-card-title class="pa-3 py-2.5 border-bottom d-flex align-center justify-space-between" :style="{ background: 'var(--card-bg-dark, #0f172a)' }">
          <div class="d-flex align-center">
            <v-icon color="orange-darken-2" size="20" class="mr-2 flex-shrink-0">mdi-note-edit-outline</v-icon>
            <span class="font-weight-black dialog-text-primary" style="font-size: 0.88rem;">
              Editor Note & Carico W{{ editingEspansoWeek }}
            </span>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="dialogEditorEspanso = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-3.5 text-left">
          <!-- Textarea Ampia Spaziosa -->
          <v-textarea
            v-model="tempEspansoText"
            label="Carico, ripetizioni ed annotazioni (es. 45 x7r (45kg Green Theory) panca 45°)"
            variant="outlined"
            rows="5"
            auto-grow
            color="orange-darken-3"
            class="mb-3 font-weight-medium"
            style="font-size: 0.95rem; line-height: 1.5;"
            placeholder="Es: 62,5 x8r&#10;(70 x8r Palestra Ospite)&#10;panca 30° pin 4"
            hide-details
            id="textarea-editor-espanso"
          ></v-textarea>

          <!-- Toolbar di Inserimento Rapido Simboli e Token -->
          <div class="mb-2">
            <span class="text-super-caption font-weight-black text-slate uppercase d-block mb-1.5" style="font-size: 0.58rem;">
              Inserimento Rapido Simboli
            </span>
            <div class="d-flex flex-wrap gap-1.5">
              <v-chip
                v-for="chip in [
                  { label: 'kg', insert: 'kg' },
                  { label: 'x', insert: ' x ' },
                  { label: 'r', insert: 'r' },
                  { label: '( ... )', insert: ' ()' },
                  { label: 'panca 30°', insert: ' panca 30°' },
                  { label: 'panca 45°', insert: ' panca 45°' },
                  { label: 'pin', insert: ' pin ' },
                  { label: 'buco', insert: ' buco ' },
                  { label: 'rpe', insert: ' rpe ' },
                  { label: 'tut', insert: ' tut ' }
                ]"
                :key="chip.label"
                size="small"
                variant="outlined"
                class="font-weight-bold cursor-pointer"
                style="font-size: 0.70rem; border-color: rgba(249, 115, 22, 0.35);"
                @click="inserisciSimboloEspanso(chip.insert)"
              >
                {{ chip.label }}
              </v-chip>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-3 border-top d-flex gap-2" :style="{ background: 'var(--card-bg-dark, #0f172a)' }">
          <v-btn
            variant="text"
            color="grey"
            class="font-weight-bold flex-grow-1 text-none"
            @click="dialogEditorEspanso = false"
          >
            Annulla
          </v-btn>
          <v-btn
            variant="flat"
            color="orange-darken-3"
            class="font-weight-black flex-grow-1 text-none text-white rounded-xl"
            :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316)) !important' }"
            @click="confermaEditorEspanso"
          >
            Conferma & Salva
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Resoconto Intelligente Coach sul PR -->
    <v-dialog v-model="dialogResocontoCoachPR" max-width="480" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: #0b1120 !important; border: 1.5px solid rgba(245, 158, 11, 0.4) !important;">
        <v-card-title class="pa-3 py-2.5 border-bottom d-flex align-center justify-space-between" style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.18) 0%, rgba(15, 23, 42, 0.95) 100%); border-color: rgba(245, 158, 11, 0.25) !important;">
          <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
            <span style="font-size: 1.05rem;">🏆</span>
            <div class="text-truncate">
              <div class="font-weight-black text-amber-lighten-2 text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
                Resoconto Coach: PR a {{ resocontoCoachPR?.cleanTargetReps }} Reps
              </div>
              <div class="text-super-caption text-slate-400 text-truncate font-weight-medium" style="font-size: 0.58rem;">
                {{ resocontoCoachPR?.exName }}
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="dialogResocontoCoachPR = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-3.5 scrollbar-custom" style="max-height: 70vh; font-size: 0.72rem; line-height: 1.5;">
          <!-- Card Valori Chiave in 2 Box -->
          <div class="d-flex gap-2 mb-3">
            <!-- Box 1: Record Storico -->
            <div class="pa-2.5 rounded-xl border flex-grow-1" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.3) !important; flex: 1 1 0%;">
              <div class="text-super-caption text-amber-lighten-2 font-weight-black uppercase" style="font-size: 0.52rem;">
                🏆 PR A {{ resocontoCoachPR?.cleanTargetReps }} REPS
              </div>
              <div class="font-weight-black text-white mt-0.5" style="font-size: 1.10rem;">
                <template v-if="resocontoCoachPR?.isCorpoLiberoPuro">
                  {{ resocontoCoachPR?.prReps }} reps
                </template>
                <template v-else>
                  {{ resocontoCoachPR?.prWeight }} kg
                  <span class="text-super-caption text-amber-lighten-3 font-weight-bold" style="font-size: 0.65rem;">
                    x{{ resocontoCoachPR?.prReps }}r {{ resocontoCoachPR?.prFatica ? '(' + resocontoCoachPR.prFatica + ')' : '' }}
                  </span>
                </template>
              </div>
              <div class="text-super-caption text-slate-400 mt-1 font-weight-regular text-truncate" style="font-size: 0.42rem; line-height: 1.1; letter-spacing: -0.01em;">
                📍 {{ resocontoCoachPR?.dataFormattataStr }} ({{ resocontoCoachPR?.tempoTrascorsoStr }})
              </div>
            </div>

            <!-- Box 2: 1RM Attuale o Max Reps Storico -->
            <div class="pa-2.5 rounded-xl border flex-grow-1" style="background: rgba(6, 182, 212, 0.08); border-color: rgba(6, 182, 212, 0.3) !important; flex: 1 1 0%;">
              <div class="text-super-caption text-cyan-lighten-2 font-weight-black uppercase" style="font-size: 0.52rem;">
                {{ resocontoCoachPR?.isCorpoLiberoPuro ? '📈 MAX REPS STORICO' : '📈 1RM ATTUALE' }}
              </div>
              <div class="font-weight-black text-cyan-lighten-2 mt-0.5" style="font-size: 1.10rem;">
                {{ resocontoCoachPR?.isCorpoLiberoPuro ? resocontoCoachPR?.bestHistoricalRepsDisplay : resocontoCoachPR?.currentE1rmDisplay }}
              </div>
              <div class="text-super-caption font-weight-regular mt-1 text-truncate" :class="resocontoCoachPR?.isAbsolute1RMPeak ? 'text-green-accent-3 font-weight-bold' : 'text-cyan-lighten-3'" style="font-size: 0.42rem; line-height: 1.1; letter-spacing: -0.01em;">
                <span v-if="resocontoCoachPR?.isAbsolute1RMPeak">👑 {{ resocontoCoachPR?.isCorpoLiberoPuro ? 'Record assoluto reps' : 'Nuovo picco assoluto' }}</span>
                <span v-else>👑 Max: {{ resocontoCoachPR?.isCorpoLiberoPuro ? (resocontoCoachPR?.bestHistoricalReps + ' reps (-' + resocontoCoachPR?.diffReps + 'r • Sch. ' + (resocontoCoachPR?.bestE1rmSheet || '-') + ')') : (resocontoCoachPR?.bestE1rmDisplay + ' (-' + resocontoCoachPR?.diff1RMKg + ' kg • Sch. ' + (resocontoCoachPR?.bestE1rmSheet || '-') + ')') }}</span>
              </div>

              <!-- Mini Progress Bar di Prossimità al Picco Assoluto -->
              <div 
                v-if="resocontoCoachPR?.e1rmProximityPct && !resocontoCoachPR?.isAbsolute1RMPeak"
                class="w-100 rounded-pill overflow-hidden mt-1" 
                style="height: 2px; background: rgba(255, 255, 255, 0.08);"
              >
                <div 
                  class="h-100 rounded-pill transition-all" 
                  :style="{ width: resocontoCoachPR.e1rmProximityPct + '%', background: 'linear-gradient(90deg, #06b6d4, #22d3ee)' }"
                ></div>
              </div>
            </div>
          </div>

          <!-- Testo Resoconto Coach Discorsivo -->
          <div class="pa-3 rounded-xl border mb-3 text-slate-200" style="background: rgba(15, 23, 42, 0.8); border-color: rgba(255, 255, 255, 0.08) !important; font-size: 0.70rem; line-height: 1.55;">
            <div class="d-flex align-center gap-1.5 mb-1.5 text-amber-lighten-2 font-weight-black uppercase" style="font-size: 0.58rem; letter-spacing: 0.04em;">
              <v-icon size="14" color="amber-lighten-2">mdi-account-tie-voice</v-icon>
              Analisi e Strategia del Coach
            </div>
            <div style="white-space: pre-line;" v-html="renderMarkdownBold(resocontoCoachPR?.testoResoconto || '')"></div>
          </div>

          <!-- Obiettivo Concreto per il Superamento -->
          <div class="d-flex flex-column gap-2">
            <!-- Box 1: Prossimo Obiettivo Volume PR -->
            <div class="pa-2.5 rounded-xl border d-flex align-center justify-space-between" style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.02) 100%); border-color: rgba(74, 222, 128, 0.35) !important;">
              <div>
                <div class="text-super-caption font-weight-black text-green-accent-3 uppercase" style="font-size: 0.52rem;">
                  🎯 Prossimo Obiettivo Volume PR
                </div>
                <div class="text-caption font-weight-black text-white" style="font-size: 0.75rem;">
                  <template v-if="resocontoCoachPR?.isCorpoLiberoPuro">
                    Raggiungi <strong class="text-green-accent-3">≥ {{ resocontoCoachPR?.targetNuoveReps }} reps</strong> ({{ resocontoCoachPR?.exName }})
                  </template>
                  <template v-else>
                    Raggiungi <strong class="text-green-accent-3">{{ resocontoCoachPR?.targetNuovoPRKg }} kg</strong> a {{ resocontoCoachPR?.cleanTargetReps }} reps
                  </template>
                </div>
              </div>
              <v-chip color="green-darken-2" size="x-small" class="font-weight-black text-white px-2" style="font-size: 0.55rem; height: 20px;">
                PROSSIMO STEP
              </v-chip>
            </div>

            <!-- Box 2: Obiettivo Record Assoluto 1RM (se diverso dal prossimo step e non ancora picco assoluto) -->
            <div 
              v-if="!resocontoCoachPR?.isCorpoLiberoPuro && !resocontoCoachPR?.isAbsolute1RMPeak && resocontoCoachPR?.targetRecordAssolutoKg && resocontoCoachPR.targetRecordAssolutoKg !== resocontoCoachPR.targetNuovoPRKg"
              class="pa-2.5 rounded-xl border d-flex align-center justify-space-between" 
              style="background: linear-gradient(135deg, rgba(245, 158, 11, 0.14) 0%, rgba(245, 158, 11, 0.03) 100%); border-color: rgba(245, 158, 11, 0.40) !important;"
            >
              <div>
                <div class="text-super-caption font-weight-black text-amber-lighten-2 uppercase" style="font-size: 0.52rem;">
                  👑 Obiettivo per Strappare il Record Assoluto (1RM)
                </div>
                <div class="text-caption font-weight-black text-white" style="font-size: 0.75rem;">
                  Raggiungi <strong class="text-amber-accent-2">{{ resocontoCoachPR?.targetRecordAssolutoKg }} kg</strong> a {{ resocontoCoachPR?.cleanTargetReps }} reps <span class="text-slate-400 font-weight-regular" style="font-size: 0.60rem;">(vs max {{ resocontoCoachPR?.bestE1rmDisplay }})</span>
                </div>
              </div>
              <v-chip color="amber-darken-3" size="x-small" class="font-weight-black text-white px-2" style="font-size: 0.55rem; height: 20px;">
                RECORD 1RM
              </v-chip>
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="pa-2.5 border-top d-flex justify-end bg-slate-900">
          <v-btn
            color="amber-darken-3"
            variant="flat"
            size="small"
            class="font-weight-black text-white text-none px-4 rounded-lg"
            style="font-size: 0.68rem; height: 30px;"
            @click="dialogResocontoCoachPR = false"
          >
            Ho capito
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Dettaglio Strategia Sfidante & Obiettivi Record -->
    <v-dialog v-model="dialogDettaglioSfidantePR" max-width="460" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: #0b1120 !important; border: 1.5px solid rgba(249, 115, 22, 0.4) !important;">
        <v-card-title class="pa-3 py-2.5 border-bottom d-flex align-center justify-space-between" style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.18) 0%, rgba(15, 23, 42, 0.95) 100%); border-color: rgba(249, 115, 22, 0.25) !important;">
          <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
            <span style="font-size: 1.05rem;">🔥</span>
            <div class="text-truncate">
              <div class="font-weight-black text-orange-lighten-2 text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
                Dettaglio Strategia Sfidante
              </div>
              <div class="text-super-caption text-slate-400 text-truncate font-weight-medium" style="font-size: 0.58rem;">
                {{ workout?.des_esercizio }} • W{{ aiutoWeek }} ({{ getRepsPerWeek(aiutoWeek) }} reps)
              </div>
            </div>
          </div>
          <v-btn icon="mdi-close" variant="text" size="small" color="grey" @click="dialogDettaglioSfidantePR = false"></v-btn>
        </v-card-title>

        <v-card-text class="pa-3.5 scrollbar-custom" style="max-height: 70vh; font-size: 0.72rem; line-height: 1.5;">
          <!-- Riepilogo Carico Proposto -->
          <div class="pa-3 rounded-xl border mb-3 d-flex align-center justify-space-between" style="background: rgba(249, 115, 22, 0.08); border-color: rgba(249, 115, 22, 0.3) !important;">
            <div>
              <div class="text-super-caption text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.52rem;">
                CARICO SFIDANTE PROPOSTO
              </div>
              <div class="font-weight-black text-white mt-0.5" style="font-size: 1.15rem;">
                <template v-if="dettaglioSfidantePRData?.pesoRecordAssoluto">
                  {{ dettaglioSfidantePRData?.pesoSfidante }} – {{ dettaglioSfidantePRData?.pesoRecordAssoluto }} kg
                </template>
                <template v-else>
                  {{ dettaglioSfidantePRData?.pesoSfidante }} kg
                </template>
                <span class="text-super-caption text-slate-300 font-weight-medium" style="font-size: 0.65rem;">
                  (Target prescritto: {{ dettaglioSfidantePRData?.targetReps }} reps)
                </span>
              </div>
            </div>
            <v-chip color="orange-darken-3" size="small" class="font-weight-bold text-white">
              SFIDANTE
            </v-chip>
          </div>

          <!-- Obiettivo 1: PR di Volume sulle Reps Prescritte -->
          <div class="pa-3 rounded-xl border mb-3" style="background: rgba(16, 185, 129, 0.08); border-color: rgba(74, 222, 128, 0.3) !important;">
            <div class="d-flex align-center gap-1.5 mb-1 text-green-accent-3 font-weight-black uppercase" style="font-size: 0.58rem;">
              <v-icon size="14" color="green-accent-3">mdi-check-circle</v-icon>
              1. PR Volume a {{ dettaglioSfidantePRData?.targetReps }} Reps ({{ dettaglioSfidantePRData?.pesoSfidante }} kg)
            </div>
            <div class="text-slate-200" style="font-size: 0.68rem; line-height: 1.45;">
              Sollevando <strong>{{ dettaglioSfidantePRData?.pesoSfidante }} kg</strong> per le <strong>{{ dettaglioSfidantePRData?.targetReps }} reps</strong> previste, stabilisci <strong>immediatamente il tuo Nuovo PR di scheda</strong> su questo range <span v-if="dettaglioSfidantePRData?.prWeight > 0">(superando il precedente di {{ dettaglioSfidantePRData?.prWeight }} kg)</span>.
            </div>
          </div>

          <!-- Obiettivo 2: Record Assoluto Storico (1RM) -->
          <div class="pa-3 rounded-xl border mb-2" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.35) !important;">
            <div class="d-flex align-center gap-1.5 mb-1.5 text-amber-lighten-2 font-weight-black uppercase" style="font-size: 0.58rem;">
              <v-icon size="14" color="amber-lighten-2">mdi-crown</v-icon>
              2. Record Assoluto di Forza Storica (1RM: {{ dettaglioSfidantePRData?.max1rm }} kg)
            </div>
            
            <!-- Se è presente il carico calcolato per il record assoluto a target reps -->
            <template v-if="dettaglioSfidantePRData?.pesoRecordAssoluto">
              <div class="text-slate-200 mb-2" style="font-size: 0.68rem; line-height: 1.45;">
                Per infrangere anche il tuo <strong>Record Assoluto di 1RM di tutti i tempi</strong> ({{ dettaglioSfidantePRData?.max1rm }} kg) mantenendo le <strong>{{ dettaglioSfidantePRData?.targetReps }} reps</strong> prescritte, il carico bersaglio calcolato è di <strong>{{ dettaglioSfidantePRData?.pesoRecordAssoluto }} kg</strong>!
              </div>

              <div class="pa-2 rounded-lg border d-flex align-center justify-space-between mb-2" style="background: rgba(15, 23, 42, 0.6); border-color: rgba(245, 158, 11, 0.3) !important;">
                <span class="text-slate-300 font-weight-medium" style="font-size: 0.65rem;">👑 Carico Bersaglio Record Assoluto:</span>
                <span class="font-weight-black text-amber-accent-2" style="font-size: 0.76rem;">
                  {{ dettaglioSfidantePRData?.pesoRecordAssoluto }} kg × {{ dettaglioSfidantePRData?.targetReps }}r
                </span>
              </div>
              <div class="text-super-caption text-slate-400 font-weight-medium" style="font-size: 0.60rem; line-height: 1.35;">
                In alternativa, se utilizzi il carico base di <strong>{{ dettaglioSfidantePRData?.pesoSfidante }} kg</strong>, per battere il record di sempre di 1RM devi spingerti ad almeno <strong>≥ {{ dettaglioSfidantePRData?.repsSupera }} reps</strong>.
              </div>
            </template>
            <template v-else>
              <div class="text-slate-200 mb-2" style="font-size: 0.68rem; line-height: 1.45;">
                Se con <strong>{{ dettaglioSfidantePRData?.pesoSfidante }} kg</strong> decidi di spingere al massimo per agganciare o battere il tuo <strong>Record Assoluto di 1RM di sempre</strong> ({{ dettaglioSfidantePRData?.max1rm }} kg), le soglie calcolate sono:
              </div>
              
              <div class="d-flex flex-column gap-1.5">
                <div class="pa-2 rounded-lg border d-flex align-center justify-space-between" style="background: rgba(15, 23, 42, 0.6); border-color: rgba(255, 255, 255, 0.08) !important;">
                  <span class="text-slate-300 font-weight-medium" style="font-size: 0.65rem;">Per eguagliare il Record Assoluto:</span>
                  <span class="font-weight-black text-amber-accent-2" style="font-size: 0.72rem;">
                    {{ dettaglioSfidantePRData?.repsEguaglia }} reps <span class="text-super-caption text-slate-400 font-weight-regular">(+{{ dettaglioSfidantePRData?.deltaReps }}r vs {{ dettaglioSfidantePRData?.targetReps }}r)</span>
                  </span>
                </div>

                <div class="pa-2 rounded-lg border d-flex align-center justify-space-between" style="background: rgba(15, 23, 42, 0.6); border-color: rgba(245, 158, 11, 0.3) !important;">
                  <span class="text-slate-300 font-weight-medium" style="font-size: 0.65rem;">Per superare il Record Assoluto:</span>
                  <span class="font-weight-black text-green-accent-3" style="font-size: 0.72rem;">
                    ≥ {{ dettaglioSfidantePRData?.repsSupera }} reps
                  </span>
                </div>
              </div>
            </template>
          </div>
        </v-card-text>

        <v-card-actions class="pa-2.5 border-top d-flex justify-end bg-slate-900">
          <v-btn
            color="orange-darken-3"
            variant="flat"
            size="small"
            class="font-weight-black text-white text-none px-4 rounded-lg"
            style="font-size: 0.68rem; height: 30px;"
            @click="dialogDettaglioSfidantePR = false"
          >
            Chiudi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { startGlobalTimer, ruolo, getStileStoricoAtleta, getModalitaSettimaneAtleta, selectedSheet, apriCalcolatoreDischi, layoutDettaglioGlobal, layoutEserciziGlobal, selectedAthlete, propostaBaseWeek2Global, propostaBaseWeek5Global, propostaBaseWeek6Global, incrementoPesoPostScaricoPctGlobal, sogliaForzaManubriGlobal, incrementoManubriLeggeroGlobal, incrementoManubriForteGlobal, faticaPesanteW1PctGlobal, faticaDevastanteW1PctGlobal, faticaPesanteStoricoPctGlobal, faticaDevastanteStoricoPctGlobal, getStoryboardBackup, globalStoryboard, globalInfortuni, segnalaInfortunio, aggiornaInfortunio, risolviInfortunio, eliminaInfortunio, calcolaPercentualeConsigliata, ottimizzaDigitazioneGlobal, regolaProgressioneW2Global, deallenamentoSoglia1Global, deallenamentoSoglia2Global, deallenamentoSoglia3Global, deallenamentoSoglia4Global, deallenamentoPct1Global, deallenamentoPct2Global, deallenamentoPct3Global, deallenamentoPct4Global, penalitaMaxInstabiliPctGlobal, penalitaMaxStabiliPctGlobal, stileVisualizzazioneGhost, modalitaIncrementoGhost, ghostPRAttackAttivo, ghostAutoregolazioneRepsAttiva, sfidaRecordWeek1, sensibilitaFaticaGhost, ghostAnalisiNoteAttiva, risaltoNumeriInsWeekGlobal, editorNoteEspansoGlobal, smartNoteCleanupGlobal, margineTopInputWeekGlobal, margineBottomInputWeekGlobal, margineTopW6FeedbackGlobal, margineBottomGhostNoticeGlobal, formattaECleanupNota, formattaInsWeekHtml, haContenutoAlfanumericoMisto } from '../authStore.js';

// Chart.js e vue-chartjs per lo storico esercizio
import { Line } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Filler
} from 'chart.js';

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  PointElement,
  LineElement,
  CategoryScale,
  LinearScale,
  Filler
);

const route = useRoute();
const router = useRouter();

// Parametri di progressione allenamento legati ai parametri globali
const propostaBaseWeek2 = propostaBaseWeek2Global;
const propostaBaseWeek5 = propostaBaseWeek5Global;
const propostaBaseWeek6 = propostaBaseWeek6Global;
const PENALITA_MAX_INSTABILI_PCT = penalitaMaxInstabiliPctGlobal;
const PENALITA_MAX_STABILI_PCT = penalitaMaxStabiliPctGlobal;
const INCREMENTO_PESO_POST_SCARICO_PCT = incrementoPesoPostScaricoPctGlobal;
const SOGLIA_FORZA_MANUBRI = sogliaForzaManubriGlobal;
const INCREMENTO_MANUBRI_LEGGERO = incrementoManubriLeggeroGlobal;
const INCREMENTO_MANUBRI_FORTE = incrementoManubriForteGlobal;
const FATICA_PESANTE_W1_PCT = faticaPesanteW1PctGlobal;
const FATICA_DEVASTANTE_W1_PCT = faticaDevastanteW1PctGlobal;
const FATICA_PESANTE_STORICO_PCT = faticaPesanteStoricoPctGlobal;
const FATICA_DEVASTANTE_STORICO_PCT = faticaDevastanteStoricoPctGlobal;
const risaltoNumeriInsWeek = risaltoNumeriInsWeekGlobal;

// Dialog Resoconto Coach Intelligente su PR & Andamento
const dialogResocontoCoachPR = ref(false);
const resocontoCoachPR = ref(null);

// Dialog Dettaglio Strategia Sfidante & Obiettivi Record
const dialogDettaglioSfidantePR = ref(false);
const dettaglioSfidantePRData = ref(null);

const apriDettaglioSfidantePR = (detail) => {
  if (!detail) return;
  dettaglioSfidantePRData.value = detail;
  dialogDettaglioSfidantePR.value = true;
};

let pressTimerPR = null;
const handlePRTouchStart = () => {
  pressTimerPR = setTimeout(() => {
    apriResocontoCoachPR();
  }, 450);
};
const handlePRTouchEnd = () => {
  if (pressTimerPR) {
    clearTimeout(pressTimerPR);
    pressTimerPR = null;
  }
};

const apriResocontoCoachPR = () => {
  if (pressTimerPR) {
    clearTimeout(pressTimerPR);
    pressTimerPR = null;
  }
  if (!workout.value) return;
  
  const sett = aiutoWeek.value;
  const targetReps = getRepsPerWeek(sett);
  const cleanTargetReps = String(targetReps).replace(/r$/i, '');
  const exName = workout.value.des_esercizio || 'questo esercizio';
  const isManubri = isManubriEsercizio(workout.value);
  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  const isCorpoLibero = isCorpoLiberoEsercizio(workout.value);
  const isCorpoLiberoPuro = isCorpoLibero && !haPesoEsercizio.value;
  
  const recData = recordOverviewData.value?.bestReal;
  const prWeight = recData?.weight || 0;
  const prReps = recData?.reps || targetReps;
  const prFatica = recData?.fatica;
  const prDate = recData?.date;
  const prSheet = recData?.sheet;
  const isCurrentPR = recData?.isCurrentPR;
  
  // Data e tempo trascorso del PR a X reps
  let tempoTrascorsoStr = 'in questa scheda';
  let dataFormattataStr = 'Scheda corrente';
  if (!isCurrentPR && prDate) {
    tempoTrascorsoStr = tempoTrascorso(prDate) || 'nel passato';
    dataFormattataStr = formattaDataStorico(prDate) || `Scheda ${prSheet || '-'}`;
  } else if (!isCurrentPR && prSheet) {
    dataFormattataStr = `Scheda ${prSheet}`;
    tempoTrascorsoStr = 'in un mesociclo precedente';
  }

  // Ramo dedicato per esercizi a Corpo Libero Puro (senza sovraccarico)
  if (isCorpoLiberoPuro) {
    let maxHistoricalReps = 0;
    let maxHistoricalSheet = null;
    if (storicoEsercizio.value && storicoEsercizio.value.length) {
      storicoEsercizio.value.forEach(prevEx => {
        for (let w = 1; w <= 6; w++) {
          const insVal = prevEx['ins_week' + w] || (w === 6 ? prevEx.num_ins6 : null);
          if (insVal) {
            let r = estraiRepsDaInput(insVal);
            if (r === null || isNaN(r) || r <= 0) {
              const rPrescr = prevEx['reps_week' + w] || estraiRepsDaPrescrizione(prevEx['des_week' + w]);
              r = rPrescr ? parseInt(rPrescr, 10) : 0;
            }
            if (r > maxHistoricalReps) {
              maxHistoricalReps = r;
              maxHistoricalSheet = prevEx.num_scheda;
            }
          }
        }
      });
    }

    let repsRecente = targetReps;
    let weekRecente = 1;
    if (inputSettimane.value) {
      for (let w = 6; w >= 1; w--) {
        const ins = inputSettimane.value[w]?.ins;
        if (ins) {
          const r = estraiRepsDaInput(ins);
          if (r && r > 0) {
            repsRecente = r;
            weekRecente = w;
            break;
          }
        }
      }
    }

    const isAbsoluteRepsPeak = Boolean(repsRecente >= maxHistoricalReps && repsRecente > 0);
    const targetNuoveReps = Math.max(prReps + 1, maxHistoricalReps > 0 ? maxHistoricalReps + 1 : prReps + 1);
    const diffReps = maxHistoricalReps > repsRecente ? maxHistoricalReps - repsRecente : 0;
    const e1rmProximityPct = maxHistoricalReps > 0 ? Math.min(100, Math.round((repsRecente / maxHistoricalReps) * 100)) : 100;

    let testoResoconto = '';
    if (isCurrentPR && isAbsoluteRepsPeak) {
      testoResoconto = `Fantastico! Su **${exName}** hai stabilito il tuo **nuovo record assoluto di ripetizioni** con **${prReps} reps** (${tempoTrascorsoStr}). Sei al massimo storico di sempre!\n\nPer continuare la progressione, il prossimo obiettivo è puntare a **≥ ${targetNuoveReps} reps**!`;
    } else if (isCurrentPR && !isAbsoluteRepsPeak) {
      testoResoconto = `Ottimo lavoro! Con **${prReps} reps** hai stabilito il tuo **Nuovo Record a ${cleanTargetReps} Reps** in questa scheda.\n\nIl tuo **Record Assoluto di sempre rimane di ${maxHistoricalReps} reps** (stabilito in Scheda ${maxHistoricalSheet || '-'}). Ti trovi a sole **-${diffReps} reps dal massimo storico**.\n\n🎯 **Obiettivo Coach:** per superare il record di sempre, punta a raggiungere **≥ ${targetNuoveReps} reps**!`;
    } else if (repsRecente < maxHistoricalReps && maxHistoricalReps > 0) {
      testoResoconto = `Il tuo **record a ${cleanTargetReps} reps** su **${exName}** è di **${prReps} reps** (in Scheda ${prSheet || '-'}).\n\nAttualmente nell'ultimo allenamento hai registrato **${repsRecente} reps** (W${weekRecente}), trovandoti a **-${diffReps} reps** dal picco assoluto storico (${maxHistoricalReps} reps in Scheda ${maxHistoricalSheet || '-'}).\n\nPer riagganciare e superare il primato, segui la progressione programmata e punta a raggiungere **≥ ${targetNuoveReps} reps**!`;
    } else {
      testoResoconto = `Il tuo **record a ${cleanTargetReps} reps** su **${exName}** è di **${prReps} reps** (${dataFormattataStr}, **${tempoTrascorsoStr}**).\n\nIl tuo volume attuale (**${repsRecente} reps**) è perfettamente allineato al tuo livello. Continua con la progressione programmata per stabilire un nuovo primato!`;
    }

    resocontoCoachPR.value = {
      exName,
      cleanTargetReps,
      isCorpoLiberoPuro: true,
      prReps,
      prFatica: prFatica ? formatFaticaAbbr(prFatica) : null,
      dataFormattataStr,
      tempoTrascorsoStr,
      isCurrentPR,
      repsRecente,
      weekRecente,
      bestHistoricalReps: maxHistoricalReps,
      bestHistoricalRepsDisplay: `${maxHistoricalReps > 0 ? maxHistoricalReps : prReps} reps`,
      bestE1rmSheet: maxHistoricalSheet,
      isAbsolute1RMPeak: isAbsoluteRepsPeak,
      diffReps,
      e1rmProximityPct,
      targetNuoveReps,
      testoResoconto
    };

    dialogResocontoCoachPR.value = true;
    return;
  }
  
  // Prestazione più recente nel mesociclo corrente
  let pesoRecente = 0;
  let repsRecente = targetReps;
  let weekRecente = 1;
  if (inputSettimane.value) {
    for (let w = 6; w >= 1; w--) {
      const ins = inputSettimane.value[w]?.ins;
      if (ins) {
        const perf = estraiMigliorPrestazioneInput(ins, getRepsPerWeek(w), isCavo);
        if (perf && perf.peso > 0) {
          pesoRecente = perf.peso;
          repsRecente = perf.reps;
          weekRecente = w;
          break;
        }
      }
    }
  }
  if (pesoRecente === 0) {
    pesoRecente = caricoConsigliatoViaDiMezzo.value || prWeight;
  }
  
  // Calcolo e1RM corrente unificato (da recordOverviewData) vs 1RM Massimo Assoluto
  const currentE1RM = (pesoRecente > 0 && repsRecente > 0) ? calcolaE1RMSmorzato(pesoRecente, repsRecente, isCavo) : (recordOverviewData.value?.bestE1RM?.currentE1RM || 0);
  const bestE1rmVal = recordOverviewData.value?.bestE1RM?.max1RM || 0;
  const bestE1rmSheet = recordOverviewData.value?.bestE1RM?.sheet;
  
  const roundedCurrentE1RM = Math.round(currentE1RM * 10) / 10;
  const roundedBestE1RM = Math.round(bestE1rmVal * 10) / 10;
  const isAbsolute1RMPeak = Boolean(
    recordOverviewData.value?.bestE1RM?.isNewPeak ||
    (roundedCurrentE1RM >= roundedBestE1RM && roundedCurrentE1RM > 0)
  );
  
  let diff1RMKg = 0;
  let diff1RMPct = 0;
  let e1rmProximityPct = 100;
  if (!isAbsolute1RMPeak && roundedBestE1RM > roundedCurrentE1RM && roundedCurrentE1RM > 0) {
    diff1RMKg = Math.round((roundedBestE1RM - roundedCurrentE1RM) * 10) / 10;
    if (diff1RMKg > 0) {
      diff1RMPct = Math.round((diff1RMKg / roundedBestE1RM) * 100);
      e1rmProximityPct = Math.min(100, Math.round((roundedCurrentE1RM / roundedBestE1RM) * 1000) / 10);
    } else {
      diff1RMKg = 0;
      diff1RMPct = 0;
    }
  }
  
  // Calcolo gap sul PR a X reps
  let gapKg = 0;
  let gapPct = 0;
  let statoGap = 'in_linea';
  if (isCurrentPR) {
    statoGap = 'nuovo_pr';
  } else if (prWeight > 0 && pesoRecente < prWeight) {
    gapKg = Math.round((prWeight - pesoRecente) * 10) / 10;
    gapPct = Math.round((gapKg / prWeight) * 100);
    statoGap = 'sotto_pr';
  } else if (pesoRecente >= prWeight && prWeight > 0) {
    statoGap = 'eguagliato';
  }
  
  // Cosa serve concretamente per superarlo (calcolo matematico reps e carichi necessari)
  const stepKg = isManubri ? 1 : 2.5;
  const targetNuovoPRKg = Math.round((prWeight + stepKg) * 10) / 10;
  
  // Calcolo matematico del carico a target reps necessario per superare il Record Assoluto storico di 1RM
  let targetRecordAssolutoKg = targetNuovoPRKg;
  if (bestE1rmVal > 0 && targetReps > 0 && !isCorpoLiberoPuro) {
    const rawTargetAbs = calcolaPesoDaE1RMSmorzato(bestE1rmVal + 0.1, targetReps, isCavo);
    if (rawTargetAbs > 0) {
      targetRecordAssolutoKg = Math.ceil(rawTargetAbs / stepKg) * stepKg;
      targetRecordAssolutoKg = Math.max(targetNuovoPRKg, Math.round(targetRecordAssolutoKg * 10) / 10);
    }
  }

  const pr1RMTarget = prWeight * (1 + prReps / 30);
  let minRepsPR = targetReps;
  if (pesoRecente > 0 && pr1RMTarget > 0) {
    if (pesoRecente < prWeight) {
      minRepsPR = Math.max(targetReps + 1, Math.ceil(((pr1RMTarget / pesoRecente) - 1) * 30));
    } else if (pesoRecente === prWeight) {
      minRepsPR = prReps + 1;
    } else {
      minRepsPR = targetReps;
    }
  }
  
  // Analisi evoluzione nello storico
  const numSchedePassate = (storicoEsercizio.value || []).length;
  
  // Costruzione del resoconto discorsivo in stile coach
  let testoResoconto = '';
  
  if (isCurrentPR && isAbsolute1RMPeak) {
    testoResoconto = `Fantastico! Su **${exName}** hai stabilito contemporaneamente il tuo **nuovo PR a ${cleanTargetReps} reps** (**${formatWeight(prWeight)} kg × ${prReps}r**) e il **nuovo picco assoluto di 1RM** (**${formatWeight(roundedCurrentE1RM)} kg**). Sei al massimo storico di sempre su ogni fronte!\n\nPer continuare la progressione, il prossimo step è consolidare questo stimolo e puntare a **${formatWeight(targetNuovoPRKg)} kg**.`;
  } else if (isCurrentPR && !isAbsolute1RMPeak) {
    testoResoconto = `Ottimo lavoro! Con **${formatWeight(prWeight)} kg × ${prReps}r** hai stabilito il tuo **Nuovo PR sulle ${cleanTargetReps} Reps** in questa scheda, che esprime una forza stimata (1RM) di **${formatWeight(roundedCurrentE1RM)} kg**.\n\nTuttavia, il tuo **1RM Assoluto di sempre rimane di ${formatWeight(roundedBestE1RM)} kg** (stabilito in Scheda ${bestE1rmSheet || '-'}). Ti trovi a **-${formatWeight(diff1RMKg)} kg (-${diff1RMPct}%) dal record assoluto di forza**.\n\n🎯 **Prossimo Step PR (${cleanTargetReps} reps):** ${formatWeight(targetNuovoPRKg)} kg\n👑 **Obiettivo Record Assoluto:** per superare anche il record di sempre di 1RM mantenendo ${cleanTargetReps} ripetizioni, l'obiettivo è raggiungere **${formatWeight(targetRecordAssolutoKg)} kg**!`;
  } else if (statoGap === 'sotto_pr') {
    if (repsRecente >= minRepsPR) {
      testoResoconto = `Il tuo **PR a ${cleanTargetReps} reps** su **${exName}** è di **${formatWeight(prWeight)} kg × ${prReps}r** (in Scheda ${prSheet || '-'}).\n\nAttualmente stai lavorando a **sovraccarico di volume** con **${formatWeight(pesoRecente)} kg × ${repsRecente}r** (W${weekRecente}, 1RM stimato: **${formatWeight(currentE1RM)} kg**). Con questo volume ad alte ripetizioni **hai già pareggiato la forza espressa nel tuo record storico**!\n\nPer continuare la progressione, segui l'indicazione di volume programmata (${formatWeight(pesoRecente)} kg × ${repsRecente + 1}r) oppure, se desideri riavvicinarti al range a ${cleanTargetReps} reps, procedi con un aumento di carico graduale (es. ${formatWeight(Math.min(targetNuovoPRKg, pesoRecente + (stepKg * 2)))} kg).`;
    } else {
      testoResoconto = `Il tuo **PR a ${cleanTargetReps} reps** su **${exName}** è di **${formatWeight(prWeight)} kg × ${prReps}r**, ottenuto in **Scheda ${prSheet || '-'}** (${dataFormattataStr}, circa **${tempoTrascorsoStr}**).\n\nAttualmente nell'ultimo allenamento hai registrato **${formatWeight(pesoRecente)} kg** (W${weekRecente}, 1RM: **${formatWeight(currentE1RM)} kg**), trovandoti a **-${formatWeight(gapKg)} kg (-${gapPct}%)** dal record a ${cleanTargetReps} reps e a **-${formatWeight(diff1RMKg)} kg** dal picco 1RM assoluto (${formatWeight(bestE1rmVal)} kg in Scheda ${bestE1rmSheet || '-'}).\n\nPer riagganciare e superare il primato, segui la progressione consigliata settimanale e punta a raggiungere **≥ ${minRepsPR} ripetizioni** prima di attaccare i **${formatWeight(targetNuovoPRKg)} kg**.`;
    }
  } else {
    testoResoconto = `Il tuo **PR a ${cleanTargetReps} reps** su **${exName}** è di **${formatWeight(prWeight)} kg × ${prReps}r** (${dataFormattataStr}, **${tempoTrascorsoStr}**).\n\nIl tuo carico attuale (**${formatWeight(pesoRecente)} kg**) è perfettamente allineato al tuo miglior livello storico. Continua con la progressione programmata per stabilire un nuovo record.`;
  }
  
  resocontoCoachPR.value = {
    exName,
    cleanTargetReps,
    prWeight: formatWeight(prWeight),
    prReps,
    prFatica: prFatica ? formatFaticaAbbr(prFatica) : null,
    dataFormattataStr,
    tempoTrascorsoStr,
    isCurrentPR,
    pesoRecente: formatWeight(pesoRecente),
    weekRecente,
    currentE1rmDisplay: `${formatWeight(Math.round(currentE1RM * 10) / 10)} kg`,
    bestE1rmDisplay: `${formatWeight(Math.round(bestE1rmVal * 10) / 10)} kg`,
    bestE1rmSheet,
    isAbsolute1RMPeak,
    diff1RMKg: formatWeight(diff1RMKg),
    diff1RMPct,
    e1rmProximityPct,
    gapKg: formatWeight(gapKg),
    gapPct,
    statoGap,
    targetNuovoPRKg: formatWeight(targetNuovoPRKg),
    targetRecordAssolutoKg: formatWeight(targetRecordAssolutoKg),
    minRepsPR,
    numSchedePassate,
    testoResoconto
  };
  
  dialogResocontoCoachPR.value = true;
};

const activeEditingWeek = ref(null);
const localEditingRaw = { 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' };
const localEditingIns = ref({ 1: '', 2: '', 3: '', 4: '', 5: '', 6: '' });

// Controllo Diretto: Mancano Ripetizioni AMRAP
const dialogMancanoRepsAmrap = ref(false);
const settimanaMancanoReps = ref(6);
const caricoMancanoReps = ref('');
const inputRepsManualeAmrap = ref('');

const applicaRepsAmrap = (reps) => {
  const r = parseInt(reps, 10);
  if (isNaN(r) || r <= 0) return;
  const sett = settimanaMancanoReps.value;
  const c = caricoMancanoReps.value;
  const newText = `${c} x ${r}r`;

  if (!inputSettimane.value[sett]) {
    inputSettimane.value[sett] = { ins: '', reps: '' };
  }
  inputSettimane.value[sett].ins = newText;
  localEditingRaw[sett] = newText;
  localEditingIns.value[sett] = newText;

  salvaDatoSettimanale(sett, 'ins');
  dialogMancanoRepsAmrap.value = false;
  inputRepsManualeAmrap.value = '';
  vibraTattile(20);
  snackbarMessaggio.value = `Registrato: ${newText}!`;
  snackbarSalvataggio.value = true;
};

const onFocusWeek = (sett) => {
  activeEditingWeek.value = sett;
  const current = inputSettimane.value[sett]?.ins || '';
  localEditingRaw[sett] = current;
  localEditingIns.value[sett] = current;
};

const onInputWeek = (sett, val) => {
  localEditingRaw[sett] = val;
};

const onBlurWeek = (sett, val) => {
  const finalVal = (val !== undefined && val !== null) ? val : (localEditingRaw[sett] !== undefined ? localEditingRaw[sett] : (inputSettimane.value[sett]?.ins || ''));
  if (!inputSettimane.value[sett]) {
    inputSettimane.value[sett] = { ins: '', reps: '' };
  }
  inputSettimane.value[sett].ins = finalVal;
  localEditingRaw[sett] = finalVal;
  localEditingIns.value[sett] = finalVal;
  activeEditingWeek.value = null;

  if (sett === 6 && isEsercizioEligibileW6(workout.value)) {
    const valStr = String(finalVal || '').trim();
    if (!valStr) {
      numIns6Val.value = '';
      numIns6ModificatoManualmente.value = false;
      salvaDatoGenerale('num_ins6', '');
      numFaticaw6Val.value = '';
      salvaDatoGenerale('num_faticaw6', '');
    } else if (!numIns6ModificatoManualmente.value) {
      const estratto = estraiNumeroMassimo(valStr);
      if (estratto !== null) {
        numIns6Val.value = String(estratto);
        salvaDatoGenerale('num_ins6', String(estratto));
        if (!numFaticaw6Val.value) {
          dialogAvvisoFaticaW6.value = true;
        }
      }
    }
  }

  salvaDatoSettimanale(sett, 'ins');

  // Controllo Diretto: Se in una settimana AMRAP l'utente inserisce solo il carico senza le reps
  if (workout.value && !isCorpoLiberoEsercizio(workout.value)) {
    const presc = String(workout.value['des_week' + sett] || '');
    const isAmrap = /amrap|max\s*reps?|massim[ae]\s*rip|cedimento/i.test(presc) || (sett === 6 && /amrap/i.test(workout.value.des_rec_report || ''));
    const parsedLoad = estraiPesoDaInput(finalVal);
    const parsedReps = estraiRepsDaInputExplicitSingle(finalVal);
    const hasAnyReps = parsedReps !== null || /\b\d+\s*(?:r\b|reps?|rip)/i.test(finalVal) || /\+\s*\d+/i.test(finalVal);

    if (isAmrap && parsedLoad && !hasAnyReps) {
      settimanaMancanoReps.value = sett;
      caricoMancanoReps.value = String(parsedLoad).replace('.', ',');
      inputRepsManualeAmrap.value = '';
      dialogMancanoRepsAmrap.value = true;
      vibraTattile(25);
    }
  }
};

const getInitialRows = (text) => {
  if (!text) return 1;
  const lines = String(text).split('\n').length;
  return Math.max(1, Math.min(8, lines));
};

// Editor Note Espanso (Opzione 2 Coach)
const dialogEditorEspanso = ref(false);
const editingEspansoWeek = ref(null);
const tempEspansoText = ref('');

const apriEditorNoteEspanso = (sett) => {
  vibraTattile(15);
  editingEspansoWeek.value = sett;
  tempEspansoText.value = inputSettimane.value[sett]?.ins || localEditingIns.value[sett] || '';
  dialogEditorEspanso.value = true;
};

const inserisciSimboloEspanso = (token) => {
  vibraTattile(10);
  const current = tempEspansoText.value || '';
  if (!current) {
    tempEspansoText.value = token.trim();
  } else {
    if (token === ' ()') {
      tempEspansoText.value = current + ' ()';
    } else if (token === 'kg' || token === 'r') {
      tempEspansoText.value = current + token;
    } else {
      tempEspansoText.value = current + (token.startsWith(' ') ? token : ' ' + token);
    }
  }
  nextTick(() => {
    const el = document.getElementById('textarea-editor-espanso');
    if (el) el.focus();
  });
};

const confermaEditorEspanso = () => {
  if (editingEspansoWeek.value) {
    const sett = editingEspansoWeek.value;
    if (!inputSettimane.value[sett]) {
      inputSettimane.value[sett] = { ins: '', reps: '' };
    }
    inputSettimane.value[sett].ins = tempEspansoText.value;
    localEditingIns.value[sett] = tempEspansoText.value;

    if (sett === 6 && isEsercizioEligibileW6(workout.value)) {
      const valStr = String(tempEspansoText.value || '').trim();
      if (!valStr) {
        numIns6Val.value = '';
        numIns6ModificatoManualmente.value = false;
        salvaDatoGenerale('num_ins6', '');
        numFaticaw6Val.value = '';
        salvaDatoGenerale('num_faticaw6', '');
      } else if (!numIns6ModificatoManualmente.value) {
        const estratto = estraiNumeroMassimo(valStr);
        if (estratto !== null) {
          numIns6Val.value = String(estratto);
          salvaDatoGenerale('num_ins6', String(estratto));
          if (!numFaticaw6Val.value) {
            dialogAvvisoFaticaW6.value = true;
          }
        }
      }
    }

    salvaDatoSettimanale(sett, 'ins');
    snackbarMessaggio.value = `Note W${sett} aggiornate con successo!`;
    snackbarSalvataggio.value = true;
  }
  dialogEditorEspanso.value = false;
};

const attivaEditingWeek = (sett) => {
  if (editorNoteEspansoGlobal.value) {
    apriEditorNoteEspanso(sett);
    return;
  }
  onFocusWeek(sett);
  nextTick(() => {
    const el = document.getElementById('input-peso-w' + sett);
    if (el) {
      el.focus();
    }
  });
};

const inizializzaParametriProposta = (atletaId) => {
  // Gestito a livello globale in authStore.js
};

// Help Dialog & Calcolo Carico Storico States
const dialogAiutoCarico = ref(false);
const dialogAvvisoFaticaW6 = ref(false);
const activeTabAnalisi = ref(0);
const caricandoAiutoCarico = ref(false);
const aiutoWeek = ref(1);
const storicoEsercizioPerAiuto = ref([]);

watch(activeTabAnalisi, (newVal) => {
  if (newVal === 1) {
    eseguiScrollStorico();
  }
});

const getRepsPerWeek = (sett) => {
  if (!workout.value) return 10;
  return estraiRepsEsercizioWeek(workout.value, sett, 10);
};

// --- LOGICA RECORD & INCREMENTI GHOST (Collegata a Store Centralizzato authStore.js) ---
const stileRecordStorico = ref('cards');
const ottimizzaDigitazione = ottimizzaDigitazioneGlobal;
const regolaProgressioneW2 = regolaProgressioneW2Global;

// --- LOGICA ANTI-STALLO & PROGRESSIONE MULTIDIMENSIONALE (SOLUZIONI 1, 3, 4) ---
const chipProgressioneQualitativa = [
  { id: 'extra_rep', icon: '📈', label: 'Rep Extra', primary: true },
  { id: 'tut', icon: '⏱️', label: 'Eccentrica più lenta (TUT)' },
  { id: 'rom', icon: '🧘', label: 'Maggiore ROM/Controllo' },
  { id: 'rir', icon: '📉', label: 'Sforzo Percepito Minore (RIR+1)' },
  { id: 'pausa', icon: '⏱️', label: 'Pausa nel punto critico' },
  { id: 'densita', icon: '⚡', label: 'Recupero Ridotto' },
  { id: 'mantenimento', icon: '🟢', label: 'Nessuno/Mantenimento' }
];

const haDriverQualitativoAccreditato = (sett) => {
  const val = inputSettimane.value[sett]?.ins || '';
  if (!val) return false;
  const lower = String(val).toLowerCase();
  if (lower.includes('mantenimento') || lower.includes('nessuno')) return false;
  return (
    lower.includes('eccentrica') ||
    lower.includes('tut') ||
    lower.includes('rom') ||
    lower.includes('controllo') ||
    lower.includes('rir') ||
    lower.includes('pausa') ||
    lower.includes('recupero') ||
    lower.includes('qualitat') ||
    lower.includes('fermo') ||
    lower.includes('+1') ||
    lower.includes('+2') ||
    lower.includes('+3') ||
    lower.includes('extra') ||
    lower.includes('reps in più') ||
    lower.includes('più reps') ||
    lower.includes('rep extra') ||
    val.includes('🌟')
  );
};

const isStagnazioneSettimana = (sett) => {
  if (sett <= 1) return false;

  // Se c'è un vincolo esplicito di carico dal coach (es. [KG W5] o ghost.isMandatory), NON è stagnazione!
  const ghost = getGhostLift(sett);
  if (ghost && (ghost.isMandatory || ghost.mandatoryLabel)) return false;

  // Se la settimana è di scarico (W4 scarico o ghost.isScarico), NON è stagnazione!
  if ((sett === 4 && isWeek4Scarico?.value) || (ghost && ghost.isScarico)) return false;

  // Se la settimana 6 è un test AMRAP o Max Reps (richiede stesso peso di W5 con massime ripetizioni a cedimento),
  // NON è una stagnazione di carico ma un test massimale programmato!
  if (sett === 6) {
    const prescW6 = String(workout.value?.des_week6 || '');
    const endW6 = String(workout.value?.des_estesa_end || '');
    const noteW6 = String(workout.value?.des_note || '');
    if (/amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(prescW6) || 
        /massim[ae]\s*rip|amrap|max\s*reps?|cedimento/i.test(endW6) ||
        /amrap|massim[ae]\s*rip/i.test(noteW6)) {
      return false;
    }
  }

  const currentIns = inputSettimane.value[sett]?.ins;
  if (!currentIns || String(currentIns).trim() === '' || String(currentIns).trim() === '-') return false;
  
  if (haDriverQualitativoAccreditato(sett)) return false;

  const perfCurr = estraiMigliorPrestazioneInput(currentIns, getRepsPerWeek(sett), isCavoOMacchinaEsercizio(workout.value));
  const currentPeso = perfCurr ? perfCurr.peso : (parseFloat(estraiPesoDaInput(currentIns)) || 0);
  if (currentPeso <= 0) return false;

  const currentReps = perfCurr ? perfCurr.reps : (estraiRepsDaInput(currentIns) || getRepsPerWeek(sett));

  let prevW = sett - 1;
  while (prevW >= 1 && (!inputSettimane.value[prevW]?.ins || String(inputSettimane.value[prevW]?.ins).trim() === '' || String(inputSettimane.value[prevW]?.ins).trim() === '-')) {
    prevW--;
  }
  if (prevW < 1) return false;

  const prevIns = inputSettimane.value[prevW]?.ins;
  const perfPrev = estraiMigliorPrestazioneInput(prevIns, getRepsPerWeek(prevW), isCavoOMacchinaEsercizio(workout.value));
  const prevPeso = perfPrev ? perfPrev.peso : (parseFloat(estraiPesoDaInput(prevIns)) || 0);
  if (prevPeso <= 0) return false;

  const prevReps = perfPrev ? perfPrev.reps : (estraiRepsDaInput(prevIns) || getRepsPerWeek(prevW));

  // Se il peso attuale è inferiore a prevPeso ma è uguale a un peso usato in una settimana precedente (es. W2),
  // verifichiamo se le reps sono aumentate rispetto a quella settimana a pari peso (progressione di volume).
  if (currentPeso < prevPeso) {
    let sameWeightW = prevW - 1;
    while (sameWeightW >= 1) {
      const matchIns = inputSettimane.value[sameWeightW]?.ins;
      if (matchIns) {
        const matchPesoStr = estraiPesoDaInput(matchIns);
        if (matchPesoStr) {
          const matchPeso = parseFloat(matchPesoStr);
          if (!isNaN(matchPeso) && Math.abs(matchPeso - currentPeso) < 0.1) {
            const matchReps = estraiRepsDaInput(matchIns) || getRepsPerWeek(sameWeightW);
            if (currentReps > matchReps) {
              // Progressione di volume/reps rispetto alla settimana a pari carico -> non è stagnazione!
              return false;
            }
          }
        }
      }
      sameWeightW--;
    }
  }

  return currentPeso <= prevPeso && currentReps <= prevReps;
};

const applicaDriverProgressione = (sett, labelChip) => {
  vibraTattile(12);
  const targetInput = inputSettimane.value[sett];
  if (targetInput) {
    let currentVal = targetInput.ins ? String(targetInput.ins).trim() : '';
    const isMantenimento = labelChip.toLowerCase().includes('mantenimento');
    const isExtraRep = labelChip.toLowerCase().includes('rep') || labelChip.includes('+');

    if (isExtraRep) {
      // Se l'utente ha scritto ad es. "10 x12r", incrementiamo le reps da 12 a 13 e aggiungiamo [+1 Rep Extra]
      const matchReps = currentVal.match(/(x\s*|reps?\s*|r\s*)(\d+)/i) || currentVal.match(/(\d+)\s*r\b/i);
      if (matchReps && matchReps[2]) {
        const oldReps = parseInt(matchReps[2], 10);
        const newReps = oldReps + 1;
        currentVal = currentVal.replace(matchReps[0], matchReps[0].replace(String(oldReps), String(newReps)));
      }
      if (!currentVal.toLowerCase().includes('extra') && !currentVal.includes('+1')) {
        currentVal = currentVal ? `${currentVal} [+1 Rep Extra]` : `[+1 Rep Extra]`;
      }
      targetInput.ins = currentVal;
      salvaDatoSettimanale(sett, 'ins');
      snackbarMessaggio.value = `📈 Progressione di Ripetizioni (+1 Rep Extra) accreditata per W${sett}!`;
      snackbarSalvataggio.value = true;
      return;
    }

    if (!currentVal.toLowerCase().includes(labelChip.toLowerCase())) {
      targetInput.ins = currentVal ? `${currentVal} [${labelChip}]` : `[${labelChip}]`;
      salvaDatoSettimanale(sett, 'ins');
      if (isMantenimento) {
        snackbarMessaggio.value = `🟢 Registrato stato di Mantenimento per W${sett}`;
      } else {
        snackbarMessaggio.value = `🌟 Progressione Qualitativa accreditata per W${sett}!`;
      }
      snackbarSalvataggio.value = true;
    }
  }
};

const auditStalloW6 = computed(() => {
  if (!workout.value) return { hasStall: false };
  let countStagnant = 0;
  let lastPeso = null;

  for (let w = 2; w <= 6; w++) {
    if (isStagnazioneSettimana(w)) {
      countStagnant++;
      const pStr = estraiPesoDaInput(inputSettimane.value[w]?.ins);
      if (pStr) lastPeso = parseFloat(pStr);
    }
  }

  return {
    hasStall: countStagnant >= 3, // 4+ settimane totali compresa la prima
    weeksStagnant: countStagnant + 1,
    peso: lastPeso || 0
  };
});

const isStalledInPreviousMesocycle = computed(() => {
  if (!workout.value || !previousWorkout.value) return false;
  
  const parsePesoLocalInternal = (val) => {
    if (!val) return 0;
    const pStr = estraiPesoDaInput(val);
    return pStr ? parseFloat(pStr) : 0;
  };

  const estraiRepsInternal = (str) => {
    if (!str) return null;
    return estraiRepsDaInput(str);
  };

  const useRep = isCorpoLiberoEsercizio(previousWorkout.value);
  const w1Val = useRep ? (estraiRepsInternal(previousWorkout.value.ins_week1) || 0) : parsePesoLocalInternal(previousWorkout.value.ins_week1);
  
  let latestVal = 0;
  for (let w = 6; w >= 1; w--) {
    const val = useRep ? (estraiRepsInternal(previousWorkout.value['ins_week' + w]) || 0) : parsePesoLocalInternal(previousWorkout.value['ins_week' + w]);
    if (val > 0) {
      latestVal = val;
      break;
    }
  }

  return (w1Val > 0 && latestVal <= w1Val);
});

const impostaCaricoLimite = () => {
  if (!workout.value || !settimanaAttiva.value) return;
  const sett = settimanaAttiva.value;
  let currentVal = inputSettimane.value[sett]?.ins ? String(inputSettimane.value[sett].ins).trim() : '';
  
  if (!currentVal) {
    const prevVal = previousWorkout.value ? previousWorkout.value.ins_week1 : '';
    if (prevVal) {
      inputSettimane.value[sett].ins = `${prevVal} [CARICO LIMITATO]`;
    } else {
      inputSettimane.value[sett].ins = `[CARICO LIMITATO]`;
    }
  } else if (!currentVal.includes('[CARICO LIMITATO]')) {
    inputSettimane.value[sett].ins = `${currentVal} [CARICO LIMITATO]`;
  }

  if (!noteEsercizio.value.includes('Carico ancora al limite')) {
    noteEsercizio.value = noteEsercizio.value 
      ? `${noteEsercizio.value} | Carico ancora al limite dal mesociclo precedente`
      : 'Carico ancora al limite dal mesociclo precedente';
  }

  salvaNoteEsercizio();
  salvaDatoSettimanale(sett, 'ins');
  snackbarMessaggio.value = `🏋️ Segnalato al Coach: Carico al limite per W${sett}`;
  snackbarSalvataggio.value = true;
};

const tempoTrascorsoBreve = (dateStr) => {
  const str = tempoTrascorso(dateStr);
  if (!str) return '';
  return str
    .replace(' mesi fa', 'm fa')
    .replace(' mese fa', 'm fa')
    .replace(' sett fa', 'w fa')
    .replace(' gg fa', 'g fa')
    .replace(' anni fa', 'a fa')
    .replace(' anno fa', 'a fa');
};

const ottieniDettaglioRecordStoricoPerReps = (targetReps) => {
  if (!workout.value || !storicoEsercizio.value.length) return null;
  const currentNumScheda = parseInt(workout.value.num_scheda);
  if (isNaN(currentNumScheda)) return null;

  let maxWeight = 0;
  let bestRecord = null;

  storicoEsercizio.value.forEach(prevEx => {
    const sNum = parseInt(prevEx.num_scheda);
    if (!isNaN(sNum) && sNum >= currentNumScheda) return; // solo schede passate
    
    for (let w = 1; w <= 6; w++) {
      const insVal = prevEx['ins_week' + w];
      if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
        const weightStr = estraiPesoDaInput(insVal);
        if (weightStr) {
          const weight = parseFloat(weightStr);
          if (!isNaN(weight) && weight > 0) {
            const repsVal = prevEx['reps_week' + w];
            let repsNum = repsVal ? parseInt(repsVal, 10) : estraiRepsDaPrescrizione(prevEx['des_week' + w]);
            const inputReps = estraiRepsDaInput(insVal);
            if (inputReps !== null && !isNaN(inputReps) && inputReps > 0) {
              repsNum = inputReps;
            }
            if (repsNum === targetReps) {
              if (weight > maxWeight) {
                maxWeight = weight;
                const dEx = getExecutionDate(prevEx, storicoEsercizio.value, workout.value);
                bestRecord = {
                  peso: weight,
                  id: prevEx.id || prevEx.num_riga,
                  numScheda: prevEx.num_scheda,
                  date: dEx,
                  tempoTrascorso: tempoTrascorsoBreve(dEx)
                };
              }
            }
          }
        }
      }
    }
  });

  return bestRecord;
};

const ottieniRecordStoricoPerReps = (targetReps) => {
  const dett = ottieniDettaglioRecordStoricoPerReps(targetReps);
  return dett ? dett.peso : null;
};

const calcolaE1RMSmorzato = (peso, reps, isCavoOMacchina) => {
  if (!peso || peso <= 0) return 0;
  let repsEffettive = reps;
  if (reps > 10) {
    // Decadimento marcato oltre le 10 reps per riflettere la fatica lattacida reale
    repsEffettive = 10 + (reps - 10) * 1.8; 
  }
  let e1rm = peso * (1 + repsEffettive / 30);
  if (isCavoOMacchina && reps > 8) {
    e1rm *= 0.82; // Riduzione del 18% per macchine e cavi ad alte reps
  }
  return e1rm;
};

const calcolaPesoDaE1RMSmorzato = (e1rm, targetReps, isCavoOMacchina) => {
  if (!e1rm || targetReps <= 0) return 0;
  let repsTargetEffettive = targetReps;
  if (targetReps > 10) {
    // Aumenta la penalità di conversione quando si calcola un target per molte reps (es. 17 reps)
    repsTargetEffettive = 10 + (targetReps - 10) * 1.8;
  }
  let pesoStimato = e1rm / (1 + repsTargetEffettive / 30);
  if (isCavoOMacchina && targetReps > 8) {
    pesoStimato *= 0.82;
  }
  return pesoStimato;
};

const stimaRecordStoricoPerReps = (targetReps) => {
  if (!workout.value || !storicoEsercizio.value.length || !targetReps) return null;
  const currentNumScheda = parseInt(workout.value.num_scheda);
  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  
  let best1RM = 0;

  storicoEsercizio.value.forEach(prevEx => {
    const sNum = parseInt(prevEx.num_scheda);
    if (!isNaN(sNum) && sNum >= currentNumScheda) return;
    
    for (let w = 1; w <= 6; w++) {
      const insVal = prevEx['ins_week' + w];
      if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
        const perf = estraiMigliorPrestazioneInput(insVal, getRepsForWeek(w, prevEx) || targetReps, isCavo);
        if (perf) {
          if (perf.e1rm > best1RM) {
            best1RM = perf.e1rm;
          }
        }
      }
    }
  });

  if (best1RM > 0) {
    let estimatedWeight = calcolaPesoDaE1RMSmorzato(best1RM, targetReps, isCavo);
    // Per alte ripetizioni (> 10 reps), il peso stimato non deve mai superare il 65% dell'e1RM di riferimento
    if (targetReps > 10 && estimatedWeight > best1RM * 0.65) {
      estimatedWeight = best1RM * 0.60;
    }
    return Math.round(estimatedWeight * 10) / 10;
  }
  return null;
};

const arrotondaAStep125 = (val) => {
  if (val === null || val === undefined || isNaN(val) || val <= 0) return null;
  const step = 1.25;
  const rounded = Math.round(val / step) * step;
  return Math.round(rounded * 100) / 100;
};

const calcolaDettaglioMassimale1RMPuro = () => {
  if (!workout.value) return { best1RM: 0, bestSource: null };
  if (isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value) {
    return { best1RM: 0, bestSource: null, isCorpoLiberoPuro: true };
  }
  const currentNumScheda = parseInt(workout.value.num_scheda);
  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  let best1RM = 0;
  let bestSource = null;

  if (storicoEsercizio.value && storicoEsercizio.value.length) {
    // 1. Priorità: miglior carico numerico registrato nella week 6 (num_ins6 / ins_week6)
    storicoEsercizio.value.forEach(prevEx => {
      const sNum = parseInt(prevEx.num_scheda);
      if (!isNaN(sNum) && sNum >= currentNumScheda) return;

      const pesoW6Str = (prevEx.ins_week6 ? estraiPesoDaInput(prevEx.ins_week6) : null) || (prevEx.num_ins6 ? estraiPesoDaInput(prevEx.num_ins6) : null);
      if (pesoW6Str) {
        const weight = parseFloat(pesoW6Str);
        if (!isNaN(weight) && weight > 0) {
          const repsVal = prevEx.reps_week6;
          let repsNum = repsVal ? parseInt(repsVal, 10) : estraiRepsDaPrescrizione(prevEx.des_week6);
          const inputReps = estraiRepsDaInput(prevEx.ins_week6);
          if (inputReps !== null && !isNaN(inputReps) && inputReps > 0) {
            repsNum = inputReps;
          }
          if (!repsNum) repsNum = 6;

          const e1rm = calcolaE1RMSmorzato(weight, repsNum, isCavo);
          if (e1rm > best1RM) {
            best1RM = e1rm;
            const dEx = getExecutionDate(prevEx, storicoEsercizio.value, workout.value);
            bestSource = {
              id: prevEx.id || prevEx.num_riga,
              peso: weight,
              reps: repsNum,
              fatica: prevEx.num_faticaw6 || null,
              numScheda: prevEx.num_scheda,
              date: dEx,
              tempoTrascorso: tempoTrascorsoBreve(dEx)
            };
          }
        }
      }
    });

    // 2. Fallback: se in Week 6 non c'è nulla, cerca il miglior 1RM tra tutte le settimane W1-W6 delle schede precedenti
    if (best1RM === 0) {
      storicoEsercizio.value.forEach(prevEx => {
        const sNum = parseInt(prevEx.num_scheda);
        if (!isNaN(sNum) && sNum >= currentNumScheda) return;
        for (let w = 1; w <= 6; w++) {
          const val = prevEx['ins_week' + w];
          if (val) {
            const pesoStr = estraiPesoDaInput(val);
            if (pesoStr) {
              const weight = parseFloat(pesoStr);
              if (!isNaN(weight) && weight > 0) {
                const repsVal = prevEx['reps_week' + w];
                let repsNum = repsVal ? parseInt(repsVal, 10) : estraiRepsDaPrescrizione(prevEx['des_week' + w]);
                const inputReps = estraiRepsDaInput(val);
                if (inputReps !== null && !isNaN(inputReps) && inputReps > 0) {
                  repsNum = inputReps;
                }
                if (!repsNum) repsNum = 6;

                const e1rm = calcolaE1RMSmorzato(weight, repsNum, isCavo);
                if (e1rm > best1RM) {
                  best1RM = e1rm;
                  const dEx = getExecutionDate(prevEx, storicoEsercizio.value, workout.value);
                  bestSource = {
                    id: prevEx.id || prevEx.num_riga,
                    peso: weight,
                    reps: repsNum,
                    fatica: prevEx['num_faticaw' + w] || null,
                    numScheda: prevEx.num_scheda,
                    date: dEx,
                    tempoTrascorso: tempoTrascorsoBreve(dEx)
                  };
                }
              }
            }
          }
        }
      });
    }
  }

  // Se la scheda corrente ha un caricamento registrato in week 6
  if (inputSettimane.value && inputSettimane.value[6]) {
    const insVal = inputSettimane.value[6]?.ins;
    if (insVal) {
      const weightStr = estraiPesoDaInput(insVal);
      if (weightStr) {
        const weight = parseFloat(weightStr);
        if (!isNaN(weight) && weight > 0) {
          const rExecuted = estraiRepsDaInput(insVal) || getRepsPerWeek(6);
          if (rExecuted) {
            const e1rm = calcolaE1RMSmorzato(weight, rExecuted, isCavo);
            if (e1rm > best1RM) {
              best1RM = e1rm;
              bestSource = {
                id: workout.value.id,
                peso: weight,
                reps: rExecuted,
                fatica: workout.value.num_faticaw6 || null,
                numScheda: workout.value.num_scheda,
                date: workout.value.dat_scheda_ult_ex || workout.value.timestamp,
                tempoTrascorso: 'questa scheda'
              };
            }
          }
        }
      }
    }
  }

  return { best1RM, bestSource };
};

const calcolaMassimale1RMPuro = () => {
  return calcolaDettaglioMassimale1RMPuro().best1RM;
};

const getRiferimentoSfidaRecord = (sett) => {
  if (!workout.value) return null;
  const repsTarget = getRepsPerWeek(sett);
  if (!repsTarget) return null;
  const isCavo = isCavoOMacchinaEsercizio(workout.value);

  const recordRealeInfo = ottieniDettaglioRecordStoricoPerReps(repsTarget);
  const recordEsatto = recordRealeInfo ? recordRealeInfo.peso : null;
  const recordStimatoRaw = stimaRecordStoricoPerReps(repsTarget);

  let stimaDaSchedaCorrente = 0;
  if (sett > 1 && inputSettimane.value) {
    for (let w = 1; w < sett; w++) {
      const insVal = inputSettimane.value[w]?.ins;
      if (insVal) {
        const perf = estraiMigliorPrestazioneInput(insVal, getRepsPerWeek(w), isCavo);
        if (perf) {
          let estW = calcolaPesoDaE1RMSmorzato(perf.e1rm, repsTarget, isCavo);
          if (repsTarget > 10 && estW > perf.e1rm * 0.65) {
            estW = perf.e1rm * 0.60;
          }
          if (estW > stimaDaSchedaCorrente) {
            stimaDaSchedaCorrente = estW;
          }
        }
      }
    }
  }

  const recordStimatoUnrounded = Math.max(recordStimatoRaw || 0, stimaDaSchedaCorrente || 0);
  const recordStimato = recordStimatoUnrounded > 0 ? arrotondaAStep125(recordStimatoUnrounded) : null;
  const massimaleInfo = calcolaDettaglioMassimale1RMPuro();
  const massimaleRaw = massimaleInfo ? massimaleInfo.best1RM : 0;
  const massimale1RM = massimaleRaw > 0 ? arrotondaAStep125(massimaleRaw) : null;

  let pesoMassimo = Math.max(
    recordEsatto || 0,
    recordStimato || 0
  );

  // SANITY CHECK IMPERATIVO CONTRO IL MASSIMALE ASSOLUTO:
  const absGenWeight = (suggerimentoRecord.value && suggerimentoRecord.value.recordAbsolute > 0)
    ? suggerimentoRecord.value.recordAbsolute
    : (massimaleInfo?.bestSource?.peso || 0);
  const absGenReps = (suggerimentoRecord.value && suggerimentoRecord.value.recordAbsoluteReps > 0)
    ? suggerimentoRecord.value.recordAbsoluteReps
    : (massimaleInfo?.bestSource?.reps || 0);

  if (absGenWeight > 0) {
    // 1. Se il target richiede un numero di ripetizioni >= alle ripetizioni del record assoluto,
    // il carico target stimato non può MAI essere maggiore o uguale al carico del Max Assoluto
    if (repsTarget >= absGenReps && pesoMassimo >= absGenWeight) {
      const e1rmAbs = calcolaE1RMSmorzato(absGenWeight, absGenReps, isCavo);
      const estDaAbs = calcolaPesoDaE1RMSmorzato(e1rmAbs, repsTarget, isCavo);
      pesoMassimo = Math.min(pesoMassimo, estDaAbs > 0 ? estDaAbs : absGenWeight - getWeightStep(false, absGenWeight));
    }
    // 2. In ogni caso, il carico stimato non deve eccedere la curva teorica 1RM del Max Assoluto
    const e1rmAbs = calcolaE1RMSmorzato(absGenWeight, absGenReps || 6, isCavo);
    const maxConsentito = calcolaPesoDaE1RMSmorzato(e1rmAbs, repsTarget, isCavo);
    if (maxConsentito > 0 && pesoMassimo > maxConsentito) {
      pesoMassimo = maxConsentito;
    }
  }

  // 3. Se la ricerca per reps elevate (>10) non ha un record esatto a quelle reps,
  // limita il peso massimo stimato al 65% dell'1RM assoluto/di riferimento per evitare target esagerati
  const bestRef1RM = Math.max(massimaleRaw || 0, absGenWeight > 0 ? calcolaE1RMSmorzato(absGenWeight, absGenReps || 6, isCavo) : 0);
  if (!recordEsatto && bestRef1RM > 0 && repsTarget > 10) {
    const capAlteReps = bestRef1RM * 0.65;
    if (pesoMassimo > capAlteReps) {
      pesoMassimo = capAlteReps;
    }
  }

  if (pesoMassimo <= 0) return null;

  const isStima = pesoMassimo !== recordEsatto;

  return {
    peso: arrotondaAStep125(pesoMassimo),
    recordReale: recordEsatto ? arrotondaAStep125(recordEsatto) : null,
    recordRealeInfo: recordRealeInfo,
    recordStimato: recordStimato,
    massimale1RM: massimale1RM,
    massimaleInfo: massimaleInfo,
    isStima: isStima
  };
};

const analizzaRecordSettimana = (sett) => {
  if (!workout.value) return null;
  if (sett === 4 && isWeek4Scarico.value) return null;
  const targetReps = getRepsPerWeek(sett);
  const recordPuntuale = ottieniRecordStoricoPerReps(targetReps);
  const recordStimato = stimaRecordStoricoPerReps(targetReps);
  const recordVal = Math.max(recordPuntuale || 0, recordStimato || 0);
  if (!recordVal || recordVal <= 0) return null;

  // Vediamo se c'è un input inserito
  const currentInput = inputSettimane.value[sett]?.ins;
  const currentPesoStr = currentInput ? estraiPesoDaInput(currentInput) : null;
  const currentPeso = currentPesoStr ? parseFloat(currentPesoStr) : null;

  let pesoDaValutare = null;
  let tipoValutato = ''; // 'logged' o 'ghost'

  if (currentPeso !== null && !isNaN(currentPeso) && currentPeso > 0) {
    pesoDaValutare = currentPeso;
    tipoValutato = 'logged';
  } else {
    // Altrimenti valutiamo la proposta Ghost effettiva raccomandata
    const ghostRender = getGhostRenderInfo(sett);
    if (ghostRender && ghostRender.valueText) {
      const pStr = estraiPesoDaInput(ghostRender.valueText);
      const pVal = pStr ? parseFloat(pStr) : null;
      if (pVal !== null && !isNaN(pVal) && pVal > 0) {
        pesoDaValutare = pVal;
        tipoValutato = 'ghost';
      }
    }
    if (pesoDaValutare === null) {
      const ghost = getGhostLiftSmart(sett);
      if (ghost) {
        const ghostPeso = ghost.isPostScarico && ghost.pesoProposto !== undefined ? ghost.pesoProposto : ghost.peso;
        if (ghostPeso && !isNaN(ghostPeso) && ghostPeso > 0) {
          pesoDaValutare = ghostPeso;
          tipoValutato = 'ghost';
        }
      }
    }
  }

  if (pesoDaValutare === null) return null;

  if (pesoDaValutare >= recordVal) {
    return {
      stato: 'record',
      tipo: tipoValutato,
      peso: pesoDaValutare,
      record: recordVal,
      diff: Math.round((pesoDaValutare - recordVal) * 10) / 10,
      targetReps
    };
  } else if (pesoDaValutare >= recordVal * 0.95 || pesoDaValutare >= recordVal - 2.5) {
    return {
      stato: 'quasi-record',
      tipo: tipoValutato,
      peso: pesoDaValutare,
      record: recordVal,
      diff: Math.round((recordVal - pesoDaValutare) * 10) / 10,
      targetReps
    };
  }

  return null;
};

const calcolaIncrementoDinamicoMedio = (targetWeek) => {
  const pesiSettimanali = [];
  for (let w = 1; w < targetWeek; w++) {
    // Escludiamo la week 4 se è di scarico per evitare distorsioni
    if (w === 4 && isWeek4Scarico.value) continue;
    
    const insVal = inputSettimane.value[w]?.ins;
    if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
      const pesoStr = estraiPesoDaInput(insVal);
      if (pesoStr) {
        const peso = parseFloat(pesoStr);
        if (!isNaN(peso) && peso > 0) {
          pesiSettimanali.push({ week: w, peso: peso });
        }
      }
    }
  }

  let sommaPercentuali = 0;
  let conteggio = 0;
  
  for (let i = 0; i < pesiSettimanali.length - 1; i++) {
    const p1 = pesiSettimanali[i].peso;
    const p2 = pesiSettimanali[i+1].peso;
    if (p2 > p1) {
      const pct = (p2 - p1) / p1;
      sommaPercentuali += pct;
      conteggio++;
    }
  }

  if (conteggio > 0) {
    return sommaPercentuali / conteggio;
  }

  // Fallback storico
  let storicoSommaPct = 0;
  let storicoConteggio = 0;
  
  if (storicoEsercizio.value && storicoEsercizio.value.length > 0) {
    storicoEsercizio.value.forEach(prevEx => {
      const pesiEx = [];
      for (let w = 1; w <= 6; w++) {
        if (w === 4 && isWeek4Scarico.value) continue;
        const insVal = prevEx['ins_week' + w];
        if (insVal) {
          const pesoStr = estraiPesoDaInput(insVal);
          if (pesoStr) {
            const peso = parseFloat(pesoStr);
            if (!isNaN(peso) && peso > 0) {
              pesiEx.push(peso);
            }
          }
        }
      }
      for (let i = 0; i < pesiEx.length - 1; i++) {
        const p1 = pesiEx[i];
        const p2 = pesiEx[i+1];
        if (p2 > p1) {
          storicoSommaPct += (p2 - p1) / p1;
          storicoConteggio++;
        }
      }
    });
  }

  if (storicoConteggio > 0) {
    return storicoSommaPct / storicoConteggio;
  }

  return 0.025; // 2.5% default
};
// ----------------------------------------

const targetRepsAttive = computed(() => {
  return getRepsPerWeek(aiutoWeek.value);
});

const targetPrescrizioneAttiva = computed(() => {
  if (!workout.value) return '';
  return workout.value['des_week' + aiutoWeek.value] || '';
});

const isInputIndicaLimiteOStallo = (insText, noteText, faticaText) => {
  // Se l'analisi note è disattivata dall'utente (default), non leggiamo le parole libere inserite nei campi
  const noteInsText = ghostAnalisiNoteAttiva.value ? `${insText || ''} ${noteText || ''}` : '';

  // Gestione fatica esplicita e sensibilità fatica
  let explicitFatica = faticaText || '';
  if (sensibilitaFaticaGhost.value === 'aggressiva') {
    // Modalità Spinta: ignora avvisi lievi, interviene solo su fatica Devastante / RPE 10
    explicitFatica = (explicitFatica.toLowerCase().includes('devastante') || explicitFatica.toLowerCase().includes('rpe10') || explicitFatica.toLowerCase().includes('rpe 10')) ? explicitFatica : '';
  } else if (sensibilitaFaticaGhost.value === 'bilanciata') {
    // Modalità Bilanciata: considera fatica Alta, Pesante o Devastante
    explicitFatica = (explicitFatica.toLowerCase().includes('pesante') || explicitFatica.toLowerCase().includes('alta') || explicitFatica.toLowerCase().includes('devastante')) ? explicitFatica : '';
  }
  
  const text = `${noteInsText} ${explicitFatica}`.toLowerCase();
  if (!text.trim()) return false;

  const keywords = [
    'difficile', 'durissimo', 'durissima', 'duro', 'dura', 'limite', 'al limite', 'a limite',
    'pesante', 'troppo pesante', 'cedimento', 'faticoso', 'sofferto', 'max', 'stallo', 'incerto',
    'fatica alta', 'rpe 9.5', 'rpe 10', 'rpe9.5', 'rpe10', 'molto faticoso'
  ];

  return keywords.some(kw => text.includes(kw));
};

const getBaseWeekInfo = (sett) => {
  if (!workout.value) return null;
  let baseWNum = null;
  let isPreviousWorkoutW6 = false;

  const isComfortAttivo = infortuniAttiviEsercizio.value && infortuniAttiviEsercizio.value.length > 0 && !ghostSbloccato.value;

  if (isComfortAttivo && sett > 1) {
    // In modalità comfort, scansioniamo all'indietro per prendere l'ultima settimana realmente loggata
    for (let w = sett - 1; w >= 1; w--) {
      const insVal = inputSettimane.value[w]?.ins;
      if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
        baseWNum = w;
        break;
      }
    }
    if (baseWNum === null) {
      baseWNum = sett - 1;
    }
  } else if (sett === 2) {
    const baseW = propostaBaseWeek2.value; // "W1" o "W6 Prec."
    if (baseW === 'W6 Prec.') {
      isPreviousWorkoutW6 = true;
    } else {
      baseWNum = 1;
    }
  } else if (sett === 3) {
    baseWNum = 2;
  } else if (sett === 4) {
    baseWNum = 2;
  } else if (sett === 5) {
    baseWNum = parseInt(propostaBaseWeek5.value.replace('W', ''), 10) || 3;
  } else if (sett === 6) {
    baseWNum = parseInt(propostaBaseWeek6.value.replace('W', ''), 10) || 5;
  } else if (sett > 1) {
    baseWNum = sett - 1;
  }

  let repsBase = 10;
  let pesoBase = null;
  let baseInsText = '';
  let noteText = '';
  let faticaText = '';

  if (isPreviousWorkoutW6) {
    if (previousWorkout.value) {
      const prevW6Text = previousWorkout.value.num_ins6 || previousWorkout.value.ins_week6;
      if (prevW6Text) {
        baseInsText = String(prevW6Text);
        const pStr = estraiPesoDaInput(baseInsText);
        pesoBase = pStr ? parseFloat(pStr) : null;
      }
      const prevW6Reps = previousWorkout.value.reps_week6 || estraiRepsDaPrescrizione(previousWorkout.value.des_week6);
      repsBase = prevW6Reps ? parseInt(prevW6Reps, 10) : 10;
      noteText = previousWorkout.value.des_note || '';
      faticaText = previousWorkout.value.des_fatica || '';
    }
  } else if (baseWNum !== null) {
    noteText = inputSettimane.value[baseWNum]?.not || '';
    faticaText = inputSettimane.value[baseWNum]?.fatica || '';
    const baseIns = inputSettimane.value[baseWNum]?.ins;
    if (baseIns) {
      baseInsText = String(baseIns);
      const pStr = estraiPesoDaInput(baseIns);
      pesoBase = pStr ? parseFloat(pStr) : null;
      
      const repsEseguite = estraiRepsDaInput(baseIns);
      if (repsEseguite !== null && !isNaN(repsEseguite) && repsEseguite > 0 && repsEseguite <= 50) {
        repsBase = repsEseguite;
      } else {
        const repsVal = workout.value['reps_week' + baseWNum];
        repsBase = repsVal ? parseInt(repsVal, 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWNum]) || 10);
      }
    } else {
      const repsVal = workout.value['reps_week' + baseWNum];
      repsBase = repsVal ? parseInt(repsVal, 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWNum]) || 10);
    }
  }

  const repsTargetVal = workout.value['reps_week' + sett];
  const repsTarget = repsTargetVal ? parseInt(repsTargetVal, 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + sett]) || 10);

  return {
    baseWNum,
    isPreviousWorkoutW6,
    repsBase,
    repsTarget,
    pesoBase,
    baseInsText,
    noteText,
    faticaText
  };
};

const calcolaProposteStoricoPerSettimana = (targetW) => {
  if (!workout.value) return [];
  
  const targetReps = (() => {
    const reps = workout.value['reps_week' + targetW];
    if (reps) return parseInt(reps, 10);
    const presc = workout.value['des_week' + targetW];
    return estraiRepsDaPrescrizione(presc) || 10;
  })();
  
  const list = [];
  const currentNumScheda = parseInt(workout.value.num_scheda);
  
  // 1. Processa lo storico (solo schede precedenti)
  if (storicoEsercizioPerAiuto.value.length) {
    storicoEsercizioPerAiuto.value.forEach(prevEx => {
      const sNum = parseInt(prevEx.num_scheda);
      if (!isNaN(sNum) && sNum >= currentNumScheda) return; // Evita di duplicare la scheda corrente
      
      for (let w = 1; w <= 6; w++) {
        const insVal = prevEx['ins_week' + w];
        if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
          const weightStr = estraiPesoDaInput(insVal);
          if (weightStr) {
            const weight = parseFloat(weightStr);
            if (!isNaN(weight) && weight > 0) {
              const repsVal = prevEx['reps_week' + w];
              let repsNum = repsVal ? parseInt(repsVal, 10) : estraiRepsDaPrescrizione(prevEx['des_week' + w]);
              const inputReps = estraiRepsDaInput(insVal);
              if (inputReps !== null && !isNaN(inputReps) && inputReps > 0) {
                repsNum = inputReps;
              }
              if (repsNum && repsNum > 0) {
                const isSameWeek = w === targetW;
                const isPeakWeek = w === 6;
                const isSameReps = repsNum === targetReps;
                
                if (isSameWeek || isPeakWeek || isSameReps) {
                  // 1. Stima 1RM tramite formula di Epley considerando RIR originale
                  const rirOriginale = estraiRIRDaPrescrizione(prevEx['des_week' + w]) !== null 
                    ? estraiRIRDaPrescrizione(prevEx['des_week' + w]) 
                    : getRIRDefault(w);
                  
                  const estimated1RM = weight * (1 + (repsNum + rirOriginale) / 30);
                  
                  // 2. Calcolo teorico per il target reps e RIR target
                  const rirTarget = estraiRIRDaPrescrizione(workout.value['des_week' + targetW]) !== null 
                    ? estraiRIRDaPrescrizione(workout.value['des_week' + targetW]) 
                    : getRIRDefault(targetW);
                    
                  let proposedWeight = estimated1RM / (1 + (targetReps + rirTarget) / 30);
                  
                  // Limita il peso se a corpo libero e le reps salgono rispetto all'originale
                  if (isCorpoLiberoEsercizio(workout.value) && targetReps > repsNum) {
                    if (proposedWeight > weight) {
                      proposedWeight = weight;
                    }
                  }
                  
                  // 3. Gestione dello sforzo: Aggiustamento in base alla fatica registrata in Week 6 di quel mesociclo
                  const faticaStr = String(prevEx.num_faticaw6 || '').toLowerCase().trim();
                  const rpeVal = estraiRpeDaInput(prevEx['ins_week' + w]) || estraiRpeDaInput(prevEx.num_faticaw6);
                  let coeffFatica = 1.0;
                  let spiegazioneFatica = 'Fatica: n.d.';
                  if (rpeVal !== null) {
                    if (rpeVal >= 9.5) {
                      const stDev = FATICA_DEVASTANTE_STORICO_PCT.value;
                      coeffFatica = 1 - (stDev / 100);
                      spiegazioneFatica = `RPE ${rpeVal} (Sforzo elevato: -${stDev}%)`;
                    } else if (rpeVal >= 8.5) {
                      const stPes = FATICA_PESANTE_STORICO_PCT.value;
                      coeffFatica = 1 - (stPes / 100);
                      spiegazioneFatica = `RPE ${rpeVal} (Sforzo alto: -${stPes}%)`;
                    } else if (rpeVal >= 7.5) {
                      coeffFatica = 1.00;
                      spiegazioneFatica = `RPE ${rpeVal} (Sforzo target: 0%)`;
                    } else {
                      coeffFatica = 1.01;
                      spiegazioneFatica = `RPE ${rpeVal} (Sforzo contenuto: +1%)`;
                    }
                  } else if (faticaStr) {
                    if (faticaStr.includes('legger') || faticaStr.includes('bass') || faticaStr === '1' || faticaStr === '2') {
                      coeffFatica = 1.01;
                      spiegazioneFatica = 'Fatica leggera (+1%)';
                    } else if (faticaStr.includes('medi') || faticaStr === '3') {
                      coeffFatica = 1.00;
                      spiegazioneFatica = 'Fatica media (0%)';
                    } else if (faticaStr.includes('pesant') || faticaStr === '4') {
                      const stPes = FATICA_PESANTE_STORICO_PCT.value;
                      coeffFatica = 1 - (stPes / 100);
                      spiegazioneFatica = `Fatica pesante (-${stPes}%)`;
                    } else if (faticaStr.includes('devastant') || faticaStr === '5') {
                      const stDev = FATICA_DEVASTANTE_STORICO_PCT.value;
                      coeffFatica = 1 - (stDev / 100);
                      spiegazioneFatica = `Fatica devastante (-${stDev}%)`;
                    }
                  }
                  proposedWeight *= coeffFatica;
                  
                  // 4. Fisiologia del recupero e deallenamento (Tempo trascorso)
                  const dataUltimaEx = getExecutionDate(prevEx, storicoEsercizioPerAiuto.value, workout.value);
                  const giorniTrascorsi = calcolaGiorniTrascorsi(dataUltimaEx);
                  const tempoPassato = tempoTrascorso(dataUltimaEx) || 'Data n.d.';
                  
                  let coeffTempo = 1.0;
                  let spiegazioneTempo = 'Nessun deallenamento';
                  if (giorniTrascorsi > 180) {
                    coeffTempo = 0.78; // -22% deallenamento profondo
                    spiegazioneTempo = 'Deallenamento profondo (>6 mesi: -22%)';
                  } else if (giorniTrascorsi > 90) {
                    coeffTempo = 0.85; // -15% deallenamento marcato
                    spiegazioneTempo = 'Deallenamento marcato (>3 mesi: -15%)';
                  } else if (giorniTrascorsi > 60) {
                    coeffTempo = 0.91; // -9% deallenamento moderato
                    spiegazioneTempo = 'Deallenamento moderato (>2 mesi: -9%)';
                  } else if (giorniTrascorsi > 30) {
                    coeffTempo = 0.95; // -5% deallenamento lieve
                    spiegazioneTempo = 'Deallenamento lieve (>30 gg: -5%)';
                  } else if (giorniTrascorsi > 14) {
                    coeffTempo = 0.98; // -2% perdita forza iniziale
                    spiegazioneTempo = 'Perdita forza iniziale (>14 gg: -2%)';
                  } else {
                    coeffTempo = 1.0;
                    spiegazioneTempo = 'Recupero ottimale (<14 gg: 0%)';
                  }
                  proposedWeight *= coeffTempo;
                  
                  const isManubri = isManubriEsercizio(workout.value);
                  const step = getWeightStep(isManubri, weight);
                  const roundedProposed = Math.round(proposedWeight / step) * step;
                  
                  list.push({
                    id: prevEx.id,
                    week: w,
                    numScheda: prevEx.num_scheda,
                    data: formattaDataStorico(dataUltimaEx),
                    giorniTrascorsi,
                    tempoPassato,
                    pesoOriginale: weight,
                    repsOriginali: repsNum,
                    massimaleStimato: Math.round(estimated1RM * 10) / 10,
                    pesoProposto: roundedProposed,
                    isSameWeek,
                    isPeakWeek,
                    isSameReps,
                    coeffFatica,
                    coeffTempo,
                    spiegazioneFatica,
                    spiegazioneTempo,
                    rirOriginale,
                    rirTarget,
                    isCurrentMesocycle: false
                  });
                }
              }
            }
          }
        }
      }
    });
  }
  
  // 2. Aggiungi la progressione del mesociclo attuale (settimane precedenti a targetW)
  for (let w = 1; w < targetW; w++) {
    const insVal = inputSettimane.value[w]?.ins || workout.value['ins_week' + w];
    if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
      const perf = estraiMigliorPrestazioneInput(insVal, getRepsPerWeek(w), isCavoOMacchinaEsercizio(workout.value));
      if (perf) {
        const weight = perf.peso;
        const repsNum = perf.reps;
        const estimated1RM = perf.e1rm;
        
        // Calcolo progressione diretta mesociclo attuale
        const rirOriginale = estraiRIRDaPrescrizione(workout.value['des_week' + w]) !== null 
          ? estraiRIRDaPrescrizione(workout.value['des_week' + w]) 
          : getRIRDefault(w);
        
        const rirTarget = estraiRIRDaPrescrizione(workout.value['des_week' + targetW]) !== null 
          ? estraiRIRDaPrescrizione(workout.value['des_week' + targetW]) 
          : getRIRDefault(targetW);
          
        let proposedWeight = estimated1RM / (1 + (targetReps + rirTarget) / 30);
        
        const isManubri = isManubriEsercizio(workout.value);
        const step = getWeightStep(isManubri, weight);
        const roundedProposed = Math.round(proposedWeight / step) * step;
        
        list.push({
          id: workout.value.id || 'current',
          week: w,
          numScheda: currentNumScheda,
          data: 'Mesociclo in corso',
          giorniTrascorsi: 0,
          tempoPassato: 'Attuale',
          pesoOriginale: weight,
          repsOriginali: repsNum,
          massimaleStimato: Math.round(estimated1RM * 10) / 10,
          pesoProposto: roundedProposed,
          isSameWeek: false,
          isPeakWeek: false,
          isSameReps: repsNum === targetReps,
          coeffFatica: 1.0,
          coeffTempo: 1.0,
          spiegazioneFatica: 'Sforzo: Mesociclo attuale',
          spiegazioneTempo: 'Tempo: Mesociclo attuale',
          rirOriginale,
          rirTarget,
          isCurrentMesocycle: true
        });
      }
    }
  }
  
  // Ordina in base al peso proposto dal più piccolo al più grande (crescente)
  list.sort((a, b) => {
    if (a.pesoProposto !== b.pesoProposto) {
      return a.pesoProposto - b.pesoProposto;
    }
    // A parità di peso proposto, preferisci mesociclo attuale e poi schede più recenti
    if (a.isCurrentMesocycle !== b.isCurrentMesocycle) {
      return b.isCurrentMesocycle ? 1 : -1;
    }
    return parseInt(b.numScheda) - parseInt(a.numScheda);
  });
  
  return list;
};

const calcolaCaricoIdealeConsigliatoPerSettimana = (targetW) => {
  const proposte = calcolaProposteStoricoPerSettimana(targetW);
  if (!proposte || proposte.length === 0) return null;
  
  let bestProp = null;
  let bestScore = -99999;
  
  proposte.forEach(prop => {
    let score = 0;
    if (prop.isCurrentMesocycle) {
      score += 1000; // Priorità assoluta alla progressione del mesociclo attuale
      score += prop.week * 10; // Preferisci settimane più recenti dello stesso mesociclo (es. W2 over W1)
    } else {
      if (prop.isSameWeek) score += 100;
      if (prop.isSameReps) score += 50;
      if (prop.isPeakWeek) score += 20;
      
      // Bonus per schede più recenti
      score += parseInt(prop.numScheda) * 3;
      
      // Penalizzazione per tempo trascorso (deallenamento)
      score -= (prop.giorniTrascorsi * 0.15);
    }
    
    if (score > bestScore) {
      bestScore = score;
      bestProp = prop;
    }
  });
  
  return bestProp;
};

const getPesoPropostoDettaglioForWeek = (sett) => {
  if (!workout.value) return null;
  const ghost = getGhostLift(sett);
  if (!ghost) return null;
  if (ghost.isPostScarico && ghost.pesoProposto !== undefined) {
    return ghost.pesoProposto;
  }
  return ghost.peso;
};

const getVolumeProgressionInfoForWeek = (sett) => {
  if (!workout.value) return { active: false };
  
  // La progressione di volume è attiva solo nella modalità Ibrida
  if (modalitaIncrementoGhost.value !== 'ibrida') {
    return { active: false };
  }
  
  const info = getBaseWeekInfo(sett);
  if (!info || info.pesoBase === null) return { active: false };
  
  const potenziale = calcolaCaricoIdealeConsigliatoPerSettimana(sett)?.pesoProposto || null;
  const prudenziale = getPesoPropostoDettaglioForWeek(sett);
  
  if (potenziale !== null && prudenziale !== null && potenziale < prudenziale) {
    if (info.repsTarget > info.repsBase) {
      return {
        active: true,
        pesoBase: info.pesoBase,
        repsBase: info.repsBase,
        repsTarget: info.repsTarget,
        baseWNum: info.baseWNum,
        isPreviousWorkoutW6: info.isPreviousWorkoutW6
      };
    }
  }
  
  return { active: false };
};

const getCaricoConsigliatoViaDiMezzoForWeek = (sett) => {
  if (!workout.value) return null;

  // 0. Se la settimana ha un carico prescritto dal coach (es. progressione di forza preimpostata)
  const presc = parsedPrescription(workout.value['des_week' + sett]);
  if (presc && presc.total) {
    const pNum = parseFloat(String(presc.total).replace(',', '.'));
    if (!isNaN(pNum) && pNum > 0) {
      return pNum;
    }
  }

  if (sett === 1) {
    return propostaWeek1.value?.peso || null;
  }

  // Nuova regola per Week 2 a peso
  if (sett === 2 && regolaProgressioneW2.value === 'peso') {
    const infoBase = getBaseWeekInfo(2);
    if (infoBase && infoBase.pesoBase !== null && infoBase.pesoBase > 0) {
      const isManubri = isManubriEsercizio(workout.value);
      const step = getWeightStep(isManubri, infoBase.pesoBase);
      return infoBase.pesoBase + step; // Proponi esattamente W1 + step (es. 12 + 2 = 14)
    }
  }

  const volInfo = getVolumeProgressionInfoForWeek(sett);
  if (volInfo.active) {
    return volInfo.pesoBase;
  }
  
  const potenziale = calcolaCaricoIdealeConsigliatoPerSettimana(sett)?.pesoProposto || null;
  const prudenziale = getPesoPropostoDettaglioForWeek(sett);
  
  const isManubri = isManubriEsercizio(workout.value);
  const infoBase = getBaseWeekInfo(sett);
  const pesoBase = infoBase && infoBase.pesoBase !== null && !isNaN(infoBase.pesoBase) ? infoBase.pesoBase : 0;
  const step = getWeightStep(isManubri, pesoBase);

  // Se l'utente ha segnalato che l'esercizio era al limite/difficile, consiglia di mantenere il peso base per progressione su reps
  if (infoBase && isInputIndicaLimiteOStallo(infoBase.baseInsText, infoBase.noteText, infoBase.faticaText) && pesoBase > 0) {
    return pesoBase;
  }
  
  let result;
  if (modalitaIncrementoGhost.value === 'fissa') {
    // Modello Fisso: proponiamo strettamente il carico programmato prudenziale (fisso)
    result = prudenziale !== null ? Math.round(prudenziale / step) * step : null;
  } else if (modalitaIncrementoGhost.value === 'dinamica') {
    // Modello Dinamico: preferiamo il potenziale stimato dallo storico se presente, altrimenti il dinamico prudenziale
    const val = potenziale !== null ? potenziale : prudenziale;
    result = val !== null ? Math.round(val / step) * step : null;
  } else {
    // Modello Ibrido (Mix): se c'è un potenziale stimato valido superiore al peso base, usiamo direttamente il potenziale (SMART)
    if (potenziale !== null && !isNaN(potenziale) && potenziale > pesoBase) {
      result = Math.round(potenziale / step) * step;
    } else if (potenziale !== null && prudenziale !== null && !isNaN(potenziale) && !isNaN(prudenziale)) {
      const avg = (potenziale + prudenziale) / 2;
      result = Math.round(avg / step) * step;
    } else {
      result = potenziale || prudenziale || 0;
    }
  }

  // SOLUZIONE B: Salvaguardia. Il carico consigliato non deve mai essere inferiore al peso base della settimana di riferimento
  if (infoBase && infoBase.pesoBase !== null && !isNaN(infoBase.pesoBase)) {
    if (result !== null && result < infoBase.pesoBase) {
      result = infoBase.pesoBase;
    }
  }

  // Regola di aderenza alla Progressione Scheda: il carico consigliato non deve essere inferiore al 90% della Progressione Scheda (prudenziale)
  if (prudenziale !== null && !isNaN(prudenziale) && prudenziale > 0) {
    const minSogliaScheda = Math.round((prudenziale * 0.90) / step) * step;
    if (result !== null && result < minSogliaScheda) {
      result = minSogliaScheda;
    }
  }

  // Salvaguardia Incremento Massimo: Previene salti di carico irrealistici da storici remoti (es. 58kg -> 72.5kg)
  if (pesoBase > 0 && result !== null) {
    const repsTarget = infoBase ? infoBase.repsTarget : getRepsPerWeek(sett);
    const repsBase = infoBase ? infoBase.repsBase : 10;
    
    // Se le rep scendono (intensificazione, es. W5 16r -> W6 10r), il peso equivalente per pareggiare l'1RM sale!
    let pesoRiferimentoEffettivo = pesoBase;
    if (repsBase > repsTarget && repsTarget > 0) {
      const e1rmBase = pesoBase * (1 + repsBase / 30);
      const wEq = e1rmBase / (1 + repsTarget / 30);
      if (wEq > pesoBase) {
        pesoRiferimentoEffettivo = wEq;
      }
    }

    const maxIncrementoPct = isManubri ? 0.08 : (isCavoOMacchinaEsercizio(workout.value) ? 0.05 : 0.08);
    const maxPesoAccettabile = Math.max(
      pesoRiferimentoEffettivo + step, 
      Math.floor((pesoRiferimentoEffettivo * (1 + maxIncrementoPct)) / step) * step
    );
    if (result > maxPesoAccettabile) {
      result = maxPesoAccettabile;
    }
  }

  if (result !== null && !isNaN(result)) {
    result = Math.round(result / step) * step;
    if (isManubri) {
      result = arrotondaManubrioCommerciale(result);
    }
  }

  return result;
};

const getGhostLiftSmart = (sett) => {
  const ghost = getGhostLift(sett);
  if (!ghost) return null;

  // Clona l'oggetto per non mutare la cache/originale
  const smartGhost = { ...ghost };
  smartGhost.pesoBaseOriginale = ghost.peso;
  
  const smartWeight = getCaricoConsigliatoViaDiMezzoForWeek(sett);
  
  if (smartWeight !== null && smartWeight !== undefined && smartWeight > 0) {
    if (!smartGhost.isScarico) {
      smartGhost.peso = smartWeight;
    }
    if (smartGhost.isPostScarico) {
      smartGhost.pesoProposto = smartWeight;
    }
    if (smartGhost.isWeek1) {
      smartGhost.suggerito = smartWeight;
    }
  }

  // Se c'è un infortunio attivo per l'esercizio e non è stato sbloccato manualmente
  if (infortuniAttiviEsercizio.value && infortuniAttiviEsercizio.value.length > 0 && !ghostSbloccato.value) {
    const inf = infortuniAttiviEsercizio.value[0];
    const applica = inf.applica_riduzione !== false;
    const pct = inf.percentuale_riduzione !== undefined ? inf.percentuale_riduzione : calcolaPercentualeConsigliata(inf.gravita || 3);
    
    smartGhost.isGhostInfortunio = true;
    smartGhost.percentualeInfortunio = pct;
    smartGhost.applicaRiduzioneInfortunio = applica;
    smartGhost.gravitaInfortunio = inf.gravita || 3;
    smartGhost.articolazioneInfortunio = inf.articolazione_coinvolta || 'Articolazione';

    // Scansioniamo all'indietro per verificare se l'utente ha già registrato un carico reale nelle settimane precedenti
    let lastLoggedIns = null;
    let lastLoggedWeek = null;
    let lastLoggedPeso = null;

    if (sett > 1) {
      for (let w = sett - 1; w >= 1; w--) {
        const insVal = inputSettimane.value[w]?.ins;
        if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
          const p = parseFloat(estraiPesoDaInput(insVal));
          if (!isNaN(p) && p > 0) {
            lastLoggedIns = insVal;
            lastLoggedWeek = w;
            lastLoggedPeso = p;
            break;
          }
        }
      }
    }

    if (lastLoggedIns) {
      smartGhost.text = lastLoggedIns;
      smartGhost.label = `W${lastLoggedWeek}`;
    }

    if (applica && pct > 0) {
      const isManubri = isManubriEsercizio(workout.value);
      const applicaRiduzioneInfortunio = (wVal) => {
        if (wVal === null || wVal === undefined || wVal <= 0) return wVal;
        const step = getWeightStep(isManubri, wVal);
        const factor = (100 - pct) / 100;
        const reduced = wVal * factor;
        return Math.max(step, Math.round(reduced / step) * step);
      };

      // EVITA LA DOPPIA RIDUZIONE:
      // Se l'utente ha già registrato un carico in modalità comfort nelle settimane precedenti (es. 12.5 kg),
      // non dobbiamo riapplicare -40% su un carico che è già ridotto!
      if (lastLoggedPeso !== null && lastLoggedPeso > 0) {
        smartGhost.peso = lastLoggedPeso;
        smartGhost.pesoProposto = lastLoggedPeso;
        if (smartGhost.suggerito > 0) {
          smartGhost.suggerito = lastLoggedPeso;
        }
      } else {
        if (smartGhost.peso > 0) {
          smartGhost.peso = applicaRiduzioneInfortunio(smartGhost.peso);
        }
        if (smartGhost.pesoProposto > 0) {
          smartGhost.pesoProposto = applicaRiduzioneInfortunio(smartGhost.pesoProposto);
        }
        if (smartGhost.suggerito > 0) {
          smartGhost.suggerito = applicaRiduzioneInfortunio(smartGhost.suggerito);
        }
      }
    }
  }
  
  return smartGhost;
};

const getGhostWeightsRangeForWeek = (sett) => {
  if (!workout.value) return null;
  const ghost = getGhostLiftSmart(sett);
  if (!ghost) return null;
  
  if (ghost.isWeek2Scritta || ghost.isCoachSet) return null;
  
  // Se è a corpo libero (rep exercise) o a percentuali, non ha senso proporre un range di pesi
  if (ghost.isRepExercise) return null;
  
  const info = getBaseWeekInfo(sett);
  const repsTarget = info ? info.repsTarget : getRepsPerWeek(sett);
  const repsBaseVal = info ? info.repsBase : 10;

  const isManubri = isManubriEsercizio(workout.value);
  const pesoBaseOriginale = ghost.pesoBaseOriginale || ghost.peso || 0;
  const pesoEffettivoBase = (ghost.text && estraiPesoDaInput(ghost.text)) ? parseFloat(estraiPesoDaInput(ghost.text)) : null;
  const pesoBase = (pesoEffettivoBase !== null && pesoEffettivoBase > 0) ? pesoEffettivoBase : pesoBaseOriginale;
  const step = getWeightStep(isManubri, sett === 1 ? (ghost.suggerito || ghost.peso || 0) : pesoBase);

  // Calcolo per Week 1
  if (sett === 1) {
    let defaultPeso = ghost.suggerito || ghost.peso || 0;
    if (isManubri) defaultPeso = arrotondaManubrioCommerciale(defaultPeso);
    if (defaultPeso <= 0) return null;
    let min = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'down') : Math.round((defaultPeso * 0.95) / step) * step;
    let medio = defaultPeso;
    let max = 0;
    
    // Evita il collasso delle opzioni (Prudenziale uguale a Consigliato)
    if (min === medio && defaultPeso - step > 0) {
      min = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'down') : defaultPeso - step;
    }
    
    const recordVal = sfidaRecordWeek1.value ? ghost.recordVal : null;
    if (recordVal && recordVal > 0) {
      if (recordVal >= defaultPeso) {
        if (recordVal <= defaultPeso * 1.25) {
          max = isManubri ? getDumbbellSequenceWeight(recordVal, 'up') : Math.round((recordVal + step) / step) * step;
        } else {
          max = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'up') : Math.round((defaultPeso * 1.10) / step) * step;
        }
      } else {
        max = isManubri ? getDumbbellSequenceWeight(medio, 'up') : medio + step;
      }
    } else {
      max = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'up') : Math.round((defaultPeso * 1.05) / step) * step;
    }
    
    // Evita il collasso delle opzioni (Sfidante uguale a Consigliato)
    if (max === medio) {
      max = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'up') : defaultPeso + step;
    }
    
    if (isManubri) {
      min = arrotondaManubrioCommerciale(min);
      medio = arrotondaManubrioCommerciale(medio);
      max = arrotondaManubrioCommerciale(max);
    }
    
    let sfidanteLabel = 'Sfidante';
    if (recordVal && recordVal > 0) {
      if (max > recordVal) {
        sfidanteLabel = `🏆 Supera Record (${formatWeight(recordVal)}kg)`;
      } else if (max === recordVal) {
        sfidanteLabel = `🏆 Eguaglia Record (${formatWeight(recordVal)}kg)`;
      } else {
        sfidanteLabel = `Sfidante (Record: ${formatWeight(recordVal)}kg)`;
      }
    }

    return {
      prudenziale: {
        value: String(min),
        display: `${formatWeight(min)} kg`,
        label: 'Prudenziale'
      },
      consigliato: {
        value: String(medio),
        display: `${formatWeight(medio)} kg`,
        label: 'Consigliato'
      },
      sfidante: {
        value: String(max),
        display: `${formatWeight(max)} kg`,
        label: sfidanteLabel
      }
    };
  }

  // Se c'è il comfort articolare attivo, calcoliamo il range con logica di tutela e progressione reps
  if (ghost.isGhostInfortunio && !ghostSbloccato.value) {
    let pesoComfort = (info && info.pesoBase && info.pesoBase > 0) 
      ? info.pesoBase 
      : (ghost.peso || ghost.suggerito || ghost.pesoProposto || 0);

    if (isManubri) pesoComfort = arrotondaManubrioCommerciale(pesoComfort);
    if (pesoComfort <= 0) return null;

    const gravita = ghost.gravitaInfortunio || 3;
    const isIntensificazione = repsTarget < repsBaseVal; // es. W6 4x6 con 6 reps dopo che in W5 si era fatto 7 o 9 reps
    const isDifficileOStallo = info ? isInputIndicaLimiteOStallo(info.baseInsText, info.noteText, info.faticaText) : false;

    // In settimane di intensificazione (es. W6 4x6) o se la settimana precedente ha segnalato dolore/difficoltà:
    // il target primario deve essere il carico comfort a repsTarget prescritte (es. 12.5 kg x 6 reps)
    if (isIntensificazione || isDifficileOStallo) {
      const prudenzialeVal = `${pesoComfort}x${repsTarget}r`;
      const prudenzialeDisplay = `${formatWeight(pesoComfort)}x${repsTarget}r`;
      const prudenzialeLabel = `Prudenziale (${repsTarget}r)`;

      const consigliatoVal = String(pesoComfort);
      const consigliatoDisplay = `${formatWeight(pesoComfort)} kg`;
      const consigliatoLabel = 'Consigliato (Comfort)';

      // Sfidante propone al massimo +1 rep (es. 7 reps in 4x6) senza forzare aumenti di peso
      const sfidanteVal = `${pesoComfort}x${repsTarget + 1}r`;
      const sfidanteDisplay = `${formatWeight(pesoComfort)}x${repsTarget + 1}r`;
      const sfidanteLabel = 'Sfidante (+1r)';

      return {
        prudenziale: {
          value: prudenzialeVal,
          display: prudenzialeDisplay,
          label: prudenzialeLabel
        },
        consigliato: {
          value: consigliatoVal,
          display: consigliatoDisplay,
          label: consigliatoLabel
        },
        sfidante: {
          value: sfidanteVal,
          display: sfidanteDisplay,
          label: sfidanteLabel
        }
      };
    }

    // Settimane a volume costante o in crescita (repsTarget >= repsBaseVal):
    const repsConsigliate = Math.max(repsTarget, repsBaseVal);
    const repsExtra = repsConsigliate + 1;

    // 1. PRUDENZIALE: Carico comfort a reps prescritte base della settimana
    const prudenzialeVal = (repsTarget < repsConsigliate) ? `${pesoComfort}x${repsTarget}r` : String(pesoComfort);
    const prudenzialeDisplay = (repsTarget < repsConsigliate) ? `${formatWeight(pesoComfort)}x${repsTarget}r` : `${formatWeight(pesoComfort)} kg`;
    const prudenzialeLabel = (repsTarget < repsConsigliate) ? `Prudenziale (${repsTarget}r)` : 'Prudenziale';

    // 2. CONSIGLIATO: Carico comfort con reps consolidate
    let consigliatoVal = `${pesoComfort}x${repsConsigliate}r`;
    let consigliatoDisplay = `${formatWeight(pesoComfort)}x${repsConsigliate}r`;
    let consigliatoLabel = (repsConsigliate > repsTarget) ? `Consigliato (${repsConsigliate}r)` : 'Consigliato (Comfort)';

    if (repsConsigliate === repsTarget && repsBaseVal <= repsTarget) {
      consigliatoVal = String(pesoComfort);
      consigliatoDisplay = `${formatWeight(pesoComfort)} kg`;
      consigliatoLabel = 'Consigliato (Comfort)';
    }

    // 3. SFIDANTE:
    let sfidanteVal = `${pesoComfort}x${repsExtra}r`;
    let sfidanteDisplay = `${formatWeight(pesoComfort)}x${repsExtra}r`;
    let sfidanteLabel = 'Sfidante (+1r)';

    if (gravita <= 3 && repsBaseVal >= repsTarget + 1) {
      const microPeso = isManubri ? getDumbbellSequenceWeight(pesoComfort, 'up') : pesoComfort + step;
      sfidanteVal = String(microPeso);
      sfidanteDisplay = `${formatWeight(microPeso)} kg`;
      sfidanteLabel = `Sfidante (+${formatWeight(microPeso - pesoComfort)}kg)`;
    }

    return {
      prudenziale: {
        value: prudenzialeVal,
        display: prudenzialeDisplay,
        label: prudenzialeLabel
      },
      consigliato: {
        value: consigliatoVal,
        display: consigliatoDisplay,
        label: consigliatoLabel
      },
      sfidante: {
        value: sfidanteVal,
        display: sfidanteDisplay,
        label: sfidanteLabel
      }
    };
  }

  if (ghost.isScarico) {
    let scaricoPeso = ghost.peso || 0;
    if (isManubri) scaricoPeso = arrotondaManubrioCommerciale(scaricoPeso);
    const repsVolume = Math.max(repsTarget + 1, repsBaseVal + 1);
    return {
      prudenziale: {
        value: String(scaricoPeso),
        display: `${formatWeight(scaricoPeso)} kg`,
        label: 'Scarico'
      },
      consigliato: {
        value: `${scaricoPeso}x${repsVolume}r`,
        display: `${formatWeight(scaricoPeso)}x${repsVolume}r`,
        label: 'Consigliato (+1r)'
      },
      sfidante: {
        value: `${scaricoPeso}x${repsVolume + 1}r`,
        display: `${formatWeight(scaricoPeso)}x${repsVolume + 1}r`,
        label: 'Sfidante (+2r)'
      }
    };
  }

  // Standard weeks (2, 3, 5, 6)
  const repsBaseTarget = info ? (workout.value['reps_week' + info.baseWNum] ? parseInt(workout.value['reps_week' + info.baseWNum], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + info.baseWNum]) || 10)) : 10;
  const isTargetCompletato = repsBaseVal >= repsTarget;
  const isEsuberoReps = repsBaseVal >= repsTarget + 2;
  const isRepsIncomplete = repsBaseVal < repsBaseTarget;

  const isDifficileOStallo = info ? isInputIndicaLimiteOStallo(info.baseInsText, info.noteText, info.faticaText) : false;

  // Controllo se nella scheda attuale a pari repsTarget l'atleta ha già eseguito questo peso (es. W3 = 12 kg a 10 reps per W6 con 10 reps)
  let prevMatchingRepsRecord = null;
  if (inputSettimane.value && sett > 1) {
    for (let w = 1; w < sett; w++) {
      const wTarget = getRepsPerWeek(w);
      if (wTarget === repsTarget) {
        const insPrev = inputSettimane.value[w]?.ins;
        if (insPrev) {
          const pPrev = parseFloat(estraiPesoDaInput(insPrev)) || 0;
          let rPrev = estraiRepsDaInput(insPrev);
          if (rPrev === null || isNaN(rPrev) || rPrev <= 0) rPrev = wTarget;
          if (pPrev > 0) {
            if (!prevMatchingRepsRecord || pPrev > prevMatchingRepsRecord.peso || (pPrev === prevMatchingRepsRecord.peso && rPrev > prevMatchingRepsRecord.reps)) {
              prevMatchingRepsRecord = { week: w, peso: pPrev, reps: rPrev };
            }
          }
        }
      }
    }
  }

  const smartWeight = getCaricoConsigliatoViaDiMezzoForWeek(sett);
  const potenzialeRaw = calcolaCaricoIdealeConsigliatoPerSettimana(sett)?.pesoProposto || null;
  let pesoConsigliato = (smartWeight !== null && smartWeight > pesoBase) 
    ? smartWeight 
    : ((potenzialeRaw !== null && potenzialeRaw > pesoBase) 
      ? potenzialeRaw 
      : (isManubri ? getDumbbellSequenceWeight(pesoBase, 'up') : pesoBase + step));
  pesoConsigliato = Math.round(pesoConsigliato / step) * step;
  let pesoSfidante = isManubri ? getDumbbellSequenceWeight(pesoConsigliato, 'up') : pesoConsigliato + step;
  pesoSfidante = Math.round(pesoSfidante / step) * step;

  if (isManubri) {
    pesoConsigliato = arrotondaManubrioCommerciale(pesoConsigliato);
    pesoSfidante = arrotondaManubrioCommerciale(pesoSfidante);
  }

  // Scenario Sforzo Elevato / Difficile / Limite: mantiene lo stesso peso (senza forzare +1r nel consigliato)
  if (isDifficileOStallo && pesoBase > 0) {
    const repsSfidanteReps = Math.max(repsTarget + 1, repsBaseVal + 1);
    const pesoSfidanteCarico = isManubri ? getDumbbellSequenceWeight(pesoBase, 'up') : pesoBase + step;
    return {
      prudenziale: {
        value: String(pesoBase),
        display: `${formatWeight(pesoBase)} kg`,
        label: 'Prudenziale'
      },
      consigliato: {
        value: String(pesoBase),
        display: `${formatWeight(pesoBase)} kg`,
        label: 'Consigliato (Stesso peso)'
      },
      sfidante: {
        value: String(pesoSfidanteCarico),
        display: `${formatWeight(pesoSfidanteCarico)} kg`,
        label: 'Sfidante (+Kg)'
      }
    };
  }

  // Scenario 0: Intensificazione (repsTarget < repsBaseVal, es. W5 target 9r -> W6 target 8r o W5 10x13r -> W6 10r)
  if (repsTarget < repsBaseVal) {
    const e1rmBase = pesoBase * (1 + repsBaseVal / 30);
    const e1rmConsigliato = pesoConsigliato * (1 + repsTarget / 30);
    // Un peso senza reps per le repsTarget è valido solo se pareggia o supera l'1RM base (entro il 95%)
    const isValidoTargetReps = e1rmConsigliato >= (e1rmBase * 0.95);

    // Se l'atleta vuole progredire a parità di peso base (Safe):
    // Per avere una progressione reale di volume rispetto a quanto già fatto (repsBaseVal), propone +1 rep (es. 36x10r o 65x14r)
    const repsProgressioneBase = repsBaseVal + 1;
    const repsSfidanteBase = repsBaseVal + 2;

    const prudenzialeValStr = `${pesoBase}x${repsProgressioneBase}r`;
    
    let consigliatoValStr;
    let consigliatoDisplayStr;
    let consigliatoLabelStr;

    if (isValidoTargetReps) {
      if (prevMatchingRepsRecord && pesoConsigliato === prevMatchingRepsRecord.peso && prevMatchingRepsRecord.reps >= repsTarget) {
        const nextReps = prevMatchingRepsRecord.reps + 1;
        consigliatoValStr = `${pesoConsigliato}x${nextReps}r`;
        consigliatoDisplayStr = `${formatWeight(pesoConsigliato)}x${nextReps}r`;
        consigliatoLabelStr = sett === 6 ? 'Consigliato (Picco W6)' : 'Consigliato (+1r)';
      } else {
        consigliatoValStr = String(pesoConsigliato);
        consigliatoDisplayStr = `${formatWeight(pesoConsigliato)} kg`;
        consigliatoLabelStr = sett === 6 ? 'Consigliato (Picco W6)' : 'Consigliato (Aumento)';
      }
    } else {
      consigliatoValStr = `${pesoBase}x${repsProgressioneBase}r`;
      consigliatoDisplayStr = `${formatWeight(pesoBase)}x${repsProgressioneBase}r`;
      consigliatoLabelStr = 'Consigliato (+1r)';
    }

    const sfidanteValStr = isValidoTargetReps ? String(pesoSfidante) : `${pesoBase}x${repsSfidanteBase}r`;
    const sfidanteDisplayStr = isValidoTargetReps ? `${formatWeight(pesoSfidante)} kg` : `${formatWeight(pesoBase)}x${repsSfidanteBase}r`;
    const sfidanteLabelStr = isValidoTargetReps ? (sett === 6 ? 'Sfidante (Picco W6)' : 'Sfidante (+Kg)') : 'Sfidante (+2r)';

    return {
      prudenziale: {
        value: prudenzialeValStr,
        display: `${formatWeight(pesoBase)}x${repsProgressioneBase}r`,
        label: 'Prudenziale (+1r)'
      },
      consigliato: {
        value: consigliatoValStr,
        display: consigliatoDisplayStr,
        label: consigliatoLabelStr
      },
      sfidante: {
        value: sfidanteValStr,
        display: sfidanteDisplayStr,
        label: sfidanteLabelStr
      }
    };
  }

  // Scenario 1: Reps Incomplete (< target)
  if (isRepsIncomplete) {
    return {
      prudenziale: {
        value: String(pesoBase),
        display: `${formatWeight(pesoBase)} kg`,
        label: 'Prudenziale'
      },
      consigliato: {
        value: `${pesoBase}x${repsBaseVal + 1}r`,
        display: `${formatWeight(pesoBase)}x${repsBaseVal + 1}r`,
        label: 'Consigliato (+1r)'
      },
      sfidante: {
        value: String(pesoConsigliato),
        display: `${formatWeight(pesoConsigliato)} kg`,
        label: 'Sfidante'
      }
    };
  }

  // Scenario 2: Surplus Reps (>= target + 2)
  if (isEsuberoReps) {
    return {
      prudenziale: {
        value: String(pesoConsigliato),
        display: `${formatWeight(pesoConsigliato)} kg`,
        label: 'Prudenziale'
      },
      consigliato: {
        value: `${pesoConsigliato}x${repsTarget + 1}r`,
        display: `${formatWeight(pesoConsigliato)}x${repsTarget + 1}r`,
        label: 'Consigliato (+1r)'
      },
      sfidante: {
        value: String(pesoSfidante),
        display: `${formatWeight(pesoSfidante)} kg`,
        label: 'Sfidante'
      }
    };
  }

  // Scenario 3: Standard Success (repsBaseVal >= repsTarget, include il caso default con solo peso scritto)
  const isVolumeProgressionAlready = repsTarget > repsBaseVal;
  const repsVolume = Math.max(repsTarget, repsBaseVal) + 1;
  const prudenzialeValue = isVolumeProgressionAlready ? String(pesoBase) : `${pesoBase}x${repsVolume}r`;
  const prudenzialeDisplay = isVolumeProgressionAlready ? `${formatWeight(pesoBase)} kg` : `${formatWeight(pesoBase)}x${repsVolume}r`;
  const prudenzialeLabel = isVolumeProgressionAlready ? 'Prudenziale (Stesso peso)' : 'Prudenziale (+1r)';

  let standardConsigliatoVal;
  let standardConsigliatoDisplay;
  let standardConsigliatoLabel;

  if (prevMatchingRepsRecord && pesoConsigliato === prevMatchingRepsRecord.peso && prevMatchingRepsRecord.reps >= repsTarget) {
    const nextReps = prevMatchingRepsRecord.reps + 1;
    standardConsigliatoVal = `${pesoConsigliato}x${nextReps}r`;
    standardConsigliatoDisplay = `${formatWeight(pesoConsigliato)}x${nextReps}r`;
    standardConsigliatoLabel = sett === 6 ? 'Consigliato (Picco W6)' : 'Consigliato (+1r)';
  } else {
    standardConsigliatoVal = String(pesoConsigliato);
    standardConsigliatoDisplay = `${formatWeight(pesoConsigliato)} kg`;
    standardConsigliatoLabel = 'Consigliato';
  }

  return {
    prudenziale: {
      value: prudenzialeValue,
      display: prudenzialeDisplay,
      label: prudenzialeLabel
    },
    consigliato: {
      value: standardConsigliatoVal,
      display: standardConsigliatoDisplay,
      label: standardConsigliatoLabel
    },
    sfidante: {
      value: String(pesoSfidante),
      display: `${formatWeight(pesoSfidante)} kg`,
      label: 'Sfidante'
    }
  };
};

const getGhostWeightsRangeText = (sett) => {
  const range = getGhostWeightsRangeForWeek(sett);
  if (!range) return '';
  const first = range.prudenziale.display.replace(/\s*kg/gi, '').trim();
  const last = range.sfidante.display.replace(/\s*kg/gi, '').trim();
  if (first === last) return first;
  
  const info = getBaseWeekInfo(sett);
  const targetR = info ? info.repsTarget : getRepsPerWeek(sett);
  if (last === `${first}x${targetR}r` || last === `${first}x${targetR}`) {
    return first;
  }
  return `${first} - ${last}`;
};

const getColoreRepsPrecedentiClass = (sett, prevReps) => {
  if (prevReps === undefined || prevReps === null) return '';
  const info = getBaseWeekInfo(sett);
  const repsTarget = info ? info.repsTarget : getRepsPerWeek(sett);
  const pReps = parseInt(prevReps, 10);
  const tReps = parseInt(repsTarget, 10);
  if (isNaN(pReps) || isNaN(tReps)) return '';
  
  if (pReps > tReps) {
    return 'text-red-lighten-2 font-weight-black'; // più reps -> rosso
  } else if (pReps === tReps) {
    return 'text-orange-lighten-2 font-weight-black'; // uguali reps -> giallo (stesso colore del lavoro)
  } else {
    return 'text-blue-lighten-3 font-weight-black'; // meno reps -> azzurro
  }
};

const calcolaAvvisoFaticaConsigliato = (sett, numConsigliato, repsTarget, repsPrev, prevPeso) => {
  if (!numConsigliato || numConsigliato <= 0 || !prevPeso || prevPeso <= 0) return '';
  if (!repsTarget || repsTarget <= 0 || !repsPrev || repsPrev <= 0) return '';

  // Se l'incremento rientra nello step naturale dell'attrezzo o è la progressione picco W6, non generiamo falso allarme
  const isManubri = workout.value ? isManubriEsercizio(workout.value) : false;
  const stepConsentito = isManubri ? 2 : 2.5;
  if (numConsigliato <= prevPeso + stepConsentito) {
    return '';
  }

  const e1rmConsigliato = numConsigliato * (1 + repsTarget / 30);
  const e1rmPrev = prevPeso * (1 + repsPrev / 30);

  // Se l'1RM stimato del carico proposto eccede significativamente (> 3.5kg) l'1RM precedentemente dimostrato
  if (e1rmConsigliato > (e1rmPrev + 3.5)) {
    return `⚠️ Con ${formatWeight(numConsigliato)}kg sarà difficile chiudere ${repsTarget} rep di fila. Se cedi, usa Rest-Pause (es. ${formatWeight(numConsigliato)}x4+2r RP) o Stripping.`;
  }
  return '';
};

const getGhostRenderInfo = (sett) => {
  const ghost = getGhostLiftSmart(sett);
  if (!ghost) return null;

  // Se l'esercizio è a corpo libero / ripetizioni puro SENZA peso inserito, NON mostriamo il banner CONSIGLIATO del Ghost
  if (ghost.isRepExercise || (isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value)) {
    return null;
  }

  const isLight = typeof document !== 'undefined' && document.documentElement.getAttribute('data-theme') === 'light';

  let icon = 'mdi-lightbulb-on-outline';
  let color = isLight ? '#c2410c' : '#ffb74d'; // Burnt orange in light mode vs Light orange in dark mode
  let label = 'Consigliato:';
  let valueText = '';
  let refText = '';
  let hasReference = false;

  const isManubri = isManubriEsercizio(workout.value);
  const pesoBase = ghost.pesoBaseOriginale || ghost.peso || 0;

  let maxEffortNotice = '';

  if (ghost.isWeek2Scritta) {
    icon = 'mdi-trending-up';
    color = isLight ? '#c2410c' : '#ffb74d';
    label = 'Consigliato:';
    valueText = 'Aumenta peso';
  } else if (ghost.isCoachSet) {
    icon = 'mdi-alert-decagram-outline';
    color = isLight ? '#b45309' : '#fbbf24';
    label = 'Coach:';
    valueText = 'Carichi impostati dal coach';
  } else if (ghost.isGhostInfortunio && !ghostSbloccato.value) {
    icon = 'mdi-bandage';
    color = isLight ? '#dc2626' : '#ef4444';
    const pct = ghost.percentualeInfortunio ?? 20;
    label = (ghost.applicaRiduzioneInfortunio !== false && pct > 0) ? `Proposta Comfort (-${pct}%):` : 'Monitoraggio Fastidio:';
    
    const range = getGhostWeightsRangeForWeek(sett);
    if (range && range.consigliato && range.consigliato.display) {
      valueText = range.consigliato.display;
    } else {
      valueText = `${formatWeight(ghost.peso || ghost.suggerito || ghost.pesoProposto)} kg`;
    }
  } else if (ghost.isScarico) {
    icon = 'mdi-battery-charging-40';
    color = isLight ? '#b45309' : '#fbbf24';
    label = 'Scarico:';
    valueText = `${formatWeight(ghost.peso)} kg`;
  } else if (ghost.isMetodo) {
    icon = 'mdi-cog-play-outline';
    color = isLight ? '#c2410c' : '#ffb74d';
    label = `${ghost.metodoLabel}:`;
    valueText = ghost.text;
  } else if (ghost.isMandatory) {
    icon = 'mdi-alert-decagram-outline';
    color = isLight ? '#dc2626' : '#f87171';
    label = `${ghost.mandatoryLabel}:`;
    valueText = ghost.text;
  } else if (ghost.isOverload) {
    const baseInfo = getBaseWeekInfo(sett);
    const prevPeso = baseInfo?.pesoBase || ghost.pesoBaseOriginale || 0;
    const prevInsStr = String(baseInfo?.baseInsText || ghost.text || '').trim();

    const range = getGhostWeightsRangeForWeek(sett);
    let valConsigliato = range?.consigliato?.display || ghost.text;
    
    // Sensibilità Fatica determina quale fascia di intensità è il target primario consigliato
    if (sensibilitaFaticaGhost.value === 'aggressiva' && range?.sfidante?.display) {
      valConsigliato = range.sfidante.display;
    } else if (sensibilitaFaticaGhost.value === 'conservativa' && range?.prudenziale?.display) {
      valConsigliato = range.prudenziale.display;
    }

    const numConsigliato = parseFloat(valConsigliato ? valConsigliato.replace(',', '.') : 0);

    const isAumentoPeso = (numConsigliato > 0 && prevPeso > 0) ? (numConsigliato > prevPeso) : (ghost.peso > ghost.pesoBaseOriginale);
    const isAumentoReps = valConsigliato && valConsigliato.includes('r') && valConsigliato !== prevInsStr;

    icon = (isAumentoPeso || isAumentoReps) ? 'mdi-trending-up' : 'mdi-trending-neutral';
    color = isLight ? '#c2410c' : '#ffb74d';
    
    if (sensibilitaFaticaGhost.value === 'aggressiva') {
      label = sett === 6 ? 'Consigliato (Spinta W6):' : 'Consigliato (Spinta):';
    } else if (sensibilitaFaticaGhost.value === 'conservativa') {
      label = valConsigliato.includes('r') ? 'Consigliato (Prudente +1r):' : 'Consigliato (Prudente):';
    } else if (isAumentoPeso) {
      label = sett === 6 ? 'Consigliato (Picco W6):' : 'Consigliato (Aumento):';
    } else if (isAumentoReps) {
      label = 'Consigliato (+1r):';
    } else {
      label = sett === 6 ? 'Consigliato (Picco W6):' : 'Consigliato (Mantieni):';
    }
    valueText = valConsigliato;

    if (numConsigliato > 0 && prevPeso > 0) {
      const repsTarget = getRepsPerWeek(sett);
      const repsPrev = baseInfo?.repsBase || 10;
      maxEffortNotice = calcolaAvvisoFaticaConsigliato(sett, numConsigliato, repsTarget, repsPrev, prevPeso);
    }
  } else if (ghost.isPostScarico) {
    const baseInfo = getBaseWeekInfo(sett);
    const prevPeso = baseInfo?.pesoBase || ghost.pesoBaseOriginale || 0;
    const prevInsStr = String(baseInfo?.baseInsText || ghost.text || '').trim();

    const range = getGhostWeightsRangeForWeek(sett);
    let valConsigliato = range?.consigliato?.display || (ghost.pesoProposto > 0 ? `${formatWeight(ghost.pesoProposto)} kg` : ghost.text);
    
    if (sensibilitaFaticaGhost.value === 'aggressiva' && range?.sfidante?.display) {
      valConsigliato = range.sfidante.display;
    } else if (sensibilitaFaticaGhost.value === 'conservativa' && range?.prudenziale?.display) {
      valConsigliato = range.prudenziale.display;
    }

    const numConsigliato = parseFloat(valConsigliato ? valConsigliato.replace(',', '.') : 0);

    const isAumentoPeso = (numConsigliato > 0 && prevPeso > 0) ? (numConsigliato > prevPeso) : (ghost.pesoProposto > ghost.pesoBaseOriginale);
    const isAumentoReps = valConsigliato && valConsigliato.includes('r') && valConsigliato !== prevInsStr;

    icon = (isAumentoPeso || isAumentoReps) ? 'mdi-trending-up' : 'mdi-trending-neutral';
    color = isLight ? '#c2410c' : '#ffb74d';
    
    if (sensibilitaFaticaGhost.value === 'aggressiva') {
      label = sett === 6 ? 'Consigliato (Spinta W6):' : 'Consigliato (Spinta):';
    } else if (sensibilitaFaticaGhost.value === 'conservativa') {
      label = valConsigliato.includes('r') ? 'Consigliato (Prudente +1r):' : 'Consigliato (Prudente):';
    } else if (isAumentoPeso) {
      label = sett === 6 ? 'Consigliato (Picco W6):' : 'Consigliato (Aumento):';
    } else if (isAumentoReps) {
      label = 'Consigliato (+1r):';
    } else {
      label = sett === 6 ? 'Consigliato (Picco W6):' : 'Consigliato (Mantieni):';
    }
    valueText = valConsigliato;

    if (numConsigliato > 0 && prevPeso > 0) {
      const repsTarget = getRepsPerWeek(sett);
      const repsPrev = baseInfo?.repsBase || 10;
      maxEffortNotice = calcolaAvvisoFaticaConsigliato(sett, numConsigliato, repsTarget, repsPrev, prevPeso);
    }
  } else if (ghost.isWeek1) {
    icon = 'mdi-lightbulb-on-outline';
    color = isLight ? '#c2410c' : '#ffb74d';
    label = 'Proposto W1:';
    if (ghost.erroreCarichi) {
      icon = 'mdi-alert-circle-outline';
      color = isLight ? '#dc2626' : '#f87171';
      label = 'Nota:';
      valueText = 'Carica il Miglior Carico W6 per la stima';
    } else {
      valueText = ghost.isRepExercise ? (ghost.peso > 0 ? `${formatWeight(ghost.peso)}kg x${ghost.reps}r` : `${ghost.reps}r`) : `${formatWeight(ghost.suggerito)} kg`;
    }
  } else {
    // Caso standard delle settimane progressive (W2, W3, W4 se non scarico, W5, W6)
    const baseInfo = getBaseWeekInfo(sett);
    const prevPeso = baseInfo?.pesoBase || ghost.pesoBaseOriginale || 0;
    const prevInsStr = String(baseInfo?.baseInsText || ghost.text || '').trim();

    const range = getGhostWeightsRangeForWeek(sett);
    let valConsigliato = range?.consigliato?.display || ghost.text || '';
    
    // Sensibilità Fatica determina quale fascia di intensità è il target primario consigliato
    if (sensibilitaFaticaGhost.value === 'aggressiva' && range?.sfidante?.display) {
      valConsigliato = range.sfidante.display;
    } else if (sensibilitaFaticaGhost.value === 'conservativa' && range?.prudenziale?.display) {
      valConsigliato = range.prudenziale.display;
    }

    const numConsigliato = parseFloat(valConsigliato ? String(valConsigliato).replace(',', '.') : 0);
    const isAumentoPeso = (numConsigliato > 0 && prevPeso > 0) ? (numConsigliato > prevPeso) : (ghost.peso > ghost.pesoBaseOriginale);
    const isAumentoReps = valConsigliato && valConsigliato.includes('r') && valConsigliato !== prevInsStr;

    icon = (isAumentoPeso || isAumentoReps) ? 'mdi-trending-up' : 'mdi-trending-neutral';
    color = isLight ? '#c2410c' : '#ffb74d';
    
    if (sensibilitaFaticaGhost.value === 'aggressiva') {
      label = sett === 6 ? 'Consigliato (Spinta W6):' : 'Consigliato (Spinta):';
    } else if (sensibilitaFaticaGhost.value === 'conservativa') {
      label = valConsigliato.includes('r') ? 'Consigliato (Prudente +1r):' : 'Consigliato (Prudente):';
    } else if (isAumentoPeso) {
      label = sett === 6 ? 'Consigliato (Picco W6):' : 'Consigliato (Aumento):';
    } else if (isAumentoReps) {
      label = 'Consigliato (+1r):';
    } else {
      label = sett === 6 ? 'Consigliato (Picco W6):' : 'Consigliato (Mantieni):';
    }
    valueText = valConsigliato;

    if (numConsigliato > 0 && prevPeso > 0) {
      const repsTarget = getRepsPerWeek(sett);
      const repsPrev = baseInfo?.repsBase || 10;
      maxEffortNotice = calcolaAvvisoFaticaConsigliato(sett, numConsigliato, repsTarget, repsPrev, prevPeso);
    }
  }

  // Calcolo Delta % rispetto a Week 1
  let deltaW1 = null;
  if (sett > 1 && !ghost.isWeek1 && !ghost.erroreCarichi) {
    const rawW1 = inputSettimane.value[1]?.ins || (workout.value ? (workout.value.ins_week1 || workout.value.num_ins1) : '');
    const pStrW1 = estraiPesoDaInput(String(rawW1 || ''));
    const pesoW1 = pStrW1 ? parseFloat(pStrW1) : null;
    
    const numConsigliatoVal = parseFloat(valueText ? String(valueText).replace(',', '.') : 0);
    const pesoEffettivoConsigliato = (numConsigliatoVal > 0) ? numConsigliatoVal : (ghost.peso || ghost.pesoProposto || ghost.suggerito || 0);

    if (pesoW1 !== null && !isNaN(pesoW1) && pesoW1 > 0 && pesoEffettivoConsigliato > 0) {
      const diffKg = Math.round((pesoEffettivoConsigliato - pesoW1) * 10) / 10;
      const diffPct = Math.round(((pesoEffettivoConsigliato - pesoW1) / pesoW1) * 1000) / 10;

      if (diffPct > 0) {
        deltaW1 = {
          pct: diffPct,
          kg: diffKg,
          text: `+${diffPct}% vs W1`,
          style: 'background: rgba(34, 197, 94, 0.14); border: 1px solid rgba(34, 197, 94, 0.3); color: #4ade80 !important;'
        };
      } else if (diffPct === 0) {
        deltaW1 = {
          pct: 0,
          kg: 0,
          text: `= vs W1`,
          style: 'background: rgba(148, 163, 184, 0.12); border: 1px solid rgba(148, 163, 184, 0.25); color: #94a3b8 !important;'
        };
      } else {
        deltaW1 = {
          pct: diffPct,
          kg: diffKg,
          text: `${diffPct}% vs W1`,
          style: 'background: rgba(245, 158, 11, 0.14); border: 1px solid rgba(245, 158, 11, 0.3); color: #fbbf24 !important;'
        };
      }
    }
  }

  // Costruisce la descrizione storica (Riga 2)
  if (ghost.isCoachSet) {
    hasReference = false;
  } else if (ghost.isWeek1 && !ghost.erroreCarichi) {
    hasReference = true;
  } else if (ghost.isScarico) {
    hasReference = true;
  } else if (ghost.isPostScarico) {
    hasReference = true;
  } else if (ghost.isOverload || ghost.isMetodo || ghost.isMandatory || ghost.isGhostInfortunio) {
    hasReference = true;
  } else if (ghost.text) {
    hasReference = true;
  } else if (getRiferimentoSfidaRecord(sett)) {
    hasReference = true;
  }

  return { icon, color, label, valueText, hasReference, maxEffortNotice, deltaW1 };
};

// Long-press Ghost & Progression Info
let ghostLongPressTimer = null;
let isGhostLongPressTriggered = false;
const snackbarGhostShow = ref(false);
const snackbarGhostMessaggio = ref('');
const snackbarGhostColor = ref('success');

const triggerGhostInfo = (sett) => {
  vibraTattile(20);
  const info = getGhostRenderInfo(sett);
  if (!info) return;

  if (info.deltaW1) {
    const d = info.deltaW1;
    const diffKgStr = (d.kg !== undefined && d.kg !== null) ? `${d.kg > 0 ? '+' : ''}${d.kg} kg` : '';
    snackbarGhostMessaggio.value = `📈 Progressione W${sett}: ${d.text} (${diffKgStr} vs W1)`;
    snackbarGhostColor.value = d.pct > 0 ? '#15803d' : (d.pct === 0 ? '#475569' : '#b45309');
  } else {
    snackbarGhostMessaggio.value = `🎯 Target W${sett}: ${info.valueText || ''} (${info.label || ''})`;
    snackbarGhostColor.value = '#0284c7';
  }
  snackbarGhostShow.value = true;
};

const startGhostLongPress = (sett, event) => {
  isGhostLongPressTriggered = false;
  cancelGhostLongPress();
  ghostLongPressTimer = setTimeout(() => {
    isGhostLongPressTriggered = true;
    triggerGhostInfo(sett);
  }, 350);
};

const cancelGhostLongPress = () => {
  if (ghostLongPressTimer) {
    clearTimeout(ghostLongPressTimer);
    ghostLongPressTimer = null;
  }
};

const handleGhostClick = (sett) => {
  if (isGhostLongPressTriggered) {
    isGhostLongPressTriggered = false;
    return;
  }
  triggerGhostInfo(sett);
};

const applicaPropostaCaricoRapida = (sett, peso) => {
  vibraTattile(12);
  const targetInput = inputSettimane.value[sett];
  if (targetInput) {
    const pesoFormattato = String(peso).replace('.', ',');
    targetInput.ins = pesoFormattato;
    salvaDatoSettimanale(sett, 'ins');
    
    // Mostra snackbar di successo
    snackbarMessaggio.value = `Applicato carico ${pesoFormattato} kg per W${sett}!`;
    snackbarSalvataggio.value = true;
  }
};

const proposteStoricoCalcolate = computed(() => {
  return calcolaProposteStoricoPerSettimana(aiutoWeek.value);
});

const caricoIdealeConsigliato = computed(() => {
  return calcolaCaricoIdealeConsigliatoPerSettimana(aiutoWeek.value);
});

const spiegazioneFisiologicaConsigliata = computed(() => {
  const c = caricoIdealeConsigliato.value;
  if (!c) return '';
  
  if (c.isCurrentMesocycle) {
    return `Progressione diretta all'interno del mesociclo attuale da W${c.week} (${c.pesoOriginale} kg x ${c.repsOriginali} reps). Trattandosi dello stesso mesociclo, non si applica deallenamento.`;
  }
  
  let parts = [];
  if (c.giorniTrascorsi > 14) {
    const pct = Math.round((1 - c.coeffTempo) * 100);
    parts.push(`-${pct}% deallenamento fisiologico per ${c.tempoPassato}`);
  } else {
    parts.push(`recupero ottimale (eseguito ${c.tempoPassato})`);
  }
  
  if (c.coeffFatica < 1.0) {
    const pct = Math.round((1 - c.coeffFatica) * 100);
    parts.push(`-${pct}% gestione fatica mesociclo precedente`);
  } else if (c.coeffFatica > 1.0) {
    parts.push(`+1% incremento per sforzo leggero`);
  }
  
  return parts.join(', ');
});

const pesoPropostoDettaglio = computed(() => {
  return getPesoPropostoDettaglioForWeek(aiutoWeek.value);
});

const volumeProgressionInfo = computed(() => {
  return getVolumeProgressionInfoForWeek(aiutoWeek.value);
});

const scaricoWeek4Weights = computed(() => {
  if (!workout.value) return { pesoW2: null, pesoW3: null, textW2: '', textW3: '' };
  
  const w2Ins = inputSettimane.value[2]?.ins || workout.value?.ins_week2 || '';
  const w3Ins = inputSettimane.value[3]?.ins || workout.value?.ins_week3 || '';
  
  const w2Str = w2Ins ? estraiPesoDaInput(w2Ins) : null;
  const w3Str = w3Ins ? estraiPesoDaInput(w3Ins) : null;
  
  return {
    pesoW2: w2Str ? parseFloat(w2Str) : null,
    pesoW3: w3Str ? parseFloat(w3Str) : null,
    textW2: String(w2Ins).trim(),
    textW3: String(w3Ins).trim(),
    insW2: w2Ins,
    insW3: w3Ins
  };
});

const caricoConsigliatoViaDiMezzo = computed(() => {
  return getCaricoConsigliatoViaDiMezzoForWeek(aiutoWeek.value);
});


// Stato e Calcolatore Carico Custom per Simulatore Dialog
const pesoCustomSimulatore = ref(null);

// Stati di espansione accordion per Dialog Proposta Carico
const showSimulatoreCarico = ref(false);
const showPercheConsiglio = ref(false);
const showStoricoCompleto = ref(false);
const showCambioPalestra = ref(false);

// Dialogs and States
const dialogProgressioniPrecedente = ref(false);
const dialogElimina = ref(false);
const dialogModifica = ref(false);
const modificandoEsercizio = ref(false);
const modificaForm = ref({
  des_esercizio: '',
  des_settore: '',
  des_rec_report: '',
  des_esercizio_2: '',
  alf_superserie: '',
  UrlNormal: '',
  des_note: '',
  des_note_attrezzo: '',
  des_note_gen_attr: '',
  des_estesa_start: '',
  des_estesa_end: '',
  des_week1: '',
  des_week2: '',
  des_week3: '',
  des_week4: '',
  des_week5: '',
  des_week6: ''
});
const dialogStorico = ref(false);

// Valore Consigliato Hero Dialog
const valoreConsigliatoHeroDialog = computed(() => {
  if (!workout.value) return { display: '0', unit: 'KG', valueToApply: 0, isRep: false, isLato: null };
  const isCorpoLibero = isCorpoLiberoEsercizio(workout.value);
  const isCorpoLiberoPuro = isCorpoLibero && !haPesoEsercizio.value;
  const sett = aiutoWeek.value;

  if (isCorpoLiberoPuro) {
    const ghostRender = getGhostRenderInfo(sett);
    const rTarget = getRepsPerWeek(sett);
    const cleanText = (ghostRender && ghostRender.valueText) ? String(ghostRender.valueText).replace(/\s*kg/gi, '').trim() : `${rTarget}r`;
    return {
      display: cleanText,
      unit: '',
      valueToApply: cleanText,
      isRep: true,
      isLato: null
    };
  }

  const presc = parsedPrescription(workout.value['des_week' + sett]);
  if (presc && presc.total) {
    return {
      display: String(presc.total),
      unit: 'KG',
      valueToApply: presc.total,
      isRep: false,
      isLato: presc.side ? String(presc.side) : null
    };
  }

  if (sett === 1) {
    const p1 = propostaWeek1.value?.pesoConsigliato || propostaWeek1.value?.peso || 0;
    return {
      display: formatWeight(p1),
      unit: 'KG',
      valueToApply: p1,
      isRep: false,
      isLato: null
    };
  }

  const ghostRender = getGhostRenderInfo(sett);
  if (ghostRender && ghostRender.valueText) {
    const cleanText = String(ghostRender.valueText).replace(/\s*kg/gi, '').trim();
    const isRep = cleanText.includes('r') || cleanText.includes('x');
    return {
      display: cleanText,
      unit: isRep ? '' : 'KG',
      valueToApply: cleanText,
      isRep,
      isLato: null
    };
  }

  const fallback = caricoConsigliatoViaDiMezzo.value || 0;
  return {
    display: formatWeight(fallback),
    unit: 'KG',
    valueToApply: fallback,
    isRep: false,
    isLato: null
  };
});

// 1. COMPUTED RECORD OVERVIEW (Record a Stesse Reps + e1RM Massimo + Nuovo PR)
const recordOverviewData = computed(() => {
  if (!workout.value) return null;
  const isCorpoLibero = isCorpoLiberoEsercizio(workout.value);
  const currentNumScheda = parseInt(workout.value.num_scheda);
  const sett = aiutoWeek.value;
  const targetReps = getRepsPerWeek(sett);
  const cleanTargetReps = String(targetReps).replace(/r$/i, '');
  const rawW1 = inputSettimane.value ? (inputSettimane.value[1]?.ins || '') : (workout.value ? (workout.value.ins_week1 || workout.value.num_ins1 || '') : '');
  const pW1 = parseFloat(estraiPesoDaInput(String(rawW1 || '')) || 0);

  // 1. RECORD A STESSE REPS
  let pastRepsWeight = 0;
  let pastRepsReps = targetReps;
  let pastRepsSheet = null;
  let pastRepsDay = null;
  let pastRepsWeek = null;
  let pastRepsDate = null;
  let pastRepsFatica = null;
  let pastRepsId = null;

  // Scandisci storico passato per le stesse reps
  if (storicoEsercizio.value && storicoEsercizio.value.length) {
    storicoEsercizio.value.forEach(prevEx => {
      const sNum = parseInt(prevEx.num_scheda);
      if (!isNaN(sNum) && sNum >= currentNumScheda) return;
      const dEx = getExecutionDate(prevEx, storicoEsercizio.value, workout.value);

      for (let w = 1; w <= 6; w++) {
        const insVal = prevEx['ins_week' + w];
        if (insVal) {
          const p = parseFloat(estraiPesoDaInput(insVal)) || 0;
          let r = estraiRepsDaInput(insVal);
          if (r === null || isNaN(r) || r <= 0) {
            const rPrescr = prevEx['reps_week' + w] || estraiRepsDaPrescrizione(prevEx['des_week' + w]);
            r = rPrescr ? parseInt(rPrescr, 10) : targetReps;
          }

          const isMatching = isMatchingReps(prevEx, w) || r === targetReps || (w === sett && parseInt(prevEx['reps_week' + w]) === targetReps);
          if (isMatching && (p > 0 || (isCorpoLibero && r > 0))) {
            const valComp = p > 0 ? p : r;
            const currentComp = pastRepsWeight > 0 ? pastRepsWeight : (pastRepsReps || 0);
            if (valComp > currentComp) {
              pastRepsWeight = p;
              pastRepsReps = r;
              pastRepsSheet = prevEx.num_scheda;
              pastRepsDay = prevEx.des_giorno;
              pastRepsWeek = w;
              pastRepsDate = dEx;
              pastRepsFatica = (w === 6 && prevEx.num_faticaw6) ? prevEx.num_faticaw6 : (prevEx['num_faticaw' + w] || null);
              pastRepsId = prevEx.id || prevEx.num_riga;
            }
          }
        }
      }
    });
  }

  // Fallback da suggerimentoRecord per lo storico passato
  if (pastRepsWeight === 0 && suggerimentoRecord.value) {
    if (suggerimentoRecord.value.record > 0 || suggerimentoRecord.value.recordRepsValue > 0) {
      pastRepsWeight = suggerimentoRecord.value.record || 0;
      pastRepsReps = suggerimentoRecord.value.recordRepsValue || targetReps;
      pastRepsSheet = suggerimentoRecord.value.recordRepsSheet;
      pastRepsDay = suggerimentoRecord.value.recordRepsDay;
      pastRepsDate = suggerimentoRecord.value.recordRepsDate;
      pastRepsFatica = suggerimentoRecord.value.recordRepsFatica;
      pastRepsId = suggerimentoRecord.value.recordRepsId;
    }
  }

  // Controlla scheda corrente (W1..W6) per le stesse reps
  let currentRepsWeight = 0;
  let currentRepsReps = targetReps;
  let currentRepsWeek = sett;
  let currentRepsFatica = null;
  let currentRepsDate = workout.value.dat_scheda_ult_ex || workout.value.timestamp;
  let currentRepsId = workout.value.id;

  if (inputSettimane.value) {
    for (let w = 1; w <= 6; w++) {
      const wReps = getRepsPerWeek(w);
      if (wReps === targetReps || w === sett) {
        const insVal = inputSettimane.value[w]?.ins;
        if (insVal) {
          const p = parseFloat(estraiPesoDaInput(insVal)) || 0;
          let r = estraiRepsDaInput(insVal) || targetReps;
          if (p > 0 || (isCorpoLibero && r > 0)) {
            const valComp = p > 0 ? p : r;
            const currentComp = currentRepsWeight > 0 ? currentRepsWeight : 0;
            if (valComp >= currentComp) {
              currentRepsWeight = p;
              currentRepsReps = r;
              currentRepsWeek = w;
              currentRepsFatica = inputSettimane.value[w]?.fatica || workout.value?.['num_faticaw' + w];
            }
          }
        }
      }
    }
  }

  // Determina se è un NUOVO PR nella scheda attuale
  let isCurrentPR = false;
  let bestWeight = 0;
  let bestReps = targetReps;
  let bestSheet = null;
  let bestDay = null;
  let bestWeek = null;
  let bestDate = null;
  let bestFatica = null;
  let bestId = null;
  let bestIsCurrent = false;

  const recAnalisi = analizzaRecordSettimana(sett);
  if (currentRepsWeight > 0 && (pastRepsWeight === 0 || currentRepsWeight > pastRepsWeight)) {
    isCurrentPR = true;
    bestIsCurrent = true;
    bestWeight = currentRepsWeight;
    bestReps = currentRepsReps;
    bestSheet = workout.value.num_scheda;
    bestWeek = currentRepsWeek;
    bestDate = currentRepsDate;
    bestFatica = currentRepsFatica;
    bestId = currentRepsId;
  } else if (pastRepsWeight > 0 || (!isCorpoLibero && pastRepsWeight > 0)) {
    isCurrentPR = false;
    bestIsCurrent = false;
    bestWeight = pastRepsWeight;
    bestReps = pastRepsReps;
    bestSheet = pastRepsSheet;
    bestDay = pastRepsDay;
    bestWeek = pastRepsWeek;
    bestDate = pastRepsDate;
    bestFatica = pastRepsFatica;
    bestId = pastRepsId;
  } else if (currentRepsWeight > 0) {
    isCurrentPR = true;
    bestIsCurrent = true;
    bestWeight = currentRepsWeight;
    bestReps = currentRepsReps;
    bestSheet = workout.value.num_scheda;
    bestWeek = currentRepsWeek;
    bestDate = currentRepsDate;
    bestFatica = currentRepsFatica;
    bestId = currentRepsId;
  }

  const roundedBestWeight = Math.round(bestWeight * 10) / 10;
  const weightDisplay = (!isCorpoLibero || roundedBestWeight > 0)
    ? `${formatWeight(roundedBestWeight)} kg`
    : `${bestReps} reps`;

  const faticaStr = bestFatica ? `(${formatFaticaAbbr(bestFatica)})` : '';
  const repsDisplay = (!isCorpoLibero || roundedBestWeight > 0)
    ? `x${bestReps}r ${faticaStr}`.trim()
    : (faticaStr ? `${faticaStr}` : '');

  const provenienzaSenzaCoppa = bestIsCurrent
    ? `questa scheda • W${bestWeek || sett}`
    : (bestSheet ? `Sch. ${bestSheet}${bestDay ? ' ' + bestDay : ''} • ${formattaDataStorico(bestDate) || 'Storico'}` : 'Storico');

  const realDisplay = (!isCorpoLibero || roundedBestWeight > 0)
    ? `${formatWeight(roundedBestWeight)} kg × ${bestReps || targetReps}r`
    : `${bestReps}r`;

  const realProvenienza = bestIsCurrent
    ? `🏆 questa scheda • W${bestWeek || sett}`
    : (bestSheet ? `🏆 Sch. ${bestSheet}${bestDay ? ' ' + bestDay : ''} • ${formattaDataStorico(bestDate) || 'Storico'}` : 'Storico');

  // GESTIONE CORPO LIBERO PURO (Senza sovraccarico): Mostra solo ripetizioni (NO 1RM in KG)
  const isCorpoLiberoPuro = isCorpoLibero && !haPesoEsercizio.value;
  if (isCorpoLiberoPuro) {
    let maxHistoricalReps = 0;
    let maxHistoricalSheet = null;
    let maxHistoricalWeek = null;
    let maxHistoricalDate = null;
    let maxHistoricalId = null;

    if (storicoEsercizio.value && storicoEsercizio.value.length) {
      storicoEsercizio.value.forEach(prevEx => {
        const sNum = parseInt(prevEx.num_scheda);
        if (!isNaN(sNum) && sNum >= currentNumScheda) return;
        const dEx = getExecutionDate(prevEx, storicoEsercizio.value, workout.value);
        for (let w = 1; w <= 6; w++) {
          const insVal = prevEx['ins_week' + w] || (w === 6 ? prevEx.num_ins6 : null);
          if (insVal) {
            let r = estraiRepsDaInput(insVal);
            if (r === null || isNaN(r) || r <= 0) {
              const rPrescr = prevEx['reps_week' + w] || estraiRepsDaPrescrizione(prevEx['des_week' + w]);
              r = rPrescr ? parseInt(rPrescr, 10) : 0;
            }
            if (r > maxHistoricalReps) {
              maxHistoricalReps = r;
              maxHistoricalSheet = prevEx.num_scheda;
              maxHistoricalWeek = w;
              maxHistoricalDate = dEx;
              maxHistoricalId = prevEx.id || prevEx.num_riga;
            }
          }
        }
      });
    }

    // Massimo ripetizioni nella scheda corrente
    let maxCurrentReps = 0;
    let maxCurrentWeek = null;
    if (inputSettimane.value) {
      for (let w = 1; w <= 6; w++) {
        const insVal = inputSettimane.value[w]?.ins;
        if (insVal) {
          const r = estraiRepsDaInput(insVal) || getRepsPerWeek(w);
          if (r > maxCurrentReps) {
            maxCurrentReps = r;
            maxCurrentWeek = w;
          }
        }
      }
    }

    const isNewRepsPeak = Boolean(maxCurrentReps >= maxHistoricalReps && maxCurrentReps > 0);
    const displayReps = (maxCurrentReps > 0 ? maxCurrentReps : maxHistoricalReps) || targetReps;
    let maxDeltaRepsText = null;
    let e1rmProximityPct = 100;
    if (!isNewRepsPeak && maxHistoricalReps > maxCurrentReps && maxCurrentReps > 0) {
      const diffReps = maxHistoricalReps - maxCurrentReps;
      maxDeltaRepsText = `👑 Max: ${maxHistoricalReps} reps (-${diffReps}r • S.${maxHistoricalSheet || '-'})`;
      e1rmProximityPct = Math.min(100, Math.round((maxCurrentReps / maxHistoricalReps) * 100));
    } else if (isNewRepsPeak) {
      maxDeltaRepsText = `👑 Record assoluto: ${maxCurrentReps} reps • W${maxCurrentWeek || sett}`;
    }

    const bestE1RMBodyweight = {
      display: `${displayReps} reps`,
      currentE1RM: displayReps,
      max1RM: maxHistoricalReps,
      sheet: isNewRepsPeak ? workout.value.num_scheda : maxHistoricalSheet,
      week: isNewRepsPeak ? maxCurrentWeek : maxHistoricalWeek,
      date: isNewRepsPeak ? (workout.value.dat_scheda_ult_ex || workout.value.timestamp) : maxHistoricalDate,
      isNewPeak: isNewRepsPeak,
      calcoloBase: isNewRepsPeak ? `W${maxCurrentWeek} • questa scheda` : `Sch. ${maxHistoricalSheet || '-'}${maxHistoricalWeek ? ' W' + maxHistoricalWeek : ''}`,
      calcoloBaseShort: isNewRepsPeak ? `Top ${displayReps}r` : `${maxHistoricalReps || displayReps}r`,
      maxDeltaText: maxDeltaRepsText,
      e1rmProximityPct,
      id: isNewRepsPeak ? workout.value.id : maxHistoricalId
    };

    return {
      bestReal: {
        weight: 0,
        reps: bestReps,
        weightDisplay: `${bestReps} reps`,
        repsDisplay: faticaStr || '',
        display: `${bestReps} reps`,
        fatica: bestFatica,
        date: bestDate,
        sheet: bestSheet,
        day: bestDay,
        week: bestWeek,
        id: bestId,
        isCurrentPR: bestIsCurrent,
        provenienzaSenzaCoppa,
        provenienza: realProvenienza,
        sottoPRText: null
      },
      bestE1RM: bestE1RMBodyweight,
      isCorpoLiberoPuro: true,
      progressioneVsPRPrec: bestIsCurrent ? `Nuovo record: ${bestReps} reps` : `Record: ${bestReps} reps`,
      progressioneMesociclo: maxCurrentReps > 0 ? `Max raggiunto: ${maxCurrentReps} reps` : 'In progressione'
    };
  }

  // 2. e1RM MASSIMO (TEORICO STIMATO - ARROTONDATO A 1 DECIMALE)
  const massimalePuroInfo = calcolaDettaglioMassimale1RMPuro();
  let bestE1rmVal = massimalePuroInfo.best1RM || 0;
  let bestE1rmIsCurrent = false;
  let bestE1rmSheet = massimalePuroInfo.bestSource?.numScheda || null;
  let bestE1rmWeek = null;
  let bestE1rmTempo = massimalePuroInfo.bestSource?.tempoTrascorso || '';
  let bestE1rmId = massimalePuroInfo.bestSource?.id || null;

  if (massimalePuroInfo.bestSource?.tempoTrascorso === 'questa scheda' || String(bestE1rmSheet) === String(workout.value.num_scheda)) {
    bestE1rmIsCurrent = true;
  }

  // Se l'e1RM della proposta corrente supera il max storico, aggiorna
  const ghostRender = getGhostRenderInfo(sett);
  const proposedNum = ghostRender ? parseFloat(String(ghostRender.valueText).replace(',', '.')) : (caricoConsigliatoViaDiMezzo.value || 0);
  if (proposedNum > 0 && targetReps > 0) {
    const e1rmProposed = calcolaE1RMSmorzato(proposedNum, targetReps, isCavoOMacchinaEsercizio(workout.value));
    if (e1rmProposed > bestE1rmVal) {
      bestE1rmVal = e1rmProposed;
      bestE1rmIsCurrent = true;
      bestE1rmWeek = sett;
      bestE1rmTempo = 'questa scheda';
    }
  }

  const roundedE1rm = Math.round(bestE1rmVal * 10) / 10;
  const e1rmDisplay = roundedE1rm > 0 ? `${formatWeight(roundedE1rm)} kg` : 'N.D.';
  const e1rmProvenienza = bestE1rmIsCurrent
    ? `questa scheda • W${bestE1rmWeek || sett}`
    : (bestE1rmSheet ? `Sch. ${bestE1rmSheet}${bestE1rmWeek ? ' W' + bestE1rmWeek : ''}` : (bestE1rmTempo || 'Storico'));

  // Calcolo e1RM reale della prestazione recente nel mesociclo in corso (W1..W6)
  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  let pesoRecenteMesociclo = 0;
  let repsRecenteMesociclo = targetReps;
  
  const currIns = inputSettimane.value ? inputSettimane.value[sett]?.ins : null;
  const pCurr = currIns ? parseFloat(estraiPesoDaInput(currIns)) : 0;
  if (pCurr > 0) {
    pesoRecenteMesociclo = pCurr;
    repsRecenteMesociclo = estraiRepsDaInput(currIns) || targetReps;
  } else if (inputSettimane.value) {
    for (let w = sett - 1; w >= 1; w--) {
      const ins = inputSettimane.value[w]?.ins;
      if (ins) {
        const p = parseFloat(estraiPesoDaInput(ins));
        if (p > 0) {
          pesoRecenteMesociclo = p;
          repsRecenteMesociclo = estraiRepsDaInput(ins) || getRepsPerWeek(w);
          break;
        }
      }
    }
  }
  if (pesoRecenteMesociclo === 0) {
    const infoBase = getBaseWeekInfo(sett);
    if (infoBase && infoBase.pesoBase !== null && infoBase.pesoBase > 0) {
      pesoRecenteMesociclo = infoBase.pesoBase;
      repsRecenteMesociclo = infoBase.repsBase || targetReps;
    }
  }
  if (pesoRecenteMesociclo === 0 && currentRepsWeight > 0) {
    pesoRecenteMesociclo = currentRepsWeight;
    repsRecenteMesociclo = currentRepsReps;
  } else if (pesoRecenteMesociclo === 0 && pW1 > 0) {
    pesoRecenteMesociclo = pW1;
    repsRecenteMesociclo = getRepsPerWeek(1);
  }

  let currentE1RM = (pesoRecenteMesociclo > 0 && repsRecenteMesociclo > 0)
    ? calcolaE1RMSmorzato(pesoRecenteMesociclo, repsRecenteMesociclo, isCavo)
    : 0;

  // Se c'è una prestazione top con e1RM massimo nel mesociclo corrente
  if (inputSettimane.value) {
    for (let w = 1; w <= 6; w++) {
      const ins = inputSettimane.value[w]?.ins;
      if (ins) {
        const perf = estraiMigliorPrestazioneInput(ins, getRepsPerWeek(w), isCavo);
        if (perf && perf.peso > 0) {
          const e1 = calcolaE1RMSmorzato(perf.peso, perf.reps, isCavo);
          if (e1 >= currentE1RM) {
            currentE1RM = e1;
            pesoRecenteMesociclo = perf.peso;
            repsRecenteMesociclo = perf.reps;
          }
        }
      }
    }
  }

  const roundedCurrentE1RM = Math.round(currentE1RM * 10) / 10;
  const calcoloBase = (pesoRecenteMesociclo > 0 && repsRecenteMesociclo > 0)
    ? `${formatWeight(pesoRecenteMesociclo)}kg×${repsRecenteMesociclo}r`
    : '';
  const calcoloBaseShort = (pesoRecenteMesociclo > 0 && repsRecenteMesociclo > 0)
    ? `${formatWeight(pesoRecenteMesociclo)}×${repsRecenteMesociclo}r`
    : '';

  // Confronto con Picco 1RM Assoluto (bestE1rmVal, es. 34.1 kg)
  const isNewPeak = Boolean(bestE1rmIsCurrent || (roundedCurrentE1RM >= roundedE1rm && roundedCurrentE1RM > 0));
  let maxDeltaText = null;
  let maxDeltaKg = 0;
  let e1rmProximityPct = 100;
  if (!isNewPeak && roundedE1rm > 0 && roundedCurrentE1RM > 0 && roundedCurrentE1RM < roundedE1rm) {
    maxDeltaKg = Math.round((roundedE1rm - roundedCurrentE1RM) * 10) / 10;
    if (maxDeltaKg > 0) {
      const diff1RMPct = Math.round((maxDeltaKg / roundedE1rm) * 100);
      maxDeltaText = `👑 Max: ${formatWeight(roundedE1rm)}kg (-${formatWeight(maxDeltaKg)}kg • S.${bestE1rmSheet || '-'})`;
      e1rmProximityPct = Math.min(100, Math.round((roundedCurrentE1RM / roundedE1rm) * 1000) / 10);
    }
  }

  const currentE1rmDisplay = roundedCurrentE1RM > 0 ? `${formatWeight(roundedCurrentE1RM)} kg` : (roundedE1rm > 0 ? `${formatWeight(roundedE1rm)} kg` : 'N.D.');

  // 3. CONFRONTO PR PRECEDENTE E PROGRESSIONE MESOCICLO
  let prevPRWeight = pastRepsWeight;
  let progressioneVsPRPrec = '';
  if (prevPRWeight > 0 && bestWeight > 0) {
    const diffPR = Math.round((bestWeight - prevPRWeight) * 10) / 10;
    const diffPRPct = Math.round(((bestWeight - prevPRWeight) / prevPRWeight) * 1000) / 10;
    if (diffPR > 0) {
      progressioneVsPRPrec = `+${formatWeight(diffPR)} kg (+${diffPRPct}%) vs PR prec.`;
    } else if (diffPR === 0) {
      progressioneVsPRPrec = `= PR precedente (${formatWeight(prevPRWeight)}kg)`;
    } else {
      progressioneVsPRPrec = `${formatWeight(diffPR)} kg vs PR prec.`;
    }
  } else if (bestWeight > 0 && prevPRWeight === 0) {
    progressioneVsPRPrec = 'Primo record registrato';
  }

  // Progressione nel mesociclo vs W1
  let progressioneMesociclo = '';
  if (pW1 > 0 && bestWeight > 0) {
    const diffMeso = Math.round((bestWeight - pW1) * 10) / 10;
    const diffMesoPct = Math.round(((bestWeight - pW1) / pW1) * 1000) / 10;
    if (diffMeso > 0) {
      progressioneMesociclo = `+${formatWeight(diffMeso)} kg (+${diffMesoPct}%) vs W1`;
    } else if (diffMeso === 0) {
      progressioneMesociclo = `Stesso carico W1 (${formatWeight(pW1)}kg)`;
    } else {
      progressioneMesociclo = `${formatWeight(diffMeso)} kg vs W1`;
    }
  }

  // 4. SOTTO AL PR (Se il PR è di un mesociclo precedente)
  let sottoPRText = null;
  const compWeight = currentRepsWeight > 0 ? currentRepsWeight : (pW1 > 0 ? pW1 : 0);
  if (!isCurrentPR && pastRepsWeight > 0 && compWeight > 0 && compWeight < pastRepsWeight) {
    const diffKg = Math.round((pastRepsWeight - compWeight) * 10) / 10;
    const diffPct = Math.round((diffKg / pastRepsWeight) * 100);
    sottoPRText = `-${formatWeight(diffKg)}kg (-${diffPct}%) vs PR ${cleanTargetReps}r`;
  }

  // 5. NUOVO PR EVALUATION (Coppa & Oro solo se Nuovo PR ottenuto in QUESTA scheda)
  let isNuovoPR = isCurrentPR;
  let prBadgeText = isCurrentPR ? `NUOVO PR ${cleanTargetReps} REPS` : '';
  let prDeltaText = progressioneVsPRPrec || `Nuovo primato personale`;

  return {
    bestReal: {
      weight: roundedBestWeight,
      reps: bestReps,
      fatica: bestFatica,
      weightDisplay,
      repsDisplay,
      display: realDisplay,
      isCurrent: bestIsCurrent,
      isCurrentPR: isCurrentPR,
      sheet: bestSheet,
      week: bestWeek,
      date: bestDate,
      sottoPRText,
      provenienza: realProvenienza,
      provenienzaSenzaCoppa: provenienzaSenzaCoppa,
      id: bestId
    },
    bestE1RM: {
      e1rm: roundedCurrentE1RM > 0 ? roundedCurrentE1RM : roundedE1rm,
      display: currentE1rmDisplay,
      isCurrent: bestE1rmIsCurrent,
      isNewPeak: isNewPeak,
      currentE1RM: roundedCurrentE1RM,
      max1RM: roundedE1rm,
      maxDisplay: `${formatWeight(roundedE1rm)} kg`,
      maxDeltaText: maxDeltaText,
      maxDeltaKg: formatWeight(maxDeltaKg),
      e1rmProximityPct: e1rmProximityPct,
      sheet: bestE1rmSheet,
      week: bestE1rmWeek,
      calcoloBase: calcoloBase,
      calcoloBaseShort: calcoloBaseShort,
      provenienza: e1rmProvenienza,
      id: bestE1rmId
    },
    nuovoPR: {
      isNew: isNuovoPR,
      badgeText: prBadgeText,
      deltaText: prDeltaText
    },
    progressioneMesociclo,
    progressioneVsPRPrec
  };
});

// 2. COMPUTED HERO PROPOSAL DATA
const heroProposalData = computed(() => {
  if (!workout.value) return null;
  const sett = aiutoWeek.value;
  const targetReps = getRepsPerWeek(sett);
  const presc = parsedPrescription(workout.value['des_week' + sett]);
  const setsCount = presc?.sets ? parseInt(presc.sets, 10) : (workout.value.num_serie || 3);
  
  const valoreHero = valoreConsigliatoHeroDialog.value;
  const displayNum = valoreHero.display;
  const unit = valoreHero.unit || (isCorpoLiberoEsercizio(workout.value) ? '' : 'KG');
  const isLato = valoreHero.isLato;
  const valueToApply = valoreHero.valueToApply;

  // Delta vs W1
  const ghostRender = getGhostRenderInfo(sett);
  const deltaW1 = ghostRender?.deltaW1 || null;

  // Step transition text (es. 36×10 → 38×8)
  const baseInfo = getBaseWeekInfo(sett);
  let stepTransitionText = '';
  if (baseInfo && baseInfo.pesoBase !== null && baseInfo.pesoBase > 0) {
    const baseP = formatWeight(baseInfo.pesoBase);
    const baseR = baseInfo.repsBase || 10;
    const currP = formatWeight(displayNum);
    const currR = targetReps;
    stepTransitionText = `${baseP}×${baseR} → ${currP}×${currR}`;
  }

  // Spiegazione sintetica
  const cleanReps = String(targetReps).replace(/r$/i, '');
  const isCorpoLiberoPuro = isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value;
  let spiegazioneSintetica = '';
  if (isCorpoLiberoPuro) {
    spiegazioneSintetica = `Progressione consigliata per completare le ${cleanReps} ripetizioni prescritte.`;
  } else if (displayNum && !isNaN(parseFloat(displayNum))) {
    spiegazioneSintetica = `${displayNum} kg è il carico consigliato per progredire mantenendo il target di ${cleanReps} reps.`;
  } else if (spiegazioneDinamicaConsigliata.value) {
    spiegazioneSintetica = spiegazioneDinamicaConsigliata.value;
  } else {
    spiegazioneSintetica = `Carico consigliato per completare le ${cleanReps} ripetizioni prescritte.`;
  }

  return {
    displayNum,
    unit,
    isLato,
    valueToApply,
    setsCount,
    targetReps,
    serieRepsText: `${setsCount} × ${cleanReps} REPS`,
    deltaW1,
    stepTransitionText,
    spiegazioneSintetica
  };
});

// 3. COMPUTED STRATEGIE ALTERNATIVE CARDS (SAFE / SMART / SFIDANTE)
const strategieAlternativeCards = computed(() => {
  if (!workout.value) return [];
  const sett = aiutoWeek.value;
  const range = getGhostWeightsRangeForWeek(sett);
  if (!range) return [];

  const targetReps = getRepsPerWeek(sett);
  const baseInfo = getBaseWeekInfo(sett);
  const pesoBase = baseInfo?.pesoBase || 0;
  const repsBase = baseInfo?.repsBase || 10;

  const rawW1 = inputSettimane.value[1]?.ins || (workout.value ? (workout.value.ins_week1 || workout.value.num_ins1) : '');
  const pesoW1 = parseFloat(estraiPesoDaInput(String(rawW1 || '')) || 0);

  const isManubri = isManubriEsercizio(workout.value);
  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  const isCorpoLiberoPuro = isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value;
  const rawSmart = parseFloat(String(range.consigliato.value).replace(',', '.')) || 0;
  const rawSafe = parseFloat(String(range.prudenziale.value).replace(',', '.')) || 0;
  const rawSfidante = parseFloat(String(range.sfidante.value).replace(',', '.')) || 0;
  const step = getWeightStep(isManubri, rawSmart || pesoBase);

  const smartVal = rawSmart > 0 ? (isManubri ? arrotondaManubrioCommerciale(rawSmart) : Math.round(rawSmart / step) * step) : 0;
  const safeVal = rawSafe > 0 ? (isManubri ? arrotondaManubrioCommerciale(rawSafe) : Math.round(rawSafe / step) * step) : 0;
  const sfidanteVal = rawSfidante > 0 ? (isManubri ? arrotondaManubrioCommerciale(rawSfidante) : Math.round(rawSfidante / step) * step) : 0;

  // Determina quale strategia è consigliata in base alla sensibilità fatica dell'utente
  const sens = sensibilitaFaticaGhost.value;
  const tipoConsigliato = sens === 'aggressiva' ? 'sfidante' : (sens === 'conservativa' ? 'safe' : 'smart');

  // Calcolo pillola di incremento vs W1 per la strategia consigliata
  const consigliatoVal = tipoConsigliato === 'sfidante' ? sfidanteVal : (tipoConsigliato === 'safe' ? safeVal : smartVal);
  let mesoPillText = null;
  if (pesoW1 > 0 && consigliatoVal > 0) {
    const diffPct = Math.round(((consigliatoVal - pesoW1) / pesoW1) * 1000) / 10;
    if (diffPct > 0) {
      mesoPillText = `+${diffPct}% vs W1`;
    } else if (diffPct === 0) {
      mesoPillText = `0% vs W1`;
    } else {
      mesoPillText = `${diffPct}% vs W1`;
    }
  }

  // Helper per calcolare reps per PR su sfidante
  // Riferimento: max 1RM assoluto storico (oppure bestReal se manca max1RM)
  const max1rmStorico = recordOverviewData.value?.bestE1RM?.max1RM || 0;
  const prRealWeight = recordOverviewData.value?.bestReal?.weight || 0;
  const isVolumeSfidante = String(range.sfidante?.value).includes('r');
  
  // Benchmark e1RM da superare per il primato
  let targetE1RMToBeat = max1rmStorico > 0 ? max1rmStorico : (recordOverviewData.value?.bestE1RM?.e1rm || 0);
  if (targetE1RMToBeat === 0 && prRealWeight > 0) {
    const prR = recordOverviewData.value.bestReal.reps || targetReps;
    targetE1RMToBeat = prRealWeight * (1 + prR / 30);
  }

  // Calcolo matematico target 1RM assoluto per targetReps
  let targetRecordAssolutoKg = null;
  if (!isVolumeSfidante && targetE1RMToBeat > 0 && targetReps > 0 && !isCorpoLiberoPuro) {
    const rawTargetAbs = calcolaPesoDaE1RMSmorzato(targetE1RMToBeat + 0.1, targetReps, isCavo);
    if (rawTargetAbs > 0) {
      const stepAbs = isManubri ? 1.0 : (isCavo ? 1.25 : 2.5);
      targetRecordAssolutoKg = Math.ceil(rawTargetAbs / stepAbs) * stepAbs;
      targetRecordAssolutoKg = Math.round(targetRecordAssolutoKg * 10) / 10;
      if (targetRecordAssolutoKg <= sfidanteVal) {
        targetRecordAssolutoKg = null; // È già compreso o superato
      }
    }
  }

  let sfidantePRGoalText = null;
  let sfidanteMinRepsPR = null;
  let sfidantePRDetail = null;
  if (!isVolumeSfidante && targetE1RMToBeat > 0 && sfidanteVal > 0) {
    const rawReps = ((targetE1RMToBeat / sfidanteVal) - 1) * 30;
    const repsEguaglia = Math.max(1, Math.round(rawReps));
    const repsSupera = Math.max(repsEguaglia, Math.floor(rawReps) + 1);
    const deltaReps = repsEguaglia - targetReps;
    
    if (targetRecordAssolutoKg) {
      sfidanteMinRepsPR = repsSupera;
      sfidantePRGoalText = `🎯 ${formatWeight(sfidanteVal)}k (PR ${targetReps}r) • 👑 ${formatWeight(targetRecordAssolutoKg)}k (1RM)`;
      sfidantePRDetail = {
        pesoSfidante: sfidanteVal,
        pesoRecordAssoluto: targetRecordAssolutoKg,
        targetReps,
        prWeight: prRealWeight,
        max1rm: Math.round(targetE1RMToBeat * 10) / 10,
        repsEguaglia,
        repsSupera,
        deltaReps
      };
    } else if (repsEguaglia > targetReps) {
      sfidanteMinRepsPR = repsSupera;
      sfidantePRGoalText = `🏆 ≥ ${repsSupera}r per Record 1RM (+${deltaReps}r)`;
      sfidantePRDetail = {
        pesoSfidante: sfidanteVal,
        pesoRecordAssoluto: null,
        targetReps,
        prWeight: prRealWeight,
        max1rm: Math.round(targetE1RMToBeat * 10) / 10,
        repsEguaglia,
        repsSupera,
        deltaReps
      };
    }
  }

  // 1. SAFE (testo breve e fine)
  let safeSottotitolo = 'Stesso peso';
  if (range.prudenziale?.label && (range.prudenziale.label.includes('Consolida') || range.prudenziale.label.includes('base'))) {
    safeSottotitolo = 'Consolida volume';
  } else if (String(range.prudenziale?.value).includes('r')) {
    safeSottotitolo = '+1 rep (+volume)';
  } else if (safeVal > 0 && pesoBase > 0) {
    if (safeVal === pesoBase && repsBase < targetReps) {
      safeSottotitolo = `+${targetReps - repsBase}r (+volume)`;
    } else if (safeVal < smartVal) {
      const diffSafe = Math.round((smartVal - safeVal) * 10) / 10;
      safeSottotitolo = `-${diffSafe}kg vs smart`;
    } else if (safeVal === pesoBase) {
      safeSottotitolo = 'Stesso peso';
    }
  }

  // 2. SMART (testo breve e fine)
  let smartSottotitolo = 'Progressione ideale';
  if (String(range.consigliato?.value).includes('r')) {
    smartSottotitolo = '+1 rep (+volume)';
  } else if (smartVal > pesoBase && pesoBase > 0) {
    const diffSmart = Math.round((smartVal - pesoBase) * 10) / 10;
    smartSottotitolo = `+${diffSmart}kg carico`;
  }

  // 3. SFIDANTE (testo breve e fine)
  let sfidanteSottotitolo = 'Spinta PR';
  let sfidanteValoreDisplay = `${formatWeight(sfidanteVal)} kg`;
  if (String(range.sfidante?.value).includes('r')) {
    sfidanteSottotitolo = '+2 rep (+volume)';
    sfidanteValoreDisplay = range.sfidante.display;
  } else if (targetRecordAssolutoKg && targetRecordAssolutoKg > sfidanteVal) {
    sfidanteValoreDisplay = `${formatWeight(sfidanteVal)} – ${formatWeight(targetRecordAssolutoKg)} kg`;
    const diffSfid = Math.round((sfidanteVal - smartVal) * 10) / 10;
    sfidanteSottotitolo = diffSfid > 0 ? `+${diffSfid}kg smart ➔ 👑 Record 1RM` : `Spinta ➔ 👑 Record 1RM`;
  } else if (sfidanteVal > smartVal && smartVal > 0) {
    const diffSfid = Math.round((sfidanteVal - smartVal) * 10) / 10;
    sfidanteSottotitolo = `+${diffSfid}kg vs smart`;
  }

  return [
    {
      tipo: 'safe',
      icon: '🛡️',
      nome: 'SAFE',
      isConsigliato: tipoConsigliato === 'safe',
      valoreDisplay: String(range.prudenziale.value).includes('r') ? range.prudenziale.display : `${formatWeight(safeVal)} kg`,
      pesoToApply: range.prudenziale.value,
      sottotitolo: safeSottotitolo,
      mesoPillText: tipoConsigliato === 'safe' ? mesoPillText : null,
      prGoalText: null,
      metricLabel: 'Probabilità:',
      metricValue: 'ALTA',
      themeColor: 'blue'
    },
    {
      tipo: 'smart',
      icon: '💡',
      nome: 'SMART',
      isConsigliato: tipoConsigliato === 'smart',
      valoreDisplay: String(range.consigliato.value).includes('r') ? range.consigliato.display : `${formatWeight(smartVal)} kg`,
      pesoToApply: range.consigliato.value,
      sottotitolo: smartSottotitolo,
      mesoPillText: tipoConsigliato === 'smart' ? mesoPillText : null,
      prGoalText: null,
      metricLabel: 'Progressione:',
      metricValue: 'OTTIMALE',
      themeColor: 'green'
    },
    {
      tipo: 'sfidante',
      icon: '🔥',
      nome: 'SFIDANTE',
      isConsigliato: tipoConsigliato === 'sfidante',
      valoreDisplay: sfidanteValoreDisplay,
      pesoToApply: sfidanteVal,
      recordAssolutoPesoToApply: targetRecordAssolutoKg,
      sottotitolo: sfidanteSottotitolo,
      mesoPillText: tipoConsigliato === 'sfidante' ? mesoPillText : null,
      prGoalText: sfidantePRGoalText,
      prDetail: sfidantePRDetail,
      minRepsPR: sfidanteMinRepsPR,
      metricLabel: 'Rischio:',
      metricValue: 'PIÙ ALTO',
      themeColor: 'orange'
    }
  ];
});

const calcolaRepsTargetPerPeso = (pesoCustom, pesoRef, repsRef) => {
  if (!pesoCustom || pesoCustom <= 0 || !pesoRef || pesoRef <= 0 || !repsRef || repsRef <= 0) {
    return { parita: 10, target: 11, sfidante: 12, e1rmRef: 0 };
  }
  const factorRef = 1 + (repsRef / 30);
  const e1rmRef = pesoRef * factorRef;
  const rawReps = ((e1rmRef / pesoCustom) - 1) * 30;
  
  const repsParita = Math.max(1, Math.round(rawReps));
  const e1rmParita = pesoCustom * (1 + repsParita / 30);
  const repsTarget = e1rmParita >= e1rmRef ? repsParita + 1 : Math.max(repsParita + 1, Math.round(rawReps) + 1);
  const repsSfidante = repsTarget + 1;

  return {
    parita: repsParita,
    target: repsTarget,
    sfidante: repsSfidante,
    e1rmRef: Math.round(e1rmRef * 10) / 10
  };
};

const calcolaProgressioneRepCustom = computed(() => {
  if (!workout.value) return null;
  const sett = aiutoWeek.value;
  const infoBase = getBaseWeekInfo(sett);
  
  let pVal = parseFloat(String(pesoCustomSimulatore.value !== null && pesoCustomSimulatore.value !== undefined ? pesoCustomSimulatore.value : '').replace(',', '.'));
  if (isNaN(pVal) || pVal <= 0) {
    const heroP = parseFloat(String(heroProposalData.value?.displayNum || valoreConsigliatoHeroDialog.value?.display || '').replace(',', '.'));
    pVal = (heroP > 0) ? heroP : ((infoBase && infoBase.pesoBase !== null && infoBase.pesoBase > 0) ? infoBase.pesoBase : (caricoConsigliatoViaDiMezzo.value || 20));
  }
  if (pVal <= 0) pVal = 20;

  let pesoRef = pVal;
  let repsRef = getRepsPerWeek(sett) || 10;

  if (infoBase && infoBase.pesoBase !== null && infoBase.pesoBase > 0 && infoBase.repsBase > 0) {
    pesoRef = infoBase.pesoBase;
    repsRef = infoBase.repsBase;
  } else {
    const ghost = getGhostLiftSmart(sett);
    if (ghost && ghost.peso > 0) {
      pesoRef = ghost.peso;
    }
  }

  const calc = calcolaRepsTargetPerPeso(pVal, pesoRef, repsRef);
  
  // Calcolo reps minime per fare PR assoluto di e1RM
  const bestE1rm = recordOverviewData.value?.bestE1RM?.e1rm || 0;
  let minRepsPerPR = calc.sfidante;
  let isSfidantePR = false;
  if (bestE1rm > 0 && pVal > 0) {
    let calcMin = Math.floor(((bestE1rm / pVal) - 1) * 30) + 1;
    if (repsRef > 0 && calcMin <= repsRef) {
      minRepsPerPR = repsRef + 1;
    } else {
      minRepsPerPR = Math.max(1, calcMin);
    }
    const e1rmSfidante = pVal * (1 + calc.sfidante / 30);
    if (e1rmSfidante > bestE1rm || calc.sfidante >= minRepsPerPR) {
      isSfidantePR = true;
    }
  }

  return {
    pesoCustom: pVal,
    pesoRef,
    repsRef,
    e1rmRef: calc.e1rmRef,
    parita: {
      reps: calc.parita,
      valore: `${formatWeight(pVal)}x${calc.parita}r`,
      label: 'Stessa Forza'
    },
    target: {
      reps: calc.target,
      valore: `${formatWeight(pVal)}x${calc.target}r`,
      label: 'Progressione +1r'
    },
    sfidante: {
      reps: calc.sfidante,
      valore: `${formatWeight(pVal)}x${calc.sfidante}r`,
      label: isSfidantePR ? `🏆 PR con ≥${minRepsPerPR}r` : 'Progressione +2r',
      isPR: isSfidantePR,
      minRepsPR: minRepsPerPR
    }
  };
});

const decrementaSimulatore = () => {
  vibraTattile(8);
  const isManubri = isManubriEsercizio(workout.value);
  let cur = parseFloat(String(pesoCustomSimulatore.value || 0).replace(',', '.'));
  if (isNaN(cur) || cur <= 0) {
    const heroP = parseFloat(String(heroProposalData.value?.displayNum || valoreConsigliatoHeroDialog.value?.display || '').replace(',', '.'));
    const info = getBaseWeekInfo(aiutoWeek.value);
    cur = (heroP > 0) ? heroP : ((info && info.pesoBase) ? info.pesoBase : (caricoConsigliatoViaDiMezzo.value || 20));
  }
  const step = getWeightStep(isManubri, cur);
  let next = isManubri ? getDumbbellSequenceWeight(cur, 'down') : Math.max(0, cur - (step || 0.5));
  pesoCustomSimulatore.value = Math.round(next * 100) / 100;
};

const incrementaSimulatore = () => {
  vibraTattile(8);
  const isManubri = isManubriEsercizio(workout.value);
  let cur = parseFloat(String(pesoCustomSimulatore.value || 0).replace(',', '.'));
  if (isNaN(cur) || cur <= 0) {
    const heroP = parseFloat(String(heroProposalData.value?.displayNum || valoreConsigliatoHeroDialog.value?.display || '').replace(',', '.'));
    const info = getBaseWeekInfo(aiutoWeek.value);
    cur = (heroP > 0) ? heroP : ((info && info.pesoBase) ? info.pesoBase : (caricoConsigliatoViaDiMezzo.value || 20));
  }
  const step = getWeightStep(isManubri, cur);
  let next = isManubri ? getDumbbellSequenceWeight(cur, 'up') : cur + (step || 0.5);
  pesoCustomSimulatore.value = Math.round(next * 100) / 100;
};

const toggleSimulatoreCarico = () => {
  showSimulatoreCarico.value = !showSimulatoreCarico.value;
  if (showSimulatoreCarico.value) {
    let cur = parseFloat(String(pesoCustomSimulatore.value !== null && pesoCustomSimulatore.value !== undefined ? pesoCustomSimulatore.value : '').replace(',', '.'));
    if (isNaN(cur) || cur <= 0) {
      const heroP = parseFloat(String(heroProposalData.value?.displayNum || valoreConsigliatoHeroDialog.value?.display || '').replace(',', '.'));
      const info = getBaseWeekInfo(aiutoWeek.value);
      cur = (heroP > 0) ? heroP : ((info && info.pesoBase && info.pesoBase > 0) ? info.pesoBase : (caricoConsigliatoViaDiMezzo.value || 20));
      pesoCustomSimulatore.value = cur;
    }
  }
};

// Inizializza pesoCustomSimulatore quando si apre la dialog o cambia settimana
watch([() => dialogStorico.value, () => aiutoWeek.value], ([isOpen, w]) => {
  if (isOpen) {
    const heroP = parseFloat(String(heroProposalData.value?.displayNum || valoreConsigliatoHeroDialog.value?.display || '').replace(',', '.'));
    const info = getBaseWeekInfo(w || aiutoWeek.value);
    const defP = (heroP > 0) ? heroP : ((info && info.pesoBase && info.pesoBase > 0) ? info.pesoBase : (caricoConsigliatoViaDiMezzo.value || 20));
    pesoCustomSimulatore.value = defP;
  }
}, { immediate: true });

// 4. COMPUTED SIMULATORE DINAMICO DATA
const simulatoreDinamicoData = computed(() => {
  if (!workout.value) return null;
  const sett = aiutoWeek.value;
  const infoBase = getBaseWeekInfo(sett);
  const isCavo = isCavoOMacchinaEsercizio(workout.value);

  let pVal = parseFloat(String(pesoCustomSimulatore.value || '').replace(',', '.'));
  if (isNaN(pVal) || pVal <= 0) {
    pVal = (infoBase && infoBase.pesoBase !== null && infoBase.pesoBase > 0) ? infoBase.pesoBase : (caricoConsigliatoViaDiMezzo.value || 20);
  }

  let pesoRef = pVal;
  let repsRef = getRepsPerWeek(sett);
  if (infoBase && infoBase.pesoBase !== null && infoBase.pesoBase > 0 && infoBase.repsBase > 0) {
    pesoRef = infoBase.pesoBase;
    repsRef = infoBase.repsBase;
  }

  const e1rmRef = calcolaE1RMSmorzato(pesoRef, repsRef, isCavo);
  const rawReps = pVal > 0 ? Math.max(1, Math.round(((e1rmRef / pVal) - 1) * 30)) : 10;
  const e1rmPrevisto = pVal * (1 + rawReps / 30);

  return {
    peso: pVal,
    repsStimate: rawReps,
    e1rmPrevisto: Math.round(e1rmPrevisto * 10) / 10,
    valoreToApply: pVal
  };
});

// 5. COMPUTED ANDAMENTO CARICO NEL MESOCICLO
const andamentoMesocicloData = computed(() => {
  if (!workout.value) return null;
  const sett = aiutoWeek.value;
  const isCorpoLibero = isCorpoLiberoEsercizio(workout.value);
  const isCorpoLiberoPuro = isCorpoLibero && !haPesoEsercizio.value;

  const settimane = [];
  let pesoW1 = null;
  let repsW1 = null;
  let pesoCurrent = null;
  let repsCurrent = null;

  for (let w = 1; w <= 6; w++) {
    const isCurrent = (w === sett);
    const insVal = inputSettimane.value[w]?.ins || workout.value['ins_week' + w];
    let valDisplay = '-';
    let valNum = null;
    let rNum = null;

    if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
      if (isCorpoLiberoPuro) {
        const rVal = estraiRepsDaInput(insVal) || getRepsPerWeek(w);
        rNum = rVal;
        valDisplay = `${rVal}r`;
      } else {
        const perf = estraiMigliorPrestazioneInput(insVal, getRepsPerWeek(w), isCavoOMacchinaEsercizio(workout.value));
        if (perf && perf.peso > 0) {
          valNum = perf.peso;
          rNum = perf.reps;
          valDisplay = (perf.reps && perf.reps !== getRepsPerWeek(w)) ? `${formatWeight(valNum)}x${rNum}` : `${formatWeight(valNum)}`;
        } else {
          const pStr = estraiPesoDaInput(insVal);
          const rVal = estraiRepsDaInput(insVal);
          if (pStr && rVal) {
            valNum = parseFloat(pStr);
            rNum = rVal;
            valDisplay = `${formatWeight(valNum)}x${rVal}`;
          } else if (pStr) {
            valNum = parseFloat(pStr);
            rNum = getRepsPerWeek(w);
            valDisplay = `${formatWeight(valNum)}`;
          } else if (rVal) {
            rNum = rVal;
            valDisplay = `${rVal}r`;
          }
        }
      }
    } else if (isCurrent) {
      // Usa il carico consigliato per la settimana corrente se non ancora inserito
      const ghost = getGhostRenderInfo(w);
      if (ghost && ghost.valueText) {
        const clean = String(ghost.valueText).replace(/\s*kg/gi, '').trim();
        valDisplay = clean;
        const pParsed = parseFloat(clean.replace(',', '.'));
        if (!isNaN(pParsed)) valNum = pParsed;
        const rMatch = clean.match(/x(\d+)r?/i);
        if (rMatch) rNum = parseInt(rMatch[1], 10);
        else rNum = getRepsPerWeek(w);
      }
    }

    if (w === 1) {
      if (valNum !== null) pesoW1 = valNum;
      if (rNum !== null) repsW1 = rNum;
      else repsW1 = getRepsPerWeek(1);
    }
    if (isCurrent) {
      if (valNum !== null) pesoCurrent = valNum;
      if (rNum !== null) repsCurrent = rNum;
      else repsCurrent = getRepsPerWeek(w);
    }

    settimane.push({
      week: w,
      label: `W${w}`,
      value: valDisplay,
      isCurrent
    });
  }

  let deltaProgressioneText = '';
  if (isCorpoLiberoPuro) {
    if (repsW1 !== null && repsCurrent !== null) {
      const diffReps = repsCurrent - repsW1;
      if (diffReps > 0) {
        deltaProgressioneText = `+${diffReps} reps nel mesociclo vs W1`;
      } else if (diffReps === 0) {
        deltaProgressioneText = `Progressione attiva fino a W${sett}`;
      } else {
        deltaProgressioneText = `${diffReps} reps vs W1`;
      }
    } else {
      deltaProgressioneText = `Progressione attiva fino a W${sett}`;
    }
  } else if (pesoW1 !== null && pesoCurrent !== null && pesoW1 > 0) {
    const diffKg = Math.round((pesoCurrent - pesoW1) * 10) / 10;
    const diffPct = Math.round(((pesoCurrent - pesoW1) / pesoW1) * 1000) / 10;
    const diffReps = (repsW1 !== null && repsCurrent !== null) ? (repsCurrent - repsW1) : 0;
    
    if (diffKg >= 0 && diffReps <= 0) {
      deltaProgressioneText = `+${diffKg} kg nel mesociclo • +${diffPct}%`;
    } else if (diffKg >= 0 && diffReps > 0) {
      deltaProgressioneText = `+${diffKg} kg • +${diffReps} reps nel mesociclo (+${diffPct}%)`;
    } else if (diffKg < 0 && diffReps > 0) {
      // Sovraccarico di volume ad alte ripetizioni (es. -3 kg ma +5 reps)
      const e1rmW1 = pesoW1 * (1 + (repsW1 || 10) / 30);
      const e1rmCurr = pesoCurrent * (1 + (repsCurrent || 10) / 30);
      const e1rmDiff = Math.round((e1rmCurr - e1rmW1) * 10) / 10;
      const pctVol = Math.round((diffReps / (repsW1 || 10)) * 100);
      if (e1rmDiff >= 0) {
        deltaProgressioneText = `${diffKg} kg • +${diffReps} reps nel mesociclo (+${pctVol}% vol, e1RM +${e1rmDiff}kg)`;
      } else {
        deltaProgressioneText = `${diffKg} kg • +${diffReps} reps nel mesociclo (+${pctVol}% vol)`;
      }
    } else {
      deltaProgressioneText = `${diffKg} kg nel mesociclo • ${diffPct}%`;
    }
  } else {
    deltaProgressioneText = `Progressione attiva fino a W${sett}`;
  }

  return {
    settimane,
    deltaProgressioneText
  };
});

// 6. COMPUTED "PERCHÉ QUESTO CONSIGLIO?"
const percheConsiglioData = computed(() => {
  if (!workout.value) return null;
  const sett = aiutoWeek.value;
  const targetReps = getRepsPerWeek(sett);
  const infoBase = getBaseWeekInfo(sett);
  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  const isCorpoLibero = isCorpoLiberoEsercizio(workout.value);
  const isCorpoLiberoPuro = isCorpoLibero && !haPesoEsercizio.value;

  let baseDiPartenza = 'N.D.';
  let e1rmRecente = 'N.D.';
  let incrementoVsBase = '';

  if (isCorpoLiberoPuro) {
    const bW = infoBase?.baseWNum ? `W${infoBase.baseWNum}` : (infoBase?.isPreviousWorkoutW6 ? 'W6 Prec.' : 'W1');
    const rBase = infoBase?.repsBase || targetReps;
    baseDiPartenza = `${bW}: ${rBase} reps`;
    e1rmRecente = 'N.D.';

    const heroDisplay = String(valoreConsigliatoHeroDialog.value.display || '');
    const heroReps = estraiRepsDaInput(heroDisplay) || (parseFloat(heroDisplay) || targetReps);
    if (heroReps && rBase) {
      const diffR = heroReps - rBase;
      if (diffR > 0) {
        incrementoVsBase = `+${diffR} rep${diffR > 1 ? 's' : ''}`;
      } else if (diffR === 0) {
        incrementoVsBase = '= vs base';
      } else {
        incrementoVsBase = `${diffR} reps`;
      }
    }
  } else if (infoBase && infoBase.pesoBase !== null && infoBase.pesoBase > 0) {
    const bW = infoBase.baseWNum ? `W${infoBase.baseWNum}` : (infoBase.isPreviousWorkoutW6 ? 'W6 Prec.' : 'W1');
    baseDiPartenza = `${bW}: ${formatWeight(infoBase.pesoBase)} kg × ${infoBase.repsBase || 10} reps`;
    const e1rm = calcolaE1RMSmorzato(infoBase.pesoBase, infoBase.repsBase || 10, isCavo);
    e1rmRecente = `${formatWeight(e1rm)} kg`;

    const heroVal = parseFloat(String(valoreConsigliatoHeroDialog.value.display).replace(',', '.'));
    if (heroVal > 0) {
      const diffKg = Math.round((heroVal - infoBase.pesoBase) * 10) / 10;
      const diffPct = Math.round(((heroVal - infoBase.pesoBase) / infoBase.pesoBase) * 1000) / 10;
      if (diffKg >= 0) {
        incrementoVsBase = `+${diffPct}% (+${diffKg} kg)`;
      } else {
        incrementoVsBase = `${diffPct}% (${diffKg} kg)`;
      }
    }
  }

  const targetAttuale = `${targetReps} reps in W${sett}`;
  const strategiaAttiva = sett === 6 ? 'Smart (Picco W6)' : (sensibilitaFaticaGhost.value === 'aggressiva' ? 'Sfidante (Spinta)' : (sensibilitaFaticaGhost.value === 'conservativa' ? 'Safe (Prudenziale)' : 'Smart (Bilanciata)'));

  // Logica discorsiva naturale
  let logicaCalcolo = spiegazioneDinamicaConsigliata.value;
  if (!logicaCalcolo || logicaCalcolo.length < 20) {
    if (isCorpoLiberoPuro) {
      logicaCalcolo = `Hai completato ${infoBase?.repsBase || targetReps} reps nella settimana precedente. Per raggiungere ${targetReps} reps in W${sett} e stimolare nuovo progresso muscolare, l'algoritmo propone una progressione di ripetizioni calibrata sul tuo recupero e storico.`;
    } else {
      logicaCalcolo = `Hai completato ${infoBase?.repsBase || 9} reps nella settimana precedente. Per raggiungere ${targetReps} reps in W${sett} e stimolare nuovo progresso muscolare, l'algoritmo propone un carico calibrato sul tuo recupero e storico.`;
    }
  }

  return {
    baseDiPartenza,
    e1rmRecente,
    targetAttuale,
    strategiaAttiva,
    incrementoVsBase: incrementoVsBase || '= vs base',
    logicaCalcolo
  };
});

// 7. COMPUTED STORICO TIMELINE ITEMS
const storicoTimelineItems = computed(() => {
  if (!workout.value) return [];
  const currentNumScheda = parseInt(workout.value.num_scheda);
  const isCorpoLibero = isCorpoLiberoEsercizio(workout.value);
  const isCorpoLiberoPuro = isCorpoLibero && !haPesoEsercizio.value;
  const items = [];
  const bestReal = recordOverviewData.value?.bestReal;

  // Scheda corrente (W1..W6)
  for (let w = 6; w >= 1; w--) {
    const insVal = inputSettimane.value[w]?.ins;
    if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
      const pStr = estraiPesoDaInput(insVal);
      const p = (pStr && !isCorpoLiberoPuro) ? parseFloat(pStr) : null;
      const r = estraiRepsDaInput(insVal) || getRepsPerWeek(w);
      const isRecord = (bestReal && bestReal.isCurrent && (parseInt(bestReal.week) === w || (!isCorpoLiberoPuro && p !== null && p === bestReal.weight && r === bestReal.reps) || (isCorpoLiberoPuro && r === bestReal.reps))) || (analizzaRecordSettimana(w)?.stato === 'record');
      items.push({
        id: `current_w${w}`,
        titolo: `W${w} attuale`,
        caricoReps: (p !== null && !isCorpoLiberoPuro) ? `${formatWeight(p)} kg × ${r}r` : `${r}r`,
        isPR: !!isRecord,
        data: 'oggi / in corso',
        tempo: 'questa scheda',
        isCurrent: true
      });
    }
  }

  // Storico passato
  if (storicoEsercizio.value && storicoEsercizio.value.length) {
    const sorted = [...storicoEsercizio.value].sort((a, b) => parseInt(b.num_scheda) - parseInt(a.num_scheda));
    sorted.forEach(prevEx => {
      const sNum = parseInt(prevEx.num_scheda);
      if (!isNaN(sNum) && sNum >= currentNumScheda) return;
      const dEx = getExecutionDate(prevEx, storicoEsercizio.value, workout.value);
      const tempo = tempoTrascorso(dEx) || formattaDataStorico(dEx);

      for (let w = 6; w >= 1; w--) {
        const val = prevEx['ins_week' + w];
        if (val && String(val).trim() !== '' && String(val).trim() !== '-') {
          const pStr = estraiPesoDaInput(val);
          const p = (pStr && !isCorpoLiberoPuro) ? parseFloat(pStr) : null;
          const rPrescr = prevEx['reps_week' + w] || estraiRepsDaPrescrizione(prevEx['des_week' + w]);
          const r = estraiRepsDaInput(val) || (rPrescr ? parseInt(rPrescr, 10) : 6);

          // Controlla se questa esecuzione corrisponde al record (PR assoluto)
          const isThisPR = bestReal && !bestReal.isCurrent && (
            (String(bestReal.sheet) === String(prevEx.num_scheda) && parseInt(bestReal.week) === w) ||
            (!isCorpoLiberoPuro && p !== null && p === bestReal.weight && r === bestReal.reps && String(bestReal.sheet) === String(prevEx.num_scheda)) ||
            (isCorpoLiberoPuro && r === bestReal.reps && String(bestReal.sheet) === String(prevEx.num_scheda))
          );

          items.push({
            id: `${prevEx.id || prevEx.num_scheda}_w${w}`,
            titolo: `Sch. ${prevEx.num_scheda} • W${w}`,
            caricoReps: (p !== null && !isCorpoLiberoPuro) ? `${formatWeight(p)} kg × ${r}r` : `${r}r`,
            isPR: !!isThisPR,
            data: formattaDataStorico(dEx),
            tempo: tempo,
            isCurrent: false
          });
        }
      }
    });
  }

  return items;
});

const opzioniStradeProgressione = computed(() => {
  if (!workout.value) return [];
  const sett = aiutoWeek.value;
  
  const range = getGhostWeightsRangeForWeek(sett);
  if (!range) return [];

  const res = [];
  const infoBase = getBaseWeekInfo(sett);
  const pesoBase = infoBase && infoBase.pesoBase !== null && !isNaN(infoBase.pesoBase) ? infoBase.pesoBase : 0;
  const isManubri = isManubriEsercizio(workout.value);
  const step = getWeightStep(isManubri, pesoBase);

  const prudenzialeVal = parseFloat(range.prudenziale.value) || 0;
  
  // Se c'è un salto importante dal peso precedente, aggiungiamo l'opzione "Graduale" (+1 step)
  if (pesoBase > 0 && prudenzialeVal >= pesoBase + (2 * step)) {
    const pesoGraduale = pesoBase + step;
    res.push({
      tipo: 'graduale',
      titolo: '🟢 Graduale',
      sottoTitolo: `Rientro Soft (+${formatWeight(step)}kg)`,
      valore: `${formatWeight(pesoGraduale)} kg`,
      peso: pesoGraduale,
      isAttiva: false
    });
  }

  res.push(
    {
      tipo: 'safe',
      titolo: '🛡️ Safe',
      sottoTitolo: range.prudenziale.label || 'Prudenziale',
      valore: range.prudenziale.display,
      peso: range.prudenziale.value,
      isAttiva: sensibilitaFaticaGhost.value === 'conservativa'
    },
    {
      tipo: 'smart',
      titolo: '💡 Smart',
      sottoTitolo: sett === 6 ? 'Picco W6' : (range.consigliato.label || 'Consigliato'),
      valore: range.consigliato.display,
      peso: range.consigliato.value,
      isAttiva: sensibilitaFaticaGhost.value === 'bilanciata'
    },
    {
      tipo: 'sfidante',
      titolo: '🔥 Sfidante',
      sottoTitolo: range.sfidante.label || 'Sfidante',
      valore: range.sfidante.display,
      peso: range.sfidante.value,
      isAttiva: sensibilitaFaticaGhost.value === 'aggressiva'
    }
  );

  // Opzione 4: Stesso Carico (+Reps) se l'utente vuole mantenere il peso base del mesociclo
  if (pesoBase > 0) {
    const calcRep = calcolaProgressioneRepCustom.value;
    if (calcRep && calcRep.target) {
      const valStr = calcRep.target.valore;
      const giaPresente = res.some(o => o.valore === valStr || o.valore === `${formatWeight(pesoBase)} kg`);
      if (!giaPresente) {
        res.push({
          tipo: 'stesso_peso',
          titolo: '🔄 Stesso Carico',
          sottoTitolo: `Progressione Vol. (+1r)`,
          valore: valStr,
          peso: valStr,
          isAttiva: false
        });
      }
    }
  }

  return res;
});



const spiegazioneDinamicaConsigliata = computed(() => {
  if (!workout.value) return '';
  const sett = aiutoWeek.value;

  const presc = parsedPrescription(workout.value['des_week' + sett]);
  if (presc && presc.total) {
    const pNum = parseFloat(String(presc.total).replace(',', '.'));
    if (!isNaN(pNum) && pNum > 0) {
      if (presc.side) {
        return `🎯 Carico di forza prescritto dal coach per la Week ${sett}: ${presc.total} kg totali (${presc.side} kg per lato).`;
      }
      return `🎯 Carico di forza prescritto dal coach per la Week ${sett}: ${presc.total} kg.`;
    }
  }

  const ghostRender = getGhostRenderInfo(sett);
  if (ghostRender && ghostRender.maxEffortNotice) {
    return ghostRender.maxEffortNotice;
  }

  const infoBaseCurrent = getBaseWeekInfo(aiutoWeek.value);
  if (infoBaseCurrent && infoBaseCurrent.baseInsText && isInputIndicaLimiteOStallo(infoBaseCurrent.baseInsText, infoBaseCurrent.noteText, infoBaseCurrent.faticaText)) {
    return `⚡ Sforzo al limite / difficile registrato nella sessione precedente (${infoBaseCurrent.pesoBase} kg). Il sistema ti consiglia di mantenere lo stesso peso per completare una progressione di ripetizioni prima di incrementare il carico.`;
  }

  if (aiutoWeek.value === 2 && regolaProgressioneW2.value === 'peso') {
    const infoBase = getBaseWeekInfo(2);
    const pesoEffettivoW1 = infoBase && infoBase.pesoBase !== null && !isNaN(infoBase.pesoBase) ? infoBase.pesoBase : 0;
    if (pesoEffettivoW1 > 0) {
      return `📈 Progressione a carico attiva per la Week 2! Il sistema propone un incremento di 1 step rispetto al carico reale di ${pesoEffettivoW1} kg sollevato in Week 1.`;
    }
  }

  if (volumeProgressionInfo.value.active) {
    const info = volumeProgressionInfo.value;
    return `⚡ Progressione di volume attiva! Le ripetizioni richieste sono aumentate (da ${info.repsBase} a ${info.repsTarget} reps). Mantenere lo stesso peso di ${info.pesoBase} kg (usato in W${info.baseWNum}${info.isPreviousWorkoutW6 ? ' prec.' : ''}) è già a tutti gli effetti una progressione per la modalità Safe. Se desideri aumentare anche il carico, seleziona le opzioni Consigliato o Sfidante!`;
  }

  const programmato = pesoPropostoDettaglio.value;
  const numConsigliato = ghostRender ? parseFloat(String(ghostRender.valueText).replace(',', '.')) : caricoConsigliatoViaDiMezzo.value;
  
  if (numConsigliato === null || isNaN(numConsigliato) || programmato === null) {
    if (ghostRender && ghostRender.valueText) {
      return `🎯 Target consigliato: ${ghostRender.valueText}.`;
    }
    return '';
  }
  
  if (numConsigliato > programmato) {
    return `📈 Forza stimata in crescita. Carico proposto: ${formatWeight(numConsigliato)} kg per progredire in sicurezza.`;
  } else if (numConsigliato < programmato) {
    return `⚠️ Prestazioni recenti suggeriscono prudenza. Carico consigliato: ${formatWeight(numConsigliato)} kg.`;
  } else {
    return `🎯 Carico consigliato allineato alla scheda: ${formatWeight(numConsigliato)} kg.`;
  }
});

const renderMarkdownBold = (text) => {
  if (!text) return '';
  return String(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\n/g, '<br/>');
};

const strategieProgressione = computed(() => {
  if (!workout.value) return [];
  const sett = aiutoWeek.value;
  const ghost = getGhostLiftSmart(sett);
  if (!ghost || ghost.isRepExercise) return [];

  const pesoBaseOriginale = ghost.pesoBaseOriginale || ghost.peso || 0;
  const pesoEffettivoBase = (ghost.text && estraiPesoDaInput(ghost.text)) ? parseFloat(estraiPesoDaInput(ghost.text)) : null;
  const pesoBase = (pesoEffettivoBase !== null && pesoEffettivoBase > 0) ? pesoEffettivoBase : pesoBaseOriginale;
  
  const baseWeekInfo = getBaseWeekInfo(sett);
  const repsBaseVal = baseWeekInfo ? baseWeekInfo.repsBase : 10;
  const repsTarget = baseWeekInfo ? baseWeekInfo.repsTarget : 10;
  
  // Calcola peso proposto standard
  const pesoProposto = ghost.isPostScarico && ghost.pesoProposto !== undefined ? ghost.pesoProposto : ghost.peso;

  // Mostriamo le strategie solo se c'è una proposta di incremento peso rispetto al base
  if (pesoProposto <= pesoBase) {
    return [];
  }

  // 1. Intensità (Standard)
  const intensita = {
    tipo: 'intensita',
    titolo: '🚀 Intensità (Standard)',
    peso: pesoProposto,
    reps: repsTarget,
    descrizione: `Aumenta il carico a **${formatWeight(pesoProposto)} kg** per **${repsTarget}** ripetizioni (stima basata sulla tua performance).`
  };

  // 2. Micro-carico (Graduale)
  let pesoMicro = pesoBase + (pesoProposto - pesoBase) / 2;
  pesoMicro = Math.round(pesoMicro / 0.25) * 0.25;
  if (pesoMicro <= pesoBase) pesoMicro = pesoBase + 0.5;
  if (pesoMicro >= pesoProposto) pesoMicro = Math.max(pesoBase, pesoProposto - 0.5);

  const micro = {
    tipo: 'micro',
    titolo: '⚖️ Micro-carico (Graduale)',
    peso: pesoMicro,
    reps: repsTarget,
    descrizione: `Aumenta leggermente a **${formatWeight(pesoMicro)} kg** per **${repsTarget}** ripetizioni (ideale se disponi di micro-carichi o frazionali).`
  };

  // 3. Volume (Aumento Ripetizioni)
  const repsVolume = Math.max(repsTarget + 1, repsBaseVal + 1);
  const volume = {
    tipo: 'volume',
    titolo: '📈 Volume (Più Ripetizioni)',
    peso: pesoBase,
    reps: repsVolume,
    descrizione: `Mantieni lo stesso peso di **${formatWeight(pesoBase)} kg**, ma punta a eseguire **${repsVolume}** ripetizioni per generare sovraccarico di volume.`
  };

  return [intensita, micro, volume];
});

const apriAiutoCaricoDettagliato = async (sett) => {
  vibraTattile(10);
  activeTabAnalisi.value = 0; // Tab Proposta Carico
  showSimulatoreCarico.value = false;
  showPercheConsiglio.value = false;
  showStoricoCompleto.value = false;
  showCambioPalestra.value = false;
  dialogStorico.value = true;
  await caricaDatiAnalisi(sett);
  const info = getBaseWeekInfo(sett);
  pesoCustomSimulatore.value = (info && info.pesoBase) ? info.pesoBase : (caricoConsigliatoViaDiMezzo.value || 0);
};

const applicaPropostaCaricoStorico = (peso) => {
  vibraTattile(12);
  const targetInput = inputSettimane.value[aiutoWeek.value];
  if (targetInput) {
    const pesoFormattato = String(peso).replace('.', ',');
    targetInput.ins = pesoFormattato;
    salvaDatoSettimanale(aiutoWeek.value, 'ins');
    dialogStorico.value = false;
    
    // Mostra snackbar di successo
    snackbarMessaggio.value = `Applicato carico ${pesoFormattato} per W${aiutoWeek.value}!`;
    snackbarSalvataggio.value = true;
  }
};



// Grafico Storico Esercizio
const modeGraficoStorico = ref('A'); // 'A', 'B', 'C'
const raggruppamentoReps = ref('esatto'); // 'esatto', 'zone', 'fasce'
const availableBuckets = ref([]);
const selectedBuckets = ref([]);
const storicoChartData = ref({ labels: [], datasets: [] });
const storicoChartReady = ref(false);
const rawPointsLocal = ref([]);
const selectedPointDetails = ref(null);
const showAnalisiAndamento = ref(true);

const getBucketLabel = (reps, mode) => {
  if (mode === 'zone') {
    if (reps >= 1 && reps <= 5) return 'Forza (1-5r)';
    if (reps >= 6 && reps <= 9) return 'Ipertrofia Funz. (6-9r)';
    if (reps >= 10 && reps <= 12) return 'Ipertrofia/Vol. (10-12r)';
    if (reps >= 13) return 'Resistenza (13r+)';
    return 'Altro';
  } else if (mode === 'fasce') {
    if (reps >= 1 && reps <= 3) return '1-3r';
    if (reps >= 4 && reps <= 6) return '4-6r';
    if (reps >= 7 && reps <= 9) return '7-9r';
    if (reps >= 10 && reps <= 12) return '10-12r';
    if (reps >= 13 && reps <= 15) return '13-15r';
    if (reps >= 16) return '16r+';
    return 'Altro';
  } else {
    return `${reps} reps`;
  }
};

const toggleBucketFilter = (bucket) => {
  const index = selectedBuckets.value.indexOf(bucket);
  if (index > -1) {
    if (selectedBuckets.value.length > 1) {
      selectedBuckets.value.splice(index, 1);
    }
  } else {
    selectedBuckets.value.push(bucket);
  }
};

const toggleAllBuckets = () => {
  if (selectedBuckets.value.length === availableBuckets.value.length) {
    selectedBuckets.value = [availableBuckets.value[0]];
  } else {
    selectedBuckets.value = [...availableBuckets.value];
  }
};

const parseWeightLocal = (val) => {
  if (!val) return 0;
  const clean = String(val).replace(/,/g, '.').trim();
  if (/^\d+(?:\.\d+)?\s*[rR]\b/i.test(clean) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(clean)) return 0;
  const cleanNum = clean.replace(/[^\d.]/g, ' ').trim();
  const parts = cleanNum.split(/\s+/);
  const num = parseFloat(parts[0]);
  return isNaN(num) ? 0 : num;
};

const parseRepsLocal = (val) => {
  if (!val) return 0;
  const clean = String(val).replace(/,/g, '.').trim();
  if (/^\d+(?:\.\d+)?\s*[rR]\b/i.test(clean) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(clean)) {
    const num = parseInt(clean);
    return isNaN(num) ? 0 : num;
  }
  const cleanNum = clean.replace(/[^\d]/g, ' ').trim();
  const parts = cleanNum.split(/\s+/);
  const num = parseInt(parts[0]);
  return isNaN(num) ? 0 : num;
};

const dialogGifFullScreen = ref(false);
const eliminandoEsercizio = ref(false);
const caricandoStorico = ref(false);
const storicoTableContainer = ref(null);
const storicoScrollContainer = ref(null); // Ref per lo scroll verticale
const storicoEsercizio = ref([]);
const snackbarMessaggio = ref('');

const layoutCorrente = computed(() => {
  if (layoutDettaglioGlobal.value === 'auto') {
    return layoutEserciziGlobal.value;
  }
  return layoutDettaglioGlobal.value;
});

// Previous Workout Editing States
const inputSettimanePrecedente = ref({
  1: { ins: '', reps: '' },
  2: { ins: '', reps: '' },
  3: { ins: '', reps: '' },
  4: { ins: '', reps: '' },
  5: { ins: '', reps: '' },
  6: { ins: '', reps: '' }
});
const numIns6ValPrecedente = ref('');
const numFaticaw6ValPrecedente = ref('');
const activeEditingWeekPrecedente = ref(null);

const attivaEditingWeekPrecedente = (w) => {
  activeEditingWeekPrecedente.value = w;
  nextTick(() => {
    const el = document.getElementById('input-prev-peso-w' + w);
    if (el) {
      el.focus();
    }
  });
};

const onBlurWeekPrecedente = (w) => {
  activeEditingWeekPrecedente.value = null;
  salvaDatoSettimanalePrecedente(w, 'ins');
};

const getGhostStatusPrecedente = (w) => {
  const currentInput = inputSettimanePrecedente.value[w]?.ins;
  if (!currentInput || !String(currentInput).trim()) return 'empty';

  if (w === 1) return 'up'; // Week 1 base sempre verde come concordato

  const isRepEx = previousWorkout.value ? isCorpoLiberoEsercizio(previousWorkout.value) : false;

  // Cerca la settimana precedente con un dato valido per il confronto
  let refInput = null;
  for (let prevW = w - 1; prevW >= 1; prevW--) {
    const prevVal = inputSettimanePrecedente.value[prevW]?.ins;
    if (prevVal && String(prevVal).trim()) {
      refInput = prevVal;
      break;
    }
  }

  if (!refInput) return 'up';

  if (isRepEx) {
    const currentReps = estraiRepsDaPrescrizione(currentInput) || parseFloat(String(currentInput).replace(/,/g, '.').trim());
    const refReps = estraiRepsDaPrescrizione(refInput) || parseFloat(String(refInput).replace(/,/g, '.').trim());
    if (!isNaN(currentReps) && !isNaN(refReps)) {
      return currentReps > refReps ? 'up' : 'down';
    }
    return 'up';
  }

  const currentPesoStr = estraiPesoDaInput(currentInput);
  const refPesoStr = estraiPesoDaInput(refInput);

  if (!currentPesoStr) return 'filled';
  if (!refPesoStr) return 'up';

  const currentPeso = parseFloat(currentPesoStr);
  const refPeso = parseFloat(refPesoStr);

  if (isNaN(currentPeso) || isNaN(refPeso)) return 'filled';
  
  const currentReps = estraiRepsDaInput(currentInput) || 10;
  const refReps = estraiRepsDaInput(refInput) || 10;

  if (currentPeso > refPeso) return 'up';
  if (currentPeso === refPeso) return currentReps > refReps ? 'up' : 'down';
  return 'down';
};

const getGhostFieldClassPrecedente = (w) => {
  const status = getGhostStatusPrecedente(w);
  if (status === 'up') return 'ghost-glow-green';
  if (status === 'down') return 'ghost-glow-blue';
  if (status === 'filled') return 'ghost-glow-orange';
  return '';
};

// Blocco storico rimosso per modifiche sempre abilitate


const parseTimeToSeconds = (tStr) => {
  if (!tStr) return { seconds: 90, minSeconds: null };

  const parseSinglePartToSeconds = (p) => {
    // Normalizza apici doppi, apici singoli consecutivi e spazi
    p = p.trim().toLowerCase().replace(/''|""/g, '"');
    if (!p) return 0;

    // Se il formato è mm:ss (es. 1:30)
    if (p.includes(':')) {
      const parts = p.split(':');
      return (parseInt(parts[0], 10) || 0) * 60 + (parseInt(parts[1], 10) || 0);
    }

    // Minuti e secondi combinati tramite separatore (es. 1'30", 1'45', 1m45, 1'30)
    const matchMinSec = p.match(/^(\d+)\s*(?:'|m|min)\s*(\d+)/);
    if (matchMinSec) {
      const mins = parseInt(matchMinSec[1], 10) || 0;
      const secs = parseInt(matchMinSec[2], 10) || 0;
      return mins * 60 + secs;
    }

    // Solo secondi (es. 45" o 45s)
    if (p.endsWith('"') || p.endsWith("s")) {
      const secs = parseFloat(p.replace(/"|s/g, '')) || 0;
      return Math.round(secs);
    }

    // Solo minuti (es. 1' o 1m o 1min)
    if (p.endsWith("'") || p.endsWith("m") || p.endsWith("min")) {
      const mins = parseFloat(p.replace(/min|m|'/g, '')) || 0;
      if (mins > 5) return Math.round(mins); // Se > 5, sono molto probabilmente secondi (es. 30' o 45')
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

  // Verifica la presenza di intervalli/range tramite '-', '–', '—' o '/'
  let parts = [];
  if (clean.includes('-')) {
    parts = clean.split('-');
  } else if (clean.includes('–')) {
    parts = clean.split('–');
  } else if (clean.includes('—')) {
    parts = clean.split('—');
  } else if (clean.includes('/')) {
    parts = clean.split('/');
  }

  if (parts.length > 1) {
    const lowerStr = parts[0].trim();
    const upperStr = parts[parts.length - 1].trim();
    const lowerVal = parseSinglePartToSeconds(lowerStr);
    const upperVal = parseSinglePartToSeconds(upperStr);

    if (upperVal > 0 && lowerVal > 0) {
      return { seconds: upperVal, minSeconds: lowerVal };
    }
    if (upperVal > 0) return { seconds: upperVal, minSeconds: null };
    if (lowerVal > 0) return { seconds: lowerVal, minSeconds: null };
  }

  const defaultTimer = parseInt(localStorage.getItem('woapp_default_timer_rec') || '90', 10);
  const val = parseSinglePartToSeconds(clean);
  return { seconds: val > 0 ? val : defaultTimer, minSeconds: null };
};

const avviaTimerRecupero = (recStr, label) => {
  const parsed = parseTimeToSeconds(recStr);
  startGlobalTimer(parsed.seconds, label, parsed.minSeconds);
};

// Parametri
const routeIdLocal = ref(route.params.id);
const transitionName = ref(''); // Vuoto per evitare animazioni all'apertura dalla lista
const settimanaAttiva = ref(1);
const tuttiEserciziGiorno = ref([]);

// Ricerca Rapida Esercizi nel Dettaglio
const dialogRicercaRapida = ref(false);
const testoRicercaDettaglio = ref('');

const eserciziRicercatiDettaglioRaggruppati = computed(() => {
  if (!tuttiEserciziGiorno.value || tuttiEserciziGiorno.value.length === 0) return [];
  const query = testoRicercaDettaglio.value.toLowerCase().trim();
  
  let lista = tuttiEserciziGiorno.value;
  if (query) {
    lista = lista.filter(item => {
      const nome = String(item.des_esercizio || '').toLowerCase();
      const settore = String(item.des_settore || '').toLowerCase();
      const note = String(item.des_note_attrezzo || '').toLowerCase();
      return nome.includes(query) || settore.includes(query) || note.includes(query);
    });
  }

  const mappa = {};
  lista.forEach(ex => {
    const g = (ex.des_giorno || 'A').trim().toUpperCase();
    if (!mappa[g]) mappa[g] = [];
    mappa[g].push(ex);
  });

  return Object.keys(mappa).sort().map(giorno => ({
    giorno,
    esercizi: mappa[giorno].sort((a, b) => (parseInt(a.num_riga_giorno) || 0) - (parseInt(b.num_riga_giorno) || 0))
  }));
});

const vaiADettaglioEsercizioRicercato = (id) => {
  vibraTattile(10);
  dialogRicercaRapida.value = false;
  testoRicercaDettaglio.value = '';
  router.replace({ name: 'DettaglioWorkout', params: { id } });
};

// Verifica se stiamo guardando una scheda passata (Modalità Storico)
const isSchedaPassata = computed(() => {
  if (!workout.value || !workout.value.num_scheda || !selectedSheet.value) return false;
  return parseInt(workout.value.num_scheda) < parseInt(selectedSheet.value);
});

// Stato
const workout = ref(null);
const riga0 = ref(null);
const dataMesociclo = ref('');
const caricamento = ref(true);
const mostraSpiegazioneTut = ref(false);

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

// Info dettagliate sulla superserie per la UI
const infoSuperset = computed(() => {
  if (!workout.value || !workout.value.alf_superserie || tuttiEserciziGiorno.value.length === 0) {
    return { inSuperset: false, letter: '', total: 0, currentIndex: 0, nextExercise: null, isLast: false };
  }
  
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
  
  if (!targetBlock) {
    return { inSuperset: false, letter: '', total: 0, currentIndex: 0, nextExercise: null, isLast: false };
  }
  
  const idx = targetBlock.exercises.findIndex(item => {
    const itemId = String(item.id || '');
    const itemNumRiga = item.num_riga ? String(item.num_riga) : '';
    return (itemId && itemId === currentId) || (itemNumRiga && itemNumRiga === currentId) ||
           (itemId && itemId === currentNumRiga) || (itemNumRiga && itemNumRiga === currentNumRiga);
  });
  
  const total = targetBlock.exercises.length;
  const currentIndex = idx + 1;
  const isLast = currentIndex === total;
  
  // Se è l'ultimo, il prossimo esercizio per ricominciare il giro è il primo del blocco
  const nextExercise = isLast ? targetBlock.exercises[0] : targetBlock.exercises[idx + 1];
  
  return {
    inSuperset: true,
    letter: targetBlock.letter,
    total,
    currentIndex,
    nextExercise,
    isLast
  };
});

// Formatta la prescrizione sintetica di un esercizio collegato in superserie (serie x reps)
const formatPrescrizioneSuperset = (connEx) => {
  const w = settimanaAttiva.value;
  const desWeek = connEx['des_week' + w] || connEx.des_qta_report || '';
  if (!desWeek) return `Pos. ${connEx.num_riga_giorno}`;
  
  // Prova a parsare la prescrizione strutturata
  const parsed = parsePrescription(desWeek);
  if (parsed && parsed.reps) {
    let result = parsed.reps;
    if (parsed.total) {
      result += ` - ${parsed.total} kg`;
    }
    return result;
  }
  
  // Fallback: mostra la stringa grezza abbreviata
  const clean = desWeek.trim();
  if (clean.length > 25) {
    return clean.substring(0, 22) + '...';
  }
  return clean;
};

const vaiAdEsercizioCollegato = (id) => {
  vibraTattile(12);
  router.replace({ name: 'DettaglioWorkout', params: { id } });
};

const haEsponenti = computed(() => {
  if (!workout.value || !settimanaAttiva.value) return false;
  const esponentiRegex = /[⁰¹²³⁴⁵⁶⁷⁸⁹]/;
  const des = workout.value['des_week' + settimanaAttiva.value] || '';
  return esponentiRegex.test(des);
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
const numIns6ModificatoManualmente = ref(false);
const numFaticaw6Val = ref('');
const indRepsStartVal = ref('');

const previousWorkout = ref(null);

// Gestione Comfort Articolare e Infortuni
const ghostSbloccato = ref(false);
const dialogInfortunio = ref(false);
const dialogLivelloForza = ref(false);
const infortunioArticolazione = ref('');
const infortunioGravita = ref(3);
const infortunioNote = ref('');
const salvataggioInfortunio = ref(false);

const getStrengthGreeting = (livello) => {
  const map = {
    'Neofita': 'Benvenuto nel percorso di forza! 🚀',
    'Principiante': 'Ottimo inizio, stai progredendo! 💪',
    'Intermedio': 'Sei sulla buona strada, continuiamo a spingere! 🔥',
    'Avanzato': 'Livello impressionante! Sei tra i migliori! 🎖️',
    'Elite': 'Sei una macchina da guerra! Livello Elite assoluto! 🏆'
  };
  return map[livello] || 'Grande livello di forza!';
};

const getStrengthSpeech = (rmt) => {
  if (!rmt) return '';
  const massimaleStr = rmt.massimale || '0';
  const livello = rmt.livelloTesto || '';

  const map = {
    'Neofita': `Massimale (1RMT): ${massimaleStr} kg. Ottimo punto di partenza: in questa fase i margini di adattamento sono enormi e ogni sessione aumenterà la tua forza.`,
    'Principiante': `Massimale (1RMT): ${massimaleStr} kg. Stai consolidando tecnica esecutiva e coordinazione motoria: con costanza i carichi saliranno regolarmente in sicurezza.`,
    'Intermedio': `Massimale (1RMT): ${massimaleStr} kg. Fase iniziale superata: i muscoli rispondono bene alla programmazione e la dedizione porta risultati.`,
    'Avanzato': `Massimale (1RMT): ${massimaleStr} kg. Livello avanzato: ogni chilo extra richiede impegno costante, tecnica millimetrica e massima intensità.`,
    'Elite': `Massimale (1RMT): ${massimaleStr} kg. Top assoluto nell'esercizio: coordinazione, tecnica e resilienza fisica sono al massimo potenziale.`
  };
  return map[livello] || `Massimale (1RMT): ${massimaleStr} kg. Continua a spingere per migliorare ancora.`;
};

const getVariationExplanation = (rmt) => {
  if (!rmt || !rmt.variazione) return '';
  const varStr = rmt.variazione;
  const isDown = varStr.includes('↓');
  const percent = varStr.replace(/[↓↑\s%]/g, '');

  if (isDown) {
    return `Massimale -${percent}% rispetto al mesociclo precedente. Calo fisiologico: può dipendere da stanchezza, scarico, cambio focus o diverso range di reps.`;
  } else {
    return `Massimale +${percent}% rispetto al mesociclo precedente! Progresso frutto di ottima periodizzazione, recupero e risposta muscolare.`;
  }
};

const getNextLevelRequirement = (rmt) => {
  if (!rmt) return '';
  if (rmt.prossimoLivello) {
    const current = parseFloat(rmt.massimale.replace(',', '.')) || 0;
    const targetDiff = parseFloat(rmt.prossimoLivello.replace(',', '.')) || 0;
    const targetPeso = Math.round((current + targetDiff) * 10) / 10;
    return `Mancano circa ${rmt.prossimoLivello} kg (target: ${targetPeso} kg) per sbloccare la prossima stella e avanzare di livello.`;
  }
  return 'Livello massimo raggiunto! Continua a consolidare questa prestazione.';
};

const listaArticolazioni = [
  'Spalla',
  'Gomito',
  'Polso',
  'Cervicale / Collo',
  'Lombare / Schiena',
  'Anche / Bacino',
  'Ginocchio',
  'Caviglia',
  'Altro'
];

const ottieniArticolazioneSuggerita = () => {
  if (!workout.value) return 'Altro';
  const settore = String(workout.value.des_settore || '').toLowerCase();
  const settorePrinc = String(workout.value.des_settore_princ || '').toLowerCase();
  
  if (settorePrinc.includes('petto') || settorePrinc.includes('spall') || settore.includes('petto') || settore.includes('spall') || settore.includes('deltoid')) {
    return 'Spalla';
  }
  if (settorePrinc.includes('bracc') || settore.includes('bicipit') || settore.includes('tricipit') || settore.includes('brach')) {
    return 'Gomito';
  }
  if (settorePrinc.includes('avambracc') || settore.includes('polso')) {
    return 'Polso';
  }
  if (settorePrinc.includes('dorsal') || settorePrinc.includes('schiena') || settore.includes('trazion') || settore.includes('remator')) {
    return 'Lombare / Schiena';
  }
  if (settorePrinc.includes('gambe') || settorePrinc.includes('glutei') || settore.includes('squat') || settore.includes('affond') || settore.includes('pressa')) {
    if (settore.includes('polpacc') || settore.includes('gastrocn')) return 'Caviglia';
    return 'Ginocchio';
  }
  if (settorePrinc.includes('addom') || settore.includes('crunch') || settore.includes('plank')) {
    return 'Lombare / Schiena';
  }
  return 'Altro';
};

const infortuniAttiviEsercizio = computed(() => {
  if (!workout.value || !globalInfortuni.value) return [];
  
  const currentExName = String(workout.value.des_esercizio || '').trim().toLowerCase();
  const suggestedJoint = ottieniArticolazioneSuggerita().toLowerCase();
  
  return globalInfortuni.value.filter(inf => {
    if (inf.stato !== 'attivo') return false;
    
    const matchesExName = inf.esercizi_originari && inf.esercizi_originari.some(ex => String(ex).toLowerCase().trim() === currentExName);
    
    const matchesJoint = inf.articolazione_coinvolta && (
      String(inf.articolazione_coinvolta).toLowerCase().includes(suggestedJoint) ||
      suggestedJoint.includes(String(inf.articolazione_coinvolta).toLowerCase())
    );
    
    return matchesExName || matchesJoint;
  });
});



const segnaComeGuarito = async (idInfortunio) => {
  vibraTattile(10);
  try {
    await risolviInfortunio(idInfortunio);
  } catch (err) {
    console.error("Errore risoluzione infortunio:", err);
  }
};

// Gestione Dialog Bottom Sheet Fastidio / Infortunio (Option 1A, 2A, 3A, 3C, 4A)
const dialogFastidio = ref(false);
const fastidioSelezionato = ref(null);
const formFastidioArticolazione = ref('Spalla');
const formFastidioGravita = ref(3);
const formFastidioPct = ref(10);
const formFastidioApplica = ref(true);
const formFastidioNote = ref('');
const salvandoFastidio = ref(false);
const mostraModificaDirettaForm = ref(false);

const listaArticolazioniLocal = [
  'Spalla',
  'Gomito',
  'Polso',
  'Cervicale / Collo',
  'Lombare / Schiena',
  'Anche / Bacino',
  'Ginocchio',
  'Caviglia',
  'Altro'
];

const apriGestioneFastidioPannello = (inf = null) => {
  vibraTattile(10);
  if (inf) {
    fastidioSelezionato.value = inf;
    formFastidioArticolazione.value = inf.articolazione_coinvolta || 'Spalla';
    formFastidioGravita.value = inf.gravita || 3;
    formFastidioPct.value = inf.percentuale_riduzione !== undefined ? inf.percentuale_riduzione : calcolaPercentualeConsigliata(inf.gravita || 3);
    formFastidioApplica.value = inf.applica_riduzione !== undefined ? inf.applica_riduzione : true;
    formFastidioNote.value = inf.note || '';
    mostraModificaDirettaForm.value = false;
  } else {
    fastidioSelezionato.value = null;
    formFastidioArticolazione.value = typeof ottieniArticolazioneSuggerita === 'function' ? ottieniArticolazioneSuggerita() : 'Spalla';
    formFastidioGravita.value = 3;
    formFastidioPct.value = calcolaPercentualeConsigliata(3);
    formFastidioApplica.value = true;
    formFastidioNote.value = '';
    mostraModificaDirettaForm.value = true;
  }
  dialogFastidio.value = true;
};

const apriSegnalazioneInfortunio = () => {
  apriGestioneFastidioPannello(null);
};

const onFormFastidioGravitaChange = (val) => {
  formFastidioPct.value = calcolaPercentualeConsigliata(val);
};

const inviaAFormModificaFastidio = () => {
  mostraModificaDirettaForm.value = true;
};

const salvaFastidioDaDettaglio = async () => {
  salvandoFastidio.value = true;
  vibraTattile(15);
  try {
    const payload = {
      articolazione_coinvolta: formFastidioArticolazione.value,
      gravita: formFastidioGravita.value,
      percentuale_riduzione: formFastidioPct.value,
      applica_riduzione: formFastidioApplica.value,
      note: formFastidioNote.value,
      esercizi_originari: workout.value?.des_esercizio ? [workout.value.des_esercizio] : []
    };
    if (fastidioSelezionato.value && fastidioSelezionato.value.id) {
      await aggiornaInfortunio(fastidioSelezionato.value.id, payload);
    } else {
      await segnalaInfortunio(payload);
    }
    dialogFastidio.value = false;
    ghostSbloccato.value = false;
  } catch (err) {
    console.error("Errore salvataggio fastidio:", err);
  } finally {
    salvandoFastidio.value = false;
  }
};

const risolviInfortunioEChiudi = async (id) => {
  vibraTattile(15);
  try {
    await risolviInfortunio(id);
    dialogFastidio.value = false;
  } catch (err) {
    console.error("Errore risoluzione infortunio:", err);
  }
};

const dialogConfermaEliminaDettaglio = ref(false);
const idFastidioDaEliminareDettaglio = ref(null);
const eliminandoFastidioDettaglio = ref(false);

const apriConfermaEliminaDettaglio = (id) => {
  idFastidioDaEliminareDettaglio.value = id;
  dialogConfermaEliminaDettaglio.value = true;
};

const confermaEliminaFastidioDaDettaglio = async () => {
  if (!idFastidioDaEliminareDettaglio.value) return;
  eliminandoFastidioDettaglio.value = true;
  vibraTattile(20);
  try {
    await eliminaInfortunio(idFastidioDaEliminareDettaglio.value);
    dialogConfermaEliminaDettaglio.value = false;
    dialogFastidio.value = false;
    idFastidioDaEliminareDettaglio.value = null;
  } catch (err) {
    console.error("Errore eliminazione fastidio da dettaglio:", err);
  } finally {
    eliminandoFastidioDettaglio.value = false;
  }
};

watch(workout, () => {
  ghostSbloccato.value = false;
});

const analisiRipetizioniCiclo = computed(() => {
  if (!workout.value || !previousWorkout.value) return null;
  
  const currentScheda = parseInt(workout.value.num_scheda);
  const prevScheda = parseInt(previousWorkout.value.num_scheda);
  
  if (isNaN(currentScheda) || isNaN(prevScheda)) return null;

  // Flag per indicare se è l'esatta scheda precedente (Continuità) o uno storico più remoto
  const isContinuitato = prevScheda === currentScheda - 1;

  // Estraiamo le reps di partenza (Week 1) per confrontare il target del blocco di lavoro
  const prevReps = parseInt(previousWorkout.value.reps_week1) || estraiRepsDaPrescrizione(previousWorkout.value.des_week1) || 0;
  const currReps = parseInt(workout.value.reps_week1) || estraiRepsDaPrescrizione(workout.value.des_week1) || 0;

  let trend, icon, color, testo;

  if (prevReps === 0 || currReps === 0) {
    trend = 'uguale'; 
    icon = 'mdi-minus'; 
    color = 'grey-lighten-1'; 
    testo = 'dinamiche variate (stesse reps)';
  } else if (currReps > prevReps) {
    trend = 'up'; 
    icon = 'mdi-arrow-up-bold'; 
    color = 'red-lighten-2'; 
    testo = `ripetizioni più alte (${prevReps} ➡️ ${currReps})`;
  } else if (currReps < prevReps) {
    trend = 'down'; 
    icon = 'mdi-arrow-down-bold'; 
    color = 'blue-lighten-2'; 
    testo = `ripetizioni più basse (${prevReps} ➡️ ${currReps})`;
  } else {
    trend = 'uguale'; 
    icon = 'mdi-minus'; 
    color = 'grey-lighten-1'; 
    testo = `le stesse ripetizioni (${currReps})`;
  }

  return { isContinuitato, trend, icon, color, testo };
});

const trendFreccia = computed(() => {
  if (!workout.value || !previousWorkout.value) return '';
  const prevReps = parseInt(previousWorkout.value.reps_week1) || estraiRepsDaPrescrizione(previousWorkout.value.des_week1) || 0;
  const currReps = parseInt(workout.value.reps_week1) || estraiRepsDaPrescrizione(workout.value.des_week1) || 0;
  if (prevReps === 0 || currReps === 0) return '';
  if (currReps > prevReps) return '▲';
  if (currReps < prevReps) return '▼';
  return '';
});

const getAtletaInfo = (wObj) => {
  if (!wObj) return { key: 'ID_cliente', id: '' };
  const key = Object.keys(wObj).find(k => k.includes('ID_cliente')) || 'ID_cliente';
  return { key, id: wObj[key] || '' };
};

const isCorpoLiberoEsercizio = (ex) => {
  if (!ex) return false;
  const name = String(ex.des_esercizio || '').toLowerCase();
  const note = String(ex.des_note_attrezzo || '').toLowerCase();
  const attr = String(ex.des_note_gen_attr || '').toLowerCase();
  const desNote = String(ex.des_note || '').toLowerCase();
  const settore = String(ex.des_settore || '').toLowerCase();
  const settorePrinc = String(ex.des_settore_princ || '').toLowerCase();

  // Se l'esercizio contiene esplicita indicazione di peso o zavorra, NON è corpo libero puro
  const weightKeywords = [
    'con peso', 'zavorra', 'zavorrat', 'con zavorra', 'weighted', 'con carico',
    'con manubrio', 'con manubri', 'con disco', 'con dischi', 'con bilanciere',
    'con kgb', 'con kb', 'con kettlebell', 'giubbotto zavorrato', 'sovraccarico',
    'con sovraccarico', 'con cavigliera', 'con cavigliere',
    'multipower', 'smith', 'macchina', 'machine', 'cavo', 'cavi', 'cable', 'pulley'
  ];
  const hasWeightKeyword = weightKeywords.some(k => name.includes(k) || note.includes(k) || attr.includes(k) || desNote.includes(k));
  if (hasWeightKeyword) return false;

  const keywords = [
    'corpo libero', 'corpolibero', 'corpo_libero', 'peso corporeo', 'bodyweight', 'senza attrezzi', 'nessun attrezzo',
    'trazioni', 'dip', 'piegamenti', 'push up', 'push-up', 'pushup', 
    'crunch', 'plank', 'side plank', 'sit up', 'sit-up', 'situp', 
    'addominali', 'addome', 'leg raise', 'knee raise', 'hyperextension', 'back extension', 'iperestensioni',
    'dragon', 'ab roll', 'ab-roll', 'rotella', 'ruota', 'rollout',
    'bridge', 'side bridge', 'glute bridge', 'abduzione', 'adduzione',
    'hollow', 'arch hold', 'superman', 'dead bug', 'bird dog',
    'v-up', 'v up', 'vup', 'toe touch', 'l-sit', 'l sit', 'lsit',
    'pino', 'handstand', 'verticale', 'mountain climber', 'burpee', 'skipping',
    'chin up', 'chin-up', 'chinup', 'pull up', 'pull-up', 'pullup', 'muscle up', 'muscle-up'
  ];
  
  const hasKeyword = keywords.some(k => name.includes(k) || note.includes(k) || attr.includes(k) || desNote.includes(k) || settore.includes(k) || settorePrinc.includes(k));
  if (hasKeyword) return true;

  if (note.includes('a terra') || note.includes('decubito') || note.includes('nessuno') || attr.includes('nessuno')) {
    return true;
  }

  return false;
};

const estraiSerieDaPrescrizione = (prescrizioneStr) => {
  if (!prescrizioneStr) return null;
  const part = String(prescrizioneStr).split('|')[0].trim();
  const cleanPart = part.replace(/\([^)]+\)/g, '').trim();
  
  const matchX = cleanPart.match(/^(\d+)\s*[xX]/);
  if (matchX) {
    return parseInt(matchX[1], 10);
  }
  return null;
};

const getPrescriptionReps = (ex, w) => {
  if (!ex) return null;
  const repsVal = ex['reps_week' + w];
  if (repsVal && !isNaN(parseInt(repsVal, 10))) {
    return parseInt(repsVal, 10);
  }
  return estraiRepsDaPrescrizione(ex['des_week' + w]);
};

const getPrescriptionSets = (ex, w) => {
  if (!ex) return null;
  return estraiSerieDaPrescrizione(ex['des_week' + w]);
};

const isVolumeProgressionOrCompensation = (ex, w) => {
  if (!ex || w < 2) return false;
  const repsCurr = getPrescriptionReps(ex, w);
  const repsPrev = getPrescriptionReps(ex, w - 1);
  const setsCurr = getPrescriptionSets(ex, w);
  const setsPrev = getPrescriptionSets(ex, w - 1);
  
  if (repsCurr === null || repsPrev === null) return false;
  
  if (repsCurr > repsPrev || (setsCurr !== null && setsPrev !== null && setsCurr > setsPrev)) {
    return true;
  }
  
  if (repsCurr < repsPrev && (setsCurr !== null && setsPrev !== null && setsCurr > setsPrev)) {
    return true;
  }
  
  return false;
};

const isCorpoLiberoOVolumeEsercizio = (ex) => {
  if (!ex) return false;
  if (isCorpoLiberoEsercizio(ex)) return true;
  
  for (let w = 2; w <= 6; w++) {
    if (isVolumeProgressionOrCompensation(ex, w)) {
      return true;
    }
  }
  return false;
};

const consenteProgressioneIntensita = (ex, targetWeek) => {
  if (!ex) return false;
  if (isCorpoLiberoOVolumeEsercizio(ex)) return false;
  if (targetWeek === 1) return true;
  
  const repsCurr = getPrescriptionReps(ex, targetWeek);
  const repsPrev = getPrescriptionReps(ex, targetWeek - 1);
  
  if (repsCurr === null || repsPrev === null) return false;
  if (repsCurr >= repsPrev) return false;
  
  const setsCurr = getPrescriptionSets(ex, targetWeek);
  const setsPrev = getPrescriptionSets(ex, targetWeek - 1);
  
  if (setsCurr !== null && setsPrev !== null && setsCurr > setsPrev) {
    return false;
  }
  
  return true;
};

const isOndaProgression = (ex) => {
  if (!ex) return false;
  
  const getReps = (w) => {
    if (ex['reps_week' + w]) {
      const val = parseInt(ex['reps_week' + w], 10);
      if (!isNaN(val)) return val;
    }
    const presc = ex['des_week' + w];
    if (presc) {
      const val = estraiRepsDaPrescrizione(presc);
      if (val !== null && !isNaN(val)) return val;
    }
    return 10; // default fallback
  };

  const repsW3 = getReps(3);
  const repsW4 = getReps(4);
  const repsW5 = getReps(5);

  return repsW4 > repsW3 && repsW5 < repsW4;
};

function isEsercizioEligibileW6(ex) {
  if (!ex || parseInt(ex.num_riga_giorno) === 0) return false;
  if (ex.flg_perc && (String(ex.flg_perc).includes('V%') || String(ex.flg_perc).includes('%V') || String(ex.flg_perc).includes('V_PERC'))) return false;
  if (isCorpoLiberoEsercizio(ex) && !isOndaProgression(ex)) return false;
  return true;
}

function estraiRepsEsercizioWeek(ex, w, fallbackReps = 10) {
  if (!ex) return fallbackReps > 0 ? fallbackReps : 10;
  
  // 1. Controlla campo reps_week specifico (se > 0)
  const rVal = ex['reps_week' + w];
  if (rVal && parseInt(rVal, 10) > 0) {
    return parseInt(rVal, 10);
  }
  
  // 2. Controlla prescrizione des_week specifico (se > 0)
  const pReps = estraiRepsDaPrescrizione(ex['des_week' + w]);
  if (pReps && pReps > 0) {
    return pReps;
  }
  
  // 3. Se la settimana è la 6 (es. AMRAP o test) o non ha reps esplicite, cerca a ritroso nelle altre settimane della stessa scheda (W5..W1)
  for (let pw = 5; pw >= 1; pw--) {
    const pwR = ex['reps_week' + pw];
    if (pwR && parseInt(pwR, 10) > 0) return parseInt(pwR, 10);
    const pwP = estraiRepsDaPrescrizione(ex['des_week' + pw]);
    if (pwP && pwP > 0) return pwP;
  }

  // 4. Se non c'è alcuna prescrizione nel mesociclo, fallback alle reps scritte dall'utente nella nota
  const insVal = ex['ins_week' + w];
  if (insVal) {
    const perf = estraiMigliorPrestazioneInput(insVal, fallbackReps);
    if (perf && perf.reps > 0) return perf.reps;
  }
  
  // 5. Fallback
  return fallbackReps > 0 ? fallbackReps : 10;
}

const isManubriEsercizio = (ex) => {
  if (!ex) return false;
  const name = String(ex.des_esercizio || '').toLowerCase();
  const noteAttr = String(ex.des_note_attrezzo || '').toLowerCase();
  const noteGen = String(ex.des_note_gen_attr || '').toLowerCase();
  const noteCoach = String(ex.des_note || '').toLowerCase();
  const insEsercizio = String(ex.ins_esercizio || '').toLowerCase();

  const keywords = ['manubr', 'dumbbel', 'db'];
  return keywords.some(k => 
    name.includes(k) || 
    noteAttr.includes(k) || 
    noteGen.includes(k) || 
    noteCoach.includes(k) || 
    insEsercizio.includes(k)
  );
};

const isCavoOMacchinaEsercizio = (ex) => {
  if (!ex) return false;
  const name = String(ex.des_esercizio || '').toLowerCase();
  const noteAttr = String(ex.des_note_attrezzo || '').toLowerCase();
  const noteGen = String(ex.des_note_gen_attr || '').toLowerCase();
  const noteCoach = String(ex.des_note || '').toLowerCase();
  const insEsercizio = String(ex.ins_esercizio || '').toLowerCase();

  const keywords = [
    'cavo', 'cavi', 'cable', 'pulley', 'ercolina', 
    'pushdown', 'push down', 'push-down', 
    'pulldown', 'pull down', 'pull-down', 
    'lat machine', 'macchina', 'leg extension', 'leg curl', 
    'pressa', 'guided', 'croci', 'croce ai cavi', 'alzate ai cavi', 
    'pectoral', 'chest press', 'shoulder press', 'hack squat'
  ];
  return keywords.some(k => 
    name.includes(k) || 
    noteAttr.includes(k) || 
    noteGen.includes(k) || 
    noteCoach.includes(k) || 
    insEsercizio.includes(k)
  );
};

// ✅ NUOVA LOGICA CON STEP 1,25 KG PER CAVI E PICCOLI CARICHI:
const getWeightStep = (isManubri, baseWeight) => {
  const p = parseFloat(baseWeight) || 0;

  // 1. Manubri (Step 1kg sotto i 10kg, Step 2kg sopra)
  if (isManubri) {
    return p >= 10 ? 2.0 : 1.0;
  }

  // 2. Cavi / Macchine / Isolamento piccoli muscoli
  const isCavo = workout.value ? isCavoOMacchinaEsercizio(workout.value) : false;
  if (isCavo || p < 15) {
    // Per carichi bassi o esercizi ai cavi usiamo micro-incrementi da 1,25 kg
    return 1.25;
  }

  // 3. Bilancieri e carichi grandi
  return 2.5;
};

const getDumbbellSequenceWeight = (currentWeight, direction) => {
  const w = Math.round(parseFloat(currentWeight)) || 0;
  if (direction === 'up') {
    if (w < 10) return w + 1;
    return Math.floor(w / 2) * 2 + 2;
  } else if (direction === 'down') {
    if (w <= 10) return Math.max(0, w - 1);
    if (w === 12) return 10;
    return Math.ceil((w - 2) / 2) * 2;
  }
  return w;
};

const arrotondaManubrioCommerciale = (peso) => {
  const p = parseFloat(peso) || 0;
  if (p <= 10) {
    return Math.round(p);
  } else {
    return Math.round(p / 2.0) * 2.0;
  }
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

const calcolaGiorniTrascorsi = (dateStr) => {
  if (!dateStr) return 0;
  try {
    const past = new Date(dateStr);
    if (isNaN(past.getTime())) return 0;
    const now = new Date();
    const pastClean = new Date(past.getFullYear(), past.getMonth(), past.getDate());
    const nowClean = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diffMs = nowClean.getTime() - pastClean.getTime();
    return diffMs > 0 ? Math.floor(diffMs / (1000 * 60 * 60 * 24)) : 0;
  } catch (e) {
    return 0;
  }
};

const getLivelloForzaIconInfo = (stelle) => {
  if (stelle <= 1) return { icon: 'mdi-sprout-outline', color: '#cd7f32' }; // Bronzo / Germoglio
  if (stelle === 2) return { icon: 'mdi-medal-outline', color: '#b4b4b4' };  // Argento
  if (stelle === 3) return { icon: 'mdi-medal', color: '#ffd700' };         // Oro
  if (stelle === 4) return { icon: 'mdi-trophy-outline', color: '#f97316' };  // Avanzato
  return { icon: 'mdi-trophy', color: '#a855f7' };                         // Elite
};

const estraiRIRDaPrescrizione = (text) => {
  if (!text) return null;
  const clean = String(text).toLowerCase();
  
  // Cerca pattern tipo "rir 2", "rir2", "rir: 2", "rir=2" o "rir @ 2"
  const matchRIR = clean.match(/rir\s*[:=\s@]?\s*([0-4](?:\.\d+)?)/i);
  if (matchRIR) {
    const val = parseFloat(matchRIR[1]);
    if (!isNaN(val)) return val;
  }
  
  // Se c'è scritto "cedimento", "buffer 0" o "rir 0"
  if (clean.includes('cedimento') || clean.includes('ced.') || clean.includes('buffer 0')) {
    return 0;
  }
  
  return null;
};

const getRIRDefault = (week) => {
  if (week === 1) return 2;     // Week 1 molto leggera, lontana da cedimento
  if (week === 2) return 1.5;   // Week 2 leggermente più pesante
  if (week === 3) return 0.5;   // Week 3 pesante a cedimento almeno all'ultima serie
  if (week === 4) return 3.5;   // Week 4 scarico attivo (molto leggera)
  if (week === 5) return 0;     // Week 5 cedimento ricercato
  if (week === 6) return 0;     // Week 6 cedimento totale o intensificazione
  return 0;
};

const proponiProgressioneCaricoRIR = (targetWeek, baseWeekNum, baseInsText) => {
  if (!baseInsText || !workout.value) return null;
  const pesoStr = estraiPesoDaInput(baseInsText);
  if (!pesoStr) return null;
  const pesoBase = parseFloat(pesoStr);
  if (isNaN(pesoBase) || pesoBase <= 0) return null;
  
  if (!consenteProgressioneIntensita(workout.value, targetWeek)) {
    return pesoBase;
  }
  
  const noteBase = inputSettimane.value[baseWeekNum]?.not || '';
  const faticaBase = inputSettimane.value[baseWeekNum]?.fatica || '';
  if (isInputIndicaLimiteOStallo(baseInsText, noteBase, faticaBase)) {
    return pesoBase;
  }
  
  let repsBase = estraiRepsDaInput(baseInsText);
  if (repsBase === null || isNaN(repsBase) || repsBase <= 0) {
    repsBase = workout.value['reps_week' + baseWeekNum] ? parseInt(workout.value['reps_week' + baseWeekNum], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWeekNum]) || 10);
  }
  const repsTarget = workout.value['reps_week' + targetWeek] ? parseInt(workout.value['reps_week' + targetWeek], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + targetWeek]) || 10);
  
  // Estrai RIR della settimana base
  const rirBaseStr = estraiRIRDaPrescrizione(workout.value['des_week' + baseWeekNum]);
  const rirBase = rirBaseStr !== null ? rirBaseStr : getRIRDefault(baseWeekNum);
  
  // Estrai RIR della settimana target
  const rirTargetStr = estraiRIRDaPrescrizione(workout.value['des_week' + targetWeek]);
  const rirTarget = rirTargetStr !== null ? rirTargetStr : getRIRDefault(targetWeek);
  
  // 1. Modello Fisso
  const estimated1RM_fisso = pesoBase * (1 + (repsBase + rirBase) / 30);
  const pesoFisso = estimated1RM_fisso / (1 + (repsTarget + rirTarget) / 30);
  
  // 2. Modello Dinamico
  const pctIncremento = calcolaIncrementoDinamicoMedio(targetWeek);
  const fattoreBase = 1 + (repsBase + rirBase) / 30;
  const fattoreTarget = 1 + (repsTarget + rirTarget) / 30;
  const pesoDinamico = pesoBase * (1 + pctIncremento) * (fattoreBase / fattoreTarget);
  
  let proposedWeight;
  
  // Calcolo del Mix Ratio per Ibrido Autoregolato
  let ratioDinamico = 0.5; // Default 50-50 per ibrido
  const repsTargetPrescritteBase = workout.value['reps_week' + baseWeekNum] ? parseInt(workout.value['reps_week' + baseWeekNum], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWeekNum]) || 10);
  
  if (ghostAutoregolazioneRepsAttiva.value && repsBase !== repsTargetPrescritteBase) {
    if (repsBase > repsTargetPrescritteBase) {
      ratioDinamico = 0.8; // Esubero reps: spinge sul dinamico
    } else {
      ratioDinamico = 0.2; // Sotto-target reps: frena sul fisso
    }
  }
  
  if (modalitaIncrementoGhost.value === 'ibrida') {
    proposedWeight = (ratioDinamico * pesoDinamico) + ((1 - ratioDinamico) * pesoFisso);
  } else if (modalitaIncrementoGhost.value === 'dinamica') {
    proposedWeight = pesoDinamico;
  } else {
    proposedWeight = pesoFisso;
  }
  
  // Modulazione sul Buffer Reale (Moltiplicatori addizionali in base all'esubero/sotto-target)
  if (ghostAutoregolazioneRepsAttiva.value && repsBase !== repsTargetPrescritteBase) {
    if (repsBase > repsTargetPrescritteBase) {
      const diffReps = repsBase - repsTargetPrescritteBase;
      const boostFactor = 1 + (diffReps * 0.015); // +1.5% per rep in più del target prescritto
      proposedWeight = pesoBase + (proposedWeight - pesoBase) * boostFactor;
    } else {
      const diffReps = repsTargetPrescritteBase - repsBase;
      const penaltyFactor = Math.max(0, 1 - (diffReps * 0.2)); // -20% dell'incremento per rep in meno
      proposedWeight = pesoBase + (proposedWeight - pesoBase) * penaltyFactor;
      if (proposedWeight > pesoBase) {
        proposedWeight = pesoBase; // Non aumentare se le reps reali sono inferiori al target
      }
    }
  }
  
  // Limita il peso solo se è a corpo libero SENZA peso e le reps salgono
  if (isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value && repsTarget > repsBase) {
    if (proposedWeight > pesoBase) {
      proposedWeight = pesoBase;
    }
  }
  
  const isManubri = isManubriEsercizio(workout.value);
  const step = getWeightStep(isManubri, pesoBase);
  
  // Arrotondamento standard a 1.25kg (o 1.0kg per manubri)
  proposedWeight = Math.round(proposedWeight / step) * step;
  
  // Gestione Attacco al Record Storico
  if (ghostPRAttackAttivo.value) {
    const recordVal = ottieniRecordStoricoPerReps(repsTarget);
    if (recordVal && recordVal > 0) {
      if (proposedWeight < recordVal && (proposedWeight >= recordVal * 0.95 || proposedWeight >= recordVal - 2.5)) {
        proposedWeight = Math.round((recordVal + step) / step) * step;
      }
    }
  }
  
  if (isManubri) {
    proposedWeight = arrotondaManubrioCommerciale(proposedWeight);
  }
  
  return proposedWeight;
};

const getNSCAPercentage = (reps) => {
  const r = Math.max(1, Math.min(30, Math.round(reps)));
  const table = {
    1: 1.00, 2: 0.95, 3: 0.93, 4: 0.90, 5: 0.87,
    6: 0.85, 7: 0.83, 8: 0.80, 9: 0.77, 10: 0.75,
    11: 0.73, 12: 0.70, 13: 0.683, 14: 0.667, 15: 0.65,
    16: 0.633, 17: 0.617, 18: 0.60, 19: 0.58, 20: 0.56,
    21: 0.54, 22: 0.52, 23: 0.50, 24: 0.48, 25: 0.46,
    26: 0.44, 27: 0.42, 28: 0.40, 29: 0.38, 30: 0.36
  };
  return table[r] || 0.35;
};

const calcolaPropostaCaricoDinamico = (baseWeight, baseReps, baseRIR, currW1Reps, fatica, giorniTrascorsi) => {
  const wBase = parseFloat(String(baseWeight).replace(',', '.'));
  if (isNaN(wBase) || wBase <= 0) return null;
  
  const rBase = baseReps ? parseInt(baseReps, 10) : 10;
  const r1 = currW1Reps ? parseInt(currW1Reps, 10) : 10;
  const rirBase = baseRIR !== null ? baseRIR : 0;
  
  // Determinazione del passo di arrotondamento (1.0 per manubri, 1.25 per bilancieri)
  const isManubri = workout.value ? isManubriEsercizio(workout.value) : false;
  const step = isManubri ? 1.0 : 1.25;

  // FASE 1: Stima 1RM
  const repsBaseTotali = rBase + rirBase;
  let estimated1RM;
  if (repsBaseTotali <= 10) {
    // Epley per <= 10 reps
    estimated1RM = wBase * (1 + repsBaseTotali / 30);
  } else {
    // NSCA per > 10 reps
    estimated1RM = wBase / getNSCAPercentage(repsBaseTotali);
  }

  // Riduzione prudenziale in base al tempo passato (dinamica da Pannello Coach)
  let dateFactor = 1.0;
  const s1 = deallenamentoSoglia1Global.value !== undefined ? deallenamentoSoglia1Global.value : 30;
  const s2 = deallenamentoSoglia2Global.value !== undefined ? deallenamentoSoglia2Global.value : 90;
  const s3 = deallenamentoSoglia3Global.value !== undefined ? deallenamentoSoglia3Global.value : 180;
  const s4 = deallenamentoSoglia4Global.value !== undefined ? deallenamentoSoglia4Global.value : 365;

  const p1 = deallenamentoPct1Global.value !== undefined ? deallenamentoPct1Global.value : 1.0;
  const p2 = deallenamentoPct2Global.value !== undefined ? deallenamentoPct2Global.value : 3.0;
  const p3 = deallenamentoPct3Global.value !== undefined ? deallenamentoPct3Global.value : 10.0;
  const p4 = deallenamentoPct4Global.value !== undefined ? deallenamentoPct4Global.value : 25.0;

  if (giorniTrascorsi > s4) {
    dateFactor = 1.0 - (p4 / 100);
  } else if (giorniTrascorsi > s3) {
    dateFactor = 1.0 - (p3 / 100);
  } else if (giorniTrascorsi > s2) {
    dateFactor = 1.0 - (p2 / 100);
  } else if (giorniTrascorsi > s1) {
    dateFactor = 1.0 - (p1 / 100);
  }

  // Helper per calcolare e arrotondare il peso per un certo RIR target
  const calcolaPesoConRIR = (rirVal) => {
    const repsW1Totali = r1 + rirVal;
    let weightCalc;
    if (repsW1Totali <= 10) {
      // Epley per <= 10 reps
      weightCalc = estimated1RM / (1 + repsW1Totali / 30);
    } else {
      // NSCA per > 10 reps
      weightCalc = estimated1RM * getNSCAPercentage(repsW1Totali);
    }
    weightCalc = weightCalc * dateFactor;

    // A. Penalizzazione per Sbalzo di Ripetizioni (Reps Gap Penalty)
    let repsGapFactor = 1.0;
    const repsDiff = r1 - rBase;
    
    // Rilevamento instabilità esercizio (cavo, manubri, elastico)
    const isInstabile = /cavo|manubri|elastico/i.test(workout.value?.des_esercizio || '');
    const repsGapRate = 0.02; // Standard 2% per rep di sbalzo
    const isolationRate = 0.80; // Standard 20% per isolamento
    const maxPenaltyPct = isInstabile
      ? (penalitaMaxInstabiliPctGlobal.value !== undefined ? penalitaMaxInstabiliPctGlobal.value : 64.0)
      : (penalitaMaxStabiliPctGlobal.value !== undefined ? penalitaMaxStabiliPctGlobal.value : 14.0);

    if (repsDiff > 4) {
      const excessReps = repsDiff - 4;
      repsGapFactor = Math.max(0.5, 1.0 - (excessReps * repsGapRate));
    }

    // B. Dampener per Esercizi di Isolamento / Cavi ad alte reps
    let isolationFactor = 1.0;
    const isCavoOAlzate = /cavo|alzate|alzata|croci|curl|estensioni|pushdown|kickback|fly|lateral/i.test(workout.value?.des_esercizio || '');
    const isIsolamento = ['Spalle', 'Bicipiti', 'Tricipiti', 'Polpacci'].includes(workout.value?.des_settore || '') || isCavoOAlzate;
    if (isIsolamento && r1 > 12) {
      isolationFactor = isolationRate;
    }

    // Cap combined penalty dynamically based on exercise stability
    const capFactor = 1.0 - (maxPenaltyPct / 100);
    const combinedPenaltyFactor = Math.max(capFactor, repsGapFactor * isolationFactor);
    weightCalc = weightCalc * combinedPenaltyFactor;
    
    if (isManubri) {
      if (weightCalc <= 10.0) {
        return Math.round(weightCalc);
      } else {
        return Math.round(weightCalc / 2.0) * 2.0;
      }
    } else {
      return Math.round(weightCalc / step) * step;
    }
  };

  // Determina i 3 RIR target teorici per i 3 livelli di fatica
  let rirW1Base = estraiRIRDaPrescrizione(workout.value?.des_week1) !== null ? estraiRIRDaPrescrizione(workout.value?.des_week1) : 2;
  
  let rirMedia, rirPesante, rirDevastante;
  if (r1 <= rBase) {
    rirMedia = 1.25;
    rirPesante = 2.25;
    rirDevastante = 3.25;
  } else {
    rirMedia = rirW1Base;
    rirPesante = rirW1Base + 0.5;
    rirDevastante = rirW1Base + 1.0;
  }

  // Calcola i 3 pesi teorici arrotondati
  let pesoMedia = calcolaPesoConRIR(rirMedia);
  let pesoPesante = calcolaPesoConRIR(rirPesante);
  let pesoDevastante = calcolaPesoConRIR(rirDevastante);

  // Applica la regola di decremento minimo garantito (Opzione 1)
  if (pesoPesante >= pesoMedia && pesoMedia > 0) {
    pesoPesante = Math.max(0, pesoMedia - step);
  }
  if (pesoDevastante >= pesoPesante && pesoPesante > 0) {
    pesoDevastante = Math.max(0, pesoPesante - step);
  } else if (pesoDevastante >= pesoMedia && pesoMedia > 0) {
    pesoDevastante = Math.max(0, pesoMedia - (2 * step));
  }

  if (isManubri) {
    pesoMedia = arrotondaManubrioCommerciale(pesoMedia);
    pesoPesante = arrotondaManubrioCommerciale(pesoPesante);
    pesoDevastante = arrotondaManubrioCommerciale(pesoDevastante);
  }

  // Restituisce il peso specifico richiesto in base alla fatica dell'esercizio
  const faticaLower = (fatica || '').toLowerCase().trim();
  if (faticaLower.includes('pesante') || faticaLower === '4') {
    return pesoPesante;
  } else if (faticaLower.includes('devastante') || faticaLower === '5') {
    return pesoDevastante;
  } else {
    return pesoMedia;
  }
};

const propostaWeek1 = computed(() => {
  if (!previousWorkout.value || !workout.value) return null;
  
  let basePeso = null;
  let baseReps = null;
  let baseRIR = null;
  let fatica = '';
  let baseWeekNum = null;
  
  const isRepEx = isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value;
  
  // 1. Controlla prima la Week 6 (Miglior Carico num_ins6)
  const prevW6Weight = previousWorkout.value.num_ins6;
  if (prevW6Weight && !isNaN(parseFloat(String(prevW6Weight).replace(',', '.')))) {
    const w6Val = parseFloat(String(prevW6Weight).replace(',', '.'));
    const w6InsText = previousWorkout.value.ins_week6 || '';
    const haPesoEsplicito = /kg|lbs|libbre|\+/i.test(w6InsText);
    
    basePeso = isRepEx && !haPesoEsplicito ? 0 : w6Val;
    baseReps = parseInt(previousWorkout.value.reps_week6) || estraiRepsDaPrescrizione(previousWorkout.value.des_week6) || 10;
    baseRIR = estraiRIRDaPrescrizione(previousWorkout.value.des_week6) !== null ? estraiRIRDaPrescrizione(previousWorkout.value.des_week6) : 0;
    fatica = previousWorkout.value.num_faticaw6 || '';
    baseWeekNum = 6;
  } else {
    // 2. Cerca a ritroso dalle W5 alle W1
    for (let w = 5; w >= 1; w--) {
      const val = previousWorkout.value['ins_week' + w];
      if (val && String(val).trim() !== '' && String(val).trim() !== '-') {
        const pesoStr = estraiPesoDaInput(val);
        const haPesoEsplicito = /kg|lbs|libbre|\+/i.test(val);
        
        if (pesoStr && (!isRepEx || haPesoEsplicito)) {
          basePeso = parseFloat(pesoStr);
          baseReps = parseInt(previousWorkout.value['reps_week' + w]) || estraiRepsDaPrescrizione(previousWorkout.value['des_week' + w]) || 10;
          baseRIR = estraiRIRDaPrescrizione(previousWorkout.value['des_week' + w]) !== null ? estraiRIRDaPrescrizione(previousWorkout.value['des_week' + w]) : getRIRDefault(w);
          baseWeekNum = w;
          break;
        } else if (isRepEx) {
          basePeso = 0;
          baseReps = estraiRepsDaInput(val) || parseInt(previousWorkout.value['reps_week' + w]) || estraiRepsDaPrescrizione(previousWorkout.value['des_week' + w]) || 10;
          baseRIR = estraiRIRDaPrescrizione(previousWorkout.value['des_week' + w]) !== null ? estraiRIRDaPrescrizione(previousWorkout.value['des_week' + w]) : getRIRDefault(w);
          baseWeekNum = w;
          break;
        }
      }
    }
  }

  // Se è a corpo libero e non abbiamo trovato inserimenti ma la scheda precedente esiste
  if (isRepEx && baseWeekNum === null) {
    for (let w = 6; w >= 1; w--) {
      const val = previousWorkout.value['ins_week' + w];
      if (val && String(val).trim() !== '' && String(val).trim() !== '-') {
        basePeso = 0;
        baseReps = estraiRepsDaInput(val) || parseInt(previousWorkout.value['reps_week' + w]) || estraiRepsDaPrescrizione(previousWorkout.value['des_week' + w]) || 10;
        baseRIR = estraiRIRDaPrescrizione(previousWorkout.value['des_week' + w]) !== null ? estraiRIRDaPrescrizione(previousWorkout.value['des_week' + w]) : getRIRDefault(w);
        baseWeekNum = w;
        break;
      }
    }
  }
  
  // Se non troviamo carichi compilati in nessuna settimana
  if (!isRepEx && (basePeso === null || isNaN(basePeso) || basePeso <= 0)) {
    return { erroreCarichi: true };
  }
  if (isRepEx && baseWeekNum === null) {
    return { erroreCarichi: true };
  }
  
  const currW1Reps = parseInt(workout.value.reps_week1) || estraiRepsDaPrescrizione(workout.value.des_week1) || 10;
  const dataUltimaEx = getExecutionDate(previousWorkout.value, storicoEsercizio.value, workout.value);
  const giorniTrascorsi = calcolaGiorniTrascorsi(dataUltimaEx);
  
  let proposta = calcolaPropostaCaricoDinamico(basePeso, baseReps, baseRIR, currW1Reps, fatica, giorniTrascorsi);
  if (proposta === null) return null;

  // Limita il peso se a corpo libero e le reps salgono rispetto a settimana precedente, o se è a corpo libero / volume
  if (isCorpoLiberoOVolumeEsercizio(workout.value)) {
    if (proposta > basePeso) {
      proposta = basePeso;
    }
  } else if (isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value && currW1Reps && baseReps && currW1Reps > baseReps) {
    if (proposta > basePeso) {
      proposta = basePeso;
    }
  }

  // Calcola il RIR target effettivo usato per visualizzarlo nel dettaglio della proposta
  let rirW1 = estraiRIRDaPrescrizione(workout.value?.des_week1) !== null ? estraiRIRDaPrescrizione(workout.value?.des_week1) : 2;
  const faticaLower = (fatica || '').toLowerCase().trim();
  const isMediaOLeggera = !faticaLower || faticaLower.includes('legger') || faticaLower.includes('medi') || faticaLower === 'nessuna' || faticaLower === 'non specificata' || faticaLower === '1' || faticaLower === '2' || faticaLower === '3';
  if (currW1Reps <= baseReps) {
    if (isMediaOLeggera) {
      rirW1 = 1.25;
    } else if (faticaLower.includes('pesante') || faticaLower === '4') {
      rirW1 = 1.75;
    } else if (faticaLower.includes('devastante') || faticaLower === '5') {
      rirW1 = 2.25;
    }
  } else {
    if (faticaLower.includes('pesante') || faticaLower === '4') {
      rirW1 += 0.5;
    } else if (faticaLower.includes('devastante') || faticaLower === '5') {
      rirW1 += 1.0;
    }
  }

  const isManubri = isManubriEsercizio(workout.value);
  const step = isManubri ? 1.0 : 1.25;
  const defaultPeso = proposta || 0;
  
  const recordVal = sfidaRecordWeek1.value ? ottieniRecordStoricoPerReps(currW1Reps) : null;
  
  let min = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'down') : Math.round((defaultPeso * 0.95) / step) * step;
  let medio = defaultPeso;
  let max = 0;
  
  if (min === medio && defaultPeso - step > 0) {
    min = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'down') : defaultPeso - step;
  }
  
  let hasRecord = false;
  let sfidanteLabel = 'Sfidante';
  
  if (recordVal && recordVal > 0) {
    hasRecord = true;
    if (recordVal >= defaultPeso) {
      if (recordVal <= defaultPeso * 1.25) {
        max = isManubri ? getDumbbellSequenceWeight(recordVal, 'up') : Math.round((recordVal + step) / step) * step;
      } else {
        max = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'up') : Math.round((defaultPeso * 1.10) / step) * step;
      }
    } else {
      max = isManubri ? getDumbbellSequenceWeight(medio, 'up') : medio + step;
    }
    
    if (max === medio) {
      max = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'up') : defaultPeso + step;
    }
    
    const isBeatingRecord = max > recordVal;
    const isEqualingRecord = max === recordVal;
    if (isBeatingRecord) {
      sfidanteLabel = `🏆 Supera Record (${formatWeight(recordVal)}kg)`;
    } else if (isEqualingRecord) {
      sfidanteLabel = `🏆 Eguaglia Record (${formatWeight(recordVal)}kg)`;
    } else {
      sfidanteLabel = `Sfidante (Record: ${formatWeight(recordVal)}kg)`;
    }
  } else {
    max = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'up') : Math.round((defaultPeso * 1.05) / step) * step;
    if (max === medio) {
      max = isManubri ? getDumbbellSequenceWeight(defaultPeso, 'up') : defaultPeso + step;
    }
  }

  let finalProposta = proposta;
  let finalBasePeso = basePeso;
  let finalMin = min;
  let finalMedio = medio;
  let finalMax = max;

  if (isManubri) {
    finalProposta = arrotondaManubrioCommerciale(finalProposta);
    finalBasePeso = arrotondaManubrioCommerciale(finalBasePeso);
    finalMin = arrotondaManubrioCommerciale(finalMin);
    finalMedio = arrotondaManubrioCommerciale(finalMedio);
    finalMax = arrotondaManubrioCommerciale(finalMax);
  }

  return {
    peso: finalProposta,
    prevPeso: finalBasePeso,
    prevReps: baseReps,
    currReps: currW1Reps,
    fatica: fatica || 'Nessuna',
    giorniTrascorsi,
    settimanaBase: baseWeekNum,
    stimaMenoAccurata: baseWeekNum < 6,
    rirTarget: rirW1,
    recordVal: recordVal,
    hasRecord: hasRecord,
    pesoPrudenziale: finalMin,
    pesoConsigliato: finalMedio,
    pesoSfidante: finalMax,
    sfidanteLabel: sfidanteLabel,
    sfidaRecordWeek1: sfidaRecordWeek1.value
  };
});

const haPesoEsplicitoInInput = (str) => {
  if (!str) return false;
  const s = String(str).trim();
  if (!s || s === '-') return false;
  
  // Riconosce indicativo esplicito di peso: kg, kgb, lbs, libbre, zavorra, sovraccarico, +, con X kg
  if (/kg|kgs|kgb|lbs|libbre|zavorr|sovraccarico|\+|\bcon\s+\d+/i.test(s)) {
    return true;
  }
  
  return false;
};

const haPesoEsercizio = computed(() => {
  if (!workout.value) return false;
  
  // 1. Se staticamente NON è corpo libero (es. Panca, Lat Machine, Squat), ha sempre peso
  if (!isCorpoLiberoEsercizio(workout.value)) {
    return true;
  }
  
  // 2. Se è un esercizio a corpo libero, controlla se l'utente ha inserito peso esplicito in una qualsiasi delle settimane (W1..W6)
  for (let w = 1; w <= 6; w++) {
    const insVal = inputSettimane.value?.[w]?.ins || workout.value?.['ins_week' + w];
    if (insVal && haPesoEsplicitoInInput(insVal)) {
      return true;
    }
  }
  
  // 3. Controlla se nel mesociclo precedente o nella proposta W1 c'era peso esplicito
  if (propostaWeek1.value && propostaWeek1.value.prevPeso && propostaWeek1.value.prevPeso > 0) {
    if (previousWorkout.value) {
      const prevW6Text = previousWorkout.value.num_ins6 || previousWorkout.value.ins_week6;
      if (prevW6Text && haPesoEsplicitoInInput(prevW6Text)) {
        return true;
      }
      for (let w = 1; w <= 6; w++) {
        if (haPesoEsplicitoInInput(previousWorkout.value['ins_week' + w])) {
          return true;
        }
      }
    }
  }
  
  return false;
});

const applicaEsercizioPrecedenteSincrono = (wObj) => {
  if (!wObj) return false;
  const { key: keyIdCliente, id: atletaId } = getAtletaInfo(wObj);
  const currentNumScheda = parseInt(wObj.num_scheda);
  const desEsercizio = String(wObj.des_esercizio || '').trim().toLowerCase();
  
  if (!atletaId || isNaN(currentNumScheda) || !desEsercizio) return false;

  let bestPrev = null;
  if (globalStoryboard.value && globalStoryboard.value.length > 0) {
    globalStoryboard.value.forEach(d => {
      const dAtletaId = d[keyIdCliente] || d['ID_cliente'] || '';
      if (String(dAtletaId) === String(atletaId) && String(d.des_esercizio || '').trim().toLowerCase() === desEsercizio) {
        const sNum = parseInt(d.num_scheda);
        if (sNum < currentNumScheda && (parseInt(d.num_riga_giorno) > 0 || !d.num_riga_giorno)) {
          if (!bestPrev || sNum > parseInt(bestPrev.num_scheda)) {
            const itemId = d.id || d.num_riga;
            bestPrev = { ...d, id: itemId };
          }
        }
      }
    });
  }

  if (bestPrev) {
    previousWorkout.value = applicaModificheLocali(bestPrev);
    for (let w = 1; w <= 6; w++) {
      inputSettimanePrecedente.value[w].ins = previousWorkout.value['ins_week' + w] || '';
      inputSettimanePrecedente.value[w].reps = previousWorkout.value['reps_week' + w] || '';
    }
    numIns6ValPrecedente.value = previousWorkout.value.num_ins6 || '';
    numFaticaw6ValPrecedente.value = previousWorkout.value.num_faticaw6 || '';
    return true;
  }
  return false;
};

const caricaEsercizioPrecedente = async () => {
  if (!workout.value) return;
  
  const { key: keyIdCliente, id: atletaId } = getAtletaInfo(workout.value);
  const currentNumScheda = workout.value.num_scheda;
  const desEsercizio = workout.value.des_esercizio;
  
  if (!atletaId || !currentNumScheda || !desEsercizio) return;
  
  try {
    const currentSchedaNum = parseInt(currentNumScheda);
    if (isNaN(currentSchedaNum)) return;

    // Se già trovato e applicato sincronicamente, evitiamo query se non necessario
    if (previousWorkout.value && String(previousWorkout.value.des_esercizio || '').trim().toLowerCase() === String(desEsercizio).trim().toLowerCase()) {
      return;
    }
    
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
          const itemId = doc.id || d.id || d.num_riga;
          bestPrev = { ...d, id: itemId };
        }
      }
    });
    
    if (bestPrev) {
      previousWorkout.value = applicaModificheLocali(bestPrev);
    } else {
      const allData = await getStoryboardBackup();
      const matched = allData.filter(b => {
        const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
        return String(bAtletaId) === String(atletaId) &&
               String(b.des_esercizio).trim() === String(desEsercizio).trim() &&
               parseInt(b.num_scheda) < currentSchedaNum;
      });
      if (matched.length > 0) {
        matched.sort((a, b) => parseInt(b.num_scheda) - parseInt(a.num_scheda));
        const item = matched[0];
        if (!item.id && item.num_riga) item.id = String(item.num_riga);
        previousWorkout.value = applicaModificheLocali(item);
      }
    }

    if (previousWorkout.value) {
      for (let w = 1; w <= 6; w++) {
        inputSettimanePrecedente.value[w].ins = previousWorkout.value['ins_week' + w] || '';
        inputSettimanePrecedente.value[w].reps = previousWorkout.value['reps_week' + w] || '';
      }
      numIns6ValPrecedente.value = previousWorkout.value.num_ins6 || '';
      numFaticaw6ValPrecedente.value = previousWorkout.value.num_faticaw6 || '';
    }
  } catch (error) {
    console.error("Errore caricamento esercizio precedente:", error);
  }
};


const stileStorico = ref('tabella');
const modalitaSettimane = ref('dinamica');
const posizionamentoSuperset = ref('auto');

// Computed per decidere il posizionamento reale del box superset
const renderSupersetPosizione = computed(() => {
  if (posizionamentoSuperset.value === 'sotto_week') return 'sotto_week';
  if (posizionamentoSuperset.value === 'dentro_week') return 'dentro_week';
  
  // Se è 'auto' (default), decidiamo in base al recupero:
  // Se c'è recupero -> staccato (sotto_week)
  // Se non c'è recupero -> attaccato (dentro_week)
  if (workout.value && workout.value.des_rec_report) {
    return 'sotto_week';
  }
  return 'dentro_week';
});

const currentAtletaId = computed(() => {
  if (!workout.value) return '';
  const key = Object.keys(workout.value).find(k => k.includes('ID_cliente')) || 'ID_cliente';
  return String(workout.value[key] || '').trim();
});

watch(stileStorico, (nuovoValore) => {
  vibraTattile(8);
  const atletaId = currentAtletaId.value;
  if (atletaId) {
    localStorage.setItem('stileStorico_' + atletaId, nuovoValore);
  }
});

watch(modalitaSettimane, (nuovoValore) => {
  vibraTattile(8);
  const atletaId = currentAtletaId.value;
  if (atletaId) {
    localStorage.setItem('modalitaSettimane_' + atletaId, nuovoValore);
  }
});

watch(posizionamentoSuperset, (nuovoValore) => {
  vibraTattile(8);
  const atletaId = currentAtletaId.value;
  if (atletaId) {
    localStorage.setItem('posizionamentoSuperset_' + atletaId, nuovoValore);
  }
});

const getRepsForWeek = (w, targetEx = null) => {
  const ex = targetEx || workout.value;
  if (!ex) return null;
  const reps = estraiRepsEsercizioWeek(ex, w, null);
  return (reps && reps > 0) ? reps : null;
};

const isWeek4Scarico = computed(() => {
  const repsW4 = getRepsForWeek(4);
  const repsW3 = getRepsForWeek(3);
  return repsW4 && repsW3 && repsW4 > repsW3;
});

const getPesoWeek2 = computed(() => {
  if (!workout.value) return '';
  return workout.value.ins_week2 || '';
});

const targetRepsRange = computed(() => {
  if (!workout.value) return null;
  const wActive = settimanaAttiva.value;
  return getRepsPerWeek(wActive);
});


const isMatchingReps = (prevEx, w) => {
  const target = targetRepsRange.value;
  if (!target) return false;
  
  const reps = estraiRepsEsercizioWeek(prevEx, w, target);
  return reps === target;
};

const getExecutionDate = (prevEx, list, currWorkout) => {
  if (!prevEx) return null;
  const sNum = parseInt(prevEx.num_scheda);
  if (isNaN(sNum)) return prevEx.dat_scheda_ult_ex || prevEx.timestamp;

  const nextEx = (list || []).find(ex => parseInt(ex.num_scheda) > sNum);
  if (nextEx) {
    return nextEx.dat_scheda_ult_ex || nextEx.timestamp;
  }

  if (currWorkout && parseInt(currWorkout.num_scheda) > sNum) {
    return currWorkout.dat_scheda_ult_ex || currWorkout.timestamp;
  }

  return prevEx.dat_scheda_ult_ex || prevEx.timestamp;
};

const parseSmartDate = (dateStr) => {
  if (!dateStr) return null;
  const cleanStr = String(dateStr).trim();
  if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
    const parts = cleanStr.substring(0, 10).split('-');
    return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
  } else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(cleanStr)) {
    const parts = cleanStr.split(' ')[0].split('/');
    return new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
  } else {
    const t = Date.parse(cleanStr);
    return !isNaN(t) ? new Date(t) : null;
  }
};

const formattaDataStorico = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = parseSmartDate(dateStr);
    if (!d || isNaN(d.getTime())) return dateStr;
    const months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
    const day = d.getDate();
    const month = months[d.getMonth()];
    const year = String(d.getFullYear()).slice(-2);
    return `${day} ${month} ${year}`;
  } catch (e) {
    return dateStr;
  }
};

const tempoTrascorso = (dateStr) => {
  if (!dateStr) return '';
  try {
    const past = parseSmartDate(dateStr);
    if (!past || isNaN(past.getTime())) return '';
    const now = new Date();
    
    // Resettiamo le ore per calcolare la differenza in giorni puri
    const pastClean = new Date(past.getFullYear(), past.getMonth(), past.getDate());
    const nowClean = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    
    const diffMs = nowClean.getTime() - pastClean.getTime();
    if (diffMs < 0) return '';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'oggi';
    if (diffDays === 1) return 'ieri';
    if (diffDays < 7) return `${diffDays}g fa`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks}sett fa`;
    
    const diffMonths = Math.round(diffDays / 30.43);
    if (diffMonths < 12) return `${diffMonths}m fa`;
    
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    if (remainingMonths === 0) {
      return `${years}a fa`;
    } else {
      return `${years}a e ${remainingMonths}m fa`;
    }
  } catch (e) {
    return '';
  }
};

const getTitoloFontSize = (nomeEsercizio) => {
  const nome = String(nomeEsercizio || '').trim();
  const len = nome.length;
  const layout = layoutCorrente.value;
  
  if (len > 45) {
    return layout === 'super_compatto' ? '0.70rem' : (layout === 'compatto' ? '0.78rem' : '0.85rem');
  }
  if (len > 25) {
    return layout === 'super_compatto' ? '0.78rem' : (layout === 'compatto' ? '0.88rem' : '0.95rem');
  }
  return layout === 'super_compatto' ? '0.88rem' : (layout === 'compatto' ? '1.0rem' : '1.1rem');
};

const soloCorrispondenti = ref(true);

const toggleFiltroCorrispondenti = () => {
  vibraTattile(10);
  soloCorrispondentiAndToggle();
};

const soloCorrispondentiAndToggle = () => {
  soloCorrispondenti.value = !soloCorrispondenti.value;
};

const haSettimanaCorrispondente = (prevEx) => {
  return [1, 2, 3, 4, 5, 6].some(w => isMatchingReps(prevEx, w));
};

const storicoFiltrato = computed(() => {
  if (soloCorrispondenti.value) {
    return storicoEsercizio.value.filter(prevEx => haSettimanaCorrispondente(prevEx));
  }
  return storicoEsercizio.value;
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
  if (localStorage.getItem('woapp_vibrazione_attiva') === 'false') return;
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

// I campi ins sono puramente testuali ed i reps sono gestiti internamente al database, per cui non usiamo incrementatori o pulsanti.

// Carica riga 0 della sessione del giorno per ottenere il completamento delle settimane (cmp1-cmp6)
const caricaDataMesociclo = async (atletaId, numScheda) => {
  let dataInizio = '';

  try {
    const q1 = query(
      collection(db, 'WORKOUT_T'),
      where('ID_cliente', '==', String(atletaId)),
      where('num_scheda', '==', String(numScheda))
    );
    let snap = await getDocs(q1);

    if (snap.empty) {
      const q2 = query(
        collection(db, 'WORKOUT_T'),
        where('ID_cliente', '==', Number(atletaId)),
        where('num_scheda', '==', Number(numScheda))
      );
      snap = await getDocs(q2);
    }

    if (!snap.empty) {
      dataInizio = snap.docs[0].data().dat_data;
    }
  } catch (err) {
    console.warn("Errore caricamento data WORKOUT_T:", err);
  }

  // Formattazione esatta come in Home Wo (DD mmm YY)
  const formattaData = (dateStr) => {
    let dateObj = null;
    const cleanStr = String(dateStr).trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(cleanStr)) {
      const parts = cleanStr.substring(0, 10).split('-');
      dateObj = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    } else if (/^\d{1,2}\/\d{1,2}\/\d{4}/.test(cleanStr)) {
      const parts = cleanStr.split(' ')[0].split('/');
      dateObj = new Date(parseInt(parts[2], 10), parseInt(parts[1], 10) - 1, parseInt(parts[0], 10));
    } else {
      const t = Date.parse(cleanStr);
      if (!isNaN(t)) dateObj = new Date(t);
    }

    if (dateObj && !isNaN(dateObj.getTime())) {
      const months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = months[dateObj.getMonth()];
      const year = String(dateObj.getFullYear()).slice(-2); // Anno a 2 cifre
      return `${day} ${month} ${year}`;
    }
    return dateStr;
  };

  if (dataInizio) {
    dataMesociclo.value = formattaData(dataInizio);
  } else {
    // Fallback identico a Home Wo (cerca la prima data di start_wo o usa il default)
    let minDate = null;
    if (allExercises.value && allExercises.value.length > 0) {
      for (const rec of allExercises.value) {
        if (parseInt(rec.num_riga_giorno) === 0) {
          const dates = [rec.start_wo, rec.start2_wo, rec.start3_wo, rec.start4_wo, rec.start5_wo, rec.start6_wo].filter(Boolean);
          for (const dStr of dates) {
            let parsed = null;
            if (/^\d{4}-\d{2}-\d{2}/.test(dStr)) {
              const parts = dStr.substring(0, 10).split('-');
              parsed = new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
            }
            if (parsed && (!minDate || parsed < minDate)) {
              minDate = parsed;
            }
          }
        }
      }
    }
    
    if (minDate) {
      const months = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
      const day = String(minDate.getDate()).padStart(2, '0');
      const month = months[minDate.getMonth()];
      const year = String(minDate.getFullYear()).slice(-2);
      dataMesociclo.value = `${day} ${month} ${year}`;
    } else {
      dataMesociclo.value = '18 mag 26'; // Valore di default usato in Home Wo
    }
  }
};

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

    if (!trovato) {
      const allData = await getStoryboardBackup();
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

const eseguiScrollSettimanaTarget = (targetWeek) => {
  const wNum = parseInt(targetWeek, 10);
  if (!wNum || isNaN(wNum) || wNum < 1 || wNum > 6) return;

  settimanaAttiva.value = wNum;

  const tryScroll = (tentativiRimasti = 6) => {
    // 1. Cerca il campo input della settimana o la card della settimana
    const inputEl = document.getElementById('input-peso-w' + wNum) || 
                    (wNum === 6 ? document.getElementById('input-kg-unico-w6') : null);
    const cardEl = document.getElementById('week-card-' + wNum);

    if (inputEl || cardEl) {
      const scrollTarget = inputEl || cardEl;
      scrollTarget.scrollIntoView({ behavior: 'smooth', block: 'center' });
      
      // Evidenzia con animazione pulsante glow
      const highlightEl = cardEl || inputEl;
      highlightEl.classList.add('evidenzia-esercizio-scroll');
      setTimeout(() => highlightEl.classList.remove('evidenzia-esercizio-scroll'), 2800);

      // Focus sul campo per permettere modifica immediata
      if (inputEl) {
        setTimeout(() => {
          inputEl.focus?.();
        }, 300);
      }
    } else if (tentativiRimasti > 0) {
      setTimeout(() => tryScroll(tentativiRimasti - 1), 150);
    }
  };

  setTimeout(() => tryScroll(6), 250);
};

const determinaSettimanaAttivaGiorno = () => {
  // Se arriviamo da un link di recupero o navigazione da controllo qualità, forziamo la settimana attiva su quella
  const targetW = route.query.scrollWeek || route.query.targetWeek || route.query.week;
  if (targetW) {
    settimanaAttiva.value = parseInt(targetW, 10);
    return;
  }
  
  if (!riga0.value) return;
  for (let w = 1; w <= 6; w++) {
    const valCmp = riga0.value['cmp' + w];
    if (valCmp !== 'true' && valCmp !== true && String(valCmp).toLowerCase() !== 'true') {
      settimanaAttiva.value = w;
      return;
    }
  }
  settimanaAttiva.value = 6;
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

watch(() => [route.params.id, route.query.scrollWeek, route.query.targetWeek, route.query.week], ([nuovoId, sW, tW, w]) => {
  const targetW = sW || tW || w;
  if (!targetW) {
    riportaAInizioPagina();
  }
  if (nuovoId && nuovoId !== routeIdLocal.value) {
    routeIdLocal.value = nuovoId;
    localStorage.setItem('ultimoEsercizioDettaglio', nuovoId);
    caricaDatiEsercizio().then(() => {
      if (targetW) {
        eseguiScrollSettimanaTarget(targetW);
      }
    });
  } else if (targetW) {
    eseguiScrollSettimanaTarget(targetW);
  }
});

watch(workout, (nuovoWorkout) => {
  if (nuovoWorkout) {
    const keyIdCliente = Object.keys(nuovoWorkout).find(k => k.includes('ID_cliente')) || 'ID_cliente';
    const atletaId = nuovoWorkout[keyIdCliente] || '';
    const giorno = nuovoWorkout.des_giorno || '';
    if (atletaId && giorno) {
      localStorage.setItem('giornoAttivo_' + atletaId, giorno);
    }
  }
}, { deep: true });

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
    let sessionItem = null;
    snap.forEach((doc) => {
      const d = doc.data();
      const riga = parseInt(d.num_riga_giorno) || 0;
      const item = applicaModificheLocali({ id: doc.id, riga, ...d });
      if (riga === 0) {
        sessionItem = item;
      } else {
        temp.push(item);
      }
    });
    
    temp.sort((a, b) => a.riga - b.riga);
    
    // Inseriamo la sessione (riga 0) come primo elemento assoluto della cache
    if (sessionItem) {
      tuttiEserciziGiorno.value = [sessionItem, ...temp];
    } else {
      tuttiEserciziGiorno.value = temp;
    }
    
    listaIdEsercizi.value = tuttiEserciziGiorno.value.map(item => item.id);
    indexCorrente.value = tuttiEserciziGiorno.value.findIndex(item => String(item.id) === String(routeIdLocal.value));
  } catch (error) {
    console.error("Errore caricamento lista esercizi per swipe:", error);
  }
};

const vaiAdEsercizioSuccessivo = () => {
  if (listaIdEsercizi.value.length <= 1 || indexCorrente.value === -1) return;
  if (indexCorrente.value === listaIdEsercizi.value.length - 1) return;
  transitionName.value = 'swipe-next'; // Imposta l'animazione verso sinistra
  const nextItem = tuttiEserciziGiorno.value[indexCorrente.value + 1];
  vibraTattile(15);
  if (parseInt(nextItem.num_riga_giorno) === 0) {
    router.replace({ name: 'DettaglioSessione', params: { id: nextItem.id } });
  } else {
    router.replace({ name: 'DettaglioWorkout', params: { id: nextItem.id } });
  }
};

const vaiAdEsercizioPrecedente = () => {
  if (listaIdEsercizi.value.length <= 1 || indexCorrente.value === -1 || indexCorrente.value <= 0) {
    tornaIndietro();
    return;
  }

  // Navigazione precedente standard
  transitionName.value = 'swipe-prev';
  const prevItem = tuttiEserciziGiorno.value[indexCorrente.value - 1];
  vibraTattile(15);
  if (parseInt(prevItem.num_riga_giorno) === 0) {
    router.replace({ name: 'DettaglioSessione', params: { id: prevItem.id } });
  } else {
    router.replace({ name: 'DettaglioWorkout', params: { id: prevItem.id } });
  }
};

const vaiAlGiornoAllenamento = async () => {
  vibraTattile(15);
  const giorno = (workout.value?.des_giorno || '').trim().toUpperCase();
  const week = settimanaAttiva.value || 1;
  const exId = workout.value?.id || routeIdLocal.value || '';
  
  if (giorno) {
    localStorage.setItem('woapp_giorno_selezionato', giorno);
    localStorage.setItem('woapp_target_scroll_exercise', exId);
  }
  
  // 1. Cerchiamo l'id del documento Sessione (Riga 0) per questo giorno
  let sessionId = riga0.value?.id;
  
  if (!sessionId && tuttiEserciziGiorno.value && tuttiEserciziGiorno.value.length > 0) {
    const sessionObj = tuttiEserciziGiorno.value.find(item => parseInt(item.num_riga_giorno) === 0);
    if (sessionObj) sessionId = sessionObj.id;
  }
  
  if (!sessionId && allExercises.value && allExercises.value.length > 0) {
    const sessionObj = allExercises.value.find(item => 
      String(item.des_giorno).trim().toUpperCase() === giorno && parseInt(item.num_riga_giorno) === 0
    );
    if (sessionObj) sessionId = sessionObj.id;
  }
  
  if (!sessionId && globalStoryboard.value && globalStoryboard.value.length > 0) {
    const keyIdCliente = workout.value ? (Object.keys(workout.value).find(k => k.includes('ID_cliente')) || 'ID_cliente') : 'ID_cliente';
    const atletaId = workout.value ? (workout.value[keyIdCliente] || '') : '';
    const sessionObj = globalStoryboard.value.find(item =>
      (String(item[keyIdCliente]) === String(atletaId) || String(item['ID_cliente']) === String(atletaId)) &&
      String(item.num_scheda) === String(workout.value?.num_scheda) &&
      String(item.des_giorno).trim().toUpperCase() === giorno &&
      parseInt(item.num_riga_giorno) === 0
    );
    if (sessionObj) sessionId = sessionObj.id;
  }

  if (!sessionId) {
    try {
      const allData = await getStoryboardBackup();
      const keyIdCliente = workout.value ? (Object.keys(workout.value).find(k => k.includes('ID_cliente')) || 'ID_cliente') : 'ID_cliente';
      const atletaId = workout.value ? (workout.value[keyIdCliente] || '') : '';
      const sessionObj = allData.find(item =>
        (String(item[keyIdCliente]) === String(atletaId) || String(item['ID_cliente']) === String(atletaId)) &&
        String(item.num_scheda) === String(workout.value?.num_scheda) &&
        String(item.des_giorno).trim().toUpperCase() === giorno &&
        parseInt(item.num_riga_giorno) === 0
      );
      if (sessionObj) sessionId = sessionObj.id || sessionObj.num_riga;
    } catch (e) {
      console.warn("Errore backup riga 0 per navigazione:", e);
    }
  }

  if (sessionId) {
    router.push({
      name: 'DettaglioSessione',
      params: { id: sessionId },
      query: { week: week }
    });
  } else {
    router.push({
      name: 'Workouts',
      query: {
        giorno: giorno,
        week: week,
        targetEx: exId
      }
    });
  }
};

// Gesture di swipe touch
let touchStartX = 0;
let touchStartY = 0;

const handleTouchStart = (e) => {
  if (dialogStorico.value || dialogProgressioniPrecedente.value || dialogElimina.value) return;
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};

const handleTouchEnd = (e) => {
  if (dialogStorico.value || dialogProgressioniPrecedente.value || dialogElimina.value) return;
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
  // CACHE REATTIVA PER SWIPE E CARICAMENTO IMMEDIATO
  let cachedEx = tuttiEserciziGiorno.value.find(ex => String(ex.id) === String(routeIdLocal.value));
  if (!cachedEx && globalStoryboard.value && globalStoryboard.value.length > 0) {
    cachedEx = globalStoryboard.value.find(ex => String(ex.id) === String(routeIdLocal.value));
  }

  if (cachedEx) {
    workout.value = applicaModificheLocali({ ...cachedEx });
    const keyIdCliente = Object.keys(cachedEx).find(k => k.includes('ID_cliente')) || 'ID_cliente';
    const atletaId = cachedEx[keyIdCliente] || '';
    const schemaRef = workout.value?.num_scheda;
    const desGiorno = workout.value?.des_giorno;

    // Sincronizzazione immediata di Riga 0 e Settimana Attiva dalla cache in memoria
    let cachedRiga0 = tuttiEserciziGiorno.value.find(ex => parseInt(ex.num_riga_giorno) === 0 || ex.riga === 0);
    if (!cachedRiga0 && globalStoryboard.value && globalStoryboard.value.length > 0) {
      cachedRiga0 = globalStoryboard.value.find(ex =>
        (String(ex[keyIdCliente]) === String(atletaId) || String(ex['ID_cliente']) === String(atletaId)) &&
        String(ex.num_scheda) === String(schemaRef) &&
        String(ex.des_giorno).trim().toUpperCase() === String(desGiorno).trim().toUpperCase() &&
        parseInt(ex.num_riga_giorno) === 0
      );
    }
    if (cachedRiga0) {
      riga0.value = applicaModificheLocali(cachedRiga0);
      determinaSettimanaAttivaGiorno();
    } else {
      if (route.query.targetWeek) {
        settimanaAttiva.value = parseInt(route.query.targetWeek);
      } else {
        settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + atletaId)) || 2;
      }
    }

    // Risoluzione sincrona immediata dell'esercizio precedente per evitare flickering di colore
    const trovatoSync = applicaEsercizioPrecedenteSincrono(workout.value);
    if (!trovatoSync) {
      previousWorkout.value = null;
      for (let w = 1; w <= 6; w++) {
        inputSettimanePrecedente.value[w].ins = '';
        inputSettimanePrecedente.value[w].reps = '';
      }
      numIns6ValPrecedente.value = '';
      numFaticaw6ValPrecedente.value = '';
      storicoEsercizio.value = [];
      storicoEsercizioPerAiuto.value = [];
    }

    stileStorico.value = localStorage.getItem('stileStorico_' + atletaId) || getStileStoricoAtleta(atletaId);
    modalitaSettimane.value = localStorage.getItem('modalitaSettimane_' + atletaId) || getModalitaSettimaneAtleta(atletaId);
    posizionamentoSuperset.value = localStorage.getItem('posizionamentoSuperset_' + atletaId) || 'auto';
    inizializzaParametriProposta(atletaId);

    if (atletaId && schemaRef && !dataMesociclo.value) {
      caricaDataMesociclo(atletaId, schemaRef);
    }

    for (let w = 1; w <= 6; w++) {
      inputSettimane.value[w].ins = workout.value['ins_week' + w] || '';
      inputSettimane.value[w].reps = workout.value['reps_week' + w] || '';
      localEditingIns.value[w] = inputSettimane.value[w].ins;
    }
    noteAttrezzo.value = workout.value.des_note_attrezzo || '';
    noteEsercizio.value = workout.value.ins_esercizio || '';
    commentiAtleta.value = workout.value.des_commenti || '';
    numIns6Val.value = workout.value.num_ins6 || '';
    numIns6ModificatoManualmente.value = false;
    numFaticaw6Val.value = workout.value.num_faticaw6 || '';
    indRepsStartVal.value = workout.value.ind_reps_start || '';

    // Nascondi immediatamente lo spinner per apertura istantanea
    caricamento.value = false;

    // Carica il completamento del giorno (Riga 0) e l'elenco esercizi per lo swipe in background
    if (atletaId && schemaRef && desGiorno) {
      caricaRiga0(keyIdCliente, atletaId, schemaRef, desGiorno).then(() => {
        determinaSettimanaAttivaGiorno();
      });
      caricaListaEserciziGiorno(keyIdCliente, atletaId, schemaRef, desGiorno);
    }

    // Carica l'esercizio precedente e l'analisi in background
    caricaEsercizioPrecedente().then(() => {
      indexCorrente.value = tuttiEserciziGiorno.value.findIndex(item => String(item.id) === String(routeIdLocal.value));
    });
    
    caricaDatiAnalisi(settimanaAttiva.value).catch(errAnalisi => {
      console.warn("Errore caricamento dati analisi eager:", errAnalisi);
    });

    return;
  }

  // Fallback se non in cache
  previousWorkout.value = null;
  for (let w = 1; w <= 6; w++) {
    inputSettimanePrecedente.value[w].ins = '';
    inputSettimanePrecedente.value[w].reps = '';
  }
  numIns6ValPrecedente.value = '';
  numFaticaw6ValPrecedente.value = '';
  storicoEsercizio.value = [];
  storicoEsercizioPerAiuto.value = [];

  caricamento.value = true;
  try {
    let docSnap = null;
    let targetDocId = routeIdLocal.value;

    try {
      const docRef = doc(db, 'STORYBOARD', routeIdLocal.value);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        docSnap = snap;
      }
    } catch (eDoc) {}

    // Fallback: se routeIdLocal è un num_riga anziché l'ID di documento Firestore
    if (!docSnap && !String(routeIdLocal.value).startsWith('STORICO_')) {
      const qNum = query(
        collection(db, 'STORYBOARD'),
        where('ID_cliente', '==', selectedAthlete.value),
        where('num_riga', 'in', [routeIdLocal.value, String(routeIdLocal.value), Number(routeIdLocal.value)])
      );
      const snapNum = await getDocs(qNum);
      if (!snapNum.empty) {
        docSnap = snapNum.docs[0];
        targetDocId = docSnap.id;
      }
    }

    if (docSnap && docSnap.exists()) {
      const dati = docSnap.data();
      workout.value = applicaModificheLocali({ id: targetDocId || docSnap.id, ...dati });
      applicaEsercizioPrecedenteSincrono(workout.value);

      // Recupera la settimana attiva impostata nella Home per l'atleta specifico
      const keyIdCliente = Object.keys(dati).find(k => k.includes('ID_cliente')) || '\uFEFF"ID_cliente"';
      const atletaId = dati[keyIdCliente] || '';
      if (route.query.targetWeek) {
        settimanaAttiva.value = parseInt(route.query.targetWeek);
      } else {
        settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + atletaId)) || 2;
      }

      // Recupera stileStorico e modalitaSettimane per l'atleta specifico
      stileStorico.value = localStorage.getItem('stileStorico_' + atletaId) || getStileStoricoAtleta(atletaId);
      modalitaSettimane.value = localStorage.getItem('modalitaSettimane_' + atletaId) || getModalitaSettimaneAtleta(atletaId);
      stileRecordStorico.value = localStorage.getItem('stileRecordStorico_' + atletaId) || 'cards';
      posizionamentoSuperset.value = localStorage.getItem('posizionamentoSuperset_' + atletaId) || 'auto';
      inizializzaParametriProposta(atletaId);

      // Se UrlNormal è vuoto o non valido, proviamo a ripristinarlo dal backup JSON locale
      if (!workout.value.UrlNormal || !workout.value.UrlNormal.startsWith('http')) {
        try {
          const allData = await getStoryboardBackup();
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
        localEditingIns.value[w] = inputSettimane.value[w].ins;
      }
      
      noteAttrezzo.value = workout.value.des_note_attrezzo || '';
      noteEsercizio.value = workout.value.ins_esercizio || '';
      commentiAtleta.value = workout.value.des_commenti || '';

      numIns6Val.value = workout.value.num_ins6 || '';
      numFaticaw6Val.value = workout.value.num_faticaw6 || '';
      indRepsStartVal.value = workout.value.ind_reps_start || '';

      // Carica l'esercizio del mesociclo precedente per consigliare il carico in Week 1
      await caricaEsercizioPrecedente();

      // Carica la data del mesociclo da WORKOUT_T
      if (atletaId && dati.num_scheda) {
        await caricaDataMesociclo(atletaId, dati.num_scheda);
      }

      // Carica il completamento del giorno (Riga 0) ed elenco per swipe
      if (atletaId && dati.num_scheda && dati.des_giorno) {
        await caricaRiga0(keyIdCliente, atletaId, dati.num_scheda, dati.des_giorno);
        determinaSettimanaAttivaGiorno();
        await caricaListaEserciziGiorno(keyIdCliente, atletaId, dati.num_scheda, dati.des_giorno);
      }
      try {
        await caricaDatiAnalisi(settimanaAttiva.value);
      } catch (errAnalisi) {
        console.warn("Errore caricamento dati analisi eager:", errAnalisi);
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
    const allData = await getStoryboardBackup();
    const found = allData.find(item => {
      const syntheticId = `STORICO_${item.num_scheda}_${item.des_giorno}_${item.num_riga_giorno}`;
      return String(item.id) === String(routeIdLocal.value) || 
             String(item.num_riga) === String(routeIdLocal.value) ||
             syntheticId === String(routeIdLocal.value);
    });
    if (found) {
      workout.value = applicaModificheLocali(found);
      applicaEsercizioPrecedenteSincrono(workout.value);
      const keyIdCliente = Object.keys(found).find(k => k.includes('ID_cliente')) || 'ID_cliente';
      const atletaId = found[keyIdCliente] || '';
      if (route.query.targetWeek) {
        settimanaAttiva.value = parseInt(route.query.targetWeek);
      } else {
        settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + atletaId)) || 2;
      }

      // Recupera stileStorico e modalitaSettimane per l'atleta specifico
      stileStorico.value = localStorage.getItem('stileStorico_' + atletaId) || getStileStoricoAtleta(atletaId);
      modalitaSettimane.value = localStorage.getItem('modalitaSettimane_' + atletaId) || getModalitaSettimaneAtleta(atletaId);
      stileRecordStorico.value = localStorage.getItem('stileRecordStorico_' + atletaId) || 'cards';
      posizionamentoSuperset.value = localStorage.getItem('posizionamentoSuperset_' + atletaId) || 'auto';
      inizializzaParametriProposta(atletaId);

      for (let w = 1; w <= 6; w++) {
        inputSettimane.value[w].ins = workout.value['ins_week' + w] || '';
        inputSettimane.value[w].reps = workout.value['reps_week' + w] || '';
        localEditingIns.value[w] = inputSettimane.value[w].ins;
      }
      
      noteAttrezzo.value = workout.value.des_note_attrezzo || '';
      noteEsercizio.value = workout.value.ins_esercizio || '';
      commentiAtleta.value = workout.value.des_commenti || '';

      numIns6Val.value = workout.value.num_ins6 || '';
      numIns6ModificatoManualmente.value = false;
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
          determinaSettimanaAttivaGiorno();
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
      try {
        await caricaDatiAnalisi(settimanaAttiva.value);
      } catch (errAnalisi) {
        console.warn("Errore caricamento dati analisi eager:", errAnalisi);
      }
    }
  } catch (errBackup) {
    console.error("Errore nel caricamento del backup locale in Dettaglio:", errBackup);
  }
};

onMounted(() => {
  const targetW = route.query.scrollWeek || route.query.targetWeek || route.query.week;
  if (!targetW) {
    riportaAInizioPagina();
  }
  caricaDatiEsercizio().then(() => {
    if (targetW) {
      eseguiScrollSettimanaTarget(targetW);
    }
  });
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

const pulisciParentesiQuadre = (str) => {
  if (!str) return '';
  return String(str).replace(/\[\s*KG?\s*W\s*\d+\s*\]?/gi, '').trim();
};

const getDescrizioneBreve = (testo) => {
  if (!testo) return '';
  const cleanTesto = String(testo).trim().toLowerCase();
  
  for (const metodo of Object.values(METODI_ALLENAMENTO)) {
    const cleanDesc = metodo.desc.trim().toLowerCase();
    if (cleanTesto.includes(cleanDesc) || cleanDesc.includes(cleanTesto)) {
      return metodo.descBreve;
    }
  }
  return testo;
};

// Parser delle stringhe di prescrizione speciali (es. 5x2(75%)|87,5KG|33,75L 77% o 3x12(60%)|95KG 86%)
const parsePrescription = (str) => {
  if (!str) return null;
  // Rimuove l'espressione [K WX], [KG WX] o [Kg WX prima del parsing
  const cleanStr = pulisciParentesiQuadre(str);
  
  // Split by "|"
  const parts = cleanStr.split('|');
  if (parts.length >= 2) {
    const part1 = parts[0].trim();
    
    // Parse Part 1: reps and optional max (e.g. "5x2(75%)" or "3x12(60%)" or "AMRAP(90%)")
    const m1 = part1.match(/^([^\(]+?)\s*\(([^)]+)\)$/);
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

const estraiNumeriDaInput = (str) => {
  if (!str) return [];
  let cleanStr = str.replace(/,/g, '.');
  cleanStr = cleanStr.replace(/(?:@|kg)\s*\d+(?:\.\d+)?/gi, '');
  cleanStr = cleanStr.replace(/\d+(?:\.\d+)?\s*(?:kg|@)/gi, '');
  const regex = /(\d+(?:\.\d+)?)/g;
  const matches = cleanStr.match(regex);
  if (!matches) return [];
  return matches.map(val => parseFloat(val));
};

const METODI_ALLENAMENTO = {
  '▼': {
    code: '▼',
    desc: "Si inizia con una serie di ripetizioni più alte e peso leggero e si finisce con una serie di ripetizioni più basse e peso più alto. Si cala di 2 reps in ogni serie",
    descBreve: "Serie con reps calanti di 2 in ogni set e peso crescente (piramidale).",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Aumenta peso e cala di 2 reps a ogni set`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Progressione ▼"
      };
    }
  },
  'rp': {
    code: 'rp',
    desc: "Una volta raggiunto l'esaurimento e appoggiato l'attrezzo si riposa per 15'' o 20'' e si riprende eseguendo un numero di ripetizioni, ovviamente inferiore al primo",
    descBreve: "Rest-Pause: al cedimento riposa 15-20'' e fai altre reps a cedimento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Rest-Pause: al cedimento, riposa 15-20'' e fai altre reps`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo RP"
      };
    }
  },
  'sPL': {
    code: 'sPL',
    desc: "Nello stesso set si parte con un carico elevato ad ESAURIMENTO, subito dopo si cala il peso del 30% e si porta ad esaurimento. E' uno stripping però a due gruppi anziché tre",
    descBreve: "Stripping a 2 blocchi: al cedimento cala il peso del 30% e vai a cedimento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Stripping 2 blocchi: al cedimento, cala il peso del 30%`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo sPL"
      };
    }
  },
  'p': {
    code: 'p',
    desc: "Raggiunto l'esaurimento si continua le ripetizioni usando il movimento a metà (ROM inferiore) portando a cedimento ulteriore",
    descBreve: "ROM parziale: al cedimento continua con mezzo ROM inferiore.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Parziali: al cedimento, continua con mezzo ROM inferiore`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo P"
      };
    }
  },
  'i5': {
    code: 'i5',
    desc: "Fai 5 ripetizioni con un carico dell'80% del massimale (invece delle 8 o 9 portate a cedimento) recuperi 15'' o 20'' e si completi altre 5 reps, ripeti il ciclo finché non riesci più a fare 5 reps quindi finché non raggiungi cedimento",
    descBreve: "Interrotto a 5 reps (80% 1RM), recupera 15-20'' e ripeti finché non cedi.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Interrotto a 5 reps (80% 1RM), recupera 15-20'' e ripeti finché reggi`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo i5"
      };
    }
  },
  'ĉ»': {
    code: 'ĉ»',
    desc: "Fai una ripetizione con il 75%, riposare 10'', fai 2 ripetizioni e riposa 10'', fai 3 ripetizioni e riposa 10'', ripeti il ciclo con le ripetizioni a salire fino al numero di reps finali scelto",
    descBreve: "Ramp up reps (75% 1RM): 1 rep, rest 10'', 2 reps, rest 10'', 3 reps, ecc.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Ramp up reps (75% 1RM): 1 rep, riposa 10'', 2 reps, riposa 10'', 3 reps, ecc.`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo ĉ»"
      };
    }
  },
  'ĉ': {
    code: 'ĉ',
    desc: "Esegui una ripetizione con un carico che consente di fare la META' delle reps target ad esaurimento, si appoggia l'attrezzo si aspetta 10'' o 15'' e si esegue un'altra ripetizione, così via fino a fare tutte le ripetizioni target",
    descBreve: "Single reps (carico per 1/2 target): 1 rep, rest 10-15'', ripeti fino a target.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Single reps interrotte (carico per 1/2 target): 1 rep, riposa 10-15''`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo ĉ"
      };
    }
  },
  '†': {
    code: '†',
    desc: "Si eseguono le prime ripetizioni indicate con tecnica perfetta, poi raggiunto l'esaurimento si continua con le altre reps aiutandosi con piccoli slanci o altri gruppi muscolari",
    descBreve: "Cheating: al cedimento continua aiutandoti con piccoli slanci.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Cheating controllato: al cedimento continua con slancio/aiuto`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo †"
      };
    }
  },
  's21': {
    code: 's21',
    desc: "Si eseguono 7 ripetizioni complete, 7 parziali da metà in contrazione, 7 parziali da metà in allungamento",
    descBreve: "Serie 21: 7 reps complete + 7 parz. contrazione + 7 parz. allungamento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Serie 21: 7 reps complete + 7 parz. contrazione + 7 parz. allungamento`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo s21"
      };
    }
  },
  's⅓': {
    code: 's⅓',
    desc: "Fai le prime serie normali, poi nell'ultimo set: quando raggiungi il cedimento fai altri tre gruppi delle stesse ripetizioni diminuendo il peso del 15% tra ciascun gruppo senza recupero",
    descBreve: "Stripping 3 blocchi (-15% peso) nell'ultimo set a cedimento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Stripping 3 blocchi (-15% peso) nell'ultimo set a cedimento`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo s⅓"
      };
    }
  },
  'n': {
    code: 'n',
    desc: "Dopo aver raggiunto il cedimento muscolare, si completa solo la fase eccentrica e si chiede l'assistenza di un compagno per la fase concentrica.",
    descBreve: "Eccentriche negative assistite: al cedimento esegui solo la discesa lenta.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Negative assistite: al cedimento, esegui solo l'eccentrica in discesa`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo n"
      };
    }
  },
  'Ƒ': {
    code: 'Ƒ',
    desc: "Dopo aver raggiunto il cedimento muscolare, si completano le ripetizioni con l'assistenza di un compagno.",
    descBreve: "Forzate: al cedimento completa le reps assistito dal compagno.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Forzate: al cedimento continua con l'aiuto del compagno`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo Ƒ"
      };
    }
  },
  'iso': {
    code: 'iso',
    desc: "Tenere x secondi in contrazione",
    descBreve: "Isometria: tieni la contrazione massima statica per i secondi prescritti.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Isometria: tieni la contrazione massima statica`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo iso"
      };
    }
  },
  'd⅓': {
    code: 'd⅓',
    desc: "Quando si è raggiunto il cedimento cambiare il modo di eseguire l'esercizio per portarlo ancora a cedimento",
    descBreve: "Cambio esecuzione: al cedimento varia la tecnica per continuare.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Cambio esecuzione: al cedimento varia la tecnica per continuare`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo d⅓"
      };
    }
  },
  'r3': {
    code: 'r3',
    desc: "Si esegue 3 ripetizioni con carico leggero, senza recupero si aumenta carico e si eseguono altre 3 reps, si aumenta carico e si eseguono altre 3 reps, si ripete il ciclo fino a cedimento",
    descBreve: "Ramp 3 reps: serie di 3 reps senza recupero a salire di peso fino a cedimento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Ramp 3 reps senza recupero a salire di peso fino a cedimento`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo r3"
      };
    }
  },
  '↕': {
    code: '↕',
    desc: "Si alternano il numero di ripetizioni con l'esercizio successivo",
    descBreve: "Alterna il numero di ripetizioni con l'esercizio successivo.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Alternanza ripetizioni con l'esercizio successivo`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo ↕"
      };
    }
  },
  'Я': {
    code: 'Я',
    desc: "Programmazione Ciclo Russo",
    descBreve: "Ciclo Russo: segui le progressioni di intensità/volume stabilite.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Ciclo Russo: segui le progressioni di intensità/volume`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo Я"
      };
    }
  },
  'i': {
    code: 'i',
    desc: "Si eseguono x ripetizioni con un carico dell'75% del massimale (non si portano a cedimento ma si tengono 2 di buffer) si recupera 10'' e si completano altre x reps, si ripete il ciclo finché non si riesce più a fare x reps",
    descBreve: "Interrotto (75% 1RM, buffer 2): fai reps, riposa 10'', ripeti finché reggi.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Interrotto (75% 1RM, buffer 2): fai reps, riposa 10'', ripeti`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo i"
      };
    }
  },
  'oc': {
    code: 'oc',
    desc: "Metodo occlusivo con fasce elastiche (applicazione solo su gambe e braccia)",
    descBreve: "BFR (Blood Flow Restriction): occlusione con fasce elastiche su braccia/gambe.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Blood Flow Restriction (BFR): occlusione con fasce elastiche`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo oc"
      };
    }
  },
  'Ƒ+2': {
    code: 'Ƒ+2',
    desc: "Una volta raggiunto il cedimento muscolare si eseguono subito altre 2 reps con l'aiuto di un compagno",
    descBreve: "Forzate + 2 reps: al cedimento esegui subito altre 2 reps assistite.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Forzate + 2 reps: al cedimento esegui subito 2 reps assistite`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo Ƒ+2"
      };
    }
  },
  'JR': {
    code: 'JR',
    desc: "24 Reps totali in cui si scompone il ROM in 2 o tre parti, in caso di movimenti ampi si suddivide in 3 in caso di range più corti in 2, durata della serie fra 45-50 sec per atleti fibre bianche o 45-75 sec per atleti fibre rosse",
    descBreve: "Jordan Reps (24 totali): scompone ROM in 2 o 3 parti, serie da 45-75s.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Jordan Reps (24 reps totali): scompone ROM in 2-3 parti`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo JR"
      };
    }
  },
  'RD': {
    code: 'RD',
    desc: "La metà delle reps scritte con ROM favorevole, l'altra metà con ROM in allungamento",
    descBreve: "ROM diviso: metà reps con ROM favorevole, metà in allungamento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `ROM diviso: metà reps favorevoli, metà in allungamento`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo RD"
      };
    }
  },
  'MX': {
    code: 'MX',
    desc: "Massime ripetizioni possibili fino a cedimento",
    descBreve: "Massime ripetizioni possibili fino a cedimento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Max reps possibili (cedimento totale)`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo MX"
      };
    }
  },
  'ST': {
    code: 'ST',
    desc: "Si tiene il peso in eccentrica per x secondi nel punto di massima tensione muscolare",
    descBreve: "Tensione eccentrica: hold nel punto di massima tensione.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Hold isometrica/eccentrica nel punto di massima tensione`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo ST"
      };
    }
  },
  'i½': {
    code: 'i½',
    desc: "Si esegue la metà delle ripetizioni si aspetta 10 o 15'' e si porta a termine l'altra metà delle ripetizioni, il carico da scegliere è il 110% delle reps MAX",
    descBreve: "Interrotto a metà reps (110% reps max): fai metà reps, rest 10-15'', poi le altre.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Interrotto a metà reps (110% reps max): riposa 10-15'' a metà set`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo i½"
      };
    }
  },
  'RR': {
    code: 'RR',
    desc: "Cali di 2 reps e di 2 secondi il recupero ad es: 7x14 viene 7x14-12-10-8-6-4-2 e recupero fra le serie di: 14-12-10-8-6-4-2 sec",
    descBreve: "Rest-Reduction: cala 2 reps e 2s di recupero ad ogni set.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Rest-Reduction: cala 2 reps e 2s di recupero ad ogni set`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo RR"
      };
    }
  },
  'RC': {
    code: 'RC',
    desc: "Solo la parte di ROM centrale (no max contrazione, no max allungamento)",
    descBreve: "ROM centrale: esegui solo la parte centrale del movimento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `ROM centrale: esegui solo la parte centrale del movimento`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo RC"
      };
    }
  },
  'RA': {
    code: 'RA',
    desc: "Solo la parte di ROM in allungamento",
    descBreve: "ROM in allungamento: esegui solo la parte di massimo stiramento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `ROM in allungamento: esegui solo la parte di massimo stiramento`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo RA"
      };
    }
  },
  'RF': {
    code: 'RF',
    desc: "Solo la parte di ROM finale in accorciamento",
    descBreve: "ROM finale: esegui solo la parte finale in accorciamento.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `ROM finale: esegui solo la parte finale in massimo accorciamento`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo RF"
      };
    }
  },
  'OL': {
    code: 'OL',
    desc: "6 serie di cui la prima con x reps, la seconda con x-1, la terza con x-2, la quarta con x reps ma con più peso, la quinta con x-1 con più peso e la sesta con x-2 con più peso se necessario farsi aiutare o forzata o cheating",
    descBreve: "Oltre il Limite: 6 serie scalando reps e aumentando peso. Aiuto alla fine.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Oltre il Limite: 6 serie scalando reps e aumentando peso`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo OL"
      };
    }
  },
  'OC': {
    code: 'OC',
    desc: "6 serie di cui la prima con x reps, la seconda con x-3, la terza con x ma con più peso, la quarta con x-3 con più peso, la quinta con x con più peso ancora e la sesta con x-3 con più peso ancora, se necessario farsi aiutare o forzata o cheating",
    descBreve: "Oltre il Cedimento: 6 serie alternate (+peso/-reps, ecc.). Aiuto alla fine.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Oltre il Cedimento: 6 serie alternate (+peso/-reps, ecc.)`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo OC"
      };
    }
  },
  'p_pos': {
    code: 'p',
    desc: "Solo la fase positiva, massima esplosività",
    descBreve: "Fase positiva esplosiva (massima esplosività).",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Fase positiva esplosiva`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo p"
      };
    }
  },
  'iD': {
    code: 'iD',
    desc: "Ad ogni ripetizione fermarsi X secondi nel punto di massima tensione per poi fare la positiva",
    descBreve: "Fermo X secondi nel punto di max tensione prima di ogni positiva.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Isometria nel punto di massima tensione prima di ogni concentrica`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo iD"
      };
    }
  },
  'Di': {
    code: 'Di',
    desc: "Ad ogni serie cambia inclinazione della panca partendo da 30° (30-45-60-75)",
    descBreve: "Cambia inclinazione panca ad ogni serie (30° -> 45° -> 60° -> 75°).",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Cambia inclinazione panca ogni serie: 30° -> 45° -> 60° -> 75°`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo Di"
      };
    }
  },
  'iP': {
    code: 'iP',
    desc: "Ad ogni serie incrementa il peso arrivando a cedimento nell'ultima serie (parti sempre da un peso leggero con almeno  4 di buffer)",
    descBreve: "Piramide: incrementa peso ogni serie, cedimento all'ultima (buffer 4 in partenza).",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Piramide: incrementa peso ogni serie, cedimento all'ultima`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo iP"
      };
    }
  },
  'rT': {
    code: 'rT',
    desc: "Per prepararti per il tuo test di forza massimale, devi avvicinarti al tuo peso ideale. Durante il 'ramp' di riscaldamento, fai 5 serie di esercizi con pesi crescenti, ad esempio 5 serie di 5-4-3-2-2 ripetizioni. Poi, quando sei pronto, prova a sollevare",
    descBreve: "Ramp di riscaldamento: 5 serie (5-4-3-2-2 reps) prima del test massimale.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Riscaldamento specifico: 5 serie (5-4-3-2-2 reps) prima del test`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo rT"
      };
    }
  },
  'tMR': {
    code: 'tMR',
    desc: "Dopo il riscaldamento si esegue una serie con le massime ripetizioni possibili con l'ultimo carico dell'allenamento precedente.",
    descBreve: "Test Max Reps: 1 serie a max reps possibili con carico precedente.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Test Max Reps: max reps possibili con carico allenamento precedente`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo tMR"
      };
    }
  },
  'sN': {
    code: 'sN',
    desc: "Porti su il peso con cheating o con compagno e fai la fase negativa molto concentrato in 4 sec",
    descBreve: "Negative sN: fase concentrica assistita/cheating, eccentrica controllata in 4s.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Negative sN: fase concentrica con aiuto, eccentrica in 4 secondi`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo sN"
      };
    }
  },
  'sTm': {
    code: 'sTm',
    desc: "Mantieni lo stesso peso nelle week, quando le ripetizioni sono basse aumenta il tempo sotto tensione (vai più lento), più si alzano le reps e più vai veloce nel pompaggio. Tempo da 40-60sec",
    descBreve: "Stesso peso. Reps basse -> esecuzione lenta (alto TUT). Reps alte -> pompaggio veloce.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Stesso peso. Reps basse -> esecuzione lenta. Reps alte -> veloce. Serie da 40-60s`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo sTm"
      };
    }
  },
  '->': {
    code: '->',
    desc: "Inizia dalla week1 con il minimo di ripetizioni a CEDIMENTO, mantieni lo stesso carico nelle week successive ma aumenta le reps fino al range max, solo quando hai raggiunto il max range con quel peso aumenti il peso nelle week successive ritornando al min",
    descBreve: "Progressione reps: tieni il carico e aumenta reps fino al range max prima di aumentare peso.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Progressione reps: mantieni il peso e aumenta reps prima di salire di carico`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo ->"
      };
    }
  },
  'MAX': {
    code: 'MAX',
    desc: "Nella 1a week fai una media di ripetizioni sulle X serie. Dalla week 2 usi la % sulla media delle reps calcolate, arrotondando per difetto",
    descBreve: "W1: calcola la media reps a cedimento. Dalla W2: usa la % sulla media, arrotondato per difetto.",
    calcolaProposta: (sett, ghost, inputSettimane, workout) => {
      const w1Ins = inputSettimane.value[1]?.ins || '';
      const numbers = estraiNumeriDaInput(w1Ins);
      const w1PesoStr = estraiPesoDaInput(w1Ins);
      const pesoVal = w1PesoStr ? parseFloat(w1PesoStr) : (ghost ? ghost.peso : 0);

      if (sett === 1) {
        return {
          text: `W1: Esegui a cedimento e scrivi le reps per calcolare la media`,
          peso: pesoVal,
          label: ghost ? ghost.label : '',
          isMetodo: true,
          metodoLabel: "W1 MAX"
        };
      }
      if (numbers.length > 0) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = sum / numbers.length;
        const presc = String(workout.value['des_week' + sett] || '');
        const matchPct = presc.match(/(\d+)\s*%/);
        const pct = matchPct ? parseInt(matchPct[1], 10) / 100 : 1;
        const targetReps = Math.floor(avg * pct);
        return {
          text: `Target: ${targetReps} reps per serie (media W1: ${avg.toFixed(1)} * ${Math.round(pct * 100)}%)`,
          peso: pesoVal,
          label: 'W1',
          isMetodo: true,
          metodoLabel: `W${sett} MAX`
        };
      }
      return {
        text: `Target basato sulla media di W1 (arrotondato per difetto)`,
        peso: pesoVal,
        label: 'W1',
        isMetodo: true,
        metodoLabel: `W${sett} MAX`
      };
    }
  },
  'cx': {
    code: 'cx',
    desc: "Si esegue una ripetizione con un carico che consente di farne le metà delle x reps target, si appoggia l'attrezzo si aspetta 15'' e si esegue un'altra ripetizione, così via fino a fare x ripetizioni",
    descBreve: "Single reps (carico per 1/2 target): 1 rep, rest 15'', ripeti fino a target.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Single reps (carico per 1/2 target): 1 rep, riposa 15'' fino a target`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo cx"
      };
    }
  },
  'c5L': {
    code: 'c5L',
    desc: "La fase concentrica dura 5 sec, le altre zero",
    descBreve: "Concentrica lenta 5 sec, ritorno immediato.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Concentrica lenta 5 sec, ritorno immediato`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo c5L"
      };
    }
  },
  'N': {
    code: 'N',
    desc: "Solo la fase negativa, la fase positiva la fai leggera insieme a uno spotter",
    descBreve: "Solo fase negativa assistita (spotter esegue la positiva).",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Solo fase negativa assistita (spotter esegue la positiva)`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo N"
      };
    }
  },
  'MY': {
    code: 'MY',
    desc: "Fai x ripetizioni tenendo 1 di buffer, aspetti 10 o 15 sec e fai altre 3 reps con stesso carico, continui il ciclo 10'' riposo + 3 reps finche non riesci a fare 3 reps pulite",
    descBreve: "Myo-Reps: set attivazione (buffer 1) + mini-set da 3 reps (rest 10-15'') finché pulite.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Myo-Reps: set attivazione (buffer 1) + mini-set da 3 reps (10-15'' rest)`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo MY"
      };
    }
  },
  'MED+++': {
    code: 'MED+++',
    desc: "Nella prima settimana, fai tutte le serie fino a non poter continuare, somma tutte le ripetizioni e calcola la media. Dalla seconda settimana, dividi per due la media e aggiungi una reps ogni settimana. Es: Nella prima week, fai 3 serie e ottieni 21 reps in totale. Dalla seconda week, fai 3 reps per serie (media di 7 diviso 2) più una reps aggiunta, quindi 4 reps per serie.",
    descBreve: "W1: calcola media reps a cedimento. Dalla W2: media/2 + 1 rep in più a settimana.",
    calcolaProposta: (sett, ghost, inputSettimane) => {
      const w1Ins = inputSettimane.value[1]?.ins || '';
      const numbers = estraiNumeriDaInput(w1Ins);
      const w1PesoStr = estraiPesoDaInput(w1Ins);
      const pesoVal = w1PesoStr ? parseFloat(w1PesoStr) : (ghost ? ghost.peso : 0);

      if (sett === 1) {
        return {
          text: `W1: Esegui a cedimento e scrivi le reps per calcolare la media`,
          peso: pesoVal,
          label: ghost ? ghost.label : '',
          isMetodo: true,
          metodoLabel: "W1 MED+++"
        };
      }
      if (numbers.length > 0) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = sum / numbers.length;
        const base = Math.floor(avg / 2);
        const added = sett - 1;
        const targetReps = base + added;
        return {
          text: `Target: ${targetReps} reps per serie (Base W1: ${base} + ${added} reps)`,
          peso: pesoVal,
          label: 'W1',
          isMetodo: true,
          metodoLabel: `W${sett} MED+++`
        };
      }
      return {
        text: `Target: media W1 diviso 2 + ${sett - 1} reps aggiunte`,
        peso: pesoVal,
        label: 'W1',
        isMetodo: true,
        metodoLabel: `W${sett} MED+++`
      };
    }
  },
  'D': {
    code: 'D',
    desc: "Appoggi il peso ad ogni ripetizione e riparti pulito con l'esecuzione concentrica",
    descBreve: "Deadstop: appoggia il peso ad ogni rep e riparti pulito da fermo.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Deadstop: appoggia il peso ad ogni rep e riparti da fermo`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo D"
      };
    }
  },
  't&g': {
    code: 't&g',
    desc: "Appoggi attrezzo e riparti senza perdere tensione alla catena",
    descBreve: "Touch and Go: appoggia l'attrezzo e riparti senza perdere tensione.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Touch and Go: tocca supporto e riparti senza perdere tensione`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo t&g"
      };
    }
  },
  'MSM': {
    code: 'MSM',
    desc: "Nella prima week somma i massimi secondi possibili su tutte le serie, nelle week successive aggiungi sempre 3 sec in più alla MEDIA",
    descBreve: "W1: somma max secondi possibili. Nelle successive: media + 3 sec in più a settimana.",
    calcolaProposta: (sett, ghost, inputSettimane) => {
      const w1Ins = inputSettimane.value[1]?.ins || '';
      const numbers = estraiNumeriDaInput(w1Ins);
      const w1PesoStr = estraiPesoDaInput(w1Ins);
      const pesoVal = w1PesoStr ? parseFloat(w1PesoStr) : (ghost ? ghost.peso : 0);

      if (sett === 1) {
        return {
          text: `W1: Esegui max secondi su tutte le serie e inserisci i valori`,
          peso: pesoVal,
          label: ghost ? ghost.label : '',
          isMetodo: true,
          metodoLabel: "W1 MSM"
        };
      }
      if (numbers.length > 0) {
        const sum = numbers.reduce((a, b) => a + b, 0);
        const avg = sum / numbers.length;
        const added = (sett - 1) * 3;
        const targetSec = Math.round(avg + added);
        return {
          text: `Target: ${targetSec}s (Media W1: ${avg.toFixed(0)}s + ${added}s)`,
          peso: pesoVal,
          label: 'W1',
          isMetodo: true,
          metodoLabel: `W${sett} MSM`
        };
      }
      return {
        text: `Target: media secondi W1 + ${(sett - 1) * 3} secondi`,
        peso: pesoVal,
        label: 'W1',
        isMetodo: true,
        metodoLabel: `W${sett} MSM`
      };
    }
  },
  'am': {
    code: 'am',
    desc: "Dopo il riscaldamento fai una serie col massimo di ripetizioni possibili (con x% del carico massimale). POI COMUNICAMI QUANTE REPS SEI RIUSCITO A FARE CON QUEL PESO!",
    descBreve: "AMRAP: esegui una serie a massime reps possibili con il carico stabilito.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `AMRAP: dopo il riscaldamento, esegui max reps possibili`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo am"
      };
    }
  },
  'MAXSEC': {
    code: 'MAXSEC',
    desc: "Nella prima week massimi secondi possibili, nelle week successive aggiungi sempre 5 sec in più",
    descBreve: "W1: max secondi possibili. Nelle successive: secondi W1 + 5 sec in più a settimana.",
    calcolaProposta: (sett, ghost, inputSettimane) => {
      const w1Ins = inputSettimane.value[1]?.ins || '';
      const numbers = estraiNumeriDaInput(w1Ins);
      const w1PesoStr = estraiPesoDaInput(w1Ins);
      const pesoVal = w1PesoStr ? parseFloat(w1PesoStr) : (ghost ? ghost.peso : 0);

      if (sett === 1) {
        return {
          text: `W1: Esegui max secondi possibili e scrivi il valore`,
          peso: pesoVal,
          label: ghost ? ghost.label : '',
          isMetodo: true,
          metodoLabel: "W1 MAXSEC"
        };
      }
      if (numbers.length > 0) {
        const base = numbers[0];
        const added = (sett - 1) * 5;
        const targetSec = base + added;
        return {
          text: `Target: ${targetSec}s (W1: ${base}s + ${added}s)`,
          peso: pesoVal,
          label: 'W1',
          isMetodo: true,
          metodoLabel: `W${sett} MAXSEC`
        };
      }
      return {
        text: `Target: secondi W1 + ${(sett - 1) * 5} secondi`,
        peso: pesoVal,
        label: 'W1',
        isMetodo: true,
        metodoLabel: `W${sett} MAXSEC`
      };
    }
  },
  'DT⏳': {
    code: 'DT⏳',
    desc: "In Dropset: Dopo la serie pesante, riduci le ripetizioni e fai ripetizioni lentissime in discesa (fase negativa), poi riduci ancora il peso e fai ripetizioni lentissime in salita (fase positiva)",
    descBreve: "Dropset DT⏳: dopo la serie pesante, cala peso e fai negative lentissime, ricala e fai positive lentissime.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `Dropset DT⏳: serie pesante, poi cala e fai negative lente, poi positive lente`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo DT⏳"
      };
    }
  },
  'RP++': {
    code: 'RP++',
    desc: "La prima serie è sempre a cedimento senza rest pause. Dalla seconda in poi, dopo le x reps fai una pausa di 15–20 sec e aggiungi una mini-serie a cedimento con lo stesso peso. Ogni serie successiva aggiunge un blocco “pausa + cedimento” in più.",
    descBreve: "S1 cedimento. Dalla S2+: rest-pause + cedimento. Ogni serie aggiunge un blocco rest-pause.",
    calcolaProposta: (sett, ghost) => {
      return {
        text: `RP++: S1 cedimento. S2+ rest-pause + cedimento. Ogni serie aggiunge un blocco`,
        peso: ghost ? ghost.peso : 0,
        label: ghost ? ghost.label : '',
        isMetodo: true,
        metodoLabel: "Metodo RP++"
      };
    }
  }
};

// Helper to format numbers with comma as decimal separator (Italian locale)
function formatWeight(val) {
  if (val === null || val === undefined || val === '') return '';
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(',', '.'));
  if (isNaN(num)) return String(val).replace('.', ',');
  // Arrotonda a max 1 decimale (es. 86.25 -> 86.3, 0.899999 -> 0.9)
  const rounded = Math.round(num * 10) / 10;
  return String(rounded).replace('.', ',');
}

// Helper to format repetitions with 'r' suffix (using comma for decimals)
function formatRepsDisplay(val) {
  if (val === null || val === undefined) return '-';
  const str = String(val).replace('.', ',').trim();
  if (!str || str === '-' || str === '0' || str === '0r') return '-';
  if (str.toLowerCase().endsWith('r')) return str;
  return str + 'r';
}

const getGhostLift = (sett) => {
  if (!workout.value) return null;

  // Se è un esercizio a corpo libero con reps in aumento, senza onda e senza scarico in W4, ed è SENZA PESO, il Ghost non consiglia nulla
  if (isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value) {
    const r1 = getRepsForWeek(1);
    const r2 = getRepsForWeek(2);
    const r3 = getRepsForWeek(3);
    const r4 = getRepsForWeek(4);
    const r5 = getRepsForWeek(5);
    const r6 = getRepsForWeek(6);
    
    const repsInAumento = (r2 !== null && r1 !== null && r2 > r1) ||
                          (r3 !== null && r2 !== null && r3 > r2) ||
                          (r4 !== null && r3 !== null && r4 > r3) ||
                          (r5 !== null && r4 !== null && r5 > r4) ||
                          (r6 !== null && r5 !== null && r6 > r5);
                          
    const hasOnda = isOndaProgression(workout.value);
    const hasScaricoW4 = r4 !== null && r3 !== null && r4 < r3;
    
    if (repsInAumento && !hasOnda && !hasScaricoW4) {
      return null;
    }
  }

  // 1. Controlla se c'è un metodo attivo configurato in des_estesa_start
  if (workout.value.des_estesa_start) {
    const startDesc = String(workout.value.des_estesa_start).trim().toLowerCase();
    let matchingMetodo = null;
    
    for (const [key, metodo] of Object.entries(METODI_ALLENAMENTO)) {
      const cleanDesc = metodo.desc.trim().toLowerCase();
      if (startDesc.includes(cleanDesc) || cleanDesc.includes(startDesc)) {
        matchingMetodo = metodo;
        break;
      }
    }
    
    if (matchingMetodo) {
      const ghostStandard = getGhostLiftStandard(sett);
      return matchingMetodo.calcolaProposta(sett, ghostStandard, inputSettimane, workout);
    }
  }

  return getGhostLiftStandard(sett);
};

const hasCoachLoad = (str) => {
  if (!str) return false;
  const cleanStr = pulisciParentesiQuadre(str);
  const parts = cleanStr.split('|');
  if (parts.length >= 2) {
    const part2 = parts[1].trim();
    const cleanPart2 = part2.replace(/KG/i, '').trim();
    const peso = parseFloat(cleanPart2.replace(',', '.'));
    if (!isNaN(peso) && peso > 0) return true;
  }
  const extracted = parseFloat(estraiPesoDaInput(str));
  return !isNaN(extracted) && extracted > 0;
};

const getGhostLiftStandard = (sett) => {
  if (!workout.value) return null;

  const prescrizione = String(workout.value['des_week' + sett] || '');

  // Se la settimana o l'esercizio è a percentuale, non proponiamo il carico ombra (Caso 1)
  const hasPercFlag = workout.value.flg_perc && String(workout.value.flg_perc).includes('V%');
  if (prescrizione.includes('%') || hasPercFlag) {
    return null;
  }

  // Quando un esercizio è di forza e già impostato nelle settimane col carico, il Ghost non consiglia nulla ma segnala Coach Set
  const isStrengthEx = !!parsedRmt(workout.value.des_esercizio_2);
  if (isStrengthEx && hasCoachLoad(prescrizione)) {
    return {
      isCoachSet: true,
      text: 'Impostato dal Coach',
      label: 'Coach Set',
      peso: 0,
      isRepExercise: false
    };
  }

  // Rileva se è un esercizio a corpo libero (reps, non kg) o incentrato sul volume SENZA peso inserito
  const isRepEx = isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value;

  // Per la Week 1, proponiamo in base al miglior carico del mesociclo precedente (num_ins6) o fallback
  if (sett === 1) {
    if (!previousWorkout.value) return null;
    const p = propostaWeek1.value;
    if (!p) return null;

    if (p.erroreCarichi) {
      return {
        isWeek1: true,
        isRepExercise: isRepEx,
        erroreCarichi: true,
        text: '?',
        peso: 0,
        suggerito: null,
        label: 'N/D',
        proposta: p,
        schedaPrec: previousWorkout.value.num_scheda
      };
    }

    const recordVal = sfidaRecordWeek1.value ? ottieniRecordStoricoPerReps(p.currReps) : null;

    return { 
      text: String(p.prevPeso), 
      peso: p.prevPeso, 
      label: p.settimanaBase === 6 ? 'W6 Prec.' : `W${p.settimanaBase} Prec.`,
      isWeek1: true,
      isRepExercise: isRepEx,
      reps: p.prevReps,
      currReps: p.currReps,
      suggerito: isRepEx ? null : p.peso,
      giorni: p.giorniTrascorsi,
      fatica: p.fatica,
      proposta: p,
      schedaPrec: previousWorkout.value.num_scheda,
      stimaMenoAccurata: p.stimaMenoAccurata,
      recordVal: recordVal,
      sfidaRecordWeek1: sfidaRecordWeek1.value
    };
  }

  // Rileva si ci sono parentesi quadre in una qualsiasi delle settimane
  let haParentesiQuadre = false;
  for (let w = 1; w <= 6; w++) {
    const presc = String(workout.value['des_week' + w] || '');
    if (presc.includes('[') || presc.includes(']')) {
      haParentesiQuadre = true;
      break;
    }
  }

  if (haParentesiQuadre) {
    // CASO 2: Presenza di parentesi quadre (Logica attuale con dicitura overload se reps scendono, tranne per week 4 che viene esclusa)
    if (sett === 4) return null;

    // Rileva vincoli espliciti di carico (es. [K W1], [KG W1] o [Kg W1]) in modo non case-sensitive.
    const matchKgW = prescrizione.match(/\[\s*KG?\s*W\s*(\d+)\s*\]?/i);
    if (matchKgW) {
      const targetW = parseInt(matchKgW[1], 10);
      const targetIns = inputSettimane.value[targetW]?.ins || '';
      const pesoStr = estraiPesoDaInput(targetIns);
      return {
        text: pesoStr ? targetIns : '?', // Se la settimana di riferimento è vuota, mostra un punto di domanda
        peso: pesoStr ? parseFloat(pesoStr) : 0,
        label: `W${targetW}`,
        isMandatory: true,
        mandatoryLabel: `USA LO STESSO PESO DI W${targetW}`
      };
    }

    // Scansione all'indietro per trovare l'ultima settimana con un input registrato (per coprire tutte le week vuote)
    let lastLoggedWeek = null;
    let prevIns = null;
    let prevPeso = null;

    if (sett > 1) {
      for (let w = sett - 1; w >= 1; w--) {
        const insVal = inputSettimane.value[w]?.ins;
        if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
          const peso = parseFloat(estraiPesoDaInput(insVal));
          if (!isNaN(peso) && peso > 0) {
            lastLoggedWeek = w;
            prevIns = insVal;
            prevPeso = peso;
            break; // Trovata l'esecuzione valida più recente!
          }
        }
      }
    }

    // Se abbiamo trovato una settimana precedente loggata, controlliamo se c'è un drop di ripetizioni
    if (lastLoggedWeek) {
      const prevPrescStr = workout.value['des_week' + lastLoggedWeek];
      const currPrescStr = workout.value['des_week' + sett];
      
      const prevReps = estraiRepsDaPrescrizione(prevPrescStr);
      const currReps = estraiRepsDaPrescrizione(currPrescStr);
      
      if (prevReps && currReps && currReps < prevReps) {
        return {
          text: prevIns,
          peso: prevPeso,
          label: `W${lastLoggedWeek}`,
          isOverload: true,
          overloadText: `Aumenta peso, metti più di `
        };
      }
    }

    // Fallback: Proponiamo l'ultima settimana loggata trovata
    if (prevIns) {
      return { text: prevIns, peso: prevPeso, label: `W${lastLoggedWeek}`, isRepExercise: isRepEx };
    }

    return null;
  } else {
    // CASO 3: Caso normale (senza parentesi quadre)

    // Proposta specifica per Week 2 (configurabile)
    if (sett === 2) {
      if (regolaProgressioneW2.value === 'scritta' && !isRepEx) {
        const w1Ins = inputSettimane.value[1]?.ins || '';
        return {
          text: w1Ins,
          peso: 0,
          label: 'W1',
          isWeek2Scritta: true,
          isRepExercise: false
        };
      }

      const baseW = propostaBaseWeek2.value; // "W1" o "W6 Prec."
      
      if (baseW === 'W6 Prec.') {
        if (previousWorkout.value) {
          const prevW6Text = previousWorkout.value.num_ins6 || inputSettimanePrecedente.value[6]?.ins || previousWorkout.value.ins_week6;
          if (prevW6Text) {
            const proposedVal = proponiProgressioneCaricoRIR(2, 6, String(prevW6Text));
            if (proposedVal !== null) {
              return { text: String(prevW6Text), peso: proposedVal, label: 'W6 Prec.' };
            }
          }
        }
      }
      
      // Default: propone W1
      const w1Ins = inputSettimane.value[1]?.ins;
      if (w1Ins) {
        // Per corpo libero, propone il testo di W1 senza calcolo kg
        if (isRepEx) return { text: w1Ins, peso: 0, label: 'W1', isRepExercise: true };
        const proposedVal = proponiProgressioneCaricoRIR(2, 1, w1Ins);
        if (proposedVal !== null) {
          return { text: w1Ins, peso: proposedVal, label: 'W1', isRepExercise: false };
        }
      }
    }

    // Proposta specifica per Week 3
    if (sett === 3) {
      const w2Ins = inputSettimane.value[2]?.ins;
      if (w2Ins) {
        if (isRepEx) return { text: w2Ins, peso: 0, label: 'W2', isRepExercise: true };
        const proposedVal = proponiProgressioneCaricoRIR(3, 2, w2Ins);
        if (proposedVal !== null) {
          return { text: w2Ins, peso: proposedVal, label: 'W2', isRepExercise: false };
        }
      }
    }

    // Proposta specifica per Week 4 (Scarico) - se isWeek4Scarico, propone W2
    // Per corpo libero (reps in crescita), W4 NON è scarico → propone W3 come qualsiasi altra settimana
    if (sett === 4 && isWeek4Scarico.value) {
      if (isRepEx) {
        // Corpo libero: usa W3 (sett - 1), come progressione normale
        const w3Ins = inputSettimane.value[3]?.ins;
        if (!w3Ins) return null;
        return { text: w3Ins, peso: 0, label: 'W3', isRepExercise: true };
      }

      const w2Ins = inputSettimane.value[2]?.ins;
      if (!w2Ins) return null;
      const pesoStrW2 = estraiPesoDaInput(w2Ins);
      if (!pesoStrW2) return null;
      const pesoBase = parseFloat(pesoStrW2);
      
      const repsBase = workout.value['reps_week2'] ? parseInt(workout.value['reps_week2'], 10) : (estraiRepsDaPrescrizione(workout.value['des_week2']) || 10);
      const repsTarget = workout.value['reps_week4'] ? parseInt(workout.value['reps_week4'], 10) : (estraiRepsDaPrescrizione(workout.value['des_week4']) || 10);
      const isCorpoLiberoRepsSalgono = (isCorpoLiberoEsercizio(workout.value) && !haPesoEsercizio.value) && repsTarget > repsBase;
      
      return { 
        text: w2Ins, 
        peso: pesoBase, 
        label: 'W2', 
        isScarico: !isCorpoLiberoRepsSalgono,
        isRepExercise: isRepEx
      };
    }

    // Proposta specifica per Week 5 (configurabile)
    if (sett === 5) {
      // Per corpo libero (rep exercise), usa sempre W4 (settimana precedente), non la base configurata
      if (isRepEx) {
        const w4Ins = inputSettimane.value[4]?.ins;
        if (!w4Ins) return null;
        return { text: w4Ins, peso: 0, label: 'W4', isRepExercise: true };
      }

      const baseW = propostaBaseWeek5.value; // e.g. "W3"
      const baseWNum = parseInt(baseW.replace('W', ''), 10) || 3;
      const baseIns = inputSettimane.value[baseWNum]?.ins;
      if (!baseIns) return null;
      const pesoStrBase = estraiPesoDaInput(baseIns);
      if (!pesoStrBase) return null;
      const pesoBase = parseFloat(pesoStrBase);
      
      // Se c'è stato lo scarico alla W4, proponiamo di aumentare il peso rispetto alla base selezionata
      if (isWeek4Scarico.value) {
        const isManubri = isManubriEsercizio(workout.value);
        const step = getWeightStep(isManubri, pesoBase);
        
        let pesoProposto;
        if (modalitaIncrementoGhost.value === 'ibrida') {
          const pct = calcolaIncrementoDinamicoMedio(5);
          const pesoDinamico = pesoBase * (1 + pct);
          let pesoFisso;
          if (isManubri) {
            const incremento = pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value;
            pesoFisso = pesoBase + incremento;
          } else {
            const incremento = pesoBase * (INCREMENTO_PESO_POST_SCARICO_PCT.value / 100);
            pesoFisso = pesoBase + incremento;
          }
          pesoProposto = (0.5 * pesoDinamico) + (0.5 * pesoFisso);
        } else if (modalitaIncrementoGhost.value === 'dinamica') {
          const pct = calcolaIncrementoDinamicoMedio(5);
          pesoProposto = pesoBase * (1 + pct);
        } else {
          if (isManubri) {
            const incremento = pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value;
            pesoProposto = pesoBase + incremento;
          } else {
            const incremento = pesoBase * (INCREMENTO_PESO_POST_SCARICO_PCT.value / 100);
            pesoProposto = pesoBase + incremento;
          }
        }
        
        pesoProposto = Math.round(pesoProposto / step) * step;
        if (pesoProposto <= pesoBase) {
          pesoProposto = pesoBase + (isManubri ? (pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value) : 1.25);
        }
        
        // Attacco al Record Storico anche su W5 se configurato
        if (ghostPRAttackAttivo.value) {
          const repsTarget = workout.value['reps_week5'] ? parseInt(workout.value['reps_week5'], 10) : (estraiRepsDaPrescrizione(workout.value['des_week5']) || 10);
          const recordVal = ottieniRecordStoricoPerReps(repsTarget);
          if (recordVal && recordVal > 0) {
            if (pesoProposto < recordVal && (pesoProposto >= recordVal * 0.95 || pesoProposto >= recordVal - 2.5)) {
              pesoProposto = Math.round((recordVal + step) / step) * step;
            }
          }
        }

        if (!consenteProgressioneIntensita(workout.value, 5)) {
          pesoProposto = pesoBase;
        }

        if (isManubri) {
          pesoProposto = arrotondaManubrioCommerciale(pesoProposto);
        }
        
        // Se a corpo libero e le reps salgono tra la base e W5, non proponiamo aumento peso post-scarico (isPostScarico: false)
        const repsBase = workout.value['reps_week' + baseWNum] ? parseInt(workout.value['reps_week' + baseWNum], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWNum]) || 10);
        const repsTarget = workout.value['reps_week' + 5] ? parseInt(workout.value['reps_week' + 5], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + 5]) || 10);
        
        if (isRepEx && repsTarget > repsBase) {
          return {
            text: baseIns,
            peso: pesoBase,
            label: baseW,
            isPostScarico: false,
            isRepExercise: true
          };
        }
        
        return {
          text: baseIns,
          peso: pesoBase,
          label: baseW,
          isPostScarico: true,
          pesoProposto: pesoProposto,
          isRepExercise: isRepEx
        };
      }
      
      if (isRepEx) return { text: baseIns, peso: 0, label: baseW, isRepExercise: true };
      const proposedVal = proponiProgressioneCaricoRIR(5, baseWNum, baseIns);
      return { text: baseIns, peso: proposedVal !== null ? proposedVal : pesoBase, label: baseW, isRepExercise: false };
    }

    // Proposta specifica per Week 6 (configurabile)
    if (sett === 6) {
      const baseW = propostaBaseWeek6.value; // e.g. "W5"
      const baseWNum = parseInt(baseW.replace('W', ''), 10) || 5;
      const baseIns = inputSettimane.value[baseWNum]?.ins;
      if (!baseIns) return null;
      if (isRepEx) return { text: baseIns, peso: 0, label: baseW, isRepExercise: true };
      const pesoStrBase = estraiPesoDaInput(baseIns);
      if (!pesoStrBase) return null;
      const pesoBase = parseFloat(pesoStrBase);
      
      const isManubri = isManubriEsercizio(workout.value);
      const step = getWeightStep(isManubri, pesoBase);
      
      let pesoProposto;
      if (modalitaIncrementoGhost.value === 'ibrida') {
        const pct = calcolaIncrementoDinamicoMedio(6);
        const pesoDinamico = pesoBase * (1 + pct);
        let pesoFisso;
        if (isManubri) {
          const incremento = pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value;
          pesoFisso = pesoBase + incremento;
        } else {
          const incremento = pesoBase * (INCREMENTO_PESO_POST_SCARICO_PCT.value / 100);
          pesoFisso = pesoBase + incremento;
        }
        pesoProposto = (0.5 * pesoDinamico) + (0.5 * pesoFisso);
      } else if (modalitaIncrementoGhost.value === 'dinamica') {
        const pct = calcolaIncrementoDinamicoMedio(6);
        pesoProposto = pesoBase * (1 + pct);
      } else {
        if (isManubri) {
          const incremento = pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value;
          pesoProposto = pesoBase + incremento;
        } else {
          const incremento = pesoBase * (INCREMENTO_PESO_POST_SCARICO_PCT.value / 100);
          pesoProposto = pesoBase + incremento;
        }
      }
      
      pesoProposto = Math.round(pesoProposto / step) * step;
      if (pesoProposto <= pesoBase) {
        pesoProposto = pesoBase + (isManubri ? (pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value) : 1.25);
      }

      // Attacco al Record Storico su W6
      if (ghostPRAttackAttivo.value) {
        const repsTarget = workout.value['reps_week6'] ? parseInt(workout.value['reps_week6'], 10) : (estraiRepsDaPrescrizione(workout.value['des_week6']) || 10);
        const recordVal = ottieniRecordStoricoPerReps(repsTarget);
        if (recordVal && recordVal > 0) {
          if (pesoProposto < recordVal && (pesoProposto >= recordVal * 0.95 || pesoProposto >= recordVal - 2.5)) {
            pesoProposto = Math.round((recordVal + step) / step) * step;
          }
        }
      }

      if (!consenteProgressioneIntensita(workout.value, 6)) {
        pesoProposto = pesoBase;
      }

      if (isManubri) {
        pesoProposto = arrotondaManubrioCommerciale(pesoProposto);
      }
      
      // Se a corpo libero e le reps salgono tra la base e W6, non proponiamo aumento peso (isPostScarico: false)
      const repsBase = workout.value['reps_week' + baseWNum] ? parseInt(workout.value['reps_week' + baseWNum], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + baseWNum]) || 10);
      const repsTarget = workout.value['reps_week' + 6] ? parseInt(workout.value['reps_week' + 6], 10) : (estraiRepsDaPrescrizione(workout.value['des_week' + 6]) || 10);
      
      if (isRepEx && repsTarget > repsBase) {
        return {
          text: baseIns,
          peso: pesoBase,
          label: baseW,
          isPostScarico: false,
          isRepExercise: true
        };
      }
      
      return {
        text: baseIns,
        peso: pesoBase,
        label: baseW,
        isPostScarico: true,
        pesoProposto: pesoProposto,
        isRepExercise: isRepEx
      };
    }

    // Per le altre week (4 non scarico): propone la settimana precedente (sett - 1)
    const prevIns = inputSettimane.value[sett - 1]?.ins;
    if (!prevIns) return null;
    // Per corpo libero, propone il testo della settimana precedente senza parsing kg
    if (isRepEx) return { text: prevIns, peso: 0, label: `W${sett - 1}`, isRepExercise: true };
    const pesoStr = estraiPesoDaInput(prevIns);
    if (!pesoStr) return null;
    return { text: prevIns, peso: parseFloat(pesoStr), label: `W${sett - 1}`, isRepExercise: false };
  }
};

const getGhostStatus = (sett) => {
  const currentInput = inputSettimane.value[sett]?.ins;
  if (!currentInput || !String(currentInput).trim()) return 'empty';

  const ghost = getGhostLiftSmart(sett);
  if (!ghost) return 'filled'; // Inserito ma senza record o a % (sarà Arancione)
  // Se è un overload (aumento peso consigliato) e non c'è input corrente, evidenzia verde
  if (ghost.isOverload && !currentInput) return 'up';

  if (sett === 1) return 'up'; // Week 1 sempre verde come concordato

  // Esercizi a corpo libero: confronta le reps estratte dal testo
  if (ghost.isRepExercise) {
    const currentReps = parseFloat(String(currentInput).replace(/,/g, '.').trim());
    const ghostReps = parseFloat(String(ghost.text).replace(/,/g, '.').trim());
    if (!isNaN(currentReps) && !isNaN(ghostReps)) {
      return currentReps > ghostReps ? 'up' : 'down';
    }
    return 'up'; // Se non riusciamo a confrontare, considera positivo
  }

  const currentPesoStr = estraiPesoDaInput(currentInput);
  if (!currentPesoStr) return 'filled';
  const currentPeso = parseFloat(currentPesoStr);
  if (isNaN(currentPeso) || currentPeso <= 0) return 'filled';

  const targetReps = getRepsPerWeek(sett);
  const currentReps = estraiRepsDaInput(currentInput) || targetReps;

  const baseInfo = getBaseWeekInfo(sett);
  const refPesoStr = estraiPesoDaInput(baseInfo?.baseInsText || ghost.text);
  const refPeso = refPesoStr ? parseFloat(refPesoStr) : (ghost.peso || 0);
  const refReps = baseInfo?.repsBase || 10;

  // 1. Controllo se nella scheda attuale a pari targetReps esiste una settimana precedente di confronto (es. W3 vs W6)
  let prevSameTargetRecord = null;
  if (inputSettimane.value && sett > 1) {
    for (let w = 1; w < sett; w++) {
      const wTarget = getRepsPerWeek(w);
      if (wTarget === targetReps) {
        const insPrev = inputSettimane.value[w]?.ins;
        if (insPrev) {
          const pPrev = parseFloat(estraiPesoDaInput(insPrev)) || 0;
          let rPrev = estraiRepsDaInput(insPrev);
          if (rPrev === null || isNaN(rPrev) || rPrev <= 0) rPrev = wTarget;
          if (pPrev > 0) {
            if (!prevSameTargetRecord || pPrev > prevSameTargetRecord.peso || (pPrev === prevSameTargetRecord.peso && rPrev > prevSameTargetRecord.reps)) {
              prevSameTargetRecord = { week: w, peso: pPrev, reps: rPrev };
            }
          }
        }
      }
    }
  }

  // Se c'è una settimana precedente a pari reps target (es. W3 con 12kg x 10r per W6 con 10r):
  // Se pareggiamo esattamente o siamo sotto a quel record, è 'down' (BLU).
  if (prevSameTargetRecord && prevSameTargetRecord.peso > 0) {
    if (currentPeso < prevSameTargetRecord.peso) {
      // Peso inferiore al record a pari reps: controlliamo se l'e1RM ha compensato in modo eccezionale
      const currentE1RM = currentPeso * (1 + currentReps / 30);
      const prevE1RM = prevSameTargetRecord.peso * (1 + prevSameTargetRecord.reps / 30);
      return currentE1RM > prevE1RM + 0.05 ? 'up' : 'down';
    } else if (currentPeso === prevSameTargetRecord.peso) {
      // Stesso peso del record a pari reps: solo se facciamo più reps è 'up' (verde), altrimenti 'down' (blu)
      return currentReps > prevSameTargetRecord.reps ? 'up' : 'down';
    } else {
      // Carico strettamente superiore al record a pari reps: se chiuse almeno a target reps è 'up'
      const currentE1RM = currentPeso * (1 + currentReps / 30);
      const prevE1RM = prevSameTargetRecord.peso * (1 + prevSameTargetRecord.reps / 30);
      return currentE1RM >= prevE1RM ? 'up' : 'down';
    }
  }

  // 2. Confronto standard con la settimana di riferimento (baseW / W-1)
  if (refPeso > 0) {
    if (currentPeso > refPeso) {
      // Più peso: verifica che l'e1RM non sia crollato a causa di reps dimezzate
      const currentE1RM = currentPeso * (1 + currentReps / 30);
      const refE1RM = refPeso * (1 + refReps / 30);
      return (currentE1RM >= refE1RM * 0.95) ? 'up' : 'down';
    } else if (currentPeso === refPeso) {
      // Stesso peso: verde solo se ci sono più ripetizioni rispetto alla settimana base
      return currentReps > refReps ? 'up' : 'down';
    } else {
      // Meno peso: verde solo se compensato con reps altissime (e1RM maggiore)
      const currentE1RM = currentPeso * (1 + currentReps / 30);
      const refE1RM = refPeso * (1 + refReps / 30);
      return currentE1RM > refE1RM + 0.05 ? 'up' : 'down';
    }
  }

  return 'up';
};

const getGhostFieldClass = (sett) => {
  const status = getGhostStatus(sett);
  if (status === 'up') return 'ghost-glow-green';
  if (status === 'down') return 'ghost-glow-blue';
  if (status === 'filled') return 'ghost-glow-orange';
  return ''; // Resta grigio spento solo se completamente vuoto
};

const getRepFormattingSuggestion = (sett) => {
  if (!workout.value) return null;
  const val = inputSettimane.value[sett]?.ins;
  if (!val) return null;
  const clean = String(val).trim();
  if (!clean || clean === '-') return null;

  // Caso 1: Test AMRAP / Week 6 con solo carico numerico inserito (es. "65" o "65kg") senza ripetizioni
  const presc = String(workout.value['des_week' + sett] || '');
  const endNote = String(workout.value.des_estesa_end || '');
  const isAmrap = /amrap|massim[ae]\s*rip|max\s*reps?|cedimento/i.test(presc) ||
                  (sett === 6 && (/massim[ae]\s*rip|amrap/i.test(endNote) || /amrap/i.test(workout.value.des_note || '')));
  
  if (isAmrap) {
    const hasExplicitReps = /\b\d+\s*(?:r\b|reps?|rip(?:etizioni)?|colpi)\b/i.test(clean) || /\d+\s*[xX]\s*\d+/i.test(clean) || /\+\s*\d+/i.test(clean);
    const pesoStr = estraiPesoDaInput(clean);
    if (pesoStr && !hasExplicitReps) {
      const pesoFmt = pesoStr.replace('.', ',');
      return {
        text: clean,
        suggested: `${pesoFmt} x 8r`,
        message: `🎯 Test AMRAP: hai scritto solo il carico (${pesoFmt}kg). Specifica anche quante reps hai fatto (es. ${pesoFmt} x 8r)!`
      };
    }
  }

  // Caso 2: Esercizio a corpo libero / rep-based
  const ghost = getGhostLiftSmart(sett);
  if (!ghost || !ghost.isRepExercise) return null;

  // Rileva notazioni SxR come 3x12 o 4x10 (senza la 'r' finale)
  const matchSxR = clean.match(/^(\d+)\s*[xX]\s*(\d+)$/);
  if (matchSxR) {
    const s = matchSxR[1];
    const r = matchSxR[2];
    return {
      text: `${s}x${r}`,
      suggested: `${s}x${r}r`,
      message: `Hai scritto ${s}x${r}. Specificare ${r}r (${s}x${r}r)?`
    };
  }
  
  // Rileva numero singolo puro come "12"
  const matchNum = clean.match(/^(\d+)$/);
  if (matchNum) {
    const r = matchNum[1];
    return {
      text: r,
      suggested: `${r}r`,
      message: `Hai scritto ${r}. Specificare ${r}r (${r} ripetizioni)?`
    };
  }

  return null;
};

const applicaSuggerimentoFormattazioneReps = (sett, suggestedText) => {
  vibraTattile(12);
  if (inputSettimane.value[sett]) {
    inputSettimane.value[sett].ins = suggestedText;
    localEditingIns.value[sett] = suggestedText;
    salvaDatoSettimanale(sett, 'ins');
    snackbarMessaggio.value = `Formattato in ${suggestedText}!`;
    snackbarSalvataggio.value = true;
  }
};

function estraiRpeDaInput(str) {
  if (!str) return null;
  const match = String(str).match(/\b(?:rpe|r\.p\.e\.)\s*:?\s*@?\s*(\d+(?:[\.,]\d+)?)(?:\s*[\-\/]\s*(\d+(?:[\.,]\d+)?))?/i);
  if (!match) return null;
  let val1 = parseFloat(match[1].replace(',', '.'));
  let val2 = match[2] ? parseFloat(match[2].replace(',', '.')) : val1;
  if (isNaN(val1)) return null;
  
  if (val1 > 10) val1 = val1 / 10;
  if (val2 > 10) val2 = val2 / 10;
  
  return Math.max(val1, val2);
}

function estraiRepsDaInputExplicitSingle(str) {
  if (!str) return null;
  let clean = String(str).toLowerCase().replace(/,/g, '.').trim();
  
  // Rimuove QUALSIASI contenuto tra parentesi tonde (...), quadre [...] o graffe {...} per evitare che note o impostazioni influenzino i calcoli
  clean = clean.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\{[^}]*\}/g, ' ').trim();

  // 1. Rimuove TUT, RPE, tempi di recupero e impostazioni
  clean = clean.replace(/\b(?:tut|t\.u\.t\.)\s*:?\s*@?\s*\d*(?:\s*[\-\/\.]?\s*\d+)*/gi, ' ').trim();
  clean = clean.replace(/\b(?:rpe|r\.p\.e\.)\s*:?\s*@?\s*\d+(?:[\.,]\d+)?(?:\s*[\-\/]\s*\d+(?:[\.,]\d+)?)*/gi, ' ').trim();
  clean = clean.replace(/\b\d+(?:\.\d+)?\s*(?:sec|secondi|sec\.?|s|rec|recupero|min|minuti)\b/gi, ' ').trim();
  clean = clean.replace(/\b(?:pin|buco|buca|foro|tacca|altezza|pos|step|livello)\b\s*\d+(?:\.\d+)?/gi, '').trim();

  // 2. Rimuove COMPLETAMENTE diciture Rest-Pause, Drop-Set, Cluster (es. "rp20", "rp 15", "+2r RP", "47,6x4+2r RP", "RP+3")
  // I numeri associati a RP non sono ripetizioni standard della serie e non devono MAI inquinare il calcolo di reps, carichi o PR
  clean = clean.replace(/(?:\+|\bpoi\b)?\s*(?:rp|rest\s*pause|drop\s*set|cluster)\s*(?:fino\s*a\s*)?:?\s*@?\s*\+?\s*\d+(?:[\.,]\d+)?(?:\s*(?:sec|secondi|s|r|reps?|rip))?/gi, ' ').trim();
  clean = clean.replace(/\+\s*\d+(?:[\.,]\d+)?\s*(?:r|reps?)?\s*(?:rp|rest\s*pause)/gi, ' ').trim();
  clean = clean.replace(/\b(?:rp|rest\s*pause|drop\s*set|cluster)\b/gi, ' ').trim();

  // 2a. Riconoscimento speciale "fatte [reps] [peso]" (es. "Fatte 15 3,75", "fatte 15 da 3.75", "fatto 12 con 50")
  const matchFatteRepsWeight = clean.match(/\b(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s+(\d+(?:\.\d+)?)\s*(?:a|da|con|@)?\s+(\d+(?:\.\d+)?)\s*(?:kg)?\b/i);
  if (matchFatteRepsWeight) {
    const r = parseFloat(matchFatteRepsWeight[1]);
    if (!isNaN(r) && r > 0 && r <= 100) {
      return { val: Math.round(r), explicit: true };
    }
  }

  // 2b. Riconoscimento speciale "[peso] fatte [reps]" (es. "3,75 fatte 19", "3.75 fatte 19", "3,75 fatte a 19", "50 fatte 12")
  const matchWeightFatteReps = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:kg)?\s*(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s*(?:a|da|con|@)?\s+(\d+(?:\.\d+)?)\s*(?:r|reps?|rip)?\b/i);
  if (matchWeightFatteReps) {
    const r = parseFloat(matchWeightFatteReps[2]);
    if (!isNaN(r) && r > 0 && r <= 100) {
      return { val: Math.round(r), explicit: true };
    }
  }

  // 2c. Riconoscimento speciale "fatte [reps]" singolo (es. "fatte 15", "fatto 12", "fatti 10")
  const matchFatteSingle = clean.match(/\b(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s+(\d+(?:\.\d+)?)\b/i);
  if (matchFatteSingle) {
    const r = parseFloat(matchFatteSingle[1]);
    if (!isNaN(r) && r > 0 && r <= 100) {
      return { val: Math.round(r), explicit: true };
    }
  }

  // 3. Rileva formato esplicito con suffisso reps "40x23r", "42.5x24 reps", "5x12 rip"
  const matchExplicitXWithR = clean.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)\s*(?:[rR]\b|reps?|rip(?:etizioni)?|colpi)\b/i);
  if (matchExplicitXWithR) {
    const val = parseFloat(matchExplicitXWithR[2]);
    if (!isNaN(val) && val > 0) return { val, explicit: true };
  }

  // 4. Rileva formato tipo "3x20", "4x12", "1x18" (dove il primo numero è il numero di serie [1..5] e il secondo sono le reps [>=6])
  const matchSxR = clean.match(/^\s*(\d+)\s*[xX]\s*(\d+)\s*$/);
  if (matchSxR) {
    const nSets = parseInt(matchSxR[1], 10);
    const nReps = parseInt(matchSxR[2], 10);
    if (nSets >= 1 && nSets <= 5 && nReps >= 6) {
      return { val: nReps, explicit: true };
    }
    // Se è tipo "47.5 x2" o "16 x2", il secondo numero indica le serie (2 serie) e non le reps! Non restituire reps.
    return null;
  }

  // 5. Rileva formato "47.5 x2" o "47.5 x2s" o "65 x2s" o "140 x3s" -> la seconda parte dopo 'x' senza 'r' indica le SERIE completate!
  // Escludiamo queste serie per evitare che "x2" venga scambiato per 2 ripetizioni
  const matchSets = clean.match(/\b\d+(?:\.\d+)?\s*[xX]\s*\d+\s*(?:s|set|sets|serie)?\b/i);
  if (matchSets) {
    // Se c'è una notazione di serie, rimuoviamola per vedere se ci sono altre reps esplicite nella stringa
    clean = clean.replace(matchSets[0], ' ').trim();
  }

  // 6. Rileva ripetizioni esplicite con suffissi "r", "reps", "rip" (es. "12r", "12 reps", "20r")
  const matchR = clean.match(/(\d+(?:\.\d+)?)\s*(?:[rR]\b|reps?|rip(?:etizioni)?|colpi)/i);
  if (matchR) {
    const val = parseFloat(matchR[1]);
    if (!isNaN(val) && val > 0) return { val, explicit: true };
  }

  // 7. UN NUMERO SINGOLO SENZA "r" O "reps" (es. "2", "3", "5", "12", "50") È IL CARICO IN KG!
  // Non deve MAI restituire un valore di ripetizioni esplicito qui.
  return null;
}

function estraiRepsDaInputSingle(str) {
  const res = estraiRepsDaInputExplicitSingle(str);
  return res ? res.val : null;
}

function estraiMigliorPrestazioneInput(strVal, defaultReps = 10, isCavo = false) {
  if (!strVal) return null;
  const str = String(strVal).trim();
  if (!str || str === '-') return null;

  const lines = str.split(/[\n;\r]+/);
  let bestPerf = null;
  let maxE1RM = -1;

  lines.forEach(line => {
    const l = line.trim();
    if (!l) return;
    const pesoStr = estraiPesoDaInput(l);
    if (pesoStr) {
      const peso = parseFloat(pesoStr);
      if (!isNaN(peso) && peso > 0) {
        const hasExplicitReps = /\d+\s*[rR]\b|\d+\s*[xX]\s*\d+\s*(?:[rR]\b|reps?|rip(?:etizioni)?|colpi)\b|\b\d+\s*(?:reps?|rip(?:etizioni)?|colpi)\b/i.test(l);
        const explicitReps = hasExplicitReps ? estraiRepsDaInput(l) : null;
        const reps = (explicitReps && explicitReps > 0) ? explicitReps : defaultReps;
        const e1rm = calcolaE1RMSmorzato(peso, reps, isCavo);
        if (e1rm > maxE1RM) {
          maxE1RM = e1rm;
          bestPerf = { peso, reps, e1rm };
        }
      }
    }
  });

  return bestPerf;
}

function estraiRepsDaInput(str, defaultOrTargetReps = null) {
  if (!str) return null;
  const strVal = String(str);

  // Riconoscimento "+N rep" / "+N reps" / "+Nr" (es. "14 +1 rep", "+2 reps")
  const matchDeltaReps = strVal.match(/\+\s*(\d+)\s*(?:r\b|reps?|rip(?:etizioni)?|colpi)?/i);
  if (matchDeltaReps) {
    const delta = parseInt(matchDeltaReps[1], 10);
    if (!isNaN(delta) && delta > 0 && delta <= 30) {
      if (defaultOrTargetReps && defaultOrTargetReps > 0) {
        return defaultOrTargetReps + delta;
      }
      return delta;
    }
  }

  const lines = strVal.split(/[\n;\r]+/);
  const results = lines.map(l => estraiRepsDaInputExplicitSingle(l)).filter(v => v !== null && !isNaN(v.val) && Number.isInteger(v.val) && v.val > 0 && v.val <= 50);
  if (results.length === 0) return null;
  const explicitResults = results.filter(v => v.explicit);
  if (explicitResults.length > 0) {
    return Math.max(...explicitResults.map(v => v.val));
  }
  return Math.max(...results.map(v => v.val));
}

function estraiPesoDaInput(str) {
  if (!str) return null;
  
  let clean = String(str).toLowerCase().replace(/,/g, '.').trim();
  
  // Rimuove QUALSIASI contenuto tra parentesi tonde (...), quadre [...] o graffe {...} per escludere note ed impostazioni dai calcoli
  clean = clean.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\{[^}]*\}/g, ' ').trim();
  
  // Rimuove notazioni TUT (es. "TUT323", "TUT 323", "TUT 3-2-3", "tut 511", "TUT511")
  clean = clean.replace(/\b(?:tut|t\.u\.t\.)\s*:?\s*@?\s*\d*(?:\s*[\-\/\.]?\s*\d+)*/gi, ' ').trim();

  // Rimuove espressioni di RPE (es. "Rpe: 93 - 99", "RPE 8.5", "RPE: 9-10", "rpe 93-99", "rpe@9")
  clean = clean.replace(/\b(?:rpe|r\.p\.e\.)\s*:?\s*@?\s*\d+(?:[\.,]\d+)?(?:\s*[\-\/]\s*\d+(?:[\.,]\d+)?)*/gi, ' ').trim();

  // Rimuove completamente espressioni di Rest-Pause / Drop-Set (es. "rp20", "rp 15", "+2r RP", "RP+3")
  clean = clean.replace(/(?:\+|\bpoi\b)?\s*(?:rp|rest\s*pause|drop\s*set|cluster)\s*(?:fino\s*a\s*)?:?\s*@?\s*\+?\s*\d+(?:[\.,]\d+)?(?:\s*(?:sec|secondi|s|r|reps?|rip))?/gi, ' ').trim();
  clean = clean.replace(/\+\s*\d+(?:[\.,]\d+)?\s*(?:r|reps?)?\s*(?:rp|rest\s*pause)/gi, ' ').trim();
  clean = clean.replace(/\b(?:rp|rest\s*pause|drop\s*set|cluster)\b/gi, ' ').trim();
  
  // Rimuove espressioni di impostazioni/metadati (es. "PIN 12", "buco 3", "sedile 15", "sedile a 15")
  const cleanSettingsRegex = /\b(?:pin|buco|buca|buchi|foro|fori|tacca|tacche|altezza|pos|posizione|inc|inclinazione|gradi|grado|step|level|livello|liv|regolazione|tacc|tassello|tavoletta|board|box|set|sets|serie|reps|rep|ripetizioni|rip|colpi|colpo|giro|giri|circuiti|circuito|volte|volta|passi|passo|tut|t\.u\.t\.|sedile|schienale|poggiapiede|poggiapiedi|schiena|rullo|perno|distanza|ampiezza|impugnatura|presa|busto|manubrio|cavo|puleggia|tacchetta|tacchette)\b\s*(?:a\s*)?\d+(?:\.\d+)?/gi;
  clean = clean.replace(cleanSettingsRegex, '').trim();
  
  // Rimuove gradi (es. "30°")
  clean = clean.replace(/\d+(?:\.\d+)?\s*°/g, '').trim();

  // 0a. Riconoscimento speciale "fatte [reps] [peso]" (es. "Fatte 15 3,75", "fatte 15 da 3.75", "fatto 12 con 50")
  const matchFatteRepsWeight = clean.match(/\b(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s+(\d+(?:\.\d+)?)\s*(?:a|da|con|@)?\s+(\d+(?:\.\d+)?)\s*(?:kg)?\b/i);
  if (matchFatteRepsWeight) {
    const w = parseFloat(matchFatteRepsWeight[2]);
    if (!isNaN(w) && w > 0) {
      return String(w);
    }
  }

  // 0b. Riconoscimento speciale "[peso] fatte [reps]" (es. "3,75 fatte 19", "3.75 fatte 19", "3,75 fatte a 19", "50 fatte 12")
  const matchWeightFatteReps = clean.match(/\b(\d+(?:\.\d+)?)\s*(?:kg)?\s*(?:fatte?|fatti|fatta|eseguite?|eseguiti|eseguito|completate?|completati|completato|chiuse?|chiusi|chiuso)\s*(?:a|da|con|@)?\s+(\d+(?:\.\d+)?)\s*(?:r|reps?|rip)?\b/i);
  if (matchWeightFatteReps) {
    const w = parseFloat(matchWeightFatteReps[1]);
    if (!isNaN(w) && w > 0) {
      return String(w);
    }
  }

  // Rileva formato tipo "30x12r", "30 x12r" o "3x12"
  const matchSxR = clean.match(/^\s*(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)(?:\s*([rR])?\b)?\s*$/);
  if (matchSxR) {
    const num1 = parseFloat(matchSxR[1]);
    const isExplicitKg = /kg|kgs|kgb|lbs|\+/i.test(clean);
    // Se è un numero intero piccolo (es. 1, 2, 3, 4) senza indicazione esplicita di kg,
    // in 1x13, 2x15, 3x12, 4x10 la prima cifra indica il numero di serie (sets), non i kg!
    if (isExplicitKg || num1 >= 5 || String(matchSxR[1]).includes('.')) {
      return String(num1);
    }
    return null;
  }
  
  // 1. Rimuoviamo il prefisso delle reps (es. "3x10", "4 x 12") se è [serie]x[reps]
  clean = clean.replace(/^\s*[1-5]\s*[xX]\s*\d+(?:\s*[a-zA-Z+]*\b)?/g, '').trim();
  
  // Trova tutti i numeri decimali o interi presenti nella stringa
  const numberRegex = /\d+(?:\.\d+)?/g;
  
  let match;
  const validWeights = [];
  
  // Lista di parole chiave relative ad impostazioni/macchine/metadati da escludere
  const settingKeywords = [
    'panca', 'inclinazione', 'inclinata', 'inclinato', 'buco', 'buca', 'buchi', 
    'foro', 'fori', 'tacca', 'tacche', 'tacchetta', 'tacchette', 'posizione', 'pos', 'altezza', 
    'inc', 'gradi', 'grado', '°', 'seduto', 'seduta', 'step', 'pin', 'livello', 'liv', 
    'regolazione', 'tacc', 'tassello', 'tavoletta', 'board', 'catena', 'catene', 'elastico', 
    'elastici', 'blocco', 'blocchi', 'box', 'serie', 'set', 'sets', 'reps', 'rep', 
    'ripetizioni', 'rip', 'colpi', 'colpo', 'giro', 'giri', 'circuiti', 'circuito', 
    'volte', 'volta', 'passi', 'passo', 'speed', 'velocità', 'vel', 'tempo', 'tut', 't.u.t.',
    'sedile', 'schienale', 'poggiapiede', 'poggiapiedi', 'schiena', 'rullo', 'perno', 
    'distanza', 'ampiezza', 'impugnatura', 'presa', 'busto', 'manubrio', 'cavo', 'puleggia',
    'sopra', 'sotto', 'rp', 'rest'
  ];
  
  // Stopwords da ignorare prima del numero per trovare il prefisso reale
  const stopWords = [
    'a', 'di', 'su', 'in', 'da', 'alla', 'al', 'del', 'della', 'n', 'n.', 'num', 
    'num.', 'n°', 'pos', 'pos.', '#', ':', '::', '@', 'at', 'con', 'e', 'o', 'per'
  ];

  // Helper per verificare se l'indice cade all'interno di parentesi tonde (...)
  const isInsideParentheses = (fullStr, index) => {
    const openIdx = fullStr.lastIndexOf('(', index);
    if (openIdx === -1) return false;
    const closeIdx = fullStr.indexOf(')', openIdx);
    return closeIdx > index;
  };
  
  while ((match = numberRegex.exec(clean)) !== null) {
    const numStr = match[0];
    const numVal = parseFloat(numStr);
    const startIdx = match.index;
    const endIdx = startIdx + numStr.length;
    
    if (isNaN(numVal)) continue;
    
    // 1. Analisi del Suffisso (quello che segue il numero)
    const suffixStr = clean.substring(endIdx);
    const suffixClean = suffixStr.trim();
    const isExplicitKg = suffixClean.toLowerCase().startsWith('k');
    const insideParens = isInsideParentheses(clean, startIdx);
    
    // Se c'è esplicitamente "kg" dopo il numero (es. "10kg", "10 kg", "10 k"), lo accettiamo sempre come peso
    if (isExplicitKg) {
      validWeights.push({ val: numVal, hasKg: true, isOutside: !insideParens, idx: startIdx });
      continue;
    }
    
    // Se il suffisso è ripetizioni (es. "r", "R", "reps", "rep", "rip") o serie (es. "s", "set", "sets", "serie"), lo escludiamo dal peso
    if (suffixClean.toLowerCase().match(/^r(?![a-z])/i) || 
        suffixClean.toLowerCase().startsWith('rep') || 
        suffixClean.toLowerCase().startsWith('rip') ||
        suffixClean.toLowerCase().startsWith('set') ||
        suffixClean.toLowerCase().startsWith('serie')) {
      continue;
    }
    
    // Se il suffisso inizia con il simbolo dei gradi ° o parole di configurazione/volume
    const suffixTokens = suffixClean.split(/[\s\-+:=@]+/);
    const suffixToken = (suffixTokens[0] || '').toLowerCase().trim();
    
    if (suffixClean.startsWith('°') || settingKeywords.some(word => suffixToken.includes(word) || suffixClean.toLowerCase().startsWith(word))) {
      continue; // Ignorato (è un parametro di setting o gradi o ripetizioni)
    }
    
    // Esclusioni standard per il suffisso (es. "/", "%", "rpe", "sec", "min", ecc.)
    if (suffixToken) {
      const suffixExclusions = ['/', '%', 'rpe', 'sec', 'secondi', 'secondo', 'min', 'minuti', 'minuto', 'metri', 'metro'];
      if (suffixToken.startsWith('/') || suffixExclusions.includes(suffixToken) || (suffixToken === 's' || suffixToken === 'm')) {
        continue;
      }
    }
    
    // 2. Analisi del Prefisso (quello che precede il numero)
    const prefixStr = clean.substring(0, startIdx);
    const prefixTokens = prefixStr.trim().split(/[\s\-+:=@°]+/);
    
    let prefixWord = '';
    for (let i = prefixTokens.length - 1; i >= 0; i--) {
      const token = prefixTokens[i].toLowerCase().trim();
      if (!token) continue;
      if (stopWords.includes(token)) {
        continue; // Salta le preposizioni o caratteri di stop
      }
      prefixWord = token;
      break;
    }
    
    // Se la parola significativa prima del numero è un'impostazione o rpe/rp o moltiplicatore 'x', escludiamo il numero
    if (prefixWord) {
      if (['fatte', 'fatto', 'fatti', 'fatta', 'eseguite', 'eseguiti', 'eseguito', 'completate', 'chiuse', 'chiuso'].includes(prefixWord) && !isExplicitKg) {
        continue;
      }
      if (settingKeywords.some(word => prefixWord === word || prefixWord.includes(word)) || prefixWord === 'rpe' || prefixWord === 'rp') {
        continue; // Ignorato
      }
      // Se il prefisso è 'x' (es. "47.5 x2" -> per il 2 il prefisso è 'x' o '47.5x'), il 2 è il moltiplicatore di serie/reps e non un peso
      if (prefixWord === 'x' || prefixWord.endsWith('x')) {
        continue;
      }
    }
    
    validWeights.push({ val: numVal, hasKg: false, isOutside: !insideParens, idx: startIdx });
  }
  
  if (validWeights.length > 0) {
    // 1. Se ci sono pesi con 'kg' esplicito, usiamo il massimo tra essi
    const withKg = validWeights.filter(w => w.hasKg);
    if (withKg.length > 0) {
      return String(Math.max(...withKg.map(w => w.val)));
    }

    // 2. Se ci sono pesi fuori dalle parentesi, ignoriamo quelli dentro le parentesi
    const outside = validWeights.filter(w => w.isOutside);
    if (outside.length > 0) {
      return String(Math.max(...outside.map(w => w.val)));
    }

    // 3. Fallback: massimo di tutti i pesi validi trovati
    return String(Math.max(...validWeights.map(w => w.val)));
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
      return `Dopo il riscaldamento fai una serie con le <strong>massime ripetizioni possibili</strong> con il carico reale di <strong class="text-slate-dark font-weight-black">${peso}</strong>. Scrivi quante ripetizioni sei riuscito a fare!`;
    } else {
      return `Dopo il riscaldamento fai una serie con le <strong>massime ripetizioni possibili</strong> con l'ultimo carico allenante. Scrivi quante ripetizioni sei riuscito a fare!`;
    }
  }
  
  let formatta = testo;
  const prescrizione = parsedPrescription(workout.value?.['des_week' + sett]);
  if (prescrizione && prescrizione.total) {
    const peso = prescrizione.total.trim();
    formatta = formatta.replace(/\(con x% del carico massimale\)/gi, `(con il carico reale di <strong class="text-slate-dark font-weight-black">${peso} KG</strong>)`);
    formatta = formatta.replace(/con x% del carico massimale/gi, `con il carico reale di <strong class="text-slate-dark font-weight-black">${peso} KG</strong>`);
  }
  return formatta;
};


const parsedTut = computed(() => {
  const str = workout.value?.des_esercizio_2;
  if (!str) return null;
  const match = str.match(/TUT\s*(\d)\s*[-/.]?\s*(\d)\s*[-/.]?\s*(\d)/i);
  if (match) {
    return {
      digits: `${match[1]}${match[2]}${match[3]}`,
      f1: match[1],
      f2: match[2],
      f3: match[3]
    };
  }
  return null;
});

const parsedRmt = (str) => {
  if (!str) return null;
  const regex = /(?:\(+)?\s*(\*+[¹²³⁴⁵⁶⁷⁸⁹\d]*?)\s*(?:1)?RMT?:\s*([\d,.]+)\s*KG(?:\s*~\s*([\d,.]+))?(?:\s*KG)?\s*(?:del|del\s+)?\s*([\d/]+)(?:\s*([↓↑]\s*\d+%))?\s*(?:\)+)?/i;
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
      prossimoLivello: match[3] || '',
      data: match[4],
      variazione: match[5] || ''
    };
  }
  return null;
};

const getRmtProgress = (rmt) => {
  if (!rmt || !rmt.massimale) return 0;
  if (!rmt.prossimoLivello) return 100;
  const current = parseFloat(rmt.massimale.replace(',', '.')) || 0;
  const targetDiff = parseFloat(rmt.prossimoLivello.replace(',', '.')) || 0;
  if (current + targetDiff === 0) return 0;
  return Math.round((current / (current + targetDiff)) * 100);
};

// Controlla se la settimana w è completata (cmp1-cmp6 da Riga 0)
const isWeekCompleted = (w) => {
  if (!riga0.value) return false;
  return riga0.value['cmp' + w] === 'true' || riga0.value['cmp' + w] === true || String(riga0.value['cmp' + w]).toLowerCase() === 'true';
};

// Controlla se la settimana ha dati loggati
const isWeekLogged = (w) => {
  return inputSettimane.value[w].ins || inputSettimane.value[w].reps;
};

const getTimestampUte = () => {
  const now = new Date();
  const gg = String(now.getDate()).padStart(2, '0');
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const yyyy = now.getFullYear();
  const hh = String(now.getHours()).padStart(2, '0');
  const min = String(now.getMinutes()).padStart(2, '0');
  const ss = String(now.getSeconds()).padStart(2, '0');
  return `${gg}/${mm}/${yyyy} ${hh}:${min}:${ss}`;
};

const aggiornaDatoECommit = async (updates) => {
  if (!workout.value) return;
  
  try {
    vibraTattile(20);
    const docRef = doc(db, 'STORYBOARD', routeIdLocal.value);
    
    const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
    const timestampUte = getTimestampUte();
    
    // Aggiorna oggetto reattivo locale
    for (const [campo, valore] of Object.entries(updates)) {
      workout.value[campo] = valore;
    }
    workout.value.timestamp = timestamp;
    workout.value.timestamp_ute = timestampUte;

    // Aggiorna localStorage per supporto offline
    const key1 = `offline_storyboard_${routeIdLocal.value}`;
    const localData1 = localStorage.getItem(key1);
    let currentUpdates = {};
    if (localData1) {
      try { currentUpdates = JSON.parse(localData1); } catch (e) {}
    }
    currentUpdates = { ...currentUpdates, ...updates, timestamp, timestamp_ute: timestampUte };
    localStorage.setItem(key1, JSON.stringify(currentUpdates));
    
    if (workout.value.num_riga) {
      const key2 = `offline_storyboard_${workout.value.num_riga}`;
      localStorage.setItem(key2, JSON.stringify(currentUpdates));
    }

    // Carica su Firestore inviando solo i campi modificati (evita conflitti offline/online)
    await updateDoc(docRef, { ...updates, timestamp, timestamp_ute: timestampUte });
    snackbarSalvataggio.value = true;
  } catch (error) {
    console.error("Errore salvataggio e commit:", error);
  }
};

const estraiNumeroMassimo = (str) => {
  if (!str) return null;
  const peso = estraiPesoDaInput(str);
  if (peso !== null && peso !== undefined && peso !== '') {
    const pNum = parseFloat(peso);
    if (!isNaN(pNum)) return pNum;
  }
  const cleanStr = String(str).replace(/,/g, '.');
  const matches = cleanStr.match(/\b\d+(?:\.\d+)?\b/g);
  if (matches && matches.length > 0) {
    const nums = matches.map(n => parseFloat(n)).filter(n => !isNaN(n));
    if (nums.length > 0) return Math.max(...nums);
  }
  return null;
};

// Salva dato settimanale al blur
const salvaDatoSettimanale = async (settimana, tipo) => {
  if (!workout.value) return;

  // Smart Note Cleanup (Opzione 3 Coach): pulizia automatica al salvataggio
  if (tipo === 'ins' && smartNoteCleanupGlobal.value && inputSettimane.value[settimana]?.ins) {
    const cleaned = formattaECleanupNota(inputSettimane.value[settimana].ins);
    inputSettimane.value[settimana].ins = cleaned;
  }

  const campo = `${tipo}_week${settimana}`;
  const valoreOriginale = workout.value[campo] || '';
  const valoreNuovo = inputSettimane.value[settimana][tipo];

  if (valoreOriginale !== valoreNuovo) {
    const updates = { [campo]: valoreNuovo };
    
    // Auto-estrazione per la week 6 (solo se l'esercizio è eligibile per feedback W6)
    if (settimana === 6 && tipo === 'ins' && isEsercizioEligibileW6(workout.value)) {
      const valStr = String(valoreNuovo || '').trim();
      if (valStr) {
        const estratto = estraiNumeroMassimo(valStr);
        if (estratto !== null) {
          if (!numIns6ModificatoManualmente.value) {
            numIns6Val.value = String(estratto);
            updates.num_ins6 = String(estratto);
          }
        }
        // Se l'utente inserisce un peso ma non ha ancora scelto la fatica, mostra la modale
        if (!numFaticaw6Val.value) {
          dialogAvvisoFaticaW6.value = true;
        }
      } else {
        // Se l'utente cancella tutto nel campo ins_ in W6, cancella SEMPRE anche miglior carico (insw6) e sforzo percepito
        numIns6Val.value = '';
        updates.num_ins6 = '';
        numFaticaw6Val.value = '';
        updates.num_faticaw6 = '';
        numIns6ModificatoManualmente.value = false;
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
  numIns6ModificatoManualmente.value = true;
  vibraTattile(10);
  const isManubri = isManubriEsercizio(workout.value);
  let current = parseKg(numIns6Val.value);
  const step = getWeightStep(isManubri, current);
  current += step;
  numIns6Val.value = String(parseFloat(current.toFixed(2)));
  salvaKgUnico();
};

const decrementaKgUnico = () => {
  numIns6ModificatoManualmente.value = true;
  vibraTattile(10);
  const isManubri = isManubriEsercizio(workout.value);
  let current = parseKg(numIns6Val.value);
  if (current > 0) {
    const step = getWeightStep(isManubri, current);
    current = Math.max(0, current - step);
    numIns6Val.value = String(parseFloat(current.toFixed(2)));
    salvaKgUnico();
  }
};

const salvaKgUnico = async () => {
  if (!isEsercizioEligibileW6(workout.value)) return;
  numIns6ModificatoManualmente.value = true;
  if (!numIns6Val.value || String(numIns6Val.value).trim() === '') {
    await salvaDatoGenerale('num_ins6', '');
  } else {
    await salvaDatoGenerale('num_ins6', numIns6Val.value);
    if (!numFaticaw6Val.value) {
      dialogAvvisoFaticaW6.value = true;
    }
  }
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

// Helper per aggiornare e salvare l'esercizio precedente su Firestore e offline storage
const aggiornaDatoPrecedenteECommit = async (updates) => {
  if (!previousWorkout.value) return;
  try {
    const docRef = doc(db, 'STORYBOARD', previousWorkout.value.id);
    const timestamp = Date.now();
    const timestampUte = getTimestampUte();
    
    // Aggiorna l'oggetto locale
    previousWorkout.value = { ...previousWorkout.value, ...updates, timestamp, timestamp_ute: timestampUte };
    
    // Aggiorna l'offline storage
    const key1 = `offline_storyboard_${previousWorkout.value.id}`;
    const currentUpdates = JSON.parse(localStorage.getItem(key1) || '{}');
    Object.assign(currentUpdates, updates, { timestamp, timestamp_ute: timestampUte });
    localStorage.setItem(key1, JSON.stringify(currentUpdates));
    
    if (previousWorkout.value.num_riga) {
      const key2 = `offline_storyboard_${previousWorkout.value.num_riga}`;
      localStorage.setItem(key2, JSON.stringify(currentUpdates));
    }

    // Aggiorna anche l'elemento corrispondente in storicoEsercizio per riflettere subito le modifiche nella tabella/griglia dello storico
    if (storicoEsercizio.value && storicoEsercizio.value.length > 0) {
      const targetIdStr = String(previousWorkout.value.id || previousWorkout.value.num_riga || '');
      const idx = storicoEsercizio.value.findIndex(ex => 
        (ex.id && String(ex.id) === targetIdStr) || 
        (ex.num_riga && String(ex.num_riga) === targetIdStr) ||
        (ex.num_scheda && String(ex.num_scheda) === String(previousWorkout.value.num_scheda))
      );
      if (idx !== -1) {
        storicoEsercizio.value[idx] = applicaModificheLocali({ ...storicoEsercizio.value[idx], ...updates, timestamp, timestamp_ute: timestampUte });
        storicoEsercizio.value = [...storicoEsercizio.value];
      }
    }

    // Salva su Firestore
    await updateDoc(docRef, { ...updates, timestamp, timestamp_ute: timestampUte });
    
    // Mostra feedback
    snackbarMessaggio.value = "Modifica esercizio precedente salvata!";
    snackbarSalvataggio.value = true;
  } catch (error) {
    console.error("Errore salvataggio esercizio precedente:", error);
  }
};

const salvaDatoSettimanalePrecedente = async (settimana, tipo) => {
  if (!previousWorkout.value) return;
  const campo = `${tipo}_week${settimana}`;
  const valoreOriginale = previousWorkout.value[campo] || '';
  const valoreNuovo = inputSettimanePrecedente.value[settimana][tipo];

  if (valoreOriginale !== valoreNuovo) {
    const updates = { [campo]: valoreNuovo };
    
    // Auto-estrazione per la week 6 dell'esercizio precedente
    if (settimana === 6 && tipo === 'ins' && valoreNuovo) {
      const estratto = estraiNumeroMassimo(valoreNuovo);
      if (estratto !== null) {
        const vecchioEstratto = estraiNumeroMassimo(valoreOriginale);
        if (!numIns6ValPrecedente.value || (vecchioEstratto !== null && parseFloat(numIns6ValPrecedente.value) === vecchioEstratto)) {
          numIns6ValPrecedente.value = String(estratto);
          updates.num_ins6 = String(estratto);
        }
      }
    }
    
    await aggiornaDatoPrecedenteECommit(updates);
  }
};

const salvaDatoGeneralePrecedente = async (campo, valore) => {
  if (!previousWorkout.value) return;
  const valoreOriginale = previousWorkout.value[campo] || '';
  if (valoreOriginale !== valore) {
    await aggiornaDatoPrecedenteECommit({ [campo]: valore });
  }
};

const salvaKgUnicoPrecedente = async () => {
  await salvaDatoGeneralePrecedente('num_ins6', numIns6ValPrecedente.value);
};

const incrementaKgUnicoPrecedente = () => {
  vibraTattile(10);
  const isManubri = isManubriEsercizio(previousWorkout.value);
  let current = parseKg(numIns6ValPrecedente.value);
  const step = getWeightStep(isManubri, current);
  current += step;
  numIns6ValPrecedente.value = String(parseFloat(current.toFixed(2)));
  salvaKgUnicoPrecedente();
};

const decrementaKgUnicoPrecedente = () => {
  vibraTattile(10);
  const isManubri = isManubriEsercizio(previousWorkout.value);
  let current = parseKg(numIns6ValPrecedente.value);
  if (current > 0) {
    const step = getWeightStep(isManubri, current);
    current = Math.max(0, current - step);
    numIns6ValPrecedente.value = String(parseFloat(current.toFixed(2)));
    salvaKgUnicoPrecedente();
  }
};

const salvaFaticaPrecedente = async (fatica) => {
  vibraTattile(15);
  if (numFaticaw6ValPrecedente.value === fatica) {
    numFaticaw6ValPrecedente.value = '';
  } else {
    numFaticaw6ValPrecedente.value = fatica;
  }
  await salvaDatoGeneralePrecedente('num_faticaw6', numFaticaw6ValPrecedente.value);
};

// Funzione WhatsApp (Aereo)
const inviaVideoWhatsApp = () => {
  vibraTattile(12);
  const numeroCoach = '393495525181'; // Con prefisso internazionale per l'Italia (+39)
  const nomeEx = workout.value?.des_esercizio || '';
  const nScheda = workout.value?.num_scheda || '';
  const desGiorno = workout.value?.des_giorno || '';
  const weekAttiva = settimanaAttiva.value;
  
  const messaggio = `Ciao Coach, ti allego il video dell'esercizio: *${nomeEx}* (Scheda ${nScheda}, Giorno ${desGiorno}, Week ${weekAttiva}) per le correzioni.`;
  const url = `https://wa.me/${numeroCoach}?text=${encodeURIComponent(messaggio)}`;
  window.open(url, '_blank');
};

// Funzione Elimina Esercizio (Coach only)
const eliminaEsercizio = async () => {
  vibraTattile(20);
  eliminandoEsercizio.value = true;
  try {
    const docRef = doc(db, 'STORYBOARD', routeIdLocal.value);
    await deleteDoc(docRef);

    // Rimuovi dall'offline storage
    localStorage.removeItem(`offline_storyboard_${routeIdLocal.value}`);
    if (workout.value && workout.value.num_riga) {
      localStorage.removeItem(`offline_storyboard_${workout.value.num_riga}`);
    }

    snackbarMessaggio.value = "Esercizio eliminato con successo!";
    snackbarSalvataggio.value = true;
    dialogElimina.value = false;
    
    setTimeout(() => {
      tornaIndietro();
    }, 1500);
  } catch (error) {
    console.error("Errore nell'eliminazione dell'esercizio:", error);
    alert("Errore durante l'eliminazione dell'esercizio. Riprova.");
  } finally {
    eliminandoEsercizio.value = false;
  }
};

// Funzioni Modifica Esercizio (Coach only)
const apriDialogModifica = () => {
  vibraTattile(12);
  if (!workout.value) return;
  modificaForm.value = {
    des_esercizio: workout.value.des_esercizio || '',
    des_settore: workout.value.des_settore || '',
    des_giorno: workout.value.des_giorno || '',
    num_riga_giorno: workout.value.num_riga_giorno !== undefined ? workout.value.num_riga_giorno : '',
    des_rec_report: workout.value.des_rec_report || '',
    des_esercizio_2: workout.value.des_esercizio_2 || '',
    alf_superserie: workout.value.alf_superserie || '',
    UrlNormal: workout.value.UrlNormal || '',
    des_note: workout.value.des_note || '',
    des_note_attrezzo: workout.value.des_note_attrezzo || '',
    des_note_gen_attr: workout.value.des_note_gen_attr || '',
    des_estesa_start: workout.value.des_estesa_start || '',
    des_estesa_end: workout.value.des_estesa_end || '',
    des_week1: workout.value.des_week1 || '',
    des_week2: workout.value.des_week2 || '',
    des_week3: workout.value.des_week3 || '',
    des_week4: workout.value.des_week4 || '',
    des_week5: workout.value.des_week5 || '',
    des_week6: workout.value.des_week6 || ''
  };
  dialogModifica.value = true;
};

const salvaModificheEsercizio = async () => {
  if (!workout.value) return;
  vibraTattile(20);
  modificandoEsercizio.value = true;
  try {
    // Aggiorna tramite la funzione esistente aggiornaDatoECommit
    await aggiornaDatoECommit({
      des_esercizio: modificaForm.value.des_esercizio,
      des_settore: modificaForm.value.des_settore,
      des_giorno: (modificaForm.value.des_giorno || '').trim().toUpperCase(),
      num_riga_giorno: isNaN(parseInt(modificaForm.value.num_riga_giorno)) ? modificaForm.value.num_riga_giorno : parseInt(modificaForm.value.num_riga_giorno),
      des_rec_report: modificaForm.value.des_rec_report,
      des_esercizio_2: modificaForm.value.des_esercizio_2,
      alf_superserie: modificaForm.value.alf_superserie,
      UrlNormal: modificaForm.value.UrlNormal,
      des_note: modificaForm.value.des_note,
      des_note_attrezzo: modificaForm.value.des_note_attrezzo,
      des_note_gen_attr: modificaForm.value.des_note_gen_attr,
      des_estesa_start: modificaForm.value.des_estesa_start,
      des_estesa_end: modificaForm.value.des_estesa_end,
      des_week1: modificaForm.value.des_week1,
      des_week2: modificaForm.value.des_week2,
      des_week3: modificaForm.value.des_week3,
      des_week4: modificaForm.value.des_week4,
      des_week5: modificaForm.value.des_week5,
      des_week6: modificaForm.value.des_week6
    });

    snackbarMessaggio.value = "Esercizio modificato con successo!";
    snackbarSalvataggio.value = true;
    dialogModifica.value = false;
  } catch (error) {
    console.error("Errore nel salvataggio dell'esercizio:", error);
    alert("Errore durante il salvataggio dell'esercizio. Riprova.");
  } finally {
    modificandoEsercizio.value = false;
  }
};

// Computed per record e suggerimenti nello storico
// Calcola contemporaneamente sia il Record Assoluto Generale dell'esercizio che il Record a Stesse Reps
const suggerimentoRecord = computed(() => {
  const w = settimanaAttiva.value;
  const targetReps = getRepsPerWeek(w);
  const currentNumScheda = parseInt(workout.value?.num_scheda);
  const isCorpoLibero = isCorpoLiberoEsercizio(workout.value);

  // 1. Record Assoluto Generale dell'Esercizio (PR di sempre su qualsiasi rep)
  let absGenWeight = 0;
  let absGenWeek = 0;
  let absGenReps = null;
  let absGenSheet = null;
  let absGenDay = null;
  let absGenRow = null;
  let absGenDate = null;
  let absGenId = null;
  let absGenItem = null;
  let absGenHasWeight = false;

  // 2. Record Assoluto a Stesse Reps (PR sulle reps target di settimana)
  let absRepsWeight = 0;
  let absRepsWeek = 0;
  let absRepsReps = null;
  let absRepsSheet = null;
  let absRepsDay = null;
  let absRepsRow = null;
  let absRepsDate = null;
  let absRepsFatica = null;
  let absRepsId = null;
  let absRepsItem = null;
  let absRepsHasWeight = false;

  // 3. Carico Massimo Registrato in Week 6
  let absW6Weight = 0;

  storicoEsercizio.value.forEach(prevEx => {
    const sNum = parseInt(prevEx.num_scheda);
    if (!isNaN(sNum) && sNum >= currentNumScheda) return;
    const dateVal = getExecutionDate(prevEx, storicoEsercizio.value, workout.value);

    // Priorità 1: Miglior Carico W6 (num_ins6 / ins_week6) se presente per le stesse reps target
    const rawInsW6 = prevEx.ins_week6 || prevEx.num_ins6;
    if (rawInsW6) {
      const extractedW6 = parseFloat(estraiPesoDaInput(rawInsW6)) || 0;
      let pesoW6Num = 0;
      let repsW6Num = estraiRepsEsercizioWeek(prevEx, 6, targetReps);

      if (!isCorpoLibero && extractedW6 > 0) {
        pesoW6Num = extractedW6;
      } else if (isCorpoLibero && extractedW6 === 0) {
        pesoW6Num = 0;
        repsW6Num = estraiRepsDaInput(rawInsW6) || parseFloat(rawInsW6) || repsW6Num || 0;
      } else {
        pesoW6Num = extractedW6;
      }

      if (pesoW6Num > 0 || (isCorpoLibero && repsW6Num > 0)) {
        const valToCompare = pesoW6Num > 0 ? pesoW6Num : repsW6Num;
        const currentGenVal = absGenWeight > 0 ? absGenWeight : (absGenReps || 0);

        if (pesoW6Num > absW6Weight && (repsW6Num >= targetReps - 2 || isMatchingReps(prevEx, 6))) {
          absW6Weight = pesoW6Num;
        }

        if (valToCompare > currentGenVal) {
          absGenWeight = pesoW6Num;
          absGenReps = repsW6Num;
          absGenHasWeight = pesoW6Num > 0;
          absGenWeek = 6;
          absGenSheet = prevEx.num_scheda;
          absGenDay = prevEx.des_giorno;
          absGenRow = prevEx.num_riga_giorno;
          absGenDate = dateVal;
          absGenId = prevEx.id || prevEx.num_riga;
          absGenItem = prevEx;
        }
        if (isMatchingReps(prevEx, 6)) {
          const currentRepsVal = absRepsWeight > 0 ? absRepsWeight : (absRepsReps || 0);
          if (valToCompare >= currentRepsVal) {
            absRepsWeight = pesoW6Num;
            absRepsReps = repsW6Num;
            absRepsHasWeight = pesoW6Num > 0;
            absRepsWeek = 6;
            absRepsSheet = prevEx.num_scheda;
            absRepsDay = prevEx.des_giorno;
            absRepsRow = prevEx.num_riga_giorno;
            absRepsDate = dateVal;
            absRepsFatica = prevEx.num_faticaw6 || null;
            absRepsId = prevEx.id || prevEx.num_riga;
            absRepsItem = prevEx;
          }
        }
      }
    }

    // Priorità 2: Controllo settimanale W1-W6
    for (let i = 1; i <= 6; i++) {
      const val = prevEx['ins_week' + i];
      if (val) {
        const extractedVal = parseFloat(estraiPesoDaInput(val)) || 0;
        let pesoNum = 0;
        let repsNum = estraiRepsEsercizioWeek(prevEx, i, targetReps);

        if (!isCorpoLibero && extractedVal > 0) {
          pesoNum = extractedVal;
        } else if (isCorpoLibero && extractedVal === 0) {
          pesoNum = 0;
          repsNum = estraiRepsDaInput(val) || parseFloat(val) || repsNum || 0;
        } else {
          pesoNum = extractedVal;
        }

        if (pesoNum > 0 || (isCorpoLibero && repsNum > 0)) {
          const valToCompare = pesoNum > 0 ? pesoNum : repsNum;
          const currentGenVal = absGenWeight > 0 ? absGenWeight : (absGenReps || 0);

          if (i === 6 && pesoNum > absW6Weight && (repsNum >= targetReps - 2 || isMatchingReps(prevEx, 6))) {
            absW6Weight = pesoNum;
          }

          // Controllo PR Generale (All-Time)
          if (valToCompare > currentGenVal) {
            absGenWeight = pesoNum;
            absGenReps = repsNum;
            absGenHasWeight = pesoNum > 0;
            absGenWeek = i;
            absGenSheet = prevEx.num_scheda;
            absGenDay = prevEx.des_giorno;
            absGenRow = prevEx.num_riga_giorno;
            absGenDate = dateVal;
            absGenId = prevEx.id || prevEx.num_riga;
            absGenItem = prevEx;
          }

          // Controllo PR a Stesse Reps (isMatchingReps)
          if (isMatchingReps(prevEx, i)) {
            const currentRepsVal = absRepsWeight > 0 ? absRepsWeight : (absRepsReps || 0);
            // Sanity check: L'e1RM di un record a stesse reps non può essere >15% superiore all'e1RM del Max Assoluto (evita anomalie/refusi da vecchie schede)
            const e1rmRecord = calcE1RM(pesoNum, repsNum);
            const e1rmMaxGen = absGenWeight > 0 ? calcE1RM(absGenWeight, absGenReps || 1) : 0;
            const isAnomalo = e1rmMaxGen > 0 && e1rmRecord > e1rmMaxGen * 1.15;

            if (valToCompare > currentRepsVal && !isAnomalo) {
              absRepsWeight = pesoNum;
              absRepsReps = repsNum;
              absRepsHasWeight = pesoNum > 0;
              absRepsWeek = i;
              absRepsSheet = prevEx.num_scheda;
              absRepsDay = prevEx.des_giorno;
              absRepsRow = prevEx.num_riga_giorno;
              absRepsDate = dateVal;
              absRepsFatica = (i === 6 && prevEx.num_faticaw6) ? prevEx.num_faticaw6 : null;
              absRepsId = prevEx.id || prevEx.num_riga;
              absRepsItem = prevEx;
            }
          }
        }
      }
    }
  });

  const isScarico = (w === 4 && isWeek4Scarico.value);
  const pesoW2 = workout.value?.ins_week2 || '';

  const stimaRecord = stimaRecordStoricoPerReps(targetReps);
  const isManubri = isManubriEsercizio(workout.value);
  const step = getWeightStep(isManubri, absRepsWeight || absW6Weight || 50);

  let baseRec = absRepsWeight > 0 ? absRepsWeight : 0;
  if (w === 6 && absW6Weight > baseRec) {
    baseRec = absW6Weight;
  }
  if (baseRec === 0 && stimaRecord && stimaRecord > 0) {
    baseRec = stimaRecord;
  }

  let increment = step;
  if (w <= 3) increment = Math.min(step, 1.25);

  let targetWeight = baseRec > 0 ? baseRec + increment : 0;
  
  let targetDisplay = null;
  let targetSubtext = null;
  const ghostRange = getGhostWeightsRangeForWeek(w);
  const rawGhostConsigliato = ghostRange?.consigliato?.value;

  if (rawGhostConsigliato && String(rawGhostConsigliato).includes('r')) {
    targetDisplay = String(rawGhostConsigliato);
    const rMatch = targetDisplay.match(/x(\d+)r/i);
    targetSubtext = rMatch ? `a ${rMatch[1]} reps target (Volume)` : `Progressione Volume`;
  } else {
    const ghostConsigliato = rawGhostConsigliato ? parseFloat(rawGhostConsigliato) : null;
    if (ghostConsigliato && !isNaN(ghostConsigliato) && ghostConsigliato > 0) {
      targetWeight = ghostConsigliato;
    }

    if (isManubri) {
      targetWeight = arrotondaManubrioCommerciale(targetWeight);
    } else if (step > 0) {
      targetWeight = Math.round(targetWeight / step) * step;
    }
  }

  if (absGenWeight === 0 && absRepsWeight === 0 && !absGenReps && !absRepsReps && !isScarico) return null;

  return {
    record: absRepsWeight,
    recordRepsWeek: absRepsWeek,
    recordRepsValue: absRepsReps,
    recordHasWeight: absRepsHasWeight,
    recordRepsSheet: absRepsSheet,
    recordRepsDay: absRepsDay,
    recordRepsRow: absRepsRow,
    recordRepsDate: absRepsDate,
    recordRepsFatica: absRepsFatica,
    recordRepsId: absRepsId,
    recordRepsItem: absRepsItem,
    target: targetWeight,
    targetDisplay: targetDisplay || (isCorpoLibero ? getRepsPerWeek(w) + 'r' : targetWeight + ' kg'),
    targetSubtext: targetSubtext || `a ${getRepsPerWeek(w)} reps target`,

    recordAbsolute: absGenWeight,
    recordAbsoluteWeek: absGenWeek,
    recordAbsoluteReps: absGenReps,
    recordAbsoluteHasWeight: absGenHasWeight,
    recordAbsoluteSheet: absGenSheet,
    recordAbsoluteDay: absGenDay,
    recordAbsoluteRow: absGenRow,
    recordAbsoluteDate: absGenDate,
    recordAbsoluteId: absGenId,
    recordAbsoluteItem: absGenItem,

    target: targetWeight,
    isScarico,
    pesoWeek2: pesoW2
  };
});

const dialogStrategiaCoach = ref(false);

const calcE1RM = (weight, reps) => {
  const w = parseFloat(weight) || 0;
  const r = parseInt(reps) || 1;
  if (w <= 0) return 0;
  return w * (1 + r / 30);
};

const recordMaxRepsInfo = computed(() => {
  if (!workout.value) return null;
  let maxReps = 0;
  let weightAtMaxReps = 0;
  let weekAtMaxReps = 0;
  let isCurrentMeso = false;

  // 1. Cerca nel mesociclo corrente W1-W6
  for (let w = 1; w <= 6; w++) {
    const ins = inputSettimane.value?.[w]?.ins || workout.value?.['ins_week' + w];
    if (ins) {
      const lines = String(ins).split(/[\n;\r]+/);
      lines.forEach(line => {
        const l = line.trim();
        if (!l) return;
        const pStr = estraiPesoDaInput(l);
        const p = pStr ? parseFloat(pStr) : 0;
        const hasExplicitReps = /\d+\s*[rR]\b|\d+\s*[xX]\s*\d+|\b\d+\s*(?:reps?|rip(?:etizioni)?|colpi)\b/i.test(l);
        const explicitReps = hasExplicitReps ? estraiRepsDaInput(l) : null;
        const r = (explicitReps && explicitReps > 0) ? explicitReps : getRepsPerWeek(w);
        if (r > maxReps && (p > 0 || isCorpoLiberoEsercizio(workout.value))) {
          maxReps = r;
          weightAtMaxReps = p;
          weekAtMaxReps = w;
          isCurrentMeso = true;
        }
      });
    }
  }

  // 2. Cerca nello storico delle schede passate
  if (storicoEsercizio.value && storicoEsercizio.value.length > 0) {
    const currentNumScheda = parseInt(workout.value?.num_scheda);
    storicoEsercizio.value.forEach(prevEx => {
      const sNum = parseInt(prevEx.num_scheda);
      if (!isNaN(sNum) && sNum >= currentNumScheda) return;
      for (let w = 1; w <= 6; w++) {
        const ins = prevEx['ins_week' + w] || (w === 6 ? prevEx.num_ins6 : null);
        if (ins) {
          const lines = String(ins).split(/[\n;\r]+/);
          lines.forEach(line => {
            const l = line.trim();
            if (!l) return;
            const pStr = estraiPesoDaInput(l);
            const p = pStr ? parseFloat(pStr) : 0;
            const hasExplicitReps = /\d+\s*[rR]\b|\d+\s*[xX]\s*\d+|\b\d+\s*(?:reps?|rip(?:etizioni)?|colpi)\b/i.test(l);
            const explicitReps = hasExplicitReps ? estraiRepsDaInput(l) : null;
            const r = (explicitReps && explicitReps > 0) ? explicitReps : estraiRepsEsercizioWeek(prevEx, w, 10);
            if (r > maxReps && (p > 0 || isCorpoLiberoEsercizio(workout.value))) {
              maxReps = r;
              weightAtMaxReps = p;
              weekAtMaxReps = w;
              isCurrentMeso = false;
            }
          });
        }
      }
    });
  }

  if (maxReps <= 0) return null;
  return {
    maxReps,
    peso: weightAtMaxReps,
    week: weekAtMaxReps,
    isCurrentMeso
  };
});

const currentWeekLoggedWeight = computed(() => {
  const w = settimanaAttiva.value;
  const ins = inputSettimane.value?.[w]?.ins || workout.value?.['ins_week' + w];
  if (!ins) return null;
  const perf = estraiMigliorPrestazioneInput(ins, getRepsPerWeek(w), isCavoOMacchinaEsercizio(workout.value));
  if (perf && perf.peso > 0) return perf.peso;
  const pStr = estraiPesoDaInput(ins);
  const p = pStr ? parseFloat(pStr) : null;
  return (p && !isNaN(p) && p > 0) ? p : null;
});

const currentWeekLoggedReps = computed(() => {
  const w = settimanaAttiva.value;
  const ins = inputSettimane.value?.[w]?.ins || workout.value?.['ins_week' + w];
  if (!ins) return null;
  const perf = estraiMigliorPrestazioneInput(ins, getRepsPerWeek(w), isCavoOMacchinaEsercizio(workout.value));
  if (perf && perf.reps > 0) return perf.reps;
  const r = estraiRepsDaInput(ins);
  return (r && !isNaN(r) && r > 0) ? r : getRepsPerWeek(w);
});

const valutazioneProgressione = computed(() => {
  const w = settimanaAttiva.value;
  const isCorpoLibero = isCorpoLiberoEsercizio(workout.value);

  if (!suggerimentoRecord.value) {
    return {
      testo: 'Primo ciclo di allenamento',
      colore: 'text-amber-lighten-2',
      icona: 'mdi-sparkles'
    };
  }

  const hasWeight = !isCorpoLibero || suggerimentoRecord.value.recordHasWeight || suggerimentoRecord.value.recordAbsoluteHasWeight;

  if (isCorpoLibero && !hasWeight) {
    const recReps = suggerimentoRecord.value.recordRepsValue || suggerimentoRecord.value.recordAbsoluteReps || getRepsPerWeek(w);

    if (!recReps || recReps <= 0) {
      return {
        testo: 'Primo ciclo di allenamento',
        colore: 'text-amber-lighten-2',
        icona: 'mdi-sparkles'
      };
    }

    let bestCurrentReps = 0;
    let currentLogged = false;

    for (let i = 1; i <= 6; i++) {
      const val = workout.value?.['ins_week' + i];
      if (val) {
        const repsInput = estraiRepsDaInput(val) || parseFloat(val);
        if (!isNaN(repsInput) && repsInput > 0) {
          currentLogged = true;
          if (repsInput > bestCurrentReps) {
            bestCurrentReps = repsInput;
          }
        }
      }
    }

    if (!currentLogged || bestCurrentReps === 0) {
      return {
        testo: `Obiettivo W${w}: ${getRepsPerWeek(w)}r (PR ${recReps}r)`,
        colore: 'text-cyan-lighten-2',
        icona: 'mdi-target'
      };
    }

    const diffReps = bestCurrentReps - recReps;
    if (bestCurrentReps >= recReps) {
      const perc = recReps > 0 ? Math.round((diffReps / recReps) * 100) : 0;
      const diffRepsDisplay = diffReps > 0 ? `+${diffReps} r` : `0 r`;
      return {
        testo: `In miglioramento (${diffRepsDisplay} / +${perc}%)`,
        colore: 'text-green-lighten-2',
        icona: 'mdi-trending-up'
      };
    } else if (bestCurrentReps >= recReps - 1) {
      return {
        testo: 'Reps in linea col tuo PR storico',
        colore: 'text-cyan-lighten-2',
        icona: 'mdi-minus-circle-outline'
      };
    } else {
      const diffRepsAbs = Math.abs(diffReps);
      const percAbs = recReps > 0 ? Math.round((diffRepsAbs / recReps) * 100) : 0;
      return {
        testo: `Sotto al picco storico (-${diffRepsAbs} r / -${percAbs}%)`,
        colore: 'text-orange-lighten-2',
        icona: 'mdi-trending-down'
      };
    }
  }

  const recWeight = suggerimentoRecord.value.record || suggerimentoRecord.value.recordAbsolute;
  const recReps = suggerimentoRecord.value.recordRepsValue || suggerimentoRecord.value.recordAbsoluteReps || getRepsPerWeek(w);
  const isExactRepsRecord = (suggerimentoRecord.value.record > 0 || suggerimentoRecord.value.recordRepsValue > 0);
  const targetRepsWeek = getRepsPerWeek(w);

  if (!recWeight || recWeight <= 0) {
    return {
      testo: 'Primo ciclo di allenamento',
      colore: 'text-amber-lighten-2',
      icona: 'mdi-sparkles'
    };
  }

  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  const e1rmHistoric = calcolaE1RMSmorzato(recWeight, recReps, isCavo);

  // Trova il miglior carico inserito nel mesociclo ATTUALE (W1-W6 del workout corrente)
  let bestCurrentWeight = 0;
  let bestCurrentReps = getRepsPerWeek(w);
  let bestCurrentE1RM = 0;
  let currentLogged = false;

  for (let i = 1; i <= 6; i++) {
    const val = inputSettimane.value?.[i]?.ins || workout.value?.['ins_week' + i];
    if (val) {
      const perf = estraiMigliorPrestazioneInput(val, getRepsPerWeek(i), isCavo);
      if (perf && perf.peso > 0) {
        currentLogged = true;
        if (perf.e1rm > bestCurrentE1RM) {
          bestCurrentE1RM = perf.e1rm;
          bestCurrentWeight = perf.peso;
          bestCurrentReps = perf.reps;
        }
      }
    }
  }

  // 1. CASO: Non esiste un record storico alle stesse ripetizioni esatte (es. 17 reps vs 4 reps del max)
  if (!isExactRepsRecord) {
    const targetWeight = suggerimentoRecord.value.target;
    
    // Se non ha ancora inserito carichi nella scheda corrente
    if (!currentLogged || bestCurrentWeight === 0) {
      const recInfo = (recWeight > 0 && recReps > 0) ? ` • Calibrato su ${formatWeight(recWeight)}kg×${recReps}r` : '';
      return {
        testo: `Target ${targetRepsWeek} reps: ${formatWeight(targetWeight)} kg${recInfo}`,
        colore: 'text-cyan-lighten-2',
        icona: 'mdi-target'
      };
    }

    // L'atleta ha registrato un carico (es. 57 kg a 18 reps)
    // Cerchiamo l'incremento rispetto alle settimane precedenti del mesociclo (W1, W2, W3...)
    let w1Weight = 0;
    let w1Reps = 0;
    let prevWeekWeight = 0;
    let prevWeekReps = 0;
    for (let i = 1; i < w; i++) {
      const prevVal = inputSettimane.value?.[i]?.ins || workout.value?.['ins_week' + i];
      if (prevVal) {
        const perf = estraiMigliorPrestazioneInput(prevVal, getRepsPerWeek(i), isCavo);
        if (perf && perf.peso > 0) {
          if (w1Weight === 0) {
            w1Weight = perf.peso;
            w1Reps = perf.reps;
          }
          prevWeekWeight = perf.peso;
          prevWeekReps = perf.reps;
        }
      }
    }

    const baseCompare = prevWeekWeight > 0 ? prevWeekWeight : w1Weight;
    const baseCompareReps = prevWeekWeight > 0 ? prevWeekReps : w1Reps;
    const deltaMeso = (bestCurrentWeight > 0 && baseCompare > 0) ? Math.round((bestCurrentWeight - baseCompare) * 10) / 10 : 0;
    const deltaRepsMeso = (bestCurrentReps > 0 && baseCompareReps > 0) ? bestCurrentReps - baseCompareReps : 0;

    if (recordMaxRepsInfo.value && recordMaxRepsInfo.value.maxReps > bestCurrentReps) {
      const maxR = recordMaxRepsInfo.value.maxReps;
      const maxP = recordMaxRepsInfo.value.peso;
      return {
        testo: `Record ${maxR} reps stabilito (${formatWeight(maxP)} kg) • Top ${formatWeight(bestCurrentWeight)} kg x${bestCurrentReps}r`,
        colore: 'text-green-lighten-2',
        icona: 'mdi-trophy'
      };
    } else if (deltaMeso > 0) {
      return {
        testo: `Nuovo PR ${bestCurrentReps} reps (${formatWeight(bestCurrentWeight)} kg) • +${formatWeight(deltaMeso)} kg nel mesociclo`,
        colore: 'text-green-lighten-2',
        icona: 'mdi-trophy'
      };
    } else if (deltaMeso === 0 && deltaRepsMeso > 0) {
      return {
        testo: `Nuovo PR ${bestCurrentReps} reps (${formatWeight(bestCurrentWeight)} kg) • +${deltaRepsMeso} reps nel mesociclo`,
        colore: 'text-green-lighten-2',
        icona: 'mdi-trophy'
      };
    } else if (bestCurrentWeight >= targetWeight && targetWeight > 0) {
      const extraTarget = Math.round((bestCurrentWeight - targetWeight) * 10) / 10;
      const extraTxt = extraTarget > 0 ? ` (+${formatWeight(extraTarget)} kg sul target)` : '';
      return {
        testo: `Record ${bestCurrentReps} reps stabilito (${formatWeight(bestCurrentWeight)} kg)${extraTxt}`,
        colore: 'text-green-lighten-2',
        icona: 'mdi-trophy'
      };
    } else {
      const recInfo = (recWeight > 0 && recReps > 0) ? ` • Calibrato su ${formatWeight(recWeight)}kg×${recReps}r` : '';
      return {
        testo: `Record ${bestCurrentReps} reps stabilito (${formatWeight(bestCurrentWeight)} kg)${recInfo}`,
        colore: 'text-cyan-lighten-2',
        icona: 'mdi-trophy'
      };
    }
  }

  // 2. CASO: Esiste un record storico alle stesse ripetizioni esatte (isExactRepsRecord = true)
  if (!currentLogged || bestCurrentE1RM === 0) {
    const targetWeight = suggerimentoRecord.value.target;
    return {
      testo: `Obiettivo W${w}: ${formatWeight(targetWeight)} kg (PR ${formatWeight(recWeight)}kg)`,
      colore: 'text-cyan-lighten-2',
      icona: 'mdi-target'
    };
  }

  // Confronta a parità di reps
  const diffE1RM = bestCurrentE1RM - e1rmHistoric;
  const diffKg = Math.round((bestCurrentWeight - recWeight) * 10) / 10;

  if (bestCurrentWeight >= recWeight) {
    const perc = e1rmHistoric > 0 ? Math.round((diffE1RM / e1rmHistoric) * 100) : 0;
    const rawDiff = diffKg > 0 ? diffKg : Math.max(diffE1RM / 1.2, 0.5);
    const diffKgDisplay = formatWeight(Math.round(rawDiff * 10) / 10);
    return {
      testo: `In miglioramento (+${diffKgDisplay} kg / +${perc}%)`,
      colore: 'text-green-lighten-2',
      icona: 'mdi-trending-up'
    };
  } else if (bestCurrentWeight >= 0.95 * recWeight || bestCurrentE1RM >= 0.95 * e1rmHistoric) {
    return {
      testo: `Carico in linea col tuo PR storico a ${recReps}r`,
      colore: 'text-cyan-lighten-2',
      icona: 'mdi-minus-circle-outline'
    };
  } else {
    const diffKgAbs = Math.abs(diffKg);
    const percAbs = e1rmHistoric > 0 ? Math.round(((e1rmHistoric - bestCurrentE1RM) / e1rmHistoric) * 100) : 0;
    return {
      testo: `Sotto al PR a ${recReps}r (-${formatWeight(diffKgAbs)} kg / -${percAbs}%)`,
      colore: 'text-orange-lighten-2',
      icona: 'mdi-trending-down'
    };
  }
});

const meAttrezzoLabel = (isManubri, isCorpoLiberoPuro, isComfortAttivo, pctComfort) => {
  if (isComfortAttivo) return `🛡️ Tutela Articolare (-${pctComfort}%)`;
  if (isCorpoLiberoPuro) return 'Progressione Ripetizioni';
  return isManubri ? 'Step Manubri (+1kg)' : 'Step Bilanciere/Cavi (+2.5kg)';
};

const strategiaCoachData = computed(() => {
  const wActive = settimanaAttiva.value;
  const exName = workout.value?.des_esercizio || 'Esercizio';
  const isManubri = isManubriEsercizio(workout.value);
  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  const isCorpoLibero = isCorpoLiberoEsercizio(workout.value);
  const hasWeight = !isCorpoLibero || (suggerimentoRecord.value?.recordHasWeight || suggerimentoRecord.value?.recordAbsoluteHasWeight);
  const isCorpoLiberoPuro = isCorpoLibero && !hasWeight;

  const inf = (infortuniAttiviEsercizio.value && infortuniAttiviEsercizio.value.length > 0 && !ghostSbloccato.value) ? infortuniAttiviEsercizio.value[0] : null;
  const isComfortAttivo = !!(inf && inf.applica_riduzione !== false && (inf.percentuale_riduzione ?? 20) > 0);
  const pctComfort = isComfortAttivo ? (inf.percentuale_riduzione ?? 20) : 0;
  const articolazioneCoinvolta = inf ? (inf.articolazione_coinvolta || 'Articolazione') : '';
  const gravitaInfortunio = inf ? (inf.gravita || 3) : 0;

  // PR Storico
  const prWeight = suggerimentoRecord.value?.record || suggerimentoRecord.value?.recordAbsolute || 0;
  const prReps = suggerimentoRecord.value?.recordRepsValue || suggerimentoRecord.value?.recordAbsoluteReps || getRepsPerWeek(wActive) || 8;
  const e1rmStorico = isCorpoLiberoPuro ? 0 : calcolaE1RMSmorzato(prWeight, prReps, isCavo);

  // Prestazione Attuale (Miglior e1RM nel mesociclo corrente)
  let bestCurrentWeight = 0;
  let bestCurrentReps = getRepsPerWeek(wActive) || 8;
  let bestCurrentE1RM = 0;
  for (let i = 1; i <= 6; i++) {
    const val = workout.value?.['ins_week' + i];
    if (val) {
      if (isCorpoLiberoPuro) {
        const repsInput = estraiRepsDaInput(val) || parseFloat(val);
        if (!isNaN(repsInput) && repsInput > 0) {
          if (repsInput > bestCurrentReps || bestCurrentE1RM === 0) {
            bestCurrentReps = repsInput;
            bestCurrentE1RM = repsInput;
          }
        }
      } else {
        const pesoNum = parseFloat(estraiPesoDaInput(val));
        if (!isNaN(pesoNum) && pesoNum > 0) {
          const repsInput = estraiRepsDaInput(val) || getRepsPerWeek(i);
          const e1rm = calcolaE1RMSmorzato(pesoNum, repsInput, isCavo);
          if (e1rm > bestCurrentE1RM) {
            bestCurrentE1RM = e1rm;
            bestCurrentWeight = pesoNum;
            bestCurrentReps = repsInput;
          }
        }
      }
    }
  }

  // Determina lo stato prestazionale
  let stato = 'PRIMA_VOLTA';
  let diffKg = 0;
  let diffPerc = 0;

  if (isComfortAttivo) {
    stato = 'COMFORT_ATTIVO';
  } else if (isCorpoLiberoPuro) {
    if (prReps > 0) {
      if (bestCurrentReps === 0) {
        stato = 'INIZIO';
      } else if (bestCurrentReps >= prReps) {
        stato = 'PROGRESSIONE';
        diffKg = bestCurrentReps - prReps;
        diffPerc = prReps > 0 ? Math.round(((bestCurrentReps - prReps) / prReps) * 100) : 0;
      } else if (bestCurrentReps >= prReps - 1) {
        stato = 'IN_LINEA';
      } else {
        stato = 'CALO';
        diffKg = prReps - bestCurrentReps;
        diffPerc = prReps > 0 ? Math.round(((prReps - bestCurrentReps) / prReps) * 100) : 0;
      }
    }
  } else if (prWeight > 0) {
    if (bestCurrentE1RM === 0) {
      stato = 'INIZIO';
    } else if (bestCurrentE1RM >= e1rmStorico) {
      stato = 'PROGRESSIONE';
      diffKg = bestCurrentWeight - prWeight;
      diffPerc = Math.round(((bestCurrentE1RM - e1rmStorico) / e1rmStorico) * 100);
    } else if (bestCurrentE1RM >= 0.95 * e1rmStorico) {
      stato = 'IN_LINEA';
    } else {
      stato = 'CALO';
      diffKg = prWeight - bestCurrentWeight;
      diffPerc = Math.round(((e1rmStorico - bestCurrentE1RM) / e1rmStorico) * 100);
    }
  }

  // Costruzione Roadmap W1 -> W6 basata su reps prescritte
  const step = isManubri ? 1.0 : 2.5;
  const getStepFor = (w) => isManubri ? (w >= 10 ? 2.0 : 1.0) : 2.5;

  const adjustDumbbell = (w) => isManubri ? arrotondaManubrioCommerciale(w) : w;

  const calcWeightForReps = (targetE1RM, targetReps) => {
    if (targetE1RM <= 0) return isManubri ? 10 : 20;
    const rawW = targetE1RM / (1 + targetReps / 30);
    const rounded = Math.max(Math.round(rawW / step) * step, isManubri ? 4 : 10);
    return adjustDumbbell(rounded);
  };

  const r1 = getRepsPerWeek(1);
  const r2 = getRepsPerWeek(2);
  const r3 = getRepsPerWeek(3);
  const r4 = getRepsPerWeek(4);
  const r5 = getRepsPerWeek(5);
  const r6 = getRepsPerWeek(6);

  let w1Target = adjustDumbbell(e1rmStorico > 0 ? calcWeightForReps(e1rmStorico * 0.85, r1) : (isManubri ? 10 : 20));
  let w2Target = adjustDumbbell(e1rmStorico > 0 ? calcWeightForReps(e1rmStorico * 0.92, r2) : w1Target + getStepFor(w1Target));
  let w3Target = adjustDumbbell(e1rmStorico > 0 ? calcWeightForReps(e1rmStorico * 0.98, r3) : w2Target + getStepFor(w2Target));
  let w4Target = adjustDumbbell(w2Target > 0 ? w2Target : (e1rmStorico > 0 ? calcWeightForReps(e1rmStorico * 0.85, r4) : w1Target));
  let w5Target = adjustDumbbell(Math.max(w3Target + getStepFor(w3Target), e1rmStorico > 0 ? calcWeightForReps(e1rmStorico * 1.02, r5) : w3Target + getStepFor(w3Target)));
  let w6Target = adjustDumbbell(Math.max(w5Target + getStepFor(w5Target), e1rmStorico > 0 ? calcWeightForReps(e1rmStorico * 1.05, r6) : w5Target + getStepFor(w5Target)));

  if (isComfortAttivo && pctComfort > 0) {
    const factor = (100 - pctComfort) / 100;
    const applicaComfortTarget = (wVal) => {
      if (wVal <= 0) return wVal;
      const s = getStepFor(wVal);
      return adjustDumbbell(Math.max(s, Math.round((wVal * factor) / s) * s));
    };
    w1Target = applicaComfortTarget(w1Target);
    w2Target = applicaComfortTarget(w2Target);
    w3Target = applicaComfortTarget(w3Target);
    w4Target = applicaComfortTarget(w4Target);
    w5Target = applicaComfortTarget(w5Target);
    w6Target = applicaComfortTarget(w6Target);
  }

  // Calcolo del picco reale eseguito prima dello scarico (W1-W3)
  let peakLoggedPreScarico = 0;
  let lastLoggedRepsPreScarico = 0;
  for (let i = 1; i <= 3; i++) {
    const val = workout.value?.['ins_week' + i];
    if (val) {
      const p = parseFloat(estraiPesoDaInput(val));
      if (!isNaN(p) && p > peakLoggedPreScarico) {
        peakLoggedPreScarico = p;
      }
      const rIn = estraiRepsDaInput(val) || parseFloat(val);
      if (!isNaN(rIn) && rIn > 0) {
        lastLoggedRepsPreScarico = rIn;
      }
    }
  }

  const buildStepData = (w, fase, color, rpe, note, targetPeso, targetRepsStr) => {
    const val = workout.value?.['ins_week' + w];
    let isLogged = false;
    let pesoRealeVal = null;
    let repsRealiVal = null;

    if (val) {
      if (isCorpoLiberoPuro) {
        const rIn = estraiRepsDaInput(val) || parseFloat(val);
        if (!isNaN(rIn) && rIn > 0) {
          isLogged = true;
          repsRealiVal = rIn;
        }
      } else {
        const p = parseFloat(estraiPesoDaInput(val));
        if (!isNaN(p) && p > 0) {
          isLogged = true;
          pesoRealeVal = p;
          repsRealiVal = estraiRepsDaInput(val) || getRepsPerWeek(w);
        }
      }
    }

    let caricoRealeText = '';
    let repsRealiText = '';

    if (isCorpoLiberoPuro) {
      if (isLogged) {
        caricoRealeText = formatRepsDisplay(repsRealiVal);
      } else {
        if (w === 4 && lastLoggedRepsPreScarico > 0) {
          const scaricoReps = Math.round(lastLoggedRepsPreScarico * 0.70);
          caricoRealeText = `3x${scaricoReps} reps`;
        } else if (w === 5 && lastLoggedRepsPreScarico > 0) {
          const targetW6Reps = r6;
          const piccoReps = Math.round(lastLoggedRepsPreScarico + (targetW6Reps - lastLoggedRepsPreScarico) * 0.5);
          caricoRealeText = `3x${Math.max(piccoReps - 1, 1)}-${piccoReps + 1} reps`;
        } else {
          caricoRealeText = targetRepsStr;
        }
      }
      return {
        week: w,
        fase,
        color,
        rpe,
        note,
        caricoTeorico: targetRepsStr,
        repsTeoriche: '',
        isLogged,
        caricoReale: caricoRealeText,
        repsReali: ''
      };
    }

    if (isLogged) {
      caricoRealeText = `${formatWeight(pesoRealeVal)}kg`;
      repsRealiText = formatRepsDisplay(repsRealiVal);
    } else {
      let pesoProiettato = targetPeso;
      if (isComfortAttivo) {
        pesoProiettato = targetPeso;
      } else if (w === 4) {
        const valW2 = workout.value?.['ins_week2'];
        const pW2 = valW2 ? parseFloat(estraiPesoDaInput(valW2)) : 0;
        if (pW2 > 0) pesoProiettato = pW2;
        else if (peakLoggedPreScarico > 0) pesoProiettato = Math.max(peakLoggedPreScarico - getStepFor(peakLoggedPreScarico), isManubri ? 4 : 10);
      } else if (w === 5) {
        if (peakLoggedPreScarico > 0) pesoProiettato = peakLoggedPreScarico + getStepFor(peakLoggedPreScarico);
      } else if (w === 6) {
        if (peakLoggedPreScarico > 0) {
          const stepW5 = getStepFor(peakLoggedPreScarico);
          const pesoW5 = peakLoggedPreScarico + stepW5;
          pesoProiettato = pesoW5 + getStepFor(pesoW5);
        }
      }
      pesoProiettato = adjustDumbbell(pesoProiettato);
      caricoRealeText = `${formatWeight(pesoProiettato)}kg`;
      repsRealiText = targetRepsStr;
    }

    return {
      week: w,
      fase,
      color,
      rpe,
      note,
      caricoTeorico: `${formatWeight(targetPeso)}kg`,
      repsTeoriche: targetRepsStr,
      isLogged,
      caricoReale: caricoRealeText,
      repsReali: repsRealiText
    };
  };

  const roadmap = isComfortAttivo ? [
    buildStepData(1, 'Adattamento Protetto', 'cyan', 'RPE 6-7', 'Carico ridotto. Focus su assenza di dolore e massima pulizia tecnica.', w1Target, `3x${r1} reps`),
    buildStepData(2, 'Consolidamento Volume', 'teal', 'RPE 7', 'Mantieni il carico comfort ed esegui ogni ripetizione con controllo eccentrico.', w2Target, `3x${r2} reps`),
    buildStepData(3, 'Progressione Ripetizioni', 'amber', 'RPE 7.5', 'Cerca 1-2 rep in più sul carico comfort prima di considerare aumenti di peso.', w3Target, `3x${r3} reps`),
    buildStepData(4, 'Scarico Decompressivo', 'blue', 'RPE 6', 'Decompressione articolare e rigenerazione tendinea a carico ultra-sicuro.', w4Target, `3x${r4} reps`),
    buildStepData(5, 'Densità & Reps Comfort', 'purple', 'RPE 7.5-8', 'Incrementa le ripetizioni mantenendo il carico protetto e sicuro.', w5Target, `3x${Math.max(r5 - 2, 1)}-${r5} reps`),
    buildStepData(6, 'Valutazione Tolleranza Articolare', 'green', 'RPE 8', 'Testa la tenuta articolare sul volume target senza forzare picchi di kg.', w6Target, `3x${r6} reps`)
  ] : [
    buildStepData(1, 'Accumulo & Tecnica', 'cyan', 'RPE 7-8', 'Volume sicuro. Focus su controllo e ritmo esecutivo.', w1Target, `3x${r1} reps`),
    buildStepData(2, 'Progressione Carico', 'amber', 'RPE 8', 'Incremento sostenibile. Mantieni la stessa qualità esecutiva.', w2Target, `3x${r2} reps`),
    buildStepData(3, 'Pareggio PR Storico', 'orange', 'RPE 8.5-9', 'Test di pareggio del tuo record storico passato.', w3Target, `3x${r3} reps`),
    buildStepData(4, 'Scarico Rigenerativo', 'blue', 'RPE 6-7', 'Riduzione del carico per permettere il recupero neurale.', w4Target, `3x${r4} reps`),
    buildStepData(5, 'Picco Intensità (Rottura Stallo)', 'purple', 'RPE 9-9.5', 'Supera il tetto dei kg storici lavorando a intensità elevata.', w5Target, `3x${Math.max(r5 - 2, 1)}-${r5} reps`),
    buildStepData(6, 'Test Nuovo Record Assoluto', 'green', 'RPE 10', 'Test finale per consolidare il nuovo PR assoluto.', w6Target, `3x${r6} reps`)
  ];

  return {
    exName,
    isManubri,
    isCorpoLiberoPuro,
    isComfortAttivo,
    percentualeInfortunio: pctComfort,
    articolazioneCoinvolta,
    gravitaInfortunio,
    prWeight,
    prReps,
    e1rmStorico: Math.round(e1rmStorico * 10) / 10,
    bestCurrentWeight,
    bestCurrentReps,
    e1rmAttuale: Math.round(bestCurrentE1RM * 10) / 10,
    stato,
    diffKg,
    diffPerc,
    roadmap
  };
});

const meStatoBg = (s) => {
  if (s === 'COMFORT_ATTIVO') return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)';
  if (s === 'CALO') return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.03) 100%)';
  if (s === 'PROGRESSIONE') return 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.03) 100%)';
  if (s === 'IN_LINEA') return 'linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.03) 100%)';
  return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.03) 100%)';
};

const getStepCardStyle = (step) => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const isActive = step.week === settimanaAttiva.value;
  
  if (!isLight) {
    if (isActive) {
      return {
        background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.25) 0%, rgba(30, 41, 59, 0.95) 100%)',
        borderColor: '#f59e0b',
        borderWidth: '2px',
        boxShadow: '0 0 14px rgba(245, 158, 11, 0.35)'
      };
    }
    return {
      background: 'rgba(15, 23, 42, 0.6)',
      borderColor: 'rgba(255, 255, 255, 0.08)'
    };
  }
  
  if (isActive) {
    return {
      background: 'linear-gradient(135deg, #fef3c7 0%, #fffbe6 100%)',
      borderColor: '#d97706',
      borderWidth: '2px',
      boxShadow: '0 4px 14px rgba(217, 119, 6, 0.25), 0 1px 3px rgba(0,0,0,0.05)'
    };
  }
  
  const colorMap = {
    cyan: { bg: 'linear-gradient(135deg, rgba(6, 182, 212, 0.07) 0%, rgba(248, 250, 252, 0.95) 100%)', border: 'rgba(6, 182, 212, 0.22)' },
    teal: { bg: 'linear-gradient(135deg, rgba(20, 184, 166, 0.07) 0%, rgba(248, 250, 252, 0.95) 100%)', border: 'rgba(20, 184, 166, 0.22)' },
    amber: { bg: 'linear-gradient(135deg, rgba(245, 158, 11, 0.07) 0%, rgba(248, 250, 252, 0.95) 100%)', border: 'rgba(245, 158, 11, 0.22)' },
    orange: { bg: 'linear-gradient(135deg, rgba(249, 115, 22, 0.07) 0%, rgba(248, 250, 252, 0.95) 100%)', border: 'rgba(249, 115, 22, 0.22)' },
    blue: { bg: 'linear-gradient(135deg, rgba(59, 130, 246, 0.07) 0%, rgba(248, 250, 252, 0.95) 100%)', border: 'rgba(59, 130, 246, 0.22)' },
    purple: { bg: 'linear-gradient(135deg, rgba(168, 85, 247, 0.07) 0%, rgba(248, 250, 252, 0.95) 100%)', border: 'rgba(168, 85, 247, 0.22)' },
    green: { bg: 'linear-gradient(135deg, rgba(16, 185, 129, 0.07) 0%, rgba(248, 250, 252, 0.95) 100%)', border: 'rgba(16, 185, 129, 0.22)' }
  };
  
  const config = colorMap[step.color] || { bg: 'rgba(248, 250, 252, 0.95)', border: 'var(--card-border)' };
  return {
    background: config.bg,
    borderColor: config.border
  };
};

const meStatoBorder = (s) => {
  if (s === 'COMFORT_ATTIVO') return 'rgba(239, 68, 68, 0.35) !important';
  if (s === 'CALO') return 'rgba(239, 68, 68, 0.35) !important';
  if (s === 'PROGRESSIONE') return 'rgba(34, 197, 94, 0.35) !important';
  if (s === 'IN_LINEA') return 'rgba(6, 182, 212, 0.35) !important';
  return 'rgba(245, 158, 11, 0.35) !important';
};

const meStatoColor = (s) => {
  if (s === 'COMFORT_ATTIVO') return 'red-lighten-2';
  if (s === 'CALO') return 'red-lighten-2';
  if (s === 'PROGRESSIONE') return 'green-lighten-2';
  if (s === 'IN_LINEA') return 'cyan-lighten-2';
  return 'amber-lighten-2';
};

const meStatoIcona = (s) => {
  if (s === 'COMFORT_ATTIVO') return 'mdi-bandage';
  if (s === 'CALO') return 'mdi-alert-circle-outline';
  if (s === 'PROGRESSIONE') return 'mdi-trending-up';
  if (s === 'IN_LINEA') return 'mdi-minus-circle-outline';
  return 'mdi-sparkles';
};

const meStatoTextClass = (s) => {
  if (s === 'COMFORT_ATTIVO') return 'text-red-lighten-2';
  if (s === 'CALO') return 'text-red-lighten-2';
  if (s === 'PROGRESSIONE') return 'text-green-lighten-2';
  if (s === 'IN_LINEA') return 'text-cyan-lighten-2';
  return 'text-amber-lighten-2';
};

const meStatoTitolo = (s) => {
  if (s === 'COMFORT_ATTIVO') return 'Comfort Articolare Attivo';
  if (s === 'CALO') return 'Calo temporaneo dal Picco Storico';
  if (s === 'PROGRESSIONE') return 'In Progressione sul PR!';
  if (s === 'IN_LINEA') return 'In Linea con i tuoi Standard';
  return 'Nuovo Ciclo di Progressione';
};

const meStatoDescrizione = (data) => {
  if (data.stato === 'COMFORT_ATTIVO') {
    return `Monitoraggio fastidio su ${data.articolazioneCoinvolta || 'articolazione'} (${data.gravitaInfortunio}/10). Carichi ridotti del -${data.percentualeInfortunio}% per lavorare in comfort zone. La roadmap privilegia il controllo esecutivo (TUT) e l'aumento delle ripetizioni prima di incrementare il carico.`;
  }
  if (data.isCorpoLiberoPuro) {
    if (data.stato === 'CALO') {
      return `Prestazione in calo dal tuo PR di ${data.prReps}r. Il piano ti guiderà per ritornare al tuo picco.`;
    }
    if (data.stato === 'PROGRESSIONE') {
      return `Stai superando il tuo livello storico di ripetizioni (+${data.diffKg} r). Segui la roadmap per consolidare il nuovo record.`;
    }
    if (data.stato === 'IN_LINEA') {
      return `Ripetizioni in linea con il tuo PR di ${data.prReps}r. La roadmap ti aiuterà ad incrementare il volume nelle prossime settimane.`;
    }
    return `Primo ciclo per questo esercizio a corpo libero. Segui la roadmap di ripetizioni consigliata dal Coach.`;
  }
  if (data.stato === 'CALO') {
    return `Forza stimata (${data.e1rmAttuale > 0 ? data.e1rmAttuale + 'kg e1RM' : 'attuale'}) a -${data.diffKg > 0 ? formatWeight(data.diffKg) : 2}kg (-${data.diffPerc}%) dal tuo PR di ${data.prWeight}kg × ${data.prReps}r. Il piano ti guiderà per rientrare in quota PR.`;
  }
  if (data.stato === 'PROGRESSIONE') {
    return `Stai superando la forza storica (+${data.diffPerc}%). Segui la roadmap per consolidare il nuovo record.`;
  }
  if (data.stato === 'IN_LINEA') {
    return `Carichi correnti in linea con il tuo PR di ${data.prWeight}kg × ${data.prReps}r. La roadmap ti aiuterà a rompere lo stallo in W5 e W6.`;
  }
  return `Primo ciclo per questo esercizio. Segui la roadmap consigliata dal Coach.`;
};

const meFormatNum = (val) => {
  if (!val || isNaN(val)) return '0';
  return val.toString();
};

const formatFaticaAbbr = (fatica) => {
  if (!fatica) return '';
  const f = String(fatica).trim().toLowerCase();
  if (f.startsWith('m')) return 'M';
  if (f.startsWith('p')) return 'P';
  if (f.startsWith('d')) return 'D';
  return fatica.trim().charAt(0).toUpperCase();
};

const getColoreFaticaStyle = (fatica) => {
  if (!fatica) return {};
  const f = fatica.trim().toLowerCase();
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (f === 'media') return { color: isLight ? '#166534 !important' : '#81c784 !important' }; // Forest green vs Light green
  if (f === 'pesante') return { color: isLight ? '#b45309 !important' : '#ffb74d !important' }; // Amber brown vs Light orange
  if (f === 'devastante') return { color: isLight ? '#dc2626 !important' : '#e57373 !important' }; // Vivid red vs Light red
  return {};
};

const getW6BestColorStyle = (prevEx) => {
  if (prevEx && prevEx.num_faticaw6) {
    return getColoreFaticaStyle(prevEx.num_faticaw6);
  }
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  return { color: isLight ? '#b45309 !important' : '#ffca28' };
};

const getInsWeekTextStyle = (prevEx, w) => {
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  if (isMatchingReps(prevEx, w)) {
    return { color: isLight ? '#dc2626 !important' : '#ef4444' };
  }
  if (prevEx['ins_week' + w]) {
    return { color: isLight ? '#c2410c !important' : '#fb923c' };
  }
  return { color: isLight ? '#475569 !important' : '#475569' };
};

// Funzione unificata per caricamento dati storico e proposta
const caricaDatiAnalisi = async (sett) => {
  aiutoWeek.value = sett || settimanaAttiva.value;
  caricandoStorico.value = true;
  caricandoAiutoCarico.value = true;
  storicoEsercizio.value = [];
  storicoEsercizioPerAiuto.value = [];
  
  try {
    const { key: keyIdCliente, id: atletaId } = getAtletaInfo(workout.value);
    const desEsercizio = workout.value.des_esercizio;
    const currentNumScheda = parseInt(workout.value.num_scheda);
    
    if (!atletaId || !desEsercizio || isNaN(currentNumScheda)) {
      caricandoStorico.value = false;
      caricandoAiutoCarico.value = false;
      return;
    }
    
    const q = query(
      collection(db, 'STORYBOARD'),
      where(keyIdCliente, '==', atletaId),
      where('des_esercizio', '==', desEsercizio)
    );
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((doc) => {
      const d = doc.data();
      const sNum = parseInt(d.num_scheda);
      if (sNum <= currentNumScheda && parseInt(d.num_riga_giorno) > 0) {
        const itemId = doc.id || d.id || `STORICO_${d.num_scheda}_${d.des_giorno}_${d.num_riga_giorno}`;
        list.push({ ...d, id: itemId });
      }
    });
    list.sort((a, b) => parseInt(a.num_scheda) - parseInt(b.num_scheda));
    
    if (list.length === 0) {
      const allData = await getStoryboardBackup();
      const matched = allData.filter(b => {
        const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
        return String(bAtletaId) === String(atletaId) &&
               String(b.des_esercizio).trim() === String(desEsercizio).trim() &&
               parseInt(b.num_scheda) <= currentNumScheda &&
               parseInt(b.num_riga_giorno) > 0;
      });
      matched.forEach(b => {
        b.id = `STORICO_${b.num_scheda}_${b.des_giorno}_${b.num_riga_giorno}`;
      });
      matched.sort((a, b) => parseInt(a.num_scheda) - parseInt(b.num_scheda));
      storicoEsercizio.value = matched;
      storicoEsercizioPerAiuto.value = matched;
    } else {
      storicoEsercizio.value = list;
      storicoEsercizioPerAiuto.value = list;
    }
  } catch (err) {
    console.error("Errore caricamento dati analisi:", err);
  } finally {
    caricandoStorico.value = false;
    caricandoAiutoCarico.value = false;
    rigeneraGraficoStorico();
  }
};

// Logica di Generazione del Grafico Storico Esercizio
const rigeneraGraficoStorico = () => {
  storicoChartReady.value = false;
  selectedPointDetails.value = null;
  if (!storicoFiltrato.value || storicoFiltrato.value.length === 0) {
    return;
  }
  
  const isLight = document.documentElement.getAttribute('data-theme') === 'light';
  const dataPoints = [];
  
  storicoFiltrato.value.forEach(prevEx => {
    const numScheda = String(prevEx.num_scheda || '').trim();
    for (let wNum = 1; wNum <= 6; wNum++) {
      const rawIns = prevEx[`ins_week${wNum}`];
      const peso = parseWeightLocal(rawIns);
      if (peso > 0) {
        let reps = 0;
        if (prevEx[`reps_week${wNum}`]) {
          reps = parseRepsLocal(prevEx[`reps_week${wNum}`]);
        } else if (prevEx[`des_week${wNum}`]) {
          reps = estraiRepsDaPrescrizione(prevEx[`des_week${wNum}`]);
        }
        
        if (reps > 0) {
          const e1rm = parseFloat((peso * (1 + reps / 30)).toFixed(1));
          dataPoints.push({
            label: `S.${numScheda}-W${wNum}`,
            peso: peso,
            reps: reps,
            e1rm: e1rm,
            bucket: getBucketLabel(reps, raggruppamentoReps.value),
            date: getExecutionDate(prevEx, storicoEsercizio.value, workout.value) || ''
          });
        }
      }
    }
  });
  
  rawPointsLocal.value = dataPoints;
  
  // Extract unique buckets
  const uniqueBuckets = [];
  dataPoints.forEach(p => {
    if (!uniqueBuckets.includes(p.bucket)) {
      uniqueBuckets.push(p.bucket);
    }
  });
  
  // Sort unique buckets logically
  uniqueBuckets.sort((a, b) => {
    const getFirstNum = (str) => {
      const match = str.match(/\d+/);
      return match ? parseInt(match[0]) : 999;
    };
    return getFirstNum(a) - getFirstNum(b);
  });
  
  availableBuckets.value = uniqueBuckets;
  
  // Initialize filter if not valid or empty
  const hasValidSelection = selectedBuckets.value.some(b => uniqueBuckets.includes(b));
  if (!hasValidSelection || selectedBuckets.value.length === 0) {
    const areArraysEqual = (a, b) => a.length === b.length && a.every((v, i) => v === b[i]);
    if (!areArraysEqual(selectedBuckets.value, uniqueBuckets)) {
      selectedBuckets.value = [...uniqueBuckets];
    }
  }
  
  const labels = [...new Set(dataPoints.map(p => p.label))];
  const datasets = [];
  const colors = isLight 
    ? ['#ea580c', '#0284c7', '#7e22ce', '#059669', '#db2777', '#b45309'] 
    : ['#f97316', '#38bdf8', '#a855f7', '#22c55e', '#ec4899', '#eab308'];
  
  if (isEsercizioVPercentuale.value) {
    let rmtBase = 0;
    const rmtObj = parsedRmt(workout.value?.des_esercizio_2);
    if (rmtObj && rmtObj.massimale) {
      rmtBase = parseFloat(rmtObj.massimale.replace(',', '.')) || 0;
    }
    
    const uniqueLabels = [...new Set(dataPoints.map(p => p.label))];
    const dataReale1RM = uniqueLabels.map(lbl => {
      const pts = dataPoints.filter(p => p.label === lbl);
      if (pts.length === 0) return null;
      return Math.max(...pts.map(p => p.e1rm));
    });
    
    const dataTeorico1RM = uniqueLabels.map(lbl => {
      if (rmtBase > 0) return rmtBase;
      const pts = dataPoints.filter(p => p.label === lbl);
      if (pts.length === 0) return null;
      return Math.max(...pts.map(p => p.e1rm));
    });

    datasets.push({
      label: 'Massimale Reale Stimato (e1RM Effettivo)',
      data: dataReale1RM,
      borderColor: isLight ? '#ea580c' : '#f97316',
      backgroundColor: isLight ? 'rgba(234, 88, 12, 0.15)' : 'rgba(249, 115, 22, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: isLight ? '#c2410c' : '#ea580c',
      pointBorderColor: '#ffffff',
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: true,
      tension: 0.15
    });

    datasets.push({
      label: 'Massimale Teorico Target (1RMT)',
      data: dataTeorico1RM,
      borderColor: isLight ? '#0284c7' : '#38bdf8',
      backgroundColor: 'transparent',
      borderWidth: 2,
      borderDash: [5, 5],
      pointBackgroundColor: isLight ? '#0284c7' : '#38bdf8',
      pointBorderColor: '#ffffff',
      pointRadius: 4,
      pointHoverRadius: 6,
      fill: false,
      showLine: true
    });

    storicoChartData.value = {
      labels: uniqueLabels,
      datasets: datasets
    };
    storicoChartOptions.value = getChartOptions(isLight);
    storicoChartReady.value = true;
    return;
  }

  if (modeGraficoStorico.value === 'A') {
    uniqueBuckets.forEach((b, idx) => {
      // Skip if bucket is not selected in filters
      if (!selectedBuckets.value.includes(b)) return;
      
      const data = labels.map(lbl => {
        const pts = dataPoints.filter(p => p.label === lbl && p.bucket === b);
        if (pts.length === 0) return null;
        // Take the max weight to represent the best set in this range
        return Math.max(...pts.map(p => p.peso));
      });
      const color = colors[idx % colors.length];
      datasets.push({
        label: b,
        data: data,
        borderColor: color,
        backgroundColor: color + '15',
        borderWidth: 2.5,
        pointBackgroundColor: color,
        pointBorderColor: isLight ? '#0f172a' : '#ffffff',
        pointRadius: 4,
        pointHoverRadius: 6,
        fill: false,
        spanGaps: true,
        showLine: true
      });
    });
    
    // Estimated 1RM of the selected active sets for each session
    const data1RM = labels.map(lbl => {
      const pts = dataPoints.filter(p => p.label === lbl && selectedBuckets.value.includes(p.bucket));
      if (pts.length === 0) return null;
      return Math.max(...pts.map(p => p.e1rm));
    });
    
    datasets.push({
      label: 'Massimale stimato (1RM)',
      data: data1RM,
      borderColor: isLight ? 'rgba(15, 23, 42, 0.65)' : 'rgba(255, 255, 255, 0.4)',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [5, 5],
      pointBackgroundColor: isLight ? 'rgba(15, 23, 42, 0.8)' : 'rgba(255, 255, 255, 0.6)',
      pointBorderColor: 'transparent',
      pointRadius: 2,
      pointHoverRadius: 4,
      fill: false,
      spanGaps: true
    });
  } else if (modeGraficoStorico.value === 'B') {
    uniqueBuckets.forEach((b, idx) => {
      // Skip if bucket is not selected in filters
      if (!selectedBuckets.value.includes(b)) return;
      
      const data = labels.map(lbl => {
        const pts = dataPoints.filter(p => p.label === lbl && p.bucket === b);
        if (pts.length === 0) return null;
        return Math.max(...pts.map(p => p.peso));
      });
      const color = colors[idx % colors.length];
      datasets.push({
        label: b,
        data: data,
        borderColor: color,
        backgroundColor: color,
        borderWidth: 0,
        pointBackgroundColor: color,
        pointBorderColor: isLight ? '#0f172a' : '#ffffff',
        pointRadius: 5,
        pointHoverRadius: 7,
        fill: false,
        showLine: false
      });
    });
    
    // Estimated 1RM of the selected active sets for each session
    const data1RM = labels.map(lbl => {
      const pts = dataPoints.filter(p => p.label === lbl && selectedBuckets.value.includes(p.bucket));
      if (pts.length === 0) return null;
      return Math.max(...pts.map(p => p.e1rm));
    });
    
    datasets.push({
      label: 'Massimale stimato (1RM)',
      data: data1RM,
      borderColor: isLight ? '#047857' : '#22c55e',
      backgroundColor: isLight ? 'rgba(4, 120, 87, 0.08)' : 'rgba(34, 197, 94, 0.05)',
      borderWidth: 2,
      pointBackgroundColor: isLight ? '#047857' : '#16a34a',
      pointBorderColor: isLight ? '#ffffff' : '#ffffff',
      pointRadius: 3,
      pointHoverRadius: 5,
      fill: true,
      spanGaps: true,
      showLine: true
    });
  } else if (modeGraficoStorico.value === 'C') {
    const activePoints = dataPoints.filter(p => selectedBuckets.value.includes(p.bucket));
    const labelsWithReps = activePoints.map(p => `${p.label} (${p.reps}r)`);
    const dataCarico = activePoints.map(p => p.peso);
    
    datasets.push({
      label: 'Carico sollevato',
      data: dataCarico,
      borderColor: isLight ? '#ea580c' : '#f97316',
      backgroundColor: isLight ? 'rgba(234, 88, 12, 0.15)' : 'rgba(249, 115, 22, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: isLight ? '#c2410c' : '#ea580c',
      pointBorderColor: '#ffffff',
      pointRadius: 5,
      pointHoverRadius: 7,
      fill: true,
      tension: 0.15
    });
    
    storicoChartData.value = {
      labels: labelsWithReps,
      datasets: datasets
    };
    storicoChartOptions.value = getChartOptions(isLight);
    storicoChartReady.value = true;
    return;
  }
  
  storicoChartData.value = {
    labels: labels,
    datasets: datasets
  };
  storicoChartOptions.value = getChartOptions(isLight);
  storicoChartReady.value = true;
};

const getChartOptions = (isLight) => ({
  responsive: true,
  maintainAspectRatio: false,
  onClick: (event, elements, chart) => {
    if (elements && elements.length > 0) {
      const firstEl = elements[0];
      const datasetIndex = firstEl.datasetIndex;
      const index = firstEl.index;
      gestisciClickGrafico(datasetIndex, index);
    }
  },
  plugins: {
    legend: {
      position: 'top',
      labels: {
        color: isLight ? '#0f172a' : '#cbd5e1',
        boxWidth: 8,
        font: { size: 9, weight: 'bold' }
      }
    },
    tooltip: {
      callbacks: {
        label: function(context) {
          const index = context.dataIndex;
          const datasetIndex = context.datasetIndex;
          const label = context.dataset.label;
          const val = context.raw;
          if (val === null) return null;
          
          let dateInfo = '';
          
          if (modeGraficoStorico.value === 'C') {
            const activePoints = rawPointsLocal.value.filter(p => selectedBuckets.value.includes(p.bucket));
            const pt = activePoints[index];
            if (pt) {
              if (pt.date) {
                dateInfo = ` | Data: ${formattaDataStorico(pt.date)} (${tempoTrascorso(pt.date)})`;
              }
              return ` Peso: ${pt.peso} kg (${pt.reps} reps) | 1RM: ${pt.e1rm} kg${dateInfo}`;
            }
          } else {
            const lbl = context.chart.data.labels[index];
            const pts = rawPointsLocal.value.filter(p => p.label === lbl);
            if (pts.length > 0) {
              const pt = pts[0];
              if (pt.date) {
                dateInfo = ` | Data: ${formattaDataStorico(pt.date)} (${tempoTrascorso(pt.date)})`;
              }
            }
            
            if (label.includes('1RM') || label.includes('Massimale')) {
              return ` 1RM Stimato: ${val} kg${dateInfo}`;
            } else {
              return ` Carico (${label}): ${val} kg${dateInfo}`;
            }
          }
          return ` ${label}: ${val} kg`;
        }
      }
    }
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: {
        color: isLight ? '#334155' : '#94a3b8',
        font: { weight: 'bold', size: 8 }
      }
    },
    y: {
      grid: { color: isLight ? 'rgba(15, 23, 42, 0.1)' : 'rgba(255, 255, 255, 0.08)' },
      ticks: {
        color: isLight ? '#334155' : '#94a3b8',
        callback: function(value) {
          return value + ' kg';
        }
      }
    }
  }
});

const storicoChartOptions = ref(getChartOptions(document.documentElement.getAttribute('data-theme') === 'light'));

const gestisciClickGrafico = (datasetIndex, index) => {
  let pt = null;
  if (modeGraficoStorico.value === 'C') {
    const activePoints = rawPointsLocal.value.filter(p => selectedBuckets.value.includes(p.bucket));
    pt = activePoints[index];
  } else {
    const label = storicoChartData.value.labels[index];
    const dataset = storicoChartData.value.datasets[datasetIndex];
    if (!dataset) return;
    const bucketName = dataset.label;
    
    pt = rawPointsLocal.value.find(p => p.label === label && p.bucket === bucketName);
    
    if (!pt && (bucketName.includes('1RM') || bucketName.includes('Massimale'))) {
      const pts = rawPointsLocal.value.filter(p => p.label === label && selectedBuckets.value.includes(p.bucket));
      if (pts.length > 0) {
        pts.sort((a, b) => b.e1rm - a.e1rm);
        pt = pts[0];
      }
    }
  }
  
  if (pt) {
    const match = pt.label.match(/S\.(\d+)-W(\d+)/);
    if (match) {
      const sNum = match[1];
      const wNum = match[2];
      const origEx = storicoFiltrato.value.find(ex => String(ex.num_scheda) === String(sNum));
      selectedPointDetails.value = {
        label: pt.label,
        scheda: sNum,
        week: wNum,
        peso: pt.peso,
        reps: pt.reps,
        e1rm: pt.e1rm,
        date: pt.date,
        giorno: origEx ? origEx.des_giorno : '',
        note: origEx ? (origEx.des_note || '') : '',
        noteAttrezzo: origEx ? (origEx.des_note_attrezzo || '') : '',
        noteGen: origEx ? (origEx.des_note_gen_attr || '') : ''
      };
    }
  }
};

const analisiAndamentoEsercizio = computed(() => {
  if (!rawPointsLocal.value || rawPointsLocal.value.length === 0) {
    return null;
  }
  
  const pts = [...rawPointsLocal.value];
  pts.sort((a, b) => {
    const matchA = a.label.match(/S\.(\d+)-W(\d+)/);
    const matchB = b.label.match(/S\.(\d+)-W(\d+)/);
    if (matchA && matchB) {
      const sA = parseInt(matchA[1]);
      const wA = parseInt(matchA[2]);
      const sB = parseInt(matchB[1]);
      const wB = parseInt(matchB[2]);
      if (sA !== sB) return sA - sB;
      return wA - wB;
    }
    return 0;
  });
  
  const firstPt = pts[0];
  const lastPt = pts[pts.length - 1];
  
  let pctDiff = 0;
  if (firstPt.e1rm > 0) {
    pctDiff = parseFloat((((lastPt.e1rm - firstPt.e1rm) / firstPt.e1rm) * 100).toFixed(1));
  }
  
  let badgeColor = 'grey';
  let badgeText = 'Stabile';
  let giudizio = '';
  let consigli = '';
  
  if (pctDiff > 5) {
    badgeColor = 'green-darken-2';
    badgeText = 'Progressione Eccellente';
    giudizio = `Incremento del Massimale Teorico del **+${pctDiff}%** (da ${firstPt.e1rm} kg a ${lastPt.e1rm} kg). Stai progredendo molto bene con il sovraccarico progressivo.`;
    consigli = "Continua così! Se completi le ripetizioni target con facilità, aumenta gradualmente il carico mantendo stabile il TUT (Tempo Sotto Tensione).";
  } else if (pctDiff >= -3 && pctDiff <= 5) {
    badgeColor = 'amber-darken-3';
    badgeText = 'Fase di Stallo / Consolidamento';
    giudizio = `Massimale Teorico stabile con variazione del **${pctDiff >= 0 ? '+' : ''}${pctDiff}%** (da ${firstPt.e1rm} kg a ${lastPt.e1rm} kg). Ottimo per consolidare la forza.`;
    consigli = "Se sei bloccato da diverse settimane, prova ad applicare una progressione di volume (più reps a parità di peso) prima di salire col carico, oppure effettua uno scarico mirato.";
  } else {
    badgeColor = 'red-darken-3';
    badgeText = 'Flessione del Carico';
    giudizio = `Flessione del Massimale Teorico del **${pctDiff}%** (da ${firstPt.e1rm} kg a ${lastPt.e1rm} kg).`;
    consigli = "Un calo della forza stimata può essere causato da stanchezza sistemica (necessità di scarico), da una tecnica di esecuzione più rigida e controllata, o da variazioni nel ROM. Cura il riposo.";
  }
  
  const recordPerFascia = [];
  selectedBuckets.value.forEach(bucket => {
    const bucketPts = pts.filter(p => p.bucket === bucket);
    if (bucketPts.length > 0) {
      bucketPts.sort((a, b) => b.peso - a.peso);
      const best = bucketPts[0];
      recordPerFascia.push({
        bucket: bucket,
        maxPeso: best.peso,
        reps: best.reps,
        label: best.label,
        date: best.date
      });
    }
  });
  
  return {
    pctDiff,
    badgeColor,
    badgeText,
    giudizio,
    consigli,
    firstPt,
    lastPt,
    records: recordPerFascia
  };
});

watch(raggruppamentoReps, () => {
  selectedBuckets.value = [];
});

watch([stileStorico, modeGraficoStorico, raggruppamentoReps, selectedBuckets, storicoFiltrato], () => {
  if (stileStorico.value === 'grafico') {
    rigeneraGraficoStorico();
  }
}, { deep: true });

// Funzione scroll per lo storico
function eseguiScrollStorico() {
  setTimeout(() => {
    // 1. Scroll della Tabella (Modalità Tabella)
    if (storicoTableContainer.value) {
      const colWidth = 110; 
      const scrollPosHoriz = (settimanaAttiva.value - 1) * colWidth + 17;
      
      storicoTableContainer.value.scrollTo({
        left: scrollPosHoriz,
        top: storicoTableContainer.value.scrollHeight + 1000,
        behavior: 'smooth'
      });
    }

    // 2. Scroll generale del Dialog (necessario per Modalità Timeline)
    if (storicoScrollContainer.value) {
      const scrollEl = storicoScrollContainer.value.$el || storicoScrollContainer.value;
      scrollEl.scrollTo({
        top: scrollEl.scrollHeight + 1000,
        behavior: 'smooth'
      });
    }
  }, 450);
}

// Funzione Riepilogo Storico Esercizi (freccia con orologio)
const apriStoricoEsercizio = async () => {
  vibraTattile(10);
  activeTabAnalisi.value = 1; // Tab Cronologia
  dialogStorico.value = true;
  soloCorrispondenti.value = true;
  await caricaDatiAnalisi(settimanaAttiva.value);
  eseguiScrollStorico();
};

const vaiADettaglioStorico = (prevExIdOrObj) => {
  vibraTattile(12);
  if (!prevExIdOrObj) return;

  let targetItem = null;
  if (typeof prevExIdOrObj === 'object' && prevExIdOrObj !== null) {
    if (prevExIdOrObj.num_scheda && (prevExIdOrObj.ins_week1 !== undefined || prevExIdOrObj.des_week1 !== undefined || prevExIdOrObj.num_riga !== undefined)) {
      targetItem = prevExIdOrObj;
    } else if (prevExIdOrObj.id || prevExIdOrObj.num_riga) {
      const idSearch = String(prevExIdOrObj.id || prevExIdOrObj.num_riga);
      targetItem = (storicoEsercizio.value || []).find(ex => String(ex.id) === idSearch || String(ex.num_riga) === idSearch);
    }
  }

  if (!targetItem && typeof prevExIdOrObj !== 'object') {
    const targetIdStr = String(prevExIdOrObj);
    if (storicoEsercizio.value && storicoEsercizio.value.length > 0) {
      targetItem = storicoEsercizio.value.find(ex => 
        String(ex.id) === targetIdStr || 
        String(ex.num_riga) === targetIdStr
      );
    }
    if (!targetItem && globalStoryboard.value && globalStoryboard.value.length > 0) {
      targetItem = globalStoryboard.value.find(ex => 
        String(ex.id) === targetIdStr || 
        String(ex.num_riga) === targetIdStr
      );
    }
  }

  if (targetItem) {
    previousWorkout.value = applicaModificheLocali({ ...targetItem });
    for (let w = 1; w <= 6; w++) {
      inputSettimanePrecedente.value[w].ins = previousWorkout.value['ins_week' + w] || '';
      inputSettimanePrecedente.value[w].reps = previousWorkout.value['reps_week' + w] || '';
    }
    numIns6ValPrecedente.value = previousWorkout.value.num_ins6 || '';
    numFaticaw6ValPrecedente.value = previousWorkout.value.num_faticaw6 || '';
    
    dialogProgressioniPrecedente.value = true;
  } else {
    dialogStorico.value = false;
    dialogAiutoProposta.value = false;
    const targetId = String(typeof prevExIdOrObj === 'object' ? (prevExIdOrObj.id || prevExIdOrObj.num_riga) : prevExIdOrObj);
    if (targetId) {
      router.push({ name: 'DettaglioWorkout', params: { id: targetId } });
    }
  }
};

const isVolumeString = (str) => {
  if (!str) return false;
  return /V:\s*[\d,.]+/i.test(str) && /(?:A|B|C):\s*[\d,.]+/i.test(str);
};

const isEsercizioVPercentuale = computed(() => {
  if (!workout.value) return false;
  const flg = String(workout.value.flg_perc || '').toUpperCase();
  if (flg.includes('V%') || flg.includes('%V') || flg.includes('V_PERC')) return true;
  const des2 = String(workout.value.des_esercizio_2 || '');
  if (isVolumeString(des2) || /V%\s*[\d,.]+/i.test(des2) || /%\s*V/i.test(des2)) return true;
  
  for (let w = 1; w <= 6; w++) {
    const p = String(workout.value[`des_week${w}`] || '');
    if (p.includes('%') || /V%/i.test(p)) return true;
  }
  return false;
});

const vPercStats = computed(() => {
  if (!isEsercizioVPercentuale.value || !workout.value) return null;
  
  let rmtBase = 0;
  const rmtObj = parsedRmt(workout.value.des_esercizio_2);
  if (rmtObj && rmtObj.massimale) {
    rmtBase = parseFloat(rmtObj.massimale.replace(',', '.')) || 0;
  }
  
  let bestReale = 0;
  if (rawPointsLocal.value && rawPointsLocal.value.length > 0) {
    rawPointsLocal.value.forEach(p => {
      if (p.e1rm > bestReale) bestReale = p.e1rm;
    });
  }
  
  if (rmtBase === 0 && bestReale > 0) {
    rmtBase = Math.round(bestReale);
  }
  
  const diffKgRaw = bestReale > 0 && rmtBase > 0 ? (bestReale - rmtBase).toFixed(1) : '0';
  const diffPctRaw = rmtBase > 0 ? (((bestReale - rmtBase) / rmtBase) * 100).toFixed(1) : '0';
  
  const diffKgNum = parseFloat(diffKgRaw);
  const diffPctNum = parseFloat(diffPctRaw);
  
  return {
    rmtBase: rmtBase || 'N.D.',
    bestReale: bestReale > 0 ? bestReale : 'N.D.',
    diffKg: diffKgNum >= 0 ? `+${diffKgNum}` : `${diffKgNum}`,
    diffPct: diffPctNum >= 0 ? `+${diffPctNum}` : `${diffPctNum}`
  };
});

const haColonnaDestraAlta = computed(() => {
  if (!workout.value) return false;
  return !!parsedRmt(workout.value.des_esercizio_2) || isVolumeString(workout.value.des_esercizio_2);
});

const parseVolumeString = (str) => {
  if (!str) return { v: '0', a: '0', b: '0', c: '0' };
  
  const getVal = (prefix) => {
    const regex = new RegExp(`${prefix}:\\s*([\\d,.]+)`, 'i');
    const match = str.match(regex);
    return match ? match[1] : '0';
  };
  
  return {
    v: getVal('V'),
    a: getVal('A'),
    b: getVal('B'),
    c: getVal('C')
  };
};

// Helper per tracciare il recupero tramite tag [RECUPERA]
const haRecupero = (val) => {
  if (!val) return false;
  
  // 1. Rimuove QUALSIASI contenuto tra parentesi tonde (...) in modo che note o commenti tra parentesi non attivino mai il recupero
  const clean = String(val).replace(/\([^)]*\)/g, ' ').trim();
  if (!clean) return false;

  const str = clean.toLowerCase();

  // Se la frase contiene una negazione esplicita, NON è un recupero!
  if (str.includes('non è più da fare') || str.includes('non piu da fare') || str.includes('non è da fare') || str.includes('non da fare') || str.includes('da non fare')) {
    return false;
  }
  
  if (str.includes('[recuperato]') || str.includes('recuperato') || str.includes('recuperata') || str.includes('recuperati')) {
    return false;
  }
  
  if (str.includes('[recupera]')) {
    return true;
  }
  
  const keywords = [
    'da finire',
    'da fare',
    'manca una serie',
    'mancano serie',
    'serie mancante',
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
    'solo tre',
    'rimandato',
    'rimanda'
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

const toggleRecuperoDettaglio = (sett, attivo) => {
  vibraTattile(15);
  const valoreAttuale = (activeEditingWeek.value === sett && localEditingRaw[sett] !== undefined) ? localEditingRaw[sett] : (inputSettimane.value[sett]?.ins || '');
  const nuovoValore = impostaRecuperoValore(valoreAttuale, attivo);
  if (!inputSettimane.value[sett]) {
    inputSettimane.value[sett] = { ins: '', reps: '' };
  }
  inputSettimane.value[sett].ins = nuovoValore;
  localEditingRaw[sett] = nuovoValore;
  localEditingIns.value[sett] = nuovoValore;
  const el = document.getElementById('input-peso-w' + sett);
  if (el) el.value = nuovoValore;
  salvaDatoSettimanale(sett, 'ins');
};

const salvaModifichePendenti = async () => {
  if (!workout.value) return;
  
  if (activeEditingWeek.value) {
    const sett = activeEditingWeek.value;
    if (inputSettimane.value[sett]) {
      inputSettimane.value[sett].ins = localEditingRaw[sett] ?? localEditingIns.value[sett] ?? '';
    }
  }

  const updates = {};
  
  for (let w = 1; w <= 6; w++) {
    const valNuovo = inputSettimane.value[w].ins;
    const valOriginale = workout.value['ins_week' + w] || '';
    if (valNuovo !== valOriginale) {
      const campo = `ins_week${w}`;
      updates[campo] = valNuovo;
      
      // Auto-estrazione per la week 6
      if (w === 6) {
        const valStr = String(valNuovo || '').trim();
        if (!valStr) {
          numIns6Val.value = '';
          updates.num_ins6 = '';
          numFaticaw6Val.value = '';
          updates.num_faticaw6 = '';
          numIns6ModificatoManualmente.value = false;
        } else if (!numIns6ModificatoManualmente.value) {
          const estratto = estraiNumeroMassimo(valNuovo);
          if (estratto !== null) {
            numIns6Val.value = String(estratto);
            updates.num_ins6 = String(estratto);
          }
        }
      }
    }
  }
  
  if (noteEsercizio.value !== (workout.value.ins_esercizio || '')) {
    updates.ins_esercizio = noteEsercizio.value;
  }
  if (commentiAtleta.value !== (workout.value.des_commenti || '')) {
    updates.des_commenti = commentiAtleta.value;
  }
  if (numIns6Val.value !== (workout.value.num_ins6 || '')) {
    updates.num_ins6 = numIns6Val.value;
  }
  
  if (Object.keys(updates).length > 0) {
    await aggiornaDatoECommit(updates);
  }
};

onBeforeRouteLeave(async (to, from) => {
  if (to.name === 'Workouts') {
    transitionName.value = ''; // Reset animazione se torni alla lista
  }
  document.activeElement?.blur();
  await salvaModifichePendenti();
});

onBeforeRouteUpdate(async (to, from) => {
  document.activeElement?.blur();
  await salvaModifichePendenti();
});

const dialogSettore = ref(false);
const caricandoSettore = ref(false);
const eserciziSettore = ref([]);
const settoreSelezionatoNome = ref('');
const settoreSecondarioTarget = ref('');

const getSettorePrincipale = (s) => {
  if (!s) return 'Altro';
  const clean = s.trim().toLowerCase();
  
  if (clean.includes('pectoral') || clean.includes('petto')) {
    return 'Petto';
  }
  if (clean.includes('back') || clean.includes('latissimus') || clean.includes('dorsal') || clean.includes('trapezius') || clean.includes('erector')) {
    return 'Dorsali';
  }
  if (clean.includes('deltoid') || clean.includes('spall')) {
    return 'Deltoidi';
  }
  if (clean.includes('biceps') || clean.includes('bicipiti') || clean.includes('brachialis') || clean.includes('brachioradialis')) {
    return 'Bicipiti';
  }
  if (clean.includes('triceps') || clean.includes('tricipiti')) {
    return 'Tricipiti';
  }
  if (clean.includes('quadriceps') || clean.includes('ischiocrurali') || clean.includes('gluteus') || clean.includes('glutei') || clean.includes('hip') || clean.includes('soleus') || clean.includes('gastrocnemius') || clean.includes('adductor') || clean.includes('abductor') || clean.includes('femorali') || clean.includes('quadricipiti') || clean.includes('gambe')) {
    return 'Gambe';
  }
  if (clean.includes('abdomis') || clean.includes('addome') || clean.includes('oblique') || clean.includes('obliqui')) {
    return 'Addome';
  }
  
  return s; // Fallback
};

const apriListaSettore = async () => {
  if (!workout.value) return;
  vibraTattile(10);
  
  const settore = workout.value.des_settore || 'Generico';
  const settorePrincipale = getSettorePrincipale(settore);
  settoreSelezionatoNome.value = settorePrincipale;
  settoreSecondarioTarget.value = settore;
  dialogSettore.value = true;
  caricandoSettore.value = true;
  eserciziSettore.value = [];
  
  try {
    const { key: keyIdCliente, id: atletaId } = getAtletaInfo(workout.value);
    const currentNumScheda = String(workout.value.num_scheda);
    
    if (!atletaId || !currentNumScheda) {
      caricandoSettore.value = false;
      return;
    }

    const q = query(
      collection(db, 'STORYBOARD'),
      where(keyIdCliente, '==', atletaId),
      where('num_scheda', '==', currentNumScheda)
    );
    const snap = await getDocs(q);
    const list = [];
    snap.forEach((doc) => {
      const d = doc.data();
      if (parseInt(d.num_riga_giorno) > 0) {
        list.push({ id: doc.id, ...d });
      }
    });

    if (list.length === 0) {
      const allData = await getStoryboardBackup();
      const matched = allData.filter(b => {
        const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
        return String(bAtletaId) === String(atletaId) &&
               String(b.num_scheda) === String(currentNumScheda) &&
               parseInt(b.num_riga_giorno) > 0;
      });
      matched.forEach(item => list.push(item));
    }

    const filtrati = list.filter(ex => {
      return getSettorePrincipale(ex.des_settore) === settorePrincipale;
    });

    filtrati.sort((a, b) => {
      const isTargetA = a.des_settore === settoreSecondarioTarget.value;
      const isTargetB = b.des_settore === settoreSecondarioTarget.value;
      
      if (isTargetA && !isTargetB) return -1;
      if (!isTargetA && isTargetB) return 1;
      
      const giornoA = String(a.des_giorno || '').trim();
      const giornoB = String(b.des_giorno || '').trim();
      if (giornoA !== giornoB) {
        return giornoA.localeCompare(giornoB);
      }
      return (parseInt(a.num_riga_giorno) || 0) - (parseInt(b.num_riga_giorno) || 0);
    });

    eserciziSettore.value = filtrati;
  } catch (err) {
    console.error("Errore caricamento esercizi settore:", err);
  } finally {
    caricandoSettore.value = false;
  }
};

const vaiAdEsercizioSettore = (id) => {
  vibraTattile(12);
  dialogSettore.value = false;
  router.push({ name: 'DettaglioWorkout', params: { id } });
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
.sticky-timeline-header {
  position: sticky;
  top: -12px; /* Compensa esattamente il padding del dialog per incollarsi in alto */
  z-index: 10;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.5); /* Ombra per staccare dal contenuto che scorre sotto */
  backdrop-filter: blur(10px);
}

}

.min-height-screen {
  min-height: calc(100vh - 100px);
}

.sticky-detail-header {
  position: sticky !important;
  top: 48px !important; /* sticks below the 48px height compact global app bar */
  z-index: 100 !important;
  background: #030712 !important; /* solid background matching body */
  padding-top: 6px !important;
  padding-bottom: 0px !important; /* Was 8px, removed to eliminate space below header */
  margin-top: -8px !important;
}

.appsheet-top-bar {
  border-bottom: 2px solid var(--theme-primary) !important;
  padding-bottom: 4px; /* Was 8px, reduced to tighten header height */
}

.text-slate-dark {
  color: #f8fafc !important;
}

.text-slate {
  color: #cbd5e1 !important;
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

.uppercase {
  text-transform: uppercase;
}

.bg-slate-50 {
  background-color: transparent !important;
}

.bg-slate-100 {
  background-color: var(--card-bg-soft) !important;
}

.border-bottom-soft {
  border-bottom: 1px solid var(--card-border) !important;
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

.premium-card {
  background: var(--card-bg-glass) !important;
  backdrop-filter: blur(16px);
  border: 1px solid var(--card-border);
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
  background: var(--card-bg-soft) !important;
  border: 1px solid var(--card-border);
  transition: all 0.2s ease;
}

.week-active-border {
  border: 2px solid var(--theme-primary) !important;
  background-color: var(--theme-primary-bg-soft) !important;
  box-shadow: 0 0 15px var(--theme-primary-glow) !important;
}

.week-prescription-text {
  border-left: 3px solid #ffb74d;
  color: #fb923c !important;
  background-color: rgba(30, 41, 59, 0.3) !important;
}

.card-glass {
  background: var(--card-bg-glass) !important;
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
  opacity: 0.45;
  background: rgba(30, 41, 59, 0.15) !important;
  border: 1px dashed rgba(255, 255, 255, 0.08) !important;
  transform: scale(0.975);
  box-shadow: none !important;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
}

.week-secondary-card:focus-within,
.week-secondary-card:hover {
  opacity: 0.95;
  transform: scale(1);
  background: var(--card-bg-glass) !important;
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

.clickable-sector-chip {
  cursor: pointer !important;
  transition: all 0.2s ease !important;
}
.clickable-sector-chip:hover {
  filter: brightness(1.15) !important;
  transform: translateY(-1px) scale(1.02);
}

.recovery-standout-chip {
  background: linear-gradient(135deg, #f97316, #ea580c) !important;
  color: #ffffff !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.45) !important;
  animation: pulse-glow-recovery 2.5s infinite alternate ease-in-out;
}
.recovery-standout-chip:hover {
  filter: brightness(1.1) !important;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.8) !important;
  animation-play-state: paused;
}
@keyframes pulse-glow-recovery {
  0% {
    box-shadow: 0 0 4px rgba(249, 115, 22, 0.3);
    transform: scale(1);
  }
  100% {
    box-shadow: 0 0 14px rgba(249, 115, 22, 0.8), 0 0 3px rgba(255, 255, 255, 0.3);
    transform: scale(1.04);
  }
}

/* Nuovi Stili Premium per Superserie in Dettaglio */
.superset-detail-card {
  background: rgba(249, 115, 22, 0.02) !important;
  border: 1.5px solid rgba(249, 115, 22, 0.25) !important;
  box-shadow: 0 8px 32px 0 rgba(249, 115, 22, 0.05) !important;
}

.horizontal-scroll-clean {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.horizontal-scroll-clean::-webkit-scrollbar {
  display: none;
}

.superset-carosello-item {
  background: rgba(30, 41, 59, 0.45) !important;
  border: 1px solid rgba(249, 115, 22, 0.15) !important;
  transition: transform 0.2s ease, background 0.2s ease;
}

.superset-carosello-item:active {
  transform: scale(0.96);
  background: rgba(30, 41, 59, 0.7) !important;
}

.border-left-orange {
  border-left: 2px solid var(--theme-primary) !important;
}

.card-glass-dark {
  background: var(--card-bg-dark);
  backdrop-filter: blur(8px);
}

/* Box e riquadro input carico settimanale (custom-weight-input) */
.custom-weight-input {
  background: rgba(255, 255, 255, 0.07) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
  box-sizing: border-box !important;
}

.custom-weight-input:hover {
  background: rgba(255, 255, 255, 0.1) !important;
  border-color: rgba(255, 255, 255, 0.32) !important;
}

.custom-weight-input:focus-within {
  background: rgba(255, 255, 255, 0.12) !important;
  border-color: var(--theme-primary, #f97316) !important;
  box-shadow: 0 0 12px var(--theme-primary-glow, rgba(249, 115, 22, 0.25)) !important;
}

.custom-weight-input :deep(.v-label) {
  opacity: 0.35 !important;
  color: #cbd5e1 !important;
  font-weight: 500 !important;
}

.custom-weight-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}
.custom-weight-input :deep(.v-field--focused) {
  background: rgba(255, 255, 255, 0.18) !important;
  border-color: var(--theme-primary) !important;
  box-shadow: 0 0 10px var(--theme-primary-glow) !important;
}
.custom-weight-input :deep(.v-field__outline) {
  display: none !important;
}

.native-week-textarea {
  font-family: inherit !important;
  font-weight: 800 !important;
  font-size: 0.92rem !important;
  line-height: 1.45 !important;
  color: #cbd5e1 !important;
  caret-color: #f97316 !important;
}
.native-week-textarea::placeholder {
  color: #94a3b8 !important;
  opacity: 0.55 !important;
  font-weight: 500 !important;
  font-size: 0.80rem !important;
}
[data-theme="light"] .native-week-textarea {
  color: #1e293b !important;
}
[data-theme="light"] .native-week-textarea::placeholder {
  color: #64748b !important;
  opacity: 0.65 !important;
}

/* Stile per input compatto */
.custom-compact-textarea :deep(.v-field) {
  min-height: 40px !important;
  border-radius: 8px !important;
}
.custom-compact-textarea :deep(.v-field__input) {
  padding-top: 6px !important;
  padding-bottom: 6px !important;
}
.custom-compact-textarea :deep(input),
.custom-compact-textarea :deep(textarea),
.custom-weight-input :deep(input),
.custom-weight-input :deep(textarea) {
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
  font-weight: 800 !important;
}
.custom-compact-textarea :deep(.v-label) {
  font-size: 0.8rem !important;
  top: 14px !important;
}
.custom-compact-textarea :deep(.v-field__append-inner) {
  padding-top: 10px !important;
}

/* Colori Caselle di Testo Dinamiche (Mai bianche/grigie se piene) */
/* VERDE (Record Battuto o W1) */
.ghost-glow-green.custom-weight-input,
.ghost-glow-green.custom-prev-ins-field,
.ghost-glow-green :deep(.v-field) {
  background: rgba(16, 185, 129, 0.1) !important;
  border: 1px solid rgba(16, 185, 129, 0.45) !important;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.25) !important;
}
.ghost-glow-green :deep(.v-field--focused),
.ghost-glow-green.custom-prev-ins-field:focus { border-color: #10b981 !important; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4) !important; }
.ghost-glow-green,
.ghost-glow-green.custom-prev-ins-field,
.ghost-glow-green .ins-num-highlight,
.ghost-glow-green .ins-rep-highlight,
.ghost-glow-green .ins-text-muted { 
  color: #34d399 !important; 
}
.ghost-glow-green :deep(input), 
.ghost-glow-green :deep(textarea) { 
  color: #34d399 !important; 
  font-weight: 800 !important;
}
.ghost-glow-green :deep(.v-label) { color: #34d399 !important; opacity: 0.9 !important; }

/* BLU (Carico Calato) */
.ghost-glow-blue.custom-weight-input,
.ghost-glow-blue.custom-prev-ins-field,
.ghost-glow-blue :deep(.v-field) {
  background: rgba(59, 130, 246, 0.1) !important;
  border: 1px solid rgba(59, 130, 246, 0.45) !important;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.25) !important;
}
.ghost-glow-blue :deep(.v-field--focused),
.ghost-glow-blue.custom-prev-ins-field:focus { border-color: #3b82f6 !important; box-shadow: 0 0 20px rgba(59, 130, 246, 0.4) !important; }
.ghost-glow-blue,
.ghost-glow-blue.custom-prev-ins-field,
.ghost-glow-blue .ins-num-highlight,
.ghost-glow-blue .ins-rep-highlight,
.ghost-glow-blue .ins-text-muted { 
  color: #60a5fa !important; 
}
.ghost-glow-blue :deep(input), 
.ghost-glow-blue :deep(textarea) { 
  color: #60a5fa !important; 
  font-weight: 800 !important;
}
.ghost-glow-blue :deep(.v-label) { color: #60a5fa !important; opacity: 0.9 !important; }

/* THEME ACCENT (Testo generico senza Ghost o note) */
.ghost-glow-orange.custom-weight-input,
.ghost-glow-orange.custom-prev-ins-field,
.ghost-glow-orange :deep(.v-field) {
  background: var(--theme-primary-bg-soft) !important;
  border: 1px solid var(--theme-primary-border) !important;
  box-shadow: 0 0 16px var(--theme-primary-glow) !important;
}
.ghost-glow-orange :deep(.v-field--focused),
.ghost-glow-orange.custom-prev-ins-field:focus { border-color: var(--theme-primary) !important; box-shadow: 0 0 20px var(--theme-primary-glow) !important; }
.ghost-glow-orange,
.ghost-glow-orange.custom-prev-ins-field,
.ghost-glow-orange .ins-num-highlight,
.ghost-glow-orange .ins-rep-highlight,
.ghost-glow-orange .ins-text-muted { 
  color: var(--theme-primary-light) !important; 
}
.ghost-glow-orange :deep(input), 
.ghost-glow-orange :deep(textarea) { 
  color: var(--theme-primary-light) !important; 
  font-weight: 800 !important;
}
.ghost-glow-orange :deep(.v-label) { color: var(--theme-primary-light) !important; opacity: 0.9 !important; }

.animate-fade-in {
  animation: fadeIn 0.3s ease-in-out;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(2px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Note e commenti textareas */
.custom-textarea-input :deep(.v-field) {
  background: rgba(255, 255, 255, 0.12) !important;
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}
.custom-textarea-input :deep(.v-field--focused) {
  background: rgba(255, 255, 255, 0.18) !important;
  border-color: var(--theme-primary) !important;
  box-shadow: 0 0 10px var(--theme-primary-glow) !important;
}
.custom-textarea-input :deep(.v-field__outline) {
  display: none !important;
}

/* Nuovi Stili per lo Storico Esercizi (Tabella e Timeline) */
.timeline-red-cell {
  background: rgba(239, 68, 68, 0.12) !important;
  border: 1px solid rgba(239, 68, 68, 0.4) !important;
  box-shadow: 0 0 10px rgba(239, 68, 68, 0.15) !important;
}

.text-red {
  color: #f87171 !important; /* rosso chiaro per dark mode */
}

.table-responsive-wrapper {
  max-width: 100%;
  max-height: 50vh; /* Forza lo scroll verticale interno alla tabella */
  overflow-x: auto;
  overflow-y: auto; /* Abilita lo scroll verticale qui dentro */
  -webkit-overflow-scrolling: touch;
  background: var(--card-bg-soft);
  position: relative;
}

.premium-storico-table {
  border-collapse: collapse;
  font-family: inherit;
}

.header-cell {
  position: sticky;
  top: 0;
  background: rgba(30, 41, 59, 0.98);
  color: #fb923c;/* Arancione per le intestazioni week */
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 6px 8px;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
  z-index: 3;
  white-space: normal !important;
  word-break: break-word !important;
}

.body-cell {
  padding: 5px 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  color: #cbd5e1;
  vertical-align: middle;
  text-align: center;
  white-space: normal !important;
  word-break: break-word !important;
}

.table-row {
  transition: background-color 0.15s ease;
}

.table-row:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.sticky-col {
  position: sticky;
  left: 0;
  background-color: #0b1329 !important;
  z-index: 5;
  border-right: 1.5px solid rgba(255, 255, 255, 0.12);
}

th.sticky-col {
  position: sticky;
  left: 0;
  top: 0;
  background-color: #0f172a !important;
  z-index: 12; /* Massimo z-index per l'angolo in alto a sinistra (Scheda) */
  border-right: 1.5px solid rgba(255, 255, 255, 0.12);
}

/* Red highlights for matching reps range */
.red-cell {
  background-color: rgba(239, 68, 68, 0.15) !important;
  border: 1px solid rgba(239, 68, 68, 0.45) !important;
  box-shadow: inset 0 0 8px rgba(239, 68, 68, 0.2) !important;
}

.red-cell .text-muted {
  color: #fca5a5 !important;
}

.red-cell strong, .red-cell span, .red-cell div {
  color: #ef4444 !important;
}

.red-scheda-cell {
  background-color: #2b1116 !important;
  border-right: 2.5px solid #ef4444 !important;
}

.red-scheda-header {
  background-color: #2b1116 !important;
  border: 1px solid rgba(239, 68, 68, 0.35) !important;
}

.note-cell {
  white-space: normal !important;
  word-break: break-word !important;
  min-width: 120px;
  max-width: 180px;
}

/* Stili per la Tabella Progressioni Precedenti Compatta */
.compact-prev-table {
  background: var(--card-bg-soft);
}

.prev-row:hover {
  background-color: rgba(255, 255, 255, 0.02);
}

.custom-compact-ins-field {
  border: 1px solid rgba(255, 255, 255, 0.25) !important;
  background: rgba(255, 255, 255, 0.12) !important;
  transition: all 0.2s ease;
  font-family: inherit;
  white-space: pre-wrap;
  word-break: break-word;
}

.custom-compact-ins-field:focus {
  border-color: #f97316 !important;
  background: rgba(255, 255, 255, 0.18) !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.5) !important;
}

.tiny-save-snackbar :deep(.v-snackbar__wrapper) {
  min-width: 90px !important;
  max-width: 110px !important;
  height: 28px !important;
  min-height: 28px !important;
}
.tiny-save-snackbar :deep(.v-snackbar__content) {
  padding: 0px 8px !important;
  height: 28px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}

/* Animazioni Swipe */
.swipe-next-enter-active, .swipe-next-leave-active,
.swipe-prev-enter-active, .swipe-prev-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

/* swipe-next: il nuovo entra da destra (100%), il vecchio esce a sinistra (-100%) */
.swipe-next-enter-from { transform: translateX(100%); opacity: 0; }
.swipe-next-leave-to { transform: translateX(-100%); opacity: 0; }

/* swipe-prev: il nuovo entra da sinistra (-100%), il vecchio esce a destra (100%) */
.swipe-prev-enter-from { transform: translateX(-100%); opacity: 0; }
.swipe-prev-leave-to { transform: translateX(100%); opacity: 0; }

.header-cell {
  position: sticky;
  top: 0;
  background: rgba(30, 41, 59, 0.98);
  color: #fb923c;
  font-size: 0.65rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  padding: 6px 8px;
  border-bottom: 1.5px solid rgba(255, 255, 255, 0.08);
  z-index: 10; /* Aumentato per stare sopra alle righe scorrevoli */
  white-space: normal !important;
  word-break: break-word !important;
  height: 28px !important; 
  line-height: 1 !important;
  vertical-align: middle;
  padding: 4px 8px !important;
}

.bg-orange-darken-4 {
  background: #431407 !important; /* Colore evidenziatore per la colonna attiva */
  border-bottom: 2px solid #f97316 !important;
}

.scrollbar-hidden::-webkit-scrollbar {
  display: none;
}
.scrollbar-hidden {
  -ms-overflow-style: none;
  scrollbar-width: none;
}

/* Light Mode Overrides per Dettaglio.vue */
[data-theme="light"] .sticky-detail-header,
[data-theme="light"] .appsheet-top-bar {
  background: var(--nav-bg) !important;
  border-bottom: 1px solid var(--card-border) !important;
}

[data-theme="light"] .prescription-chip-box {
  background: var(--card-bg-soft) !important;
  border: 1px solid var(--card-border) !important;
  box-shadow: inset 0 1px 2px rgba(15, 23, 42, 0.03) !important;
}

[data-theme="light"] .prescription-chip-box:hover {
  background: var(--card-border) !important;
  border-color: var(--brand-accent) !important;
}

[data-theme="light"] .week-prescription-text {
  background-color: var(--brand-accent-bg) !important;
  color: var(--brand-accent) !important;
  border-left: 3px solid var(--brand-accent) !important;
}

[data-theme="light"] .custom-weight-input,
[data-theme="light"] .custom-weight-input :deep(.v-field),
[data-theme="light"] .custom-textarea-input :deep(.v-field) {
  background: var(--card-bg-glass, rgba(0, 0, 0, 0.04)) !important;
  border: 1.5px solid var(--card-border, rgba(0, 0, 0, 0.14)) !important;
}

[data-theme="light"] .custom-weight-input:hover {
  background: rgba(0, 0, 0, 0.06) !important;
  border-color: rgba(0, 0, 0, 0.22) !important;
}

[data-theme="light"] .custom-weight-input:focus-within,
[data-theme="light"] .custom-weight-input :deep(.v-field--focused),
[data-theme="light"] .custom-textarea-input :deep(.v-field--focused) {
  background: #ffffff !important;
  border-color: var(--brand-accent, var(--theme-primary, #f97316)) !important;
  box-shadow: 0 0 10px var(--brand-accent-glow, var(--theme-primary-glow)) !important;
}

[data-theme="light"] .custom-weight-input :deep(.v-label),
[data-theme="light"] .custom-textarea-input :deep(.v-label) {
  color: var(--text-muted) !important;
  opacity: 0.85 !important;
}

[data-theme="light"] .custom-weight-input :deep(input),
[data-theme="light"] .custom-weight-input :deep(textarea),
[data-theme="light"] .custom-textarea-input :deep(input),
[data-theme="light"] .custom-textarea-input :deep(textarea) {
  color: var(--text-dark) !important;
  font-weight: 700 !important;
}

[data-theme="light"] .ghost-glow-green.custom-weight-input,
[data-theme="light"] .ghost-glow-green.custom-prev-ins-field,
[data-theme="light"] .ghost-glow-green :deep(.v-field) {
  background: #f0fdf4 !important;
  border: 1px solid #86efac !important;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.15) !important;
}
[data-theme="light"] .ghost-glow-green,
[data-theme="light"] .ghost-glow-green :deep(input),
[data-theme="light"] .ghost-glow-green :deep(textarea),
[data-theme="light"] .ghost-glow-green.custom-prev-ins-field,
[data-theme="light"] .ghost-glow-green .ins-num-highlight,
[data-theme="light"] .ghost-glow-green .ins-rep-highlight,
[data-theme="light"] .ghost-glow-green .ins-text-muted {
  color: var(--color-emerald-700) !important;
}
[data-theme="light"] .ghost-glow-green :deep(.v-label) {
  color: var(--color-emerald-700) !important;
}

[data-theme="light"] .ghost-glow-blue.custom-weight-input,
[data-theme="light"] .ghost-glow-blue.custom-prev-ins-field,
[data-theme="light"] .ghost-glow-blue :deep(.v-field) {
  background: #eff6ff !important;
  border: 1px solid #93c5fd !important;
  box-shadow: 0 0 10px rgba(59, 130, 246, 0.15) !important;
}
[data-theme="light"] .ghost-glow-blue,
[data-theme="light"] .ghost-glow-blue :deep(input),
[data-theme="light"] .ghost-glow-blue :deep(textarea),
[data-theme="light"] .ghost-glow-blue.custom-prev-ins-field,
[data-theme="light"] .ghost-glow-blue .ins-num-highlight,
[data-theme="light"] .ghost-glow-blue .ins-rep-highlight,
[data-theme="light"] .ghost-glow-blue .ins-text-muted {
  color: var(--color-blue-700) !important;
}
[data-theme="light"] .ghost-glow-blue :deep(.v-label) {
  color: var(--color-blue-700) !important;
}

[data-theme="light"] .ghost-glow-orange.custom-weight-input,
[data-theme="light"] .ghost-glow-orange.custom-prev-ins-field,
[data-theme="light"] .ghost-glow-orange :deep(.v-field) {
  background: var(--brand-accent-bg) !important;
  border: 1.5px solid var(--theme-primary-border) !important;
  box-shadow: 0 0 10px var(--brand-accent-glow) !important;
}
[data-theme="light"] .ghost-glow-orange,
[data-theme="light"] .ghost-glow-orange :deep(input),
[data-theme="light"] .ghost-glow-orange :deep(textarea),
[data-theme="light"] .ghost-glow-orange.custom-prev-ins-field,
[data-theme="light"] .ghost-glow-orange .ins-num-highlight,
[data-theme="light"] .ghost-glow-orange .ins-rep-highlight,
[data-theme="light"] .ghost-glow-orange .ins-text-muted {
  color: var(--text-dark) !important;
  font-weight: 700 !important;
}
[data-theme="light"] .ghost-glow-orange :deep(.v-label) {
  color: var(--brand-accent) !important;
  font-weight: 700 !important;
}

[data-theme="light"] .week-log-card {
  background: var(--card-bg-glass) !important;
  border: 1px solid var(--card-border) !important;
}

[data-theme="light"] .week-active-border {
  border: 2px solid var(--brand-accent) !important;
  background-color: var(--brand-accent-bg) !important;
}

[data-theme="light"] .rmt-premium-card {
  background: var(--card-bg-glass) !important;
  border: 1px solid var(--card-border) !important;
}

[data-theme="light"] .text-red {
  color: var(--color-red-700) !important;
}

[data-theme="light"] .header-cell {
  background: var(--card-bg-soft) !important;
  color: var(--brand-accent) !important;
  border-bottom: 1.5px solid var(--card-border) !important;
}

[data-theme="light"] .body-cell {
  color: var(--text-slate) !important;
  border-bottom: 1px solid var(--card-border) !important;
}

[data-theme="light"] .sticky-col {
  background-color: #ffffff !important;
  border-right: 1.5px solid var(--card-border) !important;
}

[data-theme="light"] th.sticky-col {
  background-color: #f8fafc !important;
  border-right: 1.5px solid var(--card-border) !important;
}

[data-theme="light"] .red-scheda-cell {
  background-color: #fef2f2 !important;
  border-right: 2.5px solid #ef4444 !important;
}

[data-theme="light"] .red-scheda-header {
  background-color: #fef2f2 !important;
  border: 1px solid rgba(239, 68, 68, 0.35) !important;
}

/* --- LIGHT THEME OVERRIDES FOR CRONOLOGIA & PROPOSTA CARICO MODAL --- */
.inner-indicator-box {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

[data-theme="light"] .inner-indicator-box {
  background: rgba(15, 23, 42, 0.04) !important;
  border: 1px solid rgba(15, 23, 42, 0.08) !important;
  backdrop-filter: blur(4px);
}

.card-attuale-box {
  background-color: #0f172a;
  border-color: rgba(249, 115, 22, 0.3) !important;
}

[data-theme="light"] .card-attuale-box {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%) !important;
  border-color: rgba(249, 115, 22, 0.35) !important;
}

.card-record-box {
  background-color: #0f172a;
  border-color: rgba(6, 182, 212, 0.3) !important;
}

[data-theme="light"] .card-record-box {
  background: linear-gradient(135deg, rgba(6, 182, 212, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%) !important;
  border-color: rgba(6, 182, 212, 0.35) !important;
}

.card-tactical-box {
  background-color: #020617;
  border-color: rgba(245, 158, 11, 0.2) !important;
}

[data-theme="light"] .card-tactical-box {
  background: linear-gradient(135deg, rgba(245, 158, 11, 0.08) 0%, rgba(255, 255, 255, 0.9) 100%) !important;
  border-color: rgba(245, 158, 11, 0.3) !important;
}

[data-theme="light"] .card-glass-dark {
  background: var(--card-bg-glass) !important;
  border-color: var(--card-border) !important;
  box-shadow: var(--card-shadow) !important;
}

[data-theme="light"] .v-card-title.bg-slate-900,
[data-theme="light"] .bg-slate-900,
[data-theme="light"] .bg-slate-950,
[data-theme="light"] .bg-black {
  background-color: var(--bg-main) !important;
  color: var(--text-dark) !important;
  border-color: var(--card-border) !important;
}

[data-theme="light"] .card-glass-dark .text-white:not(.v-btn *):not(.v-chip *):not(.v-btn):not(.v-chip) {
  color: var(--text-dark) !important;
}

[data-theme="light"] .card-glass-dark .text-slate-light,
[data-theme="light"] .card-glass-dark .text-slate-300,
[data-theme="light"] .card-glass-dark .text-slate-400 {
  color: var(--text-slate) !important;
}

[data-theme="light"] .card-glass-dark [style*="cbd5e1"],
[data-theme="light"] .card-glass-dark [style*="f8fafc"] {
  color: var(--text-dark) !important;
}

[data-theme="light"] .card-glass-dark .v-chip.v-chip--variant-tonal {
  color: var(--text-dark) !important;
  background: var(--card-bg-soft) !important;
  border: 1px solid var(--card-border) !important;
}

[data-theme="light"] .card-glass-dark .v-tab:not(.v-tab--selected) {
  color: var(--text-slate) !important;
}

[data-theme="light"] .record-hero-pr-assoluto {
  background: linear-gradient(135deg, #e0f2fe 0%, #f0f9ff 100%) !important;
  border-color: #38bdf8 !important;
}

[data-theme="light"] .record-hero-reps {
  background: linear-gradient(135deg, #fef3c7 0%, #fffbe6 100%) !important;
  border-color: #f59e0b !important;
}

[data-theme="light"] .record-hero-target {
  background: linear-gradient(135deg, #ffedd5 0%, #fff7ed 100%) !important;
  border-color: #fb923c !important;
}

[data-theme="light"] .red-scheda-header {
  background-color: #fee2e2 !important;
  border: 1px solid #fca5a5 !important;
}

[data-theme="light"] .red-scheda-header .text-slate-dark {
  color: #991b1b !important;
}

[data-theme="light"] .dialog-header-title,
[data-theme="light"] .table-scheda-title,
[data-theme="light"] .record-hero-num,
[data-theme="light"] .opzione-peso-text,
[data-theme="light"] .banner-record-text,
[data-theme="light"] .dialog-text-primary,
[data-theme="light"] .text-slate-dark {
  color: var(--text-dark) !important;
}

[data-theme="light"] .table-header-title {
  color: var(--brand-accent) !important;
}

[data-theme="light"] .table-prescription-text {
  color: var(--text-slate) !important;
}

[data-theme="light"] .text-slate-light {
  color: var(--text-slate) !important;
}

[data-theme="light"] .text-muted {
  color: var(--text-slate) !important;
}

[data-theme="light"] .text-cyan-lighten-2,
[data-theme="light"] .text-cyan-lighten-3,
[data-theme="light"] .text-cyan-lighten-4 {
  color: var(--color-cyan-700) !important;
}

[data-theme="light"] .text-amber-lighten-1,
[data-theme="light"] .text-amber-lighten-2,
[data-theme="light"] .text-amber-lighten-3 {
  color: var(--color-amber-700) !important;
}

[data-theme="light"] .text-orange-lighten-2,
[data-theme="light"] .text-orange-lighten-3 {
  color: var(--color-orange-700) !important;
}

[data-theme="light"] .text-green-accent-3,
[data-theme="light"] .text-green-lighten-2,
[data-theme="light"] .text-green-lighten-3 {
  color: var(--color-emerald-700) !important;
}

[data-theme="light"] .text-purple-lighten-2,
[data-theme="light"] .text-purple-lighten-3 {
  color: var(--color-purple-700) !important;
}

[data-theme="light"] .text-blue-lighten-2,
[data-theme="light"] .text-blue-lighten-3 {
  color: var(--color-blue-700) !important;
}

/* Tabella Cronologia */
[data-theme="light"] .premium-storico-table {
  background-color: var(--card-bg-glass) !important;
}

[data-theme="light"] .premium-storico-table th.header-cell {
  background-color: var(--card-bg-soft) !important;
  color: var(--text-slate) !important;
  border-bottom: 2px solid var(--card-border) !important;
}

[data-theme="light"] .premium-storico-table th.header-cell.bg-orange-darken-4 {
  background-color: var(--brand-accent-bg) !important;
  color: var(--brand-accent) !important;
}

[data-theme="light"] .premium-storico-table td.body-cell {
  background-color: var(--card-bg-glass) !important;
  color: var(--text-dark) !important;
  border-bottom: 1px solid var(--card-border) !important;
}

[data-theme="light"] .premium-storico-table td.body-cell.red-scheda-cell {
  background-color: #fef2f2 !important;
  color: #991b1b !important;
}

[data-theme="light"] .premium-storico-table tr.table-row:hover td.body-cell {
  background-color: var(--bg-main) !important;
}

[data-theme="light"] .red-cell,
[data-theme="light"] .timeline-red-cell {
  background-color: #fef2f2 !important;
  border: 1.5px solid #fca5a5 !important;
}

[data-theme="light"] .timeline-red-cell .table-prescription-text {
  color: #b91c1c !important;
}

/* --- STILI DEDICATI PER PULSANTI FEELING & SUPERSERIE (TEMA CHIARO & SCURO) --- */
.btn-feeling-item {
  background-color: rgba(30, 41, 59, 0.8) !important;
  color: #cbd5e1 !important;
  font-weight: 900 !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}

.btn-feeling-item.btn-feeling-selected {
  background-color: #d97706 !important;
  color: #ffffff !important;
  border-color: #f59e0b !important;
  box-shadow: 0 4px 12px rgba(217, 119, 6, 0.4) !important;
}

[data-theme="light"] .btn-feeling-item {
  background-color: var(--card-bg-soft) !important;
  color: var(--text-dark) !important;
  border: 1.5px solid var(--card-border) !important;
}

[data-theme="light"] .btn-feeling-item.btn-feeling-selected {
  background-color: var(--brand-accent) !important;
  color: #ffffff !important;
  border-color: var(--brand-accent) !important;
  box-shadow: 0 4px 12px var(--brand-accent-glow) !important;
}

.superset-header-title {
  color: #d8b4fe !important;
}

.superset-linked-item {
  background-color: rgba(30, 41, 59, 0.7) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
}

.superset-ex-name {
  color: #ffffff !important;
}

.superset-ex-sub {
  color: #c084fc !important;
}

[data-theme="light"] .superset-header-title {
  color: var(--color-purple-700) !important;
}

[data-theme="light"] .superset-linked-item {
  background-color: #f3e8ff !important;
  border: 1.5px solid #c084fc !important;
  box-shadow: 0 4px 14px rgba(124, 58, 237, 0.12) !important;
}

[data-theme="light"] .superset-ex-name {
  color: #3b0764 !important;
}

[data-theme="light"] .superset-ex-sub {
  color: #6b21a8 !important;
}

[data-theme="light"] .prescription-chip-box {
  background-color: var(--card-bg-soft) !important;
  border: 1.5px solid var(--card-border) !important;
}

[data-theme="light"] .prescription-chip-box .text-slate-dark {
  color: var(--text-dark) !important;
}

.custom-prev-ins-field {
  border: 1px solid rgba(255, 255, 255, 0.2);
  background: rgba(255, 255, 255, 0.08) !important;
  color: var(--text-dark) !important;
}

.custom-prev-ins-field:focus {
  outline: none !important;
  border-color: var(--theme-primary, #f97316) !important;
  box-shadow: 0 0 8px var(--theme-primary-glow, rgba(249, 115, 22, 0.25)) !important;
}

[data-theme="light"] .custom-prev-ins-field {
  background: var(--card-bg-soft) !important;
  border: 1.5px solid var(--card-border) !important;
  color: var(--text-dark) !important;
}

[data-theme="light"] .custom-prev-ins-field:focus {
  border-color: var(--brand-accent) !important;
  box-shadow: 0 0 8px var(--brand-accent-glow) !important;
}

[data-theme="light"] .coaching-integrated-header {
  background: var(--brand-accent-bg, rgba(249, 115, 22, 0.08)) !important;
  border: 1px solid var(--theme-primary-border, rgba(249, 115, 22, 0.25)) !important;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.03) !important;
}

.coaching-integrated-header {
  background: var(--theme-primary-bg-soft, rgba(249, 115, 22, 0.08));
  border: 1px solid var(--theme-primary-border, rgba(249, 115, 22, 0.25));
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.2);
}

[data-theme="light"] .coaching-integrated-header .text-slate-dark {
  color: var(--text-dark, #0f172a) !important;
}

[data-theme="light"] .week-secondary-card {
  opacity: 0.92 !important;
  background: #ffffff !important;
  border: 1px solid #e2e8f0 !important;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.03) !important;
}

[data-theme="light"] .week-secondary-card .text-slate-dark {
  color: #0f172a !important;
  font-weight: 800 !important;
}

[data-theme="light"] .week-secondary-card .text-slate {
  color: #334155 !important;
  font-weight: 700 !important;
}

[data-theme="light"] .week-active-chip {
  background: var(--brand-accent-bg, rgba(249, 115, 22, 0.12)) !important;
  border: 1px solid var(--brand-accent, #ea580c) !important;
  color: var(--brand-accent, #ea580c) !important;
  font-weight: 900 !important;
}

[data-theme="light"] .week-altre-chip {
  background: #f1f5f9 !important;
  border-color: #cbd5e1 !important;
  color: #475569 !important;
  font-weight: 800 !important;
}

[data-theme="light"] .btn-scorso-action {
  background: var(--brand-accent-bg, #fff7ed) !important;
  border: 1px solid var(--brand-accent, #ea580c) !important;
  color: var(--brand-accent, #ea580c) !important;
  font-weight: 800 !important;
}

[data-theme="light"] .btn-storico-action {
  background: #f0fdf4 !important;
  border: 1px solid #059669 !important;
  color: #047857 !important;
  font-weight: 800 !important;
}

[data-theme="light"] .rmt-premium-card {
  background: #ffffff !important;
  border: 1.5px solid #e2e8f0 !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.04) !important;
}

[data-theme="light"] .rmt-premium-card .text-cyan-lighten-2 {
  color: #0e7490 !important;
  font-weight: 900 !important;
}

[data-theme="light"] .rmt-premium-card .text-amber-lighten-1,
[data-theme="light"] .rmt-premium-card .text-amber-lighten-2 {
  color: #b45309 !important;
  font-weight: 900 !important;
}

[data-theme="light"] .rmt-premium-card .text-muted {
  color: #475569 !important;
  font-weight: 800 !important;
}

[data-theme="light"] .rmt-premium-card .border-right-soft {
  border-right: 1px solid #e2e8f0 !important;
}

[data-theme="light"] .rmt-premium-card .border-top-soft {
  border-top: 1px solid #e2e8f0 !important;
}

/* W6 Feedback Box Premium Styling */
.w6-feedback-premium-box {
  margin-top: 16px !important;
  background: linear-gradient(145deg, rgba(30, 41, 59, 0.45), rgba(15, 23, 42, 0.75)) !important;
  border: 1px solid rgba(245, 158, 11, 0.28) !important;
  box-shadow: 0 4px 18px -2px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.06);
  backdrop-filter: blur(14px);
}

.stepper-row-glass {
  background: rgba(15, 23, 42, 0.5) !important;
}

.w6-stepper-container {
  background: rgba(30, 41, 59, 0.65) !important;
  border-color: rgba(249, 115, 22, 0.35) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
  height: 34px;
}

.w6-stepper-input {
  width: 50px;
  border: none;
  outline: none;
  background: transparent;
  font-size: 0.95rem;
  letter-spacing: -0.02em;
}

.stepper-btn {
  width: 26px !important;
  height: 26px !important;
  min-width: 26px !important;
  border-radius: 8px !important;
  background: rgba(255, 255, 255, 0.06) !important;
  transition: all 0.15s ease;
}
.stepper-btn:active {
  transform: scale(0.92);
  background: rgba(249, 115, 22, 0.25) !important;
}

.w6-fatica-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 6px;
  width: 100%;
}

.w6-fatica-pill {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  height: 34px;
  padding: 0 4px;
  border-radius: 10px;
  background: rgba(30, 41, 59, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: var(--text-slate-light, #94a3b8);
  font-weight: 800;
  font-size: 0.69rem;
  letter-spacing: -0.01em;
  white-space: nowrap;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.w6-fatica-pill .pill-icon {
  font-size: 0.85rem;
}

.w6-fatica-pill:hover {
  background: rgba(30, 41, 59, 0.8);
  border-color: rgba(255, 255, 255, 0.15);
}

.w6-fatica-pill.active-media {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.28), rgba(16, 185, 129, 0.18)) !important;
  border-color: #22c55e !important;
  color: #4ade80 !important;
  box-shadow: 0 0 12px rgba(34, 197, 94, 0.25);
  transform: translateY(-1px);
}

.w6-fatica-pill.active-pesante {
  background: linear-gradient(135deg, rgba(249, 115, 22, 0.35), rgba(234, 88, 12, 0.2)) !important;
  border-color: #f97316 !important;
  color: #fb923c !important;
  box-shadow: 0 0 12px rgba(249, 115, 22, 0.3);
  transform: translateY(-1px);
}

.w6-fatica-pill.active-devastante {
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.35), rgba(220, 38, 38, 0.2)) !important;
  border-color: #ef4444 !important;
  color: #f87171 !important;
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.35);
  transform: translateY(-1px);
}

/* Light Theme Overrides per W6 Box */
[data-theme="light"] .w6-feedback-premium-box {
  background: #ffffff !important;
  border: 1.5px solid #fed7aa !important;
  box-shadow: 0 2px 10px rgba(249, 115, 22, 0.08) !important;
}

[data-theme="light"] .stepper-row-glass {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
}

[data-theme="light"] .w6-stepper-container {
  background: #ffffff !important;
  border-color: #cbd5e1 !important;
}

[data-theme="light"] .w6-stepper-input {
  color: #0f172a !important;
}

[data-theme="light"] .w6-fatica-pill {
  background: #f8fafc !important;
  border-color: #e2e8f0 !important;
  color: #64748b !important;
}

[data-theme="light"] .w6-fatica-pill.active-media {
  background: #f0fdf4 !important;
  border-color: #16a34a !important;
  color: #15803d !important;
}

[data-theme="light"] .w6-fatica-pill.active-pesante {
  background: #fff7ed !important;
  border-color: #ea580c !important;
  color: #c2410c !important;
}

[data-theme="light"] .w6-fatica-pill.active-devastante {
  background: #fef2f2 !important;
  border-color: #dc2626 !important;
  color: #b91c1c !important;
}

/* Evidenziazione luminosa target durante scroll da Controllo Qualità */
.evidenzia-esercizio-scroll {
  animation: pulse-glow-target 2.6s ease-in-out !important;
  border-color: #f97316 !important;
  border-width: 2px !important;
  box-shadow: 0 0 25px rgba(249, 115, 22, 0.7), 0 0 10px rgba(249, 115, 22, 0.35) inset !important;
  position: relative;
  z-index: 10;
}

@keyframes pulse-glow-target {
  0% {
    box-shadow: 0 0 0 rgba(249, 115, 22, 0);
    transform: scale(1);
  }
  25% {
    box-shadow: 0 0 32px rgba(249, 115, 22, 0.95), 0 0 15px rgba(249, 115, 22, 0.5) inset;
    transform: scale(1.018);
  }
  65% {
    box-shadow: 0 0 20px rgba(249, 115, 22, 0.75), 0 0 8px rgba(249, 115, 22, 0.3) inset;
    transform: scale(1.008);
  }
  100% {
    box-shadow: 0 0 0 rgba(249, 115, 22, 0);
    transform: scale(1);
  }
}

</style>
