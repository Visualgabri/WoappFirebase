<template>
  <v-dialog
    v-model="dialogVisibile"
    max-width="600"
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
          placeholder="🔍 Cerca nella guida... (es. rotta, ghost, dischi, step, pr, swipe)"
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
               TAB 0: STRATEGIA COACH, ROTTA 6 SETTIMANE & MASSIMALE
               ══════════════════════════════════════════════════════════════ -->
          <v-window-item :value="0">
            <div class="pb-2">
              <h4 class="guida-card-title mb-2">
                <v-icon size="17" color="orange-darken-2">mdi-brain</v-icon>
                <span>Strategia Coach & Rotta 6 Settimane</span>
              </h4>
              <p class="guida-card-body mb-3">
                Il motore <strong>FlexCoach</strong> combina il massimale teorico stimato (<strong>e1RM</strong>) con la rotta programmata per guidarti lungo l'intero mesociclo di 6 settimane, calcolando i carichi ideali seduta dopo seduta.
              </p>

              <!-- Rotta Predittiva & Dynamic Re-Anchoring -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-map-marker-path</v-icon>
                  <span>Rotta Predittiva & Dynamic Re-Anchoring</span>
                </div>
                <p class="guida-card-body mb-2" style="font-size: 0.71rem; line-height: 1.42;">
                  L'app proietta l'evoluzione del carico da <strong>W1 fino a W6</strong>. Se nelle prime settimane (W1, W2 o W3) la tua prestazione reale diverge da quella stimata, il sistema applica il <strong>Dynamic Re-Anchoring</strong>: la rotta si ricalibra automaticamente garantendo progressioni realistiche e sicure senza sovrastimare il target.
                </p>
                <div class="guida-callout guida-callout-amber">
                  <div class="d-flex align-center gap-1.5 mb-1">
                    <v-icon size="14" color="amber-darken-2">mdi-lightbulb-on-outline</v-icon>
                    <span class="callout-title" style="font-size: 0.73rem;">Come consultare la Rotta:</span>
                  </div>
                  <p class="callout-body mb-0" style="font-size: 0.70rem; line-height: 1.4;">
                    Tocca l'icona della <strong>lampadina 💡</strong> nel box di intestazione dell'esercizio per aprire la modale interattiva della <em>Strategia Coach</em>, con tutti i target week per week, RIR prescritto e note tecniche.
                  </p>
                </div>
              </div>

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
                      Week 1 (Target / Baseline)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Taratura del livello attuale e rilevamento del massimale stimato di partenza.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-blue">
                    <div class="callout-title font-weight-black mb-0.5" style="font-size: 0.73rem;">
                      Week 2 & 3 (Accumulo Progressivo)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Incremento di volume e sovraccarico in base ai parametri impostati dal Coach.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-green">
                    <div class="callout-title font-weight-black mb-0.5" style="font-size: 0.73rem;">
                      Week 4 (Scarico Attivo -15%)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Riduzione programmata dell'intensità (-15%) per consentire il pieno recupero neuromuscolare e articolare.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-amber">
                    <div class="callout-title font-weight-black mb-0.5" style="font-size: 0.73rem;">
                      Week 5 (Consolidamento)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Supercompensazione post-scarico con ripresa di carichi pesanti basata sulla prestazione reale.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-red">
                    <div class="callout-title font-weight-black mb-0.5" style="font-size: 0.73rem;">
                      Week 6 (Peak / Test Massimale)
                    </div>
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      Settimana decisiva: test di superamento del Record Personale (PR) o serie AMRAP (As Many Reps As Possible).
                    </div>
                  </div>
                </div>
              </div>

              <!-- Record Personale & Stella PR -->
              <div class="guida-card">
                <div class="guida-card-title title-amber mb-1">
                  <v-icon size="16" color="amber-darken-2">mdi-trophy-outline</v-icon>
                  <span>Record Personale (PR) & Stella Dorata</span>
                </div>
                <p class="guida-card-body mb-0">
                  Quando superi il tuo record storico stimato, l'app mostra una <strong>stella dorata 🌟</strong> e aggiorna automaticamente i massimali per i cicli futuri. In caso di pareggio esatto, il dato viene registrato come <em>Eguagliato</em> con precedenza allo storico.
                </p>
              </div>
            </div>
          </v-window-item>

          <!-- ══════════════════════════════════════════════════════════════
               TAB 1: PROPOSTA CARICO, GHOST SHIELD, SINTASSI & STEP ATTREZZO
               ══════════════════════════════════════════════════════════════ -->
          <v-window-item :value="1">
            <div class="pb-2">
              <h4 class="guida-card-title mb-2">
                <v-icon size="17" color="orange-darken-2">mdi-scale-balance</v-icon>
                <span>Proposta Carico & Sintassi di Inserimento</span>
              </h4>
              <p class="guida-card-body mb-3">
                Il motore calcola il peso e le reps consigliate in base all'attitudine, alla fatica e allo storico delle sedute.
              </p>

              <!-- 1. Stili di Visualizzazione Suggerimenti (Classico vs Multi-Chip) -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-view-grid-plus-outline</v-icon>
                  <span>Stili Suggerimento Carico (Classico vs Multi-Chip)</span>
                </div>
                <p class="guida-card-body mb-2" style="font-size: 0.71rem; line-height: 1.42;">
                  Nelle <em>Impostazioni Utente</em> puoi scegliere lo stile visivo preferito:
                </p>
                <div class="d-flex flex-column gap-1.5 mb-1">
                  <div class="guida-callout guida-callout-blue">
                    <div class="callout-title font-weight-bold mb-0.5" style="font-size: 0.72rem;">
                      📄 Stile Classico
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Mostra il suggerimento compatto lineare nel box superiore e il testo fantasma (ghost) all'interno del campo serie.
                    </div>
                  </div>
                  <div class="guida-callout guida-callout-orange">
                    <div class="callout-title font-weight-bold mb-0.5" style="font-size: 0.72rem;">
                      ⚡ Stile Multi-Chip Rapido
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Mostra 3 chip interattivi sotto l'input: <strong>🛡️ Prudenziale (Volume)</strong>, <strong>🎯 Rotta Coach</strong> e <strong>⚡ Sfidante (Picco PR)</strong> per compilare il carico con un solo tocco.
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Ghost Shield (Blocco Ghost in Digitazione) -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="blue-grey-lighten-2">mdi-shield-check-outline</v-icon>
                  <span>Ghost Shield (Blocco Ghost in Digitazione)</span>
                </div>
                <p class="guida-card-body mb-0" style="font-size: 0.71rem; line-height: 1.42;">
                  Mentre digiti all'interno di un campo serie, il sistema <strong>nasconde istantaneamente il testo suggerito</strong> per evitare sovrapposizioni visive e interferenze su tastiere smartphone. Appena completi l'inserimento, i dati si sincronizzano all'istante.
                </p>
              </div>

              <!-- 3. Salti di Carico & Step Attrezzo (Auto & Manubri) -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="green-darken-2">mdi-cog-sync-outline</v-icon>
                  <span>Salti di Carico & Step Attrezzo (Auto)</span>
                </div>
                <p class="guida-card-body mb-2" style="font-size: 0.71rem; line-height: 1.42;">
                  Il motore adatta i salti di kg in base al tipo di esercizio e attrezzo:
                </p>
                <div class="d-flex flex-column gap-1.5">
                  <div class="guida-callout guida-callout-green">
                    <div class="callout-body" style="font-size: 0.70rem; line-height: 1.4;">
                      • <strong>Bilancieri:</strong> step standard da 2,5 kg o 5 kg.<br>
                      • <strong>Manubri (Auto):</strong> step da 1 kg fino a 9 kg e step da <strong>2 kg</strong> per carichi superiori a 9 kg.<br>
                      • <strong>Macchine / Cavi:</strong> step coerenti con la piastra dell'attrezzo.<br>
                      • <strong>Limite Fisiologico:</strong> l'algoritmo blocca incrementi anomali oltre i limiti di forza naturale.
                    </div>
                  </div>
                </div>
              </div>

              <!-- 4. Sintassi Reps con 'r' e Suffissi Tecnici -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-pencil-outline</v-icon>
                  <span>Sintassi Reps con "r", Virgola e Suffissi Tecnici</span>
                </div>
                <div class="guida-card-body">
                  <p class="mb-1.5" style="font-size: 0.71rem; line-height: 1.42;">
                    • <strong>Reps con 'r':</strong> Inserisci il peso seguito dalle reps e la lettera <strong>"r"</strong> (es. <code class="px-1.5 py-0.5 rounded font-weight-bold">50 12r</code> o <code class="px-1.5 py-0.5 rounded font-weight-bold">25 x11r</code>).<br>
                    • <strong>Decimali con virgola:</strong> Usa la virgola italiana (es. <code class="px-1.5 py-0.5 rounded font-weight-bold">62,5</code>).<br>
                    • <strong>Suffissi Tecnici:</strong> Puoi annotare tecniche come Rest-Pause (es. <code class="px-1.5 py-0.5 rounded font-weight-bold">4x13RP++</code>): il sistema estrae correttamente il volume reale per la progressione.
                  </p>
                </div>
              </div>

              <!-- 5. Sezione Cambio Palestra & Parentesi -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-2.5">
                  <v-icon size="17" color="orange-darken-2">mdi-weight-lifter</v-icon>
                  <span>Cambio Palestra & Regola delle Parentesi</span>
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
                      (45 x11r x2s Palestra Ospite)
                    </div>
                  </div>
                </div>

                <!-- Carrucole e Pulegge -->
                <div class="guida-callout guida-callout-blue mb-0">
                  <div class="d-flex align-center gap-1.5 mb-1">
                    <v-icon size="15" color="blue-darken-2">mdi-cog-sync-outline</v-icon>
                    <span class="callout-title" style="font-size: 0.73rem;">Carrucole Dirette (1:1) vs Dimezzate (2:1):</span>
                  </div>
                  <div class="callout-body" style="font-size: 0.71rem; line-height: 1.42;">
                    • <strong>Diretta (1:1):</strong> 25 kg selezionati = 25 kg effettivi.<br>
                    • <strong>Dimezzata (2:1):</strong> Per 25 kg reali imposta <strong>50 kg</strong> (il doppio) sul selettore.
                  </div>
                </div>
              </div>

              <!-- 6. Attitudine alla Progressione (Sensibilità) -->
              <div class="guida-card mb-0">
                <div class="guida-card-title mb-2">
                  <v-icon size="16" color="orange-darken-2">mdi-trending-up</v-icon>
                  <span>Attitudine alla Progressione</span>
                </div>
                <div class="d-flex flex-column gap-1.5">
                  <div class="guida-callout guida-callout-blue">
                    <div class="callout-title mb-0.5" style="font-size: 0.72rem;">
                      🛡️ Prudente (Safe)
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Privilegia l'accumulo di ripetizioni (+1r) e il volume prima di incrementare i kg. Ideale in ipocalorica o per tutela articolare.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-green">
                    <div class="callout-title mb-0.5" style="font-size: 0.72rem;">
                      ⚖️ Bilanciata (Smart - Default)
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Progressione fisiologica intelligente calcolata su 1RM e step attrezzo, con avanzamento armonico.
                    </div>
                  </div>

                  <div class="guida-callout guida-callout-red">
                    <div class="callout-title mb-0.5" style="font-size: 0.72rem;">
                      🔥 Spinta (Sfidante / PR)
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Massimizza il sovraccarico progressivo puntando subito allo step superiore (+Kg) o all'attacco diretto al record storico.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </v-window-item>

          <!-- ══════════════════════════════════════════════════════════════
               TAB 2: ESERCIZI, CARD RECORD, STORICO, DISCHI & TIMER
               ══════════════════════════════════════════════════════════════ -->
          <v-window-item :value="2">
            <div class="pb-2">
              <h4 class="guida-card-title mb-2">
                <v-icon size="17" color="orange-darken-2">mdi-dumbbell</v-icon>
                <span>Strumenti Esercizio, Record & Timer</span>
              </h4>
              <p class="guida-card-body mb-3">
                Panoramica completa degli strumenti avanzati a supporto della tua sessione di allenamento.
              </p>

              <!-- 1. Card Record a 2 Colonne Simmetriche -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-trophy-variant-outline</v-icon>
                  <span>Card Record PR a 2 Colonne Simmetriche</span>
                </div>
                <p class="guida-card-body mb-2" style="font-size: 0.71rem; line-height: 1.42;">
                  Nella vista di dettaglio trovi due card affiancate con layout perfettamente simmetrico:
                </p>
                <div class="d-flex flex-column gap-1.5">
                  <div class="guida-callout guida-callout-amber">
                    <div class="callout-title font-weight-bold mb-0.5" style="font-size: 0.72rem;">
                      👑 Colonna Sinistra: Record Storico Assoluto
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Riporta il miglior carico e e1RM mai registrato nella storia dell'atleta su quell'esercizio, con indicazione di data e scheda di provenienza.
                    </div>
                  </div>
                  <div class="guida-callout guida-callout-blue">
                    <div class="callout-title font-weight-bold mb-0.5" style="font-size: 0.72rem;">
                      🎯 Colonna Destra: Migliore Scheda Attuale
                    </div>
                    <div class="callout-body" style="font-size: 0.69rem; line-height: 1.38;">
                      Mostra la prestazione di picco raggiunta nel mesociclo in corso, indicando la Week e il carico relativo. Per esercizi a corpo libero supporta il formato zavorrato (es. <em>BW+15kg</em>).
                    </div>
                  </div>
                </div>
              </div>

              <!-- 2. Calcolatore Dischi & Bilanciere -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="blue-lighten-2">mdi-calculator-variant-outline</v-icon>
                  <span>Calcolatore Dischi & Bilanciere</span>
                </div>
                <p class="guida-card-body mb-0" style="font-size: 0.71rem; line-height: 1.42;">
                  Toccando l'icona del <strong>disco 💿</strong> nella barra o nel dettaglio apri il <em>Calcolatore Dischi</em>: inserisci il carico target e seleziona il bilanciere (20 kg Olimpico, 15 kg, 12 kg, 10 kg o 0 kg) per ottenere all'istante la scomposizione esatta dei dischi da caricare per lato (20, 15, 10, 5, 2.5, 1.25, 0.5 kg).
                </p>
              </div>

              <!-- 3. Storico Esercizio con Colonna Sticky & Ricerca Gerarchica -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="green-darken-2">mdi-history</v-icon>
                  <span>Storico Esercizio & Ricerca Gerarchica</span>
                </div>
                <p class="guida-card-body mb-0" style="font-size: 0.71rem; line-height: 1.42;">
                  L'icona dell'<strong>orologio 🕒</strong> apre la tabella comparativa di tutte le schede precedenti con colonna sticky per non perdere mai il riferimento della settimana. Include la <strong>ricerca gerarchica</strong> per settore principale (es. Pettorali, Dorsali) e secondario per filtrare rapidamente gli esercizi analoghi.
                </p>
              </div>

              <!-- 4. Timer Flottante Globale & Vibrazione -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-timer-outline</v-icon>
                  <span>Timer di Recupero Flottante Persistente</span>
                </div>
                <p class="guida-card-body mb-0" style="font-size: 0.71rem; line-height: 1.42;">
                  Toccando il chip del tempo (es. <code class="px-1.5 py-0.5 rounded font-weight-bold">1'30"-2'00"</code>) si attiva il <strong>timer globale floating</strong> che rimane visibile e attivo anche cambiando pagina. Dispone di controlli di pausa, ripresa, stop anticipato, segnale acustico e vibrazione tattile.
                </p>
              </div>

              <!-- 5. Navigazione Touch & Swipe -->
              <div class="guida-card mb-3">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="purple-lighten-2">mdi-gesture-swipe-horizontal</v-icon>
                  <span>Navigazione Touch & Swipe Fluido</span>
                </div>
                <p class="guida-card-body mb-0" style="font-size: 0.71rem; line-height: 1.42;">
                  Nella schermata di dettaglio puoi passare da un esercizio all'altro con un semplice <strong>swipe orizzontale</strong> a destra o sinistra, con transizioni fluide che includono anche eventuali esercizi da recuperare.
                </p>
              </div>

              <!-- 6. Controlli Rapidi Esercizio -->
              <h4 class="guida-card-title mb-2 mt-4">
                <v-icon size="17" color="orange-darken-2">mdi-tune-vertical</v-icon>
                <span>Pulsanti e Indicatori Rapidi</span>
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
                      Valuta l'esercizio con le stelle per comunicare al Coach le tue preferenze biomeccaniche.
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
                      Esercizi in cui il Coach richiede il video per verificare la corretta esecuzione tecnica.
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
                      Tocca il badge per contrassegnare rapidamente serie non completate da recuperare a fine seduta.
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
                  <span>Segnalazione Fastidio / Dolore (Scala VAS)</span>
                </div>
                <p class="guida-card-body mb-0">
                  Accedi alla sezione <strong>Infortuni</strong> dalla barra inferiore per monitorare la zona anatomica interessata e informare il Coach con la scala numerica del dolore da 1 a 10.
                </p>
              </div>

              <div class="guida-card mb-3">
                <div class="guida-card-title title-blue mb-1">
                  <v-icon size="16" color="blue-darken-2">mdi-swap-horizontal-bold</v-icon>
                  <span>Sostituzione Esercizio in Sicurezza</span>
                </div>
                <p class="guida-card-body mb-0">
                  Alternative intelligenti all'interno dello stesso pattern motorio per mantenere lo stimolo muscolare preservando l'articolazione dolente o aggirando un attrezzo occupato.
                </p>
              </div>

              <div class="guida-card">
                <div class="guida-card-title title-amber mb-1">
                  <v-icon size="16" color="amber-darken-2">mdi-email-fast-outline</v-icon>
                  <span>Notifica Diretta al Coach</span>
                </div>
                <p class="guida-card-body mb-0">
                  Invia una comunicazione tempestiva al Coach per ricevere l'adeguamento della scheda e consigli di riabilitazione personalizzati.
                </p>
              </div>
            </div>
          </v-window-item>

          <!-- ══════════════════════════════════════════════════════════════
               TAB 4: PERSONALIZZAZIONE UX, LAYOUT & TEMI
               ══════════════════════════════════════════════════════════════ -->
          <v-window-item :value="4">
            <div class="pb-2">
              <h4 class="guida-card-title mb-2">
                <v-icon size="17" color="orange-darken-2">mdi-palette-outline</v-icon>
                <span>Temi, Colori Accento & Layout</span>
              </h4>
              <p class="guida-card-body mb-3">
                Personalizza l'esperienza visiva per renderla ideale in palestra o sotto la luce del sole.
              </p>

              <!-- Modalità Tema Scuro / Chiaro -->
              <div class="d-flex flex-column gap-2.5 mb-3">
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

              <!-- 5 Colori Accento & Layout -->
              <div class="guida-card mb-0">
                <div class="guida-card-title mb-1.5">
                  <v-icon size="16" color="orange-darken-2">mdi-tune</v-icon>
                  <span>Colori Accento, Layout & Recuperi</span>
                </div>
                <div class="guida-card-body" style="font-size: 0.70rem; line-height: 1.42;">
                  Nelle <strong>Impostazioni Utente</strong> puoi personalizzare:<br>
                  • <strong>5 Colori Accento:</strong> Arancio 🍊, Blu 🔷, Verde 🟢, Fucsia 🌸, Giallo 🟡.<br>
                  • <strong>Layout Scheda:</strong> <em>Super Compatto</em>, <em>Compatto</em> o <em>Standard</em> per massimizzare le informazioni a schermo.<br>
                  • <strong>Posizione Esercizi da Recuperare:</strong> <em>🧠 Strategica</em> (nel gruppo target), <em>🔝 Inizio</em> o <em>🔚 Fine</em> seduta.
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
  { label: 'Strategia & 6W', icon: 'mdi-brain' },
  { label: 'Progressione', icon: 'mdi-trending-up' },
  { label: 'Esercizi & Tool', icon: 'mdi-dumbbell' },
  { label: 'Infortuni', icon: 'mdi-bandage' },
  { label: 'Temi & Layout', icon: 'mdi-palette-outline' }
];

