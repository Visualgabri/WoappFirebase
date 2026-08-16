<template>
  <v-container 
    class="px-3 max-width-container min-height-screen"
    :class="layoutEsercizi === 'super_compatto' ? 'pb-3' : (layoutEsercizi === 'compatto' ? 'pb-3.5' : 'pb-4')"
    style="padding-top: 0px !important; margin-top: -6px !important;"
  >
    <!-- Header Premium -->
    <div 
      class="appsheet-header d-flex align-center justify-space-between"
      :class="layoutEsercizi === 'super_compatto' ? 'mb-1' : (layoutEsercizi === 'compatto' ? 'mb-1.5' : 'mb-2')"
    >
      <div class="d-flex align-center">
        <v-avatar size="32" class="mr-2 bg-transparent border-theme-primary elevation-1">
          <v-img src="/logo.png" alt="WoApp Logo" class="logo-theme-adapt"></v-img>
        </v-avatar>
        <div class="text-left d-flex flex-column align-start" style="gap: 2px;">
          <h1 class="text-subtitle-1 font-weight-black text-slate-dark tracking-tight mb-0" style="line-height: 1; font-size: 1.12rem;">WORKOUTS</h1>
          <div class="d-flex align-center flex-wrap gap-1 mt-0.5" v-if="atletaSelezionato && schedaSelezionata">
            <v-chip
              size="x-small"
              class="font-weight-black uppercase px-1.5 py-0 text-white elevation-1 bg-theme-primary"
              variant="flat"
              style="font-size: 0.58rem; letter-spacing: 0.01em; height: 18px;"
            >
              👤 {{ getNomeAtleta(atletaSelezionato) }} • Scheda {{ schedaSelezionata }}
            </v-chip>
            
            <v-chip
              v-if="allineamentoProgramma"
              :color="allineamentoProgramma.status === 'in-linea' ? 'green-darken-3' : (allineamentoProgramma.status === 'ritardo' ? 'red-darken-3' : 'blue-darken-3')"
              size="x-small"
              class="font-weight-black px-1.5 py-0 text-white elevation-1"
              variant="flat"
              style="font-size: 0.58rem; letter-spacing: 0.01em; height: 18px;"
            >
              <v-icon size="10" class="mr-1">
                {{ allineamentoProgramma.status === 'in-linea' ? 'mdi-check-circle' : (allineamentoProgramma.status === 'ritardo' ? 'mdi-alert-circle' : 'mdi-trending-up') }}
              </v-icon>
              {{ allineamentoProgramma.status === 'in-linea' ? 'IN LINEA' : (allineamentoProgramma.status === 'ritardo' ? 'RITARDO W' + allineamentoProgramma.deltaAbs : 'ANTICIPO W' + allineamentoProgramma.deltaAbs) }}
            </v-chip>
          </div>
        </div>
      </div>
      <div class="header-actions d-flex align-center gap-1">
        <v-btn 
          icon 
          color="amber-darken-3" 
          variant="tonal" 
          size="x-small" 
          style="width: 28px; height: 28px;" 
          @click="apriDialogGradimenti('tutti')" 
          title="Gradimenti e Feeling Esercizi"
          id="btn-apri-gradimenti-header"
        >
          <v-badge 
            v-if="eserciziSenzaGradimento.length > 0" 
            color="red-darken-2" 
            :content="eserciziSenzaGradimento.length" 
            floating 
            style="font-size: 0.55rem;"
          >
            <v-icon size="16">mdi-star</v-icon>
          </v-badge>
          <v-icon v-else size="16">mdi-star</v-icon>
        </v-btn>
        <v-btn icon color="primary" variant="tonal" size="x-small" style="width: 28px; height: 28px;" @click="dialogRicercaGlobaleScheda = true" title="Cerca in tutta la scheda">
          <v-icon size="16">mdi-magnify</v-icon>
        </v-btn>
      </div>
    </div>

    <!-- Stato vuoto se non selezionati atleta e scheda -->
    <div v-if="!atletaSelezionato || !schedaSelezionata" class="empty-state text-center my-12 py-12 card-glass rounded-xl">
      <v-icon size="80" color="primary" class="mb-4 animate-bounce">mdi-clipboard-text-search-outline</v-icon>
      <h3 class="text-h5 font-weight-bold text-slate-dark">Seleziona Atleta e Scheda</h3>
      <p class="text-body-1 text-muted mt-2">
        Scegli l'atleta e la scheda attiva nella sezione <strong>Home</strong> per sbloccare la lista allenamenti.
      </p>
      <v-btn to="/home" color="primary" class="font-weight-bold text-none mt-6" rounded="lg">
        Vai alla Home
      </v-btn>
    </div>

    <!-- Contenuto Principale -->
    <div v-else>
      
      <div 
        class="sticky-tabs-container mb-0" 
        :class="{ 
          'super-compatto-tabs': layoutEsercizi === 'super_compatto',
          'compatto-tabs': layoutEsercizi === 'compatto'
        }"
        :style="{ top: utente ? '48px' : '0px' }"
      >
        <div 
          v-if="!caricamento && listaGiorniDisponibili.length > 0"
          class="card-glass rounded-xl text-center font-weight-black tracking-widest"
          :class="layoutEsercizi === 'super_compatto' ? 'mb-0.5' : (layoutEsercizi === 'compatto' ? 'mb-0.5' : 'mb-1')"
          :style="settimanaAttiva === 6 ? 'font-size: 0.60rem; border: 1.5px solid var(--brand-accent); background: var(--brand-accent-bg) !important; padding: 3px 4px;' : 'font-size: 0.58rem; border: 1px solid var(--card-border); padding: 2.5px 4px;'"
          style="color: var(--text-slate);"
        >
          <span class="text-theme-primary font-weight-black">SETTIMANA CORRENTE:</span>
          <span class="text-slate-dark ml-1.5 font-weight-black">WEEK {{ settimanaAttiva }}</span>
          <span v-if="settimanaAttiva === 6" class="ml-2 px-1.5 py-0.5 rounded bg-theme-primary text-white font-weight-black animate-pulse" style="font-size: 0.55rem; letter-spacing: normal;">
            🔥 ULTIMA SETTIMANA!
          </span>
        </div>

        <!-- Skeleton tabs durante il caricamento per evitare sflash dei giorni A B C D -->
        <div 
          v-if="caricamento" 
          class="card-glass elevation-1 d-flex justify-space-around align-center" 
          :class="layoutEsercizi === 'super_compatto' ? 'rounded-md' : (layoutEsercizi === 'compatto' ? 'rounded-lg' : 'rounded-3xl')"
          :style="{ height: layoutEsercizi === 'super_compatto' ? '34px' : (layoutEsercizi === 'compatto' ? '38px' : '44px') }"
        >
          <div class="skeleton-tab-item"></div>
          <div class="skeleton-tab-item"></div>
          <div class="skeleton-tab-item"></div>
        </div>

        <v-tabs
          v-else
          v-model="giornoSelezionato"
          color="white"
          align-tabs="center"
          grow
          hide-slider
          class="day-tabs-header-bar elevation-2"
          :class="[
            layoutEsercizi === 'super_compatto' ? 'rounded-t-md' : (layoutEsercizi === 'compatto' ? 'rounded-t-lg' : 'rounded-t-xl'),
            'active-tab-theme-' + temaHeaderGiorno
          ]"
          @update:model-value="salvaGiornoSelezionato"
          :style="{ height: layoutEsercizi === 'super_compatto' ? '34px' : (layoutEsercizi === 'compatto' ? '38px' : '44px'), marginBottom: '0px' }"
        >
          <v-tab 
            v-for="giorno in listaGiorniDisponibili" 
            :key="giorno" 
            :value="giorno" 
            :ripple="false"
            class="px-2 day-tab-item" 
            :style="{ height: layoutEsercizi === 'super_compatto' ? '34px' : (layoutEsercizi === 'compatto' ? '38px' : '44px') }"
          >
            <div class="d-flex flex-column align-center justify-center py-0.5 w-100">
              <div class="d-flex align-center">
                <span 
                  class="font-weight-black tab-day-letter" 
                  :style="{
                    fontSize: layoutEsercizi === 'super_compatto' ? '0.85rem' : (layoutEsercizi === 'compatto' ? '0.95rem' : '1.05rem'),
                    lineHeight: '1'
                  }"
                >
                  {{ giorno }}
                </span>
                <v-icon
                  v-if="giornoHaBuchi(giorno)"
                  color="red-lighten-1"
                  :size="layoutEsercizi === 'super_compatto' ? 9 : 11"
                  class="ml-1"
                  title="Esercizi mancanti (buco nell'ordine)"
                >
                  mdi-alert-circle
                </v-icon>
                <v-icon
                  v-if="statoGiorni[giorno] === 'completed'"
                  color="green-accent-4"
                  :size="layoutEsercizi === 'super_compatto' ? 9 : 11"
                  class="ml-1"
                >
                  mdi-check-bold
                </v-icon>
                <v-icon
                  v-else-if="statoGiorni[giorno] === 'pending'"
                  color="white"
                  :size="layoutEsercizi === 'super_compatto' ? 9 : 11"
                  class="ml-1 tab-lock-icon"
                >
                  mdi-lock-open-outline
                </v-icon>
              </div>
              <span 
                v-if="layoutEsercizi !== 'super_compatto' && settimanaDaChiuderePerGiorno(giorno)" 
                class="text-super-caption font-weight-black" 
                :class="settimanaDaChiuderePerGiorno(giorno) === 'FINE' ? 'text-green-accent-4' : 'text-orange-lighten-2'"
                style="font-size: 0.55rem; margin-top: 1px; line-height: 1; opacity: 0.9;"
              >
                {{ settimanaDaChiuderePerGiorno(giorno) }}
              </span>
              <!-- Mini barra di avanzamento del giorno -->
              <div 
                class="day-tab-progress-bg mt-0.5" 
                :style="{ 
                  width: '70%', 
                  height: '2px', 
                  background: 'rgba(255, 255, 255, 0.15)', 
                  borderRadius: '2px', 
                  overflow: 'hidden' 
                }"
              >
                <div 
                  class="day-tab-progress-fill"
                  :style="{ 
                    width: getProgressoGiorno(giorno).percentuale + '%', 
                    height: '100%', 
                    background: statoGiorni[giorno] === 'completed' ? 'var(--color-emerald-700, #4d7c0f)' : 'var(--brand-accent, #c85a17)',
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
        <v-progress-circular indeterminate color="primary" size="48"></v-progress-circular>
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
              <div class="d-flex gap-2 flex-wrap align-center">
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
                <!-- Pulsante Inserisci Gradimenti Mancanti o Riepilogo Gradimenti -->
                <v-btn
                  v-if="eserciziSenzaGradimento.length > 0"
                  variant="flat"
                  color="amber-darken-3"
                  size="small"
                  class="font-weight-black text-none text-white animate-pulse"
                  rounded="lg"
                  @click="apriDialogGradimenti('mancanti')"
                  id="btn-gradimenti-mancanti-banner"
                >
                  ⭐ Inserisci {{ eserciziSenzaGradimento.length }} Gradimenti Mancanti
                </v-btn>
                <v-btn
                  v-else
                  variant="outlined"
                  color="amber-lighten-2"
                  size="small"
                  class="font-weight-black text-none card-glass"
                  rounded="lg"
                  @click="apriDialogGradimenti('tutti')"
                  id="btn-gradimenti-tutti-banner"
                >
                  ⭐ Gradimenti (Media: {{ mediaGradimenti }}/5)
                </v-btn>
              </div>

              <!-- Avviso se mancano ancora gradimenti a fine mesociclo -->
              <div v-if="eserciziSenzaGradimento.length > 0" class="mt-2.5 d-flex align-center gap-1.5 text-super-caption font-weight-bold text-amber-lighten-2" style="font-size: 0.68rem;">
                <v-icon size="14" color="amber-lighten-2">mdi-alert-circle-outline</v-icon>
                <span>Mancano ancora {{ eserciziSenzaGradimento.length }} voti di gradimento prima di archiviare definitivamente la scheda.</span>
              </div>
            </div>
          </div>
        </v-card>

        <transition :name="transitionName" mode="out-in">
          <div :key="giornoSelezionato" class="swipe-transition-wrapper">
            <!-- Avviso Esercizi Mancanti (Buco nell'ordine numerico) -->
            <v-card
              v-if="eserciziMancantiGiornoSelezionato.length > 0"
              class="py-3 px-4 mb-4 text-left border animate-pulse"
              style="background: linear-gradient(135deg, rgba(239, 68, 68, 0.12), rgba(239, 68, 68, 0.04)) !important; border: 1.5px solid rgba(239, 68, 68, 0.4) !important; box-shadow: 0 4px 20px rgba(239, 68, 68, 0.15) !important; border-radius: 12px !important;"
            >
              <div class="d-flex align-center">
                <v-icon color="red-lighten-1" class="mr-3 flex-shrink-0" size="24">mdi-alert-circle</v-icon>
                <div class="flex-grow-1">
                  <h4 class="text-subtitle-2 font-weight-black text-red-lighten-2 mb-0.5" style="font-size: 0.82rem !important;">
                    Attenzione: Esercizi Mancanti!
                  </h4>
                  <p class="text-slate font-weight-medium mb-0" style="font-size: 0.72rem; line-height: 1.35; color: #e2e8f0 !important;">
                    C'è un buco nell'ordine degli esercizi per il <strong>Giorno {{ giornoSelezionato }}</strong>.
                    Manca{{ eserciziMancantiGiornoSelezionato.length === 1 ? ' l\'esercizio alla posizione' : 'no gli esercizi alle posizioni' }}:
                    <span class="text-red-lighten-2 font-weight-black">{{ eserciziMancantiGiornoSelezionato.join(', ') }}</span>.
                    Verifica l'importazione.
                  </p>
                </div>
              </div>
            </v-card>



        <!-- Container Unico Sessione Giorno -->
        <v-card
          v-if="headerGiorno"
          class="workout-session-container overflow-hidden border elevation-3 mb-6"
          :class="layoutEsercizi === 'super_compatto' ? 'rounded-b-md' : (layoutEsercizi === 'compatto' ? 'rounded-b-lg' : 'rounded-b-2xl')"
          style="border-top: none !important; margin-top: 0px !important;"
        >
          <!-- Intestazione Sessione (ex Day Header Card) -->
          <div
            class="day-header-section clickable-header position-relative"
            :class="[
              {
                'py-1 px-3': layoutEsercizi === 'super_compatto',
                'py-1.5 px-4': layoutEsercizi === 'compatto',
                'py-2 px-4': layoutEsercizi === 'standard',
                'has-scroll-bottom-border': isScrolledPastDayHeader
              },
              'tema-' + temaHeaderGiorno
            ]"
            style="transition: background 0.2s;"
            @click="vaiAlDettaglioSessione(headerGiorno.id)"
          >
          <!-- Se il header si può formattare, mostriamo un layout premium strutturato -->
          <div v-if="parseDayHeader(headerGiorno.des_esercizio)" class="w-100">
            <div 
              class="d-flex align-start justify-space-between w-100 flex-wrap gap-1"
              :class="layoutEsercizi === 'super_compatto' ? 'mb-0.5' : (layoutEsercizi === 'compatto' ? 'mb-0.5' : 'mb-1')"
            >
              <div class="d-flex align-center">
                <div 
                  class="giorno-big-letter flex-shrink-0"
                  :style="{ 
                    width: layoutEsercizi === 'super_compatto' ? '28px' : (layoutEsercizi === 'compatto' ? '34px' : '38px'),
                    height: layoutEsercizi === 'super_compatto' ? '28px' : (layoutEsercizi === 'compatto' ? '34px' : '38px'),
                    fontSize: layoutEsercizi === 'super_compatto' ? '0.85rem' : (layoutEsercizi === 'compatto' ? '1rem' : '1.15rem'),
                    borderRadius: layoutEsercizi === 'super_compatto' ? '6px' : (layoutEsercizi === 'compatto' ? '8px' : '10px'),
                    marginRight: layoutEsercizi === 'super_compatto' ? '10px' : (layoutEsercizi === 'compatto' ? '12px' : '16px')
                  }"
                >
                  {{ giornoSelezionato }}
                </div>
                <div class="text-left">
                  <div class="d-flex align-center flex-wrap gap-2">
                    <h3 
                      class="font-weight-black header-title-text mb-0"
                      :class="layoutEsercizi === 'super_compatto' ? 'text-caption' : (layoutEsercizi === 'compatto' ? 'text-body-2' : 'text-subtitle-2')"
                    >
                      Workout Giorno {{ giornoSelezionato }}
                    </h3>
                  </div>
                  <!-- Promemoria Chiusura Settimana -->
                  <div v-if="mostraPromemoriaChiusura" class="mt-1">
                    <v-chip
                      size="x-small"
                      class="font-weight-black px-1.5 animate-pulse promemoria-chiusura-chip elevation-1"
                      variant="flat"
                      :style="{
                        fontSize: layoutEsercizi === 'super_compatto' ? '0.52rem' : '0.58rem',
                        height: layoutEsercizi === 'super_compatto' ? '15px' : '18px'
                      }"
                    >
                      ⚠️ SETTIMANA DA CHIUDERE
                    </v-chip>
                  </div>
                  <!-- Progresso Settimane (Tracker Week) -->
                  <div 
                    class="d-flex gap-1 align-center mini-weeks-progression"
                    :class="layoutEsercizi === 'super_compatto' ? 'mt-0.5' : 'mt-1'"
                  >
                    <div
                      v-for="w in [1, 2, 3, 4, 5, 6]"
                      :key="w"
                      class="mini-week-capsule"
                      :class="{
                        'capsule-active': w === settimanaAttivaGiorno,
                        'capsule-completed': isCmpTrue(headerGiorno['cmp' + w]) && w !== settimanaAttivaGiorno,
                        'capsule-pending': !isCmpTrue(headerGiorno['cmp' + w]) && w !== settimanaAttivaGiorno
                      }"
                      :style="{ 
                        cursor: 'default',
                        padding: layoutEsercizi === 'super_compatto' ? '1px 3px' : '2px 5px',
                        fontSize: layoutEsercizi === 'super_compatto' ? '0.55rem' : '0.62rem'
                      }"
                    >
                      <span class="capsule-num">W{{ w }}</span>
                      <v-icon v-if="isCmpTrue(headerGiorno['cmp' + w])" size="8" class="ml-0.5" color="green-accent-4">mdi-check-bold</v-icon>
                    </div>
                  </div>
                  <!-- Micro-Capsule Informative Workout (Idea 1 - Adattive Tema Chiaro/Scuro) -->
                  <div 
                    class="d-flex align-center flex-wrap gap-1.5 mt-1.5 header-info-micro-capsules"
                    :style="{ fontSize: layoutEsercizi === 'super_compatto' ? '0.60rem' : '0.68rem' }"
                  >
                    <!-- Durata -->
                    <div 
                      v-if="getDinamicoTempo(headerGiorno, 'media')"
                      class="micro-capsule micro-capsule-time"
                    >
                      <span class="mr-1">⏱️</span>
                      <span>{{ getDinamicoTempo(headerGiorno, 'media') }}</span>
                    </div>

                    <!-- Calorie -->
                    <div 
                      v-if="parseDayHeader(headerGiorno.des_esercizio)?.calorie"
                      class="micro-capsule micro-capsule-kcal"
                    >
                      <span class="mr-1">🔥</span>
                      <span>{{ parseDayHeader(headerGiorno.des_esercizio).calorie }} kcal</span>
                    </div>

                    <!-- Densità / Fisiologia -->
                    <div 
                      v-if="parseDayHeader(headerGiorno.des_esercizio)"
                      class="micro-capsule micro-capsule-density"
                      :class="'density-' + getDensityZoneInfo(parseDayHeader(headerGiorno.des_esercizio).densitaMedia).type"
                    >
                      <span class="mr-1">⚡</span>
                      <span>{{ parseDayHeader(headerGiorno.des_esercizio).densitaMedia }}% {{ getDensityZoneInfo(parseDayHeader(headerGiorno.des_esercizio).densitaMedia).label }}</span>
                    </div>

                    <!-- Cardio -->
                    <div 
                      v-if="parseDayHeader(headerGiorno.des_esercizio)?.cardioText"
                      class="micro-capsule micro-capsule-cardio"
                    >
                      <span class="mr-1">🏃</span>
                      <span>{{ parseDayHeader(headerGiorno.des_esercizio).cardioText }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Sezione Volumi (VOL A, B, C) -->
            <div 
              v-if="layoutEsercizi === 'standard' && parseVolumes(headerGiorno.ins_esercizio)" 
              class="volumes-premium-box pa-2 rounded-lg bg-slate-900 border-soft text-left"
            >
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
            <div 
              v-if="layoutEsercizi === 'standard' && headerGiorno.des_esercizio_2" 
              class="mt-2 pt-2 border-top-soft text-left d-flex align-center"
            >
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
            <div 
              class="d-flex align-start justify-space-between w-100 flex-wrap gap-2"
              :class="layoutEsercizi === 'super_compatto' ? 'mb-1' : (layoutEsercizi === 'compatto' ? 'mb-2' : 'mb-3')"
            >
              <div class="d-flex align-center">
                <div 
                  class="giorno-big-letter flex-shrink-0"
                  :style="{ 
                    width: layoutEsercizi === 'super_compatto' ? '28px' : (layoutEsercizi === 'compatto' ? '34px' : '42px'),
                    height: layoutEsercizi === 'super_compatto' ? '28px' : (layoutEsercizi === 'compatto' ? '34px' : '42px'),
                    fontSize: layoutEsercizi === 'super_compatto' ? '0.85rem' : (layoutEsercizi === 'compatto' ? '1rem' : '1.25rem'),
                    borderRadius: layoutEsercizi === 'super_compatto' ? '6px' : (layoutEsercizi === 'compatto' ? '8px' : '10px'),
                    marginRight: layoutEsercizi === 'super_compatto' ? '12px' : (layoutEsercizi === 'compatto' ? '20px' : '32px')
                  }"
                >
                  {{ giornoSelezionato }}
                </div>
                <div class="text-left min-width-0">
                  <div class="d-flex align-center flex-wrap gap-2">
                    <h3 
                      class="font-weight-black header-title-text text-truncate mb-0"
                      :class="layoutEsercizi === 'super_compatto' ? 'text-body-2' : (layoutEsercizi === 'compatto' ? 'text-subtitle-2' : 'text-subtitle-1')"
                    >
                      {{ headerGiorno.des_esercizio || 'Sessione di Allenamento' }}
                    </h3>
                  </div>
                  <!-- Promemoria Chiusura Settimana -->
                  <div v-if="mostraPromemoriaChiusura" class="mt-1">
                    <v-chip
                      size="x-small"
                      class="font-weight-black px-1.5 animate-pulse promemoria-chiusura-chip elevation-1"
                      variant="flat"
                      :style="{
                        fontSize: layoutEsercizi === 'super_compatto' ? '0.52rem' : '0.58rem',
                        height: layoutEsercizi === 'super_compatto' ? '15px' : '18px'
                      }"
                    >
                      ⚠️ SETTIMANA DA CHIUDERE
                    </v-chip>
                  </div>
                  <!-- Progresso Settimane (Tracker Week) -->
                  <div 
                    class="d-flex gap-1 align-center mini-weeks-progression"
                    :class="layoutEsercizi === 'super_compatto' ? 'mt-0.5' : 'mt-1'"
                  >
                    <div
                      v-for="w in [1, 2, 3, 4, 5, 6]"
                      :key="w"
                      class="mini-week-capsule"
                      :class="{
                        'capsule-active': w === settimanaAttivaGiorno,
                        'capsule-completed': isCmpTrue(headerGiorno['cmp' + w]) && w !== settimanaAttivaGiorno,
                        'capsule-pending': !isCmpTrue(headerGiorno['cmp' + w]) && w !== settimanaAttivaGiorno
                      }"
                      :style="{ 
                        cursor: 'default',
                        padding: layoutEsercizi === 'super_compatto' ? '1px 3px' : '2px 5px',
                        fontSize: layoutEsercizi === 'super_compatto' ? '0.55rem' : '0.62rem'
                      }"
                    >
                      <span class="capsule-num">W{{ w }}</span>
                      <v-icon v-if="isCmpTrue(headerGiorno['cmp' + w])" size="8" class="ml-0.5" color="green-accent-4">mdi-check-bold</v-icon>
                    </div>
                  </div>
                  <!-- Testo alternativo per Super Compatto in Fallback -->
                  <div 
                    v-if="layoutEsercizi === 'super_compatto' && headerGiorno.ins_esercizio"
                    class="text-caption text-muted font-weight-bold mt-1"
                    style="font-size: 0.65rem;"
                  >
                    <span>📊 {{ headerGiorno.ins_esercizio }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Informazioni RMT o Volumi se presenti (spostate sotto e rese indipendenti) -->
            <div v-if="layoutEsercizi === 'standard' && headerGiorno.des_esercizio_2" class="mt-2 pt-2 border-top-soft">
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
              <div v-if="layoutEsercizi === 'standard' && parseVolumes(headerGiorno.ins_esercizio)" class="volumes-premium-box pa-2 rounded-lg bg-slate-900 border-soft text-left mt-2">
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
              <div v-else-if="layoutEsercizi !== 'super_compatto' && headerGiorno.ins_esercizio" class="text-caption text-muted mt-1 leading-tight text-truncate">
                {{ headerGiorno.ins_esercizio }}
              </div>
            <v-icon color="orange-darken-3" class="ml-2">mdi-chevron-right</v-icon>
          </div>

          <!-- Progress Bar Session Energy (unificata visivamente) -->
          <div 
            class="border-top-soft text-left header-progress-section" 
            :class="layoutEsercizi === 'super_compatto' ? 'mt-1 pt-1' : (layoutEsercizi === 'compatto' ? 'mt-1 pt-1' : 'mt-1.5 pt-1.5')"
          >
            <div 
              v-if="layoutEsercizi !== 'super_compatto'"
              class="d-flex align-center justify-space-between text-super-caption font-weight-black uppercase header-progress-text mb-1" 
              style="font-size: 0.68rem; letter-spacing: 0.03em; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;"
            >
              <span><span class="mr-1">🧃</span> Avanzamento</span>
              <span class="font-weight-bold">{{ progressoSessione.completate }}/{{ progressoSessione.totali }} completati • {{ progressoSessione.percentuale }}%</span>
            </div>
            <div class="session-progress-bar-container rounded-full overflow-hidden" :style="{ height: layoutEsercizi === 'super_compatto' ? '4px' : '6px' }">
              <div
                class="session-progress-bar-fill rounded-full"
                :style="{
                  width: progressoSessione.percentuale + '%',
                  height: '100%',
                  transition: 'width 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }"
              ></div>
            </div>
          </div>
          </div>

          <!-- Sezione Esercizi della Sessione (unita visivamente) -->
          <div 
            class="day-exercises-section" 
            :class="{
              'pa-1.5': layoutEsercizi === 'super_compatto',
              'pa-2': layoutEsercizi === 'compatto',
              'pa-3': layoutEsercizi === 'standard'
            }"
            style="background: rgba(30, 41, 59, 0.15);"
          >
            <!-- Stato Vuoto se nessun esercizio presente nel giorno -->
            <div v-if="eserciziFiltrati.length === 0" class="text-center my-10 py-6">
              <v-icon color="grey-lighten-1" size="48">mdi-dumbbell-off</v-icon>
              <p class="mt-2 text-caption text-muted">Nessun esercizio presente per il giorno {{ giornoSelezionato }} in questa scheda.</p>
            </div>

            <!-- Lista Esercizi con Miniature a Sinistra -->
            <div v-else class="exercise-list">
          <template v-for="(block, bIdx) in blocchiEsercizi" :key="bIdx">
            
            <!-- CASO 0: CARD ESERCIZIO DA RECUPERARE (INTEGRATO NELLA LISTA) -->
            <v-card
              v-if="block.type === 'recupero'"
              :id="'recupero-' + block.exercise.id"
              class="exercise-item-card recupero-item-card elevation-1 d-flex align-center cursor-pointer select-none position-relative"
              :class="[
                layoutEsercizi === 'super_compatto' ? 'rounded-md pa-1.5 mb-1.5' : (layoutEsercizi === 'compatto' ? 'rounded-lg px-3 py-2.5 mb-2' : 'rounded-3xl pa-4 mb-3')
              ]"
              style="border: 1.5px solid rgba(var(--theme-primary-rgb, 249, 115, 22), 0.45) !important; background: linear-gradient(135deg, rgba(249, 115, 22, 0.07), rgba(15, 23, 42, 0.8)) !important;"
              @click="vaiAlRecupero(block)"
            >
              <!-- 1. SUPER COMPATTO -->
              <template v-if="layoutEsercizi === 'super_compatto'">
                <div class="d-flex align-center w-100 py-1" style="z-index: 2;">
                  <!-- Icona / Badge recupero -->
                  <div class="mr-2 flex-shrink-0 d-flex align-center justify-center" style="width: 28px; height: 28px;">
                    <v-icon size="18" color="primary" class="animate-pulse">mdi-sync</v-icon>
                  </div>

                  <!-- Info Area -->
                  <div class="d-flex flex-column text-left min-width-0 flex-grow-1 mr-2">
                    <div class="d-flex align-center min-width-0">
                      <v-chip color="primary" size="x-small" variant="flat" class="font-weight-black text-white mr-1 flex-shrink-0 px-1" style="height: 14px; font-size: 0.48rem; border-radius: 2px;">
                        REC • G.{{ block.exercise.des_giorno }}
                      </v-chip>
                      <span class="text-caption font-weight-bold text-slate-dark text-truncate mr-1" style="font-size: 0.75rem !important; line-height: 1.25;">
                        {{ block.exercise.des_esercizio }}
                      </span>
                      <!-- Selettore Posizione Rapido -->
                      <v-menu location="bottom end">
                        <template v-slot:activator="{ props }">
                          <v-chip
                            v-bind="props"
                            size="x-small"
                            variant="tonal"
                            color="amber-lighten-2"
                            class="cursor-pointer font-weight-bold px-1 ml-auto flex-shrink-0"
                            style="height: 14px; font-size: 0.44rem; border-radius: 2px;"
                            title="Cambia posizione esercizio"
                            @click.stop
                          >
                            {{ getPosizioneLabel(getPosizioneRecupero(block.exercise.id)) }} ▾
                          </v-chip>
                        </template>
                        <v-list density="compact" class="card-glass border rounded-xl py-1" style="background: var(--card-bg-dark) !important; min-width: 140px;">
                          <v-list-item density="compact" @click.stop="impostaPosizioneRecupero(block.exercise.id, 'inizio')">
                            <v-list-item-title class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-orange-lighten-2': getPosizioneRecupero(block.exercise.id) === 'inizio' }">
                              <v-icon size="14" class="mr-1.5" color="orange-darken-3">mdi-arrow-up-bold-box-outline</v-icon>
                              🔝 Inizio
                            </v-list-item-title>
                          </v-list-item>
                          <v-list-item density="compact" @click.stop="impostaPosizioneRecupero(block.exercise.id, 'strategica')">
                            <v-list-item-title class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-orange-lighten-2': getPosizioneRecupero(block.exercise.id) === 'strategica' }">
                              <v-icon size="14" class="mr-1.5" color="orange-darken-3">mdi-brain</v-icon>
                              🧠 Strategica
                            </v-list-item-title>
                          </v-list-item>
                          <v-list-item density="compact" @click.stop="impostaPosizioneRecupero(block.exercise.id, 'fine')">
                            <v-list-item-title class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-orange-lighten-2': getPosizioneRecupero(block.exercise.id) === 'fine' }">
                              <v-icon size="14" class="mr-1.5" color="orange-darken-3">mdi-arrow-down-bold-box-outline</v-icon>
                              🔚 Fine
                            </v-list-item-title>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                    <!-- Dettagli: Settore + Week + Complessità + Target -->
                    <div class="d-flex align-center flex-wrap gap-1 mt-0.5" style="font-size: 0.56rem; line-height: 1;">
                      <span v-if="block.exercise.des_settore" class="text-muted uppercase font-weight-black mr-1">{{ block.exercise.des_settore }}</span>
                      <v-chip size="x-small" color="primary" variant="outlined" class="font-weight-black px-1" style="font-size: 0.44rem; height: 13px; border-radius: 2px;">
                        W{{ block.week }}
                      </v-chip>
                      <v-chip 
                        size="x-small" 
                        variant="flat" 
                        class="font-weight-bold px-1" 
                        style="font-size: 0.44rem; height: 13px; border-radius: 2px;"
                        :color="block.complessita === 1 ? 'red-darken-3' : block.complessita === 2 ? 'amber-darken-3' : block.complessita === 4 ? 'green-darken-3' : 'yellow-darken-3'"
                      >
                        {{ labelComplessita(block.complessita) }}
                      </v-chip>
                      <span class="text-muted font-weight-bold text-truncate" style="font-size: 0.54rem;">
                        🎯 {{ formattaPrescrizioneSemplice(block.prescrizione) }}
                      </span>
                    </div>
                  </div>

                  <!-- Action Button -->
                  <div class="flex-shrink-0 d-flex align-center gap-1">
                    <v-btn
                      color="green-darken-3"
                      size="x-small"
                      variant="flat"
                      class="font-weight-black text-none text-white rounded px-1.5"
                      style="height: 20px; font-size: 0.55rem !important; min-width: auto;"
                      title="Segna come completato"
                      @click.stop="concludiRecuperoRapido(block)"
                    >
                      <v-icon size="11" class="mr-0.5">mdi-check</v-icon>
                      Fatto
                    </v-btn>
                    <v-icon size="14" color="slate-dark" class="opacity-50">mdi-chevron-right</v-icon>
                  </div>
                </div>
              </template>

              <!-- 2. COMPATTO -->
              <template v-else-if="layoutEsercizi === 'compatto'">
                <!-- Miniatura dinamica (default 70x70px) con badge REC -->
                <div class="d-flex flex-column align-center ml-1 mr-3 mt-1 flex-shrink-0" :style="{ width: (dimensioneGifCompatta || 70) + 'px', minWidth: (dimensioneGifCompatta || 70) + 'px' }">
                  <div class="position-relative" :style="{ width: (dimensioneGifCompatta || 70) + 'px', height: (dimensioneGifCompatta || 70) + 'px' }">
                    <!-- Badge RECUPERO a cavallo della foto -->
                    <div
                      class="position-absolute d-flex align-center justify-center font-weight-black text-white"
                      style="top: -6px; left: -6px; min-width: 22px; height: 22px; font-size: 0.62rem; background: var(--theme-primary, #c85a17); z-index: 10; border-radius: 6px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);"
                      title="Esercizio da recuperare"
                    >
                      🔄
                    </div>

                    <div class="rounded-xl overflow-hidden shadow-sm position-relative" :style="{ width: (dimensioneGifCompatta || 70) + 'px', height: (dimensioneGifCompatta || 70) + 'px', border: '1px solid var(--card-border)' }">
                      <v-img
                        :src="getGifUrl(block.exercise.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200'"
                        :width="(dimensioneGifCompatta || 70) + 'px'"
                        :height="(dimensioneGifCompatta || 70) + 'px'"
                        cover
                        alt="Esercizio"
                        class="bg-grey-lighten-4"
                      >
                        <template v-slot:placeholder>
                          <div class="fill-height d-flex align-center justify-center bg-slate-50">
                            <v-icon color="grey-lighten-1" size="18">mdi-dumbbell</v-icon>
                          </div>
                        </template>
                      </v-img>

                      <div
                        v-if="block.exercise.des_rec_report"
                        class="position-absolute w-100 text-center font-weight-black text-amber-lighten-3 clickable-timer-chip"
                        style="bottom: 0; left: 0; background: rgba(15, 23, 42, 0.85); font-size: 0.52rem; padding: 1.5px 0; z-index: 10; line-height: 1.1; backdrop-filter: blur(2px);"
                        title="Tocca per avviare timer recupero"
                        @click.stop="avviaTimerRecupero(block.exercise.des_rec_report, block.exercise.des_esercizio)"
                      >
                        {{ block.exercise.des_rec_report }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Dettagli Centrali Estesi -->
                <div class="flex-grow-1 text-left min-width-0 position-relative mt-0.5 pr-1 pb-1" style="z-index: 2;">
                  <!-- Riga 1: Titolo Esercizio (Pieno spazio per massima leggibilità su smartphone) -->
                  <h4 class="font-weight-black leading-tight mb-0.5 text-slate-dark text-truncate" style="font-size: 0.80rem !important; line-height: 1.25 !important; padding-right: 64px;">
                    {{ block.exercise.des_esercizio || 'Esercizio da recuperare' }}
                  </h4>

                  <!-- Riga 2: Settore Muscolare + Target Prescrizione -->
                  <div class="d-flex align-center min-width-0 mb-1" style="gap: 5px; padding-right: 64px;">
                    <div v-if="block.exercise.des_settore" class="d-flex align-center text-caption font-weight-bold text-orange-darken-3 flex-shrink-0" style="max-width: 95px;">
                      <span class="text-truncate" style="font-size: 0.64rem !important;">{{ block.exercise.des_settore }}</span>
                    </div>
                    <div class="text-caption font-weight-bold text-slate text-truncate flex-grow-1 min-width-0" style="font-size: 0.65rem !important;">
                      🎯 {{ formattaPrescrizioneSemplice(block.prescrizione) }}
                    </div>
                  </div>

                  <!-- Riga 3: Badge Origine Giorno/Week + Complessità + Selettore Posizione -->
                  <div class="d-flex align-center flex-wrap gap-1 mt-0.5" style="padding-right: 64px;">
                    <v-chip 
                      color="primary" 
                      size="x-small" 
                      variant="flat" 
                      class="font-weight-black text-white px-1.5 flex-shrink-0" 
                      style="height: 16px; font-size: 0.48rem; border-radius: 3px;"
                    >
                      DA G.{{ block.exercise.des_giorno }} • W{{ block.week }}
                    </v-chip>
                    <v-chip 
                      size="x-small" 
                      variant="flat" 
                      class="font-weight-bold px-1.5 flex-shrink-0" 
                      style="font-size: 0.46rem; height: 16px; border-radius: 3px;"
                      :color="block.complessita === 1 ? 'red-darken-3' : block.complessita === 2 ? 'amber-darken-3' : block.complessita === 4 ? 'green-darken-3' : 'yellow-darken-3'"
                    >
                      {{ labelComplessita(block.complessita) }}
                    </v-chip>
                    <!-- Selettore Posizione Rapido -->
                    <v-menu location="bottom end">
                      <template v-slot:activator="{ props }">
                        <v-chip
                          v-bind="props"
                          size="x-small"
                          variant="tonal"
                          color="amber-lighten-2"
                          class="cursor-pointer font-weight-bold px-1.5 flex-shrink-0"
                          style="height: 16px; font-size: 0.46rem; border-radius: 3px;"
                          title="Cambia posizione esercizio nella sessione"
                          @click.stop
                        >
                          {{ getPosizioneLabel(getPosizioneRecupero(block.exercise.id)) }} ▾
                        </v-chip>
                      </template>
                      <v-list density="compact" class="card-glass border rounded-xl py-1" style="background: var(--card-bg-dark) !important; min-width: 140px;">
                        <v-list-item density="compact" @click.stop="impostaPosizioneRecupero(block.exercise.id, 'inizio')">
                          <v-list-item-title class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-orange-lighten-2': getPosizioneRecupero(block.exercise.id) === 'inizio' }">
                            <v-icon size="14" class="mr-1.5" color="orange-darken-3">mdi-arrow-up-bold-box-outline</v-icon>
                            🔝 Inizio
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item density="compact" @click.stop="impostaPosizioneRecupero(block.exercise.id, 'strategica')">
                          <v-list-item-title class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-orange-lighten-2': getPosizioneRecupero(block.exercise.id) === 'strategica' }">
                            <v-icon size="14" class="mr-1.5" color="orange-darken-3">mdi-brain</v-icon>
                            🧠 Punto Strategico
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item density="compact" @click.stop="impostaPosizioneRecupero(block.exercise.id, 'fine')">
                          <v-list-item-title class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-orange-lighten-2': getPosizioneRecupero(block.exercise.id) === 'fine' }">
                            <v-icon size="14" class="mr-1.5" color="orange-darken-3">mdi-arrow-down-bold-box-outline</v-icon>
                            🔚 Fine
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>

                  <!-- Riga Log/Note precedente pulita e formattata -->
                  <div 
                    v-if="block.originalVal && block.originalVal.replace(/\s*\[RECUPERA\]/g, '').replace(/\s*\[RECUPERATO\]/g, '').trim() !== '' && block.originalVal.replace(/\s*\[RECUPERA\]/g, '').replace(/\s*\[RECUPERATO\]/g, '').trim() !== '-'" 
                    class="text-super-caption text-theme-primary text-truncate font-weight-medium mt-0.5" 
                    style="font-size: 0.52rem; opacity: 0.9; padding-right: 64px;"
                  >
                    📝 Nota: "{{ block.originalVal.replace(/\s*\[RECUPERA\]/g, '').replace(/\s*\[RECUPERATO\]/g, '').trim() }}"
                  </div>
                </div>

                <!-- Pulsante Azione Rapido sulla destra -->
                <div class="position-absolute d-flex align-center justify-end" style="right: 6px; top: 50%; transform: translateY(-50%); z-index: 10;">
                  <v-btn
                    color="green-darken-3"
                    size="small"
                    variant="flat"
                    class="font-weight-black text-none text-white rounded-lg px-2.5 shadow-sm"
                    style="height: 24px; font-size: 0.60rem !important;"
                    @click.stop="concludiRecuperoRapido(block)"
                  >
                    <v-icon size="12" class="mr-0.5">mdi-check</v-icon>
                    Fatto
                  </v-btn>
                </div>
              </template>

              <!-- 3. STANDARD -->
              <template v-else>
                <!-- Miniatura 84x84px con badge REC -->
                <div class="d-flex flex-column align-center mr-4 mt-1.5 flex-shrink-0" style="width: 84px; min-width: 84px;">
                  <div class="position-relative" style="width: 84px; height: 84px;">
                    <div
                      class="position-absolute d-flex align-center justify-center font-weight-black text-white"
                      style="top: -6px; left: -6px; min-width: 26px; height: 26px; font-size: 0.76rem; background: var(--theme-primary, #c85a17); z-index: 10; border-radius: 8px; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);"
                    >
                      🔄
                    </div>

                    <div class="rounded-xl overflow-hidden shadow-sm" style="width: 84px; height: 84px; border: 1px solid var(--card-border);">
                      <v-img
                        :src="getGifUrl(block.exercise.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200'"
                        width="84px"
                        height="84px"
                        cover
                        alt="Esercizio"
                        class="bg-grey-lighten-4"
                      >
                        <template v-slot:placeholder>
                          <div class="fill-height d-flex align-center justify-center bg-slate-50">
                            <v-icon color="grey-lighten-1" size="24">mdi-dumbbell</v-icon>
                          </div>
                        </template>
                      </v-img>
                    </div>
                  </div>

                  <v-chip
                    color="orange-darken-3"
                    size="x-small"
                    class="font-weight-black uppercase text-white mt-1.5"
                    variant="flat"
                    style="font-size: 0.58rem; height: 18px; border-radius: 4px; padding: 0 6px; width: 100%; justify-content: center;"
                  >
                    DA G.{{ block.exercise.des_giorno }}
                  </v-chip>
                </div>

                <!-- Dettagli Centrali Standard -->
                <div class="flex-grow-1 text-left min-width-0 position-relative">
                  <!-- Titolo Esercizio Standard -->
                  <div class="d-flex align-center min-width-0 mb-1">
                    <h4 class="font-weight-black leading-tight text-slate-dark text-truncate mr-2 flex-grow-1" style="font-size: 0.88rem !important;">
                      {{ block.exercise.des_esercizio }}
                    </h4>
                  </div>

                  <!-- Settore Muscolare + Target Prescrizione Standard -->
                  <div class="d-flex align-center min-width-0 mb-1.5" style="gap: 8px;">
                    <div v-if="block.exercise.des_settore" class="d-flex align-center text-caption font-weight-bold text-orange-darken-3 flex-shrink-0">
                      <span style="font-size: 0.72rem !important;">{{ block.exercise.des_settore }}</span>
                    </div>
                    <span class="text-caption font-weight-bold text-slate" style="font-size: 0.72rem !important;">
                      🎯 Target: {{ formattaPrescrizioneSemplice(block.prescrizione) }}
                    </span>
                  </div>

                  <!-- Metadata Chips Standard -->
                  <div class="d-flex align-center flex-wrap gap-1.5 mb-1.5">
                    <v-chip color="primary" size="x-small" variant="flat" class="font-weight-black text-white px-2" style="font-size: 0.54rem; height: 18px;">
                      RECUPERO DA G.{{ block.exercise.des_giorno }} • W{{ block.week }}
                    </v-chip>
                    <v-chip 
                      size="x-small" 
                      variant="flat" 
                      class="font-weight-bold px-2" 
                      style="font-size: 0.52rem; height: 17px; border-radius: 4px;"
                      :color="block.complessita === 1 ? 'red-darken-3' : block.complessita === 2 ? 'amber-darken-3' : block.complessita === 4 ? 'green-darken-3' : 'yellow-darken-3'"
                    >
                      {{ labelComplessita(block.complessita) }}
                    </v-chip>
                    <!-- Selettore Posizione Rapido -->
                    <v-menu location="bottom end">
                      <template v-slot:activator="{ props }">
                        <v-chip
                          v-bind="props"
                          size="x-small"
                          variant="tonal"
                          color="amber-lighten-2"
                          class="cursor-pointer font-weight-bold px-2 flex-shrink-0"
                          style="height: 18px; font-size: 0.52rem; border-radius: 4px;"
                          title="Cambia posizione esercizio nella sessione"
                          @click.stop
                        >
                          {{ getPosizioneLabel(getPosizioneRecupero(block.exercise.id)) }} ▾
                        </v-chip>
                      </template>
                      <v-list density="compact" class="card-glass border rounded-xl py-1" style="background: var(--card-bg-dark) !important; min-width: 140px;">
                        <v-list-item density="compact" @click.stop="impostaPosizioneRecupero(block.exercise.id, 'inizio')">
                          <v-list-item-title class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-orange-lighten-2': getPosizioneRecupero(block.exercise.id) === 'inizio' }">
                            <v-icon size="14" class="mr-1.5" color="orange-darken-3">mdi-arrow-up-bold-box-outline</v-icon>
                            🔝 Metti all'Inizio
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item density="compact" @click.stop="impostaPosizioneRecupero(block.exercise.id, 'strategica')">
                          <v-list-item-title class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-orange-lighten-2': getPosizioneRecupero(block.exercise.id) === 'strategica' }">
                            <v-icon size="14" class="mr-1.5" color="orange-darken-3">mdi-brain</v-icon>
                            🧠 Punto Strategico
                          </v-list-item-title>
                        </v-list-item>
                        <v-list-item density="compact" @click.stop="impostaPosizioneRecupero(block.exercise.id, 'fine')">
                          <v-list-item-title class="text-caption font-weight-bold d-flex align-center" :class="{ 'text-orange-lighten-2': getPosizioneRecupero(block.exercise.id) === 'fine' }">
                            <v-icon size="14" class="mr-1.5" color="orange-darken-3">mdi-arrow-down-bold-box-outline</v-icon>
                            🔚 Metti alla Fine
                          </v-list-item-title>
                        </v-list-item>
                      </v-list>
                    </v-menu>
                  </div>

                  <div 
                    v-if="block.originalVal && block.originalVal.replace(/\s*\[RECUPERA\]/g, '').replace(/\s*\[RECUPERATO\]/g, '').trim() !== '' && block.originalVal.replace(/\s*\[RECUPERA\]/g, '').replace(/\s*\[RECUPERATO\]/g, '').trim() !== '-'" 
                    class="text-caption text-theme-primary text-truncate font-weight-medium" 
                    style="font-size: 0.60rem;"
                  >
                    📝 Nota: "{{ block.originalVal.replace(/\s*\[RECUPERA\]/g, '').replace(/\s*\[RECUPERATO\]/g, '').trim() }}"
                  </div>
                </div>

                <!-- Pulsante Fatto Standard -->
                <div class="d-flex align-center justify-end pl-2 flex-shrink-0">
                  <v-btn
                    color="green-darken-3"
                    size="small"
                    variant="flat"
                    class="font-weight-black text-none text-white rounded-lg px-3 shadow-sm"
                    style="height: 28px; font-size: 0.68rem !important;"
                    @click.stop="concludiRecuperoRapido(block)"
                  >
                    <v-icon size="14" class="mr-1">mdi-check</v-icon>
                    Fatto
                  </v-btn>
                </div>
              </template>
            </v-card>
            
            <!-- CASO 1: GRUPPO SUPERSET (SUPERSERIE) -->
            <v-card
              v-else-if="block.type === 'superset'"
              class="superset-group-card border-superset elevation-2 text-left"
              :class="[
                layoutEsercizi === 'super_compatto' ? 'rounded-md pa-1 pl-0 mb-1.5' : (layoutEsercizi === 'compatto' ? 'rounded-lg pa-0 compatto-superset-card mb-2' : 'rounded-3xl pa-4 mb-3'),
                { 'completed': block.exercises.every(ex => ex['ins_week' + settimanaAttivaGiorno] && String(ex['ins_week' + settimanaAttivaGiorno]).trim() !== '') }
              ]"
            >
              <!-- Nascondiamo l'header sia in compatto che in super compatto per risparmiare spazio verticale -->
              <div v-if="layoutEsercizi !== 'compatto' && layoutEsercizi !== 'super_compatto'" class="superset-header d-flex align-center justify-space-between" :class="layoutEsercizi === 'super_compatto' ? 'mb-1 px-1' : 'mb-3'">
                <div class="d-flex align-center flex-wrap gap-1">
                  <v-chip 
                    color="orange-darken-3" 
                    class="font-weight-black text-white px-1.5 py-0" 
                    variant="flat" 
                    size="x-small" 
                    :style="{ 
                      fontSize: layoutEsercizi === 'super_compatto' ? '0.50rem' : '0.64rem', 
                      height: layoutEsercizi === 'super_compatto' ? '14px' : '20px',
                      borderRadius: '3px'
                    }"
                  >
                    ⚡ SS {{ block.letter }}
                  </v-chip>
                  <span v-if="layoutEsercizi !== 'super_compatto'" class="text-caption font-weight-black text-orange-lighten-2" style="font-size: 0.72rem;">
                    Esegui in sequenza senza pausa
                  </span>
                </div>
                <v-chip 
                  v-if="layoutEsercizi !== 'super_compatto'"
                  color="orange-darken-3" 
                  size="x-small" 
                  variant="tonal" 
                  class="font-weight-black px-2 py-0.5" 
                  style="font-size: 0.64rem; height: 20px;"
                >
                  {{ block.exercises.length }} ESERCIZI
                </v-chip>
              </div>
              
              <div class="superset-exercises-wrapper">
                <div
                  v-for="(ex, index) in block.exercises"
                  :key="ex.id"
                  :id="'esercizio-' + ex.id"
                  class="superset-exercise-item position-relative d-flex align-center"
                  :class="[
                    {
                      'border-bottom-soft': index < block.exercises.length - 1,
                      'py-1.5': layoutEsercizi === 'super_compatto',
                      'py-2.5': layoutEsercizi === 'compatto',
                      'py-3': layoutEsercizi === 'standard'
                    },
                    { 'completed': ex['ins_week' + settimanaAttivaGiorno] && String(ex['ins_week' + settimanaAttivaGiorno]).trim() !== '' }
                  ]"
                  @click="vaiAlDettaglio(ex.id)"
                >
                  <!-- Linea di collegamento tratteggiata (mostrata in standard e compatto) -->
                  <div 
                    v-if="index < block.exercises.length - 1 && layoutEsercizi !== 'super_compatto'" 
                    class="superset-connector-line"
                    :style="layoutEsercizi === 'compatto' ? { left: ((dimensioneGifCompatta || 70) / 2 + 14) + 'px' } : {}"
                  ></div>
                  
                  <!-- VISUALIZZAZIONE SUPER COMPATTA (UNICA RIGA) -->
                  <div v-if="layoutEsercizi === 'super_compatto'" class="d-flex align-center w-100 py-1" style="z-index: 2;">
                    <!-- Checkbox (non-clickable in compact layout to avoid accidental clicks) -->
                    <div class="mr-2 flex-shrink-0 d-flex align-center justify-center" style="width: 30px; height: 30px;">
                      <v-icon
                        size="18"
                        :color="haRecupero(ex['ins_week' + settimanaAttivaGiorno]) ? 'red-darken-2' : (ex['ins_week' + settimanaAttivaGiorno] ? 'green-darken-3' : 'grey-darken-3')"
                      >
                        {{ haRecupero(ex['ins_week' + settimanaAttivaGiorno]) ? 'mdi-alert-circle' : (ex['ins_week' + settimanaAttivaGiorno] ? 'mdi-check-circle' : 'mdi-circle-outline') }}
                      </v-icon>
                    </div>
                    
                    <!-- Ordine, Titolo e Settore -->
                    <div class="d-flex flex-column text-left min-width-0 flex-grow-1 mr-2">
                      <div class="d-flex align-center min-width-0">
                        <span class="text-caption font-weight-black text-orange-lighten-1 mr-1.5 flex-shrink-0" style="font-size: 0.75rem !important;">
                          {{ ex.num_riga_giorno }}.
                        </span>
                        <span class="text-caption font-weight-bold text-truncate" :class="haRecupero(ex['ins_week' + settimanaAttivaGiorno]) ? 'text-red-lighten-2' : 'text-slate-dark'" style="font-size: 0.75rem !important; line-height: 1.25;">
                          <span v-if="getTrendFreccia(ex)" :class="getTrendFreccia(ex) === '▲' ? 'text-red-lighten-3' : 'text-blue-lighten-2'" class="font-weight-black mr-0.5">{{ getTrendFreccia(ex) }}</span>
                          {{ ex.des_esercizio }}
                        </span>
                        <v-icon v-if="ex.flg_video === 'true' || ex.flg_video === true" color="orange" size="14" class="ml-1 flex-shrink-0" title="Video richiesto">mdi-video</v-icon>
                      </div>
                      <div class="d-flex align-center flex-wrap gap-1.5 mt-0.5" style="font-size: 0.58rem; line-height: 1;">
                        <span class="text-muted uppercase font-weight-black mr-2">{{ ex.des_settore }}</span>
                        <!-- Prescrizione -->
                        <span 
                          class="text-orange-lighten-3 font-weight-bold d-inline-flex align-center"
                        >
                          {{ formattaPrescrizioneSemplice(ex['des_week' + settimanaAttivaGiorno]) || ex.des_qta_report || 'Prescr.' }}
                        </span>
                      </div>
                    </div>

                    <!-- Action/Logged Weight on the right -->
                    <div class="flex-shrink-0 d-flex align-center">
                      <!-- If completed with weight/reps -->
                      <v-chip 
                        v-if="ex['ins_week' + settimanaAttivaGiorno] && ex['ins_week' + settimanaAttivaGiorno] !== '-'" 
                        size="x-small" 
                        :color="haRecupero(ex['ins_week' + settimanaAttivaGiorno]) ? 'red-darken-2' : 'green-darken-3'" 
                        class="font-weight-black text-white px-2 py-0.5 super-compact-weight-chip" 
                        variant="flat" 
                        style="height: 16px; font-size: 0.52rem; border-radius: 2px;"
                        :title="ex['ins_week' + settimanaAttivaGiorno]"
                      >
                        <span v-if="haRecupero(ex['ins_week' + settimanaAttivaGiorno])">⚠️ RECUPERA</span>
                        <span v-else v-html="formattaInsWeekHtml(ex['ins_week' + settimanaAttivaGiorno])"></span>
                      </v-chip>
                      <!-- If completed with simple check -->
                      <v-chip 
                        v-else-if="ex['ins_week' + settimanaAttivaGiorno] === '-'" 
                        size="x-small" 
                        color="green-darken-3" 
                        class="font-weight-black text-white px-2 py-0.5" 
                        variant="flat" 
                        style="height: 16px; font-size: 0.52rem; border-radius: 2px;"
                      >
                        Fatto ✔️
                      </v-chip>
                      <!-- If not completed, show "+ Registra" -->
                      <v-chip 
                        v-else 
                        size="x-small" 
                        variant="outlined" 
                        color="primary" 
                        class="font-weight-black px-2 py-0.5 text-none theme-registra-chip"
                        style="height: 16px; font-size: 0.52rem; border-radius: 2px;"
                      >
                        + Registra
                      </v-chip>
                      
                              <!-- Trailing Chevron -->
                      <v-icon size="14" color="slate-dark" class="ml-1 opacity-50">mdi-chevron-right</v-icon>
                    </div>
                  </div>

                  <!-- VISUALIZZAZIONE COMPATTA -->
                  <template v-else-if="layoutEsercizi === 'compatto'">
                    <!-- Miniatura GIF/Immagine sulla Sinistra con Badge a cavallo del bordo Foto -->
                    <div class="d-flex flex-column align-center ml-1 mr-3 mt-1 flex-shrink-0" :style="{ width: (dimensioneGifCompatta || 70) + 'px', minWidth: (dimensioneGifCompatta || 70) + 'px' }">
                      <div class="position-relative" :style="{ width: (dimensioneGifCompatta || 70) + 'px', height: (dimensioneGifCompatta || 70) + 'px' }">
                        <!-- Badge Numero: a cavallo dell'angolo in alto a sinistra dell'immagine -->
                        <div
                          class="position-absolute d-flex align-center justify-center font-weight-black text-white"
                          style="top: -6px; left: -6px; min-width: 22px; height: 22px; font-size: 0.68rem; background: var(--brand-accent, #c85a17); z-index: 10; border-radius: 6px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);"
                        >
                          {{ ex.num_riga_giorno }}
                        </div>

                        <div class="rounded-xl overflow-hidden shadow-sm position-relative" :style="{ width: (dimensioneGifCompatta || 70) + 'px', height: (dimensioneGifCompatta || 70) + 'px', border: '1px solid var(--card-border)' }">
                          <v-img
                            :src="getGifUrl(ex.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200'"
                            :width="(dimensioneGifCompatta || 70) + 'px'"
                            :height="(dimensioneGifCompatta || 70) + 'px'"
                            cover
                            alt="Esercizio"
                            class="bg-grey-lighten-4"
                          >
                            <template v-slot:placeholder>
                              <div class="fill-height d-flex align-center justify-center bg-slate-50">
                                <v-icon color="grey-lighten-1" size="18">mdi-dumbbell</v-icon>
                              </div>
                            </template>
                          </v-img>

                          <!-- Badge Timer Recupero: Overlay Elegante in Basso alla GIF -->
                          <div
                            v-if="ex.des_rec_report"
                            class="position-absolute w-100 text-center font-weight-black text-amber-lighten-3 clickable-timer-chip"
                            style="bottom: 0; left: 0; background: rgba(15, 23, 42, 0.85); font-size: 0.52rem; padding: 1.5px 0; z-index: 10; line-height: 1.1; backdrop-filter: blur(2px);"
                            title="Tocca per avviare timer recupero"
                            @click.stop="avviaTimerRecupero(ex.des_rec_report, ex.des_esercizio)"
                          >
                            {{ ex.des_rec_report }}
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Dettagli Centrali Estesi (Occupa tutta la larghezza della card) -->
                    <div class="flex-grow-1 text-left min-width-0 position-relative mt-0.5 pr-1 pb-1" style="z-index: 2;">
                      <!-- Titolo Esercizio (Sfrutta l'intera larghezza in alto a destra) -->
                      <h4 class="font-weight-black leading-tight mb-0.5 pr-0 text-slate-dark text-truncate d-flex align-center" style="font-size: 0.78rem !important; line-height: 1.25 !important;">
                        <span v-if="getTrendFreccia(ex)" :class="getTrendFreccia(ex) === '▲' ? 'text-red-lighten-2' : 'text-blue-lighten-2'" class="font-weight-black mr-1 flex-shrink-0" style="display: inline-block; white-space: nowrap;">{{ getTrendFreccia(ex) }}</span>
                        <span v-if="(ex.flg_ex_mai_fatto === 'false' || ex.flg_ex_mai_fatto === false) && String(ex.num_scheda) !== '1'" class="flex-shrink-0 mr-0.5">✨</span>
                        <span class="text-truncate">{{ ex.des_esercizio || 'Esercizio' }}</span>
                        <v-icon v-if="ex.flg_video === 'true' || ex.flg_video === true" color="orange-darken-3" size="14" class="ml-1 flex-shrink-0" title="Video richiesto">mdi-video</v-icon>
                      </h4>

                      <!-- Settore e Prescrizione Lavoro -->
                      <div class="d-flex align-center min-width-0 mb-1" style="gap: 4px; padding-right: 56px;">
                        <div class="d-flex align-center text-caption font-weight-bold text-orange-darken-3 flex-shrink-0" style="max-width: 92px;">
                          <span class="text-truncate" style="font-size: 0.64rem !important;">{{ ex.des_settore || 'Corpo Libero' }}</span>
                        </div>
                        <div class="text-caption font-weight-bold text-slate text-truncate flex-grow-1 min-width-0" :style="[getLavoroStyle(formattaPrescrizioneSemplice(ex['des_week' + settimanaAttivaGiorno]) || ex.des_qta_report), { fontSize: '0.65rem !important' }]">
                          {{ formattaPrescrizioneSemplice(ex['des_week' + settimanaAttivaGiorno]) || ex.des_qta_report || 'Prescrizione non definita' }}
                        </div>
                      </div>

                      <!-- Cronologia Carichi (W1-W6) per Lungo in Monoriga su Tutta la Larghezza -->
                      <div class="d-flex align-center w-100 mt-1 pt-0.5 border-top-soft mini-weeks-row" style="gap: 1.5px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; padding-right: 4px;">
                        <div
                          v-for="w in [1, 2, 3, 4, 5, 6]"
                          :key="w"
                          class="mini-week-capsule d-inline-flex align-center flex-shrink-0"
                          :class="{
                            'capsule-recupero': haRecupero(ex['ins_week' + w]),
                            'capsule-active': w === settimanaAttivaGiorno && !haRecupero(ex['ins_week' + w]),
                            'capsule-completed': ex['ins_week' + w] && String(ex['ins_week' + w]).trim() && w !== settimanaAttivaGiorno && !haRecupero(ex['ins_week' + w]),
                            'capsule-pending': !(ex['ins_week' + w] && String(ex['ins_week' + w]).trim()) && w !== settimanaAttivaGiorno && !haRecupero(ex['ins_week' + w]),
                            'ml-1': w === 6
                          }"
                          style="font-size: 0.44rem; padding: 1px 2.5px; height: 14px; min-width: 14px; cursor: pointer; border-radius: 3px; letter-spacing: -0.15px;"
                          @click.stop="vaiAlDettaglio(ex.id)"
                        >
                          <span class="capsule-num font-weight-black" style="font-size: 0.42rem;">W{{ w }}</span>
                          <span v-if="ex['ins_week' + w] && String(ex['ins_week' + w]).trim()" class="ml-0.5 font-weight-black" style="font-size: 0.44rem;">
                            {{ formattaCaricoCompatto(ex['ins_week' + w]) }}
                          </span>
                        </div>
                      </div>
                    </div>

                    <!-- Pulsante Azione in Posizionamento Assoluto (Fluttuante a Centro Destra) -->
                    <div class="position-absolute d-flex align-center justify-end" style="right: 4px; top: 50%; transform: translateY(-50%); z-index: 10;">
                      <v-chip 
                        v-if="ex['ins_week' + settimanaAttivaGiorno] && ex['ins_week' + settimanaAttivaGiorno] !== '-'" 
                        size="small" 
                        :color="haRecupero(ex['ins_week' + settimanaAttivaGiorno]) ? 'red-darken-2' : 'green-darken-3'" 
                        class="font-weight-black text-white px-1.5 py-0 shadow-sm" 
                        variant="flat" 
                        style="height: 22px; font-size: 0.60rem; border-radius: 5px;"
                        @click.stop="vaiAlDettaglio(ex.id)"
                      >
                        {{ haRecupero(ex['ins_week' + settimanaAttivaGiorno]) ? '⚠️ RECUPERA' : formattaCaricoCompatto(ex['ins_week' + settimanaAttivaGiorno]) }}
                      </v-chip>
                      <v-chip 
                        v-else-if="ex['ins_week' + settimanaAttivaGiorno] === '-'" 
                        size="small" 
                        color="green-darken-3" 
                        class="font-weight-black text-white px-1.5 py-0 shadow-sm" 
                        variant="flat" 
                        style="height: 22px; font-size: 0.60rem; border-radius: 5px;"
                        @click.stop="vaiAlDettaglio(ex.id)"
                      >
                        ✔️ Fatto
                      </v-chip>
                      <v-chip 
                        v-else 
                        size="small" 
                        variant="outlined" 
                        color="primary" 
                        class="font-weight-black px-1.5 py-0 text-none bg-slate-darken-4 theme-registra-chip"
                        style="height: 22px; font-size: 0.60rem; border-radius: 5px;"
                        @click.stop="vaiAlDettaglio(ex.id)"
                      >
                        + Registra
                      </v-chip>
                    </div>
                  </template>

                  <!-- VISUALIZZAZIONE STANDARD (ORIGINALE) -->
                  <template v-else>
                    <!-- Miniatura GIF/Immagine sulla Sinistra con Badge a cavallo del bordo Foto -->
                    <div class="d-flex flex-column align-center mr-3 mt-1.5" style="width: 84px; min-width: 84px;">
                      <div class="position-relative" style="width: 84px; height: 84px;">
                        <!-- Badge Numero: a cavallo dell'angolo in alto a sinistra dell'immagine -->
                        <div
                          class="position-absolute d-flex align-center justify-center font-weight-black text-white"
                          style="top: -6px; left: -6px; min-width: 26px; height: 26px; font-size: 0.78rem; background: var(--brand-accent, #c85a17); z-index: 10; border-radius: 8px; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);"
                        >
                          {{ ex.num_riga_giorno }}
                        </div>

                        <div class="rounded-xl overflow-hidden shadow-sm" style="width: 84px; height: 84px; border: 1px solid var(--card-border);">
                          <v-img
                            :src="getGifUrl(ex.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200'"
                            width="84px"
                            height="84px"
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
                      </div>

                      <!-- Badge Carico Inserito o Da fare sotto l'immagine -->
                      <v-chip
                        v-if="ex['ins_week' + settimanaAttivaGiorno] && String(ex['ins_week' + settimanaAttivaGiorno]).trim()"
                        :color="haRecupero(ex['ins_week' + settimanaAttivaGiorno]) ? 'red-darken-3' : 'green-darken-3'"
                        size="x-small"
                        class="font-weight-black uppercase text-white animate-pulse"
                        variant="flat"
                        style="font-size: 0.62rem; height: 20px; border-radius: 6px; padding: 0 4px; width: 100%; justify-content: center; cursor: pointer;"
                        @click.stop="segnaComeFattoRapido(ex)"
                      >
                        <span v-if="haRecupero(ex['ins_week' + settimanaAttivaGiorno])">⚠️ RECUPERA</span>
                        <span v-else v-html="'✔️ ' + formattaInsWeekHtml(ex['ins_week' + settimanaAttivaGiorno])"></span>
                      </v-chip>
                      
                      <v-chip
                        v-else
                        color="grey-darken-2"
                        size="x-small"
                        class="font-weight-bold uppercase text-slate"
                        variant="outlined"
                        style="font-size: 0.62rem; height: 20px; border-radius: 6px; padding: 0 4px; border-style: dashed !important; opacity: 0.65; width: 100%; justify-content: center; cursor: pointer;"
                        @click.stop="segnaComeFattoRapido(ex)"
                      >
                        ❌ DA FARE
                      </v-chip>
                    </div>

                    <!-- Dettagli Centrali -->
                    <div class="flex-grow-1 text-left min-width-0 position-relative" style="z-index: 2;">
                      <!-- Titolo Esercizio -->
                      <h4 class="font-weight-black leading-tight mb-1 text-body-1" :class="haRecupero(ex['ins_week' + settimanaAttivaGiorno]) ? 'text-red-lighten-2' : 'text-slate-dark'" style="white-space: normal; word-break: break-word;">
                        <span v-if="getTrendFreccia(ex)" :class="getTrendFreccia(ex) === '▲' ? 'text-red-lighten-3' : 'text-blue-lighten-2'" class="font-weight-black mr-0.5" style="display: inline; white-space: nowrap;">{{ getTrendFreccia(ex) }}</span>
                        {{ (ex.flg_ex_mai_fatto === 'false' || ex.flg_ex_mai_fatto === false) && String(ex.num_scheda) !== '1' ? '✨' : '' }}
                        {{ ex.des_esercizio || 'Esercizio' }}
                        <v-icon v-if="ex.flg_video === 'true' || ex.flg_video === true" color="orange" size="16" class="ml-1.5" title="Video richiesto">mdi-video</v-icon>
                      </h4>

                      <!-- Settore e Gradimento Esercizio -->
                      <div class="d-flex align-center justify-space-between text-caption font-weight-bold text-orange-darken-3 mb-1">
                        <span>{{ ex.des_settore || 'Corpo Libero' }}</span>
                        <v-chip
                          size="x-small"
                          :color="ex.ind_reps_start ? 'amber-darken-3' : 'grey-darken-3'"
                          :variant="ex.ind_reps_start ? 'flat' : 'outlined'"
                          class="font-weight-black text-white px-1.5 cursor-pointer"
                          style="height: 16px; font-size: 0.52rem; border-radius: 3px;"
                          @click.stop="apriDialogGradimenti('tutti')"
                          title="Gradimento esercizio (Tocca per gestire i voti)"
                        >
                          {{ ex.ind_reps_start ? '⭐ ' + ex.ind_reps_start + '/5' : '⭐ Vota' }}
                        </v-chip>
                      </div>

                      <!-- Prescrizione della settimana attiva -->
                      <div class="text-caption font-weight-bold text-slate text-truncate mb-1" :style="getLavoroStyle(formattaPrescrizioneSemplice(ex['des_week' + settimanaAttivaGiorno]) || ex.des_qta_report)">
                        {{ formattaPrescrizioneSemplice(ex['des_week' + settimanaAttivaGiorno]) || ex.des_qta_report || 'Prescrizione non definita' }}
                      </div>

                      <!-- Cronologia Carichi Settimanali -->
                      <div class="d-flex align-center flex-wrap gap-1 mt-1 pt-1 border-top-soft w-100">
                        <div class="d-flex gap-1 align-center flex-wrap">
                          <div
                            v-for="w in [1, 2, 3, 4, 5, 6]"
                            :key="w"
                            class="mini-week-capsule d-inline-flex align-center"
                            :class="{
                              'capsule-recupero': haRecupero(ex['ins_week' + w]),
                              'capsule-active': w === settimanaAttivaGiorno && !haRecupero(ex['ins_week' + w]),
                              'capsule-completed': ex['ins_week' + w] && String(ex['ins_week' + w]).trim() && w !== settimanaAttivaGiorno && !haRecupero(ex['ins_week' + w]),
                              'capsule-pending': !(ex['ins_week' + w] && String(ex['ins_week' + w]).trim()) && w !== settimanaAttivaGiorno && !haRecupero(ex['ins_week' + w]),
                              'ml-2': w === 6
                            }"
                            style="font-size: 0.55rem; padding: 1px 4px; height: 16px; min-width: 32px; cursor: pointer;"
                            @click.stop="selezionaSettimanaManuale(w)"
                          >
                            <span class="capsule-num" style="opacity: 0.85;">W{{ w }}</span>
                            <span class="ml-0.5 font-weight-black" style="font-size: 0.55rem;">
                              {{ formattaCaricoCompatto(ex['ins_week' + w]) }}
                            </span>
                          </div>
                        </div>
                      </div>

                      <!-- Timer Recupero / Chaining Clickable -->
                      <div class="mt-1" v-if="ex.des_rec_report || (ex.alf_superserie && ex.alf_superserie.trim())">
                          <v-chip
                            v-if="ex.des_rec_report"
                            variant="flat"
                            size="x-small"
                            class="font-weight-black clickable-timer-chip"
                            style="font-size: 0.70rem !important; height: 24px; padding-left: 8px; padding-right: 8px;"
                            @click.stop="avviaTimerRecupero(ex.des_rec_report, ex.des_esercizio)"
                          >
                            {{ ex.des_rec_report }}{{ (ex.alf_superserie && ex.alf_superserie.trim()) ? ' (Riposati ora)' : '' }}
                          </v-chip>
                          <v-chip
                            v-else-if="ex.alf_superserie && ex.alf_superserie.trim()"
                            color="green-darken-3"
                            variant="flat"
                            size="x-small"
                            class="font-weight-black text-white"
                            prepend-icon="mdi-arrow-right-bold-circle-outline"
                            style="font-size: 0.64rem; height: 20px;"
                          >
                            ⚡ VAI AL PROSSIMO (NO PAUSA)
                          </v-chip>
                      </div>
                    </div>
                  </template>
                </div>
              </div>
            </v-card>

            <!-- CASO 2: ESERCIZIO STANDARD SINGOLO -->
            <v-card
              v-else
              :id="'esercizio-' + block.exercise.id"
              class="exercise-item-card elevation-1 d-flex align-center"
              :class="[
                layoutEsercizi === 'super_compatto' ? 'rounded-md pa-1.5 mb-1.5' : (layoutEsercizi === 'compatto' ? 'rounded-lg px-3 py-2.5 mb-2' : 'rounded-3xl pa-4 mb-3'),
                { 'completed': block.exercise['ins_week' + settimanaAttivaGiorno] && String(block.exercise['ins_week' + settimanaAttivaGiorno]).trim() !== '' }
              ]"
              @click="vaiAlDettaglio(block.exercise.id)"
            >
              <!-- VISUALIZZAZIONE SUPER COMPATTA (UNICA RIGA) -->
              <template v-if="layoutEsercizi === 'super_compatto'">
                <div class="d-flex align-center w-100 py-1" style="z-index: 2;">
                  <!-- Checkbox (non-clickable in compact layout to avoid accidental clicks) -->
                  <div class="mr-2 flex-shrink-0 d-flex align-center justify-center" style="width: 30px; height: 30px;">
                    <v-icon
                      size="18"
                      :color="haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno]) ? 'red-darken-2' : (block.exercise['ins_week' + settimanaAttivaGiorno] ? 'green-darken-3' : 'grey-darken-3')"
                    >
                      {{ haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno]) ? 'mdi-alert-circle' : (block.exercise['ins_week' + settimanaAttivaGiorno] ? 'mdi-check-circle' : 'mdi-circle-outline') }}
                    </v-icon>
                  </div>
                  
                  <!-- Info Area: Index, Exercise name, muscle group -->
                  <div class="d-flex flex-column text-left min-width-0 flex-grow-1 mr-2">
                    <div class="d-flex align-center min-width-0">
                      <span class="text-caption font-weight-black text-orange-lighten-1 mr-1.5 flex-shrink-0" style="font-size: 0.75rem !important;">
                        {{ block.exercise.num_riga_giorno }}.
                      </span>
                      <span class="text-caption font-weight-bold text-truncate" :class="haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno]) ? 'text-red-lighten-2' : (esisteInSchedaPrecedente(block.exercise) ? 'text-red-lighten-3' : 'text-slate-dark')" style="font-size: 0.75rem !important; line-height: 1.25;">
                        <span v-if="getTrendFreccia(block.exercise)" :class="getTrendFreccia(block.exercise) === '▲' ? 'text-red-lighten-3' : 'text-blue-lighten-2'" class="font-weight-black mr-0.5">{{ getTrendFreccia(block.exercise) }}</span>
                        {{ block.exercise.des_esercizio }}
                      </span>
                      <v-icon v-if="block.exercise.flg_video === 'true' || block.exercise.flg_video === true" color="orange" size="14" class="ml-1 flex-shrink-0" title="Video richiesto">mdi-video</v-icon>
                    </div>
                    <div class="d-flex align-center flex-wrap gap-1.5 mt-0.5" style="font-size: 0.58rem; line-height: 1;">
                      <span class="text-muted uppercase font-weight-black mr-2">{{ block.exercise.des_settore }}</span>
                      <!-- Prescrizione -->
                      <span 
                        class="text-orange-lighten-3 font-weight-bold d-inline-flex align-center"
                      >
                        {{ formattaPrescrizioneSemplice(block.exercise['des_week' + settimanaAttivaGiorno]) || block.exercise.des_qta_report || 'Prescr.' }}
                      </span>
                    </div>
                  </div>

                  <!-- Action/Logged Weight on the right -->
                  <div class="flex-shrink-0 d-flex align-center">
                    <!-- If completed with weight/reps -->
                    <v-chip 
                      v-if="block.exercise['ins_week' + settimanaAttivaGiorno] && block.exercise['ins_week' + settimanaAttivaGiorno] !== '-'" 
                      size="x-small" 
                      :color="haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno]) ? 'red-darken-2' : 'green-darken-3'" 
                      class="font-weight-black text-white px-2 py-0.5 super-compact-weight-chip" 
                      variant="flat" 
                      style="height: 16px; font-size: 0.52rem; border-radius: 2px;"
                      :title="block.exercise['ins_week' + settimanaAttivaGiorno]"
                    >
                      <span v-if="haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno])">⚠️ RECUPERA</span>
                      <span v-else v-html="formattaInsWeekHtml(block.exercise['ins_week' + settimanaAttivaGiorno])"></span>
                    </v-chip>
                    <!-- If completed with simple check -->
                    <v-chip 
                      v-else-if="block.exercise['ins_week' + settimanaAttivaGiorno] === '-'" 
                      size="x-small" 
                      color="green-darken-3" 
                      class="font-weight-black text-white px-2 py-0.5" 
                      variant="flat" 
                      style="height: 16px; font-size: 0.52rem; border-radius: 2px;"
                    >
                      Fatto ✔️
                    </v-chip>
                    <!-- If not completed, show "+ Registra" -->
                    <v-chip 
                      v-else 
                      size="x-small" 
                      variant="outlined" 
                      color="primary" 
                      class="font-weight-black px-2 py-0.5 text-none theme-registra-chip"
                      style="height: 16px; font-size: 0.52rem; border-radius: 2px;"
                    >
                      + Registra
                    </v-chip>
                    
                    <!-- Trailing Chevron -->
                    <v-icon size="14" color="slate-dark" class="ml-1 opacity-50">mdi-chevron-right</v-icon>
                  </div>
                </div>
              </template>

              <!-- VISUALIZZAZIONE COMPATTA -->
              <template v-else-if="layoutEsercizi === 'compatto'">
                <!-- Miniatura GIF/Immagine sulla Sinistra con Badge a cavallo del bordo Foto -->
                <div class="d-flex flex-column align-center ml-1 mr-3 mt-1 flex-shrink-0" :style="{ width: (dimensioneGifCompatta || 70) + 'px', minWidth: (dimensioneGifCompatta || 70) + 'px' }">
                  <div class="position-relative" :style="{ width: (dimensioneGifCompatta || 70) + 'px', height: (dimensioneGifCompatta || 70) + 'px' }">
                    <!-- Badge Numero: a cavallo dell'angolo in alto a sinistra dell'immagine -->
                    <div
                      class="position-absolute d-flex align-center justify-center font-weight-black text-white"
                      style="top: -6px; left: -6px; min-width: 22px; height: 22px; font-size: 0.68rem; background: var(--brand-accent, #c85a17); z-index: 10; border-radius: 6px; box-shadow: 0 2px 6px rgba(0, 0, 0, 0.25);"
                    >
                      {{ block.exercise.num_riga_giorno }}
                    </div>

                    <div class="rounded-xl overflow-hidden shadow-sm position-relative" :style="{ width: (dimensioneGifCompatta || 70) + 'px', height: (dimensioneGifCompatta || 70) + 'px', border: '1px solid var(--card-border)' }">
                      <v-img
                        :src="getGifUrl(block.exercise.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200'"
                        :width="(dimensioneGifCompatta || 70) + 'px'"
                        :height="(dimensioneGifCompatta || 70) + 'px'"
                        cover
                        alt="Esercizio"
                        class="bg-grey-lighten-4"
                      >
                        <template v-slot:placeholder>
                          <div class="fill-height d-flex align-center justify-center bg-slate-50">
                            <v-icon color="grey-lighten-1" size="18">mdi-dumbbell</v-icon>
                          </div>
                        </template>
                      </v-img>

                      <!-- Badge Timer Recupero: Overlay Elegante in Basso alla GIF -->
                      <div
                        v-if="block.exercise.des_rec_report"
                        class="position-absolute w-100 text-center font-weight-black text-amber-lighten-3 clickable-timer-chip"
                        style="bottom: 0; left: 0; background: rgba(15, 23, 42, 0.85); font-size: 0.52rem; padding: 1.5px 0; z-index: 10; line-height: 1.1; backdrop-filter: blur(2px);"
                        title="Tocca per avviare timer recupero"
                        @click.stop="avviaTimerRecupero(block.exercise.des_rec_report, block.exercise.des_esercizio)"
                      >
                        {{ block.exercise.des_rec_report }}
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Dettagli Centrali Estesi (Occupa tutta la larghezza della card) -->
                <div class="flex-grow-1 text-left min-width-0 position-relative mt-0.5 pr-1 pb-1" style="z-index: 2;">
                  <!-- Titolo Esercizio (Sfrutta l'intera larghezza in alto a destra) -->
                  <h4 class="font-weight-black leading-tight mb-0.5 pr-0 text-slate-dark text-truncate d-flex align-center" style="font-size: 0.78rem !important; line-height: 1.25 !important;">
                    <span v-if="getTrendFreccia(block.exercise)" :class="getTrendFreccia(block.exercise) === '▲' ? 'text-red-lighten-2' : 'text-blue-lighten-2'" class="font-weight-black mr-1 flex-shrink-0" style="display: inline-block; white-space: nowrap;">{{ getTrendFreccia(block.exercise) }}</span>
                    <span v-if="(block.exercise.flg_ex_mai_fatto === 'false' || block.exercise.flg_ex_mai_fatto === false) && String(block.exercise.num_scheda) !== '1'" class="flex-shrink-0 mr-0.5">✨</span>
                    <span class="text-truncate">{{ block.exercise.des_esercizio || 'Esercizio' }}</span>
                    <v-icon v-if="block.exercise.flg_video === 'true' || block.exercise.flg_video === true" color="orange-darken-3" size="14" class="ml-1 flex-shrink-0" title="Video richiesto">mdi-video</v-icon>
                  </h4>

                  <!-- Settore e Prescrizione Lavoro -->
                  <div class="d-flex align-center min-width-0 mb-1" style="gap: 4px; padding-right: 56px;">
                    <div class="d-flex align-center text-caption font-weight-bold text-orange-darken-3 flex-shrink-0" style="max-width: 92px;">
                      <span class="text-truncate" style="font-size: 0.64rem !important;">{{ block.exercise.des_settore || 'Corpo Libero' }}</span>
                    </div>
                    <div class="text-caption font-weight-bold text-slate text-truncate flex-grow-1 min-width-0" :style="[getLavoroStyle(formattaPrescrizioneSemplice(block.exercise['des_week' + settimanaAttivaGiorno]) || block.exercise.des_qta_report), { fontSize: '0.65rem !important' }]">
                      {{ formattaPrescrizioneSemplice(block.exercise['des_week' + settimanaAttivaGiorno]) || block.exercise.des_qta_report || 'Prescrizione non definita' }}
                    </div>
                  </div>

                  <!-- Cronologia Carichi (W1-W6) per Lungo in Monoriga su Tutta la Larghezza -->
                  <div class="d-flex align-center w-100 mt-1 pt-0.5 border-top-soft mini-weeks-row" style="gap: 1.5px; overflow-x: auto; scrollbar-width: none; -ms-overflow-style: none; -webkit-overflow-scrolling: touch; padding-right: 4px;">
                    <div
                      v-for="w in [1, 2, 3, 4, 5, 6]"
                      :key="w"
                      class="mini-week-capsule d-inline-flex align-center flex-shrink-0"
                      :class="{
                        'capsule-recupero': haRecupero(block.exercise['ins_week' + w]),
                        'capsule-active': w === settimanaAttivaGiorno && !haRecupero(block.exercise['ins_week' + w]),
                        'capsule-completed': block.exercise['ins_week' + w] && String(block.exercise['ins_week' + w]).trim() && w !== settimanaAttivaGiorno && !haRecupero(block.exercise['ins_week' + w]),
                        'capsule-pending': !(block.exercise['ins_week' + w] && String(block.exercise['ins_week' + w]).trim()) && w !== settimanaAttivaGiorno && !haRecupero(block.exercise['ins_week' + w]),
                        'ml-1': w === 6
                      }"
                      style="font-size: 0.44rem; padding: 1px 2.5px; height: 14px; min-width: 14px; cursor: pointer; border-radius: 3px; letter-spacing: -0.15px;"
                      @click.stop="vaiAlDettaglio(block.exercise.id)"
                    >
                      <span class="capsule-num font-weight-black" style="font-size: 0.42rem;">W{{ w }}</span>
                      <span v-if="block.exercise['ins_week' + w] && String(block.exercise['ins_week' + w]).trim()" class="ml-0.5 font-weight-black" style="font-size: 0.44rem;">
                        {{ formattaCaricoCompatto(block.exercise['ins_week' + w]) }}
                      </span>
                    </div>
                  </div>
                </div>

                <!-- Pulsante Azione in Posizionamento Assoluto (Fluttuante a Centro Destra) -->
                <div class="position-absolute d-flex align-center justify-end" style="right: 4px; top: 50%; transform: translateY(-50%); z-index: 10;">
                  <v-chip 
                    v-if="block.exercise['ins_week' + settimanaAttivaGiorno] && block.exercise['ins_week' + settimanaAttivaGiorno] !== '-'" 
                    size="small" 
                    :color="haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno]) ? 'red-darken-2' : 'green-darken-3'" 
                    class="font-weight-black text-white px-1.5 py-0 shadow-sm" 
                    variant="flat" 
                    style="height: 22px; font-size: 0.60rem; border-radius: 5px;"
                    @click.stop="vaiAlDettaglio(block.exercise.id)"
                  >
                    {{ haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno]) ? '⚠️ RECUPERA' : formattaCaricoCompatto(block.exercise['ins_week' + settimanaAttivaGiorno]) }}
                  </v-chip>
                  <v-chip 
                    v-else-if="block.exercise['ins_week' + settimanaAttivaGiorno] === '-'" 
                    size="small" 
                    color="green-darken-3" 
                    class="font-weight-black text-white px-1.5 py-0 shadow-sm" 
                    variant="flat" 
                    style="height: 22px; font-size: 0.60rem; border-radius: 5px;"
                    @click.stop="vaiAlDettaglio(block.exercise.id)"
                  >
                    ✔️ Fatto
                  </v-chip>
                  <v-chip 
                    v-else 
                    size="small" 
                    variant="outlined" 
                    color="primary" 
                    class="font-weight-black px-1.5 py-0 text-none bg-slate-darken-4 theme-registra-chip"
                    style="height: 22px; font-size: 0.60rem; border-radius: 5px;"
                    @click.stop="vaiAlDettaglio(block.exercise.id)"
                  >
                    + Registra
                  </v-chip>
                </div>
              </template>

              <!-- VISUALIZZAZIONE STANDARD (ORIGINALE) -->
              <template v-else>
                <!-- Miniatura GIF/Immagine sulla Sinistra con Badge a cavallo del bordo Foto -->
                <div class="d-flex flex-column align-center mr-4 mt-1.5" style="width: 84px; min-width: 84px;">
                  <div class="position-relative" style="width: 84px; height: 84px;">
                    <!-- Badge Numero: a cavallo dell'angolo in alto a sinistra dell'immagine -->
                    <div
                      class="position-absolute d-flex align-center justify-center font-weight-black text-white"
                      style="top: -6px; left: -6px; min-width: 26px; height: 26px; font-size: 0.78rem; background: var(--brand-accent, #c85a17); z-index: 10; border-radius: 8px; box-shadow: 0 3px 8px rgba(0, 0, 0, 0.25);"
                    >
                      {{ block.exercise.num_riga_giorno }}
                    </div>

                    <div class="rounded-xl overflow-hidden shadow-sm" style="width: 84px; height: 84px; border: 1px solid var(--card-border);">
                      <v-img
                        :src="getGifUrl(block.exercise.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=200'"
                        width="84px"
                        height="84px"
                        cover
                        alt="Esercizio"
                        class="bg-grey-lighten-4"
                      >
                        <template v-slot:placeholder>
                          <div class="fill-height d-flex align-center justify-center bg-slate-50">
                            <v-icon color="grey-lighten-1" size="24">mdi-dumbbell</v-icon>
                          </div>
                        </template>
                      </v-img>
                    </div>
                  </div>

                  <!-- Badge Carico Inserito o Da fare sotto l'immagine -->
                  <v-chip
                    v-if="block.exercise['ins_week' + settimanaAttivaGiorno] && String(block.exercise['ins_week' + settimanaAttivaGiorno]).trim()"
                    :color="haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno]) ? 'red-darken-3' : 'green-darken-3'"
                    size="x-small"
                    class="font-weight-black uppercase text-white animate-pulse"
                    variant="flat"
                    style="font-size: 0.62rem; height: 20px; border-radius: 6px; padding: 0 4px; width: 100%; justify-content: center; cursor: pointer;"
                    @click.stop="segnaComeFattoRapido(block.exercise)"
                  >
                    <span v-if="haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno])">⚠️ RECUPERA</span>
                    <span v-else v-html="'✔️ ' + formattaInsWeekHtml(block.exercise['ins_week' + settimanaAttivaGiorno])"></span>
                  </v-chip>
                  
                  <v-chip
                    v-else
                    color="grey-darken-2"
                    size="x-small"
                    class="font-weight-bold uppercase text-slate"
                    variant="outlined"
                    style="font-size: 0.62rem; height: 20px; border-radius: 6px; padding: 0 4px; border-style: dashed !important; opacity: 0.65; width: 100%; justify-content: center; cursor: pointer;"
                    @click.stop="segnaComeFattoRapido(block.exercise)"
                  >
                    ❌ DA FARE
                  </v-chip>
                </div>

                <!-- Dettagli Centrali -->
                <div class="flex-grow-1 text-left min-width-0">
                  <!-- Titolo Esercizio -->
                  <h4 class="font-weight-black leading-tight mb-1 text-body-1" :class="haRecupero(block.exercise['ins_week' + settimanaAttivaGiorno]) ? 'text-red-lighten-2' : 'text-slate-dark'" style="white-space: normal; word-break: break-word;">
                    <span v-if="getTrendFreccia(block.exercise)" :class="getTrendFreccia(block.exercise) === '▲' ? 'text-red-lighten-3' : 'text-blue-lighten-2'" class="font-weight-black mr-0.5" style="display: inline; white-space: nowrap;">{{ getTrendFreccia(block.exercise) }}</span>
                    {{ (block.exercise.flg_ex_mai_fatto === 'false' || block.exercise.flg_ex_mai_fatto === false) && String(block.exercise.num_scheda) !== '1' ? '✨' : '' }}
                    {{ block.exercise.des_esercizio || 'Esercizio' }}
                    <v-icon v-if="block.exercise.flg_video === 'true' || block.exercise.flg_video === true" color="orange" size="16" class="ml-1.5" title="Video richiesto">mdi-video</v-icon>
                    <v-chip
                      v-if="settimanaAttivaGiorno === 1 && stalloInSchedaPrecedente(block.exercise)"
                      color="deep-orange-darken-3"
                      size="x-small"
                      variant="flat"
                      class="font-weight-black text-white ml-2 animate-pulse cursor-pointer d-inline-flex align-center"
                      style="font-size: 0.60rem; height: 18px; border-radius: 4px; vertical-align: middle;"
                      @click.stop="apriInfoStallo(block.exercise)"
                    >
                      ⚠️ COACH: STALLO
                    </v-chip>
                  </h4>

                  <!-- Settore e Gradimento Esercizio -->
                  <div class="d-flex align-center justify-space-between text-caption font-weight-bold text-orange-darken-3 mb-1">
                    <span>{{ block.exercise.des_settore || 'Corpo Libero' }}</span>
                    <v-chip
                      size="x-small"
                      :color="block.exercise.ind_reps_start ? 'amber-darken-3' : 'grey-darken-3'"
                      :variant="block.exercise.ind_reps_start ? 'flat' : 'outlined'"
                      class="font-weight-black text-white px-1.5 cursor-pointer"
                      style="height: 16px; font-size: 0.52rem; border-radius: 3px;"
                      @click.stop="apriDialogGradimenti('tutti')"
                      title="Gradimento esercizio (Tocca per gestire i voti)"
                    >
                      {{ block.exercise.ind_reps_start ? '⭐ ' + block.exercise.ind_reps_start + '/5' : '⭐ Vota' }}
                    </v-chip>
                  </div>

                  <!-- Prescrizione della settimana attiva -->
                  <div class="text-caption font-weight-bold text-slate text-truncate mb-1" :style="getLavoroStyle(formattaPrescrizioneSemplice(block.exercise['des_week' + settimanaAttivaGiorno]) || block.exercise.des_qta_report)">
                    {{ formattaPrescrizioneSemplice(block.exercise['des_week' + settimanaAttivaGiorno]) || block.exercise.des_qta_report || 'Prescrizione non definita' }}
                  </div>

                  <!-- Cronologia Carichi Settimanali -->
                  <div class="d-flex align-center flex-wrap gap-1 mt-1 pt-1 border-top-soft w-100">
                    <div class="d-flex gap-1 align-center flex-wrap">
                      <div
                        v-for="w in [1, 2, 3, 4, 5, 6]"
                        :key="w"
                        class="mini-week-capsule d-inline-flex align-center"
                        :class="{
                          'capsule-recupero': haRecupero(block.exercise['ins_week' + w]),
                          'capsule-active': w === settimanaAttivaGiorno && !haRecupero(block.exercise['ins_week' + w]),
                          'capsule-completed': block.exercise['ins_week' + w] && String(block.exercise['ins_week' + w]).trim() && w !== settimanaAttivaGiorno && !haRecupero(block.exercise['ins_week' + w]),
                          'capsule-pending': !(block.exercise['ins_week' + w] && String(block.exercise['ins_week' + w]).trim()) && w !== settimanaAttivaGiorno && !haRecupero(block.exercise['ins_week' + w]),
                          'ml-2': w === 6
                        }"
                        style="font-size: 0.55rem; padding: 1px 4px; height: 16px; min-width: 32px; cursor: pointer;"
                        @click.stop="selezionaSettimanaManuale(w)"
                      >
                        <span class="capsule-num" style="opacity: 0.85;">W{{ w }}</span>
                        <span class="ml-0.5 font-weight-black" style="font-size: 0.55rem;">
                          {{ formattaCaricoCompatto(block.exercise['ins_week' + w]) }}
                        </span>
                      </div>
                    </div>
                  </div>

                  <!-- Timer Recupero Clickable -->
                  <div v-if="block.exercise.des_rec_report" class="mt-1">
                    <v-chip
                      variant="flat"
                      size="x-small"
                      class="font-weight-black clickable-timer-chip"
                      style="font-size: 0.68rem !important; height: 22px; padding-left: 8px; padding-right: 8px;"
                      @click.stop="avviaTimerRecupero(block.exercise.des_rec_report, block.exercise.des_esercizio)"
                    >
                      {{ block.exercise.des_rec_report }}
                    </v-chip>
                  </div>
                </div>
              </template>
            </v-card>

          </template>

          <!-- Grande pulsante di completamento giorno in fondo alla lista -->
          <div 
            :class="layoutEsercizi === 'super_compatto' ? 'mt-2 mb-2 px-1' : (layoutEsercizi === 'compatto' ? 'mt-2.5 mb-2.5 px-1' : 'mt-4 mb-4 px-1')"
          >
            <v-btn
              v-if="headerGiorno"
              block
              :size="layoutEsercizi === 'super_compatto' ? 'small' : (layoutEsercizi === 'compatto' ? 'default' : 'large')"
              class="font-weight-black text-none elevation-2"
              :class="[
                layoutEsercizi === 'super_compatto' ? 'rounded-lg' : 'rounded-xl',
                { 'glowing-pulse-btn': mostraPromemoriaChiusura }
              ]"
              :color="isCmpTrue(headerGiorno['cmp' + settimanaAttivaGiorno]) ? 'green-darken-3' : 'orange-darken-3'"
              :style="{
                height: layoutEsercizi === 'super_compatto' ? '36px' : (layoutEsercizi === 'compatto' ? '42px' : '48px'),
                fontSize: layoutEsercizi === 'super_compatto' ? '0.75rem' : (layoutEsercizi === 'compatto' ? '0.82rem' : '0.9rem')
              }"
              @click.stop="toggleGiornoAttivoRapido"
              id="btn-completa-giorno"
            >
              <v-icon 
                class="mr-2" 
                :size="layoutEsercizi === 'super_compatto' ? 14 : (layoutEsercizi === 'compatto' ? 16 : 20)"
              >
                {{ isCmpTrue(headerGiorno['cmp' + settimanaAttivaGiorno]) ? 'mdi-check-circle' : 'mdi-check-all' }}
              </v-icon>
              {{ isCmpTrue(headerGiorno['cmp' + settimanaAttivaGiorno]) ? 'Giorno Completato (Riapri W' + settimanaAttivaGiorno + ')' : 'Completa Giorno ' + giornoSelezionato + ' (W' + settimanaAttivaGiorno + ')' }}
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
                  <span>W1: <strong>{{ p.w1 }}{{ p.isRep ? 'r' : ' kg' }}</strong></span>
                  <v-icon size="12" class="mx-1" color="orange">mdi-arrow-right</v-icon>
                  <span>W{{ p.latestWeek }}: <strong>{{ p.latest }}{{ p.isRep ? 'r' : ' kg' }}</strong></span>
                </div>
                <div class="text-super-caption text-green-accent-4 font-weight-black" style="font-size: 0.68rem;">
                  +{{ p.delta }}{{ p.isRep ? 'r' : ' kg' }}
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

    <!-- Dialog Gestione Rapida Gradimenti Esercizi (1-5) -->
    <v-dialog 
      v-model="dialogGradimenti" 
      max-width="620" 
      scrollable
      transition="dialog-bottom-transition"
    >
      <v-card 
        class="card-glass-dark rounded-2xl overflow-hidden text-left" 
        style="backdrop-filter: blur(25px); background: #0b0f19 !important; border: 1px solid rgba(255, 255, 255, 0.12) !important;"
      >
        <!-- Header Dialog -->
        <v-card-title class="pa-4 pb-3 border-bottom d-flex align-center justify-space-between bg-slate-900">
          <div class="d-flex align-center gap-2.5">
            <v-avatar color="amber-darken-3" size="32" class="elevation-2">
              <v-icon size="18" color="white">mdi-star</v-icon>
            </v-avatar>
            <div>
              <span class="text-subtitle-1 font-weight-black text-white d-block leading-tight">Gradimenti Esercizi</span>
              <span class="text-super-caption text-amber-lighten-2 font-weight-bold" style="font-size: 0.68rem;">
                Scheda {{ schedaSelezionata || '' }} • Assegna rapidamente un voto da 1 a 5
              </span>
            </div>
          </div>
          <v-btn icon variant="text" width="32" height="32" color="grey-lighten-1" @click="dialogGradimenti = false">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Body con Barra di Progresso, Statistiche e Filtri -->
        <v-card-text class="pa-3 pa-sm-4" style="max-height: 72vh;">
          
          <!-- Banner Statistiche Gradimenti -->
          <div class="metric-pill metric-pill-box pa-3 rounded-xl mb-3 text-left border-soft" style="background: rgba(15, 23, 42, 0.85);">
            <div class="d-flex align-center justify-space-between mb-1.5 flex-wrap gap-1">
              <span class="text-super-caption text-muted font-weight-black uppercase" style="font-size: 0.62rem;">
                Progresso Voti Mesociclo
              </span>
              <div class="d-flex align-center gap-2">
                <span class="text-caption font-weight-black text-amber-lighten-2">
                  ⭐ {{ mediaGradimenti > 0 ? mediaGradimenti + '/5' : '-' }} media
                </span>
                <v-chip 
                  size="x-small" 
                  :color="eserciziSenzaGradimento.length === 0 ? 'green-darken-3' : 'amber-darken-4'" 
                  class="font-weight-black text-white px-2 py-0" 
                  variant="flat"
                  style="font-size: 0.58rem; height: 18px;"
                >
                  {{ eserciziSenzaGradimento.length === 0 ? 'Tutti Votati 🎉' : eserciziSenzaGradimento.length + ' Mancanti ⚠️' }}
                </v-chip>
              </div>
            </div>

            <v-progress-linear
              :model-value="percentualeVotati"
              color="amber-darken-2"
              height="7"
              rounded
              striped
              class="mb-2"
            ></v-progress-linear>

            <div class="d-flex align-center justify-space-between text-super-caption text-slate font-weight-medium" style="font-size: 0.65rem;">
              <span><strong>{{ eserciziConGradimento.length }}</strong> su <strong>{{ tuttiEserciziMesociclo.length }}</strong> esercizi valutati</span>
              <span class="font-weight-black text-amber-lighten-2">{{ percentualeVotati }}%</span>
            </div>
          </div>

          <!-- Filtri e Ricerca -->
          <div class="d-flex flex-column gap-2 mb-3">
            <!-- Barra di ricerca rapida -->
            <v-text-field
              v-model="ricercaGradimenti"
              placeholder="Filtra per nome esercizio o settore..."
              variant="outlined"
              density="compact"
              hide-details
              clearable
              color="amber-darken-2"
              prepend-inner-icon="mdi-magnify"
              class="rounded-xl"
            ></v-text-field>

            <!-- Chip Filtri -->
            <div class="d-flex align-center gap-1.5 overflow-x-auto pb-1 no-scrollbar flex-wrap">
              <v-chip
                size="small"
                variant="flat"
                class="font-weight-black cursor-pointer"
                :color="filtroGradimenti === 'tutti' ? 'amber-darken-3' : 'rgba(255, 255, 255, 0.08)'"
                :class="filtroGradimenti === 'tutti' ? 'text-white' : 'text-slate-dark'"
                style="font-size: 0.68rem; height: 26px;"
                @click="filtroGradimenti = 'tutti'"
              >
                Tutti ({{ tuttiEserciziMesociclo.length }})
              </v-chip>

              <v-chip
                size="small"
                variant="flat"
                class="font-weight-black cursor-pointer"
                :color="filtroGradimenti === 'mancanti' ? 'red-darken-3' : 'rgba(255, 255, 255, 0.08)'"
                :class="filtroGradimenti === 'mancanti' ? 'text-white' : (eserciziSenzaGradimento.length > 0 ? 'text-red-lighten-3' : 'text-slate-dark')"
                style="font-size: 0.68rem; height: 26px;"
                @click="filtroGradimenti = 'mancanti'"
              >
                <v-icon size="13" class="mr-1" color="red-lighten-2">mdi-alert-circle-outline</v-icon>
                Senza Voto ({{ eserciziSenzaGradimento.length }})
              </v-chip>

              <v-chip
                v-for="g in ['A', 'B', 'C', 'D'].filter(day => conteggioGradimentiPerGiorno[day] && conteggioGradimentiPerGiorno[day].total > 0)"
                :key="g"
                size="small"
                variant="flat"
                class="font-weight-black cursor-pointer"
                :color="filtroGradimenti === g ? 'orange-darken-3' : 'rgba(255, 255, 255, 0.08)'"
                :class="filtroGradimenti === g ? 'text-white' : 'text-slate-dark'"
                style="font-size: 0.68rem; height: 26px;"
                @click="filtroGradimenti = g"
              >
                {{ g }} ({{ conteggioGradimentiPerGiorno[g].voted }}/{{ conteggioGradimentiPerGiorno[g].total }})
              </v-chip>
            </div>
          </div>

          <!-- Lista Esercizi per Gradimento Rapido -->
          <div v-if="eserciziGradimentiFiltrati.length === 0" class="text-center py-8 text-muted card-glass rounded-xl pa-4">
            <template v-if="filtroGradimenti === 'mancanti' && eserciziSenzaGradimento.length === 0">
              <v-icon size="48" color="green-accent-4" class="mb-2 animate-bounce">mdi-check-decagram</v-icon>
              <h4 class="text-subtitle-1 font-weight-black text-green-lighten-2 mb-1">
                Tutti i gradimenti completati!
              </h4>
              <p class="text-caption text-slate font-weight-medium mb-0">
                Hai assegnato un voto di feeling a tutti gli esercizi di questo mesociclo (Media: <strong>{{ mediaGradimenti }}/5 ⭐</strong>).
              </p>
            </template>
            <template v-else>
              <v-icon size="40" color="grey" class="mb-2">mdi-magnify-close</v-icon>
              <p class="text-caption text-slate font-weight-medium mb-0">
                Nessun esercizio trovato con i filtri selezionati.
              </p>
            </template>
          </div>

          <div v-else class="d-flex flex-column">
            <v-card
              v-for="ex in eserciziGradimentiFiltrati"
              :key="ex.id"
              class="quick-rating-card-item pa-2 rounded-xl text-left"
              :class="[
                ex.ind_reps_start && parseInt(ex.ind_reps_start) >= 1 && parseInt(ex.ind_reps_start) <= 5 ? 'is-rated' : 'is-unrated'
              ]"
              flat
            >
              <!-- Riga Intestazione Esercizio: Coordinata (es: C3), Settore, Titolo -->
              <div class="d-flex align-center gap-2 mb-1">
                <!-- Miniatura GIF / Icona compatta -->
                <div 
                  class="rounded-lg overflow-hidden flex-shrink-0 border"
                  style="width: 36px; height: 36px; border-color: rgba(255,255,255,0.1) !important;"
                >
                  <v-img
                    :src="getGifUrl(ex.UrlNormal) || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=100'"
                    width="36px"
                    height="36px"
                    cover
                    class="bg-grey-darken-4"
                  >
                    <template v-slot:placeholder>
                      <div class="fill-height d-flex align-center justify-center bg-slate-900">
                        <v-icon color="grey" size="16">mdi-dumbbell</v-icon>
                      </div>
                    </template>
                  </v-img>
                </div>

                <div class="min-width-0 flex-grow-1">
                  <div class="d-flex align-center">
                    <!-- Coordinata compatta senza G (tipo A1, B2, C3) -->
                    <v-chip
                      size="x-small"
                      color="orange-darken-3"
                      variant="flat"
                      class="font-weight-black text-white px-1.5 mr-2"
                      style="height: 17px; font-size: 0.60rem; border-radius: 4px;"
                    >
                      {{ (ex.des_giorno || '').trim() }}{{ ex.num_riga_giorno }}
                    </v-chip>
                    <span v-if="ex.des_settore" class="text-super-caption font-weight-black text-orange-lighten-2 uppercase text-truncate" style="font-size: 0.60rem;">
                      {{ ex.des_settore }}
                    </span>
                  </div>

                  <h4 
                    class="font-weight-black text-caption text-slate-dark text-truncate" 
                    style="font-size: 0.82rem !important; line-height: 1.15; margin-top: 2px !important; margin-bottom: 0 !important;"
                    :title="ex.des_esercizio"
                  >
                    {{ ex.des_esercizio }}
                  </h4>
                </div>
              </div>

              <!-- Gruppo Pulsanti Gradimento Touch Rapidi (1 a 5 con Emoji) -->
              <div class="quick-rating-btn-group">
                <v-btn
                  v-for="voto in [1, 2, 3, 4, 5]"
                  :key="voto"
                  variant="flat"
                  class="quick-vote-btn"
                  :class="[
                    'quick-vote-btn-' + voto,
                    { 
                      'is-selected': parseInt(ex.ind_reps_start) === voto,
                      ['is-selected-' + voto]: parseInt(ex.ind_reps_start) === voto 
                    }
                  ]"
                  @click.stop="salvaGradimentoRapido(ex, voto)"
                  :id="'btn-gradimento-' + ex.id + '-' + voto"
                  :title="getLabelVoto(voto)"
                >
                  <span v-if="voto === 1">😡 1</span>
                  <span v-else-if="voto === 2">😕 2</span>
                  <span v-else-if="voto === 3">😐 3</span>
                  <span v-else-if="voto === 4">🙂 4</span>
                  <span v-else-if="voto === 5">🤩 5</span>
                </v-btn>
              </div>
            </v-card>
          </div>
        </v-card-text>

        <!-- Footer Dialog -->
        <v-card-actions class="pa-3 border-top d-flex align-center justify-space-between bg-slate-900">
          <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.65rem;">
            Tocca un voto per assegnarlo o rimuoverlo
          </span>
          <v-btn
            color="amber-darken-3"
            variant="flat"
            size="small"
            rounded="lg"
            class="font-weight-black text-none text-white px-4"
            @click="dialogGradimenti = false"
            style="height: 32px; font-size: 0.72rem !important;"
          >
            Fatto
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Proposta Automatica Gradimenti a Fine Mesociclo -->
    <v-dialog v-model="dialogPropostaGradimentiFineMesociclo" max-width="480" persistent>
      <v-card class="card-glass-dark rounded-2xl border pa-5 text-center" style="background: rgba(15, 23, 42, 0.97) !important; border: 1.5px solid rgba(245, 158, 11, 0.4) !important; backdrop-filter: blur(25px) !important; box-shadow: 0 10px 40px rgba(245, 158, 11, 0.2) !important;">
        <div class="d-flex justify-center mb-3">
          <v-avatar color="amber-darken-3" size="56" class="elevation-3 animate-bounce">
            <v-icon size="32" color="white">mdi-trophy-award</v-icon>
          </v-avatar>
        </div>

        <h3 class="text-h6 font-weight-black text-amber-lighten-2 mb-1" style="font-size: 1.15rem !important;">
          🎉 Mesociclo Completato!
        </h3>
        <p class="text-caption text-slate font-weight-bold mb-3" style="color: #e2e8f0 !important; font-size: 0.78rem;">
          Hai chiuso con successo tutte le 6 settimane di allenamento per tutti i giorni della scheda!
        </p>

        <div class="pa-3 rounded-xl mb-4 text-left border" style="background: rgba(245, 158, 11, 0.08); border-color: rgba(245, 158, 11, 0.25) !important;">
          <div class="d-flex align-center gap-2 mb-1">
            <v-icon size="18" color="amber-darken-2">mdi-star-shooting</v-icon>
            <span class="text-caption font-weight-black text-amber-lighten-1" style="font-size: 0.80rem;">
              Inserisci i gradimenti degli esercizi
            </span>
          </div>
          <p class="text-super-caption text-slate mb-0" style="font-size: 0.72rem; line-height: 1.4; color: #cbd5e1 !important;">
            Ci sono ancora <strong class="text-amber-lighten-2">{{ eserciziSenzaGradimento.length }} esercizi</strong> senza voto di feeling. Assegna rapidamente i tuoi gradimenti per inviare al Coach un resoconto completo e ottimizzare la prossima scheda.
          </p>
        </div>

        <div class="d-flex flex-column gap-2">
          <v-btn
            color="amber-darken-3"
            variant="flat"
            rounded="xl"
            class="font-weight-black text-none py-2 text-white shadow-sm"
            height="44"
            @click="chiudiPropostaGradimenti(true)"
            id="btn-proposta-gradimenti-conferma"
          >
            ⭐ Inserisci i {{ eserciziSenzaGradimento.length }} Gradimenti Mancanti
          </v-btn>

          <v-btn
            variant="text"
            color="grey-lighten-1"
            rounded="xl"
            class="font-weight-bold text-none"
            size="small"
            @click="chiudiPropostaGradimenti(false)"
            id="btn-proposta-gradimenti-ignora"
          >
            Concludi comunque / Più tardi
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog di Avviso Esercizi Incompleti al Completamento -->
    <v-dialog v-model="dialogRecuperiAvviso" max-width="450">
      <v-card class="card-glass rounded-2xl border pa-5 text-center" style="background: var(--card-bg-dark) !important; border-color: var(--card-border) !important; backdrop-filter: blur(20px) !important;">
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

    <!-- Dialog Avviso Coach: Stallo dal Mesociclo Precedente -->
    <v-dialog v-model="dialogStalloEsercizio" max-width="480">
      <v-card class="card-glass-dark rounded-2xl border-soft pa-4 text-left" style="background: rgba(15, 23, 42, 0.96) !important; border: 1.5px solid rgba(249, 115, 22, 0.4) !important;">
        <div class="d-flex align-center mb-3">
          <v-avatar color="orange-darken-3" size="40" class="mr-3 text-white elevation-2">
            <v-icon size="24">mdi-alert-decagram</v-icon>
          </v-avatar>
          <div>
            <h3 class="text-subtitle-1 font-weight-black text-white mb-0" style="line-height: 1.2;">
              Avviso Coach: Progressione in Stallo
            </h3>
            <span class="text-caption text-orange-lighten-2 font-weight-black">
              {{ esercizioStalloSelezionato?.des_esercizio }}
            </span>
          </div>
        </div>

        <div class="pa-3 rounded-xl mb-4" style="background: rgba(249, 115, 22, 0.08); border: 1px dashed rgba(249, 115, 22, 0.3);">
          <p class="text-caption text-slate-light mb-0" style="line-height: 1.5; font-size: 0.78rem;">
            📣 <strong>Messaggio del Coach:</strong> Nel mesociclo precedente tra la prima e la sesta settimana non è stata registrata alcuna progressione su questo esercizio. 
            <br/><br/>
            In questa prima settimana del nuovo mesociclo, <strong>prova a segnare almeno un piccolo incremento</strong> (+1 rep o +0.5/1 kg) se possibile! 
          </p>
        </div>

        <div class="d-flex align-center justify-space-between gap-2 flex-wrap">
          <v-btn
            color="orange-darken-3"
            variant="flat"
            rounded="lg"
            class="font-weight-black text-white text-none flex-grow-1"
            size="small"
            @click="dialogStalloEsercizio = false"
          >
            💪 Ho Capito, Ci Provo!
          </v-btn>
          <v-btn
            color="grey-darken-3"
            variant="tonal"
            rounded="lg"
            class="font-weight-bold text-white text-none"
            size="small"
            @click="segnaCaricoLimiteRapido(esercizioStalloSelezionato)"
          >
            🏋️ Carico ancora al limite
          </v-btn>
        </div>
      </v-card>
    </v-dialog>

    <!-- Dialog Ricerca Globale Scheda (Tutti i giorni raggruppati) -->
    <v-dialog v-model="dialogRicercaGlobaleScheda" max-width="600" scrollable>
      <v-card class="card-glass-dark rounded-2xl overflow-hidden text-left" style="backdrop-filter: blur(25px); background: #0b0f19 !important; border: 1px solid rgba(255, 255, 255, 0.12) !important;">
        <v-card-title class="pa-4 pb-3 border-bottom d-flex align-center justify-space-between bg-slate-900">
          <div class="d-flex align-center gap-2.5">
            <v-icon color="orange-lighten-2" size="24">mdi-magnify</v-icon>
            <div>
              <span class="text-subtitle-1 font-weight-black text-white d-block leading-tight">Ricerca Esercizi Scheda</span>
              <span class="text-super-caption text-orange-lighten-2 font-weight-bold" style="font-size: 0.68rem;">
                Filtra tutti gli esercizi della Scheda {{ schedaSelezionata || '' }} (Tutti i Giorni)
              </span>
            </div>
          </div>
          <v-btn icon variant="text" width="32" height="32" color="grey-lighten-1" @click="dialogRicercaGlobaleScheda = false">
            <v-icon size="20">mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <v-card-text class="pa-4 pa-sm-5">
          <!-- Campo di ricerca testo -->
          <v-text-field
            v-model="testoRicercaGlobale"
            placeholder="Cerca esercizio, settore o attrezzo..."
            variant="outlined"
            density="compact"
            hide-details
            clearable
            autofocus
            color="orange-darken-3"
            prepend-inner-icon="mdi-magnify"
            class="mb-3 rounded-xl"
          ></v-text-field>

          <!-- Chip Filtri Settori Muscolari -->
          <div class="d-flex align-center gap-2 overflow-x-auto pb-2 mb-3 no-scrollbar">
            <v-chip
              v-for="settore in filtriSettoriGlobali"
              :key="settore"
              size="x-small"
              variant="flat"
              class="font-weight-black cursor-pointer flex-shrink-0"
              :color="settoreFiltroGlobale === settore ? 'orange-darken-3' : 'rgba(255, 255, 255, 0.08)'"
              :class="settoreFiltroGlobale === settore ? 'text-white' : 'text-slate-dark'"
              style="font-size: 0.68rem; height: 24px; padding: 0 10px;"
              @click="settoreFiltroGlobale = settore"
            >
              {{ settore }}
            </v-chip>
          </div>

          <!-- Stato vuoto se nessun risultato -->
          <div v-if="risultatiRicercaGlobaleRaggruppati.length === 0" class="text-center py-8 text-muted text-caption card-glass rounded-xl pa-4">
            <v-icon size="40" color="orange-lighten-2" class="mb-2">mdi-dumbbell-off</v-icon>
            <div class="font-weight-bold text-slate-dark text-subtitle-2">Nessun esercizio trovato</div>
            <p class="text-super-caption text-muted mt-1 mb-3">Nessuna corrispondenza per "{{ testoRicercaGlobale || settoreFiltroGlobale }}" in tutta la scheda.</p>
            <v-btn size="small" color="orange-darken-3" variant="tonal" class="font-weight-black text-none" @click="testoRicercaGlobale = ''; settoreFiltroGlobale = 'Tutti'">
              Azzera Filtri
            </v-btn>
          </div>

          <!-- Risultati Raggruppati per Giorno -->
          <div v-else class="d-flex flex-column gap-4 scrollbar-custom" style="max-height: 65vh; padding-right: 2px;">
            <div
              v-for="(gruppo, gIdx) in risultatiRicercaGlobaleRaggruppati"
              :key="gruppo.giorno"
              class="d-flex flex-column gap-2"
              :class="gIdx > 0 ? 'mt-2' : ''"
            >
              <div class="d-flex align-center justify-space-between px-1 mb-1">
                <div class="d-flex align-center">
                  <v-chip color="orange-darken-3" size="x-small" variant="flat" class="font-weight-black text-white px-2.5 mr-2" style="height: 22px; font-size: 0.68rem;">
                    GIORNO {{ gruppo.giorno }}
                  </v-chip>
                  <span class="text-super-caption text-muted font-weight-bold" style="font-size: 0.68rem;">
                    {{ gruppo.esercizi.length }} eserciz{{ gruppo.esercizi.length === 1 ? 'io' : 'i' }}
                  </span>
                </div>
              </div>

              <div class="d-flex flex-column gap-2.5">
                <div
                  v-for="item in gruppo.esercizi"
                  :key="item.id"
                  class="pa-3 rounded-xl border d-flex align-center justify-space-between cursor-pointer card-glass hover-scale position-relative"
                  style="background: linear-gradient(135deg, rgba(30, 41, 59, 0.5) 0%, rgba(15, 23, 42, 0.7) 100%); border: 1px solid rgba(255, 255, 255, 0.08) !important; margin-bottom: 2px;"
                  @click="vaiADettaglioDaRicercaGlobale(item.id)"
                >
                  <div class="d-flex align-center min-width-0 flex-grow-1">
                    <div class="rounded-lg overflow-hidden flex-shrink-0 mr-3" style="width: 44px; height: 44px; border: 1px solid rgba(255,255,255,0.1);">
                      <v-img :src="getGifUrl(item.UrlNormal) || '/logo.png'" cover height="100%" width="100%">
                        <template v-slot:placeholder>
                          <div class="fill-height d-flex align-center justify-center bg-slate-900">
                            <v-icon color="grey" size="16">mdi-dumbbell</v-icon>
                          </div>
                        </template>
                      </v-img>
                    </div>
                    <div class="d-flex flex-column min-width-0 flex-grow-1">
                      <div class="d-flex align-center gap-1.5 flex-wrap">
                        <v-chip size="x-small" color="orange-darken-3" variant="flat" class="font-weight-black text-white px-1.5 flex-shrink-0" style="height: 18px; font-size: 0.60rem;">
                          {{ item.des_giorno }}{{ item.num_riga_giorno }}
                        </v-chip>
                        <span class="text-subtitle-2 font-weight-black text-white text-truncate" style="font-size: 0.88rem; line-height: 1.2;">
                          {{ item.des_esercizio }}
                        </span>
                      </div>
                      <div v-if="item.des_settore || item.des_week1" class="d-flex align-center flex-wrap gap-1 mt-1 text-super-caption">
                        <span v-if="item.des_settore" class="text-orange-lighten-2 font-weight-black" style="font-size: 0.68rem;">
                          {{ item.des_settore }}
                        </span>
                        <span v-if="item.des_week1" class="text-slate font-weight-medium text-truncate" style="font-size: 0.65rem; opacity: 0.85; color: #cbd5e1 !important;">
                          • {{ item.des_week1 }}
                        </span>
                      </div>
                    </div>
                  </div>
                  <v-icon size="20" color="orange-lighten-2" class="flex-shrink-0 ml-2">mdi-chevron-right</v-icon>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>
    </v-dialog>




    <!-- Pulsante Fluttuante Persistente Play rimosso da qui ed integrato a livello globale in App.vue -->

  </v-container>
