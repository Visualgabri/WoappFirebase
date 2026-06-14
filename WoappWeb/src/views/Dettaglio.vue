<template>
  <v-container class="px-3 pt-1 pb-4 max-width-container bg-slate-50 min-height-screen pb-12">
    <!-- Header Sticky Wrapper -->
    <div class="sticky-detail-header">
      <!-- Barra Superiore con pulsante indietro stile AppSheet -->
      <div class="d-flex align-center justify-space-between appsheet-top-bar" :class="layoutCorrente === 'super_compatto' ? 'mb-1.5' : (layoutCorrente === 'compatto' ? 'mb-2' : 'mb-3')">
        <v-btn
          icon
          color="orange-darken-3"
          variant="text"
          @click="tornaIndietro"
          id="btn-dettaglio-indietro"
        >
          <v-icon :size="layoutCorrente === 'super_compatto' ? 22 : (layoutCorrente === 'compatto' ? 24 : 28)">mdi-arrow-left</v-icon>
        </v-btn>
        <div class="d-flex align-center justify-center flex-grow-1 px-2 text-truncate" style="gap: 8px;">
          <v-chip
            v-if="workout?.num_riga_giorno"
            color="orange-darken-3"
            size="x-small"
            class="font-weight-black text-white px-1 py-0 flex-shrink-0"
            variant="flat"
            style="min-width: 20px; height: 16px; font-size: 0.62rem;"
          >
            {{ workout.des_giorno }}{{ workout.num_riga_giorno }}
          </v-chip>
<h3 class="font-weight-black text-slate-dark text-truncate mb-0" :class="layoutCorrente === 'super_compatto' ? 'text-body-2' : (layoutCorrente === 'compatto' ? 'text-body-1' : 'text-subtitle-1')" style="white-space: normal; word-break: break-word; line-height: 1.05 !important;">
  <span v-if="trendFreccia" :class="trendFreccia === '▲' ? 'text-red-lighten-3' : 'text-blue-lighten-2'" class="font-weight-black mr-0.5" style="display: inline; white-space: nowrap;">{{ trendFreccia }}</span>{{ (workout?.flg_ex_mai_fatto === 'false' || workout?.flg_ex_mai_fatto === false) && String(workout?.num_scheda) !== '1' ? '✨' : '' }}{{ workout?.des_esercizio || 'Dettaglio Esercizio' }}
</h3>
        </div>
        <v-btn icon color="slate-dark" variant="text" @click="caricaDatiEsercizio"><v-icon>mdi-refresh</v-icon></v-btn>
      </div>

      <!-- Avviso Scheda Passata (Modalità Storico) -->
      <v-card
        v-if="isSchedaPassata"
        class="text-left border d-flex align-start card-glass"
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
        class="text-left border d-flex align-center card-glass"
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
        <h2 
          class="font-weight-black leading-tight mb-1" 
          :class="(previousWorkout && parseInt(previousWorkout.num_scheda) === parseInt(workout?.num_scheda) - 1) ? 'text-red-lighten-3' : 'text-slate-dark'"
          :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.92rem' : (layoutCorrente === 'compatto' ? '1.0rem' : '1.1rem'), lineHeight: 1.2, whiteSpace: 'normal', wordBreak: 'break-word' }"
        >
          <v-icon 
            v-if="parsedRmt(workout.des_esercizio_2)" 
            :color="getLivelloForzaIconInfo(parsedRmt(workout.des_esercizio_2).stelle).color" 
            class="mr-1 mb-0.5" 
            :size="layoutCorrente === 'super_compatto' ? 14 : 18"
            style="display: inline-block; vertical-align: middle;"
          >
            {{ getLivelloForzaIconInfo(parsedRmt(workout.des_esercizio_2).stelle).icon }}
          </v-icon>
          <span v-if="trendFreccia" :class="trendFreccia === '▲' ? 'text-red-lighten-3' : 'text-blue-lighten-2'" class="font-weight-black mr-0.5" style="display: inline; white-space: nowrap;">{{ trendFreccia }}</span>{{ (workout?.flg_ex_mai_fatto === 'false' || workout?.flg_ex_mai_fatto === false) && String(workout?.num_scheda) !== '1' ? '✨' : '' }}{{ workout.des_esercizio }}
        </h2>

        <!-- Visualizzazione RMT Formattata Premium Gamified -->
        <div 
          v-if="parsedRmt(workout.des_esercizio_2)" 
          class="rmt-premium-card card-glass border-orange-darken-3-op"
          :class="[
            layoutCorrente === 'super_compatto' ? 'rounded-sm mt-1.5 pa-2' : (layoutCorrente === 'compatto' ? 'rounded-lg mt-2 pa-2.5' : 'rounded-xl mt-3 pa-3')
          ]"
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
                  ~{{ parsedRmt(workout.des_esercizio_2).prossimoLivello }} <span class="text-super-caption text-muted">KG</span>
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

        <!-- Rigo Dettaglio Rapido -->
        <div :class="[layoutCorrente === 'super_compatto' ? 'mt-0.5 gap-1' : (layoutCorrente === 'compatto' ? 'mt-1 gap-1.25' : 'mt-1 gap-1.5'), 'text-caption font-weight-bold text-slate d-flex align-center flex-wrap']">
          <!-- 1. Settore Muscolare (Clickable) -->
          <v-chip
            color="orange-darken-3"
            size="x-small"
            class="font-weight-black clickable-sector-chip px-2 py-0.5"
            variant="flat"
            style="cursor: pointer;"
            append-icon="mdi-chevron-right"
            @click="apriListaSettore"
          >
            {{ workout.des_settore }}
          </v-chip>

          <!-- 2. Chip TUT (se presente) - Prima del recupero -->
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

          <!-- 3. Recupero (se presente) - GRANDE e EVIDENZIATO con animazione e gradiente -->
          <v-chip
            v-if="workout.des_rec_report"
            color="amber-darken-3"
            variant="flat"
            size="small"
            class="font-weight-black clickable-timer-chip recovery-standout-chip px-3 py-1.5"
            prepend-icon="mdi-clock-outline"
            @click="avviaTimerRecupero(workout.des_rec_report, workout.des_esercizio)"
          >
            ⏱️ {{ workout.des_rec_report }}
          </v-chip>

          <!-- 4. Fallback Chip per altre descrizioni -->
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

            <!-- Tasto ELIMINA (solo Coach) -->
            <v-btn
              v-if="ruolo === 'coach'"
              prepend-icon="mdi-close-thick"
              variant="text"
              color="red-lighten-2"
              class="font-weight-black text-none px-2"
              :size="layoutCorrente === 'super_compatto' ? 'x-small' : 'small'"
              @click="dialogElimina = true"
              :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem', letterSpacing: '0.05em' }"
            >
              ELIMINA
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

      <!-- Barra Laterale Superset (Opzione B) -->
      <div v-if="workout.alf_superserie" :class="layoutCorrente === 'super_compatto' ? 'mb-2 mt-0.5' : (layoutCorrente === 'compatto' ? 'mb-3 mt-1' : 'mb-4 mt-1')">
        <div class="text-left border-left-orange pl-3 position-relative">
          <div class="d-flex align-center mb-1">
            <span class="text-super-caption font-weight-black text-orange-darken-3 mr-2" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.6rem' }">⚡ SUPERSET {{ workout.alf_superserie }}</span>
            <span 
              class="text-super-caption font-weight-black uppercase" 
              :class="workout.des_rec_report ? 'text-amber-lighten-2' : 'text-green-accent-3'"
              :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.58rem', letterSpacing: '0.05em' }"
            >
              {{ workout.des_rec_report ? 'Recupera' : 'Vola al prossimo' }}
            </span>
          </div>
          
          <div
            v-for="connEx in eserciziSupersetCollegati.slice(0, 1)"
            :key="connEx.id"
            class="d-flex align-center py-1 px-2 bg-slate-900 border-soft clickable-item"
            :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : (layoutCorrente === 'compatto' ? 'rounded-md' : 'rounded-lg')"
            @click="vaiAdEsercizioCollegato(connEx.id)"
            style="cursor: pointer;"
          >
            <div class="overflow-hidden mr-2 bg-black border-soft" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm' : 'rounded'" :style="{ width: layoutCorrente === 'super_compatto' ? '24px' : '32px', height: layoutCorrente === 'super_compatto' ? '24px' : '32px', flexShrink: 0 }">
              <v-img :src="getGifUrl(connEx.UrlNormal)" :width="layoutCorrente === 'super_compatto' ? 24 : 32" :height="layoutCorrente === 'super_compatto' ? 24 : 32" cover></v-img>
            </div>
            <div class="flex-grow-1 text-truncate">
              <div class="text-caption font-weight-black text-white text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.68rem !important' : '0.75rem !important' }">{{ connEx.des_esercizio }}</div>
              <div class="text-super-caption text-orange-lighten-2 font-weight-bold" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.55rem' }">{{ formatPrescrizioneSuperset(connEx) }}</div>
            </div>
            <v-icon :size="layoutCorrente === 'super_compatto' ? 14 : 16" color="green-accent-3" class="ml-1">mdi-arrow-right-circle</v-icon>
          </div>
          
          <div v-if="eserciziSupersetCollegati.length > 1" class="text-super-caption text-muted mt-1 font-weight-bold" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.48rem' : '0.52rem', letterSpacing: '0.05em' }">
             + ALTRI {{ eserciziSupersetCollegati.length - 1 }} ESERCIZI NELLA SERIE
          </div>
        </div>
      </div>



      <!-- 3. Coaching Note Card (Compact callout) -->
      <v-card
        v-if="workout && workout.des_note && String(workout.des_note).trim()"
        class="elevation-0 text-left d-flex align-center"
        :class="[
          layoutCorrente === 'super_compatto' ? 'rounded-sm py-1.5 px-2 mb-3' : (layoutCorrente === 'compatto' ? 'rounded-md py-2 px-2.5 mb-4' : 'rounded-lg py-2 px-3 mb-5')
        ]"
        style="background: rgba(249, 115, 22, 0.08) !important; border: 1px solid rgba(249, 115, 22, 0.2) !important; border-left: 4px solid #f97316 !important;"
      >
        <v-icon color="orange-lighten-2" class="mr-2 flex-shrink-0" size="15">mdi-information-outline</v-icon>
        <span class="text-orange-lighten-4 font-weight-medium" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.68rem' : '0.75rem', lineHeight: 1.35, color: '#ffedd5 !important' }">
          {{ String(workout.des_note).trim() }}
        </span>
      </v-card>

      <!-- Esecuzione Metodo/ROM (Unificata e fuori dalle week) -->
      <v-card
        v-if="workout && workout.des_estesa_start && String(workout.des_estesa_start).trim()"
        class="text-left border d-flex align-start card-glass mb-3"
        :style="{
          background: 'rgba(249, 115, 22, 0.08) !important',
          border: '1.5px solid rgba(249, 115, 22, 0.25) !important',
          boxShadow: '0 4px 20px rgba(249, 115, 22, 0.05)',
          borderRadius: layoutCorrente === 'super_compatto' ? '4px !important' : (layoutCorrente === 'compatto' ? '8px !important' : '12px !important'),
          padding: '10px 12px !important'
        }"
      >
        <v-icon color="orange-lighten-2" class="mr-2.5 mt-0.5 flex-shrink-0" size="18">mdi-cog-play-outline</v-icon>
        <div class="text-slate-dark" style="font-size: 0.72rem; line-height: 1.4;">
          <strong class="text-orange-lighten-2 uppercase" style="font-size: 0.62rem; letter-spacing: 0.05em;">ROM ed Esecuzione:</strong><br>
          <span class="text-white font-weight-medium">
            {{ getDescrizioneBreve(workout.des_estesa_start) }}
          </span>
        </div>
      </v-card>

      <div class="weeks-stacked-list mb-4">
        <!-- Nota Esponenti (Ripetizioni di Riserva RIR) -->
         <v-card
          v-if="haEsponenti"
          class="text-left border d-flex align-start"
          :class="layoutCorrente === 'super_compatto' ? 'py-1.5 px-2.5 mb-2.5' : (layoutCorrente === 'compatto' ? 'py-2 px-3 mb-3' : 'py-2.5 px-3.5 mb-4')"
          :style="{
            background: 'rgba(15, 23, 42, 0.45) !important',
            border: '1.5px solid rgba(249, 115, 22, 0.25) !important',
            boxShadow: '0 4px 20px rgba(249, 115, 22, 0.05)',
            borderRadius: layoutCorrente === 'super_compatto' ? '4px !important' : (layoutCorrente === 'compatto' ? '8px !important' : '12px !important')
          }"
        >
          <v-icon color="orange-lighten-2" class="mr-2.5 mt-0.5 flex-shrink-0" size="18">mdi-information-outline</v-icon>
          <div class="text-slate-dark" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : '0.72rem', lineHeight: 1.4 }">
            <strong class="text-orange-lighten-2">Nota sulle Ripetizioni di Riserva (RIR):</strong> I numeri ad esponente (es. 8² o 10³) indicano il margine dal cedimento muscolare. Ad esempio, 8² significa eseguire 8 ripetizioni con una riserva di altre 2 ripetizioni possibili prima del cedimento completo.
          </div>
        </v-card>

        <v-card
          v-for="sett in settimaneVisualizzate"
          :key="sett"
          class="week-log-card border transition-all"
          :class="[
            layoutCorrente === 'super_compatto' ? 'rounded-sm py-1.5 px-2 mb-2.5' : (layoutCorrente === 'compatto' ? 'rounded-lg py-2 px-3 mb-4' : 'rounded-xl py-2.5 px-3 mb-6'),
            {
              'week-active-border': sett === settimanaAttiva,
              'week-secondary-card': modalitaSettimane === 'dinamica' && sett !== settimanaAttiva
            }
          ]"
          :style="[
            sett === settimanaAttiva ? (layoutCorrente === 'super_compatto' ? 'padding: 10px 10px 10px 10px !important;' : (layoutCorrente === 'compatto' ? 'padding: 12px 12px 14px 12px !important;' : 'padding: 14px 14px 16px 14px !important;')) : (modalitaSettimane === 'dinamica' ? 'opacity: 0.25 !important;' : '')
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
              <v-col :cols="parsedPrescription(workout['des_week' + sett]).side ? 3 : 4">
                <div 
                  class="prescription-chip-box text-left fill-height d-flex flex-column justify-center"
                  :class="[
                    layoutCorrente === 'super_compatto' ? 'rounded-sm px-1.5 py-0.5' : (layoutCorrente === 'compatto' ? 'rounded-md px-2 py-1' : 'rounded-lg px-2 py-1')
                  ]"
                  style="cursor: pointer;"
                  @click="apriCalcolatoreDischi(parsedPrescription(workout['des_week' + sett]).total, parsedPrescription(workout['des_week' + sett]).side, 'totale', workout?.des_esercizio)"
                >
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : '0.52rem', lineHeight: 1 }">Carico</span>
                  <span class="text-caption font-weight-black text-slate-dark text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem !important' : '0.85rem !important' }">
                    {{ parsedPrescription(workout['des_week' + sett]).total }} <span class="text-super-caption text-muted" style="font-size: 0.55rem;">KG</span>
                  </span>
                </div>
              </v-col>
              <!-- Peso per Lato (solo se presente) -->
              <v-col v-if="parsedPrescription(workout['des_week' + sett]).side" cols="3">
                <div 
                  class="prescription-chip-box text-left fill-height d-flex flex-column justify-center"
                  :class="[
                    layoutCorrente === 'super_compatto' ? 'rounded-sm px-1.5 py-0.5' : (layoutCorrente === 'compatto' ? 'rounded-md px-2 py-1' : 'rounded-lg px-2 py-1')
                  ]"
                  style="cursor: pointer;"
                  @click="apriCalcolatoreDischi(parsedPrescription(workout['des_week' + sett]).total, parsedPrescription(workout['des_week' + sett]).side, 'lato', workout?.des_esercizio)"
                >
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : '0.52rem', lineHeight: 1 }">Lato</span>
                  <span class="text-caption font-weight-black text-blue-lighten-2 text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem !important' : '0.85rem !important' }">
                    {{ parsedPrescription(workout['des_week' + sett]).side }} <span class="text-super-caption text-muted" style="font-size: 0.55rem;">KG</span>
                  </span>
                </div>
              </v-col>
              <!-- % Massimale -->
              <v-col :cols="parsedPrescription(workout['des_week' + sett]).side ? 3 : 4">
                <div 
                  class="prescription-chip-box text-left fill-height d-flex flex-column justify-center"
                  :class="[
                    layoutCorrente === 'super_compatto' ? 'rounded-sm px-1.5 py-0.5' : (layoutCorrente === 'compatto' ? 'rounded-md px-2 py-1' : 'rounded-lg px-2 py-1')
                  ]"
                >
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : '0.52rem', lineHeight: 1 }">% 1RM</span>
                  <span class="text-caption font-weight-black text-orange-lighten-2 text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem !important' : '0.85rem !important' }">
                    {{ parsedPrescription(workout['des_week' + sett]).max || '-' }}
                  </span>
                </div>
              </v-col>
              <!-- % Sforzo -->
              <v-col :cols="parsedPrescription(workout['des_week' + sett]).side ? 3 : 4">
                <div 
                  class="prescription-chip-box text-left fill-height d-flex flex-column justify-center"
                  :class="[
                    layoutCorrente === 'super_compatto' ? 'rounded-sm px-1.5 py-0.5' : (layoutCorrente === 'compatto' ? 'rounded-md px-2 py-1' : 'rounded-lg px-2 py-1')
                  ]"
                >
                  <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-0.5" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : '0.52rem', lineHeight: 1 }">Sforzo</span>
                  <span class="text-caption font-weight-black text-green-lighten-2 text-truncate" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem !important' : '0.85rem !important' }">
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

