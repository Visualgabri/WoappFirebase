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
        v-if="utente && globalHaEserciziDaFare"
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

  </v-app>
</template>

<script setup>
import { onMounted, computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { utente, idCliente, ruolo, logout, activeTimer, pauseGlobalTimer, resumeGlobalTimer, stopGlobalTimer, selectedAthlete, selectedSheet, getNomeAtleta, globalHaEserciziDaFare, triggerPlayClick } from './authStore.js';

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

const cliccaPlayGlobale = () => {
  vibraTattile(12);
  if (router.currentRoute.value.name === 'Workouts') {
    triggerPlayClick();
  } else {
    localStorage.setItem('scrollPrimoEsercizioDaFare', 'true');
    router.push('/');
  }
};
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