// Simulatore 1RM
const simPeso = ref(80);
const simReps = ref(8);
const calcolaE1RM = computed(() => {
  if (!simPeso.value || !simReps.value) return 0;
  return Math.round(simPeso.value * (1 + 0.0333 * simReps.value));
});

// Switch Tab dinamico in base alla ricerca istantanea
watch(cercaTesto, (val) => {
  if (!val) return;
  const v = val.toLowerCase().trim();
  if (v.includes('e1rm') || v.includes('massimale') || v.includes('settiman') || v.includes('meso') || v.includes('stella') || v.includes('pr') || v.includes('rotta') || v.includes('re-anchoring') || v.includes('scarico') || v.includes('peak')) {
    activeTab.value = 0;
  } else if (v.includes('r') || v.includes('reps') || v.includes('parentes') || v.includes('trasfert') || v.includes('carrucol') || v.includes('rpe') || v.includes('not') || v.includes('propost') || v.includes('ghost') || v.includes('shield') || v.includes('digitazion') || v.includes('step') || v.includes('manubr') || v.includes('multichip') || v.includes('chip') || v.includes('salti')) {
    activeTab.value = 1;
  } else if (v.includes('timer') || v.includes('recuper') || v.includes('video') || v.includes('gradiment') || v.includes('control') || v.includes('precedent') || v.includes('disch') || v.includes('bilancier') || v.includes('calcolator') || v.includes('storic') || v.includes('card') || v.includes('swipe') || v.includes('corpo libero') || v.includes('bw') || v.includes('gerarchic')) {
    activeTab.value = 2;
  } else if (v.includes('infortun') || v.includes('dolor') || v.includes('sostituz') || v.includes('fastidi') || v.includes('vas') || v.includes('articol')) {
    activeTab.value = 3;
  } else if (v.includes('tem') || v.includes('stil') || v.includes('color') || v.includes('chiar') || v.includes('scur') || v.includes('oled') || v.includes('layout') || v.includes('compatt') || v.includes('accent')) {
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