<!-- Input di inserimento Carico (Ghost Lift Integrato con Icona Recupero) -->
          <div :class="[layoutCorrente === 'super_compatto' ? 'mt-1 mb-0.5' : (layoutCorrente === 'compatto' ? 'mt-2 mb-0.5' : 'mt-3.5 mb-1'), 'position-relative']">
            <div v-if="getGhostLift(sett)" :class="layoutCorrente === 'super_compatto' ? 'mb-0.5 px-1 animate-fade-in' : 'mb-1.5 px-1 animate-fade-in'">
              <div class="d-flex align-center justify-space-between">
                <span v-if="getGhostLift(sett).isMetodo" class="text-super-caption text-orange-lighten-2 font-weight-black uppercase d-flex align-center gap-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.55rem' : '0.62rem', letterSpacing: '0.04em' }">
                  <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="orange-lighten-2">mdi-cog-play-outline</v-icon>
                  <span>{{ getGhostLift(sett).metodoLabel }}:</span>
                  <span class="text-white font-weight-black ml-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem' : '0.85rem' }">
                    {{ getGhostLift(sett).text }}
                  </span>
                </span>
                <span v-else-if="getGhostLift(sett).isMandatory" class="text-super-caption text-red-lighten-1 font-weight-black uppercase d-flex align-center gap-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.55rem' : '0.62rem', letterSpacing: '0.04em' }">
                  <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="red-lighten-1">mdi-alert-decagram-outline</v-icon>
                  <span>{{ getGhostLift(sett).mandatoryLabel }}:</span>
                  <span class="text-white font-weight-black ml-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem' : '0.85rem' }">
                    {{ getGhostLift(sett).text }}
                  </span>
                </span>
                <span v-else-if="getGhostLift(sett).isOverload" class="text-super-caption text-orange-lighten-2 font-weight-black uppercase d-flex align-center gap-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.55rem' : '0.62rem', letterSpacing: '0.04em' }">
                  <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="orange-lighten-2">mdi-trending-up</v-icon>
                  <span>{{ getGhostLift(sett).overloadText }}</span>
                  <span class="text-white font-weight-black ml-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem' : '0.85rem' }">
                    {{ getGhostLift(sett).text }}
                  </span>
                </span>
                <span v-else-if="getGhostLift(sett).isPostScarico" class="text-super-caption text-orange-lighten-2 font-weight-black uppercase d-flex align-center gap-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.55rem' : '0.62rem', letterSpacing: '0.04em' }">
                  <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="orange-lighten-2">mdi-trending-up</v-icon>
                  <span>Aumenta peso, metti più di {{ getGhostLift(sett).label }} (Proposto: <span class="text-green-accent-3 font-weight-black">{{ getGhostLift(sett).pesoProposto }}kg</span>) - Pesi di {{ getGhostLift(sett).label }}:</span>
                  <span class="text-white font-weight-black ml-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.72rem' : '0.85rem' }">
                    {{ getGhostLift(sett).text }}
                  </span>
                </span>
                <span v-else class="text-super-caption text-muted font-weight-bold uppercase d-flex align-center gap-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '0.6rem', letterSpacing: '0.05em' }">
                  <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : 12" :color="getGhostLift(sett).isScarico ? 'amber-lighten-2' : 'grey'">
                    {{ getGhostLift(sett).isScarico ? 'mdi-battery-charging-40' : 'mdi-ghost-outline' }}
                  </v-icon>
                  <span :class="{'text-amber-lighten-2': getGhostLift(sett).isScarico}">
                    {{ getGhostLift(sett).isScarico ? 'Target Scarico (W2)' : 'Pesi di ' + getGhostLift(sett).label }}:
                  </span>
                  <span class="font-weight-black ml-1" :class="getGhostLift(sett).isScarico ? 'text-white' : 'text-slate-light'" :style="getGhostLift(sett).isScarico ? (layoutCorrente === 'super_compatto' ? 'font-size: 0.7rem; letter-spacing: 0;' : 'font-size: 0.8rem; letter-spacing: 0;') : (layoutCorrente === 'super_compatto' ? 'font-size: 0.72rem;' : '')">
                    {{ getGhostLift(sett).text }}
                    <span v-if="getGhostLift(sett).isWeek1 && getGhostLift(sett).reps" class="text-muted ml-0.5" style="text-transform: lowercase; font-size: 0.6rem;">(x{{ getGhostLift(sett).reps }})</span>
                  </span>
                </span>
                <div class="d-flex align-center gap-1">
                  <v-icon v-if="getGhostStatus(sett) === 'up'" color="green-accent-3" :size="layoutCorrente === 'super_compatto' ? 12 : 14" class="animate-pulse">mdi-fire</v-icon>
                  <v-icon v-else-if="getGhostStatus(sett) === 'down'" color="blue-lighten-2" :size="layoutCorrente === 'super_compatto' ? 12 : 14">mdi-trending-down</v-icon>
                  <v-btn
                    icon
                    variant="text"
                    color="orange-lighten-2"
                    :size="layoutCorrente === 'super_compatto' ? '18px' : '22px'"
                    class="ml-1"
                    @click.stop="apriAiutoCaricoDettagliato(sett)"
                    title="Aiuto carico da storico"
                  >
                    <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 15">mdi-help-circle-outline</v-icon>
                  </v-btn>
                </div>
              </div>
              
              <div v-if="getGhostLift(sett) && getGhostLift(sett).isScarico" class="text-super-caption font-weight-medium" :class="layoutCorrente === 'super_compatto' ? 'mt-0.5' : 'mt-1'" style="color: #fbbf24;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.5rem' : '0.55rem', lineSpace: 1.2, letterSpacing: '0.02em' }">
                💡 Se leggero, fai più reps del previsto e segnalalo nel box qui sotto.
              </div>
            </div>
            
            <v-textarea
              v-model="inputSettimane[sett].ins"
              label="Carico o note (es. 45kg)"
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
          </div>

          <!-- Campi Aggiuntivi per Week 6 (Miglior Carico e Sforzo Percepito) -->
          <div v-if="sett === 6 && (!workout.flg_perc || !String(workout.flg_perc).includes('V%'))" :class="[layoutCorrente === 'super_compatto' ? 'mt-2 pt-2' : 'mt-4 pt-4', 'border-top-soft']">
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
        </v-card>

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
        style="background: rgba(15, 23, 42, 0.4);"
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
              <p class="text-super-caption text-muted mt-2 leading-snug" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : (layoutCorrente === 'compatto' ? '0.63rem' : '0.68rem') }">
                * <strong>Dinamica</strong>: Mette in evidenza la settimana attiva ordinando le altre in sequenza.<br>
                * <strong>Fissa</strong>: Mostra la progressione lineare classica dalla settimana 1 alla 6.
              </p>

              <!-- Parametri di proposta carichi -->
              <v-divider class="my-2 border-soft"></v-divider>

              <span class="text-super-caption text-muted font-weight-bold uppercase mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.50rem' : (layoutCorrente === 'compatto' ? '0.55rem' : '0.6rem') }">
                Parametri Proposta Carichi:
              </span>
              
              <!-- Proposta Base Week 2 -->
              <div class="mb-2">
                <span class="text-caption text-slate-dark d-block mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.68rem' : '0.74rem' }">Settimana di riferimento per Proposta W2:</span>
                <v-btn-toggle
                  v-model="propostaBaseWeek2"
                  mandatory
                  selected-class="bg-orange-darken-3 text-white"
                  :density="layoutCorrente === 'super_compatto' ? 'compact' : 'comfortable'"
                  :rounded="layoutCorrente === 'super_compatto' ? 'sm' : 'lg'"
                  class="w-100 card-glass border"
                  :style="{ height: layoutCorrente === 'super_compatto' ? '28px' : '34px' }"
                >
                  <v-btn value="W1" class="font-weight-bold flex-grow-1" style="min-width: 50%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W1</v-btn>
                  <v-btn value="W6 Prec." class="font-weight-bold flex-grow-1" style="min-width: 50%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W6 Prec.</v-btn>
                </v-btn-toggle>
              </div>

              <!-- Proposta Base Week 5 -->
              <div class="mb-2">
                <span class="text-caption text-slate-dark d-block mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.68rem' : '0.74rem' }">Settimana di riferimento per Proposta W5:</span>
                <v-btn-toggle
                  v-model="propostaBaseWeek5"
                  mandatory
                  selected-class="bg-orange-darken-3 text-white"
                  :density="layoutCorrente === 'super_compatto' ? 'compact' : 'comfortable'"
                  :rounded="layoutCorrente === 'super_compatto' ? 'sm' : 'lg'"
                  class="w-100 card-glass border"
                  :style="{ height: layoutCorrente === 'super_compatto' ? '28px' : '34px' }"
                >
                  <v-btn value="W1" class="font-weight-bold flex-grow-1" style="min-width: 25%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W1</v-btn>
                  <v-btn value="W2" class="font-weight-bold flex-grow-1" style="min-width: 25%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W2</v-btn>
                  <v-btn value="W3" class="font-weight-bold flex-grow-1" style="min-width: 25%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W3</v-btn>
                  <v-btn value="W4" class="font-weight-bold flex-grow-1" style="min-width: 25%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W4</v-btn>
                </v-btn-toggle>
              </div>

              <!-- Proposta Base Week 6 -->
              <div class="mb-2">
                <span class="text-caption text-slate-dark d-block mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.68rem' : '0.74rem' }">Settimana di riferimento per Proposta W6:</span>
                <v-btn-toggle
                  v-model="propostaBaseWeek6"
                  mandatory
                  selected-class="bg-orange-darken-3 text-white"
                  :density="layoutCorrente === 'super_compatto' ? 'compact' : 'comfortable'"
                  :rounded="layoutCorrente === 'super_compatto' ? 'sm' : 'lg'"
                  class="w-100 card-glass border"
                  :style="{ height: layoutCorrente === 'super_compatto' ? '28px' : '34px' }"
                >
                  <v-btn value="W1" class="font-weight-bold flex-grow-1" style="min-width: 20%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W1</v-btn>
                  <v-btn value="W2" class="font-weight-bold flex-grow-1" style="min-width: 20%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W2</v-btn>
                  <v-btn value="W3" class="font-weight-bold flex-grow-1" style="min-width: 20%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W3</v-btn>
                  <v-btn value="W4" class="font-weight-bold flex-grow-1" style="min-width: 20%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W4</v-btn>
                  <v-btn value="W5" class="font-weight-bold flex-grow-1" style="min-width: 20%;" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : '0.72rem' }">W5</v-btn>
                </v-btn-toggle>
              </div>

              <!-- Altri parametri in Grid -->
              <v-row dense class="mt-1">
                <!-- Incremento Peso Post Scarico % -->
                <v-col cols="6">
                  <div class="d-flex flex-column gap-1">
                    <span class="text-super-caption text-muted font-weight-bold uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.48rem' : '0.55rem' }">Inc. Post Scarico (%):</span>
                    <div class="d-flex align-center justify-space-between card-glass border" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm px-0.5' : 'rounded-lg px-1'" :style="{ height: layoutCorrente === 'super_compatto' ? '28px' : '34px', background: 'rgba(30, 41, 59, 0.4) !important', borderColor: 'rgba(255, 255, 255, 0.08) !important' }">
                      <v-btn icon :size="layoutCorrente === 'super_compatto' ? '18px' : 'x-small'" variant="text" color="orange-lighten-2" @click="INCREMENTO_PESO_POST_SCARICO_PCT = Math.max(0, INCREMENTO_PESO_POST_SCARICO_PCT - 0.5)">
                        <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : 14">mdi-minus</v-icon>
                      </v-btn>
                      <span class="font-weight-bold text-white" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : '0.75rem' }">{{ INCREMENTO_PESO_POST_SCARICO_PCT }}%</span>
                      <v-btn icon :size="layoutCorrente === 'super_compatto' ? '18px' : 'x-small'" variant="text" color="orange-lighten-2" @click="INCREMENTO_PESO_POST_SCARICO_PCT = INCREMENTO_PESO_POST_SCARICO_PCT + 0.5">
                        <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : 14">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-col>
                
                <!-- Soglia Forza Manubri -->
                <v-col cols="6">
                  <div class="d-flex flex-column gap-1">
                    <span class="text-super-caption text-muted font-weight-bold uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.48rem' : '0.55rem' }">Soglia Manubri Forte:</span>
                    <div class="d-flex align-center justify-space-between card-glass border" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm px-0.5' : 'rounded-lg px-1'" :style="{ height: layoutCorrente === 'super_compatto' ? '28px' : '34px', background: 'rgba(30, 41, 59, 0.4) !important', borderColor: 'rgba(255, 255, 255, 0.08) !important' }">
                      <v-btn icon :size="layoutCorrente === 'super_compatto' ? '18px' : 'x-small'" variant="text" color="orange-lighten-2" @click="SOGLIA_FORZA_MANUBRI = Math.max(0, SOGLIA_FORZA_MANUBRI - 2)">
                        <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : 14">mdi-minus</v-icon>
                      </v-btn>
                      <span class="font-weight-bold text-white" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : '0.75rem' }">{{ SOGLIA_FORZA_MANUBRI }}kg</span>
                      <v-btn icon :size="layoutCorrente === 'super_compatto' ? '18px' : 'x-small'" variant="text" color="orange-lighten-2" @click="SOGLIA_FORZA_MANUBRI = SOGLIA_FORZA_MANUBRI + 2">
                        <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : 14">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-col>

                <!-- Incremento Manubri Leggero -->
                <v-col cols="6" class="mt-2">
                  <div class="d-flex flex-column gap-1">
                    <span class="text-super-caption text-muted font-weight-bold uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.48rem' : '0.55rem' }">Inc. Manubri Leggero:</span>
                    <div class="d-flex align-center justify-space-between card-glass border" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm px-0.5' : 'rounded-lg px-1'" :style="{ height: layoutCorrente === 'super_compatto' ? '28px' : '34px', background: 'rgba(30, 41, 59, 0.4) !important', borderColor: 'rgba(255, 255, 255, 0.08) !important' }">
                      <v-btn icon :size="layoutCorrente === 'super_compatto' ? '18px' : 'x-small'" variant="text" color="orange-lighten-2" @click="INCREMENTO_MANUBRI_LEGGERO = Math.max(0, INCREMENTO_MANUBRI_LEGGERO - 0.5)">
                        <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : 14">mdi-minus</v-icon>
                      </v-btn>
                      <span class="font-weight-bold text-white" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : '0.75rem' }">+{{ INCREMENTO_MANUBRI_LEGGERO }}kg</span>
                      <v-btn icon :size="layoutCorrente === 'super_compatto' ? '18px' : 'x-small'" variant="text" color="orange-lighten-2" @click="INCREMENTO_MANUBRI_LEGGERO = INCREMENTO_MANUBRI_LEGGERO + 0.5">
                        <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : 14">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-col>

                <!-- Incremento Manubri Forte -->
                <v-col cols="6" class="mt-2">
                  <div class="d-flex flex-column gap-1">
                    <span class="text-super-caption text-muted font-weight-bold uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.48rem' : '0.55rem' }">Inc. Manubri Forte:</span>
                    <div class="d-flex align-center justify-space-between card-glass border" :class="layoutCorrente === 'super_compatto' ? 'rounded-sm px-0.5' : 'rounded-lg px-1'" :style="{ height: layoutCorrente === 'super_compatto' ? '28px' : '34px', background: 'rgba(30, 41, 59, 0.4) !important', borderColor: 'rgba(255, 255, 255, 0.08) !important' }">
                      <v-btn icon :size="layoutCorrente === 'super_compatto' ? '18px' : 'x-small'" variant="text" color="orange-lighten-2" @click="INCREMENTO_MANUBRI_FORTE = Math.max(0, INCREMENTO_MANUBRI_FORTE - 0.5)">
                        <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : 14">mdi-minus</v-icon>
                      </v-btn>
                      <span class="font-weight-bold text-white" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : '0.75rem' }">+{{ INCREMENTO_MANUBRI_FORTE }}kg</span>
                      <v-btn icon :size="layoutCorrente === 'super_compatto' ? '18px' : 'x-small'" variant="text" color="orange-lighten-2" @click="INCREMENTO_MANUBRI_FORTE = INCREMENTO_MANUBRI_FORTE + 0.5">
                        <v-icon :size="layoutCorrente === 'super_compatto' ? 10 : 14">mdi-plus</v-icon>
                      </v-btn>
                    </div>
                  </div>
                </v-col>
              </v-row>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>

      <!-- 5. Dettagli Tecnici Esercizio (Stile Grid ultra-compatto per evitare dispersioni) -->
      <div class="d-flex align-center justify-space-between text-left" :class="layoutCorrente === 'super_compatto' ? 'mb-2' : 'mb-4'">
        <h3 
          class="font-weight-black text-slate-dark d-flex align-center"
          :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.65rem' : (layoutCorrente === 'compatto' ? '0.72rem' : '0.80rem') }"
        >
          <v-icon color="orange-darken-3" class="mr-2" :size="layoutCorrente === 'super_compatto' ? 12 : (layoutCorrente === 'compatto' ? 14 : 16)">mdi-cogs</v-icon>
          Dettagli Tecnici Esercizio
        </h3>
      </div>

      <!-- Griglia compattata dei Dettagli statici (2x2) -->
      <v-row dense :class="layoutCorrente === 'super_compatto' ? 'mb-2.5' : 'mb-4'">
        <!-- Scheda -->
        <v-col cols="6">
          <div 
            class="border border-orange-darken-3-op card-glass text-center fill-height d-flex flex-column justify-center position-relative overflow-hidden" 
            :class="[
              layoutCorrente === 'super_compatto' ? 'pa-1.5 rounded-sm' : (layoutCorrente === 'compatto' ? 'pa-2 rounded-lg' : 'pa-2.5 rounded-xl')
            ]"
            style="background: rgba(15, 23, 42, 0.4); border-color: rgba(249, 115, 22, 0.15) !important;"
          >
            <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : (layoutCorrente === 'compatto' ? '0.50rem' : '0.55rem'), letterSpacing: '0.02em' }">Scheda</span>
            <span 
              class="font-weight-black text-orange-lighten-2 text-truncate d-block"
              :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : (layoutCorrente === 'compatto' ? '0.70rem' : '0.78rem') }"
            >
              Numero {{ workout.num_scheda }}
            </span>
          </div>
        </v-col>
        <!-- Giorno -->
        <v-col cols="6">
          <div 
            class="border border-orange-darken-3-op card-glass text-center fill-height d-flex flex-column justify-center position-relative overflow-hidden" 
            :class="[
              layoutCorrente === 'super_compatto' ? 'pa-1.5 rounded-sm' : (layoutCorrente === 'compatto' ? 'pa-2 rounded-lg' : 'pa-2.5 rounded-xl')
            ]"
            style="background: rgba(15, 23, 42, 0.4); border-color: rgba(249, 115, 22, 0.15) !important;"
          >
            <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : (layoutCorrente === 'compatto' ? '0.50rem' : '0.55rem'), letterSpacing: '0.02em' }">Giorno</span>
            <span 
              class="font-weight-black text-orange-lighten-1 text-truncate d-block"
              :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : (layoutCorrente === 'compatto' ? '0.70rem' : '0.78rem') }"
            >
              Giorno {{ workout.des_giorno }}
            </span>
          </div>
        </v-col>
        <!-- Muscolo Target -->
        <v-col cols="6">
          <div 
            class="border border-orange-darken-3-op card-glass text-center fill-height d-flex flex-column justify-center position-relative overflow-hidden" 
            :class="[
              layoutCorrente === 'super_compatto' ? 'pa-1.5 rounded-sm' : (layoutCorrente === 'compatto' ? 'pa-2 rounded-lg' : 'pa-2.5 rounded-xl')
            ]"
            style="background: rgba(15, 23, 42, 0.4); border-color: rgba(249, 115, 22, 0.15) !important;"
          >
            <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : (layoutCorrente === 'compatto' ? '0.50rem' : '0.55rem'), letterSpacing: '0.02em' }">Muscolo Target</span>
            <span 
              class="font-weight-black text-slate-dark text-truncate d-block"
              :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : (layoutCorrente === 'compatto' ? '0.70rem' : '0.78rem') }"
            >
              {{ workout.des_settore || 'Generico' }}
            </span>
          </div>
        </v-col>
        <!-- Posizione / Superserie -->
        <v-col cols="6">
          <div 
            class="border border-orange-darken-3-op card-glass text-center fill-height d-flex flex-column justify-center position-relative overflow-hidden" 
            :class="[
              layoutCorrente === 'super_compatto' ? 'pa-1.5 rounded-sm' : (layoutCorrente === 'compatto' ? 'pa-2 rounded-lg' : 'pa-2.5 rounded-xl')
            ]"
            style="background: rgba(15, 23, 42, 0.4); border-color: rgba(249, 115, 22, 0.15) !important;"
          >
            <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.45rem' : (layoutCorrente === 'compatto' ? '0.50rem' : '0.55rem'), letterSpacing: '0.02em' }">Posizione</span>
            <span 
              class="font-weight-black text-slate-dark text-truncate d-block"
              :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.62rem' : (layoutCorrente === 'compatto' ? '0.70rem' : '0.78rem') }"
            >
              N. {{ workout.num_riga_giorno }}{{ workout.alf_superserie ? ' (' + workout.alf_superserie + ')' : '' }}
            </span>
          </div>
        </v-col>
      </v-row>

      <!-- Card Note e Commenti (Campi Modificabili) -->
      <v-card 
        :class="[
          layoutCorrente === 'super_compatto' ? 'pa-2.5 rounded-sm mb-3' : (layoutCorrente === 'compatto' ? 'pa-3 rounded-lg mb-4.5' : 'pa-4 rounded-2xl mb-6'),
          'premium-card'
        ]" 
        elevation="2"
      >
        <div class="text-left d-flex flex-column" :class="layoutCorrente === 'super_compatto' ? 'gap-2.5' : 'gap-4'">
          <!-- Note Attrezzo -->
          <div>
            <div class="d-flex align-center justify-space-between mb-1">
              <span class="text-caption text-muted font-weight-bold uppercase" :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.58rem' : '0.65rem', letterSpacing: '0.05em' }">Note attrezzo:</span>
              <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="orange-darken-3">mdi-wrench-outline</v-icon>
            </div>
            <v-textarea
              v-model="noteAttrezzo"
              variant="outlined"
              density="compact"
              hide-details
              :rounded="layoutCorrente === 'super_compatto' ? 'sm' : (layoutCorrente === 'compatto' ? 'md' : 'lg')"
              rows="1"
              auto-grow
              color="orange-darken-3"
              class="custom-textarea-input"
              :class="layoutCorrente === 'super_compatto' ? 'custom-compact-textarea' : ''"
              @blur="salvaDatoGenerale('des_note_attrezzo', noteAttrezzo)"
              id="input-detail-note-attrezzo"
            ></v-textarea>
          </div>

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
            Eseguito l'ultima volta <strong class="text-orange-lighten-2">{{ tempoTrascorso(previousWorkout.dat_scheda_ult_ex || previousWorkout.timestamp) }}</strong> (il <span class="text-white">{{ formattaDataStorico(previousWorkout.dat_scheda_ult_ex || previousWorkout.timestamp) }}</span>) su Wo <span class="text-white font-weight-black">{{ previousWorkout.num_scheda }} {{ previousWorkout.des_giorno }}{{ previousWorkout.num_riga_giorno }}</span>.<br>
          </template>
          
          Prosegue il ciclo con <strong :class="'text-' + analisiRipetizioniCiclo.color">{{ analisiRipetizioniCiclo.testo }}</strong>
          <v-icon :color="analisiRipetizioniCiclo.color" :size="layoutCorrente === 'super_compatto' ? 15 : 18" class="ml-1 mb-1">{{ analisiRipetizioniCiclo.icon }}</v-icon>
        </div>
        
        <div 
          class="text-super-caption text-muted mt-3 pt-2 border-top-soft d-flex align-center"
          :style="{ fontSize: layoutCorrente === 'super_compatto' ? '0.52rem' : '' }"
        >
          <v-icon :size="layoutCorrente === 'super_compatto' ? 12 : 14" color="grey" class="mr-1">mdi-gesture-tap</v-icon>
          <span v-if="analisiRipetizioniCiclo.isContinuitato">Ultima esecuzione il {{ formattaDataStorico(previousWorkout.dat_scheda_ult_ex || previousWorkout.timestamp) }} - Clicca per i dettagli</span>
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
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: rgba(15, 23, 42, 0.95) !important;">
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
                      ({{ pulisciParentesiQuadre(previousWorkout['des_week' + w]) || 'N.D.' }})
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
                <div v-if="w === 6 && (!previousWorkout.flg_perc || !String(previousWorkout.flg_perc).includes('V%'))" class="mt-3 pt-3 border-top-soft">
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

    <!-- Dialog 2: Conferma Eliminazione (ELIMINA) -->
    <v-dialog v-model="dialogElimina" max-width="400">
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: rgba(15, 23, 42, 0.95) !important;">
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
    <v-dialog v-model="dialogStorico" :max-width="stileStorico === 'tabella' ? 1200 : 650" scrollable>
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: rgba(15, 23, 42, 0.95) !important;">
<v-card-title class="pa-0 border-bottom bg-slate-900">
          <!-- Rigo 1: Titolo e Chiudi -->
          <div class="px-3 py-2 d-flex align-center justify-space-between" style="min-height: 40px;">
            <div class="d-flex align-center gap-2 text-truncate" style="max-width: 85%;">
              <v-icon color="orange-darken-3" size="18">mdi-history</v-icon>
              <span class="font-weight-black text-white text-truncate" style="font-size: 0.82rem; letter-spacing: 0.02em;">
                Storico: {{ workout?.des_esercizio || 'Esercizio' }}
              </span>
            </div>
            <!-- Pulsante X più piccolo -->
            <v-btn icon variant="text" width="24" height="24" color="grey" @click="dialogStorico = false">
              <v-icon size="18">mdi-close</v-icon>
            </v-btn>
          </div>
          