</template>

<script setup>
import { ref, onMounted, watch, computed, onBeforeUnmount, nextTick } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { collection, getDocs, query, where, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase.js';
import { selectedAthlete, selectedSheet, startGlobalTimer, getNomeAtleta, utente, playClickTrigger, setGlobalHaEserciziDaFare, setGlobalSettimanaDaChiudere, apriCalcolatoreDischi, globalStoryboard, loadingStoryboard, layoutEserciziGlobal, layoutDettaglioGlobal, posizioneRecuperiGlobal, timerThemeGlobal, comportamentoPlayGlobal, temaHeaderGiornoGlobal, dimensioneGifCompattaGlobal, getStoryboardBackup, risaltoNumeriInsWeekGlobal, formattaInsWeekHtml } from '../authStore.js';
import { jsPDF } from 'jspdf';

const router = useRouter();
const route = useRoute();

const isCmpTrue = (val) => {
  if (val === undefined || val === null) return false;
  if (typeof val === 'boolean') return val;
  const str = String(val).toLowerCase().trim();
  return str === 'true' || str === 'sì' || str === 'si' || str === '1';
};

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


const pulisciParentesiQuadre = (str) => {
  if (!str) return '';
  return String(str).replace(/\[\s*KG?\s*W\s*\d+\s*\]?/gi, '').trim();
};

// Parser delle stringhe di prescrizione speciali (es. 5x2(75%)|87,5KG|33,75L 77% o 3x6(78%)|45KG 92%)
const parsePrescription = (str) => {
  if (!str) return null;
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

const formattaPrescrizioneSemplice = (str) => {
  if (!str) return '';
  const cleanStr = pulisciParentesiQuadre(str);
  const parsed = parsePrescription(cleanStr);
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
  return cleanStr;
};

const formattaCaricoCompatto = (val) => {
  if (!val) return '-';
  let clean = String(val).trim();
  // Rimuove 'kg' o 'KG' con spazi opzionali
  clean = clean.replace(/\s*kg/i, '');
  
  // Se la stringa è complessa (es: "16 10-8-6" oppure "87,5 @ 3x10"), estrai il numero principale
  const matchMainVal = clean.match(/^(\d+(?:[.,]\d+)?)/);
  if (matchMainVal && clean.length > 4) {
    return matchMainVal[1];
  }
  
  // Tronca se troppo lungo per mantenere l'interfaccia ultra-compatta
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

const formattaDurataLeggibile = (totalMins) => {
  if (!totalMins) return '0 min';
  const mins = Math.round(totalMins);
  if (mins < 60) {
    return `${mins} min`;
  } else {
    const hours = Math.floor(mins / 60);
    const remainingMins = mins % 60;
    if (remainingMins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${remainingMins}m`;
  }
};

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

  const m1 = parseTimeToMins(p1.tempoRaw);
  const m2 = parseTimeToMins(p2.tempoRaw);
  const mediaMins = Math.round((m1 + m2) / 2);
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
    tempo1Raw: p1.tempoRaw,
    tempo1Mins: m1,
    densita1: p1.densita,
    tempo2Raw: p2.tempoRaw,
    tempo2Mins: m2,
    densita2: p2.densita,
    tempoMediaMins: mediaMins,
    densitaMedia,
    calorie,
    cardio1: p1.cardioRaw,
    cardio2: p2.cardioRaw,
    cardioMinMins,
    cardioMaxMins,
    cardioText
  };
};

const isVolumeString = (str) => {
  if (!str) return false;
  return /V:\s*[\d,.]+/i.test(str) && /(?:A|B|C):\s*[\d,.]+/i.test(str);
};

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

// Data, Durata e Densità Helpers
const parseCustomDate = (dateStr) => {
  if (!dateStr) return null;
  if (dateStr.includes('T') || dateStr.includes('-')) {
    const d = new Date(dateStr);
    if (!isNaN(d)) return d;
  }
  const match = dateStr.trim().match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})\s+(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?$/);
  if (match) {
    const day = parseInt(match[1], 10);
    const month = parseInt(match[2], 10) - 1;
    const year = parseInt(match[3], 10);
    const hour = parseInt(match[4], 10);
    const minute = parseInt(match[5], 10);
    const second = match[6] ? parseInt(match[6], 10) : 0;
    const d = new Date(year, month, day, hour, minute, second);
    if (!isNaN(d)) return d;
  }
  const dFallback = new Date(dateStr);
  return isNaN(dFallback) ? null : dFallback;
};

const getDurataMinuti = (start, end) => {
  if (!start || !end) return 0;
  const startDate = parseCustomDate(start);
  const endDate = parseCustomDate(end);
  if (!startDate || !endDate) return 0;
  const diffMs = endDate - startDate;
  return diffMs > 0 ? Math.floor(diffMs / (1000 * 60)) : 0;
};

const getDinamicoTempo = (header, type) => {
  if (!header) return '';
  const parsed = parseDayHeader(header.des_esercizio);
  if (!parsed) return '';
  
  if (type === 1) {
    const start = header.start_wo;
    const end = header.end_wo;
    const mins = getDurataMinuti(start, end);
    return mins > 0 ? formattaDurataLeggibile(mins) : formattaDurataLeggibile(parsed.tempo1Mins);
  } else if (type === 6) {
    const start = header.start6_wo;
    const end = header.end6_wo;
    const mins = getDurataMinuti(start, end);
    return mins > 0 ? formattaDurataLeggibile(mins) : formattaDurataLeggibile(parsed.tempo2Mins);
  } else if (type === 'media') {
    let sum = 0;
    let count = 0;
    
    const w1Mins = getDurataMinuti(header.start_wo, header.end_wo);
    if (w1Mins > 0) { sum += w1Mins; count++; }
    
    for (let w = 2; w <= 6; w++) {
      const startKey = `start${w}_wo`;
      const endKey = `end${w}_wo`;
      const start = header[startKey];
      const end = header[endKey];
      const mins = getDurataMinuti(start, end);
      if (mins > 0) {
        sum += mins;
        count++;
      }
    }
    
    if (count > 0) {
      return formattaDurataLeggibile(sum / count);
    }
    return formattaDurataLeggibile(parsed.tempoMediaMins);
  }
  return '';
};

const getDensityZoneInfo = (val) => {
  const d = parseInt(val) || 0;
  if (d < 25) {
    return {
      type: 'forza',
      color: '#38bdf8',
      emoji: '🔵',
      label: 'Forza'
    };
  } else if (d < 35) {
    return {
      type: 'ipertrofia',
      color: '#34d399',
      emoji: '🟢',
      label: 'Ipertrofia'
    };
  } else if (d < 45) {
    return {
      type: 'lattacido',
      color: '#fbbf24',
      emoji: '🟡',
      label: 'Lattacido'
    };
  } else {
    return {
      type: 'metabolico',
      color: '#f87171',
      emoji: '🔴',
      label: 'Metabolico'
    };
  }
};

const getDensityBoxStyle = (val) => {
  const zone = getDensityZoneInfo(val);
  const percent = Math.min(Math.max(parseInt(val) || 0, 0), 100);
  return {
    background: `linear-gradient(90deg, ${zone.color}25 0%, ${zone.color}25 ${percent}%, rgba(30, 41, 59, 0.35) ${percent}%, rgba(30, 41, 59, 0.35) 100%)`,
    border: `1.5px solid ${zone.color}50`,
    transition: 'all 0.3s ease'
  };
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

// Stato scroll per mostrare la linea di separazione del header solo al momento dello scroll
const isScrolledPastDayHeader = ref(false);

const handleDayHeaderScroll = () => {
  if (typeof window !== 'undefined') {
    isScrolledPastDayHeader.value = window.scrollY > 130;
  }
};

onMounted(() => {
  window.addEventListener('scroll', handleDayHeaderScroll, { passive: true });
});

onBeforeUnmount(() => {
  window.removeEventListener('scroll', handleDayHeaderScroll);
});

// Stato Impostazioni e Personalizzazione (Salvate in LocalStorage)
const layoutEsercizi = layoutEserciziGlobal;
const layoutDettaglio = layoutDettaglioGlobal;
const posizioneRecuperi = posizioneRecuperiGlobal;
const timerTheme = timerThemeGlobal;
const comportamentoPlay = comportamentoPlayGlobal;
const temaHeaderGiorno = temaHeaderGiornoGlobal;
const dimensioneGifCompatta = dimensioneGifCompattaGlobal;

// Override locale rapido per sessione/card del recupero
const overridePosizioneRecuperi = ref({}); // { [exId]: 'inizio' | 'strategica' | 'fine' }

const impostaPosizioneRecupero = (exId, pos) => {
  vibraTattile(10);
  overridePosizioneRecuperi.value[exId] = pos;
};

const getPosizioneRecupero = (exId) => {
  return overridePosizioneRecuperi.value[exId] || posizioneRecuperi.value || 'strategica';
};

const getPosizioneLabel = (pos) => {
  switch (pos) {
    case 'inizio': return '🔝 Inizio';
    case 'fine': return '🔚 Fine';
    default: return '🧠 Smart';
  }
};


const caricamento = ref(true);
const listaAllenamenti = ref([]);
const headerGiorno = ref(null);
const eserciziFiltrati = ref([]);
const allExercisesBackup = ref([]);

const mesocicloCompletato = computed(() => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return false;
  const righeZero = listaAllenamenti.value.filter(item => parseInt(item.num_riga_giorno) === 0);
  if (righeZero.length === 0) return false;
  return righeZero.every(header => {
    for (let w = 1; w <= 6; w++) {
      if (!isCmpTrue(header['cmp' + w])) return false;
    }
    return true;
  });
});

// ═══════════════════════════════════════════════════════════════════
// GESTIONE GRADIMENTI (VOTI 1-5 FEELING ESERCIZI) & PROPOSTA FINE MESOCICLO
// ═══════════════════════════════════════════════════════════════════

const dialogGradimenti = ref(false);
const filtroGradimenti = ref('tutti'); // 'tutti' | 'mancanti' | 'A' | 'B' | 'C' | 'D'
const ricercaGradimenti = ref('');
const dialogPropostaGradimentiFineMesociclo = ref(false);
const salvataggioGradimentoInCorso = ref(null);

// Lista ordinata di tutti i singoli esercizi del mesociclo attivo (esclusi gli header giorno num_riga_giorno === 0)
const tuttiEserciziMesociclo = computed(() => {
  if (!listaAllenamenti.value) return [];
  return listaAllenamenti.value
    .filter(item => parseInt(item.num_riga_giorno) > 0)
    .slice()
    .sort((a, b) => {
      const gA = (a.des_giorno || '').trim().toUpperCase();
      const gB = (b.des_giorno || '').trim().toUpperCase();
      if (gA !== gB) return gA.localeCompare(gB);
      return (parseInt(a.num_riga_giorno) || 0) - (parseInt(b.num_riga_giorno) || 0);
    });
});

// Esercizi a cui non è stato ancora assegnato un voto da 1 a 5
const eserciziSenzaGradimento = computed(() => {
  return tuttiEserciziMesociclo.value.filter(ex => {
    const val = parseInt(ex.ind_reps_start);
    return isNaN(val) || val < 1 || val > 5;
  });
});

// Esercizi che hanno un voto valido da 1 a 5
const eserciziConGradimento = computed(() => {
  return tuttiEserciziMesociclo.value.filter(ex => {
    const val = parseInt(ex.ind_reps_start);
    return !isNaN(val) && val >= 1 && val <= 5;
  });
});

// Percentuale di esercizi con gradimento completato
const percentualeVotati = computed(() => {
  const tot = tuttiEserciziMesociclo.value.length;
  if (tot === 0) return 0;
  return Math.round((eserciziConGradimento.value.length / tot) * 100);
});

// Media dei voti di gradimento
const mediaGradimenti = computed(() => {
  const votati = eserciziConGradimento.value;
  if (votati.length === 0) return 0;
  const somma = votati.reduce((acc, ex) => acc + parseInt(ex.ind_reps_start), 0);
  return parseFloat((somma / votati.length).toFixed(1));
});

// Conteggio totali e mancanti per giorno
const conteggioGradimentiPerGiorno = computed(() => {
  const counts = {
    A: { total: 0, missing: 0, voted: 0 },
    B: { total: 0, missing: 0, voted: 0 },
    C: { total: 0, missing: 0, voted: 0 },
    D: { total: 0, missing: 0, voted: 0 }
  };
  tuttiEserciziMesociclo.value.forEach(ex => {
    const g = (ex.des_giorno || '').trim().toUpperCase();
    if (!counts[g]) {
      counts[g] = { total: 0, missing: 0, voted: 0 };
    }
    counts[g].total++;
    const v = parseInt(ex.ind_reps_start);
    if (!isNaN(v) && v >= 1 && v <= 5) {
      counts[g].voted++;
    } else {
      counts[g].missing++;
    }
  });
  return counts;
});

// Esercizi filtrati per la vista rapida gradimenti
const eserciziGradimentiFiltrati = computed(() => {
  let list = tuttiEserciziMesociclo.value;
  
  if (filtroGradimenti.value === 'mancanti') {
    list = list.filter(ex => {
      const v = parseInt(ex.ind_reps_start);
      return isNaN(v) || v < 1 || v > 5;
    });
  } else if (['A', 'B', 'C', 'D'].includes(filtroGradimenti.value)) {
    list = list.filter(ex => (ex.des_giorno || '').trim().toUpperCase() === filtroGradimenti.value);
  }

  if (ricercaGradimenti.value && ricercaGradimenti.value.trim()) {
    const q = ricercaGradimenti.value.toLowerCase().trim();
    list = list.filter(ex => {
      const nome = (ex.des_esercizio || '').toLowerCase();
      const settore = (ex.des_settore || '').toLowerCase();
      const giorno = (ex.des_giorno || '').toLowerCase();
      return nome.includes(q) || settore.includes(q) || giorno.includes(q);
    });
  }

  return list;
});

// Apertura modale gradimenti con filtro specificato
const apriDialogGradimenti = (filtro = 'tutti') => {
  vibraTattile(12);
  filtroGradimenti.value = filtro;
  ricercaGradimenti.value = '';
  dialogGradimenti.value = true;
};

// Salvataggio istantaneo del voto (1-5) o toggle rimozione
const salvaGradimentoRapido = async (ex, voto) => {
  vibraTattile(18);
  const votoStr = String(voto);
  const valorePrecedente = (ex.ind_reps_start || '').trim();
  
  // Se si tocca il voto già attivo, lo rimuove (toggle)
  const nuovoValore = valorePrecedente === votoStr ? '' : votoStr;
  
  // Aggiornamento reattivo istantaneo
  ex.ind_reps_start = nuovoValore;
  ex.timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  ex.timestamp_ute = getTimestampUte();
  
  // Aggiorna anche in globalStoryboard se presente
  if (globalStoryboard.value) {
    const foundDoc = globalStoryboard.value.find(d => d.id === ex.id);
    if (foundDoc) {
      foundDoc.ind_reps_start = nuovoValore;
    }
  }

  salvataggioGradimentoInCorso.value = ex.id;

  // Salva offline nel localStorage
  const key1 = `offline_storyboard_${ex.id}`;
  let updates = {};
  const localData1 = localStorage.getItem(key1);
  if (localData1) {
    try { updates = JSON.parse(localData1); } catch (e) {}
  }
  updates['ind_reps_start'] = nuovoValore;
  updates['timestamp'] = ex.timestamp;
  updates['timestamp_ute'] = ex.timestamp_ute;
  localStorage.setItem(key1, JSON.stringify(updates));

  if (ex.num_riga) {
    const key2 = `offline_storyboard_${ex.num_riga}`;
    localStorage.setItem(key2, JSON.stringify(updates));
  }

  // Salva su Firebase Firestore in background
  try {
    const docRef = doc(db, 'STORYBOARD', ex.id);
    await setDoc(docRef, {
      ind_reps_start: nuovoValore,
      timestamp: updates['timestamp'],
      timestamp_ute: updates['timestamp_ute']
    }, { merge: true });
    console.log(`Gradimento per ${ex.des_esercizio} salvato su Firebase: ${nuovoValore}`);
  } catch (err) {
    console.warn("Errore salvataggio gradimento su Firebase:", err);
  } finally {
    salvataggioGradimentoInCorso.value = null;
  }
};

// Funzione helper per ottenere l'etichetta del voto
const getLabelVoto = (voto) => {
  const v = parseInt(voto);
  switch (v) {
    case 1: return '1 - Scarso 😡';
    case 2: return '2 - Sufficiente 😕';
    case 3: return '3 - Medio 😐';
    case 4: return '4 - Buono 🙂';
    case 5: return '5 - Ottimo 🤩';
    default: return 'Non votato';
  }
};

// Controllo e apertura automatica della proposta gradimenti mancanti a fine mesociclo
const controllaPropostaGradimentiFineMesociclo = () => {
  if (!mesocicloCompletato.value) return;
  if (eserciziSenzaGradimento.value.length === 0) return;

  const athlete = selectedAthlete.value || 'default';
  const sheet = selectedSheet.value || 'default';
  const sessionKey = `avviso_gradimenti_proposto_${athlete}_${sheet}`;

  // Se non è già stato proposto in questa sessione browser
  if (!sessionStorage.getItem(sessionKey)) {
    sessionStorage.setItem(sessionKey, 'true');
    dialogPropostaGradimentiFineMesociclo.value = true;
  }
};

const chiudiPropostaGradimenti = (apriGradimenti = false) => {
  dialogPropostaGradimentiFineMesociclo.value = false;
  if (apriGradimenti) {
    setTimeout(() => {
      apriDialogGradimenti('mancanti');
    }, 200);
  }
};

// Funzione infallibile che controlla se l'esercizio esisteva ESATTAMENTE nella scheda - 1
const esisteInSchedaPrecedente = (ex) => {
  if (!ex || !allExercisesBackup.value.length) return false;
  
  const currentNumScheda = parseInt(ex.num_scheda);
  if (isNaN(currentNumScheda) || currentNumScheda <= 1) return false;
  
  const targetScheda = currentNumScheda - 1;
  const nomeEx = String(ex.des_esercizio || '').trim().toLowerCase();
  const keyIdCliente = Object.keys(ex).find(k => k.includes('ID_cliente')) || 'ID_cliente';
  const atletaId = ex[keyIdCliente] || '';

  if (!nomeEx || !atletaId) return false;

  // Cerca nel backup locale l'esercizio con la scheda ESATTAMENTE uguale a quella precedente
  return allExercisesBackup.value.some(b => {
    const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
    return String(bAtletaId) === String(atletaId) &&
           String(b.des_esercizio || '').trim().toLowerCase() === nomeEx &&
           parseInt(b.num_scheda) === targetScheda &&
           parseInt(b.num_riga_giorno) > 0;
  });
};

// Funzione che rileva lo STALLO (nessuna progressione tra W1 e W6) nel mesociclo precedente
const stalloInSchedaPrecedente = (ex) => {
  if (!ex || !allExercisesBackup.value.length) return false;
  
  const currentNumScheda = parseInt(ex.num_scheda);
  if (isNaN(currentNumScheda) || currentNumScheda <= 1) return false;
  
  const targetScheda = currentNumScheda - 1;
  const nomeEx = String(ex.des_esercizio || '').trim().toLowerCase();
  const keyIdCliente = Object.keys(ex).find(k => k.includes('ID_cliente')) || 'ID_cliente';
  const atletaId = ex[keyIdCliente] || '';

  if (!nomeEx || !atletaId) return false;

  const exPrev = allExercisesBackup.value.find(b => {
    const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
    return String(bAtletaId) === String(atletaId) &&
           String(b.des_esercizio || '').trim().toLowerCase() === nomeEx &&
           parseInt(b.num_scheda) === targetScheda &&
           parseInt(b.num_riga_giorno) > 0;
  });

  if (!exPrev) return false;

  const useRep = isRepProgression(exPrev);
  const parsePesoLocalInternal = (val) => {
    if (!val) return 0;
    let clean = String(val).replace(/,/g, '.').trim();
    // Rimuove qualsiasi contenuto tra parentesi (...), quadre [...] o graffe {...}
    clean = clean.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\{[^}]*\}/g, ' ').trim();
    if (/^\d+(?:\.\d+)?\s*[rR]\b/i.test(clean) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(clean)) return 0;
    if (/^\s*\d+(?:\.\d+)?\s*[xX]\s*\d+(?:\.\d+)?(?:\s*[rR]?\b)?\s*$/.test(clean)) return 0;
    const cleanNum = clean.replace(/[^\d.]/g, ' ').trim();
    const parts = cleanNum.split(/\s+/);
    const num = parseFloat(parts[0]);
    return isNaN(num) ? 0 : num;
  };

  const w1Val = useRep ? (estraiRepsDaInput(exPrev.ins_week1) || 0) : parsePesoLocalInternal(exPrev.ins_week1);
  
  let latestVal = 0;
  for (let w = 6; w >= 1; w--) {
    const val = useRep ? (estraiRepsDaInput(exPrev['ins_week' + w]) || 0) : parsePesoLocalInternal(exPrev['ins_week' + w]);
    if (val > 0) {
      latestVal = val;
      break;
    }
  }

  // Se la Week 1 ha un valore registrato e l'ultimo valore (W6) è <= W1, l'esercizio era in stallo
  return (w1Val > 0 && latestVal <= w1Val);
};

const dialogStalloEsercizio = ref(false);
const esercizioStalloSelezionato = ref(null);

const apriInfoStallo = (ex) => {
  esercizioStalloSelezionato.value = ex;
  dialogStalloEsercizio.value = true;
};

const segnaCaricoLimiteRapido = (ex) => {
  if (!ex) return;
  dialogStalloEsercizio.value = false;
  vaiAlDettaglio(ex.id, 1);
};

const getLavoroStyle = (val) => {
  const str = String(val || '').trim();
  if (str.length > 25) {
    return { fontSize: '0.70rem', lineHeight: '1.15' };
  }
  return {};
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

const isRepProgression = (ex) => {
  if (!ex) return false;
  const name = String(ex.des_esercizio || '').toLowerCase();
  const note = String(ex.des_note_attrezzo || '').toLowerCase();
  const attr = String(ex.des_note_gen_attr || '').toLowerCase();
  const desNote = String(ex.des_note || '').toLowerCase();
  const settore = String(ex.des_settore || '').toLowerCase();
  const settorePrinc = String(ex.des_settore_princ || '').toLowerCase();
  
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
  
  const isCorpoLibero = keywords.some(k => name.includes(k) || note.includes(k) || attr.includes(k) || desNote.includes(k) || settore.includes(k) || settorePrinc.includes(k)) || note.includes('a terra') || note.includes('decubito') || note.includes('nessuno') || attr.includes('nessuno');
  if (!isCorpoLibero) return false;

  let prevReps = null;
  let matchesIncr = 0;
  let totalWeeks = 0;
  
  for (let w = 1; w <= 6; w++) {
    if (w === 4) continue;
    const presc = ex['des_week' + w];
    if (presc) {
      const reps = estraiRepsDaPrescrizione(presc);
      if (reps !== null) {
        if (prevReps !== null && reps > prevReps) {
          matchesIncr++;
        }
        prevReps = reps;
        totalWeeks++;
      }
    }
  }
  
  if (matchesIncr > 0 && matchesIncr >= totalWeeks - 2) {
    return true;
  }
  
  const hasZavorra = name.includes('con peso') || name.includes('+') || name.includes('zavorra') || name.includes('con manubri') || note.includes('zavorra') || note.includes('con peso') || attr.includes('zavorra');
  if (!hasZavorra) {
    return true;
  }
  
  return false;
};

function estraiRepsDaInputExplicitSingle(str) {
  if (!str) return null;
  let clean = String(str).replace(/,/g, '.').trim();
  
  // Rimuove QUALSIASI contenuto tra parentesi (...), quadre [...] o graffe {...} per evitare che note influenzino i calcoli
  clean = clean.replace(/\([^)]*\)/g, ' ').replace(/\[[^\]]*\]/g, ' ').replace(/\{[^}]*\}/g, ' ').trim();

  // 1. Rimuove TUT, RPE, tempi di recupero e impostazioni
  clean = clean.replace(/\b(?:tut|t\.u\.t\.)\s*:?\s*@?\s*\d*(?:\s*[\-\/\.]?\s*\d+)*/gi, ' ').trim();
  clean = clean.replace(/\b(?:rpe|r\.p\.e\.)\s*:?\s*@?\s*\d+(?:[\.,]\d+)?(?:\s*[\-\/]\s*\d+(?:[\.,]\d+)?)*/gi, ' ').trim();
  clean = clean.replace(/\b\d+(?:\.\d+)?\s*(?:sec|secondi|sec\.?|s|rec|recupero|min|minuti)\b/gi, ' ').trim();
  clean = clean.replace(/\b(?:pin|buco|buca|foro|tacca|altezza|pos|step|livello)\b\s*\d+(?:\.\d+)?/gi, '').trim();

  // 2. Rileva Rest-Pause / Tecniche (+ RP 14, RP 12)
  const matchRP = clean.match(/(?:\+|\bpoi\b)?\s*(?:rp|rest\s*pause|drop\s*set|cluster)\s*(?:fino\s*a\s*)?(\d+(?:\.\d+)?)/i);
  if (matchRP) {
    const val = parseFloat(matchRP[1]);
    if (!isNaN(val) && val > 0) return { val, explicit: true };
  }

  // 3. Rileva formato esplicito "5x12" o "5x12r" -> la seconda parte (12) sono le REPS
  const matchX = clean.match(/(\d+(?:\.\d+)?)\s*[xX]\s*(\d+(?:\.\d+)?)(?:\s*[rR]?\b)?/);
  if (matchX) {
    const val = parseFloat(matchX[2]);
    if (!isNaN(val) && val > 0) return { val, explicit: true };
  }
  
  // 4. Rileva ripetizioni esplicite con suffissi "r", "reps", "rip" (es. "12r", "12 reps")
  const matchR = clean.match(/(\d+(?:\.\d+)?)\s*(?:[rR]\b|reps?|rip(?:etizioni)?)/i);
  if (matchR) {
    const val = parseFloat(matchR[1]);
    if (!isNaN(val) && val > 0) return { val, explicit: true };
  }

  // 5. UN NUMERO SINGOLO SENZA "r" O "reps" (es. "2", "3", "5", "12") È IL CARICO IN KG!
  // Non deve MAI restituire un valore di ripetizioni esplicito qui.
  return null;
}

const estraiRepsDaInputSingle = (str) => {
  const res = estraiRepsDaInputExplicitSingle(str);
  return res ? res.val : null;
};

const estraiMigliorPrestazioneInput = (strVal, defaultReps = 10, isCavo = false) => {
  if (!strVal) return null;
  const str = String(strVal).trim();
  if (!str || str === '-') return null;

  const lines = str.split(/[\n;\r]+/);
  let bestPerf = null;
  let maxE1RM = -1;

  lines.forEach(line => {
    const l = line.trim();
    if (!l) return;
    const pesoStr = parsePesoLocalInternal(l);
    if (pesoStr) {
      const peso = parseFloat(pesoStr);
      if (!isNaN(peso) && peso > 0) {
        const hasExplicitReps = /\d+\s*[rR]\b|\d+\s*[xX]\s*\d+|\b\d+\s*(?:reps?|rip(?:etizioni)?|colpi)\b/i.test(l);
        const explicitReps = hasExplicitReps ? estraiRepsDaInput(l) : null;
        const reps = (explicitReps && explicitReps > 0) ? explicitReps : defaultReps;
        const e1rm = peso * (1 + reps / 30);
        if (e1rm > maxE1RM) {
          maxE1RM = e1rm;
          bestPerf = { peso, reps, e1rm };
        }
      }
    }
  });

  return bestPerf;
};

const estraiRepsDaInput = (str) => {
  if (!str) return null;
  const strVal = String(str);
  const lines = strVal.split(/[\n;\r]+/);
  const results = lines.map(l => estraiRepsDaInputExplicitSingle(l)).filter(v => v !== null && !isNaN(v.val) && Number.isInteger(v.val) && v.val > 0 && v.val <= 50);
  if (results.length === 0) return null;
  const explicitResults = results.filter(v => v.explicit);
  if (explicitResults.length > 0) {
    return Math.max(...explicitResults.map(v => v.val));
  }
  return Math.max(...results.map(v => v.val));
};

const getTrendFreccia = (ex) => {
  if (!ex || !allExercisesBackup.value.length) return '';
  
  const currentNumScheda = parseInt(ex.num_scheda);
  if (isNaN(currentNumScheda) || currentNumScheda <= 1) return '';
  
  const nomeEx = String(ex.des_esercizio || '').trim().toLowerCase();
  const keyIdCliente = Object.keys(ex).find(k => k.includes('ID_cliente')) || 'ID_cliente';
  const atletaId = ex[keyIdCliente] || '';

  if (!nomeEx || !atletaId) return '';

  // Applica la stessa logica di richiamo dello storico: trova la scheda precedente più recente (< currentNumScheda)
  let prevEx = null;
  allExercisesBackup.value.forEach(b => {
    const bAtletaId = b[keyIdCliente] || b['ID_cliente'] || '';
    if (String(bAtletaId) === String(atletaId) &&
        String(b.des_esercizio || '').trim().toLowerCase() === nomeEx) {
      const sNum = parseInt(b.num_scheda);
      if (sNum < currentNumScheda && parseInt(b.num_riga_giorno) > 0) {
        if (!prevEx || sNum > parseInt(prevEx.num_scheda)) {
          prevEx = b;
        }
      }
    }
  });

  if (!prevEx) return '';

  const prevReps = parseInt(prevEx.reps_week1) || estraiRepsDaPrescrizione(prevEx.des_week1) || 0;
  const currReps = parseInt(ex.reps_week1) || estraiRepsDaPrescrizione(ex.des_week1) || 0;

  if (prevReps === 0 || currReps === 0) return '';
  if (currReps > prevReps) return '▲';
  if (currReps < prevReps) return '▼';
  return '';
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

// Reset override della settimana se cambiano atleta, scheda o giorno selezionato
watch([selectedAthlete, selectedSheet, giornoSelezionato], () => {
  overrideWeek.value = null;
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

// Trova la prossima settimana da chiudere per un determinato giorno
const settimanaDaChiuderePerGiorno = (g) => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return '';
  const header = listaAllenamenti.value.find(
    item => (item.des_giorno || '').trim().toUpperCase() === g.trim().toUpperCase() && parseInt(item.num_riga_giorno) === 0
  );
  if (!header) return '';
  for (let w = 1; w <= 6; w++) {
    if (!isCmpTrue(header['cmp' + w])) {
      return 'W' + w;
    }
  }
  return 'FINE'; // Se tutte sono chiuse
};

// Stato e Logica per Ricerca Globale Scheda (Tutti i giorni)
const dialogRicercaGlobaleScheda = ref(false);
const testoRicercaGlobale = ref('');
const settoreFiltroGlobale = ref('Tutti');

const filtriSettoriGlobali = computed(() => {
  const set = new Set(['Tutti']);
  if (listaAllenamenti.value) {
    listaAllenamenti.value.forEach(ex => {
      if (parseInt(ex.num_riga_giorno) > 0) {
        const sec = getSettorePrincipale(ex.des_settore);
        if (sec && sec !== 'Altro') set.add(sec);
      }
    });
  }
  return Array.from(set);
});

const risultatiRicercaGlobaleRaggruppati = computed(() => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return [];
  
  let esercizi = listaAllenamenti.value.filter(item => parseInt(item.num_riga_giorno) > 0);

  if (settoreFiltroGlobale.value && settoreFiltroGlobale.value !== 'Tutti') {
    esercizi = esercizi.filter(ex => getSettorePrincipale(ex.des_settore) === settoreFiltroGlobale.value);
  }

  if (testoRicercaGlobale.value && testoRicercaGlobale.value.trim() !== '') {
    const q = testoRicercaGlobale.value.trim().toLowerCase();
    esercizi = esercizi.filter(ex => {
      const nome = String(ex.des_esercizio || '').toLowerCase();
      const note = String(ex.des_note_attrezzo || '').toLowerCase();
      const settore = String(ex.des_settore || '').toLowerCase();
      const attr = String(ex.des_note_gen_attr || '').toLowerCase();
      return nome.includes(q) || note.includes(q) || settore.includes(q) || attr.includes(q);
    });
  }

  const mappaGiorni = {};
  esercizi.forEach(ex => {
    const g = (ex.des_giorno || 'A').trim().toUpperCase();
    if (!mappaGiorni[g]) {
      mappaGiorni[g] = [];
    }
    mappaGiorni[g].push(ex);
  });

  return Object.keys(mappaGiorni).sort().map(giorno => {
    const exList = mappaGiorni[giorno].sort((a, b) => (parseInt(a.num_riga_giorno) || 0) - (parseInt(b.num_riga_giorno) || 0));
    return {
      giorno,
      esercizi: exList
    };
  });
});

const vaiADettaglioDaRicercaGlobale = (id) => {
  vibraTattile(10);
  dialogRicercaGlobaleScheda.value = false;
  router.push({ name: 'DettaglioWorkout', params: { id } });
};

// Raggruppa gli esercizi consecutivi in blocchi (singoli, superset, o recuperi posizionati strategicamente)
const blocchiEsercizi = computed(() => {
  // 1. Costruisci prima i blocchi del giorno corrente
  const giornoBlocks = [];
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
          exercises: [ex],
          complessita: classificaComplessitaEsercizio(ex.des_esercizio)
        };
        giornoBlocks.push(currentSuperset);
      }
    } else {
      currentSuperset = null;
      giornoBlocks.push({
        type: 'single',
        exercise: ex,
        complessita: classificaComplessitaEsercizio(ex.des_esercizio)
      });
    }
  });

  // Se non ci sono esercizi da recuperare, restituisci direttamente la lista del giorno
  if (!eserciziDaRecuperare.value || eserciziDaRecuperare.value.length === 0) {
    return giornoBlocks;
  }

  // 2. Prepara i blocchi dei recuperi con la loro posizione assegnata (default o override)
  const recuperi = eserciziDaRecuperare.value.map((rec) => {
    const comp = classificaComplessitaEsercizio(rec.exercise.des_esercizio);
    const targetPos = getPosizioneRecupero(rec.exercise.id);
    return {
      type: 'recupero',
      exercise: rec.exercise,
      week: rec.week,
      prescrizione: rec.prescrizione,
      originalVal: rec.originalVal,
      complessita: comp,
      targetPosizione: targetPos
    };
  });

  const inizioRecuperi = recuperi.filter(r => r.targetPosizione === 'inizio').sort((a, b) => a.complessita - b.complessita);
  const fineRecuperi = recuperi.filter(r => r.targetPosizione === 'fine').sort((a, b) => a.complessita - b.complessita);
  const strategiciRecuperi = recuperi.filter(r => r.targetPosizione === 'strategica' || !['inizio', 'fine'].includes(r.targetPosizione)).sort((a, b) => a.complessita - b.complessita);

  // Inserisci i recuperi strategici nel punto fisiologico ideale del giorno (in base a SNC / complessità)
  let result = [...giornoBlocks];
  strategiciRecuperi.forEach((rec) => {
    if (result.length === 0) {
      result.push(rec);
      return;
    }

    // Trova l'ultimo blocco nella sessione che ha complessità <= a quella del recupero
    let bestIdx = -1;
    for (let i = 0; i < result.length; i++) {
      const b = result[i];
      let bComp = 3;
      if (b.type === 'superset') {
        bComp = Math.min(...b.exercises.map(e => classificaComplessitaEsercizio(e.des_esercizio)));
      } else if (b.type === 'single') {
        bComp = b.complessita || classificaComplessitaEsercizio(b.exercise.des_esercizio);
      } else if (b.type === 'recupero') {
        bComp = b.complessita;
      }

      if (bComp <= rec.complessita) {
        bestIdx = i;
      }
    }

    if (bestIdx === -1) {
      // Se tutti gli esercizi della sessione sono di livello superiore (es. solo isolamento e il recupero è compound 1)
      result.unshift(rec);
    } else {
      result.splice(bestIdx + 1, 0, rec);
    }
  });

  return [...inizioRecuperi, ...result, ...fineRecuperi];
});

// Progresso sessione per barra di avanzamento (Energy Bar)
const progressoSessione = computed(() => {
  if (!eserciziFiltrati.value || eserciziFiltrati.value.length === 0) {
    return { completate: 0, totali: 0, percentuale: 0 };
  }
  
  const totali = eserciziFiltrati.value.length;
  const completate = eserciziFiltrati.value.filter(ex => {
    const logVal = ex['ins_week' + settimanaAttivaGiorno.value] || '';
    return logVal && logVal.trim() !== '' && logVal.trim() !== '-';
  }).length;
  
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
  
  const w = settimanaAttiva.value;
  const totali = exercises.length;
  const completate = exercises.filter(ex => {
    const logVal = ex['ins_week' + w] || '';
    return logVal && logVal.trim() !== '' && logVal.trim() !== '-';
  }).length;
  
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

const overrideWeek = ref(null);

const selezionaSettimanaManuale = (w) => {
  vibraTattile(8);
  overrideWeek.value = w;
};

const settimanaAttivaGiorno = computed(() => {
  if (overrideWeek.value !== null) {
    return overrideWeek.value;
  }
  if (!headerGiorno.value) return settimanaAttiva.value;
  for (let w = 1; w <= 6; w++) {
    if (!isCmpTrue(headerGiorno.value['cmp' + w])) {
      return w;
    }
  }
  return 6;
});


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
    if (localTimestamp < item.timestamp) {
      // Rimuovi modifiche locali obsolete per evitare inquinamento della cache
      localStorage.removeItem(key1);
      localStorage.removeItem(key2);
      return item;
    }
  }
  
  return { ...item, ...updates };
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
  
  caricaDataMesociclo();
  
  // Ottieni il giorno attivo configurato
  const salvatoGiorno = localStorage.getItem('giornoAttivo_' + selectedAthlete.value) || 'A';
  giornoSelezionato.value = salvatoGiorno;

  caricamento.value = true;
  
  // 1. Carica preventivamente il backup JSON per le patch di sicurezza GIF
  try {
    allExercisesBackup.value = await getStoryboardBackup();
  } catch (errBackup) {
    console.warn("Impossibile caricare backup locale in anticipo:", errBackup);
  }

  aggiornaDatiDaStore();

  if (listaAllenamenti.value.length === 0 && !loadingStoryboard.value) {
    // Prova il fallback da backup locale
    const backupList = allExercisesBackup.value;
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
    gestisciScrollIniziale();
  }

  if (!loadingStoryboard.value) {
    caricamento.value = false;
  }
};

const aggiornaDatiDaStore = () => {
  const backupList = allExercisesBackup.value;

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

  // Prendi i dati grezzi direttamente da globalStoryboard
  let temporanei = globalStoryboard.value.map(doc => {
    return applicaModificheLocali({ id: doc.id, ...doc });
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

  // Auto-seleziona il giorno corretto se la settimana è nuova o se il giorno selezionato è già completato
  let currentDayExists = false;
  let currentDayCompleted = false;
  const currentDay = giornoSelezionato.value;
  if (currentDay) {
    const currentHeader = temporanei.find(
      item => (item.des_giorno || '').trim().toUpperCase() === currentDay.toUpperCase() && (parseInt(item.num_riga_giorno) === 0)
    );
    if (currentHeader) {
      currentDayExists = true;
      currentDayCompleted = isCmpTrue(currentHeader['cmp' + activeW]);
    }
  }

  const giorniList = ['A', 'B', 'C', 'D'];
  const settimanaNuova = giorniList.every(g => {
    const header = temporanei.find(
      item => (item.des_giorno || '').trim().toUpperCase() === g.toUpperCase() && (parseInt(item.num_riga_giorno) === 0)
    );
    return !header || !isCmpTrue(header['cmp' + activeW]);
  });

  // SE STIAMO TORNANDO DA UN DETTAGLIO, EVITIAMO DI FARE AUTO-SELEZIONE DEL GIORNO PER PRESERVARE LA POSIZIONE DELL'UTENTE
  const haUltimoEsercizioDettaglio = !!localStorage.getItem('ultimoEsercizioDettaglio');

  if (!haUltimoEsercizioDettaglio && (!currentDay || !currentDayExists || currentDayCompleted || settimanaNuova)) {
    let giornoDaFare = '';
    for (const g of giorniList) {
      const header = temporanei.find(
        item => (item.des_giorno || '').trim().toUpperCase() === g.toUpperCase() && (parseInt(item.num_riga_giorno) === 0)
      );
      if (header) {
        const completato = isCmpTrue(header['cmp' + activeW]);
        if (!completato) {
          giornoDaFare = g;
          break;
        }
      }
    }
    
    if (!giornoDaFare) {
      for (const g of giorniList) {
        if (temporanei.some(item => (item.des_giorno || '').trim().toUpperCase() === g.toUpperCase())) {
          giornoDaFare = g;
          break;
        }
      }
    }

    if (giornoDaFare) {
      giornoSelezionato.value = giornoDaFare;
      localStorage.setItem('giornoAttivo_' + selectedAthlete.value, giornoDaFare);
    }
  }

  filtraEserciziPerGiorno();
  gestisciScrollIniziale();
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

const eserciziMancantiGiornoSelezionato = computed(() => {
  if (!eserciziFiltrati.value || eserciziFiltrati.value.length === 0) return [];
  const indiciPresenti = eserciziFiltrati.value
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

const giornoHaBuchi = (g) => {
  if (!listaAllenamenti.value || listaAllenamenti.value.length === 0) return false;
  const exDelGiorno = listaAllenamenti.value.filter(
    item => (item.des_giorno || '').trim().toUpperCase() === g.trim().toUpperCase() && parseInt(item.num_riga_giorno) > 0
  );
  if (exDelGiorno.length === 0) return false;
  const indiciPresenti = exDelGiorno
    .map(item => parseInt(item.num_riga_giorno))
    .filter(n => !isNaN(n) && n > 0);
  if (indiciPresenti.length === 0) return false;
  const maxIndice = Math.max(...indiciPresenti);
  for (let i = 1; i < maxIndice; i++) {
    if (!indiciPresenti.includes(i)) {
      return true;
    }
  }
  return false;
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
  headerGiorno.value.timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  headerGiorno.value.timestamp_ute = getTimestampUte();
  
  // Salva offline nel localStorage per consentire il funzionamento offline istantaneo
  const key1 = `offline_storyboard_${headerGiorno.value.id}`;
  let updates = {};
  const localData1 = localStorage.getItem(key1);
  if (localData1) {
    try { updates = JSON.parse(localData1); } catch (e) {}
  }
  updates[campoCmp] = valString;
  updates['timestamp'] = new Date().toISOString().replace('T', ' ').substring(0, 19);
  updates['timestamp_ute'] = getTimestampUte();
  localStorage.setItem(key1, JSON.stringify(updates));

  // Salva su Firebase in background
  try {
    const docRef = doc(db, 'STORYBOARD', headerGiorno.value.id);
    await setDoc(docRef, { [campoCmp]: valString, timestamp: updates['timestamp'], timestamp_ute: updates['timestamp_ute'] }, { merge: true });
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

    // Se la chiusura ha completato l'intero mesociclo e mancano dei gradimenti, proponi la lista
    nextTick(() => {
      if (mesocicloCompletato.value && eserciziSenzaGradimento.value.length > 0) {
        dialogPropostaGradimentiFineMesociclo.value = true;
      }
    });
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
  ex.timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  ex.timestamp_ute = getTimestampUte();
  
  // Salva offline nel localStorage
  const key1 = `offline_storyboard_${ex.id}`;
  let updates = {};
  const localData1 = localStorage.getItem(key1);
  if (localData1) {
    try { updates = JSON.parse(localData1); } catch (e) {}
  }
  updates[campo] = nuovoValore;
  updates['timestamp'] = new Date().toISOString().replace('T', ' ').substring(0, 19);
  updates['timestamp_ute'] = getTimestampUte();
  localStorage.setItem(key1, JSON.stringify(updates));

  // Salva su Firebase in background
  try {
    const docRef = doc(db, 'STORYBOARD', ex.id);
    await setDoc(docRef, { [campo]: nuovoValore, timestamp: updates['timestamp'], timestamp_ute: updates['timestamp_ute'] }, { merge: true });
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

const haEserciziDaFare = computed(() => {
  if (eserciziFiltrati.value.length === 0) return false;
  const w = settimanaAttivaGiorno.value;
  return eserciziFiltrati.value.some(ex => {
    const val = ex['ins_week' + w];
    return !val || val.trim() === '';
  });
});

const determinaGiornoAttivo = () => {
  const w = settimanaAttivaGiorno.value;
  for (const g of listaGiorniDisponibili.value) {
    const header = listaAllenamenti.value.find(
      item => (item.des_giorno || '').trim().toUpperCase() === g.toUpperCase() && parseInt(item.num_riga_giorno) === 0
    );
    const completato = header ? isCmpTrue(header['cmp' + w]) : false;
    if (!completato) {
      return g;
    }
  }
  return listaGiorniDisponibili.value[0] || 'A';
};

const isGiornoSelezionatoIniziato = () => {
  const w = settimanaAttivaGiorno.value;
  return eserciziFiltrati.value.some(ex => {
    const val = ex['ins_week' + w];
    return val && val.trim() !== '';
  });
};

watch(haEserciziDaFare, (newVal) => {
  setGlobalHaEserciziDaFare(newVal);
}, { immediate: true });

watch(mostraPromemoriaChiusura, (newVal) => {
  setGlobalSettimanaDaChiudere(newVal);
}, { immediate: true });

// Cerca il primo esercizio incompleto in una specifica settimana,
// seguendo sempre l'ordine sequenziale naturale dei giorni (A -> B -> C -> D)
// e saltando i giorni il cui allenamento è già stato chiuso per quella settimana.
const trovaPrimoIncompletoInSettimana = (w) => {
  const tuttiGiorni = (listaGiorniDisponibili.value || []).map(g => g.toUpperCase());
  if (tuttiGiorni.length === 0) return null;

  for (const g of tuttiGiorni) {
    // 1. Verifica se l'intestazione del giorno g è già stata chiusa per la settimana w
    const header = listaAllenamenti.value.find(
      item => (item.des_giorno || '').trim().toUpperCase() === g && parseInt(item.num_riga_giorno) === 0
    );
    const isChiuso = header && isCmpTrue(header['cmp' + w]);

    // Se il giorno g è già chiuso per la settimana w, passa al giorno successivo (es. A e B chiusi -> passa a C)
    if (isChiuso) continue;

    // 2. Cerca gli esercizi del giorno aperto
    const eserciziDelGiorno = listaAllenamenti.value.filter(
      item => (item.des_giorno || '').trim().toUpperCase() === g && parseInt(item.num_riga_giorno) > 0
    );
    eserciziDelGiorno.sort((a, b) => (parseInt(a.num_riga_giorno) || 0) - (parseInt(b.num_riga_giorno) || 0));

    // Cerca il primo esercizio non ancora compilato nel primo giorno aperto in ordine sequenziale
    const primoIncompleto = eserciziDelGiorno.find(ex => {
      const val = ex['ins_week' + w];
      return !val || val.trim() === '';
    });
    
    if (primoIncompleto) {
      return { giorno: g, esercizioId: primoIncompleto.id };
    }
  }

  return null;
};

// Cerca il prossimo esercizio da fare globalmente partendo dalla settimana attiva della scheda (non da quella correntemente visualizzata)
const trovaProssimoEsercizioDaFareGlobale = () => {
  if (listaAllenamenti.value.length === 0) return null;
  
  const startW = settimanaAttiva.value;
  
  // Scansione in avanti da startW a 6
  for (let w = startW; w <= 6; w++) {
    const ris = trovaPrimoIncompletoInSettimana(w);
    if (ris) return { week: w, giorno: ris.giorno, esercizioId: ris.esercizioId };
  }
  
  // Scansione all'indietro (wrap-around) da 1 a startW - 1
  for (let w = 1; w < startW; w++) {
    const ris = trovaPrimoIncompletoInSettimana(w);
    if (ris) return { week: w, giorno: ris.giorno, esercizioId: ris.esercizioId };
  }
  
  return null;
};

watch(() => playClickTrigger.value, () => {
  console.log('[Play - Workouts.vue] playClickTrigger watcher fired. Current value:', playClickTrigger.value);
  
  const prossimo = trovaProssimoEsercizioDaFareGlobale();
  
  if (prossimo) {
    console.log('[Play - Workouts.vue] Prossimo esercizio da fare trovato:', prossimo);
    const { week, giorno } = prossimo;
    
    // Forziamo l'impostazione della settimana target individuata
    overrideWeek.value = week;
    
    const dayChanged = giornoSelezionato.value !== giorno;
    if (dayChanged) {
      console.log(`[Play - Workouts.vue] Switching day from ${giornoSelezionato.value} to ${giorno}`);
      giornoSelezionato.value = giorno;
      salvaGiornoSelezionato(giorno);
    }
    
    nextTick(() => {
      setTimeout(() => {
        vaiAlPrimoEsercizioDaFare();
      }, 300);
    });
  } else {
    console.log('[Play - Workouts.vue] Nessun esercizio incompleto trovato globalmente. Fallback al giorno corrente.');
    vaiAlPrimoEsercizioDaFare();
  }
});

const apriCalcolatoreDaPrescrizione = (prescrizioneStr, nomeEsercizio = '') => {
  if (!prescrizioneStr) return;
  const cleanStr = pulisciParentesiQuadre(prescrizioneStr);
  const parsed = parsePrescription(cleanStr);
  if (parsed && parsed.total) {
    apriCalcolatoreDischi(parsed.total, parsed.side, 'totale', nomeEsercizio);
  }
};

const vaiAlPrimoEsercizioDaFare = () => {
  const w = settimanaAttivaGiorno.value;
  // Priorità 1: Cerca esercizio contrassegnato con RECUPERA nel giorno corrente
  const daRecuperare = eserciziFiltrati.value.find(ex => {
    const val = ex['ins_week' + w];
    return haRecupero(val);
  });

  // Priorità 2: Cerca esercizio non ancora compilato
  const targetEx = daRecuperare || eserciziFiltrati.value.find(ex => {
    const val = ex['ins_week' + w];
    return !val || val.trim() === '';
  });

  if (targetEx) {
    const navigaDettaglio = comportamentoPlay.value === 'dettaglio' || 
      (comportamentoPlay.value === 'auto' && (layoutEsercizi.value === 'super_compatto' || layoutEsercizi.value === 'compatto'));
    
    if (navigaDettaglio) {
      vaiAlDettaglio(targetEx.id, w);
    } else {
      // Loop di retry robusto per attendere il rendering della scheda nel DOM ed eventuali cambi scheda
      let retries = 0;
      const tryScroll = () => {
        const el = document.getElementById('esercizio-' + targetEx.id);
        if (el) {
          console.log(`[Play - Evidenzia] Elemento esercizio-${targetEx.id} trovato al tentativo ${retries}. Scorrimento in corso...`);
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-exercise');
          setTimeout(() => {
            el.classList.remove('highlight-exercise');
          }, 1500);
        } else if (retries < 15) {
          retries++;
          setTimeout(tryScroll, 80);
        } else {
          console.warn(`[Play - Evidenzia] Impossibile trovare elemento esercizio-${targetEx.id} dopo 15 tentativi.`);
        }
      };
      tryScroll();
    }
  } else {
    // Loop di retry robusto per il bottone di completamento
    let retries = 0;
    const tryScrollComplete = () => {
      const el = document.getElementById('btn-completa-giorno');
      if (el) {
        console.log(`[Play - Evidenzia] Bottone completa giorno trovato al tentativo ${retries}. Scorrimento in corso...`);
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.add('highlight-exercise');
        setTimeout(() => {
          el.classList.remove('highlight-exercise');
        }, 1500);
      } else if (retries < 15) {
        retries++;
        setTimeout(tryScrollComplete, 80);
      } else {
        console.warn(`[Play - Evidenzia] Impossibile trovare bottone completa giorno dopo 15 tentativi.`);
      }
    };
    tryScrollComplete();
  }
};

const gestisciScrollIniziale = () => {
  if (loadingStoryboard.value || listaAllenamenti.value.length === 0) {
    return;
  }
  if (localStorage.getItem('scrollPrimoEsercizioDaFare') === 'true') {
    localStorage.removeItem('scrollPrimoEsercizioDaFare');
    
    const prossimo = trovaProssimoEsercizioDaFareGlobale();
    if (prossimo) {
      const { week, giorno } = prossimo;
      const weekChanged = settimanaAttivaGiorno.value !== week;
      const dayChanged = giornoSelezionato.value !== giorno;
      
      if (weekChanged) {
        overrideWeek.value = week;
      }
      if (dayChanged) {
        giornoSelezionato.value = giorno;
        salvaGiornoSelezionato(giorno);
      }
      
      nextTick(() => {
        setTimeout(() => {
          vaiAlPrimoEsercizioDaFare();
        }, 400);
      });
    } else {
      nextTick(() => {
        setTimeout(() => {
          vaiAlPrimoEsercizioDaFare();
        }, 400);
      });
    }
  } else {
    scrollaAllUltimoEsercizio();
  }
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

const gestisciNavigazioneDaQuery = () => {
  const qGiorno = route.query?.giorno;
  const qWeek = route.query?.week;
  const qTarget = route.query?.targetEx || localStorage.getItem('woapp_target_scroll_exercise') || localStorage.getItem('ultimoEsercizioDettaglio');

  if (qGiorno) {
    const g = String(qGiorno).trim().toUpperCase();
    if (giornoSelezionato.value !== g) {
      giornoSelezionato.value = g;
      salvaGiornoSelezionato(g);
    }
  }

  if (qWeek) {
    const w = parseInt(qWeek, 10);
    if (w >= 1 && w <= 6) {
      overrideWeek.value = w;
    }
  }

  if (qTarget) {
    localStorage.removeItem('woapp_target_scroll_exercise');
    localStorage.removeItem('ultimoEsercizioDettaglio');
    nextTick(() => {
      let retries = 0;
      const tryScroll = () => {
        const el = document.getElementById('esercizio-' + qTarget);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
          el.classList.add('highlight-exercise');
          setTimeout(() => {
            el.classList.remove('highlight-exercise');
          }, 1800);
        } else if (retries < 15) {
          retries++;
          setTimeout(tryScroll, 100);
        }
      };
      setTimeout(tryScroll, 120);
    });
  }
};

onMounted(() => {
  caricaAllenamenti();
  gestisciNavigazioneDaQuery();
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

// Watch per mantenere sincronizzato lo stato locale con il listener globale di authStore
watch(globalStoryboard, () => {
  aggiornaDatiDaStore();
}, { deep: true });

watch(loadingStoryboard, (newVal) => {
  caricamento.value = newVal;
  if (!newVal) {
    if (localStorage.getItem('scrollPrimoEsercizioDaFare') === 'true') {
      gestisciScrollIniziale();
    } else {
      gestisciNavigazioneDaQuery();
    }
  }
});

watch(() => route.query, () => {
  gestisciNavigazioneDaQuery();
}, { deep: true });

// Watch per proporre automaticamente l'inserimento gradimenti quando il mesociclo è completato
watch([mesocicloCompletato, loadingStoryboard], ([mesoDone, loading]) => {
  if (mesoDone && !loading) {
    nextTick(() => {
      controllaPropostaGradimentiFineMesociclo();
    });
  }
}, { immediate: true });

// Naviga al dettaglio dell'esercizio
const vaiAlDettaglio = (id, week = null) => {
  vibraTattile(10);
  const routeLocation = { name: 'DettaglioWorkout', params: { id } };
  if (week) {
    routeLocation.query = { targetWeek: week };
  }
  router.push(routeLocation);
};

// Naviga all'esercizio da recuperare passando la settimana specifica
const vaiAlRecupero = (recItem) => {
  if (recItem && recItem.exercise && recItem.exercise.id) {
    vaiAlDettaglio(recItem.exercise.id, recItem.week);
  }
};

const vaiAlDettaglioSessione = (id) => {
  if (id) {
    vibraTattile(12);
    router.push({ name: 'DettaglioSessione', params: { id } });
  }
};

const vibraTattile = (ms = 12) => {
  if (localStorage.getItem('woapp_vibrazione_attiva') === 'false') return;
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};



const dialogProgressioni = ref(false);

const dataMesociclo = ref('');

const caricaDataMesociclo = async () => {
  if (!selectedAthlete.value || !selectedSheet.value) {
    dataMesociclo.value = '';
    return;
  }
  try {
    const athleteIdStr = String(selectedAthlete.value);
    const athleteIdNum = Number(selectedAthlete.value);
    const sheetStr = String(selectedSheet.value);
    const sheetNum = Number(selectedSheet.value);

    let snap = await getDocs(query(collection(db, 'WORKOUT_T'), where('ID_cliente', '==', athleteIdStr), where('num_scheda', '==', sheetStr)));
    if (snap.empty) {
      snap = await getDocs(query(collection(db, 'WORKOUT_T'), where('ID_cliente', '==', athleteIdNum), where('num_scheda', '==', sheetNum)));
    }
    if (!snap.empty) {
      const d = snap.docs[0].data();
      dataMesociclo.value = d.dat_data || '';
    } else {
      dataMesociclo.value = '';
    }
  } catch (err) {
    console.warn("Errore caricamento data WORKOUT_T in Workouts.vue:", err);
    dataMesociclo.value = '';
  }
};

const allineamentoProgramma = computed(() => {
  let dateStr = dataMesociclo.value;

  if (!dateStr && listaAllenamenti.value && listaAllenamenti.value.length > 0) {
    const header = listaAllenamenti.value.find(
      item => parseInt(item.num_riga_giorno) === 0 && (item.dat_data || item.start_wo)
    );
    if (header) {
      dateStr = header.dat_data || header.start_wo;
    }
  }

  if (!dateStr) return null;

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

  const startDate = parseDateString(dateStr);
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
  doc.text(`${getNomeAtleta(atletaSelezionato.value) || 'Atleta'}  •  Scheda ${schedaSelezionata.value}  •  ${oggi}`, marginL + 2, 22);
  
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

  const righe = [];
  const items = listaAllenamenti.value || [];
  
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
    
    const isRep = isRepProgression(ex);
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
      deltaText = `${isRep ? '-' + Math.abs(delta) : fmtVal(parseFloat(delta.toFixed(1)))}${unit}`;
      pctText = `${pct}%`;
      colorType = 'negative';
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
  
  // Ordina: positivi (% decrescente) → stabili → negativi (% crescente, cioè meno negativo prima)
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

  let sommaFeeling = 0;
  let countFeeling = 0;

  const parsePesoLocal = (val) => {
    if (!val) return 0;
    const clean = String(val).replace(/,/g, '.').trim();
    const isRep = /^\d+(?:\.\d+)?\s*[rR]\b/i.test(clean) || /^\d+(?:\.\d+)?\s*(?:rep|rip)/i.test(clean);
    if (isRep) return 0;
    if (/^\s*\d+(?:\.\d+)?\s*[xX]\s*\d+(?:\.\d+)?(?:\s*[rR]?\b)?\s*$/.test(clean)) return 0;
    const cleanNum = clean.replace(/[^\d.]/g, ' ').trim();
    const parts = cleanNum.split(/\s+/);
    const num = parseFloat(parts[0]);
    return isNaN(num) ? 0 : num;
  };

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

    const useRep = isRepProgression(ex);
    const w1Val = useRep ? (estraiRepsDaInput(ex.ins_week1) || 0) : parsePesoLocal(ex.ins_week1);
    if (w1Val > 0) {
      result.totaleEserciziConCarichi++;
      for (let w = 6; w >= 2; w--) {
        const wVal = useRep ? (estraiRepsDaInput(ex['ins_week' + w]) || 0) : parsePesoLocal(ex['ins_week' + w]);
        if (wVal > w1Val) {
          const delta = useRep ? (wVal - w1Val) : parseFloat((wVal - w1Val).toFixed(1));
          const pct = Math.round((delta / w1Val) * 100);
          result.progressioniCarichi.push({
            id: ex.id,
            nome: ex.des_esercizio || 'Esercizio',
            w1: w1Val,
            latest: wVal,
            latestWeek: w,
            delta: delta,
            pct: pct,
            isRep: useRep
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
      updates['timestamp_ute'] = getTimestampUte();
      ex['timestamp'] = updates['timestamp'];
      ex['timestamp_ute'] = updates['timestamp_ute'];
      
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
const pannelloRecuperiAperto = ref(true);
const recuperoAccordionAperto = ref(null);

const toggleRecuperoAccordion = (giorno) => {
  recuperoAccordionAperto.value = recuperoAccordionAperto.value === giorno ? null : giorno;
};

const haRecupero = (val) => {
  if (!val) return false;
  
  // 1. Rimuove QUALSIASI contenuto tra parentesi tonde (...) in modo che note o commenti tra parentesi non attivino mai il recupero
  const clean = String(val).replace(/\([^)]*\)/g, ' ').trim();
  if (!clean) return false;

  const str = clean.toLowerCase();
  
  // Se la frase contiene una negazione esplicita (es. "non è più da fare", "non da fare"), NON è un recupero!
  if (str.includes('non è più da fare') || str.includes('non piu da fare') || str.includes('non è da fare') || str.includes('non da fare') || str.includes('da non fare')) {
    return false;
  }

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

const salvaValoreEsercizio = async (ex, w, valore) => {
  const campo = 'ins_week' + w;
  ex[campo] = valore;
  ex.timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  ex.timestamp_ute = getTimestampUte();
  
  const key1 = `offline_storyboard_${ex.id}`;
  let updates = {};
  const localData1 = localStorage.getItem(key1);
  if (localData1) {
    try { updates = JSON.parse(localData1); } catch (e) {}
  }
  updates[campo] = valore;
  updates['timestamp'] = new Date().toISOString().replace('T', ' ').substring(0, 19);
  updates['timestamp_ute'] = getTimestampUte();
  localStorage.setItem(key1, JSON.stringify(updates));

  try {
    const docRef = doc(db, 'STORYBOARD', ex.id);
    await setDoc(docRef, { [campo]: valore, timestamp: updates['timestamp'], timestamp_ute: updates['timestamp_ute'] }, { merge: true });
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

const concludiRecuperoRapido = async (recItem) => {
  vibraTattile(20);
  const ex = recItem.exercise;
  const w = recItem.week;
  
  let original = recItem.originalVal.replace(/\s*\[RECUPERA\]/g, '').replace(/\s*\[RECUPERATO\]/g, '').trim();
  let valoreFinale = '';
  
  if (!original || original === '-') {
    valoreFinale = 'Recuperato';
  } else {
    valoreFinale = `${original} [RECUPERATO]`;
  }
  
  await salvaValoreEsercizio(ex, w, valoreFinale);
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
  background: var(--card-bg-soft) !important;
}
.bg-slate-800 {
  background: rgba(30, 41, 59, 0.4) !important;
}
.prescription-chip-box {
  background: rgba(30, 41, 59, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.04);
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 52px;
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

.mini-weeks-row {
  overflow-x: auto !important;
  scrollbar-width: none !important;
  -ms-overflow-style: none !important;
  -webkit-overflow-scrolling: touch !important;
}

.mini-weeks-row::-webkit-scrollbar {
  display: none !important;
}

.mini-weeks-row .mini-week-capsule {
  min-width: 15px !important;
  flex-shrink: 0 !important;
}

.mini-weeks-row .capsule-active {
  transform: scale(1.08) !important;
  margin: 0 1px !important;
}

.mini-week-capsule {
  font-size: 0.54rem;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.2, 0.8, 0.2, 1);
  min-width: 24px;
  height: 15px;
}

.capsule-completed {
  background: rgba(16, 185, 129, 0.18) !important;
  border: 1px solid rgba(16, 185, 129, 0.45) !important;
  color: #10b981 !important;
  box-shadow: 0 0 6px rgba(16, 185, 129, 0.12);
}

:root:not([data-theme="light"]) .capsule-active {
  background: var(--theme-btn-gradient) !important;
  color: white !important;
  box-shadow: 0 0 12px var(--theme-primary-glow) !important;
  transform: scale(1.15);
  margin: 0 2px;
  z-index: 1;
  animation: pulse-theme-glow 2s infinite alternate;
}

@keyframes pulse-theme-glow {
  0% {
    box-shadow: 0 0 8px var(--theme-primary-glow);
  }
  100% {
    box-shadow: 0 0 16px var(--theme-primary-glow);
  }
}

.capsule-pending {
  background: rgba(255, 255, 255, 0.03) !important;
  border: 1px solid rgba(255, 255, 255, 0.08) !important;
  color: #cbd5e1 !important;
  opacity: 0.75;
}

.capsule-num {
  font-size: 0.50rem;
  font-weight: 900;
  letter-spacing: -0.02em;
}

:root:not([data-theme="light"]) .capsule-active .capsule-num {
  color: #ffffff !important;
  font-size: 0.56rem !important;
}

.capsule-completed .capsule-num {
  color: #ffb000 !important; /* Giallo/Oro per distinguere la W dal peso verde */
}

.capsule-pending .capsule-num {
  color: #8b8d99 !important; /* Grigio chiaro per distinguere la W dal trattino */
}


/* Nuovi Stili Premium per le Superserie (Supersets) */
.superset-group-card {
  position: relative;
  background: rgba(249, 115, 22, 0.02) !important;
  border: 1.5px solid rgba(255, 255, 255, 0.08) !important;
  border-left: 3.5px solid var(--theme-primary) !important;
  box-shadow: 0 8px 32px 0 rgba(249, 115, 22, 0.05) !important;
  transition: transform 0.2s ease, border-color 0.2s ease !important;
  overflow: hidden;
}

.superset-group-card:hover {
  transform: translateY(-2px);
  border-color: rgba(255, 255, 255, 0.15) !important;
  border-left: 3.5px solid var(--theme-primary) !important;
}

.border-superset {
  border-left: 3.5px solid var(--theme-primary) !important;
  position: relative;
}

/* Rimuoviamo il vecchio ::before per avere la stessa barra pulita e precisa ovunque */
.border-superset::before,
.compatto-superset-card::before,
.superset-group-card.rounded-md::before {
  display: none !important;
}

/* Distanzia il contenuto standard per allineamento coerente (3.5px border + 12.5px padding = 16px pa-4) */
.superset-group-card.border-superset:not(.compatto-superset-card):not(.rounded-md) {
  padding-left: 12.5px !important;
}

/* Stili compatti per Superserie Unificata con banda a sinistra (Dimensioni 100% identiche alle card singole) */
.compatto-superset-card {
  border-left: 3.5px solid var(--theme-primary) !important; /* Banda tema solida e fina */
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
  border-right: 1px solid rgba(255, 255, 255, 0.08) !important;
  background: var(--card-bg-glass) !important; /* Stesso sfondo glassmorphic delle card singole */
  padding: 0 !important;
  border-radius: 12px !important;
  overflow: hidden !important;
}

/* Applica la banda tema solida anche alle card arrotondate super_compatto */
.superset-group-card.rounded-md {
  border-left: 3.5px solid var(--theme-primary) !important;
}

/* Allineamento interno compatto originale */
.compatto-superset-card .superset-exercise-item {
  padding-left: 0 !important;
  margin-left: 0 !important;
  padding-right: 0 !important;
  border-radius: 0 !important;
}

/* Allineamento a sinistra perfetto in visualizzazione super compatta */
.superset-group-card.rounded-md .superset-exercise-item {
  padding-left: 0px !important;
  margin-left: -6px !important;
  padding-right: 4px !important;
}

/* Limitazione della larghezza dei chip dei pesi e troncamento intelligente */
.super-compact-weight-chip {
  max-width: 60px !important;
  display: inline-block !important;
}

.super-compact-weight-chip :deep(.v-chip__content) {
  display: block !important;
  white-space: nowrap !important;
  overflow: hidden !important;
  text-overflow: ellipsis !important;
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
  left: 45px;
  top: 40px;
  bottom: -40px;
  width: 2px;
  border-left: 2px dashed var(--theme-primary);
  filter: drop-shadow(0 0 3px var(--theme-primary));
  pointer-events: none;
  z-index: 1 !important;
  opacity: 0.85;
}

/* Solo i contenuti (GIF, testo, bottoni) stanno sopra la linea tratteggiata. 
   Escludiamo espressamente la linea tratteggiata per evitare che perda position: absolute */
.superset-exercise-item > div:not(.superset-connector-line) {
  position: relative !important;
  z-index: 2 !important;
}

/* Allineamento specifico per la linea tratteggiata in modalità compatta */
.compatto-superset-card .superset-connector-line {
  left: 35px !important; /* Centrata a metà della miniatura da 62px (ml-1 4px + 31px) */
  top: 35px !important;  /* Parte da centro della foto superiore */
  bottom: -28px !important; /* Si estende fino al centro della foto inferiore */
}

.superset-exercises-wrapper {
  position: relative;
}

.sticky-tabs-container {
  position: sticky !important;
  z-index: 99 !important;
  background: var(--bg-main) !important; /* background dinamico per nascondere il contenuto che scorre sotto */
  padding-top: 6px !important;
  padding-bottom: 0px !important;
  margin-top: -8px !important;
}
.sticky-tabs-container.compatto-tabs {
  padding-top: 4px !important;
  padding-bottom: 0px !important;
}
.sticky-tabs-container.super-compatto-tabs {
  padding-top: 2px !important;
  padding-bottom: 0px !important;
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
  min-width: 0 !important;
}

/* Override specifico per fusione perfetta dei day tabs header */
.sticky-tabs-container .day-tabs-header-bar .v-tab {
  margin: 0 !important;
  height: 100% !important;
  border-top-left-radius: 14px !important;
  border-top-right-radius: 14px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

[data-theme="dark"] .sticky-tabs-container .day-tabs-header-bar .v-tab--selected,
:root:not([data-theme="light"]) .sticky-tabs-container .day-tabs-header-bar .v-tab--selected,
.sticky-tabs-container .day-tabs-header-bar .v-tab--selected {
  margin: 0 !important;
  margin-bottom: 0px !important;
  border-top-left-radius: 14px !important;
  border-top-right-radius: 14px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
  box-shadow: none !important;
}

.sticky-tabs-container .day-tabs-header-bar.active-tab-theme-arancio .v-tab--selected,
:root:not([data-theme="light"]) .sticky-tabs-container .day-tabs-header-bar.active-tab-theme-arancio .v-tab--selected {
  background: linear-gradient(180deg, #f97316 0%, #ea580c 100%) !important;
}

.sticky-tabs-container .day-tabs-header-bar.active-tab-theme-blu .v-tab--selected,
:root:not([data-theme="light"]) .sticky-tabs-container .day-tabs-header-bar.active-tab-theme-blu .v-tab--selected {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

.sticky-tabs-container .day-tabs-header-bar.active-tab-theme-verde .v-tab--selected,
:root:not([data-theme="light"]) .sticky-tabs-container .day-tabs-header-bar.active-tab-theme-verde .v-tab--selected {
  background: linear-gradient(180deg, #10b981 0%, #047857 100%) !important;
}

.sticky-tabs-container .day-tabs-header-bar.active-tab-theme-fucsia .v-tab--selected,
:root:not([data-theme="light"]) .sticky-tabs-container .day-tabs-header-bar.active-tab-theme-fucsia .v-tab--selected {
  background: linear-gradient(180deg, #ec4899 0%, #db2777 100%) !important;
}

.sticky-tabs-container .day-tabs-header-bar.active-tab-theme-giallo .v-tab--selected,
:root:not([data-theme="light"]) .sticky-tabs-container .day-tabs-header-bar.active-tab-theme-giallo .v-tab--selected {
  background: linear-gradient(180deg, #eab308 0%, #ca8a04 100%) !important;
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

@keyframes pulse-glow-pseudo {
  0% {
    opacity: 0;
    box-shadow: 0 0 0 transparent;
    border-color: transparent;
    background-color: transparent;
  }
  15% {
    opacity: 1;
    box-shadow: 0 0 25px var(--theme-primary-glow);
    border-color: var(--theme-primary);
    background-color: var(--theme-primary-bg-soft);
  }
  45% {
    opacity: 0.6;
    box-shadow: 0 0 15px var(--theme-primary-glow);
    border-color: var(--theme-primary-border);
    background-color: var(--theme-primary-bg-soft);
  }
  75% {
    opacity: 1;
    box-shadow: 0 0 25px var(--theme-primary-glow);
    border-color: var(--theme-primary);
    background-color: var(--theme-primary-bg-soft);
  }
  100% {
    opacity: 0;
    box-shadow: 0 0 0 transparent;
    border-color: transparent;
    background-color: transparent;
  }
}

.highlight-exercise {
  position: relative !important;
  transform: scale(1.02) !important;
  transition: transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1) !important;
}

.highlight-exercise::after {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  pointer-events: none;
  border: 2px solid transparent;
  z-index: 10;
  animation: pulse-glow-pseudo 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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
  padding: 0 !important;
  height: 26px !important;
  font-size: 0.62rem !important;
  text-align: center !important;
  line-height: 26px !important;
}

.day-tabs-header-bar {
  background: rgba(15, 23, 42, 0.85) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-bottom: none !important;
  margin-bottom: 0px !important;
  position: relative !important;
  z-index: 2 !important;
  overflow: visible !important;
}

.day-tabs-header-bar :deep(.v-slide-group),
.day-tabs-header-bar :deep(.v-slide-group__container),
.day-tabs-header-bar :deep(.v-slide-group__content) {
  align-items: flex-end !important;
  height: 100% !important;
  overflow: visible !important;
  padding: 0 !important;
  margin: 0 !important;
}

.day-tabs-header-bar .v-tab {
  color: #cbd5e1 !important;
  opacity: 0.85;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1) !important;
  border-top-left-radius: 12px !important;
  border-top-right-radius: 12px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
  text-transform: none !important;
  height: 100% !important;
  outline: none !important;
  outline-width: 0 !important;
  box-shadow: none !important;
  -webkit-tap-highlight-color: transparent !important;
}

.day-tabs-header-bar .v-tab:focus,
.day-tabs-header-bar .v-tab:focus-visible,
.day-tabs-header-bar .v-tab:active,
.day-tabs-header-bar .v-tab--selected,
.day-tabs-header-bar .v-tab--selected:focus,
.day-tabs-header-bar .v-tab--selected:focus-visible {
  outline: none !important;
  outline-width: 0 !important;
  box-shadow: none !important;
  -webkit-tap-highlight-color: transparent !important;
}

.day-tabs-header-bar .v-tab :deep(.v-tab__overlay),
.day-tabs-header-bar .v-tab:focus :deep(.v-tab__overlay),
.day-tabs-header-bar .v-tab--selected :deep(.v-tab__overlay),
.day-tabs-header-bar :deep(.v-ripple__container),
.day-tabs-header-bar :deep(.v-ripple__animation) {
  opacity: 0 !important;
  display: none !important;
  visibility: hidden !important;
}

.day-tabs-header-bar .v-tab,
.day-tabs-header-bar .v-tab :deep(*),
.day-tabs-header-bar .v-tab::before,
.day-tabs-header-bar .v-tab::after {
  overflow: hidden !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
  outline: none !important;
  box-shadow: none !important;
}

.day-tabs-header-bar .v-tab:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.06) !important;
}

.day-tabs-header-bar .v-tab--selected {
  opacity: 1 !important;
  color: #ffffff !important;
  border-top-left-radius: 12px !important;
  border-top-right-radius: 12px !important;
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
  box-shadow: none !important;
  position: relative !important;
  z-index: 10 !important;
  margin-bottom: 0px !important;
  padding-bottom: 0px !important;
}

/* Frequenza colore dinamica per tab attivo in continuità con il giorno */
.active-tab-theme-arancio .v-tab--selected {
  background: linear-gradient(180deg, #f97316 0%, #ea580c 100%) !important;
}

.active-tab-theme-blu .v-tab--selected {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

.active-tab-theme-verde .v-tab--selected {
  background: linear-gradient(180deg, #10b981 0%, #047857 100%) !important;
}

.active-tab-theme-fucsia .v-tab--selected {
  background: linear-gradient(180deg, #ec4899 0%, #db2777 100%) !important;
}

.active-tab-theme-giallo .v-tab--selected {
  background: linear-gradient(180deg, #eab308 0%, #ca8a04 100%) !important;
}

.day-tabs-header-bar .v-tab--selected,
.day-tabs-header-bar .v-tab--selected :deep(*),
.day-tabs-header-bar .v-tab--selected::before,
.day-tabs-header-bar .v-tab--selected::after {
  border-bottom-left-radius: 0px !important;
  border-bottom-right-radius: 0px !important;
}

.day-tabs-header-bar .v-tab:first-child {
  margin-left: 0 !important;
}

.day-tabs-header-bar .v-tab:first-child.v-tab--selected {
  border-top-left-radius: 14px !important;
  border-bottom-left-radius: 0px !important;
  border-top-right-radius: 12px !important;
  border-bottom-right-radius: 0px !important;
  margin-left: 0 !important;
}

.day-tabs-header-bar .v-tab:last-child {
  margin-right: 0 !important;
}

.day-tabs-header-bar .v-tab:last-child.v-tab--selected {
  border-top-right-radius: 14px !important;
  border-bottom-right-radius: 0px !important;
  border-top-left-radius: 12px !important;
  border-bottom-left-radius: 0px !important;
  margin-right: 0 !important;
}

.day-tabs-header-bar .v-tab--selected span,
.day-tabs-header-bar .v-tab--selected .v-icon {
  color: #ffffff !important;
}

.day-header-section {
  cursor: pointer;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  border-top-left-radius: 0px !important;
  border-top-right-radius: 0px !important;
  border-bottom-left-radius: 18px !important;
  border-bottom-right-radius: 18px !important;
  border-bottom: none !important;
}

.day-header-section.has-scroll-bottom-border {
  border-bottom: 2px solid rgba(0, 0, 0, 0.5) !important;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.4) !important;
}

/* Tema Arancio (Default) - Continuità perfetta con il tab attivo */
.day-header-section.tema-arancio {
  background: linear-gradient(180deg, #ea580c 0%, #9a3412 100%) !important;
  border-left: none !important;
  color: #ffffff !important;
  border-bottom-left-radius: 18px !important;
  border-bottom-right-radius: 18px !important;
}

.day-header-section.tema-arancio:hover {
  background: linear-gradient(180deg, #f97316 0%, #ea580c 100%) !important;
}

/* Tema Blu - Continuità perfetta */
.day-header-section.tema-blu {
  background: linear-gradient(180deg, #1d4ed8 0%, #1e3a8a 100%) !important;
  border-left: none !important;
  color: #ffffff !important;
  border-bottom-left-radius: 18px !important;
  border-bottom-right-radius: 18px !important;
}

.day-header-section.tema-blu:hover {
  background: linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%) !important;
}

/* Tema Verde - Continuità perfetta */
.day-header-section.tema-verde {
  background: linear-gradient(180deg, #047857 0%, #064e3b 100%) !important;
  border-left: none !important;
  color: #ffffff !important;
  border-bottom-left-radius: 18px !important;
  border-bottom-right-radius: 18px !important;
}

.day-header-section.tema-verde:hover {
  background: linear-gradient(180deg, #10b981 0%, #047857 100%) !important;
}

/* Tema Fucsia - Continuità perfetta */
.day-header-section.tema-fucsia {
  background: linear-gradient(180deg, #db2777 0%, #831843 100%) !important;
  border-left: none !important;
  color: #ffffff !important;
  border-bottom-left-radius: 18px !important;
  border-bottom-right-radius: 18px !important;
}

.day-header-section.tema-fucsia:hover {
  background: linear-gradient(180deg, #ec4899 0%, #db2777 100%) !important;
}

/* Tema Giallo - Continuità perfetta */
.day-header-section.tema-giallo {
  background: linear-gradient(180deg, #ca8a04 0%, #713f12 100%) !important;
  border-left: none !important;
  color: #ffffff !important;
  border-bottom-left-radius: 18px !important;
  border-bottom-right-radius: 18px !important;
}

.day-header-section.tema-giallo:hover {
  background: linear-gradient(180deg, #eab308 0%, #ca8a04 100%) !important;
}

.tema-arancio .header-title-text,
.tema-blu .header-title-text,
.tema-verde .header-title-text,
.tema-fucsia .header-title-text,
.tema-giallo .header-title-text {
  color: #ffffff !important;
  font-weight: 900 !important;
}

.tema-arancio .giorno-big-letter {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.tema-blu .giorno-big-letter {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 10px rgba(30, 64, 175, 0.35) !important;
}

.tema-verde .giorno-big-letter {
  background: linear-gradient(135deg, #065f46 0%, #10b981 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 10px rgba(6, 95, 70, 0.35) !important;
}

.tema-fucsia .giorno-big-letter {
  background: linear-gradient(135deg, #be185d 0%, #ec4899 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 10px rgba(190, 24, 93, 0.35) !important;
}

.tema-giallo .giorno-big-letter {
  background: linear-gradient(135deg, #854d0e 0%, #eab308 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
  box-shadow: 0 4px 10px rgba(133, 77, 14, 0.35) !important;
}

.tema-arancio .mini-week-capsule.capsule-completed {
  background: rgba(249, 115, 22, 0.25) !important;
  border: 1px solid rgba(249, 115, 22, 0.5) !important;
  color: #fdba74 !important;
}

.tema-blu .mini-week-capsule.capsule-completed {
  background: rgba(59, 130, 246, 0.25) !important;
  border: 1px solid rgba(59, 130, 246, 0.5) !important;
  color: #93c5fd !important;
}

.tema-verde .mini-week-capsule.capsule-completed {
  background: rgba(16, 185, 129, 0.25) !important;
  border: 1px solid rgba(16, 185, 129, 0.5) !important;
  color: #6ee7b7 !important;
}

.tema-fucsia .mini-week-capsule.capsule-completed {
  background: rgba(236, 72, 153, 0.25) !important;
  border: 1px solid rgba(236, 72, 153, 0.5) !important;
  color: #fbcfe8 !important;
}

.tema-giallo .mini-week-capsule.capsule-completed {
  background: rgba(234, 179, 8, 0.25) !important;
  border: 1px solid rgba(234, 179, 8, 0.5) !important;
  color: #fef08a !important;
}

.tema-arancio .mini-week-capsule.capsule-active {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
  color: #ffffff !important;
  font-weight: 900 !important;
  border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3) !important;
}

.tema-blu .mini-week-capsule.capsule-active {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%) !important;
  color: #ffffff !important;
  font-weight: 900 !important;
  border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.6) !important;
  animation: pulse-blue-glow 2s infinite alternate !important;
}

.tema-verde .mini-week-capsule.capsule-active {
  background: linear-gradient(135deg, #065f46 0%, #10b981 100%) !important;
  color: #ffffff !important;
  font-weight: 900 !important;
  border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.6) !important;
  animation: pulse-green-glow 2s infinite alternate !important;
}

.tema-fucsia .mini-week-capsule.capsule-active {
  background: linear-gradient(135deg, #be185d 0%, #ec4899 100%) !important;
  color: #ffffff !important;
  font-weight: 900 !important;
  border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 0 12px rgba(236, 72, 153, 0.6) !important;
  animation: pulse-fuchsia-glow 2s infinite alternate !important;
}

.tema-giallo .mini-week-capsule.capsule-active {
  background: linear-gradient(135deg, #854d0e 0%, #eab308 100%) !important;
  color: #ffffff !important;
  font-weight: 900 !important;
  border: 1.5px solid rgba(255, 255, 255, 0.4) !important;
  box-shadow: 0 0 12px rgba(234, 179, 8, 0.6) !important;
  animation: pulse-yellow-glow 2s infinite alternate !important;
}

@keyframes pulse-fuchsia-glow {
  0% { box-shadow: 0 0 8px rgba(236, 72, 153, 0.4); }
  100% { box-shadow: 0 0 16px rgba(236, 72, 153, 0.8); }
}

@keyframes pulse-yellow-glow {
  0% { box-shadow: 0 0 8px rgba(234, 179, 8, 0.4); }
  100% { box-shadow: 0 0 16px rgba(234, 179, 8, 0.8); }
}

.tema-arancio .mini-week-capsule.capsule-pending,
.tema-blu .mini-week-capsule.capsule-pending,
.tema-verde .mini-week-capsule.capsule-pending,
.tema-fucsia .mini-week-capsule.capsule-pending,
.tema-giallo .mini-week-capsule.capsule-pending {
  background: rgba(15, 23, 42, 0.35) !important;
  color: #cbd5e1 !important;
  border: 1px solid rgba(255, 255, 255, 0.06) !important;
}

.workout-session-container {
  margin-top: 0px !important;
  position: relative !important;
  z-index: 1 !important;
  border-top-left-radius: 0px !important;
  border-top-right-radius: 0px !important;
  border-bottom-left-radius: 20px !important;
  border-bottom-right-radius: 20px !important;
  overflow: hidden !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  border-top: none !important;
}

.density-label-text {
  color: #fde047 !important;
  font-weight: 900 !important;
}

.promemoria-chiusura-chip {
  background: #f59e0b !important;
  color: #ffffff !important;
}

.mini-week-capsule.capsule-recupero {
  background: #fef2f2 !important;
  color: #dc2626 !important;
  border: 1.5px solid #f87171 !important;
  font-weight: 900 !important;
  box-shadow: 0 2px 6px rgba(220, 38, 38, 0.2) !important;
}

.mini-week-capsule.capsule-recupero .capsule-num,
.mini-week-capsule.capsule-recupero span {
  color: #dc2626 !important;
  font-weight: 900 !important;
}

[data-theme="light"] .density-label-text {
  color: #047857 !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-header-section.tema-blu .density-label-text {
  color: #1e3a8a !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-header-section.tema-giallo .density-label-text {
  color: #854d0e !important;
  font-weight: 900 !important;
}

[data-theme="light"] .promemoria-chiusura-chip {
  background: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #fde68a !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-header-section.tema-blu .promemoria-chiusura-chip {
  background: #dbeafe !important;
  color: #1e40af !important;
  border: 1px solid #93c5fd !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-header-section.tema-giallo .promemoria-chiusura-chip {
  background: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #fde68a !important;
  font-weight: 900 !important;
}

/* Light Theme Active Tab & Day Header Menta & Salvia Soft Palette */
[data-theme="light"] .day-tabs-header-bar,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-verde,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-arancio {
  background: #f0fdf4 !important;
  border: 1px solid #a7f3d0 !important;
  border-bottom: none !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  box-shadow: none !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-blu {
  background: #eff6ff !important;
  border: 1px solid #bfdbfe !important;
  border-bottom: none !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  box-shadow: none !important;
}

[data-theme="light"] .day-tabs-header-bar .v-tab:not(.v-tab--selected),
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-verde .v-tab:not(.v-tab--selected),
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-arancio .v-tab:not(.v-tab--selected) {
  background: #e6f4ea !important;
  color: #047857 !important;
  opacity: 0.85 !important;
  border-right: 1px solid #a7f3d0 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-blu .v-tab:not(.v-tab--selected) {
  background: #e0f2fe !important;
  color: #1e40af !important;
  opacity: 0.85 !important;
  border-right: 1px solid #bfdbfe !important;
}

[data-theme="light"] .day-tabs-header-bar .v-tab:not(.v-tab--selected) .tab-day-letter,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-verde .v-tab:not(.v-tab--selected) .tab-day-letter,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-arancio .v-tab:not(.v-tab--selected) .tab-day-letter {
  color: #065f46 !important;
  font-weight: 800 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-blu .v-tab:not(.v-tab--selected) .tab-day-letter {
  color: #1e3a8a !important;
  font-weight: 800 !important;
}

[data-theme="light"] .day-tabs-header-bar .v-tab:not(.v-tab--selected) .tab-lock-icon {
  color: #059669 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-blu .v-tab:not(.v-tab--selected) .tab-lock-icon {
  color: #2563eb !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-arancio .v-tab--selected,
[data-theme="light"] .active-tab-theme-arancio .v-tab--selected,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-verde .v-tab--selected,
[data-theme="light"] .active-tab-theme-verde .v-tab--selected {
  background: linear-gradient(180deg, #d1fae5 0%, #a7f3d0 100%) !important;
  color: #065f46 !important;
  border: 1px solid #6ee7b7 !important;
  border-bottom: none !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-blu .v-tab--selected,
[data-theme="light"] .active-tab-theme-blu .v-tab--selected {
  background: linear-gradient(180deg, #dbeafe 0%, #bfdbfe 100%) !important;
  color: #1e40af !important;
  border: 1px solid #93c5fd !important;
  border-bottom: none !important;
}

[data-theme="light"] .day-tabs-header-bar .v-tab--selected .tab-day-letter,
[data-theme="light"] .day-tabs-header-bar .v-tab--selected span,
[data-theme="light"] .day-tabs-header-bar .v-tab--selected .v-icon {
  color: #065f46 !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-blu .v-tab--selected .tab-day-letter,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-blu .v-tab--selected span,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-blu .v-tab--selected .v-icon {
  color: #1e40af !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-fucsia {
  background: #fdf2f8 !important;
  border: 1px solid #fbcfe8 !important;
  border-bottom: none !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  box-shadow: none !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-fucsia .v-tab:not(.v-tab--selected) {
  background: #fce7f3 !important;
  color: #9d174d !important;
  opacity: 0.85 !important;
  border-right: 1px solid #fbcfe8 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-fucsia .v-tab:not(.v-tab--selected) .tab-day-letter {
  color: #831843 !important;
  font-weight: 800 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-fucsia .v-tab:not(.v-tab--selected) .tab-lock-icon {
  color: #db2777 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-fucsia .v-tab--selected,
[data-theme="light"] .active-tab-theme-fucsia .v-tab--selected {
  background: linear-gradient(180deg, #fce7f3 0%, #fbcfe8 100%) !important;
  color: #9d174d !important;
  border: 1px solid #f472b6 !important;
  border-bottom: none !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-fucsia .v-tab--selected .tab-day-letter,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-fucsia .v-tab--selected span,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-fucsia .v-tab--selected .v-icon {
  color: #9d174d !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-giallo {
  background: #fefce8 !important;
  border: 1px solid #fef08a !important;
  border-bottom: none !important;
  border-top-left-radius: 16px !important;
  border-top-right-radius: 16px !important;
  box-shadow: none !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-giallo .v-tab:not(.v-tab--selected) {
  background: #fef9c3 !important;
  color: #854d0e !important;
  opacity: 0.85 !important;
  border-right: 1px solid #fef08a !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-giallo .v-tab:not(.v-tab--selected) .tab-day-letter {
  color: #713f12 !important;
  font-weight: 800 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-giallo .v-tab:not(.v-tab--selected) .tab-lock-icon {
  color: #a16207 !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-giallo .v-tab--selected,
[data-theme="light"] .active-tab-theme-giallo .v-tab--selected {
  background: linear-gradient(180deg, #fef08a 0%, #fde047 100%) !important;
  color: #713f12 !important;
  border: 1px solid #eab308 !important;
  border-bottom: none !important;
}

[data-theme="light"] .day-tabs-header-bar.active-tab-theme-giallo .v-tab--selected .tab-day-letter,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-giallo .v-tab--selected span,
[data-theme="light"] .day-tabs-header-bar.active-tab-theme-giallo .v-tab--selected .v-icon {
  color: #713f12 !important;
  font-weight: 900 !important;
}

/* Light Theme Header Sections */
[data-theme="light"] .day-header-section.tema-arancio {
  background: linear-gradient(180deg, #ffedd5 0%, #fff7ed 100%) !important;
  color: #9a3412 !important;
  border: none !important;
}

[data-theme="light"] .day-header-section.tema-blu {
  background: linear-gradient(180deg, #bfdbfe 0%, #eff6ff 100%) !important;
  color: #1e40af !important;
  border: none !important;
}

[data-theme="light"] .day-header-section.tema-verde {
  background: linear-gradient(180deg, #a7f3d0 0%, #ecfdf5 100%) !important;
  color: #065f46 !important;
  border: none !important;
}

[data-theme="light"] .day-header-section.tema-fucsia {
  background: linear-gradient(180deg, #fbcfe8 0%, #fdf2f8 100%) !important;
  color: #831843 !important;
  border: none !important;
}

[data-theme="light"] .day-header-section.tema-giallo {
  background: linear-gradient(180deg, #fef08a 0%, #fefce8 100%) !important;
  color: #713f12 !important;
  border: none !important;
}

/* Titles in Light Mode */
[data-theme="light"] .day-header-section.tema-arancio .header-title-text,
[data-theme="light"] .day-header-section.tema-arancio h3.header-title-text {
  color: #c2410c !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-header-section.tema-blu .header-title-text,
[data-theme="light"] .day-header-section.tema-blu h3.header-title-text {
  color: #1e40af !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-header-section.tema-verde .header-title-text,
[data-theme="light"] .day-header-section.tema-verde h3.header-title-text {
  color: #047857 !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-header-section.tema-fucsia .header-title-text,
[data-theme="light"] .day-header-section.tema-fucsia h3.header-title-text {
  color: #be185d !important;
  font-weight: 900 !important;
}

[data-theme="light"] .day-header-section.tema-giallo .header-title-text,
[data-theme="light"] .day-header-section.tema-giallo h3.header-title-text {
  color: #854d0e !important;
  font-weight: 900 !important;
}

/* Info text in Light Mode */
[data-theme="light"] .day-header-section.tema-arancio .header-info-text,
[data-theme="light"] .day-header-section.tema-arancio .header-info-text span {
  color: #9a3412 !important;
  font-weight: 700 !important;
}

[data-theme="light"] .day-header-section.tema-blu .header-info-text,
[data-theme="light"] .day-header-section.tema-blu .header-info-text span {
  color: #1e3a8a !important;
  font-weight: 700 !important;
}

[data-theme="light"] .day-header-section.tema-verde .header-info-text,
[data-theme="light"] .day-header-section.tema-verde .header-info-text span {
  color: #065f46 !important;
  font-weight: 700 !important;
}

[data-theme="light"] .day-header-section.tema-fucsia .header-info-text,
[data-theme="light"] .day-header-section.tema-fucsia .header-info-text span {
  color: #831843 !important;
  font-weight: 700 !important;
}

[data-theme="light"] .day-header-section.tema-giallo .header-info-text,
[data-theme="light"] .day-header-section.tema-giallo .header-info-text span {
  color: #713f12 !important;
  font-weight: 700 !important;
}

/* Progress text in Light Mode */
[data-theme="light"] .day-header-section.tema-arancio .header-progress-text,
[data-theme="light"] .day-header-section.tema-arancio .header-progress-text span {
  color: #c2410c !important;
  font-weight: 800 !important;
}

[data-theme="light"] .day-header-section.tema-blu .header-progress-text,
[data-theme="light"] .day-header-section.tema-blu .header-progress-text span {
  color: #1d4ed8 !important;
  font-weight: 800 !important;
}

[data-theme="light"] .day-header-section.tema-verde .header-progress-text,
[data-theme="light"] .day-header-section.tema-verde .header-progress-text span {
  color: #047857 !important;
  font-weight: 800 !important;
}

[data-theme="light"] .day-header-section.tema-fucsia .header-progress-text,
[data-theme="light"] .day-header-section.tema-fucsia .header-progress-text span {
  color: #be185d !important;
  font-weight: 800 !important;
}

[data-theme="light"] .day-header-section.tema-giallo .header-progress-text,
[data-theme="light"] .day-header-section.tema-giallo .header-progress-text span {
  color: #854d0e !important;
  font-weight: 800 !important;
}

/* Big Letter Badge in Light Mode */
[data-theme="light"] .day-header-section.tema-arancio .giorno-big-letter {
  background: linear-gradient(135deg, #f97316 0%, #ea580c 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid #fdba74 !important;
  box-shadow: 0 2px 8px rgba(234, 88, 12, 0.25) !important;
}

[data-theme="light"] .day-header-section.tema-blu .giorno-big-letter {
  background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid #bfdbfe !important;
  box-shadow: 0 2px 8px rgba(29, 78, 216, 0.25) !important;
}

[data-theme="light"] .day-header-section.tema-verde .giorno-big-letter {
  background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid #a7f3d0 !important;
  box-shadow: 0 2px 8px rgba(4, 120, 87, 0.25) !important;
}

[data-theme="light"] .day-header-section.tema-fucsia .giorno-big-letter {
  background: linear-gradient(135deg, #ec4899 0%, #db2777 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid #fbcfe8 !important;
  box-shadow: 0 2px 8px rgba(219, 39, 119, 0.25) !important;
}

[data-theme="light"] .day-header-section.tema-giallo .giorno-big-letter {
  background: linear-gradient(135deg, #eab308 0%, #ca8a04 100%) !important;
  color: #ffffff !important;
  border: 1.5px solid #fef08a !important;
  box-shadow: 0 2px 8px rgba(161, 98, 7, 0.25) !important;
}

/* Completed Capsules in Light Mode */
[data-theme="light"] .day-header-section.tema-arancio .mini-week-capsule.capsule-completed {
  background: #ea580c !important;
  border-color: #c2410c !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section.tema-blu .mini-week-capsule.capsule-completed {
  background: #2563eb !important;
  border-color: #1d4ed8 !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section.tema-verde .mini-week-capsule.capsule-completed {
  background: #059669 !important;
  border-color: #047857 !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section.tema-fucsia .mini-week-capsule.capsule-completed {
  background: #db2777 !important;
  border-color: #be185d !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section.tema-giallo .mini-week-capsule.capsule-completed {
  background: #ca8a04 !important;
  border-color: #a16207 !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section .mini-week-capsule.capsule-completed .capsule-num,
[data-theme="light"] .day-header-section .mini-week-capsule.capsule-completed .v-icon {
  color: #ffffff !important;
}

/* Active Capsules in Light Mode */
[data-theme="light"] .day-header-section.tema-arancio .mini-week-capsule.capsule-active {
  background: #c2410c !important;
  border-color: #9a3412 !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section.tema-blu .mini-week-capsule.capsule-active {
  background: #1d4ed8 !important;
  border-color: #1e3a8a !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section.tema-verde .mini-week-capsule.capsule-active {
  background: #047857 !important;
  border-color: #065f46 !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section.tema-fucsia .mini-week-capsule.capsule-active {
  background: #be185d !important;
  border-color: #831843 !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section.tema-giallo .mini-week-capsule.capsule-active {
  background: #854d0e !important;
  border-color: #713f12 !important;
  color: #ffffff !important;
}

[data-theme="light"] .day-header-section .mini-week-capsule.capsule-active .capsule-num {
  color: #ffffff !important;
}

/* Pending Capsules in Light Mode */
[data-theme="light"] .day-header-section.tema-arancio .mini-week-capsule.capsule-pending {
  background: #ffffff !important;
  color: #c2410c !important;
  border: 1px solid #fed7aa !important;
}

[data-theme="light"] .day-header-section.tema-blu .mini-week-capsule.capsule-pending {
  background: #ffffff !important;
  color: #1d4ed8 !important;
  border: 1px solid #bfdbfe !important;
}

[data-theme="light"] .day-header-section.tema-verde .mini-week-capsule.capsule-pending {
  background: #ffffff !important;
  color: #047857 !important;
  border: 1px solid #a7f3d0 !important;
}

[data-theme="light"] .day-header-section.tema-fucsia .mini-week-capsule.capsule-pending {
  background: #ffffff !important;
  color: #be185d !important;
  border: 1px solid #fbcfe8 !important;
}

[data-theme="light"] .day-header-section.tema-giallo .mini-week-capsule.capsule-pending {
  background: #ffffff !important;
  color: #a16207 !important;
  border: 1px solid #fef08a !important;
}

[data-theme="light"] .day-header-section.tema-arancio .mini-week-capsule.capsule-pending .capsule-num {
  color: #c2410c !important;
}
[data-theme="light"] .day-header-section.tema-blu .mini-week-capsule.capsule-pending .capsule-num {
  color: #1d4ed8 !important;
}
[data-theme="light"] .day-header-section.tema-verde .mini-week-capsule.capsule-pending .capsule-num {
  color: #047857 !important;
}
[data-theme="light"] .day-header-section.tema-fucsia .mini-week-capsule.capsule-pending .capsule-num {
  color: #be185d !important;
}
[data-theme="light"] .day-header-section.tema-giallo .mini-week-capsule.capsule-pending .capsule-num {
  color: #a16207 !important;
}

/* Progress bar in Dark & Light Modes */
.session-progress-bar-container {
  background: rgba(0, 0, 0, 0.4) !important;
  border: 1px solid rgba(255, 255, 255, 0.15) !important;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.4) !important;
}

.day-header-section.tema-arancio .session-progress-bar-fill {
  background: linear-gradient(90deg, #ea580c, #f97316) !important;
  box-shadow: 0 0 10px rgba(249, 115, 22, 0.7) !important;
}

.day-header-section.tema-verde .session-progress-bar-fill {
  background: linear-gradient(90deg, #059669, #10b981) !important;
  box-shadow: 0 0 10px rgba(16, 185, 129, 0.7) !important;
}

.day-header-section.tema-blu .session-progress-bar-fill {
  background: linear-gradient(90deg, #2563eb, #60a5fa) !important;
  box-shadow: 0 0 10px rgba(96, 165, 250, 0.7) !important;
}

.day-header-section.tema-fucsia .session-progress-bar-fill {
  background: linear-gradient(90deg, #db2777, #ec4899) !important;
  box-shadow: 0 0 10px rgba(236, 72, 153, 0.7) !important;
}

.day-header-section.tema-giallo .session-progress-bar-fill {
  background: linear-gradient(90deg, #ca8a04, #facc15) !important;
  box-shadow: 0 0 10px rgba(234, 179, 8, 0.7) !important;
}

[data-theme="light"] .day-header-section.tema-arancio .session-progress-bar-container {
  background: #fed7aa !important;
  border: 1px solid #fdba74 !important;
}
[data-theme="light"] .day-header-section.tema-arancio .session-progress-bar-fill {
  background: linear-gradient(90deg, #ea580c, #c2410c) !important;
  box-shadow: 0 0 8px rgba(234, 88, 12, 0.4) !important;
}

[data-theme="light"] .day-header-section.tema-blu .session-progress-bar-container {
  background: #bfdbfe !important;
  border-color: #93c5fd !important;
}
[data-theme="light"] .day-header-section.tema-blu .session-progress-bar-fill {
  background: linear-gradient(90deg, #3b82f6, #1d4ed8) !important;
  box-shadow: 0 0 8px rgba(59, 130, 246, 0.4) !important;
}

[data-theme="light"] .day-header-section.tema-verde .session-progress-bar-container {
  background: #a7f3d0 !important;
  border-color: #6ee7b7 !important;
}
[data-theme="light"] .day-header-section.tema-verde .session-progress-bar-fill {
  background: linear-gradient(90deg, #059669, #047857) !important;
  box-shadow: 0 0 8px rgba(5, 150, 105, 0.4) !important;
}

[data-theme="light"] .day-header-section.tema-fucsia .session-progress-bar-container {
  background: #fbcfe8 !important;
  border-color: #f472b6 !important;
}
[data-theme="light"] .day-header-section.tema-fucsia .session-progress-bar-fill {
  background: linear-gradient(90deg, #ec4899, #db2777) !important;
  box-shadow: 0 0 8px rgba(236, 72, 153, 0.4) !important;
}

[data-theme="light"] .day-header-section.tema-giallo .session-progress-bar-container {
  background: #fef08a !important;
  border-color: #fde047 !important;
}
[data-theme="light"] .day-header-section.tema-giallo .session-progress-bar-fill {
  background: linear-gradient(90deg, #ca8a04, #a16207) !important;
  box-shadow: 0 0 8px rgba(202, 138, 4, 0.4) !important;
}

[data-theme="light"] .workout-session-container {
  background: #ffffff !important;
  border: 1px solid #a7f3d0 !important;
  border-top: none !important;
  box-shadow: 0 4px 20px rgba(16, 185, 129, 0.08) !important;
}

[data-theme="light"] .day-exercises-section {
  background: #ffffff !important;
}
.tema-blu .giorno-big-letter {
  background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
  box-shadow: 0 4px 10px rgba(30, 64, 175, 0.35) !important;
}
.tema-verde .giorno-big-letter {
  background: linear-gradient(135deg, #065f46, #10b981) !important;
  box-shadow: 0 4px 10px rgba(6, 95, 70, 0.35) !important;
}
.tema-giallo .giorno-big-letter {
  background: linear-gradient(135deg, #854d0e, #eab308) !important;
  box-shadow: 0 4px 10px rgba(133, 77, 14, 0.35) !important;
}

/* Overrides per capsule-active dentro il header */
.tema-blu .mini-week-capsule.capsule-active {
  background: linear-gradient(135deg, #1e40af, #3b82f6) !important;
  box-shadow: 0 0 12px rgba(59, 130, 246, 0.6) !important;
  animation: pulse-blue-glow 2s infinite alternate !important;
}
.tema-verde .mini-week-capsule.capsule-active {
  background: linear-gradient(135deg, #065f46, #10b981) !important;
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.6) !important;
  animation: pulse-green-glow 2s infinite alternate !important;
}
.tema-giallo .mini-week-capsule.capsule-active {
  background: linear-gradient(135deg, #854d0e, #eab308) !important;
  box-shadow: 0 0 12px rgba(234, 179, 8, 0.6) !important;
  animation: pulse-yellow-glow 2s infinite alternate !important;
}

@keyframes pulse-blue-glow {
  0% { box-shadow: 0 0 8px rgba(59, 130, 246, 0.4); }
  100% { box-shadow: 0 0 16px rgba(59, 130, 246, 0.8); }
}
@keyframes pulse-green-glow {
  0% { box-shadow: 0 0 8px rgba(16, 185, 129, 0.4); }
  100% { box-shadow: 0 0 16px rgba(16, 185, 129, 0.8); }
}

.heatmap-container {
  box-shadow: inset 0 0 10px rgba(0, 0, 0, 0.5);
  transition: border-color 0.3s ease;
}

.recovery-compact-input :deep(.v-field) {
  height: 26px !important;
  font-size: 0.62rem !important;
  background: var(--v-field-bg) !important;
  border: 1px solid var(--v-field-border) !important;
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
}
.recovery-compact-input :deep(.v-field__input) {
  padding: 0 !important;
  min-height: 26px !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
}
.recovery-compact-input :deep(input::placeholder) {
  font-size: 0.62rem !important;
  opacity: 0.55 !important;
  text-align: center !important;
}
.recovery-compact-input :deep(.v-field--focused) {
  background: var(--v-field-bg) !important;
  border-color: var(--theme-primary) !important;
  box-shadow: 0 0 10px var(--theme-primary-glow) !important;
}
.recovery-compact-input :deep(.v-field__outline) {
  display: none !important;
}

.custom-compact-input :deep(.v-field) {
  height: 32px !important;
  font-size: 0.75rem !important;
  background: var(--v-field-bg) !important;
  border: 1px solid var(--v-field-border) !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}
.custom-compact-input :deep(.v-field--focused) {
  background: var(--v-field-bg) !important;
  border-color: var(--theme-primary) !important;
  box-shadow: 0 0 10px var(--theme-primary-glow) !important;
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

/* Card esercizio completato con sfumatura verde premium */
.exercise-item-card.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.18) 0%, rgba(30, 41, 59, 0.75) 100%) !important;
  border-color: rgba(16, 185, 129, 0.45) !important;
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.25), inset 0 0 16px rgba(16, 185, 129, 0.1) !important;
}

.exercise-item-card.completed:hover {
  border-color: rgba(16, 185, 129, 0.6) !important;
  box-shadow: 0 12px 30px -10px rgba(16, 185, 129, 0.25) !important;
}

/* Superset card completata - Preserva sempre la barra laterale a sinistra */
.superset-group-card.completed {
  background: linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(30, 41, 59, 0.75) 100%) !important;
  border-color: rgba(16, 185, 129, 0.35) !important;
  border-left: 3.5px solid var(--theme-primary) !important;
}

/* Stili adattivi per Micro-Capsule (Dark Mode e Light Mode) */
.micro-capsule {
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 8px;
  font-weight: 900;
  border: 1px solid transparent;
  transition: all 0.2s ease;
}

/* 1. Durata (Time) */
.micro-capsule-time {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(255, 255, 255, 0.15) !important;
  color: #f1f5f9;
}
[data-theme="light"] .micro-capsule-time {
  background: rgba(15, 23, 42, 0.08);
  border-color: rgba(15, 23, 42, 0.22) !important;
  color: #0f172a;
}

/* 2. Calorie (Kcal) */
.micro-capsule-kcal {
  background: rgba(249, 115, 22, 0.12);
  border-color: rgba(249, 115, 22, 0.35) !important;
  color: #fdba74;
}
[data-theme="light"] .micro-capsule-kcal {
  background: rgba(234, 88, 12, 0.12);
  border-color: rgba(234, 88, 12, 0.40) !important;
  color: #9a3412;
}

/* 3. Cardio */
.micro-capsule-cardio {
  background: rgba(45, 212, 191, 0.12);
  border-color: rgba(45, 212, 191, 0.35) !important;
  color: #2dd4bf;
}
[data-theme="light"] .micro-capsule-cardio {
  background: rgba(13, 148, 136, 0.14);
  border-color: rgba(13, 148, 136, 0.40) !important;
  color: #0f766e;
}

/* 4. Densità / Fisiologia */
.micro-capsule-density.density-forza {
  background: rgba(56, 189, 248, 0.12);
  border-color: rgba(56, 189, 248, 0.35) !important;
  color: #38bdf8;
}
[data-theme="light"] .micro-capsule-density.density-forza {
  background: rgba(2, 132, 199, 0.14);
  border-color: rgba(2, 132, 199, 0.40) !important;
  color: #0369a1;
}

.micro-capsule-density.density-ipertrofia {
  background: rgba(52, 211, 153, 0.12);
  border-color: rgba(52, 211, 153, 0.35) !important;
  color: #34d399;
}
[data-theme="light"] .micro-capsule-density.density-ipertrofia {
  background: rgba(5, 150, 105, 0.14);
  border-color: rgba(5, 150, 105, 0.40) !important;
  color: #047857;
}

.micro-capsule-density.density-lattacido {
  background: rgba(251, 191, 36, 0.15);
  border-color: rgba(251, 191, 36, 0.35) !important;
  color: #fbbf24;
}
[data-theme="light"] .micro-capsule-density.density-lattacido {
  background: rgba(217, 119, 6, 0.16);
  border-color: rgba(217, 119, 6, 0.45) !important;
  color: #92400e;
}

.micro-capsule-density.density-metabolico {
  background: rgba(248, 113, 113, 0.12);
  border-color: rgba(248, 113, 113, 0.35) !important;
  color: #f87171;
}
[data-theme="light"] .micro-capsule-density.density-metabolico {
  background: rgba(220, 38, 38, 0.14);
  border-color: rgba(220, 38, 38, 0.40) !important;
  color: #b91c1c;
}

/* Singoli esercizi completati all'interno della superserie */
.superset-exercise-item.completed {
  background-color: rgba(16, 185, 129, 0.08) !important;
}
</style>