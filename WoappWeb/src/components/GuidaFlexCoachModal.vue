<template>
  <v-dialog
    v-model="dialogVisibile"
    max-width="580"
    class="guida-dialog-mobile"
    scrollable
    transition="dialog-bottom-transition"
  >
    <v-card class="card-glass-dark rounded-2xl border overflow-hidden" :style="{ backdropFilter: 'blur(25px)' }">
      <!-- 1. Header con Titolo, Bottone Tour e Chiusura Touch -->
      <v-card-title class="guida-header d-flex align-center justify-space-between" :style="{ background: 'var(--card-bg-dark, #0f172a)' }">
        <div class="d-flex align-center text-truncate" style="max-width: 68%;">
          <v-icon :style="{ color: 'var(--theme-primary, #f97316)' }" size="20" class="mr-2 flex-shrink-0">
            mdi-book-open-page-variant
          </v-icon>
          <span class="font-weight-black dialog-text-primary text-truncate" style="font-size: 0.92rem; letter-spacing: -0.01em;">
            Guida FlexCoach
          </span>
        </div>
        <div class="d-flex align-center gap-1.5">
          <v-btn
            variant="flat"
            size="x-small"
            class="font-weight-black text-white px-2.5 rounded-lg text-none d-flex align-center shadow-sm"
            style="font-size: 0.64rem; height: 26px;"
            :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316)) !important' }"
            @click="avviaTour"
          >
            <v-icon size="13" class="mr-1">mdi-rocket-launch</v-icon>
            Tour
          </v-btn>
          <v-btn icon variant="text" width="30" height="30" color="grey" @click="chiudiGuida">
            <v-icon size="18">mdi-close</v-icon>
          </v-btn>
        </div>
      </v-card-title>

      <!-- 2. Searchbar Compatta & Navigazione Categorie a Scorrimento Fluido -->
      <div class="guida-nav-section">
        <v-text-field
          v-model="cercaTesto"
          placeholder="🔍 Cerca nella guida... (es. e1RM, r, infortuni, timer)"
          density="compact"
          variant="outlined"
          hide-details
          clearable
          class="guida-search-field mb-2"
        ></v-text-field>

        <!-- Category Tab Pills con Scroll Orizzontale Fluido -->
        <div class="guida-tabs-container" :style="{ background: 'var(--card-bg-glass, #0f172a)', border: '1px solid var(--card-border, rgba(255,255,255,0.12))' }">
          <button
            v-for="(tab, i) in tabs"
            :key="i"
            type="button"
            class="guida-tab-pill d-flex align-center"
            :class="{ 'is-active': activeTab === i }"
            @click="activeTab = i"
          >
            <v-icon size="13" class="mr-1">{{ tab.icon }}</v-icon>
            <span>{{ tab.label }}</span>
          </button>
        </div>
      </div>

      <!-- 3. Contenuto Principale Scrollabile -->
      <v-card-text class="guida-scroll-area text-left">
        <v-window v-model="activeTab">
          <!-- ══════════════════════════════════════════════════════════════
               TAB 0: STRATEGIA COACH & 6 SETTIMANE
               ══════════════════════════════════════════════════════════════ -->
          <v-window-item :value="0">
            <div class="pb-2">
              <h4 class="guida-card-title mb-2">
                <v-icon size="17" color="orange-darken-2">mdi-brain</v-icon>
                <span>Strategia Coach & Massimale Stimato</span>
              </h4>
              <p class="guida-card-body mb-3">
                Il motore <strong>FlexCoach</strong> confronta il massimale stimato corrente (<strong>e1RM</strong>) con il record storico dell'esercizio per calcolare i carichi ideali seduta dopo seduta.
              </p>

              <!-- Calcolatore Interattivo e1RM -->
              <div class="guida-card mb-3">
                <div class="d-flex align-center justify-space-between mb-2">
                  <span class="text-super-caption font-weight-black uppercase" :style="{ color: 'var(--theme-primary, #ea580c)' }" style="font-size: 0.64rem; letter-spacing: 0.05em;">
                    Simulatore e1RM
                  </span>
                  <v-chip size="x-small" variant="flat" class="font-weight-black text-white px-2" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316))' }" style="font-size: 0.54rem; height: 18px;">
                    INTERATTIVO
                  </v-chip>
                </div>

                <div class="d-flex align-center gap-2 mb-2">
                  <v-text-field
                    v-model.number="simPeso"
                    label="Peso (kg)"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="flex-grow-1"
                  ></v-text-field>
                  <v-text-field
                    v-model.number="simReps"
                    label="Reps"
                    type="number"
                    density="compact"
                    variant="outlined"
                    hide-details
                    class="flex-grow-1"
                  ></v-text-field>
                </div>

                <div class="pa-2 rounded-lg text-center border-soft" :style="{ background: 'var(--card-bg-soft, #f8fafc)' }">
                  <span class="text-super-caption font-weight-bold d-block mb-0.5" :style="{ color: 'var(--text-muted, #64748b)' }" style="font-size: 0.62rem;">
                    Massimale Stimato (e1RM):
                  </span>
                  <span class="text-subtitle-1 font-weight-black d-block" :style="{ color: 'var(--theme-primary, #ea580c)' }" style="font-size: 1.10rem; line-height: 1.2;">
                    {{ calcolaE1RM }} kg
                  </span>
                </div>
              </div>

              <!-- Struttura del Mesociclo (6 Settimane) -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-2">
                  <v-icon size="16" color="orange-darken-2">mdi-calendar-sync</v-icon>
                  <span>Struttura del Mesociclo (6 Settimane)</span>
                </div>
                <div class="d-flex flex-column gap-1.5">
                  <div class="guida-callout guida-callout-orange">
                    <div class="callout-title font-weight-black mb-0.5" style="font-size: 0.73rem;">
                      Week 1 (Target)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Test iniziale per tarare il livello attuale e verificare il massimale stimato.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-blue">
                    <div class="callout-title font-weight-black mb-0.5" style="font-size: 0.73rem;">
                      Week 2 & 3 (Accumulo)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Progressione di volume o carico in base ai parametri impostati dal Coach.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-green">
                    <div class="callout-title font-weight-black mb-0.5" style="font-size: 0.73rem;">
                      Week 4 (Scarico Attivo)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Riduzione strategica dell'intensità (-15%) per consentire il pieno recupero neurale.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-amber">
                    <div class="callout-title font-weight-black mb-0.5" style="font-size: 0.73rem;">
                      Week 5 (Consolidamento)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Supercompensazione post-scarico con ripresa di carichi elevati.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-red">
                    <div class="callout-title font-weight-black mb-0.5" style="font-size: 0.73rem;">
                      Week 6 (Test / Peak)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Verifica dei nuovi massimali e test di superamento PR.
                    </div>
                  </div>
                </div>
              </div>

              <!-- Record Personale & Stella PR -->
              <div class="guida-card">
                <div class="guida-card-title title-amber mb-1">
                  <v-icon size="16" color="amber-darken-2">mdi-trophy-outline</v-icon>
                  <span>Record Personale & Stella PR</span>
                </div>
                <p class="guida-card-body mb-0">
                  Quando superi il tuo record storico stimato, l'app mostra una stella dorata 🌟 nel box di riepilogo e aggiorna automaticamente i parametri per i cicli successivi.
                </p>
              </div>
            </div>
          </v-window-item>

          <!-- ══════════════════════════════════════════════════════════════
               TAB 1: PROPOSTA CARICO, REPS 'r', PROGRESSIONE & ECCEZIONI
               ══════════════════════════════════════════════════════════════ -->
          <v-window-item :value="1">
            <div class="pb-2">
              <h4 class="guida-card-title mb-2">
                <v-icon size="17" color="orange-darken-2">mdi-scale-balance</v-icon>
                <span>Proposta Carico & Sintassi Inserimento</span>
              </h4>
              <p class="guida-card-body mb-3">
                Il motore <strong>FlexCoach</strong> calcola il peso consigliato in base ai tempi di recupero, alla fatica registrata e allo storico delle sedute.
              </p>

              <!-- 1. Sintassi Reps con r -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-pencil-outline</v-icon>
                  <span>Inserimento Reps con "r" (es. 50 12r)</span>
                </div>
                <p class="guida-card-body mb-0">
                  Se mantieni lo stesso peso aumentando le ripetizioni, inserisci il numero seguito da <strong>"r"</strong> (es. <code class="px-1.5 py-0.5 rounded font-weight-bold">50 12r</code> o <code class="px-1.5 py-0.5 rounded font-weight-bold">25 x11r</code>). Il sistema registra l'aumento di volume e adegua la progressione per la settimana successiva.
                </p>
              </div>

              <!-- 2. Sezione Cambio Palestra & Carrucole -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-2.5">
                  <v-icon size="17" color="orange-darken-2">mdi-weight-lifter</v-icon>
                  <span>Cambio Palestra & Carrucole Diverse</span>
                </div>

                <!-- Box Regola d'Oro Parentesi -->
                <div class="guida-callout guida-callout-amber mb-2">
                  <div class="d-flex align-center gap-1.5 mb-1">
                    <v-icon size="15" color="amber-darken-2">mdi-crown</v-icon>
                    <span class="callout-title" style="font-size: 0.74rem;">REGOLA D'ORO DELLE PARENTESI ( ... )</span>
                  </div>
                  <p class="callout-body mb-0" style="font-size: 0.71rem; line-height: 1.45;">
                    Tutto ciò che racchiudi tra <strong>parentesi ( ... )</strong> viene <strong>totalmente escluso</strong> dai calcoli di progressione e massimali. I numeri tra parentesi non genereranno mai falsi record!
                  </p>
                </div>

                <!-- Come registrare in trasferta -->
                <div class="guida-callout guida-callout-green mb-2">
                  <div class="d-flex align-center gap-1.5 mb-1">
                    <v-icon size="15" color="green-darken-2">mdi-check-circle-outline</v-icon>
                    <span class="callout-title" style="font-size: 0.73rem;">Come registrare in trasferta:</span>
                  </div>
                  <div class="callout-body" style="font-size: 0.71rem; line-height: 1.4;">
                    Scrivi prima il carico standard e sotto tra parentesi il dato della palestra ospite:
                    <div class="guida-code-box">
                      25 x11r<br>
                      (45 x11r x2s Green Theory)
                    </div>
                  </div>
                </div>

                <!-- Errore da evitare -->
                <div class="guida-callout guida-callout-red mb-2">
                  <div class="d-flex align-center gap-1.5 mb-1">
                    <v-icon size="15" color="red-darken-2">mdi-alert-circle-outline</v-icon>
                    <span class="callout-title" style="font-size: 0.73rem;">Errore da evitare (falso PR):</span>
                  </div>
                  <p class="callout-body mb-0" style="font-size: 0.71rem; line-height: 1.4;">
                    Scrivere <code class="px-1 font-weight-bold">45 (Green Theory)</code> registra 45 come record! Inserisci sempre i kg <strong>DENTRO</strong> le parentesi: <code class="px-1 font-weight-bold">(45kg Green Theory)</code>.
                  </p>
                </div>

                <!-- Carrucole e Pulegge -->
                <div class="guida-callout guida-callout-blue mb-2">
                  <div class="d-flex align-center gap-1.5 mb-1">
                    <v-icon size="15" color="blue-darken-2">mdi-cog-sync-outline</v-icon>
                    <span class="callout-title" style="font-size: 0.73rem;">Carrucole e Pulegge:</span>
                  </div>
                  <div class="callout-body" style="font-size: 0.71rem; line-height: 1.42;">
                    • <strong>Diretta (1:1):</strong> 25 kg selezionati = 25 kg effettivi.<br>
                    • <strong>Doppia/Dimezzata (2:1):</strong> Carico dimezzato. Per 25 kg reali imposta <strong>50 kg</strong> (il doppio) sul selettore.
                  </div>
                </div>

                <!-- Metodo RPE -->
                <div class="guida-callout guida-callout-orange mb-0">
                  <div class="d-flex align-center gap-1.5 mb-1">
                    <v-icon size="15" color="orange-darken-2">mdi-bullseye-arrow</v-icon>
                    <span class="callout-title" style="font-size: 0.73rem;">Lavoro a RPE (Sforzo Percepito):</span>
                  </div>
                  <p class="callout-body mb-0" style="font-size: 0.71rem; line-height: 1.42;">
                    Su macchine ignote, cerca lo stesso sforzo (<strong>RPE 8-9</strong>) alle reps target. Conferma il carico consigliato e annota le sensazioni tra parentesi.
                  </p>
                </div>
              </div>

              <!-- 3. Ottimizza Note & Risalto Dati -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-format-size</v-icon>
                  <span>Ottimizza Note & Risalto Dati</span>
                </div>
                <div class="guida-card-body">
                  <p class="mb-1.5">
                    • <strong>Ottimizza Note:</strong> Nelle <em>Impostazioni Utente</em> puoi attivare l'ottimizzazione per eliminare qualsiasi rallentamento durante la digitazione su smartphone. I dati vengono sincronizzati all'uscita dal campo.<br>
                    • <strong>Gerarchia Tipografica Automatica:</strong>
                  </p>

                  <!-- Box Esempio con varianti Light/Dark -->
                  <div class="guida-example-box">
                    <div class="d-flex align-center gap-2 mb-1">
                      <span class="val-carico text-caption" style="font-size: 0.88rem;">62,5 kg</span>
                      <span class="val-desc">→ Carico (Massimo risalto)</span>
                    </div>
                    <div class="d-flex align-center gap-2 mb-1">
                      <span class="val-reps text-caption" style="font-size: 0.78rem;">x7r</span>
                      <span class="val-desc">→ Ripetizioni (Risalto medio)</span>
                    </div>
                    <div class="d-flex align-center gap-2">
                      <span class="val-note text-caption" style="font-size: 0.70rem;">(nota / pin 4 / rpe 8)</span>
                      <span class="val-desc">→ Note, gradi e parentesi (Piccolo)</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. Pulsante R? / Recupero Serie -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-bookmark-outline</v-icon>
                  <span>Pulsante R? / Recupero Serie</span>
                </div>
                <p class="guida-card-body mb-0">
                  L'etichetta <strong>R? 🔖</strong> situata all'interno del box del carico è un <strong>unico pulsante di contrassegno</strong>. Toccandolo imposti lo stato <code>DA COMPLETARE</code> per ricordarti di recuperare serie mancanti a fine allenamento.
                </p>
              </div>

              <!-- 5. Cronologia Sessioni & Storico -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-history</v-icon>
                  <span>Cronologia Sessioni & Storico</span>
                </div>
                <p class="guida-card-body mb-0">
                  L'icona dell'orologio apre la panoramica delle sessioni svolte nei mesocicli precedenti con carichi, ripetizioni, note e livello di fatica.
                </p>
              </div>

              <!-- 6. Attitudine alla Progressione & Gestione Carichi -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-2">
                  <v-icon size="16" color="orange-darken-2">mdi-trending-up</v-icon>
                  <span>Attitudine alla Progressione (Sensibilità)</span>
                </div>
                <p class="guida-card-body mb-2" style="font-size: 0.70rem;">
                  Il motore di calcolo unificato valuta costantemente l'1RM, le ripetizioni completate e lo storico mesocicli, proponendo il target ideale in base all'attitudine selezionata:
                </p>
                <div class="d-flex flex-column gap-1.5">
                  <div class="guida-callout guida-callout-blue">
                    <div class="callout-title mb-0.5" style="font-size: 0.72rem;">
                      🛡️ Prudente (Safe)
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Privilegia l'accumulo di ripetizioni (+1r) e il volume prima di incrementare i kg. Ideale in ipocalorica, atleti master o tutela articolare.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-green">
                    <div class="callout-title mb-0.5" style="font-size: 0.72rem;">
                      ⚖️ Bilanciata (Smart - Default)
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Progressione fisiologica intelligente calcolata su 1RM e step attrezzo, con avanzamento bilanciato e allineamento istantaneo tra Ghost e Dialog.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-red">
                    <div class="callout-title mb-0.5" style="font-size: 0.72rem;">
                      🔥 Spinta (Sfidante / PR)
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Massimizza il sovraccarico progressivo puntando subito allo step superiore (+Kg) o all'attacco diretto al record storico dell'esercizio.
                    </div>
                  </div>
                </div>
              </div>

              <!-- 7. Analisi Sforzo da Note -->
              <div class="guida-card mb-0">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-magnify</v-icon>
                  <span>Analisi Sforzo da Note (Opzionale)</span>
                </div>
                <p class="guida-card-body mb-0">
                  Disattivata di default. Se abilitata nelle Impostazioni, intercetta parole chiave come <em>"difficile"</em> o <em>"limite"</em> per suggerire il consolidamento a pari carico.
                </p>
              </div>
            </div>
          </v-window-item>

          <!-- ══════════════════════════════════════════════════════════════
               TAB 2: ESERCIZI, TIMER & PULSANTI DI CONTROLLO
               ══════════════════════════════════════════════════════════════ -->
          <v-window-item :value="2">
            <div class="pb-2">
              <h4 class="guida-card-title mb-2">
                <v-icon size="17" color="orange-darken-2">mdi-timer-outline</v-icon>
                <span>Timer di Recupero</span>
              </h4>
              <p class="guida-card-body mb-3">
                Tocca il chip arancione del tempo di recupero (es. <code class="px-1.5 py-0.5 rounded font-weight-bold">1'30"-1'45"</code>) vicino all'esercizio per avviare il conto alla rovescia con suono e vibrazione.
              </p>

              <h4 class="guida-card-title mb-2 mt-4">
                <v-icon size="17" color="orange-darken-2">mdi-tune-vertical</v-icon>
                <span>Controlli Rapidi Esercizio</span>
              </h4>

              <div class="d-flex flex-column gap-2 mb-0">
                <div class="guida-card d-flex align-center gap-3 mb-0">
                  <v-avatar color="orange-darken-3" size="32" class="flex-shrink-0 text-white">
                    <v-icon size="18">mdi-arrow-left</v-icon>
                  </v-avatar>
                  <div>
                    <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.76rem;">Pulsante Precedente</span>
                    <span class="text-super-caption d-block" :style="{ color: 'var(--text-muted, #64748b)' }" style="font-size: 0.69rem; line-height: 1.35;">
                      Torna rapidamente all'esercizio o al giorno svolto in precedenza.
                    </span>
                  </div>
                </div>

                <div class="guida-card d-flex align-center gap-3 mb-0">
                  <v-avatar color="amber-darken-3" size="32" class="flex-shrink-0 text-white">
                    <v-icon size="18">mdi-star-outline</v-icon>
                  </v-avatar>
                  <div>
                    <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.76rem;">Gradimento Esercizio</span>
                    <span class="text-super-caption d-block" :style="{ color: 'var(--text-muted, #64748b)' }" style="font-size: 0.69rem; line-height: 1.35;">
                      Valuta l'esercizio con le stelle per comunicare al Coach le tue preferenze.
                    </span>
                  </div>
                </div>

                <div class="guida-card d-flex align-center gap-3 mb-0">
                  <v-avatar color="blue-darken-3" size="32" class="flex-shrink-0 text-white">
                    <v-icon size="18">mdi-dumbbell</v-icon>
                  </v-avatar>
                  <div>
                    <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.76rem;">Lista Test Week 6</span>
                    <span class="text-super-caption d-block" :style="{ color: 'var(--text-muted, #64748b)' }" style="font-size: 0.69rem; line-height: 1.35;">
                      Panoramica rapida degli esercizi con test massimale o AMRAP a Week 6.
                    </span>
                  </div>
                </div>

                <div class="guida-card d-flex align-center gap-3 mb-0">
                  <v-avatar color="purple-darken-3" size="32" class="flex-shrink-0 text-white">
                    <v-icon size="18">mdi-video-outline</v-icon>
                  </v-avatar>
                  <div>
                    <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.76rem;">Video Richiesto</span>
                    <span class="text-super-caption d-block" :style="{ color: 'var(--text-muted, #64748b)' }" style="font-size: 0.69rem; line-height: 1.35;">
                      Esercizi in cui il Coach richiede il video per verificare la corretta esecuzione.
                    </span>
                  </div>
                </div>

                <div class="guida-card d-flex align-center gap-3 mb-0">
                  <v-avatar color="orange-darken-4" size="32" class="flex-shrink-0 text-white">
                    <v-icon size="18">mdi-bookmark-outline</v-icon>
                  </v-avatar>
                  <div>
                    <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.76rem;">Recupero Serie (R?)</span>
                    <span class="text-super-caption d-block" :style="{ color: 'var(--text-muted, #64748b)' }" style="font-size: 0.69rem; line-height: 1.35;">
                      Tocca per contrassegnare rapidamente serie non completate da recuperare a fine seduta.
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </v-window-item>

          <!-- ══════════════════════════════════════════════════════════════
               TAB 3: GESTIONE INFORTUNI & SOSTITUZIONI
               ══════════════════════════════════════════════════════════════ -->
          <v-window-item :value="3">
            <div class="pb-2">
              <h4 class="guida-card-title mb-2">
                <v-icon size="17" color="orange-darken-2">mdi-bandage</v-icon>
                <span>Gestione Infortuni & Sostituzioni</span>
              </h4>
              <p class="guida-card-body mb-3">
                Gestione attiva di fastidi o dolori articolari senza interrompere l'allenamento.
              </p>

              <div class="guida-card mb-3">
                <div class="guida-card-title title-red mb-1">
                  <v-icon size="16" color="red-darken-2">mdi-stethoscope</v-icon>
                  <span>Segnalazione Fastidio / Dolore</span>
                </div>
                <p class="guida-card-body mb-0">
                  Accedi alla sezione <strong>Infortuni</strong> dalla barra inferiore per monitorare la zona anatomica interessata e informare il Coach con la scala vas del dolore.
                </p>
              </div>

              <div class="guida-card mb-3">
                <div class="guida-card-title title-blue mb-1">
                  <v-icon size="16" color="blue-darken-2">mdi-swap-horizontal-bold</v-icon>
                  <span>Sostituzione Esercizio in Sicurezza</span>
                </div>
                <p class="guida-card-body mb-0">
                  Alternative automatiche per mantenere lo stimolo muscolare target preservando l'articolazione dolente o l'attrezzo occupato.
                </p>
              </div>

              <div class="guida-card">
                <div class="guida-card-title title-amber mb-1">
                  <v-icon size="16" color="amber-darken-2">mdi-email-fast-outline</v-icon>
                  <span>Notifica Diretta al Coach</span>
                </div>
                <p class="guida-card-body mb-0">
                  Invia un avviso diretto al Coach per ricevere l'adeguamento tempestivo della scheda.
                </p>
              </div>
            </div>
          </v-window-item>

          <!-- ══════════════════════════════════════════════════════════════
               TAB 4: TEMI & PERSONALIZZAZIONE UX
               ══════════════════════════════════════════════════════════════ -->
          <v-window-item :value="4">
            <div class="pb-2">
              <h4 class="guida-card-title mb-2">
                <v-icon size="17" color="orange-darken-2">mdi-palette-outline</v-icon>
                <span>Stili & Temi Visivi</span>
              </h4>
              <p class="guida-card-body mb-3">
                Scegli tra modalità Scuro e Chiaro per personalizzare l'esperienza d'uso su qualsiasi dispositivo.
              </p>

              <div class="d-flex flex-column gap-2.5">
                <div
                  class="guida-card d-flex align-center justify-space-between cursor-pointer mb-0"
                  @click="applicaTema('dark', 'slate')"
                >
                  <div class="d-flex align-center">
                    <v-avatar color="purple-darken-4" size="36" class="mr-3 text-purple-lighten-2 flex-shrink-0">
                      <v-icon size="20">mdi-weather-night</v-icon>
                    </v-avatar>
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.78rem;">Tema Scuro OLED</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-muted, #64748b)' }" style="font-size: 0.67rem;">Interfaccia scura ad alto contrasto per allenamenti serali</span>
                    </div>
                  </div>
                  <v-chip size="x-small" variant="flat" class="font-weight-black text-white px-2.5" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316))' }">
                    Attiva
                  </v-chip>
                </div>

                <div
                  class="guida-card d-flex align-center justify-space-between cursor-pointer mb-0"
                  @click="applicaTema('light', 'slate')"
                >
                  <div class="d-flex align-center">
                    <v-avatar color="amber-lighten-4" size="36" class="mr-3 text-amber-darken-3 flex-shrink-0">
                      <v-icon size="20">mdi-white-balance-sunny</v-icon>
                    </v-avatar>
                    <div>
                      <span class="font-weight-black text-caption dialog-text-primary d-block" style="font-size: 0.78rem;">Tema Chiaro Arctic</span>
                      <span class="text-super-caption d-block" :style="{ color: 'var(--text-muted, #64748b)' }" style="font-size: 0.67rem;">Interfaccia luminosa ad altissima leggibilità diurna</span>
                    </div>
                  </div>
                  <v-chip size="x-small" variant="flat" class="font-weight-black text-white px-2.5" :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316))' }">
                    Attiva
                  </v-chip>
                </div>
              </div>
            </div>
          </v-window-item>
        </v-window>
      </v-card-text>

      <!-- 4. Footer con Chiusura e Safe Area -->
      <v-card-actions class="pa-3 border-top" :style="{ background: 'var(--card-bg-dark, #0f172a)' }">
        <v-btn
          variant="flat"
          block
          rounded="xl"
          height="38"
          class="font-weight-black text-white text-none shadow-sm"
          style="font-size: 0.80rem;"
          :style="{ background: 'var(--theme-btn-gradient, linear-gradient(135deg, #ea580c, #f97316)) !important' }"
          @click="chiudiGuida"
        >
          Chiudi Guida
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:modelValue', 'avvia-tour']);