<!-- Rigo 2: Target Mesociclo Attuale (Fisso e compatto) -->
          <div class="px-3 pb-2 d-flex align-center gap-1 overflow-x-auto scrollbar-hidden">
            <span class="text-super-caption text-muted font-weight-black uppercase mr-1" style="font-size: 0.5rem; white-space: nowrap;">Reps:</span>
            <div v-for="w in [1,2,3,4,5,6]" :key="w" 
              class="px-1.5 py-0.5 rounded border d-flex flex-column align-center"
              :style="{ 
                backgroundColor: w === settimanaAttiva ? 'rgba(249, 115, 22, 0.15)' : 'rgba(255,255,255,0.03)',
                borderColor: w === settimanaAttiva ? '#f97316' : 'rgba(255,255,255,0.1)',
                minWidth: '48px'
              }"
            >
              <span style="font-size: 0.45rem; color: #94a3b8;" class="font-weight-bold">W{{w}}</span>
              <span style="font-size: 0.6rem; color: #fb923c;" class="font-weight-black">
                {{ parsedPrescription(workout?.['des_week' + w])?.reps || workout?.['des_week' + w] || '-' }}
              </span>
            </div>
          </div>

          <!-- Rigo 3: Suggerimento Peso (Colorato e Intuitivo) -->
          <div v-if="suggerimentoRecord" class="px-3 py-1.5 bg-black d-flex align-center gap-2 border-top flex-wrap" style="border-color: rgba(249, 115, 22, 0.2) !important;">
            <!-- Goal -->
            <div v-if="suggerimentoRecord.record > 0 || suggerimentoRecord.isScarico" class="d-flex align-center mr-3">
              <v-icon color="orange-lighten-2" size="14" class="mr-1">mdi-target</v-icon>
              <span class="text-super-caption font-weight-black text-orange-lighten-2" style="font-size: 0.65rem !important;">
                <template v-if="suggerimentoRecord.isScarico">SCARICO:</template>
                <template v-else>GOAL W{{settimanaAttiva}}:</template>
              </span>
              <span class="text-white font-weight-black ml-1" style="font-size: 0.72rem;">
                <template v-if="suggerimentoRecord.isScarico">{{ suggerimentoRecord.pesoWeek2 || '??' }} kg <span class="text-muted font-weight-medium" style="font-size:0.55rem;">(da W2)</span></template>
                <template v-else>{{ suggerimentoRecord.target }} kg</template>
              </span>
            </div>
            
            <!-- Record Week Corrente -->
            <div v-if="suggerimentoRecord.record > 0" class="d-flex align-center mr-3" :class="{'pl-2 border-left-soft': suggerimentoRecord.record > 0 || suggerimentoRecord.isScarico}">
              <v-icon color="amber-lighten-1" size="12" class="mr-1 pb-0.5">mdi-trophy</v-icon>
              <span class="text-amber-lighten-1 font-weight-black uppercase" style="font-size: 0.58rem; letter-spacing: 0.02em;">
                Pesi di W{{settimanaAttiva}}: <span class="text-white ml-0.5">{{ suggerimentoRecord.record }} kg</span>
              </span>
            </div>

            <!-- Record Assoluto (Altre Weeks con stesse Reps o Tutte le Reps) -->
            <div v-if="suggerimentoRecord.recordAbsolute > 0" class="d-flex align-center" :class="{'pl-2 border-left-soft': suggerimentoRecord.record > 0 || suggerimentoRecord.isScarico}">
              <v-icon color="cyan-lighten-2" size="12" class="mr-1 pb-0.5">mdi-fire</v-icon>
              <span class="text-cyan-lighten-2 font-weight-black uppercase" style="font-size: 0.58rem; letter-spacing: 0.02em;">
                Max Assoluto: 
                <span class="text-white ml-0.5">
                  {{ suggerimentoRecord.recordAbsolute }} kg
                  <span class="text-muted lowercase font-weight-bold" style="font-size: 0.55rem;">
                    <template v-if="soloCorrispondenti">
                      (in W{{ suggerimentoRecord.recordAbsoluteWeek }})
                    </template>
                    <template v-else>
                      (in W{{ suggerimentoRecord.recordAbsoluteWeek }}, 
                      <template v-if="suggerimentoRecord.recordAbsoluteReps !== null">{{ suggerimentoRecord.recordAbsoluteReps }} reps, </template>
                      Sch {{ suggerimentoRecord.recordAbsoluteSheet }}
                      <template v-if="suggerimentoRecord.recordAbsoluteDay"> {{ suggerimentoRecord.recordAbsoluteDay }}</template>, 
                      {{ tempoTrascorso(suggerimentoRecord.recordAbsoluteDate) || formattaDataStorico(suggerimentoRecord.recordAbsoluteDate) || 'N.D.' }})
                    </template>
                  </span>
                </span>
              </span>
            </div>
          </div>
