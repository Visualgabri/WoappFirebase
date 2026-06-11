<template>
  <v-app>
    <!-- BARRA SUPERIORE PREMIUM (Mostrata solo se l'utente è autenticato) -->
    <v-app-bar
      v-if="utente"
      flat
      color="#0f172a"
      class="border-bottom px-4"
      density="compact"
      style="background-color: #0f172a !important; opacity: 1 !important; z-index: 1000 !important;"
    >
      <v-app-bar-title class="text-slate-dark" style="line-height: 1.15;">
        <div class="d-flex flex-column text-left">
          <div class="font-weight-black d-flex align-center" style="font-size: 1.05rem !important; line-height: 1.1;">
            <v-icon color="orange-darken-3" class="mr-1.5" size="18">mdi-dumbbell</v-icon>
            FlexCoach<span class="orange-dot">.</span>
          </div>
          <div class="text-super-caption text-muted font-weight-medium" style="font-size: 0.62rem !important; margin-left: 24px; margin-top: 1px;">
            {{ activeAthleteName }} • {{ activeSheetNumber }}
          </div>
        </div>
      </v-app-bar-title>

      <v-spacer></v-spacer>

      <!-- Profilo utente e Logout -->
      <div class="d-none d-sm-flex flex-column align-end mr-4">
        <span class="text-caption font-weight-bold text-slate-dark">{{ utente.email }}</span>
        <span class="text-caption text-orange-darken-4 font-weight-bold">
          {{ ruolo === 'coach' ? 'Coach 📋' : 'Atleta #' + idCliente }}
        </span>
      </div>

      <v-btn
        icon
        color="red-darken-2"
        variant="flat"
        class="rounded-lg text-white btn-logout-compact"
        @click="eseguiLogout"
        id="btn-logout"
      >
        <v-icon size="16">mdi-logout</v-icon>
      </v-btn>
    </v-app-bar>
    
    <!-- L'AREA CENTRALE: Qui appariranno le pagine del Router -->
    <v-main style="background-color: transparent; padding-bottom: 80px;">
      <router-view v-slot="{ Component }">
        <transition :name="globalTransition" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <!-- LA BARRA INFERIORE DI NAVIGAZIONE (Mostrata solo se l'utente è autenticato) -->
    <v-bottom-navigation
      v-if="utente"
      grow
      color="orange-darken-3"
      fixed
      elevation="4"
      class="premium-nav"
    >
      <v-btn to="/login" id="nav-atleta" @click="vibraTattile(8)">
        <v-icon>mdi-account</v-icon>
        <span>Atleta</span>
      </v-btn>

      <v-btn to="/ricerca" id="nav-ricerca" @click="vibraTattile(8)">
        <v-icon>mdi-magnify</v-icon>
        <span>Ricerca Wo</span>
      </v-btn>

      <v-btn to="/home" id="nav-home" @click="vibraTattile(8)">
        <v-icon>mdi-home</v-icon>
        <span>Home Wo</span>
      </v-btn>

      <v-btn to="/" id="nav-workouts" @click="vibraTattile(8)">
        <v-icon>mdi-dumbbell</v-icon>
        <span>WORKOUTS</span>
      </v-btn>

      <v-btn to="/grafici" id="nav-grafici" @click="vibraTattile(8)">
        <v-icon>mdi-chart-bar</v-icon>
        <span>Grafici</span>
      </v-btn>

    </v-bottom-navigation>

    <!-- WIDGET TIMER DI RECUPERO GLOBALE FLOATING (Premium UX) -->
    <v-fade-transition>
      <v-card
        v-if="activeTimer"
        class="global-timer-pill card-glass rounded-xl pa-3 d-flex align-center justify-space-between elevation-4"
      >
        <div class="d-flex align-center min-width-0 flex-grow-1 mr-3">
          <!-- Circular Progress Circle -->
          <v-progress-circular
            :model-value="(activeTimer.remainingSeconds / activeTimer.totalSeconds) * 100"
            color="orange-darken-3"
            size="36"
            width="3.5"
            class="mr-3"
          >
            <span class="text-caption font-weight-black text-slate-dark" style="font-size: 0.65rem;">
              {{ activeTimer.remainingSeconds }}s
            </span>
          </v-progress-circular>

          <div class="text-left min-width-0">
            <div class="text-super-caption text-orange-lighten-2 uppercase font-weight-black" style="font-size: 0.6rem;">
              Recupero Attivo
            </div>
            <div class="text-caption font-weight-bold text-slate-dark text-truncate" style="max-width: 160px;">
              {{ activeTimer.label }}
            </div>
          </div>
        </div>

        <div class="d-flex align-center">
          <!-- Play / Pause Button -->
          <v-btn
            icon
            variant="text"
            color="orange-lighten-1"
            size="small"
            class="mr-1"
            @click="activeTimer.isPaused ? riprendiTimer() : mettiInPausaTimer()"
          >
            <v-icon size="20">
              {{ activeTimer.isPaused ? 'mdi-play-circle-outline' : 'mdi-pause-circle-outline' }}
            </v-icon>
          </v-btn>

          <!-- Stop / Close Button -->
          <v-btn
            icon
            variant="text"
            color="red-lighten-2"
            size="small"
            @click="cancellaTimer()"
          >
            <v-icon size="20">mdi-stop-circle-outline</v-icon>
          </v-btn>
        </div>
      </v-card>
    </v-fade-transition>

    <!-- Pulsante Fluttuante Persistente Play (Fisso sopra la barra di navigazione) -->
    <v-fade-transition>
      <v-btn
        v-if="utente && (globalHaEserciziDaFare || globalSettimanaDaChiudere)"
        color="orange-darken-3"
        icon
        size="large"
        class="fixed-play-fab elevation-6 animate-pulse-slow"
        :style="{ bottom: activeTimer ? '160px' : '80px' }"
        @click="cliccaPlayGlobale"
        id="fab-play-da-fare"
      >
        <v-icon size="32" color="white">mdi-play</v-icon>
      </v-btn>
    </v-fade-transition>

    <!-- Dialog Avviso Chiusura Settimana -->
    <v-dialog v-model="mostraDialogAvvisoChiusura" max-width="400" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border text-left" style="background: rgba(15, 23, 42, 0.9) !important; border-color: rgba(255, 255, 255, 0.1) !important; backdrop-filter: blur(20px) !important;">
        <v-card-title class="font-weight-black text-orange-darken-3 d-flex align-center px-0">
          <v-icon color="orange-darken-3" class="mr-2">mdi-alert-circle-outline</v-icon>
          Allenamento Completato! ⚡
        </v-card-title>
        <v-card-text class="px-0 py-4 text-body-2" style="color: #cbd5e1 !important; line-height: 1.5;">
          Ottimo lavoro! Hai completato tutti gli esercizi dell'allenamento di oggi. 
          Ora devi <strong>chiudere la settimana</strong> per registrare i tuoi progressi.
        </v-card-text>
        <v-card-actions class="px-0 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="confermaVaiAlWorkout" class="text-white font-weight-bold">
            Vai a Chiudere la Settimana
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Dialog Calcolatore Dischi (Plate Calculator) -->
    <v-dialog v-model="mostraDialogCalcolatoreDischi" max-width="450" rounded="xl">
      <v-card class="pa-5 rounded-2xl card-glass border text-left" style="background: rgba(15, 23, 42, 0.95) !important; border-color: rgba(255, 255, 255, 0.15) !important; backdrop-filter: blur(25px) !important;">
        <v-card-title class="font-weight-black text-orange-darken-3 d-flex align-center justify-space-between px-0 mb-1">
          <div class="d-flex align-center">
            <v-icon color="orange-darken-3" class="mr-2.5" size="26">mdi-weight-lifter</v-icon>
            Calcolatore Dischi 🏋️
          </div>
          <v-btn icon size="small" variant="text" color="slate-dark" @click="mostraDialogCalcolatoreDischi = false">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-card-title>

        <!-- Nome dell'esercizio corrente nel calcolatore -->
        <div v-if="nomeEsercizioCalcolatore" class="text-caption font-weight-bold text-orange-lighten-3 mb-3 text-left px-0" style="line-height: 1.2;">
          {{ nomeEsercizioCalcolatore }}
        </div>

        <v-card-text class="px-0 py-2">
          <!-- Input/Visualizzazione Pesi -->
          <div class="d-flex align-center gap-3 mb-4">
            <div class="flex-grow-1 text-center pa-2.5 rounded-xl card-glass border-soft bg-slate-900-op" style="background: rgba(15, 23, 42, 0.4) !important;">
              <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" style="font-size: 0.58rem;">Peso Totale Target</span>
              <span class="text-h6 font-weight-black text-white">
                {{ targetPesoTotale }} <span class="text-caption text-muted">KG</span>
              </span>
            </div>
            <div v-if="!nascondiLato" class="flex-grow-1 text-center pa-2.5 rounded-xl card-glass border-soft bg-slate-900-op" style="background: rgba(15, 23, 42, 0.4) !important;">
              <span class="text-super-caption text-muted uppercase font-weight-black d-block mb-1" style="font-size: 0.58rem;">Peso Per Lato</span>
              <span class="text-h6 font-weight-black text-blue-lighten-2">
                {{ targetPesoLato }} <span class="text-caption text-muted">KG</span>
              </span>
            </div>
          </div>

          <!-- Selettore del Bilanciere -->
          <div class="mb-4">
            <span class="text-caption font-weight-black text-slate-dark d-block mb-2" style="font-size: 0.75rem;">Tipo Bilanciere / Attrezzo:</span>
            <v-select
              v-model="selectedBilanciereId"
              :items="opzioniBilanciere"
              item-title="label"
              item-value="id"
              variant="outlined"
              density="comfortable"
              rounded="lg"
              color="orange-darken-3"
              bg-color="rgba(15, 23, 42, 0.4)"
              hide-details
            ></v-select>
          </div>

          <!-- Configurazione Caricamento (Due lati o Lato singolo) -->
          <div class="mb-4">
            <span class="text-caption font-weight-black text-slate-dark d-block mb-2" style="font-size: 0.75rem;">Configurazione Caricamento:</span>
            <v-btn-toggle
              v-model="caricoMonolaterale"
              mandatory
              color="orange-darken-3"
              variant="outlined"
              class="w-100 premium-toggle-group rounded-lg"
              selected-class="bg-orange-darken-3 text-white"
              style="height: 38px; display: flex;"
            >
              <v-btn value="doppio" class="flex-grow-1 text-caption font-weight-bold py-1" style="height: 38px;">
                <v-icon size="16" class="mr-1">mdi-arrow-split-vertical</v-icon>
                Due Lati (x2)
              </v-btn>
              <v-btn value="singolo" class="flex-grow-1 text-caption font-weight-bold py-1" style="height: 38px;">
                <v-icon size="16" class="mr-1">mdi-arrow-right</v-icon>
                Singolo / Cintura
              </v-btn>
            </v-btn-toggle>
          </div>

          <!-- Risultato Dischi -->
          <div class="pa-4 rounded-xl border border-orange-darken-3-op bg-slate-900-op text-center" style="background: rgba(15, 23, 42, 0.5) !important;">
            <span class="text-super-caption text-orange-lighten-2 font-weight-black uppercase d-block mb-3" style="font-size: 0.65rem; letter-spacing: 0.05em;">
              {{ caricoMonolaterale === 'singolo' ? 'Dischi da inserire (Carico Singolo / Cintura):' : 'Dischi da inserire su CIASCUN LATO:' }}
            </span>

            <div v-if="pesoDischiDaCalcolare < 0" class="text-caption font-weight-black text-red-lighten-2 py-3">
              ⚠️ Il peso totale è inferiore al peso del bilanciere!
            </div>
            <div v-else-if="elencoDischiPerLato.length === 0" class="text-caption font-weight-black text-slate py-4" style="color: #94a3b8 !important;">
              Nessun disco necessario (carico a corpo libero o solo bilanciere).
            </div>
            <div v-else class="d-flex flex-column gap-2.5">
              <!-- Visualizzazione Grafica delle Piastre stacked -->
              <div class="d-flex align-center justify-center gap-1.5 py-3 border-bottom-soft mb-2 overflow-x-auto min-height-50" style="min-height: 85px;">
                <!-- Sleeve line -->
                <div class="barbell-sleeve-line"></div>
                <div
                  v-for="disco in elencoDischiGrafica"
                  :key="disco.id"
                  class="plate-graphic-item font-weight-black d-flex align-center justify-center"
                  :class="'plate-' + String(disco.size).replace('.', '_')"
                  :title="disco.size + ' kg'"
                >
                  {{ disco.size }}
                </div>
              </div>

              <!-- Elenco Testuale dei dischi -->
              <div
                v-for="item in elencoDischiPerLato"
                :key="item.size"
                class="d-flex align-center justify-space-between py-1.5 px-3 rounded-lg"
                style="background: rgba(15, 23, 42, 0.4) !important;"
              >
                <div class="d-flex align-center">
                  <div class="plate-color-indicator mr-2.5" :class="'plate-bg-' + String(item.size).replace('.', '_')"></div>
                  <span class="font-weight-black text-white" style="font-size: 0.95rem;">
                    Disco da {{ item.size }} kg
                  </span>
                </div>
                <span class="text-h6 font-weight-black text-orange-lighten-1">
                  x {{ item.count }}
                </span>
              </div>
            </div>

            <!-- Rimanenza se presente -->
            <div v-if="rimanenzaDischi > 0" class="text-super-caption text-amber-lighten-2 mt-3 text-left" style="font-size: 0.65rem; line-height: 1.3; color: #fbbf24 !important;">
              ⚠️ Nota: Rimangono <strong>{{ rimanenzaDischi }} kg</strong> non configurabili con i tagli disponibili (minimo 1.25 kg per lato).
            </div>
          </div>
        </v-card-text>

        <v-card-actions class="px-0 pt-4 pb-0">
          <v-btn color="orange-darken-3" block variant="flat" rounded="lg" @click="mostraDialogCalcolatoreDischi = false" class="text-white font-weight-bold">
            Chiudi
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

  </v-app>
</template>

<script setup>
import { onMounted, computed, ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { utente, idCliente, ruolo, logout, activeTimer, pauseGlobalTimer, resumeGlobalTimer, stopGlobalTimer, selectedAthlete, selectedSheet, getNomeAtleta, globalHaEserciziDaFare, globalSettimanaDaChiudere, triggerPlayClick, mostraDialogCalcolatoreDischi, targetPesoTotale, targetPesoLato, modalitaCalcolo, tipoBilanciere, nascondiLato, caricoMonolaterale, nomeEsercizioCalcolatore } from './authStore.js';

const router = useRouter();
const globalTransition = ref('fade');

// Gestione intelligente delle transizioni globali in base alla direzione
router.beforeEach((to, from) => {
  if (from.name === 'Workouts' && (to.name === 'DettaglioSessione' || to.name === 'DettaglioWorkout')) {
    globalTransition.value = 'fade'; // 1. Entra nel dettaglio (Morbido/Fade)
  } else if (from.name === 'DettaglioSessione' && to.name === 'DettaglioWorkout') {
    globalTransition.value = 'swipe-next'; // 2. Da Intestazione Giorno a Esercizio 1 (Avanza a sinistra)
  } else if (from.name === 'DettaglioWorkout' && to.name === 'DettaglioSessione') {
    globalTransition.value = 'swipe-prev'; // 3. Da Esercizio 1 torna a Intestazione Giorno (Indietro a destra)
  } else {
    globalTransition.value = 'fade'; // 4. Ritorno alla lista generale o altre pagine (Morbido/Fade)
  }
});

const activeAthleteName = computed(() => {
  return getNomeAtleta(selectedAthlete.value) || 'Ospite';
});

const activeSheetNumber = computed(() => {
  return selectedSheet.value || '-';
});

onMounted(() => {
  // Gestione del tasto indietro fisico di Android per PWA Standalone
  window.addEventListener('popstate', (event) => {
    const routeName = router.currentRoute.value.name;
    if (routeName === 'DettaglioWorkout' || routeName === 'DettaglioSessione') {
      // Se non c'è una rotta precedente nella cronologia della PWA,
      // evitiamo che il browser esca e chiuda l'app, reindirizzandolo alla lista dei Workouts.
      if (!window.history.state || !window.history.state.back) {
        router.push('/');
      }
    }
  });

  // Richiesta permessi di notifica per timer in background
  if (window.Notification && Notification.permission === 'default') {
    Notification.requestPermission();
  }
});

// Micro-vibrazione tattile per smartphone (Haptic feedback)
const vibraTattile = (ms = 8) => {
  if (navigator.vibrate) {
    navigator.vibrate(ms);
  }
};

const mettiInPausaTimer = () => {
  vibraTattile(10);
  pauseGlobalTimer();
};

const riprendiTimer = () => {
  vibraTattile(15);
  resumeGlobalTimer();
};

const cancellaTimer = () => {
  vibraTattile(20);
  stopGlobalTimer();
};

const eseguiLogout = async () => {
  try {
    vibraTattile(12);
    await logout();
    router.push({ name: 'Login' });
  } catch (error) {
    console.error("Errore durante il logout:", error);
  }
};

const mostraDialogAvvisoChiusura = ref(false);

const cliccaPlayGlobale = () => {
  vibraTattile(12);
  if (globalSettimanaDaChiudere.value && !globalHaEserciziDaFare.value) {
    mostraDialogAvvisoChiusura.value = true;
  } else {
    eseguiAzionePlay();
  }
};

const confermaVaiAlWorkout = () => {
  mostraDialogAvvisoChiusura.value = false;
  eseguiAzionePlay();
};

const eseguiAzionePlay = () => {
  if (router.currentRoute.value.name === 'Workouts') {
    triggerPlayClick();
  } else {
    localStorage.setItem('scrollPrimoEsercizioDaFare', 'true');
    router.push('/');
  }
};

// Calcolatore Dischi
const opzioniBilanciere = [
  { id: 'olimpico-20', label: 'Bilanciere Olimpico Standard (20 kg)', peso: 20 },
  { id: 'olimpico-15', label: 'Bilanciere Olimpico Donna/Junior (15 kg)', peso: 15 },
  { id: 'standard-12', label: 'Bilanciere EZ o Standard (12 kg)', peso: 12 },
  { id: 'standard-10', label: 'Bilanciere Standard Leggero (10 kg)', peso: 10 },
  { id: 'standard-8',  label: 'Bilanciere Super Leggero (8 kg)', peso: 8 },
  { id: 'carrucola-0',  label: 'Manubrio / Macchina a Carrucola (0 kg)', peso: 0 },
  { id: 'senza-0',     label: 'Senza Bilanciere (0 kg)', peso: 0 }
];

const ultimoIdSelezionatoPesoZero = ref(localStorage.getItem('ultimoIdSelezionatoPesoZero') || 'senza-0');

const selectedBilanciereId = computed({
  get() {
    const peso = tipoBilanciere.value;
    if (peso === 0) {
      return ultimoIdSelezionatoPesoZero.value;
    }
    const trovato = opzioniBilanciere.find(o => o.peso === peso);
    return trovato ? trovato.id : 'olimpico-20';
  },
  set(id) {
    const trovato = opzioniBilanciere.find(o => o.id === id);
    if (trovato) {
      if (trovato.peso === 0) {
        ultimoIdSelezionatoPesoZero.value = id;
        localStorage.setItem('ultimoIdSelezionatoPesoZero', id);
      }
      tipoBilanciere.value = trovato.peso;
    }
  }
});

watch([tipoBilanciere, caricoMonolaterale], () => {
  const isMono = caricoMonolaterale.value === 'singolo';
  const divider = isMono ? 1 : 2;
  const multiplier = isMono ? 1 : 2;
  const newBar = tipoBilanciere.value;

  if (modalitaCalcolo.value === 'totale') {
    const tot = targetPesoTotale.value;
    const latoCalc = (tot - newBar) / divider;
    targetPesoLato.value = latoCalc > 0 ? latoCalc : 0;
  } else {
    const lat = targetPesoLato.value;
    targetPesoTotale.value = lat * multiplier + newBar;
  }
});

const pesoDischiDaCalcolare = computed(() => {
  return targetPesoLato.value;
});

const elencoDischiPerLato = computed(() => {
  let remaining = targetPesoLato.value;
  if (remaining <= 0) return [];
  
  const plates = [20, 10, 5, 2.5, 1.25];
  const result = [];
  
  for (const p of plates) {
    const count = Math.floor(remaining / p);
    if (count > 0) {
      result.push({ size: p, count });
      remaining = parseFloat((remaining - (count * p)).toFixed(2));
    }
  }
  return result;
});

const rimanenzaDischi = computed(() => {
  let remaining = targetPesoLato.value;
  if (remaining <= 0) return 0;
  
  const plates = [20, 10, 5, 2.5, 1.25];
  for (const p of plates) {
    const count = Math.floor(remaining / p);
    remaining = parseFloat((remaining - (count * p)).toFixed(2));
  }
  return remaining;
});

const elencoDischiGrafica = computed(() => {
  const result = [];
  let idCounter = 0;
  for (const item of elencoDischiPerLato.value) {
    for (let i = 0; i < item.count; i++) {
      result.push({ id: idCounter++, size: item.size });
    }
  }
  return result.sort((a, b) => b.size - a.size);
});
</script>

<style scoped>
.text-slate-dark {
  color: #f8fafc !important;
}

.orange-dot {
  color: #f97316;
}

.border-bottom {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08) !important;
}

.btn-logout-compact {
  width: 32px !important;
  height: 32px !important;
  min-width: 32px !important;
  padding: 0 !important;
}

.premium-nav {
  background: #0f172a !important;
  border-top: 1px solid rgba(255, 255, 255, 0.08) !important;
}

/* Transizioni fluide sui pulsanti della barra inferiore */
.v-bottom-navigation .v-btn {
  transition: transform 0.2s ease;
}

.v-bottom-navigation .v-btn--active {
  transform: translateY(-2px);
}

/* Timer Pill Floating Premium */
.global-timer-pill {
  position: fixed;
  bottom: 86px;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 24px);
  max-width: 400px;
  z-index: 999;
  border: 1px solid rgba(249, 115, 22, 0.3) !important;
  background: rgba(15, 23, 42, 0.8) !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4), 0 0 15px rgba(249, 115, 22, 0.15) !important;
  animation: pulse-border 2s infinite alternate;
}