const dialogVisibile = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

const activeTab = ref(0);
const cercaTesto = ref('');

const tabs = [
  { label: 'Strategia', icon: 'mdi-brain' },
  { label: 'Progressione', icon: 'mdi-trending-up' },
  { label: 'Esercizi & Timer', icon: 'mdi-timer-outline' },
  { label: 'Infortuni', icon: 'mdi-bandage' },
  { label: 'Temi & Stile', icon: 'mdi-palette-outline' }
];

// Simulatore 1RM
const simPeso = ref(80);
const simReps = ref(8);
const calcolaE1RM = computed(() => {
  if (!simPeso.value || !simReps.value) return 0;
  return Math.round(simPeso.value * (1 + 0.0333 * simReps.value));
});

// Switch Tab dinamico in base alla ricerca
watch(cercaTesto, (val) => {
  if (!val) return;
  const v = val.toLowerCase().trim();
  if (v.includes('e1rm') || v.includes('massimale') || v.includes('settiman') || v.includes('meso') || v.includes('stella') || v.includes('pr')) {
    activeTab.value = 0;
  } else if (v.includes('r') || v.includes('reps') || v.includes('parentes') || v.includes('trasfert') || v.includes('carrucol') || v.includes('rpe') || v.includes('not') || v.includes('propost')) {
    activeTab.value = 1;
  } else if (v.includes('timer') || v.includes('recuper') || v.includes('video') || v.includes('gradiment') || v.includes('control') || v.includes('precedent')) {
    activeTab.value = 2;
  } else if (v.includes('infortun') || v.includes('dolor') || v.includes('sostituz') || v.includes('fastidi')) {
    activeTab.value = 3;
  } else if (v.includes('tem') || v.includes('stil') || v.includes('color') || v.includes('chiar') || v.includes('scur') || v.includes('oled')) {
    activeTab.value = 4;
  }
});

const avviaTour = () => {
  emit('avvia-tour');
  dialogVisibile.value = false;
};

const chiudiGuida = () => {
  dialogVisibile.value = false;
};

const applicaTema = (theme, style) => {
  document.documentElement.setAttribute('data-theme', theme);
  document.documentElement.setAttribute('data-light-style', style);
  localStorage.setItem('woapp_theme', theme);
  localStorage.setItem('woapp_light_style', style);
};
</script>

<style scoped>
.guida-dialog-mobile {
  margin: 8px;
}
</style>