<!-- Rigo 4: Controlli Visualizzazione (Fissi a schermo) -->
          <div class="px-3 py-2 bg-slate-900 d-flex align-center justify-space-between border-top" style="border-color: rgba(255,255,255,0.05) !important;">
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
              Solo Stessi Reps ({{ targetRepsRange ? targetRepsRange : 'N.D.' }})
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
              <v-btn value="tabella" class="px-2" style="min-width: 45px; height: 28px;" title="Vista a Tabella">
                <v-icon size="18">mdi-table</v-icon>
              </v-btn>
              <!-- TIMELINE SECONDO -->
              <v-btn value="timeline" class="px-2" style="min-width: 45px; height: 28px;" title="Vista a Lista">
                <v-icon size="18">mdi-view-sequential</v-icon>
              </v-btn>
            </v-btn-toggle>
          </div>
        </v-card-title>
        
        <v-card-text ref="storicoScrollContainer" class="px-3 pt-2 pb-3 scrollbar-custom" style="max-height: 85vh;">

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
                    {{ formattaDataStorico(prevEx.dat_scheda_ult_ex || prevEx.timestamp) }} <span class="text-orange-lighten-2 ml-1">({{ tempoTrascorso(prevEx.dat_scheda_ult_ex || prevEx.timestamp) }})</span>
                  </span>
                </div>
              </div>

              <!-- Note statiche associate dell'attrezzo e giorno -->
              <div class="text-super-caption text-muted mb-1.5 italic" style="font-size: 0.62rem !important; line-height: 1.25;">
                <span v-if="prevEx.des_giorno" class="font-weight-black text-orange-lighten-2 mr-1">Giorno {{ prevEx.des_giorno }}</span>
                <span v-if="(prevEx.des_note_attrezzo || prevEx.des_note) && String(prevEx.des_note_attrezzo || prevEx.des_note).trim()">
                  • Note: {{ prevEx.des_note_attrezzo || prevEx.des_note }}
                </span>
              </div>

              <!-- Griglia dei carichi registrati nelle settimane con evidenziazione rossa condizionale -->
              <v-row dense class="mt-1 bg-slate-900 rounded-lg pa-1.5 mx-0 align-center text-center">
                <v-col v-for="w in [1, 2, 3, 4, 5, 6]" :key="w" cols="4" class="py-0.5">
                  <div 
                    class="border-soft rounded py-0.5 px-0.5" 
                    :class="{
                      'border-right': w !== 3 && w !== 6,
                      'timeline-red-cell': isMatchingReps(prevEx, w)
                    }"
                  >
                    <span class="text-super-caption text-muted font-weight-bold d-block uppercase" style="font-size: 0.48rem; line-height: 1;">W{{ w }}</span>
