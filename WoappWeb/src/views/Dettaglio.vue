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
              class="font-weight-black text-white mr-1.5 px-1.5 py-0"
              variant="flat"
              style="min-width: 20px; height: 16px; font-size: 0.62rem; display: inline-flex; vertical-align: middle; line-height: 1;"
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
              color="amber-darken-3"
              variant="flat"
              size="x-small"
              class="font-weight-black text-white ml-1.5 px-1.5 py-0"
              style="font-size: 0.62rem; height: 16px; display: inline-flex; cursor: pointer; vertical-align: middle; line-height: 1;"
              @click="avviaTimerRecupero(workout.des_rec_report, workout.des_esercizio)"
            >
              ⏱️ {{ workout.des_rec_report }}
            </v-chip>
          </h3>
        </div>
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
          Stai guardando l'esercizio della <strong class="text-white">Scheda {{ workout.num_scheda }}</strong>. Le modifiche qui alterano il passato.
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
          <strong class="text-green-lighten-2">Giorno Completato!</strong> Questa sessione è già stata contrassegnata come completata per la <strong class="text-white">Week {{ settimanaAttiva }}</strong>.
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
    <div v-else class="exercise-detail-area">

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
            class="image-premium-frame overflow-hidden elevation-2 bg-black w-100" 
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

          <!-- Icone di Azione Rapida allineate sotto la GIF (solo se la colonna destra è alta) -->
          <div v-if="haColonnaDestraAlta" class="d-flex align-center justify-center gap-2 mt-2">
            <!-- Tasto Storico -->
            <v-btn
              icon
              variant="flat"
              color="rgba(255, 255, 255, 0.05)"
              class="card-glass border border-soft"
              :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
              style="width: 32px; height: 32px; min-width: 32px; border-radius: 50% !important;"
              @click="apriStoricoEsercizio"
              title="Storico Esercizio"
            >
              <v-icon :size="layoutCorrente === 'super_compatto' ? 16 : 19" color="orange-lighten-2">mdi-history</v-icon>
            </v-btn>

            <!-- Tasto WhatsApp -->
            <v-btn
              icon
              variant="flat"
              color="rgba(255, 255, 255, 0.05)"
              class="card-glass border border-soft"
              :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
              style="width: 32px; height: 32px; min-width: 32px; border-radius: 50% !important;"
              @click="inviaVideoWhatsApp"
              title="Invia Video al Coach"
            >
              <v-icon :size="layoutCorrente === 'super_compatto' ? 14 : 17" color="orange-lighten-2">mdi-whatsapp</v-icon>
            </v-btn>
          </div>
        </div>

        <!-- GIF dell'Esercizio Standard (per layout normale) -->
        <v-card 
          v-else
          class="image-premium-frame overflow-hidden elevation-2 bg-black flex-shrink-0 mx-auto mb-3 rounded-xl" 
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
          <!-- Single Sfida Record Badge -->
          <div v-if="getRiferimentoSfidaRecord(settimanaAttiva)" class="mt-2 pt-1.5 border-top-soft text-left">
            <span class="text-super-caption text-amber-lighten-1 font-weight-black d-inline-flex align-center gap-1" style="font-size: 0.62rem;" :title="getRiferimentoSfidaRecord(settimanaAttiva).isStima ? 'Calcolato da stima massimale storico' : 'Record storico reale'">
              🏆 Sfida Record: {{ formatWeight(getRiferimentoSfidaRecord(settimanaAttiva).peso + getWeightStep(isManubriEsercizio(workout), getRiferimentoSfidaRecord(settimanaAttiva).peso)) }} kg
            </span>
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

        <!-- Rigo Dettaglio Rapido -->
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

          <!-- 3. Fallback Chip Sfida Record per esercizi senza RMT -->
          <v-chip
            v-if="!parsedRmt(workout.des_esercizio_2) && getRiferimentoSfidaRecord(settimanaAttiva)"
            color="amber-darken-3"
            variant="tonal"
            size="x-small"
            class="font-weight-black px-2 py-0.5"
            :title="getRiferimentoSfidaRecord(settimanaAttiva).isStima ? 'Calcolato da stima massimale storico' : 'Record storico reale'"
          >
            🏆 Sfida: {{ formatWeight(getRiferimentoSfidaRecord(settimanaAttiva).peso + getWeightStep(isManubriEsercizio(workout), getRiferimentoSfidaRecord(settimanaAttiva).peso)) }} kg
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
                ⏱️ <strong class="text-white">1ª Cifra ({{ parsedTut.f1 }}s):</strong> Fase iniziale del movimento (da quando parte l’esercizio).
              </div>
              <div class="mb-1">
                ⏱️ <strong class="text-white">2ª Cifra ({{ parsedTut.f2 }}s):</strong> Fase di contrazione (mantenere la tensione).
              </div>
              <div class="mb-1.5">
                ⏱️ <strong class="text-white">3ª Cifra ({{ parsedTut.f3 }}s):</strong> Fase di ritorno (quando il movimento torna indietro o si conclude).
              </div>
              <div class="pt-2 text-super-caption text-muted font-italic" style="border-top: 1px solid rgba(255, 255, 255, 0.08) !important;">
                Attenzione: la prima e la terza fase non sono per forza concentrica o eccentrica in modo fisso, dipende da come inizia l’esercizio (1ª fase da quando parte, 2ª in contrazione, 3ª di ritorno o chiusura).
              </div>
            </div>
          </v-card>
        </v-expand-transition>

        <!-- Action Row (Precedente, Elimina, Storico, WhatsApp) -->
        <div :class="[layoutCorrente === 'super_compatto' ? 'mt-1 mb-0.5 pt-1' : 'mt-2 mb-1 pt-2', 'd-flex align-center justify-space-between px-1 border-top-soft gap-2 flex-wrap']">
          <div class="d-flex align-center gap-2">
            <!-- Tasto PRECEDENTE -->
            <v-btn
              v-if="previousWorkout"
              prepend-icon="mdi-calendar-arrow-left"
              variant="text"
              color="orange-darken-3"
              class="font-weight-black text-none px-2"
              :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
              @click="dialogProgressioniPrecedente = true"
              :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem', letterSpacing: '0.05em' }"
            >
              PRECEDENTE
            </v-btn>

            <!-- Tasto MODIFICA (solo Coach) -->
            <v-btn
              v-if="ruolo === 'coach'"
              icon
              variant="text"
              color="orange-lighten-2"
              :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
              @click="apriDialogModifica"
              title="Modifica Esercizio"
            >
              <v-icon :size="layoutCorrente === 'super_compatto' ? 16 : 20">mdi-pencil</v-icon>
            </v-btn>

            <!-- Tasto ELIMINA (solo Coach) -->
            <v-btn
              v-if="ruolo === 'coach'"
              icon
              variant="text"
              color="red-lighten-2"
              :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
              @click="dialogElimina = true"
              title="Elimina Esercizio"
            >
              <v-icon :size="layoutCorrente === 'super_compatto' ? 16 : 20">mdi-delete</v-icon>
            </v-btn>
          </div>

          <div v-if="!['compatto', 'super_compatto'].includes(layoutCorrente) || !haColonnaDestraAlta" class="d-flex align-center gap-2">
            <!-- Tasto Freccia con Orologio (Riepilogo Storico) -->
            <v-btn
              icon
              variant="text"
              color="orange-darken-3"
              :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
              @click="apriStoricoEsercizio"
              title="Storico Esercizio"
            >
              <v-icon :size="layoutCorrente === 'super_compatto' ? 18 : 22">mdi-history</v-icon>
            </v-btn>

            <!-- Tasto Aereo (WhatsApp) -->
            <v-btn
              icon
              variant="text"
              color="orange-darken-3"
              :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
              @click="inviaVideoWhatsApp"
              title="Invia Video al Coach"
            >
              <v-icon :size="layoutCorrente === 'super_compatto' ? 16 : 20">mdi-whatsapp</v-icon>
            </v-btn>
          </div>
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
          <v-icon color="orange-darken-2" class="mr-2 flex-shrink-0 mt-0.5" size="20">mdi-alert-decagram</v-icon>
          <div class="flex-grow-1">
            <h4 class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-1" style="font-size: 0.85rem !important;">
              ⚠️ Coach Warning: Nessuna Progressione nel Mesociclo Precedente
            </h4>
            <p class="text-slate-light font-weight-medium mb-2" style="font-size: 0.72rem; line-height: 1.4; color: #ffedd5 !important;">
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

      <!-- 3. Note Coach, Setup Attrezzo e Tecnica (Unificati e Compatti) -->
      <v-card
        v-if="workout && ((workout.des_note && String(workout.des_note).trim()) || (workout.des_note_attrezzo && String(workout.des_note_attrezzo).trim()) || (workout.des_note_gen_attr && String(workout.des_note_gen_attr).trim()) || (workout.des_estesa_start && String(workout.des_estesa_start).trim()))"
        class="text-left border d-flex flex-column card-glass mb-3"
        :class="layoutCorrente === 'super_compatto' ? 'pa-2' : (layoutCorrente === 'compatto' ? 'pa-2.5' : 'pa-3')"
        :style="{
          background: 'rgba(249, 115, 22, 0.05) !important',
          border: '1px solid rgba(249, 115, 22, 0.2) !important',
          borderLeft: '3px solid #f97316 !important',
          borderRadius: layoutCorrente === 'super_compatto' ? '4px !important' : (layoutCorrente === 'compatto' ? '8px !important' : '10px !important')
        }"
      >
        <!-- Note Coach -->
        <div v-if="workout.des_note && String(workout.des_note).trim()" class="d-flex align-start" :class="{'mb-1.5': workout.des_note_attrezzo || workout.des_note_gen_attr || workout.des_estesa_start}">
          <v-icon color="orange-lighten-2" class="mr-2 flex-shrink-0 mt-0.5" size="14">mdi-information-outline</v-icon>
          <span class="text-orange-lighten-4 font-weight-medium" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.68rem' : '0.72rem', lineHeight: 1.35, color: '#ffedd5 !important' }">
            {{ String(workout.des_note).trim() }}
          </span>
        </div>

        <!-- Note Attrezzo -->
        <div v-if="workout.des_note_attrezzo && String(workout.des_note_attrezzo).trim()" class="d-flex align-start" :class="{'mb-1.5': workout.des_note_gen_attr || workout.des_estesa_start, 'mt-1.5 pt-1.5 border-top-soft': workout.des_note}">
           <v-icon color="grey-lighten-1" class="mr-2 flex-shrink-0 mt-0.5" size="14">mdi-wrench-outline</v-icon>
           <div class="text-slate-light" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : '0.70rem', lineHeight: 1.35 }">
             <strong class="text-orange-lighten-3 uppercase" style="font-size: 0.60rem;">Setup:</strong> {{ String(workout.des_note_attrezzo).trim() }}
           </div>
        </div>

        <!-- Note Generali Macchinario -->
        <div v-if="workout.des_note_gen_attr && String(workout.des_note_gen_attr).trim()" class="d-flex align-start" :class="{'mb-1.5': workout.des_estesa_start, 'mt-1.5 pt-1.5 border-top-soft': workout.des_note || workout.des_note_attrezzo}">
           <v-icon color="grey-lighten-1" class="mr-2 flex-shrink-0 mt-0.5" size="14">mdi-cogs</v-icon>
           <div class="text-slate-light" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : '0.70rem', lineHeight: 1.35 }">
             <strong class="text-orange-lighten-3 uppercase" style="font-size: 0.60rem;">Macchina:</strong> {{ String(workout.des_note_gen_attr).trim() }}
           </div>
        </div>

        <!-- Esecuzione / ROM -->
        <div v-if="workout.des_estesa_start && String(workout.des_estesa_start).trim()" class="d-flex align-start" :class="{'mt-1.5 pt-1.5 border-top-soft': workout.des_note || workout.des_note_attrezzo || workout.des_note_gen_attr}">
          <v-icon color="orange-lighten-2" class="mr-2 flex-shrink-0 mt-0.5" size="14">mdi-cog-play-outline</v-icon>
          <div class="text-slate-light" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : '0.70rem', lineHeight: 1.35 }">
            <strong class="text-orange-lighten-3 uppercase" style="font-size: 0.60rem;">Tecnica/ROM:</strong> {{ getDescrizioneBreve(workout.des_estesa_start) }}
          </div>
        </div>
      </v-card>

      <div class="weeks-stacked-list mb-4">
        <!-- Nota Esponenti (Ripetizioni di Riserva RIR) Super Compatta -->
         <div
          v-if="haEsponenti"
          class="d-flex align-center text-left mb-2 px-2"
        >
          <v-icon color="orange-lighten-2" class="mr-1.5 flex-shrink-0" size="14">mdi-information-outline</v-icon>
          <div class="text-slate-light font-weight-medium" style="font-size: 0.65rem; line-height: 1.2;">
            <strong class="text-orange-lighten-2">RIR:</strong> Il numero ad esponente (es. 8²) indica le ripetizioni di margine da tenere prima del cedimento.
          </div>
        </div>

        <template v-for="sett in settimaneVisualizzate" :key="sett">
        <v-card
          class="week-log-card border transition-all"
          :class="[
            layoutCorrente === 'super_compatto' ? 'rounded-sm py-1.5 px-2 mb-2.5' : (layoutCorrente === 'compatto' ? 'rounded-lg py-2 px-3 mb-4' : 'rounded-xl py-2.5 px-3 mb-6'),
            {
              'week-active-border': sett === settimanaAttiva,
              'week-secondary-card': modalitaSettimane === 'dinamica' && sett !== settimanaAttiva
            }
          ]"
          :style="[
            sett === settimanaAttiva ? (layoutCorrente === 'super_compatto' ? 'padding: 10px 10px 10px 10px !important;' : (layoutCorrente === 'compatto' ? 'padding: 12px 12px 14px 12px !important;' : 'padding: 14px 14px 16px 14px !important;')) : (modalitaSettimane === 'dinamica' ? 'opacity: 0.45 !important;' : '')
          ]"
          elevation="1"
        >
          <!-- Intestazione della Settimana -->
          <div class="d-flex align-center justify-space-between" :class="layoutCorrente === 'super_compatto' ? 'mb-1' : 'mb-2'">
            <div class="d-flex align-center">
              <v-icon
                :color="((route.query.targetWeek && parseInt(route.query.targetWeek) === sett) || haRecupero(inputSettimane[sett].ins)) ? 'red-lighten-2' : (isWeekCompleted(sett) ? 'green-darken-2' : 'grey-lighten-1')"
                class="mr-2"
                :size="layoutCorrente === 'super_compatto' ? 14 : 18"
              >
                {{ ((route.query.targetWeek && parseInt(route.query.targetWeek) === sett) || haRecupero(inputSettimane[sett].ins)) ? 'mdi-sync' : (isWeekCompleted(sett) ? 'mdi-check-circle' : 'mdi-circle-outline') }}
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
              <v-chip
                v-if="sett === settimanaAttiva || haRecupero(inputSettimane[sett].ins)"
                :color="((route.query.targetWeek && parseInt(route.query.targetWeek) === sett) || haRecupero(inputSettimane[sett].ins)) ? 'red-darken-2' : (isWeekCompleted(sett) ? 'green-accent-4' : 'orange-darken-3')"
                size="x-small"
                class="ml-2 font-weight-black px-1.5 text-white"
                :style="{ height: '16px', fontSize: '0.55rem' }"
                variant="flat"
              >
                {{ ((route.query.targetWeek && parseInt(route.query.targetWeek) === sett) || haRecupero(inputSettimane[sett].ins)) ? 'DA COMPLETARE' : (isWeekCompleted(sett) ? 'COMPLETATA' : 'ATTIVA') }}
              </v-chip>
              <v-chip v-else-if="modalitaSettimane === 'dinamica'" color="grey-darken-2" size="x-small" class="ml-2 font-weight-bold px-1.5" style="height: 16px; font-size: 0.55rem;" variant="outlined">ALTRE</v-chip>
            </div>
          </div>

          <!-- Prescrizione Tecnica Formattata (senza simboli strani) -->
          <div v-if="parsedPrescription(workout['des_week' + sett])" :class="layoutCorrente === 'super_compatto' ? 'mb-1 px-0.5' : 'mb-2 px-1'">
            <!-- Rigo Unico con Dettagli Carico e Intensità -->
            <v-row dense>
              <!-- Carico Totale -->
              <v-col :cols="parsedPrescription(workout['des_week' + sett]).side ? 4 : 4">
                <div 
                  class="prescription-chip-box text-left fill-height d-flex flex-column justify-center"
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
                  class="prescription-chip-box text-left fill-height d-flex flex-column justify-center"
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
                  class="prescription-chip-box text-left fill-height d-flex flex-column justify-center"
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
                  class="prescription-chip-box text-left fill-height d-flex flex-column justify-center"
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
              <p v-html="'📢 ' + formattaIstruzioneFine(workout.des_estesa_end, sett)" class="text-orange-lighten-3 font-weight-bold mb-0" style="font-size: 0.72rem; line-height: 1.4; color: #ffb74d !important;"></p>
            </div>
          </div>

          <div :class="[layoutCorrente === 'super_compatto' ? 'mt-1 mb-0.5' : (layoutCorrente === 'compatto' ? 'mt-2 mb-0.5' : 'mt-3.5 mb-1'), 'position-relative']">
            <div v-if="getGhostRenderInfo(sett)" :class="layoutCorrente === 'super_compatto' ? 'mb-0.5 px-1 animate-fade-in' : 'mb-1.5 px-1 animate-fade-in'">
              <div class="d-flex flex-column text-left">
                <!-- RIGA 1: Carico Consigliato + Badge / Icone -->
                <div class="d-flex align-center justify-space-between w-100">
                  <div class="d-flex align-center gap-1.5 min-width-0">
                    <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" :color="getGhostRenderInfo(sett).color">
                      {{ getGhostRenderInfo(sett).icon }}
                    </v-icon>
                    
                    <span class="font-weight-black text-uppercase text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.55rem' : '0.62rem', color: getGhostRenderInfo(sett).color, letterSpacing: '0.04em' }">
                      {{ getGhostRenderInfo(sett).label }}
                    </span>
                    
                    <span class="text-green-accent-3 font-weight-black" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.75rem' : '0.85rem' }">
                      {{ getGhostRenderInfo(sett).valueText }}
                    </span>
                    <span v-if="stileVisualizzazioneGhost === 'range' && getGhostWeightsRangeText(sett)" class="text-green-accent-3 font-weight-bold ml-1.5 text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.66rem' }">
                      • range: {{ getGhostWeightsRangeText(sett) }}
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
                    Usa <span class="text-green-accent-3 font-weight-bold">{{ formatWeight(getGhostLiftSmart(sett).peso) }} kg</span> (W2)
                    <span v-if="scaricoWeek4Weights.pesoW3">
                      • max <span class="text-green-accent-3 font-weight-bold">{{ formatWeight(scaricoWeek4Weights.pesoW3) }} kg</span> (W3)
                    </span>
                  </template>
                  
                  <!-- Caso Post Scarico o progressione standard -->
                  <template v-else>
                    <span v-if="getGhostLiftSmart(sett).text">
                      (prec. {{ getGhostLiftSmart(sett).label }}: <strong class="text-slate-light">{{ getGhostLiftSmart(sett).text }}</strong>)
                    </span>
                  </template>
                </div>
              </div>
            </div>
            
            <div v-if="getGhostLiftSmart(sett) && getGhostLiftSmart(sett).isScarico" class="text-super-caption font-weight-medium" :class="layoutCorrente === 'super_compatto' ? 'mt-0.5' : 'mt-1'" style="color: #fbbf24;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.55rem', lineSpace: 1.2, letterSpacing: '0.02em' }">
              💡 Non aumentare il peso oltre W3. Se leggero, aumenta le reps e scrivi es. <span class="text-green-accent-3 font-weight-black">{{ formatWeight(getGhostLiftSmart(sett).peso) }}kg x{{ getRepsPerWeek(sett) + 1 }}r</span>
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
                variant="outlined"
                color="blue-lighten-2"
                size="x-small"
                class="flex-grow-1 text-none px-2 rounded-lg"
                style="height: 32px; font-size: 0.72rem; min-width: 30%; max-width: 32%; background: rgba(144, 205, 244, 0.04);"
                @click="applicaPropostaCaricoRapida(sett, getGhostWeightsRangeForWeek(sett).prudenziale.value)"
              >
                <div class="d-flex flex-column align-center line-height-tight">
                  <span class="font-weight-black text-blue-lighten-3">{{ getGhostWeightsRangeForWeek(sett).prudenziale.display }}</span>
                  <span style="font-size: 0.52rem; opacity: 0.75;" class="text-truncate">
                    {{ sett === 1 ? getGhostWeightsRangeForWeek(sett).prudenziale.label : (stileVisualizzazioneGhost === 'forma' ? 'Stanco' : (stileVisualizzazioneGhost === 'marce' ? 'M1 (Safe)' : getGhostWeightsRangeForWeek(sett).prudenziale.label)) }}
                  </span>
                </div>
              </v-btn>

              <!-- 2. CONSIGLIATO / NORMALE / MARCIA 2 -->
              <v-btn
                color="green-darken-2"
                size="x-small"
                class="flex-grow-1 text-none px-2 rounded-lg text-white"
                style="height: 32px; font-size: 0.72rem; min-width: 30%; max-width: 32%;"
                @click="applicaPropostaCaricoRapida(sett, getGhostWeightsRangeForWeek(sett).consigliato.value)"
              >
                <div class="d-flex flex-column align-center line-height-tight">
                  <span class="font-weight-black">{{ getGhostWeightsRangeForWeek(sett).consigliato.display }}</span>
                  <span style="font-size: 0.52rem; opacity: 0.9;" class="text-truncate">
                    {{ sett === 1 ? getGhostWeightsRangeForWeek(sett).consigliato.label : (stileVisualizzazioneGhost === 'forma' ? 'Normale' : (stileVisualizzazioneGhost === 'marce' ? 'M2 (Prog)' : getGhostWeightsRangeForWeek(sett).consigliato.label)) }}
                  </span>
                </div>
              </v-btn>

              <!-- 3. SFIDANTE / FORTE / MARCIA 3 -->
              <v-btn
                variant="outlined"
                color="amber-darken-2"
                size="x-small"
                class="flex-grow-1 text-none px-2 rounded-lg"
                style="height: 32px; font-size: 0.72rem; min-width: 30%; max-width: 32%; background: rgba(245, 158, 11, 0.04);"
                @click="applicaPropostaCaricoRapida(sett, getGhostWeightsRangeForWeek(sett).sfidante.value)"
              >
                <div class="d-flex flex-column align-center line-height-tight">
                  <span class="font-weight-black text-amber-lighten-2">{{ getGhostWeightsRangeForWeek(sett).sfidante.display }}</span>
                  <span style="font-size: 0.52rem; opacity: 0.75;" class="text-truncate">
                    {{ sett === 1 ? getGhostWeightsRangeForWeek(sett).sfidante.label : (stileVisualizzazioneGhost === 'forma' ? 'Forte' : (stileVisualizzazioneGhost === 'marce' ? 'M3 (PR!)' : getGhostWeightsRangeForWeek(sett).sfidante.label)) }}
                  </span>
                </div>
              </v-btn>
            </div>
            
            <!-- Textarea con ottimizzazione digitazione (.lazy) -->
            <v-textarea
              v-if="ottimizzaDigitazione"
              v-model.lazy="inputSettimane[sett].ins"
              :label="getGhostLiftSmart(sett)?.isRepExercise ? 'Ripetizioni eseguite (es. 12r o 3x12r)' : 'Carico o note (es. 45kg)'"
              variant="outlined"
              density="compact"
              hide-details
              :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'lg')"
              rows="1"
              auto-grow
              color="orange-darken-3"
              class="custom-weight-input transition-all"
              :class="[getGhostFieldClass(sett), layoutCorrente === 'super_compatto' ? 'custom-compact-textarea' : '']"
              @blur="salvaDatoSettimanale(sett, 'ins')"
              :id="'input-peso-w' + sett"
            >
              <template v-slot:append-inner>
                <div 
                  class="d-flex align-center gap-1 pr-1"
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
              </template>
            </v-textarea>

            <!-- Textarea standard in tempo reale (default) -->
            <v-textarea
              v-else
              v-model="inputSettimane[sett].ins"
              :label="getGhostLiftSmart(sett)?.isRepExercise ? 'Ripetizioni eseguite (es. 12r o 3x12r)' : 'Carico o note (es. 45kg)'"
              variant="outlined"
              density="compact"
              hide-details
              :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'lg')"
              rows="1"
              auto-grow
              color="orange-darken-3"
              class="custom-weight-input transition-all"
              :class="[getGhostFieldClass(sett), layoutCorrente === 'super_compatto' ? 'custom-compact-textarea' : '']"
              @blur="salvaDatoSettimanale(sett, 'ins')"
              :id="'input-peso-w' + sett"
            >
              <template v-slot:append-inner>
                <div 
                  class="d-flex align-center gap-1 pr-1"
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
              </template>
            </v-textarea>

            <!-- Suggerimento Formattazione Reps (es. 3x12 -> 3x12r) -->
            <div
              v-if="getRepFormattingSuggestion(sett)"
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

          <!-- Campi Aggiuntivi per Week 6 (Miglior Carico e Sforzo Percepito) -->
          <div v-if="sett === 6 && (!workout.flg_perc || !String(workout.flg_perc).includes('V%')) && (!isCorpoLiberoEsercizio(workout) || isOndaProgression(workout))" :class="[layoutCorrente === 'super_compatto' ? 'mt-2 pt-2' : 'mt-4 pt-4', 'border-top-soft']">
            <div class="d-flex align-center justify-space-between" :class="layoutCorrente === 'super_compatto' ? 'mb-1' : 'mb-2'">
              <div>
                <span class="text-caption font-weight-black text-slate-dark d-block" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.75rem' : '0.8rem' }">Miglior Carico (W6) *</span>
                <span class="text-super-caption text-orange-darken-3" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.58rem' }">(Solo valore numerico)</span>
              </div>
              
              <!-- Stepper per Miglior Carico W6 -->
              <div 
                class="d-flex align-center card-glass border" 
                :class="[
                  layoutCorrente === 'super_compatto' ? 'px-0.5 py-0 rounded-sm' : (layoutCorrente === 'compatto' ? 'px-1 py-0.5 rounded-lg' : 'px-1 py-0.5 rounded-xl')
                ]" 
                style="background: rgba(30, 41, 59, 0.4) !important; border-color: rgba(255, 255, 255, 0.08) !important;"
              >
                <v-btn
                  icon
                  :size="layoutCorrente === 'super_compatto' ? '20px' : 'x-small'"
                  variant="text"
                  color="orange-lighten-2"
                  @click="decrementaKgUnico"
                  id="btn-decrementa-kg-unico"
                >
                  <v-icon :size="layoutCorrente === 'super_compatto' ? 14 : 18">mdi-minus</v-icon>
                </v-btn>
                <input
                  v-model="numIns6Val"
                  type="text"
                  class="text-center font-weight-black text-white px-1"
                  :style="{ width: layoutCorrente === 'super_compatto' ? '45px' : '55px', border: 'none', outline: 'none', background: 'transparent', fontSize: layoutCorrente === 'super_compatto' ? '0.8rem' : '0.9rem' }"
                  @blur="salvaKgUnico"
                  id="input-kg-unico-w6"
                />
                <v-btn
                  icon
                  :size="layoutCorrente === 'super_compatto' ? '20px' : 'x-small'"
                  variant="text"
                  color="orange-lighten-2"
                  @click="incrementaKgUnico"
                  id="btn-incrementa-kg-unico"
                >
                  <v-icon :size="layoutCorrente === 'super_compatto' ? 14 : 18">mdi-plus</v-icon>
                </v-btn>
              </div>
            </div>

            <p class="text-super-caption text-italic text-muted text-left" :class="layoutCorrente === 'super_compatto' ? 'mb-2.5' : 'mb-4'" :style="{ lineHeight: 1.35, fontSize: layoutCorrente === 'super_compatto' ? '0.58rem !important' : '0.65rem !important' }">
              Inserisci qui sopra il massimo peso della week6 e qui sotto la tua percezione di sforzo. È essenziale per calcolare il peso della week1 nel prossimo mesociclo.
            </p>

            <!-- Selettore Sforzo Percepito W6 -->
            <div class="text-left mb-2">
              <span class="text-caption font-weight-black text-slate-dark d-block mb-2" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.75rem' : '0.8rem', marginBottom: layoutCorrente === 'super_compatto' ? '4px !important' : '8px !important' }">Sforzo Percepito (W6)</span>
              <v-row dense class="gap-2 justify-space-between">
                <v-col cols="4">
                  <v-btn
                    block
                    variant="flat"
                    :color="numFaticaw6Val === 'Media' ? 'green-darken-3' : 'grey-darken-3'"
                    :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
                    :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'lg')"
                    class="font-weight-black text-none"
                    :class="{'text-white': numFaticaw6Val === 'Media', 'text-slate': numFaticaw6Val !== 'Media'}"
                    style="font-size: 0.72rem;"
                    :style="{ height: layoutCorrente === 'super_compatto' ? '26px' : '32px' }"
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
                    :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
                    :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'lg')"
                    class="font-weight-black text-none"
                    :class="{'text-white': numFaticaw6Val === 'Pesante', 'text-slate': numFaticaw6Val !== 'Pesante'}"
                    style="font-size: 0.72rem;"
                    :style="{ height: layoutCorrente === 'super_compatto' ? '26px' : '32px' }"
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
                    :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
                    :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'lg')"
                    class="font-weight-black text-none"
                    :class="{'text-white': numFaticaw6Val === 'Devastante', 'text-slate': numFaticaw6Val !== 'Devastante'}"
                    style="font-size: 0.72rem;"
                    :style="{ height: layoutCorrente === 'super_compatto' ? '26px' : '32px' }"
                    @click="salvaFatica('Devastante')"
                    id="btn-fatica-devastante"
                  >
                    Devastante
                  </v-btn>
                </v-col>
              </v-row>
            </div>
          </div>
            <!-- Sezione Recupero (Fine Giro) per Superset inside orange active card -->
            <div 
              v-if="sett === settimanaAttiva && infoSuperset.inSuperset && infoSuperset.isLast && workout.des_rec_report" 
              class="border-top-soft d-flex align-center justify-space-between animate-fade-in"
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
                class="font-weight-black text-white px-2.5 py-0"
                style="font-size: 0.58rem; height: 20px; cursor: pointer; line-height: 1;"
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
                    class="text-super-caption font-weight-black text-purple-lighten-3 uppercase" 
                    :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.58rem', letterSpacing: '0.05em' }"
                  >
                    👉 Prossimo Giro: Ricomincia da (1 di {{ infoSuperset.total }})
                  </span>
                </div>
                
                <!-- Card dell'Esercizio Collegato -->
                <div
                  v-if="infoSuperset.nextExercise"
                  class="d-flex align-center py-2 px-3 bg-slate-900 border-soft clickable-item"
                  :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : (layoutCorrente === 'compatto' ? 'rounded-md' : 'rounded-lg')"
                  @click="vaiAdEsercizioCollegato(infoSuperset.nextExercise.id)"
                  style="cursor: pointer; background-color: rgba(255, 255, 255, 0.03) !important; border: 1px solid rgba(255, 255, 255, 0.05) !important;"
                >
                  <div class="overflow-hidden mr-4 bg-black border-soft" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : 'rounded'" :style="{ width: layoutCorrente === 'super_compatto' ? '28px' : '36px', height: layoutCorrente === 'super_compatto' ? '28px' : '36px', flexShrink: 0 }">
                    <v-img :src="getGifUrl(infoSuperset.nextExercise.UrlNormal)" :width="layoutCorrente === 'super_compatto' ? 28 : 36" :height="layoutCorrente === 'super_compatto' ? 28 : 36" cover></v-img>
                  </div>
                  
                  <div class="flex-grow-1 text-truncate">
                    <div class="text-caption font-weight-black text-white text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.7rem !important' : '0.78rem !important' }">
                      {{ infoSuperset.nextExercise.des_esercizio }}
                      <v-icon v-if="infoSuperset.nextExercise.flg_video === 'true' || infoSuperset.nextExercise.flg_video === true" color="orange" size="12" class="ml-1" title="Video richiesto">mdi-video</v-icon>
                    </div>
                    <div class="text-super-caption text-purple-lighten-3 font-weight-bold" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.58rem' }">
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
                  class="text-super-caption font-weight-black text-purple-lighten-3 uppercase" 
                  :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.58rem', letterSpacing: '0.05em' }"
                >
                  👉 Prossimo Giro: Ricomincia da (1 di {{ infoSuperset.total }})
                </span>
              </div>
              
              <!-- Card dell'Esercizio Collegato -->
              <div
                v-if="infoSuperset.nextExercise"
                class="d-flex align-center py-2 px-3 bg-slate-900 border-soft clickable-item"
                :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : (layoutCorrente === 'compatto' ? 'rounded-md' : 'rounded-lg')"
                @click="vaiAdEsercizioCollegato(infoSuperset.nextExercise.id)"
                style="cursor: pointer; background-color: rgba(255, 255, 255, 0.03) !important; border: 1px solid rgba(255, 255, 255, 0.05) !important;"
              >
                <div class="overflow-hidden mr-4 bg-black border-soft" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : 'rounded'" :style="{ width: layoutCorrente === 'super_compatto' ? '28px' : '36px', height: layoutCorrente === 'super_compatto' ? '28px' : '36px', flexShrink: 0 }">
                  <v-img :src="getGifUrl(infoSuperset.nextExercise.UrlNormal)" :width="layoutCorrente === 'super_compatto' ? 28 : 36" :height="layoutCorrente === 'super_compatto' ? 28 : 36" cover></v-img>
                </div>
                
                <div class="flex-grow-1 text-truncate">
                  <div class="text-caption font-weight-black text-white text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.7rem !important' : '0.78rem !important' }">
                    {{ infoSuperset.nextExercise.des_esercizio }}
                    <v-icon v-if="infoSuperset.nextExercise.flg_video === 'true' || infoSuperset.nextExercise.flg_video === true" color="orange" size="12" class="ml-1" title="Video richiesto">mdi-video</v-icon>
                  </div>
                  <div class="text-super-caption text-purple-lighten-3 font-weight-bold" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.58rem' }">
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
    <span class="font-weight-black text-white">
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
              :color="parseInt(indRepsStartVal) === voto ? 'orange-darken-3' : 'grey-darken-3'"
              class="font-weight-black text-none flex-grow-1"
              :class="[
                layoutCorrente === 'super_compatto' ? 'rounded-sm text-white' : (layoutCorrente === 'compatto' ? 'rounded-md text-white' : 'rounded-lg text-white'),
                {'text-white': parseInt(indRepsStartVal) === voto, 'text-slate': parseInt(indRepsStartVal) !== voto}
              ]"
              :size="layoutCorrente === 'super_compatto' ? 'small' : 'default'"
              :style="{
                minWidth: layoutCorrente === 'super_compatto' ? '35px' : '45px', 
                height: layoutCorrente === 'super_compatto' ? '30px' : '40px', 
                fontSize: layoutCorrente === 'super_compatto' ? '0.75rem' : '0.9rem'
              }"
              @click="salvaVotoFeeling(voto)"
              :id="'btn-feeling-' + voto"
            >
              {{ voto }}
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
        @click="vaiADettaglioStorico(previousWorkout.id)"
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
            Questo esercizio era presente nella <strong>scheda precedente</strong> (Wo <span class="text-white font-weight-black">{{ previousWorkout.num_scheda }} {{ previousWorkout.des_giorno }}{{ previousWorkout.num_riga_giorno }}</span>).<br>
          </template>
          <template v-else>
            Eseguito l'ultima volta <strong class="text-orange-lighten-2">{{ tempoTrascorso(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }}</strong> (il <span class="text-white">{{ formattaDataStorico(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }}</span>) su Wo <span class="text-white font-weight-black">{{ previousWorkout.num_scheda }} {{ previousWorkout.des_giorno }}{{ previousWorkout.num_riga_giorno }}</span>.<br>
          </template>
          
          Prosegue il ciclo con <strong :class="'text-' + analisiRipetizioniCiclo.color">{{ analisiRipetizioniCiclo.testo }}</strong>
          <v-icon :color="analisiRipetizioniCiclo.color" :size="layoutCorrente === 'super_compatto' ? 15 : 18" class="ml-1 mb-1">{{ analisiRipetizioniCiclo.icon }}</v-icon>
        </div>
        
        <div 
          class="text-super-caption text-muted mt-3 pt-2 border-top-soft d-flex align-center"
          :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '' }"
        >
          <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="grey" class="mr-1">mdi-gesture-tap</v-icon>
          <span v-if="analisiRipetizioniCiclo.isContinuitato">Ultima esecuzione il {{ formattaDataStorico(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }} <span class="text-white ml-1 font-weight-black">({{ tempoTrascorso(getExecutionDate(previousWorkout, storicoEsercizio, workout)) }})</span> - Clicca per i dettagli</span>
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
          Eseguito l'ultima volta su Wo <span class="text-white font-weight-black">{{ workout.num_scheda_ult_ex || '?' }} {{ workout.num_coord_ex_wo_prec || '' }}</span> il: <span class="text-orange-lighten-2">{{ formattaDataStorico(workout.dat_scheda_ult_ex || workout.timestamp) }}</span> 
          <span class="text-white ml-1 font-weight-black">({{ tempoTrascorso(workout.dat_scheda_ult_ex || workout.timestamp) }})</span>
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

    <!-- Dialog 1: Progressione Scheda Precedente (PRECEDENTE) -->
    <v-dialog v-model="dialogProgressioniPrecedente" max-width="650" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="px-3 py-2 border-bottom d-flex align-center justify-space-between bg-slate-900" style="min-height: 40px;">
          <div class="d-flex align-center gap-2">
            <v-icon color="orange-darken-3" size="18">mdi-history</v-icon>
            <span class="font-weight-black text-white" style="font-size: 0.82rem !important; letter-spacing: 0.02em;">Progressione Scheda Precedente</span>
          </div>
          <!-- Pulsante X più piccolo -->
          <v-btn icon variant="text" width="24" height="24" color="grey" @click="dialogProgressioniPrecedente = false">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <!-- Tolto il padding top eccessivo (da pa-3 a pt-2) -->
        <v-card-text class="px-3 pt-0 pb-3 scrollbar-custom" style="max-height: 85vh;">
          <div v-if="!previousWorkout" class="text-center py-6">
            <v-icon size="36" color="orange-darken-1" class="mb-2">mdi-alert-circle-outline</v-icon>
            <p class="text-caption text-muted">Nessun dato o scheda precedente trovata per questo esercizio.</p>
          </div>
          <div v-else class="pt-2">
            <!-- Info Esercizio Precedente -->
            <div class="mb-2.5 text-left" style="line-height: 1.1;">
              <h4 class="font-weight-black text-white mt-0" style="font-size: 0.82rem !important; margin-bottom: 2px;">{{ previousWorkout.des_esercizio }}</h4>
              <div class="text-orange-lighten-2 font-weight-black uppercase" style="font-size: 0.58rem !important; letter-spacing: 0.02em;">
                Scheda {{ previousWorkout.num_scheda }} • Giorno {{ previousWorkout.des_giorno }}{{ previousWorkout.num_riga_giorno }}
              </div>
            </div>

            <!-- Lista delle 6 settimane delle progressioni precedenti (Carico a tutta larghezza e prescrizione sopra) -->
            <div class="d-flex flex-column gap-2 mb-3">
              <div v-for="w in [6, 5, 4, 3, 2, 1]" :key="w" class="rounded-xl border border-soft bg-slate-950 pa-2 text-left">
                <!-- Settimana + Prescrizione (Sopra) -->
                <div class="d-flex align-center justify-space-between mb-1.5" style="line-height: 1.1;">
                  <div class="font-weight-black text-white uppercase d-flex align-center gap-1.5" style="font-size: 0.72rem !important; letter-spacing: 0.03em;">
                    <span>Week {{ w }}</span>
                    <span class="text-orange-lighten-2 font-weight-black" style="font-size: 1.05rem !important; text-transform: none;">
                      ({{ previousWorkout['des_week' + w] ? pulisciParentesiQuadre(previousWorkout['des_week' + w]) : 'N.D.' }})
                    </span>
                  </div>
                </div>
                
                <!-- Carico (A tutta larghezza) -->
                <div class="w-100">
                  <input
                    v-model="inputSettimanePrecedente[w].ins"
                    type="text"
                    placeholder="Carico (es. 45 kg)"
                    class="custom-compact-ins-field font-weight-black text-white w-100"
                    style="width: 100%; border: 1px solid rgba(255, 255, 255, 0.25); outline: none; background: rgba(255, 255, 255, 0.12); font-size: 0.88rem; padding: 8px 12px; border-radius: 8px; text-align: left; height: 38px;"
                    @blur="salvaDatoSettimanalePrecedente(w, 'ins')"
                  />
                </div>

                <!-- Campi Aggiuntivi per Week 6 (Miglior Carico & Sforzo Percepito) - Spostato sotto la Week 6 -->
                <div v-if="w === 6 && (!previousWorkout.flg_perc || !String(previousWorkout.flg_perc).includes('V%')) && (!isCorpoLiberoEsercizio(previousWorkout) || isOndaProgression(previousWorkout))" class="mt-3 pt-3 border-top-soft">
                  <div class="d-flex align-center justify-space-between mb-2">
                    <div>
                      <span class="text-super-caption font-weight-black text-slate-dark d-block" style="font-size: 0.58rem;">Miglior Carico (W6) *</span>
                    </div>
                    
                    <!-- Stepper per Miglior Carico W6 Precedente -->
                    <div class="d-flex align-center card-glass border rounded-xl px-1 py-0.5" style="background: rgba(30, 41, 59, 0.4) !important; border-color: rgba(255, 255, 255, 0.08) !important;">
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        color="orange-lighten-2"
                        @click="decrementaKgUnicoPrecedente"
                      >
                        <v-icon size="18">mdi-minus</v-icon>
                      </v-btn>
                      <input
                        v-model="numIns6ValPrecedente"
                        type="text"
                        class="text-center font-weight-black text-white px-1"
                        style="width: 55px; border: none; outline: none; background: transparent; font-size: 0.9rem;"
                        @blur="salvaKgUnicoPrecedente"
                      />
                      <v-btn
                        icon
                        size="x-small"
                        variant="text"
                        color="orange-lighten-2"
                        @click="incrementaKgUnicoPrecedente"
                      >
                        <v-icon size="18">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>

                  <!-- Selettore Sforzo Percepito W6 Precedente -->
                  <div class="text-left mt-2">
                    <span class="text-super-caption font-weight-black text-slate-dark d-block mb-1.5" style="font-size: 0.58rem;">Sforzo Percepito (W6)</span>
                    <v-row dense class="gap-2 justify-space-between">
                      <v-col cols="4">
                        <v-btn
                          block
                          variant="flat"
                          :color="numFaticaw6ValPrecedente === 'Media' ? 'green-darken-3' : 'grey-darken-3'"
                          size="x-small"
                          rounded="lg"
                          class="font-weight-black text-none"
                          :class="{'text-white': numFaticaw6ValPrecedente === 'Media', 'text-slate': numFaticaw6ValPrecedente !== 'Media'}"
                          style="font-size: 0.65rem; height: 26px;"
                          @click="salvaFaticaPrecedente('Media')"
                        >
                          Media
                        </v-btn>
                      </v-col>
                      <v-col cols="4">
                        <v-btn
                          block
                          variant="flat"
                          :color="numFaticaw6ValPrecedente === 'Pesante' ? 'orange-darken-3' : 'grey-darken-3'"
                          size="x-small"
                          rounded="lg"
                          class="font-weight-black text-none"
                          :class="{'text-white': numFaticaw6ValPrecedente === 'Pesante', 'text-slate': numFaticaw6ValPrecedente !== 'Pesante'}"
                          style="font-size: 0.65rem; height: 26px;"
                          @click="salvaFaticaPrecedente('Pesante')"
                        >
                          Pesante
                        </v-btn>
                      </v-col>
                      <v-col cols="4">
                        <v-btn
                          block
                          variant="flat"
                          :color="numFaticaw6ValPrecedente === 'Devastante' ? 'red-darken-3' : 'grey-darken-3'"
                          size="x-small"
                          rounded="lg"
                          class="font-weight-black text-none"
                          :class="{'text-white': numFaticaw6ValPrecedente === 'Devastante', 'text-slate': numFaticaw6ValPrecedente !== 'Devastante'}"
                          style="font-size: 0.65rem; height: 26px;"
                          @click="salvaFaticaPrecedente('Devastante')"
                        >
                          Devastante
                        </v-btn>
                      </v-col>
                    </v-row>
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

    <!-- Dialog 3: Riepilogo Storico Esercizi (Cronologia) -->
    <!-- Dialog 3: Riepilogo Storico e Proposta Carico Unificati (Analisi Esercizio) -->
    <v-dialog v-model="dialogStorico" :max-width="activeTabAnalisi === 0 ? 550 : (stileStorico === 'tabella' ? 1200 : (stileStorico === 'grafico' ? 700 : 650))" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: var(--card-bg-dark) !important;">
        <v-card-title class="pa-0 border-bottom bg-slate-900">
          <!-- Rigo 1: Titolo e Chiudi -->
          <div class="px-3 py-2 d-flex align-center justify-space-between" style="min-height: 40px;">
            <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
              <v-icon color="orange-darken-3" size="18">
                {{ activeTabAnalisi === 0 ? 'mdi-lightbulb-on' : 'mdi-history' }}
              </v-icon>
              <span class="font-weight-black text-white text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
                {{ activeTabAnalisi === 0 ? 'Proposta Carico: ' : 'Storico: ' }}{{ workout?.des_esercizio }}
              </span>
            </div>
            <!-- Pulsante X più piccolo -->
            <v-btn icon variant="text" width="24" height="24" color="grey" @click="dialogStorico = false">
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
          </div>
          
          <!-- Tabs Unificati -->
          <v-tabs v-model="activeTabAnalisi" color="orange-darken-3" grow class="border-top" style="border-top: 1px solid rgba(255, 255, 255, 0.08) !important; height: 36px;">
            <v-tab :value="0" class="font-weight-black text-none" style="font-size: 0.72rem; height: 36px;">
              <v-icon start size="14" class="mr-1">mdi-lightbulb-on-outline</v-icon>
              Proposta Carico (W{{ aiutoWeek }})
            </v-tab>
            <v-tab :value="1" class="font-weight-black text-none" style="font-size: 0.72rem; height: 36px;">
              <v-icon start size="14" class="mr-1">mdi-history</v-icon>
              Cronologia
            </v-tab>
          </v-tabs>
          
          <!-- Rigo 2: Target Reps Settimana Attiva (Punto 3 - Semplificato e Prominente) -->
          <div v-if="activeTabAnalisi === 1" class="mb-1.5 px-3 py-2 bg-slate-950 border-top d-flex align-center justify-center position-relative" style="border-top: 1px solid rgba(255, 255, 255, 0.08) !important;">
            <v-chip color="orange-darken-3" size="x-small" class="font-weight-black text-white px-2 position-absolute" variant="flat" style="font-size: 0.65rem; height: 20px; left: 12px;">
              WEEK {{ settimanaAttiva }}
            </v-chip>
            <span class="text-caption font-weight-black text-orange-lighten-2 text-center" style="font-size: 0.9rem; letter-spacing: 0.02em;">
              {{ getRepsPerWeek(settimanaAttiva) }} REPS
            </span>
          </div>

          <!-- Rigo 3: Hero Banner dei Due Record Assoluti & Obiettivo W (Micro-tipografia Premium) -->
          <div v-if="activeTabAnalisi === 1 && suggerimentoRecord" class="px-3 py-2 bg-black border-top text-left" style="border-color: rgba(249, 115, 22, 0.2) !important;">
            
            <!-- HERO BANNER PR: RECORD ASSOLUTO GENERALE -->
            <div v-if="suggerimentoRecord.recordAbsolute > 0" class="pa-2.5 rounded-xl border mb-2 text-left" style="background: linear-gradient(135deg, rgba(6, 182, 212, 0.15) 0%, rgba(6, 182, 212, 0.03) 100%); border-color: rgba(6, 182, 212, 0.35) !important;">
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
                <span class="text-subtitle-1 font-weight-black text-white" style="font-size: 1.05rem; line-height: 1.1;">
                  {{ suggerimentoRecord.recordAbsolute }} kg
                </span>
                <span v-if="suggerimentoRecord.recordAbsoluteReps !== null" class="text-caption text-cyan-lighten-3 font-weight-black" style="font-size: 0.72rem;">
                  × {{ formatRepsDisplay(suggerimentoRecord.recordAbsoluteReps) }}
                </span>
              </div>

              <div class="text-super-caption text-slate-light font-weight-bold mt-0.5 d-flex align-center gap-1.5 flex-wrap" style="font-size: 0.53rem; line-height: 1.2;">
                <span>📍 Sch. {{ suggerimentoRecord.recordAbsoluteSheet || '-' }}{{ suggerimentoRecord.recordAbsoluteDay ? ' ' + suggerimentoRecord.recordAbsoluteDay : '' }}</span>
                <span>•</span>
                <span>🗓️ {{ formattaDataStorico(suggerimentoRecord.recordAbsoluteDate) || 'N.D.' }}</span>
                <span v-if="tempoTrascorso(suggerimentoRecord.recordAbsoluteDate)" class="text-cyan-lighten-3">({{ tempoTrascorso(suggerimentoRecord.recordAbsoluteDate) }})</span>
              </div>
            </div>

            <!-- RIGA INFERIORE: RECORD A STESSE REPS + OBIETTIVO W -->
            <div class="d-flex align-stretch gap-1.5">
              <!-- Card 1: Record a Stesse Reps -->
              <div v-if="suggerimentoRecord.record > 0" class="pa-2 rounded-xl border text-left flex-1-1 d-flex flex-column justify-center" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.3) !important;">
                <div class="d-flex align-center justify-space-between mb-0.5">
                  <div class="d-flex align-center gap-1">
                    <v-icon color="amber-lighten-1" size="12">mdi-trophy</v-icon>
                    <span class="text-super-caption font-weight-black text-amber-lighten-1 uppercase" style="font-size: 0.55rem; letter-spacing: 0.03em;">
                      RECORD A {{ getRepsPerWeek(settimanaAttiva) }} REPS
                    </span>
                  </div>
                </div>

                <div class="d-flex align-baseline gap-1">
                  <span class="text-subtitle-2 font-weight-black text-white" style="font-size: 0.95rem; line-height: 1.1;">
                    {{ suggerimentoRecord.record }} kg
                  </span>
                  <span v-if="suggerimentoRecord.recordRepsValue" class="text-super-caption text-amber-lighten-2 font-weight-bold" style="font-size: 0.62rem;">
                    × {{ formatRepsDisplay(suggerimentoRecord.recordRepsValue) }}
                  </span>
                </div>

                <div class="text-super-caption text-slate-light font-weight-bold mt-0.5" style="font-size: 0.51rem; line-height: 1.15;">
                  <span v-if="suggerimentoRecord.recordRepsSheet">
                    Sch. {{ suggerimentoRecord.recordRepsSheet }}{{ suggerimentoRecord.recordRepsDay ? ' ' + suggerimentoRecord.recordRepsDay : '' }} • 
                  </span>
                  {{ formattaDataStorico(suggerimentoRecord.recordRepsDate) || 'N.D.' }}
                  <span v-if="tempoTrascorso(suggerimentoRecord.recordRepsDate)" class="text-amber-lighten-2"> ({{ tempoTrascorso(suggerimentoRecord.recordRepsDate) }})</span>
                </div>
              </div>

              <!-- Card 2: Obiettivo W Attiva -->
              <div v-if="suggerimentoRecord.target > 0 || suggerimentoRecord.isScarico" class="pa-2 rounded-xl border text-left flex-1-1 d-flex flex-column justify-center" style="background: rgba(249, 115, 22, 0.08); border-color: rgba(249, 115, 22, 0.3) !important;">
                <div class="d-flex align-center gap-1 mb-0.5">
                  <v-icon color="orange-lighten-2" size="12">mdi-target</v-icon>
                  <span class="text-super-caption font-weight-black text-orange-lighten-2 uppercase" style="font-size: 0.55rem; letter-spacing: 0.03em;">
                    <span v-if="suggerimentoRecord.isScarico">SCARICO W{{settimanaAttiva}}</span>
                    <span v-else>OBIETTIVO W{{settimanaAttiva}}</span>
                  </span>
                </div>

                <div class="text-subtitle-2 font-weight-black text-white" style="font-size: 0.95rem; line-height: 1.1;">
                  <span v-if="suggerimentoRecord.isScarico">{{ suggerimentoRecord.pesoWeek2 || '??' }} kg</span>
                  <span v-else>{{ suggerimentoRecord.target }} kg</span>
                </div>
                <div class="text-super-caption text-muted font-weight-bold" style="font-size: 0.51rem;">
                  a {{ getRepsPerWeek(settimanaAttiva) }} reps target
                </div>
              </div>
            </div>
          </div>

          <!-- Rigo 4: Controlli Visualizzazione (Solo per Cronologia) -->
          <div v-if="activeTabAnalisi === 1" class="px-3 py-2 bg-slate-900 d-flex align-center justify-space-between border-top" style="border-color: rgba(255,255,255,0.05) !important;">
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

          <!-- TAB 0: PROPOSTA CARICO (SMART) -->
          <div v-if="activeTabAnalisi === 0" class="pt-1">
            <!-- Target Attuale (Badge Compatto) -->
            <div class="mb-2.5 px-3 py-2 bg-slate-950 border rounded-xl d-flex align-center justify-center position-relative" style="border-color: rgba(249, 115, 22, 0.25) !important;">
              <v-chip color="orange-darken-3" size="x-small" class="font-weight-black text-white px-2 position-absolute" variant="flat" style="font-size: 0.65rem; height: 20px; left: 12px;">
                WEEK {{ aiutoWeek }}
              </v-chip>
              <span class="text-caption font-weight-black text-orange-lighten-2 text-center" style="font-size: 0.9rem; letter-spacing: 0.02em;">
                {{ formatRepsDisplay(targetRepsAttive) }} REPS
              </span>
            </div>

            <!-- BANNER RECORD PERSONALE -->
            <v-card
              v-if="analizzaRecordSettimana(aiutoWeek)"
              class="mb-3 border text-left pa-2.5 rounded-xl"
              :style="{
                background: analizzaRecordSettimana(aiutoWeek).stato === 'record'
                  ? 'linear-gradient(135deg, rgba(251, 191, 36, 0.16) 0%, rgba(251, 191, 36, 0.04) 100%) !important'
                  : 'linear-gradient(135deg, rgba(249, 115, 22, 0.12) 0%, rgba(249, 115, 22, 0.03) 100%) !important',
                borderColor: analizzaRecordSettimana(aiutoWeek).stato === 'record'
                  ? 'rgba(251, 191, 36, 0.45) !important'
                  : 'rgba(249, 115, 22, 0.3) !important'
              }"
              elevation="0"
            >
              <div class="d-flex align-center gap-2">
                <span style="font-size: 1.1rem; line-height: 1;">
                  {{ analizzaRecordSettimana(aiutoWeek).stato === 'record' ? '🏆' : '🔥' }}
                </span>
                <div style="flex-grow: 1; min-width: 0;">
                  <div 
                    :class="analizzaRecordSettimana(aiutoWeek).stato === 'record' ? 'text-amber-lighten-1 font-weight-black' : 'text-orange-lighten-2 font-weight-black'" 
                    class="text-super-caption uppercase" 
                    style="font-size: 0.58rem; letter-spacing: 0.04em;"
                  >
                    {{ analizzaRecordSettimana(aiutoWeek).stato === 'record' ? 'RECORD STORICO SUPERATO' : 'VICINO AL RECORD STORICO' }}
                  </div>
                  <div class="text-super-caption text-white font-weight-bold" style="font-size: 0.65rem; line-height: 1.25;">
                    <span v-if="analizzaRecordSettimana(aiutoWeek).stato === 'record'">
                      {{ formatWeight(analizzaRecordSettimana(aiutoWeek).peso) }} kg supera il record di {{ formatWeight(analizzaRecordSettimana(aiutoWeek).record) }} kg per {{ formatRepsDisplay(analizzaRecordSettimana(aiutoWeek).targetReps) }}!
                    </span>
                    <span v-else>
                      {{ formatWeight(analizzaRecordSettimana(aiutoWeek).peso) }} kg (Record: {{ formatWeight(analizzaRecordSettimana(aiutoWeek).record) }} kg, mancano +{{ formatWeight(analizzaRecordSettimana(aiutoWeek).diff) }} kg)
                    </span>
                  </div>
                </div>
              </div>
            </v-card>

            <!-- Pulsante per aprire la progressione scheda precedente -->
            <div v-if="previousWorkout && aiutoWeek === 1" class="mb-3 text-left">
              <v-btn
                prepend-icon="mdi-calendar-arrow-left"
                variant="outlined"
                color="orange-darken-3"
                density="comfortable"
                class="font-weight-black text-none w-100 rounded-lg"
                style="font-size: 0.72rem; letter-spacing: 0.05em; background: rgba(249, 115, 22, 0.04); border-color: rgba(249, 115, 22, 0.25) !important; height: 32px;"
                @click="dialogProgressioniPrecedente = true"
              >
                Vedi Progressione Scheda Precedente
              </v-btn>
            </div>

            <!-- CASO SCARICO WEEK 4 -->
            <div v-if="aiutoWeek === 4 && isWeek4Scarico" class="mb-3 pa-2.5 rounded-xl text-left" style="background: linear-gradient(135deg, rgba(251, 191, 36, 0.12) 0%, rgba(251, 191, 36, 0.04) 100%); border: 1.5px solid rgba(251, 191, 36, 0.35) !important;">
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
                <span class="text-caption text-white font-weight-black" style="font-size: 0.72rem;">Usa peso W2: <strong class="text-green-accent-3">{{ scaricoWeek4Weights.pesoW2 ? scaricoWeek4Weights.pesoW2 + ' kg' : 'N.D.' }}</strong></span>
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
                <span class="text-caption text-white font-weight-black" style="font-size: 0.72rem;">Usa peso W3: <strong class="text-green-accent-3">{{ scaricoWeek4Weights.pesoW3 ? scaricoWeek4Weights.pesoW3 + ' kg' : 'N.D.' }}</strong></span>
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

            <!-- CASO WEEK 1 PROPOSTA / ALTRE SETTIMANE -->
            <div v-else-if="caricandoAiutoCarico" class="text-center py-6">
              <v-progress-circular indeterminate color="orange" size="28" class="mb-2"></v-progress-circular>
              <p class="text-super-caption text-muted">Calcolo proposta in corso...</p>
            </div>

            <div v-else-if="aiutoWeek !== 4 && proposteStoricoCalcolate.length === 0 && (aiutoWeek === 1 ? propostaWeek1?.erroreCarichi : true)" class="text-center py-6">
              <v-icon size="28" color="orange" class="mb-1">mdi-database-off-outline</v-icon>
              <p class="text-super-caption text-muted">Nessun dato nello storico per calcolare la proposta.</p>
            </div>

            <template v-else>
              <!-- CASO WEEK 1 PROPOSTA ERROR -->
              <div v-if="aiutoWeek === 1 && propostaWeek1?.erroreCarichi" class="mb-3 text-left">
                <div class="pa-2.5 rounded-lg text-red-accent-4" style="background: rgba(239, 68, 68, 0.1) !important; border: 1px solid rgba(239, 68, 68, 0.35) !important;">
                  <div class="d-flex align-center gap-1.5 font-weight-bold text-caption" style="font-size: 0.68rem !important; color: #ff5252 !important;">
                    <v-icon color="red-accent-4" size="14">mdi-alert-circle-outline</v-icon>
                    <span>⚠️ Scheda prec. senza carichi. Carica il Miglior Carico W6 per la stima.</span>
                  </div>
                </div>
              </div>

              <!-- CASO STANDARD (WEEK 1 VALIDA E ALTRE WEEKS) -->
              <div v-else class="d-flex flex-column gap-3">

                <!-- 1. PROPOSTA CONSIGLIATA HERO CARD -->
                <div class="pa-3 rounded-xl text-left border position-relative overflow-hidden" 
                     style="background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(16, 185, 129, 0.03) 100%) !important; border: 1.5px solid rgba(16, 185, 129, 0.35) !important;">
                  <div class="d-flex align-center justify-space-between mb-1">
                    <span class="text-super-caption text-green-accent-3 font-weight-black uppercase" style="font-size: 0.58rem; letter-spacing: 0.04em;">
                      💡 CARICO CONSIGLIATO
                    </span>
                    <v-chip v-if="analizzaRecordSettimana(aiutoWeek)?.stato === 'record'" color="amber-darken-3" size="x-small" density="compact" class="font-weight-black text-white" style="font-size: 0.5rem; height: 16px;">
                      🏆 RECORD
                    </v-chip>
                    <v-chip v-else color="green-darken-1" size="x-small" density="compact" class="font-weight-black text-white" style="font-size: 0.5rem; height: 16px;">
                      OTTIMALE
                    </v-chip>
                  </div>
                  
                  <div class="d-flex align-center justify-space-between my-1">
                    <div class="text-h4 font-weight-black text-green-accent-3" style="line-height: 1.1; font-size: 1.6rem;">
                      {{ aiutoWeek === 1 ? (propostaWeek1?.pesoConsigliato || propostaWeek1?.peso || 0) : caricoConsigliatoViaDiMezzo }} 
                      <span class="text-caption text-muted" style="font-size: 0.72rem;">KG</span>
                    </div>
                    <v-btn
                      color="green-darken-2"
                      size="small"
                      class="font-weight-black text-white px-3 text-none rounded-lg"
                      style="font-size: 0.72rem; height: 30px;"
                      @click="applicaPropostaCaricoStorico(aiutoWeek === 1 ? (propostaWeek1?.pesoConsigliato || propostaWeek1?.peso || 0) : caricoConsigliatoViaDiMezzo)"
                    >
                      Applica Consigliato
                    </v-btn>
                  </div>
                  
                  <div class="text-super-caption text-slate-light font-weight-medium mt-1" style="font-size: 0.6rem; line-height: 1.3;">
                    {{ aiutoWeek === 1 ? 'Stima di partenza basata su scheda precedente con fatica e recupero integrati.' : (spiegazioneDinamicaConsigliata.length > 90 ? spiegazioneDinamicaConsigliata.substring(0, 87) + '...' : spiegazioneDinamicaConsigliata) }}
                  </div>
                </div>

                <!-- 2. LE TRE STRADE DI PROGRESSIONE (HORIZONTAL CARDS) -->
                <div v-if="opzioniStradeProgressione.length > 0" class="text-left">
                  <span class="text-super-caption text-muted font-weight-black uppercase mb-1.5 px-1 d-block" style="font-size: 0.55rem; letter-spacing: 0.04em;">
                    ⚙️ OPZIONI DI PROGRESSIONE
                  </span>
                  
                  <v-row dense class="mx-0">
                    <v-col v-for="strada in opzioniStradeProgressione" :key="strada.tipo" cols="4" class="px-0.5">
                      <v-card 
                        class="pa-2 rounded-xl text-center border bg-slate-900 d-flex flex-column justify-space-between fill-height"
                        :style="{
                          borderColor: strada.tipo === 'smart' ? 'rgba(16, 185, 129, 0.35) !important' : (strada.tipo === 'sfidante' ? 'rgba(249, 115, 22, 0.35) !important' : 'rgba(255,255,255,0.08) !important'),
                          background: strada.tipo === 'smart' ? 'rgba(16, 185, 129, 0.04) !important' : (strada.tipo === 'sfidante' ? 'rgba(249, 115, 22, 0.04) !important' : 'rgba(255,255,255,0.01) !important')
                        }"
                        elevation="0"
                        style="min-height: 100px;"
                      >
                        <div class="d-flex flex-column align-center">
                          <span class="font-weight-black text-uppercase text-truncate" :class="strada.tipo === 'smart' ? 'text-green-accent-3' : (strada.tipo === 'sfidante' ? 'text-orange-lighten-2' : 'text-blue-lighten-3')" style="font-size: 0.58rem; letter-spacing: 0.03em;">
                            {{ strada.titolo }}
                          </span>
                          <span class="text-super-caption text-muted text-truncate mt-0.5 font-weight-bold" style="font-size: 0.48rem; text-transform: none;">
                            {{ strada.sottoTitolo }}
                          </span>
                        </div>
                        
                        <div class="my-1.5 text-subtitle-2 font-weight-black text-white" style="line-height: 1.1; font-size: 0.88rem;">
                          {{ strada.valore }}
                        </div>
                        
                        <v-btn
                          :color="strada.tipo === 'smart' ? 'green-darken-2' : (strada.tipo === 'sfidante' ? 'orange-darken-3' : 'blue-darken-3')"
                          size="x-small"
                          class="font-weight-black text-white text-none w-100 rounded-lg"
                          style="font-size: 0.6rem; height: 22px;"
                          @click="applicaPropostaCaricoStorico(strada.peso)"
                        >
                          Applica
                        </v-btn>
                      </v-card>
                    </v-col>
                  </v-row>

                  <!-- Micro-scheda Riassuntiva Riferimenti Record (Soluzione 3) -->
                  <div v-if="getRiferimentoSfidaRecord(aiutoWeek)" class="mt-1.5 pa-2 rounded-lg bg-slate-900 border text-super-caption text-slate-light d-flex flex-column gap-1" style="font-size: 0.55rem; border-color: rgba(255,255,255,0.06) !important;">
                    <div 
                      v-if="getRiferimentoSfidaRecord(aiutoWeek).massimale1RM" 
                      class="d-flex align-center justify-space-between border-b py-1.5 px-2 transition-colors rounded text-no-wrap overflow-x-auto scrollbar-none" 
                      :class="getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo?.bestSource ? 'cursor-pointer hover:bg-slate-800/80 active:bg-slate-700' : ''"
                      style="border-color: rgba(255,255,255,0.04) !important; min-height: 36px;"
                      :title="getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo?.bestSource ? '1RM Max assoluto storico. Clicca per aprire Sch. ' + getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo.bestSource.numScheda : ''"
                      @click="vaiADettaglioStorico(getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo?.bestSource?.id)"
                    >
                      <span class="text-slate-light font-weight-bold d-flex align-center gap-1 shrink-0">
                        🏆 <strong>1RM Max Storico:</strong>
                      </span>
                      <span class="text-purple-lighten-2 font-weight-black text-right shrink-0 ml-2">
                        {{ formatWeight(getRiferimentoSfidaRecord(aiutoWeek).massimale1RM) }} kg 
                        <span class="text-super-caption text-muted font-weight-normal ml-0.5" style="font-size: 0.53rem;">
                          <template v-if="getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo?.bestSource">
                            (da {{ getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo.bestSource.peso }}kg×{{ getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo.bestSource.reps }}r • Sch.{{ getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo.bestSource.numScheda }}<template v-if="getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo.bestSource.tempoTrascorso"> • {{ getRiferimentoSfidaRecord(aiutoWeek).massimaleInfo.bestSource.tempoTrascorso }}</template>)
                          </template>
                          <template v-else>
                            (stima 1RM)
                          </template>
                        </span>
                      </span>
                    </div>

                    <div 
                      class="d-flex align-center justify-space-between border-b py-1.5 px-2 transition-colors rounded text-no-wrap overflow-x-auto scrollbar-none" 
                      :class="getRiferimentoSfidaRecord(aiutoWeek).recordRealeInfo ? 'cursor-pointer hover:bg-slate-800/80 active:bg-slate-700' : ''"
                      style="border-color: rgba(255,255,255,0.04) !important; min-height: 36px;"
                      :title="getRiferimentoSfidaRecord(aiutoWeek).recordRealeInfo ? 'Record su ripetizioni target. Clicca per aprire Sch. ' + getRiferimentoSfidaRecord(aiutoWeek).recordRealeInfo.numScheda : ''"
                      @click="vaiADettaglioStorico(getRiferimentoSfidaRecord(aiutoWeek).recordRealeInfo?.id)"
                    >
                      <span class="text-slate-light font-weight-bold d-flex align-center gap-1 shrink-0">
                        📜 <strong>Record Reale:</strong>
                      </span>
                      <span v-if="getRiferimentoSfidaRecord(aiutoWeek).recordReale" class="text-amber-lighten-1 font-weight-black text-right shrink-0 ml-2">
                        {{ formatWeight(getRiferimentoSfidaRecord(aiutoWeek).recordReale) }} kg 
                        <span class="text-super-caption text-muted font-weight-normal ml-0.5" style="font-size: 0.53rem;">
                          <template v-if="getRiferimentoSfidaRecord(aiutoWeek).recordRealeInfo">
                            ({{ getRepsPerWeek(aiutoWeek) }}r • Sch.{{ getRiferimentoSfidaRecord(aiutoWeek).recordRealeInfo.numScheda }}<template v-if="getRiferimentoSfidaRecord(aiutoWeek).recordRealeInfo.tempoTrascorso"> • {{ getRiferimentoSfidaRecord(aiutoWeek).recordRealeInfo.tempoTrascorso }}</template>)
                          </template>
                          <template v-else>
                            ({{ getRepsPerWeek(aiutoWeek) }}r in passato)
                          </template>
                        </span>
                      </span>
                      <span v-else class="text-muted font-weight-bold">
                        N.D. <span class="text-super-caption text-muted font-weight-normal ml-0.5" style="font-size: 0.53rem;">(Mai svolto {{ getRepsPerWeek(aiutoWeek) }}r)</span>
                      </span>
                    </div>
                    
                    <div class="d-flex align-center justify-space-between py-1 px-2 text-no-wrap overflow-x-auto scrollbar-none" style="min-height: 32px;">
                      <span class="text-slate-light font-weight-bold d-flex align-center gap-1 shrink-0">
                        📊 <strong>Stima Target:</strong>
                      </span>
                      <span v-if="getRiferimentoSfidaRecord(aiutoWeek).recordStimato" class="text-orange-lighten-2 font-weight-black text-right shrink-0 ml-2">
                        {{ formatWeight(getRiferimentoSfidaRecord(aiutoWeek).recordStimato) }} kg <span class="text-super-caption text-muted font-weight-normal ml-0.5" style="font-size: 0.53rem;">(da altre serie)</span>
                      </span>
                      <span v-else class="text-muted font-weight-bold">
                        N.D.
                      </span>
                    </div>
                  </div>
                  <div v-else class="mt-1.5 px-2 py-1.5 rounded-lg bg-slate-900 border text-super-caption text-orange-lighten-2 font-weight-medium d-flex align-center gap-1" style="font-size: 0.56rem; border-color: rgba(255,255,255,0.06) !important;">
                    🔥 <strong>Sfidante:</strong> Carico ambizioso orientato alla massima prestazione per provare a stabilire un nuovo primato personale (PR).
                  </div>
                </div>

                <!-- 3. DATI DI CALCOLO E DETTAGLI SCIENTIFICI -->
                <v-expansion-panels class="text-left mt-1 border-soft overflow-hidden rounded-xl bg-slate-950" style="border-width: 1px !important;">
                  <v-expansion-panel bg-color="var(--card-bg-soft)" elevation="0">
                    <v-expansion-panel-title class="font-weight-black py-2 text-muted" style="font-size: 0.68rem; min-height: 34px;">
                      📊 Dati & Analisi Scientifiche Forza
                    </v-expansion-panel-title>
                    <v-expansion-panel-text class="px-0 pt-2 pb-0">
                      <!-- Rigo riassuntivo metadata di calcolo per W1 -->
                      <div v-if="aiutoWeek === 1 && propostaWeek1" class="d-flex align-center gap-1.5 flex-wrap mb-2.5 px-2 py-1.5 bg-slate-900 rounded-lg border text-super-caption text-slate-light" style="font-size: 0.58rem; border-color: rgba(255,255,255,0.05) !important;">
                        <span>📍 Base: <strong>W{{ propostaWeek1.settimanaBase }} prec. ({{ propostaWeek1.prevPeso }}kg ×{{ formatRepsDisplay(propostaWeek1.prevReps) }})</strong></span>
                        <span>• Fatica: <strong>{{ propostaWeek1.fatica }}</strong></span>
                        <span>• RIR: <strong>{{ propostaWeek1.rirTarget }}</strong></span>
                      </div>
                      
                      <!-- Dati Calcolo ed Aggiustamenti per standard weeks -->
                      <div v-if="aiutoWeek > 1 && caricoIdealeConsigliato" class="d-flex align-center gap-1.5 flex-wrap mb-2.5 px-2 py-1.5 bg-slate-900 rounded-lg border text-super-caption text-slate-light" style="font-size: 0.58rem; border-color: rgba(255,255,255,0.05) !important;">
                        <span>🏋️ Base: <strong>Sch.{{ caricoIdealeConsigliato.numScheda }} W{{ caricoIdealeConsigliato.week }} ({{ caricoIdealeConsigliato.pesoOriginale }}kg ×{{ formatRepsDisplay(caricoIdealeConsigliato.repsOriginali) }})</strong></span>
                        <span>• 1RM Base Recente: <strong class="text-green-accent-3">{{ caricoIdealeConsigliato.massimaleStimato }} kg</strong></span>
                      </div>
                      
                      <!-- Riferimenti specifici: Scheda e Stima Forza -->
                      <div v-if="aiutoWeek > 1" class="d-flex gap-2 mb-3">
                        <div class="flex-grow-1 pa-2 rounded bg-slate-900 border text-left" style="border-color: rgba(255,255,255,0.05) !important;">
                          <span class="text-super-caption text-slate-dark font-weight-black uppercase d-block" style="font-size: 0.52rem;">🛡️ Progressione Scheda</span>
                          <span class="text-subtitle-2 font-weight-bold text-slate-light mt-0.5 d-block" style="line-height: 1;">
                            {{ pesoPropostoDettaglio || '-' }} <span class="text-super-caption text-muted">KG</span>
                          </span>
                          <v-btn
                            color="grey-darken-3"
                            size="x-small"
                            block
                            class="font-weight-black text-white mt-2 text-none"
                            rounded="md"
                            style="font-size: 0.62rem; height: 22px;"
                            :disabled="!pesoPropostoDettaglio"
                            @click="applicaPropostaCaricoStorico(pesoPropostoDettaglio)"
                          >
                            Applica Scheda
                          </v-btn>
                        </div>
                        
                        <div class="flex-grow-1 pa-2 rounded bg-slate-900 border text-left" style="border-color: rgba(255,255,255,0.05) !important;">
                          <span class="text-super-caption text-orange font-weight-black uppercase d-block" style="font-size: 0.52rem;">📈 Stima Forza Recente</span>
                          <span class="text-subtitle-2 font-weight-bold text-orange-lighten-2 mt-0.5 d-block" style="line-height: 1;">
                            {{ caricoIdealeConsigliato ? caricoIdealeConsigliato.pesoProposto : '-' }} <span class="text-super-caption text-muted" v-if="caricoIdealeConsigliato">KG</span>
                          </span>
                          <v-btn
                            color="orange-darken-3"
                            size="x-small"
                            block
                            class="font-weight-black text-white mt-2 text-none"
                            rounded="md"
                            style="font-size: 0.62rem; height: 22px;"
                            :disabled="!caricoIdealeConsigliato"
                            @click="applicaPropostaCaricoStorico(caricoIdealeConsigliato.pesoProposto)"
                          >
                            Applica Stima
                          </v-btn>
                        </div>
                      </div>

                      <!-- Dettaglio Storico Completo -->
                      <div v-if="proposteStoricoCalcolate.length > 0" class="d-flex flex-column gap-2 text-left">
                        <p class="text-super-caption text-muted mb-1 px-1 font-weight-bold" style="font-size: 0.58rem; letter-spacing: 0.02em;">
                          Dettaglio Carichi Storici Corretti per Deallenamento/Sforzo:
                        </p>

                        <div v-for="prop in proposteStoricoCalcolate" :key="prop.id + '_' + prop.week" class="border border-soft rounded-lg bg-slate-900 pa-2 d-flex align-center justify-space-between" style="border-color: rgba(255, 255, 255, 0.05) !important;">
                          <div class="flex-grow-1 mr-2" style="min-width: 0;">
                            <div class="d-flex align-center gap-1 flex-wrap">
                              <span class="text-super-caption font-weight-black text-orange-lighten-2 uppercase" style="font-size: 0.52rem; letter-spacing: 0.02em;">
                                {{ prop.isCurrentMesocycle ? 'MESOCICLO ATTUALE' : 'Scheda ' + prop.numScheda }}
                              </span>
                              <span class="text-super-caption text-muted" style="font-size: 0.52rem;">
                                • W{{ prop.week }} ({{ prop.tempoPassato }})
                              </span>
                            </div>
                            <div class="text-caption font-weight-bold text-white mt-0.5" style="font-size: 0.68rem;">
                              {{ prop.pesoOriginale }} kg x {{ formatRepsDisplay(prop.repsOriginali) }}
                            </div>
                          </div>

                          <div class="text-right flex-shrink-0">
                            <div class="text-subtitle-2 font-weight-black text-green-accent-3">
                              {{ prop.pesoProposto }} <span class="text-super-caption text-muted" style="font-size: 0.55rem;">KG</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </v-expansion-panel-text>
                  </v-expansion-panel>
                </v-expansion-panels>
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
                @click="vaiADettaglioStorico(prevEx.id)"
              >
                <div 
                  class="d-flex align-center justify-space-between mb-1 px-1.5 py-1 rounded sticky-timeline-header"
                  :class="{'red-scheda-header': !soloCorrispondenti && haSettimanaCorrispondente(prevEx), 'bg-slate-900': soloCorrispondenti || !haSettimanaCorrispondente(prevEx)}"
                >
                  <span class="text-caption font-weight-black text-white uppercase" style="font-size: 0.72rem !important;">
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
                  <span v-if="prevEx.des_giorno" class="font-weight-black text-orange-lighten-2 mr-1">Giorno {{ prevEx.des_giorno }}</span>
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
                      <span class="text-super-caption text-white font-weight-medium d-block text-truncate px-0.5 opacity-70" style="font-size: 0.6rem; line-height: 1;">
                        {{ prevEx['des_week' + w] ? (parsedPrescription(prevEx['des_week' + w])?.reps || prevEx['des_week' + w]) : 'N.D.' }}
                      </span>
                      <strong class="font-weight-black d-block mt-1" style="font-size: 0.95rem; line-height: 1;" :style="{ color: isMatchingReps(prevEx, w) ? '#f87171' : (prevEx['ins_week' + w] ? '#fb923c' : '#475569') }">
                        {{ prevEx['ins_week' + w] || '-' }}
                      </strong>
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
                      <div class="text-white">W{{ w }}</div>
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
                  <tr v-for="prevEx in storicoFiltrato" :key="prevEx.id" class="table-row" style="cursor: pointer;" @click="vaiADettaglioStorico(prevEx.id)">
                    <td class="sticky-col body-cell text-left" :class="{'red-scheda-cell': !soloCorrispondenti && haSettimanaCorrispondente(prevEx)}">
                      <div class="font-weight-black text-white" style="font-size: 0.75rem; line-height: 1.15;">S. {{ prevEx.num_scheda }}</div>
                      <div v-if="prevEx.dat_scheda_ult_ex || prevEx.timestamp" class="text-super-caption text-muted" style="font-size: 0.55rem; white-space: nowrap; line-height: 1.15; margin-top: 1px;">
                        {{ formattaDataStorico(getExecutionDate(prevEx, storicoEsercizio, workout)) }}
                      </div>
                      <div v-if="prevEx.dat_scheda_ult_ex || prevEx.timestamp" class="text-orange-lighten-2 font-weight-bold" style="font-size: 0.52rem; white-space: nowrap; line-height: 1.1; margin-top: 1px;">
                        {{ tempoTrascorso(getExecutionDate(prevEx, storicoEsercizio, workout)) }}
                      </div>
                    </td>
                    
                    <td v-for="w in [1, 2, 3, 4, 5, 6]" :key="w" class="body-cell font-weight-bold text-center" :class="{'red-cell': isMatchingReps(prevEx, w)}" style="word-wrap: break-word;" :style="{ opacity: (soloCorrispondenti && !isMatchingReps(prevEx, w)) ? 0.45 : 1.0 }">
                      <div v-if="prevEx['des_week' + w]" class="text-super-caption text-white font-weight-medium" style="font-size: 0.65rem; line-height: 1; opacity: 0.8;">
                        {{ parsedPrescription(prevEx['des_week' + w])?.reps || prevEx['des_week' + w] }}
                      </div>
                      <div class="font-weight-black mt-1" style="font-size: 0.9rem; line-height: 1.1; letter-spacing: -0.02em;" :style="{ color: isMatchingReps(prevEx, w) ? '#ef4444' : (prevEx['ins_week' + w] ? '#fb923c' : '#475569') }">
                        {{ prevEx['ins_week' + w] || '-' }}
                      </div>
                      <div v-if="w === 6 && prevEx.num_faticaw6" class="text-super-caption font-weight-bold mt-0.5" style="font-size: 0.55rem; line-height: 1.1;" :style="getColoreFaticaStyle(prevEx.num_faticaw6)">
                        {{ prevEx.num_faticaw6 }}
                      </div>
                    </td>
                    
                    <td class="body-cell font-weight-black text-center" style="font-size: 1rem; word-wrap: break-word; border-left: 1px solid rgba(255,255,255,0.1);" :style="prevEx.num_faticaw6 ? getColoreFaticaStyle(prevEx.num_faticaw6) : { color: '#ffca28' }">
                      {{ prevEx.num_ins6 ? prevEx.num_ins6 + ' kg' : '-' }}
                    </td>
                    <td class="body-cell text-center" style="font-size: 0.7rem; word-wrap: break-word;">{{ prevEx.peso_corporeo || '-' }}</td>
                    <td class="body-cell font-weight-medium text-center" style="font-size: 0.7rem; word-wrap: break-word;">{{ prevEx.des_giorno || '-' }}</td>
                    <td class="body-cell text-left note-cell" style="font-size: 0.68rem; word-wrap: break-word;" :title="prevEx.des_note || ''">{{ prevEx.des_note || '-' }}</td>
                    <td class="body-cell text-left note-cell" style="font-size: 0.68rem; word-wrap: break-word;" :title="prevEx.des_note_attrezzo || ''">{{ prevEx.des_note_attrezzo || '-' }}</td>
                    <td class="body-cell text-left note-cell" style="font-size: 0.68rem; word-wrap: break-word;" :title="prevEx.des_note_gen_attr || ''">{{ prevEx.des_note_gen_attr || '-' }}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- LAYOUT 3: GRAFICO DELLE PROGRESSIONI -->
            <div v-else-if="!caricandoStorico && storicoFiltrato.length > 0 && stileStorico === 'grafico'" class="d-flex flex-column gap-3 py-1">
              <!-- Selettore Modalità Grafico -->
              <div class="px-1 text-left">
                <span class="text-super-caption text-muted font-weight-black uppercase d-block mb-1.5" style="font-size: 0.55rem; letter-spacing: 0.05em;">Modalità Grafico (Tutte le Reps)</span>
                <v-btn-toggle
                  v-model="modeGraficoStorico"
                  mandatory
                  selected-class="bg-orange-darken-3 text-white"
                  density="compact"
                  rounded="lg"
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
              <div class="px-1 text-left">
                <span class="text-super-caption text-muted font-weight-black uppercase d-block mb-1.5" style="font-size: 0.55rem; letter-spacing: 0.05em;">Raggruppamento Reps</span>
                <v-btn-toggle
                  v-model="raggruppamentoReps"
                  mandatory
                  selected-class="bg-orange-darken-3 text-white"
                  density="compact"
                  rounded="lg"
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
              <div v-if="availableBuckets.length > 0" class="px-1 text-left">
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
                <div v-if="selectedPointDetails" class="px-1">
                  <v-card 
                    class="card-glass border text-left" 
                    style="background: linear-gradient(135deg, rgba(249, 115, 22, 0.08) 0%, rgba(255, 255, 255, 0.02) 100%) !important; border-color: rgba(249, 115, 22, 0.3) !important; border-radius: 12px !important;"
                  >
                    <div class="d-flex align-center justify-space-between px-3 py-2 bg-slate-900 border-bottom">
                      <span class="text-caption font-weight-black text-white uppercase" style="font-size: 0.72rem !important; letter-spacing: 0.02em;">
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
                          <span class="font-weight-black text-white" style="font-size: 0.85rem;">
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
                          📅 Data: <span class="text-white">{{ formattaDataStorico(selectedPointDetails.date) }} ({{ tempoTrascorso(selectedPointDetails.date) }})</span>
                        </span>
                        <span v-if="selectedPointDetails.giorno">
                          • Giorno: <span class="text-white">{{ selectedPointDetails.giorno }}</span>
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
              <div v-if="analisiAndamentoEsercizio" class="px-1">
                <v-card class="card-glass border text-left" style="border-color: rgba(255, 255, 255, 0.08) !important; border-radius: 12px !important;">
                  <div 
                    class="d-flex align-center justify-space-between px-3 py-2 bg-slate-900 clickable-item" 
                    style="cursor: pointer; min-height: 36px;"
                    @click="showAnalisiAndamento = !showAnalisiAndamento"
                  >
                    <div class="d-flex align-center gap-2">
                      <v-icon color="orange-lighten-2" size="16">mdi-google-analytics</v-icon>
                      <span class="text-caption font-weight-black text-white uppercase" style="font-size: 0.72rem !important; letter-spacing: 0.02em;">
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
                          <strong class="text-white">Giudizio sull'Andamento:</strong>
                          <p class="mb-0 mt-0.5 text-slate-light" v-html="renderMarkdownBold(analisiAndamentoEsercizio.giudizio)"></p>
                        </div>
                      </div>
                      
                      <!-- Consigli -->
                      <div class="mb-3 d-flex align-start gap-2">
                        <span style="font-size: 1.15rem; line-height: 1;">💡</span>
                        <div>
                          <strong class="text-orange-lighten-3">Consigli Tecnici:</strong>
                          <p class="mb-0 mt-0.5 text-slate-light">{{ analisiAndamentoEsercizio.consigli }}</p>
                        </div>
                      </div>
                      
                      <!-- Record per fascia -->
                      <div v-if="analisiAndamentoEsercizio.records.length > 0" class="pt-2.5 border-top-soft">
                        <strong class="text-white uppercase font-weight-black d-block mb-2" style="font-size: 0.58rem; letter-spacing: 0.05em;">
                          Migliori Prestazioni Registrate per Fascia:
                        </strong>
                        <div class="d-flex flex-column gap-1.5">
                          <div 
                            v-for="rec in analisiAndamentoEsercizio.records" 
                            :key="rec.bucket"
                            class="d-flex align-center justify-space-between bg-slate-950 rounded px-2.5 py-1.5 border border-soft"
                            style="border-color: rgba(255, 255, 255, 0.05) !important;"
                          >
                            <div>
                              <span class="font-weight-black text-orange-lighten-2">{{ rec.bucket }}</span>
                              <span class="text-super-caption text-muted ml-2">({{ rec.label }})</span>
                            </div>
                            <div class="font-weight-black text-white">
                              {{ rec.maxPeso }} kg <span class="text-super-caption text-muted" v-if="rec.date">• {{ tempoTrascorso(rec.date) }}</span>
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
 
        <v-card-actions class="pa-3 border-top bg-slate-900 gap-2">
          <v-btn color="orange-darken-3" variant="flat" block rounded="lg" size="small" class="font-weight-bold text-white" @click="dialogStorico = false">
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
        <v-card-title class="font-weight-black text-orange-darken-3 d-flex align-center justify-space-between px-0 mb-3" style="border-bottom: 1px solid rgba(255,255,255,0.08) !important; padding-bottom: 12px !important;">
          <div class="d-flex align-center">
            <v-icon color="orange-darken-3" class="mr-2" size="24">mdi-sword-cross</v-icon>
            <span style="font-size: 1rem; letter-spacing: 0.05em; color: #f8fafc !important;">DETTAGLIO LIVELLO FORZA</span>
          </div>
          <v-btn icon size="small" variant="text" color="grey" @click="dialogLivelloForza = false" style="width: 28px; height: 28px;">
            <v-icon size="16">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <div v-if="parsedRmt(workout?.des_esercizio_2)" class="text-left">
          <!-- Livello Corrente Header -->
          <div class="d-flex align-center justify-space-between mb-4 pa-3 rounded-xl bg-slate-900 border-soft" style="background: rgba(15, 23, 42, 0.6) !important; border: 1px solid rgba(255,255,255,0.05) !important;">
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
              <span class="text-subtitle-1 font-weight-black text-white mt-1 d-block" style="line-height: 1;">
                {{ parsedRmt(workout.des_esercizio_2).massimale }} <span class="text-caption text-muted" style="font-size: 0.68rem;">KG</span>
              </span>
            </div>
          </div>

          <!-- Discorso di Congratulazioni e Motivazione -->
          <div class="mb-4">
            <div class="text-subtitle-2 font-weight-black text-orange-lighten-2 mb-1.5" style="font-size: 0.88rem;">
              {{ getStrengthGreeting(parsedRmt(workout.des_esercizio_2).livelloTesto) }}
            </div>
            <p class="text-body-2 text-slate-light" style="color: #cbd5e1 !important; line-height: 1.5; font-size: 0.78rem;">
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
                <span class="text-super-caption font-weight-black uppercase d-block" style="font-size: 0.58rem;" :style="{ color: parsedRmt(workout.des_esercizio_2).variazione.includes('↓') ? '#f87171' : '#34d399' }">
                  Andamento Mesociclo Precedente
                </span>
                <span class="text-body-2 text-slate-light mt-1 d-block" style="font-size: 0.76rem; line-height: 1.45; color: #cbd5e1 !important;">
                  {{ getVariationExplanation(parsedRmt(workout.des_esercizio_2)) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Progresso al Prossimo Livello -->
          <div class="pa-3 rounded-xl bg-slate-900 border-soft" style="background: rgba(15, 23, 42, 0.4) !important; border: 1px solid rgba(255,255,255,0.05) !important;">
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
            <div class="text-super-caption text-muted font-weight-bold" style="font-size: 0.65rem; line-height: 1.3; color: #94a3b8 !important;">
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

          <!-- Pulsanti Modale Fastidio/Infortunio (Più compatti) -->
          <div class="d-flex flex-column gap-2 mb-2">
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
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { startGlobalTimer, ruolo, getStileStoricoAtleta, getModalitaSettimaneAtleta, selectedSheet, apriCalcolatoreDischi, layoutDettaglioGlobal, layoutEserciziGlobal, selectedAthlete, propostaBaseWeek2Global, propostaBaseWeek5Global, propostaBaseWeek6Global, incrementoPesoPostScaricoPctGlobal, sogliaForzaManubriGlobal, incrementoManubriLeggeroGlobal, incrementoManubriForteGlobal, faticaPesanteW1PctGlobal, faticaDevastanteW1PctGlobal, faticaPesanteStoricoPctGlobal, faticaDevastanteStoricoPctGlobal, getStoryboardBackup, globalStoryboard, globalInfortuni, segnalaInfortunio, aggiornaInfortunio, risolviInfortunio, eliminaInfortunio, calcolaPercentualeConsigliata, ottimizzaDigitazioneGlobal, regolaProgressioneW2Global, deallenamentoSoglia1Global, deallenamentoSoglia2Global, deallenamentoSoglia3Global, deallenamentoSoglia4Global, deallenamentoPct1Global, deallenamentoPct2Global, deallenamentoPct3Global, deallenamentoPct4Global, penalitaMaxInstabiliPctGlobal, penalitaMaxStabiliPctGlobal } from '../authStore.js';

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

const inizializzaParametriProposta = (atletaId) => {
  // Gestito a livello globale in authStore.js
};

// Help Dialog & Calcolo Carico Storico States
const dialogAiutoCarico = ref(false);
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
  const reps = workout.value['reps_week' + sett];
  if (reps) return parseInt(reps, 10);
  const presc = workout.value['des_week' + sett];
  return estraiRepsDaPrescrizione(presc) || 10;
};

// --- LOGICA RECORD & INCREMENTI GHOST ---
const modalitaIncrementoGhost = ref('ibrida');
const stileVisualizzazioneGhost = ref('range');
const stileRecordStorico = ref('cards');
const ghostPRAttackAttivo = ref(true);
const ghostAutoregolazioneRepsAttiva = ref(true);
const sfidaRecordWeek1 = ref(false);
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

  const currentIns = inputSettimane.value[sett]?.ins;
  if (!currentIns || String(currentIns).trim() === '' || String(currentIns).trim() === '-') return false;
  
  if (haDriverQualitativoAccreditato(sett)) return false;

  const currentPesoStr = estraiPesoDaInput(currentIns);
  if (!currentPesoStr) return false;
  const currentPeso = parseFloat(currentPesoStr);
  if (isNaN(currentPeso) || currentPeso <= 0) return false;

  const currentReps = estraiRepsDaInput(currentIns) || getRepsPerWeek(sett);

  let prevW = sett - 1;
  while (prevW >= 1 && (!inputSettimane.value[prevW]?.ins || String(inputSettimane.value[prevW]?.ins).trim() === '' || String(inputSettimane.value[prevW]?.ins).trim() === '-')) {
    prevW--;
  }
  if (prevW < 1) return false;

  const prevIns = inputSettimane.value[prevW]?.ins;
  const prevPesoStr = estraiPesoDaInput(prevIns);
  if (!prevPesoStr) return false;
  const prevPeso = parseFloat(prevPesoStr);
  if (isNaN(prevPeso) || prevPeso <= 0) return false;

  const prevReps = estraiRepsDaInput(prevIns) || getRepsPerWeek(prevW);

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

  const useRep = previousWorkout.value.des_esercizio && String(previousWorkout.value.des_esercizio).toLowerCase().includes('corpo libero');
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
                  id: prevEx.id,
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
  let repsEffettive = reps;
  if (reps > 10) {
    repsEffettive = 10 + (reps - 10) * 0.5;
  }
  let e1rm = peso * (1 + repsEffettive / 30);
  if (isCavoOMacchina && reps > 8) {
    e1rm *= 0.88;
  }
  return e1rm;
};