@keyframes pulse-border {
  0% {
    border-color: rgba(249, 115, 22, 0.2) !important;
  }
  100% {
    border-color: rgba(249, 115, 22, 0.5) !important;
  }
}

.fixed-play-fab {
  position: fixed !important;
  right: 20px !important;
  z-index: 998 !important;
  width: 56px !important;
  height: 56px !important;
  box-shadow: 0 4px 15px rgba(249, 115, 22, 0.4) !important;
  transition: bottom 0.3s cubic-bezier(0.4, 0, 0.2, 1), transform 0.2s ease !important;
}

.fixed-play-fab:active {
  transform: scale(0.92) !important;
}

/* Stili per Calcolatore Dischi */
.barbell-sleeve-line {
  height: 6px;
  background: #64748b;
  width: 25px;
  border-radius: 3px;
  margin-right: -4px;
}

.plate-graphic-item {
  border-radius: 3px;
  color: white;
  font-size: 0.65rem;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.4);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  border: 1px solid rgba(255, 255, 255, 0.15);
  flex-shrink: 0;
  transition: transform 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.plate-graphic-item:hover {
  transform: scale(1.08);
}

/* Dimensioni e colori delle piastre */
.plate-20 {
  width: 14px;
  height: 72px;
  background: linear-gradient(180deg, #1d4ed8, #1e3a8a) !important; /* Blue */
}
.plate-10 {
  width: 13px;
  height: 60px;
  background: linear-gradient(180deg, #15803d, #14532d) !important; /* Green */
}
.plate-5 {
  width: 12px;
  height: 48px;
  background: linear-gradient(180deg, #d1d5db, #4b5563) !important; /* White/Grey */
  color: #111827 !important;
  text-shadow: none !important;
}
.plate-2_5 {
  width: 11px;
  height: 38px;
  background: linear-gradient(180deg, #374151, #111827) !important; /* Black */
}
.plate-1_25 {
  width: 10px;
  height: 30px;
  background: linear-gradient(180deg, #9ca3af, #6b7280) !important; /* Chrome */
}

/* Indicatori di colore nel testo */
.plate-color-indicator {
  width: 12px;
  height: 12px;
  border-radius: 3px;
  border: 1px solid rgba(255, 255, 255, 0.2);
}
.plate-bg-20 { background: #1d4ed8; }
.plate-bg-10 { background: #15803d; }
.plate-bg-5 { background: #d1d5db; }
.plate-bg-2_5 { background: #374151; }
.plate-bg-1_25 { background: #9ca3af; }

/* Stile Premium Selettori Caricamento Singolo/Doppio */
.premium-toggle-group {
  background: rgba(15, 23, 42, 0.5) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
}
.premium-toggle-group .v-btn {
  border: none !important;
  color: #94a3b8 !important;
  text-transform: none !important;
}
.premium-toggle-group .v-btn--selected {
  background: #f97316 !important;
  color: white !important;
  box-shadow: 0 2px 8px rgba(249, 115, 22, 0.4) !important;
}
</style>

<style>
/* TRANSIZIONI SWIPE PREMIUM (Effetto App Nativa) */

/* Swipe verso il PROSSIMO (Entra da destra, esce a sinistra) */
.swipe-next-enter-active, .swipe-next-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.swipe-next-enter-from {
  opacity: 0;
  transform: translateX(100px);
}
.swipe-next-leave-to {
  opacity: 0;
  transform: translateX(-100px);
}

/* Swipe verso il PRECEDENTE (Entra da sinistra, esce a destra) */
.swipe-prev-enter-active, .swipe-prev-leave-active {
  transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}
.swipe-prev-enter-from {
  opacity: 0;
  transform: translateX(-100px);
}
.swipe-prev-leave-to {
  opacity: 0;
  transform: translateX(100px);
}

/* Rende la transizione fluida evitando salti di altezza */
.exercise-detail-area, .session-detail-area {
  width: 100%;
  will-change: transform, opacity;
}

/* Rimuove il flash bianco durante il cambio componente */
.v-main {
  background-color: #030712 !important;
}

/* Transizione morbida (Fade) per i cambi pagina standard (es. da Home a Grafici) */
.fade-enter-active, .fade-leave-active {
  transition: opacity 0.20s ease;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}
</style>