<!-- Prescrizione Timeline -->
<span 
  class="text-super-caption text-white font-weight-medium d-block text-truncate px-0.5 opacity-70" 
  style="font-size: 0.6rem; line-height: 1;"
>
  {{ prevEx['des_week' + w] ? (parsedPrescription(prevEx['des_week' + w])?.reps || prevEx['des_week' + w]) : 'N.D.' }}
</span>
<!-- Carico Timeline -->
<strong 
  class="font-weight-black d-block mt-1" 
  style="font-size: 0.95rem; line-height: 1;"
  :style="{ color: isMatchingReps(prevEx, w) ? '#f87171' : (prevEx['ins_week' + w] ? '#fb923c' : '#475569') }"
>
  {{ prevEx['ins_week' + w] || '-' }}
</strong>
                    <!-- Fatica se W6 -->
                    <span 
                      v-if="w === 6 && prevEx.num_faticaw6"
                      class="text-super-caption font-weight-bold d-block mt-0.5"
                      style="font-size: 0.50rem; line-height: 1;"
                      :style="getColoreFaticaStyle(prevEx.num_faticaw6)"
                    >
                      {{ prevEx.num_faticaw6 }}
                    </span>
                  </div>
                </v-col>
              </v-row>
            </div>
          </div>

          <!-- LAYOUT 2: TABELLA MATRICE (AppSheet Grid) -->
<div v-else-if="!caricandoStorico && storicoFiltrato.length > 0" ref="storicoTableContainer" class="table-responsive-wrapper rounded-xl border border-soft overflow-x-auto scrollbar-hidden">
  <table class="premium-storico-table" style="width: 1740px; table-layout: fixed; border-collapse: collapse;">
    <thead>
      <tr>
<th class="sticky-col header-cell text-left" style="width: 75px;">
  Scheda
</th>
        <th v-for="w in [1, 2, 3, 4, 5, 6]" :key="w" :id="'col-storico-w' + w" class="header-cell" style="width: 110px;" :class="{'bg-orange-darken-4': w === settimanaAttiva}">
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
                <tr 
                  v-for="prevEx in storicoFiltrato" 
                  :key="prevEx.id" 
                  class="table-row" 
                  style="cursor: pointer;" 
                  @click="vaiADettaglioStorico(prevEx.id)"
                >
                  <!-- Scheda (Sticky) -->
                  <td 
                    class="sticky-col body-cell text-left"
                    :class="{'red-scheda-cell': !soloCorrispondenti && haSettimanaCorrispondente(prevEx)}"
                  >
                    <div class="font-weight-black text-white" style="font-size: 0.75rem; line-height: 1.15;">S. {{ prevEx.num_scheda }}</div>
                    <div v-if="prevEx.dat_scheda_ult_ex || prevEx.timestamp" class="text-super-caption text-muted" style="font-size: 0.55rem; white-space: nowrap; line-height: 1.15; margin-top: 1px;">
                      {{ formattaDataStorico(prevEx.dat_scheda_ult_ex || prevEx.timestamp) }}
                    </div>
                    <div v-if="prevEx.dat_scheda_ult_ex || prevEx.timestamp" class="text-orange-lighten-2 font-weight-bold" style="font-size: 0.52rem; white-space: nowrap; line-height: 1.1; margin-top: 1px;">
                      {{ tempoTrascorso(prevEx.dat_scheda_ult_ex || prevEx.timestamp) }}
                    </div>
                  </td>
                  
                  <!-- Settimane W1 - W6 -->
                  <td 
  v-for="w in [1, 2, 3, 4, 5, 6]" 
  :key="w" 
  class="body-cell font-weight-bold text-center"
  :class="{'red-cell': isMatchingReps(prevEx, w)}"
  style="word-wrap: break-word;"
>
  <!-- Prescrizione: più discreta (Bianco/Slate) -->
  <div 
    v-if="prevEx['des_week' + w]" 
    class="text-super-caption text-white font-weight-medium" 
    style="font-size: 0.65rem; line-height: 1; opacity: 0.8;"
  >
    {{ parsedPrescription(prevEx['des_week' + w])?.reps || prevEx['des_week' + w] }}
  </div>
  
  <!-- Carico Loggato: Più grande e Colorato (Arancio/Verde) -->
  <div 
    class="font-weight-black mt-1" 
    style="font-size: 0.9rem; line-height: 1.1; letter-spacing: -0.02em;"
    :style="{ color: isMatchingReps(prevEx, w) ? '#ef4444' : (prevEx['ins_week' + w] ? '#fb923c' : '#475569') }"
  >
    {{ prevEx['ins_week' + w] || '-' }}
  </div>

                    <!-- Fatica se W6 -->
                    <div 
                      v-if="w === 6 && prevEx.num_faticaw6"
                      class="text-super-caption font-weight-bold mt-0.5"
                      style="font-size: 0.55rem; line-height: 1.1;"
                      :style="getColoreFaticaStyle(prevEx.num_faticaw6)"
                    >
                      {{ prevEx.num_faticaw6 }}
                    </div>
                  </td>
                  
                  <!-- Miglior W6 -->
<td 
  class="body-cell font-weight-black text-center" 
  style="font-size: 1rem; word-wrap: break-word; border-left: 1px solid rgba(255,255,255,0.1);"
  :style="prevEx.num_faticaw6 ? getColoreFaticaStyle(prevEx.num_faticaw6) : { color: '#ffca28' }"