const calcolaPesoDaE1RMSmorzato = (e1rm, targetReps, isCavoOMacchina) => {
  let repsTargetEffettive = targetReps;
  if (targetReps > 10) {
    repsTargetEffettive = 10 + (targetReps - 10) * 0.5;
  }
  let pesoStimato = e1rm / (1 + repsTargetEffettive / 30);
  if (isCavoOMacchina && targetReps > 8) {
    pesoStimato *= 0.92;
  }
  return pesoStimato;
};

const stimaRecordStoricoPerReps = (targetReps) => {
  if (!workout.value || !storicoEsercizio.value.length || !targetReps) return null;
  const currentNumScheda = parseInt(workout.value.num_scheda);
  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  
  let best1RM = 0;
  let maxWeightRealLogged = 0;

  storicoEsercizio.value.forEach(prevEx => {
    const sNum = parseInt(prevEx.num_scheda);
    if (!isNaN(sNum) && sNum >= currentNumScheda) return;
    
    for (let w = 1; w <= 6; w++) {
      const insVal = prevEx['ins_week' + w];
      if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
        const weightStr = estraiPesoDaInput(insVal);
        if (weightStr) {
          const weight = parseFloat(weightStr);
          if (!isNaN(weight) && weight > 0) {
            if (weight > maxWeightRealLogged) maxWeightRealLogged = weight;
            const repsVal = prevEx['reps_week' + w];
            let repsNum = repsVal ? parseInt(repsVal, 10) : estraiRepsDaPrescrizione(prevEx['des_week' + w]);
            const inputReps = estraiRepsDaInput(insVal);
            if (inputReps !== null && !isNaN(inputReps) && inputReps > 0) {
              repsNum = inputReps;
            }
            if (repsNum) {
              const e1rm = calcolaE1RMSmorzato(weight, repsNum, isCavo);
              if (e1rm > best1RM) {
                best1RM = e1rm;
              }
            }
          }
        }
      }
    }
  });

  if (best1RM > 0) {
    let estimatedWeight = calcolaPesoDaE1RMSmorzato(best1RM, targetReps, isCavo);
    if (maxWeightRealLogged > 0 && estimatedWeight > maxWeightRealLogged * 1.25) {
      estimatedWeight = maxWeightRealLogged * 1.25;
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
  const currentNumScheda = parseInt(workout.value.num_scheda);
  const isCavo = isCavoOMacchinaEsercizio(workout.value);
  let best1RM = 0;
  let bestSource = null;

  if (storicoEsercizio.value && storicoEsercizio.value.length) {
    storicoEsercizio.value.forEach(prevEx => {
      const sNum = parseInt(prevEx.num_scheda);
      if (!isNaN(sNum) && sNum >= currentNumScheda) return;
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
              if (repsNum) {
                const e1rm = calcolaE1RMSmorzato(weight, repsNum, isCavo);
                if (e1rm > best1RM) {
                  best1RM = e1rm;
                  const dEx = getExecutionDate(prevEx, storicoEsercizio.value, workout.value);
                  bestSource = {
                    id: prevEx.id,
                    peso: weight,
                    reps: repsNum,
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
  }

  if (inputSettimane.value) {
    Object.keys(inputSettimane.value).forEach(w => {
      const insVal = inputSettimane.value[w]?.ins;
      if (insVal) {
        const weightStr = estraiPesoDaInput(insVal);
        if (weightStr) {
          const weight = parseFloat(weightStr);
          if (!isNaN(weight) && weight > 0) {
            const rExecuted = estraiRepsDaInput(insVal) || getRepsPerWeek(parseInt(w, 10));
            if (rExecuted) {
              const e1rm = calcolaE1RMSmorzato(weight, rExecuted, isCavo);
              if (e1rm > best1RM) {
                best1RM = e1rm;
                bestSource = {
                  id: workout.value.id,
                  peso: weight,
                  reps: rExecuted,
                  numScheda: workout.value.num_scheda,
                  date: workout.value.dat_scheda_ult_ex || workout.value.timestamp,
                  tempoTrascorso: tempoTrascorsoBreve(workout.value.dat_scheda_ult_ex || workout.value.timestamp) || 'questa scheda'
                };
              }
            }
          }
        }
      }
    });
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
        const weightStr = estraiPesoDaInput(insVal);
        if (weightStr) {
          const weight = parseFloat(weightStr);
          if (!isNaN(weight) && weight > 0) {
            const rExecuted = estraiRepsDaInput(insVal) || getRepsPerWeek(w);
            const e1rm = calcolaE1RMSmorzato(weight, rExecuted, isCavo);
            const estW = calcolaPesoDaE1RMSmorzato(e1rm, repsTarget, isCavo);
            if (estW > stimaDaSchedaCorrente) {
              stimaDaSchedaCorrente = estW;
            }
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

  const pesoMassimo = Math.max(
    recordEsatto || 0,
    recordStimato || 0
  );

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
  const targetReps = getRepsPerWeek(sett);
  const recordVal = ottieniRecordStoricoPerReps(targetReps);
  if (!recordVal) return null;

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
    // Altrimenti valutiamo la proposta Ghost
    const ghost = getGhostLiftSmart(sett);
    if (ghost) {
      const ghostPeso = ghost.isPostScarico && ghost.pesoProposto !== undefined ? ghost.pesoProposto : ghost.peso;
      if (ghostPeso && !isNaN(ghostPeso) && ghostPeso > 0) {
        pesoDaValutare = ghostPeso;
        tipoValutato = 'ghost';
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
      diff: pesoDaValutare - recordVal,
      targetReps
    };
  } else if (pesoDaValutare >= recordVal * 0.95 || pesoDaValutare >= recordVal - 2.5) {
    return {
      stato: 'quasi-record',
      tipo: tipoValutato,
      peso: pesoDaValutare,
      record: recordVal,
      diff: recordVal - pesoDaValutare,
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
  const text = `${insText || ''} ${noteText || ''} ${faticaText || ''}`.toLowerCase();
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

  if (sett === 2) {
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
      if (repsEseguite !== null && !isNaN(repsEseguite) && repsEseguite > 0) {
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
    const insVal = workout.value['ins_week' + w];
    if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
      const weightStr = estraiPesoDaInput(insVal);
      if (weightStr) {
        const weight = parseFloat(weightStr);
        if (!isNaN(weight) && weight > 0) {
          const repsVal = workout.value['reps_week' + w];
          let repsNum = repsVal ? parseInt(repsVal, 10) : estraiRepsDaPrescrizione(workout.value['des_week' + w]);
          const inputReps = estraiRepsDaInput(insVal);
          if (inputReps !== null && !isNaN(inputReps) && inputReps > 0) {
            repsNum = inputReps;
          }
          if (repsNum && repsNum > 0) {
            // Calcolo progressione diretta mesociclo attuale
            const rirOriginale = estraiRIRDaPrescrizione(workout.value['des_week' + w]) !== null 
              ? estraiRIRDaPrescrizione(workout.value['des_week' + w]) 
              : getRIRDefault(w);
            
            const estimated1RM = weight * (1 + (repsNum + rirOriginale) / 30);
            
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
    // Modello Ibrido (Mix): via di mezzo (media) tra potenziale (storico) e programmato (prudenziale)
    if (potenziale !== null && prudenziale !== null && !isNaN(potenziale) && !isNaN(prudenziale)) {
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

    if (applica && pct > 0) {
      const applicaRiduzioneInfortunio = (wVal) => {
        if (wVal === null || wVal === undefined || wVal <= 0) return wVal;
        const isManubri = isManubriEsercizio(workout.value);
        const step = getWeightStep(isManubri, wVal);
        const factor = (100 - pct) / 100;
        const reduced = wVal * factor;
        return Math.max(step, Math.round(reduced / step) * step);
      };

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
  
  return smartGhost;
};

const getGhostWeightsRangeForWeek = (sett) => {
  if (!workout.value) return null;
  const ghost = getGhostLiftSmart(sett);
  if (!ghost) return null;
  
  if (ghost.isWeek2Scritta) return null;
  
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
    const defaultPeso = ghost.suggerito || ghost.peso || 0;
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

  if (ghost.isScarico) {
    const scaricoPeso = ghost.peso || 0;
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
  const isTargetCompletato = repsBaseVal >= repsTarget;
  const isEsuberoReps = repsBaseVal >= repsTarget + 2;
  const isRepsIncomplete = repsBaseVal < repsTarget;

  const isDifficileOStallo = info ? isInputIndicaLimiteOStallo(info.baseInsText, info.noteText, info.faticaText) : false;

  const potenziale = calcolaCaricoIdealeConsigliatoPerSettimana(sett)?.pesoProposto || null;
  const pesoConsigliato = (potenziale !== null && potenziale > 0 && potenziale > pesoBase) 
    ? potenziale 
    : (isManubri ? getDumbbellSequenceWeight(pesoBase, 'up') : pesoBase + step);
  const pesoSfidante = isManubri ? getDumbbellSequenceWeight(pesoConsigliato, 'up') : pesoConsigliato + step;

  // Scenario Sforzo Elevato / Difficile / Limite: mantiene lo stesso peso e consiglia progressione su reps
  if (isDifficileOStallo && pesoBase > 0) {
    const repsVolume = Math.max(repsTarget, repsBaseVal + 1);
    return {
      prudenziale: {
        value: String(pesoBase),
        display: `${formatWeight(pesoBase)} kg`,
        label: 'Prudenziale (Stesso peso)'
      },
      consigliato: {
        value: `${pesoBase}x${repsVolume}r`,
        display: `${formatWeight(pesoBase)}x${repsVolume}r`,
        label: 'Consigliato (+1r stesso peso)'
      },
      sfidante: {
        value: String(pesoConsigliato),
        display: `${formatWeight(pesoConsigliato)} kg`,
        label: 'Sfidante'
      }
    };
  }

  // Scenario 0: Intensificazione (repsTarget < repsBaseVal)
  if (repsTarget < repsBaseVal) {
    const repsVolume = repsBaseVal + 1;
    return {
      prudenziale: {
        value: `${pesoBase}x${repsVolume}r`,
        display: `${formatWeight(pesoBase)}x${repsVolume}r`,
        label: 'Prudenziale (+1r)'
      },
      consigliato: {
        value: String(pesoConsigliato),
        display: `${formatWeight(pesoConsigliato)} kg`,
        label: 'Consigliato'
      },
      sfidante: {
        value: String(pesoSfidante),
        display: `${formatWeight(pesoSfidante)} kg`,
        label: 'Sfidante'
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
  const repsVolume = repsTarget + 1;
  return {
    prudenziale: {
      value: `${pesoBase}x${repsVolume}r`,
      display: `${formatWeight(pesoBase)}x${repsVolume}r`,
      label: 'Prudenziale (+1r)'
    },
    consigliato: {
      value: String(pesoConsigliato),
      display: `${formatWeight(pesoConsigliato)} kg`,
      label: 'Consigliato'
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

const getGhostRenderInfo = (sett) => {
  const ghost = getGhostLiftSmart(sett);
  if (!ghost) return null;

  // Se l'esercizio è a corpo libero / ripetizioni, NON mostriamo il banner CONSIGLIATO del Ghost
  if (ghost.isRepExercise || isCorpoLiberoEsercizio(workout.value)) {
    return null;
  }

  let icon = 'mdi-lightbulb-on-outline';
  let color = '#ffb74d'; // orange-lighten-2
  let label = 'Consigliato:';
  let valueText = '';
  let refText = '';
  let hasReference = false;

  const isManubri = isManubriEsercizio(workout.value);
  const pesoBase = ghost.pesoBaseOriginale || ghost.peso || 0;

  if (ghost.isWeek2Scritta) {
    icon = 'mdi-trending-up';
    color = '#ffb74d';
    label = 'Consigliato:';
    valueText = 'Aumenta peso';
  } else if (ghost.isGhostInfortunio && !ghostSbloccato.value) {
    icon = 'mdi-bandage';
    color = '#ef4444'; // red-lighten-2
    const pct = ghost.percentualeInfortunio ?? 20;
    label = (ghost.applicaRiduzioneInfortunio !== false && pct > 0) ? `Proposta Comfort (-${pct}%):` : 'Monitoraggio Fastidio:';
    valueText = `${formatWeight(ghost.peso || ghost.suggerito || ghost.pesoProposto)} kg`;
  } else if (ghost.isScarico) {
    icon = 'mdi-battery-charging-40';
    color = '#fbbf24'; // amber-lighten-2
    label = 'Scarico:';
    valueText = `${formatWeight(ghost.peso)} kg`;
  } else if (ghost.isMetodo) {
    icon = 'mdi-cog-play-outline';
    color = '#ffb74d';
    label = `${ghost.metodoLabel}:`;
    valueText = ghost.text;
  } else if (ghost.isMandatory) {
    icon = 'mdi-alert-decagram-outline';
    color = '#f87171'; // red-lighten-1
    label = `${ghost.mandatoryLabel}:`;
    valueText = ghost.text;
  } else if (ghost.isOverload) {
    icon = ghost.peso > ghost.pesoBaseOriginale ? 'mdi-trending-up' : 'mdi-trending-neutral';
    color = '#ffb74d';
    label = ghost.peso > ghost.pesoBaseOriginale ? 'Consigliato (Aumento):' : 'Consigliato (Mantieni):';
    valueText = ghost.text;
  } else if (ghost.isPostScarico) {
    icon = ghost.pesoProposto > ghost.pesoBaseOriginale ? 'mdi-trending-up' : 'mdi-trending-neutral';
    color = '#ffb74d';
    label = ghost.pesoProposto > ghost.pesoBaseOriginale ? 'Consigliato (Aumento):' : 'Consigliato (Mantieni):';
    valueText = ghost.text;
  } else if (ghost.isWeek1) {
    icon = 'mdi-lightbulb-on-outline';
    color = '#ffb74d';
    label = 'Proposto W1:';
    if (ghost.erroreCarichi) {
      icon = 'mdi-alert-circle-outline';
      color = '#f87171';
      label = 'Nota:';
      valueText = 'Carica il Miglior Carico W6 per la stima';
    } else {
      valueText = ghost.isRepExercise ? (ghost.peso > 0 ? `${formatWeight(ghost.peso)}kg x${ghost.reps}r` : `${ghost.reps}r`) : `${formatWeight(ghost.suggerito)} kg`;
    }
  } else {
    // Caso standard delle settimane progressive (W2, W3, W4 se non scarico, W5, W6)
    const isStallPrev = sett > 2 && isStagnazioneSettimana(sett - 1);
    if (isStallPrev && !ghost.isScarico && !ghost.isGhostInfortunio) {
      icon = 'mdi-lightning-bolt-circle';
      color = '#c084fc'; // purple-lighten-2
      label = '⚡ SFIDA ANTI-STALLO:';
      const step = getWeightStep(isManubri, pesoBase);
      const pesoSfidante = (pesoBase > 0) ? pesoBase + step : (ghost.peso || 0) + step;
      valueText = `${formatWeight(pesoSfidante)} kg (o ${formatWeight(pesoBase)}kg + TUT)`;
    } else {
      const range = getGhostWeightsRangeForWeek(sett);
      if (range && range.consigliato) {
        valueText = range.consigliato.display;
      } else {
        valueText = ghost.text || '';
        if (ghost.isRepExercise && valueText && !valueText.endsWith('r')) {
          valueText += 'r';
        }
      }
    }
  }

  // Costruisce la descrizione storica (Riga 2)
  if (ghost.isWeek1 && !ghost.erroreCarichi) {
    hasReference = true;
  } else if (ghost.isScarico) {
    hasReference = true;
  } else if (ghost.isPostScarico) {
    hasReference = true;
  } else if (ghost.isOverload || ghost.isMetodo || ghost.isMandatory) {
    hasReference = true;
  } else if (ghost.text) {
    hasReference = true;
  } else if (getRiferimentoSfidaRecord(sett)) {
    hasReference = true;
  }

  return { icon, color, label, valueText, hasReference };
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
  if (!workout.value) return { pesoW2: null, pesoW3: null };
  
  const w2Ins = inputSettimane.value[2]?.ins;
  const w3Ins = inputSettimane.value[3]?.ins;
  
  const w2Str = w2Ins ? estraiPesoDaInput(w2Ins) : null;
  const w3Str = w3Ins ? estraiPesoDaInput(w3Ins) : null;
  
  return {
    pesoW2: w2Str ? parseFloat(w2Str) : null,
    pesoW3: w3Str ? parseFloat(w3Str) : null,
    insW2: w2Ins || '',
    insW3: w3Ins || ''
  };
});

const caricoConsigliatoViaDiMezzo = computed(() => {
  return getCaricoConsigliatoViaDiMezzoForWeek(aiutoWeek.value);
});

const opzioniStradeProgressione = computed(() => {
  if (!workout.value) return [];
  const sett = aiutoWeek.value;
  
  const range = getGhostWeightsRangeForWeek(sett);
  if (!range) return [];
  
  return [
    {
      tipo: 'safe',
      titolo: '🛡️ Safe',
      sottoTitolo: range.prudenziale.label || 'Prudenziale',
      valore: range.prudenziale.display,
      peso: parseFloat(range.prudenziale.value)
    },
    {
      tipo: 'smart',
      titolo: '💡 Smart',
      sottoTitolo: range.consigliato.label || 'Consigliato',
      valore: range.consigliato.display,
      peso: parseFloat(range.consigliato.value)
    },
    {
      tipo: 'sfidante',
      titolo: '🔥 Sfidante',
      sottoTitolo: range.sfidante.label || 'Sfidante',
      valore: range.sfidante.display,
      peso: parseFloat(range.sfidante.value)
    }
  ];
});

const spiegazioneDinamicaConsigliata = computed(() => {
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
    return `⚡ Progressione di volume attiva! Le ripetizioni richieste sono aumentate (da ${info.repsBase} a ${info.repsTarget} reps). Mantenere lo stesso peso di ${info.pesoBase} kg (usato in W${info.baseWNum}${info.isPreviousWorkoutW6 ? ' prec.' : ''}) è già a tutti gli effetti una progressione. Non occorre aumentare il carico!`;
  }

  const potenziale = caricoIdealeConsigliato.value ? caricoIdealeConsigliato.value.pesoProposto : null;
  const programmato = pesoPropostoDettaglio.value;
  const consigliato = caricoConsigliatoViaDiMezzo.value;
  
  if (potenziale === null || programmato === null) return '';
  
  if (potenziale > programmato) {
    return `📈 La tua forza stimata recente (${potenziale} kg) è in crescita rispetto al carico programmato base. Ti consigliamo una via di mezzo di ${consigliato} kg per progredire in sicurezza senza stalli.`;
  } else if (potenziale < programmato) {
    return `⚠️ La stima sulle prestazioni recenti (${potenziale} kg) suggerisce prudenza rispetto al carico programmato base della scheda (${programmato} kg). Ti consigliamo una via di mezzo di ${consigliato} kg.`;
  } else {
    return `🎯 La progressione programmata coincide perfettamente con la stima della tua forza attuale: ${consigliato} kg.`;
  }
});

const renderMarkdownBold = (text) => {
  if (!text) return '';
  return String(text).replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
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
  dialogStorico.value = true;
  await caricaDatiAnalisi(sett);
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
    'Neofita': `Il tuo massimale teorico (1RMT) di ${massimaleStr} kg è un punto di partenza fantastico. In questa fase iniziale, le tue riserve di adattamento neuromuscolare sono enormi: ogni sessione di allenamento ti renderà visibilmente più forte!`,
    'Principiante': `Ottimo lavoro, hai raggiunto un massimale di ${massimaleStr} kg. Stai consolidando la tua tecnica esecutiva e la coordinazione motoria. Continua con costanza e vedrai salire i carichi in sicurezza settimana dopo settimana.`,
    'Intermedio': `Complimenti per aver conquistato un massimale di ${massimaleStr} kg! Questo livello indica che hai già superato la fase iniziale e che i tuoi muscoli rispondono con forza a un lavoro programmato. La dedizione sta dando ottimi frutti.`,
    'Avanzato': `Sei a un livello eccezionale con ben ${massimaleStr} kg di massimale! A questo punto della programmazione, ogni singolo chilo aggiunto richiede impegno costante, precisione millimetrica e un'intensità mentale da vero atleta.`,
    'Elite': `Incredibile prestazione di ben ${massimaleStr} kg! Sei nel top assoluto per questo esercizio. Raggiungere il livello Elite dimostra che hai ottimizzato la coordinazione intra-muscolare, la tecnica e la resilienza fisica al massimo potenziale.`
  };
  return map[livello] || `Il tuo massimale attuale è di ${massimaleStr} kg. Continua così per raggiungere vette ancora più alte!`;
};

const getVariationExplanation = (rmt) => {
  if (!rmt || !rmt.variazione) return '';
  const varStr = rmt.variazione;
  const isDown = varStr.includes('↓');
  const percent = varStr.replace(/[↓↑\s%]/g, '');

  if (isDown) {
    return `Rispetto al mesociclo precedente, il tuo massimale teorico su questo esercizio è diminuito del ${percent}%. Questo calo può essere causato da una fase temporanea di stanchezza, da una settimana di scarico programmata, da un cambio di focus o da un range di ripetizioni differente. È parte integrante del percorso atletico, continua a lavorare!`;
  } else {
    return `Rispetto al mesociclo precedente, hai superato il tuo vecchio massimale del ${percent}%! Questo progresso testimonia una periodizzazione ottimale, un ottimo recupero energetico e una risposta muscolare eccellente. Continua su questa strada!`;
  }
};

const getNextLevelRequirement = (rmt) => {
  if (!rmt) return '';
  if (rmt.prossimoLivello) {
    const current = parseFloat(rmt.massimale.replace(',', '.')) || 0;
    const targetDiff = parseFloat(rmt.prossimoLivello.replace(',', '.')) || 0;
    const targetPeso = Math.round((current + targetDiff) * 10) / 10;
    return `Ti mancano circa ${rmt.prossimoLivello} kg di incremento (peso target: ${targetPeso} kg) per sbloccare la prossima stella e avanzare di livello!`;
  }
  return 'Hai già raggiunto il massimo livello registrato per questo esercizio! Continua a consolidare questa prestazione eccezionale!';
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
  const settore = String(ex.des_settore || '').toLowerCase();
  const settorePrinc = String(ex.des_settore_princ || '').toLowerCase();
  
  const keywords = [
    'corpo libero', 'corpolibero', 'trazioni', 'dip', 'piegamenti', 
    'push up', 'push-up', 'crunch', 'plank', 'sit up', 'sit-up', 
    'addominali', 'addome', 'leg raise', 'hyperextension', 'corpo_libero',
    'dragon', 'ab roll', 'ab-roll', 'rotella', 'ruota', 'rollout'
  ];
  
  return keywords.some(k => name.includes(k) || note.includes(k) || attr.includes(k) || settore.includes(k) || settorePrinc.includes(k));
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

  const keywords = ['cavo', 'cavi', 'cable', 'pulley', 'ercolina', 'pushdown', 'pulldown', 'lat machine', 'macchina', 'leg extension', 'leg curl', 'pressa', 'guided'];
  return keywords.some(k => 
    name.includes(k) || 
    noteAttr.includes(k) || 
    noteGen.includes(k) || 
    noteCoach.includes(k) || 
    insEsercizio.includes(k)
  );
};

const getWeightStep = (isManubri, baseWeight) => {
  if (!isManubri) return 2.5;
  const p = parseFloat(baseWeight) || 0;
  return p >= 10 ? 2.0 : 1.0;
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
  
  // Limita il peso se a corpo libero e le reps salgono
  if (isCorpoLiberoEsercizio(workout.value) && repsTarget > repsBase) {
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
  
  const isRepEx = isCorpoLiberoEsercizio(workout.value);
  
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
  } else if (isCorpoLiberoEsercizio(workout.value) && currW1Reps && baseReps && currW1Reps > baseReps) {
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

  return {
    peso: proposta,
    prevPeso: basePeso,
    prevReps: baseReps,
    currReps: currW1Reps,
    fatica: fatica || 'Nessuna',
    giorniTrascorsi,
    settimanaBase: baseWeekNum,
    stimaMenoAccurata: baseWeekNum < 6,
    rirTarget: rirW1,
    recordVal: recordVal,
    hasRecord: hasRecord,
    pesoPrudenziale: min,
    pesoConsigliato: medio,
    pesoSfidante: max,
    sfidanteLabel: sfidanteLabel,
    sfidaRecordWeek1: sfidaRecordWeek1.value
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
      const allData = await getStoryboardBackup();
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

const getRepsForWeek = (w) => {
  if (!workout.value) return null;
  let reps = workout.value['reps_week' + w];
  if (!reps) {
    reps = estraiRepsDaPrescrizione(workout.value['des_week' + w]);
  }
  return reps ? parseInt(reps, 10) : null;
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
  let reps = workout.value['reps_week' + wActive];
  if (!reps) {
    reps = estraiRepsDaPrescrizione(workout.value['des_week' + wActive]);
  }
  return reps ? parseInt(reps, 10) : null;
});


const isMatchingReps = (prevEx, w) => {
  const target = targetRepsRange.value;
  if (!target) return false;
  
  let reps = prevEx['reps_week' + w];
  if (!reps) {
    reps = estraiRepsDaPrescrizione(prevEx['des_week' + w]);
  }
  
  return reps && parseInt(reps, 10) === target;
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
    if (diffDays < 7) return `${diffDays} gg fa`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} sett fa`;
    
    const diffMonths = Math.round(diffDays / 30.43);
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'mese' : 'mesi'} fa`;
    
    const years = Math.floor(diffMonths / 12);
    const remainingMonths = diffMonths % 12;
    if (remainingMonths === 0) {
      return `${years} ${years === 1 ? 'anno' : 'anni'} fa`;
    } else {
      const annoStr = years === 1 ? 'anno' : 'anni';
      const meseStr = remainingMonths === 1 ? 'mese' : 'mesi';
      return `${years} ${annoStr} e ${remainingMonths} ${meseStr} fa`;
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

const determinaSettimanaAttivaGiorno = () => {
  // Se arriviamo da un link di recupero (targetWeek), forziamo la settimana attiva su quella
  if (route.query.targetWeek) {
    settimanaAttiva.value = parseInt(route.query.targetWeek);
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

watch(() => route.params.id, (nuovoId) => {
  if (nuovoId) {
    riportaAInizioPagina();
    routeIdLocal.value = nuovoId;
    localStorage.setItem('ultimoEsercizioDettaglio', nuovoId);
    caricaDatiEsercizio();
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
  // Reset completo dello storico dell'esercizio precedente per evitare "leak" visivi o logici
  previousWorkout.value = null;
  for (let w = 1; w <= 6; w++) {
    inputSettimanePrecedente.value[w].ins = '';
    inputSettimanePrecedente.value[w].reps = '';
  }
  numIns6ValPrecedente.value = '';
  numFaticaw6ValPrecedente.value = '';
  storicoEsercizio.value = [];
  storicoEsercizioPerAiuto.value = [];

  // CACHE REATTIVA PER SWIPE E CARICAMENTO IMMEDIATO
  let cachedEx = tuttiEserciziGiorno.value.find(ex => String(ex.id) === String(routeIdLocal.value));
  if (!cachedEx && globalStoryboard.value && globalStoryboard.value.length > 0) {
    cachedEx = globalStoryboard.value.find(ex => String(ex.id) === String(routeIdLocal.value) || String(ex.num_riga) === String(routeIdLocal.value));
  }

  if (cachedEx) {
    workout.value = applicaModificheLocali({ ...cachedEx });
    const keyIdCliente = Object.keys(cachedEx).find(k => k.includes('ID_cliente')) || 'ID_cliente';
    const atletaId = cachedEx[keyIdCliente] || '';
    if (route.query.targetWeek) {
      settimanaAttiva.value = parseInt(route.query.targetWeek);
    } else {
      settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + atletaId)) || 2;
    }
    stileStorico.value = localStorage.getItem('stileStorico_' + atletaId) || getStileStoricoAtleta(atletaId);
    modalitaSettimane.value = localStorage.getItem('modalitaSettimane_' + atletaId) || getModalitaSettimaneAtleta(atletaId);
    modalitaIncrementoGhost.value = localStorage.getItem('modalitaIncrementoGhost_' + atletaId) || 'ibrida';
    stileVisualizzazioneGhost.value = localStorage.getItem('stileVisualizzazioneGhost_' + atletaId) || 'range';
    ghostPRAttackAttivo.value = localStorage.getItem('ghostPRAttackAttivo_' + atletaId) !== 'false';
    ghostAutoregolazioneRepsAttiva.value = localStorage.getItem('ghostAutoregolazioneRepsAttiva_' + atletaId) !== 'false';
    sfidaRecordWeek1.value = localStorage.getItem('sfidaRecordWeek1_' + atletaId) === 'true';
    posizionamentoSuperset.value = localStorage.getItem('posizionamentoSuperset_' + atletaId) || 'auto';
    inizializzaParametriProposta(atletaId);

    const schemaRef = workout.value?.num_scheda;
    if (atletaId && schemaRef && !dataMesociclo.value) {
      caricaDataMesociclo(atletaId, schemaRef);
    }

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

    // Nascondi immediatamente lo spinner per apertura istantanea
    caricamento.value = false;

    // Carica il completamento del giorno (Riga 0) e l'elenco esercizi per lo swipe in background
    const desGiorno = workout.value.des_giorno;
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
      if (route.query.targetWeek) {
        settimanaAttiva.value = parseInt(route.query.targetWeek);
      } else {
        settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + atletaId)) || 2;
      }

      // Recupera stileStorico e modalitaSettimane per l'atleta specifico
      stileStorico.value = localStorage.getItem('stileStorico_' + atletaId) || getStileStoricoAtleta(atletaId);
      modalitaSettimane.value = localStorage.getItem('modalitaSettimane_' + atletaId) || getModalitaSettimaneAtleta(atletaId);
      modalitaIncrementoGhost.value = localStorage.getItem('modalitaIncrementoGhost_' + atletaId) || 'ibrida';
      stileVisualizzazioneGhost.value = localStorage.getItem('stileVisualizzazioneGhost_' + atletaId) || 'range';
      stileRecordStorico.value = localStorage.getItem('stileRecordStorico_' + atletaId) || 'cards';
      ghostPRAttackAttivo.value = localStorage.getItem('ghostPRAttackAttivo_' + atletaId) !== 'false';
      ghostAutoregolazioneRepsAttiva.value = localStorage.getItem('ghostAutoregolazioneRepsAttiva_' + atletaId) !== 'false';
      sfidaRecordWeek1.value = localStorage.getItem('sfidaRecordWeek1_' + atletaId) === 'true';
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
    const found = allData.find(item => String(item.id) === String(routeIdLocal.value) || String(item.num_riga) === String(routeIdLocal.value));
    if (found) {
      workout.value = applicaModificheLocali(found);
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
      modalitaIncrementoGhost.value = localStorage.getItem('modalitaIncrementoGhost_' + atletaId) || 'ibrida';
      stileVisualizzazioneGhost.value = localStorage.getItem('stileVisualizzazioneGhost_' + atletaId) || 'range';
      stileRecordStorico.value = localStorage.getItem('stileRecordStorico_' + atletaId) || 'cards';
      ghostPRAttackAttivo.value = localStorage.getItem('ghostPRAttackAttivo_' + atletaId) !== 'false';
      ghostAutoregolazioneRepsAttiva.value = localStorage.getItem('ghostAutoregolazioneRepsAttiva_' + atletaId) !== 'false';
      sfidaRecordWeek1.value = localStorage.getItem('sfidaRecordWeek1_' + atletaId) === 'true';
      posizionamentoSuperset.value = localStorage.getItem('posizionamentoSuperset_' + atletaId) || 'auto';
      inizializzaParametriProposta(atletaId);

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
  if (val === null || val === undefined) return '';
  return String(val).replace('.', ',');
}

// Helper to format repetitions with 'r' suffix
function formatRepsDisplay(val) {
  if (val === null || val === undefined) return '-';
  const str = String(val).trim();
  if (!str || str === '-') return '-';
  if (str.toLowerCase().endsWith('r')) return str;
  return str + 'r';
}

const getGhostLift = (sett) => {
  if (!workout.value) return null;

  // Se è un esercizio a corpo libero con reps in aumento, senza onda e senza scarico in W4, il Ghost non consiglia nulla
  if (isCorpoLiberoEsercizio(workout.value)) {
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

const getGhostLiftStandard = (sett) => {
  if (!workout.value) return null;

  const prescrizione = String(workout.value['des_week' + sett] || '');

  // Se la settimana o l'esercizio è a percentuale, non proponiamo il carico ombra (Caso 1)
  const hasPercFlag = workout.value.flg_perc && String(workout.value.flg_perc).includes('V%');
  if (prescrizione.includes('%') || hasPercFlag) {
    return null;
  }

  // Rileva se è un esercizio a corpo libero (reps, non kg) o incentrato sul volume
  const isRepEx = isCorpoLiberoEsercizio(workout.value);

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
      const isCorpoLiberoRepsSalgono = isCorpoLiberoEsercizio(workout.value) && repsTarget > repsBase;
      
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
      return currentReps >= ghostReps ? 'up' : 'down';
    }
    return 'up'; // Se non riusciamo a confrontare, considera positivo
  }

  const currentPesoStr = estraiPesoDaInput(currentInput);
  if (!currentPesoStr) return 'filled';

  // Confronta il peso attuale con il peso REALE della settimana di riferimento (ghost.text),
  // NON con il peso proposto dall'algoritmo RIR (ghost.peso).
  // Se l'utente ha aumentato rispetto alla settimana precedente, appare verde.
  const refPesoStr = estraiPesoDaInput(ghost.text);
  const refPeso = refPesoStr ? parseFloat(refPesoStr) : ghost.peso;
  return parseFloat(currentPesoStr) >= refPeso ? 'up' : 'down';
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
  const ghost = getGhostLiftSmart(sett);
  if (!ghost || !ghost.isRepExercise) return null;

  const val = inputSettimane.value[sett]?.ins;
  if (!val) return null;
  const clean = String(val).trim();
  
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

function estraiRepsDaInput(str) {
  if (!str) return null;
  let clean = String(str).replace(/,/g, '.').trim();
  
  // Rimuove espressioni di RPE prima dell'estrazione reps (es. "Rpe: 93 - 99", "RPE 8.5")
  clean = clean.replace(/\b(?:rpe|r\.p\.e\.)\s*:?\s*@?\s*\d+(?:[\.,]\d+)?(?:\s*[\-\/]\s*\d+(?:[\.,]\d+)?)*/gi, ' ').trim();
  
  // Soluzione 2: Rileva tecniche d'intensità / Rest-Pause prima della pulizia (es. "+ RP fino a 14" o "RP 14")
  const matchRP = clean.match(/(?:\+|\bpoi\b)?\s*(?:rp|rest\s*pause|drop\s*set|cluster)\s*(?:fino\s*a\s*)?(\d+(?:\.\d+)?)/i);
  if (matchRP) {
    return parseFloat(matchRP[1]);
  }

  // Soluzione 1: Rimuove parentesi tonde (...) e quadre [...] per evitare che note personali interferiscano col calcolo
  clean = clean.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').trim();

  // Rimuove espressioni di impostazioni/metadati per evitare interferenze
  const cleanSettingsRegex = /\b(?:pin|buco|buca|buchi|foro|fori|tacca|tacche|altezza|pos|posizione|inc|inclinazione|gradi|grado|step|level|livello|liv|regolazione|tacc|tassello|tavoletta|board|box|set|sets|serie|reps|rep|ripetizioni|rip|colpi|colpo|giro|giri|circuiti|circuito|volte|volta|passi|passo)\b\s*\d+(?:\.\d+)?/gi;
  clean = clean.replace(cleanSettingsRegex, '').trim();
  clean = clean.replace(/\d+(?:\.\d+)?\s*°/g, '').trim();
  
  // Rileva formato tipo "12x14r" o "12x14"
  const matchX = clean.match(/^\s*(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)(?:\s*[rR]?\b)?\s*$/);
  if (matchX) {
    return parseFloat(matchX[2]);
  }
  
  const matchR = clean.match(/(\d+(?:\.\d+)?)\s*[rR]\b/);
  if (matchR) {
    return parseFloat(matchR[1]);
  }
  
  return null;
}

function estraiPesoDaInput(str) {
  if (!str) return null;
  
  let clean = String(str).replace(/,/g, '.').trim();
  
  // Rimuove espressioni di RPE (es. "Rpe: 93 - 99", "RPE 8.5", "RPE: 9-10", "rpe 93-99", "rpe@9")
  // per evitare che la scala di sforzo percepito interferisca con l'estrazione del carico in KG
  clean = clean.replace(/\b(?:rpe|r\.p\.e\.)\s*:?\s*@?\s*\d+(?:[\.,]\d+)?(?:\s*[\-\/]\s*\d+(?:[\.,]\d+)?)*/gi, ' ').trim();
  
  // Rimuove espressioni di impostazioni/metadati (es. "PIN 12", "buco 3") per evitare che interferiscano
  const cleanSettingsRegex = /\b(?:pin|buco|buca|buchi|foro|fori|tacca|tacche|altezza|pos|posizione|inc|inclinazione|gradi|grado|step|level|livello|liv|regolazione|tacc|tassello|tavoletta|board|box|set|sets|serie|reps|rep|ripetizioni|rip|colpi|colpo|giro|giri|circuiti|circuito|volte|volta|passi|passo)\b\s*\d+(?:\.\d+)?/gi;
  clean = clean.replace(cleanSettingsRegex, '').trim();
  
  // Rimuove gradi (es. "30°")
  clean = clean.replace(/\d+(?:\.\d+)?\s*°/g, '').trim();

  // Rileva formato tipo "3x12" o "3x12r": la notazione SxR senza "kg" espliciti NON è un peso in kg!
  const matchSxR = clean.match(/^\s*\d+(?:\.\d+)?\s*[xX]\s*\d+(?:\.\d+)?(?:\s*[rR]?\b)?\s*$/);
  if (matchSxR) {
    return null;
  }
  
  // 1. Rimuoviamo il prefisso delle reps (es. "3x10", "4 x 12")
  const repsPrefixRegex = /^\s*\d+\s*[xX]\s*\d+(?:\s*[a-zA-Z+]*\b)?/g;
  clean = clean.replace(repsPrefixRegex, '').trim();
  
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
    'volte', 'volta', 'passi', 'passo', 'speed', 'velocità', 'vel', 'tempo'
  ];
  
  // Stopwords da ignorare prima del numero per trovare il prefisso reale
  const stopWords = [
    'a', 'di', 'su', 'in', 'da', 'alla', 'al', 'del', 'della', 'n', 'n.', 'num', 
    'num.', 'n°', 'pos', 'pos.', '#', ':', '::', '@', 'at', 'con', 'e', 'o', 'per'
  ];
  
  while ((match = numberRegex.exec(clean)) !== null) {
    const numStr = match[0];
    const numVal = parseFloat(numStr);
    const startIdx = match.index;
    const endIdx = startIdx + numStr.length;
    
    if (isNaN(numVal)) continue;
    
    // 1. Analisi del Suffisso (quello che segue il numero)
    const suffixStr = clean.substring(endIdx);
    const suffixClean = suffixStr.trim();
    
    // Se c'è esplicitamente "kg" dopo il numero (es. "10kg", "10 kg", "10 k"), lo accettiamo sempre come peso
    if (suffixClean.toLowerCase().startsWith('k')) {
      validWeights.push(numVal);
      continue;
    }
    
    // Se il suffisso è ripetizioni (es. "r", "R", "reps", "rep", "rip"), lo escludiamo dal peso
    if (suffixClean.toLowerCase().match(/^r(?![a-z])/i) || 
        suffixClean.toLowerCase().startsWith('rep') || 
        suffixClean.toLowerCase().startsWith('rip')) {
      continue;
    }
    
    // Se il suffisso inizia con il simbolo dei gradi ° o parole di configurazione/volume
    const suffixTokens = suffixClean.split(/[\s\-+:=@]+/);
    const suffixToken = (suffixTokens[0] || '').toLowerCase().trim();
    
    if (suffixClean.startsWith('°') || settingKeywords.some(word => suffixToken.includes(word) || suffixClean.toLowerCase().startsWith(word))) {
      continue; // Ignorato (è un parametro di setting o gradi o ripetizioni)
    }
    
    // Esclusioni standard per il suffisso (es. "/", "%", "rpe", "sec", "min", ecc.)
    // NOTA: NON usare startsWith('s') o startsWith('m') perché cattura parole come "molto", "su", "si", ecc.
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
    
    // Se la parola significativa prima del numero è un'impostazione o rpe/rp, escludiamo il numero
    if (prefixWord) {
      if (settingKeywords.some(word => prefixWord === word || prefixWord.includes(word)) || prefixWord === 'rpe' || prefixWord === 'rp') {
        continue; // Ignorato
      }
    }
    
    validWeights.push(numVal);
  }
  
  if (validWeights.length > 0) {
    return String(Math.max(...validWeights));
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
  const isManubri = isManubriEsercizio(workout.value);
  let current = parseKg(numIns6Val.value);
  const step = getWeightStep(isManubri, current);
  current += step;
  numIns6Val.value = String(parseFloat(current.toFixed(2)));
  salvaKgUnico();
};

const decrementaKgUnico = () => {
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

  // 1. Record Assoluto Generale dell'Esercizio (PR di sempre su qualsiasi rep)
  let absGenWeight = 0;
  let absGenWeek = 0;
  let absGenReps = null;
  let absGenSheet = null;
  let absGenDay = null;
  let absGenDate = null;

  // 2. Record Assoluto a Stesse Reps (PR sulle reps target di settimana)
  let absRepsWeight = 0;
  let absRepsWeek = 0;
  let absRepsReps = null;
  let absRepsSheet = null;
  let absRepsDay = null;
  let absRepsDate = null;

  storicoEsercizio.value.forEach(prevEx => {
    const sNum = parseInt(prevEx.num_scheda);
    if (!isNaN(sNum) && sNum >= currentNumScheda) return;

    for (let i = 1; i <= 6; i++) {
      const val = prevEx['ins_week' + i];
      if (val) {
        const pesoNum = parseFloat(estraiPesoDaInput(val));
        if (!isNaN(pesoNum) && pesoNum > 0) {
          let reps = prevEx['reps_week' + i];
          if (!reps) {
            reps = estraiRepsDaPrescrizione(prevEx['des_week' + i]);
          }
          const inputReps = estraiRepsDaInput(val);
          const repsNum = inputReps !== null && !isNaN(inputReps) && inputReps > 0 ? inputReps : (reps ? parseInt(reps, 10) : null);
          const dateVal = getExecutionDate(prevEx, storicoEsercizio.value, workout.value);

          // Controllo PR Generale (All-Time)
          if (pesoNum > absGenWeight) {
            absGenWeight = pesoNum;
            absGenWeek = i;
            absGenReps = repsNum;
            absGenSheet = prevEx.num_scheda;
            absGenDay = prevEx.des_giorno;
            absGenDate = dateVal;
          }

          // Controllo PR a Stesse Reps (isMatchingReps o reps === targetReps)
          if (isMatchingReps(prevEx, i) || (repsNum && repsNum === targetReps)) {
            if (pesoNum > absRepsWeight) {
              absRepsWeight = pesoNum;
              absRepsWeek = i;
              absRepsReps = repsNum;
              absRepsSheet = prevEx.num_scheda;
              absRepsDay = prevEx.des_giorno;
              absRepsDate = dateVal;
            }
          }
        }
      }
    }
  });

  const isScarico = (w === 4 && isWeek4Scarico.value);
  const pesoW2 = workout.value?.ins_week2 || '';

  let increment = 1.25;
  if (w <= 3) increment = 0.5;
  else if (w === 4) increment = 1.0;
  else increment = 2.0;

  const baseRec = absRepsWeight > 0 ? absRepsWeight : absGenWeight;
  const targetWeight = baseRec > 0 ? baseRec + increment : 0;

  if (absGenWeight === 0 && absRepsWeight === 0 && !isScarico) return null;

  return {
    record: absRepsWeight,
    recordRepsWeek: absRepsWeek,
    recordRepsValue: absRepsReps,
    recordRepsSheet: absRepsSheet,
    recordRepsDay: absRepsDay,
    recordRepsDate: absRepsDate,

    recordAbsolute: absGenWeight,
    recordAbsoluteWeek: absGenWeek,
    recordAbsoluteReps: absGenReps,
    recordAbsoluteSheet: absGenSheet,
    recordAbsoluteDay: absGenDay,
    recordAbsoluteDate: absGenDate,

    target: targetWeight,
    isScarico,
    pesoWeek2: pesoW2
  };
});

const getColoreFaticaStyle = (fatica) => {
  if (!fatica) return {};
  const f = fatica.trim().toLowerCase();
  if (f === 'media') return { color: '#81c784 !important' }; // Light green
  if (f === 'pesante') return { color: '#ffb74d !important' }; // Light orange
  if (f === 'devastante') return { color: '#e57373 !important' }; // Light red
  return {};
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
        list.push({ id: doc.id, ...d });
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
  
  if (modeGraficoStorico.value === 'A') {
    const colors = ['#f97316', '#38bdf8', '#a855f7', '#22c55e', '#ec4899', '#eab308'];
    
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
        pointBorderColor: '#ffffff',
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
      borderColor: 'rgba(255, 255, 255, 0.4)',
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderDash: [5, 5],
      pointBackgroundColor: 'rgba(255, 255, 255, 0.6)',
      pointBorderColor: 'transparent',
      pointRadius: 2,
      pointHoverRadius: 4,
      fill: false,
      spanGaps: true
    });
  } else if (modeGraficoStorico.value === 'B') {
    const colors = ['#f97316', '#38bdf8', '#a855f7', '#22c55e', '#ec4899', '#eab308'];
    
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
        pointBorderColor: '#ffffff',
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
      borderColor: '#22c55e',
      backgroundColor: 'rgba(34, 197, 94, 0.05)',
      borderWidth: 2,
      pointBackgroundColor: '#16a34a',
      pointBorderColor: '#ffffff',
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
      borderColor: '#f97316',
      backgroundColor: 'rgba(249, 115, 22, 0.1)',
      borderWidth: 3,
      pointBackgroundColor: '#ea580c',
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
    storicoChartReady.value = true;
    return;
  }
  
  storicoChartData.value = {
    labels: labels,
    datasets: datasets
  };
  storicoChartReady.value = true;
};

const storicoChartOptions = ref({
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
        color: '#cbd5e1',
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
        color: '#94a3b8',
        font: { weight: 'bold', size: 8 }
      }
    },
    y: {
      grid: { color: 'rgba(255, 255, 255, 0.08)' },
      ticks: {
        color: '#94a3b8',
        callback: function(value) {
          return value + ' kg';
        }
      }
    }
  }
});

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

const vaiADettaglioStorico = (prevExId) => {
  vibraTattile(12);
  if (!prevExId) return;
  dialogStorico.value = false;
  dialogAiutoProposta.value = false;

  if (workout.value && String(workout.value.id) === String(prevExId)) {
    riportaAInizioPagina();
  } else {
    router.push({ name: 'DettaglioWorkout', params: { id: prevExId } });
  }
};

const isVolumeString = (str) => {
  if (!str) return false;
  return /V:\s*[\d,.]+/i.test(str) && /(?:A|B|C):\s*[\d,.]+/i.test(str);
};

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
  const str = String(val).toLowerCase();
  
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

const toggleRecuperoDettaglio = (sett, attivo) => {
  vibraTattile(15);
  const valoreAttuale = inputSettimane.value[sett].ins;
  const nuovoValore = impostaRecuperoValore(valoreAttuale, attivo);
  inputSettimane.value[sett].ins = nuovoValore;
  salvaDatoSettimanale(sett, 'ins');
};

const salvaModifichePendenti = async () => {
  if (!workout.value) return;
  
  const updates = {};
  
  for (let w = 1; w <= 6; w++) {
    const valNuovo = inputSettimane.value[w].ins;
    const valOriginale = workout.value['ins_week' + w] || '';
    if (valNuovo !== valOriginale) {
      const campo = `ins_week${w}`;
      updates[campo] = valNuovo;
      
      // Auto-estrazione per la week 6
      if (w === 6 && valNuovo) {
        const estratto = estraiNumeroMassimo(valNuovo);
        if (estratto !== null) {
          const vecchioEstratto = estraiNumeroMassimo(valOriginale);
          if (!numIns6Val.value || (vecchioEstratto !== null && parseFloat(numIns6Val.value) === vecchioEstratto)) {
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
  border-bottom: 2px solid #ef6c00;
  padding-bottom: 4px; /* Was 8px, reduced to tighten header height */
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
  border: 2px solid #f97316 !important;
  background-color: rgba(249, 115, 22, 0.03) !important;
  box-shadow: 0 0 15px rgba(249, 115, 22, 0.15) !important;
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
  border-left: 2px solid #ef6c00 !important;
}

.card-glass-dark {
  background: var(--card-bg-dark);
  backdrop-filter: blur(8px);
}

/* Matite e label trasparenti per input carico settimanale */
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
  border-color: #f97316 !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.5) !important;
}
.custom-weight-input :deep(.v-field__outline) {
  display: none !important;
}

/* Stile per input compatto */
.custom-compact-textarea :deep(.v-field) {
  min-height: 48px !important;
  border-radius: 8px !important;
}
.custom-compact-textarea :deep(.v-field__input) {
  padding-top: 10px !important;
  padding-bottom: 10px !important;
}
.custom-compact-textarea :deep(input),
.custom-compact-textarea :deep(textarea) {
  font-size: 0.9rem !important;
  line-height: 1.4 !important;
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
.ghost-glow-green :deep(.v-field) {
  background: rgba(16, 185, 129, 0.1) !important;
  border: 1px solid rgba(16, 185, 129, 0.45) !important;
  box-shadow: 0 0 16px rgba(16, 185, 129, 0.25) !important;
}
.ghost-glow-green :deep(.v-field--focused) { border-color: #10b981 !important; box-shadow: 0 0 20px rgba(16, 185, 129, 0.4) !important; }
.ghost-glow-green :deep(input), .ghost-glow-green :deep(textarea) { color: #34d399 !important; font-weight: 800 !important; }
.ghost-glow-green :deep(.v-label) { color: #34d399 !important; opacity: 0.9 !important; }

/* BLU (Carico Calato) */
.ghost-glow-blue :deep(.v-field) {
  background: rgba(59, 130, 246, 0.1) !important;
  border: 1px solid rgba(59, 130, 246, 0.45) !important;
  box-shadow: 0 0 16px rgba(59, 130, 246, 0.25) !important;
}
.ghost-glow-blue :deep(.v-field--focused) { border-color: #3b82f6 !important; box-shadow: 0 0 20px rgba(59, 130, 246, 0.4) !important; }
.ghost-glow-blue :deep(input), .ghost-glow-blue :deep(textarea) { color: #60a5fa !important; font-weight: 800 !important; }
.ghost-glow-blue :deep(.v-label) { color: #60a5fa !important; opacity: 0.9 !important; }

/* ARANCIONE (Testo generico senza Ghost o note) */
.ghost-glow-orange :deep(.v-field) {
  background: rgba(249, 115, 22, 0.1) !important;
  border: 1px solid rgba(249, 115, 22, 0.45) !important;
  box-shadow: 0 0 16px rgba(249, 115, 22, 0.25) !important;
}
.ghost-glow-orange :deep(.v-field--focused) { border-color: #f97316 !important; box-shadow: 0 0 20px rgba(249, 115, 22, 0.4) !important; }
.ghost-glow-orange :deep(input), .ghost-glow-orange :deep(textarea) { color: #fb923c !important; font-weight: 800 !important; }
.ghost-glow-orange :deep(.v-label) { color: #fb923c !important; opacity: 0.9 !important; }

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
  border-color: #f97316 !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.5) !important;
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
  background: var(--card-bg-dark);
  z-index: 5;
  border-right: 1.5px solid rgba(255, 255, 255, 0.08);
}

th.sticky-col {
  position: sticky;
  left: 0;
  top: 0;
  background: rgba(30, 41, 59, 1);
  z-index: 12; /* Massimo z-index per l'angolo in alto a sinistra (Scheda) */
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
  background: rgba(239, 68, 68, 0.22) !important;
  border-right: 2.5px solid #ef4444 !important;
}

.red-scheda-header {
  background: rgba(239, 68, 68, 0.15) !important;
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

</style>