>
                    {{ prevEx.num_ins6 ? prevEx.num_ins6 + ' kg' : '-' }}
                  </td>
                  
                  <!-- Peso Corporeo -->
                  <td class="body-cell text-center" style="font-size: 0.7rem; word-wrap: break-word;">
                    {{ prevEx.peso_corporeo || '-' }}
                  </td>
                  
                  <!-- Giorno -->
                  <td class="body-cell font-weight-medium text-center" style="font-size: 0.7rem; word-wrap: break-word;">
                    {{ prevEx.des_giorno || '-' }}
                  </td>
                  
                  <!-- Note -->
                  <td class="body-cell text-left note-cell" style="font-size: 0.68rem; word-wrap: break-word;" :title="prevEx.des_note || ''">
                    {{ prevEx.des_note || '-' }}
                  </td>

                  <!-- Note Attrezzo -->
                  <td class="body-cell text-left note-cell" style="font-size: 0.68rem; word-wrap: break-word;" :title="prevEx.des_note_attrezzo || ''">
                    {{ prevEx.des_note_attrezzo || '-' }}
                  </td>

                  <!-- Note Gen. Attrezzo -->
                  <td class="body-cell text-left note-cell" style="font-size: 0.68rem; word-wrap: break-word;" :title="prevEx.des_note_gen_attr || ''">
                    {{ prevEx.des_note_gen_attr || '-' }}
                  </td>
                </tr>
              </tbody>
            </table>
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
      <v-card class="card-glass-dark rounded-2xl border-soft overflow-hidden" style="backdrop-filter: blur(25px); background: rgba(15, 23, 42, 0.95) !important;">
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

    <!-- Dialog Aiuto Proposta Carico da Storico (reps) -->
    <v-dialog v-model="dialogAiutoCarico" max-width="500" scrollable>
      <v-card class="card-glass-dark rounded-2xl border border-soft overflow-hidden animate-fade-in" style="backdrop-filter: blur(25px); background: rgba(15, 23, 42, 0.96) !important; border-color: rgba(255, 255, 255, 0.08) !important;">
        <v-card-title class="px-3 py-2 border-bottom d-flex align-center justify-space-between bg-slate-900" style="min-height: 40px; border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;">
          <div class="d-flex align-center gap-2">
            <v-icon color="orange" size="18">mdi-calculator</v-icon>
            <span class="font-weight-black text-white" style="font-size: 0.82rem !important; letter-spacing: 0.02em;">Aiuto Proposta Carico - W{{ aiutoWeek }}</span>
          </div>
          <v-btn icon variant="text" width="24" height="24" color="grey" @click="dialogAiutoCarico = false">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </v-card-title>
        
        <v-card-text class="px-3 py-3 scrollbar-custom" style="max-height: 70vh;">
          <!-- Target Attuale -->
          <div class="mb-3 px-3 py-2 bg-slate-900 border rounded-lg text-left" style="border-color: rgba(249, 115, 22, 0.25) !important;">
            <div class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.55rem; letter-spacing: 0.05em;">Target Attuale W{{ aiutoWeek }}</div>
            <div class="text-subtitle-2 font-weight-black text-orange-lighten-2 mt-0.5">
              {{ targetRepsAttive }} Reps
              <span class="text-caption text-slate ml-1" style="font-weight-normal; font-size: 0.72rem;">(Prescrizione: {{ targetPrescrizioneAttiva }})</span>
            </div>
          </div>

          <!-- Caricamento -->
          <div v-if="caricandoAiutoCarico" class="text-center py-6">
            <v-progress-circular indeterminate color="orange" size="32" class="mb-2"></v-progress-circular>
            <p class="text-caption text-muted">Caricamento dello storico dell'esercizio...</p>
          </div>

          <!-- Nessun dato nello storico -->
          <div v-else-if="proposteStoricoCalcolate.length === 0" class="text-center py-6">
            <v-icon size="32" color="orange" class="mb-2">mdi-database-off-outline</v-icon>
            <p class="text-caption text-muted">Nessun dato nello storico per calcolare una proposta basata sulle reps.</p>
          </div>

          <!-- Lista Proposte Calcolate dallo Storico -->
          <div v-else class="d-flex flex-column gap-2.5 text-left">
            <p class="text-super-caption text-muted mb-1 px-1" style="font-size: 0.62rem; line-height: 1.35;">
              Il sistema stima il tuo massimale (1RM) dalle passate esecuzioni (formula di Epley) e calcola il carico ideale per il target attuale di <strong>{{ targetRepsAttive }} reps</strong>.
            </p>

            <div v-for="prop in proposteStoricoCalcolate" :key="prop.id + '_' + prop.week" class="border border-soft rounded-lg bg-slate-950 pa-2.5 d-flex align-center justify-space-between" style="border-color: rgba(255, 255, 255, 0.08) !important;">
              <div class="flex-grow-1 mr-2" style="min-width: 0;">
                <div class="d-flex align-center gap-1.5 flex-wrap">
                  <span class="text-super-caption font-weight-black text-orange-lighten-2 uppercase" style="font-size: 0.58rem; letter-spacing: 0.02em;">Scheda {{ prop.numScheda }}</span>
                  <span class="text-super-caption text-muted" style="font-size: 0.58rem;">• W{{ prop.week }} ({{ prop.data }})</span>
                  <v-chip v-if="prop.isSameWeek" color="orange-darken-3" size="x-small" density="compact" class="font-weight-black text-white" style="font-size: 0.52rem; height: 14px; padding: 0 4px;">STESSA SETT.</v-chip>
                  <v-chip v-else-if="prop.isSameReps" color="cyan-darken-3" size="x-small" density="compact" class="font-weight-black text-white" style="font-size: 0.52rem; height: 14px; padding: 0 4px;">STESSE REPS</v-chip>
                  <v-chip v-else-if="prop.isPeakWeek" color="purple-darken-3" size="x-small" density="compact" class="font-weight-black text-white" style="font-size: 0.52rem; height: 14px; padding: 0 4px;">PICCO W6</v-chip>
                </div>
                <!-- Performance originale -->
                <div class="text-caption font-weight-bold text-white mt-0.5" style="font-size: 0.75rem;">
                  Eseguito: <span class="text-slate-light font-weight-black">{{ prop.pesoOriginale }} kg</span> x <span class="text-slate-light font-weight-black">{{ prop.repsOriginali }} reps</span>
                </div>
                <!-- Dettaglio stima 1RM -->
                <div class="text-super-caption text-muted mt-0.5" style="font-size: 0.58rem;">
                  1RM Stimato: <strong class="text-slate-dark">{{ prop.massimaleStimato }} kg</strong>
                </div>
              </div>

              <!-- Proposta Calcolata e Bottone Applica -->
              <div class="text-right flex-shrink-0 d-flex flex-column align-end">
                <span class="text-super-caption text-muted uppercase font-weight-black" style="font-size: 0.52rem; letter-spacing: 0.05em;">Proposto</span>
                <div class="text-body-1 font-weight-black text-green-accent-3 mb-1">
                  {{ prop.pesoProposto }} <span class="text-super-caption text-muted">KG</span>
                </div>
                <v-btn
                  color="green-darken-3"
                  size="x-small"
                  class="font-weight-black text-white px-2 py-1 text-none"
                  rounded="sm"
                  style="font-size: 0.65rem; height: 22px;"
                  @click="applicaPropostaCaricoStorico(prop.pesoProposto)"
                >
                  Applica
                </v-btn>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount } from 'vue';
import { useRoute, useRouter, onBeforeRouteLeave, onBeforeRouteUpdate } from 'vue-router';
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase.js';
import { startGlobalTimer, ruolo, getStileStoricoAtleta, getModalitaSettimaneAtleta, selectedSheet, apriCalcolatoreDischi, layoutDettaglioGlobal, layoutEserciziGlobal, selectedAthlete, propostaBaseWeek2Global, propostaBaseWeek5Global, propostaBaseWeek6Global, incrementoPesoPostScaricoPctGlobal, sogliaForzaManubriGlobal, incrementoManubriLeggeroGlobal, incrementoManubriForteGlobal } from '../authStore.js';

const route = useRoute();
const router = useRouter();

// Parametri di progressione allenamento legati ai parametri globali
const propostaBaseWeek2 = propostaBaseWeek2Global;
const propostaBaseWeek5 = propostaBaseWeek5Global;
const propostaBaseWeek6 = propostaBaseWeek6Global;
const INCREMENTO_PESO_POST_SCARICO_PCT = incrementoPesoPostScaricoPctGlobal;
const SOGLIA_FORZA_MANUBRI = sogliaForzaManubriGlobal;
const INCREMENTO_MANUBRI_LEGGERO = incrementoManubriLeggeroGlobal;
const INCREMENTO_MANUBRI_FORTE = incrementoManubriForteGlobal;

const inizializzaParametriProposta = (atletaId) => {
  // Gestito a livello globale in authStore.js
};

// Help Dialog & Calcolo Carico Storico States
const dialogAiutoCarico = ref(false);
const caricandoAiutoCarico = ref(false);
const aiutoWeek = ref(1);
const storicoEsercizioPerAiuto = ref([]);

const targetRepsAttive = computed(() => {
  if (!workout.value) return 10;
  const reps = workout.value['reps_week' + aiutoWeek.value];
  if (reps) return parseInt(reps, 10);
  const presc = workout.value['des_week' + aiutoWeek.value];
  return estraiRepsDaPrescrizione(presc) || 10;
});

const targetPrescrizioneAttiva = computed(() => {
  if (!workout.value) return '';
  return workout.value['des_week' + aiutoWeek.value] || '';
});

const proposteStoricoCalcolate = computed(() => {
  if (!storicoEsercizioPerAiuto.value.length || !workout.value) return [];
  
  const targetReps = targetRepsAttive.value;
  const targetW = aiutoWeek.value;
  const list = [];
  
  storicoEsercizioPerAiuto.value.forEach(prevEx => {
    for (let w = 1; w <= 6; w++) {
      const insVal = prevEx['ins_week' + w];
      if (insVal && String(insVal).trim() !== '' && String(insVal).trim() !== '-') {
        const weightStr = estraiPesoDaInput(insVal);
        if (weightStr) {
          const weight = parseFloat(weightStr);
          if (!isNaN(weight) && weight > 0) {
            const repsVal = prevEx['reps_week' + w];
            const repsNum = repsVal ? parseInt(repsVal, 10) : estraiRepsDaPrescrizione(prevEx['des_week' + w]);
            if (repsNum && repsNum > 0) {
              const isSameWeek = w === targetW;
              const isPeakWeek = w === 6;
              const isSameReps = repsNum === targetReps;
              
              if (isSameWeek || isPeakWeek || isSameReps) {
                const estimated1RM = weight * (1 + repsNum / 30);
                const proposedWeight = estimated1RM / (1 + targetReps / 30);
                const roundedProposed = Math.round(proposedWeight * 2) / 2;
                
                list.push({
                  id: prevEx.id,
                  week: w,
                  numScheda: prevEx.num_scheda,
                  data: formattaDataStorico(prevEx.dat_scheda_ult_ex || prevEx.timestamp),
                  pesoOriginale: weight,
                  repsOriginali: repsNum,
                  massimaleStimato: Math.round(estimated1RM * 10) / 10,
                  pesoProposto: roundedProposed,
                  isSameWeek,
                  isPeakWeek,
                  isSameReps
                });
              }
            }
          }
        }
      }
    }
  });
  
  list.sort((a, b) => {
    const diffScheda = parseInt(b.numScheda) - parseInt(a.numScheda);
    if (diffScheda !== 0) return diffScheda;
    
    const scoreA = (a.isSameWeek ? 3 : 0) + (a.isSameReps ? 2 : 0) + (a.isPeakWeek ? 1 : 0);
    const scoreB = (b.isSameWeek ? 3 : 0) + (b.isSameReps ? 2 : 0) + (b.isPeakWeek ? 1 : 0);
    return scoreB - scoreA;
  });
  
  return list.slice(0, 5);
});

const apriAiutoCaricoDettagliato = async (sett) => {
  vibraTattile(10);
  aiutoWeek.value = sett;
  dialogAiutoCarico.value = true;
  caricandoAiutoCarico.value = true;
  storicoEsercizioPerAiuto.value = [];
  
  try {
    const { key: keyIdCliente, id: atletaId } = getAtletaInfo(workout.value);
    const desEsercizio = workout.value.des_esercizio;
    const currentNumScheda = parseInt(workout.value.num_scheda);
    
    if (atletaId && desEsercizio && !isNaN(currentNumScheda)) {
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
        const res = await fetch('/storyboard_backup.json');
        const allData = await res.json();
        const matched = allData.filter(b => {
          const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
          return String(bAtletaId) === String(atletaId) &&
                 String(b.des_esercizio).trim() === String(desEsercizio).trim() &&
                 parseInt(b.num_scheda) <= currentNumScheda &&
                 parseInt(b.num_riga_giorno) > 0;
        });
        matched.sort((a, b) => parseInt(a.num_scheda) - parseInt(b.num_scheda));
        storicoEsercizioPerAiuto.value = matched;
      } else {
        storicoEsercizioPerAiuto.value = list;
      }
    }
  } catch (err) {
    console.error("Errore caricamento storico per aiuto carico:", err);
  } finally {
    caricandoAiutoCarico.value = false;
  }
};

const applicaPropostaCaricoStorico = (peso) => {
  vibraTattile(12);
  const targetInput = inputSettimane.value[aiutoWeek.value];
  if (targetInput) {
    targetInput.ins = peso + 'kg';
    salvaDatoSettimanale(aiutoWeek.value, 'ins');
    dialogAiutoCarico.value = false;
    
    // Mostra snackbar di successo
    snackbarMessaggio.value = `Applicato carico ${peso}kg per W${aiutoWeek.value}!`;
    snackbarSalvataggio.value = true;
  }
};

// Dialogs and States
const dialogProgressioniPrecedente = ref(false);
const dialogElimina = ref(false);
const dialogStorico = ref(false);
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
  
  const repsBase = estraiRepsDaPrescrizione(workout.value['des_week' + baseWeekNum]) || 10;
  const repsTarget = estraiRepsDaPrescrizione(workout.value['des_week' + targetWeek]) || 10;
  
  // Estrai RIR della settimana base
  const rirBaseStr = estraiRIRDaPrescrizione(workout.value['des_week' + baseWeekNum]);
  const rirBase = rirBaseStr !== null ? rirBaseStr : getRIRDefault(baseWeekNum);
  
  // Estrai RIR della settimana target
  const rirTargetStr = estraiRIRDaPrescrizione(workout.value['des_week' + targetWeek]);
  const rirTarget = rirTargetStr !== null ? rirTargetStr : getRIRDefault(targetWeek);
  
  // Stima 1RM dalla settimana base (Epley)
  const estimated1RM = pesoBase * (1 + (repsBase + rirBase) / 30);
  
  // Calcola peso target rispettando il RIR target
  let proposedWeight = estimated1RM / (1 + (repsTarget + rirTarget) / 30);
  
  // Arrotondamento standard a 0.5kg
  proposedWeight = Math.round(proposedWeight * 2) / 2;
  
  return proposedWeight;
};

const calcolaPropostaCarico = (prevW6Weight, prevW6Reps, currW1Reps, fatica, giorniTrascorsi) => {
  if (!prevW6Weight) return null;
  const w6 = parseFloat(String(prevW6Weight).replace(',', '.'));
  if (isNaN(w6) || w6 <= 0) return null;
  
  const r6 = prevW6Reps ? parseInt(prevW6Reps, 10) : (currW1Reps ? parseInt(currW1Reps, 10) : 10);
  const r1 = currW1Reps ? parseInt(currW1Reps, 10) : (prevW6Reps ? parseInt(prevW6Reps, 10) : 10);
  
  // RIR di default per W6 (cedimento = 0) e W1 (default = 2 RIR per iniziare leggeri)
  const rirW6 = 0;
  const rirW1 = estraiRIRDaPrescrizione(workout.value?.des_week1) !== null ? estraiRIRDaPrescrizione(workout.value?.des_week1) : 2;
  
  // Stima 1RM tramite Epley comprensivo di RIR
  const estimated1RM = w6 * (1 + (r6 + rirW6) / 30);
  
  // Calcolo carico teorico per W1 rispettando RIR di W1
  let proposedWeight = estimated1RM / (1 + (r1 + rirW1) / 30);
  
  // Regolazione in base alla percezione della fatica
  const faticaLower = (fatica || '').toLowerCase().trim();
  let adjustment = 0.97; // Default: proposta prudenziale del -3% per iniziare leggeri
  if (faticaLower === 'leggera' || faticaLower === 'bassa') {
    adjustment = 0.99; // Molto leggero prima, quasi uguale (-1%)
  } else if (faticaLower === 'media') {
    adjustment = 0.97; // -3%
  } else if (faticaLower === 'pesante') {
    adjustment = 0.95; // -5%
  } else if (faticaLower === 'devastante') {
    adjustment = 0.92; // -8%
  }
  
  proposedWeight = proposedWeight * adjustment;

  // Riduzione prudenziale in base al tempo passato
  let dateFactor = 1.0;
  if (giorniTrascorsi > 180) {
    dateFactor = 0.90;
  } else if (giorniTrascorsi > 90) {
    dateFactor = 0.93;
  } else if (giorniTrascorsi > 60) {
    dateFactor = 0.96;
  } else if (giorniTrascorsi > 30) {
    dateFactor = 0.98;
  }
  proposedWeight = proposedWeight * dateFactor;
  
  // Arrotonda ai 0.5kg
  return Math.round(proposedWeight * 2) / 2;
};

const propostaWeek1 = computed(() => {
  if (!previousWorkout.value || !workout.value) return null;
  
  const prevW6Weight = previousWorkout.value.num_ins6;
  if (!prevW6Weight) return null;
  
  const prevW6Reps = parseInt(previousWorkout.value.reps_week6) || estraiRepsDaPrescrizione(previousWorkout.value.des_week6);
  const currW1Reps = parseInt(workout.value.reps_week1) || estraiRepsDaPrescrizione(workout.value.des_week1);
  const fatica = previousWorkout.value.num_faticaw6;
  
  // Calcolo giorni trascorsi
  const dataUltimaEx = previousWorkout.value.dat_scheda_ult_ex || previousWorkout.value.timestamp;
  const giorniTrascorsi = calcolaGiorniTrascorsi(dataUltimaEx);
  
  const proposta = calcolaPropostaCarico(prevW6Weight, prevW6Reps, currW1Reps, fatica, giorniTrascorsi);
  if (proposta === null) return null;

  return {
    peso: proposta,
    prevPeso: prevW6Weight,
    prevReps: prevW6Reps || 'N/D',
    currReps: currW1Reps || 'N/D',
    fatica: fatica || 'Non specificata',
    giorniTrascorsi
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

const formattaDataStorico = (dateStr) => {
  if (!dateStr) return '';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
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
    const past = new Date(dateStr);
    if (isNaN(past.getTime())) return '';
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
    
    const diffMonths = Math.floor(diffDays / 30.43);
    if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'mese' : 'mesi'} fa`;
    
    const diffYears = Math.floor(diffDays / 365.25);
    return `${diffYears} ${diffYears === 1 ? 'anno' : 'anni'} fa`;
  } catch (e) {
    return '';
  }
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
  if (listaIdEsercizi.value.length <= 1 || indexCorrente.value === -1) return;
  
  // Se sono sul giorno (index 0) e faccio swipe a destra, vado al primo esercizio (index 1)
  if (indexCorrente.value === 0) {
    transitionName.value = 'swipe-next';
    const firstEx = tuttiEserciziGiorno.value[1];
    if (firstEx) {
      vibraTattile(15);
      router.replace({ name: 'DettaglioWorkout', params: { id: firstEx.id } });
    }
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
  // CACHE REATTIVA PER SWIPE
  const cachedEx = tuttiEserciziGiorno.value.find(ex => String(ex.id) === String(routeIdLocal.value));
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
    indexCorrente.value = tuttiEserciziGiorno.value.findIndex(item => String(item.id) === String(routeIdLocal.value));
    caricamento.value = false;
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
      inizializzaParametriProposta(atletaId);

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
        determinaSettimanaAttivaGiorno();
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
      if (route.query.targetWeek) {
        settimanaAttiva.value = parseInt(route.query.targetWeek);
      } else {
        settimanaAttiva.value = parseInt(localStorage.getItem('settimanaAttiva_' + atletaId)) || 2;
      }

      // Recupera stileStorico e modalitaSettimane per l'atleta specifico
      stileStorico.value = localStorage.getItem('stileStorico_' + atletaId) || getStileStoricoAtleta(atletaId);
      modalitaSettimane.value = localStorage.getItem('modalitaSettimane_' + atletaId) || getModalitaSettimaneAtleta(atletaId);
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

const getGhostLift = (sett) => {
  if (!workout.value) return null;

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

  // Rileva se ci sono parentesi quadre in una qualsiasi delle settimane
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

    // Per la Week 1, peschiamo l'ultimo log della W6 del mesociclo precedente
    if (sett === 1) {
      if (!previousWorkout.value) return null;
      const prevW6Text = inputSettimanePrecedente.value[6]?.ins || previousWorkout.value.ins_week6 || previousWorkout.value.num_ins6;
      if (!prevW6Text) return null;
      const pesoStr = estraiPesoDaInput(String(prevW6Text));
      const pesoNum = pesoStr ? parseFloat(pesoStr) : parseFloat(String(prevW6Text).replace(',', '.'));
      if (isNaN(pesoNum)) return null;
      
      const p = propostaWeek1.value;
      const repsPrecedenti = p ? p.prevReps : (previousWorkout.value.reps_week6 || estraiRepsDaPrescrizione(previousWorkout.value.des_week6) || '');
      const giorniTrascorsi = p ? p.giorniTrascorsi : calcolaGiorniTrascorsi(previousWorkout.value.dat_scheda_ult_ex || previousWorkout.value.timestamp);

      return { 
        text: prevW6Text, 
        peso: pesoNum, 
        label: 'W6 Prec.',
        isWeek1: true,
        reps: repsPrecedenti,
        suggerito: p ? p.peso : null,
        giorni: giorniTrascorsi,
        proposta: p,
        schedaPrec: previousWorkout.value.num_scheda
      };
    }

    // Fallback: Proponiamo l'ultima settimana loggata trovata
    if (prevIns) {
      return { text: prevIns, peso: prevPeso, label: `W${lastLoggedWeek}` };
    }

    return null;
  } else {
    // CASO 3: Caso normale (senza parentesi quadre)
    // Per la Week 1, peschiamo l'ultimo log della W6 del mesociclo precedente
    if (sett === 1) {
      if (!previousWorkout.value) return null;
      const prevW6Text = inputSettimanePrecedente.value[6]?.ins || previousWorkout.value.ins_week6 || previousWorkout.value.num_ins6;
      if (!prevW6Text) return null;
      const pesoStr = estraiPesoDaInput(String(prevW6Text));
      const pesoNum = pesoStr ? parseFloat(pesoStr) : parseFloat(String(prevW6Text).replace(',', '.'));
      if (isNaN(pesoNum)) return null;
      
      const p = propostaWeek1.value;
      const repsPrecedenti = p ? p.prevReps : (previousWorkout.value.reps_week6 || estraiRepsDaPrescrizione(previousWorkout.value.des_week6) || '');
      const giorniTrascorsi = p ? p.giorniTrascorsi : calcolaGiorniTrascorsi(previousWorkout.value.dat_scheda_ult_ex || previousWorkout.value.timestamp);

      return { 
        text: prevW6Text, 
        peso: pesoNum, 
        label: 'W6 Prec.',
        isWeek1: true,
        reps: repsPrecedenti,
        suggerito: p ? p.peso : null,
        giorni: giorniTrascorsi,
        proposta: p,
        schedaPrec: previousWorkout.value.num_scheda
      };
    }

    // Proposta specifica per Week 2 (configurabile)
    if (sett === 2) {
      const baseW = propostaBaseWeek2.value; // "W1" o "W6 Prec."
      
      if (baseW === 'W6 Prec.') {
        if (previousWorkout.value) {
          const prevW6Text = inputSettimanePrecedente.value[6]?.ins || previousWorkout.value.ins_week6 || previousWorkout.value.num_ins6;
          if (prevW6Text) {
            const proposedVal = proponiProgressioneCaricoRIR(2, 6, String(prevW6Text));
            if (proposedVal !== null) {
              return { text: prevW6Text, peso: proposedVal, label: 'W6 Prec.' };
            }
          }
        }
      }
      
      // Default: propone W1
      const w1Ins = inputSettimane.value[1]?.ins;
      if (w1Ins) {
        const proposedVal = proponiProgressioneCaricoRIR(2, 1, w1Ins);
        if (proposedVal !== null) {
          return { text: w1Ins, peso: proposedVal, label: 'W1' };
        }
      }
    }

    // Proposta specifica per Week 3
    if (sett === 3) {
      const w2Ins = inputSettimane.value[2]?.ins;
      if (w2Ins) {
        const proposedVal = proponiProgressioneCaricoRIR(3, 2, w2Ins);
        if (proposedVal !== null) {
          return { text: w2Ins, peso: proposedVal, label: 'W2' };
        }
      }
    }

    // Proposta specifica per Week 4 (Scarico) - se isWeek4Scarico, propone W2
    if (sett === 4 && isWeek4Scarico.value) {
      const w2Ins = inputSettimane.value[2]?.ins;
      if (!w2Ins) return null;
      const pesoStrW2 = estraiPesoDaInput(w2Ins);
      if (!pesoStrW2) return null;
      return { text: w2Ins, peso: parseFloat(pesoStrW2), label: 'W2', isScarico: true };
    }

    // Proposta specifica per Week 5 (configurabile)
    if (sett === 5) {
      const baseW = propostaBaseWeek5.value; // e.g. "W3"
      const baseWNum = parseInt(baseW.replace('W', ''), 10) || 3;
      const baseIns = inputSettimane.value[baseWNum]?.ins;
      if (!baseIns) return null;
      const pesoStrBase = estraiPesoDaInput(baseIns);
      if (!pesoStrBase) return null;
      const pesoBase = parseFloat(pesoStrBase);
      
      // Se c'è stato lo scarico alla W4, proponiamo di aumentare il peso rispetto alla base selezionata
      if (isWeek4Scarico.value) {
        const exName = String(workout.value.des_esercizio || '').toLowerCase();
        const exNote = String(workout.value.des_note_attrezzo || '').toLowerCase();
        const exAttr = String(workout.value.des_note_gen_attr || '').toLowerCase();
        const isManubri = exName.includes('manubr') || exNote.includes('manubr') || exAttr.includes('manubr') || exName.includes('db') || exName.includes('dumbbell');
        
        let pesoProposto;
        if (isManubri) {
          const incremento = pesoBase >= SOGLIA_FORZA_MANUBRI.value ? INCREMENTO_MANUBRI_FORTE.value : INCREMENTO_MANUBRI_LEGGERO.value;
          pesoProposto = pesoBase + incremento;
        } else {
          const incremento = pesoBase * (INCREMENTO_PESO_POST_SCARICO_PCT.value / 100);
          pesoProposto = Math.round((pesoBase + incremento) * 2) / 2; // Arrotondato a 0.5kg
        }
        
        return {
          text: baseIns,
          peso: pesoBase,
          label: baseW,
          isPostScarico: true,
          pesoProposto: pesoProposto
        };
      }
      
      const proposedVal = proponiProgressioneCaricoRIR(5, baseWNum, baseIns);
      return { text: baseIns, peso: proposedVal !== null ? proposedVal : pesoBase, label: baseW };
    }

    // Proposta specifica per Week 6 (configurabile)
    if (sett === 6) {
      const baseW = propostaBaseWeek6.value; // e.g. "W5"
      const baseWNum = parseInt(baseW.replace('W', ''), 10) || 5;
      const baseIns = inputSettimane.value[baseWNum]?.ins;
      if (!baseIns) return null;
      
      const proposedVal = proponiProgressioneCaricoRIR(6, baseWNum, baseIns);
      if (proposedVal !== null) {
        return { text: baseIns, peso: proposedVal, label: baseW };
      }
      
      const pesoStrBase = estraiPesoDaInput(baseIns);
      if (!pesoStrBase) return null;
      const pesoBase = parseFloat(pesoStrBase);
      return { text: baseIns, peso: pesoBase, label: baseW };
    }

    // Per le altre week (4 non scarico): propone la settimana precedente (sett - 1)
    const prevIns = inputSettimane.value[sett - 1]?.ins;
    if (!prevIns) return null;
    const pesoStr = estraiPesoDaInput(prevIns);
    if (!pesoStr) return null;
    return { text: prevIns, peso: parseFloat(pesoStr), label: `W${sett - 1}` };
  }
};

const getGhostStatus = (sett) => {
  const currentInput = inputSettimane.value[sett]?.ins;
  if (!currentInput || !String(currentInput).trim()) return 'empty';

  const ghost = getGhostLift(sett);
  if (!ghost) return 'filled'; // Inserito ma senza record o a % (sarà Arancione)

  if (sett === 1) return 'up'; // Week 1 sempre verde come concordato

  const currentPesoStr = estraiPesoDaInput(currentInput);
  if (!currentPesoStr) return 'filled';

  // LOGICA: se l'utente scrive "9 9 9" e il ghost è "8 8 8", 
  // estraiPesoDaInput prende il 9, il ghost ha l'8. 9 > 8 -> Verde!
  return parseFloat(currentPesoStr) >= ghost.peso ? 'up' : 'down';
};

const getGhostFieldClass = (sett) => {
  const status = getGhostStatus(sett);
  if (status === 'up') return 'ghost-glow-green';
  if (status === 'down') return 'ghost-glow-blue';
  if (status === 'filled') return 'ghost-glow-orange';
  return ''; // Resta grigio spento solo se completamente vuoto
};

const estraiPesoDaInput = (str) => {
  if (!str) return null;
  
  let clean = str.replace(/,/g, '.').trim();
  
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
    
    // Se il suffisso inizia con il simbolo dei gradi ° o parole di configurazione/volume
    const suffixTokens = suffixClean.split(/[\s\-+:=@]+/);
    const suffixToken = (suffixTokens[0] || '').toLowerCase().trim();
    
    if (suffixClean.startsWith('°') || settingKeywords.some(word => suffixToken.includes(word) || suffixClean.toLowerCase().startsWith(word))) {
      continue; // Ignorato (è un parametro di setting o gradi o ripetizioni)
    }
    
    // Esclusioni standard per il suffisso (es. "/", "%", "rpe", "sec", ecc.)
    if (suffixToken) {
      if (suffixToken.startsWith('/') || suffixToken === '%' || suffixToken.startsWith('rpe') || suffixToken.startsWith('sec') || suffixToken.startsWith('min') || suffixToken.startsWith('s') || suffixToken.startsWith('m')) {
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
  let current = parseKg(numIns6Val.value);
  current += 1.25;
  numIns6Val.value = String(parseFloat(current.toFixed(2)));
  salvaKgUnico();
};

const decrementaKgUnico = () => {
  vibraTattile(10);
  let current = parseKg(numIns6Val.value);
  if (current > 0) {
    current = Math.max(0, current - 1.25);
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
  let current = parseKg(numIns6ValPrecedente.value);
  current += 1.25;
  numIns6ValPrecedente.value = String(parseFloat(current.toFixed(2)));
  salvaKgUnicoPrecedente();
};

const decrementaKgUnicoPrecedente = () => {
  vibraTattile(10);
  let current = parseKg(numIns6ValPrecedente.value);
  if (current > 0) {
    current = Math.max(0, current - 1.25);
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

// Computed per record e suggerimenti nello storico
// Trova il carico massimo registrato nella settimana attiva e quello assoluto (con stesse reps) tra tutte le schede precedenti
const suggerimentoRecord = computed(() => {
  const w = settimanaAttiva.value;
  let maxWeight = 0;
  let maxAbsolute = 0;
  let maxAbsoluteWeek = 0;
  let maxAbsoluteReps = null;
  let maxAbsoluteSheet = null;
  let maxAbsoluteDay = null;
  let maxAbsoluteDate = null;
  
  storicoEsercizio.value.forEach(prevEx => {
    const sNum = parseInt(prevEx.num_scheda);
    const currentNumScheda = parseInt(workout.value?.num_scheda);
    if (sNum === currentNumScheda) return;

    // Trova il massimo assoluto in qualsiasi settimana (1-6)
    for (let i = 1; i <= 6; i++) {
      const shouldMatch = soloCorrispondenti.value ? isMatchingReps(prevEx, i) : true;
      if (shouldMatch) {
        const valAny = prevEx['ins_week' + i];
        if (valAny) {
          const pesoNumAny = parseFloat(estraiPesoDaInput(valAny));
          if (!isNaN(pesoNumAny) && pesoNumAny > maxAbsolute) {
            maxAbsolute = pesoNumAny;
            maxAbsoluteWeek = i;
            
            // Estrarre i metadati
            let reps = prevEx['reps_week' + i];
            if (!reps) {
              reps = estraiRepsDaPrescrizione(prevEx['des_week' + i]);
            }
            maxAbsoluteReps = reps ? parseInt(reps, 10) : null;
            maxAbsoluteSheet = prevEx.num_scheda;
            maxAbsoluteDay = prevEx.des_giorno;
            maxAbsoluteDate = prevEx.dat_scheda_ult_ex || prevEx.timestamp;
          }
        }
      }
    }

    if (!isMatchingReps(prevEx, w)) return;

    const val = prevEx['ins_week' + w];
    if (val) {
      const pesoNum = parseFloat(estraiPesoDaInput(val));
      if (!isNaN(pesoNum) && pesoNum > maxWeight) {
        maxWeight = pesoNum;
      }
    }
  });

  // Logica incrementi
  let increment, label;
  if (w <= 3) {
    increment = 0.5;
    label = '+0.5 kg (Inizio)';
  } else if (w === 4) {
    increment = 1.0;
    label = '+1.0 kg (Metà)';
  } else {
    increment = 2.0;
    label = '+2.0 kg (Spingi!)';
  }

  const isScarico = (w === 4 && isWeek4Scarico.value);
  const pesoW2 = workout.value?.ins_week2 || '';

  // Se non ho record e non è scarico, non mostro nulla
  if (maxWeight === 0 && maxAbsolute === 0 && !isScarico) return null;

  return {
    record: maxWeight,
    recordAbsolute: maxAbsolute,
    recordAbsoluteWeek: maxAbsoluteWeek,
    recordAbsoluteReps: maxAbsoluteReps,
    recordAbsoluteSheet: maxAbsoluteSheet,
    recordAbsoluteDay: maxAbsoluteDay,
    recordAbsoluteDate: maxAbsoluteDate,
    target: maxWeight + increment,
    label,
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

const vaiADettaglioStorico = (prevExId) => {
  vibraTattile(10);
  dialogStorico.value = false;
  router.push({ name: 'DettaglioWorkout', params: { id: prevExId } });
};

// Funzione Riepilogo Storico Esercizi (freccia con orologio)
const apriStoricoEsercizio = async () => {
  vibraTattile(10);
  dialogStorico.value = true;
  caricandoStorico.value = true;
  storicoEsercizio.value = [];
  soloCorrispondenti.value = true;
  
  try {
    const { key: keyIdCliente, id: atletaId } = getAtletaInfo(workout.value);
    const desEsercizio = workout.value.des_esercizio;
    const currentNumScheda = parseInt(workout.value.num_scheda);
    
    if (!atletaId || !desEsercizio || isNaN(currentNumScheda)) {
      caricandoStorico.value = false;
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
      // Schede precedenti ed attuale (riga > 0)
      if (sNum <= currentNumScheda && parseInt(d.num_riga_giorno) > 0) {
        list.push({ id: doc.id, ...d });
      }
    });

    list.sort((a, b) => parseInt(a.num_scheda) - parseInt(b.num_scheda));
    
    // Fallback a backup locale se vuoto
    if (list.length === 0) {
      const res = await fetch('/storyboard_backup.json');
      const allData = await res.json();
      const matched = allData.filter(b => {
        const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
        return String(bAtletaId) === String(atletaId) &&
               String(b.des_esercizio).trim() === String(desEsercizio).trim() &&
               parseInt(b.num_scheda) <= currentNumScheda &&
               parseInt(b.num_riga_giorno) > 0;
      });
      matched.sort((a, b) => parseInt(a.num_scheda) - parseInt(b.num_scheda));
      storicoEsercizio.value = matched;
} else {
      storicoEsercizio.value = list;
    }

// Auto-scroll alla settimana attiva e in fondo alla lista
    setTimeout(() => {
      
      // 1. Scroll della Tabella (Modalità Tabella)
      if (storicoTableContainer.value) {
        const colWidth = 110; 
        const scrollPosHoriz = (settimanaAttiva.value - 1) * colWidth + 17; // Ripristinato l'offset
        
        storicoTableContainer.value.scrollTo({
          left: scrollPosHoriz,
          top: storicoTableContainer.value.scrollHeight + 1000, // Ora scrolla in fondo ALL'INTERNO della tabella
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

  } catch (err) {
    console.error("Errore caricamento storico esercizio:", err);
  } finally {
    caricandoStorico.value = false;
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
  
  if (noteAttrezzo.value !== (workout.value.des_note_attrezzo || '')) {
    updates.des_note_attrezzo = noteAttrezzo.value;
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
      const res = await fetch('/storyboard_backup.json');
      const allData = await res.json();
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
  padding-bottom: 8px !important;
  margin-top: -8px !important;
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
  opacity: 0.25;
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
  background: rgba(15, 23, 42, 0.85);
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
  background: rgba(15, 23, 42, 0.4);
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
  background: rgba(15, 23, 42, 0.98);
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
  background: rgba(15, 23, 42, 0.4);
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
